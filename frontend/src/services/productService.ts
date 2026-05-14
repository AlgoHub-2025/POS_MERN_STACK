import { createApiService, api } from './api'
import toast from 'react-hot-toast'

// Product interface matching backend schema
export interface Product {
  _id: string
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
  inStock?: boolean
  emoji?: string
}

export interface CreateProductRequest {
  name: string
  sku: string
  price: number
  stock: number
  minStock: number
  category: string
  description: string
  image?: string
  status: 'active' | 'inactive' | 'low-stock'
}

export interface UpdateProductRequest {
  name?: string
  sku?: string
  price?: number
  stock?: number
  minStock?: number
  category?: string
  description?: string
  image?: string
  status?: 'active' | 'inactive' | 'low-stock'
}

export interface ProductFilters {
  search?: string
  category?: string
  status?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ProductResponse {
  products: Product[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Create product service
const productService = createApiService<Product>('/products')

// Enhanced product service with additional methods
export const productApi = {
  // Basic CRUD operations
  ...productService,
  
  // Get products with filters
  getProducts: async (filters: ProductFilters = {}) => {
    try {
      const params = new URLSearchParams()
      
      if (filters.search) params.append('search', filters.search)
      if (filters.category) params.append('category', filters.category)
      if (filters.status) params.append('status', filters.status)
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())
      if (filters.sortBy) params.append('sortBy', filters.sortBy)
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)
      
      const response = await api.get<ProductResponse>(`/products?${params}`)
      return response.data
    } catch (error: any) {
      console.error('Error fetching products:', error)
      toast.error('Failed to fetch products')
      throw error
    }
  },
  
  // Get products by category
  getProductsByCategory: async (category: string) => {
    return productApi.getProducts({ category })
  },
  
  // Search products
  searchProducts: async (query: string) => {
    return productApi.getProducts({ search: query })
  },
  
  // Get low stock products
  getLowStockProducts: async () => {
    return productApi.getProducts({ status: 'low-stock' })
  },
  
  // Update product stock
  updateStock: async (id: string, stock: number) => {
    try {
      const response = await api.patch<Product>(`/products/${id}/stock`, { stock })
      toast.success('Stock updated successfully')
      return response.data
    } catch (error: any) {
      console.error('Error updating stock:', error)
      toast.error('Failed to update stock')
      throw error
    }
  },
  
  // Bulk update products
  bulkUpdate: async (updates: Array<{ id: string; data: Partial<Product> }>) => {
    try {
      const response = await api.patch<Product[]>('/products/bulk', { updates })
      toast.success(`${updates.length} products updated successfully`)
      return response.data
    } catch (error: any) {
      console.error('Error bulk updating products:', error)
      toast.error('Failed to update products')
      throw error
    }
  },
  
  // Import products from CSV/Excel
  importProducts: async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await api.post<{ message: string; imported: number }>('/products/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      toast.success(`${response.data.imported} products imported successfully`)
      return response.data
    } catch (error: any) {
      console.error('Error importing products:', error)
      toast.error('Failed to import products')
      throw error
    }
  },
  
  // Export products
  exportProducts: async (filters: ProductFilters = {}) => {
    try {
      const params = new URLSearchParams()
      
      if (filters.category) params.append('category', filters.category)
      if (filters.status) params.append('status', filters.status)
      
      const response = await api.get(`/products/export?${params}`, {
        responseType: 'blob',
      })
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.download = `products_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('Products exported successfully')
    } catch (error: any) {
      console.error('Error exporting products:', error)
      toast.error('Failed to export products')
      throw error
    }
  },
  
  // Get product analytics
  getProductAnalytics: async () => {
    try {
      const response = await api.get('/products/analytics')
      return response.data
    } catch (error: any) {
      console.error('Error fetching product analytics:', error)
      toast.error('Failed to fetch analytics')
      throw error
    }
  },
}

export default productApi
