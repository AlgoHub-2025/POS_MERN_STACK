// Edge Case Handler for Visual Recognition

export interface EdgeCaseConfig {
  enableOcclusionHandling: boolean
  enableAngleCompensation: boolean
  enablePackagingDetection: boolean
  enableSimilarProductDifferentiation: boolean
  enableManualOverride: boolean
  confidenceThreshold: number
  angleThreshold: number
  similarityThreshold: number
}

export interface DetectionContext {
  angle: number
  lighting: 'bright' | 'normal' | 'low' | 'very_low'
  occlusion: number // 0-1, percentage of product visible
  packaging: 'none' | 'box' | 'wrapper' | 'bottle' | 'can'
  position: 'center' | 'edge' | 'corner'
}

export interface EdgeCaseResult {
  originalResult: any
  edgeCaseDetected: boolean
  edgeCaseType: string
  adjustedResult?: any
  confidence: number
  recommendations: string[]
  manualOverrideRequired: boolean
}

class EdgeCaseHandler {
  private config: EdgeCaseConfig
  private productDatabase: Map<string, any> = new Map()
  private feedbackHistory: Map<string, Array<{ correct: boolean; timestamp: number }>> = new Map()

  constructor(config: Partial<EdgeCaseConfig> = {}) {
    this.config = {
      enableOcclusionHandling: true,
      enableAngleCompensation: true,
      enablePackagingDetection: true,
      enableSimilarProductDifferentiation: true,
      enableManualOverride: true,
      confidenceThreshold: 0.7,
      angleThreshold: 45,
      similarityThreshold: 0.85,
      ...config
    }
  }

  /**
   * Initialize with product database
   */
  async initialize(products: any[]): Promise<void> {
    console.log('Initializing edge case handler...')
    
    // Build product database with enhanced metadata
    for (const product of products) {
      this.productDatabase.set(product.id, {
        ...product,
        similarProducts: this.findSimilarProducts(product, products),
        angleProfiles: this.generateAngleProfiles(product),
        packagingVariants: this.getPackagingVariants(product),
        distinguishingFeatures: this.extractDistinguishingFeatures(product)
      })
    }

    console.log(`Edge case handler initialized with ${this.productDatabase.size} products`)
  }

  /**
   * Process detection result for edge cases
   */
  async processEdgeCase(
    detectionResult: any,
    context: DetectionContext,
    imageData?: ImageData
  ): Promise<EdgeCaseResult> {
    const result: EdgeCaseResult = {
      originalResult: detectionResult,
      edgeCaseDetected: false,
      edgeCaseType: 'none',
      confidence: detectionResult.confidence || 0,
      recommendations: [],
      manualOverrideRequired: false
    }

    // Check for various edge cases
    if (this.config.enableOcclusionHandling && context.occlusion > 0.3) {
      return this.handleOcclusion(result, context, imageData)
    }

    if (this.config.enableAngleCompensation && Math.abs(context.angle) > this.config.angleThreshold) {
      return this.handleExtremeAngle(result, context, imageData)
    }

    if (this.config.enablePackagingDetection && context.packaging !== 'none') {
      return this.handlePackaging(result, context, imageData)
    }

    if (this.config.enableSimilarProductDifferentiation) {
      return this.handleSimilarProducts(result, context, imageData)
    }

    return result
  }

  /**
   * Handle partially occluded products
   */
  private async handleOcclusion(
    result: EdgeCaseResult,
    context: DetectionContext,
    imageData?: ImageData
  ): Promise<EdgeCaseResult> {
    result.edgeCaseDetected = true
    result.edgeCaseType = 'occlusion'
    result.confidence *= (1 - context.occlusion * 0.5) // Reduce confidence based on occlusion

    // Try to identify visible portions
    if (imageData) {
      const visiblePortions = await this.analyzeVisiblePortions(imageData, context)
      if (visiblePortions.length > 0) {
        result.adjustedResult = this.reconstructFromPortions(result.originalResult, visiblePortions)
        result.recommendations.push('Product partially visible - detected from visible features')
      } else {
        result.manualOverrideRequired = true
        result.recommendations.push('Product too occluded - manual identification required')
      }
    }

    // Check historical feedback for similar occlusion cases
    const productId = result.originalResult.product?.id
    if (productId) {
      const occlusionHistory = this.feedbackHistory.get(`${productId}_occlusion`) || []
      if (occlusionHistory.length > 5) {
        const successRate = occlusionHistory.filter(f => f.correct).length / occlusionHistory.length
        if (successRate < 0.5) {
          result.manualOverrideRequired = true
          result.recommendations.push('Low success rate with occluded items - manual verification recommended')
        }
      }
    }

    return result
  }

  /**
   * Handle extreme angle detection
   */
  private async handleExtremeAngle(
    result: EdgeCaseResult,
    context: DetectionContext,
    imageData?: ImageData
  ): Promise<EdgeCaseResult> {
    result.edgeCaseDetected = true
    result.edgeCaseType = 'extreme_angle'
    
    const anglePenalty = Math.abs(context.angle) / 90
    result.confidence *= (1 - anglePenalty * 0.3)

    // Apply angle compensation
    if (imageData) {
      const compensatedImage = await this.compensateForAngle(imageData, context.angle)
      const angleCompensatedResult = await this.reprocessWithAngle(compensatedImage, context.angle)
      
      if (angleCompensatedResult.confidence > result.confidence) {
        result.adjustedResult = angleCompensatedResult
        result.confidence = angleCompensatedResult.confidence
        result.recommendations.push(`Angle compensation applied (${context.angle}°)`)
      }
    }

    // Check angle-specific product profiles
    const productId = result.originalResult.product?.id
    if (productId) {
      const product = this.productDatabase.get(productId)
      if (product?.angleProfiles) {
        const angleProfile = product.angleProfiles[Math.abs(context.angle)]
        if (angleProfile && angleProfile.confidence < 0.6) {
          result.manualOverrideRequired = true
          result.recommendations.push(`Product difficult to identify at ${context.angle}° angle`)
        }
      }
    }

    return result
  }

  /**
   * Handle packaged products
   */
  private async handlePackaging(
    result: EdgeCaseResult,
    context: DetectionContext,
    imageData?: ImageData
  ): Promise<EdgeCaseResult> {
    result.edgeCaseDetected = true
    result.edgeCaseType = 'packaging'
    
    // Reduce confidence for packaged items
    const packagingPenalty: Record<DetectionContext['packaging'], number> = {
      'none': 0,
      'box': 0.1,
      'wrapper': 0.15,
      'bottle': 0.2,
      'can': 0.05
    }
    
    result.confidence *= (1 - (packagingPenalty[context.packaging] || 0.1))

    // Try to see through packaging
    if (imageData) {
      const enhancedImage = await this.enhanceForPackaging(imageData, context.packaging)
      const packagingResult = await this.analyzeThroughPackaging(enhancedImage, context.packaging)
      
      if (packagingResult.confidence > result.confidence) {
        result.adjustedResult = packagingResult
        result.confidence = packagingResult.confidence
        result.recommendations.push(`Packaging analysis performed (${context.packaging})`)
      }
    }

    // Check for packaging variants
    const productId = result.originalResult.product?.id
    if (productId) {
      const product = this.productDatabase.get(productId)
      if (product?.packagingVariants?.includes(context.packaging)) {
        result.recommendations.push('Packaging variant recognized')
      } else {
        result.recommendations.push('Unusual packaging - verification recommended')
      }
    }

    return result
  }

  /**
   * Handle similar product differentiation
   */
  private async handleSimilarProducts(
    result: EdgeCaseResult,
    context: DetectionContext,
    imageData?: ImageData
  ): Promise<EdgeCaseResult> {
    const productId = result.originalResult.product?.id
    if (!productId) return result

    const product = this.productDatabase.get(productId)
    if (!product?.similarProducts || product.similarProducts.length === 0) return result

    result.edgeCaseDetected = true
    result.edgeCaseType = 'similar_products'

    // Analyze distinguishing features
    if (imageData) {
      const features = await this.extractDistinguishingFeaturesFromImage(imageData)
      const differentiation = await this.differentiateByFeatures(
        product.similarProducts,
        features,
        context
      )

      if (differentiation.confidence > result.confidence) {
        result.adjustedResult = differentiation
        result.confidence = differentiation.confidence
        result.recommendations.push(`Differentiated from similar products using key features`)
      } else if (result.confidence < this.config.similarityThreshold) {
        result.manualOverrideRequired = true
        result.recommendations.push('Cannot differentiate from similar products - manual selection required')
        
        // Provide alternatives
        result.recommendations.push(`Similar products: ${product.similarProducts.map((p: any) => p.name).join(', ')}`)
      }
    }

    return result
  }

  /**
   * Analyze visible portions of occluded product
   */
  private async analyzeVisiblePortions(imageData: ImageData, context: DetectionContext): Promise<any[]> {
    // Implement visible portion analysis
    // This would use computer vision to identify visible parts
    return [] // Placeholder
  }

  /**
   * Reconstruct product from visible portions
   */
  private reconstructFromPortions(originalResult: any, portions: any[]): any {
    // Implement reconstruction logic
    return originalResult // Placeholder
  }

  /**
   * Compensate for extreme angles
   */
  private async compensateForAngle(imageData: ImageData, angle: number): Promise<ImageData> {
    // Implement angle compensation using perspective transformation
    return imageData // Placeholder
  }

  /**
   * Reprocess with angle compensation
   */
  private async reprocessWithAngle(imageData: ImageData, angle: number): Promise<any> {
    // Implement reprocessing with angle-specific models
    return { confidence: 0.8 } // Placeholder
  }

  /**
   * Enhance image for packaging analysis
   */
  private async enhanceForPackaging(imageData: ImageData, packaging: string): Promise<ImageData> {
    // Implement packaging-specific enhancement
    return imageData // Placeholder
  }

  /**
   * Analyze through packaging
   */
  private async analyzeThroughPackaging(imageData: ImageData, packaging: string): Promise<any> {
    // Implement packaging penetration analysis
    return { confidence: 0.75 } // Placeholder
  }

  /**
   * Extract distinguishing features from image
   */
  private async extractDistinguishingFeaturesFromImage(imageData: ImageData): Promise<any> {
    // Implement feature extraction
    return {} // Placeholder
  }

  /**
   * Differentiate products by features
   */
  private async differentiateByFeatures(
    similarProducts: any[],
    features: any,
    context: DetectionContext
  ): Promise<any> {
    // Implement feature-based differentiation
    return { confidence: 0.85 } // Placeholder
  }

  /**
   * Find similar products in database
   */
  private findSimilarProducts(product: any, allProducts: any[]): any[] {
    // Implement similarity detection based on product attributes
    return allProducts
      .filter(p => p.id !== product.id && p.category === product.category)
      .slice(0, 5) // Top 5 similar products
  }

  /**
   * Generate angle profiles for product
   */
  private generateAngleProfiles(product: any): any {
    // Generate confidence profiles for different angles
    const profiles: Record<number, { confidence: number; features: any[] }> = {}
    for (let angle = 0; angle <= 90; angle += 15) {
      profiles[angle] = {
        confidence: Math.max(0.4, 1 - (angle / 90) * 0.5),
        features: []
      }
    }
    return profiles
  }

  /**
   * Get packaging variants for product
   */
  private getPackagingVariants(product: any): string[] {
    // Return known packaging variants for this product
    return ['none', 'box', 'wrapper'] // Placeholder
  }

  /**
   * Extract distinguishing features
   */
  private extractDistinguishingFeatures(product: any): any {
    // Extract features that differentiate this product from others
    return {
      color: product.color || [],
      shape: product.shape || '',
      size: product.size || '',
      text: product.text || '',
      logo: product.logo || ''
    }
  }

  /**
   * Record feedback for learning
   */
  recordFeedback(productId: string, edgeCaseType: string, correct: boolean): void {
    const key = `${productId}_${edgeCaseType}`
    const history = this.feedbackHistory.get(key) || []
    history.push({
      correct,
      timestamp: Date.now()
    })

    // Keep only recent feedback
    if (history.length > 100) {
      history.splice(0, history.length - 100)
    }

    this.feedbackHistory.set(key, history)
  }

  /**
   * Get feedback statistics
   */
  getFeedbackStatistics(): {
    totalFeedback: number
    successRate: number
    edgeCaseBreakdown: { [caseType: string]: { total: number; successRate: number } }
  } {
    let totalFeedback = 0
    let correctFeedback = 0
    const edgeCaseBreakdown: { [caseType: string]: { total: number; successRate: number } } = {}

    for (const [key, history] of this.feedbackHistory.entries()) {
      const edgeCaseType = key.split('_').slice(1).join('_')
      const correct = history.filter(f => f.correct).length
      const total = history.length

      totalFeedback += total
      correctFeedback += correct

      if (!edgeCaseBreakdown[edgeCaseType]) {
        edgeCaseBreakdown[edgeCaseType] = { total: 0, successRate: 0 }
      }
      edgeCaseBreakdown[edgeCaseType].total += total
      edgeCaseBreakdown[edgeCaseType].successRate = correct / total
    }

    return {
      totalFeedback,
      successRate: totalFeedback > 0 ? correctFeedback / totalFeedback : 0,
      edgeCaseBreakdown
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<EdgeCaseConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Get current configuration
   */
  getConfig(): EdgeCaseConfig {
    return { ...this.config }
  }

  /**
   * Get edge case handling recommendations
   */
  getRecommendations(): Array<{
    edgeCase: string
    recommendation: string
    priority: 'high' | 'medium' | 'low'
  }> {
    const stats = this.getFeedbackStatistics()
    const recommendations: Array<{
      edgeCase: string
      recommendation: string
      priority: 'high' | 'medium'
    }> = []

    for (const [edgeCase, data] of Object.entries(stats.edgeCaseBreakdown)) {
      if (data.successRate < 0.6 && data.total > 10) {
        recommendations.push({
          edgeCase,
          recommendation: `Low success rate (${(data.successRate * 100).toFixed(1)}%) - consider improving ${edgeCase} handling`,
          priority: data.successRate < 0.4 ? 'high' : 'medium'
        })
      }
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }
}

export { EdgeCaseHandler }
export default EdgeCaseHandler
