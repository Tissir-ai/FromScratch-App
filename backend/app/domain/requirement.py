from beanie import Document , PydanticObjectId
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List

class RequirementStructure(BaseModel):
    id:  PydanticObjectId = Field(default_factory=PydanticObjectId, alias="_id")
    title: str
    category: str 
    description: str | None = None
    content: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)   
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class RequirementDomain(Document):
    id:  PydanticObjectId = Field(default_factory=PydanticObjectId, alias="_id")
    project_id: PydanticObjectId
    data: List[RequirementStructure] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "requirements"
