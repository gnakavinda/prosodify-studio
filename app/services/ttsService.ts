const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://prosodify-api-v2.azurewebsites.net'

interface TTSRequest {
  text: string
  voice: string
  style?: string
  rate?: number
  pitch?: number
  volume?: number
  isPreview?: boolean
}

interface TTSResponse {
  success: boolean
  audio?: string
  format?: string
  usage?: {
    current: number
    limit: number
    remaining: number
  }
  error?: string
  current?: number
  limit?: number
  needed?: number
}

export class TTSService {
  private getAuthHeaders(token: string) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  }

  async generateSpeech(request: TTSRequest, token: string): Promise<TTSResponse> {
    try {
      const response = await fetch(`${API_BASE}/api/tts/generate`, {
        method: 'POST',
        headers: this.getAuthHeaders(token),
        body: JSON.stringify(request),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle usage limit exceeded
        if (response.status === 429) {
          return {
            success: false,
            error: `Usage limit exceeded. You've used ${data.current}/${data.limit} characters. You need ${data.needed} more characters.`,
            current: data.current,
            limit: data.limit,
            needed: data.needed,
          }
        }

        return {
          success: false,
          error: data.error || 'Failed to generate speech',
        }
      }

      return data
    } catch (err) {
      console.error('TTS Service Error:', err)
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      }
    }
  }

  async previewSpeech(request: Omit<TTSRequest, 'isPreview'>, token: string): Promise<TTSResponse> {
    return this.generateSpeech({ ...request, isPreview: true }, token)
  }

  // Fetch available voices (you might still want to get this from Azure directly for faster loading)
  async getVoices(token: string) {
    try {
      const response = await fetch(`${API_BASE}/api/voices`, {
        headers: this.getAuthHeaders(token),
      })

      if (response.ok) {
        return await response.json()
      }

      // Fallback to your existing voice data if backend doesn't have this endpoint
      throw new Error('Voices endpoint not available')
    } catch {
      console.error('Failed to fetch voices from backend, using fallback')
      // Return your existing voice data as fallback
      return null
    }
  }
}

export const ttsService = new TTSService()