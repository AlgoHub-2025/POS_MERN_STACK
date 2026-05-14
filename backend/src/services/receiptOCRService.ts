import { Expense, IExpense } from '../models/Expense';
import { User } from '../models/User';

export interface OCRResult {
  merchant: {
    name: string;
    confidence: number;
    alternatives: string[];
    address?: string;
    phone?: string;
    website?: string;
  };
  date: {
    value: Date;
    confidence: number;
    alternatives: Date[];
  };
  total: {
    amount: number;
    currency: string;
    confidence: number;
    alternatives: Array<{
      amount: number;
      currency: string;
    }>;
  };
  tax: {
    amount: number;
    rate: number;
    confidence: number;
    type: 'sales_tax' | 'vat' | 'gst' | 'other';
  };
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    confidence: number;
    category?: string;
    sku?: string;
  }>;
  paymentMethod: {
    type: string;
    last4?: string;
    confidence: number;
    cardType?: string;
  };
  receiptNumber: string;
  transactionId?: string;
  location: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  rawText: string;
  confidence: number; // overall confidence
  needsReview: boolean;
  processingTime: number; // milliseconds
  extractedAt: Date;
}

export interface OCRProcessingRequest {
  requestId: string;
  expenseId?: string;
  imageUrl: string;
  imageFormat: 'jpeg' | 'png' | 'pdf' | 'heic';
  fileSize: number;
  source: 'mobile_upload' | 'email' | 'api' | 'web_upload';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  userId: string;
  metadata?: {
    deviceInfo?: string;
    location?: {
      latitude: number;
      longitude: number;
    };
    timestamp: Date;
  };
}

export interface OCRProcessingResponse {
  requestId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'retry';
  result?: OCRResult;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  processingTime: number;
  startedAt: Date;
  completedAt?: Date;
  retryCount: number;
  maxRetries: number;
}

export interface ReceiptMatch {
  matchId: string;
  expenseId: string;
  receiptId: string;
  confidence: number;
  matchFields: Array<{
    field: string;
    expenseValue: any;
    receiptValue: any;
    confidence: number;
  }>;
  status: 'pending' | 'confirmed' | 'rejected';
  confirmedBy?: string;
  confirmedAt?: Date;
  notes?: string;
}

export interface ReceiptAnalytics {
  period: {
    startDate: Date;
    endDate: Date;
  };
  
  // Processing Statistics
  processingStats: {
    totalReceipts: number;
    successfulProcessing: number;
    failedProcessing: number;
    averageProcessingTime: number;
    averageConfidence: number;
    needsReviewRate: number;
  };
  
  // Merchant Analytics
  merchantAnalytics: {
    topMerchants: Array<{
      name: string;
      count: number;
      totalAmount: number;
      averageAmount: number;
      categories: string[];
    }>;
    newMerchants: Array<{
      name: string;
      firstSeen: Date;
      count: number;
      totalAmount: number;
    }>;
    merchantCategories: Array<{
      category: string;
      count: number;
      percentage: number;
    }>;
  };
  
  // Accuracy Analytics
  accuracyAnalytics: {
    fieldAccuracy: Record<string, {
      correct: number;
      total: number;
      accuracy: number;
    }>;
    confidenceDistribution: Array<{
      range: string;
      count: number;
      percentage: number;
    }>;
    errorPatterns: Array<{
      errorType: string;
      count: number;
      percentage: number;
      commonCauses: string[];
    }>;
  };
  
  // Usage Analytics
  usageAnalytics: {
    processingBySource: Record<string, number>;
    processingByTimeOfDay: Array<{
      hour: number;
      count: number;
    }>;
    processingByDayOfWeek: Array<{
      day: number;
      count: number;
    }>;
    userActivity: Array<{
      userId: string;
      userName: string;
      receiptCount: number;
      averageConfidence: number;
    }>;
  };
}

export class ReceiptOCRService {
  private ocrProviders: Map<string, any> = new Map();
  
  constructor() {
    this.initializeOCRProviders();
  }
  
  // Initialize OCR providers
  private initializeOCRProviders(): void {
    // Mock initialization of OCR providers
    this.ocrProviders.set('google_vision', {
      name: 'Google Vision API',
      enabled: true,
      priority: 1,
      costPerRequest: 0.0015,
      maxFileSize: 20 * 1024 * 1024, // 20MB
      supportedFormats: ['jpeg', 'png', 'pdf', 'heic']
    });
    
    this.ocrProviders.set('aws_textract', {
      name: 'AWS Textract',
      enabled: true,
      priority: 2,
      costPerRequest: 0.0015,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      supportedFormats: ['jpeg', 'png', 'pdf']
    });
    
    this.ocrProviders.set('azure_form_recognizer', {
      name: 'Azure Form Recognizer',
      enabled: false,
      priority: 3,
      costPerRequest: 0.001,
      maxFileSize: 50 * 1024 * 1024, // 50MB
      supportedFormats: ['jpeg', 'png', 'pdf']
    });
  }
  
  // Process receipt with OCR
  async processReceipt(params: OCRProcessingRequest): Promise<OCRProcessingResponse> {
    const requestId = params.requestId;
    const startTime = Date.now();
    
    try {
      // Validate request
      await this.validateOCRRequest(params);
      
      // Get OCR provider
      const provider = this.selectOCRProvider(params);
      
      // Download image
      const imageData = await this.downloadImage(params.imageUrl);
      
      // Process with OCR
      const ocrResult = await this.performOCR(imageData, provider, params);
      
      // Post-process results
      const processedResult = await this.postProcessOCRResult(ocrResult, params);
      
      // Detect duplicates
      await this.detectDuplicates(processedResult, params);
      
      const response: OCRProcessingResponse = {
        requestId,
        status: 'completed',
        result: processedResult,
        processingTime: Date.now() - startTime,
        startedAt: new Date(startTime),
        completedAt: new Date(),
        retryCount: 0,
        maxRetries: 3
      };
      
      // Save processing result
      await this.saveOCRProcessingResult(response);
      
      // Update expense if provided
      if (params.expenseId) {
        await this.updateExpenseWithOCRData(params.expenseId, processedResult);
      }
      
      return response;
      
    } catch (error) {
      const response: OCRProcessingResponse = {
        requestId,
        status: 'failed',
        error: {
          code: 'OCR_PROCESSING_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          details: error
        },
        processingTime: Date.now() - startTime,
        startedAt: new Date(startTime),
        completedAt: new Date(),
        retryCount: 0,
        maxRetries: 3
      };
      
      await this.saveOCRProcessingResult(response);
      return response;
    }
  }
  
  // Get OCR processing status
  async getProcessingStatus(requestId: string): Promise<OCRProcessingResponse | null> {
    // Mock implementation - would query database
    return null;
  }
  
  // Match receipt to expense
  async matchReceiptToExpense(receiptId: string, expenseId: string, userId: string): Promise<ReceiptMatch> {
    // Get receipt OCR data
    const receiptData = await this.getReceiptOCRData(receiptId);
    if (!receiptData) {
      throw new Error('Receipt OCR data not found');
    }
    
    // Get expense data
    const expense = await Expense.findOne({ expenseId });
    if (!expense) {
      throw new Error('Expense not found');
    }
    
    // Calculate match confidence
    const matchFields = await this.calculateMatchFields(receiptData, expense);
    const overallConfidence = this.calculateOverallConfidence(matchFields);
    
    const match: ReceiptMatch = {
      matchId: `MATCH-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      expenseId,
      receiptId,
      confidence: overallConfidence,
      matchFields,
      status: overallConfidence > 0.8 ? 'confirmed' : 'pending'
    };
    
    // Save match
    await this.saveReceiptMatch(match);
    
    // Update expense with match info
    if (match.status === 'confirmed') {
      await this.updateExpenseWithMatchData(expense, receiptData, match);
    }
    
    return match;
  }
  
  // Verify OCR result
  async verifyOCRResult(requestId: string, verifiedData: Partial<OCRResult>, verifiedBy: string): Promise<OCRResult> {
    const processingResult = await this.getProcessingStatus(requestId);
    if (!processingResult || !processingResult.result) {
      throw new Error('OCR processing result not found');
    }
    
    // Update result with verified data
    const updatedResult = {
      ...processingResult.result,
      ...verifiedData,
      needsReview: false
    };
    
    // Update expense if linked
    if (processingResult.expenseId) {
      await this.updateExpenseWithOCRData(processingResult.expenseId, updatedResult, true);
    }
    
    // Save verified result
    await this.saveVerifiedOCRResult(requestId, updatedResult, verifiedBy);
    
    return updatedResult;
  }
  
  // Get receipt analytics
  async getReceiptAnalytics(params: {
    startDate: Date;
    endDate: Date;
    filters?: {
      userId?: string;
      source?: string;
      merchant?: string;
    };
  }): Promise<ReceiptAnalytics> {
    // Mock analytics data
    return {
      period: {
        startDate: params.startDate,
        endDate: params.endDate
      },
      
      processingStats: {
        totalReceipts: 1250,
        successfulProcessing: 1187,
        failedProcessing: 63,
        averageProcessingTime: 2500,
        averageConfidence: 87.5,
        needsReviewRate: 15.2
      },
      
      merchantAnalytics: {
        topMerchants: [
          {
            name: 'Starbucks',
            count: 145,
            totalAmount: 1250.75,
            averageAmount: 8.63,
            categories: ['Food & Beverage', 'Coffee']
          },
          {
            name: 'Uber',
            count: 98,
            totalAmount: 2100.50,
            averageAmount: 21.43,
            categories: ['Transportation', 'Rideshare']
          }
        ],
        newMerchants: [
          {
            name: 'New Restaurant',
            firstSeen: new Date(),
            count: 3,
            totalAmount: 125.00
          }
        ],
        merchantCategories: [
          { category: 'Food & Beverage', count: 450, percentage: 36.0 },
          { category: 'Transportation', count: 320, percentage: 25.6 },
          { category: 'Office Supplies', count: 180, percentage: 14.4 }
        ]
      },
      
      accuracyAnalytics: {
        fieldAccuracy: {
          merchant: { correct: 1120, total: 1187, accuracy: 94.4 },
          date: { correct: 1150, total: 1187, accuracy: 96.9 },
          total: { correct: 1100, total: 1187, accuracy: 92.7 },
          tax: { correct: 980, total: 1187, accuracy: 82.6 }
        },
        confidenceDistribution: [
          { range: '90-100%', count: 650, percentage: 52.0 },
          { range: '80-89%', count: 350, percentage: 28.0 },
          { range: '70-79%', count: 187, percentage: 14.9 },
          { range: '60-69%', count: 63, percentage: 5.1 }
        ],
        errorPatterns: [
          {
            errorType: 'Merchant Name',
            count: 67,
            percentage: 5.4,
            commonCauses: ['Blurry text', 'Unusual fonts', 'Handwritten']
          },
          {
            errorType: 'Total Amount',
            count: 87,
            percentage: 6.9,
            commonCauses: ['Faded ink', 'Complex layouts', 'Multiple totals']
          }
        ]
      },
      
      usageAnalytics: {
        processingBySource: {
          mobile_upload: 750,
          email: 300,
          web_upload: 180,
          api: 20
        },
        processingByTimeOfDay: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          count: Math.floor(Math.random() * 100) + 10
        })),
        processingByDayOfWeek: Array.from({ length: 7 }, (_, i) => ({
          day: i,
          count: Math.floor(Math.random() * 200) + 50
        })),
        userActivity: [
          {
            userId: 'user1',
            userName: 'John Doe',
            receiptCount: 45,
            averageConfidence: 89.2
          }
        ]
      }
    };
  }
  
  // Helper methods
  private async validateOCRRequest(params: OCRProcessingRequest): Promise<void> {
    // Validate image format
    const supportedFormats = ['jpeg', 'png', 'pdf', 'heic'];
    if (!supportedFormats.includes(params.imageFormat)) {
      throw new Error(`Unsupported image format: ${params.imageFormat}`);
    }
    
    // Validate file size (mock check)
    if (params.fileSize > 20 * 1024 * 1024) { // 20MB
      throw new Error('File size too large');
    }
    
    // Validate URL
    if (!params.imageUrl || !this.isValidUrl(params.imageUrl)) {
      throw new Error('Invalid image URL');
    }
  }
  
  private selectOCRProvider(params: OCRProcessingRequest): any {
    // Select provider based on priority and availability
    for (const [key, provider] of this.ocrProviders.entries()) {
      if (provider.enabled && 
          provider.supportedFormats.includes(params.imageFormat) &&
          params.fileSize <= provider.maxFileSize) {
        return { key, ...provider };
      }
    }
    
    throw new Error('No suitable OCR provider available');
  }
  
  private async downloadImage(imageUrl: string): Promise<Buffer> {
    // Mock image download
    return Buffer.from('mock-image-data');
  }
  
  private async performOCR(imageData: Buffer, provider: any, params: OCRProcessingRequest): Promise<any> {
    // Mock OCR processing
    const mockResult = {
      merchant: {
        name: 'Mock Merchant',
        confidence: 0.95,
        alternatives: ['Mock Merchant Inc', 'Mock Merchant LLC']
      },
      date: {
        value: new Date(),
        confidence: 0.98
      },
      total: {
        amount: 25.50,
        currency: 'USD',
        confidence: 0.92
      },
      tax: {
        amount: 2.05,
        rate: 0.0875,
        confidence: 0.85,
        type: 'sales_tax'
      },
      items: [
        {
          description: 'Item 1',
          quantity: 1,
          unitPrice: 20.00,
          total: 20.00,
          confidence: 0.90
        },
        {
          description: 'Item 2',
          quantity: 1,
          unitPrice: 5.50,
          total: 5.50,
          confidence: 0.88
        }
      ],
      paymentMethod: {
        type: 'credit_card',
        last4: '1234',
        confidence: 0.95
      },
      receiptNumber: 'R123456',
      location: {
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA'
      },
      rawText: 'Mock OCR text content',
      confidence: 0.92
    };
    
    return mockResult;
  }
  
  private async postProcessOCRResult(ocrResult: any, params: OCRProcessingRequest): Promise<OCRResult> {
    // Enhance OCR results with additional processing
    const processedResult: OCRResult = {
      ...ocrResult,
      needsReview: ocrResult.confidence < 0.85,
      processingTime: 0, // Will be set by caller
      extractedAt: new Date()
    };
    
    // Apply business rules
    processedResult = await this.applyBusinessRules(processedResult, params);
    
    // Standardize merchant names
    processedResult.merchant = await this.standardizeMerchantName(processedResult.merchant);
    
    // Validate and correct amounts
    processedResult.total = await this.validateAmount(processedResult.total, processedResult.items);
    
    return processedResult;
  }
  
  private async applyBusinessRules(result: OCRResult, params: OCRProcessingRequest): Promise<OCRResult> {
    // Apply company-specific business rules
    // Mock implementation
    
    // Check for suspicious amounts
    if (result.total.amount > 10000) {
      result.needsReview = true;
    }
    
    // Check for unusual merchants
    const suspiciousMerchants = ['Cash Withdrawal', 'ATM', 'Gambling'];
    if (suspiciousMerchants.some(merchant => 
      result.merchant.name.toLowerCase().includes(merchant.toLowerCase()))) {
      result.needsReview = true;
    }
    
    return result;
  }
  
  private async standardizeMerchantName(merchant: any): Promise<any> {
    // Standardize merchant names using known merchant database
    // Mock implementation
    return merchant;
  }
  
  private async validateAmount(total: any, items: any[]): Promise<any> {
    // Validate that total matches sum of items
    const itemsTotal = items.reduce((sum, item) => sum + item.total, 0);
    
    if (Math.abs(total.amount - itemsTotal) > 0.01) {
      total.confidence = Math.min(total.confidence, 0.8);
    }
    
    return total;
  }
  
  private async detectDuplicates(result: OCRResult, params: OCRProcessingRequest): Promise<void> {
    // Check for duplicate receipts
    // Mock implementation
    console.log('Checking for duplicate receipts...');
  }
  
  private async calculateMatchFields(receiptData: OCRResult, expense: IExpense): Promise<any[]> {
    const matchFields = [];
    
    // Compare merchant names
    const merchantMatch = this.compareStrings(receiptData.merchant.name, expense.title);
    matchFields.push({
      field: 'merchant',
      expenseValue: expense.title,
      receiptValue: receiptData.merchant.name,
      confidence: merchantMatch
    });
    
    // Compare dates
    const dateMatch = this.compareDates(receiptData.date.value, expense.date);
    matchFields.push({
      field: 'date',
      expenseValue: expense.date,
      receiptValue: receiptData.date.value,
      confidence: dateMatch
    });
    
    // Compare amounts
    const amountMatch = this.compareAmounts(receiptData.total.amount, expense.totalAmount);
    matchFields.push({
      field: 'amount',
      expenseValue: expense.totalAmount,
      receiptValue: receiptData.total.amount,
      confidence: amountMatch
    });
    
    return matchFields;
  }
  
  private calculateOverallConfidence(matchFields: any[]): number {
    if (matchFields.length === 0) return 0;
    
    const totalConfidence = matchFields.reduce((sum, field) => sum + field.confidence, 0);
    return totalConfidence / matchFields.length;
  }
  
  private compareStrings(str1: string, str2: string): number {
    // Simple string similarity calculation
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }
  
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }
  
  private compareDates(date1: Date, date2: Date): number {
    const diffDays = Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, 1 - (diffDays / 7)); // Decay over 7 days
  }
  
  private compareAmounts(amount1: number, amount2: number): number {
    const diff = Math.abs(amount1 - amount2);
    const avgAmount = (amount1 + amount2) / 2;
    const percentDiff = avgAmount > 0 ? diff / avgAmount : 0;
    return Math.max(0, 1 - percentDiff);
  }
  
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
  
  // Database operations (mock implementations)
  private async saveOCRProcessingResult(result: OCRProcessingResponse): Promise<void> {
    console.log(`Saving OCR processing result for request ${result.requestId}`);
  }
  
  private async updateExpenseWithOCRData(expenseId: string, ocrData: OCRResult, verified = false): Promise<void> {
    const expense = await Expense.findOne({ expenseId });
    if (!expense) return;
    
    expense.ocrProcessed = true;
    expense.ocrData = {
      merchant: ocrData.merchant.name,
      date: ocrData.date.value,
      amount: ocrData.total.amount,
      tax: ocrData.tax.amount,
      confidence: ocrData.confidence,
      rawText: ocrData.rawText
    };
    
    if (verified) {
      expense.receiptVerified = true;
      expense.receiptVerificationDate = new Date();
    }
    
    await expense.save();
  }
  
  private async getReceiptOCRData(receiptId: string): Promise<OCRResult | null> {
    // Mock implementation
    return null;
  }
  
  private async saveReceiptMatch(match: ReceiptMatch): Promise<void> {
    console.log(`Saving receipt match ${match.matchId}`);
  }
  
  private async updateExpenseWithMatchData(expense: IExpense, receiptData: OCRResult, match: ReceiptMatch): Promise<void> {
    // Update expense with matched receipt data
    expense.addAuditEntry(
      'Receipt Matched',
      new Types.ObjectId('system'),
      `Receipt matched with confidence ${match.confidence}`
    );
    
    await expense.save();
  }
  
  private async saveVerifiedOCRResult(requestId: string, result: OCRResult, verifiedBy: string): Promise<void> {
    console.log(`Saving verified OCR result for request ${requestId}`);
  }
}

// Import Types.ObjectId
import { Types } from 'mongoose';
