from typing import List
from beanie import PydanticObjectId
from app.domain.diagram import DiagramDomain as Diagram, DiagramStructure
from datetime import datetime


async def create_diagram(diagram: Diagram) -> Diagram:
    return await diagram.insert()

async def get_diagram_Container_by_project(project_id: str | PydanticObjectId) -> Diagram | None:
    try:
        pid = PydanticObjectId(project_id) if isinstance(project_id, str) else project_id
    except Exception:
        print("Invalid project id:", project_id)
        return None
    diagram = await Diagram.find_one(Diagram.project_id == pid)
    return diagram

async def get_diagram_by_id(project_id:str, doc_id: str) -> DiagramStructure | None:
    allDiagrams = await get_diagrams_by_project(project_id)
    for diagram in allDiagrams:
        if str(diagram.id) == doc_id:
            return diagram
    return None

async def update_diagram_item(project_id: str | PydanticObjectId, data: DiagramStructure) -> DiagramStructure | None:
    """Update an item inside the project's Diagram document and persist it."""
    try:
        pid = PydanticObjectId(project_id) if isinstance(project_id, str) else project_id
    except Exception:
        print("Invalid project id:", project_id)
        return None
    doc = await Diagram.find_one(Diagram.project_id == pid)
    if not doc:
        return None
    for idx, item in enumerate(doc.data):
        if item.id == data.id:
            doc.data[idx] = data
            await doc.save()
            return data
    return None

async def remove_diagram_item(project_id: str | PydanticObjectId, doc_id: str) -> DiagramStructure | None:
    """Remove an item inside the project's Diagram document and persist it."""
    try:
        pid = PydanticObjectId(project_id) if isinstance(project_id, str) else project_id
    except Exception:
        print("Invalid project id:", project_id)
        return None
    doc = await Diagram.find_one(Diagram.project_id == pid)
    if not doc:
        return None
    for idx, item in enumerate(doc.data):
        if str(item.id) == doc_id:
            deleted_item = doc.data.pop(idx)
            await doc.save()
            return deleted_item
    return None

async def get_diagrams_by_project(project_id: str | PydanticObjectId) -> List[DiagramStructure]:
        try:
            pid = PydanticObjectId(project_id) if isinstance(project_id, str) else project_id
        except Exception:
            print("Invalid project id:", project_id)
            return []
        diagram = await Diagram.find_one(Diagram.project_id == pid)
        if not diagram:
            return []

        def _key(item: DiagramStructure):
            updated = getattr(item, "updated_at", None)
            created = getattr(item, "created_at", None)
            # normalize None to a very old datetime so sorting works
            if updated is None:
                updated = created or datetime.min
            if created is None:
                created = updated or datetime.min
            return (updated, created)
        return sorted(list(diagram.data), key=_key, reverse=True)

async def get_diagram_by_id(doc_id: str) -> Diagram | None:
    return await Diagram.get(doc_id)

async def delete_diagram(doc_id: str) -> Diagram | None:
    doc = await Diagram.get(doc_id)
    if doc:
        await doc.delete()
    return doc
