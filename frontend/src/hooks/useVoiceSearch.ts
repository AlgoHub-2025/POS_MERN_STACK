import { useState, useEffect, useCallback } from 'react'
import { Product } from '@/types'

interface VoiceCommand {
  command: string
  intent: 'add' | 'search' | 'clear' | 'checkout'
  entities: Array<{
    type: 'product' | 'quantity' | 'modifier'
    value: string
    confidence: number
  }>
  confidence: number
}

interface UseVoiceSearchOptions {
  onCommandDetected: (command: VoiceCommand) => void
  onProductFound?: (product: Product) => void
  onError?: (error: string) => void
}

export const useVoiceSearch = ({ onCommandDetected, onProductFound, onError }: UseVoiceSearchOptions) => {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [transcript, setTranscript] = useState('')

  // Check if browser supports speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true)
    } else {
      onError?.('Voice recognition is not supported in this browser')
    }
  }, [onError])

  const startListening = useCallback(() => {
    if (!isSupported) return

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
      setTranscript('')
    }

    recognition.onresult = (event: any) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        } else {
          interimTranscript += result[0].transcript
        }
      }

      setTranscript(finalTranscript || interimTranscript)

      // Process the final transcript
      if (finalTranscript) {
        processVoiceCommand(finalTranscript)
      }
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
      onError?.(`Voice recognition error: ${event.error}`)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }, [isSupported, onError, onCommandDetected])

  const stopListening = useCallback(() => {
    if (isListening) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.stop()
    }
  }, [isListening])

  const processVoiceCommand = useCallback((transcript: string) => {
    const lowerTranscript = transcript.toLowerCase().trim()
    
    // Command patterns
    const patterns = {
      add: /(?:add|order|get|give me|want|i need|i'll take)\s+(.+?)(?:\s+(\d+))?/i,
      search: /(?:find|search|show me|look for|where is)\s+(.+)/i,
      clear: /(?:clear|empty|reset|remove all)/i,
      checkout: /(?:checkout|pay|finish|done|complete)/i
    }

    // Add command
    const addMatch = lowerTranscript.match(patterns.add)
    if (addMatch) {
      const productName = addMatch[1]?.trim()
      const quantity = addMatch[2] ? parseInt(addMatch[2]) : 1

      onCommandDetected({
        command: 'add',
        intent: 'add',
        entities: [
          {
            type: 'product',
            value: productName,
            confidence: 0.9
          },
          ...(quantity ? [{
            type: 'quantity' as const,
            value: quantity.toString(),
            confidence: 0.95
          }] : [])
        ],
        confidence: 0.85
      })
      return
    }

    // Search command
    const searchMatch = lowerTranscript.match(patterns.search)
    if (searchMatch) {
      const searchTerm = searchMatch[1]?.trim()
      
      onCommandDetected({
        command: 'search',
        intent: 'search',
        entities: [
          {
            type: 'product',
            value: searchTerm,
            confidence: 0.9
          }
        ],
        confidence: 0.8
      })
      return
    }

    // Clear command
    if (patterns.clear.test(lowerTranscript)) {
      onCommandDetected({
        command: 'clear',
        intent: 'clear',
        entities: [],
        confidence: 0.95
      })
      return
    }

    // Checkout command
    if (patterns.checkout.test(lowerTranscript)) {
      onCommandDetected({
        command: 'checkout',
        intent: 'checkout',
        entities: [],
        confidence: 0.9
      })
      return
    }

    // Unknown command
    onCommandDetected({
      command: transcript,
      intent: 'search',
      entities: [
        {
          type: 'product',
          value: transcript,
          confidence: 0.5
        }
      ],
      confidence: 0.3
    })
  }, [onCommandDetected])

  return {
    isListening,
    isSupported,
    transcript,
    startListening,
    stopListening
  }
}
