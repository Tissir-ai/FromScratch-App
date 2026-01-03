"use client";

import React, { useEffect, useState, useCallback } from "react";
import PageLayout from "@/components/project/PageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  History, 
  RefreshCw, 
  Clock, 
  User, 
  Activity,
  FileText,
  Plus,
  Edit,
  Trash2,
  CheckSquare,
  FileCode,
  GitBranch,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { fetchLogs } from "@/services/log.service";
import { useAuth } from "@/context/AuthContext";
import type { Log, LogEntry } from "@/types/log.type";

interface LogsPageProps {
  params: { projectId: string } | Promise<{ projectId: string }>;
}

// Helper to format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// Parse action from log message and return appropriate icon/color
function getActionDetails(message: string): { action: string; icon: React.ElementType; color: string } {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes("created") || lowerMsg.includes("added")) {
    return { action: "created", icon: Plus, color: "text-green-500" };
  }
  if (lowerMsg.includes("updated") || lowerMsg.includes("modified") || lowerMsg.includes("edited")) {
    return { action: "updated", icon: Edit, color: "text-blue-500" };
  }
  if (lowerMsg.includes("deleted") || lowerMsg.includes("removed")) {
    return { action: "deleted", icon: Trash2, color: "text-red-500" };
  }
  if (lowerMsg.includes("completed") || lowerMsg.includes("finished")) {
    return { action: "completed", icon: CheckSquare, color: "text-purple-500" };
  }
  return { action: "activity", icon: Activity, color: "text-muted-foreground" };
}

export default function LogsPage({ params }: LogsPageProps) {
  // Always resolve params the same way to maintain hooks order
  const resolved = React.use(
    typeof (params as any)?.then === "function"
      ? (params as Promise<{ projectId: string }>)
      : Promise.resolve(params as { projectId: string })
  );
  const projectId = resolved.projectId;

  const { user, initializing } = useAuth();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAction, setFilterAction] = useState<"all" | "created" | "updated" | "deleted" | "completed">("all");

  const loadLogs = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchLogs(projectId, user);
      setLogs(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load activity logs";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [projectId, user]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Flatten all log entries from all log documents
  const allEntries: (LogEntry & { logId: string; logCreatedAt: string })[] = logs.flatMap(log =>
    (log.data || []).map(entry => ({
      ...entry,
      id: entry.id || entry._id || "",
      logId: log.id || log._id || "",
      logCreatedAt: log.created_at,
    }))
  );

  // Sort by timestamp descending
  const sortedEntries = [...allEntries].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Apply filters
  const filteredEntries = sortedEntries.filter(entry => {
    const matchesSearch = searchQuery === "" || 
      entry.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const actionDetails = getActionDetails(entry.message);
    const matchesAction = filterAction === "all" || actionDetails.action === filterAction;
    
    return matchesSearch && matchesAction;
  });

  // Stats
  const stats = {
    total: sortedEntries.length,
    created: sortedEntries.filter(e => getActionDetails(e.message).action === "created").length,
    updated: sortedEntries.filter(e => getActionDetails(e.message).action === "updated").length,
    deleted: sortedEntries.filter(e => getActionDetails(e.message).action === "deleted").length,
  };

  return (
    <PageLayout title="System Logs" projectId={projectId}>
      <div className="px-8 py-8 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <History className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Activity Log</h1>
              <p className="text-sm text-muted-foreground">
                Track all user actions and project changes
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadLogs}
            disabled={loading}
            className="self-start md:self-auto"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Actions</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Activity className="h-8 w-8 text-muted-foreground/30" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="text-2xl font-bold text-green-500">{stats.created}</p>
                </div>
                <Plus className="h-8 w-8 text-green-500/30" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Updated</p>
                  <p className="text-2xl font-bold text-blue-500">{stats.updated}</p>
                </div>
                <Edit className="h-8 w-8 text-blue-500/30" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Deleted</p>
                  <p className="text-2xl font-bold text-red-500">{stats.deleted}</p>
                </div>
                <Trash2 className="h-8 w-8 text-red-500/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-border/50">
          <CardContent className="pt-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search activity..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {(["all", "created", "updated", "deleted", "completed"] as const).map(action => (
                  <Button
                    key={action}
                    variant={filterAction === action ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterAction(action)}
                    className="capitalize"
                  >
                    {action}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <Activity className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <Card className="border-border/50">
            <CardContent className="pt-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-start gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && filteredEntries.length === 0 && (
          <Card className="border-border/50">
            <CardContent className="py-12">
              <div className="text-center">
                <History className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No activity yet</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery || filterAction !== "all"
                    ? "Try adjusting your filters"
                    : "User actions will appear here as team members work on the project"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Activity List */}
        {!loading && !error && filteredEntries.length > 0 && (
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <CardDescription>
                Showing {filteredEntries.length} of {sortedEntries.length} activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-1">
                  {filteredEntries.map((entry, index) => {
                    const { icon: Icon, color, action } = getActionDetails(entry.message);
                    const timestamp = new Date(entry.timestamp);
                    
                    return (
                      <div 
                        key={`${entry.logId}-${entry.id}-${index}`}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group border-l-2 border-transparent hover:border-primary/50"
                      >
                        <div className={`p-2 rounded-full bg-muted/50 ${color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium break-words">{entry.message}</p>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatRelativeTime(timestamp)}
                            </span>
                            <span className="hidden sm:inline text-muted-foreground/50">
                              {timestamp.toLocaleString()}
                            </span>
                            {entry.user_id && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                User
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className={`opacity-0 group-hover:opacity-100 transition-opacity ${color} capitalize`}
                        >
                          {action}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
