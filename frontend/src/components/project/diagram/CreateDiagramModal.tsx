"use client";
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Layers, GitBranch, Users, ActivitySquare, FileJson, FileText, AlertCircle, CheckCircle2, UploadCloud, Plus, ExternalLink, X } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import ReactFlow, { Background } from 'reactflow';
import ClassNode from '@/components/project/diagram/customNodes/ClassNode';
import UseCaseNode from '@/components/project/diagram/customNodes/UseCaseNode';
import ActorNode from '@/components/project/diagram/customNodes/ActorNode';
import SequenceLifelineNode from '@/components/project/diagram/customNodes/SequenceLifelineNode';
import ActivityNode from '@/components/project/diagram/customNodes/ActivityNode';
import TextNode from '@/components/project/diagram/customNodes/TextNode';
import NoteNode from '@/components/project/diagram/customNodes/NoteNode';
import 'reactflow/dist/style.css';
import { useToast } from "@/components/ui/use-toast";
import { DiagramType } from '@/types/diagram.type';
import { diagramTemplates, filterTemplates, DiagramTemplate } from './DiagramTemplates';
import { addFlowDiagram, listDiagrams } from '@/services/diagram.service';

// Lightweight, memoized preview for templates to avoid re-renders when unrelated inputs change
const TemplatePreview: React.FC<{ tpl: DiagramTemplate }> = React.memo(({ tpl }) => {
  const nodeTypes = React.useMemo(() => ({
    classNode: ClassNode,
    useCaseNode: UseCaseNode,
    actorNode: ActorNode,
    sequenceLifeline: SequenceLifelineNode,
    activityNode: ActivityNode,
    textNode: TextNode,
    noteNode: NoteNode,
  }), []);

  const instance = React.useMemo(() => tpl.createInstance(), [tpl]);
  const nodes = instance.nodes || [];
  const edges = instance.edges || [];
  const rfRef = React.useRef<any>(null);

  const onInit = React.useCallback((rf: any) => {
    rfRef.current = rf;
    // ensure preview shows all content and is centered; small timeout lets layout settle
    setTimeout(() => {
      try {
        rf.fitView({ padding: 0.12 });
      } catch (e) {
        // ignore
      }
    }, 50); 
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden bg-muted">
      <div className="w-full h-full">
        <ReactFlow
          nodes={nodes as any}
          edges={edges as any}
          nodeTypes={nodeTypes}
          onInit={onInit}
          nodesDraggable={false}
          nodesConnectable={false}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          attributionPosition="bottom-left"
          minZoom={0.05}
          maxZoom={2}
        >
          <Background gap={8} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
});
TemplatePreview.displayName = 'TemplatePreview';
interface CreateDiagramModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (id: string) => void;
  onAdded: (diagram: any) => void;
  projectId: string;
}

export const CreateDiagramModal: React.FC<CreateDiagramModalProps> = ({ open, onOpenChange, onSelect, onAdded , projectId }) => {
  const { toast } = useToast();
  const [createTab, setCreateTab] = React.useState<'new'|'import'>('new');
  const [newTitle, setNewTitle] = React.useState('');
  const [newType, setNewType] = React.useState<DiagramType>(DiagramType.CLASS);
  const [importError, setImportError] = React.useState<string>('');
  const [importSuccess, setImportSuccess] = React.useState<string>('');
  const [templateSearch, setTemplateSearch] = React.useState('');
  const [templateTypeFilter, setTemplateTypeFilter] = React.useState<DiagramType | 'all'>('all');
  // Memoize filtered templates to avoid recomputing / rerendering template grid on unrelated state changes
  const filteredTemplates = React.useMemo(() => filterTemplates(templateSearch, templateTypeFilter), [templateSearch, templateTypeFilter]);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [previewTpl, setPreviewTpl] = React.useState<DiagramTemplate | null>(null);

  // Ensure a diagram title is unique within the project by appending " (1)", " (2)", ... when needed
  const ensureUniqueTitle = async (title: string) => {
    try {
      const diagrams = await listDiagrams(projectId);
      const existingLower = new Set(diagrams.map((d:any) => (d?.title || '').toLowerCase()));

      // extract base title if user already supplied a suffix like "name (2)"
      const m = title.match(/^(.*)\s\((\d+)\)$/);
      const base = m ? m[1] : title;
      const baseLower = base.toLowerCase();

      if (!existingLower.has(baseLower)) {
        // no conflict with the base title
        return base;
      }

      // find highest index already used for this base
      let max = 0;
      const esc = (s:string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(`^${esc(baseLower)}\\s\\((\\d+)\\)$`);
      for (const t of existingLower) {
        if (t === baseLower) {
          max = Math.max(max, 0);
        }
        const mm = t.match(re);
        if (mm) {
          const n = Number(mm[1]);
          if (!Number.isNaN(n)) max = Math.max(max, n);
        }
      }
      return `${base} (${max + 1})`;
    } catch (err) {
      // On error, fallback to original title
      return title;
    }
  };

  const resetState = () => {
    setCreateTab('new');
    setNewTitle('');
    setNewType(DiagramType.CLASS);
    setImportError('');
    setImportSuccess('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileContent = async (file: File) => {
    setImportError('');
    setImportSuccess('');
    try {
      const text = await file.text();
      let obj: any = null;
      if (file.name.endsWith('.json')) {
        obj = JSON.parse(text);
        if (obj && obj.id) delete obj.id;
      } else if (file.name.endsWith('.scratchx')) {
        // decode base64 proprietary format
        const decoded = decodeURIComponent(escape(atob(text.trim())));
        const lines = decoded.split(/\r?\n/).map(l=>l.trim()).filter(l=>l.length>0);
        if (!lines[0] || !(lines[0].startsWith('SCRATCHX') || lines[0].startsWith('FSD'))) throw new Error('Invalid ScratchX/FSD header');
        const titleLine = lines.find(l=>l.startsWith('TITLE='));
        const typeLine = lines.find(l=>l.startsWith('TYPE='));
        if (!titleLine || !typeLine) throw new Error('Missing TITLE/TYPE');
        const title = titleLine.split('=')[1] || 'Imported Diagram';
        const typeRaw = (typeLine.split('=')[1] || 'class').trim();
        const type = (Object.values(DiagramType) as string[]).includes(typeRaw) ? typeRaw : DiagramType.CLASS;
        const firstSep = lines.indexOf('---');
        if (firstSep === -1) throw new Error('Missing node separator');
        const secondSep = lines.indexOf('---', firstSep + 1);
        if (secondSep === -1) throw new Error('Missing edge separator');
        const endIdx = lines.indexOf('END');
        const nodeLines = lines.slice(firstSep + 1, secondSep);
        const edgeLines = lines.slice(secondSep + 1, endIdx === -1 ? undefined : endIdx);
        const nodesParsed = nodeLines.filter(l=>l.startsWith('N|')).map((l,i)=>{
          const parts = l.split('|');
          const [, id, nType, label, x, y, dataB64] = parts;
          let attributes: string[] = [];
          let methods: string[] = [];
          if (dataB64) {
            try {
              const json = decodeURIComponent(escape(atob(dataB64)));
              const parsed = JSON.parse(json);
              if (parsed && Array.isArray(parsed.attributes)) attributes = parsed.attributes;
              if (parsed && Array.isArray(parsed.methods)) methods = parsed.methods;
            } catch (e) { /* ignore */ }
          }
          return { id: id || `n${i}`, type: nType || 'default', data: { label: label || '', attributes, methods }, position: { x: Number(x)|| i*80, y: Number(y)||50 } };
        });
        const edgesParsed = edgeLines.filter(l=>l.startsWith('E|')).map((l,i)=>{
          const parts = l.split('|');
          const [, id, source, target, label, eType] = parts;
          return { id: id || `e${i}`, source, target, label: label || '', type: eType || 'smoothstep' };
        }).filter(e=>e.source && e.target);
        obj = { title, type, nodes: nodesParsed, edges: edgesParsed };
      } else {
        throw new Error('Unsupported file extension');
      }
      if (!obj || typeof obj !== 'object') throw new Error('Parsed object invalid');
      const required = ['title','type','nodes','edges'];
      for (const k of required) { if (!(k in obj)) throw new Error(`Missing field: ${k}`); }
      if (!Array.isArray(obj.nodes) || !Array.isArray(obj.edges)) throw new Error('nodes/edges must be arrays');
      obj.nodes.forEach((n:any,i:number)=>{ if (!n.id) n.id = `n${i}`; if (!n.type) n.type='default'; if (!n.data) n.data={ label: '' }; if (!n.position) n.position={ x: (i%10)*120, y: Math.floor(i/10)*100 }; });
      obj.edges.forEach((e:any,i:number)=>{ if (!e.id) e.id=`e${i}`; if (!e.source || !e.target) throw new Error(`Edge ${e.id} missing source/target`); if (!e.type) e.type='smoothstep'; });
      
      if (!obj.activeUsers) obj.activeUsers = [];
      try { obj.title = await ensureUniqueTitle(obj.title); } catch (e) { /* ignore */ }

      const created = await addFlowDiagram(projectId, obj);
      onAdded(created);
      setImportSuccess('Diagram imported successfully');
      toast({ title: 'Import complete', description: 'Diagram imported and opened.' });
      onSelect(created.id);
      onOpenChange(false);
      resetState();
    } catch (err:any) {
      setImportError(err.message || 'Import failed');
      toast({ title: 'Import failed', description: err.message || 'Please verify file format.', variant: 'destructive' });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value='';
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v)=>{ onOpenChange(v); if (!v) resetState(); }}>
      <DialogContent className="sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            Diagram Manager
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col md:flex-row gap-6 mt-2">
          {/* Left side: Create / Import */}
          <div className="md:w-1/2 w-full">
            {/* Create / Import Tabs */}
            <div className="mb-4 flex gap-2 border-b pb-2 text-sm">
              <button onClick={() => setCreateTab('new')} className={`px-3 py-1 rounded ${createTab==='new' ? 'bg-muted font-medium' : 'hover:bg-muted/50'}`}>Create New</button>
              <button onClick={() => setCreateTab('import')} className={`px-3 py-1 rounded ${createTab==='import' ? 'bg-muted font-medium' : 'hover:bg-muted/50'}`}>Import</button>
            </div>
            {createTab === 'new' && (
              <div className="space-y-4">
                <div className="relative">
                  <Input
                    autoFocus
                    placeholder="Diagram title"
                    value={newTitle}
                    onChange={(e) => setNewTitle((e.target as HTMLInputElement).value)}
                    className="pl-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setNewType(DiagramType.CLASS)} className={`h-16 flex items-center gap-2 rounded-md border p-3 text-left transition-colors ${newType === DiagramType.CLASS ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}>
                    <Layers className={`w-5 h-5 ${newType === DiagramType.CLASS ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div>
                      <div className="text-sm font-medium">Class</div>
                      <div className="text-xs text-muted-foreground">Structures and relationships</div>
                    </div>
                  </button>
                  <button type="button" onClick={() => setNewType(DiagramType.SEQUENCE)} className={`h-16 flex items-center gap-2 rounded-md border p-3 text-left transition-colors ${newType === DiagramType.SEQUENCE ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}>
                    <GitBranch className={`w-5 h-5 ${newType === DiagramType.SEQUENCE ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div>
                      <div className="text-sm font-medium">Sequence</div>
                      <div className="text-xs text-muted-foreground">Message flow over time</div>
                    </div>
                  </button>
                  <button type="button" onClick={() => setNewType(DiagramType.USE_CASE)} className={` h-16 flex items-center gap-2 rounded-md border p-3 text-left transition-colors ${newType === DiagramType.USE_CASE ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}>
                    <Users className={`w-5 h-5 ${newType === DiagramType.USE_CASE ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div>
                      <div className="text-sm font-medium">Use Case</div>
                      <div className="text-xs text-muted-foreground">Actors and interactions</div>
                    </div>
                  </button>
                  <button type="button" onClick={() => setNewType(DiagramType.ACTIVITY)} className={`h-16 flex items-center gap-2 rounded-md border p-3 text-left transition-colors ${newType === DiagramType.ACTIVITY ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}>
                    <ActivitySquare className={`w-5 h-5 ${newType === DiagramType.ACTIVITY ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div>
                      <div className="text-sm font-medium">Activity</div>
                      <div className="text-xs text-muted-foreground">Workflow and steps</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
            {createTab === 'import' && (
            <div className="space-y-3 h-full">
            <div
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFileContent(f); }}
              className="border-2 border-dashed rounded-md p-6 h-5/6 text-center hover:bg-muted"
            >
              <div className="flex flex-col items-center justify-center h-full">
              <div className="flex items-center justify-center  gap-2 text-sm">
                <FileJson className="h-4 w-4" /> JSON
                <span className="text-muted-foreground">or</span>
                <FileText className="h-4 w-4" /> ScratchX
              </div>
              <div className="text-xs text-muted-foreground mt-1">Drag & drop file here or <button className="underline" onClick={() => fileInputRef.current?.click()}>upload file</button></div>
              {importError && (
                <div className="mt-3 flex items-center justify-center gap-2 text-red-600 text-xs">
                  <AlertCircle className="h-3 w-3" /> {importError}
                </div>
              )}
              {importSuccess && (
                <div className="mt-3 flex items-center justify-center gap-2 text-green-600 text-xs">
                  <CheckCircle2 className="h-3 w-3" /> {importSuccess}
                </div>
              )}
              </div>
            </div>
            <Input type="file" accept=".json,.scratchx" ref={fileInputRef} className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileContent(file); }} />
            </div>
            )}
          </div>

          {/* Right side: Templates panel */}
          <div className="md:w-1/2 w-full border-l pl-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Templates</div>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Search templates..."
                value={templateSearch}
                onChange={(e) => setTemplateSearch((e.target as HTMLInputElement).value)}
                className="h-8 text-xs"
              />
              <div className="w-40">
                <Select value={templateTypeFilter} onValueChange={(v) => setTemplateTypeFilter(v as any)}>
                  <SelectTrigger className="h-8 rounded-md border bg-background px-2 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value={DiagramType.CLASS}>Class</SelectItem>
                    <SelectItem value={DiagramType.SEQUENCE}>Sequence</SelectItem>
                    <SelectItem value={DiagramType.USE_CASE}>Use Case</SelectItem>
                    <SelectItem value={DiagramType.ACTIVITY}>Activity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-1 grid grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
              {filteredTemplates.map((tpl: DiagramTemplate) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => { setPreviewTpl(tpl); }}
                    className="group relative flex flex-col gap-2 rounded-md border overflow-hidden bg-background hover:bg-muted/70 transition-colors text-left text-xs"
                  >
                  <div className="w-full h-28 relative overflow-hidden">
                      {/* Lightweight preview: avoid re-rendering heavy ReactFlow nodes on unrelated input changes */}
                      <TemplatePreview tpl={tpl} />
                     <div className="absolute inset-0  pointer-events-auto" />
                  </div>
                  {/* Type badge */}
                  <div className="absolute top-2 right-2">
                    <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-background/80 border text-muted-foreground">
                      {tpl.type === DiagramType.CLASS ? 'Class' : tpl.type === DiagramType.SEQUENCE ? 'Sequence' : tpl.type === DiagramType.USE_CASE ? 'Use Case' : tpl.type === DiagramType.ACTIVITY ? 'Activity' : String(tpl.type)}
                    </span>
                  </div>
                  <div className="px-3 pb-3 pt-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-[0.85rem] font-medium">{tpl.name}</div>
                      <ExternalLink className="mt-0.5 h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-[0.72rem] text-muted-foreground mt-1 line-clamp-2">{tpl.description}</div>
                  </div>
                </button>
              ))}

              {filteredTemplates.length === 0 && (
                <div className="text-xs text-muted-foreground">No templates match your search.</div>
              )}
            </div>
          </div>

          {/* Preview/confirm dialog for selected template */}
          <Dialog open={!!previewTpl} onOpenChange={(v) => { if (!v) setPreviewTpl(null); }}>
            <DialogContent className="sm:max-w-3xl">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle>{previewTpl?.name}</DialogTitle>
                  <button className="p-1 rounded hover:bg-muted" onClick={() => setPreviewTpl(null)} aria-label="Close preview">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </DialogHeader>
              <div className="py-2">
                {previewTpl && (
                  <div className="h-96 relative">
                    <TemplatePreview tpl={previewTpl} />
                    <div className="absolute inset-0  pointer-events-auto" />
                  </div>
                )}
                <div className="mt-3 text-sm text-muted-foreground">{previewTpl?.description}</div>
              </div>
              <DialogFooter className="mt-4 flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => setPreviewTpl(null)}>Cancel</Button>
                <Button size="sm" onClick={async () => {
                  if (!previewTpl) return;
                  try {
                    const tpl = previewTpl;
                    const instance = tpl.createInstance();
                    let title = 'Untitled diagram';
                    try { title = await ensureUniqueTitle(title); } catch (e) { /* ignore */ }
                    const newDiagram: any = {
                      title,
                      activeUsers: [],
                      ...instance,
                    };
                    const created = await addFlowDiagram(projectId, newDiagram);
                    onAdded(created);
                    onSelect(created.id);
                    onOpenChange(false);
                    resetState();
                    setPreviewTpl(null);
                    toast({ title: 'Template created', description: `${tpl.name} template created as new diagram.` });
                  } catch (error: any) {
                    toast({ 
                      title: 'Failed to create template', 
                      description: error.message || 'An error occurred while creating the template.',
                      variant: 'destructive' 
                    });
                  }
                }}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <DialogFooter className="gap-2 mt-4">
          <Button size="sm" variant="outline" onClick={() => { onOpenChange(false); resetState(); }}>Close</Button>
          {createTab==='new' && (
            <Button size="sm" onClick={async () => {
              try {
                let baseTitle = (newTitle || 'Untitled').trim();
                try { baseTitle = await ensureUniqueTitle(baseTitle); } catch (e) { /* ignore */ }
                const newDiagram = { 
                  title: baseTitle, 
                  type: newType, 
                  activeUsers: [], 
                  nodes: [], 
                  edges: [] 
                } as any;

                const created = await addFlowDiagram(projectId, newDiagram);
                onAdded(created);
                onOpenChange(false);
                setNewTitle('');
                onSelect(created.id);
                toast({ title: 'Diagram created', description: 'Your diagram has been created.' });
              } catch (error: any) {
                toast({ 
                  title: 'Failed to create diagram', 
                  description: error.message || 'An error occurred while creating the diagram.',
                  variant: 'destructive' 
                });
              }
            }} disabled={!newTitle.trim()}>
              <Plus className="w-4 h-4 mr-1" /> Create
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDiagramModal;
