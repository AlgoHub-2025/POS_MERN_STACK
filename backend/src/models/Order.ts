import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';
import { IProduct } from './Product';

export interface IAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  type?: 'shipping' | 'billing';
  isDefault?: boolean;
}

export interface IOrderItem {
  productId: IProduct['_id'];
  sku: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
  status: 'pending' | 'allocated' | 'shipped' | 'delivered' | 'returned' | 'cancelled';
  serialNumbers?: string[];
  batchInfo?: {
    batchNumber: string;
    expiryDate?: Date;
    manufactureDate?: Date;
  };
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  notes?: string;
  addedAt: Date;
}

export interface IPayment {
  method: 'cash' | 'card' | 'mobile' | 'gift-card' | 'credit' | 'mixed' | 'crypto' | 'bnpl';
  amount: number;
  currency: string;
  reference?: string;
  status: 'pending' | 'authorized' | 'captured' | 'refunded' | 'failed' | 'voided';
  transactionId?: string;
  authorizationCode?: string;
  gateway?: string;
  fees?: number;
  netAmount?: number;
  metadata?: Record<string, any>;
  processedAt?: Date;
  processedBy?: IUser['_id'];
  notes?: string;
}

export interface IShipping {
  address: IAddress;
  method: string;
  carrier?: string;
  service?: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  cost: number;
  status: 'pending' | 'shipped' | 'in-transit' | 'delivered' | 'returned' | 'failed';
  insurance?: {
    amount: number;
    provider: string;
    policyNumber?: string;
  };
  signatureRequired?: boolean;
  deliveryInstructions?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
}

export interface IOrderMetadata {
  source: 'pos' | 'web' | 'mobile' | 'phone' | 'api' | 'marketplace' | 'social';
  location: string;
  employee: IUser['_id'];
  register?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  referralCode?: string;
  campaign?: string;
  tags?: string[];
  notes?: string;
  internalComments?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: Date;
  createdBy: IUser['_id'];
  updatedAt: Date;
  updatedBy: IUser['_id'];
  completedAt?: Date;
  completedBy?: IUser['_id'];
  cancelledAt?: Date;
  cancelledBy?: IUser['_id'];
  cancellationReason?: string;
  approvedAt?: Date;
  approvedBy?: IUser['_id'];
  version: number;
}

export interface IOrderTotals {
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  shippingTotal: number;
  handlingTotal: number;
  dutyTotal: number;
  grandTotal: number;
  paid: number;
  due: number;
  change: number;
  currency: string;
  exchangeRate?: number;
}

export interface IOrderCustomer {
  id: IUser['_id'];
  name: string;
  email: string;
  phone: string;
  company?: string;
  taxId?: string;
  loyaltyTier?: string;
  pointsEarned?: number;
  pointsUsed?: number;
  customerSince?: Date;
  isGuest: boolean;
  billingAddress?: IAddress;
  shippingAddress?: IAddress;
}

export interface IOrder extends Document {
  orderNumber: string;
  orderType: 'sale' | 'return' | 'exchange' | 'layaway' | 'special-order' | 'quote' | 'invoice';
  status: 'draft' | 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'refunded' | 'on-hold';
  customer: IOrderCustomer;
  items: IOrderItem[];
  totals: IOrderTotals;
  payments: IPayment[];
  shipping?: IShipping;
  metadata: IOrderMetadata;
  relatedOrders?: string[]; // For exchanges, returns, etc.
  parentOrderId?: string;
  childOrderIds?: string[];
  quotes?: Array<{
    id: string;
    validUntil: Date;
    status: 'active' | 'expired' | 'converted';
  }>;
  subscriptions?: Array<{
    id: string;
    frequency: string;
    nextDelivery: Date;
    status: 'active' | 'paused' | 'cancelled';
  }>;
  holds?: Array<{
    type: 'payment' | 'inventory' | 'fraud' | 'manual' | 'compliance';
    reason: string;
    placedBy: IUser['_id'];
    placedAt: Date;
    releasedBy?: IUser['_id'];
    releasedAt?: Date;
  }>;
  audit: Array<{
    action: string;
    details: Record<string, any>;
    performedBy: IUser['_id'];
    performedAt: Date;
    ipAddress?: string;
  }>;
}

const OrderSchema = new Schema<IOrder>({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  orderType: {
    type: String,
    enum: ['sale', 'return', 'exchange', 'layaway', 'special-order', 'quote', 'invoice'],
    default: 'sale',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded', 'on-hold'],
    default: 'draft',
    required: true,
    index: true
  },
  customer: {
    id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    company: String,
    taxId: String,
    loyaltyTier: String,
    pointsEarned: Number,
    pointsUsed: Number,
    customerSince: Date,
    isGuest: {
      type: Boolean,
      default: false
    },
    billingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      type: { type: String, enum: ['shipping', 'billing'] },
      isDefault: Boolean
    },
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      type: { type: String, enum: ['shipping', 'billing'] },
      isDefault: Boolean
    }
  },
  items: [{
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    sku: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    description: String,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    tax: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['pending', 'allocated', 'shipped', 'delivered', 'returned', 'cancelled'],
      default: 'pending'
    },
    serialNumbers: [String],
    batchInfo: {
      batchNumber: String,
      expiryDate: Date,
      manufactureDate: Date
    },
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    notes: String,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  totals: {
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    discountTotal: {
      type: Number,
      default: 0,
      min: 0
    },
    taxTotal: {
      type: Number,
      default: 0,
      min: 0
    },
    shippingTotal: {
      type: Number,
      default: 0,
      min: 0
    },
    handlingTotal: {
      type: Number,
      default: 0,
      min: 0
    },
    dutyTotal: {
      type: Number,
      default: 0,
      min: 0
    },
    grandTotal: {
      type: Number,
      required: true,
      min: 0
    },
    paid: {
      type: Number,
      default: 0,
      min: 0
    },
    due: {
      type: Number,
      required: true,
      min: 0
    },
    change: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD',
      required: true
    },
    exchangeRate: Number
  },
  payments: [{
    method: {
      type: String,
      enum: ['cash', 'card', 'mobile', 'gift-card', 'credit', 'mixed', 'crypto', 'bnpl'],
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      required: true
    },
    reference: String,
    status: {
      type: String,
      enum: ['pending', 'authorized', 'captured', 'refunded', 'failed', 'voided'],
      default: 'pending'
    },
    transactionId: String,
    authorizationCode: String,
    gateway: String,
    fees: Number,
    netAmount: Number,
    metadata: Schema.Types.Mixed,
    processedAt: Date,
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }],
  shipping: {
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
      type: { type: String, enum: ['shipping', 'billing'] },
      isDefault: Boolean
    },
    method: {
      type: String,
      required: true
    },
    carrier: String,
    service: String,
    trackingNumber: String,
    estimatedDelivery: Date,
    actualDelivery: Date,
    cost: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['pending', 'shipped', 'in-transit', 'delivered', 'returned', 'failed'],
      default: 'pending'
    },
    insurance: {
      amount: Number,
      provider: String,
      policyNumber: String
    },
    signatureRequired: Boolean,
    deliveryInstructions: String,
    shippedAt: Date,
    deliveredAt: Date
  },
  metadata: {
    source: {
      type: String,
      enum: ['pos', 'web', 'mobile', 'phone', 'api', 'marketplace', 'social'],
      required: true
    },
    location: {
      type: String,
      required: true
    },
    employee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    register: String,
    sessionId: String,
    ipAddress: String,
    userAgent: String,
    referralCode: String,
    campaign: String,
    tags: [String],
    notes: String,
    internalComments: String,
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    completedAt: Date,
    completedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    cancelledAt: Date,
    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    cancellationReason: String,
    approvedAt: Date,
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    version: {
      type: Number,
      default: 1
    }
  },
  relatedOrders: [String],
  parentOrderId: String,
  childOrderIds: [String],
  quotes: [{
    id: String,
    validUntil: Date,
    status: {
      type: String,
      enum: ['active', 'expired', 'converted'],
      default: 'active'
    }
  }],
  subscriptions: [{
    id: String,
    frequency: String,
    nextDelivery: Date,
    status: {
      type: String,
      enum: ['active', 'paused', 'cancelled'],
      default: 'active'
    }
  }],
  holds: [{
    type: {
      type: String,
      enum: ['payment', 'inventory', 'fraud', 'manual', 'compliance'],
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    placedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    placedAt: {
      type: Date,
      default: Date.now
    },
    releasedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    releasedAt: Date
  }],
  audit: [{
    action: {
      type: String,
      required: true
    },
    details: {
      type: Schema.Types.Mixed,
      required: true
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    performedAt: {
      type: Date,
      default: Date.now
    },
    ipAddress: String
  }]
}, {
  timestamps: true,
  collection: 'orders'
});

// Indexes for performance
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ 'customer.id': 1 });
OrderSchema.index({ 'metadata.employee': 1 });
OrderSchema.index({ 'metadata.location': 1 });
OrderSchema.index({ 'metadata.createdAt': 1 });
OrderSchema.index({ 'metadata.source': 1 });
OrderSchema.index({ orderType: 1 });

// Pre-save middleware for order number generation
OrderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const prefix = this.getOrderPrefix();
    const sequence = await this.getNextSequence(prefix);
    this.orderNumber = `${prefix}${sequence.toString().padStart(6, '0')}`;
  }
  
  // Update totals before saving
  if (this.isModified('items') || this.isModified('payments')) {
    this.calculateTotals();
  }
  
  // Update metadata
  this.metadata.updatedAt = new Date();
  
  next();
});

// Instance methods
OrderSchema.methods.getOrderPrefix = function(): string {
  const prefixes = {
    'sale': 'SO',
    'return': 'RT',
    'exchange': 'EX',
    'layaway': 'LY',
    'special-order': 'SP',
    'quote': 'QT',
    'invoice': 'IN'
  };
  return prefixes[this.orderType] || 'OR';
};

OrderSchema.methods.getNextSequence = async function(prefix: string): Promise<number> {
  const Sequence = mongoose.model('Sequence');
  const sequence = await Sequence.findOneAndUpdate(
    { name: prefix },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );
  return sequence.value;
};

OrderSchema.methods.calculateTotals = function(): void {
  // Calculate item totals
  let subtotal = 0;
  let discountTotal = 0;
  let taxTotal = 0;
  
  this.items.forEach(item => {
    const itemTotal = item.quantity * item.unitPrice;
    const itemDiscount = item.discount * item.quantity;
    const itemTax = item.tax * item.quantity;
    
    item.total = itemTotal - itemDiscount + itemTax;
    subtotal += itemTotal;
    discountTotal += itemDiscount;
    taxTotal += itemTax;
  });
  
  // Calculate totals
  this.totals.subtotal = subtotal;
  this.totals.discountTotal = discountTotal;
  this.totals.taxTotal = taxTotal;
  this.totals.grandTotal = subtotal - discountTotal + taxTotal + (this.totals.shippingTotal || 0) + (this.totals.handlingTotal || 0) + (this.totals.dutyTotal || 0);
  this.totals.due = this.totals.grandTotal - this.totals.paid;
  
  // Calculate change for cash payments
  const cashPayments = this.payments.filter(p => p.method === 'cash').reduce((sum, p) => sum + p.amount, 0);
  if (cashPayments > this.totals.grandTotal) {
    this.totals.change = cashPayments - this.totals.grandTotal;
  }
};

OrderSchema.methods.addAuditEntry = function(action: string, details: Record<string, any>, performedBy: string, ipAddress?: string): void {
  this.audit.push({
    action,
    details,
    performedBy,
    performedAt: new Date(),
    ipAddress
  });
};

OrderSchema.methods.canBeModified = function(): boolean {
  const nonModifiableStatuses = ['completed', 'cancelled', 'refunded'];
  return !nonModifiableStatuses.includes(this.status);
};

OrderSchema.methods.canBeCancelled = function(): boolean {
  const nonCancellableStatuses = ['completed', 'cancelled', 'refunded', 'shipped'];
  return !nonCancellableStatuses.includes(this.status);
};

OrderSchema.methods.getPaymentStatus = function(): string {
  if (this.totals.paid >= this.totals.grandTotal) return 'paid';
  if (this.totals.paid > 0) return 'partial';
  return 'unpaid';
};

OrderSchema.methods.getFulfillmentStatus = function(): string {
  if (this.items.length === 0) return 'no-items';
  
  const statuses = this.items.map(item => item.status);
  if (statuses.every(status => status === 'delivered')) return 'delivered';
  if (statuses.every(status => status === 'shipped')) return 'shipped';
  if (statuses.every(status => status === 'allocated')) return 'allocated';
  if (statuses.some(status => status === 'shipped' || status === 'delivered')) return 'partial';
  return 'pending';
};

// Static methods
OrderSchema.statics.generateOrderNumber = async function(orderType: string): Promise<string> {
  const prefixes = {
    'sale': 'SO',
    'return': 'RT',
    'exchange': 'EX',
    'layaway': 'LY',
    'special-order': 'SP',
    'quote': 'QT',
    'invoice': 'IN'
  };
  const prefix = prefixes[orderType] || 'OR';
  const sequence = await this.getNextSequence(prefix);
  return `${prefix}${sequence.toString().padStart(6, '0')}`;
};

OrderSchema.statics.findByCustomer = function(customerId: string, options: any = {}) {
  const query = { 'customer.id': customerId };
  if (options.status) query.status = options.status;
  if (options.orderType) query.orderType = options.orderType;
  if (options.dateFrom || options.dateTo) {
    query['metadata.createdAt'] = {};
    if (options.dateFrom) query['metadata.createdAt'].$gte = options.dateFrom;
    if (options.dateTo) query['metadata.createdAt'].$lte = options.dateTo;
  }
  
  return this.find(query)
    .populate('customer.id', 'name email phone')
    .populate('metadata.employee', 'name email')
    .sort({ 'metadata.createdAt': -1 });
};

OrderSchema.statics.findByLocation = function(locationId: string, options: any = {}) {
  const query = { 'metadata.location': locationId };
  if (options.status) query.status = options.status;
  if (options.dateFrom || options.dateTo) {
    query['metadata.createdAt'] = {};
    if (options.dateFrom) query['metadata.createdAt'].$gte = options.dateFrom;
    if (options.dateTo) query['metadata.createdAt'].$lte = options.dateTo;
  }
  
  return this.find(query)
    .populate('customer.id', 'name email phone')
    .populate('metadata.employee', 'name email')
    .sort({ 'metadata.createdAt': -1 });
};

// Virtual fields
OrderSchema.virtual('isPaid').get(function() {
  return this.totals.paid >= this.totals.grandTotal;
});

OrderSchema.virtual('isOverdue').get(function() {
  if (!this.totals.due || this.totals.due <= 0) return false;
  const dueDate = new Date(this.metadata.createdAt);
  dueDate.setDate(dueDate.getDate() + 30); // 30 days payment terms
  return new Date() > dueDate;
});

OrderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

OrderSchema.virtual('totalWeight').get(function() {
  return this.items.reduce((sum, item) => sum + ((item.weight || 0) * item.quantity), 0);
});

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
