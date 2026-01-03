from typing import List
from uuid import UUID
from app.domain.log import LogDomain as Log
from beanie import PydanticObjectId

async def create_log(log: Log) -> Log:
    return await log.insert()


async def get_logs_by_project(project_id: str | PydanticObjectId) -> Log:
    try:
        pid = PydanticObjectId(project_id) if isinstance(project_id, str) else project_id
    except Exception:
        print("Invalid project id:", pid)
        return None
    return await Log.find_one(Log.project_id == pid)


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
