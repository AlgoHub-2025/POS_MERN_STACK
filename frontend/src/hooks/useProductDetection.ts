import { useState, useEffect, useRef, useCallback } from 'react'
import { ProductDetector, DetectionResult, DetectionConfig } from '@/services/vision/productDetector'

interface UseProductDetectionOptions {
  products: any[]
  config?: Partial<DetectionConfig>
  onDetection?: (results: DetectionResult[]) => void
  onError?: (error: Error) => void
  enableAnalytics?: boolean
}

interface UseProductDetectionReturn {
  // Detection state
  isDetecting: boolean
  isInitialized: boolean
  error: Error | null
  currentDetections: DetectionResult[]
  
  // Detection control
  detect: (imageData: ImageData) => Promise<DetectionResult[]>
  startContinuousDetection: (imageData: ImageData) => void
  stopContinuousDetection: () => void
  
  // Configuration
  updateConfig: (config: Partial<DetectionConfig>) => void
  getConfig: () => DetectionConfig
  
  // Analytics
  metrics: {
    accuracy: number
    averageConfidence: number
    averageProcessingTime: number
    totalDetections: number
    successfulDetections: number
  }
  
  // History
  getDetectionHistory: () => DetectionResult[]
  clearHistory: () => void
  
  // Utilities
  getTopDetection: () => DetectionResult | null
  getDetectionsByCategory: (category: string) => DetectionResult[]
}

export const useProductDetection = (options: UseProductDetectionOptions): UseProductDetectionReturn => {
  const {
    products,
    config = {},
    onDetection,
    onError,
    enableAnalytics = true
  } = options

  // State
  const [isDetecting, setIsDetecting] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [currentDetections, setCurrentDetections] = useState<DetectionResult[]>([])
  const [metrics, setMetrics] = useState({
    accuracy: 0,
    averageConfidence: 0,
    averageProcessingTime: 0,
    totalDetections: 0,
    successfulDetections: 0
  })

  // Refs
  const detectorRef = useRef<ProductDetector | null>(null)
  const continuousDetectionRef = useRef<boolean>(false)
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize detector
  useEffect(() => {
    const initializeDetector = async () => {
      try {
        detectorRef.current = new ProductDetector(config)
        await detectorRef.current.initialize(products)
        setIsInitialized(true)
        setError(null)
        console.log('Product detection initialized successfully')
      } catch (err) {
        const error = err as Error
        setError(error)
        onError?.(error)
        console.error('Failed to initialize product detection:', error)
      }
    }

    initializeDetector()
  }, [products, config, onError])

  // Update metrics periodically
  useEffect(() => {
    if (!enableAnalytics || !detectorRef.current) return

    const interval = setInterval(() => {
      const detectorMetrics = detectorRef.current?.getMetrics()
      if (detectorMetrics) {
        setMetrics(detectorMetrics)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [enableAnalytics])

  // Detect products in single frame
  const detect = useCallback(async (imageData: ImageData): Promise<DetectionResult[]> => {
    if (!detectorRef.current || !isInitialized) {
      throw new Error('Product detector not initialized')
    }

    setIsDetecting(true)
    setError(null)

    try {
      const results = await detectorRef.current.detectProducts(imageData)
      setCurrentDetections(results)
      onDetection?.(results)
      return results
    } catch (err) {
      const error = err as Error
      setError(error)
      onError?.(error)
      throw error
    } finally {
      setIsDetecting(false)
    }
  }, [isInitialized, onDetection, onError])

  // Start continuous detection
  const startContinuousDetection = useCallback((imageData: ImageData) => {
    if (continuousDetectionRef.current) return

    continuousDetectionRef.current = true

    const detectFrame = async () => {
      if (!continuousDetectionRef.current || !detectorRef.current) return

      try {
        await detect(imageData)
      } catch (error) {
        console.error('Continuous detection error:', error)
      }

      // Schedule next frame
      if (continuousDetectionRef.current) {
        detectionIntervalRef.current = setTimeout(detectFrame, 100) // 10 FPS
      }
    }

    detectFrame()
  }, [detect])

  // Stop continuous detection
  const stopContinuousDetection = useCallback(() => {
    continuousDetectionRef.current = false
    if (detectionIntervalRef.current) {
      clearTimeout(detectionIntervalRef.current)
      detectionIntervalRef.current = null
    }
  }, [])

  // Update configuration
  const updateConfig = useCallback((newConfig: Partial<DetectionConfig>) => {
    if (detectorRef.current) {
      detectorRef.current.updateConfig(newConfig)
    }
  }, [])

  // Get current configuration
  const getConfig = useCallback((): DetectionConfig => {
    return detectorRef.current?.getConfig() || {
      minConfidence: 0.7,
      maxDetections: 5,
      enableBarcodeFallback: true,
      enableMultiDetection: true,
      enableBatchProcessing: false,
      lowLightMode: false
    }
  }, [])

  // Get detection history
  const getDetectionHistory = useCallback((): DetectionResult[] => {
    return detectorRef.current?.getDetectionHistory() || []
  }, [])

  // Clear detection history
  const clearHistory = useCallback(() => {
    if (detectorRef.current) {
      detectorRef.current.clearHistory()
    }
  }, [])

  // Get top detection (highest confidence)
  const getTopDetection = useCallback((): DetectionResult | null => {
    return currentDetections.length > 0 ? currentDetections[0] : null
  }, [currentDetections])

  // Get detections by category
  const getDetectionsByCategory = useCallback((category: string): DetectionResult[] => {
    return currentDetections.filter(detection => detection.product.category === category)
  }, [currentDetections])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopContinuousDetection()
    }
  }, [stopContinuousDetection])

  return {
    // Detection state
    isDetecting,
    isInitialized,
    error,
    currentDetections,
    
    // Detection control
    detect,
    startContinuousDetection,
    stopContinuousDetection,
    
    // Configuration
    updateConfig,
    getConfig,
    
    // Analytics
    metrics,
    
    // History
    getDetectionHistory,
    clearHistory,
    
    // Utilities
    getTopDetection,
    getDetectionsByCategory
  }
}

export default useProductDetection
