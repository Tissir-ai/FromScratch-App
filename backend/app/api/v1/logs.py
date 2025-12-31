from fastapi import APIRouter, Depends, HTTPException
from typing import List
from uuid import UUID
from app.api.deps import get_db, get_current_user
from app.services.log_service import (
    create, list_by_project, get_by_id, update, remove
)
from app.domain.log import LogDomain
from app.services.project_service import get_by_id as get_project_by_id
from app.services.role_service import user_has_permission
from app.domain.user import User
from app.services.realtime import broadcast_crud_event


router = APIRouter(prefix="/v1/logs", tags=["logs"])


@router.post("/{project_id}", response_model=LogDomain)
async def create_log(project_id: UUID, payload: LogDomain, current_user: User = Depends(get_current_user), _=Depends(get_db)):
    project = await get_project_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not await user_has_permission(current_user, project, "create_logs"):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    log = await create(project_id, payload)
    await broadcast_crud_event(str(project_id), "logs", "create", "logs", log.model_dump() if hasattr(log, "model_dump") else dict(log))
    return log


@router.get("/{project_id}", response_model=List[LogDomain])
async def list_logs(project_id: UUID, _=Depends(get_db)):
    return await list_by_project(project_id)


@router.put("/{project_id}/{doc_id}", response_model=LogDomain)
async def update_log(project_id: UUID, doc_id: UUID, payload: dict, current_user: User = Depends(get_current_user), _=Depends(get_db)):
    project = await get_project_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not await user_has_permission(current_user, project, "edit_logs"):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    updated = await update(doc_id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Log not found")
    await broadcast_crud_event(str(project_id), "logs", "update", "logs", updated if isinstance(updated, dict) else (updated.model_dump() if hasattr(updated, "model_dump") else {"id": str(doc_id)}))
    return updated


@router.delete("/{project_id}/{doc_id}")
async def delete_log(project_id: UUID, doc_id: UUID, current_user: User = Depends(get_current_user), _=Depends(get_db)):
    project = await get_project_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not await user_has_permission(current_user, project, "delete_logs"):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    deleted = await remove(doc_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Log not found")
    await broadcast_crud_event(str(project_id), "logs", "delete", "logs", {"id": str(doc_id)})
    return {"deleted": True}
