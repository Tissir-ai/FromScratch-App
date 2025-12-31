from fastapi import APIRouter, HTTPException, Depends
from typing import List
from uuid import UUID
from pydantic import BaseModel

from app.api.deps import get_db, get_current_user
from app.services.chat_service import send_message, get_history
from app.domain.user import User

router = APIRouter(prefix="/projects/{project_id}/chat", tags=["Project Chat"])


class MessageCreate(BaseModel):
    content: str


@router.post("/", response_model=dict)
async def post_message(
    project_id: UUID,
    payload: MessageCreate,
    current_user: User = Depends(get_current_user),
    _=Depends(get_db),
):
    try:
        return await send_message(project_id, current_user.id, payload.content)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/", response_model=List[dict])
async def get_messages(
    project_id: UUID,
    limit: int = 50,
    skip: int = 0,
    current_user: User = Depends(get_current_user),
    _=Depends(get_db),
):
    try:
        return await get_history(project_id, limit, skip)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
