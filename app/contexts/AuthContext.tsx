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
  isInitializing: boolean // Separate loading state for app initialization
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
  const [isLoading, setIsLoading] = useState(false) // Only for auth operations
  const [isInitializing, setIsInitializing] = useState(true) // For app startup

  // API Base URL
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://prosodify-api-v2.azurewebsites.net'

  // Enhanced token verification with retry logic
  const verifyToken = async (authToken: string, retryCount = 0): Promise<boolean> => {
    console.log('🔍 Attempting to verify token...', { retryCount })
    
    try {
      // Try to verify token with the /me endpoint
      const response = await fetch(`${API_BASE}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Token verified successfully')
        setUser(data.user)
        
        // Store user data
        localStorage.setItem('user_data', JSON.stringify(data.user))
        
        // Get dashboard data in background (don't wait for it)
        getDashboardData(authToken).catch(console.warn)
        
        return true
      } else if (response.status === 401) {
        console.log('❌ Token expired or invalid')
        // Token is invalid, clear it
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
        setToken(null)
        setUser(null)
        return false
      } else {
        throw new Error(`Verification failed with status ${response.status}`)
      }
    } catch (error) {
      console.error('❌ Error during token verification:', error)
      
      // Retry logic for network errors
      if (retryCount < 2 && error instanceof Error && 
          (error.message.includes('fetch') || error.message.includes('network'))) {
        console.log('🔄 Retrying token verification...')
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)))
        return verifyToken(authToken, retryCount + 1)
      }
      
      // Fallback: try to restore from localStorage if network fails
      const storedUserData = localStorage.getItem('user_data')
      if (storedUserData && retryCount >= 2) {
        try {
          const userData = JSON.parse(storedUserData)
          console.log('⚠️ Using cached user data due to network error')
          setUser(userData)
          setUsage({
            current: 0,
            limit: 10000,
            remaining: 10000
          })
          return true
        } catch {
          console.log('❌ Cached user data is invalid')
        }
      }
      
      // Complete failure
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      setToken(null)
      setUser(null)
      return false
    }
  }

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔄 Initializing auth state...')
      const storedToken = localStorage.getItem('auth_token')
      
      if (storedToken) {
        console.log('📱 Found stored token, verifying...')
        setToken(storedToken)
        await verifyToken(storedToken)
      } else {
        console.log('📱 No stored token found')
      }
      
      setIsInitializing(false)
    }

    initializeAuth()
  }, [])

  // Get dashboard data with retry logic
  const getDashboardData = async (authToken: string, retryCount = 0) => {
    try {
      console.log('📊 Attempting to get dashboard data...', { retryCount })
      const response = await fetch(`${API_BASE}/api/user/dashboard`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Dashboard data received')
        setUsage(data.usage)
      } else if (response.status === 404) {
        console.log('⚠️ Dashboard endpoint not available (404), using defaults')
        setUsage({
          current: 0,
          limit: 10000,
          remaining: 10000
        })
      } else {
        throw new Error(`Dashboard request failed with status ${response.status}`)
      }
    } catch (error) {
      console.warn('⚠️ Failed to fetch dashboard data:', error)
      
      // Retry logic for network errors
      if (retryCount < 1 && error instanceof Error && 
          (error.message.includes('fetch') || error.message.includes('network'))) {
        console.log('🔄 Retrying dashboard request...')
        await new Promise(resolve => setTimeout(resolve, 1000))
        return getDashboardData(authToken, retryCount + 1)
      }
      
      // Set default usage on final failure
      setUsage({
        current: 0,
        limit: 10000,
        remaining: 10000
      })
    }
  }

  // Enhanced login function with retry logic
  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('🔄 Starting login process...', { email })
    setError(null)
    setIsLoading(true)

    let retryCount = 0
    const maxRetries = 2

    while (retryCount <= maxRetries) {
      try {
        console.log('📡 Making login request...', { attempt: retryCount + 1, url: `${API_BASE}/api/auth/login` })
        
        const response = await fetch(`${API_BASE}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        })

        console.log('📥 Response status:', response.status)
        const data = await response.json()

        if (response.ok) {
          console.log('✅ Login successful!')
          setToken(data.token)
          setUser(data.user)
          
          // Store authentication data
          localStorage.setItem('auth_token', data.token)
          localStorage.setItem('user_data', JSON.stringify(data.user))
          
          // Get dashboard data in background (don't block login success)
          getDashboardData(data.token).catch(() => {
            // Set default usage if dashboard fails
            setUsage({
              current: 0,
              limit: 10000,
              remaining: 10000
            })
          })
          
          setIsLoading(false)
          return true
        } else if (response.status === 401) {
          // Authentication failed - don't retry
          console.log('❌ Login failed: Invalid credentials')
          setError(data.message || 'Invalid email or password')
          setIsLoading(false)
          return false
        } else if (response.status >= 500 && retryCount < maxRetries) {
          // Server error - retry
          console.log(`⚠️ Server error (${response.status}), retrying...`)
          retryCount++
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
          continue
        } else {
          // Other errors - don't retry
          console.log('❌ Login failed:', data.message)
          setError(data.message || 'Login failed')
          setIsLoading(false)
          return false
        }
      } catch (err) {
        console.error('❌ Network error during login:', err)
        
        if (retryCount < maxRetries) {
          console.log('🔄 Retrying login due to network error...')
          retryCount++
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
          continue
        } else {
          setError('Network error. Please check your connection and try again.')
          setIsLoading(false)
          return false
        }
      }
    }

    setIsLoading(false)
    return false
  }

  // Enhanced register function
  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    console.log('🔄 Starting registration process...', { email, name })
    setError(null)
    setIsLoading(true)

    let retryCount = 0
    const maxRetries = 2

    while (retryCount <= maxRetries) {
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
          console.log('✅ Registration successful!')
          setToken(data.token)
          setUser(data.user)
          
          // Store authentication data
          localStorage.setItem('auth_token', data.token)
          localStorage.setItem('user_data', JSON.stringify(data.user))
          
          // Get dashboard data in background
          getDashboardData(data.token).catch(() => {
            setUsage({
              current: 0,
              limit: 10000,
              remaining: 10000
            })
          })
          
          setIsLoading(false)
          return true
        } else if (response.status === 409) {
          // User already exists - don't retry
          setError(data.message || 'User already exists')
          setIsLoading(false)
          return false
        } else if (response.status >= 500 && retryCount < maxRetries) {
          // Server error - retry
          retryCount++
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
          continue
        } else {
          setError(data.message || 'Registration failed')
          setIsLoading(false)
          return false
        }
      } catch (err) {
        console.error('❌ Network error during registration:', err)
        
        if (retryCount < maxRetries) {
          retryCount++
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
          continue
        } else {
          setError('Network error. Please check your connection and try again.')
          setIsLoading(false)
          return false
        }
      }
    }

    setIsLoading(false)
    return false
  }

  // Logout function
  const logout = () => {
    console.log('🚪 Logging out user...')
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
    } catch (error) {
      console.warn('Failed to refresh user data:', error)
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
    isInitializing,
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