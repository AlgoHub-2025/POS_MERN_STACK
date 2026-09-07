import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios'
import toast from 'react-hot-toast'

// API configuration
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api'
let accessToken: string | null = null
let refreshToken: string | null = null

export const setAuthTokens = (tokens: { accessToken: string; refreshToken: string } | null) => {
  accessToken = tokens?.accessToken || null
  refreshToken = tokens?.refreshToken || null
}

// Create axios instance
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

interface ErrorResponse {
  message?: string
  errors?: Array<{ message: string }>
  [key: string]: any
}

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
          if (refreshToken) {
            // Attempt to refresh the token
            const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
              refreshToken,
            })

            const { tokens: newTokens } = response.data
            setAuthTokens(newTokens)

            // Retry the original request with the new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`
            }
            
            return api(originalRequest)
          }
      } catch (refreshError) {
        // Refresh failed, logout user
        setAuthTokens(null)
        localStorage.removeItem('persist:root')
        localStorage.removeItem('isAuthenticated')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    // Handle other HTTP errors
    if (error.response) {
      const { status, data } = error.response
      const errorData = data as ErrorResponse
      
      switch (status) {
        case 400:
          toast.error(errorData?.message || 'Bad request')
          break
        case 403:
          toast.error('Access denied')
          break
        case 404:
          toast.error('Resource not found')
          break
        case 422:
          // Validation errors - handle differently
          if (errorData?.errors && Array.isArray(errorData.errors)) {
            errorData.errors.forEach((err) => {
              toast.error(err.message || 'Validation error')
            })
          } else {
            toast.error(errorData?.message || 'Validation failed')
          }
          break
        case 429:
          toast.error('Too many requests. Please try again later.')
          break
        case 500:
          toast.error('Internal server error')
          break
        case 502:
          toast.error('Service temporarily unavailable')
          break
        case 503:
          toast.error('Service unavailable')
          break
        default:
          toast.error(errorData?.message || 'An error occurred')
      }
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.')
    } else {
      // Other error
      toast.error('An unexpected error occurred')
    }

    return Promise.reject(error)
  }
)

// Utility functions for common API patterns
export const createApiService = <T>(baseEndpoint: string) => {
  return {
    getAll: (params?: any) => api.get<T[]>(baseEndpoint, { params }),
    getById: (id: string) => api.get<T>(`${baseEndpoint}/${id}`),
    create: (data: Partial<T>) => api.post<T>(baseEndpoint, data),
    update: (id: string, data: Partial<T>) => api.put<T>(`${baseEndpoint}/${id}`, data),
    delete: (id: string) => api.delete(`${baseEndpoint}/${id}`),
    patch: (id: string, data: Partial<T>) => api.patch<T>(`${baseEndpoint}/${id}`, data),
  }
}

// File upload utility
export const uploadFile = async (file: File, onProgress?: (progress: number) => void): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post<{ url: string }>('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(progress)
      }
    },
  })

  return response.data.url
}

// Export default api instance
export default api
