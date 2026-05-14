import { Customer, ICustomer } from '../models/Customer';
import { 
  CLVCalculation, 
  ICLVCalculation,
  ChurnPrediction,
  CustomerSegment,
  PurchasePattern,
  CustomerJourney,
  CohortAnalysis,
  FeedbackAnalysis
} from '../models/CustomerAnalytics';
import mongoose from 'mongoose';
import { EventEmitter } from 'events';

export interface CLVResult {
  customerId: string;
  historicalCLV: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    purchaseFrequency: number;
    customerLifetime: number;
    profitMargin: number;
    clv: number;
  };
  predictiveCLV: {
    predictedCLV: number;
    confidenceScore: number;
    timeHorizon: number;
    features: {
      recencyScore: number;
      frequencyScore: number;
      monetaryScore: number;
      churnRisk: number;
      engagementScore: number;
    };
  };
  cohortAnalysis: {
    cohortId: string;
    cohortType: string;
    cohortCLV: number;
    cohortPercentile: number;
  };
  segmentation: {
    segment: string;
    segmentCLV: number;
    segmentPercentile: number;
    segmentCharacteristics: string[];
  };
  trends: Array<{
    date: Date;
    clv: number;
    revenue: number;
    orders: number;
    frequency: number;
  }>;
}

export interface PredictiveCLV {
  customerId: string;
  predictedCLV: number;
  confidenceScore: number;
  timeHorizon: number;
  modelVersion: string;
  features: {
    recencyScore: number;
    frequencyScore: number;
    monetaryScore: number;
    churnRisk: number;
    engagementScore: number;
  };
  predictionDate: Date;
}

export interface TrendData {
  period: string;
  clvTrend: 'increasing' | 'decreasing' | 'stable';
  averageCLV: number;
  growthRate: number;
  segmentBreakdown: Record<string, number>;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
}

export interface ExportResult {
  format: 'csv' | 'excel' | 'json';
  data: any[];
  filename: string;
  generatedAt: Date;
  recordCount: number;
}

class CustomerAnalyticsService extends EventEmitter {
  constructor() {
    super();
  }

  /**
   * Calculate Customer Lifetime Value (CLV)
   */
  async calculateCLV(customerId: string, options: {
    period?: { startDate: Date; endDate: Date };
    includePredictive?: boolean;
    includeCohort?: boolean;
    includeSegmentation?: boolean;
  } = {}): Promise<CLVResult> {
    try {
      const customer = await Customer.findOne({ customerId, isDeleted: false });
      if (!customer) {
        throw new Error('Customer not found');
      }

      const period = options.period || {
        startDate: new Date(customer.createdAt),
        endDate: new Date()
      };

      // Calculate historical CLV
      const historicalCLV = await this.calculateHistoricalCLV(customerId, period);
      
      // Calculate predictive CLV
      const predictiveCLV = options.includePredictive !== false ? 
        await this.calculatePredictiveCLV(customerId, historicalCLV) : null;
      
      // Cohort analysis
      const cohortAnalysis = options.includeCohort !== false ? 
        await this.getCohortAnalysis(customerId, period) : null;
      
      // Segmentation analysis
      const segmentation = options.includeSegmentation !== false ? 
        await this.getSegmentationAnalysis(customerId) : null;
      
      // Trends analysis
      const trends = await this.calculateCLVTrends(customerId, period);

      const result: CLVResult = {
        customerId,
        historicalCLV,
        predictiveCLV: predictiveCLV || {
          predictedCLV: historicalCLV.clv,
          confidenceScore: 0.5,
          timeHorizon: 12,
          features: {
            recencyScore: 0.5,
            frequencyScore: 0.5,
            monetaryScore: 0.5,
            churnRisk: 0.5,
            engagementScore: 0.5
          }
        },
        cohortAnalysis: cohortAnalysis || {
          cohortId: 'default',
          cohortType: 'behavioral',
          cohortCLV: historicalCLV.clv,
          cohortPercentile: 50
        },
        segmentation: segmentation || {
          segment: 'standard',
          segmentCLV: historicalCLV.clv,
          segmentPercentile: 50,
          segmentCharacteristics: []
        },
        trends
      };

      // Save calculation to database
      await this.saveCLVCalculation(result, period);

      this.emit('clvCalculated', result);
      return result;
    } catch (error) {
      throw new Error(`Failed to calculate CLV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate historical CLV based on purchase data
   */
  private async calculateHistoricalCLV(customerId: string, period: { startDate: Date; endDate: Date }) {
    // Get customer's purchase history
    const orders = await this.getCustomerOrders(customerId, period);
    
    if (orders.length === 0) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        purchaseFrequency: 0,
        customerLifetime: 0,
        profitMargin: 0.2, // Default 20%
        clv: 0
      };
    }

    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalRevenue / totalOrders;
    
    // Calculate purchase frequency (orders per month)
    const monthsDiff = (period.endDate.getTime() - period.startDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    const purchaseFrequency = monthsDiff > 0 ? totalOrders / monthsDiff : 0;
    
    // Customer lifetime in months
    const customerLifetime = monthsDiff;
    
    // Profit margin (simplified - would use actual cost data)
    const profitMargin = 0.2; // 20% default profit margin
    
    // Historical CLV calculation: (AOV × Purchase Frequency × Customer Lifetime × Profit Margin)
    const clv = averageOrderValue * purchaseFrequency * customerLifetime * profitMargin;

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      purchaseFrequency,
      customerLifetime,
      profitMargin,
      clv
    };
  }

  /**
   * Calculate predictive CLV using RFM model
   */
  private async calculatePredictiveCLV(customerId: string, historicalCLV: any): Promise<PredictiveCLV['predictiveCLV']> {
    // Calculate RFM scores
    const rfmScores = await this.calculateRFMScores(customerId);
    
    // Calculate churn risk
    const churnRisk = await this.calculateChurnRisk(customerId);
    
    // Calculate engagement score
    const engagementScore = await this.calculateEngagementScore(customerId);
    
    // Machine learning model (simplified linear regression for demo)
    // In production, this would use actual ML models
    const features = {
      recencyScore: rfmScores.recency,
      frequencyScore: rfmScores.frequency,
      monetaryScore: rfmScores.monetary,
      churnRisk,
      engagementScore
    };
    
    // Predictive CLV formula (simplified)
    const baseMultiplier = 1.2; // Growth expectation
    const churnAdjustment = 1 - churnRisk;
    const engagementMultiplier = 1 + (engagementScore - 0.5);
    
    const predictedCLV = historicalCLV.clv * baseMultiplier * churnAdjustment * engagementMultiplier;
    
    // Confidence score based on data quality
    const confidenceScore = this.calculatePredictionConfidence(features);
    
    return {
      predictedCLV,
      confidenceScore,
      timeHorizon: 12, // 12 months prediction
      modelVersion: 'v1.0',
      features
    };
  }

  /**
   * Calculate RFM (Recency, Frequency, Monetary) scores
   */
  private async calculateRFMScores(customerId: string) {
    const orders = await this.getCustomerOrders(customerId, {
      startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // Last year
      endDate: new Date()
    });

    if (orders.length === 0) {
      return { recency: 0, frequency: 0, monetary: 0 };
    }

    // Recency: Days since last purchase (lower is better, so we invert)
    const lastOrderDate = new Date(Math.max(...orders.map(o => new Date(o.createdAt).getTime())));
    const daysSinceLastPurchase = (Date.now() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(0, 1 - (daysSinceLastPurchase / 365)); // Normalize to 0-1

    // Frequency: Orders per month
    const monthsSpan = 12;
    const frequencyScore = Math.min(1, orders.length / monthsSpan / 4); // Normalize assuming 4 orders/month is high

    // Monetary: Average order value relative to customer base
    const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const avgOrderValue = totalSpent / orders.length;
    const monetaryScore = Math.min(1, avgOrderValue / 1000); // Normalize assuming $1000 is high

    return {
      recency: recencyScore,
      frequency: frequencyScore,
      monetary: monetaryScore
    };
  }

  /**
   * Calculate churn risk
   */
  private async calculateChurnRisk(customerId: string): Promise<number> {
    const rfmScores = await this.calculateRFMScores(customerId);
    
    // Simplified churn risk calculation
    // High recency score + low frequency + low monetary = high churn risk
    const churnRisk = (1 - rfmScores.recency) * 0.4 + 
                      (1 - rfmScores.frequency) * 0.3 + 
                      (1 - rfmScores.monetary) * 0.3;
    
    return Math.max(0, Math.min(1, churnRisk));
  }

  /**
   * Calculate engagement score
   */
  private async calculateEngagementScore(customerId: string): Promise<number> {
    // Get customer engagement metrics
    const customer = await Customer.findOne({ customerId, isDeleted: false });
    if (!customer) return 0.5;

    let engagementScore = 0.5; // Base score

    // Loyalty points engagement
    if (customer.loyalty && customer.loyalty.points > 0) {
      engagementScore += 0.1;
    }

    // Communication preferences
    if (customer.communicationPreferences && 
        Object.values(customer.communicationPreferences).some(pref => pref)) {
      engagementScore += 0.1;
    }

    // Recent activity (simplified)
    const recentOrders = await this.getCustomerOrders(customerId, {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      endDate: new Date()
    });
    
    if (recentOrders.length > 0) {
      engagementScore += 0.2;
    }

    return Math.max(0, Math.min(1, engagementScore));
  }

  /**
   * Calculate prediction confidence
   */
  private calculatePredictionConfidence(features: {
    recencyScore: number;
    frequencyScore: number;
    monetaryScore: number;
    churnRisk: number;
    engagementScore: number;
  }): number {
    // Confidence based on data completeness and consistency
    const dataQuality = Object.values(features).every(score => score >= 0 && score <= 1) ? 0.8 : 0.5;
    
    // Consistency check
    const avgScore = Object.values(features).reduce((sum, score) => sum + score, 0) / Object.values(features).length;
    const variance = Object.values(features).reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / Object.values(features).length;
    const consistencyScore = Math.max(0, 1 - variance);
    
    return (dataQuality + consistencyScore) / 2;
  }

  /**
   * Get cohort analysis for customer
   */
  private async getCohortAnalysis(customerId: string, period: { startDate: Date; endDate: Date }) {
    const customer = await Customer.findOne({ customerId, isDeleted: false });
    if (!customer) return null;

    // Determine cohort based on acquisition date
    const acquisitionDate = new Date(customer.createdAt);
    const cohortMonth = `${acquisitionDate.getFullYear()}-${String(acquisitionDate.getMonth() + 1).padStart(2, '0')}`;
    
    // Get cohort metrics (simplified)
    const cohortCLV = await this.getCohortAverageCLV(cohortMonth);
    const allCustomersCLV = await this.getAllCustomersAverageCLV();
    const cohortPercentile = (cohortCLV / allCustomersCLV) * 100;

    return {
      cohortId: cohortMonth,
      cohortType: 'acquisition',
      cohortCLV,
      cohortPercentile: Math.min(100, Math.max(0, cohortPercentile))
    };
  }

  /**
   * Get segmentation analysis
   */
  private async getSegmentationAnalysis(customerId: string) {
    const segment = await CustomerSegment.findOne({ 
      customerId, 
      isActive: true 
    }).sort({ assignmentDate: -1 });

    if (!segment) {
      return {
        segment: 'unsegmented',
        segmentCLV: 0,
        segmentPercentile: 50,
        segmentCharacteristics: []
      };
    }

    const segmentCLV = await this.getSegmentAverageCLV(segment.segmentName);
    const allCustomersCLV = await this.getAllCustomersAverageCLV();
    const segmentPercentile = (segmentCLV / allCustomersCLV) * 100;

    return {
      segment: segment.segmentName,
      segmentCLV,
      segmentPercentile: Math.min(100, Math.max(0, segmentPercentile)),
      segmentCharacteristics: Object.keys(segment.characteristics).filter(key => 
        segment.characteristics[key as keyof typeof segment.characteristics]
      )
    };
  }

  /**
   * Calculate CLV trends over time
   */
  private async calculateCLVTrends(customerId: string, period: { startDate: Date; endDate: Date }) {
    const trends = [];
    const monthsDiff = Math.ceil((period.endDate.getTime() - period.startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    for (let i = 0; i < Math.min(monthsDiff, 12); i++) {
      const trendPeriod = {
        startDate: new Date(period.startDate.getTime() + i * 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(Math.min(
          period.startDate.getTime() + (i + 1) * 30 * 24 * 60 * 60 * 1000,
          period.endDate.getTime()
        ))
      };

      const monthlyCLV = await this.calculateHistoricalCLV(customerId, trendPeriod);
      
      trends.push({
        date: trendPeriod.startDate,
        clv: monthlyCLV.clv,
        revenue: monthlyCLV.totalRevenue,
        orders: monthlyCLV.totalOrders,
        frequency: monthlyCLV.purchaseFrequency
      });
    }

    return trends;
  }

  /**
   * Predict CLV for future periods
   */
  async predictCLV(customerId: string, timeHorizon: number = 12): Promise<PredictiveCLV> {
    try {
      const historicalCLV = await this.calculateHistoricalCLV(customerId, {
        startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        endDate: new Date()
      });

      const predictiveCLV = await this.calculatePredictiveCLV(customerId, historicalCLV);

      const result: PredictiveCLV = {
        customerId,
        ...predictiveCLV,
        timeHorizon,
        predictionDate: new Date()
      };

      this.emit('clvPredicted', result);
      return result;
    } catch (error) {
      throw new Error(`Failed to predict CLV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get CLV trends for a segment
   */
  async getCLVTrends(segment: string, period: { startDate: Date; endDate: Date }): Promise<TrendData> {
    try {
      // Get CLV calculations for the segment
      const segmentCalculations = await CLVCalculation.find({
        'segmentation.segment': segment,
        calculationDate: { $gte: period.startDate, $lte: period.endDate }
      }).sort({ calculationDate: 1 });

      if (segmentCalculations.length === 0) {
        return {
          period: `${period.startDate.toISOString().split('T')[0]} to ${period.endDate.toISOString().split('T')[0]}`,
          clvTrend: 'stable',
          averageCLV: 0,
          growthRate: 0,
          segmentBreakdown: {},
          confidenceInterval: { lower: 0, upper: 0 }
        };
      }

      // Calculate trend
      const firstCLV = segmentCalculations[0].historicalCLV.clv;
      const lastCLV = segmentCalculations[segmentCalculations.length - 1].historicalCLV.clv;
      const growthRate = ((lastCLV - firstCLV) / firstCLV) * 100;
      
      let clvTrend: 'increasing' | 'decreasing' | 'stable';
      if (growthRate > 5) clvTrend = 'increasing';
      else if (growthRate < -5) clvTrend = 'decreasing';
      else clvTrend = 'stable';

      const averageCLV = segmentCalculations.reduce((sum, calc) => sum + calc.historicalCLV.clv, 0) / segmentCalculations.length;

      // Calculate confidence interval
      const variance = segmentCalculations.reduce((sum, calc) => {
        return sum + Math.pow(calc.historicalCLV.clv - averageCLV, 2);
      }, 0) / segmentCalculations.length;
      const stdDev = Math.sqrt(variance);
      const marginOfError = 1.96 * (stdDev / Math.sqrt(segmentCalculations.length));

      return {
        period: `${period.startDate.toISOString().split('T')[0]} to ${period.endDate.toISOString().split('T')[0]}`,
        clvTrend,
        averageCLV,
        growthRate,
        segmentBreakdown: this.calculateSegmentBreakdown(segmentCalculations),
        confidenceInterval: {
          lower: Math.max(0, averageCLV - marginOfError),
          upper: averageCLV + marginOfError
        }
      };
    } catch (error) {
      throw new Error(`Failed to get CLV trends: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Export CLV analysis
   */
  async exportCLVAnalysis(options: {
    format: 'csv' | 'excel' | 'json';
    customerIds?: string[];
    period?: { startDate: Date; endDate: Date };
    includePredictive?: boolean;
  }): Promise<ExportResult> {
    try {
      const query: any = {};
      
      if (options.customerIds && options.customerIds.length > 0) {
        query.customerId = { $in: options.customerIds };
      }
      
      if (options.period) {
        query.calculationDate = { 
          $gte: options.period.startDate, 
          $lte: options.period.endDate 
        };
      }

      const calculations = await CLVCalculation.find(query).sort({ 
        'historicalCLV.clv': -1 
      });

      const data = calculations.map(calc => ({
        customerId: calc.customerId,
        calculationDate: calc.calculationDate,
        totalRevenue: calc.historicalCLV.totalRevenue,
        totalOrders: calc.historicalCLV.totalOrders,
        averageOrderValue: calc.historicalCLV.averageOrderValue,
        purchaseFrequency: calc.historicalCLV.purchaseFrequency,
        customerLifetime: calc.historicalCLV.customerLifetime,
        profitMargin: calc.historicalCLV.profitMargin,
        historicalCLV: calc.historicalCLV.clv,
        ...(options.includePredictive && {
          predictedCLV: calc.predictiveCLV.predictedCLV,
          confidenceScore: calc.predictiveCLV.confidenceScore,
          timeHorizon: calc.predictiveCLV.timeHorizon
        }),
        segment: calc.segmentation.segment,
        cohortId: calc.cohortAnalysis.cohortId,
        cohortCLV: calc.cohortAnalysis.cohortCLV
      }));

      const filename = `clv_analysis_${new Date().toISOString().split('T')[0]}.${options.format}`;

      const result: ExportResult = {
        format: options.format,
        data,
        filename,
        generatedAt: new Date(),
        recordCount: data.length
      };

      this.emit('clvExported', result);
      return result;
    } catch (error) {
      throw new Error(`Failed to export CLV analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Helper methods
   */
  private async getCustomerOrders(customerId: string, period: { startDate: Date; endDate: Date }) {
    // This would integrate with the Order model
    // For now, return empty array as placeholder
    return [];
  }

  private async getCohortAverageCLV(cohortMonth: string): Promise<number> {
    // Calculate average CLV for cohort
    const cohortCalculations = await CLVCalculation.find({
      'cohortAnalysis.cohortId': cohortMonth
    });
    
    if (cohortCalculations.length === 0) return 0;
    
    return cohortCalculations.reduce((sum, calc) => sum + calc.historicalCLV.clv, 0) / cohortCalculations.length;
  }

  private async getAllCustomersAverageCLV(): Promise<number> {
    const allCalculations = await CLVCalculation.find({});
    if (allCalculations.length === 0) return 1000; // Default value
    
    return allCalculations.reduce((sum, calc) => sum + calc.historicalCLV.clv, 0) / allCalculations.length;
  }

  private async getSegmentAverageCLV(segmentName: string): Promise<number> {
    const segmentCalculations = await CLVCalculation.find({
      'segmentation.segment': segmentName
    });
    
    if (segmentCalculations.length === 0) return 0;
    
    return segmentCalculations.reduce((sum, calc) => sum + calc.historicalCLV.clv, 0) / segmentCalculations.length;
  }

  private calculateSegmentBreakdown(calculations: ICLVCalculation[]): Record<string, number> {
    const breakdown: Record<string, number> = {};
    
    calculations.forEach(calc => {
      const segment = calc.segmentation.segment;
      breakdown[segment] = (breakdown[segment] || 0) + calc.historicalCLV.clv;
    });

    return breakdown;
  }

  private async saveCLVCalculation(result: CLVResult, period: { startDate: Date; endDate: Date }) {
    const calculation = new CLVCalculation({
      customerId: result.customerId,
      calculationDate: new Date(),
      period,
      historicalCLV: result.historicalCLV,
      predictiveCLV: result.predictiveCLV,
      cohortAnalysis: result.cohortAnalysis,
      segmentation: result.segmentation,
      trends: result.trends
    });

    await calculation.save();
  }

  /**
   * Get CLV analytics for dashboard
   */
  async getCLVAnalytics(dateFrom?: Date, dateTo?: Date): Promise<{
    totalCustomers: number;
    averageCLV: number;
    topCLVCustomers: any[];
    clvDistribution: any;
    segmentPerformance: any;
    trends: any;
  }> {
    try {
      const query: any = {};
      if (dateFrom || dateTo) {
        query.calculationDate = {};
        if (dateFrom) query.calculationDate.$gte = dateFrom;
        if (dateTo) query.calculationDate.$lte = dateTo;
      }

      const calculations = await CLVCalculation.find(query);
      
      const totalCustomers = calculations.length;
      const averageCLV = totalCustomers > 0 ? 
        calculations.reduce((sum, calc) => sum + calc.historicalCLV.clv, 0) / totalCustomers : 0;

      const topCLVCustomers = calculations
        .sort((a, b) => b.historicalCLV.clv - a.historicalCLV.clv)
        .slice(0, 10)
        .map(calc => ({
          customerId: calc.customerId,
          clv: calc.historicalCLV.clv,
          revenue: calc.historicalCLV.totalRevenue,
          orders: calc.historicalCLV.totalOrders,
          segment: calc.segmentation.segment
        }));

      // CLV distribution
      const clvRanges = [
        { range: '0-100', min: 0, max: 100, count: 0 },
        { range: '100-500', min: 100, max: 500, count: 0 },
        { range: '500-1000', min: 500, max: 1000, count: 0 },
        { range: '1000-5000', min: 1000, max: 5000, count: 0 },
        { range: '5000+', min: 5000, max: Infinity, count: 0 }
      ];

      calculations.forEach(calc => {
        const clv = calc.historicalCLV.clv;
        const range = clvRanges.find(r => clv >= r.min && clv < r.max);
        if (range) range.count++;
      });

      // Segment performance
      const segmentPerformance: Record<string, any> = {};
      calculations.forEach(calc => {
        const segment = calc.segmentation.segment;
        if (!segmentPerformance[segment]) {
          segmentPerformance[segment] = {
            count: 0,
            totalCLV: 0,
            avgCLV: 0
          };
        }
        segmentPerformance[segment].count++;
        segmentPerformance[segment].totalCLV += calc.historicalCLV.clv;
      });

      Object.keys(segmentPerformance).forEach(segment => {
        segmentPerformance[segment].avgCLV = 
          segmentPerformance[segment].totalCLV / segmentPerformance[segment].count;
      });

      return {
        totalCustomers,
        averageCLV,
        topCLVCustomers,
        clvDistribution: clvRanges,
        segmentPerformance,
        trends: {} // Would calculate monthly trends
      };
    } catch (error) {
      throw new Error(`Failed to get CLV analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const customerAnalyticsService = new CustomerAnalyticsService();
export default customerAnalyticsService;
