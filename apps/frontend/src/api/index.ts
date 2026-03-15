import { useAuth } from '@clerk/clerk-react'
import axios from 'axios'

export function useApiClient() {
  const { getToken } = useAuth()

  const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
  })

  apiClient.interceptors.request.use(async (config) => {
    const token = await getToken()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  })

  return apiClient
}
