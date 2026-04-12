"""
api/recommender_service.py
===========================
Business logic for generating recommendations.

Sits between main.py (HTTP layer) and model_loader (model/data layer).
All model interaction is isolated here — the route handler stays thin.

Cold-start handling:
  If user_id is not in user_id_map (unknown user),
  we return the top-N popular movies precomputed at startup.
"""

import logging
import random
from typing import Optional

import api.model_loader as loader
from api.schemas import RecommendedMovie, RecommendationResponse

logger = logging.getLogger(__name__)


def get_recommendations(user_id: int, n: int = 10) -> RecommendationResponse:
    """
    Generate top-N movie recommendations for a user.

    Args:
        user_id: The original (1-based) user ID from the ML-100K dataset,
                 or any integer from Spring Boot.
        n:       Number of recommendations to return.

    Returns:
        RecommendationResponse with is_cold_start flag and recommendation list.
    """
    # ── Cold-start detection ──────────────────────────────────────────────
    if user_id not in loader.user_id_map:
        logger.info("Cold-start: user_id=%d not in training data", user_id)
        return _cold_start_response(user_id, n)

    user_idx = loader.user_id_map[user_id]

    # ── Model inference ───────────────────────────────────────────────────
    logger.info("Generating recommendations for user_id=%d (idx=%d)", user_id, user_idx)
    try:
        top_n = loader.model.get_top_n_recommendations(user_idx, n=n)
    except Exception as exc:
        logger.error("Model inference failed for user_id=%d: %s", user_id, exc)
        raise RuntimeError(f"Recommendation model failed: {exc}") from exc

    recommendations = [
        RecommendedMovie(
            rank=rank,
            movie_id=loader.idx_to_movie_id[movie_idx],
            predicted_rating=round(float(score), 4),
        )
        for rank, (movie_idx, score) in enumerate(top_n, start=1)
    ]

    return RecommendationResponse(
        user_id=user_id,
        is_cold_start=False,
        recommendations=recommendations,
    )


def _cold_start_response(user_id: int, n: int) -> RecommendationResponse:
    """
    Return top-N popular movies for an unknown user.
    Random shuffle within the top-popular pool gives variety.
    """
    pool = loader.popular_movie_ids[:loader.popular_movie_ids.__len__()]
    # Take a slightly larger pool and shuffle for variety
    pool_size = max(n * 2, 20)
    candidates = pool[:pool_size]
    random.shuffle(candidates)
    selected = candidates[:n]

    recommendations = [
        RecommendedMovie(
            rank=rank,
            movie_id=loader.idx_to_movie_id[movie_idx],
            predicted_rating=4.0,  # Placeholder; no prediction for unknown users
        )
        for rank, movie_idx in enumerate(selected, start=1)
    ]

    return RecommendationResponse(
        user_id=user_id,
        is_cold_start=True,
        recommendations=recommendations,
    )
