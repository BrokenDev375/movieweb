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


class RetrainRequest(BaseModel):
    """POST /retrain request body."""
    secret: str = Field(..., description="Secret key to authorize retrain")
    n_epochs: int = Field(default=30, ge=5, le=100)
    batch_size: int = Field(default=256, ge=64, le=1024)
    learning_rate: float = Field(default=5e-4, gt=0, le=0.01)


class RetrainResponse(BaseModel):
    """POST /retrain response."""
    status: str  # "success" or "no_change"
    message: str = ""
    n_users: int
    n_movies: int
    n_ratings_total: int
    n_ratings_ml100k: int
    n_ratings_app: int
    val_rmse: float
    val_mae: float
    elapsed_seconds: float
    model_path: str
