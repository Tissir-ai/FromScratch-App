'use client';

import { use, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProject } from '@/context/ProjectContext';
import PageLayout from '@/components/project/PageLayout';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Activity, Search, Clock } from 'lucide-react';
import { fetchLogs } from '@/services/log.service';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/date-utils';

interface LogsPageProps {
  params: Promise<{ projectId: string }>;
}

export default function LogsPage({ params }: LogsPageProps) {
  const { projectId } = use(params);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUser, setFilterUser] = useState<string>('all');
  const [filterAction, setFilterAction] = useState<string>('all');
  
  useEffect(() => {
    if (!projectId) return;
    
    const loadLogs = async () => {
      setLoading(true);
      try {
        const data = await fetchLogs(projectId);
        setLogs(data);
      } catch (error) {
        console.error('Failed to load logs:', error);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    void loadLogs();
  }, [projectId]);


  const getActivityIcon = (message: string) => {
    const lower = message.toLowerCase();
    if (lower.includes('created')) return '🎯';
    if (lower.includes('updated')) return '✏️';
    if (lower.includes('deleted')) return '🗑️';
    if (lower.includes('invited')) return '📧';
    if (lower.includes('assigned')) return '👤';
    if (lower.includes('removed')) return '❌';
    return '📝';
  };

  const getActionType = (message: string): string => {
    const lower = message.toLowerCase();
    if (lower.includes('created')) return 'create';
    if (lower.includes('updated')) return 'update';
    if (lower.includes('deleted')) return 'delete';
    if (lower.includes('invited')) return 'invite';
    if (lower.includes('assigned')) return 'assign';
    if (lower.includes('removed')) return 'remove';
    return 'other';
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'update': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'delete': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'invite': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'assign': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'remove': return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
      default: return 'bg-muted text-muted-foreground border-muted';
    }
  };

  // Extract unique users and action types for filters
  const uniqueUsers = Array.from(new Set(logs.map(log => log.user?.name).filter(Boolean)));
  const uniqueActions = Array.from(new Set(logs.map(log => getActionType(log.details || '')).filter(Boolean)));

  // Apply filters
  const filteredLogs = logs.filter(log => {
    const matchesSearch = !searchQuery || 
      (log.details || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesUser = filterUser === 'all' || log.user?.name === filterUser;
    const matchesAction = filterAction === 'all' || getActionType(log.details || '') === filterAction;

    return matchesSearch && matchesUser && matchesAction;
  });

  return (
    <PageLayout title="Activity Log" projectId={projectId}>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <Activity className="h-8 w-8 text-orange-500" />
                Activity Log
              </h1>
              <p className="text-muted-foreground mt-1">
                Complete history of all project activities
              </p>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {filteredLogs.length} {filteredLogs.length === 1 ? 'Activity' : 'Activities'}
            </Badge>
          </div>

          {/* Filters */}
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* User filter */}
              <Select value={filterUser} onValueChange={setFilterUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {uniqueUsers.map(userName => (
                    <SelectItem key={userName} value={userName!}>
                      {userName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Action filter */}
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {uniqueActions.map(action => (
                    <SelectItem key={action} value={action}>
                      {action.charAt(0).toUpperCase() + action.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(searchQuery || filterUser !== 'all' || filterAction !== 'all') && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  {filteredLogs.length} of {logs.length} activities
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterUser('all');
                    setFilterAction('all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Logs Timeline */}
        <Card className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Activity className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Activities Found</h3>
              <p className="text-sm text-muted-foreground">
                {logs.length === 0 
                  ? 'Project activities will appear here as team members interact with the project.'
                  : 'Try adjusting your filters to see more results.'}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-400px)]">
              <div className="space-y-4 pr-4">
                {filteredLogs.map((log, index) => {
                  const actionType = getActionType(log.details || '');
                  return (
                    <div 
                      key={log.id || index}
                      className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all border border-transparent hover:border-orange-500/20 group"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                        {getActivityIcon(log.details || '')}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={cn("text-xs", getActionColor(actionType))}>
                              {actionType}
                            </Badge>
                            <span className="text-sm font-medium text-foreground">
                              {log.user?.name || 'Unknown User'}
                            </span>
                            {log.user?.team && (
                              <Badge variant="outline" className="text-xs">
                                {log.user.team}
                              </Badge>
                            )}
                          </div>
                          {log.timestamp && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                              <Clock className="h-3 w-3" />
                              {formatDate(log.timestamp)}
                            </div>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mt-1">
                          {log.details || 'Activity'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </Card>
      </div>
    </PageLayout>
  );
}
