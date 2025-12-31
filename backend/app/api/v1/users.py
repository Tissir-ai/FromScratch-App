from fastapi import APIRouter, Depends, HTTPException
from typing import List
from uuid import UUID
from app.api.deps import get_db, get_current_user
from app.services.user_service import create, list_all, get_by_id, update, remove, set_role
from app.services.role_service import get_by_id as get_role_by_id, user_has_permission
from app.services.project_service import get_by_id as get_project_by_id
from app.domain.user import User
from pydantic import BaseModel
from uuid import UUID as _UUID

router = APIRouter(prefix="/v1/users", tags=["users"])


@router.post("/", response_model=User)
async def create_user(payload: User, _=Depends(get_db)):
    user = await create(payload)
    return user


@router.get("/", response_model=List[User])
async def users(_=Depends(get_db)):
    return await list_all()


@router.get("/{user_id}", response_model=User)
async def get_user(user_id: UUID, _=Depends(get_db)):
    u = await get_by_id(user_id)
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    return u


@router.put("/{user_id}", response_model=User)
async def update_user(user_id: UUID, payload: dict, _=Depends(get_db)):
    updated = await update(user_id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return updated


@router.delete("/{user_id}")
async def delete_user(user_id: UUID, _=Depends(get_db)):
    deleted = await remove(user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="User not found")
    return {"deleted": True}


class RoleAssignPayload(BaseModel):
    role_id: _UUID


@router.put("/{user_id}/role", response_model=User)
async def assign_role_to_user(user_id: UUID, payload: RoleAssignPayload, current_user: User = Depends(get_current_user), _=Depends(get_db)):
    # Load role to determine its project scope
    role = await get_role_by_id(payload.role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    project = await get_project_by_id(role.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found for role")

    if not await user_has_permission(current_user, project, "manage_project"):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    updated = await set_role(user_id, payload.role_id)
    if not updated:
        raise HTTPException(status_code=404, detail="User not found or could not assign role")
    return updated
