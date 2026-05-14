import React, { useState, useEffect } from 'react'
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  BarChart3,
  Clock,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

interface InventoryItem {
  id: string
  name: string
  sku: string
  category: string
  currentStock: number
  minStock: number
  maxStock: number
  unitPrice: number
  unitCost: number
  supplier: string
  lastRestocked: string
  status: 'in-stock' | 'low-stock' | 'out-of-stock'
  trend: 'up' | 'down' | 'stable'
  trendValue: number
}

interface InventoryStats {
  totalItems: number
  lowStockItems: number
  outOfStockItems: number
  totalValue: number
  stockTurnover: number
}

export const InventoryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [stats, setStats] = useState<InventoryStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  useEffect(() => {
    // Simulate API call to fetch inventory data
    const fetchInventory = async () => {
      setIsLoading(true)
      
      const mockInventory: InventoryItem[] = [
        {
          id: '1',
          name: 'Espresso Beans',
          sku: 'COF-001',
          category: 'Coffee',
          currentStock: 45,
          minStock: 20,
          maxStock: 100,
          unitPrice: 12.50,
          unitCost: 8.75,
          supplier: 'Global Coffee Co.',
          lastRestocked: '2026-02-14',
          status: 'in-stock',
          trend: 'up',
          trendValue: 12.5
        },
        {
          id: '2',
          name: 'Cappuccino Cups',
          sku: 'CUP-001',
          category: 'Supplies',
          currentStock: 15,
          minStock: 50,
          maxStock: 200,
          unitPrice: 0.25,
          unitCost: 0.15,
          supplier: 'Packaging Solutions',
          lastRestocked: '2026-02-10',
          status: 'low-stock',
          trend: 'down',
          trendValue: -8.3
        },
        {
          id: '3',
          name: 'Croissant',
          sku: 'BAK-001',
          category: 'Bakery',
          currentStock: 0,
          minStock: 10,
          maxStock: 50,
          unitPrice: 2.25,
          unitCost: 1.50,
          supplier: 'Local Bakery',
          lastRestocked: '2026-02-12',
          status: 'out-of-stock',
          trend: 'stable',
          trendValue: 0
        },
        {
          id: '4',
          name: 'Milk',
          sku: 'DAI-001',
          category: 'Dairy',
          currentStock: 28,
          minStock: 15,
          maxStock: 40,
          unitPrice: 0.50,
          unitCost: 0.35,
          supplier: 'Fresh Dairy Inc.',
          lastRestocked: '2026-02-15',
          status: 'in-stock',
          trend: 'up',
          trendValue: 5.2
        }
      ]

      const mockStats: InventoryStats = {
        totalItems: mockInventory.length,
        lowStockItems: mockInventory.filter(item => item.status === 'low-stock').length,
        outOfStockItems: mockInventory.filter(item => item.status === 'out-of-stock').length,
        totalValue: mockInventory.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0),
        stockTurnover: 4.2
      }

      // Simulate API delay
      setTimeout(() => {
        setInventory(mockInventory)
        setStats(mockStats)
        setIsLoading(false)
      }, 1000)
    }

    fetchInventory()
  }, [])

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  const categories = ['all', ...Array.from(new Set(inventory.map(item => item.category)))]
  const statuses = ['all', 'in-stock', 'low-stock', 'out-of-stock']

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock': return 'bg-green-900/50 text-green-400 border-green-400/30'
      case 'low-stock': return 'bg-yellow-900/50 text-yellow-400 border-yellow-400/30'
      case 'out-of-stock': return 'bg-red-900/50 text-red-400 border-red-400/30'
      default: return 'bg-gray-700 text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'low-stock': return <AlertTriangle className="w-4 h-4" />
      case 'out-of-stock': return <AlertTriangle className="w-4 h-4" />
      default: return <Package className="w-4 h-4" />
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const handleSelectAll = () => {
    if (selectedItems.length === filteredInventory.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredInventory.map(item => item.id))
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-400 rounded-full animate-spin border-t-transparent"></div>
          <p className="text-green-400 mt-4">Loading Inventory...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-400 mb-2">Inventory Management</h1>
        <p className="text-gray-400">Track stock levels, manage suppliers, and optimize inventory</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <Package className="w-8 h-8 text-blue-400" />
              <span className="text-blue-400 text-sm">Total Items</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalItems}</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-yellow-400/30">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
              <span className="text-yellow-400 text-sm">Low Stock</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.lowStockItems}</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-red-400/30">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="w-8 h-8 text-red-400" />
              <span className="text-red-400 text-sm">Out of Stock</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.outOfStockItems}</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-green-400/30">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-green-400" />
              <span className="text-green-400 text-sm">Total Value</span>
            </div>
            <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalValue)}</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-purple-400/30">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="w-8 h-8 text-purple-400" />
              <span className="text-purple-400 text-sm">Turnover</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.stockTurnover}x</p>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-green-400 placeholder-green-400/40"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-green-400"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-green-400"
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Status' : status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>

          {/* Actions */}
          <div className="flex space-x-2">
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        {/* Table Header */}
        <div className="border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <input
                type="checkbox"
                checked={selectedItems.length === filteredInventory.length}
                onChange={handleSelectAll}
                className="w-4 h-4 text-green-400 bg-gray-700 border-gray-600 rounded"
              />
              <span className="text-gray-400">
                {selectedItems.length > 0 && `${selectedItems.length} selected`}
              </span>
            </div>
            <div className="flex space-x-2">
              {selectedItems.length > 0 && (
                <>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors duration-200">
                    Edit Selected
                  </button>
                  <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition-colors duration-200">
                    Delete Selected
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === filteredInventory.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-green-400 bg-gray-700 border-gray-600 rounded"
                  />
                </th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Product</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">SKU</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Category</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Stock</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Min/Max</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Unit Price</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Value</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => (
                <tr key={item.id} className="border-b border-gray-700/50 hover:bg-gray-700/50 transition-colors duration-200">
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                      className="w-4 h-4 text-green-400 bg-gray-700 border-gray-600 rounded"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-green-400 font-medium">{item.name}</p>
                      <p className="text-gray-400 text-sm">{item.supplier}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-300">{item.sku}</td>
                  <td className="py-3 px-4 text-gray-300">{item.category}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <span className="text-white font-medium">{item.currentStock}</span>
                      {item.trend !== 'stable' && (
                        <div className={`flex items-center ${item.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                          {item.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                          <span className="text-sm">{Math.abs(item.trendValue)}%</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right text-gray-300">
                    {item.minStock} / {item.maxStock}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-300">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-300">
                    {formatCurrency(item.currentStock * item.unitCost)}
                  </td>
                  <td className="py-3 px-4">
                    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm border ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)}
                      <span>{item.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center space-x-2">
                      <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200">
                        <Eye className="w-4 h-4 text-gray-400" />
                      </button>
                      <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200">
                        <Edit className="w-4 h-4 text-gray-400" />
                      </button>
                      <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200">
                        <Trash2 className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
