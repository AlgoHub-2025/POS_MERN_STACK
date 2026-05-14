import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';

export interface IAccount extends Document {
  code: string;
  name: string;
  displayName: string;
  description?: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense' | 'contra-asset' | 'contra-liability' | 'contra-equity';
  subtype?: string; // e.g., 'current-asset', 'fixed-asset', 'current-liability'
  category: string; // e.g., 'cash', 'inventory', 'accounts-receivable'
  parentAccount?: IAccount['_id'];
  level: number; // 1-5 for hierarchy depth
  path: string; // "Assets > Current Assets > Cash > Bank Accounts > Checking"
  
  normalBalance: 'debit' | 'credit'; // which side increases the account
  
  currency: string; // ISO currency code
  allowForeignCurrency: boolean;
  
  taxRelevant: boolean;
  taxCode?: string;
  
  isActive: boolean;
  isSystem: boolean; // cannot be deleted
  isControl: boolean; // control account (e.g., Accounts Receivable control)
  
  openingBalance: {
    date: Date;
    amount: number;
    source?: string;
  };
  
  restrictions: {
    viewRoles: string[];
    editRoles: string[];
    deleteRoles: string[];
  };
  
  // Account Relationships
  relationships: {
    offsetAccounts: IAccount['_id'][]; // accounts that offset this account
    contraAccounts: IAccount['_id'][]; // contra accounts
    consolidationAccounts: IAccount['_id'][]; // for consolidation
    intercompanyMappings: Array<{
      entityId: string;
      accountId: IAccount['_id'];
    }>;
  };
  
  // Account Settings
  settings: {
    allowManualEntry: boolean;
    requireApproval: boolean;
    approvalThreshold?: number;
    autoReconcile: boolean;
    departmentRequired: boolean;
    projectRequired: boolean;
    locationRequired: boolean;
    allowNegativeBalance: boolean;
    minimumBalance?: number;
    maximumBalance?: number;
  };
  
  // Reporting Settings
  reporting: {
    includeInBalanceSheet: boolean;
    includeInProfitLoss: boolean;
    includeInCashFlow: boolean;
    balanceSheetOrder: number;
    profitLossOrder: number;
    cashFlowCategory: 'operating' | 'investing' | 'financing';
    consolidationMethod: 'full' | 'equity' | 'proportionate';
  };
  
  // Budget Settings
  budgeting: {
    enableBudgeting: boolean;
    budgetPeriod: 'monthly' | 'quarterly' | 'annually';
    budgetAlerts: boolean;
    varianceThreshold: number; // percentage
    budgetApprovals: boolean;
  };
  
  // Audit Trail
  auditTrail: Array<{
    timestamp: Date;
    action: string;
    performedBy: IUser['_id'];
    previousValues?: Record<string, any>;
    newValues?: Record<string, any>;
    reason?: string;
  }>;
  
  // Metadata
  metadata: {
    createdBy: IUser['_id'];
    createdAt: Date;
    updatedBy: IUser['_id'];
    updatedAt: Date;
    version: number;
    tags: string[];
    notes?: string;
  };
}

const AccountSchema: Schema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: /^[0-9]{4,6}(-[0-9]{2,4})*$/, // e.g., 1000, 1000-01, 1000-01-001
    index: true
  },
  
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  displayName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 250
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  
  type: {
    type: String,
    required: true,
    enum: ['asset', 'liability', 'equity', 'revenue', 'expense', 'contra-asset', 'contra-liability', 'contra-equity'],
    index: true
  },
  
  subtype: {
    type: String,
    trim: true,
    enum: [
      // Asset subtypes
      'current-asset', 'fixed-asset', 'intangible-asset', 'long-term-investment',
      // Liability subtypes
      'current-liability', 'long-term-liability', 'contingent-liability',
      // Equity subtypes
      'share-capital', 'retained-earnings', 'other-equity',
      // Revenue subtypes
      'operating-revenue', 'non-operating-revenue', 'other-income',
      // Expense subtypes
      'operating-expense', 'non-operating-expense', 'cost-of-goods-sold'
    ],
    index: true
  },
  
  category: {
    type: String,
    required: true,
    trim: true,
    enum: [
      // Asset categories
      'cash', 'bank-accounts', 'accounts-receivable', 'inventory', 'prepaid-expenses',
      'fixed-assets', 'accumulated-depreciation', 'intangible-assets', 'investments',
      // Liability categories
      'accounts-payable', 'accrued-expenses', 'deferred-revenue', 'short-term-debt',
      'long-term-debt', 'deferred-tax', 'other-liabilities',
      // Equity categories
      'common-stock', 'preferred-stock', 'additional-paid-in-capital', 'treasury-stock',
      'retained-earnings', 'other-comprehensive-income',
      // Revenue categories
      'sales-revenue', 'service-revenue', 'interest-income', 'rental-income',
      'royalty-income', 'other-income',
      // Expense categories
      'cost-of-goods-sold', 'salaries', 'rent', 'utilities', 'depreciation',
      'amortization', 'interest-expense', 'tax-expense', 'other-expenses'
    ],
    index: true
  },
  
  parentAccount: {
    type: Schema.Types.ObjectId,
    ref: 'Account',
    index: true
  },
  
  level: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    default: 1,
    index: true
  },
  
  path: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  
  normalBalance: {
    type: String,
    required: true,
    enum: ['debit', 'credit'],
    default: function() {
      // Set default based on account type
      const debitTypes = ['asset', 'expense', 'contra-liability', 'contra-equity'];
      return debitTypes.includes(this.type) ? 'debit' : 'credit';
    }
  },
  
  currency: {
    type: String,
    required: true,
    uppercase: true,
    match: /^[A-Z]{3}$/,
    default: 'USD'
  },
  
  allowForeignCurrency: {
    type: Boolean,
    default: false
  },
  
  taxRelevant: {
    type: Boolean,
    default: false
  },
  
  taxCode: {
    type: String,
    trim: true,
    uppercase: true
  },
  
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  isSystem: {
    type: Boolean,
    default: false,
    index: true
  },
  
  isControl: {
    type: Boolean,
    default: false,
    index: true
  },
  
  openingBalance: {
    date: {
      type: Date,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      default: 0
    },
    source: {
      type: String,
      trim: true
    }
  },
  
  restrictions: {
    viewRoles: [{
      type: String,
      trim: true
    }],
    editRoles: [{
      type: String,
      trim: true
    }],
    deleteRoles: [{
      type: String,
      trim: true
    }]
  },
  
  relationships: {
    offsetAccounts: [{
      type: Schema.Types.ObjectId,
      ref: 'Account'
    }],
    contraAccounts: [{
      type: Schema.Types.ObjectId,
      ref: 'Account'
    }],
    consolidationAccounts: [{
      type: Schema.Types.ObjectId,
      ref: 'Account'
    }],
    intercompanyMappings: [{
      entityId: {
        type: String,
        required: true
      },
      accountId: {
        type: Schema.Types.ObjectId,
        ref: 'Account',
        required: true
      }
    }]
  },
  
  settings: {
    allowManualEntry: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    approvalThreshold: {
      type: Number,
      min: 0
    },
    autoReconcile: {
      type: Boolean,
      default: false
    },
    departmentRequired: {
      type: Boolean,
      default: false
    },
    projectRequired: {
      type: Boolean,
      default: false
    },
    locationRequired: {
      type: Boolean,
      default: false
    },
    allowNegativeBalance: {
      type: Boolean,
      default: true
    },
    minimumBalance: {
      type: Number
    },
    maximumBalance: {
      type: Number
    }
  },
  
  reporting: {
    includeInBalanceSheet: {
      type: Boolean,
      default: function() {
        return ['asset', 'liability', 'equity', 'contra-asset', 'contra-liability', 'contra-equity'].includes(this.type);
      }
    },
    includeInProfitLoss: {
      type: Boolean,
      default: function() {
        return ['revenue', 'expense'].includes(this.type);
      }
    },
    includeInCashFlow: {
      type: Boolean,
      default: true
    },
    balanceSheetOrder: {
      type: Number,
      default: 999
    },
    profitLossOrder: {
      type: Number,
      default: 999
    },
    cashFlowCategory: {
      type: String,
      enum: ['operating', 'investing', 'financing'],
      default: 'operating'
    },
    consolidationMethod: {
      type: String,
      enum: ['full', 'equity', 'proportionate'],
      default: 'full'
    }
  },
  
  budgeting: {
    enableBudgeting: {
      type: Boolean,
      default: true
    },
    budgetPeriod: {
      type: String,
      enum: ['monthly', 'quarterly', 'annually'],
      default: 'monthly'
    },
    budgetAlerts: {
      type: Boolean,
      default: true
    },
    varianceThreshold: {
      type: Number,
      min: 0,
      max: 100,
      default: 10
    },
    budgetApprovals: {
      type: Boolean,
      default: false
    }
  },
  
  auditTrail: [{
    timestamp: {
      type: Date,
      required: true,
      default: Date.now
    },
    action: {
      type: String,
      required: true,
      trim: true
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    previousValues: {
      type: Schema.Types.Mixed
    },
    newValues: {
      type: Schema.Types.Mixed
    },
    reason: {
      type: String,
      trim: true
    }
  }],
  
  metadata: {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updatedAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    version: {
      type: Number,
      default: 1,
      min: 1
    },
    tags: [{
      type: String,
      trim: true
    }],
    notes: {
      type: String,
      trim: true,
      maxlength: 2000
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
AccountSchema.index({ code: 1, isActive: 1 });
AccountSchema.index({ type: 1, category: 1 });
AccountSchema.index({ parentAccount: 1, level: 1 });
AccountSchema.index({ path: 1 });
AccountSchema.index({ 'metadata.createdBy': 1 });
AccountSchema.index({ 'metadata.tags': 1 });

// Virtuals
AccountSchema.virtual('children', {
  ref: 'Account',
  localField: '_id',
  foreignField: 'parentAccount'
});

AccountSchema.virtual('fullName').get(function() {
  return `${this.code} - ${this.displayName}`;
});

AccountSchema.virtual('isLeaf').get(function() {
  return this.level === 5;
});

AccountSchema.virtual('hasChildren').get(function() {
  // This would be populated in queries
  return false;
});

// Pre-save middleware
AccountSchema.pre('save', async function(next) {
  // Update path based on parent
  if (this.isModified('parentAccount') || this.isNew) {
    await this.updatePath();
  }
  
  // Update level based on parent
  if (this.isModified('parentAccount') || this.isNew) {
    await this.updateLevel();
  }
  
  // Validate account code format
  if (this.isModified('code')) {
    this.validateAccountCode();
  }
  
  // Update audit trail
  if (this.isModified() && !this.isNew) {
    this.addAuditTrail('updated', this.metadata.updatedBy);
  }
  
  next();
});

// Pre-remove middleware
AccountSchema.pre('remove', async function(next) {
  // Check if account has children
  const children = await this.constructor.find({ parentAccount: this._id });
  if (children.length > 0) {
    const error = new Error('Cannot delete account with child accounts');
    next(error);
    return;
  }
  
  // Check if account has transactions
  // This would need to be implemented based on your transaction model
  // const hasTransactions = await this.hasTransactions();
  // if (hasTransactions) {
  //   const error = new Error('Cannot delete account with existing transactions');
  //   next(error);
  //   return;
  // }
  
  next();
});

// Instance methods
AccountSchema.methods.updatePath = async function() {
  if (this.parentAccount) {
    const parent = await this.constructor.findById(this.parentAccount);
    if (parent) {
      this.path = `${parent.path} > ${this.displayName}`;
    } else {
      this.path = this.displayName;
    }
  } else {
    this.path = this.displayName;
  }
};

AccountSchema.methods.updateLevel = async function() {
  if (this.parentAccount) {
    const parent = await this.constructor.findById(this.parentAccount);
    if (parent) {
      this.level = parent.level + 1;
      if (this.level > 5) {
        throw new Error('Account hierarchy cannot exceed 5 levels');
      }
    } else {
      this.level = 1;
    }
  } else {
    this.level = 1;
  }
};

AccountSchema.methods.validateAccountCode = function() {
  const codePattern = /^[0-9]{4,6}(-[0-9]{2,4})*$/;
  if (!codePattern.test(this.code)) {
    throw new Error('Invalid account code format. Use format like 1000, 1000-01, or 1000-01-001');
  }
  
  // Validate code range based on account type
  const codePrefix = parseInt(this.code.split('-')[0]);
  const validRanges = {
    'asset': [1000, 1999],
    'liability': [2000, 2999],
    'equity': [3000, 3999],
    'revenue': [4000, 4999],
    'expense': [5000, 5999],
    'contra-asset': [1000, 1999],
    'contra-liability': [2000, 2999],
    'contra-equity': [3000, 3999]
  };
  
  const validRange = validRanges[this.type];
  if (validRange && (codePrefix < validRange[0] || codePrefix > validRange[1])) {
    throw new Error(`Account code ${codePrefix} is not valid for account type ${this.type}. Valid range: ${validRange[0]}-${validRange[1]}`);
  }
};

AccountSchema.methods.addAuditTrail = function(action: string, userId: string, reason?: string, previousValues?: any, newValues?: any) {
  this.auditTrail.push({
    timestamp: new Date(),
    action,
    performedBy: userId,
    previousValues,
    newValues,
    reason
  });
  
  // Keep audit trail to last 100 entries
  if (this.auditTrail.length > 100) {
    this.auditTrail = this.auditTrail.slice(-100);
  }
};

AccountSchema.methods.canBeViewedBy = function(userRole: string): boolean {
  if (this.restrictions.viewRoles.length === 0) {
    return true;
  }
  return this.restrictions.viewRoles.includes(userRole);
};

AccountSchema.methods.canBeEditedBy = function(userRole: string): boolean {
  if (this.restrictions.editRoles.length === 0) {
    return true;
  }
  return this.restrictions.editRoles.includes(userRole);
};

AccountSchema.methods.canBeDeletedBy = function(userRole: string): boolean {
  if (this.isSystem) {
    return false;
  }
  if (this.restrictions.deleteRoles.length === 0) {
    return true;
  }
  return this.restrictions.deleteRoles.includes(userRole);
};

AccountSchema.methods.getBalanceAtDate = async function(date: Date): Promise<number> {
  // This would need to be implemented based on your transaction model
  // For now, return opening balance
  return this.openingBalance.amount;
};

// Static methods
AccountSchema.statics.findByCode = function(code: string) {
  return this.findOne({ code: code.toUpperCase() });
};

AccountSchema.statics.findByType = function(type: string) {
  return this.find({ type, isActive: true }).sort({ code: 1 });
};

AccountSchema.statics.findByCategory = function(category: string) {
  return this.find({ category, isActive: true }).sort({ code: 1 });
};

AccountSchema.statics.findRootAccounts = function() {
  return this.find({ parentAccount: { $exists: false }, isActive: true }).sort({ code: 1 });
};

AccountSchema.statics.findChildAccounts = function(parentId: string) {
  return this.find({ parentAccount: parentId, isActive: true }).sort({ code: 1 });
};

AccountSchema.statics.getChartOfAccounts = function() {
  return this.find({ isActive: true })
    .populate('parentAccount', 'code displayName')
    .sort({ code: 1 });
};

AccountSchema.statics.getAccountTree = async function() {
  const roots = await this.findRootAccounts();
  const tree = [];
  
  for (const root of roots) {
    const node = await this.buildAccountTree(root);
    tree.push(node);
  }
  
  return tree;
};

AccountSchema.statics.buildAccountTree = async function(account: IAccount) {
  const node = {
    _id: account._id,
    code: account.code,
    name: account.name,
    displayName: account.displayName,
    type: account.type,
    category: account.category,
    level: account.level,
    path: account.path,
    children: []
  };
  
  const children = await this.findChildAccounts(account._id);
  for (const child of children) {
    const childNode = await this.buildAccountTree(child);
    node.children.push(childNode);
  }
  
  return node;
};

AccountSchema.statics.validateAccountHierarchy = async function(accountId: string, newParentId?: string) {
  if (!newParentId) return true;
  
  // Check if new parent is not a descendant of current account
  const account = await this.findById(accountId);
  if (!account) return false;
  
  let currentParent = await this.findById(newParentId);
  while (currentParent) {
    if (currentParent._id.toString() === accountId) {
      return false; // Would create circular reference
    }
    currentParent = await this.findById(currentParent.parentAccount);
  }
  
  return true;
};

AccountSchema.statics.generateAccountCode = async function(type: string, parentId?: string): Promise<string> {
  const validRanges = {
    'asset': [1000, 1999],
    'liability': [2000, 2999],
    'equity': [3000, 3999],
    'revenue': [4000, 4999],
    'expense': [5000, 5999],
    'contra-asset': [1000, 1999],
    'contra-liability': [2000, 2999],
    'contra-equity': [3000, 3999]
  };
  
  const range = validRanges[type];
  if (!range) {
    throw new Error(`Invalid account type: ${type}`);
  }
  
  if (parentId) {
    const parent = await this.findById(parentId);
    if (!parent) {
      throw new Error('Parent account not found');
    }
    
    // Generate child code based on parent
    const siblings = await this.find({ parentAccount: parentId });
    const nextNumber = siblings.length + 1;
    return `${parent.code}-${nextNumber.toString().padStart(2, '0')}`;
  } else {
    // Find next available code in range
    const existingCodes = await this.find({
      code: { $regex: `^${range[0]}` },
      type: type
    }).select('code');
    
    const usedNumbers = existingCodes.map(acc => parseInt(acc.code.split('-')[0]));
    let nextCode = range[0];
    
    while (usedNumbers.includes(nextCode)) {
      nextCode++;
    }
    
    if (nextCode > range[1]) {
      throw new Error(`No available codes in range ${range[0]}-${range[1]} for type ${type}`);
    }
    
    return nextCode.toString();
  }
};

export const Account = mongoose.model<IAccount>('Account', AccountSchema);
