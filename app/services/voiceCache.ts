// Voice cache service for managing voice data
export interface Voice {
  id: string
  name: string
  language?: string
  gender?: string
  locale?: string
  styles?: string[]
  shortName?: string
  displayName?: string
  // Allow for different field name variations from API
  Language?: string
  Gender?: string
  Locale?: string
  lang?: string
  Lang?: string
  sex?: string
  Sex?: string
  [key: string]: unknown // Allow additional properties from API
}

export interface CacheData {
  voices: Voice[]
  timestamp: number
  version: string
}

export interface StylesData {
  [voiceId: string]: string[]
}

class VoiceCacheService {
  private static instance: VoiceCacheService
  private voices: Voice[] = []
  private styles: StylesData = {}
  private isLoading = false
  private isLoaded = false
  private loadPromise: Promise<void> | null = null
  private listeners: Set<() => void> = new Set()

  // Cache configuration
  private readonly CACHE_KEY = 'prosodify_voices_cache'
  private readonly STYLES_CACHE_KEY = 'prosodify_styles_cache'
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours
  private readonly CURRENT_VERSION = '1.1'

  private constructor() {}

  public static getInstance(): VoiceCacheService {
    if (!VoiceCacheService.instance) {
      VoiceCacheService.instance = new VoiceCacheService()
    }
    return VoiceCacheService.instance
  }

  // Add listener for cache updates
  public addListener(callback: () => void): void {
    this.listeners.add(callback)
  }

  // Remove listener
  public removeListener(callback: () => void): void {
    this.listeners.delete(callback)
  }

  // Notify all listeners
  private notifyListeners(): void {
    this.listeners.forEach(callback => callback())
  }

  // Check if data is loaded
  public get isDataLoaded(): boolean {
    return this.isLoaded
  }

  // Check if currently loading
  public get isCurrentlyLoading(): boolean {
    return this.isLoading
  }

  // Get cached voices
  public getVoices(): Voice[] {
    return this.voices
  }

  // Get styles for a specific voice
  public getVoiceStyles(voiceId: string): string[] {
    return this.styles[voiceId] || ['default']
  }

  // Get all cached styles
  public getAllStyles(): StylesData {
    return this.styles
  }

  // Load data (with deduplication for concurrent calls)
  public async loadData(force = false): Promise<void> {
    // If already loaded and not forcing, return immediately
    if (this.isLoaded && !force) {
      return Promise.resolve()
    }

    // If currently loading, return the existing promise
    if (this.isLoading && this.loadPromise) {
      return this.loadPromise
    }

    // Create new load promise
    this.loadPromise = this.performLoad(force)
    return this.loadPromise
  }

  // Perform the actual loading
  private async performLoad(force: boolean): Promise<void> {
    this.isLoading = true
    this.notifyListeners()

    try {
      // Try cache first if not forcing
      if (!force) {
        const cachedData = this.getCachedData()
        if (cachedData) {
          console.log('🎵 Loading voices from cache')
          this.voices = cachedData.voices
          this.loadStylesFromCache()
          this.isLoaded = true
          this.notifyListeners()
          return
        }
      }

      // Fetch from API
      console.log('🌐 Fetching voices from API')
      await this.fetchFromAPI()
      this.isLoaded = true

    } catch (error) {
      console.error('❌ Failed to load voice data:', error)
      // Try to use stale cache as fallback
      const staleCache = this.getCachedData(true)
      if (staleCache) {
        console.log('📦 Using stale cache as fallback')
        this.voices = staleCache.voices
        this.loadStylesFromCache()
        this.isLoaded = true
      }
    } finally {
      this.isLoading = false
      this.loadPromise = null
      this.notifyListeners()
    }
  }

  // Fetch data from API
  private async fetchFromAPI(): Promise<void> {
    const [voicesResponse, stylesResponse] = await Promise.all([
      fetch('/api/voices'),
      fetch('/api/voice-styles')
    ])

    if (!voicesResponse.ok) {
      throw new Error(`Voices API error: ${voicesResponse.status}`)
    }

    const voicesData = await voicesResponse.json()
    this.voices = voicesData.voices || []

    // Handle styles (may not be available on all setups)
    if (stylesResponse.ok) {
      const stylesData = await stylesResponse.json()
      this.styles = stylesData.styles || {}
    } else {
      // Generate default styles for all voices
      this.styles = this.generateDefaultStyles()
    }

    // Cache the data
    this.setCachedData()
    this.setCachedStyles()
  }

  // Generate default styles if API doesn't provide them
  private generateDefaultStyles(): StylesData {
    const defaultStyles: StylesData = {}
    this.voices.forEach(voice => {
      defaultStyles[voice.id] = voice.styles || ['default']
    })
    return defaultStyles
  }

  // Check if cached data is valid
  private isCacheValid(cacheData: CacheData, allowStale = false): boolean {
    const now = Date.now()
    const isExpired = (now - cacheData.timestamp) > this.CACHE_DURATION
    const isVersionMismatch = cacheData.version !== this.CURRENT_VERSION
    const hasData = Array.isArray(cacheData.voices) && cacheData.voices.length > 0

    if (allowStale) {
      return !isVersionMismatch && hasData
    }

    return !isExpired && !isVersionMismatch && hasData
  }

  // Check if we're in a browser environment
  private get isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
  }

  // Get cached data from localStorage
  private getCachedData(allowStale = false): CacheData | null {
    if (!this.isBrowser) return null
    
    try {
      const cached = localStorage.getItem(this.CACHE_KEY)
      if (!cached) return null

      const cacheData: CacheData = JSON.parse(cached)
      return this.isCacheValid(cacheData, allowStale) ? cacheData : null
    } catch (error) {
      console.warn('⚠️ Failed to parse cached voice data:', error)
      if (this.isBrowser) {
        localStorage.removeItem(this.CACHE_KEY)
      }
      return null
    }
  }

  // Set cached data to localStorage
  private setCachedData(): void {
    if (!this.isBrowser) return
    
    try {
      const cacheData: CacheData = {
        voices: this.voices,
        timestamp: Date.now(),
        version: this.CURRENT_VERSION
      }
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData))
      console.log('💾 Voices cached successfully')
    } catch (error) {
      console.warn('⚠️ Failed to cache voice data:', error)
    }
  }

  // Load styles from cache
  private loadStylesFromCache(): void {
    if (!this.isBrowser) {
      this.styles = this.generateDefaultStyles()
      return
    }
    
    try {
      const cached = localStorage.getItem(this.STYLES_CACHE_KEY)
      if (cached) {
        this.styles = JSON.parse(cached)
      } else {
        this.styles = this.generateDefaultStyles()
      }
    } catch (error) {
      console.warn('⚠️ Failed to load cached styles:', error)
      this.styles = this.generateDefaultStyles()
    }
  }

  // Set cached styles to localStorage
  private setCachedStyles(): void {
    if (!this.isBrowser) return
    
    try {
      localStorage.setItem(this.STYLES_CACHE_KEY, JSON.stringify(this.styles))
      console.log('💾 Styles cached successfully')
    } catch (error) {
      console.warn('⚠️ Failed to cache styles:', error)
    }
  }

  // Clear all cache
  public clearCache(): void {
    if (!this.isBrowser) return
    
    localStorage.removeItem(this.CACHE_KEY)
    localStorage.removeItem(this.STYLES_CACHE_KEY)
    this.voices = []
    this.styles = {}
    this.isLoaded = false
    this.notifyListeners()
    console.log('🗑️ Voice cache cleared')
  }

  // Get cache info for debugging
  public getCacheInfo() {
    if (!this.isBrowser) return null
    
    const cached = this.getCachedData(true)
    if (!cached) return null

    return {
      voiceCount: cached.voices.length,
      cachedAt: new Date(cached.timestamp),
      age: Date.now() - cached.timestamp,
      version: cached.version,
      expiresIn: this.CACHE_DURATION - (Date.now() - cached.timestamp),
      isExpired: (Date.now() - cached.timestamp) > this.CACHE_DURATION
    }
  }

  // Preload data when service is created (only in browser)
  public async initialize(): Promise<void> {
    if (!this.isBrowser) {
      console.log('📱 Skipping cache initialization on server')
      return Promise.resolve()
    }
    return this.loadData()
  }
}

// Export singleton instance
export const voiceCacheService = VoiceCacheService.getInstance()

// Don't auto-initialize on import to avoid SSR issues
// Initialize will be called by AppInitializer component