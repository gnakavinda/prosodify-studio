import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import VoiceSettings from './VoiceSettings'
import SpeechControlsSection from './SpeechControlsSection'

interface SettingsTabContentProps {
  selectedVoice: string
  setSelectedVoice: (voice: string) => void
  voiceStyle: string
  setVoiceStyle: (style: string) => void
  speechRate: number
  setSpeechRate: (value: number) => void
  pitch: number
  setPitch: (value: number) => void
  volume: number
  setVolume: (value: number) => void
}

const SettingsTabContent = ({
  selectedVoice,
  setSelectedVoice,
  voiceStyle,
  setVoiceStyle,
  speechRate,
  setSpeechRate,
  pitch,
  setPitch,
  volume,
  setVolume
}: SettingsTabContentProps) => {
  const [voiceExpanded, setVoiceExpanded] = useState(true)
  const [speechExpanded, setSpeechExpanded] = useState(false)

  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto">
      {/* Voice Settings Section */}
      <div className="border border-primary rounded-lg overflow-hidden">
        <button
          onClick={() => setVoiceExpanded(!voiceExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between hover-bg transition-colors duration-200 rounded-t-lg"
        >
          <h3 className="text-sm font-medium text-primary">
            Voice Settings
          </h3>
          <ChevronDown className={`w-4 h-4 text-muted transition-transform duration-300 ease-in-out ${voiceExpanded ? 'rotate-180' : ''}`} />
        </button>

        <div 
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            voiceExpanded 
              ? 'max-h-96 opacity-100' 
              : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-4 pb-4 border-t border-primary">
            <VoiceSettings
              selectedVoice={selectedVoice}
              setSelectedVoice={setSelectedVoice}
              voiceStyle={voiceStyle}
              setVoiceStyle={setVoiceStyle}
            />
          </div>
        </div>
      </div>

      {/* Speech Controls Section */}
      <div className="border border-primary rounded-lg overflow-hidden">
        <button
          onClick={() => setSpeechExpanded(!speechExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between hover-bg transition-colors duration-200 rounded-t-lg"
        >
          <h3 className="text-sm font-medium text-primary">
            Speech Controls
          </h3>
          <ChevronDown className={`w-4 h-4 text-muted transition-transform duration-300 ease-in-out ${speechExpanded ? 'rotate-180' : ''}`} />
        </button>

        <div 
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            speechExpanded 
              ? 'max-h-80 opacity-100' 
              : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-4 pb-4 border-t border-primary">
            <SpeechControlsSection
              speechRate={speechRate}
              setSpeechRate={setSpeechRate}
              pitch={pitch}
              setPitch={setPitch}
              volume={volume}
              setVolume={setVolume}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsTabContent