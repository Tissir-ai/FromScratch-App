# app/api/v1/idea_simple.py
from fastapi import APIRouter
from pydantic import BaseModel
from app.llm.provider import llm_call

router = APIRouter(prefix="/v1/idea", tags=["idea-simple"])


class IdeaIn(BaseModel):
    project_id: int
    idea: str


@router.post("/generate_simple")
async def generate_blueprint_simple(payload: IdeaIn):
    prompt = f"""
You are a senior software architect and product owner.
Your task is to design a complete blueprint for the following project idea:

---

PROJECT_ID: {payload.project_id}
IDEA: {payload.idea}

---

Produce a structured answer in clear Markdown with the following sections:

1. Problem Definition
   - Context
   - Pain points
   - Goals

2. Functional Requirements
   - List as FR-1, FR-2, ... with short descriptions

3. Non-functional Requirements
   - Performance, scalability, security, UX, observability, etc.

4. Epics & User Stories
   - Epics as: EPIC-1, EPIC-2, ...
   - For each epic, list user stories as:
     - US-1.1: As a [role], I want [feature] so that [benefit].
     - Add Acceptance Criteria for each user story.

5. Architecture Overview
   - High-level components
   - Data flow description
   - Suggested tech stack (backend, frontend, database, infra, LLM, vector store, etc.)

6. UML Sequence Diagram (text description)
   - Describe at least one main sequence (e.g. "User uploads PDF", "System extracts & analyzes", etc.)

7. Sprint Planning (for 3 sprints)
   - Sprint 1: items, priorities
   - Sprint 2: items, priorities
   - Sprint 3: items, priorities

Answer in Markdown, well structured, easy to convert to a document later.
"""

    answer = await llm_call(prompt)
    return {
        "project_id": payload.project_id,
        "idea": payload.idea,
        "blueprint_markdown": answer,
    }
