from typing import Optional
import json
from app.domain.planner import (
    PlannerDomain,
    TimeEstimates,
    CostEstimates,
    TechnicalStack,
    Risk,
    SuccessCriteria
)
from app.repositories.planners_repo import (
    get_planner_by_project,
    update_planner as update_planner_repo
)


async def get_by_project(project_id: str) -> Optional[PlannerDomain]:
    """
    Retrieve the planner for a given project.
    """
    return await get_planner_by_project(project_id)


async def update_from_json(project_id: str, planner_json_str: str) -> Optional[PlannerDomain]:
    """
    Parse planner JSON string and update the planner document.
    
    Args:
        project_id: The project ID
        planner_json_str: JSON string containing planner data
        
    Returns:
        Updated PlannerDomain or None if parsing fails
    """
    try:
        # Parse JSON string
        planner_data = json.loads(planner_json_str)
        
        # Build update data with proper type conversion
        update_data = {}
        
        # Parse time estimates
        if "time_estimates" in planner_data:
            update_data["time_estimates"] = TimeEstimates(**planner_data["time_estimates"])
        
        # Parse cost estimates
        if "cost_estimates" in planner_data:
            update_data["cost_estimates"] = CostEstimates(**planner_data["cost_estimates"])
        
        # Parse technical stack
        if "technical_stack" in planner_data:
            update_data["technical_stack"] = TechnicalStack(**planner_data["technical_stack"])
        
        # Parse risks
        if "risks" in planner_data:
            update_data["risks"] = [Risk(**risk) for risk in planner_data["risks"]]
        
        # Parse success criteria
        if "success_criteria" in planner_data:
            update_data["success_criteria"] = [
                SuccessCriteria(**criteria) for criteria in planner_data["success_criteria"]
            ]
        
        # Update planner document
        return await update_planner_repo(project_id, update_data)
        
    except json.JSONDecodeError as e:
        print(f"[PLANNER_SERVICE] Failed to parse JSON: {e}")
        return None
    except Exception as e:
        print(f"[PLANNER_SERVICE] Error updating planner: {e}")
        return None


async def update(project_id: str, data: dict) -> Optional[PlannerDomain]:
    """
    Update planner with pre-parsed data.
    """
    return await update_planner_repo(project_id, data)
