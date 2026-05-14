import { Order, IOrder } from '../../models/Order';
import { NotificationService } from '../notificationService';

export interface OrderStatusUpdate {
  orderId: string;
  status: string;
  previousStatus: string;
  timestamp: Date;
  updatedBy: string;
  notes?: string;
  location?: string;
  metadata?: Record<string, any>;
}

export interface OrderTrackingInfo {
  orderId: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  currentStatus: string;
  statusHistory: Array<{
    status: string;
    timestamp: Date;
    updatedBy: string;
    notes?: string;
    location?: string;
  }>;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  trackingNumbers: Array<{
    carrier: string;
    trackingNumber: string;
    status: string;
    lastUpdate?: Date;
  }>;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    status: string;
    trackingInfo?: {
      trackingNumber: string;
      carrier: string;
      status: string;
    };
  }>;
  nextSteps: Array<{
    step: string;
    estimatedDate?: Date;
    responsible?: string;
  }>;
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    lastNotification?: Date;
  };
}

export interface TrackingUpdateRequest {
  orderId: string;
  status: string;
  trackingInfo?: {
    carrier: string;
    trackingNumber: string;
    status?: string;
    location?: string;
    estimatedDelivery?: Date;
  };
  notes?: string;
  location?: string;
  notifyCustomer?: boolean;
  notificationChannels?: Array<'email' | 'sms' | 'push'>;
  updatedBy: string;
}

export interface TrackingUpdateResult {
  success: boolean;
  orderId: string;
  previousStatus: string;
  newStatus: string;
  notificationsSent: Array<{
    channel: string;
    recipient: string;
    status: string;
    timestamp: Date;
  }>;
  errors: string[];
  warnings: string[];
}

export interface DeliveryConfirmation {
  orderId: string;
  trackingNumber?: string;
  deliveredBy: string;
  deliveryTime: Date;
  signature?: {
    imageData: string;
    name: string;
    timestamp: Date;
  };
  photo?: {
    imageData: string;
    timestamp: Date;
    location?: {
      latitude: number;
      longitude: number;
    };
  };
  notes?: string;
  condition: 'perfect' | 'good' | 'damaged' | 'missing';
  recipientName: string;
  recipientRelation: 'customer' | 'family' | 'neighbor' | 'building_staff' | 'other';
  specialInstructions?: string;
}

export interface CustomerTrackingPortal {
  customerId: string;
  orders: Array<{
    orderId: string;
    orderNumber: string;
    orderDate: Date;
    status: string;
    totalAmount: number;
    estimatedDelivery?: Date;
    trackingNumbers: Array<{
      carrier: string;
      trackingNumber: string;
      link: string;
    }>;
    items: Array<{
      name: string;
      quantity: number;
      status: string;
      image?: string;
    }>;
    canTrack: boolean;
    canModify: boolean;
    canCancel: boolean;
  }>;
  preferences: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
      frequency: 'all' | 'important' | 'delivery-only';
    };
    privacy: {
      shareTracking: boolean;
      allowRealTimeUpdates: boolean;
    };
  };
  upcomingDeliveries: Array<{
    orderId: string;
    orderNumber: string;
    estimatedDelivery: Date;
    deliveryWindow: {
      start: Date;
      end: Date;
    };
    address: any;
    instructions?: string;
  }>;
}

export class OrderTrackingService {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  // Get comprehensive order tracking information
  async getOrderTracking(orderId: string, includeDetails: boolean = true): Promise<OrderTrackingInfo> {
    const order = await Order.findById(orderId)
      .populate('customer.id')
      .populate('metadata.employee');

    if (!order) {
      throw new Error('Order not found');
    }

    // Build status history from audit trail
    const statusHistory = this.buildStatusHistory(order);

    // Get tracking information
    const trackingNumbers = this.extractTrackingNumbers(order);

    // Calculate next steps
    const nextSteps = this.calculateNextSteps(order);

    // Get notification preferences
    const notifications = await this.getNotificationPreferences(order.customer.id.toString());

    const trackingInfo: OrderTrackingInfo = {
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      customer: {
        name: order.customer.name,
        email: order.customer.email,
        phone: order.customer.phone
      },
      currentStatus: order.status,
      statusHistory,
      estimatedDelivery: order.shipping?.estimatedDelivery,
      actualDelivery: order.shipping?.actualDelivery,
      trackingNumbers,
      items: order.items.map(item => ({
        productId: item.productId.toString(),
        name: item.name,
        quantity: item.quantity,
        status: item.status,
        trackingInfo: item.status === 'shipped' ? {
          trackingNumber: order.shipping?.trackingNumber || '',
          carrier: order.shipping?.carrier || '',
          status: order.shipping?.status || ''
        } : undefined
      })),
      nextSteps,
      notifications
    };

    return trackingInfo;
  }

  // Update order tracking
  async updateTracking(request: TrackingUpdateRequest): Promise<TrackingUpdateResult> {
    const result: TrackingUpdateResult = {
      success: false,
      orderId: request.orderId,
      previousStatus: '',
      newStatus: request.status,
      notificationsSent: [],
      errors: [],
      warnings: []
    };

    try {
      const order = await Order.findById(request.orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      result.previousStatus = order.status;

      // Validate status transition
      if (!this.isValidStatusTransition(order.status, request.status)) {
        throw new Error(`Invalid status transition from ${order.status} to ${request.status}`);
      }

      // Update order status
      order.status = request.status;
      order.metadata.updatedAt = new Date();
      order.metadata.updatedBy = request.updatedBy;

      // Update tracking information if provided
      if (request.trackingInfo) {
        if (!order.shipping) {
          order.shipping = {
            address: order.customer.shippingAddress || order.customer.billingAddress!,
            method: 'standard',
            cost: 0,
            status: 'pending'
          };
        }

        order.shipping.trackingNumber = request.trackingInfo.trackingNumber;
        order.shipping.carrier = request.trackingInfo.carrier;
        order.shipping.estimatedDelivery = request.trackingInfo.estimatedDelivery || order.shipping.estimatedDelivery;
        order.shipping.status = request.trackingInfo.status || order.shipping.status;
      }

      // Update delivery information if delivered
      if (request.status === 'delivered') {
        order.shipping!.actualDelivery = new Date();
        order.metadata.completedAt = new Date();
        order.metadata.completedBy = request.updatedBy;

        // Update item statuses
        order.items.forEach(item => {
          if (item.status === 'shipped') {
            item.status = 'delivered';
          }
        });
      }

      // Add audit entry
      order.addAuditEntry('order.status_updated', {
        previousStatus: result.previousStatus,
        newStatus: request.status,
        trackingInfo: request.trackingInfo,
        notes: request.notes,
        location: request.location
      }, request.updatedBy);

      await order.save();

      result.newStatus = request.status;

      // Send notifications if requested
      if (request.notifyCustomer) {
        const notifications = await this.sendTrackingNotifications(order, request);
        result.notificationsSent = notifications;
      }

      result.success = true;

    } catch (error) {
      result.errors.push(error.message);
    }

    return result;
  }

  // Confirm delivery
  async confirmDelivery(confirmation: DeliveryConfirmation): Promise<void> {
    const order = await Order.findById(confirmation.orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Update order status
    order.status = 'delivered';
    order.shipping!.actualDelivery = confirmation.deliveryTime;
    order.shipping!.status = 'delivered';
    order.metadata.completedAt = confirmation.deliveryTime;
    order.metadata.completedBy = confirmation.deliveredBy;

    // Update item statuses
    order.items.forEach(item => {
      if (item.status === 'shipped') {
        item.status = 'delivered';
      }
    });

    // Add delivery confirmation to audit
    order.addAuditEntry('order.delivery_confirmed', {
      deliveredBy: confirmation.deliveredBy,
      deliveryTime: confirmation.deliveryTime,
      recipientName: confirmation.recipientName,
      recipientRelation: confirmation.recipientRelation,
      condition: confirmation.condition,
      notes: confirmation.notes,
      hasSignature: !!confirmation.signature,
      hasPhoto: !!confirmation.photo
    }, confirmation.deliveredBy);

    // Store delivery confirmation details (would save to separate collection in production)
    await this.storeDeliveryConfirmation(confirmation);

    await order.save();

    // Send delivery confirmation notifications
    await this.sendDeliveryConfirmationNotifications(order, confirmation);
  }

  // Get customer tracking portal data
  async getCustomerTrackingPortal(customerId: string): Promise<CustomerTrackingPortal> {
    // Get customer's orders
    const orders = await Order.find({ 'customer.id': customerId })
      .sort({ 'metadata.createdAt': -1 })
      .limit(50);

    // Process orders for portal
    const portalOrders = orders.map(order => ({
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      orderDate: order.metadata.createdAt,
      status: order.status,
      totalAmount: order.totals.grandTotal,
      estimatedDelivery: order.shipping?.estimatedDelivery,
      trackingNumbers: order.shipping?.trackingNumber ? [{
        carrier: order.shipping.carrier || 'unknown',
        trackingNumber: order.shipping.trackingNumber,
        link: this.generateTrackingLink(order.shipping.carrier, order.shipping.trackingNumber)
      }] : [],
      items: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        status: item.status,
        image: undefined // Would get product image
      })),
      canTrack: this.canTrackOrder(order),
      canModify: this.canModifyOrder(order),
      canCancel: this.canCancelOrder(order)
    }));

    // Get upcoming deliveries
    const upcomingDeliveries = orders
      .filter(order => order.status === 'shipped' && order.shipping?.estimatedDelivery)
      .map(order => ({
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        estimatedDelivery: order.shipping!.estimatedDelivery!,
        deliveryWindow: this.calculateDeliveryWindow(order.shipping!.estimatedDelivery!),
        address: order.shipping?.address || order.customer.shippingAddress,
        instructions: order.shipping?.deliveryInstructions
      }));

    // Get customer preferences
    const preferences = await this.getCustomerPreferences(customerId);

    return {
      customerId,
      orders: portalOrders,
      preferences,
      upcomingDeliveries
    };
  }

  // Get real-time tracking updates
  async getRealTimeTrackingUpdates(orderId: string): Promise<any> {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Get external tracking updates
    const externalUpdates = await this.getExternalTrackingUpdates(order);

    // Calculate estimated delivery
    const estimatedDelivery = this.calculateEstimatedDelivery(order, externalUpdates);

    // Get current location if available
    const currentLocation = await this.getCurrentLocation(order);

    return {
      orderId,
      orderNumber: order.orderNumber,
      status: order.status,
      lastUpdate: new Date(),
      estimatedDelivery,
      currentLocation,
      trackingUpdates: externalUpdates,
      nextMilestone: this.getNextMilestone(order),
      delays: this.checkForDelays(order, externalUpdates)
    };
  }

  // Helper methods
  private buildStatusHistory(order: IOrder): any[] {
    const history = [];

    // Add initial status
    history.push({
      status: 'created',
      timestamp: order.metadata.createdAt,
      updatedBy: order.metadata.createdBy.toString(),
      location: order.metadata.location
    });

    // Extract status changes from audit trail
    order.audit
      .filter(entry => entry.action.includes('status'))
      .forEach(entry => {
        history.push({
          status: entry.details.newStatus || entry.action,
          timestamp: entry.performedAt,
          updatedBy: entry.performedBy.toString(),
          notes: entry.details.notes,
          location: entry.details.location
        });
      });

    // Add completion/cancellation if applicable
    if (order.metadata.completedAt) {
      history.push({
        status: 'completed',
        timestamp: order.metadata.completedAt,
        updatedBy: order.metadata.completedBy?.toString() || 'system'
      });
    }

    if (order.metadata.cancelledAt) {
      history.push({
        status: 'cancelled',
        timestamp: order.metadata.cancelledAt,
        updatedBy: order.metadata.cancelledBy?.toString() || 'system',
        notes: order.metadata.cancellationReason
      });
    }

    return history.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  private extractTrackingNumbers(order: IOrder): any[] {
    const trackingNumbers = [];

    if (order.shipping?.trackingNumber) {
      trackingNumbers.push({
        carrier: order.shipping.carrier || 'unknown',
        trackingNumber: order.shipping.trackingNumber,
        status: order.shipping.status,
        lastUpdate: order.shipping.shippedAt
      });
    }

    return trackingNumbers;
  }

  private calculateNextSteps(order: IOrder): any[] {
    const steps = [];

    switch (order.status) {
      case 'draft':
        steps.push({
          step: 'Confirm order',
          responsible: 'customer'
        });
        break;

      case 'pending':
        steps.push({
          step: 'Process payment',
          responsible: 'system'
        });
        break;

      case 'confirmed':
        steps.push({
          step: 'Allocate inventory',
          responsible: 'warehouse'
        });
        break;

      case 'processing':
        steps.push({
          step: 'Pick items',
          responsible: 'warehouse'
        });
        steps.push({
          step: 'Pack order',
          responsible: 'warehouse'
        });
        break;

      case 'shipped':
        steps.push({
          step: 'Deliver order',
          estimatedDate: order.shipping?.estimatedDelivery,
          responsible: 'carrier'
        });
        break;

      case 'delivered':
        steps.push({
          step: 'Order complete',
          responsible: 'customer'
        });
        break;
    }

    return steps;
  }

  private async getNotificationPreferences(customerId: string): Promise<any> {
    // Mock implementation - would get actual preferences
    return {
      emailEnabled: true,
      smsEnabled: true,
      pushEnabled: false,
      lastNotification: new Date()
    };
  }

  private isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
    const validTransitions: Record<string, string[]> = {
      'draft': ['pending', 'cancelled'],
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['processing', 'cancelled'],
      'processing': ['shipped', 'cancelled'],
      'shipped': ['delivered', 'cancelled'],
      'delivered': ['completed'],
      'completed': [],
      'cancelled': [],
      'refunded': [],
      'on-hold': ['pending', 'cancelled']
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  private async sendTrackingNotifications(order: IOrder, request: TrackingUpdateRequest): Promise<any[]> {
    const notifications = [];
    const channels = request.notificationChannels || ['email'];

    for (const channel of channels) {
      try {
        await this.notificationService.sendOrderStatusUpdate(order, {
          channel,
          status: request.status,
          trackingInfo: request.trackingInfo,
          notes: request.notes
        });

        notifications.push({
          channel,
          recipient: channel === 'email' ? order.customer.email : order.customer.phone,
          status: 'sent',
          timestamp: new Date()
        });
      } catch (error) {
        notifications.push({
          channel,
          recipient: channel === 'email' ? order.customer.email : order.customer.phone,
          status: 'failed',
          timestamp: new Date()
        });
      }
    }

    return notifications;
  }

  private async storeDeliveryConfirmation(confirmation: DeliveryConfirmation): Promise<void> {
    // Mock implementation - would store in delivery confirmations collection
    console.log('Storing delivery confirmation:', confirmation.orderId);
  }

  private async sendDeliveryConfirmationNotifications(order: IOrder, confirmation: DeliveryConfirmation): Promise<void> {
    await this.notificationService.sendDeliveryConfirmation(order, confirmation);
  }

  private generateTrackingLink(carrier: string, trackingNumber: string): string {
    const trackingLinks = {
      'ups': `https://www.ups.com/track?tracknum=${trackingNumber}`,
      'fedex': `https://www.fedex.com/fedextrack/?tracknumbers=${trackingNumber}`,
      'usps': `https://tools.usps.com/go/TrackConfirmAction_input?qtc_tLabels1=${trackingNumber}`,
      'dhl': `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`
    };

    return trackingLinks[carrier?.toLowerCase()] || '#';
  }

  private canTrackOrder(order: IOrder): boolean {
    return ['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status);
  }

  private canModifyOrder(order: IOrder): boolean {
    return ['draft', 'pending'].includes(order.status);
  }

  private canCancelOrder(order: IOrder): boolean {
    return !['completed', 'cancelled', 'delivered'].includes(order.status);
  }

  private calculateDeliveryWindow(estimatedDelivery: Date): { start: Date; end: Date } {
    const start = new Date(estimatedDelivery);
    start.setHours(start.getHours() - 2);

    const end = new Date(estimatedDelivery);
    end.setHours(end.getHours() + 2);

    return { start, end };
  }

  private async getCustomerPreferences(customerId: string): Promise<any> {
    // Mock implementation - would get actual customer preferences
    return {
      notifications: {
        email: true,
        sms: false,
        push: true,
        frequency: 'important'
      },
      privacy: {
        shareTracking: true,
        allowRealTimeUpdates: true
      }
    };
  }

  private async getExternalTrackingUpdates(order: IOrder): Promise<any[]> {
    // Mock implementation - would integrate with carrier APIs
    return [];
  }

  private calculateEstimatedDelivery(order: IOrder, externalUpdates: any[]): Date | undefined {
    if (order.shipping?.estimatedDelivery) {
      return order.shipping.estimatedDelivery;
    }

    // Calculate based on shipping method and current location
    if (order.status === 'shipped') {
      const estimatedDate = new Date(order.shipping?.shippedAt || Date.now());
      estimatedDate.setDate(estimatedDate.getDate() + 3); // Default 3 days
      return estimatedDate;
    }

    return undefined;
  }

  private async getCurrentLocation(order: IOrder): Promise<any> {
    // Mock implementation - would get real-time location from carrier
    return null;
  }

  private getNextMilestone(order: IOrder): string {
    const milestones = {
      'draft': 'Order Confirmation',
      'pending': 'Payment Processing',
      'confirmed': 'Inventory Allocation',
      'processing': 'Order Shipment',
      'shipped': 'Delivery',
      'delivered': 'Order Complete',
      'completed': 'Order Complete'
    };

    return milestones[order.status] || 'Unknown';
  }

  private checkForDelays(order: IOrder, externalUpdates: any[]): any[] {
    const delays = [];

    // Check if estimated delivery has passed
    if (order.shipping?.estimatedDelivery && new Date() > order.shipping.estimatedDelivery) {
      if (order.status !== 'delivered') {
        delays.push({
          type: 'delivery_delay',
          message: 'Order is delayed beyond estimated delivery date',
          severity: 'high'
        });
      }
    }

    return delays;
  }
}
