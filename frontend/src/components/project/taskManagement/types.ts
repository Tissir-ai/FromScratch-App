import { Priority, Status, TaskItem, TaskUserSelector, TaskFilters } from "@/types/task.type";

export type { Priority, Status, TaskItem, TaskUserSelector, TaskFilters };

// For backward compatibility with component usage
export type UserRef = TaskUserSelector;

export interface Column { 
  id: Status; 
  title: string; 
}

export const COLUMNS: Column[] = [
  { id: "backlog", title: "Backlog" },
  { id: "todo", title: "To do" },
  { id: "in-progress", title: "In progress" },
  { id: "review", title: "Review" },
  { id: "done", title: "Done" },
];
