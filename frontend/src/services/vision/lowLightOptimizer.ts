// Low-Light Optimization for Visual Recognition

export interface LowLightConfig {
  enableNightMode: boolean
  enableFrameAveraging: boolean
  averagingFrames: number
  enableFlashAssist: boolean
  flashThreshold: number
  sensitivityBoost: number
  noiseReduction: boolean
  adaptiveThreshold: boolean
}

export interface LightCondition {
  brightness: number // 0-255
  condition: 'bright' | 'normal' | 'low' | 'very_low'
  recommended: {
    enableNightMode: boolean
    enableFlash: boolean
    sensitivity: number
  }
}

class LowLightOptimizer {
  private config: LowLightConfig
  private frameBuffer: ImageData[] = []
  private isInitialized: boolean = false
  private currentLightCondition: LightCondition | null = null

  constructor(config: Partial<LowLightConfig> = {}) {
    this.config = {
      enableNightMode: true,
      enableFrameAveraging: true,
      averagingFrames: 3,
      enableFlashAssist: true,
      flashThreshold: 50,
      sensitivityBoost: 1.5,
      noiseReduction: true,
      adaptiveThreshold: true,
      ...config
    }
  }

  /**
   * Initialize the optimizer
   */
  async initialize(): Promise<void> {
    console.log('Initializing low-light optimizer...')
    this.isInitialized = true
    console.log('Low-light optimizer initialized with night mode capabilities')
  }

  /**
   * Analyze current lighting conditions
   */
  analyzeLightCondition(imageData: ImageData): LightCondition {
    const brightness = this.calculateBrightness(imageData)
    let condition: LightCondition['condition']
    let recommended: LightCondition['recommended']

    if (brightness > 180) {
      condition = 'bright'
      recommended = {
        enableNightMode: false,
        enableFlash: false,
        sensitivity: 1.0
      }
    } else if (brightness > 100) {
      condition = 'normal'
      recommended = {
        enableNightMode: false,
        enableFlash: false,
        sensitivity: 1.0
      }
    } else if (brightness > 50) {
      condition = 'low'
      recommended = {
        enableNightMode: true,
        enableFlash: brightness < this.config.flashThreshold,
        sensitivity: 1.3
      }
    } else {
      condition = 'very_low'
      recommended = {
        enableNightMode: true,
        enableFlash: true,
        sensitivity: 1.8
      }
    }

    this.currentLightCondition = {
      brightness,
      condition,
      recommended
    }

    return this.currentLightCondition
  }

  /**
   * Calculate image brightness
   */
  private calculateBrightness(imageData: ImageData): number {
    const { data } = imageData
    let totalBrightness = 0

    for (let i = 0; i < data.length; i += 4) {
      // Use luminance formula
      const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
      totalBrightness += luminance
    }

    return totalBrightness / (data.length / 4)
  }

  /**
   * Optimize frame for low-light conditions
   */
  async optimizeFrame(imageData: ImageData): Promise<ImageData> {
    if (!this.isInitialized) {
      throw new Error('Low-light optimizer not initialized')
    }

    let optimizedFrame = new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height
    )

    const lightCondition = this.analyzeLightCondition(imageData)

    // Apply optimizations based on light condition
    if (this.config.enableNightMode && lightCondition.recommended.enableNightMode) {
      optimizedFrame = this.applyNightMode(optimizedFrame, lightCondition.recommended.sensitivity)
    }

    if (this.config.enableFrameAveraging && lightCondition.condition !== 'bright') {
      optimizedFrame = await this.applyFrameAveraging(optimizedFrame)
    }

    if (this.config.noiseReduction && lightCondition.condition === 'very_low') {
      optimizedFrame = this.applyNoiseReduction(optimizedFrame)
    }

    if (this.config.adaptiveThreshold) {
      optimizedFrame = this.applyAdaptiveThreshold(optimizedFrame, lightCondition)
    }

    return optimizedFrame
  }

  /**
   * Apply night mode enhancements
   */
  private applyNightMode(imageData: ImageData, sensitivity: number): ImageData {
    const { data } = imageData
    const processed = new Uint8ClampedArray(data)

    // Enhanced brightness and contrast adjustment
    for (let i = 0; i < data.length; i += 4) {
      // Increase sensitivity for low light
      let r = data[i] * sensitivity
      let g = data[i + 1] * sensitivity
      let b = data[i + 2] * sensitivity

      // Apply gamma correction for better low-light visibility
      const gamma = 0.7 // Lower gamma brightens dark areas
      r = 255 * Math.pow(r / 255, gamma)
      g = 255 * Math.pow(g / 255, gamma)
      b = 255 * Math.pow(b / 255, gamma)

      // Enhance blue channel (better for low light)
      b = Math.min(255, b * 1.1)

      // Clamp values
      processed[i] = Math.min(255, Math.max(0, r))
      processed[i + 1] = Math.min(255, Math.max(0, g))
      processed[i + 2] = Math.min(255, Math.max(0, b))
      processed[i + 3] = data[i + 3] // Keep alpha
    }

    return new ImageData(processed, imageData.width, imageData.height)
  }

  /**
   * Apply frame averaging for noise reduction
   */
  private async applyFrameAveraging(imageData: ImageData): Promise<ImageData> {
    // Add current frame to buffer
    this.frameBuffer.push(imageData)

    // Keep only the specified number of frames
    if (this.frameBuffer.length > this.config.averagingFrames) {
      this.frameBuffer.shift()
    }

    // If we have enough frames, average them
    if (this.frameBuffer.length === this.config.averagingFrames) {
      return this.averageFrames(this.frameBuffer)
    }

    return imageData
  }

  /**
   * Average multiple frames to reduce noise
   */
  private averageFrames(frames: ImageData[]): ImageData {
    if (frames.length === 0) return frames[0]

    const { width, height } = frames[0]
    const averagedData = new Uint8ClampedArray(width * height * 4)

    // Sum all frames
    for (const frame of frames) {
      for (let i = 0; i < frame.data.length; i++) {
        averagedData[i] += frame.data[i]
      }
    }

    // Divide by number of frames
    const frameCount = frames.length
    for (let i = 0; i < averagedData.length; i++) {
      averagedData[i] = Math.round(averagedData[i] / frameCount)
    }

    return new ImageData(averagedData, width, height)
  }

  /**
   * Apply advanced noise reduction
   */
  private applyNoiseReduction(imageData: ImageData): ImageData {
    const { data, width, height } = imageData
    const processed = new Uint8ClampedArray(data)

    // Apply bilateral filter for edge-preserving noise reduction
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) {
          const centerIdx = (y * width + x) * 4 + c
          const centerValue = data[centerIdx]

          let weightedSum = 0
          let weightSum = 0

          // 5x5 kernel for better noise reduction
          for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
              const neighborIdx = ((y + dy) * width + (x + dx)) * 4 + c
              const neighborValue = data[neighborIdx]

              // Spatial weight (Gaussian)
              const spatialWeight = Math.exp(-(dx * dx + dy * dy) / 8)
              
              // Intensity weight (preserve edges)
              const intensityDiff = Math.abs(centerValue - neighborValue)
              const intensityWeight = Math.exp(-(intensityDiff * intensityDiff) / 50)

              const totalWeight = spatialWeight * intensityWeight
              weightedSum += neighborValue * totalWeight
              weightSum += totalWeight
            }
          }

          processed[centerIdx] = Math.round(weightedSum / weightSum)
        }
      }
    }

    return new ImageData(processed, width, height)
  }

  /**
   * Apply adaptive threshold based on lighting conditions
   */
  private applyAdaptiveThreshold(imageData: ImageData, lightCondition: LightCondition): ImageData {
    const { data, width, height } = imageData
    const processed = new Uint8ClampedArray(data)

    // Calculate local threshold for each pixel
    const windowSize = lightCondition.condition === 'very_low' ? 15 : 11
    const c = lightCondition.condition === 'very_low' ? 2 : 5

    for (let y = windowSize; y < height - windowSize; y++) {
      for (let x = windowSize; x < width - windowSize; x++) {
        const idx = (y * width + x) * 4

        // Calculate local mean and standard deviation
        let sum = 0
        let sumSquared = 0
        let count = 0

        for (let dy = -windowSize; dy <= windowSize; dy++) {
          for (let dx = -windowSize; dx <= windowSize; dx++) {
            const nIdx = ((y + dy) * width + (x + dx)) * 4
            const gray = (data[nIdx] + data[nIdx + 1] + data[nIdx + 2]) / 3
            sum += gray
            sumSquared += gray * gray
            count++
          }
        }

        const mean = sum / count
        const stdDev = Math.sqrt((sumSquared / count) - (mean * mean))

        // Adaptive threshold
        const threshold = mean - c * stdDev
        const currentGray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3

        const binaryValue = currentGray > threshold ? 255 : 0
        processed[idx] = binaryValue
        processed[idx + 1] = binaryValue
        processed[idx + 2] = binaryValue
      }
    }

    return new ImageData(processed, width, height)
  }

  /**
   * Check if flash assist is recommended
   */
  shouldEnableFlash(): boolean {
    if (!this.currentLightCondition) return false
    return this.config.enableFlashAssist && this.currentLightCondition.recommended.enableFlash
  }

  /**
   * Get current light condition
   */
  getCurrentLightCondition(): LightCondition | null {
    return this.currentLightCondition
  }

  /**
   * Get recommended camera settings for current conditions
   */
  getRecommendedCameraSettings(): {
    exposure: number
    iso: number
    enableTorch: boolean
    frameRate: number
  } {
    if (!this.currentLightCondition) {
      return {
        exposure: 0,
        iso: 100,
        enableTorch: false,
        frameRate: 30
      }
    }

    const { condition } = this.currentLightCondition

    switch (condition) {
      case 'bright':
        return {
          exposure: -2,
          iso: 100,
          enableTorch: false,
          frameRate: 30
        }
      case 'normal':
        return {
          exposure: 0,
          iso: 200,
          enableTorch: false,
          frameRate: 30
        }
      case 'low':
        return {
          exposure: 2,
          iso: 400,
          enableTorch: false,
          frameRate: 25
        }
      case 'very_low':
        return {
          exposure: 4,
          iso: 800,
          enableTorch: true,
          frameRate: 20
        }
      default:
        return {
          exposure: 0,
          iso: 200,
          enableTorch: false,
          frameRate: 30
        }
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<LowLightConfig>): void {
    this.config = { ...this.config, ...config }
    
    // Clear frame buffer if averaging settings changed
    if (config.averagingFrames !== undefined) {
      this.frameBuffer = []
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): LowLightConfig {
    return { ...this.config }
  }

  /**
   * Clear frame buffer
   */
  clearFrameBuffer(): void {
    this.frameBuffer = []
  }

  /**
   * Get optimization statistics
   */
  getStatistics(): {
    framesProcessed: number
    averageBrightness: number
    currentCondition: string
    optimizationsApplied: string[]
  } {
    return {
      framesProcessed: this.frameBuffer.length,
      averageBrightness: this.currentLightCondition?.brightness || 0,
      currentCondition: this.currentLightCondition?.condition || 'unknown',
      optimizationsApplied: [
        this.config.enableNightMode ? 'night_mode' : null,
        this.config.enableFrameAveraging ? 'frame_averaging' : null,
        this.config.noiseReduction ? 'noise_reduction' : null,
        this.config.adaptiveThreshold ? 'adaptive_threshold' : null
      ].filter(Boolean) as string[]
    }
  }

  /**
   * Reset optimizer state
   */
  reset(): void {
    this.frameBuffer = []
    this.currentLightCondition = null
  }
}

export { LowLightOptimizer }
export default LowLightOptimizer
