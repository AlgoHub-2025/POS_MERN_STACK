import { Employee, IEmployee } from '../models/Employee';
import mongoose from 'mongoose';
import { EventEmitter } from 'events';

export interface CreateEmployeeData {
  firstName: string;
  lastName: string;
  middleName?: string;
  preferredName?: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed' | 'domestic_partnership';
  dependents?: number;
  email: string;
  alternateEmail?: string;
  phone: string;
  alternatePhone?: string;
  emergencyContacts?: Array<{
    name: string;
    relationship: string;
    phone: string;
    alternatePhone?: string;
    email?: string;
    address?: string;
    isPrimary?: boolean;
  }>;
  addresses?: Array<{
    type: 'current' | 'permanent' | 'temporary';
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isPrimary?: boolean;
    effectiveFrom?: Date;
    effectiveTo?: Date;
  }>;
  governmentIds?: Array<{
    type: 'ssn' | 'passport' | 'driver_license' | 'national_id' | 'voter_id' | 'other';
    number: string;
    issuingAuthority: string;
    issueDate: Date;
    expiryDate?: Date;
    documentUrl?: string;
  }>;
  employment: {
    hireDate: Date;
    contractType: 'full_time' | 'part_time' | 'contract' | 'intern' | 'seasonal' | 'temporary';
    probationEndDate?: Date;
    noticePeriod?: number;
    workSchedule: {
      type: 'fixed' | 'flexible' | 'rotating' | 'split';
      days: string[];
      hours: {
        start: string;
        end: string;
        break?: number;
      };
    };
    workLocation: {
      type: 'onsite' | 'remote' | 'hybrid';
      primaryLocation: string;
      secondaryLocation?: string;
    };
    reportingManager?: string;
    department: string;
    position: string;
    jobLevel: string;
    jobFamily: string;
    costCenter?: string;
  };
  compensation: {
    currency?: string;
    payFrequency: 'hourly' | 'weekly' | 'biweekly' | 'monthly' | 'annual';
    baseSalary?: number;
    hourlyRate?: number;
    overtimeRate?: number;
    bonusStructure?: {
      type: 'percentage' | 'fixed' | 'tiered' | 'performance_based';
      amount?: number;
      percentage?: number;
      tiers?: Array<{
        min: number;
        max: number;
        bonus: number;
      }>;
      eligibilityCriteria?: string[];
    };
    commissionStructure?: {
      type: 'percentage' | 'tiered' | 'fixed';
      rate?: number;
      tiers?: Array<{
        min: number;
        max: number;
        rate: number;
      }>;
      productCategories?: string[];
    };
    benefits?: {
      healthInsurance?: boolean;
      dentalInsurance?: boolean;
      visionInsurance?: boolean;
      lifeInsurance?: boolean;
      retirement401k?: boolean;
      paidTimeOff?: number;
      sickLeave?: number;
      maternityLeave?: number;
      paternityLeave?: number;
      otherBenefits?: string[];
    };
  };
  bankDetails?: Array<{
    bankName: string;
    accountNumber: string;
    routingNumber: string;
    accountType: 'checking' | 'savings';
    bankAddress?: string;
    swiftCode?: string;
    iban?: string;
    isPrimary?: boolean;
    effectiveFrom?: Date;
    effectiveTo?: Date;
  }>;
  skills?: Array<{
    name: string;
    category: 'technical' | 'soft' | 'language' | 'industry' | 'management';
    proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    yearsOfExperience?: number;
    lastUsed?: Date;
    certified?: boolean;
    certificationDetails?: {
      name: string;
      issuingOrganization: string;
      issueDate: Date;
      expiryDate?: Date;
      certificateUrl?: string;
      verificationUrl?: string;
    };
  }>;
  education?: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate: Date;
    endDate?: Date;
    gpa?: number;
    honors?: string[];
    thesis?: string;
    isCurrent?: boolean;
  }>;
  previousEmployment?: Array<{
    company: string;
    position: string;
    department?: string;
    startDate: Date;
    endDate?: Date;
    isCurrent?: boolean;
    responsibilities?: string[];
    achievements?: string[];
    reasonForLeaving?: string;
    finalSalary?: number;
    supervisor?: string;
    supervisorContact?: string;
    canContact?: boolean;
  }>;
  profilePicture?: string;
  bio?: string;
  socialProfiles?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    other?: Record<string, string>;
  };
  bloodType?: string;
  allergies?: string[];
  medicalConditions?: string[];
  emergencyNotes?: string;
  roles?: string[];
  permissions?: string[];
}

export interface UpdateEmployeeData extends Partial<CreateEmployeeData> {
  employmentStatus?: 'active' | 'on_leave' | 'terminated' | 'resigned' | 'retired' | 'probation';
  terminationReason?: string;
  terminationType?: 'voluntary' | 'involuntary' | 'retirement' | 'contract_end';
  backgroundCheckCompleted?: boolean;
  backgroundCheckResult?: 'clear' | 'pending' | 'failed';
  i9Completed?: boolean;
  w4Completed?: boolean;
}

export interface EmployeeSearchOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  department?: string;
  position?: string;
  jobLevel?: string;
  employmentStatus?: string;
  contractType?: string;
  workLocation?: string;
  reportingManager?: string;
  skills?: string[];
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  isActive?: boolean;
  includeDeleted?: boolean;
}

export interface ImportResult {
  total: number;
  imported: number;
  failed: number;
  duplicates: number;
  errors: Array<{ row: number; error: string; data?: any }>;
}

class EmployeeService extends EventEmitter {
  /**
   * Create a new employee
   */
  async createEmployee(data: CreateEmployeeData, createdBy: string): Promise<IEmployee> {
    try {
      // Check for duplicates
      const existing = await Employee.findByEmailOrPhone(data.email, data.phone);
      if (existing) {
        throw new Error('Employee with this email or phone already exists');
      }

      // Generate employee ID
      const employeeId = Employee.generateEmployeeId();

      // Set default values
      const employeeData = {
        ...data,
        employeeId,
        createdBy,
        updatedBy: createdBy,
        employment: {
          ...data.employment,
          employeeId,
          employmentStatus: 'probation'
        },
        compensation: {
          currency: 'USD',
          ...data.compensation,
          benefits: {
            healthInsurance: false,
            dentalInsurance: false,
            visionInsurance: false,
            lifeInsurance: false,
            retirement401k: false,
            paidTimeOff: 0,
            sickLeave: 0,
            maternityLeave: 0,
            paternityLeave: 0,
            otherBenefits: [],
            ...data.compensation?.benefits
          }
        }
      };

      const employee = new Employee(employeeData);
      await employee.save();

      // Emit event
      this.emit('employeeCreated', employee);

      return employee;
    } catch (error) {
      throw new Error(`Failed to create employee: ${error.message}`);
    }
  }

  /**
   * Get employee by ID
   */
  async getEmployeeById(employeeId: string): Promise<IEmployee | null> {
    try {
      return await Employee.findOne({ employeeId, isDeleted: false });
    } catch (error) {
      throw new Error(`Failed to get employee: ${error.message}`);
    }
  }

  /**
   * Update employee
   */
  async updateEmployee(
    employeeId: string,
    data: UpdateEmployeeData,
    updatedBy: string
  ): Promise<IEmployee | null> {
    try {
      const employee = await Employee.findOne({ employeeId, isDeleted: false });
      if (!employee) {
        throw new Error('Employee not found');
      }

      // Handle employment status change
      if (data.employmentStatus && data.employmentStatus !== employee.employment.employmentStatus) {
        await employee.updateEmploymentStatus(
          data.employmentStatus,
          data.terminationReason,
          updatedBy
        );
        
        if (data.terminationType) {
          employee.employment.terminationType = data.terminationType;
        }
      }

      // Update other fields
      Object.assign(employee, data, { updatedBy });

      await employee.save();

      // Emit event
      this.emit('employeeUpdated', employee);

      return employee;
    } catch (error) {
      throw new Error(`Failed to update employee: ${error.message}`);
    }
  }

  /**
   * Delete employee (soft delete)
   */
  async deleteEmployee(employeeId: string, deletedBy: string): Promise<boolean> {
    try {
      const employee = await Employee.findOne({ employeeId, isDeleted: false });
      if (!employee) {
        throw new Error('Employee not found');
      }

      await employee.softDelete(deletedBy);

      // Emit event
      this.emit('employeeDeleted', employee);

      return true;
    } catch (error) {
      throw new Error(`Failed to delete employee: ${error.message}`);
    }
  }

  /**
   * Search employees with advanced filters
   */
  async searchEmployees(options: EmployeeSearchOptions = {}): Promise<{
    employees: IEmployee[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        department,
        position,
        jobLevel,
        employmentStatus,
        contractType,
        workLocation,
        reportingManager,
        skills,
        search,
        dateFrom,
        dateTo,
        isActive = true,
        includeDeleted = false
      } = options;

      const query: any = { isDeleted: includeDeleted };

      if (isActive !== undefined) {
        query.isActive = isActive;
      }

      // Build query
      if (department) query['employment.department'] = department;
      if (position) query['employment.position'] = position;
      if (jobLevel) query['employment.jobLevel'] = jobLevel;
      if (employmentStatus) query['employment.employmentStatus'] = employmentStatus;
      if (contractType) query['employment.contractType'] = contractType;
      if (workLocation) query['employment.workLocation.type'] = workLocation;
      if (reportingManager) query['employment.reportingManager'] = reportingManager;
      if (skills && skills.length > 0) query['skills.name'] = { $in: skills };

      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { employeeId: { $regex: search, $options: 'i' } },
          { 'employment.position': { $regex: search, $options: 'i' } }
        ];
      }

      if (dateFrom || dateTo) {
        query.createdAt = {};
        if (dateFrom) query.createdAt.$gte = dateFrom;
        if (dateTo) query.createdAt.$lte = dateTo;
      }

      // Execute query with pagination
      const skip = (page - 1) * limit;
      const sort: any = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      const employees = await Employee.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec();

      const total = await Employee.countDocuments(query);
      const totalPages = Math.ceil(total / limit);

      return {
        employees,
        total,
        page,
        totalPages
      };
    } catch (error) {
      throw new Error(`Failed to search employees: ${error.message}`);
    }
  }

  /**
   * Add performance review
   */
  async addPerformanceReview(
    employeeId: string,
    reviewData: any,
    reviewerId: string
  ): Promise<IEmployee | null> {
    try {
      const employee = await Employee.findOne({ employeeId, isDeleted: false });
      if (!employee) {
        throw new Error('Employee not found');
      }

      await employee.addPerformanceReview({
        ...reviewData,
        reviewerId,
        reviewerName: 'System' // Would fetch from user service
      });

      // Update average rating
      const reviews = employee.performanceReviews.filter(r => r.status === 'approved');
      if (reviews.length > 0) {
        employee.averageRating = reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length;
      }

      await employee.save();

      // Emit event
      this.emit('performanceReviewAdded', { employee, review: reviewData });

      return employee;
    } catch (error) {
      throw new Error(`Failed to add performance review: ${error.message}`);
    }
  }

  /**
   * Add training record
   */
  async addTrainingRecord(
    employeeId: string,
    trainingData: any
  ): Promise<IEmployee | null> {
    try {
      const employee = await Employee.findOne({ employeeId, isDeleted: false });
      if (!employee) {
        throw new Error('Employee not found');
      }

      await employee.addTrainingRecord(trainingData);

      // Emit event
      this.emit('trainingRecordAdded', { employee, training: trainingData });

      return employee;
    } catch (error) {
      throw new Error(`Failed to add training record: ${error.message}`);
    }
  }

  /**
   * Add time off request
   */
  async addTimeOffRequest(
    employeeId: string,
    requestData: any
  ): Promise<IEmployee | null> {
    try {
      const employee = await Employee.findOne({ employeeId, isDeleted: false });
      if (!employee) {
        throw new Error('Employee not found');
      }

      await employee.addTimeOffRequest(requestData);

      // Emit event
      this.emit('timeOffRequestAdded', { employee, request: requestData });

      return employee;
    } catch (error) {
      throw new Error(`Failed to add time off request: ${error.message}`);
    }
  }

  /**
   * Approve time off request
   */
  async approveTimeOffRequest(
    employeeId: string,
    requestId: string,
    approvedBy: string
  ): Promise<IEmployee | null> {
    try {
      const employee = await Employee.findOne({ employeeId, isDeleted: false });
      if (!employee) {
        throw new Error('Employee not found');
      }

      const request = employee.timeOffRequests.find(r => r.id === requestId);
      if (!request) {
        throw new Error('Time off request not found');
      }

      request.status = 'approved';
      request.approvedBy = approvedBy;
      request.approvedAt = new Date();

      await employee.save();

      // Emit event
      this.emit('timeOffRequestApproved', { employee, request });

      return employee;
    } catch (error) {
      throw new Error(`Failed to approve time off request: ${error.message}`);
    }
  }

  /**
   * Reject time off request
   */
  async rejectTimeOffRequest(
    employeeId: string,
    requestId: string,
    rejectionReason: string,
    rejectedBy: string
  ): Promise<IEmployee | null> {
    try {
      const employee = await Employee.findOne({ employeeId, isDeleted: false });
      if (!employee) {
        throw new Error('Employee not found');
      }

      const request = employee.timeOffRequests.find(r => r.id === requestId);
      if (!request) {
        throw new Error('Time off request not found');
      }

      request.status = 'rejected';
      request.rejectionReason = rejectionReason;
      // Store rejection info in approvedBy field for simplicity
      request.approvedBy = rejectedBy;
      request.approvedAt = new Date();

      await employee.save();

      // Emit event
      this.emit('timeOffRequestRejected', { employee, request });

      return employee;
    } catch (error) {
      throw new Error(`Failed to reject time off request: ${error.message}`);
    }
  }

  /**
   * Add or update skill
   */
  async updateSkill(
    employeeId: string,
    skillData: any
  ): Promise<IEmployee | null> {
    try {
      const employee = await Employee.findOne({ employeeId, isDeleted: false });
      if (!employee) {
        throw new Error('Employee not found');
      }

      await employee.addSkill(skillData);

      // Emit event
      this.emit('skillUpdated', { employee, skill: skillData });

      return employee;
    } catch (error) {
      throw new Error(`Failed to update skill: ${error.message}`);
    }
  }

  /**
   * Get employees by department
   */
  async getEmployeesByDepartment(department: string): Promise<IEmployee[]> {
    try {
      return await Employee.findByDepartment(department);
    } catch (error) {
      throw new Error(`Failed to get employees by department: ${error.message}`);
    }
  }

  /**
   * Get employees by manager
   */
  async getEmployeesByManager(managerId: string): Promise<IEmployee[]> {
    try {
      return await Employee.findByManager(managerId);
    } catch (error) {
      throw new Error(`Failed to get employees by manager: ${error.message}`);
    }
  }

  /**
   * Get active employees
   */
  async getActiveEmployees(): Promise<IEmployee[]> {
    try {
      return await Employee.findActiveEmployees();
    } catch (error) {
      throw new Error(`Failed to get active employees: ${error.message}`);
    }
  }

  /**
   * Import employees from CSV/Excel
   */
  async importEmployees(
    employeesData: any[],
    options: {
      skipDuplicates?: boolean;
      updateExisting?: boolean;
      createdBy: string;
    }
  ): Promise<ImportResult> {
    const result: ImportResult = {
      total: employeesData.length,
      imported: 0,
      failed: 0,
      duplicates: 0,
      errors: []
    };

    for (let i = 0; i < employeesData.length; i++) {
      try {
        const data = employeesData[i];
        
        // Validate required fields
        if (!data.firstName || !data.lastName || !data.email || !data.phone) {
          result.errors.push({
            row: i + 1,
            error: 'Missing required fields (firstName, lastName, email, phone)',
            data
          });
          result.failed++;
          continue;
        }

        // Check for existing employee
        const existing = await Employee.findByEmailOrPhone(data.email, data.phone);
        
        if (existing) {
          if (options.skipDuplicates) {
            result.duplicates++;
            continue;
          } else if (options.updateExisting) {
            await this.updateEmployee(existing.employeeId, data, options.createdBy);
            result.imported++;
            continue;
          } else {
            result.errors.push({
              row: i + 1,
              error: 'Employee already exists',
              data
            });
            result.failed++;
            continue;
          }
        }

        // Create new employee
        await this.createEmployee(data, options.createdBy);
        result.imported++;

      } catch (error) {
        result.errors.push({
          row: i + 1,
          error: error.message,
          data: employeesData[i]
        });
        result.failed++;
      }
    }

    // Emit event
    this.emit('employeesImported', result);

    return result;
  }

  /**
   * Export employees to CSV
   */
  async exportEmployees(options: EmployeeSearchOptions = {}): Promise<any[]> {
    try {
      const { employees } = await this.searchEmployees({
        ...options,
        limit: 10000 // Large limit for export
      });

      return employees.map(employee => ({
        employeeId: employee.employeeId,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        department: employee.employment.department,
        position: employee.employment.position,
        jobLevel: employee.employment.jobLevel,
        employmentStatus: employee.employment.employmentStatus,
        contractType: employee.employment.contractType,
        hireDate: employee.employment.hireDate,
        baseSalary: employee.compensation.baseSalary,
        hourlyRate: employee.compensation.hourlyRate,
        workLocation: employee.employment.workLocation.type,
        reportingManager: employee.employment.reportingManager,
        createdAt: employee.createdAt,
        isActive: employee.isActive
      }));
    } catch (error) {
      throw new Error(`Failed to export employees: ${error.message}`);
    }
  }

  /**
   * Get employee analytics
   */
  async getEmployeeAnalytics(dateFrom?: Date, dateTo?: Date): Promise<{
    totalEmployees: number;
    activeEmployees: number;
    newHires: number;
    terminatedEmployees: number;
    departmentDistribution: any;
    jobLevelDistribution: any;
    contractTypeDistribution: any;
    genderDistribution: any;
    averageAge: number;
    averageYearsOfService: number;
    turnoverRate: number;
  }> {
    try {
      const matchStage: any = { isDeleted: false };
      if (dateFrom || dateTo) {
        matchStage.createdAt = {};
        if (dateFrom) matchStage.createdAt.$gte = dateFrom;
        if (dateTo) matchStage.createdAt.$lte = dateTo;
      }

      const analytics = await Employee.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalEmployees: { $sum: 1 },
            activeEmployees: {
              $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
            },
            totalAge: { $sum: { $subtract: [new Date(), '$dateOfBirth'] } },
            totalService: { $sum: { $subtract: [new Date(), '$employment.hireDate'] } },
            departments: { $push: '$employment.department' },
            jobLevels: { $push: '$employment.jobLevel' },
            contractTypes: { $push: '$employment.contractType' },
            genders: { $push: '$gender' }
          }
        }
      ]);

      const result = analytics[0] || {
        totalEmployees: 0,
        activeEmployees: 0,
        totalAge: 0,
        totalService: 0,
        departments: [],
        jobLevels: [],
        contractTypes: [],
        genders: []
      };

      // Calculate new hires (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const newHires = await Employee.countDocuments({
        'employment.hireDate': { $gte: thirtyDaysAgo },
        isDeleted: false
      });

      // Calculate terminated employees
      const terminatedEmployees = await Employee.countDocuments({
        'employment.employmentStatus': { $in: ['terminated', 'resigned'] },
        isDeleted: false
      });

      // Calculate distributions
      const departmentDistribution = this.calculateDistribution(result.departments);
      const jobLevelDistribution = this.calculateDistribution(result.jobLevels);
      const contractTypeDistribution = this.calculateDistribution(result.contractTypes);
      const genderDistribution = this.calculateDistribution(result.genders);

      // Calculate averages
      const averageAge = result.totalEmployees > 0 ? 
        Math.round(result.totalAge / result.totalEmployees / (365.25 * 24 * 60 * 60 * 1000)) : 0;
      const averageYearsOfService = result.totalEmployees > 0 ? 
        Math.round(result.totalService / result.totalEmployees / (365.25 * 24 * 60 * 60 * 1000)) : 0;

      // Calculate turnover rate (last 12 months)
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);
      const totalEmployeesYearAgo = await Employee.countDocuments({
        'employment.hireDate': { $lte: twelveMonthsAgo },
        isDeleted: false
      });
      const terminatedLastYear = await Employee.countDocuments({
        'employment.terminationDate': { $gte: twelveMonthsAgo },
        isDeleted: false
      });
      const turnoverRate = totalEmployeesYearAgo > 0 ? 
        (terminatedLastYear / totalEmployeesYearAgo) * 100 : 0;

      return {
        totalEmployees: result.totalEmployees,
        activeEmployees: result.activeEmployees,
        newHires,
        terminatedEmployees,
        departmentDistribution,
        jobLevelDistribution,
        contractTypeDistribution,
        genderDistribution,
        averageAge,
        averageYearsOfService,
        turnoverRate: Math.round(turnoverRate * 100) / 100
      };
    } catch (error) {
      throw new Error(`Failed to get employee analytics: ${error.message}`);
    }
  }

  /**
   * Helper method to calculate distribution
   */
  private calculateDistribution(items: string[]): any {
    const distribution: any = {};
    items.forEach(item => {
      distribution[item] = (distribution[item] || 0) + 1;
    });
    return distribution;
  }

  /**
   * Update employee performance metrics
   */
  async updatePerformanceMetrics(
    employeeId: string,
    metrics: {
      totalHoursWorked?: number;
      totalOvertimeHours?: number;
      totalSales?: number;
      totalCommission?: number;
      totalTips?: number;
      attendanceRate?: number;
      punctualityRate?: number;
    }
  ): Promise<IEmployee | null> {
    try {
      const employee = await Employee.findOne({ employeeId, isDeleted: false });
      if (!employee) {
        throw new Error('Employee not found');
      }

      // Update metrics
      Object.keys(metrics).forEach(key => {
        if (metrics[key] !== undefined) {
          employee[key] = metrics[key];
        }
      });

      await employee.save();

      // Emit event
      this.emit('performanceMetricsUpdated', { employee, metrics });

      return employee;
    } catch (error) {
      throw new Error(`Failed to update performance metrics: ${error.message}`);
    }
  }

  /**
   * Get employee directory
   */
  async getEmployeeDirectory(options: {
    department?: string;
    includeInactive?: boolean;
  } = {}): Promise<Array<{
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    position: string;
    department: string;
    profilePicture?: string;
    workLocation: string;
    isActive: boolean;
  }>> {
    try {
      const query: any = { isDeleted: false };
      if (options.department) {
        query['employment.department'] = options.department;
      }
      if (!options.includeInactive) {
        query.isActive = true;
      }

      const employees = await Employee.find(query)
        .select('employeeId firstName lastName email phone employment.position employment.department employment.workLocation profilePicture isActive')
        .sort({ lastName: 1, firstName: 1 });

      return employees.map(employee => ({
        employeeId: employee.employeeId,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        position: employee.employment.position,
        department: employee.employment.department,
        profilePicture: employee.profilePicture,
        workLocation: employee.employment.workLocation.type,
        isActive: employee.isActive
      }));
    } catch (error) {
      throw new Error(`Failed to get employee directory: ${error.message}`);
    }
  }

  /**
   * Get upcoming birthdays
   */
  async getUpcomingBirthdays(days: number = 30): Promise<Array<{
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    department: string;
    dateOfBirth: Date;
    daysUntil: number;
  }>> {
    try {
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + days);

      const employees = await Employee.find({
        isDeleted: false,
        isActive: true,
        dateOfBirth: { $exists: true }
      }).select('employeeId firstName lastName email employment.department dateOfBirth');

      const upcomingBirthdays = employees.filter(employee => {
        const thisYear = today.getFullYear();
        const birthdayThisYear = new Date(employee.dateOfBirth);
        birthdayThisYear.setFullYear(thisYear);

        const nextYear = today.getFullYear() + 1;
        const birthdayNextYear = new Date(employee.dateOfBirth);
        birthdayNextYear.setFullYear(nextYear);

        return (birthdayThisYear >= today && birthdayThisYear <= futureDate) ||
               (birthdayNextYear >= today && birthdayNextYear <= futureDate);
      });

      return upcomingBirthdays.map(employee => {
        const thisYear = today.getFullYear();
        const birthdayThisYear = new Date(employee.dateOfBirth);
        birthdayThisYear.setFullYear(thisYear);

        const nextYear = today.getFullYear() + 1;
        const birthdayNextYear = new Date(employee.dateOfBirth);
        birthdayNextYear.setFullYear(nextYear);

        let nextBirthday = birthdayThisYear >= today ? birthdayThisYear : birthdayNextYear;
        const daysUntil = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        return {
          employeeId: employee.employeeId,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          department: employee.employment.department,
          dateOfBirth: employee.dateOfBirth,
          daysUntil
        };
      }).sort((a, b) => a.daysUntil - b.daysUntil);
    } catch (error) {
      throw new Error(`Failed to get upcoming birthdays: ${error.message}`);
    }
  }

  /**
   * Get work anniversary notifications
   */
  async getWorkAnniversaries(days: number = 30): Promise<Array<{
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    department: string;
    hireDate: Date;
    yearsOfService: number;
    daysUntil: number;
  }>> {
    try {
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + days);

      const employees = await Employee.find({
        isDeleted: false,
        isActive: true,
        'employment.hireDate': { $exists: true }
      }).select('employeeId firstName lastName email employment.department employment.hireDate');

      const upcomingAnniversaries = employees.filter(employee => {
        const thisYear = today.getFullYear();
        const anniversaryThisYear = new Date(employee.employment.hireDate);
        anniversaryThisYear.setFullYear(thisYear);

        const nextYear = today.getFullYear() + 1;
        const anniversaryNextYear = new Date(employee.employment.hireDate);
        anniversaryNextYear.setFullYear(nextYear);

        return (anniversaryThisYear >= today && anniversaryThisYear <= futureDate) ||
               (anniversaryNextYear >= today && anniversaryNextYear <= futureDate);
      });

      return upcomingAnniversaries.map(employee => {
        const thisYear = today.getFullYear();
        const anniversaryThisYear = new Date(employee.employment.hireDate);
        anniversaryThisYear.setFullYear(thisYear);

        const nextYear = today.getFullYear() + 1;
        const anniversaryNextYear = new Date(employee.employment.hireDate);
        anniversaryNextYear.setFullYear(nextYear);

        let nextAnniversary = anniversaryThisYear >= today ? anniversaryThisYear : anniversaryNextYear;
        const daysUntil = Math.ceil((nextAnniversary.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const yearsOfService = nextAnniversary.getFullYear() - employee.employment.hireDate.getFullYear();

        return {
          employeeId: employee.employeeId,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          department: employee.employment.department,
          hireDate: employee.employment.hireDate,
          yearsOfService,
          daysUntil
        };
      }).sort((a, b) => a.daysUntil - b.daysUntil);
    } catch (error) {
      throw new Error(`Failed to get work anniversaries: ${error.message}`);
    }
  }
}

export const employeeService = new EmployeeService();
export default employeeService;
