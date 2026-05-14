import { JournalEntry, IJournalEntry } from '../models/JournalEntry';
import { User } from '../models/User';
import { Account } from '../models/Account';

export interface ApprovalRule {
  ruleId: string;
  name: string;
  description: string;
  
  // Rule Configuration
  configuration: {
    conditions: Array<{
      field: string;
      operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'not_in';
      value: any;
      logicalOperator?: 'and' | 'or';
    }>;
    approvers: Array<{
      userId: string;
      role: string;
      order: number;
      required: boolean;
      delegateTo?: string;
    }>;
    escalationRules: Array<{
      condition: string;
      action: 'escalate' | 'auto_approve' | 'notify';
      targetUsers: string[];
      delay: number; // hours
    }>;
  };
  
  // Rule Scope
  scope: {
    entryTypes?: string[];
    accountTypes?: string[];
    departments?: string[];
    locations?: string[];
    projects?: string[];
    amountRange?: {
      min?: number;
      max?: number;
    };
    userRoles?: string[];
    entities?: string[];
  };
  
  // Rule Status
  isActive: boolean;
  priority: number; // Higher number = higher priority
  
  // Usage Statistics
  usage: {
    totalApplications: number;
    successfulApprovals: number;
    rejections: number;
    escalations: number;
    lastUsed?: Date;
    averageProcessingTime: number; // hours
  };
  
  // Metadata
  metadata: {
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
    version: number;
  };
}

export interface ApprovalWorkflow {
  workflowId: string;
  name: string;
  description: string;
  
  // Workflow Configuration
  configuration: {
    entryTypes: string[];
    isDefault: boolean;
    allowParallelApproval: boolean;
    requireAllApprovers: boolean;
    autoApproveConditions?: Array<{
      conditions: Array<{
        field: string;
        operator: string;
        value: any;
      }>;
      action: 'approve' | 'skip_review';
    }>;
    timeoutSettings: {
      enabled: boolean;
      timeoutHours: number;
      timeoutAction: 'escalate' | 'reject' | 'notify';
      escalationUsers: string[];
    };
  };
  
  // Workflow Steps
  steps: Array<{
    stepId: string;
    name: string;
    description: string;
    order: number;
    type: 'approval' | 'review' | 'notification' | 'validation';
    
    // Step Configuration
    configuration: {
      approvers: Array<{
        userId: string;
        role: string;
        required: boolean;
        delegateTo?: string;
        conditions?: Array<{
          field: string;
          operator: string;
          value: any;
        }>;
      }>;
      conditions?: Array<{
        field: string;
        operator: string;
        value: any;
        logicalOperator?: 'and' | 'or';
      }>;
      allowDelegation: boolean;
      requireComments: boolean;
      minApprovalCount?: number;
    };
    
    // Step Status
    status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed';
    startedAt?: Date;
    completedAt?: Date;
    
    // Step Results
    results: {
      approvers: Array<{
        userId: string;
        status: 'pending' | 'approved' | 'rejected' | 'delegated';
        decisionAt?: Date;
        comments?: string;
        delegatedTo?: string;
      }>;
      finalDecision?: 'approved' | 'rejected';
      decisionAt?: Date;
      decisionBy?: string;
      comments?: string;
    };
  }>;
  
  // Workflow Status
  status: 'draft' | 'active' | 'inactive' | 'archived';
  
  // Metadata
  metadata: {
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
    version: number;
  };
}

export interface ApprovalRequest {
  requestId: string;
  entryId: string;
  workflowId: string;
  
  // Request Details
  requestDetails: {
    entryNumber: string;
    entryType: string;
    totalAmount: number;
    currency: string;
    entryDate: Date;
    submittedBy: string;
    submittedAt: Date;
    urgency: 'low' | 'medium' | 'high' | 'urgent';
    reason?: string;
  };
  
  // Workflow Progress
  workflowProgress: {
    currentStep: number;
    totalSteps: number;
    status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'escalated' | 'expired';
    startedAt: Date;
    completedAt?: Date;
    expiresAt?: Date;
  };
  
  // Step Details
  steps: Array<{
    stepId: string;
    name: string;
    order: number;
    status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed';
    startedAt?: Date;
    completedAt?: Date;
    
    // Approvers for this step
    approvers: Array<{
      userId: string;
      userName: string;
      role: string;
      status: 'pending' | 'approved' | 'rejected' | 'delegated';
      decisionAt?: Date;
      comments?: string;
      delegatedTo?: string;
      isCurrent: boolean;
    }>;
    
    // Step Results
    result?: {
      decision: 'approved' | 'rejected';
      decisionBy: string;
      decisionAt: Date;
      comments: string;
      approvalCount: number;
      rejectionCount: number;
      totalApprovers: number;
    };
  }>;
  
  // History
  history: Array<{
    timestamp: Date;
    action: string;
    performedBy: string;
    details: string;
    previousStatus?: string;
    newStatus?: string;
  }>;
  
  // Notifications
  notifications: Array<{
    notificationId: string;
    recipientId: string;
    type: 'approval_required' | 'approved' | 'rejected' | 'escalated' | 'reminder' | 'expired';
    sentAt: Date;
    acknowledgedAt?: Date;
  }>;
  
  // Metadata
  metadata: {
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
  };
}

export interface ApprovalDelegation {
  delegationId: string;
  delegatorId: string;
  delegateeId: string;
  
  // Delegation Configuration
  configuration: {
    startDate: Date;
    endDate: Date;
    scope: {
      entryTypes?: string[];
      accountTypes?: string[];
      departments?: string[];
      locations?: string[];
      projects?: string[];
      amountRange?: {
        min?: number;
        max?: number;
      };
    };
    conditions: Array<{
      field: string;
      operator: string;
      value: any;
    }>;
  };
  
  // Delegation Status
  status: 'active' | 'inactive' | 'expired' | 'revoked';
  
  // Usage Statistics
  usage: {
    totalDelegations: number;
    usedDelegations: number;
    lastUsed?: Date;
  };
  
  // Metadata
  metadata: {
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
  };
}

export interface ApprovalAnalytics {
  period: {
    startDate: Date;
    endDate: Date;
  };
  
  // Overview
  overview: {
    totalRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    pendingRequests: number;
    escalatedRequests: number;
    expiredRequests: number;
    averageProcessingTime: number; // hours
    approvalRate: number; // percentage
  };
  
  // Workflow Performance
  workflowPerformance: Array<{
    workflowId: string;
    workflowName: string;
    totalRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    averageProcessingTime: number;
    approvalRate: number;
    bottleneckSteps: Array<{
      stepName: string;
      averageTime: number;
      delayReason: string;
    }>;
  }>;
  
  // Approver Performance
  approverPerformance: Array<{
    userId: string;
    userName: string;
    role: string;
    totalApprovals: number;
    totalRejections: number;
    pendingApprovals: number;
    averageDecisionTime: number; // hours
    approvalRate: number;
    workload: {
      current: number;
      average: number;
      overload: boolean;
    };
    delegationUsage: {
      delegated: number;
      received: number;
    };
  }>;
  
  // Entry Analysis
  entryAnalysis: {
    byType: Record<string, {
      totalRequests: number;
      approvedRequests: number;
      rejectedRequests: number;
      averageProcessingTime: number;
      approvalRate: number;
    }>;
    byAmountRange: Array<{
      range: string;
      count: number;
      approvedCount: number;
      rejectedCount: number;
      approvalRate: number;
      averageTime: number;
    }>;
    byUrgency: Record<string, {
      count: number;
      approvedCount: number;
      rejectedCount: number;
      averageTime: number;
    }>;
  };
  
  // Rule Effectiveness
  ruleEffectiveness: Array<{
    ruleId: string;
    ruleName: string;
    applications: number;
    correctApplications: number;
    effectivenessRate: number;
    commonIssues: Array<{
      issue: string;
      frequency: number;
    }>;
  }>;
  
  // Trends
  trends: {
    monthly: Array<{
      month: string;
      totalRequests: number;
      approvedRequests: number;
      rejectedRequests: number;
      averageProcessingTime: number;
      approvalRate: number;
    }>;
    daily: Array<{
      date: string;
      requests: number;
      approvals: number;
      rejections: number;
      averageTime: number;
    }>;
  };
  
  // Recommendations
  recommendations: Array<{
    type: 'workflow_optimization' | 'approver_training' | 'rule_adjustment' | 'process_improvement';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    impact: string;
    effort: 'low' | 'medium' | 'high';
    affectedItems: number;
  }>;
}

export class JournalEntryApprovalService {
  // Create approval rule
  async createApprovalRule(params: {
    name: string;
    description: string;
    conditions: Array<{
      field: string;
      operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'not_in';
      value: any;
      logicalOperator?: 'and' | 'or';
    }>;
    approvers: Array<{
      userId: string;
      role: string;
      order: number;
      required: boolean;
      delegateTo?: string;
    }>;
    escalationRules?: Array<{
      condition: string;
      action: 'escalate' | 'auto_approve' | 'notify';
      targetUsers: string[];
      delay: number;
    }>;
    scope?: {
      entryTypes?: string[];
      accountTypes?: string[];
      departments?: string[];
      locations?: string[];
      projects?: string[];
      amountRange?: {
        min?: number;
        max?: number;
      };
      userRoles?: string[];
      entities?: string[];
    };
    priority?: number;
    isActive?: boolean;
    createdBy: string;
  }): Promise<ApprovalRule> {
    const ruleId = `RULE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Validate approvers exist
    const approverIds = params.approvers.map(a => a.userId);
    const approvers = await User.find({ _id: { $in: approverIds } });
    if (approvers.length !== approverIds.length) {
      throw new Error('One or more approvers not found');
    }
    
    const rule: ApprovalRule = {
      ruleId,
      name: params.name,
      description: params.description,
      
      configuration: {
        conditions: params.conditions,
        approvers: params.approvers,
        escalationRules: params.escalationRules || []
      },
      
      scope: {
        entryTypes: params.scope?.entryTypes,
        accountTypes: params.scope?.accountTypes,
        departments: params.scope?.departments,
        locations: params.scope?.locations,
        projects: params.scope?.projects,
        amountRange: params.scope?.amountRange,
        userRoles: params.scope?.userRoles,
        entities: params.scope?.entities
      },
      
      isActive: params.isActive ?? true,
      priority: params.priority || 0,
      
      usage: {
        totalApplications: 0,
        successfulApprovals: 0,
        rejections: 0,
        escalations: 0,
        averageProcessingTime: 0
      },
      
      metadata: {
        createdAt: new Date(),
        createdBy: params.createdBy,
        updatedAt: new Date(),
        updatedBy: params.createdBy,
        version: 1
      }
    };
    
    // Validate rule
    await this.validateApprovalRule(rule);
    
    // Save rule
    await this.saveApprovalRule(rule);
    
    return rule;
  }
  
  // Create approval workflow
  async createApprovalWorkflow(params: {
    name: string;
    description: string;
    entryTypes: string[];
    isDefault?: boolean;
    allowParallelApproval?: boolean;
    requireAllApprovers?: boolean;
    steps: Array<{
      name: string;
      description?: string;
      type: 'approval' | 'review' | 'notification' | 'validation';
      approvers: Array<{
        userId: string;
        role: string;
        required: boolean;
        delegateTo?: string;
        conditions?: Array<{
          field: string;
          operator: string;
          value: any;
        }>;
      }>;
      conditions?: Array<{
        field: string;
        operator: string;
        value: any;
        logicalOperator?: 'and' | 'or';
      }>;
      allowDelegation?: boolean;
      requireComments?: boolean;
      minApprovalCount?: number;
    }>;
    autoApproveConditions?: Array<{
      conditions: Array<{
        field: string;
        operator: string;
        value: any;
      }>;
      action: 'approve' | 'skip_review';
    }>;
    timeoutSettings?: {
      enabled: boolean;
      timeoutHours: number;
      timeoutAction: 'escalate' | 'reject' | 'notify';
      escalationUsers: string[];
    };
    createdBy: string;
  }): Promise<ApprovalWorkflow> {
    const workflowId = `WF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Validate steps and approvers
    for (const step of params.steps) {
      const approverIds = step.approvers.map(a => a.userId);
      const approvers = await User.find({ _id: { $in: approverIds } });
      if (approvers.length !== approverIds.length) {
        throw new Error('One or more approvers not found in workflow steps');
      }
    }
    
    const workflow: ApprovalWorkflow = {
      workflowId,
      name: params.name,
      description: params.description,
      
      configuration: {
        entryTypes: params.entryTypes,
        isDefault: params.isDefault ?? false,
        allowParallelApproval: params.allowParallelApproval ?? false,
        requireAllApprovers: params.requireAllApprovers ?? true,
        autoApproveConditions: params.autoApproveConditions || [],
        timeoutSettings: {
          enabled: false,
          timeoutHours: 24,
          timeoutAction: 'escalate',
          escalationUsers: [],
          ...params.timeoutSettings
        }
      },
      
      steps: params.steps.map((step, index) => ({
        stepId: `STEP-${workflowId}-${index + 1}`,
        name: step.name,
        description: step.description || '',
        order: index + 1,
        type: step.type,
        
        configuration: {
          approvers: step.approvers,
          conditions: step.conditions,
          allowDelegation: step.allowDelegation ?? true,
          requireComments: step.requireComments ?? false,
          minApprovalCount: step.minApprovalCount
        },
        
        status: 'pending',
        
        results: {
          approvers: step.approvers.map(approver => ({
            userId: approver.userId,
            status: 'pending'
          }))
        }
      })),
      
      status: 'draft',
      
      metadata: {
        createdAt: new Date(),
        createdBy: params.createdBy,
        updatedAt: new Date(),
        updatedBy: params.createdBy,
        version: 1
      }
    };
    
    // Validate workflow
    await this.validateApprovalWorkflow(workflow);
    
    // Save workflow
    await this.saveApprovalWorkflow(workflow);
    
    return workflow;
  }
  
  // Process journal entry approval
  async processJournalEntryApproval(params: {
    entryId: string;
    action: 'approve' | 'reject' | 'delegate';
    approverId: string;
    comments?: string;
    delegateTo?: string;
  }): Promise<{
    success: boolean;
    request?: ApprovalRequest;
    entry?: IJournalEntry;
    error?: string;
  }> {
    // Get journal entry
    const entry = await JournalEntry.findById(params.entryId);
    if (!entry) {
      return { success: false, error: 'Journal entry not found' };
    }
    
    if (entry.approvalStatus !== 'pending') {
      return { success: false, error: 'Entry is not pending approval' };
    }
    
    // Get approval request
    const request = await this.getApprovalRequestByEntryId(params.entryId);
    if (!request) {
      return { success: false, error: 'Approval request not found' };
    }
    
    // Validate approver
    const currentStep = request.steps.find(step => step.status === 'in_progress');
    if (!currentStep) {
      return { success: false, error: 'No active approval step found' };
    }
    
    const approverIndex = currentStep.approvers.findIndex(
      a => a.userId === params.approverId && a.status === 'pending'
    );
    
    if (approverIndex === -1) {
      return { success: false, error: 'User is not an approver for this step' };
    }
    
    try {
      // Process action
      if (params.action === 'approve') {
        await this.processApproval(request, currentStep, approverIndex, params.comments);
      } else if (params.action === 'reject') {
        await this.processRejection(request, currentStep, approverIndex, params.comments);
      } else if (params.action === 'delegate') {
        if (!params.delegateTo) {
          return { success: false, error: 'Delegate user is required for delegation' };
        }
        await this.processDelegation(request, currentStep, approverIndex, params.delegateTo, params.comments);
      }
      
      // Update request
      await this.updateApprovalRequest(request);
      
      // Update journal entry if needed
      if (request.workflowProgress.status === 'approved') {
        entry.approvalStatus = 'approved';
        entry.approvedBy = params.approverId;
        entry.approvedAt = new Date();
        await entry.save();
      } else if (request.workflowProgress.status === 'rejected') {
        entry.approvalStatus = 'rejected';
        entry.rejectionReason = params.comments;
        await entry.save();
      }
      
      // Send notifications
      await this.sendApprovalNotifications(request, params.action);
      
      return {
        success: true,
        request,
        entry
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  // Create approval delegation
  async createApprovalDelegation(params: {
    delegatorId: string;
    delegateeId: string;
    startDate: Date;
    endDate: Date;
    scope?: {
      entryTypes?: string[];
      accountTypes?: string[];
      departments?: string[];
      locations?: string[];
      projects?: string[];
      amountRange?: {
        min?: number;
        max?: number;
      };
    };
    conditions?: Array<{
      field: string;
      operator: string;
      value: any;
    }>;
    createdBy: string;
  }): Promise<ApprovalDelegation> {
    const delegationId = `DEL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Validate users
    const [delegator, delegatee] = await Promise.all([
      User.findById(params.delegatorId),
      User.findById(params.delegateeId)
    ]);
    
    if (!delegator) {
      throw new Error('Delegator not found');
    }
    
    if (!delegatee) {
      throw new Error('Delegatee not found');
    }
    
    // Validate dates
    if (params.startDate >= params.endDate) {
      throw new Error('End date must be after start date');
    }
    
    if (params.endDate < new Date()) {
      throw new Error('End date cannot be in the past');
    }
    
    const delegation: ApprovalDelegation = {
      delegationId,
      delegatorId: params.delegatorId,
      delegateeId: params.delegateeId,
      
      configuration: {
        startDate: params.startDate,
        endDate: params.endDate,
        scope: params.scope || {},
        conditions: params.conditions || []
      },
      
      status: 'active',
      
      usage: {
        totalDelegations: 0,
        usedDelegations: 0
      },
      
      metadata: {
        createdAt: new Date(),
        createdBy: params.createdBy,
        updatedAt: new Date(),
        updatedBy: params.createdBy
      }
    };
    
    // Save delegation
    await this.saveApprovalDelegation(delegation);
    
    // Send notifications
    await this.sendDelegationNotifications(delegation, 'created');
    
    return delegation;
  }
  
  // Get approval analytics
  async getApprovalAnalytics(params: {
    startDate: Date;
    endDate: Date;
    workflowId?: string;
    approverId?: string;
    entryType?: string;
  }): Promise<ApprovalAnalytics> {
    // Mock analytics implementation
    return {
      period: {
        startDate: params.startDate,
        endDate: params.endDate
      },
      
      overview: {
        totalRequests: 500,
        approvedRequests: 450,
        rejectedRequests: 30,
        pendingRequests: 15,
        escalatedRequests: 5,
        expiredRequests: 0,
        averageProcessingTime: 18.5,
        approvalRate: 90.0
      },
      
      workflowPerformance: [
        {
          workflowId: 'wf1',
          workflowName: 'Standard Approval',
          totalRequests: 300,
          approvedRequests: 280,
          rejectedRequests: 15,
          averageProcessingTime: 16.0,
          approvalRate: 93.3,
          bottleneckSteps: [
            {
              stepName: 'Manager Review',
              averageTime: 12.0,
              delayReason: 'High workload'
            }
          ]
        }
      ],
      
      approverPerformance: [
        {
          userId: 'user1',
          userName: 'John Doe',
          role: 'Manager',
          totalApprovals: 100,
          totalRejections: 5,
          pendingApprovals: 3,
          averageDecisionTime: 8.5,
          approvalRate: 95.2,
          workload: {
            current: 3,
            average: 5,
            overload: false
          },
          delegationUsage: {
            delegated: 2,
            received: 1
          }
        }
      ],
      
      entryAnalysis: {
        byType: {
          'standard': { totalRequests: 400, approvedRequests: 370, rejectedRequests: 20, averageProcessingTime: 17.0, approvalRate: 92.5 },
          'adjusting': { totalRequests: 80, approvedRequests: 70, rejectedRequests: 8, averageProcessingTime: 22.0, approvalRate: 87.5 },
          'intercompany': { totalRequests: 20, approvedRequests: 10, rejectedRequests: 2, averageProcessingTime: 35.0, approvalRate: 83.3 }
        },
        byAmountRange: [
          {
            range: '0-1,000',
            count: 200,
            approvedCount: 195,
            rejectedCount: 3,
            approvalRate: 97.5,
            averageTime: 12.0
          },
          {
            range: '1,000-10,000',
            count: 250,
            approvedCount: 225,
            rejectedCount: 20,
            approvalRate: 90.0,
            averageTime: 20.0
          },
          {
            range: '10,000+',
            count: 50,
            approvedCount: 30,
            rejectedCount: 7,
            approvalRate: 81.6,
            averageTime: 45.0
          }
        ],
        byUrgency: {
          'low': { count: 300, approvedCount: 280, rejectedCount: 15, averageTime: 20.0 },
          'medium': { count: 150, approvedCount: 135, rejectedCount: 10, averageTime: 18.0 },
          'high': { count: 40, approvedCount: 30, rejectedCount: 4, averageTime: 12.0 },
          'urgent': { count: 10, approvedCount: 5, rejectedCount: 1, averageTime: 6.0 }
        }
      },
      
      ruleEffectiveness: [
        {
          ruleId: 'rule1',
          ruleName: 'High Amount Approval',
          applications: 50,
          correctApplications: 48,
          effectivenessRate: 96.0,
          commonIssues: [
            {
              issue: 'Incorrect threshold',
              frequency: 2
            }
          ]
        }
      ],
      
      trends: {
        monthly: [
          {
            month: '2024-01',
            totalRequests: 150,
            approvedRequests: 140,
            rejectedRequests: 8,
            averageProcessingTime: 17.5,
            approvalRate: 93.3
          },
          {
            month: '2024-02',
            totalRequests: 175,
            approvedRequests: 160,
            rejectedRequests: 12,
            averageProcessingTime: 19.0,
            approvalRate: 91.4
          },
          {
            month: '2024-03',
            totalRequests: 175,
            approvedRequests: 150,
            rejectedRequests: 10,
            averageProcessingTime: 18.5,
            approvalRate: 85.7
          }
        ],
        daily: [
          {
            date: '2024-03-01',
            requests: 25,
            approvals: 23,
            rejections: 1,
            averageTime: 18.0
          }
        ]
      },
      
      recommendations: [
        {
          type: 'workflow_optimization',
          priority: 'medium',
          title: 'Optimize Manager Review Step',
          description: 'Manager review step is causing delays due to high workload',
          impact: 'Reduce approval time by 30%',
          effort: 'medium',
          affectedItems: 1
        }
      ]
    };
  }
  
  // Helper methods
  private async validateApprovalRule(rule: ApprovalRule): Promise<void> {
    // Validate conditions
    for (const condition of rule.configuration.conditions) {
      if (!condition.field || !condition.operator || condition.value === undefined) {
        throw new Error('Invalid condition configuration');
      }
    }
    
    // Validate approvers
    if (rule.configuration.approvers.length === 0) {
      throw new Error('At least one approver is required');
    }
    
    // Check for duplicate approver orders
    const orders = rule.configuration.approvers.map(a => a.order);
    const uniqueOrders = new Set(orders);
    if (orders.length !== uniqueOrders.size) {
      throw new Error('Duplicate approver orders are not allowed');
    }
  }
  
  private async validateApprovalWorkflow(workflow: ApprovalWorkflow): Promise<void> {
    if (workflow.steps.length === 0) {
      throw new Error('At least one step is required');
    }
    
    // Validate step orders
    const orders = workflow.steps.map(s => s.order);
    const uniqueOrders = new Set(orders);
    if (orders.length !== uniqueOrders.size) {
      throw new Error('Duplicate step orders are not allowed');
    }
    
    // Validate each step
    for (const step of workflow.steps) {
      if (step.type === 'approval' && step.configuration.approvers.length === 0) {
        throw new Error(`Approval step ${step.name} must have at least one approver`);
      }
    }
  }
  
  private async processApproval(
    request: ApprovalRequest,
    step: any,
    approverIndex: number,
    comments?: string
  ): Promise<void> {
    // Update approver status
    step.approvers[approverIndex].status = 'approved';
    step.approvers[approverIndex].decisionAt = new Date();
    step.approvers[approverIndex].comments = comments;
    
    // Check if step is complete
    const approvedCount = step.approvers.filter((a: any) => a.status === 'approved').length;
    const rejectedCount = step.approvers.filter((a: any) => a.status === 'rejected').length;
    const requiredApprovals = step.approvers.filter((a: any) => a.required).length;
    
    if (approvedCount >= requiredApprovals) {
      step.status = 'completed';
      step.completedAt = new Date();
      step.result = {
        decision: 'approved',
        decisionBy: step.approvers[approverIndex].userId,
        decisionAt: new Date(),
        comments: comments || '',
        approvedCount,
        rejectedCount,
        totalApprovers: step.approvers.length
      };
      
      // Move to next step or complete workflow
      const nextStep = request.steps.find(s => s.order === step.order + 1);
      if (nextStep) {
        nextStep.status = 'in_progress';
        nextStep.startedAt = new Date();
        request.workflowProgress.currentStep++;
        
        // Mark approvers as current
        nextStep.approvers.forEach(a => a.isCurrent = true);
      } else {
        // Workflow complete
        request.workflowProgress.status = 'approved';
        request.workflowProgress.completedAt = new Date();
      }
    }
    
    // Add to history
    request.history.push({
      timestamp: new Date(),
      action: 'approved',
      performedBy: step.approvers[approverIndex].userId,
      details: `Step ${step.name} approved by ${step.approvers[approverIndex].userName}`,
      previousStatus: step.status === 'completed' ? 'in_progress' : 'pending',
      newStatus: step.status
    });
  }
  
  private async processRejection(
    request: ApprovalRequest,
    step: any,
    approverIndex: number,
    comments?: string
  ): Promise<void> {
    // Update approver status
    step.approvers[approverIndex].status = 'rejected';
    step.approvers[approverIndex].decisionAt = new Date();
    step.approvers[approverIndex].comments = comments;
    
    // Step rejected - workflow fails
    step.status = 'failed';
    step.completedAt = new Date();
    step.result = {
      decision: 'rejected',
      decisionBy: step.approvers[approverIndex].userId,
      decisionAt: new Date(),
      comments: comments || '',
      approvedCount: step.approvers.filter((a: any) => a.status === 'approved').length,
      rejectedCount: step.approvers.filter((a: any) => a.status === 'rejected').length,
      totalApprovers: step.approvers.length
    };
    
    // Workflow rejected
    request.workflowProgress.status = 'rejected';
    request.workflowProgress.completedAt = new Date();
    
    // Add to history
    request.history.push({
      timestamp: new Date(),
      action: 'rejected',
      performedBy: step.approvers[approverIndex].userId,
      details: `Step ${step.name} rejected by ${step.approvers[approverIndex].userName}`,
      previousStatus: 'in_progress',
      newStatus: 'rejected'
    });
  }
  
  private async processDelegation(
    request: ApprovalRequest,
    step: any,
    approverIndex: number,
    delegateTo: string,
    comments?: string
  ): Promise<void> {
    // Update approver status
    step.approvers[approverIndex].status = 'delegated';
    step.approvers[approverIndex].decisionAt = new Date();
    step.approvers[approverIndex].comments = comments;
    step.approvers[approverIndex].delegatedTo = delegateTo;
    
    // Add delegate as new approver
    const delegateUser = await User.findById(delegateTo);
    if (delegateUser) {
      step.approvers.push({
        userId: delegateTo,
        userName: `${delegateUser.firstName} ${delegateUser.lastName}`,
        role: step.approvers[approverIndex].role,
        status: 'pending',
        isCurrent: true
      });
    }
    
    // Add to history
    request.history.push({
      timestamp: new Date(),
      action: 'delegated',
      performedBy: step.approvers[approverIndex].userId,
      details: `Step ${step.name} delegated to ${delegateUser?.firstName} ${delegateUser?.lastName}`,
      previousStatus: 'pending',
      newStatus: 'pending'
    });
  }
  
  // Database operations (mock implementations)
  private async saveApprovalRule(rule: ApprovalRule): Promise<void> {
    console.log(`Saving approval rule ${rule.ruleId}`);
  }
  
  private async saveApprovalWorkflow(workflow: ApprovalWorkflow): Promise<void> {
    console.log(`Saving approval workflow ${workflow.workflowId}`);
  }
  
  private async saveApprovalDelegation(delegation: ApprovalDelegation): Promise<void> {
    console.log(`Saving approval delegation ${delegation.delegationId}`);
  }
  
  private async updateApprovalRequest(request: ApprovalRequest): Promise<void> {
    console.log(`Updating approval request ${request.requestId}`);
  }
  
  private async getApprovalRequestByEntryId(entryId: string): Promise<ApprovalRequest | null> {
    // Mock implementation
    return null;
  }
  
  private async sendApprovalNotifications(request: ApprovalRequest, action: string): Promise<void> {
    console.log(`Sending ${action} notifications for request ${request.requestId}`);
  }
  
  private async sendDelegationNotifications(delegation: ApprovalDelegation, action: string): Promise<void> {
    console.log(`Sending ${action} notifications for delegation ${delegation.delegationId}`);
  }
}
