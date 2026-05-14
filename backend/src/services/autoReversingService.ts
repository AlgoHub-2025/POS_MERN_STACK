import { JournalEntry, IJournalEntry } from '../models/JournalEntry';
import { User } from '../models/User';
import { Account } from '../models/Account';

export interface AutoReversalRule {
  ruleId: string;
  entryId: string;
  entryNumber: string;
  
  // Reversal Configuration
  reversalType: 'next-day' | 'next-period' | 'specific-date' | 'custom';
  reversalDate?: Date;
  reversalReason: string;
  reversalDescription?: string;
  
  // Approval Settings
  requiresApproval: boolean;
  approvalThreshold?: number; // amount threshold for approval
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  
  // Status Tracking
  status: 'pending' | 'approved' | 'executed' | 'cancelled' | 'failed';
  reversalEntryId?: string;
  reversalEntryNumber?: string;
  
  // Execution Details
  executedAt?: Date;
  executedBy?: string;
  error?: string;
  retryCount?: number;
  maxRetries?: number;
  
  // Scheduling
  scheduledAt?: Date;
  timezone?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Notifications
  notifyOnExecution: boolean;
  notifyOnFailure: boolean;
  notificationRecipients: string[];
  
  // Audit Trail
  auditTrail: Array<{
    timestamp: Date;
    action: string;
    performedBy: string;
    details: string;
    previousStatus?: string;
    newStatus?: string;
  }>;
  
  // Metadata
  metadata: {
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    updatedBy: string;
    version: number;
  };
}

export interface ReversalSchedule {
  scheduleId: string;
  name: string;
  description: string;
  
  // Schedule Configuration
  configuration: {
    scheduleType: 'recurring' | 'one-time' | 'conditional';
    frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    dayOfMonth?: number;
    dayOfWeek?: number;
    month?: number;
    startDate: Date;
    endDate?: Date;
    timezone: string;
    
    // Conditional Rules
    conditions?: Array<{
      field: string;
      operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
      value: any;
      logicalOperator?: 'and' | 'or';
    }>;
    
    // Entry Criteria
    entryCriteria: {
      entryTypes?: string[];
      accountIds?: string[];
      amountRange?: {
        min?: number;
        max?: number;
      };
      departments?: string[];
      locations?: string[];
      projects?: string[];
      tags?: string[];
    };
    
    // Reversal Settings
    reversalSettings: {
      reversalType: 'next-day' | 'next-period' | 'specific-date';
      reversalOffset?: number; // days to offset
      reversalReason: string;
      requiresApproval: boolean;
      approvalThreshold?: number;
      notifyOnExecution: boolean;
      notificationRecipients: string[];
    };
  };
  
  // Schedule Status
  status: 'active' | 'inactive' | 'paused' | 'completed' | 'error';
  
  // Execution History
  executionHistory: Array<{
    executionId: string;
    executedAt: Date;
    entriesProcessed: number;
    reversalsCreated: number;
    errors: string[];
    executedBy: string;
  }>;
  
  // Next Execution
  nextExecutionDate?: Date;
  
  // Statistics
  statistics: {
    totalExecutions: number;
    totalReversalsCreated: number;
    successfulExecutions: number;
    failedExecutions: number;
    lastExecutionAt?: Date;
    averageExecutionTime: number; // seconds
  };
  
  // Metadata
  metadata: {
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    updatedBy: string;
    version: number;
  };
}

export interface ReversalBatch {
  batchId: string;
  name: string;
  description: string;
  
  // Batch Configuration
  configuration: {
    batchType: 'period-end' | 'mass-reversal' | 'correction' | 'system-generated';
    targetPeriod: string; // YYYY-MM
    includeUnposted: boolean;
    includePosted: boolean;
    entryTypes?: string[];
    accountIds?: string[];
    amountRange?: {
      min?: number;
      max?: number;
    };
    reversalDate: Date;
    reversalReason: string;
    requiresApproval: boolean;
  };
  
  // Batch Status
  status: 'draft' | 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  
  // Processing Details
  processing: {
    startedAt?: Date;
    completedAt?: Date;
    processedBy: string;
    totalEntries: number;
    processedEntries: number;
    successfulReversals: number;
    failedReversals: number;
    errors: Array<{
      entryId: string;
      entryNumber: string;
      error: string;
      timestamp: Date;
    }>;
  };
  
  // Results
  results: {
    reversalRules: string[]; // rule IDs created
    reversalEntries: string[]; // entry IDs created
    summary: {
      totalAmount: number;
      totalReversals: number;
      averageAmount: number;
    };
  };
  
  // Approval
  approval: {
    required: boolean;
    approvedBy?: string;
    approvedAt?: Date;
    rejectionReason?: string;
    approvers: Array<{
      userId: string;
      status: 'pending' | 'approved' | 'rejected';
      decisionAt?: Date;
      comments?: string;
    }>;
  };
  
  // Metadata
  metadata: {
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    updatedBy: string;
  };
}

export interface ReversalAnalytics {
  period: {
    startDate: Date;
    endDate: Date;
  };
  
  // Overview
  overview: {
    totalReversals: number;
    successfulReversals: number;
    failedReversals: number;
    pendingReversals: number;
    cancelledReversals: number;
    averageReversalTime: number; // hours from original to reversal
    reversalRate: number; // percentage of entries that get reversed
  };
  
  // Reversal Analysis
  reversalAnalysis: {
    byType: Record<string, {
      count: number;
      totalAmount: number;
      averageAmount: number;
      successRate: number;
    }>;
    byReason: Record<string, {
      count: number;
      totalAmount: number;
      averageAmount: number;
    }>;
    byPeriod: Record<string, {
      count: number;
      totalAmount: number;
      averageAmount: number;
      successRate: number;
    }>;
    byAccount: Array<{
      accountId: string;
      accountCode: string;
      accountName: string;
      reversalCount: number;
      totalReversed: number;
      percentage: number;
    }>;
  };
  
  // Schedule Performance
  schedulePerformance: Array<{
    scheduleId: string;
    scheduleName: string;
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageExecutionTime: number;
    successRate: number;
    lastExecutionAt?: Date;
    nextExecutionDate?: Date;
  }>;
  
  // Error Analysis
  errorAnalysis: {
    commonErrors: Array<{
      errorType: string;
      count: number;
      percentage: number;
      description: string;
      resolution: string;
    }>;
    failedReversals: Array<{
      ruleId: string;
      entryNumber: string;
      error: string;
      failedAt: Date;
      retryCount: number;
    }>;
  };
  
  // Trends
  trends: {
    monthly: Array<{
      month: string;
      reversals: number;
      amount: number;
      successRate: number;
      averageTime: number;
    }>;
    daily: Array<{
      date: string;
      reversals: number;
      amount: number;
      successRate: number;
    }>;
  };
  
  // Recommendations
  recommendations: Array<{
    type: 'schedule_optimization' | 'error_reduction' | 'process_improvement' | 'approval_workflow';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    impact: string;
    effort: 'low' | 'medium' | 'high';
    affectedItems: number;
  }>;
}

export class AutoReversingService {
  // Schedule reversal for journal entry
  async scheduleReversal(params: {
    entryId: string;
    reversalType: 'next-day' | 'next-period' | 'specific-date' | 'custom';
    reversalDate?: Date;
    reversalReason: string;
    reversalDescription?: string;
    requiresApproval?: boolean;
    approvalThreshold?: number;
    notifyOnExecution?: boolean;
    notificationRecipients?: string[];
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    createdBy: string;
  }): Promise<AutoReversalRule> {
    // Validate journal entry
    const entry = await JournalEntry.findById(params.entryId);
    if (!entry) {
      throw new Error('Journal entry not found');
    }
    
    if (!entry.isPosted) {
      throw new Error('Cannot schedule reversal for unposted entry');
    }
    
    if (entry.isReversed) {
      throw new Error('Entry is already reversed');
    }
    
    // Check if reversal already scheduled
    const existingRule = await this.getReversalRuleByEntryId(params.entryId);
    if (existingRule && existingRule.status !== 'cancelled' && existingRule.status !== 'failed') {
      throw new Error('Reversal already scheduled for this entry');
    }
    
    // Calculate reversal date
    let reversalDate = params.reversalDate;
    if (!reversalDate) {
      reversalDate = this.calculateReversalDate(entry.entryDate, params.reversalType);
    }
    
    // Check approval requirements
    const requiresApproval = params.requiresApproval ?? (entry.totalDebit > (params.approvalThreshold || 10000));
    
    // Create reversal rule
    const ruleId = `REV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const rule: AutoReversalRule = {
      ruleId,
      entryId: params.entryId,
      entryNumber: entry.entryNumber,
      
      reversalType: params.reversalType,
      reversalDate,
      reversalReason: params.reversalReason,
      reversalDescription: params.reversalDescription,
      
      requiresApproval,
      approvalThreshold: params.approvalThreshold,
      
      status: requiresApproval ? 'pending' : 'approved',
      
      priority: params.priority || 'medium',
      
      notifyOnExecution: params.notifyOnExecution ?? true,
      notifyOnFailure: true,
      notificationRecipients: params.notificationRecipients || [],
      
      maxRetries: 3,
      retryCount: 0,
      
      auditTrail: [{
        timestamp: new Date(),
        action: 'created',
        performedBy: params.createdBy,
        details: `Reversal scheduled for ${entry.entryNumber} on ${reversalDate?.toISOString().split('T')[0]}`,
        previousStatus: undefined,
        newStatus: requiresApproval ? 'pending' : 'approved'
      }],
      
      metadata: {
        createdBy: params.createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
        updatedBy: params.createdBy,
        version: 1
      }
    };
    
    // Save rule
    await this.saveReversalRule(rule);
    
    // If approval required, initiate workflow
    if (requiresApproval) {
      await this.initiateReversalApproval(rule);
    }
    
    // Send notifications
    await this.sendReversalNotifications(rule, 'scheduled');
    
    return rule;
  }
  
  // Execute reversal
  async executeReversal(ruleId: string, executedBy?: string): Promise<string> {
    const rule = await this.getReversalRuleById(ruleId);
    if (!rule) {
      throw new Error('Reversal rule not found');
    }
    
    if (rule.status !== 'approved') {
      throw new Error('Reversal rule must be approved before execution');
    }
    
    if (rule.status === 'executed') {
      throw new Error('Reversal already executed');
    }
    
    try {
      // Get original entry
      const originalEntry = await JournalEntry.findById(rule.entryId);
      if (!originalEntry) {
        throw new Error('Original journal entry not found');
      }
      
      // Create reversal entry
      const reversalDate = rule.reversalDate || new Date();
      
      const reversalLines = originalEntry.lines.map(line => ({
        accountId: line.accountId,
        description: rule.reversalDescription || `Auto-reversal of: ${line.description || originalEntry.entryNumber}`,
        debit: line.credit,
        credit: line.debit,
        currency: line.currency,
        exchangeRate: line.exchangeRate,
        reference: `Auto-reversal of ${originalEntry.entryNumber}`,
        department: line.department,
        location: line.location,
        project: line.project,
        costCenter: line.costCenter
      }));
      
      // Create reversal entry
      const reversalEntry = await JournalEntry.create({
        entryNumber: await JournalEntry.generateEntryNumber(reversalDate),
        entryDate: reversalDate,
        entryType: 'reversing',
        source: 'system',
        sourceId: rule.ruleId,
        lines: reversalLines,
        notes: `Auto-reversal of journal entry ${originalEntry.entryNumber}. Reason: ${rule.reversalReason}`,
        tags: ['auto-reversal', rule.reversalType],
        approvalStatus: 'approved',
        approvedBy: executedBy || rule.approvedBy,
        approvedAt: new Date(),
        isPosted: true,
        postedAt: new Date(),
        postedBy: executedBy || rule.approvedBy,
        metadata: {
          createdBy: executedBy || 'system',
          updatedBy: executedBy || 'system'
        }
      });
      
      // Update original entry
      originalEntry.isReversed = true;
      originalEntry.reversedBy = reversalEntry._id;
      originalEntry.reversalDate = reversalDate;
      await originalEntry.save();
      
      // Update rule
      rule.status = 'executed';
      rule.reversalEntryId = reversalEntry._id.toString();
      rule.reversalEntryNumber = reversalEntry.entryNumber;
      rule.executedAt = new Date();
      rule.executedBy = executedBy || 'system';
      
      rule.auditTrail.push({
        timestamp: new Date(),
        action: 'executed',
        performedBy: executedBy || 'system',
        details: `Reversal entry ${reversalEntry.entryNumber} created successfully`,
        previousStatus: 'approved',
        newStatus: 'executed'
      });
      
      await this.saveReversalRule(rule);
      
      // Send notifications
      if (rule.notifyOnExecution) {
        await this.sendReversalNotifications(rule, 'executed');
      }
      
      return reversalEntry._id.toString();
      
    } catch (error) {
      // Handle execution failure
      rule.status = 'failed';
      rule.error = error instanceof Error ? error.message : 'Unknown error';
      rule.retryCount = (rule.retryCount || 0) + 1;
      
      rule.auditTrail.push({
        timestamp: new Date(),
        action: 'failed',
        performedBy: executedBy || 'system',
        details: `Reversal execution failed: ${rule.error}`,
        previousStatus: 'approved',
        newStatus: 'failed'
      });
      
      await this.saveReversalRule(rule);
      
      // Send failure notifications
      if (rule.notifyOnFailure) {
        await this.sendReversalNotifications(rule, 'failed');
      }
      
      throw error;
    }
  }
  
  // Cancel reversal
  async cancelReversal(ruleId: string, reason: string, cancelledBy: string): Promise<void> {
    const rule = await this.getReversalRuleById(ruleId);
    if (!rule) {
      throw new Error('Reversal rule not found');
    }
    
    if (rule.status === 'executed') {
      throw new Error('Cannot cancel executed reversal');
    }
    
    if (rule.status === 'cancelled') {
      throw new Error('Reversal already cancelled');
    }
    
    // Update rule
    const previousStatus = rule.status;
    rule.status = 'cancelled';
    
    rule.auditTrail.push({
      timestamp: new Date(),
      action: 'cancelled',
      performedBy: cancelledBy,
      details: `Reversal cancelled: ${reason}`,
      previousStatus,
      newStatus: 'cancelled'
    });
    
    await this.saveReversalRule(rule);
    
    // Send notifications
    await this.sendReversalNotifications(rule, 'cancelled');
  }
  
  // Get pending reversals
  async getPendingReversals(): Promise<AutoReversalRule[]> {
    // Mock implementation
    return [];
  }
  
  // Process scheduled reversals
  async processScheduledReversals(): Promise<number> {
    const pendingRules = await this.getPendingReversals();
    const now = new Date();
    let processedCount = 0;
    
    for (const rule of pendingRules) {
      // Check if reversal date has arrived
      if (rule.reversalDate && rule.reversalDate <= now) {
        try {
          await this.executeReversal(rule.ruleId);
          processedCount++;
        } catch (error) {
          console.error(`Failed to execute reversal ${rule.ruleId}:`, error);
        }
      }
    }
    
    return processedCount;
  }
  
  // Create reversal batch
  async createReversalBatch(params: {
    name: string;
    description: string;
    batchType: 'period-end' | 'mass-reversal' | 'correction' | 'system-generated';
    targetPeriod: string;
    includeUnposted?: boolean;
    includePosted?: boolean;
    entryTypes?: string[];
    accountIds?: string[];
    amountRange?: {
      min?: number;
      max?: number;
    };
    reversalDate: Date;
    reversalReason: string;
    requiresApproval?: boolean;
    createdBy: string;
  }): Promise<ReversalBatch> {
    const batchId = `BATCH-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Find entries to reverse
    const entries = await this.findEntriesForBatch(params);
    
    const batch: ReversalBatch = {
      batchId,
      name: params.name,
      description: params.description,
      
      configuration: {
        batchType: params.batchType,
        targetPeriod: params.targetPeriod,
        includeUnposted: params.includeUnposted ?? false,
        includePosted: params.includePosted ?? true,
        entryTypes: params.entryTypes,
        accountIds: params.accountIds,
        amountRange: params.amountRange,
        reversalDate: params.reversalDate,
        reversalReason: params.reversalReason,
        requiresApproval: params.requiresApproval ?? true
      },
      
      status: 'draft',
      
      processing: {
        processedBy: params.createdBy,
        totalEntries: entries.length,
        processedEntries: 0,
        successfulReversals: 0,
        failedReversals: 0,
        errors: []
      },
      
      results: {
        reversalRules: [],
        reversalEntries: [],
        summary: {
          totalAmount: 0,
          totalReversals: 0,
          averageAmount: 0
        }
      },
      
      approval: {
        required: params.requiresApproval ?? true,
        approvers: []
      },
      
      metadata: {
        createdBy: params.createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
        updatedBy: params.createdBy
      }
    };
    
    // Save batch
    await this.saveReversalBatch(batch);
    
    return batch;
  }
  
  // Get reversal analytics
  async getReversalAnalytics(params: {
    startDate: Date;
    endDate: Date;
    reversalType?: string;
    status?: string;
  }): Promise<ReversalAnalytics> {
    // Mock analytics implementation
    return {
      period: {
        startDate: params.startDate,
        endDate: params.endDate
      },
      
      overview: {
        totalReversals: 500,
        successfulReversals: 480,
        failedReversals: 15,
        pendingReversals: 5,
        cancelledReversals: 0,
        averageReversalTime: 24.5,
        reversalRate: 12.5
      },
      
      reversalAnalysis: {
        byType: {
          'next-day': { count: 300, totalAmount: 1500000, averageAmount: 5000, successRate: 98.0 },
          'next-period': { count: 150, totalAmount: 750000, averageAmount: 5000, successRate: 95.0 },
          'specific-date': { count: 50, totalAmount: 250000, averageAmount: 5000, successRate: 90.0 }
        },
        byReason: {
          'Period-end adjustment': { count: 200, totalAmount: 1000000, averageAmount: 5000 },
          'Error correction': { count: 150, totalAmount: 750000, averageAmount: 5000 },
          'Accrual reversal': { count: 100, totalAmount: 500000, averageAmount: 5000 },
          'Prepayment reversal': { count: 50, totalAmount: 250000, averageAmount: 5000 }
        },
        byPeriod: {
          '2024-01': { count: 150, totalAmount: 750000, averageAmount: 5000, successRate: 96.0 },
          '2024-02': { count: 175, totalAmount: 875000, averageAmount: 5000, successRate: 95.0 },
          '2024-03': { count: 175, totalAmount: 875000, averageAmount: 5000, successRate: 97.0 }
        },
        byAccount: [
          {
            accountId: 'acc1',
            accountCode: '1000',
            accountName: 'Cash',
            reversalCount: 100,
            totalReversed: 500000,
            percentage: 20.0
          }
        ]
      },
      
      schedulePerformance: [
        {
          scheduleId: 'sched1',
          scheduleName: 'Monthly Accrual Reversals',
          totalExecutions: 12,
          successfulExecutions: 11,
          failedExecutions: 1,
          averageExecutionTime: 45.0,
          successRate: 91.7,
          lastExecutionAt: new Date(),
          nextExecutionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      ],
      
      errorAnalysis: {
        commonErrors: [
          {
            errorType: 'Entry already reversed',
            count: 8,
            percentage: 53.3,
            description: 'Attempted to reverse an already reversed entry',
            resolution: 'Check reversal status before scheduling'
          },
          {
            errorType: 'Account inactive',
            count: 4,
            percentage: 26.7,
            description: 'Reversal uses inactive account',
            resolution: 'Activate account or use alternative account'
          }
        ],
        failedReversals: [
          {
            ruleId: 'rev1',
            entryNumber: 'JE-2024-00123',
            error: 'Entry already reversed',
            failedAt: new Date(),
            retryCount: 2
          }
        ]
      },
      
      trends: {
        monthly: [
          {
            month: '2024-01',
            reversals: 150,
            amount: 750000,
            successRate: 96.0,
            averageTime: 23.5
          },
          {
            month: '2024-02',
            reversals: 175,
            amount: 875000,
            successRate: 95.0,
            averageTime: 25.0
          },
          {
            month: '2024-03',
            reversals: 175,
            amount: 875000,
            successRate: 97.0,
            averageTime: 24.5
          }
        ],
        daily: [
          {
            date: '2024-03-01',
            reversals: 25,
            amount: 125000,
            successRate: 96.0
          }
        ]
      },
      
      recommendations: [
        {
          type: 'error_reduction',
          priority: 'high',
          title: 'Prevent Duplicate Reversals',
          description: 'Implement validation to prevent scheduling reversals for already reversed entries',
          impact: 'Reduce errors by 53%',
          effort: 'medium',
          affectedItems: 8
        }
      ]
    };
  }
  
  // Helper methods
  private calculateReversalDate(entryDate: Date, reversalType: string): Date {
    const reversalDate = new Date(entryDate);
    
    switch (reversalType) {
      case 'next-day':
        reversalDate.setDate(reversalDate.getDate() + 1);
        break;
      case 'next-period':
        // Move to first day of next month
        reversalDate.setMonth(reversalDate.getMonth() + 1);
        reversalDate.setDate(1);
        break;
      case 'specific-date':
        // This should be provided by user
        throw new Error('Specific date must be provided for specific-date reversal type');
      default:
        reversalDate.setDate(reversalDate.getDate() + 1);
    }
    
    return reversalDate;
  }
  
  private async initiateReversalApproval(rule: AutoReversalRule): Promise<void> {
    // Mock approval initiation
    console.log(`Initiating approval for reversal rule ${rule.ruleId}`);
  }
  
  private async sendReversalNotifications(rule: AutoReversalRule, action: string): Promise<void> {
    // Mock notification sending
    console.log(`Sending ${action} notifications for reversal rule ${rule.ruleId}`);
  }
  
  private async findEntriesForBatch(params: any): Promise<IJournalEntry[]> {
    // Mock implementation
    return [];
  }
  
  // Database operations (mock implementations)
  private async saveReversalRule(rule: AutoReversalRule): Promise<void> {
    console.log(`Saving reversal rule ${rule.ruleId}`);
  }
  
  private async saveReversalBatch(batch: ReversalBatch): Promise<void> {
    console.log(`Saving reversal batch ${batch.batchId}`);
  }
  
  private async getReversalRuleById(ruleId: string): Promise<AutoReversalRule | null> {
    // Mock implementation
    return null;
  }
  
  private async getReversalRuleByEntryId(entryId: string): Promise<AutoReversalRule | null> {
    // Mock implementation
    return null;
  }
}
