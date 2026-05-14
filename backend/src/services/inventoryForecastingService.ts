import { InventoryItem, IInventoryItem } from '../models/Inventory';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { Customer } from '../models/Customer';

export interface DemandForecast {
  forecastId: string;
  productId: string;
  sku: string;
  productName: string;
  warehouseId?: string;
  forecastPeriod: {
    startDate: Date;
    endDate: Date;
    granularity: 'daily' | 'weekly' | 'monthly';
  };
  methodology: {
    algorithm: 'moving_average' | 'exponential_smoothing' | 'arima' | 'neural_network' | 'ensemble';
    parameters: any;
    confidenceLevel: number; // 0-100%
    accuracyMetrics: {
      mape: number; // Mean Absolute Percentage Error
      mad: number; // Mean Absolute Deviation
      mse: number; // Mean Squared Error
      trackingSignal: number;
    };
  };
  forecasts: Array<{
    date: Date;
    predictedDemand: number;
    confidenceInterval: {
      lower: number;
      upper: number;
    };
    probability: number;
    factors: {
      seasonality: number;
      trend: number;
      promotional: number;
      external: number;
    };
  }>;
  historicalData: {
    period: string;
    actualDemand: number;
    predictedDemand?: number;
    variance?: number;
    accuracy?: number;
  }[];
  insights: Array<{
    type: 'trend' | 'seasonality' | 'anomaly' | 'opportunity' | 'risk';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    impact: string;
    recommendation: string;
    confidence: number;
  }>;
  generatedAt: Date;
  generatedBy: string;
  lastValidated: Date;
  validatedBy?: string;
}

export interface DemandPlanning {
  planningId: string;
  productId: string;
  sku: string;
  planningHorizon: {
    startDate: Date;
    endDate: Date;
    periods: Array<{
      startDate: Date;
      endDate: Date;
      targetDemand: number;
      minDemand: number;
      maxDemand: number;
      confidence: number;
    }>;
  };
  inventoryStrategy: {
    serviceLevel: number; // 0-100%
    safetyStockDays: number;
    reorderPointDays: number;
    orderQuantityDays: number;
    maxStockDays: number;
  };
  supplyPlan: Array<{
    period: Date;
    plannedReceipts: number;
    plannedIssues: number;
    projectedInventory: number;
    minRequired: number;
    maxAllowed: number;
    surplusShortage: number;
    actionRequired: boolean;
    recommendedAction?: string;
  }>;
  constraints: {
    storageCapacity: number;
    budgetLimit: number;
    supplierCapacity: number;
    leadTimeVariability: number;
    demandVariability: number;
  };
  scenarios: Array<{
    name: string;
    description: string;
    probability: number;
    impact: {
      inventoryLevel: number;
      serviceLevel: number;
      cost: number;
      revenue: number;
    };
    adjustments: Array<{
      parameter: string;
      originalValue: number;
      adjustedValue: number;
      reason: string;
    }>;
  }>;
  recommendations: Array<{
    category: 'inventory' | 'procurement' | 'pricing' | 'promotion';
    priority: 'low' | 'medium' | 'high' | 'critical';
    action: string;
    expectedImpact: string;
    timeframe: string;
    cost: number;
    benefit: number;
    roi: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: Date;
}

export interface ForecastAccuracyReport {
  reportId: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  methodology: string;
  summary: {
    totalForecasts: number;
    accurateForecasts: number; // within 10% variance
    averageAccuracy: number;
    averageMAPE: number;
    averageMAD: number;
    trackingSignal: number;
  };
  byProduct: Array<{
    productId: string;
    productName: string;
    sku: string;
    forecasts: number;
    accuracy: number;
    mape: number;
    mad: number;
    trend: 'improving' | 'stable' | 'declining';
  }>;
  byTimePeriod: Array<{
    period: string;
    accuracy: number;
    variance: number;
    factors: string[];
  }>;
  byForecastMethod: Array<{
    method: string;
    accuracy: number;
    usage: number;
    bestFor: string[];
  }>;
  errorAnalysis: {
    systematicErrors: Array<{
      type: string;
      frequency: number;
      impact: string;
      correction: string;
    }>;
    outliers: Array<{
      date: Date;
      productId: string;
      actual: number;
      forecast: number;
      error: number;
      reason: string;
    }>;
  };
  recommendations: Array<{
    area: string;
    issue: string;
    solution: string;
    expectedImprovement: number;
    priority: 'low' | 'medium' | 'high';
  }>;
  generatedAt: Date;
  generatedBy: string;
}

export interface SeasonalAnalysis {
  analysisId: string;
  productId: string;
  sku: string;
  analysisPeriod: {
    startDate: Date;
    endDate: Date;
    cycles: number;
  };
  seasonality: {
    detected: boolean;
    strength: number; // 0-100%
    pattern: Array<{
      period: string; // month, week, day
      index: number; // seasonal index
      confidence: number;
    }>;
    peakPeriods: Array<{
      startDate: Date;
      endDate: Date;
      multiplier: number;
      confidence: number;
    }>;
    lowPeriods: Array<{
      startDate: Date;
      endDate: Date;
      multiplier: number;
      confidence: number;
    }>;
  };
  trend: {
    direction: 'increasing' | 'decreasing' | 'stable';
    rate: number; // units per period
    confidence: number;
    changePoints: Array<{
      date: Date;
      type: 'increase' | 'decrease';
      magnitude: number;
      confidence: number;
    }>;
  };
  cyclicalPatterns: Array<{
    name: string;
    period: number; // days
    strength: number;
    confidence: number;
    description: string;
  }>;
  externalFactors: Array<{
    factor: string;
    correlation: number;
    impact: 'positive' | 'negative' | 'neutral';
    lag: number; // days
    confidence: number;
  }>;
  recommendations: Array<{
    type: 'inventory' | 'pricing' | 'promotion' | 'staffing';
    period: string;
    action: string;
    expectedImpact: string;
  }>;
  generatedAt: Date;
  generatedBy: string;
}

export interface DemandDriverAnalysis {
  analysisId: string;
  productId: string;
  sku: string;
  analysisPeriod: {
    startDate: Date;
    endDate: Date;
  };
  drivers: Array<{
    factor: string;
    type: 'internal' | 'external' | 'market' | 'competitive';
    correlation: number; // -1 to 1
    significance: number; // p-value
    impact: 'high' | 'medium' | 'low';
    direction: 'positive' | 'negative';
    lag: number; // days
    description: string;
    dataPoints: Array<{
      date: Date;
      factorValue: number;
      demand: number;
    }>;
  }>;
  model: {
    type: 'linear' | 'polynomial' | 'exponential' | 'logarithmic';
    equation: string;
    rSquared: number;
    adjustedRSquared: number;
    coefficients: Array<{
      variable: string;
      coefficient: number;
      standardError: number;
      tValue: number;
      pValue: number;
    }>;
  };
  predictions: Array<{
    scenario: string;
    assumptions: Array<{
      factor: string;
      value: number;
      change: number;
    }>;
    predictedDemand: number;
    confidence: number;
    riskLevel: 'low' | 'medium' | 'high';
  }>;
  insights: Array<{
    category: 'correlation' | 'causation' | 'opportunity' | 'risk';
    finding: string;
    implication: string;
    actionability: 'high' | 'medium' | 'low';
  }>;
  generatedAt: Date;
  generatedBy: string;
}

export class InventoryForecastingService {
  // Demand Forecasting
  async generateDemandForecast(params: {
    productId: string;
    warehouseId?: string;
    forecastPeriod: {
      startDate: Date;
      endDate: Date;
      granularity: 'daily' | 'weekly' | 'monthly';
    };
    methodology: {
      algorithm: 'moving_average' | 'exponential_smoothing' | 'arima' | 'neural_network' | 'ensemble';
      parameters?: any;
      confidenceLevel: number;
    };
    historicalDataDays?: number;
    includeSeasonality?: boolean;
    includePromotions?: boolean;
    requestedBy: string;
  }): Promise<DemandForecast> {
    const product = await Product.findOne({ productId: params.productId });
    if (!product) {
      throw new Error('Product not found');
    }

    const forecastId = `FC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Get historical demand data
    const historicalData = await this.getHistoricalDemand(
      params.productId,
      params.warehouseId,
      params.historicalDataDays || 365
    );

    // Generate forecast based on selected algorithm
    const forecasts = await this.applyForecastingAlgorithm(
      historicalData,
      params.methodology.algorithm,
      params.methodology.parameters || {},
      params.forecastPeriod,
      params.methodology.confidenceLevel
    );

    // Calculate accuracy metrics (using historical backtesting)
    const accuracyMetrics = await this.calculateForecastAccuracy(
      historicalData,
      params.methodology.algorithm,
      params.methodology.parameters || {}
    );

    // Generate insights
    const insights = await this.generateForecastInsights(
      historicalData,
      forecasts,
      params.methodology.confidenceLevel
    );

    const demandForecast: DemandForecast = {
      forecastId,
      productId: params.productId,
      sku: product.sku,
      productName: product.name,
      warehouseId: params.warehouseId,
      forecastPeriod: params.forecastPeriod,
      methodology: {
        algorithm: params.methodology.algorithm,
        parameters: params.methodology.parameters || {},
        confidenceLevel: params.methodology.confidenceLevel,
        accuracyMetrics
      },
      forecasts,
      historicalData: historicalData.map(data => ({
        period: data.date.toISOString().split('T')[0],
        actualDemand: data.demand,
        variance: data.variance,
        accuracy: data.accuracy
      })),
      insights,
      generatedAt: new Date(),
      generatedBy: params.requestedBy,
      lastValidated: new Date()
    };

    return demandForecast;
  }

  // Demand Planning
  async createDemandPlan(params: {
    productId: string;
    warehouseId?: string;
    planningHorizon: {
      startDate: Date;
      endDate: Date;
      granularity: 'daily' | 'weekly' | 'monthly';
    };
    inventoryStrategy: {
      serviceLevel: number;
      safetyStockDays: number;
      reorderPointDays: number;
      orderQuantityDays: number;
      maxStockDays: number;
    };
    constraints?: {
      storageCapacity?: number;
      budgetLimit?: number;
      supplierCapacity?: number;
      leadTimeVariability?: number;
      demandVariability?: number;
    };
    scenarios?: Array<{
      name: string;
      description: string;
      probability: number;
      adjustments: Array<{
        parameter: string;
        adjustedValue: number;
        reason: string;
      }>;
    }>;
    requestedBy: string;
  }): Promise<DemandPlanning> {
    const planningId = `DP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const product = await Product.findOne({ productId: params.productId });
    if (!product) {
      throw new Error('Product not found');
    }

    // Get demand forecast for the planning period
    const forecast = await this.generateDemandForecast({
      productId: params.productId,
      warehouseId: params.warehouseId,
      forecastPeriod: {
        startDate: params.planningHorizon.startDate,
        endDate: params.planningHorizon.endDate,
        granularity: params.planningHorizon.granularity
      },
      methodology: {
        algorithm: 'ensemble',
        confidenceLevel: 95
      },
      requestedBy: params.requestedBy
    });

    // Create planning periods
    const periods = this.createPlanningPeriods(params.planningHorizon, forecast.forecasts);

    // Generate supply plan
    const supplyPlan = await this.generateSupplyPlan(
      params.productId,
      params.warehouseId,
      periods,
      params.inventoryStrategy,
      params.constraints || {}
    );

    // Analyze scenarios
    const scenarios = await this.analyzeScenarios(
      supplyPlan,
      params.scenarios || [],
      params.constraints || {}
    );

    // Generate recommendations
    const recommendations = await this.generatePlanningRecommendations(
      supplyPlan,
      scenarios,
      params.inventoryStrategy
    );

    const demandPlanning: DemandPlanning = {
      planningId,
      productId: params.productId,
      sku: product.sku,
      planningHorizon: {
        startDate: params.planningHorizon.startDate,
        endDate: params.planningHorizon.endDate,
        periods
      },
      inventoryStrategy: params.inventoryStrategy,
      supplyPlan,
      constraints: {
        storageCapacity: params.constraints?.storageCapacity || 10000,
        budgetLimit: params.constraints?.budgetLimit || 100000,
        supplierCapacity: params.constraints?.supplierCapacity || 1000,
        leadTimeVariability: params.constraints?.leadTimeVariability || 0.1,
        demandVariability: params.constraints?.demandVariability || 0.2
      },
      scenarios,
      recommendations,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: params.requestedBy
    };

    return demandPlanning;
  }

  // Forecast Accuracy Analysis
  async analyzeForecastAccuracy(params: {
    productId?: string;
    warehouseId?: string;
    methodology?: string;
    startDate: Date;
    endDate: Date;
    requestedBy: string;
  }): Promise<ForecastAccuracyReport> {
    const reportId = `FA-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Get forecast vs actual data
    const forecastData = await this.getForecastAccuracyData(
      params.productId,
      params.warehouseId,
      params.methodology,
      params.startDate,
      params.endDate
    );

    // Calculate summary metrics
    const summary = this.calculateAccuracySummary(forecastData);

    // Analyze by product
    const byProduct = await this.analyzeAccuracyByProduct(forecastData);

    // Analyze by time period
    const byTimePeriod = this.analyzeAccuracyByTimePeriod(forecastData);

    // Analyze by forecast method
    const byForecastMethod = this.analyzeAccuracyByMethod(forecastData);

    // Error analysis
    const errorAnalysis = await this.performErrorAnalysis(forecastData);

    // Generate recommendations
    const recommendations = this.generateAccuracyRecommendations(summary, errorAnalysis);

    const report: ForecastAccuracyReport = {
      reportId,
      period: {
        startDate: params.startDate,
        endDate: params.endDate
      },
      methodology: params.methodology || 'all',
      summary,
      byProduct,
      byTimePeriod,
      byForecastMethod,
      errorAnalysis,
      recommendations,
      generatedAt: new Date(),
      generatedBy: params.requestedBy
    };

    return report;
  }

  // Seasonal Analysis
  async performSeasonalAnalysis(params: {
    productId: string;
    warehouseId?: string;
    analysisPeriod: {
      startDate: Date;
      endDate: Date;
    };
    requestedBy: string;
  }): Promise<SeasonalAnalysis> {
    const analysisId = `SA-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const product = await Product.findOne({ productId: params.productId });
    if (!product) {
      throw new Error('Product not found');
    }

    // Get historical data for analysis
    const historicalData = await this.getHistoricalDemand(
      params.productId,
      params.warehouseId,
      Math.floor((params.analysisPeriod.endDate.getTime() - params.analysisPeriod.startDate.getTime()) / (24 * 60 * 60 * 1000))
    );

    // Detect seasonality
    const seasonality = await this.detectSeasonality(historicalData);

    // Analyze trend
    const trend = await this.analyzeTrend(historicalData);

    // Identify cyclical patterns
    const cyclicalPatterns = await this.identifyCyclicalPatterns(historicalData);

    // Analyze external factors
    const externalFactors = await this.analyzeExternalFactors(params.productId, historicalData);

    // Generate recommendations
    const recommendations = this.generateSeasonalRecommendations(seasonality, trend, cyclicalPatterns);

    const analysis: SeasonalAnalysis = {
      analysisId,
      productId: params.productId,
      sku: product.sku,
      analysisPeriod: {
        startDate: params.analysisPeriod.startDate,
        endDate: params.analysisPeriod.endDate,
        cycles: Math.floor((params.analysisPeriod.endDate.getTime() - params.analysisPeriod.startDate.getTime()) / (365 * 24 * 60 * 60 * 1000))
      },
      seasonality,
      trend,
      cyclicalPatterns,
      externalFactors,
      recommendations,
      generatedAt: new Date(),
      generatedBy: params.requestedBy
    };

    return analysis;
  }

  // Demand Driver Analysis
  async analyzeDemandDrivers(params: {
    productId: string;
    warehouseId?: string;
    analysisPeriod: {
      startDate: Date;
      endDate: Date;
    };
    factors: string[];
    requestedBy: string;
  }): Promise<DemandDriverAnalysis> {
    const analysisId = `DDA-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const product = await Product.findOne({ productId: params.productId });
    if (!product) {
      throw new Error('Product not found');
    }

    // Get demand and factor data
    const demandData = await this.getHistoricalDemand(
      params.productId,
      params.warehouseId,
      Math.floor((params.analysisPeriod.endDate.getTime() - params.analysisPeriod.startDate.getTime()) / (24 * 60 * 60 * 1000))
    );

    const factorData = await this.getFactorData(params.factors, params.analysisPeriod);

    // Analyze correlations
    const drivers = await this.analyzeCorrelations(demandData, factorData);

    // Build regression model
    const model = await this.buildRegressionModel(demandData, factorData, drivers);

    // Generate predictions for different scenarios
    const predictions = await this.generateScenarioPredictions(model, drivers);

    // Generate insights
    const insights = this.generateDriverInsights(drivers, model);

    const analysis: DemandDriverAnalysis = {
      analysisId,
      productId: params.productId,
      sku: product.sku,
      analysisPeriod: params.analysisPeriod,
      drivers,
      model,
      predictions,
      insights,
      generatedAt: new Date(),
      generatedBy: params.requestedBy
    };

    return analysis;
  }

  // Helper methods
  private async getHistoricalDemand(productId: string, warehouseId?: string, days: number = 365) {
    // Simplified historical demand retrieval
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    // In a real implementation, this would query actual sales/order data
    const demandData = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const baseDemand = 100; // Base demand
      const seasonalFactor = 1 + 0.3 * Math.sin(2 * Math.PI * i / 365); // Seasonal pattern
      const randomVariation = 0.9 + Math.random() * 0.2; // Random variation
      const demand = Math.round(baseDemand * seasonalFactor * randomVariation);

      demandData.push({
        date,
        demand,
        variance: Math.random() * 20 - 10,
        accuracy: 85 + Math.random() * 15
      });
    }

    return demandData;
  }

  private async applyForecastingAlgorithm(
    historicalData: any[],
    algorithm: string,
    parameters: any,
    forecastPeriod: any,
    confidenceLevel: number
  ) {
    const forecasts = [];
    const startDate = forecastPeriod.startDate;
    const endDate = forecastPeriod.endDate;
    const granularity = forecastPeriod.granularity;

    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    const periods = granularity === 'daily' ? daysDiff : 
                   granularity === 'weekly' ? Math.ceil(daysDiff / 7) : 
                   Math.ceil(daysDiff / 30);

    for (let i = 0; i < periods; i++) {
      const date = new Date(startDate.getTime() + i * (daysDiff / periods) * 24 * 60 * 60 * 1000);
      
      let predictedDemand = 0;
      let confidenceInterval = { lower: 0, upper: 0 };

      switch (algorithm) {
        case 'moving_average':
          const window = parameters.window || 7;
          const recentData = historicalData.slice(-window);
          predictedDemand = recentData.reduce((sum, d) => sum + d.demand, 0) / recentData.length;
          const stdDev = Math.sqrt(recentData.reduce((sum, d) => sum + Math.pow(d.demand - predictedDemand, 2), 0) / recentData.length);
          confidenceInterval = {
            lower: predictedDemand - 1.96 * stdDev,
            upper: predictedDemand + 1.96 * stdDev
          };
          break;

        case 'exponential_smoothing':
          const alpha = parameters.alpha || 0.3;
          let smoothed = historicalData[0]?.demand || 0;
          for (const data of historicalData) {
            smoothed = alpha * data.demand + (1 - alpha) * smoothed;
          }
          predictedDemand = smoothed;
          confidenceInterval = {
            lower: predictedDemand * 0.8,
            upper: predictedDemand * 1.2
          };
          break;

        case 'arima':
          // Simplified ARIMA - would use proper statistical library
          predictedDemand = historicalData.reduce((sum, d) => sum + d.demand, 0) / historicalData.length * 1.1;
          confidenceInterval = {
            lower: predictedDemand * 0.85,
            upper: predictedDemand * 1.15
          };
          break;

        case 'neural_network':
          // Simplified neural network - would use ML library
          predictedDemand = historicalData.reduce((sum, d) => sum + d.demand, 0) / historicalData.length * 1.05;
          confidenceInterval = {
            lower: predictedDemand * 0.9,
            upper: predictedDemand * 1.1
          };
          break;

        case 'ensemble':
          // Combine multiple methods
          const ma = historicalData.slice(-7).reduce((sum, d) => sum + d.demand, 0) / 7;
          const es = historicalData.reduce((sum, d, idx, arr) => {
            const alpha = 0.3;
            return idx === 0 ? d.demand : alpha * d.demand + (1 - alpha) * sum;
          }, 0);
          predictedDemand = (ma + es) / 2;
          confidenceInterval = {
            lower: predictedDemand * 0.88,
            upper: predictedDemand * 1.12
          };
          break;

        default:
          predictedDemand = historicalData.reduce((sum, d) => sum + d.demand, 0) / historicalData.length;
          confidenceInterval = {
            lower: predictedDemand * 0.9,
            upper: predictedDemand * 1.1
          };
      }

      forecasts.push({
        date,
        predictedDemand: Math.round(predictedDemand),
        confidenceInterval,
        probability: confidenceLevel / 100,
        factors: {
          seasonality: 1.0,
          trend: 1.0,
          promotional: 1.0,
          external: 1.0
        }
      });
    }

    return forecasts;
  }

  private async calculateForecastAccuracy(historicalData: any[], algorithm: string, parameters: any) {
    // Simplified accuracy calculation using backtesting
    const testData = historicalData.slice(-30); // Last 30 days for testing
    const trainingData = historicalData.slice(0, -30);

    let totalError = 0;
    let totalAbsoluteError = 0;
    let totalSquaredError = 0;
    let trackingSignal = 0;

    for (let i = 0; i < testData.length; i++) {
      const actual = testData[i].demand;
      
      // Simple forecast using training data average
      const forecast = trainingData.reduce((sum, d) => sum + d.demand, 0) / trainingData.length;
      
      const error = actual - forecast;
      const absoluteError = Math.abs(error);
      const squaredError = error * error;

      totalError += error;
      totalAbsoluteError += absoluteError;
      totalSquaredError += squaredError;
      trackingSignal += error;
    }

    const mape = (totalAbsoluteError / testData.length) / (trainingData.reduce((sum, d) => sum + d.demand, 0) / trainingData.length) * 100;
    const mad = totalAbsoluteError / testData.length;
    const mse = totalSquaredError / testData.length;

    return {
      mape: Math.round(mape * 100) / 100,
      mad: Math.round(mad * 100) / 100,
      mse: Math.round(mse * 100) / 100,
      trackingSignal: Math.round(trackingSignal * 100) / 100
    };
  }

  private async generateForecastInsights(historicalData: any[], forecasts: any[], confidenceLevel: number) {
    const insights = [];

    // Analyze trend
    const recentDemand = historicalData.slice(-7).reduce((sum, d) => sum + d.demand, 0) / 7;
    const olderDemand = historicalData.slice(-30, -23).reduce((sum, d) => sum + d.demand, 0) / 7;
    const trendChange = ((recentDemand - olderDemand) / olderDemand) * 100;

    if (Math.abs(trendChange) > 10) {
      insights.push({
        type: 'trend' as const,
        severity: Math.abs(trendChange) > 20 ? 'high' as const : 'medium' as const,
        message: `Demand trend has ${trendChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(trendChange).toFixed(1)}% recently`,
        impact: trendChange > 0 ? 'Higher sales potential' : 'Risk of overstocking',
        recommendation: trendChange > 0 ? 'Consider increasing inventory levels' : 'Review inventory reduction strategies',
        confidence: confidenceLevel
      });
    }

    // Analyze forecast volatility
    const forecastValues = forecasts.map(f => f.predictedDemand);
    const avgForecast = forecastValues.reduce((sum, f) => sum + f, 0) / forecastValues.length;
    const volatility = forecastValues.reduce((sum, f) => sum + Math.pow(f - avgForecast, 2), 0) / forecastValues.length;

    if (volatility > avgForecast * 0.25) {
      insights.push({
        type: 'anomaly' as const,
        severity: 'medium' as const,
        message: 'High forecast volatility detected',
        impact: 'Increased inventory risk',
        recommendation: 'Consider increasing safety stock or improving forecast accuracy',
        confidence: confidenceLevel - 10
      });
    }

    return insights;
  }

  private createPlanningPeriods(planningHorizon: any, forecasts: any[]) {
    return forecasts.map(forecast => ({
      startDate: forecast.date,
      endDate: new Date(forecast.date.getTime() + 24 * 60 * 60 * 1000),
      targetDemand: forecast.predictedDemand,
      minDemand: forecast.confidenceInterval.lower,
      maxDemand: forecast.confidenceInterval.upper,
      confidence: forecast.probability
    }));
  }

  private async generateSupplyPlan(productId: string, warehouseId: string | undefined, periods: any[], strategy: any, constraints: any) {
    const supplyPlan = [];
    let currentInventory = 100; // Starting inventory (simplified)

    for (const period of periods) {
      const demand = period.targetDemand;
      const minRequired = demand * (strategy.serviceLevel / 100) + demand * (strategy.safetyStockDays / 30);
      const maxAllowed = demand * strategy.maxStockDays / 30;
      
      const plannedIssues = demand;
      let plannedReceipts = 0;
      
      if (currentInventory < minRequired) {
        plannedReceipts = minRequired - currentInventory;
      } else if (currentInventory > maxAllowed) {
        // No receipts needed, might need to reduce inventory
      }

      currentInventory = currentInventory + plannedReceipts - plannedIssues;
      const surplusShortage = currentInventory - minRequired;

      supplyPlan.push({
        period: period.startDate,
        plannedReceipts,
        plannedIssues,
        projectedInventory: currentInventory,
        minRequired,
        maxAllowed,
        surplusShortage,
        actionRequired: Math.abs(surplusShortage) > demand * 0.2,
        recommendedAction: surplusShortage < -demand * 0.2 ? 'Place order' : 
                           surplusShortage > demand * 0.5 ? 'Reduce order' : undefined
      });
    }

    return supplyPlan;
  }

  private async analyzeScenarios(supplyPlan: any[], scenarios: any[], constraints: any) {
    return scenarios.map(scenario => ({
      name: scenario.name,
      description: scenario.description,
      probability: scenario.probability,
      impact: {
        inventoryLevel: supplyPlan.reduce((sum, p) => sum + p.projectedInventory, 0),
        serviceLevel: 95, // Simplified
        cost: 10000, // Simplified
        revenue: 50000 // Simplified
      },
      adjustments: scenario.adjustments
    }));
  }

  private async generatePlanningRecommendations(supplyPlan: any[], scenarios: any[], strategy: any) {
    const recommendations = [];
    
    const criticalPeriods = supplyPlan.filter(p => p.actionRequired);
    if (criticalPeriods.length > 0) {
      recommendations.push({
        category: 'inventory' as const,
        priority: 'high' as const,
        action: `Address ${criticalPeriods.length} critical inventory periods`,
        expectedImpact: 'Prevent stockouts and overstock situations',
        timeframe: 'Next 30 days',
        cost: 5000,
        benefit: 25000,
        roi: 400
      });
    }

    return recommendations;
  }

  private async getForecastAccuracyData(productId?: string, warehouseId?: string, methodology?: string, startDate: Date, endDate: Date) {
    // Simplified forecast accuracy data retrieval
    return [
      {
        productId: 'PROD001',
        date: new Date(),
        actual: 100,
        forecast: 95,
        method: 'moving_average',
        accuracy: 95
      }
    ];
  }

  private calculateAccuracySummary(forecastData: any[]) {
    const totalForecasts = forecastData.length;
    const accurateForecasts = forecastData.filter(f => f.accuracy >= 90).length;
    const averageAccuracy = forecastData.reduce((sum, f) => sum + f.accuracy, 0) / totalForecasts;
    
    return {
      totalForecasts,
      accurateForecasts,
      averageAccuracy: Math.round(averageAccuracy * 100) / 100,
      averageMAPE: 8.5,
      averageMAD: 12.3,
      trackingSignal: 0.5
    };
  }

  private async analyzeAccuracyByProduct(forecastData: any[]) {
    // Simplified product analysis
    return [];
  }

  private analyzeAccuracyByTimePeriod(forecastData: any[]) {
    // Simplified time period analysis
    return [];
  }

  private analyzeAccuracyByMethod(forecastData: any[]) {
    // Simplified method analysis
    return [];
  }

  private async performErrorAnalysis(forecastData: any[]) {
    return {
      systematicErrors: [],
      outliers: []
    };
  }

  private generateAccuracyRecommendations(summary: any, errorAnalysis: any) {
    const recommendations = [];
    
    if (summary.averageAccuracy < 85) {
      recommendations.push({
        area: 'Forecast Method',
        issue: 'Low forecast accuracy',
        solution: 'Implement ensemble forecasting methods',
        expectedImprovement: 10,
        priority: 'high' as const
      });
    }

    return recommendations;
  }

  private async detectSeasonality(historicalData: any[]) {
    // Simplified seasonality detection
    return {
      detected: true,
      strength: 75,
      pattern: [
        { period: 'Jan', index: 0.8, confidence: 90 },
        { period: 'Feb', index: 0.9, confidence: 85 },
        { period: 'Mar', index: 1.1, confidence: 88 },
        { period: 'Apr', index: 1.2, confidence: 92 },
        { period: 'May', index: 1.3, confidence: 95 },
        { period: 'Jun', index: 1.4, confidence: 93 },
        { period: 'Jul', index: 1.3, confidence: 90 },
        { period: 'Aug', index: 1.2, confidence: 87 },
        { period: 'Sep', index: 1.1, confidence: 85 },
        { period: 'Oct', index: 1.0, confidence: 83 },
        { period: 'Nov', index: 0.9, confidence: 80 },
        { period: 'Dec', index: 0.8, confidence: 78 }
      ],
      peakPeriods: [
        { startDate: new Date('2024-05-01'), endDate: new Date('2024-07-31'), multiplier: 1.3, confidence: 92 }
      ],
      lowPeriods: [
        { startDate: new Date('2024-12-01'), endDate: new Date('2024-02-28'), multiplier: 0.8, confidence: 85 }
      ]
    };
  }

  private async analyzeTrend(historicalData: any[]) {
    // Simplified trend analysis
    return {
      direction: 'increasing' as const,
      rate: 2.5,
      confidence: 85,
      changePoints: []
    };
  }

  private async identifyCyclicalPatterns(historicalData: any[]) {
    // Simplified cyclical pattern identification
    return [
      {
        name: 'Weekly Pattern',
        period: 7,
        strength: 60,
        confidence: 75,
        description: 'Higher demand on weekdays'
      }
    ];
  }

  private async analyzeExternalFactors(productId: string, historicalData: any[]) {
    // Simplified external factor analysis
    return [
      {
        factor: 'Temperature',
        correlation: 0.65,
        impact: 'positive' as const,
        lag: 0,
        confidence: 70
      }
    ];
  }

  private generateSeasonalRecommendations(seasonality: any, trend: any, cyclicalPatterns: any[]) {
    const recommendations = [];
    
    if (seasonality.detected && seasonality.strength > 70) {
      recommendations.push({
        type: 'inventory' as const,
        period: 'Peak Season',
        action: 'Increase safety stock by 30% during peak periods',
        expectedImpact: 'Reduce stockout risk by 50%'
      });
    }

    return recommendations;
  }

  private async getFactorData(factors: string[], analysisPeriod: any) {
    // Simplified factor data retrieval
    return {};
  }

  private async analyzeCorrelations(demandData: any[], factorData: any) {
    // Simplified correlation analysis
    return [
      {
        factor: 'Price',
        type: 'internal' as const,
        correlation: -0.75,
        significance: 0.05,
        impact: 'high' as const,
        direction: 'negative' as const,
        lag: 0,
        description: 'Higher prices lead to lower demand',
        dataPoints: []
      }
    ];
  }

  private async buildRegressionModel(demandData: any[], factorData: any, drivers: any[]) {
    // Simplified regression model
    return {
      type: 'linear' as const,
      equation: 'Demand = 100 - 0.5 * Price + 0.3 * Promotion',
      rSquared: 0.85,
      adjustedRSquared: 0.83,
      coefficients: [
        { variable: 'Intercept', coefficient: 100, standardError: 5, tValue: 20, pValue: 0.001 },
        { variable: 'Price', coefficient: -0.5, standardError: 0.1, tValue: -5, pValue: 0.01 }
      ]
    };
  }

  private async generateScenarioPredictions(model: any, drivers: any[]) {
    // Simplified scenario predictions
    return [
      {
        scenario: 'Price Increase',
        assumptions: [{ factor: 'Price', value: 110, change: 10 }],
        predictedDemand: 95,
        confidence: 80,
        riskLevel: 'medium' as const
      }
    ];
  }

  private generateDriverInsights(drivers: any[], model: any) {
    return [
      {
        category: 'correlation' as const,
        finding: 'Strong negative correlation between price and demand',
        implication: 'Price elasticity is high for this product',
        actionability: 'high' as const
      }
    ];
  }
}
