"""Continue tuning from Phase 4 onward (Phase 1-3 already done)."""

import os
import sys
import random
import json

import numpy as np
import torch

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from tune_hybrid import (
    load_data,
    split_train_val_by_fold,
    run_experiment,
    GMFOnlyRecommender,
    MLPOnlyRecommender,
    HybridRecommender,
)


def main():
    random.seed(42)
    np.random.seed(42)
    torch.manual_seed(42)

    print("Loading data...")
    n_users, n_movies, genre_vectors, folds = load_data()

    # Best config from Phase 3
    best_p3_cfg = dict(
        emb_dim=24, gmf_dim=24, mlp_dim=24, genre_dim=8,
        mlp_layers=(64, 32), dropout=0.10, learning_rate=5e-4,
        weight_decay=1e-5, patience=8, n_epochs=30,
    )

    # ════════════════ PHASE 4: ABLATION ════════════════
    print("\n" + "#" * 70)
    print("# PHASE 4: ABLATION STUDY")
    print("#" * 70)

    full_r = run_experiment(
        "P4/Full", n_users, n_movies, genre_vectors, folds, **best_p3_cfg,
    )

    gmf_r = run_experiment(
        "P4/GMF-only", n_users, n_movies, genre_vectors, folds,
        model_cls=GMFOnlyRecommender, **best_p3_cfg,
    )

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

    balance_configs = [
        ("gmf=48,mlp=24", {**best_p3_cfg, "gmf_dim": 48, "mlp_dim": 24}),
        ("gmf=24,mlp=48", {**best_p3_cfg, "gmf_dim": 24, "mlp_dim": 48}),
        ("gmf=48,mlp=48", {**best_p3_cfg, "gmf_dim": 48, "mlp_dim": 48}),
    ]

    p5_results = [("gmf=24,mlp=24", best_p3_cfg, full_r)]
    for bname, bcfg in balance_configs:
        r = run_experiment(f"P5/{bname}", n_users, n_movies, genre_vectors, folds, **bcfg)
        p5_results.append((bname, bcfg, r))

    best_bname, best_final_cfg, best_final = min(p5_results, key=lambda x: x[2]["avg_test_rmse"])
    print(f"\n>>> PHASE 5 WINNER: {best_bname}  Test RMSE={best_final['avg_test_rmse']:.4f}")

    # ════════════════ FINAL REPORT ════════════════
    print("\n" + "=" * 70)
    print("FINAL MODEL REPORT")
    print("=" * 70)

    print(f"\n  Hyperparameters:")
    for k, v in sorted(best_final_cfg.items()):
        print(f"    {k:20s}: {v}")

    print(f"\n  Performance:")
    print(f"    Avg Train RMSE : {best_final['avg_train_rmse']:.4f}")
    print(f"    Avg Test RMSE  : {best_final['avg_test_rmse']:.4f}")
    print(f"    Avg Test MAE   : {best_final['avg_test_mae']:.4f}")
    print(f"    Gap            : {best_final['gap']:.4f}")

    print(f"\n  Fold-wise Test RMSE:")
    for i, rmse in enumerate(best_final["fold_test_rmses"], 1):
        print(f"    Fold {i}: {rmse:.4f}")

    print(f"\n  Component Contribution Summary:")
    print(f"    Full model : {full_r['avg_test_rmse']:.4f}")
    print(f"    GMF-only   : {gmf_r['avg_test_rmse']:.4f}")
    print(f"    MLP-only   : {mlp_r['avg_test_rmse']:.4f}")
    print("=" * 70)

    # Save
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
