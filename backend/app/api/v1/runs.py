
from fastapi import APIRouter, HTTPException
from uuid import UUID
from app.repositories import runs_repo


router = APIRouter(prefix="/v1/runs", tags=["Runs"])

# Nouveau endpoint pour lister tous les runs
@router.get("/")
async def list_runs():
    runs = await runs_repo.list_runs()
    return [
        {
            "run_id": str(run.id),
            "project_id": str(run.project_id),
            "status": run.status,
            "created_at": run.created_at,
            "updated_at": run.updated_at,
        }
        for run in runs
    ]

@router.get("/{run_id}")
async def get_run_status(run_id: UUID):
    run = await runs_repo.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")

    return {
        "run_id": str(run.id),
        "project_id": str(run.project_id),
        "status": run.status,
        "created_at": run.created_at,
        "updated_at": run.updated_at,
        
        # 🆕 CONTENU TEXTE DIRECT depuis le state JSON
        "content": {
            "requirements": run.state.get("requirements_content"),
            "diagrams": run.state.get("diagrams_content"),
            "diagrams_json": run.state.get("diagrams_json_content"),  # 🎯 JSON React Flow
            "plan": run.state.get("planner_content"),
            "export": run.state.get("export_content") or run.state.get("blueprint_markdown"),
        },
    }
