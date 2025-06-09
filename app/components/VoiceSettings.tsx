'use client'

import { useState, useEffect } from 'react'
import { Settings, Loader, Search, Filter, X } from 'lucide-react'

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
  // Existing state
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
          setVoices(data.voices)
          setGroupedVoices(data.groupedByLocale)
          
          if (!selectedVoice && data.voices.length > 0) {
            const defaultVoice = data.voices.find((v: Voice) => 
              v.shortName.includes('Jenny') || v.shortName.includes('Guy')
            ) || data.voices[0]
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

  const getAvailableStyles = () => {
    const voice = voices.find(v => v.shortName === selectedVoice)
    const styles = voice?.styles || []
    if (styles.length === 0) {
      return ['default']
    }
    return styles
  }

  useEffect(() => {
    const getStyles = () => {
      const voice = voices.find(v => v.shortName === selectedVoice)
      const styles = voice?.styles || []
      if (styles.length === 0) {
        return ['default']
      }
      return styles
    }

    const availableStyles = getStyles()
    if (availableStyles.length > 0 && !availableStyles.includes(voiceStyle)) {
      setVoiceStyle(availableStyles[0])
    }
  }, [selectedVoice, voiceStyle, setVoiceStyle, voices])

  const getFilteredVoices = () => {
    return voices.filter(voice => {
      const matchesSearch = searchTerm === '' || 
        voice.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voice.shortName.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesLanguage = selectedLanguage === 'all' || voice.locale === selectedLanguage
      const matchesGender = selectedGender === 'all' || voice.gender.toLowerCase() === selectedGender.toLowerCase()

      return matchesSearch && matchesLanguage && matchesGender
    })
  }

  const getAvailableLanguages = () => {
    const languages = [...new Set(voices.map(voice => voice.locale))]
    return languages.sort()
  }

  const getAvailableGenders = () => {
    const genders = [...new Set(voices.map(voice => voice.gender))]
    return genders.sort()
  }

  const getCountryFlag = (locale: string) => {
    const flagMap: Record<string, string> = {
      'en-US': '🇺🇸',
      'en-GB': '🇬🇧', 
      'en-AU': '🇦🇺',
      'en-CA': '🇨🇦',
      'en-IN': '🇮🇳',
      'en-IE': '🇮🇪',
      'en-ZA': '🇿🇦',
      'en-NZ': '🇳🇿',
      'en-SG': '🇸🇬',
      'en-HK': '🇭🇰',
      'en-PH': '🇵🇭',
      'en-KE': '🇰🇪',
      'en-NG': '🇳🇬',
      'en-TZ': '🇹🇿'
    }
    return flagMap[locale] || '🌍'
  }

  const getCountryCode = (locale: string) => {
    const codeMap: Record<string, string> = {
      'en-US': 'US',
      'en-GB': 'GB', 
      'en-AU': 'AU',
      'en-CA': 'CA',
      'en-IN': 'IN',
      'en-IE': 'IE',
      'en-ZA': 'ZA',
      'en-NZ': 'NZ',
      'en-SG': 'SG',
      'en-HK': 'HK',
      'en-PH': 'PH',
      'en-KE': 'KE',
      'en-NG': 'NG',
      'en-TZ': 'TZ'
    }
    return codeMap[locale] || locale.split('-')[1] || 'EN'
  }

  const getGenderIcon = (gender: string) => {
    if (gender.toLowerCase() === 'male') return '👨'
    if (gender.toLowerCase() === 'female') return '👩'
    return '👤'
  }

  const getStyleIcon = (style: string) => {
    const styleIcons: Record<string, string> = {
      'default': '🎭',
      'neutral': '😐',
      'cheerful': '😊',
      'sad': '😢',
      'angry': '😠',
      'excited': '🤩',
      'friendly': '😄',
      'unfriendly': '😒',
      'terrified': '😰',
      'shouting': '📢',
      'whispering': '🤫',
      'empathetic': '🤗',
      'calm': '😌',
      'serious': '😐',
      'hopeful': '🙂',
      'gentle': '😊',
      'assistant': '🤖',
      'chat': '💬',
      'customerservice': '👔',
      'newscast': '📺',
      'advertisement': '📢',
      'narration': '📖'
    }
    return styleIcons[style.toLowerCase()] || '🎭'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
        <Settings className="w-5 h-5 mr-2" />
        Voice Settings
        {isLoadingVoices && <Loader className="w-4 h-4 ml-2 animate-spin" />}
      </h3>
      
      {voicesError ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
          <p className="text-red-800 dark:text-red-200 text-sm">Error loading voices: {voicesError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Voice Filters */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3 transition-colors duration-300">
            <div className="flex items-center mb-2">
              <Filter className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters</span>
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
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                >
                  <option value="all">🌍 All Languages</option>
                  {getAvailableLanguages().map((language) => {
                    const group = groupedVoices[language]
                    const flag = getCountryFlag(language)
                    const code = getCountryCode(language)
                    return (
                      <option key={language} value={language}>
                        {flag} {group?.localeName || language} ({code})
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
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                >
                  <option value="all">👥 All Genders</option>
                  {getAvailableGenders().map((gender) => (
                    <option key={gender} value={gender}>
                      {getGenderIcon(gender)} {gender}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filter Results Counter */}
            <div className="text-xs text-gray-500 dark:text-gray-400 pt-1">
              {isLoadingVoices ? (
                'Loading voices...'
              ) : (
                `Showing ${getFilteredVoices().length} of ${voices.length} voices`
              )}
            </div>
          </div>

          {/* Voice Selection Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Voice
            </label>
            {isLoadingVoices ? (
              <div className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                Loading voices...
              </div>
            ) : (
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                <option value="">Select a voice...</option>
                {getFilteredVoices().map((voice) => (
                  <option key={voice.shortName} value={voice.shortName}>
                    {getCountryFlag(voice.locale)} {getGenderIcon(voice.gender)} {voice.name} - {voice.localeName}
                  </option>
                ))}
              </select>
            )}
            
            {/* No results message */}
            {!isLoadingVoices && getFilteredVoices().length === 0 && (
              <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  No voices found matching your filters. Try adjusting your search criteria.
                </p>
              </div>
            )}
          </div>

          {/* Style Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Style ({getAvailableStyles().length} available)
            </label>
            <select
              value={voiceStyle}
              onChange={(e) => setVoiceStyle(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              disabled={!selectedVoice}
            >
              {getAvailableStyles().map((style) => (
                <option key={style} value={style}>
                  {getStyleIcon(style)} {style.charAt(0).toUpperCase() + style.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  )
}