
import { Button } from "@/components/ui/button";
import { useAuth  } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useTheme  } from "@/context/ThemeContext";
import { Moon, Sun, LogOut } from "lucide-react";
export function ProjectNavigation() {
    const { user,isAuthenticated, logout } = useAuth();
      const router = useRouter();
  const { isDarkMode, toggleDarkMode } = useTheme();

    
      // Compute display name 
      const displayName = user
        ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email
        : "";
    
      // Initials for avatar fallback
      const initials = user
        ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`
            .toUpperCase()
            .trim() || (user.email?.[0] ?? "").toUpperCase()
        : "";
    
      const handleLogout = async () => {
        await logout();
        router.push("/");
      };
    return (
      <>
       <div className="absolute top-4 right-4 flex items-center gap-3">
                   <span className="text-sm text-muted-foreground">{isDarkMode ? 'Dark' : 'Light'}</span>
                   <button
                     onClick={toggleDarkMode}
                     className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                   >
                     {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                   </button>
               </div>
        <nav className="relative flex items-center justify-between">
          
            <div>
                <p className="text-sm text-muted-foreground">Workspace</p>
                <h1 className="text-3xl font-semibold">Projects</h1>
            </div>
            <div className="flex items-center gap-4">
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-md border border-border bg-muted px-3 py-1 hover:bg-accent transition-colors">
                    <div className="flex flex-col items-start max-w-[180px]">
                      <span className="text-sm font-medium truncate">{displayName}</span>
                    </div>
                     <span className="flex -space-x-2 ml-1">
                      <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-white ">{initials}</span>
                    </span>
                  
                  </button>
                  </DropdownMenuTrigger>
                  {isAuthenticated && (
                        <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel className="flex flex-col gap-0.5">
                            <span className="text-sm font-medium truncate">{displayName}</span>
                            <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/profil">Profil</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                            Logout
                        </DropdownMenuItem>
                        </DropdownMenuContent>
                  )}
                </DropdownMenu>
               
                <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="rounded-lg bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 gap-2">
                  <LogOut className="h-5 w-5" />
                  <span className="text-sm">Exit</span>
                </Button>
                
            </div>
        </nav>
        </>
    )
}