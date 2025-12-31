"use client";
import React, { useEffect, useState } from "react";
import PageLayout from "@/components/project/PageLayout";
import { RequirementsHome } from "@/components/project/requirement/RequirementsHome";
import { useRequirementStore } from "@/services/requirement.service";
import { RequirementEditorTab } from "@/components/project/requirement/RequirementEditorTab";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { Folder, Plus } from "lucide-react";
import CreateRequirementModal from "@/components/project/requirement/CreateRequirementModal";
import CategoryItems from '@/components/project/requirement/CategoryItems';

interface RequirementsPageProps {
  params: { projectId: string } | Promise<{ projectId: string }>;
  searchParams?: Record<string, string | string[] | undefined>;
}

export default function RequirementsPage({ params, searchParams }: RequirementsPageProps) {
  const resolved = (typeof (params as any)?.then === "function")
    ? (React as any).use(params as Promise<{ projectId: string }>)
    : (params as { projectId: string });
  const projectId = resolved.projectId;

  const resolvedSearch = (typeof (searchParams as any)?.then === "function")
    ? (React as any).use(searchParams as unknown as Promise<Record<string, string | string[] | undefined>>)
    : (searchParams ?? {} as Record<string, string | string[] | undefined>);

  const category = Array.isArray(resolvedSearch.category) ? resolvedSearch.category[0] : resolvedSearch.category;
  const requirementId = Array.isArray(resolvedSearch.id) ? resolvedSearch.id[0] : resolvedSearch.id;

  const { requirements, setActiveFolder, fetchRequirements } = useRequirementStore();

  // Fetch requirements when component mounts or projectId changes
  useEffect(() => {
    if (projectId) {
      fetchRequirements(projectId);
    }
  }, [projectId, fetchRequirements]);

  // Category page state (when category is set and no requirementId)
  useEffect(() => {
    if (category) setActiveFolder(category as any);
    return () => setActiveFolder(null);
  }, [category, setActiveFolder]);

  // If a requirement is selected, render the editor view
  if (requirementId && category) {
    const req = requirements.find(r => r.id === requirementId);
    return (
      <PageLayout title="Requirement" projectId={projectId}>
        <div className='px-6 py-4'>
          <div className='pb-3'>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={`/projects/${projectId}/requirements`}>Requirement</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={`/projects/${projectId}/requirements?category=${category}`}>{category.replace('-', ' ')}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage title={req?.title}>{req?.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          {req ? (
            <RequirementEditorTab id={requirementId} />
          ) : (
            <div className='text-sm text-muted-foreground'>Requirement not found.</div>
          )}
        </div>
      </PageLayout>
    );
  }

  // If a category is selected (but no requirementId), render category listing inside the single page
  if (category) {
    const categoryItems = requirements.filter(r => r.category === category);
    return (
      <PageLayout title="Requirements" projectId={projectId}>
        <CategoryItems items={categoryItems} projectId={projectId} category={category} />
      </PageLayout>
    );
  }

  // Default: show requirements home
  return (
    <PageLayout title="Requirements" projectId={projectId}>
      <div className="h-[calc(100vh-4rem)] px-6">
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-auto">
            <RequirementsHome projectId={projectId} />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
