export type Priority = "low" | "medium" | "high" | "critical";
export type Status = "backlog" | "todo" | "in-progress" | "review" | "done";

export interface UserRef {
  id: string;
  name: string;
  email?: string;
  info_id?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  assignee?: UserRef;
  asign_date?: Date;
  due_date?: Date;
  createdAt: string;
  updatedAt: string;
}

export type TaskFilters = {
  query: string;
  status: Status | "all";
  priority: Priority | "all";
  assigneeId?: string;
};

export interface TaskUserSelector {
  id: string;
  name: string;
  email: string;
  role: string;
  team: string;
  info_id: string;
}

// DTOs for API communication
export interface CreateTaskDTO {
  title: string;
  description?: string;
  assignee_id?: string;
  status?: Status;
  priority?: Priority;
  asign_date?: Date;
  due_date?: Date;
  tags?: string[];
  points?: number;
}

export interface UpdateTaskDTO {
  id: string;
  title?: string;
  description?: string;
  assignee_id?: string;
  status?: Status;
  priority?: Priority;
  due_date?: Date;
  tags?: string[];
  points?: number;
}
