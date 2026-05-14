import { Employee, IEmployee } from '../models/Employee';
import mongoose from 'mongoose';
import { EventEmitter } from 'events';

export interface PayrollPeriod {
  id: string;
  name: string;
  type: 'weekly' | 'biweekly' | 'semimonthly' | 'monthly' | 'quarterly' | 'annual';
  startDate: Date;
  endDate: Date;
  payDate: Date;
  status: 'draft' | 'processing' | 'processed' | 'paid' | 'cancelled';
  fiscalYear: number;
  quarter: number;
  month: number;
  week?: number;
  isActive: boolean;
  createdAt: Date;
  updatedBy: string;
}

export interface PayrollEntry {
  id: string;
  employeeId: string;
  periodId: string;
  status: 'draft' | 'calculated' | 'approved' | 'paid' | 'cancelled';
  basicSalary: number;
  overtimeHours: number;
  overtimeRate: number;
  overtimePay: number;
  bonus: number;
  commission: number;
  allowance: number;
  deduction: number;
  tax: number;
  insurance: number;
  retirement: number;
  otherDeductions: number;
  grossPay: number;
  netPay: number;
  ytdGrossPay: number;
  ytdNetPay: number;
  ytdTax: number;
  workDays: number;
  workedDays: number;
  leaveDays: number;
  sickDays: number;
  holidayDays: number;
  unpaidDays: number;
  hoursWorked: number;
  regularHours: number;
  specialPay: Array<{
    type: string;
    amount: number;
    description: string;
    taxable: boolean;
  }>;
  specialDeductions: Array<{
    type: string;
    amount: number;
    description: string;
    preTax: boolean;
  }>;
  notes?: string;
  processedBy: string;
  processedAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  paidBy?: string;
  paidAt?: Date;
  paymentMethod: 'direct_deposit' | 'check' | 'cash' | 'wire';
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    routingNumber: string;
    accountType: 'checking' | 'savings';
  };
  checkNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaxConfiguration {
  id: string;
  name: string;
  type: 'federal' | 'state' | 'local' | 'social_security' | 'medicare' | 'unemployment' | 'disability';
  jurisdiction: string;
  taxType: 'percentage' | 'fixed' | 'tiered' | 'bracket';
  rates: Array<{
    min?: number;
    max?: number;
    rate: number;
    fixedAmount?: number;
  }>;
  allowances: number;
  standardDeduction: number;
  personalExemption: number;
  isActive: boolean;
  effectiveDate: Date;
  expiryDate?: Date;
  createdAt: Date;
  updatedBy: string;
}

export interface PayrollSettings {
  id: string;
  company: {
    name: string;
    ein: string;
    address: string;
    phone: string;
    email: string;
  };
  paySchedule: {
    frequency: 'weekly' | 'biweekly' | 'semimonthly' | 'monthly';
    payDays: string[]; // e.g., ['Friday'] for weekly, ['15', '30'] for semimonthly
    cutoffDay: number; // Day of month for timesheet cutoff
    payDelay: number; // Days between period end and pay date
  };
  overtime: {
    enabled: boolean;
    threshold: number; // Hours per week
    rate: number; // Multiplier (e.g., 1.5 for time and a half)
    doubleTimeThreshold: number; // Hours per week for double time
    doubleTimeRate: number; // Multiplier for double time
  };
  deductions: {
    federalTax: boolean;
    stateTax: boolean;
    localTax: boolean;
    socialSecurity: boolean;
    medicare: boolean;
    unemployment: boolean;
    disability: boolean;
    customDeductions: Array<{
      name: string;
      type: 'fixed' | 'percentage';
      amount: number;
      preTax: boolean;
      active: boolean;
    }>;
  };
  benefits: {
    healthInsurance: boolean;
    dentalInsurance: boolean;
    visionInsurance: boolean;
    lifeInsurance: boolean;
    retirement401k: {
      enabled: boolean;
      companyMatch: number;
      matchLimit: number;
      vestingSchedule: Array<{
        years: number;
        percentage: number;
      }>;
    };
  };
  pto: {
    accrualEnabled: boolean;
    accrualRate: number; // Days per pay period
    maxAccrual: number;
    carryOverEnabled: boolean;
    carryOverLimit: number;
    payoutOnTermination: boolean;
  };
  compliance: {
    minimumWage: number;
    breakRequirements: {
      enabled: boolean;
      hoursThreshold: number;
      breakDuration: number; // minutes
    };
    recordRetention: number; // years
  };
  notifications: {
    emailReminders: boolean;
    reminderDays: number[];
    approvalNotifications: boolean;
    paymentNotifications: boolean;
  };
  isActive: boolean;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
}

export interface PayStub {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAddress: string;
  employeeIdNumber: string;
  periodStartDate: Date;
  periodEndDate: Date;
  payDate: Date;
  payPeriod: string;
  ytdGrossPay: number;
  ytdNetPay: number;
  earnings: Array<{
    description: string;
    hours?: number;
    rate?: number;
    amount: number;
    ytdAmount: number;
  }>;
  deductions: Array<{
    description: string;
    amount: number;
    ytdAmount: number;
    preTax: boolean;
  }>;
  taxes: Array<{
    description: string;
    amount: number;
    ytdAmount: number;
  }>;
  netPay: number;
  grossPay: number;
  totalDeductions: number;
  totalTaxes: number;
  companyInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  generatedAt: Date;
  pdfUrl?: string;
}

export interface PayrollReport {
  id: string;
  name: string;
  type: 'payroll_summary' | 'tax_liability' | 'labor_cost' | 'benefit_cost' | 'compliance' | 'custom';
  parameters: {
    periodId?: string;
    dateRange?: { startDate: Date; endDate: Date };
    departments?: string[];
    employeeTypes?: string[];
    includeYTD?: boolean;
  };
  data: any;
  generatedBy: string;
  generatedAt: Date;
  format: 'json' | 'csv' | 'pdf' | 'excel';
  fileUrl?: string;
}

class PayrollService extends EventEmitter {
  private periods: Map<string, PayrollPeriod> = new Map();
  private entries: Map<string, PayrollEntry> = new Map();
  private taxConfigurations: Map<string, TaxConfiguration> = new Map();
  private settings: PayrollSettings | null = null;
  private payStubs: Map<string, PayStub> = new Map();
  private reports: Map<string, PayrollReport> = new Map();

  constructor() {
    super();
    this.initializeDefaultSettings();
    this.initializeDefaultTaxConfigurations();
    this.generatePayrollPeriods();
  }

  /**
   * Initialize default payroll settings
   */
  private initializeDefaultSettings(): void {
    this.settings = {
      id: 'default_settings',
      company: {
        name: 'AlgoHub POS Systems',
        ein: '12-3456789',
        address: '123 Business Ave, Suite 100, Business City, BC 12345',
        phone: '(555) 123-4567',
        email: 'payroll@algohub.com'
      },
      paySchedule: {
        frequency: 'biweekly',
        payDays: ['Friday'],
        cutoffDay: 1, // 1st day of pay period
        payDelay: 5 // Pay 5 days after period ends
      },
      overtime: {
        enabled: true,
        threshold: 40,
        rate: 1.5,
        doubleTimeThreshold: 0,
        doubleTimeRate: 2.0
      },
      deductions: {
        federalTax: true,
        stateTax: true,
        localTax: false,
        socialSecurity: true,
        medicare: true,
        unemployment: true,
        disability: true,
        customDeductions: []
      },
      benefits: {
        healthInsurance: true,
        dentalInsurance: true,
        visionInsurance: true,
        lifeInsurance: true,
        retirement401k: {
          enabled: true,
          companyMatch: 0.04, // 4% match
          matchLimit: 0.06, // Up to 6% of salary
          vestingSchedule: [
            { years: 0, percentage: 0 },
            { years: 1, percentage: 0.25 },
            { years: 2, percentage: 0.50 },
            { years: 3, percentage: 0.75 },
            { years: 4, percentage: 1.0 }
          ]
        }
      },
      pto: {
        accrualEnabled: true,
        accrualRate: 0.08, // ~0.16 days per week (8.33 days per year)
        maxAccrual: 40,
        carryOverEnabled: true,
        carryOverLimit: 10,
        payoutOnTermination: true
      },
      compliance: {
        minimumWage: 15.00,
        breakRequirements: {
          enabled: true,
          hoursThreshold: 6,
          breakDuration: 30
        },
        recordRetention: 7
      },
      notifications: {
        emailReminders: true,
        reminderDays: [3, 1], // 3 days and 1 day before payday
        approvalNotifications: true,
        paymentNotifications: true
      },
      isActive: true,
      createdAt: new Date(),
      updatedBy: 'system',
      updatedAt: new Date()
    };
  }

  /**
   * Initialize default tax configurations
   */
  private initializeDefaultTaxConfigurations(): void {
    const defaultTaxes: TaxConfiguration[] = [
      {
        id: 'federal_income_tax',
        name: 'Federal Income Tax',
        type: 'federal',
        jurisdiction: 'US',
        taxType: 'bracket',
        rates: [
          { min: 0, max: 11000, rate: 0.10 },
          { min: 11001, max: 44725, rate: 0.12 },
          { min: 44726, max: 95375, rate: 0.22 },
          { min: 95376, max: 182050, rate: 0.24 },
          { min: 182051, max: 231250, rate: 0.32 },
          { min: 231251, max: 578125, rate: 0.35 },
          { min: 578126, rate: 0.37 }
        ],
        allowances: 1,
        standardDeduction: 13850,
        personalExemption: 0,
        isActive: true,
        effectiveDate: new Date('2023-01-01'),
        createdAt: new Date(),
        updatedBy: 'system'
      },
      {
        id: 'social_security',
        name: 'Social Security',
        type: 'social_security',
        jurisdiction: 'US',
        taxType: 'percentage',
        rates: [
          { rate: 0.062 } // 6.2%
        ],
        allowances: 0,
        standardDeduction: 0,
        personalExemption: 0,
        isActive: true,
        effectiveDate: new Date('2023-01-01'),
        createdAt: new Date(),
        updatedBy: 'system'
      },
      {
        id: 'medicare',
        name: 'Medicare',
        type: 'medicare',
        jurisdiction: 'US',
        taxType: 'percentage',
        rates: [
          { rate: 0.0145 } // 1.45%
        ],
        allowances: 0,
        standardDeduction: 0,
        personalExemption: 0,
        isActive: true,
        effectiveDate: new Date('2023-01-01'),
        createdAt: new Date(),
        updatedBy: 'system'
      }
    ];

    defaultTaxes.forEach(tax => {
      this.taxConfigurations.set(tax.id, tax);
    });
  }

  /**
   * Generate payroll periods for the year
   */
  private generatePayrollPeriods(): void {
    if (!this.settings) return;

    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31);

    let currentDate = new Date(startDate);
    let periodCounter = 1;

    while (currentDate <= endDate) {
      let periodEndDate: Date;
      let payDate: Date;

      switch (this.settings.paySchedule.frequency) {
        case 'weekly':
          periodEndDate = new Date(currentDate);
          periodEndDate.setDate(periodEndDate.getDate() + 6);
          payDate = new Date(periodEndDate);
          payDate.setDate(payDate.getDate() + this.settings.paySchedule.payDelay);
          break;

        case 'biweekly':
          periodEndDate = new Date(currentDate);
          periodEndDate.setDate(periodEndDate.getDate() + 13);
          payDate = new Date(periodEndDate);
          payDate.setDate(payDate.getDate() + this.settings.paySchedule.payDelay);
          break;

        case 'semimonthly':
          // 1st to 15th, then 16th to end of month
          if (currentDate.getDate() === 1) {
            periodEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 15);
          } else {
            periodEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
          }
          payDate = new Date(periodEndDate);
          payDate.setDate(payDate.getDate() + this.settings.paySchedule.payDelay);
          break;

        case 'monthly':
          periodEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
          payDate = new Date(periodEndDate);
          payDate.setDate(payDate.getDate() + this.settings.paySchedule.payDelay);
          break;

        default:
          periodEndDate = new Date(currentDate);
          periodEndDate.setDate(periodEndDate.getDate() + 13);
          payDate = new Date(periodEndDate);
          payDate.setDate(payDate.getDate() + this.settings.paySchedule.payDelay);
      }

      const period: PayrollPeriod = {
        id: `period_${currentYear}_${periodCounter}`,
        name: `Pay Period ${periodCounter} - ${currentYear}`,
        type: this.settings.paySchedule.frequency,
        startDate: new Date(currentDate),
        endDate: periodEndDate,
        payDate,
        status: 'draft',
        fiscalYear: currentYear,
        quarter: Math.floor((currentDate.getMonth() + 3) / 3),
        month: currentDate.getMonth() + 1,
        week: periodCounter,
        isActive: true,
        createdAt: new Date(),
        updatedBy: 'system'
      };

      this.periods.set(period.id, period);

      // Move to next period
      currentDate = new Date(periodEndDate);
      currentDate.setDate(currentDate.getDate() + 1);
      periodCounter++;
    }
  }

  /**
   * Process payroll for a period
   */
  async processPayroll(periodId: string, options: {
    employeeIds?: string[];
    recalculate?: boolean;
    dryRun?: boolean;
  } = {}): Promise<{
    success: boolean;
    entries: PayrollEntry[];
    errors: Array<{ employeeId: string; error: string }>;
    summary: {
      totalEmployees: number;
      totalGrossPay: number;
      totalNetPay: number;
      totalTaxes: number;
      totalDeductions: number;
    };
  }> {
    try {
      const period = this.periods.get(periodId);
      if (!period) {
        throw new Error('Payroll period not found');
      }

      const employees = await this.getEmployeesForPayroll(options.employeeIds);
      const entries: PayrollEntry[] = [];
      const errors: Array<{ employeeId: string; error: string }> = [];

      let totalGrossPay = 0;
      let totalNetPay = 0;
      let totalTaxes = 0;
      let totalDeductions = 0;

      for (const employee of employees) {
        try {
          const entry = await this.calculatePayrollEntry(employee, period, options.recalculate);
          entries.push(entry);

          totalGrossPay += entry.grossPay;
          totalNetPay += entry.netPay;
          totalTaxes += entry.tax;
          totalDeductions += entry.deduction;

          if (!options.dryRun) {
            this.entries.set(entry.id, entry);
          }
        } catch (error) {
          errors.push({
            employeeId: employee.employeeId,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // Update period status if not dry run
      if (!options.dryRun && entries.length > 0) {
        period.status = 'processed';
        period.updatedBy = 'system';
        this.periods.set(periodId, period);
      }

      const summary = {
        totalEmployees: entries.length,
        totalGrossPay,
        totalNetPay,
        totalTaxes,
        totalDeductions
      };

      this.emit('payrollProcessed', { periodId, entries, summary, dryRun: options.dryRun });

      return {
        success: errors.length === 0,
        entries,
        errors,
        summary
      };
    } catch (error) {
      throw new Error(`Failed to process payroll: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate payroll entry for an employee
   */
  private async calculatePayrollEntry(
    employee: IEmployee,
    period: PayrollPeriod,
    recalculate: boolean = false
  ): Promise<PayrollEntry> {
    const entryId = `${period.id}_${employee.employeeId}`;
    
    // Check if entry already exists and not recalculation
    if (!recalculate) {
      const existingEntry = this.entries.get(entryId);
      if (existingEntry && existingEntry.status !== 'draft') {
        return existingEntry;
      }
    }

    // Get YTD totals
    const ytdTotals = await this.calculateYTDTotals(employee.employeeId, period.startDate);

    // Calculate basic pay
    const basicSalary = this.calculateBasicSalary(employee, period);
    
    // Calculate overtime
    const overtimeData = await this.calculateOvertime(employee, period);
    
    // Calculate bonuses and commissions
    const bonus = await this.calculateBonus(employee, period);
    const commission = await this.calculateCommission(employee, period);
    
    // Calculate allowances
    const allowance = await this.calculateAllowances(employee, period);
    
    // Calculate gross pay
    const grossPay = basicSalary + overtimeData.overtimePay + bonus + commission + allowance;
    
    // Calculate taxes
    const taxData = await this.calculateTaxes(employee, grossPay, period);
    
    // Calculate deductions
    const deductionData = await this.calculateDeductions(employee, grossPay, period);
    
    // Calculate net pay
    const netPay = grossPay - taxData.totalTax - deductionData.totalDeduction;

    const entry: PayrollEntry = {
      id: entryId,
      employeeId: employee.employeeId,
      periodId: period.id,
      status: 'calculated',
      basicSalary,
      overtimeHours: overtimeData.overtimeHours,
      overtimeRate: overtimeData.overtimeRate,
      overtimePay: overtimeData.overtimePay,
      bonus,
      commission,
      allowance,
      deduction: deductionData.totalDeduction,
      tax: taxData.totalTax,
      insurance: deductionData.insurance || 0,
      retirement: deductionData.retirement || 0,
      otherDeductions: deductionData.otherDeductions || 0,
      grossPay,
      netPay,
      ytdGrossPay: ytdTotals.grossPay + grossPay,
      ytdNetPay: ytdTotals.netPay + netPay,
      ytdTax: ytdTotals.tax + taxData.totalTax,
      workDays: this.calculateWorkDays(period),
      workedDays: await this.getWorkedDays(employee, period),
      leaveDays: await this.getLeaveDays(employee, period),
      sickDays: await this.getSickDays(employee, period),
      holidayDays: await this.getHolidayDays(period),
      unpaidDays: await this.getUnpaidDays(employee, period),
      hoursWorked: await this.getHoursWorked(employee, period),
      regularHours: await this.getRegularHours(employee, period),
      specialPay: [],
      specialDeductions: [],
      processedBy: 'system',
      paymentMethod: 'direct_deposit',
      bankAccount: employee.bankDetails.find(bank => bank.isPrimary),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return entry;
  }

  /**
   * Calculate basic salary for period
   */
  private calculateBasicSalary(employee: IEmployee, period: PayrollPeriod): number {
    const { compensation } = employee;
    
    switch (compensation.payFrequency) {
      case 'hourly':
        const hoursPerPeriod = this.getRegularHoursForPeriod(period);
        return (compensation.hourlyRate || 0) * hoursPerPeriod;
        
      case 'weekly':
        return (compensation.baseSalary || 0) / 52;
        
      case 'biweekly':
        return (compensation.baseSalary || 0) / 26;
        
      case 'monthly':
        return (compensation.baseSalary || 0) / 12;
        
      case 'annual':
        return (compensation.baseSalary || 0) / 52; // Convert to weekly equivalent
        
      default:
        return 0;
    }
  }

  /**
   * Calculate overtime
   */
  private async calculateOvertime(employee: IEmployee, period: PayrollPeriod): Promise<{
    overtimeHours: number;
    overtimeRate: number;
    overtimePay: number;
  }> {
    if (!this.settings?.overtime.enabled) {
      return { overtimeHours: 0, overtimeRate: 0, overtimePay: 0 };
    }

    const hoursWorked = await this.getHoursWorked(employee, period);
    const regularHours = this.getRegularHoursForPeriod(period);
    const overtimeHours = Math.max(0, hoursWorked - regularHours);
    
    const hourlyRate = employee.compensation.hourlyRate || 
      (employee.compensation.baseSalary || 0) / 2080; // 52 weeks * 40 hours
    
    const overtimeRate = hourlyRate * this.settings.overtime.rate;
    const overtimePay = overtimeHours * overtimeRate;

    return { overtimeHours, overtimeRate, overtimePay };
  }

  /**
   * Calculate taxes
   */
  private async calculateTaxes(
    employee: IEmployee,
    grossPay: number,
    period: PayrollPeriod
  ): Promise<{ totalTax: number; breakdown: Array<{ name: string; amount: number }> }> {
    const breakdown: Array<{ name: string; amount: number }> = [];
    let totalTax = 0;

    if (!this.settings) {
      return { totalTax: 0, breakdown };
    }

    // Federal Income Tax
    if (this.settings.deductions.federalTax) {
      const federalTax = await this.calculateFederalTax(employee, grossPay);
      breakdown.push({ name: 'Federal Income Tax', amount: federalTax });
      totalTax += federalTax;
    }

    // Social Security
    if (this.settings.deductions.socialSecurity) {
      const socialSecurityTax = this.calculateSocialSecurityTax(grossPay);
      breakdown.push({ name: 'Social Security', amount: socialSecurityTax });
      totalTax += socialSecurityTax;
    }

    // Medicare
    if (this.settings.deductions.medicare) {
      const medicareTax = this.calculateMedicareTax(grossPay);
      breakdown.push({ name: 'Medicare', amount: medicareTax });
      totalTax += medicareTax;
    }

    // State Tax (simplified - would need state-specific logic)
    if (this.settings.deductions.stateTax) {
      const stateTax = grossPay * 0.05; // Simplified 5% state tax
      breakdown.push({ name: 'State Tax', amount: stateTax });
      totalTax += stateTax;
    }

    return { totalTax, breakdown };
  }

  /**
   * Calculate federal income tax
   */
  private async calculateFederalTax(employee: IEmployee, grossPay: number): number {
    const federalTax = this.taxConfigurations.get('federal_income_tax');
    if (!federalTax || !federalTax.isActive) return 0;

    // Simplified calculation - would need to consider allowances, deductions, etc.
    const taxableIncome = grossPay - federalTax.standardDeduction / 52; // Weekly standard deduction
    
    for (const bracket of federalTax.rates) {
      if (taxableIncome >= (bracket.min || 0) && (!bracket.max || taxableIncome <= bracket.max)) {
        return taxableIncome * bracket.rate;
      }
    }

    return 0;
  }

  /**
   * Calculate Social Security tax
   */
  private calculateSocialSecurityTax(grossPay: number): number {
    const socialSecurityTax = this.taxConfigurations.get('social_security');
    if (!socialSecurityTax || !socialSecurityTax.isActive) return 0;

    const rate = socialSecurityTax.rates[0]?.rate || 0.062;
    const annualWageBase = 160200; // 2023 wage base
    const weeklyWageBase = annualWageBase / 52;
    const taxableWage = Math.min(grossPay, weeklyWageBase);

    return taxableWage * rate;
  }

  /**
   * Calculate Medicare tax
   */
  private calculateMedicareTax(grossPay: number): number {
    const medicareTax = this.taxConfigurations.get('medicare');
    if (!medicareTax || !medicareTax.isActive) return 0;

    const rate = medicareTax.rates[0]?.rate || 0.0145;
    return grossPay * rate;
  }

  /**
   * Calculate deductions
   */
  private async calculateDeductions(
    employee: IEmployee,
    grossPay: number,
    period: PayrollPeriod
  ): Promise<{ totalDeduction: number; insurance?: number; retirement?: number; otherDeductions?: number }> {
    let totalDeduction = 0;
    let insurance = 0;
    let retirement = 0;
    let otherDeductions = 0;

    if (!this.settings) {
      return { totalDeduction: 0 };
    }

    // Health Insurance
    if (this.settings.benefits.healthInsurance) {
      // Simplified - would use actual benefit elections
      insurance += 100; // $100 per pay period
    }

    // Dental Insurance
    if (this.settings.benefits.dentalInsurance) {
      insurance += 25; // $25 per pay period
    }

    // Vision Insurance
    if (this.settings.benefits.visionInsurance) {
      insurance += 10; // $10 per pay period
    }

    // 401k Retirement
    if (this.settings.benefits.retirement401k.enabled) {
      const employeeContribution = grossPay * 0.05; // 5% employee contribution
      const companyMatch = Math.min(
        grossPay * this.settings.benefits.retirement401k.companyMatch,
        grossPay * this.settings.benefits.retirement401k.matchLimit
      );
      retirement = employeeContribution; // Only employee contribution is deducted
    }

    otherDeductions = insurance + retirement;
    totalDeduction = otherDeductions;

    return { totalDeduction, insurance, retirement, otherDeductions };
  }

  /**
   * Get employees for payroll
   */
  private async getEmployeesForPayroll(employeeIds?: string[]): Promise<IEmployee[]> {
    const query: any = {
      isActive: true,
      isDeleted: false,
      'employment.employmentStatus': 'active'
    };

    if (employeeIds && employeeIds.length > 0) {
      query.employeeId = { $in: employeeIds };
    }

    return await Employee.find(query);
  }

  /**
   * Calculate YTD totals
   */
  private async calculateYTDTotals(employeeId: string, periodStartDate: Date): Promise<{
    grossPay: number;
    netPay: number;
    tax: number;
  }> {
    const yearStart = new Date(periodStartDate.getFullYear(), 0, 1);
    const previousEntries = Array.from(this.entries.values()).filter(entry =>
      entry.employeeId === employeeId &&
      entry.createdAt >= yearStart &&
      entry.createdAt < periodStartDate &&
      entry.status === 'paid'
    );

    return previousEntries.reduce((totals, entry) => ({
      grossPay: totals.grossPay + entry.grossPay,
      netPay: totals.netPay + entry.netPay,
      tax: totals.tax + entry.tax
    }), { grossPay: 0, netPay: 0, tax: 0 });
  }

  /**
   * Generate pay stub
   */
  async generatePayStub(entryId: string): Promise<PayStub> {
    try {
      const entry = this.entries.get(entryId);
      if (!entry) {
        throw new Error('Payroll entry not found');
      }

      const employee = await Employee.findOne({ employeeId: entry.employeeId, isDeleted: false });
      if (!employee) {
        throw new Error('Employee not found');
      }

      const period = this.periods.get(entry.periodId);
      if (!period) {
        throw new Error('Payroll period not found');
      }

      const payStub: PayStub = {
        id: `stub_${entryId}`,
        employeeId: entry.employeeId,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        employeeAddress: this.formatEmployeeAddress(employee),
        employeeIdNumber: employee.employeeId,
        periodStartDate: period.startDate,
        periodEndDate: period.endDate,
        payDate: period.payDate,
        payPeriod: period.name,
        ytdGrossPay: entry.ytdGrossPay,
        ytdNetPay: entry.ytdNetPay,
        earnings: [
          {
            description: 'Regular Salary',
            hours: entry.regularHours,
            rate: entry.basicSalary / entry.regularHours,
            amount: entry.basicSalary,
            ytdAmount: entry.ytdGrossPay - entry.overtimePay - entry.bonus - entry.commission
          },
          ...(entry.overtimeHours > 0 ? [{
            description: 'Overtime',
            hours: entry.overtimeHours,
            rate: entry.overtimeRate,
            amount: entry.overtimePay,
            ytdAmount: 0 // Would calculate YTD overtime
          }] : []),
          ...(entry.bonus > 0 ? [{
            description: 'Bonus',
            amount: entry.bonus,
            ytdAmount: 0 // Would calculate YTD bonus
          }] : []),
          ...(entry.commission > 0 ? [{
            description: 'Commission',
            amount: entry.commission,
            ytdAmount: 0 // Would calculate YTD commission
          }] : [])
        ],
        deductions: [
          ...(entry.insurance > 0 ? [{
            description: 'Health/Dental/Vision Insurance',
            amount: entry.insurance,
            ytdAmount: 0 // Would calculate YTD insurance
          }] : []),
          ...(entry.retirement > 0 ? [{
            description: '401(k) Contribution',
            amount: entry.retirement,
            ytdAmount: 0 // Would calculate YTD retirement
          }] : [])
        ],
        taxes: [
          {
            description: 'Federal Income Tax',
            amount: entry.tax * 0.7, // Simplified breakdown
            ytdAmount: entry.ytdTax * 0.7
          },
          {
            description: 'Social Security',
            amount: entry.tax * 0.2,
            ytdAmount: entry.ytdTax * 0.2
          },
          {
            description: 'Medicare',
            amount: entry.tax * 0.1,
            ytdAmount: entry.ytdTax * 0.1
          }
        ],
        netPay: entry.netPay,
        grossPay: entry.grossPay,
        totalDeductions: entry.deduction,
        totalTaxes: entry.tax,
        companyInfo: this.settings?.company || {
          name: 'Company',
          address: '',
          phone: '',
          email: ''
        },
        generatedAt: new Date()
      };

      this.payStubs.set(payStub.id, payStub);
      this.emit('payStubGenerated', payStub);

      return payStub;
    } catch (error) {
      throw new Error(`Failed to generate pay stub: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Helper methods
   */
  private formatEmployeeAddress(employee: IEmployee): string {
    const primaryAddress = employee.addresses.find(addr => addr.isPrimary);
    if (!primaryAddress) return '';
    
    return `${primaryAddress.street}, ${primaryAddress.city}, ${primaryAddress.state} ${primaryAddress.zipCode}`;
  }

  private calculateWorkDays(period: PayrollPeriod): number {
    const days = Math.ceil((period.endDate.getTime() - period.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    let workDays = 0;
    
    for (let i = 0; i < days; i++) {
      const date = new Date(period.startDate);
      date.setDate(date.getDate() + i);
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not weekend
        workDays++;
      }
    }
    
    return workDays;
  }

  private getRegularHoursForPeriod(period: PayrollPeriod): number {
    return this.calculateWorkDays(period) * 8; // 8 hours per work day
  }

  // These would integrate with time tracking, leave management, and holiday systems
  private async getWorkedDays(employee: IEmployee, period: PayrollPeriod): Promise<number> {
    return this.calculateWorkDays(period); // Simplified
  }

  private async getLeaveDays(employee: IEmployee, period: PayrollPeriod): Promise<number> {
    return 0; // Would integrate with leave management
  }

  private async getSickDays(employee: IEmployee, period: PayrollPeriod): Promise<number> {
    return 0; // Would integrate with sick leave tracking
  }

  private async getHolidayDays(period: PayrollPeriod): Promise<number> {
    return 0; // Would integrate with holiday calendar
  }

  private async getUnpaidDays(employee: IEmployee, period: PayrollPeriod): Promise<number> {
    return 0; // Would calculate based on attendance
  }

  private async getHoursWorked(employee: IEmployee, period: PayrollPeriod): Promise<number> {
    return this.getRegularHoursForPeriod(period); // Simplified
  }

  private async getRegularHours(employee: IEmployee, period: PayrollPeriod): Promise<number> {
    return this.getRegularHoursForPeriod(period); // Simplified
  }

  private async calculateBonus(employee: IEmployee, period: PayrollPeriod): Promise<number> {
    // Would integrate with bonus calculation logic
    return 0;
  }

  private async calculateCommission(employee: IEmployee, period: PayrollPeriod): Promise<number> {
    // Would integrate with commission calculation
    return employee.totalCommission || 0;
  }

  private async calculateAllowances(employee: IEmployee, period: PayrollPeriod): Promise<number> {
    // Would integrate with allowance calculation
    return 0;
  }

  /**
   * Get payroll periods
   */
  getPayrollPeriods(options: {
    year?: number;
    quarter?: number;
    status?: string;
  } = {}): PayrollPeriod[] {
    let periods = Array.from(this.periods.values());

    if (options.year) {
      periods = periods.filter(p => p.fiscalYear === options.year);
    }

    if (options.quarter) {
      periods = periods.filter(p => p.quarter === options.quarter);
    }

    if (options.status) {
      periods = periods.filter(p => p.status === options.status);
    }

    return periods.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
  }

  /**
   * Get payroll entries
   */
  getPayrollEntries(options: {
    employeeId?: string;
    periodId?: string;
    status?: string;
  } = {}): PayrollEntry[] {
    let entries = Array.from(this.entries.values());

    if (options.employeeId) {
      entries = entries.filter(e => e.employeeId === options.employeeId);
    }

    if (options.periodId) {
      entries = entries.filter(e => e.periodId === options.periodId);
    }

    if (options.status) {
      entries = entries.filter(e => e.status === options.status);
    }

    return entries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get payroll settings
   */
  getPayrollSettings(): PayrollSettings | null {
    return this.settings;
  }

  /**
   * Update payroll settings
   */
  updatePayrollSettings(updates: Partial<PayrollSettings>, updatedBy: string): PayrollSettings {
    if (!this.settings) {
      throw new Error('Payroll settings not initialized');
    }

    this.settings = {
      ...this.settings,
      ...updates,
      updatedAt: new Date(),
      updatedBy
    };

    this.emit('settingsUpdated', this.settings);
    return this.settings;
  }

  /**
   * Get payroll analytics
   */
  async getPayrollAnalytics(dateFrom?: Date, dateTo?: Date): Promise<{
    totalPayroll: number;
    totalEmployees: number;
    averagePay: number;
    overtimeCost: number;
    taxLiability: number;
    benefitCost: number;
    departmentBreakdown: any;
    monthlyTrends: any;
  }> {
    const entries = this.getPayrollEntries();
    const filteredEntries = dateFrom || dateTo ? 
      entries.filter(e => {
        const entry = this.entries.get(e.id);
        const createdAt = entry?.createdAt;
        if (!createdAt) return false;
        if (dateFrom && createdAt < dateFrom) return false;
        if (dateTo && createdAt > dateTo) return false;
        return true;
      }) : entries;

    const totalPayroll = filteredEntries.reduce((sum, e) => sum + e.grossPay, 0);
    const totalEmployees = new Set(filteredEntries.map(e => e.employeeId)).size;
    const averagePay = totalEmployees > 0 ? totalPayroll / totalEmployees : 0;
    const overtimeCost = filteredEntries.reduce((sum, e) => sum + e.overtimePay, 0);
    const taxLiability = filteredEntries.reduce((sum, e) => sum + e.tax, 0);
    const benefitCost = filteredEntries.reduce((sum, e) => sum + e.insurance + e.retirement, 0);

    return {
      totalPayroll,
      totalEmployees,
      averagePay,
      overtimeCost,
      taxLiability,
      benefitCost,
      departmentBreakdown: {}, // Would need employee department data
      monthlyTrends: {} // Would need monthly grouping
    };
  }
}

export const payrollService = new PayrollService();
export default payrollService;
