import { Account, IAccount } from '../models/Account';
import { User } from '../models/User';

export interface AccountCreateRequest {
  code?: string;
  name: string;
  displayName: string;
  description?: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense' | 'contra-asset' | 'contra-liability' | 'contra-equity';
  subtype?: string;
  category: string;
  parentAccount?: string;
  currency?: string;
  allowForeignCurrency?: boolean;
  taxRelevant?: boolean;
  taxCode?: string;
  openingBalance?: {
    date: Date;
    amount: number;
    source?: string;
  };
  restrictions?: {
    viewRoles?: string[];
    editRoles?: string[];
    deleteRoles?: string[];
  };
  settings?: {
    allowManualEntry?: boolean;
    requireApproval?: boolean;
    approvalThreshold?: number;
    autoReconcile?: boolean;
    departmentRequired?: boolean;
    projectRequired?: boolean;
    locationRequired?: boolean;
    allowNegativeBalance?: boolean;
    minimumBalance?: number;
    maximumBalance?: number;
  };
  reporting?: {
    includeInBalanceSheet?: boolean;
    includeInProfitLoss?: boolean;
    includeInCashFlow?: boolean;
    balanceSheetOrder?: number;
    profitLossOrder?: number;
    cashFlowCategory?: 'operating' | 'investing' | 'financing';
    consolidationMethod?: 'full' | 'equity' | 'proportionate';
  };
  budgeting?: {
    enableBudgeting?: boolean;
    budgetPeriod?: 'monthly' | 'quarterly' | 'annually';
    budgetAlerts?: boolean;
    varianceThreshold?: number;
    budgetApprovals?: boolean;
  };
  tags?: string[];
  notes?: string;
  createdBy: string;
}

export interface AccountUpdateRequest {
  name?: string;
  displayName?: string;
  description?: string;
  subtype?: string;
  category?: string;
  currency?: string;
  allowForeignCurrency?: boolean;
  taxRelevant?: boolean;
  taxCode?: string;
  isActive?: boolean;
  restrictions?: {
    viewRoles?: string[];
    editRoles?: string[];
    deleteRoles?: string[];
  };
  settings?: {
    allowManualEntry?: boolean;
    requireApproval?: boolean;
    approvalThreshold?: number;
    autoReconcile?: boolean;
    departmentRequired?: boolean;
    projectRequired?: boolean;
    locationRequired?: boolean;
    allowNegativeBalance?: boolean;
    minimumBalance?: number;
    maximumBalance?: number;
  };
  reporting?: {
    includeInBalanceSheet?: boolean;
    includeInProfitLoss?: boolean;
    includeInCashFlow?: boolean;
    balanceSheetOrder?: number;
    profitLossOrder?: number;
    cashFlowCategory?: 'operating' | 'investing' | 'financing';
    consolidationMethod?: 'full' | 'equity' | 'proportionate';
  };
  budgeting?: {
    enableBudgeting?: boolean;
    budgetPeriod?: 'monthly' | 'quarterly' | 'annually';
    budgetAlerts?: boolean;
    varianceThreshold?: number;
    budgetApprovals?: boolean;
  };
  tags?: string[];
  notes?: string;
  updatedBy: string;
  reason?: string;
}

export interface AccountBalance {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  currency: string;
  openingBalance: number;
  currentBalance: number;
  periodBalance: number;
  debitTotal: number;
  creditTotal: number;
  lastTransactionDate?: Date;
  transactionCount: number;
  asOfDate: Date;
}

export interface AccountHierarchy {
  _id: string;
  code: string;
  name: string;
  displayName: string;
  type: string;
  category: string;
  level: number;
  path: string;
  isActive: boolean;
  isControl: boolean;
  currentBalance: number;
  children: AccountHierarchy[];
}

export interface AccountAnalytics {
  totalAccounts: number;
  activeAccounts: number;
  inactiveAccounts: number;
  controlAccounts: number;
  accountsByType: Record<string, number>;
  accountsByCategory: Record<string, number>;
  accountsByLevel: Record<string, number>;
  topLevelAccounts: number;
  deepestLevel: number;
  accountsWithTransactions: number;
  accountsWithZeroBalance: number;
  averageBalance: number;
  totalBalance: number;
}

export class AccountService {
  // Create account
  async createAccount(params: AccountCreateRequest): Promise<IAccount> {
    // Validate user
    const user = await User.findById(params.createdBy);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Generate account code if not provided
    let accountCode = params.code;
    if (!accountCode) {
      accountCode = await Account.generateAccountCode(params.type, params.parentAccount);
    } else {
      // Validate code uniqueness
      const existingAccount = await Account.findByCode(accountCode);
      if (existingAccount) {
        throw new Error('Account code already exists');
      }
    }
    
    // Validate parent account if specified
    if (params.parentAccount) {
      const parentAccount = await Account.findById(params.parentAccount);
      if (!parentAccount) {
        throw new Error('Parent account not found');
      }
      
      // Validate hierarchy
      const isValidHierarchy = await Account.validateAccountHierarchy(
        'new', // Since this is a new account, we don't have an ID yet
        params.parentAccount
      );
      
      if (!isValidHierarchy) {
        throw new Error('Invalid account hierarchy - would create circular reference');
      }
    }
    
    // Create account
    const account = new Account({
      code: accountCode,
      name: params.name,
      displayName: params.displayName,
      description: params.description,
      type: params.type,
      subtype: params.subtype,
      category: params.category,
      parentAccount: params.parentAccount,
      currency: params.currency || 'USD',
      allowForeignCurrency: params.allowForeignCurrency || false,
      taxRelevant: params.taxRelevant || false,
      taxCode: params.taxCode,
      openingBalance: params.openingBalance || {
        date: new Date(),
        amount: 0,
        source: 'Initial setup'
      },
      restrictions: {
        viewRoles: params.restrictions?.viewRoles || [],
        editRoles: params.restrictions?.editRoles || [],
        deleteRoles: params.restrictions?.deleteRoles || []
      },
      settings: {
        allowManualEntry: params.settings?.allowManualEntry ?? true,
        requireApproval: params.settings?.requireApproval ?? false,
        approvalThreshold: params.settings?.approvalThreshold,
        autoReconcile: params.settings?.autoReconcile ?? false,
        departmentRequired: params.settings?.departmentRequired ?? false,
        projectRequired: params.settings?.projectRequired ?? false,
        locationRequired: params.settings?.locationRequired ?? false,
        allowNegativeBalance: params.settings?.allowNegativeBalance ?? true,
        minimumBalance: params.settings?.minimumBalance,
        maximumBalance: params.settings?.maximumBalance
      },
      reporting: {
        includeInBalanceSheet: params.reporting?.includeInBalanceSheet,
        includeInProfitLoss: params.reporting?.includeInProfitLoss,
        includeInCashFlow: params.reporting?.includeInCashFlow ?? true,
        balanceSheetOrder: params.reporting?.balanceSheetOrder,
        profitLossOrder: params.reporting?.profitLossOrder,
        cashFlowCategory: params.reporting?.cashFlowCategory || 'operating',
        consolidationMethod: params.reporting?.consolidationMethod || 'full'
      },
      budgeting: {
        enableBudgeting: params.budgeting?.enableBudgeting ?? true,
        budgetPeriod: params.budgeting?.budgetPeriod || 'monthly',
        budgetAlerts: params.budgeting?.budgetAlerts ?? true,
        varianceThreshold: params.budgeting?.varianceThreshold || 10,
        budgetApprovals: params.budgeting?.budgetApprovals ?? false
      },
      metadata: {
        createdBy: params.createdBy,
        updatedBy: params.createdBy,
        tags: params.tags || [],
        notes: params.notes
      }
    });
    
    // Add initial audit trail entry
    account.addAuditTrail('created', params.createdBy, 'Account created');
    
    // Save account
    await account.save();
    
    // Send notifications if needed
    await this.sendAccountNotifications(account, 'created');
    
    return account;
  }
  
  // Update account
  async updateAccount(accountId: string, params: AccountUpdateRequest): Promise<IAccount> {
    const account = await Account.findById(accountId);
    if (!account) {
      throw new Error('Account not found');
    }
    
    // Check if account can be updated
    if (account.isSystem) {
      throw new Error('System accounts cannot be modified');
    }
    
    // Store previous values for audit trail
    const previousValues = {
      name: account.name,
      displayName: account.displayName,
      description: account.description,
      subtype: account.subtype,
      category: account.category,
      currency: account.currency,
      allowForeignCurrency: account.allowForeignCurrency,
      taxRelevant: account.taxRelevant,
      taxCode: account.taxCode,
      isActive: account.isActive
    };
    
    // Update fields
    if (params.name !== undefined) account.name = params.name;
    if (params.displayName !== undefined) account.displayName = params.displayName;
    if (params.description !== undefined) account.description = params.description;
    if (params.subtype !== undefined) account.subtype = params.subtype;
    if (params.category !== undefined) account.category = params.category;
    if (params.currency !== undefined) account.currency = params.currency;
    if (params.allowForeignCurrency !== undefined) account.allowForeignCurrency = params.allowForeignCurrency;
    if (params.taxRelevant !== undefined) account.taxRelevant = params.taxRelevant;
    if (params.taxCode !== undefined) account.taxCode = params.taxCode;
    if (params.isActive !== undefined) account.isActive = params.isActive;
    
    // Update restrictions
    if (params.restrictions) {
      if (params.restrictions.viewRoles !== undefined) account.restrictions.viewRoles = params.restrictions.viewRoles;
      if (params.restrictions.editRoles !== undefined) account.restrictions.editRoles = params.restrictions.editRoles;
      if (params.restrictions.deleteRoles !== undefined) account.restrictions.deleteRoles = params.restrictions.deleteRoles;
    }
    
    // Update settings
    if (params.settings) {
      Object.assign(account.settings, params.settings);
    }
    
    // Update reporting
    if (params.reporting) {
      Object.assign(account.reporting, params.reporting);
    }
    
    // Update budgeting
    if (params.budgeting) {
      Object.assign(account.budgeting, params.budgeting);
    }
    
    // Update metadata
    if (params.tags !== undefined) account.metadata.tags = params.tags;
    if (params.notes !== undefined) account.metadata.notes = params.notes;
    account.metadata.updatedBy = params.updatedBy;
    account.metadata.version += 1;
    
    // Add audit trail entry
    account.addAuditTrail('updated', params.updatedBy, params.reason, previousValues, {
      name: account.name,
      displayName: account.displayName,
      description: account.description,
      subtype: account.subtype,
      category: account.category,
      currency: account.currency,
      allowForeignCurrency: account.allowForeignCurrency,
      taxRelevant: account.taxRelevant,
      taxCode: account.taxCode,
      isActive: account.isActive
    });
    
    // Save account
    await account.save();
    
    // Send notifications if needed
    await this.sendAccountNotifications(account, 'updated');
    
    return account;
  }
  
  // Deactivate account
  async deactivateAccount(accountId: string, userId: string, reason?: string): Promise<IAccount> {
    const account = await Account.findById(accountId);
    if (!account) {
      throw new Error('Account not found');
    }
    
    if (account.isSystem) {
      throw new Error('System accounts cannot be deactivated');
    }
    
    if (!account.isActive) {
      throw new Error('Account is already inactive');
    }
    
    // Check if account has children
    const children = await Account.find({ parentAccount: accountId, isActive: true });
    if (children.length > 0) {
      throw new Error('Cannot deactivate account with active child accounts');
    }
    
    // Check if account has recent transactions
    const hasRecentTransactions = await this.hasRecentTransactions(accountId);
    if (hasRecentTransactions) {
      throw new Error('Cannot deactivate account with recent transactions');
    }
    
    account.isActive = false;
    account.metadata.updatedBy = userId;
    account.metadata.version += 1;
    
    account.addAuditTrail('deactivated', userId, reason);
    
    await account.save();
    
    await this.sendAccountNotifications(account, 'deactivated');
    
    return account;
  }
  
  // Get account by ID
  async getAccountById(accountId: string): Promise<IAccount | null> {
    return await Account.findById(accountId).populate('parentAccount', 'code displayName');
  }
  
  // Get account by code
  async getAccountByCode(code: string): Promise<IAccount | null> {
    return await Account.findByCode(code);
  }
  
  // List accounts
  async listAccounts(params: {
    type?: string;
    category?: string;
    subtype?: string;
    isActive?: boolean;
    parentAccount?: string;
    level?: number;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    accounts: IAccount[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const {
      type,
      category,
      subtype,
      isActive,
      parentAccount,
      level,
      search,
      page = 1,
      limit = 50,
      sortBy = 'code',
      sortOrder = 'asc'
    } = params;
    
    // Build query
    const query: any = {};
    
    if (type) query.type = type;
    if (category) query.category = category;
    if (subtype) query.subtype = subtype;
    if (isActive !== undefined) query.isActive = isActive;
    if (parentAccount) query.parentAccount = parentAccount;
    if (level) query.level = level;
    
    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { displayName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Execute query
    const skip = (page - 1) * limit;
    const [accounts, total] = await Promise.all([
      Account.find(query)
        .populate('parentAccount', 'code displayName')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Account.countDocuments(query)
    ]);
    
    return {
      accounts,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }
  
  // Get chart of accounts
  async getChartOfAccounts(params?: {
    includeInactive?: boolean;
    type?: string;
    category?: string;
    level?: number;
  }): Promise<IAccount[]> {
    const query: any = {};
    
    if (!params?.includeInactive) {
      query.isActive = true;
    }
    
    if (params?.type) query.type = params.type;
    if (params?.category) query.category = params.category;
    if (params?.level) query.level = params.level;
    
    return await Account.find(query)
      .populate('parentAccount', 'code displayName')
      .sort({ code: 1 });
  }
  
  // Get account hierarchy
  async getAccountHierarchy(params?: {
    includeInactive?: boolean;
    type?: string;
    category?: string;
    includeBalances?: boolean;
    asOfDate?: Date;
  }): Promise<AccountHierarchy[]> {
    const query: any = {};
    
    if (!params?.includeInactive) {
      query.isActive = true;
    }
    
    if (params?.type) query.type = params.type;
    if (params?.category) query.category = params.category;
    
    const roots = await Account.find({ ...query, parentAccount: { $exists: false } })
      .populate('parentAccount', 'code displayName')
      .sort({ code: 1 });
    
    const hierarchy = [];
    
    for (const root of roots) {
      const node = await this.buildHierarchyNode(root, params);
      hierarchy.push(node);
    }
    
    return hierarchy;
  }
  
  // Get account balances
  async getAccountBalances(params: {
    accountIds?: string[];
    type?: string;
    category?: string;
    asOfDate: Date;
    includeZeroBalances?: boolean;
  }): Promise<AccountBalance[]> {
    const {
      accountIds,
      type,
      category,
      asOfDate,
      includeZeroBalances = true
    } = params;
    
    const query: any = { isActive: true };
    
    if (accountIds && accountIds.length > 0) {
      query._id = { $in: accountIds };
    }
    
    if (type) query.type = type;
    if (category) query.category = category;
    
    const accounts = await Account.find(query).sort({ code: 1 });
    
    const balances = [];
    
    for (const account of accounts) {
      const balance = await this.calculateAccountBalance(account._id, asOfDate);
      
      if (!includeZeroBalances && balance.currentBalance === 0) {
        continue;
      }
      
      balances.push({
        accountId: account._id,
        accountCode: account.code,
        accountName: account.displayName,
        accountType: account.type,
        currency: account.currency,
        openingBalance: account.openingBalance.amount,
        currentBalance: balance.currentBalance,
        periodBalance: balance.periodBalance,
        debitTotal: balance.debitTotal,
        creditTotal: balance.creditTotal,
        lastTransactionDate: balance.lastTransactionDate,
        transactionCount: balance.transactionCount,
        asOfDate
      });
    }
    
    return balances;
  }
  
  // Get account analytics
  async getAccountAnalytics(): Promise<AccountAnalytics> {
    const [
      totalAccounts,
      activeAccounts,
      inactiveAccounts,
      controlAccounts,
      accountsByType,
      accountsByCategory,
      accountsByLevel
    ] = await Promise.all([
      Account.countDocuments(),
      Account.countDocuments({ isActive: true }),
      Account.countDocuments({ isActive: false }),
      Account.countDocuments({ isControl: true }),
      this.getAccountsByType(),
      this.getAccountsByCategory(),
      this.getAccountsByLevel()
    ]);
    
    const topLevelAccounts = await Account.countDocuments({ level: 1 });
    const deepestLevel = await Account.aggregate([
      { $group: { _id: null, maxLevel: { $max: '$level' } } }
    ]).then(result => result[0]?.maxLevel || 0);
    
    // Get balance statistics (mock for now)
    const accountsWithTransactions = await Account.countDocuments({ 
      'metadata.tags': 'has-transactions' 
    });
    const accountsWithZeroBalance = await Account.countDocuments({ 
      'metadata.tags': 'zero-balance' 
    });
    
    return {
      totalAccounts,
      activeAccounts,
      inactiveAccounts,
      controlAccounts,
      accountsByType,
      accountsByCategory,
      accountsByLevel,
      topLevelAccounts,
      deepestLevel,
      accountsWithTransactions,
      accountsWithZeroBalance,
      averageBalance: 0, // Would calculate from actual balances
      totalBalance: 0 // Would calculate from actual balances
    };
  }
  
  // Helper methods
  private async buildHierarchyNode(account: IAccount, params?: any): Promise<AccountHierarchy> {
    const children = await Account.find({ parentAccount: account._id, isActive: true })
      .populate('parentAccount', 'code displayName')
      .sort({ code: 1 });
    
    const childNodes = [];
    
    for (const child of children) {
      const childNode = await this.buildHierarchyNode(child, params);
      childNodes.push(childNode);
    }
    
    const currentBalance = params?.includeBalances 
      ? await this.calculateAccountBalance(account._id, params?.asOfDate || new Date())
      : { currentBalance: 0 };
    
    return {
      _id: account._id,
      code: account.code,
      name: account.name,
      displayName: account.displayName,
      type: account.type,
      category: account.category,
      level: account.level,
      path: account.path,
      isActive: account.isActive,
      isControl: account.isControl,
      currentBalance: currentBalance.currentBalance,
      children: childNodes
    };
  }
  
  private async calculateAccountBalance(accountId: string, asOfDate: Date): Promise<{
    currentBalance: number;
    periodBalance: number;
    debitTotal: number;
    creditTotal: number;
    lastTransactionDate?: Date;
    transactionCount: number;
  }> {
    // Mock implementation - would query actual transactions
    return {
      currentBalance: Math.random() * 10000,
      periodBalance: Math.random() * 5000,
      debitTotal: Math.random() * 7500,
      creditTotal: Math.random() * 7500,
      lastTransactionDate: new Date(),
      transactionCount: Math.floor(Math.random() * 100)
    };
  }
  
  private async hasRecentTransactions(accountId: string): Promise<boolean> {
    // Mock implementation - would check actual transactions
    return false;
  }
  
  private async getAccountsByType(): Promise<Record<string, number>> {
    const result = await Account.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    
    return result.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});
  }
  
  private async getAccountsByCategory(): Promise<Record<string, number>> {
    const result = await Account.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    return result.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});
  }
  
  private async getAccountsByLevel(): Promise<Record<string, number>> {
    const result = await Account.aggregate([
      { $group: { _id: '$level', count: { $sum: 1 } } }
    ]);
    
    return result.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});
  }
  
  private async sendAccountNotifications(account: IAccount, action: string): Promise<void> {
    // Mock notification implementation
    console.log(`Sending ${action} notification for account ${account.code}`);
  }
}
