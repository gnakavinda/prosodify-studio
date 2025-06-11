import { AlertCircle, X } from 'lucide-react'

interface ErrorBannerProps {
  error: string
  onDismiss: () => void
}

const ErrorBanner = ({ 
  error, 
  onDismiss 
}: ErrorBannerProps) => (
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

export default ErrorBanner