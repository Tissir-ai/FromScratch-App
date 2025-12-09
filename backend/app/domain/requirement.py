from pydantic import BaseModel
from uuid import UUID, uuid4
from datetime import datetime
from typing import List

class RequirementStructure(BaseModel):
    id: UUID = uuid4()
    title: str
    description: str | None = None
    type: str  # epic, feature, user_story
    created_at: datetime = datetime.utcnow()

class RequirementDomain(BaseModel):
    id: UUID = uuid4()
    project_id: UUID
    data: List[RequirementStructure] = []

    class Config:
        orm_mode = True
