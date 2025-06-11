'use client'

import { Play, Download, Volume2, X, Info, Mic, FileText, Headphones, ChevronDown, ChevronRight, AlertCircle, Pause, SkipBack, SkipForward, Share, Settings, History, Minimize2, Maximize2 } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import VoiceSettings from './components/VoiceSettings'
import AudioFileManager from './components/AudioFileManager'
import ThemeToggle from './components/ThemeToggle'
import { useTextToSpeechLogic } from './TextToSpeechLogic'

export default function TextToSpeechUI() {
  const {
    text,
    setText,
    selectedVoice,
    setSelectedVoice,
    voiceStyle,
    setVoiceStyle,
    speechRate,
    setSpeechRate,
    pitch,
    setPitch,
    volume,
    setVolume,
    isGenerating,
    audioFiles,
    currentlyPlaying,
    showHowItWorks,
    setShowHowItWorks,
    error,
    handleGenerate,
    handlePlay,
    handleStop,
    handleDownload,
    handleRemoveFile,
    handleClearAllFiles,
    resetForm,
    dismissError,
    getTextStats
  } = useTextToSpeechLogic()

  // State for right panel tabs
  const [activeTab, setActiveTab] = useState<'settings' | 'history'>('settings')
  
  // State for footer audio player  
  const [showPlayer, setShowPlayer] = useState(false)
  const [isPlayerMinimized, setIsPlayerMinimized] = useState(false)
  const [lastPlayedAudio, setLastPlayedAudio] = useState<any>(null)

  // Get text statistics
  const textStats = getTextStats()

  // Get currently playing audio file for the player
  const currentAudioFile = audioFiles.find(file => file.id === currentlyPlaying)

  // Show player when audio file exists or was recently played
  useEffect(() => {
    if (currentAudioFile) {
      setShowPlayer(true)
      setLastPlayedAudio(currentAudioFile)
    }
    // Don't hide player when audio stops - keep it with last played audio
  }, [currentAudioFile])

  // Auto-play newly generated audio
  useEffect(() => {
    if (audioFiles.length > 0) {
      const latestAudio = audioFiles[audioFiles.length - 1]
      
      // Check if this is a new audio file (created in last 2 seconds)
      const now = new Date()
      const audioTime = new Date(latestAudio.timestamp)
      const timeDiff = now.getTime() - audioTime.getTime()
      
      if (timeDiff < 2000 && latestAudio.id !== currentlyPlaying) {
        // Auto-play the latest generated audio
        handlePlay(latestAudio)
      }
    }
  }, [audioFiles, currentlyPlaying, handlePlay])

  // Get the audio file to display in player (current or last played)
  const playerAudioFile = currentAudioFile || lastPlayedAudio

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      {/* Header */}
      <Header />

      {/* How It Works Section */}
      {showHowItWorks && (
        <HowItWorksSection onClose={() => setShowHowItWorks(false)} />
      )}

      {/* Global Error Banner */}
      {error && (
        <ErrorBanner error={error} onDismiss={dismissError} />
      )}

      {/* Main Content - Full Width Layout */}
      <div className="px-6 py-6">
        <div className="flex gap-6 h-[calc(100vh-140px)]">
          
          {/* Left Column - Text Input (60% width) */}
          <div className="flex-[0_0_60%] flex flex-col">
            <TextInputSection
              text={text}
              setText={setText}
              isGenerating={isGenerating}
              selectedVoice={selectedVoice}
              textStats={textStats}
              handleGenerate={handleGenerate}
              resetForm={resetForm}
            />
          </div>

          {/* Right Column - Tabbed Panel (40% width) */}
          <div className="flex-[0_0_40%] flex flex-col">
            {/* Tab Navigation */}
            <div className="bg-white dark:bg-gray-800 rounded-t-lg border border-gray-200 dark:border-gray-700 border-b-0">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex-1 px-4 py-3 text-sm font-medium rounded-tl-lg transition-colors ${
                    activeTab === 'settings'
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-b-2 border-blue-500'
                      : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 px-4 py-3 text-sm font-medium rounded-tr-lg transition-colors ${
                    activeTab === 'history'
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-b-2 border-blue-500'
                      : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <History className="w-4 h-4" />
                    <span>History</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white dark:bg-gray-800 rounded-b-lg border border-gray-200 dark:border-gray-700 flex-1 overflow-hidden">
              {activeTab === 'settings' ? (
                <SettingsTabContent
                  selectedVoice={selectedVoice}
                  setSelectedVoice={setSelectedVoice}
                  voiceStyle={voiceStyle}
                  setVoiceStyle={setVoiceStyle}
                  speechRate={speechRate}
                  setSpeechRate={setSpeechRate}
                  pitch={pitch}
                  setPitch={setPitch}
                  volume={volume}
                  setVolume={setVolume}
                />
              ) : (
                <HistoryTabContent
                  audioFiles={audioFiles}
                  currentlyPlaying={currentlyPlaying}
                  onPlay={handlePlay}
                  onStop={handleStop}
                  onDownload={handleDownload}
                  onRemove={handleRemoveFile}
                  onClearAll={handleClearAllFiles}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Audio Player */}
      {showPlayer && playerAudioFile && (
        <FooterAudioPlayer
          audioFile={playerAudioFile}
          onPlay={() => handlePlay(playerAudioFile)}
          onStop={handleStop}
          onDownload={() => handleDownload(playerAudioFile)}
          isPlaying={currentlyPlaying === playerAudioFile.id}
          isMinimized={isPlayerMinimized}
          onToggleMinimize={() => setIsPlayerMinimized(!isPlayerMinimized)}
          onClose={() => {
            handleStop()
            setShowPlayer(false)
            setLastPlayedAudio(null)
          }}
        />
      )}
    </div>
  )
}

// Footer Audio Player Component
const FooterAudioPlayer = ({
  audioFile,
  onPlay,
  onStop,
  onDownload,
  isPlaying,
  isMinimized,
  onToggleMinimize,
  onClose
}: {
  audioFile: any
  onPlay: () => void
  onStop: () => void
  onDownload: () => void
  isPlaying: boolean
  isMinimized: boolean
  onToggleMinimize: () => void
  onClose: () => void
}) => {
  const [currentTime, setCurrentTime] = useState(6) // Current time in seconds
  const [duration, setDuration] = useState(48) // Total duration in seconds
  const [isDragging, setIsDragging] = useState(false)

  // Format time from seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Handle timeline click and drag
  const handleTimelineInteraction = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const newTime = Math.round(percentage * duration)
    setCurrentTime(Math.max(0, Math.min(newTime, duration)))
  }

  // Handle mouse down on timeline
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true)
    handleTimelineInteraction(e)
  }

  // Handle mouse move while dragging
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const timeline = document.getElementById('audio-timeline')
      if (timeline) {
        const rect = timeline.getBoundingClientRect()
        const clickX = e.clientX - rect.left
        const percentage = clickX / rect.width
        const newTime = Math.round(percentage * duration)
        setCurrentTime(Math.max(0, Math.min(newTime, duration)))
      }
    }
  }

  // Handle mouse up
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, duration])

  // Calculate progress percentage
  const progressPercentage = (currentTime / duration) * 100

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-xl transition-all duration-300 ease-in-out z-50">
      
      {/* Minimized View */}
      {isMinimized ? (
        <div className="px-6 py-2 flex items-center justify-center relative group">
          <div
            onClick={onToggleMinimize}
            className="w-32 h-1 bg-gray-900 dark:bg-gray-100 rounded-full cursor-pointer transition-all duration-200 group-hover:h-8 group-hover:w-40 group-hover:flex group-hover:items-center group-hover:justify-center group-hover:px-4 group-hover:bg-gray-900 dark:group-hover:bg-gray-100"
          >
            <span className="text-white dark:text-gray-900 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              Expand audio player
            </span>
          </div>
        </div>
      ) : (
        /* Expanded View */
        <div className="px-6 py-4">
          
          {/* Top Row: Info, Controls, Actions */}
          <div className="flex items-center justify-between mb-3">
            
            {/* Left: Audio Info */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <Volume2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {audioFile.name.replace(/^(Preview_|Full_)/, '')}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {audioFile.isPreview ? 'Preview' : 'Aria'} • Created {audioFile.timestamp.split(',')[0]}
                </p>
              </div>
            </div>

            {/* Center: Playback Controls */}
            <div className="flex items-center space-x-4">
              {/* Skip Back */}
              <button 
                onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                <SkipBack className="w-5 h-5" />
              </button>
              
              {/* Play/Pause Button */}
              {isPlaying ? (
                <button
                  onClick={onStop}
                  className="p-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                >
                  <Pause className="w-6 h-6" />
                </button>
              ) : (
                <button
                  onClick={onPlay}
                  className="p-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                >
                  <Play className="w-6 h-6" />
                </button>
              )}
              
              {/* Skip Forward */}
              <button 
                onClick={() => setCurrentTime(Math.min(duration, currentTime + 10))}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={onDownload}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
              
              <button
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                title="Share"
              >
                <Share className="w-4 h-4" />
              </button>

              <button
                onClick={onToggleMinimize}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                title="Minimize"
              >
                <Minimize2 className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom Row: Interactive Timeline */}
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500 dark:text-gray-400 font-mono w-12">
              {formatTime(currentTime)}
            </span>
            
            <div 
              id="audio-timeline"
              className="flex-1 bg-gray-300 dark:bg-gray-600 rounded-full h-1.5 cursor-pointer relative"
              onMouseDown={handleMouseDown}
              onClick={handleTimelineInteraction}
            >
              <div 
                className="bg-gray-900 dark:bg-gray-100 h-1.5 rounded-full transition-all duration-150 relative"
                style={{ width: `${progressPercentage}%` }}
              >
                {/* Draggable thumb */}
                <div 
                  className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-gray-900 dark:bg-gray-100 rounded-full cursor-grab active:cursor-grabbing shadow-sm"
                  style={{ 
                    opacity: isDragging ? 1 : 0,
                    transition: 'opacity 0.2s ease'
                  }}
                />
              </div>
            </div>
            
            <span className="text-sm text-gray-500 dark:text-gray-400 font-mono w-12">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// Legacy Audio Player Component - REMOVED (using footer player now)

// Settings Tab Content
const SettingsTabContent = ({
  selectedVoice,
  setSelectedVoice,
  voiceStyle,
  setVoiceStyle,
  speechRate,
  setSpeechRate,
  pitch,
  setPitch,
  volume,
  setVolume
}: {
  selectedVoice: string
  setSelectedVoice: (voice: string) => void
  voiceStyle: string
  setVoiceStyle: (style: string) => void
  speechRate: number
  setSpeechRate: (value: number) => void
  pitch: number
  setPitch: (value: number) => void
  volume: number
  setVolume: (value: number) => void
}) => {
  const [voiceExpanded, setVoiceExpanded] = useState(true)
  const [speechExpanded, setSpeechExpanded] = useState(false)

  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto">
      {/* Voice Settings Section */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
        <button
          onClick={() => setVoiceExpanded(!voiceExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 rounded-t-lg"
        >
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Voice Settings
          </h3>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${voiceExpanded ? 'rotate-180' : ''}`} />
        </button>

        {voiceExpanded && (
          <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
            <VoiceSettings
              selectedVoice={selectedVoice}
              setSelectedVoice={setSelectedVoice}
              voiceStyle={voiceStyle}
              setVoiceStyle={setVoiceStyle}
            />
          </div>
        )}
      </div>

      {/* Speech Controls Section */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
        <button
          onClick={() => setSpeechExpanded(!speechExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 rounded-t-lg"
        >
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Speech Controls
          </h3>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${speechExpanded ? 'rotate-180' : ''}`} />
        </button>

        {speechExpanded && (
          <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
            <SpeechControlsSection
              speechRate={speechRate}
              setSpeechRate={setSpeechRate}
              pitch={pitch}
              setPitch={setPitch}
              volume={volume}
              setVolume={setVolume}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// History Tab Content
const HistoryTabContent = ({
  audioFiles,
  currentlyPlaying,
  onPlay,
  onStop,
  onDownload,
  onRemove,
  onClearAll
}: {
  audioFiles: any[]
  currentlyPlaying: string | null
  onPlay: (file: any) => void
  onStop: () => void
  onDownload: (file: any) => void
  onRemove: (id: string) => void
  onClearAll: () => void
}) => (
  <div className="p-4 h-full overflow-y-auto">
    <AudioFileManager
      audioFiles={audioFiles}
      currentlyPlaying={currentlyPlaying}
      onPlay={onPlay}
      onStop={onStop}
      onDownload={onDownload}
      onRemove={onRemove}
      onClearAll={onClearAll}
    />
  </div>
)

// Error Banner Component
const ErrorBanner = ({ 
  error, 
  onDismiss 
}: { 
  error: string
  onDismiss: () => void 
}) => (
  <div className="px-6 py-4">
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mr-2" />
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
        <button
          onClick={onDismiss}
          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
)

// Header Component
const Header = () => (
  <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
    <div className="px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 bg-black dark:bg-white rounded-md flex items-center justify-center">
            <Volume2 className="w-4 h-4 text-white dark:text-black" />
          </div>
          <h1 className="text-lg font-medium text-gray-900 dark:text-white">
            Prosodify Studio
          </h1>
        </div>
        
        <ThemeToggle />
      </div>
    </div>
  </header>
)

// How It Works Section Component
const HowItWorksSection = ({ onClose }: { onClose: () => void }) => (
  <div className="px-6 py-4">
    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800 relative">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 p-1 hover:bg-white dark:hover:bg-gray-700 rounded transition-colors duration-200"
        aria-label="Close how it works"
      >
        <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </button>
      
      <div className="flex items-center space-x-2 mb-3">
        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">How Prosodify Works</h2>
      </div>
      
      <div className="grid md:grid-cols-3 gap-4">
        <HowItWorksStep
          icon={<FileText className="w-3 h-3 text-blue-600 dark:text-blue-400" />}
          iconBg="bg-blue-100 dark:bg-blue-900/50"
          title="1. Enter Your Text"
          description="Type or paste up to 5,000 characters. Preview first 200 characters or generate the full audio."
        />
        
        <HowItWorksStep
          icon={<Mic className="w-3 h-3 text-purple-600 dark:text-purple-400" />}
          iconBg="bg-purple-100 dark:bg-purple-900/50"
          title="2. Customize Voice"
          description="Choose from 563 premium neural voices across 154 languages with 43 speaking styles."
        />
        
        <HowItWorksStep
          icon={<Headphones className="w-3 h-3 text-green-600 dark:text-green-400" />}
          iconBg="bg-green-100 dark:bg-green-900/50"
          title="3. Generate & Download"
          description="Get high-quality MP3 files instantly. Manage your audio library with play, download, and organize features."
        />
      </div>
    </div>
  </div>
)

// How It Works Step Component
const HowItWorksStep = ({ 
  icon, 
  iconBg, 
  title, 
  description 
}: { 
  icon: React.ReactNode
  iconBg: string
  title: string
  description: string 
}) => (
  <div className="flex items-start space-x-2">
    <div className={`w-5 h-5 ${iconBg} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
      {icon}
    </div>
    <div>
      <h3 className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-1">{title}</h3>
      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
    </div>
  </div>
)

// Text Input Section Component
interface TextStats {
  charCount: number
  isValid: boolean
  previewLength: number
  cost: string
  previewCost: string
}

const TextInputSection = ({
  text,
  setText,
  isGenerating,
  selectedVoice,
  textStats,
  handleGenerate,
  resetForm
}: {
  text: string
  setText: (text: string) => void
  isGenerating: boolean
  selectedVoice: string
  textStats: TextStats
  handleGenerate: (isPreview?: boolean) => void
  resetForm: () => void
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-300 flex flex-col h-full">
    <div className="relative flex-1 flex flex-col">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Start typing here or paste any text you want to turn into lifelike speech..."
        className="w-full flex-1 p-3 pr-10 text-sm border border-gray-200 dark:border-gray-600 rounded-md resize-none focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
        maxLength={5000}
        style={{ minHeight: '300px' }}
      />
      
      {/* Reset button - top right corner */}
      <button
        onClick={resetForm}
        className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-600"
        title="Reset form"
      >
        <X className="w-4 h-4" />
      </button>
      
      <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <span>{textStats.charCount} / 5,000 characters</span>
          <span className="mx-2">•</span>
          <span>${textStats.cost}</span>
        </div>
        
        <div className="flex space-x-2">
          <ActionButton
            onClick={() => handleGenerate(true)}
            disabled={isGenerating || !textStats.isValid || !selectedVoice}
            variant="secondary"
            icon={<Play className="w-3 h-3 mr-1" />}
            text={isGenerating ? 'Generating...' : 'Preview'}
          />

          <ActionButton
            onClick={() => handleGenerate(false)}
            disabled={isGenerating || !textStats.isValid || !selectedVoice}
            variant="primary"
            icon={<Download className="w-3 h-3 mr-1" />}
            text={isGenerating ? 'Generating...' : 'Generate'}
          />
        </div>
      </div>
    </div>
  </div>
)

// Action Button Component
const ActionButton = ({
  onClick,
  disabled,
  variant,
  icon,
  text
}: {
  onClick: () => void
  disabled: boolean
  variant: 'primary' | 'secondary'
  icon: React.ReactNode
  text: string
}) => {
  const baseClasses = "flex items-center px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
  const variantClasses = variant === 'primary' 
    ? "bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100"
    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses}`}
    >
      {icon}
      {text}
    </button>
  )
}

// Speech Controls Section Component
const SpeechControlsSection = ({
  speechRate,
  setSpeechRate,
  pitch,
  setPitch,
  volume,
  setVolume
}: {
  speechRate: number
  setSpeechRate: (value: number) => void
  pitch: number
  setPitch: (value: number) => void
  volume: number
  setVolume: (value: number) => void
}) => (
  <div className="space-y-4">
    <SliderControl
      label="Speech Rate"
      value={speechRate}
      onChange={setSpeechRate}
      min={0.5}
      max={2}
      step={0.1}
      leftLabel="Slower"
      rightLabel="Faster"
    />

    <SliderControl
      label="Pitch"
      value={pitch}
      onChange={setPitch}
      min={0.5}
      max={1.5}
      step={0.1}
      leftLabel="Lower"
      rightLabel="Higher"
    />

    <SliderControl
      label="Volume"
      value={volume}
      onChange={setVolume}
      min={0.2}
      max={1.5}
      step={0.1}
      leftLabel="Quieter"
      rightLabel="Louder"
    />
  </div>
)

// Slider Control Component
const SliderControl = ({
  label,
  value,
  onChange,
  min,
  max,
  step,
  leftLabel,
  rightLabel
}: {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
  leftLabel: string
  rightLabel: string
}) => {
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div>
      <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
        {label}
      </label>
      
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
      
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-full appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #000000 0%, #000000 ${percentage}%, #d1d5db ${percentage}%, #d1d5db 100%)`
          }}
        />
        <style jsx>{`
          .slider::-webkit-slider-thumb {
            appearance: none;
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: #ffffff;
            cursor: pointer;
            border: 3px solid #000000;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          
          .slider::-moz-range-thumb {
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: #ffffff;
            cursor: pointer;
            border: 3px solid #000000;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            appearance: none;
          }
          
          .dark .slider {
            background: linear-gradient(to right, #ffffff 0%, #ffffff ${percentage}%, #4b5563 ${percentage}%, #4b5563 100%) !important;
          }
          
          .dark .slider::-webkit-slider-thumb {
            background: #1f2937;
            border-color: #ffffff;
          }
          
          .dark .slider::-moz-range-thumb {
            background: #1f2937;
            border-color: #ffffff;
          }
        `}</style>
      </div>
    </div>
  )
}