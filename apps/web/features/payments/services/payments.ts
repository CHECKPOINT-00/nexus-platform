import { apiClient } from '../../../lib/api-client.js'

export interface Payment {
  id: string
  amount: number
  status: string
  createdAt: string
  updatedAt: string
}

export async function getPayments(): Promise<Payment[]> {
  return apiClient<Payment[]>('/api/payments')
}
