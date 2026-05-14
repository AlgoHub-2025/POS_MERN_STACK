import mongoose, { Schema, Document, Types } from 'mongoose';

export interface EscalationRule {
  condition: string;
  action: 'escalate' | 'notify' | 'auto_approve';
  recipient: string;
  delay: number; // hours
}

export interface IExpenseCategory extends Document {
  name: string;
  code: string;
  description?: string;
  parentCategory?: Types.ObjectId;
  level: number; // 1,2,3 for hierarchy depth
  fullPath: string; // "Operations > Travel > Airfare"
  children: Types.ObjectId[];
  
  // Budget Management
  budget: {
    annual: number;
    quarterly: number;
    monthly: number;
    remaining: {
      annual: number;
      quarterly: number;
      monthly: number;
    };
    spent: {
      annual: number;
      quarterly: number;
      monthly: number;
    };
    committed: {
      annual: number;
      quarterly: number;
      monthly: number;
    };
    utilizationRate: number; // percentage
    variance: {
      annual: number;
      quarterly: number;
      monthly: number;
    };
  };
  
  // Approval Rules
  approvalRules: {
    requiresApproval: boolean;
    approvalThreshold: number;
    approverRoles: string[];
    escalationRules: EscalationRule[];
    autoApprovalConditions: Array<{
      field: string;
      operator: string;
      value: any;
    }>;
  };
  
  // Tax Rules
  taxRules: {
    isTaxDeductible: boolean;
    taxCode: string;
    taxRate: number;
    taxJurisdiction: string;
    taxReporting: boolean;
  };
  
  // Accounting Integration
  accounting: {
    expenseAccount: string;
    prepaidAccount?: string;
    accrualAccount?: string;
    costCenter?: string;
    department?: string;
    projectCode?: string;
    glCode?: string;
  };
  
  // Policy and Compliance
  policies: {
    receiptRequired: boolean;
    maxAmount?: number;
    allowedPaymentMethods: string[];
    requiredFields: string[];
    prohibitedItems?: string[];
    timeLimits?: {
      submissionWindow: number; // days from expense date
      approvalWindow: number; // days for approval
    };
  };
  
  // Analytics and Reporting
  analytics: {
    averageExpense: number;
    expenseCount: number;
    topMerchants: Array<{
      merchant: string;
      amount: number;
      count: number;
    }>;
    seasonalTrends: Array<{
      month: number;
      amount: number;
      count: number;
    }>;
    lastUpdated: Date;
  };
  
  // Permissions and Access
  permissions: {
    canSubmit: string[]; // role IDs
    canApprove: string[]; // role IDs
    canView: string[]; // role IDs
    canManage: string[]; // role IDs
    departmentRestrictions?: string[];
    locationRestrictions?: string[];
  };
  
  // Integration Settings
  integrations: {
    erpCategory?: string;
    accountingSystem?: string;
    corporateCardCategory?: string;
    budgetSystem?: string;
    reportingSystem?: string;
  };
  
  // Status and Lifecycle
  status: 'active' | 'inactive' | 'archived';
  isSystem: boolean; // cannot delete system categories
  version: number;
  
  // Metadata
  metadata: {
    createdBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    updatedBy: Types.ObjectId;
    lastUsed?: Date;
    usageCount: number;
    tags: string[];
    notes?: string;
  };
}

const ExpenseCategorySchema = new Schema<IExpenseCategory>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: 20
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  parentCategory: {
    type: Schema.Types.ObjectId,
    ref: 'ExpenseCategory',
    default: null
  },
  level: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  fullPath: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  children: [{
    type: Schema.Types.ObjectId,
    ref: 'ExpenseCategory'
  }],
  
  budget: {
    annual: { type: Number, default: 0 },
    quarterly: { type: Number, default: 0 },
    monthly: { type: Number, default: 0 },
    remaining: {
      annual: { type: Number, default: 0 },
      quarterly: { type: Number, default: 0 },
      monthly: { type: Number, default: 0 }
    },
    spent: {
      annual: { type: Number, default: 0 },
      quarterly: { type: Number, default: 0 },
      monthly: { type: Number, default: 0 }
    },
    committed: {
      annual: { type: Number, default: 0 },
      quarterly: { type: Number, default: 0 },
      monthly: { type: Number, default: 0 }
    },
    utilizationRate: { type: Number, default: 0 },
    variance: {
      annual: { type: Number, default: 0 },
      quarterly: { type: Number, default: 0 },
      monthly: { type: Number, default: 0 }
    }
  },
  
  approvalRules: {
    requiresApproval: { type: Boolean, default: true },
    approvalThreshold: { type: Number, default: 0 },
    approverRoles: [{ type: String }],
    escalationRules: [{
      condition: String,
      action: { type: String, enum: ['escalate', 'notify', 'auto_approve'] },
      recipient: String,
      delay: Number
    }],
    autoApprovalConditions: [{
      field: String,
      operator: String,
      value: Schema.Types.Mixed
    }]
  },
  
  taxRules: {
    isTaxDeductible: { type: Boolean, default: true },
    taxCode: { type: String, trim: true },
    taxRate: { type: Number, default: 0 },
    taxJurisdiction: { type: String, trim: true },
    taxReporting: { type: Boolean, default: true }
  },
  
  accounting: {
    expenseAccount: { type: String, required: true, trim: true },
    prepaidAccount: { type: String, trim: true },
    accrualAccount: { type: String, trim: true },
    costCenter: { type: String, trim: true },
    department: { type: String, trim: true },
    projectCode: { type: String, trim: true },
    glCode: { type: String, trim: true }
  },
  
  policies: {
    receiptRequired: { type: Boolean, default: true },
    maxAmount: { type: Number },
    allowedPaymentMethods: [{ type: String }],
    requiredFields: [{ type: String }],
    prohibitedItems: [{ type: String }],
    timeLimits: {
      submissionWindow: { type: Number, default: 90 }, // 90 days
      approvalWindow: { type: Number, default: 30 } // 30 days
    }
  },
  
  analytics: {
    averageExpense: { type: Number, default: 0 },
    expenseCount: { type: Number, default: 0 },
    topMerchants: [{
      merchant: String,
      amount: Number,
      count: Number
    }],
    seasonalTrends: [{
      month: Number,
      amount: Number,
      count: Number
    }],
    lastUpdated: { type: Date, default: Date.now }
  },
  
  permissions: {
    canSubmit: [{ type: String }],
    canApprove: [{ type: String }],
    canView: [{ type: String }],
    canManage: [{ type: String }],
    departmentRestrictions: [{ type: String }],
    locationRestrictions: [{ type: String }]
  },
  
  integrations: {
    erpCategory: { type: String, trim: true },
    accountingSystem: { type: String, trim: true },
    corporateCardCategory: { type: String, trim: true },
    budgetSystem: { type: String, trim: true },
    reportingSystem: { type: String, trim: true }
  },
  
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },
  isSystem: {
    type: Boolean,
    default: false
  },
  version: {
    type: Number,
    default: 1
  },
  
  metadata: {
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lastUsed: { type: Date },
    usageCount: { type: Number, default: 0 },
    tags: [{ type: String, trim: true }],
    notes: { type: String, trim: true }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
ExpenseCategorySchema.index({ code: 1 });
ExpenseCategorySchema.index({ parentCategory: 1 });
ExpenseCategorySchema.index({ level: 1 });
ExpenseCategorySchema.index({ status: 1 });
ExpenseCategorySchema.index({ 'metadata.createdBy': 1 });
ExpenseCategorySchema.index({ fullPath: 1 });
ExpenseCategorySchema.index({ 'accounting.expenseAccount': 1 });
ExpenseCategorySchema.index({ 'budget.utilizationRate': 1 });

// Virtuals
ExpenseCategorySchema.virtual('hasChildren').get(function() {
  return this.children && this.children.length > 0;
});

ExpenseCategorySchema.virtual('budgetUtilizationPercentage').get(function() {
  return this.budget.annual > 0 ? (this.budget.spent.annual / this.budget.annual) * 100 : 0;
});

// Pre-save middleware
ExpenseCategorySchema.pre('save', async function(next) {
  if (this.isModified('name') || this.isModified('parentCategory')) {
    await this.updateFullPath();
  }
  
  if (this.isModified('budget')) {
    this.calculateBudgetMetrics();
  }
  
  next();
});

// Instance methods
ExpenseCategorySchema.methods.updateFullPath = async function() {
  if (this.parentCategory) {
    const parent = await this.model('ExpenseCategory').findById(this.parentCategory);
    if (parent) {
      this.fullPath = `${parent.fullPath} > ${this.name}`;
      this.level = parent.level + 1;
    }
  } else {
    this.fullPath = this.name;
    this.level = 1;
  }
};

ExpenseCategorySchema.methods.calculateBudgetMetrics = function() {
  // Calculate remaining budget
  this.budget.remaining.annual = this.budget.annual - this.budget.spent.annual - this.budget.committed.annual;
  this.budget.remaining.quarterly = this.budget.quarterly - this.budget.spent.quarterly - this.budget.committed.quarterly;
  this.budget.remaining.monthly = this.budget.monthly - this.budget.spent.monthly - this.budget.committed.monthly;
  
  // Calculate utilization rate
  this.budget.utilizationRate = this.budget.annual > 0 
    ? ((this.budget.spent.annual + this.budget.committed.annual) / this.budget.annual) * 100 
    : 0;
  
  // Calculate variance
  this.budget.variance.annual = this.budget.spent.annual - this.budget.annual;
  this.budget.variance.quarterly = this.budget.spent.quarterly - this.budget.quarterly;
  this.budget.variance.monthly = this.budget.spent.monthly - this.budget.monthly;
};

ExpenseCategorySchema.methods.addChild = async function(childId: Types.ObjectId) {
  if (!this.children.includes(childId)) {
    this.children.push(childId);
    await this.save();
  }
};

ExpenseCategorySchema.methods.removeChild = async function(childId: Types.ObjectId) {
  this.children = this.children.filter(id => !id.equals(childId));
  await this.save();
};

ExpenseCategorySchema.methods.updateAnalytics = async function() {
  // This would typically query expense data to update analytics
  // Mock implementation for now
  this.analytics.lastUpdated = new Date();
  await this.save();
};

ExpenseCategorySchema.methods.checkPermission = function(userRole: string, action: 'submit' | 'approve' | 'view' | 'manage'): boolean {
  const permissionKey = `can${action.charAt(0).toUpperCase() + action.slice(1)}`;
  return this.permissions[permissionKey].includes(userRole);
};

ExpenseCategorySchema.methods.getBudgetStatus = function(): 'under_budget' | 'on_track' | 'over_budget' | 'exceeded' {
  const utilization = this.budget.utilizationRate;
  if (utilization < 80) return 'under_budget';
  if (utilization < 95) return 'on_track';
  if (utilization < 100) return 'over_budget';
  return 'exceeded';
};

// Static methods
ExpenseCategorySchema.statics.findByCode = function(code: string) {
  return this.findOne({ code: code.toUpperCase() });
};

ExpenseCategorySchema.statics.findRootCategories = function() {
  return this.find({ parentCategory: null, status: 'active' }).sort({ name: 1 });
};

ExpenseCategorySchema.statics.findChildCategories = function(parentId: Types.ObjectId) {
  return this.find({ parentCategory: parentId, status: 'active' }).sort({ name: 1 });
};

ExpenseCategorySchema.statics.getCategoryTree = async function() {
  const roots = await this.find({ parentCategory: null, status: 'active' }).sort({ name: 1 });
  const tree = [];
  
  for (const root of roots) {
    const categoryWithChildren = await this.getCategoryWithChildren(root._id);
    tree.push(categoryWithChildren);
  }
  
  return tree;
};

ExpenseCategorySchema.statics.getCategoryWithChildren = async function(categoryId: Types.ObjectId) {
  const category = await this.findById(categoryId);
  if (!category) return null;
  
  const children = await this.find({ parentCategory: categoryId, status: 'active' }).sort({ name: 1 });
  
  if (children.length > 0) {
    const childCategories = [];
    for (const child of children) {
      const childWithChildren = await this.getCategoryWithChildren(child._id);
      childCategories.push(childWithChildren);
    }
    (category as any).children = childCategories;
  }
  
  return category;
};

ExpenseCategorySchema.statics.searchCategories = function(query: string, includeInactive = false) {
  const searchRegex = new RegExp(query, 'i');
  const statusFilter = includeInactive ? {} : { status: 'active' };
  
  return this.find({
    ...statusFilter,
    $or: [
      { name: searchRegex },
      { code: searchRegex },
      { description: searchRegex },
      { fullPath: searchRegex }
    ]
  }).sort({ level: 1, name: 1 });
};

ExpenseCategorySchema.statics.getBudgetAlerts = function(threshold = 80) {
  return this.find({
    status: 'active',
    'budget.utilizationRate': { $gte: threshold }
  }).sort({ 'budget.utilizationRate': -1 });
};

// Post-save middleware
ExpenseCategorySchema.post('save', async function(doc) {
  if (doc.isModified('parentCategory') || doc.isModified('name')) {
    // Update children full paths
    await this.model('ExpenseCategory').updateMany(
      { parentCategory: doc._id },
      { $set: { level: doc.level + 1 } }
    );
  }
});

export const ExpenseCategory = mongoose.model<IExpenseCategory>('ExpenseCategory', ExpenseCategorySchema);
export default ExpenseCategory;
