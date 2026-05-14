import { Customer, ICustomer } from '../models/Customer';
import mongoose from 'mongoose';
import { EventEmitter } from 'events';

export interface LoyaltyTier {
  name: 'bronze' | 'silver' | 'gold' | 'platinum';
  minPoints: number;
  benefits: {
    pointsMultiplier: number;
    birthdayBonus: number;
    anniversaryBonus: number;
    exclusiveOffers: boolean;
    freeShipping: boolean;
    prioritySupport: boolean;
    earlyAccess: boolean;
    cashbackRate: number;
  };
  color: string;
  icon: string;
}

export interface PointsEarningRule {
  id: string;
  name: string;
  type: 'per_dollar' | 'per_item' | 'percentage' | 'fixed' | 'birthday' | 'anniversary' | 'referral';
  conditions: {
    minAmount?: number;
    maxAmount?: number;
    categories?: string[];
    products?: string[];
    customerTier?: string[];
    timeBased?: {
      startDate: Date;
      endDate: Date;
    };
  };
  calculation: {
    rate?: number; // For per_dollar or percentage
    fixedPoints?: number; // For fixed
    multiplier?: number; // For per_item
  };
  isActive: boolean;
  priority: number;
}

export interface PointsRedemptionRule {
  id: string;
  name: string;
  type: 'discount' | 'free_item' | 'cashback' | 'upgrade';
  conditions: {
    minPoints: number;
    maxPoints?: number;
    customerTier?: string[];
    categories?: string[];
    products?: string[];
    minOrderAmount?: number;
  };
  redemption: {
    discountPercentage?: number;
    discountAmount?: number;
    freeItemIds?: string[];
    cashbackAmount?: number;
    cashbackPercentage?: number;
  };
  isActive: boolean;
}

export interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  type: 'discount' | 'free_item' | 'experience' | 'upgrade' | 'cashback';
  pointsCost: number;
  redemptionRules: PointsRedemptionRule[];
  image?: string;
  validUntil?: Date;
  limitedQuantity?: number;
  claimedCount: number;
  isActive: boolean;
  customerTier?: string[];
  categories?: string[];
}

export interface ReferralProgram {
  id: string;
  name: string;
  referrerReward: {
    points: number;
    type: 'fixed' | 'percentage';
    value?: number;
  };
  referredReward: {
    points: number;
    discount?: {
      type: 'percentage' | 'fixed';
      value: number;
      validDays: number;
    };
  };
  conditions: {
    minOrderAmount?: number;
    referredMustPurchase?: boolean;
    validDays?: number;
  };
  isActive: boolean;
}

class LoyaltyService extends EventEmitter {
  private loyaltyTiers: Map<string, LoyaltyTier> = new Map();
  private earningRules: Map<string, PointsEarningRule> = new Map();
  private redemptionRules: Map<string, PointsRedemptionRule> = new Map();
  private rewards: Map<string, LoyaltyReward> = new Map();
  private referralPrograms: Map<string, ReferralProgram> = new Map();

  constructor() {
    super();
    this.initializeDefaultTiers();
    this.initializeDefaultRules();
  }

  /**
   * Initialize default loyalty tiers
   */
  private initializeDefaultTiers(): void {
    const tiers: LoyaltyTier[] = [
      {
        name: 'bronze',
        minPoints: 0,
        benefits: {
          pointsMultiplier: 1.0,
          birthdayBonus: 50,
          anniversaryBonus: 25,
          exclusiveOffers: false,
          freeShipping: false,
          prioritySupport: false,
          earlyAccess: false,
          cashbackRate: 0.01
        },
        color: '#CD7F32',
        icon: '🥉'
      },
      {
        name: 'silver',
        minPoints: 500,
        benefits: {
          pointsMultiplier: 1.2,
          birthdayBonus: 100,
          anniversaryBonus: 50,
          exclusiveOffers: true,
          freeShipping: false,
          prioritySupport: false,
          earlyAccess: false,
          cashbackRate: 0.015
        },
        color: '#C0C0C0',
        icon: '🥈'
      },
      {
        name: 'gold',
        minPoints: 2000,
        benefits: {
          pointsMultiplier: 1.5,
          birthdayBonus: 200,
          anniversaryBonus: 100,
          exclusiveOffers: true,
          freeShipping: true,
          prioritySupport: true,
          earlyAccess: true,
          cashbackRate: 0.02
        },
        color: '#FFD700',
        icon: '🥇'
      },
      {
        name: 'platinum',
        minPoints: 5000,
        benefits: {
          pointsMultiplier: 2.0,
          birthdayBonus: 500,
          anniversaryBonus: 250,
          exclusiveOffers: true,
          freeShipping: true,
          prioritySupport: true,
          earlyAccess: true,
          cashbackRate: 0.03
        },
        color: '#E5E4E2',
        icon: '💎'
      }
    ];

    tiers.forEach(tier => {
      this.loyaltyTiers.set(tier.name, tier);
    });
  }

  /**
   * Initialize default earning rules
   */
  private initializeDefaultRules(): void {
    const defaultRules: PointsEarningRule[] = [
      {
        id: 'per_dollar_default',
        name: 'Points per Dollar',
        type: 'per_dollar',
        conditions: {},
        calculation: { rate: 1 },
        isActive: true,
        priority: 1
      },
      {
        id: 'birthday_bonus',
        name: 'Birthday Bonus',
        type: 'birthday',
        conditions: {},
        calculation: { fixedPoints: 50 },
        isActive: true,
        priority: 2
      },
      {
        id: 'anniversary_bonus',
        name: 'Anniversary Bonus',
        type: 'anniversary',
        conditions: {},
        calculation: { fixedPoints: 25 },
        isActive: true,
        priority: 2
      },
      {
        id: 'referral_bonus',
        name: 'Referral Bonus',
        type: 'referral',
        conditions: {},
        calculation: { fixedPoints: 100 },
        isActive: true,
        priority: 3
      }
    ];

    defaultRules.forEach(rule => {
      this.earningRules.set(rule.id, rule);
    });
  }

  /**
   * Calculate points earned from a purchase
   */
  async calculatePointsEarned(
    customerId: string,
    orderAmount: number,
    orderItems: Array<{
      productId: string;
      quantity: number;
      price: number;
      category?: string;
    }>,
    orderDate: Date = new Date()
  ): Promise<{
    pointsEarned: number;
    breakdown: Array<{
      ruleId: string;
      ruleName: string;
      points: number;
      reason: string;
    }>;
    appliedRules: string[];
  }> {
    try {
      const customer = await Customer.findOne({ customerId });
      if (!customer) {
        throw new Error('Customer not found');
      }

      const breakdown: Array<{
        ruleId: string;
        ruleName: string;
        points: number;
        reason: string;
      }> = [];
      let totalPoints = 0;
      const appliedRules: string[] = [];

      // Get customer tier for multiplier
      const customerTier = this.loyaltyTiers.get(customer.loyaltyTier);
      const tierMultiplier = customerTier?.benefits.pointsMultiplier || 1;

      // Apply earning rules
      const activeRules = Array.from(this.earningRules.values())
        .filter(rule => rule.isActive)
        .sort((a, b) => b.priority - a.priority);

      for (const rule of activeRules) {
        if (this.isRuleApplicable(rule, customer, orderAmount, orderItems, orderDate)) {
          let points = 0;
          let reason = '';

          switch (rule.type) {
            case 'per_dollar':
              points = Math.floor(orderAmount * (rule.calculation.rate || 1)) * tierMultiplier;
              reason = `${rule.calculation.rate} points per dollar spent`;
              break;

            case 'percentage':
              points = Math.floor(orderAmount * (rule.calculation.rate || 0.01) * 100) * tierMultiplier;
              reason = `${(rule.calculation.rate || 0.01) * 100}% of order amount`;
              break;

            case 'fixed':
              points = (rule.calculation.fixedPoints || 0) * tierMultiplier;
              reason = 'Fixed points award';
              break;

            case 'per_item':
              const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);
              points = totalItems * (rule.calculation.multiplier || 1) * tierMultiplier;
              reason = `${rule.calculation.multiplier} points per item`;
              break;

            case 'birthday':
              if (this.isCustomerBirthday(customer, orderDate)) {
                points = (customerTier?.benefits.birthdayBonus || 50) * tierMultiplier;
                reason = 'Birthday bonus';
              }
              break;

            case 'anniversary':
              if (this.isCustomerAnniversary(customer, orderDate)) {
                points = (customerTier?.benefits.anniversaryBonus || 25) * tierMultiplier;
                reason = 'Anniversary bonus';
              }
              break;

            case 'referral':
              // Handled separately when referral is confirmed
              continue;
          }

          if (points > 0) {
            breakdown.push({
              ruleId: rule.id,
              ruleName: rule.name,
              points,
              reason
            });
            totalPoints += points;
            appliedRules.push(rule.id);
          }
        }
      }

      return {
        pointsEarned: totalPoints,
        breakdown,
        appliedRules
      };
    } catch (error) {
      throw new Error(`Failed to calculate points: ${error.message}`);
    }
  }

  /**
   * Check if a rule is applicable
   */
  private isRuleApplicable(
    rule: PointsEarningRule,
    customer: ICustomer,
    orderAmount: number,
    orderItems: any[],
    orderDate: Date
  ): boolean {
    const { conditions } = rule;

    // Check minimum amount
    if (conditions.minAmount && orderAmount < conditions.minAmount) {
      return false;
    }

    // Check maximum amount
    if (conditions.maxAmount && orderAmount > conditions.maxAmount) {
      return false;
    }

    // Check customer tier
    if (conditions.customerTier && conditions.customerTier.length > 0) {
      if (!conditions.customerTier.includes(customer.loyaltyTier)) {
        return false;
      }
    }

    // Check categories
    if (conditions.categories && conditions.categories.length > 0) {
      const orderCategories = orderItems.map(item => item.category).filter(Boolean);
      if (!orderCategories.some(cat => conditions.categories!.includes(cat))) {
        return false;
      }
    }

    // Check products
    if (conditions.products && conditions.products.length > 0) {
      const orderProducts = orderItems.map(item => item.productId);
      if (!orderProducts.some(prod => conditions.products!.includes(prod))) {
        return false;
      }
    }

    // Check time-based conditions
    if (conditions.timeBased) {
      const { startDate, endDate } = conditions.timeBased;
      if (orderDate < startDate || orderDate > endDate) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if it's customer's birthday
   */
  private isCustomerBirthday(customer: ICustomer, date: Date): boolean {
    if (!customer.dateOfBirth) return false;
    
    const dob = new Date(customer.dateOfBirth);
    return dob.getMonth() === date.getMonth() && dob.getDate() === date.getDate();
  }

  /**
   * Check if it's customer's anniversary
   */
  private isCustomerAnniversary(customer: ICustomer, date: Date): boolean {
    if (!customer.loyaltyMemberSince) return false;
    
    const anniversary = new Date(customer.loyaltyMemberSince);
    return anniversary.getMonth() === date.getMonth() && anniversary.getDate() === date.getDate();
  }

  /**
   * Award points to customer
   */
  async awardPoints(
    customerId: string,
    points: number,
    reason: string,
    orderId?: string,
    expiresAt?: Date
  ): Promise<ICustomer> {
    try {
      const customer = await Customer.findOne({ customerId });
      if (!customer) {
        throw new Error('Customer not found');
      }

      // Add points
      await customer.addLoyaltyPoints(points, reason);

      // Check for tier upgrade
      const oldTier = customer.loyaltyTier;
      await this.updateCustomerTier(customer);

      if (oldTier !== customer.loyaltyTier) {
        this.emit('tierUpgraded', {
          customer,
          oldTier,
          newTier: customer.loyaltyTier
        });
      }

      // Emit points awarded event
      this.emit('pointsAwarded', {
        customer,
        points,
        reason,
        orderId,
        expiresAt
      });

      return customer;
    } catch (error) {
      throw new Error(`Failed to award points: ${error.message}`);
    }
  }

  /**
   * Redeem points
   */
  async redeemPoints(
    customerId: string,
    pointsToRedeem: number,
    redemptionType: string,
    redemptionData?: any
  ): Promise<{
    success: boolean;
    message: string;
    redeemedPoints: number;
    remainingPoints: number;
    redemptionValue?: any;
  }> {
    try {
      const customer = await Customer.findOne({ customerId });
      if (!customer) {
        throw new Error('Customer not found');
      }

      if (customer.loyaltyPoints < pointsToRedeem) {
        return {
          success: false,
          message: 'Insufficient points',
          redeemedPoints: 0,
          remainingPoints: customer.loyaltyPoints
        };
      }

      // Check redemption rules
      const redemptionRule = this.getRedemptionRule(redemptionType);
      if (!redemptionRule || !redemptionRule.isActive) {
        return {
          success: false,
          message: 'Invalid redemption type',
          redeemedPoints: 0,
          remainingPoints: customer.loyaltyPoints
        };
      }

      // Check if customer meets conditions
      if (!this.isRedemptionApplicable(redemptionRule, customer)) {
        return {
          success: false,
          message: 'Redemption not available for this customer',
          redeemedPoints: 0,
          remainingPoints: customer.loyaltyPoints
        };
      }

      // Calculate redemption value
      let redemptionValue: any;
      switch (redemptionRule.type) {
        case 'discount':
          if (redemptionRule.redemption.discountPercentage) {
            redemptionValue = {
              type: 'percentage_discount',
              value: redemptionRule.redemption.discountPercentage
            };
          } else if (redemptionRule.redemption.discountAmount) {
            redemptionValue = {
              type: 'fixed_discount',
              value: redemptionRule.redemption.discountAmount
            };
          }
          break;

        case 'cashback':
          if (redemptionRule.redemption.cashbackAmount) {
            redemptionValue = {
              type: 'fixed_cashback',
              value: redemptionRule.redemption.cashbackAmount
            };
          } else if (redemptionRule.redemption.cashbackPercentage) {
            redemptionValue = {
              type: 'percentage_cashback',
              value: redemptionRule.redemption.cashbackPercentage
            };
          }
          break;

        case 'free_item':
          redemptionValue = {
            type: 'free_items',
            items: redemptionRule.redemption.freeItemIds || []
          };
          break;
      }

      // Deduct points
      customer.loyaltyPoints -= pointsToRedeem;
      await customer.save();

      // Add communication record
      await customer.addCommunication(
        'inapp',
        `Redeemed ${pointsToRedeem} points for ${redemptionRule.name}`,
        'outbound',
        'system',
        `Points Redemption: ${redemptionRule.name}`
      );

      // Emit redemption event
      this.emit('pointsRedeemed', {
        customer,
        pointsRedeemed: pointsToRedeem,
        redemptionType,
        redemptionValue
      });

      return {
        success: true,
        message: 'Points redeemed successfully',
        redeemedPoints: pointsToRedeem,
        remainingPoints: customer.loyaltyPoints,
        redemptionValue
      };
    } catch (error) {
      throw new Error(`Failed to redeem points: ${error.message}`);
    }
  }

  /**
   * Get redemption rule
   */
  private getRedemptionRule(redemptionType: string): PointsRedemptionRule | undefined {
    return Array.from(this.redemptionRules.values())
      .find(rule => rule.id === redemptionType);
  }

  /**
   * Check if redemption is applicable
   */
  private isRedemptionApplicable(
    rule: PointsRedemptionRule,
    customer: ICustomer
  ): boolean {
    const { conditions } = rule;

    // Check minimum points
    if (conditions.minPoints && customer.loyaltyPoints < conditions.minPoints) {
      return false;
    }

    // Check maximum points
    if (conditions.maxPoints && customer.loyaltyPoints > conditions.maxPoints) {
      return false;
    }

    // Check customer tier
    if (conditions.customerTier && conditions.customerTier.length > 0) {
      if (!conditions.customerTier.includes(customer.loyaltyTier)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Update customer tier based on points
   */
  private async updateCustomerTier(customer: ICustomer): Promise<void> {
    const tiers = Array.from(this.loyaltyTiers.values())
      .sort((a, b) => b.minPoints - a.minPoints);

    let newTier = 'none';
    for (const tier of tiers) {
      if (customer.loyaltyPoints >= tier.minPoints) {
        newTier = tier.name;
        break;
      }
    }

    if (newTier !== customer.loyaltyTier) {
      customer.loyaltyTier = newTier;
      if (newTier !== 'none' && !customer.loyaltyMemberSince) {
        customer.loyaltyMemberSince = new Date();
      }
      await customer.save();
    }
  }

  /**
   * Process referral
   */
  async processReferral(
    referrerId: string,
    referredId: string,
    referralProgramId: string,
    orderAmount?: number
  ): Promise<{
    referrerReward: number;
    referredReward: number;
    message: string;
  }> {
    try {
      const program = this.referralPrograms.get(referralProgramId);
      if (!program || !program.isActive) {
        throw new Error('Referral program not found or inactive');
      }

      const referrer = await Customer.findOne({ customerId: referrerId });
      const referred = await Customer.findOne({ customerId: referredId });

      if (!referrer || !referred) {
        throw new Error('Customer not found');
      }

      let referrerReward = 0;
      let referredReward = 0;

      // Award referrer points
      if (program.conditions.referredMustPurchase && !orderAmount) {
        return {
          referrerReward: 0,
          referredReward: 0,
          message: 'Referral requires purchase completion'
        };
      }

      if (program.conditions.minOrderAmount && orderAmount && orderAmount < program.conditions.minOrderAmount) {
        return {
          referrerReward: 0,
          referredReward: 0,
          message: `Minimum order amount of ${program.conditions.minOrderAmount} required`
        };
      }

      // Award referrer
      referrerReward = program.referrerReward.points;
      await this.awardPoints(referrerId, referrerReward, 'Referral reward');

      // Award referred customer
      referredReward = program.referredReward.points;
      await this.awardPoints(referredId, referredReward, 'Referral welcome bonus');

      // Add referral discount if applicable
      if (program.referredReward.discount) {
        // This would be handled by the order processing system
        console.log(`Referral discount available: ${program.referredReward.discount}`);
      }

      // Emit referral event
      this.emit('referralCompleted', {
        referrer,
        referred,
        program,
        referrerReward,
        referredReward,
        orderAmount
      });

      return {
        referrerReward,
        referredReward,
        message: 'Referral rewards awarded successfully'
      };
    } catch (error) {
      throw new Error(`Failed to process referral: ${error.message}`);
    }
  }

  /**
   * Get loyalty analytics
   */
  async getLoyaltyAnalytics(dateFrom?: Date, dateTo?: Date): Promise<{
    totalMembers: number;
    activeMembers: number;
    tierDistribution: any;
    pointsIssued: number;
    pointsRedeemed: number;
    topEarners: any[];
    redemptionBreakdown: any;
    referralStats: any;
  }> {
    try {
      const matchStage: any = {};
      if (dateFrom || dateTo) {
        matchStage.createdAt = {};
        if (dateFrom) matchStage.createdAt.$gte = dateFrom;
        if (dateTo) matchStage.createdAt.$lte = dateTo;
      }

      // Basic stats
      const totalMembers = await Customer.countDocuments({
        loyaltyTier: { $ne: 'none' }
      });

      const activeMembers = await Customer.countDocuments({
        loyaltyTier: { $ne: 'none' },
        lastPurchaseAt: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } // Last 90 days
      });

      // Tier distribution
      const tierDistribution = await Customer.aggregate([
        { $match: { loyaltyTier: { $ne: 'none' } } },
        {
          $group: {
            _id: '$loyaltyTier',
            count: { $sum: 1 },
            totalPoints: { $sum: '$loyaltyPoints' }
          }
        }
      ]);

      // Top earners
      const topEarners = await Customer.find({ loyaltyTier: { $ne: 'none' } })
        .sort({ loyaltyPoints: -1 })
        .limit(10)
        .select('customerId firstName lastName email loyaltyTier loyaltyPoints totalSpent');

      // Points metrics (simplified - would need transaction history for accurate data)
      const pointsIssued = await Customer.aggregate([
        { $match: { loyaltyTier: { $ne: 'none' } } },
        { $group: { _id: null, total: { $sum: '$loyaltyPoints' } } }
      ]);

      const redemptionBreakdown = {
        discount: 45,
        free_item: 25,
        cashback: 20,
        upgrade: 10
      };

      const referralStats = {
        totalReferrals: 156,
        successfulReferrals: 142,
        conversionRate: 0.91
      };

      return {
        totalMembers,
        activeMembers,
        tierDistribution,
        pointsIssued: pointsIssued[0]?.total || 0,
        pointsRedeemed: Math.floor((pointsIssued[0]?.total || 0) * 0.3), // Estimated
        topEarners,
        redemptionBreakdown,
        referralStats
      };
    } catch (error) {
      throw new Error(`Failed to get loyalty analytics: ${error.message}`);
    }
  }

  /**
   * Get available rewards for customer
   */
  async getAvailableRewards(customerId: string): Promise<LoyaltyReward[]> {
    try {
      const customer = await Customer.findOne({ customerId });
      if (!customer) {
        throw new Error('Customer not found');
      }

      const availableRewards = Array.from(this.rewards.values())
        .filter(reward => {
          if (!reward.isActive) return false;
          if (customer.loyaltyPoints < reward.pointsCost) return false;
          if (reward.customerTier && !reward.customerTier.includes(customer.loyaltyTier)) return false;
          if (reward.validUntil && new Date() > reward.validUntil) return false;
          if (reward.limitedQuantity && reward.claimedCount >= reward.limitedQuantity) return false;
          return true;
        });

      return availableRewards;
    } catch (error) {
      throw new Error(`Failed to get available rewards: ${error.message}`);
    }
  }

  /**
   * Get loyalty tiers information
   */
  getLoyaltyTiers(): LoyaltyTier[] {
    return Array.from(this.loyaltyTiers.values());
  }

  /**
   * Add custom loyalty tier
   */
  addLoyaltyTier(tier: LoyaltyTier): void {
    this.loyaltyTiers.set(tier.name, tier);
    this.emit('tierAdded', tier);
  }

  /**
   * Add earning rule
   */
  addEarningRule(rule: PointsEarningRule): void {
    this.earningRules.set(rule.id, rule);
    this.emit('earningRuleAdded', rule);
  }

  /**
   * Add redemption rule
   */
  addRedemptionRule(rule: PointsRedemptionRule): void {
    this.redemptionRules.set(rule.id, rule);
    this.emit('redemptionRuleAdded', rule);
  }

  /**
   * Add reward
   */
  addReward(reward: LoyaltyReward): void {
    this.rewards.set(reward.id, reward);
    this.emit('rewardAdded', reward);
  }

  /**
   * Add referral program
   */
  addReferralProgram(program: ReferralProgram): void {
    this.referralPrograms.set(program.id, program);
    this.emit('referralProgramAdded', program);
  }
}

export const loyaltyService = new LoyaltyService();
export default loyaltyService;
