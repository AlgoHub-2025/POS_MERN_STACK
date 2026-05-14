import { Order } from '../../models/Order';
import { Product } from '../../models/Product';
import { Customer } from '../../models/Customer';
import { Employee } from '../../models/Employee';

export interface DailySalesReport {
  date: Date;
  summary: {
    revenue: number;
    previousDayRevenue: number;
    percentageChange: number;
    transactions: number;
    averageOrderValue: number;
    itemsSold: number;
    returns: number;
    netSales: number;
    tax: number;
    discounts: number;
  };
  hourlyBreakdown: Array<{
    hour: number;
    revenue: number;
    transactions: number;
    averageOrderValue: number;
  }>;
  byPaymentMethod: Array<{
    method: string;
    amount: number;
    count: number;
    percentage: number;
  }>;
  byCategory: Array<{
    category: string;
    revenue: number;
    items: number;
    percentage: number;
  }>;
  topProducts: Array<{
    productId: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  bottomProducts: Array<{
    productId: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
}

export interface WeeklySalesReport {
  weekStart: Date;
  weekEnd: Date;
  summary: {
    totalRevenue: number;
    previousWeekRevenue: number;
    percentageChange: number;
    dailyAverage: number;
    transactions: number;
    averageOrderValue: number;
    itemsSold: number;
    weekendRevenue: number;
    weekdayRevenue: number;
    weekendPercentage: number;
  };
  dailyBreakdown: Array<{
    date: Date;
    dayName: string;
    revenue: number;
    transactions: number;
    averageOrderValue: number;
    dayOfWeek: number;
  }>;
  byCategory: Array<{
    category: string;
    revenue: number;
    items: number;
    percentage: number;
    growth: number;
  }>;
  topProducts: Array<{
    productId: string;
    name: string;
    quantity: number;
    revenue: number;
    growth: number;
  }>;
  trends: {
    bestDay: string;
    worstDay: string;
    peakHour: number;
    growthTrend: 'up' | 'down' | 'stable';
    weeklyForecast: number;
  };
}

export interface MonthlySalesReport {
  month: Date;
  summary: {
    totalRevenue: number;
    previousMonthRevenue: number;
    previousYearRevenue: number;
    monthOverMonthChange: number;
    yearOverYearChange: number;
    dailyAverage: number;
    transactions: number;
    averageOrderValue: number;
    itemsSold: number;
    cumulativeYTD: number;
    ytdTarget: number;
    ytdAchievement: number;
  };
  weeklyBreakdown: Array<{
    weekStart: Date;
    weekEnd: Date;
    weekNumber: number;
    revenue: number;
    transactions: number;
    averageOrderValue: number;
    growth: number;
  }>;
  byCategory: Array<{
    category: string;
    revenue: number;
    items: number;
    percentage: number;
    monthOverMonthGrowth: number;
    yearOverYearGrowth: number;
    contribution: number;
  }>;
  topProducts: Array<{
    productId: string;
    name: string;
    quantity: number;
    revenue: number;
    monthOverMonthGrowth: number;
    yearOverYearGrowth: number;
  }>;
  seasonality: {
    seasonalIndex: number;
    seasonalCategory: 'high' | 'medium' | 'low';
    seasonalFactors: Array<{
      factor: string;
      impact: number;
      description: string;
    }>;
  };
  projections: {
    nextMonthForecast: number;
    nextQuarterForecast: number;
    annualProjection: number;
    confidence: number;
  };
}

export interface TopProductsReport {
  period: {
    startDate: Date;
    endDate: Date;
  };
  rankingMetric: 'revenue' | 'quantity' | 'profit' | 'margin';
  products: Array<{
    productId: string;
    name: string;
    sku: string;
    category: string;
    rank: number;
    revenue: number;
    quantity: number;
    profit: number;
    margin: number;
    previousPeriodRevenue: number;
    growth: number;
    contributionPercentage: number;
    cumulativeContribution: number;
  }>;
  summary: {
    totalRevenue: number;
    totalQuantity: number;
    totalProfit: number;
    topProductConcentration: number;
    paretoAnalysis: {
      top20PercentProductsRevenue: number;
      top20PercentProductsPercentage: number;
    };
  };
}

export interface ProductPerformanceTrends {
  period: {
    startDate: Date;
    endDate: Date;
  };
  products: Array<{
    productId: string;
    name: string;
    category: string;
    currentPeriod: {
      revenue: number;
      quantity: number;
      averagePrice: number;
    };
    previousPeriod: {
      revenue: number;
      quantity: number;
      averagePrice: number;
    };
    trends: {
      revenueGrowth: number;
      quantityGrowth: number;
      priceGrowth: number;
      movingAverage3Month: number;
      movingAverage6Month: number;
      seasonalityIndex: number;
      lifecycleStage: 'introduction' | 'growth' | 'maturity' | 'decline';
    };
    forecasting: {
      nextPeriodForecast: number;
      confidence: number;
      trendDirection: 'up' | 'down' | 'stable';
    };
  }>;
  insights: {
    emergingStars: Array<{
      productId: string;
      name: string;
      growthRate: number;
      confidence: number;
    }>;
    decliningProducts: Array<{
      productId: string;
      name: string;
      declineRate: number;
      urgency: 'low' | 'medium' | 'high';
    }>;
    seasonalProducts: Array<{
      productId: string;
      name: string;
      seasonalPattern: string;
      peakMonths: number[];
    }>;
  };
}

export interface ProductCategoryAnalysis {
  period: {
    startDate: Date;
    endDate: Date;
  };
  categories: Array<{
    categoryId: string;
    name: string;
    parentCategory?: string;
    level: number;
    metrics: {
      revenue: number;
      previousPeriodRevenue: number;
      growth: number;
      quantity: number;
      averageOrderValue: number;
      profit: number;
      margin: number;
      contribution: number;
    };
    products: {
      total: number;
      active: number;
      topPerformers: number;
      underPerformers: number;
    };
    trends: {
      growthTrend: 'accelerating' | 'steady' | 'decelerating' | 'declining';
      marketShare: number;
      marketShareChange: number;
      competitivePosition: 'leader' | 'challenger' | 'follower' | 'niche';
    };
    recommendations: Array<{
      type: 'pricing' | 'promotion' | 'inventory' | 'assortment';
      priority: 'high' | 'medium' | 'low';
      description: string;
      expectedImpact: number;
    }>;
  }>;
  hierarchy: Array<{
    level: number;
    categories: Array<{
      categoryId: string;
      name: string;
      revenue: number;
      percentage: number;
    }>;
  }>;
  crossCategory: {
    correlationMatrix: Record<string, Record<string, number>>;
    complementaryPairs: Array<{
      category1: string;
      category2: string;
      correlation: number;
      lift: number;
    }>;
    cannibalizationRisk: Array<{
      category: string;
      atRiskCategory: string;
      riskLevel: 'low' | 'medium' | 'high';
      recommendation: string;
    }>;
  };
}

export interface CustomerPurchaseReport {
  customerId: string;
  customerName: string;
  customerSince: Date;
  lifetimeValue: number;
  averageOrderValue: number;
  purchaseFrequency: number;
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

export interface SalesRepPerformanceReport {
  employeeId: string;
  employeeName: string;
  position: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  metrics: {
    revenue: number;
    revenueTarget: number;
    revenueAchievement: number;
    transactions: number;
    transactionTarget: number;
    averageOrderValue: number;
    itemsPerTransaction: number;
    returns: number;
    returnRate: number;
    customerSatisfaction: number;
    upsellRate: number;
    crossSellRate: number;
  };
  dailyBreakdown: Array<{
    date: Date;
    revenue: number;
    transactions: number;
    averageOrderValue: number;
  }>;
  topProducts: Array<{
    productId: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  ranking: {
    rank: number;
    totalReps: number;
    percentile: number;
    previousRank?: number;
    rankChange: number;
  };
  commission: {
    earned: number;
    projected: number;
    rate: number;
    breakdown: Array<{
      product: string;
      quantity: number;
      commission: number;
    }>;
  };
}

export interface TeamPerformanceReport {
  teamId: string;
  teamName: string;
  managerId: string;
  managerName: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  summary: {
    totalRevenue: number;
    revenueTarget: number;
    achievement: number;
    totalTransactions: number;
    averageOrderValue: number;
    teamSize: number;
    averagePerRep: number;
    topPerformer: string;
    bottomPerformer: string;
  };
  members: Array<{
    employeeId: string;
    employeeName: string;
    revenue: number;
    achievement: number;
    contribution: number;
    rank: number;
  }>;
  trends: {
    revenueGrowth: number;
    productivityTrend: 'improving' | 'stable' | 'declining';
    collaborationScore: number;
    teamMomentum: number;
  };
  benchmarking: {
    vsOtherTeams: Array<{
      teamName: string;
      revenue: number;
      difference: number;
      ranking: number;
    }>;
    vsHistorical: Array<{
      period: string;
      revenue: number;
      growth: number;
    }>;
  };
  recommendations: Array<{
    type: 'training' | 'incentives' | 'staffing' | 'process';
    priority: 'high' | 'medium' | 'low';
    description: string;
    expectedImpact: number;
  }>;
}

export interface StaffProductivityAnalysis {
  period: {
    startDate: Date;
    endDate: Date;
  };
  employees: Array<{
    employeeId: string;
    employeeName: string;
    position: string;
    department: string;
    productivity: {
      transactionsPerHour: number;
      revenuePerHour: number;
      itemsPerHour: number;
      averageProcessingTime: number;
      accuracy: number;
      customerSatisfaction: number;
    };
    performance: {
      efficiency: number;
      quality: number;
      speed: number;
      overall: number;
      ranking: number;
      percentile: number;
    };
    trends: {
      productivityTrend: 'improving' | 'stable' | 'declining';
      learningCurve: number;
      peakHours: Array<number>;
      lowProductivityPeriods: Array<{
        start: Date;
        end: Date;
        reason?: string;
      }>;
    };
    development: {
      trainingNeeds: Array<string>;
      skillGaps: Array<string>;
      careerPath: string;
      promotionReadiness: number;
    };
  }>;
  departmentAnalysis: Array<{
    department: string;
    averageProductivity: number;
    topPerformer: string;
    bottomPerformer: string;
    variance: number;
    improvementOpportunities: Array<string>;
  }>;
  scheduling: {
    optimalShiftPatterns: Array<{
      shift: string;
      recommendedStaff: number;
      expectedProductivity: number;
    }>;
    underutilizedPeriods: Array<{
      period: string;
      currentStaff: number;
      recommendedStaff: number;
      potentialSavings: number;
    }>;
    peakPeriodAnalysis: Array<{
      period: string;
      demand: number;
      currentCapacity: number;
      gap: number;
      recommendation: string;
    }>;
  };
  insights: {
    topPerformers: Array<{
      employeeId: string;
      employeeName: string;
      strength: string;
      recommendation: string;
    }>;
    improvementCandidates: Array<{
      employeeId: string;
      employeeName: string;
      areas: Array<string>;
      actionPlan: string;
    }>;
    retentionRisks: Array<{
      employeeId: string;
      employeeName: string;
      riskFactors: Array<string>;
      mitigation: string;
    }>;
  };
}

export class SalesReportsService {
  // Generate Daily Sales Summary
  async generateDailySalesReport(params: {
    date: Date;
    locationId?: string;
    includeComparisons?: boolean;
    includeForecasts?: boolean;
    format?: 'json' | 'pdf' | 'excel';
  }): Promise<DailySalesReport> {
    const targetDate = new Date(params.date);
    const previousDate = new Date(targetDate.getTime() - 24 * 60 * 60 * 1000);
    
    // Get orders for the target date
    const orders = await this.getOrdersByDate(targetDate, params.locationId);
    const previousOrders = await this.getOrdersByDate(previousDate, params.locationId);
    
    // Calculate summary metrics
    const revenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const previousRevenue = previousOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const percentageChange = previousRevenue > 0 ? ((revenue - previousRevenue) / previousRevenue) * 100 : 0;
    
    const transactions = orders.length;
    const averageOrderValue = transactions > 0 ? revenue / transactions : 0;
    const itemsSold = orders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
    
    // Calculate returns and net sales
    const returns = orders.filter(order => order.status === 'returned').reduce((sum, order) => sum + order.totalAmount, 0);
    const netSales = revenue - returns;
    
    // Calculate tax and discounts
    const tax = orders.reduce((sum, order) => sum + (order.taxAmount || 0), 0);
    const discounts = orders.reduce((sum, order) => sum + (order.discountAmount || 0), 0);
    
    // Generate hourly breakdown
    const hourlyBreakdown = await this.generateHourlyBreakdown(orders);
    
    // Generate payment method breakdown
    const byPaymentMethod = await this.generatePaymentMethodBreakdown(orders);
    
    // Generate category breakdown
    const byCategory = await this.generateCategoryBreakdown(orders);
    
    // Get top and bottom products
    const topProducts = await this.getTopProducts(orders, 10);
    const bottomProducts = await this.getBottomProducts(orders, 5);
    
    const report: DailySalesReport = {
      date: targetDate,
      summary: {
        revenue,
        previousDayRevenue: previousRevenue,
        percentageChange,
        transactions,
        averageOrderValue,
        itemsSold,
        returns,
        netSales,
        tax,
        discounts
      },
      hourlyBreakdown,
      byPaymentMethod,
      byCategory,
      topProducts,
      bottomProducts
    };
    
    return report;
  }
  
  // Generate Weekly Sales Summary
  async generateWeeklySalesReport(params: {
    weekStart: Date;
    locationId?: string;
    includeComparisons?: boolean;
    format?: 'json' | 'pdf' | 'excel';
  }): Promise<WeeklySalesReport> {
    const weekStart = new Date(params.weekStart);
    const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
    const previousWeekStart = new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const previousWeekEnd = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Get orders for both weeks
    const orders = await this.getOrdersByDateRange(weekStart, weekEnd, params.locationId);
    const previousOrders = await this.getOrdersByDateRange(previousWeekStart, previousWeekEnd, params.locationId);
    
    // Calculate summary metrics
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const previousWeekRevenue = previousOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const percentageChange = previousWeekRevenue > 0 ? ((totalRevenue - previousWeekRevenue) / previousWeekRevenue) * 100 : 0;
    const dailyAverage = totalRevenue / 7;
    const transactions = orders.length;
    const averageOrderValue = transactions > 0 ? totalRevenue / transactions : 0;
    const itemsSold = orders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
    
    // Calculate weekend vs weekday revenue
    const weekendOrders = orders.filter(order => {
      const day = new Date(order.createdAt).getDay();
      return day === 0 || day === 6; // Sunday or Saturday
    });
    const weekendRevenue = weekendOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const weekdayRevenue = totalRevenue - weekendRevenue;
    const weekendPercentage = totalRevenue > 0 ? (weekendRevenue / totalRevenue) * 100 : 0;
    
    // Generate daily breakdown
    const dailyBreakdown = await this.generateDailyBreakdown(weekStart, weekEnd, params.locationId);
    
    // Generate category breakdown
    const byCategory = await this.generateCategoryBreakdown(orders);
    
    // Get top products with growth
    const topProducts = await this.getTopProductsWithGrowth(orders, previousOrders, 10);
    
    // Analyze trends
    const trends = await this.analyzeWeeklyTrends(dailyBreakdown, orders);
    
    const report: WeeklySalesReport = {
      weekStart,
      weekEnd,
      summary: {
        totalRevenue,
        previousWeekRevenue,
        percentageChange,
        dailyAverage,
        transactions,
        averageOrderValue,
        itemsSold,
        weekendRevenue,
        weekdayRevenue,
        weekendPercentage
      },
      dailyBreakdown,
      byCategory,
      topProducts,
      trends
    };
    
    return report;
  }
  
  // Generate Monthly Sales Summary
  async generateMonthlySalesReport(params: {
    month: Date;
    locationId?: string;
    includeYTD?: boolean;
    includeProjections?: boolean;
    format?: 'json' | 'pdf' | 'excel';
  }): Promise<MonthlySalesReport> {
    const month = new Date(params.month);
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    
    // Calculate date ranges
    const monthStart = new Date(year, monthIndex, 1);
    const monthEnd = new Date(year, monthIndex + 1, 0, 23, 59, 59);
    const previousMonthStart = new Date(year, monthIndex - 1, 1);
    const previousMonthEnd = new Date(year, monthIndex, 0, 23, 59, 59);
    const previousYearMonthStart = new Date(year - 1, monthIndex, 1);
    const previousYearMonthEnd = new Date(year - 1, monthIndex + 1, 0, 23, 59, 59);
    
    // Get orders for all periods
    const orders = await this.getOrdersByDateRange(monthStart, monthEnd, params.locationId);
    const previousMonthOrders = await this.getOrdersByDateRange(previousMonthStart, previousMonthEnd, params.locationId);
    const previousYearOrders = await this.getOrdersByDateRange(previousYearMonthStart, previousYearMonthEnd, params.locationId);
    
    // Get YTD orders if requested
    let ytdOrders: any[] = [];
    if (params.includeYTD) {
      const ytdStart = new Date(year, 0, 1);
      ytdOrders = await this.getOrdersByDateRange(ytdStart, monthEnd, params.locationId);
    }
    
    // Calculate summary metrics
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const previousMonthRevenue = previousMonthOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const previousYearRevenue = previousYearOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const monthOverMonthChange = previousMonthRevenue > 0 ? ((totalRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 : 0;
    const yearOverYearChange = previousYearRevenue > 0 ? ((totalRevenue - previousYearRevenue) / previousYearRevenue) * 100 : 0;
    const dailyAverage = totalRevenue / monthEnd.getDate();
    const transactions = orders.length;
    const averageOrderValue = transactions > 0 ? totalRevenue / transactions : 0;
    const itemsSold = orders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
    
    // Calculate YTD metrics
    const cumulativeYTD = ytdOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const ytdTarget = 1000000; // Mock target - should come from configuration
    const ytdAchievement = ytdTarget > 0 ? (cumulativeYTD / ytdTarget) * 100 : 0;
    
    // Generate weekly breakdown
    const weeklyBreakdown = await this.generateWeeklyBreakdown(monthStart, monthEnd, params.locationId);
    
    // Generate category breakdown with growth
    const byCategory = await this.generateCategoryBreakdownWithGrowth(orders, previousMonthOrders, previousYearOrders);
    
    // Get top products with growth
    const topProducts = await this.getTopProductsWithGrowth(orders, previousMonthOrders, 10);
    
    // Analyze seasonality
    const seasonality = await this.analyzeSeasonality(month, orders);
    
    // Generate projections if requested
    let projections: any = null;
    if (params.includeProjections) {
      projections = await this.generateMonthlyProjections(orders, ytdOrders);
    }
    
    const report: MonthlySalesReport = {
      month,
      summary: {
        totalRevenue,
        previousMonthRevenue,
        previousYearRevenue,
        monthOverMonthChange,
        yearOverYearChange,
        dailyAverage,
        transactions,
        averageOrderValue,
        itemsSold,
        cumulativeYTD,
        ytdTarget,
        ytdAchievement
      },
      weeklyBreakdown,
      byCategory,
      topProducts,
      seasonality,
      projections
    };
    
    return report;
  }
  
  // Helper methods
  private async getOrdersByDate(date: Date, locationId?: string): Promise<any[]> {
    // Mock implementation - would query actual orders from database
    return [];
  }
  
  private async getOrdersByDateRange(startDate: Date, endDate: Date, locationId?: string): Promise<any[]> {
    // Mock implementation - would query actual orders from database
    return [];
  }
  
  private async generateHourlyBreakdown(orders: any[]): Promise<any[]> {
    const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      revenue: 0,
      transactions: 0,
      averageOrderValue: 0
    }));
    
    orders.forEach(order => {
      const hour = new Date(order.createdAt).getHours();
      hourlyData[hour].revenue += order.totalAmount;
      hourlyData[hour].transactions += 1;
    });
    
    hourlyData.forEach(hour => {
      hour.averageOrderValue = hour.transactions > 0 ? hour.revenue / hour.transactions : 0;
    });
    
    return hourlyData;
  }
  
  private async generatePaymentMethodBreakdown(orders: any[]): Promise<any[]> {
    const paymentMethods: Record<string, { amount: number; count: number }> = {};
    
    orders.forEach(order => {
      const method = order.paymentMethod || 'cash';
      if (!paymentMethods[method]) {
        paymentMethods[method] = { amount: 0, count: 0 };
      }
      paymentMethods[method].amount += order.totalAmount;
      paymentMethods[method].count += 1;
    });
    
    const totalAmount = Object.values(paymentMethods).reduce((sum, pm) => sum + pm.amount, 0);
    
    return Object.entries(paymentMethods).map(([method, data]) => ({
      method,
      amount: data.amount,
      count: data.count,
      percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0
    }));
  }
  
  private async generateCategoryBreakdown(orders: any[]): Promise<any[]> {
    const categories: Record<string, { revenue: number; items: number }> = {};
    
    orders.forEach(order => {
      order.items.forEach((item: any) => {
        const category = item.category || 'uncategorized';
        if (!categories[category]) {
          categories[category] = { revenue: 0, items: 0 };
        }
        categories[category].revenue += item.price * item.quantity;
        categories[category].items += item.quantity;
      });
    });
    
    const totalRevenue = Object.values(categories).reduce((sum, cat) => sum + cat.revenue, 0);
    
    return Object.entries(categories).map(([category, data]) => ({
      category,
      revenue: data.revenue,
      items: data.items,
      percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0
    }));
  }
  
  private async getTopProducts(orders: any[], limit: number): Promise<any[]> {
    const products: Record<string, { name: string; quantity: number; revenue: number }> = {};
    
    orders.forEach(order => {
      order.items.forEach((item: any) => {
        if (!products[item.productId]) {
          products[item.productId] = { name: item.name, quantity: 0, revenue: 0 };
        }
        products[item.productId].quantity += item.quantity;
        products[item.productId].revenue += item.price * item.quantity;
      });
    });
    
    return Object.entries(products)
      .map(([productId, data]) => ({ productId, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  }
  
  private async getBottomProducts(orders: any[], limit: number): Promise<any[]> {
    const products: Record<string, { name: string; quantity: number; revenue: number }> = {};
    
    orders.forEach(order => {
      order.items.forEach((item: any) => {
        if (!products[item.productId]) {
          products[item.productId] = { name: item.name, quantity: 0, revenue: 0 };
        }
        products[item.productId].quantity += item.quantity;
        products[item.productId].revenue += item.price * item.quantity;
      });
    });
    
    return Object.entries(products)
      .map(([productId, data]) => ({ productId, ...data }))
      .sort((a, b) => a.revenue - b.revenue)
      .slice(0, limit);
  }
  
  private async generateDailyBreakdown(weekStart: Date, weekEnd: Date, locationId?: string): Promise<any[]> {
    const dailyData = [];
    const currentDate = new Date(weekStart);
    
    while (currentDate <= weekEnd) {
      const dayOrders = await this.getOrdersByDate(currentDate, locationId);
      const revenue = dayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      const transactions = dayOrders.length;
      const averageOrderValue = transactions > 0 ? revenue / transactions : 0;
      
      dailyData.push({
        date: new Date(currentDate),
        dayName: currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
        revenue,
        transactions,
        averageOrderValue,
        dayOfWeek: currentDate.getDay()
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dailyData;
  }
  
  private async getTopProductsWithGrowth(currentOrders: any[], previousOrders: any[], limit: number): Promise<any[]> {
    const currentProducts: Record<string, { name: string; quantity: number; revenue: number }> = {};
    const previousProducts: Record<string, { revenue: number }> = {};
    
    currentOrders.forEach(order => {
      order.items.forEach((item: any) => {
        if (!currentProducts[item.productId]) {
          currentProducts[item.productId] = { name: item.name, quantity: 0, revenue: 0 };
        }
        currentProducts[item.productId].quantity += item.quantity;
        currentProducts[item.productId].revenue += item.price * item.quantity;
      });
    });
    
    previousOrders.forEach(order => {
      order.items.forEach((item: any) => {
        if (!previousProducts[item.productId]) {
          previousProducts[item.productId] = { revenue: 0 };
        }
        previousProducts[item.productId].revenue += item.price * item.quantity;
      });
    });
    
    return Object.entries(currentProducts)
      .map(([productId, data]) => ({
        productId,
        name: data.name,
        quantity: data.quantity,
        revenue: data.revenue,
        growth: previousProducts[productId] ? 
          ((data.revenue - previousProducts[productId].revenue) / previousProducts[productId].revenue) * 100 : 0
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  }
  
  private async analyzeWeeklyTrends(dailyBreakdown: any[], orders: any[]): Promise<any> {
    const bestDay = dailyBreakdown.reduce((best, day) => 
      day.revenue > best.revenue ? day : best, dailyBreakdown[0]);
    const worstDay = dailyBreakdown.reduce((worst, day) => 
      day.revenue < worst.revenue ? day : worst, dailyBreakdown[0]);
    
    // Calculate peak hour from all orders
    const hourlyCount: Record<number, number> = {};
    orders.forEach(order => {
      const hour = new Date(order.createdAt).getHours();
      hourlyCount[hour] = (hourlyCount[hour] || 0) + 1;
    });
    
    const peakHour = Object.entries(hourlyCount)
      .reduce((peak, [hour, count]) => count > peak.count ? { hour: parseInt(hour), count } : peak, 
              { hour: 0, count: 0 }).hour;
    
    // Determine growth trend (simplified)
    const totalRevenue = dailyBreakdown.reduce((sum, day) => sum + day.revenue, 0);
    const firstHalfRevenue = dailyBreakdown.slice(0, 3).reduce((sum, day) => sum + day.revenue, 0);
    const secondHalfRevenue = dailyBreakdown.slice(4).reduce((sum, day) => sum + day.revenue, 0);
    const growthTrend = secondHalfRevenue > firstHalfRevenue ? 'up' : secondHalfRevenue < firstHalfRevenue ? 'down' : 'stable';
    
    // Simple weekly forecast (would use more sophisticated forecasting in production)
    const weeklyForecast = totalRevenue * 1.05; // 5% growth assumption
    
    return {
      bestDay: bestDay.dayName,
      worstDay: worstDay.dayName,
      peakHour,
      growthTrend,
      weeklyForecast
    };
  }
  
  private async generateWeeklyBreakdown(monthStart: Date, monthEnd: Date, locationId?: string): Promise<any[]> {
    const weeklyData = [];
    const currentDate = new Date(monthStart);
    let weekNumber = 1;
    
    while (currentDate <= monthEnd) {
      const weekStart = new Date(currentDate);
      const weekEnd = new Date(Math.min(currentDate.getTime() + 6 * 24 * 60 * 60 * 1000, monthEnd.getTime()));
      
      const weekOrders = await this.getOrdersByDateRange(weekStart, weekEnd, locationId);
      const revenue = weekOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      const transactions = weekOrders.length;
      const averageOrderValue = transactions > 0 ? revenue / transactions : 0;
      
      // Calculate growth (simplified - would compare with previous week in production)
      const growth = 0; // Placeholder
      
      weeklyData.push({
        weekStart,
        weekEnd,
        weekNumber,
        revenue,
        transactions,
        averageOrderValue,
        growth
      });
      
      currentDate.setDate(currentDate.getDate() + 7);
      weekNumber++;
    }
    
    return weeklyData;
  }
  
  private async generateCategoryBreakdownWithGrowth(currentOrders: any[], previousMonthOrders: any[], previousYearOrders: any[]): Promise<any[]> {
    const currentCategories: Record<string, { revenue: number; items: number }> = {};
    const previousMonthCategories: Record<string, { revenue: number }> = {};
    const previousYearCategories: Record<string, { revenue: number }> = {};
    
    // Process current orders
    currentOrders.forEach(order => {
      order.items.forEach((item: any) => {
        const category = item.category || 'uncategorized';
        if (!currentCategories[category]) {
          currentCategories[category] = { revenue: 0, items: 0 };
        }
        currentCategories[category].revenue += item.price * item.quantity;
        currentCategories[category].items += item.quantity;
      });
    });
    
    // Process previous month orders
    previousMonthOrders.forEach(order => {
      order.items.forEach((item: any) => {
        const category = item.category || 'uncategorized';
        if (!previousMonthCategories[category]) {
          previousMonthCategories[category] = { revenue: 0 };
        }
        previousMonthCategories[category].revenue += item.price * item.quantity;
      });
    });
    
    // Process previous year orders
    previousYearOrders.forEach(order => {
      order.items.forEach((item: any) => {
        const category = item.category || 'uncategorized';
        if (!previousYearCategories[category]) {
          previousYearCategories[category] = { revenue: 0 };
        }
        previousYearCategories[category].revenue += item.price * item.quantity;
      });
    });
    
    const totalRevenue = Object.values(currentCategories).reduce((sum, cat) => sum + cat.revenue, 0);
    
    return Object.entries(currentCategories).map(([category, data]) => ({
      category,
      revenue: data.revenue,
      items: data.items,
      percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0,
      monthOverMonthGrowth: previousMonthCategories[category] ? 
        ((data.revenue - previousMonthCategories[category].revenue) / previousMonthCategories[category].revenue) * 100 : 0,
      yearOverYearGrowth: previousYearCategories[category] ? 
        ((data.revenue - previousYearCategories[category].revenue) / previousYearCategories[category].revenue) * 100 : 0,
      contribution: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0
    }));
  }
  
  private async analyzeSeasonality(month: Date, orders: any[]): Promise<any> {
    // Simplified seasonality analysis - would use historical data in production
    const monthIndex = month.getMonth();
    const seasonalFactors = [
      { factor: 'Post-Holiday Slump', impact: -0.15, description: 'Reduced spending after holidays' },
      { factor: 'Winter Season', impact: 0.10, description: 'Increased warm beverage sales' }
    ];
    
    const seasonalIndex = 1.0; // Would calculate based on historical data
    const seasonalCategory = seasonalIndex > 1.1 ? 'high' : seasonalIndex < 0.9 ? 'low' : 'medium';
    
    return {
      seasonalIndex,
      seasonalCategory,
      seasonalFactors
    };
  }
  
  private async generateMonthlyProjections(currentOrders: any[], ytdOrders: any[]): Promise<any> {
    // Simplified projection - would use sophisticated forecasting in production
    const currentMonthRevenue = currentOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const ytdRevenue = ytdOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    const nextMonthForecast = currentMonthRevenue * 1.05; // 5% growth assumption
    const nextQuarterForecast = nextMonthForecast * 3.2; // Quarterly projection
    const annualProjection = ytdRevenue + nextQuarterForecast * 2; // Annual projection
    
    return {
      nextMonthForecast,
      nextQuarterForecast,
      annualProjection,
      confidence: 0.75 // Would calculate based on forecast accuracy
    };
  }
}
