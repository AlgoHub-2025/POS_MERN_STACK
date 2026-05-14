// Authentication Types
export interface LoginRequest {
  email: string
  password: string
  remember?: boolean
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  phone?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

// Tenant Types
export interface Tenant {
  id: string
  name: string
  domain: string
  settings: TenantSettings
  createdAt: string
  updatedAt: string
}

export interface TenantSettings {
  currency: string
  timezone: string
  dateFormat: string
  taxSettings: TaxSettings
}

export interface TaxSettings {
  enabled: boolean
  rate: number
  inclusive: boolean
}

// Transaction Types
export interface Transaction {
  id: string
  items: CartItem[]
  subtotal: number
  tax: number
  total: number
  paymentMethod: string
  timestamp: string
  status: 'pending' | 'completed' | 'refunded'
  customerInfo?: {
    name: string
    email?: string
    phone?: string
  }
  discount?: {
    type: 'percentage' | 'fixed'
    value: number
    reason: string
  }
}

// Product Types
export interface Product {
  id: string
  name: string
  price: number
  category: string
  inStock: boolean
  stock?: number
  emoji?: string
  image?: string
  description?: string
  sku?: string
  barcode?: string
  taxRate?: number
  costPrice?: number
  profitMargin?: number
  minStockLevel?: number
  maxStockLevel?: number
  reorderPoint?: number
  supplierId?: string
  locationId?: string
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  createdAt?: string
  updatedAt?: string
}

export interface CartItem {
  id: string
  product: Product
  quantity: number
  total: number
}

export interface Transaction {
  id: string
  items: CartItem[]
  subtotal: number
  tax: number
  total: number
  paymentMethod: string
  timestamp: string
  customerInfo?: {
    name: string
    email?: string
    phone?: string
  }
  discount?: {
    type: 'percentage' | 'fixed'
    value: number
    reason: string
  }
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'manager' | 'cashier'
  isActive: boolean
  emailVerified: boolean
  createdAt: string
  lastLoginAt?: string
  avatar?: string
  phone?: string
}

export interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  loyaltyPoints?: number
  creditLimit?: number
  totalSpent?: number
  visitCount?: number
  lastVisit?: string
  preferences?: string[]
  notes?: string
}

export interface Supplier {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  rating?: number
  leadTime?: number
  paymentTerms?: string
  notes?: string
}

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: Date
  read: boolean
  data?: any
}

export interface Report {
  id: string
  name: string
  type: string
  description: string
  parameters?: Record<string, any>
  generatedAt: string
  generatedBy: string
  fileUrl?: string
}

export interface Expense {
  id: string
  description: string
  amount: number
  category: string
  date: string
  receipt?: string
  notes?: string
  recurring?: boolean
  approvedBy?: string
}

export interface AIInsight {
  id: string
  type: 'recommendation' | 'warning' | 'opportunity' | 'trend'
  title: string
  description: string
  confidence: number
  actionable: boolean
  category: string
  data?: any
  createdAt: string
}

export interface VoiceCommand {
  command: string
  intent: string
  entities: Array<{
    type: string
    value: string
    confidence: number
  }>
  confidence: number
}

export interface BarcodeScan {
  barcode: string
  product?: Product
  timestamp: Date
  confidence?: number
}

export interface QueueItem {
  id: string
  customerName?: string
  items: CartItem[]
  status: 'waiting' | 'processing' | 'completed'
  estimatedTime?: number
  createdAt: Date
  priority: 'low' | 'medium' | 'high'
}

export interface Shift {
  id: string
  userId: string
  startTime: Date
  endTime?: Date
  status: 'active' | 'completed'
  sales: number
  revenue: number
  notes?: string
}

export interface TaxRate {
  id: string
  name: string
  rate: number
  type: 'percentage' | 'fixed'
  applicableTo?: string[]
}

export interface Discount {
  id: string
  code?: string
  name: string
  type: 'percentage' | 'fixed'
  value: number
  minimumAmount?: number
  maximumDiscount?: number
  applicableProducts?: string[]
  startDate?: string
  endDate?: string
  usageLimit?: number
  usedCount?: number
  isActive: boolean
}
