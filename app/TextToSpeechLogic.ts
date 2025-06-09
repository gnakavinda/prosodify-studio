'use client'

import { useState, useRef } from 'react'

export interface AudioFile {
  id: string
  name: string
  url: string
  isPreview: boolean
  timestamp: string
}

export function useTextToSpeechLogic() {
  // Core state
  const [text, setText] = useState('')
  const [selectedVoice, setSelectedVoice] = useState('')
  const [voiceStyle, setVoiceStyle] = useState('default')
  const [speechRate, setSpeechRate] = useState(1)
  const [pitch, setPitch] = useState(1)
  const [volume, setVolume] = useState(1)
  
  // UI state
  const [isGenerating, setIsGenerating] = useState(false)
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([])
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const [showHowItWorks, setShowHowItWorks] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Audio reference for playback
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Generate speech audio
  const handleGenerate = async (isPreview = false) => {
    if (!text.trim() || !selectedVoice) {
      setError('Please enter text and select a voice.')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      // Use first 200 characters for preview, full text for generation
      const textToUse = isPreview ? text.substring(0, 200) : text

      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToUse,
          voice: selectedVoice,
          style: voiceStyle,
          rate: speechRate,
          pitch: pitch,
          volume: volume
        })
      })

      const data = await response.json()

      if (data.success) {
        // Create audio blob and URL
        const audioBlob = new Blob([Uint8Array.from(atob(data.audio), c => c.charCodeAt(0))], { 
          type: 'audio/mpeg' 
        })
        const audioUrl = URL.createObjectURL(audioBlob)

        // Generate friendly filename
        const voiceName = selectedVoice.split('-').slice(-1)[0].replace('Neural', '')
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, '-')
        const filename = isPreview 
          ? `Preview_${voiceName}_${voiceStyle}_${timestamp}`
          : `${voiceName}_${voiceStyle}_${timestamp}`

        // Create new audio file object
        const newAudioFile: AudioFile = {
          id: Date.now().toString(),
          name: filename,
          url: audioUrl,
          isPreview: isPreview,
          timestamp: new Date().toLocaleString()
        }

        // Add to audio files list (newest first)
        setAudioFiles(prev => [newAudioFile, ...prev])

        // Auto-play if it's a preview
        if (isPreview) {
          handlePlay(newAudioFile)
        }

      } else {
        setError(data.error || 'Failed to generate speech')
      }
    } catch (error) {
      console.error('Generation error:', error)
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  // Play audio file
  const handlePlay = (audioFile: AudioFile) => {
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    // Create new audio element
    const audio = new Audio(audioFile.url)
    audioRef.current = audio

    // Set up event listeners
    audio.onplay = () => {
      setCurrentlyPlaying(audioFile.id)
    }

    audio.onended = () => {
      setCurrentlyPlaying(null)
      audioRef.current = null
    }

    audio.onerror = () => {
      console.error('Audio playback error')
      setCurrentlyPlaying(null)
      audioRef.current = null
      setError('Error playing audio. The file may be corrupted.')
    }

    // Start playback
    audio.play().catch(error => {
      console.error('Play error:', error)
      setCurrentlyPlaying(null)
      audioRef.current = null
      setError('Could not play audio. Please try again.')
    })
  }

  // Stop audio playback
  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
    setCurrentlyPlaying(null)
  }

  // Download audio file
  const handleDownload = (audioFile: AudioFile) => {
    try {
      const link = document.createElement('a')
      link.href = audioFile.url
      link.download = `${audioFile.name}.mp3`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Download error:', error)
      setError('Failed to download file. Please try again.')
    }
  }

  // Remove single audio file
  const handleRemoveFile = (audioId: string) => {
    // Stop if currently playing
    if (currentlyPlaying === audioId) {
      handleStop()
    }

    // Remove from list and revoke URL to prevent memory leaks
    setAudioFiles(prev => {
      const fileToRemove = prev.find(f => f.id === audioId)
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.url)
      }
      return prev.filter(f => f.id !== audioId)
    })
  }

  // Clear all audio files
  const handleClearAllFiles = () => {
    // Stop any playing audio
    handleStop()

    // Revoke all URLs to prevent memory leaks
    audioFiles.forEach(file => {
      URL.revokeObjectURL(file.url)
    })

    // Clear the list
    setAudioFiles([])
  }

  // Calculate estimated cost (Azure pricing: ~$15 per 1M characters)
  const getEstimatedCost = (textLength: number) => {
    return (textLength * 0.000015).toFixed(4)
  }

  // Get character count and validation
  const getTextStats = () => {
    const charCount = text.length
    const isValid = charCount > 0 && charCount <= 5000
    const previewLength = Math.min(charCount, 200)
    
    return {
      charCount,
      isValid,
      previewLength,
      cost: getEstimatedCost(charCount),
      previewCost: getEstimatedCost(previewLength)
    }
  }

  // Reset form to defaults
  const resetForm = () => {
    setText('')
    setSpeechRate(1)
    setPitch(1)
    setVolume(1)
    setVoiceStyle('default')
    setError(null)
  }

  // Dismiss error
  const dismissError = () => {
    setError(null)
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
    error,

    // Actions
    handleGenerate,
    handlePlay,
    handleStop,
    handleDownload,
    handleRemoveFile,
    handleClearAllFiles,
    resetForm,
    dismissError,

    // Utilities
    getTextStats,
    getEstimatedCost
  }
}