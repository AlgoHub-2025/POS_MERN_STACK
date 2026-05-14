import mongoose, { Schema, Document } from 'mongoose';
import { Product as IProduct } from '../../../shared/types';

export interface ProductDocument extends IProduct, Document {
  isInStock(): boolean;
  isLowStock(): boolean;
  updateStock(quantity: number): Promise<ProductDocument>;
}

const productSchema = new Schema<ProductDocument>({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: [true, 'Tenant ID is required'],
    index: true
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    index: true
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    trim: true,
    uppercase: true,
    index: true
  },
  barcode: {
    type: String,
    trim: true,
    index: true,
    sparse: true
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['pcs', 'kg', 'liter', 'meter', 'box', 'dozen'],
    default: 'pcs'
  },
  cost: {
    type: Number,
    required: [true, 'Cost is required'],
    min: [0, 'Cost cannot be negative']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  taxRate: {
    type: Number,
    default: 0,
    min: [0, 'Tax rate cannot be negative'],
    max: [100, 'Tax rate cannot exceed 100']
  },
  reorderLevel: {
    type: Number,
    min: [0, 'Reorder level cannot be negative']
  },
  reorderQuantity: {
    type: Number,
    min: [1, 'Reorder quantity must be at least 1']
  },
  imageUrl: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function (doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Compound indexes
productSchema.index({ tenantId: 1, sku: 1 }, { unique: true });
productSchema.index({ tenantId: 1, barcode: 1 }, { sparse: true });
productSchema.index({ tenantId: 1, name: 1 });
productSchema.index({ tenantId: 1, isActive: 1 });
productSchema.index({ tenantId: 1, categoryId: 1 });

// Virtual for profit margin
productSchema.virtual('profitMargin').get(function () {
  if (this.cost > 0) {
    return ((this.price - this.cost) / this.price) * 100;
  }
  return 0;
});

// Virtual for price with tax
productSchema.virtual('priceWithTax').get(function () {
  return this.price * (1 + this.taxRate / 100);
});

// Instance methods
productSchema.methods.isInStock = function (): boolean {
  // This would typically check inventory, but for now we'll assume active products are in stock
  return this.isActive;
};

productSchema.methods.isLowStock = async function (): Promise<boolean> {
  if (!this.reorderLevel) return false;

  // Assuming we use the Mongoose model to sum up the InventoryItem quantities
  const InventoryItem = mongoose.model('InventoryItem');
  const items = await InventoryItem.find({ productId: this._id, status: 'active' });

  const totalStock = items.reduce((sum: number, inv: any) => sum + (inv.availableQuantity || inv.quantity), 0);
  return totalStock <= this.reorderLevel;
};

productSchema.methods.updateStock = async function (quantity: number): Promise<ProductDocument> {
  // Creating a generic adjustment for now as a fallback since full movement logic requires 
  // warehouse context. We will just update a main inventory record if it exists.
  const InventoryItem = mongoose.model('InventoryItem');
  let inventory = await InventoryItem.findOne({ productId: this._id, status: 'active' });

  if (inventory) {
    inventory.quantity += quantity;
    inventory.availableQuantity += quantity;
    await inventory.save();
  }

  return this;
};

// Static methods
productSchema.statics.findBySku = function (tenantId: string, sku: string) {
  return this.findOne({ tenantId, sku, isActive: true });
};

productSchema.statics.findByBarcode = function (tenantId: string, barcode: string) {
  return this.findOne({ tenantId, barcode, isActive: true });
};

productSchema.statics.findByCategory = function (tenantId: string, categoryId: string) {
  return this.find({ tenantId, categoryId, isActive: true });
};

productSchema.statics.searchProducts = function (tenantId: string, searchTerm: string) {
  const regex = new RegExp(searchTerm, 'i');
  return this.find({
    tenantId,
    isActive: true,
    $or: [
      { name: regex },
      { sku: regex },
      { barcode: regex },
      { description: regex }
    ]
  });
};

productSchema.statics.findActiveByTenant = function (tenantId: string) {
  return this.find({ tenantId, isActive: true });
};

// Query middleware
productSchema.pre(/^find/, function (next) {
  this.populate('category');
  next();
});

// Pre-save middleware
productSchema.pre('save', function (next) {
  if (this.isModified('sku')) {
    this.sku = this.sku.toUpperCase().trim();
  }
  next();
});

export const Product = mongoose.model<ProductDocument>('Product', productSchema);
