from beanie import Document , PydanticObjectId
from pydantic import BaseModel, Field
from uuid import UUID, uuid4
from datetime import datetime
from typing import List

class LogEntry(BaseModel):
    id:  PydanticObjectId = Field(default_factory=PydanticObjectId, alias="_id")
    message: str
    user_id:  PydanticObjectId | None = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class LogDomain(Document):
    id:  PydanticObjectId = Field(default_factory=PydanticObjectId, alias="_id")
    project_id: PydanticObjectId
    data: List[LogEntry] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "logs"
