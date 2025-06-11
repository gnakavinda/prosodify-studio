import { X, Info, FileText, Mic, Headphones } from 'lucide-react'

interface HowItWorksSectionProps {
  onClose: () => void
}

const HowItWorksSection = ({ onClose }: HowItWorksSectionProps) => (
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

interface HowItWorksStepProps {
  icon: React.ReactNode
  iconBg: string
  title: string
  description: string
}

const HowItWorksStep = ({ 
  icon, 
  iconBg, 
  title, 
  description 
}: HowItWorksStepProps) => (
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

export default HowItWorksSection