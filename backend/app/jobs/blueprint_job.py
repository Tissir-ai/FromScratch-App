"""
RQ Worker job pour exécuter le pipeline d'agents.
Ce job est appelé de manière asynchrone par Redis Queue.
"""
import asyncio
import httpx
from uuid import UUID

from app.agents.graph import run_blueprint_pipeline
from app.repositories import runs_repo
from app.repositories.session import init_db
from app.core.events import publish


def run_blueprint_job(run_id_str: str, project_id_str: str, idea: str, webhook_url: str | None = None):
    """
    Job RQ qui exécute le pipeline d'agents pour générer un blueprint.
    
    Args:
        run_id_str: UUID du run (string)
        project_id_str: UUID du projet (string)
        idea: Description du projet par l'utilisateur
        webhook_url: URL optionnelle pour notification de fin
    """
    # Convertir les strings en UUID
    run_id = UUID(run_id_str)
    project_id = project_id_str
    
    # RQ est synchrone, on doit exécuter l'async dans une boucle
    asyncio.run(_async_run_blueprint_job(run_id, project_id, idea, webhook_url))


async def _async_run_blueprint_job(run_id: UUID, project_id: str, idea: str, webhook_url: str | None):
    """Version async du job"""
    print(f"[JOB] Starting job for run_id={run_id}, project_id={project_id}")
    
    # IMPORTANT: Initialiser Beanie/MongoDB car le worker RQ est un processus séparé
    print("[JOB] Initializing MongoDB/Beanie...")
    await init_db()
    print("[JOB] MongoDB initialized successfully")
    
    try:
        # 1) Mettre à jour le statut à "running"
        print(f"[JOB] Updating run status to 'running'...")
        await runs_repo.update_run_status(run_id, "running")
        publish(f"run:{run_id}", "STATUS:running")
        print(f"[JOB] Run status updated. Starting pipeline...")
        
        # 2) Exécuter le pipeline d'agents
        print(f"[JOB] Calling run_blueprint_pipeline...")
        result = await run_blueprint_pipeline(
            project_id=project_id,
            run_id=run_id,
            idea=idea,
        )
        print(f"[JOB] Pipeline completed successfully")
        
        # 3) Mettre à jour le statut à "succeeded"
        print(f"[JOB] Updating run status to 'succeeded'...")
        await runs_repo.update_run_status(run_id, "succeeded")
        publish(f"run:{run_id}", "STATUS:succeeded")

        # 2) Exécuter le pipeline d'agents
        result = await run_blueprint_pipeline(
            project_id=project_id,
            run_id=run_id,
            idea=idea,
        )

        # 3) Mettre à jour le statut à "succeeded"
        await runs_repo.update_run_status(run_id, "succeeded")
        publish(f"run:{run_id}", "STATUS:succeeded")

        # 4) Appeler le webhook si fourni
        if webhook_url:
            try:
                async with httpx.AsyncClient() as client:
                    await client.post(
                        webhook_url,
                        json={
                            "run_id": str(run_id),
                            "project_id": str(project_id),
                            "status": "succeeded",
                            "result": result,
                        },
                        timeout=10.0,
                    )
            except Exception as e:
                print(f"Webhook call failed: {e}")

    except Exception as e:
        # En cas d'erreur, mettre à jour le statut à "failed"
        print(f"[JOB ERROR] Exception occurred: {type(e).__name__}: {str(e)}")
        try:
            await runs_repo.update_run_status(run_id, "failed")
            publish(f"run:{run_id}", f"STATUS:failed ERROR:{str(e)}")
        except Exception as inner_e:
            print(f"[JOB ERROR] Failed to update run status: {inner_e}")
        raise
