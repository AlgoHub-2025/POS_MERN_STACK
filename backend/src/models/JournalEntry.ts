import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';
import { IAccount } from './Account';

export interface IJournalEntry extends Document {
  entryNumber: string; // JE-2026-00001
  entryDate: Date;
  postDate?: Date; // date to post to ledger
  period: string; // YYYY-MM
  
  entryType: 'standard' | 'adjusting' | 'closing' | 'reversing' | 'intercompany';
  source: 'manual' | 'import' | 'system' | 'recurring' | 'module';
  sourceId?: string; // e.g., invoice ID, payroll ID
  
  lines: Array<{
    accountId: IAccount['_id'];
    description?: string;
    debit: number;
    credit: number;
    currency: string;
    exchangeRate?: number;
    baseCurrencyAmount?: number;
    reference?: string;
    department?: string;
    location?: string;
    project?: string;
    costCenter?: string;
    metadata?: Record<string, any>;
  }>;
  
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  
  approvalStatus: 'draft' | 'pending' | 'approved' | 'rejected' | 'posted';
  approvedBy?: IUser['_id'];
  approvedAt?: Date;
  rejectionReason?: string;
  
  isPosted: boolean;
  postedAt?: Date;
  postedBy?: IUser['_id'];
  
  isReversed: boolean;
  reversedBy?: IJournalEntry['_id'];
  reversalDate?: Date;
  
  // Recurring Entry Information
  recurringInfo?: {
    templateId: string;
    scheduleId: string;
    executionId: string;
    nextExecutionDate?: Date;
  };
  
  // Intercompany Information
  intercompanyInfo?: {
    sourceEntity: string;
    targetEntity: string;
    dueToAccountId: IAccount['_id'];
    dueFromAccountId: IAccount['_id'];
    eliminationEntry?: IJournalEntry['_id'];
  };
  
  // Attachments
  attachments: Array<{
    attachmentId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    url: string;
    description?: string;
    uploadedAt: Date;
    uploadedBy: IUser['_id'];
  }>;
  
  // Notes and Tags
  notes: string;
  tags: string[];
  
  // Validation Results
  validation: {
    isValid: boolean;
    errors: Array<{
      type: 'error' | 'warning';
      code: string;
      message: string;
      lineNumber?: number;
      accountId?: string;
    }>;
    warnings: Array<{
      code: string;
      message: string;
      lineNumber?: number;
      accountId?: string;
    }>;
  };
  
  // Workflow Information
  workflow: {
    currentStep: number;
    totalSteps: number;
    approvers: Array<{
      userId: IUser['_id'];
      role: string;
      status: 'pending' | 'approved' | 'rejected';
      decisionAt?: Date;
      comments?: string;
    }>;
    rules: Array<{
      condition: string;
      approvers: string[];
      order: number;
    }>;
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
    ipAddress?: string;
    userAgent?: string;
  };
}

const JournalEntrySchema: Schema = new Schema({
  entryNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: /^JE-\d{4}-\d{5}$/,
    index: true
  },
  
  entryDate: {
    type: Date,
    required: true,
    index: true
  },
  
  postDate: {
    type: Date,
    index: true
  },
  
  period: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}$/,
    index: true
  },
  
  entryType: {
    type: String,
    required: true,
    enum: ['standard', 'adjusting', 'closing', 'reversing', 'intercompany'],
    default: 'standard',
    index: true
  },
  
  source: {
    type: String,
    required: true,
    enum: ['manual', 'import', 'system', 'recurring', 'module'],
    default: 'manual',
    index: true
  },
  
  sourceId: {
    type: String,
    trim: true,
    index: true
  },
  
  lines: [{
    accountId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500
    },
    debit: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    credit: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      match: /^[A-Z]{3}$/,
      default: 'USD'
    },
    exchangeRate: {
      type: Number,
      min: 0,
      default: 1
    },
    baseCurrencyAmount: {
      type: Number,
      min: 0
    },
    reference: {
      type: String,
      trim: true,
      maxlength: 100
    },
    department: {
      type: String,
      trim: true,
      maxlength: 100
    },
    location: {
      type: String,
      trim: true,
      maxlength: 100
    },
    project: {
      type: String,
      trim: true,
      maxlength: 100
    },
    costCenter: {
      type: String,
      trim: true,
      maxlength: 100
    },
    metadata: {
      type: Schema.Types.Mixed
    }
  }],
  
  totalDebit: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  
  totalCredit: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  
  isBalanced: {
    type: Boolean,
    required: true,
    default: false
  },
  
  approvalStatus: {
    type: String,
    required: true,
    enum: ['draft', 'pending', 'approved', 'rejected', 'posted'],
    default: 'draft',
    index: true
  },
  
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  
  approvedAt: {
    type: Date,
    index: true
  },
  
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  
  isPosted: {
    type: Boolean,
    required: true,
    default: false,
    index: true
  },
  
  postedAt: {
    type: Date,
    index: true
  },
  
  postedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  
  isReversed: {
    type: Boolean,
    required: true,
    default: false,
    index: true
  },
  
  reversedBy: {
    type: Schema.Types.ObjectId,
    ref: 'JournalEntry'
  },
  
  reversalDate: {
    type: Date,
    index: true
  },
  
  recurringInfo: {
    templateId: {
      type: String,
      trim: true
    },
    scheduleId: {
      type: String,
      trim: true
    },
    executionId: {
      type: String,
      trim: true
    },
    nextExecutionDate: {
      type: Date
    }
  },
  
  intercompanyInfo: {
    sourceEntity: {
      type: String,
      trim: true,
      required: function() {
        return this.entryType === 'intercompany';
      }
    },
    targetEntity: {
      type: String,
      trim: true,
      required: function() {
        return this.entryType === 'intercompany';
      }
    },
    dueToAccountId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: function() {
        return this.entryType === 'intercompany';
      }
    },
    dueFromAccountId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: function() {
        return this.entryType === 'intercompany';
      }
    },
    eliminationEntry: {
      type: Schema.Types.ObjectId,
      ref: 'JournalEntry'
    }
  },
  
  attachments: [{
    attachmentId: {
      type: String,
      required: true
    },
    fileName: {
      type: String,
      required: true,
      trim: true
    },
    fileType: {
      type: String,
      required: true,
      trim: true
    },
    fileSize: {
      type: Number,
      required: true,
      min: 0
    },
    url: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500
    },
    uploadedAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }],
  
  notes: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  
  validation: {
    isValid: {
      type: Boolean,
      required: true,
      default: true
    },
    errors: [{
      type: {
        type: String,
        required: true,
        enum: ['error', 'warning']
      },
      code: {
        type: String,
        required: true,
        trim: true
      },
      message: {
        type: String,
        required: true,
        trim: true
      },
      lineNumber: {
        type: Number,
        min: 1
      },
      accountId: {
        type: Schema.Types.ObjectId,
        ref: 'Account'
      }
    }],
    warnings: [{
      code: {
        type: String,
        required: true,
        trim: true
      },
      message: {
        type: String,
        required: true,
        trim: true
      },
      lineNumber: {
        type: Number,
        min: 1
      },
      accountId: {
        type: Schema.Types.ObjectId,
        ref: 'Account'
      }
    }]
  },
  
  workflow: {
    currentStep: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    totalSteps: {
      type: Number,
      required: true,
      default: 1,
      min: 1
    },
    approvers: [{
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      role: {
        type: String,
        required: true,
        trim: true
      },
      status: {
        type: String,
        required: true,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      decisionAt: {
        type: Date
      },
      comments: {
        type: String,
        trim: true,
        maxlength: 1000
      }
    }],
    rules: [{
      condition: {
        type: String,
        required: true,
        trim: true
      },
      approvers: [{
        type: String,
        required: true,
        trim: true
      }],
      order: {
        type: Number,
        required: true,
        min: 0
      }
    }]
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
      trim: true,
      maxlength: 1000
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
      required: true,
      default: 1,
      min: 1
    },
    ipAddress: {
      type: String,
      trim: true
    },
    userAgent: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
JournalEntrySchema.index({ entryNumber: 1 });
JournalEntrySchema.index({ entryDate: 1, approvalStatus: 1 });
JournalEntrySchema.index({ period: 1, entryType: 1 });
JournalEntrySchema.index({ source: 1, sourceId: 1 });
JournalEntrySchema.index({ 'metadata.createdBy': 1 });
JournalEntrySchema.index({ 'lines.accountId': 1 });
JournalEntrySchema.index({ tags: 1 });

// Virtuals
JournalEntrySchema.virtual('totalAmount').get(function() {
  return this.totalDebit; // Should equal totalCredit if balanced
});

JournalEntrySchema.virtual('lineCount').get(function() {
  return this.lines.length;
});

JournalEntrySchema.virtual('canBeEdited').get(function() {
  return !this.isPosted && this.approvalStatus === 'draft';
});

JournalEntrySchema.virtual('canBePosted').get(function() {
  return !this.isPosted && this.approvalStatus === 'approved' && this.isBalanced;
});

JournalEntrySchema.virtual('canBeReversed').get(function() {
  return this.isPosted && !this.isReversed;
});

// Pre-save middleware
JournalEntrySchema.pre('save', async function(next) {
  // Calculate totals
  this.totalDebit = this.lines.reduce((sum, line) => sum + line.debit, 0);
  this.totalCredit = this.lines.reduce((sum, line) => sum + line.credit, 0);
  this.isBalanced = Math.abs(this.totalDebit - this.totalCredit) < 0.01;
  
  // Set period from entry date if not set
  if (!this.period && this.entryDate) {
    this.period = `${this.entryDate.getFullYear()}-${String(this.entryDate.getMonth() + 1).padStart(2, '0')}`;
  }
  
  // Validate entry
  await this.validateEntry();
  
  // Add audit trail entry
  if (this.isModified() && !this.isNew) {
    this.addAuditTrail('updated', this.metadata.updatedBy);
  }
  
  next();
});

// Pre-remove middleware
JournalEntrySchema.pre('remove', async function(next) {
  if (this.isPosted) {
    const error = new Error('Cannot delete posted journal entry');
    next(error);
    return;
  }
  
  if (this.isReversed) {
    const error = new Error('Cannot delete reversed journal entry');
    next(error);
    return;
  }
  
  next();
});

// Instance methods
JournalEntrySchema.methods.validateEntry = async function() {
  const errors = [];
  const warnings = [];
  
  // Check if entry has lines
  if (this.lines.length === 0) {
    errors.push({
      type: 'error' as const,
      code: 'NO_LINES',
      message: 'Journal entry must have at least one line'
    });
  }
  
  // Check if entry is balanced
  if (!this.isBalanced) {
    errors.push({
      type: 'error' as const,
      code: 'NOT_BALANCED',
      message: `Debits (${this.totalDebit}) must equal credits (${this.totalCredit})`
    });
  }
  
  // Validate each line
  for (let i = 0; i < this.lines.length; i++) {
    const line = this.lines[i];
    
    // Check if line has both debit and credit
    if (line.debit > 0 && line.credit > 0) {
      errors.push({
        type: 'error' as const,
        code: 'BOTH_DEBIT_CREDIT',
        message: 'Line cannot have both debit and credit amounts',
        lineNumber: i + 1,
        accountId: line.accountId
      });
    }
    
    // Check if line has neither debit nor credit
    if (line.debit === 0 && line.credit === 0) {
      errors.push({
        type: 'error' as const,
        code: 'NO_AMOUNT',
        message: 'Line must have either debit or credit amount',
        lineNumber: i + 1,
        accountId: line.accountId
      });
    }
    
    // Validate account exists and is active
    try {
      const Account = mongoose.model('Account');
      const account = await Account.findById(line.accountId);
      if (!account) {
        errors.push({
          type: 'error' as const,
          code: 'ACCOUNT_NOT_FOUND',
          message: 'Account not found',
          lineNumber: i + 1,
          accountId: line.accountId
        });
      } else if (!account.isActive) {
        warnings.push({
          code: 'ACCOUNT_INACTIVE',
          message: 'Account is inactive',
          lineNumber: i + 1,
          accountId: line.accountId
        });
      }
    } catch (error) {
      // Account model might not be available during validation
    }
  }
  
  // Check for duplicate entry numbers
  if (this.isNew || this.isModified('entryNumber')) {
    try {
      const existing = await this.constructor.findOne({ 
        entryNumber: this.entryNumber,
        _id: { $ne: this._id }
      });
      if (existing) {
        errors.push({
          type: 'error' as const,
          code: 'DUPLICATE_ENTRY_NUMBER',
          message: 'Entry number already exists'
        });
      }
    } catch (error) {
      // Ignore errors during duplicate check
    }
  }
  
  this.validation.isValid = errors.length === 0;
  this.validation.errors = errors;
  this.validation.warnings = warnings;
};

JournalEntrySchema.methods.addAuditTrail = function(action: string, userId: string, reason?: string, previousValues?: any, newValues?: any) {
  this.auditTrail.push({
    timestamp: new Date(),
    action,
    performedBy: userId,
    previousValues,
    newValues,
    reason
  });
  
  // Keep audit trail to last 50 entries
  if (this.auditTrail.length > 50) {
    this.auditTrail = this.auditTrail.slice(-50);
  }
};

JournalEntrySchema.methods.addLine = function(line: any) {
  this.lines.push(line);
  return this;
};

JournalEntrySchema.methods.removeLine = function(lineIndex: number) {
  if (lineIndex >= 0 && lineIndex < this.lines.length) {
    this.lines.splice(lineIndex, 1);
  }
  return this;
};

JournalEntrySchema.methods.updateLine = function(lineIndex: number, updates: any) {
  if (lineIndex >= 0 && lineIndex < this.lines.length) {
    Object.assign(this.lines[lineIndex], updates);
  }
  return this;
};

JournalEntrySchema.methods.addAttachment = function(attachment: any) {
  this.attachments.push(attachment);
  return this;
};

JournalEntrySchema.methods.removeAttachment = function(attachmentId: string) {
  this.attachments = this.attachments.filter(att => att.attachmentId !== attachmentId);
  return this;
};

// Static methods
JournalEntrySchema.statics.generateEntryNumber = async function(entryDate?: Date): Promise<string> {
  const date = entryDate || new Date();
  const year = date.getFullYear();
  
  // Find the highest entry number for the year
  const lastEntry = await this.findOne({
    entryNumber: new RegExp(`^JE-${year}-`)
  }).sort({ entryNumber: -1 });
  
  let sequence = 1;
  if (lastEntry) {
    const lastSequence = parseInt(lastEntry.entryNumber.split('-')[2]);
    sequence = lastSequence + 1;
  }
  
  return `JE-${year}-${sequence.toString().padStart(5, '0')}`;
};

JournalEntrySchema.statics.findByEntryNumber = function(entryNumber: string) {
  return this.findOne({ entryNumber: entryNumber.toUpperCase() });
};

JournalEntrySchema.statics.findByPeriod = function(period: string) {
  return this.find({ period }).sort({ entryDate: 1, entryNumber: 1 });
};

JournalEntrySchema.statics.findByAccount = function(accountId: string, startDate?: Date, endDate?: Date) {
  const query: any = { 'lines.accountId': accountId };
  
  if (startDate || endDate) {
    query.entryDate = {};
    if (startDate) query.entryDate.$gte = startDate;
    if (endDate) query.entryDate.$lte = endDate;
  }
  
  return this.find(query).sort({ entryDate: -1, entryNumber: -1 });
};

JournalEntrySchema.statics.findUnpostedEntries = function() {
  return this.find({ 
    isPosted: false, 
    approvalStatus: { $in: ['draft', 'approved'] }
  }).sort({ entryDate: 1, entryNumber: 1 });
};

JournalEntrySchema.statics.findPendingApprovals = function(userId?: string) {
  const query: any = { 
    approvalStatus: 'pending',
    isPosted: false
  };
  
  if (userId) {
    query['workflow.approvers'] = { $elemMatch: { userId, status: 'pending' } };
  }
  
  return this.find(query).sort({ entryDate: 1, entryNumber: 1 });
};

JournalEntrySchema.statics.getEntryStatistics = async function(startDate?: Date, endDate?: Date) {
  const matchStage: any = {};
  if (startDate || endDate) {
    matchStage.entryDate = {};
    if (startDate) matchStage.entryDate.$gte = startDate;
    if (endDate) matchStage.entryDate.$lte = endDate;
  }
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalEntries: { $sum: 1 },
        totalDebits: { $sum: '$totalDebit' },
        totalCredits: { $sum: '$totalCredit' },
        postedEntries: {
          $sum: { $cond: ['$isPosted', 1, 0] }
        },
        pendingEntries: {
          $sum: { $cond: [{ $eq: ['$approvalStatus', 'pending'] }, 1, 0] }
        },
        rejectedEntries: {
          $sum: { $cond: [{ $eq: ['$approvalStatus', 'rejected'] }, 1, 0] }
        },
        draftEntries: {
          $sum: { $cond: [{ $eq: ['$approvalStatus', 'draft'] }, 1, 0] }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalEntries: 0,
    totalDebits: 0,
    totalCredits: 0,
    postedEntries: 0,
    pendingEntries: 0,
    rejectedEntries: 0,
    draftEntries: 0
  };
};

export const JournalEntry = mongoose.model<IJournalEntry>('JournalEntry', JournalEntrySchema);
