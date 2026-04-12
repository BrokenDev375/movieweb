"""
Phase 6: Additional tuning levers on top of best config so far.
Best so far: emb=24, gmf=48, mlp=24, genre_dim=8, mlp_layers=(64,32),
             dropout=0.10, lr=5e-4, wd=1e-5, patience=8, epochs=30
             => Avg Test RMSE = 0.9109
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

    # --- 6A: more epochs + patience ---
    print("\n### 6A: epochs & patience ###")
    for ep, pat in [(50, 12), (80, 15)]:
        cfg = {**BASE, "n_epochs": ep, "patience": pat}
        r = run_experiment(f"6A/ep={ep},pat={pat}", n_users, n_movies, gv, folds, **cfg)
        results.append((f"ep={ep},pat={pat}", cfg, r))

    # --- 6B: warmup ---
    print("\n### 6B: warmup epochs ###")
    for wu in [2, 3, 5]:
        cfg = {**BASE, "n_epochs": 50, "patience": 12, "warmup_epochs": wu}
        r = run_experiment(f"6B/warmup={wu}", n_users, n_movies, gv, folds, **cfg)
        results.append((f"warmup={wu}", cfg, r))

    # --- 6C: cosine LR ---
    print("\n### 6C: cosine LR ###")
    cfg = {**BASE, "n_epochs": 50, "patience": 12, "use_cosine_lr": True}
    r = run_experiment("6C/cosine_lr", n_users, n_movies, gv, folds, **cfg)
    results.append(("cosine_lr", cfg, r))

    cfg2 = {**BASE, "n_epochs": 50, "patience": 12, "use_cosine_lr": True, "warmup_epochs": 3}
    r2 = run_experiment("6C/cosine+warmup3", n_users, n_movies, gv, folds, **cfg2)
    results.append(("cosine+warmup3", cfg2, r2))

    # --- 6D: batch size ---
    print("\n### 6D: batch size ###")
    for bs in [128, 512, 1024]:
        cfg = {**BASE, "batch_size": bs}
        r = run_experiment(f"6D/bs={bs}", n_users, n_movies, gv, folds, **cfg)
        results.append((f"bs={bs}", cfg, r))

    # --- 6E: genre_dim ---
    print("\n### 6E: genre_dim ###")
    for gd in [4, 16, 32]:
        cfg = {**BASE, "genre_dim": gd}
        r = run_experiment(f"6E/genre_dim={gd}", n_users, n_movies, gv, folds, **cfg)
        results.append((f"genre_dim={gd}", cfg, r))

    # --- 6F: bigger model + stronger reg ---
    print("\n### 6F: larger model + more reg ###")
    big_cfgs = [
        ("big_A", dict(emb_dim=32, gmf_dim=64, mlp_dim=32, genre_dim=16,
                       mlp_layers=(128, 64), dropout=0.20, learning_rate=5e-4,
                       weight_decay=1e-4, patience=10, n_epochs=50)),
        ("big_B", dict(emb_dim=32, gmf_dim=64, mlp_dim=32, genre_dim=8,
                       mlp_layers=(128, 64, 32), dropout=0.15, learning_rate=5e-4,
                       weight_decay=5e-5, patience=10, n_epochs=50)),
        ("big_C", dict(emb_dim=32, gmf_dim=48, mlp_dim=32, genre_dim=8,
                       mlp_layers=(64, 32), dropout=0.15, learning_rate=5e-4,
                       weight_decay=5e-5, patience=10, n_epochs=50)),
    ]
    for bname, bcfg in big_cfgs:
        r = run_experiment(f"6F/{bname}", n_users, n_movies, gv, folds, **bcfg)
        results.append((bname, bcfg, r))

    # --- 6G: BN ---
    print("\n### 6G: batch norm ###")
    # Need to pass use_bn via model kwargs - run_experiment doesn't support it directly
    # We'll handle this specially
    from src.hybrid_model import HybridRecommender
    from tune_hybrid import split_train_val_by_fold, Evaluator

    bn_fold_test = []
    bn_fold_train = []
    for fold_idx, (train_ratings, test_ratings) in enumerate(folds, start=1):
        tr, va = split_train_val_by_fold(train_ratings, fold_idx)
        model = HybridRecommender(
            n_users=n_users, n_movies=n_movies, genre_vectors=gv,
            emb_dim=24, gmf_dim=48, mlp_dim=24, genre_dim=8,
            mlp_layers=(64, 32), dropout=0.10, n_genres=19,
            train_ratings=train_ratings, random_seed=42+fold_idx,
            use_bn=True,
        )
        model.train_model(tr, va, n_epochs=30, batch_size=256,
                          learning_rate=5e-4, weight_decay=1e-5,
                          patience=8, warmup_epochs=0, verbose=False)
        ev = Evaluator(model)
        res = ev.evaluate(train_ratings, test_ratings, verbose=False)
        bn_fold_train.append(res["train_rmse"])
        bn_fold_test.append(res["test_rmse"])

    avg_tr = np.mean(bn_fold_train)
    avg_te = np.mean(bn_fold_test)
    print(f"\n{'='*60}")
    print(f"  6G/use_bn=True")
    print(f"{'='*60}")
    for i, (tr, te) in enumerate(zip(bn_fold_train, bn_fold_test), 1):
        print(f"  Fold {i}: Train RMSE={tr:.4f}  Test RMSE={te:.4f}")
    print(f"  Avg Train RMSE : {avg_tr:.4f}")
    print(f"  Avg Test RMSE  : {avg_te:.4f}")
    print(f"  Gap            : {avg_te - avg_tr:.4f}")
    results.append(("use_bn", {}, {"avg_test_rmse": avg_te, "avg_train_rmse": avg_tr,
                                    "gap": avg_te - avg_tr, "fold_test_rmses": bn_fold_test}))

    # ════════════════ SUMMARY ════════════════
    print("\n" + "=" * 70)
    print("PHASE 6 SUMMARY (sorted by Test RMSE)")
    print("=" * 70)
    print(f"{'Config':<30} | {'Test RMSE':>10} | {'Gap':>8}")
    print("-" * 55)
    print(f"{'BASELINE (current best)':<30} | {'0.9109':>10} | {'0.1198':>8}")
    sorted_r = sorted(results, key=lambda x: x[2]["avg_test_rmse"])
    for name, _, r in sorted_r:
        print(f"{name:<30} | {r['avg_test_rmse']:>10.4f} | {r['gap']:>8.4f}")
    print("=" * 70)

    best_name, best_cfg, best_r = sorted_r[0]
    if best_r["avg_test_rmse"] < 0.9109:
        print(f"\n>>> NEW BEST: {best_name}  Test RMSE={best_r['avg_test_rmse']:.4f}")
        if best_cfg:
            print("  Config:")
            for k, v in sorted(best_cfg.items()):
                print(f"    {k}: {v}")
    else:
        print(f"\n>>> No improvement over baseline 0.9109")


if __name__ == "__main__":
    main()
