import { mainApi } from './main-api'
import type { ReportDataResponse } from '@/types/report.type'

/**
 * Fetch all report data for client-side rendering.
 * Returns project info, requirements, diagrams, and plan content.
 */
export async function fetchReportData(projectId: string): Promise<ReportDataResponse> {
  return mainApi.get<ReportDataResponse>(`/v1/projects/${projectId}/reports`)
}
