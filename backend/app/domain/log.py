from pydantic import BaseModel
from uuid import UUID, uuid4
from datetime import datetime
from typing import List

class LogEntry(BaseModel):
    id: UUID = uuid4()
    message: str
    user_id: UUID | None = None
    timestamp: datetime = datetime.utcnow()

class LogDomain(BaseModel):
    id: UUID = uuid4()
    project_id: UUID
    data: List[LogEntry] = []

    class Config:
        orm_mode = True
