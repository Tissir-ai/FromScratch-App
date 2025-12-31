import { Card } from "@/components/ui/card";
import React from "react";
import PageLayout from "@/components/project/PageLayout";

interface ReportsPageProps { params: { projectId: string } | Promise<{ projectId: string }> }

export default function ReportsPage({ params }: ReportsPageProps) {
  const resolved = (typeof (params as any)?.then === "function") ? React.use(params as Promise<{ projectId: string }>) : (params as { projectId: string });
  const projectId = resolved.projectId;
  return (
    <PageLayout title="Reports" projectId={projectId}>
      <div className="p-6">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Project reports and analytics</p>
        </Card>
      </div>
    </PageLayout>
  );
}