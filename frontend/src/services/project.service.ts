import { mainApi } from './main-api'
import type { CreateProjectPayload, Project, OverviewData } from '@/types/project.type'
import type { AuthUser } from '@/types/user.type'

export interface RunStatus {
  run_id: string
  project_id: string
  status: 'queued' | 'running' | 'completed' | 'failed'
  created_at: string
  updated_at: string
  content?: {
    requirements?: string
    diagrams?: string
    diagrams_json?: any
    plan?: string
    export?: string
  }
}

export interface GenerateResponse {
  project_id: string
  run_id: string
  status: string
  job_id: string
  websocket_url: string
}

export async function fetchProjects(user: AuthUser): Promise<Project[]> {
  // Base URL already includes /api; avoid double /api
  return mainApi.get<Project[]>('/v1/projects', user)
}

export async function fetchProjectOverview(id: string, user: AuthUser): Promise<OverviewData> {
  return mainApi.get<OverviewData>(`/v1/projects/${id}/overview`, user)
}

export async function fetchMemberPermissions(projectId: string, infoId: string): Promise<string[]> {
  return mainApi.get<string[]>(`/v1/projects/${projectId}/user/${infoId}/permissions`)
}

export async function createProject(payload: CreateProjectPayload): Promise<Project> {
  return mainApi.post<Project>('/v1/projects', payload)
}

export interface GenerateFromScratchParams {
  idea: string
  projectId?: string
  webhookUrl?: string
}

export async function generateFromScratchProject({
  idea,
  projectId,
  webhookUrl,
}: GenerateFromScratchParams): Promise<GenerateResponse> {
  // Backend route for AI generation endpoint (auto-creates project when projectId is omitted)
  return mainApi.post<GenerateResponse>('/v1/idea/generate', {
    idea,
    ...(projectId ? { project_id: projectId } : {}),
    ...(webhookUrl ? { webhook_url: webhookUrl } : {}),
  })
}

export async function getRunStatus(runId: string, user: AuthUser): Promise<RunStatus> {
  return mainApi.get<RunStatus>(`/v1/runs/${runId}`, user)
}

export async function pollRunStatus(
  runId: string,
  user: AuthUser,
  onUpdate?: (status: RunStatus) => void,
  maxAttempts: number = 120, // 10 minutes with 5s intervals
  interval: number = 5000
): Promise<RunStatus> {
  let attempts = 0

  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const status = await getRunStatus(runId, user)

        if (onUpdate) {
          onUpdate(status)
        }

        if (status.status === 'completed') {
          resolve(status)
          return
        }

        if (status.status === 'failed') {
          reject(new Error('Project generation failed'))
          return
        }

        attempts++
        if (attempts >= maxAttempts) {
          reject(new Error('Project generation timed out'))
          return
        }

        setTimeout(poll, interval)
      } catch (error) {
        reject(error)
      }
    }

    poll()
  })
}

export async function deleteProject(id: string, user: AuthUser): Promise<void> {
  await mainApi.delete<void>(`/v1/projects/${id}`, user)
}

export async function fetchProjectOwner(projectId: string, user: AuthUser): Promise<{ owner: string }> {
  return mainApi.get<{ owner: string }>(`/v1/projects/${projectId}/owner`, user)
}
