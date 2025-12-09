from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime

class Project(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Artifact(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(index=True)
    kind: str
    uri: str
    summary: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Run(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(index=True)
    status: str = Field(default="queued")  # queued|running|succeeded|failed
    state: str = Field(default="REQUIREMENTS")
    result_uri: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
