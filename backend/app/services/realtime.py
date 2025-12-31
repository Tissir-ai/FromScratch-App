from __future__ import annotations

import asyncio
import json
from typing import Dict, Set, Optional, Any
from fastapi import WebSocket
from app.core.observability import logger


def room_key(project_id: str, page_id: str) -> str:
    return f"{project_id}:{page_id}"


class RoomManager:
    """In-memory room-based WebSocket connection manager.

    - Rooms are keyed by `project_id:page_id`.
    - Tracks connections per room and emits broadcast messages.
    - No database storage; presence and cursors are ephemeral.
    """

    def __init__(self):
        self.rooms: Dict[str, Set[WebSocket]] = {}
        self.user_by_ws: Dict[WebSocket, Dict[str, Any]] = {}
        self._lock = asyncio.Lock()

    async def connect(self, key: str, ws: WebSocket, user: Optional[Dict[str, Any]] = None):
        async with self._lock:
            if key not in self.rooms:
                self.rooms[key] = set()
            self.rooms[key].add(ws)
            if user is not None:
                self.user_by_ws[ws] = user
            logger.info(f"Realtime: client connected to {key} (user={user.get('id') if user else 'unknown'})")
        # after connection, broadcast a presence snapshot to all members
        try:
            users = await self.get_users(key)
            await self.broadcast(key, {"type": "presence.snapshot", "projectId": key.split(':')[0], "pageId": key.split(':')[1], "users": list(users.values())})
        except Exception as e:
            logger.debug(f"Realtime: failed to broadcast presence snapshot: {e}")

    async def disconnect(self, key: str, ws: WebSocket):
        async with self._lock:
            room = self.rooms.get(key)
            if room and ws in room:
                room.remove(ws)
                if not room:
                    self.rooms.pop(key, None)
            self.user_by_ws.pop(ws, None)
            logger.info(f"Realtime: client disconnected from {key}")
        # after disconnect, broadcast a presence snapshot so clients have consistent view
        try:
            users = await self.get_users(key)
            await self.broadcast(key, {"type": "presence.snapshot", "projectId": key.split(':')[0], "pageId": key.split(':')[1], "users": list(users.values())})
        except Exception as e:
            logger.debug(f"Realtime: failed to broadcast presence snapshot after disconnect: {e}")

    async def broadcast(self, key: str, message: Dict[str, Any], skip: Optional[WebSocket] = None):
        # Copy recipients without holding lock while sending
        recipients: Set[WebSocket]
        async with self._lock:
            recipients = set(self.rooms.get(key, set()))

        # Ensure any non-JSON-serializable objects (e.g., PydanticObjectId) are converted to strings
        def _json_default(o):
            try:
                return str(o)
            except Exception:
                return None

        data = json.dumps(message, default=_json_default)
        send_tasks = []
        for ws in recipients:
            if skip is not None and ws == skip:
                continue
            send_tasks.append(ws.send_text(data))
        if send_tasks:
            # best-effort; log individual send errors
            results = await asyncio.gather(*[self._safe_send(t) for t in send_tasks], return_exceptions=True)
            for r in results:
                if isinstance(r, Exception):
                    logger.debug(f"Realtime: send error: {r}")

    async def _safe_send(self, coro):
        try:
            return await coro
        except Exception as e:
            return e

    async def broadcast_crud(self, project_id: str, page_id: str, action: str, entity: str, payload: Dict[str, Any]):
        key = room_key(str(project_id), str(page_id))
        message = {
            "type": "crud",
            "projectId": str(project_id),
            "pageId": str(page_id),
            "action": action,  # create | update | delete
            "entity": entity,   # tasks | requirements | diagrams | logs
            "data": payload,
        }
        await self.broadcast(key, message)

    async def get_users(self, key: str) -> Dict[str, Any]:
        """Return a dict of user-id -> user-info for all connections in the room."""
        async with self._lock:
            room = self.rooms.get(key, set())
            users = {}
            for ws in room:
                u = self.user_by_ws.get(ws)
                if u and isinstance(u, dict):
                    uid = str(u.get('id'))
                    users[uid] = u
            return users


# Singleton manager used across the app
manager = RoomManager()


async def broadcast_crud_event(project_id: str, page_id: str, action: str, entity: str, payload: Dict[str, Any]):
    """Helper to broadcast a CRUD event to the project's page room.

    Routers should call this AFTER a successful DB operation.
    """
    await manager.broadcast_crud(project_id, page_id, action, entity, payload)
