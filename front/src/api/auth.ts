import type { ChangePasswordDto } from '@app/types'
import { api } from './index'

export interface AuthResponse {
  token: string
}

export async function login(data: any) {
  const result = await api.post<AuthResponse>('/auth/login', data)
  return result as unknown as AuthResponse
}

export async function register(data: any) {
  const result = await api.post<AuthResponse>('/auth/register', data)
  return result as unknown as AuthResponse
}

export async function changePassword(data: ChangePasswordDto) {
  const result = await api.post('/users/change-password', data)
  return result
}

export async function getProfile() {
  const result = await api.get('/users/me')
  return result
}
