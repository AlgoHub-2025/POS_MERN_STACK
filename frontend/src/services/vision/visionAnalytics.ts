// Vision Recognition Analytics Service

export interface VisionMetrics {
  totalScans: number
  successfulScans: number
  averageProcessingTime: number
  averageConfidence: number
  accuracyByCategory: { [category: string]: { correct: number; total: number } }
  accuracyByLighting: { [condition: string]: { correct: number; total: number } }
  accuracyByAngle: { [angle: string]: { correct: number; total: number } }
  performanceOverTime: Array<{
    timestamp: number
    accuracy: number
    processingTime: number
    confidence: number
  }>
  failedDetections: Array<{
    timestamp: number
    reason: string
    imageData?: string
    confidence: number
  }>
  topPerformingProducts: Array<{
    productId: string
    productName: string
    accuracy: number
    detectionCount: number
  }>
  lowPerformingProducts: Array<{
    productId: string
    productName: string
    accuracy: number
    detectionCount: number
  }>
}

export interface DetectionEvent {
  timestamp: number
  productId?: string
  productName?: string
  category?: string
  confidence: number
  processingTime: number
  success: boolean
  lightingCondition: 'bright' | 'normal' | 'low'
  angle: number
  boundingBox?: {
    x: number
    y: number
    width: number
    height: number
  }
  imageData?: string
  errors?: string[]
}

class VisionAnalytics {
  private events: DetectionEvent[] = []
  private metrics: VisionMetrics
  private maxEvents: number = 10000
  private performanceWindowSize: number = 1000 // Last 1000 events for performance metrics

  constructor() {
    this.metrics = this.initializeMetrics()
    this.loadStoredData()
  }

  private initializeMetrics(): VisionMetrics {
    return {
      totalScans: 0,
      successfulScans: 0,
      averageProcessingTime: 0,
      averageConfidence: 0,
      accuracyByCategory: {},
      accuracyByLighting: {},
      accuracyByAngle: {},
      performanceOverTime: [],
      failedDetections: [],
      topPerformingProducts: [],
      lowPerformingProducts: []
    }
  }

  /**
   * Record a detection event
   */
  recordDetection(event: DetectionEvent): void {
    this.events.push(event)
    
    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents)
    }

    // Update metrics
    this.updateMetrics(event)

    // Save to storage
    this.saveData()
  }

  /**
   * Update metrics based on new event
   */
  private updateMetrics(event: DetectionEvent): void {
    this.metrics.totalScans++

    if (event.success) {
      this.metrics.successfulScans++
    }

    // Update processing time
    this.metrics.averageProcessingTime = 
      (this.metrics.averageProcessingTime * (this.metrics.totalScans - 1) + event.processingTime) / 
      this.metrics.totalScans

    // Update confidence
    this.metrics.averageConfidence = 
      (this.metrics.averageConfidence * (this.metrics.totalScans - 1) + event.confidence) / 
      this.metrics.totalScans

    // Update category accuracy
    if (event.category) {
      if (!this.metrics.accuracyByCategory[event.category]) {
        this.metrics.accuracyByCategory[event.category] = { correct: 0, total: 0 }
      }
      this.metrics.accuracyByCategory[event.category].total++
      if (event.success) {
        this.metrics.accuracyByCategory[event.category].correct++
      }
    }

    // Update lighting accuracy
    if (!this.metrics.accuracyByLighting[event.lightingCondition]) {
      this.metrics.accuracyByLighting[event.lightingCondition] = { correct: 0, total: 0 }
    }
    this.metrics.accuracyByLighting[event.lightingCondition].total++
    if (event.success) {
      this.metrics.accuracyByLighting[event.lightingCondition].correct++
    }

    // Update angle accuracy
    const angleRange = this.getAngleRange(event.angle)
    if (!this.metrics.accuracyByAngle[angleRange]) {
      this.metrics.accuracyByAngle[angleRange] = { correct: 0, total: 0 }
    }
    this.metrics.accuracyByAngle[angleRange].total++
    if (event.success) {
      this.metrics.accuracyByAngle[angleRange].correct++
    }

    // Update performance over time
    this.metrics.performanceOverTime.push({
      timestamp: event.timestamp,
      accuracy: event.success ? 1 : 0,
      processingTime: event.processingTime,
      confidence: event.confidence
    })

    // Keep only recent performance data
    if (this.metrics.performanceOverTime.length > this.performanceWindowSize) {
      this.metrics.performanceOverTime = this.metrics.performanceOverTime.slice(-this.performanceWindowSize)
    }

    // Record failed detections
    if (!event.success) {
      this.metrics.failedDetections.push({
        timestamp: event.timestamp,
        reason: event.errors?.join(', ') || 'Unknown',
        imageData: event.imageData,
        confidence: event.confidence
      })

      // Keep only recent failures
      if (this.metrics.failedDetections.length > 100) {
        this.metrics.failedDetections = this.metrics.failedDetections.slice(-100)
      }
    }

    // Update product performance
    this.updateProductPerformance()
  }

  /**
   * Get angle range for analytics
   */
  private getAngleRange(angle: number): string {
    if (angle >= 0 && angle < 15) return '0-15°'
    if (angle >= 15 && angle < 30) return '15-30°'
    if (angle >= 30 && angle < 45) return '30-45°'
    if (angle >= 45 && angle < 60) return '45-60°'
    if (angle >= 60 && angle < 75) return '60-75°'
    return '75-90°'
  }

  /**
   * Update product performance rankings
   */
  private updateProductPerformance(): void {
    const productStats: { [productId: string]: { name: string; correct: number; total: number } } = {}

    // Aggregate product statistics
    for (const event of this.events) {
      if (event.productId && event.productName) {
        if (!productStats[event.productId]) {
          productStats[event.productId] = { name: event.productName, correct: 0, total: 0 }
        }
        productStats[event.productId].total++
        if (event.success) {
          productStats[event.productId].correct++
        }
      }
    }

    // Calculate performance for each product
    const productPerformance = Object.entries(productStats).map(([productId, stats]) => ({
      productId,
      productName: stats.name,
      accuracy: stats.total > 0 ? stats.correct / stats.total : 0,
      detectionCount: stats.total
    }))

    // Sort by accuracy and detection count
    productPerformance.sort((a, b) => {
      if (Math.abs(a.accuracy - b.accuracy) < 0.05) {
        return b.detectionCount - a.detectionCount
      }
      return b.accuracy - a.accuracy
    })

    // Update top and low performing products
    this.metrics.topPerformingProducts = productPerformance
      .filter(p => p.detectionCount >= 5) // Minimum 5 detections
      .slice(0, 10)

    this.metrics.lowPerformingProducts = productPerformance
      .filter(p => p.detectionCount >= 5) // Minimum 5 detections
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 10)
  }

  /**
   * Get current metrics
   */
  getMetrics(): VisionMetrics {
    return { ...this.metrics }
  }

  /**
   * Get overall accuracy
   */
  getOverallAccuracy(): number {
    return this.metrics.totalScans > 0 
      ? this.metrics.successfulScans / this.metrics.totalScans 
      : 0
  }

  /**
   * Get accuracy by category
   */
  getAccuracyByCategory(): { [category: string]: number } {
    const result: { [category: string]: number } = {}
    for (const [category, stats] of Object.entries(this.metrics.accuracyByCategory)) {
      result[category] = stats.total > 0 ? stats.correct / stats.total : 0
    }
    return result
  }

  /**
   * Get accuracy by lighting condition
   */
  getAccuracyByLighting(): { [condition: string]: number } {
    const result: { [condition: string]: number } = {}
    for (const [condition, stats] of Object.entries(this.metrics.accuracyByLighting)) {
      result[condition] = stats.total > 0 ? stats.correct / stats.total : 0
    }
    return result
  }

  /**
   * Get accuracy by angle
   */
  getAccuracyByAngle(): { [angle: string]: number } {
    const result: { [angle: string]: number } = {}
    for (const [angle, stats] of Object.entries(this.metrics.accuracyByAngle)) {
      result[angle] = stats.total > 0 ? stats.correct / stats.total : 0
    }
    return result
  }

  /**
   * Get recent performance trend
   */
  getPerformanceTrend(windowSize: number = 100): {
    trend: 'improving' | 'declining' | 'stable'
    change: number
  } {
    const recent = this.metrics.performanceOverTime.slice(-windowSize)
    if (recent.length < 10) return { trend: 'stable', change: 0 }

    const firstHalf = recent.slice(0, Math.floor(recent.length / 2))
    const secondHalf = recent.slice(Math.floor(recent.length / 2))

    const firstAvg = firstHalf.reduce((sum, p) => sum + p.accuracy, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((sum, p) => sum + p.accuracy, 0) / secondHalf.length

    const change = secondAvg - firstAvg

    let trend: 'improving' | 'declining' | 'stable'
    if (change > 0.05) trend = 'improving'
    else if (change < -0.05) trend = 'declining'
    else trend = 'stable'

    return { trend, change }
  }

  /**
   * Get performance insights
   */
  getInsights(): Array<{
    type: 'warning' | 'info' | 'success'
    message: string
    recommendation?: string
  }> {
    const insights: Array<{
      type: 'info' | 'success' | 'warning'
      message: string
      recommendation?: string
    }> = []
    const accuracy = this.getOverallAccuracy()

    // Overall accuracy insights
    if (accuracy < 0.8) {
      insights.push({
        type: 'warning',
        message: `Overall accuracy is ${(accuracy * 100).toFixed(1)}%, below target of 80%`,
        recommendation: 'Consider retraining the model with more diverse data'
      })
    } else if (accuracy > 0.95) {
      insights.push({
        type: 'success',
        message: `Excellent accuracy of ${(accuracy * 100).toFixed(1)}% achieved`
      })
    }

    // Lighting condition insights
    const lightingAccuracy = this.getAccuracyByLighting()
    if (lightingAccuracy.low && lightingAccuracy.low < 0.7) {
      insights.push({
        type: 'warning',
        message: `Low light accuracy is ${(lightingAccuracy.low * 100).toFixed(1)}%`,
        recommendation: 'Enable low-light optimization or improve lighting conditions'
      })
    }

    // Angle insights
    const angleAccuracy = this.getAccuracyByAngle()
    const poorAngles = Object.entries(angleAccuracy).filter(([_, accuracy]) => accuracy < 0.7)
    if (poorAngles.length > 0) {
      insights.push({
        type: 'info',
        message: `Detection accuracy drops at angles: ${poorAngles.map(([angle]) => angle).join(', ')}`,
        recommendation: 'Train model with more angled product images'
      })
    }

    // Performance trend
    const trend = this.getPerformanceTrend()
    if (trend.trend === 'declining') {
      insights.push({
        type: 'warning',
        message: 'Detection performance is declining over time',
        recommendation: 'Investigate recent changes and consider model retraining'
      })
    }

    // Processing time insights
    if (this.metrics.averageProcessingTime > 500) {
      insights.push({
        type: 'info',
        message: `Average processing time is ${this.metrics.averageProcessingTime.toFixed(0)}ms, above target of 500ms`,
        recommendation: 'Optimize detection algorithm or reduce image resolution'
      })
    }

    return insights
  }

  /**
   * Export analytics data
   */
  exportData(): {
    metrics: VisionMetrics
    events: DetectionEvent[]
    exportTimestamp: number
  } {
    return {
      metrics: this.getMetrics(),
      events: this.events.slice(-1000), // Last 1000 events
      exportTimestamp: Date.now()
    }
  }

  /**
   * Import analytics data
   */
  importData(data: { metrics?: VisionMetrics; events?: DetectionEvent[] }): void {
    if (data.metrics) {
      this.metrics = { ...this.metrics, ...data.metrics }
    }
    if (data.events) {
      this.events.push(...data.events)
      if (this.events.length > this.maxEvents) {
        this.events = this.events.slice(-this.maxEvents)
      }
    }
    this.saveData()
  }

  /**
   * Clear all analytics data
   */
  clearData(): void {
    this.events = []
    this.metrics = this.initializeMetrics()
    this.saveData()
  }

  /**
   * Save data to local storage
   */
  private saveData(): void {
    try {
      const data = {
        events: this.events.slice(-1000), // Save last 1000 events
        metrics: this.metrics
      }
      localStorage.setItem('vision_analytics', JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save vision analytics:', error)
    }
  }

  /**
   * Load data from local storage
   */
  private loadStoredData(): void {
    try {
      const stored = localStorage.getItem('vision_analytics')
      if (stored) {
        const data = JSON.parse(stored)
        if (data.events) {
          this.events = data.events.map((event: any) => ({
            ...event,
            timestamp: new Date(event.timestamp).getTime()
          }))
        }
        if (data.metrics) {
          this.metrics = { ...this.metrics, ...data.metrics }
        }
      }
    } catch (error) {
      console.error('Failed to load vision analytics:', error)
    }
  }

  /**
   * Get summary statistics
   */
  getSummary(): {
    totalScans: number
    successRate: number
    averageConfidence: number
    averageProcessingTime: number
    topCategory: string
    worstCategory: string
    performanceTrend: 'improving' | 'declining' | 'stable'
  } {
    const categoryAccuracy = this.getAccuracyByCategory()
    const categories = Object.entries(categoryAccuracy)
    
    const topCategory = categories.length > 0 
      ? categories.reduce((best, [category, accuracy]) => accuracy > best.accuracy ? { category, accuracy } : best, { category: '', accuracy: 0 }).category
      : 'N/A'
    
    const worstCategory = categories.length > 0 
      ? categories.reduce((worst, [category, accuracy]) => accuracy < worst.accuracy ? { category, accuracy } : worst, { category: '', accuracy: 1 }).category
      : 'N/A'

    return {
      totalScans: this.metrics.totalScans,
      successRate: this.getOverallAccuracy(),
      averageConfidence: this.metrics.averageConfidence,
      averageProcessingTime: this.metrics.averageProcessingTime,
      topCategory,
      worstCategory,
      performanceTrend: this.getPerformanceTrend().trend
    }
  }
}

export { VisionAnalytics }
export default VisionAnalytics
