import { Expense, IExpense } from '../models/Expense';
import { ExpenseCategory } from '../models/ExpenseCategory';
import { User } from '../models/User';

export interface ApprovalRule {
  ruleId: string;
  name: string;
  description: string;
  isActive: boolean;
  priority: number;
  
  // Conditions
  conditions: {
    amountRange?: {
      min: number;
      max: number;
    };
    categories?: string[];
    departments?: string[];
    employeeRoles?: string[];
    expenseTypes?: string[];
    customFields?: Array<{
      field: string;
      operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'in';
      value: any;
    }>;
  };
  
  // Approval Configuration
  approvalConfig: {
    type: 'sequential' | 'parallel' | 'conditional';
    approvers: Array<{
      approverId: string;
      approverName: string;
      approverRole: string;
      level: number;
      required: boolean;
      canDelegate: boolean;
      timeoutHours?: number;
    }>;
    autoApprovalConditions: Array<{
      field: string;
      operator: string;
      value: any;
    }>;
    escalationRules: Array<{
      condition: string;
      action: 'escalate' | 'notify' | 'auto_approve';
      recipient: string;
      delay: number; // hours
    }>;
  };
  
  // Delegation Rules
  delegationRules: {
    allowed: boolean;
    maxDelegationDays: number;
    requireReason: boolean;
    autoApproveDelegated: boolean;
  };
  
  // Timestamps
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

export interface ApprovalRequest {
  requestId: string;
  expenseId: string;
  expenseTitle: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  currency: string;
  categoryId: string;
  categoryName: string;
  
  // Workflow Configuration
  workflowId: string;
  workflowName: string;
  ruleId: string;
  ruleName: string;
  
  // Approval Status
  status: 'pending' | 'processing' | 'approved' | 'rejected' | 'escalated' | 'cancelled';
  currentLevel: number;
  totalLevels: number;
  
  // Approval Steps
  steps: Array<{
    stepId: string;
    level: number;
    type: 'approval' | 'review' | 'notification';
    approvers: Array<{
      approverId: string;
      approverName: string;
      approverRole: string;
      status: 'pending' | 'approved' | 'rejected' | 'delegated' | 'skipped';
      actionDate?: Date;
      comments?: string;
      delegatedTo?: string;
      delegationReason?: string;
    }>;
    requiredApprovals: number;
    receivedApprovals: number;
    status: 'pending' | 'completed' | 'skipped';
    startedAt?: Date;
    completedAt?: Date;
    timeoutAt?: Date;
  }>;
  
  // Metadata
  submittedAt: Date;
  submittedBy: string;
  lastActionAt?: Date;
  lastActionBy?: string;
  completedAt?: Date;
  
  // Comments and History
  comments: Array<{
    commentId: string;
    authorId: string;
    authorName: string;
    comment: string;
    timestamp: Date;
    isInternal: boolean;
  }>;
  
  // Attachments
  attachments: Array<{
    attachmentId: string;
    name: string;
    url: string;
    uploadedAt: Date;
    uploadedBy: string;
  }>;
  
  // Audit Trail
  auditTrail: Array<{
    timestamp: Date;
    action: string;
    performedBy: string;
    details: string;
    previousStatus?: string;
    newStatus?: string;
  }>;
}

export interface DelegationRequest {
  delegationId: string;
  delegatorId: string;
  delegatorName: string;
  delegateeId: string;
  delegateeName: string;
  
  // Delegation Period
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  
  // Scope
  scope: {
    categories?: string[];
    departments?: string[];
    amountRange?: {
      min: number;
      max: number;
    };
    specificExpenses?: string[];
  };
  
  // Details
  reason: string;
  approvedBy?: string;
  approvedAt?: Date;
  
  // Usage Tracking
  usageCount: number;
  lastUsed?: Date;
  
  // Timestamps
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

export interface ApprovalAnalytics {
  period: {
    startDate: Date;
    endDate: Date;
  };
  
  // Volume Metrics
  volumeMetrics: {
    totalRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    pendingRequests: number;
    averageProcessingTime: number; // hours
    processingTimeDistribution: Array<{
      range: string;
      count: number;
      percentage: number;
    }>;
  };
  
  // Approver Performance
  approverPerformance: Array<{
    approverId: string;
    approverName: string;
    totalAssigned: number;
    approved: number;
    rejected: number;
    pending: number;
    averageTimeToApprove: number; // hours
    approvalRate: number;
    delegationRate: number;
  }>;
  
  // Workflow Efficiency
  workflowEfficiency: {
    averageStepsPerApproval: number;
    mostUsedRules: Array<{
      ruleId: string;
      ruleName: string;
      usageCount: number;
      averageProcessingTime: number;
    }>;
    bottlenecks: Array<{
      step: string;
      averageDelay: number;
      delayReasons: string[];
    }>;
    escalationRate: number;
    autoApprovalRate: number;
  };
  
  // Category Analysis
  categoryAnalysis: Array<{
    categoryId: string;
    categoryName: string;
    totalRequests: number;
    approvalRate: number;
    averageAmount: number;
    averageProcessingTime: number;
    commonRejectionReasons: Array<{
      reason: string;
      count: number;
      percentage: number;
    }>;
  }>;
  
  // Trends
  trends: {
    monthlyVolume: Array<{
      month: string;
      requests: number;
      approvals: number;
      rejections: number;
      averageProcessingTime: number;
    }>;
    approvalRateTrend: Array<{
      period: string;
      rate: number;
    }>;
    processingTimeTrend: Array<{
      period: string;
      averageTime: number;
    }>;
  };
}

export class ExpenseApprovalService {
  // Create approval rule
  async createApprovalRule(params: {
    name: string;
    description: string;
    conditions: {
      amountRange?: {
        min: number;
        max: number;
      };
      categories?: string[];
      departments?: string[];
      employeeRoles?: string[];
      expenseTypes?: string[];
      customFields?: Array<{
        field: string;
        operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'in';
        value: any;
      }>;
    };
    approvalConfig: {
      type: 'sequential' | 'parallel' | 'conditional';
      approvers: Array<{
        approverId: string;
        approverName: string;
        approverRole: string;
        level: number;
        required: boolean;
        canDelegate: boolean;
        timeoutHours?: number;
      }>;
      autoApprovalConditions?: Array<{
        field: string;
        operator: string;
        value: any;
      }>;
      escalationRules?: Array<{
        condition: string;
        action: 'escalate' | 'notify' | 'auto_approve';
        recipient: string;
        delay: number;
      }>;
    };
    delegationRules?: {
      allowed: boolean;
      maxDelegationDays: number;
      requireReason: boolean;
      autoApproveDelegated: boolean;
    };
    createdBy: string;
  }): Promise<ApprovalRule> {
    const ruleId = `RULE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const rule: ApprovalRule = {
      ruleId,
      name: params.name,
      description: params.description,
      isActive: true,
      priority: 1,
      
      conditions: params.conditions,
      
      approvalConfig: {
        ...params.approvalConfig,
        autoApprovalConditions: params.approvalConfig.autoApprovalConditions || [],
        escalationRules: params.approvalConfig.escalationRules || []
      },
      
      delegationRules: params.delegationRules || {
        allowed: true,
        maxDelegationDays: 30,
        requireReason: true,
        autoApproveDelegated: false
      },
      
      createdAt: new Date(),
      createdBy: params.createdBy,
      updatedAt: new Date(),
      updatedBy: params.createdBy
    };
    
    // Save rule
    await this.saveApprovalRule(rule);
    
    return rule;
  }
  
  // Initiate approval workflow
  async initiateApprovalWorkflow(expenseId: string, submittedBy: string): Promise<ApprovalRequest> {
    const expense = await Expense.findOne({ expenseId });
    if (!expense) {
      throw new Error('Expense not found');
    }
    
    if (expense.status !== 'submitted') {
      throw new Error('Expense must be submitted before approval workflow');
    }
    
    // Find applicable approval rule
    const rule = await this.findApplicableRule(expense);
    if (!rule) {
      // Auto-approve if no rule applies
      expense.status = 'approved';
      await expense.save();
      throw new Error('No approval rule applicable - expense auto-approved');
    }
    
    // Create approval request
    const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const workflowId = `WF-${Date.now()}`;
    
    const approvalRequest: ApprovalRequest = {
      requestId,
      expenseId: expense.expenseId,
      expenseTitle: expense.title,
      employeeId: expense.employeeId.toString(),
      employeeName: expense.employeeName,
      amount: expense.totalAmount,
      currency: expense.currency,
      categoryId: expense.categoryId.toString(),
      categoryName: expense.categoryName,
      
      workflowId,
      workflowName: `${rule.name} Workflow`,
      ruleId: rule.ruleId,
      ruleName: rule.name,
      
      status: 'pending',
      currentLevel: 1,
      totalLevels: Math.max(...rule.approvalConfig.approvers.map(a => a.level)),
      
      steps: await this.createApprovalSteps(rule, expense),
      
      submittedAt: new Date(),
      submittedBy,
      
      comments: [],
      attachments: [],
      
      auditTrail: [{
        timestamp: new Date(),
        action: 'Workflow Initiated',
        performedBy: submittedBy,
        details: `Approval workflow initiated using rule: ${rule.name}`,
        newStatus: 'pending'
      }]
    };
    
    // Update expense status
    expense.status = 'pending_approval';
    await expense.save();
    
    // Save approval request
    await this.saveApprovalRequest(approvalRequest);
    
    // Start first approval step
    await this.startApprovalStep(approvalRequest, 0);
    
    // Send notifications
    await this.sendWorkflowNotifications(approvalRequest, 'initiated');
    
    return approvalRequest;
  }
  
  // Process approval action
  async processApprovalAction(params: {
    requestId: string;
    approverId: string;
    action: 'approve' | 'reject' | 'delegate';
    comments?: string;
    delegateTo?: string;
    delegationReason?: string;
  }): Promise<ApprovalRequest> {
    const request = await this.getApprovalRequest(params.requestId);
    if (!request) {
      throw new Error('Approval request not found');
    }
    
    if (request.status !== 'pending' && request.status !== 'processing') {
      throw new Error('Approval request is not in a processable state');
    }
    
    // Find current step
    const currentStep = request.steps.find(step => step.status === 'pending');
    if (!currentStep) {
      throw new Error('No pending approval step found');
    }
    
    // Find approver in current step
    const approver = currentStep.approvers.find(a => a.approverId === params.approverId);
    if (!approver) {
      throw new Error('Approver not found in current approval step');
    }
    
    if (approver.status !== 'pending') {
      throw new Error('Approver has already acted on this request');
    }
    
    // Process action
    approver.actionDate = new Date();
    approver.comments = params.comments;
    
    switch (params.action) {
      case 'approve':
        approver.status = 'approved';
        currentStep.receivedApprovals++;
        break;
        
      case 'reject':
        approver.status = 'rejected';
        request.status = 'rejected';
        request.completedAt = new Date();
        break;
        
      case 'delegate':
        if (!params.delegateTo) {
          throw new Error('Delegate to is required for delegation');
        }
        approver.status = 'delegated';
        approver.delegatedTo = params.delegateTo;
        approver.delegationReason = params.delegationReason;
        
        // Add delegate as new approver
        const delegateUser = await User.findById(params.delegateTo);
        if (delegateUser) {
          currentStep.approvers.push({
            approverId: params.delegateTo,
            approverName: `${delegateUser.firstName} ${delegateUser.lastName}`,
            approverRole: delegateUser.role,
            status: 'pending'
          });
        }
        break;
    }
    
    // Update audit trail
    request.auditTrail.push({
      timestamp: new Date(),
      action: `Expense ${params.action}d`,
      performedBy: params.approverId,
      details: `Expense ${params.action}d${params.comments ? `: ${params.comments}` : ''}`,
      previousStatus: request.status,
      newStatus: params.action === 'reject' ? 'rejected' : request.status
    });
    
    request.lastActionAt = new Date();
    request.lastActionBy = params.approverId;
    
    // Check if step is complete
    if (currentStep.receivedApprovals >= currentStep.requiredApprovals) {
      currentStep.status = 'completed';
      currentStep.completedAt = new Date();
      
      // Move to next step or complete workflow
      const nextStepIndex = request.steps.findIndex(s => s.stepId === currentStep.stepId) + 1;
      if (nextStepIndex < request.steps.length) {
        request.currentLevel++;
        await this.startApprovalStep(request, nextStepIndex);
      } else {
        // Complete workflow
        request.status = 'approved';
        request.completedAt = new Date();
        await this.completeApprovalWorkflow(request);
      }
    }
    
    // Save request
    await this.updateApprovalRequest(request);
    
    // Send notifications
    await this.sendWorkflowNotifications(request, params.action);
    
    return request;
  }
  
  // Create delegation request
  async createDelegationRequest(params: {
    delegatorId: string;
    delegateeId: string;
    startDate: Date;
    endDate: Date;
    reason: string;
    scope?: {
      categories?: string[];
      departments?: string[];
      amountRange?: {
        min: number;
        max: number;
      };
      specificExpenses?: string[];
    };
    createdBy: string;
  }): Promise<DelegationRequest> {
    // Validate users
    const delegator = await User.findById(params.delegatorId);
    const delegatee = await User.findById(params.delegateeId);
    
    if (!delegator || !delegatee) {
      throw new Error('Invalid delegator or delegatee');
    }
    
    if (params.startDate >= params.endDate) {
      throw new Error('End date must be after start date');
    }
    
    const delegationId = `DEL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const delegation: DelegationRequest = {
      delegationId,
      delegatorId: params.delegatorId,
      delegatorName: `${delegator.firstName} ${delegator.lastName}`,
      delegateeId: params.delegateeId,
      delegateeName: `${delegatee.firstName} ${delegatee.lastName}`,
      
      startDate: params.startDate,
      endDate: params.endDate,
      isActive: true,
      
      scope: params.scope || {},
      
      reason: params.reason,
      
      usageCount: 0,
      
      createdAt: new Date(),
      createdBy: params.createdBy,
      updatedAt: new Date(),
      updatedBy: params.createdBy
    };
    
    // Save delegation
    await this.saveDelegationRequest(delegation);
    
    // Send notifications
    await this.sendDelegationNotifications(delegation, 'created');
    
    return delegation;
  }
  
  // Get pending approvals for user
  async getPendingApprovals(userId: string, includeDelegated = false): Promise<ApprovalRequest[]> {
    // Mock implementation
    return [];
  }
  
  // Get approval analytics
  async getApprovalAnalytics(params: {
    startDate: Date;
    endDate: Date;
    filters?: {
      approverId?: string;
      categoryId?: string;
      department?: string;
    };
  }): Promise<ApprovalAnalytics> {
    // Mock analytics data
    return {
      period: {
        startDate: params.startDate,
        endDate: params.endDate
      },
      
      volumeMetrics: {
        totalRequests: 1250,
        approvedRequests: 1100,
        rejectedRequests: 100,
        pendingRequests: 50,
        averageProcessingTime: 48.5,
        processingTimeDistribution: [
          { range: '< 24 hours', count: 750, percentage: 60.0 },
          { range: '24-48 hours', count: 300, percentage: 24.0 },
          { range: '48-72 hours', count: 150, percentage: 12.0 },
          { range: '> 72 hours', count: 50, percentage: 4.0 }
        ]
      },
      
      approverPerformance: [
        {
          approverId: 'user1',
          approverName: 'John Manager',
          totalAssigned: 150,
          approved: 140,
          rejected: 8,
          pending: 2,
          averageTimeToApprove: 12.5,
          approvalRate: 93.3,
          delegationRate: 5.2
        }
      ],
      
      workflowEfficiency: {
        averageStepsPerApproval: 2.3,
        mostUsedRules: [
          {
            ruleId: 'rule1',
            ruleName: 'Standard Expense Approval',
            usageCount: 800,
            averageProcessingTime: 24.0
          }
        ],
        bottlenecks: [
          {
            step: 'Manager Approval',
            averageDelay: 18.5,
            delayReasons: ['Out of office', 'High workload', 'Missing information']
          }
        ],
        escalationRate: 3.2,
        autoApprovalRate: 15.5
      },
      
      categoryAnalysis: [
        {
          categoryId: 'cat1',
          categoryName: 'Travel',
          totalRequests: 300,
          approvalRate: 92.0,
          averageAmount: 250.00,
          averageProcessingTime: 36.5,
          commonRejectionReasons: [
            { reason: 'Missing receipt', count: 15, percentage: 50.0 },
            { reason: 'Over budget', count: 8, percentage: 26.7 }
          ]
        }
      ],
      
      trends: {
        monthlyVolume: [
          { month: '2024-01', requests: 400, approvals: 380, rejections: 15, averageProcessingTime: 45.2 },
          { month: '2024-02', requests: 425, approvals: 405, rejections: 18, averageProcessingTime: 47.8 }
        ],
        approvalRateTrend: [
          { period: '2024-01', rate: 95.0 },
          { period: '2024-02', rate: 95.3 }
        ],
        processingTimeTrend: [
          { period: '2024-01', averageTime: 45.2 },
          { period: '2024-02', averageTime: 47.8 }
        ]
      }
    };
  }
  
  // Helper methods
  private async findApplicableRule(expense: IExpense): Promise<ApprovalRule | null> {
    // Mock implementation - would query approval rules
    return null;
  }
  
  private async createApprovalSteps(rule: ApprovalRule, expense: IExpense): Promise<any[]> {
    const steps = [];
    
    // Group approvers by level
    const approversByLevel = new Map<number, any[]>();
    rule.approvalConfig.approvers.forEach(approver => {
      if (!approversByLevel.has(approver.level)) {
        approversByLevel.set(approver.level, []);
      }
      approversByLevel.get(approver.level)!.push(approver);
    });
    
    // Create steps for each level
    for (const [level, approvers] of approversByLevel.entries()) {
      const step = {
        stepId: `STEP-${Date.now()}-${level}`,
        level,
        type: rule.approvalConfig.type,
        approvers: approvers.map(approver => ({
          approverId: approver.approverId,
          approverName: approver.approverName,
          approverRole: approver.approverRole,
          status: 'pending' as const,
          canDelegate: approver.canDelegate
        })),
        requiredApprovals: approvers.filter(a => a.required).length,
        receivedApprovals: 0,
        status: 'pending' as const,
        timeoutAt: approvers.some(a => a.timeoutHours) 
          ? new Date(Date.now() + Math.max(...approvers.map(a => a.timeoutHours || 0)) * 60 * 60 * 1000)
          : undefined
      };
      
      steps.push(step);
    }
    
    return steps;
  }
  
  private async startApprovalStep(request: ApprovalRequest, stepIndex: number): Promise<void> {
    const step = request.steps[stepIndex];
    if (!step) return;
    
    step.status = 'pending';
    step.startedAt = new Date();
    request.status = 'processing';
    
    // Check for delegations
    for (const approver of step.approvers) {
      const delegation = await this.getActiveDelegation(approver.approverId, request);
      if (delegation) {
        approver.status = 'delegated';
        approver.delegatedTo = delegation.delegateeId;
        approver.delegationReason = 'Automatic delegation';
        
        // Add delegate as approver
        const delegateUser = await User.findById(delegation.delegateeId);
        if (delegateUser) {
          step.approvers.push({
            approverId: delegation.delegateeId,
            approverName: delegation.delegateeName,
            approverRole: delegateUser.role,
            status: 'pending'
          });
        }
        
        delegation.usageCount++;
        delegation.lastUsed = new Date();
        await this.updateDelegationRequest(delegation);
      }
    }
    
    // Check auto-approval conditions
    const expense = await Expense.findOne({ expenseId: request.expenseId });
    if (expense && rule.approvalConfig.autoApprovalConditions) {
      const shouldAutoApprove = await this.checkAutoApprovalConditions(
        rule.approvalConfig.autoApprovalConditions,
        expense
      );
      
      if (shouldAutoApprove) {
        // Auto-approve all approvers in this step
        step.approvers.forEach(approver => {
          if (approver.status === 'pending') {
            approver.status = 'approved';
            approver.actionDate = new Date();
            approver.comments = 'Auto-approved by system';
          }
        });
        
        step.receivedApprovals = step.requiredApprovals;
        step.status = 'completed';
        step.completedAt = new Date();
        
        // Move to next step or complete
        const nextStepIndex = stepIndex + 1;
        if (nextStepIndex < request.steps.length) {
          request.currentLevel++;
          await this.startApprovalStep(request, nextStepIndex);
        } else {
          request.status = 'approved';
          request.completedAt = new Date();
          await this.completeApprovalWorkflow(request);
        }
      }
    }
  }
  
  private async checkAutoApprovalConditions(conditions: any[], expense: IExpense): Promise<boolean> {
    // Mock implementation
    return false;
  }
  
  private async getActiveDelegation(approverId: string, request: ApprovalRequest): Promise<DelegationRequest | null> {
    // Mock implementation
    return null;
  }
  
  private async completeApprovalWorkflow(request: ApprovalRequest): Promise<void> {
    // Update expense status
    const expense = await Expense.findOne({ expenseId: request.expenseId });
    if (expense) {
      expense.status = 'approved';
      
      // Add approvals to expense
      for (const step of request.steps) {
        for (const approver of step.approvers) {
          if (approver.status === 'approved') {
            expense.addApproval({
              approvalId: `APR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
              level: step.level,
              approverId: new Types.ObjectId(approver.approverId),
              approverName: approver.approverName,
              approverRole: approver.approverRole,
              status: 'approved',
              date: approver.actionDate,
              comments: approver.comments
            });
          }
        }
      }
      
      await expense.save();
    }
    
    // Add to audit trail
    request.auditTrail.push({
      timestamp: new Date(),
      action: 'Workflow Completed',
      performedBy: 'system',
      details: 'Approval workflow completed successfully',
      previousStatus: 'processing',
      newStatus: 'approved'
    });
  }
  
  private async sendWorkflowNotifications(request: ApprovalRequest, action: string): Promise<void> {
    // Send notifications based on action
    console.log(`Sending ${action} notifications for request ${request.requestId}`);
  }
  
  private async sendDelegationNotifications(delegation: DelegationRequest, action: string): Promise<void> {
    // Send delegation notifications
    console.log(`Sending ${action} delegation notifications for ${delegation.delegationId}`);
  }
  
  // Database operations (mock implementations)
  private async saveApprovalRule(rule: ApprovalRule): Promise<void> {
    console.log(`Saving approval rule ${rule.ruleId}`);
  }
  
  private async saveApprovalRequest(request: ApprovalRequest): Promise<void> {
    console.log(`Saving approval request ${request.requestId}`);
  }
  
  private async updateApprovalRequest(request: ApprovalRequest): Promise<void> {
    console.log(`Updating approval request ${request.requestId}`);
  }
  
  private async getApprovalRequest(requestId: string): Promise<ApprovalRequest | null> {
    // Mock implementation
    return null;
  }
  
  private async saveDelegationRequest(delegation: DelegationRequest): Promise<void> {
    console.log(`Saving delegation request ${delegation.delegationId}`);
  }
  
  private async updateDelegationRequest(delegation: DelegationRequest): Promise<void> {
    console.log(`Updating delegation request ${delegation.delegationId}`);
  }
}

// Import Types.ObjectId
import { Types } from 'mongoose';
