"use client";
import React, {useEffect} from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, FileText, Eye, ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import CreateDiagramModal from "./CreateDiagramModal";
import Link from 'next/link';
import { formatDate } from '@/lib/date-utils';

interface FlowDiagramListProps {
  onSelect: (id: string) => void;
  activeId: string | null;
  layout?: "grid" | "vertical";
  pageSize?: number;
  diagrams?: any[];
  onAdded?: (diagram: any) => void;
  projectId: string;
}

export const FlowDiagramList: React.FC<FlowDiagramListProps> = ({ onSelect, activeId, layout = "grid", pageSize = 4, diagrams: diagramsProp, onAdded, projectId }) => {
  const [page, setPage] = React.useState(1);
  const [diagrams, setDiagrams] = React.useState(() => diagramsProp ? diagramsProp.slice() : []);
  // responsive page size based on window height — defaults to `pageSize` prop
  const [pageSizeState, setPageSizeState] = React.useState<number>(() => pageSize);
  const [showCreate, setShowCreate] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const filtered = diagrams.filter(d => {
    const q = query.trim().toLowerCase();
    return q ? (d.title.toLowerCase().includes(q) || String(d.type).toLowerCase().includes(q)) : true;
  });
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSizeState));
  const start = (page - 1) * pageSizeState;
  const items = filtered.slice(start, start + pageSizeState);
  
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  // Update internal list when parent supplies diagrams
  useEffect(() => {
    if (diagramsProp) setDiagrams(diagramsProp.slice());
  }, [diagramsProp]);

  // compute an appropriate page size based on available vertical space
  useEffect(() => {
    const computePageSize = () => {
      try {
        const h = window.innerHeight;
        // approximate reserved space (header + footer + gaps)
        const reserved = 200; // px
        // approximate item height (depends on layout)
        const itemH = layout === 'vertical' ? 96 : 140; // px per item/card
        const calculated = Math.max(2, Math.floor((h - reserved) / itemH));
        // if a prop `pageSize` was explicitly provided, use it as a lower bound
        const finalSize = Math.max(pageSize, calculated);
        setPageSizeState(finalSize);
      } catch (err) {
        setPageSizeState(pageSize);
      }
    };
    computePageSize();
    window.addEventListener('resize', computePageSize);
    return () => window.removeEventListener('resize', computePageSize);
  }, [layout, pageSize]);

  const containerClass = layout === "vertical" ? "flex flex-col gap-3" : "grid gap-4 sm:grid-cols-2";
  return (
    <div className="flex h-full flex-col">
      {/* Header with title, search, and create (optimized for narrow width) */}
      <div className="mb-3 space-y-2">
       
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery((e.target as HTMLInputElement).value)} placeholder="Search diagrams..." className="pl-8 h-8 w-full" />
          </div>
          <Button size="sm" variant="default" onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-1" /> New
          </Button>
        </div>
        <CreateDiagramModal
          open={showCreate}
          onOpenChange={setShowCreate}
          onSelect={onSelect}
          projectId={projectId}
          onAdded={(diagram:any) => {
            if (onAdded) {
              onAdded(diagram);
            } else {
              setDiagrams(prev => [diagram, ...prev]);
            }
          }}
        />
      </div>
      <div className={`flex-1 ${containerClass} pr-1`}>
        {diagrams.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 text-sm text-muted-foreground">
            <FileText className="h-8 w-8 mb-3" />
            <div className="font-medium">No diagrams yet</div>
            <div className="text-xs mt-1">Create your first diagram to get started.</div>
            <Button size="sm" className="mt-3" onClick={() => setShowCreate(true)}>
              <Plus className="w-3 h-3 mr-1" /> New Diagram
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">No diagrams match your search.</div>
        ) : (
          items.map((d) => (
            <Card key={d.id} className="px-3 py-2 border-muted hover:shadow-sm transition-shadow">
              <div className="grid grid-cols-2 gap-2 items-start">
              {/* Top Left: Name + last edited */}
              <div className="min-w-0 w-52 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="font-semibold text-sm truncate" title={d.title}>{d.title}</div>
                </div>
                {d?.updated_at && (
                  <div className="text-xs text-muted-foreground">Edited {formatDate(d.updated_at)}</div>
                )}
                </div>
                {/* Top Right: Open button */}
                <div className="justify-self-end">
                  <Link href={`/projects/${projectId}/diagrams?doc=${d.id}`}>
                    <Button
                      variant={activeId === d.id ? "default" : "outline"}
                      className={`p-1 w-8 h-8 group ${activeId === d.id ? "bg-primary-glow text-white" : "hover:bg-primary-glow"}`}
                      size="sm"
                      onClick={() => onSelect(d.id)}
                    >
                      {activeId === d.id ? (
                        <Eye className="w-2 h-2 text-white" />
                      ) : (
                        <ArrowRight className="w-2 h-2 group-hover:text-white" />
                      )}
                    </Button>
                  </Link>
                </div>
              </div>
                {/* Type */}
                <div className="flex items-center gap-2 justify-between mt-2">
                  <Badge variant="outline" className="text-[10px] uppercase">{d.type} Diagram</Badge>

                </div>
            </Card>
          ))
        )}
      </div>
      {diagrams.length > 0 && (
        <div className="mt-3 flex items-center justify-between">
          <Button size="sm" variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
          <div className="text-xs text-muted-foreground">Page {page} / {totalPages}</div>
          <Button size="sm" variant="outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
        </div>
      )}
    </div>
  );
};
