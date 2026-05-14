import React, { useState } from 'react'
import { Brain, ShoppingCart, Mic, Camera, Search } from 'lucide-react'
import { VoiceCameraModal } from './VoiceCameraModal'
import { Product, CartItem } from '@/types'

interface AIProductGridProps {
  products: Product[]
  cart: CartItem[]
  onAddToCart: (product: Product) => void
  onVoiceSearch?: () => void
  onCameraScan?: () => void
}

export const AIProductGrid: React.FC<AIProductGridProps> = ({
  products,
  cart,
  onAddToCart,
  onVoiceSearch,
  onCameraScan
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showVoiceCameraModal, setShowVoiceCameraModal] = useState(false)

  const isInCart = (productId: string) => cart.some(item => item.product.id === productId)

  return (
    <div className="space-y-4">
      {/* Search Controls */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-20 py-3 text-green-400 placeholder-green-400/40"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400/60 w-5 h-5" />
          
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            <button
              onClick={() => setShowVoiceCameraModal(true)}
              className="p-2 bg-purple-600 hover:bg-purple-500 rounded-lg"
            >
              <Mic className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => setShowVoiceCameraModal(true)}
              className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg"
            >
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => {
          const inCart = isInCart(product.id)
          
          return (
            <div key={product.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="text-center mb-3">
                <div className="text-2xl mb-2">☕</div>
                <h3 className="text-green-400 font-medium">{product.name}</h3>
                <p className="text-gray-400">${product.price.toFixed(2)}</p>
              </div>

              <button
                onClick={() => onAddToCart(product)}
                disabled={inCart}
                className={`w-full py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center space-x-1 ${
                  inCart
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{inCart ? 'In Cart' : 'Add to Cart'}</span>
              </button>
            </div>
          )
        })}
      </div>

      <VoiceCameraModal
        isOpen={showVoiceCameraModal}
        onClose={() => setShowVoiceCameraModal(false)}
        onProductAdd={onAddToCart}
        onSearch={setSearchTerm}
      />
    </div>
  )
}
