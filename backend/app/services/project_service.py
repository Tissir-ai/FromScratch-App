from typing import List
from app.domain.user import User
from app.domain.project import Project
from app.domain.role import RoleDomain
from app.domain.task import TaskDomain
from app.domain.diagram import DiagramDomain
from app.domain.requirement import RequirementDomain
from app.domain.log import LogDomain
from app.domain.chats import ChatDomain
from app.repositories.projects_repo import (
    create_project,
    list_projects,
    list_for_user as repo_list_for_user,
    get_project,
    update_project,
    add_member,
    remove_member,
    delete_project,
)
from app.repositories.diagrams_repo import create_diagram , delete_diagram
from app.repositories.tasks_repo import create_task , delete_task , get_today_tasks
from app.repositories.requirements_repo import create_requirement ,  delete_all_requirements
from app.repositories.logs_repo import create_log, delete_log 
from app.repositories.chat_repo import create_chat , delete_chat
from app.services.role_service import delete_role , get_roles_by_project
from app.repositories.users_repo import set_role, create_user , delete_user , get_users_by_project

from app.services.role_service import get_roles_info_by_project
from app.services.user_service import get_members_info


async def create(payload: Project) -> Project:
    """
    Create a project.
    """
    return await create_project(payload)


async def create_project_with_roles(payload: object, current_user: object) -> Project:
    creator_id = current_user.get("id")
    print(f"Creating project with creator_id: {creator_id}")
    # Set the creator on the payload and create the project
    project = Project(
        name=payload.name, description=payload.description, created_by=creator_id
    )
    project = await create_project(project)

    # Define default role templates
    role_templates = {
        "Owner": [
            "manage_project",
            "view_overview",
            "view_diagrams",
            "create_diagrams",
            "edit_diagrams",
            "delete_diagrams",
            "view_tasks",
            "create_tasks",
            "edit_tasks",
            "delete_tasks",
            "view_requirements",
            "create_requirements",
            "edit_requirements",
            "delete_requirements",
            "view_logs",
            "create_logs",
            "edit_logs",
            "delete_logs",
        ],
        "Manager": [
            "view_diagrams",
            "create_diagrams",
            "edit_diagrams",
            "view_tasks",
            "create_tasks",
            "edit_tasks",
            "view_requirements",
            "create_requirements",
            "edit_requirements",
        ],
        "Dev": [
            "view_diagrams",
            "create_diagrams",
            "edit_diagrams",
            "view_tasks",
            "create_tasks",
            "edit_tasks",
        ],
        "Guest": [],
    }

    owner_role = None

    # Create all roles for this project
    for role_name, permissions in role_templates.items():
        role = RoleDomain(
            project_id=project.id,
            name=role_name,
            permissions=permissions,
        )
        await role.insert()

        # Keep reference to Owner role to assign to creator
        if role_name == "Owner":
            owner_role = role

    # Ensure the creator user exists and assign Owner role
    if owner_role:
        # Add owner to project members
        user_obj = await create_user(
            User(
                info_id=creator_id, name=current_user.get("name"), project_id=project.id
            )
        )
        # Assign the Owner role to the user
        await set_role(user_obj.id, owner_role.id)
        # Add user to project members by id
        await add_member(project.id, user_obj.id)

    diagram = await create_diagram(DiagramDomain(project_id=project.id))
    task = await create_task(TaskDomain(project_id=project.id))
    requirement = await create_requirement(RequirementDomain(project_id=project.id))
    log = await create_log(LogDomain(project_id=project.id))
    chat = await create_chat(ChatDomain(project_id=project.id))

    await update_project(
        project.id,
        {
            "diagrams_id": diagram.id,
            "tasks_id": task.id,
            "requirements_id": requirement.id,
            "logs_id": log.id,
            "chats_id": chat.id,
        },
    )
    return project


async def list_all() -> List[Project]:
    return await list_projects()


async def list_for_user(user_id: str) -> List[dict]:
    """Delegate to repository to list projects for a given user id."""
    return await repo_list_for_user(user_id)


async def get_by_id(project_id: str) -> Project | None:
    return await get_project(project_id)


async def update(project_id: str, data: dict) -> Project | None:
    return await update_project(project_id, data)


async def delete(project: Project) -> Project | None:
    if project.chats_id is not None:
        await delete_chat(project.chats_id) 
    if project.logs_id is not None:
        await delete_log(project.logs_id)
    if project.requirements_id is not None:
        await delete_all_requirements(project.requirements_id)
    if project.tasks_id is not None:
        await delete_task(project.tasks_id)
    if project.diagrams_id is not None:
        await delete_diagram(project.diagrams_id)
    # Delete all users associated with the project
    users = await get_users_by_project(project.id)
    if users:
        for user in users:
            await delete_user(user.id)
    # Delete all roles associated with the project
    roles = await get_roles_by_project(project.id)
    if roles:
        for role in roles:
            await delete_role(role.id)
    # Finally, delete the project itself
    await delete_project(project.id)
    return project


async def invite_member(project_id: str, member_id: str) -> Project | None:
    """Invite a user to the project.

    Caller must have manage_project permission. The actual role assignment
    is handled separately via the user/role services.
    """
    project = await get_project(project_id)
    if not project:
        return None
    # Permission check should be done at API layer
    return await add_member(project_id, member_id)


async def remove_member_from_project(project_id: str, member_id: str) -> Project | None:
    """Remove a member from the project (requires manage_project permission)."""
    project = await get_project(project_id)
    if not project:
        return None
    # Permission check should be done at API layer
    return await remove_member(project_id, member_id)


async def load_overview(project: Project) -> dict:
    try:
        tasks = await get_today_tasks(project.id)
        teams = await get_roles_info_by_project(project.id)
        members = await get_members_info(project.id)

        # Ensure we have valid data structures even if queries fail
        overview = {
            "name": project.name,
            "description": project.full_description or project.description or "",
            "tasks": tasks or [],
            "teams": teams or [],
            "members": members or [],
            "project_created_at": project.created_at,
        }
        return overview
    except Exception as e:
        print(f"Error loading overview for project {project.id}: {e}")
        # Return minimal overview data on error to prevent 500
        return {
            "name": project.name,
            "description": project.full_description or project.description or "",
            "tasks": [],
            "teams": [],
            "members": [],
            "project_created_at": project.created_at,
        }
