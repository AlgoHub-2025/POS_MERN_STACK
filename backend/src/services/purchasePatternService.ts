import { Customer, ICustomer } from '../models/Customer';
import { PurchasePattern, IPurchasePattern } from '../models/CustomerAnalytics';
import { EventEmitter } from 'events';
import mongoose from 'mongoose';

export interface BasketAnalysis {
  averageBasketSize: number;
  averageBasketValue: number;
  topProductCombinations: Array<{
    products: string[];
    productIds: string[];
    frequency: number;
    confidence: number;
    lift: number;
    support: number;
  }>;
  crossSellOpportunities: Array<{
    product: string;
    productId: string;
    likelihood: number;
    potentialRevenue: number;
    confidence: number;
    targetCustomers: number;
  }>;
  categoryAffinity: Record<string, number>;
  brandAffinity: Record<string, number>;
  pricePointAnalysis: {
    budget: number;
    standard: number;
    premium: number;
  };
  timeBasedPatterns: {
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
  };
}

export interface SeasonalPattern {
  seasonalIndex: number;
  peakSeasons: string[];
  offPeakSeasons: string[];
  holidayImpact: number;
  weatherImpact?: number;
  monthlyDistribution: Record<string, number>;
  quarterlyDistribution: Record<string, number>;
  yearOverYearGrowth: number;
  seasonalityStrength: number;
}

export interface TemporalPattern {
  preferredShoppingDays: string[];
  preferredShoppingTimes: string[];
  purchaseCycle: number; // days
  nextPredictedPurchase: Date;
  dayOfWeekDistribution: Record<string, number>;
  hourOfDayDistribution: Record<string, number>;
  interPurchaseTime: {
    min: number;
    max: number;
    average: number;
    median: number;
    stdDev: number;
  };
}

export interface ProductPreference {
  favoriteCategories: Array<{
    category: string;
    categoryId: string;
    spend: number;
    frequency: number;
    growth: number;
    shareOfWallet: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }>;
  brandPreferences: Record<string, {
    spend: number;
    frequency: number;
    loyalty: number;
    lastPurchase: Date;
  }>;
  priceSensitivity: 'low' | 'medium' | 'high';
  qualityPreference: 'budget' | 'standard' | 'premium';
  newProductAdoption: number;
  categoryExploration: number;
}

export interface PurchasePatternResult {
  customerId: string;
  analysisDate: Date;
  period: { startDate: Date; endDate: Date };
  basketAnalysis: BasketAnalysis;
  seasonalPatterns: SeasonalPattern;
  temporalPatterns: TemporalPattern;
  productPreferences: ProductPreference;
  insights: Array<{
    type: 'opportunity' | 'risk' | 'trend' | 'recommendation';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    actionable: boolean;
    suggestedActions: string[];
  }>;
  confidenceScore: number;
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

class PurchasePatternService extends EventEmitter {
  private readonly MIN_SUPPORT_THRESHOLD = 0.01; // 1% minimum support for association rules
  private readonly MIN_CONFIDENCE_THRESHOLD = 0.3; // 30% minimum confidence
  private readonly MIN_LIFT_THRESHOLD = 1.2; // 20% lift over random

  constructor() {
    super();
  }

  /**
   * Analyze purchase patterns for a customer
   */
  async analyzePurchasePatterns(customerId: string, options: {
    period?: { startDate: Date; endDate: Date };
    includeBasketAnalysis?: boolean;
    includeSeasonalPatterns?: boolean;
    includeTemporalPatterns?: boolean;
    includeProductPreferences?: boolean;
  } = {}): Promise<PurchasePatternResult> {
    try {
      const customer = await Customer.findOne({ customerId, isDeleted: false });
      if (!customer) {
        throw new Error('Customer not found');
      }

      const period = options.period || {
        startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // Last year
        endDate: new Date()
      };

      // Get customer's order history
      const orders = await this.getCustomerOrders(customerId, period);
      
      if (orders.length === 0) {
        throw new Error('No purchase history found for customer');
      }

      // Analyze different pattern types
      const basketAnalysis = options.includeBasketAnalysis !== false ? 
        await this.analyzeBasketPatterns(customerId, orders) : null;
      
      const seasonalPatterns = options.includeSeasonalPatterns !== false ? 
        await this.analyzeSeasonalPatterns(customerId, orders) : null;
      
      const temporalPatterns = options.includeTemporalPatterns !== false ? 
        await this.analyzeTemporalPatterns(customerId, orders) : null;
      
      const productPreferences = options.includeProductPreferences !== false ? 
        await this.analyzeProductPreferences(customerId, orders) : null;

      // Generate insights
      const insights = await this.generateInsights({
        basketAnalysis,
        seasonalPatterns,
        temporalPatterns,
        productPreferences
      });

      // Calculate confidence score
      const confidenceScore = this.calculateConfidenceScore(orders.length, period);
      
      // Assess data quality
      const dataQuality = this.assessDataQuality(orders, period);

      const result: PurchasePatternResult = {
        customerId,
        analysisDate: new Date(),
        period,
        basketAnalysis: basketAnalysis || this.getDefaultBasketAnalysis(),
        seasonalPatterns: seasonalPatterns || this.getDefaultSeasonalPattern(),
        temporalPatterns: temporalPatterns || this.getDefaultTemporalPattern(),
        productPreferences: productPreferences || this.getDefaultProductPreference(),
        insights,
        confidenceScore,
        dataQuality
      };

      // Save analysis to database
      await this.savePurchasePatternAnalysis(result);

      this.emit('purchasePatternAnalyzed', result);
      return result;
    } catch (error) {
      throw new Error(`Failed to analyze purchase patterns: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Analyze basket patterns using market basket analysis
   */
  private async analyzeBasketPatterns(customerId: string, orders: any[]): Promise<BasketAnalysis> {
    // Extract product combinations from orders
    const baskets = orders.map(order => ({
      items: order.items || [],
      value: order.totalAmount || 0,
      date: new Date(order.createdAt)
    }));

    // Calculate basic basket metrics
    const totalItems = baskets.reduce((sum, basket) => sum + basket.items.length, 0);
    const averageBasketSize = baskets.length > 0 ? totalItems / baskets.length : 0;
    
    const totalValue = baskets.reduce((sum, basket) => sum + basket.value, 0);
    const averageBasketValue = baskets.length > 0 ? totalValue / baskets.length : 0;

    // Perform market basket analysis
    const productCombinations = await this.findProductCombinations(baskets);
    
    // Find cross-sell opportunities
    const crossSellOpportunities = await this.findCrossSellOpportunities(baskets);
    
    // Calculate category affinity
    const categoryAffinity = await this.calculateCategoryAffinity(baskets);
    
    // Calculate brand affinity
    const brandAffinity = await this.calculateBrandAffinity(baskets);
    
    // Analyze price points
    const pricePointAnalysis = this.analyzePricePoints(baskets);
    
    // Analyze time-based patterns
    const timeBasedPatterns = this.analyzeTimeBasedBasketPatterns(baskets);

    return {
      averageBasketSize,
      averageBasketValue,
      topProductCombinations: productCombinations,
      crossSellOpportunities,
      categoryAffinity,
      brandAffinity,
      pricePointAnalysis,
      timeBasedPatterns
    };
  }

  /**
   * Find product combinations using association rule mining
   */
  private async findProductCombinations(baskets: any[]): Promise<Array<{
    products: string[];
    productIds: string[];
    frequency: number;
    confidence: number;
    lift: number;
    support: number;
  }>> {
    const combinations = [];
    const productCounts = new Map<string, number>();
    const pairCounts = new Map<string, number>();

    // Count individual products and pairs
    baskets.forEach(basket => {
      const productNames = basket.items.map((item: any) => item.name || item.productName);
      
      // Count individual products
      productNames.forEach((product: string) => {
        productCounts.set(product, (productCounts.get(product) || 0) + 1);
      });

      // Count pairs
      for (let i = 0; i < productNames.length; i++) {
        for (let j = i + 1; j < productNames.length; j++) {
          const pair = [productNames[i], productNames[j]].sort().join('|');
          pairCounts.set(pair, (pairCounts.get(pair) || 0) + 1);
        }
      }
    });

    const totalBaskets = baskets.length;

    // Calculate association rules for pairs
    for (const [pair, count] of pairCounts.entries()) {
      const [product1, product2] = pair.split('|');
      const support = count / totalBaskets;
      
      if (support < this.MIN_SUPPORT_THRESHOLD) continue;

      const count1 = productCounts.get(product1) || 0;
      const count2 = productCounts.get(product2) || 0;
      
      const confidence1 = count / count1; // P(product2 | product1)
      const confidence2 = count / count2; // P(product1 | product2)
      
      const expectedCount = (count1 * count2) / totalBaskets;
      const lift = count / expectedCount;

      if (confidence1 >= this.MIN_CONFIDENCE_THRESHOLD && lift >= this.MIN_LIFT_THRESHOLD) {
        combinations.push({
          products: [product1, product2],
          productIds: [], // Would map to actual product IDs
          frequency: count,
          confidence: confidence1,
          lift,
          support
        });
      }
    }

    // Sort by lift and confidence
    return combinations
      .sort((a, b) => (b.lift * b.confidence) - (a.lift * a.confidence))
      .slice(0, 20); // Top 20 combinations
  }

  /**
   * Find cross-sell opportunities
   */
  private async findCrossSellOpportunities(baskets: any[]): Promise<Array<{
    product: string;
    productId: string;
    likelihood: number;
    potentialRevenue: number;
    confidence: number;
    targetCustomers: number;
  }>> {
    const opportunities = [];
    const productFrequency = new Map<string, number>();
    const productPairs = new Map<string, { count: number; totalValue: number }>();

    // Analyze product co-occurrence
    baskets.forEach(basket => {
      const products = basket.items.map((item: any) => ({
        name: item.name || item.productName,
        price: item.price || 0,
        id: item.productId || item.id
      }));

      products.forEach((product: any) => {
        productFrequency.set(product.name, (productFrequency.get(product.name) || 0) + 1);
      });

      for (let i = 0; i < products.length; i++) {
        for (let j = 0; j < products.length; j++) {
          if (i === j) continue;
          
          const key = `${products[i].name}|${products[j].name}`;
          const existing = productPairs.get(key) || { count: 0, totalValue: 0 };
          productPairs.set(key, {
            count: existing.count + 1,
            totalValue: existing.totalValue + products[j].price
          });
        }
      }
    });

    const totalBaskets = baskets.length;

    // Calculate cross-sell opportunities
    for (const [pair, data] of productPairs.entries()) {
      const [sourceProduct, targetProduct] = pair.split('|');
      const sourceCount = productFrequency.get(sourceProduct) || 0;
      
      if (sourceCount < 5) continue; // Minimum source product frequency

      const likelihood = data.count / sourceCount;
      const avgTargetValue = data.totalValue / data.count;
      const confidence = Math.min(1, data.count / 10); // Confidence based on data points

      if (likelihood >= 0.2 && confidence >= 0.3) {
        opportunities.push({
          product: targetProduct,
          productId: '', // Would map to actual product ID
          likelihood,
          potentialRevenue: avgTargetValue * likelihood * 10, // Estimated next 10 purchases
          confidence,
          targetCustomers: sourceCount
        });
      }
    }

    return opportunities
      .sort((a, b) => (b.likelihood * b.potentialRevenue) - (a.likelihood * a.potentialRevenue))
      .slice(0, 15);
  }

  /**
   * Calculate category affinity
   */
  private async calculateCategoryAffinity(baskets: any[]): Promise<Record<string, number>> {
    const categorySpending = new Map<string, number>();
    let totalSpending = 0;

    baskets.forEach(basket => {
      basket.items.forEach((item: any) => {
        const category = item.category || 'uncategorized';
        const value = item.price * item.quantity || 0;
        
        categorySpending.set(category, (categorySpending.get(category) || 0) + value);
        totalSpending += value;
      });
    });

    const affinity: Record<string, number> = {};
    for (const [category, spending] of categorySpending.entries()) {
      affinity[category] = totalSpending > 0 ? spending / totalSpending : 0;
    }

    return affinity;
  }

  /**
   * Calculate brand affinity
   */
  private async calculateBrandAffinity(baskets: any[]): Promise<Record<string, number>> {
    const brandSpending = new Map<string, number>();
    let totalSpending = 0;

    baskets.forEach(basket => {
      basket.items.forEach((item: any) => {
        const brand = item.brand || 'generic';
        const value = item.price * item.quantity || 0;
        
        brandSpending.set(brand, (brandSpending.get(brand) || 0) + value);
        totalSpending += value;
      });
    });

    const affinity: Record<string, number> = {};
    for (const [brand, spending] of brandSpending.entries()) {
      affinity[brand] = totalSpending > 0 ? spending / totalSpending : 0;
    }

    return affinity;
  }

  /**
   * Analyze price points
   */
  private analyzePricePoints(baskets: any[]): {
    budget: number;
    standard: number;
    premium: number;
  } {
    const allPrices = baskets.flatMap(basket => 
      basket.items.map((item: any) => item.price || 0)
    );

    if (allPrices.length === 0) {
      return { budget: 0, standard: 0, premium: 0 };
    }

    allPrices.sort((a, b) => a - b);
    
    const p33 = allPrices[Math.floor(allPrices.length * 0.33)];
    const p66 = allPrices[Math.floor(allPrices.length * 0.66)];

    return {
      budget: p33,
      standard: p66,
      premium: allPrices[Math.floor(allPrices.length * 0.9)]
    };
  }

  /**
   * Analyze time-based basket patterns
   */
  private analyzeTimeBasedBasketPatterns(baskets: any[]): {
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
  } {
    const timeDistribution = { morning: 0, afternoon: 0, evening: 0, night: 0 };

    baskets.forEach(basket => {
      const hour = new Date(basket.date).getHours();
      
      if (hour >= 6 && hour < 12) timeDistribution.morning++;
      else if (hour >= 12 && hour < 18) timeDistribution.afternoon++;
      else if (hour >= 18 && hour < 22) timeDistribution.evening++;
      else timeDistribution.night++;
    });

    const total = baskets.length;
    return {
      morning: total > 0 ? timeDistribution.morning / total : 0,
      afternoon: total > 0 ? timeDistribution.afternoon / total : 0,
      evening: total > 0 ? timeDistribution.evening / total : 0,
      night: total > 0 ? timeDistribution.night / total : 0
    };
  }

  /**
   * Analyze seasonal patterns
   */
  private async analyzeSeasonalPatterns(customerId: string, orders: any[]): Promise<SeasonalPattern> {
    const monthlyData = new Map<string, { count: number; value: number }>();
    const quarterlyData = new Map<string, { count: number; value: number }>();

    orders.forEach(order => {
      const date = new Date(order.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const quarterKey = `${date.getFullYear()}-Q${Math.ceil((date.getMonth() + 1) / 3)}`;
      
      const monthData = monthlyData.get(monthKey) || { count: 0, value: 0 };
      monthData.count++;
      monthData.value += order.totalAmount || 0;
      monthlyData.set(monthKey, monthData);

      const quarterData = quarterlyData.get(quarterKey) || { count: 0, value: 0 };
      quarterData.count++;
      quarterData.value += order.totalAmount || 0;
      quarterlyData.set(quarterKey, quarterData);
    });

    // Calculate monthly distribution
    const monthlyDistribution: Record<string, number> = {};
    const totalMonthlyOrders = orders.length;
    
    for (const [month, data] of monthlyData.entries()) {
      monthlyDistribution[month] = totalMonthlyOrders > 0 ? data.count / totalMonthlyOrders : 0;
    }

    // Calculate quarterly distribution
    const quarterlyDistribution: Record<string, number> = {};
    const totalQuarterlyOrders = orders.length;
    
    for (const [quarter, data] of quarterlyData.entries()) {
      quarterlyDistribution[quarter] = totalQuarterlyOrders > 0 ? data.count / totalQuarterlyOrders : 0;
    }

    // Identify peak and off-peak seasons
    const sortedMonths = Array.from(monthlyData.entries())
      .sort(([, a], [, b]) => b.count - a.count);
    
    const peakSeasons = sortedMonths.slice(0, 3).map(([month]) => month);
    const offPeakSeasons = sortedMonths.slice(-3).map(([month]) => month);

    // Calculate seasonal index (coefficient of variation)
    const counts = Array.from(monthlyData.values()).map(d => d.count);
    const mean = counts.reduce((sum, count) => sum + count, 0) / counts.length;
    const variance = counts.reduce((sum, count) => sum + Math.pow(count - mean, 2), 0) / counts.length;
    const stdDev = Math.sqrt(variance);
    const seasonalIndex = mean > 0 ? stdDev / mean : 0;

    // Calculate holiday impact (simplified)
    const holidayMonths = ['11', '12']; // November, December
    const holidayOrders = holidayMonths.reduce((sum, month) => {
      const monthData = Array.from(monthlyData.entries())
        .filter(([m]) => m.endsWith(month));
      return sum + monthData.reduce((s, [, d]) => s + d.count, 0);
    }, 0);
    const holidayImpact = totalMonthlyOrders > 0 ? holidayOrders / totalMonthlyOrders : 0;

    // Calculate year-over-year growth
    const yearOverYearGrowth = await this.calculateYearOverYearGrowth(monthlyData);

    return {
      seasonalIndex,
      peakSeasons,
      offPeakSeasons,
      holidayImpact,
      monthlyDistribution,
      quarterlyDistribution,
      yearOverYearGrowth,
      seasonalityStrength: seasonalIndex
    };
  }

  /**
   * Analyze temporal patterns
   */
  private async analyzeTemporalPatterns(customerId: string, orders: any[]): Promise<TemporalPattern> {
    if (orders.length === 0) {
      return this.getDefaultTemporalPattern();
    }

    // Calculate day of week distribution
    const dayOfWeekDistribution: Record<string, number> = {
      Sunday: 0, Monday: 0, Tuesday: 0, Wednesday: 0, 
      Thursday: 0, Friday: 0, Saturday: 0
    };

    // Calculate hour of day distribution
    const hourOfDayDistribution: Record<string, number> = {};
    for (let i = 0; i < 24; i++) {
      hourOfDayDistribution[i.toString()] = 0;
    }

    const interPurchaseTimes: number[] = [];

    orders.forEach((order, index) => {
      const date = new Date(order.createdAt);
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
      const hour = date.getHours();

      dayOfWeekDistribution[dayName]++;
      hourOfDayDistribution[hour.toString()]++;

      if (index > 0) {
        const prevDate = new Date(orders[index - 1].createdAt);
        const daysDiff = (date.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
        interPurchaseTimes.push(daysDiff);
      }
    });

    // Normalize distributions
    const totalOrders = orders.length;
    Object.keys(dayOfWeekDistribution).forEach(day => {
      dayOfWeekDistribution[day] = totalOrders > 0 ? dayOfWeekDistribution[day] / totalOrders : 0;
    });

    Object.keys(hourOfDayDistribution).forEach(hour => {
      hourOfDayDistribution[hour] = totalOrders > 0 ? hourOfDayDistribution[hour] / totalOrders : 0;
    });

    // Calculate preferred shopping days and times
    const preferredShoppingDays = Object.entries(dayOfWeekDistribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([day]) => day);

    const preferredShoppingTimes = Object.entries(hourOfDayDistribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => `${hour}:00`);

    // Calculate purchase cycle statistics
    const purchaseCycle = interPurchaseTimes.length > 0 ? 
      interPurchaseTimes.reduce((sum, time) => sum + time, 0) / interPurchaseTimes.length : 0;

    const interPurchaseStats = interPurchaseTimes.length > 0 ? {
      min: Math.min(...interPurchaseTimes),
      max: Math.max(...interPurchaseTimes),
      average: purchaseCycle,
      median: this.calculateMedian(interPurchaseTimes),
      stdDev: this.calculateStandardDeviation(interPurchaseTimes)
    } : {
      min: 0, max: 0, average: 0, median: 0, stdDev: 0
    };

    // Predict next purchase date
    const lastOrderDate = new Date(orders[orders.length - 1].createdAt);
    const nextPredictedPurchase = new Date(lastOrderDate.getTime() + purchaseCycle * 24 * 60 * 60 * 1000);

    return {
      preferredShoppingDays,
      preferredShoppingTimes,
      purchaseCycle,
      nextPredictedPurchase,
      dayOfWeekDistribution,
      hourOfDayDistribution,
      interPurchaseTime: interPurchaseStats
    };
  }

  /**
   * Analyze product preferences
   */
  private async analyzeProductPreferences(customerId: string, orders: any[]): Promise<ProductPreference> {
    const categoryData = new Map<string, { spend: number; frequency: number; growth: number }>();
    const brandData = new Map<string, { spend: number; frequency: number; lastPurchase: Date }>();
    let totalSpend = 0;

    orders.forEach(order => {
      order.items.forEach((item: any) => {
        const category = item.category || 'uncategorized';
        const brand = item.brand || 'generic';
        const spend = (item.price || 0) * (item.quantity || 1);

        totalSpend += spend;

        // Category data
        const catData = categoryData.get(category) || { spend: 0, frequency: 0, growth: 0 };
        catData.spend += spend;
        catData.frequency++;
        categoryData.set(category, catData);

        // Brand data
        const brandInfo = brandData.get(brand) || { spend: 0, frequency: 0, lastPurchase: new Date() };
        brandInfo.spend += spend;
        brandInfo.frequency++;
        brandInfo.lastPurchase = new Date(order.createdAt);
        brandData.set(brand, brandInfo);
      });
    });

    // Calculate favorite categories
    const favoriteCategories = Array.from(categoryData.entries())
      .map(([category, data]) => ({
        category,
        categoryId: '', // Would map to actual category ID
        spend: data.spend,
        frequency: data.frequency,
        growth: data.growth, // Would calculate trend
        shareOfWallet: totalSpend > 0 ? data.spend / totalSpend : 0,
        trend: 'stable' as 'increasing' | 'decreasing' | 'stable' // Would calculate actual trend
      }))
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 10);

    // Calculate brand preferences
    const brandPreferences: Record<string, any> = {};
    for (const [brand, data] of brandData.entries()) {
      brandPreferences[brand] = {
        spend: data.spend,
        frequency: data.frequency,
        loyalty: data.frequency / orders.length, // Loyalty based on frequency
        lastPurchase: data.lastPurchase
      };
    }

    // Determine price sensitivity (based on price distribution)
    const allPrices = orders.flatMap(order => 
      order.items.map((item: any) => item.price || 0)
    );
    const avgPrice = allPrices.length > 0 ? allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length : 0;
    
    let priceSensitivity: 'low' | 'medium' | 'high' = 'medium';
    if (avgPrice > 100) priceSensitivity = 'low';
    else if (avgPrice < 30) priceSensitivity = 'high';

    // Determine quality preference
    let qualityPreference: 'budget' | 'standard' | 'premium' = 'standard';
    const premiumBrands = Object.keys(brandPreferences).filter(brand => 
      brand.toLowerCase().includes('premium') || brand.toLowerCase().includes('luxury')
    );
    if (premiumBrands.length > 0 && premiumBrands.some(brand => brandPreferences[brand].spend > totalSpend * 0.3)) {
      qualityPreference = 'premium';
    } else if (priceSensitivity === 'high') {
      qualityPreference = 'budget';
    }

    return {
      favoriteCategories,
      brandPreferences,
      priceSensitivity,
      qualityPreference,
      newProductAdoption: 0.2, // Placeholder - would calculate from new product purchases
      categoryExploration: categoryData.size / 10 // Placeholder - normalized category diversity
    };
  }

  /**
   * Generate insights from pattern analysis
   */
  private async generateInsights(analysis: {
    basketAnalysis?: BasketAnalysis | null;
    seasonalPatterns?: SeasonalPattern | null;
    temporalPatterns?: TemporalPattern | null;
    productPreferences?: ProductPreference | null;
  }): Promise<Array<{
    type: 'opportunity' | 'risk' | 'trend' | 'recommendation';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    actionable: boolean;
    suggestedActions: string[];
  }>> {
    const insights = [];

    // Basket analysis insights
    if (analysis.basketAnalysis) {
      if (analysis.basketAnalysis.crossSellOpportunities.length > 0) {
        const topOpportunity = analysis.basketAnalysis.crossSellOpportunities[0];
        insights.push({
          type: 'opportunity' as const,
          title: 'Cross-Sell Opportunity Identified',
          description: `${topOpportunity.product} has a ${Math.round(topOpportunity.likelihood * 100)}% likelihood of being purchased with complementary items`,
          impact: topOpportunity.likelihood > 0.5 ? 'high' as const : 'medium' as const,
          actionable: true,
          suggestedActions: [
            'Create bundle offer with complementary products',
            'Target customers who buy related items',
            'Display product recommendations on product pages'
          ]
        });
      }

      if (analysis.basketAnalysis.averageBasketValue < 50) {
        insights.push({
          type: 'opportunity' as const,
          title: 'Low Average Basket Value',
          description: `Current average basket value is $${analysis.basketAnalysis.averageBasketValue.toFixed(2)}`,
          impact: 'medium' as const,
          actionable: true,
          suggestedActions: [
            'Implement minimum order free shipping',
            'Create product bundles',
            'Upsell higher-value items'
          ]
        });
      }
    }

    // Seasonal pattern insights
    if (analysis.seasonalPatterns) {
      if (analysis.seasonalPatterns.seasonalIndex > 0.5) {
        insights.push({
          type: 'trend' as const,
          title: 'Strong Seasonal Behavior Detected',
          description: `Customer shows strong seasonal purchasing patterns with peak seasons in ${analysis.seasonalPatterns.peakSeasons.join(', ')}`,
          impact: 'medium' as const,
          actionable: true,
          suggestedActions: [
            'Create seasonal marketing campaigns',
            'Stock up on preferred items before peak seasons',
            'Send personalized offers before peak seasons'
          ]
        });
      }
    }

    // Temporal pattern insights
    if (analysis.temporalPatterns) {
      if (analysis.temporalPatterns.purchaseCycle > 30) {
        insights.push({
          type: 'risk' as const,
          title: 'Long Purchase Cycle',
          description: `Customer purchases every ${Math.round(analysis.temporalPatterns.purchaseCycle)} days on average`,
          impact: 'medium' as const,
          actionable: true,
          suggestedActions: [
            'Send re-engagement campaigns',
            'Offer subscription options',
            'Create loyalty program incentives'
          ]
        });
      }
    }

    // Product preference insights
    if (analysis.productPreferences) {
      if (analysis.productPreferences.favoriteCategories.length > 0) {
        const topCategory = analysis.productPreferences.favoriteCategories[0];
        if (topCategory.shareOfWallet > 0.6) {
          insights.push({
            type: 'risk' as const,
            title: 'High Category Concentration',
            description: `${Math.round(topCategory.shareOfWallet * 100)}% of spending is in ${topCategory.category}`,
            impact: 'medium' as const,
            actionable: true,
            suggestedActions: [
              'Introduce products from other categories',
              'Create cross-category promotions',
              'Educate about product variety'
            ]
          });
        }
      }
    }

    return insights;
  }

  /**
   * Calculate confidence score based on data quality
   */
  private calculateConfidenceScore(orderCount: number, period: { startDate: Date; endDate: Date }): number {
    const daysInPeriod = (period.endDate.getTime() - period.startDate.getTime()) / (1000 * 60 * 60 * 24);
    const ordersPerDay = orderCount / daysInPeriod;

    let confidence = 0.5; // Base confidence

    // More orders = higher confidence
    if (orderCount >= 50) confidence += 0.3;
    else if (orderCount >= 20) confidence += 0.2;
    else if (orderCount >= 10) confidence += 0.1;

    // Consistent ordering = higher confidence
    if (ordersPerDay >= 1) confidence += 0.2;
    else if (ordersPerDay >= 0.5) confidence += 0.1;

    return Math.max(0.1, Math.min(1, confidence));
  }

  /**
   * Assess data quality
   */
  private assessDataQuality(orders: any[], period: { startDate: Date; endDate: Date }): 'excellent' | 'good' | 'fair' | 'poor' {
    const daysInPeriod = (period.endDate.getTime() - period.startDate.getTime()) / (1000 * 60 * 60 * 24);
    const ordersPerDay = orders.length / daysInPeriod;

    if (orders.length >= 100 && ordersPerDay >= 1) return 'excellent';
    if (orders.length >= 50 && ordersPerDay >= 0.5) return 'good';
    if (orders.length >= 20 && ordersPerDay >= 0.2) return 'fair';
    return 'poor';
  }

  /**
   * Helper methods
   */
  private async getCustomerOrders(customerId: string, period?: { startDate: Date; endDate: Date }) {
    // This would integrate with the Order model
    // For now, return empty array as placeholder
    return [];
  }

  private async calculateYearOverYearGrowth(monthlyData: Map<string, { count: number; value: number }>): Promise<number> {
    // Simplified YoY growth calculation
    const years = [...new Set(Array.from(monthlyData.keys()).map(key => key.split('-')[0]))];
    if (years.length < 2) return 0;

    const currentYear = Math.max(...years.map(Number));
    const previousYear = currentYear - 1;

    const currentYearTotal = Array.from(monthlyData.entries())
      .filter(([key]) => key.startsWith(currentYear.toString()))
      .reduce((sum, [, data]) => sum + data.value, 0);

    const previousYearTotal = Array.from(monthlyData.entries())
      .filter(([key]) => key.startsWith(previousYear.toString()))
      .reduce((sum, [, data]) => sum + data.value, 0);

    return previousYearTotal > 0 ? ((currentYearTotal - previousYearTotal) / previousYearTotal) * 100 : 0;
  }

  private calculateMedian(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? 
      (sorted[mid - 1] + sorted[mid]) / 2 : 
      sorted[mid];
  }

  private calculateStandardDeviation(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private getDefaultBasketAnalysis(): BasketAnalysis {
    return {
      averageBasketSize: 0,
      averageBasketValue: 0,
      topProductCombinations: [],
      crossSellOpportunities: [],
      categoryAffinity: {},
      brandAffinity: {},
      pricePointAnalysis: { budget: 0, standard: 0, premium: 0 },
      timeBasedPatterns: { morning: 0, afternoon: 0, evening: 0, night: 0 }
    };
  }

  private getDefaultSeasonalPattern(): SeasonalPattern {
    return {
      seasonalIndex: 0,
      peakSeasons: [],
      offPeakSeasons: [],
      holidayImpact: 0,
      monthlyDistribution: {},
      quarterlyDistribution: {},
      yearOverYearGrowth: 0,
      seasonalityStrength: 0
    };
  }

  private getDefaultTemporalPattern(): TemporalPattern {
    return {
      preferredShoppingDays: [],
      preferredShoppingTimes: [],
      purchaseCycle: 0,
      nextPredictedPurchase: new Date(),
      dayOfWeekDistribution: {},
      hourOfDayDistribution: {},
      interPurchaseTime: { min: 0, max: 0, average: 0, median: 0, stdDev: 0 }
    };
  }

  private getDefaultProductPreference(): ProductPreference {
    return {
      favoriteCategories: [],
      brandPreferences: {},
      priceSensitivity: 'medium',
      qualityPreference: 'standard',
      newProductAdoption: 0,
      categoryExploration: 0
    };
  }

  private async savePurchasePatternAnalysis(result: PurchasePatternResult): Promise<void> {
    const analysis = new PurchasePattern({
      customerId: result.customerId,
      analysisDate: result.analysisDate,
      period: result.period,
      basketAnalysis: result.basketAnalysis,
      seasonalPatterns: result.seasonalPatterns,
      temporalPatterns: result.temporalPatterns,
      productPreferences: result.productPreferences
    });

    await analysis.save();
  }

  /**
   * Get purchase pattern analytics for dashboard
   */
  async getPurchasePatternAnalytics(dateFrom?: Date, dateTo?: Date): Promise<{
    totalCustomers: number;
    averageBasketValue: number;
    topProductCombinations: any[];
    seasonalTrends: any;
    crossSellOpportunities: any[];
    categoryAffinity: any;
  }> {
    try {
      const query: any = {};
      if (dateFrom || dateTo) {
        query.analysisDate = {};
        if (dateFrom) query.analysisDate.$gte = dateFrom;
        if (dateTo) query.analysisDate.$lte = dateTo;
      }

      const analyses = await PurchasePattern.find(query);
      
      const totalCustomers = analyses.length;
      const averageBasketValue = totalCustomers > 0 ?
        analyses.reduce((sum, analysis) => sum + analysis.basketAnalysis.averageBasketValue, 0) / totalCustomers : 0;

      // Aggregate top product combinations
      const allCombinations = analyses.flatMap(a => a.basketAnalysis.topProductCombinations);
      const topProductCombinations = this.aggregateCombinations(allCombinations);

      return {
        totalCustomers,
        averageBasketValue,
        topProductCombinations,
        seasonalTrends: {}, // Would aggregate seasonal patterns
        crossSellOpportunities: [], // Would aggregate cross-sell opportunities
        categoryAffinity: {} // Would aggregate category affinities
      };
    } catch (error) {
      throw new Error(`Failed to get purchase pattern analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private aggregateCombinations(combinations: any[]): any[] {
    // Aggregate combinations across all customers
    const aggregated = new Map<string, any>();

    combinations.forEach(combo => {
      const key = combo.products.sort().join('|');
      const existing = aggregated.get(key) || {
        products: combo.products,
        frequency: 0,
        confidence: 0,
        lift: 0,
        customers: 0
      };

      existing.frequency += combo.frequency;
      existing.confidence = Math.max(existing.confidence, combo.confidence);
      existing.lift = Math.max(existing.lift, combo.lift);
      existing.customers++;

      aggregated.set(key, existing);
    });

    return Array.from(aggregated.values())
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 20);
  }
}

export const purchasePatternService = new PurchasePatternService();
export default purchasePatternService;
