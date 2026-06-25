import { apiClient } from '../../../lib/api-client.js'

export interface Case {
  id: string
  title: string
  status: string
  createdAt: string
  updatedAt: string
}

export async function getCases(): Promise<Case[]> {
  return apiClient<Case[]>('/api/cases')
}
