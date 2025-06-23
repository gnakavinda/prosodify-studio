'use client'

import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isInitializing } = useAuth() // Use isInitializing instead of isLoading
  const router = useRouter()

  // Redirect to login if not authenticated (after initialization)
  useEffect(() => {
    if (!isInitializing && !user) {
      router.replace('/login')
    }
  }, [user, isInitializing, router])

  // Only show loading during initial app startup, not during auth operations
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // If no user after initialization, don't render anything (redirect will happen)
  if (!user) {
    return null
  }

  // If authenticated, show the protected content immediately
  return <>{children}</>
}