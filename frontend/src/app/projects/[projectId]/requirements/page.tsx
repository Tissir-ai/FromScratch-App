import { Card } from "@/components/ui/card";
import React from "react";
import PageLayout from "@/components/Project/PageLayout";

interface RequirementsPageProps { params: { projectId: string } | Promise<{ projectId: string }> }

export default function RequirementsPage({ params }: RequirementsPageProps) {
  const resolved = (typeof (params as any)?.then === "function") ? React.use(params as Promise<{ projectId: string }>) : (params as { projectId: string });
  const projectId = resolved.projectId;
  return (
    <PageLayout title="Requirements" projectId={projectId}>
      <div className="p-6">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Project requirements and specifications</p>
        </Card>
      </div>
    </PageLayout>
  );
}