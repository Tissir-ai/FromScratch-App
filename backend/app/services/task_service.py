from uuid import UUID
from typing import List, Optional
import httpx
import os
from app.domain.task import TaskDomain, TaskStructure
from app.repositories.tasks_repo import (
    get_task_item_by_id,
    create_task,
    get_task_Container_by_project,
    get_tasks_by_project,
    get_task_by_id,
    update_task_item,
    remove_task_item,
)
from app.services.email_service import send_task_assignment_email
from app.repositories.users_repo import get_user, get_user_by_info_id


async def _get_user_email_from_auth(info_id: str) -> Optional[str]:
    """Fetch user email from auth service using info_id

    Note: The auth service endpoint requires authentication. For internal service calls,
    we may need to use a service token or modify the auth service to allow internal calls.
    """
    try:
        auth_url = os.environ.get("AUTH_SERVICE_URL", "http://auth:4000")
        # TODO: Add service token or internal auth bypass for service-to-service calls
        headers = {}
        # For now, try without auth - if it fails, we'll need to add service token
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(
                f"{auth_url}/api/user/{info_id}", headers=headers, follow_redirects=True
            )
            if response.status_code == 200:
                data = response.json()
                # Auth service returns { user: {...} }
                user = data.get("user", {})
                return user.get("email")
            elif response.status_code == 401:
                print(
                    f"Authentication required for auth service call - need service token"
                )
            else:
                print(f"Auth service returned status {response.status_code}")
    except httpx.TimeoutException:
        print(f"Timeout fetching user email from auth service for info_id: {info_id}")
    except Exception as e:
        print(f"Failed to fetch user email from auth service: {e}")
    return None


async def _format_task_for_email(task: TaskStructure) -> Optional[dict]:
    """Format task data for email notification with user email from auth service"""
    assignee_id = getattr(task, "assignee_id", None)
    if not assignee_id:
        return None

    # Get user from backend MongoDB (has info_id)
    user = await get_user(assignee_id)
    if not user:
        return None

    # Fetch email from auth service using info_id
    email = await _get_user_email_from_auth(user.info_id)
    if not email:
        print(f"No email found for user with info_id: {user.info_id}")
        return None

    # Parse name into first and last name
    name_parts = (user.name or "").split(" ", 1)
    first_name = name_parts[0] if name_parts else ""
    last_name = name_parts[1] if len(name_parts) > 1 else ""

    return {
        "title": getattr(task, "title", "Task"),
        "description": getattr(task, "description", ""),
        "due_date": getattr(task, "due_date", None),
        "user": {
            "email": email,
            "first_name": first_name,
            "last_name": last_name,
        },
    }


async def create(project_id: str, payload: TaskStructure) -> TaskStructure:
    task = await get_task_Container_by_project(project_id)
    if not task:
        task = TaskDomain(project_id=project_id, data=[payload])
    else:
        task.data.append(payload)

    await task.save()

    # Send email notification if task has an assignee
    if getattr(payload, "assignee_id", None):
        print("Sending email notification for new task assignment...")
        email_data = await _format_task_for_email(payload)
        if email_data:
            await send_task_assignment_email(email_data)

    # Return the persisted item (may have server-side defaults such as object id / timestamps)
    return task.data[-1]


async def list_by_project(project_id: str) -> List[dict]:
    tasks = await get_tasks_by_project(project_id)
    if not tasks:
        return []
    result = []
    for task in tasks:
        # tasks are TaskStructure instances; the assignee field is `assignee_id`.
        user = await get_user(getattr(task, "assignee_id", None))
        # Include all tasks, even those without assignees
        result.append({"task": task, "user": user})
    return result


async def get_by_id(doc_id: str) -> TaskDomain | None:
    return await get_task_by_id(doc_id)


async def update(project_id: str, data: TaskStructure) -> TaskStructure | None:
    # Accept TaskStructure instance from FastAPI
    item_id = getattr(data, "id", None) or getattr(data, "_id", None)

    if not item_id:
        return None

    old_task = await get_task_item_by_id(project_id, str(item_id))
    if not old_task:
        return None

    # Check for assignee changes
    if getattr(data, "assignee_id", None) != getattr(old_task, "assignee_id", None):
        print("Sending email notification for assignee change...")
        email_data = await _format_task_for_email(data)
        if email_data and email_data["user"]["email"]:
            await send_task_assignment_email(email_data)

    return await update_task_item(project_id, data)


async def remove(project_id: str, doc_id: str) -> TaskStructure | None:
    return await remove_task_item(project_id, doc_id)
