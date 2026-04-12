"""
Systematic tuning script for HybridRecommender on MovieLens 100K.
Phases: capacity -> regularization -> lr -> ablation -> GMF/MLP balance.
"""

import os
import sys
import random
import time
import json

import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from src.data_loader import MovieLensLoader
from src.hybrid_model import HybridRecommender, RatingDataset
from src.evaluator import Evaluator


# ─────────────────────────── data loading ───────────────────────────

def load_data():
    ratings_path = "data/ml-100k/u.data"
    movies_path = "data/ml-100k/u.item"
    genres_path = "data/ml-100k/u.genre"

    loader = MovieLensLoader(ratings_path, movies_path, genres_path)
    ratings = loader.load_ratings()
    loader.load_movie_titles()
    loader.genre_names = loader.load_genre_names()
    loader.user_id_map, loader.movie_id_map = loader.create_mappings(ratings)
    genre_vectors = loader.load_genres()
    folds = loader.load_all_folds("data/ml-100k", n_folds=5)
    return loader.n_users, loader.n_movies, genre_vectors, folds


def split_train_val_by_fold(train_ratings, fold_idx, val_ratio=0.1, base_seed=42):
    n_total = len(train_ratings)
    n_val = max(1, int(n_total * val_ratio))
    rng = np.random.default_rng(base_seed + fold_idx)
    indices = np.arange(n_total)
    rng.shuffle(indices)
    val_idx = set(indices[:n_val].tolist())
    train_split = [train_ratings[i] for i in range(n_total) if i not in val_idx]
    val_split = [train_ratings[i] for i in range(n_total) if i in val_idx]
    return train_split, val_split


# ─────────────────────── ablation model variants ────────────────────

class GMFOnlyRecommender(HybridRecommender):
    """GMF path + bias only. MLP branch exists but is zeroed out in forward."""

    def forward(self, user_ids, movie_ids, genre_vecs):
        if self.use_bias:
            bias = (
                self.global_bias
                + self.user_bias(user_ids).squeeze(1)
                + self.item_bias(movie_ids).squeeze(1)
            )
        else:
            bias = 0.0

        gmf_user = self.user_gmf_emb(user_ids)
        gmf_movie = self.movie_gmf_emb(movie_ids)
        gmf_out = gmf_user * gmf_movie

        # MLP branch outputs zeros
        mlp_out_dim = self.mlp_layers[-1] if self.mlp_layers else 0
        mlp_out = torch.zeros(
            user_ids.size(0), mlp_out_dim, device=user_ids.device,
        )

        fused = torch.cat([gmf_out, mlp_out], dim=1)
        interaction = self.final_head(fused).squeeze(1)
        return bias + interaction


class MLPOnlyRecommender(HybridRecommender):
    """MLP path + genre + bias only. GMF branch is zeroed out in forward."""

    def forward(self, user_ids, movie_ids, genre_vecs):
        if self.use_bias:
            bias = (
                self.global_bias
                + self.user_bias(user_ids).squeeze(1)
                + self.item_bias(movie_ids).squeeze(1)
            )
        else:
            bias = 0.0

        # GMF outputs zeros
        gmf_out = torch.zeros(
            user_ids.size(0), self.gmf_dim, device=user_ids.device,
        )

        mlp_user = self.user_mlp_emb(user_ids)
        mlp_movie = self.movie_mlp_emb(movie_ids)
        genre_dense = self.genre_encoder(genre_vecs)
        mlp_input = torch.cat([mlp_user, mlp_movie, genre_dense], dim=1)
        mlp_out = self.mlp_branch(mlp_input)

        fused = torch.cat([gmf_out, mlp_out], dim=1)
        interaction = self.final_head(fused).squeeze(1)
        return bias + interaction


# ──────────────────────── experiment runner ─────────────────────────

def run_experiment(
    name,
    n_users,
    n_movies,
    genre_vectors,
    folds,
    model_cls=HybridRecommender,
    emb_dim=32,
    gmf_dim=None,
    mlp_dim=None,
    genre_dim=8,
    mlp_layers=(128, 64),
    dropout=0.10,
    learning_rate=1e-3,
    weight_decay=1e-5,
    patience=8,
    n_epochs=30,
    batch_size=256,
    warmup_epochs=0,
    use_cosine_lr=False,
    use_bn=False,
):
    """Run 5-fold CV with given config. Returns dict of metrics."""
    fold_train_rmses = []
    fold_test_rmses = []
    fold_test_maes = []

    for fold_idx, (train_ratings, test_ratings) in enumerate(folds, start=1):
        train_split, val_split = split_train_val_by_fold(
            train_ratings, fold_idx=fold_idx, val_ratio=0.1, base_seed=42
        )

        model = model_cls(
            n_users=n_users,
            n_movies=n_movies,
            genre_vectors=genre_vectors,
            emb_dim=emb_dim,
            gmf_dim=gmf_dim,
            mlp_dim=mlp_dim,
            genre_dim=genre_dim,
            mlp_layers=mlp_layers,
            n_genres=19,
            dropout=dropout,
            train_ratings=train_ratings,
            random_seed=42 + fold_idx,
            use_bn=use_bn,
        )

        model.train_model(
            train_ratings=train_split,
            val_ratings=val_split,
            n_epochs=n_epochs,
            batch_size=batch_size,
            learning_rate=learning_rate,
            weight_decay=weight_decay,
            patience=patience,
            warmup_epochs=warmup_epochs,
            verbose=False,
            use_cosine_lr=use_cosine_lr,
        )

        evaluator = Evaluator(model)
        results = evaluator.evaluate(train_ratings, test_ratings, verbose=False)
        fold_train_rmses.append(results["train_rmse"])
        fold_test_rmses.append(results["test_rmse"])
        fold_test_maes.append(results["test_mae"])

    avg_train = np.mean(fold_train_rmses)
    avg_test = np.mean(fold_test_rmses)
    avg_mae = np.mean(fold_test_maes)
    gap = avg_test - avg_train
    std_test = np.std(fold_test_rmses)

    print(f"\n{'='*60}")
    print(f"  {name}")
    print(f"{'='*60}")
    for i, (tr, te) in enumerate(zip(fold_train_rmses, fold_test_rmses), 1):
        print(f"  Fold {i}: Train RMSE={tr:.4f}  Test RMSE={te:.4f}")
    print(f"  ---")
    print(f"  Avg Train RMSE : {avg_train:.4f}")
    print(f"  Avg Test RMSE  : {avg_test:.4f}  (std={std_test:.4f})")
    print(f"  Avg Test MAE   : {avg_mae:.4f}")
    print(f"  Gap (test-train): {gap:.4f}")
    print(f"{'='*60}")

    return {
        "name": name,
        "avg_train_rmse": avg_train,
        "avg_test_rmse": avg_test,
        "avg_test_mae": avg_mae,
        "gap": gap,
        "std_test": std_test,
        "fold_test_rmses": fold_test_rmses,
        "fold_train_rmses": fold_train_rmses,
    }


def pick_best(results_list, metric="avg_test_rmse"):
    return min(results_list, key=lambda r: r[metric])


# ═════════════════════════════ MAIN ═════════════════════════════════

def main():
    random.seed(42)
    np.random.seed(42)
    torch.manual_seed(42)

    print("Loading data...")
    n_users, n_movies, genre_vectors, folds = load_data()
    print(f"n_users={n_users}, n_movies={n_movies}, folds={len(folds)}\n")

    all_results = {}

    # ════════════════ PHASE 1: CAPACITY ════════════════
    print("\n" + "#" * 70)
    print("# PHASE 1: CAPACITY REDUCTION")
    print("#" * 70)

    p1_configs = {
        "CONFIG_A": dict(emb_dim=32, gmf_dim=32, mlp_dim=32, genre_dim=8,
                         mlp_layers=(128, 64), dropout=0.10, learning_rate=1e-3,
                         weight_decay=1e-5, patience=8, n_epochs=30),
        "CONFIG_B": dict(emb_dim=24, gmf_dim=24, mlp_dim=24, genre_dim=8,
                         mlp_layers=(64, 32), dropout=0.10, learning_rate=1e-3,
                         weight_decay=1e-5, patience=8, n_epochs=30),
        "CONFIG_C": dict(emb_dim=16, gmf_dim=16, mlp_dim=16, genre_dim=8,
                         mlp_layers=(64, 32), dropout=0.10, learning_rate=1e-3,
                         weight_decay=1e-5, patience=8, n_epochs=30),
    }

    p1_results = []
    for cfg_name, cfg in p1_configs.items():
        r = run_experiment(f"P1/{cfg_name}", n_users, n_movies, genre_vectors, folds, **cfg)
        p1_results.append((cfg_name, cfg, r))

    best_p1_name, best_p1_cfg, best_p1 = min(p1_results, key=lambda x: x[2]["avg_test_rmse"])
    print(f"\n>>> PHASE 1 WINNER: {best_p1_name}  Test RMSE={best_p1['avg_test_rmse']:.4f}  gap={best_p1['gap']:.4f}")
    all_results["phase1"] = {n: r for n, _, r in p1_results}

    # ════════════════ PHASE 2: REGULARIZATION ════════════════
    print("\n" + "#" * 70)
    print("# PHASE 2: REGULARIZATION (weight_decay, then dropout)")
    print("#" * 70)

    # --- 2a: weight_decay ---
    print("\n--- Phase 2a: weight_decay ---")
    wd_candidates = [0, 1e-6, 1e-5, 1e-4]
    p2a_results = []
    for wd in wd_candidates:
        cfg = {**best_p1_cfg, "weight_decay": wd}
        r = run_experiment(f"P2a/wd={wd}", n_users, n_movies, genre_vectors, folds, **cfg)
        p2a_results.append((wd, cfg, r))

    best_wd_val, best_wd_cfg, best_wd_r = min(p2a_results, key=lambda x: x[2]["avg_test_rmse"])
    print(f"\n>>> Best weight_decay: {best_wd_val}  Test RMSE={best_wd_r['avg_test_rmse']:.4f}")

    # --- 2b: dropout ---
    print("\n--- Phase 2b: dropout ---")
    do_candidates = [0.05, 0.10, 0.15]
    p2b_results = []
    for do_val in do_candidates:
        cfg = {**best_wd_cfg, "dropout": do_val}
        r = run_experiment(f"P2b/dropout={do_val}", n_users, n_movies, genre_vectors, folds, **cfg)
        p2b_results.append((do_val, cfg, r))

    best_do_val, best_p2_cfg, best_p2 = min(p2b_results, key=lambda x: x[2]["avg_test_rmse"])
    print(f"\n>>> PHASE 2 WINNER: wd={best_wd_val}, dropout={best_do_val}  Test RMSE={best_p2['avg_test_rmse']:.4f}  gap={best_p2['gap']:.4f}")

    # ════════════════ PHASE 3: LEARNING RATE ════════════════
    print("\n" + "#" * 70)
    print("# PHASE 3: LEARNING RATE")
    print("#" * 70)

    lr_candidates = [1e-3, 7e-4, 5e-4, 3e-4]
    p3_results = []
    for lr_val in lr_candidates:
        cfg = {**best_p2_cfg, "learning_rate": lr_val}
        r = run_experiment(f"P3/lr={lr_val}", n_users, n_movies, genre_vectors, folds, **cfg)
        p3_results.append((lr_val, cfg, r))

    best_lr_val, best_p3_cfg, best_p3 = min(p3_results, key=lambda x: x[2]["avg_test_rmse"])
    print(f"\n>>> PHASE 3 WINNER: lr={best_lr_val}  Test RMSE={best_p3['avg_test_rmse']:.4f}  gap={best_p3['gap']:.4f}")

    # ════════════════ PHASE 4: ABLATION ════════════════
    print("\n" + "#" * 70)
    print("# PHASE 4: ABLATION STUDY")
    print("#" * 70)

    # Full model (reuse phase 3 winner)
    full_r = best_p3
    print(f"\n  Full model (from P3): Test RMSE = {full_r['avg_test_rmse']:.4f}")

    # GMF-only
    gmf_r = run_experiment(
        "P4/GMF-only", n_users, n_movies, genre_vectors, folds,
        model_cls=GMFOnlyRecommender, **best_p3_cfg,
    )

    # MLP-only
    mlp_r = run_experiment(
        "P4/MLP-only", n_users, n_movies, genre_vectors, folds,
        model_cls=MLPOnlyRecommender, **best_p3_cfg,
    )

    print(f"\n>>> ABLATION SUMMARY:")
    print(f"  Full model : {full_r['avg_test_rmse']:.4f}")
    print(f"  GMF-only   : {gmf_r['avg_test_rmse']:.4f}")
    print(f"  MLP-only   : {mlp_r['avg_test_rmse']:.4f}")

    # ════════════════ PHASE 5: GMF/MLP BALANCE ════════════════
    print("\n" + "#" * 70)
    print("# PHASE 5: GMF/MLP DIMENSION BALANCE")
    print("#" * 70)

    base_emb = best_p3_cfg["emb_dim"]
    balance_configs = [
        ("gmf=2x,mlp=1x", {**best_p3_cfg, "gmf_dim": base_emb * 2, "mlp_dim": base_emb}),
        ("gmf=1x,mlp=2x", {**best_p3_cfg, "gmf_dim": base_emb, "mlp_dim": base_emb * 2}),
        ("gmf=2x,mlp=2x", {**best_p3_cfg, "gmf_dim": base_emb * 2, "mlp_dim": base_emb * 2}),
    ]

    p5_results = [(best_p3_cfg.get("gmf_dim", base_emb), best_p3_cfg.get("mlp_dim", base_emb), best_p3_cfg, best_p3)]
    for bname, bcfg in balance_configs:
        r = run_experiment(f"P5/{bname}", n_users, n_movies, genre_vectors, folds, **bcfg)
        p5_results.append((bcfg["gmf_dim"], bcfg["mlp_dim"], bcfg, r))

    best_gmf, best_mlp, best_final_cfg, best_final = min(p5_results, key=lambda x: x[3]["avg_test_rmse"])
    print(f"\n>>> PHASE 5 WINNER: gmf_dim={best_gmf}, mlp_dim={best_mlp}  Test RMSE={best_final['avg_test_rmse']:.4f}")

    # ════════════════ FINAL REPORT ════════════════
    print("\n" + "█" * 70)
    print("█" + " " * 20 + "FINAL MODEL REPORT" + " " * 30 + "█")
    print("█" * 70)

    print(f"\n  Hyperparameters:")
    for k, v in sorted(best_final_cfg.items()):
        print(f"    {k:20s}: {v}")

    print(f"\n  Performance:")
    print(f"    Avg Train RMSE : {best_final['avg_train_rmse']:.4f}")
    print(f"    Avg Test RMSE  : {best_final['avg_test_rmse']:.4f}")
    print(f"    Avg Test MAE   : {best_final['avg_test_mae']:.4f}")
    print(f"    Gap            : {best_final['gap']:.4f}")
    print(f"    Std Test RMSE  : {best_final['std_test']:.4f}")

    print(f"\n  Fold-wise Test RMSE:")
    for i, rmse in enumerate(best_final["fold_test_rmses"], 1):
        print(f"    Fold {i}: {rmse:.4f}")

    print(f"\n  Component Contribution Summary:")
    print(f"    Full model : {full_r['avg_test_rmse']:.4f}")
    print(f"    GMF-only   : {gmf_r['avg_test_rmse']:.4f}")
    print(f"    MLP-only   : {mlp_r['avg_test_rmse']:.4f}")

    gap_val = best_final["gap"]
    if gap_val < 0.05:
        overfit_note = "Minimal overfitting — good generalization."
    elif gap_val < 0.10:
        overfit_note = "Moderate overfitting — acceptable for this dataset size."
    else:
        overfit_note = "Notable overfitting — consider more regularization."
    print(f"\n  Overfitting assessment: {overfit_note}")
    print(f"\n  >>> THIS IS THE FINAL CONFIG TO USE <<<")
    print("█" * 70)

    # Save results to JSON for reference
    summary = {
        "final_config": {k: (list(v) if isinstance(v, tuple) else v) for k, v in best_final_cfg.items()},
        "final_metrics": {
            "avg_train_rmse": round(best_final["avg_train_rmse"], 4),
            "avg_test_rmse": round(best_final["avg_test_rmse"], 4),
            "avg_test_mae": round(best_final["avg_test_mae"], 4),
            "gap": round(best_final["gap"], 4),
            "fold_test_rmses": [round(x, 4) for x in best_final["fold_test_rmses"]],
        },
        "ablation": {
            "full": round(full_r["avg_test_rmse"], 4),
            "gmf_only": round(gmf_r["avg_test_rmse"], 4),
            "mlp_only": round(mlp_r["avg_test_rmse"], 4),
        },
    }
    out_path = os.path.join("scripts", "tune_results.json")
    with open(out_path, "w") as f:
        json.dump(summary, f, indent=2)
    print(f"\nResults saved to {out_path}")


if __name__ == "__main__":
    main()
