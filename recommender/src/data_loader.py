"""
Data Loader Module
==================
Handles loading and preprocessing of MovieLens 100K dataset.
"""

import csv
import random
from collections import defaultdict


class MovieLensLoader:
    """
    Loads and preprocesses MovieLens 100K dataset.

    Attributes:
        n_users (int): Number of unique users
        n_movies (int): Number of unique movies
        user_id_map (dict): Maps original user IDs to zero-based indices
        movie_id_map (dict): Maps original movie IDs to zero-based indices
        movie_titles (dict): Maps movie indices to titles
    """

    def __init__(self, ratings_path, movies_path, genres_path=None):
        """
        Initialize the loader.

        Args:
            ratings_path (str): Path to u.data file
            movies_path (str): Path to u.item file
            genres_path (str, optional): Path to u.genre file
        """
        self.ratings_path = ratings_path
        self.movies_path = movies_path
        self.genres_path = genres_path

        # These will be populated during loading
        self.n_users = 0
        self.n_movies = 0
        self.user_id_map = {}
        self.movie_id_map = {}
        self.movie_titles = {}
        self.genre_names = []
        self.genre_vectors = {}

    def load_ratings(self):
        """
        Load ratings from u.data file.

        Returns:
            list: List of tuples (user_id, movie_id, rating, timestamp)
        """
        ratings = []

        with open(self.ratings_path, 'r', encoding='latin-1') as f:
            reader = csv.reader(f, delimiter='\t')
            for row in reader:
                user_id = int(row[0])
                movie_id = int(row[1])
                rating = float(row[2])
                timestamp = int(row[3])

                ratings.append((user_id, movie_id, rating, timestamp))

        print(f"Loaded {len(ratings)} ratings")
        return ratings

    def load_movie_titles(self):
        """
        Load movie titles from u.item file.

        Returns:
            dict: Dictionary mapping movie_id to title
        """
        movie_titles = {}

        with open(self.movies_path, 'r', encoding='latin-1') as f:
            reader = csv.reader(f, delimiter='|')
            for row in reader:
                movie_id = int(row[0])
                title = row[1]
                movie_titles[movie_id] = title

        print(f"Loaded {len(movie_titles)} movie titles")
        return movie_titles

    def load_genre_names(self):
        """
        Load genre names from u.genre file.

        Returns:
            list: List of genre names in order.
        """
        if not self.genres_path:
            # Fallback to hardcoded genres if path not provided
            print("Warning: genres_path not provided, using hardcoded genre names.")
            return [
                'unknown', 'Action', 'Adventure', 'Animation', "Children's", 'Comedy',
                'Crime', 'Documentary', 'Drama', 'Fantasy', 'Film-Noir', 'Horror',
                'Musical', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'War', 'Western'
            ]

        genre_names = []
        with open(self.genres_path, 'r', encoding='latin-1') as f:
            reader = csv.reader(f, delimiter='|')
            for row in reader:
                if row:
                    genre_names.append(row[0])

        print(f"Loaded {len(genre_names)} genre names from {self.genres_path}")
        return genre_names

    def load_genres(self):
        """
        Load multi-hot genre vectors from u.item.

        Each movie is a binary vector: 1 = movie belongs to that genre.
        Dimensionality depends on the number of genres in u.genre.

        Requires ``movie_id_map`` to be populated first
        (call ``create_mappings`` or ``load_and_preprocess`` beforehand).

        Returns:
            dict: ``{movie_idx (int): genre_vector (np.ndarray, float32)}``
        """
        import numpy as np

        if not self.genre_names:
            self.genre_names = self.load_genre_names()

        n_genres = len(self.genre_names)
        genres = {}

        with open(self.movies_path, 'r', encoding='latin-1') as f:
            reader = csv.reader(f, delimiter='|')
            for row in reader:
                movie_id = int(row[0])
                if movie_id not in self.movie_id_map:
                    continue
                # genre binary flags start at column index 5 in u.item
                genre_vec = np.array([int(row[5 + i]) for i in range(n_genres)],
                                     dtype=np.float32)
                genres[self.movie_id_map[movie_id]] = genre_vec

        self.genre_vectors = genres
        print(f"Loaded genre vectors for {len(genres)} movies ({n_genres} genres)")
        return genres

    def create_mappings(self, ratings):
        """
        Create zero-based index mappings for users and movies.

        Args:
            ratings (list): List of rating tuples

        Returns:
            tuple: (user_id_map, movie_id_map)
        """
        # Extract unique user and movie IDs
        unique_users = sorted(set(r[0] for r in ratings))
        unique_movies = sorted(set(r[1] for r in ratings))

        # Create zero-based mappings
        user_id_map = {uid: idx for idx, uid in enumerate(unique_users)}
        movie_id_map = {mid: idx for idx, mid in enumerate(unique_movies)}

        self.n_users = len(user_id_map)
        self.n_movies = len(movie_id_map)

        print(f"Number of users: {self.n_users}")
        print(f"Number of movies: {self.n_movies}")

        return user_id_map, movie_id_map

    def convert_to_zero_based(self, ratings, user_id_map, movie_id_map):
        """
        Convert ratings to zero-based indexing.

        Args:
            ratings (list): Original ratings with 1-based IDs
            user_id_map (dict): User ID mapping
            movie_id_map (dict): Movie ID mapping

        Returns:
            list: Ratings with zero-based indices (user_idx, movie_idx, rating)
        """
        converted_ratings = []

        for user_id, movie_id, rating, _ in ratings:
            user_idx = user_id_map[user_id]
            movie_idx = movie_id_map[movie_id]
            converted_ratings.append((user_idx, movie_idx, rating))

        return converted_ratings

    def train_test_split(self, ratings, test_size=0.2, random_seed=42):
        """
        Split ratings into train and test sets.

        Args:
            ratings (list): List of rating tuples
            test_size (float): Proportion of data for testing (default: 0.2)
            random_seed (int): Random seed for reproducibility

        Returns:
            tuple: (train_ratings, test_ratings)
        """
        # Set random seed for reproducibility
        random.seed(random_seed)

        # Shuffle ratings
        shuffled_ratings = ratings.copy()
        random.shuffle(shuffled_ratings)

        # Calculate split point
        n_test = int(len(shuffled_ratings) * test_size)

        # Split
        test_ratings = shuffled_ratings[:n_test]
        train_ratings = shuffled_ratings[n_test:]

        print(f"Train set: {len(train_ratings)} ratings")
        print(f"Test set: {len(test_ratings)} ratings")

        return train_ratings, test_ratings

    def load_fold(self, fold_idx, data_dir):
        """
        Load one of the official ML-100K pre-split folds.

        The ML-100K dataset ships with 5 ready-made train/test splits stored as:
            u{fold_idx}.base  – training set
            u{fold_idx}.test  – test set

        Call ``load_and_preprocess`` (or ``create_mappings``) first so that
        ``self.user_id_map`` and ``self.movie_id_map`` are populated.

        Args:
            fold_idx (int): Fold number 1-5.
            data_dir (str): Directory that contains the u*.base / u*.test files
                            (e.g. ``"data/ml-100k"``).

        Returns:
            tuple: (train_ratings, test_ratings) – each a list of
                   ``(user_idx, movie_idx, rating)`` zero-based tuples.
        """
        import os

        def _read_file(path):
            rows = []
            with open(path, 'r', encoding='latin-1') as f:
                reader = csv.reader(f, delimiter='\t')
                for row in reader:
                    user_id  = int(row[0])
                    movie_id = int(row[1])
                    rating   = float(row[2])
                    # skip entries whose ids are not in the global mapping
                    if user_id in self.user_id_map and movie_id in self.movie_id_map:
                        rows.append((
                            self.user_id_map[user_id],
                            self.movie_id_map[movie_id],
                            rating
                        ))
            return rows

        base_path = os.path.join(data_dir, f'u{fold_idx}.base')
        test_path = os.path.join(data_dir, f'u{fold_idx}.test')

        train_ratings = _read_file(base_path)
        test_ratings  = _read_file(test_path)

        return train_ratings, test_ratings

    def load_all_folds(self, data_dir, n_folds=5):
        """
        Load all n pre-built ML-100K folds at once.

        Requires ``user_id_map`` / ``movie_id_map`` to be populated first
        (call ``load_and_preprocess`` or ``create_mappings`` beforehand).

        Args:
            data_dir (str): Directory containing the fold files.
            n_folds (int): Number of folds (default 5).

        Returns:
            list[tuple]: A list of (train_ratings, test_ratings) pairs,
                         one per fold.
        """
        folds = []
        for i in range(1, n_folds + 1):
            train, test = self.load_fold(i, data_dir)
            folds.append((train, test))
        return folds

    def load_and_preprocess(self, test_size=0.2, random_seed=42):
        """
        Complete pipeline: load data, create mappings, and split.

        Args:
            test_size (float): Proportion for test set
            random_seed (int): Random seed

        Returns:
            tuple: (train_ratings, test_ratings, movie_titles_mapped, genre_vectors)
        """
        print("=" * 50)
        print("LOADING MOVIELENS 100K DATASET")
        print("=" * 50)

        # Load raw data
        ratings = self.load_ratings()
        movie_titles_raw = self.load_movie_titles()
        
        # Load genre names
        self.genre_names = self.load_genre_names()

        # Create mappings
        self.user_id_map, self.movie_id_map = self.create_mappings(ratings)

        # Convert to zero-based
        ratings_converted = self.convert_to_zero_based(
            ratings, self.user_id_map, self.movie_id_map
        )

        # Map movie titles to zero-based indices
        self.movie_titles = {
            self.movie_id_map[mid]: title
            for mid, title in movie_titles_raw.items()
            if mid in self.movie_id_map
        }

        # Load genre vectors
        self.genre_vectors = self.load_genres()

        # Split into train/test
        train_ratings, test_ratings = self.train_test_split(
            ratings_converted, test_size, random_seed
        )

        print("=" * 50)
        print("DATA LOADING COMPLETE")
        print("=" * 50)
        print()

        return train_ratings, test_ratings, self.movie_titles, self.genre_vectors


# Utility function for saving processed data (optional)
def save_ratings_to_csv(ratings, filepath):
    """
    Save ratings to CSV file.

    Args:
        ratings (list): List of (user_idx, movie_idx, rating) tuples
        filepath (str): Output file path
    """
    with open(filepath, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['user_idx', 'movie_idx', 'rating'])
        writer.writerows(ratings)
    print(f"Saved {len(ratings)} ratings to {filepath}")