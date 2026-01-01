from typing import List
from uuid import UUID
from app.domain.requirement import RequirementDomain as Requirement , RequirementStructure
from beanie import PydanticObjectId
from datetime import datetime


async def create_requirement(requirement: Requirement) -> Requirement:
    return await requirement.insert()

async def get_requirement_Container_by_project(project_id: str | PydanticObjectId) -> Requirement | None:
    try:
        pid = PydanticObjectId(project_id) if isinstance(project_id, str) else project_id
    except Exception:
        print("Invalid project id:", project_id)
        return None
    diagram = await Requirement.find_one(Requirement.project_id == pid)
    return diagram

async def get_requirements_by_project(project_id: str) -> List[RequirementStructure]:
        try:
            pid = PydanticObjectId(project_id) if isinstance(project_id, str) else project_id
        except Exception:
            print("Invalid project id:", project_id)
            return []
        requirement = await Requirement.find_one(Requirement.project_id == pid)
        if not requirement:
            return []

        def _key(item: RequirementStructure):
            updated = getattr(item, "updated_at", None)
            created = getattr(item, "created_at", None)
            # normalize None to a very old datetime so sorting works
            if updated is None:
                updated = created or datetime.min
            if created is None:
                created = updated or datetime.min
            return (updated, created)
        print(requirement)
        return sorted(list(requirement.data), key=_key, reverse=True)


async def get_requirement_by_id(doc_id: UUID) -> Requirement | None:
    return await Requirement.get(doc_id)


async def update_requirement(project_id: str | PydanticObjectId, data: RequirementStructure) -> RequirementStructure | None:
    try:
        pid = PydanticObjectId(project_id) if isinstance(project_id, str) else project_id
    except Exception:
        print("Invalid project id:", project_id)
        return None
    doc = await Requirement.find_one(Requirement.project_id == pid)
    if not doc:
        return None
    for idx, item in enumerate(doc.data):
        if item.id == data.id:
            doc.data[idx] = data
            await doc.save()
            return data
    return None


async def delete_all_requirements(project_id: str | PydanticObjectId) -> bool:
    """Delete all requirements for a given project."""
    try:
        pid = PydanticObjectId(project_id) if isinstance(project_id, str) else project_id
    except Exception:
        print("Invalid project id:", project_id)
        return False
    doc = await Requirement.find_one(Requirement.project_id == pid)
    if not doc:
        return False
    await doc.delete()
    return True

async def delete_requirement(project_id: str | PydanticObjectId, doc_id: str) -> RequirementStructure | None:
    """Remove an item inside the project's Diagram document and persist it."""
    try:
        pid = PydanticObjectId(project_id) if isinstance(project_id, str) else project_id
    except Exception:
        print("Invalid project id:", project_id)
        return None
    doc = await Requirement.find_one(Requirement.project_id == pid)
    if not doc:
        return None
    for idx, item in enumerate(doc.data):
        if str(item.id) == doc_id:
            deleted_item = doc.data.pop(idx)
            await doc.save()
            return deleted_item
    return None
