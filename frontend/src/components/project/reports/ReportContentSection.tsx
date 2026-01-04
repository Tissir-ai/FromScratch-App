"use client";
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Card } from '@/components/ui/card';

interface ReportContentSectionProps {
  content: string;
  accentColor?: string;
}

export default function ReportContentSection({ 
  content, 
  accentColor = '#2563eb' 
}: ReportContentSectionProps) {
  if (!content) {
    return null;
  }

  return (
    <Card className="overflow-hidden shadow-sm">
      <div 
        className="h-1 w-full"
        style={{ 
          background: `linear-gradient(to right, ${accentColor}, ${accentColor}80)` 
        }}
      />
      <div className="p-6">
        <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-code:text-gray-800 prose-pre:bg-gray-50 prose-ul:text-gray-700 prose-ol:text-gray-700">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </Card>
  );
}
