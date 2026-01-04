// Report Types for client-side rendering and PDF generation

export interface ReportRequirement {
  id: string;
  title: string;
  category: string;
  description?: string;
  content?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DiagramNode {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  label?: string;
  style?: Record<string, unknown>;
}

export interface ReportDiagram {
  id: string;
  title: string;
  type: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  created_at?: string;
  updated_at?: string;
}

export interface ReportTemplate {
  id: string;
  label: string;
  description?: string;
  accent?: string;
  font_family?: string;
}

export interface ReportDataResponse {
  project_id: string;
  project_name: string;
  project_description?: string;
  project_full_description?: string;
  project_created_at: string;
  project_owner: string;
  run_id?: string;
  requirements: ReportRequirement[];
  diagrams: ReportDiagram[];
  planner_content?: string;
  export_content?: string;
  templates: ReportTemplate[];
}

    