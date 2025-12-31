from uuid import UUID
from typing import List

from app.domain.user import User

from app.repositories.users_repo import (
    create_user,
    list_users,
    get_user,
    update_user,
    delete_user,
    assign_role,
    get_user_by_info_id,
    get_users_by_project
)
from app.repositories.roles_repo import get_role_by_id
from app.repositories.projects_repo import get_project as get_project_by_id
from app.services.role_service import user_has_permission


async def create(payload: User) -> User:
    return await create_user(payload)


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
                "name": u.name,
                "role": role_label,
                "team": "--" if role_label in ("guest", "owner") else role_name_lower,
            })
    return members_info

async def isAllowed(info_id: str, project_id: str,permission: str) -> User | None:
    user = await get_user_by_info_id(info_id)
    if not user:
        return None
    project = await get_project_by_id(project_id)
    if not project:
        return None
    print("Checking permission", user.id, project.id, permission)
    return await user_has_permission(user, project, permission)
    
async def update(user_id: str, data: dict) -> User | None:
    return await update_user(user_id, data)


async def remove(user_id: str) -> User | None:
    return await delete_user(user_id)

async def set_role(user_id: str, role_id: str) -> User | None:
    """Assign a role to a user (used by project owner when inviting members)."""
    return await assign_role(user_id, role_id)
