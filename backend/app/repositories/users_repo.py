from typing import List
from uuid import UUID
from app.domain.user import User
from beanie import PydanticObjectId


async def create_user(user: User) -> User:
    return await user.insert()


async def list_users() -> List[User]:
    return await User.find_all().to_list()


async def get_user(user_id: str) -> User | None:
    return await User.get(user_id)


async def get_users_by_project(project_id: str) -> List[User] | None:
    try:
        pid = (
            PydanticObjectId(project_id) if isinstance(project_id, str) else project_id
        )
    except Exception:
        print(f"Invalid project id: {project_id}")
        return []
    return await User.find(User.project_id == pid).to_list()


async def get_users_by_role(role_id: str) -> List[User] | None:
    return await User.find(User.role_id == role_id).to_list()


async def get_user_by_info_id(info_id: str) -> User | None:
    return await User.find_one(User.info_id == info_id)

async def get_user_by_info_id_and_projectId(info_id: str, project_id: str) -> User | None:
    try:
        pid = PydanticObjectId(project_id) if isinstance(project_id, str) else project_id
    except Exception:
        print(f"Invalid ids: info_id={info_id}, project_id={project_id}")
        return None
    return await User.find_one({"info_id": info_id, "project_id": pid})

async def update_user(user_id: str, data: dict) -> User | None:
    user = await User.get(user_id)
    if not user:
        return None
    for k, v in data.items():
        setattr(user, k, v)
    await user.save()
    return user


async def delete_user(user_id: str) -> User | None:
    user = await User.get(user_id)
    if user:
        await user.delete()
    return user


async def set_role(user_id: str, role_id: str) -> User | None:
    """Assign a role to a user (used when owner invites members and sets their role)."""
    user = await User.get(user_id)
    if not user:
        return None
    user.role_id = role_id
    await user.save()
    return user


async def search_users_by_project(
    project_id: str, query: str, limit: int = 10
) -> List[User]:
    """Search users in a project by name or email."""
    # Convert string project_id to PydanticObjectId
    try:
        pid = (
            PydanticObjectId(project_id) if isinstance(project_id, str) else project_id
        )
    except Exception:
        print(f"Invalid project id: {project_id}")
        return []

    # Use regex for case-insensitive search
    import re

    regex_pattern = re.compile(query, re.IGNORECASE)

    # First get all users in the project, then filter by regex
    # This is more reliable than complex MongoDB queries
    all_users = await User.find(User.project_id == pid).to_list()

    # Filter users whose name or email matches the query
    matching_users = []
    for user in all_users:
        name_match = user.name and regex_pattern.search(user.name)
        email_match = getattr(user, "email", "") and regex_pattern.search(
            getattr(user, "email", "")
        )

        if name_match or email_match:
            matching_users.append(user)

    # Limit results
    return matching_users[:limit]
