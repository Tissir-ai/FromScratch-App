from fastapi import Depends, HTTPException, Request
from typing import Any
from uuid import UUID
import json

from app.repositories.session import get_mongo_db


def get_db(db: Any = Depends(get_mongo_db)) -> Any:
    return db
    

async def get_current_user(request: Request) -> object:
    """Authenticate by parsing the user from the 'x-user' header.

    The header should contain a JSON string of the user object.
    """
    # print("Request headers:", request.headers.items())      
    user_header = request.headers.get('x-user')
    if not user_header:
        raise HTTPException(status_code=401, detail="x-user header required")

    try:
        user_data = json.loads(user_header)
        return user_data
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid user data in header: {str(e)}")

