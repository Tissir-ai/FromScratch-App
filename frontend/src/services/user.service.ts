import { UserRef } from "@/types/task.type";
import { mainApi } from "./main-api";
import { authApi } from "./auth-api";

/**
 * Get user by ID from auth service
 * GET /api/auth/user/{id}
 */
export const getUserById = async (userId: string): Promise<UserRef> => {
  try {
    const data  = await authApi.get<any>(`/auth/user/${userId}`);
    return {
      id: data.user.id || data.user._id,
      name: `${data.user.first_name || ''} ${data.user.last_name || ''}`.trim(),
      email: data.user.email
    };
  } catch (error) {
    console.error('Failed to get user by ID:', error);
    throw error;
  }
};

/**
 * Search users in the current project
 * GET /api/v1/projects/{projectId}/users/search?q={query}
 */
export const searchUsers = async (query: string, projectId?: string): Promise<UserRef[]> => {
  try {
    if (!projectId) {
      console.warn('[UserService] No projectId provided for user search');
      return [];
    }
    const response = await mainApi.get<any[]>(`/v1/projects/${projectId}/members`);
    console.log('[UserService] Raw response:', response);
    const mapped = response.map(user => ({
      id: user.id,
      name: user.name,
      info_id: user.info_id,
      email: user.email,
      role : user.role,
      team : user.team,
    }));
    console.log('[UserService] Mapped results:', mapped);
    return mapped;
  } catch (error) {
    console.error('[UserService] Failed to search users:', error);
    throw error;
  }
};

export const searchUsersSettings = async (projectId?: string): Promise<UserRef[]> => {
  try {
    if (!projectId) {
      console.warn('[UserService] No projectId provided for user search');
      return [];
    }
    const response = await mainApi.get<any[]>(`/v1/projects/${projectId}/members/settings`);
    const mapped = response.map(user => ({
      id: user.id,
      name: user.name,
      info_id: user.info_id,
      email: user.email,
      role : user.role,
      team : user.team,
    }));
    console.log('[UserService] Mapped results:', mapped);
    return mapped;
  } catch (error) {
    console.error('[UserService] Failed to search users:', error);
    throw error;
  }
};

/**
 * Assign a role to a user in a project
 * POST /api/v1/projects/{projectId}/user/assign
 */
export async function assignUserRole(
  projectId: string,
  userId: string,
  roleId: string
): Promise<any> {
  try {
    return await mainApi.post(`/v1/projects/${projectId}/user/assign`, {
      user_id: userId,
      role_id: roleId,
    });
  } catch (error) {
    console.error('[UserService] Failed to assign user role:', error);
    throw error;
  }
}

/**
 * Remove a user from a project
 * DELETE /api/v1/projects/{projectId}/user/{userId}
 */
export async function removeUserFromProject(
  projectId: string,
  userId: string
): Promise<any> {
  try {
    return await mainApi.delete(`/v1/projects/${projectId}/user/${userId}`);
  } catch (error) {
    console.error('[UserService] Failed to remove user from project:', error);
    throw error;
  }
}

