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


router = APIRouter(prefix="/v1/roles", tags=["roles"])


@router.post("/{project_id}", response_model=RoleDomain)
async def create_role(project_id: str, payload: RoleDomain, current_user: object = Depends(get_current_user), _=Depends(get_db)):
    project = await get_project_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not await isAllowed(current_user.get("id"), project_id, "manage_project"):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    # Ensure the incoming payload is associated with the project
    try:
        payload.project_id = project_id
    except Exception:
        # If payload is not assignable, construct a new RoleDomain instance
        payload = RoleDomain(project_id=project_id, name=getattr(payload, "name", ""), permissions=getattr(payload, "permissions", []))
    role = await create(payload)
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


@router.put("/{project_id}", response_model=RoleDomain)
async def update_role(project_id: str,  payload: RoleDomain, current_user: object = Depends(get_current_user), _=Depends(get_db),):
    project = await get_project_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not await isAllowed(current_user.get("id"), project_id, "manage_project"):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    role = await update(payload)
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
    await broadcast_crud_event(str(project_id), "roles", "delete", "roles", {"id": str(doc_id)})
    return {"deleted": True}


