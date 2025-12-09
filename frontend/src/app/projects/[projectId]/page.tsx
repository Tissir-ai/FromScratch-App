"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, CheckSquare, User, DollarSign, Clock, TrendingUp, AlertCircle, Calendar, Target, Activity } from "lucide-react";
import PageLayout from "@/components/Project/PageLayout";
import dynamic from "next/dynamic";
import ProjectCharts, { 
  ProgressDatum, 
  CostDatum, 
  TeamPerformanceDatum, 
  TaskDistributionDatum 
} from "@/components/Project/Dashboard/ProjectCharts";


interface DashboardPageProps {
  params: { projectId: string } | Promise<{ projectId: string }>
}

export default function DashboardPage({ params }: DashboardPageProps) {
  const resolved = (typeof (params as any)?.then === "function")
    ? React.use(params as Promise<{ projectId: string }>)
    : (params as { projectId: string });
  const projectId = resolved.projectId;
  
  // Sample data for charts
  const projectProgressData: ProgressDatum[] = [
    { month: "Jan", completed: 12, inProgress: 8 },
    { month: "Feb", completed: 18, inProgress: 12 },
    { month: "Mar", completed: 24, inProgress: 15 },
    { month: "Apr", completed: 30, inProgress: 18 },
    { month: "May", completed: 38, inProgress: 22 },
    { month: "Jun", completed: 45, inProgress: 25 },
  ];

  const costData: CostDatum[] = [
    { category: "Development", value: 25000, color: "hsl(var(--primary))" },
    { category: "Design", value: 10000, color: "hsl(var(--chart-2))" },
    { category: "Infrastructure", value: 8000, color: "hsl(var(--chart-3))" },
    { category: "Testing", value: 2000, color: "hsl(var(--chart-4))" },
  ];

  const teamPerformanceData: TeamPerformanceDatum[] = [
    { month: "Jan", velocity: 28, efficiency: 82 },
    { month: "Feb", velocity: 32, efficiency: 85 },
    { month: "Mar", velocity: 35, efficiency: 88 },
    { month: "Apr", velocity: 38, efficiency: 90 },
    { month: "May", velocity: 42, efficiency: 92 },
    { month: "Jun", velocity: 45, efficiency: 94 },
  ];

  const taskDistribution: TaskDistributionDatum[] = [
    { status: "Completed", count: 45, color: "hsl(var(--chart-1))" },
    { status: "In Progress", count: 25, color: "hsl(var(--chart-2))" },
    { status: "In Review", count: 12, color: "hsl(var(--chart-3))" },
    { status: "Blocked", count: 5, color: "hsl(var(--chart-4))" },
    { status: "Todo", count: 18, color: "hsl(var(--muted))" },
  ];

  const upcomingMilestones = [
    { title: "MVP Release", date: "Dec 15, 2025", daysLeft: 9, status: "on-track" },
    { title: "Beta Testing", date: "Dec 28, 2025", daysLeft: 22, status: "on-track" },
    { title: "Final Launch", date: "Jan 15, 2026", daysLeft: 40, status: "at-risk" },
  ];

  const recentActivity = [
    { action: "Task completed", detail: "User authentication module", time: "2 hours ago", user: "John Doe" },
    { action: "Milestone reached", detail: "Phase 1 Development", time: "5 hours ago", user: "System" },
    { action: "New member added", detail: "Sarah Johnson joined Frontend team", time: "1 day ago", user: "Admin" },
    { action: "Bug fixed", detail: "Login redirect issue resolved", time: "2 days ago", user: "Mike Smith" },
  ];



  return (
    <PageLayout title="Dashboard" projectId={projectId}>
      <div className="p-6">
        <div className="w-full space-y-6 animate-fade-in-up">
          {/* Header Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Total Tasks</p>
                  <p className="text-3xl font-bold mt-2">105</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    12% from last week
                  </p>
                </div>
                <div className="p-3 bg-primary/10 rounded-xl">
                  <CheckSquare className="h-8 w-8 text-primary" />
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Team Members</p>
                  <p className="text-3xl font-bold mt-2">8</p>
                  <p className="text-xs text-muted-foreground mt-1">Across 2 teams</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Completion</p>
                  <p className="text-3xl font-bold mt-2">68%</p>
                  <Progress value={68} className="h-2 mt-2" />
                </div>
                <div className="p-3 bg-green-500/10 rounded-xl">
                  <Target className="h-8 w-8 text-green-500" />
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-amber-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Budget Used</p>
                  <p className="text-3xl font-bold mt-2">$45k</p>
                  <p className="text-xs text-muted-foreground mt-1">of $65k total</p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-xl">
                  <DollarSign className="h-8 w-8 text-amber-500" />
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Velocity</p>
                  <p className="text-3xl font-bold mt-2">45</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +8 points
                  </p>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-xl">
                  <Activity className="h-8 w-8 text-purple-500" />
                </div>
              </div>
            </Card>
          </div>

          {/* Project Status Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-primary" />
                  Task Distribution
                </h3>
                <Badge variant="outline">Real-time</Badge>
              </div>
              <div className="space-y-4">
                {taskDistribution.map((task) => (
                  <div key={task.status} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{task.status}</span>
                      <span className="text-muted-foreground">{task.count} tasks</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress 
                        value={(task.count / 105) * 100} 
                        className="h-2 flex-1"
                        style={{ 
                          '--progress-background': task.color 
                        } as React.CSSProperties & { [key: string]: string }}
                      />
                      <span className="text-sm font-semibold min-w-[45px] text-right">
                        {((task.count / 105) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Milestones
                </h3>
              </div>
              <div className="space-y-4">
                {upcomingMilestones.map((milestone, index) => (
                  <div key={index} className="p-4 rounded-lg border bg-card hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm">{milestone.title}</h4>
                      <Badge 
                        variant={milestone.status === "on-track" ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {milestone.status === "on-track" ? "On Track" : "At Risk"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{milestone.date}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="h-3 w-3" />
                      <span className="font-medium">{milestone.daysLeft} days left</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Charts */}
          <ProjectCharts 
            projectProgressData={projectProgressData} 
            costData={costData}
            teamPerformanceData={teamPerformanceData}
            taskDistribution={taskDistribution}
          />

          {/* Recent Activity */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Recent Activity
              </h3>
              <Badge variant="outline">Last 7 days</Badge>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-medium text-sm">{activity.action}</p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.detail}</p>
                    <p className="text-xs text-muted-foreground mt-1">by {activity.user}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}