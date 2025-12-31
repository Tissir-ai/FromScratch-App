from beanie import Document, PydanticObjectId
from pydantic import Field
from datetime import datetime


class User(Document):
    id:  PydanticObjectId = Field(default_factory=PydanticObjectId, alias="_id")
    info_id: str 
    name: str
    project_id: PydanticObjectId 
    role_id: PydanticObjectId | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    class Settings:
        name = "users"
