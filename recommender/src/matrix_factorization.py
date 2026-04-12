"""
Matrix Factorization Model
===========================
Implementation of Matrix Factorization with Stochastic Gradient Descent.
"""

import random
import numpy as np


class MatrixFactorization:
    """
    Matrix Factorization model for collaborative filtering.

    The model learns latent factor vectors for users and movies:
    - P (n_users × k): User latent factors
    - Q (n_movies × k): Movie latent factors

    Predicted rating: r̂_ui = p_u · q_i^T + user_bias_u + movie_bias_i + global_bias

    Attributes:
        n_users (int): Number of users
        n_movies (int): Number of movies
        k (int): Number of latent factors
        learning_rate (float): Learning rate for SGD
        regularization (float): L2 regularization parameter
        n_epochs (int): Number of training epochs
        P (np.array): User latent factor matrix
        Q (np.array): Movie latent factor matrix
        user_bias (np.array): User bias terms
        movie_bias (np.array): Movie bias terms
        global_bias (float): Global average rating
    """

    def __init__(self, n_users, n_movies, k=10, learning_rate=0.01,
                 regularization=0.05, n_epochs=20, random_seed=42):
        """
        Initialize the Matrix Factorization model.

        Args:
            n_users (int): Number of users
            n_movies (int): Number of movies
            k (int): Number of latent factors (dimensionality of hidden space)
            learning_rate (float): Step size for gradient descent
            regularization (float): L2 regularization strength (prevents overfitting)
            n_epochs (int): Number of passes through training data
            random_seed (int): Random seed for reproducibility
        """
        self.n_users = n_users
        self.n_movies = n_movies
        self.k = k
        self.learning_rate = learning_rate
        self.regularization = regularization
        self.n_epochs = n_epochs

        # Set random seed
        np.random.seed(random_seed)
        random.seed(random_seed)

        # Initialize parameters
        # Small random values help break symmetry and enable learning
        self.P = np.random.normal(0, 0.1, (n_users, k))  # User factors
        self.Q = np.random.normal(0, 0.1, (n_movies, k))  # Movie factors

        # Bias terms (initialized to zero)
        self.user_bias = np.zeros(n_users)
        self.movie_bias = np.zeros(n_movies)
        self.global_bias = 0.0

        # Track training history
        self.training_loss_history = []

    def compute_global_bias(self, ratings):
        """
        Compute global average rating (baseline prediction).

        Args:
            ratings (list): Training ratings

        Returns:
            float: Average rating across all training samples
        """
        total_rating = sum(r[2] for r in ratings)
        self.global_bias = total_rating / len(ratings)
        return self.global_bias

    def predict(self, user_idx, movie_idx):
        """
        Predict rating for a user-movie pair.

        Formula: r̂ = global_bias + user_bias + movie_bias + p_u · q_i^T

        Args:
            user_idx (int): User index
            movie_idx (int): Movie index

        Returns:
            float: Predicted rating
        """
        # Dot product of user and movie latent vectors
        interaction = np.dot(self.P[user_idx], self.Q[movie_idx])

        # Add biases
        prediction = (self.global_bias +
                      self.user_bias[user_idx] +
                      self.movie_bias[movie_idx] +
                      interaction)

        return prediction

    def compute_loss(self, ratings):
        """
        Compute total loss on dataset (MSE + L2 regularization).

        Loss = Σ(r - r̂)² + λ(||P||² + ||Q||² + ||b_u||² + ||b_i||²)

        Args:
            ratings (list): List of (user_idx, movie_idx, rating) tuples

        Returns:
            float: Total loss value
        """
        mse_loss = 0.0

        # Sum of squared errors
        for user_idx, movie_idx, rating in ratings:
            prediction = self.predict(user_idx, movie_idx)
            error = rating - prediction
            mse_loss += error ** 2

        # L2 regularization term
        reg_loss = self.regularization * (
                np.sum(self.P ** 2) +
                np.sum(self.Q ** 2) +
                np.sum(self.user_bias ** 2) +
                np.sum(self.movie_bias ** 2)
        )

        total_loss = mse_loss + reg_loss
        return total_loss

    def train(self, train_ratings, verbose=True):
        """
        Train the model using Stochastic Gradient Descent (SGD).

        SGD Process:
        1. For each epoch:
           2. Shuffle training data (randomness helps convergence)
           3. For each rating:
              4. Compute prediction and error
              5. Update P, Q, and biases using gradient descent

        Args:
            train_ratings (list): Training data (user_idx, movie_idx, rating)
            verbose (bool): Print progress during training
        """
        # Compute global bias
        self.compute_global_bias(train_ratings)

        if verbose:
            print("=" * 50)
            print("TRAINING MATRIX FACTORIZATION MODEL")
            print("=" * 50)
            print(f"Number of latent factors (k): {self.k}")
            print(f"Learning rate: {self.learning_rate}")
            print(f"Regularization: {self.regularization}")
            print(f"Number of epochs: {self.n_epochs}")
            print(f"Global bias (avg rating): {self.global_bias:.4f}")
            print()

        # Training loop
        for epoch in range(self.n_epochs):
            # Shuffle data for each epoch (key for SGD)
            shuffled_ratings = train_ratings.copy()
            random.shuffle(shuffled_ratings)

            # Process each rating one at a time (stochastic)
            for user_idx, movie_idx, rating in shuffled_ratings:
                # 1. Compute prediction
                prediction = self.predict(user_idx, movie_idx)

                # 2. Compute error
                error = rating - prediction

                # 3. Compute gradients and update parameters
                # Gradient descent: θ ← θ + α · ∇loss
                
                # Save old values for simultaneous update to avoid using updated P for Q's gradient
                p_u_old = self.P[user_idx].copy()
                q_i_old = self.Q[movie_idx].copy()

                # Update user latent factors
                # ∂L/∂p_u = -2·error·q_i + 2·λ·p_u
                p_u_gradient = -error * q_i_old + self.regularization * p_u_old
                self.P[user_idx] -= self.learning_rate * p_u_gradient

                # Update movie latent factors
                # ∂L/∂q_i = -2·error·p_u + 2·λ·q_i
                q_i_gradient = -error * p_u_old + self.regularization * q_i_old
                self.Q[movie_idx] -= self.learning_rate * q_i_gradient

                # Update user bias
                # ∂L/∂b_u = -2·error + 2·λ·b_u
                user_bias_gradient = -error + self.regularization * self.user_bias[user_idx]
                self.user_bias[user_idx] -= self.learning_rate * user_bias_gradient

                # Update movie bias
                # ∂L/∂b_i = -2·error + 2·λ·b_i
                movie_bias_gradient = -error + self.regularization * self.movie_bias[movie_idx]
                self.movie_bias[movie_idx] -= self.learning_rate * movie_bias_gradient

            # Compute and store training loss
            train_loss = self.compute_loss(train_ratings)
            self.training_loss_history.append(train_loss)

            if verbose and (epoch + 1) % 5 == 0:
                print(f"Epoch {epoch + 1}/{self.n_epochs} - Training Loss: {train_loss:.4f}")

        if verbose:
            print()
            print("=" * 50)
            print("TRAINING COMPLETE")
            print("=" * 50)
            print()

    def get_top_n_recommendations(self, user_idx, n=10, rated_movies=None):
        """
        Get top-N movie recommendations for a user.

        Args:
            user_idx (int): User index
            n (int): Number of recommendations
            rated_movies (set): Set of movies already rated (to exclude)

        Returns:
            list: List of (movie_idx, predicted_rating) tuples
        """
        # Predict ratings for all movies
        predictions = []

        for movie_idx in range(self.n_movies):
            # Skip movies the user has already rated
            if rated_movies and movie_idx in rated_movies:
                continue

            predicted_rating = self.predict(user_idx, movie_idx)
            predictions.append((movie_idx, predicted_rating))

        # Sort by predicted rating (descending)
        predictions.sort(key=lambda x: x[1], reverse=True)

        # Return top N
        return predictions[:n]

    def save_model(self, filepath):
        """
        Save model parameters to file.

        Args:
            filepath (str): Path to save model
        """
        np.savez(filepath,
                 P=self.P,
                 Q=self.Q,
                 user_bias=self.user_bias,
                 movie_bias=self.movie_bias,
                 global_bias=self.global_bias)
        print(f"Model saved to {filepath}")

    def load_model(self, filepath):
        """
        Load model parameters from file.

        Args:
            filepath (str): Path to load model from
        """
        data = np.load(filepath)
        self.P = data['P']
        self.Q = data['Q']
        self.user_bias = data['user_bias']
        self.movie_bias = data['movie_bias']
        self.global_bias = data['global_bias']
        print(f"Model loaded from {filepath}")