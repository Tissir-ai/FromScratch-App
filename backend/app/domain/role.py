from pydantic import BaseModel
from uuid import UUID, uuid4
from typing import List

class Role(BaseModel):
    id: UUID = uuid4()
    name: str  # e.g., admin, dev, designer
    permissions: List[str] = []  # e.g., ["edit_diagrams", "view_tasks"]

class Member(BaseModel):
    user_id: UUID
    role_id: UUID | None = None  # If None, default to guest

class RoleDomain(BaseModel):
    id: UUID = uuid4()
    project_id: UUID
    roles: List[Role] = []
    members: List[Member] = []

    class Config:
        orm_mode = True
