import { useState, useEffect, useCallback } from 'react'
import { voiceCacheService, Voice } from '../services/voiceCache'

export function useVoiceCache() {
  const [voices, setVoices] = useState<Voice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Update state from cache service
  const updateFromCache = useCallback(() => {
    const serviceVoices = voiceCacheService.getVoices()
    const serviceLoading = voiceCacheService.isCurrentlyLoading
    const serviceLoaded = voiceCacheService.isDataLoaded

    console.log('Voice cache state:', {
      voiceCount: serviceVoices.length,
      isLoading: serviceLoading,
      isLoaded: serviceLoaded
    })

    setVoices(serviceVoices)
    setIsLoading(serviceLoading)
    
    // Clear error if we have data
    if (serviceLoaded && serviceVoices.length > 0) {
      setError(null)
    }
  }, [])

  // Set up cache service listener
  useEffect(() => {
    // Initial state sync
    updateFromCache()

    // Listen for cache updates
    voiceCacheService.addListener(updateFromCache)

    // Load data if not already loaded or loading
    if (!voiceCacheService.isDataLoaded && !voiceCacheService.isCurrentlyLoading) {
      console.log('Initiating voice cache load...')
      voiceCacheService.loadData().catch((err) => {
        console.error('Voice cache load failed:', err)
        setError(err instanceof Error ? err.message : 'Failed to load voices')
        setIsLoading(false)
      })
    }

    // Cleanup listener
    return () => {
      voiceCacheService.removeListener(updateFromCache)
    }
  }, [updateFromCache])

  // Force refresh from API
  const refreshVoices = useCallback(async () => {
    setError(null)
    setIsLoading(true)
    try {
      console.log('Force refreshing voices...')
      await voiceCacheService.loadData(true)
    } catch (err) {
      console.error('Voice refresh failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to refresh voices')
      setIsLoading(false)
    }
  }, [])

  // Clear cache
  const clearCache = useCallback(() => {
    voiceCacheService.clearCache()
  }, [])

  // Get voice styles
  const getVoiceStyles = useCallback((voiceId: string) => {
    return voiceCacheService.getVoiceStyles(voiceId)
  }, [])

  // Check if data is cached
  const isCached = voiceCacheService.getCacheInfo() !== null

  return {
    voices,
    isLoading,
    error,
    refreshVoices,
    clearCache,
    getVoiceStyles,
    isCached,
    cacheInfo: voiceCacheService.getCacheInfo()
  }
}