from fastapi import APIRouter, Depends, HTTPException
from typing import List
from uuid import UUID
from app.api.deps import get_db
from app.services.role_service import create, list_by_project, get_by_id, update, remove
from app.domain.role import RoleDomain


router = APIRouter(prefix="/v1/roles", tags=["roles"])


@router.post("/{project_id}", response_model=RoleDomain)
async def create_role(project_id: UUID, payload: RoleDomain, _=Depends(get_db)):
    role = await create(project_id, payload)
  
    return role


@router.get("/{project_id}", response_model=List[RoleDomain])
async def list_roles(project_id: UUID, _=Depends(get_db)):
    return await list_by_project(project_id)


@router.put("/{project_id}/{doc_id}", response_model=RoleDomain)
async def update_role(project_id: UUID, doc_id: UUID, payload: dict, _=Depends(get_db),):
    updated = await update(doc_id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Role not found")
   
    return updated


@router.delete("/{project_id}/{doc_id}")
async def delete_role(project_id: UUID, doc_id: UUID, _=Depends(get_db)):
    deleted = await remove(doc_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Role not found")
    
    return {"deleted": True}
