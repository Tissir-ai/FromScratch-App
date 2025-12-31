'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, Sun, Moon } from "lucide-react";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user, isAuthenticated, logout , subscription } = useAuth();
  const router = useRouter();

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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="text-2xl font-bold text-primary">
              FromScratch.ai
            </a>
             {/* Desktop Navigation */}
          <div className=" ml-8 hidden md:flex items-center space-x-8">
            <Link href="/how-it-works" className="text-foreground hover:text-primary transition-colors font-medium">
              How It Works
            </Link>

            <Link href="/#features" className="text-foreground hover:text-primary transition-colors font-medium">
              Features
            </Link>

            <Link href={subscription ? "/subscription" : "/#pricing"} className="text-foreground hover:text-primary transition-colors font-medium">
              Pricing
            </Link>
              <Link  href="/contact" className="text-foreground hover:text-primary transition-colors font-medium">
              Contact Us
            </Link>
          </div>
          </div>
         
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />} 
       
            </button>
            {!isAuthenticated && (
              <>
                <Link href="/auth/signin">
                  <Button
                    variant="ghost"
                    className="font-medium text-foreground hover:text-primary transition-colors"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-primary-glow hover:bg-primary-hover text-primary-foreground font-semibold">
                    Get Started Free
                  </Button>
                </Link>
              </>
            )}
            {/* User Button Section */}
            {isAuthenticated && user && (
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
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium truncate">{displayName}</span>
                    <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/projects">My Projects</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profil">Profil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
 
            </button>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-b border-border">
          
          <div className="container mx-auto px-4 py-4 space-y-4">
                          {isAuthenticated && user && (
                            <>
                <Link href="/profil" className="px-3 ">
                  <div className="flex items-center gap-3 px-3 py-2 rounded-md border border-border bg-muted hover:bg-accent transition-colors">
                    <Avatar className="h-10 w-10">

                        <AvatarImage alt={displayName} />
                               <AvatarFallback className="text-sm font-semibold">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start min-w-0">
                      <span className="text-sm font-medium truncate">{displayName}</span>
                      <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                    </div>
                  </div>
                </Link>
  
               <Link href="/projects" 
              className="block text-foreground hover:text-primary transition-colors font-medium py-2"
               onClick={() => setIsMenuOpen(false)}>
                        My Projects
              </Link>
              </>
            )}
            <Link 
              href="/how-it-works" 
              className="block text-foreground hover:text-primary transition-colors font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link 
              href="/#features" 
              className="block text-foreground hover:text-primary transition-colors font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
           
            <Link 
              href={subscription ? "/subscription" : "/#pricing"}
              className="block text-foreground hover:text-primary transition-colors font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </Link>
               <Link 
              href="/contact" 
              className="block text-foreground hover:text-primary transition-colors font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact Us
            </Link>
           

            
            <div className="pt-4 border-t border-border">
              {!isAuthenticated  && (
                <div className="space-y-3">
                  <Link href="/auth/signin">
                    <Button variant="ghost" className="w-full font-medium">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-semibold">
                      Get Started Free
                    </Button>
                  </Link>
                </div>
              ) }
              {isAuthenticated && (
                 <Button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                    >
                      Logout
                    </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;