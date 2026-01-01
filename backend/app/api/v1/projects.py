from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.api.deps import get_db, get_current_user
from app.services.project_service import create_project_with_roles, list_for_user, get_by_id, delete as delete_project, load_overview
from app.services.user_service import isAllowed, invite_user , remove as delete_user, assign_role , get_members_info , get_user_permission_by_info_id
router = APIRouter(prefix="/v1/projects", tags=["projects"])

class ProjectIn(BaseModel):
    name: str
    description: str = ""

class UserIn(BaseModel):
    name: str
    info_id: str

class UserRoleIn(BaseModel):
    user_id: str
    role_id: str

@router.post("")
async def create_project(payload: ProjectIn, current_user: object = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_db)):
    """Create a new project and assign default roles to the creator."""
    return await create_project_with_roles(payload, current_user)

@router.get("")
async def list_projects(current_user: object = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_db)):
    """Return projects where the current user is creator or a member."""
    return await list_for_user(current_user.get("id"))

@router.get("/{project_id}")
async def get_project_endpoint(project_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    p = await get_by_id(project_id)
    if not p:
        raise HTTPException(404, "Project not found")
    return p

@router.get("/{project_id}/members")
async def get_project_members(project_id: str, current_user: object = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_db)):
    p = await get_by_id(project_id)
    if not p:
        raise HTTPException(404, "Project not found")
    return await get_members_info(project_id)

@router.delete("/{project_id}")
async def delete_project_endpoint(project_id: str, current_user: object = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_db)):
    """Delete a project if the current user is the owner."""
    project = await get_by_id(project_id)   
    if not project:
        raise HTTPException(404, "Project not found")
    if project.created_by != current_user.get("id"):
        raise HTTPException(403, "Only the project owner can delete the project")
    return await delete_project(project)

@router.get("/{project_id}/owner")
async def get_project_owner(project_id: str, current_user: object = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_db)):
    """Get the owner of the project."""
    project = await get_by_id(project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    return project.created_by

@router.get("/{project_id}/overview")
async def get_project_overview(project_id: str, current_user: object = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_db)):
    """Get an overview of the project including counts of related entities."""
    project = await get_by_id(project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    if not await isAllowed(current_user.get("id"), project_id, "view_overview"):
        raise HTTPException(403, "Not enough permissions")
    data = await load_overview(project)
    if not data:
        raise HTTPException(500, "Could not load project overview")
    return data

@router.get("/{project_id}/user/{info_id}/permissions")
async def get_user_role_in_project(project_id: str, info_id: str, current_user: object = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_db)):
    """Get the role of a user in the specified project."""
    project = await get_by_id(project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    user_permissions = await get_user_permission_by_info_id(project_id, info_id)
    print("User permissions:", user_permissions)
    return user_permissions

@router.get("/{project_id}/users/search")
async def search_project_users(project_id: str, q: str = "", limit: int = 10, current_user: object = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_db)):
    """Search users in the project by name or email."""
    print(f"User search request: user_id={current_user.get('id')}, project_id={project_id}, query='{q}'")

    project = await get_by_id(project_id)
    if not project:
        raise HTTPException(404, "Project not found")

    permission_check = await isAllowed(current_user.get("id"), project_id, "view_overview")
    print(f"Permission check result: {permission_check}")

    if not permission_check:
        print("Permission denied for user search")
        raise HTTPException(403, "Not enough permissions")

    if not q or len(q.strip()) < 1:
        return []

    from app.services.user_service import search_users_by_project
    result = await search_users_by_project(project_id, q.strip(), limit)
    print(f"User search result: {len(result)} users found")
    return result

@router.post("/{project_id}/user/invite")
async def invite_user_to_project(project_id: str, payload: UserIn, current_user: object = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_db)):
    """Get an overview of the project including counts of related entities."""
    project = await get_by_id(project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    if not await isAllowed(current_user.get("id"), project_id, "manage_project"):
        raise HTTPException(403, "Not enough permissions")
    data = await invite_user(project_id, payload)
    if not data:
        raise HTTPException(500, "Error inviting user")
    return data

@router.post("/{project_id}/user/assign")
async def assign_user_role(project_id: str, payload: UserRoleIn, current_user: object = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_db)):
    """Get an overview of the project including counts of related entities."""
    project = await get_by_id(project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    if not await isAllowed(current_user.get("id"), project_id, "manage_project"):
        raise HTTPException(403, "Not enough permissions")
    data = await assign_role(project_id, payload)
    if not data:
        raise HTTPException(500, "Could not load project overview")
    return data

@router.delete("/{project_id}/user/{user_id}")
async def delete_user_from_project(project_id: str, user_id: str, current_user: object = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_db)):
    """Delete user from  project if the current user is the owner."""
    project = await get_by_id(project_id)   
    if not project:
        raise HTTPException(404, "Project not found")
    if not await isAllowed(current_user.get("id"), project_id, "manage_project"):
        raise HTTPException(403, "Not enough permissions")
    return await delete_user(project_id , user_id)