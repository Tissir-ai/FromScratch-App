from app.core.security import create_access_token

def login_demo(user: str="demo", role: str="admin"):
    return {"access_token": create_access_token(user, role), "token_type": "bearer"}
