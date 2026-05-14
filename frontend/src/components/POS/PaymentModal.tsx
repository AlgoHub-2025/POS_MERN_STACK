import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Wallet, Banknote, Smartphone, Clock } from 'lucide-react';
import { useState } from 'react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onPaymentComplete: (method: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  total,
  onPaymentComplete
}) => {
  const [cashAmount, setCashAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const paymentMethods = [
    { id: 'cash', name: 'Cash', icon: Banknote, color: 'from-green-500 to-green-600', description: 'Physical currency' },
    { id: 'credit', name: 'Credit Card', icon: CreditCard, color: 'from-blue-500 to-blue-600', description: 'Visa, Mastercard, Amex' },
    { id: 'debit', name: 'Debit Card', icon: CreditCard, color: 'from-indigo-500 to-indigo-600', description: 'Direct bank payment' },
    { id: 'apple', name: 'Apple Pay', icon: Smartphone, color: 'from-gray-700 to-gray-800', description: 'Tap to pay' },
    { id: 'google', name: 'Google Pay', icon: Wallet, color: 'from-slate-700 to-slate-800', description: 'Quick checkout' },
    { id: 'credit_sale', name: 'Credit Sale', icon: Clock, color: 'from-purple-500 to-purple-600', description: 'Pay later' },
  ];

  const handlePayment = (methodId: string) => {
    setSelectedMethod(methodId);
    setTimeout(() => {
      onPaymentComplete(methodId);
      setSelectedMethod(null);
      setCashAmount('');
    }, 1500);
  };

  const cashChange = cashAmount ? parseFloat(cashAmount) - total : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Payment</h2>
                <p className="text-gray-500 text-sm">Select payment method</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            {/* Total amount */}
            <div className="bg-gradient-to-r from-primary-700 to-primary-800 text-white p-5 rounded-xl mb-6 shadow-lg">
              <p className="text-sm opacity-90 mb-1">Total Amount Due</p>
              <p className="text-4xl font-bold">${total.toFixed(2)}</p>
            </div>
            
            {/* Payment methods grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {paymentMethods.map((method, index) => {
                const Icon = method.icon;
                const isSelected = selectedMethod === method.id;
                
                return (
                  <motion.button
                    key={method.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: isSelected ? 1 : 1.02, y: -2 }}
                    whileTap={{ scale: isSelected ? 1 : 0.98 }}
                    disabled={selectedMethod !== null}
                    onClick={() => handlePayment(method.id)}
                    className={`relative overflow-hidden p-4 rounded-xl flex flex-col items-center gap-2 transition-all ${
                      isSelected 
                        ? 'ring-2 ring-primary-500 ring-offset-2' 
                        : 'hover:shadow-lg'
                    } ${selectedMethod && !isSelected ? 'opacity-50' : ''}`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${method.color} opacity-90`} />
                    <div className="relative z-10 flex flex-col items-center">
                      {isSelected ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                        />
                      ) : (
                        <Icon size={24} className="text-white" />
                      )}
                      <span className="text-white font-semibold text-sm mt-1">{method.name}</span>
                      <span className="text-white/80 text-xs">{method.description}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
            
            {/* Cash payment option */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cash Received
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                  />
                </div>
                <button 
                  onClick={() => setCashAmount(total.toFixed(2))}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Exact
                </button>
              </div>
              {cashChange > 0 && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-success-600 font-semibold mt-2"
                >
                  Change: ${cashChange.toFixed(2)}
                </motion.p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
