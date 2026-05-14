import { Product } from '../../models/Product';
import { Inventory } from '../../models/Inventory';
import { StockMovement } from '../../models/StockMovement';

export interface CurrentStockReport {
  asOfDate: Date;
  summary: {
    totalProducts: number;
    totalStockValue: number;
    totalRetailValue: number;
    averageTurnover: number;
    lowStockItems: number;
    outOfStockItems: number;
    overstockItems: number;
  };
  byLocation: Array<{
    locationId: string;
    locationName: string;
    stockValue: number;
    itemCount: number;
    lowStockCount: number;
    outOfStockCount: number;
  }>;
  products: Array<{
    productId: string;
    name: string;
    sku: string;
    category: string;
    currentStock: number;
    reorderPoint: number;
    safetyStock: number;
    stockValue: number;
    turnover: number;
    daysInInventory: number;
    status: 'normal' | 'low' | 'critical' | 'overstock';
    recommendedAction: string;
    locations: Array<{
      location: string;
      quantity: number;
      value: number;
    }>;
  }>;
  aging: Array<{
    age: string; // 0-30, 31-60, 61-90, 90+
    count: number;
    value: number;
    percentage: number;
  }>;
}

export interface LowStockReport {
  generatedDate: Date;
  filters: {
    locationId?: string;
    categoryId?: string;
    urgencyLevel: 'all' | 'critical' | 'warning' | 'advisory';
  };
  summary: {
    totalItems: number;
    criticalItems: number;
    warningItems: number;
    advisoryItems: number;
    totalValueNeeded: number;
    urgentReorderValue: number;
  };
  items: Array<{
    productId: string;
    name: string;
    sku: string;
    category: string;
    supplier: string;
    currentStock: number;
    reorderPoint: number;
    safetyStock: number;
    recommendedOrderQuantity: number;
    urgency: 'critical' | 'warning' | 'advisory';
    daysUntilStockout: number;
    averageDailyUsage: number;
    leadTime: number;
    unitCost: number;
    totalCost: number;
    lastSaleDate: Date;
    trend: 'increasing' | 'stable' | 'decreasing';
    recommendedAction: string;
    orderSuggested: boolean;
    canReorder: boolean;
  }>;
  bySupplier: Array<{
    supplierId: string;
    supplierName: string;
    itemsCount: number;
    totalValue: number;
    criticalItems: number;
    contactInfo: string;
    nextDeliveryDate?: Date;
  }>;
  byCategory: Array<{
    categoryId: string;
    categoryName: string;
    itemsCount: number;
    totalValue: number;
    percentage: number;
  }>;
  recommendations: Array<{
    type: 'immediate' | 'scheduled' | 'review';
    priority: 'high' | 'medium' | 'low';
    description: string;
    impact: string;
    estimatedCost: number;
  }>;
}

export interface OverstockReport {
  generatedDate: Date;
  filters: {
    locationId?: string;
    categoryId?: string;
    overstockThreshold: number; // percentage above optimal level
  };
  summary: {
    totalItems: number;
    totalExcessValue: number;
    totalCarryingCost: number;
    potentialSavings: number;
    categoriesAffected: number;
  };
  items: Array<{
    productId: string;
    name: string;
    sku: string;
    category: string;
    currentStock: number;
    optimalStock: number;
    excessQuantity: number;
    excessValue: number;
    carryingCost: number;
    daysOfSupply: number;
    averageMonthlyUsage: number;
    lastSaleDate: Date;
    trend: 'stable' | 'declining' | 'seasonal';
    recommendations: Array<{
      action: 'discount' | 'transfer' | 'return' | 'bundle' | 'donate';
      priority: 'high' | 'medium' | 'low';
      description: string;
      potentialSavings: number;
      implementationCost: number;
      netBenefit: number;
    }>;
    riskLevel: 'low' | 'medium' | 'high';
    actionTaken: boolean;
  }>;
  byCategory: Array<{
    categoryId: string;
    categoryName: string;
    excessValue: number;
    carryingCost: number;
    itemsCount: number;
    percentage: number;
  }>;
  financialImpact: {
    monthlyCarryingCost: number;
    annualCarryingCost: number;
    opportunityCost: number;
    potentialLiquidationValue: number;
    netLossIfHeld: number;
  };
  actionPlan: Array<{
    action: string;
    timeline: string;
    responsible: string;
    expectedSavings: number;
    status: 'planned' | 'in-progress' | 'completed';
  }>;
}

export interface StockMovementReport {
  period: {
    startDate: Date;
    endDate: Date;
  };
  summary: {
    totalIn: number;
    totalInValue: number;
    totalOut: number;
    totalOutValue: number;
    netChange: number;
    netChangeValue: number;
    adjustments: number;
    adjustmentValue: number;
  };
  byType: Array<{
    type: string;
    quantity: number;
    value: number;
    percentage: number;
    transactions: number;
  }>;
  byCategory: Array<{
    category: string;
    in: number;
    out: number;
    net: number;
    turnover: number;
  }>;
  topMovingProducts: Array<{
    productId: string;
    name: string;
    in: number;
    out: number;
    velocity: number; // units per day
  }>;
  slowMovingProducts: Array<{
    productId: string;
    name: string;
    daysWithoutMovement: number;
    currentStock: number;
    recommendation: string;
  }>;
  abnormalMovements: Array<{
    date: Date;
    productId: string;
    name: string;
    quantity: number;
    expected: number;
    variance: number;
    reason: string;
    requiresInvestigation: boolean;
  }>;
  trends: {
    dailyMovements: Array<{
      date: Date;
      in: number;
      out: number;
      net: number;
    }>;
    patterns: Array<{
      pattern: string;
      description: string;
      frequency: string;
      impact: string;
    }>;
  };
}

export interface TurnoverAnalysis {
  period: {
    startDate: Date;
    endDate: Date;
  };
  summary: {
    averageTurnover: number;
    industryBenchmark: number;
    performance: 'above' | 'at' | 'below';
    totalInventoryValue: number;
    annualizedCostOfGoodsSold: number;
  };
  byProduct: Array<{
    productId: string;
    name: string;
    category: string;
    currentStock: number;
    averageStock: number;
    costOfGoodsSold: number;
    turnover: number;
    daysOfSupply: number;
    benchmark: number;
    performance: 'excellent' | 'good' | 'average' | 'poor';
    recommendation: string;
  }>;
  byCategory: Array<{
    categoryId: string;
    categoryName: string;
    averageTurnover: number;
    benchmark: number;
    performance: 'above' | 'at' | 'below';
    totalValue: number;
    opportunityCost: number;
  }>;
  analysis: {
    fastMoving: Array<{
      productId: string;
      name: string;
      turnover: number;
      recommendation: string;
    }>;
    slowMoving: Array<{
      productId: string;
      name: string;
      turnover: number;
      daysOfSupply: number;
      recommendation: string;
    }>;
    optimalStock: Array<{
      productId: string;
      name: string;
      currentTurnover: number;
      optimalTurnover: number;
      adjustment: number;
      potentialSavings: number;
    }>;
  };
  trends: {
    monthlyTurnover: Array<{
      month: string;
      turnover: number;
      benchmark: number;
      variance: number;
    }>;
    seasonality: Array<{
      category: string;
      seasonalFactor: number;
      peakMonths: number[];
      lowMonths: number[];
    }>;
  };
}

export interface DeadStockReport {
  generatedDate: Date;
  criteria: {
    daysWithoutMovement: number;
    includeLowValue: boolean;
    minValue: number;
  };
  summary: {
    totalItems: number;
    totalValue: number;
    totalQuantity: number;
    writeOffRecommendation: number;
    potentialRecoveryValue: number;
    categoriesAffected: number;
  };
  items: Array<{
    productId: string;
    name: string;
    sku: string;
    category: string;
    currentStock: number;
    lastMovementDate: Date;
    daysWithoutMovement: number;
    unitCost: number;
    totalValue: number;
    ageCategory: '0-90' | '91-180' | '181-365' | '365+';
    dispositionOptions: Array<{
      option: 'write-off' | 'donate' | 'liquidate' | 'return' | 'bundle';
      estimatedRecovery: number;
      cost: number;
      netRecovery: number;
      probability: number;
    }>;
    recommendedAction: string;
    urgency: 'low' | 'medium' | 'high';
    reasonForDeadStock: string;
  }>;
  byCategory: Array<{
    categoryId: string;
    categoryName: string;
    itemCount: number;
    totalValue: number;
    percentage: number;
    averageAge: number;
  }>;
  byAge: Array<{
    ageRange: string;
    itemCount: number;
    totalValue: number;
    percentage: number;
    recommendedAction: string;
  }>;
  financialImpact: {
    carryingCost: number;
    opportunityCost: number;
    storageCost: number;
    insuranceCost: number;
    totalHoldingCost: number;
    potentialRecovery: number;
    netLoss: number;
  };
  actionPlan: Array<{
    action: string;
    items: string[];
    timeline: string;
    responsible: string;
    expectedRecovery: number;
    cost: number;
    netBenefit: number;
  }>;
}

export interface InventoryValuationReport {
  asOfDate: Date;
  costingMethod: 'fifo' | 'lifo' | 'average' | 'standard';
  summary: {
    totalCost: number;
    totalRetail: number;
    potentialProfit: number;
    margin: number;
    previousPeriodCost: number;
    change: number;
    changePercentage: number;
  };
  byCategory: Array<{
    category: string;
    cost: number;
    retail: number;
    margin: number;
    percentage: number;
  }>;
  byLocation: Array<{
    location: string;
    cost: number;
    retail: number;
    items: number;
  }>;
  topValueProducts: Array<{
    productId: string;
    name: string;
    cost: number;
    retail: number;
    quantity: number;
    totalCost: number;
    totalRetail: number;
  }>;
  valuationLayers: Array<{
    layerDate: Date;
    quantity: number;
    unitCost: number;
    totalCost: number;
    remainingQuantity: number;
  }>;
  reconciliation: {
    glBalance: number;
    inventoryBalance: number;
    variance: number;
    isReconciled: boolean;
    adjustments: Array<{
      date: Date;
      amount: number;
      reason: string;
    }>;
  };
}

export interface COGSReport {
  period: {
    startDate: Date;
    endDate: Date;
  };
  summary: {
    totalCOGS: number;
    beginningInventory: number;
    purchases: number;
    endingInventory: number;
    grossProfit: number;
    grossMargin: number;
    previousPeriodCOGS: number;
    variance: number;
    variancePercentage: number;
  };
  byProduct: Array<{
    productId: string;
    name: string;
    category: string;
    quantitySold: number;
    unitCost: number;
    totalCOGS: number;
    revenue: number;
    grossProfit: number;
    grossMargin: number;
    contribution: number;
  }>;
  byCategory: Array<{
    category: string;
    totalCOGS: number;
    revenue: number;
    grossProfit: number;
    grossMargin: number;
    contribution: number;
    growth: number;
  }>;
  byPeriod: Array<{
    period: string;
    cogs: number;
    revenue: number;
    grossMargin: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  analysis: {
    highMarginProducts: Array<{
      productId: string;
      name: string;
      margin: number;
      recommendation: string;
    }>;
    lowMarginProducts: Array<{
      productId: string;
      name: string;
      margin: number;
      recommendation: string;
    }>;
    costDrivers: Array<{
      factor: string;
      impact: number;
      description: string;
    }>;
  };
}

export interface DemandForecastReport {
  forecastPeriod: DateRange;
  forecastMethod: 'arima' | 'prophet' | 'lstm' | 'ensemble';
  summary: {
    totalForecast: number;
    lowerBound: number;
    upperBound: number;
    confidenceLevel: number;
    seasonalFactor: number;
    trendDirection: 'up' | 'down' | 'stable';
    trendStrength: number;
  };
  byPeriod: Array<{
    period: string; // day/week/month
    forecast: number;
    lowerBound: number;
    upperBound: number;
    seasonalIndex: number;
    promotionalImpact?: number;
  }>;
  byCategory: Array<{
    category: string;
    forecast: number;
    growth: number;
    confidence: number;
  }>;
  topProducts: Array<{
    productId: string;
    name: string;
    forecast: number;
    confidence: number;
    recommendedStock: number;
    reorderDate: Date;
  }>;
  accuracy: {
    mape: number; // Mean Absolute Percentage Error
    mae: number; // Mean Absolute Error
    rmse: number; // Root Mean Square Error
    historicalAccuracy: Array<{
      period: string;
      actual: number;
      forecast: number;
      error: number;
    }>;
  };
}

export interface ReorderRecommendations {
  generatedDate: Date;
  planningHorizon: number; // days
  summary: {
    totalRecommendations: number;
    totalValue: number;
    urgentOrders: number;
    scheduledOrders: number;
    potentialStockouts: number;
  };
  recommendations: Array<{
    productId: string;
    name: string;
    sku: string;
    supplier: string;
    currentStock: number;
    reorderPoint: number;
    recommendedQuantity: number;
    economicOrderQuantity: number;
    urgency: 'immediate' | 'scheduled' | 'optional';
    orderDate: Date;
    expectedDelivery: Date;
    unitCost: number;
    totalCost: number;
    leadTime: number;
    safetyStock: number;
    demandForecast: number;
    serviceLevel: number;
    stockoutRisk: number;
    reason: string;
    canBundle: boolean;
    bundleSuggestions: Array<{
      productId: string;
      name: string;
      quantity: number;
      savings: number;
    }>;
  }>;
  bySupplier: Array<{
    supplierId: string;
    supplierName: string;
    recommendations: Array<string>;
    totalValue: number;
    consolidatedShipping: boolean;
    suggestedOrderDate: Date;
  }>;
  optimization: {
    totalSavings: number;
    consolidationOpportunities: Array<{
      products: Array<string>;
      supplier: string;
      savings: number;
      combinedOrderValue: number;
    }>;
    bulkDiscountOpportunities: Array<{
      productId: string;
      currentQuantity: number;
      discountQuantity: number;
      discountPercentage: number;
      savings: number;
    }>;
  };
}

export class InventoryReportsService {
  // Generate Current Stock Report
  async generateCurrentStockReport(params: {
    asOfDate?: Date;
    locationId?: string;
    categoryId?: string;
    includeAging?: boolean;
    includeValuation?: boolean;
  }): Promise<CurrentStockReport> {
    const asOfDate = params.asOfDate || new Date();
    
    // Get current inventory
    const inventory = await this.getCurrentInventory(params.locationId, params.categoryId);
    
    // Calculate summary metrics
    const totalProducts = inventory.length;
    const totalStockValue = inventory.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
    const totalRetailValue = inventory.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const averageTurnover = await this.calculateAverageTurnover(inventory);
    
    // Count stock status items
    const lowStockItems = inventory.filter(item => item.quantity <= item.reorderPoint).length;
    const outOfStockItems = inventory.filter(item => item.quantity === 0).length;
    const overstockItems = inventory.filter(item => item.quantity > item.reorderPoint * 2).length;
    
    // Generate location breakdown
    const byLocation = await this.generateLocationBreakdown(inventory);
    
    // Process products with status and recommendations
    const products = inventory.map(item => ({
      productId: item.productId,
      name: item.name,
      sku: item.sku,
      category: item.category,
      currentStock: item.quantity,
      reorderPoint: item.reorderPoint,
      safetyStock: item.safetyStock,
      stockValue: item.quantity * item.unitCost,
      turnover: item.turnover || 0,
      daysInInventory: item.daysInInventory || 0,
      status: this.determineStockStatus(item.quantity, item.reorderPoint, item.safetyStock),
      recommendedAction: this.generateStockRecommendation(item),
      locations: item.locations || []
    }));
    
    // Generate aging analysis if requested
    let aging: any[] = [];
    if (params.includeAging) {
      aging = await this.generateInventoryAging(inventory);
    }
    
    return {
      asOfDate,
      summary: {
        totalProducts,
        totalStockValue,
        totalRetailValue,
        averageTurnover,
        lowStockItems,
        outOfStockItems,
        overstockItems
      },
      byLocation,
      products,
      aging
    };
  }
  
  // Generate Low Stock Report
  async generateLowStockReport(params: {
    locationId?: string;
    categoryId?: string;
    urgencyLevel?: 'all' | 'critical' | 'warning' | 'advisory';
    includeRecommendations?: boolean;
  }): Promise<LowStockReport> {
    const urgencyLevel = params.urgencyLevel || 'all';
    
    // Get low stock items
    const lowStockItems = await this.getLowStockItems(params.locationId, params.categoryId);
    
    // Filter by urgency level
    const filteredItems = this.filterByUrgency(lowStockItems, urgencyLevel);
    
    // Calculate summary metrics
    const summary = this.calculateLowStockSummary(filteredItems);
    
    // Process items with detailed analysis
    const items = await Promise.all(filteredItems.map(async item => {
      const daysUntilStockout = this.calculateDaysUntilStockout(item);
      const averageDailyUsage = await this.calculateAverageDailyUsage(item.productId);
      const recommendedOrderQuantity = this.calculateRecommendedOrderQuantity(item, averageDailyUsage);
      const trend = await this.analyzeDemandTrend(item.productId);
      const recommendedAction = this.generateLowStockAction(item, daysUntilStockout, trend);
      
      return {
        productId: item.productId,
        name: item.name,
        sku: item.sku,
        category: item.category,
        supplier: item.supplier,
        currentStock: item.quantity,
        reorderPoint: item.reorderPoint,
        safetyStock: item.safetyStock,
        recommendedOrderQuantity,
        urgency: this.determineUrgency(item.quantity, item.reorderPoint, daysUntilStockout),
        daysUntilStockout,
        averageDailyUsage,
        leadTime: item.leadTime || 7,
        unitCost: item.unitCost,
        totalCost: recommendedOrderQuantity * item.unitCost,
        lastSaleDate: item.lastSaleDate,
        trend,
        recommendedAction,
        orderSuggested: recommendedOrderQuantity > 0,
        canReorder: item.canReorder !== false
      };
    }));
    
    // Generate supplier breakdown
    const bySupplier = await this.generateSupplierBreakdown(items);
    
    // Generate category breakdown
    const byCategory = this.generateCategoryBreakdown(items);
    
    // Generate recommendations if requested
    let recommendations: any[] = [];
    if (params.includeRecommendations) {
      recommendations = await this.generateLowStockRecommendations(items);
    }
    
    return {
      generatedDate: new Date(),
      filters: {
        locationId: params.locationId,
        categoryId: params.categoryId,
        urgencyLevel
      },
      summary,
      items,
      bySupplier,
      byCategory,
      recommendations
    };
  }
  
  // Generate Overstock Report
  async generateOverstockReport(params: {
    locationId?: string;
    categoryId?: string;
    overstockThreshold?: number;
    includeFinancialImpact?: boolean;
  }): Promise<OverstockReport> {
    const overstockThreshold = params.overstockThreshold || 50; // 50% above optimal
    
    // Get overstock items
    const overstockItems = await this.getOverstockItems(params.locationId, params.categoryId, overstockThreshold);
    
    // Calculate summary metrics
    const summary = this.calculateOverstockSummary(overstockItems);
    
    // Process items with recommendations
    const items = await Promise.all(overstockItems.map(async item => {
      const optimalStock = item.reorderPoint * 1.5; // Simplified optimal calculation
      const excessQuantity = item.quantity - optimalStock;
      const excessValue = excessQuantity * item.unitCost;
      const carryingCost = excessValue * 0.25; // 25% annual carrying cost
      const daysOfSupply = await this.calculateDaysOfSupply(item);
      const averageMonthlyUsage = await this.calculateAverageMonthlyUsage(item.productId);
      const trend = await this.analyzeDemandTrend(item.productId);
      
      const recommendations = this.generateOverstockRecommendations(item, excessQuantity, trend);
      
      return {
        productId: item.productId,
        name: item.name,
        sku: item.sku,
        category: item.category,
        currentStock: item.quantity,
        optimalStock,
        excessQuantity,
        excessValue,
        carryingCost,
        daysOfSupply,
        averageMonthlyUsage,
        lastSaleDate: item.lastSaleDate,
        trend,
        recommendations,
        riskLevel: this.assessOverstockRisk(excessValue, trend),
        actionTaken: false
      };
    }));
    
    // Generate category breakdown
    const byCategory = this.generateCategoryBreakdown(items);
    
    // Calculate financial impact if requested
    let financialImpact: any = null;
    if (params.includeFinancialImpact) {
      financialImpact = await this.calculateOverstockFinancialImpact(items);
    }
    
    // Generate action plan
    const actionPlan = this.generateOverstockActionPlan(items);
    
    return {
      generatedDate: new Date(),
      filters: {
        locationId: params.locationId,
        categoryId: params.categoryId,
        overstockThreshold
      },
      summary,
      items,
      byCategory,
      financialImpact,
      actionPlan
    };
  }
  
  // Helper methods
  private async getCurrentInventory(locationId?: string, categoryId?: string): Promise<any[]> {
    // Mock implementation - would query actual inventory from database
    return [
      {
        productId: 'prod1',
        name: 'Premium Coffee',
        sku: 'COF001',
        category: 'Beverages',
        quantity: 150,
        unitCost: 5.50,
        unitPrice: 12.99,
        reorderPoint: 50,
        safetyStock: 25,
        turnover: 8.5,
        daysInInventory: 43,
        locations: [
          { location: 'Main Store', quantity: 100, value: 550 },
          { location: 'Warehouse', quantity: 50, value: 275 }
        ]
      }
    ];
  }
  
  private determineStockStatus(quantity: number, reorderPoint: number, safetyStock: number): 'normal' | 'low' | 'critical' | 'overstock' {
    if (quantity === 0) return 'critical';
    if (quantity <= safetyStock) return 'critical';
    if (quantity <= reorderPoint) return 'low';
    if (quantity > reorderPoint * 2) return 'overstock';
    return 'normal';
  }
  
  private generateStockRecommendation(item: any): string {
    if (item.quantity === 0) return 'URGENT: Order immediately - out of stock';
    if (item.quantity <= item.safetyStock) return 'URGENT: Order immediately - below safety stock';
    if (item.quantity <= item.reorderPoint) return 'Order soon - at reorder point';
    if (item.quantity > item.reorderPoint * 2) return 'Consider promotion - overstocked';
    return 'Stock level normal';
  }
  
  private async calculateAverageTurnover(inventory: any[]): Promise<number> {
    // Mock implementation - would calculate actual average turnover
    return inventory.reduce((sum, item) => sum + (item.turnover || 0), 0) / inventory.length;
  }
  
  private async generateLocationBreakdown(inventory: any[]): Promise<any[]> {
    // Mock implementation - would generate actual location breakdown
    return [
      {
        locationId: 'loc1',
        locationName: 'Main Store',
        stockValue: 25000,
        itemCount: 150,
        lowStockCount: 8,
        outOfStockCount: 2
      }
    ];
  }
  
  private async generateInventoryAging(inventory: any[]): Promise<any[]> {
    // Mock implementation - would generate actual aging analysis
    return [
      { age: '0-30', count: 80, value: 12000, percentage: 40 },
      { age: '31-60', count: 60, value: 9000, percentage: 30 },
      { age: '61-90', count: 40, value: 6000, percentage: 20 },
      { age: '90+', count: 20, value: 3000, percentage: 10 }
    ];
  }
  
  private async getLowStockItems(locationId?: string, categoryId?: string): Promise<any[]> {
    // Mock implementation - would query actual low stock items
    return [
      {
        productId: 'prod2',
        name: 'Espresso Cups',
        sku: 'CUP001',
        category: 'Accessories',
        quantity: 15,
        reorderPoint: 50,
        safetyStock: 25,
        unitCost: 3.50,
        leadTime: 7,
        lastSaleDate: new Date('2024-01-10'),
        canReorder: true,
        supplier: 'Supplier A'
      }
    ];
  }
  
  private filterByUrgency(items: any[], urgencyLevel: string): any[] {
    if (urgencyLevel === 'all') return items;
    
    return items.filter(item => {
      const urgency = this.determineUrgency(item.quantity, item.reorderPoint, 0);
      return urgency === urgencyLevel;
    });
  }
  
  private determineUrgency(quantity: number, reorderPoint: number, daysUntilStockout: number): 'critical' | 'warning' | 'advisory' {
    if (quantity === 0 || daysUntilStockout <= 3) return 'critical';
    if (quantity <= reorderPoint * 0.5 || daysUntilStockout <= 7) return 'warning';
    return 'advisory';
  }
  
  private calculateLowStockSummary(items: any[]): any {
    const criticalItems = items.filter(item => 
      this.determineUrgency(item.quantity, item.reorderPoint, 0) === 'critical').length;
    const warningItems = items.filter(item => 
      this.determineUrgency(item.quantity, item.reorderPoint, 0) === 'warning').length;
    const advisoryItems = items.filter(item => 
      this.determineUrgency(item.quantity, item.reorderPoint, 0) === 'advisory').length;
    
    const totalValueNeeded = items.reduce((sum, item) => 
      sum + ((item.reorderPoint - item.quantity) * item.unitCost), 0);
    const urgentReorderValue = items.filter(item => 
      this.determineUrgency(item.quantity, item.reorderPoint, 0) === 'critical')
      .reduce((sum, item) => sum + ((item.reorderPoint - item.quantity) * item.unitCost), 0);
    
    return {
      totalItems: items.length,
      criticalItems,
      warningItems,
      advisoryItems,
      totalValueNeeded,
      urgentReorderValue
    };
  }
  
  private calculateDaysUntilStockout(item: any): number {
    // Mock implementation - would calculate based on usage rate
    const averageDailyUsage = 5; // Mock value
    return item.quantity > 0 ? Math.floor(item.quantity / averageDailyUsage) : 0;
  }
  
  private async calculateAverageDailyUsage(productId: string): Promise<number> {
    // Mock implementation - would calculate from historical data
    return 5;
  }
  
  private calculateRecommendedOrderQuantity(item: any, averageDailyUsage: number): number {
    const leadTime = item.leadTime || 7;
    const safetyStock = item.safetyStock || 25;
    const reorderPoint = item.reorderPoint || 50;
    
    return Math.max(0, reorderPoint - item.quantity + (averageDailyUsage * leadTime));
  }
  
  private async analyzeDemandTrend(productId: string): Promise<'increasing' | 'stable' | 'decreasing'> {
    // Mock implementation - would analyze actual demand trend
    return 'stable';
  }
  
  private generateLowStockAction(item: any, daysUntilStockout: number, trend: string): string {
    if (daysUntilStockout <= 3) return 'IMMEDIATE ORDER REQUIRED - Stockout imminent';
    if (daysUntilStockout <= 7) return 'Order within 48 hours - Critical level';
    if (trend === 'increasing') return 'Order with buffer - Increasing demand';
    return 'Schedule reorder - Normal priority';
  }
  
  private async generateSupplierBreakdown(items: any[]): Promise<any[]> {
    // Mock implementation - would group by supplier
    return [
      {
        supplierId: 'sup1',
        supplierName: 'Supplier A',
        itemsCount: 5,
        totalValue: 2500,
        criticalItems: 2,
        contactInfo: 'contact@supplier-a.com',
        nextDeliveryDate: new Date('2024-01-20')
      }
    ];
  }
  
  private generateCategoryBreakdown(items: any[]): any[] {
    // Mock implementation - would group by category
    return [
      {
        categoryId: 'cat1',
        categoryName: 'Beverages',
        itemsCount: 8,
        totalValue: 1500,
        percentage: 60
      }
    ];
  }
  
  private async generateLowStockRecommendations(items: any[]): Promise<any[]> {
    // Mock implementation - would generate actual recommendations
    return [
      {
        type: 'immediate',
        priority: 'high',
        description: 'Place emergency orders for critical items',
        impact: 'Prevent stockouts and lost sales',
        estimatedCost: 5000
      }
    ];
  }
  
  private async getOverstockItems(locationId?: string, categoryId?: string, threshold?: number): Promise<any[]> {
    // Mock implementation - would query actual overstock items
    return [
      {
        productId: 'prod3',
        name: 'Coffee Beans',
        sku: 'BEAN001',
        category: 'Beverages',
        quantity: 500,
        unitCost: 8.50,
        lastSaleDate: new Date('2024-01-05')
      }
    ];
  }
  
  private calculateOverstockSummary(items: any[]): any {
    const totalExcessValue = items.reduce((sum, item) => sum + item.excessValue, 0);
    const totalCarryingCost = totalExcessValue * 0.25; // 25% annual rate
    const potentialSavings = totalCarryingCost * 0.6; // 60% recovery potential
    
    return {
      totalItems: items.length,
      totalExcessValue,
      totalCarryingCost,
      potentialSavings,
      categoriesAffected: new Set(items.map(item => item.category)).size
    };
  }
  
  private async calculateDaysOfSupply(item: any): Promise<number> {
    // Mock implementation - would calculate based on usage rate
    return 90;
  }
  
  private async calculateAverageMonthlyUsage(productId: string): Promise<number> {
    // Mock implementation - would calculate from historical data
    return 150;
  }
  
  private generateOverstockRecommendations(item: any, excessQuantity: number, trend: string): any[] {
    const recommendations = [];
    
    if (excessQuantity > 100) {
      recommendations.push({
        action: 'discount',
        priority: 'high',
        description: 'Offer 20% discount to clear excess stock',
        potentialSavings: excessQuantity * item.unitCost * 0.15,
        implementationCost: excessQuantity * item.unitCost * 0.05,
        netBenefit: excessQuantity * item.unitCost * 0.10
      });
    }
    
    if (trend === 'declining') {
      recommendations.push({
        action: 'liquidate',
        priority: 'medium',
        description: 'Liquidate at 50% cost recovery',
        potentialSavings: excessQuantity * item.unitCost * 0.5,
        implementationCost: excessQuantity * item.unitCost * 0.1,
        netBenefit: excessQuantity * item.unitCost * 0.4
      });
    }
    
    return recommendations;
  }
  
  private assessOverstockRisk(excessValue: number, trend: string): 'low' | 'medium' | 'high' {
    if (excessValue > 10000 || trend === 'declining') return 'high';
    if (excessValue > 5000) return 'medium';
    return 'low';
  }
  
  private async calculateOverstockFinancialImpact(items: any[]): Promise<any> {
    const totalExcessValue = items.reduce((sum, item) => sum + item.excessValue, 0);
    const monthlyCarryingCost = totalExcessValue * 0.02; // 2% monthly
    const annualCarryingCost = totalExcessValue * 0.25; // 25% annual
    const opportunityCost = annualCarryingCost * 0.15; // 15% opportunity cost
    const potentialLiquidationValue = totalExcessValue * 0.4; // 40% recovery
    const netLossIfHeld = annualCarryingCost + opportunityCost;
    
    return {
      monthlyCarryingCost,
      annualCarryingCost,
      opportunityCost,
      potentialLiquidationValue,
      netLossIfHeld
    };
  }
  
  private generateOverstockActionPlan(items: any[]): any[] {
    return [
      {
        action: 'Clearance Sale',
        timeline: '2 weeks',
        responsible: 'Inventory Manager',
        expectedSavings: 5000,
        status: 'planned'
      }
    ];
  }
}
