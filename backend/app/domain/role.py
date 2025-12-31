from beanie import Document, PydanticObjectId
from pydantic import Field
from typing import List


class RoleDomain(Document):
    id:  PydanticObjectId = Field(default_factory=PydanticObjectId, alias="_id")
    project_id: PydanticObjectId  # Project this role belongs to
    name: str  # e.g., admin, dev, designer
    permissions: List[str] = Field(default_factory=list)  # e.g., ["edit_diagrams", "view_tasks"]

    class Settings:
        name = "roles"
