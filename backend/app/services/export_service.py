from typing import Optional
import json
from app.domain.exports import (
    ExportDomain,
    FunctionalDesignDocument,
    DesignListItem,
    DesignSection,
    GithubExport
)
from app.repositories.exports_repo import (
    get_export_by_project,
    update_export as update_export_repo
)


async def get_by_project(project_id: str) -> Optional[ExportDomain]:
    """
    Retrieve the export document for a given project.
    """
    return await get_export_by_project(project_id)


async def update_from_json(project_id: str, export_json_str: str) -> Optional[ExportDomain]:
    """
    Parse export JSON string and update the export document.
    
    Args:
        project_id: The project ID
        export_json_str: JSON string containing export data
        
    Returns:
        Updated ExportDomain or None if parsing fails
    """
    try:
        # Parse JSON string
        export_data = json.loads(export_json_str)
        
        # Build update data with proper type conversion
        update_data = {}
        
        # Parse document structure
        if "document" in export_data:
            doc_data = export_data["document"]
            
            # Parse goals
            goals = []
            if "goals" in doc_data:
                goals = [DesignListItem(**item) for item in doc_data["goals"]]
            
            # Parse scope_in
            scope_in = []
            if "scope_in" in doc_data:
                scope_in = [DesignListItem(**item) for item in doc_data["scope_in"]]
            
            # Parse scope_out
            scope_out = []
            if "scope_out" in doc_data:
                scope_out = [DesignListItem(**item) for item in doc_data["scope_out"]]
            
            # Parse sections
            sections = []
            if "sections" in doc_data:
                for section_data in doc_data["sections"]:
                    items = []
                    if "items" in section_data:
                        items = [DesignListItem(**item) for item in section_data["items"]]
                    
                    sections.append(DesignSection(
                        title=section_data.get("title", ""),
                        content=section_data.get("content"),
                        items=items
                    ))
            
            # Create FunctionalDesignDocument
            update_data["document"] = FunctionalDesignDocument(
                title=doc_data.get("title", ""),
                description=doc_data.get("description"),
                overview=doc_data.get("overview"),
                goals=goals,
                scope_in=scope_in,
                scope_out=scope_out,
                sections=sections
            )
        
        # Parse github_export
        if "github_export" in export_data:
            update_data["github_export"] = [
                GithubExport(**repo) for repo in export_data["github_export"]
            ]
        
        # Update export document
        return await update_export_repo(project_id, update_data)
        
    except json.JSONDecodeError as e:
        print(f"[EXPORT_SERVICE] Failed to parse JSON: {e}")
        return None
    except Exception as e:
        print(f"[EXPORT_SERVICE] Error updating export: {e}")
        return None


async def update(project_id: str, data: dict) -> Optional[ExportDomain]:
    """
    Update export document with pre-parsed data.
    """
    return await update_export_repo(project_id, data)
