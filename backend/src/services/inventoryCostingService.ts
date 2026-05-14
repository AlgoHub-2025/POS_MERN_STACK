import { InventoryItem, IInventoryItem } from '../models/Inventory';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { PurchaseOrder } from '../models/PurchaseOrder';

export interface CostingMethod {
  method: 'fifo' | 'lifo' | 'weighted_average' | 'standard_cost' | 'specific_identification';
  description: string;
  applicableFor: string[];
  advantages: string[];
  disadvantages: string[];
}

export interface InventoryValuation {
  productId: string;
  sku: string;
  productName: string;
  warehouseId: string;
  quantity: number;
  unitCost: number;
  totalValue: number;
  costingMethod: string;
  layers: Array<{
    quantity: number;
    unitCost: number;
    totalValue: number;
    acquisitionDate: Date;
    source: string; // PO number, transfer ID, etc.
    batchNumber?: string;
    serialNumber?: string;
  }>;
  marketValue: number;
  replacementCost: number;
  netRealizableValue: number;
  lowerOfCostOrMarket: number;
  lastUpdated: Date;
}

export interface CostingAdjustment {
  adjustmentId: string;
  type: 'purchase_price_change' | 'currency_fluctuation' | 'freight_cost' | 'handling_cost' | 'storage_cost' | 'obsolescence' | 'damage' | 'theft';
  productId: string;
  warehouseId?: string;
  batchNumber?: string;
  serialNumber?: string;
  oldUnitCost: number;
  newUnitCost: number;
  quantity: number;
  totalAdjustment: number;
  reason: string;
  approvedBy: string;
  approvedAt: Date;
  effectiveDate: Date;
  journalEntryId?: string;
  glAccount?: string;
  supportingDocuments: string[];
  createdAt: Date;
}

export interface CostAnalysis {
  period: string;
  startDate: Date;
  endDate: Date;
  summary: {
    totalInventoryValue: number;
    totalCostOfGoodsSold: number;
    grossMargin: number;
    grossMarginPercentage: number;
    inventoryTurnover: number;
    daysInventoryOutstanding: number;
    carryingCost: number;
    stockoutCost: number;
    totalCost: number;
  };
  byProduct: Array<{
    productId: string;
    productName: string;
    sku: string;
    beginningInventory: number;
    purchases: number;
    endingInventory: number;
    costOfGoodsSold: number;
    grossMargin: number;
    turnoverRate: number;
    daysOfSupply: number;
  }>;
  byWarehouse: Array<{
    warehouseId: string;
    warehouseName: string;
    totalValue: number;
    turnoverRate: number;
    carryingCostRate: number;
    accuracyRate: number;
    obsoleteInventory: number;
  }>;
  byCostingMethod: Array<{
    method: string;
    totalValue: number;
    cogs: number;
    grossMargin: number;
    itemCount: number;
  }>;
  trends: {
    inventoryValue: Array<{
      date: Date;
      value: number;
      change: number;
      changePercent: number;
    }>;
    costOfGoodsSold: Array<{
      date: Date;
      value: number;
      change: number;
      changePercent: number;
    }>;
    margins: Array<{
      date: Date;
      grossMargin: number;
      grossMarginPercent: number;
    }>;
  };
  recommendations: Array<{
    category: 'costing_method' | 'inventory_reduction' | 'supplier_negotiation' | 'process_improvement';
    priority: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    potentialSavings: number;
    implementationCost: number;
    roi: number;
    timeframe: string;
  }>;
}

export interface LandedCostCalculation {
  productId: string;
  purchaseOrderId: string;
  baseCost: number;
  additionalCosts: {
    freight: number;
    insurance: number;
    customs: number;
    duties: number;
    taxes: number;
    handling: number;
    storage: number;
    other: number;
  };
  totalLandedCost: number;
  unitLandedCost: number;
  quantity: number;
  allocationMethod: 'by_value' | 'by_weight' | 'by_volume' | 'by_quantity' | 'custom';
  allocationDetails: Array<{
    costType: string;
      amount: number;
      allocationBase: string;
      allocatedAmount: number;
      percentage: number;
    }>;
  effectiveDate: Date;
  calculatedBy: string;
}

export interface ObsolescenceAnalysis {
  analysisDate: Date;
  criteria: {
    noMovementDays: number;
    lowTurnoverThreshold: number;
    expiryThreshold: number;
    damageThreshold: number;
  };
  summary: {
    totalItems: number;
    obsoleteItems: number;
    obsoleteValue: number;
    slowMovingItems: number;
    slowMovingValue: number;
    potentialWriteOff: number;
    reserveRequired: number;
  };
  details: Array<{
    productId: string;
    sku: string;
    warehouseId: string;
    quantity: number;
    unitCost: number;
    totalValue: number;
    daysSinceLastMovement: number;
    turnoverRate: number;
    status: 'active' | 'slow_moving' | 'obsolete' | 'expired' | 'damaged';
    recommendedAction: 'keep' | 'discount' | 'return' | 'write_off' | 'liquidate';
    recommendedQuantity: number;
    potentialLoss: number;
    reason: string;
  }>;
  recommendations: Array<{
    action: string;
    description: string;
    items: string[];
    potentialRecovery: number;
    timeframe: string;
  }>;
}

export class InventoryCostingService {
  // Costing Methods Management
  async getCostingMethods(): Promise<CostingMethod[]> {
    return [
      {
        method: 'fifo',
        description: 'First-In, First-Out - Assumes oldest inventory is sold first',
        applicableFor: ['Perishable goods', 'Items with expiry dates', 'Fashion items'],
        advantages: [
          'Matches physical flow of goods',
          'Prevents obsolescence',
          'Generally accepted accounting principle',
          'Easy to understand and implement'
        ],
        disadvantages: [
          'May not match actual physical flow',
          'Can result in higher taxable income during inflation',
          'Requires detailed tracking of inventory layers'
        ]
      },
      {
        method: 'lifo',
        description: 'Last-In, First-Out - Assumes newest inventory is sold first',
        applicableFor: ['Non-perishable goods', 'Commodities', 'Bulk materials'],
        advantages: [
          'Matches current costs with current revenues',
          'Tax advantages during inflation',
          'Better matching of costs to revenues'
        ],
        disadvantages: [
          'Not allowed under IFRS',
          'May result in outdated inventory values',
          'Can distort balance sheet'
        ]
      },
      {
        method: 'weighted_average',
        description: 'Average cost of all inventory items is calculated and used',
        applicableFor: ['Homogeneous goods', 'Bulk commodities', 'Liquid products'],
        advantages: [
          'Smooths out price fluctuations',
          'Simple to calculate',
          'No need to track individual layers'
        ],
        disadvantages: [
          'May not reflect actual costs',
          'Can delay recognition of price changes',
          'Less precise than other methods'
        ]
      },
      {
        method: 'standard_cost',
        description: 'Predetermined costs are used for valuation',
        applicableFor: ['Manufacturing', 'Standardized products', 'Cost control focus'],
        advantages: [
          'Simplifies record keeping',
          'Enables better cost control',
          'Useful for budgeting and planning'
        ],
        disadvantages: [
          'Requires frequent updates',
          'May not reflect actual costs',
          'Variance analysis required'
        ]
      },
      {
        method: 'specific_identification',
        description: 'Actual cost of each specific item is tracked',
        applicableFor: ['High-value items', 'Unique products', 'Serial-tracked goods'],
        advantages: [
          'Most accurate method',
          'Matches actual costs exactly',
          'Required for high-value items'
        ],
        disadvantages: [
          'Complex to implement',
          'High administrative cost',
          'Not practical for large inventories'
        ]
      }
    ];
  }

  // Inventory Valuation
  async calculateInventoryValuation(params: {
    warehouseId?: string;
    productId?: string;
    costingMethod: 'fifo' | 'lifo' | 'weighted_average' | 'standard_cost' | 'specific_identification';
    asOfDate?: Date;
  }): Promise<InventoryValuation[]> {
    const matchQuery: any = { status: 'active' };
    
    if (params.warehouseId) {
      matchQuery.warehouseId = params.warehouseId;
    }
    
    if (params.productId) {
      matchQuery.productId = params.productId;
    }

    const inventoryItems = await InventoryItem.find(matchQuery);
    const valuations: InventoryValuation[] = [];

    for (const item of inventoryItems) {
      const product = await Product.findOne({ productId: item.productId });
      if (!product) continue;

      const valuation = await this.calculateItemValuation(item, params.costingMethod, params.asOfDate || new Date());
      valuations.push(valuation);
    }

    return valuations;
  }

  private async calculateItemValuation(
    item: IInventoryItem, 
    method: string, 
    asOfDate: Date
  ): Promise<InventoryValuation> {
    const product = await Product.findOne({ productId: item.productId });
    
    // Get movement history up to the valuation date
    const movements = item.tracking.movementHistory
      .filter(m => m.date <= asOfDate && m.type === 'in')
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    let layers: any[] = [];
    let totalValue = 0;
    let unitCost = item.unitCost;

    switch (method) {
      case 'fifo':
        // FIFO: Use oldest costs first
        layers = movements.map(movement => ({
          quantity: movement.quantity,
          unitCost: item.unitCost, // Simplified - would need actual cost at time of movement
          totalValue: movement.quantity * item.unitCost,
          acquisitionDate: movement.date,
          source: movement.reference,
          batchNumber: item.batchNumber,
          serialNumber: item.serialNumber
        }));
        totalValue = layers.reduce((sum, layer) => sum + layer.totalValue, 0);
        break;

      case 'lifo':
        // LIFO: Use newest costs first
        layers = movements
          .reverse()
          .map(movement => ({
            quantity: movement.quantity,
            unitCost: item.unitCost,
            totalValue: movement.quantity * item.unitCost,
            acquisitionDate: movement.date,
            source: movement.reference,
            batchNumber: item.batchNumber,
            serialNumber: item.serialNumber
          }));
        totalValue = layers.reduce((sum, layer) => sum + layer.totalValue, 0);
        break;

      case 'weighted_average':
        // Weighted Average: Calculate average cost
        const totalQuantity = movements.reduce((sum, m) => sum + m.quantity, 0);
        const totalCost = movements.reduce((sum, m) => sum + (m.quantity * item.unitCost), 0);
        unitCost = totalQuantity > 0 ? totalCost / totalQuantity : item.unitCost;
        totalValue = item.quantity * unitCost;
        layers = [{
          quantity: item.quantity,
          unitCost,
          totalValue,
          acquisitionDate: asOfDate,
          source: 'Weighted Average',
          batchNumber: item.batchNumber,
          serialNumber: item.serialNumber
        }];
        break;

      case 'standard_cost':
        // Standard Cost: Use predetermined standard cost
        const standardCost = item.unitCost; // Would come from product master
        totalValue = item.quantity * standardCost;
        layers = [{
          quantity: item.quantity,
          unitCost: standardCost,
          totalValue,
          acquisitionDate: asOfDate,
          source: 'Standard Cost',
          batchNumber: item.batchNumber,
          serialNumber: item.serialNumber
        }];
        break;

      case 'specific_identification':
        // Specific Identification: Track each item individually
        layers = [{
          quantity: item.quantity,
          unitCost: item.unitCost,
          totalValue: item.totalValue,
          acquisitionDate: item.createdAt,
          source: 'Specific ID',
          batchNumber: item.batchNumber,
          serialNumber: item.serialNumber
        }];
        totalValue = item.totalValue;
        break;
    }

    // Calculate market values (simplified)
    const marketValue = product?.price || unitCost * 1.5;
    const replacementCost = unitCost * 1.1; // 10% above current cost
    const netRealizableValue = marketValue * 0.9; // 90% of market value
    const lowerOfCostOrMarket = Math.min(unitCost, marketValue);

    return {
      productId: item.productId,
      sku: item.sku,
      productName: product?.name || 'Unknown',
      warehouseId: item.warehouseId,
      quantity: item.quantity,
      unitCost,
      totalValue,
      costingMethod: method,
      layers,
      marketValue,
      replacementCost,
      netRealizableValue,
      lowerOfCostOrMarket,
      lastUpdated: new Date()
    };
  }

  // Costing Adjustments
  async createCostingAdjustment(adjustmentData: {
    type: 'purchase_price_change' | 'currency_fluctuation' | 'freight_cost' | 'handling_cost' | 'storage_cost' | 'obsolescence' | 'damage' | 'theft';
    productId: string;
    warehouseId?: string;
    batchNumber?: string;
    serialNumber?: string;
    newUnitCost: number;
    reason: string;
    approvedBy: string;
    effectiveDate: Date;
    supportingDocuments?: string[];
  }): Promise<CostingAdjustment> {
    const adjustmentId = `COST-ADJ-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Find affected inventory items
    const query: any = { productId: adjustmentData.productId };
    if (adjustmentData.warehouseId) query.warehouseId = adjustmentData.warehouseId;
    if (adjustmentData.batchNumber) query.batchNumber = adjustmentData.batchNumber;
    if (adjustmentData.serialNumber) query.serialNumber = adjustmentData.serialNumber;

    const inventoryItems = await InventoryItem.find(query);
    if (inventoryItems.length === 0) {
      throw new Error('No inventory items found for adjustment');
    }

    const oldUnitCost = inventoryItems[0].unitCost;
    const totalQuantity = inventoryItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalAdjustment = (adjustmentData.newUnitCost - oldUnitCost) * totalQuantity;

    // Update inventory items with new cost
    for (const item of inventoryItems) {
      await InventoryItem.updateOne(
        { itemId: item.itemId },
        {
          $set: {
            unitCost: adjustmentData.newUnitCost,
            totalValue: item.quantity * adjustmentData.newUnitCost,
            lastUpdatedBy: adjustmentData.approvedBy
          }
        }
      );
    }

    const adjustment: CostingAdjustment = {
      adjustmentId,
      type: adjustmentData.type,
      productId: adjustmentData.productId,
      warehouseId: adjustmentData.warehouseId,
      batchNumber: adjustmentData.batchNumber,
      serialNumber: adjustmentData.serialNumber,
      oldUnitCost,
      newUnitCost: adjustmentData.newUnitCost,
      quantity: totalQuantity,
      totalAdjustment,
      reason: adjustmentData.reason,
      approvedBy: adjustmentData.approvedBy,
      approvedAt: new Date(),
      effectiveDate: adjustmentData.effectiveDate,
      supportingDocuments: adjustmentData.supportingDocuments || [],
      createdAt: new Date()
    };

    return adjustment;
  }

  // Cost Analysis
  async generateCostAnalysis(params: {
    warehouseId?: string;
    productId?: string;
    startDate: Date;
    endDate: Date;
    groupBy?: 'product' | 'warehouse' | 'method';
  }): Promise<CostAnalysis> {
    const { startDate, endDate } = params;
    const period = `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`;

    // Get inventory data
    const inventoryQuery: any = {
      'tracking.movementHistory.date': { $gte: startDate, $lte: endDate }
    };
    
    if (params.warehouseId) inventoryQuery.warehouseId = params.warehouseId;
    if (params.productId) inventoryQuery.productId = params.productId;

    const inventoryItems = await InventoryItem.find(inventoryQuery);
    
    // Calculate summary metrics
    const totalInventoryValue = inventoryItems.reduce((sum, item) => sum + item.totalValue, 0);
    
    // Get sales data for COGS calculation (simplified)
    const salesData = await this.getSalesData(params.warehouseId, params.productId, startDate, endDate);
    const costOfGoodsSold = salesData.reduce((sum, sale) => sum + sale.cost, 0);
    const totalRevenue = salesData.reduce((sum, sale) => sum + sale.revenue, 0);
    
    const grossMargin = totalRevenue - costOfGoodsSold;
    const grossMarginPercentage = totalRevenue > 0 ? (grossMargin / totalRevenue) * 100 : 0;
    
    // Calculate inventory turnover
    const averageInventory = totalInventoryValue; // Simplified
    const inventoryTurnover = averageInventory > 0 ? costOfGoodsSold / averageInventory : 0;
    const daysInventoryOutstanding = inventoryTurnover > 0 ? 365 / inventoryTurnover : 0;
    
    // Calculate carrying costs (estimated as 25% annually)
    const carryingCost = totalInventoryValue * 0.25 * ((endDate.getTime() - startDate.getTime()) / (365 * 24 * 60 * 60 * 1000));
    
    // Estimate stockout costs (simplified)
    const stockoutCost = await this.calculateStockoutCost(params.warehouseId, params.productId, startDate, endDate);

    const summary = {
      totalInventoryValue,
      totalCostOfGoodsSold: costOfGoodsSold,
      grossMargin,
      grossMarginPercentage,
      inventoryTurnover,
      daysInventoryOutstanding,
      carryingCost,
      stockoutCost,
      totalCost: costOfGoodsSold + carryingCost + stockoutCost
    };

    // Generate detailed breakdowns
    const byProduct = await this.analyzeByProduct(inventoryItems, salesData, startDate, endDate);
    const byWarehouse = await this.analyzeByWarehouse(inventoryItems, startDate, endDate);
    const byCostingMethod = await this.analyzeByCostingMethod(inventoryItems, salesData);

    // Generate trends (simplified)
    const trends = await this.generateCostTrends(params.warehouseId, params.productId, startDate, endDate);

    // Generate recommendations
    const recommendations = await this.generateCostRecommendations(summary, byProduct, byWarehouse);

    return {
      period,
      startDate,
      endDate,
      summary,
      byProduct,
      byWarehouse,
      byCostingMethod,
      trends,
      recommendations
    };
  }

  // Landed Cost Calculation
  async calculateLandedCost(params: {
    purchaseOrderId: string;
    allocationMethod: 'by_value' | 'by_weight' | 'by_volume' | 'by_quantity' | 'custom';
    additionalCosts: {
      freight?: number;
      insurance?: number;
      customs?: number;
      duties?: number;
      taxes?: number;
      handling?: number;
      storage?: number;
      other?: number;
    };
    calculatedBy: string;
  }): Promise<LandedCostCalculation[]> {
    const purchaseOrder = await PurchaseOrder.findOne({ purchaseOrderId: params.purchaseOrderId });
    if (!purchaseOrder) {
      throw new Error('Purchase order not found');
    }

    const landedCosts: LandedCostCalculation[] = [];

    for (const item of purchaseOrder.items) {
      const product = await Product.findOne({ productId: item.productId });
      if (!product) continue;

      const baseCost = item.unitPrice * item.quantity;
      const totalAdditionalCosts = Object.values(params.additionalCosts).reduce((sum, cost) => sum + (cost || 0), 0);
      const totalLandedCost = baseCost + totalAdditionalCosts;
      const unitLandedCost = totalLandedCost / item.quantity;

      // Calculate allocation details
      const allocationDetails = this.calculateCostAllocation(
        params.additionalCosts,
        baseCost,
        item.quantity,
        product,
        params.allocationMethod
      );

      landedCosts.push({
        productId: item.productId,
        purchaseOrderId: params.purchaseOrderId,
        baseCost,
        additionalCosts: {
          freight: params.additionalCosts.freight || 0,
          insurance: params.additionalCosts.insurance || 0,
          customs: params.additionalCosts.customs || 0,
          duties: params.additionalCosts.duties || 0,
          taxes: params.additionalCosts.taxes || 0,
          handling: params.additionalCosts.handling || 0,
          storage: params.additionalCosts.storage || 0,
          other: params.additionalCosts.other || 0
        },
        totalLandedCost,
        unitLandedCost,
        quantity: item.quantity,
        allocationMethod: params.allocationMethod,
        allocationDetails,
        effectiveDate: new Date(),
        calculatedBy: params.calculatedBy
      });
    }

    return landedCosts;
  }

  // Obsolescence Analysis
  async analyzeObsolescence(params: {
    warehouseId?: string;
    productId?: string;
    criteria?: {
      noMovementDays?: number;
      lowTurnoverThreshold?: number;
      expiryThreshold?: number;
      damageThreshold?: number;
    };
  }): Promise<ObsolescenceAnalysis> {
    const criteria = {
      noMovementDays: params.criteria?.noMovementDays || 180,
      lowTurnoverThreshold: params.criteria?.lowTurnoverThreshold || 0.5,
      expiryThreshold: params.criteria?.expiryThreshold || 30,
      damageThreshold: params.criteria?.damageThreshold || 0.1
    };

    const query: any = { status: 'active' };
    if (params.warehouseId) query.warehouseId = params.warehouseId;
    if (params.productId) query.productId = params.productId;

    const inventoryItems = await InventoryItem.find(query);
    const analysisDate = new Date();

    const details = [];
    let totalItems = 0;
    let obsoleteItems = 0;
    let obsoleteValue = 0;
    let slowMovingItems = 0;
    let slowMovingValue = 0;
    let potentialWriteOff = 0;

    for (const item of inventoryItems) {
      totalItems++;
      
      // Calculate days since last movement
      const daysSinceLastMovement = Math.floor(
        (analysisDate.getTime() - item.tracking.lastMovementDate.getTime()) / (24 * 60 * 60 * 1000)
      );

      // Calculate turnover rate (simplified)
      const turnoverRate = this.calculateTurnoverRate(item);

      let status: 'active' | 'slow_moving' | 'obsolete' | 'expired' | 'damaged' = 'active';
      let recommendedAction: 'keep' | 'discount' | 'return' | 'write_off' | 'liquidate' = 'keep';
      let recommendedQuantity = item.quantity;
      let potentialLoss = 0;
      let reason = '';

      // Determine status and recommendations
      if (item.storage.expiryDate && item.storage.expiryDate <= new Date()) {
        status = 'expired';
        recommendedAction = 'write_off';
        recommendedQuantity = item.quantity;
        potentialLoss = item.totalValue;
        reason = 'Item has expired';
      } else if (daysSinceLastMovement > criteria.noMovementDays) {
        status = 'obsolete';
        recommendedAction = 'liquidate';
        recommendedQuantity = item.quantity;
        potentialLoss = item.totalValue * 0.8; // 80% loss
        reason = `No movement for ${daysSinceLastMovement} days`;
      } else if (turnoverRate < criteria.lowTurnoverThreshold) {
        status = 'slow_moving';
        recommendedAction = 'discount';
        recommendedQuantity = Math.floor(item.quantity * 0.5); // Discount half
        potentialLoss = item.totalValue * 0.2; // 20% loss
        reason = `Low turnover rate: ${turnoverRate.toFixed(2)}`;
      } else if (item.storage.expiryDate && 
                 item.storage.expiryDate <= new Date(Date.now() + criteria.expiryThreshold * 24 * 60 * 60 * 1000)) {
        status = 'slow_moving';
        recommendedAction = 'discount';
        recommendedQuantity = item.quantity;
        potentialLoss = item.totalValue * 0.3; // 30% loss
        reason = 'Item approaching expiry';
      }

      if (status === 'obsolete') {
        obsoleteItems++;
        obsoleteValue += item.totalValue;
        potentialWriteOff += potentialLoss;
      } else if (status === 'slow_moving') {
        slowMovingItems++;
        slowMovingValue += item.totalValue;
        potentialWriteOff += potentialLoss;
      }

      details.push({
        productId: item.productId,
        sku: item.sku,
        warehouseId: item.warehouseId,
        quantity: item.quantity,
        unitCost: item.unitCost,
        totalValue: item.totalValue,
        daysSinceLastMovement,
        turnoverRate,
        status,
        recommendedAction,
        recommendedQuantity,
        potentialLoss,
        reason
      });
    }

    // Generate recommendations
    const recommendations = this.generateObsolescenceRecommendations(details);

    return {
      analysisDate,
      criteria,
      summary: {
        totalItems,
        obsoleteItems,
        obsoleteValue,
        slowMovingItems,
        slowMovingValue,
        potentialWriteOff,
        reserveRequired: potentialWriteOff
      },
      details,
      recommendations
    };
  }

  // Helper methods
  private async getSalesData(warehouseId?: string, productId?: string, startDate: Date, endDate: Date) {
    // Simplified sales data retrieval
    // In a real implementation, this would query actual sales/orders
    return [
      { productId: 'PROD001', cost: 1000, revenue: 1500, date: new Date() },
      { productId: 'PROD002', cost: 2000, revenue: 3000, date: new Date() }
    ];
  }

  private async calculateStockoutCost(warehouseId?: string, productId?: string, startDate: Date, endDate: Date) {
    // Simplified stockout cost calculation
    // Would need actual stockout data and lost sales calculations
    return 5000; // Placeholder
  }

  private async analyzeByProduct(inventoryItems: IInventoryItem[], salesData: any[], startDate: Date, endDate: Date) {
    // Simplified product analysis
    return [];
  }

  private async analyzeByWarehouse(inventoryItems: IInventoryItem[], startDate: Date, endDate: Date) {
    // Simplified warehouse analysis
    return [];
  }

  private async analyzeByCostingMethod(inventoryItems: IInventoryItem[], salesData: any[]) {
    // Simplified costing method analysis
    return [];
  }

  private async generateCostTrends(warehouseId?: string, productId?: string, startDate: Date, endDate: Date) {
    // Simplified trend generation
    return {
      inventoryValue: [],
      costOfGoodsSold: [],
      margins: []
    };
  }

  private async generateCostRecommendations(summary: any, byProduct: any[], byWarehouse: any[]) {
    const recommendations = [];
    
    if (summary.grossMarginPercentage < 20) {
      recommendations.push({
        category: 'supplier_negotiation' as const,
        priority: 'high' as const,
        description: 'Gross margin is below 20%. Consider renegotiating supplier contracts.',
        potentialSavings: summary.totalCostOfGoodsSold * 0.05,
        implementationCost: 5000,
        roi: 10,
        timeframe: '3 months'
      });
    }
    
    if (summary.inventoryTurnover < 4) {
      recommendations.push({
        category: 'inventory_reduction' as const,
        priority: 'medium' as const,
        description: 'Inventory turnover is low. Implement just-in-time inventory practices.',
        potentialSavings: summary.carryingCost * 0.3,
        implementationCost: 10000,
        roi: 5,
        timeframe: '6 months'
      });
    }
    
    return recommendations;
  }

  private calculateCostAllocation(additionalCosts: any, baseCost: number, quantity: number, product: any, method: string) {
    const allocationDetails = [];
    const totalAdditionalCosts = Object.values(additionalCosts).reduce((sum: number, cost: any) => sum + (cost || 0), 0);

    for (const [costType, amount] of Object.entries(additionalCosts)) {
      if (!amount) continue;

      let allocatedAmount = 0;
      let allocationBase = '';

      switch (method) {
        case 'by_value':
          allocatedAmount = (amount / baseCost) * baseCost;
          allocationBase = 'Value';
          break;
        case 'by_quantity':
          allocatedAmount = amount; // Full amount for this item
          allocationBase = 'Quantity';
          break;
        case 'by_weight':
          // Would need product weight data
          allocatedAmount = amount;
          allocationBase = 'Weight';
          break;
        case 'by_volume':
          // Would need product volume data
          allocatedAmount = amount;
          allocationBase = 'Volume';
          break;
        default:
          allocatedAmount = amount;
          allocationBase = 'Custom';
      }

      allocationDetails.push({
        costType,
        amount: amount as number,
        allocationBase,
        allocatedAmount,
        percentage: totalAdditionalCosts > 0 ? (allocatedAmount / totalAdditionalCosts) * 100 : 0
      });
    }

    return allocationDetails;
  }

  private calculateTurnoverRate(item: IInventoryItem): number {
    // Simplified turnover calculation
    const daysSinceLastMovement = Math.floor(
      (Date.now() - item.tracking.lastMovementDate.getTime()) / (24 * 60 * 60 * 1000)
    );
    
    // If no movement in last year, turnover is very low
    if (daysSinceLastMovement > 365) return 0.1;
    
    // Estimate annual turns based on recent movement
    const estimatedAnnualTurns = 365 / Math.max(daysSinceLastMovement, 1);
    return Math.min(estimatedAnnualTurns, 52); // Cap at weekly turns
  }

  private generateObsolescenceRecommendations(details: any[]) {
    const recommendations = [];
    
    const obsoleteItems = details.filter(d => d.status === 'obsolete');
    if (obsoleteItems.length > 0) {
      recommendations.push({
        action: 'Liquidate Obsolete Inventory',
        description: `Liquidate ${obsoleteItems.length} obsolete items to recover value and free up space`,
        items: obsoleteItems.map(d => d.sku),
        potentialRecovery: obsoleteItems.reduce((sum, d) => sum + (d.totalValue * 0.2), 0),
        timeframe: '30 days'
      });
    }
    
    const slowMovingItems = details.filter(d => d.status === 'slow_moving');
    if (slowMovingItems.length > 0) {
      recommendations.push({
        action: 'Discount Slow-Moving Items',
        description: `Apply discounts to ${slowMovingItems.length} slow-moving items to improve turnover`,
        items: slowMovingItems.map(d => d.sku),
        potentialRecovery: slowMovingItems.reduce((sum, d) => sum + (d.totalValue * 0.8), 0),
        timeframe: '60 days'
      });
    }
    
    return recommendations;
  }
}
