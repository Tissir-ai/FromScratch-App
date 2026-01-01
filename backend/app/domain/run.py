from beanie import Document
from pydantic import Field
from uuid import UUID, uuid4
from datetime import datetime
from typing import Dict, Any, Optional

class RunDomain(Document):
    """
    MongoDB Document pour suivre l'exécution du pipeline d'agents.
    Remplace le modèle SQL Run pour compatibilité MongoDB.
    """
    id: UUID = Field(default_factory=uuid4)
    project_id: str  # store project ObjectId/UUID as string to align with caller payloads
    status: str = "queued"  # queued | running | succeeded | failed
    
    # État du pipeline avec contenu JSON
    # Structure: {
    #   "requirements_content": "markdown...",
    #   "diagrams_content": "markdown...",
    #   "diagrams_json_content": {...},
    #   "planner_content": "markdown...",
    #   "export_content": "markdown...",
    #   "blueprint_markdown": "markdown..."
    # }
    state: Dict[str, Any] = Field(default_factory=dict)
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "runs"
        indexes = [
            "project_id",
            "status",
            "created_at"
        ]

    async def update_state(self, new_state: Dict[str, Any]):
        """Helper pour mettre à jour l'état et la date de modification"""
        self.state.update(new_state)
        self.updated_at = datetime.utcnow()
        await self.save()

    async def update_status(self, new_status: str):
        """Helper pour mettre à jour le statut"""
        self.status = new_status
        self.updated_at = datetime.utcnow()
        await self.save()
