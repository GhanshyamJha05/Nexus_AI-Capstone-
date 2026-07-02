"""Redis client singleton."""

from typing import Optional

import redis.asyncio as aioredis

from app.config import get_settings

settings = get_settings()
_redis_client: Optional[aioredis.Redis] = None


async def get_redis_client() -> aioredis.Redis:
    global _redis_client
    if _redis_client is None:
        _redis_client = aioredis.from_url(
            settings.redis_url,
            encoding="utf-8",
            decode_responses=True,
            socket_connect_timeout=5,
            socket_timeout=5,
            retry_on_timeout=True,
        )
    return _redis_client


async def close_redis_client() -> None:
    global _redis_client
    if _redis_client:
        await _redis_client.close()
        _redis_client = None
