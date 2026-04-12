"""
api/schemas.py
==============
Pydantic models — the JSON contract between FastAPI and the React/Spring Boot clients.
"""

from pydantic import BaseModel, Field, ConfigDict


class RecommendedMovie(BaseModel):
    """Single movie recommendation entry."""
    rank: int = Field(..., description="1-based rank in the list")
    movie_id: int = Field(..., description="Original movie ID returned to Spring Boot")
    predicted_rating: float = Field(..., ge=1.0, le=5.0, description="Predicted rating [1, 5]")


class RecommendationResponse(BaseModel):
    """
    Response from GET /recommend/{user_id}.
    Spring Boot deserialises this into RecommendationResponseDto.
    """
    user_id: int
    is_cold_start: bool = Field(
        ...,
        description="True when user is unknown — popular movies returned instead"
    )
    recommendations: list[RecommendedMovie]


class HealthResponse(BaseModel):
    """GET /health response."""
    model_config = ConfigDict(protected_namespaces=())

    status: str
    model_loaded: bool
    n_users: int
    n_movies: int
