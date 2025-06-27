'use client'

import { FileText, Upload, FolderOpen, Zap, Star, CreditCard, Grid3X3, User, Volume2 } from 'lucide-react'

interface SidebarItem {
  id: string
  icon: any
  label: string
  description: string
}

interface SidebarProps {
  activeSection: string
  setActiveSection: (section: string) => void
}

export default function Sidebar({ activeSection, setActiveSection }: SidebarProps) {
  const sidebarItems: SidebarItem[] = [
    { id: 'text', icon: FileText, label: 'Text', description: 'Text-to-Speech' },
    { id: 'document', icon: Upload, label: 'Document', description: 'Upload Files' },
    { id: 'library', icon: FolderOpen, label: 'Library', description: 'Audio Library' },
    { id: 'voice-cloning', icon: Zap, label: 'Voice Cloning', description: 'Clone Voices' },
    { id: 'favorites', icon: Star, label: 'Favorites', description: 'Saved Items' },
    { id: 'upgrade', icon: CreditCard, label: 'Upgrade', description: 'Premium Features' },
    { id: 'apps', icon: Grid3X3, label: 'Apps', description: 'Integrations' },
    { id: 'account', icon: User, label: 'Account', description: 'User Settings' }
  ]

  return (
    <div className="w-20 bg-primary shadow-lg flex flex-col border-r border-primary">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-primary">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
          <Volume2 className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 py-4">
        {sidebarItems.map((item) => {
          const IconComponent = item.icon
          const isActive = activeSection === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full h-16 flex flex-col items-center justify-center group relative transition-colors ${
                isActive 
                  ? 'sidebar-active' 
                  : 'text-tertiary hover-bg hover-text'
              }`}
              title={item.description}
            >
              <IconComponent className={`w-5 h-5 mb-1 transition-colors`} />
              <span className={`text-xs font-medium transition-colors`}>
                {item.label}
              </span>
              
              {/* Tooltip */}
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                {item.description}
              </div>
            </button>
          )
        })}
      </div>

      {/* Bottom section */}
      <div className="p-4 border-t border-primary">
        <div className="w-8 h-8 bg-accent rounded-full mx-auto flex items-center justify-center">
          <User className="w-4 h-4 text-tertiary" />
        </div>
      </div>
    </div>
  )
}