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
    return await User.find(User.project_id == project_id).to_list()

async def get_users_by_role(role_id: str) -> List[User] | None:
    return await User.find(User.role_id == role_id).to_list()

async def get_user_by_info_id(info_id: str) -> User | None:
    return await User.find_one(User.info_id == info_id)

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


async def assign_role(user_id: PydanticObjectId, role_id: PydanticObjectId) -> User | None:
    """Assign a role to a user (used when owner invites members and sets their role)."""
    user = await User.get(user_id)
    if not user:
        return None
    user.role_id = role_id
    await user.save()
    return user
