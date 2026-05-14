import React, { useState, useEffect } from 'react'
import { Zap, Sun, Moon, Cloud, AlertTriangle, CheckCircle, Settings } from 'lucide-react'
import { LowLightOptimizer, LightCondition } from '@/services/vision/lowLightOptimizer'

interface LightGuidanceProps {
  optimizer: LowLightOptimizer
  onEnableFlash?: (enabled: boolean) => void
  onSettingsChange?: (settings: any) => void
  className?: string
}

export const LightGuidance: React.FC<LightGuidanceProps> = ({
  optimizer,
  onEnableFlash,
  onSettingsChange,
  className = ''
}) => {
  const [lightCondition, setLightCondition] = useState<LightCondition | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [flashEnabled, setFlashEnabled] = useState(false)
  const [brightness, setBrightness] = useState(0)

  useEffect(() => {
    const updateLightCondition = () => {
      const condition = optimizer.getCurrentLightCondition()
      setLightCondition(condition)
      setBrightness(condition?.brightness || 0)
      
      // Auto-enable flash if recommended
      if (condition?.recommended.enableFlash && !flashEnabled) {
        setFlashEnabled(true)
        onEnableFlash?.(true)
      }
    }

    updateLightCondition()
    const interval = setInterval(updateLightCondition, 2000)

    return () => clearInterval(interval)
  }, [optimizer, flashEnabled, onEnableFlash])

  const getLightIcon = () => {
    if (!lightCondition) return <Sun className="w-5 h-5" />
    
    switch (lightCondition.condition) {
      case 'bright':
        return <Sun className="w-5 h-5 text-yellow-400" />
      case 'normal':
        return <Cloud className="w-5 h-5 text-blue-400" />
      case 'low':
        return <Moon className="w-5 h-5 text-orange-400" />
      case 'very_low':
        return <Moon className="w-5 h-5 text-red-400" />
      default:
        return <Sun className="w-5 h-5" />
    }
  }

  const getLightColor = () => {
    if (!lightCondition) return 'bg-gray-800'
    
    switch (lightCondition.condition) {
      case 'bright':
        return 'bg-yellow-900/20 border-yellow-400/50'
      case 'normal':
        return 'bg-blue-900/20 border-blue-400/50'
      case 'low':
        return 'bg-orange-900/20 border-orange-400/50'
      case 'very_low':
        return 'bg-red-900/20 border-red-400/50'
      default:
        return 'bg-gray-800'
    }
  }

  const getLightMessage = () => {
    if (!lightCondition) return 'Analyzing light conditions...'
    
    switch (lightCondition.condition) {
      case 'bright':
        return 'Excellent lighting conditions'
      case 'normal':
        return 'Good lighting for scanning'
      case 'low':
        return 'Low light detected - consider enabling flash'
      case 'very_low':
        return 'Very low light - flash recommended for best results'
      default:
        return 'Analyzing light conditions...'
    }
  }

  const toggleFlash = () => {
    const newState = !flashEnabled
    setFlashEnabled(newState)
    onEnableFlash?.(newState)
  }

  const renderBrightnessBar = () => {
    const percentage = (brightness / 255) * 100
    const color = percentage > 70 ? 'bg-green-500' : percentage > 40 ? 'bg-yellow-500' : 'bg-red-500'

    return (
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    )
  }

  const renderRecommendations = () => {
    if (!lightCondition) return null

    const recommendations = []
    
    if (lightCondition.recommended.enableNightMode) {
      recommendations.push('Night mode enabled')
    }
    
    if (lightCondition.recommended.enableFlash && !flashEnabled) {
      recommendations.push('Enable flash for better results')
    }
    
    if (lightCondition.recommended.sensitivity > 1.2) {
      recommendations.push('Increased detection sensitivity')
    }

    if (recommendations.length === 0) {
      return (
        <div className="flex items-center space-x-2 text-green-400 text-sm">
          <CheckCircle className="w-4 h-4" />
          <span>Optimal settings applied</span>
        </div>
      )
    }

    return (
      <div className="space-y-2">
        {recommendations.map((rec, index) => (
          <div key={index} className="flex items-center space-x-2 text-yellow-400 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>{rec}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Main Light Status */}
      <div className={`p-4 rounded-lg border ${getLightColor()}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            {getLightIcon()}
            <div>
              <h3 className="text-white font-medium">Light Conditions</h3>
              <p className="text-gray-300 text-sm">{getLightMessage()}</p>
            </div>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded hover:bg-gray-700 transition-colors"
          >
            <Settings className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Brightness Indicator */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Brightness</span>
            <span>{Math.round((brightness / 255) * 100)}%</span>
          </div>
          {renderBrightnessBar()}
        </div>

        {/* Flash Control */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-white text-sm">Flash Assist</span>
          </div>
          <button
            onClick={toggleFlash}
            disabled={!lightCondition?.recommended.enableFlash && lightCondition?.condition !== 'very_low'}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              flashEnabled 
                ? 'bg-yellow-500 text-white' 
                : lightCondition?.recommended.enableFlash || lightCondition?.condition === 'very_low'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            {flashEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>

      {/* Recommendations */}
      {renderRecommendations()}

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
          <h4 className="text-white font-medium mb-3">Advanced Settings</h4>
          
          <div className="space-y-3">
            {/* Night Mode */}
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Night Mode</span>
              <div className="w-12 h-6 bg-gray-700 rounded-full relative">
                <div className="absolute top-1 left-1 w-4 h-4 bg-green-500 rounded-full transition-transform"></div>
              </div>
            </div>

            {/* Frame Averaging */}
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Frame Averaging</span>
              <div className="w-12 h-6 bg-gray-700 rounded-full relative">
                <div className="absolute top-1 left-1 w-4 h-4 bg-green-500 rounded-full transition-transform"></div>
              </div>
            </div>

            {/* Noise Reduction */}
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Noise Reduction</span>
              <div className="w-12 h-6 bg-gray-700 rounded-full relative">
                <div className="absolute top-1 left-1 w-4 h-4 bg-green-500 rounded-full transition-transform"></div>
              </div>
            </div>

            {/* Sensitivity */}
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-300">Sensitivity</span>
                <span className="text-gray-400">
                  {lightCondition?.recommended.sensitivity.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min="1.0"
                max="2.0"
                step="0.1"
                defaultValue={lightCondition?.recommended.sensitivity || 1.0}
                className="w-full"
              />
            </div>
          </div>

          {/* Camera Settings */}
          <div className="mt-4 pt-4 border-t border-gray-700">
            <h5 className="text-gray-300 text-sm font-medium mb-2">Camera Settings</h5>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-400">Exposure:</span>
                <span className="text-gray-300 ml-1">+2</span>
              </div>
              <div>
                <span className="text-gray-400">ISO:</span>
                <span className="text-gray-300 ml-1">400</span>
              </div>
              <div>
                <span className="text-gray-400">Frame Rate:</span>
                <span className="text-gray-300 ml-1">25fps</span>
              </div>
              <div>
                <span className="text-gray-400">Resolution:</span>
                <span className="text-gray-300 ml-1">640x480</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-900/20 border border-blue-400/50 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="w-4 h-4 text-blue-400 mt-0.5" />
          <div>
            <h4 className="text-blue-400 font-medium text-sm mb-1">Lighting Tips</h4>
            <ul className="text-gray-300 text-xs space-y-1">
              <li>• Position products under consistent lighting</li>
              <li>• Avoid direct glare on reflective surfaces</li>
              <li>• Use flash assist in low-light conditions</li>
              <li>• Ensure even lighting across the product</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LightGuidance
