"""
Phase 9: Final squeeze around best (gmf=64, mlp=32, bs=128, do=0.15, lr=5e-4).
Avg Test RMSE = 0.9101.
"""

import os, sys, random
import numpy as np
import torch

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from tune_hybrid import load_data, run_experiment

BEST = dict(
    emb_dim=24, gmf_dim=64, mlp_dim=32, genre_dim=8,
    mlp_layers=(64, 32), dropout=0.15, learning_rate=5e-4,
    weight_decay=1e-5, patience=12, n_epochs=50, batch_size=128,
)


def main():
    random.seed(42); np.random.seed(42); torch.manual_seed(42)
    n_users, n_movies, gv, folds = load_data()
    results = []

    # Reconfirm
    r = run_experiment("baseline_0.9101", n_users, n_movies, gv, folds, **BEST)
    results.append(("baseline", BEST, r))

    # 9A: cosine + this config
    cfg = {**BEST, "use_cosine_lr": True}
    r = run_experiment("9A/cosine", n_users, n_movies, gv, folds, **cfg)
    results.append(("cosine", cfg, r))

    # 9B: dropout 0.20
    cfg = {**BEST, "dropout": 0.20}
    r = run_experiment("9B/do=0.20", n_users, n_movies, gv, folds, **cfg)
    results.append(("do=0.20", cfg, r))

    # 9C: dropout 0.25
    cfg = {**BEST, "dropout": 0.25}
    r = run_experiment("9C/do=0.25", n_users, n_movies, gv, folds, **cfg)
    results.append(("do=0.25", cfg, r))

    # 9D: mlp_dim=48
    cfg = {**BEST, "mlp_dim": 48}
    r = run_experiment("9D/mlp=48", n_users, n_movies, gv, folds, **cfg)
    results.append(("mlp=48", cfg, r))

    # 9E: gmf=80, mlp=32
    cfg = {**BEST, "gmf_dim": 80}
    r = run_experiment("9E/gmf=80", n_users, n_movies, gv, folds, **cfg)
    results.append(("gmf=80", cfg, r))

    # 9F: lr=4e-4
    cfg = {**BEST, "learning_rate": 4e-4}
    r = run_experiment("9F/lr=4e-4", n_users, n_movies, gv, folds, **cfg)
    results.append(("lr=4e-4", cfg, r))

    # 9G: cosine + do=0.20
    cfg = {**BEST, "use_cosine_lr": True, "dropout": 0.20}
    r = run_experiment("9G/cosine+do20", n_users, n_movies, gv, folds, **cfg)
    results.append(("cosine+do20", cfg, r))

    # 9H: mlp_layers=(128,64) to match increased mlp_dim
    cfg = {**BEST, "mlp_layers": (128, 64)}
    r = run_experiment("9H/mlp_layers=128-64", n_users, n_movies, gv, folds, **cfg)
    results.append(("mlp128-64", cfg, r))

    # 9I: cosine + gmf=80 + do=0.20
    cfg = {**BEST, "gmf_dim": 80, "dropout": 0.20, "use_cosine_lr": True}
    r = run_experiment("9I/cosine+gmf80+do20", n_users, n_movies, gv, folds, **cfg)
    results.append(("cos+gmf80+do20", cfg, r))

    # ════════════════ SUMMARY ════════════════
    print("\n" + "=" * 70)
    print("PHASE 9 SUMMARY (sorted by Test RMSE)")
    print("=" * 70)
    print(f"{'Config':<25} | {'Test RMSE':>10} | {'Train':>8} | {'Gap':>8} | {'Std':>6}")
    print("-" * 65)
    sorted_r = sorted(results, key=lambda x: x[2]["avg_test_rmse"])
    for name, _, r in sorted_r:
        print(f"{name:<25} | {r['avg_test_rmse']:>10.4f} | {r['avg_train_rmse']:>8.4f} | {r['gap']:>8.4f} | {r['std_test']:>6.4f}")
    print("=" * 70)

    best_name, best_cfg, best_r = sorted_r[0]
    print(f"\n>>> BEST: {best_name}  Test RMSE={best_r['avg_test_rmse']:.4f}")
    print("  Config:")
    for k, v in sorted(best_cfg.items()):
        print(f"    {k}: {v}")
    print("  Fold-wise:")
    for i, te in enumerate(best_r["fold_test_rmses"], 1):
        print(f"    Fold {i}: {te:.4f}")


if __name__ == "__main__":
    main()
