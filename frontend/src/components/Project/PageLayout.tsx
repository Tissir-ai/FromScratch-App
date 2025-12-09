'use client'

import { useState, ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
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
  Download,
  History
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import TeamModal from "./TeamModal";
import ChatPanel from "./ChatPanel";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const pathname = usePathname();

  const handleExport = () => {
    toast({
      title: "Export started",
      description: "Your project data is being prepared for export",
    });
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
    <div className="min-h-screen flex w-full">
      {/* Sidebar */}
      <aside
        className={"" + `${isSidebarOpen ? "w-60" : "w-20"}` + " bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col shrink-0 sticky top-0 h-screen overflow-y-auto"}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4">
          {isSidebarOpen && (
            <span className="text-xl font-bold text-primary">FromScratch.ai</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hover:bg-primary-glow hover:text-white transition-smooth"
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg  hover:text-primary transition-smooth ${
                isActive(item.path) ? "text-primary font-medium" : ""
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {isSidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6 shrink-0">
          <h1 className="text-2xl font-semibold truncate">{title}</h1>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleExport}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>

  
  
            
            {/* Share / Invite redesigned button */}
            <button
              type="button"
              onClick={() => setIsTeamModalOpen(true)}
              aria-label="Share project / invite team members"
              className="group inline-flex items-center rounded-full border border-border/40 bg-background/80 backdrop-blur-sm px-3 py-1.5 shadow-sm hover:border-primary/50 hover:bg-primary/5 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <span className="flex -space-x-2 mr-2">
                <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-white ring-2 ring-background group-hover:scale-105 transition-transform">FS</span>
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/80 text-[10px] font-medium text-primary-foreground ring-2 ring-background group-hover:scale-105 transition-transform">+"</span>
              </span>
              <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">Share</span>
            </button>
                                      <button
                          onClick={toggleDarkMode}
                          className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                        >
                            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />  }
                   
                        </button>
            <Button
              variant="default"
              size="icon"
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="bg-gradient-primary animate-pulse-glow"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>

          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
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