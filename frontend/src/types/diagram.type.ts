import { Node, Edge } from 'reactflow';

export enum DiagramType {
  CLASS = 'class',
  USE_CASE = 'use-case',
  SEQUENCE = 'sequence',
  ACTIVITY = 'activity',
}

export interface User {
  id : string;
  firstName: string;
  lastName: string;
}

export interface FlowDiagram {
  id: string;
  title: string;
  type: DiagramType;
  nodes: Node[];
  edges: Edge[];
  created_at?: Date;
  updated_at?: Date;
}

