// ================================
// SHARED TYPES FOR MERN STACK
// ================================

export interface Tenant {
  _id: string;
  name: string;
  slug: string;
  plan: 'basic' | 'pro' | 'enterprise';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  _id: string;
  tenantId: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  emailVerified?: boolean;
  role?: string; // Simplified role for now
  createdAt: Date;
  updatedAt: Date;
  roles?: Role[];
}

export interface Role {
  _id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  permissions?: Permission[];
}

export interface Permission {
  _id: string;
  name: string;
  module: string;
  action: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  _id: string;
  tenantId: string;
  name: string;
  description?: string;
  parentId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  parent?: Category;
  children?: Category[];
}

export interface Product {
  _id: string;
  tenantId: string;
  categoryId?: string;
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  unit: string;
  cost: number;
  price: number;
  taxRate: number;
  reorderLevel?: number;
  reorderQuantity?: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  category?: Category;
  inventory?: Inventory[];
}

export interface Warehouse {
  _id: string;
  tenantId: string;
  name: string;
  location?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Inventory {
  _id: string;
  tenantId: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  minStock: number;
  maxStock?: number;
  updatedAt: Date;
  product?: Product;
  warehouse?: Warehouse;
}

export interface StockMovement {
  _id: string;
  tenantId: string;
  productId: string;
  warehouseId: string;
  type: 'purchase' | 'sale' | 'adjustment' | 'transfer';
  quantity: number;
  reference?: string;
  notes?: string;
  createdAt: Date;
  product?: Product;
  warehouse?: Warehouse;
}

export interface Sale {
  _id: string;
  tenantId: string;
  userId: string;
  saleNumber: string;
  customerName?: string;
  customerPhone?: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  status: 'completed' | 'returned' | 'cancelled';
  paymentMethod: 'cash' | 'card' | 'mobile';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  items?: SaleItem[];
  payments?: Payment[];
}

export interface SaleItem {
  _id: string;
  saleId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount: number;
  total: number;
  product?: Product;
}

export interface Payment {
  _id: string;
  saleId: string;
  amount: number;
  method: 'cash' | 'card' | 'mobile';
  reference?: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: Date;
}

export interface Purchase {
  _id: string;
  tenantId: string;
  purchaseNumber: string;
  supplierName: string;
  supplierPhone?: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  status: 'completed' | 'pending' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  items?: PurchaseItem[];
}

export interface PurchaseItem {
  _id: string;
  purchaseId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  total: number;
  product?: Product;
}

export interface Account {
  _id: string;
  tenantId: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  balance: number;
  parentId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  parent?: Account;
  children?: Account[];
}

export interface JournalEntry {
  _id: string;
  tenantId: string;
  description: string;
  reference?: string;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
  lines?: JournalEntryLine[];
}

export interface JournalEntryLine {
  _id: string;
  journalEntryId: string;
  accountId: string;
  debit?: number;
  credit?: number;
  description?: string;
  createdAt: Date;
  account?: Account;
}

export interface Setting {
  _id: string;
  tenantId: string;
  key: string;
  value: string;
  description?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  _id: string;
  tenantId: string;
  userId?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  data?: any;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  user?: User;
}

export interface AuditLog {
  _id: string;
  tenantId: string;
  userId?: string;
  action: 'create' | 'update' | 'delete';
  entity: string;
  entityId: string;
  changes?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  user?: User;
}

// ================================
// API REQUEST/RESPONSE TYPES
// ================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  tenantSlug?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  tenantName: string;
  tenantSlug: string;
}

export interface CreateSaleRequest {
  customerName?: string;
  customerPhone?: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
  }[];
  paymentMethod: 'cash' | 'card' | 'mobile';
  notes?: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  categoryId?: string;
  unit: string;
  cost: number;
  price: number;
  taxRate: number;
  reorderLevel?: number;
  reorderQuantity?: number;
  imageUrl?: string;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  isActive?: boolean;
}

// ================================
// QUERY & FILTER TYPES
// ================================

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProductFilter extends PaginationQuery {
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export interface SalesFilter extends PaginationQuery {
  startDate?: string;
  endDate?: string;
  status?: Sale['status'];
  paymentMethod?: Sale['paymentMethod'];
  userId?: string;
}

export interface InventoryFilter extends PaginationQuery {
  warehouseId?: string;
  productId?: string;
  lowStock?: boolean;
}

// ================================
// SOCKET.IO EVENT TYPES
// ================================

export interface SocketEvents {
  // Client to Server
  'join-tenant': (tenantId: string) => void;
  'join-warehouse': (warehouseId: string) => void;
  'sale-created': (sale: Sale) => void;
  'inventory-updated': (inventory: Inventory) => void;
  
  // Server to Client
  'notification': (notification: Notification) => void;
  'sale-update': (sale: Sale) => void;
  'inventory-update': (inventory: Inventory) => void;
  'low-stock-alert': (product: Product, warehouse: Warehouse) => void;
}

// ================================
// REPORT TYPES
// ================================

export interface SalesReport {
  totalSales: number;
  totalRevenue: number;
  averageSaleValue: number;
  salesByPaymentMethod: Record<string, number>;
  topProducts: Array<{
    product: Product;
    quantity: number;
    revenue: number;
  }>;
  dailySales: Array<{
    date: string;
    sales: number;
    revenue: number;
  }>;
}

export interface InventoryReport {
  totalProducts: number;
  totalValue: number;
  lowStockItems: Array<{
    product: Product;
    currentStock: number;
    minStock: number;
  }>;
  stockMovements: StockMovement[];
  warehouseSummary: Array<{
    warehouse: Warehouse;
    totalValue: number;
    productCount: number;
  }>;
}

export interface FinancialReport {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  accountBalances: Array<{
    account: Account;
    balance: number;
  }>;
  trialBalance: Array<{
    account: Account;
    debit: number;
    credit: number;
  }>;
}
