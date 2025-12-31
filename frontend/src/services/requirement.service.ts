"use client";
import { create } from 'zustand';
import type { StateCreator } from 'zustand';
import { Requirement, RequirementCategory } from '@/types/requirement.type';
import { mainApi } from './main-api';

interface RequirementState {
  requirements: Requirement[];
  activeFolder: RequirementCategory | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchRequirements: (projectId: string) => Promise<void>;
  createRequirement: (projectId: string, req: Omit<Requirement, 'id' | 'created_at' | 'updated_at'>) => Promise<Requirement | null>;
  updateRequirement: (projectId: string, id: string, patch: Partial<Requirement>) => Promise<void>;
  deleteRequirement: (projectId: string, id: string) => Promise<void>;
  setActiveFolder: (folder: RequirementCategory | null) => void;
  clearError: () => void;
}

const createRequirementState: StateCreator<RequirementState> = (set, get) => ({
  requirements: [],
  activeFolder: null,
  loading: false,
  error: null,

  fetchRequirements: async (projectId: string) => {
    set({ loading: true, error: null });
    try {
      const data = await mainApi.get<any>(`/v1/requirements/${projectId}`);
      if(data.length === 0) {
            console.log("No requirements found for project", projectId);
            set({ requirements: [], loading: false });
            return;
      }
      const requirementData: Requirement[] = data.map(({ _id, ...rest }: any) => ({ ...rest, id: _id }));
      console.log("Fetched requirements for project", projectId, ":", requirementData[0].id);
      set({ requirements: requirementData, loading: false });
    } catch (error: any) {
      const errorMsg = error?.message || 'Failed to fetch requirements';
      set({ error: errorMsg, loading: false });
      // rethrow so callers (components) can show toasts and take action
      throw new Error(errorMsg);
    }
  },

  createRequirement: async (projectId: string, req) => {
    set({ loading: true, error: null });
    try {
      const created = await mainApi.post<any>(`/v1/requirements/${projectId}`, req);
      const newRequirement : Requirement = { ...created, id: created._id };
      set((state) => ({ 
        requirements: [newRequirement, ...state.requirements],
        loading: false 
      }));
      return newRequirement;
    } catch (error: any) {
      const errorMsg = error?.message || 'Failed to create requirement';
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },

  updateRequirement: async (projectId: string, id: string, patch) => {
    set({ loading: true, error: null });
    try {
      const state = get();
      const existing = state.requirements.find(r => r.id === id);
      if (!existing) {
        const message = 'Requirement not found';
        set({ error: message, loading: false });
        throw new Error(message);
      }

      // Build a full payload matching backend's RequirementStructure schema
      const payload: any = {
        _id: id,
        title: patch.title ?? existing.title,
        category: patch.category ?? existing.category,
        description: patch.description ?? existing.description ?? null,
        content: patch.content ?? existing.content ?? null,
        created_at: existing.created_at ?? undefined,
        updated_at: new Date().toISOString(),
      };

      const updatedRaw = await mainApi.put<any>(`/v1/requirements/${projectId}/${id}`, payload);
      const updated: Requirement = { ...updatedRaw, id: updatedRaw._id ?? id };

      set((state) => ({
        requirements: state.requirements.map(r => r.id === id ? updated : r),
        loading: false
      }));
    } catch (error: any) {
      const errorMsg = error?.message || 'Failed to update requirement';
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },

  deleteRequirement: async (projectId: string, id: string) => {
    set({ loading: true, error: null });
    try {
      await mainApi.delete(`/v1/requirements/${projectId}/${id}`);
      set((state) => ({
        requirements: state.requirements.filter(r => r.id !== id),
        loading: false
      }));
    } catch (error: any) {
      const errorMsg = error?.message || 'Failed to delete requirement';
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },

  setActiveFolder: (folder) => set({ activeFolder: folder }),
  
  clearError: () => set({ error: null }),
});

export const useRequirementStore = create<RequirementState>(createRequirementState);

export default {
  useRequirementStore
};
