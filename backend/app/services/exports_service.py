from sqlmodel import Session
from app.agents.export_agent import export_markdown

async def export_simple_markdown(session: Session, project_id: int, content: str) -> str:
    return await export_markdown(project_id, content)
