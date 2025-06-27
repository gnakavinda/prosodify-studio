import { Play, Download, X, Volume2 } from 'lucide-react'

interface TextStats {
  charCount: number
  isValid: boolean
  previewLength: number
  cost: string
  previewCost: string
}

interface TextInputSectionProps {
  text: string
  setText: (text: string) => void
  isGenerating: boolean
  selectedVoice: string
  voiceStyle: string
  speechRate: number
  pitch: number
  volume: number
  textStats: TextStats
  handleGenerate: (isPreview?: boolean) => void
  resetForm: () => void
}

const TextInputSection = ({
  text,
  setText,
  isGenerating,
  selectedVoice,
  voiceStyle,
  speechRate,
  pitch,
  volume,
  textStats,
  handleGenerate,
  resetForm
}: TextInputSectionProps) => {
  // Show info area when user has typed something
  const showInfoArea = text.trim().length > 0

  // Get voice display name from selected voice ID
  const getVoiceDisplayName = (voiceId: string) => {
    if (!voiceId) return 'No voice selected'
    
    // Extract the voice name from the ID (assuming format like "en-US-AriaNeural")
    const parts = voiceId.split('-')
    if (parts.length >= 3) {
      const voiceName = parts[parts.length - 1].replace('Neural', '')
      const locale = `${parts[0]}-${parts[1]}`
      return `${voiceName} (${locale})`
    }
    
    return voiceId
  }

  return (
    <div className="bg-secondary border border-primary p-4 transition-colors duration-300 flex flex-col h-full rounded-lg">
      
      {/* Dynamic Parameter Information Area */}
      <div 
        className={`h-10 overflow-hidden transition-all duration-500 ease-in-out ${
          showInfoArea 
            ? 'opacity-100 mb-3' 
            : 'opacity-0 mb-0'
        }`}
      >
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg px-3 py-2 border border-blue-100 dark:border-blue-800 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Left: Title with icon */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Volume2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium text-primary">
                Current Settings
              </span>
            </div>
            
            {/* Center: Parameters in a single row */}
            <div className="flex items-center space-x-4 text-xs flex-1 min-w-0 mx-4">
              {/* Voice */}
              <div className="flex items-center space-x-1 min-w-0">
                <span className="text-muted flex-shrink-0">Voice:</span>
                <span className="font-medium text-primary truncate">
                  {getVoiceDisplayName(selectedVoice)}
                </span>
              </div>
              
              {/* Style */}
              <div className="flex items-center space-x-1 flex-shrink-0">
                <span className="text-muted">Style:</span>
                <span className="font-medium text-primary capitalize">
                  {voiceStyle.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </div>
              
              {/* Speed */}
              <div className="flex items-center space-x-1 flex-shrink-0">
                <span className="text-muted">Speed:</span>
                <span className="font-medium text-primary">
                  {speechRate}x
                </span>
              </div>
              
              {/* Pitch */}
              <div className="flex items-center space-x-1 flex-shrink-0">
                <span className="text-muted">Pitch:</span>
                <span className="font-medium text-primary">
                  {pitch}x
                </span>
              </div>
              
              {/* Volume */}
              <div className="flex items-center space-x-1 flex-shrink-0">
                <span className="text-muted">Volume:</span>
                <span className="font-medium text-primary">
                  {volume}x
                </span>
              </div>
            </div>
            
            {/* Right: Status */}
            <div className="flex-shrink-0">
              <span className="text-blue-600 dark:text-blue-400 font-medium text-xs">
                Ready to generate
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Text Input Area */}
      <div className="relative flex-1 flex flex-col">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing here or paste any text you want to turn into lifelike speech..."
          className="w-full flex-1 p-3 pr-10 text-sm border border-secondary rounded-md resize-none focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition-all bg-primary text-primary placeholder-text-muted"
          maxLength={5000}
          style={{ minHeight: '300px' }}
        />
        
        {/* Reset button - top right corner */}
        <button
          onClick={resetForm}
          className="absolute top-3 right-3 p-1 text-muted hover-text transition-colors rounded-md hover-bg"
          title="Reset form"
        >
          <X className="w-4 h-4" />
        </button>
        
        {/* Bottom controls */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
          <div className="text-xs text-muted">
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
}

interface ActionButtonProps {
  onClick: () => void
  disabled: boolean
  variant: 'primary' | 'secondary'
  icon: React.ReactNode
  text: string
}

const ActionButton = ({
  onClick,
  disabled,
  variant,
  icon,
  text
}: ActionButtonProps) => {
  const baseClasses = "flex items-center px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
  const variantClasses = variant === 'primary' 
    ? "bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100"
    : "bg-tertiary text-secondary hover:bg-accent"
  
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

export default TextInputSection