'use client'

import { Play, Download, Volume2, X, Info, Mic, FileText, Headphones, ChevronDown, ChevronRight, Settings, Sliders, AlertCircle } from 'lucide-react'
import { useState } from 'react'
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

  // State for collapsible sections
  const [expandedSection, setExpandedSection] = useState<'voice' | 'speech' | null>('voice')

  const toggleSection = (section: 'voice' | 'speech') => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  // Get text statistics
  const textStats = getTextStats()

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

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Text Input */}
          <div className="lg:col-span-2 space-y-6">
            <TextInputSection
              text={text}
              setText={setText}
              isGenerating={isGenerating}
              selectedVoice={selectedVoice}
              textStats={textStats}
              handleGenerate={handleGenerate}
              resetForm={resetForm}
            />

            {/* Audio File Manager */}
            <AudioFileManager
              audioFiles={audioFiles}
              currentlyPlaying={currentlyPlaying}
              onPlay={handlePlay}
              onStop={handleStop}
              onDownload={handleDownload}
              onRemove={handleRemoveFile}
              onClearAll={handleClearAllFiles}
            />
          </div>

          {/* Right Column - Collapsible Controls */}
          <div className="space-y-4">
            
            {/* Voice Settings Section */}
            <CollapsibleSection
              title="Voice Settings"
              icon={<Settings className="w-4 h-4" />}
              isExpanded={expandedSection === 'voice'}
              onToggle={() => toggleSection('voice')}
              badge={selectedVoice ? '✓' : '!'}
            >
              <VoiceSettings
                selectedVoice={selectedVoice}
                setSelectedVoice={setSelectedVoice}
                voiceStyle={voiceStyle}
                setVoiceStyle={setVoiceStyle}
              />
            </CollapsibleSection>

            {/* Speech Controls Section */}
            <CollapsibleSection
              title="Speech Controls"
              icon={<Sliders className="w-4 h-4" />}
              isExpanded={expandedSection === 'speech'}
              onToggle={() => toggleSection('speech')}
              badge={speechRate !== 1 || pitch !== 1 || volume !== 1 ? '●' : ''}
            >
              <SpeechControlsSection
                speechRate={speechRate}
                setSpeechRate={setSpeechRate}
                pitch={pitch}
                setPitch={setPitch}
                volume={volume}
                setVolume={setVolume}
              />
            </CollapsibleSection>

            {/* Quick Actions Panel */}
            <QuickActionsPanel
              onShowHowItWorks={() => setShowHowItWorks(true)}
              onResetForm={resetForm}
              textStats={textStats}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Error Banner Component
const ErrorBanner = ({ 
  error, 
  onDismiss 
}: { 
  error: string
  onDismiss: () => void 
}) => (
  <div className="max-w-6xl mx-auto px-4 py-4">
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

// Collapsible Section Component
const CollapsibleSection = ({ 
  title, 
  icon, 
  isExpanded, 
  onToggle, 
  children,
  badge
}: {
  title: string
  icon: React.ReactNode
  isExpanded: boolean
  onToggle: () => void
  children: React.ReactNode
  badge?: string
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300 overflow-hidden">
    {/* Header - Always visible */}
    <button
      onClick={onToggle}
      className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
    >
      <div className="flex items-center space-x-2">
        <div className="text-gray-600 dark:text-gray-400">
          {icon}
        </div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {title}
        </h3>
        {badge && (
          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded">
            {badge}
          </span>
        )}
      </div>
      
      <div className="text-gray-400 dark:text-gray-500">
        {isExpanded ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </div>
    </button>

    {/* Content - Expandable */}
    <div className={`transition-all duration-300 ease-in-out ${
      isExpanded 
        ? 'max-h-[800px] opacity-100' 
        : 'max-h-0 opacity-0'
    } overflow-hidden`}>
      <div className="px-4 pb-4">
        {children}
      </div>
    </div>
  </div>
)

// Header Component
const Header = () => (
  <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
    <div className="max-w-6xl mx-auto px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 bg-black dark:bg-white rounded-md flex items-center justify-center">
            <Volume2 className="w-4 h-4 text-white dark:text-black" />
          </div>
          <h1 className="text-lg font-medium text-gray-900 dark:text-white">
            Prosodify Studio
          </h1>
        </div>
        
        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </div>
  </header>
)

// How It Works Section Component
const HowItWorksSection = ({ onClose }: { onClose: () => void }) => (
  <div className="max-w-6xl mx-auto px-4 py-4">
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
  textStats: any
  handleGenerate: (isPreview?: boolean) => void
  resetForm: () => void
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-300">
    <div className="flex items-center justify-between mb-3">
      <button
        onClick={resetForm}
        className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
      >
      </button>
    </div>
    
    <div className="relative">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type or paste your text here..."
        className="w-full h-48 p-3 text-sm border border-gray-200 dark:border-gray-600 rounded-md resize-none focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
        maxLength={5000}
      />
      
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
            text={isGenerating ? 'Generating...' : 'Generate speech'}
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
      {/* Main label on top */}
      <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
        {label}
      </label>
      
      {/* Left and right labels above slider */}
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
      
      {/* Slider */}
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

// Quick Actions Panel Component
const QuickActionsPanel = ({
  onShowHowItWorks,
  onResetForm,
  textStats
}: {
  onShowHowItWorks: () => void
  onResetForm: () => void
  textStats: any
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-300">
    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Quick Actions</h3>
    
    <div className="space-y-2">
      <button
        onClick={onShowHowItWorks}
        className="w-full text-left p-2 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
      >
        <div className="flex items-center">
          <Info className="w-3 h-3 text-gray-600 dark:text-gray-400 mr-2" />
          <div>
            <div className="text-xs font-medium text-gray-900 dark:text-gray-100">How It Works</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Learn how to use Prosodify</div>
          </div>
        </div>
      </button>

      <div className="p-2 rounded-md bg-gray-50 dark:bg-gray-700">
        <div className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-1">Statistics</div>
        <div className="space-y-0.5 text-xs text-gray-600 dark:text-gray-400">
          <div>• 563 voices available</div>
          <div>• 154 languages supported</div>
          <div>• 43 speaking styles</div>
          <div>• Characters: {textStats.charCount}/5,000</div>
        </div>
      </div>
    </div>
  </div>
)