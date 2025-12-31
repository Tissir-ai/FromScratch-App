from beanie import Document, PydanticObjectId
from pydantic import BaseModel, Field
from uuid import UUID, uuid4
from datetime import datetime
from typing import List, Dict, Any

class SubChatMessage(BaseModel):
    id:  PydanticObjectId = Field(default_factory=PydanticObjectId, alias="_id")
    name : str
    message: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ChatsStructure(BaseModel):
    id:  PydanticObjectId = Field(default_factory=PydanticObjectId, alias="_id")
    user_id: str
    user_chat: List[SubChatMessage] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ChatDomain(Document):
    id:  PydanticObjectId = Field(default_factory=PydanticObjectId, alias="_id")
    project_id: PydanticObjectId
    data: List[ChatsStructure] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "chats"
