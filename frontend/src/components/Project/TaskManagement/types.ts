export type Priority = "low" | "medium" | "high" | "critical";
export type Status = "backlog" | "todo" | "in-progress" | "review" | "done";

export interface UserRef {
  id: string;
  name: string;
  email: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  assignee?: UserRef;
  priority: Priority;
  status: Status;
  points?: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Column { id: Status; title: string; }

export const COLUMNS: Column[] = [
  { id: "backlog", title: "Backlog" },
  { id: "todo", title: "To do" },
  { id: "in-progress", title: "In progress" },
  { id: "review", title: "Review" },
  { id: "done", title: "Done" },
];
