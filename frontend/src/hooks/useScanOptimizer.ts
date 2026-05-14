import { useState, useEffect, useRef, useCallback } from 'react'
import { FrameProcessor, FrameProcessorConfig, ProcessingMetrics } from '@/services/vision/frameProcessor'

interface UseScanOptimizerOptions {
  targetFPS?: number
  quality?: 'low' | 'medium' | 'high'
  enableWebGL?: boolean
  enableWorkers?: boolean
  frameSkip?: number
  onMetricsUpdate?: (metrics: ProcessingMetrics) => void
}

interface UseScanOptimizerReturn {
  // Processing control
  isProcessing: boolean
  startProcessing: (callback: (frame: ImageData) => void) => void
  stopProcessing: () => void
  
  // Frame processing
  processFrame: (frame: ImageData) => Promise<ImageData>
  addFrame: (frame: ImageData) => void
  
  // Configuration
  updateConfig: (config: Partial<FrameProcessorConfig>) => void
  getConfig: () => FrameProcessorConfig
  
  // Metrics
  metrics: ProcessingMetrics
  performanceScore: number // 0-100
  
  // Utilities
  resetMetrics: () => void
  getOptimalSettings: () => FrameProcessorConfig
}

export const useScanOptimizer = (options: UseScanOptimizerOptions = {}): UseScanOptimizerReturn => {
  const {
    targetFPS = 30,
    quality = 'medium',
    enableWebGL = true,
    enableWorkers = true,
    frameSkip = 1,
    onMetricsUpdate
  } = options

  // State
  const [isProcessing, setIsProcessing] = useState(false)
  const [metrics, setMetrics] = useState<ProcessingMetrics>({
    frameTime: 0,
    processingTime: 0,
    fps: targetFPS,
    droppedFrames: 0,
    queueSize: 0
  })
  const [performanceScore, setPerformanceScore] = useState(100)

  // Refs
  const processorRef = useRef<FrameProcessor | null>(null)
  const metricsIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastMetricsRef = useRef<ProcessingMetrics>(metrics)

  // Initialize processor
  useEffect(() => {
    const config: FrameProcessorConfig = {
      targetFPS,
      processingResolution: { width: 640, height: 480 },
      enableWebGL,
      enableWorkers,
      frameSkip,
      quality
    }

    processorRef.current = new FrameProcessor(config)

    return () => {
      if (processorRef.current) {
        processorRef.current.cleanup()
      }
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current)
      }
    }
  }, [targetFPS, enableWebGL, enableWorkers, frameSkip, quality])

  // Update metrics periodically
  useEffect(() => {
    const updateMetrics = () => {
      if (processorRef.current) {
        const newMetrics = processorRef.current.getMetrics()
        setMetrics(newMetrics)
        lastMetricsRef.current = newMetrics
        
        // Calculate performance score
        const score = calculatePerformanceScore(newMetrics)
        setPerformanceScore(score)
        
        onMetricsUpdate?.(newMetrics)
      }
    }

    updateMetrics()
    metricsIntervalRef.current = setInterval(updateMetrics, 1000)

    return () => {
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current)
      }
    }
  }, [onMetricsUpdate])

  // Calculate performance score (0-100)
  const calculatePerformanceScore = useCallback((currentMetrics: ProcessingMetrics): number => {
    let score = 100

    // Processing time penalty (target <200ms)
    if (currentMetrics.processingTime > 200) {
      score -= Math.min(40, (currentMetrics.processingTime - 200) / 10)
    }

    // Dropped frames penalty
    const dropRate = currentMetrics.droppedFrames / Math.max(1, currentMetrics.droppedFrames + currentMetrics.fps)
    score -= dropRate * 30

    // Queue size penalty
    if (currentMetrics.queueSize > 5) {
      score -= Math.min(20, (currentMetrics.queueSize - 5) * 2)
    }

    // FPS consistency bonus/penalty
    const fpsVariance = Math.abs(currentMetrics.fps - targetFPS)
    if (fpsVariance > 5) {
      score -= Math.min(10, fpsVariance)
    }

    return Math.max(0, Math.min(100, score))
  }, [targetFPS])

  // Start processing
  const startProcessing = useCallback((callback: (frame: ImageData) => void) => {
    if (processorRef.current) {
      processorRef.current.startProcessing(callback)
      setIsProcessing(true)
    }
  }, [])

  // Stop processing
  const stopProcessing = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.stopProcessing()
      setIsProcessing(false)
    }
  }, [])

  // Process single frame
  const processFrame = useCallback(async (frame: ImageData): Promise<ImageData> => {
    if (!processorRef.current) {
      throw new Error('Frame processor not initialized')
    }

    return processorRef.current.processFrame(frame)
  }, [])

  // Add frame to queue
  const addFrame = useCallback((frame: ImageData) => {
    if (processorRef.current) {
      processorRef.current.addFrame(frame)
    }
  }, [])

  // Update configuration
  const updateConfig = useCallback((config: Partial<FrameProcessorConfig>) => {
    if (processorRef.current) {
      processorRef.current.updateConfig(config)
    }
  }, [])

  // Get current configuration
  const getConfig = useCallback((): FrameProcessorConfig => {
    return processorRef.current?.getConfig() || {
      targetFPS,
      processingResolution: { width: 640, height: 480 },
      enableWebGL,
      enableWorkers,
      frameSkip,
      quality
    }
  }, [targetFPS, enableWebGL, enableWorkers, frameSkip, quality])

  // Reset metrics
  const resetMetrics = useCallback(() => {
    setMetrics({
      frameTime: 0,
      processingTime: 0,
      fps: targetFPS,
      droppedFrames: 0,
      queueSize: 0
    })
    setPerformanceScore(100)
  }, [targetFPS])

  // Get optimal settings based on current performance
  const getOptimalSettings = useCallback((): FrameProcessorConfig => {
    const currentMetrics = lastMetricsRef.current
    let optimizedConfig = getConfig()

    // Adjust based on performance
    if (currentMetrics.processingTime > 300) {
      // Too slow, reduce quality
      optimizedConfig.quality = 'low'
      optimizedConfig.frameSkip = Math.max(2, optimizedConfig.frameSkip + 1)
    } else if (currentMetrics.processingTime < 100 && performanceScore > 90) {
      // Very fast, can increase quality
      optimizedConfig.quality = 'high'
      optimizedConfig.frameSkip = Math.max(0, optimizedConfig.frameSkip - 1)
    }

    // Adjust FPS based on queue size
    if (currentMetrics.queueSize > 3) {
      optimizedConfig.targetFPS = Math.max(15, optimizedConfig.targetFPS - 5)
    } else if (currentMetrics.queueSize === 0 && performanceScore > 80) {
      optimizedConfig.targetFPS = Math.min(60, optimizedConfig.targetFPS + 5)
    }

    // Adjust resolution if needed
    if (currentMetrics.processingTime > 400) {
      optimizedConfig.processingResolution = { width: 480, height: 360 }
    } else if (currentMetrics.processingTime < 50 && performanceScore > 95) {
      optimizedConfig.processingResolution = { width: 800, height: 600 }
    }

    return optimizedConfig
  }, [getConfig, performanceScore])

  // Auto-optimize based on performance
  useEffect(() => {
    if (performanceScore < 70) {
      const optimalSettings = getOptimalSettings()
      updateConfig(optimalSettings)
      console.log('Auto-optimizing scan settings:', optimalSettings)
    }
  }, [performanceScore, getOptimalSettings, updateConfig])

  return {
    // Processing control
    isProcessing,
    startProcessing,
    stopProcessing,
    
    // Frame processing
    processFrame,
    addFrame,
    
    // Configuration
    updateConfig,
    getConfig,
    
    // Metrics
    metrics,
    performanceScore,
    
    // Utilities
    resetMetrics,
    getOptimalSettings
  }
}

export default useScanOptimizer
