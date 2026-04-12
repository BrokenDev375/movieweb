"""
Phase 8: Fine-tune around current best (gmf=64, bs=128, do=0.15, lr=5e-4).
Avg Test RMSE = 0.9106. Try:
- dropout 0.20 and 0.12
- gmf=96 and gmf=80
- cosine + this config
- weight_decay 5e-5 and 3e-5
- lr=4e-4
"""

import os, sys, random
import numpy as np
import torch

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from tune_hybrid import load_data, run_experiment

BEST = dict(
    emb_dim=24, gmf_dim=64, mlp_dim=24, genre_dim=8,
    mlp_layers=(64, 32), dropout=0.15, learning_rate=5e-4,
    weight_decay=1e-5, patience=12, n_epochs=50, batch_size=128,
)


def main():
    random.seed(42); np.random.seed(42); torch.manual_seed(42)
    n_users, n_movies, gv, folds = load_data()
    results = []

    # Reconfirm baseline
    r = run_experiment("baseline_reconfirm", n_users, n_movies, gv, folds, **BEST)
    results.append(("baseline", BEST, r))

    # 8A: dropout
    for do in [0.12, 0.20, 0.25]:
        cfg = {**BEST, "dropout": do}
        r = run_experiment(f"8A/do={do}", n_users, n_movies, gv, folds, **cfg)
        results.append((f"do={do}", cfg, r))

    # 8B: gmf_dim
    for gd in [80, 96]:
        cfg = {**BEST, "gmf_dim": gd}
        r = run_experiment(f"8B/gmf={gd}", n_users, n_movies, gv, folds, **cfg)
        results.append((f"gmf={gd}", cfg, r))

    # 8C: cosine LR
    cfg = {**BEST, "use_cosine_lr": True}
    r = run_experiment("8C/cosine", n_users, n_movies, gv, folds, **cfg)
    results.append(("cosine", cfg, r))

    # 8D: weight_decay
    for wd in [3e-5, 5e-5]:
        cfg = {**BEST, "weight_decay": wd}
        r = run_experiment(f"8D/wd={wd}", n_users, n_movies, gv, folds, **cfg)
        results.append((f"wd={wd}", cfg, r))

    # 8E: lr fine-tune
    for lr in [4e-4, 6e-4]:
        cfg = {**BEST, "learning_rate": lr}
        r = run_experiment(f"8E/lr={lr}", n_users, n_movies, gv, folds, **cfg)
        results.append((f"lr={lr}", cfg, r))

    # 8F: mlp_dim=32 (give MLP more capacity too)
    cfg = {**BEST, "mlp_dim": 32}
    r = run_experiment("8F/mlp=32", n_users, n_movies, gv, folds, **cfg)
    results.append(("mlp=32", cfg, r))

    # 8G: mlp_layers=(128,64) with higher dropout
    cfg = {**BEST, "mlp_layers": (128, 64), "dropout": 0.20}
    r = run_experiment("8G/mlp128-64+do20", n_users, n_movies, gv, folds, **cfg)
    results.append(("mlp128-64+do20", cfg, r))

    # ════════════════ SUMMARY ════════════════
    print("\n" + "=" * 70)
    print("PHASE 8 SUMMARY (sorted by Test RMSE)")
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
