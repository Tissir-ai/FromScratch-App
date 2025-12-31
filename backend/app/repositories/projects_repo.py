from typing import List
from app.domain.project import Project
from app.domain.user import User
from app.domain.role import RoleDomain
from beanie import PydanticObjectId
from bson import ObjectId


async def create_project(project: Project) -> Project:
    return await project.insert()


async def list_projects() -> List[Project]:
    return await Project.find_all().to_list()

async def list_for_user(user_id: str) -> List[dict]:
    """Return projects for a user with projection:
    - id, name, description, members (name + role name), created_at, updated_at
    """
    # Find any user docs that reference this external user id to collect project ids
    user_docs = await User.find({"info_id": user_id}).to_list()
    project_ids_from_users = [u.project_id for u in user_docs if getattr(u, "project_id", None) is not None]

    query = {"$or": [{"created_by": user_id}]}
    if project_ids_from_users:
        query["$or"].append({"_id": {"$in": project_ids_from_users}})

    projects = await Project.find(query).to_list()

    # Pre-fetch roles for efficiency per project later
    results: List[dict] = []
    for proj in projects:
        # resolve members as users that reference this project
        members = await User.find({"project_id": proj.id}).to_list()
        # gather role ids to resolve names
        role_ids = list({m.role_id for m in members if getattr(m, "role_id", None) is not None})
        roles_map = {}
        if role_ids:
            roles = await RoleDomain.find({"_id": {"$in": role_ids}}).to_list()
            roles_map = {r.id: r.name for r in roles}

        members_list = []
        for m in members:
            members_list.append({
                "name": m.name,
                "role_name": roles_map.get(m.role_id) if getattr(m, "role_id", None) is not None else None,
            })

        # Resolve owner name: prefer a User doc tied to this project, fallback to any User with the info_id
        owner_name = proj.created_by
        owner_user = await User.find_one({"info_id": proj.created_by, "project_id": proj.id})
        if not owner_user:
            owner_user = await User.find_one({"info_id": proj.created_by})
        if owner_user:
            owner_name = owner_user.name

        results.append({
            "id": str(proj.id),
            "name": proj.name,
            "description": proj.description,
            "full_description": proj.full_description,
            "owner": {
                "id": proj.created_by,
                "name": owner_name
                },
            "members": members_list,
            "created_at": proj.created_at,
            "updated_at": proj.updated_at,
        })

    return results


async def get_project(project_id: str) -> Project | None:
    return await Project.get(project_id)


async def update_project(project_id: str, data: dict) -> Project | None:
    proj = await Project.get(project_id)
    if not proj:
        return None
    for k, v in data.items():
        setattr(proj, k, v)
    await proj.save()
    return proj


async def delete_project(project_id: str) -> Project | None:
    proj = await Project.get(project_id)
    if proj:
        await proj.delete()
    return proj


async def add_member(project_id: PydanticObjectId, user_id: PydanticObjectId) -> Project | None:
    """Add a user to the project's members list."""
    proj = await Project.get(project_id)
    if not proj:
        return None
    if user_id not in proj.members:
        proj.members.append(user_id)
        await proj.save()
    return proj


async def remove_member(project_id: str, user_id: str) -> Project | None:
    """Remove a user from the project's members list."""
    proj = await Project.get(project_id)
    if not proj:
        return None
    if user_id in proj.members:
        proj.members.remove(user_id)
        await proj.save()
    return proj
