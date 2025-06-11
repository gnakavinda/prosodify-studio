'use client'

import { useState, useEffect } from 'react'
import { Settings, History } from 'lucide-react'
import { useTextToSpeechLogic, AudioFile } from './TextToSpeechLogic'

// Component imports
import Header from './components/Header'
import HowItWorksSection from './components/HowItWorksSection'
import ErrorBanner from './components/ErrorBanner'
import TextInputSection from './components/TextInputSection'
import SettingsTabContent from './components/SettingsTabContent'
import HistoryTabContent from './components/HistoryTabContent'
import FooterAudioPlayer from './components/FooterAudioPlayer'

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

  // State for right panel tabs
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
          currentTime={audioCurrentTime}
          duration={audioDuration}
          onSeek={handleSeek}
        />
      )}
    </div>
  )
}