import axios, { AxiosRequestConfig } from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface RequestOptions extends Omit<AxiosRequestConfig, 'url' | 'data'> {
  json?: any
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { json, ...customConfig } = options

  try {
    const response = await axiosInstance({
      url: endpoint,
      data: json,
      ...customConfig,
    })
    return response.data as T
  } catch (error: any) {
    const apiError = {
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message || 'API Request failed',
      data: error.response?.data || null,
    }
    throw apiError
  }
}

