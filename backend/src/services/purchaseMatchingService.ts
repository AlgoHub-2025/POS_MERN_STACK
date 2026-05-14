import { PurchaseOrder, IPurchaseOrder } from '../models/Purchase';
import { Product } from '../models/Product';
import { User } from '../models/User';

export interface ReceiptMatching {
  matchingId: string;
  purchaseOrderId: string;
  purchaseOrderNumber: string;
  receiptId: string;
  receiptNumber: string;
  receiptDate: Date;
  
  // Matching Results
  matchingStatus: 'pending' | 'in_progress' | 'matched' | 'partial_match' | 'mismatch' | 'exception' | 'resolved';
  matchingType: 'two_way' | 'three_way' | 'four_way';
  overallMatchPercentage: number;
  
  // Item Matching Results
  itemMatches: Array<{
    poItemId: string;
    receiptItemId: string;
    productId: string;
    productName: string;
    sku: string;
    
    // Quantities
    orderedQuantity: number;
    receivedQuantity: number;
    invoicedQuantity?: number;
    acceptedQuantity: number;
    varianceQuantity: number;
    variancePercentage: number;
    
    // Values
    unitPrice: number;
    totalValue: number;
    varianceValue: number;
    
    // Matching Status
    matchStatus: 'exact' | 'variance' | 'shortage' | 'overage' | 'price_mismatch' | 'quality_issue';
    toleranceExceeded: boolean;
    autoApproved: boolean;
    requiresAction: boolean;
    
    // Quality and Inspection
    inspected: boolean;
    inspectionResult?: 'passed' | 'failed' | 'conditional';
    qualityIssues: Array<{
      type: string;
      severity: 'minor' | 'major' | 'critical';
      quantity: number;
      description: string;
    }>;
    
    // Resolution
    resolution?: {
      action: 'accept' | 'reject' | 'return' | 'credit' | 'debit_note';
      quantity: number;
      value: number;
      reason: string;
      approvedBy?: string;
      approvedAt?: Date;
    };
    
    // Notes and Attachments
    notes?: string;
    attachments?: Array<{
      attachmentId: string;
      name: string;
      type: string;
      url: string;
    }>;
  }>;
  
  // Summary Totals
  summary: {
    totalItems: number;
    matchedItems: number;
    exactMatches: number;
    varianceMatches: number;
    mismatches: number;
    totalVariance: number;
    totalVarianceValue: number;
    acceptanceRate: number;
  };
  
  // Tolerance Settings
  toleranceSettings: {
    quantityTolerance: number; // percentage
    priceTolerance: number; // percentage
    valueTolerance: number; // percentage
    autoApprovalLimit: number; // percentage
  };
  
  // Discrepancies
  discrepancies: Array<{
    discrepancyId: string;
    itemId: string;
    type: 'quantity' | 'price' | 'quality' | 'delivery' | 'documentation';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    impact: string;
    resolution: string;
    status: 'open' | 'investigating' | 'resolved' | 'escalated';
    assignedTo?: string;
    dueDate?: Date;
    resolvedAt?: Date;
    resolvedBy?: string;
  }>;
  
  // Workflow
  workflow: {
    currentStep: string;
    steps: Array<{
      stepId: string;
      name: string;
      status: 'pending' | 'in_progress' | 'completed' | 'skipped';
      assignedTo?: string;
      completedAt?: Date;
      notes?: string;
    }>;
    approvals: Array<{
      approvalId: string;
      step: string;
      approver: string;
      status: 'pending' | 'approved' | 'rejected';
      date?: Date;
      comments?: string;
    }>;
  };
  
  // Audit Trail
  auditTrail: Array<{
    timestamp: Date;
    action: string;
    performedBy: string;
    details: string;
    previousStatus?: string;
    newStatus?: string;
    systemGenerated: boolean;
  }>;
  
  // Timestamps
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  matchedAt?: Date;
  resolvedAt?: Date;
}

export interface MatchingRule {
  ruleId: string;
  name: string;
  description: string;
  isActive: boolean;
  priority: number;
  
  // Rule Conditions
  conditions: {
    supplierIds?: string[];
    categories?: string[];
    itemTypes?: string[];
    valueRange?: {
      min?: number;
      max?: number;
    };
    departments?: string[];
  };
  
  // Matching Configuration
  matchingConfig: {
    matchingType: 'two_way' | 'three_way' | 'four_way';
    autoMatch: boolean;
    requireInvoice: boolean;
    requireInspection: boolean;
    
    // Tolerances
    quantityTolerance: number;
    priceTolerance: number;
    valueTolerance: number;
    dateTolerance: number; // days
    
    // Auto-approval rules
    autoApprovalRules: Array<{
      condition: string;
      tolerance: number;
      action: 'auto_approve' | 'flag_for_review' | 'require_manual_approval';
    }>;
    
    // Exception handling
    exceptionRules: Array<{
      condition: string;
      action: 'create_discrepancy' | 'escalate' | 'notify' | 'block_payment';
      severity: 'low' | 'medium' | 'high' | 'critical';
    }>;
  };
  
  // Workflow Configuration
  workflowConfig: {
    steps: Array<{
      stepId: string;
      name: string;
      type: 'validation' | 'inspection' | 'approval' | 'resolution';
      required: boolean;
      assignedTo?: string;
      role?: string;
      timeoutHours?: number;
      autoSkip?: boolean;
    }>;
    notifications: {
      onMatch: boolean;
      onMismatch: boolean;
      onException: boolean;
      onEscalation: boolean;
      recipients?: string[];
    };
  };
  
  // Performance Metrics
  performance: {
    totalProcessed: number;
    autoMatched: number;
    manualReviewRequired: number;
    exceptionsRaised: number;
    averageProcessingTime: number; // minutes
    accuracyRate: number; // percentage
  };
  
  // Timestamps
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

export class PurchaseMatchingService {
  // Perform three-way matching (PO vs Receipt vs Invoice)
  async performThreeWayMatching(params: {
    purchaseOrderId: string;
    receiptId: string;
    invoiceId?: string;
    toleranceSettings?: {
      quantityTolerance?: number;
      priceTolerance?: number;
      valueTolerance?: number;
      autoApprovalLimit?: number;
    };
    forceMatching?: boolean;
    matchedBy: string;
  }): Promise<ReceiptMatching> {
    const matchingId = `MATCH-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Get purchase order
    const po = await PurchaseOrder.findOne({ purchaseOrderId: params.purchaseOrderId });
    if (!po) {
      throw new Error('Purchase order not found');
    }
    
    // Get receipt data (mock implementation)
    const receiptData = await this.getReceiptData(params.receiptId);
    
    // Get invoice data if provided
    let invoiceData = null;
    if (params.invoiceId) {
      invoiceData = await this.getInvoiceData(params.invoiceId);
    }
    
    // Get applicable matching rule
    const rule = await this.getMatchingRule(po, receiptData);
    
    // Set tolerance settings
    const toleranceSettings = {
      quantityTolerance: params.toleranceSettings?.quantityTolerance || rule.matchingConfig.quantityTolerance,
      priceTolerance: params.toleranceSettings?.priceTolerance || rule.matchingConfig.priceTolerance,
      valueTolerance: params.toleranceSettings?.valueTolerance || rule.matchingConfig.valueTolerance,
      autoApprovalLimit: params.toleranceSettings?.autoApprovalLimit || 95
    };
    
    // Perform item-level matching
    const itemMatches = await this.matchItems(po.items, receiptData.items, invoiceData?.items, toleranceSettings);
    
    // Calculate summary
    const summary = this.calculateMatchingSummary(itemMatches);
    
    // Determine overall matching status
    const matchingStatus = this.determineMatchingStatus(summary, itemMatches);
    const overallMatchPercentage = summary.acceptanceRate;
    
    // Identify discrepancies
    const discrepancies = this.identifyDiscrepancies(itemMatches, toleranceSettings);
    
    // Create matching result
    const matchingResult: ReceiptMatching = {
      matchingId,
      purchaseOrderId: po.purchaseOrderId,
      purchaseOrderNumber: po.orderNumber,
      receiptId: params.receiptId,
      receiptNumber: receiptData.receiptNumber,
      receiptDate: receiptData.receiptDate,
      
      matchingStatus,
      matchingType: invoiceData ? 'three_way' : 'two_way',
      overallMatchPercentage,
      
      itemMatches,
      summary,
      toleranceSettings,
      discrepancies,
      
      workflow: {
        currentStep: 'validation',
        steps: this.initializeWorkflow(rule.workflowConfig.steps),
        approvals: []
      },
      
      auditTrail: [{
        timestamp: new Date(),
        action: 'Matching Started',
        performedBy: params.matchedBy,
        details: `${invoiceData ? 'Three-way' : 'Two-way'} matching initiated`,
        systemGenerated: false
      }],
      
      createdAt: new Date(),
      createdBy: params.matchedBy,
      updatedAt: new Date(),
      updatedBy: params.matchedBy
    };
    
    // Auto-approve if within tolerance
    if (overallMatchPercentage >= toleranceSettings.autoApprovalLimit && discrepancies.length === 0) {
      matchingResult.matchingStatus = 'matched';
      matchingResult.matchedAt = new Date();
      
      // Auto-approve item matches
      itemMatches.forEach(item => {
        if (item.matchStatus === 'exact' || item.matchStatus === 'variance') {
          item.autoApproved = true;
          item.requiresAction = false;
        }
      });
    }
    
    // Save matching result
    await this.saveMatchingResult(matchingResult);
    
    // Send notifications if needed
    if (rule.workflowConfig.notifications.onMismatch && matchingStatus !== 'matched') {
      await this.sendMismatchNotifications(matchingResult);
    }
    
    return matchingResult;
  }
  
  // Resolve matching discrepancy
  async resolveDiscrepancy(params: {
    matchingId: string;
    discrepancyId: string;
    resolution: {
      action: 'accept' | 'reject' | 'return' | 'credit' | 'debit_note';
      quantity?: number;
      value?: number;
      reason: string;
      notes?: string;
    };
    resolvedBy: string;
  }): Promise<ReceiptMatching> {
    const matching = await this.getMatchingResult(params.matchingId);
    if (!matching) {
      throw new Error('Matching result not found');
    }
    
    const discrepancy = matching.discrepancies.find(d => d.discrepancyId === params.discrepancyId);
    if (!discrepancy) {
      throw new Error('Discrepancy not found');
    }
    
    // Update discrepancy
    discrepancy.resolution = params.resolution.reason;
    discrepancy.status = 'resolved';
    discrepancy.resolvedAt = new Date();
    discrepancy.resolvedBy = params.resolvedBy;
    
    // Find and update the related item match
    const itemMatch = matching.itemMatches.find(item => item.itemId === discrepancy.itemId);
    if (itemMatch) {
      itemMatch.resolution = {
        action: params.resolution.action,
        quantity: params.resolution.quantity || itemMatch.varianceQuantity,
        value: params.resolution.value || itemMatch.varianceValue,
        reason: params.resolution.reason,
        approvedBy: params.resolvedBy,
        approvedAt: new Date()
      };
      itemMatch.requiresAction = false;
    }
    
    // Recalculate summary
    matching.summary = this.calculateMatchingSummary(matching.itemMatches);
    
    // Update matching status if all discrepancies resolved
    const openDiscrepancies = matching.discrepancies.filter(d => d.status === 'open');
    if (openDiscrepancies.length === 0) {
      matching.matchingStatus = 'matched';
      matching.matchedAt = new Date();
      matching.resolvedAt = new Date();
    }
    
    // Add to audit trail
    matching.auditTrail.push({
      timestamp: new Date(),
      action: 'Discrepancy Resolved',
      performedBy: params.resolvedBy,
      details: `Discrepancy ${params.discrepancyId} resolved: ${params.resolution.reason}`,
      systemGenerated: false
    });
    
    // Update timestamps
    matching.updatedAt = new Date();
    matching.updatedBy = params.resolvedBy;
    
    // Save changes
    await this.updateMatchingResult(matching);
    
    // Send notifications
    await this.sendResolutionNotifications(matching, discrepancy);
    
    return matching;
  }
  
  // Create matching rule
  async createMatchingRule(params: {
    name: string;
    description: string;
    conditions: {
      supplierIds?: string[];
      categories?: string[];
      itemTypes?: string[];
      valueRange?: {
        min?: number;
        max?: number;
      };
      departments?: string[];
    };
    matchingConfig: {
      matchingType: 'two_way' | 'three_way' | 'four_way';
      autoMatch?: boolean;
      requireInvoice?: boolean;
      requireInspection?: boolean;
      quantityTolerance: number;
      priceTolerance: number;
      valueTolerance: number;
      dateTolerance?: number;
      autoApprovalRules?: Array<{
        condition: string;
        tolerance: number;
        action: 'auto_approve' | 'flag_for_review' | 'require_manual_approval';
      }>;
      exceptionRules?: Array<{
        condition: string;
        action: 'create_discrepancy' | 'escalate' | 'notify' | 'block_payment';
        severity: 'low' | 'medium' | 'high' | 'critical';
      }>;
    };
    workflowConfig?: {
      steps?: Array<{
        stepId: string;
        name: string;
        type: 'validation' | 'inspection' | 'approval' | 'resolution';
        required: boolean;
        assignedTo?: string;
        role?: string;
        timeoutHours?: number;
        autoSkip?: boolean;
      }>;
      notifications?: {
        onMatch?: boolean;
        onMismatch?: boolean;
        onException?: boolean;
        onEscalation?: boolean;
        recipients?: string[];
      };
    };
    createdBy: string;
  }): Promise<MatchingRule> {
    const ruleId = `RULE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const rule: MatchingRule = {
      ruleId,
      name: params.name,
      description: params.description,
      isActive: true,
      priority: 1,
      conditions: params.conditions,
      matchingConfig: {
        matchingType: params.matchingConfig.matchingType,
        autoMatch: params.matchingConfig.autoMatch ?? true,
        requireInvoice: params.matchingConfig.requireInvoice ?? false,
        requireInspection: params.matchingConfig.requireInspection ?? false,
        quantityTolerance: params.matchingConfig.quantityTolerance,
        priceTolerance: params.matchingConfig.priceTolerance,
        valueTolerance: params.matchingConfig.valueTolerance,
        dateTolerance: params.matchingConfig.dateTolerance ?? 3,
        autoApprovalRules: params.matchingConfig.autoApprovalRules || [],
        exceptionRules: params.matchingConfig.exceptionRules || []
      },
      workflowConfig: {
        steps: params.workflowConfig?.steps || [],
        notifications: {
          onMatch: params.workflowConfig?.notifications?.onMatch ?? true,
          onMismatch: params.workflowConfig?.notifications?.onMismatch ?? true,
          onException: params.workflowConfig?.notifications?.onException ?? true,
          onEscalation: params.workflowConfig?.notifications?.onEscalation ?? true,
          recipients: params.workflowConfig?.notifications?.recipients || []
        }
      },
      performance: {
        totalProcessed: 0,
        autoMatched: 0,
        manualReviewRequired: 0,
        exceptionsRaised: 0,
        averageProcessingTime: 0,
        accuracyRate: 0
      },
      createdAt: new Date(),
      createdBy: params.createdBy,
      updatedAt: new Date(),
      updatedBy: params.createdBy
    };
    
    // Save rule
    await this.saveMatchingRule(rule);
    
    return rule;
  }
  
  // Get matching analytics
  async getMatchingAnalytics(params: {
    dateFrom: Date;
    dateTo: Date;
    supplierId?: string;
    status?: string;
    matchingType?: string;
  }): Promise<{
    summary: {
      totalMatchings: number;
      matchedPercentage: number;
      averageMatchPercentage: number;
      averageProcessingTime: number;
      totalDiscrepancies: number;
      resolvedDiscrepancies: number;
    };
    trends: Array<{
      date: string;
      totalMatchings: number;
      matchedCount: number;
      averageMatchPercentage: number;
      discrepancyCount: number;
    }>;
    topDiscrepancies: Array<{
      type: string;
      count: number;
      totalValue: number;
      averageResolutionTime: number;
    }>;
    supplierPerformance: Array<{
      supplierId: string;
      supplierName: string;
      totalMatchings: number;
      averageMatchPercentage: number;
      discrepancyRate: number;
    }>;
  }> {
    // In a real implementation, query the database
    return {
      summary: {
        totalMatchings: 0,
        matchedPercentage: 0,
        averageMatchPercentage: 0,
        averageProcessingTime: 0,
        totalDiscrepancies: 0,
        resolvedDiscrepancies: 0
      },
      trends: [],
      topDiscrepancies: [],
      supplierPerformance: []
    };
  }
  
  // Helper methods
  private async matchItems(
    poItems: any[],
    receiptItems: any[],
    invoiceItems: any[] | undefined,
    tolerances: any
  ): Promise<any[]> {
    const matches = [];
    
    for (const poItem of poItems) {
      // Find corresponding receipt item
      const receiptItem = receiptItems.find(ri => ri.productId === poItem.productId);
      if (!receiptItem) {
        // Item not received
        matches.push({
          poItemId: poItem.itemId,
          receiptItemId: '',
          productId: poItem.productId,
          productName: poItem.productName,
          sku: poItem.sku,
          orderedQuantity: poItem.quantity,
          receivedQuantity: 0,
          acceptedQuantity: 0,
          varianceQuantity: -poItem.quantity,
          variancePercentage: -100,
          unitPrice: poItem.unitPrice,
          totalValue: 0,
          varianceValue: -poItem.totalPrice,
          matchStatus: 'shortage',
          toleranceExceeded: true,
          autoApproved: false,
          requiresAction: true,
          inspected: false,
          qualityIssues: []
        });
        continue;
      }
      
      // Calculate variance
      const varianceQuantity = receiptItem.quantity - poItem.quantity;
      const variancePercentage = (varianceQuantity / poItem.quantity) * 100;
      const varianceValue = varianceQuantity * poItem.unitPrice;
      
      // Determine match status
      let matchStatus: string = 'exact';
      let toleranceExceeded = false;
      
      if (Math.abs(variancePercentage) > tolerances.quantityTolerance) {
        matchStatus = varianceQuantity < 0 ? 'shortage' : 'overage';
        toleranceExceeded = true;
      } else if (varianceQuantity !== 0) {
        matchStatus = 'variance';
      }
      
      // Check for quality issues
      const qualityIssues = receiptItem.qualityIssues || [];
      const hasQualityIssues = qualityIssues.length > 0;
      
      if (hasQualityIssues) {
        matchStatus = 'quality_issue';
        toleranceExceeded = true;
      }
      
      matches.push({
        poItemId: poItem.itemId,
        receiptItemId: receiptItem.itemId,
        productId: poItem.productId,
        productName: poItem.productName,
        sku: poItem.sku,
        orderedQuantity: poItem.quantity,
        receivedQuantity: receiptItem.quantity,
        invoicedQuantity: invoiceItems?.find(ii => ii.productId === poItem.productId)?.quantity,
        acceptedQuantity: Math.min(poItem.quantity, receiptItem.quantity),
        varianceQuantity,
        variancePercentage,
        unitPrice: poItem.unitPrice,
        totalValue: receiptItem.quantity * poItem.unitPrice,
        varianceValue,
        matchStatus,
        toleranceExceeded,
        autoApproved: !toleranceExceeded && !hasQualityIssues,
        requiresAction: toleranceExceeded || hasQualityIssues,
        inspected: receiptItem.inspected || false,
        inspectionResult: receiptItem.inspectionResult,
        qualityIssues
      });
    }
    
    return matches;
  }
  
  private calculateMatchingSummary(itemMatches: any[]): any {
    const totalItems = itemMatches.length;
    const matchedItems = itemMatches.filter(item => item.matchStatus !== 'shortage').length;
    const exactMatches = itemMatches.filter(item => item.matchStatus === 'exact').length;
    const varianceMatches = itemMatches.filter(item => item.matchStatus === 'variance').length;
    const mismatches = itemMatches.filter(item => 
      ['shortage', 'overage', 'price_mismatch', 'quality_issue'].includes(item.matchStatus)
    ).length;
    
    const totalVariance = itemMatches.reduce((sum, item) => sum + Math.abs(item.varianceQuantity), 0);
    const totalVarianceValue = itemMatches.reduce((sum, item) => sum + Math.abs(item.varianceValue), 0);
    const acceptanceRate = totalItems > 0 ? (exactMatches / totalItems) * 100 : 0;
    
    return {
      totalItems,
      matchedItems,
      exactMatches,
      varianceMatches,
      mismatches,
      totalVariance,
      totalVarianceValue,
      acceptanceRate
    };
  }
  
  private determineMatchingStatus(summary: any, itemMatches: any[]): string {
    if (summary.mismatches === 0) {
      return 'matched';
    } else if (summary.mismatches < summary.totalItems) {
      return 'partial_match';
    } else {
      return 'mismatch';
    }
  }
  
  private identifyDiscrepancies(itemMatches: any[], tolerances: any): any[] {
    const discrepancies = [];
    
    itemMatches.forEach(item => {
      if (item.requiresAction) {
        let discrepancyType: string;
        let severity: string;
        
        if (item.matchStatus === 'shortage' || item.matchStatus === 'overage') {
          discrepancyType = 'quantity';
          severity = Math.abs(item.variancePercentage) > 20 ? 'high' : 'medium';
        } else if (item.matchStatus === 'quality_issue') {
          discrepancyType = 'quality';
          severity = item.qualityIssues.some(qi => qi.severity === 'critical') ? 'critical' : 'high';
        } else {
          discrepancyType = 'price';
          severity = 'medium';
        }
        
        discrepancies.push({
          discrepancyId: `DISC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          itemId: item.poItemId,
          type: discrepancyType,
          severity,
          description: `${item.matchStatus}: ${item.varianceQuantity > 0 ? '+' : ''}${item.varianceQuantity} units`,
          impact: `Value impact: $${Math.abs(item.varianceValue).toFixed(2)}`,
          resolution: '',
          status: 'open'
        });
      }
    });
    
    return discrepancies;
  }
  
  private initializeWorkflow(steps: any[]): any[] {
    return steps.map(step => ({
      stepId: step.stepId,
      name: step.name,
      status: step.stepId === 'validation' ? 'in_progress' : 'pending',
      assignedTo: step.assignedTo,
      role: step.role
    }));
  }
  
  private async getReceiptData(receiptId: string): Promise<any> {
    // Mock implementation - in reality, query receipt collection
    return {
      receiptId,
      receiptNumber: `R-${Date.now()}`,
      receiptDate: new Date(),
      items: []
    };
  }
  
  private async getInvoiceData(invoiceId: string): Promise<any> {
    // Mock implementation - in reality, query invoice collection
    return {
      invoiceId,
      invoiceNumber: `INV-${Date.now()}`,
      items: []
    };
  }
  
  private async getMatchingRule(po: IPurchaseOrder, receiptData: any): Promise<MatchingRule> {
    // Mock implementation - in reality, query matching rules
    return {
      ruleId: 'RULE-DEFAULT',
      name: 'Default Matching Rule',
      description: 'Default three-way matching rule',
      isActive: true,
      priority: 1,
      conditions: {},
      matchingConfig: {
        matchingType: 'three_way',
        autoMatch: true,
        requireInvoice: false,
        requireInspection: false,
        quantityTolerance: 5,
        priceTolerance: 2,
        valueTolerance: 5,
        dateTolerance: 3,
        autoApprovalRules: [],
        exceptionRules: []
      },
      workflowConfig: {
        steps: [],
        notifications: {
          onMatch: true,
          onMismatch: true,
          onException: true,
          onEscalation: true,
          recipients: []
        }
      },
      performance: {
        totalProcessed: 0,
        autoMatched: 0,
        manualReviewRequired: 0,
        exceptionsRaised: 0,
        averageProcessingTime: 0,
        accuracyRate: 0
      },
      createdAt: new Date(),
      createdBy: 'system',
      updatedAt: new Date(),
      updatedBy: 'system'
    };
  }
  
  private async saveMatchingResult(matching: ReceiptMatching): Promise<void> {
    // Save to database (mock implementation)
    console.log(`Saving matching result ${matching.matchingId}`);
  }
  
  private async updateMatchingResult(matching: ReceiptMatching): Promise<void> {
    // Update in database (mock implementation)
    console.log(`Updating matching result ${matching.matchingId}`);
  }
  
  private async getMatchingResult(matchingId: string): Promise<ReceiptMatching | null> {
    // Get from database (mock implementation)
    return null;
  }
  
  private async saveMatchingRule(rule: MatchingRule): Promise<void> {
    // Save to database (mock implementation)
    console.log(`Saving matching rule ${rule.ruleId}`);
  }
  
  private async sendMismatchNotifications(matching: ReceiptMatching): Promise<void> {
    // Send notifications (mock implementation)
    console.log(`Sending mismatch notifications for ${matching.matchingId}`);
  }
  
  private async sendResolutionNotifications(matching: ReceiptMatching, discrepancy: any): Promise<void> {
    // Send notifications (mock implementation)
    console.log(`Sending resolution notifications for ${matching.matchingId}`);
  }
}
