import { Account, IAccount } from '../models/Account';
import { User } from '../models/User';
import { AccountService } from './accountService';

export interface AccountTemplate {
  templateId: string;
  name: string;
  description: string;
  category: 'standard' | 'industry' | 'custom' | 'country-specific';
  
  // Template Configuration
  configuration: {
    baseCurrency: string;
    accountTypes: string[];
    maxLevels: number;
    codeFormat: string; // e.g., "XXXX-XX", "XXXX-XX-XXX"
    startCodes: Record<string, number>; // starting code for each account type
  };
  
  // Account Structure
  accounts: Array<{
    code: string;
    name: string;
    displayName: string;
    description?: string;
    type: string;
    subtype?: string;
    category: string;
    parentCode?: string;
    normalBalance: 'debit' | 'credit';
    isActive: boolean;
    isSystem: boolean;
    isControl: boolean;
    openingBalance?: {
      amount: number;
      source: string;
    };
    settings?: {
      allowManualEntry?: boolean;
      requireApproval?: boolean;
      autoReconcile?: boolean;
      departmentRequired?: boolean;
      projectRequired?: boolean;
      locationRequired?: boolean;
    };
    reporting?: {
      includeInBalanceSheet?: boolean;
      includeInProfitLoss?: boolean;
      includeInCashFlow?: boolean;
      balanceSheetOrder?: number;
      profitLossOrder?: number;
      cashFlowCategory?: 'operating' | 'investing' | 'financing';
    };
    budgeting?: {
      enableBudgeting?: boolean;
      budgetPeriod?: 'monthly' | 'quarterly' | 'annually';
      budgetAlerts?: boolean;
      varianceThreshold?: number;
    };
  }>;
  
  // Validation Rules
  validation: {
    requiredAccounts: string[];
    forbiddenCombinations: Array<{
      type: string;
      category: string;
      reason: string;
    }>;
    balanceSheetRules: {
      mustBalance: boolean;
      requiredSections: string[];
    };
  };
  
  // Usage Statistics
  usage: {
    totalInstallations: number;
    lastUsed?: Date;
    rating?: number;
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

export interface AccountCreationRequest {
  name: string;
  description: string;
  method: 'manual' | 'template' | 'import' | 'clone';
  
  // Template Method
  templateId?: string;
  customizations?: {
    baseCurrency?: string;
    accountTypes?: string[];
    excludeAccounts?: string[];
    modifyAccounts?: Array<{
      code: string;
      changes: Partial<IAccount>;
    }>;
  };
  
  // Manual Method
  accounts?: Array<{
    code: string;
    name: string;
    displayName: string;
    description?: string;
    type: string;
    subtype?: string;
    category: string;
    parentCode?: string;
    currency?: string;
    allowForeignCurrency?: boolean;
    taxRelevant?: boolean;
    taxCode?: string;
    openingBalance?: {
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
  }>;
  
  // Import Method
  importData?: {
    format: 'csv' | 'excel' | 'json' | 'xml';
    fileUrl?: string;
    fileData?: string;
    mapping: Record<string, string>; // field mapping
    options: {
      skipHeader?: boolean;
      validateOnly?: boolean;
      updateExisting?: boolean;
      generateCodes?: boolean;
    };
  };
  
  // Clone Method
  sourceEntityId?: string;
  cloneOptions?: {
    includeBalances?: boolean;
    includeSettings?: boolean;
    includeRestrictions?: boolean;
    newBaseCurrency?: string;
  };
  
  // Common Options
  options: {
    validateBeforeCreate?: boolean;
    requireApproval?: boolean;
    approvers?: string[];
    dryRun?: boolean;
    notifications?: {
      enabled: boolean;
      recipients: string[];
    };
  };
  
  createdBy: string;
}

export interface AccountCreationResult {
  requestId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: {
    total: number;
    completed: number;
    failed: number;
    percentage: number;
  };
  
  createdAccounts: Array<{
    accountId: string;
    code: string;
    name: string;
    status: 'created' | 'updated' | 'failed';
    error?: string;
  }>;
  
  validationResults?: {
    isValid: boolean;
    errors: Array<{
      type: 'error' | 'warning';
      code: string;
      message: string;
      account?: string;
    }>;
    warnings: Array<{
      code: string;
      message: string;
      account?: string;
    }>;
  };
  
  summary: {
    totalAccounts: number;
    createdCount: number;
    updatedCount: number;
    failedCount: number;
    processingTime: number; // milliseconds
  };
  
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  
  startedAt?: Date;
  completedAt?: Date;
}

export interface AccountApprovalRequest {
  requestId: string;
  name: string;
  description: string;
  type: 'account_creation' | 'account_modification' | 'account_deletion';
  
  // Request Details
  requestedBy: string;
  requestedAt: Date;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  
  // Account Changes
  changes: {
    method: string;
    accountCount: number;
    accountDetails: Array<{
      action: 'create' | 'update' | 'delete';
      code?: string;
      name?: string;
      type?: string;
      changes?: Record<string, any>;
    }>;
  };
  
  // Validation Results
  validation: {
    isValid: boolean;
    errors: Array<{
      code: string;
      message: string;
      severity: 'error' | 'warning';
    }>;
    warnings: Array<{
      code: string;
      message: string;
    }>;
  };
  
  // Approval Workflow
  workflow: {
    currentStep: number;
    totalSteps: number;
    approvers: Array<{
      userId: string;
      role: string;
      status: 'pending' | 'approved' | 'rejected';
      decisionAt?: Date;
      comments?: string;
    }>;
    rules: Array<{
      condition: string;
      approvers: string[];
      order: number;
    }>;
  };
  
  // Status
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  
  // Resolution
  resolvedBy?: string;
  resolvedAt?: Date;
  resolutionComments?: string;
  
  // Implementation
  implementationStatus: 'pending' | 'in_progress' | 'completed' | 'failed';
  implementationResults?: AccountCreationResult;
  
  // Metadata
  metadata: {
    createdAt: Date;
    updatedAt: Date;
  };
}

export class ChartOfAccountsService {
  private accountService: AccountService;
  
  constructor() {
    this.accountService = new AccountService();
  }
  
  // Create account template
  async createAccountTemplate(params: {
    name: string;
    description: string;
    category: 'standard' | 'industry' | 'custom' | 'country-specific';
    configuration: {
      baseCurrency: string;
      accountTypes: string[];
      maxLevels: number;
      codeFormat: string;
      startCodes: Record<string, number>;
    };
    accounts: Array<{
      code: string;
      name: string;
      displayName: string;
      description?: string;
      type: string;
      subtype?: string;
      category: string;
      parentCode?: string;
      normalBalance: 'debit' | 'credit';
      isActive: boolean;
      isSystem: boolean;
      isControl: boolean;
      openingBalance?: {
        amount: number;
        source: string;
      };
      settings?: any;
      reporting?: any;
      budgeting?: any;
    }>;
    validation?: {
      requiredAccounts?: string[];
      forbiddenCombinations?: Array<{
        type: string;
        category: string;
        reason: string;
      }>;
      balanceSheetRules?: {
        mustBalance: boolean;
        requiredSections: string[];
      };
    };
    tags?: string[];
    createdBy: string;
  }): Promise<AccountTemplate> {
    const templateId = `TEMPLATE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const template: AccountTemplate = {
      templateId,
      name: params.name,
      description: params.description,
      category: params.category,
      
      configuration: params.configuration,
      
      accounts: params.accounts,
      
      validation: {
        requiredAccounts: params.validation?.requiredAccounts || [],
        forbiddenCombinations: params.validation?.forbiddenCombinations || [],
        balanceSheetRules: {
          mustBalance: true,
          requiredSections: ['Assets', 'Liabilities', 'Equity'],
          ...params.validation?.balanceSheetRules
        }
      },
      
      usage: {
        totalInstallations: 0,
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
    
    // Validate template
    await this.validateAccountTemplate(template);
    
    // Save template
    await this.saveAccountTemplate(template);
    
    return template;
  }
  
  // Create accounts from request
  async createAccounts(request: AccountCreationRequest): Promise<AccountCreationResult> {
    const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const result: AccountCreationResult = {
      requestId,
      status: 'pending',
      progress: {
        total: 0,
        completed: 0,
        failed: 0,
        percentage: 0
      },
      createdAccounts: [],
      summary: {
        totalAccounts: 0,
        createdCount: 0,
        updatedCount: 0,
        failedCount: 0,
        processingTime: 0
      }
    };
    
    try {
      result.status = 'processing';
      result.startedAt = new Date();
      
      // Process based on method
      switch (request.method) {
        case 'template':
          await this.createFromTemplate(request, result);
          break;
        case 'manual':
          await this.createManually(request, result);
          break;
        case 'import':
          await this.createFromImport(request, result);
          break;
        case 'clone':
          await this.createFromClone(request, result);
          break;
        default:
          throw new Error(`Unsupported creation method: ${request.method}`);
      }
      
      result.status = 'completed';
      result.completedAt = new Date();
      result.summary.processingTime = result.completedAt.getTime() - result.startedAt!.getTime();
      
      // Send notifications
      if (request.options.notifications?.enabled) {
        await this.sendCreationNotifications(request, result);
      }
      
    } catch (error) {
      result.status = 'failed';
      result.error = {
        code: 'CREATION_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error
      };
      result.completedAt = new Date();
    }
    
    return result;
  }
  
  // Create from template
  private async createFromTemplate(request: AccountCreationRequest, result: AccountCreationResult): Promise<void> {
    if (!request.templateId) {
      throw new Error('Template ID is required for template method');
    }
    
    // Get template
    const template = await this.getAccountTemplate(request.templateId);
    if (!template) {
      throw new Error('Account template not found');
    }
    
    // Apply customizations
    let accounts = template.accounts;
    if (request.customizations) {
      accounts = await this.applyTemplateCustomizations(template, request.customizations);
    }
    
    // Validate accounts
    if (request.options.validateBeforeCreate) {
      const validation = await this.validateAccountList(accounts, template.validation);
      result.validationResults = validation;
      
      if (!validation.isValid && !request.options.dryRun) {
        throw new Error('Account validation failed');
      }
    }
    
    // Check if approval is required
    if (request.options.requireApproval) {
      await this.createApprovalRequest(request, accounts);
      result.status = 'pending_approval';
      return;
    }
    
    // Create accounts
    result.progress.total = accounts.length;
    
    for (const accountData of accounts) {
      try {
        const account = await this.accountService.createAccount({
          code: accountData.code,
          name: accountData.name,
          displayName: accountData.displayName,
          description: accountData.description,
          type: accountData.type as any,
          subtype: accountData.subtype,
          category: accountData.category,
          currency: request.customizations?.baseCurrency || template.configuration.baseCurrency,
          openingBalance: accountData.openingBalance,
          settings: accountData.settings,
          reporting: accountData.reporting,
          budgeting: accountData.budgeting,
          createdBy: request.createdBy
        });
        
        result.createdAccounts.push({
          accountId: account._id,
          code: account.code,
          name: account.name,
          status: 'created'
        });
        
        result.summary.createdCount++;
        
      } catch (error) {
        result.createdAccounts.push({
          accountId: '',
          code: accountData.code,
          name: accountData.name,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        
        result.summary.failedCount++;
      }
      
      result.progress.completed++;
      result.progress.percentage = (result.progress.completed / result.progress.total) * 100;
    }
    
    result.summary.totalAccounts = accounts.length;
  }
  
  // Create manually
  private async createManually(request: AccountCreationRequest, result: AccountCreationResult): Promise<void> {
    if (!request.accounts || request.accounts.length === 0) {
      throw new Error('Account data is required for manual method');
    }
    
    // Validate accounts
    if (request.options.validateBeforeCreate) {
      const validation = await this.validateAccountList(request.accounts);
      result.validationResults = validation;
      
      if (!validation.isValid && !request.options.dryRun) {
        throw new Error('Account validation failed');
      }
    }
    
    // Check if approval is required
    if (request.options.requireApproval) {
      await this.createApprovalRequest(request, request.accounts);
      result.status = 'pending_approval';
      return;
    }
    
    // Create accounts
    result.progress.total = request.accounts.length;
    
    for (const accountData of request.accounts) {
      try {
        const account = await this.accountService.createAccount({
          code: accountData.code,
          name: accountData.name,
          displayName: accountData.displayName,
          description: accountData.description,
          type: accountData.type as any,
          subtype: accountData.subtype,
          category: accountData.category,
          currency: accountData.currency,
          allowForeignCurrency: accountData.allowForeignCurrency,
          taxRelevant: accountData.taxRelevant,
          taxCode: accountData.taxCode,
          openingBalance: accountData.openingBalance,
          restrictions: accountData.restrictions,
          settings: accountData.settings,
          reporting: accountData.reporting,
          budgeting: accountData.budgeting,
          createdBy: request.createdBy
        });
        
        result.createdAccounts.push({
          accountId: account._id,
          code: account.code,
          name: account.name,
          status: 'created'
        });
        
        result.summary.createdCount++;
        
      } catch (error) {
        result.createdAccounts.push({
          accountId: '',
          code: accountData.code,
          name: accountData.name,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        
        result.summary.failedCount++;
      }
      
      result.progress.completed++;
      result.progress.percentage = (result.progress.completed / result.progress.total) * 100;
    }
    
    result.summary.totalAccounts = request.accounts.length;
  }
  
  // Create from import
  private async createFromImport(request: AccountCreationRequest, result: AccountCreationResult): Promise<void> {
    if (!request.importData) {
      throw new Error('Import data is required for import method');
    }
    
    // Parse import data
    const accounts = await this.parseImportData(request.importData);
    
    // Validate accounts
    if (request.options.validateBeforeCreate) {
      const validation = await this.validateAccountList(accounts);
      result.validationResults = validation;
      
      if (!validation.isValid && !request.options.dryRun) {
        throw new Error('Account validation failed');
      }
    }
    
    // Check if approval is required
    if (request.options.requireApproval) {
      await this.createApprovalRequest(request, accounts);
      result.status = 'pending_approval';
      return;
    }
    
    // Create accounts
    result.progress.total = accounts.length;
    
    for (const accountData of accounts) {
      try {
        const account = await this.accountService.createAccount({
          ...accountData,
          createdBy: request.createdBy
        });
        
        result.createdAccounts.push({
          accountId: account._id,
          code: account.code,
          name: account.name,
          status: 'created'
        });
        
        result.summary.createdCount++;
        
      } catch (error) {
        result.createdAccounts.push({
          accountId: '',
          code: accountData.code,
          name: accountData.name,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        
        result.summary.failedCount++;
      }
      
      result.progress.completed++;
      result.progress.percentage = (result.progress.completed / result.progress.total) * 100;
    }
    
    result.summary.totalAccounts = accounts.length;
  }
  
  // Create from clone
  private async createFromClone(request: AccountCreationRequest, result: AccountCreationResult): Promise<void> {
    if (!request.sourceEntityId) {
      throw new Error('Source entity ID is required for clone method');
    }
    
    // Get source accounts
    const sourceAccounts = await this.getEntityAccounts(request.sourceEntityId);
    
    // Apply clone options
    const accounts = await this.applyCloneOptions(sourceAccounts, request.cloneOptions);
    
    // Create accounts
    result.progress.total = accounts.length;
    
    for (const accountData of accounts) {
      try {
        const account = await this.accountService.createAccount({
          ...accountData,
          createdBy: request.createdBy
        });
        
        result.createdAccounts.push({
          accountId: account._id,
          code: account.code,
          name: account.name,
          status: 'created'
        });
        
        result.summary.createdCount++;
        
      } catch (error) {
        result.createdAccounts.push({
          accountId: '',
          code: accountData.code,
          name: accountData.name,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        
        result.summary.failedCount++;
      }
      
      result.progress.completed++;
      result.progress.percentage = (result.progress.completed / result.progress.total) * 100;
    }
    
    result.summary.totalAccounts = accounts.length;
  }
  
  // Helper methods
  private async validateAccountTemplate(template: AccountTemplate): Promise<void> {
    // Validate account codes
    const codes = template.accounts.map(acc => acc.code);
    const uniqueCodes = new Set(codes);
    if (codes.length !== uniqueCodes.size) {
      throw new Error('Duplicate account codes in template');
    }
    
    // Validate hierarchy
    for (const account of template.accounts) {
      if (account.parentCode && !codes.includes(account.parentCode)) {
        throw new Error(`Parent code ${account.parentCode} not found for account ${account.code}`);
      }
    }
    
    // Validate required accounts
    for (const requiredCode of template.validation.requiredAccounts) {
      if (!codes.includes(requiredCode)) {
        throw new Error(`Required account ${requiredCode} missing from template`);
      }
    }
  }
  
  private async applyTemplateCustomizations(template: AccountTemplate, customizations: any): Promise<any[]> {
    let accounts = [...template.accounts];
    
    // Apply base currency change
    if (customizations.baseCurrency && customizations.baseCurrency !== template.configuration.baseCurrency) {
      // Would need to update currency-related settings
    }
    
    // Exclude accounts
    if (customizations.excludeAccounts && customizations.excludeAccounts.length > 0) {
      accounts = accounts.filter(acc => !customizations.excludeAccounts.includes(acc.code));
    }
    
    // Modify accounts
    if (customizations.modifyAccounts && customizations.modifyAccounts.length > 0) {
      for (const modification of customizations.modifyAccounts) {
        const accountIndex = accounts.findIndex(acc => acc.code === modification.code);
        if (accountIndex !== -1) {
          accounts[accountIndex] = { ...accounts[accountIndex], ...modification.changes };
        }
      }
    }
    
    return accounts;
  }
  
  private async validateAccountList(accounts: any[], validation?: any): Promise<any> {
    const errors = [];
    const warnings = [];
    
    // Check for duplicate codes
    const codes = accounts.map(acc => acc.code);
    const duplicates = codes.filter((code, index) => codes.indexOf(code) !== index);
    if (duplicates.length > 0) {
      errors.push({
        type: 'error' as const,
        code: 'DUPLICATE_CODES',
        message: `Duplicate account codes: ${duplicates.join(', ')}`
      });
    }
    
    // Validate account types
    const validTypes = ['asset', 'liability', 'equity', 'revenue', 'expense', 'contra-asset', 'contra-liability', 'contra-equity'];
    for (const account of accounts) {
      if (!validTypes.includes(account.type)) {
        errors.push({
          type: 'error' as const,
          code: 'INVALID_TYPE',
          message: `Invalid account type ${account.type} for account ${account.code}`,
          account: account.code
        });
      }
    }
    
    // Validate hierarchy
    for (const account of accounts) {
      if (account.parentCode && !codes.includes(account.parentCode)) {
        errors.push({
          type: 'error' as const,
          code: 'INVALID_PARENT',
          message: `Parent account ${account.parentCode} not found for account ${account.code}`,
          account: account.code
        });
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  private async createApprovalRequest(request: AccountCreationRequest, accounts: any[]): Promise<void> {
    // Mock approval request creation
    console.log(`Creating approval request for ${accounts.length} accounts`);
  }
  
  private async parseImportData(importData: any): Promise<any[]> {
    // Mock import parsing
    return [];
  }
  
  private async applyCloneOptions(sourceAccounts: IAccount[], options?: any): Promise<any[]> {
    // Mock clone options application
    return sourceAccounts.map(acc => ({
      code: acc.code,
      name: acc.name,
      displayName: acc.displayName,
      type: acc.type,
      category: acc.category
    }));
  }
  
  private async getEntityAccounts(entityId: string): Promise<IAccount[]> {
    // Mock entity accounts retrieval
    return [];
  }
  
  private async sendCreationNotifications(request: AccountCreationRequest, result: AccountCreationResult): Promise<void> {
    // Mock notification sending
    console.log(`Sending creation notifications for request ${result.requestId}`);
  }
  
  // Database operations (mock implementations)
  private async saveAccountTemplate(template: AccountTemplate): Promise<void> {
    console.log(`Saving account template ${template.templateId}`);
  }
  
  private async getAccountTemplate(templateId: string): Promise<AccountTemplate | null> {
    // Mock implementation
    return null;
  }
}
