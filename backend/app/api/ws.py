from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.core.events import subscribe

router = APIRouter()

@router.websocket("/ws/run/{run_id}")
async def ws_run(websocket: WebSocket, run_id: int):
    await websocket.accept()
    pubsub = subscribe(f"run:{run_id}")
    try:
        for msg in pubsub.listen():
            if msg["type"] != "message":
                continue
            await websocket.send_text(msg["data"])
    except WebSocketDisconnect:
        try:
            pubsub.close()
        except Exception:
            pass
