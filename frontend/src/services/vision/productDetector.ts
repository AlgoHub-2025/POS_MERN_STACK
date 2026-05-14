// Product Detection Algorithm with Enhanced Accuracy

export interface DetectionResult {
  product: {
    id: string
    name: string
    price: number
    category: string
    confidence: number
  }
  boundingBox: {
    x: number
    y: number
    width: number
    height: number
  }
  confidence: number
  timestamp: number
  processingTime: number
}

export interface ProductSignature {
  id: string
  name: string
  category: string
  features: {
    colorHistogram: number[]
    shapeFeatures: number[]
    textureFeatures: number[]
    sizeFeatures: number[]
  }
  confidence: number
}

export interface DetectionConfig {
  minConfidence: number
  maxDetections: number
  enableBarcodeFallback: boolean
  enableMultiDetection: boolean
  enableBatchProcessing: boolean
  lowLightMode: boolean
}

class ProductDetector {
  private productSignatures: Map<string, ProductSignature> = new Map()
  private isInitialized: boolean = false
  private config: DetectionConfig
  private detectionHistory: DetectionResult[] = []
  private performanceMetrics: {
    totalDetections: number
    successfulDetections: number
    averageProcessingTime: number
    averageConfidence: number
    accuracyByCategory: { [category: string]: { correct: number; total: number } }
  }

  constructor(config: Partial<DetectionConfig> = {}) {
    this.config = {
      minConfidence: 0.7,
      maxDetections: 5,
      enableBarcodeFallback: true,
      enableMultiDetection: true,
      enableBatchProcessing: false,
      lowLightMode: false,
      ...config
    }

    this.performanceMetrics = {
      totalDetections: 0,
      successfulDetections: 0,
      averageProcessingTime: 0,
      averageConfidence: 0,
      accuracyByCategory: {}
    }
  }

  /**
   * Initialize detector with product database
   */
  async initialize(products: any[]): Promise<void> {
    console.log('Initializing product detector...')
    
    // Generate signatures for all products
    for (const product of products) {
      const signature = await this.generateProductSignature(product)
      this.productSignatures.set(product.id, signature)
    }

    this.isInitialized = true
    console.log(`Product detector initialized with ${this.productSignatures.size} products`)
  }

  /**
   * Detect products in image frame
   */
  async detectProducts(imageData: ImageData): Promise<DetectionResult[]> {
    if (!this.isInitialized) {
      throw new Error('Product detector not initialized')
    }

    const startTime = Date.now()
    const results: DetectionResult[] = []

    try {
      // Preprocess image
      const processedImage = this.preprocessImage(imageData)

      // Detect potential product regions
      const regions = await this.detectProductRegions(processedImage)

      // Process each region
      for (const region of regions) {
        if (results.length >= this.config.maxDetections) break

        const detection = await this.processRegion(region, processedImage)
        if (detection && detection.confidence >= this.config.minConfidence) {
          results.push(detection)
        }
      }

      // Sort by confidence
      results.sort((a, b) => b.confidence - a.confidence)

      // Update metrics
      const processingTime = Date.now() - startTime
      this.updateMetrics(results, processingTime)

      // Store in history
      this.detectionHistory.push(...results)
      if (this.detectionHistory.length > 1000) {
        this.detectionHistory = this.detectionHistory.slice(-1000)
      }

      return results
    } catch (error) {
      console.error('Product detection failed:', error)
      return []
    }
  }

  /**
   * Preprocess image for better detection
   */
  private preprocessImage(imageData: ImageData): ImageData {
    const processed = new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height
    )

    const data = processed.data

    // Apply preprocessing based on configuration
    if (this.config.lowLightMode) {
      this.enhanceLowLight(data)
    }

    // Normalize brightness and contrast
    this.normalizeImage(data)

    // Reduce noise
    this.reduceNoise(data)

    return processed
  }

  /**
   * Enhance low-light conditions
   */
  private enhanceLowLight(data: Uint8ClampedArray): void {
    for (let i = 0; i < data.length; i += 4) {
      // Increase brightness and contrast
      data[i] = Math.min(255, data[i] * 1.3)     // Red
      data[i + 1] = Math.min(255, data[i + 1] * 1.3) // Green
      data[i + 2] = Math.min(255, data[i + 2] * 1.3) // Blue
    }
  }

  /**
   * Normalize image brightness and contrast
   */
  private normalizeImage(data: Uint8ClampedArray): void {
    // Calculate histogram
    const histogram = new Array(256).fill(0)
    for (let i = 0; i < data.length; i += 4) {
      const gray = (data[i] + data[i + 1] + data[i + 2]) / 3
      histogram[Math.floor(gray)]++
    }

    // Calculate normalization parameters
    let cumulativeSum = 0
    let minCumulative = 0
    let maxCumulative = data.length / 4

    for (let i = 0; i < 256; i++) {
      cumulativeSum += histogram[i]
      if (minCumulative === 0 && cumulativeSum > maxCumulative * 0.05) {
        minCumulative = i
      }
      if (maxCumulative === data.length / 4 && cumulativeSum > maxCumulative * 0.95) {
        maxCumulative = i
        break
      }
    }

    // Apply normalization
    const range = maxCumulative - minCumulative
    if (range > 0) {
      for (let i = 0; i < data.length; i += 4) {
        data[i] = ((data[i] - minCumulative) / range) * 255
        data[i + 1] = ((data[i + 1] - minCumulative) / range) * 255
        data[i + 2] = ((data[i + 2] - minCumulative) / range) * 255
      }
    }
  }

  /**
   * Reduce noise using median filter
   */
  private reduceNoise(data: Uint8ClampedArray): void {
    const width = Math.sqrt(data.length / 4)
    const height = width
    const output = new Uint8ClampedArray(data)

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) {
          const values = []
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const idx = ((y + dy) * width + (x + dx)) * 4 + c
              values.push(data[idx])
            }
          }
          values.sort((a, b) => a - b)
          const outputIdx = (y * width + x) * 4 + c
          output[outputIdx] = values[4] // Median
        }
      }
    }

    // Copy back
    for (let i = 0; i < data.length; i++) {
      data[i] = output[i]
    }
  }

  /**
   * Detect potential product regions using edge detection
   */
  private async detectProductRegions(imageData: ImageData): Promise<Array<{ x: number; y: number; width: number; height: number }>> {
    const regions = []
    const width = imageData.width
    const height = imageData.height

    // Simple edge detection using Sobel operator
    const edges = this.detectEdges(imageData)

    // Find contours
    const contours = this.findContours(edges, width, height)

    // Convert contours to bounding boxes
    for (const contour of contours) {
      const bbox = this.contourToBoundingBox(contour, width, height)
      if (bbox && bbox.width > 50 && bbox.height > 50) {
        regions.push(bbox)
      }
    }

    return regions
  }

  /**
   * Detect edges using Sobel operator
   */
  private detectEdges(imageData: ImageData): Uint8Array {
    const width = imageData.width
    const height = imageData.height
    const edges = new Uint8Array(width * height)

    // Convert to grayscale
    const gray = new Float32Array(width * height)
    for (let i = 0; i < imageData.data.length; i += 4) {
      gray[i / 4] = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3
    }

    // Sobel operators
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1]
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1]

    // Apply Sobel
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0, gy = 0

        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = (y + ky) * width + (x + kx)
            const kernelIdx = (ky + 1) * 3 + (kx + 1)
            gx += gray[idx] * sobelX[kernelIdx]
            gy += gray[idx] * sobelY[kernelIdx]
          }
        }

        const magnitude = Math.sqrt(gx * gx + gy * gy)
        edges[y * width + x] = magnitude > 50 ? 255 : 0
      }
    }

    return edges
  }

  /**
   * Find contours in edge image
   */
  private findContours(edges: Uint8Array, width: number, height: number): number[][] {
    // Simplified contour detection - in production, use more sophisticated algorithms
    const contours = []
    const visited = new Uint8Array(width * height)

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x
        if (edges[idx] === 255 && visited[idx] === 0) {
          const contour = this.traceContour(edges, visited, x, y, width, height)
          if (contour.length > 20) {
            contours.push(contour)
          }
        }
      }
    }

    return contours
  }

  /**
   * Trace a single contour
   */
  private traceContour(edges: Uint8Array, visited: Uint8Array, startX: number, startY: number, width: number, height: number): number[] {
    const contour = []
    const stack = [[startX, startY]]

    while (stack.length > 0) {
      const [x, y] = stack.pop()!
      const idx = y * width + x

      if (x < 0 || x >= width || y < 0 || y >= height || visited[idx] === 1 || edges[idx] === 0) {
        continue
      }

      visited[idx] = 1
      contour.push(x, y)

      // Add neighbors
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue
          stack.push([x + dx, y + dy])
        }
      }
    }

    return contour
  }

  /**
   * Convert contour to bounding box
   */
  private contourToBoundingBox(contour: number[], width: number, height: number): { x: number; y: number; width: number; height: number } | null {
    if (contour.length < 4) return null

    let minX = width, minY = height, maxX = 0, maxY = 0

    for (let i = 0; i < contour.length; i += 2) {
      const x = contour[i]
      const y = contour[i + 1]
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    }
  }

  /**
   * Process detected region for product identification
   */
  private async processRegion(region: { x: number; y: number; width: number; height: number }, imageData: ImageData): Promise<DetectionResult | null> {
    // Extract region features
    const features = this.extractRegionFeatures(region, imageData)

    // Compare with product signatures
    let bestMatch: ProductSignature | null = null
    let bestScore = 0

    for (const signature of this.productSignatures.values()) {
      const score = this.compareFeatures(features, signature.features)
      if (score > bestScore) {
        bestScore = score
        bestMatch = signature
      }
    }

    if (bestMatch && bestScore >= this.config.minConfidence) {
      return {
        product: {
          id: bestMatch.id,
          name: bestMatch.name,
          price: 0, // Would be loaded from product database
          category: bestMatch.category,
          confidence: bestScore
        },
        boundingBox: region,
        confidence: bestScore,
        timestamp: Date.now(),
        processingTime: 0 // Would be calculated
      }
    }

    return null
  }

  /**
   * Extract features from detected region
   */
  private extractRegionFeatures(region: { x: number; y: number; width: number; height: number }, imageData: ImageData): ProductSignature['features'] {
    // Extract region from image
    const regionData = this.extractRegionData(region, imageData)

    return {
      colorHistogram: this.computeColorHistogram(regionData),
      shapeFeatures: this.computeShapeFeatures(regionData),
      textureFeatures: this.computeTextureFeatures(regionData),
      sizeFeatures: this.computeSizeFeatures(region)
    }
  }

  /**
   * Extract region data from image
   */
  private extractRegionData(region: { x: number; y: number; width: number; height: number }, imageData: ImageData): ImageData {
    const { x, y, width, height } = region
    const regionData = new ImageData(width, height)

    for (let ry = 0; ry < height; ry++) {
      for (let rx = 0; rx < width; rx++) {
        const srcIdx = ((y + ry) * imageData.width + (x + rx)) * 4
        const dstIdx = (ry * width + rx) * 4

        regionData.data[dstIdx] = imageData.data[srcIdx]
        regionData.data[dstIdx + 1] = imageData.data[srcIdx + 1]
        regionData.data[dstIdx + 2] = imageData.data[srcIdx + 2]
        regionData.data[dstIdx + 3] = imageData.data[srcIdx + 3]
      }
    }

    return regionData
  }

  /**
   * Compute color histogram
   */
  private computeColorHistogram(imageData: ImageData): number[] {
    const histogram = new Array(64).fill(0) // 4x4x4 color bins

    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = Math.floor(imageData.data[i] / 64)
      const g = Math.floor(imageData.data[i + 1] / 64)
      const b = Math.floor(imageData.data[i + 2] / 64)
      const bin = r * 16 + g * 4 + b
      histogram[bin]++
    }

    // Normalize
    const total = imageData.data.length / 4
    return histogram.map(count => count / total)
  }

  /**
   * Compute shape features
   */
  private computeShapeFeatures(imageData: ImageData): number[] {
    // Simplified shape features - edge density, aspect ratio, etc.
    const edges = this.detectEdges(imageData)
    let edgeCount = 0

    for (const edge of edges) {
      if (edge === 255) edgeCount++
    }

    const edgeDensity = edgeCount / edges.length
    const aspectRatio = imageData.width / imageData.height

    return [edgeDensity, aspectRatio]
  }

  /**
   * Compute texture features
   */
  private computeTextureFeatures(imageData: ImageData): number[] {
    // Simplified texture features using Local Binary Pattern
    const lbp = this.computeLBP(imageData)
    const histogram = new Array(256).fill(0)

    for (const pattern of lbp) {
      histogram[pattern]++
    }

    // Normalize
    const total = lbp.length
    return histogram.map(count => count / total).slice(0, 16) // Reduce dimensionality
  }

  /**
   * Compute Local Binary Pattern
   */
  private computeLBP(imageData: ImageData): number[] {
    const width = imageData.width
    const height = imageData.height
    const lbp = []

    // Convert to grayscale
    const gray = new Float32Array(width * height)
    for (let i = 0; i < imageData.data.length; i += 4) {
      gray[i / 4] = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3
    }

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const center = gray[y * width + x]
        let pattern = 0

        // 8 neighbors
        const neighbors = [
          gray[(y - 1) * width + (x - 1)], gray[(y - 1) * width + x], gray[(y - 1) * width + (x + 1)],
          gray[y * width + (x - 1)], gray[y * width + (x + 1)],
          gray[(y + 1) * width + (x - 1)], gray[(y + 1) * width + x], gray[(y + 1) * width + (x + 1)]
        ]

        for (let i = 0; i < 8; i++) {
          if (neighbors[i] >= center) {
            pattern |= (1 << i)
          }
        }

        lbp.push(pattern)
      }
    }

    return lbp
  }

  /**
   * Compute size features
   */
  private computeSizeFeatures(region: { x: number; y: number; width: number; height: number }): number[] {
    const area = region.width * region.height
    const aspectRatio = region.width / region.height
    const perimeter = 2 * (region.width + region.height)
    const compactness = (4 * Math.PI * area) / (perimeter * perimeter)

    return [area, aspectRatio, compactness]
  }

  /**
   * Compare features between region and product signature
   */
  private compareFeatures(features1: ProductSignature['features'], features2: ProductSignature['features']): number {
    // Compare color histograms
    const colorSimilarity = this.compareHistograms(features1.colorHistogram, features2.colorHistogram)

    // Compare shape features
    const shapeSimilarity = this.compareVectors(features1.shapeFeatures, features2.shapeFeatures)

    // Compare texture features
    const textureSimilarity = this.compareHistograms(features1.textureFeatures, features2.textureFeatures)

    // Compare size features
    const sizeSimilarity = this.compareVectors(features1.sizeFeatures, features2.sizeFeatures)

    // Weighted combination
    return (
      colorSimilarity * 0.4 +
      shapeSimilarity * 0.3 +
      textureSimilarity * 0.2 +
      sizeSimilarity * 0.1
    )
  }

  /**
   * Compare two histograms
   */
  private compareHistograms(hist1: number[], hist2: number[]): number {
    let similarity = 0
    for (let i = 0; i < Math.min(hist1.length, hist2.length); i++) {
      similarity += Math.min(hist1[i], hist2[i])
    }
    return similarity
  }

  /**
   * Compare two vectors
   */
  private compareVectors(vec1: number[], vec2: number[]): number {
    let dotProduct = 0
    let norm1 = 0
    let norm2 = 0

    for (let i = 0; i < Math.min(vec1.length, vec2.length); i++) {
      dotProduct += vec1[i] * vec2[i]
      norm1 += vec1[i] * vec1[i]
      norm2 += vec2[i] * vec2[i]
    }

    if (norm1 === 0 || norm2 === 0) return 0
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2))
  }

  /**
   * Generate product signature from training data
   */
  private async generateProductSignature(product: any): Promise<ProductSignature> {
    // In a real implementation, this would analyze multiple training images
    // For now, generate a mock signature
    return {
      id: product.id,
      name: product.name,
      category: product.category,
      features: {
        colorHistogram: new Array(64).fill(0).map(() => Math.random()),
        shapeFeatures: new Array(2).fill(0).map(() => Math.random()),
        textureFeatures: new Array(16).fill(0).map(() => Math.random()),
        sizeFeatures: [100, 1.5, 0.8]
      },
      confidence: 0.8
    }
  }

  /**
   * Update performance metrics
   */
  private updateMetrics(results: DetectionResult[], processingTime: number): void {
    this.performanceMetrics.totalDetections++
    
    if (results.length > 0) {
      this.performanceMetrics.successfulDetections++
      const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length
      this.performanceMetrics.averageConfidence = 
        (this.performanceMetrics.averageConfidence * (this.performanceMetrics.successfulDetections - 1) + avgConfidence) / 
        this.performanceMetrics.successfulDetections
    }

    this.performanceMetrics.averageProcessingTime = 
      (this.performanceMetrics.averageProcessingTime * (this.performanceMetrics.totalDetections - 1) + processingTime) / 
      this.performanceMetrics.totalDetections
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return {
      ...this.performanceMetrics,
      accuracy: this.performanceMetrics.totalDetections > 0 
        ? this.performanceMetrics.successfulDetections / this.performanceMetrics.totalDetections 
        : 0,
      averageConfidence: this.performanceMetrics.averageConfidence,
      averageProcessingTime: this.performanceMetrics.averageProcessingTime
    }
  }

  /**
   * Get detection history
   */
  getDetectionHistory(): DetectionResult[] {
    return [...this.detectionHistory]
  }

  /**
   * Clear detection history
   */
  clearHistory(): void {
    this.detectionHistory = []
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<DetectionConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Get current configuration
   */
  getConfig(): DetectionConfig {
    return { ...this.config }
  }
}

export { ProductDetector }
export default ProductDetector
