import { useState, useEffect, useCallback } from 'react'
import { Play, Download, Volume2, X, Pause, SkipBack, SkipForward, Share, Minimize2 } from 'lucide-react'
import { AudioFile } from '../TextToSpeechLogic'

interface FooterAudioPlayerProps {
  audioFile: AudioFile
  onPlay: () => void
  onStop: () => void
  onDownload: () => void
  isPlaying: boolean
  isMinimized: boolean
  onToggleMinimize: () => void
  onClose: () => void
}

const FooterAudioPlayer = ({
  audioFile,
  onPlay,
  onStop,
  onDownload,
  isPlaying,
  isMinimized,
  onToggleMinimize,
  onClose
}: FooterAudioPlayerProps) => {
  const [currentTime, setCurrentTime] = useState(6) // Current time in seconds
  const [duration] = useState(48) // Total duration in seconds
  const [isDragging, setIsDragging] = useState(false)

  // Format time from seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Handle timeline click and drag
  const handleTimelineInteraction = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const newTime = Math.round(percentage * duration)
    setCurrentTime(Math.max(0, Math.min(newTime, duration)))
  }

  // Handle mouse down on timeline
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true)
    handleTimelineInteraction(e)
  }

  // Handle mouse move while dragging
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const timeline = document.getElementById('audio-timeline')
      if (timeline) {
        const rect = timeline.getBoundingClientRect()
        const clickX = e.clientX - rect.left
        const percentage = clickX / rect.width
        const newTime = Math.round(percentage * duration)
        setCurrentTime(Math.max(0, Math.min(newTime, duration)))
      }
    }
  }, [isDragging, duration])

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  // Calculate progress percentage
  const progressPercentage = (currentTime / duration) * 100

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-xl transition-all duration-300 ease-in-out z-50">
      
      {/* Minimized View */}
      {isMinimized ? (
        <div className="px-6 py-2 flex items-center justify-center relative group">
          <div
            onClick={onToggleMinimize}
            className="w-32 h-1 bg-gray-900 dark:bg-gray-100 rounded-full cursor-pointer transition-all duration-200 group-hover:h-8 group-hover:w-40 group-hover:flex group-hover:items-center group-hover:justify-center group-hover:px-4 group-hover:bg-gray-900 dark:group-hover:bg-gray-100"
          >
            <span className="text-white dark:text-gray-900 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              Expand audio player
            </span>
          </div>
        </div>
      ) : (
        /* Expanded View */
        <div className="px-6 py-4">
          
          {/* Top Row: Info, Controls, Actions */}
          <div className="flex items-center justify-between mb-3">
            
            {/* Left: Audio Info */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <Volume2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {audioFile.name.replace(/^(Preview_|Full_)/, '')}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {audioFile.isPreview ? 'Preview' : 'Aria'} • Created {audioFile.timestamp.split(',')[0]}
                </p>
              </div>
            </div>

            {/* Center: Playback Controls */}
            <div className="flex items-center space-x-4">
              {/* Skip Back */}
              <button 
                onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                <SkipBack className="w-5 h-5" />
              </button>
              
              {/* Play/Pause Button */}
              {isPlaying ? (
                <button
                  onClick={onStop}
                  className="p-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                >
                  <Pause className="w-6 h-6" />
                </button>
              ) : (
                <button
                  onClick={onPlay}
                  className="p-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                >
                  <Play className="w-6 h-6" />
                </button>
              )}
              
              {/* Skip Forward */}
              <button 
                onClick={() => setCurrentTime(Math.min(duration, currentTime + 10))}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={onDownload}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
              
              <button
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                title="Share"
              >
                <Share className="w-4 h-4" />
              </button>

              <button
                onClick={onToggleMinimize}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                title="Minimize"
              >
                <Minimize2 className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom Row: Interactive Timeline */}
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500 dark:text-gray-400 font-mono w-12">
              {formatTime(currentTime)}
            </span>
            
            <div 
              id="audio-timeline"
              className="flex-1 bg-gray-300 dark:bg-gray-600 rounded-full h-1.5 cursor-pointer relative"
              onMouseDown={handleMouseDown}
              onClick={handleTimelineInteraction}
            >
              <div 
                className="bg-gray-900 dark:bg-gray-100 h-1.5 rounded-full transition-all duration-150 relative"
                style={{ width: `${progressPercentage}%` }}
              >
                {/* Draggable thumb */}
                <div 
                  className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-gray-900 dark:bg-gray-100 rounded-full cursor-grab active:cursor-grabbing shadow-sm"
                  style={{ 
                    opacity: isDragging ? 1 : 0,
                    transition: 'opacity 0.2s ease'
                  }}
                />
              </div>
            </div>
            
            <span className="text-sm text-gray-500 dark:text-gray-400 font-mono w-12">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default FooterAudioPlayer