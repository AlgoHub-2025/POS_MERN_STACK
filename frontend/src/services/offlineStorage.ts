import { openDB, DBSchema, IDBPDatabase } from 'idb'
import { Transaction, Product, CartItem } from '@/types'

interface POSDB extends DBSchema {
  transactions: {
    key: string
    value: Transaction
    indexes: {
      'by-timestamp': string
      'by-status': string
    }
  }
  products: {
    key: string
    value: Product
    indexes: {
      'by-category': string
      'by-name': string
    }
  }
  cart: {
    key: string
    value: CartItem
    indexes: {
      'by-product': string
    }
  }
  syncQueue: {
    key: string
    value: {
      id: string
      type: 'transaction' | 'product' | 'inventory'
      data: any
      timestamp: number
      retryCount: number
    }
    indexes: {
      'by-type': string
      'by-timestamp': number
    }
  }
  settings: {
    key: string
    value: {
      key: string
      value: any
      timestamp: number
    }
  }
}

class OfflineStorage {
  private db: IDBPDatabase<POSDB> | null = null
  private readonly dbName = 'AlgoHubPOS'
  private readonly version = 1

  async init(): Promise<void> {
    try {
      this.db = await openDB<POSDB>(this.dbName, this.version, {
        upgrade(db) {
          // Transactions store
          if (!db.objectStoreNames.contains('transactions')) {
            const transactionStore = db.createObjectStore('transactions', { keyPath: 'id' })
            transactionStore.createIndex('by-timestamp', 'timestamp')
            transactionStore.createIndex('by-status', 'status')
          }

          // Products store
          if (!db.objectStoreNames.contains('products')) {
            const productStore = db.createObjectStore('products', { keyPath: 'id' })
            productStore.createIndex('by-category', 'category')
            productStore.createIndex('by-name', 'name')
          }

          // Cart store
          if (!db.objectStoreNames.contains('cart')) {
            const cartStore = db.createObjectStore('cart', { keyPath: 'id' })
            cartStore.createIndex('by-product', 'product.id')
          }

          // Sync queue store
          if (!db.objectStoreNames.contains('syncQueue')) {
            const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' })
            syncStore.createIndex('by-type', 'type')
            syncStore.createIndex('by-timestamp', 'timestamp')
          }

          // Settings store
          if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings', { keyPath: 'key' })
          }
        }
      })

      console.log('Offline storage initialized successfully')
    } catch (error) {
      console.error('Failed to initialize offline storage:', error)
      throw error
    }
  }

  // Transaction methods
  async saveTransaction(transaction: Transaction): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')
    
    try {
      await this.db.add('transactions', transaction)
      await this.addToSyncQueue({
        id: `sync_${transaction.id}_${Date.now()}`,
        type: 'transaction',
        data: transaction,
        timestamp: Date.now(),
        retryCount: 0
      })
    } catch (error) {
      console.error('Failed to save transaction:', error)
      throw error
    }
  }

  async getTransactions(): Promise<Transaction[]> {
    if (!this.db) throw new Error('Database not initialized')
    
    try {
      return await this.db.getAll('transactions')
    } catch (error) {
      console.error('Failed to get transactions:', error)
      return []
    }
  }

  async getTransactionById(id: string): Promise<Transaction | undefined> {
    if (!this.db) throw new Error('Database not initialized')
    
    try {
      return await this.db.get('transactions', id)
    } catch (error) {
      console.error('Failed to get transaction:', error)
      return undefined
    }
  }

  // Product methods
  async saveProducts(products: Product[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')
    
    try {
      const tx = this.db.transaction('products', 'readwrite')
      await Promise.all(products.map(product => tx.store.put(product)))
      await tx.done
    } catch (error) {
      console.error('Failed to save products:', error)
      throw error
    }
  }

  async getProducts(): Promise<Product[]> {
    if (!this.db) throw new Error('Database not initialized')
    
    try {
      return await this.db.getAll('products')
    } catch (error) {
      console.error('Failed to get products:', error)
      return []
    }
  }

  async searchProducts(query: string): Promise<Product[]> {
    if (!this.db) throw new Error('Database not initialized')
    
    try {
      const allProducts = await this.db.getAll('products')
      const lowerQuery = query.toLowerCase()
      return allProducts.filter(product => 
        product.name.toLowerCase().includes(lowerQuery) ||
        product.category.toLowerCase().includes(lowerQuery) ||
        product.description?.toLowerCase().includes(lowerQuery)
      )
    } catch (error) {
      console.error('Failed to search products:', error)
      return []
    }
  }

  // Cart methods
  async saveCart(cart: CartItem[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')
    
    try {
      const tx = this.db.transaction('cart', 'readwrite')
      await tx.store.clear()
      await Promise.all(cart.map(item => tx.store.put(item)))
      await tx.done
    } catch (error) {
      console.error('Failed to save cart:', error)
      throw error
    }
  }

  async getCart(): Promise<CartItem[]> {
    if (!this.db) throw new Error('Database not initialized')
    
    try {
      return await this.db.getAll('cart')
    } catch (error) {
      console.error('Failed to get cart:', error)
      return []
    }
  }

  async clearCart(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')
    
    try {
      await this.db.clear('cart')
    } catch (error) {
      console.error('Failed to clear cart:', error)
      throw error
    }
  }

  // Sync queue methods
  async addToSyncQueue(item: {
    id: string
    type: 'transaction' | 'product' | 'inventory'
    data: any
    timestamp: number
    retryCount: number
  }): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')
    
    try {
      await this.db.add('syncQueue', item)
    } catch (error) {
      console.error('Failed to add to sync queue:', error)
      throw error
    }
  }

  async getSyncQueue(): Promise<Array<{
    id: string
    type: 'transaction' | 'product' | 'inventory'
    data: any
    timestamp: number
    retryCount: number
  }>> {
    if (!this.db) throw new Error('Database not initialized')
    
    try {
      return await this.db.getAll('syncQueue')
    } catch (error) {
      console.error('Failed to get sync queue:', error)
      return []
    }
  }

  async removeFromSyncQueue(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')
    
    try {
      await this.db.delete('syncQueue', id)
    } catch (error) {
      console.error('Failed to remove from sync queue:', error)
      throw error
    }
  }

  async updateRetryCount(id: string, retryCount: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')
    
    try {
      const item = await this.db.get('syncQueue', id)
      if (item) {
        item.retryCount = retryCount
        await this.db.put('syncQueue', item)
      }
    } catch (error) {
      console.error('Failed to update retry count:', error)
      throw error
    }
  }

  // Settings methods
  async saveSetting(key: string, value: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')
    
    try {
      await this.db.put('settings', {
        key,
        value,
        timestamp: Date.now()
      })
    } catch (error) {
      console.error('Failed to save setting:', error)
      throw error
    }
  }

  async getSetting(key: string): Promise<any> {
    if (!this.db) throw new Error('Database not initialized')
    
    try {
      const setting = await this.db.get('settings', key)
      return setting?.value
    } catch (error) {
      console.error('Failed to get setting:', error)
      return undefined
    }
  }

  // Utility methods
  async isOnline(): Promise<boolean> {
    return navigator.onLine
  }

  async getStorageSize(): Promise<string> {
    if (!this.db) throw new Error('Database not initialized')
    
    try {
      const transactions = await this.db.count('transactions')
      const products = await this.db.count('products')
      const cart = await this.db.count('cart')
      const syncQueue = await this.db.count('syncQueue')
      
      return `Transactions: ${transactions}, Products: ${products}, Cart: ${cart}, Queue: ${syncQueue}`
    } catch (error) {
      console.error('Failed to get storage size:', error)
      return 'Unknown'
    }
  }

  async clearAllData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')
    
    try {
      await Promise.all([
        this.db.clear('transactions'),
        this.db.clear('products'),
        this.db.clear('cart'),
        this.db.clear('syncQueue'),
        this.db.clear('settings')
      ])
    } catch (error) {
      console.error('Failed to clear all data:', error)
      throw error
    }
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }
}

export const offlineStorage = new OfflineStorage()
export default offlineStorage
