import { Customer } from '../../models/Customer';
import { Order } from '../../models/Order';
import { LoyaltyProgram } from '../../models/LoyaltyProgram';

export interface CustomerPurchaseReport {
  customerId: string;
  customerName: string;
  customerSince: Date;
  lifetimeValue: number;
  averageOrderValue: number;
  purchaseFrequency: number; // days between purchases
  totalOrders: number;
  totalSpent: number;
  lastPurchaseDate: Date;
  predictedNextPurchaseDate: Date;
  churnRisk: 'low' | 'medium' | 'high';
  preferredCategories: Array<{
    category: string;
    percentage: number;
  }>;
  purchaseHistory: Array<{
    date: Date;
    orderId: string;
    amount: number;
    items: number;
    categories: string[];
  }>;
  loyaltyTier: string;
  pointsBalance: number;
  tierHistory: Array<{
    tier: string;
    achievedDate: Date;
    requirements: any;
  }>;
}

export interface CustomerSegmentationReport {
  period: {
    startDate: Date;
    endDate: Date;
  };
  segments: Array<{
    segmentId: string;
    name: string;
    type: 'rfm' | 'demographic' | 'behavioral' | 'value';
    description: string;
    size: number;
    percentage: number;
    revenue: number;
    revenuePercentage: number;
    averageOrderValue: number;
    purchaseFrequency: number;
    lifetimeValue: number;
    characteristics: Array<{
      trait: string;
      value: string;
      importance: number;
    }>;
    trends: {
      growth: number;
      migration: Array<{
        fromSegment: string;
        toSegment: string;
        percentage: number;
      }>;
    };
    recommendations: Array<{
      action: string;
      priority: 'high' | 'medium' | 'low';
      expectedImpact: number;
    }>;
  }>;
  analysis: {
    totalCustomers: number;
    totalRevenue: number;
    segmentPerformance: Array<{
      segmentId: string;
      roi: number;
      acquisitionCost: number;
      retentionRate: number;
      churnRate: number;
    }>;
    migrationMatrix: Record<string, Record<string, number>>;
  };
}

export interface CustomerAcquisitionAnalysis {
  period: {
    startDate: Date;
    endDate: Date;
  };
  channels: Array<{
    channelId: string;
    name: string;
    type: 'online' | 'offline' | 'referral' | 'paid' | 'organic';
    metrics: {
      newCustomers: number;
      acquisitionCost: number;
      totalRevenue: number;
      averageOrderValue: number;
      lifetimeValue: number;
      paybackPeriod: number;
      roi: number;
    };
    trends: {
      growth: number;
      costTrend: 'increasing' | 'stable' | 'decreasing';
      qualityTrend: 'improving' | 'stable' | 'declining';
    };
    attribution: {
      firstTouch: number;
      lastTouch: number;
      linear: number;
      timeDecay: number;
    };
  }>;
  funnel: {
    awareness: number;
    consideration: number;
    conversion: number;
    retention: number;
    advocacy: number;
    conversionRates: {
      awarenessToConsideration: number;
      considerationToConversion: number;
      conversionToRetention: number;
    };
  };
  optimization: {
    topPerformingChannels: Array<{
      channelId: string;
      efficiency: number;
      recommendation: string;
    }>;
    underperformingChannels: Array<{
      channelId: string;
      issues: string[];
      recommendations: string[];
    }>;
    budgetReallocation: Array<{
      fromChannel: string;
      toChannel: string;
      amount: number;
      expectedImpact: number;
    }>;
  };
}

export class CustomerReportsService {
  // Generate Customer Purchase History Report
  async generateCustomerPurchaseReport(params: {
    customerId: string;
    includePurchaseHistory?: boolean;
    includeLoyaltyData?: boolean;
    includePredictions?: boolean;
  }): Promise<CustomerPurchaseReport> {
    // Get customer information
    const customer = await this.getCustomerById(params.customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }
    
    // Get customer orders
    const orders = await this.getCustomerOrders(params.customerId);
    
    // Calculate basic metrics
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
    const lastPurchaseDate = orders.length > 0 ? new Date(Math.max(...orders.map(o => new Date(o.createdAt).getTime()))) : new Date(0);
    
    // Calculate purchase frequency
    const purchaseFrequency = this.calculatePurchaseFrequency(orders);
    
    // Calculate lifetime value
    const lifetimeValue = await this.calculateLifetimeValue(params.customerId, orders);
    
    // Predict next purchase date
    let predictedNextPurchaseDate = new Date();
    if (params.includePredictions && orders.length > 1) {
      predictedNextPurchaseDate = this.predictNextPurchaseDate(orders);
    }
    
    // Assess churn risk
    const churnRisk = this.assessChurnRisk(orders, lastPurchaseDate, purchaseFrequency);
    
    // Analyze preferred categories
    const preferredCategories = this.analyzePreferredCategories(orders);
    
    // Generate purchase history if requested
    let purchaseHistory: any[] = [];
    if (params.includePurchaseHistory) {
      purchaseHistory = orders.map(order => ({
        date: new Date(order.createdAt),
        orderId: order.orderId,
        amount: order.totalAmount,
        items: order.items.length,
        categories: order.items.map((item: any) => item.category).filter((cat: string, index: number, arr: string[]) => arr.indexOf(cat) === index)
      }));
    }
    
    // Get loyalty data if requested
    let loyaltyTier = 'Standard';
    let pointsBalance = 0;
    let tierHistory: any[] = [];
    
    if (params.includeLoyaltyData) {
      const loyaltyData = await this.getCustomerLoyaltyData(params.customerId);
      loyaltyTier = loyaltyData.currentTier;
      pointsBalance = loyaltyData.pointsBalance;
      tierHistory = loyaltyData.tierHistory;
    }
    
    return {
      customerId: customer.customerId,
      customerName: customer.name,
      customerSince: new Date(customer.createdAt),
      lifetimeValue,
      averageOrderValue,
      purchaseFrequency,
      totalOrders,
      totalSpent,
      lastPurchaseDate,
      predictedNextPurchaseDate,
      churnRisk,
      preferredCategories,
      purchaseHistory,
      loyaltyTier,
      pointsBalance,
      tierHistory
    };
  }
  
  // Generate Customer Segmentation Report
  async generateCustomerSegmentationReport(params: {
    startDate: Date;
    endDate: Date;
    segmentationType?: 'rfm' | 'demographic' | 'behavioral' | 'all';
    includeMigration?: boolean;
    includePerformance?: boolean;
  }): Promise<CustomerSegmentationReport> {
    const segmentationType = params.segmentationType || 'rfm';
    
    // Get all customers
    const customers = await this.getAllCustomers();
    
    // Get customer orders for the period
    const customerOrders = await this.getCustomerOrdersByPeriod(params.startDate, params.endDate);
    
    // Generate segments based on type
    let segments: any[] = [];
    
    if (segmentationType === 'rfm' || segmentationType === 'all') {
      const rfmSegments = await this.generateRFMSegments(customers, customerOrders);
      segments = segments.concat(rfmSegments);
    }
    
    if (segmentationType === 'demographic' || segmentationType === 'all') {
      const demographicSegments = await this.generateDemographicSegments(customers);
      segments = segments.concat(demographicSegments);
    }
    
    if (segmentationType === 'behavioral' || segmentationType === 'all') {
      const behavioralSegments = await this.generateBehavioralSegments(customers, customerOrders);
      segments = segments.concat(behavioralSegments);
    }
    
    // Calculate segment metrics
    const totalCustomers = customers.length;
    const totalRevenue = Object.values(customerOrders).flat().reduce((sum: number, order: any) => sum + order.totalAmount, 0);
    
    segments = segments.map(segment => {
      const segmentCustomers = customers.filter(c => segment.customerIds.includes(c.customerId));
      const segmentOrders = segment.customerIds.flatMap((cid: string) => customerOrders[cid] || []);
      const segmentRevenue = segmentOrders.reduce((sum: number, order: any) => sum + order.totalAmount, 0);
      
      return {
        ...segment,
        size: segmentCustomers.length,
        percentage: totalCustomers > 0 ? (segmentCustomers.length / totalCustomers) * 100 : 0,
        revenue: segmentRevenue,
        revenuePercentage: totalRevenue > 0 ? (segmentRevenue / totalRevenue) * 100 : 0,
        averageOrderValue: segmentOrders.length > 0 ? segmentRevenue / segmentOrders.length : 0,
        purchaseFrequency: this.calculateAveragePurchaseFrequency(segmentOrders),
        lifetimeValue: this.calculateAverageLifetimeValue(segmentCustomers)
      };
    });
    
    // Generate migration matrix if requested
    let migrationMatrix: Record<string, Record<string, number>> = {};
    if (params.includeMigration) {
      migrationMatrix = await this.generateMigrationMatrix(segments, params.startDate, params.endDate);
    }
    
    // Calculate segment performance if requested
    let segmentPerformance: any[] = [];
    if (params.includePerformance) {
      segmentPerformance = await this.calculateSegmentPerformance(segments, customerOrders);
    }
    
    return {
      period: {
        startDate: params.startDate,
        endDate: params.endDate
      },
      segments,
      analysis: {
        totalCustomers,
        totalRevenue,
        segmentPerformance,
        migrationMatrix
      }
    };
  }
  
  // Generate Customer Acquisition Analysis
  async generateCustomerAcquisitionAnalysis(params: {
    startDate: Date;
    endDate: Date;
    includeAttribution?: boolean;
    includeOptimization?: boolean;
    channels?: string[];
  }): Promise<CustomerAcquisitionAnalysis> {
    // Get acquisition channels
    const channels = await this.getAcquisitionChannels(params.channels);
    
    // Get new customers for the period
    const newCustomers = await this.getNewCustomersByPeriod(params.startDate, params.endDate);
    
    // Calculate channel metrics
    const channelMetrics = await Promise.all(channels.map(async channel => {
      const channelCustomers = newCustomers.filter(c => c.acquisitionChannel === channel.channelId);
      const channelOrders = await this.getCustomerOrdersByPeriod(params.startDate, params.endDate, channelCustomers.map(c => c.customerId));
      
      const totalRevenue = channelOrders.flat().reduce((sum: number, order: any) => sum + order.totalAmount, 0);
      const averageOrderValue = channelOrders.flat().length > 0 ? totalRevenue / channelOrders.flat().length : 0;
      const acquisitionCost = channelCustomers.reduce((sum: number, customer: any) => sum + (customer.acquisitionCost || 0), 0);
      const lifetimeValue = await this.calculateAverageLifetimeValue(channelCustomers);
      const paybackPeriod = acquisitionCost > 0 && averageOrderValue > 0 ? acquisitionCost / averageOrderValue : 0;
      const roi = acquisitionCost > 0 ? ((totalRevenue - acquisitionCost) / acquisitionCost) * 100 : 0;
      
      // Calculate trends
      const trends = await this.calculateChannelTrends(channel.channelId, params.startDate, params.endDate);
      
      // Calculate attribution if requested
      let attribution = null;
      if (params.includeAttribution) {
        attribution = await this.calculateChannelAttribution(channel.channelId, params.startDate, params.endDate);
      }
      
      return {
        channelId: channel.channelId,
        name: channel.name,
        type: channel.type,
        metrics: {
          newCustomers: channelCustomers.length,
          acquisitionCost,
          totalRevenue,
          averageOrderValue,
          lifetimeValue,
          paybackPeriod,
          roi
        },
        trends,
        attribution
      };
    }));
    
    // Generate funnel analysis
    const funnel = await this.generateAcquisitionFunnel(params.startDate, params.endDate);
    
    // Generate optimization recommendations if requested
    let optimization = null;
    if (params.includeOptimization) {
      optimization = await this.generateAcquisitionOptimization(channelMetrics, funnel);
    }
    
    return {
      period: {
        startDate: params.startDate,
        endDate: params.endDate
      },
      channels: channelMetrics,
      funnel,
      optimization
    };
  }
  
  // Helper methods
  private async getCustomerById(customerId: string): Promise<any> {
    // Mock implementation - would query actual customer from database
    return {
      customerId,
      name: 'John Doe',
      createdAt: new Date('2023-01-15')
    };
  }
  
  private async getCustomerOrders(customerId: string): Promise<any[]> {
    // Mock implementation - would query actual orders from database
    return [];
  }
  
  private calculatePurchaseFrequency(orders: any[]): number {
    if (orders.length < 2) return 0;
    
    const sortedDates = orders.map(o => new Date(o.createdAt)).sort((a, b) => a.getTime() - b.getTime());
    const intervals = [];
    
    for (let i = 1; i < sortedDates.length; i++) {
      intervals.push(sortedDates[i].getTime() - sortedDates[i-1].getTime());
    }
    
    const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    return averageInterval / (1000 * 60 * 60 * 24); // Convert to days
  }
  
  private async calculateLifetimeValue(customerId: string, orders: any[]): Promise<number> {
    // Simplified LTV calculation - would use more sophisticated formula in production
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
    const purchaseFrequency = this.calculatePurchaseFrequency(orders);
    const customerLifespan = 365; // days - would calculate based on actual data
    
    return purchaseFrequency > 0 ? (averageOrderValue * (customerLifespan / purchaseFrequency)) : totalRevenue;
  }
  
  private predictNextPurchaseDate(orders: any[]): Date {
    // Simplified prediction - would use machine learning in production
    const purchaseFrequency = this.calculatePurchaseFrequency(orders);
    const lastPurchase = new Date(Math.max(...orders.map(o => new Date(o.createdAt).getTime())));
    
    return new Date(lastPurchase.getTime() + purchaseFrequency * 24 * 60 * 60 * 1000);
  }
  
  private assessChurnRisk(orders: any[], lastPurchaseDate: Date, purchaseFrequency: number): 'low' | 'medium' | 'high' {
    const daysSinceLastPurchase = (Date.now() - lastPurchaseDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (purchaseFrequency === 0) return 'high';
    
    const missedPurchaseCycles = daysSinceLastPurchase / purchaseFrequency;
    
    if (missedPurchaseCycles > 3) return 'high';
    if (missedPurchaseCycles > 1.5) return 'medium';
    return 'low';
  }
  
  private analyzePreferredCategories(orders: any[]): Array<{ category: string; percentage: number }> {
    const categoryCounts: Record<string, number> = {};
    let totalItems = 0;
    
    orders.forEach(order => {
      order.items.forEach((item: any) => {
        const category = item.category || 'uncategorized';
        categoryCounts[category] = (categoryCounts[category] || 0) + item.quantity;
        totalItems += item.quantity;
      });
    });
    
    return Object.entries(categoryCounts)
      .map(([category, count]) => ({
        category,
        percentage: totalItems > 0 ? (count / totalItems) * 100 : 0
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5);
  }
  
  private async getCustomerLoyaltyData(customerId: string): Promise<any> {
    // Mock implementation - would query actual loyalty data
    return {
      currentTier: 'Gold',
      pointsBalance: 2500,
      tierHistory: [
        {
          tier: 'Bronze',
          achievedDate: new Date('2023-01-15'),
          requirements: { minSpent: 0, minOrders: 0 }
        },
        {
          tier: 'Silver',
          achievedDate: new Date('2023-06-15'),
          requirements: { minSpent: 500, minOrders: 10 }
        },
        {
          tier: 'Gold',
          achievedDate: new Date('2024-01-15'),
          requirements: { minSpent: 1500, minOrders: 25 }
        }
      ]
    };
  }
  
  private async getAllCustomers(): Promise<any[]> {
    // Mock implementation - would query all customers from database
    return [];
  }
  
  private async getCustomerOrdersByPeriod(startDate: Date, endDate: Date, customerIds?: string[]): Promise<Record<string, any[]>> {
    // Mock implementation - would query orders by period and customer IDs
    return {};
  }
  
  private async generateRFMSegments(customers: any[], customerOrders: Record<string, any[]>): Promise<any[]> {
    // Mock implementation - would generate actual RFM segments
    return [
      {
        segmentId: 'champions',
        name: 'Champions',
        type: 'rfm' as const,
        description: 'Best customers - recent, frequent, high value',
        customerIds: [],
        characteristics: [
          { trait: 'Recency', value: 'Very Recent', importance: 0.4 },
          { trait: 'Frequency', value: 'High', importance: 0.3 },
          { trait: 'Monetary', value: 'High', importance: 0.3 }
        ],
        trends: { growth: 5, migration: [] },
        recommendations: [
          { action: 'Exclusive offers', priority: 'high' as const, expectedImpact: 15 },
          { action: 'Early access to new products', priority: 'medium' as const, expectedImpact: 10 }
        ]
      },
      {
        segmentId: 'at-risk',
        name: 'At Risk',
        type: 'rfm' as const,
        description: 'Previously good customers who haven\'t purchased recently',
        customerIds: [],
        characteristics: [
          { trait: 'Recency', value: 'Low', importance: 0.5 },
          { trait: 'Frequency', value: 'Medium', importance: 0.3 },
          { trait: 'Monetary', value: 'Medium', importance: 0.2 }
        ],
        trends: { growth: -10, migration: [] },
        recommendations: [
          { action: 'Re-engagement campaign', priority: 'high' as const, expectedImpact: 20 },
          { action: 'Special discounts', priority: 'medium' as const, expectedImpact: 15 }
        ]
      }
    ];
  }
  
  private async generateDemographicSegments(customers: any[]): Promise<any[]> {
    // Mock implementation - would generate actual demographic segments
    return [
      {
        segmentId: 'young-professionals',
        name: 'Young Professionals',
        type: 'demographic' as const,
        description: 'Customers aged 25-35 with higher education',
        customerIds: [],
        characteristics: [
          { trait: 'Age Range', value: '25-35', importance: 0.4 },
          { trait: 'Education', value: 'College Degree', importance: 0.3 },
          { trait: 'Income Level', value: 'Above Average', importance: 0.3 }
        ],
        trends: { growth: 8, migration: [] },
        recommendations: [
          { action: 'Premium product recommendations', priority: 'medium' as const, expectedImpact: 12 },
          { action: 'Professional networking events', priority: 'low' as const, expectedImpact: 8 }
        ]
      }
    ];
  }
  
  private async generateBehavioralSegments(customers: any[], customerOrders: Record<string, any[]>): Promise<any[]> {
    // Mock implementation - would generate actual behavioral segments
    return [
      {
        segmentId: 'bargain-hunters',
        name: 'Bargain Hunters',
        type: 'behavioral' as const,
        description: 'Customers who primarily purchase discounted items',
        customerIds: [],
        characteristics: [
          { trait: 'Purchase Pattern', value: 'Discount-driven', importance: 0.5 },
          { trait: 'Price Sensitivity', value: 'High', importance: 0.3 },
          { trait: 'Brand Loyalty', value: 'Low', importance: 0.2 }
        ],
        trends: { growth: 3, migration: [] },
        recommendations: [
          { action: 'Flash sales notifications', priority: 'high' as const, expectedImpact: 18 },
          { action: 'Loyalty program promotion', priority: 'medium' as const, expectedImpact: 12 }
        ]
      }
    ];
  }
  
  private calculateAveragePurchaseFrequency(orders: any[]): number {
    if (orders.length === 0) return 0;
    
    const frequencies = orders.map(customerOrders => this.calculatePurchaseFrequency(customerOrders));
    return frequencies.reduce((sum, freq) => sum + freq, 0) / frequencies.length;
  }
  
  private calculateAverageLifetimeValue(customers: any[]): number {
    if (customers.length === 0) return 0;
    
    // Mock calculation - would use actual LTV data
    return customers.reduce((sum, customer) => sum + (customer.lifetimeValue || 0), 0) / customers.length;
  }
  
  private async generateMigrationMatrix(segments: any[], startDate: Date, endDate: Date): Promise<Record<string, Record<string, number>>> {
    // Mock implementation - would generate actual migration matrix
    return {};
  }
  
  private async calculateSegmentPerformance(segments: any[], customerOrders: Record<string, any[]>): Promise<any[]> {
    // Mock implementation - would calculate actual segment performance
    return segments.map(segment => ({
      segmentId: segment.segmentId,
      roi: 25.5,
      acquisitionCost: 50,
      retentionRate: 0.85,
      churnRate: 0.15
    }));
  }
  
  private async getAcquisitionChannels(channelIds?: string[]): Promise<any[]> {
    // Mock implementation - would get actual acquisition channels
    return [
      {
        channelId: 'organic-search',
        name: 'Organic Search',
        type: 'organic' as const
      },
      {
        channelId: 'paid-social',
        name: 'Paid Social Media',
        type: 'paid' as const
      },
      {
        channelId: 'referral',
        name: 'Customer Referrals',
        type: 'referral' as const
      }
    ];
  }
  
  private async getNewCustomersByPeriod(startDate: Date, endDate: Date): Promise<any[]> {
    // Mock implementation - would get actual new customers
    return [];
  }
  
  private async calculateChannelTrends(channelId: string, startDate: Date, endDate: Date): Promise<any> {
    // Mock implementation - would calculate actual trends
    return {
      growth: 15.5,
      costTrend: 'stable' as const,
      qualityTrend: 'improving' as const
    };
  }
  
  private async calculateChannelAttribution(channelId: string, startDate: Date, endDate: Date): Promise<any> {
    // Mock implementation - would calculate actual attribution
    return {
      firstTouch: 0.3,
      lastTouch: 0.4,
      linear: 0.2,
      timeDecay: 0.1
    };
  }
  
  private async generateAcquisitionFunnel(startDate: Date, endDate: Date): Promise<any> {
    // Mock implementation - would generate actual funnel data
    return {
      awareness: 10000,
      consideration: 2500,
      conversion: 500,
      retention: 400,
      advocacy: 100,
      conversionRates: {
        awarenessToConsideration: 25,
        considerationToConversion: 20,
        conversionToRetention: 80
      }
    };
  }
  
  private async generateAcquisitionOptimization(channelMetrics: any[], funnel: any): Promise<any> {
    // Mock implementation - would generate actual optimization recommendations
    return {
      topPerformingChannels: [
        {
          channelId: 'organic-search',
          efficiency: 85.5,
          recommendation: 'Increase budget allocation'
        }
      ],
      underperformingChannels: [
        {
          channelId: 'paid-social',
          issues: ['High acquisition cost', 'Low conversion rate'],
          recommendations: ['Optimize ad targeting', 'Improve landing pages']
        }
      ],
      budgetReallocation: [
        {
          fromChannel: 'paid-social',
          toChannel: 'organic-search',
          amount: 5000,
          expectedImpact: 15
        }
      ]
    };
  }
}
