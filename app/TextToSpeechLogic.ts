'use client'

import { useState, useRef } from 'react'
import { useAuth } from './contexts/AuthContext'
import { ttsService } from './services/ttsService'

export interface AudioFile {
  id: string
  name: string
  url: string
  isPreview: boolean
  timestamp: string
}

export function useTextToSpeechLogic() {
  const { token, usage, refreshUserData } = useAuth()
  
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

  // Audio state for footer player
  const [audioCurrentTime, setAudioCurrentTime] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)

  // Audio reference for playback
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Generate speech audio
  const handleGenerate = async (isPreview = false) => {
    if (!text.trim() || !selectedVoice) {
      setError('Please enter text and select a voice.')
      return
    }

    if (!token) {
      setError('Authentication required. Please log in.')
      return
    }

    // Check usage limits before generation
    if (usage && !isPreview) {
      const charactersNeeded = text.length
      if (usage.current + charactersNeeded > usage.limit) {
        setError(`Usage limit exceeded. You need ${charactersNeeded} characters but only have ${usage.remaining} remaining.`)
        return
      }
    }

    setIsGenerating(true)
    setError(null)

    try {
      // Use first 200 characters for preview, full text for generation
      const textToUse = isPreview ? text.substring(0, 200) : text

      // Call your backend API
      const response = await ttsService.generateSpeech({
        text: textToUse,
        voice: selectedVoice,
        style: voiceStyle !== 'default' ? voiceStyle : undefined,
        rate: speechRate,
        pitch: pitch,
        volume: volume,
        isPreview: isPreview
      }, token)

      if (response.success && response.audio) {
        // Create audio blob and URL
        const audioBlob = new Blob([Uint8Array.from(atob(response.audio), c => c.charCodeAt(0))], { 
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

        // Refresh usage data after successful generation (only for non-preview)
        if (!isPreview && response.usage) {
          refreshUserData()
        }

      } else {
        // Handle different types of errors
        if (response.error) {
          setError(response.error)
        } else {
          setError('Failed to generate speech')
        }
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
      setAudioCurrentTime(0)
      setAudioDuration(0)
    }

    audio.onerror = () => {
      console.error('Audio playback error')
      setCurrentlyPlaying(null)
      audioRef.current = null
      setError('Error playing audio. The file may be corrupted.')
      setAudioCurrentTime(0)
      setAudioDuration(0)
    }

    // Audio time tracking
    audio.ontimeupdate = () => {
      setAudioCurrentTime(audio.currentTime || 0)
    }

    audio.onloadedmetadata = () => {
      setAudioDuration(audio.duration || 0)
    }

    audio.onloadstart = () => {
      setAudioCurrentTime(0)
      setAudioDuration(0)
    }

    // Start playback
    audio.play().catch(error => {
      console.error('Play error:', error)
      setCurrentlyPlaying(null)
      audioRef.current = null
      setError('Could not play audio. Please try again.')
      setAudioCurrentTime(0)
      setAudioDuration(0)
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
    setAudioCurrentTime(0)
  }

  // Seek to specific time in audio
  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setAudioCurrentTime(time)
    }
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

  // Calculate estimated cost based on real usage
  const getEstimatedCost = (textLength: number) => {
    // Azure Neural Voices: $16 per 1M characters
    return (textLength * 0.000016).toFixed(4)
  }

  // Get character count and validation
  const getTextStats = () => {
    const charCount = text.length
    const isValid = charCount > 0 && charCount <= 5000
    const previewLength = Math.min(charCount, 200)
    
    // Check if user can generate this text
    const canGenerate = usage ? (usage.current + charCount) <= usage.limit : true
    const remaining = usage ? usage.remaining : 0
    
    return {
      charCount,
      isValid,
      previewLength,
      cost: getEstimatedCost(charCount),
      previewCost: getEstimatedCost(previewLength),
      canGenerate,
      remaining
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

    // Audio state for footer player
    audioCurrentTime,
    audioDuration,

    // Actions
    handleGenerate,
    handlePlay,
    handleStop,
    handleSeek,
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