"""WebSocket endpoint for real-time simulation progress streaming."""

import asyncio
import json
from typing import Dict

import structlog
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from jose import JWTError

from app.core.redis_client import get_redis_client
from app.core.security import verify_token_type

router = APIRouter()
logger = structlog.get_logger(__name__)

# Active WebSocket connections keyed by simulation_id
_connections: Dict[int, list] = {}


@router.websocket("/ws/simulations/{simulation_id}")
async def simulation_websocket(websocket: WebSocket, simulation_id: int) -> None:
    """
    WebSocket that streams live agent updates for a simulation.
    Client must send a JWT token as first message for authentication.
    """
    await websocket.accept()

    # Authenticate
    try:
        auth_msg = await asyncio.wait_for(websocket.receive_text(), timeout=10.0)
        auth_data = json.loads(auth_msg)
        token = auth_data.get("token", "")
        user_id_str = verify_token_type(token, "access")
        user_id = int(user_id_str)
    except (JWTError, asyncio.TimeoutError, json.JSONDecodeError, KeyError, ValueError):
        await websocket.send_json({"type": "error", "message": "Unauthorized"})
        await websocket.close(code=4001)
        return

    logger.info("WebSocket connected", simulation_id=simulation_id, user_id=user_id)
    await websocket.send_json({"type": "connected", "simulation_id": simulation_id})

    # Subscribe to Redis pub/sub channel
    redis = await get_redis_client()
    pubsub = redis.pubsub()
    channel = f"simulation:{simulation_id}"
    await pubsub.subscribe(channel)

    try:
        async for message in pubsub.listen():
            if message["type"] == "message":
                data = message["data"]
                if isinstance(data, str):
                    try:
                        await websocket.send_text(data)
                    except Exception:
                        break

            # Allow client to send heartbeat ping
            try:
                client_msg = await asyncio.wait_for(websocket.receive_text(), timeout=0.01)
                if client_msg == "ping":
                    await websocket.send_text("pong")
            except asyncio.TimeoutError:
                pass
            except WebSocketDisconnect:
                break

    except WebSocketDisconnect:
        logger.info("WebSocket disconnected", simulation_id=simulation_id)
    except Exception as e:
        logger.error("WebSocket error", error=str(e))
    finally:
        await pubsub.unsubscribe(channel)
        await pubsub.close()
