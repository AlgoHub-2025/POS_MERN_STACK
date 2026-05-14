import { InventoryItem } from '../models/Inventory';
import { Product } from '../models/Product';
import { User } from '../models/User';

export interface InventoryAlert {
  alertId: string;
  type: 'stockout' | 'low_stock' | 'overstock' | 'expiry' | 'quality' | 'movement' | 'theft' | 'damage' | 'reorder' | 'forecast' | 'compliance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved' | 'suppressed';
  title: string;
  description: string;
  category: 'inventory_level' | 'quality' | 'operational' | 'financial' | 'compliance' | 'safety';
  source: {
    type: 'system' | 'user' | 'sensor' | 'integration';
    name: string;
    reference: string;
  };
  entity: {
    type: 'product' | 'warehouse' | 'zone' | 'bin' | 'supplier' | 'order';
    id: string;
    name: string;
    location?: string;
  };
  details: {
    currentValue: number;
    thresholdValue: number;
    variance: number;
    variancePercentage: number;
    unit: string;
    currency?: string;
  };
  impact: {
    financial: number;
    operational: string;
    customer: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  };
  actions: Array<{
    actionId: string;
    type: 'investigate' | 'reorder' | 'adjust' | 'transfer' | 'dispose' | 'notify' | 'escalate';
    description: string;
    assignedTo: string;
    dueDate: Date;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    completedAt?: Date;
    result?: string;
  }>;
  notifications: Array<{
    notificationId: string;
    recipient: string;
    channel: 'email' | 'sms' | 'in_app' | 'push' | 'webhook';
    status: 'pending' | 'sent' | 'delivered' | 'failed';
    sentAt?: Date;
    deliveredAt?: Date;
    error?: string;
  }>;
  escalation: {
    level: number;
    maxLevel: number;
    currentOwner: string;
    escalationRules: Array<{
      condition: string;
      triggerTime: Date;
      escalatedTo: string;
      action: string;
    }>;
    escalationHistory: Array<{
      level: number;
      escalatedFrom: string;
      escalatedTo: string;
      reason: string;
      timestamp: Date;
    }>;
  };
  metadata: {
    tags: string[];
    category: string;
    sourceSystem: string;
    correlationId?: string;
    parentAlertId?: string;
    childAlertIds: string[];
  };
  timestamps: {
    detectedAt: Date;
    acknowledgedAt?: Date;
    resolvedAt?: Date;
    lastUpdated: Date;
    nextReview: Date;
  };
  acknowledgedBy?: {
    userId: string;
    name: string;
    timestamp: Date;
    comments?: string;
  };
  resolvedBy?: {
    userId: string;
    name: string;
    timestamp: Date;
    resolution: string;
    preventiveAction?: string;
  };
}

export interface AlertRule {
  ruleId: string;
  name: string;
  description: string;
  type: 'threshold' | 'rate' | 'pattern' | 'anomaly' | 'compliance' | 'custom';
  category: 'inventory' | 'quality' | 'operational' | 'financial' | 'safety';
  isActive: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  scope: {
    entities: Array<{
      type: 'product' | 'warehouse' | 'zone' | 'category' | 'supplier';
      ids: string[];
      include: boolean;
    }>;
    conditions: Array<{
      field: string;
      operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'between' | 'contains';
      value: any;
      unit?: string;
    }>;
  };
  triggers: {
    frequency: 'real_time' | 'hourly' | 'daily' | 'weekly';
    evaluationWindow: number; // minutes
    consecutiveOccurrences: number;
    suppressionWindow: number; // minutes
    maxAlertsPerPeriod: number;
  };
  actions: Array<{
    type: 'create_alert' | 'send_notification' | 'execute_workflow' | 'create_task' | 'escalate';
    config: {
      severity?: string;
      recipients?: string[];
      template?: string;
      workflowId?: string;
      taskId?: string;
      escalationLevel?: number;
    };
    order: number;
  }>;
  schedule: {
    enabled: boolean;
    timezone: string;
    activeHours: {
      start: string;
      end: string;
    };
    activeDays: number[]; // 0-6 (Sunday-Saturday)
    holidays: string[];
  };
  owner: {
    userId: string;
    name: string;
    department: string;
  };
  performance: {
    totalTriggers: number;
    alertsCreated: number;
    falsePositives: number;
    accuracy: number;
    lastTriggered: Date;
    averageResolutionTime: number;
  };
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

export interface NotificationTemplate {
  templateId: string;
  name: string;
  type: 'email' | 'sms' | 'in_app' | 'push' | 'webhook';
  category: 'alert' | 'reminder' | 'report' | 'escalation';
  language: string;
  subject: string;
  body: string;
  variables: Array<{
    name: string;
    type: 'string' | 'number' | 'date' | 'boolean';
    description: string;
    required: boolean;
    defaultValue?: any;
  }>;
  formatting: {
    html: boolean;
    css: string;
    attachments: Array<{
      type: 'image' | 'document' | 'report';
      name: string;
      url: string;
      condition?: string;
    }>;
  };
  channels: {
    email: {
      enabled: boolean;
      from: string;
      replyTo: string;
      cc?: string[];
      bcc?: string[];
    };
    sms: {
      enabled: boolean;
      from: string;
      maxLength: number;
    };
    push: {
      enabled: boolean;
      title: string;
      icon: string;
      sound: string;
      badge: number;
    };
    in_app: {
      enabled: boolean;
      category: string;
      priority: 'low' | 'default' | 'high' | 'max';
      ttl: number; // seconds
    };
    webhook: {
      enabled: boolean;
      url: string;
      method: 'POST' | 'PUT';
      headers: Record<string, string>;
      retryPolicy: {
        maxAttempts: number;
        backoffMs: number;
      };
    };
  };
  isActive: boolean;
  version: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

export interface AlertDashboard {
  dashboardId: string;
  name: string;
  description: string;
  scope: {
    warehouseIds?: string[];
    categories?: string[];
    severities?: string[];
    timeRange: {
      start: Date;
      end: Date;
    };
  };
  summary: {
    totalAlerts: number;
    activeAlerts: number;
    criticalAlerts: number;
    resolvedToday: number;
    averageResolutionTime: number;
    mttr: number; // Mean Time To Resolution
    slaCompliance: number;
  };
  metrics: {
    alertsByType: Array<{
      type: string;
      count: number;
      percentage: number;
      trend: 'up' | 'down' | 'stable';
    }>;
    alertsBySeverity: Array<{
      severity: string;
      count: number;
      percentage: number;
      trend: 'up' | 'down' | 'stable';
    }>;
    alertsByStatus: Array<{
      status: string;
      count: number;
      percentage: number;
      avgAge: number; // hours
    }>;
    alertsByLocation: Array<{
      location: string;
      count: number;
      criticalCount: number;
      trend: 'up' | 'down' | 'stable';
    }>;
    performance: Array<{
      metric: string;
      current: number;
      target: number;
      trend: 'up' | 'down' | 'stable';
      status: 'good' | 'warning' | 'critical';
    }>;
  };
  trends: {
    alertVolume: Array<{
      date: string;
      total: number;
      critical: number;
      resolved: number;
    }>;
    resolutionTime: Array<{
      date: string;
      avgTime: number;
      mttr: number;
      slaTarget: number;
    }>;
    topAlertTypes: Array<{
      type: string;
      count: number;
      growth: number;
    }>;
  };
  activeAlerts: Array<{
    alertId: string;
    type: string;
    severity: string;
    title: string;
    entity: string;
    location: string;
    age: number; // hours
    assignedTo: string;
    status: string;
  }>;
  escalations: Array<{
    alertId: string;
    title: string;
    currentLevel: number;
    maxLevel: number;
    escalatedAt: Date;
    overdue: boolean;
  }>;
  recommendations: Array<{
    category: string;
    priority: string;
    description: string;
    impact: string;
    effort: string;
  }>;
  generatedAt: Date;
  generatedBy: string;
}

export class InventoryAlertsService {
  // Create Alert Rule
  async createAlertRule(params: {
    name: string;
    description: string;
    type: 'threshold' | 'rate' | 'pattern' | 'anomaly' | 'compliance' | 'custom';
    category: 'inventory' | 'quality' | 'operational' | 'financial' | 'safety';
    priority: 'low' | 'medium' | 'high' | 'critical';
    scope: {
      entities: Array<{
        type: 'product' | 'warehouse' | 'zone' | 'category' | 'supplier';
        ids: string[];
        include: boolean;
      }>;
      conditions: Array<{
        field: string;
        operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'between' | 'contains';
        value: any;
        unit?: string;
      }>;
    };
    triggers: {
      frequency: 'real_time' | 'hourly' | 'daily' | 'weekly';
      evaluationWindow?: number;
      consecutiveOccurrences?: number;
      suppressionWindow?: number;
      maxAlertsPerPeriod?: number;
    };
    actions: Array<{
      type: 'create_alert' | 'send_notification' | 'execute_workflow' | 'create_task' | 'escalate';
      config: {
        severity?: string;
        recipients?: string[];
        template?: string;
        workflowId?: string;
        taskId?: string;
        escalationLevel?: number;
      };
      order: number;
    }>;
    schedule?: {
      enabled?: boolean;
      timezone?: string;
      activeHours?: {
        start: string;
        end: string;
      };
      activeDays?: number[];
      holidays?: string[];
    };
    owner: string;
  }): Promise<AlertRule> {
    const ruleId = `RULE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const user = await this.getUserDetails(params.owner);

    const rule: AlertRule = {
      ruleId,
      name: params.name,
      description: params.description,
      type: params.type,
      category: params.category,
      isActive: true,
      priority: params.priority,
      scope: params.scope,
      triggers: {
        frequency: params.triggers.frequency,
        evaluationWindow: params.triggers.evaluationWindow || 60,
        consecutiveOccurrences: params.triggers.consecutiveOccurrences || 1,
        suppressionWindow: params.triggers.suppressionWindow || 300,
        maxAlertsPerPeriod: params.triggers.maxAlertsPerPeriod || 10
      },
      actions: params.actions,
      schedule: {
        enabled: params.schedule?.enabled || false,
        timezone: params.schedule?.timezone || 'UTC',
        activeHours: params.schedule?.activeHours || { start: '00:00', end: '23:59' },
        activeDays: params.schedule?.activeDays || [0, 1, 2, 3, 4, 5, 6],
        holidays: params.schedule?.holidays || []
      },
      owner: {
        userId: user.userId,
        name: user.name,
        department: user.department
      },
      performance: {
        totalTriggers: 0,
        alertsCreated: 0,
        falsePositives: 0,
        accuracy: 100,
        lastTriggered: new Date(),
        averageResolutionTime: 0
      },
      createdAt: new Date(),
      createdBy: params.owner,
      updatedAt: new Date(),
      updatedBy: params.owner
    };

    // Save rule
    await this.saveAlertRule(rule);

    return rule;
  }

  // Evaluate Alert Rules
  async evaluateAlertRules(ruleId?: string): Promise<InventoryAlert[]> {
    const rules = ruleId ? 
      await this.getAlertRule(ruleId) ? [await this.getAlertRule(ruleId)] : [] :
      await this.getActiveAlertRules();

    const triggeredAlerts: InventoryAlert[] = [];

    for (const rule of rules) {
      try {
        const evaluationResult = await this.evaluateRule(rule);
        if (evaluationResult.triggered) {
          const alert = await this.createAlertFromRule(rule, evaluationResult);
          triggeredAlerts.push(alert);
        }
      } catch (error) {
        console.error(`Error evaluating rule ${rule.ruleId}:`, error);
      }
    }

    return triggeredAlerts;
  }

  // Create Manual Alert
  async createManualAlert(params: {
    type: 'stockout' | 'low_stock' | 'overstock' | 'expiry' | 'quality' | 'movement' | 'theft' | 'damage' | 'reorder' | 'forecast' | 'compliance';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    entityId: string;
    entityType: 'product' | 'warehouse' | 'zone' | 'bin' | 'supplier' | 'order';
    entityName: string;
    location?: string;
    currentValue: number;
    thresholdValue: number;
    unit: string;
    currency?: string;
    financialImpact?: number;
    operationalImpact?: string;
    customerImpact?: string;
    assignTo?: string;
    notifyUsers?: string[];
    createdBy: string;
  }): Promise<InventoryAlert> {
    const alertId = `ALERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const user = await this.getUserDetails(params.createdBy);
    const entity = await this.getEntityDetails(params.entityType, params.entityId);

    const variance = params.currentValue - params.thresholdValue;
    const variancePercentage = params.thresholdValue !== 0 ? 
      (variance / params.thresholdValue) * 100 : 0;

    const alert: InventoryAlert = {
      alertId,
      type: params.type,
      severity: params.severity,
      status: 'active',
      title: params.title,
      description: params.description,
      category: this.getAlertCategory(params.type),
      source: {
        type: 'user',
        name: user.name,
        reference: params.createdBy
      },
      entity: {
        type: params.entityType,
        id: params.entityId,
        name: params.entityName,
        location: params.location
      },
      details: {
        currentValue: params.currentValue,
        thresholdValue: params.thresholdValue,
        variance,
        variancePercentage,
        unit: params.unit,
        currency: params.currency
      },
      impact: {
        financial: params.financialImpact || 0,
        operational: params.operationalImpact || 'Unknown',
        customer: params.customerImpact || 'Unknown',
        riskLevel: this.calculateRiskLevel(params.severity, variancePercentage)
      },
      actions: params.assignTo ? [{
        actionId: `ACT-${Date.now()}`,
        type: 'investigate',
        description: 'Investigate and resolve alert',
        assignedTo: params.assignTo,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        status: 'pending'
      }] : [],
      notifications: [],
      escalation: {
        level: 0,
        maxLevel: 3,
        currentOwner: params.assignTo || 'unassigned',
        escalationRules: this.getDefaultEscalationRules(params.severity),
        escalationHistory: []
      },
      metadata: {
        tags: [params.type, params.severity, params.entityType],
        category: params.type,
        sourceSystem: 'inventory_management',
        childAlertIds: []
      },
      timestamps: {
        detectedAt: new Date(),
        lastUpdated: new Date(),
        nextReview: new Date(Date.now() + 4 * 60 * 60 * 1000) // 4 hours
      }
    };

    // Send notifications
    if (params.notifyUsers && params.notifyUsers.length > 0) {
      await this.sendAlertNotifications(alert, params.notifyUsers);
    }

    // Save alert
    await this.saveAlert(alert);

    return alert;
  }

  // Acknowledge Alert
  async acknowledgeAlert(alertId: string, userId: string, comments?: string): Promise<InventoryAlert> {
    const alert = await this.getAlert(alertId);
    if (!alert) {
      throw new Error('Alert not found');
    }

    if (alert.status !== 'active') {
      throw new Error('Only active alerts can be acknowledged');
    }

    const user = await this.getUserDetails(userId);

    alert.status = 'acknowledged';
    alert.acknowledgedBy = {
      userId: user.userId,
      name: user.name,
      timestamp: new Date(),
      comments
    };
    alert.timestamps.acknowledgedAt = new Date();
    alert.timestamps.lastUpdated = new Date();

    // Update action status if assigned
    if (alert.actions.length > 0) {
      alert.actions[0].status = 'in_progress';
    }

    await this.updateAlert(alert);

    return alert;
  }

  // Resolve Alert
  async resolveAlert(alertId: string, userId: string, resolution: string, preventiveAction?: string): Promise<InventoryAlert> {
    const alert = await this.getAlert(alertId);
    if (!alert) {
      throw new Error('Alert not found');
    }

    const user = await this.getUserDetails(userId);

    alert.status = 'resolved';
    alert.resolvedBy = {
      userId: user.userId,
      name: user.name,
      timestamp: new Date(),
      resolution,
      preventiveAction
    };
    alert.timestamps.resolvedAt = new Date();
    alert.timestamps.lastUpdated = new Date();

    // Update action status
    alert.actions.forEach(action => {
      if (action.status === 'pending' || action.status === 'in_progress') {
        action.status = 'completed';
        action.completedAt = new Date();
        action.result = resolution;
      }
    });

    await this.updateAlert(alert);

    return alert;
  }

  // Generate Alert Dashboard
  async generateAlertDashboard(params: {
    warehouseIds?: string[];
    categories?: string[];
    severities?: string[];
    timeRange: {
      start: Date;
      end: Date;
    };
    includeDetails?: boolean;
    requestedBy: string;
  }): Promise<AlertDashboard> {
    const dashboardId = `DASH-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Get alert data for the period
    const alertData = await this.getAlertData(
      params.warehouseIds,
      params.categories,
      params.severities,
      params.timeRange
    );

    // Calculate summary metrics
    const summary = this.calculateDashboardSummary(alertData);

    // Calculate metrics breakdown
    const metrics = this.calculateDashboardMetrics(alertData);

    // Generate trends
    const trends = await this.generateDashboardTrends(alertData, params.timeRange);

    // Get active alerts
    const activeAlerts = await this.getActiveAlerts(params.warehouseIds, params.categories, params.severities);

    // Get escalations
    const escalations = await this.getActiveEscalations(params.warehouseIds);

    // Generate recommendations
    const recommendations = this.generateDashboardRecommendations(summary, metrics);

    const dashboard: AlertDashboard = {
      dashboardId,
      name: 'Inventory Alert Dashboard',
      description: 'Real-time inventory alerts and performance metrics',
      scope: {
        warehouseIds: params.warehouseIds,
        categories: params.categories,
        severities: params.severities,
        timeRange: params.timeRange
      },
      summary,
      metrics,
      trends,
      activeAlerts: params.includeDetails ? activeAlerts.slice(0, 10) : [],
      escalations: params.includeDetails ? escalations : [],
      recommendations,
      generatedAt: new Date(),
      generatedBy: params.requestedBy
    };

    return dashboard;
  }

  // Helper methods
  private async getUserDetails(userId: string) {
    // Simplified user retrieval
    return {
      userId,
      name: `User ${userId}`,
      email: `user${userId}@company.com`,
      department: 'Operations'
    };
  }

  private getAlertCategory(type: string): 'inventory_level' | 'quality' | 'operational' | 'financial' | 'compliance' | 'safety' {
    const categoryMap: Record<string, 'inventory_level' | 'quality' | 'operational' | 'financial' | 'compliance' | 'safety'> = {
      stockout: 'inventory_level',
      low_stock: 'inventory_level',
      overstock: 'inventory_level',
      expiry: 'quality',
      quality: 'quality',
      movement: 'operational',
      theft: 'safety',
      damage: 'quality',
      reorder: 'operational',
      forecast: 'financial',
      compliance: 'compliance'
    };
    return categoryMap[type] || 'operational';
  }

  private calculateRiskLevel(severity: string, variancePercentage: number): 'low' | 'medium' | 'high' | 'critical' {
    if (severity === 'critical' || Math.abs(variancePercentage) > 50) return 'critical';
    if (severity === 'high' || Math.abs(variancePercentage) > 25) return 'high';
    if (severity === 'medium' || Math.abs(variancePercentage) > 10) return 'medium';
    return 'low';
  }

  private getDefaultEscalationRules(severity: string) {
    const rules = [];
    
    if (severity === 'critical') {
      rules.push({
        condition: 'no_acknowledgment_1h',
        triggerTime: new Date(Date.now() + 60 * 60 * 1000),
        escalatedTo: 'manager',
        action: 'escalate_notification'
      });
      rules.push({
        condition: 'no_resolution_4h',
        triggerTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
        escalatedTo: 'director',
        action: 'escalate_notification'
      });
    } else if (severity === 'high') {
      rules.push({
        condition: 'no_acknowledgment_4h',
        triggerTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
        escalatedTo: 'manager',
        action: 'escalate_notification'
      });
    }

    return rules;
  }

  private async getEntityDetails(type: string, id: string) {
    // Simplified entity retrieval
    return {
      id,
      name: `Entity ${id}`,
      location: 'Warehouse A'
    };
  }

  private async sendAlertNotifications(alert: InventoryAlert, recipients: string[]) {
    for (const recipient of recipients) {
      const notification = {
        notificationId: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        recipient,
        channel: 'email' as const,
        status: 'pending' as const
      };
      alert.notifications.push(notification);
    }
  }

  private async saveAlert(alert: InventoryAlert) {
    // Save to database
    console.log(`Saving alert ${alert.alertId}`);
  }

  private async saveAlertRule(rule: AlertRule) {
    // Save to database
    console.log(`Saving alert rule ${rule.ruleId}`);
  }

  private async getAlertRule(ruleId: string) {
    // Simplified retrieval
    return {
      ruleId,
      name: 'Test Rule',
      type: 'threshold',
      category: 'inventory',
      priority: 'medium',
      scope: { entities: [], conditions: [] },
      triggers: { frequency: 'real_time', evaluationWindow: 60, consecutiveOccurrences: 1, suppressionWindow: 300, maxAlertsPerPeriod: 10 },
      actions: [],
      schedule: { enabled: false, timezone: 'UTC', activeHours: { start: '00:00', end: '23:59' }, activeDays: [0, 1, 2, 3, 4, 5, 6], holidays: [] },
      owner: { userId: 'user1', name: 'User 1', department: 'Operations' },
      performance: { totalTriggers: 0, alertsCreated: 0, falsePositives: 0, accuracy: 100, lastTriggered: new Date(), averageResolutionTime: 0 },
      isActive: true
    };
  }

  private async getActiveAlertRules() {
    // Simplified retrieval
    return [await this.getAlertRule('RULE001')];
  }

  private async evaluateRule(rule: any) {
    // Simplified rule evaluation
    return {
      triggered: Math.random() > 0.7, // 30% chance of triggering
      data: {
        entityId: 'PROD001',
        currentValue: 5,
        thresholdValue: 10
      }
    };
  }

  private async createAlertFromRule(rule: any, evaluationResult: any) {
    const alertId = `ALERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const alert: InventoryAlert = {
      alertId,
      type: 'low_stock',
      severity: rule.priority,
      status: 'active',
      title: `Alert from rule: ${rule.name}`,
      description: `Rule ${rule.name} triggered`,
      category: 'inventory_level',
      source: {
        type: 'system',
        name: 'Alert Engine',
        reference: rule.ruleId
      },
      entity: {
        type: 'product',
        id: evaluationResult.data.entityId,
        name: `Product ${evaluationResult.data.entityId}`
      },
      details: {
        currentValue: evaluationResult.data.currentValue,
        thresholdValue: evaluationResult.data.thresholdValue,
        variance: evaluationResult.data.currentValue - evaluationResult.data.thresholdValue,
        variancePercentage: ((evaluationResult.data.currentValue - evaluationResult.data.thresholdValue) / evaluationResult.data.thresholdValue) * 100,
        unit: 'units'
      },
      impact: {
        financial: 0,
        operational: 'Potential stockout',
        customer: 'Possible delay',
        riskLevel: 'medium'
      },
      actions: [],
      notifications: [],
      escalation: {
        level: 0,
        maxLevel: 3,
        currentOwner: 'unassigned',
        escalationRules: this.getDefaultEscalationRules(rule.priority),
        escalationHistory: []
      },
      metadata: {
        tags: ['system_generated', rule.type],
        category: rule.category,
        sourceSystem: 'alert_engine',
        childAlertIds: []
      },
      timestamps: {
        detectedAt: new Date(),
        lastUpdated: new Date(),
        nextReview: new Date(Date.now() + 4 * 60 * 60 * 1000)
      }
    };

    await this.saveAlert(alert);
    return alert;
  }

  private async getAlert(alertId: string) {
    // Simplified retrieval - return complete InventoryAlert object
    return {
      alertId,
      type: 'low_stock' as const,
      severity: 'medium' as const,
      status: 'active' as const,
      title: 'Low Stock Alert',
      description: 'Inventory level below threshold',
      category: 'inventory_level' as const,
      source: {
        type: 'system' as const,
        name: 'Alert System',
        reference: alertId
      },
      entity: {
        type: 'product' as const,
        id: 'PROD001',
        name: 'Product 1'
      },
      details: {
        currentValue: 5,
        thresholdValue: 10,
        variance: -5,
        variancePercentage: -50,
        unit: 'units'
      },
      impact: {
        financial: 100,
        operational: 'Medium',
        customer: 'Low',
        riskLevel: 'medium' as const
      },
      actions: [{ 
        actionId: 'ACT001',
        type: 'investigate' as const,
        description: 'Investigate low stock',
        assignedTo: 'user1',
        dueDate: new Date(),
        status: 'pending' as const
      }],
      notifications: [],
      escalation: {
        level: 0,
        maxLevel: 3,
        currentOwner: 'user1',
        escalationRules: [],
        escalationHistory: []
      },
      metadata: {
        tags: ['low_stock'],
        category: 'inventory',
        sourceSystem: 'inventory_system',
        childAlertIds: []
      },
      timestamps: {
        detectedAt: new Date(),
        lastUpdated: new Date(),
        nextReview: new Date()
      }
    };
  }

  private async updateAlert(alert: InventoryAlert) {
    // Update in database
    console.log(`Updating alert ${alert.alertId}`);
  }

  private async getAlertData(warehouseIds?: string[], categories?: string[], severities?: string[], timeRange?: { start: Date; end: Date }) {
    // Simplified data retrieval
    return [
      {
        alertId: 'ALERT001',
        type: 'low_stock',
        severity: 'medium',
        status: 'active',
        detectedAt: new Date(),
        resolvedAt: null,
        warehouseId: 'WH001'
      }
    ];
  }

  private calculateDashboardSummary(alertData: any[]) {
    const totalAlerts = alertData.length;
    const activeAlerts = alertData.filter(a => a.status === 'active').length;
    const criticalAlerts = alertData.filter(a => a.severity === 'critical').length;
    const resolvedToday = alertData.filter(a => 
      a.status === 'resolved' && 
      a.resolvedAt && 
      a.resolvedAt.toDateString() === new Date().toDateString()
    ).length;

    return {
      totalAlerts,
      activeAlerts,
      criticalAlerts,
      resolvedToday,
      averageResolutionTime: 4.5, // hours
      mttr: 4.5,
      slaCompliance: 85
    };
  }

  private calculateDashboardMetrics(alertData: any[]) {
    return {
      alertsByType: [
        { type: 'low_stock', count: 15, percentage: 45, trend: 'up' as const },
        { type: 'stockout', count: 8, percentage: 25, trend: 'stable' as const }
      ],
      alertsBySeverity: [
        { severity: 'critical', count: 3, percentage: 10, trend: 'down' as const },
        { severity: 'high', count: 10, percentage: 30, trend: 'stable' as const }
      ],
      alertsByStatus: [
        { status: 'active', count: 12, percentage: 40, avgAge: 2.5 },
        { status: 'resolved', count: 18, percentage: 60, avgAge: 0 }
      ],
      alertsByLocation: [
        { location: 'Warehouse A', count: 20, criticalCount: 2, trend: 'stable' as const }
      ],
      performance: [
        { metric: 'MTTR', current: 4.5, target: 4.0, trend: 'down' as const, status: 'warning' as const },
        { metric: 'SLA Compliance', current: 85, target: 90, trend: 'up' as const, status: 'warning' as const }
      ]
    };
  }

  private async generateDashboardTrends(alertData: any[], timeRange: { start: Date; end: Date }) {
    // Simplified trend generation
    return {
      alertVolume: [
        { date: '2024-01-01', total: 25, critical: 3, resolved: 20 }
      ],
      resolutionTime: [
        { date: '2024-01-01', avgTime: 4.5, mttr: 4.5, slaTarget: 4.0 }
      ],
      topAlertTypes: [
        { type: 'low_stock', count: 45, growth: 5.2 }
      ]
    };
  }

  private async getActiveAlerts(warehouseIds?: string[], categories?: string[], severities?: string[]) {
    // Simplified retrieval
    return [
      {
        alertId: 'ALERT001',
        type: 'low_stock',
        severity: 'medium',
        title: 'Low stock alert',
        entity: 'Product A',
        location: 'Warehouse A',
        age: 2.5,
        assignedTo: 'user1',
        status: 'active'
      }
    ];
  }

  private async getActiveEscalations(warehouseIds?: string[]) {
    // Simplified retrieval
    return [
      {
        alertId: 'ALERT001',
        title: 'Critical stockout',
        currentLevel: 1,
        maxLevel: 3,
        escalatedAt: new Date(),
        overdue: false
      }
    ];
  }

  private generateDashboardRecommendations(summary: any, metrics: any) {
    const recommendations = [];

    if (summary.activeAlerts > 20) {
      recommendations.push({
        category: 'Alert Management',
        priority: 'high',
        description: 'High number of active alerts requires attention',
        impact: 'Improved operational efficiency',
        effort: 'Medium'
      });
    }

    if (summary.slaCompliance < 90) {
      recommendations.push({
        category: 'Performance',
        priority: 'medium',
        description: 'SLA compliance below target',
        impact: 'Better service levels',
        effort: 'Low'
      });
    }

    return recommendations;
  }
}
