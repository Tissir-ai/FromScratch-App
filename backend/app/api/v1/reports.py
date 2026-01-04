from __future__ import annotations

from typing import List, Optional, Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.api.deps import get_current_user
from app.services.report_service import get_report_data, list_templates
from app.services.user_service import isAllowed
from app.services.project_service import get_by_id as get_project_by_id

router = APIRouter(prefix="/v1/projects/{project_id}/reports", tags=["reports"])


class ReportDataResponse(BaseModel):
    project_id: str
    project_name: str
    project_description: Optional[str]
    project_full_description: Optional[str]
    project_created_at: str
    project_owner: str
    run_id: Optional[str]
    requirements: List[Any]
    diagrams: List[Any]
    planner_content: Optional[str]
    export_content: Optional[str]
    templates: List[dict]


@router.get("", response_model=ReportDataResponse)
async def fetch_report_data(project_id: str, current_user: object = Depends(get_current_user)):
    """
    Fetch all report data for client-side rendering and PDF generation.
    Returns project info, requirements, diagrams, and plan content.
    """
    project = await get_project_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not await isAllowed(current_user.get("id"), project_id, "view_reports"):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    data = await get_report_data(project_id) 
    if data is None:
        raise HTTPException(status_code=404, detail="Project not found")

    return {
        **data,
        "templates": list_templates(),
    }
