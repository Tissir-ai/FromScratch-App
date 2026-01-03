from beanie import Document, PydanticObjectId
from pydantic import Field
from datetime import datetime


class Project(Document):
    id:  PydanticObjectId = Field(default_factory=PydanticObjectId, alias="_id")
    name: str
    description: str | None = None
    full_description: str | None = None
    created_by: str
    members: list[PydanticObjectId] = Field(default_factory=list)  # List of user IDs
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Linked domain IDs
    tasks_id:  PydanticObjectId | None = None
    diagrams_id: PydanticObjectId | None = None
    requirements_id: PydanticObjectId | None = None
    logs_id: PydanticObjectId | None = None
    planners_id: PydanticObjectId | None = None
    chats_id: PydanticObjectId | None = None
    class Settings:
        name = "projects"
