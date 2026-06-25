import { apiClient } from '../../../lib/api-client.js'

export async function approvePayment(paymentId: string): Promise<{ success: boolean }> {
  return apiClient<{ success: boolean }>(`/api/payments/${paymentId}/approve`, {
    method: 'POST',
  })
}
