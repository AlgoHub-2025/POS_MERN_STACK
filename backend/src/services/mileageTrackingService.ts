import { Expense, IExpense } from '../models/Expense';
import { User } from '../models/User';

export interface MileageTrip {
  tripId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  
  // Trip Details
  tripName: string;
  businessPurpose: string;
  tripDate: Date;
  
  // Route Information
  route: {
    startPoint: {
      address: string;
      latitude: number;
      longitude: number;
      odometerStart: number;
      timestamp: Date;
    };
    endPoint: {
      address: string;
      latitude: number;
      longitude: number;
      odometerEnd: number;
      timestamp: Date;
    };
    waypoints: Array<{
      address: string;
      latitude: number;
      longitude: number;
      odometerReading: number;
      timestamp: Date;
      purpose: string;
    }>;
    totalDistance: {
      miles: number;
      kilometers: number;
      calculatedBy: 'manual' | 'gps' | 'odometer' | 'route_optimization';
    };
    estimatedDistance?: {
      miles: number;
      kilometers: number;
      provider: 'google' | 'mapbox' | 'here' | 'openstreetmap';
    };
    routeOptimized: boolean;
    actualVsEstimated: {
      difference: number;
      percentage: number;
      reason?: string;
    };
  };
  
  // Vehicle Information
  vehicle: {
    vehicleId?: string;
    make?: string;
    model?: string;
    year?: number;
    licensePlate?: string;
    vehicleType: 'personal' | 'company' | 'rental' | 'lease';
    fuelType?: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
    ownership: 'employee' | 'company' | 'rental';
  };
  
  // Mileage Rate
  mileageRate: {
    rate: number; // per mile/km
    rateType: 'standard' | 'custom' | 'irs' | 'company';
    effectiveDate: Date;
    currency: string;
  };
  
  // Financial Calculations
  calculations: {
    businessMiles: number;
    personalMiles: number;
    totalMiles: number;
    businessPercentage: number;
    reimbursementAmount: number;
    currency: string;
  };
  
  // Time Tracking
  timeTracking: {
    startTime: Date;
    endTime: Date;
    totalDuration: number; // minutes
    drivingTime: number; // minutes
    stopTime: number; // minutes
    averageSpeed: number; // mph
  };
  
  // Purpose and Classification
  classification: {
    tripType: 'client_visit' | 'office_visit' | 'training' | 'conference' | 'meeting' | 'other';
    clientCode?: string;
    projectCode?: string;
    billable: boolean;
    billableTo?: string;
    costCenter?: string;
  };
  
  // Documentation
  documentation: {
    odometerPhotoRequired: boolean;
    odometerPhotoProvided: boolean;
    odometerPhotos: Array<{
      photoId: string;
      type: 'start' | 'end' | 'waypoint';
      url: string;
      uploadedAt: Date;
      mileage: number;
    }>;
    routeMapRequired: boolean;
    routeMapProvided: boolean;
    routeMapUrl?: string;
    receiptsRequired: boolean;
    receipts: Array<{
      receiptId: string;
      type: 'fuel' | 'toll' | 'parking' | 'other';
      amount: number;
      url: string;
      uploadedAt: Date;
    }>;
    notes?: string;
  };
  
  // Validation and Compliance
  validation: {
    isValid: boolean;
    validationScore: number; // 0-100
    issues: Array<{
      type: 'missing_documentation' | 'unrealistic_distance' | 'inconsistent_odometer' | 'policy_violation';
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      autoResolved: boolean;
    }>;
    policyCompliance: {
      compliant: boolean;
      violations: Array<{
        policyId: string;
        policyName: string;
        description: string;
        action: 'warning' | 'block' | 'require_approval';
      }>;
    };
  };
  
  // GPS Tracking (if available)
  gpsTracking: {
    enabled: boolean;
    trackingMethod: 'mobile_app' | 'vehicle_device' | 'manual';
    trackedDistance: number;
    routeAccuracy: number; // percentage
    gpsPoints: Array<{
      timestamp: Date;
      latitude: number;
      longitude: number;
      speed: number;
      accuracy: number;
    }>;
  };
  
  // Status
  status: 'draft' | 'submitted' | 'pending_approval' | 'approved' | 'rejected' | 'processed';
  submittedAt?: Date;
  submittedBy?: string;
  approvedAt?: Date;
  approvedBy?: string;
  
  // Expense Integration
  expenseId?: string;
  processedAt?: Date;
  
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
    source: 'mobile_app' | 'web' | 'api' | 'import';
  };
}

export interface MileageRate {
  rateId: string;
  name: string;
  description: string;
  
  // Rate Configuration
  rateType: 'standard' | 'custom' | 'irs' | 'company';
  rate: number;
  unit: 'mile' | 'kilometer';
  currency: string;
  
  // Applicability
  appliesTo: {
    vehicleTypes?: Array<'personal' | 'company' | 'rental' | 'lease'>;
    employeeTypes?: string[];
    departments?: string[];
    tripTypes?: Array<'client_visit' | 'office_visit' | 'training' | 'conference' | 'meeting' | 'other'>;
  };
  
  // Effective Period
  effectiveDate: Date;
  expirationDate?: Date;
  
  // Rate History
  rateHistory: Array<{
    effectiveDate: Date;
    rate: number;
    reason: string;
    updatedBy: string;
  }>;
  
  // IRS Reference (if applicable)
  irsReference?: {
    year: number;
    standardRate: number;
    source: 'notice' | 'revenue_procedure';
    publicationDate: Date;
  };
  
  // Status
  status: 'active' | 'inactive' | 'expired';
  
  // Usage Statistics
  usage: {
    totalTrips: number;
    totalMiles: number;
    totalReimbursement: number;
    lastUsed?: Date;
  };
  
  // Metadata
  metadata: {
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
  };
}

export interface MileagePolicy {
  policyId: string;
  name: string;
  description: string;
  version: number;
  
  // General Rules
  rules: {
    minimumTripDistance: number; // miles
    maximumDailyMiles?: number;
    maximumWeeklyMiles?: number;
    maximumMonthlyMiles?: number;
    requiresOdometerPhotos: boolean;
    requiresRouteMap: boolean;
    requiresGPSValidation: boolean;
    commutingMilesExcluded: boolean;
    personalUseDeduction: number; // percentage
  };
  
  // Documentation Requirements
  documentation: {
    odometerPhoto: {
      required: boolean;
      frequency: 'start_end' | 'waypoints' | 'daily';
      quality: 'photo' | 'readable' | 'clear';
    };
    routeMap: {
      required: boolean;
      source: 'gps' | 'manual' | 'mapping_service';
      accuracy: number; // percentage
    };
    receipts: {
      required: boolean;
      types: Array<'fuel' | 'toll' | 'parking'>;
      minimumAmount?: number;
    };
    notes: {
      required: boolean;
      minLength?: number;
    };
  };
  
  // Validation Rules
  validation: {
    distanceValidation: {
      enabled: boolean;
      tolerance: number; // percentage
      requireExplanation: boolean;
    };
    odometerValidation: {
      enabled: boolean;
      maxDecrease: number; // miles
      maxIncrease: number; // miles
    };
    timeValidation: {
      enabled: boolean;
      maxSpeed: number; // mph
      minSpeed: number; // mph
    };
    routeValidation: {
      enabled: boolean;
      requireBusinessPurpose: boolean;
      excludeResidential: boolean;
    };
  };
  
  // Rate Rules
  rateRules: {
    defaultRate: string; // rateId
    specialRates: Array<{
      condition: string;
      rateId: string;
      multiplier: number;
    }>;
    weekendRate?: string;
    holidayRate?: string;
    overtimeRate?: string;
  };
  
  // Approval Rules
  approval: {
    required: boolean;
    threshold: number; // amount
    approvers: string[];
    autoApprovalConditions: Array<{
      condition: string;
      value: any;
    }>;
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

export interface MileageAnalytics {
  period: {
    startDate: Date;
    endDate: Date;
  };
  
  // Overview
  overview: {
    totalTrips: number;
    totalMiles: number;
    totalReimbursement: number;
    averageTripDistance: number;
    averageReimbursement: number;
    averageRate: number;
    complianceRate: number;
  };
  
  // Usage Analysis
  usageAnalysis: {
    tripsByMonth: Array<{
      month: string;
      trips: number;
      miles: number;
      reimbursement: number;
    }>;
    tripsByDayOfWeek: Array<{
      day: string;
      trips: number;
      miles: number;
    }>;
    tripsByHour: Array<{
      hour: number;
      trips: number;
      miles: number;
    }>;
    topDestinations: Array<{
      address: string;
      visits: number;
      totalMiles: number;
    }>;
  };
  
  // Employee Analysis
  employeeAnalysis: {
    topMileageEmployees: Array<{
      employeeId: string;
      employeeName: string;
      department: string;
      trips: number;
      miles: number;
      reimbursement: number;
      averageTripDistance: number;
    }>;
    departmentUsage: Array<{
      department: string;
      employees: number;
      trips: number;
      miles: number;
      reimbursement: number;
    }>;
    complianceByEmployee: Array<{
      employeeId: string;
      employeeName: string;
      totalTrips: number;
      compliantTrips: number;
      complianceRate: number;
      commonIssues: string[];
    }>;
  };
  
  // Vehicle Analysis
  vehicleAnalysis: {
    usageByVehicleType: Array<{
      vehicleType: string;
      trips: number;
      miles: number;
      percentage: number;
    }>;
    personalVsCompany: {
      personal: { trips: number; miles: number; percentage: number };
      company: { trips: number; miles: number; percentage: number };
    };
    fuelEfficiency: Array<{
      vehicleId?: string;
      vehicleType: string;
      mpg: number;
      totalMiles: number;
      fuelCost: number;
    }>;
  };
  
  // Route Analysis
  routeAnalysis: {
    averageTripDistance: number;
    longestTrips: Array<{
      tripId: string;
      distance: number;
      startAddress: string;
      endAddress: string;
    }>;
    mostFrequentRoutes: Array<{
      route: string;
      count: number;
      totalMiles: number;
    }>;
    routeOptimization: {
      optimizedTrips: number;
      potentialSavings: number;
      optimizationRate: number;
    };
  };
  
  // Compliance Analysis
  complianceAnalysis: {
    overallCompliance: {
      compliantTrips: number;
      nonCompliantTrips: number;
      complianceRate: number;
    };
    commonViolations: Array<{
      violation: string;
      count: number;
      percentage: number;
    }>;
    documentationIssues: Array<{
      issue: string;
      count: number;
      percentage: number;
    }>;
    validationScores: {
      average: number;
      distribution: Array<{
        range: string;
        count: number;
        percentage: number;
      }>;
    };
  };
  
  // Financial Analysis
  financialAnalysis: {
    reimbursementTrends: Array<{
      month: string;
      amount: number;
      trips: number;
      averagePerTrip: number;
    }>;
    rateUsage: Array<{
      rateId: string;
      rateName: string;
      usage: number;
      totalAmount: number;
    }>;
    costSavings: {
      routeOptimization: number;
      policyCompliance: number;
      validationCatches: number;
      totalSavings: number;
    };
  };
  
  // Recommendations
  recommendations: Array<{
    type: 'policy_update' | 'rate_adjustment' | 'training' | 'process_improvement';
    priority: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    impact: string;
    potentialSavings?: number;
    affectedEmployees?: number;
  }>;
}

export class MileageTrackingService {
  // Create mileage trip
  async createMileageTrip(params: {
    employeeId: string;
    tripName: string;
    businessPurpose: string;
    tripDate: Date;
    startPoint: {
      address: string;
      latitude: number;
      longitude: number;
      odometerStart: number;
      timestamp: Date;
    };
    endPoint: {
      address: string;
      latitude: number;
      longitude: number;
      odometerEnd: number;
      timestamp: Date;
    };
    waypoints?: Array<{
      address: string;
      latitude: number;
      longitude: number;
      odometerReading: number;
      timestamp: Date;
      purpose: string;
    }>;
    vehicle: {
      vehicleId?: string;
      make?: string;
      model?: string;
      year?: number;
      licensePlate?: string;
      vehicleType: 'personal' | 'company' | 'rental' | 'lease';
      fuelType?: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
      ownership: 'employee' | 'company' | 'rental';
    };
    mileageRate?: {
      rate: number;
      rateType: 'standard' | 'custom' | 'irs' | 'company';
    };
    classification: {
      tripType: 'client_visit' | 'office_visit' | 'training' | 'conference' | 'meeting' | 'other';
      clientCode?: string;
      projectCode?: string;
      billable: boolean;
      billableTo?: string;
      costCenter?: string;
    };
    documentation?: {
      odometerPhotos?: Array<{
        type: 'start' | 'end' | 'waypoint';
        url: string;
        mileage: number;
      }>;
      routeMapUrl?: string;
      receipts?: Array<{
        type: 'fuel' | 'toll' | 'parking' | 'other';
        amount: number;
        url: string;
      }>;
      notes?: string;
    };
    createdBy: string;
  }): Promise<MileageTrip> {
    // Validate employee
    const employee = await User.findById(params.employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }
    
    const tripId = `TRIP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Calculate distances
    const odometerDistance = params.endPoint.odometerEnd - params.startPoint.odometerStart;
    const gpsDistance = await this.calculateGPSDistance(params.startPoint, params.endPoint, params.waypoints || []);
    
    // Get applicable mileage rate
    const mileageRate = params.mileageRate || await this.getApplicableMileageRate(params.employeeId, params.tripDate);
    
    // Calculate business miles (assuming all miles are business unless specified otherwise)
    const businessMiles = odometerDistance;
    const totalMiles = odometerDistance;
    const businessPercentage = 100;
    const reimbursementAmount = businessMiles * mileageRate.rate;
    
    // Calculate duration
    const totalDuration = Math.floor((params.endPoint.timestamp.getTime() - params.startPoint.timestamp.getTime()) / (1000 * 60));
    
    const trip: MileageTrip = {
      tripId,
      employeeId: params.employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      department: employee.department || 'Unknown',
      
      tripName: params.tripName,
      businessPurpose: params.businessPurpose,
      tripDate: params.tripDate,
      
      route: {
        startPoint: params.startPoint,
        endPoint: params.endPoint,
        waypoints: params.waypoints || [],
        totalDistance: {
          miles: odometerDistance,
          kilometers: odometerDistance * 1.60934,
          calculatedBy: 'odometer'
        },
        estimatedDistance: {
          miles: gpsDistance,
          kilometers: gpsDistance * 1.60934,
          provider: 'google'
        },
        routeOptimized: false,
        actualVsEstimated: {
          difference: Math.abs(odometerDistance - gpsDistance),
          percentage: Math.abs((odometerDistance - gpsDistance) / gpsDistance) * 100
        }
      },
      
      vehicle: params.vehicle,
      
      mileageRate: {
        rate: mileageRate.rate,
        rateType: mileageRate.rateType,
        effectiveDate: mileageRate.effectiveDate,
        currency: 'USD'
      },
      
      calculations: {
        businessMiles,
        personalMiles: 0,
        totalMiles,
        businessPercentage,
        reimbursementAmount,
        currency: 'USD'
      },
      
      timeTracking: {
        startTime: params.startPoint.timestamp,
        endTime: params.endPoint.timestamp,
        totalDuration,
        drivingTime: totalDuration, // Simplified
        stopTime: 0,
        averageSpeed: totalDuration > 0 ? (odometerDistance / (totalDuration / 60)) : 0
      },
      
      classification: params.classification,
      
      documentation: {
        odometerPhotoRequired: true,
        odometerPhotoProvided: (params.documentation?.odometerPhotos?.length || 0) > 0,
        odometerPhotos: params.documentation?.odometerPhotos?.map((photo, index) => ({
          photoId: `PHOTO-${Date.now()}-${index}`,
          ...photo,
          uploadedAt: new Date()
        })) || [],
        routeMapRequired: false,
        routeMapProvided: !!params.documentation?.routeMapUrl,
        routeMapUrl: params.documentation?.routeMapUrl,
        receiptsRequired: false,
        receipts: params.documentation?.receipts?.map((receipt, index) => ({
          receiptId: `RECEIPT-${Date.now()}-${index}`,
          ...receipt,
          uploadedAt: new Date()
        })) || [],
        notes: params.documentation?.notes
      },
      
      validation: {
        isValid: true,
        validationScore: 100,
        issues: [],
        policyCompliance: {
          compliant: true,
          violations: []
        }
      },
      
      gpsTracking: {
        enabled: false,
        trackingMethod: 'manual',
        trackedDistance: 0,
        routeAccuracy: 0,
        gpsPoints: []
      },
      
      status: 'draft',
      
      auditTrail: [{
        timestamp: new Date(),
        action: 'Trip Created',
        performedBy: params.createdBy,
        details: `Mileage trip created for ${odometerDistance} miles`
      }],
      
      metadata: {
        createdAt: new Date(),
        createdBy: params.createdBy,
        updatedAt: new Date(),
        updatedBy: params.createdBy,
        version: 1,
        source: 'web'
      }
    };
    
    // Validate trip
    await this.validateMileageTrip(trip);
    
    // Save trip
    await this.saveMileageTrip(trip);
    
    return trip;
  }
  
  // Submit mileage trip
  async submitMileageTrip(tripId: string, submittedBy: string): Promise<MileageTrip> {
    const trip = await this.getMileageTrip(tripId);
    if (!trip) {
      throw new Error('Mileage trip not found');
    }
    
    if (trip.status !== 'draft') {
      throw new Error('Only draft trips can be submitted');
    }
    
    // Final validation
    await this.validateMileageTrip(trip);
    
    if (!trip.validation.isValid) {
      throw new Error('Trip validation failed. Please address the issues before submitting.');
    }
    
    trip.status = 'submitted';
    trip.submittedAt = new Date();
    trip.submittedBy = submittedBy;
    
    // Add audit entry
    trip.auditTrail.push({
      timestamp: new Date(),
      action: 'Trip Submitted',
      performedBy: submittedBy,
      details: 'Mileage trip submitted for approval'
    });
    
    // Check if approval is required
    const policy = await this.getApplicableMileagePolicy(trip.employeeId);
    if (policy?.approval.required && trip.calculations.reimbursementAmount > policy.approval.threshold) {
      trip.status = 'pending_approval';
      await this.initializeMileageApproval(trip);
    } else {
      trip.status = 'approved';
      trip.approvedAt = new Date();
      trip.approvedBy = 'system';
      
      // Create expense
      await this.createExpenseFromMileage(trip);
    }
    
    await this.updateMileageTrip(trip);
    
    // Send notifications
    await this.sendMileageNotifications(trip, 'submitted');
    
    return trip;
  }
  
  // Approve mileage trip
  async approveMileageTrip(tripId: string, approverId: string, comments?: string): Promise<MileageTrip> {
    const trip = await this.getMileageTrip(tripId);
    if (!trip) {
      throw new Error('Mileage trip not found');
    }
    
    if (trip.status !== 'pending_approval') {
      throw new Error('Trip is not pending approval');
    }
    
    // Get approver info
    const approver = await User.findById(approverId);
    if (!approver) {
      throw new Error('Approver not found');
    }
    
    trip.status = 'approved';
    trip.approvedAt = new Date();
    trip.approvedBy = approverId;
    
    // Add audit entry
    trip.auditTrail.push({
      timestamp: new Date(),
      action: 'Trip Approved',
      performedBy: approverId,
      details: `Mileage trip approved${comments ? `: ${comments}` : ''}`
    });
    
    // Create expense
    await this.createExpenseFromMileage(trip);
    
    await this.updateMileageTrip(trip);
    
    // Send notifications
    await this.sendMileageNotifications(trip, 'approved');
    
    return trip;
  }
  
  // Optimize route
  async optimizeRoute(tripId: string): Promise<{
    optimized: boolean;
    originalDistance: number;
    optimizedDistance: number;
    savings: number;
    optimizedRoute?: Array<{
      address: string;
      latitude: number;
      longitude: number;
      order: number;
    }>;
  }> {
    const trip = await this.getMileageTrip(tripId);
    if (!trip) {
      throw new Error('Mileage trip not found');
    }
    
    const originalDistance = trip.route.totalDistance.miles;
    
    // Mock route optimization
    const optimizedDistance = originalDistance * 0.95; // 5% savings
    const savings = originalDistance - optimizedDistance;
    
    if (savings > 1) { // Only apply if savings are significant
      trip.route.routeOptimized = true;
      trip.route.totalDistance.miles = optimizedDistance;
      trip.route.totalDistance.kilometers = optimizedDistance * 1.60934;
      trip.calculations.businessMiles = optimizedDistance;
      trip.calculations.totalMiles = optimizedDistance;
      trip.calculations.reimbursementAmount = optimizedDistance * trip.mileageRate.rate;
      
      await this.updateMileageTrip(trip);
      
      return {
        optimized: true,
        originalDistance,
        optimizedDistance,
        savings,
        optimizedRoute: [
          {
            address: trip.route.startPoint.address,
            latitude: trip.route.startPoint.latitude,
            longitude: trip.route.startPoint.longitude,
            order: 1
          },
          {
            address: trip.route.endPoint.address,
            latitude: trip.route.endPoint.latitude,
            longitude: trip.route.endPoint.longitude,
            order: 2
          }
        ]
      };
    }
    
    return {
      optimized: false,
      originalDistance,
      optimizedDistance: originalDistance,
      savings: 0
    };
  }
  
  // Get mileage analytics
  async getMileageAnalytics(params: {
    startDate: Date;
    endDate: Date;
    employeeId?: string;
    department?: string;
    vehicleType?: string;
  }): Promise<MileageAnalytics> {
    // Mock analytics data
    return {
      period: {
        startDate: params.startDate,
        endDate: params.endDate
      },
      
      overview: {
        totalTrips: 1000,
        totalMiles: 25000,
        totalReimbursement: 18750,
        averageTripDistance: 25,
        averageReimbursement: 18.75,
        averageRate: 0.75,
        complianceRate: 92.0
      },
      
      usageAnalysis: {
        tripsByMonth: [
          { month: '2024-01', trips: 300, miles: 7500, reimbursement: 5625 },
          { month: '2024-02', trips: 320, miles: 8000, reimbursement: 6000 }
        ],
        tripsByDayOfWeek: [
          { day: 'Monday', trips: 200, miles: 5000 },
          { day: 'Tuesday', trips: 180, miles: 4500 },
          { day: 'Wednesday', trips: 160, miles: 4000 },
          { day: 'Thursday', trips: 170, miles: 4250 },
          { day: 'Friday', trips: 190, miles: 4750 },
          { day: 'Saturday', trips: 50, miles: 1250 },
          { day: 'Sunday', trips: 50, miles: 1250 }
        ],
        tripsByHour: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          trips: Math.floor(Math.random() * 50) + 10,
          miles: Math.floor(Math.random() * 1000) + 200
        })),
        topDestinations: [
          { address: '123 Main St, City, State', visits: 50, totalMiles: 1250 },
          { address: '456 Oak Ave, City, State', visits: 45, totalMiles: 1125 }
        ]
      },
      
      employeeAnalysis: {
        topMileageEmployees: [
          {
            employeeId: 'emp1',
            employeeName: 'John Doe',
            department: 'Sales',
            trips: 50,
            miles: 1500,
            reimbursement: 1125,
            averageTripDistance: 30
          }
        ],
        departmentUsage: [
          {
            department: 'Sales',
            employees: 20,
            trips: 400,
            miles: 10000,
            reimbursement: 7500
          }
        ],
        complianceByEmployee: [
          {
            employeeId: 'emp1',
            employeeName: 'John Doe',
            totalTrips: 50,
            compliantTrips: 48,
            complianceRate: 96.0,
            commonIssues: ['Missing odometer photos']
          }
        ]
      },
      
      vehicleAnalysis: {
        usageByVehicleType: [
          { vehicleType: 'personal', trips: 700, miles: 17500, percentage: 70.0 },
          { vehicleType: 'company', trips: 300, miles: 7500, percentage: 30.0 }
        ],
        personalVsCompany: {
          personal: { trips: 700, miles: 17500, percentage: 70.0 },
          company: { trips: 300, miles: 7500, percentage: 30.0 }
        },
        fuelEfficiency: [
          { vehicleType: 'personal', mpg: 25, totalMiles: 17500, fuelCost: 2800 }
        ]
      },
      
      routeAnalysis: {
        averageTripDistance: 25,
        longestTrips: [
          { tripId: 'trip1', distance: 150, startAddress: 'A', endAddress: 'B' }
        ],
        mostFrequentRoutes: [
          { route: 'Office -> Client A', count: 100, totalMiles: 2000 }
        ],
        routeOptimization: {
          optimizedTrips: 100,
          potentialSavings: 500,
          optimizationRate: 10.0
        }
      },
      
      complianceAnalysis: {
        overallCompliance: {
          compliantTrips: 920,
          nonCompliantTrips: 80,
          complianceRate: 92.0
        },
        commonViolations: [
          { violation: 'Missing odometer photos', count: 40, percentage: 50.0 },
          { violation: 'Unrealistic distance', count: 20, percentage: 25.0 }
        ],
        documentationIssues: [
          { issue: 'No start odometer photo', count: 30, percentage: 37.5 },
          { issue: 'No end odometer photo', count: 25, percentage: 31.25 }
        ],
        validationScores: {
          average: 85.5,
          distribution: [
            { range: '90-100', count: 600, percentage: 60.0 },
            { range: '80-89', count: 250, percentage: 25.0 },
            { range: '70-79', count: 100, percentage: 10.0 },
            { range: '<70', count: 50, percentage: 5.0 }
          ]
        }
      },
      
      financialAnalysis: {
        reimbursementTrends: [
          { month: '2024-01', amount: 5625, trips: 300, averagePerTrip: 18.75 },
          { month: '2024-02', amount: 6000, trips: 320, averagePerTrip: 18.75 }
        ],
        rateUsage: [
          { rateId: 'rate1', rateName: 'Standard Rate', usage: 800, totalAmount: 12000 },
          { rateId: 'rate2', rateName: 'IRS Rate', usage: 200, totalAmount: 3750 }
        ],
        costSavings: {
          routeOptimization: 500,
          policyCompliance: 1000,
          validationCatches: 750,
          totalSavings: 2250
        }
      },
      
      recommendations: [
        {
          type: 'training',
          priority: 'medium',
          description: 'Provide training on proper odometer photo documentation',
          impact: 'Improve compliance rate by 10%',
          affectedEmployees: 50
        }
      ]
    };
  }
  
  // Helper methods
  private async calculateGPSDistance(startPoint: any, endPoint: any, waypoints: any[]): Promise<number> {
    // Mock GPS distance calculation
    return Math.abs(endPoint.latitude - startPoint.latitude) * 69 + Math.abs(endPoint.longitude - startPoint.longitude) * 54;
  }
  
  private async getApplicableMileageRate(employeeId: string, date: Date): Promise<MileageRate> {
    // Mock rate lookup
    return {
      rateId: 'standard_rate',
      name: 'Standard Mileage Rate',
      rate: 0.655,
      rateType: 'irs',
      effectiveDate: new Date('2024-01-01')
    } as MileageRate;
  }
  
  private async validateMileageTrip(trip: MileageTrip): Promise<void> {
    const issues = [];
    
    // Check odometer consistency
    if (trip.route.endPoint.odometerEnd <= trip.route.startPoint.odometerStart) {
      issues.push({
        type: 'inconsistent_odometer' as const,
        severity: 'critical' as const,
        description: 'End odometer reading must be greater than start reading',
        autoResolved: false
      });
    }
    
    // Check distance reasonableness
    const gpsDistance = trip.route.estimatedDistance?.miles || 0;
    const odometerDistance = trip.route.totalDistance.miles;
    const difference = Math.abs(odometerDistance - gpsDistance) / gpsDistance;
    
    if (difference > 0.5) { // 50% difference
      issues.push({
        type: 'unrealistic_distance' as const,
        severity: 'high' as const,
        description: 'Odometer distance differs significantly from GPS distance',
        autoResolved: false
      });
    }
    
    // Check documentation
    if (trip.documentation.odometerPhotoRequired && !trip.documentation.odometerPhotoProvided) {
      issues.push({
        type: 'missing_documentation' as const,
        severity: 'medium' as const,
        description: 'Odometer photos are required but not provided',
        autoResolved: false
      });
    }
    
    trip.validation.issues = issues;
    trip.validation.isValid = issues.length === 0;
    trip.validation.validationScore = Math.max(0, 100 - (issues.length * 10));
  }
  
  private async getApplicableMileagePolicy(employeeId: string): Promise<MileagePolicy | null> {
    // Mock policy lookup
    return null;
  }
  
  private async initializeMileageApproval(trip: MileageTrip): Promise<void> {
    // Mock approval initialization
    trip.approvals = [{
      approverId: 'manager_123',
      approverName: 'Manager Name',
      approverRole: 'manager',
      status: 'pending'
    }];
  }
  
  private async createExpenseFromMileage(trip: MileageTrip): Promise<void> {
    // Mock expense creation
    const expense = {
      expenseId: `EXP-${Date.now()}`,
      title: `Mileage Reimbursement - ${trip.tripName}`,
      amount: trip.calculations.reimbursementAmount,
      totalAmount: trip.calculations.reimbursementAmount,
      date: trip.tripDate,
      employeeId: trip.employeeId,
      status: 'approved',
      source: 'mileage',
      sourceReference: trip.tripId,
      mileageInfo: {
        startLocation: {
          address: trip.route.startPoint.address,
          odometerStart: trip.route.startPoint.odometerStart
        },
        endLocation: {
          address: trip.route.endPoint.address,
          odometerEnd: trip.route.endPoint.odometerEnd
        },
        distance: trip.route.totalDistance,
        rate: trip.mileageRate.rate,
        totalAmount: trip.calculations.reimbursementAmount,
        purpose: trip.businessPurpose
      }
    };
    
    trip.expenseId = expense.expenseId;
    trip.processedAt = new Date();
  }
  
  // Database operations (mock implementations)
  private async saveMileageTrip(trip: MileageTrip): Promise<void> {
    console.log(`Saving mileage trip ${trip.tripId}`);
  }
  
  private async updateMileageTrip(trip: MileageTrip): Promise<void> {
    console.log(`Updating mileage trip ${trip.tripId}`);
  }
  
  private async getMileageTrip(tripId: string): Promise<MileageTrip | null> {
    // Mock implementation
    return null;
  }
  
  private async sendMileageNotifications(trip: MileageTrip, action: string): Promise<void> {
    console.log(`Sending ${action} notifications for mileage trip ${trip.tripId}`);
  }
}
