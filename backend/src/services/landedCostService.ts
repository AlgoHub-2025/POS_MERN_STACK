import { PurchaseOrder, IPurchaseOrder } from '../models/Purchase';
import { Product } from '../models/Product';
import { User } from '../models/User';

export interface LandedCostCalculation {
  calculationId: string;
  purchaseOrderId: string;
  purchaseOrderNumber: string;
  calculationDate: Date;
  status: 'draft' | 'calculated' | 'approved' | 'applied' | 'cancelled';
  
  // Base Cost Information
  baseCost: {
    totalPurchaseValue: number;
    currency: string;
    exchangeRate?: number;
    items: Array<{
      itemId: string;
      productId: string;
      productName: string;
      sku: string;
      quantity: number;
      unitCost: number;
      totalCost: number;
      weight?: number; // kg
      volume?: number; // cubic meters
      hsCode?: string;
      countryOfOrigin: string;
    }>;
  };
  
  // Landed Cost Components
  landedCostComponents: {
    freight: {
      amount: number;
      currency: string;
      calculationMethod: 'fixed' | 'per_kg' | 'per_cbm' | 'percentage' | 'actual';
      breakdown: Array<{
        component: string;
        amount: number;
        description: string;
        provider?: string;
        reference?: string;
      }>;
    };
    insurance: {
      amount: number;
      currency: string;
      calculationMethod: 'fixed' | 'percentage' | 'actual';
      coverage: string;
      provider?: string;
      policyNumber?: string;
    };
    duties: {
      amount: number;
      currency: string;
      calculationMethod: 'percentage' | 'fixed' | 'actual';
      breakdown: Array<{
        dutyType: string;
        hsCode: string;
        rate: number;
        amount: number;
        description: string;
      }>;
    };
    taxes: {
      amount: number;
      currency: string;
      calculationMethod: 'percentage' | 'fixed' | 'actual';
      breakdown: Array<{
        taxType: string;
        rate: number;
        amount: number;
        description: string;
      }>;
    };
    handling: {
      amount: number;
      currency: string;
      calculationMethod: 'fixed' | 'per_kg' | 'per_cbm' | 'hourly';
      breakdown: Array<{
        component: string;
        amount: number;
        description: string;
        hours?: number;
        rate?: number;
      }>;
    };
    other: {
      amount: number;
      currency: string;
      breakdown: Array<{
        component: string;
        amount: number;
        description: string;
        category: 'documentation' | 'inspection' | 'certification' | 'storage' | 'other';
      }>;
    };
  };
  
  // Allocation Method
  allocationMethod: {
    type: 'by_value' | 'by_weight' | 'by_volume' | 'by_quantity' | 'custom';
    customAllocation?: Array<{
      itemId: string;
      allocationPercentage: number;
      reason: string;
    }>;
  };
  
  // Calculated Landed Costs
  calculatedCosts: {
    totalLandedCost: number;
    totalLandedCostRate: number; // percentage of base cost
    items: Array<{
      itemId: string;
      productId: string;
      baseCost: number;
      allocatedFreight: number;
      allocatedInsurance: number;
      allocatedDuties: number;
      allocatedTaxes: number;
      allocatedHandling: number;
      allocatedOther: number;
      totalLandedCost: number;
      landedCostPerUnit: number;
      landedCostRate: number; // percentage
    }>;
  };
  
  // Variance Analysis
  varianceAnalysis: {
    estimatedLandedCost: number;
    actualLandedCost: number;
    varianceAmount: number;
    variancePercentage: number;
    varianceBreakdown: {
      freight: number;
      insurance: number;
      duties: number;
      taxes: number;
      handling: number;
      other: number;
    };
    reasons: Array<{
      component: string;
      reason: string;
      impact: number;
    }>;
  };
  
  // Approval Information
  approvals: Array<{
    approvalId: string;
    level: number;
    role: string;
    userId: string;
    name: string;
    status: 'pending' | 'approved' | 'rejected';
    date?: Date;
    comments?: string;
  }>;
  
  // Application Status
  application: {
    appliedToInventory: boolean;
    appliedDate?: Date;
    appliedBy?: string;
    itemsUpdated: number;
    costAdjustments: Array<{
      productId: string;
      oldCost: number;
      newCost: number;
      adjustment: number;
      adjustmentDate: Date;
    }>;
  };
  
  // Supporting Documents
  documents: Array<{
    documentId: string;
    name: string;
    type: 'invoice' | 'bill_of_lading' | 'packing_list' | 'certificate' | 'receipt' | 'other';
    url: string;
    uploadedAt: Date;
    uploadedBy: string;
    description: string;
    reference?: string;
  }>;
  
  // Notes and History
  notes: Array<{
    noteId: string;
    content: string;
    createdBy: string;
    createdAt: Date;
    type: 'internal' | 'external' | 'system';
  }>;
  
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
  approvedAt?: Date;
  approvedBy?: string;
}

export interface LandedCostTemplate {
  templateId: string;
  name: string;
  description: string;
  isActive: boolean;
  
  // Template Conditions
  conditions: {
    supplierIds?: string[];
    categories?: string[];
    countriesOfOrigin?: string[];
    shippingMethods?: string[];
    valueRange?: {
      min?: number;
      max?: number;
    };
  };
  
  // Cost Components Configuration
  costComponents: {
    freight: {
      enabled: boolean;
      calculationMethod: 'fixed' | 'per_kg' | 'per_cbm' | 'percentage' | 'actual';
      defaultRate?: number;
      defaultProvider?: string;
      breakdown: Array<{
        component: string;
        calculationMethod: 'fixed' | 'per_kg' | 'per_cbm' | 'percentage';
        rate?: number;
        description: string;
        provider?: string;
      }>;
    };
    insurance: {
      enabled: boolean;
      calculationMethod: 'fixed' | 'percentage' | 'actual';
      defaultRate?: number;
      defaultProvider?: string;
      coverage: string;
    };
    duties: {
      enabled: boolean;
      calculationMethod: 'percentage' | 'fixed' | 'actual';
      defaultRates: Array<{
        hsCode: string;
        countryOfOrigin: string;
        rate: number;
        description: string;
      }>;
    };
    taxes: {
      enabled: boolean;
      calculationMethod: 'percentage' | 'fixed' | 'actual';
      defaultRates: Array<{
        taxType: string;
        rate: number;
        description: string;
        conditions?: string[];
      }>;
    };
    handling: {
      enabled: boolean;
      calculationMethod: 'fixed' | 'per_kg' | 'per_cbm' | 'hourly';
      defaultRate?: number;
      breakdown: Array<{
        component: string;
        calculationMethod: 'fixed' | 'per_kg' | 'per_cbm' | 'hourly';
        rate?: number;
        description: string;
      }>;
    };
    other: {
      enabled: boolean;
      defaultComponents: Array<{
        component: string;
        amount: number;
        description: string;
        category: 'documentation' | 'inspection' | 'certification' | 'storage' | 'other';
      }>;
    };
  };
  
  // Allocation Method
  defaultAllocationMethod: 'by_value' | 'by_weight' | 'by_volume' | 'by_quantity' | 'custom';
  
  // Approval Rules
  approvalRules: {
    required: boolean;
    approvers: Array<{
      role: string;
      userId?: string;
      department?: string;
    }>;
    autoApprovalLimit?: number; // percentage variance allowed
  };
  
  // Usage Statistics
  usage: {
    totalCalculations: number;
    lastUsed?: Date;
    averageAccuracy: number; // percentage
  };
  
  // Timestamps
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

export class LandedCostService {
  // Calculate landed costs for purchase order
  async calculateLandedCosts(params: {
    purchaseOrderId: string;
    templateId?: string;
    allocationMethod?: 'by_value' | 'by_weight' | 'by_volume' | 'by_quantity' | 'custom';
    customAllocation?: Array<{
      itemId: string;
      allocationPercentage: number;
      reason: string;
    }>;
    costComponents?: {
      freight?: {
        amount: number;
        calculationMethod?: 'fixed' | 'per_kg' | 'per_cbm' | 'percentage' | 'actual';
        breakdown?: Array<{
          component: string;
          amount: number;
          description: string;
          provider?: string;
          reference?: string;
        }>;
      };
      insurance?: {
        amount: number;
        calculationMethod?: 'fixed' | 'percentage' | 'actual';
        coverage?: string;
        provider?: string;
        policyNumber?: string;
      };
      duties?: {
        amount: number;
        calculationMethod?: 'percentage' | 'fixed' | 'actual';
        breakdown?: Array<{
          dutyType: string;
          hsCode: string;
          rate: number;
          amount: number;
          description: string;
        }>;
      };
      taxes?: {
        amount: number;
        calculationMethod?: 'percentage' | 'fixed' | 'actual';
        breakdown?: Array<{
          taxType: string;
          rate: number;
          amount: number;
          description: string;
        }>;
      };
      handling?: {
        amount: number;
        calculationMethod?: 'fixed' | 'per_kg' | 'per_cbm' | 'hourly';
        breakdown?: Array<{
          component: string;
          amount: number;
          description: string;
          hours?: number;
          rate?: number;
        }>;
      };
      other?: {
        amount: number;
        breakdown?: Array<{
          component: string;
          amount: number;
          description: string;
          category: 'documentation' | 'inspection' | 'certification' | 'storage' | 'other';
        }>;
      };
    };
    documents?: Array<{
      name: string;
      type: 'invoice' | 'bill_of_lading' | 'packing_list' | 'certificate' | 'receipt' | 'other';
      url: string;
      description: string;
      reference?: string;
    }>;
    notes?: string;
    calculatedBy: string;
  }): Promise<LandedCostCalculation> {
    const calculationId = `LC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Get purchase order
    const po = await PurchaseOrder.findOne({ purchaseOrderId: params.purchaseOrderId });
    if (!po) {
      throw new Error('Purchase order not found');
    }
    
    // Get template if provided
    let template: LandedCostTemplate | null = null;
    if (params.templateId) {
      template = await this.getLandedCostTemplate(params.templateId);
    }
    
    // Prepare base cost data
    const baseCost = await this.prepareBaseCostData(po);
    
    // Calculate landed cost components
    const landedCostComponents = await this.calculateLandedCostComponents(
      baseCost,
      params.costComponents,
      template
    );
    
    // Determine allocation method
    const allocationMethod = {
      type: params.allocationMethod || template?.defaultAllocationMethod || 'by_value',
      customAllocation: params.customAllocation
    };
    
    // Allocate costs to items
    const calculatedCosts = await this.allocateCostsToItems(
      baseCost,
      landedCostComponents,
      allocationMethod
    );
    
    // Create calculation record
    const calculation: LandedCostCalculation = {
      calculationId,
      purchaseOrderId: po.purchaseOrderId,
      purchaseOrderNumber: po.orderNumber,
      calculationDate: new Date(),
      status: 'calculated',
      
      baseCost,
      landedCostComponents,
      allocationMethod,
      calculatedCosts,
      
      varianceAnalysis: {
        estimatedLandedCost: 0,
        actualLandedCost: calculatedCosts.totalLandedCost,
        varianceAmount: 0,
        variancePercentage: 0,
        varianceBreakdown: {
          freight: 0,
          insurance: 0,
          duties: 0,
          taxes: 0,
          handling: 0,
          other: 0
        },
        reasons: []
      },
      
      approvals: [],
      
      application: {
        appliedToInventory: false,
        itemsUpdated: 0,
        costAdjustments: []
      },
      
      documents: params.documents?.map(doc => ({
        documentId: `DOC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        ...doc,
        uploadedAt: new Date(),
        uploadedBy: params.calculatedBy
      })) || [],
      
      notes: params.notes ? [{
        noteId: `NOTE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        content: params.notes,
        createdBy: params.calculatedBy,
        createdAt: new Date(),
        type: 'internal'
      }] : [],
      
      history: [{
        timestamp: new Date(),
        action: 'Landed Cost Calculated',
        performedBy: params.calculatedBy,
        details: `Landed cost calculated for PO ${po.orderNumber}`,
        systemGenerated: false
      }],
      
      createdAt: new Date(),
      createdBy: params.calculatedBy,
      updatedAt: new Date(),
      updatedBy: params.calculatedBy
    };
    
    // Check if approval is required
    if (template?.approvalRules.required) {
      calculation.status = 'draft';
      calculation.approvals = await this.setupApprovalWorkflow(calculation, template);
    }
    
    // Save calculation
    await this.saveLandedCostCalculation(calculation);
    
    // Update template usage
    if (template) {
      await this.updateTemplateUsage(template.templateId);
    }
    
    return calculation;
  }
  
  // Approve landed cost calculation
  async approveLandedCostCalculation(
    calculationId: string,
    approverId: string,
    comments?: string
  ): Promise<LandedCostCalculation> {
    const calculation = await this.getLandedCostCalculation(calculationId);
    if (!calculation) {
      throw new Error('Landed cost calculation not found');
    }
    
    if (calculation.status !== 'draft') {
      throw new Error('Only draft calculations can be approved');
    }
    
    const approver = await User.findOne({ userId: approverId });
    if (!approver) {
      throw new Error('Approver not found');
    }
    
    // Find pending approval
    const pendingApproval = calculation.approvals.find(
      a => a.userId === approverId && a.status === 'pending'
    );
    
    if (!pendingApproval) {
      throw new Error('No pending approval found for this user');
    }
    
    // Update approval
    pendingApproval.status = 'approved';
    pendingApproval.date = new Date();
    pendingApproval.comments = comments;
    
    // Check if all approvals are complete
    const allApprovalsComplete = calculation.approvals.every(
      a => a.status === 'approved' || a.status === 'skipped'
    );
    
    if (allApprovalsComplete) {
      calculation.status = 'approved';
      calculation.approvedAt = new Date();
      calculation.approvedBy = approverId;
    }
    
    // Add to history
    calculation.history.push({
      timestamp: new Date(),
      action: 'Landed Cost Approved',
      performedBy: approverId,
      details: `Landed cost calculation approved${comments ? ': ' + comments : ''}`,
      previousStatus: 'draft',
      newStatus: calculation.status,
      systemGenerated: false
    });
    
    // Update timestamps
    calculation.updatedAt = new Date();
    calculation.updatedBy = approverId;
    
    // Save changes
    await this.updateLandedCostCalculation(calculation);
    
    return calculation;
  }
  
  // Apply landed costs to inventory
  async applyLandedCostsToInventory(
    calculationId: string,
    appliedBy: string
  ): Promise<LandedCostCalculation> {
    const calculation = await this.getLandedCostCalculation(calculationId);
    if (!calculation) {
      throw new Error('Landed cost calculation not found');
    }
    
    if (calculation.status !== 'approved') {
      throw new Error('Only approved calculations can be applied to inventory');
    }
    
    if (calculation.application.appliedToInventory) {
      throw new Error('Landed costs have already been applied to inventory');
    }
    
    // Apply cost adjustments to inventory
    const costAdjustments = [];
    let itemsUpdated = 0;
    
    for (const itemCost of calculation.calculatedCosts.items) {
      // Update product cost in inventory
      const product = await Product.findOne({ productId: itemCost.productId });
      if (product) {
        const oldCost = product.cost || 0;
        const newCost = itemCost.landedCostPerUnit;
        const adjustment = newCost - oldCost;
        
        if (adjustment !== 0) {
          // Update product cost
          await Product.updateOne(
            { productId: itemCost.productId },
            { 
              cost: newCost,
              updatedAt: new Date(),
              updatedBy: appliedBy
            }
          );
          
          costAdjustments.push({
            productId: itemCost.productId,
            oldCost,
            newCost,
            adjustment,
            adjustmentDate: new Date()
          });
          
          itemsUpdated++;
        }
      }
    }
    
    // Update application status
    calculation.application.appliedToInventory = true;
    calculation.application.appliedDate = new Date();
    calculation.application.appliedBy = appliedBy;
    calculation.application.itemsUpdated = itemsUpdated;
    calculation.application.costAdjustments = costAdjustments;
    
    // Update status
    calculation.status = 'applied';
    
    // Add to history
    calculation.history.push({
      timestamp: new Date(),
      action: 'Applied to Inventory',
      performedBy: appliedBy,
      details: `Landed costs applied to ${itemsUpdated} inventory items`,
      previousStatus: 'approved',
      newStatus: 'applied',
      systemGenerated: false
    });
    
    // Update timestamps
    calculation.updatedAt = new Date();
    calculation.updatedBy = appliedBy;
    
    // Save changes
    await this.updateLandedCostCalculation(calculation);
    
    return calculation;
  }
  
  // Create landed cost template
  async createLandedCostTemplate(params: {
    name: string;
    description: string;
    conditions: {
      supplierIds?: string[];
      categories?: string[];
      countriesOfOrigin?: string[];
      shippingMethods?: string[];
      valueRange?: {
        min?: number;
        max?: number;
      };
    };
    costComponents: {
      freight: {
        enabled: boolean;
        calculationMethod: 'fixed' | 'per_kg' | 'per_cbm' | 'percentage' | 'actual';
        defaultRate?: number;
        defaultProvider?: string;
        breakdown: Array<{
          component: string;
          calculationMethod: 'fixed' | 'per_kg' | 'per_cbm' | 'percentage';
          rate?: number;
          description: string;
          provider?: string;
        }>;
      };
      insurance: {
        enabled: boolean;
        calculationMethod: 'fixed' | 'percentage' | 'actual';
        defaultRate?: number;
        defaultProvider?: string;
        coverage: string;
      };
      duties: {
        enabled: boolean;
        calculationMethod: 'percentage' | 'fixed' | 'actual';
        defaultRates: Array<{
          hsCode: string;
          countryOfOrigin: string;
          rate: number;
          description: string;
        }>;
      };
      taxes: {
        enabled: boolean;
        calculationMethod: 'percentage' | 'fixed' | 'actual';
        defaultRates: Array<{
          taxType: string;
          rate: number;
          description: string;
          conditions?: string[];
        }>;
      };
      handling: {
        enabled: boolean;
        calculationMethod: 'fixed' | 'per_kg' | 'per_cbm' | 'hourly';
        defaultRate?: number;
        breakdown: Array<{
          component: string;
          calculationMethod: 'fixed' | 'per_kg' | 'per_cbm' | 'hourly';
          rate?: number;
          description: string;
        }>;
      };
      other: {
        enabled: boolean;
        defaultComponents: Array<{
          component: string;
          amount: number;
          description: string;
          category: 'documentation' | 'inspection' | 'certification' | 'storage' | 'other';
        }>;
      };
    };
    defaultAllocationMethod: 'by_value' | 'by_weight' | 'by_volume' | 'by_quantity' | 'custom';
    approvalRules?: {
      required: boolean;
      approvers: Array<{
        role: string;
        userId?: string;
        department?: string;
      }>;
      autoApprovalLimit?: number;
    };
    createdBy: string;
  }): Promise<LandedCostTemplate> {
    const templateId = `TPL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const template: LandedCostTemplate = {
      templateId,
      name: params.name,
      description: params.description,
      isActive: true,
      conditions: params.conditions,
      costComponents: params.costComponents,
      defaultAllocationMethod: params.defaultAllocationMethod,
      approvalRules: params.approvalRules || {
        required: false,
        approvers: []
      },
      usage: {
        totalCalculations: 0,
        averageAccuracy: 0
      },
      createdAt: new Date(),
      createdBy: params.createdBy,
      updatedAt: new Date(),
      updatedBy: params.createdBy
    };
    
    // Save template
    await this.saveLandedCostTemplate(template);
    
    return template;
  }
  
  // Get landed cost analytics
  async getLandedCostAnalytics(params: {
    dateFrom: Date;
    dateTo: Date;
    supplierId?: string;
    category?: string;
    templateId?: string;
  }): Promise<{
    summary: {
      totalCalculations: number;
      totalBaseCost: number;
      totalLandedCost: number;
      averageLandedCostRate: number;
      totalVariance: number;
      averageAccuracy: number;
    };
    trends: Array<{
      month: string;
      baseCost: number;
      landedCost: number;
      landedCostRate: number;
      variance: number;
    }>;
    componentAnalysis: Array<{
      component: string;
      totalAmount: number;
      averageRate: number;
      variance: number;
    }>;
    topSuppliers: Array<{
      supplierId: string;
      supplierName: string;
      calculations: number;
      averageLandedCostRate: number;
      totalValue: number;
    }>;
  }> {
    // In a real implementation, query the database
    return {
      summary: {
        totalCalculations: 0,
        totalBaseCost: 0,
        totalLandedCost: 0,
        averageLandedCostRate: 0,
        totalVariance: 0,
        averageAccuracy: 0
      },
      trends: [],
      componentAnalysis: [],
      topSuppliers: []
    };
  }
  
  // Helper methods
  private async prepareBaseCostData(po: IPurchaseOrder): Promise<any> {
    const items = [];
    
    for (const poItem of po.items) {
      const product = await Product.findOne({ productId: poItem.productId });
      if (!product) continue;
      
      items.push({
        itemId: poItem.itemId,
        productId: poItem.productId,
        productName: poItem.productName,
        sku: poItem.sku,
        quantity: poItem.quantity,
        unitCost: poItem.unitPrice,
        totalCost: poItem.totalPrice,
        weight: product.weight || 0,
        volume: product.volume || 0,
        hsCode: product.hsCode || '',
        countryOfOrigin: product.countryOfOrigin || 'Unknown'
      });
    }
    
    const totalPurchaseValue = items.reduce((sum, item) => sum + item.totalCost, 0);
    
    return {
      totalPurchaseValue,
      currency: po.totals.currency,
      items
    };
  }
  
  private async calculateLandedCostComponents(
    baseCost: any,
    costComponents: any,
    template: LandedCostTemplate | null
  ): Promise<any> {
    // Use template defaults if not provided
    const templateComponents = template?.costComponents;
    
    return {
      freight: costComponents?.freight || {
        amount: templateComponents?.freight.enabled ? (templateComponents.freight.defaultRate || 0) : 0,
        currency: baseCost.currency,
        calculationMethod: templateComponents?.freight.calculationMethod || 'fixed',
        breakdown: []
      },
      insurance: costComponents?.insurance || {
        amount: templateComponents?.insurance.enabled ? (templateComponents.insurance.defaultRate || 0) : 0,
        currency: baseCost.currency,
        calculationMethod: templateComponents?.insurance.calculationMethod || 'percentage',
        coverage: templateComponents?.insurance.coverage || 'Standard',
        provider: templateComponents?.insurance.defaultProvider
      },
      duties: costComponents?.duties || {
        amount: templateComponents?.duties.enabled ? (baseCost.totalPurchaseValue * 0.05) : 0, // 5% default
        currency: baseCost.currency,
        calculationMethod: templateComponents?.duties.calculationMethod || 'percentage',
        breakdown: []
      },
      taxes: costComponents?.taxes || {
        amount: templateComponents?.taxes.enabled ? (baseCost.totalPurchaseValue * 0.08) : 0, // 8% default
        currency: baseCost.currency,
        calculationMethod: templateComponents?.taxes.calculationMethod || 'percentage',
        breakdown: []
      },
      handling: costComponents?.handling || {
        amount: templateComponents?.handling.enabled ? (templateComponents.handling.defaultRate || 0) : 0,
        currency: baseCost.currency,
        calculationMethod: templateComponents?.handling.calculationMethod || 'fixed',
        breakdown: []
      },
      other: costComponents?.other || {
        amount: 0,
        currency: baseCost.currency,
        breakdown: []
      }
    };
  }
  
  private async allocateCostsToItems(
    baseCost: any,
    landedCostComponents: any,
    allocationMethod: any
  ): Promise<any> {
    const items = [];
    let totalLandedCost = 0;
    
    // Calculate total landed cost
    const totalFreight = landedCostComponents.freight.amount;
    const totalInsurance = landedCostComponents.insurance.amount;
    const totalDuties = landedCostComponents.duties.amount;
    const totalTaxes = landedCostComponents.taxes.amount;
    const totalHandling = landedCostComponents.handling.amount;
    const totalOther = landedCostComponents.other.amount;
    
    const totalAdditionalCosts = totalFreight + totalInsurance + totalDuties + totalTaxes + totalHandling + totalOther;
    
    // Allocate costs to each item
    for (const item of baseCost.items) {
      let allocatedFreight = 0;
      let allocatedInsurance = 0;
      let allocatedDuties = 0;
      let allocatedTaxes = 0;
      let allocatedHandling = 0;
      let allocatedOther = 0;
      
      switch (allocationMethod.type) {
        case 'by_value':
          const valueRatio = item.totalCost / baseCost.totalPurchaseValue;
          allocatedFreight = totalFreight * valueRatio;
          allocatedInsurance = totalInsurance * valueRatio;
          allocatedDuties = totalDuties * valueRatio;
          allocatedTaxes = totalTaxes * valueRatio;
          allocatedHandling = totalHandling * valueRatio;
          allocatedOther = totalOther * valueRatio;
          break;
          
        case 'by_weight':
          const totalWeight = baseCost.items.reduce((sum: number, i: any) => sum + (i.weight || 0), 0);
          const weightRatio = (item.weight || 0) / totalWeight;
          allocatedFreight = totalFreight * weightRatio;
          allocatedInsurance = totalInsurance * weightRatio;
          allocatedDuties = totalDuties * weightRatio;
          allocatedTaxes = totalTaxes * weightRatio;
          allocatedHandling = totalHandling * weightRatio;
          allocatedOther = totalOther * weightRatio;
          break;
          
        case 'by_volume':
          const totalVolume = baseCost.items.reduce((sum: number, i: any) => sum + (i.volume || 0), 0);
          const volumeRatio = (item.volume || 0) / totalVolume;
          allocatedFreight = totalFreight * volumeRatio;
          allocatedInsurance = totalInsurance * volumeRatio;
          allocatedDuties = totalDuties * volumeRatio;
          allocatedTaxes = totalTaxes * volumeRatio;
          allocatedHandling = totalHandling * volumeRatio;
          allocatedOther = totalOther * volumeRatio;
          break;
          
        case 'by_quantity':
          const totalQuantity = baseCost.items.reduce((sum: number, i: any) => sum + i.quantity, 0);
          const quantityRatio = item.quantity / totalQuantity;
          allocatedFreight = totalFreight * quantityRatio;
          allocatedInsurance = totalInsurance * quantityRatio;
          allocatedDuties = totalDuties * quantityRatio;
          allocatedTaxes = totalTaxes * quantityRatio;
          allocatedHandling = totalHandling * quantityRatio;
          allocatedOther = totalOther * quantityRatio;
          break;
          
        case 'custom':
          const customAllocation = allocationMethod.customAllocation?.find(
            (a: any) => a.itemId === item.itemId
          );
          if (customAllocation) {
            const allocationRatio = customAllocation.allocationPercentage / 100;
            allocatedFreight = totalFreight * allocationRatio;
            allocatedInsurance = totalInsurance * allocationRatio;
            allocatedDuties = totalDuties * allocationRatio;
            allocatedTaxes = totalTaxes * allocationRatio;
            allocatedHandling = totalHandling * allocationRatio;
            allocatedOther = totalOther * allocationRatio;
          }
          break;
      }
      
      const totalItemLandedCost = item.totalCost + allocatedFreight + allocatedInsurance + 
                                allocatedDuties + allocatedTaxes + allocatedHandling + allocatedOther;
      const landedCostPerUnit = totalItemLandedCost / item.quantity;
      const landedCostRate = ((totalItemLandedCost - item.totalCost) / item.totalCost) * 100;
      
      items.push({
        itemId: item.itemId,
        productId: item.productId,
        baseCost: item.totalCost,
        allocatedFreight,
        allocatedInsurance,
        allocatedDuties,
        allocatedTaxes,
        allocatedHandling,
        allocatedOther,
        totalLandedCost: totalItemLandedCost,
        landedCostPerUnit,
        landedCostRate
      });
      
      totalLandedCost += totalItemLandedCost;
    }
    
    return {
      totalLandedCost,
      totalLandedCostRate: (totalLandedCost / baseCost.totalPurchaseValue) * 100,
      items
    };
  }
  
  private async setupApprovalWorkflow(calculation: LandedCostCalculation, template: LandedCostTemplate): Promise<any[]> {
    const approvals = [];
    
    for (const approver of template.approvalRules.approvers) {
      approvals.push({
        approvalId: `APR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        level: approvals.length + 1,
        role: approver.role,
        userId: approver.userId || '',
        name: approver.userId ? `User ${approver.userId}` : approver.role,
        status: 'pending' as const
      });
    }
    
    return approvals;
  }
  
  private async getLandedCostTemplate(templateId: string): Promise<LandedCostTemplate | null> {
    // Get from database (mock implementation)
    return null;
  }
  
  private async saveLandedCostCalculation(calculation: LandedCostCalculation): Promise<void> {
    // Save to database (mock implementation)
    console.log(`Saving landed cost calculation ${calculation.calculationId}`);
  }
  
  private async updateLandedCostCalculation(calculation: LandedCostCalculation): Promise<void> {
    // Update in database (mock implementation)
    console.log(`Updating landed cost calculation ${calculation.calculationId}`);
  }
  
  private async getLandedCostCalculation(calculationId: string): Promise<LandedCostCalculation | null> {
    // Get from database (mock implementation)
    return null;
  }
  
  private async saveLandedCostTemplate(template: LandedCostTemplate): Promise<void> {
    // Save to database (mock implementation)
    console.log(`Saving landed cost template ${template.templateId}`);
  }
  
  private async updateTemplateUsage(templateId: string): Promise<void> {
    // Update template usage statistics (mock implementation)
    console.log(`Updating template usage for ${templateId}`);
  }
}
