REQUIREMENTS_PROMPT = """
You are a Senior Product Analyst.

Given the idea below, generate:
1. Problem definition
2. Functional requirements
3. Non-functional requirements

Be structured, concise, and professional.

IDEA:
{idea}
"""

ARCHITECTURE_PROMPT = """
You are a Senior Software Architect.

Based on the requirements below, generate:
1. High-level architecture
2. Main components
3. Data flow

REQUIREMENTS:
{requirements}
"""

PLANNER_PROMPT = """
You are an Agile Product Manager.

Based on the architecture below, generate:
1. Epics
2. User stories
3. Acceptance criteria
4. Sprint planning (3 sprints)

ARCHITECTURE:
{architecture}
"""

EXPORT_PROMPT = """
You are a Technical Writer.

Assemble all sections into a clean Markdown blueprint document.

CONTENT:
{content}
"""
