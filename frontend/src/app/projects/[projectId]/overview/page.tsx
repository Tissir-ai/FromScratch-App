"use client";
import React from "react";
import PageLayout from "@/components/Project/PageLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, Link} from "lucide-react";
import { mockTeams, mockMembers } from "@/components/Project/Settings/mockData";
import { AVAILABLE_PAGES } from "@/components/Project/Settings/types";
import { NavLink } from "@/components/Project/NavLink";

interface OverviewPageProps {
  // During migration Next.js may provide params as a Promise; keep backward compatibility by allowing both.
  params: { projectId: string } | Promise<{ projectId: string }>;
}

export default function OverviewPage({ params }: OverviewPageProps) {
  // Future-proof: unwrap Promise form with React.use() when provided, else fall back.
  const resolved = (typeof (params as any)?.then === "function") ? React.use(params as Promise<{ projectId: string }>) : (params as { projectId: string });
  const projectId = resolved.projectId;
  // Placeholder project meta; in future fetch from API
  const projectName = "Amazing Project";
  const projectDescription = "A comprehensive platform enabling collaborative planning, estimation, execution and reporting across software delivery lifecycle.";

  const teams = mockTeams;
  const members = mockMembers;
  const totalMembers = members.length;
  const totalTeams = teams.length;
  const pagesCount = AVAILABLE_PAGES.length;
    const todayTasks = [
    { title: "Review PR #234", priority: "High", time: "10:00 AM" },
    { title: "Client Meeting", priority: "Medium", time: "2:00 PM" },
    { title: "Update Documentation", priority: "Low", time: "4:00 PM" },
  ];

  return (
  <PageLayout title="Overview" projectId={projectId}>
      <div className="px-8 py-8 space-y-10 max-w-7xl mx-auto">
        {/* Hero / header */}
        <div className="flex flex-col items-start">
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/70 to-primary/40 bg-clip-text text-transparent">
              {projectName}
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-prose">
              {projectDescription}
            </p>
          </div>

        </div>
                  {/* Today's Tasks (Enhanced UI) */}
          <section className="space-y-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Today's Tasks</h2>
              </div>
              <NavLink
                href={`/projects/${projectId}/tasks`}
                className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                View All
              </NavLink>
            </div>
            <Card className="p-5 flex flex-col gap-4 group hover:shadow-md transition-shadow">
            <ul className="divide-y divide-border/50">
              {todayTasks.map((task, i) => {
                const priorityStyles = {
                  High: "bg-destructive/15 text-destructive border border-destructive/30",
                  Medium: "bg-primary/15 text-primary border border-primary/30",
                  Low: "bg-muted text-muted-foreground border border-border/40",
                } as const;
                const dotColor = {
                  High: "bg-destructive",
                  Medium: "bg-primary",
                  Low: "bg-muted-foreground",
                } as const;
                return (
                  <li
                    key={i}
                    className="group flex items-center gap-4 py-3 px-2 rounded-lg hover:bg-muted/40 transition-colors"
                  >
                    <div className={`h-2.5 w-2.5 rounded-full ${dotColor[task.priority as keyof typeof dotColor]} shadow-sm group-hover:scale-110 transition-transform`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium leading-tight truncate flex items-center gap-2">
                        {task.title}
                        {task.priority === 'High' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-destructive">
                            ⚡ Urgent
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                        <span>{task.time}</span>
                        <span className="inline-block h-1 w-1 rounded-full bg-border" />
                        <span>Team Alpha</span>
                      </p>
                    </div>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-md backdrop-blur-sm ${priorityStyles[task.priority as keyof typeof priorityStyles]}`}
                    >
                      {task.priority}
                    </span>
                  </li>
                )
              })}
            </ul>
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-destructive" /> High
                <span className="inline-block h-2 w-2 rounded-full bg-primary ml-3" /> Medium
                <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground ml-3" /> Low
              </span>
              <span>{todayTasks.length} tasks today</span>
            </div>
            </Card>
          </section>
        {/* Teams section */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Teams</h2>
            <span className="text-xs text-muted-foreground">{totalTeams} team{totalTeams===1?"":"s"}</span>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map(team => {
              const teamMembers = members.filter(m => m.teamId === team.id);
              return (
                <Card key={team.id} className="p-5 flex flex-col gap-4 group hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center font-semibold text-sm">
                      {team.name.slice(0,1).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium truncate">{team.name}</h3>
                      <p className="text-xs text-muted-foreground">{teamMembers.length} member{teamMembers.length===1?"":"s"}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 min-h-[32px]">
                    {team.pageAccess.length === 0 && (
                      <span className="text-xs text-muted-foreground">No pages yet</span>
                    )}
                    {team.pageAccess.slice(0,5).map(p => (
                      <Badge key={p} variant="secondary" className="text-[10px]">{p}</Badge>
                    ))}
                    {team.pageAccess.length > 5 && (
                      <Badge variant="outline" className="text-[10px]">+{team.pageAccess.length - 5}</Badge>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Members summary */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Members</h2>
          <Card className="p-5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground text-left">
                  <th className="py-2 font-medium">Name</th>
                  <th className="py-2 font-medium">Email</th>
                  <th className="py-2 font-medium">Role</th>
                  <th className="py-2 font-medium">Team</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {members.map(m => {
                  const team = m.teamId ? teams.find(t => t.id === m.teamId) : undefined;
                  return (
                    <tr key={m.id} className="hover:bg-muted/50 transition-colors">
                      <td className="py-2 pr-2">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium">
                            {initials(m.name || m.email)}
                          </div>
                          <span className="truncate max-w-[140px] font-medium">{m.name}</span>
                        </div>
                      </td>
                      <td className="py-2 pr-2 truncate max-w-[160px]">{m.email}</td>
                      <td className="py-2 pr-2"><Badge variant="outline" className="text-[10px]">{m.role}</Badge></td>
                      <td className="py-2 pr-2 text-xs">{team ? team.name : <span className="text-muted-foreground">Guest</span>}</td>  
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </section>
      </div>
    </PageLayout>
  );
}

function initials(value: string) {
  const base = value.split("@")[0].replace(/\./g," ");
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
}