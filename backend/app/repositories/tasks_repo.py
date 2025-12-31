from typing import List
from beanie import PydanticObjectId
from app.domain.task import TaskDomain as Task, TaskStructure



async def create_task(task: Task) -> Task:
    return await task.insert()


async def get_tasks_by_project(project_id: str) -> List[TaskStructure] | None:
    tasks = await Task.find_one(Task.project_id == project_id)
    return tasks.data  if tasks else []   

async def get_today_tasks(project_id: str) -> List[TaskStructure]:
    tasks = await get_tasks_by_project(project_id)
    # Filter tasks for today
    from datetime import datetime
    today = datetime.utcnow().date()
    today_tasks = [task for task in tasks if task.due_date and datetime.fromisoformat(task.due_date).date() == today or task.asign_date and datetime.fromisoformat(task.asign_date).date() == today]
    return today_tasks

async def get_task_by_id(doc_id: str) -> Task | None:
    return await Task.get(doc_id)


async def update_task(doc_id: str, data: dict) -> Task | None:
    doc = await Task.get(doc_id)
    if not doc:
        return None
    for k, v in data.items():
        setattr(doc, k, v)
    await doc.save()
    return doc


async def delete_task(doc_id: str) -> Task | None:
    doc = await Task.get(doc_id)
    if doc:
        await doc.delete()
    return doc
