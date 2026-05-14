import { Expense, IExpense } from '../models/Expense';
import { ExpenseCategory } from '../models/ExpenseCategory';
import { User } from '../models/User';

export interface RecurringExpenseTemplate {
  templateId: string;
  templateName: string;
  description: string;
  employeeId: string;
  employeeName: string;
  department: string;
  
  // Expense Details
  title: string;
  description?: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  taxAmount?: number;
  currency: string;
  paymentMethod: 'cash' | 'personal_card' | 'corporate_card' | 'company_account' | 'advance' | 'other';
  reimbursable: boolean;
  receiptRequired: boolean;
  
  // Schedule Configuration
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
    interval: number; // e.g., every 2 weeks, every 3 months
    startDate: Date;
    endDate?: Date;
    occurrences?: number; // total number of occurrences
    dayOfWeek?: number; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
    weekOfMonth?: number; // 1-5 for monthly (e.g., first Monday)
    monthOfYear?: number; // 1-12 for yearly
    customPattern?: {
      type: 'specific_dates' | 'business_days' | 'weekdays_only';
      dates?: Date[];
      holidays?: string[]; // holiday calendars to exclude
    };
  };
  
  // Dynamic Values
  dynamicValues: {
    amount: {
      isVariable: boolean;
      calculation?: 'fixed' | 'percentage' | 'formula';
      baseAmount?: number;
      percentage?: number;
      formula?: string;
      minAmount?: number;
      maxAmount?: number;
    };
    description: {
      isVariable: boolean;
      template?: string;
      variables?: Array<{
        name: string;
        type: 'date' | 'number' | 'text';
        format?: string;
      }>;
    };
    category: {
      isVariable: boolean;
      rules?: Array<{
        condition: string;
        categoryId: string;
      }>;
    };
  };
  
  // Approval and Submission
  approval: {
    requiresApproval: boolean;
    autoSubmit: boolean;
    approvalThreshold?: number;
    approvers?: string[];
  };
  
  // Notifications
  notifications: {
    beforeCreation: {
      enabled: boolean;
      hoursBefore: number;
      recipients: string[];
    };
    afterCreation: {
      enabled: boolean;
      recipients: string[];
    };
    onFailure: {
      enabled: boolean;
      recipients: string[];
    };
  };
  
  // Limits and Controls
  limits: {
    maxAmount?: number;
    totalMonthlyLimit?: number;
    totalYearlyLimit?: number;
    requireConfirmation: boolean;
    confirmationThreshold?: number; // percentage change from last amount
  };
  
  // Status and Lifecycle
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  isActive: boolean;
  
  // Execution History
  executionHistory: Array<{
    executionId: string;
    scheduledDate: Date;
    actualDate: Date;
    expenseId?: string;
    status: 'success' | 'failed' | 'skipped';
    amount: number;
    error?: string;
    notes?: string;
  }>;
  
  // Next Execution
  nextExecutionDate?: Date;
  remainingOccurrences?: number;
  
  // Metadata
  metadata: {
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
    lastExecuted?: Date;
    totalExecutions: number;
    totalAmount: number;
    averageAmount: number;
  };
}

export interface RecurringExpenseExecution {
  executionId: string;
  templateId: string;
  templateName: string;
  scheduledDate: Date;
  
  // Execution Status
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';
  startedAt?: Date;
  completedAt?: Date;
  
  // Generated Expense
  expenseId?: string;
  expenseData?: {
    title: string;
    description: string;
    amount: number;
    date: Date;
    categoryId: string;
    dynamicValues: Record<string, any>;
  };
  
  // Processing Details
  processing: {
    attempts: number;
    maxRetries: number;
    nextRetryAt?: Date;
    errors: Array<{
      code: string;
      message: string;
      timestamp: Date;
      resolved: boolean;
    }>;
    warnings: Array<{
      code: string;
      message: string;
      timestamp: Date;
    }>;
  };
  
  // Approval Workflow
  approval?: {
    required: boolean;
    submitted: boolean;
    submittedAt?: Date;
    approved: boolean;
    approvedAt?: Date;
    approver?: string;
  };
  
  // Notifications
  notifications: {
    sent: Array<{
      type: string;
      recipient: string;
      sentAt: Date;
      status: 'sent' | 'failed';
    }>;
    pending: Array<{
      type: string;
      recipient: string;
      scheduledAt: Date;
    }>;
  };
  
  // Metadata
  metadata: {
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
  };
}

export interface RecurringExpenseAnalytics {
  period: {
    startDate: Date;
    endDate: Date;
  };
  
  // Overview Metrics
  overview: {
    totalTemplates: number;
    activeTemplates: number;
    pausedTemplates: number;
    completedTemplates: number;
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    successRate: number;
    totalAmount: number;
    averageExecutionAmount: number;
  };
  
  // Template Performance
  templatePerformance: Array<{
    templateId: string;
    templateName: string;
    employeeName: string;
    frequency: string;
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    successRate: number;
    totalAmount: number;
    averageAmount: number;
    nextExecutionDate?: Date;
    status: string;
  }>;
  
  // Execution Trends
  executionTrends: {
    monthly: Array<{
      month: string;
      executions: number;
      successes: number;
      failures: number;
      amount: number;
      successRate: number;
    }>;
    daily: Array<{
      date: string;
      executions: number;
      amount: number;
    }>;
  };
  
  // Failure Analysis
  failureAnalysis: {
    commonErrors: Array<{
      errorCode: string;
      errorMessage: string;
      count: number;
      percentage: number;
      affectedTemplates: string[];
    }>;
    failureReasons: Array<{
      reason: string;
      count: number;
      percentage: number;
    }>;
    recoveryRate: number;
    averageRetryCount: number;
  };
  
  // Forecast
  forecast: {
    nextMonth: {
      expectedExecutions: number;
      expectedAmount: number;
    };
    nextQuarter: {
      expectedExecutions: number;
      expectedAmount: number;
    };
    nextYear: {
      expectedExecutions: number;
      expectedAmount: number;
    };
  };
}

export class RecurringExpenseService {
  // Create recurring expense template
  async createRecurringTemplate(params: {
    templateName: string;
    description: string;
    employeeId: string;
    title: string;
    expenseDescription?: string;
    categoryId: string;
    amount: number;
    taxAmount?: number;
    currency?: string;
    paymentMethod: 'cash' | 'personal_card' | 'corporate_card' | 'company_account' | 'advance' | 'other';
    reimbursable?: boolean;
    receiptRequired?: boolean;
    schedule: {
      frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
      interval: number;
      startDate: Date;
      endDate?: Date;
      occurrences?: number;
      dayOfWeek?: number;
      dayOfMonth?: number;
      weekOfMonth?: number;
      monthOfYear?: number;
      customPattern?: {
        type: 'specific_dates' | 'business_days' | 'weekdays_only';
        dates?: Date[];
        holidays?: string[];
      };
    };
    dynamicValues?: {
      amount?: {
        isVariable: boolean;
        calculation?: 'fixed' | 'percentage' | 'formula';
        baseAmount?: number;
        percentage?: number;
        formula?: string;
        minAmount?: number;
        maxAmount?: number;
      };
      description?: {
        isVariable: boolean;
        template?: string;
        variables?: Array<{
          name: string;
          type: 'date' | 'number' | 'text';
          format?: string;
        }>;
      };
    };
    approval?: {
      requiresApproval?: boolean;
      autoSubmit?: boolean;
      approvalThreshold?: number;
      approvers?: string[];
    };
    notifications?: {
      beforeCreation?: {
        enabled: boolean;
        hoursBefore: number;
        recipients: string[];
      };
      afterCreation?: {
        enabled: boolean;
        recipients: string[];
      };
    };
    limits?: {
      maxAmount?: number;
      totalMonthlyLimit?: number;
      totalYearlyLimit?: number;
      requireConfirmation?: boolean;
      confirmationThreshold?: number;
    };
    createdBy: string;
  }): Promise<RecurringExpenseTemplate> {
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
    
    // Validate schedule
    this.validateSchedule(params.schedule);
    
    const templateId = `TEMPLATE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Calculate next execution date
    const nextExecutionDate = this.calculateNextExecutionDate(params.schedule);
    
    const template: RecurringExpenseTemplate = {
      templateId,
      templateName: params.templateName,
      description: params.description,
      employeeId: params.employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      department: employee.department || 'Unknown',
      
      title: params.title,
      description: params.expenseDescription,
      categoryId: params.categoryId,
      categoryName: category.name,
      amount: params.amount,
      taxAmount: params.taxAmount,
      currency: params.currency || 'USD',
      paymentMethod: params.paymentMethod,
      reimbursable: params.reimbursable ?? true,
      receiptRequired: params.receiptRequired ?? category.policies.receiptRequired,
      
      schedule: params.schedule,
      
      dynamicValues: {
        amount: params.dynamicValues?.amount || {
          isVariable: false,
          calculation: 'fixed'
        },
        description: params.dynamicValues?.description || {
          isVariable: false
        },
        category: {
          isVariable: false
        }
      },
      
      approval: {
        requiresApproval: params.approval?.requiresApproval ?? true,
        autoSubmit: params.approval?.autoSubmit ?? false,
        approvalThreshold: params.approval?.approvalThreshold,
        approvers: params.approval?.approvers || []
      },
      
      notifications: {
        beforeCreation: params.notifications?.beforeCreation || {
          enabled: false,
          hoursBefore: 24,
          recipients: []
        },
        afterCreation: params.notifications?.afterCreation || {
          enabled: true,
          recipients: [params.employeeId]
        },
        onFailure: {
          enabled: true,
          recipients: [params.employeeId]
        }
      },
      
      limits: params.limits || {},
      
      status: 'active',
      isActive: true,
      
      executionHistory: [],
      
      nextExecutionDate,
      remainingOccurrences: params.schedule.occurrences,
      
      metadata: {
        createdAt: new Date(),
        createdBy: params.createdBy,
        updatedAt: new Date(),
        updatedBy: params.createdBy,
        totalExecutions: 0,
        totalAmount: 0,
        averageAmount: params.amount
      }
    };
    
    // Save template
    await this.saveRecurringTemplate(template);
    
    // Schedule next execution
    if (template.nextExecutionDate) {
      await this.scheduleExecution(template.templateId, template.nextExecutionDate);
    }
    
    // Send notifications
    await this.sendTemplateNotifications(template, 'created');
    
    return template;
  }
  
  // Execute recurring expense
  async executeRecurringExpense(templateId: string, scheduledDate: Date): Promise<RecurringExpenseExecution> {
    const template = await this.getRecurringTemplate(templateId);
    if (!template) {
      throw new Error('Recurring expense template not found');
    }
    
    if (!template.isActive || template.status !== 'active') {
      throw new Error('Template is not active');
    }
    
    const executionId = `EXEC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const execution: RecurringExpenseExecution = {
      executionId,
      templateId,
      templateName: template.templateName,
      scheduledDate,
      
      status: 'pending',
      
      processing: {
        attempts: 0,
        maxRetries: 3,
        errors: [],
        warnings: []
      },
      
      notifications: {
        sent: [],
        pending: []
      },
      
      metadata: {
        createdAt: new Date(),
        createdBy: 'system',
        updatedAt: new Date(),
        updatedBy: 'system'
      }
    };
    
    try {
      execution.status = 'processing';
      execution.startedAt = new Date();
      execution.processing.attempts = 1;
      
      // Calculate dynamic values
      const expenseData = await this.calculateExpenseData(template, scheduledDate);
      execution.expenseData = expenseData;
      
      // Check limits
      await this.checkLimits(template, expenseData);
      
      // Create expense
      const expense = await this.createExpenseFromTemplate(template, expenseData);
      execution.expenseId = expense.expenseId;
      
      // Submit for approval if required
      if (template.approval.requiresApproval && template.approval.autoSubmit) {
        await this.submitExpenseForApproval(expense.expenseId, template.employeeId);
        execution.approval = {
          required: true,
          submitted: true,
          submittedAt: new Date()
        };
      }
      
      execution.status = 'completed';
      execution.completedAt = new Date();
      
      // Update template
      await this.updateTemplateAfterExecution(template, execution);
      
      // Schedule next execution
      await this.scheduleNextExecution(template);
      
      // Send notifications
      await this.sendExecutionNotifications(execution, 'completed');
      
    } catch (error) {
      execution.status = 'failed';
      execution.completedAt = new Date();
      execution.processing.errors.push({
        code: 'EXECUTION_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        resolved: false
      });
      
      // Schedule retry if available
      if (execution.processing.attempts < execution.processing.maxRetries) {
        execution.processing.nextRetryAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour later
        await this.scheduleRetry(execution);
      }
      
      // Send failure notifications
      await this.sendExecutionNotifications(execution, 'failed');
    }
    
    // Save execution
    await this.saveRecurringExecution(execution);
    
    return execution;
  }
  
  // Pause recurring template
  async pauseRecurringTemplate(templateId: string, pausedBy: string, reason?: string): Promise<RecurringExpenseTemplate> {
    const template = await this.getRecurringTemplate(templateId);
    if (!template) {
      throw new Error('Recurring expense template not found');
    }
    
    template.status = 'paused';
    template.isActive = false;
    template.metadata.updatedBy = pausedBy;
    template.metadata.updatedAt = new Date();
    
    // Cancel scheduled executions
    await this.cancelScheduledExecutions(templateId);
    
    await this.updateRecurringTemplate(template);
    
    // Send notifications
    await this.sendTemplateNotifications(template, 'paused');
    
    return template;
  }
  
  // Resume recurring template
  async resumeRecurringTemplate(templateId: string, resumedBy: string): Promise<RecurringExpenseTemplate> {
    const template = await this.getRecurringTemplate(templateId);
    if (!template) {
      throw new Error('Recurring expense template not found');
    }
    
    if (template.status !== 'paused') {
      throw new Error('Template is not paused');
    }
    
    template.status = 'active';
    template.isActive = true;
    template.metadata.updatedBy = resumedBy;
    template.metadata.updatedAt = new Date();
    
    // Calculate next execution date
    const nextExecutionDate = this.calculateNextExecutionDate(template.schedule, new Date());
    template.nextExecutionDate = nextExecutionDate;
    
    // Schedule next execution
    if (nextExecutionDate) {
      await this.scheduleExecution(templateId, nextExecutionDate);
    }
    
    await this.updateRecurringTemplate(template);
    
    // Send notifications
    await this.sendTemplateNotifications(template, 'resumed');
    
    return template;
  }
  
  // Modify recurring template
  async modifyRecurringTemplate(templateId: string, params: {
    title?: string;
    description?: string;
    amount?: number;
    categoryId?: string;
    schedule?: Partial<RecurringExpenseTemplate['schedule']>;
    dynamicValues?: Partial<RecurringExpenseTemplate['dynamicValues']>;
    limits?: Partial<RecurringExpenseTemplate['limits']>;
    updatedBy: string;
  }): Promise<RecurringExpenseTemplate> {
    const template = await this.getRecurringTemplate(templateId);
    if (!template) {
      throw new Error('Recurring expense template not found');
    }
    
    // Update fields
    if (params.title !== undefined) template.title = params.title;
    if (params.description !== undefined) template.description = params.description;
    if (params.amount !== undefined) template.amount = params.amount;
    if (params.categoryId !== undefined) {
      const category = await ExpenseCategory.findById(params.categoryId);
      if (category) {
        template.categoryId = params.categoryId;
        template.categoryName = category.name;
      }
    }
    
    if (params.schedule) {
      template.schedule = { ...template.schedule, ...params.schedule };
      template.nextExecutionDate = this.calculateNextExecutionDate(template.schedule);
    }
    
    if (params.dynamicValues) {
      template.dynamicValues = { ...template.dynamicValues, ...params.dynamicValues };
    }
    
    if (params.limits) {
      template.limits = { ...template.limits, ...params.limits };
    }
    
    template.metadata.updatedBy = params.updatedBy;
    template.metadata.updatedAt = new Date();
    
    // Reschedule if execution date changed
    if (params.schedule && template.nextExecutionDate) {
      await this.cancelScheduledExecutions(templateId);
      await this.scheduleExecution(templateId, template.nextExecutionDate);
    }
    
    await this.updateRecurringTemplate(template);
    
    // Send notifications
    await this.sendTemplateNotifications(template, 'modified');
    
    return template;
  }
  
  // Get recurring analytics
  async getRecurringAnalytics(params: {
    startDate: Date;
    endDate: Date;
    filters?: {
      employeeId?: string;
      categoryId?: string;
      status?: string;
    };
  }): Promise<RecurringExpenseAnalytics> {
    // Mock analytics data
    return {
      period: {
        startDate: params.startDate,
        endDate: params.endDate
      },
      
      overview: {
        totalTemplates: 150,
        activeTemplates: 120,
        pausedTemplates: 20,
        completedTemplates: 10,
        totalExecutions: 2500,
        successfulExecutions: 2350,
        failedExecutions: 150,
        successRate: 94.0,
        totalAmount: 125000,
        averageExecutionAmount: 50.00
      },
      
      templatePerformance: [
        {
          templateId: 'template1',
          templateName: 'Monthly Software Subscription',
          employeeName: 'John Doe',
          frequency: 'monthly',
          totalExecutions: 12,
          successfulExecutions: 12,
          failedExecutions: 0,
          successRate: 100.0,
          totalAmount: 600,
          averageAmount: 50.00,
          nextExecutionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'active'
        }
      ],
      
      executionTrends: {
        monthly: [
          { month: '2024-01', executions: 200, successes: 190, failures: 10, amount: 10000, successRate: 95.0 },
          { month: '2024-02', executions: 210, successes: 198, failures: 12, amount: 10500, successRate: 94.3 }
        ],
        daily: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          executions: Math.floor(Math.random() * 10) + 5,
          amount: Math.floor(Math.random() * 500) + 250
        }))
      },
      
      failureAnalysis: {
        commonErrors: [
          {
            errorCode: 'INSUFFICIENT_FUNDS',
            errorMessage: 'Insufficient funds in account',
            count: 45,
            percentage: 30.0,
            affectedTemplates: ['template1', 'template2']
          }
        ],
        failureReasons: [
          { reason: 'Payment method expired', count: 60, percentage: 40.0 },
          { reason: 'Category not found', count: 30, percentage: 20.0 },
          { reason: 'Employee inactive', count: 30, percentage: 20.0 },
          { reason: 'Other', count: 30, percentage: 20.0 }
        ],
        recoveryRate: 85.0,
        averageRetryCount: 1.2
      },
      
      forecast: {
        nextMonth: {
          expectedExecutions: 220,
          expectedAmount: 11000
        },
        nextQuarter: {
          expectedExecutions: 660,
          expectedAmount: 33000
        },
        nextYear: {
          expectedExecutions: 2640,
          expectedAmount: 132000
        }
      }
    };
  }
  
  // Helper methods
  private validateSchedule(schedule: RecurringExpenseTemplate['schedule']): void {
    if (schedule.startDate <= new Date()) {
      throw new Error('Start date must be in the future');
    }
    
    if (schedule.endDate && schedule.endDate <= schedule.startDate) {
      throw new Error('End date must be after start date');
    }
    
    if (schedule.interval <= 0) {
      throw new Error('Interval must be greater than 0');
    }
    
    // Validate frequency-specific requirements
    switch (schedule.frequency) {
      case 'weekly':
        if (schedule.dayOfWeek === undefined || schedule.dayOfWeek < 0 || schedule.dayOfWeek > 6) {
          throw new Error('Day of week is required for weekly frequency');
        }
        break;
      case 'monthly':
        if (schedule.dayOfMonth === undefined && schedule.weekOfMonth === undefined) {
          throw new Error('Either day of month or week of month is required for monthly frequency');
        }
        break;
      case 'yearly':
        if (schedule.monthOfYear === undefined || schedule.monthOfYear < 1 || schedule.monthOfYear > 12) {
          throw new Error('Month of year is required for yearly frequency');
        }
        break;
    }
  }
  
  private calculateNextExecutionDate(schedule: RecurringExpenseTemplate['schedule'], fromDate?: Date): Date {
    const baseDate = fromDate || new Date();
    let nextDate = new Date(schedule.startDate);
    
    // If start date is in the past, calculate from current date
    if (nextDate < baseDate) {
      nextDate = new Date(baseDate);
    }
    
    switch (schedule.frequency) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + schedule.interval);
        break;
      case 'weekly':
        const daysToAdd = schedule.interval * 7;
        nextDate.setDate(nextDate.getDate() + daysToAdd);
        if (schedule.dayOfWeek !== undefined) {
          nextDate = this.getNextWeekday(nextDate, schedule.dayOfWeek);
        }
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + schedule.interval);
        if (schedule.dayOfMonth) {
          nextDate.setDate(schedule.dayOfMonth);
        } else if (schedule.weekOfMonth) {
          nextDate = this.getNthWeekdayOfMonth(nextDate, schedule.weekOfMonth, schedule.dayOfWeek || 1);
        }
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + (3 * schedule.interval));
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + schedule.interval);
        if (schedule.monthOfYear) {
          nextDate.setMonth(schedule.monthOfYear - 1);
        }
        break;
      case 'custom':
        // Handle custom patterns
        break;
    }
    
    // Check if next date exceeds end date
    if (schedule.endDate && nextDate > schedule.endDate) {
      return new Date(0); // Return invalid date to indicate no more executions
    }
    
    return nextDate;
  }
  
  private getNextWeekday(date: Date, dayOfWeek: number): Date {
    const currentDay = date.getDay();
    let daysToAdd = dayOfWeek - currentDay;
    if (daysToAdd <= 0) {
      daysToAdd += 7;
    }
    const result = new Date(date);
    result.setDate(result.getDate() + daysToAdd);
    return result;
  }
  
  private getNthWeekdayOfMonth(date: Date, weekOfMonth: number, dayOfWeek: number): Date {
    const result = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstDayOfWeek = this.getNextWeekday(result, dayOfWeek);
    result.setDate(firstDayOfWeek.getDate() + (weekOfMonth - 1) * 7);
    return result;
  }
  
  private async calculateExpenseData(template: RecurringExpenseTemplate, scheduledDate: Date): Promise<any> {
    const expenseData = {
      title: template.title,
      description: template.description || '',
      amount: template.amount,
      date: scheduledDate,
      categoryId: template.categoryId,
      dynamicValues: {}
    };
    
    // Calculate dynamic amount
    if (template.dynamicValues.amount.isVariable) {
      expenseData.amount = await this.calculateDynamicAmount(template.dynamicValues.amount, scheduledDate);
    }
    
    // Calculate dynamic description
    if (template.dynamicValues.description.isVariable && template.dynamicValues.description.template) {
      expenseData.description = await this.processTemplateString(
        template.dynamicValues.description.template,
        scheduledDate,
        expenseData
      );
    }
    
    return expenseData;
  }
  
  private async calculateDynamicAmount(amountConfig: any, date: Date): Promise<number> {
    switch (amountConfig.calculation) {
      case 'fixed':
        return amountConfig.baseAmount || 0;
      case 'percentage':
        return (amountConfig.baseAmount || 0) * (amountConfig.percentage || 1);
      case 'formula':
        // Mock formula evaluation
        return amountConfig.baseAmount || 0;
      default:
        return 0;
    }
  }
  
  private async processTemplateString(template: string, date: Date, data: any): Promise<string> {
    return template
      .replace(/\{date\}/g, date.toISOString().split('T')[0])
      .replace(/\{amount\}/g, data.amount.toString())
      .replace(/\{month\}/g, date.toLocaleString('default', { month: 'long' }));
  }
  
  private async checkLimits(template: RecurringExpenseTemplate, expenseData: any): Promise<void> {
    // Check max amount
    if (template.limits.maxAmount && expenseData.amount > template.limits.maxAmount) {
      throw new Error(`Amount ${expenseData.amount} exceeds maximum limit ${template.limits.maxAmount}`);
    }
    
    // Check monthly limit (mock implementation)
    if (template.limits.totalMonthlyLimit) {
      const currentMonthTotal = await this.getCurrentMonthTotal(template.templateId);
      if (currentMonthTotal + expenseData.amount > template.limits.totalMonthlyLimit) {
        throw new Error('Monthly limit would be exceeded');
      }
    }
  }
  
  private async createExpenseFromTemplate(template: RecurringExpenseTemplate, expenseData: any): Promise<IExpense> {
    // Mock expense creation
    const expense = {
      expenseId: `EXP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      title: expenseData.title,
      description: expenseData.description,
      amount: expenseData.amount,
      totalAmount: expenseData.amount,
      date: expenseData.date,
      categoryId: expenseData.categoryId,
      employeeId: template.employeeId,
      status: 'draft',
      source: 'recurring',
      sourceReference: template.templateId
    } as IExpense;
    
    return expense;
  }
  
  private async submitExpenseForApproval(expenseId: string, employeeId: string): Promise<void> {
    // Mock submission
    console.log(`Submitting expense ${expenseId} for approval`);
  }
  
  private async updateTemplateAfterExecution(template: RecurringExpenseTemplate, execution: RecurringExpenseExecution): Promise<void> {
    template.executionHistory.push({
      executionId: execution.executionId,
      scheduledDate: execution.scheduledDate,
      actualDate: execution.completedAt || new Date(),
      expenseId: execution.expenseId,
      status: execution.status as 'success' | 'failed' | 'skipped',
      amount: execution.expenseData?.amount || 0
    });
    
    template.metadata.totalExecutions++;
    template.metadata.totalAmount += execution.expenseData?.amount || 0;
    template.metadata.averageAmount = template.metadata.totalAmount / template.metadata.totalExecutions;
    template.metadata.lastExecuted = execution.completedAt;
    
    if (template.remainingOccurrences !== undefined) {
      template.remainingOccurrences--;
      if (template.remainingOccurrences <= 0) {
        template.status = 'completed';
        template.isActive = false;
      }
    }
    
    await this.updateRecurringTemplate(template);
  }
  
  private async scheduleNextExecution(template: RecurringExpenseTemplate): Promise<void> {
    if (template.status !== 'active' || !template.isActive) {
      return;
    }
    
    const nextDate = this.calculateNextExecutionDate(template.schedule);
    if (nextDate.getTime() > 0) { // Valid date
      template.nextExecutionDate = nextDate;
      await this.scheduleExecution(template.templateId, nextDate);
    } else {
      // No more executions
      template.status = 'completed';
      template.isActive = false;
      template.nextExecutionDate = undefined;
    }
    
    await this.updateRecurringTemplate(template);
  }
  
  private async getCurrentMonthTotal(templateId: string): Promise<number> {
    // Mock implementation
    return 0;
  }
  
  // Database operations (mock implementations)
  private async saveRecurringTemplate(template: RecurringExpenseTemplate): Promise<void> {
    console.log(`Saving recurring template ${template.templateId}`);
  }
  
  private async updateRecurringTemplate(template: RecurringExpenseTemplate): Promise<void> {
    console.log(`Updating recurring template ${template.templateId}`);
  }
  
  private async getRecurringTemplate(templateId: string): Promise<RecurringExpenseTemplate | null> {
    // Mock implementation
    return null;
  }
  
  private async saveRecurringExecution(execution: RecurringExpenseExecution): Promise<void> {
    console.log(`Saving recurring execution ${execution.executionId}`);
  }
  
  private async scheduleExecution(templateId: string, executionDate: Date): Promise<void> {
    console.log(`Scheduling execution for template ${templateId} at ${executionDate}`);
  }
  
  private async cancelScheduledExecutions(templateId: string): Promise<void> {
    console.log(`Cancelling scheduled executions for template ${templateId}`);
  }
  
  private async scheduleRetry(execution: RecurringExpenseExecution): Promise<void> {
    console.log(`Scheduling retry for execution ${execution.executionId}`);
  }
  
  private async sendTemplateNotifications(template: RecurringExpenseTemplate, action: string): Promise<void> {
    console.log(`Sending ${action} notifications for template ${template.templateId}`);
  }
  
  private async sendExecutionNotifications(execution: RecurringExpenseExecution, action: string): Promise<void> {
    console.log(`Sending ${action} notifications for execution ${execution.executionId}`);
  }
}
