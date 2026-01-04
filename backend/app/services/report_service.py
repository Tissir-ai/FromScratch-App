from __future__ import annotations

from typing import Optional

from app.repositories.diagrams_repo import get_diagrams_by_project
from app.repositories.requirements_repo import get_requirements_by_project
from app.repositories.runs_repo import get_latest_run_for_project
from app.repositories.users_repo import get_user_by_info_id
from app.services.project_service import get_by_id


TEMPLATES = [
    {
        "id": "default",
        "label": "Default",
        "description": "Clean layout with blue accents",
        "accent": "#2563eb",
        "font_family": "'Segoe UI', system-ui, sans-serif",
    },
    {
        "id": "serif",
        "label": "Serif",
        "description": "Classic report look with warm accent",
        "accent": "#b45309",
        "font_family": "'Georgia', 'Times New Roman', serif",
    },
    {
        "id": "mono",
        "label": "Mono",
        "description": "Minimal monospace style for technical readers",
        "accent": "#0ea5e9",
        "font_family": "'SFMono-Regular', 'Consolas', monospace",
    },
]


async def get_report_data(project_id: str) -> Optional[dict]:
    """
    Fetch all report data for client-side rendering.
    Returns project info, requirements, diagrams, and plan content.
    """
    project = await get_by_id(project_id)
    if not project:
        return None

    diagrams = await get_diagrams_by_project(project_id)
    requirements = await get_requirements_by_project(project_id)
    user = await get_user_by_info_id(project.created_by)

    run = await get_latest_run_for_project(project_id)
    run_state = run.state if run else {}

    # Extract plan content from run state
    planner_content = run_state.get("planner_content") if run_state else None
    export_content = run_state.get("export_content") or run_state.get("blueprint_markdown") if run_state else None

    return {
        "project_id": str(project.id),
        "project_name": project.name,
        "project_description": project.description,
        "project_full_description": project.full_description,
        "project_created_at": project.created_at.isoformat(),
        "project_owner": user.name if user else "Unknown",
        "run_id": str(run.id) if run else None,
        "requirements": requirements or [],
        "diagrams": diagrams or [],
        "planner_content": planner_content,
        "export_content": export_content,
    }


def list_templates():
    """Return available styling templates for the frontend."""
    return [
        {"id": tpl["id"], "label": tpl["label"], "description": tpl["description"], "accent": tpl["accent"], "font_family": tpl["font_family"]}
        for tpl in TEMPLATES
    ]
