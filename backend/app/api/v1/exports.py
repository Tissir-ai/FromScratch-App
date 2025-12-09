from fastapi import APIRouter, Depends
from sqlmodel import Session
from pydantic import BaseModel
from app.api.deps import get_db
from app.services.exports_service import export_simple_markdown

router = APIRouter(prefix="/v1/exports", tags=["exports"])

class ExportIn(BaseModel):
    project_id: int
    markdown: str

@router.post("")
async def export_markdown(payload: ExportIn, session: Session = Depends(get_db)):
    uri = await export_simple_markdown(session, payload.project_id, payload.markdown)
    return {"uri": uri}
