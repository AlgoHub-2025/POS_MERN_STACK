import mongoose, { Schema, Document } from 'mongoose';

// Purchase Order Schema
export interface IPurchaseOrder extends Document {
  purchaseOrderId: string;
  orderNumber: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'sent' | 'acknowledged' | 'rejected' | 'partially_received' | 'received' | 'closed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type: 'standard' | 'blanket' | 'contract' | 'emergency' | 'stock_replenishment';
  
  // Supplier Information
  supplier: {
    supplierId: string;
    name: string;
    contactPerson: {
      name: string;
      email: string;
      phone: string;
      title: string;
    };
    billingAddress: {
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
  };
  
  // Requester Information
  requester: {
    userId: string;
    name: string;
    email: string;
    department: string;
    costCenter: string;
  };
  
  // Order Details
  orderDate: Date;
  requestedDeliveryDate: Date;
  promisedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  
  // Line Items
  items: Array<{
    itemId: string;
    productId: string;
    productName: string;
    sku: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
    discountAmount: number;
    taxAmount: number;
    receivedQuantity: number;
    remainingQuantity: number;
    backorderQuantity: number;
    specifications?: string;
    manufacturer?: string;
    model?: string;
    partNumber?: string;
    deliveryDate: Date;
    deliveryLocation: string;
    receivingLocation: string;
    inspectionRequired: boolean;
    warrantyPeriod?: number; // months
    trackingNumbers: string[];
    notes?: string;
  }>;
  
  // Financial Information
  totals: {
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    shippingAmount: number;
    handlingAmount: number;
    otherCosts: number;
    totalAmount: number;
    currency: string;
    paymentTerms: string;
    incoterms: string;
  };
  
  // Shipping Information
  shipping: {
    method: string;
    carrier: string;
    trackingNumber: string;
    shippingTerms: string;
    deliveryInstructions: string;
    partialDeliveryAllowed: boolean;
    deliveryWindow: {
      startTime: string;
      endTime: string;
    };
    freightCost: number;
    insuranceCost: number;
  };
  
  // Approval Information
  approvals: Array<{
    level: number;
    role: string;
    userId: string;
    name: string;
    status: 'pending' | 'approved' | 'rejected';
    date?: Date;
    comments?: string;
  }>;
  
  // Attachments
  attachments: Array<{
    attachmentId: string;
    name: string;
    type: 'quote' | 'specification' | 'drawing' | 'catalog' | 'contract' | 'other';
    url: string;
    uploadedAt: Date;
    uploadedBy: string;
    description: string;
    size: number;
  }>;
  
  // Notes and History
  notes: Array<{
    noteId: string;
    content: string;
    createdBy: string;
    createdAt: Date;
    type: 'internal' | 'external' | 'system';
  }>;
  
  history: Array<{
    date: Date;
    action: string;
    performedBy: string;
    details: string;
    previousStatus?: string;
    newStatus?: string;
  }>;
  
  // Metadata
  tags: string[];
  source: 'manual' | 'system' | 'integration';
  integrationId?: string;
  
  // Timestamps
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  sentAt?: Date;
  approvedAt?: Date;
  closedAt?: Date;
}

// Purchase Receipt Schema
export interface IPurchaseReceipt extends Document {
  receiptId: string;
  receiptNumber: string;
  purchaseOrderId: string;
  purchaseOrderNumber: string;
  
  // Receipt Information
  receiptDate: Date;
  receivedBy: string;
  receiverName: string;
  receiverDepartment: string;
  
  // Supplier Information
  supplier: {
    supplierId: string;
    name: string;
    shipmentNumber?: string;
    invoiceNumber?: string;
  };
  
  // Shipping Information
  shipping: {
    carrier: string;
    trackingNumber: string;
    billOfLading?: string;
    freightCost?: number;
    shippingDate: Date;
    estimatedDelivery?: Date;
  };
  
  // Received Items
  items: Array<{
    itemId: string;
    productId: string;
    productName: string;
    sku: string;
    orderedQuantity: number;
    receivedQuantity: number;
    backorderQuantity: number;
    damagedQuantity: number;
    unitCost: number;
    totalCost: number;
    condition: 'good' | 'damaged' | 'defective' | 'missing';
    inspected: boolean;
    inspectionResult?: 'passed' | 'failed' | 'conditional';
    inspectionDate?: Date;
    inspector?: string;
    inspectionNotes?: string;
    location: string;
    binLocation?: string;
    lotNumber?: string;
    expiryDate?: Date;
    serialNumbers?: string[];
    notes?: string;
    photos?: string[];
  }>;
  
  // Quality Control
  qualityControl: {
    inspectionRequired: boolean;
    inspectedBy?: string;
    inspectionDate?: Date;
    overallResult: 'passed' | 'failed' | 'conditional';
    totalDefects: number;
    majorDefects: number;
    minorDefects: number;
    notes?: string;
  };
  
  // Discrepancies
  discrepancies: Array<{
    discrepancyId: string;
    itemId: string;
    type: 'shortage' | 'overage' | 'damage' | 'wrong_item' | 'quality_issue';
    description: string;
    quantity: number;
    value: number;
    resolution: string;
    status: 'open' | 'resolved' | 'escalated' | 'credited';
    reportedDate: Date;
    resolvedDate?: Date;
    resolvedBy?: string;
    photos?: string[];
    notes?: string;
  }>;
  
  // Financial Information
  totals: {
    totalItems: number;
    totalValue: number;
    damagedValue: number;
    taxAmount: number;
  };
  
  // Status
  status: 'pending' | 'partial' | 'complete' | 'disputed' | 'closed';
  
  // Attachments
  attachments: Array<{
    attachmentId: string;
    name: string;
    type: 'photo' | 'document' | 'inspection_report' | 'other';
    url: string;
    uploadedAt: Date;
    uploadedBy: string;
    description: string;
  }>;
  
  // Notes
  notes: Array<{
    noteId: string;
    content: string;
    createdBy: string;
    createdAt: Date;
  }>;
  
  // Timestamps
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

// Purchase Invoice Schema
export interface IPurchaseInvoice extends Document {
  invoiceId: string;
  invoiceNumber: string;
  purchaseOrderId: string;
  purchaseOrderNumber: string;
  
  // Invoice Information
  invoiceDate: Date;
  dueDate: Date;
  status: 'draft' | 'received' | 'verified' | 'approved' | 'paid' | 'overdue' | 'disputed' | 'cancelled';
  
  // Supplier Information
  supplier: {
    supplierId: string;
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
  };
  
  // Invoice Details
  currency: string;
  exchangeRate?: number;
  
  // Line Items
  items: Array<{
    itemId: string;
    productId: string;
    productName: string;
    sku: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
    taxAmount: number;
    discountAmount: number;
    poItemId: string;
    receivedQuantity: number;
    invoicedQuantity: number;
  }>;
  
  // Financial Information
  totals: {
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    shippingAmount: number;
    handlingAmount: number;
    otherCosts: number;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
  };
  
  // Tax Information
  tax: {
    taxId: string;
    taxRate: number;
    taxAmount: number;
    exempt: boolean;
    reverseCharge: boolean;
  };
  
  // Payment Information
  payment: {
    terms: string;
    method: string;
    status: 'pending' | 'partial' | 'paid' | 'overdue';
    paidAmount: number;
    paymentDate?: Date;
    paymentReference?: string;
    scheduledPayments: Array<{
      paymentId: string;
      amount: number;
      dueDate: Date;
      status: 'scheduled' | 'paid' | 'overdue';
      paidDate?: Date;
    }>;
  };
  
  // Matching Information
  matching: {
    threeWayMatch: boolean;
    poMatched: boolean;
    receiptMatched: boolean;
    varianceAmount: number;
    variancePercentage: number;
    matchedItems: number;
    totalItems: number;
    matchingDate?: Date;
    matchedBy?: string;
  };
  
  // Approval Information
  approvals: Array<{
    level: number;
    role: string;
    userId: string;
    name: string;
    status: 'pending' | 'approved' | 'rejected';
    date?: Date;
    comments?: string;
  }>;
  
  // Attachments
  attachments: Array<{
    attachmentId: string;
    name: string;
    type: 'invoice' | 'receipt' | 'packing_list' | 'other';
    url: string;
    uploadedAt: Date;
    uploadedBy: string;
    description: string;
  }>;
  
  // Notes
  notes: Array<{
    noteId: string;
    content: string;
    createdBy: string;
    createdAt: Date;
    type: 'internal' | 'external';
  }>;
  
  // OCR Data (if processed through OCR)
  ocrData?: {
    processedAt: Date;
    confidence: number;
    extractedFields: Record<string, any>;
    rawText?: string;
  };
  
  // Timestamps
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  verifiedAt?: Date;
  verifiedBy?: string;
  approvedAt?: Date;
  approvedBy?: string;
  paidAt?: Date;
}

// Purchase Return Schema
export interface IPurchaseReturn extends Document {
  returnId: string;
  returnNumber: string;
  returnOrderNumber: string;
  purchaseOrderId: string;
  purchaseOrderNumber: string;
  invoiceId?: string;
  invoiceNumber?: string;
  
  // Return Information
  returnDate: Date;
  returnReason: string;
  returnMethod: 'credit' | 'replacement' | 'repair' | 'refund';
  status: 'requested' | 'approved' | 'rejected' | 'in_transit' | 'received' | 'processed' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Supplier Information
  supplier: {
    supplierId: string;
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    returnAddress: {
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
  };
  
  // Returned Items
  items: Array<{
    itemId: string;
    productId: string;
    productName: string;
    sku: string;
    originalQuantity: number;
    returnedQuantity: number;
    unitCost: number;
    totalCost: number;
    reason: string;
    condition: 'new' | 'used' | 'damaged' | 'defective';
    restockable: boolean;
    creditAmount: number;
    replacementItem?: {
      productId: string;
      quantity: number;
      expectedDate: Date;
    };
    serialNumbers?: string[];
    lotNumber?: string;
    expiryDate?: Date;
    notes?: string;
    photos?: string[];
  }>;
  
  // Financial Information
  totals: {
    totalItems: number;
    totalValue: number;
    creditAmount: number;
    restockFee: number;
    shippingCost: number;
    netCredit: number;
    currency: string;
  };
  
  // Approval Information
  approvals: Array<{
    level: number;
    role: string;
    userId: string;
    name: string;
    status: 'pending' | 'approved' | 'rejected';
    date?: Date;
    comments?: string;
  }>;
  
  // Shipping Information
  shipping: {
    method: string;
    carrier: string;
    trackingNumber: string;
    shippedDate?: Date;
    expectedDeliveryDate?: Date;
    actualDeliveryDate?: Date;
    shippingCost: number;
    insuranceCost: number;
    returnInstructions: string;
  };
  
  // Resolution Information
  resolution: {
    type: 'credit' | 'replacement' | 'refund' | 'repair';
    creditNoteNumber?: string;
    creditAmount: number;
    creditDate?: Date;
    replacementItems: Array<{
      productId: string;
      quantity: number;
      expectedDate: Date;
      receivedDate?: Date;
    }>;
    refundAmount: number;
    refundDate?: Date;
    refundReference?: string;
    notes?: string;
  };
  
  // Attachments
  attachments: Array<{
    attachmentId: string;
    name: string;
    type: 'photo' | 'document' | 'shipping_label' | 'other';
    url: string;
    uploadedAt: Date;
    uploadedBy: string;
    description: string;
  }>;
  
  // Notes
  notes: Array<{
    noteId: string;
    content: string;
    createdBy: string;
    createdAt: Date;
    type: 'internal' | 'external';
  }>;
  
  // Communication Log
  communications: Array<{
    communicationId: string;
    date: Date;
    type: 'email' | 'phone' | 'portal' | 'other';
    direction: 'incoming' | 'outgoing';
    recipient: string;
    subject: string;
    content: string;
    attachments?: string[];
  }>;
  
  // Timestamps
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  approvedAt?: Date;
  approvedBy?: string;
  completedAt?: Date;
}

// Mongoose Schemas
const PurchaseOrderSchema = new Schema<IPurchaseOrder>({
  purchaseOrderId: { type: String, required: true, unique: true },
  orderNumber: { type: String, required: true, unique: true },
  status: { 
    type: String, 
    enum: ['draft', 'pending_approval', 'approved', 'sent', 'acknowledged', 'rejected', 'partially_received', 'received', 'closed', 'cancelled'],
    default: 'draft'
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  type: { 
    type: String, 
    enum: ['standard', 'blanket', 'contract', 'emergency', 'stock_replenishment'],
    default: 'standard'
  },
  
  supplier: {
    supplierId: { type: String, required: true },
    name: { type: String, required: true },
    contactPerson: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      title: { type: String }
    },
    billingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      postalCode: { type: String, required: true }
    },
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      postalCode: { type: String, required: true }
    }
  },
  
  requester: {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    department: { type: String, required: true },
    costCenter: { type: String, required: true }
  },
  
  orderDate: { type: Date, required: true },
  requestedDeliveryDate: { type: Date, required: true },
  promisedDeliveryDate: { type: Date },
  actualDeliveryDate: { type: Date },
  
  items: [{
    itemId: { type: String, required: true },
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    sku: { type: String, required: true },
    description: { type: String },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    receivedQuantity: { type: Number, default: 0 },
    remainingQuantity: { type: Number, required: true },
    backorderQuantity: { type: Number, default: 0 },
    specifications: { type: String },
    manufacturer: { type: String },
    model: { type: String },
    partNumber: { type: String },
    deliveryDate: { type: Date, required: true },
    deliveryLocation: { type: String, required: true },
    receivingLocation: { type: String, required: true },
    inspectionRequired: { type: Boolean, default: false },
    warrantyPeriod: { type: Number },
    trackingNumbers: [{ type: String }],
    notes: { type: String }
  }],
  
  totals: {
    subtotal: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    shippingAmount: { type: Number, default: 0 },
    handlingAmount: { type: Number, default: 0 },
    otherCosts: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    paymentTerms: { type: String, default: 'NET30' },
    incoterms: { type: String, default: 'FOB' }
  },
  
  shipping: {
    method: { type: String, required: true },
    carrier: { type: String },
    trackingNumber: { type: String },
    shippingTerms: { type: String },
    deliveryInstructions: { type: String },
    partialDeliveryAllowed: { type: Boolean, default: false },
    deliveryWindow: {
      startTime: { type: String },
      endTime: { type: String }
    },
    freightCost: { type: Number, default: 0 },
    insuranceCost: { type: Number, default: 0 }
  },
  
  approvals: [{
    level: { type: Number, required: true },
    role: { type: String, required: true },
    userId: { type: String, required: true },
    name: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    date: { type: Date },
    comments: { type: String }
  }],
  
  attachments: [{
    attachmentId: { type: String, required: true },
    name: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['quote', 'specification', 'drawing', 'catalog', 'contract', 'other'],
      required: true
    },
    url: { type: String, required: true },
    uploadedAt: { type: Date, required: true },
    uploadedBy: { type: String, required: true },
    description: { type: String },
    size: { type: Number }
  }],
  
  notes: [{
    noteId: { type: String, required: true },
    content: { type: String, required: true },
    createdBy: { type: String, required: true },
    createdAt: { type: Date, required: true },
    type: { 
      type: String, 
      enum: ['internal', 'external', 'system'],
      default: 'internal'
    }
  }],
  
  history: [{
    date: { type: Date, required: true },
    action: { type: String, required: true },
    performedBy: { type: String, required: true },
    details: { type: String, required: true },
    previousStatus: { type: String },
    newStatus: { type: String }
  }],
  
  tags: [{ type: String }],
  source: { 
    type: String, 
    enum: ['manual', 'system', 'integration'],
    default: 'manual'
  },
  integrationId: { type: String },
  
  createdAt: { type: Date, required: true },
  createdBy: { type: String, required: true },
  updatedAt: { type: Date, required: true },
  updatedBy: { type: String, required: true },
  sentAt: { type: Date },
  approvedAt: { type: Date },
  closedAt: { type: Date }
}, { timestamps: true });

// Add indexes
PurchaseOrderSchema.index({ purchaseOrderId: 1 });
PurchaseOrderSchema.index({ orderNumber: 1 });
PurchaseOrderSchema.index({ status: 1 });
PurchaseOrderSchema.index({ 'supplier.supplierId': 1 });
PurchaseOrderSchema.index({ orderDate: 1 });
PurchaseOrderSchema.index({ requestedDeliveryDate: 1 });
PurchaseOrderSchema.index({ 'requester.userId': 1 });

export const PurchaseOrder = mongoose.model<IPurchaseOrder>('PurchaseOrder', PurchaseOrderSchema);

// Create other models similarly...
export { PurchaseReceipt, PurchaseInvoice, PurchaseReturn };
