"use client";
import React from "react";
import { useCallback, useEffect, useState } from "react";
import { GripVertical } from "lucide-react";

import PageLayout from "@/components/project/PageLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchReportPdf, fetchReportSections } from "@/services/report.service";
import type { ReportSection, ReportTemplate } from "@/types/report.type";

interface ReportsPageProps {
  params: { projectId: string } | Promise<{ projectId: string }>;
}

export default function ReportsPage({ params }: ReportsPageProps) {
  const resolved = (typeof (params as any)?.then === "function") ? React.use(params as Promise<{ projectId: string }>) : (params as { projectId: string });
  const projectId = resolved.projectId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sections, setSections] = useState<ReportSection[]>([]);
  const [orderedSections, setOrderedSections] = useState<ReportSection[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>(undefined);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  
  const [projectName, setProjectName] = useState<string>("");
  const [projectOwner, setProjectOwner] = useState<string>("");
  const [requirementsCount, setRequirementsCount] = useState<number>(0);
  const [diagramsCount, setDiagramsCount] = useState<number>(0);
  
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const loadSections = useCallback(() => {
    if (!projectId) return;
    setLoading(true);
    setError(null);

    fetchReportSections(projectId)
      .then((data) => {
        setProjectName(data.project_name || "");
        setProjectOwner(data.project_owner || "");
        setRequirementsCount((data.requirements || []).length);
        setDiagramsCount((data.diagrams || []).length);
        setSections(data.sections || []);
        setOrderedSections(data.sections || []);
        setTemplates(data.templates || []);
        const firstTemplate = data.templates?.[0]?.id ?? "default";
        setSelectedTemplate((prev) => {
          const ids = (data.templates || []).map((t) => t.id);
          if (prev && ids.includes(prev)) return prev;
          return firstTemplate;
        });
      })
      .catch((err) => setError(err?.message || "Unable to load report sections"))
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    loadSections();
  }, [loadSections]);

  useEffect(() => {
    if (!projectId || !selectedTemplate || orderedSections.length === 0) {
      setPreviewUrl(null);
      return;
    }

    let active = true;
    setPreviewLoading(true);

    fetchReportPdf(projectId, selectedTemplate)
      .then((blob) => {
        if (!active) return;
        const url = URL.createObjectURL(blob);
        setPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
      })
      .catch((err) => setError(err?.message || "Unable to load PDF preview"))
      .finally(() => {
        if (active) setPreviewLoading(false);
      });

    return () => {
      active = false;
      setPreviewLoading(false);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [projectId, selectedTemplate, orderedSections.length]);

  const handleDownload = async () => {
    if (!projectId || !selectedTemplate) return;
    setDownloading(true);
    setError(null);
    try {
      const blob = await fetchReportPdf(projectId, selectedTemplate);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `project-${projectId}-report.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err?.message || "Unable to download report");
    } finally {
      setDownloading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, sectionId: string) => {
    setDraggedId(sectionId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const draggedIdx = orderedSections.findIndex(s => s.id === draggedId);
    const targetIdx = orderedSections.findIndex(s => s.id === targetId);

    if (draggedIdx === -1 || targetIdx === -1) return;

    const newSections = [...orderedSections];
    const [removed] = newSections.splice(draggedIdx, 1);
    newSections.splice(targetIdx, 0, removed);
    setOrderedSections(newSections);
    setDraggedId(null);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">Loading report data…</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-destructive/10 border-destructive/30 border rounded-lg p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      );
    }

    if (orderedSections.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">No report sections available yet. Generate a run to populate this page.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-3 gap-4 h-[calc(100vh-250px)]">
        {/* Left: Draggable Sections */}
        <Card className="col-span-1 p-4 overflow-auto space-y-2">
          <div className="sticky top-0 bg-background pb-2">
            <p className="text-xs font-semibold text-muted-foreground">SECTIONS ({orderedSections.length})</p>
            <p className="text-xs text-muted-foreground mt-1">Drag to reorder</p>
          </div>
          <div className="space-y-2">
            {orderedSections.map((section) => (
              <div
                key={section.id}
                draggable
                onDragStart={(e) => handleDragStart(e, section.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, section.id)}
                className={`p-3 rounded-md border cursor-move transition-colors ${
                  draggedId === section.id
                    ? "bg-muted/50 border-primary/50"
                    : "bg-background hover:bg-muted/30 border-muted"
                }`}
              >
                <div className="flex items-start gap-2">
                  <GripVertical className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{section.title}</p>
                    <p className="text-xs text-muted-foreground">{section.id}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Right: PDF Preview & Controls */}
        <div className="col-span-2 space-y-3 flex flex-col">
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">TEMPLATE</p>
                <h3 className="text-sm font-semibold mt-1">PDF Styling</h3>
              </div>
              <Button size="sm" onClick={handleDownload} disabled={downloading || previewLoading}>
                {downloading ? "Downloading…" : "Download PDF"}
              </Button>
            </div>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((tpl) => (
                  <SelectItem key={tpl.id} value={tpl.id}>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{tpl.label}</span>
                      {tpl.description ? (
                        <span className="text-xs text-muted-foreground">{tpl.description}</span>
                      ) : null}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>

          <Card className="flex-1 overflow-hidden rounded-md border bg-muted/30">
            {previewLoading && (
              <div className="p-4 text-sm text-muted-foreground">Loading preview…</div>
            )}
            {!previewLoading && previewUrl && (
              <iframe title="Report preview" src={previewUrl} className="w-full h-full" />
            )}
            {!previewLoading && !previewUrl && (
              <div className="h-full flex items-center justify-center p-4 text-sm text-muted-foreground">
                Select a template to preview the PDF.
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  };

  return (
    <PageLayout title="Reports" projectId={projectId}>
      <div className="p-6 space-y-4 h-screen flex flex-col">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div>
            <h2 className="text-xl font-semibold">Reports</h2>
            <p className="text-sm text-muted-foreground">{projectName || "Project"} · Owner: {projectOwner || "--"}</p>
            <div className="text-xs text-muted-foreground mt-1">Requirements: {requirementsCount} · Diagrams: {diagramsCount}</div>
          </div>
          <div className="flex items-center gap-2">   
            <Button variant="outline" size="sm" onClick={loadSections} disabled={previewLoading || loading}>
              Refresh
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          {renderContent()}
        </div>
      </div>
    </PageLayout>
  );
}
