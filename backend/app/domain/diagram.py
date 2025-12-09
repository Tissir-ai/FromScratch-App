from pydantic import BaseModel, Field
from uuid import UUID, uuid4
from datetime import datetime
from typing import List, Dict, Any

class DiagramStructure(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    activeUsers: List[UUID] = Field(default_factory=list)
    title: str
    type: str  # e.g., flowchart, class, sequence
    nodes: List[Dict[str, Any]]  # JSON structure => Components
    edges: List[Dict[str, Any]]  # JSON structure => Connections
    created_at: datetime = Field(default_factory=datetime.utcnow)

class DiagramDomain(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    project_id: UUID
    data: List[DiagramStructure] = Field(default_factory=list)

    class Config:
        orm_mode = True
