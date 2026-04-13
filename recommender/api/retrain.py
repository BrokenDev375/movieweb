"""
api/retrain.py
==============
Retraining pipeline: merge ML-100K baseline data with live MySQL ratings,
then train a brand-new HybridRecommender and save it.

Flow:
  1. Load ML-100K ratings + genre vectors (baseline data)
  2. Query MySQL for app ratings + movies + genres (same ID space as ML-100K)
  3. Build unified ID mappings via set union (no offset needed)
  4. Build genre vectors for any movies from movie_genres table
  5. Merge all ratings into one training set (duplicates possible — both sources)
  6. Create new HybridRecommender with correct dimensions
  7. Train from scratch (data is small — takes ~1-3 minutes)
  8. Save new model to hybrid_model.pt (backup old version first)

Design decisions:
  - Train from scratch each time (not incremental) because:
    * Embedding dimensions change when new users/movies appear
    * Full retraining on small data (~100K-200K ratings) is fast
    * Produces optimal weights for current data distribution
  - ML-100K data is always included to maintain baseline quality
  - Old model is backed up before overwrite for safety
"""

import csv
import hashlib
import json
import logging
import os
import shutil
import sys
import time
from collections import defaultdict
from pathlib import Path

import numpy as np

logger = logging.getLogger(__name__)

# Resolve project root so we can import from src/
_PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))


def _load_ml100k_ratings(data_dir: str):
    """Load original ML-100K ratings from u.data file."""
    ratings_file = os.path.join(data_dir, "u.data")
    raw = []
    with open(ratings_file, encoding="latin-1") as f:
        for row in csv.reader(f, delimiter="\t"):
            # ML-100K user IDs: 1-943, movie IDs: 1-1682
            raw.append((int(row[0]), int(row[1]), float(row[2])))
    logger.info("ML-100K: loaded %d ratings", len(raw))
    return raw


def _load_ml100k_genres(data_dir: str, movie_ids: set):
    """Load genre vectors from ML-100K u.item file."""
    movies_file = os.path.join(data_dir, "u.item")
    genres_file = os.path.join(data_dir, "u.genre")

    genre_names = []
    if os.path.exists(genres_file):
        with open(genres_file, encoding="latin-1") as f:
            for row in csv.reader(f, delimiter="|"):
                if row:
                    genre_names.append(row[0])
    else:
        genre_names = [
            "unknown", "Action", "Adventure", "Animation", "Children's",
            "Comedy", "Crime", "Documentary", "Drama", "Fantasy",
            "Film-Noir", "Horror", "Musical", "Mystery", "Romance",
            "Sci-Fi", "Thriller", "War", "Western",
        ]

    n_genres = len(genre_names)
    genre_vectors = {}
    with open(movies_file, encoding="latin-1") as f:
        for row in csv.reader(f, delimiter="|"):
            mid = int(row[0])
            if mid in movie_ids:
                genre_vectors[mid] = np.array(
                    [int(row[5 + i]) for i in range(n_genres)], dtype=np.float32
                )
    return genre_vectors, n_genres, genre_names


def _load_mysql_data(db_config: dict):
    """
    Query MySQL for app ratings, movies (with genre mappings), and users.
    
    Returns:
        app_ratings: list of (user_id, movie_id, score)
        app_genre_map: dict {movie_id: set of genre_name}
        app_user_ids: set of user IDs from app
        app_movie_ids: set of movie IDs from app
    """
    import mysql.connector

    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    # Get ratings
    cursor.execute("SELECT user_id, movie_id, score FROM ratings")
    app_ratings = [(int(r[0]), int(r[1]), float(r[2])) for r in cursor.fetchall()]
    logger.info("MySQL: loaded %d app ratings", len(app_ratings))

    # Get genre names by ID
    cursor.execute("SELECT id, name FROM genres")
    genre_id_to_name = {int(r[0]): r[1] for r in cursor.fetchall()}

    # Get movie-genre mappings
    cursor.execute("SELECT movie_id, genre_id FROM movie_genres")
    app_genre_map = defaultdict(set)
    for movie_id, genre_id in cursor.fetchall():
        name = genre_id_to_name.get(int(genre_id))
        if name:
            app_genre_map[int(movie_id)].add(name)

    # Get all user IDs and movie IDs
    cursor.execute("SELECT id FROM users")
    app_user_ids = {int(r[0]) for r in cursor.fetchall()}

    cursor.execute("SELECT id FROM movies")
    app_movie_ids = {int(r[0]) for r in cursor.fetchall()}

    cursor.close()
    conn.close()

    return app_ratings, dict(app_genre_map), app_user_ids, app_movie_ids


def _build_app_genre_vectors(app_genre_map: dict, genre_names: list, movie_ids: set):
    """
    Convert app movie genres (set of genre names) into binary genre vectors
    matching the ML-100K format (19-dim binary vector).
    """
    n_genres = len(genre_names)
    genre_to_idx = {}
    for i, name in enumerate(genre_names):
        genre_to_idx[name.lower()] = i

    genre_vectors = {}
    for mid in movie_ids:
        vec = np.zeros(n_genres, dtype=np.float32)
        names = app_genre_map.get(mid, set())
        for name in names:
            idx = genre_to_idx.get(name.lower())
            if idx is not None:
                vec[idx] = 1.0
        genre_vectors[mid] = vec

    return genre_vectors


# MySQL DB contains the same users/movies as ML-100K (same ID space).
# No offset needed — IDs are merged directly via set union.


def _compute_fingerprint(app_ratings, app_user_ids, app_movie_ids):
    """Compute a hash fingerprint of current MySQL data to detect changes."""
    # Sort for deterministic order, then hash
    sorted_ratings = sorted(app_ratings)  # (user_id, movie_id, score)
    payload = json.dumps({
        "ratings": sorted_ratings,
        "user_ids": sorted(app_user_ids),
        "movie_ids": sorted(app_movie_ids),
    }, sort_keys=True)
    return hashlib.sha256(payload.encode()).hexdigest()


def _get_state_path(model_path: str) -> str:
    return model_path.replace(".pt", "_retrain_state.json")


def _load_state(model_path: str) -> dict:
    path = _get_state_path(model_path)
    if os.path.exists(path):
        with open(path) as f:
            return json.load(f)
    return {}


def _save_state(model_path: str, fingerprint: str):
    path = _get_state_path(model_path)
    with open(path, "w") as f:
        json.dump({"fingerprint": fingerprint, "timestamp": time.time()}, f)


def run_retrain(
    data_dir: str,
    model_path: str,
    db_config: dict,
    n_epochs: int = 30,
    batch_size: int = 256,
    learning_rate: float = 5e-4,
) -> dict:
    """
    Full retraining pipeline. Returns dict with metrics and info.
    
    This is the core function called by the /retrain endpoint.
    """
    from src.hybrid_model import HybridRecommender

    start_time = time.time()

    # ── 0. Check if data has changed since last retrain ───────────────────
    app_ratings, app_genre_map, app_user_ids, app_movie_ids = _load_mysql_data(db_config)
    current_fingerprint = _compute_fingerprint(app_ratings, app_user_ids, app_movie_ids)
    prev_state = _load_state(model_path)

    if prev_state.get("fingerprint") == current_fingerprint:
        elapsed = time.time() - start_time
        logger.info("No data changes detected — skipping retrain")
        return {
            "status": "no_change",
            "message": "Dữ liệu không thay đổi so với lần retrain trước. Bỏ qua.",
            "n_users": 0,
            "n_movies": 0,
            "n_ratings_total": 0,
            "n_ratings_ml100k": 0,
            "n_ratings_app": len(app_ratings),
            "val_rmse": 0.0,
            "val_mae": 0.0,
            "elapsed_seconds": round(elapsed, 1),
            "model_path": model_path,
        }

    # ── 1. Load ML-100K baseline ──────────────────────────────────────────
    ml_ratings = _load_ml100k_ratings(data_dir)
    ml_user_ids = {r[0] for r in ml_ratings}
    ml_movie_ids = {r[1] for r in ml_ratings}
    ml_genre_vectors, n_genres, genre_names = _load_ml100k_genres(data_dir, ml_movie_ids)

    # ── 2. (App data already loaded in step 0) ───────────────────────────

    # ── 3. Build unified ID mappings ──────────────────────────────────────
    # MySQL IDs share the same space as ML-100K (users 1-943, movies 1-1682)
    # plus possibly a few extra users from app registration.
    # Simply take the union of both sets — no offset needed.
    
    all_user_originals = sorted(ml_user_ids | app_user_ids)
    all_movie_originals = sorted(ml_movie_ids | app_movie_ids)

    user_id_map = {uid: idx for idx, uid in enumerate(all_user_originals)}
    movie_id_map = {mid: idx for idx, mid in enumerate(all_movie_originals)}

    n_users = len(user_id_map)
    n_movies = len(movie_id_map)
    logger.info("Unified: %d users, %d movies", n_users, n_movies)

    # ── 4. Build unified genre vectors (indexed by zero-based idx) ────────
    genre_vectors = {}
    # ML-100K genres
    for mid, vec in ml_genre_vectors.items():
        if mid in movie_id_map:
            genre_vectors[movie_id_map[mid]] = vec
    # App genres (overwrite ML-100K if exists, add new ones)
    app_genre_vecs = _build_app_genre_vectors(app_genre_map, genre_names, app_movie_ids)
    for mid, vec in app_genre_vecs.items():
        if mid in movie_id_map:
            genre_vectors[movie_id_map[mid]] = vec

    # ── 5. Merge all ratings, deduplicate by (user, movie) ─────────────
    # MySQL data overlaps with ML-100K (same ID space). If both sources
    # have a rating for the same (user, movie), prefer the MySQL one.
    rating_dict: dict[tuple[int, int], float] = {}
    
    # ML-100K ratings first (base)
    for uid, mid, score in ml_ratings:
        if uid in user_id_map and mid in movie_id_map:
            key = (user_id_map[uid], movie_id_map[mid])
            rating_dict[key] = score
    
    # App ratings overwrite ML-100K if same (user, movie)
    for uid, mid, score in app_ratings:
        if uid in user_id_map and mid in movie_id_map:
            key = (user_id_map[uid], movie_id_map[mid])
            rating_dict[key] = score

    all_ratings = [(u, m, s) for (u, m), s in rating_dict.items()]

    logger.info("Total training ratings: %d (ML-100K: %d, App: %d, after dedup: %d)",
                len(ml_ratings), len(ml_ratings), len(app_ratings), len(all_ratings))

    # ── 6. Split train/val (90/10) ────────────────────────────────────────
    np.random.seed(42)
    indices = np.random.permutation(len(all_ratings))
    split = int(len(all_ratings) * 0.9)
    train_ratings = [all_ratings[i] for i in indices[:split]]
    val_ratings = [all_ratings[i] for i in indices[split:]]

    # ── 7. Create and train new model ─────────────────────────────────────
    model = HybridRecommender(
        n_users=n_users,
        n_movies=n_movies,
        genre_vectors=genre_vectors,
        emb_dim=24,
        gmf_dim=48,
        mlp_dim=24,
        genre_dim=8,
        n_genres=n_genres,
        use_bias=True,
        train_ratings=train_ratings,
    )

    model.train_model(
        train_ratings=train_ratings,
        val_ratings=val_ratings,
        n_epochs=n_epochs,
        batch_size=batch_size,
        learning_rate=learning_rate,
        weight_decay=1e-5,
        patience=8,
        warmup_epochs=2,
        verbose=True,
    )

    # Evaluate final performance
    from torch.utils.data import DataLoader
    from src.hybrid_model import RatingDataset
    import torch.nn as nn

    val_ds = RatingDataset(val_ratings, genre_vectors, n_genres)
    val_dl = DataLoader(val_ds, batch_size=512, shuffle=False)
    _, val_rmse, val_mae = model._evaluate_loader(val_dl, nn.MSELoss())

    # ── 8. Backup old model and save new one ──────────────────────────────
    if os.path.exists(model_path):
        backup_path = model_path.replace(".pt", f"_backup_{int(time.time())}.pt")
        shutil.copy2(model_path, backup_path)
        logger.info("Old model backed up to %s", backup_path)

    model.save_model(model_path)

    # ── 9. Save data fingerprint so next retrain can skip if unchanged ─────
    _save_state(model_path, current_fingerprint)

    # ── 10. Save ID mapping alongside model for API reload ────────────────
    import torch
    mapping_path = model_path.replace(".pt", "_mapping.pt")
    torch.save({
        "user_id_map": dict(user_id_map),
        "movie_id_map": dict(movie_id_map),
    }, mapping_path)
    logger.info("ID mappings saved to %s", mapping_path)

    elapsed = time.time() - start_time

    result = {
        "status": "success",
        "message": "Huấn luyện model thành công với dữ liệu mới.",
        "n_users": n_users,
        "n_movies": n_movies,
        "n_ratings_total": len(all_ratings),
        "n_ratings_ml100k": len(ml_ratings),
        "n_ratings_app": len(app_ratings),
        "val_rmse": round(val_rmse, 4),
        "val_mae": round(val_mae, 4),
        "elapsed_seconds": round(elapsed, 1),
        "model_path": model_path,
    }
    logger.info("Retrain complete: %s", result)
    return result
