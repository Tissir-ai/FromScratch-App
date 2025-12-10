'use client'

import { useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import { Menu, X, Sun, Moon } from "lucide-react";
import Link from "next/link";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isDarkMode, toggleDarkMode } = useTheme();


  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <img src="/logos/fromscratch.png" alt="Logo" className="h-8 w-8 mr-2" />
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

            <Link href="/#pricing" className="text-foreground hover:text-primary transition-colors font-medium">
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

            
              <Link href="/auth/signin">
                <Button variant="ghost" className="font-medium text-foreground hover:text-primary transition-colors">
                  Sign In
                </Button>
              </Link>
            
              <Link href="/auth/signup">
              <Button className="bg-primary-glow hover:bg-primary-hover text-primary-foreground font-semibold">
                Get Started Free
              </Button>
              </Link>

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
              href="/#pricing" 
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

            
            <div className="pt-4 border-t border-border space-y-3">
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
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;