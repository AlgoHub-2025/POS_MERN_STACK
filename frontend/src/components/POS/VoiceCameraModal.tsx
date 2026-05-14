import React, { useState, useRef, useEffect } from 'react'
import { X, Mic, Camera, Search, Package } from 'lucide-react'
import { useVoiceSearch } from '@/hooks/useVoiceSearch'
import { useVisualRecognition } from '@/hooks/useVisualRecognition'
import { Product } from '@/types'

interface VoiceCameraModalProps {
  isOpen: boolean
  onClose: () => void
  onProductAdd: (product: Product) => void
  onSearch: (query: string) => void
}

export const VoiceCameraModal: React.FC<VoiceCameraModalProps> = ({
  isOpen,
  onClose,
  onProductAdd,
  onSearch
}) => {
  const [mode, setMode] = useState<'voice' | 'camera'>('voice')
  const [searchQuery, setSearchQuery] = useState('')
  const [recognizedProduct, setRecognizedProduct] = useState<Product | null>(null)

  const {
    isListening,
    isSupported: voiceSupported,
    transcript,
    startListening,
    stopListening
  } = useVoiceSearch({
    onCommandDetected: (command) => {
      if (command.intent === 'add' && command.entities.length > 0) {
        const productEntity = command.entities.find(e => e.type === 'product')
        if (productEntity) {
          // Mock product creation based on voice command
          const mockProduct: Product = {
            id: Date.now().toString(),
            name: productEntity.value,
            price: 3.50 + Math.random() * 2,
            category: 'Coffee',
            inStock: true
          }
          onProductAdd(mockProduct)
          setRecognizedProduct(mockProduct)
        }
      } else if (command.intent === 'search') {
        const searchEntity = command.entities.find(e => e.type === 'product')
        if (searchEntity) {
          setSearchQuery(searchEntity.value)
          onSearch(searchEntity.value)
        }
      }
    },
    onError: (error) => {
      console.error('Voice search error:', error)
    }
  })

  const {
    isScanning,
    isSupported: cameraSupported,
    videoRef,
    canvasRef,
    startScanning,
    stopScanning
  } = useVisualRecognition({
    onProductRecognized: (recognized) => {
      setRecognizedProduct(recognized.product)
      onProductAdd(recognized.product)
    },
    onError: (error) => {
      console.error('Visual recognition error:', error)
    }
  })

  useEffect(() => {
    if (!isOpen) {
      stopListening()
      stopScanning()
      setRecognizedProduct(null)
      setSearchQuery('')
    }
  }, [isOpen, stopListening, stopScanning])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-green-400 flex items-center">
            {mode === 'voice' ? (
              <>
                <Mic className="w-6 h-6 mr-3" />
                Voice Search
              </>
            ) : (
              <>
                <Camera className="w-6 h-6 mr-3" />
                Product Scanner
              </>
            )}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setMode('voice')}
            className={`flex-1 py-4 font-medium transition-colors duration-200 ${
              mode === 'voice'
                ? 'bg-green-900/50 text-green-400 border-b-2 border-green-400'
                : 'text-gray-400 hover:bg-gray-800'
            }`}
          >
            <Mic className="w-5 h-5 mr-2" />
            Voice Commands
          </button>
          <button
            onClick={() => setMode('camera')}
            className={`flex-1 py-4 font-medium transition-colors duration-200 ${
              mode === 'camera'
                ? 'bg-green-900/50 text-green-400 border-b-2 border-green-400'
                : 'text-gray-400 hover:bg-gray-800'
            }`}
          >
            <Camera className="w-5 h-5 mr-2" />
            Visual Scanner
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {mode === 'voice' ? (
            <div className="space-y-6">
              {/* Voice Status */}
              <div className="text-center">
                <div className={`inline-flex items-center space-x-3 px-6 py-3 rounded-full ${
                  isListening
                    ? 'bg-red-600 text-white animate-pulse'
                    : voiceSupported
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-red-900/50 text-red-400'
                }`}>
                  <Mic className={`w-6 h-6 ${isListening ? 'animate-bounce' : ''}`} />
                  <span className="font-medium">
                    {isListening ? 'Listening...' : voiceSupported ? 'Tap to speak' : 'Not Supported'}
                  </span>
                </div>
              </div>

              {/* Transcript */}
              {transcript && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-green-400 font-mono">"{transcript}"</p>
                </div>
              )}

              {/* Voice Controls */}
              <div className="flex justify-center">
                <button
                  onClick={isListening ? stopListening : startListening}
                  disabled={!voiceSupported}
                  className={`px-8 py-4 rounded-lg font-medium transition-all duration-200 ${
                    isListening
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : voiceSupported
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isListening ? 'Stop Listening' : 'Start Voice Search'}
                </button>
              </div>

              {/* Voice Commands Help */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-green-400 font-semibold mb-3">Voice Commands:</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <div>• "Add {'<product>'}" - Add item to cart</div>
                  <div>• "Add {'<quantity>'} {'<product>'}" - Add multiple items</div>
                  <div>• "Find {'<product>'}" - Search for product</div>
                  <div>• "Clear cart" - Empty shopping cart</div>
                  <div>• "Checkout" - Proceed to payment</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Camera View */}
              <div className="relative bg-black rounded-lg overflow-hidden" style={{ minHeight: '300px' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
                
                {/* Scanning Overlay */}
                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-center">
                      <div className="w-16 h-16 border-4 border-green-400 rounded-full animate-spin border-t-transparent"></div>
                      <p className="text-green-400 mt-4 font-medium">Scanning Product...</p>
                    </div>
                  </div>
                )}

                {/* Camera Controls */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                  <button
                    onClick={isScanning ? stopScanning : startScanning}
                    disabled={!cameraSupported}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isScanning
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : cameraSupported
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isScanning ? 'Stop Scanning' : 'Start Scanner'}
                  </button>
                </div>
              </div>

              {/* Recognized Product */}
              {recognizedProduct && (
                <div className="bg-green-900/50 border border-green-400 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-green-400 font-semibold text-lg">{recognizedProduct.name}</h4>
                      <p className="text-gray-300">${recognizedProduct.price.toFixed(2)}</p>
                      <p className="text-sm text-gray-400">{recognizedProduct.category}</p>
                    </div>
                    <button
                      onClick={() => onProductAdd(recognizedProduct)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              )}

              {/* Camera Help */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-green-400 font-semibold mb-3">Visual Scanner:</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <div>• Position product clearly in camera view</div>
                  <div>• Ensure good lighting for best results</div>
                  <div>• Hold steady for 2-3 seconds</div>
                  <div>• Scanner will auto-detect products</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
