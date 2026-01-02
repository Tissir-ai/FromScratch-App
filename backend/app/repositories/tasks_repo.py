from typing import List
from beanie import PydanticObjectId
from app.domain.task import TaskDomain as Task, TaskStructure
from datetime import datetime


async def create_task(task: Task) -> Task:
    return await task.insert()


async def get_task_Container_by_project(
    project_id: str | PydanticObjectId,
) -> Task | None:
    try:
        pid = (
            PydanticObjectId(project_id) if isinstance(project_id, str) else project_id
        )
    except Exception:
        print("Invalid project id:", project_id)
        return None
    task = await Task.find_one(Task.project_id == pid)
    return task


async def get_tasks_by_project(
    project_id: str | PydanticObjectId,
) -> List[TaskStructure]:
    try:
        pid = (
            PydanticObjectId(project_id) if isinstance(project_id, str) else project_id
        )
    except Exception:
        print("Invalid project id:", project_id)
        return []
    task = await Task.find_one(Task.project_id == pid)
    if not task:
        return []

    def _key(item: TaskStructure):
        updated = getattr(item, "updated_at", None)
        created = getattr(item, "created_at", None)
        # normalize None to a very old datetime so sorting works
        if updated is None:
            updated = created or datetime.min
        if created is None:
            created = updated or datetime.min
        return (updated, created)

    return sorted(list(task.data), key=_key, reverse=True)


async def get_today_tasks(project_id: str) -> List[TaskStructure]:
    # Return all tasks for the overview page - it will show the first 3
    # This fixes the issue where overview shows "No tasks for today" even when there are tasks
    tasks = await get_tasks_by_project(project_id)
    return tasks


async def get_task_by_id(doc_id: str) -> Task | None:
    return await Task.get(doc_id)


async def get_task_item_by_id(
    project_id: str | PydanticObjectId, item_id: str
) -> TaskStructure | None:
    """Get an item inside the project's Task document by its item id."""
    try:
        pid = (
            PydanticObjectId(project_id) if isinstance(project_id, str) else project_id
        )
    except Exception:
        print("Invalid project id:", project_id)
        return None
    doc = await Task.find_one(Task.project_id == pid)
    if not doc:
        return None
    for item in doc.data:
        if str(item.id) == item_id:
            return item
    return None


async def update_task_item(
    project_id: str | PydanticObjectId, data: TaskStructure
) -> TaskStructure | None:
    """Update an item inside the project's Diagram document and persist it."""
    try:
        pid = (
            PydanticObjectId(project_id) if isinstance(project_id, str) else project_id
        )
    except Exception:
        print("Invalid project id:", project_id)
        return None
    doc = await Task.find_one(Task.project_id == pid)
    if not doc:
        return None
    for idx, item in enumerate(doc.data):
        print("Updating task item:", item.id , "with data:", data.id)
        if  item.id == data.id:
            doc.data[idx] = data
            await doc.save()
            return data
    return None



async def delete_task(doc_id: str) -> Task | None:
    doc = await Task.get(doc_id)
    if doc:
        await doc.delete()
    return doc


async def remove_task_item(
    project_id: str | PydanticObjectId, doc_id: str
) -> TaskStructure | None:
    """Remove an item inside the project's Task document and persist it."""
    try:
        pid = (
            PydanticObjectId(project_id) if isinstance(project_id, str) else project_id
        )
    except Exception:
        print("Invalid project id:", project_id)
        return None
    doc = await Task.find_one(Task.project_id == pid)
    if not doc:
        return None
    for idx, item in enumerate(doc.data):
        if str(item.id) == doc_id:
            deleted_item = doc.data.pop(idx)
            await doc.save()
            return deleted_item
    return None
