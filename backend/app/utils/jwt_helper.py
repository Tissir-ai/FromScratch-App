"""JWT utility for generating and verifying invitation tokens."""
import jwt
from datetime import datetime, timedelta
from typing import Dict, Any
from app.core.config import Settings

settings = Settings()

INVITATION_TOKEN_EXPIRY_DAYS = 5


def generate_invitation_token(email: str, info_id: str, project_id: str) -> tuple[str, datetime]:
    """
    Generate a JWT token for project invitation.
    
    Args:
        email: Email address of the invited user
        project_id: ID of the project to which user is invited
        
    Returns:
        tuple: (token string, expiration datetime)
    """
    expires_at = datetime.utcnow() + timedelta(days=INVITATION_TOKEN_EXPIRY_DAYS)
    
    payload = {
        "email": email,
        "info_id": info_id,
        "project_id": project_id,
        "exp": expires_at,
        "iat": datetime.utcnow(),
        "type": "invitation"
    }
    
    token = jwt.encode(payload, settings.JWT_ACCESS_SECRET, algorithm="HS256")
    return token, expires_at


def verify_invitation_token(token: str) -> Dict[str, Any] | None:
    """
    Verify and decode an invitation token.
    
    Args:
        token: JWT token string
        
    Returns:
        dict: Decoded token payload if valid, None otherwise
    """
    try:
        payload = jwt.decode(token, settings.JWT_ACCESS_SECRET, algorithms=["HS256"])
        
        # Verify token type
        if payload.get("type") != "invitation":
            return None
            
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
