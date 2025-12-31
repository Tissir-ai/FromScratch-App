from typing import List
from app.domain.diagram import DiagramDomain, DiagramStructure
from app.repositories.diagrams_repo import (
    get_diagrams_by_project,
    get_diagram_by_id,
    get_diagram_Container_by_project,
    update_diagram_item,
    remove_diagram_item,
)


async def create(project_id: str, payload: DiagramStructure) -> DiagramStructure:
    diagram = await get_diagram_Container_by_project(project_id)
    if not diagram:
        diagram = DiagramDomain(
            project_id=project_id,
            data=[payload]
        )
    else:
        diagram.data.append(payload)

    await diagram.save()    
    # Return the persisted item (may have server-side defaults such as object id / timestamps)
    return diagram.data[-1]
    
async def get_diagram_by_id(project_id: str, doc_id: str) -> DiagramStructure | None:
    return await get_diagram_by_id(project_id, doc_id)

async def list_by_project(project_id: str) -> List[DiagramStructure]:
    return await get_diagrams_by_project(project_id)


async def get_by_id(doc_id: str) -> DiagramDomain | None:
    return await get_diagram_by_id(doc_id)


async def update(project_id: str, data: DiagramStructure) -> DiagramStructure | None:
    return await update_diagram_item(project_id, data)


async def remove(project_id: str, doc_id: str) -> DiagramStructure | None:
    return await remove_diagram_item(project_id, doc_id)
        
