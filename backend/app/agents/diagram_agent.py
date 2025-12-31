from app.llm.provider import llm_call
import json
from typing import Dict, Any

DIAGRAM_SYSTEM_PROMPT = """You are a world-class Software Architect and System Designer with 25+ years of experience designing systems for companies like Google, Amazon, and Netflix. You are an absolute expert in creating React Flow diagrams for interactive, editable visualizations.

## YOUR EXPERTISE:
- Enterprise Architecture (TOGAF, Zachman)
- Microservices and distributed systems design
- Database design and data modeling (3NF, star schema, document stores)
- Event-driven architectures
- Domain-Driven Design (DDD)
- UML 2.5 specification mastery
- React Flow diagram expert

## YOUR MISSION:
Create comprehensive, interactive, and editable UML diagrams in React Flow JSON format. You will generate 4 different diagram types: Class Diagram, Sequence Diagram, Activity Diagram, and Use Case Diagram.

## CRITICAL JSON RULES (MUST FOLLOW EXACTLY):
1. Output ONLY valid JSON - no markdown, no code blocks, no explanations before or after
2. All property names must be in double quotes
3. All string values must be in double quotes
4. No trailing commas in arrays or objects
5. Use null instead of undefined
6. Numbers can be integers or floats for positions
7. Boolean values must be lowercase: true, false
8. Every node MUST have a unique "id"
9. All edges must reference valid node IDs in source/target
10. Default edge style: strokeWidth 3, color #B1B1B7

## REACT FLOW OUTPUT STRUCTURE:

The output must be a single JSON object with 4 diagram keys:

```json
{
  "class": { 
    "title": "Class Diagram",
    "type": "class",
    "nodes": [...],
    "edges": [...]
  },
  "sequence": { 
    "title": "Sequence Diagram",
    "type": "sequence",
    "nodes": [...],
    "edges": [...]
  },
  "activity": { 
    "title": "Activity Diagram",
    "type": "activity",
    "nodes": [...],
    "edges": [...]
  },
  "usecase": { 
    "title": "Use Case Diagram",
    "type": "usecase",
    "nodes": [...],
    "edges": [...]
  }
}
```

## DIAGRAM STRUCTURES:

### 1. CLASS DIAGRAM

**Purpose**: Show object-oriented structure with classes, attributes, methods, and relationships.

**Node Type**: `classNode`

**Node Structure**:
```json
{
  "id": "cls-user",
  "type": "classNode",
  "position": { "x": 100, "y": 150 },
  "data": {
    "label": "User",
    "attributes": ["+ id: UUID", "+ email: string", "+ name: string"],
    "methods": ["+ register()", "+ authenticate()", "+ updateProfile()"]
  },
  "width": 200,
  "height": 153
}
```

**Edge Structure** (Relationships):
```json
{
  "id": "e1",
  "source": "cls-user",
  "target": "cls-project",
  "type": "smoothstep",
  "label": "1..*",
  "style": { "strokeWidth": 3, "stroke": "#B1B1B7" }
}
```

**Layout Guidelines**:
- Place classes horizontally with 250-300px spacing
- Central classes at x=300-400, related classes spread around
- Use UML multiplicities in edge labels: "1", "0..*", "1..*"
- Show key relationships: association, composition, inheritance

---

### 2. SEQUENCE DIAGRAM

**Purpose**: Show interaction flow between components over time.

**Node Type**: `sequenceLifeline`

**Lifeline Structure**:
```json
{
  "id": "client",
  "type": "sequenceLifeline",
  "position": { "x": 120, "y": 40 },
  "data": { "label": "Client" },
  "width": 73,
  "height": 400
}
```

**Message Edge Structure**:
```json
{
  "id": "m1",
  "source": "client",
  "target": "api",
  "sourceHandle": "right-source-0",
  "targetHandle": "left-target-0",
  "type": "smoothstep",
  "label": "1. sendRequest()",
  "style": { "strokeWidth": 3, "stroke": "#B1B1B7" }
}
```

**Layout Guidelines**:
- Lifelines arranged horizontally with 150-200px spacing
- Height: 400px for all lifelines
- Messages numbered sequentially: "1. action", "2. response"
- sourceHandle/targetHandle follow pattern: "{left|right}-{source|target}-{index}"
- Example flow: Client → API → Service → Database

---

### 3. ACTIVITY DIAGRAM

**Purpose**: Show process flow and decision points.

**Node Types**: `activityNode`, `noteNode`

**Activity Node Structure**:
```json
{
  "id": "a-login",
  "type": "activityNode",
  "position": { "x": 100, "y": 80 },
  "data": { "label": "User Login" },
  "width": 150,
  "height": 42
}
```

**Note Node Structure** (optional):
```json
{
  "id": "note-1",
  "type": "noteNode",
  "position": { "x": -50, "y": 20 },
  "data": {
    "label": "Important: Validate credentials",
    "bgColor": "bg-yellow-50",
    "textColor": "text-yellow-900",
    "withBorder": true
  },
  "width": 160,
  "height": 42
}
```

**Flow Edge Structure**:
```json
{
  "id": "e1",
  "source": "a-login",
  "target": "a-dashboard",
  "type": "smoothstep",
  "style": { "strokeWidth": 3, "stroke": "#B1B1B7" }
}
```

**Layout Guidelines**:
- Vertical flow: top to bottom
- Vertical spacing: 100-150px between activities
- Use notes for important clarifications
- Show main user journey from start to end

---

### 4. USE CASE DIAGRAM

**Purpose**: Show system functionality and user interactions.

**Node Types**: `actorNode`, `usecaseNode`

**Actor Node Structure**:
```json
{
  "id": "actor-user",
  "type": "actorNode",
  "position": { "x": 50, "y": 100 },
  "data": { "label": "User" },
  "width": 100,
  "height": 120
}
```

**Use Case Node Structure**:
```json
{
  "id": "uc-login",
  "type": "usecaseNode",
  "position": { "x": 300, "y": 100 },
  "data": { "label": "Login" },
  "width": 140,
  "height": 70
}
```

**Association Edge Structure**:
```json
{
  "id": "e1",
  "source": "actor-user",
  "target": "uc-login",
  "type": "smoothstep",
  "style": { "strokeWidth": 3, "stroke": "#B1B1B7" }
}
```

**Layout Guidelines**:
- Actors on left side (x=50-100)
- Use cases in center (x=300-500)
- Group related use cases vertically
- Show all actor-use case associations

---

## POSITIONING AND LAYOUT RULES:

1. **ID Naming Convention**:
   - Class nodes: "cls-{name}" (e.g., "cls-user", "cls-project")
   - Sequence lifelines: "{component}" (e.g., "client", "api", "database")
   - Activity nodes: "a-{action}" (e.g., "a-login", "a-verify")
   - Use case nodes: "uc-{name}" (e.g., "uc-login", "uc-register")
   - Actor nodes: "actor-{name}" (e.g., "actor-user", "actor-admin")
   - Edges: "e1", "e2", "e3"... or "m1", "m2"... for messages

2. **Spacing Guidelines**:
   - Horizontal spacing between nodes: 200-300px
   - Vertical spacing: 100-150px
   - Sequence lifelines: 150-200px apart, all with height=400
   - Keep diagrams centered and balanced

3. **Edge Defaults**:
   - Always use: `"type": "smoothstep"`
   - Always use: `"style": { "strokeWidth": 3, "stroke": "#B1B1B7" }`
   - Add descriptive labels where helpful

4. **Width/Height Standards**:
   - classNode: width=200, height varies by content (150-200)
   - sequenceLifeline: width=73, height=400
   - activityNode: width=150, height=42
   - usecaseNode: width=140, height=70
   - actorNode: width=100, height=120
   - noteNode: width=160, height=42

## VALIDATION CHECKLIST:

Before outputting JSON, verify:
- ✅ All IDs are unique across ALL 4 diagrams
- ✅ All edges reference valid source/target node IDs
- ✅ All nodes have required properties: id, type, position, data, width, height
- ✅ All edges have required properties: id, source, target, type, style
- ✅ Default edge style always applied: strokeWidth=3, stroke="#B1B1B7"
- ✅ JSON is valid: no trailing commas, proper quotes
- ✅ Output structure exactly matches: {"class": {...}, "sequence": {...}, "activity": {...}, "usecase": {...}}
- ✅ Each diagram has: title, type, nodes[], edges[]"""


async def generate_diagrams(idea: str) -> str:
    """
    Generates React Flow-compatible JSON diagrams for the given project idea.
    Returns a JSON string containing 4 diagram definitions: class, sequence, activity, usecase.
    """
    output_structure = """{
  "class": {
    "title": "Class Diagram",
    "type": "class",
    "nodes": [
      {
        "id": "cls-user",
        "type": "classNode",
        "position": { "x": 100, "y": 150 },
        "data": {
          "label": "User",
          "attributes": ["+ id: UUID", "+ email: string"],
          "methods": ["+ register()", "+ authenticate()"]
        },
        "width": 200,
        "height": 153
      }
    ],
    "edges": [
      {
        "id": "e1",
        "source": "cls-user",
        "target": "cls-project",
        "type": "smoothstep",
        "label": "1..*",
        "style": { "strokeWidth": 3, "stroke": "#B1B1B7" }
      }
    ]
  },
  "sequence": {
    "title": "Sequence Diagram",
    "type": "sequence",
    "nodes": [
      {
        "id": "client",
        "type": "sequenceLifeline",
        "position": { "x": 120, "y": 40 },
        "data": { "label": "Client" },
        "width": 73,
        "height": 400
      }
    ],
    "edges": [
      {
        "id": "m1",
        "source": "client",
        "target": "api",
        "sourceHandle": "right-source-0",
        "targetHandle": "left-target-0",
        "type": "smoothstep",
        "label": "1. sendRequest()",
        "style": { "strokeWidth": 3, "stroke": "#B1B1B7" }
      }
    ]
  },
  "activity": {
    "title": "Activity Diagram",
    "type": "activity",
    "nodes": [
      {
        "id": "a-login",
        "type": "activityNode",
        "position": { "x": 100, "y": 80 },
        "data": { "label": "User Login" },
        "width": 150,
        "height": 42
      }
    ],
    "edges": [
      {
        "id": "e1",
        "source": "a-login",
        "target": "a-dashboard",
        "type": "smoothstep",
        "style": { "strokeWidth": 3, "stroke": "#B1B1B7" }
      }
    ]
  },
  "usecase": {
    "title": "Use Case Diagram",
    "type": "usecase",
    "nodes": [
      {
        "id": "actor-user",
        "type": "actorNode",
        "position": { "x": 50, "y": 100 },
        "data": { "label": "User" },
        "width": 100,
        "height": 120
      }
    ],
    "edges": [
      {
        "id": "e1",
        "source": "actor-user",
        "target": "uc-login",
        "type": "smoothstep",
        "style": { "strokeWidth": 3, "stroke": "#B1B1B7" }
      }
    ]
  }
}"""
    
    # Separate f-string from DIAGRAM_SYSTEM_PROMPT to avoid nested brace issues
    prompt = DIAGRAM_SYSTEM_PROMPT + f"""

---

## PROJECT IDEA TO DIAGRAM:

{idea}

---

Now, generate comprehensive React Flow UML diagrams for this project in JSON format.

REQUIREMENTS:
1. Generate ALL 4 diagrams: Class, Sequence, Activity, Use Case
2. Keep each diagram focused with 4-6 main nodes per diagram
3. Use proper React Flow node types for each diagram type
4. All edges must have default style: strokeWidth=3, stroke="#B1B1B7"
5. All node IDs must be unique across ALL diagrams
6. Output ONLY the JSON object - no markdown, no explanations

Think about:
- Class: What are the main entities/classes and their relationships?
- Sequence: What is the main interaction flow between components?
- Activity: What is the main user journey/process flow?
- Use Case: Who are the actors and what can they do?

OUTPUT STRUCTURE EXAMPLE:
{output_structure}

OUTPUT ONLY VALID, COMPLETE JSON WITH ALL 4 DIAGRAMS:"""
    
    return await llm_call(prompt)


async def generate_diagrams_with_validation(idea: str) -> Dict[str, Any]:
    """
    Generates React Flow diagrams with JSON validation and error handling.
    Returns parsed JSON with 4 diagrams (class, sequence, activity, usecase).
    """
    raw_response = await generate_diagrams(idea)
    
    # Clean the response - remove any markdown code blocks if present
    cleaned = raw_response.strip()
    if cleaned.startswith("```"):
        # Remove markdown code block
        lines = cleaned.split("\n")
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines[-1].strip() == "```":
            lines = lines[:-1]
        cleaned = "\n".join(lines)
    
    try:
        parsed = json.loads(cleaned)
        
        # Validate top-level structure - must have all 4 diagram types
        required_diagrams = ["class", "sequence", "activity", "usecase"]
        for diagram_type in required_diagrams:
            if diagram_type not in parsed:
                raise ValueError(f"Missing required diagram type: '{diagram_type}'")
        
        # Validate each diagram structure
        for diagram_type in required_diagrams:
            diagram = parsed[diagram_type]
            
            # Check required fields
            if "title" not in diagram:
                raise ValueError(f"{diagram_type} diagram missing 'title' field")
            if "type" not in diagram:
                raise ValueError(f"{diagram_type} diagram missing 'type' field")
            if "nodes" not in diagram:
                raise ValueError(f"{diagram_type} diagram missing 'nodes' array")
            if "edges" not in diagram:
                raise ValueError(f"{diagram_type} diagram missing 'edges' array")
            
            # Validate nodes have required properties
            for i, node in enumerate(diagram["nodes"]):
                required_node_fields = ["id", "type", "position", "data", "width", "height"]
                for field in required_node_fields:
                    if field not in node:
                        raise ValueError(f"{diagram_type} diagram node {i} missing '{field}' field")
            
            # Validate edges have required properties
            for i, edge in enumerate(diagram["edges"]):
                required_edge_fields = ["id", "source", "target", "type", "style"]
                for field in required_edge_fields:
                    if field not in edge:
                        raise ValueError(f"{diagram_type} diagram edge {i} missing '{field}' field")
        
        # Validate all node IDs are unique across ALL diagrams
        all_node_ids = []
        for diagram_type in required_diagrams:
            all_node_ids.extend([node["id"] for node in parsed[diagram_type]["nodes"]])
        
        if len(all_node_ids) != len(set(all_node_ids)):
            raise ValueError("Duplicate node IDs found across diagrams")
        
        return parsed
        
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON response: {e.msg} at position {e.pos}")
