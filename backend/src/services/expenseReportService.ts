import { Expense, IExpense } from '../models/Expense';
import { ExpenseCategory } from '../models/ExpenseCategory';
import { User } from '../models/User';

export interface ExpenseReport {
  reportId: string;
  reportName: string;
  description: string;
  type: 'standard' | 'custom' | 'scheduled';
  category: 'executive' | 'operational' | 'financial' | 'compliance' | 'tax' | 'custom';
  
  // Report Configuration
  configuration: {
    template: string;
    format: 'pdf' | 'excel' | 'csv' | 'html' | 'json';
    layout: 'portrait' | 'landscape';
    includeCharts: boolean;
    includeDetails: boolean;
    includeSummary: boolean;
    includeAttachments: boolean;
    customFields: string[];
    filters: {
      dateRange: {
        startDate: Date;
        endDate: Date;
      };
      departments?: string[];
      employees?: string[];
      categories?: string[];
      statuses?: string[];
      amountRange?: {
        min: number;
        max: number;
      };
      tags?: string[];
    };
    groupBy: Array<'employee' | 'department' | 'category' | 'date' | 'status' | 'project'>;
    sortBy: Array<{
      field: string;
      direction: 'asc' | 'desc';
    }>;
    columns: Array<{
      field: string;
      label: string;
      width?: number;
      format?: string;
      aggregate?: 'sum' | 'average' | 'count' | 'min' | 'max';
    }>;
  };
  
  // Scheduling
  scheduling: {
    isScheduled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    dayOfWeek?: number; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
    time: string; // HH:MM format
    timezone: string;
    nextRunDate?: Date;
    lastRunDate?: Date;
    recipients: Array<{
      userId: string;
      email: string;
      format: 'pdf' | 'excel' | 'csv';
    }>;
  };
  
  // Access Control
  access: {
    owner: string;
    viewers: string[];
    editors: string[];
    isPublic: boolean;
    shareLink?: string;
    shareExpiry?: Date;
  };
  
  // Report Data
  data: {
    generatedAt: Date;
    generatedBy: string;
    recordCount: number;
    totalAmount: number;
    summary: {
      totalExpenses: number;
      totalAmount: number;
      averageExpense: number;
      approvedExpenses: number;
      pendingExpenses: number;
      rejectedExpenses: number;
      topCategories: Array<{
        categoryId: string;
        categoryName: string;
        amount: number;
        count: number;
        percentage: number;
      }>;
      topEmployees: Array<{
        employeeId: string;
        employeeName: string;
        amount: number;
        count: number;
        percentage: number;
      }>;
    };
    details: Array<{
      expenseId: string;
      employeeName: string;
      department: string;
      category: string;
      amount: number;
      date: Date;
      status: string;
      description: string;
    }>;
    charts: Array<{
      type: 'pie' | 'bar' | 'line' | 'area' | 'scatter';
      title: string;
      data: any;
      config: any;
    }>;
  };
  
  // Export Information
  export: {
    fileId?: string;
    fileName?: string;
    fileSize?: number;
    downloadUrl?: string;
    expiresAt?: Date;
  };
  
  // Status and Lifecycle
  status: 'draft' | 'generating' | 'ready' | 'failed' | 'archived';
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  
  // Usage Analytics
  analytics: {
    views: number;
    downloads: number;
    shares: number;
    lastViewed?: Date;
    lastDownloaded?: Date;
    averageViewTime: number; // seconds
  };
  
  // Metadata
  metadata: {
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
    version: number;
    tags: string[];
    notes?: string;
  };
}

export interface ReportTemplate {
  templateId: string;
  name: string;
  description: string;
  category: 'executive' | 'operational' | 'financial' | 'compliance' | 'tax' | 'custom';
  
  // Template Configuration
  configuration: {
    layout: 'portrait' | 'landscape';
    pageSize: 'A4' | 'A3' | 'letter' | 'legal';
    margins: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    header: {
      enabled: boolean;
      content: string;
      height: number;
      logo?: string;
    };
    footer: {
      enabled: boolean;
      content: string;
      height: number;
      pageNumber: boolean;
    };
    styles: {
      fontFamily: string;
      fontSize: number;
      primaryColor: string;
      secondaryColor: string;
      accentColor: string;
    };
  };
  
  // Sections
  sections: Array<{
    sectionId: string;
    name: string;
    type: 'summary' | 'details' | 'chart' | 'table' | 'text' | 'custom';
    order: number;
    enabled: boolean;
    configuration: any;
  }>;
  
  // Default Columns
  defaultColumns: Array<{
    field: string;
    label: string;
    width?: number;
    format?: string;
    aggregate?: 'sum' | 'average' | 'count' | 'min' | 'max';
  }>;
  
  // Default Filters
  defaultFilters: {
    dateRange: boolean;
    departments: boolean;
    employees: boolean;
    categories: boolean;
    statuses: boolean;
    amountRange: boolean;
  };
  
  // Status
  status: 'active' | 'inactive' | 'deprecated';
  
  // Metadata
  metadata: {
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
    usageCount: number;
    rating?: number;
  };
}

export interface ReportGenerationRequest {
  requestId: string;
  reportId?: string;
  templateId?: string;
  parameters: {
    name?: string;
    description?: string;
    type: 'standard' | 'custom' | 'scheduled';
    category: 'executive' | 'operational' | 'financial' | 'compliance' | 'tax' | 'custom';
    format: 'pdf' | 'excel' | 'csv' | 'html' | 'json';
    filters: {
      dateRange: {
        startDate: Date;
        endDate: Date;
      };
      departments?: string[];
      employees?: string[];
      categories?: string[];
      statuses?: string[];
      amountRange?: {
        min: number;
        max: number;
      };
      tags?: string[];
    };
    groupBy?: Array<'employee' | 'department' | 'category' | 'date' | 'status' | 'project'>;
    sortBy?: Array<{
      field: string;
      direction: 'asc' | 'desc';
    }>;
    columns?: Array<{
      field: string;
      label: string;
      width?: number;
      format?: string;
      aggregate?: 'sum' | 'average' | 'count' | 'min' | 'max';
    }>;
    includeCharts?: boolean;
    includeDetails?: boolean;
    includeSummary?: boolean;
    customFields?: string[];
  };
  requestedBy: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface ReportGenerationResponse {
  requestId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  reportId?: string;
  progress?: number;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  estimatedCompletion?: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export class ExpenseReportService {
  // Create expense report
  async createExpenseReport(params: {
    name: string;
    description: string;
    type: 'standard' | 'custom' | 'scheduled';
    category: 'executive' | 'operational' | 'financial' | 'compliance' | 'tax' | 'custom';
    templateId?: string;
    configuration: {
      format: 'pdf' | 'excel' | 'csv' | 'html' | 'json';
      layout?: 'portrait' | 'landscape';
      includeCharts?: boolean;
      includeDetails?: boolean;
      includeSummary?: boolean;
      includeAttachments?: boolean;
      customFields?: string[];
      filters: {
        dateRange: {
          startDate: Date;
          endDate: Date;
        };
        departments?: string[];
        employees?: string[];
        categories?: string[];
        statuses?: string[];
        amountRange?: {
          min: number;
          max: number;
        };
        tags?: string[];
      };
      groupBy?: Array<'employee' | 'department' | 'category' | 'date' | 'status' | 'project'>;
      sortBy?: Array<{
        field: string;
        direction: 'asc' | 'desc';
      }>;
      columns?: Array<{
        field: string;
        label: string;
        width?: number;
        format?: string;
        aggregate?: 'sum' | 'average' | 'count' | 'min' | 'max';
      }>;
    };
    scheduling?: {
      isScheduled: boolean;
      frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
      dayOfWeek?: number;
      dayOfMonth?: number;
      time: string;
      timezone: string;
      recipients: Array<{
        userId: string;
        email: string;
        format: 'pdf' | 'excel' | 'csv';
      }>;
    };
    access?: {
      viewers?: string[];
      editors?: string[];
      isPublic?: boolean;
    };
    tags?: string[];
    notes?: string;
    createdBy: string;
  }): Promise<ExpenseReport> {
    const reportId = `REPORT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Get template if specified
    let template = null;
    if (params.templateId) {
      template = await this.getReportTemplate(params.templateId);
    }
    
    const report: ExpenseReport = {
      reportId,
      reportName: params.name,
      description: params.description,
      type: params.type,
      category: params.category,
      
      configuration: {
        template: params.templateId || 'default',
        format: params.configuration.format,
        layout: params.configuration.layout || (template?.configuration.layout || 'portrait'),
        includeCharts: params.configuration.includeCharts ?? true,
        includeDetails: params.configuration.includeDetails ?? true,
        includeSummary: params.configuration.includeSummary ?? true,
        includeAttachments: params.configuration.includeAttachments ?? false,
        customFields: params.configuration.customFields || [],
        filters: params.configuration.filters,
        groupBy: params.configuration.groupBy || [],
        sortBy: params.configuration.sortBy || [],
        columns: params.configuration.columns || this.getDefaultColumns(params.category)
      },
      
      scheduling: {
        isScheduled: params.scheduling?.isScheduled || false,
        frequency: params.scheduling?.frequency || 'monthly',
        time: params.scheduling?.time || '09:00',
        timezone: params.scheduling?.timezone || 'UTC',
        dayOfWeek: params.scheduling?.dayOfWeek,
        dayOfMonth: params.scheduling?.dayOfMonth,
        recipients: params.scheduling?.recipients || []
      },
      
      access: {
        owner: params.createdBy,
        viewers: params.access?.viewers || [],
        editors: params.access?.editors || [],
        isPublic: params.access?.isPublic || false
      },
      
      data: {
        generatedAt: new Date(),
        generatedBy: params.createdBy,
        recordCount: 0,
        totalAmount: 0,
        summary: {
          totalExpenses: 0,
          totalAmount: 0,
          averageExpense: 0,
          approvedExpenses: 0,
          pendingExpenses: 0,
          rejectedExpenses: 0,
          topCategories: [],
          topEmployees: []
        },
        details: [],
        charts: []
      },
      
      status: 'draft',
      
      analytics: {
        views: 0,
        downloads: 0,
        shares: 0,
        averageViewTime: 0
      },
      
      metadata: {
        createdAt: new Date(),
        createdBy: params.createdBy,
        updatedAt: new Date(),
        updatedBy: params.createdBy,
        version: 1,
        tags: params.tags || [],
        notes: params.notes
      }
    };
    
    // Calculate next run date if scheduled
    if (report.scheduling.isScheduled) {
      report.scheduling.nextRunDate = this.calculateNextRunDate(report.scheduling);
    }
    
    // Save report
    await this.saveExpenseReport(report);
    
    // Send notifications
    await this.sendReportNotifications(report, 'created');
    
    return report;
  }
  
  // Generate report
  async generateReport(params: ReportGenerationRequest): Promise<ReportGenerationResponse> {
    const response: ReportGenerationResponse = {
      requestId: params.requestId,
      status: 'pending',
      startedAt: new Date()
    };
    
    try {
      response.status = 'processing';
      
      // Get or create report
      let report: ExpenseReport;
      if (params.reportId) {
        report = await this.getExpenseReport(params.reportId);
        if (!report) {
          throw new Error('Report not found');
        }
      } else {
        // Create temporary report for generation
        report = await this.createExpenseReport({
          name: params.parameters.name || 'Generated Report',
          description: params.parameters.description || '',
          type: params.parameters.type,
          category: params.parameters.category,
          configuration: params.parameters as any,
          createdBy: params.requestedBy
        });
      }
      
      // Update report status
      report.status = 'generating';
      await this.updateExpenseReport(report);
      
      // Generate report data
      const reportData = await this.generateReportData(report, params.parameters);
      
      // Update report with generated data
      report.data = reportData;
      report.status = 'ready';
      report.metadata.updatedAt = new Date();
      report.metadata.updatedBy = params.requestedBy;
      
      // Generate file
      const fileData = await this.generateReportFile(report, params.parameters.format);
      report.export = fileData;
      
      // Save report
      await this.updateExpenseReport(report);
      
      response.status = 'completed';
      response.reportId = report.reportId;
      response.completedAt = new Date();
      
      // Send notifications
      await this.sendReportNotifications(report, 'generated');
      
    } catch (error) {
      response.status = 'failed';
      response.error = {
        code: 'GENERATION_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error
      };
      response.completedAt = new Date();
    }
    
    return response;
  }
  
  // Create report template
  async createReportTemplate(params: {
    name: string;
    description: string;
    category: 'executive' | 'operational' | 'financial' | 'compliance' | 'tax' | 'custom';
    configuration: {
      layout?: 'portrait' | 'landscape';
      pageSize?: 'A4' | 'A3' | 'letter' | 'legal';
      margins?: {
        top: number;
        right: number;
        bottom: number;
        left: number;
      };
      header?: {
        enabled: boolean;
        content: string;
        height: number;
        logo?: string;
      };
      footer?: {
        enabled: boolean;
        content: string;
        height: number;
        pageNumber: boolean;
      };
      styles?: {
        fontFamily?: string;
        fontSize?: number;
        primaryColor?: string;
        secondaryColor?: string;
        accentColor?: string;
      };
    };
    sections?: Array<{
      sectionId: string;
      name: string;
      type: 'summary' | 'details' | 'chart' | 'table' | 'text' | 'custom';
      order: number;
      enabled: boolean;
      configuration: any;
    }>;
    defaultColumns?: Array<{
      field: string;
      label: string;
      width?: number;
      format?: string;
      aggregate?: 'sum' | 'average' | 'count' | 'min' | 'max';
    }>;
    defaultFilters?: {
      dateRange: boolean;
      departments: boolean;
      employees: boolean;
      categories: boolean;
      statuses: boolean;
      amountRange: boolean;
    };
    createdBy: string;
  }): Promise<ReportTemplate> {
    const templateId = `TEMPLATE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const template: ReportTemplate = {
      templateId,
      name: params.name,
      description: params.description,
      category: params.category,
      
      configuration: {
        layout: params.configuration.layout || 'portrait',
        pageSize: params.configuration.pageSize || 'A4',
        margins: params.configuration.margins || {
          top: 20,
          right: 20,
          bottom: 20,
          left: 20
        },
        header: params.configuration.header || {
          enabled: true,
          content: '{company_name} - Expense Report',
          height: 50
        },
        footer: params.configuration.footer || {
          enabled: true,
          content: 'Page {page_number} - Generated on {date}',
          height: 30,
          pageNumber: true
        },
        styles: params.configuration.styles || {
          fontFamily: 'Arial',
          fontSize: 12,
          primaryColor: '#000000',
          secondaryColor: '#666666',
          accentColor: '#007bff'
        }
      },
      
      sections: params.sections || this.getDefaultSections(params.category),
      
      defaultColumns: params.defaultColumns || this.getDefaultColumns(params.category),
      
      defaultFilters: params.defaultFilters || {
        dateRange: true,
        departments: true,
        employees: true,
        categories: true,
        statuses: true,
        amountRange: false
      },
      
      status: 'active',
      
      metadata: {
        createdAt: new Date(),
        createdBy: params.createdBy,
        updatedAt: new Date(),
        updatedBy: params.createdBy,
        usageCount: 0
      }
    };
    
    // Save template
    await this.saveReportTemplate(template);
    
    return template;
  }
  
  // Schedule report delivery
  async scheduleReportDelivery(reportId: string, params: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    dayOfWeek?: number;
    dayOfMonth?: number;
    time: string;
    timezone: string;
    recipients: Array<{
      userId: string;
      email: string;
      format: 'pdf' | 'excel' | 'csv';
    }>;
    updatedBy: string;
  }): Promise<ExpenseReport> {
    const report = await this.getExpenseReport(reportId);
    if (!report) {
      throw new Error('Report not found');
    }
    
    report.scheduling.isScheduled = true;
    report.scheduling.frequency = params.frequency;
    report.scheduling.dayOfWeek = params.dayOfWeek;
    report.scheduling.dayOfMonth = params.dayOfMonth;
    report.scheduling.time = params.time;
    report.scheduling.timezone = params.timezone;
    report.scheduling.recipients = params.recipients;
    report.scheduling.nextRunDate = this.calculateNextRunDate({
      frequency: params.frequency,
      dayOfWeek: params.dayOfWeek,
      dayOfMonth: params.dayOfMonth,
      time: params.time,
      timezone: params.timezone
    });
    
    report.metadata.updatedBy = params.updatedBy;
    report.metadata.updatedAt = new Date();
    
    await this.updateExpenseReport(report);
    
    // Schedule the job
    await this.scheduleReportJob(report);
    
    return report;
  }
  
  // Get report analytics
  async getReportAnalytics(params: {
    startDate: Date;
    endDate: Date;
    reportId?: string;
    category?: string;
  }): Promise<{
    overview: {
      totalReports: number;
      generatedReports: number;
      scheduledReports: number;
      failedReports: number;
      averageGenerationTime: number;
    };
    usage: {
      totalViews: number;
      totalDownloads: number;
      totalShares: number;
      topViewedReports: Array<{
        reportId: string;
        reportName: string;
        views: number;
        downloads: number;
      }>;
      mostActiveUsers: Array<{
        userId: string;
        userName: string;
        reportsCreated: number;
        reportsViewed: number;
      }>;
    };
    performance: {
      generationTimes: Array<{
        date: string;
        averageTime: number;
        reportCount: number;
      }>;
      errorRates: Array<{
        date: string;
        errors: number;
        total: number;
        errorRate: number;
      }>;
      popularFormats: Array<{
        format: string;
        count: number;
        percentage: number;
      }>;
    };
  }> {
    // Mock analytics data
    return {
      overview: {
        totalReports: 500,
        generatedReports: 450,
        scheduledReports: 50,
        failedReports: 10,
        averageGenerationTime: 45.5
      },
      usage: {
        totalViews: 2500,
        totalDownloads: 800,
        totalShares: 150,
        topViewedReports: [
          {
            reportId: 'report1',
            reportName: 'Monthly Expense Summary',
            views: 150,
            downloads: 45
          }
        ],
        mostActiveUsers: [
          {
            userId: 'user1',
            userName: 'John Manager',
            reportsCreated: 25,
            reportsViewed: 200
          }
        ]
      },
      performance: {
        generationTimes: [
          { date: '2024-01-01', averageTime: 42.3, reportCount: 45 },
          { date: '2024-01-02', averageTime: 48.7, reportCount: 52 }
        ],
        errorRates: [
          { date: '2024-01-01', errors: 2, total: 45, errorRate: 4.4 },
          { date: '2024-01-02', errors: 1, total: 52, errorRate: 1.9 }
        ],
        popularFormats: [
          { format: 'pdf', count: 300, percentage: 60.0 },
          { format: 'excel', count: 150, percentage: 30.0 },
          { format: 'csv', count: 50, percentage: 10.0 }
        ]
      }
    };
  }
  
  // Helper methods
  private async generateReportData(report: ExpenseReport, parameters: any): Promise<any> {
    // Mock data generation - would query expense collection
    const mockData = {
      generatedAt: new Date(),
      generatedBy: 'system',
      recordCount: 150,
      totalAmount: 25000,
      summary: {
        totalExpenses: 150,
        totalAmount: 25000,
        averageExpense: 166.67,
        approvedExpenses: 120,
        pendingExpenses: 25,
        rejectedExpenses: 5,
        topCategories: [
          { categoryId: 'cat1', categoryName: 'Travel', amount: 10000, count: 50, percentage: 40.0 },
          { categoryId: 'cat2', categoryName: 'Meals', amount: 7500, count: 60, percentage: 30.0 }
        ],
        topEmployees: [
          { employeeId: 'emp1', employeeName: 'John Doe', amount: 5000, count: 25, percentage: 20.0 }
        ]
      },
      details: Array.from({ length: 10 }, (_, i) => ({
        expenseId: `EXP-${i + 1}`,
        employeeName: `Employee ${i + 1}`,
        department: `Department ${(i % 3) + 1}`,
        category: ['Travel', 'Meals', 'Office'][i % 3],
        amount: Math.floor(Math.random() * 500) + 50,
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        status: ['approved', 'pending', 'rejected'][i % 3],
        description: `Expense description ${i + 1}`
      })),
      charts: [
        {
          type: 'pie',
          title: 'Expenses by Category',
          data: {
            labels: ['Travel', 'Meals', 'Office'],
            datasets: [{
              data: [10000, 7500, 7500],
              backgroundColor: ['#007bff', '#28a745', '#ffc107']
            }]
          }
        }
      ]
    };
    
    return mockData;
  }
  
  private async generateReportFile(report: ExpenseReport, format: string): Promise<any> {
    // Mock file generation
    const fileId = `FILE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    return {
      fileId,
      fileName: `${report.reportName.replace(/[^a-zA-Z0-9]/g, '_')}.${format}`,
      fileSize: Math.floor(Math.random() * 1000000) + 100000, // 100KB - 1.1MB
      downloadUrl: `https://example.com/files/${fileId}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    };
  }
  
  private getDefaultColumns(category: string): Array<{field: string; label: string}> {
    const baseColumns = [
      { field: 'expenseId', label: 'Expense ID' },
      { field: 'employeeName', label: 'Employee' },
      { field: 'date', label: 'Date' },
      { field: 'category', label: 'Category' },
      { field: 'amount', label: 'Amount' },
      { field: 'status', label: 'Status' }
    ];
    
    switch (category) {
      case 'financial':
        return [
          ...baseColumns,
          { field: 'taxAmount', label: 'Tax' },
          { field: 'totalAmount', label: 'Total' },
          { field: 'reimbursable', label: 'Reimbursable' }
        ];
      case 'compliance':
        return [
          ...baseColumns,
          { field: 'submittedAt', label: 'Submitted' },
          { field: 'approvedAt', label: 'Approved' },
          { field: 'policyViolations', label: 'Violations' }
        ];
      default:
        return baseColumns;
    }
  }
  
  private getDefaultSections(category: string): Array<any> {
    const baseSections = [
      {
        sectionId: 'summary',
        name: 'Executive Summary',
        type: 'summary',
        order: 1,
        enabled: true,
        configuration: {}
      },
      {
        sectionId: 'charts',
        name: 'Charts & Graphs',
        type: 'chart',
        order: 2,
        enabled: true,
        configuration: {}
      },
      {
        sectionId: 'details',
        name: 'Detailed Expenses',
        type: 'table',
        order: 3,
        enabled: true,
        configuration: {}
      }
    ];
    
    return baseSections;
  }
  
  private calculateNextRunDate(scheduling: any): Date {
    const now = new Date();
    let nextRun = new Date(now);
    
    switch (scheduling.frequency) {
      case 'daily':
        nextRun.setDate(nextRun.getDate() + 1);
        break;
      case 'weekly':
        const daysUntilTarget = (scheduling.dayOfWeek! - now.getDay() + 7) % 7 || 7;
        nextRun.setDate(nextRun.getDate() + daysUntilTarget);
        break;
      case 'monthly':
        nextRun.setMonth(nextRun.getMonth() + 1);
        nextRun.setDate(Math.min(scheduling.dayOfMonth!, this.getDaysInMonth(nextRun)));
        break;
      case 'quarterly':
        nextRun.setMonth(nextRun.getMonth() + 3);
        break;
      case 'yearly':
        nextRun.setFullYear(nextRun.getFullYear() + 1);
        break;
    }
    
    // Set time
    const [hours, minutes] = scheduling.time.split(':').map(Number);
    nextRun.setHours(hours, minutes, 0, 0);
    
    return nextRun;
  }
  
  private getDaysInMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }
  
  // Database operations (mock implementations)
  private async saveExpenseReport(report: ExpenseReport): Promise<void> {
    console.log(`Saving expense report ${report.reportId}`);
  }
  
  private async updateExpenseReport(report: ExpenseReport): Promise<void> {
    console.log(`Updating expense report ${report.reportId}`);
  }
  
  private async getExpenseReport(reportId: string): Promise<ExpenseReport | null> {
    // Mock implementation
    return null;
  }
  
  private async saveReportTemplate(template: ReportTemplate): Promise<void> {
    console.log(`Saving report template ${template.templateId}`);
  }
  
  private async getReportTemplate(templateId: string): Promise<ReportTemplate | null> {
    // Mock implementation
    return null;
  }
  
  private async scheduleReportJob(report: ExpenseReport): Promise<void> {
    console.log(`Scheduling report job for ${report.reportId}`);
  }
  
  private async sendReportNotifications(report: ExpenseReport, action: string): Promise<void> {
    console.log(`Sending ${action} notifications for report ${report.reportId}`);
  }
}
