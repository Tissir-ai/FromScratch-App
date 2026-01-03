'use client';

import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { History, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { fetchMyLogs } from '@/services/log.service';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import  { formatDate } from "@/lib/date-utils";

interface UserHistorySheetProps {
  projectId: string;
}

export default function UserHistorySheet({ projectId }: UserHistorySheetProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [open, setOpen] = useState(false);

  const loadLogs = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const data = await fetchMyLogs(projectId);
      setLogs(data);
    } catch (error) {
      console.error('Failed to load user logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      void loadLogs();
    }
  }, [open, projectId]);

  const displayLogs = showAll ? logs : logs.slice(0, 5);

  const getActivityIcon = (message: string) => {
    const lower = message.toLowerCase();
    if (lower.includes('created')) return '🎯';
    if (lower.includes('updated')) return '✏️';
    if (lower.includes('deleted')) return '🗑️';
    if (lower.includes('invited')) return '📧';
    if (lower.includes('assigned')) return '👤';
    return '📝';
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-md relative text-xs w-20"
          title="Your activity history"
        >
          <History className="h-5 w-5" />
            <span> Activity </span>
        </Button>
      </SheetTrigger>
      
      <SheetContent side="right" className="w-[400px] sm:w-[500px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-orange-500" />
            Your Activity
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Activity className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">No activity yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Your actions will appear here</p>
            </div>
          ) : (
            <>
              <ScrollArea className={cn(showAll ? "h-[calc(100vh-200px)]" : "h-auto", "pr-4")}>
                <div className="space-y-3">
                  {displayLogs.map((log, index) => (
                    <div 
                      key={log.id || index} 
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-transparent hover:border-orange-500/20"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-lg">
                        {getActivityIcon(log.details || '')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-2">
                          {log.details || 'Activity'}
                        </p>
                        {log.timestamp && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(log.timestamp)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {logs.length > 5 && (
                <div className="mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAll(!showAll)}
                    className="w-full gap-2"
                  >
                    {showAll ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        View All ({logs.length} activities)
                      </>
                    )}
                  </Button>
                </div>
              )}

              <div className="mt-4 pt-4 border-t">
                <Badge variant="outline" className="text-xs">
                  Last {displayLogs.length} of {logs.length} activities
                </Badge>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
