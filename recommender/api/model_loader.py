"""
api/model_loader.py
====================
Singleton — loads HybridRecommender once at FastAPI startup.

Global state populated on startup:
  model            : HybridRecommender (eval mode)
  user_id_map      : {original_user_id → zero-based idx}
  movie_id_map     : {original_movie_id → zero-based idx}
  idx_to_movie_id  : {zero-based idx → original_movie_id}
  popular_movie_ids: list[int] sorted by average rating (for cold-start)
  n_users, n_movies: ints for /health response
"""

import csv
import logging
import os
import sys
from collections import defaultdict
from pathlib import Path
from typing import Optional

import numpy as np
import torch

logger = logging.getLogger(__name__)

# ── Resolve project root so we can import from src/ ──────────────────────────
_PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))

from src.hybrid_model import HybridRecommender  # noqa: E402

# ── Module-level globals (set once at startup) ────────────────────────────────
model: Optional[HybridRecommender] = None
user_id_map: dict[int, int] = {}       # original_id  → zero-based idx
movie_id_map: dict[int, int] = {}      # original_id  → zero-based idx
idx_to_movie_id: dict[int, int] = {}   # zero-based idx → original_id
popular_movie_ids: list[int] = []      # zero-based indices by descending avg rating
n_users: int = 0
n_movies: int = 0


def load_everything(model_path: str, data_dir: str) -> None:
    """
    Called once from FastAPI lifespan startup.

    Steps:
      1. Parse u.data → build user/movie ID maps
      2. Compute popular movie list (avg rating per movie)
      3. Load genre vectors from u.item
      4. Reconstruct HybridRecommender and load saved weights
    """
    global model, user_id_map, movie_id_map, idx_to_movie_id
    global popular_movie_ids, n_users, n_movies

    ratings_file = os.path.join(data_dir, "u.data")
    movies_file  = os.path.join(data_dir, "u.item")
    genres_file  = os.path.join(data_dir, "u.genre")

    # ── Step 1: Build ID maps ─────────────────────────────────────────────
    logger.info("Reading ratings from %s", ratings_file)
    raw: list[tuple[int, int, float]] = []
    with open(ratings_file, encoding="latin-1") as f:
        for row in csv.reader(f, delimiter="\t"):
            raw.append((int(row[0]), int(row[1]), float(row[2])))

    unique_users  = sorted({r[0] for r in raw})
    unique_movies = sorted({r[1] for r in raw})

    user_id_map      = {uid: i for i, uid in enumerate(unique_users)}
    movie_id_map     = {mid: i for i, mid in enumerate(unique_movies)}
    idx_to_movie_id  = {i: mid for mid, i in movie_id_map.items()}
    n_users, n_movies = len(user_id_map), len(movie_id_map)
    logger.info("ID maps: %d users, %d movies", n_users, n_movies)

    # ── Step 2: Popularity list (cold-start) ──────────────────────────────
    rating_sum: dict[int, float] = defaultdict(float)
    rating_cnt: dict[int, int]   = defaultdict(int)
    for _, mid, rating in raw:
        idx = movie_id_map[mid]
        rating_sum[idx] += rating
        rating_cnt[idx] += 1

    avg = {idx: rating_sum[idx] / rating_cnt[idx] for idx in rating_sum}
    popular_movie_ids = sorted(avg, key=lambda x: avg[x], reverse=True)
    logger.info("Popularity list built (%d movies)", len(popular_movie_ids))

    # ── Step 3: Genre vectors ─────────────────────────────────────────────
    genre_names: list[str] = []
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
    genre_vectors: dict[int, np.ndarray] = {}
    with open(movies_file, encoding="latin-1") as f:
        for row in csv.reader(f, delimiter="|"):
            mid = int(row[0])
            if mid not in movie_id_map:
                continue
            idx = movie_id_map[mid]
            genre_vectors[idx] = np.array(
                [int(row[5 + i]) for i in range(n_genres)], dtype=np.float32
            )
    logger.info("Genre vectors loaded for %d movies", len(genre_vectors))

    # ── Step 4: Load PyTorch model ────────────────────────────────────────
    logger.info("Loading model from %s", model_path)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    ckpt = torch.load(model_path, map_location=device)
    mapped_ratings = [
        (user_id_map[uid], movie_id_map[mid], rating)
        for uid, mid, rating in raw
    ]

    model = HybridRecommender(
        n_users=ckpt["n_users"],
        n_movies=ckpt["n_movies"],
        genre_vectors=genre_vectors,
        emb_dim=ckpt["emb_dim"],
        gmf_dim=ckpt.get("gmf_dim"),
        mlp_dim=ckpt.get("mlp_dim"),
        mlp_layers=ckpt.get("mlp_layers"),
        genre_dim=ckpt["genre_dim"],
        n_genres=ckpt["n_genres"],
        use_bias=ckpt.get("use_bias", True),
        use_bn=ckpt.get("use_bn", False),
        use_history=ckpt.get("use_history", False),
        train_ratings=mapped_ratings,
    )
    model.load_state_dict(ckpt["state_dict"])
    model.eval()
    logger.info(
        "Model ready: n_users=%d, n_movies=%d, device=%s",
        ckpt["n_users"], ckpt["n_movies"], device,
    )


def is_loaded() -> bool:
    return model is not None and bool(user_id_map)
