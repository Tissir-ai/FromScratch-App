from fastapi import APIRouter, Depends, BackgroundTasks
from pydantic import BaseModel
from sqlmodel import Session
from app.api.deps import get_db
from app.repositories import run_repo
from app.agents.graph import run_blueprint_pipeline
from app.core.events import publish

router = APIRouter(prefix="/v1/idea", tags=["idea"])

class IdeaIn(BaseModel):
    project_id: int
    idea: str

@router.post("/generate")
async def generate_blueprint(payload: IdeaIn, bg: BackgroundTasks, session: Session = Depends(get_db)):
    run = run_repo.create_run(session, project_id=payload.project_id, state="REQUIREMENTS")
    channel = f"run:{run.id}"
    def _work():
        publish(channel, "STATUS:running")
        run_repo.update_run(session, run.id, status="running")
        try:
            import asyncio
            result = asyncio.run(run_blueprint_pipeline(session, payload.project_id, run.id, payload.idea))
            run_repo.update_run(session, run.id, status="succeeded", state="DONE", result_uri=result["result_uri"])
            publish(channel, f"STATUS:succeeded URI:{result['result_uri']}")
        except Exception as e:
            run_repo.update_run(session, run.id, status="failed")
            publish(channel, f"STATUS:failed ERROR:{e}")
    bg.add_task(_work)
    return {"run_id": run.id, "status": "queued"}
