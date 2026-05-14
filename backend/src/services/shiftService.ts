import { Employee, IEmployee } from '../models/Employee';
import mongoose from 'mongoose';
import { EventEmitter } from 'events';

export interface ShiftTemplate {
  id: string;
  name: string;
  description: string;
  type: 'morning' | 'evening' | 'night' | 'flexible' | 'split';
  startTime: string;
  endTime: string;
  breakDuration: number; // minutes
  daysOfWeek: string[];
  department: string;
  positions: string[];
  requiredSkills: string[];
  maxEmployees: number;
  minEmployees: number;
  isActive: boolean;
  color: string;
  priority: number;
}

export interface Shift {
  id: string;
  templateId?: string;
  name: string;
  date: Date;
  startTime: string;
  endTime: string;
  breakDuration: number;
  department: string;
  location: string;
  position: string;
  assignedEmployees: Array<{
    employeeId: string;
    employeeName: string;
    role: 'primary' | 'backup' | 'trainee';
    status: 'scheduled' | 'confirmed' | 'clocked_in' | 'clocked_out' | 'absent';
    clockInTime?: Date;
    clockOutTime?: Date;
    actualHours?: number;
    notes?: string;
  }>;
  status: 'draft' | 'published' | 'in_progress' | 'completed' | 'cancelled';
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
  publishedAt?: Date;
  notes?: string;
  specialRequirements?: string[];
  overtimeAllowed: boolean;
  isPremiumShift: boolean;
  premiumRate?: number;
}

export interface ShiftSwapRequest {
  id: string;
  originalShiftId: string;
  requestingEmployeeId: string;
  targetEmployeeId?: string;
  reason: string;
  swapType: 'swap' | 'drop' | 'pickup';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  requestedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
  proposedNewTime?: {
    startTime: string;
    endTime: string;
  };
  autoApprovalEnabled: boolean;
}

export interface TimeOffRequest {
  id: string;
  employeeId: string;
  type: 'vacation' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'bereavement' | 'unpaid' | 'other';
  startDate: Date;
  endDate: Date;
  days: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  requestedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  attachments?: string[];
  isPaidTimeOff: boolean;
  emergencyContact?: boolean;
}

export interface ScheduleConflict {
  id: string;
  type: 'double_booking' | 'understaffed' | 'skill_gap' | 'rest_period_violation' | 'overtime_limit' | 'certification_expiry';
  severity: 'low' | 'medium' | 'high' | 'critical';
  shiftId: string;
  employeeIds?: string[];
  description: string;
  suggestedResolution?: string;
  autoResolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  createdAt: Date;
}

export interface Schedule {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  department?: string;
  status: 'draft' | 'published' | 'archived';
  shifts: Shift[];
  conflicts: ScheduleConflict[];
  metrics: {
    totalShifts: number;
    totalHours: number;
    totalCost: number;
    coveragePercentage: number;
    overtimeHours: number;
    unfilledShifts: number;
  };
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
  publishedAt?: Date;
  version: number;
}

export interface Holiday {
  id: string;
  name: string;
  date: Date;
  type: 'national' | 'state' | 'company' | 'religious';
  isPaid: boolean;
  affectsDepartments: string[];
  specialRules?: {
    premiumRate?: number;
    minStaffing?: number;
    requiredPositions?: string[];
  };
  recurring: {
    isRecurring: boolean;
    frequency?: 'annually' | 'monthly' | 'weekly';
    endDate?: Date;
  };
  createdAt: Date;
  updatedBy: string;
}

class ShiftService extends EventEmitter {
  private shiftTemplates: Map<string, ShiftTemplate> = new Map();
  private shifts: Map<string, Shift> = new Map();
  private schedules: Map<string, Schedule> = new Map();
  private swapRequests: Map<string, ShiftSwapRequest> = new Map();
  private timeOffRequests: Map<string, TimeOffRequest> = new Map();
  private holidays: Map<string, Holiday> = new Map();

  constructor() {
    super();
    this.initializeDefaultTemplates();
    this.initializeDefaultHolidays();
  }

  /**
   * Initialize default shift templates
   */
  private initializeDefaultTemplates(): void {
    const defaultTemplates: ShiftTemplate[] = [
      {
        id: 'morning_shift',
        name: 'Morning Shift',
        description: 'Standard morning shift',
        type: 'morning',
        startTime: '06:00',
        endTime: '14:00',
        breakDuration: 30,
        daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        department: 'all',
        positions: [],
        requiredSkills: [],
        maxEmployees: 10,
        minEmployees: 2,
        isActive: true,
        color: '#FFD700',
        priority: 1
      },
      {
        id: 'evening_shift',
        name: 'Evening Shift',
        description: 'Standard evening shift',
        type: 'evening',
        startTime: '14:00',
        endTime: '22:00',
        breakDuration: 30,
        daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        department: 'all',
        positions: [],
        requiredSkills: [],
        maxEmployees: 10,
        minEmployees: 2,
        isActive: true,
        color: '#FF6B6B',
        priority: 1
      },
      {
        id: 'night_shift',
        name: 'Night Shift',
        description: 'Overnight shift',
        type: 'night',
        startTime: '22:00',
        endTime: '06:00',
        breakDuration: 45,
        daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        department: 'all',
        positions: [],
        requiredSkills: [],
        maxEmployees: 8,
        minEmployees: 1,
        isActive: true,
        color: '#4ECDC4',
        priority: 2
      },
      {
        id: 'weekend_shift',
        name: 'Weekend Shift',
        description: 'Weekend shift with premium pay',
        type: 'flexible',
        startTime: '08:00',
        endTime: '16:00',
        breakDuration: 30,
        daysOfWeek: ['Saturday', 'Sunday'],
        department: 'all',
        positions: [],
        requiredSkills: [],
        maxEmployees: 6,
        minEmployees: 2,
        isActive: true,
        color: '#95E1D3',
        priority: 2
      }
    ];

    defaultTemplates.forEach(template => {
      this.shiftTemplates.set(template.id, template);
    });
  }

  /**
   * Initialize default holidays
   */
  private initializeDefaultHolidays(): void {
    const currentYear = new Date().getFullYear();
    const defaultHolidays: Holiday[] = [
      {
        id: 'new_year',
        name: 'New Year\'s Day',
        date: new Date(currentYear, 0, 1),
        type: 'national',
        isPaid: true,
        affectsDepartments: ['all'],
        recurring: { isRecurring: true, frequency: 'annually' },
        createdAt: new Date(),
        updatedBy: 'system'
      },
      {
        id: 'independence_day',
        name: 'Independence Day',
        date: new Date(currentYear, 6, 4),
        type: 'national',
        isPaid: true,
        affectsDepartments: ['all'],
        recurring: { isRecurring: true, frequency: 'annually' },
        createdAt: new Date(),
        updatedBy: 'system'
      },
      {
        id: 'christmas',
        name: 'Christmas Day',
        date: new Date(currentYear, 11, 25),
        type: 'national',
        isPaid: true,
        affectsDepartments: ['all'],
        recurring: { isRecurring: true, frequency: 'annually' },
        createdAt: new Date(),
        updatedBy: 'system'
      }
    ];

    defaultHolidays.forEach(holiday => {
      this.holidays.set(holiday.id, holiday);
    });
  }

  /**
   * Create shift template
   */
  async createShiftTemplate(templateData: Omit<ShiftTemplate, 'id'>): Promise<ShiftTemplate> {
    const template: ShiftTemplate = {
      ...templateData,
      id: new Date().getTime().toString()
    };

    this.shiftTemplates.set(template.id, template);
    this.emit('shiftTemplateCreated', template);

    return template;
  }

  /**
   * Create shift
   */
  async createShift(shiftData: Omit<Shift, 'id' | 'createdAt' | 'updatedAt'>): Promise<Shift> {
    const shift: Shift = {
      ...shiftData,
      id: new Date().getTime().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.shifts.set(shift.id, shift);
    this.emit('shiftCreated', shift);

    return shift;
  }

  /**
   * Generate schedule using AI optimization
   */
  async generateSchedule(
    startDate: Date,
    endDate: Date,
    options: {
      department?: string;
      positions?: string[];
      employeeIds?: string[];
      prioritizeEmployeePreferences?: boolean;
      minimizeOvertime?: boolean;
      ensureFairDistribution?: boolean;
      considerSkillRequirements?: boolean;
    } = {}
  ): Promise<{
    schedule: Schedule;
    conflicts: ScheduleConflict[];
    optimizationScore: number;
  }> {
    try {
      const scheduleId = new Date().getTime().toString();
      const shifts: Shift[] = [];
      const conflicts: ScheduleConflict[] = [];

      // Get available employees
      const employees = await this.getAvailableEmployeesForPeriod(startDate, endDate, options);
      
      // Get time off requests for the period
      const timeOffRequests = await this.getTimeOffRequestsForPeriod(startDate, endDate);
      
      // Get holidays in the period
      const holidays = this.getHolidaysInPeriod(startDate, endDate);

      // Generate shifts for each day
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dayOfWeek = this.getDayOfWeek(currentDate);
        const isHoliday = this.isHoliday(currentDate, holidays);

        // Generate shifts for each template
        for (const template of Array.from(this.shiftTemplates.values())) {
          if (!template.isActive) continue;
          if (!template.daysOfWeek.includes(dayOfWeek)) continue;
          if (options.department && template.department !== 'all' && template.department !== options.department) continue;

          // Create shift
          const shift: Shift = {
            id: new Date().getTime().toString() + '_' + currentDate.getTime(),
            templateId: template.id,
            name: `${template.name} - ${currentDate.toLocaleDateString()}`,
            date: new Date(currentDate),
            startTime: template.startTime,
            endTime: template.endTime,
            breakDuration: template.breakDuration,
            department: template.department,
            location: 'Main Location',
            position: template.positions[0] || 'General',
            assignedEmployees: [],
            status: 'draft',
            createdBy: 'system',
            createdAt: new Date(),
            updatedBy: 'system',
            updatedAt: new Date(),
            overtimeAllowed: true,
            isPremiumShift: isHoliday,
            premiumRate: isHoliday ? 1.5 : undefined
          };

          // Assign employees using AI optimization
          const assignedEmployees = await this.optimizeEmployeeAssignment(
            shift,
            employees,
            timeOffRequests,
            options
          );

          shift.assignedEmployees = assignedEmployees;

          // Check for conflicts
          const shiftConflicts = await this.detectShiftConflicts(shift, employees);
          conflicts.push(...shiftConflicts);

          shifts.push(shift);
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Calculate schedule metrics
      const metrics = this.calculateScheduleMetrics(shifts);

      const schedule: Schedule = {
        id: scheduleId,
        name: `Auto-generated Schedule ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
        description: 'AI-optimized schedule',
        startDate,
        endDate,
        department: options.department,
        status: 'draft',
        shifts,
        conflicts,
        metrics,
        createdBy: 'system',
        createdAt: new Date(),
        updatedBy: 'system',
        updatedAt: new Date(),
        version: 1
      };

      this.schedules.set(scheduleId, schedule);

      // Calculate optimization score
      const optimizationScore = this.calculateOptimizationScore(schedule, conflicts);

      this.emit('scheduleGenerated', { schedule, conflicts, optimizationScore });

      return {
        schedule,
        conflicts,
        optimizationScore
      };
    } catch (error) {
      throw new Error(`Failed to generate schedule: ${error.message}`);
    }
  }

  /**
   * Get available employees for period
   */
  private async getAvailableEmployeesForPeriod(
    startDate: Date,
    endDate: Date,
    options: any
  ): Promise<IEmployee[]> {
    const query: any = {
      isActive: true,
      isDeleted: false,
      'employment.employmentStatus': 'active'
    };

    if (options.department) {
      query['employment.department'] = options.department;
    }

    if (options.positions && options.positions.length > 0) {
      query['employment.position'] = { $in: options.positions };
    }

    if (options.employeeIds && options.employeeIds.length > 0) {
      query.employeeId = { $in: options.employeeIds };
    }

    return await Employee.find(query);
  }

  /**
   * Get time off requests for period
   */
  private async getTimeOffRequestsForPeriod(startDate: Date, endDate: Date): Promise<TimeOffRequest[]> {
    // In a real implementation, this would query the database
    // For now, return empty array
    return [];
  }

  /**
   * Get holidays in period
   */
  private getHolidaysInPeriod(startDate: Date, endDate: Date): Holiday[] {
    return Array.from(this.holidays.values()).filter(holiday => 
      holiday.date >= startDate && holiday.date <= endDate
    );
  }

  /**
   * Get day of week
   */
  private getDayOfWeek(date: Date): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }

  /**
   * Check if date is holiday
   */
  private isHoliday(date: Date, holidays: Holiday[]): boolean {
    return holidays.some(holiday => 
      holiday.date.toDateString() === date.toDateString()
    );
  }

  /**
   * Optimize employee assignment using AI
   */
  private async optimizeEmployeeAssignment(
    shift: Shift,
    employees: IEmployee[],
    timeOffRequests: TimeOffRequest[],
    options: any
  ): Promise<Array<{
    employeeId: string;
    employeeName: string;
    role: 'primary' | 'backup' | 'trainee';
    status: 'scheduled';
  }>> {
    const assignedEmployees: Array<{
      employeeId: string;
      employeeName: string;
      role: 'primary' | 'backup' | 'trainee';
      status: 'scheduled';
    }> = [];

    // Filter available employees
    const availableEmployees = employees.filter(employee => {
      // Check if employee is on time off
      const isOnTimeOff = timeOffRequests.some(request =>
        request.employeeId === employee.employeeId &&
        request.status === 'approved' &&
        shift.date >= request.startDate &&
        shift.date <= request.endDate
      );

      if (isOnTimeOff) return false;

      // Check if employee has required skills
      const template = this.shiftTemplates.get(shift.templateId || '');
      if (template && template.requiredSkills.length > 0) {
        const hasRequiredSkills = template.requiredSkills.every(skill =>
          employee.skills.some(empSkill => empSkill.name.toLowerCase() === skill.toLowerCase())
        );
        if (!hasRequiredSkills) return false;
      }

      // Check if employee works in the right department
      if (shift.department !== 'all' && employee.employment.department !== shift.department) {
        return false;
      }

      return true;
    });

    // Sort employees by preference and availability
    const sortedEmployees = availableEmployees.sort((a, b) => {
      // Prioritize employees with preferred work schedules
      const aPrefers = this.prefersShiftTime(a, shift);
      const bPrefers = this.prefersShiftTime(b, shift);
      
      if (aPrefers !== bPrefers) {
        return bPrefers ? 1 : -1;
      }

      // Then by skill level
      const aSkillLevel = this.calculateSkillLevel(a, shift);
      const bSkillLevel = this.calculateSkillLevel(b, shift);
      
      return bSkillLevel - aSkillLevel;
    });

    // Assign employees to shift
    const template = this.shiftTemplates.get(shift.templateId || '');
    const maxEmployees = template?.maxEmployees || 5;
    const minEmployees = template?.minEmployees || 1;

    const employeesToAssign = Math.min(maxEmployees, sortedEmployees.length, minEmployees + 2);

    for (let i = 0; i < employeesToAssign; i++) {
      const employee = sortedEmployees[i];
      let role: 'primary' | 'backup' | 'trainee' = 'primary';
      
      if (i >= minEmployees) {
        role = 'backup';
      }

      if (employee.employment.contractType === 'intern' || employee.employment.contractType === 'seasonal') {
        role = 'trainee';
      }

      assignedEmployees.push({
        employeeId: employee.employeeId,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        role,
        status: 'scheduled'
      });
    }

    return assignedEmployees;
  }

  /**
   * Check if employee prefers shift time
   */
  private prefersShiftTime(employee: IEmployee, shift: Shift): boolean {
    const schedule = employee.employment.workSchedule;
    
    if (schedule.type === 'flexible') return true;
    
    const shiftStart = this.timeToMinutes(shift.startTime);
    const shiftEnd = this.timeToMinutes(shift.endTime);
    const scheduleStart = this.timeToMinutes(schedule.hours.start);
    const scheduleEnd = this.timeToMinutes(schedule.hours.end);
    
    // Check if shift falls within employee's preferred schedule
    return shiftStart >= scheduleStart && shiftEnd <= scheduleEnd;
  }

  /**
   * Convert time string to minutes
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Calculate skill level for shift
   */
  private calculateSkillLevel(employee: IEmployee, shift: Shift): number {
    const template = this.shiftTemplates.get(shift.templateId || '');
    if (!template || template.requiredSkills.length === 0) {
      return 1; // Base level if no specific skills required
    }

    let totalSkillLevel = 0;
    let requiredSkillsCount = template.requiredSkills.length;

    for (const requiredSkill of template.requiredSkills) {
      const employeeSkill = employee.skills.find(skill => 
        skill.name.toLowerCase() === requiredSkill.toLowerCase()
      );
      
      if (employeeSkill) {
        const proficiencyLevels = {
          beginner: 1,
          intermediate: 2,
          advanced: 3,
          expert: 4
        };
        totalSkillLevel += proficiencyLevels[employeeSkill.proficiency];
      } else {
        requiredSkillsCount--; // Don't count missing skills
      }
    }

    return requiredSkillsCount > 0 ? totalSkillLevel / requiredSkillsCount : 1;
  }

  /**
   * Detect shift conflicts
   */
  private async detectShiftConflicts(
    shift: Shift,
    employees: IEmployee[]
  ): Promise<ScheduleConflict[]> {
    const conflicts: ScheduleConflict[] = [];

    // Check for understaffing
    if (shift.assignedEmployees.length < 1) {
      conflicts.push({
        id: new Date().getTime().toString() + '_understaffed',
        type: 'understaffed',
        severity: 'high',
        shiftId: shift.id,
        employeeIds: [],
        description: `Shift on ${shift.date.toLocaleDateString()} is understaffed`,
        suggestedResolution: 'Assign more employees or use backup staff',
        autoResolved: false,
        createdAt: new Date()
      });
    }

    // Check for double booking
    const employeeIds = shift.assignedEmployees.map(emp => emp.employeeId);
    for (const employeeId of employeeIds) {
      const conflictingShifts = Array.from(this.shifts.values()).filter(otherShift =>
        otherShift.id !== shift.id &&
        otherShift.date.toDateString() === shift.date.toDateString() &&
        otherShift.assignedEmployees.some(emp => emp.employeeId === employeeId) &&
        this.timeRangesOverlap(shift.startTime, shift.endTime, otherShift.startTime, otherShift.endTime)
      );

      if (conflictingShifts.length > 0) {
        conflicts.push({
          id: new Date().getTime().toString() + '_double_booking',
          type: 'double_booking',
          severity: 'critical',
          shiftId: shift.id,
          employeeIds: [employeeId],
          description: `Employee ${employeeId} is double booked`,
          suggestedResolution: 'Reassign employee to one of the conflicting shifts',
          autoResolved: false,
          createdAt: new Date()
        });
      }
    }

    // Check for rest period violations
    for (const employeeId of employeeIds) {
      const previousShift = Array.from(this.shifts.values()).find(otherShift =>
        otherShift.date.toDateString() === shift.date.toDateString() &&
        otherShift.assignedEmployees.some(emp => emp.employeeId === employeeId) &&
        this.timeToMinutes(otherShift.endTime) > this.timeToMinutes(shift.startTime) - 660 // 11 hours rest
      );

      if (previousShift) {
        conflicts.push({
          id: new Date().getTime().toString() + '_rest_period',
          type: 'rest_period_violation',
          severity: 'medium',
          shiftId: shift.id,
          employeeIds: [employeeId],
          description: `Employee ${employeeId} has insufficient rest period between shifts`,
          suggestedResolution: 'Adjust shift times or assign different employee',
          autoResolved: false,
          createdAt: new Date()
        });
      }
    }

    return conflicts;
  }

  /**
   * Check if time ranges overlap
   */
  private timeRangesOverlap(
    start1: string,
    end1: string,
    start2: string,
    end2: string
  ): boolean {
    const s1 = this.timeToMinutes(start1);
    const e1 = this.timeToMinutes(end1);
    const s2 = this.timeToMinutes(start2);
    const e2 = this.timeToMinutes(end2);

    return (s1 < e2 && s2 < e1);
  }

  /**
   * Calculate schedule metrics
   */
  private calculateScheduleMetrics(shifts: Shift[]): {
    totalShifts: number;
    totalHours: number;
    totalCost: number;
    coveragePercentage: number;
    overtimeHours: number;
    unfilledShifts: number;
  } {
    const metrics = {
      totalShifts: shifts.length,
      totalHours: 0,
      totalCost: 0,
      coveragePercentage: 0,
      overtimeHours: 0,
      unfilledShifts: 0
    };

    let totalRequiredHours = 0;
    let totalScheduledHours = 0;

    for (const shift of shifts) {
      const shiftHours = this.calculateShiftHours(shift.startTime, shift.endTime, shift.breakDuration);
      totalRequiredHours += shiftHours * 2; // Assuming minimum 2 employees per shift

      if (shift.assignedEmployees.length === 0) {
        metrics.unfilledShifts++;
      } else {
        totalScheduledHours += shiftHours * shift.assignedEmployees.length;
        metrics.totalHours += shiftHours * shift.assignedEmployees.length;
      }
    }

    metrics.coveragePercentage = totalRequiredHours > 0 ? 
      (totalScheduledHours / totalRequiredHours) * 100 : 0;

    return metrics;
  }

  /**
   * Calculate shift hours
   */
  private calculateShiftHours(startTime: string, endTime: string, breakDuration: number): number {
    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);
    
    let hours = (end - start) / 60;
    
    // Handle overnight shifts
    if (end < start) {
      hours = (24 * 60 - start + end) / 60;
    }
    
    return Math.max(0, hours - breakDuration / 60);
  }

  /**
   * Calculate optimization score
   */
  private calculateOptimizationScore(schedule: Schedule, conflicts: ScheduleConflict[]): number {
    let score = 100;
    
    // Deduct points for conflicts
    conflicts.forEach(conflict => {
      const deductions = {
        low: 5,
        medium: 10,
        high: 20,
        critical: 50
      };
      score -= deductions[conflict.severity];
    });

    // Bonus for high coverage
    if (schedule.metrics.coveragePercentage > 95) {
      score += 10;
    } else if (schedule.metrics.coveragePercentage < 80) {
      score -= 15;
    }

    // Bonus for no unfilled shifts
    if (schedule.metrics.unfilledShifts === 0) {
      score += 10;
    } else {
      score -= schedule.metrics.unfilledShifts * 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Request shift swap
   */
  async requestShiftSwap(requestData: {
    originalShiftId: string;
    requestingEmployeeId: string;
    targetEmployeeId?: string;
    reason: string;
    swapType: 'swap' | 'drop' | 'pickup';
    proposedNewTime?: {
      startTime: string;
      endTime: string;
    };
    autoApprovalEnabled?: boolean;
  }): Promise<ShiftSwapRequest> {
    const request: ShiftSwapRequest = {
      id: new Date().getTime().toString(),
      ...requestData,
      status: 'pending',
      requestedAt: new Date(),
      autoApprovalEnabled: requestData.autoApprovalEnabled || false
    };

    this.swapRequests.set(request.id, request);
    this.emit('shiftSwapRequested', request);

    // Auto-approve if enabled and conditions are met
    if (request.autoApprovalEnabled) {
      const canAutoApprove = await this.canAutoApproveSwap(request);
      if (canAutoApprove) {
        await this.approveShiftSwap(request.id, 'system');
      }
    }

    return request;
  }

  /**
   * Check if swap can be auto-approved
   */
  private async canAutoApproveSwap(request: ShiftSwapRequest): Promise<boolean> {
    // Auto-approve conditions logic
    if (request.swapType === 'drop') {
      // Check if there are enough other employees to cover
      const shift = this.shifts.get(request.originalShiftId);
      if (shift && shift.assignedEmployees.length > 2) {
        return true;
      }
    }

    return false;
  }

  /**
   * Approve shift swap
   */
  async approveShiftSwap(requestId: string, approvedBy: string): Promise<ShiftSwapRequest> {
    const request = this.swapRequests.get(requestId);
    if (!request) {
      throw new Error('Swap request not found');
    }

    request.status = 'approved';
    request.reviewedBy = approvedBy;
    request.reviewedAt = new Date();

    // Update shift assignments
    await this.processApprovedSwap(request);

    this.swapRequests.set(requestId, request);
    this.emit('shiftSwapApproved', request);

    return request;
  }

  /**
   * Process approved swap
   */
  private async processApprovedSwap(request: ShiftSwapRequest): Promise<void> {
    const shift = this.shifts.get(request.originalShiftId);
    if (!shift) return;

    if (request.swapType === 'drop') {
      // Remove employee from shift
      shift.assignedEmployees = shift.assignedEmployees.filter(
        emp => emp.employeeId !== request.requestingEmployeeId
      );
    } else if (request.swapType === 'swap' && request.targetEmployeeId) {
      // Swap employees
      const requestingEmployee = shift.assignedEmployees.find(
        emp => emp.employeeId === request.requestingEmployeeId
      );
      const targetEmployee = shift.assignedEmployees.find(
        emp => emp.employeeId === request.targetEmployeeId
      );

      if (requestingEmployee && targetEmployee) {
        // Swap roles
        const tempRole = requestingEmployee.role;
        requestingEmployee.role = targetEmployee.role;
        targetEmployee.role = tempRole;
      }
    }

    this.shifts.set(shift.id, shift);
  }

  /**
   * Get shift templates
   */
  getShiftTemplates(): ShiftTemplate[] {
    return Array.from(this.shiftTemplates.values());
  }

  /**
   * Get shifts
   */
  getShifts(options: {
    startDate?: Date;
    endDate?: Date;
    department?: string;
    employeeId?: string;
    status?: string;
  } = {}): Shift[] {
    let shifts = Array.from(this.shifts.values());

    if (options.startDate) {
      shifts = shifts.filter(shift => shift.date >= options.startDate!);
    }

    if (options.endDate) {
      shifts = shifts.filter(shift => shift.date <= options.endDate!);
    }

    if (options.department) {
      shifts = shifts.filter(shift => shift.department === options.department);
    }

    if (options.employeeId) {
      shifts = shifts.filter(shift => 
        shift.assignedEmployees.some(emp => emp.employeeId === options.employeeId)
      );
    }

    if (options.status) {
      shifts = shifts.filter(shift => shift.status === options.status);
    }

    return shifts.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * Get schedules
   */
  getSchedules(): Schedule[] {
    return Array.from(this.schedules.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get swap requests
   */
  getSwapRequests(status?: string): ShiftSwapRequest[] {
    let requests = Array.from(this.swapRequests.values());
    
    if (status) {
      requests = requests.filter(request => request.status === status);
    }

    return requests.sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());
  }

  /**
   * Get holidays
   */
  getHolidays(): Holiday[] {
    return Array.from(this.holidays.values())
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * Add holiday
   */
  addHoliday(holidayData: Omit<Holiday, 'id' | 'createdAt'>): Holiday {
    const holiday: Holiday = {
      ...holidayData,
      id: new Date().getTime().toString(),
      createdAt: new Date()
    };

    this.holidays.set(holiday.id, holiday);
    this.emit('holidayAdded', holiday);

    return holiday;
  }

  /**
   * Update shift template
   */
  updateShiftTemplate(templateId: string, updates: Partial<ShiftTemplate>): ShiftTemplate | null {
    const template = this.shiftTemplates.get(templateId);
    if (!template) return null;

    const updatedTemplate = { ...template, ...updates };
    this.shiftTemplates.set(templateId, updatedTemplate);
    this.emit('shiftTemplateUpdated', updatedTemplate);

    return updatedTemplate;
  }

  /**
   * Delete shift template
   */
  deleteShiftTemplate(templateId: string): boolean {
    const deleted = this.shiftTemplates.delete(templateId);
    if (deleted) {
      this.emit('shiftTemplateDeleted', templateId);
    }
    return deleted;
  }

  /**
   * Get shift analytics
   */
  async getShiftAnalytics(dateFrom?: Date, dateTo?: Date): Promise<{
    totalShifts: number;
    totalHours: number;
    totalEmployees: number;
    averageShiftsPerEmployee: number;
    coverageRate: number;
    overtimeRate: number;
    swapRequestRate: number;
    noShowRate: number;
    departmentBreakdown: any;
    shiftTypeBreakdown: any;
  }> {
    try {
      const shifts = this.getShifts({ startDate: dateFrom, endDate: dateTo });
      const swapRequests = this.getSwapRequests();

      const totalShifts = shifts.length;
      const totalHours = shifts.reduce((sum, shift) => {
        const hours = this.calculateShiftHours(shift.startTime, shift.endTime, shift.breakDuration);
        return sum + (hours * shift.assignedEmployees.length);
      }, 0);

      const assignedEmployees = new Set(
        shifts.flatMap(shift => shift.assignedEmployees.map(emp => emp.employeeId))
      );

      const totalEmployees = assignedEmployees.size;
      const averageShiftsPerEmployee = totalEmployees > 0 ? totalShifts / totalEmployees : 0;

      const coverageRate = shifts.filter(shift => shift.assignedEmployees.length > 0).length / totalShifts;
      const overtimeRate = shifts.filter(shift => shift.isPremiumShift).length / totalShifts;
      const swapRequestRate = swapRequests.length / totalShifts;
      const noShowRate = shifts.filter(shift => 
        shift.assignedEmployees.some(emp => emp.status === 'absent')
      ).length / totalShifts;

      // Department breakdown
      const departmentBreakdown: any = {};
      shifts.forEach(shift => {
        if (!departmentBreakdown[shift.department]) {
          departmentBreakdown[shift.department] = {
            shifts: 0,
            hours: 0,
            employees: 0
          };
        }
        departmentBreakdown[shift.department].shifts++;
        const hours = this.calculateShiftHours(shift.startTime, shift.endTime, shift.breakDuration);
        departmentBreakdown[shift.department].hours += hours * shift.assignedEmployees.length;
        departmentBreakdown[shift.department].employees += shift.assignedEmployees.length;
      });

      // Shift type breakdown
      const shiftTypeBreakdown: any = {};
      shifts.forEach(shift => {
        const template = this.shiftTemplates.get(shift.templateId || '');
        const type = template?.type || 'custom';
        
        if (!shiftTypeBreakdown[type]) {
          shiftTypeBreakdown[type] = {
            shifts: 0,
            hours: 0,
            employees: 0
          };
        }
        shiftTypeBreakdown[type].shifts++;
        const hours = this.calculateShiftHours(shift.startTime, shift.endTime, shift.breakDuration);
        shiftTypeBreakdown[type].hours += hours * shift.assignedEmployees.length;
        shiftTypeBreakdown[type].employees += shift.assignedEmployees.length;
      });

      return {
        totalShifts,
        totalHours,
        totalEmployees,
        averageShiftsPerEmployee,
        coverageRate,
        overtimeRate,
        swapRequestRate,
        noShowRate,
        departmentBreakdown,
        shiftTypeBreakdown
      };
    } catch (error) {
      throw new Error(`Failed to get shift analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const shiftService = new ShiftService();
export default shiftService;
