import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Filter,
  Package,
  AlertTriangle,
  Eye,
  BarChart3,
  DollarSign,
  FileDown,
  FileUp,
  RefreshCw,
  Save,
  X
} from 'lucide-react'
import { productApi, Product } from '@/services/productService'

interface AIInsight {
  title: string
  description: string
  type: 'warning' | 'success' | 'info'
  icon: React.ElementType
}

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<string[]>([])

  // Load products from API
  const loadProducts = async () => {
    try {
      setIsLoading(true)
      const response = await productApi.getProducts()
      
      // Handle case where API returns undefined or empty response
      if (!response || !response.products) {
        console.warn('API returned invalid response, using fallback data')
        // Fallback data for testing
        const fallbackProducts = [
          {
            _id: '1',
            name: 'Espresso Beans',
            sku: 'COF001',
            price: 12.99,
            stock: 45,
            minStock: 20,
            category: 'Coffee',
            description: 'Premium arabica espresso beans',
            status: 'active' as const,
            lastUpdated: '2024-02-15',
            inStock: true
          },
          {
            _id: '2',
            name: 'Cappuccino Cups',
            sku: 'CUP001',
            price: 0.45,
            stock: 8,
            minStock: 50,
            category: 'Supplies',
            description: '12oz disposable cappuccino cups',
            status: 'low-stock' as const,
            lastUpdated: '2024-02-14',
            inStock: true
          },
          {
            _id: '3',
            name: 'Milk',
            sku: 'DAI001',
            price: 4.99,
            stock: 120,
            minStock: 30,
            category: 'Dairy',
            description: 'Fresh whole milk',
            status: 'active' as const,
            lastUpdated: '2024-02-15',
            inStock: true
          }
        ]
        setProducts(fallbackProducts)
        setFilteredProducts(fallbackProducts)
        
        // Extract unique categories from fallback data
        const uniqueCategories = [...new Set(fallbackProducts.map(p => p.category))]
        setCategories(['all', ...uniqueCategories])
        return
      }
      
      setProducts(response.products)
      setFilteredProducts(response.products)
      
      // Extract unique categories
      const uniqueCategories = [...new Set(response.products.map(p => p.category))]
      setCategories(['all', ...uniqueCategories])
    } catch (error) {
      console.error('Failed to load products:', error)
      // Set empty arrays on error to prevent undefined errors
      setProducts([])
      setFilteredProducts([])
      setCategories(['all'])
    } finally {
      setIsLoading(false)
    }
  }

  // Load analytics data
  const loadAnalytics = async () => {
    try {
      await productApi.getProductAnalytics()
    } catch (error) {
      console.error('Failed to load analytics:', error)
      // Analytics are optional for this page.
    }
  }

  // Initial load
  useEffect(() => {
    loadProducts()
    loadAnalytics()
  }, [])

  // Filter products when search or category changes
  useEffect(() => {
    const filtered = products.filter(product => {
      const matchesSearch = !searchTerm || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    setFilteredProducts(filtered)
  }, [searchTerm, selectedCategory, products])

  // Handle product creation
  const handleCreateProduct = async (productData: any) => {
    try {
      setIsSubmitting(true)
      await productApi.create(productData)
      setShowAddModal(false)
      await loadProducts() // Reload products
    } catch (error) {
      console.error('Failed to create product:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle product update
  const handleUpdateProduct = async (productData: any) => {
    if (!selectedProduct) return
    
    try {
      setIsSubmitting(true)
      await productApi.update(selectedProduct._id, productData)
      setShowEditModal(false)
      setSelectedProduct(null)
      await loadProducts() // Reload products
    } catch (error) {
      console.error('Failed to update product:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle product deletion
  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    
    try {
      await productApi.delete(productId)
      await loadProducts() // Reload products
    } catch (error) {
      console.error('Failed to delete product:', error)
    }
  }

  // Handle export
  const handleExport = async () => {
    const rows = [
      ['Name', 'SKU', 'Category', 'Price', 'Stock', 'Min Stock', 'Status', 'Description'],
      ...filteredProducts.map(product => [
        product.name,
        product.sku,
        product.category,
        product.price.toFixed(2),
        product.stock,
        product.minStock,
        product.status,
        product.description
      ])
    ]
    const csv = rows.map(row => row.map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `products_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Handle import
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    try {
      const text = await file.text()
      const [, ...lines] = text.split(/\r?\n/).filter(Boolean)
      const importedProducts = lines.map((line, index) => {
        const [name, sku, category, price, stock, minStock, status, description] = line
          .split(',')
          .map(value => value.replace(/^"|"$/g, '').replace(/""/g, '"'))
        return {
          _id: `import-${Date.now()}-${index}`,
          name,
          sku,
          category,
          price: Number(price) || 0,
          stock: Number(stock) || 0,
          minStock: Number(minStock) || 0,
          status: (status || 'active') as Product['status'],
          description: description || '',
          lastUpdated: new Date().toISOString(),
          inStock: Number(stock) > 0
        }
      }).filter(product => product.name && product.sku)
      setProducts(prev => [...importedProducts, ...prev])
      setFilteredProducts(prev => [...importedProducts, ...prev])
      setCategories(prev => [...new Set([...prev, ...importedProducts.map(product => product.category)])])
    } catch (error) {
      console.error('Failed to import products:', error)
    } finally {
      event.target.value = ''
    }
  }

  // Generate AI insights based on data
  const generateAIInsights = (): AIInsight[] => {
    const insights: AIInsight[] = []
    
    // Handle case where products array is empty or undefined
    if (!products || products.length === 0) {
      return insights
    }
    
    // Low stock alert
    const lowStockProducts = products.filter(p => p.stock <= p.minStock)
    if (lowStockProducts.length > 0) {
      insights.push({
        title: 'Low Stock Alert',
        description: `${lowStockProducts.length} products need reordering soon`,
        type: 'warning',
        icon: AlertTriangle
      })
    }
    
    // High value products
    const highValueProducts = products.filter(p => p.price > 100)
    if (highValueProducts.length > 0) {
      insights.push({
        title: 'High Value Items',
        description: `${highValueProducts.length} products priced above $100`,
        type: 'info',
        icon: DollarSign
      })
    }
    
    return insights
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'badge-success'
      case 'inactive': return 'badge-gray'
      case 'low-stock': return 'badge-warning'
      default: return 'badge-gray'
    }
  }

  const aiInsights = generateAIInsights()

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
          <label className="btn-secondary hover:scale-105 transition-transform duration-200 cursor-pointer">
            <FileUp className="w-4 h-4 mr-2" />
            Import
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleImport}
              className="hidden"
            />
          </label>
          <button 
            onClick={handleExport}
            className="btn-secondary hover:scale-105 transition-transform duration-200"
          >
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
        <button 
          onClick={loadProducts}
          className="btn-secondary"
          title="Refresh products"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
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
                      key={product._id}
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
                            onClick={() => {
                              setSelectedProduct(product)
                              setShowDetailsModal(true)
                            }}
                            className="btn-ghost btn-sm hover:scale-110 transition-transform duration-200"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedProduct(product)
                              setShowEditModal(true)
                            }}
                            className="btn-ghost btn-sm hover:scale-110 transition-transform duration-200"
                            title="Edit product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product._id)}
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

      {/* Add Product Modal */}
      {showDetailsModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Product Details</h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false)
                  setSelectedProduct(null)
                }}
                className="btn-ghost"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span>Name</span><strong>{selectedProduct.name}</strong></div>
              <div className="flex justify-between"><span>SKU</span><strong>{selectedProduct.sku}</strong></div>
              <div className="flex justify-between"><span>Category</span><strong>{selectedProduct.category}</strong></div>
              <div className="flex justify-between"><span>Price</span><strong>${selectedProduct.price.toFixed(2)}</strong></div>
              <div className="flex justify-between"><span>Stock</span><strong>{selectedProduct.stock}</strong></div>
              <div className="flex justify-between"><span>Status</span><strong>{selectedProduct.status}</strong></div>
              <p className="text-gray-600">{selectedProduct.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Add New Product</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="btn-ghost"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const productData = {
                name: formData.get('name'),
                sku: formData.get('sku'),
                price: parseFloat(formData.get('price') as string),
                stock: parseInt(formData.get('stock') as string),
                minStock: parseInt(formData.get('minStock') as string),
                category: formData.get('category'),
                description: formData.get('description'),
                status: formData.get('status')
              }
              handleCreateProduct(productData)
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Product Name</label>
                  <input name="name" type="text" required className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">SKU</label>
                  <input name="sku" type="text" required className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Price</label>
                  <input name="price" type="number" step="0.01" required className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Stock</label>
                  <input name="stock" type="number" required className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Min Stock</label>
                  <input name="minStock" type="number" required className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select name="category" required className="input">
                    <option value="">Select category</option>
                    {categories.filter(c => c !== 'all').map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea name="description" rows={3} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select name="status" required className="input">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="low-stock">Low Stock</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="spinner w-4 h-4 mr-2"></div>
                      Creating...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Save className="w-4 h-4 mr-2" />
                      Create Product
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Edit Product</h2>
              <button 
                onClick={() => {
                  setShowEditModal(false)
                  setSelectedProduct(null)
                }}
                className="btn-ghost"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const productData = {
                name: formData.get('name'),
                sku: formData.get('sku'),
                price: parseFloat(formData.get('price') as string),
                stock: parseInt(formData.get('stock') as string),
                minStock: parseInt(formData.get('minStock') as string),
                category: formData.get('category'),
                description: formData.get('description'),
                status: formData.get('status')
              }
              handleUpdateProduct(productData)
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Product Name</label>
                  <input name="name" type="text" defaultValue={selectedProduct.name} required className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">SKU</label>
                  <input name="sku" type="text" defaultValue={selectedProduct.sku} required className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Price</label>
                  <input name="price" type="number" step="0.01" defaultValue={selectedProduct.price} required className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Stock</label>
                  <input name="stock" type="number" defaultValue={selectedProduct.stock} required className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Min Stock</label>
                  <input name="minStock" type="number" defaultValue={selectedProduct.minStock} required className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select name="category" defaultValue={selectedProduct.category} required className="input">
                    {categories.filter(c => c !== 'all').map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea name="description" rows={3} defaultValue={selectedProduct.description} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select name="status" defaultValue={selectedProduct.status} required className="input">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="low-stock">Low Stock</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedProduct(null)
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="spinner w-4 h-4 mr-2"></div>
                      Updating...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Save className="w-4 h-4 mr-2" />
                      Update Product
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductsPage
