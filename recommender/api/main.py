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
from api.schemas import HealthResponse, RecommendationResponse, RetrainRequest, RetrainResponse

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
    allow_methods=["GET", "POST"],
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


# ── Retrain endpoint ─────────────────────────────────────────────────────────

_retrain_lock = False  # simple lock to prevent concurrent retrains


@app.post(
    "/retrain",
    response_model=RetrainResponse,
    summary="Retrain model with latest app ratings",
    tags=["Admin"],
)
def retrain(req: RetrainRequest):
    """
    Trigger model retraining. Merges ML-100K baseline data with live MySQL
    ratings, trains a new HybridRecommender, and hot-reloads it.

    Requires a secret key for authorization.
    """
    global _retrain_lock

    if req.secret != settings.retrain_secret:
        raise HTTPException(status_code=403, detail="Invalid retrain secret")

    if _retrain_lock:
        raise HTTPException(status_code=409, detail="Retrain already in progress")

    _retrain_lock = True
    try:
        from api.retrain import run_retrain

        result = run_retrain(
            data_dir=settings.resolved_data_dir,
            model_path=settings.resolved_model_path,
            db_config=settings.db_config,
            n_epochs=req.n_epochs,
            batch_size=req.batch_size,
            learning_rate=req.learning_rate,
        )

        # Hot-reload only if model was actually retrained
        if result["status"] == "success":
            loader.reload_model(
                model_path=settings.resolved_model_path,
                data_dir=settings.resolved_data_dir,
            )

        return RetrainResponse(**result)

    except Exception as exc:
        logger.error("Retrain failed: %s", exc)
        raise HTTPException(status_code=500, detail=f"Retrain failed: {exc}")
    finally:
        _retrain_lock = False
