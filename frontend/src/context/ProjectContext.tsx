'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { fetchMemberPermissions, fetchProjectOwner } from '@/services/project.service';
import { getSubscriptionPlanByUserId } from '@/services/auth.service';
import type { SubscriptionPlan } from '@/types/plan.type';


interface ProjectContextValue {
  ownerPlan: SubscriptionPlan | null;
  memberPermissions: string[];
  loading: boolean;
  error: string | null;
  hasPermission: (perm: string) => boolean;
  refresh: () => Promise<void> | void;
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

export function ProjectProvider({ projectId, memberId, children }: { projectId: string; memberId: string; children: ReactNode }) {
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [ownerPlan, setOwnerPlan] = useState<SubscriptionPlan | null>(null);
  const [memberPermissions, setMemberPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);


  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    setOwnerId(null);
    setOwnerPlan(null);
    try {
      const res = await fetchProjectOwner(projectId);
      const owner = res?.owner ?? null;
      setOwnerId(owner);
      if (owner) {
        const plan = await getSubscriptionPlanByUserId(owner);
        setOwnerPlan(plan ?? null);
      }
      const permissions = await fetchMemberPermissions(projectId, memberId);
      console.log('Fetched member permissions:', permissions);
      // Ensure permissions is normalized to a flat string[] before setting state
      const normalizedPermissions: string[] = Array.isArray(permissions)
        ? (permissions as any[]).flat().map((p) => String(p))
        : [];
      setMemberPermissions(normalizedPermissions ?? []);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [projectId, memberId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const hasPermission = useCallback((perm: string) => {
    if (!perm) return false;
    return memberPermissions.includes(perm);
  }, [memberPermissions]);

  const value: ProjectContextValue = {
    ownerPlan,
    memberPermissions,
    loading,
    error,
    hasPermission,
    refresh,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProject(): ProjectContextValue | undefined {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    // Gracefully return undefined if hook is used outside of a provider to avoid runtime errors
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('useProject was called outside of a ProjectProvider; returning undefined');
    }
    return undefined;
  }
  return ctx;
}
