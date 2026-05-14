import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ExpenseAttachment {
  attachmentId: string;
  name: string;
  type: 'receipt' | 'invoice' | 'document' | 'image' | 'other';
  url: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
  uploadedBy: Types.ObjectId;
  description?: string;
  isPrimary: boolean; // Primary receipt for the expense
}

export interface ExpenseSplit {
  splitId: string;
  categoryId: Types.ObjectId;
  categoryName: string;
  amount: number;
  percentage: number;
  description?: string;
  customFields?: Record<string, any>;
}

export interface ExpenseTag {
  tagId: string;
  name: string;
  color: string;
  category: 'project' | 'client' | 'location' | 'purpose' | 'custom';
}

export interface MileageInfo {
  startLocation: {
    address: string;
    latitude?: number;
    longitude?: number;
    odometerStart: number;
  };
  endLocation: {
    address: string;
    latitude?: number;
    longitude?: number;
    odometerEnd: number;
  };
  distance: {
    miles: number;
    kilometers: number;
    method: 'manual' | 'gps' | 'odometer';
  };
  rate: number; // rate per mile/km
  totalAmount: number;
  purpose: string;
  vehicleInfo?: {
    vehicleId?: string;
    make?: string;
    model?: string;
    year?: number;
    licensePlate?: string;
  };
  routeOptimized: boolean;
  stops?: Array<{
    location: string;
    purpose: string;
    timestamp: Date;
  }>;
}

export interface PerDiemInfo {
  location: {
    city: string;
    state: string;
    country: string;
    perDiemRate: number;
  };
  dates: {
    startDate: Date;
    endDate: Date;
    totalDays: number;
    partialDays: Array<{
      date: Date;
      percentage: number; // 25%, 50%, 75%
      reason: string;
    }>;
  };
  breakdown: {
    breakfast: number;
    lunch: number;
    dinner: number;
    incidentals: number;
    total: number;
  };
  actualExpenses?: {
    meals: number;
    lodging: number;
    incidentals: number;
    total: number;
  };
  providedMeals: Array<{
    date: Date;
    mealType: 'breakfast' | 'lunch' | 'dinner';
    provider: string;
  }>;
}

export interface IExpense extends Document {
  expenseId: string;
  employeeId: Types.ObjectId;
  employeeName: string;
  employeeEmail: string;
  department: string;
  costCenter?: string;
  
  // Basic Information
  title: string;
  description?: string;
  date: Date;
  location?: string;
  currency: string;
  exchangeRate?: number;
  
  // Financial Information
  amount: number;
  taxAmount?: number;
  totalAmount: number;
  originalAmount?: number; // For foreign currency expenses
  reimbursementAmount?: number;
  
  // Category and Splitting
  categoryId: Types.ObjectId;
  categoryName: string;
  splits?: ExpenseSplit[];
  
  // Payment Information
  paymentMethod: 'cash' | 'personal_card' | 'corporate_card' | 'company_account' | 'advance' | 'other';
  cardInfo?: {
    last4: string;
    cardType: string;
    transactionId?: string;
    merchantCategoryCode?: string;
  };
  reimbursable: boolean;
  reimbursed: boolean;
  reimbursedAt?: Date;
  reimbursedAmount?: number;
  
  // Receipt Information
  receiptRequired: boolean;
  receiptProvided: boolean;
  attachments: ExpenseAttachment[];
  receiptVerified: boolean;
  receiptVerificationDate?: Date;
  receiptVerifiedBy?: Types.ObjectId;
  ocrProcessed: boolean;
  ocrData?: {
    merchant?: string;
    date?: Date;
    amount?: number;
    tax?: number;
    confidence?: number;
    rawText?: string;
  };
  
  // Special Expense Types
  mileageInfo?: MileageInfo;
  perDiemInfo?: PerDiemInfo;
  
  // Approval Workflow
  status: 'draft' | 'submitted' | 'pending_approval' | 'approved' | 'rejected' | 'paid' | 'archived';
  submittedAt?: Date;
  submittedBy?: Types.ObjectId;
  approvals: Array<{
    approvalId: string;
    level: number;
    approverId: Types.ObjectId;
    approverName: string;
    approverRole: string;
    status: 'pending' | 'approved' | 'rejected';
    date?: Date;
    comments?: string;
    delegatedTo?: Types.ObjectId;
  }>;
  rejectionReason?: string;
  rejectionDetails?: {
    reason: string;
    category: 'policy' | 'documentation' | 'amount' | 'other';
    requiresResubmission: boolean;
    resubmissionDeadline?: Date;
  };
  
  // Policy and Compliance
  policyViolations: Array<{
    violationId: string;
    policyId: string;
    policyName: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    action: 'warning' | 'block' | 'escalate';
    acknowledged: boolean;
    acknowledgedAt?: Date;
    acknowledgedBy?: Types.ObjectId;
  }>;
  complianceScore: number; // 0-100
  requiresAttention: boolean;
  
  // Tags and Classification
  tags: ExpenseTag[];
  customFields: Record<string, any>;
  projectCode?: string;
  clientCode?: string;
  billable: boolean;
  billableTo?: string;
  
  // Reporting and Analytics
  reportId?: string;
  reportName?: string;
  reportPeriod?: {
    startDate: Date;
    endDate: Date;
  };
  
  // Audit Trail
  auditTrail: Array<{
    timestamp: Date;
    action: string;
    performedBy: Types.ObjectId;
    details: string;
    previousValues?: Record<string, any>;
    newValues?: Record<string, any>;
  }>;
  
  // System Information
  source: 'manual' | 'mobile_app' | 'email' | 'ocr' | 'card_import' | 'recurring' | 'api';
  sourceReference?: string;
  importedAt?: Date;
  lastModifiedAt: Date;
  lastModifiedBy: Types.ObjectId;
  
  // Metadata
  metadata: {
    createdAt: Date;
    createdBy: Types.ObjectId;
    updatedAt: Date;
    updatedBy: Types.ObjectId;
    version: number;
    archivedAt?: Date;
    archivedBy?: Types.ObjectId;
    deletedAt?: Date;
    deletedBy?: Types.ObjectId;
  };
}

const ExpenseSchema = new Schema<IExpense>({
  expenseId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  employeeName: {
    type: String,
    required: true,
    trim: true
  },
  employeeEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  department: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  costCenter: {
    type: String,
    trim: true,
    index: true
  },
  
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  location: {
    type: String,
    trim: true,
    maxlength: 200
  },
  currency: {
    type: String,
    required: true,
    uppercase: true,
    default: 'USD'
  },
  exchangeRate: {
    type: Number,
    default: 1.0
  },
  
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  taxAmount: {
    type: Number,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  originalAmount: {
    type: Number,
    min: 0
  },
  reimbursementAmount: {
    type: Number,
    min: 0
  },
  
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'ExpenseCategory',
    required: true,
    index: true
  },
  categoryName: {
    type: String,
    required: true,
    trim: true
  },
  splits: [{
    splitId: { type: String, required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'ExpenseCategory', required: true },
    categoryName: { type: String, required: true },
    amount: { type: Number, required: true },
    percentage: { type: Number, required: true },
    description: { type: String, trim: true },
    customFields: { type: Schema.Types.Mixed }
  }],
  
  paymentMethod: {
    type: String,
    enum: ['cash', 'personal_card', 'corporate_card', 'company_account', 'advance', 'other'],
    required: true
  },
  cardInfo: {
    last4: { type: String, trim: true },
    cardType: { type: String, trim: true },
    transactionId: { type: String, trim: true },
    merchantCategoryCode: { type: String, trim: true }
  },
  reimbursable: {
    type: Boolean,
    default: true
  },
  reimbursed: {
    type: Boolean,
    default: false,
    index: true
  },
  reimbursedAt: {
    type: Date
  },
  reimbursedAmount: {
    type: Number,
    min: 0
  },
  
  receiptRequired: {
    type: Boolean,
    default: true
  },
  receiptProvided: {
    type: Boolean,
    default: false
  },
  attachments: [{
    attachmentId: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['receipt', 'invoice', 'document', 'image', 'other'], required: true },
    url: { type: String, required: true },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, required: true },
    uploadedAt: { type: Date, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, trim: true },
    isPrimary: { type: Boolean, default: false }
  }],
  receiptVerified: {
    type: Boolean,
    default: false
  },
  receiptVerificationDate: {
    type: Date
  },
  receiptVerifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  ocrProcessed: {
    type: Boolean,
    default: false
  },
  ocrData: {
    merchant: { type: String, trim: true },
    date: { type: Date },
    amount: { type: Number },
    tax: { type: Number },
    confidence: { type: Number },
    rawText: { type: String }
  },
  
  mileageInfo: {
    startLocation: {
      address: { type: String, required: true },
      latitude: { type: Number },
      longitude: { type: Number },
      odometerStart: { type: Number, required: true }
    },
    endLocation: {
      address: { type: String, required: true },
      latitude: { type: Number },
      longitude: { type: Number },
      odometerEnd: { type: Number, required: true }
    },
    distance: {
      miles: { type: Number, required: true },
      kilometers: { type: Number, required: true },
      method: { type: String, enum: ['manual', 'gps', 'odometer'], required: true }
    },
    rate: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    purpose: { type: String, required: true, trim: true },
    vehicleInfo: {
      vehicleId: { type: String },
      make: { type: String, trim: true },
      model: { type: String, trim: true },
      year: { type: Number },
      licensePlate: { type: String, trim: true }
    },
    routeOptimized: { type: Boolean, default: false },
    stops: [{
      location: { type: String, required: true },
      purpose: { type: String, required: true, trim: true },
      timestamp: { type: Date, required: true }
    }]
  },
  
  perDiemInfo: {
    location: {
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      perDiemRate: { type: Number, required: true }
    },
    dates: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      totalDays: { type: Number, required: true },
      partialDays: [{
        date: { type: Date, required: true },
        percentage: { type: Number, required: true },
        reason: { type: String, required: true, trim: true }
      }]
    },
    breakdown: {
      breakfast: { type: Number, required: true },
      lunch: { type: Number, required: true },
      dinner: { type: Number, required: true },
      incidentals: { type: Number, required: true },
      total: { type: Number, required: true }
    },
    actualExpenses: {
      meals: { type: Number },
      lodging: { type: Number },
      incidentals: { type: Number },
      total: { type: Number }
    },
    providedMeals: [{
      date: { type: Date, required: true },
      mealType: { type: String, enum: ['breakfast', 'lunch', 'dinner'], required: true },
      provider: { type: String, required: true, trim: true }
    }]
  },
  
  status: {
    type: String,
    enum: ['draft', 'submitted', 'pending_approval', 'approved', 'rejected', 'paid', 'archived'],
    default: 'draft',
    index: true
  },
  submittedAt: {
    type: Date,
    index: true
  },
  submittedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  approvals: [{
    approvalId: { type: String, required: true },
    level: { type: Number, required: true },
    approverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    approverName: { type: String, required: true },
    approverRole: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], required: true },
    date: { type: Date },
    comments: { type: String, trim: true },
    delegatedTo: { type: Schema.Types.ObjectId, ref: 'User' }
  }],
  rejectionReason: {
    type: String,
    trim: true
  },
  rejectionDetails: {
    reason: { type: String, required: true, trim: true },
    category: { type: String, enum: ['policy', 'documentation', 'amount', 'other'], required: true },
    requiresResubmission: { type: Boolean, default: true },
    resubmissionDeadline: { type: Date }
  },
  
  policyViolations: [{
    violationId: { type: String, required: true },
    policyId: { type: String, required: true },
    policyName: { type: String, required: true },
    description: { type: String, required: true, trim: true },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
    action: { type: String, enum: ['warning', 'block', 'escalate'], required: true },
    acknowledged: { type: Boolean, default: false },
    acknowledgedAt: { type: Date },
    acknowledgedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  }],
  complianceScore: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },
  requiresAttention: {
    type: Boolean,
    default: false,
    index: true
  },
  
  tags: [{
    tagId: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    color: { type: String, required: true },
    category: { type: String, enum: ['project', 'client', 'location', 'purpose', 'custom'], required: true }
  }],
  customFields: {
    type: Schema.Types.Mixed,
    default: {}
  },
  projectCode: {
    type: String,
    trim: true,
    index: true
  },
  clientCode: {
    type: String,
    trim: true,
    index: true
  },
  billable: {
    type: Boolean,
    default: false,
    index: true
  },
  billableTo: {
    type: String,
    trim: true
  },
  
  reportId: {
    type: String,
    trim: true,
    index: true
  },
  reportName: {
    type: String,
    trim: true
  },
  reportPeriod: {
    startDate: { type: Date },
    endDate: { type: Date }
  },
  
  auditTrail: [{
    timestamp: { type: Date, required: true },
    action: { type: String, required: true, trim: true },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    details: { type: String, required: true, trim: true },
    previousValues: { type: Schema.Types.Mixed },
    newValues: { type: Schema.Types.Mixed }
  }],
  
  source: {
    type: String,
    enum: ['manual', 'mobile_app', 'email', 'ocr', 'card_import', 'recurring', 'api'],
    default: 'manual',
    index: true
  },
  sourceReference: {
    type: String,
    trim: true
  },
  importedAt: {
    type: Date
  },
  lastModifiedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  lastModifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  metadata: {
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    version: { type: Number, default: 1 },
    archivedAt: { type: Date },
    archivedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
ExpenseSchema.index({ expenseId: 1 });
ExpenseSchema.index({ employeeId: 1, status: 1 });
ExpenseSchema.index({ categoryId: 1, date: 1 });
ExpenseSchema.index({ date: 1, status: 1 });
ExpenseSchema.index({ submittedAt: 1 });
ExpenseSchema.index({ reimbursed: 1, reimbursedAt: 1 });
ExpenseSchema.index({ 'attachments.isPrimary': 1 });
ExpenseSchema.index({ requiresAttention: 1 });
ExpenseSchema.index({ complianceScore: 1 });
ExpenseSchema.index({ billable: 1, billableTo: 1 });

// Virtuals
ExpenseSchema.virtual('hasReceipt').get(function() {
  return this.attachments && this.attachments.length > 0;
});

ExpenseSchema.virtual('primaryReceipt').get(function() {
  return this.attachments.find(att => att.isPrimary);
});

ExpenseSchema.virtual('isOverdue').get(function() {
  if (!this.submittedAt) return false;
  const daysSinceSubmission = Math.floor((Date.now() - this.submittedAt.getTime()) / (1000 * 60 * 60 * 24));
  return daysSinceSubmission > 30; // 30 days overdue
});

ExpenseSchema.virtual('totalAttachments').get(function() {
  return this.attachments ? this.attachments.length : 0;
});

ExpenseSchema.virtual('isSplit').get(function() {
  return this.splits && this.splits.length > 0;
});

// Pre-save middleware
ExpenseSchema.pre('save', function(next) {
  if (this.isModified('amount') || this.isModified('taxAmount')) {
    this.totalAmount = this.amount + (this.taxAmount || 0);
  }
  
  if (this.isModified()) {
    this.lastModifiedAt = new Date();
    this.metadata.updatedAt = new Date();
    this.metadata.version += 1;
  }
  
  next();
});

// Instance methods
ExpenseSchema.methods.addAttachment = function(attachment: ExpenseAttachment) {
  if (!this.attachments) {
    this.attachments = [];
  }
  
  // If this is the primary receipt, unset others
  if (attachment.isPrimary) {
    this.attachments.forEach(att => att.isPrimary = false);
  }
  
  this.attachments.push(attachment);
  this.receiptProvided = true;
  this.receiptVerified = false;
};

ExpenseSchema.methods.removeAttachment = function(attachmentId: string) {
  this.attachments = this.attachments.filter(att => att.attachmentId !== attachmentId);
  this.receiptProvided = this.attachments.length > 0;
};

ExpenseSchema.methods.setPrimaryReceipt = function(attachmentId: string) {
  this.attachments.forEach(att => {
    att.isPrimary = att.attachmentId === attachmentId;
  });
};

ExpenseSchema.methods.addApproval = function(approval: any) {
  if (!this.approvals) {
    this.approvals = [];
  }
  
  // Remove existing approval for this level
  this.approvals = this.approvals.filter(app => app.level !== approval.level);
  
  this.approvals.push(approval);
};

ExpenseSchema.methods.addPolicyViolation = function(violation: any) {
  if (!this.policyViolations) {
    this.policyViolations = [];
  }
  
  this.policyViolations.push(violation);
  this.requiresAttention = true;
  
  // Update compliance score
  this.updateComplianceScore();
};

ExpenseSchema.methods.updateComplianceScore = function() {
  let score = 100;
  
  // Deduct points for policy violations
  this.policyViolations.forEach(violation => {
    switch (violation.severity) {
      case 'critical':
        score -= 25;
        break;
      case 'high':
        score -= 15;
        break;
      case 'medium':
        score -= 10;
        break;
      case 'low':
        score -= 5;
        break;
    }
  });
  
  // Deduct points for missing receipts
  if (this.receiptRequired && !this.receiptProvided) {
    score -= 20;
  }
  
  this.complianceScore = Math.max(0, score);
  this.requiresAttention = score < 80;
};

ExpenseSchema.methods.addAuditEntry = function(action: string, performedBy: Types.ObjectId, details: string, previousValues?: any, newValues?: any) {
  if (!this.auditTrail) {
    this.auditTrail = [];
  }
  
  this.auditTrail.push({
    timestamp: new Date(),
    action,
    performedBy,
    details,
    previousValues,
    newValues
  });
};

ExpenseSchema.methods.canBeEdited = function(): boolean {
  return ['draft', 'rejected'].includes(this.status);
};

ExpenseSchema.methods.canBeSubmitted = function(): boolean {
  return this.status === 'draft';
};

ExpenseSchema.methods.canBeApproved = function(): boolean {
  return this.status === 'pending_approval';
};

ExpenseSchema.methods.canBeRejected = function(): boolean {
  return this.status === 'pending_approval';
};

ExpenseSchema.methods.canBeReimbursed = function(): boolean {
  return this.status === 'approved' && this.reimbursable && !this.reimbursed;
};

// Static methods
ExpenseSchema.statics.generateExpenseId = async function(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `EXP${year}`;
  
  // Get the last expense ID for this year
  const lastExpense = await this.findOne({ expenseId: { $regex: `^${prefix}` } })
    .sort({ expenseId: -1 });
  
  let sequence = 1;
  if (lastExpense) {
    const lastSequence = parseInt(lastExpense.expenseId.replace(prefix, ''));
    sequence = lastSequence + 1;
  }
  
  return `${prefix}${sequence.toString().padStart(6, '0')}`;
};

ExpenseSchema.statics.findByEmployee = function(employeeId: string, status?: string) {
  const query: any = { employeeId };
  if (status) {
    query.status = status;
  }
  return this.find(query).sort({ date: -1 });
};

ExpenseSchema.statics.findByCategory = function(categoryId: string, dateRange?: { startDate: Date; endDate: Date }) {
  const query: any = { categoryId };
  if (dateRange) {
    query.date = {
      $gte: dateRange.startDate,
      $lte: dateRange.endDate
    };
  }
  return this.find(query).sort({ date: -1 });
};

ExpenseSchema.statics.findPendingApprovals = function(approverId: string) {
  return this.find({
    status: 'pending_approval',
    'approvals.approverId': approverId,
    'approvals.status': 'pending'
  }).sort({ submittedAt: 1 });
};

ExpenseSchema.statics.findOverdueExpenses = function(days = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return this.find({
    status: 'pending_approval',
    submittedAt: { $lt: cutoffDate }
  }).sort({ submittedAt: 1 });
};

ExpenseSchema.statics.searchExpenses = function(query: string, filters?: any) {
  const searchRegex = new RegExp(query, 'i');
  const searchQuery: any = {
    $or: [
      { title: searchRegex },
      { description: searchRegex },
      { employeeName: searchRegex },
      { categoryName: searchRegex },
      { location: searchRegex }
    ]
  };
  
  if (filters) {
    Object.assign(searchQuery, filters);
  }
  
  return this.find(searchQuery).sort({ date: -1 });
};

ExpenseSchema.statics.getExpenseStatistics = function(dateRange: { startDate: Date; endDate: Date }, filters?: any) {
  const matchQuery: any = {
    date: {
      $gte: dateRange.startDate,
      $lte: dateRange.endDate
    }
  };
  
  if (filters) {
    Object.assign(matchQuery, filters);
  }
  
  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalExpenses: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
        averageAmount: { $avg: '$totalAmount' },
        reimbursedAmount: { $sum: '$reimbursedAmount' },
        pendingAmount: {
          $sum: {
            $cond: [{ $eq: ['$status', 'pending_approval'] }, '$totalAmount', 0]
          }
        },
        approvedAmount: {
          $sum: {
            $cond: [{ $eq: ['$status', 'approved'] }, '$totalAmount', 0]
          }
        },
        rejectedAmount: {
          $sum: {
            $cond: [{ $eq: ['$status', 'rejected'] }, '$totalAmount', 0]
          }
        }
      }
    }
  ]);
};

// Post-save middleware
ExpenseSchema.post('save', async function(doc) {
  // Update category usage
  if (doc.isModified('status') && doc.status === 'approved') {
    const ExpenseCategory = mongoose.model('ExpenseCategory');
    await ExpenseCategory.findByIdAndUpdate(doc.categoryId, {
      $inc: { 'metadata.usageCount': 1 },
      $set: { 'metadata.lastUsed': new Date() }
    });
  }
});

export const Expense = mongoose.model<IExpense>('Expense', ExpenseSchema);
export default Expense;
