'use client'

import { useState, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { NavLink } from './NavLink';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  MoreVertical
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import TeamModal from "./TeamModal";
import ChatPanel from "./ChatPanel";
import { useToast } from "@/hooks/use-toast";
import { Button as UiButton } from '@/components/ui/button';
import { useEffect } from 'react';
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

const PageLayout = ({ children, title, projectId }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
    const { isDarkMode, toggleDarkMode } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  // Mock current user - replace with real auth/context as needed
  const [currentUser, setCurrentUser] = useState<{firstName:string; lastName:string; email?:string} | null>({ firstName: 'Ayman', lastName: 'Gassi', email: 'ayman@example.com' });

  const handleExport = () => {
    toast({
      title: "Export started",
      description: "Your project data is being prepared for export",
    });
  };

  const handleLogout = () => {
    // clear auth state (if any) and navigate to sign-in
    try {
      // localStorage.removeItem('auth');
    } catch (e) {
      // ignore
    }
    toast({ title: 'Signed out', description: 'You have been logged out.' });
    router.push('/auth/signin');
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: `/projects/${projectId}` },
    { icon: Target, label: "Overview", path: `/projects/${projectId}/overview` },
    { icon: GitBranch, label: "Diagrams", path: `/projects/${projectId}/diagrams` },
    { icon: FileText, label: "Requirements", path: `/projects/${projectId}/requirements` },
    { icon: CheckSquare, label: "Tasks & Sprints", path: `/projects/${projectId}/tasks` },
    { icon: BarChart3, label: "Reports", path: `/projects/${projectId}/reports` },
    { icon: History, label: "System Logs", path: `/projects/${projectId}/logs` },
    { icon: Settings, label: "Settings", path: `/projects/${projectId}/settings` },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar */}
      <aside 
        className={cn(
          "group/sidebar h-screen relative flex flex-col border-r bg-card transition-all duration-300 ease-in-out z-[50]",
          isSidebarOpen ? "w-64" : "w-[80px]"
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
        </div>

        {/* Toggle Button - Absolute positioned on the border */}
        <Button
          variant="outline"
          size="icon"
          className="absolute -right-3 top-20 h-6 w-6 rounded-full border shadow-sm z-40 hidden group-hover/sidebar:flex bg-background text-muted-foreground hover:text-foreground"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </Button>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-10">
          <nav className="grid gap-1 px-2">
            <TooltipProvider delayDuration={0}>
              {navItems.map((item) => {
                const active = isActive(item.path);
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
                    {/* {!isSidebarOpen && (
                      <TooltipContent side="right" className="font-medium">
                        {item.label}
                      </TooltipContent>
                    )} */}
                  </Tooltip>
                );
              })}
            </TooltipProvider>
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 border-t bg-card/50">
          <UserProfileCard projectId={projectId} isSidebarOpen={isSidebarOpen} />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-4">
             {!isSidebarOpen && (
                <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
             )}
             <h1 className="text-xl font-semibold tracking-tight truncate">{title}</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleExport} className="gap-2 hidden sm:flex">
              <Download className="h-4 w-4" />
              <span className="text-xs">Export</span>
            </Button>

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
              variant="default"
              size="icon"
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="rounded-full shadow-lg shadow-primary/20"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-muted/10">
          <div className="mx-auto max-w-8xl h-full">
             {children}
          </div>
        </main>
      </div>

      {/* Team Modal */}
      <TeamModal open={isTeamModalOpen} onOpenChange={setIsTeamModalOpen} />

      {/* Chat Panel */}
      <ChatPanel open={isChatOpen} onOpenChange={setIsChatOpen} />
    </div>
  );
};

export default PageLayout;

// Small presentational component for the user card shown in the sidebar
const UserProfileCard: React.FC<{ projectId: string; isSidebarOpen: boolean }> = ({ projectId, isSidebarOpen }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [user] = useState(() => ({ firstName: 'Ayman', lastName: 'Gassi', email: 'ayman@example.com' }));

  const onLogout = () => {
    toast({ title: 'Signed out', description: 'You have been logged out.' });
    router.push('/auth/signin');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={cn("w-full justify-start px-2 h-auto py-2  ", !isSidebarOpen && "justify-center px-0")}>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {(user.firstName[0] || 'U') + (user.lastName[0] || '')}
            </AvatarFallback>
          </Avatar>
          {isSidebarOpen && (
            <div className="flex flex-col items-start ml-3 text-left overflow-hidden">
              <span className="text-sm font-medium leading-none truncate w-full">{user.firstName} {user.lastName}</span>
              <span className="text-xs text-muted-foreground mt-1 truncate w-full">{user.email}</span>
            </div>
          )}
          {isSidebarOpen && <MoreVertical className="ml-auto h-4 w-4 text-muted-foreground shrink-0" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={`w-56 ${!isSidebarOpen && "ml-4"}`} side={isSidebarOpen ? "top" : "right"}>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push(`/projects/${projectId}/profile`)}>
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};