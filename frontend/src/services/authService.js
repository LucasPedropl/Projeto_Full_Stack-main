import { apiRequest, setStoredToken } from './apiClient.js'

const USER_KEY = 'gastometer_user'

export function getStoredUser() {
  try {
    const raw = sessionStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setStoredUser(user) {
  if (user) {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user))
  } else {
    sessionStorage.removeItem(USER_KEY)
  }
}

export async function registerRequest(name, email, password) {
  const payload = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  })

  setStoredToken(payload.token)
  setStoredUser(payload.user)

  return payload
}

export async function loginRequest(email, password) {
  const payload = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  setStoredToken(payload.token)
  setStoredUser(payload.user)

  return payload
}

export async function fetchMeRequest() {
  const payload = await apiRequest('/auth/me')
  setStoredUser(payload.user)
  return payload.user
}

export async function logoutRequest() {
  try {
    await apiRequest('/auth/logout', { method: 'POST' })
  } catch (error) {
    console.warn('[auth] Falha ao notificar logout no servidor:', error.message)
  } finally {
    setStoredToken(null)
    setStoredUser(null)
  }
}

export async function updateProfileRequest(data) {
  const payload = await apiRequest('/auth/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  })

  setStoredUser(payload.user)
  return payload.user
}
