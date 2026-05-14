import { Expense, IExpense } from '../models/Expense';
import { ExpenseCategory } from '../models/ExpenseCategory';
import { User } from '../models/User';

export interface PerDiemLocation {
  locationId: string;
  locationName: string;
  country: string;
  state?: string;
  city: string;
  county?: string;
  
  // Location Classification
  classification: 'standard' | 'high_cost' | 'international' | 'remote';
  tier: number; // 1-5, where 5 is highest cost
  
  // Coordinates
  coordinates: {
    latitude: number;
    longitude: number;
  };
  
  // Per Diem Rates
  rates: {
    fullDay: number;
    breakfast: number;
    lunch: number;
    dinner: number;
    incidentals: number;
    lodging: number;
  };
  
  // Rate History
  rateHistory: Array<{
    effectiveDate: Date;
    expirationDate?: Date;
    fullDay: number;
    breakfast: number;
    lunch: number;
    dinner: number;
    incidentals: number;
    lodging: number;
    reason: string;
    updatedBy: string;
  }>;
  
  // Government Rates
  governmentRates: {
    gsaRate?: number; // US General Services Administration
    stateRate?: number;
    foreignRate?: number; // Department of State
    lastUpdated: Date;
  };
  
  // Seasonal Adjustments
  seasonalAdjustments: Array<{
    startDate: Date;
    endDate: Date;
    adjustmentType: 'percentage' | 'fixed';
    adjustmentValue: number;
    reason: string;
  }>;
  
  // Special Events
  specialEvents: Array<{
    eventId: string;
    eventName: string;
    startDate: Date;
    endDate: Date;
    adjustedRates: {
      fullDay: number;
      breakfast: number;
      lunch: number;
      dinner: number;
      incidentals: number;
    };
    reason: string;
  }>;
  
  // Status
  status: 'active' | 'inactive' | 'seasonal' | 'special_event';
  
  // Metadata
  metadata: {
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
    lastReviewed?: Date;
    reviewedBy?: string;
    notes?: string;
  };
}

export interface PerDiemRequest {
  requestId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  
  // Trip Information
  tripId?: string;
  tripName?: string;
  businessPurpose: string;
  
  // Travel Dates
  departureDate: Date;
  returnDate: Date;
  totalDays: number;
  
  // Locations
  locations: Array<{
    locationId: string;
    locationName: string;
    arrivalDate: Date;
    departureDate: Date;
    days: number;
    rate: PerDiemLocation['rates'];
    dailyTotal: number;
    totalAmount: number;
  }>;
  
  // Meal Deductions
  mealDeductions: Array<{
    date: Date;
    mealType: 'breakfast' | 'lunch' | 'dinner';
    providedBy: string;
    deductionAmount: number;
    reason: string;
  }>;
  
  // Lodging
  lodgingProvided: boolean;
  lodgingProvider?: string;
  lodgingDeductionDays: number;
  lodgingDeductionAmount: number;
  
  // Calculations
  calculations: {
    totalFullDays: number;
    totalPartialDays: number;
    totalMealsDeducted: number;
    totalLodgingDeducted: number;
    grossPerDiem: number;
    totalDeductions: number;
    netPerDiem: number;
    currency: string;
  };
  
  // Approvals
  approvals: Array<{
    approverId: string;
    approverName: string;
    approverRole: string;
    status: 'pending' | 'approved' | 'rejected';
    date?: Date;
    comments?: string;
  }>;
  
  // Status
  status: 'draft' | 'submitted' | 'pending_approval' | 'approved' | 'rejected' | 'processed';
  submittedAt?: Date;
  submittedBy?: string;
  approvedAt?: Date;
  approvedBy?: string;
  
  // Expense Integration
  expenseId?: string;
  processedAt?: Date;
  
  // Attachments
  attachments: Array<{
    attachmentId: string;
    name: string;
    type: 'itinerary' | 'receipt' | 'documentation' | 'other';
    url: string;
    uploadedAt: Date;
    description?: string;
  }>;
  
  // Audit Trail
  auditTrail: Array<{
    timestamp: Date;
    action: string;
    performedBy: string;
    details: string;
    previousValues?: Record<string, any>;
    newValues?: Record<string, any>;
  }>;
  
  // Metadata
  metadata: {
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
    version: number;
  };
}

export interface PerDiemPolicy {
  policyId: string;
  name: string;
  description: string;
  version: number;
  
  // Applicability
  appliesTo: {
    departments?: string[];
    roles?: string[];
    employeeTypes?: string[];
    locations?: string[];
  };
  
  // General Rules
  rules: {
    minimumTripDuration: number; // hours
    maximumTripDuration: number; // days
    requiresApproval: boolean;
    approvalThreshold: number; // amount
    requiresItinerary: boolean;
    requiresReceipts: boolean;
    advanceNotice: number; // days
  };
  
  // Partial Day Rules
  partialDayRules: {
    lessThan4Hours: number; // percentage of full rate
    between4And8Hours: number;
    between8And12Hours: number;
    moreThan12Hours: number;
    departureDayRule: 'full' | 'partial' | 'none';
    arrivalDayRule: 'full' | 'partial' | 'none';
  };
  
  // Meal Deduction Rules
  mealDeductionRules: {
    breakfastDeduction: number;
    lunchDeduction: number;
    dinnerDeduction: number;
    requiresDocumentation: boolean;
    acceptableProviders: string[];
    maxDeductionsPerDay: number;
  };
  
  // Lodging Rules
  lodgingRules: {
    requiresLodgingReceipt: boolean;
    maxLodgingRate?: number;
    lodgingNotRequiredFor: Array<{
      distance: number; // miles from home
      reason: string;
    }>;
    sharedLodgingRate: number; // percentage for shared rooms
  };
  
  // International Rules
  internationalRules: {
    currencyConversion: 'daily' | 'transaction' | 'average';
    conversionSource: 'xe' | 'oanda' | 'bank_rate' | 'company_rate';
    receiptRequirement: 'original' | 'copy' | 'none';
    additionalDocumentation: string[];
    emergencyContactRequired: boolean;
  };
  
  // Special Circumstances
  specialCircumstances: {
    conferences: {
      perDiemReduction: number; // percentage
      mealsIncluded: boolean;
      requiresConferenceDocumentation: boolean;
    };
    training: {
      perDiemRate: 'full' | 'reduced' | 'none';
      mealsProvided: boolean;
      lodgingProvided: boolean;
    };
    recruitment: {
      perDiemMultiplier: number;
      additionalExpenses: string[];
    };
  };
  
  // Compliance
  compliance: {
    requiresPolicyAcknowledgment: boolean;
    auditFrequency: 'random' | 'monthly' | 'quarterly';
    requiredDocumentation: string[];
    retentionPeriod: number; // days
  };
  
  // Status
  status: 'draft' | 'active' | 'inactive' | 'archived';
  effectiveDate: Date;
  expirationDate?: Date;
  
  // Metadata
  metadata: {
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
    lastReviewed?: Date;
    reviewedBy?: string;
  };
}

export interface PerDiemAnalytics {
  period: {
    startDate: Date;
    endDate: Date;
  };
  
  // Overview
  overview: {
    totalRequests: number;
    approvedRequests: number;
    totalAmount: number;
    averagePerDiem: number;
    averageTripDuration: number;
    approvalRate: number;
  };
  
  // Location Analysis
  locationAnalysis: {
    topLocations: Array<{
      locationId: string;
      locationName: string;
      requests: number;
      totalAmount: number;
      averageDailyRate: number;
      averageDuration: number;
    }>;
    rateUtilization: Array<{
      locationId: string;
      locationName: string;
      standardRate: number;
      averagePaid: number;
      utilizationRate: number;
    }>;
    seasonalTrends: Array<{
      month: string;
      totalRequests: number;
      totalAmount: number;
      topDestination: string;
    }>;
  };
  
  // Department Analysis
  departmentAnalysis: {
    spendingByDepartment: Array<{
      department: string;
      requests: number;
      totalAmount: number;
      averagePerTrip: number;
      averageDuration: number;
    }>;
    complianceByDepartment: Array<{
      department: string;
      totalRequests: number;
      compliantRequests: number;
      complianceRate: number;
      commonViolations: string[];
    }>;
  };
  
  // Policy Effectiveness
  policyEffectiveness: {
    deductionAccuracy: {
      totalDeductions: number;
      correctDeductions: number;
      accuracyRate: number;
      commonErrors: Array<{
        error: string;
        count: number;
        percentage: number;
      }>;
    };
    approvalEfficiency: {
      averageApprovalTime: number; // hours
      approvalRate: number;
      rejectionReasons: Array<{
        reason: string;
        count: number;
        percentage: number;
      }>;
    };
    costSavings: {
      totalSavings: number;
      savingsFromDeductions: number;
      savingsFromPolicyCompliance: number;
      potentialSavings: number;
    };
  };
  
  // Trends
  trends: {
    monthlySpending: Array<{
      month: string;
      requests: number;
      amount: number;
      averagePerDiem: number;
    }>;
    durationTrends: Array<{
      duration: string;
      count: number;
      percentage: number;
    }>;
    seasonalPatterns: Array<{
      season: string;
      requests: number;
      amount: number;
      topDestinations: string[];
    }>;
  };
  
  // Recommendations
  recommendations: Array<{
    type: 'rate_adjustment' | 'policy_update' | 'training' | 'compliance';
    priority: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    impact: string;
    potentialSavings?: number;
  }>;
}

export class PerDiemService {
  // Create per diem location
  async createPerDiemLocation(params: {
    locationName: string;
    country: string;
    state?: string;
    city: string;
    county?: string;
    classification: 'standard' | 'high_cost' | 'international' | 'remote';
    tier: number;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    rates: {
      fullDay: number;
      breakfast: number;
      lunch: number;
      dinner: number;
      incidentals: number;
      lodging: number;
    };
    governmentRates?: {
      gsaRate?: number;
      stateRate?: number;
      foreignRate?: number;
    };
    createdBy: string;
  }): Promise<PerDiemLocation> {
    const locationId = `LOC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const location: PerDiemLocation = {
      locationId,
      locationName: params.locationName,
      country: params.country,
      state: params.state,
      city: params.city,
      county: params.county,
      
      classification: params.classification,
      tier: params.tier,
      
      coordinates: params.coordinates,
      
      rates: params.rates,
      
      rateHistory: [{
        effectiveDate: new Date(),
        fullDay: params.rates.fullDay,
        breakfast: params.rates.breakfast,
        lunch: params.rates.lunch,
        dinner: params.rates.dinner,
        incidentals: params.rates.incidentals,
        lodging: params.rates.lodging,
        reason: 'Initial rate setup',
        updatedBy: params.createdBy
      }],
      
      governmentRates: {
        ...params.governmentRates,
        lastUpdated: new Date()
      },
      
      seasonalAdjustments: [],
      specialEvents: [],
      
      status: 'active',
      
      metadata: {
        createdAt: new Date(),
        createdBy: params.createdBy,
        updatedAt: new Date(),
        updatedBy: params.createdBy
      }
    };
    
    // Save location
    await this.savePerDiemLocation(location);
    
    return location;
  }
  
  // Create per diem request
  async createPerDiemRequest(params: {
    employeeId: string;
    tripId?: string;
    tripName?: string;
    businessPurpose: string;
    departureDate: Date;
    returnDate: Date;
    locations: Array<{
      locationId: string;
      arrivalDate: Date;
      departureDate: Date;
    }>;
    lodgingProvided?: boolean;
    lodgingProvider?: string;
    mealDeductions?: Array<{
      date: Date;
      mealType: 'breakfast' | 'lunch' | 'dinner';
      providedBy: string;
      reason: string;
    }>;
    attachments?: Array<{
      name: string;
      type: 'itinerary' | 'receipt' | 'documentation' | 'other';
      url: string;
      description?: string;
    }>;
    createdBy: string;
  }): Promise<PerDiemRequest> {
    // Validate employee
    const employee = await User.findById(params.employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }
    
    // Validate dates
    if (params.returnDate <= params.departureDate) {
      throw new Error('Return date must be after departure date');
    }
    
    const requestId = `PERDIEM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const totalDays = Math.ceil((params.returnDate.getTime() - params.departureDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // Get location rates
    const locationRates = [];
    let grossPerDiem = 0;
    
    for (const locationData of params.locations) {
      const location = await this.getPerDiemLocation(locationData.locationId);
      if (!location) {
        throw new Error(`Location not found: ${locationData.locationId}`);
      }
      
      const days = Math.ceil((locationData.departureDate.getTime() - locationData.arrivalDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const dailyTotal = location.rates.fullDay;
      const totalAmount = dailyTotal * days;
      
      locationRates.push({
        locationId: location.locationId,
        locationName: location.locationName,
        arrivalDate: locationData.arrivalDate,
        departureDate: locationData.departureDate,
        days,
        rate: location.rates,
        dailyTotal,
        totalAmount
      });
      
      grossPerDiem += totalAmount;
    }
    
    // Calculate meal deductions
    const mealDeductions = params.mealDeductions?.map(deduction => ({
      date: deduction.date,
      mealType: deduction.mealType,
      providedBy: deduction.providedBy,
      deductionAmount: this.getMealDeductionAmount(deduction.mealType, locationRates),
      reason: deduction.reason
    })) || [];
    
    const totalMealDeductions = mealDeductions.reduce((sum, deduction) => sum + deduction.deductionAmount, 0);
    
    // Calculate lodging deductions
    const lodgingDeductionDays = params.lodgingProvided ? totalDays : 0;
    const lodgingDeductionAmount = lodgingDeductionDays * 50; // Mock daily lodging deduction
    
    const totalDeductions = totalMealDeductions + lodgingDeductionAmount;
    const netPerDiem = grossPerDiem - totalDeductions;
    
    const request: PerDiemRequest = {
      requestId,
      employeeId: params.employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      department: employee.department || 'Unknown',
      
      tripId: params.tripId,
      tripName: params.tripName,
      businessPurpose: params.businessPurpose,
      
      departureDate: params.departureDate,
      returnDate: params.returnDate,
      totalDays,
      
      locations: locationRates,
      
      mealDeductions,
      
      lodgingProvided: params.lodgingProvided || false,
      lodgingProvider: params.lodgingProvider,
      lodgingDeductionDays,
      lodgingDeductionAmount,
      
      calculations: {
        totalFullDays: totalDays,
        totalPartialDays: 0,
        totalMealsDeducted: mealDeductions.length,
        totalLodgingDeducted: lodgingDeductionDays,
        grossPerDiem,
        totalDeductions,
        netPerDiem,
        currency: 'USD'
      },
      
      approvals: [],
      
      status: 'draft',
      
      attachments: params.attachments?.map((att, index) => ({
        attachmentId: `ATT-${Date.now()}-${index}`,
        ...att,
        uploadedAt: new Date()
      })) || [],
      
      auditTrail: [{
        timestamp: new Date(),
        action: 'Request Created',
        performedBy: params.createdBy,
        details: `Per diem request created for ${totalDays} days`
      }],
      
      metadata: {
        createdAt: new Date(),
        createdBy: params.createdBy,
        updatedAt: new Date(),
        updatedBy: params.createdBy,
        version: 1
      }
    };
    
    // Save request
    await this.savePerDiemRequest(request);
    
    return request;
  }
  
  // Submit per diem request
  async submitPerDiemRequest(requestId: string, submittedBy: string): Promise<PerDiemRequest> {
    const request = await this.getPerDiemRequest(requestId);
    if (!request) {
      throw new Error('Per diem request not found');
    }
    
    if (request.status !== 'draft') {
      throw new Error('Only draft requests can be submitted');
    }
    
    // Validate request
    await this.validatePerDiemRequest(request);
    
    request.status = 'submitted';
    request.submittedAt = new Date();
    request.submittedBy = submittedBy;
    
    // Add audit entry
    request.auditTrail.push({
      timestamp: new Date(),
      action: 'Request Submitted',
      performedBy: submittedBy,
      details: 'Per diem request submitted for approval'
    });
    
    // Initialize approval workflow if needed
    const policy = await this.getApplicablePolicy(request.employeeId);
    if (policy?.rules.requiresApproval || request.calculations.netPerDiem > policy?.rules.approvalThreshold) {
      request.status = 'pending_approval';
      await this.initializeApprovalWorkflow(request);
    } else {
      request.status = 'approved';
      request.approvedAt = new Date();
      request.approvedBy = 'system';
    }
    
    await this.updatePerDiemRequest(request);
    
    // Send notifications
    await this.sendPerDiemNotifications(request, 'submitted');
    
    return request;
  }
  
  // Approve per diem request
  async approvePerDiemRequest(requestId: string, approverId: string, comments?: string): Promise<PerDiemRequest> {
    const request = await this.getPerDiemRequest(requestId);
    if (!request) {
      throw new Error('Per diem request not found');
    }
    
    if (request.status !== 'pending_approval') {
      throw new Error('Request is not pending approval');
    }
    
    // Get approver info
    const approver = await User.findById(approverId);
    if (!approver) {
      throw new Error('Approver not found');
    }
    
    // Add approval
    request.approvals.push({
      approverId,
      approverName: `${approver.firstName} ${approver.lastName}`,
      approverRole: approver.role || 'Unknown',
      status: 'approved',
      date: new Date(),
      comments
    });
    
    request.status = 'approved';
    request.approvedAt = new Date();
    request.approvedBy = approverId;
    
    // Add audit entry
    request.auditTrail.push({
      timestamp: new Date(),
      action: 'Request Approved',
      performedBy: approverId,
      details: `Per diem request approved${comments ? `: ${comments}` : ''}`
    });
    
    await this.updatePerDiemRequest(request);
    
    // Create expense if needed
    await this.createExpenseFromPerDiem(request);
    
    // Send notifications
    await this.sendPerDiemNotifications(request, 'approved');
    
    return request;
  }
  
  // Update per diem rates
  async updatePerDiemRates(locationId: string, params: {
    rates: {
      fullDay: number;
      breakfast: number;
      lunch: number;
      dinner: number;
      incidentals: number;
      lodging: number;
    };
    reason: string;
    effectiveDate?: Date;
    updatedBy: string;
  }): Promise<PerDiemLocation> {
    const location = await this.getPerDiemLocation(locationId);
    if (!location) {
      throw new Error('Location not found');
    }
    
    // Add to rate history
    location.rateHistory.push({
      effectiveDate: params.effectiveDate || new Date(),
      fullDay: params.rates.fullDay,
      breakfast: params.rates.breakfast,
      lunch: params.rates.lunch,
      dinner: params.rates.dinner,
      incidentals: params.rates.incidentals,
      lodging: params.rates.lodging,
      reason: params.reason,
      updatedBy: params.updatedBy
    });
    
    // Update current rates
    location.rates = params.rates;
    location.metadata.updatedBy = params.updatedBy;
    location.metadata.updatedAt = new Date();
    
    await this.updatePerDiemLocation(location);
    
    // Send notifications
    await this.sendLocationNotifications(location, 'rates_updated');
    
    return location;
  }
  
  // Get per diem analytics
  async getPerDiemAnalytics(params: {
    startDate: Date;
    endDate: Date;
    department?: string;
    locationId?: string;
  }): Promise<PerDiemAnalytics> {
    // Mock analytics data
    return {
      period: {
        startDate: params.startDate,
        endDate: params.endDate
      },
      
      overview: {
        totalRequests: 500,
        approvedRequests: 450,
        totalAmount: 75000,
        averagePerDiem: 150,
        averageTripDuration: 3.5,
        approvalRate: 90.0
      },
      
      locationAnalysis: {
        topLocations: [
          {
            locationId: 'loc1',
            locationName: 'New York, NY',
            requests: 100,
            totalAmount: 20000,
            averageDailyRate: 200,
            averageDuration: 4
          }
        ],
        rateUtilization: [
          {
            locationId: 'loc1',
            locationName: 'New York, NY',
            standardRate: 200,
            averagePaid: 180,
            utilizationRate: 90.0
          }
        ],
        seasonalTrends: [
          { month: '2024-01', totalRequests: 40, totalAmount: 6000, topDestination: 'New York, NY' },
          { month: '2024-02', totalRequests: 45, totalAmount: 7000, topDestination: 'Chicago, IL' }
        ]
      },
      
      departmentAnalysis: {
        spendingByDepartment: [
          {
            department: 'Sales',
            requests: 200,
            totalAmount: 35000,
            averagePerTrip: 175,
            averageDuration: 4
          }
        ],
        complianceByDepartment: [
          {
            department: 'Sales',
            totalRequests: 200,
            compliantRequests: 190,
            complianceRate: 95.0,
            commonViolations: ['Missing receipts', 'Incorrect meal deductions']
          }
        ]
      },
      
      policyEffectiveness: {
        deductionAccuracy: {
          totalDeductions: 500,
          correctDeductions: 450,
          accuracyRate: 90.0,
          commonErrors: [
            { error: 'Incorrect breakfast deduction', count: 30, percentage: 6.0 },
            { error: 'Missing meal documentation', count: 20, percentage: 4.0 }
          ]
        },
        approvalEfficiency: {
          averageApprovalTime: 24,
          approvalRate: 90.0,
          rejectionReasons: [
            { reason: 'Insufficient documentation', count: 30, percentage: 60.0 },
            { reason: 'Policy violation', count: 20, percentage: 40.0 }
          ]
        },
        costSavings: {
          totalSavings: 10000,
          savingsFromDeductions: 7000,
          savingsFromPolicyCompliance: 3000,
          potentialSavings: 5000
        }
      },
      
      trends: {
        monthlySpending: [
          { month: '2024-01', requests: 40, amount: 6000, averagePerDiem: 150 },
          { month: '2024-02', requests: 45, amount: 7000, averagePerDiem: 155.6 }
        ],
        durationTrends: [
          { duration: '1-2 days', count: 200, percentage: 40.0 },
          { duration: '3-5 days', count: 250, percentage: 50.0 },
          { duration: '6+ days', count: 50, percentage: 10.0 }
        ],
        seasonalPatterns: [
          {
            season: 'Q1',
            requests: 150,
            amount: 22500,
            topDestinations: ['New York, NY', 'Chicago, IL', 'Boston, MA']
          }
        ]
      },
      
      recommendations: [
        {
          type: 'rate_adjustment',
          priority: 'medium',
          description: 'Consider adjusting rates for high-cost locations',
          impact: 'Improve employee satisfaction and compliance',
          potentialSavings: 2000
        }
      ]
    };
  }
  
  // Helper methods
  private getMealDeductionAmount(mealType: 'breakfast' | 'lunch' | 'dinner', locationRates: any[]): number {
    // Mock deduction amounts
    const deductionRates = {
      breakfast: 15,
      lunch: 20,
      dinner: 25
    };
    return deductionRates[mealType] || 0;
  }
  
  private async validatePerDiemRequest(request: PerDiemRequest): Promise<void> {
    // Mock validation
    if (request.calculations.netPerDiem < 0) {
      throw new Error('Net per diem cannot be negative');
    }
    
    if (request.locations.length === 0) {
      throw new Error('At least one location must be specified');
    }
  }
  
  private async getApplicablePolicy(employeeId: string): Promise<PerDiemPolicy | null> {
    // Mock policy lookup
    return null;
  }
  
  private async initializeApprovalWorkflow(request: PerDiemRequest): Promise<void> {
    // Mock approval workflow initialization
    request.approvals = [
      {
        approverId: 'manager_123',
        approverName: 'Manager Name',
        approverRole: 'manager',
        status: 'pending'
      }
    ];
  }
  
  private async createExpenseFromPerDiem(request: PerDiemRequest): Promise<void> {
    // Mock expense creation
    const expense = {
      expenseId: `EXP-${Date.now()}`,
      title: `Per Diem - ${request.tripName || 'Business Travel'}`,
      amount: request.calculations.netPerDiem,
      totalAmount: request.calculations.netPerDiem,
      date: request.departureDate,
      employeeId: request.employeeId,
      status: 'approved',
      source: 'per_diem',
      sourceReference: request.requestId
    };
    
    request.expenseId = expense.expenseId;
    request.processedAt = new Date();
  }
  
  // Database operations (mock implementations)
  private async savePerDiemLocation(location: PerDiemLocation): Promise<void> {
    console.log(`Saving per diem location ${location.locationId}`);
  }
  
  private async updatePerDiemLocation(location: PerDiemLocation): Promise<void> {
    console.log(`Updating per diem location ${location.locationId}`);
  }
  
  private async getPerDiemLocation(locationId: string): Promise<PerDiemLocation | null> {
    // Mock implementation
    return null;
  }
  
  private async savePerDiemRequest(request: PerDiemRequest): Promise<void> {
    console.log(`Saving per diem request ${request.requestId}`);
  }
  
  private async updatePerDiemRequest(request: PerDiemRequest): Promise<void> {
    console.log(`Updating per diem request ${request.requestId}`);
  }
  
  private async getPerDiemRequest(requestId: string): Promise<PerDiemRequest | null> {
    // Mock implementation
    return null;
  }
  
  private async sendPerDiemNotifications(request: PerDiemRequest, action: string): Promise<void> {
    console.log(`Sending ${action} notifications for per diem request ${request.requestId}`);
  }
  
  private async sendLocationNotifications(location: PerDiemLocation, action: string): Promise<void> {
    console.log(`Sending ${action} notifications for location ${location.locationId}`);
  }
}
