import { motion } from 'framer-motion';
import { Plus, Minus, Trash2 } from 'lucide-react';

export interface CartItemType {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    image?: string;
  };
  quantity: number;
}

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  onRemove: (id: string) => void;
}

export const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemove }) => {
  const total = item.product.price * item.quantity;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      {/* Product image */}
      <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
        {item.product.image ? (
          <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl">☕</span>
        )}
      </div>
      
      {/* Product details */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-800 truncate">{item.product.name}</h4>
        <p className="text-sm text-gray-500">${item.product.price.toFixed(2)} each</p>
      </div>
      
      {/* Quantity controls */}
      <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1">
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
          className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow transition-shadow disabled:opacity-40"
          disabled={item.quantity <= 1}
        >
          <Minus size={14} className={item.quantity <= 1 ? 'text-gray-400' : 'text-gray-600'} />
        </motion.button>
        
        <span className="w-8 text-center font-semibold text-gray-800">{item.quantity}</span>
        
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow transition-shadow"
        >
          <Plus size={14} className="text-gray-600" />
        </motion.button>
      </div>
      
      {/* Price and remove */}
      <div className="text-right min-w-[80px]">
        <p className="font-bold text-primary-700 text-lg">
          ${total.toFixed(2)}
        </p>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onRemove(item.id)}
          className="text-gray-400 hover:text-error-500 transition-colors mt-1 p-1"
        >
          <Trash2 size={16} />
        </motion.button>
      </div>
    </motion.div>
  );
};
