from uuid import UUID
from typing import List
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
from app.repositories.users_repo import get_user

async def create(project_id: str, payload: TaskStructure) -> TaskStructure:
    task = await get_task_Container_by_project(project_id)
    if not task:
        task = TaskDomain(
            project_id=project_id,
            data=[payload]
        )
    else:
        task.data.append(payload)

    await task.save()    
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
        if user:
            result.append({
                "task": task,
                "user": user
            })
    return result


async def get_by_id(doc_id: str) -> TaskDomain | None:
    return await get_task_by_id(doc_id)


async def update(project_id: str, data: object) -> TaskStructure | None:
    # Accept dicts or TaskStructure instances (e.g., payload from FastAPI)
    if isinstance(data, dict):
        # Support either 'id' or '_id' keys in incoming dict
        item_id = data.get("id") or data.get("_id")
        try:
            data_obj = TaskStructure(**data)
        except Exception:
            # If the payload is malformed, abort
            return None
    else:
        item_id = getattr(data, "id", None)
        data_obj = data

    if not item_id:
        return None

    old_task = await get_task_item_by_id(project_id, str(item_id))
    if not old_task:
        return None

    if getattr(data_obj, "assignee_id", None) != getattr(old_task, "assignee_id", None):
        print("Sending email notification for assignee change...")
        user = await get_user(getattr(data_obj, "assignee_id", None))
        # send email only if the user has an email address
        if user and getattr(user, "id", None) != data_obj.assignee_id:
            await send_task_assignment_email(data_obj)
            payload = data_obj.model_dump()
            payload.pop("user", None)
            newTask = TaskStructure(**payload)
            return await update_task_item(project_id, newTask)
    return await update_task_item(project_id, data_obj)


async def remove(project_id: str, doc_id: str) -> TaskStructure | None:
    return await remove_task_item(project_id, doc_id)