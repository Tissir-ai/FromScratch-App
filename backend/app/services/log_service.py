from uuid import UUID
from typing import List
from app.domain.log import LogDomain
from app.repositories.logs_repo import (
    create_log,
    get_logs_by_project,
    get_log_by_id,
    update_log,
    delete_log,
)


async def create(project_id: UUID, payload: LogDomain) -> LogDomain:
    payload.project_id = project_id
    return await create_log(payload)


async def list_by_project(project_id: UUID) -> List[LogDomain]:
    return await get_logs_by_project(project_id)


async def get_by_id(doc_id: UUID) -> LogDomain | None:
    return await get_log_by_id(doc_id)


async def update(doc_id: UUID, data: dict) -> LogDomain | None:
    return await update_log(doc_id, data)


async def remove(doc_id: UUID) -> LogDomain | None:
    return await delete_log(doc_id)
