import { Order, IOrder } from '../../models/Order';
import { Inventory } from '../../models/Inventory';
import { Product } from '../../models/Product';
import { User } from '../../models/User';

export interface FulfillmentRequest {
  orderId: string;
  action: 'pick' | 'pack' | 'ship' | 'deliver' | 'complete';
  items?: Array<{
    productId: string;
    quantity: number;
    locationId?: string;
    batchNumber?: string;
    serialNumbers?: string[];
  }>;
  shipping?: {
    carrier: string;
    service: string;
    trackingNumber?: string;
    estimatedDelivery?: Date;
    cost?: number;
  };
  delivery?: {
    driverId?: string;
    vehicleId?: string;
    estimatedArrival?: Date;
    instructions?: string;
    signatureRequired?: boolean;
  };
  notes?: string;
  fulfilledBy: string;
}

export interface FulfillmentResult {
  success: boolean;
  orderId: string;
  action: string;
  processedItems: number;
  failedItems: number;
  trackingInfo?: {
    trackingNumber?: string;
    carrier?: string;
    estimatedDelivery?: Date;
  };
  documents: {
    pickList?: string;
    packingSlip?: string;
    shippingLabel?: string;
    deliveryNote?: string;
  };
  messages: string[];
  warnings: string[];
  errors: string[];
  nextSteps: string[];
}

export interface PickList {
  orderId: string;
  orderNumber: string;
  customer: {
    name: string;
    address: any;
  };
  items: Array<{
    productId: string;
    sku: string;
    name: string;
    quantity: number;
    location: string;
    aisle?: string;
    bay?: string;
    shelf?: string;
    bin?: string;
    batchInfo?: {
      batchNumber: string;
      expiryDate?: Date;
    };
    serialNumbers?: string[];
    picked: boolean;
    pickedQuantity: number;
    picker?: string;
    pickedAt?: Date;
    notes?: string;
  }>;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  instructions?: string;
  createdAt: Date;
  dueDate?: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
}

export interface PackingSlip {
  orderId: string;
  orderNumber: string;
  customer: {
    name: string;
    address: any;
    contact: {
      phone: string;
      email: string;
    };
  };
  items: Array<{
    productId: string;
    sku: string;
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    total: number;
    weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
    batchInfo?: {
      batchNumber: string;
      expiryDate?: Date;
    };
    serialNumbers?: string[];
  }>;
  totals: {
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
  };
  shipping: {
    method: string;
    carrier?: string;
    trackingNumber?: string;
    instructions?: string;
  };
  packageInfo: {
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    packageCount: number;
  };
  packedBy: string;
  packedAt: Date;
  notes?: string;
}

export interface BatchFulfillmentRequest {
  orderIds: string[];
  action: 'pick' | 'pack' | 'ship';
  options?: {
    groupByLocation?: boolean;
    groupByCarrier?: boolean;
    prioritizeBy?: 'date' | 'value' | 'customer' | 'location';
    maxOrdersPerBatch?: number;
  };
  processedBy: string;
}

export interface BatchFulfillmentResult {
  success: boolean;
  batchId: string;
  totalOrders: number;
  processedOrders: number;
  failedOrders: number;
  results: Array<{
    orderId: string;
    success: boolean;
    message?: string;
  }>;
  summary: {
    totalItems: number;
    totalWeight: number;
    totalValue: number;
    estimatedTime: number;
  };
}

export class OrderFulfillmentService {
  // Process fulfillment action
  async processFulfillment(request: FulfillmentRequest): Promise<FulfillmentResult> {
    const result: FulfillmentResult = {
      success: false,
      orderId: request.orderId,
      action: request.action,
      processedItems: 0,
      failedItems: 0,
      documents: {},
      messages: [],
      warnings: [],
      errors: [],
      nextSteps: []
    };

    try {
      const order = await Order.findById(request.orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Validate order status for fulfillment
      this.validateOrderForFulfillment(order, request.action);

      // Process based on action
      switch (request.action) {
        case 'pick':
          await this.processPicking(order, request, result);
          break;

        case 'pack':
          await this.processPacking(order, request, result);
          break;

        case 'ship':
          await this.processShipping(order, request, result);
          break;

        case 'deliver':
          await this.processDelivery(order, request, result);
          break;

        case 'complete':
          await this.processCompletion(order, request, result);
          break;

        default:
          throw new Error(`Unknown fulfillment action: ${request.action}`);
      }

      result.success = true;
      result.messages.push(`${request.action} processed successfully`);

      // Update order status
      await this.updateOrderFulfillmentStatus(order, request.action);

    } catch (error) {
      result.errors.push(error.message);
      result.success = false;
    }

    return result;
  }

  // Generate pick list
  async generatePickList(orderId: string): Promise<PickList> {
    const order = await Order.findById(orderId)
      .populate('customer.id')
      .populate('items.productId');

    if (!order) {
      throw new Error('Order not found');
    }

    const pickList: PickList = {
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      customer: {
        name: order.customer.name,
        address: order.shipping?.address || order.customer.shippingAddress
      },
      items: [],
      priority: order.metadata.priority || 'normal',
      createdAt: new Date(),
      dueDate: this.calculateDueDate(order),
      status: 'pending'
    };

    // Process each item for picking
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      const inventory = await this.findInventoryForPicking(item.productId, item.quantity);

      pickList.items.push({
        productId: item.productId.toString(),
        sku: item.sku,
        name: item.name,
        quantity: item.quantity,
        location: inventory?.locationId || 'unknown',
        aisle: inventory?.aisle,
        bay: inventory?.bay,
        shelf: inventory?.shelf,
        bin: inventory?.bin,
        batchInfo: item.batchInfo,
        serialNumbers: item.serialNumbers,
        picked: false,
        pickedQuantity: 0,
        notes: item.notes
      });
    }

    // Sort items by location for efficient picking
    pickList.items.sort((a, b) => a.location.localeCompare(b.location));

    return pickList;
  }

  // Generate packing slip
  async generatePackingSlip(orderId: string): Promise<PackingSlip> {
    const order = await Order.findById(orderId)
      .populate('customer.id')
      .populate('items.productId');

    if (!order) {
      throw new Error('Order not found');
    }

    const totalWeight = order.items.reduce((sum, item) => 
      sum + ((item.weight || 0) * item.quantity), 0);

    const packingSlip: PackingSlip = {
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      customer: {
        name: order.customer.name,
        address: order.shipping?.address || order.customer.shippingAddress,
        contact: {
          phone: order.customer.phone,
          email: order.customer.email
        }
      },
      items: order.items.map(item => ({
        productId: item.productId.toString(),
        sku: item.sku,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
        weight: item.weight,
        dimensions: item.dimensions,
        batchInfo: item.batchInfo,
        serialNumbers: item.serialNumbers
      })),
      totals: {
        subtotal: order.totals.subtotal,
        tax: order.totals.taxTotal,
        shipping: order.totals.shippingTotal,
        total: order.totals.grandTotal
      },
      shipping: {
        method: order.shipping?.method || 'standard',
        carrier: order.shipping?.carrier,
        trackingNumber: order.shipping?.trackingNumber,
        instructions: order.shipping?.deliveryInstructions
      },
      packageInfo: {
        weight: totalWeight,
        dimensions: this.calculatePackageDimensions(order.items),
        packageCount: this.calculatePackageCount(order.items)
      },
      packedBy: '',
      packedAt: new Date()
    };

    return packingSlip;
  }

  // Batch fulfillment
  async processBatchFulfillment(request: BatchFulfillmentRequest): Promise<BatchFulfillmentResult> {
    const result: BatchFulfillmentResult = {
      success: false,
      batchId: this.generateBatchId(),
      totalOrders: request.orderIds.length,
      processedOrders: 0,
      failedOrders: 0,
      results: [],
      summary: {
        totalItems: 0,
        totalWeight: 0,
        totalValue: 0,
        estimatedTime: 0
      }
    };

    try {
      // Get orders for batch processing
      const orders = await Order.find({ _id: { $in: request.orderIds } });

      // Sort orders based on priority option
      const sortedOrders = this.sortOrdersForBatch(orders, request.options?.prioritizeBy);

      // Process orders in batches
      const maxOrdersPerBatch = request.options?.maxOrdersPerBatch || 10;
      
      for (let i = 0; i < sortedOrders.length; i += maxOrdersPerBatch) {
        const batch = sortedOrders.slice(i, i + maxOrdersPerBatch);
        
        for (const order of batch) {
          try {
            const fulfillmentRequest: FulfillmentRequest = {
              orderId: order._id.toString(),
              action: request.action,
              fulfilledBy: request.processedBy
            };

            const fulfillmentResult = await this.processFulfillment(fulfillmentRequest);
            
            result.results.push({
              orderId: order._id.toString(),
              success: fulfillmentResult.success,
              message: fulfillmentResult.success ? 'Processed successfully' : fulfillmentResult.errors.join(', ')
            });

            if (fulfillmentResult.success) {
              result.processedOrders++;
            } else {
              result.failedOrders++;
            }

            // Update summary
            result.summary.totalItems += order.items.reduce((sum, item) => sum + item.quantity, 0);
            result.summary.totalWeight += order.items.reduce((sum, item) => sum + ((item.weight || 0) * item.quantity), 0);
            result.summary.totalValue += order.totals.grandTotal;

          } catch (error) {
            result.results.push({
              orderId: order._id.toString(),
              success: false,
              message: error.message
            });
            result.failedOrders++;
          }
        }
      }

      result.success = result.failedOrders === 0;
      result.summary.estimatedTime = this.estimateBatchProcessingTime(result.summary);

    } catch (error) {
      result.success = false;
    }

    return result;
  }

  // Helper methods
  private validateOrderForFulfillment(order: IOrder, action: string): void {
    const validStatuses = {
      'pick': ['confirmed', 'processing'],
      'pack': ['processing'],
      'ship': ['processing'],
      'deliver': ['shipped'],
      'complete': ['delivered']
    };

    const allowedStatuses = validStatuses[action] || [];
    if (!allowedStatuses.includes(order.status)) {
      throw new Error(`Order status ${order.status} not valid for ${action} action`);
    }
  }

  private async processPicking(order: IOrder, request: FulfillmentRequest, result: FulfillmentResult): Promise<void> {
    if (!request.items) {
      throw new Error('Items required for picking action');
    }

    for (const itemRequest of request.items) {
      const orderItem = order.items.find(item => 
        item.productId.toString() === itemRequest.productId
      );

      if (!orderItem) {
        result.errors.push(`Item ${itemRequest.productId} not found in order`);
        result.failedItems++;
        continue;
      }

      try {
        // Update inventory
        await this.updateInventoryForPicking(
          itemRequest.productId,
          itemRequest.quantity,
          itemRequest.locationId,
          itemRequest.batchNumber,
          itemRequest.serialNumbers
        );

        // Update order item status
        orderItem.status = 'allocated';
        result.processedItems++;

      } catch (error) {
        result.errors.push(`Failed to pick item ${itemRequest.productId}: ${error.message}`);
        result.failedItems++;
      }
    }

    // Generate pick list
    result.documents.pickList = await this.generatePickListDocument(order);
    result.nextSteps.push('Proceed to packing');
  }

  private async processPacking(order: IOrder, request: FulfillmentRequest, result: FulfillmentResult): Promise<void> {
    // Validate all items are picked
    const unpickedItems = order.items.filter(item => item.status !== 'allocated');
    if (unpickedItems.length > 0) {
      throw new Error(`${unpickedItems.length} items not yet picked`);
    }

    // Update order status
    order.status = 'processing';
    order.metadata.updatedAt = new Date();
    order.metadata.updatedBy = request.fulfilledBy;

    // Generate packing slip
    result.documents.packingSlip = await this.generatePackingSlipDocument(order);
    
    // Update item statuses
    order.items.forEach(item => {
      item.status = 'shipped';
    });

    await order.save();
    result.processedItems = order.items.length;
    result.nextSteps.push('Proceed to shipping');
  }

  private async processShipping(order: IOrder, request: FulfillmentRequest, result: FulfillmentResult): Promise<void> {
    if (!request.shipping) {
      throw new Error('Shipping information required');
    }

    // Update shipping information
    if (order.shipping) {
      order.shipping.carrier = request.shipping.carrier;
      order.shipping.service = request.shipping.service;
      order.shipping.trackingNumber = request.shipping.trackingNumber;
      order.shipping.estimatedDelivery = request.shipping.estimatedDelivery;
      order.shipping.status = 'shipped';
      order.shipping.shippedAt = new Date();
    }

    // Update order status
    order.status = 'shipped';
    order.metadata.updatedAt = new Date();
    order.metadata.updatedBy = request.fulfilledBy;

    await order.save();

    result.trackingInfo = {
      trackingNumber: request.shipping.trackingNumber,
      carrier: request.shipping.carrier,
      estimatedDelivery: request.shipping.estimatedDelivery
    };

    result.documents.shippingLabel = await this.generateShippingLabel(order, request.shipping);
    result.processedItems = order.items.length;
    result.nextSteps.push('Track shipment');
  }

  private async processDelivery(order: IOrder, request: FulfillmentRequest, result: FulfillmentResult): Promise<void> {
    if (!request.delivery) {
      throw new Error('Delivery information required');
    }

    // Update delivery information
    if (order.shipping) {
      order.shipping.status = 'delivered';
      order.shipping.actualDelivery = new Date();
    }

    // Update order status
    order.status = 'delivered';
    order.metadata.updatedAt = new Date();
    order.metadata.updatedBy = request.fulfilledBy;

    // Update item statuses
    order.items.forEach(item => {
      item.status = 'delivered';
    });

    await order.save();

    result.documents.deliveryNote = await this.generateDeliveryNote(order, request.delivery);
    result.processedItems = order.items.length;
    result.nextSteps.push('Complete order');
  }

  private async processCompletion(order: IOrder, request: FulfillmentRequest, result: FulfillmentResult): Promise<void> {
    // Update order status
    order.status = 'completed';
    order.metadata.completedAt = new Date();
    order.metadata.completedBy = request.fulfilledBy;
    order.metadata.updatedAt = new Date();
    order.metadata.updatedBy = request.fulfilledBy;

    await order.save();

    result.processedItems = order.items.length;
    result.messages.push('Order completed successfully');
  }

  private async updateOrderFulfillmentStatus(order: IOrder, action: string): Promise<void> {
    const statusMap = {
      'pick': 'processing',
      'pack': 'processing',
      'ship': 'shipped',
      'deliver': 'delivered',
      'complete': 'completed'
    };

    const newStatus = statusMap[action];
    if (newStatus && order.status !== newStatus) {
      order.status = newStatus;
      await order.save();
    }
  }

  private async findInventoryForPicking(productId: string, quantity: number): Promise<any> {
    return await Inventory.findOne({ 
      productId,
      $expr: { $gte: ['$quantity', '$reserved'] }
    });
  }

  private calculateDueDate(order: IOrder): Date {
    const priorityHours = {
      'urgent': 2,
      'high': 4,
      'normal': 8,
      'low': 24
    };

    const hours = priorityHours[order.metadata.priority] || 8;
    const dueDate = new Date();
    dueDate.setHours(dueDate.getHours() + hours);
    return dueDate;
  }

  private calculatePackageDimensions(items: any[]): { length: number; width: number; height: number } {
    // Simple calculation - would use more sophisticated algorithm
    const totalVolume = items.reduce((sum, item) => {
      if (item.dimensions) {
        return sum + (item.dimensions.length * item.dimensions.width * item.dimensions.height) * item.quantity;
      }
      return sum;
    }, 0);

    // Assume cubic package for simplicity
    const cubeRoot = Math.cbrt(totalVolume);
    return {
      length: Math.ceil(cubeRoot),
      width: Math.ceil(cubeRoot),
      height: Math.ceil(cubeRoot)
    };
  }

  private calculatePackageCount(items: any[]): number {
    // Simple calculation - would consider weight and size limits
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    return Math.max(1, Math.ceil(totalItems / 20)); // Assume 20 items per package max
  }

  private generateBatchId(): string {
    return `BATCH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private sortOrdersForBatch(orders: IOrder[], prioritizeBy?: string): IOrder[] {
    if (!prioritizeBy) return orders;

    switch (prioritizeBy) {
      case 'date':
        return orders.sort((a, b) => new Date(a.metadata.createdAt).getTime() - new Date(b.metadata.createdAt).getTime());
      case 'value':
        return orders.sort((a, b) => b.totals.grandTotal - a.totals.grandTotal);
      case 'customer':
        return orders.sort((a, b) => a.customer.name.localeCompare(b.customer.name));
      case 'location':
        return orders.sort((a, b) => a.metadata.location.localeCompare(b.metadata.location));
      default:
        return orders;
    }
  }

  private estimateBatchProcessingTime(summary: any): number {
    // Simple estimation - would use actual processing time data
    const timePerItem = 2; // seconds
    const timePerOrder = 30; // seconds
    return (summary.totalItems * timePerItem) + (summary.totalOrders * timePerOrder);
  }

  private async generatePickListDocument(order: IOrder): Promise<string> {
    // Generate PDF or return document URL
    return `/documents/pick-lists/${order._id}.pdf`;
  }

  private async generatePackingSlipDocument(order: IOrder): Promise<string> {
    // Generate PDF or return document URL
    return `/documents/packing-slips/${order._id}.pdf`;
  }

  private async generateShippingLabel(order: IOrder, shipping: any): Promise<string> {
    // Generate shipping label or return URL
    return `/documents/shipping-labels/${order._id}.pdf`;
  }

  private async generateDeliveryNote(order: IOrder, delivery: any): Promise<string> {
    // Generate delivery note or return URL
    return `/documents/delivery-notes/${order._id}.pdf`;
  }

  private async updateInventoryForPicking(
    productId: string,
    quantity: number,
    locationId?: string,
    batchNumber?: string,
    serialNumbers?: string[]
  ): Promise<void> {
    const inventory = await Inventory.findOne({ productId, locationId });
    if (!inventory) {
      throw new Error('Inventory not found');
    }

    if (inventory.quantity < quantity) {
      throw new Error('Insufficient inventory');
    }

    // Update inventory
    inventory.quantity -= quantity;
    inventory.reserved -= quantity;
    await inventory.save();
  }
}
