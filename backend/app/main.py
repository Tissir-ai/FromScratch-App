from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.observability import logger
from app.repositories.session import init_db
from app.api.v1.idea import router as idea_router
from app.api.v1.projects import router as projects_router
from app.api.v1.exports import router as exports_router
from app.api.ws import router as ws_router

def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(idea_router)
    app.include_router(projects_router)
    app.include_router(exports_router)
    app.include_router(ws_router)

    @app.on_event("startup")
    def _startup():
        logger.info("Starting app; initializing DB")
        try:
            init_db()
        except Exception as e:
                logger.error(f"DB init failed: {e}")

    @app.get("/health")
    def health():
        return {"status": "ok"}

    return app

app = create_app()
