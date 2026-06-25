import { apiClient } from '../../../lib/api-client.js'

export interface Report {
  id: string
  caseId: string
  status: string
  content: string
  createdAt: string
  updatedAt: string
}

export async function getReports(): Promise<Report[]> {
  return apiClient<Report[]>('/api/reports')
}
