"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import { Users, CheckSquare, User, DollarSign, Clock } from "lucide-react";
import PageLayout from "@/components/Project/PageLayout";
import dynamic from "next/dynamic";
import ProjectCharts from "@/components/Project/Dashboard/ProjectCharts";


interface DashboardPageProps {
  params: { projectId: string } | Promise<{ projectId: string }>
}

export default function DashboardPage({ params }: DashboardPageProps) {
  const resolved = (typeof (params as any)?.then === "function")
    ? React.use(params as Promise<{ projectId: string }>)
    : (params as { projectId: string });
  const projectId = resolved.projectId;
  // Sample data for charts
  const projectProgressData = [
    { month: "Jan", completed: 12, inProgress: 8 },
    { month: "Feb", completed: 18, inProgress: 12 },
    { month: "Mar", completed: 24, inProgress: 15 },
    { month: "Apr", completed: 30, inProgress: 18 },
  ];

  const costData = [
    { category: "Development", value: 25000, color: "hsl(var(--primary))" },
    { category: "Design", value: 10000, color: "hsl(var(--chart-2))" },
    { category: "Infrastructure", value: 8000, color: "hsl(var(--chart-3))" },
    { category: "Testing", value: 2000, color: "hsl(var(--chart-4))" },
  ];



  return (
    <PageLayout title="Dashboard" projectId={projectId}>
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up">
          {/* Project Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 hover:shadow-[var(--shadow-elevated)] transition-smooth">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Teams</p>
                  <p className="text-2xl font-bold">2</p>
                </div>
              </div>
            </Card>


            <Card className="p-6 hover:shadow-[var(--shadow-elevated)] transition-smooth">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Members</p>
                  <p className="text-2xl font-bold">8</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-[var(--shadow-elevated)] transition-smooth">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <CheckSquare className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tasks</p>
                  <p className="text-2xl font-bold">48</p>
                </div>
              </div>
            </Card>


            <Card className="p-6 hover:shadow-[var(--shadow-elevated)] transition-smooth">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Est. Cost</p>
                  <p className="text-2xl font-bold">$45k</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Charts Row (Deferred client-only to avoid SSR errors) */}
            <ProjectCharts projectProgressData={projectProgressData} costData={costData} />
        </div>
      </div>
    </PageLayout>
  );
}