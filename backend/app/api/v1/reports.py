from __future__ import annotations

import io
from typing import List, Optional, Any

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.api.deps import get_current_user
from app.services.report_service import generate_pdf, get_report_sections, list_templates
from app.services.user_service import isAllowed
from app.services.project_service import get_by_id as get_project_by_id

router = APIRouter(prefix="/v1/projects/{project_id}/reports", tags=["reports"])



class ReportSectionsResponse(BaseModel):
    project_id: str
    project_name: str
    project_owner: str
    run_id: Optional[str]
    sections: List[dict]
    requirements: List[Any]
    diagrams: List[Any]
    templates: List[dict]


@router.get("", response_model=ReportSectionsResponse)
async def fetch_report_sections(project_id: str, current_user: object = Depends(get_current_user)):
    project = await get_project_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not await isAllowed(current_user.get("id"), project_id, "view_reports"):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    data = await get_report_sections(project_id) 
    if data is None:
        raise HTTPException(status_code=404, detail="Project not found")

    return {
        **data,
        "templates": list_templates(),
    }


@router.get("/pdf")
async def download_report_pdf(
    project_id: str,
    template: Optional[str] = Query(default="default", description="Template identifier"),
    current_user: object = Depends(get_current_user),
):
    if not await isAllowed(current_user.get("id"), project_id, "download_reports"):
        raise HTTPException(status_code=403, detail="Not enough permissions to download reports")

    try:
        pdf_bytes = await generate_pdf(project_id, template_id=template)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    filename = f"project-{project_id}-report.pdf"
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"inline; filename=\"{filename}\""},
    )
