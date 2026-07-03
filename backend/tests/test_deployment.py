import pytest

from app.main import lifespan


class FailingDBContext:
    async def __aenter__(self):
        raise RuntimeError("database unavailable")

    async def __aexit__(self, exc_type, exc, tb):
        return False


class FailingEngine:
    def begin(self):
        return FailingDBContext()

    async def dispose(self):
        return None


@pytest.mark.asyncio
async def test_lifespan_handles_unavailable_dependencies(monkeypatch):
    monkeypatch.setattr("app.main.engine", FailingEngine())

    async def fail_redis_client():
        raise RuntimeError("redis unavailable")

    monkeypatch.setattr("app.main.get_redis_client", fail_redis_client)

    async with lifespan(None):
        pass
