from beanie import Document, PydanticObjectId
from pydantic import BaseModel, Field
from datetime import datetime, timezone
from typing import List

class TaskStructure(BaseModel):
    id:  PydanticObjectId = Field(default_factory=PydanticObjectId, alias="_id")
    title: str
    description: str | None = None
    assignee_id:  PydanticObjectId | None = None
    status: str = "backlog"  # backlog, todo, in-progress, review, done
    priority: str = "medium"  # low, medium, high, critical
    asign_date: datetime | None = None
    due_date: datetime | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
class TaskDomain(Document):
    id:  PydanticObjectId = Field(default_factory=PydanticObjectId, alias="_id")
    project_id: PydanticObjectId
    data: List[TaskStructure] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "tasks"
