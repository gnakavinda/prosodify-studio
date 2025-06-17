'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  name: string
  subscriptionStatus: 'free' | 'pro' | 'premium'
  monthlyUsage: number
  usageResetDate: string
}

interface Usage {
  current: number
  limit: number
  remaining: number
}

interface AuthContextType {
  user: User | null
  usage: Usage | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
  refreshUserData: () => Promise<void>
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://prosodify-api-v2.azurewebsites.net'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [usage, setUsage] = useState<Usage | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isAuthenticated = !!user && !!token

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

  const verifyToken = async (authToken: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        await getDashboardData(authToken)
      } else {
        localStorage.removeItem('auth_token')
        setToken(null)
      }
    } catch (error) {
      console.error('Token verification failed:', error)
      localStorage.removeItem('auth_token')
      setToken(null)
    } finally {
      setIsLoading(false)
    }
  }

  const getDashboardData = async (authToken: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/user/dashboard`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setUsage(data.usage)
      }
    } catch (error) {
      console.error('Dashboard data fetch failed:', error)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

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
    } catch (err) {
      setError('Network error. Please try again.')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

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
    } catch (err) {
      setError('Network error. Please try again.')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setUsage(null)
    setToken(null)
    setError(null)
    localStorage.removeItem('auth_token')
  }

  const refreshUserData = async () => {
    if (token) {
      await getDashboardData(token)
    }
  }

  const value: AuthContextType = {
    user,
    usage,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUserData,
    error,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}