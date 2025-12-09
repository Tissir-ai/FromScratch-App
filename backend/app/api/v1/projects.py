from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from pydantic import BaseModel
from app.api.deps import get_db
from app.services import projects_service

router = APIRouter(prefix="/v1/projects", tags=["projects"])

class ProjectIn(BaseModel):
    name: str
    description: str = ""

@router.post("")
def create_project(payload: ProjectIn, session: Session = Depends(get_db)):
    return projects_service.create_project(session, payload.name, payload.description)

@router.get("")
def list_projects(session: Session = Depends(get_db)):
    return projects_service.list_projects(session)

@router.get("/{project_id}")
def get_project(project_id: int, session: Session = Depends(get_db)):
    p = projects_service.get_project(session, project_id)
    if not p:
        raise HTTPException(404, "Project not found")
    return p

@router.get("/{project_id}/artifacts")
def list_artifacts(project_id: int, session: Session = Depends(get_db)):
    return projects_service.list_artifacts(session, project_id)
