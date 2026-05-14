import { useState, useEffect, useRef, useCallback } from 'react'
import { CameraManager, CameraConfig, CameraCapabilities, CameraDevice } from '@/services/vision/cameraManager'

interface UseCameraOptions {
  autoInitialize?: boolean
  defaultConfig?: Partial<CameraConfig>
  onStreamReady?: (stream: MediaStream) => void
  onError?: (error: Error) => void
  onFrame?: (frame: ImageData) => void
}

interface UseCameraReturn {
  // Camera state
  isInitialized: boolean
  isLoading: boolean
  error: Error | null
  stream: MediaStream | null
  
  // Camera controls
  initialize: (config?: Partial<CameraConfig>) => Promise<void>
  stop: () => void
  switchCamera: () => Promise<void>
  
  // Camera settings
  capabilities: CameraCapabilities | null
  currentConfig: CameraConfig | null
  setTorch: (enabled: boolean) => Promise<void>
  setZoom: (level: number) => Promise<void>
  setFocusMode: (mode: 'continuous' | 'single' | 'manual') => Promise<void>
  
  // Device management
  availableDevices: CameraDevice[]
  refreshDevices: () => Promise<void>
  
  // Video element attachment
  attachToVideo: (videoElement: HTMLVideoElement) => void
  
  // Performance metrics
  metrics: {
    initializationTime: number | null
    currentFPS: number
    resolution: { width: number; height: number } | null
    supportedFeatures: string[]
  }
  
  // Utilities
  isActive: boolean
  hasTorch: boolean
  hasZoom: boolean
  zoomRange: { min: number; max: number } | null
}

const DEFAULT_CONFIG: CameraConfig = {
  facingMode: 'environment',
  resolution: { width: 1280, height: 720 },
  fps: 30,
  torch: false,
  zoom: 1,
  focusMode: 'continuous',
  exposureMode: 'continuous',
  whiteBalanceMode: 'continuous'
}

export const useCamera = (options: UseCameraOptions = {}): UseCameraReturn => {
  const {
    autoInitialize = false,
    defaultConfig = {},
    onStreamReady,
    onError,
    onFrame
  } = options

  // State
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capabilities, setCapabilities] = useState<CameraCapabilities | null>(null)
  const [currentConfig, setCurrentConfig] = useState<CameraConfig | null>(null)
  const [availableDevices, setAvailableDevices] = useState<CameraDevice[]>([])
  const [metrics, setMetrics] = useState({
    initializationTime: null as number | null,
    currentFPS: 30,
    resolution: null as { width: number; height: number } | null,
    supportedFeatures: [] as string[]
  })

  // Refs
  const cameraManagerRef = useRef<CameraManager | null>(null)
  const initStartTimeRef = useRef<number | null>(null)
  const videoElementRef = useRef<HTMLVideoElement | null>(null)

  // Initialize camera manager
  useEffect(() => {
    cameraManagerRef.current = new CameraManager()
    
    return () => {
      if (cameraManagerRef.current) {
        cameraManagerRef.current.stop()
      }
    }
  }, [])

  // Load available devices
  const refreshDevices = useCallback(async () => {
    try {
      const devices = await cameraManagerRef.current?.getAvailableDevices() || []
      setAvailableDevices(devices)
    } catch (error) {
      console.error('Failed to refresh devices:', error)
    }
  }, [])

  // Initialize devices on mount
  useEffect(() => {
    refreshDevices()
  }, [refreshDevices])

  // Initialize camera
  const initialize = useCallback(async (configOverride?: Partial<CameraConfig>) => {
    if (!cameraManagerRef.current) return

    setIsLoading(true)
    setError(null)
    initStartTimeRef.current = Date.now()

    try {
      const config: CameraConfig = {
        ...DEFAULT_CONFIG,
        ...defaultConfig,
        ...configOverride
      }

      const newStream = await cameraManagerRef.current.initialize(config)
      
      // Update state
      setStream(newStream)
      setIsInitialized(true)
      setCurrentConfig(cameraManagerRef.current.getCurrentConfig())
      setCapabilities(cameraManagerRef.current.getCapabilities())
      
      // Update metrics
      const initTime = initStartTimeRef.current ? Date.now() - initStartTimeRef.current : null
      setMetrics(cameraManagerRef.current.getMetrics())
      if (initTime) {
        setMetrics(prev => ({ ...prev, initializationTime: initTime }))
      }

      // Start frame capture if callback provided
      if (onFrame) {
        cameraManagerRef.current.startFrameCapture(onFrame)
      }

      // Attach to existing video element if available
      if (videoElementRef.current) {
        cameraManagerRef.current.attachToVideo(videoElementRef.current)
      }

      onStreamReady?.(newStream)
      
      console.log('Camera initialized successfully')
    } catch (err) {
      const error = err as Error
      setError(error)
      onError?.(error)
      console.error('Camera initialization failed:', error)
    } finally {
      setIsLoading(false)
      initStartTimeRef.current = null
    }
  }, [defaultConfig, onStreamReady, onError, onFrame])

  // Stop camera
  const stop = useCallback(() => {
    if (cameraManagerRef.current) {
      cameraManagerRef.current.stop()
    }
    
    setStream(null)
    setIsInitialized(false)
    setCurrentConfig(null)
    setCapabilities(null)
  }, [])

  // Switch camera
  const switchCamera = useCallback(async () => {
    if (!cameraManagerRef.current || !isInitialized) return

    try {
      const newStream = await cameraManagerRef.current.switchCamera()
      setStream(newStream)
      setCurrentConfig(cameraManagerRef.current.getCurrentConfig())
      setCapabilities(cameraManagerRef.current.getCapabilities())
      
      onStreamReady?.(newStream)
    } catch (error) {
      console.error('Failed to switch camera:', error)
      setError(error as Error)
    }
  }, [isInitialized, onStreamReady])

  // Set torch
  const setTorch = useCallback(async (enabled: boolean) => {
    if (!cameraManagerRef.current) return

    try {
      await cameraManagerRef.current.setTorch(enabled)
      setCurrentConfig(cameraManagerRef.current.getCurrentConfig())
    } catch (error) {
      console.error('Failed to set torch:', error)
      setError(error as Error)
    }
  }, [])

  // Set zoom
  const setZoom = useCallback(async (level: number) => {
    if (!cameraManagerRef.current) return

    try {
      await cameraManagerRef.current.setZoom(level)
      setCurrentConfig(cameraManagerRef.current.getCurrentConfig())
    } catch (error) {
      console.error('Failed to set zoom:', error)
      setError(error as Error)
    }
  }, [])

  // Set focus mode
  const setFocusMode = useCallback(async (mode: 'continuous' | 'single' | 'manual') => {
    if (!cameraManagerRef.current) return

    try {
      await cameraManagerRef.current.setFocusMode(mode)
      setCurrentConfig(cameraManagerRef.current.getCurrentConfig())
    } catch (error) {
      console.error('Failed to set focus mode:', error)
      setError(error as Error)
    }
  }, [])

  // Attach to video element
  const attachToVideo = useCallback((videoElement: HTMLVideoElement) => {
    videoElementRef.current = videoElement
    
    if (cameraManagerRef.current) {
      cameraManagerRef.current.attachToVideo(videoElement)
    }
  }, [])

  // Auto-initialize if requested
  useEffect(() => {
    if (autoInitialize && !isInitialized && !isLoading) {
      initialize()
    }
  }, [autoInitialize, isInitialized, isLoading, initialize])

  // Update metrics periodically
  useEffect(() => {
    if (!isInitialized) return

    const interval = setInterval(() => {
      if (cameraManagerRef.current) {
        setMetrics(cameraManagerRef.current.getMetrics())
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isInitialized])

  // Computed values
  const isActive = isInitialized && stream !== null
  const hasTorch = capabilities?.torch || false
  const hasZoom = !!capabilities?.zoom
  const zoomRange = capabilities?.zoom ? { 
    min: capabilities.zoom.min, 
    max: capabilities.zoom.max 
  } : null

  return {
    // Camera state
    isInitialized,
    isLoading,
    error,
    stream,
    
    // Camera controls
    initialize,
    stop,
    switchCamera,
    
    // Camera settings
    capabilities,
    currentConfig,
    setTorch,
    setZoom,
    setFocusMode,
    
    // Device management
    availableDevices,
    refreshDevices,
    
    // Video element attachment
    attachToVideo,
    
    // Performance metrics
    metrics,
    
    // Utilities
    isActive,
    hasTorch,
    hasZoom,
    zoomRange
  }
}

export default useCamera
