import type { VoiceCommand } from './voiceRecognition'
import { Product } from '@/types'

interface ProcessedCommand {
  intent: string
  action: string
  entities: {
    product?: Product
    quantity?: number
    price?: number
    category?: string
    modifier?: string
  }
  confidence: number
  response?: string
  suggestions?: string[]
}

interface CommandHistory {
  command: string
  intent: string
  success: boolean
  timestamp: Date
  confidence: number
}

class VoiceCommandProcessor {
  private products: Product[] = []
  private commandHistory: CommandHistory[] = []
  private context: {
    lastIntent?: string
    lastProduct?: Product
    cartTotal?: number
    cartItems?: string[]
  } = {}

  constructor() {
    this.loadCommandHistory()
  }

  public setProducts(products: Product[]): void {
    this.products = products
  }

  public updateContext(context: Partial<typeof this.context>): void {
    this.context = { ...this.context, ...context }
  }

  public processCommand(command: VoiceCommand): ProcessedCommand {
    try {
      // Step 1: Enhanced intent recognition with context awareness
      const intent = this.recognizeIntent(command)
      
      // Step 2: Entity extraction with fuzzy matching
      const entities = this.extractEntities(command)
      
      // Step 3: Action determination
      const action = this.determineAction(intent.name, entities)
      
      // Step 4: Generate response
      const response = this.generateResponse(intent.name, entities, command.language)
      
      // Step 5: Generate suggestions
      const suggestions = this.generateSuggestions(intent.name, entities)
      
      // Step 6: Calculate confidence
      const confidence = this.calculateConfidence(command, intent, entities)
      
      const processedCommand: ProcessedCommand = {
        intent: intent.name,
        action,
        entities,
        confidence,
        response,
        suggestions
      }

      // Log command for analytics
      this.logCommand(command, processedCommand, true)
      
      // Update context
      this.updateContextFromCommand(processedCommand)
      
      return processedCommand
    } catch (error) {
      console.error('Error processing voice command:', error)
      this.logCommand(command, {} as ProcessedCommand, false)
      
      return {
        intent: 'error',
        action: 'none',
        entities: {},
        confidence: 0,
        response: this.getErrorResponse(command.language),
        suggestions: this.getHelpSuggestions(command.language)
      }
    }
  }

  private recognizeIntent(command: VoiceCommand): { name: string; confidence: number } {
    const transcript = command.command.toLowerCase()
    const intents = [
      { name: 'add_to_cart', keywords: ['add', 'put', 'want', 'give', 'take', 'get', 'need', 'like'] },
      { name: 'search_product', keywords: ['search', 'find', 'look for', 'show', 'have', 'available'] },
      { name: 'remove_from_cart', keywords: ['remove', 'delete', 'take out', 'cancel', 'eliminate'] },
      { name: 'clear_cart', keywords: ['clear', 'empty', 'start over', 'remove all', 'cancel all'] },
      { name: 'checkout', keywords: ['checkout', 'pay', 'complete', 'finish', 'done', 'ready'] },
      { name: 'show_total', keywords: ['total', 'how much', 'price', 'cost', 'amount'] },
      { name: 'help', keywords: ['help', 'what can', 'commands', 'how to'] },
      { name: 'modify_quantity', keywords: ['change', 'update', 'modify', 'different'] }
    ]

    let bestMatch = { name: 'unknown', confidence: 0 }

    for (const intent of intents) {
      const matches = intent.keywords.filter(keyword => transcript.includes(keyword))
      const confidence = matches.length / intent.keywords.length
      
      if (confidence > bestMatch.confidence) {
        bestMatch = { name: intent.name, confidence }
      }
    }

    // Context-aware intent adjustment
    if (this.context.lastIntent === 'add_to_cart' && bestMatch.confidence < 0.5) {
      // If previous command was add and current is unclear, assume add
      if (this.extractProductName(transcript)) {
        bestMatch = { name: 'add_to_cart', confidence: 0.7 }
      }
    }

    return bestMatch
  }

  private extractEntities(command: VoiceCommand): ProcessedCommand['entities'] {
    const transcript = command.command.toLowerCase()
    const entities: ProcessedCommand['entities'] = {}

    // Extract product with fuzzy matching
    const product = this.extractProduct(transcript)
    if (product) {
      entities.product = product
    }

    // Extract quantity
    const quantity = this.extractQuantity(transcript)
    if (quantity) {
      entities.quantity = quantity
    }

    // Extract price references
    const price = this.extractPrice(transcript)
    if (price) {
      entities.price = price
    }

    // Extract category
    const category = this.extractCategory(transcript)
    if (category) {
      entities.category = category
    }

    // Extract modifiers (size, temperature, etc.)
    const modifier = this.extractModifier(transcript)
    if (modifier) {
      entities.modifier = modifier
    }

    return entities
  }

  private extractProduct(transcript: string): Product | undefined {
    const productName = this.extractProductName(transcript)
    if (!productName) return undefined

    // Exact match first
    let product = this.products.find(p => 
      p.name.toLowerCase() === productName.toLowerCase()
    )

    // Fuzzy match if no exact match
    if (!product) {
      product = this.fuzzyFindProduct(productName)
    }

    return product
  }

  private extractProductName(transcript: string): string | undefined {
    // Common patterns for product extraction
    const patterns = [
      /(?:add|put|want|give|take|remove|delete|search|find|look for|show|have|get|need|like)\s+(?:\d+\s+)?([a-z\s]+?)(?:\s+(?:to|from|in|for|$))/i,
      /(?:i'll|i will|i'd|i would|can i|could i)\s+(?:have|get|take|need)\s+(?:\d+\s+)?([a-z\s]+?)(?:\s+please|$)/i,
      /(?:show me|find|search for)\s+(?:the\s+)?([a-z\s]+?)(?:\s+please|$)/i
    ]

    for (const pattern of patterns) {
      const match = transcript.match(pattern)
      if (match && match[1]) {
        return match[1].trim()
      }
    }

    return undefined
  }

  private fuzzyFindProduct(name: string): Product | undefined {
    const searchTerm = name.toLowerCase()
    let bestMatch: Product | undefined
    let bestScore = 0

    for (const product of this.products) {
      const score = this.calculateStringSimilarity(searchTerm, product.name.toLowerCase())
      if (score > bestScore && score > 0.6) { // Threshold for fuzzy matching
        bestScore = score
        bestMatch = product
      }
    }

    return bestMatch
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1
    
    if (longer.length === 0) return 1.0
    
    const editDistance = this.levenshteinDistance(longer, shorter)
    return (longer.length - editDistance) / longer.length
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        )
      }
    }
    
    return matrix[str2.length][str1.length]
  }

  private extractQuantity(transcript: string): number | undefined {
    const patterns = [
      /(\d+)/,  // Numbers
      /(one|two|three|four|five|six|seven|eight|nine|ten)/i,  // Words
      /(a|an)/i  // Articles (means 1)
    ]

    for (const pattern of patterns) {
      const match = transcript.match(pattern)
      if (match) {
        const word = match[1].toLowerCase()
        const numberMap: { [key: string]: number } = {
          'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
          'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
          'a': 1, 'an': 1
        }
        
        if (numberMap[word]) return numberMap[word]
        if (!isNaN(parseInt(word))) return parseInt(word)
      }
    }

    return undefined
  }

  private extractPrice(transcript: string): number | undefined {
    const match = transcript.match(/\$(\d+(?:\.\d{2})?)/)
    return match ? parseFloat(match[1]) : undefined
  }

  private extractCategory(transcript: string): string | undefined {
    const categories = ['coffee', 'tea', 'bakery', 'food', 'drink', 'snack', 'dessert']
    const found = categories.find(cat => transcript.includes(cat))
    return found
  }

  private extractModifier(transcript: string): string | undefined {
    const modifiers = ['large', 'small', 'medium', 'hot', 'cold', 'iced', 'extra', 'no', 'with', 'without']
    const found = modifiers.find(mod => transcript.includes(mod))
    return found
  }

  private determineAction(intent: string, entities: ProcessedCommand['entities']): string {
    switch (intent) {
      case 'add_to_cart':
        return entities.product ? 'add_product' : 'request_product'
      case 'search_product':
        return entities.product ? 'show_product' : 'request_search_term'
      case 'remove_from_cart':
        return entities.product ? 'remove_product' : 'request_product_to_remove'
      case 'clear_cart':
        return 'clear_cart'
      case 'checkout':
        return 'start_checkout'
      case 'show_total':
        return 'display_total'
      case 'help':
        return 'show_help'
      case 'modify_quantity':
        return entities.product ? 'modify_quantity' : 'request_product_to_modify'
      default:
        return 'unknown_command'
    }
  }

  private generateResponse(intent: string, entities: ProcessedCommand['entities'], language: string): string {
    const responses: { [key: string]: { [lang: string]: string[] } } = {
      add_to_cart: {
        en: [
          entities.product ? `Added ${entities.quantity || 1} ${entities.product.name} to cart` : 'What would you like to add?',
          entities.product ? `${entities.product.name} added` : 'Please specify a product'
        ],
        es: [
          entities.product ? `Agregué ${entities.quantity || 1} ${entities.product.name} al carrito` : '¿Qué te gustaría agregar?',
          entities.product ? `${entities.product.name} agregado` : 'Por favor especifica un producto'
        ],
        fr: [
          entities.product ? `Ajouté ${entities.quantity || 1} ${entities.product.name} au panier` : 'Que voulez-vous ajouter?',
          entities.product ? `${entities.product.name} ajouté` : 'Veuillez spécifier un produit'
        ]
      },
      search_product: {
        en: [
          entities.product ? `Found ${entities.product.name}` : 'What are you looking for?',
          entities.product ? `Here's ${entities.product.name}` : 'Please specify what to search'
        ],
        es: [
          entities.product ? `Encontré ${entities.product.name}` : '¿Qué buscas?',
          entities.product ? `Aquí está ${entities.product.name}` : 'Por favor especifica qué buscar'
        ],
        fr: [
          entities.product ? `Trouvé ${entities.product.name}` : 'Que cherchez-vous?',
          entities.product ? `Voici ${entities.product.name}` : 'Veuillez spécifier quoi chercher'
        ]
      },
      remove_from_cart: {
        en: [
          entities.product ? `Removed ${entities.product.name} from cart` : 'What would you like to remove?',
          entities.product ? `${entities.product.name} removed` : 'Please specify a product'
        ],
        es: [
          entities.product ? `Quité ${entities.product.name} del carrito` : '¿Qué te gustaría quitar?',
          entities.product ? `${entities.product.name} quitado` : 'Por favor especifica un producto'
        ],
        fr: [
          entities.product ? `Retiré ${entities.product.name} du panier` : 'Que voulez-vous retirer?',
          entities.product ? `${entities.product.name} retiré` : 'Veuillez spécifier un produit'
        ]
      },
      clear_cart: {
        en: ['Cart cleared', 'All items removed from cart'],
        es: ['Carrito vaciado', 'Todos los artículos quitados del carrito'],
        fr: ['Panier vidé', 'Tous les articles retirés du panier']
      },
      checkout: {
        en: ['Starting checkout', 'Proceeding to payment'],
        es: ['Iniciando checkout', 'Procediendo al pago'],
        fr: ['Début du checkout', 'Procédant au paiement']
      },
      show_total: {
        en: [`Current total is $${this.context.cartTotal || '0.00'}`, 'Your total is displayed'],
        es: [`El total actual es $${this.context.cartTotal || '0.00'}`, 'Tu total está mostrado'],
        fr: [`Le total actuel est $${this.context.cartTotal || '0.00'}`, 'Votre total est affiché']
      },
      help: {
        en: ['You can say: add product, search product, remove product, clear cart, checkout, show total'],
        es: ['Puedes decir: agregar producto, buscar producto, quitar producto, vaciar carrito, pagar, mostrar total'],
        fr: ['Vous pouvez dire: ajouter produit, chercher produit, retirer produit, vider panier, payer, montrer total']
      }
    }

    const intentResponses = responses[intent]?.[language] || responses[intent]?.['en'] || ['Command processed']
    return intentResponses[Math.floor(Math.random() * intentResponses.length)]
  }

  private generateSuggestions(intent: string, entities: ProcessedCommand['entities']): string[] {
    const suggestions: string[] = []

    if (intent === 'add_to_cart' && !entities.product) {
      suggestions.push('Try: "Add espresso" or "I want a cappuccino"')
    }

    if (intent === 'search_product' && !entities.product) {
      suggestions.push('Try: "Search for coffee" or "Find croissant"')
    }

    if (this.context.lastProduct && !entities.product) {
      suggestions.push(`Did you mean: "${this.context.lastProduct.name}"?`)
    }

    if (suggestions.length === 0) {
      suggestions.push('Say "help" for available commands')
    }

    return suggestions
  }

  private calculateConfidence(command: VoiceCommand, intent: { name: string; confidence: number }, entities: ProcessedCommand['entities']): number {
    let confidence = command.confidence * intent.confidence

    // Boost confidence if we found entities
    if (Object.keys(entities).length > 0) {
      confidence += 0.1
    }

    // Boost confidence if product was found
    if (entities.product) {
      confidence += 0.15
    }

    // Context awareness boost
    if (this.context.lastIntent === intent.name) {
      confidence += 0.05
    }

    return Math.min(confidence, 1.0)
  }

  private getErrorResponse(language: string): string {
    const responses: { [key: string]: string } = {
      en: 'Sorry, I didn\'t understand that command. Try saying "help" for available commands.',
      es: 'Perdón, no entendí ese comando. Intenta decir "ayuda" para ver los comandos disponibles.',
      fr: 'Désolé, je n\'ai pas compris cette commande. Essayez de dire "aide" pour voir les commandes disponibles.'
    }
    return responses[language] || responses['en']
  }

  private getHelpSuggestions(language: string): string[] {
    const suggestions: { [key: string]: string[] } = {
      en: ['Add product', 'Search product', 'Show total', 'Checkout', 'Help'],
      es: ['Agregar producto', 'Buscar producto', 'Mostrar total', 'Pagar', 'Ayuda'],
      fr: ['Ajouter produit', 'Chercher produit', 'Montrer total', 'Payer', 'Aide']
    }
    return suggestions[language] || suggestions['en']
  }

  private updateContextFromCommand(command: ProcessedCommand): void {
    this.context.lastIntent = command.intent
    if (command.entities.product) {
      this.context.lastProduct = command.entities.product
    }
  }

  private logCommand(originalCommand: VoiceCommand, processedCommand: ProcessedCommand, success: boolean): void {
    const historyEntry: CommandHistory = {
      command: originalCommand.command,
      intent: processedCommand.intent,
      success,
      timestamp: new Date(),
      confidence: originalCommand.confidence
    }

    this.commandHistory.push(historyEntry)
    
    // Keep only last 100 commands
    if (this.commandHistory.length > 100) {
      this.commandHistory = this.commandHistory.slice(-100)
    }

    this.saveCommandHistory()
  }

  private loadCommandHistory(): void {
    try {
      const stored = localStorage.getItem('voice_command_history')
      if (stored) {
        this.commandHistory = JSON.parse(stored).map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }))
      }
    } catch (error) {
      console.error('Failed to load command history:', error)
    }
  }

  private saveCommandHistory(): void {
    try {
      localStorage.setItem('voice_command_history', JSON.stringify(this.commandHistory))
    } catch (error) {
      console.error('Failed to save command history:', error)
    }
  }

  public getCommandHistory(): CommandHistory[] {
    return [...this.commandHistory]
  }

  public getAnalytics(): {
    totalCommands: number
    successRate: number
    averageConfidence: number
    intentDistribution: { [intent: string]: number }
    languageDistribution: { [language: string]: number }
  } {
    const totalCommands = this.commandHistory.length
    const successfulCommands = this.commandHistory.filter(cmd => cmd.success).length
    const averageConfidence = this.commandHistory.reduce((sum, cmd) => sum + cmd.confidence, 0) / totalCommands

    const intentDistribution: { [intent: string]: number } = {}
    const languageDistribution: { [language: string]: number } = {}

    for (const command of this.commandHistory) {
      intentDistribution[command.intent] = (intentDistribution[command.intent] || 0) + 1
    }

    return {
      totalCommands,
      successRate: totalCommands > 0 ? successfulCommands / totalCommands : 0,
      averageConfidence,
      intentDistribution,
      languageDistribution
    }
  }
}

export { VoiceCommandProcessor }
export type { ProcessedCommand, CommandHistory }
export default VoiceCommandProcessor
