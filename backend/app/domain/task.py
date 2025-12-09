from pydantic import BaseModel
from uuid import UUID, uuid4
from datetime import datetime
from typing import List
from pydantic import Field

class TaskStructure(BaseModel):
    id: UUID = uuid4()
    title: str
    description: str | None = None
    assignee_id: UUID | None = None
    status: str = "pending"  # pending, in_progress, done
    created_at: datetime = datetime.utcnow()
    due_date: datetime | None = None

class TaskDomain(BaseModel):
    id: UUID = uuid4()
    project_id: UUID
    activeUsers: List[UUID] = Field(default_factory=list)
    data: List[TaskStructure] = []

    class Config:
        orm_mode = True
