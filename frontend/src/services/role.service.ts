import { mainApi } from './main-api';

/**
 * Available permissions in the system
 */
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

export interface CreateRolePayload {
  name: string;
  permissions: Permission[];
  project_id: string;
}

export interface UpdateRolePayload {
  name?: string;
  permissions?: Permission[];
}

/**
 * Fetch all roles for a project (excludes Owner and Guest)
 * GET /v1/roles/{project_id}
 */
export async function fetchRoles(projectId: string): Promise<RoleWithUsers[]> {
  try {
    return await mainApi.get<RoleWithUsers[]>(`/v1/roles/${projectId}`);
  } catch (error) {
    console.error('[RoleService] Failed to fetch roles:', error);
    throw error;
  }
}

/**
 * Create a new role for a project
 * POST /v1/roles/{project_id}
 */
export async function createRole(
  projectId: string,
  name: string,
  permissions: Permission[]
): Promise<Role> {
  try {
    const payload: CreateRolePayload = {
      name,
      permissions,
      project_id: projectId,
    };
    return await mainApi.post<Role>(`/v1/roles/${projectId}`, payload);
  } catch (error) {
    console.error('[RoleService] Failed to create role:', error);
    throw error;
  }
}

/**
 * Update an existing role
 * PUT /v1/roles/{role_id}
 */
export async function updateRole(
  projectId: string,
  roleId: string,
  updates: UpdateRolePayload
): Promise<Role> {
  try {
    return await mainApi.put<Role>(`/v1/roles/${projectId}/${roleId}`, updates);
  } catch (error) {
    console.error('[RoleService] Failed to update role:', error);
    throw error;
  }
}

/**
 * Delete a role
 * DELETE /v1/roles/{role_id}
 */
export async function deleteRole(projectId: string, roleId: string): Promise<{ message: string }> {
  try {
    return await mainApi.delete<{ message: string }>(`/v1/roles/${projectId}/${roleId}`);
  } catch (error) {
    console.error('[RoleService] Failed to delete role:', error);
    throw error;
  }
}
