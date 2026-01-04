"use client";
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ReportRequirement } from '@/types/report.type';

interface ReportRequirementsSectionProps {
  requirements: ReportRequirement[];
  accentColor?: string;
}

export default function ReportRequirementsSection({ 
  requirements, 
  accentColor = '#2563eb' 
}: ReportRequirementsSectionProps) {
  if (!requirements || requirements.length === 0) {
    return (
      <div className="py-4">
        <p className="text-sm text-muted-foreground italic">No requirements available.</p>
      </div>
    );
  }

  // Group requirements by category
  const groupedByCategory = requirements.reduce<Record<string, ReportRequirement[]>>((acc, req) => {
    const category = req.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(req);
    return acc;
  }, {});

  let requirementCounter = 0;

  return (
    <div className="space-y-8">
      {Object.entries(groupedByCategory).map(([category, reqs]) => (
        <div key={category} className="space-y-4">
          {/* Category Header */}
          <div className="flex items-center gap-3 pb-3 border-b-2" style={{ borderColor: `${accentColor}30` }}>
            <Badge 
              variant="outline" 
              className="px-3 py-1 text-sm font-medium"
              style={{ 
                borderColor: accentColor, 
                backgroundColor: `${accentColor}10`,
                color: accentColor 
              }}
            >
              {category}
            </Badge>
            <span className="text-sm text-gray-500 font-medium">{reqs.length} items</span>
          </div>

          {/* Requirements Cards */}
          <div className="space-y-4">
            {reqs.map((req) => {
              requirementCounter++;
              return (
                <Card 
                  key={req.id} 
                  className="relative pl-16 pr-6 py-4 border-l-4 shadow-sm hover:shadow-md transition-shadow duration-200"
                  style={{ borderLeftColor: accentColor }}
                >
                  {/* Number Badge */}
                  <div 
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md"
                    style={{ backgroundColor: accentColor }}
                  >
                    {requirementCounter}
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <h5 className="font-semibold text-base text-gray-900 leading-tight">
                      {req.title}
                    </h5>
                    {req.description && (
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {req.description}
                      </p>
                    )}
                    {req.content && (
                      <p className="text-sm text-gray-700 leading-relaxed mt-2 pt-2 border-t border-gray-100">
                        {req.content}
                      </p>
                    )}
                  </div>
                </Card>
              );
            })}  
         </div>
        </div>
      ))}
    </div>
  );
}
