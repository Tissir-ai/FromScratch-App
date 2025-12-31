"use client";
import React, { useCallback, useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Folder } from 'lucide-react';

import { FlowDiagram } from '@/types/diagram.type';
import { DiagramToolbox } from '@/components/project/diagram/DiagramToolbox';
import DiagramExport from '@/components/project/diagram/export';

import ClassNode from '@/components/project/diagram/customNodes/ClassNode';
import UseCaseNode from '@/components/project/diagram/customNodes/UseCaseNode';
import ActorNode from '@/components/project/diagram/customNodes/ActorNode';
import SequenceLifelineNode from '@/components/project/diagram/customNodes/SequenceLifelineNode';
import ActivityNode from '@/components/project/diagram/customNodes/ActivityNode';
import TextNode from '@/components/project/diagram/customNodes/TextNode';
import NoteNode from '@/components/project/diagram/customNodes/NoteNode';

const nodeTypes = {
  classNode: ClassNode,
  useCaseNode: UseCaseNode,
  actorNode: ActorNode,
  sequenceLifeline: SequenceLifelineNode,
  activityNode: ActivityNode,
  textNode: TextNode,
  noteNode: NoteNode,
};

interface DiagramPreviewProps {
  activeFlow: FlowDiagram | null;
  rfInstance: ReactFlowInstance | null;
  setRfInstance: (rf: ReactFlowInstance) => void;
  nodes: Node[];
  edges: Edge[];
  onNodesChange: ReturnType<typeof useNodesState>[2];
  onEdgesChange: ReturnType<typeof useEdgesState>[2];
  setNodes: ReturnType<typeof useNodesState>[1];
  setEdges: ReturnType<typeof useEdgesState>[1];
  flowContainerRef: React.RefObject<HTMLDivElement | null>;
  showDiagramList: boolean;
  setShowDiagramList: (v: boolean) => void;
  onNodeClick: (event: any, node: Node) => void;
  onPaneClick: () => void;
  onEdgeClick: (event: any, edge: Edge) => void;
}

export default function DiagramPreview({
  activeFlow,
  rfInstance,
  setRfInstance,
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  setNodes,
  setEdges,
  flowContainerRef,
  showDiagramList,
  setShowDiagramList,
  onNodeClick,
  onPaneClick,
  onEdgeClick,
}: DiagramPreviewProps) {
  const onConnect = useCallback((params: Connection) => {
    const incomingStyle = (params as any).style || {};
    let defaultType = 'smoothstep';
    try {
      const src = params.source;
      const tgt = params.target;
      const srcNode = src ? nodes.find(n => n.id === src) : undefined;
      const tgtNode = tgt ? nodes.find(n => n.id === tgt) : undefined;
      if ((srcNode && srcNode.type === 'useCaseNode') || (tgtNode && tgtNode.type === 'useCaseNode')) {
        defaultType = 'default';
      }
    } catch (e) {
      defaultType = 'smoothstep';
    }

    const p = {
      ...params,
      type: (params as any).type || defaultType,
      style: { ...(incomingStyle || {}), strokeWidth: incomingStyle?.strokeWidth ?? 3 },
    } as Connection & { type?: string; style?: any };
    setEdges((eds) => addEdge(p as any, eds));
  }, [setEdges, nodes]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    if (typeof type === 'undefined' || !type) return;
    const position = rfInstance?.screenToFlowPosition({ x: event.clientX, y: event.clientY });
    if (!position) return;

    const newNode: Node = {
      id: `${type}-${nodes.length + 1}-${Date.now()}`,
      type,
      position,
      data: { label: `${type} node` },
    };

    if (type === 'classNode') {
      newNode.data = { label: 'NewClass', attributes: ['+ attribute1: type'], methods: ['+ method1(): void'] };
    } else if (type === 'useCaseNode') {
      newNode.data = { label: 'New Use Case' };
    } else if (type === 'actorNode') {
      newNode.data = { label: 'New Actor' };
    } else if (type === 'sequenceLifeline') {
      newNode.data = { label: 'New Lifeline', lifelineHeight: 400, lifelineWidth: 2 };
    } else if (type === 'activityNode') {
      newNode.data = { label: 'New Activity' };
    } else if (type === 'textNode') {
      newNode.data = { label: 'Text Label', fontSize: 'text-base', textColor: 'text-foreground', isBold: false, isItalic: false };
    } else if (type === 'noteNode') {
      newNode.data = { label: 'Note content here...', bgColor: 'bg-yellow-50 dark:bg-yellow-900/30', textColor: 'text-yellow-900 dark:text-yellow-50', withBorder: true };
    }

    setNodes((nds) => nds.concat(newNode));
  }, [rfInstance, nodes, setNodes]);

  return (
    <div ref={flowContainerRef as React.Ref<HTMLDivElement>} className="relative w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        onInit={setRfInstance}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onEdgeClick={onEdgeClick}
        fitView
      >
        <Controls />
        <Background gap={12} size={1} />
      </ReactFlow>

      <div className="absolute top-2 left-4 z-50 flex flex-col gap-4">
        {!showDiagramList && (
          <Button variant="secondary" size="icon" className="shadow-md h-10 w-10 rounded-full" onClick={() => setShowDiagramList(true)}>
            <Folder className="h-5 w-5" />
          </Button>
        )}
        <Card className="p-3 w-52 shadow-md bg-background/95 backdrop-blur border-muted">
          <DiagramToolbox activeDiagramType={(activeFlow?.type as string) ?? ''} />
        </Card>
      </div>

      <DiagramExport
        rfInstance={rfInstance}
        flowContainerRef={flowContainerRef}
        activeFlow={activeFlow}
        nodes={nodes}
        edges={edges}
      />
    </div>
  );
}
