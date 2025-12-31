'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { fetchProjectOwner } from '@/services/project.service';
import { getSubscriptionPlanByUserId } from '@/services/auth.service';
import type { SubscriptionPlan } from '@/types/plan.type';

interface ProjectContextValue {
  ownerPlan: SubscriptionPlan | null;
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

export function ProjectProvider({ projectId, children }: { projectId: string; children: ReactNode }) {
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [ownerPlan, setOwnerPlan] = useState<SubscriptionPlan | null>(null);
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
    } catch (err: any) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value: ProjectContextValue = {
    ownerPlan,
  }; 

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProject(): SubscriptionPlan | null {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    // Gracefully return null if hook is used outside of a provider to avoid runtime errors
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('useProject was called outside of a ProjectProvider; returning null');
    }
    return null;
  }
  return ctx.ownerPlan;
}
