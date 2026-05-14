import { Customer, ICustomer } from '../models/Customer';
import { CustomerSegment, ICustomerSegment } from '../models/CustomerAnalytics';
import { EventEmitter } from 'events';
import mongoose from 'mongoose';

export interface SegmentRule {
  id: string;
  name: string;
  description: string;
  type: 'demographic' | 'behavioral' | 'psychographic' | 'rfm' | 'custom';
  conditions: Array<{
    field: string;
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'between';
    value: any;
    weight?: number;
  }>;
  isActive: boolean;
  priority: number;
  createdAt: Date;
  updatedBy: string;
}

export interface SegmentCharacteristics {
  demographics?: {
    ageRange: string;
    gender?: string;
    location: string;
    incomeLevel?: string;
    familySize?: number;
    education?: string;
  };
  behavioral?: {
    purchaseFrequency: string;
    avgOrderValue: string;
    preferredCategories: string[];
    shoppingTimePreference: string;
    devicePreference: string;
    brandLoyalty: string;
    priceSensitivity: string;
  };
  psychographic?: {
    lifestyle: string[];
    interests: string[];
    values: string[];
    personalityTraits: string[];
    motivations: string[];
    communicationStyle: string;
  };
  rfm?: {
    recencyScore: number;
    frequencyScore: number;
    monetaryScore: number;
    rfmSegment: string;
    tier: 'platinum' | 'gold' | 'silver' | 'bronze' | 'basic';
  };
  custom?: Record<string, any>;
}

export interface SegmentMetrics {
  segmentId: string;
  segmentName: string;
  customerCount: number;
  percentageOfTotal: number;
  averageCLV: number;
  averageOrderValue: number;
  purchaseFrequency: number;
  retentionRate: number;
  churnRate: number;
  satisfactionScore: number;
  engagementScore: number;
  revenueContribution: number;
  growthRate: number;
  profitability: number;
  lifetimeValue: number;
}

export interface SegmentationResult {
  customerId: string;
  segmentId: string;
  segmentName: string;
  segmentType: 'demographic' | 'behavioral' | 'psychographic' | 'rfm' | 'custom';
  confidenceScore: number;
  characteristics: SegmentCharacteristics;
  previousSegment?: string;
  changeReason: string;
  assignmentDate: Date;
}

class CustomerSegmentationService extends EventEmitter {
  private segmentRules: Map<string, SegmentRule> = new Map();
  private rfmThresholds = {
    recency: { high: 30, medium: 90 }, // days
    frequency: { high: 10, medium: 5 }, // orders per year
    monetary: { high: 1000, medium: 500 } // average order value
  };

  constructor() {
    super();
    this.initializeDefaultSegments();
  }

  /**
   * Initialize default segmentation rules
   */
  private initializeDefaultSegments(): void {
    const defaultRules: SegmentRule[] = [
      // RFM Segments
      {
        id: 'rfm_champions',
        name: 'Champions',
        description: 'Best customers - recent, frequent, high spenders',
        type: 'rfm',
        conditions: [
          { field: 'recencyScore', operator: 'greater_than', value: 0.8, weight: 0.4 },
          { field: 'frequencyScore', operator: 'greater_than', value: 0.8, weight: 0.3 },
          { field: 'monetaryScore', operator: 'greater_than', value: 0.8, weight: 0.3 }
        ],
        isActive: true,
        priority: 1,
        createdAt: new Date(),
        updatedBy: 'system'
      },
      {
        id: 'rfm_loyal_customers',
        name: 'Loyal Customers',
        description: 'Good frequency and monetary value, but not recent',
        type: 'rfm',
        conditions: [
          { field: 'recencyScore', operator: 'between', value: [0.4, 0.8], weight: 0.2 },
          { field: 'frequencyScore', operator: 'greater_than', value: 0.7, weight: 0.4 },
          { field: 'monetaryScore', operator: 'greater_than', value: 0.6, weight: 0.4 }
        ],
        isActive: true,
        priority: 2,
        createdAt: new Date(),
        updatedBy: 'system'
      },
      {
        id: 'rfm_at_risk',
        name: 'At Risk',
        description: 'Previously good customers but haven\'t purchased recently',
        type: 'rfm',
        conditions: [
          { field: 'recencyScore', operator: 'less_than', value: 0.3, weight: 0.5 },
          { field: 'frequencyScore', operator: 'greater_than', value: 0.5, weight: 0.3 },
          { field: 'monetaryScore', operator: 'greater_than', value: 0.4, weight: 0.2 }
        ],
        isActive: true,
        priority: 3,
        createdAt: new Date(),
        updatedBy: 'system'
      },
      {
        id: 'rfm_new_customers',
        name: 'New Customers',
        description: 'Recently acquired customers',
        type: 'rfm',
        conditions: [
          { field: 'customerAge', operator: 'less_than', value: 90, weight: 0.6 }, // days
          { field: 'orderCount', operator: 'between', value: [1, 3], weight: 0.4 }
        ],
        isActive: true,
        priority: 4,
        createdAt: new Date(),
        updatedBy: 'system'
      },

      // Behavioral Segments
      {
        id: 'beh_high_value',
        name: 'High Value Shoppers',
        description: 'Customers with high average order values',
        type: 'behavioral',
        conditions: [
          { field: 'avgOrderValue', operator: 'greater_than', value: 500, weight: 0.5 },
          { field: 'purchaseFrequency', operator: 'greater_than', value: 0.3, weight: 0.3 },
          { field: 'categoryDiversity', operator: 'greater_than', value: 3, weight: 0.2 }
        ],
        isActive: true,
        priority: 5,
        createdAt: new Date(),
        updatedBy: 'system'
      },
      {
        id: 'beh_frequent_buyers',
        name: 'Frequent Buyers',
        description: 'Customers who purchase regularly',
        type: 'behavioral',
        conditions: [
          { field: 'purchaseFrequency', operator: 'greater_than', value: 0.5, weight: 0.6 },
          { field: 'avgOrderValue', operator: 'greater_than', value: 50, weight: 0.4 }
        ],
        isActive: true,
        priority: 6,
        createdAt: new Date(),
        updatedBy: 'system'
      },
      {
        id: 'beh_bargain_hunters',
        name: 'Bargain Hunters',
        description: 'Customers who primarily buy discounted items',
        type: 'behavioral',
        conditions: [
          { field: 'discountUsage', operator: 'greater_than', value: 0.7, weight: 0.5 },
          { field: 'priceSensitivity', operator: 'equals', value: 'high', weight: 0.3 },
          { field: 'avgOrderValue', operator: 'less_than', value: 100, weight: 0.2 }
        ],
        isActive: true,
        priority: 7,
        createdAt: new Date(),
        updatedBy: 'system'
      },

      // Demographic Segments
      {
        id: 'dem_young_professionals',
        name: 'Young Professionals',
        description: 'Young adults in professional careers',
        type: 'demographic',
        conditions: [
          { field: 'age', operator: 'between', value: [25, 35], weight: 0.4 },
          { field: 'incomeLevel', operator: 'in', value: ['medium', 'high'], weight: 0.3 },
          { field: 'location', operator: 'contains', value: 'urban', weight: 0.3 }
        ],
        isActive: true,
        priority: 8,
        createdAt: new Date(),
        updatedBy: 'system'
      },
      {
        id: 'dem_families',
        name: 'Families',
        description: 'Customers with children',
        type: 'demographic',
        conditions: [
          { field: 'familySize', operator: 'greater_than', value: 2, weight: 0.5 },
          { field: 'age', operator: 'between', value: [30, 50], weight: 0.3 },
          { field: 'preferredCategories', operator: 'contains', value: 'family', weight: 0.2 }
        ],
        isActive: true,
        priority: 9,
        createdAt: new Date(),
        updatedBy: 'system'
      }
    ];

    defaultRules.forEach(rule => {
      this.segmentRules.set(rule.id, rule);
    });
  }

  /**
   * Segment a customer based on all rules
   */
  async segmentCustomer(customerId: string, forceReSegment: boolean = false): Promise<SegmentationResult> {
    try {
      const customer = await Customer.findOne({ customerId, isDeleted: false });
      if (!customer) {
        throw new Error('Customer not found');
      }

      // Check if customer is already segmented and not forcing re-segmentation
      if (!forceReSegment) {
        const existingSegment = await CustomerSegment.findOne({ 
          customerId, 
          isActive: true 
        }).sort({ assignmentDate: -1 });

        if (existingSegment && 
            existingSegment.assignmentDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
          // Return existing segment if it's less than 7 days old
          return this.formatSegmentationResult(existingSegment);
        }
      }

      // Calculate customer features
      const customerFeatures = await this.calculateCustomerFeatures(customerId);
      
      // Evaluate against all segment rules
      const segmentScores = await this.evaluateSegmentRules(customerFeatures);
      
      // Select best segment
      const bestSegment = this.selectBestSegment(segmentScores);
      
      // Calculate segment characteristics
      const characteristics = await this.calculateSegmentCharacteristics(customerId, bestSegment.type);
      
      // Get previous segment for change tracking
      const previousSegment = await CustomerSegment.findOne({ 
        customerId, 
        isActive: true 
      }).sort({ assignmentDate: -1 });

      // Determine change reason
      const changeReason = this.determineChangeReason(
        previousSegment?.segmentName, 
        bestSegment.name, 
        customerFeatures
      );

      // Create segmentation result
      const result: SegmentationResult = {
        customerId,
        segmentId: bestSegment.id,
        segmentName: bestSegment.name,
        segmentType: bestSegment.type as 'demographic' | 'behavioral' | 'psychographic' | 'rfm' | 'custom',
        confidenceScore: bestSegment.score,
        characteristics,
        previousSegment: previousSegment?.segmentName,
        changeReason,
        assignmentDate: new Date()
      };

      // Save segmentation to database
      await this.saveCustomerSegmentation(result, previousSegment);

      // Emit events
      this.emit('customerSegmented', result);
      
      if (previousSegment && previousSegment.segmentName !== bestSegment.name) {
        this.emit('segmentChanged', {
          customerId,
          previousSegment: previousSegment.segmentName,
          newSegment: bestSegment.name,
          changeReason
        });
      }

      return result;
    } catch (error) {
      throw new Error(`Failed to segment customer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate customer features for segmentation
   */
  private async calculateCustomerFeatures(customerId: string): Promise<Record<string, any>> {
    const customer = await Customer.findOne({ customerId, isDeleted: false });
    if (!customer) {
      throw new Error('Customer not found');
    }

    // Get customer's order history
    const orders = await this.getCustomerOrders(customerId);
    
    // Calculate RFM scores
    const rfmScores = await this.calculateRFMScores(customerId);
    
    // Calculate behavioral features
    const behavioralFeatures = await this.calculateBehavioralFeatures(customerId, orders);
    
    // Calculate demographic features
    const demographicFeatures = this.calculateDemographicFeatures(customer);
    
    // Calculate psychographic features
    const psychographicFeatures = await this.calculatePsychographicFeatures(customerId);

    return {
      customerId,
      recencyScore: rfmScores.recency,
      frequencyScore: rfmScores.frequency,
      monetaryScore: rfmScores.monetary,
      customerAge: (Date.now() - new Date(customer.createdAt).getTime()) / (1000 * 60 * 60 * 24),
      orderCount: orders.length,
      ...behavioralFeatures,
      ...demographicFeatures,
      ...psychographicFeatures
    };
  }

  /**
   * Evaluate customer against all segment rules
   */
  private async evaluateSegmentRules(features: Record<string, any>): Promise<Array<{
    rule: SegmentRule;
    score: number;
    matchedConditions: number;
  }>> {
    const results = [];

    for (const rule of this.segmentRules.values()) {
      if (!rule.isActive) continue;

      let totalScore = 0;
      let matchedConditions = 0;
      let totalWeight = 0;

      for (const condition of rule.conditions) {
        const conditionMet = this.evaluateCondition(features, condition);
        const weight = condition.weight || 1;

        if (conditionMet) {
          totalScore += weight;
          matchedConditions++;
        }
        totalWeight += weight;
      }

      const score = totalWeight > 0 ? totalScore / totalWeight : 0;

      results.push({
        rule,
        score,
        matchedConditions
      });
    }

    return results.sort((a, b) => {
      // Sort by score first, then by priority
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.rule.priority - b.rule.priority;
    });
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(features: Record<string, any>, condition: {
    field: string;
    operator: string;
    value: any;
  }): boolean {
    const fieldValue = features[condition.field];

    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      
      case 'not_equals':
        return fieldValue !== condition.value;
      
      case 'greater_than':
        return Number(fieldValue) > Number(condition.value);
      
      case 'less_than':
        return Number(fieldValue) < Number(condition.value);
      
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
      
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(fieldValue);
      
      case 'between':
        return Array.isArray(condition.value) && 
               Number(fieldValue) >= Number(condition.value[0]) && 
               Number(fieldValue) <= Number(condition.value[1]);
      
      default:
        return false;
    }
  }

  /**
   * Select the best segment for the customer
   */
  private selectBestSegment(segmentScores: Array<{
    rule: SegmentRule;
    score: number;
    matchedConditions: number;
  }>): { rule: SegmentRule; score: number; type: string; name: string; id: string } {
    if (segmentScores.length === 0) {
      // Return default segment if no rules match
      return {
        rule: {
          id: 'default',
          name: 'Standard',
          description: 'Default segment for unsegmented customers',
          type: 'custom',
          conditions: [],
          isActive: true,
          priority: 999,
          createdAt: new Date(),
          updatedBy: 'system'
        },
        score: 0.5,
        type: 'custom',
        name: 'Standard',
        id: 'default'
      };
    }

    // Return the highest scoring segment
    const bestSegment = segmentScores[0];
    return {
      rule: bestSegment.rule,
      score: bestSegment.score,
      type: bestSegment.rule.type,
      name: bestSegment.rule.name,
      id: bestSegment.rule.id
    };
  }

  /**
   * Calculate segment characteristics
   */
  private async calculateSegmentCharacteristics(
    customerId: string, 
    segmentType: string
  ): Promise<SegmentCharacteristics> {
    const customer = await Customer.findOne({ customerId, isDeleted: false });
    if (!customer) {

/**
 * Calculate RFM characteristics
 */
private async calculateRFMCharacteristics(customerId: string) {
  const rfmScores = await this.calculateRFMScores(customerId);
  
  let rfmSegment = 'Lost';
  let tier: 'platinum' | 'gold' | 'silver' | 'bronze' | 'basic' = 'basic';

  if (rfmScores.recency >= 0.8 && rfmScores.frequency >= 0.8 && rfmScores.monetary >= 0.8) {
    rfmSegment = 'Champions';
    tier = 'platinum';
  } else if (rfmScores.recency >= 0.6 && rfmScores.frequency >= 0.6 && rfmScores.monetary >= 0.6) {
    rfmSegment = 'Loyal Customers';
    tier = 'gold';
  } else if (rfmScores.recency >= 0.4 && rfmScores.frequency >= 0.4) {
    rfmSegment = 'Potential Loyalist';
    tier = 'silver';
  } else if (rfmScores.recency >= 0.2) {
    rfmSegment = 'New Customers';
    tier = 'bronze';
  } else {
    rfmSegment = 'At Risk';
    tier = 'basic';
  }

  return {
    recencyScore: rfmScores.recency,
    frequencyScore: rfmScores.frequency,
    monetaryScore: rfmScores.monetary,
    rfmSegment,
    tier
  };
}
   * Calculate RFM characteristics
   */
  private async calculateRFMCharacteristics(customerId: string) {
    const rfmScores = await this.calculateRFMScores(customerId);
    
    let rfmSegment = 'Lost';
    let tier: 'platinum' | 'gold' | 'silver' | 'bronze' | 'basic' = 'basic';

    if (rfmScores.recency >= 0.8 && rfmScores.frequency >= 0.8 && rfmScores.monetary >= 0.8) {
      rfmSegment = 'Champions';
      tier = 'platinum';
    } else if (rfmScores.recency >= 0.6 && rfmScores.frequency >= 0.6 && rfmScores.monetary >= 0.6) {
      rfmSegment = 'Loyal Customers';
      tier = 'gold';
    } else if (rfmScores.recency >= 0.4 && rfmScores.frequency >= 0.4) {
      rfmSegment = 'Potential Loyalist';
      tier = 'silver';
    } else if (rfmScores.recency >= 0.2) {
      rfmSegment = 'New Customers';
      tier = 'bronze';
    } else {
      rfmSegment = 'At Risk';
      tier = 'basic';
    }

    return {
      recencyScore: rfmScores.recency,
      frequencyScore: rfmScores.frequency,
      monetaryScore: rfmScores.monetary,
      rfmSegment,
      tier
    };
  }

  /**
   * Determine change reason
   */
  private determineChangeReason(
    previousSegment: string | undefined,
    newSegment: string,
    features: Record<string, any>
  ): string {
    if (!previousSegment) {
      return 'Initial segmentation';
    }

    if (previousSegment === newSegment) {
      return 'No change';
    }

    // Analyze what changed to cause the segment change
    const changes = [];

    if (features.recencyScore > 0.8 && !previousSegment.includes('Champion')) {
      changes.push('Increased purchase recency');
    }

    if (features.frequencyScore > 0.8 && !previousSegment.includes('Loyal')) {
      changes.push('Increased purchase frequency');
    }

    if (features.monetaryScore > 0.8 && !previousSegment.includes('High')) {
      changes.push('Increased average order value');
    }

    if (features.recencyScore < 0.3 && previousSegment.includes('Loyal')) {
      changes.push('Decreased purchase recency');
    }

    return changes.length > 0 ? changes.join(', ') : 'Behavioral pattern changed';
  }

  /**
   * Batch segment multiple customers
   */
  async batchSegmentCustomers(customerIds: string[]): Promise<SegmentationResult[]> {
    try {
      const results = await Promise.all(
        customerIds.map(customerId => this.segmentCustomer(customerId))
      );

      this.emit('batchSegmented', results);
      return results;
    } catch (error) {
      throw new Error(`Failed to batch segment customers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get segment metrics
   */
  async getSegmentMetrics(): Promise<SegmentMetrics[]> {
    try {
      const segments = await CustomerSegment.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$segmentName',
            customerCount: { $sum: 1 },
            segmentId: { $first: '$segmentId' },
            segmentType: { $first: '$segmentType' }
          }
        },
        { $sort: { customerCount: -1 } }
      ]);

      const totalCustomers = segments.reduce((sum, seg) => sum + seg.customerCount, 0);

      const metrics: SegmentMetrics[] = [];

      for (const segment of segments) {
        const segmentCustomers = await CustomerSegment.find({ 
          segmentName: segment._id, 
          isActive: true 
        }).populate('customerId');

        // Calculate metrics for this segment
        const segmentMetrics = await this.calculateSegmentMetrics(segment._id, segmentCustomers);
        
        metrics.push({
          segmentId: segment.segmentId,
          segmentName: segment._id,
          customerCount: segment.customerCount,
          percentageOfTotal: totalCustomers > 0 ? (segment.customerCount / totalCustomers) * 100 : 0,
          ...segmentMetrics
        });
      }

      return metrics;
    } catch (error) {
      throw new Error(`Failed to get segment metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create custom segment rule
   */
  async createCustomSegmentRule(rule: Omit<SegmentRule, 'id' | 'createdAt'>): Promise<SegmentRule> {
    const newRule: SegmentRule = {
      ...rule,
      id: new Date().getTime().toString(),
      createdAt: new Date()
    };

    this.segmentRules.set(newRule.id, newRule);
    this.emit('segmentRuleCreated', newRule);

    return newRule;
  }

  /**
   * Update segment rule
   */
  async updateSegmentRule(ruleId: string, updates: Partial<SegmentRule>): Promise<SegmentRule> {
    const existingRule = this.segmentRules.get(ruleId);
    if (!existingRule) {
      throw new Error('Segment rule not found');
    }

    const updatedRule = { ...existingRule, ...updates };
    this.segmentRules.set(ruleId, updatedRule);
    this.emit('segmentRuleUpdated', updatedRule);

    return updatedRule;
  }

  /**
   * Delete segment rule
   */
  async deleteSegmentRule(ruleId: string): Promise<void> {
    const rule = this.segmentRules.get(ruleId);
    if (!rule) {
      throw new Error('Segment rule not found');
    }

    this.segmentRules.delete(ruleId);
    this.emit('segmentRuleDeleted', rule);
  }

  /**
   * Get all segment rules
   */
  getSegmentRules(): SegmentRule[] {
    return Array.from(this.segmentRules.values());
  }

  /**
   * Helper methods
   */
  private async calculateRFMScores(customerId: string) {
    // This would integrate with the customer analytics service
    // For now, return default values
    return {
      recency: 0.5,
      frequency: 0.5,
      monetary: 0.5
    };
  }

  private async calculateBehavioralFeatures(customerId: string, orders: any[]) {
    const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const avgOrderValue = orders.length > 0 ? totalSpent / orders.length : 0;
    
    const customerAge = await this.getCustomerAge(customerId);
    const purchaseFrequency = customerAge > 0 ? (orders.length / customerAge) * 30 : 0; // orders per month

    return {
      avgOrderValue: avgOrderValue.toString(),
      purchaseFrequency: purchaseFrequency > 1 ? 'high' : purchaseFrequency > 0.5 ? 'medium' : 'low',
      discountUsage: 0.3, // Placeholder
      priceSensitivity: 'medium',
      categoryDiversity: 3, // Placeholder
      devicePreference: 'web',
      brandLoyalty: 'medium',
      preferredCategories: ['general'], // Placeholder
      shoppingTimePreference: 'afternoon'
    };
  }

  private calculateDemographicFeatures(customer: ICustomer) {
    return {
      ageRange: `${(customer.demographics as any)?.age || 25}-${((customer.demographics as any)?.age || 25) + 10}`,
      gender: (customer.demographics as any)?.gender,
      location: customer.addresses[0]?.city || 'Unknown',
      incomeLevel: (customer.demographics as any)?.incomeLevel || 'medium',
      familySize: (customer.demographics as any)?.familySize || 1,
      education: (customer.demographics as any)?.education
    };
  }

  private async calculatePsychographicFeatures(customer: ICustomer) {
    return {
      lifestyle: ['modern'], // Placeholder
      interests: [], // Would analyze from purchase history
      values: ['quality'], // Placeholder
      personalityTraits: [], // Would analyze from behavior
      motivations: [], // Placeholder
      communicationStyle: 'digital'
    };
  }

  private async getCustomerOrders(customerId: string) {
    // This would integrate with the Order model
    // For now, return empty array as placeholder
    return [];
  }

  private async getCustomerAge(customerId: string): Promise<number> {
    const customer = await Customer.findOne({ customerId, isDeleted: false });
    if (!customer) return 0;
    
    return (Date.now() - new Date(customer.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  }

  private formatSegmentationResult(segment: ICustomerSegment): SegmentationResult {
    return {
      customerId: segment.customerId,
      segmentId: segment.segmentId,
      segmentName: segment.segmentName,
      segmentType: segment.segmentType,
      confidenceScore: segment.confidenceScore,
      characteristics: segment.characteristics,
      previousSegment: segment.segmentHistory[0]?.previousSegment,
      changeReason: segment.segmentHistory[0]?.changeReason || 'Initial segmentation',
      assignmentDate: segment.assignmentDate
    };
  }

  private async saveCustomerSegmentation(
    result: SegmentationResult, 
    previousSegment: ICustomerSegment | null
  ): Promise<void> {
    // Deactivate previous segment
    if (previousSegment) {
      previousSegment.isActive = false;
      await previousSegment.save();
    }

    // Create new segment record
    const segment = new CustomerSegment({
      customerId: result.customerId,
      segmentId: result.segmentId,
      segmentName: result.segmentName,
      segmentType: result.segmentType,
      assignmentDate: result.assignmentDate,
      confidenceScore: result.confidenceScore,
      characteristics: result.characteristics,
      segmentHistory: previousSegment ? [{
        previousSegment: previousSegment.segmentName,
        changeDate: new Date(),
        changeReason: result.changeReason
      }] : [],
      isActive: true,
      lastUpdated: new Date()
    });

    await segment.save();
  }

  private async calculateSegmentMetrics(segmentName: string, segmentCustomers: any[]) {
    // This would calculate actual metrics from customer data
    // For now, return placeholder values
    return {
      averageCLV: 1000,
      averageOrderValue: 100,
      purchaseFrequency: 2,
      retentionRate: 0.8,
      churnRate: 0.2,
      satisfactionScore: 4.0,
      engagementScore: 0.7,
      revenueContribution: 15.5,
      growthRate: 5.2,
      profitability: 0.25,
      lifetimeValue: 5000
    };
  }
}

export const customerSegmentationService = new CustomerSegmentationService();
export default customerSegmentationService;
