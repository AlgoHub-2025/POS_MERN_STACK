// Voice Recognition Service with Multi-language Support

interface SpeechRecognition {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number
  onstart: (() => void) | null
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
}

interface SpeechRecognitionErrorEvent {
  error: string
}

interface VoiceCommand {
  command: string
  intent: string
  entities: {
    product?: string
    quantity?: number
    action?: string
  }
  confidence: number
  language: string
}

interface LanguagePack {
  code: string
  name: string
  commands: {
    [key: string]: {
      patterns: string[]
      intent: string
      entities?: string[]
    }
  }
  responses: {
    [key: string]: string[]
  }
}

class VoiceRecognitionService {
  private recognition: SpeechRecognition | null = null
  private synthesis: SpeechSynthesis | null = null
  private currentLanguage: string = 'en'
  private isListening: boolean = false
  private onCommandCallback?: (command: VoiceCommand) => void
  private onErrorCallback?: (error: string) => void
  private onStatusCallback?: (status: string) => void

  // Language packs
  private languagePacks: { [key: string]: LanguagePack } = {
    en: {
      code: 'en',
      name: 'English',
      commands: {
        'add_to_cart': {
          patterns: [
            'add {product}',
            'add {quantity} {product}',
            'put {product} in cart',
            'I want {product}',
            'give me {quantity} {product}',
            'can I have {product}'
          ],
          intent: 'add_to_cart',
          entities: ['product', 'quantity']
        },
        'search_product': {
          patterns: [
            'search for {product}',
            'find {product}',
            'look for {product}',
            'show me {product}',
            'do you have {product}'
          ],
          intent: 'search_product',
          entities: ['product']
        },
        'remove_from_cart': {
          patterns: [
            'remove {product}',
            'delete {product}',
            'take out {product}',
            'cancel {product}'
          ],
          intent: 'remove_from_cart',
          entities: ['product']
        },
        'clear_cart': {
          patterns: [
            'clear cart',
            'empty cart',
            'start over',
            'remove everything',
            'cancel order'
          ],
          intent: 'clear_cart'
        },
        'checkout': {
          patterns: [
            'checkout',
            'pay now',
            'complete order',
            'finish order',
            'ready to pay'
          ],
          intent: 'checkout'
        },
        'show_total': {
          patterns: [
            'what\'s the total',
            'how much',
            'show total',
            'check price',
            'current total'
          ],
          intent: 'show_total'
        },
        'help': {
          patterns: [
            'help',
            'what can I say',
            'commands',
            'voice commands'
          ],
          intent: 'help'
        }
      },
      responses: {
        success: [
          'Got it!',
          'Done!',
          'Okay!',
          'Sure thing!',
          'You got it!'
        ],
        error: [
          'Sorry, I didn\'t catch that.',
          'Could you repeat that?',
          'I didn\'t understand.',
          'Try again please.'
        ],
        listening: [
          'I\'m listening...',
          'Go ahead...',
          'Ready when you are...',
          'I\'m ready...'
        ],
        no_match: [
          'I don\'t know that command.',
          'That\'s not something I can do.',
          'Try saying "help" for commands.'
        ]
      }
    },
    es: {
      code: 'es',
      name: 'Español',
      commands: {
        'add_to_cart': {
          patterns: [
            'agregar {product}',
            'añadir {product}',
            'pon {product} en el carrito',
            'quiero {product}',
            'deme {quantity} {product}',
            'puedo tener {product}'
          ],
          intent: 'add_to_cart',
          entities: ['product', 'quantity']
        },
        'search_product': {
          patterns: [
            'buscar {product}',
            'encontrar {product}',
            'muéstrame {product}',
            'tienen {product}',
            'hay {product}'
          ],
          intent: 'search_product',
          entities: ['product']
        },
        'remove_from_cart': {
          patterns: [
            'quitar {product}',
            'eliminar {product}',
            'sacar {product}',
            'cancelar {product}'
          ],
          intent: 'remove_from_cart',
          entities: ['product']
        },
        'clear_cart': {
          patterns: [
            'vaciar carrito',
            'limpiar carrito',
            'empezar de nuevo',
            'cancelar pedido'
          ],
          intent: 'clear_cart'
        },
        'checkout': {
          patterns: [
            'pagar',
            'terminar pedido',
            'completar orden',
            'finalizar compra'
          ],
          intent: 'checkout'
        },
        'show_total': {
          patterns: [
            'cuánto es',
            'cuál es el total',
            'mostrar total',
            'precio total'
          ],
          intent: 'show_total'
        },
        'help': {
          patterns: [
            'ayuda',
            'qué puedo decir',
            'comandos',
            'comandos de voz'
          ],
          intent: 'help'
        }
      },
      responses: {
        success: [
          '¡Entendido!',
          '¡Listo!',
          '¡Claro!',
          '¡Por supuesto!',
          '¡Hecho!'
        ],
        error: [
          'Perdón, no entendí.',
          '¿Puedes repetir?',
          'No te comprendí.',
          'Intenta de nuevo por favor.'
        ],
        listening: [
          'Te estoy escuchando...',
          'Adelante...',
          'Estoy listo...',
          'Puedes hablar...'
        ],
        no_match: [
          'No conozco ese comando.',
          'Eso no lo puedo hacer.',
          'Di "ayuda" para ver los comandos.'
        ]
      }
    },
    fr: {
      code: 'fr',
      name: 'Français',
      commands: {
        'add_to_cart': {
          patterns: [
            'ajouter {product}',
            'mettre {product} dans le panier',
            'je veux {product}',
            'donnez-moi {quantity} {product}',
            'prendre {product}'
          ],
          intent: 'add_to_cart',
          entities: ['product', 'quantity']
        },
        'search_product': {
          patterns: [
            'chercher {product}',
            'trouver {product}',
            'montrez-moi {product}',
            'avez-vous {product}',
            'recherche {product}'
          ],
          intent: 'search_product',
          entities: ['product']
        },
        'remove_from_cart': {
          patterns: [
            'retirer {product}',
            'supprimer {product}',
            'enlever {product}',
            'annuler {product}'
          ],
          intent: 'remove_from_cart',
          entities: ['product']
        },
        'clear_cart': {
          patterns: [
            'vider le panier',
            'effacer le panier',
            'recommencer',
            'annuler la commande'
          ],
          intent: 'clear_cart'
        },
        'checkout': {
          patterns: [
            'payer',
            'terminer la commande',
            'finaliser la commande',
            'valider la commande'
          ],
          intent: 'checkout'
        },
        'show_total': {
          patterns: [
            'combien ça fait',
            'quel est le total',
            'montrer le total',
            'le prix total'
          ],
          intent: 'show_total'
        },
        'help': {
          patterns: [
            'aide',
            'quoi dire',
            'commandes',
            'commandes vocales'
          ],
          intent: 'help'
        }
      },
      responses: {
        success: [
          'Compris!',
          'Fait!',
          'Bien sûr!',
          'D\'accord!',
          'Voilà!'
        ],
        error: [
          'Désolé, je n\'ai pas compris.',
          'Pouvez-vous répéter?',
          'Je ne comprends pas.',
          'Réessayez s\'il vous plaît.'
        ],
        listening: [
          'Je vous écoute...',
          'Allez-y...',
          'Je suis prêt...',
          'À vous...'
        ],
        no_match: [
          'Je ne connais pas cette commande.',
          'Je ne peux pas faire ça.',
          'Dites "aide" pour les commandes.'
        ]
      }
    }
  }

  constructor() {
    this.initializeSpeechRecognition()
    this.initializeSpeechSynthesis()
  }

  private initializeSpeechRecognition(): void {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      this.recognition = recognition
      
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = this.getLanguageCode()
      recognition.maxAlternatives = 3

      recognition.onstart = () => {
        this.isListening = true
        this.onStatusCallback?.('listening')
        this.speak(this.getRandomResponse('listening'))
      }

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript.toLowerCase()
        const confidence = event.results[0][0].confidence
        
        const command = this.parseCommand(transcript, confidence)
        this.onCommandCallback?.(command)
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        this.isListening = false
        const errorMessage = this.getErrorMessage(event.error)
        this.onErrorCallback?.(errorMessage)
        this.speak(this.getRandomResponse('error'))
      }

      recognition.onend = () => {
        this.isListening = false
        this.onStatusCallback?.('idle')
      }
    }
  }

  private initializeSpeechSynthesis(): void {
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis
    }
  }

  private getLanguageCode(): string {
    const langMap: { [key: string]: string } = {
      'en': 'en-US',
      'es': 'es-ES',
      'fr': 'fr-FR'
    }
    return langMap[this.currentLanguage] || 'en-US'
  }

  private parseCommand(transcript: string, confidence: number): VoiceCommand {
    const languagePack = this.languagePacks[this.currentLanguage]
    
    for (const [intent, command] of Object.entries(languagePack.commands)) {
      for (const pattern of command.patterns) {
        const match = this.matchPattern(transcript, pattern)
        if (match) {
          return {
            command: transcript,
            intent,
            entities: match,
            confidence,
            language: this.currentLanguage
          }
        }
      }
    }

    return {
      command: transcript,
      intent: 'unknown',
      entities: {},
      confidence,
      language: this.currentLanguage
    }
  }

  private matchPattern(transcript: string, pattern: string): any {
    // Simple pattern matching - in production, use more sophisticated NLP
    const entities: any = {}
    
    // Extract product name
    const productMatch = transcript.match(/(?:add|put|want|give|take|remove|delete|search|find|look for|show|have|get)\s+(?:\d+\s+)?([a-z\s]+)/i)
    if (productMatch) {
      entities.product = productMatch[1].trim()
    }
    
    // Extract quantity
    const quantityMatch = transcript.match(/(\d+)/)
    if (quantityMatch) {
      entities.quantity = parseInt(quantityMatch[1])
    }
    
    // Extract action
    const actionMatch = transcript.match(/(add|remove|search|clear|checkout|pay|help)/i)
    if (actionMatch) {
      entities.action = actionMatch[1].toLowerCase()
    }
    
    return Object.keys(entities).length > 0 ? entities : null
  }

  private getErrorMessage(error: string): string {
    const errorMessages: { [key: string]: string } = {
      'no-speech': 'No speech detected. Please try again.',
      'audio-capture': 'Microphone not available. Please check permissions.',
      'not-allowed': 'Microphone access denied. Please allow microphone access.',
      'network': 'Network error. Please check your connection.',
      'service-not-allowed': 'Speech recognition service not allowed.'
    }
    return errorMessages[error] || 'An error occurred during speech recognition.'
  }

  private getRandomResponse(type: string): string {
    const languagePack = this.languagePacks[this.currentLanguage]
    const responses = languagePack.responses[type] || []
    return responses[Math.floor(Math.random() * responses.length)]
  }

  public startListening(): void {
    if (this.recognition && !this.isListening) {
      this.recognition.lang = this.getLanguageCode()
      this.recognition.start()
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
    }
  }

  public speak(text: string, options?: { rate?: number; pitch?: number; volume?: number }): void {
    if (this.synthesis) {
      // Cancel any ongoing speech
      this.synthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = this.getLanguageCode()
      utterance.rate = options?.rate || 1
      utterance.pitch = options?.pitch || 1
      utterance.volume = options?.volume || 1
      
      this.synthesis.speak(utterance)
    }
  }

  public setLanguage(language: string): void {
    if (this.languagePacks[language]) {
      this.currentLanguage = language
      if (this.recognition) {
        this.recognition.lang = this.getLanguageCode()
      }
    }
  }

  public getCurrentLanguage(): string {
    return this.currentLanguage
  }

  public getAvailableLanguages(): LanguagePack[] {
    return Object.values(this.languagePacks)
  }

  public getCommandsForCurrentLanguage(): { [key: string]: any } {
    return this.languagePacks[this.currentLanguage].commands
  }

  public isSpeechRecognitionSupported(): boolean {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
  }

  public isSpeechSynthesisSupported(): boolean {
    return 'speechSynthesis' in window
  }

  public isCurrentlyListening(): boolean {
    return this.isListening
  }

  // Event handlers
  public onCommand(callback: (command: VoiceCommand) => void): void {
    this.onCommandCallback = callback
  }

  public onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback
  }

  public onStatus(callback: (status: string) => void): void {
    this.onStatusCallback = callback
  }

  // Analytics
  public logCommand(command: VoiceCommand, success: boolean): void {
    console.log('Voice Command Analytics:', {
      command: command.command,
      intent: command.intent,
      confidence: command.confidence,
      language: command.language,
      success,
      timestamp: new Date().toISOString()
    })
  }
}

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message?: string
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

export { VoiceRecognitionService }
export type { VoiceCommand, LanguagePack }
export default VoiceRecognitionService
