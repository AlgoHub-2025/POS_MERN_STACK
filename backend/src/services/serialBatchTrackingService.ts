import { InventoryItem, IInventoryItem } from '../models/Inventory';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { User } from '../models/User';

export interface SerialNumberInfo {
  serialNumber: string;
  productId: string;
  sku: string;
  warehouseId: string;
  binLocation?: string;
  status: 'in_stock' | 'reserved' | 'sold' | 'returned' | 'damaged' | 'expired' | 'recalled';
  currentLocation: string;
  history: Array<{
    date: Date;
    location: string;
    status: string;
    transactionId: string;
    transactionType: 'purchase' | 'sale' | 'transfer' | 'adjustment' | 'return' | 'damage' | 'expiry';
    userId: string;
    notes?: string;
  }>;
  warranty: {
    startDate?: Date;
    endDate?: Date;
    provider?: string;
    terms?: string;
  };
  cost: {
    purchaseCost: number;
    currentValue: number;
    depreciation: number;
  };
  attributes: {
    manufacturer?: string;
    model?: string;
    manufactureDate?: Date;
    expiryDate?: Date;
    batchNumber?: string;
    lotNumber?: string;
  };
  quality: {
    inspections: Array<{
      date: Date;
      result: 'pass' | 'fail' | 'conditional';
      inspector: string;
      notes?: string;
      nextInspection?: Date;
    }>;
    defects: Array<{
      date: Date;
      type: string;
      severity: 'minor' | 'major' | 'critical';
      description: string;
      resolved: boolean;
      resolvedAt?: Date;
      resolvedBy?: string;
    }>;
  };
  alerts: Array<{
    type: 'warranty_expiry' | 'maintenance_due' | 'recall' | 'quality_issue';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    date: Date;
    acknowledged: boolean;
    acknowledgedBy?: string;
    acknowledgedAt?: Date;
  }>;
  createdAt: Date;
  lastUpdated: Date;
}

export interface BatchInfo {
  batchNumber: string;
  productId: string;
  sku: string;
  lotNumber?: string;
  warehouseId: string;
  quantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  manufactureDate: Date;
  expiryDate?: Date;
  status: 'active' | 'expiring' | 'expired' | 'recalled' | 'quarantined';
  supplier: {
    supplierId: string;
    name: string;
    invoiceNumber?: string;
    purchaseOrderNumber?: string;
    receivedDate: Date;
  };
  quality: {
    certificate?: string;
    inspectionDate?: Date;
    testResults?: Array<{
      test: string;
      result: string;
      standard: string;
      date: Date;
    }>;
    issues: Array<{
      type: string;
      description: string;
      date: Date;
      resolved: boolean;
    }>;
  };
  costs: {
    unitCost: number;
    totalCost: number;
    landingCost: number;
    additionalCosts: Array<{
      type: string;
      amount: number;
      description: string;
    }>;
  };
  locations: Array<{
    warehouseId: string;
    binLocation?: string;
    quantity: number;
    lastUpdated: Date;
  }>;
  movements: Array<{
    date: Date;
    fromLocation: string;
    toLocation: string;
    quantity: number;
    transactionId: string;
    transactionType: string;
    userId: string;
    reason: string;
  }>;
  recalls: Array<{
    recallId: string;
    date: Date;
    reason: string;
    status: 'active' | 'completed';
    affectedQuantity: number;
    resolvedQuantity: number;
  }>;
  alerts: Array<{
    type: 'expiry_warning' | 'quality_issue' | 'recall' | 'low_stock';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    date: Date;
    acknowledged: boolean;
  }>;
  createdAt: Date;
  lastUpdated: Date;
}

export interface TraceabilityReport {
  reportType: 'serial' | 'batch' | 'lot';
  identifier: string;
  product: {
    productId: string;
    name: string;
    sku: string;
    category: string;
  };
  journey: Array<{
    date: Date;
    location: string;
    event: string;
    quantity?: number;
    status: string;
    userId: string;
    documents?: Array<{
      type: string;
      reference: string;
      url?: string;
    }>;
  }>;
  currentStatus: {
    location: string;
    quantity: number;
    status: string;
    lastUpdated: Date;
  };
  quality: {
    inspections: number;
    passes: number;
    failures: number;
    issues: string[];
  };
  costs: {
    totalCost: number;
    currentUnitCost: number;
    landedCost: number;
    additionalCosts: number;
  };
  compliance: {
    certifications: string[];
    standards: string[];
    requirements: Array<{
      requirement: string;
      compliant: boolean;
      evidence?: string;
    }>;
  };
  alerts: Array<{
    type: string;
    severity: string;
    message: string;
    date: Date;
    actionRequired: boolean;
  }>;
  generatedAt: Date;
  generatedBy: string;
}

export interface RecallManagement {
  recallId: string;
  type: 'voluntary' | 'mandatory' | 'preventive';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  scope: {
    productIds: string[];
    serialNumbers?: string[];
    batchNumbers?: string[];
    lotNumbers?: string[];
    dateRange?: {
      from: Date;
      to: Date;
    };
    warehouses?: string[];
  };
  details: {
    reason: string;
    description: string;
    riskAssessment: string;
    affectedQuantity: number;
    distributedQuantity: number;
    recoveredQuantity: number;
    disposalQuantity: number;
  };
  timeline: {
    initiatedDate: Date;
    announcedDate: Date;
    effectiveDate: Date;
    completionDate?: Date;
  };
  communications: Array<{
    date: Date;
    type: 'supplier' | 'customer' | 'regulatory' | 'internal';
    recipient: string;
    method: string;
    subject: string;
    content: string;
    status: 'sent' | 'delivered' | 'failed';
  }>;
  actions: Array<{
    action: string;
    description: string;
    assignedTo: string;
    dueDate: Date;
    status: 'pending' | 'in_progress' | 'completed';
    completedAt?: Date;
    notes?: string;
  }>;
  financial: {
    estimatedCost: number;
    actualCost: number;
    recoveredValue: number;
    insuranceClaim?: number;
    reserveAmount: number;
  };
  documentation: {
    report: string;
    evidence: string[];
    approvals: Array<{
      approver: string;
      date: Date;
      comments?: string;
    }>;
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export class SerialBatchTrackingService {
  // Serial Number Management
  async createSerialNumbers(serialData: {
    productId: string;
    serialNumbers: string[];
    warehouseId: string;
    binLocation?: string;
    cost: number;
    attributes?: {
      manufacturer?: string;
      model?: string;
      manufactureDate?: Date;
      expiryDate?: Date;
      batchNumber?: string;
      lotNumber?: string;
    };
    warranty?: {
      startDate?: Date;
      endDate?: Date;
      provider?: string;
      terms?: string;
    };
    createdBy: string;
  }): Promise<SerialNumberInfo[]> {
    const product = await Product.findOne({ productId: serialData.productId });
    if (!product) {
      throw new Error('Product not found');
    }

    const serialInfos: SerialNumberInfo[] = [];

    for (const serialNumber of serialData.serialNumbers) {
      // Check if serial number already exists
      const existing = await InventoryItem.findOne({ serialNumber });
      if (existing) {
        throw new Error(`Serial number ${serialNumber} already exists`);
      }

      const serialInfo: SerialNumberInfo = {
        serialNumber,
        productId: serialData.productId,
        sku: product.sku,
        warehouseId: serialData.warehouseId,
        binLocation: serialData.binLocation,
        status: 'in_stock',
        currentLocation: `${serialData.warehouseId}${serialData.binLocation ? '/' + serialData.binLocation : ''}`,
        history: [{
          date: new Date(),
          location: serialInfo.currentLocation,
          status: 'in_stock',
          transactionId: `PO-${Date.now()}`,
          transactionType: 'purchase',
          userId: serialData.createdBy,
          notes: 'Initial receipt'
        }],
        warranty: serialData.warranty || {},
        cost: {
          purchaseCost: serialData.cost,
          currentValue: serialData.cost,
          depreciation: 0
        },
        attributes: serialData.attributes || {},
        quality: {
          inspections: [],
          defects: []
        },
        alerts: [],
        createdAt: new Date(),
        lastUpdated: new Date()
      };

      // Create inventory item for serial number
      const inventoryItem = new InventoryItem({
        itemId: `ITEM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        productId: serialData.productId,
        sku: product.sku,
        barcode: `SN-${serialNumber}`,
        qrCode: `QR-${serialNumber}`,
        serialNumber,
        batchNumber: serialData.attributes?.batchNumber,
        lotNumber: serialData.attributes?.lotNumber,
        warehouseId: serialData.warehouseId,
        zoneId: serialData.binLocation?.split('-')[0],
        binLocation: serialData.binLocation,
        quantity: 1,
        reservedQuantity: 0,
        availableQuantity: 1,
        unitCost: serialData.cost,
        unitPrice: product.price || serialData.cost * 1.5,
        totalValue: serialData.cost,
        storage: {
          temperature: { min: 0, max: 40, required: false },
          humidity: { min: 0, max: 100, required: false },
          specialRequirements: [],
          hazardous: false,
          fragile: false,
          perishable: !!serialData.attributes?.expiryDate,
          expiryDate: serialData.attributes?.expiryDate,
          manufactureDate: serialData.attributes?.manufactureDate
        },
        tracking: {
          lastCountDate: new Date(),
          lastMovementDate: new Date(),
          movementHistory: [{
            date: new Date(),
            type: 'in',
            quantity: 1,
            reference: `PO-${Date.now()}`,
            reason: 'Initial receipt',
            userId: serialData.createdBy
          }],
          countHistory: []
        },
        status: 'active',
        alerts: [],
        tags: ['serial-tracked'],
        lastUpdatedBy: serialData.createdBy
      });

      await inventoryItem.save();
      serialInfos.push(serialInfo);
    }

    return serialInfos;
  }

  async trackSerialNumber(serialNumber: string): Promise<SerialNumberInfo> {
    const inventoryItem = await InventoryItem.findOne({ serialNumber });
    if (!inventoryItem) {
      throw new Error('Serial number not found');
    }

    const product = await Product.findOne({ productId: inventoryItem.productId });
    if (!product) {
      throw new Error('Product not found');
    }

    // Build serial number info from inventory item
    const history = inventoryItem.tracking.movementHistory.map(movement => ({
      date: movement.date,
      location: `${inventoryItem.warehouseId}${inventoryItem.binLocation ? '/' + inventoryItem.binLocation : ''}`,
      status: movement.type === 'in' ? 'in_stock' : movement.type === 'out' ? 'sold' : 'transferred',
      transactionId: movement.reference,
      transactionType: movement.type as any,
      userId: movement.userId,
      notes: movement.reason
    }));

    // Generate alerts based on status
    const alerts = [];
    if (inventoryItem.storage.expiryDate) {
      const daysToExpiry = Math.floor((inventoryItem.storage.expiryDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
      if (daysToExpiry <= 30) {
        alerts.push({
          type: 'warranty_expiry' as const,
          severity: daysToExpiry <= 7 ? 'critical' as const : 'high' as const,
          message: `Item expires in ${daysToExpiry} days`,
          date: new Date(),
          acknowledged: false
        });
      }
    }

    return {
      serialNumber,
      productId: inventoryItem.productId,
      sku: inventoryItem.sku,
      warehouseId: inventoryItem.warehouseId,
      binLocation: inventoryItem.binLocation,
      status: inventoryItem.status === 'active' ? 'in_stock' as const : 
             inventoryItem.status === 'damaged' ? 'damaged' as const :
             inventoryItem.status === 'expired' ? 'expired' as const : 'in_stock' as const,
      currentLocation: `${inventoryItem.warehouseId}${inventoryItem.binLocation ? '/' + inventoryItem.binLocation : ''}`,
      history,
      warranty: {
        startDate: inventoryItem.storage.manufactureDate,
        endDate: inventoryItem.storage.expiryDate
      },
      cost: {
        purchaseCost: inventoryItem.unitCost,
        currentValue: inventoryItem.totalValue,
        depreciation: 0
      },
      attributes: {
        manufacturer: 'Unknown',
        model: 'Unknown',
        manufactureDate: inventoryItem.storage.manufactureDate,
        expiryDate: inventoryItem.storage.expiryDate,
        batchNumber: inventoryItem.batchNumber,
        lotNumber: inventoryItem.lotNumber
      },
      quality: {
        inspections: [],
        defects: []
      },
      alerts,
      createdAt: inventoryItem.createdAt,
      lastUpdated: inventoryItem.updatedAt
    };
  }

  async updateSerialNumberStatus(serialNumber: string, updateData: {
    status: 'reserved' | 'sold' | 'returned' | 'damaged' | 'expired' | 'recalled';
    location?: string;
    transactionId: string;
    userId: string;
    notes?: string;
  }): Promise<void> {
    const inventoryItem = await InventoryItem.findOne({ serialNumber });
    if (!inventoryItem) {
      throw new Error('Serial number not found');
    }

    // Update inventory item status
    const newStatus = updateData.status === 'sold' ? 'active' : 
                     updateData.status === 'damaged' ? 'damaged' :
                     updateData.status === 'expired' ? 'expired' : 'active';

    await InventoryItem.updateOne(
      { serialNumber },
      {
        $set: { 
          status: newStatus,
          lastUpdatedBy: updateData.userId
        },
        $push: {
          'tracking.movementHistory': {
            date: new Date(),
            type: updateData.status === 'sold' ? 'out' : 'adjustment',
            quantity: updateData.status === 'sold' ? -1 : 0,
            reference: updateData.transactionId,
            reason: updateData.notes || `Status changed to ${updateData.status}`,
            userId: updateData.userId
          }
        }
      }
    );
  }

  // Batch Management
  async createBatch(batchData: {
    productId: string;
    batchNumber: string;
    lotNumber?: string;
    quantity: number;
    warehouseId: string;
    binLocation?: string;
    manufactureDate: Date;
    expiryDate?: Date;
    supplier: {
      supplierId: string;
      name: string;
      invoiceNumber?: string;
      purchaseOrderNumber?: string;
    };
    unitCost: number;
    quality?: {
      certificate?: string;
      inspectionDate?: Date;
      testResults?: Array<{
        test: string;
        result: string;
        standard: string;
        date: Date;
      }>;
    };
    createdBy: string;
  }): Promise<BatchInfo> {
    const product = await Product.findOne({ productId: batchData.productId });
    if (!product) {
      throw new Error('Product not found');
    }

    // Check if batch already exists
    const existingBatch = await InventoryItem.findOne({ 
      productId: batchData.productId,
      batchNumber: batchData.batchNumber,
      warehouseId: batchData.warehouseId
    });
    if (existingBatch) {
      throw new Error('Batch already exists in this warehouse');
    }

    // Create inventory item for batch
    const inventoryItem = new InventoryItem({
      itemId: `BATCH-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      productId: batchData.productId,
      sku: product.sku,
      barcode: `BATCH-${batchData.batchNumber}`,
      qrCode: `QR-BATCH-${batchData.batchNumber}`,
      batchNumber: batchData.batchNumber,
      lotNumber: batchData.lotNumber,
      warehouseId: batchData.warehouseId,
      zoneId: batchData.binLocation?.split('-')[0],
      binLocation: batchData.binLocation,
      quantity: batchData.quantity,
      reservedQuantity: 0,
      availableQuantity: batchData.quantity,
      unitCost: batchData.unitCost,
      unitPrice: product.price || batchData.unitCost * 1.5,
      totalValue: batchData.quantity * batchData.unitCost,
      supplier: {
        supplierId: batchData.supplier.supplierId,
        name: batchData.supplier.name,
        leadTime: 7,
        lastOrderDate: new Date()
      },
      storage: {
        temperature: { min: 0, max: 40, required: false },
        humidity: { min: 0, max: 100, required: false },
        specialRequirements: [],
        hazardous: false,
        fragile: false,
        perishable: !!batchData.expiryDate,
        expiryDate: batchData.expiryDate,
        manufactureDate: batchData.manufactureDate
      },
      tracking: {
        lastCountDate: new Date(),
        lastMovementDate: new Date(),
        movementHistory: [{
          date: new Date(),
          type: 'in',
          quantity: batchData.quantity,
          reference: batchData.supplier.purchaseOrderNumber || `PO-${Date.now()}`,
          reason: 'Batch receipt',
          userId: batchData.createdBy
        }],
        countHistory: []
      },
      status: 'active',
      alerts: [],
      tags: ['batch-tracked'],
      lastUpdatedBy: batchData.createdBy
    });

    await inventoryItem.save();

    // Create batch info
    const batchInfo: BatchInfo = {
      batchNumber: batchData.batchNumber,
      productId: batchData.productId,
      sku: product.sku,
      lotNumber: batchData.lotNumber,
      warehouseId: batchData.warehouseId,
      quantity: batchData.quantity,
      availableQuantity: batchData.quantity,
      reservedQuantity: 0,
      manufactureDate: batchData.manufactureDate,
      expiryDate: batchData.expiryDate,
      status: 'active',
      supplier: {
        ...batchData.supplier,
        receivedDate: new Date()
      },
      quality: {
        certificate: batchData.quality?.certificate,
        inspectionDate: batchData.quality?.inspectionDate,
        testResults: batchData.quality?.testResults,
        issues: []
      },
      costs: {
        unitCost: batchData.unitCost,
        totalCost: batchData.quantity * batchData.unitCost,
        landingCost: batchData.quantity * batchData.unitCost,
        additionalCosts: []
      },
      locations: [{
        warehouseId: batchData.warehouseId,
        binLocation: batchData.binLocation,
        quantity: batchData.quantity,
        lastUpdated: new Date()
      }],
      movements: [{
        date: new Date(),
        fromLocation: 'Supplier',
        toLocation: `${batchData.warehouseId}${batchData.binLocation ? '/' + batchData.binLocation : ''}`,
        quantity: batchData.quantity,
        transactionId: batchData.supplier.purchaseOrderNumber || `PO-${Date.now()}`,
        transactionType: 'receipt',
        userId: batchData.createdBy,
        reason: 'Initial receipt'
      }],
      recalls: [],
      alerts: [],
      createdAt: new Date(),
      lastUpdated: new Date()
    };

    return batchInfo;
  }

  async trackBatch(batchNumber: string, productId?: string): Promise<BatchInfo> {
    const query: any = { batchNumber };
    if (productId) {
      query.productId = productId;
    }

    const inventoryItems = await InventoryItem.find(query);
    if (inventoryItems.length === 0) {
      throw new Error('Batch not found');
    }

    const primaryItem = inventoryItems[0];
    const product = await Product.findOne({ productId: primaryItem.productId });

    const totalQuantity = inventoryItems.reduce((sum, item) => sum + item.quantity, 0);
    const availableQuantity = inventoryItems.reduce((sum, item) => sum + item.availableQuantity, 0);
    const reservedQuantity = inventoryItems.reduce((sum, item) => sum + item.reservedQuantity, 0);

    // Determine batch status
    let status: 'active' | 'expiring' | 'expired' | 'recalled' | 'quarantined' = 'active';
    if (primaryItem.storage.expiryDate) {
      const daysToExpiry = Math.floor((primaryItem.storage.expiryDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
      if (daysToExpiry < 0) status = 'expired';
      else if (daysToExpiry <= 30) status = 'expiring';
    }

    // Generate alerts
    const alerts = [];
    if (primaryItem.storage.expiryDate) {
      const daysToExpiry = Math.floor((primaryItem.storage.expiryDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
      if (daysToExpiry <= 30) {
        alerts.push({
          type: 'expiry_warning' as const,
          severity: daysToExpiry <= 7 ? 'critical' as const : 'high' as const,
          message: `Batch expires in ${daysToExpiry} days`,
          date: new Date(),
          acknowledged: false
        });
      }
    }

    return {
      batchNumber: primaryItem.batchNumber!,
      productId: primaryItem.productId,
      sku: primaryItem.sku,
      lotNumber: primaryItem.lotNumber,
      warehouseId: primaryItem.warehouseId,
      quantity: totalQuantity,
      availableQuantity,
      reservedQuantity,
      manufactureDate: primaryItem.storage.manufactureDate!,
      expiryDate: primaryItem.storage.expiryDate,
      status,
      supplier: primaryItem.supplier,
      quality: {
        certificate: undefined,
        inspectionDate: undefined,
        testResults: [],
        issues: []
      },
      costs: {
        unitCost: primaryItem.unitCost,
        totalCost: totalQuantity * primaryItem.unitCost,
        landingCost: totalQuantity * primaryItem.unitCost,
        additionalCosts: []
      },
      locations: inventoryItems.map(item => ({
        warehouseId: item.warehouseId,
        binLocation: item.binLocation,
        quantity: item.quantity,
        lastUpdated: item.updatedAt
      })),
      movements: primaryItem.tracking.movementHistory.map(movement => ({
        date: movement.date,
        fromLocation: movement.type === 'in' ? 'Supplier' : primaryItem.warehouseId,
        toLocation: movement.type === 'in' ? primaryItem.warehouseId : 'Customer',
        quantity: movement.quantity,
        transactionId: movement.reference,
        transactionType: movement.type,
        userId: movement.userId,
        reason: movement.reason
      })),
      recalls: [],
      alerts,
      createdAt: primaryItem.createdAt,
      lastUpdated: primaryItem.updatedAt
    };
  }

  // Traceability
  async generateTraceabilityReport(params: {
    type: 'serial' | 'batch' | 'lot';
    identifier: string;
    productId?: string;
    includeDocuments?: boolean;
    requestedBy: string;
  }): Promise<TraceabilityReport> {
    let inventoryItems: IInventoryItem[];
    
    if (params.type === 'serial') {
      const item = await InventoryItem.findOne({ serialNumber: params.identifier });
      if (!item) {
        throw new Error('Serial number not found');
      }
      inventoryItems = [item];
    } else if (params.type === 'batch') {
      const query: any = { batchNumber: params.identifier };
      if (params.productId) {
        query.productId = params.productId;
      }
      inventoryItems = await InventoryItem.find(query);
      if (inventoryItems.length === 0) {
        throw new Error('Batch not found');
      }
    } else {
      const query: any = { lotNumber: params.identifier };
      if (params.productId) {
        query.productId = params.productId;
      }
      inventoryItems = await InventoryItem.find(query);
      if (inventoryItems.length === 0) {
        throw new Error('Lot number not found');
      }
    }

    const primaryItem = inventoryItems[0];
    const product = await Product.findOne({ productId: primaryItem.productId });

    // Build journey from movement history
    const journey = primaryItem.tracking.movementHistory.map(movement => ({
      date: movement.date,
      location: movement.type === 'in' ? 'Supplier' : 
               movement.type === 'out' ? 'Customer' : 
               primaryItem.warehouseId,
      event: movement.reason,
      quantity: movement.quantity,
      status: movement.type,
      userId: movement.userId,
      documents: params.includeDocuments ? [] : undefined
    }));

    const totalQuantity = inventoryItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalCost = inventoryItems.reduce((sum, item) => sum + item.totalValue, 0);

    return {
      reportType: params.type,
      identifier: params.identifier,
      product: {
        productId: primaryItem.productId,
        name: product?.name || 'Unknown',
        sku: primaryItem.sku,
        category: product?.category || 'Unknown'
      },
      journey,
      currentStatus: {
        location: primaryItem.warehouseId,
        quantity: totalQuantity,
        status: primaryItem.status,
        lastUpdated: primaryItem.updatedAt
      },
      quality: {
        inspections: 0,
        passes: 0,
        failures: 0,
        issues: []
      },
      costs: {
        totalCost,
        currentUnitCost: primaryItem.unitCost,
        landedCost: totalCost,
        additionalCosts: 0
      },
      compliance: {
        certifications: [],
        standards: [],
        requirements: []
      },
      alerts: primaryItem.alerts.map(alert => ({
        type: alert.type,
        severity: alert.severity,
        message: alert.message,
        date: alert.date,
        actionRequired: !alert.acknowledged
      })),
      generatedAt: new Date(),
      generatedBy: params.requestedBy
    };
  }

  // Recall Management
  async initiateRecall(recallData: {
    type: 'voluntary' | 'mandatory' | 'preventive';
    severity: 'low' | 'medium' | 'high' | 'critical';
    scope: {
      productIds: string[];
      serialNumbers?: string[];
      batchNumbers?: string[];
      lotNumbers?: string[];
      dateRange?: {
        from: Date;
        to: Date;
      };
      warehouses?: string[];
    };
    reason: string;
    description: string;
    riskAssessment: string;
    estimatedCost: number;
    initiatedBy: string;
  }): Promise<RecallManagement> {
    const recallId = `REC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Find affected items
    const affectedItems = await this.findAffectedItems(recallData.scope);

    const recall: RecallManagement = {
      recallId,
      type: recallData.type,
      severity: recallData.severity,
      status: 'planned',
      scope: recallData.scope,
      details: {
        reason: recallData.reason,
        description: recallData.description,
        riskAssessment: recallData.riskAssessment,
        affectedQuantity: affectedItems.reduce((sum, item) => sum + item.quantity, 0),
        distributedQuantity: affectedItems.reduce((sum, item) => sum + item.quantity, 0), // Simplified
        recoveredQuantity: 0,
        disposalQuantity: 0
      },
      timeline: {
        initiatedDate: new Date(),
        announcedDate: new Date(),
        effectiveDate: new Date()
      },
      communications: [],
      actions: [{
        action: 'Identify affected items',
        description: 'Locate and quarantine all affected inventory',
        assignedTo: recallData.initiatedBy,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        status: 'in_progress'
      }],
      financial: {
        estimatedCost: recallData.estimatedCost,
        actualCost: 0,
        recoveredValue: 0,
        reserveAmount: recallData.estimatedCost
      },
      documentation: {
        report: `Recall Report ${recallId}`,
        evidence: [],
        approvals: []
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: recallData.initiatedBy
    };

    // Update status of affected items
    for (const item of affectedItems) {
      await InventoryItem.updateOne(
        { itemId: item.itemId },
        { 
          $set: { status: 'on_hold' },
          $push: { 
            alerts: {
              type: 'recall',
              severity: recallData.severity,
              message: `Item affected by recall ${recallId}: ${recallData.reason}`,
              date: new Date(),
              acknowledged: false
            }
          }
        }
      );
    }

    return recall;
  }

  private async findAffectedItems(scope: any): Promise<IInventoryItem[]> {
    const query: any = {};

    if (scope.productIds?.length > 0) {
      query.productId = { $in: scope.productIds };
    }

    if (scope.serialNumbers?.length > 0) {
      query.serialNumber = { $in: scope.serialNumbers };
    }

    if (scope.batchNumbers?.length > 0) {
      query.batchNumber = { $in: scope.batchNumbers };
    }

    if (scope.lotNumbers?.length > 0) {
      query.lotNumber = { $in: scope.lotNumbers };
    }

    if (scope.warehouses?.length > 0) {
      query.warehouseId = { $in: scope.warehouses };
    }

    if (scope.dateRange) {
      query['tracking.movementHistory.date'] = {
        $gte: scope.dateRange.from,
        $lte: scope.dateRange.to
      };
    }

    return await InventoryItem.find(query);
  }

  // Quality Control
  async recordQualityInspection(params: {
    type: 'serial' | 'batch';
    identifier: string;
    inspection: {
      date: Date;
      result: 'pass' | 'fail' | 'conditional';
      inspector: string;
      notes?: string;
      nextInspection?: Date;
      tests?: Array<{
        test: string;
        result: string;
        standard: string;
      }>;
    };
  }): Promise<void> {
    const query = params.type === 'serial' 
      ? { serialNumber: params.identifier }
      : { batchNumber: params.identifier };

    const inventoryItem = await InventoryItem.findOne(query);
    if (!inventoryItem) {
      throw new Error(`${params.type} not found`);
    }

    // Update inventory item with inspection result
    if (params.inspection.result === 'fail') {
      await InventoryItem.updateOne(
        query,
        { 
          $set: { status: 'damaged' },
          $push: { 
            alerts: {
              type: 'quality_issue',
              severity: 'high',
              message: `Item failed quality inspection on ${params.inspection.date.toISOString()}`,
              date: new Date(),
              acknowledged: false
            }
          }
        }
      );
    }
  }

  // Reporting
  async getSerialBatchAnalytics(params: {
    warehouseId?: string;
    productId?: string;
    dateRange?: {
      from: Date;
      to: Date;
    };
    groupBy?: 'status' | 'warehouse' | 'product' | 'supplier';
  }) {
    const matchQuery: any = {};

    if (params.warehouseId) {
      matchQuery.warehouseId = params.warehouseId;
    }

    if (params.productId) {
      matchQuery.productId = params.productId;
    }

    if (params.dateRange) {
      matchQuery.createdAt = {
        $gte: params.dateRange.from,
        $lte: params.dateRange.to
      };
    }

    const groupBy = params.groupBy || 'status';

    const analytics = await InventoryItem.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: `$${groupBy}`,
          totalItems: { $sum: '$quantity' },
          totalValue: { $sum: '$totalValue' },
          averageCost: { $avg: '$unitCost' },
          itemCount: { $sum: 1 }
        }
      },
      { $sort: { totalValue: -1 } }
    ]);

    return analytics;
  }
}
