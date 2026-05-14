import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Filter,
  Brain,
  TrendingUp,
  TrendingDown,
  Package,
  AlertTriangle,
  Eye,
  BarChart3,
  DollarSign,
  FileDown,
  FileUp
} from 'lucide-react'

interface Product {
  id: string
  name: string
  sku: string
  price: number
  stock: number
  minStock: number
  category: string
  description: string
  image?: string
  status: 'active' | 'inactive' | 'low-stock'
  lastUpdated: string
}

interface AIInsight {
  title: string
  description: string
  type: 'warning' | 'success' | 'info'
  icon: React.ElementType
}

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // Mock data
  useEffect(() => {
    setTimeout(() => {
      setProducts([
        {
          id: '1',
          name: 'Espresso Beans',
          sku: 'COF001',
          category: 'Coffee',
          price: 12.99,
          stock: 45,
          minStock: 20,
          description: 'Premium arabica espresso beans',
          status: 'active',
          lastUpdated: '2024-02-15'
        },
        {
          id: '2',
          name: 'Cappuccino Cups',
          sku: 'CUP001',
          category: 'Supplies',
          price: 0.45,
          stock: 8,
          minStock: 50,
          description: '12oz disposable cappuccino cups',
          status: 'low-stock',
          lastUpdated: '2024-02-14'
        },
        {
          id: '3',
          name: 'Milk',
          sku: 'DAI001',
          category: 'Dairy',
          price: 4.99,
          stock: 120,
          minStock: 30,
          description: 'Fresh whole milk',
          status: 'active',
          lastUpdated: '2024-02-15'
        },
        {
          id: '4',
          name: 'Croissant',
          sku: 'BKR001',
          category: 'Bakery',
          price: 2.25,
          stock: 25,
          minStock: 15,
          description: 'Buttery croissant',
          status: 'active',
          lastUpdated: '2024-02-15'
        },
        {
          id: '5',
          name: 'Coffee Machine',
          sku: 'EQP001',
          category: 'Equipment',
          price: 899.99,
          stock: 3,
          minStock: 2,
          description: 'Commercial espresso machine',
          status: 'active',
          lastUpdated: '2024-02-10'
        }
      ])
      setIsLoading(false)
    }, 1000)
  }, [])

  const categories = ['all', 'Coffee', 'Dairy', 'Supplies', 'Bakery', 'Equipment']
  
  const aiInsights: AIInsight[] = [
    {
      title: 'Low Stock Alert',
      description: 'Cappuccino Cups need reordering soon',
      type: 'warning',
      icon: AlertTriangle
    },
    {
      title: 'Best Seller',
      description: 'Espresso Beans trending up 25%',
      type: 'success',
      icon: TrendingUp
    },
    {
      title: 'Optimize Pricing',
      description: 'Consider bundle deals for supplies',
      type: 'info',
      icon: Brain
    }
  ]

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'badge-success'
      case 'inactive': return 'badge-gray'
      case 'low-stock': return 'badge-warning'
      default: return 'badge-gray'
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Products
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your inventory and product catalog
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn-secondary hover:scale-105 transition-transform duration-200">
            <FileUp className="w-4 h-4 mr-2" />
            Import
          </button>
          <button className="btn-secondary hover:scale-105 transition-transform duration-200">
            <FileDown className="w-4 h-4 mr-2" />
            Export
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary hover:scale-105 transition-transform duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </button>
        </div>
      </div>

      {/* AI Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        {aiInsights.map((insight, index) => (
          <div 
            key={index}
            className={`p-4 rounded-xl border animate-slide-up hover-lift ${
              insight.type === 'warning' ? 'bg-warning-50 border-warning-200 dark:bg-warning-900/20 dark:border-warning-800' :
              insight.type === 'success' ? 'bg-success-50 border-success-200 dark:bg-success-900/20 dark:border-success-800' :
              'bg-primary-50 border-primary-200 dark:bg-primary-900/20 dark:border-primary-800'
            }`}
            style={{ animationDelay: `${0.3 + index * 0.1}s` }}
          >
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${
                insight.type === 'warning' ? 'bg-warning-100 dark:bg-warning-800' :
                insight.type === 'success' ? 'bg-success-100 dark:bg-success-800' :
                'bg-primary-100 dark:bg-primary-800'
              }`}>
                <insight.icon className={`w-5 h-5 ${
                  insight.type === 'warning' ? 'text-warning-600 dark:text-warning-400' :
                  insight.type === 'success' ? 'text-success-600 dark:text-success-400' :
                  'text-primary-600 dark:text-primary-400'
                }`} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {insight.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {insight.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input pl-10 appearance-none cursor-pointer"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="card animate-slide-up" style={{ animationDelay: '0.5s' }}>
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Product Inventory
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Package className="w-4 h-4" />
              <span>{filteredProducts.length} products</span>
            </div>
          </div>
        </div>
        <div className="card-body p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="spinner w-8 h-8"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="tablead">
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product, index) => (
                    <tr 
                      key={product.id}
                      className="hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors duration-200"
                      style={{ animationDelay: `${0.6 + index * 0.05}s` }}
                    >
                      <td>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {product.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {product.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="font-mono text-sm">{product.sku}</td>
                      <td>
                        <span className="badge badge-gray">
                          {product.category}
                        </span>
                      </td>
                      <td className="font-semibold">${product.price.toFixed(2)}</td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <span className={`font-medium ${
                            product.stock <= product.minStock ? 'text-warning-600' : 'text-gray-900 dark:text-gray-100'
                          }`}>
                            {product.stock}
                          </span>
                          {product.stock <= product.minStock && (
                            <AlertTriangle className="w-4 h-4 text-warning-500" />
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${getStatusColor(product.status)}`}>
                          {product.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => setSelectedProduct(product)}
                            className="btn-ghost btn-sm hover:scale-110 transition-transform duration-200"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            className="btn-ghost btn-sm hover:scale-110 transition-transform duration-200"
                            title="Edit product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            className="btn-ghost btn-sm hover:scale-110 transition-transform duration-200 text-error-600 hover:text-error-700"
                            title="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: '0.7s' }}>
        <div className="card p-4 hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Products</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{products.length}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl">
              <Package className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>
        
        <div className="card p-4 hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Low Stock Items</p>
              <p className="text-2xl font-bold text-warning-600">
                {products.filter(p => p.stock <= p.minStock).length}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-warning-100 to-warning-200 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-warning-600" />
            </div>
          </div>
        </div>

        <div className="card p-4 hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Value</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                ${products.reduce((sum, p) => sum + (p.price * p.stock), 0).toFixed(0)}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-success-100 to-success-200 rounded-xl">
              <DollarSign className="w-6 h-6 text-success-600" />
            </div>
          </div>
        </div>

        <div className="card p-4 hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Categories</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {[...new Set(products.map(p => p.category))].length}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-xl">
              <BarChart3 className="w-6 h-6 text-secondary-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductsPage
