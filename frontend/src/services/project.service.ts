import { mainApi } from './main-api'
import type { CreateProjectPayload, Project , OverviewData, UpdateProjectPayload } from '@/types/project.type'

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

export async function fetchProjects(): Promise<Project[]> {
  // Base URL already includes /api; avoid double /api
  return mainApi.get<Project[]>('/v1/projects')
}

export async function fetchProjectById(id: string): Promise<Project> {
  return mainApi.get<Project>(`/v1/projects/${id}`)
}

export async function updateProject(id: string, payload: UpdateProjectPayload): Promise<Project> {
  return mainApi.put<Project>(`/v1/projects/${id}`, payload)
}

export async function fetchProjectOverview(id: string): Promise<OverviewData> {
  return mainApi.get<OverviewData>(`/v1/projects/${id}/overview`)
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

export async function getRunStatus(runId: string): Promise<RunStatus> {
  return mainApi.get<RunStatus>(`/v1/runs/${runId}`)
}

export async function pollRunStatus(
  runId: string, 
  onUpdate?: (status: RunStatus) => void,
  maxAttempts: number = 120, // 10 minutes with 5s intervals
  interval: number = 5000
): Promise<RunStatus> {
  let attempts = 0
  
  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const status = await getRunStatus(runId)
        
        // Call update callback if provided
        if (onUpdate) {
          onUpdate(status)
        }
        
        // Check if completed or failed
        if (status.status === 'completed') {
          resolve(status)
          return
        }
        
        if (status.status === 'failed') {
          reject(new Error('Project generation failed'))
          return
        }
        
        // Check max attempts
        attempts++
        if (attempts >= maxAttempts) {
          reject(new Error('Project generation timed out'))
          return
        }
        
        // Continue polling
        setTimeout(poll, interval)
      } catch (error) {
        reject(error)
      }
    }
    
    poll()
  })
}

export async function deleteProject(id: string): Promise<void> {
  await mainApi.delete<void>(`/v1/projects/${id}`)
}

export async function fetchProjectOwner(projectId: string): Promise<string> {
  return mainApi.get<string>(`/v1/projects/${projectId}/owner`)
}

export async function inviteUserToProject(projectId: string, infoId :string , email: string): Promise<import('@/types/project.type').InvitationResponse> {
  return mainApi.post<import('@/types/project.type').InvitationResponse>(`/v1/projects/${projectId}/user/invite`, { "info_id": infoId, "email" : email })
}

export async function fetchProjectInvitations(projectId: string): Promise<import('@/types/project.type').ProjectInvitation[]> {
  return mainApi.get<import('@/types/project.type').ProjectInvitation[]>(`/v1/projects/${projectId}/invitations`)
}

export async function cancelInvitation(invitationId: string): Promise<{ message: string; status: string }> {
  return mainApi.delete<{ message: string; status: string }>(`/v1/projects/invitations/${invitationId}`)
}

export async function resendInvitation(invitationId: string): Promise<import('@/types/project.type').InvitationResponse> {
  return mainApi.post<import('@/types/project.type').InvitationResponse>(`/v1/projects/invitations/${invitationId}/resend`)
}

export async function acceptProjectInvitation(token: string): Promise<import('@/types/project.type').AcceptInvitationResponse> {
  return mainApi.post<import('@/types/project.type').AcceptInvitationResponse>('/v1/projects/invitations/accept', { token })
}
