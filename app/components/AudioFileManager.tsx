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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 flex items-center">
          <Music className="w-5 h-5 mr-2 text-blue-600" />
          Generated Audio Files ({audioFiles.length})
        </h3>
        <button
          onClick={onClearAll}
          className="text-gray-400 hover:text-gray-600 transition-colors text-sm"
        >
          Clear All
        </button>
      </div>
      
      <div className="overflow-hidden">
        <table className="w-full">
          <tbody>
            {audioFiles.map((audioFile) => (
              <tr key={audioFile.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-3">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {audioFile.name}
                        {audioFile.isPreview ? (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            Preview
                          </span>
                        ) : (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Full Audio
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{audioFile.timestamp}</div>
                    </div>
                    {currentlyPlaying === audioFile.id && (
                      <div className="ml-3 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                </td>
                <td className="py-3 px-3 text-center">
                  <button
                    onClick={() => onPlay(audioFile)}
                    disabled={currentlyPlaying === audioFile.id}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                </td>
                <td className="py-3 px-3 text-center">
                  <button
                    onClick={onStop}
                    disabled={currentlyPlaying !== audioFile.id}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                  >
                    <Square className="w-4 h-4" />
                  </button>
                </td>
                <td className="py-3 px-3 text-center">
                  <button
                    onClick={() => onDownload(audioFile)}
                    className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </td>
                <td className="py-3 px-3 text-center">
                  <button
                    onClick={() => onRemove(audioFile.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
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