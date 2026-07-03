"""Nexus AI FastAPI Application Entry Point."""

import time
from contextlib import asynccontextmanager
from typing import AsyncGenerator

import structlog
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import ORJSONResponse

from app.config import get_settings
from app.core.database import engine, Base
from app.core.logging import configure_logging
from app.core.redis_client import get_redis_client
from app.api.v1.router import api_router
from app.api.health import health_router

settings = get_settings()
logger = structlog.get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan: startup and shutdown events."""
    configure_logging()
    logger.info("Starting Nexus AI backend", version=settings.app_version, env=settings.app_env)

    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables initialized")
    except Exception as exc:
        logger.warning("Database unavailable during startup; continuing without initialization", error=str(exc))

    try:
        redis = await get_redis_client()
        await redis.ping()
        logger.info("Redis connection established")
    except Exception as exc:
        logger.warning("Redis unavailable during startup; continuing without background queues", error=str(exc))

    yield

    try:
        await engine.dispose()
    except Exception as exc:
        logger.warning("Failed to dispose database engine cleanly", error=str(exc))
    logger.info("Nexus AI backend shut down cleanly")


def create_application() -> FastAPI:
    app = FastAPI(
        title="Nexus AI API",
        description="Multi-Agent Decision Intelligence Platform API",
        version=settings.app_version,
        docs_url="/docs" if not settings.is_production else None,
        redoc_url="/redoc" if not settings.is_production else None,
        openapi_url="/openapi.json" if not settings.is_production else None,
        default_response_class=ORJSONResponse,
        lifespan=lifespan,
    )

    # ── Middleware ────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(GZipMiddleware, minimum_size=1000)

    @app.middleware("http")
    async def add_process_time_header(request: Request, call_next) -> Response:
        start_time = time.perf_counter()
        response = await call_next(request)
        process_time = time.perf_counter() - start_time
        response.headers["X-Process-Time"] = str(round(process_time * 1000, 2))
        response.headers["X-Request-ID"] = request.headers.get("X-Request-ID", "")
        return response

    # ── Routers ───────────────────────────────────────────────
    app.include_router(health_router, tags=["Health"])
    app.include_router(api_router, prefix="/api/v1")

    return app


app = create_application()
