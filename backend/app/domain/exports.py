from beanie import Document, PydanticObjectId
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class DesignListItem(BaseModel):
    label: str
    description: Optional[str] = None

class DesignSection(BaseModel):
    title: str
    content: Optional[str] = None
    items: Optional[List[DesignListItem]] = []

class FunctionalDesignDocument(BaseModel):
    title: str
    description: Optional[str] = None

    overview: Optional[str] = None
    goals: Optional[List[DesignListItem]] = []
    scope_in: Optional[List[DesignListItem]] = []
    scope_out: Optional[List[DesignListItem]] = []

    sections: Optional[List[DesignSection]] = []

class GithubExport(BaseModel):
    repo_name: str
    branch: Optional[str] = "main"
    content : str  # Exported content

class ExportDomain(Document):
    id: PydanticObjectId = Field(default_factory=PydanticObjectId, alias="_id")

    project_id: PydanticObjectId
    
    document: Optional[FunctionalDesignDocument] = None

    github_access_token: Optional[str] = None
    github_export: List[GithubExport] = Field(default_factory=list)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "exports"
