import { Order, IOrder, IOrderItem, IPayment, IShipping } from '../../models/Order';
import { Product } from '../../models/Product';
import { User } from '../../models/User';
import { Customer } from '../../models/Customer';
import { Inventory } from '../../models/Inventory';

export interface OrderCreateRequest {
  orderType?: 'sale' | 'return' | 'exchange' | 'layaway' | 'special-order' | 'quote' | 'invoice';
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
    customPrice?: number;
    discount?: number;
    notes?: string;
  }>;
  shipping?: {
    address: any;
    method: string;
    carrier?: string;
    service?: string;
  };
  payments?: Array<{
    method: 'cash' | 'card' | 'mobile' | 'gift-card' | 'credit' | 'mixed' | 'crypto' | 'bnpl';
    amount: number;
    reference?: string;
    details?: Record<string, any>;
  }>;
  metadata?: {
    source?: 'pos' | 'web' | 'mobile' | 'phone' | 'api' | 'marketplace' | 'social';
    location?: string;
    employee?: string;
    register?: string;
    notes?: string;
    internalComments?: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    tags?: string[];
  };
}

export interface OrderUpdateRequest {
  orderId: string;
  items?: Array<{
    productId: string;
    quantity: number;
    customPrice?: number;
    discount?: number;
    notes?: string;
  }>;
  shipping?: any;
  metadata?: {
    notes?: string;
    internalComments?: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    tags?: string[];
  };
  reason?: string;
}

export interface OrderStatusUpdateRequest {
  orderId: string;
  status: string;
  reason?: string;
  notifyCustomer?: boolean;
  metadata?: Record<string, any>;
}

export interface OrderSearchRequest {
  customerId?: string;
  locationId?: string;
  employeeId?: string;
  status?: string | string[];
  orderType?: string | string[];
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
  paymentMethod?: string;
  shippingMethod?: string;
  tags?: string[];
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface OrderAnalytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: Record<string, number>;
  ordersByType: Record<string, number>;
  ordersBySource: Record<string, number>;
  topProducts: Array<{
    productId: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  paymentMethods: Record<string, number>;
  revenueByPeriod: Array<{
    period: string;
    revenue: number;
    orders: number;
  }>;
}

export class OrderService {
  // Create new order
  async createOrder(request: OrderCreateRequest, createdBy: string): Promise<IOrder> {
    try {
      // Validate customer
      const customer = await this.validateCustomer(request.customerId);
      
      // Validate and prepare items
      const items = await this.prepareOrderItems(request.items);
      
      // Calculate totals
      const totals = this.calculateOrderTotals(items, request.shipping?.cost || 0);
      
      // Validate payments
      const payments = request.payments ? await this.validatePayments(request.payments, totals) : [];
      
      // Create order object
      const order = new Order({
        orderType: request.orderType || 'sale',
        status: payments.length > 0 ? 'pending' : 'draft',
        customer: {
          id: customer._id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          company: customer.company,
          taxId: customer.taxId,
          loyaltyTier: customer.loyaltyTier,
          isGuest: customer.isGuest || false,
          billingAddress: customer.billingAddress,
          shippingAddress: customer.shippingAddress
        },
        items,
        totals,
        payments,
        shipping: request.shipping ? {
          ...request.shipping,
          status: 'pending',
          cost: request.shipping.cost || 0
        } : undefined,
        metadata: {
          source: request.metadata?.source || 'pos',
          location: request.metadata?.location || 'default',
          employee: request.metadata?.employee || createdBy,
          register: request.metadata?.register,
          notes: request.metadata?.notes,
          internalComments: request.metadata?.internalComments,
          priority: request.metadata?.priority || 'normal',
          tags: request.metadata?.tags || [],
          createdBy,
          createdAt: new Date(),
          updatedAt: new Date(),
          updatedBy: createdBy
        }
      });
      
      // Add audit entry
      order.addAuditEntry('order.created', {
        orderType: order.orderType,
        itemCount: items.length,
        totalAmount: totals.grandTotal,
        source: order.metadata.source
      }, createdBy);
      
      // Save order
      await order.save();
      
      // Process inventory allocation if not draft
      if (order.status !== 'draft') {
        await this.processInventoryAllocation(order);
      }
      
      // Process payments if provided
      if (payments.length > 0) {
        await this.processPayments(order, payments);
      }
      
      // Send notifications
      await this.sendOrderNotifications(order, 'created');
      
      return order;
    } catch (error) {
      throw new Error(`Failed to create order: ${error.message}`);
    }
  }
  
  // Update existing order
  async updateOrder(request: OrderUpdateRequest, updatedBy: string): Promise<IOrder> {
    try {
      const order = await Order.findById(request.orderId);
      if (!order) {
        throw new Error('Order not found');
      }
      
      // Check if order can be modified
      if (!order.canBeModified()) {
        throw new Error(`Order cannot be modified in status: ${order.status}`);
      }
      
      // Update items if provided
      if (request.items) {
        const newItems = await this.prepareOrderItems(request.items);
        order.items = newItems;
      }
      
      // Update shipping if provided
      if (request.shipping) {
        order.shipping = { ...order.shipping, ...request.shipping };
      }
      
      // Update metadata if provided
      if (request.metadata) {
        order.metadata = { ...order.metadata, ...request.metadata };
        order.metadata.updatedAt = new Date();
        order.metadata.updatedBy = updatedBy;
      }
      
      // Recalculate totals
      order.calculateTotals();
      
      // Add audit entry
      order.addAuditEntry('order.updated', {
        changes: request,
        reason: request.reason
      }, updatedBy);
      
      // Save order
      await order.save();
      
      // Send notifications
      await this.sendOrderNotifications(order, 'updated');
      
      return order;
    } catch (error) {
      throw new Error(`Failed to update order: ${error.message}`);
    }
  }
  
  // Update order status
  async updateOrderStatus(request: OrderStatusUpdateRequest, updatedBy: string): Promise<IOrder> {
    try {
      const order = await Order.findById(request.orderId);
      if (!order) {
        throw new Error('Order not found');
      }
      
      const previousStatus = order.status;
      
      // Validate status transition
      if (!this.isValidStatusTransition(order.status, request.status)) {
        throw new Error(`Invalid status transition from ${order.status} to ${request.status}`);
      }
      
      // Update status
      order.status = request.status;
      
      // Update metadata timestamps
      if (request.status === 'completed') {
        order.metadata.completedAt = new Date();
        order.metadata.completedBy = updatedBy;
      } else if (request.status === 'cancelled') {
        order.metadata.cancelledAt = new Date();
        order.metadata.cancelledBy = updatedBy;
        order.metadata.cancellationReason = request.reason;
      }
      
      order.metadata.updatedAt = new Date();
      order.metadata.updatedBy = updatedBy;
      
      // Process status-specific actions
      await this.processStatusChange(order, previousStatus, request.status);
      
      // Add audit entry
      order.addAuditEntry('order.status_changed', {
        previousStatus,
        newStatus: request.status,
        reason: request.reason
      }, updatedBy);
      
      // Save order
      await order.save();
      
      // Send notifications
      if (request.notifyCustomer) {
        await this.sendOrderNotifications(order, 'status_changed');
      }
      
      return order;
    } catch (error) {
      throw new Error(`Failed to update order status: ${error.message}`);
    }
  }
  
  // Cancel order
  async cancelOrder(orderId: string, reason: string, cancelledBy: string): Promise<IOrder> {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }
      
      if (!order.canBeCancelled()) {
        throw new Error(`Order cannot be cancelled in status: ${order.status}`);
      }
      
      const previousStatus = order.status;
      order.status = 'cancelled';
      order.metadata.cancelledAt = new Date();
      order.metadata.cancelledBy = cancelledBy;
      order.metadata.cancellationReason = reason;
      order.metadata.updatedAt = new Date();
      order.metadata.updatedBy = cancelledBy;
      
      // Process cancellation actions
      await this.processCancellation(order);
      
      // Add audit entry
      order.addAuditEntry('order.cancelled', {
        previousStatus,
        reason
      }, cancelledBy);
      
      // Save order
      await order.save();
      
      // Send notifications
      await this.sendOrderNotifications(order, 'cancelled');
      
      return order;
    } catch (error) {
      throw new Error(`Failed to cancel order: ${error.message}`);
    }
  }
  
  // Clone order
  async cloneOrder(orderId: string, createdBy: string): Promise<IOrder> {
    try {
      const originalOrder = await Order.findById(orderId);
      if (!originalOrder) {
        throw new Error('Order not found');
      }
      
      // Create cloned order
      const clonedOrder = new Order({
        orderType: originalOrder.orderType,
        status: 'draft',
        customer: originalOrder.customer,
        items: originalOrder.items.map(item => ({
          ...item.toObject(),
          status: 'pending',
          addedAt: new Date()
        })),
        totals: { ...originalOrder.totals, paid: 0, due: originalOrder.totals.grandTotal },
        payments: [],
        shipping: originalOrder.shipping ? { ...originalOrder.shipping, status: 'pending' } : undefined,
        metadata: {
          ...originalOrder.metadata,
          createdBy,
          createdAt: new Date(),
          updatedAt: new Date(),
          updatedBy: createdBy,
          notes: `Cloned from order ${originalOrder.orderNumber}`,
          tags: [...(originalOrder.metadata.tags || []), 'cloned']
        },
        parentOrderId: originalOrder._id
      });
      
      // Add audit entry to original order
      originalOrder.addAuditEntry('order.cloned', {
        clonedOrderId: clonedOrder._id
      }, createdBy);
      
      // Add audit entry to cloned order
      clonedOrder.addAuditEntry('order.created', {
        orderType: clonedOrder.orderType,
        clonedFrom: originalOrder.orderNumber
      }, createdBy);
      
      // Save both orders
      await Promise.all([originalOrder.save(), clonedOrder.save()]);
      
      return clonedOrder;
    } catch (error) {
      throw new Error(`Failed to clone order: ${error.message}`);
    }
  }
  
  // Search orders
  async searchOrders(request: OrderSearchRequest): Promise<{ orders: IOrder[]; total: number; page: number; totalPages: number }> {
    try {
      const query: any = {};
      
      // Build query filters
      if (request.customerId) query['customer.id'] = request.customerId;
      if (request.locationId) query['metadata.location'] = request.locationId;
      if (request.employeeId) query['metadata.employee'] = request.employeeId;
      if (request.status) {
        query.status = Array.isArray(request.status) ? { $in: request.status } : request.status;
      }
      if (request.orderType) {
        query.orderType = Array.isArray(request.orderType) ? { $in: request.orderType } : request.orderType;
      }
      if (request.minAmount || request.maxAmount) {
        query['totals.grandTotal'] = {};
        if (request.minAmount) query['totals.grandTotal'].$gte = request.minAmount;
        if (request.maxAmount) query['totals.grandTotal'].$lte = request.maxAmount;
      }
      if (request.paymentMethod) query['payments.method'] = request.paymentMethod;
      if (request.shippingMethod) query['shipping.method'] = request.shippingMethod;
      if (request.tags && request.tags.length > 0) {
        query['metadata.tags'] = { $in: request.tags };
      }
      if (request.search) {
        query.$or = [
          { orderNumber: { $regex: request.search, $options: 'i' } },
          { 'customer.name': { $regex: request.search, $options: 'i' } },
          { 'customer.email': { $regex: request.search, $options: 'i' } }
        ];
      }
      
      // Date range filter
      if (request.dateFrom || request.dateTo) {
        query['metadata.createdAt'] = {};
        if (request.dateFrom) query['metadata.createdAt'].$gte = request.dateFrom;
        if (request.dateTo) query['metadata.createdAt'].$lte = request.dateTo;
      }
      
      // Pagination
      const page = request.page || 1;
      const limit = request.limit || 20;
      const skip = (page - 1) * limit;
      
      // Sorting
      const sort: any = {};
      const sortBy = request.sortBy || 'metadata.createdAt';
      const sortOrder = request.sortOrder || 'desc';
      sort[sortBy] = sortOrder;
      
      // Execute query
      const [orders, total] = await Promise.all([
        Order.find(query)
          .populate('customer.id', 'name email phone')
          .populate('metadata.employee', 'name email')
          .sort(sort)
          .skip(skip)
          .limit(limit),
        Order.countDocuments(query)
      ]);
      
      const totalPages = Math.ceil(total / limit);
      
      return {
        orders,
        total,
        page,
        totalPages
      };
    } catch (error) {
      throw new Error(`Failed to search orders: ${error.message}`);
    }
  }
  
  // Get order analytics
  async getOrderAnalytics(request: OrderSearchRequest): Promise<OrderAnalytics> {
    try {
      const query: any = {};
      
      // Apply same filters as search
      if (request.customerId) query['customer.id'] = request.customerId;
      if (request.locationId) query['metadata.location'] = request.locationId;
      if (request.status) {
        query.status = Array.isArray(request.status) ? { $in: request.status } : request.status;
      }
      if (request.orderType) {
        query.orderType = Array.isArray(request.orderType) ? { $in: request.orderType } : request.orderType;
      }
      if (request.dateFrom || request.dateTo) {
        query['metadata.createdAt'] = {};
        if (request.dateFrom) query['metadata.createdAt'].$gte = request.dateFrom;
        if (request.dateTo) query['metadata.createdAt'].$lte = request.dateTo;
      }
      
      // Get orders
      const orders = await Order.find(query);
      
      // Calculate analytics
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + order.totals.grandTotal, 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      // Orders by status
      const ordersByStatus = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {});
      
      // Orders by type
      const ordersByType = orders.reduce((acc, order) => {
        acc[order.orderType] = (acc[order.orderType] || 0) + 1;
        return acc;
      }, {});
      
      // Orders by source
      const ordersBySource = orders.reduce((acc, order) => {
        acc[order.metadata.source] = (acc[order.metadata.source] || 0) + 1;
        return acc;
      }, {});
      
      // Top products
      const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
      orders.forEach(order => {
        order.items.forEach(item => {
          const key = item.productId.toString();
          if (!productSales[key]) {
            productSales[key] = { name: item.name, quantity: 0, revenue: 0 };
          }
          productSales[key].quantity += item.quantity;
          productSales[key].revenue += item.total;
        });
      });
      
      const topProducts = Object.entries(productSales)
        .map(([productId, data]) => ({ productId, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);
      
      // Payment methods
      const paymentMethods = orders.reduce((acc, order) => {
        order.payments.forEach(payment => {
          acc[payment.method] = (acc[payment.method] || 0) + payment.amount;
        });
        return acc;
      }, {});
      
      // Revenue by period (daily for last 30 days)
      const revenueByPeriod = await this.getRevenueByPeriod(query);
      
      return {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        ordersByStatus,
        ordersByType,
        ordersBySource,
        topProducts,
        paymentMethods,
        revenueByPeriod
      };
    } catch (error) {
      throw new Error(`Failed to get order analytics: ${error.message}`);
    }
  }
  
  // Helper methods
  private async validateCustomer(customerId: string): Promise<any> {
    const customer = await Customer.findById(customerId).populate('userId');
    if (!customer) {
      throw new Error('Customer not found');
    }
    return customer;
  }
  
  private async prepareOrderItems(items: any[]): Promise<IOrderItem[]> {
    const orderItems: IOrderItem[] = [];
    
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      
      if (!product.isActive) {
        throw new Error(`Product is not active: ${product.name}`);
      }
      
      // Check inventory availability
      const inventory = await Inventory.findOne({ productId: item.productId });
      if (!inventory || inventory.quantity < item.quantity) {
        throw new Error(`Insufficient inventory for product: ${product.name}`);
      }
      
      const unitPrice = item.customPrice || product.price;
      const discount = item.discount || 0;
      const tax = product.taxRate ? (unitPrice - discount) * product.taxRate / 100 : 0;
      const total = item.quantity * (unitPrice - discount + tax);
      
      orderItems.push({
        productId: product._id,
        sku: product.sku,
        name: product.name,
        description: product.description,
        quantity: item.quantity,
        unitPrice,
        discount,
        tax,
        total,
        status: 'pending',
        notes: item.notes,
        addedAt: new Date()
      });
    }
    
    return orderItems;
  }
  
  private calculateOrderTotals(items: IOrderItem[], shippingCost: number): any {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const discountTotal = items.reduce((sum, item) => sum + (item.discount * item.quantity), 0);
    const taxTotal = items.reduce((sum, item) => sum + (item.tax * item.quantity), 0);
    const grandTotal = subtotal - discountTotal + taxTotal + shippingCost;
    
    return {
      subtotal,
      discountTotal,
      taxTotal,
      shippingTotal: shippingCost,
      handlingTotal: 0,
      dutyTotal: 0,
      grandTotal,
      paid: 0,
      due: grandTotal,
      change: 0,
      currency: 'USD'
    };
  }
  
  private async validatePayments(payments: any[], totals: any): Promise<IPayment[]> {
    const totalPaymentAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    if (totalPaymentAmount > totals.grandTotal) {
      // Allow overpayment for cash payments (change will be calculated)
      const cashPayments = payments.filter(p => p.method === 'cash').reduce((sum, p) => sum + p.amount, 0);
      const nonCashPayments = payments.filter(p => p.method !== 'cash').reduce((sum, p) => sum + p.amount, 0);
      
      if (nonCashPayments > totals.grandTotal) {
        throw new Error('Total payment amount exceeds order total');
      }
    }
    
    return payments.map(payment => ({
      ...payment,
      status: 'pending',
      currency: 'USD'
    }));
  }
  
  private async processInventoryAllocation(order: IOrder): Promise<void> {
    for (const item of order.items) {
      const inventory = await Inventory.findOne({ productId: item.productId });
      if (inventory && inventory.quantity >= item.quantity) {
        inventory.quantity -= item.quantity;
        inventory.reserved += item.quantity;
        await inventory.save();
        item.status = 'allocated';
      } else {
        item.status = 'pending'; // Backorder
      }
    }
  }
  
  private async processPayments(order: IOrder, payments: IPayment[]): Promise<void> {
    // Process payments through payment gateways
    for (const payment of payments) {
      try {
        // Mock payment processing - would integrate with actual payment gateways
        payment.status = 'captured';
        payment.processedAt = new Date();
        order.totals.paid += payment.amount;
        order.totals.due = order.totals.grandTotal - order.totals.paid;
      } catch (error) {
        payment.status = 'failed';
        throw error;
      }
    }
  }
  
  private async processStatusChange(order: IOrder, previousStatus: string, newStatus: string): Promise<void> {
    // Process inventory changes based on status
    if (newStatus === 'cancelled' && previousStatus !== 'cancelled') {
      await this.releaseInventoryAllocation(order);
    } else if (newStatus === 'confirmed' && previousStatus === 'draft') {
      await this.processInventoryAllocation(order);
    }
    
    // Update order completion
    if (newStatus === 'completed') {
      order.items.forEach(item => {
        if (item.status === 'shipped') {
          item.status = 'delivered';
        }
      });
    }
  }
  
  private async processCancellation(order: IOrder): Promise<void> {
    // Release inventory allocation
    await this.releaseInventoryAllocation(order);
    
    // Process refunds if payments were made
    if (order.totals.paid > 0) {
      await this.processRefunds(order);
    }
  }
  
  private async releaseInventoryAllocation(order: IOrder): Promise<void> {
    for (const item of order.items) {
      if (item.status === 'allocated') {
        const inventory = await Inventory.findOne({ productId: item.productId });
        if (inventory) {
          inventory.quantity += item.quantity;
          inventory.reserved -= item.quantity;
          await inventory.save();
        }
        item.status = 'cancelled';
      }
    }
  }
  
  private async processRefunds(order: IOrder): Promise<void> {
    // Process refunds for all captured payments
    for (const payment of order.payments) {
      if (payment.status === 'captured') {
        // Mock refund processing - would integrate with actual payment gateways
        payment.status = 'refunded';
      }
    }
  }
  
  private isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
    const validTransitions: Record<string, string[]> = {
      'draft': ['pending', 'cancelled'],
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['processing', 'cancelled'],
      'processing': ['shipped', 'cancelled'],
      'shipped': ['delivered', 'cancelled'],
      'delivered': ['completed', 'cancelled'],
      'completed': [], // Final state
      'cancelled': [], // Final state
      'refunded': [], // Final state
      'on-hold': ['pending', 'cancelled']
    };
    
    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }
  
  private async sendOrderNotifications(order: IOrder, event: string): Promise<void> {
    // Mock notification sending - would integrate with email/SMS services
    console.log(`Sending ${event} notification for order ${order.orderNumber}`);
  }
  
  private async getRevenueByPeriod(query: any): Promise<any[]> {
    // Mock implementation - would generate actual revenue by period data
    return [
      { period: '2024-01-01', revenue: 5000, orders: 25 },
      { period: '2024-01-02', revenue: 6000, orders: 30 }
    ];
  }
}
