from uuid import UUID
from typing import List

from app.domain.role import RoleDomain
from app.domain.user import User
from app.domain.project import Project
import asyncio
from app.repositories.users_repo import get_users_by_role
from app.core.observability import logger
from app.repositories.roles_repo import (
    create_role,
    get_roles_by_project,
    get_role_by_id,
    update_role,
    delete_role,
)


async def get_roles_info_by_project(project_id: str) -> List[dict] | None:
    roles = await get_roles_by_project(project_id)
    result = []
    if roles:
        for role in roles:
            name = (getattr(role, "name", "") or "").lower()
            if name in ("guest", "owner"):
                continue
            users = await get_users_by_role(role.id)
            result.append({"name": role.name, "users_count": len(users) if users else 0})
    return result
    

async def create(project_id: UUID, payload: RoleDomain) -> RoleDomain:
    """Create a role scoped to a specific project."""
    payload.project_id = project_id
    return await create_role(payload)


async def list_by_project(project_id: UUID) -> List[RoleDomain]:
    return await get_roles_by_project(project_id)


async def get_by_id(doc_id: UUID) -> RoleDomain | None:
    return await get_role_by_id(doc_id)


async def update(doc_id: UUID, data: dict) -> RoleDomain | None:
    return await update_role(doc_id, data)


async def remove(doc_id: UUID) -> RoleDomain | None:
    return await delete_role(doc_id)


async def user_has_permission(user: User, project: Project, permission: str) -> bool:
    """Return True if the given user can perform an action on the project.

    Rules:
    - User must be a member of the project to have any permissions.
    - User's role must belong to the same project and contain the permission string.
    """
    # Safely obtain ids and lists
    user_id = getattr(user, "id", None)
    project_members = getattr(project, "members", []) or []

    logger.debug("permission check start", extra={
        "user_id": str(user_id),
        "project_id": str(getattr(project, 'id', '')),
        "permission": permission,
        "members_count": len(project_members),
    })

    # If either is missing, user does not have permissions
    if not user_id or not project_members:
        logger.debug("permission denied: missing user_id or project_members", extra={"user_id":str(user_id)})
        return False

    # Compare by string to avoid ObjectId type mismatches
    member_ids = {str(m) for m in project_members}
    if str(user_id) not in member_ids:
        logger.debug("permission denied: user not in project members", extra={"user_id":str(user_id)})
        return False

    # Look up the user's role
    role_id = getattr(user, "role_id", None)
    if not role_id:
        logger.debug("permission denied: user has no role_id", extra={"user_id":str(user_id)})
        return False

    role = await get_role_by_id(role_id)
    if not role:
        logger.debug("permission denied: role not found", extra={"role_id":str(role_id)})
        return False

    # Ensure role belongs to the same project
    role_project_id = getattr(role, "project_id", "")
    if str(role_project_id) != str(getattr(project, "id", "")):
        logger.debug("permission denied: role belongs to different project", extra={"role_id":str(role_id), "role_project_id":str(role_project_id), "project_id":str(getattr(project,'id',''))})
        return False

    # Finally, check permissions
    permissions = getattr(role, "permissions", []) or []
    result = bool(permission in permissions)
    logger.debug("permission check result", extra={"user_id":str(user_id), "permission":permission, "allowed":result, "role_permissions":permissions})
    return result
