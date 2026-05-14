import { Customer, ICustomer } from '../models/Customer';
import mongoose from 'mongoose';
import { EventEmitter } from 'events';

export interface CreateCustomerData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  dateOfBirth?: Date;
  anniversaryDate?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  preferredLanguage?: string;
  timezone?: string;
  companyName?: string;
  taxId?: string;
  businessType?: 'individual' | 'corporate' | 'nonprofit' | 'government';
  creditLimit?: number;
  terms?: string;
  addresses?: Array<{
    type: 'billing' | 'shipping' | 'both';
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault?: boolean;
  }>;
  customFields?: Array<{
    fieldId: string;
    fieldName: string;
    fieldType: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect';
    value: any;
    isRequired?: boolean;
  }>;
  tags?: string[];
  source?: 'walkin' | 'website' | 'referral' | 'social' | 'import' | 'api' | 'other';
  referredBy?: string;
  preferredContactMethod?: 'email' | 'sms' | 'phone' | 'inapp';
  preferredStore?: string;
  notificationPreferences?: {
    promotions?: boolean;
    orderUpdates?: boolean;
    loyaltyUpdates?: boolean;
    birthdayOffers?: boolean;
    newsletters?: boolean;
  };
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {
  status?: 'lead' | 'prospect' | 'active' | 'inactive' | 'archived' | 'blocked';
  loyaltyTier?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'none';
  loyaltyPoints?: number;
  emailConsent?: boolean;
  smsConsent?: boolean;
  phoneConsent?: boolean;
  marketingConsent?: boolean;
}

export interface CustomerSearchOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
  tags?: string[];
  loyaltyTier?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minSpent?: number;
  maxSpent?: number;
  churnRisk?: string;
  source?: string;
}

export interface ImportResult {
  total: number;
  imported: number;
  failed: number;
  duplicates: number;
  errors: Array<{ row: number; error: string; data?: any }>;
}

class CustomerService extends EventEmitter {
  /**
   * Create a new customer
   */
  async createCustomer(data: CreateCustomerData, createdBy: string): Promise<ICustomer> {
    try {
      // Check for duplicates
      const existing = await Customer.findByEmailOrPhone(data.email, data.phone);
      if (existing) {
        throw new Error('Customer with this email or phone already exists');
      }

      // Generate customer ID
      const customerId = Customer.generateCustomerId();

      // Set default addresses
      if (data.addresses && data.addresses.length > 0) {
        data.addresses.forEach(addr => {
          if (addr.isDefault === undefined) {
            addr.isDefault = data.addresses!.length === 1;
          }
        });
      }

      const customer = new Customer({
        ...data,
        customerId,
        createdBy,
        updatedBy: createdBy,
        status: 'lead',
        loyaltyTier: 'none',
        loyaltyPoints: 0
      });

      await customer.save();

      // Emit event
      this.emit('customerCreated', customer);

      return customer;
    } catch (error) {
      throw new Error(`Failed to create customer: ${error.message}`);
    }
  }

  /**
   * Get customer by ID
   */
  async getCustomerById(customerId: string): Promise<ICustomer | null> {
    try {
      return await Customer.findOne({ customerId });
    } catch (error) {
      throw new Error(`Failed to get customer: ${error.message}`);
    }
  }

  /**
   * Update customer
   */
  async updateCustomer(
    customerId: string,
    data: UpdateCustomerData,
    updatedBy: string
  ): Promise<ICustomer | null> {
    try {
      const customer = await Customer.findOne({ customerId });
      if (!customer) {
        throw new Error('Customer not found');
      }

      // Handle status change
      if (data.status && data.status !== customer.status) {
        customer.updateStatus(data.status, updatedBy);
      }

      // Update other fields
      Object.assign(customer, data, { updatedBy });

      await customer.save();

      // Emit event
      this.emit('customerUpdated', customer);

      return customer;
    } catch (error) {
      throw new Error(`Failed to update customer: ${error.message}`);
    }
  }

  /**
   * Delete customer (soft delete - archive)
   */
  async deleteCustomer(customerId: string, deletedBy: string): Promise<boolean> {
    try {
      const customer = await Customer.findOne({ customerId });
      if (!customer) {
        throw new Error('Customer not found');
      }

      customer.status = 'archived';
      customer.updatedBy = deletedBy;
      await customer.save();

      // Emit event
      this.emit('customerDeleted', customer);

      return true;
    } catch (error) {
      throw new Error(`Failed to delete customer: ${error.message}`);
    }
  }

  /**
   * Search customers with advanced filters
   */
  async searchCustomers(options: CustomerSearchOptions = {}): Promise<{
    customers: ICustomer[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        status,
        tags,
        loyaltyTier,
        search,
        dateFrom,
        dateTo,
        minSpent,
        maxSpent,
        churnRisk,
        source
      } = options;

      const query: any = {};

      // Build query
      if (status) query.status = status;
      if (loyaltyTier) query.loyaltyTier = loyaltyTier;
      if (churnRisk) query.churnRisk = churnRisk;
      if (source) query.source = source;
      if (tags && tags.length > 0) query.tags = { $in: tags };

      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { companyName: { $regex: search, $options: 'i' } }
        ];
      }

      if (dateFrom || dateTo) {
        query.createdAt = {};
        if (dateFrom) query.createdAt.$gte = dateFrom;
        if (dateTo) query.createdAt.$lte = dateTo;
      }

      if (minSpent !== undefined || maxSpent !== undefined) {
        query.totalSpent = {};
        if (minSpent !== undefined) query.totalSpent.$gte = minSpent;
        if (maxSpent !== undefined) query.totalSpent.$lte = maxSpent;
      }

      // Execute query with pagination
      const skip = (page - 1) * limit;
      const sort: any = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      const customers = await Customer.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec();

      const total = await Customer.countDocuments(query);
      const totalPages = Math.ceil(total / limit);

      return {
        customers,
        total,
        page,
        totalPages
      };
    } catch (error) {
      throw new Error(`Failed to search customers: ${error.message}`);
    }
  }

  /**
   * Add communication record
   */
  async addCommunication(
    customerId: string,
    type: string,
    content: string,
    direction: 'inbound' | 'outbound' = 'outbound',
    employeeId?: string,
    subject?: string
  ): Promise<ICustomer | null> {
    try {
      const customer = await Customer.findOne({ customerId });
      if (!customer) {
        throw new Error('Customer not found');
      }

      await customer.addCommunication(type, content, direction, employeeId, subject);

      // Emit event
      this.emit('communicationAdded', { customer, type, direction });

      return customer;
    } catch (error) {
      throw new Error(`Failed to add communication: ${error.message}`);
    }
  }

  /**
   * Add customer note
   */
  async addNote(
    customerId: string,
    note: string,
    createdBy: string,
    isPrivate: boolean = false,
    category: string = 'general',
    tags: string[] = []
  ): Promise<ICustomer | null> {
    try {
      const customer = await Customer.findOne({ customerId });
      if (!customer) {
        throw new Error('Customer not found');
      }

      await customer.addNote(note, createdBy, isPrivate, category, tags);

      // Emit event
      this.emit('noteAdded', { customer, note, category });

      return customer;
    } catch (error) {
      throw new Error(`Failed to add note: ${error.message}`);
    }
  }

  /**
   * Upload customer document
   */
  async uploadDocument(
    customerId: string,
    documentData: {
      name: string;
      type: 'id' | 'contract' | 'agreement' | 'photo' | 'other';
      url: string;
      uploadedBy: string;
      expiresAt?: Date;
    }
  ): Promise<ICustomer | null> {
    try {
      const customer = await Customer.findOne({ customerId });
      if (!customer) {
        throw new Error('Customer not found');
      }

      const document = {
        id: new mongoose.Types.ObjectId().toString(),
        ...documentData,
        uploadedAt: new Date(),
        isVerified: false
      };

      customer.documents.push(document);
      await customer.save();

      // Emit event
      this.emit('documentUploaded', { customer, document });

      return customer;
    } catch (error) {
      throw new Error(`Failed to upload document: ${error.message}`);
    }
  }

  /**
   * Import customers from CSV/Excel
   */
  async importCustomers(
    customersData: any[],
    options: {
      skipDuplicates?: boolean;
      updateExisting?: boolean;
      createdBy: string;
    }
  ): Promise<ImportResult> {
    const result: ImportResult = {
      total: customersData.length,
      imported: 0,
      failed: 0,
      duplicates: 0,
      errors: []
    };

    for (let i = 0; i < customersData.length; i++) {
      try {
        const data = customersData[i];
        
        // Validate required fields
        if (!data.firstName || !data.lastName || !data.email || !data.phone) {
          result.errors.push({
            row: i + 1,
            error: 'Missing required fields (firstName, lastName, email, phone)',
            data
          });
          result.failed++;
          continue;
        }

        // Check for existing customer
        const existing = await Customer.findByEmailOrPhone(data.email, data.phone);
        
        if (existing) {
          if (options.skipDuplicates) {
            result.duplicates++;
            continue;
          } else if (options.updateExisting) {
            await this.updateCustomer(existing.customerId, data, options.createdBy);
            result.imported++;
            continue;
          } else {
            result.errors.push({
              row: i + 1,
              error: 'Customer already exists',
              data
            });
            result.failed++;
            continue;
          }
        }

        // Create new customer
        await this.createCustomer(data, options.createdBy);
        result.imported++;

      } catch (error) {
        result.errors.push({
          row: i + 1,
          error: error.message,
          data: customersData[i]
        });
        result.failed++;
      }
    }

    // Emit event
    this.emit('customersImported', result);

    return result;
  }

  /**
   * Export customers to CSV
   */
  async exportCustomers(options: CustomerSearchOptions = {}): Promise<any[]> {
    try {
      const { customers } = await this.searchCustomers({
        ...options,
        limit: 10000 // Large limit for export
      });

      return customers.map(customer => ({
        customerId: customer.customerId,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        companyName: customer.companyName,
        status: customer.status,
        loyaltyTier: customer.loyaltyTier,
        loyaltyPoints: customer.loyaltyPoints,
        totalSpent: customer.totalSpent,
        orderCount: customer.orderCount,
        averageOrderValue: customer.averageOrderValue,
        lastPurchaseAt: customer.lastPurchaseAt,
        createdAt: customer.createdAt,
        tags: customer.tags.join(', '),
        source: customer.source
      }));
    } catch (error) {
      throw new Error(`Failed to export customers: ${error.message}`);
    }
  }

  /**
   * Find duplicate customers
   */
  async findDuplicates(): Promise<any[]> {
    try {
      return await Customer.findDuplicates();
    } catch (error) {
      throw new Error(`Failed to find duplicates: ${error.message}`);
    }
  }

  /**
   * Merge duplicate customers
   */
  async mergeCustomers(
    primaryCustomerId: string,
    duplicateCustomerIds: string[],
    mergedBy: string
  ): Promise<ICustomer | null> {
    try {
      const primaryCustomer = await Customer.findOne({ customerId: primaryCustomerId });
      if (!primaryCustomer) {
        throw new Error('Primary customer not found');
      }

      for (const duplicateId of duplicateCustomerIds) {
        const duplicateCustomer = await Customer.findOne({ customerId: duplicateId });
        if (!duplicateCustomer) continue;

        // Merge data
        primaryCustomer.totalSpent += duplicateCustomer.totalSpent;
        primaryCustomer.orderCount += duplicateCustomer.orderCount;
        primaryCustomer.loyaltyPoints += duplicateCustomer.loyaltyPoints;

        // Merge addresses (keep unique ones)
        duplicateCustomer.addresses.forEach(addr => {
          if (!primaryCustomer.addresses.some(pAddr => 
            pAddr.street === addr.street && pAddr.city === addr.city
          )) {
            primaryCustomer.addresses.push(addr);
          }
        });

        // Merge communication history
        primaryCustomer.communicationHistory.push(...duplicateCustomer.communicationHistory);

        // Merge notes
        primaryCustomer.notes.push(...duplicateCustomer.notes);

        // Merge documents
        primaryCustomer.documents.push(...duplicateCustomer.documents);

        // Add to merge history
        primaryCustomer.mergeHistory.push({
          mergedFrom: duplicateId,
          mergedAt: new Date(),
          mergedBy
        });

        // Mark duplicate as merged
        duplicateCustomer.isDuplicate = true;
        duplicateCustomer.duplicateOf = primaryCustomerId;
        await duplicateCustomer.save();
      }

      // Update analytics
      if (primaryCustomer.orderCount > 0) {
        primaryCustomer.averageOrderValue = primaryCustomer.totalSpent / primaryCustomer.orderCount;
      }

      await primaryCustomer.save();

      // Emit event
      this.emit('customersMerged', { primaryCustomer, duplicateCustomerIds });

      return primaryCustomer;
    } catch (error) {
      throw new Error(`Failed to merge customers: ${error.message}`);
    }
  }

  /**
   * Get customer analytics
   */
  async getCustomerAnalytics(dateFrom?: Date, dateTo?: Date): Promise<{
    totalCustomers: number;
    activeCustomers: number;
    newCustomers: number;
    totalSpent: number;
    averageOrderValue: number;
    loyaltyDistribution: any;
    churnRiskDistribution: any;
    sourceDistribution: any;
  }> {
    try {
      const matchStage: any = {};
      if (dateFrom || dateTo) {
        matchStage.createdAt = {};
        if (dateFrom) matchStage.createdAt.$gte = dateFrom;
        if (dateTo) matchStage.createdAt.$lte = dateTo;
      }

      const analytics = await Customer.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalCustomers: { $sum: 1 },
            activeCustomers: {
              $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
            },
            totalSpent: { $sum: '$totalSpent' },
            totalOrders: { $sum: '$orderCount' },
            loyaltyDistribution: {
              $push: '$loyaltyTier'
            },
            churnRiskDistribution: {
              $push: '$churnRisk'
            },
            sourceDistribution: {
              $push: '$source'
            }
          }
        }
      ]);

      const result = analytics[0] || {
        totalCustomers: 0,
        activeCustomers: 0,
        totalSpent: 0,
        totalOrders: 0,
        loyaltyDistribution: [],
        churnRiskDistribution: [],
        sourceDistribution: []
      };

      // Calculate new customers (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const newCustomers = await Customer.countDocuments({
        createdAt: { $gte: thirtyDaysAgo }
      });

      // Calculate distributions
      const loyaltyDistribution = this.calculateDistribution(result.loyaltyDistribution);
      const churnRiskDistribution = this.calculateDistribution(result.churnRiskDistribution);
      const sourceDistribution = this.calculateDistribution(result.sourceDistribution);

      return {
        totalCustomers: result.totalCustomers,
        activeCustomers: result.activeCustomers,
        newCustomers,
        totalSpent: result.totalSpent,
        averageOrderValue: result.totalOrders > 0 ? result.totalSpent / result.totalOrders : 0,
        loyaltyDistribution,
        churnRiskDistribution,
        sourceDistribution
      };
    } catch (error) {
      throw new Error(`Failed to get customer analytics: ${error.message}`);
    }
  }

  /**
   * Helper method to calculate distribution
   */
  private calculateDistribution(items: string[]): any {
    const distribution: any = {};
    items.forEach(item => {
      distribution[item] = (distribution[item] || 0) + 1;
    });
    return distribution;
  }

  /**
   * Add customer to segment
   */
  async addToSegment(
    customerId: string,
    segmentId: string,
    segmentName: string,
    assignedBy: string,
    autoAssigned: boolean = false
  ): Promise<ICustomer | null> {
    try {
      const customer = await Customer.findOne({ customerId });
      if (!customer) {
        throw new Error('Customer not found');
      }

      // Check if already in segment
      if (customer.segments.some(seg => seg.segmentId === segmentId)) {
        return customer;
      }

      customer.segments.push({
        segmentId,
        name: segmentName,
        assignedAt: new Date(),
        assignedBy,
        autoAssigned
      });

      await customer.save();

      // Emit event
      this.emit('segmentAdded', { customer, segmentId, segmentName });

      return customer;
    } catch (error) {
      throw new Error(`Failed to add to segment: ${error.message}`);
    }
  }

  /**
   * Remove customer from segment
   */
  async removeFromSegment(
    customerId: string,
    segmentId: string
  ): Promise<ICustomer | null> {
    try {
      const customer = await Customer.findOne({ customerId });
      if (!customer) {
        throw new Error('Customer not found');
      }

      customer.segments = customer.segments.filter(seg => seg.segmentId !== segmentId);
      await customer.save();

      // Emit event
      this.emit('segmentRemoved', { customer, segmentId });

      return customer;
    } catch (error) {
      throw new Error(`Failed to remove from segment: ${error.message}`);
    }
  }

  /**
   * Update customer tags
   */
  async updateTags(
    customerId: string,
    tags: string[],
    updatedBy: string
  ): Promise<ICustomer | null> {
    try {
      const customer = await Customer.findOne({ customerId });
      if (!customer) {
        throw new Error('Customer not found');
      }

      customer.tags = [...new Set(tags)]; // Remove duplicates
      customer.updatedBy = updatedBy;
      await customer.save();

      // Emit event
      this.emit('tagsUpdated', { customer, tags });

      return customer;
    } catch (error) {
      throw new Error(`Failed to update tags: ${error.message}`);
    }
  }
}

export const customerService = new CustomerService();
export default customerService;
