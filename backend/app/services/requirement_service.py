from uuid import UUID
from typing import List
from app.domain.requirement import RequirementDomain , RequirementStructure
from app.repositories.requirements_repo import (
    get_requirement_Container_by_project,
    get_requirements_by_project,
    get_requirement_by_id,
    update_requirement,
    delete_requirement,
)



async def create(project_id: str, payload: RequirementStructure) -> RequirementStructure:
    requirement = await get_requirement_Container_by_project(project_id)
    if not requirement:
        requirement = RequirementDomain(
            project_id=project_id,
            data=[payload]
        )
    else:
        requirement.data.append(payload)

    await requirement.save()    
    # Return the persisted item (may have server-side defaults such as object id / timestamps)
    return requirement.data[-1]

async def list_by_project(project_id: str) -> List[RequirementStructure]:
    return await get_requirements_by_project(project_id)


async def get_by_id(doc_id: str) -> RequirementDomain | None:
    return await get_requirement_by_id(doc_id)


async def update(project_id: str, data: RequirementStructure) -> RequirementStructure | None:
    return await update_requirement(project_id, data)


async def remove(project_id: str, doc_id: str) -> RequirementStructure | None:
    return await delete_requirement(project_id, doc_id)