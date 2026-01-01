import { UserRef } from '@/types/task.type';
import { mainApi } from './main-api';

/**
 * Get user by ID from auth service
 * GET /api/auth/user/{id}
 */
export const getUserById = async (userId: string): Promise<UserRef> => {
  try {
    const user = await mainApi.get<any>(`/auth/user/${userId}`);
    return {
      id: user.id || user._id,
      name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      email: user.email
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
    console.log('[UserService] searchUsers called with query:', query, 'projectId:', projectId);
    if (!projectId) {
      console.warn('[UserService] No projectId provided for user search');
      return [];
    }

    const url = `/v1/projects/${projectId}/users/search?q=${encodeURIComponent(query)}`;
    console.log('[UserService] Making request to:', url);

    const response = await mainApi.get<any[]>(url);
    console.log('[UserService] Raw response:', response);

    const mapped = response.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email || undefined,
    }));

    console.log('[UserService] Mapped results:', mapped);
    return mapped;
  } catch (error) {
    console.error('[UserService] Failed to search users:', error);
    throw error;
  }
};

