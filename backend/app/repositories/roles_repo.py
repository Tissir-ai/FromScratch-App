from typing import List
from app.domain.role import RoleDomain as RoleDomainModel


async def create_role(role: RoleDomainModel) -> RoleDomainModel:
    return await role.insert()


async def get_roles_by_project(project_id: str) -> List[RoleDomainModel]:
    return await RoleDomainModel.find(RoleDomainModel.project_id == project_id).to_list()


async def get_role_by_id(doc_id: str) -> RoleDomainModel | None:
    return await RoleDomainModel.get(doc_id)


async def update_role(payload: RoleDomainModel) -> RoleDomainModel | None:
    doc = await RoleDomainModel.get(payload.id)
    if not doc:
        return None
    for k, v in payload.dict().items():
        setattr(doc, k, v)
    await doc.save()
    return doc


async def delete_role(role_id: str) -> RoleDomainModel | None:
    doc = await RoleDomainModel.get(role_id)
    if doc:
        await doc.delete()
    return doc
