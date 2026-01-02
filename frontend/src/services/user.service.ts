import { UserRef } from '@/types/task.type';
import { mainApi } from './main-api';
import { authApi } from './auth-api';
import { info } from 'console';

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

