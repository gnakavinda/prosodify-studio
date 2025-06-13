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
  currentTime?: number
  duration?: number
  onSeek?: (time: number) => void
}

const FooterAudioPlayer = ({
  audioFile,
  onPlay,
  onStop,
  onDownload,
  isPlaying,
  isMinimized,
  onToggleMinimize,
  onClose,
  currentTime = 0,
  duration = 0,
  onSeek
}: FooterAudioPlayerProps) => {
  const [isDragging, setIsDragging] = useState(false)
  const [dragTime, setDragTime] = useState(0)

  // Handle mouse move while dragging
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && duration && onSeek) {
      const timeline = document.getElementById('audio-timeline')
      if (timeline) {
        const rect = timeline.getBoundingClientRect()
        const clickX = e.clientX - rect.left
        const percentage = Math.max(0, Math.min(1, clickX / rect.width))
        const newTime = percentage * duration
        
        setDragTime(newTime)
        onSeek(newTime)
      }
    }
  }, [isDragging, duration, onSeek])

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

  // Format time from seconds to MM:SS
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Handle timeline click and drag
  const handleTimelineInteraction = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration || !onSeek) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const newTime = percentage * duration
    
    onSeek(newTime)
  }

  // Handle mouse down on timeline
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration || !onSeek) return
    
    setIsDragging(true)
    
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const newTime = percentage * duration
    
    setDragTime(newTime)
    onSeek(newTime)
  }

  // Skip functions
  const handleSkipBack = () => {
    if (onSeek && duration) {
      const newTime = Math.max(0, currentTime - 10)
      onSeek(newTime)
    }
  }

  const handleSkipForward = () => {
    if (onSeek && duration) {
      const newTime = Math.min(duration, currentTime + 10)
      onSeek(newTime)
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-xl transition-all duration-300 ease-in-out z-50">
      
      {/* Minimized View */}
      {isMinimized ? (
        <div className="px-6 py-1 flex items-center justify-center relative group">
          <div
            onClick={onToggleMinimize}
            className="w-32 h-1 bg-gray-900 dark:bg-gray-100 rounded-full cursor-pointer transition-all duration-200 group-hover:h-6 group-hover:w-40 group-hover:flex group-hover:items-center group-hover:justify-center group-hover:px-4 group-hover:bg-gray-900 dark:group-hover:bg-gray-100"
          >
            <span className="text-white dark:text-gray-900 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              Expand audio player
            </span>
          </div>
        </div>
      ) : (
        /* Expanded View */
        <div className="px-6 py-2">
          
          {/* Top Row: Info, Controls, Actions */}
          <div className="flex items-center justify-between mb-1.5">
            
            {/* Left: Audio Info */}
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <Volume2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xs font-medium text-gray-900 dark:text-gray-100">
                  {audioFile.name.replace(/^(Preview_|Full_)/, '')}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {audioFile.isPreview ? 'Preview' : 'Aria'} • Created {audioFile.timestamp.split(',')[0]}
                </p>
              </div>
            </div>

            {/* Center: Playback Controls */}
            <div className="flex items-center space-x-2">
              {/* Skip Back */}
              <button 
                onClick={handleSkipBack}
                disabled={!duration || !onSeek}
                className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors disabled:opacity-50"
              >
                <SkipBack className="w-4 h-4" />
              </button>
              
              {/* Play/Pause Button */}
              {isPlaying ? (
                <button
                  onClick={onStop}
                  className="p-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                >
                  <Pause className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={onPlay}
                  className="p-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                >
                  <Play className="w-4 h-4" />
                </button>
              )}
              
              {/* Skip Forward */}
              <button 
                onClick={handleSkipForward}
                disabled={!duration || !onSeek}
                className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors disabled:opacity-50"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center space-x-1">
              {/* Download button - only show for full clips, not previews */}
              {!audioFile.isPreview && (
                <button
                  onClick={onDownload}
                  className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                  title="Download"
                >
                  <Download className="w-3 h-3" />
                </button>
              )}
              
              <button
                className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                title="Share"
              >
                <Share className="w-3 h-3" />
              </button>

              <button
                onClick={onToggleMinimize}
                className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                title="Minimize"
              >
                <Minimize2 className="w-3 h-3" />
              </button>

              <button
                onClick={onClose}
                className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                title="Close"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Bottom Row: Interactive Timeline */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-mono w-10">
              {formatTime(isDragging ? dragTime : currentTime)}
            </span>
            
            <div 
              id="audio-timeline"
              className="flex-1 bg-gray-300 dark:bg-gray-600 rounded-full h-1 cursor-pointer relative"
              onMouseDown={handleMouseDown}
              onClick={handleTimelineInteraction}
            >
              <div 
                className="bg-gray-900 dark:bg-gray-100 h-1 rounded-full transition-all duration-150 relative"
                style={{ width: `${duration ? ((isDragging ? dragTime : currentTime) / duration) * 100 : 0}%` }}
              >
                {/* Draggable thumb */}
                <div 
                  className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-gray-900 dark:bg-gray-100 rounded-full cursor-grab active:cursor-grabbing shadow-sm"
                  style={{ 
                    opacity: duration ? 1 : 0,
                    transition: 'opacity 0.2s ease'
                  }}
                />
              </div>
            </div>
            
            <span className="text-xs text-gray-500 dark:text-gray-400 font-mono w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default FooterAudioPlayer