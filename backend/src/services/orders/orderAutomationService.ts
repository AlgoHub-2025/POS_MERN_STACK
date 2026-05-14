import { Order, IOrder } from '../../models/Order';
import { Customer } from '../../models/Customer';
import { Inventory } from '../../models/Inventory';
import { Product } from '../../models/Product';

export interface AutomationRule {
  ruleId: string;
  name: string;
  description: string;
  category: 'routing' | 'prioritization' | 'allocation' | 'notification' | 'fulfillment' | 'pricing' | 'validation';
  trigger: {
    type: 'order_created' | 'order_updated' | 'payment_received' | 'inventory_low' | 'customer_segment' | 'time_based' | 'external_event';
    conditions: Array<{
      field: string;
      operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'not_in';
      value: any;
      logicalOperator?: 'and' | 'or';
    }>;
    schedule?: {
      frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'hourly';
      time?: string; // HH:MM format
      dayOfWeek?: number; // 0-6 (Sunday-Saturday)
      dayOfMonth?: number; // 1-31
    };
  };
  actions: Array<{
    type: 'update_status' | 'assign_user' | 'send_notification' | 'apply_discount' | 'route_to_location' | 'reserve_inventory' | 'escalate' | 'create_task' | 'call_webhook' | 'update_field';
    parameters: Record<string, any>;
    order?: number; // Execution order
    delay?: number; // Delay in seconds
  }>;
  conditions: {
    enabled: boolean;
    priority: number; // 1-100, higher = more priority
    maxExecutions?: number; // Limit executions
    timeWindow?: {
      start: string; // HH:MM
      end: string;   // HH:MM
      days: number[]; // 0-6 (Sunday-Saturday)
    };
    userRoles?: string[]; // Roles that can trigger rule
    orderTypes?: string[];
    customerSegments?: string[];
    priceRange?: {
      min?: number;
      max?: number;
    };
  };
  performance: {
    executions: number;
    successes: number;
    failures: number;
    averageExecutionTime: number;
    lastExecuted?: Date;
    lastSuccess?: Date;
    lastFailure?: Date;
  };
  status: 'active' | 'inactive' | 'paused' | 'testing';
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    version: number;
    tags?: string[];
  };
}

export interface AutomationExecution {
  executionId: string;
  ruleId: string;
  ruleName: string;
  orderId: string;
  orderNumber: string;
  trigger: {
    type: string;
    timestamp: Date;
    data?: any;
  };
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  actions: Array<{
    type: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
    startTime?: Date;
    endTime?: Date;
    result?: any;
    error?: string;
    executionTime?: number;
  }>;
  context: {
    order: any;
    customer: any;
    inventory: any;
    user?: any;
    environment: Record<string, any>;
  };
  results: {
    success: boolean;
    message?: string;
    data?: any;
    errors?: string[];
    warnings?: string[];
  };
  timing: {
    startedAt: Date;
    completedAt?: Date;
    duration?: number; // milliseconds
  };
  metadata: {
    executedBy: string;
    executionEnvironment: 'production' | 'staging' | 'development';
    testMode: boolean;
  };
}

export interface AutomationAnalytics {
  summary: {
    totalRules: number;
    activeRules: number;
    totalExecutions: number;
    successRate: number;
    averageExecutionTime: number;
    topPerformingRules: Array<{
      ruleId: string;
      ruleName: string;
      executions: number;
      successRate: number;
    }>;
  };
  byCategory: Record<string, {
    rules: number;
    executions: number;
    successRate: number;
    averageTime: number;
  }>;
  byTrigger: Record<string, {
    executions: number;
    successRate: number;
    averageTime: number;
  }>;
  performance: {
    executionTimes: Array<{
      date: string;
      average: number;
      target: number;
      achievement: number;
    }>;
    successRates: Array<{
      date: string;
      rate: number;
      target: number;
    }>;
    volume: Array<{
      date: string;
      executions: number;
    }>;
  };
  issues: Array<{
    type: 'rule_failure' | 'action_failure' | 'timeout' | 'permission_error';
    count: number;
    percentage: number;
    impact: string;
    trends: 'increasing' | 'decreasing' | 'stable';
  }>;
  recommendations: Array<{
    type: 'optimization' | 'performance' | 'reliability' | 'maintenance';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    expectedImpact: string;
    implementation: string;
  }>;
}

export interface WorkflowTemplate {
  templateId: string;
  name: string;
  description: string;
  category: 'order_processing' | 'customer_service' | 'inventory_management' | 'fulfillment' | 'returns' | 'compliance';
  steps: Array<{
    stepId: string;
    name: string;
    description: string;
    type: 'manual' | 'automated' | 'conditional' | 'parallel' | 'approval';
    configuration: {
      assignee?: string;
      dueIn?: number; // hours
      dependencies?: string[]; // step IDs
      conditions?: Array<{
        field: string;
        operator: string;
        value: any;
      }>;
      actions?: Array<{
        type: string;
        parameters: Record<string, any>;
      }>;
      approvals?: {
        required: number;
        approvers: string[];
        timeout?: number; // hours
      };
      sla?: {
        target: number; // hours
        warning: number; // hours
      };
    };
    order: number;
    optional: boolean;
  }>;
  triggers: Array<{
    type: string;
    conditions: Record<string, any>;
  }>;
  variables: Array<{
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date' | 'object';
    required: boolean;
    defaultValue?: any;
    description?: string;
  }>;
  permissions: {
    canStart: string[];
    canView: string[];
    canEdit: string[];
  };
  status: 'draft' | 'active' | 'inactive' | 'archived';
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    version: number;
    usageCount: number;
  };
}

export class OrderAutomationService {
  private rules: Map<string, AutomationRule> = new Map();
  private executions: Map<string, AutomationExecution> = new Map();
  private templates: Map<string, WorkflowTemplate> = new Map();
  private scheduledJobs: Map<string, any> = new Map();

  constructor() {
    this.initializeDefaultRules();
    this.initializeWorkflowTemplates();
    this.startScheduledJobs();
  }

  // Create automation rule
  async createRule(rule: Omit<AutomationRule, 'ruleId' | 'performance' | 'metadata' | 'status'>, createdBy: string): Promise<AutomationRule> {
    const newRule: AutomationRule = {
      ruleId: this.generateRuleId(),
      ...rule,
      performance: {
        executions: 0,
        successes: 0,
        failures: 0,
        averageExecutionTime: 0
      },
      status: 'inactive',
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy,
        updatedBy: createdBy,
        version: 1
      }
    };

    // Validate rule
    await this.validateRule(newRule);

    // Save rule
    this.rules.set(newRule.ruleId, newRule);

    return newRule;
  }

  // Update automation rule
  async updateRule(ruleId: string, updates: Partial<AutomationRule>, updatedBy: string): Promise<AutomationRule> {
    const rule = this.rules.get(ruleId);
    if (!rule) {
      throw new Error('Rule not found');
    }

    // Apply updates
    const updatedRule = {
      ...rule,
      ...updates,
      metadata: {
        ...rule.metadata,
        updatedAt: new Date(),
        updatedBy,
        version: rule.metadata.version + 1
      }
    };

    // Validate updated rule
    await this.validateRule(updatedRule);

    // Save updated rule
    this.rules.set(ruleId, updatedRule);

    return updatedRule;
  }

  // Delete automation rule
  async deleteRule(ruleId: string): Promise<void> {
    const rule = this.rules.get(ruleId);
    if (!rule) {
      throw new Error('Rule not found');
    }

    // Check if rule is being executed
    const activeExecutions = Array.from(this.executions.values())
      .filter(exec => exec.ruleId === ruleId && ['pending', 'running'].includes(exec.status));

    if (activeExecutions.length > 0) {
      throw new Error('Cannot delete rule with active executions');
    }

    // Remove rule
    this.rules.delete(ruleId);
  }

  // Execute rule manually
  async executeRule(ruleId: string, orderId: string, context?: any, executedBy?: string): Promise<AutomationExecution> {
    const rule = this.rules.get(ruleId);
    if (!rule) {
      throw new Error('Rule not found');
    }

    if (rule.status !== 'active') {
      throw new Error('Rule is not active');
    }

    // Get order
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Create execution record
    const execution: AutomationExecution = {
      executionId: this.generateExecutionId(),
      ruleId: rule.ruleId,
      ruleName: rule.name,
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      trigger: {
        type: 'manual',
        timestamp: new Date(),
        data: context
      },
      status: 'pending',
      actions: rule.actions.map(action => ({
        type: action.type,
        status: 'pending'
      })),
      context: {
        order: order.toObject(),
        customer: order.customer,
        inventory: {},
        user: context?.user,
        environment: context?.environment || {}
      },
      results: {
        success: false
      },
      timing: {
        startedAt: new Date()
      },
      metadata: {
        executedBy: executedBy || 'system',
        executionEnvironment: 'production',
        testMode: false
      }
    };

    this.executions.set(execution.executionId, execution);

    // Execute rule asynchronously
    this.processExecution(execution, rule).catch(error => {
      console.error(`Rule execution failed: ${error.message}`);
    });

    return execution;
  }

  // Process order event and trigger rules
  async processOrderEvent(eventType: string, orderId: string, data?: any): Promise<AutomationExecution[]> {
    const executions: AutomationExecution[] = [];

    // Get order
    const order = await Order.findById(orderId);
    if (!order) {
      return executions;
    }

    // Find applicable rules
    const applicableRules = Array.from(this.rules.values())
      .filter(rule => rule.status === 'active')
      .filter(rule => rule.trigger.type === eventType)
      .filter(rule => this.evaluateTriggerConditions(rule.trigger.conditions, order, data))
      .sort((a, b) => b.conditions.priority - a.conditions.priority);

    // Execute each applicable rule
    for (const rule of applicableRules) {
      try {
        const execution = await this.executeRule(rule.ruleId, orderId, { event: data });
        executions.push(execution);
      } catch (error) {
        console.error(`Failed to execute rule ${rule.ruleId}: ${error.message}`);
      }
    }

    return executions;
  }

  // Get execution status
  async getExecution(executionId: string): Promise<AutomationExecution | null> {
    return this.executions.get(executionId) || null;
  }

  // Cancel execution
  async cancelExecution(executionId: string, reason?: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error('Execution not found');
    }

    if (!['pending', 'running'].includes(execution.status)) {
      throw new Error('Cannot cancel completed execution');
    }

    execution.status = 'cancelled';
    execution.timing.completedAt = new Date();
    execution.timing.duration = execution.timing.completedAt.getTime() - execution.timing.startedAt.getTime();
    execution.results.message = reason || 'Cancelled by user';
  }

  // Get automation analytics
  async getAutomationAnalytics(startDate: Date, endDate: Date): Promise<AutomationAnalytics> {
    // Get executions within date range
    const executions = await this.getExecutionsByDateRange(startDate, endDate);

    // Calculate summary
    const summary = this.calculateAutomationSummary(executions);

    // Analyze by category
    const byCategory = this.analyzeByCategory(executions);

    // Analyze by trigger
    const byTrigger = this.analyzeByTrigger(executions);

    // Calculate performance metrics
    const performance = await this.calculateAutomationPerformance(executions, startDate, endDate);

    // Identify issues
    const issues = await this.identifyAutomationIssues(executions);

    // Generate recommendations
    const recommendations = await this.generateAutomationRecommendations(executions, summary, issues);

    return {
      summary,
      byCategory,
      byTrigger,
      performance,
      issues,
      recommendations
    };
  }

  // Create workflow from template
  async createWorkflowFromTemplate(templateId: string, variables: Record<string, any>, createdBy: string): Promise<any> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    // Validate variables
    await this.validateTemplateVariables(template, variables);

    // Create workflow instance
    const workflow = {
      workflowId: this.generateWorkflowId(),
      templateId: template.templateId,
      name: template.name,
      status: 'active',
      steps: template.steps.map(step => ({
        ...step,
        status: 'pending',
        startTime: null,
        endTime: null,
        assignee: null,
        results: null
      })),
      variables,
      createdAt: new Date(),
      createdBy
    };

    return workflow;
  }

  // Private methods
  private async validateRule(rule: AutomationRule): Promise<void> {
    // Validate trigger
    if (!rule.trigger || !rule.trigger.type) {
      throw new Error('Rule trigger is required');
    }

    // Validate actions
    if (!rule.actions || rule.actions.length === 0) {
      throw new Error('At least one action is required');
    }

    // Validate action types
    const validActionTypes = [
      'update_status', 'assign_user', 'send_notification', 'apply_discount',
      'route_to_location', 'reserve_inventory', 'escalate', 'create_task',
      'call_webhook', 'update_field'
    ];

    for (const action of rule.actions) {
      if (!validActionTypes.includes(action.type)) {
        throw new Error(`Invalid action type: ${action.type}`);
      }
    }

    // Validate conditions
    if (rule.conditions.timeWindow) {
      if (rule.conditions.timeWindow.start >= rule.conditions.timeWindow.end) {
        throw new Error('Time window end must be after start');
      }
    }
  }

  private evaluateTriggerConditions(conditions: any[], order: IOrder, data?: any): boolean {
    if (!conditions || conditions.length === 0) {
      return true;
    }

    return conditions.every(condition => {
      const fieldValue = this.getFieldValue(order, condition.field, data);
      return this.compareValues(fieldValue, condition.operator, condition.value);
    });
  }

  private getFieldValue(order: IOrder, field: string, data?: any): any {
    // Handle nested field access
    const parts = field.split('.');
    let value: any = order;

    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = value[part];
      } else {
        value = undefined;
        break;
      }
    }

    // If not found in order, check in additional data
    if (value === undefined && data) {
      value = data[field];
    }

    return value;
  }

  private compareValues(fieldValue: any, operator: string, conditionValue: any): boolean {
    switch (operator) {
      case 'equals':
        return fieldValue === conditionValue;
      case 'not_equals':
        return fieldValue !== conditionValue;
      case 'greater_than':
        return Number(fieldValue) > Number(conditionValue);
      case 'less_than':
        return Number(fieldValue) < Number(conditionValue);
      case 'contains':
        return String(fieldValue).includes(String(conditionValue));
      case 'in':
        return Array.isArray(conditionValue) && conditionValue.includes(fieldValue);
      case 'not_in':
        return Array.isArray(conditionValue) && !conditionValue.includes(fieldValue);
      default:
        return false;
    }
  }

  private async processExecution(execution: AutomationExecution, rule: AutomationRule): Promise<void> {
    execution.status = 'running';

    try {
      // Update rule performance
      rule.performance.executions++;
      rule.performance.lastExecuted = new Date();

      const startTime = Date.now();

      // Execute actions in order
      for (let i = 0; i < rule.actions.length; i++) {
        const action = rule.actions[i];
        const actionExecution = execution.actions[i];

        try {
          // Apply delay if specified
          if (action.delay && action.delay > 0) {
            await new Promise(resolve => setTimeout(resolve, action.delay * 1000));
          }

          actionExecution.status = 'running';
          actionExecution.startTime = new Date();

          // Execute action
          const result = await this.executeAction(action, execution.context, execution);

          actionExecution.status = 'completed';
          actionExecution.endTime = new Date();
          actionExecution.result = result;
          actionExecution.executionTime = actionExecution.endTime.getTime() - actionExecution.startTime!.getTime();

        } catch (error) {
          actionExecution.status = 'failed';
          actionExecution.endTime = new Date();
          actionExecution.error = error.message;
          
          // Stop execution on action failure
          throw error;
        }
      }

      // Mark execution as successful
      execution.status = 'completed';
      execution.results.success = true;
      execution.results.message = 'All actions executed successfully';
      rule.performance.successes++;
      rule.performance.lastSuccess = new Date();

    } catch (error) {
      // Mark execution as failed
      execution.status = 'failed';
      execution.results.success = false;
      execution.results.errors = [error.message];
      rule.performance.failures++;
      rule.performance.lastFailure = new Date();

    } finally {
      // Update timing
      execution.timing.completedAt = new Date();
      execution.timing.duration = execution.timing.completedAt.getTime() - execution.timing.startedAt.getTime();

      // Update rule performance
      const executionTime = execution.timing.duration || 0;
      const totalExecutions = rule.performance.executions;
      rule.performance.averageExecutionTime = 
        (rule.performance.averageExecutionTime * (totalExecutions - 1) + executionTime) / totalExecutions;
    }
  }

  private async executeAction(action: any, context: any, execution: AutomationExecution): Promise<any> {
    switch (action.type) {
      case 'update_status':
        return await this.executeUpdateStatus(action.parameters, context);
      case 'assign_user':
        return await this.executeAssignUser(action.parameters, context);
      case 'send_notification':
        return await this.executeSendNotification(action.parameters, context);
      case 'apply_discount':
        return await this.executeApplyDiscount(action.parameters, context);
      case 'route_to_location':
        return await this.executeRouteToLocation(action.parameters, context);
      case 'reserve_inventory':
        return await this.executeReserveInventory(action.parameters, context);
      case 'escalate':
        return await this.executeEscalate(action.parameters, context, execution);
      case 'create_task':
        return await this.executeCreateTask(action.parameters, context);
      case 'call_webhook':
        return await this.executeCallWebhook(action.parameters, context);
      case 'update_field':
        return await this.executeUpdateField(action.parameters, context);
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  private async executeUpdateStatus(parameters: any, context: any): Promise<any> {
    const { status, reason } = parameters;
    const order = context.order;

    // Update order status
    order.status = status;
    if (reason) {
      order.metadata.statusReason = reason;
    }

    await Order.findByIdAndUpdate(order._id, { 
      status, 
      'metadata.statusReason': reason,
      'metadata.statusUpdatedAt': new Date()
    });

    return { status, reason };
  }

  private async executeAssignUser(parameters: any, context: any): Promise<any> {
    const { userId, role } = parameters;
    const order = context.order;

    // Assign user to order
    order.assignedTo = userId;
    order.assignedRole = role;

    await Order.findByIdAndUpdate(order._id, { 
      assignedTo: userId,
      assignedRole: role,
      'metadata.assignedAt': new Date()
    });

    return { userId, role };
  }

  private async executeSendNotification(parameters: any, context: any): Promise<any> {
    const { type, recipients, template, data } = parameters;
    const order = context.order;

    // Mock notification sending
    console.log(`Sending ${type} notification to ${recipients.join(', ')} for order ${order.orderNumber}`);

    return { type, recipients, sent: true };
  }

  private async executeApplyDiscount(parameters: any, context: any): Promise<any> {
    const { discountType, amount, reason } = parameters;
    const order = context.order;

    // Apply discount to order
    const discount = {
      type: discountType,
      amount,
      reason,
      appliedAt: new Date()
    };

    order.discounts = order.discounts || [];
    order.discounts.push(discount);
    order.total = Math.max(0, order.total - amount);

    await Order.findByIdAndUpdate(order._id, { 
      discounts: order.discounts,
      total: order.total
    });

    return { discount, newTotal: order.total };
  }

  private async executeRouteToLocation(parameters: any, context: any): Promise<any> {
    const { locationId, priority } = parameters;
    const order = context.order;

    // Route order to location
    order.routing = {
      locationId,
      priority: priority || 'normal',
      routedAt: new Date()
    };

    await Order.findByIdAndUpdate(order._id, { 
      routing: order.routing
    });

    return { locationId, priority };
  }

  private async executeReserveInventory(parameters: any, context: any): Promise<any> {
    const { items, duration } = parameters;
    const order = context.order;

    // Mock inventory reservation
    console.log(`Reserving inventory for order ${order.orderNumber}:`, items);

    return { items, reserved: true };
  }

  private async executeEscalate(parameters: any, context: any, execution: AutomationExecution): Promise<any> {
    const { level, reason, assignTo } = parameters;
    const order = context.order;

    // Escalate order
    order.escalation = {
      level,
      reason,
      escalatedAt: new Date(),
      escalatedBy: execution.metadata.executedBy
    };

    if (assignTo) {
      order.assignedTo = assignTo;
    }

    await Order.findByIdAndUpdate(order._id, { 
      escalation: order.escalation,
      assignedTo: order.assignedTo
    });

    return { level, reason, assignedTo: assignTo };
  }

  private async executeCreateTask(parameters: any, context: any): Promise<any> {
    const { title, description, assignTo, dueIn, priority } = parameters;
    const order = context.order;

    // Mock task creation
    const task = {
      taskId: this.generateTaskId(),
      title,
      description,
      orderId: order._id,
      assignTo,
      dueDate: new Date(Date.now() + (dueIn || 24) * 60 * 60 * 1000),
      priority: priority || 'normal',
      status: 'open',
      createdAt: new Date()
    };

    console.log(`Created task: ${task.title} for order ${order.orderNumber}`);

    return task;
  }

  private async executeCallWebhook(parameters: any, context: any): Promise<any> {
    const { url, method, headers, body } = parameters;
    const order = context.order;

    // Mock webhook call
    console.log(`Calling webhook ${method} ${url} for order ${order.orderNumber}`);

    return { url, method, success: true };
  }

  private async executeUpdateField(parameters: any, context: any): Promise<any> {
    const { field, value } = parameters;
    const order = context.order;

    // Update specific field
    const update: any = {};
    update[field] = value;

    await Order.findByIdAndUpdate(order._id, update);

    return { field, value };
  }

  // Analytics helper methods
  private async getExecutionsByDateRange(startDate: Date, endDate: Date): Promise<AutomationExecution[]> {
    // Mock implementation
    return Array.from(this.executions.values());
  }

  private calculateAutomationSummary(executions: AutomationExecution[]): any {
    const totalExecutions = executions.length;
    const successfulExecutions = executions.filter(e => e.status === 'completed').length;
    const successRate = totalExecutions > 0 ? successfulExecutions / totalExecutions : 0;
    const averageExecutionTime = totalExecutions > 0 ? 
      executions.reduce((sum, e) => sum + (e.timing.duration || 0), 0) / totalExecutions : 0;

    const rulesByExecution = executions.reduce((acc, exec) => {
      acc[exec.ruleId] = (acc[exec.ruleId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topPerformingRules = Object.entries(rulesByExecution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([ruleId, executions]) => {
        const rule = this.rules.get(ruleId);
        return {
          ruleId,
          ruleName: rule?.name || 'Unknown',
          executions,
          successRate: 0.95 // Mock value
        };
      });

    return {
      totalRules: this.rules.size,
      activeRules: Array.from(this.rules.values()).filter(r => r.status === 'active').length,
      totalExecutions,
      successRate,
      averageExecutionTime,
      topPerformingRules
    };
  }

  private analyzeByCategory(executions: AutomationExecution[]): Record<string, any> {
    const byCategory: Record<string, any> = {};

    executions.forEach(execution => {
      const rule = this.rules.get(execution.ruleId);
      const category = rule?.category || 'unknown';

      if (!byCategory[category]) {
        byCategory[category] = {
          rules: 0,
          executions: 0,
          successRate: 0,
          averageTime: 0
        };
      }

      byCategory[category].executions++;
    });

    // Calculate metrics
    Object.keys(byCategory).forEach(category => {
      const categoryExecutions = executions.filter(e => {
        const rule = this.rules.get(e.ruleId);
        return rule?.category === category;
      });

      const successful = categoryExecutions.filter(e => e.status === 'completed').length;
      byCategory[category].successRate = categoryExecutions.length > 0 ? successful / categoryExecutions.length : 0;
      byCategory[category].averageTime = categoryExecutions.length > 0 ? 
        categoryExecutions.reduce((sum, e) => sum + (e.timing.duration || 0), 0) / categoryExecutions.length : 0;
    });

    return byCategory;
  }

  private analyzeByTrigger(executions: AutomationExecution[]): Record<string, any> {
    const byTrigger: Record<string, any> = {};

    executions.forEach(execution => {
      const trigger = execution.trigger.type;

      if (!byTrigger[trigger]) {
        byTrigger[trigger] = {
          executions: 0,
          successRate: 0,
          averageTime: 0
        };
      }

      byTrigger[trigger].executions++;
    });

    // Calculate metrics
    Object.keys(byTrigger).forEach(trigger => {
      const triggerExecutions = executions.filter(e => e.trigger.type === trigger);
      const successful = triggerExecutions.filter(e => e.status === 'completed').length;
      byTrigger[trigger].successRate = triggerExecutions.length > 0 ? successful / triggerExecutions.length : 0;
      byTrigger[trigger].averageTime = triggerExecutions.length > 0 ? 
        triggerExecutions.reduce((sum, e) => sum + (e.timing.duration || 0), 0) / triggerExecutions.length : 0;
    });

    return byTrigger;
  }

  private async calculateAutomationPerformance(executions: AutomationExecution[], startDate: Date, endDate: Date): Promise<any> {
    // Mock implementation
    return {
      executionTimes: [],
      successRates: [],
      volume: []
    };
  }

  private async identifyAutomationIssues(executions: AutomationExecution[]): Promise<any[]> {
    // Mock implementation
    return [];
  }

  private async generateAutomationRecommendations(executions: AutomationExecution[], summary: any, issues: any[]): Promise<any[]> {
    // Mock implementation
    return [];
  }

  private async validateTemplateVariables(template: WorkflowTemplate, variables: Record<string, any>): Promise<void> {
    // Check required variables
    for (const variable of template.variables) {
      if (variable.required && !(variable.name in variables)) {
        throw new Error(`Required variable missing: ${variable.name}`);
      }
    }
  }

  // Initialize default rules
  private initializeDefaultRules(): void {
    // High-value order escalation
    this.rules.set('high_value_escalation', {
      ruleId: 'high_value_escalation',
      name: 'High Value Order Escalation',
      description: 'Escalate orders over $1000 to senior staff',
      category: 'escalation',
      trigger: {
        type: 'order_created',
        conditions: [{
          field: 'total',
          operator: 'greater_than',
          value: 1000
        }]
      },
      actions: [{
        type: 'escalate',
        parameters: {
          level: 'high',
          reason: 'High value order requires senior approval',
          assignTo: 'senior_manager'
        },
        order: 1
      }, {
        type: 'send_notification',
        parameters: {
          type: 'email',
          recipients: ['manager@company.com'],
          template: 'high_value_order',
          data: { orderValue: '{{order.total}}' }
        },
        order: 2
      }],
      conditions: {
        enabled: true,
        priority: 90,
        userRoles: ['customer', 'sales_rep']
      },
      performance: {
        executions: 0,
        successes: 0,
        failures: 0,
        averageExecutionTime: 0
      },
      status: 'active',
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        version: 1
      }
    });

    // VIP customer priority
    this.rules.set('vip_priority', {
      ruleId: 'vip_priority',
      name: 'VIP Customer Priority Processing',
      description: 'Assign high priority to VIP customer orders',
      category: 'prioritization',
      trigger: {
        type: 'order_created',
        conditions: [{
          field: 'customer.loyaltyTier',
          operator: 'in',
          value: ['VIP', 'PLATINUM']
        }]
      },
      actions: [{
        type: 'update_field',
        parameters: {
          field: 'priority',
          value: 'high'
        },
        order: 1
      }, {
        type: 'assign_user',
        parameters: {
          role: 'vip_specialist'
        },
        order: 2
      }],
      conditions: {
        enabled: true,
        priority: 85,
        customerSegments: ['VIP', 'PLATINUM']
      },
      performance: {
        executions: 0,
        successes: 0,
        failures: 0,
        averageExecutionTime: 0
      },
      status: 'active',
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        version: 1
      }
    });
  }

  // Initialize workflow templates
  private initializeWorkflowTemplates(): void {
    // Order processing template
    this.templates.set('order_processing', {
      templateId: 'order_processing',
      name: 'Standard Order Processing',
      description: 'Standard workflow for processing customer orders',
      category: 'order_processing',
      steps: [
        {
          stepId: 'validate_order',
          name: 'Validate Order',
          description: 'Validate order details and customer information',
          type: 'automated',
          configuration: {
            actions: [{
              type: 'validate_order',
              parameters: {}
            }]
          },
          order: 1,
          optional: false
        },
        {
          stepId: 'payment_verification',
          name: 'Payment Verification',
          description: 'Verify payment method and process payment',
          type: 'automated',
          configuration: {
            actions: [{
              type: 'verify_payment',
              parameters: {}
            }],
            sla: {
              target: 1,
              warning: 0.5
            }
          },
          order: 2,
          optional: false
        },
        {
          stepId: 'inventory_allocation',
          name: 'Allocate Inventory',
          description: 'Reserve inventory for the order',
          type: 'automated',
          configuration: {
            actions: [{
              type: 'allocate_inventory',
              parameters: {}
            }]
          },
          order: 3,
          optional: false
        },
        {
          stepId: 'order_approval',
          name: 'Order Approval',
          description: 'Approve order if required',
          type: 'approval',
          configuration: {
            approvals: {
              required: 1,
              approvers: ['manager'],
              timeout: 24
            }
          },
          order: 4,
          optional: true
        }
      ],
      triggers: [{
        type: 'order_created',
        conditions: {}
      }],
      variables: [],
      permissions: {
        canStart: ['system', 'manager'],
        canView: ['all'],
        canEdit: ['manager', 'admin']
      },
      status: 'active',
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        version: 1,
        usageCount: 0
      }
    });
  }

  // Start scheduled jobs
  private startScheduledJobs(): void {
    // Check for scheduled rules every minute
    setInterval(() => {
      this.checkScheduledRules();
    }, 60000);
  }

  private async checkScheduledRules(): Promise<void> {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDay = now.getDay();

    const scheduledRules = Array.from(this.rules.values())
      .filter(rule => rule.status === 'active')
      .filter(rule => rule.trigger.type === 'time_based')
      .filter(rule => this.isScheduleMatch(rule.trigger.schedule, currentHour, currentMinute, currentDay));

    for (const rule of scheduledRules) {
      try {
        // Find orders that match the rule conditions
        const orders = await this.findOrdersForRule(rule);
        
        // Execute rule for each matching order
        for (const order of orders) {
          await this.executeRule(rule.ruleId, order._id.toString());
        }
      } catch (error) {
        console.error(`Failed to execute scheduled rule ${rule.ruleId}: ${error.message}`);
      }
    }
  }

  private isScheduleMatch(schedule: any, hour: number, minute: number, day: number): boolean {
    if (!schedule) return false;

    // Check frequency
    switch (schedule.frequency) {
      case 'hourly':
        return minute === 0;
      case 'daily':
        return schedule.time ? this.isTimeMatch(schedule.time, hour, minute) : hour === 0 && minute === 0;
      case 'weekly':
        return schedule.dayOfWeek === day && schedule.time ? this.isTimeMatch(schedule.time, hour, minute) : false;
      case 'monthly':
        return schedule.dayOfMonth === now.getDate() && schedule.time ? this.isTimeMatch(schedule.time, hour, minute) : false;
      default:
        return false;
    }
  }

  private isTimeMatch(time: string, hour: number, minute: number): boolean {
    const [scheduleHour, scheduleMinute] = time.split(':').map(Number);
    return hour === scheduleHour && minute === scheduleMinute;
  }

  private async findOrdersForRule(rule: AutomationRule): Promise<IOrder[]> {
    // Mock implementation - would query orders based on rule conditions
    return [];
  }

  // Helper methods
  private generateRuleId(): string {
    return `RULE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  private generateExecutionId(): string {
    return `EXEC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  private generateWorkflowId(): string {
    return `WF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  private generateTaskId(): string {
    return `TASK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  // Public methods
  async getRule(ruleId: string): Promise<AutomationRule | null> {
    return this.rules.get(ruleId) || null;
  }

  async getRules(filters?: { category?: string; status?: string }): Promise<AutomationRule[]> {
    let rules = Array.from(this.rules.values());

    if (filters?.category) {
      rules = rules.filter(rule => rule.category === filters.category);
    }

    if (filters?.status) {
      rules = rules.filter(rule => rule.status === filters.status);
    }

    return rules;
  }

  async getExecutions(filters?: { ruleId?: string; status?: string; orderId?: string }): Promise<AutomationExecution[]> {
    let executions = Array.from(this.executions.values());

    if (filters?.ruleId) {
      executions = executions.filter(exec => exec.ruleId === filters.ruleId);
    }

    if (filters?.status) {
      executions = executions.filter(exec => exec.status === filters.status);
    }

    if (filters?.orderId) {
      executions = executions.filter(exec => exec.orderId === filters.orderId);
    }

    return executions.sort((a, b) => b.timing.startedAt.getTime() - a.timing.startedAt.getTime());
  }

  async getTemplate(templateId: string): Promise<WorkflowTemplate | null> {
    return this.templates.get(templateId) || null;
  }

  async getTemplates(filters?: { category?: string; status?: string }): Promise<WorkflowTemplate[]> {
    let templates = Array.from(this.templates.values());

    if (filters?.category) {
      templates = templates.filter(template => template.category === filters.category);
    }

    if (filters?.status) {
      templates = templates.filter(template => template.status === filters.status);
    }

    return templates;
  }
}
