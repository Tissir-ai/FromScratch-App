from datetime import datetime, timedelta, timezone
from jose import jwt
from pydantic import BaseModel
from app.core.config import settings
ALGORITHM = "HS256"

class TokenData(BaseModel):
    sub: str
    role: str = "viewer"

def create_access_token(sub: str, role: str = "viewer", expires_minutes: int | None = None):
    expire = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes or settings.access_token_expire_minutes)
    payload = {"sub": sub, "role": role, "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)
