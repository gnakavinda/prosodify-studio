import { useState, useEffect, useMemo } from 'react'
import { Search, Loader2, RefreshCw, AlertCircle, Volume2 } from 'lucide-react'
import { useVoiceCache } from '../hooks/useVoiceCache'

interface Voice {
  id: string
  name: string
  language: string
  gender: string
  locale?: string
  styles?: string[]
  shortName?: string
  displayName?: string
}

interface VoiceSettingsProps {
  selectedVoice: string
  setSelectedVoice: (voice: string) => void
  voiceStyle: string
  setVoiceStyle: (style: string) => void
}

// Mock data for testing
const mockVoices: Voice[] = [
  {
    id: 'en-US-AriaNeural',
    name: 'Aria',
    language: 'English (US)',
    gender: 'Female',
    locale: 'en-US',
    displayName: 'Aria (English US)',
    styles: ['default', 'cheerful', 'sad']
  },
  {
    id: 'en-US-DavisNeural',
    name: 'Davis',
    language: 'English (US)',
    gender: 'Male',
    locale: 'en-US',
    displayName: 'Davis (English US)',
    styles: ['default', 'excited']
  },
  {
    id: 'es-ES-ElviraNeural',
    name: 'Elvira',
    language: 'Spanish (Spain)',
    gender: 'Female',
    locale: 'es-ES',
    displayName: 'Elvira (Spanish Spain)',
    styles: ['default']
  }
]

const VoiceSettings = ({
  selectedVoice,
  setSelectedVoice,
  voiceStyle,
  setVoiceStyle
}: VoiceSettingsProps) => {
  const { 
    voices: cacheVoices, 
    isLoading, 
    error, 
    refreshVoices, 
    getVoiceStyles, 
    isCached, 
    cacheInfo 
  } = useVoiceCache()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('all')
  const [selectedGender, setSelectedGender] = useState('all')

  // Use mock data if cache voices are empty (for debugging)
  const voices = cacheVoices && cacheVoices.length > 0 ? cacheVoices : mockVoices

  console.log('VoiceSettings render:', {
    cacheVoicesCount: cacheVoices?.length || 0,
    mockVoicesCount: mockVoices.length,
    usingVoicesCount: voices.length,
    isLoading,
    error
  })

  // Get available languages from voices
  const languages = useMemo(() => {
    console.log('Computing languages from voices:', voices?.length || 0, 'voices')
    if (!voices || voices.length === 0) return []
    
    const langSet = new Set(voices.map((voice: Voice) => voice.language).filter(Boolean))
    const languageArray = Array.from(langSet).sort()
    console.log('Available languages:', languageArray)
    return languageArray
  }, [voices])

  // Get available genders from voices
  const genders = useMemo(() => {
    console.log('Computing genders from voices:', voices?.length || 0, 'voices')
    if (!voices || voices.length === 0) return []
    
    const genderSet = new Set(voices.map((voice: Voice) => voice.gender).filter(Boolean))
    const genderArray = Array.from(genderSet).sort()
    console.log('Available genders:', genderArray)
    return genderArray
  }, [voices])

  // Filter voices based on search and filters
  const filteredVoices = useMemo(() => {
    if (!voices || voices.length === 0) return []
    
    return voices.filter((voice: Voice) => {
      const searchString = searchTerm.toLowerCase()
      const matchesSearch = !searchTerm || 
        voice.name?.toLowerCase().includes(searchString) ||
        voice.language?.toLowerCase().includes(searchString) ||
        voice.displayName?.toLowerCase().includes(searchString) ||
        voice.shortName?.toLowerCase().includes(searchString)
      
      const matchesLanguage = selectedLanguage === 'all' || voice.language === selectedLanguage
      const matchesGender = selectedGender === 'all' || voice.gender === selectedGender
      
      return matchesSearch && matchesLanguage && matchesGender
    })
  }, [voices, searchTerm, selectedLanguage, selectedGender])

  // Get selected voice details
  const selectedVoiceDetails = voices?.find((voice: Voice) => voice.id === selectedVoice)

  // Get available styles for selected voice
  const availableStyles = selectedVoiceDetails ? (selectedVoiceDetails.styles || ['default']) : ['default']

  // Reset style if not available for current voice
  useEffect(() => {
    if (selectedVoiceDetails && !availableStyles.includes(voiceStyle)) {
      setVoiceStyle('default')
    }
  }, [selectedVoice, selectedVoiceDetails, availableStyles, voiceStyle, setVoiceStyle])

  // Error state
  if (error && (!voices || voices.length === 0)) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Voice Selection
          </h3>
          <div className="flex items-center space-x-2">
            {isCached && (
              <span className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                Cached
              </span>
            )}
            <button
              onClick={refreshVoices}
              disabled={isLoading}
              className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
              title="Refresh voices"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-800 dark:text-red-200 text-xs">
                Failed to load voices: {error}
              </p>
              <button
                onClick={refreshVoices}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 text-xs underline mt-1"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Debug info */}
      <div className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 p-2 rounded">
        Debug: {voices.length} voices loaded, {languages.length} languages, {genders.length} genders
        {cacheVoices.length === 0 && ' (using mock data)'}
      </div>

      {/* Header with cache indicator and refresh */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Voice Selection
        </h3>
        <div className="flex items-center space-x-2">
          {isCached && (
            <span className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
              Cached
            </span>
          )}
          {cacheInfo && !cacheInfo.isExpired && (
            <span className="text-xs text-gray-500 dark:text-gray-400" title={`Cached ${cacheInfo.cachedAt.toLocaleString()}`}>
              {Math.round(cacheInfo.age / 1000 / 60)}m old
            </span>
          )}
          <button
            onClick={refreshVoices}
            disabled={isLoading}
            className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
            title="Refresh voices"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && cacheVoices.length === 0 && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading voices...</span>
          </div>
        </div>
      )}

      {/* Voice selection interface */}
      {voices && voices.length > 0 && (
        <>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search voices by name or language..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Language ({languages.length} available)
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full text-xs py-2 px-2 border border-gray-200 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Languages</option>
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Gender ({genders.length} available)
              </label>
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="w-full text-xs py-2 px-2 border border-gray-200 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Genders</option>
                {genders.map(gender => (
                  <option key={gender} value={gender}>{gender}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Voice List with Label */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Available Voices ({filteredVoices.length})
            </label>
            <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-md">
              {filteredVoices.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                  <div className="flex flex-col items-center space-y-2">
                    <Volume2 className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                    <p>No voices found</p>
                    <p className="text-xs">Try adjusting your search or filters</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filteredVoices.map((voice: Voice, index: number) => (
                    <button
                      key={voice.id}
                      onClick={() => setSelectedVoice(voice.id)}
                      className={`w-full text-left px-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        selectedVoice === voice.id 
                          ? 'bg-black dark:bg-white text-white dark:text-black' 
                          : 'text-gray-900 dark:text-gray-100'
                      } ${index === 0 ? 'rounded-t-md' : ''} ${index === filteredVoices.length - 1 ? 'rounded-b-md' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {voice.displayName || voice.name}
                          </div>
                          <div className={`text-xs mt-0.5 ${
                            selectedVoice === voice.id 
                              ? 'text-gray-300 dark:text-gray-600' 
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {voice.language} • {voice.gender}
                            {voice.locale && ` • ${voice.locale}`}
                          </div>
                        </div>
                        
                        {selectedVoice === voice.id && (
                          <div className="ml-2 flex-shrink-0">
                            <div className="w-2 h-2 bg-white dark:bg-black rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Voice Style Selection */}
          {selectedVoiceDetails && availableStyles.length > 1 && (
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Speaking Style
              </label>
              <select
                value={voiceStyle}
                onChange={(e) => setVoiceStyle(e.target.value)}
                className="w-full text-sm py-2 px-3 border border-gray-200 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                {availableStyles.map(style => (
                  <option key={style} value={style}>
                    {style.charAt(0).toUpperCase() + style.slice(1).replace(/([A-Z])/g, ' $1')}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Voice count and performance indicator */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>
              Showing {filteredVoices.length} of {voices.length} voices
            </span>
            {isCached && (
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Loaded from cache</span>
              </span>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default VoiceSettings