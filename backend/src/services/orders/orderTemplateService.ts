import { Order, IOrder } from '../../models/Order';
import { Customer } from '../../models/Customer';
import { Product } from '../../models/Product';

export interface OrderTemplate {
  templateId: string;
  name: string;
  description: string;
  category: 'sales' | 'purchase' | 'return' | 'exchange' | 'repair' | 'custom';
  type: 'standard' | 'recurring' | 'quote' | 'estimate' | 'invoice';
  visibility: 'public' | 'private' | 'role_based';
  structure: {
    customer: {
      required: boolean;
      fields: Array<{
        name: string;
        type: 'text' | 'email' | 'phone' | 'select' | 'checkbox' | 'textarea';
        required: boolean;
        defaultValue?: any;
        options?: string[];
        validation?: {
          pattern?: string;
          minLength?: number;
          maxLength?: number;
          min?: number;
          max?: number;
        };
      }>;
    };
    items: {
      required: boolean;
      minItems: number;
      maxItems: number;
      allowCustomItems: boolean;
      defaultItems: Array<{
        productId: string;
        quantity: number;
        unitPrice?: number;
        discount?: number;
        description?: string;
      }>;
      fields: Array<{
        name: string;
        type: 'text' | 'number' | 'select' | 'checkbox';
        required: boolean;
        defaultValue?: any;
        options?: string[];
        validation?: any;
      }>;
    };
    pricing: {
      mode: 'manual' | 'calculated' | 'fixed';
      taxIncluded: boolean;
      discountAllowed: boolean;
      depositRequired: boolean;
      depositPercentage?: number;
      fields: Array<{
        name: string;
        type: 'number' | 'percentage' | 'checkbox';
        required: boolean;
        defaultValue?: any;
      }>;
    };
    shipping: {
      required: boolean;
      methods: Array<{
        id: string;
        name: string;
        cost: number;
        estimatedDays: number;
      }>;
      fields: Array<{
        name: string;
        type: 'text' | 'select' | 'checkbox';
        required: boolean;
        defaultValue?: any;
        options?: string[];
      }>;
    };
    payment: {
      required: boolean;
      methods: Array<{
        id: string;
        name: string;
        enabled: boolean;
      }>;
      terms: Array<{
        id: string;
        name: string;
        days: number;
        description: string;
      }>;
      fields: Array<{
        name: string;
        type: 'select' | 'text' | 'checkbox';
        required: boolean;
        defaultValue?: any;
        options?: string[];
      }>;
    };
    notes: {
      enabled: boolean;
      required: boolean;
      maxLength?: number;
      placeholder?: string;
    };
    customFields: Array<{
      id: string;
      name: string;
      type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'textarea';
      required: boolean;
      defaultValue?: any;
      options?: string[];
      validation?: any;
    }>;
  };
  automation: {
    validation: {
      enabled: boolean;
      rules: Array<{
        name: string;
        condition: string;
        action: 'warn' | 'error' | 'prevent';
        message: string;
      }>;
    };
    calculations: {
      enabled: boolean;
      formulas: Array<{
        name: string;
        expression: string;
        target: string;
      }>;
    };
    notifications: {
      enabled: boolean;
      triggers: Array<{
        event: string;
        recipients: string[];
        template: string;
        delay?: number;
      }>;
    };
    approvals: {
      required: boolean;
      conditions: Array<{
        field: string;
        operator: string;
        value: any;
      }>;
      approvers: string[];
      timeout?: number;
    };
  };
  branding: {
    logo?: string;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
    fonts: {
      heading: string;
      body: string;
    };
    layout: {
      header: boolean;
      footer: boolean;
      sidebar: boolean;
    };
    customCSS?: string;
  };
  permissions: {
    canUse: string[];
    canEdit: string[];
    canDelete: string[];
    canShare: string[];
  };
  settings: {
    allowDuplicate: boolean;
    allowExport: boolean;
    allowPrint: boolean;
    allowEmail: boolean;
    expireAfter?: number; // days
    maxUses?: number;
    requireSignature?: boolean;
  };
  status: 'active' | 'inactive' | 'archived' | 'draft';
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    version: number;
    usageCount: number;
    lastUsed?: Date;
    tags?: string[];
  };
}

export interface OrderTemplateInstance {
  instanceId: string;
  templateId: string;
  templateName: string;
  templateVersion: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'expired';
  data: {
    customer: Record<string, any>;
    items: Array<Record<string, any>>;
    pricing: Record<string, any>;
    shipping: Record<string, any>;
    payment: Record<string, any>;
    notes?: string;
    customFields: Record<string, any>;
  };
  validation: {
    valid: boolean;
    errors: Array<{
      field: string;
      message: string;
      severity: 'error' | 'warning';
    }>;
    warnings: Array<{
      field: string;
      message: string;
    }>;
  };
  calculations: {
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
    deposit?: number;
  };
  workflow: {
    currentStep: string;
    steps: Array<{
      stepId: string;
      name: string;
      status: 'pending' | 'in_progress' | 'completed' | 'skipped';
      completedAt?: Date;
      completedBy?: string;
      notes?: string;
    }>;
    approvals: Array<{
      stepId: string;
      approver: string;
      status: 'pending' | 'approved' | 'rejected';
      timestamp?: Date;
      comments?: string;
    }>;
  };
  sharing: {
    shareToken?: string;
    shareUrl?: string;
    expiresAt?: Date;
    permissions: {
      canView: boolean;
      canEdit: boolean;
      canComment: boolean;
    };
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    submittedAt?: Date;
    approvedAt?: Date;
    expiresAt?: Date;
  };
}

export interface OrderTemplateAnalytics {
  summary: {
    totalTemplates: number;
    activeTemplates: number;
    totalInstances: number;
    averageInstancesPerTemplate: number;
    topUsedTemplates: Array<{
      templateId: string;
      templateName: string;
      usageCount: number;
      conversionRate: number;
    }>;
  };
  byCategory: Record<string, {
    templates: number;
    instances: number;
    averageCompletionTime: number;
    conversionRate: number;
  }>;
  byStatus: Record<string, {
    count: number;
    percentage: number;
    averageTime: number;
  }>;
  performance: {
    usage: Array<{
      date: string;
      instances: number;
      templates: number;
    }>;
    completionTimes: Array<{
      date: string;
      average: number;
      target: number;
    }>;
    conversionRates: Array<{
      date: string;
      rate: number;
      target: number;
    }>;
  };
  issues: Array<{
    type: 'validation_error' | 'workflow_failure' | 'timeout' | 'access_denied';
    count: number;
    percentage: number;
    impact: string;
    trends: 'increasing' | 'decreasing' | 'stable';
  }>;
  recommendations: Array<{
    type: 'template' | 'workflow' | 'usability' | 'performance';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    expectedImpact: string;
    implementation: string;
  }>;
}

export class OrderTemplateService {
  private templates: Map<string, OrderTemplate> = new Map();
  private instances: Map<string, OrderTemplateInstance> = new Map();

  constructor() {
    this.initializeDefaultTemplates();
  }

  // Create order template
  async createTemplate(template: Omit<OrderTemplate, 'templateId' | 'metadata' | 'status'>, createdBy: string): Promise<OrderTemplate> {
    const newTemplate: OrderTemplate = {
      templateId: this.generateTemplateId(),
      ...template,
      status: 'draft',
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy,
        updatedBy: createdBy,
        version: 1,
        usageCount: 0
      }
    };

    // Validate template
    await this.validateTemplate(newTemplate);

    // Save template
    this.templates.set(newTemplate.templateId, newTemplate);

    return newTemplate;
  }

  // Update order template
  async updateTemplate(templateId: string, updates: Partial<OrderTemplate>, updatedBy: string): Promise<OrderTemplate> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    // Check if template is being used
    if (template.metadata.usageCount > 0 && !template.settings.allowDuplicate) {
      throw new Error('Cannot update template that is in use');
    }

    // Apply updates
    const updatedTemplate = {
      ...template,
      ...updates,
      metadata: {
        ...template.metadata,
        updatedAt: new Date(),
        updatedBy,
        version: template.metadata.version + 1
      }
    };

    // Validate updated template
    await this.validateTemplate(updatedTemplate);

    // Save updated template
    this.templates.set(templateId, updatedTemplate);

    return updatedTemplate;
  }

  // Delete order template
  async deleteTemplate(templateId: string): Promise<void> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    // Check if template is being used
    const activeInstances = Array.from(this.instances.values())
      .filter(instance => instance.templateId === templateId && 
      ['draft', 'submitted', 'approved'].includes(instance.status));

    if (activeInstances.length > 0) {
      throw new Error('Cannot delete template with active instances');
    }

    // Remove template
    this.templates.delete(templateId);
  }

  // Create template instance
  async createInstance(templateId: string, data: any, createdBy: string): Promise<OrderTemplateInstance> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    if (template.status !== 'active') {
      throw new Error('Template is not active');
    }

    // Check permissions
    if (!template.permissions.canUse.includes('*') && !template.permissions.canUse.includes(createdBy)) {
      throw new Error('Permission denied to use this template');
    }

    // Create instance
    const instance: OrderTemplateInstance = {
      instanceId: this.generateInstanceId(),
      templateId: template.templateId,
      templateName: template.name,
      templateVersion: template.metadata.version,
      status: 'draft',
      data: {
        customer: data.customer || {},
        items: data.items || [],
        pricing: data.pricing || {},
        shipping: data.shipping || {},
        payment: data.payment || {},
        notes: data.notes,
        customFields: data.customFields || {}
      },
      validation: {
        valid: false,
        errors: [],
        warnings: []
      },
      calculations: {
        subtotal: 0,
        tax: 0,
        shipping: 0,
        discount: 0,
        total: 0
      },
      workflow: {
        currentStep: 'start',
        steps: [],
        approvals: []
      },
      sharing: {
        permissions: {
          canView: true,
          canEdit: false,
          canComment: false
        }
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy,
        updatedBy: createdBy
      }
    };

    // Validate instance data
    await this.validateInstance(instance, template);

    // Calculate totals
    await this.calculateInstanceTotals(instance, template);

    // Initialize workflow if automation is enabled
    if (template.automation.approvals.required) {
      await this.initializeWorkflow(instance, template);
    }

    // Set expiration if configured
    if (template.settings.expireAfter) {
      instance.metadata.expiresAt = new Date(Date.now() + template.settings.expireAfter * 24 * 60 * 60 * 1000);
    }

    // Update template usage count
    template.metadata.usageCount++;
    template.metadata.lastUsed = new Date();

    // Save instance
    this.instances.set(instance.instanceId, instance);

    return instance;
  }

  // Update template instance
  async updateInstance(instanceId: string, data: any, updatedBy: string): Promise<OrderTemplateInstance> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error('Instance not found');
    }

    // Check if instance can be updated
    if (!['draft', 'submitted'].includes(instance.status)) {
      throw new Error('Instance cannot be updated in current status');
    }

    // Update data
    instance.data = {
      ...instance.data,
      ...data
    };

    instance.metadata.updatedBy = updatedBy;
    instance.metadata.updatedAt = new Date();

    // Get template
    const template = this.templates.get(instance.templateId);
    if (template) {
      // Re-validate
      await this.validateInstance(instance, template);

      // Recalculate totals
      await this.calculateInstanceTotals(instance, template);
    }

    return instance;
  }

  // Submit template instance
  async submitInstance(instanceId: string, submittedBy: string): Promise<OrderTemplateInstance> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error('Instance not found');
    }

    if (instance.status !== 'draft') {
      throw new Error('Instance has already been submitted');
    }

    // Get template
    const template = this.templates.get(instance.templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    // Validate before submission
    if (!instance.validation.valid) {
      throw new Error('Cannot submit instance with validation errors');
    }

    // Update status
    instance.status = 'submitted';
    instance.metadata.submittedAt = new Date();
    instance.metadata.updatedBy = submittedBy;

    // Process approvals if required
    if (template.automation.approvals.required) {
      await this.processApprovals(instance, template);
    } else {
      // Auto-approve if no approvals required
      instance.status = 'approved';
      instance.metadata.approvedAt = new Date();
    }

    // Send notifications
    if (template.automation.notifications.enabled) {
      await this.sendNotifications(instance, template, 'submitted');
    }

    return instance;
  }

  // Approve template instance
  async approveInstance(instanceId: string, approvedBy: string, comments?: string): Promise<OrderTemplateInstance> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error('Instance not found');
    }

    if (instance.status !== 'submitted') {
      throw new Error('Instance is not submitted for approval');
    }

    // Get template
    const template = this.templates.get(instance.templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    // Check if user can approve
    if (!template.automation.approvals.approvers.includes(approvedBy)) {
      throw new Error('User is not authorized to approve this instance');
    }

    // Add approval
    instance.workflow.approvals.push({
      stepId: instance.workflow.currentStep,
      approver: approvedBy,
      status: 'approved',
      timestamp: new Date(),
      comments
    });

    // Update status
    instance.status = 'approved';
    instance.metadata.approvedAt = new Date();
    instance.metadata.updatedBy = approvedBy;

    // Send notifications
    if (template.automation.notifications.enabled) {
      await this.sendNotifications(instance, template, 'approved');
    }

    return instance;
  }

  // Reject template instance
  async rejectInstance(instanceId: string, rejectedBy: string, reason: string): Promise<OrderTemplateInstance> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error('Instance not found');
    }

    if (instance.status !== 'submitted') {
      throw new Error('Instance is not submitted for approval');
    }

    // Get template
    const template = this.templates.get(instance.templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    // Check if user can reject
    if (!template.automation.approvals.approvers.includes(rejectedBy)) {
      throw new Error('User is not authorized to reject this instance');
    }

    // Add rejection
    instance.workflow.approvals.push({
      stepId: instance.workflow.currentStep,
      approver: rejectedBy,
      status: 'rejected',
      timestamp: new Date(),
      comments: reason
    });

    // Update status
    instance.status = 'rejected';
    instance.metadata.updatedBy = rejectedBy;

    // Send notifications
    if (template.automation.notifications.enabled) {
      await this.sendNotifications(instance, template, 'rejected');
    }

    return instance;
  }

  // Convert instance to order
  async convertInstanceToOrder(instanceId: string, convertedBy: string): Promise<IOrder> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error('Instance not found');
    }

    if (instance.status !== 'approved') {
      throw new Error('Instance must be approved before conversion');
    }

    // Get template
    const template = this.templates.get(instance.templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    // Create order from instance
    const order = await this.createOrderFromInstance(instance, template, convertedBy);

    // Update instance status
    instance.status = 'completed';
    instance.metadata.updatedBy = convertedBy;

    return order;
  }

  // Share template instance
  async shareInstance(instanceId: string, permissions: { canView: boolean; canEdit: boolean; canComment: boolean }, expiresIn?: number): Promise<string> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error('Instance not found');
    }

    // Generate share token
    const shareToken = this.generateShareToken();

    // Update sharing info
    instance.sharing.shareToken = shareToken;
    instance.sharing.shareUrl = `/shared/templates/${shareToken}`;
    instance.sharing.permissions = permissions;

    if (expiresIn) {
      instance.sharing.expiresAt = new Date(Date.now() + expiresIn * 60 * 1000);
    }

    return shareToken;
  }

  // Get template analytics
  async getTemplateAnalytics(startDate: Date, endDate: Date): Promise<OrderTemplateAnalytics> {
    // Get instances within date range
    const instances = await this.getInstancesByDateRange(startDate, endDate);

    // Calculate summary
    const summary = this.calculateTemplateSummary(instances);

    // Analyze by category
    const byCategory = this.analyzeTemplatesByCategory(instances);

    // Analyze by status
    const byStatus = this.analyzeInstancesByStatus(instances);

    // Calculate performance metrics
    const performance = await this.calculateTemplatePerformance(instances, startDate, endDate);

    // Identify issues
    const issues = await this.identifyTemplateIssues(instances);

    // Generate recommendations
    const recommendations = await this.generateTemplateRecommendations(instances, summary, issues);

    return {
      summary,
      byCategory,
      byStatus,
      performance,
      issues,
      recommendations
    };
  }

  // Private methods
  private async validateTemplate(template: OrderTemplate): Promise<void> {
    // Validate structure
    if (!template.name || template.name.trim().length === 0) {
      throw new Error('Template name is required');
    }

    // Validate customer fields
    if (template.structure.customer.required && template.structure.customer.fields.length === 0) {
      throw new Error('Customer fields are required when customer is required');
    }

    // Validate items configuration
    if (template.structure.items.required && template.structure.items.minItems === 0) {
      throw new Error('Minimum items must be greater than 0 when items are required');
    }

    // Validate automation rules
    if (template.automation.validation.enabled) {
      for (const rule of template.automation.validation.rules) {
        if (!rule.name || !rule.condition) {
          throw new Error('Validation rules must have name and condition');
        }
      }
    }
  }

  private async validateInstance(instance: OrderTemplateInstance, template: OrderTemplate): Promise<void> {
    instance.validation.errors = [];
    instance.validation.warnings = [];

    // Validate customer data
    if (template.structure.customer.required) {
      for (const field of template.structure.customer.fields) {
        if (field.required && !instance.data.customer[field.name]) {
          instance.validation.errors.push({
            field: `customer.${field.name}`,
            message: `${field.name} is required`,
            severity: 'error'
          });
        }

        // Validate field format
        if (instance.data.customer[field.name] && field.validation) {
          const validationError = this.validateField(instance.data.customer[field.name], field.validation);
          if (validationError) {
            instance.validation.errors.push({
              field: `customer.${field.name}`,
              message: validationError,
              severity: 'error'
            });
          }
        }
      }
    }

    // Validate items
    if (template.structure.items.required) {
      if (instance.data.items.length < template.structure.items.minItems) {
        instance.validation.errors.push({
          field: 'items',
          message: `At least ${template.structure.items.minItems} items are required`,
          severity: 'error'
        });
      }

      if (template.structure.items.maxItems && instance.data.items.length > template.structure.items.maxItems) {
        instance.validation.errors.push({
          field: 'items',
          message: `Maximum ${template.structure.items.maxItems} items allowed`,
          severity: 'error'
        });
      }
    }

    // Validate custom rules
    if (template.automation.validation.enabled) {
      for (const rule of template.automation.validation.rules) {
        const ruleResult = await this.evaluateValidationRule(rule, instance);
        if (!ruleResult.passed) {
          if (rule.action === 'error') {
            instance.validation.errors.push({
              field: ruleResult.field || 'custom',
              message: rule.message,
              severity: 'error'
            });
          } else if (rule.action === 'warn') {
            instance.validation.warnings.push({
              field: ruleResult.field || 'custom',
              message: rule.message
            });
          }
        }
      }
    }

    instance.validation.valid = instance.validation.errors.length === 0;
  }

  private validateField(value: any, validation: any): string | null {
    if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
      return 'Invalid format';
    }

    if (validation.minLength && value.length < validation.minLength) {
      return `Minimum length is ${validation.minLength}`;
    }

    if (validation.maxLength && value.length > validation.maxLength) {
      return `Maximum length is ${validation.maxLength}`;
    }

    if (validation.min && Number(value) < validation.min) {
      return `Minimum value is ${validation.min}`;
    }

    if (validation.max && Number(value) > validation.max) {
      return `Maximum value is ${validation.max}`;
    }

    return null;
  }

  private async evaluateValidationRule(rule: any, instance: OrderTemplateInstance): Promise<{ passed: boolean; field?: string }> {
    // Mock rule evaluation
    switch (rule.name) {
      case 'minimum_order_value':
        const total = instance.calculations.total;
        const minValue = 100; // Would get from rule condition
        return {
          passed: total >= minValue,
          field: 'total'
        };
      default:
        return { passed: true };
    }
  }

  private async calculateInstanceTotals(instance: OrderTemplateInstance, template: OrderTemplate): Promise<void> {
    // Calculate subtotal
    instance.calculations.subtotal = instance.data.items.reduce((sum, item) => {
      return sum + (item.quantity || 0) * (item.unitPrice || 0);
    }, 0);

    // Calculate discount
    instance.calculations.discount = instance.data.pricing.discount || 0;

    // Calculate shipping
    instance.calculations.shipping = instance.data.shipping.cost || 0;

    // Calculate tax
    const taxableAmount = instance.calculations.subtotal - instance.calculations.discount;
    instance.calculations.tax = template.structure.pricing.taxIncluded ? 0 : taxableAmount * 0.08; // Mock tax rate

    // Calculate total
    instance.calculations.total = taxableAmount + instance.calculations.tax + instance.calculations.shipping;

    // Calculate deposit if required
    if (template.structure.pricing.depositRequired) {
      const depositPercentage = template.structure.pricing.depositPercentage || 20;
      instance.calculations.deposit = instance.calculations.total * (depositPercentage / 100);
    }
  }

  private async initializeWorkflow(instance: OrderTemplateInstance, template: OrderTemplate): Promise<void> {
    // Mock workflow initialization
    instance.workflow.steps.push({
      stepId: 'start',
      name: 'Start',
      status: 'completed',
      completedAt: new Date(),
      completedBy: instance.metadata.createdBy
    });

    if (template.automation.approvals.required) {
      instance.workflow.steps.push({
        stepId: 'approval',
        name: 'Approval',
        status: 'pending'
      });
      instance.workflow.currentStep = 'approval';
    }
  }

  private async processApprovals(instance: OrderTemplateInstance, template: OrderTemplate): Promise<void> {
    // Check if approval conditions are met
    const conditionsMet = await this.evaluateApprovalConditions(instance, template);
    
    if (conditionsMet) {
      instance.status = 'approved';
      instance.metadata.approvedAt = new Date();
    }
  }

  private async evaluateApprovalConditions(instance: OrderTemplateInstance, template: OrderTemplate): Promise<boolean> {
    // Mock condition evaluation
    if (!template.automation.approvals.conditions || template.automation.approvals.conditions.length === 0) {
      return true;
    }

    // Would evaluate actual conditions
    return true;
  }

  private async sendNotifications(instance: OrderTemplateInstance, template: OrderTemplate, event: string): Promise<void> {
    // Mock notification sending
    console.log(`Sending ${event} notification for template instance ${instance.instanceId}`);
  }

  private async createOrderFromInstance(instance: OrderTemplateInstance, template: OrderTemplate, convertedBy: string): Promise<IOrder> {
    // Create customer if needed
    let customer;
    if (instance.data.customer.email) {
      customer = await Customer.findOne({ email: instance.data.customer.email });
    }

    if (!customer) {
      customer = new Customer({
        name: instance.data.customer.name,
        email: instance.data.customer.email,
        phone: instance.data.customer.phone,
        createdAt: new Date()
      });
      await customer.save();
    }

    // Create order
    const order = new Order({
      customerId: customer._id,
      customer: customer.toObject(),
      items: instance.data.items.map((item: any) => ({
        productId: item.productId,
        productName: item.productName || 'Product',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        totalPrice: item.quantity * item.unitPrice
      })),
      subtotal: instance.calculations.subtotal,
      tax: instance.calculations.tax,
      shipping: instance.calculations.shipping,
      total: instance.calculations.total,
      orderType: template.type,
      status: 'pending',
      payment: {
        method: instance.data.payment.method || 'cash',
        status: 'pending',
        terms: instance.data.payment.terms
      },
      shipping: instance.data.shipping.address ? {
        method: instance.data.shipping.method,
        address: instance.data.shipping.address,
        instructions: instance.data.shipping.instructions
      } : undefined,
      notes: instance.data.notes,
      metadata: {
        templateInstanceId: instance.instanceId,
        templateId: template.templateId,
        convertedBy,
        convertedAt: new Date()
      }
    });

    await order.save();
    return order;
  }

  // Analytics helper methods
  private async getInstancesByDateRange(startDate: Date, endDate: Date): Promise<OrderTemplateInstance[]> {
    // Mock implementation
    return Array.from(this.instances.values());
  }

  private calculateTemplateSummary(instances: OrderTemplateInstance[]): any {
    const totalTemplates = this.templates.size;
    const activeTemplates = Array.from(this.templates.values()).filter(t => t.status === 'active').length;
    const totalInstances = instances.length;
    const averageInstancesPerTemplate = totalTemplates > 0 ? totalInstances / totalTemplates : 0;

    // Calculate top used templates
    const templateUsage = new Map<string, number>();
    instances.forEach(instance => {
      templateUsage.set(instance.templateId, (templateUsage.get(instance.templateId) || 0) + 1);
    });

    const topUsedTemplates = Array.from(templateUsage.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([templateId, usageCount]) => {
        const template = this.templates.get(templateId);
        return {
          templateId,
          templateName: template?.name || 'Unknown',
          usageCount,
          conversionRate: 0.75 // Mock value
        };
      });

    return {
      totalTemplates,
      activeTemplates,
      totalInstances,
      averageInstancesPerTemplate,
      topUsedTemplates
    };
  }

  private analyzeTemplatesByCategory(instances: OrderTemplateInstance[]): Record<string, any> {
    const byCategory: Record<string, any> = {};

    instances.forEach(instance => {
      const template = this.templates.get(instance.templateId);
      const category = template?.category || 'unknown';

      if (!byCategory[category]) {
        byCategory[category] = {
          templates: 0,
          instances: 0,
          averageCompletionTime: 0,
          conversionRate: 0
        };
      }

      byCategory[category].instances++;
    });

    // Calculate template counts and metrics
    Object.keys(byCategory).forEach(category => {
      const categoryTemplates = Array.from(this.templates.values()).filter(t => t.category === category);
      byCategory[category].templates = categoryTemplates.length;
      byCategory[category].averageCompletionTime = 2.5; // Mock value
      byCategory[category].conversionRate = 0.80; // Mock value
    });

    return byCategory;
  }

  private analyzeInstancesByStatus(instances: OrderTemplateInstance[]): Record<string, any> {
    const byStatus: Record<string, any> = {};

    instances.forEach(instance => {
      const status = instance.status;
      if (!byStatus[status]) {
        byStatus[status] = {
          count: 0,
          percentage: 0,
          averageTime: 0
        };
      }

      byStatus[status].count++;
    });

    // Calculate percentages and averages
    const totalInstances = instances.length;
    Object.keys(byStatus).forEach(status => {
      const data = byStatus[status];
      data.percentage = (data.count / totalInstances) * 100;
      data.averageTime = 1.5; // Mock value
    });

    return byStatus;
  }

  private async calculateTemplatePerformance(instances: OrderTemplateInstance[], startDate: Date, endDate: Date): Promise<any> {
    // Mock implementation
    return {
      usage: [],
      completionTimes: [],
      conversionRates: []
    };
  }

  private async identifyTemplateIssues(instances: OrderTemplateInstance[]): Promise<any[]> {
    // Mock implementation
    return [];
  }

  private async generateTemplateRecommendations(instances: OrderTemplateInstance[], summary: any, issues: any[]): Promise<any[]> {
    // Mock implementation
    return [];
  }

  // Initialize default templates
  private initializeDefaultTemplates(): void {
    // Standard sales order template
    this.templates.set('standard_sales', {
      templateId: 'standard_sales',
      name: 'Standard Sales Order',
      description: 'Standard template for sales orders',
      category: 'sales',
      type: 'standard',
      visibility: 'public',
      structure: {
        customer: {
          required: true,
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
              validation: { minLength: 2, maxLength: 100 }
            },
            {
              name: 'email',
              type: 'email',
              required: true,
              validation: { pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' }
            },
            {
              name: 'phone',
              type: 'phone',
              required: true
            },
            {
              name: 'company',
              type: 'text',
              required: false
            }
          ]
        },
        items: {
          required: true,
          minItems: 1,
          maxItems: 50,
          allowCustomItems: true,
          defaultItems: [],
          fields: [
            {
              name: 'productId',
              type: 'select',
              required: true
            },
            {
              name: 'quantity',
              type: 'number',
              required: true,
              validation: { min: 1 }
            },
            {
              name: 'unitPrice',
              type: 'number',
              required: true,
              validation: { min: 0 }
            }
          ]
        },
        pricing: {
          mode: 'calculated',
          taxIncluded: false,
          discountAllowed: true,
          depositRequired: false,
          fields: [
            {
              name: 'discount',
              type: 'number',
              required: false,
              validation: { min: 0 }
            }
          ]
        },
        shipping: {
          required: true,
          methods: [
            { id: 'standard', name: 'Standard Shipping', cost: 10, estimatedDays: 5 },
            { id: 'express', name: 'Express Shipping', cost: 25, estimatedDays: 2 }
          ],
          fields: [
            {
              name: 'method',
              type: 'select',
              required: true
            },
            {
              name: 'address',
              type: 'textarea',
              required: true
            }
          ]
        },
        payment: {
          required: true,
          methods: [
            { id: 'cash', name: 'Cash', enabled: true },
            { id: 'card', name: 'Credit Card', enabled: true },
            { id: 'transfer', name: 'Bank Transfer', enabled: true }
          ],
          terms: [
            { id: 'net30', name: 'Net 30', days: 30, description: 'Payment due in 30 days' },
            { id: 'net15', name: 'Net 15', days: 15, description: 'Payment due in 15 days' }
          ],
          fields: [
            {
              name: 'method',
              type: 'select',
              required: true
            },
            {
              name: 'terms',
              type: 'select',
              required: false
            }
          ]
        },
        notes: {
          enabled: true,
          required: false,
          maxLength: 500,
          placeholder: 'Add any special instructions or notes...'
        },
        customFields: []
      },
      automation: {
        validation: {
          enabled: true,
          rules: [
            {
              name: 'minimum_order_value',
              condition: 'total < 100',
              action: 'warn',
              message: 'Order value is below minimum of $100'
            }
          ]
        },
        calculations: {
          enabled: true,
          formulas: []
        },
        notifications: {
          enabled: true,
          triggers: [
            {
              event: 'submitted',
              recipients: ['manager@company.com'],
              template: 'order_submitted'
            }
          ]
        },
        approvals: {
          required: false,
          conditions: [],
          approvers: []
        }
      },
      branding: {
        colors: {
          primary: '#007bff',
          secondary: '#6c757d',
          accent: '#28a745'
        },
        fonts: {
          heading: 'Arial',
          body: 'Arial'
        },
        layout: {
          header: true,
          footer: true,
          sidebar: false
        }
      },
      permissions: {
        canUse: ['*'],
        canEdit: ['manager', 'admin'],
        canDelete: ['admin'],
        canShare: ['*']
      },
      settings: {
        allowDuplicate: true,
        allowExport: true,
        allowPrint: true,
        allowEmail: true,
        expireAfter: 30,
        maxUses: 1000,
        requireSignature: false
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

  // Helper methods
  private generateTemplateId(): string {
    return `TPL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  private generateInstanceId(): string {
    return `INST-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  private generateShareToken(): string {
    return `SHARE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  // Public methods
  async getTemplate(templateId: string): Promise<OrderTemplate | null> {
    return this.templates.get(templateId) || null;
  }

  async getTemplates(filters?: { category?: string; type?: string; status?: string; visibility?: string }): Promise<OrderTemplate[]> {
    let templates = Array.from(this.templates.values());

    if (filters?.category) {
      templates = templates.filter(template => template.category === filters.category);
    }

    if (filters?.type) {
      templates = templates.filter(template => template.type === filters.type);
    }

    if (filters?.status) {
      templates = templates.filter(template => template.status === filters.status);
    }

    if (filters?.visibility) {
      templates = templates.filter(template => template.visibility === filters.visibility);
    }

    return templates.sort((a, b) => b.metadata.updatedAt.getTime() - a.metadata.updatedAt.getTime());
  }

  async getInstance(instanceId: string): Promise<OrderTemplateInstance | null> {
    return this.instances.get(instanceId) || null;
  }

  async getInstances(filters?: { templateId?: string; status?: string; createdBy?: string }): Promise<OrderTemplateInstance[]> {
    let instances = Array.from(this.instances.values());

    if (filters?.templateId) {
      instances = instances.filter(instance => instance.templateId === filters.templateId);
    }

    if (filters?.status) {
      instances = instances.filter(instance => instance.status === filters.status);
    }

    if (filters?.createdBy) {
      instances = instances.filter(instance => instance.metadata.createdBy === filters.createdBy);
    }

    return instances.sort((a, b) => b.metadata.createdAt.getTime() - a.metadata.createdAt.getTime());
  }

  async getInstanceByShareToken(shareToken: string): Promise<OrderTemplateInstance | null> {
    const instance = Array.from(this.instances.values())
      .find(instance => instance.sharing.shareToken === shareToken);

    if (!instance) {
      return null;
    }

    // Check if share has expired
    if (instance.sharing.expiresAt && instance.sharing.expiresAt < new Date()) {
      return null;
    }

    return instance;
  }

  async duplicateTemplate(templateId: string, newName: string, duplicatedBy: string): Promise<OrderTemplate> {
    const originalTemplate = this.templates.get(templateId);
    if (!originalTemplate) {
      throw new Error('Template not found');
    }

    if (!originalTemplate.settings.allowDuplicate) {
      throw new Error('Template does not allow duplication');
    }

    // Create duplicate
    const duplicate = {
      ...originalTemplate,
      templateId: this.generateTemplateId(),
      name: newName,
      status: 'draft' as const,
      metadata: {
        ...originalTemplate.metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: duplicatedBy,
        updatedBy: duplicatedBy,
        version: 1,
        usageCount: 0,
        lastUsed: undefined
      }
    };

    this.templates.set(duplicate.templateId, duplicate);
    return duplicate;
  }
}
