import { api } from './api'
import { User, LoginRequest, RegisterRequest, AuthTokens } from '@/types'

interface AuthResponse {
  user: User
  tokens: AuthTokens
}

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials)
    return response.data
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', userData)
    return response.data
  }

  async logout(refreshToken: string): Promise<void> {
    await api.post('/auth/logout', { refreshToken })
  }

  async refreshToken(refreshToken: string): Promise<{ tokens: AuthTokens }> {
    const response = await api.post<{ tokens: AuthTokens }>('/auth/refresh', { refreshToken })
    return response.data
  }

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me')
    return response.data
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await api.put<User>('/auth/profile', userData)
    return response.data
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password', { currentPassword, newPassword })
  }

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email })
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post('/auth/reset-password', { token, newPassword })
  }

  async verifyEmail(token: string): Promise<void> {
    await api.post('/auth/verify-email', { token })
  }

  async resendVerificationEmail(): Promise<void> {
    await api.post('/auth/resend-verification')
  }
}

export const authService = new AuthService()
