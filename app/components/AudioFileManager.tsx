'use client'

import { Music, X, Play, Square, Download } from 'lucide-react'

interface AudioFile {
  id: string
  name: string
  url: string
  isPreview: boolean
  timestamp: string
}

interface AudioFileManagerProps {
  audioFiles: AudioFile[]
  currentlyPlaying: string | null
  onPlay: (audioFile: AudioFile) => void
  onStop: () => void
  onDownload: (audioFile: AudioFile) => void
  onRemove: (audioId: string) => void
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
    return null
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center">
          <Music className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
          Generated Audio Files ({audioFiles.length})
        </h3>
        <button
          onClick={onClearAll}
          className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-sm"
        >
          Clear All
        </button>
      </div>
      
      <div className="overflow-hidden">
        <table className="w-full">
          <tbody>
            {audioFiles.map((audioFile) => (
              <tr key={audioFile.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="py-3 px-3">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {audioFile.name}
                        {audioFile.isPreview ? (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                            Preview
                          </span>
                        ) : (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                            Full Audio
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{audioFile.timestamp}</div>
                    </div>
                    {currentlyPlaying === audioFile.id && (
                      <div className="ml-3 w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></div>
                    )}
                  </div>
                </td>
                <td className="py-3 px-3 text-center">
                  <button
                    onClick={() => onPlay(audioFile)}
                    disabled={currentlyPlaying === audioFile.id}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors disabled:opacity-50"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                </td>
                <td className="py-3 px-3 text-center">
                  <button
                    onClick={onStop}
                    disabled={currentlyPlaying !== audioFile.id}
                    className="p-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors disabled:opacity-50"
                  >
                    <Square className="w-4 h-4" />
                  </button>
                </td>
                <td className="py-3 px-3 text-center">
                  <button
                    onClick={() => onDownload(audioFile)}
                    className="p-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </td>
                <td className="py-3 px-3 text-center">
                  <button
                    onClick={() => onRemove(audioFile.id)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}