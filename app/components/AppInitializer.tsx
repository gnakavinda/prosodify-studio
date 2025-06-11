'use client'

import { useEffect, useState } from 'react'
import { Loader2, Volume2 } from 'lucide-react'
import { voiceCacheService } from '../services/voiceCache'

interface AppInitializerProps {
  children: React.ReactNode
}

const AppInitializer = ({ children }: AppInitializerProps) => {
  const [isInitializing, setIsInitializing] = useState(true)
  const [initError, setInitError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let progressInterval: NodeJS.Timeout

    const initialize = async () => {
      try {
        // Start progress animation
        progressInterval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 90) return prev
            return prev + Math.random() * 15
          })
        }, 100)

        // Initialize voice cache
        await voiceCacheService.loadData()

        // Complete progress
        setProgress(100)
        
        // Small delay for smooth transition
        setTimeout(() => {
          setIsInitializing(false)
        }, 300)

      } catch (error) {
        console.error('App initialization failed:', error)
        setInitError(error instanceof Error ? error.message : 'Failed to initialize app')
        setProgress(100)
        
        // Allow app to continue even with cache error
        setTimeout(() => {
          setIsInitializing(false)
        }, 1000)
      } finally {
        if (progressInterval) {
          clearInterval(progressInterval)
        }
      }
    }

    initialize()

    return () => {
      if (progressInterval) {
        clearInterval(progressInterval)
      }
    }
  }, [])

  // Show loading screen while initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          {/* App Logo */}
          <div className="mb-8">
            <div className="w-16 h-16 bg-black dark:bg-white rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Volume2 className="w-8 h-8 text-white dark:text-black" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Prosodify Studio
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Premium Text-to-Speech Platform
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-80 mx-auto mb-6">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Loading States */}
          <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">
              {progress < 30 && 'Starting up...'}
              {progress >= 30 && progress < 60 && 'Loading voice library...'}
              {progress >= 60 && progress < 90 && 'Preparing interface...'}
              {progress >= 90 && !initError && 'Ready!'}
              {initError && 'Starting with limited features...'}
            </span>
          </div>

          {/* Error Message */}
          {initError && (
            <div className="mt-4 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg inline-block">
              Cache loading failed - continuing without cache
            </div>
          )}

          {/* Version Info */}
          <div className="mt-8 text-xs text-gray-400">
            Version 1.0.0
          </div>
        </div>
      </div>
    )
  }

  // Render main app
  return <>{children}</>
}

export default AppInitializer