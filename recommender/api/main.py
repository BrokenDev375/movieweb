"""
api/main.py
===========
FastAPI application entry point.

Endpoints:
  GET  /recommend/{user_id}  - Return top-N movie recommendations (JSON)
  GET  /health               - Liveness check for Spring Boot + Docker probes

Startup:
  Model and data are loaded once via the lifespan context manager.
  No per-request I/O or model loading.

Run:
  uvicorn api.main:app --reload --port 8000
  (run from project root, not from inside api/)
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

import api.model_loader as loader
from api.config import get_settings
from api.recommender_service import get_recommendations
from api.schemas import HealthResponse, RecommendationResponse

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model + data on startup; nothing to clean up on shutdown."""
    logger.info("=== FastAPI startup: loading model and data ===")
    try:
        loader.load_everything(
            model_path=settings.resolved_model_path,
            data_dir=settings.resolved_data_dir,
        )
        logger.info("=== Model loaded successfully ===")
    except Exception as exc:
        logger.error("FATAL: Could not load model: %s", exc)
        # App starts but /recommend will raise 503 until fixed.
    yield
    logger.info("=== FastAPI shutdown ===")


app = FastAPI(
    title="Movie Recommender AI Service",
    description="FastAPI microservice wrapping the PyTorch HybridRecommender model.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get(
    "/recommend/{user_id}",
    response_model=RecommendationResponse,
    summary="Get top-N movie recommendations for a user",
    tags=["Recommendations"],
)
def recommend(
    user_id: int,
    n: int = Query(default=10, ge=1, le=50, description="Number of recommendations"),
):
    """
    Returns top-N recommended movie IDs for the given user.

    - user_id: original ML-100K user ID (1-943), or any integer.
      If the user is unknown, cold-start popular movies are returned.
    - n: number of results (default 10, max 50).
    """
    if not loader.is_loaded():
        raise HTTPException(
            status_code=503,
            detail="Model is not loaded yet. Try again in a moment.",
        )
    try:
        return get_recommendations(user_id=user_id, n=n)
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get(
    "/health",
    response_model=HealthResponse,
    summary="Service health check",
    tags=["Health"],
)
def health():
    """Liveness probe for Docker or Actuator-style health checks."""
    return HealthResponse(
        status="ok" if loader.is_loaded() else "warming_up",
        model_loaded=loader.is_loaded(),
        n_users=loader.n_users,
        n_movies=loader.n_movies,
    )
