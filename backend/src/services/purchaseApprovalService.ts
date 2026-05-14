import { PurchaseOrder, IPurchaseOrder } from '../models/Purchase';
import { User } from '../models/User';

export interface ApprovalRule {
  ruleId: string;
  name: string;
  description: string;
  isActive: boolean;
  priority: number;
  conditions: {
    amountRange?: {
      min?: number;
      max?: number;
    };
    departmentIds?: string[];
    costCenterIds?: string[];
    supplierIds?: string[];
    categories?: string[];
    itemTypes?: string[];
    urgency?: 'low' | 'medium' | 'high' | 'urgent';
    customFields?: Array<{
      fieldName: string;
      operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
      value: any;
    }>;
  };
  approvalHierarchy: Array<{
    level: number;
    role: string;
    userId?: string;
    department?: string;
    requiredAll?: boolean; // If true, all users at this level must approve
    timeoutHours?: number;
    escalationTo?: Array<{
      role: string;
      userId?: string;
      department?: string;
    }>;
  }>;
  autoApproval: {
    enabled: boolean;
    conditions: Array<{
      field: string;
      operator: string;
      value: any;
    }>;
  };
  notifications: {
    requestNotification: boolean;
    approvalNotification: boolean;
    rejectionNotification: boolean;
    escalationNotification: boolean;
    customRecipients?: string[];
  };
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

export interface ApprovalRequest {
  requestId: string;
  purchaseOrderId: string;
  orderNumber: string;
  requester: {
    userId: string;
    name: string;
    email: string;
    department: string;
  };
  supplier: {
    supplierId: string;
    name: string;
  };
  totals: {
    totalAmount: number;
    currency: string;
  };
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  type: 'standard' | 'blanket' | 'contract' | 'emergency' | 'stock_replenishment';
  status: 'pending' | 'approved' | 'rejected' | 'escalated' | 'expired';
  currentLevel: number;
  totalLevels: number;
  approvals: Array<{
    level: number;
    role: string;
    userId: string;
    name: string;
    email: string;
    status: 'pending' | 'approved' | 'rejected' | 'skipped';
    date?: Date;
    comments?: string;
    timeoutDate?: Date;
    escalated?: boolean;
  }>;
  ruleApplied: {
    ruleId: string;
    ruleName: string;
    appliedAt: Date;
  };
  history: Array<{
    date: Date;
    action: string;
    performedBy: string;
    details: string;
    previousStatus?: string;
    newStatus?: string;
  }>;
  createdAt: Date;
  expiresAt?: Date;
  completedAt?: Date;
}

export interface ApprovalDelegation {
  delegationId: string;
  delegatorId: string;
  delegatorName: string;
  delegateId: string;
  delegateName: string;
  role: string;
  department: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired' | 'cancelled';
  conditions: {
    amountRange?: {
      min?: number;
      max?: number;
    };
    departments?: string[];
    suppliers?: string[];
    categories?: string[];
  };
  approvalTypes: string[];
  reason: string;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

export class PurchaseApprovalService {
  // Submit PO for approval
  async submitForApproval(purchaseOrderId: string, submittedBy: string): Promise<ApprovalRequest> {
    const po = await PurchaseOrder.findOne({ purchaseOrderId });
    if (!po) {
      throw new Error('Purchase order not found');
    }

    if (po.status !== 'draft') {
      throw new Error('Only draft purchase orders can be submitted for approval');
    }

    // Find applicable approval rule
    const rule = await this.findApplicableRule(po);
    if (!rule) {
      throw new Error('No approval rule found for this purchase order');
    }

    // Check for auto-approval
    if (rule.autoApproval.enabled && await this.checkAutoApprovalConditions(po, rule.autoApproval.conditions)) {
      return await this.autoApprove(po, submittedBy);
    }

    // Create approval request
    const requestId = `APR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const approvalRequest: ApprovalRequest = {
      requestId,
      purchaseOrderId: po.purchaseOrderId,
      orderNumber: po.orderNumber,
      requester: {
        userId: po.requester.userId,
        name: po.requester.name,
        email: po.requester.email,
        department: po.requester.department
      },
      supplier: {
        supplierId: po.supplier.supplierId,
        name: po.supplier.name
      },
      totals: {
        totalAmount: po.totals.totalAmount,
        currency: po.totals.currency
      },
      urgency: po.priority,
      type: po.type,
      status: 'pending',
      currentLevel: 1,
      totalLevels: rule.approvalHierarchy.length,
      approvals: [],
      ruleApplied: {
        ruleId: rule.ruleId,
        ruleName: rule.name,
        appliedAt: new Date()
      },
      history: [{
        date: new Date(),
        action: 'Submitted for Approval',
        performedBy: submittedBy,
        details: `Purchase order submitted using rule: ${rule.name}`,
        newStatus: 'pending'
      }],
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days expiry
    };

    // Generate approval hierarchy
    for (const level of rule.approvalHierarchy) {
      const approvers = await this.getApproversForLevel(level, po);
      
      for (const approver of approvers) {
        approvalRequest.approvals.push({
          level: level.level,
          role: level.role,
          userId: approver.userId,
          name: approver.name,
          email: approver.email,
          status: 'pending',
          timeoutDate: new Date(Date.now() + (level.timeoutHours || 24) * 60 * 60 * 1000)
        });
      }
    }

    // Update PO status
    await PurchaseOrder.updateOne(
      { purchaseOrderId },
      {
        status: 'pending_approval',
        updatedAt: new Date(),
        updatedBy: submittedBy,
        $push: {
          history: {
            date: new Date(),
            action: 'Submitted for Approval',
            performedBy: submittedBy,
            details: `Purchase order submitted for approval`,
            previousStatus: 'draft',
            newStatus: 'pending_approval'
          }
        }
      }
    );

    // Send notifications
    await this.sendApprovalNotifications(approvalRequest, rule);

    // Save approval request (in a real implementation, you'd have an ApprovalRequest model)
    await this.saveApprovalRequest(approvalRequest);

    return approvalRequest;
  }

  // Approve PO
  async approvePurchaseOrder(
    purchaseOrderId: string,
    approverId: string,
    comments?: string
  ): Promise<ApprovalRequest> {
    const approvalRequest = await this.getApprovalRequest(purchaseOrderId);
    if (!approvalRequest) {
      throw new Error('Approval request not found');
    }

    const approver = await User.findOne({ userId: approverId });
    if (!approver) {
      throw new Error('Approver not found');
    }

    // Find the approver's pending approval
    const pendingApproval = approvalRequest.approvals.find(
      a => a.userId === approverId && a.status === 'pending'
    );

    if (!pendingApproval) {
      throw new Error('No pending approval found for this user');
    }

    // Update approval
    pendingApproval.status = 'approved';
    pendingApproval.date = new Date();
    pendingApproval.comments = comments;

    // Add to history
    approvalRequest.history.push({
      date: new Date(),
      action: 'Approved',
      performedBy: approverId,
      details: `Level ${pendingApproval.level} approved${comments ? ': ' + comments : ''}`,
      newStatus: 'pending'
    });

    // Check if level is complete
    const levelApprovals = approvalRequest.approvals.filter(
      a => a.level === pendingApproval.level
    );
    const levelComplete = levelApprovals.every(a => a.status === 'approved' || a.status === 'skipped');

    if (levelComplete) {
      approvalRequest.currentLevel++;
      
      // Check if all levels are complete
      if (approvalRequest.currentLevel > approvalRequest.totalLevels) {
        approvalRequest.status = 'approved';
        approvalRequest.completedAt = new Date();
        
        // Update PO status
        await PurchaseOrder.updateOne(
          { purchaseOrderId },
          {
            status: 'approved',
            approvedAt: new Date(),
            updatedAt: new Date(),
            updatedBy: approverId,
            $push: {
              history: {
                date: new Date(),
                action: 'Fully Approved',
                performedBy: approverId,
                details: 'Purchase order fully approved',
                previousStatus: 'pending_approval',
                newStatus: 'approved'
              }
            }
          }
        );
      }
    }

    // Update approval request
    await this.updateApprovalRequest(approvalRequest);

    // Send notifications
    await this.sendApprovalUpdateNotifications(approvalRequest, 'approved', approverId);

    return approvalRequest;
  }

  // Reject PO
  async rejectPurchaseOrder(
    purchaseOrderId: string,
    approverId: string,
    reason: string
  ): Promise<ApprovalRequest> {
    const approvalRequest = await this.getApprovalRequest(purchaseOrderId);
    if (!approvalRequest) {
      throw new Error('Approval request not found');
    }

    const approver = await User.findOne({ userId: approverId });
    if (!approver) {
      throw new Error('Approver not found');
    }

    // Find the approver's pending approval
    const pendingApproval = approvalRequest.approvals.find(
      a => a.userId === approverId && a.status === 'pending'
    );

    if (!pendingApproval) {
      throw new Error('No pending approval found for this user');
    }

    // Update approval
    pendingApproval.status = 'rejected';
    pendingApproval.date = new Date();
    pendingApproval.comments = reason;

    // Update request status
    approvalRequest.status = 'rejected';
    approvalRequest.completedAt = new Date();

    // Add to history
    approvalRequest.history.push({
      date: new Date(),
      action: 'Rejected',
      performedBy: approverId,
      details: `Level ${pendingApproval.level} rejected: ${reason}`,
      previousStatus: 'pending',
      newStatus: 'rejected'
    });

    // Update PO status
    await PurchaseOrder.updateOne(
      { purchaseOrderId },
      {
        status: 'rejected',
        updatedAt: new Date(),
        updatedBy: approverId,
        $push: {
          history: {
            date: new Date(),
            action: 'Rejected',
            performedBy: approverId,
            details: `Purchase order rejected: ${reason}`,
            previousStatus: 'pending_approval',
            newStatus: 'rejected'
          }
        }
      }
    );

    // Update approval request
    await this.updateApprovalRequest(approvalRequest);

    // Send notifications
    await this.sendApprovalUpdateNotifications(approvalRequest, 'rejected', approverId);

    return approvalRequest;
  }

  // Escalate approval
  async escalateApproval(
    purchaseOrderId: string,
    currentApproverId: string,
    reason: string,
    escalateTo?: string
  ): Promise<ApprovalRequest> {
    const approvalRequest = await this.getApprovalRequest(purchaseOrderId);
    if (!approvalRequest) {
      throw new Error('Approval request not found');
    }

    const currentApproval = approvalRequest.approvals.find(
      a => a.userId === currentApproverId && a.status === 'pending'
    );

    if (!currentApproval) {
      throw new Error('No pending approval found for escalation');
    }

    // Mark current approval as escalated
    currentApproval.escalated = true;
    currentApproval.status = 'rejected';
    currentApproval.comments = `Escalated: ${reason}`;

    // Find escalation targets
    const rule = await this.getApprovalRule(approvalRequest.ruleApplied.ruleId);
    const escalationLevel = rule.approvalHierarchy.find(h => h.level === currentApproval.level);
    
    if (!escalationLevel || !escalationLevel.escalationTo) {
      throw new Error('No escalation path defined for this approval level');
    }

    // Add new approvers
    for (const escalationTarget of escalationLevel.escalationTo) {
      const newApprovers = await this.getApproversForLevel(escalationTarget, 
        await PurchaseOrder.findOne({ purchaseOrderId }) as IPurchaseOrder);
      
      for (const approver of newApprovers) {
        approvalRequest.approvals.push({
          level: currentApproval.level + 0.5, // Use half-level for escalations
          role: escalationTarget.role,
          userId: approver.userId,
          name: approver.name,
          email: approver.email,
          status: 'pending',
          timeoutDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
        });
      }
    }

    // Update status
    approvalRequest.status = 'escalated';

    // Add to history
    approvalRequest.history.push({
      date: new Date(),
      action: 'Escalated',
      performedBy: currentApproverId,
      details: `Escalated to next level: ${reason}`,
      newStatus: 'escalated'
    });

    // Update approval request
    await this.updateApprovalRequest(approvalRequest);

    // Send notifications
    await this.sendEscalationNotifications(approvalRequest, currentApproverId, reason);

    return approvalRequest;
  }

  // Create approval rule
  async createApprovalRule(params: {
    name: string;
    description: string;
    conditions: {
      amountRange?: {
        min?: number;
        max?: number;
      };
      departmentIds?: string[];
      costCenterIds?: string[];
      supplierIds?: string[];
      categories?: string[];
      itemTypes?: string[];
      urgency?: 'low' | 'medium' | 'high' | 'urgent';
      customFields?: Array<{
        fieldName: string;
        operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
        value: any;
      }>;
    };
    approvalHierarchy: Array<{
      level: number;
      role: string;
      userId?: string;
      department?: string;
      requiredAll?: boolean;
      timeoutHours?: number;
      escalationTo?: Array<{
        role: string;
        userId?: string;
        department?: string;
      }>;
    }>;
    autoApproval?: {
      enabled: boolean;
      conditions: Array<{
        field: string;
        operator: string;
        value: any;
      }>;
    };
    notifications?: {
      requestNotification?: boolean;
      approvalNotification?: boolean;
      rejectionNotification?: boolean;
      escalationNotification?: boolean;
      customRecipients?: string[];
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
      approvalHierarchy: params.approvalHierarchy,
      autoApproval: params.autoApproval || {
        enabled: false,
        conditions: []
      },
      notifications: {
        requestNotification: params.notifications?.requestNotification ?? true,
        approvalNotification: params.notifications?.approvalNotification ?? true,
        rejectionNotification: params.notifications?.rejectionNotification ?? true,
        escalationNotification: params.notifications?.escalationNotification ?? true,
        customRecipients: params.notifications?.customRecipients || []
      },
      createdAt: new Date(),
      createdBy: params.createdBy,
      updatedAt: new Date(),
      updatedBy: params.createdBy
    };

    // Save rule (in a real implementation, you'd have an ApprovalRule model)
    await this.saveApprovalRule(rule);

    return rule;
  }

  // Get pending approvals for user
  async getPendingApprovals(userId: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{
    approvals: ApprovalRequest[];
    total: number;
    page: number;
    limit: number;
  }> {
    // In a real implementation, query the ApprovalRequest collection
    const pendingApprovals = await this.getPendingApprovalsForUser(userId, params);
    return pendingApprovals;
  }

  // Get approval history
  async getApprovalHistory(params: {
    purchaseOrderId?: string;
    userId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    approvals: ApprovalRequest[];
    total: number;
    page: number;
    limit: number;
  }> {
    // In a real implementation, query the ApprovalRequest collection
    const history = await this.getApprovalHistoryData(params);
    return history;
  }

  // Helper methods
  private async findApplicableRule(po: IPurchaseOrder): Promise<ApprovalRule | null> {
    // In a real implementation, query ApprovalRule collection
    // For now, return a default rule
    return {
      ruleId: 'RULE-DEFAULT',
      name: 'Default Approval Rule',
      description: 'Default approval workflow',
      isActive: true,
      priority: 1,
      conditions: {},
      approvalHierarchy: [
        {
          level: 1,
          role: 'Manager',
          timeoutHours: 24
        }
      ],
      autoApproval: {
        enabled: false,
        conditions: []
      },
      notifications: {
        requestNotification: true,
        approvalNotification: true,
        rejectionNotification: true,
        escalationNotification: true
      },
      createdAt: new Date(),
      createdBy: 'system',
      updatedAt: new Date(),
      updatedBy: 'system'
    };
  }

  private async checkAutoApprovalConditions(po: IPurchaseOrder, conditions: any[]): Promise<boolean> {
    // Check if PO meets auto-approval conditions
    for (const condition of conditions) {
      switch (condition.field) {
        case 'totalAmount':
          if (condition.operator === 'less_than' && po.totals.totalAmount >= condition.value) {
            return false;
          }
          break;
        // Add more condition checks as needed
      }
    }
    return true;
  }

  private async autoApprove(po: IPurchaseOrder, submittedBy: string): Promise<ApprovalRequest> {
    // Auto-approve the PO
    await PurchaseOrder.updateOne(
      { purchaseOrderId: po.purchaseOrderId },
      {
        status: 'approved',
        approvedAt: new Date(),
        updatedAt: new Date(),
        updatedBy: 'system',
        $push: {
          history: {
            date: new Date(),
            action: 'Auto Approved',
            performedBy: 'system',
            details: 'Purchase order automatically approved',
            previousStatus: 'draft',
            newStatus: 'approved'
          }
        }
      }
    );

    // Return a mock approval request
    return {
      requestId: `APR-AUTO-${Date.now()}`,
      purchaseOrderId: po.purchaseOrderId,
      orderNumber: po.orderNumber,
      requester: {
        userId: po.requester.userId,
        name: po.requester.name,
        email: po.requester.email,
        department: po.requester.department
      },
      supplier: {
        supplierId: po.supplier.supplierId,
        name: po.supplier.name
      },
      totals: {
        totalAmount: po.totals.totalAmount,
        currency: po.totals.currency
      },
      urgency: po.priority,
      type: po.type,
      status: 'approved',
      currentLevel: 0,
      totalLevels: 0,
      approvals: [],
      ruleApplied: {
        ruleId: 'RULE-AUTO',
        ruleName: 'Auto Approval',
        appliedAt: new Date()
      },
      history: [{
        date: new Date(),
        action: 'Auto Approved',
        performedBy: 'system',
        details: 'Purchase order automatically approved',
        newStatus: 'approved'
      }],
      createdAt: new Date(),
      completedAt: new Date()
    };
  }

  private async getApproversForLevel(level: any, po: IPurchaseOrder): Promise<Array<{
    userId: string;
    name: string;
    email: string;
  }>> {
    // In a real implementation, find users based on role, department, etc.
    // For now, return mock approvers
    return [
      {
        userId: 'user-manager-001',
        name: 'John Manager',
        email: 'john.manager@company.com'
      }
    ];
  }

  private async sendApprovalNotifications(approvalRequest: ApprovalRequest, rule: ApprovalRule): Promise<void> {
    // Send notifications to approvers
    console.log(`Sending approval notifications for request ${approvalRequest.requestId}`);
  }

  private async sendApprovalUpdateNotifications(
    approvalRequest: ApprovalRequest,
    action: string,
    performedBy: string
  ): Promise<void> {
    // Send update notifications
    console.log(`Sending ${action} notifications for request ${approvalRequest.requestId}`);
  }

  private async sendEscalationNotifications(
    approvalRequest: ApprovalRequest,
    escalatedBy: string,
    reason: string
  ): Promise<void> {
    // Send escalation notifications
    console.log(`Sending escalation notifications for request ${approvalRequest.requestId}`);
  }

  private async saveApprovalRequest(approvalRequest: ApprovalRequest): Promise<void> {
    // Save to database (mock implementation)
    console.log(`Saving approval request ${approvalRequest.requestId}`);
  }

  private async updateApprovalRequest(approvalRequest: ApprovalRequest): Promise<void> {
    // Update in database (mock implementation)
    console.log(`Updating approval request ${approvalRequest.requestId}`);
  }

  private async getApprovalRequest(purchaseOrderId: string): Promise<ApprovalRequest | null> {
    // Get from database (mock implementation)
    return null;
  }

  private async getApprovalRule(ruleId: string): Promise<ApprovalRule | null> {
    // Get from database (mock implementation)
    return null;
  }

  private async saveApprovalRule(rule: ApprovalRule): Promise<void> {
    // Save to database (mock implementation)
    console.log(`Saving approval rule ${rule.ruleId}`);
  }

  private async getPendingApprovalsForUser(userId: string, params?: any): Promise<{
    approvals: ApprovalRequest[];
    total: number;
    page: number;
    limit: number;
  }> {
    // Get from database (mock implementation)
    return {
      approvals: [],
      total: 0,
      page: 1,
      limit: 20
    };
  }

  private async getApprovalHistoryData(params: any): Promise<{
    approvals: ApprovalRequest[];
    total: number;
    page: number;
    limit: number;
  }> {
    // Get from database (mock implementation)
    return {
      approvals: [],
      total: 0,
      page: 1,
      limit: 20
    };
  }
}
