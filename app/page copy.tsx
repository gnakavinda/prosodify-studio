'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Download, Settings, Volume2, Music, X, Square, Loader, Search, Filter, User, Users } from 'lucide-react'

interface AudioFile {
  id: string
  name: string
  url: string
  isPreview: boolean
  timestamp: string
}

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

export default function Home() {
  const [text, setText] = useState('')
  const [selectedVoice, setSelectedVoice] = useState('')
  const [voiceStyle, setVoiceStyle] = useState('neutral')
  const [speechRate, setSpeechRate] = useState(1)
  const [pitch, setPitch] = useState(1)
  const [volume, setVolume] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([])
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({})

  // Dynamic voices state
  const [voices, setVoices] = useState<Voice[]>([])
  const [groupedVoices, setGroupedVoices] = useState<Record<string, any>>({})
  const [isLoadingVoices, setIsLoadingVoices] = useState(true)
  const [voicesError, setVoicesError] = useState<string | null>(null)

  // Voice filters
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
          
          // Set default voice if none selected
          if (!selectedVoice && data.voices.length > 0) {
            // Try to find Jenny or Guy first, fallback to first voice
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
  }, [])

  // Get available styles for selected voice
  const getAvailableStyles = () => {
    const voice = voices.find(v => v.shortName === selectedVoice)
    return voice?.styles || ['neutral']
  }

  // Filter voices based on search term, language, and gender
  const getFilteredVoices = () => {
    return voices.filter(voice => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        voice.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voice.shortName.toLowerCase().includes(searchTerm.toLowerCase())

      // Language filter
      const matchesLanguage = selectedLanguage === 'all' || voice.locale === selectedLanguage

      // Gender filter  
      const matchesGender = selectedGender === 'all' || voice.gender.toLowerCase() === selectedGender.toLowerCase()

      return matchesSearch && matchesLanguage && matchesGender
    })
  }

  // Get unique languages from voices
  const getAvailableLanguages = () => {
    const languages = [...new Set(voices.map(voice => voice.locale))]
    return languages.sort()
  }

  // Get unique genders from voices
  const getAvailableGenders = () => {
    const genders = [...new Set(voices.map(voice => voice.gender))]
    return genders.sort()
  }

  // Get country flag for locale (using unicode flag emojis)
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

  // Get country code for locale (fallback approach)
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

  // Get gender icon
  const getGenderIcon = (gender: string) => {
    if (gender.toLowerCase() === 'male') return '👨'
    if (gender.toLowerCase() === 'female') return '👩'
    return '👤'
  }

  // Get style icon
  const getStyleIcon = (style: string) => {
    const styleIcons: Record<string, string> = {
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

  // Update style when voice changes
  useEffect(() => {
    const availableStyles = getAvailableStyles()
    if (availableStyles.length > 0 && !availableStyles.includes(voiceStyle)) {
      setVoiceStyle(availableStyles[0])
    }
  }, [selectedVoice])

  const generateFileName = (isPreview: boolean) => {
    const voice = voices.find(v => v.shortName === selectedVoice)
    const voiceName = voice?.name.split(' ')[0] || 'Unknown'
    const timestamp = new Date().toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(',', '').replace(/:/g, '-')
    
    const suffix = isPreview ? '_preview' : ''
    return `${voiceName}_${voiceStyle}_${timestamp}${suffix}`
  }

  const handleGenerate = async (isPreview = false) => {
    setIsGenerating(true);
    try {
      const textToUse = isPreview 
        ? text.substring(0, 200) + (text.length > 200 ? '...' : '')
        : text

      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: textToUse,
          voice: selectedVoice, // Now using Azure voice shortName
          style: voiceStyle,
          rate: speechRate,
          pitch: pitch,
          volume: volume
        }),
      });

      const data = await response.json();

      if (data.success) {
        const audioBlob = new Blob(
          [Uint8Array.from(atob(data.audio), c => c.charCodeAt(0))],
          { type: 'audio/mp3' }
        );
        const url = URL.createObjectURL(audioBlob);
        
        const fileName = generateFileName(isPreview)
        const newAudioFile: AudioFile = {
          id: Date.now().toString(),
          name: fileName,
          url: url,
          isPreview: isPreview,
          timestamp: new Date().toLocaleTimeString()
        }
        
        setAudioFiles(prev => [newAudioFile, ...prev])
        
        if (!isPreview) {
          const link = document.createElement('a');
          link.href = url;
          link.download = `${fileName}.mp3`;
          link.click();
        }
        
        const message = isPreview 
          ? 'Preview generated successfully!'
          : 'Audio generated successfully! Download started.'
        alert(message);
      } else {
        alert('Error generating audio: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error generating audio. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlay = (audioFile: AudioFile) => {
    if (currentlyPlaying && audioRefs.current[currentlyPlaying]) {
      audioRefs.current[currentlyPlaying].pause()
      audioRefs.current[currentlyPlaying].currentTime = 0
    }

    if (!audioRefs.current[audioFile.id]) {
      const audio = new Audio(audioFile.url)
      audio.onended = () => setCurrentlyPlaying(null)
      audioRefs.current[audioFile.id] = audio
    }

    audioRefs.current[audioFile.id].play()
    setCurrentlyPlaying(audioFile.id)
  }

  const handleStop = () => {
    if (currentlyPlaying && audioRefs.current[currentlyPlaying]) {
      audioRefs.current[currentlyPlaying].pause()
      audioRefs.current[currentlyPlaying].currentTime = 0
      setCurrentlyPlaying(null)
    }
  }

  const handleDownload = (audioFile: AudioFile) => {
    const link = document.createElement('a');
    link.href = audioFile.url;
    link.download = `${audioFile.name}.mp3`;
    link.click();
  }

  const handleRemoveFile = (audioId: string) => {
    const audioFile = audioFiles.find(f => f.id === audioId)
    if (audioFile) {
      if (currentlyPlaying === audioId) {
        handleStop()
      }
      if (audioRefs.current[audioId]) {
        delete audioRefs.current[audioId]
      }
      URL.revokeObjectURL(audioFile.url)
      setAudioFiles(prev => prev.filter(f => f.id !== audioId))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Volume2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Prosodify Studio
              </h1>
              <p className="text-sm text-gray-600">Professional Text-to-Speech Generator</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Text Input */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="relative">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter your text here... You can write up to 5,000 characters for speech synthesis."
                  className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-4 pb-16"
                  maxLength={5000}
                />
                
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    <span>Characters: {text.length}/5,000</span>
                    <span className="ml-4">Cost: ${(text.length * 0.000015).toFixed(4)}</span>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleGenerate(true)}
                      disabled={isGenerating || !text.trim() || !selectedVoice}
                      className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      {isGenerating ? '...' : 'Preview'}
                    </button>

                    <button
                      onClick={() => handleGenerate(false)}
                      disabled={isGenerating || !text.trim() || !selectedVoice}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      {isGenerating ? '...' : 'Generate'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Generated Audio Files Table */}
            {audioFiles.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800 flex items-center">
                    <Music className="w-5 h-5 mr-2 text-blue-600" />
                    Generated Audio Files ({audioFiles.length})
                  </h3>
                  <button
                    onClick={() => {
                      audioFiles.forEach(file => {
                        URL.revokeObjectURL(file.url)
                      })
                      setAudioFiles([])
                      setCurrentlyPlaying(null)
                      audioRefs.current = {}
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors text-sm"
                  >
                    Clear All
                  </button>
                </div>
                
                <div className="overflow-hidden">
                  <table className="w-full">
                    <tbody>
                      {audioFiles.map((audioFile) => (
                        <tr key={audioFile.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-3">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {audioFile.name}
                                  {audioFile.isPreview ? (
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                      Preview
                                    </span>
                                  ) : (
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                      Full Audio
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500">{audioFile.timestamp}</div>
                              </div>
                              {currentlyPlaying === audioFile.id && (
                                <div className="ml-3 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => handlePlay(audioFile)}
                              disabled={currentlyPlaying === audioFile.id}
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={handleStop}
                              disabled={currentlyPlaying !== audioFile.id}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                            >
                              <Square className="w-4 h-4" />
                            </button>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => handleDownload(audioFile)}
                              className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => handleRemoveFile(audioFile.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Controls */}
          <div className="space-y-6">
            
            {/* Voice Selection */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Voice Settings
                {isLoadingVoices && <Loader className="w-4 h-4 ml-2 animate-spin" />}
              </h3>
              
              {voicesError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800 text-sm">Error loading voices: {voicesError}</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="mt-2 text-sm text-red-600 hover:text-red-800"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  
                  {/* Voice Filters */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center mb-2">
                      <Filter className="w-4 h-4 mr-2 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Filters</span>
                    </div>
                    
                    {/* Search Box */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search voices..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Language and Gender Filters */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Language</label>
                        <select
                          value={selectedLanguage}
                          onChange={(e) => setSelectedLanguage(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        <label className="block text-xs font-medium text-gray-600 mb-1">Gender</label>
                        <select
                          value={selectedGender}
                          onChange={(e) => setSelectedGender(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    <div className="text-xs text-gray-500 pt-1">
                      {isLoadingVoices ? (
                        'Loading voices...'
                      ) : (
                        `Showing ${getFilteredVoices().length} of ${voices.length} voices`
                      )}
                    </div>
                  </div>

                  {/* Voice Selection Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Voice
                    </label>
                    {isLoadingVoices ? (
                      <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                        Loading voices...
                      </div>
                    ) : (
                      <select
                        value={selectedVoice}
                        onChange={(e) => setSelectedVoice(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800 text-sm">
                          No voices found matching your filters. Try adjusting your search criteria.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Style Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Style ({getAvailableStyles().length} available)
                    </label>
                    <select
                      value={voiceStyle}
                      onChange={(e) => setVoiceStyle(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

            {/* Speech Controls */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Speech Controls</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Speech Rate: {speechRate.toFixed(1)}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Slow</span>
                    <span>Normal</span>
                    <span>Fast</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pitch: {pitch.toFixed(1)}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.1"
                    value={pitch}
                    onChange={(e) => setPitch(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Low</span>
                    <span>Normal</span>
                    <span>High</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Volume: {Math.round(volume * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.2"
                    max="1.5"
                    step="0.1"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Quiet</span>
                    <span>Normal</span>
                    <span>Loud</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Panel */}
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">How it works</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Preview generates first 200 characters</li>
                <li>• Full generation processes entire text</li>
                <li>• Downloads high-quality MP3 audio</li>
                <li>• Supports advanced voice controls</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}