import { PurchaseOrder, IPurchaseOrder } from '../models/Purchase';
import { User } from '../models/User';

export interface PurchaseBudget {
  budgetId: string;
  name: string;
  description: string;
  fiscalYear: string;
  fiscalPeriod: 'annual' | 'quarterly' | 'monthly';
  status: 'active' | 'inactive' | 'closed' | 'archived';
  
  // Budget Structure
  structure: {
    type: 'hierarchical' | 'flat' | 'matrix';
    categories: Array<{
      categoryId: string;
      name: string;
      parentId?: string;
      level: number;
      allocationMethod: 'fixed' | 'percentage' | 'formula';
    }>;
    departments: Array<{
      departmentId: string;
      name: string;
      managerId: string;
      managerName: string;
    }>;
    costCenters: Array<{
      costCenterId: string;
      name: string;
      departmentId: string;
      managerId: string;
      managerName: string;
    }>;
  };
  
  // Budget Allocations
  allocations: Array<{
    allocationId: string;
    categoryId: string;
    departmentId?: string;
    costCenterId?: string;
    budgetedAmount: number;
    currency: string;
    allocatedAmount: number;
    availableAmount: number;
    committedAmount: number;
    actualAmount: number;
    variance: number;
    variancePercentage: number;
    period: {
      startDate: Date;
      endDate: Date;
    };
    owner: {
      userId: string;
      name: string;
      email: string;
    };
    approvers: Array<{
      userId: string;
      name: string;
      role: string;
    }>;
    notes?: string;
  }>;
  
  // Budget Rules
  rules: {
    approvalRequired: boolean;
    approvalThreshold: number; // percentage
    overspendAllowed: boolean;
    overspendLimit: number; // percentage
    rolloverEnabled: boolean;
    rolloverRules: {
      unusedPercentage: number; // percentage that can be rolled over
      maxRolloverAmount: number;
      expirationPeriod: number; // days
    };
    alertThresholds: {
      warning: number; // percentage
      critical: number; // percentage
      exceeded: number; // percentage
    };
  };
  
  // Tracking Information
  tracking: {
    totalBudgeted: number;
    totalAllocated: number;
    totalCommitted: number;
    totalActual: number;
    totalAvailable: number;
    utilizationRate: number; // percentage
    remainingBudget: number;
    remainingDays: number;
    projectedSpend: number;
    projectedVariance: number;
  };
  
  // Commitments
  commitments: Array<{
    commitmentId: string;
    purchaseOrderId: string;
    purchaseOrderNumber: string;
    allocationId: string;
    amount: number;
    currency: string;
    committedDate: Date;
    committedBy: string;
    status: 'committed' | 'released' | 'converted';
    expectedDeliveryDate: Date;
    actualDeliveryDate?: Date;
    notes?: string;
  }>;
  
  // Actuals
  actuals: Array<{
    actualId: string;
    allocationId: string;
    purchaseOrderId: string;
    purchaseOrderNumber: string;
    invoiceId?: string;
    invoiceNumber?: string;
    amount: number;
    currency: string;
    actualDate: Date;
    category: string;
    description: string;
    approvedBy: string;
    notes?: string;
  }>;
  
  // Adjustments
  adjustments: Array<{
    adjustmentId: string;
    allocationId: string;
    type: 'increase' | 'decrease' | 'transfer' | 'reallocate';
    amount: number;
    currency: string;
    reason: string;
    approvedBy: string;
    approvedAt: Date;
    effectiveDate: Date;
    fromAllocationId?: string; // for transfers
    toAllocationId?: string; // for transfers
    notes?: string;
  }>;
  
  // Alerts and Notifications
  alerts: Array<{
    alertId: string;
    allocationId: string;
    type: 'warning' | 'critical' | 'exceeded' | 'expiring' | 'rollover';
    message: string;
    threshold: number;
    currentValue: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'active' | 'acknowledged' | 'resolved';
    createdAt: Date;
    acknowledgedAt?: Date;
    acknowledgedBy?: string;
    resolvedAt?: Date;
    resolvedBy?: string;
  }>;
  
  // Audit Trail
  auditTrail: Array<{
    timestamp: Date;
    action: string;
    performedBy: string;
    details: string;
    previousValues?: Record<string, any>;
    newValues?: Record<string, any>;
  }>;
  
  // Timestamps
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  activatedAt?: Date;
  activatedBy?: string;
  closedAt?: Date;
  closedBy?: string;
}

export interface BudgetRequest {
  requestId: string;
  budgetId: string;
  budgetName: string;
  
  // Request Information
  type: 'purchase' | 'adjustment' | 'transfer' | 'reallocate';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'submitted' | 'pending_approval' | 'approved' | 'rejected' | 'cancelled';
  
  // Requester Information
  requester: {
    userId: string;
    name: string;
    email: string;
    department: string;
    costCenter: string;
  };
  
  // Purchase Details (for purchase requests)
  purchaseDetails?: {
    purchaseOrderId?: string;
    purchaseOrderNumber?: string;
    supplierId: string;
    supplierName: string;
    items: Array<{
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      categoryId: string;
      categoryName: string;
    }>;
    totalAmount: number;
    currency: string;
    expectedDeliveryDate: Date;
    justification: string;
  };
  
  // Adjustment Details (for adjustment requests)
  adjustmentDetails?: {
    allocationId: string;
    allocationName: string;
    currentBudget: number;
    requestedAmount: number;
    adjustmentType: 'increase' | 'decrease';
    reason: string;
    effectiveDate: Date;
    supportingDocuments: Array<{
      name: string;
      type: string;
      url: string;
    }>;
  };
  
  // Transfer Details (for transfer requests)
  transferDetails?: {
    fromAllocationId: string;
    fromAllocationName: string;
    toAllocationId: string;
    toAllocationName: string;
    transferAmount: number;
    reason: string;
    effectiveDate: Date;
  };
  
  // Budget Impact
  budgetImpact: {
    allocationId: string;
    allocationName: string;
    currentBudget: number;
    currentCommitted: number;
    currentActual: number;
    currentAvailable: number;
    requestedAmount: number;
    projectedAvailable: number;
    projectedUtilization: number;
    exceedsBudget: boolean;
    exceedAmount: number;
    requiresApproval: boolean;
  };
  
  // Approval Workflow
  approvals: Array<{
    approvalId: string;
    level: number;
    role: string;
    userId: string;
    name: string;
    status: 'pending' | 'approved' | 'rejected';
    date?: Date;
    comments?: string;
    timeoutDate?: Date;
  }>;
  
  // Supporting Documents
  attachments: Array<{
    attachmentId: string;
    name: string;
    type: 'quote' | 'specification' | 'justification' | 'other';
    url: string;
    uploadedAt: Date;
    uploadedBy: string;
    description: string;
  }>;
  
  // Notes and Communications
  notes: Array<{
    noteId: string;
    content: string;
    createdBy: string;
    createdAt: Date;
    type: 'internal' | 'external' | 'system';
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
  
  // Timestamps
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  submittedAt?: Date;
  approvedAt?: Date;
  approvedBy?: string;
}

export class PurchaseBudgetService {
  // Create purchase budget
  async createPurchaseBudget(params: {
    name: string;
    description: string;
    fiscalYear: string;
    fiscalPeriod: 'annual' | 'quarterly' | 'monthly';
    structure: {
      type: 'hierarchical' | 'flat' | 'matrix';
      categories: Array<{
        categoryId: string;
        name: string;
        parentId?: string;
        level: number;
        allocationMethod: 'fixed' | 'percentage' | 'formula';
      }>;
      departments: Array<{
        departmentId: string;
        name: string;
        managerId: string;
        managerName: string;
      }>;
      costCenters: Array<{
        costCenterId: string;
        name: string;
        departmentId: string;
        managerId: string;
        managerName: string;
      }>;
    };
    allocations: Array<{
      categoryId: string;
      departmentId?: string;
      costCenterId?: string;
      budgetedAmount: number;
      currency: string;
      period: {
        startDate: Date;
        endDate: Date;
      };
      owner: {
        userId: string;
        name: string;
        email: string;
      };
      approvers?: Array<{
        userId: string;
        name: string;
        role: string;
      }>;
      notes?: string;
    }>;
    rules?: {
      approvalRequired?: boolean;
      approvalThreshold?: number;
      overspendAllowed?: boolean;
      overspendLimit?: number;
      rolloverEnabled?: boolean;
      rolloverRules?: {
        unusedPercentage: number;
        maxRolloverAmount: number;
        expirationPeriod: number;
      };
      alertThresholds?: {
        warning: number;
        critical: number;
        exceeded: number;
      };
    };
    createdBy: string;
  }): Promise<PurchaseBudget> {
    const budgetId = `BUD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Process allocations
    const processedAllocations = params.allocations.map(allocation => ({
      allocationId: `ALLOC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      ...allocation,
      allocatedAmount: allocation.budgetedAmount,
      availableAmount: allocation.budgetedAmount,
      committedAmount: 0,
      actualAmount: 0,
      variance: 0,
      variancePercentage: 0
    }));
    
    // Calculate totals
    const totalBudgeted = processedAllocations.reduce((sum, alloc) => sum + alloc.budgetedAmount, 0);
    const totalAllocated = totalBudgeted;
    
    const budget: PurchaseBudget = {
      budgetId,
      name: params.name,
      description: params.description,
      fiscalYear: params.fiscalYear,
      fiscalPeriod: params.fiscalPeriod,
      status: 'active',
      
      structure: params.structure,
      
      allocations: processedAllocations,
      
      rules: {
        approvalRequired: params.rules?.approvalRequired ?? true,
        approvalThreshold: params.rules?.approvalThreshold ?? 80,
        overspendAllowed: params.rules?.overspendAllowed ?? false,
        overspendLimit: params.rules?.overspendLimit ?? 0,
        rolloverEnabled: params.rules?.rolloverEnabled ?? false,
        rolloverRules: params.rules?.rolloverRules || {
          unusedPercentage: 0,
          maxRolloverAmount: 0,
          expirationPeriod: 0
        },
        alertThresholds: params.rules?.alertThresholds || {
          warning: 80,
          critical: 95,
          exceeded: 100
        }
      },
      
      tracking: {
        totalBudgeted,
        totalAllocated,
        totalCommitted: 0,
        totalActual: 0,
        totalAvailable: totalBudgeted,
        utilizationRate: 0,
        remainingBudget: totalBudgeted,
        remainingDays: Math.ceil((processedAllocations[0]?.period.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        projectedSpend: 0,
        projectedVariance: 0
      },
      
      commitments: [],
      actuals: [],
      adjustments: [],
      alerts: [],
      
      auditTrail: [{
        timestamp: new Date(),
        action: 'Budget Created',
        performedBy: params.createdBy,
        details: `Purchase budget ${params.name} created with ${processedAllocations.length} allocations`,
        newValues: {
          totalBudgeted,
          totalAllocations: processedAllocations.length
        }
      }],
      
      createdAt: new Date(),
      createdBy: params.createdBy,
      updatedAt: new Date(),
      updatedBy: params.createdBy,
      activatedAt: new Date(),
      activatedBy: params.createdBy
    };
    
    // Save budget
    await this.savePurchaseBudget(budget);
    
    return budget;
  }
  
  // Commit budget for purchase order
  async commitBudget(params: {
    purchaseOrderId: string;
    purchaseOrderNumber: string;
    budgetId: string;
    allocationId: string;
    amount: number;
    currency: string;
    expectedDeliveryDate: Date;
    committedBy: string;
    notes?: string;
  }): Promise<PurchaseBudget> {
    const budget = await this.getPurchaseBudget(params.budgetId);
    if (!budget) {
      throw new Error('Budget not found');
    }
    
    const allocation = budget.allocations.find(a => a.allocationId === params.allocationId);
    if (!allocation) {
      throw new Error('Budget allocation not found');
    }
    
    // Check if sufficient budget is available
    if (allocation.availableAmount < params.amount && !budget.rules.overspendAllowed) {
      throw new Error('Insufficient budget available');
    }
    
    // Create commitment
    const commitment = {
      commitmentId: `COMMIT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      purchaseOrderId: params.purchaseOrderId,
      purchaseOrderNumber: params.purchaseOrderNumber,
      allocationId: params.allocationId,
      amount: params.amount,
      currency: params.currency,
      committedDate: new Date(),
      committedBy: params.committedBy,
      status: 'committed' as const,
      expectedDeliveryDate: params.expectedDeliveryDate,
      notes: params.notes
    };
    
    budget.commitments.push(commitment);
    
    // Update allocation
    allocation.committedAmount += params.amount;
    allocation.availableAmount = allocation.allocatedAmount - allocation.committedAmount;
    allocation.variance = allocation.actualAmount - allocation.allocatedAmount;
    allocation.variancePercentage = (allocation.variance / allocation.allocatedAmount) * 100;
    
    // Update tracking
    await this.updateBudgetTracking(budget);
    
    // Check for alerts
    await this.checkBudgetAlerts(budget, allocation);
    
    // Add to audit trail
    budget.auditTrail.push({
      timestamp: new Date(),
      action: 'Budget Committed',
      performedBy: params.committedBy,
      details: `Committed ${params.amount} to allocation ${allocation.allocationId} for PO ${params.purchaseOrderNumber}`,
      newValues: {
        commitmentId: commitment.commitmentId,
        amount: params.amount,
        availableAmount: allocation.availableAmount
      }
    });
    
    // Update timestamps
    budget.updatedAt = new Date();
    budget.updatedBy = params.committedBy;
    
    // Save changes
    await this.updatePurchaseBudget(budget);
    
    return budget;
  }
  
  // Release budget commitment
  async releaseCommitment(params: {
    budgetId: string;
    commitmentId: string;
    releaseAmount?: number; // partial release
    reason: string;
    releasedBy: string;
  }): Promise<PurchaseBudget> {
    const budget = await this.getPurchaseBudget(params.budgetId);
    if (!budget) {
      throw new Error('Budget not found');
    }
    
    const commitment = budget.commitments.find(c => c.commitmentId === params.commitmentId);
    if (!commitment) {
      throw new Error('Commitment not found');
    }
    
    if (commitment.status !== 'committed') {
      throw new Error('Only committed budgets can be released');
    }
    
    const releaseAmount = params.releaseAmount || commitment.amount;
    
    // Update allocation
    const allocation = budget.allocations.find(a => a.allocationId === commitment.allocationId);
    if (allocation) {
      allocation.committedAmount -= releaseAmount;
      allocation.availableAmount += releaseAmount;
      allocation.variance = allocation.actualAmount - allocation.allocatedAmount;
      allocation.variancePercentage = (allocation.variance / allocation.allocatedAmount) * 100;
    }
    
    // Update or remove commitment
    if (releaseAmount >= commitment.amount) {
      commitment.status = 'released';
    } else {
      commitment.amount -= releaseAmount;
    }
    
    // Update tracking
    await this.updateBudgetTracking(budget);
    
    // Add to audit trail
    budget.auditTrail.push({
      timestamp: new Date(),
      action: 'Commitment Released',
      performedBy: params.releasedBy,
      details: `Released ${releaseAmount} from commitment ${params.commitmentId}: ${params.reason}`,
      newValues: {
        releaseAmount,
        remainingCommitment: commitment.amount
      }
    });
    
    // Update timestamps
    budget.updatedAt = new Date();
    budget.updatedBy = params.releasedBy;
    
    // Save changes
    await this.updatePurchaseBudget(budget);
    
    return budget;
  }
  
  // Record actual spend
  async recordActualSpend(params: {
    budgetId: string;
    allocationId: string;
    purchaseOrderId: string;
    purchaseOrderNumber: string;
    invoiceId?: string;
    invoiceNumber?: string;
    amount: number;
    currency: string;
    actualDate: Date;
    category: string;
    description: string;
    approvedBy: string;
    notes?: string;
  }): Promise<PurchaseBudget> {
    const budget = await this.getPurchaseBudget(params.budgetId);
    if (!budget) {
      throw new Error('Budget not found');
    }
    
    const allocation = budget.allocations.find(a => a.allocationId === params.allocationId);
    if (!allocation) {
      throw new Error('Budget allocation not found');
    }
    
    // Create actual record
    const actual = {
      actualId: `ACTUAL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      allocationId: params.allocationId,
      purchaseOrderId: params.purchaseOrderId,
      purchaseOrderNumber: params.purchaseOrderNumber,
      invoiceId: params.invoiceId,
      invoiceNumber: params.invoiceNumber,
      amount: params.amount,
      currency: params.currency,
      actualDate: params.actualDate,
      category: params.category,
      description: params.description,
      approvedBy: params.approvedBy,
      notes: params.notes
    };
    
    budget.actuals.push(actual);
    
    // Update allocation
    allocation.actualAmount += params.amount;
    allocation.availableAmount = allocation.allocatedAmount - allocation.committedAmount - allocation.actualAmount;
    allocation.variance = allocation.actualAmount - allocation.allocatedAmount;
    allocation.variancePercentage = (allocation.variance / allocation.allocatedAmount) * 100;
    
    // Update tracking
    await this.updateBudgetTracking(budget);
    
    // Check for alerts
    await this.checkBudgetAlerts(budget, allocation);
    
    // Add to audit trail
    budget.auditTrail.push({
      timestamp: new Date(),
      action: 'Actual Spend Recorded',
      performedBy: params.approvedBy,
      details: `Recorded actual spend of ${params.amount} for ${params.description}`,
      newValues: {
        actualId: actual.actualId,
        amount: params.amount,
        actualAmount: allocation.actualAmount
      }
    });
    
    // Update timestamps
    budget.updatedAt = new Date();
    budget.updatedBy = params.approvedBy;
    
    // Save changes
    await this.updatePurchaseBudget(budget);
    
    return budget;
  }
  
  // Create budget adjustment request
  async createBudgetAdjustmentRequest(params: {
    budgetId: string;
    allocationId: string;
    adjustmentType: 'increase' | 'decrease';
    amount: number;
    reason: string;
    effectiveDate: Date;
    supportingDocuments?: Array<{
      name: string;
      type: string;
      url: string;
    }>;
    notes?: string;
    requestedBy: string;
  }): Promise<BudgetRequest> {
    const budget = await this.getPurchaseBudget(params.budgetId);
    if (!budget) {
      throw new Error('Budget not found');
    }
    
    const allocation = budget.allocations.find(a => a.allocationId === params.allocationId);
    if (!allocation) {
      throw new Error('Budget allocation not found');
    }
    
    const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Calculate budget impact
    const projectedAvailable = params.adjustmentType === 'increase' 
      ? allocation.availableAmount + params.amount
      : allocation.availableAmount - params.amount;
    
    const projectedUtilization = ((allocation.committedAmount + allocation.actualAmount) / 
      (allocation.allocatedAmount + (params.adjustmentType === 'increase' ? params.amount : -params.amount))) * 100;
    
    const exceedsBudget = projectedAvailable < 0;
    const requiresApproval = exceedsBudget || Math.abs(params.amount) > (allocation.allocatedAmount * 0.1); // 10% threshold
    
    const requester = await this.getUserDetails(params.requestedBy);
    
    const request: BudgetRequest = {
      requestId,
      budgetId: params.budgetId,
      budgetName: budget.name,
      
      type: 'adjustment',
      priority: exceedsBudget ? 'high' : 'medium',
      status: 'draft',
      
      requester: {
        userId: requester.userId,
        name: requester.name,
        email: requester.email,
        department: requester.department || 'Unknown',
        costCenter: allocation.costCenterId || 'Unknown'
      },
      
      adjustmentDetails: {
        allocationId: params.allocationId,
        allocationName: `${allocation.categoryId} - ${allocation.departmentId || 'All Departments'}`,
        currentBudget: allocation.allocatedAmount,
        requestedAmount: params.amount,
        adjustmentType: params.adjustmentType,
        reason: params.reason,
        effectiveDate: params.effectiveDate,
        supportingDocuments: params.supportingDocuments || []
      },
      
      budgetImpact: {
        allocationId: params.allocationId,
        allocationName: `${allocation.categoryId} - ${allocation.departmentId || 'All Departments'}`,
        currentBudget: allocation.allocatedAmount,
        currentCommitted: allocation.committedAmount,
        currentActual: allocation.actualAmount,
        currentAvailable: allocation.availableAmount,
        requestedAmount: params.amount,
        projectedAvailable,
        projectedUtilization,
        exceedsBudget,
        exceedAmount: exceedsBudget ? Math.abs(projectedAvailable) : 0,
        requiresApproval
      },
      
      approvals: requiresApproval ? await this.setupApprovalWorkflow(budget, allocation) : [],
      
      attachments: params.supportingDocuments?.map(doc => ({
        attachmentId: `ATT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        ...doc,
        uploadedAt: new Date(),
        uploadedBy: params.requestedBy,
        description: ''
      })) || [],
      
      notes: params.notes ? [{
        noteId: `NOTE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        content: params.notes,
        createdBy: params.requestedBy,
        createdAt: new Date(),
        type: 'internal'
      }] : [],
      
      history: [{
        timestamp: new Date(),
        action: 'Adjustment Request Created',
        performedBy: params.requestedBy,
        details: `Budget adjustment request created: ${params.adjustmentType} ${params.amount}`,
        systemGenerated: false
      }],
      
      createdAt: new Date(),
      createdBy: params.requestedBy,
      updatedAt: new Date(),
      updatedBy: params.requestedBy
    };
    
    // Save request
    await this.saveBudgetRequest(request);
    
    return request;
  }
  
  // Get budget analytics
  async getBudgetAnalytics(params: {
    budgetId: string;
    period?: {
      startDate: Date;
      endDate: Date;
    };
    includeProjections?: boolean;
  }): Promise<{
    summary: {
      totalBudgeted: number;
      totalCommitted: number;
      totalActual: number;
      totalAvailable: number;
      utilizationRate: number;
      projectedSpend: number;
      projectedVariance: number;
    };
    categoryBreakdown: Array<{
      categoryId: string;
      categoryName: string;
      budgeted: number;
      committed: number;
      actual: number;
      available: number;
      utilizationRate: number;
      variance: number;
      variancePercentage: number;
    }>;
    departmentBreakdown: Array<{
      departmentId: string;
      departmentName: string;
      budgeted: number;
      committed: number;
      actual: number;
      available: number;
      utilizationRate: number;
      variance: number;
      variancePercentage: number;
    }>;
    trends: Array<{
      period: string;
      committed: number;
      actual: number;
      utilizationRate: number;
    }>;
    alerts: Array<{
      type: string;
      count: number;
      severity: string;
    }>;
    topVarianceCategories: Array<{
      categoryId: string;
      categoryName: string;
      variance: number;
      variancePercentage: number;
    }>;
  }> {
    const budget = await this.getPurchaseBudget(params.budgetId);
    if (!budget) {
      throw new Error('Budget not found');
    }
    
    // Calculate analytics
    const summary = {
      totalBudgeted: budget.tracking.totalBudgeted,
      totalCommitted: budget.tracking.totalCommitted,
      totalActual: budget.tracking.totalActual,
      totalAvailable: budget.tracking.totalAvailable,
      utilizationRate: budget.tracking.utilizationRate,
      projectedSpend: budget.tracking.projectedSpend,
      projectedVariance: budget.tracking.projectedVariance
    };
    
    // Category breakdown
    const categoryMap = new Map<string, any>();
    for (const allocation of budget.allocations) {
      const existing = categoryMap.get(allocation.categoryId) || {
        categoryId: allocation.categoryId,
        categoryName: allocation.categoryId, // Would get from category lookup
        budgeted: 0,
        committed: 0,
        actual: 0,
        available: 0,
        utilizationRate: 0,
        variance: 0,
        variancePercentage: 0
      };
      
      existing.budgeted += allocation.budgetedAmount;
      existing.committed += allocation.committedAmount;
      existing.actual += allocation.actualAmount;
      existing.available += allocation.availableAmount;
      existing.utilizationRate = ((existing.committed + existing.actual) / existing.budgeted) * 100;
      existing.variance = existing.actual - existing.budgeted;
      existing.variancePercentage = (existing.variance / existing.budgeted) * 100;
      
      categoryMap.set(allocation.categoryId, existing);
    }
    
    const categoryBreakdown = Array.from(categoryMap.values());
    
    // Department breakdown (similar logic)
    const departmentBreakdown: any[] = [];
    
    return {
      summary,
      categoryBreakdown,
      departmentBreakdown,
      trends: [],
      alerts: [],
      topVarianceCategories: categoryBreakdown
        .sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance))
        .slice(0, 5)
    };
  }
  
  // Helper methods
  private async updateBudgetTracking(budget: PurchaseBudget): Promise<void> {
    // Recalculate tracking totals
    budget.tracking.totalCommitted = budget.allocations.reduce((sum, alloc) => sum + alloc.committedAmount, 0);
    budget.tracking.totalActual = budget.allocations.reduce((sum, alloc) => sum + alloc.actualAmount, 0);
    budget.tracking.totalAvailable = budget.allocations.reduce((sum, alloc) => sum + alloc.availableAmount, 0);
    budget.tracking.utilizationRate = ((budget.tracking.totalCommitted + budget.tracking.totalActual) / budget.tracking.totalBudgeted) * 100;
    budget.tracking.remainingBudget = budget.tracking.totalAvailable;
    
    // Calculate projected spend (simplified)
    const daysInPeriod = 365; // Would calculate based on fiscal period
    const daysElapsed = (Date.now() - budget.allocations[0]?.period.startDate.getTime()) / (1000 * 60 * 60 * 24);
    const spendRate = budget.tracking.totalActual / Math.max(daysElapsed, 1);
    budget.tracking.projectedSpend = budget.tracking.totalActual + (spendRate * (daysInPeriod - daysElapsed));
    budget.tracking.projectedVariance = budget.tracking.projectedSpend - budget.tracking.totalBudgeted;
  }
  
  private async checkBudgetAlerts(budget: PurchaseBudget, allocation: any): Promise<void> {
    const utilizationRate = ((allocation.committedAmount + allocation.actualAmount) / allocation.allocatedAmount) * 100;
    
    // Check warning threshold
    if (utilizationRate >= budget.rules.alertThresholds.warning) {
      const existingAlert = budget.alerts.find(a => 
        a.allocationId === allocation.allocationId && 
        a.type === 'warning' && 
        a.status === 'active'
      );
      
      if (!existingAlert) {
        budget.alerts.push({
          alertId: `ALERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          allocationId: allocation.allocationId,
          type: 'warning',
          message: `Budget utilization has reached ${utilizationRate.toFixed(1)}%`,
          threshold: budget.rules.alertThresholds.warning,
          currentValue: utilizationRate,
          severity: utilizationRate >= budget.rules.alertThresholds.critical ? 'high' : 'medium',
          status: 'active',
          createdAt: new Date()
        });
      }
    }
    
    // Check critical threshold
    if (utilizationRate >= budget.rules.alertThresholds.critical) {
      const existingAlert = budget.alerts.find(a => 
        a.allocationId === allocation.allocationId && 
        a.type === 'critical' && 
        a.status === 'active'
      );
      
      if (!existingAlert) {
        budget.alerts.push({
          alertId: `ALERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          allocationId: allocation.allocationId,
          type: 'critical',
          message: `Budget utilization has reached critical level: ${utilizationRate.toFixed(1)}%`,
          threshold: budget.rules.alertThresholds.critical,
          currentValue: utilizationRate,
          severity: 'critical',
          status: 'active',
          createdAt: new Date()
        });
      }
    }
  }
  
  private async setupApprovalWorkflow(budget: PurchaseBudget, allocation: any): Promise<any[]> {
    const approvals = [];
    
    if (budget.rules.approvalRequired) {
      approvals.push({
        approvalId: `APR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        level: 1,
        role: 'Budget Manager',
        userId: allocation.owner.userId,
        name: allocation.owner.name,
        status: 'pending' as const,
        timeoutDate: new Date(Date.now() + 72 * 60 * 60 * 1000) // 72 hours
      });
    }
    
    return approvals;
  }
  
  private async getUserDetails(userId: string): Promise<any> {
    // Get user details (mock implementation)
    return {
      userId,
      name: `User ${userId}`,
      email: `user${userId}@company.com`,
      department: 'Finance'
    };
  }
  
  private async savePurchaseBudget(budget: PurchaseBudget): Promise<void> {
    // Save to database (mock implementation)
    console.log(`Saving purchase budget ${budget.budgetId}`);
  }
  
  private async updatePurchaseBudget(budget: PurchaseBudget): Promise<void> {
    // Update in database (mock implementation)
    console.log(`Updating purchase budget ${budget.budgetId}`);
  }
  
  private async getPurchaseBudget(budgetId: string): Promise<PurchaseBudget | null> {
    // Get from database (mock implementation)
    return null;
  }
  
  private async saveBudgetRequest(request: BudgetRequest): Promise<void> {
    // Save to database (mock implementation)
    console.log(`Saving budget request ${request.requestId}`);
  }
}
