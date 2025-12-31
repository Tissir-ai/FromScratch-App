from uuid import UUID
from typing import List, Dict, Any

from app.repositories.chat_repo import (
    add_message,
    get_project_messages
)
from app.repositories.projects_repo import get_project
from app.services.user_service import get_by_id as get_user


async def send_message(
    project_id: UUID,
    user_id: UUID,
    content: str
) -> Dict[str, Any]:
    project = await get_project(project_id)
    if not project:
        raise ValueError("Project not found")

    if user_id not in project.members_id:
        raise ValueError("User is not a member of this project")

    # try to fetch user to get a name (fallback to id string)
    user = await get_user(user_id)
    name = str(user.id) if user else str(user_id)

    return await add_message(
        project_id=project_id,
        user_id=user_id,
        content=content,
        name=name,
    )


async def get_history(
    project_id: UUID,
    limit: int = 50,
    skip: int = 0
) -> List[Dict[str, Any]]:
    project = await get_project(project_id)
    if not project:
        raise ValueError("Project not found")

    return await get_project_messages(
        project_id=project_id,
        limit=limit,
        skip=skip
    )
