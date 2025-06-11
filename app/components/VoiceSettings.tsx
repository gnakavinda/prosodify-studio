'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Loader, AlertCircle, ChevronDown, Search, X } from 'lucide-react'

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

interface DropdownOption {
  value: string;
  label: string;
}

// Custom Dropdown Component with Search
interface SearchableDropdownProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  disabled?: boolean;
}

function SearchableDropdown({ 
  label, 
  value, 
  onChange, 
  options, 
  placeholder = "Select...",
  disabled = false 
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Get display label for selected value
  const selectedOption = options.find(option => option.value === value)
  const displayLabel = selectedOption ? selectedOption.label : placeholder

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle option selection
  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
    setSearchTerm('')
  }

  // Clear search when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('')
    }
  }, [isOpen])

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      
      {/* Dropdown Trigger */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full p-2 text-left border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 flex items-center justify-between ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-600'
        }`}
      >
        <span className={value ? '' : 'text-gray-500 dark:text-gray-400'}>
          {displayLabel}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-xl max-h-80 overflow-hidden">
          {/* Search Box */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 sticky top-0">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto bg-white dark:bg-gray-700">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border-none ${
                    value === option.value 
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' 
                      : 'text-gray-900 dark:text-gray-100'
                  }`}
                >
                  {option.label}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
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
  const [selectedLanguage, setSelectedLanguage] = useState('all')
  const [selectedGender, setSelectedGender] = useState('all')

  // Get available styles for selected voice - memoized with useCallback
  const getAvailableStyles = useCallback(() => {
    if (!selectedVoice || voices.length === 0) return ['default']
    
    const voice = voices.find(v => v.shortName === selectedVoice)
    const styles = voice?.styles || []
    
    if (styles.length === 0) return ['default']
    return styles
  }, [selectedVoice, voices])

  // Update style when voice changes
  useEffect(() => {
    const availableStyles = getAvailableStyles()
    if (availableStyles.length > 0 && !availableStyles.includes(voiceStyle)) {
      const newStyle = availableStyles[0]
      setVoiceStyle(newStyle)
    }
  }, [selectedVoice, voiceStyle, setVoiceStyle, getAvailableStyles])

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

  // Filter voices based on language and gender
  const getFilteredVoices = () => {
    if (voices.length === 0) return []

    return voices.filter(voice => {
      const matchesLanguage = selectedLanguage === 'all' || voice.locale === selectedLanguage
      const matchesGender = selectedGender === 'all' || voice.gender.toLowerCase() === selectedGender.toLowerCase()
      return matchesLanguage && matchesGender
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

  // Prepare dropdown options
  const languageOptions: DropdownOption[] = [
    { value: 'all', label: 'All Languages' },
    ...getAvailableLanguages().map(language => {
      const group = groupedVoices[language]
      return {
        value: language,
        label: group?.localeName || language
      }
    })
  ]

  const genderOptions: DropdownOption[] = [
    { value: 'all', label: 'All Genders' },
    ...getAvailableGenders().map(gender => ({
      value: gender,
      label: gender
    }))
  ]

  const voiceOptions: DropdownOption[] = [
    { value: '', label: 'Select a voice...' },
    ...getFilteredVoices().map(voice => ({
      value: voice.shortName,
      label: `${voice.name} - ${voice.localeName}`
    }))
  ]

  const styleOptions: DropdownOption[] = getAvailableStyles().map(style => ({
    value: style,
    label: style.charAt(0).toUpperCase() + style.slice(1).replace(/-/g, ' ')
  }))

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

  return (
    <div className="space-y-4">
      {/* Language Dropdown */}
      <SearchableDropdown
        label="Language"
        value={selectedLanguage}
        onChange={setSelectedLanguage}
        options={languageOptions}
        placeholder="Select language..."
      />

      {/* Gender Dropdown */}
      <SearchableDropdown
        label="Gender"
        value={selectedGender}
        onChange={setSelectedGender}
        options={genderOptions}
        placeholder="Select gender..."
      />

      {/* Voice Dropdown */}
      <SearchableDropdown
        label="Voice"
        value={selectedVoice}
        onChange={setSelectedVoice}
        options={voiceOptions}
        placeholder="Select a voice..."
      />

      {/* Style Dropdown */}
      <SearchableDropdown
        label="Style"
        value={voiceStyle}
        onChange={setVoiceStyle}
        options={styleOptions}
        placeholder="Select style..."
        disabled={!selectedVoice}
      />

      {/* No results message */}
      {getFilteredVoices().length === 0 && voices.length > 0 && selectedLanguage !== 'all' && (
        <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm">
            No voices found for the selected filters.
          </p>
          <button 
            onClick={() => {
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
  )
}