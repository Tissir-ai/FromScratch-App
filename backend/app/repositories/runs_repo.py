from uuid import UUID
from typing import Optional, List
from app.domain.run import RunDomain

async def create_run(project_id: UUID, state: dict = None) -> RunDomain:
    """
    Crée un nouveau run pour un projet.
    """
    run = RunDomain(
        project_id=project_id,
        status="queued",
        state=state or {}
    )
    await run.insert()
    return run

async def get_run(run_id: UUID) -> Optional[RunDomain]:
    """
    Récupère un run par son ID.
    """
    return await RunDomain.get(run_id)

async def get_runs_by_project(project_id: UUID) -> List[RunDomain]:
    """
    Récupère tous les runs d'un projet.
    """
    return await RunDomain.find(RunDomain.project_id == project_id).to_list()

async def update_run_status(run_id: UUID, status: str) -> Optional[RunDomain]:
    """
    Met à jour le statut d'un run.
    """
    run = await get_run(run_id)
    if not run:
        return None
    await run.update_status(status)
    return run

async def update_run_state(run_id: UUID, state: dict) -> Optional[RunDomain]:
    """
    Met à jour l'état d'un run.
    """
    run = await get_run(run_id)
    if not run:
        return None
    await run.update_state(state)
    return run

async def delete_run(run_id: UUID) -> bool:
    """
    Supprime un run.
    """
    run = await get_run(run_id)
    if not run:
        return False
    await run.delete()
    return True

async def list_runs() -> list[RunDomain]:
    """
    Récupère tous les runs (limite 1000 pour éviter surcharge).
    """
    return await RunDomain.find_all().sort("-created_at").limit(1000).to_list()
