// Fixed AudioFileManager component with correct prop types
'use client'

import { Play, Square, Download, Trash2 } from 'lucide-react'

// Match the EXACT AudioFile type from your TextToSpeechLogic.ts
interface AudioFile {
  id: string
  name: string
  url: string
  isPreview: boolean  // Required boolean, not optional
  timestamp: string   // String, not number
}

// Fixed prop types to match your TextToSpeechLogic expectations
interface AudioFileManagerProps {
  audioFiles: AudioFile[]
  currentlyPlaying: string | null
  onPlay: (audioFile: AudioFile) => void  // Updated to match TextToSpeechLogic
  onStop: () => void
  onDownload: (audioFile: AudioFile) => void  // This now matches exactly
  onRemove: (id: string) => void
  onClearAll: () => void
}

export default function AudioFileManager({
  audioFiles,
  currentlyPlaying,
  onPlay,
  onStop,
  onDownload,
  onRemove,
  onClearAll
}: AudioFileManagerProps) {
  if (audioFiles.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-300">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
          Generated Audio Files
        </h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p className="text-sm">No audio files generated yet.</p>
          <p className="text-xs mt-1">Generate your first audio file to see it here.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Generated Audio Files
        </h3>
        {audioFiles.length > 1 && (
          <button
            onClick={onClearAll}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Audio Files List */}
      <div className="space-y-1">
        {audioFiles.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600"
          >
            {/* File Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                  {file.name}
                </p>
                {currentlyPlaying === file.id && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400">
                    Playing
                  </span>
                )}
                {file.isPreview && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400">
                    Preview
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <span>{file.timestamp}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-1 ml-3">
              {/* Play/Stop Button */}
              {currentlyPlaying === file.id ? (
                <button
                  onClick={onStop}
                  className="p-1.5 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 rounded-md transition-colors"
                  title="Stop"
                >
                  <Square className="w-3 h-3" />
                </button>
              ) : (
                <button
                  onClick={() => onPlay(file)}
                  className="p-1.5 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 rounded-md transition-colors"
                  title="Play"
                >
                  <Play className="w-3 h-3" />
                </button>
              )}

              {/* Download Button - Disabled for previews */}
              {!file.isPreview && (
                <button
                  onClick={() => onDownload(file)}
                  className="p-1.5 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 rounded-md transition-colors"
                  title="Download"
                >
                  <Download className="w-3 h-3" />
                </button>
              )}

              {/* Remove Button */}
              <button
                onClick={() => onRemove(file.id)}
                className="p-1.5 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-md transition-colors"
                title="Remove"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Footer */}
      {audioFiles.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {audioFiles.length} audio file{audioFiles.length !== 1 ? 's' : ''} generated
          </p>
        </div>
      )}
    </div>
  )
}