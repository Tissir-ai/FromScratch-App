"use client";
import React , {useEffect} from "react";
import PageLayout from "@/components/project/PageLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, Link} from "lucide-react";
import type { OverviewData } from '@/types/project.type'; 
import { fetchProjectOverview } from '@/services/project.service';
import { NavLink } from "@/components/project/NavLink";
import { formatRelativeTime } from "@/lib/utils";

interface OverviewPageProps {
  // During migration Next.js may provide params as a Promise; keep backward compatibility by allowing both.
  params: { projectId: string } | Promise<{ projectId: string }>;
}

export default function OverviewPage({ params }: OverviewPageProps) {
  // Future-proof: unwrap Promise form with React.use() when provided, else fall back.
  const resolved = (typeof (params as any)?.then === "function") ? React.use(params as Promise<{ projectId: string }>) : (params as { projectId: string });
  const projectId = resolved.projectId;

  // Local state for overview
  const [overview, setOverview] = React.useState<OverviewData | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    fetchProjectOverview(projectId).then(data => {
      if (!mounted) return;
      setOverview(data);
    }).catch(err => {
      if (!mounted) return;
      setError(err?.message || 'Failed to load overview');
    }).finally(() => {
      if (!mounted) return;
      setLoading(false);
    });

    return () => { mounted = false };
  }, [projectId]);

  // Convert API tasks (lowercase priorities) to UI-friendly caps and optional time placeholder
    const todayTasks = (overview?.tasks ?? []).slice(0,3).map(t => ({
      title: t.title,
      priority: t.priority === 'high' ? 'High' : t.priority === 'medium' ? 'Medium' : 'Low',
      time: t.due_date ? new Date(t.due_date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'All day'
    }));
  
    // Ensure teams is always an array to avoid 'possibly undefined' errors
    const teams = overview?.teams ?? [];

  return (
    <PageLayout title="Overview" projectId={projectId}>
      <div className="px-8 py-8 space-y-10 max-w-7xl mx-auto">
        {/* Hero / header */}
        <div className="flex flex-col items-start">
          <div className="space-y-4">
            {loading ? (
              <div>
                <div className="h-8 w-64 rounded bg-muted/30 animate-pulse" />
                <div className="mt-2 h-4 w-96 rounded bg-muted/20 animate-pulse" />
              </div>
            ) : (
              <>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/70 to-primary/40 bg-clip-text text-transparent">
                  {overview?.name ?? 'Project'}
                </h1>
                <label className="text-sm md:text-base font-medium text-muted-foreground">
                  Created {formatRelativeTime(new Date(overview?.project_created_at ?? Date.now()))} by  {(() => {
                    const owner = (overview?.members ?? []).find((m: any) => ((m.role || m.role_name || '').toLowerCase() === 'owner'));
                    if (!owner) return '';
                    return ` ${owner.name ?? 'Owner'}`;
                  })()}
                </label>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-prose">
                  {overview?.description ?? ''}
                </p>
              </>
            )}
          </div>
          {error && <p className="text-sm text-destructive mt-3">{error}</p>}
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
            {loading ? (
              <ul className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <li key={i} className="flex items-center gap-4 py-3 px-2 rounded-lg">
                    <div className="h-2.5 w-2.5 rounded-full bg-muted/20" />
                    <div className="flex-1 min-w-0">
                      <div className="h-4 w-48 rounded bg-muted/20 animate-pulse mb-2" />
                      <div className="h-3 w-28 rounded bg-muted/10 animate-pulse" />
                    </div>
                    <div className="h-6 w-14 rounded bg-muted/20 animate-pulse" />
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="divide-y divide-border/50">
                {todayTasks.length === 0 ? (
                  <li className="py-3 text-sm text-muted-foreground">No tasks for today</li>
                ) : todayTasks.map((task, i) => {
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
                          <span>Team</span>
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
            )}

            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-destructive" /> High
                <span className="inline-block h-2 w-2 rounded-full bg-primary ml-3" /> Medium
                <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground ml-3" /> Low
              </span>
              <span>{(overview?.tasks ?? []).length} tasks</span>
            </div>
          </Card>
        </section>

        {/* Teams section */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Teams</h2>
            {teams.length > 0 && (
            <span className="text-xs text-muted-foreground">{teams.length} team{teams.length===1?"":"s"}</span>
              )}
            </div>

          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-5 flex flex-col gap-4">
                  <div className="h-10 w-10 rounded bg-muted animate-pulse" />
                  <div className="h-4 w-32 rounded bg-muted/20 animate-pulse" />
                  <div className="h-3 w-20 rounded bg-muted/10 animate-pulse" />
                </Card>
              ))}
            </div>
          ) : teams.length > 0 ? ( 
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {teams.map((team: any, idx: number) => (
                <Card key={idx} className="p-5 flex flex-col gap-4 group hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center font-semibold text-sm">
                      {team.name?.slice?.(0,1)?.toUpperCase?.() ?? '?'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium truncate">{team.name}</h3>
                      <p className="text-xs text-muted-foreground">{team.users_count ?? team.count ?? 0} member{(team.users_count ?? team.count ?? 0)===1?"":"s"}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No teams found</p>
          )}
        </section>

        {/* Members summary */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Members</h2>
          {overview?.members ? (
              <Card className="p-5 overflow-x-auto">
                {loading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-8 w-full rounded bg-muted/10 animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-muted-foreground text-left">
                        <th className="py-2 font-medium">Name</th>
                        <th className="py-2 font-medium">Role</th>
                        <th className="py-2 font-medium">Team</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {(overview?.members).map((m: any, i: number) => (
                        <tr key={i} className="hover:bg-muted/50 transition-colors">
                          <td className="py-2 pr-2">
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium">
                                {initials(m.name)}
                              </div>
                              <span className="truncate max-w-[140px] font-medium">{m.name}</span>
                            </div>
                          </td>
                          <td className="py-2 pr-2"><Badge variant="outline" className="text-[10px]">{m.role ?? m.role_name ?? ''}</Badge></td>
                          <td className="py-2 pr-2 text-xs">{m.team ?? ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Card>
          ):(
            <p className="text-sm text-muted-foreground">No members found</p>
          )}
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