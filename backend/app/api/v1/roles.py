from fastapi import APIRouter, Depends, HTTPException
from typing import List
from uuid import UUID
from typing import List
from app.api.deps import get_db, get_current_user
from app.services.role_service import create, get_roles_and_users_by_project, get_by_id, update, remove
from app.services.project_service import get_by_id as get_project_by_id
from app.domain.role import RoleDomain
from app.services.user_service import isAllowed
from app.services.realtime import broadcast_crud_event
from app.services.log_service import log_activity


router = APIRouter(prefix="/v1/roles", tags=["roles"])


@router.post("/{project_id}", response_model=RoleDomain)
async def create_role(project_id: str, payload: RoleDomain, current_user: object = Depends(get_current_user), _=Depends(get_db)):
    project = await get_project_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not await isAllowed(current_user.get("id"), project_id, "manage_project"):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    # If payload is not assignable, construct a new RoleDomain instance
    payload = RoleDomain(project_id=project_id, name=getattr(payload, "name", ""), permissions=getattr(payload, "permissions", []))
    role = await create(payload)
    await log_activity(project_id, current_user.get("id"), f"{current_user.get("name")} Created role: {role.name}")
    await broadcast_crud_event(str(project_id), "roles", "create", "roles", role.model_dump() if hasattr(role, "model_dump") else dict(role))
    return role


@router.get("/{project_id}", response_model=List[dict])
async def list_roles(project_id: str,current_user: object = Depends(get_current_user), _=Depends(get_db)):
    project = await get_project_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not await isAllowed(current_user.get("id"), project_id, "manage_project"):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    roles = await get_roles_and_users_by_project(project_id)
    return roles


@router.put("/{project_id}/{role_id}", response_model=RoleDomain)
async def update_role(project_id: str, role_id: str, payload: dict, current_user: object = Depends(get_current_user), _=Depends(get_db),):
    project = await get_project_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not await isAllowed(current_user.get("id"), project_id, "manage_project"):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    new_data = RoleDomain(
        id=role_id,
        project_id=project_id,
        name=payload.get("name", ""),
        permissions=payload.get("permissions", []),
    )
    role = await update(new_data)
    await log_activity(project_id, current_user.get("id"), f"Updated role: {role.name}")
    await broadcast_crud_event(str(project_id), "roles", "update", "roles", role.model_dump() if hasattr(role, "model_dump") else dict(role))
    return role


@router.delete("/{project_id}/{doc_id}")
async def delete_role(project_id: str, doc_id: str,current_user: object = Depends(get_current_user), _=Depends(get_db)):
    project = await get_project_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not await isAllowed(current_user.get("id"), project_id, "manage_project"):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    deleted = await remove(doc_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Role not found")
    await log_activity(project_id, current_user.get("id"), "Deleted a role")
    await broadcast_crud_event(str(project_id), "roles", "delete", "roles", {"id": str(doc_id)})
    return {"deleted": True}


