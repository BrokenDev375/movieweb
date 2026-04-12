import argparse
import copy
import os
import random
import sys
from typing import Dict, List

import numpy as np
import torch


PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from src.data_loader import MovieLensLoader
from src.evaluator import Evaluator
from src.hybrid_model import HybridRecommender


def set_global_seed(seed: int) -> None:
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)


def split_train_val_by_fold(train_ratings, fold_idx, val_ratio=0.1, base_seed=42):
    if len(train_ratings) < 1000 or val_ratio <= 0:
        return train_ratings, None

    n_total = len(train_ratings)
    n_val = max(1, int(n_total * val_ratio))
    rng = np.random.default_rng(base_seed + fold_idx)
    indices = np.arange(n_total)
    rng.shuffle(indices)
    val_idx = set(indices[:n_val].tolist())

    train_split = [train_ratings[i] for i in range(n_total) if i not in val_idx]
    val_split = [train_ratings[i] for i in range(n_total) if i in val_idx]
    return train_split, val_split


def build_candidates() -> List[Dict[str, object]]:
    base = {
        "emb_dim": 24,
        "gmf_dim": 128,
        "mlp_dim": 16,
        "genre_dim": 16,
        "mlp_layers": (256, 128, 64),
        "dropout": 0.10,
        "n_epochs": 20,
        "batch_size": 256,
        "learning_rate": 7.259607626526873e-4,
        "weight_decay": 1.4667513961591261e-6,
        "patience": 5,
        "warmup_epochs": 0,
    }

    cands = []

    def add(name: str, overrides: Dict[str, object]):
        cfg = copy.deepcopy(base)
        cfg.update(overrides)
        cfg["name"] = name
        cands.append(cfg)

    add("baseline", {})
    add("lr_6p5e4", {"learning_rate": 6.5e-4})
    add("lr_8e4", {"learning_rate": 8.0e-4})
    add("wd_1e6", {"weight_decay": 1.0e-6})
    add("wd_3e6", {"weight_decay": 3.0e-6})
    add("drop_0p15", {"dropout": 0.15})
    add("drop_0p05", {"dropout": 0.05})
    add("mlp_dim_32", {"mlp_dim": 32, "mlp_layers": (256, 128, 64)})
    add("genre_24", {"genre_dim": 24})
    add("layers_128_64_32", {"mlp_layers": (128, 64, 32)})
    add("gmf_64", {"gmf_dim": 64})
    add("epochs25_pat6", {"n_epochs": 25, "patience": 6})
    return cands


def evaluate_candidate(
    cfg: Dict[str, object],
    folds,
    n_users: int,
    n_movies: int,
    genre_vectors,
    n_folds: int,
) -> Dict[str, object]:
    rmse_list = []
    mae_list = []

    for fold_idx, (train_ratings, test_ratings) in enumerate(folds[:n_folds], start=1):
        train_split, val_split = split_train_val_by_fold(
            train_ratings,
            fold_idx=fold_idx,
            val_ratio=0.1,
            base_seed=42,
        )
        model = HybridRecommender(
            n_users=n_users,
            n_movies=n_movies,
            genre_vectors=genre_vectors,
            emb_dim=cfg["emb_dim"],
            gmf_dim=cfg["gmf_dim"],
            mlp_dim=cfg["mlp_dim"],
            genre_dim=cfg["genre_dim"],
            mlp_layers=cfg["mlp_layers"],
            n_genres=19,
            dropout=cfg["dropout"],
            train_ratings=train_split,
            random_seed=42 + fold_idx,
        )
        model.train_model(
            train_ratings=train_split,
            val_ratings=val_split,
            n_epochs=cfg["n_epochs"],
            batch_size=cfg["batch_size"],
            learning_rate=cfg["learning_rate"],
            weight_decay=cfg["weight_decay"],
            patience=cfg["patience"],
            warmup_epochs=cfg["warmup_epochs"],
            verbose=False,
        )
        evaluator = Evaluator(model)
        fold_rmse = float(evaluator.compute_rmse(test_ratings))
        fold_mae = float(evaluator.compute_mae(test_ratings))
        rmse_list.append(fold_rmse)
        mae_list.append(fold_mae)

    return {
        "name": cfg["name"],
        "avg_rmse": float(np.mean(rmse_list)),
        "std_rmse": float(np.std(rmse_list)),
        "avg_mae": float(np.mean(mae_list)),
        "rmse_list": rmse_list,
        "mae_list": mae_list,
        "config": cfg,
    }


def main():
    parser = argparse.ArgumentParser(description="Search best HybridRecommender config on ML-100K folds")
    parser.add_argument("--folds", type=int, default=2, help="Number of official folds to evaluate per candidate")
    parser.add_argument("--topk", type=int, default=3, help="How many top candidates to print")
    args = parser.parse_args()

    set_global_seed(42)

    loader = MovieLensLoader("data/ml-100k/u.data", "data/ml-100k/u.item", "data/ml-100k/u.genre")
    ratings = loader.load_ratings()
    loader.genre_names = loader.load_genre_names()
    loader.user_id_map, loader.movie_id_map = loader.create_mappings(ratings)
    genre_vectors = loader.load_genres()
    folds = loader.load_all_folds("data/ml-100k", n_folds=5)

    candidates = build_candidates()
    results = []

    print(f"Running {len(candidates)} candidates on {args.folds} fold(s)...")
    for idx, cand in enumerate(candidates, start=1):
        print(f"[{idx:02d}/{len(candidates)}] {cand['name']} ...")
        result = evaluate_candidate(
            cand,
            folds=folds,
            n_users=loader.n_users,
            n_movies=loader.n_movies,
            genre_vectors=genre_vectors,
            n_folds=args.folds,
        )
        results.append(result)
        print(
            f"  -> avg_rmse={result['avg_rmse']:.4f} std={result['std_rmse']:.4f} "
            f"avg_mae={result['avg_mae']:.4f}"
        )

    results_sorted = sorted(results, key=lambda row: row["avg_rmse"])
    print("\nTop candidates:")
    for row in results_sorted[: args.topk]:
        print(
            f"- {row['name']}: avg_rmse={row['avg_rmse']:.4f} "
            f"std={row['std_rmse']:.4f} avg_mae={row['avg_mae']:.4f}"
        )
        print(f"  rmse_list={row['rmse_list']}")


if __name__ == "__main__":
    main()
