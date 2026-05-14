import mongoose, { Schema, Document } from 'mongoose';
import { Sale as ISale, SaleItem as ISaleItem, Payment as IPayment } from '../../../shared/types';

export interface SaleItemDocument extends ISaleItem, Document {}

export interface PaymentDocument extends IPayment, Document {}

export interface SaleDocument extends ISale, Document {
  calculateTotals(): void;
  addPayment(amount: number, method: string, reference?: string): Promise<PaymentDocument>;
  refund(): Promise<SaleDocument>;
}

const saleItemSchema = new Schema<SaleItemDocument>({
  saleId: {
    type: Schema.Types.ObjectId,
    ref: 'Sale',
    required: true,
    index: true
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0.01, 'Quantity must be greater than 0']
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Unit price cannot be negative']
  },
  taxRate: {
    type: Number,
    default: 0,
    min: [0, 'Tax rate cannot be negative'],
    max: [100, 'Tax rate cannot exceed 100']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative']
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative']
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Pre-save middleware to calculate total
saleItemSchema.pre('save', function(next) {
  if (this.isModified('quantity') || this.isModified('unitPrice') || this.isModified('discount')) {
    const subtotal = this.quantity * this.unitPrice;
    const discountAmount = subtotal * (this.discount / 100);
    const afterDiscount = subtotal - discountAmount;
    this.total = afterDiscount * (1 + this.taxRate / 100);
  }
  next();
});

const paymentSchema = new Schema<PaymentDocument>({
  saleId: {
    type: Schema.Types.ObjectId,
    ref: 'Sale',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  method: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: ['cash', 'card', 'mobile']
  },
  reference: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['completed', 'pending', 'failed'],
    default: 'completed'
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

const saleSchema = new Schema<SaleDocument>({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: [true, 'Tenant ID is required'],
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  saleNumber: {
    type: String,
    required: [true, 'Sale number is required'],
    unique: true,
    index: true
  },
  customerName: {
    type: String,
    trim: true,
    maxlength: [100, 'Customer name cannot exceed 100 characters']
  },
  customerPhone: {
    type: String,
    trim: true,
    match: [/^[+]?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: [0, 'Tax amount cannot be negative']
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: [0, 'Discount amount cannot be negative']
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative']
  },
  status: {
    type: String,
    enum: ['completed', 'returned', 'cancelled'],
    default: 'completed',
    index: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'mobile'],
    required: [true, 'Payment method is required']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  items: [saleItemSchema],
  payments: [paymentSchema]
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for performance
saleSchema.index({ tenantId: 1, saleNumber: 1 });
saleSchema.index({ tenantId: 1, createdAt: -1 });
saleSchema.index({ tenantId: 1, status: 1 });
saleSchema.index({ userId: 1, createdAt: -1 });

// Virtual for paid amount
saleSchema.virtual('paidAmount').get(function() {
  return this.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
});

// Virtual for balance due
saleSchema.virtual('balanceDue').get(function() {
  return this.total - this.paidAmount;
});

// Virtual for is fully paid
saleSchema.virtual('isFullyPaid').get(function() {
  return this.paidAmount >= this.total;
});

// Instance methods
saleSchema.methods.calculateTotals = function() {
  if (!this.items || this.items.length === 0) {
    this.subtotal = 0;
    this.taxAmount = 0;
    this.total = 0;
    return;
  }

  this.subtotal = this.items.reduce((sum, item) => {
    const subtotal = item.quantity * item.unitPrice;
    const discountAmount = subtotal * (item.discount / 100);
    return sum + (subtotal - discountAmount);
  }, 0);

  this.taxAmount = this.items.reduce((sum, item) => {
    const subtotal = item.quantity * item.unitPrice;
    const discountAmount = subtotal * (item.discount / 100);
    const afterDiscount = subtotal - discountAmount;
    return sum + (afterDiscount * (item.taxRate / 100));
  }, 0);

  this.total = this.subtotal + this.taxAmount - this.discountAmount;
};

saleSchema.methods.addPayment = async function(amount: number, method: string, reference?: string): Promise<PaymentDocument> {
  const payment = new Payment({
    saleId: this._id,
    amount,
    method,
    reference,
    status: 'completed'
  });

  this.payments.push(payment);
  await this.save();
  return payment;
};

saleSchema.methods.refund = async function(): Promise<SaleDocument> {
  this.status = 'returned';
  return this.save();
};

// Static methods
saleSchema.statics.generateSaleNumber = async function(tenantId: string): Promise<string> {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  
  const prefix = `SALE-${year}${month}${day}`;
  
  const lastSale = await this.findOne({
    tenantId,
    saleNumber: { $regex: `^${prefix}` }
  }).sort({ saleNumber: -1 });

  let sequence = 1;
  if (lastSale) {
    const lastSequence = parseInt(lastSale.saleNumber.split('-')[2]) || 0;
    sequence = lastSequence + 1;
  }

  return `${prefix}-${String(sequence).padStart(4, '0')}`;
};

saleSchema.statics.findByTenant = function(tenantId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  return this.find({ tenantId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('user')
    .populate('items.productId');
};

saleSchema.statics.findByDateRange = function(tenantId: string, startDate: Date, endDate: Date) {
  return this.find({
    tenantId,
    createdAt: { $gte: startDate, $lte: endDate },
    status: 'completed'
  }).sort({ createdAt: -1 });
};

// Pre-save middleware
saleSchema.pre('save', function(next) {
  if (this.isModified('items') || this.isModified('discountAmount')) {
    this.calculateTotals();
  }
  next();
});

// Query middleware
saleSchema.pre(/^find/, function(next) {
  this.populate('user')
    .populate('items.productId')
    .populate('payments');
  next();
});

export const SaleItem = mongoose.model<SaleItemDocument>('SaleItem', saleItemSchema);
export const Payment = mongoose.model<PaymentDocument>('Payment', paymentSchema);
export const Sale = mongoose.model<SaleDocument>('Sale', saleSchema);
