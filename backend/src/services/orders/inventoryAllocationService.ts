import { Order, IOrder } from '../../models/Order';
import { Inventory } from '../../models/Inventory';
import { Product } from '../../models/Product';
import { Location } from '../../models/Location';

export interface AllocationRequest {
  orderId: string;
  allocations: Array<{
    orderItemId: string;
    productId: string;
    quantity: number;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    preferences?: {
      locationId?: string;
      batchNumber?: string;
      expiryDate?: Date;
      fifo?: boolean; // First In, First Out
      nearest?: boolean; // Nearest location
      cheapest?: boolean; // Lowest cost location
    };
  }>;
  strategy: 'fifo' | 'lifo' | 'nearest' | 'cheapest' | 'balanced' | 'custom';
  reserveOnly?: boolean; // Only reserve, don't allocate
  allowPartial?: boolean; // Allow partial allocation
  allowSubstitution?: boolean; // Allow product substitution
  bypassReservations?: boolean; // Bypass existing reservations
  metadata?: {
    employeeId?: string;
    locationId?: string;
    reason?: string;
    notes?: string;
  };
}

export interface AllocationResult {
  success: boolean;
  orderId: string;
  allocationId: string;
  status: 'completed' | 'partial' | 'failed' | 'pending';
  allocations: Array<{
    orderItemId: string;
    productId: string;
    requestedQuantity: number;
    allocatedQuantity: number;
    reservedQuantity: number;
    locations: Array<{
      locationId: string;
      locationName: string;
      quantity: number;
      batchNumber?: string;
      expiryDate?: Date;
      cost: number;
      distance?: number;
    }>;
    status: 'allocated' | 'partial' | 'failed' | 'substituted';
    reason?: string;
    substitutions?: Array<{
      productId: string;
      productName: string;
      quantity: number;
      reason: string;
    }>;
  }>;
  summary: {
    totalRequested: number;
    totalAllocated: number;
    totalReserved: number;
    allocationRate: number;
    totalValue: number;
    totalCost: number;
    savings: number;
  };
  issues: Array<{
    type: 'insufficient_stock' | 'location_constraint' | 'batch_expiry' | 'reservation_conflict';
    productId: string;
    quantity: number;
    description: string;
    suggestedAction: string;
  }>;
  recommendations: Array<{
    type: 'reorder' | 'transfer' | 'substitution' | 'backorder';
    priority: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    estimatedImpact: string;
  }>;
  metadata: {
    processingTime: number;
    strategy: string;
    algorithm: string;
    processedBy: string;
    processedAt: Date;
  };
}

export interface InventoryReservation {
  reservationId: string;
  orderId: string;
  orderItemId: string;
  productId: string;
  quantity: number;
  locations: Array<{
    locationId: string;
    quantity: number;
    batchNumber?: string;
    expiryDate?: Date;
  }>;
  status: 'active' | 'expired' | 'fulfilled' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  expiresAt: Date;
  createdAt: Date;
  metadata: {
    employeeId?: string;
    reason?: string;
    notes?: string;
  };
}

export interface AllocationStrategy {
  strategyId: string;
  name: string;
  description: string;
  type: 'fifo' | 'lifo' | 'nearest' | 'cheapest' | 'balanced' | 'custom';
  rules: Array<{
    priority: number;
    condition: string;
    action: string;
    parameters?: Record<string, any>;
  }>;
  preferences: {
    prioritizeExistingReservations: boolean;
    allowCrossLocationAllocation: boolean;
    considerBatchExpiry: boolean;
    considerShippingCosts: boolean;
    maximizeAllocationRate: boolean;
    minimizeCosts: boolean;
  };
  constraints: {
    maxDistance?: number; // km
    maxAge?: number; // days for batch expiry
    minStockLevel?: number;
    excludedLocations?: string[];
    preferredLocations?: string[];
  };
  customLogic?: {
    algorithm: string;
    parameters: Record<string, any>;
  };
  active: boolean;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    version: number;
  };
}

export interface AllocationAnalytics {
  summary: {
    totalAllocations: number;
    totalQuantity: number;
    totalValue: number;
    averageAllocationRate: number;
    processingTime: number;
  };
  byStrategy: Record<string, {
    allocations: number;
    quantity: number;
    value: number;
    successRate: number;
    averageProcessingTime: number;
  }>;
  byProduct: Array<{
    productId: string;
    productName: string;
    allocations: number;
    quantity: number;
    allocationRate: number;
    averageProcessingTime: number;
    topLocations: Array<{
      locationId: string;
      locationName: string;
      quantity: number;
      percentage: number;
    }>;
  }>;
  byLocation: Array<{
    locationId: string;
    locationName: string;
    allocations: number;
    quantity: number;
    value: number;
    utilizationRate: number;
    averageDistance: number;
  }>;
  performance: {
    allocationRates: Array<{
      date: string;
      rate: number;
      target: number;
    }>;
    processingTimes: Array<{
      date: string;
      averageTime: number;
      target: number;
    }>;
    errorRates: Array<{
      date: string;
      rate: number;
      errors: Array<{
        type: string;
        count: number;
      }>;
    }>;
  };
  insights: Array<{
    type: 'efficiency' | 'cost' | 'availability' | 'process';
    title: string;
    description: string;
    impact: string;
    actionable: boolean;
    recommendations?: string[];
  }>;
}

export class InventoryAllocationService {
  private strategies: Map<string, AllocationStrategy> = new Map();
  private reservations: Map<string, InventoryReservation> = new Map();

  constructor() {
    this.initializeAllocationStrategies();
  }

  // Process inventory allocation
  async processAllocation(request: AllocationRequest): Promise<AllocationResult> {
    const startTime = Date.now();
    
    const result: AllocationResult = {
      success: false,
      orderId: request.orderId,
      allocationId: this.generateAllocationId(),
      status: 'failed',
      allocations: [],
      summary: {
        totalRequested: 0,
        totalAllocated: 0,
        totalReserved: 0,
        allocationRate: 0,
        totalValue: 0,
        totalCost: 0,
        savings: 0
      },
      issues: [],
      recommendations: [],
      metadata: {
        processingTime: 0,
        strategy: request.strategy,
        algorithm: 'standard',
        processedBy: request.metadata?.employeeId || 'system',
        processedAt: new Date()
      }
    };

    try {
      // Validate order
      const order = await this.validateOrder(request.orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Get allocation strategy
      const strategy = this.getAllocationStrategy(request.strategy);

      // Process each allocation request
      let totalRequested = 0;
      let totalAllocated = 0;
      let totalReserved = 0;

      for (const allocation of request.allocations) {
        totalRequested += allocation.quantity;

        const allocationResult = await this.allocateItem(
          order,
          allocation,
          strategy,
          request
        );

        result.allocations.push(allocationResult);
        totalAllocated += allocationResult.allocatedQuantity;
        totalReserved += allocationResult.reservedQuantity;

        // Collect issues and recommendations
        if (allocationResult.status === 'failed' || allocationResult.status === 'partial') {
          result.issues.push(...await this.identifyAllocationIssues(allocation, allocationResult));
          result.recommendations.push(...await this.generateAllocationRecommendations(allocation, allocationResult));
        }
      }

      // Calculate summary
      result.summary.totalRequested = totalRequested;
      result.summary.totalAllocated = totalAllocated;
      result.summary.totalReserved = totalReserved;
      result.summary.allocationRate = totalRequested > 0 ? totalAllocated / totalRequested : 0;
      result.summary.totalValue = await this.calculateAllocationValue(result.allocations);
      result.summary.totalCost = await this.calculateAllocationCost(result.allocations);
      result.summary.savings = await this.calculateAllocationSavings(result.allocations, strategy);

      // Determine overall status
      if (totalAllocated === totalRequested) {
        result.status = 'completed';
        result.success = true;
      } else if (totalAllocated > 0) {
        result.status = 'partial';
        result.success = request.allowPartial || false;
      } else {
        result.status = 'failed';
        result.success = false;
      }

      // Update order with allocation information
      if (result.success || (request.allowPartial && totalAllocated > 0)) {
        await this.updateOrderAllocation(order, result);
      }

      result.metadata.processingTime = Date.now() - startTime;

      return result;

    } catch (error) {
      result.status = 'failed';
      result.success = false;
      result.issues.push({
        type: 'system_error',
        productId: '',
        quantity: 0,
        description: error.message,
        suggestedAction: 'Contact system administrator'
      });
      result.metadata.processingTime = Date.now() - startTime;
      return result;
    }
  }

  // Allocate individual item
  private async allocateItem(
    order: IOrder,
    allocation: any,
    strategy: AllocationStrategy,
    request: AllocationRequest
  ): Promise<any> {
    const result = {
      orderItemId: allocation.orderItemId,
      productId: allocation.productId,
      requestedQuantity: allocation.quantity,
      allocatedQuantity: 0,
      reservedQuantity: 0,
      locations: [],
      status: 'failed' as 'allocated' | 'partial' | 'failed' | 'substituted',
      reason: '',
      substitutions: []
    };

    try {
      // Get available inventory
      const availableInventory = await this.getAvailableInventory(
        allocation.productId,
        allocation.preferences,
        strategy
      );

      if (availableInventory.length === 0) {
        result.reason = 'No inventory available';
        return result;
      }

      // Apply allocation strategy
      const allocationPlan = await this.applyAllocationStrategy(
        availableInventory,
        allocation,
        strategy,
        order
      );

      if (allocationPlan.length === 0) {
        result.reason = 'Allocation strategy could not find suitable inventory';
        return result;
      }

      // Execute allocation
      let remainingQuantity = allocation.quantity;
      let totalAllocated = 0;
      let totalReserved = 0;

      for (const plan of allocationPlan) {
        if (remainingQuantity <= 0) break;

        const allocateQuantity = Math.min(remainingQuantity, plan.availableQuantity);

        if (request.reserveOnly) {
          // Create reservation
          await this.createReservation(
            order._id.toString(),
            allocation.orderItemId,
            allocation.productId,
            allocateQuantity,
            plan.locationId,
            plan.batchNumber,
            plan.expiryDate,
            allocation.priority
          );
          totalReserved += allocateQuantity;
        } else {
          // Allocate inventory
          await this.allocateInventory(
            allocation.productId,
            plan.locationId,
            allocateQuantity,
            plan.batchNumber
          );
          totalAllocated += allocateQuantity;
        }

        result.locations.push({
          locationId: plan.locationId,
          locationName: plan.locationName,
          quantity: allocateQuantity,
          batchNumber: plan.batchNumber,
          expiryDate: plan.expiryDate,
          cost: plan.cost,
          distance: plan.distance
        });

        remainingQuantity -= allocateQuantity;
      }

      result.allocatedQuantity = totalAllocated;
      result.reservedQuantity = totalReserved;

      // Determine status
      if (totalAllocated + totalReserved === allocation.quantity) {
        result.status = 'allocated';
      } else if (totalAllocated + totalReserved > 0) {
        result.status = 'partial';
        result.reason = `Insufficient inventory - allocated ${totalAllocated + totalReserved} of ${allocation.quantity}`;
      }

      // Check for substitutions if allowed and partial allocation
      if (request.allowSubstitution && result.status === 'partial') {
        const substitutions = await this.findSubstitutions(allocation, remainingQuantity);
        result.substitutions = substitutions;
      }

      return result;

    } catch (error) {
      result.reason = error.message;
      return result;
    }
  }

  // Apply allocation strategy
  private async applyAllocationStrategy(
    inventory: any[],
    allocation: any,
    strategy: AllocationStrategy,
    order: IOrder
  ): Promise<any[]> {
    let sortedInventory = [...inventory];

    // Sort based on strategy
    switch (strategy.type) {
      case 'fifo':
        sortedInventory.sort((a, b) => new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime());
        break;
      case 'lifo':
        sortedInventory.sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
        break;
      case 'nearest':
        // Would calculate distance from order shipping address
        sortedInventory.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        break;
      case 'cheapest':
        sortedInventory.sort((a, b) => (a.cost || 0) - (b.cost || 0));
        break;
      case 'balanced':
        // Complex algorithm considering multiple factors
        sortedInventory = await this.applyBalancedStrategy(sortedInventory, allocation, order);
        break;
      case 'custom':
        sortedInventory = await this.applyCustomStrategy(sortedInventory, strategy, allocation, order);
        break;
    }

    // Apply constraints
    sortedInventory = this.applyConstraints(sortedInventory, strategy.constraints);

    // Apply preferences
    sortedInventory = this.applyPreferences(sortedInventory, allocation.preferences, strategy);

    return sortedInventory;
  }

  // Balanced allocation strategy
  private async applyBalancedStrategy(
    inventory: any[],
    allocation: any,
    order: IOrder
  ): Promise<any[]> {
    // Score each inventory location based on multiple factors
    const scoredInventory = inventory.map(item => {
      let score = 0;

      // Distance factor (30% weight)
      const distanceScore = item.distance ? Math.max(0, 100 - item.distance) : 50;
      score += distanceScore * 0.3;

      // Cost factor (25% weight)
      const costScore = item.cost ? Math.max(0, 100 - (item.cost * 10)) : 50;
      score += costScore * 0.25;

      // Stock level factor (20% weight)
      const stockScore = Math.min(100, (item.availableQuantity / allocation.quantity) * 100);
      score += stockScore * 0.2;

      // Batch expiry factor (15% weight)
      let expiryScore = 50;
      if (item.expiryDate) {
        const daysToExpiry = (item.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        expiryScore = daysToExpiry > 30 ? 100 : Math.max(0, daysToExpiry * 3.33);
      }
      score += expiryScore * 0.15;

      // Location utilization factor (10% weight)
      const utilizationScore = 100 - (item.utilizationRate || 0);
      score += utilizationScore * 0.1;

      return { ...item, score };
    });

    // Sort by score (descending)
    return scoredInventory.sort((a, b) => b.score - a.score);
  }

  // Custom allocation strategy
  private async applyCustomStrategy(
    inventory: any[],
    strategy: AllocationStrategy,
    allocation: any,
    order: IOrder
  ): Promise<any[]> {
    // Apply custom rules based on strategy configuration
    let filteredInventory = [...inventory];

    for (const rule of strategy.rules.sort((a, b) => b.priority - a.priority)) {
      filteredInventory = await this.applyRule(filteredInventory, rule, allocation, order);
    }

    return filteredInventory;
  }

  // Apply allocation rule
  private async applyRule(
    inventory: any[],
    rule: any,
    allocation: any,
    order: IOrder
  ): Promise<any[]> {
    // Mock rule application - would implement actual rule logic
    switch (rule.action) {
      case 'filter_by_location':
        if (rule.parameters?.locationIds) {
          return inventory.filter(item => rule.parameters.locationIds.includes(item.locationId));
        }
        break;
      case 'filter_by_expiry':
        if (rule.parameters?.maxDays) {
          const cutoffDate = new Date(Date.now() + rule.parameters.maxDays * 24 * 60 * 60 * 1000);
          return inventory.filter(item => !item.expiryDate || item.expiryDate <= cutoffDate);
        }
        break;
      case 'prioritize_low_stock':
        return inventory.sort((a, b) => (a.availableQuantity || 0) - (b.availableQuantity || 0));
      default:
        return inventory;
    }

    return inventory;
  }

  // Apply constraints
  private applyConstraints(inventory: any[], constraints: any): any[] {
    let filtered = [...inventory];

    if (constraints.maxDistance) {
      filtered = filtered.filter(item => !item.distance || item.distance <= constraints.maxDistance);
    }

    if (constraints.maxAge) {
      const cutoffDate = new Date(Date.now() - constraints.maxAge * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(item => !item.receivedAt || new Date(item.receivedAt) >= cutoffDate);
    }

    if (constraints.minStockLevel) {
      filtered = filtered.filter(item => item.availableQuantity >= constraints.minStockLevel);
    }

    if (constraints.excludedLocations?.length > 0) {
      filtered = filtered.filter(item => !constraints.excludedLocations.includes(item.locationId));
    }

    return filtered;
  }

  // Apply preferences
  private applyPreferences(inventory: any[], preferences: any, strategy: AllocationStrategy): any[] {
    let filtered = [...inventory];

    if (preferences?.locationId) {
      // Prioritize preferred location
      const preferred = filtered.filter(item => item.locationId === preferences.locationId);
      const others = filtered.filter(item => item.locationId !== preferences.locationId);
      filtered = [...preferred, ...others];
    }

    if (preferences?.batchNumber) {
      filtered = filtered.filter(item => item.batchNumber === preferences.batchNumber);
    }

    if (preferences?.expiryDate) {
      filtered = filtered.filter(item => !item.expiryDate || item.expiryDate <= preferences.expiryDate);
    }

    if (preferences?.fifo) {
      filtered.sort((a, b) => new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime());
    }

    if (preferences?.nearest) {
      filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    if (preferences?.cheapest) {
      filtered.sort((a, b) => (a.cost || 0) - (b.cost || 0));
    }

    return filtered;
  }

  // Get available inventory
  private async getAvailableInventory(
    productId: string,
    preferences?: any,
    strategy?: AllocationStrategy
  ): Promise<any[]> {
    // Mock implementation - would query actual inventory
    const inventory = [];

    for (let i = 0; i < 5; i++) {
      inventory.push({
        locationId: `LOC-${i}`,
        locationName: `Location ${i}`,
        productId,
        availableQuantity: Math.floor(Math.random() * 100),
        batchNumber: `BATCH-${Date.now()}-${i}`,
        expiryDate: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000),
        cost: 10 + Math.random() * 50,
        distance: Math.random() * 100,
        utilizationRate: Math.random() * 100,
        receivedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      });
    }

    return inventory.filter(item => item.availableQuantity > 0);
  }

  // Create reservation
  private async createReservation(
    orderId: string,
    orderItemId: string,
    productId: string,
    quantity: number,
    locationId: string,
    batchNumber?: string,
    expiryDate?: Date,
    priority: string = 'normal'
  ): Promise<void> {
    const reservation: InventoryReservation = {
      reservationId: this.generateReservationId(),
      orderId,
      orderItemId,
      productId,
      quantity,
      locations: [{
        locationId,
        quantity,
        batchNumber,
        expiryDate
      }],
      status: 'active',
      priority: priority as any,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      createdAt: new Date(),
      metadata: {}
    };

    this.reservations.set(reservation.reservationId, reservation);

    // Update inventory to reserve quantity
    await this.reserveInventory(productId, locationId, quantity, batchNumber);
  }

  // Reserve inventory
  private async reserveInventory(
    productId: string,
    locationId: string,
    quantity: number,
    batchNumber?: string
  ): Promise<void> {
    // Mock implementation - would update inventory records
    console.log(`Reserving ${quantity} units of ${productId} at ${locationId}`);
  }

  // Allocate inventory
  private async allocateInventory(
    productId: string,
    locationId: string,
    quantity: number,
    batchNumber?: string
  ): Promise<void> {
    // Mock implementation - would update inventory records
    console.log(`Allocating ${quantity} units of ${productId} at ${locationId}`);
  }

  // Find substitutions
  private async findSubstitutions(allocation: any, remainingQuantity: number): Promise<any[]> {
    // Mock implementation - would find similar products
    return [];
  }

  // Identify allocation issues
  private async identifyAllocationIssues(allocation: any, result: any): Promise<any[]> {
    const issues = [];

    if (result.allocatedQuantity === 0) {
      issues.push({
        type: 'insufficient_stock',
        productId: allocation.productId,
        quantity: allocation.quantity,
        description: `No inventory available for product ${allocation.productId}`,
        suggestedAction: 'Check inventory levels or consider substitution'
      });
    }

    if (result.status === 'partial') {
      issues.push({
        type: 'insufficient_stock',
        productId: allocation.productId,
        quantity: allocation.quantity - result.allocatedQuantity,
        description: `Partial allocation for product ${allocation.productId}`,
        suggestedAction: 'Create backorder or find substitution'
      });
    }

    return issues;
  }

  // Generate allocation recommendations
  private async generateAllocationRecommendations(allocation: any, result: any): Promise<any[]> {
    const recommendations = [];

    if (result.allocatedQuantity === 0) {
      recommendations.push({
        type: 'reorder',
        priority: 'high',
        description: `Reorder product ${allocation.productId} - no inventory available`,
        estimatedImpact: 'Prevent stockouts and improve order fulfillment'
      });
    }

    if (result.status === 'partial') {
      recommendations.push({
        type: 'transfer',
        priority: 'medium',
        description: `Transfer inventory from other locations for product ${allocation.productId}`,
        estimatedImpact: 'Complete order fulfillment'
      });
    }

    return recommendations;
  }

  // Calculate allocation value
  private async calculateAllocationValue(allocations: any[]): Promise<number> {
    // Mock implementation - would calculate based on product prices
    return allocations.reduce((sum, alloc) => sum + (alloc.allocatedQuantity * 25), 0);
  }

  // Calculate allocation cost
  private async calculateAllocationCost(allocations: any[]): Promise<number> {
    return allocations.reduce((sum, alloc) => {
      return sum + alloc.locations.reduce((locationSum: number, location: any) => {
        return locationSum + (location.quantity * (location.cost || 0));
      }, 0);
    }, 0);
  }

  // Calculate allocation savings
  private async calculateAllocationSavings(allocations: any[], strategy: AllocationStrategy): Promise<number> {
    // Mock implementation - would calculate savings from optimal allocation
    return Math.random() * 100;
  }

  // Update order with allocation information
  private async updateOrderAllocation(order: IOrder, result: AllocationResult): Promise<void> {
    // Update order items with allocation information
    for (const allocation of result.allocations) {
      const orderItem = order.items.find(item => item._id.toString() === allocation.orderItemId);
      if (orderItem) {
        orderItem.status = allocation.status === 'allocated' ? 'allocated' : 'partial_allocated';
        orderItem.allocatedQuantity = allocation.allocatedQuantity;
        orderItem.reservedQuantity = allocation.reservedQuantity;
        orderItem.allocationLocations = allocation.locations;
      }
    }

    // Add allocation to order metadata
    order.metadata.allocationId = result.allocationId;
    order.metadata.allocationStatus = result.status;
    order.metadata.allocationDate = new Date();

    await order.save();
  }

  // Get allocation analytics
  async getAllocationAnalytics(startDate: Date, endDate: Date): Promise<AllocationAnalytics> {
    // Mock implementation
    return {
      summary: {
        totalAllocations: 1000,
        totalQuantity: 50000,
        totalValue: 1250000,
        averageAllocationRate: 0.95,
        processingTime: 250
      },
      byStrategy: {
        'fifo': { allocations: 400, quantity: 20000, value: 500000, successRate: 0.96, averageProcessingTime: 200 },
        'nearest': { allocations: 300, quantity: 15000, value: 375000, successRate: 0.94, averageProcessingTime: 300 },
        'balanced': { allocations: 300, quantity: 15000, value: 375000, successRate: 0.97, averageProcessingTime: 250 }
      },
      byProduct: [],
      byLocation: [],
      performance: {
        allocationRates: [],
        processingTimes: [],
        errorRates: []
      },
      insights: []
    };
  }

  // Helper methods
  private async validateOrder(orderId: string): Promise<IOrder | null> {
    return await Order.findById(orderId);
  }

  private getAllocationStrategy(strategyName: string): AllocationStrategy {
    return this.strategies.get(strategyName) || this.strategies.get('balanced')!;
  }

  private initializeAllocationStrategies(): void {
    // FIFO Strategy
    this.strategies.set('fifo', {
      strategyId: 'fifo',
      name: 'First In, First Out',
      description: 'Allocate oldest inventory first',
      type: 'fifo',
      rules: [],
      preferences: {
        prioritizeExistingReservations: true,
        allowCrossLocationAllocation: true,
        considerBatchExpiry: true,
        considerShippingCosts: false,
        maximizeAllocationRate: true,
        minimizeCosts: false
      },
      constraints: {},
      active: true,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        version: 1
      }
    });

    // Nearest Strategy
    this.strategies.set('nearest', {
      strategyId: 'nearest',
      name: 'Nearest Location',
      description: 'Allocate from nearest location',
      type: 'nearest',
      rules: [],
      preferences: {
        prioritizeExistingReservations: true,
        allowCrossLocationAllocation: true,
        considerBatchExpiry: false,
        considerShippingCosts: true,
        maximizeAllocationRate: true,
        minimizeCosts: false
      },
      constraints: {
        maxDistance: 500
      },
      active: true,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        version: 1
      }
    });

    // Balanced Strategy
    this.strategies.set('balanced', {
      strategyId: 'balanced',
      name: 'Balanced Approach',
      description: 'Balance cost, distance, and availability',
      type: 'balanced',
      rules: [],
      preferences: {
        prioritizeExistingReservations: true,
        allowCrossLocationAllocation: true,
        considerBatchExpiry: true,
        considerShippingCosts: true,
        maximizeAllocationRate: true,
        minimizeCosts: true
      },
      constraints: {},
      active: true,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        version: 1
      }
    });
  }

  private generateAllocationId(): string {
    return `ALLOC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  private generateReservationId(): string {
    return `RES-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  // Public methods for managing reservations
  async getActiveReservations(orderId?: string): Promise<InventoryReservation[]> {
    const reservations = Array.from(this.reservations.values())
      .filter(r => r.status === 'active' && r.expiresAt > new Date());
    
    if (orderId) {
      return reservations.filter(r => r.orderId === orderId);
    }
    
    return reservations;
  }

  async fulfillReservation(reservationId: string): Promise<void> {
    const reservation = this.reservations.get(reservationId);
    if (reservation) {
      reservation.status = 'fulfilled';
      // Would allocate the reserved inventory
    }
  }

  async cancelReservation(reservationId: string, reason?: string): Promise<void> {
    const reservation = this.reservations.get(reservationId);
    if (reservation) {
      reservation.status = 'cancelled';
      // Would release the reserved inventory
    }
  }

  async expireReservations(): Promise<number> {
    const now = new Date();
    let expiredCount = 0;

    for (const [id, reservation] of this.reservations) {
      if (reservation.status === 'active' && reservation.expiresAt <= now) {
        reservation.status = 'expired';
        // Would release the reserved inventory
        expiredCount++;
      }
    }

    return expiredCount;
  }
}
