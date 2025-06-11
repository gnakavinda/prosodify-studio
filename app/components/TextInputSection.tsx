import { Play, Download, X } from 'lucide-react'

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
  textStats: TextStats
  handleGenerate: (isPreview?: boolean) => void
  resetForm: () => void
}

const TextInputSection = ({
  text,
  setText,
  isGenerating,
  selectedVoice,
  textStats,
  handleGenerate,
  resetForm
}: TextInputSectionProps) => (
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

export default TextInputSection