import mongoose, { Schema, Document } from 'mongoose';

export interface ICLVCalculation extends Document {
  customerId: string;
  calculationDate: Date;
  period: {
    startDate: Date;
    endDate: Date;
  };
  historicalCLV: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    purchaseFrequency: number;
    customerLifetime: number;
    profitMargin: number;
    clv: number;
  };
  predictiveCLV: {
    predictedCLV: number;
    confidenceScore: number;
    timeHorizon: number; // months
    modelVersion: string;
    features: {
      recencyScore: number;
      frequencyScore: number;
      monetaryScore: number;
      churnRisk: number;
      engagementScore: number;
    };
  };
  cohortAnalysis: {
    cohortId: string;
    cohortType: 'acquisition' | 'behavioral' | 'demographic';
    cohortCLV: number;
    cohortPercentile: number;
  };
  segmentation: {
    segment: string;
    segmentCLV: number;
    segmentPercentile: number;
    segmentCharacteristics: string[];
  };
  trends: Array<{
    date: Date;
    clv: number;
    revenue: number;
    orders: number;
    frequency: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IChurnPrediction extends Document {
  customerId: string;
  predictionDate: Date;
  churnProbability: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: Array<{
    factor: string;
    impact: number;
    description: string;
  }>;
  predictiveFeatures: {
    recencyDays: number;
    frequencyScore: number;
    monetaryScore: number;
    avgDaysBetweenOrders: number;
    orderTrend: 'increasing' | 'decreasing' | 'stable';
    satisfactionScore: number;
    supportTickets: number;
    lastInteractionDays: number;
  };
  preventionActions: Array<{
    action: string;
    priority: 'low' | 'medium' | 'high';
    estimatedImpact: number;
    status: 'suggested' | 'implemented' | 'completed';
  }>;
  modelVersion: string;
  confidenceScore: number;
  nextPredictionDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICustomerSegment extends Document {
  customerId: string;
  segmentId: string;
  segmentName: string;
  segmentType: 'demographic' | 'behavioral' | 'psychographic' | 'rfm' | 'custom';
  assignmentDate: Date;
  confidenceScore: number;
  characteristics: {
    demographics?: {
      ageRange: string;
      gender?: string;
      location: string;
      incomeLevel?: string;
    };
    behavioral?: {
      purchaseFrequency: string;
      avgOrderValue: string;
      preferredCategories: string[];
      shoppingTimePreference: string;
    };
    psychographic?: {
      lifestyle: string[];
      interests: string[];
      values: string[];
      personalityTraits: string[];
    };
    rfm?: {
      recencyScore: number;
      frequencyScore: number;
      monetaryScore: number;
      rfmSegment: string;
    };
  };
  segmentHistory: Array<{
    previousSegment: string;
    changeDate: Date;
    changeReason: string;
  }>;
  isActive: boolean;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPurchasePattern extends Document {
  customerId: string;
  analysisDate: Date;
  period: {
    startDate: Date;
    endDate: Date;
  };
  basketAnalysis: {
    averageBasketSize: number;
    averageBasketValue: number;
    topProductCombinations: Array<{
      products: string[];
      frequency: number;
      confidence: number;
    }>;
    crossSellOpportunities: Array<{
      product: string;
      likelihood: number;
      potentialRevenue: number;
    }>;
    categoryAffinity: Record<string, number>;
  };
  seasonalPatterns: {
    seasonalIndex: number;
    peakSeasons: string[];
    offPeakSeasons: string[];
    holidayImpact: number;
    weatherImpact?: number;
  };
  temporalPatterns: {
    preferredShoppingDays: string[];
    preferredShoppingTimes: string[];
    purchaseCycle: number; // days
    nextPredictedPurchase: Date;
  };
  productPreferences: {
    favoriteCategories: Array<{
      category: string;
      spend: number;
      frequency: number;
      growth: number;
    }>;
    brandPreferences: Record<string, number>;
    priceSensitivity: 'low' | 'medium' | 'high';
    qualityPreference: 'budget' | 'standard' | 'premium';
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ICustomerJourney extends Document {
  customerId: string;
  journeyId: string;
  journeyStartDate: Date;
  currentStage: string;
  journeyStatus: 'active' | 'completed' | 'abandoned' | 'paused';
  touchpoints: Array<{
    id: string;
    timestamp: Date;
    channel: 'web' | 'mobile' | 'in_store' | 'email' | 'social' | 'phone' | 'other';
    action: string;
    source: string;
    medium: string;
    campaign?: string;
    content?: string;
    value?: number;
    converted: boolean;
    duration?: number; // seconds spent on page/call
    metadata?: Record<string, any>;
  }>;
  funnelAnalysis: {
    entryPoint: string;
    conversionPath: string[];
    dropoffPoints: Array<{
      stage: string;
      dropoffRate: number;
      dropoffReason?: string;
    }>;
    totalDuration: number; // minutes
    conversionRate: number;
    pathEfficiency: number;
  };
  attribution: {
    firstTouch: string;
    lastTouch: string;
    linearAttribution: Record<string, number>;
    timeDecayAttribution: Record<string, number>;
    positionBasedAttribution: Record<string, number>;
  };
  goals: Array<{
    goalId: string;
    goalName: string;
    goalValue: number;
    completed: boolean;
    completionDate?: Date;
    timeToCompletion?: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICohortAnalysis extends Document {
  cohortId: string;
  cohortName: string;
  cohortType: 'time_based' | 'behavioral' | 'acquisition_channel' | 'demographic' | 'custom';
  cohortDate: Date;
  cohortSize: number;
  analysisPeriod: {
    startDate: Date;
    endDate: Date;
  };
  metrics: {
    retentionRates: Array<{
      period: number; // months since cohort
      customerCount: number;
      retentionRate: number;
      revenueRetention: number;
    }>;
    churnRates: Array<{
      period: number;
      churnRate: number;
      customerCount: number;
    }>;
    averageOrderValue: Array<{
      period: number;
      aov: number;
      orderCount: number;
    }>;
    lifetimeValue: Array<{
      period: number;
      cumulativeCLV: number;
      customerCount: number;
    }>;
  };
  cohortCharacteristics: {
    demographics?: Record<string, any>;
    acquisitionChannel?: string;
    initialCampaign?: string;
    avgInitialOrderValue?: number;
  };
  comparisons: {
    vsAllCustomers: {
      retentionDifference: number;
      clvDifference: number;
      aovDifference: number;
    };
    vsOtherCohorts: Record<string, {
      retentionDifference: number;
      clvDifference: number;
      significance: number;
    }>;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IFeedbackAnalysis extends Document {
  customerId: string;
  analysisDate: Date;
  feedbackPeriod: {
    startDate: Date;
    endDate: Date;
  };
  sentimentAnalysis: {
    overallSentiment: 'positive' | 'neutral' | 'negative';
    sentimentScore: number; // -1 to 1
    confidence: number;
    emotionBreakdown: {
      joy: number;
      anger: number;
      fear: number;
      sadness: number;
      surprise: number;
      disgust: number;
    };
  };
  feedbackCategories: Array<{
    category: string;
    count: number;
    sentiment: 'positive' | 'neutral' | 'negative';
    keywords: string[];
    examples: string[];
  }>;
  insights: Array<{
    type: 'strength' | 'weakness' | 'opportunity' | 'threat';
    description: string;
    impact: 'high' | 'medium' | 'low';
    actionable: boolean;
    suggestedActions: string[];
    priority: number;
  }>;
  trends: {
    sentimentTrend: 'improving' | 'declining' | 'stable';
    volumeTrend: 'increasing' | 'decreasing' | 'stable';
    topicTrends: Record<string, 'increasing' | 'decreasing' | 'stable'>;
  };
  satisfactionMetrics: {
    npsScore: number;
    csatScore: number;
    cesScore: number;
    responseRate: number;
    averageResponseTime: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Schemas
const CLVCalculationSchema = new Schema<ICLVCalculation>({
  customerId: { type: String, required: true, index: true },
  calculationDate: { type: Date, required: true },
  period: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },
  historicalCLV: {
    totalRevenue: { type: Number, required: true },
    totalOrders: { type: Number, required: true },
    averageOrderValue: { type: Number, required: true },
    purchaseFrequency: { type: Number, required: true },
    customerLifetime: { type: Number, required: true },
    profitMargin: { type: Number, required: true },
    clv: { type: Number, required: true }
  },
  predictiveCLV: {
    predictedCLV: { type: Number, required: true },
    confidenceScore: { type: Number, required: true },
    timeHorizon: { type: Number, required: true },
    modelVersion: { type: String, required: true },
    features: {
      recencyScore: { type: Number, required: true },
      frequencyScore: { type: Number, required: true },
      monetaryScore: { type: Number, required: true },
      churnRisk: { type: Number, required: true },
      engagementScore: { type: Number, required: true }
    }
  },
  cohortAnalysis: {
    cohortId: { type: String, required: true },
    cohortType: { type: String, required: true, enum: ['acquisition', 'behavioral', 'demographic'] },
    cohortCLV: { type: Number, required: true },
    cohortPercentile: { type: Number, required: true }
  },
  segmentation: {
    segment: { type: String, required: true },
    segmentCLV: { type: Number, required: true },
    segmentPercentile: { type: Number, required: true },
    segmentCharacteristics: [{ type: String }]
  },
  trends: [{
    date: { type: Date, required: true },
    clv: { type: Number, required: true },
    revenue: { type: Number, required: true },
    orders: { type: Number, required: true },
    frequency: { type: Number, required: true }
  }]
}, { timestamps: true });

const ChurnPredictionSchema = new Schema<IChurnPrediction>({
  customerId: { type: String, required: true, index: true },
  predictionDate: { type: Date, required: true },
  churnProbability: { type: Number, required: true, min: 0, max: 1 },
  riskLevel: { type: String, required: true, enum: ['low', 'medium', 'high', 'critical'] },
  riskFactors: [{
    factor: { type: String, required: true },
    impact: { type: Number, required: true },
    description: { type: String, required: true }
  }],
  predictiveFeatures: {
    recencyDays: { type: Number, required: true },
    frequencyScore: { type: Number, required: true },
    monetaryScore: { type: Number, required: true },
    avgDaysBetweenOrders: { type: Number, required: true },
    orderTrend: { type: String, required: true, enum: ['increasing', 'decreasing', 'stable'] },
    satisfactionScore: { type: Number, required: true },
    supportTickets: { type: Number, required: true },
    lastInteractionDays: { type: Number, required: true }
  },
  preventionActions: [{
    action: { type: String, required: true },
    priority: { type: String, required: true, enum: ['low', 'medium', 'high'] },
    estimatedImpact: { type: Number, required: true },
    status: { type: String, required: true, enum: ['suggested', 'implemented', 'completed'] }
  }],
  modelVersion: { type: String, required: true },
  confidenceScore: { type: Number, required: true },
  nextPredictionDate: { type: Date, required: true }
}, { timestamps: true });

const CustomerSegmentSchema = new Schema<ICustomerSegment>({
  customerId: { type: String, required: true, index: true },
  segmentId: { type: String, required: true },
  segmentName: { type: String, required: true },
  segmentType: { type: String, required: true, enum: ['demographic', 'behavioral', 'psychographic', 'rfm', 'custom'] },
  assignmentDate: { type: Date, required: true },
  confidenceScore: { type: Number, required: true },
  characteristics: {
    demographics: {
      ageRange: String,
      gender: String,
      location: String,
      incomeLevel: String
    },
    behavioral: {
      purchaseFrequency: String,
      avgOrderValue: String,
      preferredCategories: [String],
      shoppingTimePreference: String
    },
    psychographic: {
      lifestyle: [String],
      interests: [String],
      values: [String],
      personalityTraits: [String]
    },
    rfm: {
      recencyScore: Number,
      frequencyScore: Number,
      monetaryScore: Number,
      rfmSegment: String
    }
  },
  segmentHistory: [{
    previousSegment: String,
    changeDate: Date,
    changeReason: String
  }],
  isActive: { type: Boolean, default: true },
  lastUpdated: { type: Date, required: true }
}, { timestamps: true });

const PurchasePatternSchema = new Schema<IPurchasePattern>({
  customerId: { type: String, required: true, index: true },
  analysisDate: { type: Date, required: true },
  period: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },
  basketAnalysis: {
    averageBasketSize: { type: Number, required: true },
    averageBasketValue: { type: Number, required: true },
    topProductCombinations: [{
      products: [String],
      frequency: Number,
      confidence: Number
    }],
    crossSellOpportunities: [{
      product: String,
      likelihood: Number,
      potentialRevenue: Number
    }],
    categoryAffinity: { type: Map, of: Number }
  },
  seasonalPatterns: {
    seasonalIndex: Number,
    peakSeasons: [String],
    offPeakSeasons: [String],
    holidayImpact: Number,
    weatherImpact: Number
  },
  temporalPatterns: {
    preferredShoppingDays: [String],
    preferredShoppingTimes: [String],
    purchaseCycle: Number,
    nextPredictedPurchase: Date
  },
  productPreferences: {
    favoriteCategories: [{
      category: String,
      spend: Number,
      frequency: Number,
      growth: Number
    }],
    brandPreferences: { type: Map, of: Number },
    priceSensitivity: { type: String, enum: ['low', 'medium', 'high'] },
    qualityPreference: { type: String, enum: ['budget', 'standard', 'premium'] }
  }
}, { timestamps: true });

const CustomerJourneySchema = new Schema<ICustomerJourney>({
  customerId: { type: String, required: true, index: true },
  journeyId: { type: String, required: true },
  journeyStartDate: { type: Date, required: true },
  currentStage: { type: String, required: true },
  journeyStatus: { type: String, required: true, enum: ['active', 'completed', 'abandoned', 'paused'] },
  touchpoints: [{
    id: { type: String, required: true },
    timestamp: { type: Date, required: true },
    channel: { type: String, required: true, enum: ['web', 'mobile', 'in_store', 'email', 'social', 'phone', 'other'] },
    action: { type: String, required: true },
    source: String,
    medium: String,
    campaign: String,
    content: String,
    value: Number,
    converted: { type: Boolean, default: false },
    duration: Number,
    metadata: { type: Map, of: Schema.Types.Mixed }
  }],
  funnelAnalysis: {
    entryPoint: String,
    conversionPath: [String],
    dropoffPoints: [{
      stage: String,
      dropoffRate: Number,
      dropoffReason: String
    }],
    totalDuration: Number,
    conversionRate: Number,
    pathEfficiency: Number
  },
  attribution: {
    firstTouch: String,
    lastTouch: String,
    linearAttribution: { type: Map, of: Number },
    timeDecayAttribution: { type: Map, of: Number },
    positionBasedAttribution: { type: Map, of: Number }
  },
  goals: [{
    goalId: { type: String, required: true },
    goalName: { type: String, required: true },
    goalValue: { type: Number, required: true },
    completed: { type: Boolean, default: false },
    completionDate: Date,
    timeToCompletion: Number
  }]
}, { timestamps: true });

const CohortAnalysisSchema = new Schema<ICohortAnalysis>({
  cohortId: { type: String, required: true, unique: true },
  cohortName: { type: String, required: true },
  cohortType: { type: String, required: true, enum: ['time_based', 'behavioral', 'acquisition_channel', 'demographic', 'custom'] },
  cohortDate: { type: Date, required: true },
  cohortSize: { type: Number, required: true },
  analysisPeriod: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },
  metrics: {
    retentionRates: [{
      period: Number,
      customerCount: Number,
      retentionRate: Number,
      revenueRetention: Number
    }],
    churnRates: [{
      period: Number,
      churnRate: Number,
      customerCount: Number
    }],
    averageOrderValue: [{
      period: Number,
      aov: Number,
      orderCount: Number
    }],
    lifetimeValue: [{
      period: Number,
      cumulativeCLV: Number,
      customerCount: Number
    }]
  },
  cohortCharacteristics: {
    demographics: { type: Map, of: Schema.Types.Mixed },
    acquisitionChannel: String,
    initialCampaign: String,
    avgInitialOrderValue: Number
  },
  comparisons: {
    vsAllCustomers: {
      retentionDifference: Number,
      clvDifference: Number,
      aovDifference: Number
    },
    vsOtherCohorts: { type: Map, of: {
      retentionDifference: Number,
      clvDifference: Number,
      significance: Number
    }}
  }
}, { timestamps: true });

const FeedbackAnalysisSchema = new Schema<IFeedbackAnalysis>({
  customerId: { type: String, required: true, index: true },
  analysisDate: { type: Date, required: true },
  feedbackPeriod: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },
  sentimentAnalysis: {
    overallSentiment: { type: String, required: true, enum: ['positive', 'neutral', 'negative'] },
    sentimentScore: { type: Number, required: true, min: -1, max: 1 },
    confidence: { type: Number, required: true },
    emotionBreakdown: {
      joy: Number,
      anger: Number,
      fear: Number,
      sadness: Number,
      surprise: Number,
      disgust: Number
    }
  },
  feedbackCategories: [{
    category: { type: String, required: true },
    count: { type: Number, required: true },
    sentiment: { type: String, required: true, enum: ['positive', 'neutral', 'negative'] },
    keywords: [String],
    examples: [String]
  }],
  insights: [{
    type: { type: String, required: true, enum: ['strength', 'weakness', 'opportunity', 'threat'] },
    description: { type: String, required: true },
    impact: { type: String, required: true, enum: ['high', 'medium', 'low'] },
    actionable: { type: Boolean, required: true },
    suggestedActions: [String],
    priority: Number
  }],
  trends: {
    sentimentTrend: { type: String, enum: ['improving', 'declining', 'stable'] },
    volumeTrend: { type: String, enum: ['increasing', 'decreasing', 'stable'] },
    topicTrends: { type: Map, of: String }
  },
  satisfactionMetrics: {
    npsScore: Number,
    csatScore: Number,
    cesScore: Number,
    responseRate: Number,
    averageResponseTime: Number
  }
}, { timestamps: true });

// Indexes
CLVCalculationSchema.index({ customerId: 1, calculationDate: -1 });
CLVCalculationSchema.index({ period: 1 });
CLVCalculationSchema.index({ 'historicalCLV.clv': -1 });
CLVCalculationSchema.index({ 'predictiveCLV.predictedCLV': -1 });

ChurnPredictionSchema.index({ customerId: 1, predictionDate: -1 });
ChurnPredictionSchema.index({ churnProbability: -1 });
ChurnPredictionSchema.index({ riskLevel: 1 });
ChurnPredictionSchema.index({ nextPredictionDate: 1 });

CustomerSegmentSchema.index({ customerId: 1, segmentType: 1 });
CustomerSegmentSchema.index({ segmentId: 1 });
CustomerSegmentSchema.index({ segmentType: 1, assignmentDate: -1 });

PurchasePatternSchema.index({ customerId: 1, analysisDate: -1 });
PurchasePatternSchema.index({ 'temporalPatterns.nextPredictedPurchase': 1 });

CustomerJourneySchema.index({ customerId: 1, journeyStartDate: -1 });
CustomerJourneySchema.index({ journeyStatus: 1 });
CustomerJourneySchema.index({ currentStage: 1 });

CohortAnalysisSchema.index({ cohortType: 1, cohortDate: -1 });
CohortAnalysisSchema.index({ cohortDate: -1 });

FeedbackAnalysisSchema.index({ customerId: 1, analysisDate: -1 });
FeedbackAnalysisSchema.index({ 'sentimentAnalysis.overallSentiment': 1 });
FeedbackAnalysisSchema.index({ 'sentimentAnalysis.sentimentScore': -1 });

// Models
export const CLVCalculation = mongoose.model<ICLVCalculation>('CLVCalculation', CLVCalculationSchema);
export const ChurnPrediction = mongoose.model<IChurnPrediction>('ChurnPrediction', ChurnPredictionSchema);
export const CustomerSegment = mongoose.model<ICustomerSegment>('CustomerSegment', CustomerSegmentSchema);
export const PurchasePattern = mongoose.model<IPurchasePattern>('PurchasePattern', PurchasePatternSchema);
export const CustomerJourney = mongoose.model<ICustomerJourney>('CustomerJourney', CustomerJourneySchema);
export const CohortAnalysis = mongoose.model<ICohortAnalysis>('CohortAnalysis', CohortAnalysisSchema);
export const FeedbackAnalysis = mongoose.model<IFeedbackAnalysis>('FeedbackAnalysis', FeedbackAnalysisSchema);
