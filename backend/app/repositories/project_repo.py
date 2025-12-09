from sqlmodel import Session, select
from app.repositories.models import Project

def create_project(session: Session, name: str, description: str="") -> Project:
    p = Project(name=name, description=description)
    session.add(p); session.commit(); session.refresh(p)
    return p

def get_project(session: Session, pid: int) -> Project | None:
    return session.get(Project, pid)

def list_projects(session: Session):
    return session.exec(select(Project)).all()
