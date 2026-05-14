import { Expense, IExpense, ExpenseAttachment, ExpenseSplit, ExpenseTag, MileageInfo, PerDiemInfo } from '../models/Expense';
import { ExpenseCategory } from '../models/ExpenseCategory';
import { User } from '../models/User';

export interface ExpenseCreateRequest {
  employeeId: string;
  title: string;
  description?: string;
  date: Date;
  location?: string;
  currency?: string;
  exchangeRate?: number;
  amount: number;
  taxAmount?: number;
  categoryId: string;
  splits?: Array<{
    categoryId: string;
    amount: number;
    percentage: number;
    description?: string;
    customFields?: Record<string, any>;
  }>;
  paymentMethod: 'cash' | 'personal_card' | 'corporate_card' | 'company_account' | 'advance' | 'other';
  cardInfo?: {
    last4: string;
    cardType: string;
    transactionId?: string;
    merchantCategoryCode?: string;
  };
  reimbursable?: boolean;
  receiptRequired?: boolean;
  attachments?: Array<{
    name: string;
    type: 'receipt' | 'invoice' | 'document' | 'image' | 'other';
    url: string;
    fileSize: number;
    mimeType: string;
    description?: string;
    isPrimary?: boolean;
  }>;
  mileageInfo?: MileageInfo;
  perDiemInfo?: PerDiemInfo;
  tags?: Array<{
    name: string;
    color: string;
    category: 'project' | 'client' | 'location' | 'purpose' | 'custom';
  }>;
  customFields?: Record<string, any>;
  projectCode?: string;
  clientCode?: string;
  billable?: boolean;
  billableTo?: string;
  source?: 'manual' | 'mobile_app' | 'email' | 'ocr' | 'card_import' | 'recurring' | 'api';
  sourceReference?: string;
  createdBy: string;
}

export interface ExpenseUpdateRequest {
  title?: string;
  description?: string;
  date?: Date;
  location?: string;
  currency?: string;
  exchangeRate?: number;
  amount?: number;
  taxAmount?: number;
  categoryId?: string;
  splits?: Array<{
    categoryId: string;
    amount: number;
    percentage: number;
    description?: string;
    customFields?: Record<string, any>;
  }>;
  paymentMethod?: 'cash' | 'personal_card' | 'corporate_card' | 'company_account' | 'advance' | 'other';
  cardInfo?: {
    last4: string;
    cardType: string;
    transactionId?: string;
    merchantCategoryCode?: string;
  };
  reimbursable?: boolean;
  attachments?: Array<{
    attachmentId?: string;
    name: string;
    type: 'receipt' | 'invoice' | 'document' | 'image' | 'other';
    url: string;
    fileSize: number;
    mimeType: string;
    description?: string;
    isPrimary?: boolean;
  }>;
  mileageInfo?: MileageInfo;
  perDiemInfo?: PerDiemInfo;
  tags?: Array<{
    name: string;
    color: string;
    category: 'project' | 'client' | 'location' | 'purpose' | 'custom';
  }>;
  customFields?: Record<string, any>;
  projectCode?: string;
  clientCode?: string;
  billable?: boolean;
  billableTo?: string;
  updatedBy: string;
}

export interface ExpenseSubmissionRequest {
  expenseId: string;
  reportId?: string;
  reportName?: string;
  reportPeriod?: {
    startDate: Date;
    endDate: Date;
  };
  submittedBy: string;
}

export interface ExpenseApprovalRequest {
  expenseId: string;
  approverId: string;
  action: 'approve' | 'reject';
  comments?: string;
  rejectionDetails?: {
    reason: string;
    category: 'policy' | 'documentation' | 'amount' | 'other';
    requiresResubmission: boolean;
    resubmissionDeadline?: Date;
  };
  delegatedTo?: string;
}

export class ExpenseService {
  // Create expense
  async createExpense(params: ExpenseCreateRequest): Promise<IExpense> {
    // Validate employee
    const employee = await User.findById(params.employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }
    
    // Validate category
    const category = await ExpenseCategory.findById(params.categoryId);
    if (!category) {
      throw new Error('Expense category not found');
    }
    
    // Validate splits if provided
    if (params.splits && params.splits.length > 0) {
      const totalSplitAmount = params.splits.reduce((sum, split) => sum + split.amount, 0);
      if (Math.abs(totalSplitAmount - params.amount) > 0.01) {
        throw new Error('Split amounts must equal total expense amount');
      }
      
      // Validate split categories
      for (const split of params.splits) {
        const splitCategory = await ExpenseCategory.findById(split.categoryId);
        if (!splitCategory) {
          throw new Error(`Split category not found: ${split.categoryId}`);
        }
      }
    }
    
    // Generate expense ID
    const expenseId = await Expense.generateExpenseId();
    
    // Calculate total amount
    const totalAmount = params.amount + (params.taxAmount || 0);
    
    // Get creator info
    const creator = await User.findById(params.createdBy);
    if (!creator) {
      throw new Error('Creator not found');
    }
    
    // Create expense
    const expense = new Expense({
      expenseId,
      employeeId: employee._id,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      employeeEmail: employee.email,
      department: employee.department || 'Unknown',
      costCenter: employee.costCenter,
      
      title: params.title,
      description: params.description,
      date: params.date,
      location: params.location,
      currency: params.currency || 'USD',
      exchangeRate: params.exchangeRate || 1.0,
      
      amount: params.amount,
      taxAmount: params.taxAmount,
      totalAmount,
      
      categoryId: category._id,
      categoryName: category.name,
      splits: params.splits?.map((split, index) => ({
        splitId: `SPLIT-${Date.now()}-${index}`,
        categoryId: split.categoryId,
        categoryName: '', // Will be populated by category lookup
        amount: split.amount,
        percentage: split.percentage,
        description: split.description,
        customFields: split.customFields
      })),
      
      paymentMethod: params.paymentMethod,
      cardInfo: params.cardInfo,
      reimbursable: params.reimbursable ?? true,
      
      receiptRequired: params.receiptRequired ?? category.policies.receiptRequired,
      receiptProvided: false,
      attachments: [],
      
      mileageInfo: params.mileageInfo,
      perDiemInfo: params.perDiemInfo,
      
      status: 'draft',
      
      tags: params.tags?.map((tag, index) => ({
        tagId: `TAG-${Date.now()}-${index}`,
        name: tag.name,
        color: tag.color,
        category: tag.category
      })) || [],
      
      customFields: params.customFields || {},
      projectCode: params.projectCode,
      clientCode: params.clientCode,
      billable: params.billable || false,
      billableTo: params.billableTo,
      
      source: params.source || 'manual',
      sourceReference: params.sourceReference,
      lastModifiedBy: creator._id,
      
      auditTrail: [{
        timestamp: new Date(),
        action: 'Expense Created',
        performedBy: creator._id,
        details: `Expense "${params.title}" created with amount ${params.amount} ${params.currency || 'USD'}`
      }],
      
      metadata: {
        createdAt: new Date(),
        createdBy: creator._id,
        updatedAt: new Date(),
        updatedBy: creator._id,
        version: 1
      }
    });
    
    // Add attachments if provided
    if (params.attachments && params.attachments.length > 0) {
      for (const attachment of params.attachments) {
        expense.addAttachment({
          attachmentId: `ATT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          ...attachment,
          uploadedAt: new Date(),
          uploadedBy: creator._id
        });
      }
    }
    
    // Validate against policies
    await this.validateExpensePolicies(expense);
    
    // Save expense
    await expense.save();
    
    // Send notifications
    await this.sendExpenseNotifications(expense, 'created');
    
    return expense;
  }
  
  // Update expense
  async updateExpense(expenseId: string, params: ExpenseUpdateRequest): Promise<IExpense> {
    const expense = await Expense.findOne({ expenseId });
    if (!expense) {
      throw new Error('Expense not found');
    }
    
    if (!expense.canBeEdited()) {
      throw new Error('Expense cannot be edited in current status');
    }
    
    // Get updater info
    const updater = await User.findById(params.updatedBy);
    if (!updater) {
      throw new Error('Updater not found');
    }
    
    // Store previous values for audit
    const previousValues = {
      title: expense.title,
      description: expense.description,
      date: expense.date,
      amount: expense.amount,
      taxAmount: expense.taxAmount,
      categoryId: expense.categoryId,
      paymentMethod: expense.paymentMethod
    };
    
    // Update fields
    if (params.title !== undefined) expense.title = params.title;
    if (params.description !== undefined) expense.description = params.description;
    if (params.date !== undefined) expense.date = params.date;
    if (params.location !== undefined) expense.location = params.location;
    if (params.currency !== undefined) expense.currency = params.currency;
    if (params.exchangeRate !== undefined) expense.exchangeRate = params.exchangeRate;
    if (params.amount !== undefined) expense.amount = params.amount;
    if (params.taxAmount !== undefined) expense.taxAmount = params.taxAmount;
    
    // Update category if changed
    if (params.categoryId !== undefined) {
      const newCategory = await ExpenseCategory.findById(params.categoryId);
      if (!newCategory) {
        throw new Error('Expense category not found');
      }
      expense.categoryId = newCategory._id;
      expense.categoryName = newCategory.name;
    }
    
    // Update splits
    if (params.splits !== undefined) {
      if (params.splits.length > 0) {
        const totalSplitAmount = params.splits.reduce((sum, split) => sum + split.amount, 0);
        if (Math.abs(totalSplitAmount - expense.amount) > 0.01) {
          throw new Error('Split amounts must equal total expense amount');
        }
        
        expense.splits = params.splits.map((split, index) => ({
          splitId: `SPLIT-${Date.now()}-${index}`,
          categoryId: split.categoryId,
          categoryName: '', // Will be populated by category lookup
          amount: split.amount,
          percentage: split.percentage,
          description: split.description,
          customFields: split.customFields
        }));
      } else {
        expense.splits = [];
      }
    }
    
    if (params.paymentMethod !== undefined) expense.paymentMethod = params.paymentMethod;
    if (params.cardInfo !== undefined) expense.cardInfo = params.cardInfo;
    if (params.reimbursable !== undefined) expense.reimbursable = params.reimbursable;
    
    // Update attachments
    if (params.attachments !== undefined) {
      expense.attachments = [];
      for (const attachment of params.attachments) {
        const attachmentData: ExpenseAttachment = {
          attachmentId: attachment.attachmentId || `ATT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          name: attachment.name,
          type: attachment.type,
          url: attachment.url,
          fileSize: attachment.fileSize,
          mimeType: attachment.mimeType,
          uploadedAt: new Date(),
          uploadedBy: updater._id,
          description: attachment.description,
          isPrimary: attachment.isPrimary || false
        };
        expense.addAttachment(attachmentData);
      }
      expense.receiptProvided = expense.attachments.length > 0;
    }
    
    if (params.mileageInfo !== undefined) expense.mileageInfo = params.mileageInfo;
    if (params.perDiemInfo !== undefined) expense.perDiemInfo = params.perDiemInfo;
    
    // Update tags
    if (params.tags !== undefined) {
      expense.tags = params.tags.map((tag, index) => ({
        tagId: `TAG-${Date.now()}-${index}`,
        name: tag.name,
        color: tag.color,
        category: tag.category
      }));
    }
    
    if (params.customFields !== undefined) expense.customFields = params.customFields;
    if (params.projectCode !== undefined) expense.projectCode = params.projectCode;
    if (params.clientCode !== undefined) expense.clientCode = params.clientCode;
    if (params.billable !== undefined) expense.billable = params.billable;
    if (params.billableTo !== undefined) expense.billableTo = params.billableTo;
    
    expense.lastModifiedBy = updater._id;
    
    // Add audit entry
    expense.addAuditEntry(
      'Expense Updated',
      updater._id,
      `Expense "${expense.title}" updated`,
      previousValues,
      {
        title: expense.title,
        description: expense.description,
        date: expense.date,
        amount: expense.amount,
        taxAmount: expense.taxAmount,
        categoryId: expense.categoryId,
        paymentMethod: expense.paymentMethod
      }
    );
    
    // Re-validate against policies
    await this.validateExpensePolicies(expense);
    
    // Save expense
    await expense.save();
    
    // Send notifications
    await this.sendExpenseNotifications(expense, 'updated');
    
    return expense;
  }
  
  // Submit expense for approval
  async submitExpense(params: ExpenseSubmissionRequest): Promise<IExpense> {
    const expense = await Expense.findOne({ expenseId: params.expenseId });
    if (!expense) {
      throw new Error('Expense not found');
    }
    
    if (!expense.canBeSubmitted()) {
      throw new Error('Expense cannot be submitted in current status');
    }
    
    // Validate required fields
    await this.validateSubmissionRequirements(expense);
    
    // Update expense status
    expense.status = 'submitted';
    expense.submittedAt = new Date();
    expense.submittedBy = new Types.ObjectId(params.submittedBy);
    
    if (params.reportId) {
      expense.reportId = params.reportId;
      expense.reportName = params.reportName;
      expense.reportPeriod = params.reportPeriod;
    }
    
    // Add audit entry
    expense.addAuditEntry(
      'Expense Submitted',
      new Types.ObjectId(params.submittedBy),
      `Expense "${expense.title}" submitted for approval`
    );
    
    // Initialize approval workflow
    await this.initializeApprovalWorkflow(expense);
    
    // Save expense
    await expense.save();
    
    // Send notifications
    await this.sendExpenseNotifications(expense, 'submitted');
    
    return expense;
  }
  
  // Approve/reject expense
  async processExpenseApproval(params: ExpenseApprovalRequest): Promise<IExpense> {
    const expense = await Expense.findOne({ expenseId: params.expenseId });
    if (!expense) {
      throw new Error('Expense not found');
    }
    
    if (!expense.canBeApproved() && !expense.canBeRejected()) {
      throw new Error('Expense cannot be processed in current status');
    }
    
    // Get approver info
    const approver = await User.findById(params.approverId);
    if (!approver) {
      throw new Error('Approver not found');
    }
    
    // Find the approval entry for this approver
    const approvalEntry = expense.approvals.find(app => 
      app.approverId.toString() === params.approverId && app.status === 'pending'
    );
    
    if (!approvalEntry) {
      throw new Error('No pending approval found for this approver');
    }
    
    // Update approval entry
    approvalEntry.status = params.action;
    approvalEntry.date = new Date();
    approvalEntry.comments = params.comments;
    if (params.delegatedTo) {
      approvalEntry.delegatedTo = new Types.ObjectId(params.delegatedTo);
    }
    
    // Add audit entry
    expense.addAuditEntry(
      `Expense ${params.action === 'approve' ? 'Approved' : 'Rejected'}`,
      approver._id,
      `Expense "${expense.title}" ${params.action === 'approve' ? 'approved' : 'rejected'}${params.comments ? `: ${params.comments}` : ''}`
    );
    
    if (params.action === 'approve') {
      // Check if all approvals are complete
      const allApprovalsComplete = expense.approvals.every(app => app.status === 'approved');
      
      if (allApprovalsComplete) {
        expense.status = 'approved';
        
        // Process reimbursement if applicable
        if (expense.reimbursable) {
          await this.initiateReimbursement(expense);
        }
      }
    } else {
      // Handle rejection
      expense.status = 'rejected';
      expense.rejectionReason = params.comments;
      
      if (params.rejectionDetails) {
        expense.rejectionDetails = params.rejectionDetails;
      }
    }
    
    // Save expense
    await expense.save();
    
    // Send notifications
    await this.sendExpenseNotifications(expense, params.action === 'approve' ? 'approved' : 'rejected');
    
    return expense;
  }
  
  // Clone expense
  async cloneExpense(expenseId: string, clonedBy: string, modifications?: Partial<ExpenseUpdateRequest>): Promise<IExpense> {
    const originalExpense = await Expense.findOne({ expenseId });
    if (!originalExpense) {
      throw new Error('Original expense not found');
    }
    
    // Create clone request
    const cloneRequest: ExpenseCreateRequest = {
      employeeId: originalExpense.employeeId.toString(),
      title: `${originalExpense.title} (Copy)`,
      description: originalExpense.description,
      date: new Date(),
      location: originalExpense.location,
      currency: originalExpense.currency,
      exchangeRate: originalExpense.exchangeRate,
      amount: originalExpense.amount,
      taxAmount: originalExpense.taxAmount,
      categoryId: originalExpense.categoryId.toString(),
      splits: originalExpense.splits?.map(split => ({
        categoryId: split.categoryId.toString(),
        amount: split.amount,
        percentage: split.percentage,
        description: split.description,
        customFields: split.customFields
      })),
      paymentMethod: originalExpense.paymentMethod,
      cardInfo: originalExpense.cardInfo,
      reimbursable: originalExpense.reimbursable,
      receiptRequired: originalExpense.receiptRequired,
      attachments: [], // Don't clone attachments
      mileageInfo: originalExpense.mileageInfo,
      perDiemInfo: originalExpense.perDiemInfo,
      tags: originalExpense.tags.map(tag => ({
        name: tag.name,
        color: tag.color,
        category: tag.category
      })),
      customFields: originalExpense.customFields,
      projectCode: originalExpense.projectCode,
      clientCode: originalExpense.clientCode,
      billable: originalExpense.billable,
      billableTo: originalExpense.billableTo,
      source: 'manual',
      createdBy: clonedBy
    };
    
    // Apply modifications if provided
    if (modifications) {
      if (modifications.title) cloneRequest.title = modifications.title;
      if (modifications.amount) cloneRequest.amount = modifications.amount;
      if (modifications.date) cloneRequest.date = modifications.date;
      // Apply other modifications as needed
    }
    
    // Create cloned expense
    const clonedExpense = await this.createExpense(cloneRequest);
    
    // Add audit entry to original expense
    originalExpense.addAuditEntry(
      'Expense Cloned',
      new Types.ObjectId(clonedBy),
      `Expense cloned to ${clonedExpense.expenseId}`
    );
    await originalExpense.save();
    
    return clonedExpense;
  }
  
  // Delete expense
  async deleteExpense(expenseId: string, deletedBy: string): Promise<void> {
    const expense = await Expense.findOne({ expenseId });
    if (!expense) {
      throw new Error('Expense not found');
    }
    
    if (!expense.canBeEdited()) {
      throw new Error('Expense cannot be deleted in current status');
    }
    
    // Soft delete
    expense.status = 'archived';
    expense.metadata.deletedAt = new Date();
    expense.metadata.deletedBy = new Types.ObjectId(deletedBy);
    
    // Add audit entry
    expense.addAuditEntry(
      'Expense Deleted',
      new Types.ObjectId(deletedBy),
      `Expense "${expense.title}" deleted`
    );
    
    await expense.save();
    
    // Send notifications
    await this.sendExpenseNotifications(expense, 'deleted');
  }
  
  // Get expense by ID
  async getExpenseById(expenseId: string): Promise<IExpense | null> {
    return await Expense.findOne({ expenseId });
  }
  
  // Get expenses by employee
  async getExpensesByEmployee(employeeId: string, status?: string, limit?: number): Promise<IExpense[]> {
    const query: any = { employeeId };
    if (status) {
      query.status = status;
    }
    
    let queryBuilder = Expense.find(query).sort({ date: -1 });
    if (limit) {
      queryBuilder = queryBuilder.limit(limit);
    }
    
    return await queryBuilder;
  }
  
  // Get pending approvals for user
  async getPendingApprovals(approverId: string): Promise<IExpense[]> {
    return await Expense.findPendingApprovals(approverId);
  }
  
  // Helper methods
  private async validateExpensePolicies(expense: IExpense): Promise<void> {
    // Get category policies
    const category = await ExpenseCategory.findById(expense.categoryId);
    if (!category) return;
    
    // Check receipt requirement
    if (category.policies.receiptRequired && !expense.receiptProvided) {
      expense.addPolicyViolation({
        violationId: `VIOL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        policyId: category._id.toString(),
        policyName: 'Receipt Requirement',
        description: 'Receipt is required for this expense category',
        severity: 'medium',
        action: 'warning'
      });
    }
    
    // Check maximum amount
    if (category.policies.maxAmount && expense.amount > category.policies.maxAmount) {
      expense.addPolicyViolation({
        violationId: `VIOL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        policyId: category._id.toString(),
        policyName: 'Maximum Amount',
        description: `Expense amount exceeds maximum allowed amount of ${category.policies.maxAmount}`,
        severity: 'high',
        action: 'block'
      });
    }
    
    // Check approval threshold
    if (category.approvalRules.requiresApproval && expense.amount >= category.approvalRules.approvalThreshold) {
      // This is handled by the approval workflow
    }
  }
  
  private async validateSubmissionRequirements(expense: IExpense): Promise<void> {
    const category = await ExpenseCategory.findById(expense.categoryId);
    if (!category) return;
    
    // Check required fields
    for (const field of category.policies.requiredFields) {
      if (!expense[field as keyof IExpense]) {
        throw new Error(`Required field missing: ${field}`);
      }
    }
    
    // Check receipt requirement
    if (category.policies.receiptRequired && !expense.receiptProvided) {
      throw new Error('Receipt is required for this expense');
    }
    
    // Check submission time limit
    if (category.policies.timeLimits) {
      const daysSinceExpense = Math.floor((Date.now() - expense.date.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceExpense > category.policies.timeLimits.submissionWindow) {
        throw new Error(`Expense submission window of ${category.policies.timeLimits.submissionWindow} days has passed`);
      }
    }
  }
  
  private async initializeApprovalWorkflow(expense: IExpense): Promise<void> {
    const category = await ExpenseCategory.findById(expense.categoryId);
    if (!category || !category.approvalRules.requiresApproval) {
      // Auto-approve if no approval required
      expense.status = 'approved';
      return;
    }
    
    expense.status = 'pending_approval';
    
    // Create approval entries based on category rules
    for (let i = 0; i < category.approvalRules.approverRoles.length; i++) {
      const approvers = await this.getApproversByRole(category.approvalRules.approverRoles[i]);
      
      for (const approver of approvers) {
        expense.addApproval({
          approvalId: `APR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          level: i + 1,
          approverId: approver._id,
          approverName: `${approver.firstName} ${approver.lastName}`,
          approverRole: category.approvalRules.approverRoles[i],
          status: 'pending'
        });
      }
    }
  }
  
  private async getApproversByRole(role: string): Promise<any[]> {
    // Mock implementation - would query user collection by role
    return [];
  }
  
  private async initiateReimbursement(expense: IExpense): Promise<void> {
    // Mock reimbursement initiation
    console.log(`Initiating reimbursement for expense ${expense.expenseId}`);
  }
  
  private async sendExpenseNotifications(expense: IExpense, action: string): Promise<void> {
    // Send notifications based on action
    console.log(`Sending ${action} notifications for expense ${expense.expenseId}`);
  }
}

// Import Types.ObjectId
import { Types } from 'mongoose';
