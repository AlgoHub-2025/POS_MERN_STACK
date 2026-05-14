import { Order, IOrder } from '../../models/Order';
import { Customer } from '../../models/Customer';
import { User } from '../../models/User';

export interface WorkflowDefinition {
  workflowId: string;
  name: string;
  description: string;
  category: 'order_processing' | 'approval' | 'fulfillment' | 'return' | 'exchange' | 'custom';
  version: string;
  status: 'draft' | 'active' | 'inactive' | 'archived';
  triggers: Array<{
    triggerId: string;
    name: string;
    type: 'manual' | 'automatic' | 'scheduled' | 'event_based';
    conditions: Array<{
      field: string;
      operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'not_in';
      value: any;
      logicalOperator?: 'and' | 'or';
    }>;
    schedule?: {
      frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'hourly';
      time?: string;
      dayOfWeek?: number;
      dayOfMonth?: number;
    };
    event?: string;
  }>;
  steps: Array<{
    stepId: string;
    name: string;
    description: string;
    type: 'manual' | 'automated' | 'approval' | 'conditional' | 'parallel' | 'notification' | 'integration';
    order: number;
    optional: boolean;
    configuration: {
      assignee?: {
        type: 'user' | 'role' | 'department' | 'dynamic';
        value: string | string[];
        criteria?: Array<{
          field: string;
          operator: string;
          value: any;
        }>;
      };
      dueIn?: number; // hours
      dependencies?: string[]; // step IDs
      conditions?: Array<{
        field: string;
        operator: string;
        value: any;
        logicalOperator?: 'and' | 'or';
      }>;
      actions?: Array<{
        type: 'update_status' | 'send_notification' | 'create_task' | 'call_api' | 'update_field' | 'escalate';
        parameters: Record<string, any>;
        order?: number;
      }>;
      approvals?: {
        required: number;
        approvers: Array<{
          type: 'user' | 'role' | 'department';
          value: string;
          optional?: boolean;
        }>;
        timeout?: number; // hours
        escalationRules?: Array<{
          condition: string;
          action: string;
          target: string;
        }>;
      };
      sla?: {
        target: number; // hours
        warning: number; // hours
        critical: number; // hours
      };
      notifications?: Array<{
        trigger: 'start' | 'complete' | 'overdue' | 'escalation';
        recipients: Array<{
          type: 'user' | 'role' | 'department' | 'email';
          value: string;
        }>;
        template: string;
        delay?: number; // minutes
      }>;
      integrations?: Array<{
        type: 'webhook' | 'api_call' | 'database' | 'email';
        endpoint?: string;
        method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
        headers?: Record<string, string>;
        body?: any;
        retryPolicy?: {
          attempts: number;
          delay: number;
          backoff: 'linear' | 'exponential';
        };
      }>;
      parallelSteps?: string[]; // for parallel type
      conditionalBranches?: Array<{
        name: string;
        condition: string;
        nextStep: string;
      }>;
    };
  }>;
  variables: Array<{
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
    required: boolean;
    defaultValue?: any;
    description?: string;
    source?: 'input' | 'calculated' | 'api' | 'database';
  }>;
  permissions: {
    canStart: string[];
    canView: string[];
    canEdit: string[];
    canDelete: string[];
    canManage: string[];
  };
  settings: {
    allowParallelExecution: boolean;
    allowSkipSteps: boolean;
    allowRollback: boolean;
    requireCompletion: boolean;
    timeout?: number; // hours
    retryPolicy?: {
      enabled: boolean;
      attempts: number;
      delay: number;
      conditions: string[];
    };
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    version: number;
    tags?: string[];
  };
}

export interface WorkflowInstance {
  instanceId: string;
  workflowId: string;
  workflowName: string;
  workflowVersion: string;
  orderId: string;
  orderNumber: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'suspended';
  trigger: {
    triggerId: string;
    type: string;
    triggeredBy: string;
    triggeredAt: Date;
    data?: any;
  };
  currentSteps: string[]; // step IDs currently active
  completedSteps: string[]; // step IDs completed
  variables: Record<string, any>;
  steps: Array<{
    stepId: string;
    name: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | 'cancelled';
    startedAt?: Date;
    completedAt?: Date;
    assignedTo?: string;
    assignedToName?: string;
    dueDate?: Date;
    sla?: {
      target: Date;
      warning?: Date;
      critical?: Date;
      breached: boolean;
    };
    results?: any;
    errors?: string[];
    warnings?: string[];
    duration?: number; // milliseconds
    attempts: number;
  }>;
  approvals: Array<{
    stepId: string;
    approvalId: string;
    approver: string;
    approverName: string;
    status: 'pending' | 'approved' | 'rejected' | 'escalated';
    decisionAt?: Date;
    comments?: string;
    delegatedTo?: string;
    delegatedAt?: Date;
  }>;
  notifications: Array<{
    notificationId: string;
    stepId: string;
    type: string;
    recipient: string;
    status: 'sent' | 'failed' | 'pending';
    sentAt?: Date;
    template: string;
    data?: any;
  }>;
  timeline: Array<{
    timestamp: Date;
    stepId?: string;
    action: string;
    description: string;
    performedBy: string;
    data?: any;
  }>;
  metrics: {
    totalDuration?: number;
    stepDurations: Record<string, number>;
    slaBreaches: number;
    escalations: number;
    retries: number;
  };
  context: {
    order: any;
    customer: any;
    user?: any;
    environment: Record<string, any>;
  };
  errors: Array<{
    stepId: string;
    error: string;
    timestamp: Date;
    resolved: boolean;
    resolution?: string;
  }>;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    startedAt?: Date;
    completedAt?: Date;
    lastActivityAt: Date;
  };
}

export interface WorkflowAnalytics {
  summary: {
    totalWorkflows: number;
    activeWorkflows: number;
    totalInstances: number;
    runningInstances: number;
    averageCompletionTime: number;
    successRate: number;
    slaComplianceRate: number;
    topWorkflows: Array<{
      workflowId: string;
      workflowName: string;
      instances: number;
      successRate: number;
      averageTime: number;
    }>;
  };
  byStatus: Record<string, {
    count: number;
    percentage: number;
    averageTime: number;
  }>;
  byWorkflow: Array<{
    workflowId: string;
    workflowName: string;
    instances: number;
    successRate: number;
    averageTime: number;
    slaCompliance: number;
  }>;
  performance: {
    completionTimes: Array<{
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
    slaCompliance: Array<{
      date: string;
      rate: number;
      target: number;
    }>;
    volume: Array<{
      date: string;
      instances: number;
      completed: number;
    }>;
  };
  bottlenecks: Array<{
    stepId: string;
    stepName: string;
    workflowId: string;
    workflowName: string;
    averageTime: number;
    failureRate: number;
    queueLength: number;
  }>;
  issues: Array<{
    type: 'timeout' | 'approval_delay' | 'integration_failure' | 'sla_breach';
    count: number;
    percentage: number;
    impact: string;
    trends: 'increasing' | 'decreasing' | 'stable';
  }>;
  recommendations: Array<{
    type: 'process' | 'automation' | 'resource' | 'sla';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    expectedImpact: string;
    implementation: string;
  }>;
}

export class OrderWorkflowService {
  private workflows: Map<string, WorkflowDefinition> = new Map();
  private instances: Map<string, WorkflowInstance> = new Map();
  private scheduledJobs: Map<string, any> = new Map();

  constructor() {
    this.initializeDefaultWorkflows();
    this.startScheduledJobs();
  }

  // Create workflow definition
  async createWorkflow(workflow: Omit<WorkflowDefinition, 'workflowId' | 'metadata' | 'status' | 'version'>, createdBy: string): Promise<WorkflowDefinition> {
    const newWorkflow: WorkflowDefinition = {
      workflowId: this.generateWorkflowId(),
      ...workflow,
      version: '1.0.0',
      status: 'draft',
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy,
        updatedBy: createdBy,
        version: 1
      }
    };

    // Validate workflow
    await this.validateWorkflow(newWorkflow);

    // Save workflow
    this.workflows.set(newWorkflow.workflowId, newWorkflow);

    return newWorkflow;
  }

  // Update workflow definition
  async updateWorkflow(workflowId: string, updates: Partial<WorkflowDefinition>, updatedBy: string): Promise<WorkflowDefinition> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    // Check if workflow has running instances
    const runningInstances = Array.from(this.instances.values())
      .filter(instance => instance.workflowId === workflowId && ['pending', 'running'].includes(instance.status));

    if (runningInstances.length > 0) {
      throw new Error('Cannot update workflow with running instances');
    }

    // Apply updates
    const updatedWorkflow = {
      ...workflow,
      ...updates,
      metadata: {
        ...workflow.metadata,
        updatedAt: new Date(),
        updatedBy,
        version: workflow.metadata.version + 1
      }
    };

    // Validate updated workflow
    await this.validateWorkflow(updatedWorkflow);

    // Save updated workflow
    this.workflows.set(workflowId, updatedWorkflow);

    return updatedWorkflow;
  }

  // Start workflow instance
  async startWorkflow(workflowId: string, orderId: string, triggerId: string, triggeredBy: string, variables?: Record<string, any>): Promise<WorkflowInstance> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    if (workflow.status !== 'active') {
      throw new Error('Workflow is not active');
    }

    // Check permissions
    if (!workflow.permissions.canStart.includes('*') && !workflow.permissions.canStart.includes(triggeredBy)) {
      throw new Error('Permission denied to start this workflow');
    }

    // Get order
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Get trigger
    const trigger = workflow.triggers.find(t => t.triggerId === triggerId);
    if (!trigger) {
      throw new Error('Trigger not found');
    }

    // Create instance
    const instance: WorkflowInstance = {
      instanceId: this.generateInstanceId(),
      workflowId: workflow.workflowId,
      workflowName: workflow.name,
      workflowVersion: workflow.version,
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      status: 'pending',
      trigger: {
        triggerId: trigger.triggerId,
        type: trigger.type,
        triggeredBy,
        triggeredAt: new Date(),
        data: variables
      },
      currentSteps: [],
      completedSteps: [],
      variables: variables || {},
      steps: workflow.steps.map(step => ({
        stepId: step.stepId,
        name: step.name,
        status: 'pending',
        attempts: 0
      })),
      approvals: [],
      notifications: [],
      timeline: [{
        timestamp: new Date(),
        action: 'workflow_started',
        description: `Workflow ${workflow.name} started`,
        performedBy: triggeredBy
      }],
      metrics: {
        stepDurations: {},
        slaBreaches: 0,
        escalations: 0,
        retries: 0
      },
      context: {
        order: order.toObject(),
        customer: order.customer,
        user: { id: triggeredBy },
        environment: {}
      },
      errors: [],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: triggeredBy,
        updatedBy: triggeredBy,
        lastActivityAt: new Date()
      }
    };

    // Initialize variables with defaults
    workflow.variables.forEach(variable => {
      if (!(variable.name in instance.variables) && variable.defaultValue !== undefined) {
        instance.variables[variable.name] = variable.defaultValue;
      }
    });

    // Save instance
    this.instances.set(instance.instanceId, instance);

    // Start workflow execution asynchronously
    this.executeWorkflow(instance, workflow).catch(error => {
      console.error(`Workflow execution failed: ${error.message}`);
    });

    return instance;
  }

  // Execute workflow
  private async executeWorkflow(instance: WorkflowInstance, workflow: WorkflowDefinition): Promise<void> {
    try {
      instance.status = 'running';
      instance.metadata.startedAt = new Date();
      instance.metadata.lastActivityAt = new Date();

      // Find initial steps (no dependencies)
      const initialSteps = workflow.steps.filter(step => 
        !step.configuration.dependencies || step.configuration.dependencies.length === 0
      );

      // Start initial steps
      for (const step of initialSteps) {
        await this.executeStep(instance, workflow, step);
      }

      // Continue execution while there are active steps
      while (instance.currentSteps.length > 0 && instance.status === 'running') {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Check every second
      }

      // Check if workflow is completed
      if (instance.completedSteps.length === workflow.steps.length) {
        instance.status = 'completed';
        instance.metadata.completedAt = new Date();
        
        // Calculate total duration
        if (instance.metadata.startedAt) {
          instance.metrics.totalDuration = instance.metadata.completedAt.getTime() - instance.metadata.startedAt.getTime();
        }

        // Add to timeline
        instance.timeline.push({
          timestamp: new Date(),
          action: 'workflow_completed',
          description: `Workflow ${workflow.name} completed successfully`,
          performedBy: 'system'
        });
      }

    } catch (error) {
      instance.status = 'failed';
      instance.errors.push({
        stepId: 'workflow',
        error: error.message,
        timestamp: new Date(),
        resolved: false
      });

      instance.timeline.push({
        timestamp: new Date(),
        action: 'workflow_failed',
        description: `Workflow failed: ${error.message}`,
        performedBy: 'system'
      });
    }

    instance.metadata.lastActivityAt = new Date();
  }

  // Execute workflow step
  private async executeStep(instance: WorkflowInstance, workflow: WorkflowDefinition, step: any): Promise<void> {
    const stepInstance = instance.steps.find(s => s.stepId === step.stepId);
    if (!stepInstance) {
      throw new Error(`Step ${step.stepId} not found`);
    }

    // Check if step is already running or completed
    if (['running', 'completed'].includes(stepInstance.status)) {
      return;
    }

    // Check dependencies
    if (step.configuration.dependencies) {
      const dependenciesMet = step.configuration.dependencies.every(depId => 
        instance.completedSteps.includes(depId)
      );
      if (!dependenciesMet) {
        return;
      }
    }

    // Check conditions
    if (step.configuration.conditions) {
      const conditionsMet = await this.evaluateConditions(step.configuration.conditions, instance);
      if (!conditionsMet) {
        stepInstance.status = 'skipped';
        instance.completedSteps.push(step.stepId);
        return;
      }
    }

    // Start step
    stepInstance.status = 'running';
    stepInstance.startedAt = new Date();
    instance.currentSteps.push(step.stepId);

    // Set due date and SLA
    if (step.configuration.dueIn) {
      stepInstance.dueDate = new Date(Date.now() + step.configuration.dueIn * 60 * 60 * 1000);
    }

    if (step.configuration.sla) {
      const now = new Date();
      stepInstance.sla = {
        target: new Date(now.getTime() + step.configuration.sla.target * 60 * 60 * 1000),
        warning: step.configuration.sla.warning ? 
          new Date(now.getTime() + step.configuration.sla.warning * 60 * 60 * 1000) : undefined,
        critical: step.configuration.sla.critical ? 
          new Date(now.getTime() + step.configuration.sla.critical * 60 * 60 * 1000) : undefined,
        breached: false
      };
    }

    // Assign step
    if (step.configuration.assignee) {
      const assignee = await this.resolveAssignee(step.configuration.assignee, instance);
      stepInstance.assignedTo = assignee.id;
      stepInstance.assignedToName = assignee.name;
    }

    // Add to timeline
    instance.timeline.push({
      timestamp: new Date(),
      stepId: step.stepId,
      action: 'step_started',
      description: `Step ${step.name} started`,
      performedBy: 'system'
    });

    try {
      // Execute step based on type
      switch (step.type) {
        case 'manual':
          await this.executeManualStep(instance, workflow, step);
          break;
        case 'automated':
          await this.executeAutomatedStep(instance, workflow, step);
          break;
        case 'approval':
          await this.executeApprovalStep(instance, workflow, step);
          break;
        case 'conditional':
          await this.executeConditionalStep(instance, workflow, step);
          break;
        case 'parallel':
          await this.executeParallelStep(instance, workflow, step);
          break;
        case 'notification':
          await this.executeNotificationStep(instance, workflow, step);
          break;
        case 'integration':
          await this.executeIntegrationStep(instance, workflow, step);
          break;
      }

    } catch (error) {
      stepInstance.status = 'failed';
      stepInstance.errors = [error.message];
      instance.errors.push({
        stepId: step.stepId,
        error: error.message,
        timestamp: new Date(),
        resolved: false
      });

      // Check retry policy
      if (workflow.settings.retryPolicy && workflow.settings.retryPolicy.enabled) {
        await this.handleRetry(instance, workflow, step, error);
      } else {
        throw error;
      }
    }

    instance.metadata.lastActivityAt = new Date();
  }

  // Execute manual step
  private async executeManualStep(instance: WorkflowInstance, workflow: WorkflowDefinition, step: any): Promise<void> {
    const stepInstance = instance.steps.find(s => s.stepId === step.stepId);
    if (!stepInstance) return;

    // Manual steps require user intervention
    // Step will remain in 'running' status until completed manually
    console.log(`Manual step ${step.name} waiting for user action`);
  }

  // Execute automated step
  private async executeAutomatedStep(instance: WorkflowInstance, workflow: WorkflowDefinition, step: any): Promise<void> {
    const stepInstance = instance.steps.find(s => s.stepId === step.stepId);
    if (!stepInstance) return;

    // Execute actions
    if (step.configuration.actions) {
      for (const action of step.configuration.actions) {
        await this.executeAction(action, instance);
      }
    }

    // Complete step
    stepInstance.status = 'completed';
    stepInstance.completedAt = new Date();
    stepInstance.duration = stepInstance.completedAt.getTime() - stepInstance.startedAt!.getTime();
    instance.metrics.stepDurations[step.stepId] = stepInstance.duration;

    // Update instance
    instance.currentSteps = instance.currentSteps.filter(id => id !== step.stepId);
    instance.completedSteps.push(step.stepId);

    // Add to timeline
    instance.timeline.push({
      timestamp: new Date(),
      stepId: step.stepId,
      action: 'step_completed',
      description: `Step ${step.name} completed automatically`,
      performedBy: 'system'
    });

    // Check for next steps
    await this.checkNextSteps(instance, workflow);
  }

  // Execute approval step
  private async executeApprovalStep(instance: WorkflowInstance, workflow: WorkflowDefinition, step: any): Promise<void> {
    const stepInstance = instance.steps.find(s => s.stepId === step.stepId);
    if (!stepInstance) return;

    // Create approval requests
    for (const approverConfig of step.configuration.approvers.approvers) {
      const approvers = await this.resolveApprovers(approverConfig, instance);
      
      for (const approver of approvers) {
        instance.approvals.push({
          stepId: step.stepId,
          approvalId: this.generateApprovalId(),
          approver: approver.id,
          approverName: approver.name,
          status: 'pending'
        });
      }
    }

    // Step completion will be handled when approvals are processed
    console.log(`Approval step ${step.name} created, waiting for approvals`);
  }

  // Execute conditional step
  private async executeConditionalStep(instance: WorkflowInstance, workflow: WorkflowDefinition, step: any): Promise<void> {
    const stepInstance = instance.steps.find(s => s.stepId === step.stepId);
    if (!stepInstance) return;

    // Evaluate conditions and route to appropriate branch
    for (const branch of step.configuration.conditionalBranches) {
      if (await this.evaluateCondition(branch.condition, instance)) {
        // Find and execute the next step
        const nextStep = workflow.steps.find(s => s.stepId === branch.nextStep);
        if (nextStep) {
          await this.executeStep(instance, workflow, nextStep);
        }
        break;
      }
    }

    // Complete conditional step
    stepInstance.status = 'completed';
    stepInstance.completedAt = new Date();
    instance.currentSteps = instance.currentSteps.filter(id => id !== step.stepId);
    instance.completedSteps.push(step.stepId);
  }

  // Execute parallel step
  private async executeParallelStep(instance: WorkflowInstance, workflow: WorkflowDefinition, step: any): Promise<void> {
    const stepInstance = instance.steps.find(s => s.stepId === step.stepId);
    if (!stepInstance) return;

    // Execute all parallel steps concurrently
    const parallelStepIds = step.configuration.parallelSteps || [];
    const parallelSteps = workflow.steps.filter(s => parallelStepIds.includes(s.stepId));

    const promises = parallelSteps.map(parallelStep => 
      this.executeStep(instance, workflow, parallelStep)
    );

    await Promise.all(promises);

    // Complete parallel step
    stepInstance.status = 'completed';
    stepInstance.completedAt = new Date();
    instance.currentSteps = instance.currentSteps.filter(id => id !== step.stepId);
    instance.completedSteps.push(step.stepId);

    // Check for next steps
    await this.checkNextSteps(instance, workflow);
  }

  // Execute notification step
  private async executeNotificationStep(instance: WorkflowInstance, workflow: WorkflowDefinition, step: any): Promise<void> {
    const stepInstance = instance.steps.find(s => s.stepId === step.stepId);
    if (!stepInstance) return;

    // Send notifications
    if (step.configuration.notifications) {
      for (const notificationConfig of step.configuration.notifications) {
        await this.sendNotification(instance, notificationConfig);
      }
    }

    // Complete step
    stepInstance.status = 'completed';
    stepInstance.completedAt = new Date();
    instance.currentSteps = instance.currentSteps.filter(id => id !== step.stepId);
    instance.completedSteps.push(step.stepId);

    // Check for next steps
    await this.checkNextSteps(instance, workflow);
  }

  // Execute integration step
  private async executeIntegrationStep(instance: WorkflowInstance, workflow: WorkflowDefinition, step: any): Promise<void> {
    const stepInstance = instance.steps.find(s => s.stepId === step.stepId);
    if (!stepInstance) return;

    // Execute integrations
    if (step.configuration.integrations) {
      for (const integration of step.configuration.integrations) {
        await this.executeIntegration(integration, instance);
      }
    }

    // Complete step
    stepInstance.status = 'completed';
    stepInstance.completedAt = new Date();
    instance.currentSteps = instance.currentSteps.filter(id => id !== step.stepId);
    instance.completedSteps.push(step.stepId);

    // Check for next steps
    await this.checkNextSteps(instance, workflow);
  }

  // Complete workflow step manually
  async completeStep(instanceId: string, stepId: string, completedBy: string, results?: any): Promise<WorkflowInstance> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error('Workflow instance not found');
    }

    const stepInstance = instance.steps.find(s => s.stepId === stepId);
    if (!stepInstance) {
      throw new Error('Step not found');
    }

    if (stepInstance.status !== 'running') {
      throw new Error('Step is not running');
    }

    // Check if user can complete this step
    if (stepInstance.assignedTo && stepInstance.assignedTo !== completedBy) {
      throw new Error('User is not assigned to this step');
    }

    // Complete step
    stepInstance.status = 'completed';
    stepInstance.completedAt = new Date();
    stepInstance.duration = stepInstance.completedAt.getTime() - stepInstance.startedAt!.getTime();
    stepInstance.results = results;
    instance.metrics.stepDurations[stepId] = stepInstance.duration;

    // Update instance
    instance.currentSteps = instance.currentSteps.filter(id => id !== stepId);
    instance.completedSteps.push(stepId);
    instance.metadata.updatedBy = completedBy;
    instance.metadata.lastActivityAt = new Date();

    // Add to timeline
    instance.timeline.push({
      timestamp: new Date(),
      stepId,
      action: 'step_completed',
      description: `Step ${stepInstance.name} completed manually`,
      performedBy: completedBy,
      data: results
    });

    // Get workflow and check for next steps
    const workflow = this.workflows.get(instance.workflowId);
    if (workflow) {
      await this.checkNextSteps(instance, workflow);
    }

    return instance;
  }

  // Process approval
  async processApproval(instanceId: string, stepId: string, approvalId: string, decision: 'approved' | 'rejected', approvedBy: string, comments?: string): Promise<WorkflowInstance> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error('Workflow instance not found');
    }

    const approval = instance.approvals.find(a => a.approvalId === approvalId && a.stepId === stepId);
    if (!approval) {
      throw new Error('Approval not found');
    }

    if (approval.status !== 'pending') {
      throw new Error('Approval has already been processed');
    }

    // Update approval
    approval.status = decision;
    approval.decisionAt = new Date();
    approval.comments = comments;

    // Add to timeline
    instance.timeline.push({
      timestamp: new Date(),
      stepId,
      action: `approval_${decision}`,
      description: `Approval ${decision} by ${approvedBy}`,
      performedBy: approvedBy,
      data: { comments }
    });

    // Check if step can be completed
    const workflow = this.workflows.get(instance.workflowId);
    if (workflow) {
      const step = workflow.steps.find(s => s.stepId === stepId);
      if (step && step.type === 'approval') {
        await this.checkApprovalCompletion(instance, workflow, step);
      }
    }

    instance.metadata.lastActivityAt = new Date();

    return instance;
  }

  // Check approval completion
  private async checkApprovalCompletion(instance: WorkflowInstance, workflow: WorkflowDefinition, step: any): Promise<void> {
    const stepApprovals = instance.approvals.filter(a => a.stepId === step.stepId);
    const requiredApprovals = step.configuration.approvals.required;
    const approvedCount = stepApprovals.filter(a => a.status === 'approved').length;
    const rejectedCount = stepApprovals.filter(a => a.status === 'rejected').length;

    const stepInstance = instance.steps.find(s => s.stepId === step.stepId);
    if (!stepInstance) return;

    // Check if enough approvals or if rejected
    if (rejectedCount > 0 || approvedCount >= requiredApprovals) {
      stepInstance.status = rejectedCount > 0 ? 'failed' : 'completed';
      stepInstance.completedAt = new Date();
      stepInstance.duration = stepInstance.completedAt.getTime() - stepInstance.startedAt!.getTime();
      instance.metrics.stepDurations[step.stepId] = stepInstance.duration;

      // Update instance
      instance.currentSteps = instance.currentSteps.filter(id => id !== step.stepId);
      if (rejectedCount === 0) {
        instance.completedSteps.push(step.stepId);
      }

      // Add to timeline
      instance.timeline.push({
        timestamp: new Date(),
        stepId: step.stepId,
        action: 'step_completed',
        description: `Approval step ${step.name} ${rejectedCount > 0 ? 'rejected' : 'approved'}`,
        performedBy: 'system'
      });

      // Check for next steps if approved
      if (rejectedCount === 0) {
        await this.checkNextSteps(instance, workflow);
      }
    }
  }

  // Check for next steps
  private async checkNextSteps(instance: WorkflowInstance, workflow: WorkflowDefinition): Promise<void> {
    for (const step of workflow.steps) {
      if (instance.completedSteps.includes(step.stepId) || instance.currentSteps.includes(step.stepId)) {
        continue;
      }

      // Check if all dependencies are completed
      if (step.configuration.dependencies) {
        const dependenciesMet = step.configuration.dependencies.every(depId => 
          instance.completedSteps.includes(depId)
        );
        if (dependenciesMet) {
          await this.executeStep(instance, workflow, step);
        }
      }
    }
  }

  // Get workflow analytics
  async getWorkflowAnalytics(startDate: Date, endDate: Date): Promise<WorkflowAnalytics> {
    // Get instances within date range
    const instances = await this.getInstancesByDateRange(startDate, endDate);

    // Calculate summary
    const summary = this.calculateWorkflowSummary(instances);

    // Analyze by status
    const byStatus = this.analyzeInstancesByStatus(instances);

    // Analyze by workflow
    const byWorkflow = this.analyzeInstancesByWorkflow(instances);

    // Calculate performance metrics
    const performance = await this.calculateWorkflowPerformance(instances, startDate, endDate);

    // Identify bottlenecks
    const bottlenecks = await this.identifyBottlenecks(instances);

    // Identify issues
    const issues = await this.identifyWorkflowIssues(instances);

    // Generate recommendations
    const recommendations = await this.generateWorkflowRecommendations(instances, summary, issues);

    return {
      summary,
      byStatus,
      byWorkflow,
      performance,
      bottlenecks,
      issues,
      recommendations
    };
  }

  // Helper methods
  private async validateWorkflow(workflow: WorkflowDefinition): Promise<void> {
    // Validate basic structure
    if (!workflow.name || workflow.name.trim().length === 0) {
      throw new Error('Workflow name is required');
    }

    // Validate triggers
    if (!workflow.triggers || workflow.triggers.length === 0) {
      throw new Error('At least one trigger is required');
    }

    // Validate steps
    if (!workflow.steps || workflow.steps.length === 0) {
      throw new Error('At least one step is required');
    }

    // Validate step dependencies
    const stepIds = workflow.steps.map(s => s.stepId);
    for (const step of workflow.steps) {
      if (step.configuration.dependencies) {
        for (const depId of step.configuration.dependencies) {
          if (!stepIds.includes(depId)) {
            throw new Error(`Step ${step.stepId} depends on non-existent step ${depId}`);
          }
        }
      }
    }

    // Validate circular dependencies
    if (this.hasCircularDependencies(workflow.steps)) {
      throw new Error('Workflow has circular dependencies');
    }
  }

  private hasCircularDependencies(steps: any[]): boolean {
    // Simple circular dependency detection
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (stepId: string): boolean => {
      if (recursionStack.has(stepId)) {
        return true;
      }
      if (visited.has(stepId)) {
        return false;
      }

      visited.add(stepId);
      recursionStack.add(stepId);

      const step = steps.find(s => s.stepId === stepId);
      if (step && step.configuration.dependencies) {
        for (const depId of step.configuration.dependencies) {
          if (hasCycle(depId)) {
            return true;
          }
        }
      }

      recursionStack.delete(stepId);
      return false;
    };

    for (const step of steps) {
      if (!visited.has(step.stepId) && hasCycle(step.stepId)) {
        return true;
      }
    }

    return false;
  }

  private async evaluateConditions(conditions: any[], instance: WorkflowInstance): Promise<boolean> {
    for (const condition of conditions) {
      const fieldValue = this.getFieldValue(instance, condition.field);
      const result = this.compareValues(fieldValue, condition.operator, condition.value);
      
      if (condition.logicalOperator === 'or' && result) {
        return true;
      }
      if (condition.logicalOperator !== 'or' && !result) {
        return false;
      }
    }
    return true;
  }

  private async evaluateCondition(condition: string, instance: WorkflowInstance): Promise<boolean> {
    // Mock condition evaluation
    return true;
  }

  private getFieldValue(instance: WorkflowInstance, field: string): any {
    // Handle nested field access
    const parts = field.split('.');
    let value: any = instance;

    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = value[part];
      } else {
        value = undefined;
        break;
      }
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

  private async resolveAssignee(assigneeConfig: any, instance: WorkflowInstance): Promise<{ id: string; name: string }> {
    // Mock assignee resolution
    switch (assigneeConfig.type) {
      case 'user':
        return { id: assigneeConfig.value, name: 'User Name' };
      case 'role':
        return { id: 'role_' + assigneeConfig.value, name: 'Role Name' };
      case 'department':
        return { id: 'dept_' + assigneeConfig.value, name: 'Department Name' };
      default:
        return { id: 'system', name: 'System' };
    }
  }

  private async resolveApprovers(approverConfig: any, instance: WorkflowInstance): Promise<Array<{ id: string; name: string }>> {
    // Mock approver resolution
    return [{ id: approverConfig.value, name: 'Approver Name' }];
  }

  private async executeAction(action: any, instance: WorkflowInstance): Promise<void> {
    // Mock action execution
    console.log(`Executing action ${action.type} for workflow instance ${instance.instanceId}`);
  }

  private async sendNotification(instance: WorkflowInstance, notificationConfig: any): Promise<void> {
    // Mock notification sending
    const notification = {
      notificationId: this.generateNotificationId(),
      stepId: notificationConfig.stepId || 'unknown',
      type: notificationConfig.type,
      recipient: notificationConfig.recipients[0]?.value || 'unknown',
      status: 'sent' as const,
      sentAt: new Date(),
      template: notificationConfig.template
    };

    instance.notifications.push(notification);
  }

  private async executeIntegration(integration: any, instance: WorkflowInstance): Promise<void> {
    // Mock integration execution
    console.log(`Executing integration ${integration.type} for workflow instance ${instance.instanceId}`);
  }

  private async handleRetry(instance: WorkflowInstance, workflow: WorkflowDefinition, step: any, error: any): Promise<void> {
    const retryPolicy = workflow.settings.retryPolicy;
    if (!retryPolicy || !retryPolicy.enabled) {
      throw error;
    }

    const stepInstance = instance.steps.find(s => s.stepId === step.stepId);
    if (!stepInstance) return;

    // Check retry conditions
    const canRetry = !retryPolicy.conditions || 
      retryPolicy.conditions.some(condition => this.evaluateCondition(condition, instance));

    if (canRetry && stepInstance.attempts < retryPolicy.attempts) {
      stepInstance.attempts++;
      instance.metrics.retries++;

      // Add delay
      const delay = retryPolicy.delay * Math.pow(2, stepInstance.attempts - 1); // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * 1000));

      // Retry step
      await this.executeStep(instance, workflow, step);
    } else {
      throw error;
    }
  }

  // Analytics helper methods
  private async getInstancesByDateRange(startDate: Date, endDate: Date): Promise<WorkflowInstance[]> {
    // Mock implementation
    return Array.from(this.instances.values());
  }

  private calculateWorkflowSummary(instances: WorkflowInstance[]): any {
    const totalWorkflows = this.workflows.size;
    const activeWorkflows = Array.from(this.workflows.values()).filter(w => w.status === 'active').length;
    const totalInstances = instances.length;
    const runningInstances = instances.filter(i => i.status === 'running').length;
    const completedInstances = instances.filter(i => i.status === 'completed');
    const successRate = totalInstances > 0 ? completedInstances.length / totalInstances : 0;
    const averageCompletionTime = completedInstances.length > 0 ? 
      completedInstances.reduce((sum, i) => sum + (i.metrics.totalDuration || 0), 0) / completedInstances.length : 0;
    const slaComplianceRate = 0.95; // Mock value

    // Calculate top workflows
    const workflowUsage = new Map<string, { count: number; totalTime: number; }>();
    instances.forEach(instance => {
      const current = workflowUsage.get(instance.workflowId) || { count: 0, totalTime: 0 };
      current.count++;
      current.totalTime += instance.metrics.totalDuration || 0;
      workflowUsage.set(instance.workflowId, current);
    });

    const topWorkflows = Array.from(workflowUsage.entries())
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 5)
      .map(([workflowId, data]) => {
        const workflow = this.workflows.get(workflowId);
        return {
          workflowId,
          workflowName: workflow?.name || 'Unknown',
          instances: data.count,
          successRate: 0.90, // Mock value
          averageTime: data.count > 0 ? data.totalTime / data.count : 0
        };
      });

    return {
      totalWorkflows,
      activeWorkflows,
      totalInstances,
      runningInstances,
      averageCompletionTime,
      successRate,
      slaComplianceRate,
      topWorkflows
    };
  }

  private analyzeInstancesByStatus(instances: WorkflowInstance[]): Record<string, any> {
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
      data.averageTime = instances
        .filter(i => i.status === status)
        .reduce((sum, i) => sum + (i.metrics.totalDuration || 0), 0) / data.count;
    });

    return byStatus;
  }

  private analyzeInstancesByWorkflow(instances: WorkflowInstance[]): any[] {
    // Mock implementation
    return [];
  }

  private async calculateWorkflowPerformance(instances: WorkflowInstance[], startDate: Date, endDate: Date): Promise<any> {
    // Mock implementation
    return {
      completionTimes: [],
      successRates: [],
      slaCompliance: [],
      volume: []
    };
  }

  private async identifyBottlenecks(instances: WorkflowInstance[]): Promise<any[]> {
    // Mock implementation
    return [];
  }

  private async identifyWorkflowIssues(instances: WorkflowInstance[]): Promise<any[]> {
    // Mock implementation
    return [];
  }

  private async generateWorkflowRecommendations(instances: WorkflowInstance[], summary: any, issues: any[]): Promise<any[]> {
    // Mock implementation
    return [];
  }

  // Initialize default workflows
  private initializeDefaultWorkflows(): void {
    // Order approval workflow
    this.workflows.set('order_approval', {
      workflowId: 'order_approval',
      name: 'Order Approval Workflow',
      description: 'Standard workflow for order approval',
      category: 'approval',
      version: '1.0.0',
      status: 'active',
      triggers: [
        {
          triggerId: 'manual_start',
          name: 'Manual Start',
          type: 'manual',
          conditions: []
        },
        {
          triggerId: 'high_value_auto',
          name: 'High Value Auto Start',
          type: 'automatic',
          conditions: [
            { field: 'order.total', operator: 'greater_than', value: 1000 }
          ]
        }
      ],
      steps: [
        {
          stepId: 'initial_review',
          name: 'Initial Review',
          description: 'Review order details and validate',
          type: 'manual',
          order: 1,
          optional: false,
          configuration: {
            assignee: {
              type: 'role',
              value: 'order_clerk'
            },
            dueIn: 24,
            actions: [
              {
                type: 'update_status',
                parameters: { status: 'reviewing' }
              }
            ]
          }
        },
        {
          stepId: 'manager_approval',
          name: 'Manager Approval',
          description: 'Get manager approval for the order',
          type: 'approval',
          order: 2,
          optional: false,
          configuration: {
            assignee: {
              type: 'role',
              value: 'manager'
            },
            dueIn: 48,
            approvals: {
              required: 1,
              approvers: [
                { type: 'role', value: 'manager' }
              ],
              timeout: 48
            },
            conditions: [
              { field: 'order.total', operator: 'greater_than', value: 500 }
            ]
          }
        },
        {
          stepId: 'final_processing',
          name: 'Final Processing',
          description: 'Process approved order',
          type: 'automated',
          order: 3,
          optional: false,
          configuration: {
            actions: [
              {
                type: 'update_status',
                parameters: { status: 'approved' }
              },
              {
                type: 'send_notification',
                parameters: { 
                  type: 'email',
                  recipients: ['customer'],
                  template: 'order_approved'
                }
              }
            ]
          }
        }
      ],
      variables: [],
      permissions: {
        canStart: ['sales', 'manager'],
        canView: ['*'],
        canEdit: ['manager', 'admin'],
        canDelete: ['admin'],
        canManage: ['admin']
      },
      settings: {
        allowParallelExecution: false,
        allowSkipSteps: false,
        allowRollback: true,
        requireCompletion: true,
        retryPolicy: {
          enabled: true,
          attempts: 3,
          delay: 5,
          conditions: ['network_error', 'timeout']
        }
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
        version: 1
      }
    });
  }

  // Start scheduled jobs
  private startScheduledJobs(): void {
    // Check for scheduled triggers every minute
    setInterval(() => {
      this.checkScheduledTriggers();
    }, 60000);
  }

  private async checkScheduledTriggers(): Promise<void> {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDay = now.getDay();

    const scheduledTriggers = Array.from(this.workflows.values())
      .filter(workflow => workflow.status === 'active')
      .flatMap(workflow => workflow.triggers)
      .filter(trigger => trigger.type === 'scheduled')
      .filter(trigger => this.isScheduleMatch(trigger.schedule, currentHour, currentMinute, currentDay));

    for (const trigger of scheduledTriggers) {
      try {
        // Find orders that match trigger conditions
        const orders = await this.findOrdersForTrigger(trigger);
        
        // Start workflow for each matching order
        for (const order of orders) {
          await this.startWorkflow(trigger.triggerId, order._id.toString(), trigger.triggerId, 'system');
        }
      } catch (error) {
        console.error(`Failed to execute scheduled trigger ${trigger.triggerId}: ${error.message}`);
      }
    }
  }

  private isScheduleMatch(schedule: any, hour: number, minute: number, day: number): boolean {
    if (!schedule) return false;

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

  private async findOrdersForTrigger(trigger: any): Promise<IOrder[]> {
    // Mock implementation - would query orders based on trigger conditions
    return [];
  }

  // Helper methods
  private generateWorkflowId(): string {
    return `WF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  private generateInstanceId(): string {
    return `WFI-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  private generateApprovalId(): string {
    return `APR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  private generateNotificationId(): string {
    return `NOT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  // Public methods
  async getWorkflow(workflowId: string): Promise<WorkflowDefinition | null> {
    return this.workflows.get(workflowId) || null;
  }

  async getWorkflows(filters?: { category?: string; status?: string }): Promise<WorkflowDefinition[]> {
    let workflows = Array.from(this.workflows.values());

    if (filters?.category) {
      workflows = workflows.filter(workflow => workflow.category === filters.category);
    }

    if (filters?.status) {
      workflows = workflows.filter(workflow => workflow.status === filters.status);
    }

    return workflows.sort((a, b) => b.metadata.updatedAt.getTime() - a.metadata.updatedAt.getTime());
  }

  async getInstance(instanceId: string): Promise<WorkflowInstance | null> {
    return this.instances.get(instanceId) || null;
  }

  async getInstances(filters?: { workflowId?: string; status?: string; orderId?: string }): Promise<WorkflowInstance[]> {
    let instances = Array.from(this.instances.values());

    if (filters?.workflowId) {
      instances = instances.filter(instance => instance.workflowId === filters.workflowId);
    }

    if (filters?.status) {
      instances = instances.filter(instance => instance.status === filters.status);
    }

    if (filters?.orderId) {
      instances = instances.filter(instance => instance.orderId === filters.orderId);
    }

    return instances.sort((a, b) => b.metadata.createdAt.getTime() - a.metadata.createdAt.getTime());
  }

  async cancelInstance(instanceId: string, reason?: string): Promise<void> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error('Workflow instance not found');
    }

    if (!['pending', 'running'].includes(instance.status)) {
      throw new Error('Cannot cancel completed instance');
    }

    instance.status = 'cancelled';
    instance.metadata.updatedAt = new Date();

    // Cancel all running steps
    for (const step of instance.steps) {
      if (step.status === 'running') {
        step.status = 'cancelled';
      }
    }

    instance.currentSteps = [];

    // Add to timeline
    instance.timeline.push({
      timestamp: new Date(),
      action: 'workflow_cancelled',
      description: reason || 'Workflow cancelled by user',
      performedBy: 'user'
    });
  }

  async suspendInstance(instanceId: string, reason?: string): Promise<void> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error('Workflow instance not found');
    }

    if (instance.status !== 'running') {
      throw new Error('Only running instances can be suspended');
    }

    instance.status = 'suspended';
    instance.metadata.updatedAt = new Date();

    // Add to timeline
    instance.timeline.push({
      timestamp: new Date(),
      action: 'workflow_suspended',
      description: reason || 'Workflow suspended',
      performedBy: 'user'
    });
  }

  async resumeInstance(instanceId: string, resumedBy: string): Promise<void> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error('Workflow instance not found');
    }

    if (instance.status !== 'suspended') {
      throw new Error('Only suspended instances can be resumed');
    }

    instance.status = 'running';
    instance.metadata.updatedAt = new Date();
    instance.metadata.lastActivityAt = new Date();

    // Add to timeline
    instance.timeline.push({
      timestamp: new Date(),
      action: 'workflow_resumed',
      description: 'Workflow resumed',
      performedBy: resumedBy
    });

    // Resume workflow execution
    const workflow = this.workflows.get(instance.workflowId);
    if (workflow) {
      this.executeWorkflow(instance, workflow).catch(error => {
        console.error(`Workflow execution failed: ${error.message}`);
      });
    }
  }
}
