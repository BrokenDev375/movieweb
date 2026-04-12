"""
Evaluator Module
================
Implements evaluation metrics for recommender systems.
"""

import numpy as np


class Evaluator:
    """
    Evaluates recommender system performance.

    Metrics:
    - RMSE (Root Mean Squared Error): Measures prediction accuracy
    - MAE (Mean Absolute Error): Alternative accuracy metric
    """

    def __init__(self, model):
        """
        Initialize evaluator with a trained model.

        Args:
            model: Trained MatrixFactorization model
        """
        self.model = model

    def compute_rmse(self, ratings):
        """
        Compute Root Mean Squared Error.

        RMSE = sqrt(Σ(r - r̂)² / N)

        RMSE measures the average magnitude of prediction errors.
        Lower RMSE = better predictions.

        Args:
            ratings (list): List of (user_idx, movie_idx, rating) tuples

        Returns:
            float: RMSE value
        """
        if hasattr(self.model, 'predict_batch'):
            user_indices = [r[0] for r in ratings]
            movie_indices = [r[1] for r in ratings]
            actual = np.array([r[2] for r in ratings], dtype=np.float32)
            predictions = self.model.predict_batch(user_indices, movie_indices)
            return float(np.sqrt(np.mean((actual - predictions) ** 2)))

        squared_errors = []

        for user_idx, movie_idx, rating in ratings:
            prediction = self.model.predict(user_idx, movie_idx)
            prediction = np.clip(prediction, 1, 5)
            error = rating - prediction
            squared_errors.append(error ** 2)

        mse = np.mean(squared_errors)
        rmse = np.sqrt(mse)

        return rmse

    def compute_mae(self, ratings):
        """
        Compute Mean Absolute Error.

        MAE = Σ|r - r̂| / N

        Args:
            ratings (list): List of (user_idx, movie_idx, rating) tuples

        Returns:
            float: MAE value
        """
        if hasattr(self.model, 'predict_batch'):
            user_indices = [r[0] for r in ratings]
            movie_indices = [r[1] for r in ratings]
            actual = np.array([r[2] for r in ratings], dtype=np.float32)
            predictions = self.model.predict_batch(user_indices, movie_indices)
            return float(np.mean(np.abs(actual - predictions)))

        absolute_errors = []

        for user_idx, movie_idx, rating in ratings:
            prediction = self.model.predict(user_idx, movie_idx)
            error = abs(rating - prediction)
            absolute_errors.append(error)

        mae = np.mean(absolute_errors)
        return mae

    def evaluate(self, train_ratings, test_ratings, verbose=True):
        """
        Comprehensive evaluation on train and test sets.

        Args:
            train_ratings (list): Training ratings
            test_ratings (list): Test ratings
            verbose (bool): Print results

        Returns:
            dict: Dictionary containing all metrics
        """
        # Compute metrics
        train_rmse = self.compute_rmse(train_ratings)
        test_rmse = self.compute_rmse(test_ratings)
        train_mae = self.compute_mae(train_ratings)
        test_mae = self.compute_mae(test_ratings)

        results = {
            'train_rmse': train_rmse,
            'test_rmse': test_rmse,
            'train_mae': train_mae,
            'test_mae': test_mae
        }

        if verbose:
            print("=" * 50)
            print("EVALUATION RESULTS")
            print("=" * 50)
            print(f"Train RMSE: {train_rmse:.4f}")
            print(f"Test RMSE:  {test_rmse:.4f}")
            print(f"Train MAE:  {train_mae:.4f}")
            print(f"Test MAE:   {test_mae:.4f}")
            print("=" * 50)
            print()

            # Interpretation
            print("Interpretation:")
            print(f"- On average, predictions are off by {test_rmse:.4f} rating points")
            if test_rmse < train_rmse + 0.1:
                print("- Model generalizes well (low overfitting)")
            else:
                print("- Some overfitting detected (test RMSE > train RMSE)")
            print()

        return results

    def prediction_distribution_analysis(self, test_ratings, verbose=True):
        """
        Analyze the distribution of predictions vs actual ratings.

        Args:
            test_ratings (list): Test ratings
            verbose (bool): Print analysis

        Returns:
            dict: Distribution statistics
        """
        predictions = []
        actuals = []
        errors = []

        for user_idx, movie_idx, rating in test_ratings:
            prediction = self.model.predict(user_idx, movie_idx)
            predictions.append(prediction)
            actuals.append(rating)
            errors.append(rating - prediction)

        stats = {
            'mean_prediction': np.mean(predictions),
            'mean_actual': np.mean(actuals),
            'std_prediction': np.std(predictions),
            'std_actual': np.std(actuals),
            'mean_error': np.mean(errors),
            'std_error': np.std(errors),
            'min_prediction': np.min(predictions),
            'max_prediction': np.max(predictions)
        }

        if verbose:
            print("=" * 50)
            print("PREDICTION DISTRIBUTION ANALYSIS")
            print("=" * 50)
            print(f"Actual ratings - Mean: {stats['mean_actual']:.4f}, Std: {stats['std_actual']:.4f}")
            print(f"Predicted ratings - Mean: {stats['mean_prediction']:.4f}, Std: {stats['std_prediction']:.4f}")
            print(f"Prediction range: [{stats['min_prediction']:.4f}, {stats['max_prediction']:.4f}]")
            print(f"Error - Mean: {stats['mean_error']:.4f}, Std: {stats['std_error']:.4f}")
            print("=" * 50)
            print()

        return stats

    @staticmethod
    def cross_validate_folds(data_dir, n_folds=5,
                             k=20, learning_rate=0.01,
                             regularization=0.02, n_epochs=20,
                             random_state=42, verbose=True):
        """
        Run cross-validation using the *official* ML-100K pre-split folds.

        The ML-100K dataset ships with 5 ready-made train/test splits:
            u1.base / u1.test  …  u5.base / u5.test

        This static method loads each fold, trains a fresh MatrixFactorization
        model, and reports RMSE and MAE for every fold plus averaged statistics.

        Args:
            data_dir (str): Path to the ml-100k directory (e.g. ``"data/ml-100k"``).
            n_folds (int): Number of folds to run (1-5, default 5).
            k (int): Number of latent factors.
            learning_rate (float): SGD learning rate.
            regularization (float): L2 regularisation strength.
            n_epochs (int): Training epochs per fold.
            random_state (int): Seed for model weight initialisation.
            verbose (bool): Print progress and results.

        Returns:
            dict: ``{fold_results, mean_rmse, std_rmse, mean_mae, std_mae}``

        Example::

            results = Evaluator.cross_validate_folds('data/ml-100k')
        """
        import os
        import time
        from .data_loader import MovieLensLoader
        from .matrix_factorization import MatrixFactorization

        ratings_path = os.path.join(data_dir, 'u.data')
        movies_path  = os.path.join(data_dir, 'u.item')

        # Build global id→index mappings from the full u.data
        loader = MovieLensLoader(ratings_path, movies_path)
        raw_ratings = loader.load_ratings()
        loader.create_mappings(raw_ratings)
        n_users  = loader.n_users
        n_movies = loader.n_movies

        if verbose:
            print("\n" + "=" * 60)
            print("5-FOLD CROSS VALIDATION  (Official ML-100K Splits)")
            print("=" * 60)
            print(f"Model : k={k}, lr={learning_rate}, reg={regularization}, epochs={n_epochs}")
            print(f"Users : {n_users}   Movies : {n_movies}")
            print("-" * 60)

        fold_results = []
        total_start  = time.time()

        for fold_idx in range(1, n_folds + 1):
            fold_start = time.time()

            train_ratings, test_ratings = loader.load_fold(fold_idx, data_dir)

            model = MatrixFactorization(
                n_users=n_users, n_movies=n_movies,
                k=k, learning_rate=learning_rate,
                regularization=regularization,
                n_epochs=n_epochs, random_seed=random_state
            )
            model.train(train_ratings, verbose=False)

            evaluator = Evaluator(model)
            train_rmse = evaluator.compute_rmse(train_ratings)
            test_rmse  = evaluator.compute_rmse(test_ratings)
            train_mae  = evaluator.compute_mae(train_ratings)
            test_mae   = evaluator.compute_mae(test_ratings)

            elapsed = time.time() - fold_start

            fold_results.append({
                'fold':       fold_idx,
                'train_size': len(train_ratings),
                'test_size':  len(test_ratings),
                'train_rmse': train_rmse,
                'test_rmse':  test_rmse,
                'train_mae':  train_mae,
                'test_mae':   test_mae,
            })

            if verbose:
                print(f"Fold {fold_idx} | "
                      f"train={len(train_ratings):>6,}  test={len(test_ratings):>5,} | "
                      f"RMSE={test_rmse:.4f}  MAE={test_mae:.4f}  ({elapsed:.1f}s)")

        test_rmses = [r['test_rmse'] for r in fold_results]
        test_maes  = [r['test_mae']  for r in fold_results]

        mean_rmse = np.mean(test_rmses)
        std_rmse  = np.std(test_rmses)
        mean_mae  = np.mean(test_maes)
        std_mae   = np.std(test_maes)

        if verbose:
            print("-" * 60)
            print(f"Average RMSE : {mean_rmse:.4f}  (±{std_rmse:.4f})")
            print(f"Average MAE  : {mean_mae:.4f}  (±{std_mae:.4f})")
            print(f"Total time   : {time.time() - total_start:.1f}s")
            print("=" * 60 + "\n")

        return {
            'fold_results': fold_results,
            'mean_rmse':    mean_rmse,
            'std_rmse':     std_rmse,
            'mean_mae':     mean_mae,
            'std_mae':      std_mae,
        }
