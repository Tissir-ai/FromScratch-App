from app.api.webhook import router as webhook_router
from fastapi.responses import JSONResponse

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.repositories.session import init_db
from app.core.observability import logger
from app.api.v1.projects import router as projects_router
from app.api.v1.diagrams import router as diagrams_router
from app.api.v1.requirements import router as requirements_router
from app.api.v1.tasks import router as tasks_router
from app.api.v1.logs import router as logs_router
from app.api.v1.roles import router as roles_router
from app.api.v1.realtime import router as realtime_router
from app.api.v1.reports import router as reports_router

from app.api.v1.chat import router as chat_router

# Routes agents
from app.api.v1.idea import router as idea_router
from app.api.v1.runs import router as runs_router
from app.llm.provider import llm_call

def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name)
    # Ensure the frontend origin and custom headers (like `x-user`) are allowed.
    cors_origins = list(settings.cors_origins_list)
   
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["x-user"],
    )
    # Add /api prefix to all v1 routes
    app.include_router(projects_router, prefix="/api")
    app.include_router(diagrams_router, prefix="/api")
    app.include_router(requirements_router, prefix="/api")
    app.include_router(tasks_router, prefix="/api")
    app.include_router(logs_router, prefix="/api")
    app.include_router(roles_router, prefix="/api")
    app.include_router(realtime_router, prefix="/api")
    app.include_router(reports_router, prefix="/api")
    app.include_router(chat_router, prefix="/api")

    # Routes agents (votre travail)
    app.include_router(idea_router, prefix="/api")
    app.include_router(runs_router, prefix="/api")
    app.include_router(webhook_router)

    @app.on_event("startup")
    async def _startup():
        logger.info("Starting app; initializing DB")
        try:
            await init_db()
        except Exception as e:
            logger.error(f"DB init failed: {e}")

    @app.get("/health")
    def health():
        return {
            "status": "healthy",
            "service": "backend",
        }
    

    # ✅ Route de test LLM
    @app.get("/test-llm")
    async def test_llm(q: str = "Hello"):
        try:
            answer = await llm_call(q)
            return {"input": q, "output": answer}
        except Exception as e:
            return JSONResponse(
                status_code=500,
                content={"error": str(e)},
            )

    return app

app = create_app()
