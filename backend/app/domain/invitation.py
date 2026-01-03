"""Domain model for project invitations."""
from datetime import datetime
from beanie import Document, PydanticObjectId
from pydantic import Field


class ProjectInvitation(Document):
    """Represents a pending invitation to join a project."""
    
    id: PydanticObjectId = Field(default_factory=PydanticObjectId, alias="_id")
    project_id: PydanticObjectId
    email: str  # Email address of invited user
    token: str  # JWT token for accepting invitation
    expires_at: datetime  # Token expiration timestamp
    status: str = "pending"  # pending, accepted, expired, cancelled
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "project_invitations"
