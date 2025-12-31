import { Priority, Status, TaskItem, UserRef, TaskFilters } from "@/types/task.type";

export type { Priority, Status, TaskItem, UserRef, TaskFilters };

export interface Column { id: Status; title: string; }

export const COLUMNS: Column[] = [
  { id: "backlog", title: "Backlog" },
  { id: "todo", title: "To do" },
  { id: "in-progress", title: "In progress" },
  { id: "review", title: "Review" },
  { id: "done", title: "Done" },
];
