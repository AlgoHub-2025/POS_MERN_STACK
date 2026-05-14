import { Customer, ICustomer } from '../models/Customer';
import { ChurnPrediction, IChurnPrediction } from '../models/CustomerAnalytics';
import { EventEmitter } from 'events';
import mongoose from 'mongoose';

export interface ChurnRiskFactors {
  recencyDays: number;
  frequencyScore: number;
  monetaryScore: number;
  avgDaysBetweenOrders: number;
  orderTrend: 'increasing' | 'decreasing' | 'stable';
  satisfactionScore: number;
  supportTickets: number;
  lastInteractionDays: number;
  loyaltyPoints: number;
  communicationEngagement: number;
  paymentIssues: number;
  returnsRate: number;
  competitorRisk: number;
  seasonalRisk: number;
}

export interface ChurnPreventionAction {
  action: string;
  priority: 'low' | 'medium' | 'high';
  estimatedImpact: number;
  cost: number;
  timeline: string;
  description: string;
  targetAudience: string;
  automationLevel: 'manual' | 'semi_automated' | 'fully_automated';
}

export interface ChurnPredictionResult {
  customerId: string;
  churnProbability: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: Array<{
    factor: string;
    impact: number;
    description: string;
    category: 'behavioral' | 'transactional' | 'engagement' | 'satisfaction' | 'external';
  }>;
  predictiveFeatures: ChurnRiskFactors;
  preventionActions: ChurnPreventionAction[];
  modelVersion: string;
  confidenceScore: number;
  nextPredictionDate: Date;
  recommendations: string[];
  urgencyScore: number;
}

class ChurnPredictionService extends EventEmitter {
  private readonly RISK_THRESHOLDS = {
    low: 0.2,
    medium: 0.5,
    high: 0.7,
    critical: 0.85
  };

  private readonly PREVENTION_ACTIONS: Record<string, ChurnPreventionAction[]> = {
    low: [
      {
        action: 'Newsletter Subscription',
        priority: 'low',
        estimatedImpact: 0.1,
        cost: 5,
        timeline: '1 week',
        description: 'Send personalized newsletter with relevant content',
        targetAudience: 'All low-risk customers',
        automationLevel: 'fully_automated'
      },
      {
        action: 'Social Media Engagement',
        priority: 'low',
        estimatedImpact: 0.15,
        cost: 10,
        timeline: '2 weeks',
        description: 'Increase social media presence and engagement',
        targetAudience: 'Active social media users',
        automationLevel: 'semi_automated'
      }
    ],
    medium: [
      {
        action: 'Personalized Offers',
        priority: 'medium',
        estimatedImpact: 0.25,
        cost: 20,
        timeline: '1 week',
        description: 'Send targeted discount offers based on purchase history',
        targetAudience: 'Medium-risk customers',
        automationLevel: 'fully_automated'
      },
      {
        action: 'Loyalty Points Bonus',
        priority: 'medium',
        estimatedImpact: 0.3,
        cost: 15,
        timeline: '3 days',
        description: 'Award bonus loyalty points to encourage engagement',
        targetAudience: 'Loyalty program members',
        automationLevel: 'fully_automated'
      },
      {
        action: 'Product Recommendations',
        priority: 'medium',
        estimatedImpact: 0.2,
        cost: 5,
        timeline: '1 week',
        description: 'Send personalized product recommendations',
        targetAudience: 'Customers with browsing history',
        automationLevel: 'fully_automated'
      }
    ],
    high: [
      {
        action: 'High-Value Discount',
        priority: 'high',
        estimatedImpact: 0.4,
        cost: 50,
        timeline: '3 days',
        description: 'Send significant discount offer (20-30% off)',
        targetAudience: 'High-risk high-value customers',
        automationLevel: 'semi_automated'
      },
      {
        action: 'Personal Outreach',
        priority: 'high',
        estimatedImpact: 0.5,
        cost: 30,
        timeline: '2 days',
        description: 'Personal phone call or email from customer service',
        targetAudience: 'High-risk customers with recent issues',
        automationLevel: 'manual'
      },
      {
        action: 'Free Shipping Upgrade',
        priority: 'high',
        estimatedImpact: 0.35,
        cost: 25,
        timeline: '1 week',
        description: 'Offer free expedited shipping on next order',
        targetAudience: 'Customers who pay for shipping',
        automationLevel: 'fully_automated'
      },
      {
        action: 'Exclusive Access',
        priority: 'high',
        estimatedImpact: 0.3,
        cost: 20,
        timeline: '1 week',
        description: 'Provide early access to new products or sales',
        targetAudience: 'High-risk engaged customers',
        automationLevel: 'semi_automated'
      }
    ],
    critical: [
      {
        action: 'Retention Package',
        priority: 'high',
        estimatedImpact: 0.6,
        cost: 100,
        timeline: '24 hours',
        description: 'Comprehensive retention package with multiple benefits',
        targetAudience: 'Critical-risk high-value customers',
        automationLevel: 'manual'
      },
      {
        action: 'Manager Outreach',
        priority: 'high',
        estimatedImpact: 0.7,
        cost: 50,
        timeline: '12 hours',
        description: 'Personal outreach from account manager',
        targetAudience: 'Critical-risk business customers',
        automationLevel: 'manual'
      },
      {
        action: 'Win-Back Campaign',
        priority: 'high',
        estimatedImpact: 0.5,
        cost: 75,
        timeline: '48 hours',
        description: 'Aggressive win-back campaign with multiple touchpoints',
        targetAudience: 'Recently inactive critical-risk customers',
        automationLevel: 'semi_automated'
      }
    ]
  };

  constructor() {
    super();
  }

  /**
   * Predict churn risk for a customer
   */
  async predictChurn(customerId: string): Promise<ChurnPredictionResult> {
    try {
      const customer = await Customer.findOne({ customerId, isDeleted: false });
      if (!customer) {
        throw new Error('Customer not found');
      }

      // Calculate risk factors
      const riskFactors = await this.calculateRiskFactors(customerId);
      
      // Calculate churn probability using ML model
      const churnProbability = await this.calculateChurnProbability(riskFactors);
      
      // Determine risk level
      const riskLevel = this.determineRiskLevel(churnProbability);
      
      // Generate risk factor analysis
      const riskFactorAnalysis = this.analyzeRiskFactors(riskFactors);
      
      // Get prevention actions
      const preventionActions = this.getPreventionActions(riskLevel, riskFactors);
      
      // Calculate confidence score
      const confidenceScore = this.calculateConfidenceScore(riskFactors);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(riskFactors, riskLevel);
      
      // Calculate urgency score
      const urgencyScore = this.calculateUrgencyScore(churnProbability, riskFactors);

      const result: ChurnPredictionResult = {
        customerId,
        churnProbability,
        riskLevel,
        riskFactors: riskFactorAnalysis,
        predictiveFeatures: riskFactors,
        preventionActions,
        modelVersion: 'v2.1',
        confidenceScore,
        nextPredictionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
        recommendations,
        urgencyScore
      };

      // Save prediction to database
      await this.saveChurnPrediction(result);

      // Emit events
      this.emit('churnPredicted', result);
      
      if (riskLevel === 'critical' || riskLevel === 'high') {
        this.emit('highChurnRisk', result);
      }

      return result;
    } catch (error) {
      throw new Error(`Failed to predict churn: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate risk factors for churn prediction
   */
  private async calculateRiskFactors(customerId: string): Promise<ChurnRiskFactors> {
    const customer = await Customer.findOne({ customerId, isDeleted: false });
    if (!customer) {
      throw new Error('Customer not found');
    }

    // Get customer's order history
    const orders = await this.getCustomerOrders(customerId);
    
    // Calculate recency (days since last purchase)
    const lastOrder = orders.length > 0 ? 
      new Date(Math.max(...orders.map(o => new Date(o.createdAt).getTime()))) : 
      new Date(customer.createdAt);
    const recencyDays = (Date.now() - lastOrder.getTime()) / (1000 * 60 * 60 * 24);

    // Calculate frequency score
    const frequencyScore = this.calculateFrequencyScore(orders, customer.createdAt);
    
    // Calculate monetary score
    const monetaryScore = this.calculateMonetaryScore(orders);
    
    // Calculate average days between orders
    const avgDaysBetweenOrders = this.calculateAvgDaysBetweenOrders(orders);
    
    // Calculate order trend
    const orderTrend = this.calculateOrderTrend(orders);
    
    // Calculate satisfaction score (placeholder - would integrate with feedback system)
    const satisfactionScore = await this.calculateSatisfactionScore(customerId);
    
    // Calculate support tickets (placeholder - would integrate with support system)
    const supportTickets = await this.getSupportTicketCount(customerId);
    
    // Calculate last interaction days
    const lastInteractionDays = await this.getLastInteractionDays(customerId);
    
    // Get loyalty points
    const loyaltyPoints = customer.loyalty?.points || 0;
    
    // Calculate communication engagement
    const communicationEngagement = this.calculateCommunicationEngagement(customer);
    
    // Calculate payment issues
    const paymentIssues = await this.getPaymentIssues(customerId);
    
    // Calculate returns rate
    const returnsRate = await this.getReturnsRate(customerId);
    
    // Calculate competitor risk
    const competitorRisk = await this.calculateCompetitorRisk(customerId);
    
    // Calculate seasonal risk
    const seasonalRisk = this.calculateSeasonalRisk(orders);

    return {
      recencyDays,
      frequencyScore,
      monetaryScore,
      avgDaysBetweenOrders,
      orderTrend,
      satisfactionScore,
      supportTickets,
      lastInteractionDays,
      loyaltyPoints,
      communicationEngagement,
      paymentIssues,
      returnsRate,
      competitorRisk,
      seasonalRisk
    };
  }

  /**
   * Calculate churn probability using ML model
   */
  private async calculateChurnProbability(riskFactors: ChurnRiskFactors): Promise<number> {
    // Simplified ML model - in production, this would use actual ML models
    // Feature weights (determined by model training)
    const weights = {
      recencyDays: 0.15,
      frequencyScore: -0.2, // Negative because higher frequency = lower churn
      monetaryScore: -0.15, // Negative because higher monetary = lower churn
      avgDaysBetweenOrders: 0.1,
      orderTrend: { decreasing: 0.2, stable: 0, increasing: -0.1 },
      satisfactionScore: -0.25,
      supportTickets: 0.1,
      lastInteractionDays: 0.1,
      loyaltyPoints: -0.05,
      communicationEngagement: -0.1,
      paymentIssues: 0.15,
      returnsRate: 0.1,
      competitorRisk: 0.1,
      seasonalRisk: 0.05
    };

    // Normalize features to 0-1 range
    const normalizedFeatures = this.normalizeFeatures(riskFactors);
    
    // Calculate weighted sum
    let churnScore = 0;
    
    Object.entries(weights).forEach(([feature, weight]) => {
      if (typeof weight === 'number') {
        churnScore += normalizedFeatures[feature as keyof ChurnRiskFactors] * weight;
      } else {
        // Handle categorical features
        const value = riskFactors[feature as keyof ChurnRiskFactors] as any;
        if (typeof value === 'string' && weight[value] !== undefined) {
          churnScore += weight[value];
        }
      }
    });

    // Apply sigmoid function to get probability between 0 and 1
    const churnProbability = 1 / (1 + Math.exp(-churnScore));
    
    return Math.max(0, Math.min(1, churnProbability));
  }

  /**
   * Normalize features to 0-1 range
   */
  private normalizeFeatures(riskFactors: ChurnRiskFactors): Partial<ChurnRiskFactors> {
    return {
      recencyDays: Math.min(1, riskFactors.recencyDays / 365), // Normalize to years
      frequencyScore: riskFactors.frequencyScore,
      monetaryScore: riskFactors.monetaryScore,
      avgDaysBetweenOrders: Math.min(1, riskFactors.avgDaysBetweenOrders / 90), // Normalize to 3 months
      orderTrend: riskFactors.orderTrend,
      satisfactionScore: riskFactors.satisfactionScore,
      supportTickets: Math.min(1, riskFactors.supportTickets / 10), // Normalize to 10 tickets
      lastInteractionDays: Math.min(1, riskFactors.lastInteractionDays / 30), // Normalize to 30 days
      loyaltyPoints: Math.min(1, riskFactors.loyaltyPoints / 10000), // Normalize to 10k points
      communicationEngagement: riskFactors.communicationEngagement,
      paymentIssues: Math.min(1, riskFactors.paymentIssues / 5), // Normalize to 5 issues
      returnsRate: Math.min(1, riskFactors.returnsRate), // Already normalized
      competitorRisk: riskFactors.competitorRisk,
      seasonalRisk: riskFactors.seasonalRisk
    };
  }

  /**
   * Determine risk level based on churn probability
   */
  private determineRiskLevel(churnProbability: number): 'low' | 'medium' | 'high' | 'critical' {
    if (churnProbability >= this.RISK_THRESHOLDS.critical) return 'critical';
    if (churnProbability >= this.RISK_THRESHOLDS.high) return 'high';
    if (churnProbability >= this.RISK_THRESHOLDS.medium) return 'medium';
    return 'low';
  }

  /**
   * Analyze risk factors and categorize them
   */
  private analyzeRiskFactors(riskFactors: ChurnRiskFactors): Array<{
    factor: string;
    impact: number;
    description: string;
    category: 'behavioral' | 'transactional' | 'engagement' | 'satisfaction' | 'external';
  }> {
    const analysis = [];

    // Behavioral factors
    if (riskFactors.recencyDays > 30) {
      analysis.push({
        factor: 'High Recency Days',
        impact: Math.min(1, riskFactors.recencyDays / 90),
        description: `Customer hasn't purchased in ${Math.round(riskFactors.recencyDays)} days`,
        category: 'behavioral' as const
      });
    }

    if (riskFactors.frequencyScore < 0.3) {
      analysis.push({
        factor: 'Low Purchase Frequency',
        impact: 1 - riskFactors.frequencyScore,
        description: 'Customer purchases less frequently than average',
        category: 'behavioral' as const
      });
    }

    // Transactional factors
    if (riskFactors.monetaryScore < 0.3) {
      analysis.push({
        factor: 'Low Monetary Value',
        impact: 1 - riskFactors.monetaryScore,
        description: 'Customer has low average order value',
        category: 'transactional' as const
      });
    }

    if (riskFactors.paymentIssues > 0) {
      analysis.push({
        factor: 'Payment Issues',
        impact: Math.min(1, riskFactors.paymentIssues / 3),
        description: `Customer has ${riskFactors.paymentIssues} payment issues`,
        category: 'transactional' as const
      });
    }

    // Engagement factors
    if (riskFactors.communicationEngagement < 0.3) {
      analysis.push({
        factor: 'Low Communication Engagement',
        impact: 1 - riskFactors.communicationEngagement,
        description: 'Customer rarely engages with communications',
        category: 'engagement' as const
      });
    }

    if (riskFactors.lastInteractionDays > 14) {
      analysis.push({
        factor: 'Low Recent Interaction',
        impact: Math.min(1, riskFactors.lastInteractionDays / 30),
        description: `No interaction in ${Math.round(riskFactors.lastInteractionDays)} days`,
        category: 'engagement' as const
      });
    }

    // Satisfaction factors
    if (riskFactors.satisfactionScore < 0.5) {
      analysis.push({
        factor: 'Low Satisfaction Score',
        impact: 1 - riskFactors.satisfactionScore,
        description: 'Customer satisfaction is below average',
        category: 'satisfaction' as const
      });
    }

    if (riskFactors.supportTickets > 2) {
      analysis.push({
        factor: 'High Support Tickets',
        impact: Math.min(1, riskFactors.supportTickets / 5),
        description: `Customer has ${riskFactors.supportTickets} support tickets`,
        category: 'satisfaction' as const
      });
    }

    // External factors
    if (riskFactors.competitorRisk > 0.7) {
      analysis.push({
        factor: 'High Competitor Risk',
        impact: riskFactors.competitorRisk,
        description: 'High risk of competitor acquisition',
        category: 'external' as const
      });
    }

    return analysis.sort((a, b) => b.impact - a.impact);
  }

  /**
   * Get prevention actions based on risk level
   */
  private getPreventionActions(
    riskLevel: 'low' | 'medium' | 'high' | 'critical',
    riskFactors: ChurnRiskFactors
  ): ChurnPreventionAction[] {
    const baseActions = this.PREVENTION_ACTIONS[riskLevel] || [];
    
    // Customize actions based on specific risk factors
    const customizedActions = baseActions.map(action => {
      if (riskFactors.monetaryScore < 0.3 && action.action.includes('Discount')) {
        return {
          ...action,
          estimatedImpact: action.estimatedImpact * 1.2,
          description: action.description + ' (High impact for low-value customers)'
        };
      }
      
      if (riskFactors.communicationEngagement < 0.3 && action.action.includes('Personal')) {
        return {
          ...action,
          priority: 'high' as const,
          estimatedImpact: action.estimatedImpact * 1.3
        };
      }
      
      return action;
    });

    return customizedActions;
  }

  /**
   * Calculate confidence score for prediction
   */
  private calculateConfidenceScore(riskFactors: ChurnRiskFactors): number {
    // Confidence based on data quality and recency
    let confidence = 0.5; // Base confidence

    // Higher confidence with more recent data
    if (riskFactors.recencyDays < 30) confidence += 0.2;
    else if (riskFactors.recencyDays < 90) confidence += 0.1;

    // Higher confidence with consistent purchase history
    if (riskFactors.frequencyScore > 0.5) confidence += 0.1;

    // Higher confidence with sufficient data points
    if (riskFactors.supportTickets > 0 || riskFactors.loyaltyPoints > 0) confidence += 0.1;

    return Math.max(0.1, Math.min(1, confidence));
  }

  /**
   * Generate recommendations based on risk factors
   */
  private generateRecommendations(
    riskFactors: ChurnRiskFactors,
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
  ): string[] {
    const recommendations = [];

    if (riskFactors.recencyDays > 30) {
      recommendations.push('Send re-engagement campaign with personalized offers');
    }

    if (riskFactors.frequencyScore < 0.3) {
      recommendations.push('Implement subscription or loyalty program to increase frequency');
    }

    if (riskFactors.monetaryScore < 0.3) {
      recommendations.push('Upsell higher-value products or bundle deals');
    }

    if (riskFactors.satisfactionScore < 0.5) {
      recommendations.push('Address customer service issues and improve satisfaction');
    }

    if (riskFactors.communicationEngagement < 0.3) {
      recommendations.push('Optimize communication channels and content');
    }

    if (riskLevel === 'critical') {
      recommendations.push('Immediate personal outreach required');
      recommendations.push('Consider special retention package');
    }

    return recommendations;
  }

  /**
   * Calculate urgency score
   */
  private calculateUrgencyScore(churnProbability: number, riskFactors: ChurnRiskFactors): number {
    let urgency = churnProbability;

    // Increase urgency based on customer value
    if (riskFactors.monetaryScore > 0.7) urgency *= 1.2;

    // Increase urgency based on recent inactivity
    if (riskFactors.recencyDays > 60) urgency *= 1.1;

    // Increase urgency based on satisfaction issues
    if (riskFactors.satisfactionScore < 0.3) urgency *= 1.15;

    return Math.max(0, Math.min(1, urgency));
  }

  /**
   * Batch predict churn for multiple customers
   */
  async batchPredictChurn(customerIds: string[]): Promise<ChurnPredictionResult[]> {
    try {
      const results = await Promise.all(
        customerIds.map(customerId => this.predictChurn(customerId))
      );

      this.emit('batchChurnPredicted', results);
      return results;
    } catch (error) {
      throw new Error(`Failed to batch predict churn: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get churn analytics
   */
  async getChurnAnalytics(dateFrom?: Date, dateTo?: Date): Promise<{
    totalCustomers: number;
    riskDistribution: Record<string, number>;
    averageChurnProbability: number;
    highRiskCustomers: any[];
    topRiskFactors: any[];
    preventionEffectiveness: any;
  }> {
    try {
      const query: any = {};
      if (dateFrom || dateTo) {
        query.predictionDate = {};
        if (dateFrom) query.predictionDate.$gte = dateFrom;
        if (dateTo) query.predictionDate.$lte = dateTo;
      }

      const predictions = await ChurnPrediction.find(query)
        .sort({ predictionDate: -1 });

      const totalCustomers = predictions.length;
      const averageChurnProbability = totalCustomers > 0 ?
        predictions.reduce((sum, p) => sum + p.churnProbability, 0) / totalCustomers : 0;

      // Risk distribution
      const riskDistribution = {
        low: predictions.filter(p => p.riskLevel === 'low').length,
        medium: predictions.filter(p => p.riskLevel === 'medium').length,
        high: predictions.filter(p => p.riskLevel === 'high').length,
        critical: predictions.filter(p => p.riskLevel === 'critical').length
      };

      // High risk customers
      const highRiskCustomers = predictions
        .filter(p => p.riskLevel === 'high' || p.riskLevel === 'critical')
        .sort((a, b) => b.churnProbability - a.churnProbability)
        .slice(0, 20)
        .map(p => ({
          customerId: p.customerId,
          churnProbability: p.churnProbability,
          riskLevel: p.riskLevel,
          urgencyScore: this.calculateUrgencyScore(p.churnProbability, p.predictiveFeatures),
          topRiskFactors: p.riskFactors.slice(0, 3)
        }));

      // Top risk factors
      const riskFactorCounts: Record<string, number> = {};
      predictions.forEach(p => {
        p.riskFactors.forEach(rf => {
          riskFactorCounts[rf.factor] = (riskFactorCounts[rf.factor] || 0) + 1;
        });
      });

      const topRiskFactors = Object.entries(riskFactorCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([factor, count]) => ({
          factor,
          count,
          percentage: (count / totalCustomers) * 100
        }));

      return {
        totalCustomers,
        riskDistribution,
        averageChurnProbability,
        highRiskCustomers,
        topRiskFactors,
        preventionEffectiveness: {} // Would calculate from prevention campaign results
      };
    } catch (error) {
      throw new Error(`Failed to get churn analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Helper methods
   */
  private async getCustomerOrders(customerId: string) {
    // This would integrate with the Order model
    // For now, return empty array as placeholder
    return [];
  }

  private calculateFrequencyScore(orders: any[], createdAt: Date): number {
    if (orders.length === 0) return 0;
    
    const daysSinceCreation = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    const frequency = orders.length / (daysSinceCreation / 30); // Orders per month
    
    return Math.min(1, frequency / 4); // Normalize assuming 4 orders/month is high
  }

  private calculateMonetaryScore(orders: any[]): number {
    if (orders.length === 0) return 0;
    
    const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const avgOrderValue = totalSpent / orders.length;
    
    return Math.min(1, avgOrderValue / 1000); // Normalize assuming $1000 is high
  }

  private calculateAvgDaysBetweenOrders(orders: any[]): number {
    if (orders.length < 2) return 0;
    
    const sortedDates = orders
      .map(o => new Date(o.createdAt))
      .sort((a, b) => a.getTime() - b.getTime());
    
    const intervals = [];
    for (let i = 1; i < sortedDates.length; i++) {
      intervals.push((sortedDates[i].getTime() - sortedDates[i-1].getTime()) / (1000 * 60 * 60 * 24));
    }
    
    return intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  }

  private calculateOrderTrend(orders: any[]): 'increasing' | 'decreasing' | 'stable' {
    if (orders.length < 3) return 'stable';
    
    const recentOrders = orders.slice(-3);
    const amounts = recentOrders.map(o => o.totalAmount || 0);
    
    const trend = (amounts[2] - amounts[0]) / amounts[0];
    
    if (trend > 0.1) return 'increasing';
    if (trend < -0.1) return 'decreasing';
    return 'stable';
  }

  private async calculateSatisfactionScore(customerId: string): Promise<number> {
    // This would integrate with feedback/satisfaction system
    // For now, return default value
    return 0.7;
  }

  private async getSupportTicketCount(customerId: string): Promise<number> {
    // This would integrate with support system
    // For now, return default value
    return 0;
  }

  private async getLastInteractionDays(customerId: string): Promise<number> {
    // This would integrate with interaction tracking system
    // For now, return default value
    return 7;
  }

  private calculateCommunicationEngagement(customer: ICustomer): number {
    let engagement = 0.5;
    
    if (customer.communicationPreferences) {
      const enabledChannels = Object.values(customer.communicationPreferences).filter(Boolean).length;
      engagement += (enabledChannels / Object.keys(customer.communicationPreferences).length) * 0.3;
    }
    
    return Math.max(0, Math.min(1, engagement));
  }

  private async getPaymentIssues(customerId: string): Promise<number> {
    // This would integrate with payment system
    // For now, return default value
    return 0;
  }

  private async getReturnsRate(customerId: string): Promise<number> {
    // This would integrate with returns system
    // For now, return default value
    return 0.1;
  }

  private async calculateCompetitorRisk(customerId: string): Promise<number> {
    // This would integrate with market intelligence
    // For now, return default value
    return 0.3;
  }

  private calculateSeasonalRisk(orders: any[]): number {
    // Simple seasonal risk calculation
    const currentMonth = new Date().getMonth();
    const winterMonths = [11, 0, 1]; // Dec, Jan, Feb
    
    // Higher risk in off-season months
    return winterMonths.includes(currentMonth) ? 0.2 : 0.1;
  }

  private async saveChurnPrediction(result: ChurnPredictionResult): Promise<void> {
    const prediction = new ChurnPrediction({
      customerId: result.customerId,
      predictionDate: new Date(),
      churnProbability: result.churnProbability,
      riskLevel: result.riskLevel,
      riskFactors: result.riskFactors,
      predictiveFeatures: result.predictiveFeatures,
      preventionActions: result.preventionActions.map(action => ({
        action: action.action,
        priority: action.priority,
        estimatedImpact: action.estimatedImpact,
        status: 'suggested' as const
      })),
      modelVersion: result.modelVersion,
      confidenceScore: result.confidenceScore,
      nextPredictionDate: result.nextPredictionDate
    });

    await prediction.save();
  }
}

export const churnPredictionService = new ChurnPredictionService();
export default churnPredictionService;
