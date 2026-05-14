import { PurchaseOrder, IPurchaseOrder } from '../models/Purchase';
import { Supplier } from '../models/Supplier';
import { User } from '../models/User';

export interface InvoiceProcessing {
  processingId: string;
  invoiceId: string;
  invoiceNumber: string;
  purchaseOrderId: string;
  purchaseOrderNumber: string;
  
  // Invoice Information
  invoiceDate: Date;
  dueDate: Date;
  status: 'received' | 'processing' | 'verified' | 'approved' | 'rejected' | 'paid' | 'overdue' | 'disputed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Supplier Information
  supplier: {
    supplierId: string;
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
  };
  
  // Financial Details
  currency: string;
  exchangeRate?: number;
  totals: {
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    shippingAmount: number;
    handlingAmount: number;
    otherCosts: number;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
  };
  
  // Processing Details
  processing: {
    receivedDate: Date;
    receivedBy: string;
    processingStartedAt?: Date;
    processingCompletedAt?: Date;
    processor?: string;
    verificationRequired: boolean;
    verifiedBy?: string;
    verifiedAt?: Date;
    approvedBy?: string;
    approvedAt?: Date;
  };
  
  // OCR Data
  ocrData?: {
    extractedAt: Date;
    confidence: number;
    extractedFields: Record<string, any>;
    rawText?: string;
    processingTime: number; // milliseconds
    corrections: Array<{
      field: string;
      originalValue: any;
      correctedValue: any;
      correctedBy: string;
      correctedAt: Date;
    }>;
  };
  
  // Line Items
  items: Array<{
    itemId: string;
    productId: string;
    productName: string;
    sku: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
    taxAmount: number;
    discountAmount: number;
    poItemId: string;
    orderedQuantity: number;
    receivedQuantity: number;
    invoicedQuantity: number;
    variance: number;
    variancePercentage: number;
    matchStatus: 'matched' | 'partial' | 'unmatched' | 'overbilled';
    requiresAttention: boolean;
    notes?: string;
  }>;
  
  // Validation Results
  validation: {
    isValid: boolean;
    validationDate?: Date;
    validatedBy?: string;
    checks: Array<{
      checkName: string;
      status: 'passed' | 'failed' | 'warning';
      message: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      autoResolved: boolean;
    }>;
    exceptions: Array<{
      exceptionId: string;
      type: string;
      description: string;
      impact: string;
      resolution: string;
      status: 'open' | 'investigating' | 'resolved' | 'escalated';
      assignedTo?: string;
      dueDate?: Date;
      resolvedAt?: Date;
      resolvedBy?: string;
    }>;
  };
  
  // Matching Information
  matching: {
    threeWayMatch: boolean;
    poMatched: boolean;
    receiptMatched: boolean;
    varianceAmount: number;
    variancePercentage: number;
    matchedItems: number;
    totalItems: number;
    matchingDate?: Date;
    matchedBy?: string;
    matchingDetails: Array<{
      itemId: string;
      poQuantity: number;
      receiptQuantity: number;
      invoiceQuantity: number;
      variance: number;
      status: string;
    }>;
  };
  
  // Approval Workflow
  approvals: Array<{
    approvalId: string;
    level: number;
    role: string;
    userId: string;
    name: string;
    status: 'pending' | 'approved' | 'rejected' | 'skipped';
    date?: Date;
    comments?: string;
    timeoutDate?: Date;
    escalated?: boolean;
  }>;
  
  // Payment Information
  payment: {
    terms: string;
    method: string;
    status: 'pending' | 'partial' | 'paid' | 'overdue';
    scheduledPayments: Array<{
      paymentId: string;
      amount: number;
      dueDate: Date;
      status: 'scheduled' | 'paid' | 'overdue';
      paidDate?: Date;
      reference?: string;
    }>;
    paymentHistory: Array<{
      paymentId: string;
      amount: number;
      paymentDate: Date;
      method: string;
      reference: string;
      processedBy: string;
    }>;
  };
  
  // Attachments
  attachments: Array<{
    attachmentId: string;
    name: string;
    type: 'invoice' | 'receipt' | 'packing_list' | 'credit_note' | 'other';
    url: string;
    uploadedAt: Date;
    uploadedBy: string;
    description: string;
    size: number;
    mimeType: string;
  }>;
  
  // Notes and Communications
  notes: Array<{
    noteId: string;
    content: string;
    createdBy: string;
    createdAt: Date;
    type: 'internal' | 'external' | 'system';
    visibility: 'private' | 'team' | 'public';
  }>;
  
  communications: Array<{
    communicationId: string;
    date: Date;
    type: 'email' | 'phone' | 'portal' | 'other';
    direction: 'incoming' | 'outgoing';
    recipient: string;
    subject: string;
    content: string;
    attachments?: string[];
    sentBy?: string;
  }>;
  
  // Audit Trail
  auditTrail: Array<{
    timestamp: Date;
    action: string;
    performedBy: string;
    details: string;
    previousStatus?: string;
    newStatus?: string;
    systemGenerated: boolean;
  }>;
  
  // Timestamps
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

export interface InvoiceProcessingRule {
  ruleId: string;
  name: string;
  description: string;
  isActive: boolean;
  priority: number;
  
  // Rule Conditions
  conditions: {
    supplierIds?: string[];
    categories?: string[];
    amountRange?: {
      min?: number;
      max?: number;
    };
    departments?: string[];
    invoiceTypes?: string[];
  };
  
  // Processing Configuration
  processingConfig: {
    autoProcessing: boolean;
    ocrRequired: boolean;
    verificationRequired: boolean;
    approvalRequired: boolean;
    matchingRequired: boolean;
    
    // OCR Settings
    ocrSettings: {
      provider: 'google_vision' | 'aws_textract' | 'azure_form_recognizer' | 'abbyy';
      confidenceThreshold: number;
      fieldMapping: Record<string, string>;
      validationRules: Array<{
        field: string;
        validation: string;
        errorMessage: string;
      }>;
    };
    
    // Validation Rules
    validationRules: Array<{
      ruleName: string;
      condition: string;
      action: 'accept' | 'reject' | 'flag' | 'require_approval';
      severity: 'low' | 'medium' | 'high' | 'critical';
    }>;
    
    // Approval Rules
    approvalRules: Array<{
      condition: string;
      approvers: Array<{
        role: string;
        userId?: string;
        department?: string;
      }>;
      timeoutHours: number;
      escalationRules?: Array<{
        condition: string;
        escalateTo: Array<{
          role: string;
          userId?: string;
        }>;
      }>;
    }>;
  };
  
  // Notification Settings
  notificationSettings: {
    onReceipt: boolean;
    onProcessing: boolean;
    onValidation: boolean;
    onApproval: boolean;
    onRejection: boolean;
    onPayment: boolean;
    recipients: Array<{
      type: 'user' | 'role' | 'email';
      value: string;
      events: string[];
    }>;
  };
  
  // Performance Metrics
  performance: {
    totalProcessed: number;
    autoProcessed: number;
    manualReviewRequired: number;
    exceptionsRaised: number;
    averageProcessingTime: number; // minutes
    accuracyRate: number; // percentage
  };
  
  // Timestamps
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

export class InvoiceProcessingService {
  // Process invoice with OCR
  async processInvoiceWithOCR(params: {
    invoiceFile: {
      filename: string;
      mimeType: string;
      size: number;
      url: string;
    };
    supplierId?: string;
    purchaseOrderId?: string;
    forceProcessing?: boolean;
    processedBy: string;
  }): Promise<InvoiceProcessing> {
    const processingId = `PROC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const invoiceId = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Get processing rule
    const rule = await this.getProcessingRule(params.supplierId);
    
    // Perform OCR processing
    const startTime = Date.now();
    const ocrResult = await this.performOCR(params.invoiceFile.url, rule.processingConfig.ocrSettings);
    const processingTime = Date.now() - startTime;
    
    // Extract and validate invoice data
    const extractedData = this.extractInvoiceData(ocrResult, rule.processingConfig.ocrSettings.fieldMapping);
    const validationResult = await this.validateExtractedData(extractedData, rule.processingConfig.validationRules);
    
    // Create processing record
    const processing: InvoiceProcessing = {
      processingId,
      invoiceId,
      invoiceNumber: extractedData.invoiceNumber || `INV-${Date.now()}`,
      purchaseOrderId: params.purchaseOrderId || '',
      purchaseOrderNumber: '',
      
      invoiceDate: extractedData.invoiceDate || new Date(),
      dueDate: extractedData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: validationResult.isValid ? 'verified' : 'processing',
      priority: this.determinePriority(extractedData.totalAmount, extractedData.dueDate),
      
      supplier: await this.getSupplierInfo(params.supplierId, extractedData),
      
      currency: extractedData.currency || 'USD',
      exchangeRate: extractedData.exchangeRate,
      totals: {
        subtotal: extractedData.subtotal || 0,
        discountAmount: extractedData.discountAmount || 0,
        taxAmount: extractedData.taxAmount || 0,
        shippingAmount: extractedData.shippingAmount || 0,
        handlingAmount: extractedData.handlingAmount || 0,
        otherCosts: extractedData.otherCosts || 0,
        totalAmount: extractedData.totalAmount || 0,
        paidAmount: 0,
        remainingAmount: extractedData.totalAmount || 0
      },
      
      processing: {
        receivedDate: new Date(),
        receivedBy: params.processedBy,
        processingStartedAt: new Date(),
        verificationRequired: rule.processingConfig.verificationRequired,
        processor: params.processedBy
      },
      
      ocrData: {
        extractedAt: new Date(),
        confidence: ocrResult.confidence,
        extractedFields: extractedData,
        rawText: ocrResult.rawText,
        processingTime,
        corrections: []
      },
      
      items: extractedData.items || [],
      
      validation: validationResult,
      
      matching: {
        threeWayMatch: false,
        poMatched: false,
        receiptMatched: false,
        varianceAmount: 0,
        variancePercentage: 0,
        matchedItems: 0,
        totalItems: extractedData.items?.length || 0,
        matchingDetails: []
      },
      
      approvals: [],
      
      payment: {
        terms: extractedData.paymentTerms || 'NET30',
        method: 'bank_transfer',
        status: 'pending',
        scheduledPayments: [],
        paymentHistory: []
      },
      
      attachments: [{
        attachmentId: `ATT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        name: params.invoiceFile.filename,
        type: 'invoice',
        url: params.invoiceFile.url,
        uploadedAt: new Date(),
        uploadedBy: params.processedBy,
        description: 'Original invoice document',
        size: params.invoiceFile.size,
        mimeType: params.invoiceFile.mimeType
      }],
      
      notes: [],
      communications: [],
      
      auditTrail: [{
        timestamp: new Date(),
        action: 'Invoice Received',
        performedBy: params.processedBy,
        details: `Invoice processed with OCR (confidence: ${ocrResult.confidence}%)`,
        systemGenerated: false
      }],
      
      createdAt: new Date(),
      createdBy: params.processedBy,
      updatedAt: new Date(),
      updatedBy: params.processedBy
    };
    
    // If PO is provided, perform matching
    if (params.purchaseOrderId) {
      await this.performInvoiceMatching(processing, params.purchaseOrderId);
    }
    
    // Check if auto-approval is possible
    if (rule.processingConfig.autoProcessing && validationResult.isValid && 
        !rule.processingConfig.approvalRequired) {
      processing.status = 'approved';
      processing.processing.approvedAt = new Date();
      processing.processing.approvedBy = 'system';
    }
    
    // Save processing record
    await this.saveInvoiceProcessing(processing);
    
    // Send notifications
    await this.sendProcessingNotifications(processing, rule);
    
    return processing;
  }
  
  // Validate invoice data
  async validateInvoiceData(params: {
    processingId: string;
    correctedFields?: Array<{
      field: string;
      correctedValue: any;
      reason: string;
    }>;
    validatedBy: string;
    comments?: string;
  }): Promise<InvoiceProcessing> {
    const processing = await this.getInvoiceProcessing(params.processingId);
    if (!processing) {
      throw new Error('Invoice processing record not found');
    }
    
    // Apply corrections if provided
    if (params.correctedFields) {
      for (const correction of params.correctedFields) {
        const fieldPath = correction.field.split('.');
        this.setNestedProperty(processing.ocrData!.extractedFields, fieldPath, correction.correctedValue);
        
        processing.ocrData!.corrections.push({
          field: correction.field,
          originalValue: this.getNestedProperty(processing.ocrData!.extractedFields, fieldPath),
          correctedValue: correction.correctedValue,
          correctedBy: params.validatedBy,
          correctedAt: new Date()
        });
      }
    }
    
    // Re-validate with corrected data
    const rule = await this.getProcessingRule(processing.supplier.supplierId);
    const validationResult = await this.validateExtractedData(
      processing.ocrData!.extractedFields, 
      rule.processingConfig.validationRules
    );
    
    processing.validation = validationResult;
    processing.validation.validationDate = new Date();
    processing.validation.validatedBy = params.validatedBy;
    
    // Update status based on validation
    if (validationResult.isValid) {
      processing.status = 'verified';
      processing.processing.verifiedAt = new Date();
      processing.processing.verifiedBy = params.validatedBy;
    } else {
      processing.status = 'processing';
    }
    
    // Add to audit trail
    processing.auditTrail.push({
      timestamp: new Date(),
      action: 'Data Validated',
      performedBy: params.validatedBy,
      details: `Invoice validation ${validationResult.isValid ? 'passed' : 'failed'}${params.comments ? ': ' + params.comments : ''}`,
      systemGenerated: false
    });
    
    // Update timestamps
    processing.updatedAt = new Date();
    processing.updatedBy = params.validatedBy;
    
    // Save changes
    await this.updateInvoiceProcessing(processing);
    
    return processing;
  }
  
  // Approve invoice
  async approveInvoice(params: {
    processingId: string;
    approvedBy: string;
    comments?: string;
    scheduledPayments?: Array<{
      amount: number;
      dueDate: Date;
      reference?: string;
    }>;
  }): Promise<InvoiceProcessing> {
    const processing = await this.getInvoiceProcessing(params.processingId);
    if (!processing) {
      throw new Error('Invoice processing record not found');
    }
    
    if (processing.status !== 'verified') {
      throw new Error('Only verified invoices can be approved');
    }
    
    // Update approval information
    processing.status = 'approved';
    processing.processing.approvedAt = new Date();
    processing.processing.approvedBy = params.approvedBy;
    
    // Add scheduled payments if provided
    if (params.scheduledPayments) {
      processing.payment.scheduledPayments = params.scheduledPayments.map(payment => ({
        paymentId: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        ...payment,
        status: 'scheduled' as const
      }));
    }
    
    // Add to audit trail
    processing.auditTrail.push({
      timestamp: new Date(),
      action: 'Invoice Approved',
      performedBy: params.approvedBy,
      details: `Invoice approved for payment${params.comments ? ': ' + params.comments : ''}`,
      previousStatus: 'verified',
      newStatus: 'approved',
      systemGenerated: false
    });
    
    // Update timestamps
    processing.updatedAt = new Date();
    processing.updatedBy = params.approvedBy;
    
    // Save changes
    await this.updateInvoiceProcessing(processing);
    
    // Send notifications
    await this.sendApprovalNotifications(processing);
    
    return processing;
  }
  
  // Reject invoice
  async rejectInvoice(params: {
    processingId: string;
    reason: string;
    rejectedBy: string;
    notifySupplier?: boolean;
    supplierMessage?: string;
  }): Promise<InvoiceProcessing> {
    const processing = await this.getInvoiceProcessing(params.processingId);
    if (!processing) {
      throw new Error('Invoice processing record not found');
    }
    
    // Update status
    processing.status = 'rejected';
    
    // Add rejection note
    processing.notes.push({
      noteId: `NOTE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      content: `Invoice rejected: ${params.reason}`,
      createdBy: params.rejectedBy,
      createdAt: new Date(),
      type: 'internal',
      visibility: 'team'
    });
    
    // Add to audit trail
    processing.auditTrail.push({
      timestamp: new Date(),
      action: 'Invoice Rejected',
      performedBy: params.rejectedBy,
      details: `Invoice rejected: ${params.reason}`,
      systemGenerated: false
    });
    
    // Update timestamps
    processing.updatedAt = new Date();
    processing.updatedBy = params.rejectedBy;
    
    // Save changes
    await this.updateInvoiceProcessing(processing);
    
    // Send notifications
    await this.sendRejectionNotifications(processing, params.reason, params.notifySupplier, params.supplierMessage);
    
    return processing;
  }
  
  // Create processing rule
  async createProcessingRule(params: {
    name: string;
    description: string;
    conditions: {
      supplierIds?: string[];
      categories?: string[];
      amountRange?: {
        min?: number;
        max?: number;
      };
      departments?: string[];
      invoiceTypes?: string[];
    };
    processingConfig: {
      autoProcessing?: boolean;
      ocrRequired?: boolean;
      verificationRequired?: boolean;
      approvalRequired?: boolean;
      matchingRequired?: boolean;
      ocrSettings: {
        provider: 'google_vision' | 'aws_textract' | 'azure_form_recognizer' | 'abbyy';
        confidenceThreshold: number;
        fieldMapping: Record<string, string>;
        validationRules?: Array<{
          field: string;
          validation: string;
          errorMessage: string;
        }>;
      };
      validationRules?: Array<{
        ruleName: string;
        condition: string;
        action: 'accept' | 'reject' | 'flag' | 'require_approval';
        severity: 'low' | 'medium' | 'high' | 'critical';
      }>;
      approvalRules?: Array<{
        condition: string;
        approvers: Array<{
          role: string;
          userId?: string;
          department?: string;
        }>;
        timeoutHours: number;
        escalationRules?: Array<{
          condition: string;
          escalateTo: Array<{
            role: string;
            userId?: string;
          }>;
        }>;
      }>;
    };
    notificationSettings?: {
      onReceipt?: boolean;
      onProcessing?: boolean;
      onValidation?: boolean;
      onApproval?: boolean;
      onRejection?: boolean;
      onPayment?: boolean;
      recipients?: Array<{
        type: 'user' | 'role' | 'email';
        value: string;
        events: string[];
      }>;
    };
    createdBy: string;
  }): Promise<InvoiceProcessingRule> {
    const ruleId = `RULE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const rule: InvoiceProcessingRule = {
      ruleId,
      name: params.name,
      description: params.description,
      isActive: true,
      priority: 1,
      conditions: params.conditions,
      processingConfig: {
        autoProcessing: params.processingConfig.autoProcessing ?? true,
        ocrRequired: params.processingConfig.ocrRequired ?? true,
        verificationRequired: params.processingConfig.verificationRequired ?? true,
        approvalRequired: params.processingConfig.approvalRequired ?? false,
        matchingRequired: params.processingConfig.matchingRequired ?? true,
        ocrSettings: params.processingConfig.ocrSettings,
        validationRules: params.processingConfig.validationRules || [],
        approvalRules: params.processingConfig.approvalRules || []
      },
      notificationSettings: {
        onReceipt: params.notificationSettings?.onReceipt ?? true,
        onProcessing: params.notificationSettings?.onProcessing ?? false,
        onValidation: params.notificationSettings?.onValidation ?? true,
        onApproval: params.notificationSettings?.onApproval ?? true,
        onRejection: params.notificationSettings?.onRejection ?? true,
        onPayment: params.notificationSettings?.onPayment ?? true,
        recipients: params.notificationSettings?.recipients || []
      },
      performance: {
        totalProcessed: 0,
        autoProcessed: 0,
        manualReviewRequired: 0,
        exceptionsRaised: 0,
        averageProcessingTime: 0,
        accuracyRate: 0
      },
      createdAt: new Date(),
      createdBy: params.createdBy,
      updatedAt: new Date(),
      updatedBy: params.createdBy
    };
    
    // Save rule
    await this.saveProcessingRule(rule);
    
    return rule;
  }
  
  // Helper methods
  private async performOCR(imageUrl: string, settings: any): Promise<{
    confidence: number;
    extractedText: string;
    fields: Record<string, any>;
  }> {
    // Mock OCR implementation
    // In reality, integrate with Google Vision, AWS Textract, etc.
    return {
      confidence: 95.5,
      extractedText: 'Mock OCR extracted text...',
      fields: {}
    };
  }
  
  private extractInvoiceData(ocrResult: any, fieldMapping: Record<string, string>): any {
    // Extract and map fields based on configuration
    return {
      invoiceNumber: 'INV-2024-001',
      invoiceDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      totalAmount: 1500.00,
      subtotal: 1388.89,
      taxAmount: 111.11,
      currency: 'USD',
      paymentTerms: 'NET30',
      items: []
    };
  }
  
  private async validateExtractedData(data: any, rules: any[]): Promise<any> {
    // Validate extracted data against rules
    const checks = [];
    const exceptions = [];
    let isValid = true;
    
    for (const rule of rules) {
      // Mock validation logic
      checks.push({
        checkName: rule.ruleName,
        status: 'passed' as const,
        message: 'Validation passed',
        severity: 'low' as const,
        autoResolved: true
      });
    }
    
    return {
      isValid,
      checks,
      exceptions
    };
  }
  
  private determinePriority(amount: number, dueDate: Date): 'low' | 'medium' | 'high' | 'urgent' {
    const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue <= 7 || amount > 10000) return 'urgent';
    if (daysUntilDue <= 14 || amount > 5000) return 'high';
    if (daysUntilDue <= 30) return 'medium';
    return 'low';
  }
  
  private async getSupplierInfo(supplierId?: string, extractedData?: any): Promise<any> {
    // Get supplier information
    if (supplierId) {
      const supplier = await Supplier.findOne({ supplierId });
      if (supplier) {
        return {
          supplierId: supplier.supplierId,
          name: supplier.name,
          contactPerson: supplier.contact.primaryContact.name,
          email: supplier.contact.primaryContact.email,
          phone: supplier.contact.primaryContact.phone
        };
      }
    }
    
    // Return extracted supplier info if no supplier ID
    return {
      supplierId: extractedData?.supplierId || '',
      name: extractedData?.supplierName || 'Unknown Supplier',
      contactPerson: extractedData?.contactPerson || '',
      email: extractedData?.supplierEmail || '',
      phone: extractedData?.supplierPhone || ''
    };
  }
  
  private async performInvoiceMatching(processing: InvoiceProcessing, purchaseOrderId: string): Promise<void> {
    // Perform invoice matching with PO
    const po = await PurchaseOrder.findOne({ purchaseOrderId });
    if (!po) return;
    
    processing.purchaseOrderId = purchaseOrderId;
    processing.purchaseOrderNumber = po.orderNumber;
    
    // Mock matching logic
    processing.matching.poMatched = true;
    processing.matching.matchedItems = processing.items.length;
  }
  
  private setNestedProperty(obj: any, path: string[], value: any): void {
    let current = obj;
    for (let i = 0; i < path.length - 1; i++) {
      if (!(path[i] in current)) {
        current[path[i]] = {};
      }
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
  }
  
  private getNestedProperty(obj: any, path: string[]): any {
    return path.reduce((current, key) => current?.[key], obj);
  }
  
  private async getProcessingRule(supplierId?: string): Promise<InvoiceProcessingRule> {
    // Get applicable processing rule
    // Mock implementation
    return {
      ruleId: 'RULE-DEFAULT',
      name: 'Default Processing Rule',
      description: 'Default invoice processing rule',
      isActive: true,
      priority: 1,
      conditions: {},
      processingConfig: {
        autoProcessing: true,
        ocrRequired: true,
        verificationRequired: true,
        approvalRequired: false,
        matchingRequired: true,
        ocrSettings: {
          provider: 'google_vision' as const,
          confidenceThreshold: 90,
          fieldMapping: {},
          validationRules: []
        },
        validationRules: [],
        approvalRules: []
      },
      notificationSettings: {
        onReceipt: true,
        onProcessing: false,
        onValidation: true,
        onApproval: true,
        onRejection: true,
        onPayment: true,
        recipients: []
      },
      performance: {
        totalProcessed: 0,
        autoProcessed: 0,
        manualReviewRequired: 0,
        exceptionsRaised: 0,
        averageProcessingTime: 0,
        accuracyRate: 0
      },
      createdAt: new Date(),
      createdBy: 'system',
      updatedAt: new Date(),
      updatedBy: 'system'
    };
  }
  
  private async saveInvoiceProcessing(processing: InvoiceProcessing): Promise<void> {
    // Save to database (mock implementation)
    console.log(`Saving invoice processing ${processing.processingId}`);
  }
  
  private async updateInvoiceProcessing(processing: InvoiceProcessing): Promise<void> {
    // Update in database (mock implementation)
    console.log(`Updating invoice processing ${processing.processingId}`);
  }
  
  private async getInvoiceProcessing(processingId: string): Promise<InvoiceProcessing | null> {
    // Get from database (mock implementation)
    return null;
  }
  
  private async saveProcessingRule(rule: InvoiceProcessingRule): Promise<void> {
    // Save to database (mock implementation)
    console.log(`Saving processing rule ${rule.ruleId}`);
  }
  
  private async sendProcessingNotifications(processing: InvoiceProcessing, rule: InvoiceProcessingRule): Promise<void> {
    // Send notifications (mock implementation)
    console.log(`Sending processing notifications for ${processing.processingId}`);
  }
  
  private async sendApprovalNotifications(processing: InvoiceProcessing): Promise<void> {
    // Send notifications (mock implementation)
    console.log(`Sending approval notifications for ${processing.processingId}`);
  }
  
  private async sendRejectionNotifications(
    processing: InvoiceProcessing, 
    reason: string, 
    notifySupplier?: boolean, 
    supplierMessage?: string
  ): Promise<void> {
    // Send notifications (mock implementation)
    console.log(`Sending rejection notifications for ${processing.processingId}`);
  }
}
