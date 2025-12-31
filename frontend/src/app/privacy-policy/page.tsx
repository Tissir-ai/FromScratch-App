'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sun, Moon } from 'lucide-react';
import content from './content.json';
import { useTheme } from "@/context/ThemeContext";

export default function PrivacyPolicy() {
  const router = useRouter();
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Go Back Button */}
        <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-6 px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
          Go Back
        </button>
         <button
                      onClick={toggleDarkMode}
                      className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                    >
                      {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>
        </div>
        {/* Title */}
        <h1 className="text-4xl font-bold mb-4 text-foreground">{content.title}</h1>
        <p className="text-muted-foreground mb-8">Last updated: {content.lastUpdated}</p>

        {/* Sections */}
        <div className="space-y-8">
          {content.sections.map((section, index) => (
            <section key={index} className="bg-card p-6 rounded-lg shadow-sm">
              <h2 className="text-2xl font-semibold mb-4 text-card-foreground">{section.title}</h2>
              <div className="space-y-3 text-muted-foreground">
                {section.content.map((paragraph, pIndex) => (
                  <p key={pIndex} className="leading-relaxed">
                    {paragraph.startsWith('•') || paragraph.includes(':') ? (
                      <span className="block ml-4">{paragraph}</span>
                    ) : (
                      paragraph
                    )}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}