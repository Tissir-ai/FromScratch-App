'use client'

import { useCallback, useEffect, useMemo, useRef, useState, ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { NavLink } from './NavLink';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  GitBranch, 
  FileText, 
  CheckSquare, 
  BarChart3,
  Settings,
  Target,
  MessageSquare,
  Moon,
  Sun,
  Menu,
  X,
  LogOut,
  Download,
  History,  
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  LogOut as ExitIcon,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";  
import { connectRealtime } from '@/services/realtime.service';
import { RealtimeProvider } from '@/context/RealtimeContext';
import { ProjectProvider, useProject } from '@/context/ProjectContext';
import TeamModal from "@/components/project/TeamModal";
import ChatPanel from "@/components/project/ChatPanel";
import CursorLayer from '@/components/project/cursor/CursorLayer';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  projectId: string;
}

// Inner component that assumes it is wrapped by ProjectProvider (so useProject is safe).
const PageLayoutInner = ({ children, title, projectId, user, logout }: DashboardLayoutProps & { user: any; logout: () => Promise<void> | void }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { isDarkMode, toggleDarkMode } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const pageSurfaceRef = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();
  const docParam = searchParams?.get?.('doc') || null;

  const pageSlug = useMemo(() => {
    if (!pathname) return 'dashboard';
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) return 'dashboard';
    const tail = segments[segments.length - 1];
    if (!tail || tail === projectId) {
      return 'dashboard';
    }
    return tail;
  }, [pathname, projectId]);

  // Decide the realtime room id: when viewing diagrams & a doc query is present, use doc as the room id
  const pageRoomId = useMemo(() => {
    if (!pageSlug) return 'dashboard';
    if (pageSlug === 'diagrams' && docParam) return docParam;
    return pageSlug;
  }, [pageSlug, docParam]);

  const selfInitials = useMemo(() => {
    const first = user?.firstName?.[0] ?? 'Y';
    const last = user?.lastName?.[0] ?? 'U';
    return `${first}${last}`.toUpperCase();
  }, [user?.firstName, user?.lastName]);

  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [realtimeUsers, setRealtimeUsers] = useState<Array<{ id: string; firstName?: string; lastName?: string; email?: string }>>([]);
  const [cursors, setCursors] = useState<Array<{ id: string; name?: string; color?: string; x: number; y: number }>>([]);
  const socketRef = useRef<WebSocket | null>(null);

  const colorFor = (id: string) => {
    const palette = ['#ef4444', '#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#06b6d4'];
    const idx = Math.abs([...id].reduce((a, c) => a + c.charCodeAt(0), 0)) % palette.length;
    return palette[idx];
  };

  useEffect(() => {
    // establish websocket when we have project/page (or doc) and user
    if (!projectId || !pageRoomId || !user || !user.id) return;

    // open connection to the room (pageRoomId may be a doc id when viewing a diagram)
    const conn = connectRealtime(projectId, pageRoomId, { id: user.id, firstName: user.firstName || '', lastName: user.lastName || '', email: user.email }, {
      onMessage: (ev: any) => {
        if (!ev || typeof ev !== 'object') return;
        const t = ev.type;
        if (t === 'presence.snapshot' && Array.isArray(ev.users)) {
          setRealtimeUsers(ev.users.map((u: any) => ({ id: String(u.id), firstName: u.firstName, lastName: u.lastName, email: u.email })));
        } else if (t === 'presence.join' && ev.user) {
          const u = ev.user;
          setRealtimeUsers(prev => prev.find(p => String(p.id) === String(u.id)) ? prev : [...prev, { id: String(u.id), firstName: u.firstName, lastName: u.lastName, email: u.email }]);
        } else if (t === 'presence.leave' && ev.user) {
          const u = ev.user;
          setRealtimeUsers(prev => prev.filter(p => String(p.id) !== String(u.id)));
          setCursors(prev => prev.filter(c => c.id !== String(u.id)));
        } else if (t === 'cursor' && ev.user) {
          const uid = String(ev.user.id);
          setCursors(prev => {
            const existing = prev.find(p => p.id === uid);
            const displayName = ((ev.user.firstName || '') + ' ' + (ev.user.lastName || '')).trim() || ev.user.email || '';
            const item = { id: uid, name: displayName, color: colorFor(uid), x: ev.x ?? 0, y: ev.y ?? 0 };
            if (existing) return prev.map(p => p.id === uid ? item : p);
            return [...prev, item];
          });
        }
      }
    });

    socketRef.current = conn.socket;
    socketRef.current.addEventListener('open', () => setIsRealtimeConnected(true));
    socketRef.current.addEventListener('close', () => setIsRealtimeConnected(false));
    socketRef.current.addEventListener('error', () => setIsRealtimeConnected(false));

    return () => {
      try { conn.close(); } catch (e) {}
      socketRef.current = null;
      setIsRealtimeConnected(false);
      setRealtimeUsers([]);
      setCursors([]);
    };
  }, [projectId, pageRoomId, user?.id]);

  const projectCtx = useProject();
    const navItems = [
      { icon: LayoutDashboard, label: "Dashboard", path: `/projects/${projectId}` , requiredPermission: 'view_dashboard'},
      { icon: Target, label: "Overview", path: `/projects/${projectId}/overview`, requiredPermission: 'view_overview' },
      { icon: GitBranch, label: "Diagrams", path: `/projects/${projectId}/diagrams`, requiredPermission: 'view_diagrams' },
      { icon: FileText, label: "Requirements", path: `/projects/${projectId}/requirements` , requiredPermission: 'view_requirements'},
      { icon: CheckSquare, label: "Tasks & Sprints", path: `/projects/${projectId}/tasks` , requiredPermission: 'view_tasks'},
      { icon: BarChart3, label: "Reports", path: `/projects/${projectId}/reports`, requiredPermission: 'view_reports' },
      { icon: History, label: "System Logs", path: `/projects/${projectId}/logs` , requiredPermission: 'view_logs' },
      { icon: Settings, label: "Settings", path: `/projects/${projectId}/settings` , requiredPermission: 'manage_project' },
    ];

    // Only render links the user can access
    const allowedNavItems = useMemo(() => {
      if (!projectCtx?.hasPermission) return navItems;
      return navItems.filter((item) => !item.requiredPermission || projectCtx.hasPermission(item.requiredPermission));
    }, [navItems, projectCtx?.hasPermission]);

    // Map current page to required permission
    const pageRequiredPermission = useMemo(() => {
      switch (pageSlug) {
        case 'overview':
          return 'view_overview';
        case 'diagrams':
          return 'view_diagrams';
        case 'requirements':
          return 'view_requirements';
        case 'tasks':
        case 'tasks&sprints':
          return 'view_tasks';
        case 'reports':
          return 'view_reports';
        case 'logs':
          return 'view_logs';
        case 'settings':
          return 'manage_project';
        case 'dashboard':
        default:
          return 'view_dashboard';
      }
    }, [pageSlug]);

    const canAccessPage = useMemo(() => {
      if (!projectCtx?.hasPermission) return true; // fallback if context missing
      return projectCtx.hasPermission(pageRequiredPermission);
    }, [projectCtx?.hasPermission, pageRequiredPermission]);
  
  const sendCursor = (x: number, y: number) => {
    const ws = socketRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: 'cursor', x, y, ts: Date.now() }));
  };

  // Track mouse on the page surface and send cursor positions (client-side only)
  useEffect(() => {
    const el = pageSurfaceRef.current;
    if (!el) return;
    const handler = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      // send normalized coordinates (0..1) so rendering can adapt to different container sizes
      const nx = (e.clientX - rect.left) / Math.max(1, rect.width);
      const ny = (e.clientY - rect.top) / Math.max(1, rect.height);
      const x = Math.min(1, Math.max(0, nx));
      const y = Math.min(1, Math.max(0, ny));
      sendCursor(x, y);
    };
    el.addEventListener('mousemove', handler);
    return () => el.removeEventListener('mousemove', handler);
  }, [pageSurfaceRef.current, isRealtimeConnected]);

  const handleExport = () => {
    toast({
      title: 'Export started',
      description: 'Your project data is being prepared for export',
    });
  };

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      toast({ title: 'Signed out', description: 'You have been logged out.' });
      router.push('/auth/signin');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to log out right now';
      toast({ title: 'Logout failed', description: message, variant: 'destructive' });
    }
  }, [logout, router, toast]);

 

  const isActive = (path: string) => pathname === path;

  const realtimeValue = {
    connected: isRealtimeConnected,
    users: realtimeUsers,
    cursors,
    sendCursor,
  };

  // While permissions are loading, show a lightweight full-screen loader to avoid flashing unauthorized content
  if (projectCtx?.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
        Loading project…
      </div>
    );
  }

  // If the user lacks permission for this page, show an access denied screen
  if (!canAccessPage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center px-6">
        <div className="text-2xl font-semibold mb-2">Access denied</div>
        <p className="text-muted-foreground max-w-md">You are not authorized to view this page. Please contact the project owner to update your permissions.</p>
      </div>
    );
  }

  // Render export button only from inside the ProjectProvider so `useProject` has a provider above it
  const OwnerExportButton: React.FC = () => {
    const pctx = useProject();
    const ownerPlanLocal = pctx?.ownerPlan;
    if (!ownerPlanLocal?.config?.githubExport) return null;
    return (
      <Button variant="outline" size="sm" onClick={handleExport} className="gap-2 hidden sm:flex">
        <Download className="h-4 w-4" />
        <span className="text-xs">Export</span>
      </Button>
    );
  };

  return (
    <RealtimeProvider value={realtimeValue}>
      <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar (absolute on mobile, fixed on md+) */}
      <aside
        className={cn(
          // absolute on small screens so it overlays content; fixed on md+ for persistent layout
          "absolute md:fixed left-0 top-0 bottom-0 h-screen flex flex-col border-r bg-card transition-all duration-300 ease-in-out overflow-hidden transform",
          // slide behavior: on mobile hide by translating full width when closed
          isSidebarOpen ? "translate-x-0 w-full md:w-64 z-[50]" : "-translate-x-full md:translate-x-0 w-full md:w-[80px] z-[50]"
        )}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-4 border-b shrink-0 justify-between">
          <div className={cn("flex items-center gap-3 overflow-hidden transition-all", isSidebarOpen ? "w-full" : "w-full justify-center")}>
            <div className="rounded-lg bg-primary/10 w-9 h-9 flex items-center justify-center text-primary font-bold shrink-0 border border-primary/20">
              FS
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col leading-none animate-in fade-in duration-300">
                <span className="text-sm font-semibold tracking-tight">FromScratch.ai</span>
                <span className="text-[10px] text-muted-foreground font-medium">Project Workspace</span>
              </div>
            )}
          </div>
          {/* Mobile close button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Close sidebar"
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

        </div>


        {/* Navigation */}
        <ScrollArea className="flex-1 py-10">
          <nav className="grid gap-1 px-2">
            <TooltipProvider delayDuration={0}>
              {allowedNavItems.map((item) => {
                const active = isActive(item.path);
                const isAllowed = !item.requiredPermission || projectCtx?.hasPermission(item.requiredPermission || '') === true;
                // If there's a required permission and the user lacks it, show a disabled entry with a tooltip
                if (!isAllowed) {
                  return (
                    <Tooltip key={item.path}>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors text-muted-foreground cursor-not-allowed",
                            !isSidebarOpen && "justify-center px-2"
                          )}
                        >
                          <item.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                          {isSidebarOpen && <span>{item.label}</span>}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Not authorized</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return (
                  <Tooltip key={item.path}>
                    <TooltipTrigger asChild>
                      <NavLink
                        href={item.path}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          active 
                            ? "bg-primary/10 text-primary" 
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          !isSidebarOpen && "justify-center px-2"
                        )}
                        activeClassName=""
                      >
                        <item.icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
                        {isSidebarOpen && <span>{item.label}</span>}
                      </NavLink>
                    </TooltipTrigger>
                  </Tooltip>
                );
              })}
            </TooltipProvider>
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 border-t bg-card/50">
          <UserProfileCard
            projectId={projectId}
            isSidebarOpen={isSidebarOpen}
            user={user}
            onLogout={() => {
              void handleLogout();
            }}
          />
        </div>
      </aside>

      {/* Mobile overlay when sidebar is open (closes sidebar on click) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 md:hidden z-50"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* Main Content */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0 overflow-hidden transition-all pt-16",
        // shift content to the right to account for the fixed sidebar on md+ screens
        isSidebarOpen ? "md:ml-64" : "md:ml-[80px]"
      )}>
        
        {/* Header */}
        <header className={cn(
          "h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-6 shrink-0 fixed top-0 right-0 z-30",
          isSidebarOpen ? "md:left-64" : "md:left-[80px]"
        )}>
          
          <div className="flex items-center gap-4">
             {!isSidebarOpen && (
                <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
             )}
             <div className="flex items-center gap-2">
                     {/* Toggle Button (fixed on top of all components) */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="h-8 w-8 rounded-md border shadow-sm bg-background text-muted-foreground hover:text-foreground"
            aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
          <div className="flex items-center gap-4">
             <h1 className="text-xl font-semibold tracking-tight truncate">{title}</h1>       
               <div className="hidden md:flex items-center gap-3 pr-2">
              <div className="flex -space-x-2 items-center">
                {user &&(
                <div title={`${(user.firstName || '') + ' ' + (user.lastName || '')}`.trim() + ' (you)' || user.email }  className="relative h-7 w-7 rounded-full border-2 border-background bg-primary text-[10px] font-semibold text-primary-foreground flex items-center justify-center">
                  {selfInitials}
                  <span
                    title={isRealtimeConnected ? 'Connected (realtime)' : 'Disconnected'}
                    className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ring-2 ring-background ${isRealtimeConnected ? 'bg-emerald-400' : 'bg-gray-400'}`}
                  />
                </div>
                )}
                {/* Other connected users */}
                {realtimeUsers && realtimeUsers.filter(u => u.id !== user?.id).slice(0,5).map((u) => (
                  <div key={u.id} title={`${(u.firstName || '') + ' ' + (u.lastName || '')}`.trim() || u.email} className="relative h-7 w-7 rounded-full border-2 border-background bg-primary text-[10px] font-semibold text-primary-foreground flex items-center justify-center">
                    {(((u.firstName?.[0] ?? '') + (u.lastName?.[0] ?? '')) || 'U').toUpperCase()}
                    <span
                      title={isRealtimeConnected ? 'Connected (realtime)' : 'Disconnected'}
                      className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ring-2 ring-background ${isRealtimeConnected ? 'bg-emerald-400' : 'bg-gray-400'}`}
                    />
                  </div>
                ))}
                
              </div>
            </div>
            </div>
          </div>
          </div>
          
          <div className="flex items-center gap-3">
            <OwnerExportButton />
            <button
              type="button"
              onClick={() => setIsTeamModalOpen(true)}
              className="group inline-flex items-center rounded-full border bg-background px-3 py-1.5 shadow-sm hover:bg-accent transition-colors"
            >
              <div className="flex -space-x-2 mr-2">
                <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-[10px] text-primary-foreground ring-2 ring-background">FS</div>
                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] ring-2 ring-background">+</div>
              </div>
              <span className="text-xs font-medium">Share</span>
            </button>

            <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="rounded-full">
               {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.push('/projects')}
              className="rounded-md w-16"
              title="Exit to projects"
            >
              <span className="text-xs">Exit</span>
              <ExitIcon className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-muted/10">
          <div
            ref={pageSurfaceRef}
            className="relative mx-auto max-w-8xl h-full"
          >
            {children}
            {/* Global cursor overlay (exclude our own cursor) */}
            <CursorLayer cursors={cursors.filter(c => c.id !== user?.id)} />

          </div>
        </main>
      </div>

      {/* Team Modal */}
      <TeamModal open={isTeamModalOpen} onOpenChange={setIsTeamModalOpen} />
    </div>
    </RealtimeProvider>
  );
};

const PageLayout = ({ children, title, projectId }: DashboardLayoutProps) => {
  const { user, logout } = useAuth();

  return (
    <ProjectProvider projectId={projectId} memberId={user?.id ?? ''}>
      <PageLayoutInner
        projectId={projectId}
        title={title}
        user={user}
        logout={logout}
      >
        {children}
      </PageLayoutInner>
    </ProjectProvider>
  );
};

export default PageLayout;

// Small presentational component for the user card shown in the sidebar
interface UserProfileCardProps {
  projectId: string;
  isSidebarOpen: boolean;
  user: { firstName?: string; lastName?: string; email?: string } | null;
  onLogout: () => void;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({ projectId, isSidebarOpen, user, onLogout }) => {
  const router = useRouter();
  const initials = `${user?.firstName?.[0] ?? 'U'}${user?.lastName?.[0] ?? ''}`.toUpperCase();
  const fullName = user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Unknown user' : 'Guest';
  const email = user?.email ?? '---';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={cn("w-full justify-start px-2 h-auto py-2  ", !isSidebarOpen && "justify-center px-0")}>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          {isSidebarOpen && (
            <div className="flex flex-col items-start ml-3 text-left overflow-hidden">
              <span className="text-sm font-medium leading-none truncate w-full">{fullName}</span>
              <span className="text-xs text-muted-foreground mt-1 truncate w-full">{email}</span>
            </div>
          )}
          {isSidebarOpen && <MoreVertical className="ml-auto h-4 w-4 text-muted-foreground shrink-0" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={`w-56 ${!isSidebarOpen && "ml-4"}`} side={isSidebarOpen ? "top" : "right"}>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push(`/profil`)}>
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(`/profil?tab=subscription`)}>
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};