export type Priority = "low" | "medium" | "high" | "critical";
export type Status = "backlog" | "todo" | "in-progress" | "review" | "done";

export interface UserRef {
  id: string;
  name: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  assignee?: UserRef;
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
  tags?: string[];
};
