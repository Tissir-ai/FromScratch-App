from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.api.deps import get_db, get_current_user
from app.services.project_service import create_project_with_roles, list_for_user, get_by_id, delete as delete_project, load_overview
from app.services.user_service import isAllowed
router = APIRouter(prefix="/v1/projects", tags=["projects"])

class ProjectIn(BaseModel):
    name: str
    description: str = ""

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