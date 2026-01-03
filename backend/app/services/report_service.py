from __future__ import annotations

import asyncio
from dataclasses import dataclass
from datetime import datetime
from io import BytesIO
from typing import List, Optional, Dict

from markdown import markdown
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer, Image
from reportlab.graphics.shapes import Drawing, Circle, Line
from reportlab.graphics import renderPDF, renderSVG, renderPM

from app.repositories.diagrams_repo import get_diagrams_by_project
from app.repositories.requirements_repo import get_requirements_by_project
from app.repositories.runs_repo import get_latest_run_for_project
from app.repositories.users_repo import get_user_by_info_id
from app.services.project_service import get_by_id


@dataclass
class ReportSection:
    id: str
    title: str
    content: str
    diagram_visuals: Optional[dict] = None  # {diagram_id: svg_bytes}


TEMPLATES = [
    {
        "id": "default",
        "label": "Default",
        "description": "Clean layout with blue accents",
        "accent": "#2563eb",
        "font_family": "'Segoe UI', system-ui, sans-serif",
    },
    {
        "id": "serif",
        "label": "Serif",
        "description": "Classic report look with warm accent",
        "accent": "#b45309",
        "font_family": "'Georgia', 'Times New Roman', serif",
    },
    {
        "id": "mono",
        "label": "Mono",
        "description": "Minimal monospace style for technical readers",
        "accent": "#0ea5e9",
        "font_family": "'SFMono-Regular', 'Consolas', monospace",
    },
]


def _choose_template(template_id: Optional[str]):
    for tpl in TEMPLATES:
        if tpl["id"] == template_id:
            return tpl
    return TEMPLATES[0]


def _generate_diagram_svg(diagram: object) -> Optional[Drawing]:
    """Generate simple diagram visualization as ReportLab Drawing; returns None if empty."""
    nodes = getattr(diagram, "nodes", []) or []
    edges = getattr(diagram, "edges", []) or []
    if not nodes:
        return None

    try:
        width, height = 400, 300
        drawing = Drawing(width, height)

        # Extract node positions
        node_positions = {}
        for node in nodes:
            node_id = getattr(node, "id", None) or (node.get("id") if isinstance(node, dict) else None)
            if not node_id:
                continue
            if hasattr(node, "position"):
                pos_x = node.position.get("x", 50) if hasattr(node.position, "get") else 50
                pos_y = node.position.get("y", 50) if hasattr(node.position, "get") else 50
            elif isinstance(node, dict):
                pos_x = node.get("position", {}).get("x", 50) if node.get("position") else 50
                pos_y = node.get("position", {}).get("y", 50) if node.get("position") else 50
            else:
                pos_x, pos_y = 50, 50
            node_positions[node_id] = (min(int(pos_x or 50), width - 30), min(int(pos_y or 50), height - 30))

        # Draw edges
        for edge in edges:
            src = getattr(edge, "source", None) or (edge.get("source") if isinstance(edge, dict) else None)
            tgt = getattr(edge, "target", None) or (edge.get("target") if isinstance(edge, dict) else None)
            if src in node_positions and tgt in node_positions:
                x1, y1 = node_positions[src]
                x2, y2 = node_positions[tgt]
                drawing.add(Line(x1, y1, x2, y2, strokeColor="#ccc", strokeWidth=1))

        # Draw nodes as circles
        for node in nodes:
            node_id = getattr(node, "id", None) or (node.get("id") if isinstance(node, dict) else None)
            if node_id and node_id in node_positions:
                x, y = node_positions[node_id]
                drawing.add(Circle(x, y, 15, fillColor="#2563eb", strokeColor="#1e40af"))

        return drawing
    except Exception as e:
        print(f"Failed to generate diagram visualization: {e}")
        return None


def _render_requirements_md(requirements: List[object]) -> str:
    lines = ["# Requirements"]
    for req in requirements:
        title = getattr(req, "title", "Untitled")
        category = getattr(req, "category", "")
        description = getattr(req, "description", "") or ""
        content = getattr(req, "content", "") or ""
        lines.append(f"## {title}")
        if category:
            lines.append(f"- Category: **{category}**")
        if description:
            lines.append(description)
        if content:
            lines.append("")
            lines.append(content)
        lines.append("")
    return "\n".join(lines)


def _render_diagrams_with_visuals(diagrams: List[object]) -> tuple[str, dict]:
    """
    Render diagrams as markdown content AND generate visualizations.
    Returns: (markdown_content, {diagram_id: Drawing object})
    """
    lines = ["# Architecture Diagrams"]
    diagram_visuals = {}
    
    for idx, diag in enumerate(diagrams):
        title = getattr(diag, "title", "Diagram")
        dtype = getattr(diag, "type", "")
        nodes = getattr(diag, "nodes", []) or []
        edges = getattr(diag, "edges", []) or []
        
        lines.append(f"## {title}")
        if dtype:
            lines.append(f"Type: **{dtype}**")
        lines.append(f"Nodes: {len(nodes)} | Edges: {len(edges)}")
        lines.append("")
        
        # Generate Drawing for this diagram
        drawing = _generate_diagram_svg(diag)
        if drawing:
            diagram_id = f"diagram_{idx}"
            diagram_visuals[diagram_id] = drawing
            lines.append(f"[Diagram Visualization: {title}]")
            lines.append("")
    
    return "\n".join(lines), diagram_visuals


def _extract_sections(project_id: str, run_state: dict, requirements: List[object], diagrams: List[object]) -> List[ReportSection]:
    sections: List[ReportSection] = []

    if requirements:
        sections.append(
            ReportSection(
                id="requirements",
                title="Requirements",
                content=_render_requirements_md(requirements),
            )
        )

    if diagrams:
        diagram_content, diagram_visuals = _render_diagrams_with_visuals(diagrams)
        sections.append(
            ReportSection(
                id="diagrams",
                title="Architecture Diagrams",
                content=diagram_content,
                diagram_visuals=diagram_visuals if diagram_visuals else None,
            )
        )

    ordered_keys = [
        ("planner_content", "Implementation Plan"),
        ("export_content", "Blueprint"),
        ("blueprint_markdown", "Blueprint (Legacy)")
    ]
    for key, title in ordered_keys:
        content = run_state.get(key)
        if content:
            sections.append(
                ReportSection(
                    id=key.replace("_content", "").replace("_markdown", ""),
                    title=title,
                    content=str(content),
                )
            )

    return sections


def _build_story(project_name: str, sections: List[ReportSection], template_id: Optional[str], project_owner: str = "", project_desc: str = "", project_full_desc: str = ""):
        template = _choose_template(template_id)
        generated_at = datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")

        styles = getSampleStyleSheet()
        styles.add(ParagraphStyle(name="SectionTitle", parent=styles["Heading2"], textColor=template["accent"]))
        styles.add(ParagraphStyle(name="Body", parent=styles["BodyText"], leading=14))
        styles.add(ParagraphStyle(name="Meta", parent=styles["BodyText"], fontSize=9, textColor="#475569"))
        styles.add(ParagraphStyle(name="CoverTitle", parent=styles["Heading1"], fontSize=28, textColor=template["accent"], spaceAfter=12))
        styles.add(ParagraphStyle(name="CoverMeta", parent=styles["BodyText"], fontSize=11, leading=16))

        story = []

        # Cover page
        story.append(Paragraph(f"{project_name}", styles["CoverTitle"]))
        if project_owner:
            story.append(Paragraph(f"<b>Owner:</b> {project_owner}", styles["CoverMeta"]))
        story.append(Paragraph(f"<b>Generated:</b> {generated_at}", styles["CoverMeta"]))
        story.append(Spacer(1, 0.3 * inch))
        if project_desc:
            story.append(Paragraph("<b>Description</b>", styles["SectionTitle"]))
            story.append(Paragraph(project_desc, styles["Body"]))
            story.append(Spacer(1, 0.2 * inch))
        if project_full_desc:
            story.append(Paragraph("<b>Details</b>", styles["SectionTitle"]))
            story.append(Paragraph(project_full_desc, styles["Body"]))
            story.append(Spacer(1, 0.2 * inch))
        story.append(PageBreak())

        for idx, section in enumerate(sections):
                story.append(Paragraph(section.title, styles["SectionTitle"]))
                story.append(Spacer(1, 0.12 * inch))

                # Split markdown into paragraphs for basic rendering; Paragraph supports simple inline markup.
                blocks = [b.strip() for b in section.content.split("\n\n") if b.strip()]
                if not blocks:
                        story.append(Paragraph("(empty)", styles["Body"]))
                else:
                        for block in blocks:
                                # Convert markdown to HTML-lite; Paragraph handles basic <b>/<i>/<br/>.
                                html_block = markdown(block)
                                story.append(Paragraph(html_block, styles["Body"]))
                                story.append(Spacer(1, 0.08 * inch))
                
                # Embed diagram visuals if present
                if section.diagram_visuals:
                    story.append(Spacer(1, 0.15 * inch))
                    for diagram_id, drawing in section.diagram_visuals.items():
                        try:
                            # Add the Drawing directly to the story (ReportLab can embed drawings)
                            story.append(drawing)
                            story.append(Spacer(1, 0.15 * inch))
                        except Exception as e:
                            print(f"Failed to embed diagram {diagram_id}: {e}")

                if idx < len(sections) - 1:
                        story.append(Spacer(1, 0.25 * inch))

        story.append(PageBreak())
        return story


async def get_report_sections(project_id: str) -> Optional[dict]:
    project = await get_by_id(project_id)
    if not project:
        return None

    diagrams = await get_diagrams_by_project(project_id)
    requirements = await get_requirements_by_project(project_id)
    user = await get_user_by_info_id(project.created_by)

    run = await get_latest_run_for_project(project_id)
    run_state = run.state if run else {}

    sections = _extract_sections(project_id, run_state or {}, requirements or [], diagrams or [])

    return {
        "project_id": str(project.id),
        "project_name": project.name,
        "project_description": project.description,
        "project_full_description": project.full_description,
        "project_created_at": project.created_at.isoformat(),
        "project_owner": user.name if user else "Unknown",
        "run_id": str(run.id) if run else None,
        "requirements": requirements,
        "diagrams": diagrams,
        "sections": [
            {"id": s.id, "title": s.title, "content": s.content}
            for s in sections
        ],
    }


async def generate_pdf(project_id: str, template_id: Optional[str] = None) -> bytes:
    project = await get_by_id(project_id)
    if not project:
        raise ValueError("Project not found")
    
    diagrams = await get_diagrams_by_project(project_id)
    requirements = await get_requirements_by_project(project_id)
    user = await get_user_by_info_id(project.created_by)
    run = await get_latest_run_for_project(project_id)
    run_state = run.state if run else {}
    
    # Get the full ReportSection objects with diagram visuals
    sections = _extract_sections(project_id, run_state or {}, requirements or [], diagrams or [])
    if not sections:
        raise ValueError("No reportable sections available")

    project_name = project.name or "Project"
    project_owner = user.name if user else "Unknown"
    project_desc = project.description or ""
    project_full_desc = project.full_description or ""

    story = _build_story(project_name, sections, template_id, project_owner, project_desc, project_full_desc)

    def _build_pdf():
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
        doc.build(story)
        buffer.seek(0)
        return buffer.read()

    loop = asyncio.get_running_loop()
    pdf_bytes: bytes = await loop.run_in_executor(None, _build_pdf)
    return pdf_bytes


def list_templates():
    return [
        {"id": tpl["id"], "label": tpl["label"], "description": tpl["description"]}
        for tpl in TEMPLATES
    ]
