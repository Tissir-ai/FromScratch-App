from pydantic import BaseModel
from uuid import UUID, uuid4
from datetime import datetime
from Member import Member

class Project(BaseModel):
    id: UUID = uuid4()
    name: str
    description: str | None = None
    owner_id: Member  # User who created the project
    members: list[Member] = []  # List of members who are members of the project
    created_at: datetime = datetime.utcnow()

    # Linked domain IDs
    tasks_id: UUID
    diagrams_id: UUID
    requirements_id: UUID
    logs_id: UUID

    class Config:
        orm_mode = True
