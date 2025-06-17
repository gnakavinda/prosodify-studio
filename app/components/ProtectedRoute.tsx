'use client'

import { useAuth } from '../contexts/AuthContext'
import { useState } from 'react'
import AuthModal from './AuthModal'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, show sign-in prompt
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <span className="text-white font-bold text-2xl">P</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Prosodify Studio
            </h1>
            <p className="text-gray-600 mb-8 max-w-md">
              Please sign in to access Prosodify&apos;s text-to-speech features and track your usage.
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Sign In
            </button>
          </div>
        </div>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </div>
    )
  }

  // If authenticated, show the protected content
  return <>{children}</>
}