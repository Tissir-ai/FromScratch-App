from fastapi import APIRouter, Depends, HTTPException
from typing import List
from uuid import UUID
from app.api.deps import get_db, get_current_user
from app.services.requirement_service import (
    create, list_by_project, get_by_id, update, remove
)
from app.domain.requirement import RequirementDomain ,RequirementStructure
from app.services.project_service import get_by_id as get_project_by_id
from app.services.role_service import user_has_permission
from app.domain.user import User
from app.services.realtime import broadcast_crud_event
from app.services.user_service import isAllowed



router = APIRouter(prefix="/v1/requirements", tags=["requirements"])


@router.post("/{project_id}", response_model=RequirementStructure)
async def create_requirement(project_id: str, payload: RequirementStructure, current_user: User = Depends(get_current_user), _=Depends(get_db)):
    project = await get_project_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not await isAllowed(current_user.get("id"), project_id, "create_requirements"):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    requirement = await create(project_id, payload)
    await broadcast_crud_event(str(project_id), "requirements", "create", "requirements", requirement.model_dump() if hasattr(requirement, "model_dump") else dict(requirement))
    return requirement


@router.get("/{project_id}", response_model=List[RequirementStructure])
async def list_requirements(project_id: str,current_user: User = Depends(get_current_user), _=Depends(get_db)):
    project = await get_project_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not await isAllowed(current_user.get("id"), project_id, "view_requirements"):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return await list_by_project(project_id)


@router.put("/{project_id}/{doc_id}", response_model=RequirementStructure)
async def update_requirement(project_id: str, doc_id: str, payload: RequirementStructure, current_user: User = Depends(get_current_user), _=Depends(get_db)):
    project = await get_project_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not await isAllowed(current_user.get("id"), project_id, "edit_requirements"):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    print("Payload received for update:", payload)
    updated = await update(project_id,payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Requirement not found")
    await broadcast_crud_event(str(project_id), "requirements", "update", "requirements", updated if isinstance(updated, dict) else (updated.model_dump() if hasattr(updated, "model_dump") else {"id": str(doc_id)}))
    return updated


@router.delete("/{project_id}/{doc_id}")
async def delete_requirement(project_id: str, doc_id: str, current_user: User = Depends(get_current_user), _=Depends(get_db)):
    project = await get_project_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not await isAllowed(current_user.get("id"), project_id, "delete_requirements"):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    deleted = await remove(project_id, doc_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Requirement not found")
    await broadcast_crud_event(str(project_id), "requirements", "delete", "requirements", {"id": str(doc_id)})
    return {"deleted": True}
