# FromScratch Project

Monolith FastAPI application with LangGraph orchestration, AutoGen agents, and WebSocket streaming.

## Project Structure

The project is organized as follows:

- **`app/`**: Contains the main application source code.
  - **`agents/`**: AI agent implementations using AutoGen and LangGraph (e.g., `autogen_team.py`, `planner_agent.py`).
  - **`api/`**: FastAPI route definitions and API endpoints (v1, websockets).
  - **`core/`**: Core application configuration, security settings, and observability/logging.
  - **`domain/`**: Domain models and business logic definitions.
  - **`llm/`**: Integration with Large Language Model providers.
  - **`repositories/`**: Data access layer and database models.
  - **`services/`**: Business logic services (e.g., `auth_service`, `projects_service`).
- **`infra/`**: Infrastructure and deployment configurations.
  - **`compose/`**: Docker Compose files for development and orchestration.
  - **`docker/`**: Dockerfile and entrypoint scripts.
  - **`migrations/`**: Database migration scripts using Alembic.
- **`libs/`**: Shared libraries and utilities (e.g., `mermaid`, `pdf`).
- **`tests/`**: Unit and integration tests.
- **`pyproject.toml`**: Project dependencies and build configuration.

## Getting Started

### Prerequisites

- Python 3.11+
- Docker & Docker Compose (for database, Redis, MinIO)

### 1. Local Development (Host Uvicorn + Docker Infra)

Follow these numbered steps for a clean local setup. Commands are shown for Windows PowerShell; Linux/macOS equivalents are noted where they differ.

1. **Clone & enter project root** (adjust path as needed):

   ```powershell
   git clone https://github.com/Tissir-ai/FromScratch-Backend.git
   cd FromScratch-Backend   # repository root
   ```
2. **Create & activate virtual environment:**

   ```powershell
   python -m venv venv
   .\venv\Scripts\activate
   ```

   Linux/macOS:

   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. **Install dependencies:**

   - Runtime (recommended):
     ```powershell
     pip install -r requirements.txt
     ```
   - Editable (develop against source):
     ```powershell
     pip install -e .
     ```
4. **Create `.env` from example & adapt for localhost:**

   ```powershell
   copy .env.example .env   # Windows
   ```

   Linux/macOS:

   ```bash
   cp .env.example .env
   ```

   Edit the following in `.env` for host-run (replace container hostnames):

   - `DATABASE_URL=postgresql+psycopg://app:app_pwd@localhost:5433/fromscratch`
   - `REDIS_URL=redis://localhost:6379/0`
   - `STORAGE_ENDPOINT=http://localhost:9000`
     Keep other values (e.g. keys) as needed.
5. **Start infrastructure services only (Postgres, Redis, MinIO):**

   ```powershell
   docker compose -f infra/compose/docker-compose.dev.yml up -d postgres redis minio
   ```

   This maps: Postgres on 5433, Redis on 6379, MinIO on 9000 (console 9001).
6. **Run database migrations:**

   ```powershell
   alembic -c infra/migrations/alembic.ini upgrade head
   ```

   Ensure your venv is active and `.env` loaded so `DATABASE_URL` resolves.
7. **Start API (auto DB init + CORS + routers):**

   ```powershell
   uvicorn app.main:app --reload --port 8000
   ```

   Visit: `http://localhost:8000` (docs at `/docs`, health at `/health`).
8. **(Optional) Start background worker (RQ queue):** In a second shell with venv active:

   ```powershell
   rq worker -u redis://localhost:6379/0 fromscratch
   ```
9. **Stop infra when done:**

   ```powershell
   docker compose -f infra/compose/docker-compose.dev.yml down
   ```

### 2. Full Docker Stack (API + Worker + Infra)

Use this when you want everything containerized.

1. **Create `.env` (container networking):**

   ```powershell
   copy .env.example .env
   ```

   Do NOT change hostnames (`postgres`, `redis`, `minio`).
2. **Build images:**

   ```powershell
   docker compose -f infra/compose/docker-compose.dev.yml build
   ```
3. **Start all services (API, worker, Postgres, Redis, MinIO):**

   ```powershell
   docker compose -f infra/compose/docker-compose.dev.yml up -d
   ```

   API available at: `http://localhost:8080`
4. **View logs (follow API):**

   ```powershell
   docker compose -f infra/compose/docker-compose.dev.yml logs -f api
   ```
5. **Migrations:** EntryPoint runs `alembic upgrade head` automatically. To re-run manually:

   ```powershell
   docker compose exec api alembic -c infra/migrations/alembic.ini upgrade head
   ```
6. **Worker status/logs:**

   ```powershell
   docker compose logs -f worker
   ```
7. **Tear down (remove containers, keep volumes):**

   ```powershell
   docker compose -f infra/compose/docker-compose.dev.yml down
   ```

   To also remove volumes:

   ```powershell
   docker compose -f infra/compose/docker-compose.dev.yml down -v
   ```

### 3. Common Troubleshooting

- Migration errors: verify `.env` values and that Postgres container is healthy: `docker compose ps`.
- MinIO access: console at `http://localhost:9001` (full stack) or after infra-only start.
- Worker not processing: ensure Redis URL matches `.env` and queue name `fromscratch` is used in producers.
- Port conflicts: adjust published ports in `infra/compose/docker-compose.dev.yml` or uvicorn `--port` locally.

```
