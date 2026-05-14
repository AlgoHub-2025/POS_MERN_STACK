import mongoose, { Schema, Document } from 'mongoose';

export interface IWarehouse extends Document {
  warehouseId: string;
  name: string;
  code: string;
  type: 'main' | 'branch' | 'store' | 'distribution_center' | 'fulfillment_center';
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  contact: {
    manager: string;
    phone: string;
    email: string;
  };
  capacity: {
    totalSpace: number; // sq ft
    usedSpace: number;
    availableSpace: number;
    maxProducts: number;
    currentProducts: number;
  };
  operatingHours: {
    monday: { open: string; close: string };
    tuesday: { open: string; close: string };
    wednesday: { open: string; close: string };
    thursday: { open: string; close: string };
    friday: { open: string; close: string };
    saturday: { open: string; close: string };
    sunday: { open: string; close: string };
  };
  status: 'active' | 'inactive' | 'maintenance' | 'closed';
  zones: Array<{
    zoneId: string;
    name: string;
    type: 'storage' | 'picking' | 'packing' | 'receiving' | 'shipping';
    capacity: number;
    currentUsage: number;
    location: string;
    temperature: {
      min: number;
      max: number;
      current: number;
    };
  }>;
  equipment: Array<{
    equipmentId: string;
    type: 'forklift' | 'pallet_jack' | 'conveyor' | 'scanner' | 'printer';
    status: 'operational' | 'maintenance' | 'out_of_service';
    lastMaintenance: Date;
    nextMaintenanceDue: Date;
  }>;
  staff: Array<{
    employeeId: string;
    name: string;
    role: string;
    shift: string;
    isActive: boolean;
  }>;
  performance: {
    orderAccuracy: number;
    pickRate: number; // orders per hour
    packRate: number; // orders per hour
    shipRate: number; // orders per hour
    inventoryAccuracy: number;
    turnoverRate: number;
  };
  integrations: {
    erpSystem?: string;
    shippingCarriers: string[];
    accountingSystem?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface IInventoryItem extends Document {
  itemId: string;
  productId: string;
  sku: string;
  barcode: string;
  qrCode: string;
  serialNumber?: string;
  batchNumber?: string;
  lotNumber?: string;
  warehouseId: string;
  zoneId?: string;
  binLocation?: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  minimumStock: number;
  maximumStock: number;
  reorderPoint: number;
  reorderQuantity: number;
  unitCost: number;
  unitPrice: number;
  totalValue: number;
  supplier: {
    supplierId: string;
    name: string;
    leadTime: number; // days
    lastOrderDate: Date;
    nextOrderDate?: Date;
  };
  dimensions: {
    length: number;
    width: number;
    height: number;
    weight: number;
    volume: number;
  };
  storage: {
    temperature: {
      min: number;
      max: number;
      required: boolean;
    };
    humidity: {
      min: number;
      max: number;
      required: boolean;
    };
    specialRequirements: string[];
    hazardous: boolean;
    fragile: boolean;
    perishable: boolean;
    expiryDate?: Date;
    manufactureDate?: Date;
  };
  tracking: {
    lastCountDate: Date;
    lastMovementDate: Date;
    movementHistory: Array<{
      date: Date;
      type: 'in' | 'out' | 'transfer' | 'adjustment';
      quantity: number;
      reference: string;
      reason: string;
      userId: string;
    }>;
    countHistory: Array<{
      date: Date;
      countedQuantity: number;
      systemQuantity: number;
      variance: number;
      reason: string;
      countedBy: string;
    }>;
  };
  status: 'active' | 'inactive' | 'discontinued' | 'damaged' | 'expired' | 'on_hold';
  alerts: Array<{
    type: 'low_stock' | 'overstock' | 'expiring' | 'damaged' | 'missing';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    date: Date;
    acknowledged: boolean;
    acknowledgedBy?: string;
    acknowledgedAt?: Date;
  }>;
  tags: string[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  lastUpdatedBy: string;
}

export interface IStockTransfer extends Document {
  transferId: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  status: 'pending' | 'approved' | 'in_transit' | 'received' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requestedBy: string;
  approvedBy?: string;
  transferDate: Date;
  expectedDeliveryDate: Date;
  actualDeliveryDate?: Date;
  items: Array<{
    itemId: string;
    productId: string;
    sku: string;
    quantity: number;
    unitCost: number;
    totalValue: number;
    reason: string;
    batchNumber?: string;
    expiryDate?: Date;
  }>;
  shipping: {
    method: string;
    carrier: string;
    trackingNumber?: string;
    cost: number;
    insurance: boolean;
    specialInstructions?: string;
  };
  approval: {
    requestedAt: Date;
    approvedAt?: Date;
    approvedBy?: string;
    notes?: string;
  };
  tracking: {
    pickedAt?: Date;
    shippedAt?: Date;
    inTransitAt?: Date;
    deliveredAt?: Date;
    receivedAt?: Date;
    completedAt?: Date;
  };
  issues: Array<{
    type: 'damage' | 'shortage' | 'delay' | 'lost' | 'other';
    description: string;
    date: Date;
    reportedBy: string;
    resolved: boolean;
    resolvedAt?: Date;
    resolvedBy?: string;
    resolution?: string;
  }>;
  totalValue: number;
  totalItems: number;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICycleCount extends Document {
  countId: string;
  warehouseId: string;
  zoneId?: string;
  countType: 'full' | 'partial' | 'cycle' | 'spot';
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  scheduledDate: Date;
  startedAt?: Date;
  completedAt?: Date;
  assignedTo: string;
  supervisedBy: string;
  items: Array<{
    itemId: string;
    productId: string;
    sku: string;
    binLocation?: string;
    systemQuantity: number;
    countedQuantity?: number;
    variance?: number;
    countedBy?: string;
    countedAt?: Date;
    notes?: string;
    status: 'pending' | 'counted' | 'verified';
  }>;
  summary: {
    totalItems: number;
    countedItems: number;
    totalVariance: number;
    varianceValue: number;
    accuracyRate: number;
    discrepancies: number;
  };
  approval: {
    reviewedBy?: string;
    reviewedAt?: Date;
    approved: boolean;
    notes?: string;
  };
  adjustments: Array<{
    itemId: string;
    adjustmentType: 'increase' | 'decrease';
    quantity: number;
    reason: string;
    approvedBy: string;
    approvedAt: Date;
    journalEntryId?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInventoryAdjustment extends Document {
  adjustmentId: string;
  warehouseId: string;
  adjustmentType: 'damage' | 'loss' | 'theft' | 'return' | 'correction' | 'expiry' | 'recall';
  reason: string;
  reference?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  priority: 'low' | 'medium' | 'high';
  requestedBy: string;
  approvedBy?: string;
  requestedAt: Date;
  approvedAt?: Date;
  completedAt?: Date;
  items: Array<{
    itemId: string;
    productId: string;
    sku: string;
    currentQuantity: number;
    adjustmentQuantity: number;
    newQuantity: number;
    unitCost: number;
    totalValue: number;
    reason: string;
    batchNumber?: string;
    serialNumber?: string;
  }>;
  approval: {
    required: boolean;
    approvedBy?: string;
    approvedAt?: Date;
    notes?: string;
  };
  financial: {
    totalValue: number;
    journalEntryId?: string;
    glAccount?: string;
    taxImpact?: number;
  };
  documentation: {
    photos?: string[];
    documents?: string[];
    witnessStatements?: string[];
    policeReport?: string;
    insuranceClaim?: string;
  };
  followUp: {
    investigationRequired: boolean;
    investigatedBy?: string;
    investigationNotes?: string;
    preventiveActions?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IReorderPoint extends Document {
  pointId: string;
  productId: string;
  sku: string;
  warehouseId: string;
  currentMethod: 'fixed' | 'dynamic' | 'statistical' | 'ml_based';
  settings: {
    reorderPoint: number;
    safetyStock: number;
    leadTime: number;
    demandForecast: number;
    serviceLevel: number; // 0-100%
    reviewPeriod: number; // days
    orderQuantity: number;
    maxStock: number;
  };
  calculations: {
    averageDailyDemand: number;
    demandVariability: number;
    leadTimeVariability: number;
    stockoutCost: number;
    holdingCost: number;
    orderingCost: number;
  };
  optimization: {
    recommendedReorderPoint: number;
    recommendedSafetyStock: number;
    recommendedOrderQuantity: number;
    potentialSavings: number;
    serviceLevelImpact: number;
  };
  history: Array<{
    date: Date;
    previousPoint: number;
    newPoint: number;
    reason: string;
    changedBy: string;
    method: string;
  }>;
  alerts: {
    lowStockAlert: boolean;
    overstockAlert: boolean;
    stockoutRisk: number;
    daysOfStock: number;
  };
  lastCalculated: Date;
  nextReviewDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Schemas
const WarehouseSchema = new Schema<IWarehouse>({
  warehouseId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  type: { type: String, required: true, enum: ['main', 'branch', 'store', 'distribution_center', 'fulfillment_center'] },
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    postalCode: { type: String, required: true },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  contact: {
    manager: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true }
  },
  capacity: {
    totalSpace: { type: Number, required: true },
    usedSpace: { type: Number, default: 0 },
    availableSpace: { type: Number, required: true },
    maxProducts: { type: Number, required: true },
    currentProducts: { type: Number, default: 0 }
  },
  operatingHours: {
    monday: { open: String, close: String, required: true },
    tuesday: { open: String, close: String, required: true },
    wednesday: { open: String, close: String, required: true },
    thursday: { open: String, close: String, required: true },
    friday: { open: String, close: String, required: true },
    saturday: { open: String, close: String, required: true },
    sunday: { open: String, close: String, required: true }
  },
  status: { type: String, required: true, enum: ['active', 'inactive', 'maintenance', 'closed'], default: 'active' },
  zones: [{
    zoneId: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true, enum: ['storage', 'picking', 'packing', 'receiving', 'shipping'] },
    capacity: { type: Number, required: true },
    currentUsage: { type: Number, default: 0 },
    location: { type: String, required: true },
    temperature: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
      current: { type: Number, required: true }
    }
  }],
  equipment: [{
    equipmentId: { type: String, required: true },
    type: { type: String, required: true, enum: ['forklift', 'pallet_jack', 'conveyor', 'scanner', 'printer'] },
    status: { type: String, required: true, enum: ['operational', 'maintenance', 'out_of_service'] },
    lastMaintenance: { type: Date, required: true },
    nextMaintenanceDue: { type: Date, required: true }
  }],
  staff: [{
    employeeId: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
    shift: { type: String, required: true },
    isActive: { type: Boolean, default: true }
  }],
  performance: {
    orderAccuracy: { type: Number, default: 0 },
    pickRate: { type: Number, default: 0 },
    packRate: { type: Number, default: 0 },
    shipRate: { type: Number, default: 0 },
    inventoryAccuracy: { type: Number, default: 0 },
    turnoverRate: { type: Number, default: 0 }
  },
  integrations: {
    erpSystem: String,
    shippingCarriers: [String],
    accountingSystem: String
  },
  createdBy: { type: String, required: true }
}, { timestamps: true });

const InventoryItemSchema = new Schema<IInventoryItem>({
  itemId: { type: String, required: true, unique: true, index: true },
  productId: { type: String, required: true, index: true },
  sku: { type: String, required: true, index: true },
  barcode: { type: String, required: true, unique: true },
  qrCode: { type: String, required: true, unique: true },
  serialNumber: { type: String, sparse: true },
  batchNumber: { type: String, sparse: true },
  lotNumber: { type: String, sparse: true },
  warehouseId: { type: String, required: true, index: true },
  zoneId: String,
  binLocation: String,
  quantity: { type: Number, required: true, min: 0 },
  reservedQuantity: { type: Number, default: 0, min: 0 },
  availableQuantity: { type: Number, required: true, min: 0 },
  minimumStock: { type: Number, default: 0, min: 0 },
  maximumStock: { type: Number, default: 0, min: 0 },
  reorderPoint: { type: Number, default: 0, min: 0 },
  reorderQuantity: { type: Number, default: 0, min: 0 },
  unitCost: { type: Number, required: true, min: 0 },
  unitPrice: { type: Number, required: true, min: 0 },
  totalValue: { type: Number, required: 0 },
  supplier: {
    supplierId: { type: String, required: true },
    name: { type: String, required: true },
    leadTime: { type: Number, required: true, min: 0 },
    lastOrderDate: { type: Date, required: true },
    nextOrderDate: Date
  },
  dimensions: {
    length: { type: Number, required: true, min: 0 },
    width: { type: Number, required: true, min: 0 },
    height: { type: Number, required: true, min: 0 },
    weight: { type: Number, required: true, min: 0 },
    volume: { type: Number, required: 0 }
  },
  storage: {
    temperature: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
      required: { type: Boolean, default: false }
    },
    humidity: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
      required: { type: Boolean, default: false }
    },
    specialRequirements: [String],
    hazardous: { type: Boolean, default: false },
    fragile: { type: Boolean, default: false },
    perishable: { type: Boolean, default: false },
    expiryDate: Date,
    manufactureDate: Date
  },
  tracking: {
    lastCountDate: { type: Date, required: true },
    lastMovementDate: { type: Date, required: true },
    movementHistory: [{
      date: { type: Date, required: true },
      type: { type: String, required: true, enum: ['in', 'out', 'transfer', 'adjustment'] },
      quantity: { type: Number, required: true },
      reference: { type: String, required: true },
      reason: { type: String, required: true },
      userId: { type: String, required: true }
    }],
    countHistory: [{
      date: { type: Date, required: true },
      countedQuantity: { type: Number, required: true },
      systemQuantity: { type: Number, required: true },
      variance: { type: Number, required: true },
      reason: { type: String, required: true },
      countedBy: { type: String, required: true }
    }]
  },
  status: { type: String, required: true, enum: ['active', 'inactive', 'discontinued', 'damaged', 'expired', 'on_hold'], default: 'active' },
  alerts: [{
    type: { type: String, required: true, enum: ['low_stock', 'overstock', 'expiring', 'damaged', 'missing'] },
    severity: { type: String, required: true, enum: ['low', 'medium', 'high', 'critical'] },
    message: { type: String, required: true },
    date: { type: Date, required: true },
    acknowledged: { type: Boolean, default: false },
    acknowledgedBy: String,
    acknowledgedAt: Date
  }],
  tags: [String],
  notes: String,
  lastUpdatedBy: { type: String, required: true }
}, { timestamps: true });

const StockTransferSchema = new Schema<IStockTransfer>({
  transferId: { type: String, required: true, unique: true, index: true },
  fromWarehouseId: { type: String, required: true, index: true },
  toWarehouseId: { type: String, required: true, index: true },
  status: { type: String, required: true, enum: ['pending', 'approved', 'in_transit', 'received', 'completed', 'cancelled'], default: 'pending' },
  priority: { type: String, required: true, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  requestedBy: { type: String, required: true },
  approvedBy: String,
  transferDate: { type: Date, required: true },
  expectedDeliveryDate: { type: Date, required: true },
  actualDeliveryDate: Date,
  items: [{
    itemId: { type: String, required: true },
    productId: { type: String, required: true },
    sku: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitCost: { type: Number, required: true, min: 0 },
    totalValue: { type: Number, required: 0 },
    reason: { type: String, required: true },
    batchNumber: String,
    expiryDate: Date
  }],
  shipping: {
    method: { type: String, required: true },
    carrier: { type: String, required: true },
    trackingNumber: String,
    cost: { type: Number, required: 0 },
    insurance: { type: Boolean, default: false },
    specialInstructions: String
  },
  approval: {
    requestedAt: { type: Date, required: true },
    approvedAt: Date,
    approvedBy: String,
    notes: String
  },
  tracking: {
    pickedAt: Date,
    shippedAt: Date,
    inTransitAt: Date,
    deliveredAt: Date,
    receivedAt: Date,
    completedAt: Date
  },
  issues: [{
    type: { type: String, required: true, enum: ['damage', 'shortage', 'delay', 'lost', 'other'] },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    reportedBy: { type: String, required: true },
    resolved: { type: Boolean, default: false },
    resolvedAt: Date,
    resolvedBy: String,
    resolution: String
  }],
  totalValue: { type: Number, required: 0 },
  totalItems: { type: Number, required: 0 },
  notes: String
}, { timestamps: true });

const CycleCountSchema = new Schema<ICycleCount>({
  countId: { type: String, required: true, unique: true, index: true },
  warehouseId: { type: String, required: true, index: true },
  zoneId: String,
  countType: { type: String, required: true, enum: ['full', 'partial', 'cycle', 'spot'] },
  status: { type: String, required: true, enum: ['planned', 'in_progress', 'completed', 'cancelled'], default: 'planned' },
  priority: { type: String, required: true, enum: ['low', 'medium', 'high'], default: 'medium' },
  scheduledDate: { type: Date, required: true },
  startedAt: Date,
  completedAt: Date,
  assignedTo: { type: String, required: true },
  supervisedBy: { type: String, required: true },
  items: [{
    itemId: { type: String, required: true },
    productId: { type: String, required: true },
    sku: { type: String, required: true },
    binLocation: String,
    systemQuantity: { type: Number, required: true },
    countedQuantity: Number,
    variance: Number,
    countedBy: String,
    countedAt: Date,
    notes: String,
    status: { type: String, required: true, enum: ['pending', 'counted', 'verified'], default: 'pending' }
  }],
  summary: {
    totalItems: { type: Number, required: 0 },
    countedItems: { type: Number, default: 0 },
    totalVariance: { type: Number, default: 0 },
    varianceValue: { type: Number, default: 0 },
    accuracyRate: { type: Number, default: 0 },
    discrepancies: { type: Number, default: 0 }
  },
  approval: {
    reviewedBy: String,
    reviewedAt: Date,
    approved: { type: Boolean, default: false },
    notes: String
  },
  adjustments: [{
    itemId: { type: String, required: true },
    adjustmentType: { type: String, required: true, enum: ['increase', 'decrease'] },
    quantity: { type: Number, required: true },
    reason: { type: String, required: true },
    approvedBy: { type: String, required: true },
    approvedAt: { type: Date, required: true },
    journalEntryId: String
  }]
}, { timestamps: true });

const InventoryAdjustmentSchema = new Schema<IInventoryAdjustment>({
  adjustmentId: { type: String, required: true, unique: true, index: true },
  warehouseId: { type: String, required: true, index: true },
  adjustmentType: { type: String, required: true, enum: ['damage', 'loss', 'theft', 'return', 'correction', 'expiry', 'recall'] },
  reason: { type: String, required: true },
  reference: String,
  status: { type: String, required: true, enum: ['pending', 'approved', 'rejected', 'completed'], default: 'pending' },
  priority: { type: String, required: true, enum: ['low', 'medium', 'high'], default: 'medium' },
  requestedBy: { type: String, required: true },
  approvedBy: String,
  requestedAt: { type: Date, required: true },
  approvedAt: Date,
  completedAt: Date,
  items: [{
    itemId: { type: String, required: true },
    productId: { type: String, required: true },
    sku: { type: String, required: true },
    currentQuantity: { type: Number, required: true },
    adjustmentQuantity: { type: Number, required: true },
    newQuantity: { type: Number, required: true },
    unitCost: { type: Number, required: true, min: 0 },
    totalValue: { type: Number, required: 0 },
    reason: { type: String, required: true },
    batchNumber: String,
    serialNumber: String
  }],
  approval: {
    required: { type: Boolean, default: false },
    approvedBy: String,
    approvedAt: Date,
    notes: String
  },
  financial: {
    totalValue: { type: Number, required: 0 },
    journalEntryId: String,
    glAccount: String,
    taxImpact: Number
  },
  documentation: {
    photos: [String],
    documents: [String],
    witnessStatements: [String],
    policeReport: String,
    insuranceClaim: String
  },
  followUp: {
    investigationRequired: { type: Boolean, default: false },
    investigatedBy: String,
    investigationNotes: String,
    preventiveActions: [String]
  }
}, { timestamps: true });

const ReorderPointSchema = new Schema<IReorderPoint>({
  pointId: { type: String, required: true, unique: true, index: true },
  productId: { type: String, required: true, index: true },
  sku: { type: String, required: true },
  warehouseId: { type: String, required: true, index: true },
  currentMethod: { type: String, required: true, enum: ['fixed', 'dynamic', 'statistical', 'ml_based'], default: 'fixed' },
  settings: {
    reorderPoint: { type: Number, required: true, min: 0 },
    safetyStock: { type: Number, required: true, min: 0 },
    leadTime: { type: Number, required: true, min: 0 },
    demandForecast: { type: Number, required: true, min: 0 },
    serviceLevel: { type: Number, required: true, min: 0, max: 100 },
    reviewPeriod: { type: Number, required: true, min: 1 },
    orderQuantity: { type: Number, required: true, min: 1 },
    maxStock: { type: Number, required: true, min: 0 }
  },
  calculations: {
    averageDailyDemand: { type: Number, required: true, min: 0 },
    demandVariability: { type: Number, required: true, min: 0 },
    leadTimeVariability: { type: Number, required: true, min: 0 },
    stockoutCost: { type: Number, required: 0 },
    holdingCost: { type: Number, required: 0 },
    orderingCost: { type: Number, required: 0 }
  },
  optimization: {
    recommendedReorderPoint: { type: Number, required: 0 },
    recommendedSafetyStock: { type: Number, required: 0 },
    recommendedOrderQuantity: { type: Number, required: 0 },
    potentialSavings: { type: Number, required: 0 },
    serviceLevelImpact: { type: Number, required: 0 }
  },
  history: [{
    date: { type: Date, required: true },
    previousPoint: { type: Number, required: true },
    newPoint: { type: Number, required: true },
    reason: { type: String, required: true },
    changedBy: { type: String, required: true },
    method: { type: String, required: true }
  }],
  alerts: {
    lowStockAlert: { type: Boolean, default: false },
    overstockAlert: { type: Boolean, default: false },
    stockoutRisk: { type: Number, default: 0 },
    daysOfStock: { type: Number, default: 0 }
  },
  lastCalculated: { type: Date, required: true },
  nextReviewDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Indexes
WarehouseSchema.index({ 'location.city': 1, 'location.state': 1 });
WarehouseSchema.index({ status: 1 });
WarehouseSchema.index({ type: 1 });

InventoryItemSchema.index({ warehouseId: 1, productId: 1 });
InventoryItemSchema.index({ warehouseId: 1, sku: 1 });
InventoryItemSchema.index({ warehouseId: 1, zoneId: 1 });
InventoryItemSchema.index({ status: 1 });
InventoryItemSchema.index({ 'alerts.type': 1, 'alerts.severity': 1 });
InventoryItemSchema.index({ 'storage.expiryDate': 1 });

StockTransferSchema.index({ fromWarehouseId: 1, toWarehouseId: 1 });
StockTransferSchema.index({ status: 1 });
StockTransferSchema.index({ transferDate: -1 });
StockTransferSchema.index({ priority: 1 });

CycleCountSchema.index({ warehouseId: 1, status: 1 });
CycleCountSchema.index({ scheduledDate: 1 });
CycleCountSchema.index({ assignedTo: 1 });

InventoryAdjustmentSchema.index({ warehouseId: 1, status: 1 });
InventoryAdjustmentSchema.index({ adjustmentType: 1 });
InventoryAdjustmentSchema.index({ requestedAt: -1 });

ReorderPointSchema.index({ productId: 1, warehouseId: 1 });
ReorderPointSchema.index({ warehouseId: 1, 'alerts.lowStockAlert': 1 });
ReorderPointSchema.index({ nextReviewDate: 1 });

// Models
export const Warehouse = mongoose.model<IWarehouse>('Warehouse', WarehouseSchema);
export const InventoryItem = mongoose.model<IInventoryItem>('InventoryItem', InventoryItemSchema);
export const StockTransfer = mongoose.model<IStockTransfer>('StockTransfer', StockTransferSchema);
export const CycleCount = mongoose.model<ICycleCount>('CycleCount', CycleCountSchema);
export const InventoryAdjustment = mongoose.model<IInventoryAdjustment>('InventoryAdjustment', InventoryAdjustmentSchema);
export const ReorderPoint = mongoose.model<IReorderPoint>('ReorderPoint', ReorderPointSchema);
