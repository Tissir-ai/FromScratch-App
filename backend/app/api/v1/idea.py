from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel
from rq import Queue
from typing import Optional
from uuid import UUID

from app.repositories import runs_repo
from app.core.events import get_redis
from app.jobs.blueprint_job import run_blueprint_job
from app.domain.project import Project
from app.services.project_service import create, update , create_project_with_roles

# services to create placeholder documents
from app.domain.task import TaskStructure
from app.domain.diagram import DiagramStructure
from app.domain.requirement import RequirementStructure
from app.services.task_service import create as create_task
from app.services.diagram_service import create as create_diagram
from app.services.requirement_service import create as create_requirement
import asyncio
from app.api.deps import get_db, get_current_user


router = APIRouter(prefix="/v1/idea", tags=["idea"])


class IdeaIn(BaseModel):
    project_id: Optional[UUID] = None  # 🆕 Now optional - will auto-create if not provided
    idea: str
    webhook_url: Optional[str] = None  # URL pour callback quand terminé


@router.post("/generate")
async def generate_blueprint(payload: IdeaIn, current_user: object = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_db)):
    # 🆕 Auto-create project if project_id not provided
    if payload.project_id is None:
        print("[IDEA_API] No project_id provided. Creating temporary project...")
        temp_project = Project(
            name="Generating...",  # Temporary name - will be updated by metadata agent
            description="Project being generated from idea. Name will be updated shortly.",
            created_by=current_user.get("id")
        )
        created_project = await create_project_with_roles(temp_project, current_user)
        project_id = created_project.id
        print(f"[IDEA_API] Created temporary project: {project_id}")
        # Create placeholder documents (tasks, diagrams, requirements) in parallel
        try:
            task_payload = TaskStructure(
                title="Generating tasks",
                description="Placeholder while the blueprint is prepared",
                assignee_id=None,
                status="backlog",
                priority="medium",
            )
            diagram_payload = DiagramStructure(
                title="Generating diagrams",
                type="flowchart",
                nodes=[],
                edges=[],
            )
            requirement_payload = RequirementStructure(
                title="Generating requirements",
                category="auto",
                description="Placeholder while the blueprint is prepared",
                content=None,
            )

            tasks_coro = create_task(project_id, task_payload)
            diagrams_coro = create_diagram(project_id, diagram_payload)
            requirements_coro = create_requirement(project_id, requirement_payload)

            tasks_doc, diagrams_doc, requirements_doc = await asyncio.gather(
                tasks_coro, diagrams_coro, requirements_coro
            )

            # Update project with the created IDs
            await update(project_id, {
                "tasks_id": tasks_doc.id,
                "diagrams_id": diagrams_doc.id,
                "requirements_id": requirements_doc.id,
            })
            print(f"[IDEA_API] Created placeholders: tasks={tasks_doc.id}, diagrams={diagrams_doc.id}, requirements={requirements_doc.id}")
        except Exception as e:
            print(f"[IDEA_API] Failed to create placeholders: {e}")
    else:
        project_id = payload.project_id
        print(f"[IDEA_API] Using existing project_id: {project_id}")

    # 1) create run in DB (MongoDB async)
    run = await runs_repo.create_run(
        project_id=project_id,
        state={}
    )

    # 2) enqueue job to RQ
    q = Queue(name="fromscratch", connection=get_redis())

    job = q.enqueue(
        run_blueprint_job,  # Pass function directly instead of string
        str(run.id),  # Convert UUID to string for RQ
        str(project_id),  # 🆕 Use the resolved project_id (auto-created or provided)
        payload.idea,
        payload.webhook_url,
        job_timeout=600,   # 10 min
        result_ttl=3600,   # keep result 1h
        ttl=3600,
    )

    return {
        "run_id": str(run.id),
        "project_id": str(project_id),  # 🆕 Return the project_id (useful for frontend)
        "status": "queued",
        "job_id": job.id,
        "websocket_url": f"/ws/run/{run.id}",
    }
