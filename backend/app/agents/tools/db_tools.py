# DEPRECATED: Ce module utilisait SQLModel, maintenant remplacé par MongoDB async
# Si besoin de persister des artifacts, utiliser runs_repo.update_run_state()

# from sqlmodel import Session
# from app.repositories import artifact_repo
#
# def persist_artifact(session: Session, project_id: int, kind: str, content: str, storage_uri: str) -> int:
#     art = artifact_repo.add_artifact(session, project_id, kind, storage_uri, summary=content[:200])
#     return art.id

pass  # Module vide, gardé pour compatibilité
