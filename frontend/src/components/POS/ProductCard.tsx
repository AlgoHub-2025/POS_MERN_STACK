import { motion } from 'framer-motion';
import { ShoppingCart, Heart } from 'lucide-react';

export interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  stock: number;
  category: string;
  isPopular?: boolean;
  isNew?: boolean;
}

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
  isInCart?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd, isInCart = false }) => {
  const stockStatus = product.stock > 10 ? 'high' : product.stock > 0 ? 'low' : 'out';
  
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' }}
      transition={{ duration: 0.2 }}
      className="relative bg-white rounded-xl shadow-md overflow-hidden group border border-gray-100"
    >
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex gap-1">
        {product.isPopular && (
          <span className="bg-accent-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            🔥 Popular
          </span>
        )}
        {product.isNew && (
          <span className="bg-success-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            ✨ New
          </span>
        )}
      </div>
      
      {/* Wishlist button */}
      <button className="absolute top-2 right-2 z-10 p-1.5 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-gray-50">
        <Heart size={16} className="text-gray-600 hover:text-red-500 transition-colors" />
      </button>
      
      {/* Product image with zoom effect */}
      <div className="relative overflow-hidden h-40 bg-gradient-to-br from-primary-100 to-primary-200">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl">☕</span>
          </div>
        )}
        {stockStatus === 'out' && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Out of Stock</span>
          </div>
        )}
      </div>
      
      {/* Product info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-semibold text-gray-800 truncate pr-2">{product.name}</h3>
        </div>
        <p className="text-sm text-gray-500 mb-3">{product.category}</p>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-xl font-bold text-primary-700">
            ${product.price.toFixed(2)}
          </span>
          
          {/* Stock indicator */}
          <div className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${
              stockStatus === 'high' ? 'bg-success-500' :
              stockStatus === 'low' ? 'bg-warning-500' : 'bg-error-500'
            }`} />
            <span className="text-xs text-gray-500">
              {product.stock} left
            </span>
          </div>
        </div>
        
        {/* Add button */}
        <motion.button
          whileHover={{ scale: stockStatus === 'out' ? 1 : 1.02 }}
          whileTap={{ scale: stockStatus === 'out' ? 1 : 0.98 }}
          disabled={stockStatus === 'out' || isInCart}
          onClick={() => onAdd(product)}
          className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all font-medium ${
            stockStatus === 'out'
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : isInCart
                ? 'bg-success-100 text-success-700 cursor-default'
                : 'bg-primary-700 text-white hover:bg-primary-800 shadow-md hover:shadow-lg'
          }`}
        >
          <ShoppingCart size={18} />
          {stockStatus === 'out' ? 'Out of Stock' : isInCart ? 'In Cart' : 'Add to Cart'}
        </motion.button>
      </div>
    </motion.div>
  );
};
