import mongoose, { Schema, Document as MongoDocument } from 'mongoose';

// Emergency Contact interface
interface IEmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  address?: string;
  isPrimary: boolean;
}

// Address interface
interface IAddress {
  type: 'current' | 'permanent' | 'temporary';
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isPrimary: boolean;
  effectiveFrom: Date;
  effectiveTo?: Date;
}

// Government ID interface
interface IGovernmentId {
  type: 'ssn' | 'passport' | 'driver_license' | 'national_id' | 'voter_id' | 'other';
  number: string;
  issuingAuthority: string;
  issueDate: Date;
  expiryDate?: Date;
  documentUrl?: string;
  isVerified: boolean;
  verifiedAt?: Date;
  verifiedBy?: string;
}

// Employment Details interface
interface IEmploymentDetails {
  employeeId: string;
  hireDate: Date;
  contractType: 'full_time' | 'part_time' | 'contract' | 'intern' | 'seasonal' | 'temporary';
  employmentStatus: 'active' | 'on_leave' | 'terminated' | 'resigned' | 'retired' | 'probation';
  probationEndDate?: Date;
  terminationDate?: Date;
  terminationReason?: string;
  terminationType?: 'voluntary' | 'involuntary' | 'retirement' | 'contract_end';
  noticePeriod: number; // in days
  workSchedule: {
    type: 'fixed' | 'flexible' | 'rotating' | 'split';
    days: string[];
    hours: {
      start: string;
      end: string;
      break?: number; // minutes
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
}

// Compensation interface
interface ICompensation {
  currency: string;
  payFrequency: 'hourly' | 'weekly' | 'biweekly' | 'monthly' | 'annual';
  baseSalary?: number;
  hourlyRate?: number;
  overtimeRate?: number;
  bonusStructure: {
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
  benefits: {
    healthInsurance: boolean;
    dentalInsurance: boolean;
    visionInsurance: boolean;
    lifeInsurance: boolean;
    retirement401k: boolean;
    paidTimeOff: number; // days per year
    sickLeave: number; // days per year
    maternityLeave: number; // days
    paternityLeave: number; // days
    otherBenefits: string[];
  };
  lastReviewDate?: Date;
  nextReviewDate?: Date;
}

// Bank Details interface
interface IBankDetails {
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  accountType: 'checking' | 'savings';
  bankAddress?: string;
  swiftCode?: string;
  iban?: string;
  isPrimary: boolean;
  effectiveFrom: Date;
  effectiveTo?: Date;
}

// Skills and Certifications interface
interface ISkill {
  name: string;
  category: 'technical' | 'soft' | 'language' | 'industry' | 'management';
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience: number;
  lastUsed?: Date;
  certified: boolean;
  certificationDetails?: {
    name: string;
    issuingOrganization: string;
    issueDate: Date;
    expiryDate?: Date;
    certificateUrl?: string;
    verificationUrl?: string;
  };
}

// Education History interface
interface IEducation {
  institution: string;
  degree: string;
  field: string;
  startDate: Date;
  endDate?: Date;
  gpa?: number;
  honors?: string[];
  thesis?: string;
  isCurrent: boolean;
}

// Previous Employment interface
interface IPreviousEmployment {
  company: string;
  position: string;
  department?: string;
  startDate: Date;
  endDate?: Date;
  isCurrent: boolean;
  responsibilities: string[];
  achievements: string[];
  reasonForLeaving?: string;
  finalSalary?: number;
  supervisor?: string;
  supervisorContact?: string;
  canContact: boolean;
}

// Performance Review interface
interface IPerformanceReview {
  id: string;
  reviewPeriod: {
    startDate: Date;
    endDate: Date;
  };
  reviewType: 'annual' | 'semi_annual' | 'quarterly' | 'probation' | 'exit' | 'promotion';
  reviewerId: string;
  reviewerName: string;
  overallRating: number; // 1-5
  categories: {
    jobKnowledge: number;
    qualityOfWork: number;
    productivity: number;
    initiative: number;
    teamwork: number;
    communication: number;
    leadership?: number;
    problemSolving: number;
    attendance: number;
  };
  strengths: string[];
  areasForImprovement: string[];
  goals: Array<{
    description: string;
    dueDate: Date;
    status: 'pending' | 'in_progress' | 'completed';
  }>;
  comments: string;
  employeeComments?: string;
  status: 'draft' | 'submitted' | 'reviewed' | 'approved';
  createdAt: Date;
  reviewedAt?: Date;
}

// Training Record interface
interface ITrainingRecord {
  id: string;
  name: string;
  type: 'onboarding' | 'compliance' | 'technical' | 'soft_skills' | 'safety' | 'leadership' | 'other';
  provider: string;
  startDate: Date;
  endDate?: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'failed';
  completionDate?: Date;
  score?: number;
  certificateUrl?: string;
  cost?: number;
  required: boolean;
  recurring?: {
    frequency: 'annually' | 'biennially' | 'triennially';
    nextDue?: Date;
  };
  instructor?: string;
  location?: string;
  format: 'classroom' | 'online' | 'hybrid' | 'on_the_job';
}

// Time Off Request interface
interface ITimeOffRequest {
  id: string;
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
}

// Employee interface
export interface IEmployee extends MongoDocument {
  // Basic Information
  employeeId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  preferredName?: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed' | 'domestic_partnership';
  dependents: number;
  
  // Contact Information
  email: string;
  alternateEmail?: string;
  phone: string;
  alternatePhone?: string;
  emergencyContacts: IEmergencyContact[];
  
  // Addresses
  addresses: IAddress[];
  
  // Government IDs
  governmentIds: IGovernmentId[];
  
  // Employment Details
  employment: IEmploymentDetails;
  
  // Compensation
  compensation: ICompensation;
  
  // Bank Details
  bankDetails: IBankDetails[];
  
  // Skills and Certifications
  skills: ISkill[];
  
  // Education History
  education: IEducation[];
  
  // Previous Employment
  previousEmployment: IPreviousEmployment[];
  
  // Performance Reviews
  performanceReviews: IPerformanceReview[];
  
  // Training Records
  trainingRecords: ITrainingRecord[];
  
  // Time Off
  timeOffRequests: ITimeOffRequest[];
  
  // System Fields
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  
  // Status and Access
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  
  // Access Control
  roles: string[];
  permissions: string[];
  
  // Metadata
  profilePicture?: string;
  bio?: string;
  socialProfiles?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    other?: Record<string, string>;
  };
  
  // Emergency Information
  bloodType?: string;
  allergies?: string[];
  medicalConditions?: string[];
  emergencyNotes?: string;
  
  // Compliance
  backgroundCheckCompleted: boolean;
  backgroundCheckDate?: Date;
  backgroundCheckResult?: 'clear' | 'pending' | 'failed';
  i9Completed: boolean;
  i9CompletedAt?: Date;
  w4Completed: boolean;
  w4CompletedAt?: Date;
  
  // Analytics
  totalHoursWorked: number;
  totalOvertimeHours: number;
  totalSales: number;
  totalCommission: number;
  totalTips?: number;
  averageRating: number;
  attendanceRate: number;
  punctualityRate: number;
}

// Employee Schema
const EmployeeSchema = new Schema<IEmployee>({
  // Basic Information
  employeeId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  middleName: String,
  preferredName: String,
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    required: true
  },
  maritalStatus: {
    type: String,
    enum: ['single', 'married', 'divorced', 'widowed', 'domestic_partnership'],
    default: 'single'
  },
  dependents: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Contact Information
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  alternateEmail: String,
  phone: {
    type: String,
    required: true,
    index: true
  },
  alternatePhone: String,
  emergencyContacts: [{
    name: { type: String, required: true },
    relationship: { type: String, required: true },
    phone: { type: String, required: true },
    alternatePhone: String,
    email: String,
    address: String,
    isPrimary: { type: Boolean, default: false }
  }],
  
  // Addresses
  addresses: [{
    type: {
      type: String,
      enum: ['current', 'permanent', 'temporary'],
      required: true
    },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
    isPrimary: { type: Boolean, default: false },
    effectiveFrom: { type: Date, required: true },
    effectiveTo: Date
  }],
  
  // Government IDs
  governmentIds: [{
    type: {
      type: String,
      enum: ['ssn', 'passport', 'driver_license', 'national_id', 'voter_id', 'other'],
      required: true
    },
    number: { type: String, required: true },
    issuingAuthority: { type: String, required: true },
    issueDate: { type: Date, required: true },
    expiryDate: Date,
    documentUrl: String,
    isVerified: { type: Boolean, default: false },
    verifiedAt: Date,
    verifiedBy: String
  }],
  
  // Employment Details
  employment: {
    employeeId: { type: String, required: true },
    hireDate: { type: Date, required: true },
    contractType: {
      type: String,
      enum: ['full_time', 'part_time', 'contract', 'intern', 'seasonal', 'temporary'],
      required: true
    },
    employmentStatus: {
      type: String,
      enum: ['active', 'on_leave', 'terminated', 'resigned', 'retired', 'probation'],
      default: 'active'
    },
    probationEndDate: Date,
    terminationDate: Date,
    terminationReason: String,
    terminationType: {
      type: String,
      enum: ['voluntary', 'involuntary', 'retirement', 'contract_end']
    },
    noticePeriod: { type: Number, default: 30 },
    workSchedule: {
      type: { type: String, enum: ['fixed', 'flexible', 'rotating', 'split'], required: true },
      days: [{ type: String, required: true }],
      hours: {
        start: { type: String, required: true },
        end: { type: String, required: true },
        break: Number
      }
    },
    workLocation: {
      type: { type: String, enum: ['onsite', 'remote', 'hybrid'], required: true },
      primaryLocation: { type: String, required: true },
      secondaryLocation: String
    },
    reportingManager: String,
    department: { type: String, required: true },
    position: { type: String, required: true },
    jobLevel: { type: String, required: true },
    jobFamily: { type: String, required: true },
    costCenter: String
  },
  
  // Compensation
  compensation: {
    currency: { type: String, default: 'USD' },
    payFrequency: {
      type: String,
      enum: ['hourly', 'weekly', 'biweekly', 'monthly', 'annual'],
      required: true
    },
    baseSalary: Number,
    hourlyRate: Number,
    overtimeRate: Number,
    bonusStructure: {
      type: {
        type: String,
        enum: ['percentage', 'fixed', 'tiered', 'performance_based']
      },
      amount: Number,
      percentage: Number,
      tiers: [{
        min: Number,
        max: Number,
        bonus: Number
      }],
      eligibilityCriteria: [String]
    },
    commissionStructure: {
      type: {
        type: String,
        enum: ['percentage', 'tiered', 'fixed']
      },
      rate: Number,
      tiers: [{
        min: Number,
        max: Number,
        rate: Number
      }],
      productCategories: [String]
    },
    benefits: {
      healthInsurance: { type: Boolean, default: false },
      dentalInsurance: { type: Boolean, default: false },
      visionInsurance: { type: Boolean, default: false },
      lifeInsurance: { type: Boolean, default: false },
      retirement401k: { type: Boolean, default: false },
      paidTimeOff: { type: Number, default: 0 },
      sickLeave: { type: Number, default: 0 },
      maternityLeave: { type: Number, default: 0 },
      paternityLeave: { type: Number, default: 0 },
      otherBenefits: [String]
    },
    lastReviewDate: Date,
    nextReviewDate: Date
  },
  
  // Bank Details
  bankDetails: [{
    bankName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    routingNumber: { type: String, required: true },
    accountType: {
      type: String,
      enum: ['checking', 'savings'],
      required: true
    },
    bankAddress: String,
    swiftCode: String,
    iban: String,
    isPrimary: { type: Boolean, default: false },
    effectiveFrom: { type: Date, required: true },
    effectiveTo: Date
  }],
  
  // Skills and Certifications
  skills: [{
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ['technical', 'soft', 'language', 'industry', 'management'],
      required: true
    },
    proficiency: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      required: true
    },
    yearsOfExperience: { type: Number, default: 0 },
    lastUsed: Date,
    certified: { type: Boolean, default: false },
    certificationDetails: {
      name: String,
      issuingOrganization: String,
      issueDate: Date,
      expiryDate: Date,
      certificateUrl: String,
      verificationUrl: String
    }
  }],
  
  // Education History
  education: [{
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    field: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: Date,
    gpa: Number,
    honors: [String],
    thesis: String,
    isCurrent: { type: Boolean, default: false }
  }],
  
  // Previous Employment
  previousEmployment: [{
    company: { type: String, required: true },
    position: { type: String, required: true },
    department: String,
    startDate: { type: Date, required: true },
    endDate: Date,
    isCurrent: { type: Boolean, default: false },
    responsibilities: [String],
    achievements: [String],
    reasonForLeaving: String,
    finalSalary: Number,
    supervisor: String,
    supervisorContact: String,
    canContact: { type: Boolean, default: true }
  }],
  
  // Performance Reviews
  performanceReviews: [{
    id: { type: String, required: true },
    reviewPeriod: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true }
    },
    reviewType: {
      type: String,
      enum: ['annual', 'semi_annual', 'quarterly', 'probation', 'exit', 'promotion'],
      required: true
    },
    reviewerId: { type: String, required: true },
    reviewerName: { type: String, required: true },
    overallRating: { type: Number, min: 1, max: 5, required: true },
    categories: {
      jobKnowledge: { type: Number, min: 1, max: 5 },
      qualityOfWork: { type: Number, min: 1, max: 5 },
      productivity: { type: Number, min: 1, max: 5 },
      initiative: { type: Number, min: 1, max: 5 },
      teamwork: { type: Number, min: 1, max: 5 },
      communication: { type: Number, min: 1, max: 5 },
      leadership: { type: Number, min: 1, max: 5 },
      problemSolving: { type: Number, min: 1, max: 5 },
      attendance: { type: Number, min: 1, max: 5 }
    },
    strengths: [String],
    areasForImprovement: [String],
    goals: [{
      description: { type: String, required: true },
      dueDate: { type: Date, required: true },
      status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed'],
        default: 'pending'
      }
    }],
    comments: { type: String, required: true },
    employeeComments: String,
    status: {
      type: String,
      enum: ['draft', 'submitted', 'reviewed', 'approved'],
      default: 'draft'
    },
    createdAt: { type: Date, default: Date.now },
    reviewedAt: Date
  }],
  
  // Training Records
  trainingRecords: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['onboarding', 'compliance', 'technical', 'soft_skills', 'safety', 'leadership', 'other'],
      required: true
    },
    provider: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: Date,
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'failed'],
      default: 'scheduled'
    },
    completionDate: Date,
    score: Number,
    certificateUrl: String,
    cost: Number,
    required: { type: Boolean, default: false },
    recurring: {
      frequency: {
        type: String,
        enum: ['annually', 'biennially', 'triennially']
      },
      nextDue: Date
    },
    instructor: String,
    location: String,
    format: {
      type: String,
      enum: ['classroom', 'online', 'hybrid', 'on_the_job'],
      required: true
    }
  }],
  
  // Time Off Requests
  timeOffRequests: [{
    id: { type: String, required: true },
    type: {
      type: String,
      enum: ['vacation', 'sick', 'personal', 'maternity', 'paternity', 'bereavement', 'unpaid', 'other'],
      required: true
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    days: { type: Number, required: true },
    reason: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending'
    },
    requestedAt: { type: Date, default: Date.now },
    approvedBy: String,
    approvedAt: Date,
    rejectionReason: String,
    attachments: [String]
  }],
  
  // System Fields
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: { type: String, required: true },
  updatedBy: { type: String, required: true },
  
  // Status and Access
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
  deletedBy: String,
  
  // Access Control
  roles: [String],
  permissions: [String],
  
  // Metadata
  profilePicture: String,
  bio: String,
  socialProfiles: {
    linkedin: String,
    twitter: String,
    github: String,
    other: Map
  },
  
  // Emergency Information
  bloodType: String,
  allergies: [String],
  medicalConditions: [String],
  emergencyNotes: String,
  
  // Compliance
  backgroundCheckCompleted: { type: Boolean, default: false },
  backgroundCheckDate: Date,
  backgroundCheckResult: {
    type: String,
    enum: ['clear', 'pending', 'failed']
  },
  i9Completed: { type: Boolean, default: false },
  i9CompletedAt: Date,
  w4Completed: { type: Boolean, default: false },
  w4CompletedAt: Date,
  
  // Analytics
  totalHoursWorked: { type: Number, default: 0 },
  totalOvertimeHours: { type: Number, default: 0 },
  totalSales: { type: Number, default: 0 },
  totalCommission: { type: Number, default: 0 },
  totalTips: Number,
  averageRating: { type: Number, default: 0 },
  attendanceRate: { type: Number, default: 0 },
  punctualityRate: { type: Number, default: 0 }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
EmployeeSchema.index({ employeeId: 1 });
EmployeeSchema.index({ email: 1 });
EmployeeSchema.index({ phone: 1 });
EmployeeSchema.index({ 'employment.department': 1 });
EmployeeSchema.index({ 'employment.position': 1 });
EmployeeSchema.index({ 'employment.employmentStatus': 1 });
EmployeeSchema.index({ 'employment.reportingManager': 1 });
EmployeeSchema.index({ isActive: 1, isDeleted: 1 });
EmployeeSchema.index({ createdAt: -1 });
EmployeeSchema.index({ 'compensation.payFrequency': 1 });
EmployeeSchema.index({ skills: 1 });
EmployeeSchema.index({ 'performanceReviews.overallRating': -1 });

// Virtuals
EmployeeSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

EmployeeSchema.virtual('preferredFullName').get(function() {
  return this.preferredName ? `${this.preferredName} ${this.lastName}` : this.fullName;
});

EmployeeSchema.virtual('age').get(function() {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

EmployeeSchema.virtual('yearsOfService').get(function() {
  const today = new Date();
  const hireDate = new Date(this.employment.hireDate);
  let years = today.getFullYear() - hireDate.getFullYear();
  const monthDiff = today.getMonth() - hireDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < hireDate.getDate())) {
    years--;
  }
  return years;
});

EmployeeSchema.virtual('primaryAddress').get(function() {
  return this.addresses.find(addr => addr.isPrimary && addr.type === 'current') || this.addresses[0];
});

EmployeeSchema.virtual('primaryEmergencyContact').get(function() {
  return this.emergencyContacts.find(contact => contact.isPrimary) || this.emergencyContacts[0];
});

EmployeeSchema.virtual('primaryBankDetail').get(function() {
  return this.bankDetails.find(bank => bank.isPrimary) || this.bankDetails[0];
});

// Pre-save middleware
EmployeeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Calculate age-based metrics
  if (this.dateOfBirth) {
    // Auto-calculate dependents if needed
  }
  
  next();
});

// Static methods
EmployeeSchema.statics.generateEmployeeId = function(): string {
  const prefix = 'EMP';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

EmployeeSchema.statics.findByEmailOrPhone = function(email: string, phone: string) {
  return this.findOne({
    $or: [
      { email: email.toLowerCase() },
      { phone: phone },
      { alternatePhone: phone }
    ],
    isDeleted: false
  });
};

EmployeeSchema.statics.findByDepartment = function(department: string) {
  return this.find({
    'employment.department': department,
    isActive: true,
    isDeleted: false
  });
};

EmployeeSchema.statics.findByManager = function(managerId: string) {
  return this.find({
    'employment.reportingManager': managerId,
    isActive: true,
    isDeleted: false
  });
};

EmployeeSchema.statics.findActiveEmployees = function() {
  return this.find({
    isActive: true,
    isDeleted: false,
    'employment.employmentStatus': 'active'
  });
};

// Instance methods
EmployeeSchema.methods.addPerformanceReview = function(reviewData: any) {
  const review = {
    id: new mongoose.Types.ObjectId().toString(),
    ...reviewData,
    createdAt: new Date()
  };
  
  this.performanceReviews.push(review);
  return this.save();
};

EmployeeSchema.methods.addTrainingRecord = function(trainingData: any) {
  const training = {
    id: new mongoose.Types.ObjectId().toString(),
    ...trainingData
  };
  
  this.trainingRecords.push(training);
  return this.save();
};

EmployeeSchema.methods.addTimeOffRequest = function(requestData: any) {
  const request = {
    id: new mongoose.Types.ObjectId().toString(),
    ...requestData
  };
  
  this.timeOffRequests.push(request);
  return this.save();
};

EmployeeSchema.methods.updateEmploymentStatus = function(
  newStatus: string,
  reason?: string,
  updatedBy?: string
) {
  this.employment.employmentStatus = newStatus;
  
  if (newStatus === 'terminated' || newStatus === 'resigned') {
    this.employment.terminationDate = new Date();
    this.employment.terminationReason = reason;
    this.isActive = false;
  }
  
  if (updatedBy) {
    this.updatedBy = updatedBy;
  }
  
  return this.save();
};

EmployeeSchema.methods.addSkill = function(skillData: any) {
  const skill = {
    ...skillData,
    name: skillData.name.toLowerCase()
  };
  
  // Check if skill already exists
  const existingSkillIndex = this.skills.findIndex(s => s.name === skill.name);
  if (existingSkillIndex >= 0) {
    this.skills[existingSkillIndex] = skill;
  } else {
    this.skills.push(skill);
  }
  
  return this.save();
};

EmployeeSchema.methods.softDelete = function(deletedBy: string) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  this.isActive = false;
  return this.save();
};

export const Employee = mongoose.model<IEmployee>('Employee', EmployeeSchema);
export default Employee;
