'use client'

import { useEffect, useState } from 'react'
import { voiceCacheService } from '../services/voiceCache'

interface AppInitializerProps {
  children: React.ReactNode
}

const AppInitializer = ({ children }: AppInitializerProps) => {
  const [cacheStatus, setCacheStatus] = useState<'loading' | 'loaded' | 'error'>('loading')

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('🔄 Loading voice cache in background...')
        await voiceCacheService.loadData()
        console.log('✅ Voice cache loaded successfully')
        setCacheStatus('loaded')
      } catch (error) {
        console.warn('⚠️ Voice cache loading failed, app will work without cache:', error)
        setCacheStatus('error')
      }
    }

    // Load cache in background - don't block app rendering
    initialize()
  }, [])

  // Show app immediately - don't wait for cache loading
  // The cache loading happens in the background
  return (
    <>
      {children}
      
      {/* Optional: Show a small notification while cache is loading */}
      {cacheStatus === 'loading' && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm flex items-center space-x-2 z-50">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Loading voice library...</span>
        </div>
      )}
      
      {/* Optional: Show success notification briefly */}
      {cacheStatus === 'loaded' && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50 animate-in slide-in-from-bottom-2 duration-300">
          ✅ Voice library ready
        </div>
      )}
    </>
  )
}

export default AppInitializer