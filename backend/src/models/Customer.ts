import mongoose, { Schema, Document as MongoDocument } from 'mongoose';

// Custom field interface
interface ICustomField {
  fieldId: string;
  fieldName: string;
  fieldType: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect';
  value: any;
  isRequired: boolean;
}

// Address interface
interface IAddress {
  type: 'billing' | 'shipping' | 'both';
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

// Communication history interface
interface ICommunicationHistory {
  id: string;
  type: 'email' | 'sms' | 'phone' | 'inapp' | 'mail';
  direction: 'inbound' | 'outbound';
  subject?: string;
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'failed' | 'opened' | 'clicked';
  employeeId?: string;
  automated: boolean;
}

// Customer note interface
interface ICustomerNote {
  id: string;
  note: string;
  createdBy: string;
  createdAt: Date;
  isPrivate: boolean;
  category: 'general' | 'complaint' | 'compliment' | 'issue' | 'followup';
  tags: string[];
}

// Document interface
interface ICustomerDocument {
  id: string;
  name: string;
  type: 'id' | 'contract' | 'agreement' | 'photo' | 'other';
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
  expiresAt?: Date;
  isVerified: boolean;
}

// Customer segment interface
interface ICustomerSegment {
  segmentId: string;
  name: string;
  assignedAt: Date;
  assignedBy: string;
  autoAssigned: boolean;
}

// Customer interface
export interface ICustomer extends MongoDocument {
  // Basic Information
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  
  // Personal Details
  dateOfBirth?: Date;
  anniversaryDate?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  preferredLanguage: string;
  timezone: string;
  
  // Addresses
  addresses: IAddress[];
  
  // Business Information
  companyName?: string;
  taxId?: string;
  businessType?: 'individual' | 'corporate' | 'nonprofit' | 'government';
  creditLimit?: number;
  terms?: string;
  
  // Custom Fields
  customFields: ICustomField[];
  
  // Tags and Segments
  tags: string[];
  segments: ICustomerSegment[];
  
  // Status and Workflow
  status: 'lead' | 'prospect' | 'active' | 'inactive' | 'archived' | 'blocked';
  statusHistory: Array<{
    status: string;
    changedAt: Date;
    changedBy: string;
    reason?: string;
  }>;
  
  // Communication
  communicationHistory: ICommunicationHistory[];
  emailConsent: boolean;
  smsConsent: boolean;
  phoneConsent: boolean;
  marketingConsent: boolean;
  
  // Notes
  notes: ICustomerNote[];
  
  // Documents
  documents: ICustomerDocument[];
  
  // Loyalty Information
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'none';
  loyaltyPoints: number;
  loyaltyMemberSince?: Date;
  
  // Preferences
  preferredContactMethod: 'email' | 'sms' | 'phone' | 'inapp';
  preferredStore?: string;
  notificationPreferences: {
    promotions: boolean;
    orderUpdates: boolean;
    loyaltyUpdates: boolean;
    birthdayOffers: boolean;
    newsletters: boolean;
  };
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  lastContactAt?: Date;
  source: 'walkin' | 'website' | 'referral' | 'social' | 'import' | 'api' | 'other';
  referredBy?: string;
  
  // Analytics
  totalSpent: number;
  orderCount: number;
  averageOrderValue: number;
  lastPurchaseAt?: Date;
  lifetimeValue: number;
  churnRisk: 'low' | 'medium' | 'high';
  
  // Duplicate Management
  isDuplicate: boolean;
  duplicateOf?: string;
  mergeHistory: Array<{
    mergedFrom: string;
    mergedAt: Date;
    mergedBy: string;
  }>;
}

// Customer Schema
const CustomerSchema = new Schema<ICustomer>({
  // Basic Information
  customerId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  phone: {
    type: String,
    required: true,
    index: true
  },
  alternatePhone: String,
  
  // Personal Details
  dateOfBirth: Date,
  anniversaryDate: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say']
  },
  preferredLanguage: {
    type: String,
    default: 'en'
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  
  // Addresses
  addresses: [{
    type: {
      type: String,
      enum: ['billing', 'shipping', 'both'],
      required: true
    },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
    isDefault: { type: Boolean, default: false }
  }],
  
  // Business Information
  companyName: String,
  taxId: String,
  businessType: {
    type: String,
    enum: ['individual', 'corporate', 'nonprofit', 'government']
  },
  creditLimit: Number,
  terms: String,
  
  // Custom Fields
  customFields: [{
    fieldId: { type: String, required: true },
    fieldName: { type: String, required: true },
    fieldType: {
      type: String,
      enum: ['text', 'number', 'date', 'boolean', 'select', 'multiselect'],
      required: true
    },
    value: Schema.Types.Mixed,
    isRequired: { type: Boolean, default: false }
  }],
  
  // Tags and Segments
  tags: [String],
  segments: [{
    segmentId: { type: String, required: true },
    name: { type: String, required: true },
    assignedAt: { type: Date, default: Date.now },
    assignedBy: { type: String, required: true },
    autoAssigned: { type: Boolean, default: false }
  }],
  
  // Status and Workflow
  status: {
    type: String,
    enum: ['lead', 'prospect', 'active', 'inactive', 'archived', 'blocked'],
    default: 'lead',
    index: true
  },
  statusHistory: [{
    status: { type: String, required: true },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: String, required: true },
    reason: String
  }],
  
  // Communication
  communicationHistory: [{
    id: { type: String, required: true },
    type: {
      type: String,
      enum: ['email', 'sms', 'phone', 'inapp', 'mail'],
      required: true
    },
    direction: {
      type: String,
      enum: ['inbound', 'outbound'],
      required: true
    },
    subject: String,
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'failed', 'opened', 'clicked'],
      default: 'sent'
    },
    employeeId: String,
    automated: { type: Boolean, default: false }
  }],
  
  emailConsent: { type: Boolean, default: true },
  smsConsent: { type: Boolean, default: true },
  phoneConsent: { type: Boolean, default: true },
  marketingConsent: { type: Boolean, default: false },
  
  // Notes
  notes: [{
    id: { type: String, required: true },
    note: { type: String, required: true },
    createdBy: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    isPrivate: { type: Boolean, default: false },
    category: {
      type: String,
      enum: ['general', 'complaint', 'compliment', 'issue', 'followup'],
      default: 'general'
    },
    tags: [String]
  }],
  
  // Documents
  documents: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['id', 'contract', 'agreement', 'photo', 'other'],
      required: true
    },
    url: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: { type: String, required: true },
    expiresAt: Date,
    isVerified: { type: Boolean, default: false }
  }],
  
  // Loyalty Information
  loyaltyTier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum', 'none'],
    default: 'none'
  },
  loyaltyPoints: { type: Number, default: 0 },
  loyaltyMemberSince: Date,
  
  // Preferences
  preferredContactMethod: {
    type: String,
    enum: ['email', 'sms', 'phone', 'inapp'],
    default: 'email'
  },
  preferredStore: String,
  notificationPreferences: {
    promotions: { type: Boolean, default: true },
    orderUpdates: { type: Boolean, default: true },
    loyaltyUpdates: { type: Boolean, default: true },
    birthdayOffers: { type: Boolean, default: true },
    newsletters: { type: Boolean, default: false }
  },
  
  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: { type: String, required: true },
  updatedBy: { type: String, required: true },
  lastContactAt: Date,
  source: {
    type: String,
    enum: ['walkin', 'website', 'referral', 'social', 'import', 'api', 'other'],
    default: 'walkin'
  },
  referredBy: String,
  
  // Analytics
  totalSpent: { type: Number, default: 0 },
  orderCount: { type: Number, default: 0 },
  averageOrderValue: { type: Number, default: 0 },
  lastPurchaseAt: Date,
  lifetimeValue: { type: Number, default: 0 },
  churnRisk: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  },
  
  // Duplicate Management
  isDuplicate: { type: Boolean, default: false },
  duplicateOf: String,
  mergeHistory: [{
    mergedFrom: { type: String, required: true },
    mergedAt: { type: Date, default: Date.now },
    mergedBy: { type: String, required: true }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
CustomerSchema.index({ email: 1, phone: 1 });
CustomerSchema.index({ status: 1, createdAt: -1 });
CustomerSchema.index({ tags: 1 });
CustomerSchema.index({ 'segments.segmentId': 1 });
CustomerSchema.index({ loyaltyTier: 1 });
CustomerSchema.index({ totalSpent: -1 });
CustomerSchema.index({ lastPurchaseAt: -1 });
CustomerSchema.index({ churnRisk: 1 });

// Virtuals
CustomerSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

CustomerSchema.virtual('primaryAddress').get(function() {
  return this.addresses.find(addr => addr.isDefault) || this.addresses[0];
});

CustomerSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Pre-save middleware
CustomerSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Update average order value
  if (this.orderCount > 0) {
    this.averageOrderValue = this.totalSpent / this.orderCount;
  }
  
  next();
});

// Static methods
CustomerSchema.statics.generateCustomerId = function(): string {
  const prefix = 'CUST';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

CustomerSchema.statics.findByEmailOrPhone = function(email: string, phone: string) {
  return this.findOne({
    $or: [
      { email: email.toLowerCase() },
      { phone: phone },
      { alternatePhone: phone }
    ]
  });
};

CustomerSchema.statics.findDuplicates = function() {
  return this.aggregate([
    {
      $group: {
        _id: { email: '$email', phone: '$phone' },
        customers: { $push: '$$ROOT' },
        count: { $sum: 1 }
      }
    },
    {
      $match: { count: { $gt: 1 } }
    }
  ]);
};

// Instance methods
CustomerSchema.methods.addCommunication = function(
  type: string,
  content: string,
  direction: string = 'outbound',
  employeeId?: string,
  subject?: string
) {
  const communication = {
    id: new mongoose.Types.ObjectId().toString(),
    type,
    direction,
    content,
    subject,
    timestamp: new Date(),
    employeeId,
    automated: !employeeId
  };
  
  this.communicationHistory.push(communication);
  this.lastContactAt = new Date();
  return this.save();
};

CustomerSchema.methods.addNote = function(
  note: string,
  createdBy: string,
  isPrivate: boolean = false,
  category: string = 'general',
  tags: string[] = []
) {
  const customerNote = {
    id: new mongoose.Types.ObjectId().toString(),
    note,
    createdBy,
    createdAt: new Date(),
    isPrivate,
    category,
    tags
  };
  
  this.notes.push(customerNote);
  return this.save();
};

CustomerSchema.methods.updateStatus = function(
  newStatus: string,
  changedBy: string,
  reason?: string
) {
  this.statusHistory.push({
    status: newStatus,
    changedAt: new Date(),
    changedBy,
    reason
  });
  
  this.status = newStatus;
  return this.save();
};

CustomerSchema.methods.addLoyaltyPoints = function(points: number, reason: string) {
  this.loyaltyPoints += points;
  
  // Update tier based on points
  if (this.loyaltyPoints >= 10000) {
    this.loyaltyTier = 'platinum';
  } else if (this.loyaltyPoints >= 5000) {
    this.loyaltyTier = 'gold';
  } else if (this.loyaltyPoints >= 2000) {
    this.loyaltyTier = 'silver';
  } else if (this.loyaltyPoints >= 500) {
    this.loyaltyTier = 'bronze';
  }
  
  return this.save();
};

CustomerSchema.methods.updatePurchaseAnalytics = function(orderAmount: number) {
  this.totalSpent += orderAmount;
  this.orderCount += 1;
  this.averageOrderValue = this.totalSpent / this.orderCount;
  this.lastPurchaseAt = new Date();
  
  // Update lifetime value (simplified calculation)
  this.lifetimeValue = this.totalSpent * 1.2; // 20% margin assumption
  
  // Update churn risk based on purchase frequency
  const daysSinceLastPurchase = (Date.now() - this.lastPurchaseAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceLastPurchase > 90) {
    this.churnRisk = 'high';
  } else if (daysSinceLastPurchase > 60) {
    this.churnRisk = 'medium';
  } else {
    this.churnRisk = 'low';
  }
  
  return this.save();
};

export const Customer = mongoose.model<ICustomer>('Customer', CustomerSchema);
export default Customer;
