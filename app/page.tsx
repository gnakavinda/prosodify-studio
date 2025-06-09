'use client'

import { useState, useRef } from 'react'
import { Play, Download, Volume2, X, Info, Mic, FileText, Headphones } from 'lucide-react'
import VoiceSettings from './components/VoiceSettings'
import AudioFileManager from './components/AudioFileManager'

interface AudioFile {
  id: string
  name: string
  url: string
  isPreview: boolean
  timestamp: string
}

export default function Home() {
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

  const generateFileName = (isPreview: boolean) => {
    const voiceName = selectedVoice.split('-')[2] || 'Unknown' // Extract name from shortName
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Volume2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Prosodify Studio
              </h1>
              <p className="text-sm text-gray-600">Professional Text-to-Speech Generator</p>
            </div>
          </div>
        </div>
      </header>

      {/* How It Works Section - Now at Top */}
      {showHowItWorks && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200 relative">
            <button
              onClick={() => setShowHowItWorks(false)}
              className="absolute top-4 right-4 p-1 hover:bg-white rounded-full transition-colors duration-200"
              aria-label="Close how it works"
            >
              <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
            </button>
            
            <div className="flex items-center space-x-2 mb-4">
              <Info className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">How Prosodify Works</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start space-x-3">
                <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">1. Enter Your Text</h3>
                  <p className="text-xs text-gray-600">Type or paste up to 5,000 characters. Preview first 200 characters or generate the full audio.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mic className="w-3.5 h-3.5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">2. Customize Voice</h3>
                  <p className="text-xs text-gray-600">Choose from premium neural voices, styles, and adjust speech rate, pitch, and volume.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Headphones className="w-3.5 h-3.5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">3. Generate & Download</h3>
                  <p className="text-xs text-gray-600">Get high-quality MP3 files instantly. Manage your audio library with play, download, and organize features.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Text Input */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="relative">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter your text here... You can write up to 5,000 characters for speech synthesis."
                  className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-4 pb-16"
                  maxLength={5000}
                />
                
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    <span>Characters: {text.length}/5,000</span>
                    <span className="ml-4">Cost: ${(text.length * 0.000015).toFixed(4)}</span>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleGenerate(true)}
                      disabled={isGenerating || !text.trim() || !selectedVoice}
                      className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      {isGenerating ? '...' : 'Preview'}
                    </button>

                    <button
                      onClick={() => handleGenerate(false)}
                      disabled={isGenerating || !text.trim() || !selectedVoice}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      {isGenerating ? '...' : 'Generate'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Audio File Manager */}
            <AudioFileManager
              audioFiles={audioFiles}
              currentlyPlaying={currentlyPlaying}
              onPlay={handlePlay}
              onStop={handleStop}
              onDownload={handleDownload}
              onRemove={handleRemoveFile}
              onClearAll={handleClearAllFiles}
            />
          </div>

          {/* Right Column - Controls */}
          <div className="space-y-6">
            
            {/* Voice Settings */}
            <VoiceSettings
              selectedVoice={selectedVoice}
              setSelectedVoice={setSelectedVoice}
              voiceStyle={voiceStyle}
              setVoiceStyle={setVoiceStyle}
            />

            {/* Speech Controls */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Speech Controls</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Speech Rate: {speechRate.toFixed(1)}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Slow</span>
                    <span>Normal</span>
                    <span>Fast</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pitch: {pitch.toFixed(1)}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.1"
                    value={pitch}
                    onChange={(e) => setPitch(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Low</span>
                    <span>Normal</span>
                    <span>High</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Volume: {Math.round(volume * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.2"
                    max="1.5"
                    step="0.1"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Quiet</span>
                    <span>Normal</span>
                    <span>Loud</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}