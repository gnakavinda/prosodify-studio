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
    console.log('🔍 Attempting to verify token...')
    
    // For now, skip verification and trust the stored token
    // TODO: Implement /api/auth/verify endpoint in backend
    console.log('⚠️ Skipping token verification (endpoint not implemented)')
    
    try {
      // Get real user data from localStorage if available
      const storedUserData = localStorage.getItem('user_data')
      if (storedUserData) {
        try {
          const userData = JSON.parse(storedUserData)
          console.log('✅ Restored user data from storage:', userData.name)
          setUser(userData)
        } catch {
          console.log('❌ Invalid stored user data, creating basic user')
          // Fallback to basic user if stored data is corrupted
          const basicUser = {
            id: 'temp-id',
            email: 'stored-user@example.com',
            name: 'Stored User',
            subscriptionStatus: 'free' as const,
            usageResetDate: new Date().toISOString()
          }
          setUser(basicUser)
        }
      } else {
        // Create a basic user object from token if no stored user data
        try {
          const tokenPayload = JSON.parse(atob(authToken.split('.')[1]))
          const basicUser = {
            id: tokenPayload.userId || 'temp-id',
            email: 'stored-user@example.com',
            name: 'Stored User',
            subscriptionStatus: 'free' as const,
            usageResetDate: new Date().toISOString()
          }
          setUser(basicUser)
        } catch {
          console.log('❌ Invalid token format')
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user_data')
          setToken(null)
          setUser(null)
          return false
        }
      }

      // Set basic usage
      setUsage({
        current: 0,
        limit: 10000,
        remaining: 10000
      })
      
      return true
    } catch (error) {
      console.error('❌ Error during token verification:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize auth state from localStorage
  useEffect(() => {
    console.log('🔄 Initializing auth state...')
    const storedToken = localStorage.getItem('auth_token')
    
    if (storedToken) {
      console.log('📱 Found stored token, verifying...')
      setToken(storedToken)
      verifyToken(storedToken)
    } else {
      console.log('📱 No stored token found')
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Get dashboard data (user info and usage)
  const getDashboardData = async (authToken: string) => {
    try {
      console.log('📊 Attempting to get dashboard data...')
      const response = await fetch(`${API_BASE}/api/dashboard`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Dashboard data received')
        setUsage(data.usage)
      } else {
        console.log('⚠️ Dashboard endpoint not available (404), using defaults')
        // Set default usage when dashboard endpoint is not available
        setUsage({
          current: 0,
          limit: 10000,
          remaining: 10000
        })
      }
    } catch (error) {
      console.warn('⚠️ Failed to fetch dashboard data, using defaults:', error)
      // Set default usage on error
      setUsage({
        current: 0,
        limit: 10000,
        remaining: 10000
      })
    }
  }

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('🔄 Starting login process...', { email })
    setError(null)
    setIsLoading(true)

    try {
      console.log('📡 Making request to:', `${API_BASE}/api/auth/login`)
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      console.log('📥 Response status:', response.status)
      const data = await response.json()
      console.log('📥 Response data:', data)

      if (response.ok) {
        console.log('✅ Login successful, setting user data...')
        setToken(data.token)
        setUser(data.user)
        
        // Store both token AND user data in localStorage for persistence
        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('user_data', JSON.stringify(data.user))
        
        await getDashboardData(data.token)
        console.log('✅ Login complete!')
        return true
      } else {
        console.log('❌ Login failed:', data.message)
        setError(data.message || 'Login failed')
        return false
      }
    } catch (err) {
      console.error('❌ Network error during login:', err)
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
        
        // Store both token AND user data in localStorage for persistence
        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('user_data', JSON.stringify(data.user))
        
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
    localStorage.removeItem('user_data')
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