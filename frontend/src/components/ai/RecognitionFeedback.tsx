import React, { useState, useEffect } from 'react'
import { ThumbsUp, ThumbsDown, AlertCircle, CheckCircle, Search, RefreshCw, MessageSquare } from 'lucide-react'
import { EdgeCaseHandler, EdgeCaseResult } from '@/services/vision/edgeCaseHandler'

interface RecognitionFeedbackProps {
  edgeCaseHandler: EdgeCaseHandler
  detectionResult: EdgeCaseResult | null
  onManualOverride?: (productId: string) => void
  onFeedback?: (productId: string, edgeCaseType: string, correct: boolean) => void
  className?: string
}

export const RecognitionFeedback: React.FC<RecognitionFeedbackProps> = ({
  edgeCaseHandler,
  detectionResult,
  onManualOverride,
  onFeedback,
  className = ''
}) => {
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackGiven, setFeedbackGiven] = useState(false)
  const [selectedAlternative, setSelectedAlternative] = useState<string | null>(null)
  const [customFeedback, setCustomFeedback] = useState('')
  const [showAlternatives, setShowAlternatives] = useState(false)

  useEffect(() => {
    if (detectionResult && detectionResult.edgeCaseDetected) {
      setShowFeedback(true)
      setFeedbackGiven(false)
    }
  }, [detectionResult])

  const handleFeedback = (correct: boolean) => {
    if (!detectionResult) return

    const productId = detectionResult.originalResult.product?.id || 'unknown'
    const edgeCaseType = detectionResult.edgeCaseType

    edgeCaseHandler.recordFeedback(productId, edgeCaseType, correct)
    onFeedback?.(productId, edgeCaseType, correct)
    setFeedbackGiven(true)

    // Hide feedback after a delay
    setTimeout(() => {
      setShowFeedback(false)
    }, 2000)
  }

  const handleManualOverride = () => {
    if (!detectionResult || !selectedAlternative) return

    onManualOverride?.(selectedAlternative)
    setShowFeedback(false)
  }

  const getFeedbackIcon = () => {
    if (!detectionResult) return null

    if (detectionResult.manualOverrideRequired) {
      return <AlertCircle className="w-5 h-5 text-yellow-400" />
    }

    if (detectionResult.confidence > 0.8) {
      return <CheckCircle className="w-5 h-5 text-green-400" />
    }

    return <AlertCircle className="w-5 h-5 text-orange-400" />
  }

  const getFeedbackMessage = () => {
    if (!detectionResult) return ''

    if (detectionResult.manualOverrideRequired) {
      return 'Manual verification required'
    }

    if (detectionResult.edgeCaseType === 'occlusion') {
      return 'Product partially occluded - is this correct?'
    }

    if (detectionResult.edgeCaseType === 'extreme_angle') {
      return 'Extreme angle detection - please verify'
    }

    if (detectionResult.edgeCaseType === 'packaging') {
      return 'Packaging detected - is this the right product?'
    }

    if (detectionResult.edgeCaseType === 'similar_products') {
      return 'Similar products found - please confirm'
    }

    return 'Please verify this detection'
  }

  const getConfidenceColor = () => {
    if (!detectionResult) return 'text-gray-400'

    const confidence = detectionResult.confidence
    if (confidence > 0.8) return 'text-green-400'
    if (confidence > 0.6) return 'text-yellow-400'
    return 'text-red-400'
  }

  const renderFeedbackButtons = () => {
    if (feedbackGiven) {
      return (
        <div className="flex items-center space-x-2 text-green-400">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">Thank you for your feedback!</span>
        </div>
      )
    }

    return (
      <div className="flex items-center space-x-3">
        <button
          onClick={() => handleFeedback(true)}
          className="flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <ThumbsUp className="w-4 h-4" />
          <span>Correct</span>
        </button>
        <button
          onClick={() => handleFeedback(false)}
          className="flex items-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <ThumbsDown className="w-4 h-4" />
          <span>Incorrect</span>
        </button>
      </div>
    )
  }

  const renderAlternatives = () => {
    if (!detectionResult || !showAlternatives) return null

    // Mock alternatives - in real implementation, these would come from the edge case handler
    const alternatives = [
      { id: 'alt1', name: 'Alternative Product 1', confidence: 0.75 },
      { id: 'alt2', name: 'Alternative Product 2', confidence: 0.68 },
      { id: 'alt3', name: 'Alternative Product 3', confidence: 0.62 }
    ]

    return (
      <div className="mt-3 p-3 bg-gray-800 rounded-lg">
        <h4 className="text-white text-sm font-medium mb-2">Alternative Matches:</h4>
        <div className="space-y-2">
          {alternatives.map((alt) => (
            <label
              key={alt.id}
              className="flex items-center space-x-2 p-2 rounded hover:bg-gray-700 cursor-pointer"
            >
              <input
                type="radio"
                name="alternative"
                value={alt.id}
                checked={selectedAlternative === alt.id}
                onChange={(e) => setSelectedAlternative(e.target.value)}
                className="text-green-500"
              />
              <div className="flex-1">
                <span className="text-gray-300 text-sm">{alt.name}</span>
                <span className="text-gray-500 text-xs ml-2">
                  ({Math.round(alt.confidence * 100)}%)
                </span>
              </div>
            </label>
          ))}
        </div>
        {selectedAlternative && (
          <button
            onClick={handleManualOverride}
            className="mt-2 w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
          >
            Use Selected Product
          </button>
        )}
      </div>
    )
  }

  const renderRecommendations = () => {
    if (!detectionResult || detectionResult.recommendations.length === 0) return null

    return (
      <div className="mt-3 space-y-2">
        {detectionResult.recommendations.map((rec, index) => (
          <div key={index} className="flex items-start space-x-2 text-yellow-400 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{rec}</span>
          </div>
        ))}
      </div>
    )
  }

  if (!showFeedback || !detectionResult) return null

  return (
    <div className={`bg-gray-900 border border-gray-700 rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {getFeedbackIcon()}
          <div>
            <h3 className="text-white font-medium">Recognition Verification</h3>
            <p className="text-gray-400 text-sm">{getFeedbackMessage()}</p>
          </div>
        </div>
        <button
          onClick={() => setShowFeedback(false)}
          className="p-1 rounded hover:bg-gray-800 transition-colors"
        >
          <RefreshCw className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Detection Info */}
      <div className="mb-3 p-3 bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-white font-medium">
              {detectionResult.originalResult.product?.name || 'Unknown Product'}
            </span>
            <span className="text-gray-400 text-sm ml-2">
              ({detectionResult.originalResult.product?.category || 'Unknown Category'})
            </span>
          </div>
          <div className={`text-sm font-medium ${getConfidenceColor()}`}>
            {Math.round(detectionResult.confidence * 100)}% confidence
          </div>
        </div>
        
        {detectionResult.edgeCaseDetected && (
          <div className="mt-2 text-xs text-gray-400">
            Edge case: {detectionResult.edgeCaseType.replace('_', ' ')}
          </div>
        )}
      </div>

      {/* Feedback Buttons */}
      <div className="mb-3">
        {renderFeedbackButtons()}
      </div>

      {/* Recommendations */}
      {renderRecommendations()}

      {/* Show Alternatives Button */}
      {detectionResult.edgeCaseType === 'similar_products' && !feedbackGiven && (
        <button
          onClick={() => setShowAlternatives(!showAlternatives)}
          className="mb-3 flex items-center space-x-2 text-blue-400 hover:text-blue-300 text-sm transition-colors"
        >
          <Search className="w-4 h-4" />
          <span>{showAlternatives ? 'Hide' : 'Show'} Alternative Products</span>
        </button>
      )}

      {/* Alternatives */}
      {renderAlternatives()}

      {/* Custom Feedback */}
      {!feedbackGiven && (
        <div className="mt-3">
          <div className="flex items-center space-x-2 text-gray-400 text-sm mb-2">
            <MessageSquare className="w-4 h-4" />
            <span>Additional feedback (optional):</span>
          </div>
          <textarea
            value={customFeedback}
            onChange={(e) => setCustomFeedback(e.target.value)}
            placeholder="Describe any issues or suggestions..."
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-300 text-sm resize-none"
            rows={2}
          />
          {customFeedback && (
            <button
              onClick={() => {
                // Handle custom feedback submission
                console.log('Custom feedback:', customFeedback)
                setCustomFeedback('')
              }}
              className="mt-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm transition-colors"
            >
              Submit Feedback
            </button>
          )}
        </div>
      )}

      {/* Learning Status */}
      <div className="mt-3 pt-3 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>This helps improve detection accuracy</span>
          <span>Learning enabled</span>
        </div>
      </div>
    </div>
  )
}

export default RecognitionFeedback
