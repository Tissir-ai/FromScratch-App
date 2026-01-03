"""Repository for managing project invitations."""
from typing import List
from datetime import datetime
from app.domain.invitation import ProjectInvitation
from beanie import PydanticObjectId


async def create_invitation(invitation: ProjectInvitation) -> ProjectInvitation:
    """Create a new project invitation."""
    return await invitation.insert()


async def get_invitation_by_token(token: str) -> ProjectInvitation | None:
    """Find invitation by token."""
    return await ProjectInvitation.find_one(ProjectInvitation.token == token)


async def get_invitation_by_email_and_project(email: str, project_id: str) -> ProjectInvitation | None:
    """Find pending invitation by email and project."""
    return await ProjectInvitation.find_one(
        ProjectInvitation.email == email,
        ProjectInvitation.project_id == PydanticObjectId(project_id),
        ProjectInvitation.status == "pending"
    )


async def get_pending_invitations_by_project(project_id: str) -> List[ProjectInvitation]:
    """Get all pending invitations for a project."""
    return await ProjectInvitation.find(
        ProjectInvitation.project_id == PydanticObjectId(project_id),
        ProjectInvitation.status == "pending"
    ).to_list()


async def get_all_invitations_by_project(project_id: str) -> List[ProjectInvitation]:
    """Get all invitations for a project (pending, accepted, expired, cancelled)."""
    return await ProjectInvitation.find(
        ProjectInvitation.project_id == PydanticObjectId(project_id)
    ).sort(-ProjectInvitation.created_at).to_list()


async def get_invitation_by_id(invitation_id: str) -> ProjectInvitation | None:
    """Find invitation by ID."""
    return await ProjectInvitation.get(invitation_id)


async def update_invitation_status(invitation: ProjectInvitation, status: str) -> ProjectInvitation:
    """Update invitation status (accepted, expired, cancelled)."""
    invitation.status = status
    invitation.updated_at = datetime.utcnow()
    await invitation.save()
    return invitation


async def delete_invitation(invitation_id: str) -> bool:
    """Delete an invitation."""
    invitation = await ProjectInvitation.get(invitation_id)
    if invitation:
        await invitation.delete()
        return True
    return False
