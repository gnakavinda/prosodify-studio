'use client'

import { useState, useEffect } from 'react'
import { Loader, Search, Filter, X, AlertCircle } from 'lucide-react'

interface Voice {
  id: string;
  name: string;
  shortName: string;
  locale: string;
  localeName: string;
  gender: string;
  voiceType: string;
  styles: string[];
  roles: string[];
}

interface GroupedVoices {
  locale: string;
  localeName: string;
  voices: Voice[];
}

interface VoiceSettingsProps {
  selectedVoice: string;
  setSelectedVoice: (voice: string) => void;
  voiceStyle: string;
  setVoiceStyle: (style: string) => void;
}

export default function VoiceSettings({ 
  selectedVoice, 
  setSelectedVoice, 
  voiceStyle, 
  setVoiceStyle 
}: VoiceSettingsProps) {
  const [voices, setVoices] = useState<Voice[]>([])
  const [groupedVoices, setGroupedVoices] = useState<Record<string, GroupedVoices>>({})
  const [isLoadingVoices, setIsLoadingVoices] = useState(true)
  const [voicesError, setVoicesError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('all')
  const [selectedGender, setSelectedGender] = useState('all')

  // Fetch voices from Azure
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        setIsLoadingVoices(true)
        setVoicesError(null)

        const response = await fetch('/api/voices')
        const data = await response.json()

        if (data.success) {
          const voicesArray = data.voices || []
          setVoices(voicesArray)
          setGroupedVoices(data.groupedByLocale || {})
          
          // Set default voice if none selected
          if (!selectedVoice && voicesArray.length > 0) {
            const defaultVoice = voicesArray.find((v: Voice) => 
              v.shortName.includes('Jenny') || 
              v.shortName.includes('Guy') || 
              v.shortName.includes('Aria') ||
              v.locale.startsWith('en-')
            ) || voicesArray[0]
            
            setSelectedVoice(defaultVoice.shortName)
          }
        } else {
          setVoicesError(data.error || 'Failed to fetch voices')
        }
      } catch (err) {
        setVoicesError('Network error while fetching voices')
        console.error('Voices fetch error:', err)
      } finally {
        setIsLoadingVoices(false)
      }
    }

    fetchVoices()
  }, [selectedVoice, setSelectedVoice])

  // Get available styles for selected voice
  const getAvailableStyles = () => {
    if (!selectedVoice || voices.length === 0) return ['default']
    
    const voice = voices.find(v => v.shortName === selectedVoice)
    const styles = voice?.styles || []
    
    if (styles.length === 0) return ['default']
    return styles
  }

  // Update style when voice changes
  useEffect(() => {
    const availableStyles = getAvailableStyles()
    if (availableStyles.length > 0 && !availableStyles.includes(voiceStyle)) {
      const newStyle = availableStyles[0]
      setVoiceStyle(newStyle)
    }
  }, [selectedVoice, voiceStyle, setVoiceStyle, voices])

  // Filter voices based on search and filters
  const getFilteredVoices = () => {
    if (voices.length === 0) return []

    return voices.filter(voice => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        voice.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voice.shortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voice.localeName.toLowerCase().includes(searchTerm.toLowerCase())

      // Language filter
      const matchesLanguage = selectedLanguage === 'all' || voice.locale === selectedLanguage
      
      // Gender filter
      const matchesGender = selectedGender === 'all' || voice.gender.toLowerCase() === selectedGender.toLowerCase()

      return matchesSearch && matchesLanguage && matchesGender
    })
  }

  // Get unique languages
  const getAvailableLanguages = () => {
    const languages = [...new Set(voices.map(voice => voice.locale))]
    return languages.sort()
  }

  // Get unique genders
  const getAvailableGenders = () => {
    const genders = [...new Set(voices.map(voice => voice.gender))]
    return genders.sort()
  }

  // Helper functions for display
  const getCountryFlag = (locale: string) => {
    const flagMap: Record<string, string> = {
      // English variants
      'en-US': '🇺🇸', 'en-GB': '🇬🇧', 'en-AU': '🇦🇺', 'en-CA': '🇨🇦', 'en-IN': '🇮🇳',
      'en-IE': '🇮🇪', 'en-ZA': '🇿🇦', 'en-NZ': '🇳🇿', 'en-SG': '🇸🇬', 'en-HK': '🇭🇰',
      'en-PH': '🇵🇭', 'en-KE': '🇰🇪', 'en-NG': '🇳🇬', 'en-TZ': '🇹🇿',
      // Major languages
      'es-ES': '🇪🇸', 'es-MX': '🇲🇽', 'es-AR': '🇦🇷', 'es-US': '🇺🇸', 'es-CO': '🇨🇴',
      'fr-FR': '🇫🇷', 'fr-CA': '🇨🇦', 'fr-CH': '🇨🇭', 'fr-BE': '🇧🇪',
      'de-DE': '🇩🇪', 'de-AT': '🇦🇹', 'de-CH': '🇨🇭',
      'it-IT': '🇮🇹', 'pt-BR': '🇧🇷', 'pt-PT': '🇵🇹',
      'ja-JP': '🇯🇵', 'ko-KR': '🇰🇷', 'zh-CN': '🇨🇳', 'zh-TW': '🇹🇼', 'zh-HK': '🇭🇰',
      'hi-IN': '🇮🇳', 'ar-SA': '🇸🇦', 'ar-AE': '🇦🇪', 'ar-EG': '🇪🇬',
      'ru-RU': '🇷🇺', 'th-TH': '🇹🇭', 'vi-VN': '🇻🇳', 'tr-TR': '🇹🇷'
    }
    return flagMap[locale] || '🌍'
  }

  const getGenderIcon = (gender: string) => {
    if (gender.toLowerCase() === 'male') return '👨'
    if (gender.toLowerCase() === 'female') return '👩'
    return '👤'
  }

  const getStyleIcon = (style: string) => {
    const styleIcons: Record<string, string> = {
      'default': '🎭', 'neutral': '😐', 'cheerful': '😊', 'sad': '😢', 'angry': '😠',
      'excited': '🤩', 'friendly': '😄', 'unfriendly': '😒', 'terrified': '😰',
      'shouting': '📢', 'whispering': '🤫', 'empathetic': '🤗', 'calm': '😌',
      'serious': '😐', 'hopeful': '🙂', 'gentle': '😊', 'assistant': '🤖',
      'chat': '💬', 'customerservice': '👔', 'newscast': '📺', 'advertisement': '📢',
      'narration-professional': '📖', 'narration-relaxed': '📚', 'documentary-narration': '🎬',
      'poetry-reading': '📜', 'sports-commentary': '⚽', 'livecommercial': '📺'
    }
    return styleIcons[style.toLowerCase()] || '🎭'
  }

  // Loading state
  if (isLoadingVoices) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400 mr-2" />
        <span className="text-gray-600 dark:text-gray-400">Loading voices...</span>
      </div>
    )
  }

  // Error state
  if (voicesError) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
            <h4 className="text-red-800 dark:text-red-200 font-medium">Voice Loading Error</h4>
          </div>
          <p className="text-red-700 dark:text-red-300 text-sm mb-3">{voicesError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Get filtered voices
  const filteredVoices = getFilteredVoices()

  return (
    <div className="space-y-4">
      
      {/* Voice Filters */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3 transition-colors duration-300">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Filter className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters</span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {voices.length} voices available
          </div>
        </div>
        
        {/* Search Box */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search voices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Language and Gender Filters */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Language</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Languages</option>
              {getAvailableLanguages().map((language) => {
                const group = groupedVoices[language]
                return (
                  <option key={language} value={language}>
                    {group?.localeName || language}
                  </option>
                )
              })}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Gender</label>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Genders</option>
              {getAvailableGenders().map((gender) => (
                <option key={gender} value={gender}>
                  {gender}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Results Counter */}
        <div className="text-xs text-gray-500 dark:text-gray-400 pt-1 border-t border-gray-200 dark:border-gray-600">
          Showing {filteredVoices.length} of {voices.length} voices
        </div>
      </div>

      {/* Voice Selection Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Voice
        </label>
        <select
          value={selectedVoice}
          onChange={(e) => setSelectedVoice(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="">Select a voice...</option>
          {filteredVoices.map((voice) => (
            <option key={voice.shortName} value={voice.shortName}>
              {voice.name} - {voice.localeName}
            </option>
          ))}
        </select>
        
        {/* No results message */}
        {filteredVoices.length === 0 && voices.length > 0 && (
          <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              No voices found matching your filters. Try adjusting your search criteria.
            </p>
            <button 
              onClick={() => {
                setSearchTerm('')
                setSelectedLanguage('all')
                setSelectedGender('all')
              }}
              className="mt-2 text-xs text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Style Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Speaking Style ({getAvailableStyles().length} available)
        </label>
        <select
          value={voiceStyle}
          onChange={(e) => setVoiceStyle(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          disabled={!selectedVoice}
        >
          {getAvailableStyles().map((style) => (
            <option key={style} value={style}>
              {style.charAt(0).toUpperCase() + style.slice(1).replace(/-/g, ' ')}
            </option>
          ))}
        </select>
        
        {/* Style Info */}
        {selectedVoice && getAvailableStyles().length > 1 && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            This voice supports {getAvailableStyles().length} different speaking styles
          </div>
        )}
      </div>
    </div>
  )
}