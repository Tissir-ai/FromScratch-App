from uuid import UUID
from typing import List, Optional
from datetime import datetime
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
from beanie import PydanticObjectId


async def create(project_id: str, payload: dict) -> TaskStructure:
    task = await get_task_Container_by_project(project_id)

    # helper to support dict payloads or objects with attributes
    def _get(key):
        return payload.get(key) if isinstance(payload, dict) else getattr(payload, key, None)

    def _set(key, value):
        if isinstance(payload, dict):
            payload[key] = value
        else:
            setattr(payload, key, value)

    assignee_id = _get("assignee_id")
    if isinstance(assignee_id, str):
        try:
            assignee_id = PydanticObjectId(assignee_id)
        except Exception:
            # if conversion fails, keep original value (validation can catch invalid ids)
            pass
        _set("assignee_id", assignee_id)

    newTask = TaskStructure(
        title=_get("title"),
        description=_get("description"),
        assignee_id=assignee_id,
        status=_get("status"),
        priority=_get("priority"),
        due_date=_get("due_date"),
        asign_date=_get("asign_date") if assignee_id else None,
    )

    if not task:
        task = TaskDomain(project_id=project_id, data=[newTask])
    else:
        task.data.append(newTask)

    await task.save()

    # Send email notification if task has an assignee
    if _get("assignee_id"):
        print("Sending email notification for new task assignment...")
        await send_task_assignment_email(payload)

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


async def update(project_id: str, payload: dict) -> TaskStructure | None:
    """Update a task using the same payload shape as `create`.
    Accepts a dict (or object with attributes) that contains the task fields
    including `id`/`_id`, `title`, `description`, `assignee_id`, `status`,
    `priority`, `due_date`, and optional `asign_date`.
    """
    # helpers to support dict payloads or objects with attributes
    def _get(key):
        return payload.get(key) if isinstance(payload, dict) else getattr(payload, key, None)

    def _set(key, value):
        if isinstance(payload, dict):
            payload[key] = value
        else:
            setattr(payload, key, value)

    item_id =  _get("id")
    if not item_id:
        return None
    old_task = await get_task_item_by_id(project_id, item_id)
    if not old_task:
        return None

    # Normalize assignee id (allow string -> PydanticObjectId) to match create()
    assignee_id = _get("assignee_id")
    if isinstance(assignee_id, str):
        try:
            assignee_id = PydanticObjectId(assignee_id)
        except Exception:
            pass
        _set("assignee_id", assignee_id)

    updated_task = TaskStructure(
        _id=PydanticObjectId(_get('id')),
        title=_get("title") if _get("title") is not None else old_task.title,
        description=_get("description") if _get("description") is not None else old_task.description,
        assignee_id= assignee_id if assignee_id else None,
        status=_get("status") if _get("status") is not None else old_task.status,
        priority=_get("priority") if _get("priority") is not None else old_task.priority,
        asign_date=old_task.asign_date if assignee_id == str(old_task.assignee_id) else datetime.utcnow(),
        due_date=_get("due_date") if _get("due_date") is not None else old_task.due_date,
        created_at=old_task.created_at,
        updated_at=datetime.utcnow(),
    )
    saved = await update_task_item(project_id, updated_task)

    # If assignee changed and we have a new assignee, trigger notification
    if saved and old_task.assignee_id != saved.assignee_id and saved.assignee_id:
        print("Sending email notification for updated task assignment...")
        await send_task_assignment_email(payload)

    return saved


async def remove(project_id: str, doc_id: str) -> TaskStructure | None:
    return await remove_task_item(project_id, doc_id)
