'use client'

import ProtectedRoute from './components/ProtectedRoute'
import AppInitializer from './components/AppInitializer'
import TextToSpeechUI from './TextToSpeechUI'

export default function App() {
  return (
    <ProtectedRoute>
      <AppInitializer>
        <TextToSpeechUI />
      </AppInitializer>
    </ProtectedRoute>
  )
}