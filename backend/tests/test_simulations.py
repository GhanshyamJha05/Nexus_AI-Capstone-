"""Tests for simulation endpoints."""

from unittest.mock import AsyncMock, patch

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_simulation(client: AsyncClient, auth_headers: dict) -> None:
    with patch("app.workers.tasks.run_simulation_task") as mock_task:
        mock_task.delay = AsyncMock(return_value=AsyncMock(id="test-task-id"))
        mock_task.delay.return_value.id = "test-task-id"

        resp = await client.post(
            "/api/v1/simulations",
            json={
                "prompt": "What happens if Tesla builds a factory in Germany?",
                "title": "Tesla Germany Factory",
                "tags": ["tesla", "germany"],
                "domain": "supply_chain",
            },
            headers=auth_headers,
        )
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == "Tesla Germany Factory"
    assert data["status"] in ("pending", "running")


@pytest.mark.asyncio
async def test_list_simulations_empty(client: AsyncClient, auth_headers: dict) -> None:
    resp = await client.get("/api/v1/simulations", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "items" in data
    assert "total" in data


@pytest.mark.asyncio
async def test_get_simulation_not_found(client: AsyncClient, auth_headers: dict) -> None:
    resp = await client.get("/api/v1/simulations/99999", headers=auth_headers)
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_health_endpoint(client: AsyncClient) -> None:
    resp = await client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
