import { ApiError, requestJson } from './client'

export type UserRole = 'Candidate' | 'Employer'

export type CurrentUser = {
  id: string
  email: string
  role: UserRole
}

export function register(email: string, password: string, role: UserRole) {
  return requestJson<CurrentUser>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, role }),
  })
}

export function login(email: string, password: string) {
  return requestJson<CurrentUser>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function logout() {
  return requestJson<void>('/api/auth/logout', { method: 'POST' })
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    return await requestJson<CurrentUser>('/api/users/me', { cache: 'no-store' })
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null
    throw error
  }
}
