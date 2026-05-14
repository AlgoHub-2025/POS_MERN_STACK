import { Request, Response } from 'express';
import { customerService, CreateCustomerData, UpdateCustomerData, CustomerSearchOptions } from '../services/customerService';
import multer from 'multer';
import csv from 'csv-parser';
import { Readable } from 'stream';

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

/**
 * Create a new customer
 */
export const createCustomer = async (req: Request, res: Response) => {
  try {
    const customerData: CreateCustomerData = req.body;
    const createdBy = req.user?.id || 'system';

    const customer = await customerService.createCustomer(customerData, createdBy);

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get customer by ID
 */
export const getCustomer = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const customer = await customerService.getCustomerById(customerId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update customer
 */
export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const updateData: UpdateCustomerData = req.body;
    const updatedBy = req.user?.id || 'system';

    const customer = await customerService.updateCustomer(customerId, updateData, updatedBy);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: customer
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Delete customer (soft delete)
 */
export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const deletedBy = req.user?.id || 'system';

    const success = await customerService.deleteCustomer(customerId, deletedBy);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Search customers with filters
 */
export const searchCustomers = async (req: Request, res: Response) => {
  try {
    const options: CustomerSearchOptions = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
      sortBy: req.query.sortBy as string || 'createdAt',
      sortOrder: (req.query.sortOrder as string) === 'asc' ? 'asc' : 'desc',
      status: req.query.status as string,
      tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
      loyaltyTier: req.query.loyaltyTier as string,
      search: req.query.search as string,
      dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
      dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
      minSpent: req.query.minSpent ? parseFloat(req.query.minSpent as string) : undefined,
      maxSpent: req.query.maxSpent ? parseFloat(req.query.maxSpent as string) : undefined,
      churnRisk: req.query.churnRisk as string,
      source: req.query.source as string
    };

    const result = await customerService.searchCustomers(options);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Add communication record
 */
export const addCommunication = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const { type, content, direction, subject } = req.body;
    const employeeId = req.user?.id;

    const customer = await customerService.addCommunication(
      customerId,
      type,
      content,
      direction,
      employeeId,
      subject
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Communication added successfully',
      data: customer
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Add customer note
 */
export const addNote = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const { note, isPrivate, category, tags } = req.body;
    const createdBy = req.user?.id || 'system';

    const customer = await customerService.addNote(
      customerId,
      note,
      createdBy,
      isPrivate,
      category,
      tags
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Note added successfully',
      data: customer
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Upload customer document
 */
export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const { name, type, url, expiresAt } = req.body;
    const uploadedBy = req.user?.id || 'system';

    const customer = await customerService.uploadDocument(customerId, {
      name,
      type,
      url,
      uploadedBy,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      data: customer
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Import customers from CSV
 */
export const importCustomers = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { skipDuplicates, updateExisting } = req.body;
    const createdBy = req.user?.id || 'system';

    // Parse CSV file
    const customersData: any[] = [];
    const readable = new Readable();
    readable.push(req.file.buffer);
    readable.push(null);

    await new Promise((resolve, reject) => {
      readable
        .pipe(csv())
        .on('data', (data) => {
          // Transform CSV data to match customer schema
          const transformedData = {
            firstName: data.firstName || data.first_name,
            lastName: data.lastName || data.last_name,
            email: data.email,
            phone: data.phone,
            alternatePhone: data.alternatePhone || data.alternate_phone,
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
            anniversaryDate: data.anniversaryDate ? new Date(data.anniversaryDate) : undefined,
            gender: data.gender,
            preferredLanguage: data.preferredLanguage || data.preferred_language || 'en',
            companyName: data.companyName || data.company_name,
            taxId: data.taxId || data.tax_id,
            businessType: data.businessType || data.business_type,
            creditLimit: data.creditLimit ? parseFloat(data.creditLimit) : undefined,
            terms: data.terms,
            source: data.source || 'import',
            tags: data.tags ? data.tags.split(',').map((tag: string) => tag.trim()) : []
          };

          customersData.push(transformedData);
        })
        .on('end', resolve)
        .on('error', reject);
    });

    const result = await customerService.importCustomers(customersData, {
      skipDuplicates: skipDuplicates === 'true',
      updateExisting: updateExisting === 'true',
      createdBy
    });

    res.json({
      success: true,
      message: 'Import completed',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Export customers to CSV
 */
export const exportCustomers = async (req: Request, res: Response) => {
  try {
    const options: CustomerSearchOptions = {
      status: req.query.status as string,
      tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
      loyaltyTier: req.query.loyaltyTier as string,
      search: req.query.search as string,
      dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
      dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
      minSpent: req.query.minSpent ? parseFloat(req.query.minSpent as string) : undefined,
      maxSpent: req.query.maxSpent ? parseFloat(req.query.maxSpent as string) : undefined,
      churnRisk: req.query.churnRisk as string,
      source: req.query.source as string
    };

    const customers = await customerService.exportCustomers(options);

    // Convert to CSV
    const csvHeaders = [
      'Customer ID',
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Company Name',
      'Status',
      'Loyalty Tier',
      'Loyalty Points',
      'Total Spent',
      'Order Count',
      'Average Order Value',
      'Last Purchase At',
      'Created At',
      'Tags',
      'Source'
    ];

    const csvRows = customers.map(customer => [
      customer.customerId,
      customer.firstName,
      customer.lastName,
      customer.email,
      customer.phone,
      customer.companyName || '',
      customer.status,
      customer.loyaltyTier,
      customer.loyaltyPoints,
      customer.totalSpent,
      customer.orderCount,
      customer.averageOrderValue,
      customer.lastPurchaseAt ? customer.lastPurchaseAt.toISOString() : '',
      customer.createdAt.toISOString(),
      customer.tags,
      customer.source
    ]);

    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=customers.csv');
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Find duplicate customers
 */
export const findDuplicates = async (req: Request, res: Response) => {
  try {
    const duplicates = await customerService.findDuplicates();

    res.json({
      success: true,
      data: duplicates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Merge duplicate customers
 */
export const mergeCustomers = async (req: Request, res: Response) => {
  try {
    const { primaryCustomerId, duplicateCustomerIds } = req.body;
    const mergedBy = req.user?.id || 'system';

    const customer = await customerService.mergeCustomers(
      primaryCustomerId,
      duplicateCustomerIds,
      mergedBy
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Primary customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Customers merged successfully',
      data: customer
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get customer analytics
 */
export const getCustomerAnalytics = async (req: Request, res: Response) => {
  try {
    const { dateFrom, dateTo } = req.query;
    
    const analytics = await customerService.getCustomerAnalytics(
      dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo ? new Date(dateTo as string) : undefined
    );

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Add customer to segment
 */
export const addToSegment = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const { segmentId, segmentName, autoAssigned } = req.body;
    const assignedBy = req.user?.id || 'system';

    const customer = await customerService.addToSegment(
      customerId,
      segmentId,
      segmentName,
      assignedBy,
      autoAssigned
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Customer added to segment successfully',
      data: customer
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Remove customer from segment
 */
export const removeFromSegment = async (req: Request, res: Response) => {
  try {
    const { customerId, segmentId } = req.params;

    const customer = await customerService.removeFromSegment(customerId, segmentId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Customer removed from segment successfully',
      data: customer
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update customer tags
 */
export const updateTags = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const { tags } = req.body;
    const updatedBy = req.user?.id || 'system';

    const customer = await customerService.updateTags(customerId, tags, updatedBy);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Tags updated successfully',
      data: customer
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get customer communication history
 */
export const getCommunicationHistory = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const customer = await customerService.getCustomerById(customerId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      data: customer.communicationHistory.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get customer notes
 */
export const getCustomerNotes = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const customer = await customerService.getCustomerById(customerId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Filter private notes based on user role
    const userRole = req.user?.role;
    let notes = customer.notes;
    
    if (userRole !== 'admin' && userRole !== 'manager') {
      notes = notes.filter(note => !note.isPrivate);
    }

    res.json({
      success: true,
      data: notes.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Export all controllers
export {
  upload
};
