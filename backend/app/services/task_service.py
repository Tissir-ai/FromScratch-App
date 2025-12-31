from uuid import UUID
from typing import List
from app.domain.task import TaskDomain, TaskStructure
from app.repositories.tasks_repo import (
    create_task,
    get_tasks_by_project,
    get_task_by_id,
    update_task,
    delete_task,
)

async def create(project_id: UUID, payload: TaskDomain) -> TaskDomain:
    payload.project_id = project_id
    return await create_task(payload)


async def list_by_project(project_id: str) -> List[TaskDomain]:
    return await get_tasks_by_project(project_id)


async def get_by_id(doc_id: str) -> TaskDomain | None:
    return await get_task_by_id(doc_id)


async def update(doc_id: str, data: dict) -> TaskDomain | None:
    return await update_task(doc_id, data)


async def remove(doc_id: str) -> TaskDomain | None:
    return await delete_task(doc_id)
