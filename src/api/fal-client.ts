// FAL.AI Speech-to-Text API Client
export interface FalSpeechResult {
  text: string
  words: Array<{
    text: string
    start: number
    end: number
  }>
}

export class FalClient {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async speechToText(audioUrl: string): Promise<FalSpeechResult> {
    try {
      const body = {
        audio_url: audioUrl,
        // task: 'transcribe',
        "language_code": "eng",
        "tag_audio_events": false,
        "diarize": true,
        // word_timestamps: true,
        // chunk_level: "segment",
      }
      console.log('   🤖 Body elevenlabs:', body);
      // const response = await fetch('https://fal.run/fal-ai/whisper', {
      const response = await fetch('https://fal.run/fal-ai/elevenlabs/speech-to-text', {
        method: 'POST',
        headers: {
          'Authorization': `Key ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        throw new Error(`FAL API error: ${response.statusText}`)
      }

      const data = await response.json() as Record<string, unknown>

      return {
        text: (data.text as string) || '',
        words: (data.words as Array<{ text: string; start: number; end: number }>) || []
      }
    } catch (error) {
      console.error('FAL Speech-to-Text error:', error)
      throw error
    }
  }

  // Mock implementation for development
  async mockSpeechToText(_audioFile: File): Promise<FalSpeechResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    return {
      text: "Привет! Это тестовая расшифровка аудио для демонстрации работы системы.",
      words: [
        { text: "Привет!", start: 0.0, end: 0.8 },
        { text: "Это", start: 1.0, end: 1.2 },
        { text: "тестовая", start: 1.3, end: 1.8 },
        { text: "расшифровка", start: 2.0, end: 2.8 },
        { text: "аудио", start: 3.0, end: 3.4 },
        { text: "для", start: 3.5, end: 3.7 },
        { text: "демонстрации", start: 3.8, end: 4.6 },
        { text: "работы", start: 4.7, end: 5.1 },
        { text: "системы.", start: 5.2, end: 5.8 }
      ]
    }
  }
}
