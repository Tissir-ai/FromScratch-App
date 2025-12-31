"use client";
import { create } from "zustand";
import type { StateCreator } from "zustand";
import { TaskItem, Status, Priority, TaskFilters } from "@/types/task.type";
import { sampleTasks, mockUsers } from "@/components/project/taskManagement/mokedata";

interface TaskState {
  tasks: TaskItem[];
  filters: TaskFilters;
  setFilters: (patch: Partial<TaskFilters>) => void;
  addTask: (payload: Partial<Omit<TaskItem, "id" | "createdAt" | "updatedAt">>) => TaskItem;
  updateTask: (id: string, patch: Partial<TaskItem>) => TaskItem | null;
  moveTask: (id: string, status: Status) => TaskItem | null;
  deleteTask: (id: string) => boolean;
  reset: () => void;
  getFiltered: () => TaskItem[];
}

const uid = () => Math.random().toString(36).slice(2, 9);
const nowIso = () => new Date().toISOString();
const sanitizeTask = (task: TaskItem): TaskItem => ({
  ...task,
  assignee: task.assignee ?? mockUsers[0],
  tags: task.tags ?? [],
});

const createTaskState: StateCreator<TaskState> = (set, get) => ({
  tasks: sampleTasks.map(sanitizeTask),
  filters: { query: "", status: "all", priority: "all", assigneeId: undefined, tags: [] },
  setFilters: (patch) => set((state) => ({ filters: { ...state.filters, ...patch } })),
  addTask: (payload) => {
    const assignee = payload.assignee ?? mockUsers[0];
    const base: TaskItem = {
      id: uid(),
      title: payload.title?.trim() || "New Task",
      description: payload.description ?? "",
      status: payload.status ?? "backlog",
      priority: payload.priority ?? "medium",
      assignee,
      tags: payload.tags ?? [],
      points: payload.points ?? 1,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    set((state) => ({ tasks: [base, ...state.tasks] }));
    return base;
  },
  updateTask: (id, patch) => {
    let updatedTask: TaskItem | null = null;
    set((state) => {
      const tasks = state.tasks.map((t) => {
        if (t.id !== id) return t;
        updatedTask = sanitizeTask({ ...t, ...patch, updatedAt: nowIso() });
        return updatedTask;
      });
      return { tasks };
    });
    return updatedTask;
  },
  moveTask: (id, status) => get().updateTask(id, { status }),
  deleteTask: (id) => {
    let removed = false;
    set((state) => {
      const next = state.tasks.filter((t) => {
        const keep = t.id !== id;
        if (!keep) removed = true;
        return keep;
      });
      return { tasks: next };
    });
    return removed;
  },
  reset: () => set({ tasks: sampleTasks.map(sanitizeTask), filters: { ...get().filters, query: "" } }),
  getFiltered: () => {
    const { tasks, filters } = get();
    const q = filters.query.trim().toLowerCase();
    return tasks.filter((t) => {
      const matchesQuery = !q
        || t.title.toLowerCase().includes(q)
        || (t.description ?? "").toLowerCase().includes(q)
        || (t.tags ?? []).some((tag) => tag.toLowerCase().includes(q));
      const matchesStatus = filters.status === "all" || t.status === filters.status;
      const matchesPriority = filters.priority === "all" || t.priority === filters.priority;
      const matchesAssignee = !filters.assigneeId || t.assignee?.id === filters.assigneeId;
      const matchesTags = !filters.tags?.length
        || (t.tags ?? []).some((tag) => filters.tags?.includes(tag));
      return matchesQuery && matchesStatus && matchesPriority && matchesAssignee && matchesTags;
    });
  },
});

export const useTaskStore = create<TaskState>(createTaskState);

export default { useTaskStore };
