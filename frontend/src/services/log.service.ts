import { mainApi } from './main-api';
import type { Log, LogEntry } from '@/types/log.type';
import type { AuthUser } from '@/types/user.type';

export async function fetchLogs(projectId: string, user: AuthUser): Promise<Log[]> {
  return mainApi.get<Log[]>(`/v1/logs/${projectId}`, user);
}

export async function createLog(
  projectId: string,
  payload: { data: LogEntry[] },
  user: AuthUser
): Promise<Log> {
  return mainApi.post<Log>(`/v1/logs/${projectId}`, payload, user);
}

export async function updateLog(
  projectId: string,
  logId: string,
  payload: Partial<Log>,
  user: AuthUser
): Promise<Log> {
  return mainApi.put<Log>(`/v1/logs/${projectId}/${logId}`, payload, user);
}

export async function deleteLog(
  projectId: string,
  logId: string,
  user: AuthUser
): Promise<{ deleted: boolean }> {
  return mainApi.delete<{ deleted: boolean }>(`/v1/logs/${projectId}/${logId}`, user);
}
