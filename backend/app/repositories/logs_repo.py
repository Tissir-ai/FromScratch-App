from typing import List
from uuid import UUID
from app.domain.log import LogDomain as Log


async def create_log(log: Log) -> Log:
    return await log.insert()


async def get_logs_by_project(project_id: UUID) -> List[Log]:
    return await Log.find(Log.project_id == project_id).to_list()


async def get_log_by_id(doc_id: UUID) -> Log | None:
    return await Log.get(doc_id)


async def update_log(doc_id: str, data: dict) -> Log | None:
    doc = await Log.get(doc_id)
    if not doc:
        return None
    for k, v in data.items():
        setattr(doc, k, v)
    await doc.save()
    return doc


async def delete_log(doc_id: str) -> Log | None:
    doc = await Log.get(doc_id)
    if doc:
        await doc.delete()
    return doc
