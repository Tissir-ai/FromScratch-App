import json
from app.llm.provider import llm_call

METADATA_SYSTEM_PROMPT = """You are an expert project naming and branding consultant. Your task is to analyze a project idea and generate professional, concise project metadata.

## YOUR MISSION:
Extract and generate clear, professional project metadata that will be used to identify and describe the project.

## OUTPUT FORMAT:
You MUST return ONLY valid JSON with this exact structure (no additional text, no markdown):

{
  "name": "Short, professional project name (max 60 characters)",
  "description": "Clear one-sentence description of what the project does (max 200 characters)"
}

## GUIDELINES:
- **name**: Should be catchy, professional, and memorable. Use title case. No special characters except spaces and hyphens.
- **description**: Should clearly explain the project's core purpose in one sentence. Focus on the main value proposition.
- Think about real-world project names: "E-Commerce Platform", "Task Management System", "AI-Powered Analytics Dashboard"
- Be specific but concise - avoid generic terms like "App" or "System" unless necessary

## EXAMPLES:

Input: "I want to build a platform where students can find tutors and book sessions online"
Output:
{
  "name": "TutorConnect Platform",
  "description": "Online marketplace connecting students with qualified tutors for personalized learning sessions"
}

Input: "mobile app for tracking daily water intake with reminders"
Output:
{
  "name": "HydroTrack",
  "description": "Mobile app that helps users stay hydrated by tracking water intake and sending smart reminders"
}

Input: "system to manage inventory and orders for small businesses with barcode scanning"
Output:
{
  "name": "SmartStock Inventory Manager",
  "description": "Inventory and order management system for small businesses with integrated barcode scanning"
}

Remember: Return ONLY the JSON object, nothing else."""


async def generate_project_metadata(idea: str) -> dict:
    """
    Generate project name and description from the user's idea using LLM.
    
    Args:
        idea: The user's project idea/description
        
    Returns:
        dict with keys: 'name' and 'description'
        
    Raises:
        ValueError: If LLM response is not valid JSON or missing required fields
    """
    prompt = f"""{METADATA_SYSTEM_PROMPT}

---

## PROJECT IDEA TO ANALYZE:

{idea}

---

Generate the project metadata JSON now:"""
    
    try:
        response = await llm_call(prompt)
        
        # Clean response (remove markdown code blocks if present)
        response = response.strip()
        if response.startswith("```json"):
            response = response[7:]
        if response.startswith("```"):
            response = response[3:]
        if response.endswith("```"):
            response = response[:-3]
        response = response.strip()
        
        # Parse JSON
        metadata = json.loads(response)
        
        # Validate required fields
        if "name" not in metadata or "description" not in metadata:
            raise ValueError("Missing required fields: name or description")
        
        # Validate field lengths
        if len(metadata["name"]) > 60:
            metadata["name"] = metadata["name"][:60].strip()
        
        if len(metadata["description"]) > 200:
            metadata["description"] = metadata["description"][:200].strip()
        
        return metadata
        
    except json.JSONDecodeError as e:
        # Fallback: extract from idea
        print(f"[METADATA_AGENT] JSON decode error: {e}. Using fallback.")
        return {
            "name": idea[:60].strip() if len(idea) <= 60 else idea[:57].strip() + "...",
            "description": idea[:200].strip() if len(idea) <= 200 else idea[:197].strip() + "..."
        }
    except Exception as e:
        print(f"[METADATA_AGENT] Unexpected error: {e}. Using fallback.")
        return {
            "name": "Untitled Project",
            "description": idea[:200].strip() if len(idea) <= 200 else idea[:197].strip() + "..."
        }
