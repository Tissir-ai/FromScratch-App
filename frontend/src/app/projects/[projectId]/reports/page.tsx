"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Download, RefreshCw, GripVertical } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import PageLayout from "@/components/project/PageLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchReportData } from "@/services/report.service";
import { ReportPreview } from "@/components/project/reports";
import type { ReportDataResponse, ReportTemplate } from "@/types/report.type";

interface ReportsPageProps {
  params: { projectId: string } | Promise<{ projectId: string }>;
}

export default function ReportsPage({ params }: ReportsPageProps) {
  // Always call React.use() unconditionally to maintain hooks order
  const resolved = React.use(
    typeof (params as any)?.then === "function"
      ? (params as Promise<{ projectId: string }>)
      : Promise.resolve(params as { projectId: string })
  );
  const projectId = resolved.projectId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportDataResponse | null>(null);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("default");
  const [downloading, setDownloading] = useState(false);
  const [sectionOrder, setSectionOrder] = useState<string[]>([]);

  const previewRef = useRef<HTMLDivElement>(null);
  const previewScrollRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const loadReportData = useCallback(() => {
    if (!projectId) return;
    setLoading(true);
    setError(null);

    fetchReportData(projectId)
      .then((data) => {
        setReportData(data);
        setTemplates(data.templates || []);
        const firstTemplate = data.templates?.[0]?.id ?? "default";
        setSelectedTemplateId((prev) => {
          const ids = (data.templates || []).map((t:any) => t.id);
          if (prev && ids.includes(prev)) return prev;
          return firstTemplate;
        });
        const defaultOrder: string[] = [];
        if (data.requirements?.length) defaultOrder.push("requirements");
        if (data.diagrams?.length) defaultOrder.push("diagrams");
        if (data.planner_content) defaultOrder.push("planner");
        if (data.export_content) defaultOrder.push("blueprint");
        setSectionOrder(defaultOrder);
      })
      .catch((err) => setError(err?.message || "Unable to load report data"))
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  const recalcPages = useCallback(() => {
    const container = previewScrollRef.current;
    if (!container) return;
    const viewHeight = container.clientHeight || 1;
    const scrollHeight = container.scrollHeight || 1;
    const pages = Math.max(1, Math.ceil(scrollHeight / viewHeight));
    const current = Math.min(pages, Math.max(1, Math.floor(container.scrollTop / viewHeight) + 1));
    setTotalPages(pages);
    setCurrentPage(current);
  }, []);

  useEffect(() => {
    const container = previewScrollRef.current;
    if (!container) return;
    recalcPages();
    const onScroll = () => recalcPages();
    container.addEventListener("scroll", onScroll);
    const onResize = () => recalcPages();
    window.addEventListener("resize", onResize);
    return () => {
      container.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [recalcPages]);

  useEffect(() => {
    recalcPages();
  }, [reportData, selectedTemplateId, sectionOrder, recalcPages]);

  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };

  const onDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("text/plain");
    if (!draggedId || draggedId === targetId) return;

    const current = [...sectionOrder];
    const fromIdx = current.findIndex((id) => id === draggedId);
    const toIdx = current.findIndex((id) => id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;

    current.splice(fromIdx, 1);
    current.splice(toIdx, 0, draggedId);
    setSectionOrder(current);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDownloadPdf = async () => {
    if (!previewRef.current || !reportData) return;
    
    setDownloading(true);
    setError(null);

    try {
      // Capture the preview section as canvas
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      // Calculate PDF dimensions (A4)
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF("p", "mm", "a4");
      let heightLeft = imgHeight;
      let position = 0;

      // Add the image, handling multiple pages if needed
      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download the PDF
      pdf.save(`${reportData.project_name || "project"}-report.pdf`);
    } catch (err: any) {
      console.error("PDF generation error:", err);
      setError(err?.message || "Failed to generate PDF");
    } finally {
      setDownloading(false);
    }
  };

  const hasContent = reportData && (
    (reportData.requirements && reportData.requirements.length > 0) ||
    (reportData.diagrams && reportData.diagrams.length > 0) ||
    reportData.planner_content ||
    reportData.export_content
  );

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

    if (!reportData || !hasContent) {
      return (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            No report content available yet. Add requirements, diagrams, or generate a run to populate this page.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-100px)]">
        {/* Left: Controls + Sections order */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <Card className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Template</p>
                <h3 className="text-sm font-semibold">Styling</h3>
              </div>
              <div className="text-xs text-muted-foreground text-right">
                <div>Requirements: {reportData.requirements?.length || 0}</div>
                <div>Diagrams: {reportData.diagrams?.length || 0}</div>
              </div>
            </div>
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((tpl) => (
                  <SelectItem key={tpl.id} value={tpl.id}>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{tpl.label}</span>
                      {tpl.description && (
                        <span className="text-xs text-muted-foreground">{tpl.description}</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>

          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Sections order</p>
                <p className="text-xs text-muted-foreground">Drag to reorder the preview</p>
              </div>
            </div>
            <div className="space-y-2">
              {sectionOrder.map((sectionId) => {
                const labelMap: Record<string, string> = {
                  requirements: "Requirements",
                  diagrams: "Architecture Diagrams",
                  planner: "Implementation Plan",
                  blueprint: "Blueprint",
                };
                return (
                  <div
                    key={sectionId}
                    draggable
                    onDragStart={(e) => onDragStart(e, sectionId)}
                    onDragOver={onDragOver}
                    onDrop={(e) => onDrop(e, sectionId)}
                    className="flex items-center gap-3 p-3 border rounded-md bg-background hover:bg-muted/50 cursor-move"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{labelMap[sectionId] || sectionId}</p>
                      <p className="text-xs text-muted-foreground">{sectionId}</p>
                    </div>
                  </div>
                );
              })}
              {sectionOrder.length === 0 && (
                <div className="text-sm text-muted-foreground">No sections available to order.</div>
              )}
            </div>
          </Card>
        </div>

        {/* Right: Preview */}
        <div className="col-span-12 lg:col-span-8">
          <Card className="h-full max-h-[calc(100vh-200px)] overflow-hidden bg-gray-100">
            <div className="flex items-center justify-between px-4 pt-3 pb-1 text-sm text-muted-foreground">
              <span>Pages: {currentPage} / {totalPages}</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => {
                    const container = previewScrollRef.current;
                    if (!container) return;
                    const viewHeight = container.clientHeight || 1;
                    container.scrollTo({ top: (currentPage - 2) * viewHeight, behavior: "smooth" });
                  }}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => {
                    const container = previewScrollRef.current;
                    if (!container) return;
                    const viewHeight = container.clientHeight || 1;
                    container.scrollTo({ top: currentPage * viewHeight, behavior: "smooth" });
                  }}
                >
                  Next
                </Button>
              </div>
            </div>
            <div className="p-4 h-full overflow-auto" ref={previewScrollRef}>
              <div className="mx-auto max-w-4xl shadow-lg">
                <ReportPreview
                  ref={previewRef}
                  data={reportData}
                  template={selectedTemplate}
                  sectionsOrder={sectionOrder}
                />
              </div>
            </div>
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
            <p className="text-sm text-muted-foreground">
              {reportData?.project_name || "Project"} · Owner: {reportData?.project_owner || "--"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadReportData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={handleDownloadPdf} disabled={downloading || loading}>
              <Download className="h-4 w-4 mr-2" />
              {downloading ? "Generating PDF…" : "Download"}
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
