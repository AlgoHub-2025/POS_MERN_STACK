import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const icons = {
  success: <CheckCircle className="text-success-500" size={22} />,
  error: <XCircle className="text-error-500" size={22} />,
  warning: <AlertCircle className="text-warning-500" size={22} />,
  info: <Info className="text-primary-500" size={22} />
};

const styles = {
  success: 'border-l-success-500 bg-success-50',
  error: 'border-l-error-500 bg-error-50',
  warning: 'border-l-warning-500 bg-warning-50',
  info: 'border-l-primary-500 bg-primary-50'
};

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  type, 
  isVisible, 
  onClose,
  duration = 3000 
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-4 right-4 z-50"
        >
          <div className={`bg-white rounded-xl shadow-2xl p-4 flex items-center gap-3 border-l-4 min-w-[320px] ${styles[type]}`}>
            {icons[type]}
            <p className="text-gray-700 flex-1 font-medium">{message}</p>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
