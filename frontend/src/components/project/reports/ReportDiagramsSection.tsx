"use client";
import React from 'react';
import { Card } from '@/components/ui/card';
import ReportDiagramViewer from './ReportDiagramViewer';
import type { ReportDiagram } from '@/types/report.type';

interface ReportDiagramsSectionProps {
  diagrams: ReportDiagram[];
  accentColor?: string;
}

export default function ReportDiagramsSection({ 
  diagrams, 
  accentColor = '#2563eb' 
}: ReportDiagramsSectionProps) {
  if (!diagrams || diagrams.length === 0) {
    return (
      <div className="py-4">
        <p className="text-sm text-muted-foreground italic">No diagrams available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {diagrams.map((diagram, index) => (
        <Card key={diagram.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
          <div 
            className="px-6 py-4 border-b flex items-center justify-between"
            style={{ 
              background: `linear-gradient(to right, ${accentColor}08, transparent)`,
              borderBottomColor: `${accentColor}20`
            }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: accentColor }}
              >
                {index + 1}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{diagram.title}</h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  {diagram.nodes?.length || 0} nodes · {diagram.edges?.length || 0} connections
                </p>
              </div>
            </div>
            <span 
              className="text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ 
                backgroundColor: `${accentColor}15`, 
                color: accentColor 
              }}
            >
              {diagram.type}
            </span>
          </div>
          <div className="p-4">
            <ReportDiagramViewer diagram={diagram} height={380} />
          </div>
        </Card>
      ))}
    </div>
  );
}
