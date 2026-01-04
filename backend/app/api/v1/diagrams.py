from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.api.deps import get_db, get_current_user
from app.services.diagram_service import (
    create, list_by_project, update, remove , get_diagram_by_id
)
from app.domain.diagram import DiagramDomain, DiagramStructure
from app.services.project_service import get_by_id as get_project_by_id
from app.domain.user import User
from app.services.user_service import isAllowed
from app.services.realtime import broadcast_crud_event
from app.services.log_service import log_activity
router = APIRouter(prefix="/v1/diagrams", tags=["diagrams"])


@router.post("/{project_id}", response_model=DiagramStructure)
async def create_diagram(project_id: str, payload: DiagramStructure, current_user: object = Depends(get_current_user), _=Depends(get_db)):
    project = await get_project_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not await isAllowed(current_user.get("id"), project_id, "create_diagrams"):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    diagram = await create(project_id, payload)
    await log_activity(project_id, current_user.get("id"), f"{current_user.get('name','unknown user')} Created diagram: {payload.title} - {payload.type}")
    await broadcast_crud_event(str(project_id), "diagrams", "create", "diagrams", diagram.model_dump() if hasattr(diagram, "model_dump") else dict(diagram))
    return diagram


@router.get("/{project_id}", response_model=List[DiagramStructure])
async def list_diagrams(project_id: str, current_user: object = Depends(get_current_user), _=Depends(get_db)):
    project = await get_project_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not await isAllowed(current_user.get("id"), project_id, "view_diagrams"):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return await list_by_project(project_id)

@router.put("/{project_id}/{doc_id}", response_model=DiagramStructure)
async def update_diagram(project_id: str, doc_id: str, payload: DiagramStructure, current_user: User = Depends(get_current_user), _=Depends(get_db)):
    project = await get_project_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not await isAllowed(current_user.get("id"), project_id, "edit_diagrams"):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    updated = await update(project_id,payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Diagram not found")
    await log_activity(project_id, current_user.get("id"), f"{current_user.get('name','unknown user')} Updated diagram: {payload.title} - {payload.type}")
    await broadcast_crud_event(str(project_id), "diagrams", "update", "diagrams", updated if isinstance(updated, dict) else (updated.model_dump() if hasattr(updated, "model_dump") else {"id": str(doc_id)}))
    return updated


@router.delete("/{project_id}/{doc_id}")
async def delete_diagram(project_id: str, doc_id: str, current_user: User = Depends(get_current_user), _=Depends(get_db)):
    project = await get_project_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not await isAllowed(current_user.get("id"), project_id, "delete_diagrams"):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    deleted = await remove(project_id, doc_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Diagram not found")
    await log_activity(project_id, current_user.get("id"), f"{current_user.get('name','unknown user')} Deleted a diagram")
    await broadcast_crud_event(str(project_id), "diagrams", "delete", "diagrams", {"id": str(doc_id)})
    return {"deleted": True}
