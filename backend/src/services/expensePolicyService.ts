import { ExpensePolicy, IExpensePolicy, PolicyRule, PerDiemRate } from '../models/ExpensePolicy';
import { Expense, IExpense } from '../models/Expense';
import { User } from '../models/User';

export interface PolicyCreateRequest {
  name: string;
  code: string;
  description: string;
  effectiveDate: Date;
  expirationDate?: Date;
  appliesTo: {
    departments?: string[];
    roles?: string[];
    locations?: string[];
    employmentTypes?: string[];
    employeeIds?: string[];
    excludeEmployees?: string[];
  };
  rules?: Array<{
    name: string;
    description: string;
    priority: number;
    conditions: Array<{
      logicalOperator: 'and' | 'or';
      rules: Array<{
        field: string;
        operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'greater_equal' | 'less_equal' | 'contains' | 'in' | 'between';
        value: any;
        value2?: any;
        caseSensitive?: boolean;
      }>;
    }>;
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
    exceptions?: Array<{
      condition: {
        field: string;
        operator: string;
        value: any;
        value2?: any;
        caseSensitive?: boolean;
      };
      action: 'override' | 'skip' | 'modify';
      modifiedAction?: any;
    }>;
    category?: 'general' | 'travel' | 'meals' | 'entertainment' | 'office' | 'technology' | 'custom';
    tags?: string[];
  }>;
  perDiemRates?: Array<{
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
  }>;
  mileageRate?: number;
  mileageRules?: {
    requiresOdometer?: boolean;
    requiresRoute?: boolean;
    maxDailyMiles?: number;
    maxWeeklyMiles?: number;
    maxMonthlyMiles?: number;
    businessPercentageRequired?: boolean;
    commutingMilesExcluded?: boolean;
    personalUseDeduction?: number;
    documentationRequired?: string[];
    gpsTrackingRequired?: boolean;
  };
  receiptRules?: {
    requiredForAllExpenses?: boolean;
    minimumAmount?: number;
    exceptions?: Array<{
      category: string;
      maxAmount: number;
      reason: string;
    }>;
    digitalReceiptsAccepted?: boolean;
    receiptFormat?: 'pdf' | 'image' | 'any';
    storageRequirements?: {
      retentionPeriod?: number;
      mustBeLegible?: boolean;
      mustShowDate?: boolean;
      mustShowAmount?: boolean;
      mustShowMerchant?: boolean;
    };
  };
  approvalRules?: {
    defaultApprovers?: string[];
    approvalMatrix?: Array<{
      amountRange: {
        min: number;
        max: number;
      };
      approvers: string[];
      parallelApproval?: boolean;
      escalationRules?: Array<{
        delay: number;
        escalateTo: string[];
      }>;
    }>;
    autoApprovalConditions?: Array<{
      category: string;
      maxAmount: number;
      employeeRole?: string;
    }>;
    delegationAllowed?: boolean;
    delegationMaxDays?: number;
  };
  paymentMethodRules?: {
    allowedMethods?: string[];
    restrictedCategories?: Array<{
      category: string;
      allowedMethods: string[];
    }>;
    corporateCardRequired?: Array<{
      category: string;
      minAmount: number;
    }>;
    cashAdvanceLimits?: {
      daily?: number;
      weekly?: number;
      monthly?: number;
    };
  };
  timeLimits?: {
    submissionWindow?: number;
    approvalWindow?: number;
    modificationWindow?: number;
    appealWindow?: number;
  };
  compliance?: {
    requiresPolicyAcknowledgment?: boolean;
    acknowledgmentFrequency?: 'once' | 'quarterly' | 'semi_annually' | 'annually';
    auditFrequency?: 'random' | 'monthly' | 'quarterly' | 'annually';
    auditPercentage?: number;
    requiredFields?: string[];
    prohibitedExpenses?: Array<{
      category: string;
      description: string;
      exceptions?: string[];
    }>;
  };
  notifications?: {
    policyViolations?: {
      enabled?: boolean;
      recipients?: string[];
      includeEmployee?: boolean;
      severity?: 'low' | 'medium' | 'high' | 'critical';
    };
    policyUpdates?: {
      enabled?: boolean;
      recipients?: string[];
      advanceNotice?: number;
    };
    expiringPolicies?: {
      enabled?: boolean;
      recipients?: string[];
      noticePeriod?: number;
    };
  };
  tags?: string[];
  notes?: string;
  createdBy: string;
}

export interface PolicyEvaluationRequest {
  expenseId: string;
  employeeId?: string;
  evaluationDate?: Date;
  includeWarnings?: boolean;
}

export interface PolicyEvaluationResult {
  policyId: string;
  policyName: string;
  policyVersion: number;
  expenseId: string;
  evaluationDate: Date;
  
  // Overall Result
  approved: boolean;
  requiresApproval: boolean;
  autoApprove: boolean;
  
  // Violations
  violations: Array<{
    ruleId: string;
    ruleName: string;
    ruleCategory: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    action: 'block' | 'require_approval' | 'warn';
    message: string;
    details?: any;
    canOverride: boolean;
    requiresJustification: boolean;
  }>;
  
  // Warnings
  warnings: Array<{
    ruleId: string;
    ruleName: string;
    ruleCategory: string;
    message: string;
    recommendation?: string;
  }>;
  
  // Required Actions
  requiredActions: Array<{
    type: 'approval' | 'documentation' | 'justification' | 'modification';
    description: string;
    deadline?: Date;
    assignee?: string;
  }>;
  
  // Policy Information
  applicablePolicies: Array<{
    policyId: string;
    policyName: string;
    version: number;
    appliedRules: string[];
  }>;
  
  // Processing Information
  processingTime: number; // milliseconds
  evaluatedAt: Date;
  evaluatedBy: string;
}

export interface PolicyAnalytics {
  period: {
    startDate: Date;
    endDate: Date;
  };
  
  // Overview Metrics
  overview: {
    totalPolicies: number;
    activePolicies: number;
    totalEvaluations: number;
    approvedExpenses: number;
    blockedExpenses: number;
    approvalRate: number;
    averageProcessingTime: number;
  };
  
  // Violation Analysis
  violationAnalysis: {
    totalViolations: number;
    violationRate: number;
    violationsBySeverity: Record<string, number>;
    violationsByCategory: Record<string, number>;
    topViolatedRules: Array<{
      ruleId: string;
      ruleName: string;
      policyName: string;
      violationCount: number;
      violationRate: number;
    }>;
    violationTrends: Array<{
      date: string;
      violations: number;
      evaluations: number;
      violationRate: number;
    }>;
  };
  
  // Policy Effectiveness
  policyEffectiveness: Array<{
    policyId: string;
    policyName: string;
    version: number;
    totalApplications: number;
    violations: number;
    exceptions: number;
    effectiveness: number; // 0-100 score
    averageProcessingTime: number;
    recommendations: string[];
  }>;
  
  // Compliance Metrics
  complianceMetrics: {
    policyAcknowledgments: {
      totalEmployees: number;
      acknowledgedEmployees: number;
      acknowledgmentRate: number;
      pendingAcknowledgments: number;
    };
    auditResults: {
      totalAudits: number;
      complianceRate: number;
      majorFindings: number;
      minorFindings: number;
      averageAuditScore: number;
    };
  };
  
  // Recommendations
  recommendations: Array<{
    type: 'rule_optimization' | 'policy_update' | 'training' | 'process_improvement';
    priority: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    impact: string;
    effort: 'low' | 'medium' | 'high';
    targetDate?: Date;
  }>;
}

export class ExpensePolicyService {
  // Create expense policy
  async createPolicy(params: PolicyCreateRequest): Promise<IExpensePolicy> {
    // Validate policy code uniqueness
    const existingPolicy = await ExpensePolicy.findOne({ code: params.code.toUpperCase() });
    if (existingPolicy) {
      throw new Error(`Policy with code ${params.code} already exists`);
    }
    
    // Validate effective date
    if (params.effectiveDate <= new Date()) {
      throw new Error('Effective date must be in the future');
    }
    
    // Get creator info
    const creator = await User.findById(params.createdBy);
    if (!creator) {
      throw new Error('Creator not found');
    }
    
    const policyId = await ExpensePolicy.generatePolicyId();
    
    const policy = new ExpensePolicy({
      policyId,
      name: params.name,
      code: params.code.toUpperCase(),
      description: params.description,
      version: 1,
      status: 'draft',
      effectiveDate: params.effectiveDate,
      expirationDate: params.expirationDate,
      
      appliesTo: {
        departments: params.appliesTo.departments || [],
        roles: params.appliesTo.roles || [],
        locations: params.appliesTo.locations || [],
        employmentTypes: params.appliesTo.employmentTypes || [],
        employeeIds: params.appliesTo.employeeIds || [],
        excludeEmployees: params.appliesTo.excludeEmployees || []
      },
      
      rules: params.rules?.map((rule, index) => ({
        ruleId: `RULE-${Date.now()}-${index}`,
        name: rule.name,
        description: rule.description,
        priority: rule.priority,
        isActive: true,
        conditions: rule.conditions,
        actions: rule.actions,
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
        createdBy: creator._id,
        updatedAt: new Date(),
        updatedBy: creator._id
      })) || [],
      
      perDiemRates: params.perDiemRates || [],
      mileageRate: params.mileageRate || 0.655,
      mileageRules: params.mileageRules || {},
      receiptRules: params.receiptRules || {},
      approvalRules: params.approvalRules || {},
      paymentMethodRules: params.paymentMethodRules || {},
      timeLimits: params.timeLimits || {},
      compliance: params.compliance || {},
      notifications: params.notifications || {},
      
      versionHistory: [{
        version: 1,
        changeDescription: 'Initial policy creation',
        changedBy: creator._id,
        changedAt: new Date(),
        effectiveDate: params.effectiveDate
      }],
      
      acknowledgments: [],
      
      metadata: {
        createdAt: new Date(),
        createdBy: creator._id,
        updatedAt: new Date(),
        updatedBy: creator._id,
        tags: params.tags || [],
        notes: params.notes
      }
    });
    
    // Save policy
    await policy.save();
    
    // Send notifications
    await this.sendPolicyNotifications(policy, 'created');
    
    return policy;
  }
  
  // Update expense policy
  async updatePolicy(policyId: string, params: Partial<PolicyCreateRequest> & { updatedBy: string }): Promise<IExpensePolicy> {
    const policy = await ExpensePolicy.findOne({ policyId });
    if (!policy) {
      throw new Error('Policy not found');
    }
    
    if (policy.status === 'active') {
      throw new Error('Cannot update active policy. Create a new version instead.');
    }
    
    // Get updater info
    const updater = await User.findById(params.updatedBy);
    if (!updater) {
      throw new Error('Updater not found');
    }
    
    // Update fields
    if (params.name !== undefined) policy.name = params.name;
    if (params.description !== undefined) policy.description = params.description;
    if (params.effectiveDate !== undefined) policy.effectiveDate = params.effectiveDate;
    if (params.expirationDate !== undefined) policy.expirationDate = params.expirationDate;
    
    if (params.appliesTo !== undefined) {
      policy.appliesTo = { ...policy.appliesTo, ...params.appliesTo };
    }
    
    if (params.rules !== undefined) {
      policy.rules = params.rules.map((rule, index) => ({
        ruleId: `RULE-${Date.now()}-${index}`,
        name: rule.name,
        description: rule.description,
        priority: rule.priority,
        isActive: true,
        conditions: rule.conditions,
        actions: rule.actions,
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
        createdBy: updater._id,
        updatedAt: new Date(),
        updatedBy: updater._id
      }));
    }
    
    if (params.perDiemRates !== undefined) policy.perDiemRates = params.perDiemRates;
    if (params.mileageRate !== undefined) policy.mileageRate = params.mileageRate;
    if (params.mileageRules !== undefined) policy.mileageRules = params.mileageRules;
    if (params.receiptRules !== undefined) policy.receiptRules = params.receiptRules;
    if (params.approvalRules !== undefined) policy.approvalRules = params.approvalRules;
    if (params.paymentMethodRules !== undefined) policy.paymentMethodRules = params.paymentMethodRules;
    if (params.timeLimits !== undefined) policy.timeLimits = params.timeLimits;
    if (params.compliance !== undefined) policy.compliance = params.compliance;
    if (params.notifications !== undefined) policy.notifications = params.notifications;
    
    if (params.tags !== undefined) policy.metadata.tags = params.tags;
    if (params.notes !== undefined) policy.metadata.notes = params.notes;
    
    policy.metadata.updatedBy = updater._id;
    policy.metadata.updatedAt = new Date();
    
    // Save policy
    await policy.save();
    
    // Send notifications
    await this.sendPolicyNotifications(policy, 'updated');
    
    return policy;
  }
  
  // Create new policy version
  async createPolicyVersion(policyId: string, params: {
    changeDescription: string;
    effectiveDate: Date;
    expirationDate?: Date;
    updatedBy: string;
  }): Promise<IExpensePolicy> {
    const originalPolicy = await ExpensePolicy.findOne({ policyId });
    if (!originalPolicy) {
      throw new Error('Original policy not found');
    }
    
    // Get updater info
    const updater = await User.findById(params.updatedBy);
    if (!updater) {
      throw new Error('Updater not found');
    }
    
    // Create new version
    const newPolicy = new ExpensePolicy({
      ...originalPolicy.toObject(),
      _id: undefined,
      policyId: await ExpensePolicy.generatePolicyId(),
      version: originalPolicy.version + 1,
      status: 'draft',
      effectiveDate: params.effectiveDate,
      expirationDate: params.expirationDate,
      
      versionHistory: [
        ...originalPolicy.versionHistory,
        {
          version: originalPolicy.version + 1,
          changeDescription: params.changeDescription,
          changedBy: updater._id,
          changedAt: new Date(),
          effectiveDate: params.effectiveDate
        }
      ],
      
      acknowledgments: [], // Reset acknowledgments for new version
      
      metadata: {
        ...originalPolicy.metadata,
        createdAt: new Date(),
        createdBy: updater._id,
        updatedAt: new Date(),
        updatedBy: updater._id
      }
    });
    
    // Save new version
    await newPolicy.save();
    
    // Archive original policy if new version is active
    if (params.effectiveDate <= new Date()) {
      originalPolicy.status = 'archived';
      await originalPolicy.save();
    }
    
    // Send notifications
    await this.sendPolicyNotifications(newPolicy, 'version_created');
    
    return newPolicy;
  }
  
  // Activate policy
  async activatePolicy(policyId: string, activatedBy: string): Promise<IExpensePolicy> {
    const policy = await ExpensePolicy.findOne({ policyId });
    if (!policy) {
      throw new Error('Policy not found');
    }
    
    if (policy.status !== 'draft') {
      throw new Error('Only draft policies can be activated');
    }
    
    if (policy.effectiveDate > new Date()) {
      throw new Error('Cannot activate policy before effective date');
    }
    
    policy.status = 'active';
    policy.metadata.updatedBy = new Types.ObjectId(activatedBy);
    policy.metadata.updatedAt = new Date();
    
    await policy.save();
    
    // Send notifications
    await this.sendPolicyNotifications(policy, 'activated');
    
    return policy;
  }
  
  // Evaluate expense against policies
  async evaluateExpense(params: PolicyEvaluationRequest): Promise<PolicyEvaluationResult> {
    const startTime = Date.now();
    
    // Get expense
    const expense = await Expense.findOne({ expenseId: params.expenseId });
    if (!expense) {
      throw new Error('Expense not found');
    }
    
    // Get applicable policies
    const applicablePolicies = await ExpensePolicy.findByEmployee(
      new Types.ObjectId(params.employeeId || expense.employeeId.toString()),
      params.evaluationDate || expense.date
    );
    
    const result: PolicyEvaluationResult = {
      policyId: '',
      policyName: '',
      policyVersion: 0,
      expenseId: params.expenseId,
      evaluationDate: params.evaluationDate || new Date(),
      
      approved: true,
      requiresApproval: false,
      autoApprove: true,
      
      violations: [],
      warnings: [],
      requiredActions: [],
      
      applicablePolicies: applicablePolicies.map(policy => ({
        policyId: policy.policyId,
        policyName: policy.name,
        version: policy.version,
        appliedRules: []
      })),
      
      processingTime: 0,
      evaluatedAt: new Date(),
      evaluatedBy: params.employeeId || 'system'
    };
    
    // Evaluate against each policy
    for (const policy of applicablePolicies) {
      const policyResult = policy.evaluateExpense(expense);
      
      if (!policyResult.approved) {
        result.approved = false;
        result.autoApprove = false;
      }
      
      // Add violations
      for (const violation of policyResult.violations) {
        result.violations.push({
          ruleId: violation.ruleId,
          ruleName: violation.ruleName,
          ruleCategory: 'general', // Would get from rule
          severity: violation.severity as 'low' | 'medium' | 'high' | 'critical',
          action: violation.action === 'block' ? 'block' : 'require_approval',
          message: violation.message,
          canOverride: false,
          requiresJustification: violation.severity === 'high' || violation.severity === 'critical'
        });
        
        if (violation.action === 'require_approval') {
          result.requiresApproval = true;
        }
      }
      
      // Add warnings
      for (const warning of policyResult.warnings) {
        result.warnings.push({
          ruleId: warning.ruleId,
          ruleName: warning.ruleName,
          ruleCategory: 'general',
          message: warning.message
        });
      }
    }
    
    // Determine required actions
    if (result.violations.length > 0) {
      result.requiredActions.push({
        type: 'approval',
        description: 'Manager approval required due to policy violations',
        assignee: 'manager'
      });
    }
    
    if (result.violations.some(v => v.requiresJustification)) {
      result.requiredActions.push({
        type: 'justification',
        description: 'Written justification required for policy exceptions',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });
    }
    
    result.processingTime = Date.now() - startTime;
    
    // Save evaluation result
    await this.saveEvaluationResult(result);
    
    return result;
  }
  
  // Acknowledge policy
  async acknowledgePolicy(policyId: string, employeeId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    const policy = await ExpensePolicy.findOne({ policyId });
    if (!policy) {
      throw new Error('Policy not found');
    }
    
    if (policy.status !== 'active') {
      throw new Error('Can only acknowledge active policies');
    }
    
    policy.acknowledgePolicy(new Types.ObjectId(employeeId));
    
    // Add IP and user agent if provided
    const lastAcknowledgment = policy.acknowledgments[policy.acknowledgments.length - 1];
    if (lastAcknowledgment) {
      lastAcknowledgment.ipAddress = ipAddress;
      lastAcknowledgment.userAgent = userAgent;
    }
    
    await policy.save();
    
    // Send acknowledgment confirmation
    await this.sendPolicyNotifications(policy, 'acknowledged', employeeId);
  }
  
  // Get policy analytics
  async getPolicyAnalytics(params: {
    startDate: Date;
    endDate: Date;
    policyId?: string;
    department?: string;
  }): Promise<PolicyAnalytics> {
    // Mock analytics data
    return {
      period: {
        startDate: params.startDate,
        endDate: params.endDate
      },
      
      overview: {
        totalPolicies: 25,
        activePolicies: 18,
        totalEvaluations: 5000,
        approvedExpenses: 4500,
        blockedExpenses: 200,
        approvalRate: 90.0,
        averageProcessingTime: 150
      },
      
      violationAnalysis: {
        totalViolations: 500,
        violationRate: 10.0,
        violationsBySeverity: {
          low: 200,
          medium: 200,
          high: 80,
          critical: 20
        },
        violationsByCategory: {
          travel: 150,
          meals: 100,
          entertainment: 80,
          office: 70,
          other: 100
        },
        topViolatedRules: [
          {
            ruleId: 'rule1',
            ruleName: 'Receipt Required',
            policyName: 'General Expense Policy',
            violationCount: 120,
            violationRate: 24.0
          }
        ],
        violationTrends: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          violations: Math.floor(Math.random() * 20) + 5,
          evaluations: Math.floor(Math.random() * 200) + 100,
          violationRate: Math.random() * 15 + 5
        }))
      },
      
      policyEffectiveness: [
        {
          policyId: 'policy1',
          policyName: 'Travel Expense Policy',
          version: 2,
          totalApplications: 1000,
          violations: 50,
          exceptions: 20,
          effectiveness: 95.0,
          averageProcessingTime: 120,
          recommendations: ['Consider simplifying receipt requirements', 'Add more per diem locations']
        }
      ],
      
      complianceMetrics: {
        policyAcknowledgments: {
          totalEmployees: 500,
          acknowledgedEmployees: 450,
          acknowledgmentRate: 90.0,
          pendingAcknowledgments: 50
        },
        auditResults: {
          totalAudits: 100,
          complianceRate: 92.0,
          majorFindings: 5,
          minorFindings: 15,
          averageAuditScore: 88.5
        }
      },
      
      recommendations: [
        {
          type: 'rule_optimization',
          priority: 'high',
          description: 'Update receipt requirements to reduce violations',
          impact: 'Reduce violation rate by 15%',
          effort: 'medium',
          targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      ]
    };
  }
  
  // Helper methods
  private async sendPolicyNotifications(policy: IExpensePolicy, action: string, recipientId?: string): Promise<void> {
    console.log(`Sending ${action} notifications for policy ${policy.policyId}`);
  }
  
  private async saveEvaluationResult(result: PolicyEvaluationResult): Promise<void> {
    console.log(`Saving evaluation result for expense ${result.expenseId}`);
  }
}

// Import Types.ObjectId
import { Types } from 'mongoose';
