import { Volume2 } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

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

export default Header