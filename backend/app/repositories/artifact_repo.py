from sqlmodel import Session, select
from app.repositories.models import Artifact

def add_artifact(session: Session, project_id: int, kind: str, uri: str, summary: str="") -> Artifact:
    a = Artifact(project_id=project_id, kind=kind, uri=uri, summary=summary)
    session.add(a); session.commit(); session.refresh(a)
    return a

def list_artifacts(session: Session, project_id: int):
    return session.exec(select(Artifact).where(Artifact.project_id==project_id)).all()
