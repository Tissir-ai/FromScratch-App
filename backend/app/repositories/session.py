from __future__ import annotations

from typing import AsyncGenerator, List
import pkgutil
import importlib

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from beanie import init_beanie, Document

from app.core.config import settings
import app.domain as domain_pkg

_client: AsyncIOMotorClient | None = None


async def init_db() -> None:
    """Initialize motor client and Beanie with discovered Document models."""
    global _client
    mongodb_uri = settings.mongodb_uri
    _client = AsyncIOMotorClient(mongodb_uri)

    docs: List[type[Document]] = []
    try:
        # dynamically import app.domain modules and collect Document subclasses
        for finder, name, ispkg in pkgutil.iter_modules(domain_pkg.__path__):
            mod = importlib.import_module(f"app.domain.{name}")
            for attr in dir(mod):
                obj = getattr(mod, attr)
                try:
                    if isinstance(obj, type) and issubclass(obj, Document) and obj is not Document:
                        docs.append(obj)
                except Exception:
                    # ignore non-types and other issues
                    pass
    except Exception:
        # if domain package inspection fails, continue with an empty list
        pass

    await init_beanie(database=_client.get_default_database(), document_models=docs)


async def get_mongo_db() -> AsyncGenerator[AsyncIOMotorDatabase, None]:
    """FastAPI dependency that yields the motor database instance."""
    if _client is None:
        raise RuntimeError("Mongo client is not initialized. Did you call init_db()?")
    yield _client.get_default_database()


def get_client() -> AsyncIOMotorClient | None:
    return _client
