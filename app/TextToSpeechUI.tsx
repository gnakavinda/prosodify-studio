'use client'

import { useState, useEffect } from 'react'
import { Settings, History } from 'lucide-react'
import { useTextToSpeechLogic, AudioFile } from './TextToSpeechLogic'
import { useAuth } from './contexts/AuthContext'

// Component imports
import Sidebar from './components/Sidebar'
import UserHeader from './components/UserHeader'
import HowItWorksSection from './components/HowItWorksSection'
import ErrorBanner from './components/ErrorBanner'
import TextInputSection from './components/TextInputSection'
import SettingsTabContent from './components/SettingsTabContent'
import HistoryTabContent from './components/HistoryTabContent'
import FooterAudioPlayer from './components/FooterAudioPlayer'

export default function TextToSpeechUI() {
  const { user, usage, refreshUserData } = useAuth()
  
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
    audioCurrentTime,
    audioDuration,
    handleGenerate,
    handlePlay,
    handleStop,
    handleSeek,
    handleDownload,
    handleRemoveFile,
    handleClearAllFiles,
    resetForm,
    dismissError,
    getTextStats
  } = useTextToSpeechLogic()

  // State for sidebar navigation
  const [activeSection, setActiveSection] = useState('text')
  
  // State for right panel tabs (only used in text section)
  const [activeTab, setActiveTab] = useState<'settings' | 'history'>('settings')
  
  // State for footer audio player  
  const [showPlayer, setShowPlayer] = useState(false)
  const [isPlayerMinimized, setIsPlayerMinimized] = useState(false)
  const [lastPlayedAudio, setLastPlayedAudio] = useState<AudioFile | null>(null)

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
        handlePlay(latestAudio)
      }
    }
  }, [audioFiles, currentlyPlaying, handlePlay])

  // Refresh usage data after successful TTS generation
  useEffect(() => {
    if (audioFiles.length > 0) {
      const latestAudio = audioFiles[audioFiles.length - 1]
      const now = new Date()
      const audioTime = new Date(latestAudio.timestamp)
      const timeDiff = now.getTime() - audioTime.getTime()
      
      // If this is a new audio file, refresh usage data
      if (timeDiff < 2000) {
        refreshUserData()
      }
    }
  }, [audioFiles, refreshUserData])

  // Get the audio file to display in player (current or last played)
  const playerAudioFile = currentAudioFile || lastPlayedAudio

  // Check if user is approaching limit
  const isNearLimit = usage ? (usage.current / usage.limit) > 0.8 : false

  // Render placeholder for non-text sections
  const renderPlaceholderSection = () => {
    const sidebarItems = [
      { id: 'text', label: 'Text', description: 'Text-to-Speech' },
      { id: 'document', label: 'Document', description: 'Upload Files' },
      { id: 'library', label: 'Library', description: 'Audio Library' },
      { id: 'voice-cloning', label: 'Voice Cloning', description: 'Clone Voices' },
      { id: 'favorites', label: 'Favorites', description: 'Saved Items' },
      { id: 'upgrade', label: 'Upgrade', description: 'Premium Features' },
      { id: 'apps', label: 'Apps', description: 'Integrations' },
      { id: 'account', label: 'Account', description: 'User Settings' }
    ]

    const currentItem = sidebarItems.find(item => item.id === activeSection)
    
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-tertiary rounded-full mx-auto mb-4 flex items-center justify-center">
            <div className="w-8 h-8 text-muted">
              {/* Icon placeholder */}
              <div className="w-full h-full bg-accent rounded"></div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-primary mb-2">
            {currentItem?.label}
          </h2>
          <p className="text-tertiary mb-8">
            {currentItem?.description} coming soon...
          </p>
          <button
            onClick={() => setActiveSection('text')}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
          >
            Back to Text-to-Speech
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary transition-colors duration-300 flex" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      
      {/* Sidebar */}
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        
        {/* User Header */}
        <UserHeader />

        {/* How It Works Section */}
        {showHowItWorks && (
          <HowItWorksSection onClose={() => setShowHowItWorks(false)} />
        )}

        {/* Usage Warning Banner */}
        {isNearLimit && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  ⚠️ You&apos;re approaching your monthly limit ({usage?.current.toLocaleString()} / {usage?.limit.toLocaleString()} characters used).
                  {user?.subscriptionStatus === 'free' && ' Consider upgrading your plan.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <ErrorBanner error={error} onDismiss={dismissError} />
        )}

        {/* Content based on active section */}
        {activeSection === 'text' ? (
          /* Text-to-Speech Interface */
          <div className="px-6 py-6 flex-1">
            <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)]">
              
              {/* Left Column - Text Input (60% width) */}
              <div className="flex-[0_0_60%] flex flex-col">
                <TextInputSection
                  text={text}
                  setText={setText}
                  isGenerating={isGenerating}
                  selectedVoice={selectedVoice}
                  voiceStyle={voiceStyle}
                  speechRate={speechRate}
                  pitch={pitch}
                  volume={volume}
                  textStats={textStats}
                  handleGenerate={handleGenerate}
                  resetForm={resetForm}
                />
              </div>

              {/* Right Column - Tabbed Panel (40% width) */}
              <div className="flex-[0_0_40%] flex flex-col">
                
                {/* Tab Navigation */}
                <div className="bg-secondary rounded-t-lg border border-primary border-b-0">
                  <div className="flex">
                    <button
                      onClick={() => setActiveTab('settings')}
                      className={`flex-1 px-4 py-3 text-sm font-medium rounded-tl-lg transition-colors ${
                        activeTab === 'settings'
                          ? 'bg-secondary text-primary border-b-2 border-blue-500'
                          : 'bg-tertiary text-tertiary hover-text'
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
                          ? 'bg-secondary text-primary border-b-2 border-blue-500'
                          : 'bg-tertiary text-tertiary hover-text'
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
                <div className="bg-secondary rounded-b-lg border border-primary flex-1 overflow-hidden">
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
        ) : (
          /* Other sections - placeholder content */
          renderPlaceholderSection()
        )}

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
            currentTime={audioCurrentTime}
            duration={audioDuration}
            onSeek={handleSeek}
          />
        )}
      </div>
    </div>
  )
}