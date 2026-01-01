export type Priority = "low" | "medium" | "high" | "critical";
export type Status = "backlog" | "todo" | "in-progress" | "review" | "done";

export interface UserTaskRef {
  id: string;
  name: string;
}
export interface TaskUserSelector {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  team: string;
}
export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  assignee?: UserTaskRef;
  asign_date : Date;
  due_date  : Date;
  createdAt: string;
  updatedAt: string;
}

export type TaskFilters = {
  query: string;
  status: Status | "all";
  priority: Priority | "all";
  assigneeId?: string;
};
