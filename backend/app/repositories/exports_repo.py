from typing import Optional
from beanie import PydanticObjectId
from app.domain.exports import ExportDomain


async def get_export_by_project(project_id: str | PydanticObjectId) -> Optional[ExportDomain]:
    """
    Retrieve the export document for a given project.
    """
    try:
        pid = PydanticObjectId(project_id) if isinstance(project_id, str) else project_id
    except Exception:
        print(f"Invalid project_id: {project_id}")
        return None
    
    export_doc = await ExportDomain.find_one(ExportDomain.project_id == pid)
    return export_doc


async def update_export(project_id: str | PydanticObjectId, data: dict) -> Optional[ExportDomain]:
    """
    Update the export document for a given project with new data.
    Creates a new document if one doesn't exist.
    """
    try:
        pid = PydanticObjectId(project_id) if isinstance(project_id, str) else project_id
    except Exception:
        print(f"Invalid project_id: {project_id}")
        return None
    
    export_doc = await get_export_by_project(pid)
    
    if not export_doc:
        # Create new export document
        export_doc = ExportDomain(project_id=pid)
    
    # Update fields if provided
    if "document" in data:
        export_doc.document = data["document"]
    if "github_export" in data:
        export_doc.github_export = data["github_export"]
    if "github_access_token" in data:
        export_doc.github_access_token = data["github_access_token"]
    
    await export_doc.save()
    return export_doc


async def create_export(export_doc: ExportDomain) -> ExportDomain:
    """
    Create a new export document.
    """
    return await export_doc.insert()
