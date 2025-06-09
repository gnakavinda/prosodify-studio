import { useState, useRef } from 'react'

export interface AudioFile {
  id: string
  name: string
  url: string
  isPreview: boolean
  timestamp: string
}

export const useTextToSpeechLogic = () => {
  // State management
  const [text, setText] = useState('')
  const [selectedVoice, setSelectedVoice] = useState('')
  const [voiceStyle, setVoiceStyle] = useState('neutral')
  const [speechRate, setSpeechRate] = useState(1)
  const [pitch, setPitch] = useState(1)
  const [volume, setVolume] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([])
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const [showHowItWorks, setShowHowItWorks] = useState(true)
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({})

  // Utility functions
  const generateFileName = (isPreview: boolean) => {
    const voiceName = selectedVoice.split('-')[2] || 'Unknown'
    const timestamp = new Date().toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(',', '').replace(/:/g, '-')
    
    const suffix = isPreview ? '_preview' : ''
    return `${voiceName}_${voiceStyle}_${timestamp}${suffix}`
  }

  // Core business logic
  const handleGenerate = async (isPreview = false) => {
    setIsGenerating(true);
    try {
      const textToUse = isPreview 
        ? text.substring(0, 200) + (text.length > 200 ? '...' : '')
        : text

      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: textToUse,
          voice: selectedVoice,
          style: voiceStyle,
          rate: speechRate,
          pitch: pitch,
          volume: volume
        }),
      });

      const data = await response.json();

      if (data.success) {
        const audioBlob = new Blob(
          [Uint8Array.from(atob(data.audio), c => c.charCodeAt(0))],
          { type: 'audio/mp3' }
        );
        const url = URL.createObjectURL(audioBlob);
        
        const fileName = generateFileName(isPreview)
        const newAudioFile: AudioFile = {
          id: Date.now().toString(),
          name: fileName,
          url: url,
          isPreview: isPreview,
          timestamp: new Date().toLocaleTimeString()
        }
        
        setAudioFiles(prev => [newAudioFile, ...prev])
        
        if (!isPreview) {
          const link = document.createElement('a');
          link.href = url;
          link.download = `${fileName}.mp3`;
          link.click();
        }
        
        const message = isPreview 
          ? 'Preview generated successfully!'
          : 'Audio generated successfully! Download started.'
        alert(message);
      } else {
        alert('Error generating audio: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error generating audio. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Audio playback management
  const handlePlay = (audioFile: AudioFile) => {
    if (currentlyPlaying && audioRefs.current[currentlyPlaying]) {
      audioRefs.current[currentlyPlaying].pause()
      audioRefs.current[currentlyPlaying].currentTime = 0
    }

    if (!audioRefs.current[audioFile.id]) {
      const audio = new Audio(audioFile.url)
      audio.onended = () => setCurrentlyPlaying(null)
      audioRefs.current[audioFile.id] = audio
    }

    audioRefs.current[audioFile.id].play()
    setCurrentlyPlaying(audioFile.id)
  }

  const handleStop = () => {
    if (currentlyPlaying && audioRefs.current[currentlyPlaying]) {
      audioRefs.current[currentlyPlaying].pause()
      audioRefs.current[currentlyPlaying].currentTime = 0
      setCurrentlyPlaying(null)
    }
  }

  // File management
  const handleDownload = (audioFile: AudioFile) => {
    const link = document.createElement('a');
    link.href = audioFile.url;
    link.download = `${audioFile.name}.mp3`;
    link.click();
  }

  const handleRemoveFile = (audioId: string) => {
    const audioFile = audioFiles.find(f => f.id === audioId)
    if (audioFile) {
      if (currentlyPlaying === audioId) {
        handleStop()
      }
      if (audioRefs.current[audioId]) {
        delete audioRefs.current[audioId]
      }
      URL.revokeObjectURL(audioFile.url)
      setAudioFiles(prev => prev.filter(f => f.id !== audioId))
    }
  }

  const handleClearAllFiles = () => {
    audioFiles.forEach(file => {
      URL.revokeObjectURL(file.url)
    })
    setAudioFiles([])
    setCurrentlyPlaying(null)
    audioRefs.current = {}
  }

  return {
    // State
    text,
    setText,
    selectedVoice,
    setSelectedVoice,
    voiceStyle,
    setVoiceStyle,
    speechRate,
    setSpeechRate,
    pitch,
    setPitch,
    volume,
    setVolume,
    isGenerating,
    audioFiles,
    currentlyPlaying,
    showHowItWorks,
    setShowHowItWorks,
    
    // Actions
    handleGenerate,
    handlePlay,
    handleStop,
    handleDownload,
    handleRemoveFile,
    handleClearAllFiles
  }
}