"""Health check endpoints."""

from fastapi import APIRouter
from pydantic import BaseModel

health_router = APIRouter()


class HealthResponse(BaseModel):
    status: str
    version: str
    service: str


@health_router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    from app.config import get_settings
    settings = get_settings()
    return HealthResponse(
        status="ok",
        version=settings.app_version,
        service="nexus-ai-backend",
    )


@health_router.get("/health/ready")
async def readiness_check() -> dict:
    """Check that dependent services are reachable."""
    from app.core.database import engine
    from app.core.redis_client import get_redis_client

    checks = {}

    try:
        async with engine.connect() as conn:
            await conn.execute(__import__("sqlalchemy").text("SELECT 1"))
        checks["database"] = "ok"
    except Exception as e:
        checks["database"] = f"error: {e}"

    try:
        redis = await get_redis_client()
        await redis.ping()
        checks["redis"] = "ok"
    except Exception as e:
        checks["redis"] = f"error: {e}"

    all_ok = all(v == "ok" for v in checks.values())
    return {"status": "ready" if all_ok else "degraded", "checks": checks}
