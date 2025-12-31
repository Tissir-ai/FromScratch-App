import { TaskItem } from "./task.type";
export interface ProjectMember {
  name: string
  role_name: string
}
export interface Project {
  id: string
  name: string
  description?: string
  full_description?: string
  members?: ProjectMember[]
  owner: {
    id: string
    name: string
  }
  created_at: string
  updated_at: string
}

export interface OverviewData {
  name: string
  description?: string
  tasks: TaskItem[]
  teams: Array<{
    name: string
    users_count: number
  }>
  members:Array<{
    name : string
    role: string
    team: string
  }>
  project_created_at: string
}

export interface CreateProjectPayload {
  name: string
  description?: string
}
