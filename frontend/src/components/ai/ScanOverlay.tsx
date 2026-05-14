import React, { useEffect, useState } from 'react'
import { Scan, Camera, Check, AlertCircle, Loader2 } from 'lucide-react'
import { DetectionResult } from '@/services/vision/productDetector'

interface ScanOverlayProps {
  isScanning: boolean
  detections: DetectionResult[]
  onManualCapture?: () => void
  showGuidance?: boolean
  className?: string
}

export const ScanOverlay: React.FC<ScanOverlayProps> = ({
  isScanning,
  detections,
  onManualCapture,
  showGuidance = true,
  className = ''
}) => {
  const [scanLinePosition, setScanLinePosition] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)

  // Animate scan line
  useEffect(() => {
    if (!isScanning) {
      setScanLinePosition(0)
      return
    }

    const interval = setInterval(() => {
      setScanLinePosition(prev => (prev + 2) % 100)
    }, 20)

    return () => clearInterval(interval)
  }, [isScanning])

  // Show success animation when products are detected
  useEffect(() => {
    if (detections.length > 0) {
      setShowSuccess(true)
      const timer = setTimeout(() => setShowSuccess(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [detections])

  const renderBoundingBoxes = () => {
    return detections.map((detection, index) => (
      <div
        key={`${detection.product.id}-${index}`}
        className="absolute border-2 border-green-400 bg-green-400/10 animate-pulse"
        style={{
          left: `${detection.boundingBox.x}px`,
          top: `${detection.boundingBox.y}px`,
          width: `${detection.boundingBox.width}px`,
          height: `${detection.boundingBox.height}px`
        }}
      >
        {/* Product label */}
        <div className="absolute -top-6 left-0 bg-green-500 text-white text-xs px-2 py-1 rounded">
          {detection.product.name}
          <span className="ml-1 text-green-200">
            ({Math.round(detection.confidence * 100)}%)
          </span>
        </div>

        {/* Confidence indicator */}
        <div className="absolute -bottom-6 right-0 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {Math.round(detection.confidence * 100)}%
        </div>
      </div>
    ))
  }

  const renderScanLine = () => {
    if (!isScanning) return null

    return (
      <div className="absolute inset-x-0 pointer-events-none">
        <div
          className="h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent"
          style={{
            top: `${scanLinePosition}%`
          }}
        >
          <div className="absolute inset-0 bg-green-400 blur-sm"></div>
        </div>
      </div>
    )
  }

  const renderGuidance = () => {
    if (!showGuidance) return null

    return (
      <div className="absolute top-4 left-4 right-4">
        <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 max-w-sm mx-auto">
          <div className="flex items-center space-x-2 text-white text-sm">
            <Scan className="w-4 h-4 text-green-400" />
            <span>Center product in frame</span>
          </div>
          <div className="text-xs text-gray-300 mt-1">
            {isScanning ? 'Scanning for products...' : 'Tap to start scanning'}
          </div>
        </div>
      </div>
    )
  }

  const renderCornerGuides = () => {
    return (
      <>
        {/* Top-left corner */}
        <div className="absolute top-8 left-8 w-8 h-8 border-t-2 border-l-2 border-green-400"></div>
        {/* Top-right corner */}
        <div className="absolute top-8 right-8 w-8 h-8 border-t-2 border-r-2 border-green-400"></div>
        {/* Bottom-left corner */}
        <div className="absolute bottom-8 left-8 w-8 h-8 border-b-2 border-l-2 border-green-400"></div>
        {/* Bottom-right corner */}
        <div className="absolute bottom-8 right-8 w-8 h-8 border-b-2 border-r-2 border-green-400"></div>
      </>
    )
  }

  const renderStatusIndicator = () => {
    if (showSuccess) {
      return (
        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-2 rounded-full flex items-center space-x-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span className="text-sm font-medium">
            {detections.length} product{detections.length > 1 ? 's' : ''} found
          </span>
        </div>
      )
    }

    if (isScanning) {
      return (
        <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-2 rounded-full flex items-center space-x-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm font-medium">Scanning</span>
        </div>
      )
    }

    return (
      <div className="absolute top-4 right-4 bg-gray-700 text-white px-3 py-2 rounded-full flex items-center space-x-2">
        <Camera className="w-4 h-4" />
        <span className="text-sm font-medium">Ready</span>
      </div>
    )
  }

  const renderManualCaptureButton = () => {
    if (!onManualCapture || isScanning) return null

    return (
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <button
          onClick={onManualCapture}
          className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
        >
          <Camera className="w-8 h-8 text-gray-800" />
        </button>
        <div className="text-center mt-2">
          <span className="text-white text-xs bg-black/50 px-2 py-1 rounded">
            Tap to capture
          </span>
        </div>
      </div>
    )
  }

  const renderDetectionResults = () => {
    if (detections.length === 0) return null

    return (
      <div className="absolute bottom-8 left-4 right-4">
        <div className="bg-black/80 backdrop-blur-sm rounded-lg p-3">
          <h4 className="text-white font-medium text-sm mb-2">Detected Products:</h4>
          <div className="space-y-1">
            {detections.map((detection, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="text-green-400">{detection.product.name}</span>
                <span className="text-gray-300">
                  {Math.round(detection.confidence * 100)}% confidence
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderLowLightWarning = () => {
    // This would be connected to actual light sensor
    const isLowLight = false // Placeholder

    if (!isLowLight || !showGuidance) return null

    return (
      <div className="absolute bottom-8 left-4 right-4">
        <div className="bg-yellow-500/90 backdrop-blur-sm rounded-lg p-3 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-white" />
          <span className="text-white text-sm">
            Low light detected. Enable flashlight for better results.
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {/* Corner guides */}
      {renderCornerGuides()}

      {/* Scan line animation */}
      {renderScanLine()}

      {/* Detection bounding boxes */}
      {renderBoundingBoxes()}

      {/* Status indicator */}
      {renderStatusIndicator()}

      {/* Guidance text */}
      {renderGuidance()}

      {/* Manual capture button */}
      {renderManualCaptureButton()}

      {/* Detection results */}
      {renderDetectionResults()}

      {/* Low light warning */}
      {renderLowLightWarning()}

      {/* Performance overlay (dev only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 left-4 bg-black/60 text-green-400 text-xs font-mono p-2 rounded">
          <div>Detections: {detections.length}</div>
          <div>Scanning: {isScanning ? 'Yes' : 'No'}</div>
          <div>Scan Line: {scanLinePosition}%</div>
        </div>
      )}
    </div>
  )
}

export default ScanOverlay
