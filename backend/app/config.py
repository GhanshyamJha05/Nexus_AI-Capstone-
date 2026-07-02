"""Application configuration using Pydantic Settings."""

from functools import lru_cache
from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ──────────────────────────────────────────
    app_env: str = "development"
    app_name: str = "Nexus AI"
    app_version: str = "1.0.0"
    app_secret_key: str = "change-this-secret-key"
    app_cors_origins: str = "http://localhost:3000"
    debug: bool = False

    @property
    def cors_origins(self) -> List[str]:
        return [o.strip() for o in self.app_cors_origins.split(",")]

    # ── Google Gemini ─────────────────────────────────────────
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-pro"

    # ── Database ─────────────────────────────────────────────
    postgres_host: str = "localhost"
    postgres_port: int = 5432
    postgres_db: str = "nexus_ai"
    postgres_user: str = "nexus"
    postgres_password: str = "nexus_password"
    database_url: str = "postgresql+asyncpg://nexus:nexus_password@localhost:5432/nexus_ai"

    # ── Redis ─────────────────────────────────────────────────
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_password: str = ""
    redis_url: str = "redis://localhost:6379/0"

    # ── Celery ────────────────────────────────────────────────
    celery_broker_url: str = "redis://localhost:6379/1"
    celery_result_backend: str = "redis://localhost:6379/2"

    # ── ChromaDB ─────────────────────────────────────────────
    chroma_host: str = "localhost"
    chroma_port: int = 8001
    chroma_collection: str = "nexus_knowledge"

    # ── JWT ───────────────────────────────────────────────────
    jwt_secret_key: str = "change-this-jwt-secret"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 60
    jwt_refresh_token_expire_days: int = 30

    # ── Rate Limiting ─────────────────────────────────────────
    rate_limit_requests: int = 100
    rate_limit_window: int = 60

    # ── Logging ───────────────────────────────────────────────
    log_level: str = "INFO"
    log_format: str = "json"

    @field_validator("app_env")
    @classmethod
    def validate_env(cls, v: str) -> str:
        allowed = {"development", "staging", "production", "test"}
        if v not in allowed:
            raise ValueError(f"app_env must be one of {allowed}")
        return v

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"

    @property
    def is_development(self) -> bool:
        return self.app_env == "development"


@lru_cache
def get_settings() -> Settings:
    return Settings()
