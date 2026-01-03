import { mainApi } from './main-api'
import type { ReportSectionsResponse } from '@/types/report.type'

export async function fetchReportSections(projectId: string): Promise<ReportSectionsResponse> {
  return mainApi.get<ReportSectionsResponse>(`/v1/projects/${projectId}/reports`)
}

export async function fetchReportPdf(projectId: string, templateId?: string): Promise<Blob> {
  return mainApi.get<Blob>(`/v1/projects/${projectId}/reports/pdf?template=${encodeURIComponent(templateId || 'default')}`,
    { responseType: 'blob' })
}
