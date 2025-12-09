from datetime import datetime
from sqlmodel import Session
from app.repositories.models import Run

def create_run(session: Session, project_id: int, state: str="REQUIREMENTS") -> Run:
    r = Run(project_id=project_id, state=state, status="queued")
    session.add(r); session.commit(); session.refresh(r)
    return r

def update_run(session: Session, run_id: int, **kwargs) -> Run:
    r = session.get(Run, run_id)
    for k,v in kwargs.items():
        setattr(r, k, v)
    r.updated_at = datetime.utcnow()
    session.add(r); session.commit(); session.refresh(r)
    return r

def get_run(session: Session, run_id: int) -> Run | None:
    return session.get(Run, run_id)
