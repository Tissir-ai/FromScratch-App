"use client";
import React, { useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';

import ClassNode from '@/components/project/diagram/customNodes/ClassNode';
import UseCaseNode from '@/components/project/diagram/customNodes/UseCaseNode';
import ActorNode from '@/components/project/diagram/customNodes/ActorNode';
import SequenceLifelineNode from '@/components/project/diagram/customNodes/SequenceLifelineNode';
import ActivityNode from '@/components/project/diagram/customNodes/ActivityNode';
import TextNode from '@/components/project/diagram/customNodes/TextNode';
import NoteNode from '@/components/project/diagram/customNodes/NoteNode';

import type { ReportDiagram } from '@/types/report.type';

// Define nodeTypes outside component to prevent React Flow warning
const nodeTypes = {
  classNode: ClassNode,
  useCaseNode: UseCaseNode,
  actorNode: ActorNode,
  sequenceLifeline: SequenceLifelineNode,
  activityNode: ActivityNode,
  textNode: TextNode,
  noteNode: NoteNode,
} as const;

interface ReportDiagramViewerProps {
  diagram: ReportDiagram;
  height?: number;
}

export default function ReportDiagramViewer({ diagram, height = 400 }: ReportDiagramViewerProps) {
  const nodes: Node[] = useMemo(() => {
    return (diagram.nodes || []).map((node) => ({
      id: node.id,
      type: node.type || 'default',
      position: node.position || { x: 0, y: 0 },
      data: node.data || {},
    }));
  }, [diagram.nodes]);

  const edges: Edge[] = useMemo(() => {
    return (diagram.edges || []).map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type || 'smoothstep',
      label: edge.label,
      style: { strokeWidth: 2, ...((edge.style as React.CSSProperties) || {}) },
    }));
  }, [diagram.edges]);

  if (nodes.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-muted/30 rounded-md border"
        style={{ height }}
      >
        <p className="text-sm text-muted-foreground">No diagram data available</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden bg-white" style={{ height }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{
          padding: 0.2,
          includeHiddenNodes: false,
          minZoom: 0.5,
          maxZoom: 1.5,
        }}
        attributionPosition="bottom-left"
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        zoomOnScroll={false}
        panOnScroll={false}
        panOnDrag={false}
        preventScrolling={false}
      >
        <Background color="#e5e7eb" gap={16} />
      </ReactFlow>
    </div>
  );
}
