import { Expense, IExpense } from '../models/Expense';
import { User } from '../models/User';

export interface CorporateCard {
  cardId: string;
  cardNumber: string; // Masked (e.g., ****-****-****-1234)
  cardType: 'visa' | 'mastercard' | 'amex' | 'discover';
  cardBrand: string;
  cardholderName: string;
  
  // Card Details
  expirationDate: Date;
  cvv?: string; // Encrypted
  pin?: string; // Encrypted
  
  // Assignment
  employeeId: string;
  employeeName: string;
  department: string;
  costCenter?: string;
  
  // Limits and Controls
  limits: {
    dailyLimit: number;
    monthlyLimit: number;
    perTransactionLimit: number;
    internationalLimit?: number;
    cashAdvanceLimit: number;
    atmWithdrawalLimit: number;
  };
  
  // Restrictions
  restrictions: {
    merchantCategories: {
      allowed: string[];
      blocked: string[];
    };
    geographic: {
      allowedCountries: string[];
      blockedCountries: string[];
      requireLocation: boolean;
    };
    timeRestrictions: {
      allowedHours: {
        start: string; // HH:MM
        end: string;   // HH:MM
      };
      allowedDays: number[]; // 0-6 (Sunday-Saturday)
      blockedDates: Date[];
    };
    onlinePurchases: {
      allowed: boolean;
      requireVerification: boolean;
      maxAmount?: number;
    };
  };
  
  // Status
  status: 'active' | 'inactive' | 'suspended' | 'expired' | 'lost' | 'stolen' | 'blocked';
  isActive: boolean;
  
  // Physical Card
  physicalCard: {
    issued: boolean;
    issuedAt?: Date;
    shippedAt?: Date;
    deliveredAt?: Date;
    trackingNumber?: string;
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };
  
  // Digital Card
  digitalCard: {
    enabled: boolean;
    walletTokens: Array<{
      walletType: 'apple_pay' | 'google_pay' | 'samsung_pay';
      token: string;
      addedAt: Date;
      lastUsed?: Date;
      status: 'active' | 'inactive' | 'revoked';
    }>;
  };
  
  // Integration
  integration: {
    provider: 'stripe' | 'adyen' | 'braintree' | 'marqeta' | 'custom';
    providerCardId: string;
    lastSyncAt: Date;
    syncStatus: 'synced' | 'pending' | 'failed';
    webhookEndpoints: Array<{
      url: string;
      events: string[];
      secret: string;
      active: boolean;
    }>;
  };
  
  // Usage Statistics
  usage: {
    totalTransactions: number;
    totalAmount: number;
    currentMonthSpent: number;
    currentMonthTransactions: number;
    lastTransactionDate?: Date;
    averageTransactionAmount: number;
    topMerchantCategories: Array<{
      category: string;
      count: number;
      amount: number;
    }>;
  };
  
  // Alerts and Notifications
  alerts: {
    lowBalance: boolean;
    unusualActivity: boolean;
    declinedTransactions: boolean;
    nearLimit: boolean;
    notificationRecipients: string[];
  };
  
  // Audit Trail
  auditTrail: Array<{
    timestamp: Date;
    action: string;
    performedBy: string;
    details: string;
    ipAddress?: string;
    userAgent?: string;
  }>;
  
  // Metadata
  metadata: {
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
    lastReviewed?: Date;
    reviewedBy?: string;
    notes?: string;
  };
}

export interface CardTransaction {
  transactionId: string;
  cardId: string;
  providerTransactionId: string;
  
  // Transaction Details
  amount: number;
  currency: string;
  merchantName: string;
  merchantCategoryCode: string;
  merchantCategory: string;
  merchantLocation: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  
  // Transaction Information
  transactionDate: Date;
  settlementDate?: Date;
  authorizationCode: string;
  referenceNumber: string;
  
  // Status
  status: 'pending' | 'authorized' | 'settled' | 'declined' | 'voided' | 'refunded';
  declineReason?: string;
  
  // Expense Matching
  expenseId?: string;
  matchedAt?: Date;
  matchConfidence?: number;
  requiresReview: boolean;
  reviewedBy?: string;
  reviewedAt?: Date;
  
  // Receipt Information
  receiptRequired: boolean;
  receiptProvided: boolean;
  receiptAttachments: Array<{
    attachmentId: string;
    name: string;
    url: string;
    uploadedAt: Date;
  }>;
  
  // Additional Data
  additionalData: {
    interchangeRate?: number;
    processorFee?: number;
    cashback?: number;
    rewards?: number;
    installments?: {
      total: number;
      current: number;
    };
  };
  
  // Fraud Detection
  fraud: {
    riskScore: number; // 0-100
    riskFactors: Array<{
      factor: string;
      score: number;
      description: string;
    }>;
    flagged: boolean;
    reviewed: boolean;
    reviewedBy?: string;
    reviewedAt?: Date;
  };
  
  // Metadata
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    source: 'api' | 'webhook' | 'manual' | 'import';
  };
}

export interface CardIntegration {
  integrationId: string;
  name: string;
  provider: 'stripe' | 'adyen' | 'braintree' | 'marqeta' | 'custom';
  
  // Configuration
  configuration: {
    apiKey: string; // Encrypted
    apiSecret: string; // Encrypted
    webhookSecret: string; // Encrypted
    environment: 'sandbox' | 'production';
    baseUrl: string;
    version: string;
  };
  
  // Features
  features: {
    realTimeTransactions: boolean;
    virtualCards: boolean;
    physicalCards: boolean;
    cardControls: boolean;
    expenseMatching: boolean;
    receiptCapture: boolean;
    fraudDetection: boolean;
    reporting: boolean;
  };
  
  // Mapping
  mapping: {
    merchantCategories: Record<string, string>; // Provider to internal mapping
    transactionStatuses: Record<string, string>;
    declineReasons: Record<string, string>;
  };
  
  // Sync Configuration
  sync: {
    frequency: 'real_time' | 'hourly' | 'daily';
    lastSyncAt?: Date;
    syncStatus: 'active' | 'inactive' | 'error';
    errorCount: number;
    lastError?: {
      code: string;
      message: string;
      timestamp: Date;
    };
  };
  
  // Status
  status: 'active' | 'inactive' | 'error';
  
  // Statistics
  statistics: {
    totalCards: number;
    activeCards: number;
    totalTransactions: number;
    lastMonthTransactions: number;
    totalVolume: number;
    lastMonthVolume: number;
  };
  
  // Metadata
  metadata: {
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
  };
}

export interface CardAnalytics {
  period: {
    startDate: Date;
    endDate: Date;
  };
  
  // Overview
  overview: {
    totalCards: number;
    activeCards: number;
    totalTransactions: number;
    totalVolume: number;
    averageTransactionAmount: number;
    declinedTransactions: number;
    declineRate: number;
  };
  
  // Usage Analysis
  usageAnalysis: {
    transactionsByMonth: Array<{
      month: string;
      count: number;
      amount: number;
    }>;
    transactionsByCategory: Array<{
      category: string;
      count: number;
      amount: number;
      percentage: number;
    }>;
    topMerchants: Array<{
      merchantName: string;
      count: number;
      amount: number;
      category: string;
    }>;
    spendingByEmployee: Array<{
      employeeId: string;
      employeeName: string;
      department: string;
      amount: number;
      transactions: number;
    }>;
  };
  
  // Fraud Analysis
  fraudAnalysis: {
    totalFlagged: number;
    confirmedFraud: number;
    falsePositives: number;
    fraudRate: number;
    averageRiskScore: number;
    riskFactors: Array<{
      factor: string;
      count: number;
      percentage: number;
    }>;
    fraudByCategory: Array<{
      category: string;
      fraudCount: number;
      totalTransactions: number;
      fraudRate: number;
    }>;
  };
  
  // Control Effectiveness
  controlEffectiveness: {
    blockedTransactions: number;
    blockedAmount: number;
    controlViolations: Array<{
      control: string;
      violations: number;
      preventedAmount: number;
    }>;
    limitBreaches: Array<{
      limitType: string;
      breaches: number;
      attemptedAmount: number;
    }>;
  };
  
  // Integration Performance
  integrationPerformance: {
    syncSuccessRate: number;
    averageSyncTime: number;
    webhookLatency: number;
    errorRate: number;
    errorsByType: Array<{
      errorType: string;
      count: number;
      percentage: number;
    }>;
  };
  
  // Recommendations
  recommendations: Array<{
    type: 'limit_adjustment' | 'control_update' | 'fraud_rule' | 'process_improvement';
    priority: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    impact: string;
    affectedCards?: number;
    potentialSavings?: number;
  }>;
}

export class CorporateCardService {
  // Issue corporate card
  async issueCorporateCard(params: {
    employeeId: string;
    cardType: 'visa' | 'mastercard' | 'amex' | 'discover';
    cardBrand?: string;
    limits: {
      dailyLimit: number;
      monthlyLimit: number;
      perTransactionLimit: number;
      internationalLimit?: number;
      cashAdvanceLimit: number;
      atmWithdrawalLimit: number;
    };
    restrictions?: {
      merchantCategories?: {
        allowed?: string[];
        blocked?: string[];
      };
      geographic?: {
        allowedCountries?: string[];
        blockedCountries?: string[];
        requireLocation?: boolean;
      };
      timeRestrictions?: {
        allowedHours?: {
          start: string;
          end: string;
        };
        allowedDays?: number[];
        blockedDates?: Date[];
      };
      onlinePurchases?: {
        allowed?: boolean;
        requireVerification?: boolean;
        maxAmount?: number;
      };
    };
    physicalCard?: {
      shippingAddress: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
      };
    };
    digitalCard?: {
      enabled: boolean;
    };
    issuedBy: string;
  }): Promise<CorporateCard> {
    // Validate employee
    const employee = await User.findById(params.employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }
    
    // Check for existing active cards
    const existingCards = await this.getEmployeeCards(params.employeeId);
    const activeCards = existingCards.filter(card => card.isActive);
    if (activeCards.length > 0) {
      throw new Error('Employee already has an active corporate card');
    }
    
    const cardId = `CARD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const card: CorporateCard = {
      cardId,
      cardNumber: this.generateMaskedCardNumber(),
      cardType: params.cardType,
      cardBrand: params.cardBrand || params.cardType.toUpperCase(),
      cardholderName: `${employee.firstName} ${employee.lastName}`,
      
      expirationDate: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000), // 3 years
      
      employeeId: params.employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      department: employee.department || 'Unknown',
      costCenter: employee.costCenter,
      
      limits: params.limits,
      
      restrictions: {
        merchantCategories: {
          allowed: params.restrictions?.merchantCategories?.allowed || [],
          blocked: params.restrictions?.merchantCategories?.blocked || []
        },
        geographic: {
          allowedCountries: params.restrictions?.geographic?.allowedCountries || [],
          blockedCountries: params.restrictions?.geographic?.blockedCountries || [],
          requireLocation: params.restrictions?.geographic?.requireLocation || false
        },
        timeRestrictions: {
          allowedHours: params.restrictions?.timeRestrictions?.allowedHours || {
            start: '00:00',
            end: '23:59'
          },
          allowedDays: params.restrictions?.timeRestrictions?.allowedDays || [0, 1, 2, 3, 4, 5, 6],
          blockedDates: params.restrictions?.timeRestrictions?.blockedDates || []
        },
        onlinePurchases: {
          allowed: params.restrictions?.onlinePurchases?.allowed ?? true,
          requireVerification: params.restrictions?.onlinePurchases?.requireVerification ?? false,
          maxAmount: params.restrictions?.onlinePurchases?.maxAmount
        }
      },
      
      status: 'inactive',
      isActive: false,
      
      physicalCard: {
        issued: false,
        shippingAddress: params.physicalCard?.shippingAddress || {
          street: '',
          city: '',
          state: '',
          postalCode: '',
          country: ''
        }
      },
      
      digitalCard: {
        enabled: params.digitalCard?.enabled || false,
        walletTokens: []
      },
      
      integration: {
        provider: 'stripe', // Default provider
        providerCardId: '',
        lastSyncAt: new Date(),
        syncStatus: 'pending',
        webhookEndpoints: []
      },
      
      usage: {
        totalTransactions: 0,
        totalAmount: 0,
        currentMonthSpent: 0,
        currentMonthTransactions: 0,
        averageTransactionAmount: 0,
        topMerchantCategories: []
      },
      
      alerts: {
        lowBalance: true,
        unusualActivity: true,
        declinedTransactions: true,
        nearLimit: true,
        notificationRecipients: [params.employeeId]
      },
      
      auditTrail: [{
        timestamp: new Date(),
        action: 'Card Created',
        performedBy: params.issuedBy,
        details: `Corporate card created for ${employee.firstName} ${employee.lastName}`
      }],
      
      metadata: {
        createdAt: new Date(),
        createdBy: params.issuedBy,
        updatedAt: new Date(),
        updatedBy: params.issuedBy
      }
    };
    
    // Create card with provider
    const providerCard = await this.createProviderCard(card);
    card.integration.providerCardId = providerCard.id;
    card.cardNumber = providerCard.last4;
    
    // Issue physical card if requested
    if (params.physicalCard) {
      await this.issuePhysicalCard(card);
    }
    
    // Enable digital card if requested
    if (params.digitalCard?.enabled) {
      await this.enableDigitalCard(card);
    }
    
    // Save card
    await this.saveCorporateCard(card);
    
    // Send notifications
    await this.sendCardNotifications(card, 'issued');
    
    return card;
  }
  
  // Process transaction webhook
  async processTransactionWebhook(params: {
    provider: string;
    transactionData: any;
    signature?: string;
  }): Promise<CardTransaction> {
    // Verify webhook signature
    if (params.signature) {
      await this.verifyWebhookSignature(params.provider, params.transactionData, params.signature);
    }
    
    // Map provider transaction to internal format
    const transaction = await this.mapProviderTransaction(params.provider, params.transactionData);
    
    // Check for existing transaction
    const existingTransaction = await this.getTransactionByProviderId(
      params.provider,
      transaction.providerTransactionId
    );
    
    if (existingTransaction) {
      // Update existing transaction
      return await this.updateTransaction(existingTransaction.transactionId, transaction);
    } else {
      // Create new transaction
      return await this.createTransaction(transaction);
    }
  }
  
  // Match transaction to expense
  async matchTransactionToExpense(transactionId: string, options?: {
    autoCreate?: boolean;
    autoSubmit?: boolean;
  }): Promise<{
    matched: boolean;
    expenseId?: string;
    confidence: number;
    requiresReview: boolean;
    message: string;
  }> {
    const transaction = await this.getTransaction(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    
    // Look for existing expenses with similar details
    const matchingExpenses = await this.findMatchingExpenses(transaction);
    
    if (matchingExpenses.length > 0) {
      // Use best match
      const bestMatch = matchingExpenses[0];
      transaction.expenseId = bestMatch.expenseId;
      transaction.matchedAt = new Date();
      transaction.matchConfidence = bestMatch.confidence;
      transaction.requiresReview = bestMatch.confidence < 0.8;
      
      await this.updateTransaction(transactionId, transaction);
      
      return {
        matched: true,
        expenseId: bestMatch.expenseId,
        confidence: bestMatch.confidence,
        requiresReview: bestMatch.confidence < 0.8,
        message: `Transaction matched to existing expense with ${Math.round(bestMatch.confidence * 100)}% confidence`
      };
    } else if (options?.autoCreate) {
      // Create new expense from transaction
      const expense = await this.createExpenseFromTransaction(transaction, options.autoSubmit);
      transaction.expenseId = expense.expenseId;
      transaction.matchedAt = new Date();
      transaction.matchConfidence = 1.0;
      transaction.requiresReview = false;
      
      await this.updateTransaction(transactionId, transaction);
      
      return {
        matched: true,
        expenseId: expense.expenseId,
        confidence: 1.0,
        requiresReview: false,
        message: 'New expense created from transaction'
      };
    } else {
      return {
        matched: false,
        confidence: 0,
        requiresReview: true,
        message: 'No matching expense found'
      };
    }
  }
  
  // Update card limits
  async updateCardLimits(cardId: string, params: {
    dailyLimit?: number;
    monthlyLimit?: number;
    perTransactionLimit?: number;
    internationalLimit?: number;
    cashAdvanceLimit?: number;
    atmWithdrawalLimit?: number;
    updatedBy: string;
  }): Promise<CorporateCard> {
    const card = await this.getCorporateCard(cardId);
    if (!card) {
      throw new Error('Card not found');
    }
    
    // Update limits
    if (params.dailyLimit !== undefined) card.limits.dailyLimit = params.dailyLimit;
    if (params.monthlyLimit !== undefined) card.limits.monthlyLimit = params.monthlyLimit;
    if (params.perTransactionLimit !== undefined) card.limits.perTransactionLimit = params.perTransactionLimit;
    if (params.internationalLimit !== undefined) card.limits.internationalLimit = params.internationalLimit;
    if (params.cashAdvanceLimit !== undefined) card.limits.cashAdvanceLimit = params.cashAdvanceLimit;
    if (params.atmWithdrawalLimit !== undefined) card.limits.atmWithdrawalLimit = params.atmWithdrawalLimit;
    
    // Update provider
    await this.updateProviderCardLimits(card);
    
    // Add audit entry
    card.auditTrail.push({
      timestamp: new Date(),
      action: 'Limits Updated',
      performedBy: params.updatedBy,
      details: 'Card limits updated'
    });
    
    card.metadata.updatedBy = params.updatedBy;
    card.metadata.updatedAt = new Date();
    
    await this.updateCorporateCard(card);
    
    // Send notifications
    await this.sendCardNotifications(card, 'limits_updated');
    
    return card;
  }
  
  // Block/unblock card
  async blockCard(cardId: string, reason: string, blockedBy: string): Promise<CorporateCard> {
    const card = await this.getCorporateCard(cardId);
    if (!card) {
      throw new Error('Card not found');
    }
    
    card.status = 'blocked';
    card.isActive = false;
    
    // Block with provider
    await this.blockProviderCard(card);
    
    // Add audit entry
    card.auditTrail.push({
      timestamp: new Date(),
      action: 'Card Blocked',
      performedBy: blockedBy,
      details: `Card blocked: ${reason}`
    });
    
    card.metadata.updatedBy = blockedBy;
    card.metadata.updatedAt = new Date();
    
    await this.updateCorporateCard(card);
    
    // Send notifications
    await this.sendCardNotifications(card, 'blocked');
    
    return card;
  }
  
  // Get card analytics
  async getCardAnalytics(params: {
    startDate: Date;
    endDate: Date;
    cardId?: string;
    employeeId?: string;
    department?: string;
  }): Promise<CardAnalytics> {
    // Mock analytics data
    return {
      period: {
        startDate: params.startDate,
        endDate: params.endDate
      },
      
      overview: {
        totalCards: 100,
        activeCards: 85,
        totalTransactions: 5000,
        totalVolume: 500000,
        averageTransactionAmount: 100,
        declinedTransactions: 150,
        declineRate: 3.0
      },
      
      usageAnalysis: {
        transactionsByMonth: [
          { month: '2024-01', count: 800, amount: 80000 },
          { month: '2024-02', count: 850, amount: 85000 }
        ],
        transactionsByCategory: [
          { category: 'Travel', count: 1500, amount: 200000, percentage: 40.0 },
          { category: 'Meals', count: 2000, amount: 150000, percentage: 30.0 },
          { category: 'Office', count: 1000, amount: 100000, percentage: 20.0 },
          { category: 'Other', count: 500, amount: 50000, percentage: 10.0 }
        ],
        topMerchants: [
          { merchantName: 'Uber', count: 500, amount: 25000, category: 'Travel' },
          { merchantName: 'Starbucks', count: 800, amount: 16000, category: 'Meals' }
        ],
        spendingByEmployee: [
          { employeeId: 'emp1', employeeName: 'John Doe', department: 'Sales', amount: 15000, transactions: 150 }
        ]
      },
      
      fraudAnalysis: {
        totalFlagged: 50,
        confirmedFraud: 10,
        falsePositives: 40,
        fraudRate: 0.2,
        averageRiskScore: 25.5,
        riskFactors: [
          { factor: 'Unusual Location', count: 20, percentage: 40.0 },
          { factor: 'High Amount', count: 15, percentage: 30.0 },
          { factor: 'Late Night', count: 10, percentage: 20.0 }
        ],
        fraudByCategory: [
          { category: 'Travel', fraudCount: 5, totalTransactions: 1500, fraudRate: 0.33 }
        ]
      },
      
      controlEffectiveness: {
        blockedTransactions: 100,
        blockedAmount: 15000,
        controlViolations: [
          { control: 'Daily Limit', violations: 50, preventedAmount: 8000 },
          { control: 'Merchant Category', violations: 30, preventedAmount: 5000 }
        ],
        limitBreaches: [
          { limitType: 'Daily Limit', breaches: 40, attemptedAmount: 12000 },
          { limitType: 'Per Transaction', breaches: 25, attemptedAmount: 8000 }
        ]
      },
      
      integrationPerformance: {
        syncSuccessRate: 99.5,
        averageSyncTime: 150, // ms
        webhookLatency: 200, // ms
        errorRate: 0.5,
        errorsByType: [
          { errorType: 'timeout', count: 10, percentage: 50.0 },
          { errorType: 'auth_failed', count: 5, percentage: 25.0 }
        ]
      },
      
      recommendations: [
        {
          type: 'limit_adjustment',
          priority: 'medium',
          description: 'Consider increasing daily limits for frequent travelers',
          impact: 'Reduce declined transactions by 15%',
          affectedCards: 20,
          potentialSavings: 5000
        }
      ]
    };
  }
  
  // Helper methods
  private generateMaskedCardNumber(): string {
    const last4 = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `****-****-****-${last4}`;
  }
  
  private async createProviderCard(card: CorporateCard): Promise<any> {
    // Mock provider card creation
    return {
      id: `card_${Date.now()}`,
      last4: card.cardNumber.split('-').pop()
    };
  }
  
  private async issuePhysicalCard(card: CorporateCard): Promise<void> {
    card.physicalCard.issued = true;
    card.physicalCard.issuedAt = new Date();
    card.physicalCard.shippedAt = new Date();
    card.physicalCard.trackingNumber = `TRACK-${Date.now()}`;
  }
  
  private async enableDigitalCard(card: CorporateCard): Promise<void> {
    card.digitalCard.enabled = true;
  }
  
  private async verifyWebhookSignature(provider: string, data: any, signature: string): Promise<void> {
    // Mock signature verification
    console.log(`Verifying webhook signature for ${provider}`);
  }
  
  private async mapProviderTransaction(provider: string, providerData: any): Promise<CardTransaction> {
    // Mock transaction mapping
    return {
      transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      cardId: providerData.card_id || '',
      providerTransactionId: providerData.id,
      amount: providerData.amount || 0,
      currency: providerData.currency || 'USD',
      merchantName: providerData.merchant_name || 'Unknown',
      merchantCategoryCode: providerData.merchant_category_code || '',
      merchantCategory: providerData.merchant_category || 'Other',
      merchantLocation: {
        address: providerData.merchant_address,
        city: providerData.merchant_city,
        state: providerData.merchant_state,
        country: providerData.merchant_country
      },
      transactionDate: new Date(providerData.created_at),
      authorizationCode: providerData.authorization_code,
      referenceNumber: providerData.reference_number,
      status: this.mapTransactionStatus(providerData.status),
      receiptRequired: true,
      receiptProvided: false,
      receiptAttachments: [],
      additionalData: {
        interchangeRate: providerData.interchange_rate,
        processorFee: providerData.processor_fee
      },
      fraud: {
        riskScore: providerData.risk_score || 0,
        riskFactors: [],
        flagged: false,
        reviewed: false
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        source: 'webhook'
      }
    };
  }
  
  private mapTransactionStatus(providerStatus: string): any {
    const statusMap: Record<string, string> = {
      'authorized': 'authorized',
      'settled': 'settled',
      'declined': 'declined',
      'voided': 'voided',
      'refunded': 'refunded'
    };
    return statusMap[providerStatus] || 'pending';
  }
  
  private async findMatchingExpenses(transaction: CardTransaction): Promise<Array<{expenseId: string; confidence: number}>> {
    // Mock expense matching
    return [];
  }
  
  private async createExpenseFromTransaction(transaction: CardTransaction, autoSubmit: boolean): Promise<IExpense> {
    // Mock expense creation
    return {
      expenseId: `EXP-${Date.now()}`,
      title: `Transaction at ${transaction.merchantName}`,
      amount: transaction.amount,
      totalAmount: transaction.amount,
      date: transaction.transactionDate,
      status: autoSubmit ? 'submitted' : 'draft'
    } as IExpense;
  }
  
  // Database operations (mock implementations)
  private async saveCorporateCard(card: CorporateCard): Promise<void> {
    console.log(`Saving corporate card ${card.cardId}`);
  }
  
  private async updateCorporateCard(card: CorporateCard): Promise<void> {
    console.log(`Updating corporate card ${card.cardId}`);
  }
  
  private async getCorporateCard(cardId: string): Promise<CorporateCard | null> {
    // Mock implementation
    return null;
  }
  
  private async getEmployeeCards(employeeId: string): Promise<CorporateCard[]> {
    // Mock implementation
    return [];
  }
  
  private async createTransaction(transaction: CardTransaction): Promise<CardTransaction> {
    console.log(`Creating transaction ${transaction.transactionId}`);
    return transaction;
  }
  
  private async updateTransaction(transactionId: string, transaction: CardTransaction): Promise<CardTransaction> {
    console.log(`Updating transaction ${transactionId}`);
    return transaction;
  }
  
  private async getTransaction(transactionId: string): Promise<CardTransaction | null> {
    // Mock implementation
    return null;
  }
  
  private async getTransactionByProviderId(provider: string, providerTransactionId: string): Promise<CardTransaction | null> {
    // Mock implementation
    return null;
  }
  
  private async updateProviderCardLimits(card: CorporateCard): Promise<void> {
    console.log(`Updating provider card limits for ${card.cardId}`);
  }
  
  private async blockProviderCard(card: CorporateCard): Promise<void> {
    console.log(`Blocking provider card ${card.cardId}`);
  }
  
  private async sendCardNotifications(card: CorporateCard, action: string): Promise<void> {
    console.log(`Sending ${action} notifications for card ${card.cardId}`);
  }
}
