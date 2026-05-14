import { Warehouse, InventoryItem, StockTransfer, IWarehouse, IInventoryItem, IStockTransfer } from '../models/Inventory';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { User } from '../models/User';

export interface WarehouseOverview {
  warehouse: IWarehouse;
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  expiringItems: number;
  damagedItems: number;
  pendingTransfers: number;
  recentActivity: Array<{
    date: Date;
    type: string;
    description: string;
    quantity?: number;
    value?: number;
  }>;
  performance: {
    orderAccuracy: number;
    inventoryAccuracy: number;
    turnoverRate: number;
    spaceUtilization: number;
  };
}

export interface InventoryDistribution {
  productId: string;
  productName: string;
  sku: string;
  totalQuantity: number;
  totalValue: number;
  warehouses: Array<{
    warehouseId: string;
    warehouseName: string;
    quantity: number;
    value: number;
    percentage: number;
    lastUpdated: Date;
  }>;
  optimalDistribution: Array<{
    warehouseId: string;
    recommendedQuantity: number;
    currentQuantity: number;
    adjustment: number;
    reason: string;
  }>;
}

export interface TransferRecommendation {
  productId: string;
  productName: string;
  sku: string;
  fromWarehouseId: string;
  fromWarehouseName: string;
  toWarehouseId: string;
  toWarehouseName: string;
  recommendedQuantity: number;
  reason: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedCost: number;
  estimatedSavings: number;
  demandForecast: number;
  currentStock: {
    from: number;
    to: number;
  };
}

export interface WarehousePerformance {
  warehouseId: string;
  warehouseName: string;
  period: string;
  metrics: {
    inventoryAccuracy: number;
    orderFulfillmentRate: number;
    averagePickTime: number; // minutes
    averagePackTime: number; // minutes
    spaceUtilization: number;
    turnoverRate: number;
    carryingCost: number;
    stockoutRate: number;
    returnRate: number;
  };
  trends: {
    accuracyTrend: 'improving' | 'stable' | 'declining';
    efficiencyTrend: 'improving' | 'stable' | 'declining';
    costTrend: 'improving' | 'stable' | 'declining';
  };
  comparisons: {
    vsLastPeriod: number; // percentage change
    vsTarget: number; // percentage of target
    vsAverage: number; // percentage of warehouse average
  };
  recommendations: Array<{
    area: string;
    suggestion: string;
    impact: 'low' | 'medium' | 'high';
    effort: 'low' | 'medium' | 'high';
    priority: number;
  }>;
}

export interface StockBalanceAnalysis {
  warehouseId: string;
  warehouseName: string;
  analysisDate: Date;
  summary: {
    totalProducts: number;
    totalStockValue: number;
    overstockedItems: number;
    understockedItems: number;
    optimalItems: number;
    deadStockItems: number;
    slowMovingItems: number;
  };
  categories: Array<{
    categoryName: string;
    totalItems: number;
    totalValue: number;
    stockStatus: {
      overstocked: number;
      understocked: number;
      optimal: number;
    };
    turnoverRate: number;
    daysOfSupply: number;
  }>;
  recommendations: Array<{
    type: 'transfer' | 'reorder' | 'promotion' | 'writeoff';
    priority: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    items: Array<{
      productId: string;
      sku: string;
      currentStock: number;
      recommendedAction: string;
      potentialSavings: number;
    }>;
  }>;
}

export interface MultiWarehouseReport {
  reportDate: Date;
  period: string;
  totalWarehouses: number;
  summary: {
    totalInventoryValue: number;
    totalItems: number;
    averageAccuracy: number;
    totalSpaceUtilization: number;
    totalTransfers: number;
    transferValue: number;
  };
  warehouseBreakdown: Array<{
    warehouseId: string;
    warehouseName: string;
    totalValue: number;
    itemCount: number;
    accuracy: number;
    utilization: number;
    performance: 'excellent' | 'good' | 'average' | 'poor';
  }>;
  topPerformers: Array<{
    warehouseId: string;
    warehouseName: string;
    score: number;
    strengths: string[];
  }>;
  issues: Array<{
    warehouseId: string;
    warehouseName: string;
    issue: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    recommendation: string;
  }>;
  recommendations: Array<{
    category: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    action: string;
    expectedImpact: string;
    timeframe: string;
  }>;
}

export class MultiWarehouseService {
  // Get comprehensive overview of all warehouses
  async getAllWarehousesOverview(): Promise<WarehouseOverview[]> {
    const warehouses = await Warehouse.find({ status: 'active' }).sort({ name: 1 });
    
    const overviews: WarehouseOverview[] = [];
    
    for (const warehouse of warehouses) {
      const inventory = await InventoryItem.find({ warehouseId: warehouse.warehouseId });
      const pendingTransfers = await StockTransfer.find({
        $or: [
          { fromWarehouseId: warehouse.warehouseId, status: { $in: ['pending', 'approved', 'in_transit'] } },
          { toWarehouseId: warehouse.warehouseId, status: { $in: ['pending', 'approved', 'in_transit'] } }
        ]
      });

      const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);
      const totalValue = inventory.reduce((sum, item) => sum + item.totalValue, 0);
      const lowStockItems = inventory.filter(item => item.quantity <= item.reorderPoint).length;
      const outOfStockItems = inventory.filter(item => item.quantity === 0).length;
      const expiringItems = inventory.filter(item => 
        item.storage.expiryDate && 
        item.storage.expiryDate <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      ).length;
      const damagedItems = inventory.filter(item => item.status === 'damaged').length;

      // Get recent activity
      const recentActivity = inventory
        .flatMap(item => item.tracking.movementHistory)
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 10)
        .map(movement => ({
          date: movement.date,
          type: movement.type,
          description: movement.reason,
          quantity: movement.quantity,
          value: movement.quantity * inventory.find(item => 
            item.tracking.movementHistory.some(m => m.date === movement.date)
          )?.unitCost || 0
        }));

      const spaceUtilization = warehouse.capacity.usedSpace / warehouse.capacity.totalSpace * 100;

      overviews.push({
        warehouse,
        totalItems,
        totalValue,
        lowStockItems,
        outOfStockItems,
        expiringItems,
        damagedItems,
        pendingTransfers: pendingTransfers.length,
        recentActivity,
        performance: {
          orderAccuracy: warehouse.performance.orderAccuracy,
          inventoryAccuracy: warehouse.performance.inventoryAccuracy,
          turnoverRate: warehouse.performance.turnoverRate,
          spaceUtilization
        }
      });
    }

    return overviews;
  }

  // Get inventory distribution across warehouses for a specific product
  async getProductDistribution(productId: string): Promise<InventoryDistribution> {
    const product = await Product.findOne({ productId });
    if (!product) {
      throw new Error('Product not found');
    }

    const inventory = await InventoryItem.find({ productId });
    const warehouses = await Warehouse.find({ status: 'active' });

    const totalQuantity = inventory.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = inventory.reduce((sum, item) => sum + item.totalValue, 0);

    const warehouseDistribution = warehouses.map(warehouse => {
      const warehouseInventory = inventory.find(item => item.warehouseId === warehouse.warehouseId);
      const quantity = warehouseInventory?.quantity || 0;
      const value = warehouseInventory?.totalValue || 0;
      const percentage = totalQuantity > 0 ? (quantity / totalQuantity) * 100 : 0;

      return {
        warehouseId: warehouse.warehouseId,
        warehouseName: warehouse.name,
        quantity,
        value,
        percentage,
        lastUpdated: warehouseInventory?.updatedAt || new Date()
      };
    });

    // Calculate optimal distribution based on demand forecasts
    const optimalDistribution = await this.calculateOptimalDistribution(productId, warehouses);

    return {
      productId,
      productName: product.name,
      sku: product.sku,
      totalQuantity,
      totalValue,
      warehouses: warehouseDistribution,
      optimalDistribution
    };
  }

  // Get transfer recommendations between warehouses
  async getTransferRecommendations(warehouseId?: string): Promise<TransferRecommendation[]> {
    const recommendations: TransferRecommendation[] = [];
    const warehouses = await Warehouse.find({ status: 'active' });
    
    let targetWarehouses = warehouses;
    if (warehouseId) {
      targetWarehouses = warehouses.filter(w => w.warehouseId === warehouseId);
    }

    for (const warehouse of targetWarehouses) {
      const inventory = await InventoryItem.find({ 
        warehouseId: warehouse.warehouseId,
        status: 'active'
      });

      for (const item of inventory) {
        // Check for overstock situations
        if (item.quantity > item.maximumStock * 1.2) {
          const excessQuantity = item.quantity - item.maximumStock;
          
          // Find warehouses that need this item
          const needyWarehouses = await InventoryItem.find({
            productId: item.productId,
            warehouseId: { $ne: warehouse.warehouseId },
            quantity: { $lt: '$reorderPoint' }
          }).populate('warehouseId');

          for (const needyWarehouse of needyWarehouses) {
            const neededQuantity = Math.min(
              excessQuantity,
              item.reorderPoint - needyWarehouse.quantity
            );

            if (neededQuantity > 0) {
              const targetWarehouse = warehouses.find(w => 
                w.warehouseId === needyWarehouse.warehouseId
              );

              recommendations.push({
                productId: item.productId,
                productName: (await Product.findOne({ productId: item.productId }))?.name || 'Unknown',
                sku: item.sku,
                fromWarehouseId: warehouse.warehouseId,
                fromWarehouseName: warehouse.name,
                toWarehouseId: needyWarehouse.warehouseId,
                toWarehouseName: targetWarehouse?.name || 'Unknown',
                recommendedQuantity: neededQuantity,
                reason: 'Overstock to understock transfer',
                priority: neededQuantity > item.reorderPoint ? 'high' : 'medium',
                estimatedCost: neededQuantity * item.unitCost * 0.05, // 5% transfer cost
                estimatedSavings: neededQuantity * item.unitCost * 0.1, // 10% savings
                demandForecast: item.quantity / 30, // daily demand estimate
                currentStock: {
                  from: item.quantity,
                  to: needyWarehouse.quantity
                }
              });
            }
          }
        }
      }
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // Create stock transfer
  async createStockTransfer(transferData: {
    fromWarehouseId: string;
    toWarehouseId: string;
    items: Array<{
      itemId: string;
      quantity: number;
      reason: string;
    }>;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    requestedBy: string;
    expectedDeliveryDate?: Date;
    shipping?: {
      method: string;
      carrier: string;
      specialInstructions?: string;
    };
  }): Promise<IStockTransfer> {
    const transferId = `TRF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Validate warehouses
    const fromWarehouse = await Warehouse.findOne({ warehouseId: transferData.fromWarehouseId });
    const toWarehouse = await Warehouse.findOne({ warehouseId: transferData.toWarehouseId });
    
    if (!fromWarehouse || !toWarehouse) {
      throw new Error('Invalid warehouse(s)');
    }

    // Validate items and calculate values
    const items = [];
    let totalValue = 0;
    let totalItems = 0;

    for (const itemData of transferData.items) {
      const inventoryItem = await InventoryItem.findOne({ 
        itemId: itemData.itemId,
        warehouseId: transferData.fromWarehouseId
      });

      if (!inventoryItem) {
        throw new Error(`Inventory item ${itemData.itemId} not found in source warehouse`);
      }

      if (inventoryItem.quantity < itemData.quantity) {
        throw new Error(`Insufficient quantity for item ${itemData.itemId}`);
      }

      const itemValue = itemData.quantity * inventoryItem.unitCost;
      totalValue += itemValue;
      totalItems += itemData.quantity;

      items.push({
        itemId: itemData.itemId,
        productId: inventoryItem.productId,
        sku: inventoryItem.sku,
        quantity: itemData.quantity,
        unitCost: inventoryItem.unitCost,
        totalValue: itemValue,
        reason: itemData.reason,
        batchNumber: inventoryItem.batchNumber,
        expiryDate: inventoryItem.storage.expiryDate
      });
    }

    const transfer = new StockTransfer({
      transferId,
      fromWarehouseId: transferData.fromWarehouseId,
      toWarehouseId: transferData.toWarehouseId,
      status: 'pending',
      priority: transferData.priority,
      requestedBy: transferData.requestedBy,
      transferDate: new Date(),
      expectedDeliveryDate: transferData.expectedDeliveryDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      items,
      shipping: {
        method: transferData.shipping?.method || 'standard',
        carrier: transferData.shipping?.carrier || 'internal',
        cost: totalValue * 0.05, // 5% of total value
        insurance: totalValue > 1000,
        specialInstructions: transferData.shipping?.specialInstructions
      },
      approval: {
        requestedAt: new Date()
      },
      totalValue,
      totalItems
    });

    return await transfer.save();
  }

  // Get warehouse performance metrics
  async getWarehousePerformance(warehouseId: string, period: string = '30d'): Promise<WarehousePerformance> {
    const warehouse = await Warehouse.findOne({ warehouseId });
    if (!warehouse) {
      throw new Error('Warehouse not found');
    }

    const inventory = await InventoryItem.find({ warehouseId });
    const transfers = await StockTransfer.find({
      $or: [
        { fromWarehouseId: warehouseId },
        { toWarehouseId: warehouseId }
      ]
    });

    // Calculate metrics
    const totalValue = inventory.reduce((sum, item) => sum + item.totalValue, 0);
    const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);
    const spaceUtilization = warehouse.capacity.usedSpace / warehouse.capacity.totalSpace * 100;
    
    // Calculate accuracy based on recent cycle counts
    const recentCounts = await this.getRecentCycleCounts(warehouseId);
    const inventoryAccuracy = recentCounts.length > 0 
      ? recentCounts.reduce((sum, count) => sum + count.summary.accuracyRate, 0) / recentCounts.length
      : warehouse.performance.inventoryAccuracy;

    // Calculate turnover rate
    const turnoverRate = this.calculateTurnoverRate(inventory, period);

    // Calculate carrying cost (estimated as 25% of inventory value annually)
    const carryingCost = totalValue * 0.25 * (parseInt(period) / 365);

    // Calculate stockout rate
    const stockoutItems = inventory.filter(item => item.quantity === 0).length;
    const stockoutRate = inventory.length > 0 ? (stockoutItems / inventory.length) * 100 : 0;

    // Calculate return rate (from orders)
    const returnRate = await this.calculateReturnRate(warehouseId, period);

    const metrics = {
      inventoryAccuracy,
      orderFulfillmentRate: warehouse.performance.orderAccuracy,
      averagePickTime: warehouse.performance.pickRate > 0 ? 60 / warehouse.performance.pickRate : 0,
      averagePackTime: warehouse.performance.packRate > 0 ? 60 / warehouse.performance.packRate : 0,
      spaceUtilization,
      turnoverRate,
      carryingCost,
      stockoutRate,
      returnRate
    };

    // Generate recommendations
    const recommendations = this.generatePerformanceRecommendations(warehouse, metrics);

    return {
      warehouseId,
      warehouseName: warehouse.name,
      period,
      metrics,
      trends: {
        accuracyTrend: 'stable', // Would need historical data for accurate calculation
        efficiencyTrend: 'stable',
        costTrend: 'stable'
      },
      comparisons: {
        vsLastPeriod: 0, // Would need historical data
        vsTarget: 0, // Would need target data
        vsAverage: 0 // Would need comparison with other warehouses
      },
      recommendations
    };
  }

  // Analyze stock balance across warehouses
  async analyzeStockBalance(warehouseId?: string): Promise<StockBalanceAnalysis[]> {
    const warehouses = warehouseId 
      ? await Warehouse.find({ warehouseId, status: 'active' })
      : await Warehouse.find({ status: 'active' });

    const analyses: StockBalanceAnalysis[] = [];

    for (const warehouse of warehouses) {
      const inventory = await InventoryItem.find({ 
        warehouseId: warehouse.warehouseId,
        status: 'active'
      });

      const totalProducts = inventory.length;
      const totalStockValue = inventory.reduce((sum, item) => sum + item.totalValue, 0);

      // Categorize items by stock status
      const overstockedItems = inventory.filter(item => item.quantity > item.maximumStock).length;
      const understockedItems = inventory.filter(item => item.quantity <= item.reorderPoint).length;
      const optimalItems = inventory.filter(item => 
        item.quantity > item.reorderPoint && item.quantity <= item.maximumStock
      ).length;
      
      // Identify dead stock (no movement in 90 days)
      const deadStockItems = inventory.filter(item => 
        item.tracking.lastMovementDate < new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      ).length;

      // Identify slow moving items (low turnover)
      const slowMovingItems = inventory.filter(item => {
        const daysSinceLastMovement = (Date.now() - item.tracking.lastMovementDate.getTime()) / (24 * 60 * 60 * 1000);
        return daysSinceLastMovement > 30 && item.quantity > item.reorderPoint * 2;
      }).length;

      // Analyze by category
      const categories = await this.analyzeCategories(warehouse.warehouseId);

      // Generate recommendations
      const recommendations = await this.generateBalanceRecommendations(warehouse.warehouseId, inventory);

      analyses.push({
        warehouseId: warehouse.warehouseId,
        warehouseName: warehouse.name,
        analysisDate: new Date(),
        summary: {
          totalProducts,
          totalStockValue,
          overstockedItems,
          understockedItems,
          optimalItems,
          deadStockItems,
          slowMovingItems
        },
        categories,
        recommendations
      });
    }

    return analyses;
  }

  // Generate comprehensive multi-warehouse report
  async generateMultiWarehouseReport(period: string = '30d'): Promise<MultiWarehouseReport> {
    const warehouses = await Warehouse.find({ status: 'active' });
    const overviews = await this.getAllWarehousesOverview();
    const performances = await Promise.all(
      warehouses.map(w => this.getWarehousePerformance(w.warehouseId, period))
    );

    const totalInventoryValue = overviews.reduce((sum, overview) => sum + overview.totalValue, 0);
    const totalItems = overviews.reduce((sum, overview) => sum + overview.totalItems, 0);
    const averageAccuracy = overviews.reduce((sum, overview) => sum + overview.performance.inventoryAccuracy, 0) / overviews.length;
    const totalSpaceUtilization = overviews.reduce((sum, overview) => sum + overview.performance.spaceUtilization, 0) / overviews.length;

    const transfers = await StockTransfer.find({
      transferDate: { 
        $gte: new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000)
      }
    });

    const totalTransfers = transfers.length;
    const transferValue = transfers.reduce((sum, transfer) => sum + transfer.totalValue, 0);

    // Warehouse breakdown with performance rating
    const warehouseBreakdown = overviews.map(overview => {
      const performance = performances.find(p => p.warehouseId === overview.warehouse.warehouseId);
      const score = this.calculateWarehouseScore(overview, performance);
      
      let rating: 'excellent' | 'good' | 'average' | 'poor';
      if (score >= 90) rating = 'excellent';
      else if (score >= 75) rating = 'good';
      else if (score >= 60) rating = 'average';
      else rating = 'poor';

      return {
        warehouseId: overview.warehouse.warehouseId,
        warehouseName: overview.warehouse.name,
        totalValue: overview.totalValue,
        itemCount: overview.totalItems,
        accuracy: overview.performance.inventoryAccuracy,
        utilization: overview.performance.spaceUtilization,
        performance: rating
      };
    });

    // Identify top performers
    const topPerformers = warehouseBreakdown
      .sort((a, b) => {
        const scoreA = this.calculateWarehouseScore(
          overviews.find(o => o.warehouse.warehouseId === a.warehouseId),
          performances.find(p => p.warehouseId === a.warehouseId)
        );
        const scoreB = this.calculateWarehouseScore(
          overviews.find(o => o.warehouse.warehouseId === b.warehouseId),
          performances.find(p => p.warehouseId === b.warehouseId)
        );
        return scoreB - scoreA;
      })
      .slice(0, 3)
      .map(warehouse => {
        const overview = overviews.find(o => o.warehouse.warehouseId === warehouse.warehouseId);
        return {
          warehouseId: warehouse.warehouseId,
          warehouseName: warehouse.warehouseName,
          score: this.calculateWarehouseScore(overview, performances.find(p => p.warehouseId === warehouse.warehouseId)),
          strengths: this.identifyStrengths(warehouse)
        };
      });

    // Identify issues
    const issues = this.identifyWarehouseIssues(overviews, performances);

    // Generate recommendations
    const recommendations = this.generateSystemRecommendations(overviews, performances, transfers);

    return {
      reportDate: new Date(),
      period,
      totalWarehouses: warehouses.length,
      summary: {
        totalInventoryValue,
        totalItems,
        averageAccuracy,
        totalSpaceUtilization,
        totalTransfers,
        transferValue
      },
      warehouseBreakdown,
      topPerformers,
      issues,
      recommendations
    };
  }

  // Helper methods
  private async calculateOptimalDistribution(productId: string, warehouses: IWarehouse[]) {
    // Simplified optimal distribution calculation
    // In a real implementation, this would use demand forecasts, shipping costs, and constraints
    
    const product = await Product.findOne({ productId });
    const inventory = await InventoryItem.find({ productId });
    const totalDemand = 100; // Placeholder - would come from demand forecast
    
    return warehouses.map(warehouse => {
      const currentInventory = inventory.find(item => item.warehouseId === warehouse.warehouseId);
      const currentQuantity = currentInventory?.quantity || 0;
      
      // Simple proportional distribution based on warehouse capacity
      const capacityRatio = warehouse.capacity.maxProducts / warehouses.reduce((sum, w) => sum + w.capacity.maxProducts, 0);
      const recommendedQuantity = Math.floor(totalDemand * capacityRatio);
      const adjustment = recommendedQuantity - currentQuantity;
      
      return {
        warehouseId: warehouse.warehouseId,
        recommendedQuantity,
        currentQuantity,
        adjustment,
        reason: adjustment > 0 ? 'Increase stock to meet demand' : 'Reduce excess stock'
      };
    });
  }

  private async getRecentCycleCounts(warehouseId: string) {
    // Placeholder - would query actual cycle count data
    return [];
  }

  private calculateTurnoverRate(inventory: IInventoryItem[], period: string) {
    // Simplified turnover calculation
    const days = parseInt(period);
    const totalValue = inventory.reduce((sum, item) => sum + item.totalValue, 0);
    
    // Would need actual sales data for accurate calculation
    const estimatedAnnualSales = totalValue * 2; // Placeholder
    return estimatedAnnualSales / totalValue;
  }

  private async calculateReturnRate(warehouseId: string, period: string) {
    // Placeholder - would query actual return data
    return 2.5; // 2.5% return rate
  }

  private generatePerformanceRecommendations(warehouse: IWarehouse, metrics: any) {
    const recommendations = [];
    
    if (metrics.inventoryAccuracy < 95) {
      recommendations.push({
        area: 'Inventory Accuracy',
        suggestion: 'Implement more frequent cycle counting and improve receiving processes',
        impact: 'high' as const,
        effort: 'medium' as const,
        priority: 1
      });
    }
    
    if (metrics.spaceUtilization > 85) {
      recommendations.push({
        area: 'Space Utilization',
        suggestion: 'Optimize layout and consider vertical storage solutions',
        impact: 'medium' as const,
        effort: 'high' as const,
        priority: 2
      });
    }
    
    if (metrics.turnoverRate < 4) {
      recommendations.push({
        area: 'Inventory Turnover',
        suggestion: 'Review slow-moving items and implement clearance strategies',
        impact: 'high' as const,
        effort: 'medium' as const,
        priority: 1
      });
    }
    
    return recommendations;
  }

  private async analyzeCategories(warehouseId: string) {
    // Placeholder - would analyze actual category data
    return [];
  }

  private async generateBalanceRecommendations(warehouseId: string, inventory: IInventoryItem[]) {
    const recommendations = [];
    
    // Transfer recommendations
    const overstocked = inventory.filter(item => item.quantity > item.maximumStock * 1.2);
    if (overstocked.length > 0) {
      recommendations.push({
        type: 'transfer' as const,
        priority: 'medium' as const,
        description: `Transfer excess stock from ${overstocked.length} overstocked items`,
        items: overstocked.slice(0, 5).map(item => ({
          productId: item.productId,
          sku: item.sku,
          currentStock: item.quantity,
          recommendedAction: 'Transfer to other warehouses',
          potentialSavings: (item.quantity - item.maximumStock) * item.unitCost * 0.1
        }))
      });
    }
    
    return recommendations;
  }

  private calculateWarehouseScore(overview: any, performance: any) {
    if (!overview || !performance) return 0;
    
    const accuracyWeight = 0.3;
    const utilizationWeight = 0.2;
    const turnoverWeight = 0.25;
    const fulfillmentWeight = 0.25;
    
    const accuracyScore = overview.performance.inventoryAccuracy;
    const utilizationScore = Math.min(overview.performance.spaceUtilization, 100);
    const turnoverScore = Math.min(performance.metrics.turnoverRate * 10, 100);
    const fulfillmentScore = performance.metrics.orderFulfillmentRate;
    
    return (
      accuracyScore * accuracyWeight +
      utilizationScore * utilizationWeight +
      turnoverScore * turnoverWeight +
      fulfillmentScore * fulfillmentWeight
    );
  }

  private identifyStrengths(warehouse: any) {
    const strengths = [];
    
    if (warehouse.accuracy >= 98) strengths.push('High inventory accuracy');
    if (warehouse.utilization >= 80 && warehouse.utilization <= 85) strengths.push('Optimal space utilization');
    if (warehouse.performance === 'excellent') strengths.push('Overall excellent performance');
    
    return strengths;
  }

  private identifyWarehouseIssues(overviews: WarehouseOverview[], performances: WarehousePerformance[]) {
    const issues = [];
    
    overviews.forEach(overview => {
      const performance = performances.find(p => p.warehouseId === overview.warehouse.warehouseId);
      
      if (overview.performance.inventoryAccuracy < 90) {
        issues.push({
          warehouseId: overview.warehouse.warehouseId,
          warehouseName: overview.warehouse.name,
          issue: 'Low inventory accuracy',
          severity: 'high' as const,
          recommendation: 'Implement cycle counting program and improve receiving processes'
        });
      }
      
      if (overview.outOfStockItems > overview.totalItems * 0.1) {
        issues.push({
          warehouseId: overview.warehouse.warehouseId,
          warehouseName: overview.warehouse.name,
          issue: 'High out-of-stock rate',
          severity: 'medium' as const,
          recommendation: 'Review reorder points and improve demand forecasting'
        });
      }
    });
    
    return issues;
  }

  private generateSystemRecommendations(overviews: WarehouseOverview[], performances: WarehousePerformance[], transfers: any[]) {
    const recommendations = [];
    
    const averageAccuracy = overviews.reduce((sum, o) => sum + o.performance.inventoryAccuracy, 0) / overviews.length;
    if (averageAccuracy < 95) {
      recommendations.push({
        category: 'Inventory Management',
        priority: 'high' as const,
        action: 'Implement standardized cycle counting across all warehouses',
        expectedImpact: 'Improve inventory accuracy by 3-5%',
        timeframe: '3 months'
      });
    }
    
    const totalTransfers = transfers.length;
    if (totalTransfers > overviews.length * 10) { // More than 10 transfers per warehouse
      recommendations.push({
        category: 'Stock Distribution',
        priority: 'medium' as const,
        action: 'Optimize stock allocation to reduce inter-warehouse transfers',
        expectedImpact: 'Reduce transfer costs by 15-20%',
        timeframe: '6 months'
      });
    }
    
    return recommendations;
  }
}
