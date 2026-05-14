import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Camera, CameraOff, Zap, ZoomIn, ZoomOut, RotateCw, Settings, X } from 'lucide-react'
import { useCamera } from '@/hooks/useCamera'

interface CameraViewProps {
  onFrame?: (frame: ImageData) => void
  onDetection?: (result: any) => void
  className?: string
  showControls?: boolean
  autoStart?: boolean
  onError?: (error: Error) => void
}

export const CameraView: React.FC<CameraViewProps> = ({
  onFrame,
  onDetection,
  className = '',
  showControls = true,
  autoStart = true,
  onError
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [torchEnabled, setTorchEnabled] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [focusMode, setFocusMode] = useState<'continuous' | 'single' | 'manual'>('continuous')

  const camera = useCamera({
    autoInitialize: autoStart,
    defaultConfig: {
      facingMode: 'environment',
      resolution: { width: 1280, height: 720 },
      fps: 30,
      torch: false,
      zoom: 1,
      focusMode: 'continuous'
    },
    onStreamReady: (stream) => {
      console.log('Camera stream ready')
    },
    onError: (error) => {
      console.error('Camera error:', error)
      onError?.(error)
    },
    onFrame
  })

  // Attach video element when stream is ready
  useEffect(() => {
    if (videoRef.current && camera.stream) {
      camera.attachToVideo(videoRef.current)
    }
  }, [camera.stream, camera.attachToVideo])

  // Handle torch toggle
  const handleTorchToggle = useCallback(async () => {
    try {
      const newState = !torchEnabled
      await camera.setTorch(newState)
      setTorchEnabled(newState)
    } catch (error) {
      console.error('Failed to toggle torch:', error)
    }
  }, [camera, torchEnabled])

  // Handle zoom controls
  const handleZoomIn = useCallback(async () => {
    if (!camera.zoomRange) return
    
    const newZoom = Math.min(zoomLevel + 0.5, camera.zoomRange.max)
    try {
      await camera.setZoom(newZoom)
      setZoomLevel(newZoom)
    } catch (error) {
      console.error('Failed to zoom in:', error)
    }
  }, [camera, zoomLevel])

  const handleZoomOut = useCallback(async () => {
    if (!camera.zoomRange) return
    
    const newZoom = Math.max(zoomLevel - 0.5, camera.zoomRange.min)
    try {
      await camera.setZoom(newZoom)
      setZoomLevel(newZoom)
    } catch (error) {
      console.error('Failed to zoom out:', error)
    }
  }, [camera, zoomLevel])

  // Handle focus mode change
  const handleFocusModeChange = useCallback(async (mode: 'continuous' | 'single' | 'manual') => {
    try {
      await camera.setFocusMode(mode)
      setFocusMode(mode)
    } catch (error) {
      console.error('Failed to set focus mode:', error)
    }
  }, [camera])

  // Handle camera switch
  const handleSwitchCamera = useCallback(async () => {
    try {
      await camera.switchCamera()
    } catch (error) {
      console.error('Failed to switch camera:', error)
    }
  }, [camera])

  // Handle capture
  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    
    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)

    const imageData = canvas.toDataURL('image/jpeg', 0.9)
    
    // Trigger detection callback
    onDetection?.({
      imageData,
      timestamp: Date.now(),
      resolution: { width: canvas.width, height: canvas.height }
    })
  }, [onDetection])

  // Render camera controls
  const renderControls = () => {
    if (!showControls) return null

    return (
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          {/* Left controls */}
          <div className="flex items-center space-x-2">
            {/* Torch toggle */}
            {camera.hasTorch && (
              <button
                onClick={handleTorchToggle}
                className={`
                  p-3 rounded-full backdrop-blur-sm transition-all duration-200
                  ${torchEnabled 
                    ? 'bg-yellow-500/80 text-white' 
                    : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700/80'
                  }
                `}
                title={torchEnabled ? 'Disable flashlight' : 'Enable flashlight'}
              >
                <Zap className="w-5 h-5" />
              </button>
            )}

            {/* Zoom controls */}
            {camera.hasZoom && (
              <div className="flex items-center space-x-1 bg-gray-800/80 backdrop-blur-sm rounded-full p-1">
                <button
                  onClick={handleZoomOut}
                  className="p-2 text-gray-300 hover:text-white transition-colors"
                  title="Zoom out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs text-gray-300 px-2">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-2 text-gray-300 hover:text-white transition-colors"
                  title="Zoom in"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Switch camera */}
            {camera.availableDevices.length > 1 && (
              <button
                onClick={handleSwitchCamera}
                className="p-3 rounded-full bg-gray-800/80 backdrop-blur-sm text-gray-300 hover:text-white hover:bg-gray-700/80 transition-all duration-200"
                title="Switch camera"
              >
                <RotateCw className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Center control - Capture */}
          <button
            onClick={handleCapture}
            className="p-4 rounded-full bg-green-500 hover:bg-green-600 text-white transition-all duration-200 transform hover:scale-105"
            title="Capture"
          >
            <Camera className="w-6 h-6" />
          </button>

          {/* Right controls */}
          <div className="flex items-center space-x-2">
            {/* Settings */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-3 rounded-full bg-gray-800/80 backdrop-blur-sm text-gray-300 hover:text-white hover:bg-gray-700/80 transition-all duration-200"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Render settings panel
  const renderSettings = () => {
    if (!showSettings) return null

    return (
      <div className="absolute top-4 right-4 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-4 w-64">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Camera Settings</h3>
          <button
            onClick={() => setShowSettings(false)}
            className="p-1 rounded hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Focus Mode */}
        <div className="mb-4">
          <label className="block text-gray-300 text-sm mb-2">Focus Mode</label>
          <select
            value={focusMode}
            onChange={(e) => handleFocusModeChange(e.target.value as any)}
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-300"
          >
            <option value="continuous">Continuous</option>
            <option value="single">Single</option>
            <option value="manual">Manual</option>
          </select>
        </div>

        {/* Camera Info */}
        <div className="space-y-2 text-xs text-gray-400">
          <div>Resolution: {camera.metrics.resolution?.width}x{camera.metrics.resolution?.height}</div>
          <div>FPS: {camera.metrics.currentFPS}</div>
          <div>Features: {camera.metrics.supportedFeatures.join(', ')}</div>
          {camera.metrics.initializationTime && (
            <div>Init Time: {camera.metrics.initializationTime}ms</div>
          )}
        </div>
      </div>
    )
  }

  // Render loading state
  if (camera.isLoading) {
    return (
      <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-green-400">Initializing camera...</p>
          </div>
        </div>
      </div>
    )
  }

  // Render error state
  if (camera.error) {
    return (
      <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <CameraOff className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 mb-2">Camera Error</p>
            <p className="text-gray-400 text-sm">{camera.error.message}</p>
            <button
              onClick={() => camera.initialize()}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Render camera view
  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
      {/* Video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Camera controls */}
      {renderControls()}

      {/* Settings panel */}
      {renderSettings()}

      {/* Status indicators */}
      <div className="absolute top-4 left-4 flex items-center space-x-2">
        {camera.isActive && (
          <div className="flex items-center space-x-2 bg-green-500/80 backdrop-blur-sm px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-white text-xs font-medium">Live</span>
          </div>
        )}
        
        {torchEnabled && (
          <div className="flex items-center space-x-2 bg-yellow-500/80 backdrop-blur-sm px-3 py-1 rounded-full">
            <Zap className="w-3 h-3 text-white" />
            <span className="text-white text-xs font-medium">Flash</span>
          </div>
        )}
      </div>

      {/* Performance metrics (dev only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs text-green-400 font-mono">
          {camera.metrics.currentFPS} FPS | {camera.metrics.resolution?.width}x{camera.metrics.resolution?.height}
        </div>
      )}
    </div>
  )
}

export default CameraView
