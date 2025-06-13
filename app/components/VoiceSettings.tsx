import { useState, useEffect, useMemo } from 'react'
import { Search, Loader2, Volume2 } from 'lucide-react'
import { useVoiceCache } from '../hooks/useVoiceCache'
import type { Voice } from '../services/voiceCache'

interface VoiceSettingsProps {
  selectedVoice: string
  setSelectedVoice: (voice: string) => void
  voiceStyle: string
  setVoiceStyle: (style: string) => void
}

// Dynamic language name resolution using browser's Intl API
const getLanguageName = (langCode: string): string => {
  try {
    // Normalize the language code (handle both es-MX and Es-MX formats)
    const normalizedCode = langCode.toLowerCase().replace(/^([a-z]{2})-?([a-z]{2})?$/i, (match, lang, region) => {
      if (region) {
        return `${lang}-${region.toUpperCase()}`
      }
      return lang
    })

    // Try to get the language name using browser's Intl API
    const displayNames = new Intl.DisplayNames(['en'], { type: 'language' })
    const languageName = displayNames.of(normalizedCode)
    
    if (languageName && languageName !== normalizedCode) {
      return languageName
    }

    // Fallback: try with just the language part (without region)
    const langPart = normalizedCode.split('-')[0]
    const fallbackName = displayNames.of(langPart)
    
    if (fallbackName && fallbackName !== langPart) {
      // If we have a region code, add it manually
      const regionPart = normalizedCode.split('-')[1]
      if (regionPart) {
        // Try to get region name
        try {
          const regionDisplayNames = new Intl.DisplayNames(['en'], { type: 'region' })
          const regionName = regionDisplayNames.of(regionPart.toUpperCase())
          return `${fallbackName} (${regionName})`
        } catch {
          // If region lookup fails, use the region code
          return `${fallbackName} (${regionPart.toUpperCase()})`
        }
      }
      return fallbackName
    }

    // Last resort: manual formatting of common patterns
    return formatLanguageCodeManually(langCode)
    
  } catch (error) {
    // Fallback if Intl API fails
    return formatLanguageCodeManually(langCode)
  }
}

// Fallback function for edge cases
const formatLanguageCodeManually = (langCode: string): string => {
  // Handle common patterns like "es-MX" or "Es-MX"
  const match = langCode.match(/^([a-z]{2})-?([a-z]{2})?$/i)
  if (match) {
    const [, lang, region] = match
    
    // Common language mappings for cases where Intl might not work
    const commonLanguages: { [key: string]: string } = {
      'en': 'English',
      'es': 'Spanish', 
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'zh': 'Chinese',
      'ja': 'Japanese',
      'ko': 'Korean',
      'ar': 'Arabic',
      'hi': 'Hindi',
      'ru': 'Russian',
      'nl': 'Dutch',
      'pl': 'Polish',
      'tr': 'Turkish',
      'sv': 'Swedish',
      'no': 'Norwegian',
      'da': 'Danish',
      'fi': 'Finnish'
    }
    
    const langName = commonLanguages[lang.toLowerCase()] || lang.toUpperCase()
    
    if (region) {
      return `${langName} (${region.toUpperCase()})`
    }
    return langName
  }
  
  // If no pattern matches, just capitalize
  return langCode.charAt(0).toUpperCase() + langCode.slice(1).replace(/[-_]/g, ' ')
}

// Generate voice introduction based on name, language, and gender
const getVoiceIntroduction = (voice: Voice): string => {
  const language = voice.language || voice.Language || voice.locale || voice.Locale || voice.lang || voice.Lang
  const gender = voice.gender || voice.Gender || voice.sex || voice.Sex
  
  // Get friendly language name
  const languageName = language ? getLanguageName(language) : null
  
  // Create personalized introductions based on available data
  const introductions = [
    `A ${gender?.toLowerCase()} voice perfect for ${languageName} content`,
    `Natural ${languageName} ${gender?.toLowerCase()} narrator`,
    `Expressive ${gender?.toLowerCase()} voice with clear ${languageName} pronunciation`,
    `Professional ${languageName} ${gender?.toLowerCase()} voice ideal for any content`,
    `Warm and engaging ${gender?.toLowerCase()} voice speaking ${languageName}`,
    `Clear and articulate ${languageName} ${gender?.toLowerCase()} narrator`,
    `Friendly ${gender?.toLowerCase()} voice with native ${languageName} fluency`,
    `Versatile ${languageName} ${gender?.toLowerCase()} voice for all occasions`
  ]
  
  // Filter out introductions with missing data
  const validIntroductions = introductions.filter(intro => 
    !intro.includes('undefined') && 
    !intro.includes('null') && 
    !intro.includes('Unknown') &&
    !intro.includes('  ') // no double spaces from missing data
  )
  
  if (validIntroductions.length > 0) {
    // Use voice ID to consistently pick the same introduction for the same voice
    const index = voice.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % validIntroductions.length
    return validIntroductions[index]
  }
  
  // Fallback for voices with minimal data
  return 'A natural sounding voice perfect for your content'
}

const VoiceSettings = ({
  selectedVoice,
  setSelectedVoice,
  voiceStyle,
  setVoiceStyle
}: VoiceSettingsProps) => {
  const { 
    voices, 
    isLoading, 
    refreshVoices, 
    getVoiceStyles
  } = useVoiceCache()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('all')
  const [selectedGender, setSelectedGender] = useState('all')
  const [isVoiceListExpanded, setIsVoiceListExpanded] = useState(true)

  // Get available languages from voices (with fallback field names)
  const languages = useMemo(() => {
    if (!voices || voices.length === 0) return []
    
    const langMap = new Map<string, string>()
    voices.forEach((voice: Voice) => {
      // Try multiple possible field names for language
      const langCode = voice.language || voice.Language || voice.locale || voice.Locale || voice.lang || voice.Lang
      if (langCode && typeof langCode === 'string') {
        const friendlyName = getLanguageName(langCode)
        langMap.set(langCode, friendlyName)
      }
    })
    
    // Sort by friendly name, return array of objects with code and name
    return Array.from(langMap.entries())
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([code, name]) => ({ code, name }))
  }, [voices])

  // Get available genders from voices (with fallback field names)
  const genders = useMemo(() => {
    if (!voices || voices.length === 0) return []
    
    const genderSet = new Set<string>()
    voices.forEach((voice: Voice) => {
      // Try multiple possible field names for gender
      const gender = voice.gender || voice.Gender || voice.sex || voice.Sex
      if (gender && typeof gender === 'string') {
        genderSet.add(gender)
      }
    })
    
    return Array.from(genderSet).sort()
  }, [voices])

  // Filter voices based on search and filters
  const filteredVoices = useMemo(() => {
    if (!voices || voices.length === 0) return []
    
    return voices.filter((voice: Voice) => {
      const searchString = searchTerm.toLowerCase()
      
      // Get language and gender with fallbacks
      const voiceLanguage = voice.language || voice.Language || voice.locale || voice.Locale || voice.lang || voice.Lang
      const voiceGender = voice.gender || voice.Gender || voice.sex || voice.Sex
      
      const matchesSearch = !searchTerm || 
        (voice.name && voice.name.toLowerCase().includes(searchString)) ||
        (voiceLanguage && voiceLanguage.toLowerCase().includes(searchString)) ||
        (voice.displayName && voice.displayName.toLowerCase().includes(searchString)) ||
        (voice.shortName && voice.shortName.toLowerCase().includes(searchString))
      
      const matchesLanguage = selectedLanguage === 'all' || voiceLanguage === selectedLanguage
      const matchesGender = selectedGender === 'all' || voiceGender === selectedGender
      
      return matchesSearch && matchesLanguage && matchesGender
    })
  }, [voices, searchTerm, selectedLanguage, selectedGender])

  // Get selected voice details
  const selectedVoiceDetails = voices?.find((voice: Voice) => voice.id === selectedVoice)

  // Get available styles for selected voice
  const availableStyles = useMemo(() => {
    return selectedVoiceDetails ? getVoiceStyles(selectedVoice) : ['default']
  }, [selectedVoiceDetails, getVoiceStyles, selectedVoice])

  // Reset style if not available for current voice
  useEffect(() => {
    if (selectedVoiceDetails && !availableStyles.includes(voiceStyle)) {
      setVoiceStyle('default')
    }
  }, [selectedVoice, selectedVoiceDetails, availableStyles, voiceStyle, setVoiceStyle])

  // Collapse voice list when a voice is selected
  useEffect(() => {
    if (selectedVoice && selectedVoiceDetails) {
      setIsVoiceListExpanded(false)
    }
  }, [selectedVoice, selectedVoiceDetails])

  return (
    <div className="space-y-4">
      {/* Loading state */}
      {isLoading && (!voices || voices.length === 0) && (
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
          <div className="relative mt-6">
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
                Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full text-xs py-2 px-2 border border-gray-200 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Languages</option>
                {languages.map(({ code, name }) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Gender
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

          {/* Voice List */}
          <div>
            {isVoiceListExpanded ? (
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
                    {filteredVoices.map((voice: Voice, index: number) => {
                      return (
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
                                {voice.displayName || voice.name || 'Unknown Voice'}
                              </div>
                            </div>
                            
                            {selectedVoice === voice.id && (
                              <div className="ml-2 flex-shrink-0">
                                <div className="w-2 h-2 bg-white dark:bg-black rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* Show selected voice when collapsed */
              selectedVoiceDetails && (
                <div className="border border-gray-200 dark:border-gray-600 rounded-md p-3 bg-gray-50 dark:bg-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                        {selectedVoiceDetails.displayName || selectedVoiceDetails.name || 'Unknown Voice'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                        {getVoiceIntroduction(selectedVoiceDetails)}
                      </div>
                    </div>
                    <button
                      onClick={() => setIsVoiceListExpanded(true)}
                      className="ml-3 px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 border border-blue-200 dark:border-blue-600 hover:border-blue-300 dark:hover:border-blue-500 rounded transition-colors flex-shrink-0"
                    >
                      Change
                    </button>
                  </div>
                </div>
              )
            )}
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
              
              {/* Style description */}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {voiceStyle === 'default' && 'Natural speaking style'}
                {voiceStyle === 'cheerful' && 'Upbeat and positive tone'}
                {voiceStyle === 'sad' && 'Melancholy and somber tone'}
                {voiceStyle === 'angry' && 'Stern and forceful tone'}
                {voiceStyle === 'excited' && 'Energetic and enthusiastic tone'}
                {voiceStyle === 'friendly' && 'Warm and approachable tone'}
                {voiceStyle === 'hopeful' && 'Optimistic and encouraging tone'}
                {voiceStyle === 'shouting' && 'Loud and emphatic delivery'}
                {voiceStyle === 'terrified' && 'Fearful and anxious tone'}
                {voiceStyle === 'unfriendly' && 'Cold and distant tone'}
                {voiceStyle === 'whispering' && 'Soft and quiet delivery'}
                {!['default', 'cheerful', 'sad', 'angry', 'excited', 'friendly', 'hopeful', 'shouting', 'terrified', 'unfriendly', 'whispering'].includes(voiceStyle) && 'Custom speaking style'}
              </p>
            </div>
          )}

          {/* Voice count */}
          <div className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
            <span>
              Showing {filteredVoices.length} of {voices.length} voices
            </span>
          </div>
        </>
      )}

      {/* Empty state when no voices loaded */}
      {!isLoading && (!voices || voices.length === 0) && (
        <div className="text-center py-8">
          <Volume2 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No voices available
          </p>
          <button
            onClick={refreshVoices}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm underline mt-2"
          >
            Refresh to try again
          </button>
        </div>
      )}
    </div>
  )
}

export default VoiceSettings