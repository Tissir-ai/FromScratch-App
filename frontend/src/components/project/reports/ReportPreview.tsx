"use client";
import React, { forwardRef } from 'react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import ReportRequirementsSection from './ReportRequirementsSection';
import ReportDiagramsSection from './ReportDiagramsSection';
import ReportContentSection from './ReportContentSection';
import type { ReportDataResponse, ReportTemplate } from '@/types/report.type';

interface ReportPreviewProps {
  data: ReportDataResponse;
  template?: ReportTemplate;
  sectionsOrder?: string[];
}

const DEFAULT_ORDER = ['requirements', 'diagrams', 'planner'];

const ReportPreview = forwardRef<HTMLDivElement, ReportPreviewProps>(
  ({ data, template, sectionsOrder }, ref) => {
    const accentColor = template?.accent || '#2563eb';
    const fontFamily = template?.font_family || "'Segoe UI', system-ui, sans-serif";
    const generatedAt = new Date().toLocaleString("en-US", {
      year: 'numeric',
      month: 'long',
      day: 'numeric'});

    const order = (sectionsOrder && sectionsOrder.length > 0 ? sectionsOrder : DEFAULT_ORDER).filter(Boolean);

    const sectionBlocks = order.map((sectionId) => {
      if (sectionId === 'requirements' && data.requirements && data.requirements.length > 0) {
        return (
          <section className="space-y-5" key="requirements">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${accentColor}15` }}>
                <svg className="w-5 h-5" style={{ color: accentColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: accentColor }}>
                  Requirements
                </h2>
                <p className="text-sm text-gray-500">{data.requirements.length} items defined</p>
              </div>
            </div>
            <ReportRequirementsSection
              requirements={data.requirements}
              accentColor={accentColor}
            />
          </section>
        );
      }

      if (sectionId === 'diagrams' && data.diagrams && data.diagrams.length > 0) {
        return (
          <section className="space-y-5" key="diagrams">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${accentColor}15` }}>
                <svg className="w-5 h-5" style={{ color: accentColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: accentColor }}>
                  Architecture Diagrams
                </h2>
                <p className="text-sm text-gray-500">{data.diagrams.length} diagrams included</p>
              </div>
            </div>
            <ReportDiagramsSection
              diagrams={data.diagrams}
              accentColor={accentColor}
            />
          </section>
        );
      }

      if (sectionId === 'planner' && data.planner_content) {
        return (
          <section className="space-y-5" key="planner">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${accentColor}15` }}>
                <svg className="w-5 h-5" style={{ color: accentColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: accentColor }}>
                  Implementation Plan
                </h2>
                <p className="text-sm text-gray-500">Detailed execution roadmap</p>
              </div>
            </div>
            <ReportContentSection
              content={data.planner_content}
              accentColor={accentColor}
            />
          </section>
        );
      }
      return null;
    }).filter(Boolean);

    return (
      <div
        ref={ref}
        className="bg-white text-gray-900 min-h-full"
        style={{ fontFamily }}
      >
        {/* Professional Header / Cover */}
        <div className="bg-gradient-to-br from-gray-50 to-white border-b-4 px-12 py-10" style={{ borderBottomColor: accentColor }}>
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Header bar with logo */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: accentColor }}>
                  {data.project_name.substring(0, 2).toUpperCase()}
                </div>
                <div className="text-sm text-gray-500">
                  <div className="font-medium text-gray-900">Project Report</div>
                  <div>{generatedAt}</div>
                </div>
              </div>
            </div>
            
            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight" style={{ color: accentColor }}>
                {data.project_name}
              </h1>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span><strong>Owner:</strong> {data.project_owner}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{generatedAt}</span>
                </div>
              </div>
            </div>

            {/* Description cards */}
            {(data.project_description || data.project_full_description) && (
              <div className="grid grid-cols-1 gap-4 mt-6">
                {data.project_description && (
                  <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2" style={{ color: accentColor }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Overview
                    </h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{data.project_description}</p>
                  </div>
                )}
                {data.project_full_description && (
                  <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2" style={{ color: accentColor }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Details
                    </h4>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{data.project_full_description}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content area */}
        <div className="px-12 py-8">
          <div className="max-w-5xl mx-auto space-y-10">
            {sectionBlocks.map((block, idx) => (
              <React.Fragment key={idx}>
                {block}
                {idx < sectionBlocks.length - 1 && <div className="my-8 border-t border-gray-200" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Professional Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-12 py-6 mb-10 mt-12">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: accentColor }}>
                  FS
                </div>
                <span className="font-medium">Generated by FromScratch</span>
              </div>
              <div className="flex items-center gap-6">
                <span>{generatedAt}</span>
                <span>Project ID: {data.project_id.substring(0, 8)}</span>
                {data.run_id && <span>Run: {data.run_id.substring(0, 8)}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ReportPreview.displayName = 'ReportPreview';

export default ReportPreview;
