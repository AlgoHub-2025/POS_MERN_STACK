import { Employee, IEmployee } from '../models/Employee';
import mongoose from 'mongoose';
import { EventEmitter } from 'events';

export interface TimeOffPolicy {
  id: string;
  name: string;
  type: 'vacation' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'bereavement' | 'unpaid' | 'other';
  accrualType: 'annual' | 'monthly' | 'biweekly' | 'per_hour' | 'none';
  accrualRate: number; // days per period
  maxAccrual: number; // maximum days that can be accumulated
  prorationEnabled: boolean;
  waitingPeriod: number; // days before eligible for accrual
  carryOverEnabled: boolean;
  carryOverLimit: number; // max days that can be carried over
  carryOverExpiry: number; // days after which carried over days expire
  approvalRequired: boolean;
  minAdvanceNotice: number; // days in advance required
  maxConsecutiveDays: number;
  blackoutDates: Array<{
    startDate: Date;
    endDate: Date;
    reason: string;
    affectsDepartments?: string[];
    affectsPositions?: string[];
  }>;
  documentationRequired: boolean;
  autoApprovalEnabled: boolean;
  autoApprovalConditions: {
    minDaysRequested: number;
    maxDaysRequested: number;
    excludePeakSeasons: boolean;
  };
  isActive: boolean;
  createdAt: Date;
  updatedBy: string;
}

export interface TimeOffRequest {
  id: string;
  employeeId: string;
  policyId: string;
  type: 'vacation' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'bereavement' | 'unpaid' | 'other';
  startDate: Date;
  endDate: Date;
  days: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'on_hold';
  requestedAt: Date;
  requestedBy: string;
  approvers: Array<{
    approverId: string;
    approverName: string;
    approverRole: string;
    status: 'pending' | 'approved' | 'rejected';
    decisionAt?: Date;
    comments?: string;
    escalationLevel: number;
  }>;
  attachments: Array<{
    id: string;
    name: string;
    url: string;
    uploadedAt: Date;
    type: string;
  }>;
  isPaidTimeOff: boolean;
  emergencyContact: boolean;
  calendarEventId?: string;
  recurrencePattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
    occurrences?: number;
  };
  workflowHistory: Array<{
    action: string;
    performedBy: string;
    performedAt: Date;
    comments?: string;
  }>;
  autoApproved: boolean;
  autoApprovalReason?: string;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeOffBalance {
  employeeId: string;
  policyId: string;
  policyName: string;
  type: string;
  currentBalance: number;
  accruedThisYear: number;
  usedThisYear: number;
  carriedOver: number;
  pendingApproval: number;
  scheduledFuture: number;
  lastAccrualDate?: Date;
  nextAccrualDate?: Date;
  accrualHistory: Array<{
    date: Date;
    amount: number;
    reason: string;
    type: 'accrual' | 'adjustment' | 'carry_over' | 'expiry';
  }>;
  isActive: boolean;
  updatedAt: Date;
}

export interface AccrualResult {
  employeeId: string;
  policyId: string;
  totalAccrued: number;
  totalUsed: number;
  currentBalance: number;
  projectedBalance: Date;
  accrualSchedule: Array<{
    date: Date;
    amount: number;
    balance: number;
  }>;
  warnings: Array<{
    type: 'low_balance' | 'max_balance' | 'expiry_warning' | 'blackout_date';
    message: string;
    severity: 'info' | 'warning' | 'error';
  }>;
}

export interface CalendarIntegration {
  provider: 'google' | 'outlook' | 'apple' | 'office365';
  calendarId: string;
  accessToken: string;
  refreshToken?: string;
  isActive: boolean;
  syncSettings: {
    syncTimeOffRequests: boolean;
    syncBlackoutDates: boolean;
    createEventsForApproved: boolean;
    updateExistingEvents: boolean;
    defaultEventDuration: number; // minutes
    defaultReminder: number; // minutes before
  };
  lastSyncAt?: Date;
  syncErrors: Array<{
    timestamp: Date;
    error: string;
    requestId?: string;
  }>;
}

class TimeOffService extends EventEmitter {
  private policies: Map<string, TimeOffPolicy> = new Map();
  private requests: Map<string, TimeOffRequest> = new Map();
  private balances: Map<string, TimeOffBalance[]> = new Map();
  private calendarIntegrations: Map<string, CalendarIntegration> = new Map();

  constructor() {
    super();
    this.initializeDefaultPolicies();
  }

  /**
   * Initialize default time-off policies
   */
  private initializeDefaultPolicies(): void {
    const defaultPolicies: TimeOffPolicy[] = [
      {
        id: 'vacation_policy',
        name: 'Vacation Leave',
        type: 'vacation',
        accrualType: 'monthly',
        accrualRate: 1.67, // ~20 days per year
        maxAccrual: 40,
        prorationEnabled: true,
        waitingPeriod: 90,
        carryOverEnabled: true,
        carryOverLimit: 10,
        carryOverExpiry: 90,
        approvalRequired: true,
        minAdvanceNotice: 7,
        maxConsecutiveDays: 14,
        blackoutDates: [],
        documentationRequired: false,
        autoApprovalEnabled: true,
        autoApprovalConditions: {
          minDaysRequested: 1,
          maxDaysRequested: 3,
          excludePeakSeasons: true
        },
        isActive: true,
        createdAt: new Date(),
        updatedBy: 'system'
      },
      {
        id: 'sick_policy',
        name: 'Sick Leave',
        type: 'sick',
        accrualType: 'monthly',
        accrualRate: 0.83, // ~10 days per year
        maxAccrual: 20,
        prorationEnabled: true,
        waitingPeriod: 30,
        carryOverEnabled: false,
        carryOverLimit: 0,
        carryOverExpiry: 0,
        approvalRequired: false,
        minAdvanceNotice: 0,
        maxConsecutiveDays: 5,
        blackoutDates: [],
        documentationRequired: true,
        autoApprovalEnabled: true,
        autoApprovalConditions: {
          minDaysRequested: 1,
          maxDaysRequested: 3,
          excludePeakSeasons: false
        },
        isActive: true,
        createdAt: new Date(),
        updatedBy: 'system'
      },
      {
        id: 'personal_policy',
        name: 'Personal Leave',
        type: 'personal',
        accrualType: 'annual',
        accrualRate: 3,
        maxAccrual: 6,
        prorationEnabled: true,
        waitingPeriod: 180,
        carryOverEnabled: false,
        carryOverLimit: 0,
        carryOverExpiry: 0,
        approvalRequired: true,
        minAdvanceNotice: 3,
        maxConsecutiveDays: 2,
        blackoutDates: [],
        documentationRequired: false,
        autoApprovalEnabled: false,
        autoApprovalConditions: {
          minDaysRequested: 1,
          maxDaysRequested: 1,
          excludePeakSeasons: false
        },
        isActive: true,
        createdAt: new Date(),
        updatedBy: 'system'
      }
    ];

    defaultPolicies.forEach(policy => {
      this.policies.set(policy.id, policy);
    });
  }

  /**
   * Request time off
   */
  async requestTimeOff(
    employeeId: string,
    requestData: {
      policyId: string;
      startDate: Date;
      endDate: Date;
      reason?: string;
      attachments?: Array<{
        name: string;
        url: string;
        type: string;
      }>;
      emergencyContact?: boolean;
      recurrencePattern?: {
        frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
        interval: number;
        endDate?: Date;
        occurrences?: number;
      };
    },
    requestedBy: string
  ): Promise<TimeOffRequest> {
    try {
      const policy = this.policies.get(requestData.policyId);
      if (!policy) {
        throw new Error('Time-off policy not found');
      }

      const employee = await Employee.findOne({ employeeId, isDeleted: false });
      if (!employee) {
        throw new Error('Employee not found');
      }

      // Calculate days requested
      const days = this.calculateBusinessDays(requestData.startDate, requestData.endDate);

      // Validate request
      await this.validateTimeOffRequest(employeeId, requestData, policy);

      // Check balance
      const balance = await this.getAvailableBalance(employeeId, policy.type);
      if (balance < days) {
        throw new Error(`Insufficient balance. Available: ${balance} days, Requested: ${days} days`);
      }

      // Check blackout dates
      const blackoutConflict = await this.checkBlackoutDates(requestData.startDate, requestData.endDate, policy);
      if (blackoutConflict) {
        throw new Error(`Request conflicts with blackout period: ${blackoutConflict.reason}`);
      }

      // Check for overlapping requests
      const overlappingRequest = await this.checkOverlappingRequests(employeeId, requestData.startDate, requestData.endDate);
      if (overlappingRequest) {
        throw new Error('Overlapping time-off request exists');
      }

      // Create request
      const request: TimeOffRequest = {
        id: new Date().getTime().toString(),
        employeeId,
        policyId: requestData.policyId,
        type: policy.type,
        startDate: requestData.startDate,
        endDate: requestData.endDate,
        days,
        reason: requestData.reason,
        status: 'pending',
        requestedAt: new Date(),
        requestedBy,
        approvers: await this.generateApprovers(employee, policy),
        attachments: requestData.attachments?.map(att => ({
          id: new Date().getTime().toString() + '_' + Math.random(),
          ...att,
          uploadedAt: new Date()
        })) || [],
        isPaidTimeOff: policy.type !== 'unpaid',
        emergencyContact: requestData.emergencyContact || false,
        recurrencePattern: requestData.recurrencePattern,
        workflowHistory: [{
          action: 'created',
          performedBy: requestedBy,
          performedAt: new Date(),
          comments: 'Time-off request created'
        }],
        autoApproved: false,
        balanceBefore: balance,
        balanceAfter: balance - days,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Check for auto-approval
      if (policy.autoApprovalEnabled) {
        const canAutoApprove = await this.canAutoApproveRequest(request, policy);
        if (canAutoApprove) {
          request.status = 'approved';
          request.autoApproved = true;
          request.autoApprovalReason = 'Meets auto-approval criteria';
          request.approvers.forEach(approver => {
            approver.status = 'approved';
            approver.decisionAt = new Date();
          });
        }
      }

      this.requests.set(request.id, request);

      // Update balance if approved
      if (request.status === 'approved') {
        await this.updateBalance(employeeId, policy.id, -days, 'time_off_used');
      }

      // Create calendar event if approved and integration exists
      if (request.status === 'approved') {
        await this.createCalendarEvent(request);
      }

      // Emit events
      this.emit('timeOffRequested', request);
      if (request.autoApproved) {
        this.emit('timeOffAutoApproved', request);
      }

      return request;
    } catch (error) {
      throw new Error(`Failed to request time off: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Approve time-off request
   */
  async approveTimeOff(
    requestId: string,
    approverId: string,
    comments?: string
  ): Promise<TimeOffRequest> {
    try {
      const request = this.requests.get(requestId);
      if (!request) {
        throw new Error('Time-off request not found');
      }

      if (request.status !== 'pending') {
        throw new Error('Request is not in pending status');
      }

      // Find approver in the approval chain
      const approver = request.approvers.find(a => a.approverId === approverId);
      if (!approver) {
        throw new Error('Approver not found in approval chain');
      }

      if (approver.status !== 'pending') {
        throw new Error('Approver has already made a decision');
      }

      // Update approver decision
      approver.status = 'approved';
      approver.decisionAt = new Date();
      approver.comments = comments;

      // Add to workflow history
      request.workflowHistory.push({
        action: 'approved',
        performedBy: approverId,
        performedAt: new Date(),
        comments: comments || 'Approved'
      });

      // Check if all required approvals are received
      const allApproved = request.approvers.every(a => a.status === 'approved');
      if (allApproved) {
        request.status = 'approved';
        await this.updateBalance(request.employeeId, request.policyId, -request.days, 'time_off_used');
        await this.createCalendarEvent(request);
      }

      request.updatedAt = new Date();
      this.requests.set(requestId, request);

      // Emit events
      this.emit('timeOffApproved', request);
      if (allApproved) {
        this.emit('timeOffFullyApproved', request);
      }

      return request;
    } catch (error) {
      throw new Error(`Failed to approve time off: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Reject time-off request
   */
  async rejectTimeOff(
    requestId: string,
    approverId: string,
    reason: string
  ): Promise<TimeOffRequest> {
    try {
      const request = this.requests.get(requestId);
      if (!request) {
        throw new Error('Time-off request not found');
      }

      if (request.status !== 'pending') {
        throw new Error('Request is not in pending status');
      }

      // Find approver in the approval chain
      const approver = request.approvers.find(a => a.approverId === approverId);
      if (!approver) {
        throw new Error('Approver not found in approval chain');
      }

      // Update approver decision
      approver.status = 'rejected';
      approver.decisionAt = new Date();
      approver.comments = reason;

      // Add to workflow history
      request.workflowHistory.push({
        action: 'rejected',
        performedBy: approverId,
        performedAt: new Date(),
        comments: reason
      });

      // Update request status
      request.status = 'rejected';
      request.updatedAt = new Date();
      this.requests.set(requestId, request);

      // Emit event
      this.emit('timeOffRejected', request);

      return request;
    } catch (error) {
      throw new Error(`Failed to reject time off: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate accruals for employee
   */
  async calculateAccruals(
    employeeId: string,
    dateRange: { startDate: Date; endDate: Date }
  ): Promise<AccrualResult[]> {
    try {
      const employee = await Employee.findOne({ employeeId, isDeleted: false });
      if (!employee) {
        throw new Error('Employee not found');
      }

      const results: AccrualResult[] = [];

      for (const policy of Array.from(this.policies.values())) {
        if (!policy.isActive) continue;

        const result = await this.calculatePolicyAccruals(employee, policy, dateRange);
        results.push(result);
      }

      return results;
    } catch (error) {
      throw new Error(`Failed to calculate accruals: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate policy-specific accruals
   */
  private async calculatePolicyAccruals(
    employee: IEmployee,
    policy: TimeOffPolicy,
    dateRange: { startDate: Date; endDate: Date }
  ): Promise<AccrualResult> {
    const balance = await this.getBalance(employee.employeeId, policy.id);
    const accrualSchedule: Array<{
      date: Date;
      amount: number;
      balance: number;
    }> = [];

    let currentBalance = balance.currentBalance;
    let totalAccrued = 0;
    let totalUsed = balance.usedThisYear;

    // Calculate accruals for the period
    const currentDate = new Date(dateRange.startDate);
    while (currentDate <= dateRange.endDate) {
      if (this.shouldAccrueOnDate(currentDate, policy, employee)) {
        const accrualAmount = this.calculateAccrualAmount(currentDate, policy, employee);
        currentBalance += accrualAmount;
        totalAccrued += accrualAmount;

        accrualSchedule.push({
          date: new Date(currentDate),
          amount: accrualAmount,
          balance: currentBalance
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Check for warnings
    const warnings: Array<{
      type: 'low_balance' | 'max_balance' | 'expiry_warning' | 'blackout_date';
      message: string;
      severity: 'info' | 'warning' | 'error';
    }> = [];

    if (currentBalance < 2) {
      warnings.push({
        type: 'low_balance',
        message: `Low balance warning: ${currentBalance.toFixed(1)} days remaining`,
        severity: 'warning'
      });
    }

    if (currentBalance >= policy.maxAccrual * 0.9) {
      warnings.push({
        type: 'max_balance',
        message: `Approaching maximum accrual limit: ${currentBalance.toFixed(1)} / ${policy.maxAccrual} days`,
        severity: 'info'
      });
    }

    // Check for expiring carried over days
    const carriedOverDays = balance.carriedOver;
    if (carriedOverDays > 0) {
      const expiryDate = new Date(employee.employment.hireDate);
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      expiryDate.setDate(expiryDate.getDate() + policy.carryOverExpiry);

      if (expiryDate <= dateRange.endDate) {
        warnings.push({
          type: 'expiry_warning',
          message: `${carriedOverDays} carried over days will expire on ${expiryDate.toLocaleDateString()}`,
          severity: 'warning'
        });
      }
    }

    return {
      employeeId: employee.employeeId,
      policyId: policy.id,
      totalAccrued,
      totalUsed,
      currentBalance,
      projectedBalance: dateRange.endDate,
      accrualSchedule,
      warnings
    };
  }

  /**
   * Get available balance for employee
   */
  async getAvailableBalance(employeeId: string, timeOffType: string): Promise<number> {
    try {
      const policy = Array.from(this.policies.values()).find(p => p.type === timeOffType);
      if (!policy) {
        throw new Error('Policy not found for time-off type');
      }

      const balance = await this.getBalance(employeeId, policy.id);
      return balance.currentBalance;
    } catch (error) {
      throw new Error(`Failed to get available balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get balance for employee and policy
   */
  private async getBalance(employeeId: string, policyId: string): Promise<TimeOffBalance> {
    const employeeBalances = this.balances.get(employeeId) || [];
    let balance = employeeBalances.find(b => b.policyId === policyId);

    if (!balance) {
      // Create initial balance
      balance = {
        employeeId,
        policyId,
        policyName: this.policies.get(policyId)?.name || 'Unknown',
        type: this.policies.get(policyId)?.type || 'unknown',
        currentBalance: 0,
        accruedThisYear: 0,
        usedThisYear: 0,
        carriedOver: 0,
        pendingApproval: 0,
        scheduledFuture: 0,
        accrualHistory: [],
        isActive: true,
        updatedAt: new Date()
      };

      employeeBalances.push(balance);
      this.balances.set(employeeId, employeeBalances);
    }

    return balance;
  }

  /**
   * Update balance
   */
  private async updateBalance(
    employeeId: string,
    policyId: string,
    amount: number,
    reason: string
  ): Promise<void> {
    const balance = await this.getBalance(employeeId, policyId);
    balance.currentBalance += amount;
    balance.updatedAt = new Date();

    if (amount > 0) {
      balance.accruedThisYear += amount;
    } else {
      balance.usedThisYear += Math.abs(amount);
    }

    balance.accrualHistory.push({
      date: new Date(),
      amount,
      reason,
      type: amount > 0 ? 'accrual' : 'adjustment'
    });

    // Update the balances map
    const employeeBalances = this.balances.get(employeeId) || [];
    const index = employeeBalances.findIndex(b => b.policyId === policyId);
    if (index >= 0) {
      employeeBalances[index] = balance;
    } else {
      employeeBalances.push(balance);
    }
    this.balances.set(employeeId, employeeBalances);

    this.emit('balanceUpdated', { employeeId, policyId, amount, reason });
  }

  /**
   * Check blackout dates
   */
  async checkBlackoutDates(
    startDate: Date,
    endDate: Date,
    policy?: TimeOffPolicy
  ): Promise<{ reason: string; startDate: Date; endDate: Date } | null> {
    const policiesToCheck = policy ? [policy] : Array.from(this.policies.values());

    for (const p of policiesToCheck) {
      for (const blackout of p.blackoutDates) {
        if (this.dateRangesOverlap(startDate, endDate, blackout.startDate, blackout.endDate)) {
          return {
            reason: blackout.reason,
            startDate: blackout.startDate,
            endDate: blackout.endDate
          };
        }
      }
    }

    return null;
  }

  /**
   * Validate time-off request
   */
  private async validateTimeOffRequest(
    employeeId: string,
    requestData: any,
    policy: TimeOffPolicy
  ): Promise<void> {
    // Check advance notice
    const advanceNotice = Math.ceil((requestData.startDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (advanceNotice < policy.minAdvanceNotice) {
      throw new Error(`Minimum advance notice of ${policy.minAdvanceNotice} days required`);
    }

    // Check maximum consecutive days
    const days = this.calculateBusinessDays(requestData.startDate, requestData.endDate);
    if (days > policy.maxConsecutiveDays) {
      throw new Error(`Maximum consecutive days is ${policy.maxConsecutiveDays}`);
    }

    // Check waiting period
    const employee = await Employee.findOne({ employeeId, isDeleted: false });
    if (employee) {
      const daysSinceHire = Math.ceil((Date.now() - employee.employment.hireDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceHire < policy.waitingPeriod) {
        throw new Error(`Waiting period of ${policy.waitingPeriod} days not met`);
      }
    }

    // Check documentation requirements
    if (policy.documentationRequired && (!requestData.attachments || requestData.attachments.length === 0)) {
      throw new Error('Documentation is required for this type of time-off request');
    }
  }

  /**
   * Generate approval chain
   */
  private async generateApprovers(
    employee: IEmployee,
    policy: TimeOffPolicy
  ): Promise<Array<{
    approverId: string;
    approverName: string;
    approverRole: string;
    status: 'pending' | 'approved' | 'rejected';
    escalationLevel: number;
  }>> {
    const approvers: Array<{
      approverId: string;
      approverName: string;
      approverRole: string;
      status: 'pending' | 'approved' | 'rejected';
      escalationLevel: number;
    }> = [];

    // Add direct manager as first approver if approval is required
    if (policy.approvalRequired && employee.employment.reportingManager) {
      const manager = await Employee.findOne({ 
        employeeId: employee.employment.reportingManager, 
        isDeleted: false 
      });
      
      if (manager) {
        approvers.push({
          approverId: manager.employeeId,
          approverName: `${manager.firstName} ${manager.lastName}`,
          approverRole: 'Direct Manager',
          status: 'pending',
          escalationLevel: 1
        });
      }
    }

    // Add HR approver for certain types or longer durations
    if (policy.type === 'maternity' || policy.type === 'paternity') {
      approvers.push({
        approverId: 'hr_department',
        approverName: 'HR Department',
        approverRole: 'HR Representative',
        status: 'pending',
        escalationLevel: 2
      });
    }

    // If no approvers are required, add a system approver
    if (approvers.length === 0) {
      approvers.push({
        approverId: 'system',
        approverName: 'System',
        approverRole: 'Auto-approval',
        status: 'pending',
        escalationLevel: 0
      });
    }

    return approvers;
  }

  /**
   * Check for overlapping requests
   */
  private async checkOverlappingRequests(
    employeeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<TimeOffRequest | null> {
    const employeeRequests = Array.from(this.requests.values()).filter(
      r => r.employeeId === employeeId && 
           r.status !== 'rejected' && 
           r.status !== 'cancelled'
    );

    for (const request of employeeRequests) {
      if (this.dateRangesOverlap(startDate, endDate, request.startDate, request.endDate)) {
        return request;
      }
    }

    return null;
  }

  /**
   * Check if request can be auto-approved
   */
  private async canAutoApproveRequest(
    request: TimeOffRequest,
    policy: TimeOffPolicy
  ): Promise<boolean> {
    if (!policy.autoApprovalEnabled) return false;

    const conditions = policy.autoApprovalConditions;

    // Check day range
    if (request.days < conditions.minDaysRequested || request.days > conditions.maxDaysRequested) {
      return false;
    }

    // Check peak seasons (if enabled)
    if (conditions.excludePeakSeasons) {
      const month = request.startDate.getMonth();
      const peakSeasons = [11, 0, 6, 7]; // December, January, July, August
      if (peakSeasons.includes(month)) {
        return false;
      }
    }

    // Check if documentation is required and provided
    if (policy.documentationRequired && request.attachments.length === 0) {
      return false;
    }

    return true;
  }

  /**
   * Create calendar event
   */
  private async createCalendarEvent(request: TimeOffRequest): Promise<void> {
    const integration = this.calendarIntegrations.get(request.employeeId);
    if (!integration || !integration.isActive || !integration.syncSettings.createEventsForApproved) {
      return;
    }

    // This would integrate with Google Calendar, Outlook, etc.
    // For now, just emit an event
    this.emit('calendarEventCreated', { request, integration });
  }

  /**
   * Calculate business days between two dates
   */
  private calculateBusinessDays(startDate: Date, endDate: Date): number {
    let days = 0;
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Saturday or Sunday
        days++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  }

  /**
   * Check if date ranges overlap
   */
  private dateRangesOverlap(
    start1: Date,
    end1: Date,
    start2: Date,
    end2: Date
  ): boolean {
    return start1 <= end2 && start2 <= end1;
  }

  /**
   * Check if employee should accrue on specific date
   */
  private shouldAccrueOnDate(date: Date, policy: TimeOffPolicy, employee: IEmployee): boolean {
    if (policy.accrualType === 'none') return false;

    // Check waiting period
    const daysSinceHire = Math.ceil((date.getTime() - employee.employment.hireDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceHire < policy.waitingPeriod) return false;

    switch (policy.accrualType) {
      case 'monthly':
        return date.getDate() === this.getPaydayDate(employee);
      case 'biweekly':
        return this.isBiweeklyPayday(date, employee);
      case 'annual':
        return date.getMonth() === 0 && date.getDate() === 1; // January 1st
      case 'per_hour':
        return true; // Would be calculated based on hours worked
      default:
        return false;
    }
  }

  /**
   * Calculate accrual amount for specific date
   */
  private calculateAccrualAmount(date: Date, policy: TimeOffPolicy, employee: IEmployee): number {
    let amount = policy.accrualRate;

    // Apply proration if enabled
    if (policy.prorationEnabled) {
      const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
      const workedDays = this.calculateWorkedDaysInMonth(date, employee);
      amount = (amount * workedDays) / daysInMonth;
    }

    // Check maximum accrual
    const balance = this.getBalance(employee.employeeId, policy.id);
    if (balance.currentBalance + amount > policy.maxAccrual) {
      amount = policy.maxAccrual - balance.currentBalance;
    }

    return Math.max(0, amount);
  }

  /**
   * Get payday date for employee
   */
  private getPaydayDate(employee: IEmployee): number {
    // Default to 1st of month, could be customized per employee
    return 1;
  }

  /**
   * Check if date is biweekly payday
   */
  private isBiweeklyPayday(date: Date, employee: IEmployee): boolean {
    // Simplified logic - would need to track actual pay periods
    return date.getDate() === 1 || date.getDate() === 15;
  }

  /**
   * Calculate worked days in month
   */
  private calculateWorkedDaysInMonth(date: Date, employee: IEmployee): number {
    const schedule = employee.employment.workSchedule;
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    
    let workedDays = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(date.getFullYear(), date.getMonth(), day);
      const dayOfWeek = currentDate.getDay();
      
      if (schedule.days.includes(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek])) {
        workedDays++;
      }
    }
    
    return workedDays;
  }

  /**
   * Get time-off requests
   */
  getTimeOffRequests(options: {
    employeeId?: string;
    status?: string;
    type?: string;
    startDate?: Date;
    endDate?: Date;
  } = {}): TimeOffRequest[] {
    let requests = Array.from(this.requests.values());

    if (options.employeeId) {
      requests = requests.filter(r => r.employeeId === options.employeeId);
    }

    if (options.status) {
      requests = requests.filter(r => r.status === options.status);
    }

    if (options.type) {
      requests = requests.filter(r => r.type === options.type);
    }

    if (options.startDate) {
      requests = requests.filter(r => r.startDate >= options.startDate!);
    }

    if (options.endDate) {
      requests = requests.filter(r => r.endDate <= options.endDate!);
    }

    return requests.sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());
  }

  /**
   * Get policies
   */
  getPolicies(): TimeOffPolicy[] {
    return Array.from(this.policies.values());
  }

  /**
   * Get employee balances
   */
  getEmployeeBalances(employeeId: string): TimeOffBalance[] {
    return this.balances.get(employeeId) || [];
  }

  /**
   * Add calendar integration
   */
  addCalendarIntegration(employeeId: string, integration: Omit<CalendarIntegration, 'syncErrors'>): void {
    const fullIntegration: CalendarIntegration = {
      ...integration,
      syncErrors: []
    };
    this.calendarIntegrations.set(employeeId, fullIntegration);
    this.emit('calendarIntegrationAdded', { employeeId, integration: fullIntegration });
  }

  /**
   * Get time-off analytics
   */
  async getTimeOffAnalytics(dateFrom?: Date, dateTo?: Date): Promise<{
    totalRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    pendingRequests: number;
    averageDaysPerRequest: number;
    totalDaysTaken: number;
    policyBreakdown: any;
    departmentBreakdown: any;
    monthlyTrends: any;
  }> {
    const requests = this.getTimeOffRequests({ startDate: dateFrom, endDate: dateTo });

    const totalRequests = requests.length;
    const approvedRequests = requests.filter(r => r.status === 'approved').length;
    const rejectedRequests = requests.filter(r => r.status === 'rejected').length;
    const pendingRequests = requests.filter(r => r.status === 'pending').length;

    const averageDaysPerRequest = totalRequests > 0 ? 
      requests.reduce((sum, r) => sum + r.days, 0) / totalRequests : 0;

    const totalDaysTaken = requests
      .filter(r => r.status === 'approved')
      .reduce((sum, r) => sum + r.days, 0);

    // Policy breakdown
    const policyBreakdown: any = {};
    requests.forEach(request => {
      if (!policyBreakdown[request.type]) {
        policyBreakdown[request.type] = {
          requests: 0,
          approved: 0,
          days: 0
        };
      }
      policyBreakdown[request.type].requests++;
      if (request.status === 'approved') {
        policyBreakdown[request.type].approved++;
        policyBreakdown[request.type].days += request.days;
      }
    });

    return {
      totalRequests,
      approvedRequests,
      rejectedRequests,
      pendingRequests,
      averageDaysPerRequest,
      totalDaysTaken,
      policyBreakdown,
      departmentBreakdown: {}, // Would need employee data
      monthlyTrends: {} // Would need date grouping
    };
  }
}

export const timeOffService = new TimeOffService();
export default timeOffService;
