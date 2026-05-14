import { Account, IAccount } from '../models/Account';
import { User } from '../models/User';
import { AccountBalanceService } from './accountBalanceService';

export interface AccountReport {
  reportId: string;
  name: string;
  description: string;
  type: 'listing' | 'activity' | 'balance' | 'reconciliation' | 'aging' | 'budget' | 'custom';
  
  // Report Configuration
  configuration: {
    dateRange: {
      startDate: Date;
      endDate: Date;
    };
    accountFilters: {
      accountIds?: string[];
      accountTypes?: string[];
      accountCategories?: string[];
      includeInactive?: boolean;
      includeZeroBalances?: boolean;
    };
    grouping: {
      groupBy?: 'type' | 'category' | 'level' | 'currency' | 'custom';
      customGrouping?: Array<{
        groupName: string;
        condition: string;
        accountIds: string[];
      }>;
    };
    sorting: {
      sortBy: 'code' | 'name' | 'balance' | 'type' | 'category';
      sortOrder: 'asc' | 'desc';
    };
    columns: Array<{
      field: string;
      label: string;
      width?: number;
      format?: string;
      visible: boolean;
      order: number;
    }>;
    formatting: {
      currency: string;
      decimalPlaces: number;
      showThousandsSeparator: boolean;
      dateFormat: string;
      numberFormat: string;
    };
  };
  
  // Report Data
  data: {
    generatedAt: Date;
    generatedBy: string;
    totalAccounts: number;
    totalBalance: number;
    summary: Record<string, any>;
    details: Array<Record<string, any>>;
    charts?: Array<{
      type: 'pie' | 'bar' | 'line' | 'area';
      title: string;
      data: any;
      configuration: any;
    }>;
  };
  
  // Export Options
  exports: {
    pdf?: {
      url: string;
      generatedAt: Date;
      size: number;
    };
    excel?: {
      url: string;
      generatedAt: Date;
      size: number;
    };
    csv?: {
      url: string;
      generatedAt: Date;
      size: number;
    };
  };
  
  // Status
  status: 'generating' | 'completed' | 'failed' | 'archived';
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

export interface AccountListingReport {
  reportId: string;
  name: string;
  description: string;
  
  // Configuration
  configuration: {
    includeHierarchy: boolean;
    maxDepth?: number;
    showBalances: boolean;
    balanceDate: Date;
    includeInactive: boolean;
    groupByType: boolean;
    sortBy: 'code' | 'name' | 'type' | 'balance';
    sortOrder: 'asc' | 'desc';
  };
  
  // Report Data
  data: {
    generatedAt: Date;
    totalAccounts: number;
    activeAccounts: number;
    inactiveAccounts: number;
    totalBalance: number;
    accounts: Array<{
      accountId: string;
      code: string;
      name: string;
      displayName: string;
      type: string;
      category: string;
      level: number;
      path: string;
      parentAccount?: string;
      isActive: boolean;
      isControl: boolean;
      currency: string;
      balance?: number;
      openingBalance?: number;
      transactionCount?: number;
      lastTransactionDate?: Date;
    }>;
    summary: {
      byType: Record<string, { count: number; totalBalance: number }>;
      byCategory: Record<string, { count: number; totalBalance: number }>;
      byLevel: Record<string, { count: number; totalBalance: number }>;
    };
  };
}

export interface AccountActivityReport {
  reportId: string;
  name: string;
  description: string;
  
  // Configuration
  configuration: {
    dateRange: {
      startDate: Date;
      endDate: Date;
    };
    accountIds?: string[];
    includeSubAccounts: boolean;
    transactionTypes?: string[];
    minAmount?: number;
    maxAmount?: number;
    includeUnposted: boolean;
    groupBy: 'date' | 'account' | 'type' | 'department';
    showRunningBalance: boolean;
  };
  
  // Report Data
  data: {
    generatedAt: Date;
    totalTransactions: number;
    totalDebits: number;
    totalCredits: number;
    netChange: number;
    transactions: Array<{
      transactionId: string;
      date: Date;
      accountId: string;
      accountCode: string;
      accountName: string;
      description: string;
      debit: number;
      credit: number;
      balance?: number;
      reference?: string;
      entryNumber: string;
      status: 'posted' | 'draft' | 'pending';
      createdBy: string;
      department?: string;
      project?: string;
    }>;
    summary: {
      byAccount: Record<string, {
        transactionCount: number;
        totalDebits: number;
        totalCredits: number;
        netChange: number;
      }>;
      byDate: Record<string, {
        transactionCount: number;
        totalDebits: number;
        totalCredits: number;
        netChange: number;
      }>;
      byType: Record<string, {
        transactionCount: number;
        totalAmount: number;
      }>;
    };
  };
}

export interface AccountReconciliationReport {
  reportId: string;
  name: string;
  description: string;
  
  // Configuration
  configuration: {
    reconciliationPeriod: {
      startDate: Date;
      endDate: Date;
    };
    accountIds?: string[];
    includeUnreconciled: boolean;
    showAdjustments: boolean;
    varianceThreshold: number;
    groupByStatus: boolean;
  };
  
  // Report Data
  data: {
    generatedAt: Date;
    totalAccounts: number;
    reconciledAccounts: number;
    unreconciledAccounts: number;
    totalVariance: number;
    reconciliations: Array<{
      accountId: string;
      accountCode: string;
      accountName: string;
      systemBalance: number;
      statementBalance: number;
      variance: number;
      variancePercentage: number;
      status: 'reconciled' | 'pending' | 'failed';
      reconciledDate?: Date;
      reconciledBy?: string;
      adjustments: Array<{
        date: Date;
        amount: number;
        description: string;
        reason: string;
      }>;
      unreconciledItems: Array<{
        date: Date;
        description: string;
        amount: number;
        type: 'debit' | 'credit';
        status: 'matched' | 'unmatched';
      }>;
    }>;
    summary: {
      byStatus: Record<string, { count: number; totalVariance: number }>;
      byAccountType: Record<string, {
        total: number;
        reconciled: number;
        reconciliationRate: number;
      }>;
      topVariances: Array<{
        accountId: string;
        accountName: string;
        variance: number;
        variancePercentage: number;
      }>;
    };
  };
}

export interface AccountAgingReport {
  reportId: string;
  name: string;
  description: string;
  
  // Configuration
  configuration: {
    asOfDate: Date;
    accountTypes: Array<'accounts-receivable' | 'accounts-payable'>;
    agingBuckets: Array<{
      name: string;
      days: number;
      color?: string;
    }>;
    includeZeroBalances: boolean;
    groupByCustomer?: boolean;
    groupByVendor?: boolean;
    currency: string;
  };
  
  // Report Data
  data: {
    generatedAt: Date;
    totalAmount: number;
    totalOverdue: number;
    agingSummary: Array<{
      bucketName: string;
      amount: number;
      percentage: number;
      count: number;
    }>;
    details: Array<{
      accountId: string;
      accountCode: string;
      accountName: string;
      customerId?: string;
      customerName?: string;
      vendorId?: string;
      vendorName?: string;
      totalAmount: number;
      current: number;
      buckets: Array<{
        bucketName: string;
        amount: number;
        days: number;
      }>;
      overdueAmount: number;
      oldestInvoiceDate?: Date;
    }>;
    summary: {
      byCustomer: Record<string, {
        totalAmount: number;
        overdueAmount: number;
        accountCount: number;
      }>;
      byVendor: Record<string, {
        totalAmount: number;
        overdueAmount: number;
        accountCount: number;
      }>;
    };
  };
}

export interface AccountBudgetReport {
  reportId: string;
  name: string;
  description: string;
  
  // Configuration
  configuration: {
    budgetId: string;
    budgetPeriod: {
      startDate: Date;
      endDate: Date;
    };
    accountIds?: string[];
    includeVariance: boolean;
    includeForecast: boolean;
    varianceThreshold: number;
    groupByType: boolean;
    currency: string;
  };
  
  // Report Data
  data: {
    generatedAt: Date;
    totalBudget: number;
    totalActual: number;
    totalVariance: number;
    variancePercentage: number;
    budgetDetails: Array<{
      accountId: string;
      accountCode: string;
      accountName: string;
      accountType: string;
      budgetAmount: number;
      actualAmount: number;
      variance: number;
      variancePercentage: number;
      status: 'under' | 'on-track' | 'over';
      forecastAmount?: number;
      forecastVariance?: number;
      monthlyBreakdown?: Array<{
        month: string;
        budget: number;
        actual: number;
        variance: number;
      }>;
    }>;
    summary: {
      byType: Record<string, {
        budget: number;
        actual: number;
        variance: number;
        variancePercentage: number;
      }>;
      byStatus: Record<string, {
        count: number;
        totalBudget: number;
        totalActual: number;
        totalVariance: number;
      }>;
      topVariances: Array<{
        accountId: string;
        accountName: string;
        variance: number;
        variancePercentage: number;
      }>;
    };
  };
}

export interface AccountReportTemplate {
  templateId: string;
  name: string;
  description: string;
  category: 'standard' | 'custom' | 'regulatory' | 'management';
  
  // Template Configuration
  configuration: {
    reportType: 'listing' | 'activity' | 'balance' | 'reconciliation' | 'aging' | 'budget' | 'custom';
    defaultFilters: Record<string, any>;
    defaultGrouping: Record<string, any>;
    defaultSorting: Record<string, any>;
    defaultColumns: Array<{
      field: string;
      label: string;
      width?: number;
      format?: string;
      visible: boolean;
      order: number;
    }>;
    defaultFormatting: Record<string, any>;
  };
  
  // Template Layout
  layout: {
    header: {
      title: string;
      subtitle?: string;
      logo?: string;
      companyInfo?: {
        name: string;
        address: string;
        phone: string;
        email: string;
      };
    };
    sections: Array<{
      name: string;
      type: 'table' | 'chart' | 'summary' | 'text';
      configuration: any;
      order: number;
    }>;
    footer: {
      text?: string;
      pageNumber: boolean;
      generatedDate: boolean;
      signatureLines?: Array<{
        label: string;
        required: boolean;
      }>;
    };
  };
  
  // Usage Statistics
  usage: {
    totalUses: number;
    lastUsed?: Date;
    averageRating?: number;
    reviews: Array<{
      userId: string;
      rating: number;
      comment: string;
      date: Date;
    }>;
  };
  
  // Status
  status: 'active' | 'inactive' | 'deprecated';
  
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

export class AccountReportingService {
  private balanceService: AccountBalanceService;
  
  constructor() {
    this.balanceService = new AccountBalanceService();
  }
  
  // Generate account listing report
  async generateAccountListingReport(params: {
    name: string;
    description?: string;
    includeHierarchy?: boolean;
    maxDepth?: number;
    showBalances?: boolean;
    balanceDate?: Date;
    includeInactive?: boolean;
    groupByType?: boolean;
    sortBy?: 'code' | 'name' | 'type' | 'balance';
    sortOrder?: 'asc' | 'desc';
    accountIds?: string[];
    accountTypes?: string[];
    accountCategories?: string[];
    createdBy: string;
  }): Promise<AccountListingReport> {
    const reportId = `RPT-LIST-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Build account query
    const query: any = {};
    if (!params.includeInactive) {
      query.isActive = true;
    }
    if (params.accountIds && params.accountIds.length > 0) {
      query._id = { $in: params.accountIds };
    }
    if (params.accountTypes && params.accountTypes.length > 0) {
      query.type = { $in: params.accountTypes };
    }
    if (params.accountCategories && params.accountCategories.length > 0) {
      query.category = { $in: params.accountCategories };
    }
    
    // Get accounts
    const accounts = await Account.find(query)
      .populate('parentAccount', 'code displayName')
      .sort(this.buildSortObject(params.sortBy || 'code', params.sortOrder || 'asc'));
    
    // Get balances if requested
    let accountBalances: Record<string, number> = {};
    if (params.showBalances && params.balanceDate) {
      const balances = await this.balanceService.calculateBalances({
        accountIds: params.accountIds,
        accountTypes: params.accountTypes,
        accountCategories: params.accountCategories,
        includeInactive: params.includeInactive,
        asOfDate: params.balanceDate,
        periodStartDate: new Date(params.balanceDate.getFullYear(), params.balanceDate.getMonth(), 1),
        periodEndDate: params.balanceDate
      });
      
      accountBalances = balances.reduce((acc, bal) => {
        acc[bal.accountId] = bal.currentBalance;
        return acc;
      }, {});
    }
    
    // Build report data
    const reportAccounts = accounts.map(account => ({
      accountId: account._id,
      code: account.code,
      name: account.name,
      displayName: account.displayName,
      type: account.type,
      category: account.category,
      level: account.level,
      path: account.path,
      parentAccount: account.parentAccount?._id,
      isActive: account.isActive,
      isControl: account.isControl,
      currency: account.currency,
      balance: accountBalances[account._id],
      openingBalance: account.openingBalance.amount,
      transactionCount: Math.floor(Math.random() * 100), // Mock data
      lastTransactionDate: new Date() // Mock data
    }));
    
    // Calculate summary
    const summary = this.calculateListingSummary(reportAccounts);
    
    const report: AccountListingReport = {
      reportId,
      name: params.name,
      description: params.description,
      
      configuration: {
        includeHierarchy: params.includeHierarchy ?? true,
        maxDepth: params.maxDepth,
        showBalances: params.showBalances ?? false,
        balanceDate: params.balanceDate || new Date(),
        includeInactive: params.includeInactive ?? false,
        groupByType: params.groupByType ?? false,
        sortBy: params.sortBy || 'code',
        sortOrder: params.sortOrder || 'asc'
      },
      
      data: {
        generatedAt: new Date(),
        totalAccounts: accounts.length,
        activeAccounts: accounts.filter(acc => acc.isActive).length,
        inactiveAccounts: accounts.filter(acc => !acc.isActive).length,
        totalBalance: Object.values(accountBalances).reduce((sum, bal) => sum + bal, 0),
        accounts: reportAccounts,
        summary
      }
    };
    
    return report;
  }
  
  // Generate account activity report
  async generateAccountActivityReport(params: {
    name: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    accountIds?: string[];
    includeSubAccounts?: boolean;
    transactionTypes?: string[];
    minAmount?: number;
    maxAmount?: number;
    includeUnposted?: boolean;
    groupBy?: 'date' | 'account' | 'type' | 'department';
    showRunningBalance?: boolean;
    createdBy: string;
  }): Promise<AccountActivityReport> {
    const reportId = `RPT-ACT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Get transactions (mock implementation)
    const transactions = await this.getAccountTransactions({
      accountIds: params.accountIds,
      startDate: params.startDate,
      endDate: params.endDate,
      transactionTypes: params.transactionTypes,
      minAmount: params.minAmount,
      maxAmount: params.maxAmount,
      includeUnposted: params.includeUnposted
    });
    
    // Calculate summary
    const summary = this.calculateActivitySummary(transactions, params.groupBy);
    
    const report: AccountActivityReport = {
      reportId,
      name: params.name,
      description: params.description,
      
      configuration: {
        dateRange: {
          startDate: params.startDate,
          endDate: params.endDate
        },
        accountIds: params.accountIds,
        includeSubAccounts: params.includeSubAccounts ?? false,
        transactionTypes: params.transactionTypes,
        minAmount: params.minAmount,
        maxAmount: params.maxAmount,
        includeUnposted: params.includeUnposted ?? false,
        groupBy: params.groupBy || 'date',
        showRunningBalance: params.showRunningBalance ?? false
      },
      
      data: {
        generatedAt: new Date(),
        totalTransactions: transactions.length,
        totalDebits: transactions.reduce((sum, tx) => sum + (tx.debit || 0), 0),
        totalCredits: transactions.reduce((sum, tx) => sum + (tx.credit || 0), 0),
        netChange: transactions.reduce((sum, tx) => sum + ((tx.debit || 0) - (tx.credit || 0)), 0),
        transactions,
        summary
      }
    };
    
    return report;
  }
  
  // Generate account reconciliation report
  async generateAccountReconciliationReport(params: {
    name: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    accountIds?: string[];
    includeUnreconciled?: boolean;
    showAdjustments?: boolean;
    varianceThreshold?: number;
    groupByStatus?: boolean;
    createdBy: string;
  }): Promise<AccountReconciliationReport> {
    const reportId = `RPT-REC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Get reconciliations (mock implementation)
    const reconciliations = await this.getAccountReconciliations({
      accountIds: params.accountIds,
      startDate: params.startDate,
      endDate: params.endDate,
      includeUnreconciled: params.includeUnreconciled,
      showAdjustments: params.showAdjustments
    });
    
    // Calculate summary
    const summary = this.calculateReconciliationSummary(reconciliations);
    
    const report: AccountReconciliationReport = {
      reportId,
      name: params.name,
      description: params.description,
      
      configuration: {
        reconciliationPeriod: {
          startDate: params.startDate,
          endDate: params.endDate
        },
        accountIds: params.accountIds,
        includeUnreconciled: params.includeUnreconciled ?? true,
        showAdjustments: params.showAdjustments ?? true,
        varianceThreshold: params.varianceThreshold || 0,
        groupByStatus: params.groupByStatus ?? false
      },
      
      data: {
        generatedAt: new Date(),
        totalAccounts: reconciliations.length,
        reconciledAccounts: reconciliations.filter(rec => rec.status === 'reconciled').length,
        unreconciledAccounts: reconciliations.filter(rec => rec.status !== 'reconciled').length,
        totalVariance: reconciliations.reduce((sum, rec) => sum + Math.abs(rec.variance), 0),
        reconciliations,
        summary
      }
    };
    
    return report;
  }
  
  // Generate account aging report
  async generateAccountAgingReport(params: {
    name: string;
    description?: string;
    asOfDate: Date;
    accountTypes: Array<'accounts-receivable' | 'accounts-payable'>;
    agingBuckets?: Array<{
      name: string;
      days: number;
      color?: string;
    }>;
    includeZeroBalances?: boolean;
    groupByCustomer?: boolean;
    groupByVendor?: boolean;
    currency?: string;
    createdBy: string;
  }): Promise<AccountAgingReport> {
    const reportId = `RPT-AGING-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Default aging buckets
    const defaultBuckets = [
      { name: 'Current', days: 0 },
      { name: '1-30 Days', days: 30 },
      { name: '31-60 Days', days: 60 },
      { name: '61-90 Days', days: 90 },
      { name: '91+ Days', days: 999 }
    ];
    
    const agingBuckets = params.agingBuckets || defaultBuckets;
    
    // Get aging data (mock implementation)
    const agingData = await this.getAgingData({
      asOfDate: params.asOfDate,
      accountTypes: params.accountTypes,
      agingBuckets,
      includeZeroBalances: params.includeZeroBalances,
      groupByCustomer: params.groupByCustomer,
      groupByVendor: params.groupByVendor,
      currency: params.currency || 'USD'
    });
    
    const report: AccountAgingReport = {
      reportId,
      name: params.name,
      description: params.description,
      
      configuration: {
        asOfDate: params.asOfDate,
        accountTypes: params.accountTypes,
        agingBuckets,
        includeZeroBalances: params.includeZeroBalances ?? false,
        groupByCustomer: params.groupByCustomer ?? false,
        groupByVendor: params.groupByVendor ?? false,
        currency: params.currency || 'USD'
      },
      
      data: {
        generatedAt: new Date(),
        totalAmount: agingData.totalAmount,
        totalOverdue: agingData.totalOverdue,
        agingSummary: agingData.agingSummary,
        details: agingData.details,
        summary: agingData.summary
      }
    };
    
    return report;
  }
  
  // Generate account budget report
  async generateAccountBudgetReport(params: {
    name: string;
    description?: string;
    budgetId: string;
    budgetPeriod: {
      startDate: Date;
      endDate: Date;
    };
    accountIds?: string[];
    includeVariance?: boolean;
    includeForecast?: boolean;
    varianceThreshold?: number;
    groupByType?: boolean;
    currency?: string;
    createdBy: string;
  }): Promise<AccountBudgetReport> {
    const reportId = `RPT-BUDGET-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Get budget data (mock implementation)
    const budgetData = await this.getBudgetData({
      budgetId: params.budgetId,
      budgetPeriod: params.budgetPeriod,
      accountIds: params.accountIds,
      includeVariance: params.includeVariance,
      includeForecast: params.includeForecast,
      currency: params.currency || 'USD'
    });
    
    // Calculate summary
    const summary = this.calculateBudgetSummary(budgetData.budgetDetails);
    
    const report: AccountBudgetReport = {
      reportId,
      name: params.name,
      description: params.description,
      
      configuration: {
        budgetId: params.budgetId,
        budgetPeriod: params.budgetPeriod,
        accountIds: params.accountIds,
        includeVariance: params.includeVariance ?? true,
        includeForecast: params.includeForecast ?? false,
        varianceThreshold: params.varianceThreshold || 0,
        groupByType: params.groupByType ?? false,
        currency: params.currency || 'USD'
      },
      
      data: {
        generatedAt: new Date(),
        totalBudget: budgetData.totalBudget,
        totalActual: budgetData.totalActual,
        totalVariance: budgetData.totalVariance,
        variancePercentage: budgetData.variancePercentage,
        budgetDetails: budgetData.budgetDetails,
        summary
      }
    };
    
    return report;
  }
  
  // Create report template
  async createReportTemplate(params: {
    name: string;
    description: string;
    category: 'standard' | 'custom' | 'regulatory' | 'management';
    reportType: 'listing' | 'activity' | 'balance' | 'reconciliation' | 'aging' | 'budget' | 'custom';
    defaultFilters?: Record<string, any>;
    defaultGrouping?: Record<string, any>;
    defaultSorting?: Record<string, any>;
    defaultColumns?: Array<{
      field: string;
      label: string;
      width?: number;
      format?: string;
      visible: boolean;
      order: number;
    }>;
    defaultFormatting?: Record<string, any>;
    layout?: {
      header?: any;
      sections?: Array<{
        name: string;
        type: 'table' | 'chart' | 'summary' | 'text';
        configuration: any;
        order: number;
      }>;
      footer?: any;
    };
    tags?: string[];
    createdBy: string;
  }): Promise<AccountReportTemplate> {
    const templateId = `TPL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const template: AccountReportTemplate = {
      templateId,
      name: params.name,
      description: params.description,
      category: params.category,
      
      configuration: {
        reportType: params.reportType,
        defaultFilters: params.defaultFilters || {},
        defaultGrouping: params.defaultGrouping || {},
        defaultSorting: params.defaultSorting || {},
        defaultColumns: params.defaultColumns || this.getDefaultColumns(params.reportType),
        defaultFormatting: {
          currency: 'USD',
          decimalPlaces: 2,
          showThousandsSeparator: true,
          dateFormat: 'MM/DD/YYYY',
          numberFormat: '#,##0.00',
          ...params.defaultFormatting
        }
      },
      
      layout: {
        header: {
          title: params.name,
          subtitle: params.description,
          ...params.layout?.header
        },
        sections: params.layout?.sections || [{
          name: 'Main Report',
          type: 'table',
          configuration: {},
          order: 1
        }],
        footer: {
          pageNumber: true,
          generatedDate: true,
          ...params.layout?.footer
        }
      },
      
      usage: {
        totalUses: 0,
        reviews: []
      },
      
      status: 'active',
      
      metadata: {
        createdAt: new Date(),
        createdBy: params.createdBy,
        updatedAt: new Date(),
        updatedBy: params.createdBy,
        version: 1,
        tags: params.tags || []
      }
    };
    
    // Save template
    await this.saveReportTemplate(template);
    
    return template;
  }
  
  // Helper methods
  private buildSortObject(sortBy: string, sortOrder: string): Record<string, 1 | -1> {
    return { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
  }
  
  private calculateListingSummary(accounts: any[]): any {
    const summary = {
      byType: {} as Record<string, { count: number; totalBalance: number }>,
      byCategory: {} as Record<string, { count: number; totalBalance: number }>,
      byLevel: {} as Record<string, { count: number; totalBalance: number }>
    };
    
    for (const account of accounts) {
      // By type
      if (!summary.byType[account.type]) {
        summary.byType[account.type] = { count: 0, totalBalance: 0 };
      }
      summary.byType[account.type].count++;
      summary.byType[account.type].totalBalance += account.balance || 0;
      
      // By category
      if (!summary.byCategory[account.category]) {
        summary.byCategory[account.category] = { count: 0, totalBalance: 0 };
      }
      summary.byCategory[account.category].count++;
      summary.byCategory[account.category].totalBalance += account.balance || 0;
      
      // By level
      if (!summary.byLevel[account.level]) {
        summary.byLevel[account.level] = { count: 0, totalBalance: 0 };
      }
      summary.byLevel[account.level].count++;
      summary.byLevel[account.level].totalBalance += account.balance || 0;
    }
    
    return summary;
  }
  
  private calculateActivitySummary(transactions: any[], groupBy?: string): any {
    const summary = {
      byAccount: {} as Record<string, any>,
      byDate: {} as Record<string, any>,
      byType: {} as Record<string, any>
    };
    
    for (const tx of transactions) {
      // By account
      if (!summary.byAccount[tx.accountId]) {
        summary.byAccount[tx.accountId] = {
          transactionCount: 0,
          totalDebits: 0,
          totalCredits: 0,
          netChange: 0
        };
      }
      summary.byAccount[tx.accountId].transactionCount++;
      summary.byAccount[tx.accountId].totalDebits += tx.debit || 0;
      summary.byAccount[tx.accountId].totalCredits += tx.credit || 0;
      summary.byAccount[tx.accountId].netChange += (tx.debit || 0) - (tx.credit || 0);
      
      // By date
      const dateKey = tx.date.toISOString().split('T')[0];
      if (!summary.byDate[dateKey]) {
        summary.byDate[dateKey] = {
          transactionCount: 0,
          totalDebits: 0,
          totalCredits: 0,
          netChange: 0
        };
      }
      summary.byDate[dateKey].transactionCount++;
      summary.byDate[dateKey].totalDebits += tx.debit || 0;
      summary.byDate[dateKey].totalCredits += tx.credit || 0;
      summary.byDate[dateKey].netChange += (tx.debit || 0) - (tx.credit || 0);
    }
    
    return summary;
  }
  
  private calculateReconciliationSummary(reconciliations: any[]): any {
    const summary = {
      byStatus: {} as Record<string, { count: number; totalVariance: number }>,
      byAccountType: {} as Record<string, any>,
      topVariances: [] as any[]
    };
    
    for (const rec of reconciliations) {
      // By status
      if (!summary.byStatus[rec.status]) {
        summary.byStatus[rec.status] = { count: 0, totalVariance: 0 };
      }
      summary.byStatus[rec.status].count++;
      summary.byStatus[rec.status].totalVariance += Math.abs(rec.variance);
    }
    
    // Top variances
    summary.topVariances = reconciliations
      .map(rec => ({
        accountId: rec.accountId,
        accountName: rec.accountName,
        variance: rec.variance,
        variancePercentage: rec.variancePercentage
      }))
      .sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance))
      .slice(0, 10);
    
    return summary;
  }
  
  private calculateBudgetSummary(budgetDetails: any[]): any {
    const summary = {
      byType: {} as Record<string, any>,
      byStatus: {} as Record<string, any>,
      topVariances: [] as any[]
    };
    
    for (const detail of budgetDetails) {
      // By type
      if (!summary.byType[detail.accountType]) {
        summary.byType[detail.accountType] = {
          budget: 0,
          actual: 0,
          variance: 0,
          variancePercentage: 0
        };
      }
      summary.byType[detail.accountType].budget += detail.budgetAmount;
      summary.byType[detail.accountType].actual += detail.actualAmount;
      summary.byType[detail.accountType].variance += detail.variance;
      summary.byType[detail.accountType].variancePercentage = 
        summary.byType[detail.accountType].budget > 0 
          ? (summary.byType[detail.accountType].variance / summary.byType[detail.accountType].budget) * 100
          : 0;
      
      // By status
      if (!summary.byStatus[detail.status]) {
        summary.byStatus[detail.status] = {
          count: 0,
          totalBudget: 0,
          totalActual: 0,
          totalVariance: 0
        };
      }
      summary.byStatus[detail.status].count++;
      summary.byStatus[detail.status].totalBudget += detail.budgetAmount;
      summary.byStatus[detail.status].totalActual += detail.actualAmount;
      summary.byStatus[detail.status].totalVariance += detail.variance;
    }
    
    // Top variances
    summary.topVariances = budgetDetails
      .map(detail => ({
        accountId: detail.accountId,
        accountName: detail.accountName,
        variance: detail.variance,
        variancePercentage: detail.variancePercentage
      }))
      .sort((a, b) => Math.abs(b.variancePercentage) - Math.abs(a.variancePercentage))
      .slice(0, 10);
    
    return summary;
  }
  
  private getDefaultColumns(reportType: string): Array<any> {
    const commonColumns = [
      { field: 'code', label: 'Code', width: 100, visible: true, order: 1 },
      { field: 'name', label: 'Name', width: 200, visible: true, order: 2 },
      { field: 'type', label: 'Type', width: 100, visible: true, order: 3 }
    ];
    
    switch (reportType) {
      case 'listing':
        return [
          ...commonColumns,
          { field: 'category', label: 'Category', width: 120, visible: true, order: 4 },
          { field: 'balance', label: 'Balance', width: 120, format: 'currency', visible: true, order: 5 }
        ];
      case 'activity':
        return [
          { field: 'date', label: 'Date', width: 100, format: 'date', visible: true, order: 1 },
          { field: 'accountName', label: 'Account', width: 150, visible: true, order: 2 },
          { field: 'description', label: 'Description', width: 200, visible: true, order: 3 },
          { field: 'debit', label: 'Debit', width: 100, format: 'currency', visible: true, order: 4 },
          { field: 'credit', label: 'Credit', width: 100, format: 'currency', visible: true, order: 5 }
        ];
      default:
        return commonColumns;
    }
  }
  
  // Mock data methods
  private async getAccountTransactions(params: any): Promise<any[]> {
    // Mock implementation
    return [
      {
        transactionId: 'tx1',
        date: new Date(),
        accountId: 'acc1',
        accountCode: '1000',
        accountName: 'Cash',
        description: 'Sample transaction',
        debit: 1000,
        credit: 0,
        reference: 'REF001',
        entryNumber: 'JE-001',
        status: 'posted',
        createdBy: 'user1'
      }
    ];
  }
  
  private async getAccountReconciliations(params: any): Promise<any[]> {
    // Mock implementation
    return [
      {
        accountId: 'acc1',
        accountCode: '1000',
        accountName: 'Cash',
        systemBalance: 10000,
        statementBalance: 10000,
        variance: 0,
        variancePercentage: 0,
        status: 'reconciled',
        reconciledDate: new Date(),
        reconciledBy: 'user1',
        adjustments: [],
        unreconciledItems: []
      }
    ];
  }
  
  private async getAgingData(params: any): Promise<any> {
    // Mock implementation
    return {
      totalAmount: 50000,
      totalOverdue: 5000,
      agingSummary: [
        { bucketName: 'Current', amount: 45000, percentage: 90, count: 10 },
        { bucketName: '1-30 Days', amount: 3000, percentage: 6, count: 2 },
        { bucketName: '31-60 Days', amount: 1500, percentage: 3, count: 1 },
        { bucketName: '61-90 Days', amount: 300, percentage: 0.6, count: 1 },
        { bucketName: '91+ Days', amount: 200, percentage: 0.4, count: 1 }
      ],
      details: [],
      summary: {
        byCustomer: {},
        byVendor: {}
      }
    };
  }
  
  private async getBudgetData(params: any): Promise<any> {
    // Mock implementation
    return {
      totalBudget: 100000,
      totalActual: 95000,
      totalVariance: -5000,
      variancePercentage: -5,
      budgetDetails: [
        {
          accountId: 'acc1',
          accountCode: '5000',
          accountName: 'Operating Expenses',
          accountType: 'expense',
          budgetAmount: 50000,
          actualAmount: 48000,
          variance: -2000,
          variancePercentage: -4,
          status: 'under'
        }
      ]
    };
  }
  
  // Database operations (mock implementations)
  private async saveReportTemplate(template: AccountReportTemplate): Promise<void> {
    console.log(`Saving report template ${template.templateId}`);
  }
}
