'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  email: string
  name: string
  subscriptionStatus: 'free' | 'premium' | 'enterprise'
  usageResetDate: string
}

interface Usage {
  current: number
  limit: number
  remaining: number
}

interface AuthContextType {
  user: User | null
  token: string | null
  usage: Usage | null
  error: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
  refreshUserData: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [usage, setUsage] = useState<Usage | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // API Base URL
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://prosodify-api-v2.azurewebsites.net'

  // Verify token and get user data
  const verifyToken = async (authToken: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setUsage(data.usage)
        return true
      } else {
        // Token is invalid
        localStorage.removeItem('auth_token')
        setToken(null)
        return false
      }
    } catch {
      // Network error
      localStorage.removeItem('auth_token')
      setToken(null)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token')
    if (storedToken) {
      setToken(storedToken)
      verifyToken(storedToken)
    } else {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Get dashboard data (user info and usage)
  const getDashboardData = async (authToken: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/dashboard`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUsage(data.usage)
      }
    } catch {
      // Silently fail - user data will still work
      console.warn('Failed to fetch dashboard data')
    }
  }

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setToken(data.token)
        setUser(data.user)
        localStorage.setItem('auth_token', data.token)
        await getDashboardData(data.token)
        return true
      } else {
        setError(data.message || 'Login failed')
        return false
      }
    } catch {
      setError('Network error. Please try again.')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Register function
  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await response.json()

      if (response.ok) {
        setToken(data.token)
        setUser(data.user)
        localStorage.setItem('auth_token', data.token)
        await getDashboardData(data.token)
        return true
      } else {
        setError(data.message || 'Registration failed')
        return false
      }
    } catch {
      setError('Network error. Please try again.')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    setUser(null)
    setToken(null)
    setUsage(null)
    setError(null)
    localStorage.removeItem('auth_token')
  }

  // Refresh user data
  const refreshUserData = async () => {
    if (!token) return

    try {
      await getDashboardData(token)
    } catch {
      console.warn('Failed to refresh user data')
    }
  }

  // Clear error message
  const clearError = () => {
    setError(null)
  }

  const value: AuthContextType = {
    user,
    token,
    usage,
    error,
    isLoading,
    login,
    register,
    logout,
    refreshUserData,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}