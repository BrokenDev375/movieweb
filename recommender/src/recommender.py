"""
Recommender Module
==================
Generates personalized movie recommendations for users.
"""

from collections import defaultdict


class MovieRecommender:
    """
    Generates and displays movie recommendations.

    Attributes:
        model: Trained MatrixFactorization model
        movie_titles (dict): Mapping from movie_idx to title
    """

    def __init__(self, model, movie_titles):
        """
        Initialize recommender.

        Args:
            model: Trained MatrixFactorization model
            movie_titles (dict): Dictionary mapping movie indices to titles
        """
        self.model = model
        self.movie_titles = movie_titles

    def get_user_rated_movies(self, user_idx, ratings):
        """
        Get all movies rated by a specific user.

        Args:
            user_idx (int): User index
            ratings (list): All ratings data

        Returns:
            dict: Dictionary mapping movie_idx to rating
        """
        user_ratings = {}

        for u_idx, m_idx, rating in ratings:
            if u_idx == user_idx:
                user_ratings[m_idx] = rating

        return user_ratings

    def recommend_for_user(self, user_idx, all_ratings, n=10, verbose=True):
        """
        Generate top-N movie recommendations for a user.

        Args:
            user_idx (int): User index
            all_ratings (list): All ratings (to exclude rated movies)
            n (int): Number of recommendations
            verbose (bool): Print recommendations

        Returns:
            list: List of (movie_idx, predicted_rating, title) tuples
        """
        # Get movies already rated by user
        user_rated = self.get_user_rated_movies(user_idx, all_ratings)
        rated_movie_indices = set(user_rated.keys())

        # Get top-N predictions
        top_n = self.model.get_top_n_recommendations(
            user_idx,
            n=n,
            rated_movies=rated_movie_indices
        )

        # Add movie titles
        recommendations = [
            (movie_idx, pred_rating, self.movie_titles.get(movie_idx, "Unknown"))
            for movie_idx, pred_rating in top_n
        ]

        if verbose:
            print("=" * 70)
            print(f"TOP {n} MOVIE RECOMMENDATIONS FOR USER {user_idx}")
            print("=" * 70)
            print()

            # Show user's rating history (sample)
            print("User's Previous Ratings (sample):")
            print("-" * 70)
            sample_ratings = sorted(user_rated.items(), key=lambda x: x[1], reverse=True)[:5]
            for movie_idx, rating in sample_ratings:
                title = self.movie_titles.get(movie_idx, "Unknown")
                print(f"  ⭐ {rating:.1f} - {title}")
            print()

            # Show recommendations
            print("Recommended Movies:")
            print("-" * 70)
            for rank, (movie_idx, pred_rating, title) in enumerate(recommendations, 1):
                print(f"{rank:2d}. {title}")
                print(f"    Predicted Rating: {pred_rating:.2f} ⭐")
            print()
            print("=" * 70)
            print()

        return recommendations

    def explain_recommendation(self, user_idx, movie_idx, verbose=True):
        """
        Provide explanation for why a movie is recommended.

        Shows latent factor similarity and contribution.

        Args:
            user_idx (int): User index
            movie_idx (int): Movie index
            verbose (bool): Print explanation

        Returns:
            dict: Explanation components
        """
        # Get prediction components
        global_bias = self.model.global_bias
        user_bias = self.model.user_bias[user_idx]
        movie_bias = self.model.movie_bias[movie_idx]

        # Latent factor interaction
        user_factors = self.model.P[user_idx]
        movie_factors = self.model.Q[movie_idx]
        interaction = sum(user_factors * movie_factors)

        # Total prediction
        prediction = global_bias + user_bias + movie_bias + interaction

        explanation = {
            'prediction': prediction,
            'global_bias': global_bias,
            'user_bias': user_bias,
            'movie_bias': movie_bias,
            'interaction': interaction
        }

        if verbose:
            title = self.movie_titles.get(movie_idx, "Unknown")

            print("=" * 70)
            print(f"RECOMMENDATION EXPLANATION")
            print("=" * 70)
            print(f"Movie: {title}")
            print(f"User: {user_idx}")
            print()
            print("Prediction Breakdown:")
            print("-" * 70)
            print(f"Global Average Rating:        {global_bias:+.4f}")
            print(f"User Bias (user tendency):    {user_bias:+.4f}")
            print(f"Movie Bias (movie popularity):{movie_bias:+.4f}")
            print(f"User-Movie Interaction:       {interaction:+.4f}")
            print("-" * 70)
            print(f"Total Predicted Rating:       {prediction:.4f} ⭐")
            print()
            print("Interpretation:")
            if user_bias > 0:
                print(f"- This user tends to rate movies higher than average")
            else:
                print(f"- This user tends to rate movies lower than average")

            if movie_bias > 0:
                print(f"- This movie is generally popular (rated highly)")
            else:
                print(f"- This movie is less popular overall")

            if interaction > 0:
                print(f"- User's preferences align well with this movie")
            else:
                print(f"- User's preferences don't strongly match this movie")
            print("=" * 70)
            print()

        return explanation

    def find_similar_movies(self, movie_idx, n=10, verbose=True):
        """
        Find movies similar to a given movie based on latent factors.

        Similarity is computed using cosine similarity of movie factor vectors.

        Args:
            movie_idx (int): Target movie index
            n (int): Number of similar movies to return
            verbose (bool): Print results

        Returns:
            list: List of (similar_movie_idx, similarity, title) tuples
        """
        import numpy as np

        # Get target movie's latent factors
        target_factors = self.model.Q[movie_idx]

        # Compute similarities with all other movies
        similarities = []

        for other_idx in range(self.model.n_movies):
            if other_idx == movie_idx:
                continue

            other_factors = self.model.Q[other_idx]

            # Cosine similarity
            dot_product = np.dot(target_factors, other_factors)
            norm_target = np.linalg.norm(target_factors)
            norm_other = np.linalg.norm(other_factors)

            if norm_target > 0 and norm_other > 0:
                similarity = dot_product / (norm_target * norm_other)
            else:
                similarity = 0

            similarities.append((other_idx, similarity))

        # Sort by similarity
        similarities.sort(key=lambda x: x[1], reverse=True)

        # Get top N with titles
        similar_movies = [
            (idx, sim, self.movie_titles.get(idx, "Unknown"))
            for idx, sim in similarities[:n]
        ]

        if verbose:
            target_title = self.movie_titles.get(movie_idx, "Unknown")

            print("=" * 70)
            print(f"MOVIES SIMILAR TO: {target_title}")
            print("=" * 70)
            print()
            for rank, (idx, similarity, title) in enumerate(similar_movies, 1):
                print(f"{rank:2d}. {title}")
                print(f"    Similarity: {similarity:.4f}")
            print()
            print("=" * 70)
            print()

        return similar_movies

    def generate_batch_recommendations(self, user_indices, all_ratings, n=5):
        """
        Generate recommendations for multiple users.

        Args:
            user_indices (list): List of user indices
            all_ratings (list): All ratings
            n (int): Number of recommendations per user

        Returns:
            dict: Dictionary mapping user_idx to recommendations
        """
        batch_recommendations = {}

        for user_idx in user_indices:
            recommendations = self.recommend_for_user(
                user_idx, all_ratings, n=n, verbose=False
            )
            batch_recommendations[user_idx] = recommendations

        print(f"Generated recommendations for {len(user_indices)} users")
        return batch_recommendations