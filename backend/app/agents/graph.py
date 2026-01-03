from __future__ import annotations

from langgraph.graph import StateGraph, END
from uuid import UUID

from app.agents.state import BlueprintState
from app.agents.nodes import (
    node_metadata,
    node_requirements,
    node_diagrams,
    node_planner,
    node_export,
    make_initial_state,
)

def build_graph():
    g = StateGraph(BlueprintState)

    g.add_node("METADATA", node_metadata)
    g.add_node("REQUIREMENTS", node_requirements)
    g.add_node("DIAGRAMS", node_diagrams)
    g.add_node("PLANNER", node_planner)
    g.add_node("EXPORT", node_export)

    g.set_entry_point("METADATA")
    g.add_edge("METADATA", "REQUIREMENTS")
    g.add_edge("REQUIREMENTS", "DIAGRAMS")
    g.add_edge("DIAGRAMS", "PLANNER")
    g.add_edge("PLANNER", "EXPORT")
    g.add_edge("EXPORT", END)

    return g.compile()


async def run_blueprint_pipeline(
    project_id: str,
    run_id: UUID,
    idea: str,
) -> dict:
    """
    Execute le pipeline complet d'agents pour générer un blueprint.
    MongoDB async - plus besoin de session SQL.
    """
    graph = build_graph()

    state: BlueprintState = make_initial_state(
        project_id=project_id,
        run_id=run_id,
        idea=idea,
    )

    final_state: BlueprintState = await graph.ainvoke(state)
    return {
        "blueprint_markdown": final_state.get("blueprint_markdown"),
        "requirements": final_state.get("requirements_content"),
        "diagrams": final_state.get("diagrams_content"),
        "diagrams_json": final_state.get("diagrams_json_content"),
        "plan": final_state.get("planner_content"),
    }
