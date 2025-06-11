import AudioFileManager from './AudioFileManager'
import { AudioFile } from '../TextToSpeechLogic'

interface HistoryTabContentProps {
  audioFiles: AudioFile[]
  currentlyPlaying: string | null
  onPlay: (file: AudioFile) => void
  onStop: () => void
  onDownload: (file: AudioFile) => void
  onRemove: (id: string) => void
  onClearAll: () => void
}

const HistoryTabContent = ({
  audioFiles,
  currentlyPlaying,
  onPlay,
  onStop,
  onDownload,
  onRemove,
  onClearAll
}: HistoryTabContentProps) => (
  <div className="p-4 h-full overflow-y-auto">
    <AudioFileManager
      audioFiles={audioFiles}
      currentlyPlaying={currentlyPlaying}
      onPlay={onPlay}
      onStop={onStop}
      onDownload={onDownload}
      onRemove={onRemove}
      onClearAll={onClearAll}
    />
  </div>
)

export default HistoryTabContent