from fastapi import APIRouter, Depends, HTTPException
from typing import List
from uuid import UUID
from app.api.deps import get_db, get_current_user
from app.services.log_service import (
    create, list_by_project, list_by_user, get_by_id, update, remove
)
from app.domain.log import LogDomain
from app.services.role_service import user_has_permission
from app.services.project_service import get_by_id as get_project_by_id
from app.domain.user import User
from app.services.realtime import broadcast_crud_event
from app.services.user_service import isAllowed

router = APIRouter(prefix="/v1/logs", tags=["logs"])



@router.get("/{project_id}", response_model=List[dict])
async def list_logs(project_id: str, current_user: User = Depends(get_current_user), _=Depends(get_db)):
    """Get all project logs - requires manage_project permission."""
    project = await get_project_by_id(project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    if not await isAllowed(current_user.get("id"), project_id, "manage_project"):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return await list_by_project(project_id)


@router.get("/{project_id}/my-logs", response_model=List[dict])
async def list_my_logs(project_id: str, current_user: User = Depends(get_current_user), _=Depends(get_db)):
    """Get logs for the current user in this project."""
    project = await get_project_by_id(project_id)
    if not project:
        print("Project not found when fetching user logs:", project_id)
        raise HTTPException(404, "Project not found")
    
    # All project members can see their own logs
    return await list_by_user(project_id, current_user.get("id"))

