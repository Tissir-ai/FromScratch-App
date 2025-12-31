from fastapi import APIRouter, Depends, HTTPException
from typing import List
from uuid import UUID
from app.api.deps import get_db, get_current_user
from app.services.task_service import (
    create, list_by_project, get_by_id, update, remove
)
from app.domain.task import TaskDomain
from app.services.project_service import get_by_id as get_project_by_id
from app.services.role_service import user_has_permission
from app.domain.user import User
from app.services.realtime import broadcast_crud_event

router = APIRouter(prefix="/v1/tasks", tags=["tasks"])


@router.post("/{project_id}", response_model=TaskDomain)
async def create_task(project_id: UUID, payload: TaskDomain, current_user: User = Depends(get_current_user), _=Depends(get_db)):
    project = await get_project_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not await user_has_permission(current_user, project, "create_tasks"):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    task = await create(project_id, payload)
    # Broadcast create event to the project's tasks page room
    await broadcast_crud_event(str(project_id), "tasks", "create", "tasks", task.model_dump() if hasattr(task, "model_dump") else dict(task))
    return task


@router.get("/{project_id}", response_model=List[TaskDomain])
async def list_tasks(project_id: UUID, _=Depends(get_db)):
    return await list_by_project(project_id)


@router.put("/{project_id}/{doc_id}", response_model=TaskDomain)
async def update_task(project_id: UUID, doc_id: UUID, payload: dict, current_user: User = Depends(get_current_user), _=Depends(get_db)):
    project = await get_project_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not await user_has_permission(current_user, project, "edit_tasks"):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    updated = await update(doc_id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Task not found")
    await broadcast_crud_event(str(project_id), "tasks", "update", "tasks", updated if isinstance(updated, dict) else (updated.model_dump() if hasattr(updated, "model_dump") else {"id": str(doc_id)}))
    return updated


@router.delete("/{project_id}/{doc_id}")
async def delete_task(project_id: UUID, doc_id: UUID, current_user: User = Depends(get_current_user), _=Depends(get_db)):
    project = await get_project_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not await user_has_permission(current_user, project, "delete_tasks"):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    deleted = await remove(doc_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Task not found")
    await broadcast_crud_event(str(project_id), "tasks", "delete", "tasks", {"id": str(doc_id)})
    return {"deleted": True}
