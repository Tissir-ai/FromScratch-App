import React from "react";
import PageLayout from "@/components/Project/PageLayout";
import TaskBoard from "@/components/Project/TaskManagement/TaskBoard";

interface TasksPageProps { params: { projectId: string } | Promise<{ projectId: string }> }
export default function TasksPage({ params }: TasksPageProps) {
  const resolved = (typeof (params as any)?.then === "function")
    ? React.use(params as Promise<{ projectId: string }>)
    : (params as { projectId: string });
  const projectId = resolved.projectId;
  return (
    <PageLayout title="Tasks" projectId={projectId}>
      <div className="p-6">
        <TaskBoard />
      </div>
    </PageLayout>
  );
}