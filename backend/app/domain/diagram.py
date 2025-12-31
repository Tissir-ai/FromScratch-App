from beanie import Document, PydanticObjectId
from pydantic import BaseModel, Field
from uuid import UUID, uuid4
from datetime import datetime
from typing import List, Dict, Any

class DiagramStructure(BaseModel):
    id:  PydanticObjectId = Field(default_factory=PydanticObjectId, alias="_id")
    title: str
    type: str  # e.g., flowchart, class, sequence
    nodes: List[Dict[str, Any]]  # JSON structure => Components
    edges: List[Dict[str, Any]]  # JSON structure => Connections
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class DiagramDomain(Document):
    id:  PydanticObjectId = Field(default_factory=PydanticObjectId, alias="_id")
    project_id: PydanticObjectId
    data: List[DiagramStructure] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "diagrams"
