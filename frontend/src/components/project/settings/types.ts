// Types for Settings (Teams, Members, and Roles)

export const AVAILABLE_PAGES = [
  "dashboard",
  "diagrams",
  "user-stories",
  "requirements",
  "tasks",
  "reports",
  "settings",
] as const;

export type AvailablePage = (typeof AVAILABLE_PAGES)[number];

// Legacy frontend role labels (for backwards compatibility)
export const ROLES = ["Admin", "Member", "Viewer"] as const;
export type RoleLabel = (typeof ROLES)[number];

// Available permissions matching backend
export const AVAILABLE_PERMISSIONS = [
  // Project
  "manage_project",
  "view_dashboard",
  "view_overview",
  // Diagrams
  "view_diagrams",
  "create_diagrams",
  "edit_diagrams",
  "delete_diagrams",
  // Tasks
  "view_tasks",
  "create_tasks",
  "edit_tasks",
  "delete_tasks",
  // Requirements
  "view_requirements",
  "create_requirements",
  "edit_requirements",
  "delete_requirements",
  // Reports
  "view_reports",
  "download_reports",
  // Logs
  "view_logs",
  "create_logs",
  "edit_logs",
  "delete_logs",
] as const;

export type Permission = (typeof AVAILABLE_PERMISSIONS)[number];

// Backend-aligned Role interface
export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
  project_id: string;
}

export interface RoleUser {
  id: string;
  name: string;
  info_id: string;
}

export interface RoleWithUsers extends Role {
  users: RoleUser[];
}

export interface Team {
  id: string;
  name: string;
  pageAccess: string[];
  memberIds: string[];
}

export interface Member {
  id: string;
  name: string;
  email?: string;
  info_id?: string;
  role: string;
  role_id?: string;
  teamId?: string;
  team?: string;
  // Legacy permissions for backwards compatibility with mock data
  permissions?: {
    read: string[];
    write: string[];
  };
}

export interface NewMemberInput {
  name: string;
  email: string;
  role: RoleLabel;
  teamId?: string;
}
