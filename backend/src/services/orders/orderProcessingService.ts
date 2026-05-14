import { Order, IOrder } from '../../models/Order';
import { Inventory } from '../../models/Inventory';
import { Product } from '../../models/Product';
import { Customer } from '../../models/Customer';
import { NotificationService } from '../notificationService';

export interface OrderProcessingRequest {
  orderId: string;
  action: 'allocate' | 'deallocate' | 'process' | 'hold' | 'release' | 'route';
  options?: {
    forceAllocation?: boolean;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    locationId?: string;
    reason?: string;
    routingRules?: string[];
  };
  processedBy: string;
}

export interface OrderProcessingResult {
  success: boolean;
  orderId: string;
  action: string;
  previousStatus: string;
  newStatus: string;
  processedItems: number;
  failedItems: number;
  backorderItems: number;
  messages: string[];
  warnings: string[];
  errors: string[];
  processingTime: number;
}

export interface InventoryAllocationRequest {
  orderId: string;
  strategy: 'fifo' | 'nearest' | 'balanced' | 'least-stock' | 'most-stock';
  locationPreference?: string[];
  forceAllocation?: boolean;
  partialAllocationAllowed?: boolean;
}

export interface InventoryAllocationResult {
  success: boolean;
  orderId: string;
  allocations: Array<{
    productId: string;
    locationId: string;
    quantityAllocated: number;
    quantityAvailable: number;
    batchInfo?: Array<{
      batchNumber: string;
      quantity: number;
      expiryDate?: Date;
    }>;
    serialNumbers?: string[];
  }>;
  unallocated: Array<{
    productId: string;
    quantity: number;
    reason: 'out-of-stock' | 'insufficient' | 'location-unavailable' | 'reserved';
  }>;
  suggestedActions: Array<{
    type: 'transfer' | 'purchase' | 'backorder' | 'alternative';
    productId: string;
    quantity: number;
    fromLocation?: string;
    toLocation?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    estimatedDate?: Date;
  }>;
}

export interface OrderRoutingRequest {
  orderId: string;
  rules: Array<{
    ruleId: string;
    condition: string;
    action: string;
    priority: number;
  }>;
  manualOverride?: boolean;
}

export interface OrderRoutingResult {
  success: boolean;
  orderId: string;
  routedTo: {
    location?: string;
    employee?: string;
    department?: string;
    priority: string;
  };
  appliedRules: Array<{
    ruleId: string;
    condition: string;
    action: string;
    matched: boolean;
  }>;
  nextSteps: Array<{
    step: string;
    assignedTo?: string;
    dueDate?: Date;
    priority: string;
  }>;
}

export class OrderProcessingService {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  // Process order with state machine
  async processOrder(request: OrderProcessingRequest): Promise<OrderProcessingResult> {
    const startTime = Date.now();
    const result: OrderProcessingResult = {
      success: false,
      orderId: request.orderId,
      action: request.action,
      previousStatus: '',
      newStatus: '',
      processedItems: 0,
      failedItems: 0,
      backorderItems: 0,
      messages: [],
      warnings: [],
      errors: [],
      processingTime: 0
    };

    try {
      const order = await Order.findById(request.orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      result.previousStatus = order.status;

      // Process based on action
      switch (request.action) {
        case 'allocate':
          await this.processInventoryAllocation(order, request.options);
          result.newStatus = 'confirmed';
          break;

        case 'deallocate':
          await this.processInventoryDeallocation(order);
          result.newStatus = 'draft';
          break;

        case 'process':
          await this.processOrderWorkflow(order, request.options);
          result.newStatus = 'processing';
          break;

        case 'hold':
          await this.placeOrderHold(order, request.options?.reason || 'Manual hold', request.processedBy);
          result.newStatus = 'on-hold';
          break;

        case 'release':
          await this.releaseOrderHold(order, request.processedBy);
          result.newStatus = 'pending';
          break;

        case 'route':
          await this.routeOrder(order, request.options);
          break;

        default:
          throw new Error(`Unknown processing action: ${request.action}`);
      }

      // Update order status
      if (result.newStatus && result.newStatus !== order.status) {
        order.status = result.newStatus;
        order.metadata.updatedAt = new Date();
        order.metadata.updatedBy = request.processedBy;
        await order.save();
      }

      // Count item statuses
      result.processedItems = order.items.filter(item => item.status === 'allocated').length;
      result.failedItems = order.items.filter(item => item.status === 'cancelled').length;
      result.backorderItems = order.items.filter(item => item.status === 'pending').length;

      result.success = true;
      result.messages.push(`Order ${request.action} processed successfully`);

    } catch (error) {
      result.errors.push(error.message);
      result.success = false;
    }

    result.processingTime = Date.now() - startTime;
    return result;
  }

  // Allocate inventory for order
  async allocateInventory(request: InventoryAllocationRequest): Promise<InventoryAllocationResult> {
    const result: InventoryAllocationResult = {
      success: false,
      orderId: request.orderId,
      allocations: [],
      unallocated: [],
      suggestedActions: []
    };

    try {
      const order = await Order.findById(request.orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      let totalAllocated = 0;
      let totalUnallocated = 0;

      // Process each item
      for (const item of order.items) {
        const allocation = await this.allocateItemInventory(
          item.productId,
          item.quantity,
          request.strategy,
          request.locationPreference,
          request.forceAllocation
        );

        if (allocation.success) {
          result.allocations.push(allocation.data!);
          item.status = 'allocated';
          totalAllocated += allocation.data!.quantityAllocated;

          // Update inventory
          await this.updateInventoryAllocation(
            item.productId,
            allocation.data!.locationId,
            allocation.data!.quantityAllocated,
            'allocate'
          );

        } else {
          result.unallocated.push({
            productId: item.productId,
            quantity: item.quantity,
            reason: allocation.reason || 'out-of-stock'
          });
          item.status = 'pending'; // Backorder
          totalUnallocated += item.quantity;

          // Generate suggested actions
          const suggestions = await this.generateSuggestedActions(
            item.productId,
            item.quantity,
            request.locationPreference
          );
          result.suggestedActions.push(...suggestions);
        }
      }

      // Update order
      order.metadata.updatedAt = new Date();
      await order.save();

      // Check if order can be confirmed
      if (totalUnallocated === 0 || request.partialAllocationAllowed) {
        result.success = true;
        if (totalUnallocated === 0) {
          order.status = 'confirmed';
        } else {
          order.status = 'confirmed'; // Partially confirmed
          result.warnings = [`${totalUnallocated} items placed on backorder`];
        }
        await order.save();
      } else {
        result.success = false;
        result.errors.push('Unable to allocate all required items');
      }

    } catch (error) {
      result.errors.push(error.message);
    }

    return result;
  }

  // Process order workflow
  async processOrderWorkflow(order: IOrder, options?: any): Promise<void> {
    // Check for holds
    if (order.holds && order.holds.length > 0) {
      throw new Error('Order cannot be processed while on hold');
    }

    // Validate inventory allocation
    const unallocatedItems = order.items.filter(item => item.status === 'pending');
    if (unallocatedItems.length > 0) {
      throw new Error(`${unallocatedItems.length} items not allocated`);
    }

    // Validate payment
    if (order.getPaymentStatus() !== 'paid' && order.orderType !== 'quote') {
      throw new Error('Order payment required before processing');
    }

    // Process workflow steps
    await this.executeWorkflowSteps(order, options);
  }

  // Place order on hold
  async placeOrderHold(order: IOrder, reason: string, placedBy: string): Promise<void> {
    if (!order.holds) {
      order.holds = [];
    }

    order.holds.push({
      type: 'manual',
      reason,
      placedBy,
      placedAt: new Date()
    });

    order.status = 'on-hold';
    order.metadata.updatedAt = new Date();
    order.metadata.updatedBy = placedBy;

    await order.save();

    // Send notifications
    await this.notificationService.sendOrderHoldNotification(order, reason);
  }

  // Release order hold
  async releaseOrderHold(order: IOrder, releasedBy: string): Promise<void> {
    if (!order.holds || order.holds.length === 0) {
      throw new Error('No holds found on order');
    }

    // Release all holds
    order.holds.forEach(hold => {
      hold.releasedBy = releasedBy;
      hold.releasedAt = new Date();
    });

    // Determine next status
    const allocatedItems = order.items.filter(item => item.status === 'allocated').length;
    const totalItems = order.items.length;

    if (allocatedItems === totalItems) {
      order.status = 'confirmed';
    } else if (allocatedItems > 0) {
      order.status = 'confirmed'; // Partially confirmed
    } else {
      order.status = 'pending';
    }

    order.metadata.updatedAt = new Date();
    order.metadata.updatedBy = releasedBy;

    await order.save();

    // Send notifications
    await this.notificationService.sendOrderHoldReleasedNotification(order);
  }

  // Route order based on rules
  async routeOrder(order: IOrder, options?: any): Promise<void> {
    const routingRules = await this.getOrderRoutingRules();
    
    for (const rule of routingRules) {
      if (await this.evaluateRoutingCondition(rule.condition, order)) {
        await this.executeRoutingAction(rule.action, order);
        break; // Apply first matching rule
      }
    }

    // Default routing if no rules matched
    if (!order.metadata.routedTo) {
      await this.defaultRouting(order);
    }
  }

  // Helper methods
  private async processInventoryAllocation(order: IOrder, options?: any): Promise<void> {
    const strategy = options?.strategy || 'fifo';
    const locationPreference = options?.locationId ? [options.locationId] : undefined;
    const forceAllocation = options?.forceAllocation || false;

    const allocationResult = await this.allocateInventory({
      orderId: order._id.toString(),
      strategy,
      locationPreference,
      forceAllocation,
      partialAllocationAllowed: true
    });

    if (!allocationResult.success) {
      throw new Error(`Inventory allocation failed: ${allocationResult.errors.join(', ')}`);
    }

    // Handle unallocated items (backorders)
    if (allocationResult.unallocated.length > 0) {
      await this.createBackorders(order, allocationResult.unallocated);
    }
  }

  private async processInventoryDeallocation(order: IOrder): Promise<void> {
    for (const item of order.items) {
      if (item.status === 'allocated') {
        // Find and release inventory allocation
        await this.releaseInventoryAllocation(item.productId, item.quantity);
        item.status = 'pending';
      }
    }

    order.metadata.updatedAt = new Date();
    await order.save();
  }

  private async allocateItemInventory(
    productId: string,
    quantity: number,
    strategy: string,
    locationPreference?: string[],
    forceAllocation?: boolean
  ): Promise<{ success: boolean; data?: any; reason?: string }> {
    try {
      const inventory = await Inventory.find({ 
        productId,
        quantity: { $gte: quantity }
      });

      if (inventory.length === 0) {
        return { success: false, reason: 'out-of-stock' };
      }

      // Apply allocation strategy
      let selectedInventory: any;
      
      switch (strategy) {
        case 'fifo':
          selectedInventory = inventory.sort((a, b) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )[0];
          break;

        case 'nearest':
          if (locationPreference && locationPreference.length > 0) {
            selectedInventory = inventory.find(inv => 
              locationPreference.includes(inv.locationId)
            ) || inventory[0];
          } else {
            selectedInventory = inventory[0];
          }
          break;

        case 'least-stock':
          selectedInventory = inventory.sort((a, b) => a.quantity - b.quantity)[0];
          break;

        case 'most-stock':
          selectedInventory = inventory.sort((a, b) => b.quantity - a.quantity)[0];
          break;

        default:
          selectedInventory = inventory[0];
      }

      if (!selectedInventory || selectedInventory.quantity < quantity) {
        return { success: false, reason: 'insufficient' };
      }

      // Get batch and serial number info
      const batchInfo = await this.getBatchInfo(selectedInventory._id, quantity);
      const serialNumbers = await this.getSerialNumbers(selectedInventory._id, quantity);

      return {
        success: true,
        data: {
          productId,
          locationId: selectedInventory.locationId,
          quantityAllocated: quantity,
          quantityAvailable: selectedInventory.quantity,
          batchInfo,
          serialNumbers
        }
      };

    } catch (error) {
      return { success: false, reason: error.message };
    }
  }

  private async updateInventoryAllocation(
    productId: string,
    locationId: string,
    quantity: number,
    action: 'allocate' | 'deallocate'
  ): Promise<void> {
    const inventory = await Inventory.findOne({ productId, locationId });
    if (!inventory) {
      throw new Error('Inventory record not found');
    }

    if (action === 'allocate') {
      inventory.quantity -= quantity;
      inventory.reserved += quantity;
    } else {
      inventory.quantity += quantity;
      inventory.reserved -= quantity;
    }

    await inventory.save();
  }

  private async generateSuggestedActions(
    productId: string,
    quantity: number,
    locationPreference?: string[]
  ): Promise<any[]> {
    const actions = [];

    // Check other locations
    const otherLocations = await Inventory.find({ 
      productId,
      quantity: { $gt: 0 }
    });

    if (otherLocations.length > 0) {
      actions.push({
        type: 'transfer',
        productId,
        quantity,
        fromLocation: otherLocations[0].locationId,
        toLocation: locationPreference?.[0] || 'main',
        priority: 'medium',
        estimatedDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day
      });
    }

    // Suggest purchase order
    actions.push({
      type: 'purchase',
      productId,
      quantity,
      priority: 'high',
      estimatedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    // Suggest backorder
    actions.push({
      type: 'backorder',
      productId,
      quantity,
      priority: 'low'
    });

    return actions;
  }

  private async createBackorders(order: IOrder, unallocatedItems: any[]): Promise<void> {
    // Create backorder records
    for (const item of unallocatedItems) {
      // This would integrate with a backorder management system
      console.log(`Creating backorder for product ${item.productId}, quantity ${item.quantity}`);
    }

    // Notify customer about backorder
    await this.notificationService.sendBackorderNotification(order, unallocatedItems);
  }

  private async executeWorkflowSteps(order: IOrder, options?: any): Promise<void> {
    // Define workflow steps based on order type
    const steps = this.getWorkflowSteps(order.orderType);

    for (const step of steps) {
      await this.executeWorkflowStep(step, order, options);
    }
  }

  private getWorkflowSteps(orderType: string): any[] {
    const workflows = {
      'sale': [
        { name: 'validate_payment', required: true },
        { name: 'allocate_inventory', required: true },
        { name: 'generate_documents', required: false },
        { name: 'notify_customer', required: false }
      ],
      'return': [
        { name: 'validate_return', required: true },
        { name: 'process_refund', required: true },
        { name: 'update_inventory', required: true }
      ],
      'exchange': [
        { name: 'validate_exchange', required: true },
        { name: 'allocate_new_items', required: true },
        { name: 'process_return', required: true }
      ]
    };

    return workflows[orderType] || workflows['sale'];
  }

  private async executeWorkflowStep(step: any, order: IOrder, options?: any): Promise<void> {
    switch (step.name) {
      case 'validate_payment':
        await this.validatePayment(order);
        break;
      case 'allocate_inventory':
        await this.processInventoryAllocation(order, options);
        break;
      case 'generate_documents':
        await this.generateOrderDocuments(order);
        break;
      case 'notify_customer':
        await this.notificationService.sendOrderConfirmation(order);
        break;
      // Add other step implementations
    }
  }

  private async validatePayment(order: IOrder): Promise<void> {
    if (order.getPaymentStatus() !== 'paid') {
      throw new Error('Payment validation failed');
    }
  }

  private async generateOrderDocuments(order: IOrder): Promise<void> {
    // Generate invoice, packing slip, etc.
    console.log(`Generating documents for order ${order.orderNumber}`);
  }

  private async getOrderRoutingRules(): Promise<any[]> {
    // Mock implementation - would get actual routing rules
    return [
      {
        ruleId: 'high_value',
        condition: 'totals.grandTotal > 1000',
        action: 'priority_processing',
        priority: 1
      },
      {
        ruleId: 'vip_customer',
        condition: 'customer.loyaltyTier == "VIP"',
        action: 'express_processing',
        priority: 2
      }
    ];
  }

  private async evaluateRoutingCondition(condition: string, order: IOrder): Promise<boolean> {
    // Mock implementation - would evaluate actual conditions
    try {
      // Simple condition evaluation - would use proper expression parser
      if (condition.includes('totals.grandTotal > 1000')) {
        return order.totals.grandTotal > 1000;
      }
      if (condition.includes('customer.loyaltyTier == "VIP"')) {
        return order.customer.loyaltyTier === 'VIP';
      }
      return false;
    } catch {
      return false;
    }
  }

  private async executeRoutingAction(action: string, order: IOrder): Promise<void> {
    switch (action) {
      case 'priority_processing':
        order.metadata.priority = 'high';
        break;
      case 'express_processing':
        order.metadata.priority = 'urgent';
        break;
      // Add other action implementations
    }
  }

  private async defaultRouting(order: IOrder): Promise<void> {
    // Default routing logic
    order.metadata.priority = order.metadata.priority || 'normal';
  }

  private async getBatchInfo(inventoryId: string, quantity: number): Promise<any[]> {
    // Mock implementation - would get actual batch info
    return [];
  }

  private async getSerialNumbers(inventoryId: string, quantity: number): Promise<string[]> {
    // Mock implementation - would get actual serial numbers
    return [];
  }

  private async releaseInventoryAllocation(productId: string, quantity: number): Promise<void> {
    // Find inventory allocation and release it
    const inventory = await Inventory.findOne({ productId });
    if (inventory) {
      inventory.quantity += quantity;
      inventory.reserved -= quantity;
      await inventory.save();
    }
  }
}
