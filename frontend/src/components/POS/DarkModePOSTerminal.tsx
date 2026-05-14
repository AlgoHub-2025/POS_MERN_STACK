import React, { useState } from 'react'
import { 
  Search, 
  Wifi, 
  Bell, 
  User, 
  Grid3X3, 
  Coffee, 
  Snowflake, 
  Cookie, 
  Sandwich, 
  Shirt, 
  Plus, 
  Ban, 
  MoreHorizontal, 
  Minus, 
  Trash2, 
  Sparkles, 
  Printer, 
  ArrowRight 
} from 'lucide-react'
import '../../styles/pos-dark-mode.css'

// Custom Material Symbols for React
const MaterialSymbol = ({ icon, className = "" }: { icon: string, className?: string }) => (
  <span className={`material-symbols-outlined ${className}`}>{icon}</span>
)

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  status: 'IN STOCK' | 'LOW STOCK' | 'SOLD OUT'
  image: string
}

interface CartItem {
  id: string
  product: Product
  quantity: number
  modifiers: string[]
  totalPrice: number
}

const DarkModePOSTerminal: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: '1',
      product: {
        id: '1',
        name: 'Caffè Latte',
        description: 'Rich espresso with steamed milk',
        price: 4.50,
        category: 'Hot Coffee',
        status: 'IN STOCK',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQTKHt66YzmA0Ev3CFoumG-DSAorlDUWt1fp59C_3xJNE5nK5gDvpBfNlovDqA8C39BewAB1UqrlTsRlTquSDn9UC49nKKIUw6sCpv9R9nA85g_VaqDx1TQ2xZ3CnJeablVPaJYDwzaERKaovwTpz2XptRfjVTmBNKrMPL0kwBCJovQR_mnlPeOkATcuyZo9S62zntbQ8ft0Vp0CgNHVYdH9EdWuDuA8rLl4UtBHGgRRuFHVxqdVwmC1QqxTRH0CXvyxdeE7fA59Y'
      },
      quantity: 1,
      modifiers: ['Large', 'Oat Milk'],
      totalPrice: 5.50
    },
    {
      id: '2',
      product: {
        id: '3',
        name: 'Choco Muffin',
        description: 'Double dark chocolate chunks',
        price: 3.75,
        category: 'Bakery',
        status: 'LOW STOCK',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBIKybIFrnvzXCmMXmvGq9rmMDryRukcg5pJitJSRWNQCtkCSDhIa_3d9RdRXArFP9IMRqHBMYWi-ieDffTwrIJ3kl9NVqqJOS1QrcZMNW8R_dVKlEIZyy89jo117eo1a2LClaJViJBtee3T9CdihoHfbCtl-eWmH22nPwOrJ3HKXkEU4bxZa_6rQoKdRlQdL50WQ9x7UF7mp1zya1eJBhpLB0p0Lo3WDMIdJYoiyFmPHoVcJjVGTafmoU63Ue09N77QG9NHcRQ64'
      },
      quantity: 2,
      modifiers: ['Warmed up'],
      totalPrice: 7.50
    }
  ])

  const products: Product[] = [
    {
      id: '1',
      name: 'Caffè Latte',
      description: 'Rich espresso with steamed milk',
      price: 4.50,
      category: 'Hot Coffee',
      status: 'IN STOCK',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqJT74QSa9ThhmXbWAavp559OKO5-PcPELMAghs8UEQlt4zzX8wpGm-nirPD5IgDMVK-KYeZ-2MAeNfCQVPSI5h6R4hcF1cnveUkKx9UMSCYwAxUmgRt6JEkqvGU8ToefuU4_LeOiFzkqqo_mmpFMtBdPHYiSsc8HN4SFsjAQh0c_aEyccRh46XE-zO7Ah-3vJ8PXd_d80tjWzfvz_0_nefWdtk_jARPdASNXNq1bi4CIYZcilUhdhLGZK-QEWBk47V-btfad5xHI'
    },
    {
      id: '2',
      name: 'Avocado Toast',
      description: 'Sourdough, smashed avo, chili flakes',
      price: 12.00,
      category: 'Sandwiches',
      status: 'IN STOCK',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYsQ5vj8oBM_r5cgau4dJt4uXFBw-697bmYfvbynNq4zDQDOrN4vr7RD90E6sJs6MS09K-ONzqQSQuv6ZGycPU1ePsn5Xsz6OGQxeQhXVuwkA_OTow6NAFyxIXRv_Ta6f5KywwZt4jSbDB45V7HpfoXyVgfidUTT56vO6O3sjy2rwNWJ-w6NtD2BF7LShwIBMPCHCWyMBJFLpIBKgJn46FuuJTJOKWC1wH5g_ARl13WuJYlfG4JLw1uceYPTJQkOl3mlgJpsnJEmk'
    },
    {
      id: '3',
      name: 'Choco Muffin',
      description: 'Double dark chocolate chunks',
      price: 3.75,
      category: 'Bakery',
      status: 'LOW STOCK',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhRKcVMLuYkJCGVzAXdjXOd56Ks1iZJB4iCrYyC1G70Jsv6QPle8ej5OLfeYkYtUV_AZRy8495_MHgL_4dA2D20SZretvz5ZBduw_IFxn04hYvFCnTF-ih9iwqFkpPAsL4estzk5eos7nMAQ89X9NOZHpESyHvSRFBQjfWHkq-EWkYHtR4XuZvA7F89_42JVAr00LsaycbPnq_LX4Gaxsw4efYv7QG-T8390N4dHjeF3iqvf23NseOYi3spBwAtwVd5EhO4vtAxgQ'
    },
    {
      id: '4',
      name: 'Iced Matcha',
      description: 'Ceremonial grade matcha, oat milk',
      price: 6.00,
      category: 'Iced Series',
      status: 'IN STOCK',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVqQyw6h6iYgC0RIQD17Dnrixa9_i6C6A9cpBBxS2efmcpmO4yj83bW7_J6h-2MFFBBzaT_44_bWzLZZEVYEz0O3kTuq00_Z_6jkKPm5V21sfPD8yKkzyS5TC7O9EgvXTwP4FEuQCA5R2ow96SuBCpHyMhruTHUP_vy6_ywT4azNRaBkb5vmS5FmNVHlBO8QFyp0rqbWJeMIZOHfi7jXYQmlRKJttRRO6LUnjhzrOLDxAYSdUFZKNSWbY27T3DcsgWwddmyufT18c'
    },
    {
      id: '5',
      name: 'Butter Croissant',
      description: 'Classic french pastry',
      price: 3.50,
      category: 'Bakery',
      status: 'SOLD OUT',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvaqULo09-8gE-k02i1iAOY1BgBBhW3VwXS7S_WIX0UEhr3YcaygAGTfQig_XOPHqi45HLqeYS0mOsplqQ1_cJAyuMeHzZKMyU7glFsHmjGhQmFI-LAgLkhB4FnwODyxkEKNB7kbNQsVkfEqBxc9I_h2wlCoUox8rfbKBQIj1GQVNbUnk6mkpHDBxkChimOQ_UylbIkFmxLGIulYGtLke2PWx-36R8V7SvBdrui1qydOJp7wKo3w5BXxD07Htfp_Q2fogkJXU-LEU'
    },
    {
      id: '6',
      name: 'Nitro Cold Brew',
      description: 'Velvety smooth, nitrogen infused',
      price: 5.50,
      category: 'Iced Series',
      status: 'IN STOCK',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqG3NHWZFCShyi7m1HNVcW0B9HzBkzzc9smap7FH5Mg4PPTNbVdExMXAcxmUBGsnwXdv8OfFBZto9yNS6OEGcDNoW2Mh-Rr5MQwfpI-LG2irEozyMLZMPucLnuX4-xjw73kX_C9Rccy3TrZ3-cFsyHFIxzc5sHzm0kOcb7-03lNuik64muQuPmiShHxRauR54pj1ytBwGXjTuwnkG9TMCexAP5cw-NA6BGNWnGCLaLBdYN78-HTtdDk0FSVfrXTjZz92xy4iR_s9E'
    }
  ]

  const categories = [
    { id: 'all', name: 'All Items', icon: 'grid_view', color: 'text-primary-light' },
    { id: 'hot-coffee', name: 'Hot Coffee', icon: 'local_cafe', color: '' },
    { id: 'iced-series', name: 'Iced Series', icon: 'ac_unit', color: 'text-sky-400' },
    { id: 'bakery', name: 'Bakery', icon: 'bakery_dining', color: 'text-amber-400' },
    { id: 'sandwiches', name: 'Sandwiches', icon: 'lunch_dining', color: 'text-orange-400' },
    { id: 'merch', name: 'Merch', icon: 'checkroom', color: 'text-indigo-400' }
  ]

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'IN STOCK':
        return 'bg-black/60 backdrop-blur text-[10px] font-bold text-emerald-400 border border-emerald-500/30'
      case 'LOW STOCK':
        return 'bg-black/60 backdrop-blur text-[10px] font-bold text-amber-400 border border-amber-500/30'
      case 'SOLD OUT':
        return 'bg-black/60 backdrop-blur text-[10px] font-bold text-red-400 border border-red-500/30'
      default:
        return ''
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category.toLowerCase().replace(' ', '-') === selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         product.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0)
  const tax = subtotal * 0.08
  const total = subtotal + tax

  return (
    <div className="bg-background-dark text-slate-200 font-display h-screen flex flex-col overflow-hidden selection:bg-primary selection:text-white">
      {/* Custom Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #0f172a; 
        }
        ::-webkit-scrollbar-thumb {
          background: #334155; 
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #475569; 
        }
        .ai-glow {
          background: linear-gradient(135deg, rgba(30, 59, 138, 0.4) 0%, rgba(99, 102, 241, 0.2) 100%);
          box-shadow: 0 0 15px rgba(99, 102, 241, 0.3) inset;
          border: 1px solid rgba(99, 102, 241, 0.4);
        }
        `
      }} />

      {/* Top Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-slate-700 bg-surface-dark px-6 py-3 shrink-0 z-20 shadow-lg">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 text-white">
            <div className="size-8 text-primary-light">
              <MaterialSymbol icon="point_of_sale" className="text-3xl" />
            </div>
            <div>
              <h2 className="text-white text-lg font-bold leading-tight tracking-tight">AlgoHub POS v4.0</h2>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Online</span>
                <span className="text-slate-600">|</span>
                <span>Register #04</span>
              </div>
            </div>
          </div>
          
          {/* Search Bar */}
          <label className="hidden md:flex flex-col w-80 h-10 group relative">
            <div className="flex w-full flex-1 items-stretch rounded-xl h-full bg-surface-lighter ring-1 ring-transparent focus-within:ring-primary-light transition-all">
              <div className="text-slate-400 flex items-center justify-center pl-3">
                <MaterialSymbol icon="search" className="text-[20px]" />
              </div>
              <input 
                className="flex w-full min-w-0 flex-1 bg-transparent border-none text-white focus:outline-0 placeholder:text-slate-400 px-3 text-sm" 
                placeholder="Search menu, orders, or customers..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="text-slate-400 hover:text-white flex items-center justify-center pr-3">
                <MaterialSymbol icon="mic" className="text-[20px]" />
              </button>
            </div>
          </label>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 mr-4">
            <a className="text-white font-medium text-sm hover:text-primary-light transition-colors border-b-2 border-primary-light pb-0.5" href="#">Register</a>
            <a className="text-slate-400 font-medium text-sm hover:text-white transition-colors" href="#">Orders</a>
            <a className="text-slate-400 font-medium text-sm hover:text-white transition-colors" href="#">Customers</a>
            <a className="text-slate-400 font-medium text-sm hover:text-white transition-colors" href="#">Reports</a>
          </nav>
          
          <div className="flex gap-2">
            <button className="flex items-center justify-center rounded-xl size-10 bg-surface-lighter text-slate-200 hover:bg-slate-600 hover:text-white transition-colors relative">
              <MaterialSymbol icon="wifi" className="text-[20px]" />
            </button>
            <button className="flex items-center justify-center rounded-xl size-10 bg-surface-lighter text-slate-200 hover:bg-slate-600 hover:text-white transition-colors relative">
              <MaterialSymbol icon="notifications" className="text-[20px]" />
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-surface-dark"></span>
            </button>
            <button className="flex items-center justify-center rounded-xl h-10 bg-surface-lighter text-slate-200 hover:bg-slate-600 hover:text-white transition-colors px-3 gap-2">
              <MaterialSymbol icon="account_circle" className="text-[20px]" />
              <span className="text-sm font-semibold hidden xl:block">Alex M.</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left: Categories & Product Grid */}
        <div className="flex flex-col flex-1 min-w-0 bg-background-dark relative">
          {/* Categories Strip */}
          <div className="flex gap-3 px-6 py-4 overflow-x-auto border-b border-slate-700 bg-background-dark/95 backdrop-blur z-10 sticky top-0 shrink-0">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-xl pl-3 pr-4 transition-all ring-1 ring-white/5 ${
                  selectedCategory === category.id
                    ? 'bg-primary text-white shadow-lg shadow-primary/20 ring-1 ring-white/10'
                    : 'bg-surface-dark text-slate-300 hover:bg-surface-lighter hover:text-white'
                }`}
              >
                <MaterialSymbol icon={category.icon} className={`text-[20px] ${category.color}`} />
                <span className={`text-sm ${selectedCategory === category.id ? 'font-semibold' : 'font-medium'}`}>
                  {category.name}
                </span>
              </button>
            ))}
          </div>

          {/* Product Grid Scroller */}
          <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group relative flex flex-col rounded-2xl bg-surface-dark border border-slate-700 overflow-hidden cursor-pointer hover:border-primary-light hover:shadow-xl hover:shadow-primary/10 transition-all duration-200"
                >
                  <div className="h-40 w-full overflow-hidden relative">
                    <div className="absolute top-2 left-2 z-10 flex gap-1">
                      <span className={`px-2 py-1 rounded-md ${getStatusBadgeClass(product.status)}`}>
                        {product.status}
                      </span>
                    </div>
                    <div 
                      className={`w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500 ${
                        product.status === 'SOLD OUT' ? 'grayscale' : ''
                      }`}
                      style={{ backgroundImage: `url(${product.image})` }}
                    />
                  </div>
                  <div className={`p-4 flex flex-col flex-1 justify-between ${
                    product.status === 'SOLD OUT' ? 'opacity-60' : ''
                  }`}>
                    <div>
                      <h3 className="text-white font-bold text-base leading-tight mb-1">{product.name}</h3>
                      <p className="text-slate-400 text-xs">{product.description}</p>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-lg font-bold text-white">${product.price.toFixed(2)}</span>
                      <button 
                        className={`size-8 rounded-full flex items-center justify-center transition-colors ${
                          product.status === 'SOLD OUT' 
                            ? 'bg-surface-lighter text-white cursor-not-allowed' 
                            : 'bg-surface-lighter text-white hover:bg-primary'
                        }`}
                        disabled={product.status === 'SOLD OUT'}
                      >
                        <MaterialSymbol icon={product.status === 'SOLD OUT' ? 'block' : 'add'} className="text-[18px]" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Cart Sidebar */}
        <div className="w-96 flex flex-col bg-surface-dark border-l border-slate-700 shrink-0 z-30 shadow-2xl relative">
          {/* Order Header */}
          <div className="px-5 py-4 border-b border-slate-700 flex justify-between items-center bg-surface-dark">
            <div>
              <h2 className="text-white text-lg font-bold">Current Order</h2>
              <p className="text-slate-400 text-xs font-medium">Order #9923 • Walk-in</p>
            </div>
            <button className="text-slate-400 hover:text-white transition-colors">
              <MaterialSymbol icon="more_vert" className="text-[24px]" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {cartItems.map((item) => (
              <div key={item.id} className="flex flex-col p-3 rounded-xl bg-background-dark/50 border border-white/5 relative group">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex gap-3">
                    <div 
                      className="size-10 rounded-lg bg-cover bg-center shrink-0" 
                      style={{ backgroundImage: `url(${item.product.image})` }}
                    />
                    <div>
                      <h4 className="text-white font-bold text-sm">{item.product.name}</h4>
                      <p className="text-slate-400 text-xs">{item.modifiers.join(', ')}</p>
                    </div>
                  </div>
                  <span className="text-white font-bold text-sm">${item.totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pl-[52px]">
                  <div className="flex items-center gap-3 bg-surface-lighter/50 rounded-lg p-1">
                    <button className="size-6 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-600 rounded-md transition-colors">
                      <MaterialSymbol icon="remove" className="text-[16px]" />
                    </button>
                    <span className="text-white font-semibold text-sm w-4 text-center">{item.quantity}</span>
                    <button className="size-6 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-600 rounded-md transition-colors">
                      <MaterialSymbol icon="add" className="text-[16px]" />
                    </button>
                  </div>
                  <button className="text-slate-500 hover:text-red-400 transition-colors">
                    <MaterialSymbol icon="delete" className="text-[18px]" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* AI Recommended Section */}
          <div className="px-5 pb-2">
            <div className="ai-glow rounded-xl p-4 relative overflow-hidden group cursor-pointer transition-transform hover:scale-[1.02]">
              <div className="absolute -right-6 -top-6 size-24 bg-purple-500/20 blur-2xl rounded-full"></div>
              <div className="flex items-center justify-between mb-2 relative z-10">
                <div className="flex items-center gap-1.5 text-indigo-200">
                  <MaterialSymbol icon="auto_awesome" className="text-[18px]" />
                  <span className="text-xs font-bold uppercase tracking-wider">AI Insight</span>
                </div>
              </div>
              <div className="flex gap-3 items-center relative z-10">
                <div className="flex-1">
                  <p className="text-white text-sm font-semibold leading-tight mb-0.5">Add Butter Croissant?</p>
                  <p className="text-indigo-200 text-xs">Customer frequently pairs with Latte.</p>
                </div>
                <button className="bg-white text-primary font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-1">
                  <MaterialSymbol icon="add" className="text-[14px]" />
                  $3.50
                </button>
              </div>
            </div>
          </div>

          {/* Payment Footer */}
          <div className="bg-surface-dark border-t border-slate-700 p-5 shrink-0 space-y-3">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-white font-bold text-xl pt-2 border-t border-dashed border-slate-600 mt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 pt-2">
              <button className="col-span-1 rounded-xl bg-surface-lighter text-slate-300 h-12 flex flex-col items-center justify-center hover:bg-slate-600 transition-colors">
                <MaterialSymbol icon="print" className="text-[20px]" />
              </button>
              <button className="col-span-3 rounded-xl bg-primary hover:bg-blue-700 text-white h-12 flex items-center justify-center font-bold text-base gap-2 shadow-lg shadow-blue-900/50 transition-all active:scale-[0.98]">
                Charge ${total.toFixed(2)}
                <MaterialSymbol icon="arrow_forward" className="text-[20px]" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default DarkModePOSTerminal
