from typing import Optional
from beanie import PydanticObjectId
from app.domain.planner import PlannerDomain


async def get_planner_by_project(project_id: str | PydanticObjectId) -> Optional[PlannerDomain]:
    """
    Retrieve the planner document for a given project.
    """
    try:
        pid = PydanticObjectId(project_id) if isinstance(project_id, str) else project_id
    except Exception:
        print(f"Invalid project_id: {project_id}")
        return None
    
    planner = await PlannerDomain.find_one(PlannerDomain.project_id == pid)
    return planner


async def update_planner(project_id: str | PydanticObjectId, data: dict) -> Optional[PlannerDomain]:
    """
    Update the planner document for a given project with new data.
    Creates a new document if one doesn't exist.
    """
    try:
        pid = PydanticObjectId(project_id) if isinstance(project_id, str) else project_id
    except Exception:
        print(f"Invalid project_id: {project_id}")
        return None
    
    planner = await get_planner_by_project(pid)
    
    if not planner:
        # Create new planner document
        planner = PlannerDomain(project_id=pid)
    
    # Update fields if provided
    if "time_estimates" in data:
        planner.time_estimates = data["time_estimates"]
    if "cost_estimates" in data:
        planner.cost_estimates = data["cost_estimates"]
    if "technical_stack" in data:
        planner.technical_stack = data["technical_stack"]
    if "risks" in data:
        planner.risks = data["risks"]
    if "success_criteria" in data:
        planner.success_criteria = data["success_criteria"]
    
    await planner.save()
    return planner


async def create_planner(planner: PlannerDomain) -> PlannerDomain:
    """
    Create a new planner document.
    """
    return await planner.insert()
