from uuid import UUID
from typing import List
from beanie import PydanticObjectId
from app.domain.log import LogDomain ,LogEntry
from app.services.user_service import get_member_info_by_id
from app.repositories.logs_repo import (
    create_log,
    get_logs_by_project,
    get_log_by_id,
    update_log,
    delete_log,
)
from app.repositories.users_repo import get_user_by_info_id
from datetime import datetime
from datetime import datetime


async def log_activity(project_id: str, user_id: str, message: str) -> LogEntry:
    """
    Helper function to log project activity consistently.
    
    Args:
        project_id: The project ID where the activity occurred
        user_id: The user who performed the action
        message: The activity message (e.g., "Created task: User Authentication")
        
    Returns:
        The persisted LogEntry
    """
    user = await get_user_by_info_id(user_id)
    print(f"Logging activity for user_id: {user.id} in project_id: {project_id} - {message}")
    if user:
        payload = LogEntry(
            message=message,
            user_id=PydanticObjectId(user.id)
        )
        return await add_log(project_id, payload)
    else:
        raise ValueError("User not found for logging activity")

async def create(project_id: str, payload: LogDomain) -> LogDomain:
    payload.project_id = project_id
    return await create_log(payload)

async def add_log(project_id: str, payload: LogEntry) -> LogEntry:
    logsContainer = await get_logs_by_project(project_id)
    if not logsContainer:
        logsContainer = LogDomain(
            project_id=project_id,
            data=[payload]
        )
    else:
        logsContainer.data.append(payload)

    await logsContainer.save()    
    # Return the persisted item (may have server-side defaults such as object id / timestamps)
    return logsContainer.data[-1]
    
    
async def list_by_project(project_id: str) -> List[dict]:
    Logs = await get_logs_by_project(project_id)
    results = []
    if Logs:
        for log in Logs.data:
            user = await get_member_info_by_id(log.user_id)
            results.append({
                "id": str(log.id),
                "user": {
                    "id": str(log.user_id),
                    "name": user.get("name") if user else "Unknown User",
                    "team": user.get("team") if user else "--",
                    "role": user.get("role") if user else "unknown"
                },
                "timestamp": log.timestamp if hasattr(log, 'timestamp') else None,
                "details": log.message if hasattr(log, 'message') else ""
            })

    # Sort descending by timestamp (most recent first). Robust to None and ISO strings.
    def _ts_key(item):
        ts = item["timestamp"]
        if ts is None:
            return datetime.min
        if isinstance(ts, str):
            try:
                return datetime.fromisoformat(ts)
            except Exception:
                return datetime.min
        return ts

    results.sort(key=_ts_key, reverse=True)
    return results


async def list_by_user(project_id: str, user_id: str) -> List[dict]:
    """Get logs for a specific user in a project."""
    Logs = await get_logs_by_project(project_id)
    results = []
    if Logs:
        for log in Logs.data:
            user = await get_user_by_info_id(user_id)
            if str(log.user_id) == str(user.id):
                results.append({
                    "id": str(log.id),
                    "timestamp": log.timestamp if hasattr(log, 'timestamp') else None,
                    "details": log.message if hasattr(log, 'message') else ""
                })

    # Sort descending by timestamp (most recent first). Robust to None and ISO strings.
    def _ts_key(item):
        ts = item["timestamp"]
        if ts is None:
            return datetime.min
        if isinstance(ts, str):
            try:
                return datetime.fromisoformat(ts)
            except Exception:
                return datetime.min
        return ts

    results.sort(key=_ts_key, reverse=True)
    return results


async def get_by_id(doc_id: str) -> LogDomain | None:
    return await get_log_by_id(doc_id)


async def update(doc_id: str, data: dict) -> LogDomain | None:
    return await update_log(doc_id, data)


async def remove(doc_id: str) -> LogDomain | None:
    return await delete_log(doc_id)
