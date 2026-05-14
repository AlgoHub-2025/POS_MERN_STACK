import { Expense, IExpense } from '../models/Expense';
import { ExpenseCategory } from '../models/ExpenseCategory';
import { User } from '../models/User';

export interface ExpenseLimit {
  limitId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  role: string;
  
  // Limit Configuration
  limitType: 'monthly' | 'quarterly' | 'yearly' | 'per_expense' | 'category_based' | 'custom';
  
  // Amount Limits
  limits: {
    perExpense?: number;
    daily?: number;
    weekly?: number;
    monthly?: number;
    quarterly?: number;
    yearly?: number;
  };
  
  // Category Limits
  categoryLimits: Array<{
    categoryId: string;
    categoryName: string;
    limit: number;
    period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    utilized: number;
    remaining: number;
  }>;
  
  // Approval Thresholds
  approvalThresholds: {
    autoApprovalLimit: number;
    managerApprovalLimit: number;
    directorApprovalLimit: number;
    executiveApprovalLimit: number;
  };
  
  // Special Limits
  specialLimits: {
    cashAdvanceLimit: number;
    mileageLimit?: number; // per month
    perDiemLimit?: number; // per day
    entertainmentLimit?: number; // per month
    giftLimit?: number; // per recipient per year
  };
  
  // Override Rules
  overrideRules: {
    allowedOverrides: Array<{
      condition: string;
      maxOverrideAmount: number;
      requiredApprover: string;
      justificationRequired: boolean;
    }>;
    temporaryIncreases: Array<{
      increaseId: string;
      amount: number;
      reason: string;
      startDate: Date;
      endDate: Date;
      approvedBy: string;
      approvedAt: Date;
      utilized: number;
    }>;
  };
  
  // Utilization Tracking
  utilization: {
    currentPeriod: {
      startDate: Date;
      endDate: Date;
      spent: number;
      committed: number;
      available: number;
      utilizationRate: number;
    };
    previousPeriod: {
      spent: number;
      utilizationRate: number;
    };
    yearToDate: {
      spent: number;
      committed: number;
      utilizationRate: number;
    };
  };
  
  // Alert Configuration
  alerts: {
    utilizationThresholds: {
      warning: number; // percentage
      critical: number; // percentage
      exceeded: number; // percentage
    };
    notificationRecipients: string[];
    alertFrequency: 'immediate' | 'daily' | 'weekly';
  };
  
  // Status and Lifecycle
  status: 'active' | 'inactive' | 'suspended' | 'expired';
  effectiveDate: Date;
  expirationDate?: Date;
  
  // Audit Trail
  auditTrail: Array<{
    timestamp: Date;
    action: string;
    performedBy: string;
    details: string;
    previousValues?: Record<string, any>;
    newValues?: Record<string, any>;
  }>;
  
  // Metadata
  metadata: {
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
    lastReviewed?: Date;
    reviewedBy?: string;
    nextReviewDate?: Date;
    version: number;
    notes?: string;
  };
}

export interface LimitCheckRequest {
  employeeId: string;
  expenseAmount: number;
  categoryId?: string;
  expenseDate?: Date;
  includeCommitted?: boolean;
}

export interface LimitCheckResult {
  limitId: string;
  employeeId: string;
  expenseAmount: number;
  
  // Check Results
  withinLimits: boolean;
  requiresApproval: boolean;
  blocked: boolean;
  
  // Limit Details
  limitDetails: {
    limitType: string;
    applicableLimit: number;
    utilizedAmount: number;
    remainingAmount: number;
    utilizationRate: number;
  };
  
  // Category Specific
  categoryLimit?: {
    applicable: boolean;
    limit: number;
    utilized: number;
    remaining: number;
  };
  
  // Approval Requirements
  approvalRequirements: {
    required: boolean;
    level: string;
    approvers: string[];
    reason: string;
  };
  
  // Warnings and Alerts
  warnings: Array<{
    type: 'utilization_high' | 'approaching_limit' | 'category_limit' | 'temp_limit_expiring';
    message: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  
  // Recommendations
  recommendations: Array<{
    type: 'wait_until_next_period' | 'use_different_category' | 'request_increase' | 'split_expense';
    message: string;
    priority: 'low' | 'medium' | 'high';
  }>;
  
  // Processing Info
  checkedAt: Date;
  processedBy: string;
}

export interface LimitIncreaseRequest {
  requestId: string;
  employeeId: string;
  employeeName: string;
  requestedBy: string;
  
  // Request Details
  limitType: 'temporary' | 'permanent';
  limitCategory: 'monthly' | 'quarterly' | 'yearly' | 'category' | 'per_expense';
  currentLimit: number;
  requestedLimit: number;
  increaseAmount: number;
  
  // Justification
  reason: string;
  justification: string;
  businessCase?: string;
  expectedDuration?: {
    startDate: Date;
    endDate: Date;
  };
  
  // Supporting Information
  supportingDocuments: Array<{
    documentId: string;
    name: string;
    url: string;
    uploadedAt: Date;
  }>;
  
  // Approval Workflow
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'implemented' | 'expired';
  approvals: Array<{
    approverId: string;
    approverName: string;
    approverRole: string;
    status: 'pending' | 'approved' | 'rejected';
    date?: Date;
    comments?: string;
  }>;
  
  // Implementation
  implementation?: {
    implementedBy: string;
    implementedAt: Date;
    newLimitId: string;
    effectiveDate: Date;
    expirationDate?: Date;
  };
  
  // Audit Trail
  auditTrail: Array<{
    timestamp: Date;
    action: string;
    performedBy: string;
    details: string;
  }>;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

export interface LimitAnalytics {
  period: {
    startDate: Date;
    endDate: Date;
  };
  
  // Overview Metrics
  overview: {
    totalEmployees: number;
    employeesWithLimits: number;
    totalLimitAmount: number;
    totalUtilized: number;
    averageUtilizationRate: number;
    overLimitEmployees: number;
    nearLimitEmployees: number;
  };
  
  // Utilization Analysis
  utilizationAnalysis: {
    utilizationDistribution: Array<{
      range: string;
      count: number;
      percentage: number;
    }>;
    topUtilizers: Array<{
      employeeId: string;
      employeeName: string;
      department: string;
      limit: number;
      utilized: number;
      utilizationRate: number;
    }>;
    underUtilizedAccounts: Array<{
      employeeId: string;
      employeeName: string;
      limit: number;
      utilized: number;
      utilizationRate: number;
      potentialSavings: number;
    }>;
  };
  
  // Category Analysis
  categoryAnalysis: Array<{
    categoryId: string;
    categoryName: string;
    totalLimit: number;
    totalUtilized: number;
    utilizationRate: number;
    averagePerEmployee: number;
    topSpendingEmployees: Array<{
      employeeId: string;
      employeeName: string;
      amount: number;
    }>;
  }>;
  
  // Approval Analysis
  approvalAnalysis: {
    limitIncreaseRequests: {
      total: number;
      approved: number;
      rejected: number;
      pending: number;
      approvalRate: number;
      averageProcessingTime: number;
    };
    approvalByLevel: Record<string, {
      requested: number;
      approved: number;
      rejected: number;
      approvalRate: number;
    }>;
    commonReasons: Array<{
      reason: string;
      count: number;
      approvalRate: number;
    }>;
  };
  
  // Trends
  trends: {
    monthlyUtilization: Array<{
      month: string;
      totalLimit: number;
      totalUtilized: number;
      utilizationRate: number;
      employeeCount: number;
    }>;
    limitChanges: Array<{
      date: string;
      type: 'increase' | 'decrease';
      count: number;
      totalAmount: number;
    }>;
    overLimitIncidents: Array<{
      date: string;
      incidents: number;
      employees: number;
    }>;
  };
  
  // Recommendations
  recommendations: Array<{
    type: 'limit_adjustment' | 'policy_review' | 'training' | 'process_improvement';
    priority: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    impact: string;
    affectedEmployees: number;
    potentialSavings?: number;
  }>;
}

export class ExpenseLimitService {
  // Create expense limit
  async createExpenseLimit(params: {
    employeeId: string;
    limitType: 'monthly' | 'quarterly' | 'yearly' | 'per_expense' | 'category_based' | 'custom';
    limits: {
      perExpense?: number;
      daily?: number;
      weekly?: number;
      monthly?: number;
      quarterly?: number;
      yearly?: number;
    };
    categoryLimits?: Array<{
      categoryId: string;
      categoryName: string;
      limit: number;
      period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    }>;
    approvalThresholds?: {
      autoApprovalLimit?: number;
      managerApprovalLimit?: number;
      directorApprovalLimit?: number;
      executiveApprovalLimit?: number;
    };
    specialLimits?: {
      cashAdvanceLimit?: number;
      mileageLimit?: number;
      perDiemLimit?: number;
      entertainmentLimit?: number;
      giftLimit?: number;
    };
    alerts?: {
      utilizationThresholds?: {
        warning?: number;
        critical?: number;
        exceeded?: number;
      };
      notificationRecipients?: string[];
      alertFrequency?: 'immediate' | 'daily' | 'weekly';
    };
    effectiveDate?: Date;
    expirationDate?: Date;
    createdBy: string;
  }): Promise<ExpenseLimit> {
    // Validate employee
    const employee = await User.findById(params.employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }
    
    // Check for existing limits
    const existingLimit = await this.getEmployeeLimit(params.employeeId);
    if (existingLimit && existingLimit.status === 'active') {
      throw new Error('Employee already has active expense limits');
    }
    
    const limitId = `LIMIT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const limit: ExpenseLimit = {
      limitId,
      employeeId: params.employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      department: employee.department || 'Unknown',
      role: employee.role || 'Unknown',
      
      limitType: params.limitType,
      
      limits: {
        perExpense: params.limits.perExpense,
        daily: params.limits.daily,
        weekly: params.limits.weekly,
        monthly: params.limits.monthly,
        quarterly: params.limits.quarterly,
        yearly: params.limits.yearly
      },
      
      categoryLimits: params.categoryLimits?.map(cat => ({
        ...cat,
        utilized: 0,
        remaining: cat.limit
      })) || [],
      
      approvalThresholds: {
        autoApprovalLimit: params.approvalThresholds?.autoApprovalLimit || 100,
        managerApprovalLimit: params.approvalThresholds?.managerApprovalLimit || 500,
        directorApprovalLimit: params.approvalThresholds?.directorApprovalLimit || 2500,
        executiveApprovalLimit: params.approvalThresholds?.executiveApprovalLimit || 10000
      },
      
      specialLimits: {
        cashAdvanceLimit: params.specialLimits?.cashAdvanceLimit || 500,
        mileageLimit: params.specialLimits?.mileageLimit,
        perDiemLimit: params.specialLimits?.perDiemLimit,
        entertainmentLimit: params.specialLimits?.entertainmentLimit,
        giftLimit: params.specialLimits?.giftLimit
      },
      
      overrideRules: {
        allowedOverrides: [],
        temporaryIncreases: []
      },
      
      utilization: {
        currentPeriod: {
          startDate: this.getPeriodStartDate('monthly'),
          endDate: this.getPeriodEndDate('monthly'),
          spent: 0,
          committed: 0,
          available: params.limits.monthly || 0,
          utilizationRate: 0
        },
        previousPeriod: {
          spent: 0,
          utilizationRate: 0
        },
        yearToDate: {
          spent: 0,
          committed: 0,
          utilizationRate: 0
        }
      },
      
      alerts: {
        utilizationThresholds: {
          warning: params.alerts?.utilizationThresholds?.warning || 80,
          critical: params.alerts?.utilizationThresholds?.critical || 95,
          exceeded: params.alerts?.utilizationThresholds?.exceeded || 100
        },
        notificationRecipients: params.alerts?.notificationRecipients || [],
        alertFrequency: params.alerts?.alertFrequency || 'weekly'
      },
      
      status: 'active',
      effectiveDate: params.effectiveDate || new Date(),
      expirationDate: params.expirationDate,
      
      auditTrail: [{
        timestamp: new Date(),
        action: 'Limit Created',
        performedBy: params.createdBy,
        details: `Expense limit created for ${employee.firstName} ${employee.lastName}`
      }],
      
      metadata: {
        createdAt: new Date(),
        createdBy: params.createdBy,
        updatedAt: new Date(),
        updatedBy: params.createdBy,
        version: 1
      }
    };
    
    // Save limit
    await this.saveExpenseLimit(limit);
    
    // Send notifications
    await this.sendLimitNotifications(limit, 'created');
    
    return limit;
  }
  
  // Check expense against limits
  async checkExpenseLimits(params: LimitCheckRequest): Promise<LimitCheckResult> {
    const limit = await this.getEmployeeLimit(params.employeeId);
    if (!limit || limit.status !== 'active') {
      // No limits or inactive limits
      return {
        limitId: 'none',
        employeeId: params.employeeId,
        expenseAmount: params.expenseAmount,
        withinLimits: true,
        requiresApproval: false,
        blocked: false,
        limitDetails: {
          limitType: 'none',
          applicableLimit: 0,
          utilizedAmount: 0,
          remainingAmount: 0,
          utilizationRate: 0
        },
        approvalRequirements: {
          required: false,
          level: 'none',
          approvers: [],
          reason: 'No limits configured'
        },
        warnings: [],
        recommendations: [],
        checkedAt: new Date(),
        processedBy: 'system'
      };
    }
    
    // Update utilization data
    await this.updateUtilization(limit);
    
    const result: LimitCheckResult = {
      limitId: limit.limitId,
      employeeId: params.employeeId,
      expenseAmount: params.expenseAmount,
      
      withinLimits: true,
      requiresApproval: false,
      blocked: false,
      
      limitDetails: {
        limitType: limit.limitType,
        applicableLimit: 0,
        utilizedAmount: 0,
        remainingAmount: 0,
        utilizationRate: 0
      },
      
      approvalRequirements: {
        required: false,
        level: 'none',
        approvers: [],
        reason: ''
      },
      
      warnings: [],
      recommendations: [],
      
      checkedAt: new Date(),
      processedBy: 'system'
    };
    
    // Check per-expense limit
    if (limit.limits.perExpense) {
      if (params.expenseAmount > limit.limits.perExpense) {
        result.blocked = true;
        result.withinLimits = false;
        result.warnings.push({
          type: 'per_expense_limit',
          message: `Expense amount $${params.expenseAmount} exceeds per-expense limit of $${limit.limits.perExpense}`,
          severity: 'high'
        });
      }
    }
    
    // Check monthly limit
    if (limit.limits.monthly) {
      const monthlyUtilized = limit.utilization.currentPeriod.spent + 
                             (params.includeCommitted ? limit.utilization.currentPeriod.committed : 0);
      const remaining = limit.limits.monthly - monthlyUtilized;
      
      result.limitDetails.applicableLimit = limit.limits.monthly;
      result.limitDetails.utilizedAmount = monthlyUtilized;
      result.limitDetails.remainingAmount = remaining;
      result.limitDetails.utilizationRate = (monthlyUtilized / limit.limits.monthly) * 100;
      
      if (params.expenseAmount > remaining) {
        result.withinLimits = false;
        result.blocked = true;
        result.warnings.push({
          type: 'monthly_limit',
          message: `Expense would exceed monthly limit. Remaining: $${remaining}`,
          severity: 'high'
        });
      } else if (monthlyUtilized + params.expenseAmount > limit.limits.monthly * 0.9) {
        result.warnings.push({
          type: 'approaching_limit',
          message: 'Expense would bring utilization above 90% of monthly limit',
          severity: 'medium'
        });
      }
    }
    
    // Check category limits
    if (params.categoryId) {
      const categoryLimit = limit.categoryLimits.find(cat => cat.categoryId === params.categoryId);
      if (categoryLimit) {
        const categoryUtilized = await this.getCategoryUtilization(params.employeeId, params.categoryId);
        const categoryRemaining = categoryLimit.limit - categoryUtilized;
        
        result.categoryLimit = {
          applicable: true,
          limit: categoryLimit.limit,
          utilized: categoryUtilized,
          remaining: categoryRemaining
        };
        
        if (params.expenseAmount > categoryRemaining) {
          result.withinLimits = false;
          result.warnings.push({
            type: 'category_limit',
            message: `Expense would exceed category limit for ${categoryLimit.categoryName}`,
            severity: 'high'
          });
        }
      }
    }
    
    // Check approval requirements
    const approvalLevel = this.getApprovalLevel(limit, params.expenseAmount);
    if (approvalLevel !== 'none') {
      result.requiresApproval = true;
      result.approvalRequirements = {
        required: true,
        level: approvalLevel,
        approvers: await this.getApproversForLevel(approvalLevel, params.employeeId),
        reason: `Expense amount requires ${approvalLevel} approval`
      };
    }
    
    // Generate recommendations
    if (!result.withinLimits) {
      result.recommendations.push({
        type: 'wait_until_next_period',
        message: 'Consider waiting until the next period to submit this expense',
        priority: 'medium'
      });
      
      if (params.categoryId) {
        result.recommendations.push({
          type: 'use_different_category',
          message: 'Consider using a different expense category with available limits',
          priority: 'low'
        });
      }
      
      result.recommendations.push({
        type: 'request_increase',
        message: 'Request a temporary limit increase for this expense',
        priority: 'high'
      });
    }
    
    // Check temporary increases
    for (const tempIncrease of limit.overrideRules.temporaryIncreases) {
      if (tempIncrease.startDate <= new Date() && tempIncrease.endDate >= new Date()) {
        if (tempIncrease.utilized < tempIncrease.amount) {
          result.warnings.push({
            type: 'temp_limit_available',
            message: `Temporary limit increase available: $${tempIncrease.amount - tempIncrease.utilized}`,
            severity: 'low'
          });
        }
      }
    }
    
    return result;
  }
  
  // Request limit increase
  async requestLimitIncrease(params: {
    employeeId: string;
    limitType: 'temporary' | 'permanent';
    limitCategory: 'monthly' | 'quarterly' | 'yearly' | 'category' | 'per_expense';
    requestedLimit: number;
    reason: string;
    justification: string;
    businessCase?: string;
    expectedDuration?: {
      startDate: Date;
      endDate: Date;
    };
    categoryId?: string;
    requestedBy: string;
  }): Promise<LimitIncreaseRequest> {
    const employee = await User.findById(params.employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }
    
    const currentLimit = await this.getEmployeeLimit(params.employeeId);
    if (!currentLimit) {
      throw new Error('No existing limit found for employee');
    }
    
    const currentAmount = this.getCurrentLimitAmount(currentLimit, params.limitCategory, params.categoryId);
    
    const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const request: LimitIncreaseRequest = {
      requestId,
      employeeId: params.employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      requestedBy: params.requestedBy,
      
      limitType: params.limitType,
      limitCategory: params.limitCategory,
      currentLimit: currentAmount,
      requestedLimit: params.requestedLimit,
      increaseAmount: params.requestedLimit - currentAmount,
      
      reason: params.reason,
      justification: params.justification,
      businessCase: params.businessCase,
      expectedDuration: params.expectedDuration,
      
      supportingDocuments: [],
      
      status: 'pending',
      approvals: [],
      
      auditTrail: [{
        timestamp: new Date(),
        action: 'Increase Requested',
        performedBy: params.requestedBy,
        details: `Limit increase requested from $${currentAmount} to $${params.requestedLimit}`
      }],
      
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: params.expectedDuration?.endDate
    };
    
    // Initialize approval workflow
    await this.initializeLimitIncreaseApproval(request);
    
    // Save request
    await this.saveLimitIncreaseRequest(request);
    
    // Send notifications
    await this.sendLimitIncreaseNotifications(request, 'requested');
    
    return request;
  }
  
  // Process limit increase approval
  async processLimitIncreaseApproval(params: {
    requestId: string;
    approverId: string;
    action: 'approve' | 'reject';
    comments?: string;
  }): Promise<LimitIncreaseRequest> {
    const request = await this.getLimitIncreaseRequest(params.requestId);
    if (!request) {
      throw new Error('Limit increase request not found');
    }
    
    if (request.status !== 'pending' && request.status !== 'under_review') {
      throw new Error('Request cannot be processed in current status');
    }
    
    // Find approver in workflow
    const approval = request.approvals.find(app => app.approverId === params.approverId);
    if (!approval) {
      throw new Error('Approver not found in approval workflow');
    }
    
    approval.status = params.action;
    approval.date = new Date();
    approval.comments = params.comments;
    
    // Update audit trail
    request.auditTrail.push({
      timestamp: new Date(),
      action: `Request ${params.action}d`,
      performedBy: params.approverId,
      details: `Limit increase request ${params.action}ed${params.comments ? `: ${params.comments}` : ''}`
    });
    
    if (params.action === 'approve') {
      // Check if all approvals are complete
      const allApproved = request.approvals.every(app => app.status === 'approved');
      if (allApproved) {
        request.status = 'approved';
        await this.implementLimitIncrease(request);
      }
    } else {
      request.status = 'rejected';
    }
    
    request.updatedAt = new Date();
    
    // Save request
    await this.updateLimitIncreaseRequest(request);
    
    // Send notifications
    await this.sendLimitIncreaseNotifications(request, params.action);
    
    return request;
  }
  
  // Get limit analytics
  async getLimitAnalytics(params: {
    startDate: Date;
    endDate: Date;
    department?: string;
    role?: string;
  }): Promise<LimitAnalytics> {
    // Mock analytics data
    return {
      period: {
        startDate: params.startDate,
        endDate: params.endDate
      },
      
      overview: {
        totalEmployees: 500,
        employeesWithLimits: 450,
        totalLimitAmount: 2500000,
        totalUtilized: 1750000,
        averageUtilizationRate: 70.0,
        overLimitEmployees: 25,
        nearLimitEmployees: 75
      },
      
      utilizationAnalysis: {
        utilizationDistribution: [
          { range: '0-50%', count: 150, percentage: 33.3 },
          { range: '51-80%', count: 200, percentage: 44.4 },
          { range: '81-100%', count: 75, percentage: 16.7 },
          { range: '100%+', count: 25, percentage: 5.6 }
        ],
        topUtilizers: [
          {
            employeeId: 'emp1',
            employeeName: 'John Smith',
            department: 'Sales',
            limit: 10000,
            utilized: 9500,
            utilizationRate: 95.0
          }
        ],
        underUtilizedAccounts: [
          {
            employeeId: 'emp2',
            employeeName: 'Jane Doe',
            limit: 5000,
            utilized: 1000,
            utilizationRate: 20.0,
            potentialSavings: 2000
          }
        ]
      },
      
      categoryAnalysis: [
        {
          categoryId: 'cat1',
          categoryName: 'Travel',
          totalLimit: 500000,
          totalUtilized: 400000,
          utilizationRate: 80.0,
          averagePerEmployee: 2000,
          topSpendingEmployees: [
            { employeeId: 'emp1', employeeName: 'John Smith', amount: 5000 }
          ]
        }
      ],
      
      approvalAnalysis: {
        limitIncreaseRequests: {
          total: 100,
          approved: 75,
          rejected: 20,
          pending: 5,
          approvalRate: 75.0,
          averageProcessingTime: 72 // hours
        },
        approvalByLevel: {
          manager: { requested: 60, approved: 50, rejected: 8, approvalRate: 83.3 },
          director: { requested: 30, approved: 20, rejected: 8, approvalRate: 66.7 },
          executive: { requested: 10, approved: 5, rejected: 4, approvalRate: 50.0 }
        },
        commonReasons: [
          { reason: 'Business travel increase', count: 30, approvalRate: 90.0 },
          { reason: 'Project requirements', count: 25, approvalRate: 80.0 },
          { reason: 'Client entertainment', count: 20, approvalRate: 60.0 }
        ]
      },
      
      trends: {
        monthlyUtilization: [
          { month: '2024-01', totalLimit: 200000, totalUtilized: 140000, utilizationRate: 70.0, employeeCount: 450 },
          { month: '2024-02', totalLimit: 205000, totalUtilized: 150000, utilizationRate: 73.2, employeeCount: 455 }
        ],
        limitChanges: [
          { date: '2024-01-15', type: 'increase', count: 15, totalAmount: 50000 },
          { date: '2024-02-01', type: 'decrease', count: 5, totalAmount: -15000 }
        ],
        overLimitIncidents: [
          { date: '2024-01-31', incidents: 25, employees: 20 },
          { date: '2024-02-28', incidents: 30, employees: 25 }
        ]
      },
      
      recommendations: [
        {
          type: 'limit_adjustment',
          priority: 'high',
          description: 'Review and adjust limits for high-utilization employees',
          impact: 'Reduce over-limit incidents by 30%',
          affectedEmployees: 50,
          potentialSavings: 100000
        }
      ]
    };
  }
  
  // Helper methods
  private async getEmployeeLimit(employeeId: string): Promise<ExpenseLimit | null> {
    // Mock implementation
    return null;
  }
  
  private getPeriodStartDate(period: string): Date {
    const now = new Date();
    switch (period) {
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'quarterly':
        const quarter = Math.floor(now.getMonth() / 3);
        return new Date(now.getFullYear(), quarter * 3, 1);
      case 'yearly':
        return new Date(now.getFullYear(), 0, 1);
      default:
        return now;
    }
  }
  
  private getPeriodEndDate(period: string): Date {
    const now = new Date();
    switch (period) {
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth() + 1, 0);
      case 'quarterly':
        const quarter = Math.floor(now.getMonth() / 3);
        return new Date(now.getFullYear(), quarter * 3 + 3, 0);
      case 'yearly':
        return new Date(now.getFullYear(), 11, 31);
      default:
        return now;
    }
  }
  
  private async updateUtilization(limit: ExpenseLimit): Promise<void> {
    // Mock implementation - would query expense data
    limit.utilization.currentPeriod.spent = Math.floor(Math.random() * limit.limits.monthly! * 0.7);
    limit.utilization.currentPeriod.utilizationRate = 
      (limit.utilization.currentPeriod.spent / limit.limits.monthly!) * 100;
  }
  
  private async getCategoryUtilization(employeeId: string, categoryId: string): Promise<number> {
    // Mock implementation
    return Math.floor(Math.random() * 1000);
  }
  
  private getApprovalLevel(limit: ExpenseLimit, amount: number): string {
    if (amount <= limit.approvalThresholds.autoApprovalLimit) return 'none';
    if (amount <= limit.approvalThresholds.managerApprovalLimit) return 'manager';
    if (amount <= limit.approvalThresholds.directorApprovalLimit) return 'director';
    if (amount <= limit.approvalThresholds.executiveApprovalLimit) return 'executive';
    return 'board';
  }
  
  private async getApproversForLevel(level: string, employeeId: string): Promise<string[]> {
    // Mock implementation
    return [`approver_${level}`];
  }
  
  private getCurrentLimitAmount(limit: ExpenseLimit, category: string, categoryId?: string): number {
    switch (category) {
      case 'monthly':
        return limit.limits.monthly || 0;
      case 'quarterly':
        return limit.limits.quarterly || 0;
      case 'yearly':
        return limit.limits.yearly || 0;
      case 'per_expense':
        return limit.limits.perExpense || 0;
      case 'category':
        if (categoryId) {
          const catLimit = limit.categoryLimits.find(cat => cat.categoryId === categoryId);
          return catLimit?.limit || 0;
        }
        return 0;
      default:
        return 0;
    }
  }
  
  private async initializeLimitIncreaseApproval(request: LimitIncreaseRequest): Promise<void> {
    // Mock approval workflow initialization
    request.approvals = [
      {
        approverId: 'manager_123',
        approverName: 'Manager Name',
        approverRole: 'manager',
        status: 'pending'
      }
    ];
  }
  
  private async implementLimitIncrease(request: LimitIncreaseRequest): Promise<void> {
    // Mock implementation
    request.implementation = {
      implementedBy: 'system',
      implementedAt: new Date(),
      newLimitId: `LIMIT-${Date.now()}`,
      effectiveDate: new Date(),
      expirationDate: request.expectedDuration?.endDate
    };
    request.status = 'implemented';
  }
  
  // Database operations (mock implementations)
  private async saveExpenseLimit(limit: ExpenseLimit): Promise<void> {
    console.log(`Saving expense limit ${limit.limitId}`);
  }
  
  private async saveLimitIncreaseRequest(request: LimitIncreaseRequest): Promise<void> {
    console.log(`Saving limit increase request ${request.requestId}`);
  }
  
  private async updateLimitIncreaseRequest(request: LimitIncreaseRequest): Promise<void> {
    console.log(`Updating limit increase request ${request.requestId}`);
  }
  
  private async getLimitIncreaseRequest(requestId: string): Promise<LimitIncreaseRequest | null> {
    // Mock implementation
    return null;
  }
  
  private async sendLimitNotifications(limit: ExpenseLimit, action: string): Promise<void> {
    console.log(`Sending ${action} notifications for limit ${limit.limitId}`);
  }
  
  private async sendLimitIncreaseNotifications(request: LimitIncreaseRequest, action: string): Promise<void> {
    console.log(`Sending ${action} notifications for limit increase request ${request.requestId}`);
  }
}
