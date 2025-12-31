try:
    from autogen import AssistantAgent
except Exception:
    AssistantAgent = None

# Import system prompts from individual agents
from app.agents.requirements_agent import REQUIREMENTS_SYSTEM_PROMPT
from app.agents.diagram_agent import DIAGRAM_SYSTEM_PROMPT
from app.agents.planner_agent import PLANNER_SYSTEM_PROMPT
from app.agents.export_agent import EXPORT_SYSTEM_PROMPT


def build_team(model="gpt-4o-mini"):
    """
    Build a team of specialized AutoGen agents for collaborative project blueprint generation.
    
    Each agent has a specific role and expertise, working together through the orchestration
    layer (LangGraph) to transform a user's idea into comprehensive project documentation.
    """
    if AssistantAgent is None:
        return None
    
    base_config = {
        "config_list": [{"model": model}],
        "temperature": 0.3,  # Slightly higher for creativity while maintaining consistency
        "timeout": 120,
    }
    
    return {
        "RequirementsAgent": AssistantAgent(
            name="RequirementsAgent",
            system_message=REQUIREMENTS_SYSTEM_PROMPT,
            llm_config=base_config,
            description="Expert Business Analyst specializing in requirements engineering and user story creation"
        ),
        "DiagramAgent": AssistantAgent(
            name="DiagramAgent", 
            system_message=DIAGRAM_SYSTEM_PROMPT,
            llm_config=base_config,
            description="Expert Software Architect specializing in system design and Mermaid.js diagrams"
        ),
        "PlannerAgent": AssistantAgent(
            name="PlannerAgent",
            system_message=PLANNER_SYSTEM_PROMPT,
            llm_config=base_config,
            description="Expert Project Manager specializing in Agile planning, estimation, and scheduling"
        ),
        "ExportAgent": AssistantAgent(
            name="ExportAgent",
            system_message=EXPORT_SYSTEM_PROMPT,
            llm_config=base_config,
            description="Expert Technical Writer specializing in documentation consolidation and formatting"
        ),
    }
