"""
api/config.py
=============
Environment-driven settings (pydantic-settings).
Override any value via a .env file or shell environment variables.
"""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        protected_namespaces=(),
    )

    model_path: str = "models/hybrid_model.pt"
    data_dir: str = "data/ml-100k"
    host: str = "0.0.0.0"
    port: int = 8000
    top_n: int = 10
    popular_movies_count: int = 20
    cors_origins: str = "http://localhost:8080,http://localhost:3000,http://localhost:5173"

    # MySQL connection for retrain (reads app ratings)
    db_host: str = "localhost"
    db_port: int = 3306
    db_name: str = "movie_web"
    db_user: str = "root"
    db_password: str = "D@tgutboi2005"

    # Retrain settings
    retrain_secret: str = "retrain-secret-key"

    @property
    def db_config(self) -> dict:
        return {
            "host": self.db_host,
            "port": self.db_port,
            "database": self.db_name,
            "user": self.db_user,
            "password": self.db_password,
        }

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    def _resolve_path(self, path_value: str) -> str:
        path = Path(path_value)
        if not path.is_absolute():
            path = BASE_DIR / path
        return str(path.resolve())

    @property
    def resolved_model_path(self) -> str:
        return self._resolve_path(self.model_path)

    @property
    def resolved_data_dir(self) -> str:
        return self._resolve_path(self.data_dir)


@lru_cache()
def get_settings() -> Settings:
    """Cached singleton to avoid re-reading settings on every request."""
    return Settings()
