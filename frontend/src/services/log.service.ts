import { mainApi } from './main-api';
import type { Log } from '@/types/log.type';

// Fetch logs for a project; user argument kept for backwards compatibility with callers.
export async function fetchLogs(projectId: string, _user?: unknown): Promise<Log[]> {
  if (!projectId) {
    throw new Error('Project ID is required to fetch logs');
  }
  return mainApi.get<Log[]>(`/v1/logs/${projectId}`);
}
