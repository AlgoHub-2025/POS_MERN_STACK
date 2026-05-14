import { Product } from '../../models/Product';
import { Order } from '../../models/Order';
import { Category } from '../../models/Category';

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

export class ProductReportsService {
  // Generate Top Products Report
  async generateTopProductsReport(params: {
    startDate: Date;
    endDate: Date;
    rankingMetric: 'revenue' | 'quantity' | 'profit' | 'margin';
    locationId?: string;
    categoryId?: string;
    limit?: number;
    includePreviousPeriod?: boolean;
  }): Promise<TopProductsReport> {
    const limit = params.limit || 50;
    const previousPeriodStart = new Date(params.startDate.getTime() - (params.endDate.getTime() - params.startDate.getTime()));
    const previousPeriodEnd = new Date(params.startDate.getTime() - 1);
    
    // Get orders for current and previous periods
    const currentOrders = await this.getOrdersByDateRange(params.startDate, params.endDate, params.locationId);
    const previousOrders = params.includePreviousPeriod ? 
      await this.getOrdersByDateRange(previousPeriodStart, previousPeriodEnd, params.locationId) : [];
    
    // Calculate product metrics for current period
    const productMetrics: Record<string, any> = {};
    
    currentOrders.forEach(order => {
      order.items.forEach((item: any) => {
        if (params.categoryId && item.categoryId !== params.categoryId) return;
        
        if (!productMetrics[item.productId]) {
          productMetrics[item.productId] = {
            productId: item.productId,
            name: item.name,
            sku: item.sku,
            category: item.category,
            revenue: 0,
            quantity: 0,
            cost: 0,
            profit: 0
          };
        }
        
        const revenue = item.price * item.quantity;
        const cost = (item.cost || item.price * 0.7) * item.quantity; // Mock cost calculation
        const profit = revenue - cost;
        
        productMetrics[item.productId].revenue += revenue;
        productMetrics[item.productId].quantity += item.quantity;
        productMetrics[item.productId].cost += cost;
        productMetrics[item.productId].profit += profit;
      });
    });
    
    // Calculate previous period metrics for growth comparison
    const previousMetrics: Record<string, number> = {};
    previousOrders.forEach(order => {
      order.items.forEach((item: any) => {
        if (params.categoryId && item.categoryId !== params.categoryId) return;
        
        if (!previousMetrics[item.productId]) {
          previousMetrics[item.productId] = 0;
        }
        previousMetrics[item.productId] += item.price * item.quantity;
      });
    });
    
    // Convert to array and calculate additional metrics
    const products = Object.values(productMetrics).map((product: any) => {
      const margin = product.revenue > 0 ? (product.profit / product.revenue) * 100 : 0;
      const previousRevenue = previousMetrics[product.productId] || 0;
      const growth = previousRevenue > 0 ? ((product.revenue - previousRevenue) / previousRevenue) * 100 : 0;
      
      return {
        ...product,
        margin,
        previousPeriodRevenue: previousRevenue,
        growth
      };
    });
    
    // Sort by ranking metric
    products.sort((a, b) => {
      switch (params.rankingMetric) {
        case 'revenue':
          return b.revenue - a.revenue;
        case 'quantity':
          return b.quantity - a.quantity;
        case 'profit':
          return b.profit - a.profit;
        case 'margin':
          return b.margin - a.margin;
        default:
          return b.revenue - a.revenue;
      }
    });
    
    // Assign ranks and calculate contribution percentages
    const totalRevenue = products.reduce((sum, p) => sum + p.revenue, 0);
    let cumulativeContribution = 0;
    
    const rankedProducts = products.slice(0, limit).map((product, index) => {
      const contributionPercentage = totalRevenue > 0 ? (product.revenue / totalRevenue) * 100 : 0;
      cumulativeContribution += contributionPercentage;
      
      return {
        ...product,
        rank: index + 1,
        contributionPercentage,
        cumulativeContribution
      };
    });
    
    // Calculate summary metrics
    const totalQuantity = rankedProducts.reduce((sum, p) => sum + p.quantity, 0);
    const totalProfit = rankedProducts.reduce((sum, p) => sum + p.profit, 0);
    const topProductConcentration = rankedProducts.length > 0 ? 
      (rankedProducts[0].revenue / totalRevenue) * 100 : 0;
    
    // Pareto analysis (80/20 rule)
    const top20PercentCount = Math.max(1, Math.floor(rankedProducts.length * 0.2));
    const top20PercentProducts = rankedProducts.slice(0, top20PercentCount);
    const top20PercentRevenue = top20PercentProducts.reduce((sum, p) => sum + p.revenue, 0);
    const top20PercentPercentage = totalRevenue > 0 ? (top20PercentRevenue / totalRevenue) * 100 : 0;
    
    return {
      period: {
        startDate: params.startDate,
        endDate: params.endDate
      },
      rankingMetric: params.rankingMetric,
      products: rankedProducts,
      summary: {
        totalRevenue,
        totalQuantity,
        totalProfit,
        topProductConcentration,
        paretoAnalysis: {
          top20PercentProductsRevenue: top20PercentRevenue,
          top20PercentProductsPercentage: top20PercentPercentage
        }
      }
    };
  }
  
  // Generate Product Performance Trends
  async generateProductPerformanceTrends(params: {
    startDate: Date;
    endDate: Date;
    locationId?: string;
    categoryId?: string;
    includeForecasting?: boolean;
  }): Promise<ProductPerformanceTrends> {
    const currentPeriod = {
      startDate: params.startDate,
      endDate: params.endDate
    };
    
    // Calculate previous period (same length, immediately before)
    const periodLength = params.endDate.getTime() - params.startDate.getTime();
    const previousPeriod = {
      startDate: new Date(params.startDate.getTime() - periodLength),
      endDate: new Date(params.endDate.getTime() - periodLength)
    };
    
    // Get orders for both periods
    const currentOrders = await this.getOrdersByDateRange(currentPeriod.startDate, currentPeriod.endDate, params.locationId);
    const previousOrders = await this.getOrdersByDateRange(previousPeriod.startDate, previousPeriod.endDate, params.locationId);
    
    // Calculate metrics for both periods
    const currentMetrics = await this.calculateProductMetrics(currentOrders, params.categoryId);
    const previousMetrics = await this.calculateProductMetrics(previousOrders, params.categoryId);
    
    // Get historical data for moving averages and seasonality
    const historicalData = await this.getHistoricalProductData(params.startDate, params.endDate, params.locationId, params.categoryId);
    
    // Combine and analyze trends
    const products = Object.keys(currentMetrics).map(productId => {
      const current = currentMetrics[productId];
      const previous = previousMetrics[productId] || { revenue: 0, quantity: 0 };
      
      const revenueGrowth = previous.revenue > 0 ? ((current.revenue - previous.revenue) / previous.revenue) * 100 : 0;
      const quantityGrowth = previous.quantity > 0 ? ((current.quantity - previous.quantity) / previous.quantity) * 100 : 0;
      const priceGrowth = previous.averagePrice > 0 ? ((current.averagePrice - previous.averagePrice) / previous.averagePrice) * 100 : 0;
      
      // Calculate moving averages
      const movingAverage3Month = this.calculateMovingAverage(historicalData, productId, 3);
      const movingAverage6Month = this.calculateMovingAverage(historicalData, productId, 6);
      
      // Calculate seasonality index
      const seasonalityIndex = this.calculateSeasonalityIndex(historicalData, productId, params.startDate.getMonth());
      
      // Determine lifecycle stage
      const lifecycleStage = this.determineLifecycleStage(revenueGrowth, current.revenue, historicalData, productId);
      
      // Generate forecast if requested
      let forecasting = null;
      if (params.includeForecasting) {
        forecasting = this.generateForecast(currentMetrics[productId], historicalData, productId);
      }
      
      return {
        productId,
        name: current.name,
        category: current.category,
        currentPeriod: {
          revenue: current.revenue,
          quantity: current.quantity,
          averagePrice: current.averagePrice
        },
        previousPeriod: {
          revenue: previous.revenue,
          quantity: previous.quantity,
          averagePrice: previous.averagePrice
        },
        trends: {
          revenueGrowth,
          quantityGrowth,
          priceGrowth,
          movingAverage3Month,
          movingAverage6Month,
          seasonalityIndex,
          lifecycleStage
        },
        forecasting
      };
    });
    
    // Generate insights
    const insights = this.generateProductInsights(products, historicalData);
    
    return {
      period: currentPeriod,
      products,
      insights
    };
  }
  
  // Generate Product Category Analysis
  async generateProductCategoryAnalysis(params: {
    startDate: Date;
    endDate: Date;
    locationId?: string;
    includeHierarchy?: boolean;
    includeCrossCategory?: boolean;
  }): Promise<ProductCategoryAnalysis> {
    const currentPeriod = {
      startDate: params.startDate,
      endDate: params.endDate
    };
    
    // Calculate previous period for comparison
    const periodLength = params.endDate.getTime() - params.startDate.getTime();
    const previousPeriod = {
      startDate: new Date(params.startDate.getTime() - periodLength),
      endDate: new Date(params.endDate.getTime() - periodLength)
    };
    
    // Get orders for both periods
    const currentOrders = await this.getOrdersByDateRange(currentPeriod.startDate, currentPeriod.endDate, params.locationId);
    const previousOrders = await this.getOrdersByDateRange(previousPeriod.startDate, previousPeriod.endDate, params.locationId);
    
    // Get category hierarchy
    const categories = await this.getCategoryHierarchy();
    
    // Calculate category metrics
    const categoryMetrics = await this.calculateCategoryMetrics(currentOrders, previousOrders, categories);
    
    // Generate category analysis
    const analysisCategories = Object.values(categoryMetrics).map(category => {
      // Determine growth trend
      const growthTrend = this.determineGrowthTrend(category.growth, category.metrics.revenue);
      
      // Calculate competitive position
      const competitivePosition = this.determineCompetitivePosition(category.metrics.contribution, category.growth);
      
      // Generate recommendations
      const recommendations = this.generateCategoryRecommendations(category);
      
      return {
        ...category,
        trends: {
          growthTrend,
          marketShare: category.metrics.contribution,
          marketShareChange: category.growth,
          competitivePosition
        },
        recommendations
      };
    });
    
    // Generate hierarchy analysis if requested
    let hierarchy = null;
    if (params.includeHierarchy) {
      hierarchy = this.generateCategoryHierarchyAnalysis(categories, categoryMetrics);
    }
    
    // Generate cross-category analysis if requested
    let crossCategory = null;
    if (params.includeCrossCategory) {
      crossCategory = await this.generateCrossCategoryAnalysis(currentOrders, categories);
    }
    
    return {
      period: currentPeriod,
      categories: analysisCategories,
      hierarchy,
      crossCategory
    };
  }
  
  // Helper methods
  private async getOrdersByDateRange(startDate: Date, endDate: Date, locationId?: string): Promise<any[]> {
    // Mock implementation - would query actual orders from database
    return [];
  }
  
  private async calculateProductMetrics(orders: any[], categoryId?: string): Promise<Record<string, any>> {
    const metrics: Record<string, any> = {};
    
    orders.forEach(order => {
      order.items.forEach((item: any) => {
        if (categoryId && item.categoryId !== categoryId) return;
        
        if (!metrics[item.productId]) {
          metrics[item.productId] = {
            name: item.name,
            category: item.category,
            revenue: 0,
            quantity: 0,
            cost: 0
          };
        }
        
        const revenue = item.price * item.quantity;
        const cost = (item.cost || item.price * 0.7) * item.quantity;
        
        metrics[item.productId].revenue += revenue;
        metrics[item.productId].quantity += item.quantity;
        metrics[item.productId].cost += cost;
      });
    });
    
    // Calculate average prices
    Object.values(metrics).forEach((metric: any) => {
      metric.averagePrice = metric.quantity > 0 ? metric.revenue / metric.quantity : 0;
    });
    
    return metrics;
  }
  
  private async getHistoricalProductData(startDate: Date, endDate: Date, locationId?: string, categoryId?: string): Promise<any> {
    // Mock implementation - would get historical data for trends analysis
    return {
      monthlyData: {},
      seasonalData: {}
    };
  }
  
  private calculateMovingAverage(historicalData: any, productId: string, months: number): number {
    // Mock implementation - would calculate actual moving average
    return 1000; // Placeholder
  }
  
  private calculateSeasonalityIndex(historicalData: any, productId: string, month: number): number {
    // Mock implementation - would calculate actual seasonality index
    return 1.0; // Placeholder
  }
  
  private determineLifecycleStage(growth: number, revenue: number, historicalData: any, productId: string): 'introduction' | 'growth' | 'maturity' | 'decline' {
    // Simplified lifecycle stage determination
    if (growth > 20 && revenue < 10000) return 'introduction';
    if (growth > 10) return 'growth';
    if (growth < -10) return 'decline';
    return 'maturity';
  }
  
  private generateForecast(currentMetrics: any, historicalData: any, productId: string): any {
    // Mock implementation - would use sophisticated forecasting
    return {
      nextPeriodForecast: currentMetrics.revenue * 1.05,
      confidence: 0.75,
      trendDirection: 'up' as const
    };
  }
  
  private generateProductInsights(products: any[], historicalData: any): any {
    // Identify emerging stars (high growth products)
    const emergingStars = products
      .filter(p => p.trends.revenueGrowth > 50 && p.currentPeriod.revenue > 1000)
      .map(p => ({
        productId: p.productId,
        name: p.name,
        growthRate: p.trends.revenueGrowth,
        confidence: 0.8
      }))
      .slice(0, 5);
    
    // Identify declining products
    const decliningProducts = products
      .filter(p => p.trends.revenueGrowth < -20)
      .map(p => {
        const urgency = p.trends.revenueGrowth < -50 ? 'high' : p.trends.revenueGrowth < -35 ? 'medium' : 'low';
        return {
          productId: p.productId,
          name: p.name,
          declineRate: p.trends.revenueGrowth,
          urgency
        };
      })
      .slice(0, 5);
    
    // Identify seasonal products
    const seasonalProducts = products
      .filter(p => Math.abs(p.trends.seasonalityIndex - 1.0) > 0.2)
      .map(p => ({
        productId: p.productId,
        name: p.name,
        seasonalPattern: p.trends.seasonalityIndex > 1.0 ? 'High Season' : 'Low Season',
        peakMonths: [6, 7, 8] // Mock data
      }))
      .slice(0, 5);
    
    return {
      emergingStars,
      decliningProducts,
      seasonalProducts
    };
  }
  
  private async getCategoryHierarchy(): Promise<any[]> {
    // Mock implementation - would get actual category hierarchy
    return [];
  }
  
  private async calculateCategoryMetrics(currentOrders: any[], previousOrders: any[], categories: any[]): Promise<Record<string, any>> {
    const metrics: Record<string, any> = {};
    
    // Initialize metrics for all categories
    categories.forEach(category => {
      metrics[category.categoryId] = {
        categoryId: category.categoryId,
        name: category.name,
        parentCategory: category.parentId,
        level: category.level,
        metrics: {
          revenue: 0,
          previousPeriodRevenue: 0,
          growth: 0,
          quantity: 0,
          averageOrderValue: 0,
          profit: 0,
          margin: 0,
          contribution: 0
        },
        products: {
          total: 0,
          active: 0,
          topPerformers: 0,
          underPerformers: 0
        }
      };
    });
    
    // Calculate current period metrics
    currentOrders.forEach(order => {
      order.items.forEach((item: any) => {
        if (metrics[item.categoryId]) {
          const revenue = item.price * item.quantity;
          const profit = revenue * 0.3; // Mock profit margin
          
          metrics[item.categoryId].metrics.revenue += revenue;
          metrics[item.categoryId].metrics.quantity += item.quantity;
          metrics[item.categoryId].metrics.profit += profit;
        }
      });
    });
    
    // Calculate previous period metrics
    previousOrders.forEach(order => {
      order.items.forEach((item: any) => {
        if (metrics[item.categoryId]) {
          metrics[item.categoryId].metrics.previousPeriodRevenue += item.price * item.quantity;
        }
      });
    });
    
    // Calculate derived metrics
    const totalRevenue = Object.values(metrics).reduce((sum: number, cat: any) => sum + cat.metrics.revenue, 0);
    
    Object.values(metrics).forEach((category: any) => {
      const { metrics: catMetrics } = category;
      
      catMetrics.growth = catMetrics.previousPeriodRevenue > 0 ? 
        ((catMetrics.revenue - catMetrics.previousPeriodRevenue) / catMetrics.previousPeriodRevenue) * 100 : 0;
      catMetrics.averageOrderValue = catMetrics.quantity > 0 ? catMetrics.revenue / catMetrics.quantity : 0;
      catMetrics.margin = catMetrics.revenue > 0 ? (catMetrics.profit / catMetrics.revenue) * 100 : 0;
      catMetrics.contribution = totalRevenue > 0 ? (catMetrics.revenue / totalRevenue) * 100 : 0;
    });
    
    return metrics;
  }
  
  private determineGrowthTrend(growth: number, revenue: number): 'accelerating' | 'steady' | 'decelerating' | 'declining' {
    if (growth > 15) return 'accelerating';
    if (growth > 5) return 'steady';
    if (growth > -5) return 'decelerating';
    return 'declining';
  }
  
  private determineCompetitivePosition(contribution: number, growth: number): 'leader' | 'challenger' | 'follower' | 'niche' {
    if (contribution > 20 && growth > 10) return 'leader';
    if (contribution > 10 || growth > 15) return 'challenger';
    if (contribution > 5) return 'follower';
    return 'niche';
  }
  
  private generateCategoryRecommendations(category: any): any[] {
    const recommendations = [];
    
    if (category.metrics.growth < -10) {
      recommendations.push({
        type: 'promotion' as const,
        priority: 'high' as const,
        description: 'Declining sales - consider promotional campaigns',
        expectedImpact: 15
      });
    }
    
    if (category.metrics.margin < 20) {
      recommendations.push({
        type: 'pricing' as const,
        priority: 'medium' as const,
        description: 'Low margins - review pricing strategy',
        expectedImpact: 10
      });
    }
    
    if (category.products.underPerformers > category.products.active * 0.5) {
      recommendations.push({
        type: 'assortment' as const,
        priority: 'medium' as const,
        description: 'Many underperforming products - consider assortment optimization',
        expectedImpact: 12
      });
    }
    
    return recommendations;
  }
  
  private generateCategoryHierarchyAnalysis(categories: any[], categoryMetrics: Record<string, any>): any[] {
    // Mock implementation - would generate actual hierarchy analysis
    return [];
  }
  
  private async generateCrossCategoryAnalysis(orders: any[], categories: any[]): Promise<any> {
    // Mock implementation - would generate actual cross-category analysis
    return {
      correlationMatrix: {},
      complementaryPairs: [],
      cannibalizationRisk: []
    };
  }
}
