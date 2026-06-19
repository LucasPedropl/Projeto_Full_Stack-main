import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { getStoredToken, setStoredToken } from '../services/apiClient.js'
import {
  fetchMeRequest,
  getStoredUser,
  loginRequest,
  logoutRequest,
  registerRequest,
  setStoredUser,
  updateProfileRequest,
} from '../services/authService.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function restoreSession() {
      const token = getStoredToken()

      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const profile = await fetchMeRequest()
        setUser(profile)
      } catch (error) {
        console.warn('[auth] Sessão inválida:', error.message)
        setStoredToken(null)
        setStoredUser(null)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    restoreSession()
  }, [])

  const login = useCallback(async (email, password) => {
    const payload = await loginRequest(email, password)
    setUser(payload.user)
    return payload.user
  }, [])

  const register = useCallback(async (name, email, password) => {
    const payload = await registerRequest(name, email, password)
    setUser(payload.user)
    return payload.user
  }, [])

  const logout = useCallback(async () => {
    await logoutRequest()
    setUser(null)
  }, [])

  const updateProfile = useCallback(async (data) => {
    const profile = await updateProfileRequest(data)
    setUser(profile)
    return profile
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}
