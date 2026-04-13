"""
Main Script - Movie Recommender System Master Orchestrator
==========================================================
Complete pipeline demonstrating both Matrix Factorization (MF) 
and Deep Learning Hybrid models.

Steps:
1. Load & preprocess MovieLens 100K data
2. Train & evaluate MF Baseline Model
3. Train & evaluate Hybrid Deep Learning Model
4. Print side-by-side comparison
5. Save both models
6. Launch Interactive Recommendation Mode
"""

import os
import sys
import random
import numpy as np
import torch

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from src.data_loader import MovieLensLoader
from src.matrix_factorization import MatrixFactorization
from src.hybrid_model import HybridRecommender
from src.evaluator import Evaluator
from src.recommender import MovieRecommender


def split_train_val_by_fold(train_ratings, fold_idx, val_ratio=0.1, base_seed=42):
    """Deterministic per-fold train/val split matching tuned benchmark protocol."""
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


def main():
    # Global seed for data splits and MF. Hybrid model re-seeds per fold
    # (random_seed=42+fold_idx) for reproducible but varied weight init.
    random.seed(42)
    np.random.seed(42)
    torch.manual_seed(42)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(42)

    print("\n" + "╔" + "=" * 68 + "╗")
    print("║" + " " * 15 + "MOVIE RECOMMENDER SYSTEM" + " " * 29 + "║")
    print("║" + " " * 9 + "MF vs Hybrid Deep Learning Orchestrator" + " " * 20 + "║")
    print("╚" + "=" * 68 + "╝" + "\n")

    # =================================================================
    # STEP 1: LOAD AND PREPROCESS DATA
    # =================================================================

    ratings_path = 'data/ml-100k/u.data'
    movies_path = 'data/ml-100k/u.item'
    genres_path = 'data/ml-100k/u.genre'

    if not os.path.exists(ratings_path):
        print(f"ERROR: Ratings file not found at {ratings_path}")
        return

    loader = MovieLensLoader(ratings_path, movies_path, genres_path)
    
    # 1. Read ratings & create user/movie index mappings
    ratings = loader.load_ratings()
    movie_titles_raw = loader.load_movie_titles()
    loader.genre_names = loader.load_genre_names()
    loader.user_id_map, loader.movie_id_map = loader.create_mappings(ratings)

    # 2. Extract mapped titles and genre vectors
    movie_titles = {
        loader.movie_id_map[mid]: title
        for mid, title in movie_titles_raw.items()
        if mid in loader.movie_id_map
    }
    genre_vectors = loader.load_genres()

    n_users = loader.n_users
    n_movies = loader.n_movies

    # 3. Load 5 folds
    data_dir = 'data/ml-100k'
    print("\nLoading 5 pre-built folds...")
    folds = loader.load_all_folds(data_dir, n_folds=5)

    # Metrics accumulators
    mf_metrics = {'train_rmse': [], 'test_rmse': [], 'train_mae': [], 'test_mae': []}
    hybrid_metrics = {'train_rmse': [], 'test_rmse': [], 'train_mae': [], 'test_mae': []}

    print("\n" + "=" * 70)
    print("STARTING 5-FOLD CROSS-VALIDATION")
    print("=" * 70)

    for fold_idx, (train_ratings, test_ratings) in enumerate(folds, start=1):
        print(f"\n" + "-" * 70)
        print(f"FOLD {fold_idx} / 5")
        print("-" * 70)

        # =================================================================
        # TRAIN & EVALUATE MATRIX FACTORIZATION BASELINE
        # =================================================================
        print("[1/2] TRAINING MATRIX FACTORIZATION (MF)...")
        mf_model = MatrixFactorization(
            n_users=n_users, n_movies=n_movies, k=10, 
            learning_rate=0.01, regularization=0.05, n_epochs=20
        )
        mf_model.train(train_ratings, verbose=False)

        mf_evaluator = Evaluator(mf_model)
        mf_results = mf_evaluator.evaluate(train_ratings, test_ratings, verbose=False)
        for k in mf_metrics: mf_metrics[k].append(mf_results[k])
        print(
            f"[Fold {fold_idx}] MF     | "
            f"Fold-Train RMSE: {mf_results['train_rmse']:.4f} | "
            f"Test RMSE: {mf_results['test_rmse']:.4f} | "
            f"Fold-Train MAE: {mf_results['train_mae']:.4f} | "
            f"Test MAE: {mf_results['test_mae']:.4f}"
        )

        # =================================================================
        # TRAIN & EVALUATE HYBRID DEEP LEARNING MODEL
        # =================================================================
        print("[2/2] TRAINING HYBRID DEEP LEARNING MODEL...")
        hybrid_train_split, hybrid_val_split = split_train_val_by_fold(
            train_ratings,
            fold_idx=fold_idx,
            val_ratio=0.1,
            base_seed=42,
        )
        hybrid_model = HybridRecommender(
            n_users=n_users, n_movies=n_movies, genre_vectors=genre_vectors,
            emb_dim=24,
            gmf_dim=48,
            mlp_dim=24,
            genre_dim=8,
            mlp_layers=(64, 32),
            n_genres=19,
            dropout=0.10,
            train_ratings=train_ratings,
            random_seed=42 + fold_idx,
        )
        
        hybrid_model.train_model(
            train_ratings=hybrid_train_split,
            val_ratings=hybrid_val_split,
            n_epochs=30,
            batch_size=256,
            learning_rate=5e-4,
            weight_decay=1e-5,
            patience=8,
            warmup_epochs=0,
            verbose=False,
        )

        hybrid_evaluator = Evaluator(hybrid_model)
        hybrid_results = hybrid_evaluator.evaluate(train_ratings, test_ratings, verbose=False)
        for k in hybrid_metrics: hybrid_metrics[k].append(hybrid_results[k])
        print(
            f"[Fold {fold_idx}] Hybrid | "
            f"Fold-Train RMSE: {hybrid_results['train_rmse']:.4f} | "
            f"Test RMSE: {hybrid_results['test_rmse']:.4f} | "
            f"Fold-Train MAE: {hybrid_results['train_mae']:.4f} | "
            f"Test MAE: {hybrid_results['test_mae']:.4f}"
        )

    # =================================================================
    # STEP 4: MODEL COMPARISON TABLE
    # =================================================================
    
    mf_avg = {k: np.mean(v) for k, v in mf_metrics.items()}
    hybrid_avg = {k: np.mean(v) for k, v in hybrid_metrics.items()}

    print("\n" + "=" * 70)
    print(f"{'5-FOLD CROSS-VALIDATION RESULTS':^70}")
    print("=" * 70)
    print(f"{'Metric (Average)':<20} | {'Matrix Factorization':<22} | {'Hybrid DL Model':<22}")
    print("-" * 70)
    print(f"{'Fold-Train RMSE':<20} | {mf_avg['train_rmse']:<22.4f} | {hybrid_avg['train_rmse']:<22.4f}")
    print(f"{'Test RMSE':<20} | {mf_avg['test_rmse']:<22.4f} | {hybrid_avg['test_rmse']:<22.4f}")
    print(f"{'Fold-Train MAE':<20} | {mf_avg['train_mae']:<22.4f} | {hybrid_avg['train_mae']:<22.4f}")
    print(f"{'Test MAE':<20} | {mf_avg['test_mae']:<22.4f} | {hybrid_avg['test_mae']:<22.4f}")
    print("=" * 70 + "\n")

    # =================================================================
    # STEP 5: SAVE MODELS
    # =================================================================

    os.makedirs('models', exist_ok=True)
    # Savings models from the 5th fold
    mf_model.save_model('models/mf_model.npz')
    hybrid_model.save_model('models/hybrid_model.pt')
    print("Fold 5 models exported successfully to 'models/' directory.")

    # =================================================================
    # STEP 6: INTERACTIVE RECOMMENDATION MODE
    # =================================================================
    
    recommender = MovieRecommender(hybrid_model, movie_titles) # Use the Hybrid model as default

    print("\n" + "=" * 70)
    print("INTERACTIVE RECOMMENDATION MODE (Powered by Hybrid Model Fold 5)")
    print("=" * 70 + "\n")
    print(f"You can now get recommendations for any user (0 to {n_users - 1}).")
    print("Enter 'q' to quit.")
    print()

    # Reconstruct all_ratings from fold 5
    all_ratings = folds[-1][0] + folds[-1][1]

    while True:
        user_input = input("Enter user ID: ").strip()

        if user_input.lower() == 'q':
            print("\nShutting down Movie Recommender System. Goodbye!")
            break

        try:
            user_idx = int(user_input)

            if 0 <= user_idx < n_users:
                print()
                recommender.recommend_for_user(
                    user_idx=user_idx,
                    all_ratings=all_ratings,
                    n=5,
                    verbose=True
                )
            else:
                print(f"Please enter a number between 0 and {n_users - 1}")

        except ValueError:
            print("Invalid input. Please enter a number or 'q' to quit.")

        print()

if __name__ == "__main__":
    main()
