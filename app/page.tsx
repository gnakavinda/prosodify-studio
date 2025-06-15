'use client'

import { useAuth } from './contexts/AuthContext'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppInitializer from './components/AppInitializer'
import TextToSpeechUI from './TextToSpeechUI'

export default function App() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <AppInitializer>
      <TextToSpeechUI />
    </AppInitializer>
  )
}