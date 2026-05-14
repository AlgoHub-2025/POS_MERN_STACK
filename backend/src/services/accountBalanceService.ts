import { Account, IAccount } from '../models/Account';
import { User } from '../models/User';

export interface AccountBalance {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  accountCategory: string;
  currency: string;
  
  // Balance Information
  openingBalance: number;
  currentBalance: number;
  periodBalance: number;
  yearToDateBalance: number;
  
  // Transaction Totals
  debitTotal: number;
  creditTotal: number;
  periodDebitTotal: number;
  periodCreditTotal: number;
  
  // Transaction Counts
  totalTransactions: number;
  periodTransactions: number;
  
  // Dates
  asOfDate: Date;
  periodStartDate: Date;
  periodEndDate: Date;
  lastTransactionDate?: Date;
  openingBalanceDate: Date;
  
  // Status
  status: 'active' | 'inactive' | 'error';
  isReconciled: boolean;
  lastReconciledDate?: Date;
  
  // Variance Analysis
  varianceFromBudget?: {
    budgetAmount: number;
    actualAmount: number;
    variance: number;
    variancePercentage: number;
  };
  
  // Currency Information (for multi-currency)
  baseCurrencyBalance?: number;
  exchangeRate?: number;
  unrealizedGainLoss?: number;
}

export interface BalanceCalculationRequest {
  accountIds?: string[];
  accountTypes?: string[];
  accountCategories?: string[];
  includeInactive?: boolean;
  asOfDate: Date;
  periodStartDate: Date;
  periodEndDate: Date;
  currency?: string;
  includeSubAccounts?: boolean;
  calculateVariance?: boolean;
  budgetId?: string;
}

export interface BalanceSnapshot {
  snapshotId: string;
  name: string;
  description?: string;
  
  // Snapshot Configuration
  configuration: {
    asOfDate: Date;
    includeAllAccounts: boolean;
    accountFilters?: {
      accountIds?: string[];
      accountTypes?: string[];
      accountCategories?: string[];
      includeInactive?: boolean;
    };
    currency: string;
    includeSubAccounts: boolean;
    includeBudgetVariance: boolean;
    budgetId?: string;
  };
  
  // Snapshot Data
  data: {
    totalAccounts: number;
    totalBalance: number;
    totalDebits: number;
    totalCredits: number;
    balances: AccountBalance[];
    summary: {
      byAccountType: Record<string, { count: number; totalBalance: number }>;
      byAccountCategory: Record<string, { count: number; totalBalance: number }>;
      byCurrency: Record<string, { count: number; totalBalance: number }>;
    };
    created: Date;
    createdBy: string;
  };
  
  // Status
  status: 'creating' | 'completed' | 'failed' | 'archived';
  error?: string;
  
  // Metadata
  metadata: {
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
    version: number;
    tags: string[];
  };
}

export interface BalanceReconciliation {
  reconciliationId: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  
  // Reconciliation Period
  period: {
    startDate: Date;
    endDate: Date;
  };
  
  // Balances
  balances: {
    systemBalance: number;
    statementBalance: number;
    previousReconciledBalance: number;
    unreconciledItems: number;
    reconciledBalance: number;
    variance: number;
    variancePercentage: number;
  };
  
  // Reconciliation Items
  items: Array<{
    itemId: string;
    date: Date;
    description: string;
    amount: number;
    type: 'debit' | 'credit';
    status: 'matched' | 'unmatched' | 'adjusted';
    reference?: string;
    matchId?: string;
  }>;
  
  // Status
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  reconciledBy?: string;
  reconciledAt?: Date;
  
  // Adjustments
  adjustments: Array<{
    adjustmentId: string;
    date: Date;
    amount: number;
    description: string;
    reason: string;
    approvedBy?: string;
    approvedAt?: Date;
  }>;
  
  // Notes
  notes?: string;
  
  // Metadata
  metadata: {
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
  };
}

export interface BalanceAlert {
  alertId: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  
  // Alert Configuration
  configuration: {
    alertType: 'negative_balance' | 'threshold_exceeded' | 'unusual_activity' | 'reconciliation_required' | 'budget_variance';
    condition: string; // expression
    threshold?: number;
    percentage?: number;
    frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
  };
  
  // Alert Data
  data: {
    currentValue: number;
    thresholdValue?: number;
    variance?: number;
    variancePercentage?: number;
    triggeredAt: Date;
    resolvedAt?: Date;
  };
  
  // Status
  status: 'active' | 'triggered' | 'resolved' | 'disabled';
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  // Notifications
  notifications: Array<{
    notificationId: string;
    recipientId: string;
    recipientType: 'user' | 'role' | 'email';
    sentAt: Date;
    acknowledgedAt?: Date;
  }>;
  
  // Resolution
  resolution?: {
    resolvedBy: string;
    resolvedAt: Date;
    resolution: string;
  };
  
  // Metadata
  metadata: {
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
  };
}

export interface BalanceAnalytics {
  period: {
    startDate: Date;
    endDate: Date;
    comparisonPeriod?: {
      startDate: Date;
      endDate: Date;
    };
  };
  
  // Overview
  overview: {
    totalAccounts: number;
    activeAccounts: number;
    totalBalance: number;
    totalDebits: number;
    totalCredits: number;
    averageBalance: number;
    balanceGrowthRate?: number;
  };
  
  // Balance Trends
  trends: {
    daily: Array<{
      date: string;
      totalBalance: number;
      debitTotal: number;
      creditTotal: number;
      transactionCount: number;
    }>;
    monthly: Array<{
      month: string;
      openingBalance: number;
      closingBalance: number;
      netChange: number;
      transactionCount: number;
    }>;
    byAccountType: Array<{
      accountType: string;
      currentBalance: number;
      previousBalance?: number;
      change: number;
      changePercentage?: number;
    }>;
  };
  
  // Account Analysis
  accountAnalysis: {
    topBalances: Array<{
      accountId: string;
      accountCode: string;
      accountName: string;
      balance: number;
      percentage: number;
    }>;
    zeroBalanceAccounts: number;
    negativeBalanceAccounts: number;
    dormantAccounts: number; // no transactions in period
    activeAccounts: number;
  };
  
  // Variance Analysis
  varianceAnalysis: {
    budgetVariance: {
      totalVariance: number;
      variancePercentage: number;
      overBudget: number;
    };
    forecastVariance?: {
      actualVsForecast: number;
      accuracyPercentage: number;
    };
    periodComparison?: {
      currentPeriod: number;
      previousPeriod: number;
      variance: number;
      variancePercentage: number;
    };
  };
  
  // Currency Analysis (for multi-currency)
  currencyAnalysis: {
    byCurrency: Array<{
      currency: string;
      accountCount: number;
      totalBalance: number;
      baseCurrencyBalance: number;
      exchangeRate: number;
    }>;
    unrealizedGainLoss: {
      totalUnrealizedGL: number;
      byCurrency: Record<string, number>;
    };
  };
  
  // Reconciliation Status
  reconciliationStatus: {
    totalReconciliations: number;
    pendingReconciliations: number;
    completedReconciliations: number;
    failedReconciliations: number;
    averageReconciliationTime: number; // days
    unreconciledAmount: number;
  };
  
  // Alerts
  alerts: {
    activeAlerts: number;
    triggeredToday: number;
    resolvedToday: number;
    criticalAlerts: number;
    topAlertTypes: Array<{
      alertType: string;
      count: number;
      percentage: number;
    }>;
  };
}

export class AccountBalanceService {
  // Calculate account balances
  async calculateBalances(request: BalanceCalculationRequest): Promise<AccountBalance[]> {
    const {
      accountIds,
      accountTypes,
      accountCategories,
      includeInactive = false,
      asOfDate,
      periodStartDate,
      periodEndDate,
      currency = 'USD',
      includeSubAccounts = true,
      calculateVariance = false,
      budgetId
    } = request;
    
    // Build account query
    const query: any = {};
    if (!includeInactive) {
      query.isActive = true;
    }
    if (accountIds && accountIds.length > 0) {
      query._id = { $in: accountIds };
    }
    if (accountTypes && accountTypes.length > 0) {
      query.type = { $in: accountTypes };
    }
    if (accountCategories && accountCategories.length > 0) {
      query.category = { $in: accountCategories };
    }
    
    // Get accounts
    const accounts = await Account.find(query).sort({ code: 1 });
    
    const balances: AccountBalance[] = [];
    
    for (const account of accounts) {
      const balance = await this.calculateAccountBalance(account, {
        asOfDate,
        periodStartDate,
        periodEndDate,
        currency,
        calculateVariance,
        budgetId
      });
      
      balances.push(balance);
    }
    
    // If includeSubAccounts, calculate parent account balances
    if (includeSubAccounts) {
      await this.calculateParentAccountBalances(balances, accounts);
    }
    
    return balances;
  }
  
  // Calculate single account balance
  async calculateAccountBalance(
    account: IAccount,
    options: {
      asOfDate: Date;
      periodStartDate: Date;
      periodEndDate: Date;
      currency: string;
      calculateVariance?: boolean;
      budgetId?: string;
    }
  ): Promise<AccountBalance> {
    // Get transactions for the account (mock implementation)
    const transactions = await this.getAccountTransactions(account._id, options.asOfDate);
    
    // Calculate balances
    const openingBalance = account.openingBalance.amount;
    const debitTotal = transactions.reduce((sum, tx) => sum + (tx.debit || 0), 0);
    const creditTotal = transactions.reduce((sum, tx) => sum + (tx.credit || 0), 0);
    
    // Calculate period totals
    const periodTransactions = await this.getAccountTransactions(
      account._id,
      options.asOfDate,
      options.periodStartDate,
      options.periodEndDate
    );
    const periodDebitTotal = periodTransactions.reduce((sum, tx) => sum + (tx.debit || 0), 0);
    const periodCreditTotal = periodTransactions.reduce((sum, tx) => sum + (tx.credit || 0), 0);
    
    // Calculate current balance based on normal balance
    let currentBalance = openingBalance;
    if (account.normalBalance === 'debit') {
      currentBalance += debitTotal - creditTotal;
    } else {
      currentBalance += creditTotal - debitTotal;
    }
    
    let periodBalance = 0;
    if (account.normalBalance === 'debit') {
      periodBalance += periodDebitTotal - periodCreditTotal;
    } else {
      periodBalance += periodCreditTotal - periodDebitTotal;
    }
    
    // Calculate year-to-date balance
    const ytdTransactions = await this.getAccountTransactions(
      account._id,
      options.asOfDate,
      new Date(options.asOfDate.getFullYear(), 0, 1),
      options.asOfDate
    );
    let yearToDateBalance = openingBalance;
    const ytdDebitTotal = ytdTransactions.reduce((sum, tx) => sum + (tx.debit || 0), 0);
    const ytdCreditTotal = ytdTransactions.reduce((sum, tx) => sum + (tx.credit || 0), 0);
    
    if (account.normalBalance === 'debit') {
      yearToDateBalance += ytdDebitTotal - ytdCreditTotal;
    } else {
      yearToDateBalance += ytdCreditTotal - ytdDebitTotal;
    }
    
    // Get last transaction date
    const lastTransactionDate = transactions.length > 0 
      ? new Date(Math.max(...transactions.map(tx => new Date(tx.date).getTime())))
      : undefined;
    
    // Calculate budget variance if requested
    let varianceFromBudget;
    if (options.calculateVariance && options.budgetId) {
      varianceFromBudget = await this.calculateBudgetVariance(
        account._id,
        options.budgetId,
        options.periodStartDate,
        options.periodEndDate,
        periodBalance
      );
    }
    
    // Handle currency conversion if needed
    let baseCurrencyBalance, exchangeRate, unrealizedGainLoss;
    if (account.currency !== options.currency) {
      const conversion = await this.convertCurrency(
        currentBalance,
        account.currency,
        options.currency,
        options.asOfDate
      );
      baseCurrencyBalance = conversion.amount;
      exchangeRate = conversion.rate;
      unrealizedGainLoss = conversion.unrealizedGL;
    }
    
    return {
      accountId: account._id,
      accountCode: account.code,
      accountName: account.displayName,
      accountType: account.type,
      accountCategory: account.category,
      currency: account.currency,
      
      openingBalance,
      currentBalance,
      periodBalance,
      yearToDateBalance,
      
      debitTotal,
      creditTotal,
      periodDebitTotal,
      periodCreditTotal,
      
      totalTransactions: transactions.length,
      periodTransactions: periodTransactions.length,
      
      asOfDate: options.asOfDate,
      periodStartDate: options.periodStartDate,
      periodEndDate: options.periodEndDate,
      lastTransactionDate,
      openingBalanceDate: account.openingBalance.date,
      
      status: account.isActive ? 'active' : 'inactive',
      isReconciled: false, // Would check reconciliation status
      lastReconciledDate: undefined,
      
      varianceFromBudget,
      
      baseCurrencyBalance,
      exchangeRate,
      unrealizedGainLoss
    };
  }
  
  // Create balance snapshot
  async createBalanceSnapshot(params: {
    name: string;
    description?: string;
    asOfDate: Date;
    includeAllAccounts?: boolean;
    accountFilters?: {
      accountIds?: string[];
      accountTypes?: string[];
      accountCategories?: string[];
      includeInactive?: boolean;
    };
    currency?: string;
    includeSubAccounts?: boolean;
    includeBudgetVariance?: boolean;
    budgetId?: string;
    createdBy: string;
  }): Promise<BalanceSnapshot> {
    const snapshotId = `SNAPSHOT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const snapshot: BalanceSnapshot = {
      snapshotId,
      name: params.name,
      description: params.description,
      
      configuration: {
        asOfDate: params.asOfDate,
        includeAllAccounts: params.includeAllAccounts ?? true,
        accountFilters: params.accountFilters,
        currency: params.currency || 'USD',
        includeSubAccounts: params.includeSubAccounts ?? true,
        includeBudgetVariance: params.includeBudgetVariance ?? false,
        budgetId: params.budgetId
      },
      
      data: {
        totalAccounts: 0,
        totalBalance: 0,
        totalDebits: 0,
        totalCredits: 0,
        balances: [],
        summary: {
          byAccountType: {},
          byAccountCategory: {},
          byCurrency: {}
        },
        created: new Date(),
        createdBy: params.createdBy
      },
      
      status: 'creating',
      
      metadata: {
        createdAt: new Date(),
        createdBy: params.createdBy,
        updatedAt: new Date(),
        updatedBy: params.createdBy,
        version: 1,
        tags: []
      }
    };
    
    try {
      // Calculate balances
      const balanceRequest: BalanceCalculationRequest = {
        asOfDate: params.asOfDate,
        periodStartDate: new Date(params.asOfDate.getFullYear(), params.asOfDate.getMonth(), 1),
        periodEndDate: params.asOfDate,
        currency: params.currency || 'USD',
        includeSubAccounts: params.includeSubAccounts,
        calculateVariance: params.includeBudgetVariance,
        budgetId: params.budgetId,
        ...params.accountFilters
      };
      
      const balances = await this.calculateBalances(balanceRequest);
      
      // Calculate summary
      const summary = this.calculateBalanceSummary(balances);
      
      // Update snapshot data
      snapshot.data.balances = balances;
      snapshot.data.summary = summary;
      snapshot.data.totalAccounts = balances.length;
      snapshot.data.totalBalance = summary.totalBalance;
      snapshot.data.totalDebits = balances.reduce((sum, bal) => sum + bal.debitTotal, 0);
      snapshot.data.totalCredits = balances.reduce((sum, bal) => sum + bal.creditTotal, 0);
      
      snapshot.status = 'completed';
      
    } catch (error) {
      snapshot.status = 'failed';
      snapshot.error = error instanceof Error ? error.message : 'Unknown error';
    }
    
    // Save snapshot
    await this.saveBalanceSnapshot(snapshot);
    
    return snapshot;
  }
  
  // Reconcile account balance
  async reconcileAccountBalance(params: {
    accountId: string;
    periodStartDate: Date;
    periodEndDate: Date;
    statementBalance: number;
    adjustments?: Array<{
      amount: number;
      description: string;
      reason: string;
    }>;
    notes?: string;
    reconciledBy: string;
  }): Promise<BalanceReconciliation> {
    const reconciliationId = `RECONC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Get account
    const account = await Account.findById(params.accountId);
    if (!account) {
      throw new Error('Account not found');
    }
    
    // Calculate system balance
    const systemBalance = await this.calculateAccountBalance(account, {
      asOfDate: params.periodEndDate,
      periodStartDate: params.periodStartDate,
      periodEndDate: params.periodEndDate,
      currency: account.currency
    });
    
    // Calculate variance
    const variance = systemBalance.currentBalance - params.statementBalance;
    const variancePercentage = params.statementBalance !== 0 
      ? (variance / params.statementBalance) * 100 
      : 0;
    
    const reconciliation: BalanceReconciliation = {
      reconciliationId,
      accountId: params.accountId,
      accountCode: account.code,
      accountName: account.displayName,
      
      period: {
        startDate: params.periodStartDate,
        endDate: params.periodEndDate
      },
      
      balances: {
        systemBalance: systemBalance.currentBalance,
        statementBalance: params.statementBalance,
        previousReconciledBalance: 0, // Would get from last reconciliation
        unreconciledItems: variance,
        reconciledBalance: params.statementBalance,
        variance,
        variancePercentage
      },
      
      items: [], // Would get unreconciled items
      
      status: Math.abs(variance) < 0.01 ? 'completed' : 'pending',
      reconciledBy: Math.abs(variance) < 0.01 ? params.reconciledBy : undefined,
      reconciledAt: Math.abs(variance) < 0.01 ? new Date() : undefined,
      
      adjustments: params.adjustments?.map(adj => ({
        adjustmentId: `ADJ-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        date: new Date(),
        amount: adj.amount,
        description: adj.description,
        reason: adj.reason
      })) || [],
      
      notes: params.notes,
      
      metadata: {
        createdAt: new Date(),
        createdBy: params.reconciledBy,
        updatedAt: new Date(),
        updatedBy: params.reconciledBy
      }
    };
    
    // Save reconciliation
    await this.saveBalanceReconciliation(reconciliation);
    
    return reconciliation;
  }
  
  // Get balance analytics
  async getBalanceAnalytics(params: {
    startDate: Date;
    endDate: Date;
    comparisonPeriod?: {
      startDate: Date;
      endDate: Date;
    };
    accountIds?: string[];
    accountTypes?: string[];
    currency?: string;
  }): Promise<BalanceAnalytics> {
    const {
      startDate,
      endDate,
      comparisonPeriod,
      accountIds,
      accountTypes,
      currency = 'USD'
    } = params;
    
    // Calculate current period balances
    const currentBalances = await this.calculateBalances({
      accountIds,
      accountTypes,
      asOfDate: endDate,
      periodStartDate: startDate,
      periodEndDate: endDate,
      currency
    });
    
    // Calculate comparison period balances if provided
    let comparisonBalances: AccountBalance[] = [];
    if (comparisonPeriod) {
      comparisonBalances = await this.calculateBalances({
        accountIds,
        accountTypes,
        asOfDate: comparisonPeriod.endDate,
        periodStartDate: comparisonPeriod.startDate,
        periodEndDate: comparisonPeriod.endDate,
        currency
      });
    }
    
    // Generate analytics
    const analytics: BalanceAnalytics = {
      period: {
        startDate,
        endDate,
        comparisonPeriod
      },
      
      overview: this.calculateOverview(currentBalances, comparisonBalances),
      
      trends: await this.calculateBalanceTrends(currentBalances, startDate, endDate, comparisonPeriod),
      
      accountAnalysis: this.calculateAccountAnalysis(currentBalances),
      
      varianceAnalysis: await this.calculateVarianceAnalysis(currentBalances, startDate, endDate),
      
      currencyAnalysis: this.calculateCurrencyAnalysis(currentBalances),
      
      reconciliationStatus: await this.getReconciliationStatus(accountIds),
      
      alerts: await this.getBalanceAlerts(accountIds)
    };
    
    return analytics;
  }
  
  // Helper methods
  private async calculateParentAccountBalances(balances: AccountBalance[], accounts: IAccount[]): Promise<void> {
    // Group accounts by parent
    const parentGroups = balances.reduce((groups, balance) => {
      const account = accounts.find(acc => acc._id === balance.accountId);
      if (account && account.parentAccount) {
        const parentId = account.parentAccount.toString();
        if (!groups[parentId]) {
          groups[parentId] = [];
        }
        groups[parentId].push(balance);
      }
      return groups;
    }, {} as Record<string, AccountBalance[]>);
    
    // Calculate parent balances
    for (const [parentId, childBalances] of Object.entries(parentGroups)) {
      const parentAccount = accounts.find(acc => acc._id.toString() === parentId);
      if (parentAccount) {
        const parentBalance = balances.find(b => b.accountId === parentId);
        if (parentBalance) {
          // Sum child balances
          parentBalance.currentBalance = childBalances.reduce((sum, child) => sum + child.currentBalance, 0);
          parentBalance.periodBalance = childBalances.reduce((sum, child) => sum + child.periodBalance, 0);
          parentBalance.debitTotal = childBalances.reduce((sum, child) => sum + child.debitTotal, 0);
          parentBalance.creditTotal = childBalances.reduce((sum, child) => sum + child.creditTotal, 0);
        }
      }
    }
  }
  
  private async getAccountTransactions(accountId: string, asOfDate: Date, startDate?: Date, endDate?: Date): Promise<any[]> {
    // Mock implementation - would query actual journal entries
    return [
      {
        date: new Date(),
        debit: 1000,
        credit: 0,
        description: 'Sample transaction'
      }
    ];
  }
  
  private async calculateBudgetVariance(
    accountId: string,
    budgetId: string,
    startDate: Date,
    endDate: Date,
    actualAmount: number
  ): Promise<any> {
    // Mock implementation - would query actual budget
    return {
      budgetAmount: 5000,
      actualAmount,
      variance: actualAmount - 5000,
      variancePercentage: ((actualAmount - 5000) / 5000) * 100
    };
  }
  
  private async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    date: Date
  ): Promise<{ amount: number; rate: number; unrealizedGL: number }> {
    // Mock implementation - would query actual exchange rates
    return {
      amount: amount * 1.1,
      rate: 1.1,
      unrealizedGL: amount * 0.1
    };
  }
  
  private calculateBalanceSummary(balances: AccountBalance[]): any {
    const summary = {
      totalBalance: balances.reduce((sum, bal) => sum + bal.currentBalance, 0),
      byAccountType: {} as Record<string, { count: number; totalBalance: number }>,
      byAccountCategory: {} as Record<string, { count: number; totalBalance: number }>,
      byCurrency: {} as Record<string, { count: number; totalBalance: number }>
    };
    
    for (const balance of balances) {
      // By account type
      if (!summary.byAccountType[balance.accountType]) {
        summary.byAccountType[balance.accountType] = { count: 0, totalBalance: 0 };
      }
      summary.byAccountType[balance.accountType].count++;
      summary.byAccountType[balance.accountType].totalBalance += balance.currentBalance;
      
      // By account category
      if (!summary.byAccountCategory[balance.accountCategory]) {
        summary.byAccountCategory[balance.accountCategory] = { count: 0, totalBalance: 0 };
      }
      summary.byAccountCategory[balance.accountCategory].count++;
      summary.byAccountCategory[balance.accountCategory].totalBalance += balance.currentBalance;
      
      // By currency
      if (!summary.byCurrency[balance.currency]) {
        summary.byCurrency[balance.currency] = { count: 0, totalBalance: 0 };
      }
      summary.byCurrency[balance.currency].count++;
      summary.byCurrency[balance.currency].totalBalance += balance.currentBalance;
    }
    
    return summary;
  }
  
  private calculateOverview(currentBalances: AccountBalance[], comparisonBalances?: AccountBalance[]): any {
    const totalBalance = currentBalances.reduce((sum, bal) => sum + bal.currentBalance, 0);
    const totalDebits = currentBalances.reduce((sum, bal) => sum + bal.debitTotal, 0);
    const totalCredits = currentBalances.reduce((sum, bal) => sum + bal.creditTotal, 0);
    
    let balanceGrowthRate;
    if (comparisonBalances && comparisonBalances.length > 0) {
      const previousTotal = comparisonBalances.reduce((sum, bal) => sum + bal.currentBalance, 0);
      balanceGrowthRate = previousTotal !== 0 ? ((totalBalance - previousTotal) / previousTotal) * 100 : 0;
    }
    
    return {
      totalAccounts: currentBalances.length,
      activeAccounts: currentBalances.filter(bal => bal.status === 'active').length,
      totalBalance,
      totalDebits,
      totalCredits,
      averageBalance: currentBalances.length > 0 ? totalBalance / currentBalances.length : 0,
      balanceGrowthRate
    };
  }
  
  private async calculateBalanceTrends(
    balances: AccountBalance[],
    startDate: Date,
    endDate: Date,
    comparisonPeriod?: any
  ): Promise<any> {
    // Mock implementation
    return {
      daily: [],
      monthly: [],
      byAccountType: []
    };
  }
  
  private calculateAccountAnalysis(balances: AccountBalance[]): any {
    const totalBalance = Math.abs(balances.reduce((sum, bal) => sum + bal.currentBalance, 0));
    
    const topBalances = balances
      .map(bal => ({
        accountId: bal.accountId,
        accountCode: bal.accountCode,
        accountName: bal.accountName,
        balance: Math.abs(bal.currentBalance),
        percentage: totalBalance > 0 ? (Math.abs(bal.currentBalance) / totalBalance) * 100 : 0
      }))
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 10);
    
    return {
      topBalances,
      zeroBalanceAccounts: balances.filter(bal => bal.currentBalance === 0).length,
      negativeBalanceAccounts: balances.filter(bal => bal.currentBalance < 0).length,
      dormantAccounts: balances.filter(bal => bal.periodTransactions === 0).length,
      activeAccounts: balances.filter(bal => bal.periodTransactions > 0).length
    };
  }
  
  private async calculateVarianceAnalysis(balances: AccountBalance[], startDate: Date, endDate: Date): Promise<any> {
    // Mock implementation
    return {
      budgetVariance: {
        totalVariance: 0,
        variancePercentage: 0,
        overBudget: 0
      }
    };
  }
  
  private calculateCurrencyAnalysis(balances: AccountBalance[]): any {
    const byCurrency = balances.reduce((acc, bal) => {
      if (!acc[bal.currency]) {
        acc[bal.currency] = {
          accountCount: 0,
          totalBalance: 0,
          baseCurrencyBalance: 0,
          exchangeRate: 1
        };
      }
      acc[bal.currency].accountCount++;
      acc[bal.currency].totalBalance += bal.currentBalance;
      acc[bal.currency].baseCurrencyBalance += bal.baseCurrencyBalance || bal.currentBalance;
      return acc;
    }, {} as Record<string, any>);
    
    return {
      byCurrency,
      unrealizedGainLoss: {
        totalUnrealizedGL: balances.reduce((sum, bal) => sum + (bal.unrealizedGainLoss || 0), 0),
        byCurrency: {}
      }
    };
  }
  
  private async getReconciliationStatus(accountIds?: string[]): Promise<any> {
    // Mock implementation
    return {
      totalReconciliations: 0,
      pendingReconciliations: 0,
      completedReconciliations: 0,
      failedReconciliations: 0,
      averageReconciliationTime: 0,
      unreconciledAmount: 0
    };
  }
  
  private async getBalanceAlerts(accountIds?: string[]): Promise<any> {
    // Mock implementation
    return {
      activeAlerts: 0,
      triggeredToday: 0,
      resolvedToday: 0,
      criticalAlerts: 0,
      topAlertTypes: []
    };
  }
  
  // Database operations (mock implementations)
  private async saveBalanceSnapshot(snapshot: BalanceSnapshot): Promise<void> {
    console.log(`Saving balance snapshot ${snapshot.snapshotId}`);
  }
  
  private async saveBalanceReconciliation(reconciliation: BalanceReconciliation): Promise<void> {
    console.log(`Saving balance reconciliation ${reconciliation.reconciliationId}`);
  }
}
