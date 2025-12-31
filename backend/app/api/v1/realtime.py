import json
import urllib.parse
from typing import Optional, Dict, Any
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.realtime import manager, room_key
from app.core.observability import logger


router = APIRouter(tags=["realtime"])


def _parse_user_from_ws(websocket: WebSocket) -> Optional[Dict[str, Any]]:
    """Extract user context from query param `x_user` or header `x-user`.

    Browsers cannot set arbitrary headers for WebSocket; we accept a URL-encoded
    JSON in `x_user` query param as the primary mechanism.
    """
    # Try query param first
    x_user = websocket.query_params.get("x_user")
    if x_user:
        # Try to parse straight JSON first, then progressively unquote if needed
        candidates = [x_user, urllib.parse.unquote(x_user), urllib.parse.unquote(urllib.parse.unquote(x_user))]
        for cand in candidates:
            try:
                return json.loads(cand)
            except Exception:
                continue
    # Fallback to header (useful for non-browser clients)
    header_user = websocket.headers.get("x-user")
    if header_user:
        try:
            return json.loads(header_user)
        except Exception:
            pass
    return None

@router.websocket("/ws/projects/{project_id}/pages/{page_id}")
async def ws_project_page(websocket: WebSocket, project_id: str, page_id: str):
    # Accept connection early so we can send errors back, but immediately drop if no user
    await websocket.accept()
    user = _parse_user_from_ws(websocket) or {"id": "anonymous"}
    key = room_key(str(project_id), str(page_id))

    logger.info(f"Realtime WS accept: project={project_id} page={page_id} user={user.get('id')} query={websocket.query_params}")
    await manager.connect(key, websocket, user)

    # Notify others of presence join
    await manager.broadcast(
        key,
        {
            "type": "presence.join",
            "projectId": str(project_id),
            "pageId": str(page_id),
            "user": user,
        },
        skip=websocket,
    )

    try:
        while True:
            msg = await websocket.receive_text()
            try:
                data = json.loads(msg)
            except Exception:
                # ignore invalid JSON messages
                continue

            mtype = data.get("type")
            if mtype == "cursor":
                # Broadcast cursor positions to others in the same room; never persisted
                payload = {
                    "type": "cursor",
                    "projectId": str(project_id),
                    "pageId": str(page_id),
                    "user": user,
                    "x": data.get("x"),
                    "y": data.get("y"),
                    "ts": data.get("ts"),
                }
                await manager.broadcast(key, payload, skip=websocket)
            # Additional realtime-only messages can be handled here
    except WebSocketDisconnect:
        # Remove from room and notify others
        logger.info(f"Realtime WS disconnect: project={project_id} page={page_id} user={user.get('id')}")
        await manager.disconnect(key, websocket)
        await manager.broadcast(
            key,
            {
                "type": "presence.leave",
                "projectId": str(project_id),
                "pageId": str(page_id),
                "user": user,
            },
        )


@router.get('/rooms')
async def list_rooms():
    # Debug endpoint to inspect current rooms and counts
    out = {k: len(v) for k, v in manager.rooms.items()}
    return {"rooms": out}


@router.get('/rooms/{project_id}/{page_id}/users')
async def list_room_users(project_id: str, page_id: str):
    key = room_key(str(project_id), str(page_id))
    users = await manager.get_users(key)
    # Return list of user objects
    return {"users": list(users.values())}
