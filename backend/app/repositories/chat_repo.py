from uuid import UUID
from typing import List, Dict, Any
from datetime import datetime

from app.domain.chats import ChatDomain, ChatsStructure, SubChatMessage

async def create_chat(Chat: ChatDomain) -> ChatDomain:
    return await Chat.insert()

async def add_message(
    project_id: UUID,
    user_id: UUID,
    content: str,
    name: str | None = None
) -> Dict[str, Any]:
    """Append a message for a user inside the ChatDomain for the project.

    Returns a dict with message data including project_id and user_id.
    """
    if user_id is None:
        raise ValueError("user_id is required to add a project chat message")

    # Create the message
    msg = SubChatMessage(message=content, name=name or str(user_id))

    chat = await ChatDomain.find_one(ChatDomain.project_id == project_id)
    if not chat:
        chat = ChatDomain(project_id=project_id, data=[ChatsStructure(user_id=user_id, user_chat=[msg])])
        await chat.insert()
    else:
        # try to find existing user chat
        for cs in chat.data:
            if cs.user_id == user_id:
                cs.user_chat.append(msg)
                break
        else:
            chat.data.append(ChatsStructure(user_id=user_id, user_chat=[msg]))
        await chat.save()

    return {
        "id": msg.id,
        "project_id": project_id,
        "user_id": user_id,
        "name": msg.name,
        "message": msg.message,
        "timestamp": msg.timestamp,
    }


async def get_project_messages(
    project_id: UUID,
    limit: int,
    skip: int
) -> List[Dict[str, Any]]:
    """Return a flattened list of messages across all users for a project, sorted by timestamp desc."""
    chat = await ChatDomain.find_one(ChatDomain.project_id == project_id)
    if not chat:
        return []

    msgs = []
    for cs in chat.data:
        for m in cs.user_chat:
            msgs.append({
                "id": m.id,
                "project_id": project_id,
                "user_id": cs.user_id,
                "name": m.name,
                "message": m.message,
                "timestamp": m.timestamp,
            })

    # sort by timestamp descending
    msgs.sort(key=lambda x: x["timestamp"], reverse=True)
    return msgs[skip: skip + limit]

async def delete_chat(chat_id: str) -> ChatDomain | None:
    chat = await ChatDomain.get(chat_id)
    if chat:
        await chat.delete()
    return chat
    