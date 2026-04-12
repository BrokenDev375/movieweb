"""
Phase 7: Combine micro-gains from Phase 6 to try to push below 0.9108.
Try: cosine_lr + bs=128, cosine_lr + bs=128 + genre_dim=32,
     and a few more targeted attempts.
"""

import os
import sys
import random
import numpy as np
import torch

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from tune_hybrid import load_data, run_experiment

BASE = dict(
    emb_dim=24, gmf_dim=48, mlp_dim=24, genre_dim=8,
    mlp_layers=(64, 32), dropout=0.10, learning_rate=5e-4,
    weight_decay=1e-5, patience=8, n_epochs=30, batch_size=256,
    warmup_epochs=0,
)


def main():
    random.seed(42); np.random.seed(42); torch.manual_seed(42)
    n_users, n_movies, gv, folds = load_data()

    results = []

    # --- 7A: cosine + bs=128 ---
    print("\n### 7A: cosine_lr + bs=128 ###")
    cfg = {**BASE, "batch_size": 128, "use_cosine_lr": True, "n_epochs": 50, "patience": 12}
    r = run_experiment("7A/cosine+bs128", n_users, n_movies, gv, folds, **cfg)
    results.append(("cosine+bs128", cfg, r))

    # --- 7B: cosine + bs=128 + genre_dim=32 ---
    print("\n### 7B: cosine + bs=128 + genre_dim=32 ###")
    cfg = {**BASE, "batch_size": 128, "use_cosine_lr": True, "genre_dim": 32, "n_epochs": 50, "patience": 12}
    r = run_experiment("7B/cosine+bs128+gd32", n_users, n_movies, gv, folds, **cfg)
    results.append(("cosine+bs128+gd32", cfg, r))

    # --- 7C: bs=128 + slightly lower lr ---
    print("\n### 7C: bs=128 + lr=3e-4 ###")
    cfg = {**BASE, "batch_size": 128, "learning_rate": 3e-4, "n_epochs": 50, "patience": 12}
    r = run_experiment("7C/bs128+lr3e-4", n_users, n_movies, gv, folds, **cfg)
    results.append(("bs128+lr3e-4", cfg, r))

    # --- 7D: bs=128 + lr=7e-4 ---
    print("\n### 7D: bs=128 + lr=7e-4 ###")
    cfg = {**BASE, "batch_size": 128, "learning_rate": 7e-4, "n_epochs": 50, "patience": 12}
    r = run_experiment("7D/bs128+lr7e-4", n_users, n_movies, gv, folds, **cfg)
    results.append(("bs128+lr7e-4", cfg, r))

    # --- 7E: gmf=64 + bs=128 ---
    print("\n### 7E: gmf=64 + bs=128 ###")
    cfg = {**BASE, "batch_size": 128, "gmf_dim": 64, "n_epochs": 50, "patience": 12}
    r = run_experiment("7E/gmf64+bs128", n_users, n_movies, gv, folds, **cfg)
    results.append(("gmf64+bs128", cfg, r))

    # --- 7F: gmf=64 + bs=128 + dropout=0.15 ---
    print("\n### 7F: gmf=64 + bs=128 + do=0.15 ###")
    cfg = {**BASE, "batch_size": 128, "gmf_dim": 64, "dropout": 0.15, "n_epochs": 50, "patience": 12}
    r = run_experiment("7F/gmf64+bs128+do15", n_users, n_movies, gv, folds, **cfg)
    results.append(("gmf64+bs128+do15", cfg, r))

    # --- 7G: cosine + gmf=64 + bs=128 ---
    print("\n### 7G: cosine + gmf=64 + bs=128 ###")
    cfg = {**BASE, "batch_size": 128, "gmf_dim": 64, "use_cosine_lr": True, "n_epochs": 50, "patience": 12}
    r = run_experiment("7G/cosine+gmf64+bs128", n_users, n_movies, gv, folds, **cfg)
    results.append(("cosine+gmf64+bs128", cfg, r))

    # ════════════════ SUMMARY ════════════════
    print("\n" + "=" * 70)
    print("PHASE 7 SUMMARY (sorted by Test RMSE)")
    print("=" * 70)
    print(f"{'Config':<30} | {'Test RMSE':>10} | {'Gap':>8} | {'Std':>6}")
    print("-" * 60)
    print(f"{'BASELINE':<30} | {'0.9109':>10} | {'0.1198':>8} | {'0.0040':>6}")
    sorted_r = sorted(results, key=lambda x: x[2]["avg_test_rmse"])
    for name, _, r in sorted_r:
        print(f"{name:<30} | {r['avg_test_rmse']:>10.4f} | {r['gap']:>8.4f} | {r['std_test']:>6.4f}")
    print("=" * 70)

    best_name, best_cfg, best_r = sorted_r[0]
    if best_r["avg_test_rmse"] < 0.9108:
        print(f"\n>>> NEW BEST: {best_name}  Test RMSE={best_r['avg_test_rmse']:.4f}")
        print("  Config:")
        for k, v in sorted(best_cfg.items()):
            print(f"    {k}: {v}")
        print("\n  Fold-wise:")
        for i, te in enumerate(best_r["fold_test_rmses"], 1):
            print(f"    Fold {i}: {te:.4f}")
    else:
        print(f"\n>>> Best this round: {best_name} = {best_r['avg_test_rmse']:.4f} (no improvement)")


if __name__ == "__main__":
    main()
