from uuid import UUID
from typing import List
from beanie import PydanticObjectId

from app.domain.user import User
from app.domain.invitation import ProjectInvitation

from app.repositories.users_repo import (
    create_user,
    list_users,
    get_user,
    update_user,
    delete_user,
    set_role,
    get_user_by_info_id,
    get_user_by_id,
    get_user_by_info_id_and_projectId,
    get_users_by_project
)
from app.repositories.roles_repo import get_role_by_id, get_roles_by_project
from app.repositories.invitations_repo import (
    create_invitation,
    get_invitation_by_email_and_project,
    get_invitation_by_token,
    update_invitation_status,
    get_invitation_by_id
)
from app.repositories.projects_repo import get_project as get_project_by_id, add_member
from app.services.role_service import user_has_permission
from app.services.email_service import send_invitation_email
from app.utils.jwt_helper import generate_invitation_token
from app.core.config import Settings
from app.core.observability import logger

settings = Settings()


async def create(payload: User) -> User:
    return await create_user(payload)

async def invite_user(project_id: str, payload: object) -> dict:
    """Send invitation email to user with 5-day expiring token."""
    # Extract email from payload
    email = payload.get("email") if isinstance(payload, dict) else getattr(payload, "email", None)
    info_id = payload.get("info_id") if isinstance(payload, dict) else getattr(payload, "info_id", None)
    if not email:
        raise ValueError("Email is required to send invitation")
    if not info_id:
        raise ValueError("Info ID is required to send invitation")
    # Check if user already invited
    existing_invitation = await get_invitation_by_email_and_project(email, project_id)
    if existing_invitation:
        return {"message": "User already invited to this project", "status": "already_invited"}
    
    # Check if user already a member
    user = await get_user_by_info_id_and_projectId(info_id, project_id)
    if user:
        return {"message": "User already a member of the project", "status": "already_member"}
    
    # Get project details
    project = await get_project_by_id(project_id)
    if not project:
        raise ValueError("Project not found")
    
    # Generate invitation token
    token, expires_at = generate_invitation_token(email, info_id, project_id)
    
    # Create invitation record
    invitation = ProjectInvitation(
        project_id=PydanticObjectId(project_id),
        email=email,
        token=token,
        expires_at=expires_at,
        status="pending"
    )
    await create_invitation(invitation)
    
    # Send invitation email
    try:
        email_sent = await send_invitation_email(
            recipient_email=email,
            project_name=project.name,
            invitation_token=token,
            frontend_url=settings.frontend_url
        )
        
        if email_sent:
            logger.info(f"Invitation sent successfully to {email} for project {project_id}")
            return {
                "message": "Invitation sent successfully",
                "status": "sent",
                "email": email,
                "expires_at": expires_at.isoformat()
            }
        else:
            logger.error(f"Failed to send invitation email to {email}")
            return {
                "message": "Failed to send invitation email",
                "status": "email_failed"
            }
    except Exception as e:
        logger.error(f"Error sending invitation: {str(e)}")
        raise ValueError(f"Failed to send invitation: {str(e)}")
    
async def list_all() -> List[User]:
    return await list_users()

async def get_by_id(user_id: str) -> User | None:
    return await get_user(user_id)

async def get_members_info(project_id: str) -> List[dict]:
    users = await get_users_by_project(project_id)
    members_info = []
    if users:
        for u in users:
            role = await get_role_by_id(u.role_id)
            role_name_lower = (role.name.lower() if role and getattr(role, "name", None) else "")
            # guest if role is missing or has no permissions, owner if role name is 'owner', otherwise member
            role_perms = getattr(role, "permissions", None)
            if not role or not role_perms:
                role_label = "guest"
            elif role_name_lower == "owner":
                role_label = "owner"
            else:
                role_label = "member"

            members_info.append({
                "id": str(u.id) or str(u._id),
                "name": u.name,
                "info_id": u.info_id,
                "role": role_label,
                "team": "--" if role_label in ("guest", "owner") else role_name_lower,
            })
    return members_info
async def get_member_info_by_id(user_id: str) -> dict | None:
    user = await get_user_by_id(user_id)
    if user:
        role = await get_role_by_id(user.role_id)
        role_name_lower = (role.name.lower() if role and getattr(role, "name", None) else "")
        # guest if role is missing or has no permissions, owner if role name is 'owner', otherwise member
        role_perms = getattr(role, "permissions", None)
        if not role or not role_perms:
            role_label = "guest"
        elif role_name_lower == "owner":
            role_label = "owner"
        else:
            role_label = "member"

        return {
                "id": str(user.id) or str(user._id),
                "name": user.name,
                "info_id": user.info_id,
                "role": role_label,
                "team": "--" if role_label in ("guest", "owner") else role_name_lower,
            }
    return None
async def search_users_by_project(project_id: str, query: str, limit: int = 10) -> List[dict]:
    """Search users in a project by name or email."""
    from app.repositories.users_repo import search_users_by_project as repo_search_users

    users = await repo_search_users(project_id, query, limit)
    result = []

    for user in users:
        # Get role information
        role = await get_role_by_id(user.role_id) if user.role_id else None
        role_name_lower = (role.name.lower() if role and getattr(role, "name", None) else "")
        role_perms = getattr(role, "permissions", None)

        if not role or not role_perms:
            role_label = "guest"
        elif role_name_lower == "owner":
            role_label = "owner"
        else:
            role_label = "member"

        result.append({
            "id": str(user.id),
            "name": user.name,
            "email": getattr(user, "email", ""),
            "role": role_label,
            "team": "--" if role_label in ("guest", "owner") else role_name_lower,
        })

    return result

async def isAllowed(info_id: str, project_id: str,permission: str) -> User | None:
    user = await get_user_by_info_id_and_projectId(info_id, project_id)
    if not user:
        return None
    project = await get_project_by_id(project_id)
    if not project:
        return None
    print("Checking permission", user.id, project.id, permission)
    return await user_has_permission(user, project, permission)
    
async def update(user_id: str, data: dict) -> User | None:
    return await update_user(user_id, data)


async def remove(prject_id :str,user_id: str) -> User | None:
    user = await get_user(user_id)
    if user.project_id != prject_id:
        return None
    return await delete_user(user_id)

async def assign_role(Project_id: str, payload: object) -> User | None:
    # Support dict or Pydantic model payloads
    user_id = payload.get("user_id") if isinstance(payload, dict) else getattr(payload, "user_id", None)
    role_id = payload.get("role_id") if isinstance(payload, dict) else getattr(payload, "role_id", None)

    if not user_id or not role_id:
        return None

    user = await get_user(user_id)
    if not user:
        return None
    if str(user.project_id) != str(Project_id):
        return None
    role = await get_role_by_id(role_id)
    if not role:
        return None
    return await set_role(user.id, role.id)

async def get_user_permission_by_info_id(project_id: str, info_id: str) -> dict | None:
    user = await get_user_by_info_id_and_projectId(info_id, project_id)
    if not user:    
        return None
    if str(user.project_id) != str(project_id):
        return None
    role = await get_role_by_id(user.role_id)
    if not role:
        return None
    return role.permissions


async def accept_project_invitation(token: str, current_user: dict) -> dict:
    """Accept a project invitation and add user as Visitor."""
    from app.utils.jwt_helper import verify_invitation_token
    from datetime import datetime
    
    # Verify token
    payload = verify_invitation_token(token)
    if not payload:
        raise ValueError("Invalid or expired invitation token")
    
    email = payload.get("email")
    info_id = payload.get("info_id")
    project_id = payload.get("project_id")
    
    if not email or not info_id or not project_id:
        raise ValueError("Invalid invitation token payload")
    
    if info_id != current_user.get("id"):
        raise ValueError("Invitation token does not match the current user")
    
    # Get invitation record
    invitation = await get_invitation_by_token(token)
    if not invitation:
        raise ValueError("Invitation not found")
    
    # Check if already accepted
    if invitation.status == "accepted":
        return {
            "message": "Invitation already accepted",
            "status": "already_accepted"
        }
    
    # Check if expired
    if invitation.status == "expired" or invitation.expires_at < datetime.utcnow():
        await update_invitation_status(invitation, "expired")
        raise ValueError("Invitation has expired")
    
    # Get project
    project = await get_project_by_id(project_id)
    if not project:
        raise ValueError("Project not found")
    
    # Check if user already exists in this project
    existing_user = await get_user_by_info_id_and_projectId(info_id, project_id)
    if existing_user:
        # Mark invitation as accepted
        await update_invitation_status(invitation, "accepted")
        return {
            "message": "User already a member of the project",
            "status": "already_member",
            "project_id": project_id,
            "project_name": project.name
        }
    
    # Get Visitor role for this project
    roles = await get_roles_by_project(project_id)
    visitor_role = None
    for role in roles:
        if role.name.lower() == "guest":
            visitor_role = role
            break
    
    if not visitor_role:
        raise ValueError("Guest role not found for this project")
    
    # Create user with Guest role
    new_user = User(
        info_id= current_user.get("id"),
        name=current_user.get("name"),  # Use current user's name
        project_id=PydanticObjectId(project_id),
        role_id=visitor_role.id
    )
    created_user = await create_user(new_user)
    
    # Add user to project members
    await add_member(PydanticObjectId(project_id), created_user.id)
    
    # Mark invitation as accepted
    await update_invitation_status(invitation, "accepted")
    
    logger.info(f"User {email} accepted invitation and joined project {project_id} as Visitor")
    
    return {
        "message": "Invitation accepted successfully",
        "status": "accepted",
        "project_id": project_id,
        "project_name": project.name,
        "user_id": str(created_user.id),
        "role": "visitor"
    }


async def resend_project_invitation(invitation_id: str) -> dict:
    """Resend an expired or cancelled invitation with a new token."""
    from datetime import datetime
    
    # Get invitation
    invitation = await get_invitation_by_id(invitation_id)
    if not invitation:
        raise ValueError("Invitation not found")
    
    # Only allow resend for expired or cancelled invitations
    if invitation.status not in ["expired", "cancelled"]:
        raise ValueError(f"Cannot resend invitation with status: {invitation.status}")
    
    # Get project details
    project = await get_project_by_id(str(invitation.project_id))
    if not project:
        raise ValueError("Project not found")
    
    # Generate new token with 5-day expiry
    token, expires_at = generate_invitation_token(invitation.email, invitation.info_id, str(invitation.project_id))
    
    # Update invitation record
    invitation.token = token
    invitation.expires_at = expires_at
    invitation.status = "pending"
    invitation.updated_at = datetime.utcnow()
    await invitation.save()
    
    # Send invitation email
    try:
        email_sent = await send_invitation_email(
            recipient_email=invitation.email,
            project_name=project.name,
            invitation_token=token,
            frontend_url=settings.frontend_url
        )
        
        if email_sent:
            logger.info(f"Invitation resent successfully to {invitation.email} for project {invitation.project_id}")
            return {
                "message": "Invitation resent successfully",
                "status": "sent",
                "email": invitation.email,
                "expires_at": expires_at.isoformat()
            }
        else:
            logger.error(f"Failed to resend invitation email to {invitation.email}")
            return {
                "message": "Failed to resend invitation email",
                "status": "email_failed"
            }
    except Exception as e:
        logger.error(f"Error resending invitation: {str(e)}")
        raise ValueError(f"Failed to resend invitation: {str(e)}")
