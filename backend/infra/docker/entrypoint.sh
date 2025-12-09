#!/usr/bin/env bash
set -e

alembic -c infra/migrations/alembic.ini upgrade head || true
uvicorn app.main:app --host 0.0.0.0 --port 8080 --workers 2
