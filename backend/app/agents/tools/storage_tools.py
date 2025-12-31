# ============================================================================
# MINIO STORAGE TOOLS - DEPRECATED / COMMENTED
# ============================================================================
# Les développeurs frontend préfèrent recevoir le texte brut directement
# dans la réponse API plutôt que des fichiers MinIO.
# Ce fichier est conservé pour référence mais n'est plus utilisé.
# ============================================================================

# from minio import Minio
# from app.core.config import settings
# from io import BytesIO
# import uuid

# client = Minio(
#     settings.storage_endpoint.replace("http://","").replace("https://",""),
#     access_key=settings.storage_access_key,
#     secret_key=settings.storage_secret_key,
#     secure=settings.storage_endpoint.startswith("https://")
# )

# def ensure_bucket():
#     try:
#         if not client.bucket_exists(settings.storage_bucket):
#             client.make_bucket(settings.storage_bucket)
#     except Exception:
#         pass

# def put_text(prefix: str, text: str) -> str:
#     ensure_bucket()
#     key = f"{prefix}/{uuid.uuid4().hex}.md"
#     data = text.encode("utf-8")
#     client.put_object(
#         settings.storage_bucket, key, BytesIO(data), len(data), content_type="text/markdown"
#     )
#     return f"s3://{settings.storage_bucket}/{key}"


# def get_object(key: str) -> bytes:
#     """
#     Récupère un fichier depuis MinIO.
#     key: le chemin du fichier (ex: "projects/1/exports/xxx.md")
#     """
#     ensure_bucket()
#     response = client.get_object(settings.storage_bucket, key)
#     data = response.read()
#     response.close()
#     response.release_conn()
#     return data


# def parse_s3_uri(uri: str) -> str:
#     """
#     Parse une URI S3 et retourne la clé.
#     Ex: "s3://fromscratch/projects/1/exports/xxx.md" -> "projects/1/exports/xxx.md"
#     """
#     if uri.startswith("s3://"):
#         parts = uri.replace("s3://", "").split("/", 1)
#         if len(parts) == 2:
#             return parts[1]
#     return uri


# async def put_json(project_id: int, content: str, filename: str = None) -> str:
#     """
#     Sauvegarde du JSON dans MinIO pour le frontend.
#     project_id: ID du projet
#     content: Contenu JSON (string)
#     filename: Nom du fichier optionnel
#     """
#     ensure_bucket()
#     
#     if filename:
#         key = f"projects/{project_id}/diagrams/{filename}"
#     else:
#         key = f"projects/{project_id}/diagrams/{uuid.uuid4().hex}.json"
#     
#     data = content.encode("utf-8")
#     client.put_object(
#         settings.storage_bucket, 
#         key, 
#         BytesIO(data), 
#         len(data), 
#         content_type="application/json"
#     )
#     return f"s3://{settings.storage_bucket}/{key}"

# ============================================================================
# PLACEHOLDER FUNCTIONS - Pour éviter les erreurs d'import
# ============================================================================

def put_text(prefix: str, text: str) -> str:
    """DEPRECATED: Returns empty string instead of MinIO URI"""
    return ""

def get_object(key: str) -> bytes:
    """DEPRECATED: Returns empty bytes"""
    return b""

def parse_s3_uri(uri: str) -> str:
    """DEPRECATED: Returns empty string"""
    return ""

async def put_json(project_id: int, content: str, filename: str = None) -> str:
    """DEPRECATED: Returns empty string instead of MinIO URI"""
    return ""
