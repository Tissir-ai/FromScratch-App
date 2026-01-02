"use client";
import React, { useState, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from '@/components/ui/use-toast';
import { Button } from "@/components/ui/button";

import { updateFlowDiagram, deleteFlowDiagram, listDiagrams } from '@/services/diagram.service';
import SaveBar from '@/components/project/diagram/SaveBar';

import PageLayout from "@/components/project/PageLayout";
import { useNodesState, useEdgesState, addEdge, Edge, Node, ReactFlowInstance } from 'reactflow';

import { FlowDiagramList } from "@/components/project/diagram/DiagramList";
import DiagramEdit from '@/components/project/diagram/DiagramEdit';
import DiagramPreview from '@/components/project/diagram/DiagramPreview';

import 'reactflow/dist/style.css';
import { useAuth } from '@/context/AuthContext';
import { useRealtime } from '@/context/RealtimeContext';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';


interface DiagramsPageProps { params: { projectId: string } | Promise<{ projectId: string }> }

export default function DiagramsPage({ params }: DiagramsPageProps) {
  const resolved = (typeof (params as any)?.then === "function") ? React.use(params as Promise<{ projectId: string }>) : (params as { projectId: string });
  const projectId = resolved.projectId;
  const [activeFlowId, setActiveFlowId] = useState<string | null>(null);
  const [diagrams, setDiagrams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const initialDiagram = activeFlowId && diagrams.length > 0 ? diagrams.find(d => d.id === activeFlowId) : null;
  const [nodes, setNodes, onNodesChange] = useNodesState(initialDiagram?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialDiagram?.edges || []);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const flowContainerRef = React.useRef<HTMLDivElement | null>(null);
  const savedSnapshotRef = React.useRef<string>('');
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { toast } = useToast();

  // Routing & query param handling: sync diagram id via ?doc=<diagramId>
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const selectTriggeredRef = React.useRef(false);

  const updateDocParam = (id: string | null) => {
    const sp = new URLSearchParams(Array.from(searchParams?.entries?.() ?? []));
    if (id) sp.set('doc', id);
    else sp.delete('doc');
    const target = `${pathname}${sp.toString() ? `?${sp.toString()}` : ''}`;
    router.replace(target);
  };

  // reflect ?doc changes in state (supports direct linking/back/forward)
  useEffect(() => {
    const doc = searchParams?.get?.('doc') || null;
    if (!doc) {
      setActiveFlowId(null);
      return;
    }
    if (doc === activeFlowId) {
      if (selectTriggeredRef.current) selectTriggeredRef.current = false;
      return;
    }
    setActiveFlowId(doc);
    // If the param change was triggered by a local selection, keep the list open.
    if (selectTriggeredRef.current) {
      selectTriggeredRef.current = false;
    } else {
      // external param change (direct link / back/forward) -> focus canvas by hiding the list
      setShowDiagramList(false);
    }
  }, [searchParams, activeFlowId]);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const selectedNode = selectedNodeId ? nodes.find(n => n.id === selectedNodeId) || null : null;

  const onNodeClick = useCallback((event: any, node: Node) => {
    event?.stopPropagation?.();
    setSelectedEdge(null);
    setSelectedNodeId(node.id);
    setPanelOpen(true);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedEdge(null);
    setPanelOpen(false);
  }, []);

  const onEdgeClick = useCallback((event: any, edge: Edge) => {
    event?.stopPropagation?.();
    setSelectedNodeId(null);
    setSelectedEdge(edge);
    setPanelOpen(true);
  }, []);

  const updateNode = useCallback((id: string, data: any) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, data: { ...n.data, ...data } } : n));
  }, [setNodes]);

  const updateEdge = useCallback((id: string, data: any) => {
    setEdges(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
  }, [setEdges, nodes, edges]);

  const addRelation = useCallback((sourceId: string, targetId: string) => {
    if (!sourceId || !targetId) return;
    // choose next free handles for source and target when available
    const getNextFreeHandle = (nodeId: string, role: 'source' | 'target') => {
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return undefined;
      const usedHandles = new Set<string>();
      // gather handles already used by existing edges
      edges.forEach(e => {
        if (e.source === nodeId && e.sourceHandle) usedHandles.add(String(e.sourceHandle));
        if (e.target === nodeId && e.targetHandle) usedHandles.add(String(e.targetHandle));
      });
      // also include handles persisted on the node itself (if any)
      if (node.data?.usedHandles && Array.isArray(node.data.usedHandles)) {
        node.data.usedHandles.forEach((h: any) => usedHandles.add(String(h)));
      }

      const candidates: string[] = [];
      if (node.type === 'sequenceLifeline') {
        // lifeline has left/right numbered handles (indices 0..4 correspond to positions)
        const sides = ['left', 'right'];
        const indices = [0,1,2,3,4];
        for (const side of sides) {
          for (const i of indices) {
            candidates.push(`${side}-${role}-${i}`);
          }
        }
      } else if (node.type === 'actorNode' || node.type === 'useCaseNode') {
        const sides = ['top','right','bottom','left'];
        for (const s of sides) {
          candidates.push(`${s}-${role}`);
          // also try slightly offset duplicates used in some nodes
          candidates.push(`${s}-${role}-1`);
        }
      }

      for (const c of candidates) {
        if (!usedHandles.has(c)) return c;
      }
      return undefined;
    };

    const sourceHandle = getNextFreeHandle(sourceId, 'source');
    const targetHandle = getNextFreeHandle(targetId, 'target');

    const edge: Edge = {
      id: `e-${sourceId}-${targetId}-${Date.now()}`,
      source: sourceId,
      target: targetId,
      sourceHandle: sourceHandle,
      targetHandle: targetHandle,
      type: 'smoothstep',
      style: { strokeWidth: 3 }
    };

    setEdges((eds) => addEdge(edge, eds));

    // Persist chosen handles back to the nodes so future allocations avoid reuse
    try {
      if (sourceHandle) {
        const srcNode = nodes.find(n => n.id === sourceId);
        const prev = Array.isArray(srcNode?.data?.usedHandles) ? srcNode!.data.usedHandles : [];
        const updated = Array.from(new Set([...prev, sourceHandle]));
        updateNode(sourceId, { usedHandles: updated });
      }
      if (targetHandle) {
        const tgtNode = nodes.find(n => n.id === targetId);
        const prev = Array.isArray(tgtNode?.data?.usedHandles) ? tgtNode!.data.usedHandles : [];
        const updated = Array.from(new Set([...prev, targetHandle]));
        updateNode(targetId, { usedHandles: updated });
      }
    } catch (err) {
      // non-fatal: if updateNode isn't available or fails, we still created the edge
      console.error('Failed to persist used handles on nodes', err);
    }
  }, [setEdges, nodes, edges, updateNode]);

  const removeRelation = useCallback((edgeId: string) => {
    setEdges((eds) => eds.filter(e => e.id !== edgeId));
  }, [setEdges]);

  // Load diagrams on mount
  useEffect(() => {
    const loadDiagrams = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const data = await listDiagrams(projectId);
        setDiagrams(data);
      } catch (error: any) {
        const errorMsg = error.message || 'Failed to load diagrams';
        setLoadError(errorMsg);
        toast({
          title: 'Error loading diagrams',
          description: errorMsg,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadDiagrams();
  }, [projectId, toast]);

  // When the selected Flow diagram changes, reset nodes and edges
  useEffect(() => {
    if (!activeFlowId) return;
    const diagram = diagrams.find(d => d.id === activeFlowId);
    if (diagram) {
      setNodes(diagram.nodes);
      setEdges(diagram.edges);
      // close edit panel and clear any selection when switching diagrams
      setPanelOpen(true);
      setSelectedNodeId(null);
      setSelectedEdge(null);
      setTitleInput(diagram.title || '');
      // initialize saved snapshot to the diagram's nodes/edges (canonicalized)
      savedSnapshotRef.current = serializeScene(diagram.nodes || [], diagram.edges || []);
      setIsDirty(false);
      setLastSaved(null);
      setTimeout(() => {
        rfInstance?.fitView({ duration: 800, padding: 0.2 });
      }, 100);
    }
  }, [activeFlowId, diagrams, setNodes, setEdges, rfInstance]);



  // Utility to produce a canonical JSON snapshot of nodes/edges (strip reactflow internals)
  const serializeScene = (ns: Node[] = [], es: Edge[] = []) => {
    try {
      // include node style and positionAbsolute when present so custom node sizing/placement
      // (e.g., sequence lifelines) is preserved when restoring
      const safeNodes = ns.map((n) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        // react-flow may include positionAbsolute; preserve if present
        ...(n as any).positionAbsolute ? { positionAbsolute: (n as any).positionAbsolute } : {},
        data: n.data,
        ...(n.style ? { style: n.style } : {}),
      }));
      const safeEdges = es.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: (e as any).sourceHandle,
        targetHandle: (e as any).targetHandle,
        type: e.type,
        style: e.style,
        // preserve label and any marker definitions so text and heads restore
        label: (e as any).label,
        markerStart: (e as any).markerStart,
        markerEnd: (e as any).markerEnd,
      }));
      return JSON.stringify({ nodes: safeNodes, edges: safeEdges });
    } catch (err) {
      return JSON.stringify({ nodes: ns, edges: es });
    }
  };

  // mark dirty when nodes/edges diverge from last saved snapshot (compare canonicalized versions)
  useEffect(() => {
    const snap = serializeScene(nodes, edges);
    setIsDirty(snap !== savedSnapshotRef.current);
  }, [nodes, edges]);

  const saveDiagram = async () => {
    if (!activeFlowId) return;
    try {
      // Persist current nodes/edges to backend
      await updateFlowDiagram(projectId, activeFlowId, { nodes, edges });
      const now = new Date();
      setDiagrams(prev => prev.map(d => d.id === activeFlowId ? { ...d, nodes, edges, updated_at: now.toISOString() } : d));
      savedSnapshotRef.current = serializeScene(nodes, edges);
      setLastSaved(now.toISOString());
      setIsDirty(false);
      // Close edit panel after saving
      setPanelOpen(false);
      setSelectedNodeId(null);
      setSelectedEdge(null);
      toast({
        title: 'Diagram saved',
        description: 'Your changes have been saved successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to save diagram',
        description: error.message || 'An error occurred while saving.',
        variant: 'destructive',
      });
    }
  };

  const saveTitle = async () => {
    if (!activeFlowId) return;
    const newTitle = titleInput.trim();
    if (!newTitle) return;
    try {
      // persist title only
      await updateFlowDiagram(projectId, activeFlowId, { title: newTitle });
      // Update local state
      setDiagrams(prev => prev.map(d => d.id === activeFlowId ? { ...d, title: newTitle } : d));
      setIsEditingTitle(false);
      const now = new Date();
      setLastSaved(now.toISOString());
      toast({
        title: 'Title updated',
        description: 'Diagram title has been updated.',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to update title',
        description: error.message || 'An error occurred while updating the title.',
        variant: 'destructive',
      });
    }
  };

  const restoreSavedVersion = () => {
    if (!savedSnapshotRef.current) {
      toast({ title: 'Nothing to restore', description: 'No saved snapshot available.' });
      return;
    }
    try {
      const parsed = JSON.parse(savedSnapshotRef.current || '{}');
      const restoredNodes = Array.isArray(parsed.nodes) ? parsed.nodes : [];
      const restoredEdges = Array.isArray(parsed.edges) ? parsed.edges : [];
      setNodes(restoredNodes as any);
      setEdges(restoredEdges as any);
      setIsDirty(false);
      // Close edit panel after restoring
      setPanelOpen(false);
      setSelectedNodeId(null);
      setSelectedEdge(null);
      toast({ title: 'Restored', description: 'Diagram reverted to last saved version.' });
    } catch (err) {
      console.error('Failed to restore snapshot', err);
      toast({ title: 'Restore failed', description: 'Could not parse saved snapshot.', variant: 'destructive' });
    }
  };

  const cancelEditTitle = () => {
    setIsEditingTitle(false);
    const diagram = activeFlowId ? diagrams.find(d => d.id === activeFlowId) : null;
    setTitleInput(diagram?.title || '');
  };

  // Force re-render every 30 seconds to update relative time
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  const formatRelative = (iso: string | null) => {
    if (!iso) return null;
    const then = new Date(iso).getTime();
    const now = Date.now();
    const diff = Math.max(0, now - then);
    const sec = Math.floor(diff / 1000);
    if (sec < 10) return 'just now';
    if (sec < 60) return `${sec} seconds ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min} minute${min === 1 ? '' : 's'} ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr} hour${hr === 1 ? '' : 's'} ago`;
    const days = Math.floor(hr / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  };


  const [showDiagramList, setShowDiagramList] = useState(true);

  // Ensure the diagram list is opened whenever no diagram is selected
  useEffect(() => {
    if (!activeFlowId) setShowDiagramList(true);
  }, [activeFlowId]);

  return (
    <PageLayout title="Diagrams" projectId={projectId}>
      {isLoading ? (
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-4 text-sm text-muted-foreground">Loading diagrams...</p>
          </div>
        </div>
      ) : loadError ? (
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-destructive">{loadError}</p>
            <Button 
              className="mt-4" 
              onClick={async () => {
                try {
                  setIsLoading(true);
                  setLoadError(null);
                  const data = await listDiagrams(projectId);
                  setDiagrams(data);
                } catch (error: any) {
                  setLoadError(error.message || 'Failed to load diagrams');
                } finally {
                  setIsLoading(false);
                }
              }}
            >
              Retry
            </Button>
          </div>
        </div>
      ) : (
      <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden">{/* Diagrams List Panel - always open on left */}
        {showDiagramList && (
        <div className="h-full w-80 bg-background border-r shadow-lg z-20 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <span className="font-semibold text-lg">Diagrams List</span>
            {activeFlowId && (
            <Button size="sm" variant="ghost" onClick={()=> setShowDiagramList(false)}>
              Close
            </Button>
            )}
          </div>
          <div className="flex-1 overflow-auto p-2">
            <FlowDiagramList 
              activeId={activeFlowId} 
              onSelect={(id) => { selectTriggeredRef.current = true; updateDocParam(id); setActiveFlowId(id); }} 
              layout="vertical" 
              diagrams={diagrams}
              projectId={projectId}
              onAdded={(newDiagram) => {
                // place newest diagrams at the top of the list
                setDiagrams(prev => [newDiagram, ...prev]);
                updateDocParam(newDiagram.id);
                setActiveFlowId(newDiagram.id);
                setShowDiagramList(false);
              }}
            />
          </div>
        </div> )
} 
        {/* Preview or Diagram Canvas */}
        <div className="flex-1 h-full relative">
          {!activeFlowId ? (
            <div className="flex flex-col items-center justify-center h-full">
              <img src="/logos/fromscratch.png" alt="Diagram Logo" className="w-24 h-24 mb-6 opacity-80" />
              <h2 className="text-2xl font-bold text-muted-foreground mb-2">FromScratch Diagram Previewer</h2>
              <p className="text-sm text-muted-foreground">Select a diagram from the list to begin editing.</p>
            </div>
          ) : (
            <div className="absolute inset-0" ref={flowContainerRef}>
              {/* Top save bar component */}
              <SaveBar
                activeFlowId={activeFlowId}
                titleInput={titleInput}
                setTitleInput={setTitleInput}
                isEditingTitle={isEditingTitle}
                setIsEditingTitle={setIsEditingTitle}
                saveTitle={saveTitle}
                cancelEditTitle={cancelEditTitle}
                isDirty={isDirty}
                lastSaved={formatRelative(lastSaved)}
                saveDiagram={saveDiagram}
                restoreSavedVersion={restoreSavedVersion}
                onDelete={() => setShowDeleteConfirm(true)}
              />

            {/* Delete confirmation dialog */}
            <Dialog open={showDeleteConfirm} onOpenChange={(v)=> setShowDeleteConfirm(v)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete diagram</DialogTitle>
                </DialogHeader>
                <div className="text-sm text-muted-foreground">Are you sure you want to delete this diagram? This action cannot be undone.</div>
                <DialogFooter className="mt-4 flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                  <Button size="sm" className=" text-white" onClick={async () => {
                    if (!activeFlowId) return setShowDeleteConfirm(false);
                    try {
                      await deleteFlowDiagram(projectId, activeFlowId);
                      setShowDeleteConfirm(false);
                      // Update local state
                      setDiagrams(prev => prev.filter(d => d.id !== activeFlowId));
                      setActiveFlowId(null);
                      updateDocParam(null);
                      setNodes([]);
                      setEdges([]);
                      savedSnapshotRef.current = '';
                      setIsDirty(false);
                      setLastSaved(null);
                      setShowDiagramList(true);
                      toast({ 
                        title: 'Diagram deleted', 
                        description: 'The diagram has been removed.' 
                      });
                    } catch (error: any) {
                      setShowDeleteConfirm(false);
                      toast({ 
                        title: 'Failed to delete diagram', 
                        description: error.message || 'An error occurred while deleting the diagram.',
                        variant: 'destructive' 
                      });
                    }
                  }}>Delete</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
              <DiagramPreview
                activeFlow={activeFlowId ? diagrams.find(d => d.id === activeFlowId) ?? null : null}
                rfInstance={rfInstance}
                setRfInstance={(rf)=> setRfInstance(rf)}
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                setNodes={setNodes}
                setEdges={setEdges}
                flowContainerRef={flowContainerRef}
                showDiagramList={showDiagramList}
                setShowDiagramList={setShowDiagramList}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                onEdgeClick={onEdgeClick}
              />
            </div>
          )}
        </div>
        {/* SidePanel for selected node */}
              {panelOpen && (
                <DiagramEdit
                  selectedNode={selectedNode}
                  selectedEdge={selectedEdge}
                  nodes={nodes}
                  edges={edges}
                  updateNode={(id, data) => updateNode(id, data)}
                  updateEdge={(id, data) => updateEdge(id, data)}
                  addRelation={(sourceId, targetId) => addRelation(sourceId, targetId)}
                  removeRelation={(edgeId) => removeRelation(edgeId)}
                  onClose={() => { setPanelOpen(false); setSelectedNodeId(null); setSelectedEdge(null); }}
                />
              )}
      </div>
      )}
    </PageLayout>
  );
}
