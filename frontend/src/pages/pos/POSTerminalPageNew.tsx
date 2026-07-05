import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShoppingCart, 
  Search,
  Mic,
  Camera,
  Bell,
  User,
  Wifi,
  WifiOff,
  Clock,
  Printer,
  X,
  Check,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Wallet,
  Banknote,
  Smartphone,
  RefreshCw,
  Sparkles,
  Crown,
  Package,
  Keyboard,
  Maximize2,
  Minimize2,
  ChevronDown
} from 'lucide-react'
import { Product, CartItem, Transaction } from '@/types'

// Mock data
const MOCK_CUSTOMERS = [
  { id: '1', name: 'John Doe', email: 'john@example.com', phone: '555-0100', tier: 'gold', points: 250 },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '555-0101', tier: 'silver', points: 120 },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', phone: '555-0102', tier: 'bronze', points: 45 },
]

const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Espresso', price: 3.50, category: 'Beverages', inStock: true, stock: 50, emoji: '☕' },
  { id: '2', name: 'Latte', price: 4.50, category: 'Beverages', inStock: true, stock: 45, emoji: '🥤' },
  { id: '3', name: 'Cappuccino', price: 4.00, category: 'Beverages', inStock: true, stock: 40, emoji: '☕' },
  { id: '4', name: 'Americano', price: 3.25, category: 'Beverages', inStock: true, stock: 60, emoji: '☕' },
  { id: '5', name: 'Mocha', price: 5.00, category: 'Beverages', inStock: true, stock: 35, emoji: '🍫' },
  { id: '6', name: 'Croissant', price: 2.25, category: 'Bakery', inStock: true, stock: 20, emoji: '🥐' },
  { id: '7', name: 'Muffin', price: 2.75, category: 'Bakery', inStock: true, stock: 15, emoji: '🧁' },
  { id: '8', name: 'Donut', price: 1.95, category: 'Bakery', inStock: true, stock: 25, emoji: '🍩' },
  { id: '9', name: 'Bagel', price: 2.50, category: 'Bakery', inStock: false, stock: 0, emoji: '🥯' },
  { id: '10', name: 'Cookie', price: 1.25, category: 'Snacks', inStock: true, stock: 30, emoji: '🍪' },
  { id: '11', name: 'Sandwich', price: 6.95, category: 'Food', inStock: true, stock: 12, emoji: '🥪' },
  { id: '12', name: 'Salad', price: 7.50, category: 'Food', inStock: true, stock: 10, emoji: '🥗' },
]

const QUICK_ADD_PRODUCTS = [
  { id: '1', name: 'Espresso', price: 3.50, emoji: '☕' },
  { id: '6', name: 'Croissant', price: 2.25, emoji: '🥐' },
  { id: '8', name: 'Donut', price: 1.95, emoji: '🍩' },
  { id: '10', name: 'Cookie', price: 1.25, emoji: '🍪' },
  { id: '3', name: 'Latte', price: 4.50, emoji: '🥤' },
]

const CATEGORIES = [
  { id: 'all', name: 'All Products', emoji: '📦' },
  { id: 'Beverages', name: 'Beverages', emoji: '☕' },
  { id: 'Bakery', name: 'Bakery', emoji: '🥐' },
  { id: 'Snacks', name: 'Snacks', emoji: '🍪' },
  { id: 'Food', name: 'Food', emoji: '🥪' },
]

const POSTerminalPageNew: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([])
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS)
  const [customers] = useState(MOCK_CUSTOMERS)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [selectedPriceLevel, setSelectedPriceLevel] = useState('retail')
  const [discountPercent, setDiscountPercent] = useState(0)
  const [shippingAmount, setShippingAmount] = useState(0)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null)
  const [isMaximized, setIsMaximized] = useState(false)
  const [notificationCount] = useState(3)
  const [isOnline] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showAISuggestion, setShowAISuggestion] = useState(true)

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'p':
            e.preventDefault()
            if (cart.length > 0) setShowPaymentModal(true)
            break
          case 'c':
            e.preventDefault()
            clearCart()
            break
          case 'f':
            e.preventDefault()
            document.getElementById('product-search')?.focus()
            break
        }
      }
      if (e.key === 'Escape') {
        setShowPaymentModal(false)
        setShowReceipt(false)
      }
      if (e.key === 'm' || e.key === 'M') {
        setIsMaximized(prev => !prev)
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [cart.length])

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const addToCart = (product: Product) => {
    if (!product.inStock || product.stock === 0) return
    
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id)
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1, total: product.price * (item.quantity + 1) }
            : item
        )
      }
      return [...prevCart, { id: product.id, product, quantity: 1, total: product.price }]
    })
  }

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId))
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
      return
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId ? { ...item, quantity, total: item.product.price * quantity } : item
      )
    )
  }

  const clearCart = () => {
    if (cart.length > 0) {
      setCart([])
      setDiscountPercent(0)
      setShippingAmount(0)
    }
  }

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  }

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal()
    const customerDiscount = selectedCustomer?.tier === 'gold' ? 0.15 : 
                            selectedCustomer?.tier === 'silver' ? 0.10 : 
                            selectedCustomer?.tier === 'bronze' ? 0.05 : 0
    const totalDiscount = Math.max(discountPercent / 100, customerDiscount)
    return subtotal * totalDiscount
  }

  const calculateTax = () => {
    return (calculateSubtotal() - calculateDiscount()) * 0.08
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const discount = calculateDiscount()
    const tax = calculateTax()
    const rounded = Math.round((subtotal - discount + tax + shippingAmount) * 100) / 100
    return rounded
  }

  const processPayment = async (method: string) => {
    setIsProcessing(true)
    setSelectedPaymentMethod(method)
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const transaction: Transaction = {
      id: Date.now().toString(),
      items: [...cart],
      subtotal: calculateSubtotal(),
      tax: calculateTax(),
      total: calculateTotal(),
      paymentMethod: method,
      timestamp: new Date().toLocaleString(),
      status: 'completed'
    }
    
    setCurrentTransaction(transaction)
    setShowPaymentModal(false)
    setShowReceipt(true)
    setCart([])
    setDiscountPercent(0)
    setShippingAmount(0)
    setIsProcessing(false)
    setSelectedPaymentMethod(null)
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { color: 'bg-red-500', label: 'Out' }
    if (stock <= 10) return { color: 'bg-yellow-500', label: 'Low' }
    return { color: 'bg-green-500', label: 'In Stock' }
  }

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case 'gold': return 'from-amber-400 to-amber-600'
      case 'silver': return 'from-gray-300 to-gray-500'
      case 'bronze': return 'from-orange-400 to-orange-600'
      default: return 'from-gray-200 to-gray-400'
    }
  }

  const getTierBadge = (tier?: string) => {
    switch (tier) {
      case 'gold': return 'bg-amber-100 text-amber-700 border-amber-300'
      case 'silver': return 'bg-gray-100 text-gray-700 border-gray-300'
      case 'bronze': return 'bg-orange-100 text-orange-700 border-orange-300'
      default: return 'bg-gray-100 text-gray-600 border-gray-300'
    }
  }

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 font-sans ${isMaximized ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-4 mb-3 border border-white/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">AH</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">AlgoHub POS</h1>
              <p className="text-sm text-gray-500">Main St Branch · Register #3</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium">{isOnline ? 'Online' : 'Offline'}</span>
              {isOnline ? <Wifi size={14} className="text-green-600" /> : <WifiOff size={14} className="text-red-600" />}
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium shadow-md">
                S
              </div>
              <span className="font-medium text-gray-700">Sarah</span>
            </div>
            
            <div className="relative">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
                    {notificationCount}
                  </span>
                )}
                <Bell size={20} className="text-gray-600" />
              </button>
            </div>

            <button 
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={isMaximized ? 'Minimize (M)' : 'Maximize (M)'}
            >
              {isMaximized ? <Minimize2 size={20} className="text-gray-600" /> : <Maximize2 size={20} className="text-gray-600" />}
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 border-t border-gray-100 pt-2">
          <span className="flex items-center gap-1">📅 {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
          <span className="flex items-center gap-1">⏰ {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Customer Context Row */}
      <div className="bg-white rounded-xl shadow-lg p-3 mb-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-gray-500"><User size={18} /></span>
          <select 
            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            value={selectedCustomer?.id || ''}
            onChange={(e) => {
              const customer = customers.find((c: any) => c.id === e.target.value)
              setSelectedCustomer(customer || null)
            }}
          >
            <option value="">Walk-in Customer</option>
            {customers.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name} ({c.tier})</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-sm">Commission:</span>
          <select className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option>No Agent</option>
            <option>Mike (5%)</option>
            <option>Lisa (3%)</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-sm">Price:</span>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button 
              onClick={() => setSelectedPriceLevel('retail')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${selectedPriceLevel === 'retail' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:bg-white'}`}
            >
              Retail
            </button>
            <button 
              onClick={() => setSelectedPriceLevel('wholesale')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${selectedPriceLevel === 'wholesale' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:bg-white'}`}
            >
              Wholesale
            </button>
          </div>
        </div>
      </div>

      {/* Search & Categories */}
      <div className="mb-3">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            id="product-search"
            type="text" 
            placeholder="Search products... (Ctrl + F)" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-32 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm text-base"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Voice search">
              <Mic size={18} className="text-gray-500" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Scan product">
              <Camera size={18} className="text-gray-500" />
            </button>
            <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors" title="Keyboard shortcuts">
              <Keyboard size={18} className="text-gray-600" />
            </button>
          </div>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat: any) => (
            <button 
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-all shadow-sm ${
                selectedCategory === cat.id 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="mr-1">{cat.emoji}</span>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content - 3 column layout */}
      <div className="grid grid-cols-12 gap-3">
        {/* Left Column - Quick Add (2 cols) */}
        <div className="col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-3 h-full">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1">
              <Sparkles size={12} className="text-yellow-500" />
              Quick Add
            </h3>
            <div className="space-y-2">
              {QUICK_ADD_PRODUCTS.map((product: any) => (
                <button 
                  key={product.id}
                  onClick={() => {
                    const fullProduct = products.find((p: any) => p.id === product.id)
                    if (fullProduct) addToCart(fullProduct)
                  }}
                  className="w-full bg-gray-50 hover:bg-blue-50 hover:border-blue-200 border border-transparent rounded-lg p-2.5 text-left transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{product.emoji}</span>
                      <div>
                        <div className="font-medium text-sm text-gray-800 group-hover:text-blue-700">{product.name}</div>
                        <div className="text-xs text-gray-500">${product.price.toFixed(2)}</div>
                      </div>
                    </div>
                    <Plus size={16} className="text-gray-400 group-hover:text-blue-500" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Column - Product Grid (6 cols) */}
        <div className="col-span-6">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Package size={18} className="text-blue-600" />
                {selectedCategory === 'all' ? 'All Products' : CATEGORIES.find((c: any) => c.id === selectedCategory)?.name}
              </h3>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {filteredProducts.length} items
              </span>
            </div>
            
            <div className="grid grid-cols-4 gap-3">
              {filteredProducts.map((product: any, index: number) => {
                const stockStatus = getStockStatus(product.stock)
                const isLowStock = product.stock > 0 && product.stock <= 10
                
                return (
                  <motion.div 
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => addToCart(product)}
                    className={`bg-gray-50 rounded-lg p-2.5 cursor-pointer transition-all group relative overflow-hidden ${
                      product.inStock && product.stock > 0 
                        ? 'hover:shadow-lg hover:-translate-y-1 hover:bg-white' 
                        : 'opacity-60 cursor-not-allowed'
                    }`}
                  >
                    {isLowStock && (
                      <div className="absolute top-1 right-1">
                        <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full font-medium">
                          Low
                        </span>
                      </div>
                    )}
                    
                    <div className="aspect-square bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg mb-2 flex items-center justify-center text-3xl shadow-inner">
                      {product.emoji}
                    </div>
                    
                    <div className="font-medium text-sm text-gray-800 truncate mb-0.5">{product.name}</div>
                    <div className="text-base font-bold text-blue-600">${product.price.toFixed(2)}</div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${stockStatus.color}`}></div>
                        <span className="text-[10px] text-gray-500">{product.stock} left</span>
                      </div>
                      <button 
                        disabled={!product.inStock || product.stock === 0}
                        className={`text-xs px-2 py-1 rounded font-medium transition-all ${
                          product.inStock && product.stock > 0
                            ? 'bg-blue-600 text-white opacity-0 group-hover:opacity-100 shadow-sm hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {product.inStock && product.stock > 0 ? 'ADD' : 'OUT'}
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Column - Cart (4 cols) */}
        <div className="col-span-4">
          <div className="bg-white rounded-xl shadow-lg border-l-4 border-blue-600 h-full flex flex-col">
            {/* Cart Header */}
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <ShoppingCart size={18} className="text-blue-600" />
                  Current Order
                </h3>
                <span className="text-sm bg-gray-100 px-2 py-1 rounded-full font-medium">
                  {cartItemCount} items
                </span>
              </div>
            </div>
            
            {/* Customer Card */}
            {selectedCustomer && (
              <div className={`mx-3 mt-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-2.5 border border-amber-200`}>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 bg-gradient-to-br ${getTierColor(selectedCustomer.tier)} rounded-full flex items-center justify-center text-white shadow-md`}>
                    <Crown size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-gray-800 truncate">{selectedCustomer.name}</div>
                    <div className="text-xs text-amber-700 capitalize">{selectedCustomer.tier} Member · {selectedCustomer.points} pts</div>
                  </div>
                  <div className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${getTierBadge(selectedCustomer.tier)}`}>
                    {selectedCustomer.tier === 'gold' ? '15%' : selectedCustomer.tier === 'silver' ? '10%' : '5%'} off
                  </div>
                </div>
              </div>
            )}
            
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[280px]">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart size={48} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">Your cart is empty</p>
                  <p className="text-xs text-gray-300 mt-1">Add products to start</p>
                </div>
              ) : (
                cart.map((item: any) => (
                  <motion.div 
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                      {item.product.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-800 truncate">{item.product.name}</div>
                      <div className="text-xs text-gray-500">${item.product.price.toFixed(2)} × {item.quantity}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 bg-white border border-gray-200 rounded flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 bg-white border border-gray-200 rounded flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <div className="text-right min-w-[70px]">
                      <div className="font-semibold text-sm text-gray-800">${(item.product.price * item.quantity).toFixed(2)}</div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
            
            {/* AI Suggestion */}
            {showAISuggestion && cart.length > 0 && (
              <div className="mx-3 mb-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-2.5 border border-purple-200">
                <div className="flex items-start gap-2">
                  <Sparkles size={16} className="text-purple-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-purple-700 leading-relaxed">
                      <span className="font-semibold">AI Tip:</span> Add a Latte for $4.00? 
                      <span className="text-purple-600">60% of customers also buy this.</span>
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => {
                        const latte = products.find((p: any) => p.id === '5')
                        if (latte) addToCart(latte)
                      }}
                      className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full font-medium hover:bg-purple-700 transition-colors"
                    >
                      ADD
                    </button>
                    <button 
                      onClick={() => setShowAISuggestion(false)}
                      className="text-xs bg-white text-gray-500 px-2 py-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Totals */}
            {cart.length > 0 && (
              <div className="p-3 border-t border-gray-100">
                <div className="space-y-1.5 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  
                  {calculateDiscount() > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        Discount
                        <input 
                          type="number" 
                          value={discountPercent}
                          onChange={(e) => setDiscountPercent(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                          className="w-12 px-1 py-0.5 text-xs border border-gray-200 rounded text-center"
                        />
                        %
                      </span>
                      <span className="font-medium text-green-600">-${calculateDiscount().toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (8%)</span>
                    <span className="font-medium">${calculateTax().toFixed(2)}</span>
                  </div>
                  
                  {shippingAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">+${shippingAmount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                    <span className="font-bold text-gray-800">TOTAL</span>
                    <span className="text-2xl font-bold text-blue-600">${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
                
                {/* Payment Methods */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button 
                    onClick={() => setShowPaymentModal(true)}
                    disabled={cart.length === 0}
                    className="bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Banknote size={18} />
                    Cash
                  </button>
                  <button 
                    onClick={() => setShowPaymentModal(true)}
                    disabled={cart.length === 0}
                    className="bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CreditCard size={18} />
                    Card
                  </button>
                  <button 
                    onClick={() => setShowPaymentModal(true)}
                    disabled={cart.length === 0}
                    className="bg-purple-600 text-white py-2.5 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Smartphone size={18} />
                    Mobile
                  </button>
                  <button 
                    onClick={() => setShowPaymentModal(true)}
                    disabled={cart.length === 0}
                    className="bg-orange-600 text-white py-2.5 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw size={18} />
                    Split
                  </button>
                </div>
                
                {/* Action Bar */}
                <div className="flex items-center gap-2">
                  <button className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors">
                    Draft
                  </button>
                  <button className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors">
                    Quote
                  </button>
                  <button className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors">
                    Suspend
                  </button>
                  <button 
                    onClick={() => setShowPaymentModal(true)}
                    disabled={cart.length === 0}
                    className="flex-[2] py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                  >
                    PAY ${calculateTotal().toFixed(2)}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="mt-3 bg-white/80 backdrop-blur-sm rounded-lg shadow p-2 text-xs text-gray-500 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
            <Keyboard size={12} />
            Ctrl+P: Payment | Ctrl+C: Clear | Esc: Close | M: Maximize
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <RefreshCw size={12} />
            Last sync: 1 min ago
          </span>
          <span className="flex items-center gap-1">
            {isOnline ? <Wifi size={12} className="text-green-500" /> : <WifiOff size={12} className="text-red-500" />}
            {isOnline ? 'Strong connection' : 'Offline mode'}
          </span>
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => !isProcessing && setShowPaymentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Wallet size={28} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Select Payment</h2>
                <p className="text-gray-500">Choose payment method</p>
              </div>

              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 rounded-xl mb-6 shadow-lg">
                <p className="text-sm opacity-90">Total Amount</p>
                <p className="text-3xl font-bold">${calculateTotal().toFixed(2)}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { id: 'cash', name: 'Cash', icon: Banknote, color: 'from-green-500 to-green-600' },
                  { id: 'credit', name: 'Credit Card', icon: CreditCard, color: 'from-blue-500 to-blue-600' },
                  { id: 'debit', name: 'Debit Card', icon: CreditCard, color: 'from-indigo-500 to-indigo-600' },
                  { id: 'mobile', name: 'Mobile Pay', icon: Smartphone, color: 'from-purple-500 to-purple-600' },
                ].map((method: any) => {
                  const Icon = method.icon
                  return (
                    <button
                      key={method.id}
                      onClick={() => processPayment(method.id)}
                      disabled={isProcessing}
                      className={`relative overflow-hidden p-4 rounded-xl flex flex-col items-center gap-2 transition-all hover:scale-[1.02] ${
                        isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${method.color}`} />
                      <div className="relative z-10 flex flex-col items-center text-white">
                        {isProcessing && selectedPaymentMethod === method.id ? (
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Icon size={24} />
                        )}
                        <span className="font-semibold mt-1">{method.name}</span>
                      </div>
                    </button>
                  )
                })}
              </div>

              <button 
                onClick={() => setShowPaymentModal(false)}
                disabled={isProcessing}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Receipt Modal */}
      <AnimatePresence>
        {showReceipt && currentTransaction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowReceipt(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check size={32} className="text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Payment Successful!</h2>
                <p className="text-gray-500">Thank you for your business</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Transaction ID</span>
                  <span className="font-medium">#{currentTransaction.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Date</span>
                  <span className="font-medium">{currentTransaction.timestamp}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment</span>
                  <span className="font-medium capitalize">{currentTransaction.paymentMethod}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between text-lg font-bold">
                  <span>Total Paid</span>
                  <span className="text-blue-600">${currentTransaction.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Printer size={18} />
                  Print
                </button>
                <button
                  onClick={() => setShowReceipt(false)}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default POSTerminalPageNew
