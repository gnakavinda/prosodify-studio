'use client'

import { Play, Download, Volume2, X, Info, Mic, FileText, Headphones, ChevronDown, ChevronRight, Settings, Sliders } from 'lucide-react'
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
    handleGenerate,
    handlePlay,
    handleStop,
    handleDownload,
    handleRemoveFile,
    handleClearAllFiles
  } = useTextToSpeechLogic()

  // State for collapsible sections
  const [expandedSection, setExpandedSection] = useState<'voice' | 'speech' | null>('voice')

  const toggleSection = (section: 'voice' | 'speech') => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Header */}
      <Header />

      {/* How It Works Section */}
      {showHowItWorks && (
        <HowItWorksSection onClose={() => setShowHowItWorks(false)} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Text Input */}
          <div className="lg:col-span-2 space-y-6">
            <TextInputSection
              text={text}
              setText={setText}
              isGenerating={isGenerating}
              selectedVoice={selectedVoice}
              handleGenerate={handleGenerate}
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
              icon={<Settings className="w-5 h-5" />}
              isExpanded={expandedSection === 'voice'}
              onToggle={() => toggleSection('voice')}
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
              icon={<Sliders className="w-5 h-5" />}
              isExpanded={expandedSection === 'speech'}
              onToggle={() => toggleSection('speech')}
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
          </div>
        </div>
      </div>
    </div>
  )
}

// Collapsible Section Component
const CollapsibleSection = ({ 
  title, 
  icon, 
  isExpanded, 
  onToggle, 
  children 
}: {
  title: string
  icon: React.ReactNode
  isExpanded: boolean
  onToggle: () => void
  children: React.ReactNode
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300 overflow-hidden">
    {/* Header - Always visible */}
    <button
      onClick={onToggle}
      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
    >
      <div className="flex items-center space-x-3">
        <div className="text-blue-600 dark:text-blue-400">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h3>
      </div>
      
      <div className="text-gray-400 dark:text-gray-500">
        {isExpanded ? (
          <ChevronDown className="w-5 h-5" />
        ) : (
          <ChevronRight className="w-5 h-5" />
        )}
      </div>
    </button>

    {/* Content - Expandable */}
    <div className={`transition-all duration-300 ease-in-out ${
      isExpanded 
        ? 'max-h-[800px] opacity-100' 
        : 'max-h-0 opacity-0'
    } overflow-hidden`}>
      <div className="px-6 pb-6">
        {children}
      </div>
    </div>
  </div>
)

// Header Component
const Header = () => (
  <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 transition-colors duration-300">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Volume2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Prosodify Studio
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Professional Text-to-Speech Generator</p>
          </div>
        </div>
        
        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </div>
  </header>
)

// How It Works Section Component
const HowItWorksSection = ({ onClose }: { onClose: () => void }) => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800 relative transition-colors duration-300">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-1 hover:bg-white dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
        aria-label="Close how it works"
      >
        <X className="w-5 h-5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" />
      </button>
      
      <div className="flex items-center space-x-2 mb-4">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">How Prosodify Works</h2>
      </div>
      
      <div className="grid md:grid-cols-3 gap-4">
        <HowItWorksStep
          icon={<FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
          iconBg="bg-blue-100 dark:bg-blue-900/50"
          title="1. Enter Your Text"
          description="Type or paste up to 5,000 characters. Preview first 200 characters or generate the full audio."
        />
        
        <HowItWorksStep
          icon={<Mic className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
          iconBg="bg-purple-100 dark:bg-purple-900/50"
          title="2. Customize Voice"
          description="Choose from premium neural voices, styles, and adjust speech rate, pitch, and volume."
        />
        
        <HowItWorksStep
          icon={<Headphones className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />}
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
  <div className="flex items-start space-x-3">
    <div className={`w-7 h-7 ${iconBg} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
      {icon}
    </div>
    <div>
      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">{title}</h3>
      <p className="text-xs text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  </div>
)

// Text Input Section Component
const TextInputSection = ({
  text,
  setText,
  isGenerating,
  selectedVoice,
  handleGenerate
}: {
  text: string
  setText: (text: string) => void
  isGenerating: boolean
  selectedVoice: string
  handleGenerate: (isPreview?: boolean) => void
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
    <div className="relative">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter your text here... You can write up to 5,000 characters for speech synthesis."
        className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-4 pb-16 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
        maxLength={5000}
      />
      
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <span>Characters: {text.length}/5,000</span>
          <span className="ml-4">Cost: ${(text.length * 0.000015).toFixed(4)}</span>
        </div>
        
        <div className="flex space-x-3">
          <ActionButton
            onClick={() => handleGenerate(true)}
            disabled={isGenerating || !text.trim() || !selectedVoice}
            variant="secondary"
            icon={<Play className="w-4 h-4 mr-1" />}
            text={isGenerating ? '...' : 'Preview'}
          />

          <ActionButton
            onClick={() => handleGenerate(false)}
            disabled={isGenerating || !text.trim() || !selectedVoice}
            variant="primary"
            icon={<Download className="w-4 h-4 mr-1" />}
            text={isGenerating ? '...' : 'Generate'}
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
  const baseClasses = "flex items-center px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
  const variantClasses = variant === 'primary' 
    ? "bg-blue-600 text-white hover:bg-blue-700"
    : "bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-500"
  
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

// Speech Controls Section Component (now used inside collapsible)
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
  <div className="space-y-6">
    <SliderControl
      label={`Speech Rate: ${speechRate.toFixed(1)}x`}
      value={speechRate}
      onChange={setSpeechRate}
      min={0.5}
      max={2}
      step={0.1}
      labels={['Slow', 'Normal', 'Fast']}
    />

    <SliderControl
      label={`Pitch: ${pitch.toFixed(1)}x`}
      value={pitch}
      onChange={setPitch}
      min={0.5}
      max={1.5}
      step={0.1}
      labels={['Low', 'Normal', 'High']}
    />

    <SliderControl
      label={`Volume: ${Math.round(volume * 100)}%`}
      value={volume}
      onChange={setVolume}
      min={0.2}
      max={1.5}
      step={0.1}
      labels={['Quiet', 'Normal', 'Loud']}
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
  labels
}: {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
  labels: string[]
}) => {
  // Calculate the percentage for the blue fill
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`
          }}
        />
        <style jsx>{`
          input[type="range"]::-webkit-slider-thumb {
            appearance: none;
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
            border: 2px solid #ffffff;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          
          input[type="range"]::-moz-range-thumb {
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
            border: 2px solid #ffffff;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            appearance: none;
          }
          
          .dark input[type="range"] {
            background: linear-gradient(to right, #60a5fa 0%, #60a5fa ${percentage}%, #374151 ${percentage}%, #374151 100%) !important;
          }
          
          .dark input[type="range"]::-webkit-slider-thumb {
            background: #60a5fa;
            border-color: #1f2937;
          }
          
          .dark input[type="range"]::-moz-range-thumb {
            background: #60a5fa;
            border-color: #1f2937;
          }
        `}</style>
      </div>
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
        {labels.map((label, index) => (
          <span key={index}>{label}</span>
        ))}
      </div>
    </div>
  )
}