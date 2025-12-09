from fastapi import Depends
from app.repositories.session import get_session
from sqlmodel import Session

def get_db(session: Session = Depends(get_session)) -> Session:
    return session

def get_current_user():
    return {"sub": "demo", "role": "admin"}
