import { Card } from "@/components/ui/card";
import React from "react";
import PageLayout from "@/components/Project/PageLayout";

interface DiagramsPageProps { params: { projectId: string } | Promise<{ projectId: string }> }

export default function DiagramsPage({ params }: DiagramsPageProps) {
  const resolved = (typeof (params as any)?.then === "function") ? React.use(params as Promise<{ projectId: string }>) : (params as { projectId: string });
  const projectId = resolved.projectId;
  return (
    <PageLayout title="Diagrams" projectId={projectId}>
      <div className="p-6">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">System diagrams and architecture visualizations</p>
        </Card>
      </div>
    </PageLayout>
  );
}