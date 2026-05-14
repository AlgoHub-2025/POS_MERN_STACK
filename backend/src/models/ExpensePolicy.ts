import mongoose, { Schema, Document, Types } from 'mongoose';

export interface RuleCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'greater_equal' | 'less_equal' | 'contains' | 'in' | 'between';
  value: any;
  value2?: any; // for 'between' operator
  caseSensitive?: boolean;
}

export interface PerDiemRate {
  locationId: string;
  locationName: string;
  country: string;
  state?: string;
  city: string;
  rate: number;
  currency: string;
  effectiveDate: Date;
  expirationDate?: Date;
  mealBreakdown: {
    breakfast: number;
    lunch: number;
    dinner: number;
    incidentals: number;
  };
  tier: 'standard' | 'high_cost' | 'international';
  notes?: string;
}

export interface PolicyRule {
  ruleId: string;
  name: string;
  description: string;
  priority: number;
  isActive: boolean;
  
  // Conditions
  conditions: Array<{
    logicalOperator: 'and' | 'or';
    rules: Array<RuleCondition>;
  }>;
  
  // Actions
  actions: Array<{
    type: 'allow' | 'block' | 'require_approval' | 'notify' | 'warn' | 'auto_approve';
    parameters?: {
      approvers?: string[];
      approvalThreshold?: number;
      notificationRecipients?: string[];
      message?: string;
      severity?: 'low' | 'medium' | 'high' | 'critical';
    };
  }>;
  
  // Exceptions
  exceptions: Array<{
    condition: RuleCondition;
    action: 'override' | 'skip' | 'modify';
    modifiedAction?: any;
  }>;
  
  // Metadata
  category: 'general' | 'travel' | 'meals' | 'entertainment' | 'office' | 'technology' | 'custom';
  tags: string[];
  
  // Effectiveness Tracking
  effectiveness: {
    totalApplications: number;
    violations: number;
    exceptions: number;
    averageProcessingTime: number; // ms
    lastEvaluated?: Date;
  };
  
  // Timestamps
  createdAt: Date;
  createdBy: Types.ObjectId;
  updatedAt: Date;
  updatedBy: Types.ObjectId;
}

export interface IExpensePolicy extends Document {
  policyId: string;
  name: string;
  code: string;
  description: string;
  version: number;
  
  // Status and Lifecycle
  status: 'draft' | 'active' | 'inactive' | 'archived';
  effectiveDate: Date;
  expirationDate?: Date;
  
  // Scope
  appliesTo: {
    departments?: string[];
    roles?: string[];
    locations?: string[];
    employmentTypes?: string[];
    employeeIds?: Types.ObjectId[];
    excludeEmployees?: Types.ObjectId[];
  };
  
  // Policy Rules
  rules: PolicyRule[];
  
  // Per Diem Configuration
  perDiemRates: PerDiemRate[];
  perDiemRules: {
    requiresReceipt: boolean;
    partialDayRates: {
      lessThan4Hours: number; // percentage of full rate
      between4And8Hours: number;
      between8And12Hours: number;
      moreThan12Hours: number;
    };
    mealDeduction: {
      providedBreakfast: number;
      providedLunch: number;
      providedDinner: number;
    };
    incidentalsIncluded: boolean;
    lodgingRequired: boolean;
    advanceNotice: number; // days
  };
  
  // Mileage Configuration
  mileageRate: number;
  mileageRules: {
    requiresOdometer: boolean;
    requiresRoute: boolean;
    maxDailyMiles?: number;
    maxWeeklyMiles?: number;
    maxMonthlyMiles?: number;
    businessPercentageRequired: boolean;
    commutingMilesExcluded: boolean;
    personalUseDeduction: number;
    documentationRequired: string[];
    gpsTrackingRequired: boolean;
  };
  
  // Receipt Requirements
  receiptRules: {
    requiredForAllExpenses: boolean;
    minimumAmount: number;
    exceptions: Array<{
      category: string;
      maxAmount: number;
      reason: string;
    }>;
    digitalReceiptsAccepted: boolean;
    receiptFormat: 'pdf' | 'image' | 'any';
    storageRequirements: {
      retentionPeriod: number; // days
      mustBeLegible: boolean;
      mustShowDate: boolean;
      mustShowAmount: boolean;
      mustShowMerchant: boolean;
    };
  };
  
  // Approval Configuration
  approvalRules: {
    defaultApprovers: string[];
    approvalMatrix: Array<{
      amountRange: {
        min: number;
        max: number;
      };
      approvers: string[];
      parallelApproval: boolean;
      escalationRules: Array<{
        delay: number; // hours
        escalateTo: string[];
      }>;
    }>;
    autoApprovalConditions: Array<{
      category: string;
      maxAmount: number;
      employeeRole?: string;
    }>;
    delegationAllowed: boolean;
    delegationMaxDays: number;
  };
  
  // Payment Method Rules
  paymentMethodRules: {
    allowedMethods: string[];
    restrictedCategories: Array<{
      category: string;
      allowedMethods: string[];
    }>;
    corporateCardRequired: Array<{
      category: string;
      minAmount: number;
    }>;
    cashAdvanceLimits: {
      daily: number;
      weekly: number;
      monthly: number;
    };
  };
  
  // Time Limits
  timeLimits: {
    submissionWindow: number; // days from expense date
    approvalWindow: number; // days for approval
    modificationWindow: number; // days after submission
    appealWindow: number; // days after rejection
  };
  
  // Compliance and Audit
  compliance: {
    requiresPolicyAcknowledgment: boolean;
    acknowledgmentFrequency: 'once' | 'quarterly' | 'semi_annually' | 'annually';
    auditFrequency: 'random' | 'monthly' | 'quarterly' | 'annually';
    auditPercentage: number;
    requiredFields: string[];
    prohibitedExpenses: Array<{
      category: string;
      description: string;
      exceptions?: string[];
    }>;
  };
  
  // Notifications
  notifications: {
    policyViolations: {
      enabled: boolean;
      recipients: string[];
      includeEmployee: boolean;
      severity: 'low' | 'medium' | 'high' | 'critical';
    };
    policyUpdates: {
      enabled: boolean;
      recipients: string[];
      advanceNotice: number; // days
    };
    expiringPolicies: {
      enabled: boolean;
      recipients: string[];
      noticePeriod: number; // days
    };
  };
  
  // Integration Settings
  integrations: {
    accountingSystem: {
      enabled: boolean;
      syncRules: Array<{
        category: string;
        accountCode: string;
      }>;
    };
    budgetSystem: {
      enabled: boolean;
      budgetCategories: Array<{
        category: string;
        budgetCode: string;
      }>;
    };
    hrSystem: {
      enabled: boolean;
      employeeDataSync: boolean;
      departmentSync: boolean;
    };
  };
  
  // Analytics and Reporting
  analytics: {
    trackViolations: boolean;
    trackApprovals: boolean;
    trackProcessingTimes: boolean;
    generateReports: boolean;
    reportFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    reportRecipients: string[];
  };
  
  // Version Control
  versionHistory: Array<{
    version: number;
    changeDescription: string;
    changedBy: Types.ObjectId;
    changedAt: Date;
    effectiveDate: Date;
  }>;
  
  // Acknowledgments
  acknowledgments: Array<{
    employeeId: Types.ObjectId;
    acknowledgedAt: Date;
    version: number;
    ipAddress?: string;
    userAgent?: string;
  }>;
  
  // Metadata
  metadata: {
    createdAt: Date;
    createdBy: Types.ObjectId;
    updatedAt: Date;
    updatedBy: Types.ObjectId;
    lastReviewed?: Date;
    reviewedBy?: Types.ObjectId;
    nextReviewDate?: Date;
    tags: string[];
    notes?: string;
  };
}

const ExpensePolicySchema = new Schema<IExpensePolicy>({
  policyId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
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
    required: true,
    trim: true,
    maxlength: 2000
  },
  version: {
    type: Number,
    required: true,
    default: 1
  },
  
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'archived'],
    default: 'draft',
    index: true
  },
  effectiveDate: {
    type: Date,
    required: true,
    index: true
  },
  expirationDate: {
    type: Date,
    index: true
  },
  
  appliesTo: {
    departments: [{ type: String, trim: true }],
    roles: [{ type: String, trim: true }],
    locations: [{ type: String, trim: true }],
    employmentTypes: [{ type: String, trim: true }],
    employeeIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    excludeEmployees: [{ type: Schema.Types.ObjectId, ref: 'User' }]
  },
  
  rules: [{
    ruleId: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    priority: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    conditions: [{
      logicalOperator: { type: String, enum: ['and', 'or'], required: true },
      rules: [{
        field: { type: String, required: true },
        operator: { 
          type: String, 
          enum: ['equals', 'not_equals', 'greater_than', 'less_than', 'greater_equal', 'less_equal', 'contains', 'in', 'between'],
          required: true 
        },
        value: { type: Schema.Types.Mixed, required: true },
        value2: { type: Schema.Types.Mixed },
        caseSensitive: { type: Boolean, default: true }
      }]
    }],
    actions: [{
      type: { 
        type: String, 
        enum: ['allow', 'block', 'require_approval', 'notify', 'warn', 'auto_approve'],
        required: true 
      },
      parameters: {
        approvers: [{ type: String }],
        approvalThreshold: { type: Number },
        notificationRecipients: [{ type: String }],
        message: { type: String, trim: true },
        severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] }
      }
    }],
    exceptions: [{
      condition: {
        field: { type: String, required: true },
        operator: { type: String, required: true },
        value: { type: Schema.Types.Mixed, required: true },
        value2: { type: Schema.Types.Mixed },
        caseSensitive: { type: Boolean, default: true }
      },
      action: { type: String, enum: ['override', 'skip', 'modify'], required: true },
      modifiedAction: { type: Schema.Types.Mixed }
    }],
    category: { 
      type: String, 
      enum: ['general', 'travel', 'meals', 'entertainment', 'office', 'technology', 'custom'],
      default: 'general'
    },
    tags: [{ type: String, trim: true }],
    effectiveness: {
      totalApplications: { type: Number, default: 0 },
      violations: { type: Number, default: 0 },
      exceptions: { type: Number, default: 0 },
      averageProcessingTime: { type: Number, default: 0 },
      lastEvaluated: { type: Date }
    }
  }],
  
  perDiemRates: [{
    locationId: { type: String, required: true },
    locationName: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    state: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    rate: { type: Number, required: true },
    currency: { type: String, required: true, uppercase: true },
    effectiveDate: { type: Date, required: true },
    expirationDate: { type: Date },
    mealBreakdown: {
      breakfast: { type: Number, required: true },
      lunch: { type: Number, required: true },
      dinner: { type: Number, required: true },
      incidentals: { type: Number, required: true }
    },
    tier: { type: String, enum: ['standard', 'high_cost', 'international'], required: true },
    notes: { type: String, trim: true }
  }],
  
  perDiemRules: {
    requiresReceipt: { type: Boolean, default: false },
    partialDayRates: {
      lessThan4Hours: { type: Number, default: 0 },
      between4And8Hours: { type: Number, default: 25 },
      between8And12Hours: { type: Number, default: 50 },
      moreThan12Hours: { type: Number, default: 75 }
    },
    mealDeduction: {
      providedBreakfast: { type: Number, default: 15 },
      providedLunch: { type: Number, default: 20 },
      providedDinner: { type: Number, default: 25 }
    },
    incidentalsIncluded: { type: Boolean, default: true },
    lodgingRequired: { type: Boolean, default: false },
    advanceNotice: { type: Number, default: 7 }
  },
  
  mileageRate: {
    type: Number,
    default: 0.655 // IRS standard mileage rate (example)
  },
  
  mileageRules: {
    requiresOdometer: { type: Boolean, default: true },
    requiresRoute: { type: Boolean, default: false },
    maxDailyMiles: { type: Number },
    maxWeeklyMiles: { type: Number },
    maxMonthlyMiles: { type: Number },
    businessPercentageRequired: { type: Boolean, default: false },
    commutingMilesExcluded: { type: Boolean, default: true },
    personalUseDeduction: { type: Number, default: 0 },
    documentationRequired: [{ type: String, trim: true }],
    gpsTrackingRequired: { type: Boolean, default: false }
  },
  
  receiptRules: {
    requiredForAllExpenses: { type: Boolean, default: true },
    minimumAmount: { type: Number, default: 25 },
    exceptions: [{
      category: { type: String, required: true },
      maxAmount: { type: Number, required: true },
      reason: { type: String, required: true, trim: true }
    }],
    digitalReceiptsAccepted: { type: Boolean, default: true },
    receiptFormat: { type: String, enum: ['pdf', 'image', 'any'], default: 'any' },
    storageRequirements: {
      retentionPeriod: { type: Number, default: 2555 }, // 7 years
      mustBeLegible: { type: Boolean, default: true },
      mustShowDate: { type: Boolean, default: true },
      mustShowAmount: { type: Boolean, default: true },
      mustShowMerchant: { type: Boolean, default: true }
    }
  },
  
  approvalRules: {
    defaultApprovers: [{ type: String, trim: true }],
    approvalMatrix: [{
      amountRange: {
        min: { type: Number, required: true },
        max: { type: Number, required: true }
      },
      approvers: [{ type: String, required: true }],
      parallelApproval: { type: Boolean, default: false },
      escalationRules: [{
        delay: { type: Number, required: true },
        escalateTo: [{ type: String, required: true }]
      }]
    }],
    autoApprovalConditions: [{
      category: { type: String, required: true },
      maxAmount: { type: Number, required: true },
      employeeRole: { type: String, trim: true }
    }],
    delegationAllowed: { type: Boolean, default: true },
    delegationMaxDays: { type: Number, default: 30 }
  },
  
  paymentMethodRules: {
    allowedMethods: [{ type: String, trim: true }],
    restrictedCategories: [{
      category: { type: String, required: true },
      allowedMethods: [{ type: String, required: true }]
    }],
    corporateCardRequired: [{
      category: { type: String, required: true },
      minAmount: { type: Number, required: true }
    }],
    cashAdvanceLimits: {
      daily: { type: Number, default: 100 },
      weekly: { type: Number, default: 500 },
      monthly: { type: Number, default: 2000 }
    }
  },
  
  timeLimits: {
    submissionWindow: { type: Number, default: 90 },
    approvalWindow: { type: Number, default: 30 },
    modificationWindow: { type: Number, default: 7 },
    appealWindow: { type: Number, default: 14 }
  },
  
  compliance: {
    requiresPolicyAcknowledgment: { type: Boolean, default: true },
    acknowledgmentFrequency: { 
      type: String, 
      enum: ['once', 'quarterly', 'semi_annually', 'annually'],
      default: 'annually'
    },
    auditFrequency: { 
      type: String, 
      enum: ['random', 'monthly', 'quarterly', 'annually'],
      default: 'random'
    },
    auditPercentage: { type: Number, default: 10 },
    requiredFields: [{ type: String, trim: true }],
    prohibitedExpenses: [{
      category: { type: String, required: true },
      description: { type: String, required: true, trim: true },
      exceptions: [{ type: String, trim: true }]
    }]
  },
  
  notifications: {
    policyViolations: {
      enabled: { type: Boolean, default: true },
      recipients: [{ type: String, trim: true }],
      includeEmployee: { type: Boolean, default: true },
      severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' }
    },
    policyUpdates: {
      enabled: { type: Boolean, default: true },
      recipients: [{ type: String, trim: true }],
      advanceNotice: { type: Number, default: 14 }
    },
    expiringPolicies: {
      enabled: { type: Boolean, default: true },
      recipients: [{ type: String, trim: true }],
      noticePeriod: { type: Number, default: 30 }
    }
  },
  
  integrations: {
    accountingSystem: {
      enabled: { type: Boolean, default: false },
      syncRules: [{
        category: { type: String, required: true },
        accountCode: { type: String, required: true }
      }]
    },
    budgetSystem: {
      enabled: { type: Boolean, default: false },
      budgetCategories: [{
        category: { type: String, required: true },
        budgetCode: { type: String, required: true }
      }]
    },
    hrSystem: {
      enabled: { type: Boolean, default: false },
      employeeDataSync: { type: Boolean, default: true },
      departmentSync: { type: Boolean, default: true }
    }
  },
  
  analytics: {
    trackViolations: { type: Boolean, default: true },
    trackApprovals: { type: Boolean, default: true },
    trackProcessingTimes: { type: Boolean, default: true },
    generateReports: { type: Boolean, default: true },
    reportFrequency: { 
      type: String, 
      enum: ['daily', 'weekly', 'monthly', 'quarterly'],
      default: 'monthly'
    },
    reportRecipients: [{ type: String, trim: true }]
  },
  
  versionHistory: [{
    version: { type: Number, required: true },
    changeDescription: { type: String, required: true, trim: true },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    changedAt: { type: Date, required: true },
    effectiveDate: { type: Date, required: true }
  }],
  
  acknowledgments: [{
    employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    acknowledgedAt: { type: Date, required: true },
    version: { type: Number, required: true },
    ipAddress: { type: String },
    userAgent: { type: String }
  }],
  
  metadata: {
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lastReviewed: { type: Date },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    nextReviewDate: { type: Date },
    tags: [{ type: String, trim: true }],
    notes: { type: String, trim: true }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
ExpensePolicySchema.index({ policyId: 1 });
ExpensePolicySchema.index({ code: 1 });
ExpensePolicySchema.index({ status: 1 });
ExpensePolicySchema.index({ effectiveDate: 1, expirationDate: 1 });
ExpensePolicySchema.index({ 'appliesTo.departments': 1 });
ExpensePolicySchema.index({ 'appliesTo.roles': 1 });
ExpensePolicySchema.index({ 'metadata.createdBy': 1 });
ExpensePolicySchema.index({ version: 1 });

// Virtuals
ExpensePolicySchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status === 'active' && 
         this.effectiveDate <= now && 
         (!this.expirationDate || this.expirationDate > now);
});

ExpensePolicySchema.virtual('totalRules').get(function() {
  return this.rules ? this.rules.length : 0;
});

ExpensePolicySchema.virtual('activeRules').get(function() {
  return this.rules ? this.rules.filter(rule => rule.isActive).length : 0;
});

ExpensePolicySchema.virtual('daysUntilExpiration').get(function() {
  if (!this.expirationDate) return null;
  const now = new Date();
  const diffTime = this.expirationDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware
ExpensePolicySchema.pre('save', function(next) {
  if (this.isModified('version') && this.version > 1) {
    // Add to version history
    this.versionHistory.push({
      version: this.version,
      changeDescription: 'Version updated',
      changedBy: this.metadata.updatedBy,
      changedAt: new Date(),
      effectiveDate: this.effectiveDate
    });
  }
  
  next();
});

// Instance methods
ExpensePolicySchema.methods.addRule = function(rule: Partial<PolicyRule>): void {
  if (!this.rules) {
    this.rules = [];
  }
  
  const newRule: PolicyRule = {
    ruleId: `RULE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    name: rule.name || 'New Rule',
    description: rule.description || '',
    priority: rule.priority || 1,
    isActive: rule.isActive !== undefined ? rule.isActive : true,
    conditions: rule.conditions || [],
    actions: rule.actions || [],
    exceptions: rule.exceptions || [],
    category: rule.category || 'general',
    tags: rule.tags || [],
    effectiveness: {
      totalApplications: 0,
      violations: 0,
      exceptions: 0,
      averageProcessingTime: 0
    },
    createdAt: new Date(),
    createdBy: this.metadata.updatedBy,
    updatedAt: new Date(),
    updatedBy: this.metadata.updatedBy
  };
  
  this.rules.push(newRule);
};

ExpensePolicySchema.methods.removeRule = function(ruleId: string): void {
  this.rules = this.rules.filter(rule => rule.ruleId !== ruleId);
};

ExpensePolicySchema.methods.updateRule = function(ruleId: string, updates: Partial<PolicyRule>): boolean {
  const ruleIndex = this.rules.findIndex(rule => rule.ruleId === ruleId);
  if (ruleIndex === -1) return false;
  
  Object.assign(this.rules[ruleIndex], updates, {
    updatedAt: new Date(),
    updatedBy: this.metadata.updatedBy
  });
  
  return true;
};

ExpensePolicySchema.methods.addPerDiemRate = function(rate: Partial<PerDiemRate>): void {
  if (!this.perDiemRates) {
    this.perDiemRates = [];
  }
  
  const newRate: PerDiemRate = {
    locationId: rate.locationId || '',
    locationName: rate.locationName || '',
    country: rate.country || '',
    state: rate.state,
    city: rate.city || '',
    rate: rate.rate || 0,
    currency: rate.currency || 'USD',
    effectiveDate: rate.effectiveDate || new Date(),
    expirationDate: rate.expirationDate,
    mealBreakdown: rate.mealBreakdown || {
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      incidentals: 0
    },
    tier: rate.tier || 'standard',
    notes: rate.notes
  };
  
  this.perDiemRates.push(newRate);
};

ExpensePolicySchema.methods.getPerDiemRate = function(location: string, date: Date): PerDiemRate | null {
  if (!this.perDiemRates) return null;
  
  const effectiveRate = this.perDiemRates.find(rate => 
    rate.locationName.toLowerCase().includes(location.toLowerCase()) &&
    rate.effectiveDate <= date &&
    (!rate.expirationDate || rate.expirationDate > date)
  );
  
  return effectiveRate || null;
};

ExpensePolicySchema.methods.acknowledgePolicy = function(employeeId: Types.ObjectId): void {
  if (!this.acknowledgments) {
    this.acknowledgments = [];
  }
  
  // Remove existing acknowledgment for this employee
  this.acknowledgments = this.acknowledgments.filter(
    ack => !ack.employeeId.equals(employeeId)
  );
  
  // Add new acknowledgment
  this.acknowledgments.push({
    employeeId,
    acknowledgedAt: new Date(),
    version: this.version
  });
};

ExpensePolicySchema.methods.hasAcknowledged = function(employeeId: Types.ObjectId): boolean {
  return this.acknowledgments?.some(ack => 
    ack.employeeId.equals(employeeId) && ack.version === this.version
  ) || false;
};

ExpensePolicySchema.methods.evaluateExpense = function(expense: any): {
  approved: boolean;
  violations: Array<{
    ruleId: string;
    ruleName: string;
    action: string;
    message: string;
    severity: string;
  }>;
  warnings: Array<{
    ruleId: string;
    ruleName: string;
    message: string;
  }>;
} {
  const result = {
    approved: true,
    violations: [],
    warnings: []
  };
  
  if (!this.rules) return result;
  
  // Sort rules by priority
  const sortedRules = this.rules
    .filter(rule => rule.isActive)
    .sort((a, b) => a.priority - b.priority);
  
  for (const rule of sortedRules) {
    const ruleResult = this.evaluateRule(rule, expense);
    
    if (ruleResult.action === 'block') {
      result.approved = false;
      result.violations.push({
        ruleId: rule.ruleId,
        ruleName: rule.name,
        action: ruleResult.action,
        message: ruleResult.message || 'Policy violation',
        severity: ruleResult.parameters?.severity || 'medium'
      });
    } else if (ruleResult.action === 'warn') {
      result.warnings.push({
        ruleId: rule.ruleId,
        ruleName: rule.name,
        message: ruleResult.message || 'Policy warning'
      });
    }
    
    // Update rule effectiveness
    rule.effectiveness.totalApplications++;
    if (ruleResult.action === 'block') {
      rule.effectiveness.violations++;
    }
    rule.effectiveness.lastEvaluated = new Date();
  }
  
  return result;
};

ExpensePolicySchema.methods.evaluateRule = function(rule: PolicyRule, expense: any): any {
  // Mock rule evaluation
  return {
    action: 'allow',
    message: 'Expense complies with policy'
  };
};

// Static methods
ExpensePolicySchema.statics.generatePolicyId = async function(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `POL${year}`;
  
  const lastPolicy = await this.findOne({ policyId: { $regex: `^${prefix}` } })
    .sort({ policyId: -1 });
  
  let sequence = 1;
  if (lastPolicy) {
    const lastSequence = parseInt(lastPolicy.policyId.replace(prefix, ''));
    sequence = lastSequence + 1;
  }
  
  return `${prefix}${sequence.toString().padStart(4, '0')}`;
};

ExpensePolicySchema.statics.findActivePolicies = function(date?: Date): Promise<IExpensePolicy[]> {
  const searchDate = date || new Date();
  return this.find({
    status: 'active',
    effectiveDate: { $lte: searchDate },
    $or: [
      { expirationDate: { $exists: false } },
      { expirationDate: { $gt: searchDate } }
    ]
  }).sort({ priority: 1 });
};

ExpensePolicySchema.statics.findByEmployee = function(employeeId: Types.ObjectId, date?: Date): Promise<IExpensePolicy[]> {
  const searchDate = date || new Date();
  return this.find({
    status: 'active',
    effectiveDate: { $lte: searchDate },
    $or: [
      { expirationDate: { $exists: false } },
      { expirationDate: { $gt: searchDate } }
    ],
    $or: [
      { 'appliesTo.employeeIds': employeeId },
      { 'appliesTo.departments': { $exists: true } }, // Would need to join with employee data
      { 'appliesTo.roles': { $exists: true } },
      { 'appliesTo.locations': { $exists: true } }
    ],
    'appliesTo.excludeEmployees': { $ne: employeeId }
  }).sort({ priority: 1 });
};

ExpensePolicySchema.statics.searchPolicies = function(query: string, filters?: any): Promise<IExpensePolicy[]> {
  const searchRegex = new RegExp(query, 'i');
  const searchQuery: any = {
    $or: [
      { name: searchRegex },
      { code: searchRegex },
      { description: searchRegex },
      { 'metadata.tags': searchRegex }
    ]
  };
  
  if (filters) {
    Object.assign(searchQuery, filters);
  }
  
  return this.find(searchQuery).sort({ name: 1 });
};

ExpensePolicySchema.statics.getPoliciesRequiringReview = function(daysThreshold = 30): Promise<IExpensePolicy[]> {
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);
  
  return this.find({
    status: 'active',
    $or: [
      { expirationDate: { $lte: thresholdDate } },
      { 'metadata.nextReviewDate': { $lte: new Date() } }
    ]
  }).sort({ expirationDate: 1, 'metadata.nextReviewDate': 1 });
};

export const ExpensePolicy = mongoose.model<IExpensePolicy>('ExpensePolicy', ExpensePolicySchema);
export default ExpensePolicy;
