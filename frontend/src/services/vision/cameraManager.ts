// Enhanced Camera Management Service for Visual Recognition

export interface CameraConfig {
  facingMode: 'environment' | 'user'
  resolution: { width: number; height: number }
  fps: number
  torch: boolean
  zoom: number
  focusMode: 'continuous' | 'single' | 'manual'
  exposureMode: 'continuous' | 'single' | 'manual'
  whiteBalanceMode: 'continuous' | 'single' | 'manual'
}

export interface CameraCapabilities {
  torch?: boolean
  zoom?: { min: number; max: number; step: number }
  focusMode?: string[]
  exposureMode?: string[]
  whiteBalanceMode?: string[]
  facingMode?: string[]
  width?: { min: number; max: number }
  height?: { min: number; max: number }
  frameRate?: { min: number; max: number }
}

export interface CameraDevice {
  deviceId: string
  label: string
  kind: 'videoinput'
  capabilities?: CameraCapabilities
}

class CameraManager {
  private stream: MediaStream | null = null
  private videoElement: HTMLVideoElement | null = null
  private currentDeviceId: string | null = null
  private currentConfig: CameraConfig | null = null
  private capabilities: CameraCapabilities | null = null
  private isInitialized: boolean = false
  private onFrameCallback?: (frame: ImageData) => void
  private animationFrameId: number | null = null
  private lastFrameTime: number = 0
  private targetFPS: number = 30

  constructor() {
    this.setupCleanup()
  }

  /**
   * Initialize camera with enhanced configuration
   */
  async initialize(config: CameraConfig): Promise<MediaStream> {
    const startTime = Date.now()
    
    try {
      // Get available devices
      const devices = await this.getAvailableDevices()
      const targetDevice = this.selectBestDevice(devices, config)

      if (!targetDevice) {
        throw new Error('No suitable camera device found')
      }

      // Build constraints
      const constraints = this.buildConstraints(config, targetDevice.deviceId)
      
      // Request stream with retry logic
      let stream: MediaStream | null = null
      let retryCount = 0
      const maxRetries = 3

      while (retryCount < maxRetries) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints)
          break
        } catch (error) {
          retryCount++
          console.warn(`Camera initialization attempt ${retryCount} failed:`, error)
          
          if (retryCount >= maxRetries) {
            throw new Error(`Failed to initialize camera after ${maxRetries} attempts: ${error}`)
          }
          
          // Fallback to lower resolution
          if (constraints.video && typeof constraints.video === 'object') {
            const video = constraints.video as MediaTrackConstraints
            if (video.width && typeof video.width === 'object') {
              video.width = { ideal: Math.min((video.width as any).ideal || 1280, 640) }
            }
            if (video.height && typeof video.height === 'object') {
              video.height = { ideal: Math.min((video.height as any).ideal || 720, 480) }
            }
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }

      if (!stream) {
        throw new Error('Failed to initialize camera stream')
      }

      this.stream = stream
      this.currentDeviceId = targetDevice.deviceId
      this.currentConfig = config
      this.targetFPS = config.fps

      // Get capabilities
      await this.extractCapabilities(stream)

      // Apply initial settings
      await this.applySettings(config)

      this.isInitialized = true
      
      const initTime = Date.now() - startTime
      console.log(`Camera initialized in ${initTime}ms`)
      
      if (initTime > 500) {
        console.warn('Camera initialization took longer than target (500ms)')
      }

      return stream
    } catch (error) {
      console.error('Camera initialization failed:', error)
      throw error
    }
  }

  /**
   * Get available camera devices
   */
  async getAvailableDevices(): Promise<CameraDevice[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      return devices
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 8)}`,
          kind: device.kind as 'videoinput'
        }))
    } catch (error) {
      console.error('Failed to enumerate camera devices:', error)
      return []
    }
  }

  /**
   * Select best camera device based on configuration
   */
  private selectBestDevice(devices: CameraDevice[], config: CameraConfig): CameraDevice | null {
    if (devices.length === 0) return null

    // Filter by facing mode
    const compatibleDevices = devices.filter(device => {
      // This would require getting capabilities first, simplified for now
      return true // Assume all devices are compatible
    })

    if (compatibleDevices.length === 0) return devices[0]

    // Prefer environment camera for product scanning
    if (config.facingMode === 'environment') {
      const envCamera = compatibleDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('environment')
      )
      if (envCamera) return envCamera
    }

    // Prefer user camera for selfies
    if (config.facingMode === 'user') {
      const userCamera = compatibleDevices.find(device => 
        device.label.toLowerCase().includes('front') || 
        device.label.toLowerCase().includes('user')
      )
      if (userCamera) return userCamera
    }

    return compatibleDevices[0]
  }

  /**
   * Build media constraints from configuration
   */
  private buildConstraints(config: CameraConfig, deviceId: string): MediaStreamConstraints {
    const videoConstraints: MediaTrackConstraints = {
      deviceId: { exact: deviceId },
      width: { ideal: config.resolution.width, max: config.resolution.width },
      height: { ideal: config.resolution.height, max: config.resolution.height },
      frameRate: { ideal: config.fps, max: config.fps },
      facingMode: config.facingMode
    }

    // Add advanced constraints if supported
    if (config.torch) {
      ;(videoConstraints as any).torch = true
    }

    return {
      video: videoConstraints,
      audio: false
    }
  }

  /**
   * Extract camera capabilities
   */
  private async extractCapabilities(stream: MediaStream): Promise<void> {
    const videoTrack = stream.getVideoTracks()[0]
    if (!videoTrack) return

    try {
      const settings = videoTrack.getSettings()
      const capabilities = videoTrack.getCapabilities() as any

      this.capabilities = {
        torch: capabilities?.torch,
        zoom: capabilities?.zoom,
        focusMode: capabilities?.focusMode,
        exposureMode: capabilities?.exposureMode,
        whiteBalanceMode: capabilities?.whiteBalanceMode,
        facingMode: capabilities?.facingMode,
        width: capabilities?.width,
        height: capabilities?.height,
        frameRate: capabilities?.frameRate
      }

      console.log('Camera capabilities extracted:', this.capabilities)
    } catch (error) {
      console.warn('Failed to extract camera capabilities:', error)
    }
  }

  /**
   * Apply camera settings
   */
  async applySettings(config: CameraConfig): Promise<void> {
    if (!this.stream) return

    const videoTrack = this.stream.getVideoTracks()[0]
    if (!videoTrack) return

    try {
      // Apply torch
      if (config.torch && this.capabilities?.torch) {
        await videoTrack.applyConstraints({ 
          advanced: [{ torch: true }] as any 
        })
      }

      // Apply zoom
      if (config.zoom !== 1 && this.capabilities?.zoom) {
        await videoTrack.applyConstraints({ 
          advanced: [{ zoom: config.zoom }] as any 
        })
      }

      // Apply focus mode
      if (this.capabilities?.focusMode?.includes(config.focusMode)) {
        await videoTrack.applyConstraints({ 
          advanced: [{ focusMode: config.focusMode }] as any 
        })
      }

      // Apply exposure mode
      if (this.capabilities?.exposureMode?.includes(config.exposureMode)) {
        await videoTrack.applyConstraints({ 
          advanced: [{ exposureMode: config.exposureMode }] as any 
        })
      }

      // Apply white balance mode
      if (this.capabilities?.whiteBalanceMode?.includes(config.whiteBalanceMode)) {
        await videoTrack.applyConstraints({ 
          advanced: [{ whiteBalanceMode: config.whiteBalanceMode }] as any 
        })
      }

      console.log('Camera settings applied:', config)
    } catch (error) {
      console.warn('Failed to apply some camera settings:', error)
    }
  }

  /**
   * Toggle torch/flashlight
   */
  async setTorch(enabled: boolean): Promise<void> {
    if (!this.stream || !this.capabilities?.torch) {
      throw new Error('Torch not supported or camera not initialized')
    }

    const videoTrack = this.stream.getVideoTracks()[0]
    if (!videoTrack) return

    try {
      await videoTrack.applyConstraints({ 
        advanced: [{ torch: enabled }] as any 
      })
      
      if (this.currentConfig) {
        this.currentConfig.torch = enabled
      }
      
      console.log(`Torch ${enabled ? 'enabled' : 'disabled'}`)
    } catch (error) {
      console.error('Failed to toggle torch:', error)
      throw error
    }
  }

  /**
   * Set zoom level
   */
  async setZoom(level: number): Promise<void> {
    if (!this.stream || !this.capabilities?.zoom) {
      throw new Error('Zoom not supported or camera not initialized')
    }

    const { min, max, step } = this.capabilities.zoom
    const clampedLevel = Math.max(min, Math.min(max, level))

    const videoTrack = this.stream.getVideoTracks()[0]
    if (!videoTrack) return

    try {
      await videoTrack.applyConstraints({ 
        advanced: [{ zoom: clampedLevel }] as any 
      })
      
      if (this.currentConfig) {
        this.currentConfig.zoom = clampedLevel
      }
      
      console.log(`Zoom set to ${clampedLevel}`)
    } catch (error) {
      console.error('Failed to set zoom:', error)
      throw error
    }
  }

  /**
   * Set focus mode
   */
  async setFocusMode(mode: 'continuous' | 'single' | 'manual'): Promise<void> {
    if (!this.stream || !this.capabilities?.focusMode?.includes(mode)) {
      throw new Error('Focus mode not supported or camera not initialized')
    }

    const videoTrack = this.stream.getVideoTracks()[0]
    if (!videoTrack) return

    try {
      await videoTrack.applyConstraints({ 
        advanced: [{ focusMode: mode }] as any 
      })
      
      if (this.currentConfig) {
        this.currentConfig.focusMode = mode
      }
      
      console.log(`Focus mode set to ${mode}`)
    } catch (error) {
      console.error('Failed to set focus mode:', error)
      throw error
    }
  }

  /**
   * Switch between front and back cameras
   */
  async switchCamera(): Promise<MediaStream> {
    if (!this.currentConfig) {
      throw new Error('Camera not initialized')
    }

    // Stop current stream
    this.stop()

    // Toggle facing mode
    const newConfig: CameraConfig = {
      ...this.currentConfig,
      facingMode: this.currentConfig.facingMode === 'environment' ? 'user' : 'environment'
    }

    return this.initialize(newConfig)
  }

  /**
   * Get current camera capabilities
   */
  getCapabilities(): CameraCapabilities | null {
    return this.capabilities
  }

  /**
   * Get current configuration
   */
  getCurrentConfig(): CameraConfig | null {
    return this.currentConfig
  }

  /**
   * Check if camera is initialized
   */
  isActive(): boolean {
    return this.isInitialized && this.stream !== null
  }

  /**
   * Attach to video element
   */
  attachToVideo(videoElement: HTMLVideoElement): void {
    this.videoElement = videoElement
    if (this.stream) {
      videoElement.srcObject = this.stream
    }
  }

  /**
   * Start frame capture for processing
   */
  startFrameCapture(callback: (frame: ImageData) => void): void {
    this.onFrameCallback = callback
    this.lastFrameTime = 0
    this.captureFrames()
  }

  /**
   * Stop frame capture
   */
  stopFrameCapture(): void {
    this.onFrameCallback = undefined
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  /**
   * Capture frames at target FPS
   */
  private captureFrames = (): void => {
    if (!this.videoElement || !this.onFrameCallback) return

    const now = Date.now()
    const frameInterval = 1000 / this.targetFPS

    if (now - this.lastFrameTime >= frameInterval) {
      try {
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        if (!context) return

        canvas.width = this.videoElement.videoWidth
        canvas.height = this.videoElement.videoHeight

        context.drawImage(this.videoElement, 0, 0)
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

        this.onFrameCallback(imageData)
        this.lastFrameTime = now
      } catch (error) {
        console.error('Frame capture error:', error)
      }
    }

    this.animationFrameId = requestAnimationFrame(this.captureFrames)
  }

  /**
   * Get current stream
   */
  getStream(): MediaStream | null {
    return this.stream
  }

  /**
   * Stop camera and cleanup
   */
  stop(): void {
    this.stopFrameCapture()

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop())
      this.stream = null
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null
    }

    this.isInitialized = false
    this.currentDeviceId = null
    this.currentConfig = null
    this.capabilities = null
  }

  /**
   * Setup cleanup on page unload
   */
  private setupCleanup(): void {
    const cleanup = () => this.stop()
    window.addEventListener('beforeunload', cleanup)
    window.addEventListener('pagehide', cleanup)
  }

  /**
   * Get performance metrics
   */
  getMetrics(): {
    initializationTime: number | null
    currentFPS: number
    resolution: { width: number; height: number } | null
    supportedFeatures: string[]
  } {
    const supportedFeatures: string[] = []
    
    if (this.capabilities?.torch) supportedFeatures.push('torch')
    if (this.capabilities?.zoom) supportedFeatures.push('zoom')
    if (this.capabilities?.focusMode) supportedFeatures.push('focus')
    if (this.capabilities?.exposureMode) supportedFeatures.push('exposure')
    if (this.capabilities?.whiteBalanceMode) supportedFeatures.push('whiteBalance')

    return {
      initializationTime: null, // Would need to track this during init
      currentFPS: this.targetFPS,
      resolution: this.currentConfig?.resolution || null,
      supportedFeatures
    }
  }
}

export { CameraManager }
export default CameraManager
