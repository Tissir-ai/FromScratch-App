from sqlmodel import Session
from app.repositories import project_repo, artifact_repo, run_repo

def create_project(session: Session, name: str, description: str=""):
    return project_repo.create_project(session, name, description)

def get_project(session: Session, pid: int):
    return project_repo.get_project(session, pid)

def list_projects(session: Session):
    return project_repo.list_projects(session)

def list_artifacts(session: Session, project_id: int):
    return artifact_repo.list_artifacts(session, project_id)

def create_run(session: Session, project_id: int):
    return run_repo.create_run(session, project_id)
