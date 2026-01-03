import { mainApi } from './main-api';
import type { Log } from '@/types/log.type';

// Fetch all logs for a project (requires manage_project permission)
export async function fetchLogs(projectId: string, _user?: unknown): Promise<Log[]> {
  if (!projectId) {
    throw new Error('Project ID is required to fetch logs');
  }
  return mainApi.get<Log[]>(`/v1/logs/${projectId}`);
}

// Fetch logs for the current user in a project
export async function fetchMyLogs(projectId: string): Promise<any[]> {
  if (!projectId) {
    throw new Error('Project ID is required to fetch logs');
  }
  return mainApi.get<any[]>(`/v1/logs/${projectId}/my-logs`);
}

