import { ExpenseCategory, IExpenseCategory } from '../models/ExpenseCategory';
import { User } from '../models/User';

export interface CategoryCreateRequest {
  name: string;
  code: string;
  description?: string;
  parentCategoryId?: string;
  budget: {
    annual: number;
    quarterly: number;
    monthly: number;
  };
  approvalRules: {
    requiresApproval: boolean;
    approvalThreshold: number;
    approverRoles: string[];
    escalationRules?: Array<{
      condition: string;
      action: 'escalate' | 'notify' | 'auto_approve';
      recipient: string;
      delay: number;
    }>;
    autoApprovalConditions?: Array<{
      field: string;
      operator: string;
      value: any;
    }>;
  };
  taxRules: {
    isTaxDeductible: boolean;
    taxCode?: string;
    taxRate: number;
    taxJurisdiction?: string;
    taxReporting?: boolean;
  };
  accounting: {
    expenseAccount: string;
    prepaidAccount?: string;
    accrualAccount?: string;
    costCenter?: string;
    department?: string;
    projectCode?: string;
    glCode?: string;
  };
  policies: {
    receiptRequired: boolean;
    maxAmount?: number;
    allowedPaymentMethods: string[];
    requiredFields: string[];
    prohibitedItems?: string[];
    timeLimits?: {
      submissionWindow: number;
      approvalWindow: number;
    };
  };
  permissions: {
    canSubmit: string[];
    canApprove: string[];
    canView: string[];
    canManage: string[];
    departmentRestrictions?: string[];
    locationRestrictions?: string[];
  };
  integrations?: {
    erpCategory?: string;
    accountingSystem?: string;
    corporateCardCategory?: string;
    budgetSystem?: string;
    reportingSystem?: string;
  };
  tags?: string[];
  notes?: string;
  createdBy: string;
}

export interface CategoryUpdateRequest {
  name?: string;
  description?: string;
  parentCategoryId?: string;
  budget?: {
    annual?: number;
    quarterly?: number;
    monthly?: number;
  };
  approvalRules?: {
    requiresApproval?: boolean;
    approvalThreshold?: number;
    approverRoles?: string[];
    escalationRules?: Array<{
      condition: string;
      action: 'escalate' | 'notify' | 'auto_approve';
      recipient: string;
      delay: number;
    }>;
    autoApprovalConditions?: Array<{
      field: string;
      operator: string;
      value: any;
    }>;
  };
  taxRules?: {
    isTaxDeductible?: boolean;
    taxCode?: string;
    taxRate?: number;
    taxJurisdiction?: string;
    taxReporting?: boolean;
  };
  accounting?: {
    expenseAccount?: string;
    prepaidAccount?: string;
    accrualAccount?: string;
    costCenter?: string;
    department?: string;
    projectCode?: string;
    glCode?: string;
  };
  policies?: {
    receiptRequired?: boolean;
    maxAmount?: number;
    allowedPaymentMethods?: string[];
    requiredFields?: string[];
    prohibitedItems?: string[];
    timeLimits?: {
      submissionWindow?: number;
      approvalWindow?: number;
    };
  };
  permissions?: {
    canSubmit?: string[];
    canApprove?: string[];
    canView?: string[];
    canManage?: string[];
    departmentRestrictions?: string[];
    locationRestrictions?: string[];
  };
  integrations?: {
    erpCategory?: string;
    accountingSystem?: string;
    corporateCardCategory?: string;
    budgetSystem?: string;
    reportingSystem?: string;
  };
  status?: 'active' | 'inactive' | 'archived';
  tags?: string[];
  notes?: string;
  updatedBy: string;
}

export interface CategoryAnalytics {
  categoryId: string;
  categoryName: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  
  // Budget Analytics
  budgetAnalytics: {
    allocated: {
      annual: number;
      quarterly: number;
      monthly: number;
    };
    spent: {
      annual: number;
      quarterly: number;
      monthly: number;
    };
    remaining: {
      annual: number;
      quarterly: number;
      monthly: number;
    };
    utilizationRate: number;
    variance: {
      annual: number;
      quarterly: number;
      monthly: number;
    };
    projectedSpend: number;
    projectedVariance: number;
  };
  
  // Expense Analytics
  expenseAnalytics: {
    totalExpenses: number;
    averageExpense: number;
    expenseCount: number;
    topMerchants: Array<{
      merchant: string;
      amount: number;
      count: number;
      percentage: number;
    }>;
    seasonalTrends: Array<{
      month: number;
      amount: number;
      count: number;
      averageAmount: number;
    }>;
    employeeBreakdown: Array<{
      employeeId: string;
      employeeName: string;
      amount: number;
      count: number;
    }>;
  };
  
  // Compliance Analytics
  complianceAnalytics: {
    approvalRate: number;
    averageApprovalTime: number; // hours
    policyViolations: number;
    violationRate: number;
    receiptCompliance: number;
    timelySubmission: number;
  };
  
  // Trends and Forecasts
  trends: {
    monthlyTrend: Array<{
      month: string;
      amount: number;
      count: number;
      budget: number;
      variance: number;
    }>;
    quarterlyTrend: Array<{
      quarter: string;
      amount: number;
      count: number;
      budget: number;
      variance: number;
    }>;
    forecast: {
      nextMonth: number;
      nextQuarter: number;
      nextYear: number;
      confidence: number;
    };
  };
}

export class ExpenseCategoryService {
  // Create expense category
  async createCategory(params: CategoryCreateRequest): Promise<IExpenseCategory> {
    // Validate category code uniqueness
    const existingCategory = await ExpenseCategory.findByCode(params.code);
    if (existingCategory) {
      throw new Error(`Category with code ${params.code} already exists`);
    }
    
    // Validate parent category if provided
    let parentCategory = null;
    if (params.parentCategoryId) {
      parentCategory = await ExpenseCategory.findById(params.parentCategoryId);
      if (!parentCategory) {
        throw new Error('Parent category not found');
      }
      if (parentCategory.level >= 5) {
        throw new Error('Maximum category depth (5 levels) reached');
      }
    }
    
    // Get creator info
    const creator = await User.findById(params.createdBy);
    if (!creator) {
      throw new Error('Creator not found');
    }
    
    // Build full path
    const fullPath = parentCategory ? `${parentCategory.fullPath} > ${params.name}` : params.name;
    const level = parentCategory ? parentCategory.level + 1 : 1;
    
    // Create category
    const category = new ExpenseCategory({
      name: params.name,
      code: params.code.toUpperCase(),
      description: params.description,
      parentCategory: params.parentCategoryId,
      level,
      fullPath,
      
      budget: {
        annual: params.budget.annual,
        quarterly: params.budget.quarterly,
        monthly: params.budget.monthly,
        remaining: {
          annual: params.budget.annual,
          quarterly: params.budget.quarterly,
          monthly: params.budget.monthly
        },
        spent: {
          annual: 0,
          quarterly: 0,
          monthly: 0
        },
        committed: {
          annual: 0,
          quarterly: 0,
          monthly: 0
        },
        utilizationRate: 0,
        variance: {
          annual: 0,
          quarterly: 0,
          monthly: 0
        }
      },
      
      approvalRules: {
        requiresApproval: params.approvalRules.requiresApproval,
        approvalThreshold: params.approvalRules.approvalThreshold,
        approverRoles: params.approvalRules.approverRoles,
        escalationRules: params.approvalRules.escalationRules || [],
        autoApprovalConditions: params.approvalRules.autoApprovalConditions || []
      },
      
      taxRules: {
        isTaxDeductible: params.taxRules.isTaxDeductible,
        taxCode: params.taxRules.taxCode,
        taxRate: params.taxRules.taxRate,
        taxJurisdiction: params.taxRules.taxJurisdiction,
        taxReporting: params.taxRules.taxReporting ?? true
      },
      
      accounting: {
        expenseAccount: params.accounting.expenseAccount,
        prepaidAccount: params.accounting.prepaidAccount,
        accrualAccount: params.accounting.accrualAccount,
        costCenter: params.accounting.costCenter,
        department: params.accounting.department,
        projectCode: params.accounting.projectCode,
        glCode: params.accounting.glCode
      },
      
      policies: {
        receiptRequired: params.policies.receiptRequired,
        maxAmount: params.policies.maxAmount,
        allowedPaymentMethods: params.policies.allowedPaymentMethods,
        requiredFields: params.policies.requiredFields,
        prohibitedItems: params.policies.prohibitedItems,
        timeLimits: params.policies.timeLimits
      },
      
      permissions: {
        canSubmit: params.permissions.canSubmit,
        canApprove: params.permissions.canApprove,
        canView: params.permissions.canView,
        canManage: params.permissions.canManage,
        departmentRestrictions: params.permissions.departmentRestrictions,
        locationRestrictions: params.permissions.locationRestrictions
      },
      
      integrations: params.integrations || {},
      
      status: 'active',
      isSystem: false,
      version: 1,
      
      metadata: {
        createdBy: creator._id,
        createdAt: new Date(),
        updatedAt: new Date(),
        updatedBy: creator._id,
        usageCount: 0,
        tags: params.tags || [],
        notes: params.notes
      }
    });
    
    // Save category
    await category.save();
    
    // Add to parent's children array
    if (parentCategory) {
      await parentCategory.addChild(category._id);
    }
    
    // Send notifications
    await this.sendCategoryNotifications(category, 'created');
    
    return category;
  }
  
  // Update expense category
  async updateCategory(categoryId: string, params: CategoryUpdateRequest): Promise<IExpenseCategory> {
    const category = await ExpenseCategory.findById(categoryId);
    if (!category) {
      throw new Error('Category not found');
    }
    
    if (category.isSystem) {
      throw new Error('Cannot modify system categories');
    }
    
    // Validate parent category change
    if (params.parentCategoryId !== undefined) {
      if (params.parentCategoryId) {
        const newParent = await ExpenseCategory.findById(params.parentCategoryId);
        if (!newParent) {
          throw new Error('Parent category not found');
        }
        if (newParent.level >= 5) {
          throw new Error('Maximum category depth (5 levels) reached');
        }
        if (newParent._id.equals(category._id)) {
          throw new Error('Category cannot be its own parent');
        }
        // Check for circular reference
        const isDescendant = await this.isDescendant(newParent._id, category._id);
        if (isDescendant) {
          throw new Error('Cannot move category to its own descendant');
        }
      }
    }
    
    // Get updater info
    const updater = await User.findById(params.updatedBy);
    if (!updater) {
      throw new Error('Updater not found');
    }
    
    // Store old parent for children update
    const oldParentId = category.parentCategory;
    
    // Update fields
    if (params.name !== undefined) category.name = params.name;
    if (params.description !== undefined) category.description = params.description;
    if (params.parentCategoryId !== undefined) category.parentCategory = params.parentCategoryId;
    
    if (params.budget) {
      if (params.budget.annual !== undefined) category.budget.annual = params.budget.annual;
      if (params.budget.quarterly !== undefined) category.budget.quarterly = params.budget.quarterly;
      if (params.budget.monthly !== undefined) category.budget.monthly = params.budget.monthly;
    }
    
    if (params.approvalRules) {
      if (params.approvalRules.requiresApproval !== undefined) {
        category.approvalRules.requiresApproval = params.approvalRules.requiresApproval;
      }
      if (params.approvalRules.approvalThreshold !== undefined) {
        category.approvalRules.approvalThreshold = params.approvalRules.approvalThreshold;
      }
      if (params.approvalRules.approverRoles !== undefined) {
        category.approvalRules.approverRoles = params.approvalRules.approverRoles;
      }
      if (params.approvalRules.escalationRules !== undefined) {
        category.approvalRules.escalationRules = params.approvalRules.escalationRules;
      }
      if (params.approvalRules.autoApprovalConditions !== undefined) {
        category.approvalRules.autoApprovalConditions = params.approvalRules.autoApprovalConditions;
      }
    }
    
    if (params.taxRules) {
      if (params.taxRules.isTaxDeductible !== undefined) {
        category.taxRules.isTaxDeductible = params.taxRules.isTaxDeductible;
      }
      if (params.taxRules.taxCode !== undefined) category.taxRules.taxCode = params.taxRules.taxCode;
      if (params.taxRules.taxRate !== undefined) category.taxRules.taxRate = params.taxRules.taxRate;
      if (params.taxRules.taxJurisdiction !== undefined) {
        category.taxRules.taxJurisdiction = params.taxRules.taxJurisdiction;
      }
      if (params.taxRules.taxReporting !== undefined) {
        category.taxRules.taxReporting = params.taxRules.taxReporting;
      }
    }
    
    if (params.accounting) {
      if (params.accounting.expenseAccount !== undefined) {
        category.accounting.expenseAccount = params.accounting.expenseAccount;
      }
      if (params.accounting.prepaidAccount !== undefined) {
        category.accounting.prepaidAccount = params.accounting.prepaidAccount;
      }
      if (params.accounting.accrualAccount !== undefined) {
        category.accounting.accrualAccount = params.accounting.accrualAccount;
      }
      if (params.accounting.costCenter !== undefined) {
        category.accounting.costCenter = params.accounting.costCenter;
      }
      if (params.accounting.department !== undefined) {
        category.accounting.department = params.accounting.department;
      }
      if (params.accounting.projectCode !== undefined) {
        category.accounting.projectCode = params.accounting.projectCode;
      }
      if (params.accounting.glCode !== undefined) {
        category.accounting.glCode = params.accounting.glCode;
      }
    }
    
    if (params.policies) {
      if (params.policies.receiptRequired !== undefined) {
        category.policies.receiptRequired = params.policies.receiptRequired;
      }
      if (params.policies.maxAmount !== undefined) {
        category.policies.maxAmount = params.policies.maxAmount;
      }
      if (params.policies.allowedPaymentMethods !== undefined) {
        category.policies.allowedPaymentMethods = params.policies.allowedPaymentMethods;
      }
      if (params.policies.requiredFields !== undefined) {
        category.policies.requiredFields = params.policies.requiredFields;
      }
      if (params.policies.prohibitedItems !== undefined) {
        category.policies.prohibitedItems = params.policies.prohibitedItems;
      }
      if (params.policies.timeLimits !== undefined) {
        category.policies.timeLimits = params.policies.timeLimits;
      }
    }
    
    if (params.permissions) {
      if (params.permissions.canSubmit !== undefined) {
        category.permissions.canSubmit = params.permissions.canSubmit;
      }
      if (params.permissions.canApprove !== undefined) {
        category.permissions.canApprove = params.permissions.canApprove;
      }
      if (params.permissions.canView !== undefined) {
        category.permissions.canView = params.permissions.canView;
      }
      if (params.permissions.canManage !== undefined) {
        category.permissions.canManage = params.permissions.canManage;
      }
      if (params.permissions.departmentRestrictions !== undefined) {
        category.permissions.departmentRestrictions = params.permissions.departmentRestrictions;
      }
      if (params.permissions.locationRestrictions !== undefined) {
        category.permissions.locationRestrictions = params.permissions.locationRestrictions;
      }
    }
    
    if (params.integrations !== undefined) {
      category.integrations = { ...category.integrations, ...params.integrations };
    }
    
    if (params.status !== undefined) category.status = params.status;
    if (params.tags !== undefined) category.metadata.tags = params.tags;
    if (params.notes !== undefined) category.metadata.notes = params.notes;
    
    category.version += 1;
    category.metadata.updatedBy = updater._id;
    category.metadata.updatedAt = new Date();
    
    // Save category
    await category.save();
    
    // Update parent relationships if changed
    if (params.parentCategoryId !== undefined && !oldParentId?.equals(params.parentCategoryId)) {
      // Remove from old parent
      if (oldParentId) {
        const oldParent = await ExpenseCategory.findById(oldParentId);
        if (oldParent) {
          await oldParent.removeChild(category._id);
        }
      }
      
      // Add to new parent
      if (params.parentCategoryId) {
        const newParent = await ExpenseCategory.findById(params.parentCategoryId);
        if (newParent) {
          await newParent.addChild(category._id);
        }
      }
    }
    
    // Send notifications
    await this.sendCategoryNotifications(category, 'updated');
    
    return category;
  }
  
  // Delete expense category
  async deleteCategory(categoryId: string, deletedBy: string): Promise<void> {
    const category = await ExpenseCategory.findById(categoryId);
    if (!category) {
      throw new Error('Category not found');
    }
    
    if (category.isSystem) {
      throw new Error('Cannot delete system categories');
    }
    
    // Check for children
    if (category.children && category.children.length > 0) {
      throw new Error('Cannot delete category with child categories. Delete or move children first.');
    }
    
    // Check for usage
    if (category.metadata.usageCount > 0) {
      throw new Error('Cannot delete category that is in use. Archive instead.');
    }
    
    // Soft delete
    category.status = 'archived';
    category.metadata.updatedBy = new Types.ObjectId(deletedBy);
    category.metadata.updatedAt = new Date();
    
    await category.save();
    
    // Remove from parent
    if (category.parentCategory) {
      const parent = await ExpenseCategory.findById(category.parentCategory);
      if (parent) {
        await parent.removeChild(category._id);
      }
    }
    
    // Send notifications
    await this.sendCategoryNotifications(category, 'deleted');
  }
  
  // Get category by ID
  async getCategoryById(categoryId: string): Promise<IExpenseCategory | null> {
    return await ExpenseCategory.findById(categoryId);
  }
  
  // Get category by code
  async getCategoryByCode(code: string): Promise<IExpenseCategory | null> {
    return await ExpenseCategory.findByCode(code);
  }
  
  // Get category tree
  async getCategoryTree(includeInactive = false): Promise<IExpenseCategory[]> {
    const statusFilter = includeInactive ? {} : { status: 'active' };
    const roots = await ExpenseCategory.find({ 
      parentCategory: null, 
      ...statusFilter 
    }).sort({ name: 1 });
    
    const tree = [];
    for (const root of roots) {
      const categoryWithChildren = await this.getCategoryWithChildren(root._id, includeInactive);
      tree.push(categoryWithChildren);
    }
    
    return tree;
  }
  
  // Get root categories
  async getRootCategories(includeInactive = false): Promise<IExpenseCategory[]> {
    const statusFilter = includeInactive ? {} : { status: 'active' };
    return await ExpenseCategory.findRootCategories();
  }
  
  // Get child categories
  async getChildCategories(parentId: string, includeInactive = false): Promise<IExpenseCategory[]> {
    const statusFilter = includeInactive ? {} : { status: 'active' };
    return await ExpenseCategory.findChildCategories(new Types.ObjectId(parentId));
  }
  
  // Search categories
  async searchCategories(query: string, includeInactive = false): Promise<IExpenseCategory[]> {
    return await ExpenseCategory.searchCategories(query, includeInactive);
  }
  
  // Get category analytics
  async getCategoryAnalytics(categoryId: string, period: { startDate: Date; endDate: Date }): Promise<CategoryAnalytics> {
    const category = await ExpenseCategory.findById(categoryId);
    if (!category) {
      throw new Error('Category not found');
    }
    
    // Mock analytics data - in reality, would query expense collection
    const analytics: CategoryAnalytics = {
      categoryId: category._id.toString(),
      categoryName: category.name,
      period,
      
      budgetAnalytics: {
        allocated: {
          annual: category.budget.annual,
          quarterly: category.budget.quarterly,
          monthly: category.budget.monthly
        },
        spent: {
          annual: category.budget.spent.annual,
          quarterly: category.budget.spent.quarterly,
          monthly: category.budget.spent.monthly
        },
        remaining: {
          annual: category.budget.remaining.annual,
          quarterly: category.budget.remaining.quarterly,
          monthly: category.budget.remaining.monthly
        },
        utilizationRate: category.budget.utilizationRate,
        variance: category.budget.variance,
        projectedSpend: category.budget.spent.annual * 1.1, // 10% growth projection
        projectedVariance: category.budget.variance.annual * 1.1
      },
      
      expenseAnalytics: {
        totalExpenses: category.budget.spent.annual,
        averageExpense: category.analytics.averageExpense,
        expenseCount: category.analytics.expenseCount,
        topMerchants: category.analytics.topMerchants.map(merchant => ({
          ...merchant,
          percentage: (merchant.amount / category.budget.spent.annual) * 100
        })),
        seasonalTrends: category.analytics.seasonalTrends,
        employeeBreakdown: [] // Would query expense collection
      },
      
      complianceAnalytics: {
        approvalRate: 95.5,
        averageApprovalTime: 24.5,
        policyViolations: 5,
        violationRate: 2.1,
        receiptCompliance: 92.3,
        timelySubmission: 88.7
      },
      
      trends: {
        monthlyTrend: [],
        quarterlyTrend: [],
        forecast: {
          nextMonth: category.budget.spent.monthly * 1.05,
          nextQuarter: category.budget.spent.quarterly * 1.05,
          nextYear: category.budget.spent.annual * 1.05,
          confidence: 85
        }
      }
    };
    
    return analytics;
  }
  
  // Update category budget
  async updateCategoryBudget(categoryId: string, budgetUpdate: {
    annual?: number;
    quarterly?: number;
    monthly?: number;
  }, updatedBy: string): Promise<IExpenseCategory> {
    const category = await ExpenseCategory.findById(categoryId);
    if (!category) {
      throw new Error('Category not found');
    }
    
    if (budgetUpdate.annual !== undefined) category.budget.annual = budgetUpdate.annual;
    if (budgetUpdate.quarterly !== undefined) category.budget.quarterly = budgetUpdate.quarterly;
    if (budgetUpdate.monthly !== undefined) category.budget.monthly = budgetUpdate.monthly;
    
    category.calculateBudgetMetrics();
    category.metadata.updatedBy = new Types.ObjectId(updatedBy);
    category.metadata.updatedAt = new Date();
    
    await category.save();
    
    return category;
  }
  
  // Get budget alerts
  async getBudgetAlerts(threshold = 80): Promise<IExpenseCategory[]> {
    return await ExpenseCategory.getBudgetAlerts(threshold);
  }
  
  // Update category usage
  async updateCategoryUsage(categoryId: string, amount: number): Promise<void> {
    const category = await ExpenseCategory.findById(categoryId);
    if (!category) return;
    
    category.budget.spent.monthly += amount;
    category.budget.spent.quarterly += amount;
    category.budget.spent.annual += amount;
    
    category.calculateBudgetMetrics();
    category.metadata.lastUsed = new Date();
    category.metadata.usageCount += 1;
    
    await category.save();
  }
  
  // Helper methods
  private async isDescendant(ancestorId: Types.ObjectId, categoryId: Types.ObjectId): Promise<boolean> {
    const category = await ExpenseCategory.findById(categoryId);
    if (!category) return false;
    
    if (!category.parentCategory) return false;
    if (category.parentCategory.equals(ancestorId)) return true;
    
    return await this.isDescendant(ancestorId, category.parentCategory);
  }
  
  private async getCategoryWithChildren(categoryId: Types.ObjectId, includeInactive = false): Promise<IExpenseCategory | null> {
    const statusFilter = includeInactive ? {} : { status: 'active' };
    const category = await ExpenseCategory.findById(categoryId);
    if (!category) return null;
    
    const children = await ExpenseCategory.find({ 
      parentCategory: categoryId, 
      ...statusFilter 
    }).sort({ name: 1 });
    
    if (children.length > 0) {
      const childCategories = [];
      for (const child of children) {
        const childWithChildren = await this.getCategoryWithChildren(child._id, includeInactive);
        if (childWithChildren) {
          childCategories.push(childWithChildren);
        }
      }
      (category as any).children = childCategories;
    }
    
    return category;
  }
  
  private async sendCategoryNotifications(category: IExpenseCategory, action: 'created' | 'updated' | 'deleted'): Promise<void> {
    // Send notifications to relevant users
    console.log(`Sending ${action} notifications for category ${category.name}`);
  }
}

// Import Types.ObjectId
import { Types } from 'mongoose';
