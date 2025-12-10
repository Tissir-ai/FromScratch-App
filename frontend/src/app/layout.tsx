import type { Metadata } from 'next'
import '@/assets/css/globals.css'
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Providers } from './providers'
import { ThemeProvider } from "@/context/ThemeContext";

export const metadata: Metadata = {
  title: 'FromScratch.ai - From Idea to Complete Project Plan – Instantly',
  description: 'Transform your software ideas into comprehensive project plans with automatic diagram generation, tech stack recommendations, and full documentation - all in seconds.',
  authors: [{ name: 'FromScratch.ai' }],
  icons : {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <Providers>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              {children}
            </TooltipProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
} 