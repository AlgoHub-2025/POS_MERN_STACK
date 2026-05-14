import { Order, IOrder } from '../../models/Order';
import { Customer } from '../../models/Customer';

export interface ShippingRequest {
  orderId: string;
  shipper: {
    carrier: 'ups' | 'fedex' | 'dhl' | 'usps' | 'canada_post' | 'custom';
    service: string;
    accountNumber?: string;
    apiKey?: string;
    apiSecret?: string;
    environment?: 'test' | 'production';
  };
  shipment: {
    origin: {
      company?: string;
      name: string;
      phone: string;
      email?: string;
      address: {
        street1: string;
        street2?: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        residential?: boolean;
      };
    };
    destination: {
      company?: string;
      name: string;
      phone: string;
      email?: string;
      address: {
        street1: string;
        street2?: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        residential?: boolean;
      };
    };
    packages: Array<{
      packageId: string;
      weight: {
        value: number;
        unit: 'lb' | 'kg' | 'oz' | 'g';
      };
      dimensions: {
        length: number;
        width: number;
        height: number;
        unit: 'in' | 'cm';
      };
      description?: string;
      value?: number;
      insuranceAmount?: number;
      signatureRequired?: boolean;
      dangerousGoods?: boolean;
      specialHandling?: string[];
    }>;
    options: {
      saturdayDelivery?: boolean;
      sundayDelivery?: boolean;
      holidayDelivery?: boolean;
      residentialDelivery?: boolean;
      deliveryConfirmation?: 'none' | 'signature' | 'adult_signature';
      insurance?: boolean;
      trackingRequired?: boolean;
      carbonNeutral?: boolean;
      holdForPickup?: boolean;
    };
    customs?: {
      purpose: 'gift' | 'sample' | 'repair' | 'return' | 'sale' | 'personal_effects';
      termsOfTrade: string; // Incoterms
      duties: {
        payer: 'sender' | 'recipient' | 'third_party';
        accountNumber?: string;
      };
      items: Array<{
        description: string;
        quantity: number;
        value: number;
        weight: number;
        countryOfOrigin: string;
        hsCode?: string;
      }>;
    };
  };
  preferences: {
    cheapest?: boolean;
    fastest?: boolean;
    reliable?: boolean;
    carbonNeutral?: boolean;
    preferredCarriers?: string[];
    excludedCarriers?: string[];
    maxCost?: number;
    maxTransitTime?: number; // days
  };
  metadata?: {
    employeeId?: string;
    locationId?: string;
    notes?: string;
    reference?: string;
  };
}

export interface ShippingRate {
  carrier: string;
  service: string;
  serviceCode: string;
  rate: number;
  currency: string;
  transitTime: {
    min: number; // days
      max: number; // days
      guaranteed?: boolean;
    };
  deliveryDate: {
    earliest: Date;
      latest: Date;
    };
  packaging: {
    type: string;
    cost: number;
  };
  fees: {
    fuel: number;
    residential: number;
    saturday: number;
    signature: number;
    insurance: number;
    customs: number;
    total: number;
  };
  discounts: Array<{
    type: string;
    amount: number;
    description: string;
  }>;
  restrictions: {
    maxWeight?: number;
    maxDimensions?: { length: number; width: number; height: number; };
    prohibitedItems?: string[];
    serviceAreas?: string[];
  };
  features: {
    tracking: boolean;
    insurance: boolean;
    signature: boolean;
    saturdayDelivery: boolean;
    carbonNeutral: boolean;
    realTimeUpdates: boolean;
  };
  estimate: {
    confidence: number; // 0-1
    basedOn: 'historical' | 'real_time' | 'predicted';
    lastUpdated: Date;
  };
}

export interface ShippingLabel {
  labelId: string;
  trackingNumber: string;
  carrier: string;
  service: string;
  format: 'pdf' | 'png' | 'zpl' | 'epl';
  data: string; // Base64 encoded label data
  size: {
    width: number;
    height: number;
    unit: 'in' | 'cm';
  };
  cost: number;
  currency: string;
  tracking: {
    url: string;
    qrCode?: string;
    barcode?: string;
  };
  package: {
    packageId: string;
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
  };
  createdAt: Date;
  expiresAt?: Date;
}

export interface Shipment {
  shipmentId: string;
  orderId: string;
  carrier: string;
  service: string;
  trackingNumbers: string[];
  status: 'created' | 'label_generated' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception' | 'cancelled';
  labels: ShippingLabel[];
  packages: Array<{
    packageId: string;
    trackingNumber: string;
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    description?: string;
  }>;
  origin: any;
  destination: any;
  rates: {
    baseRate: number;
    totalCost: number;
    currency: string;
    breakdown: any;
  };
  tracking: {
    lastUpdate: Date;
    currentLocation?: string;
    estimatedDelivery?: Date;
    events: Array<{
      timestamp: Date;
      status: string;
      location: string;
      description: string;
    }>;
  };
  documents: {
    commercialInvoice?: string;
    packingList?: string;
    customsForms?: string[];
    certificateOfOrigin?: string;
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    notes?: string;
    reference?: string;
  };
}

export interface TrackingUpdate {
  trackingNumber: string;
  carrier: string;
  status: string;
  location: {
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  timestamp: Date;
  description: string;
  estimatedDelivery?: Date;
  exceptions?: Array<{
    code: string;
    description: string;
    actionRequired: boolean;
  }>;
  metadata: {
    source: string;
    confidence: number;
  };
}

export interface ShippingAnalytics {
  summary: {
    totalShipments: number;
    totalPackages: number;
    totalWeight: number;
    totalCost: number;
    averageCost: number;
    averageTransitTime: number;
    onTimeDeliveryRate: number;
  };
  byCarrier: Record<string, {
    shipments: number;
    packages: number;
    cost: number;
    averageCost: number;
    averageTransitTime: number;
    onTimeRate: number;
    errorRate: number;
  }>;
  byService: Record<string, {
    shipments: number;
    cost: number;
    averageTransitTime: number;
    onTimeRate: number;
  }>;
  byLocation: Array<{
    origin: string;
    destination: string;
    shipments: number;
    cost: number;
    averageTransitTime: number;
  }>;
  performance: {
    deliveryTimes: Array<{
      period: string;
      average: number;
      target: number;
      achievement: number;
    }>;
    costPerMile: Array<{
      period: string;
      cost: number;
      trend: 'up' | 'down' | 'stable';
    }>;
    serviceLevels: Array<{
      carrier: string;
      service: string;
      onTimeRate: number;
      customerSatisfaction: number;
    }>;
  };
  issues: Array<{
    type: 'delay' | 'damage' | 'loss' | 'exception';
    count: number;
    percentage: number;
    impact: string;
    carrier?: string;
  }>;
  recommendations: Array<{
    type: 'cost' | 'service' | 'process' | 'carrier';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    expectedSavings?: number;
    implementation: string;
  }>;
}

export class ShippingIntegrationService {
  private carriers: Map<string, any> = new Map();
  private shipments: Map<string, Shipment> = new Map();

  constructor() {
    this.initializeCarriers();
  }

  // Get shipping rates
  async getShippingRates(request: ShippingRequest): Promise<ShippingRate[]> {
    try {
      // Validate shipment data
      await this.validateShipmentRequest(request);

      // Get rates from all available carriers
      const allRates: ShippingRate[] = [];

      for (const [carrierName, carrier] of this.carriers) {
        // Skip excluded carriers
        if (request.preferences.excludedCarriers?.includes(carrierName)) {
          continue;
        }

        try {
          const rates = await this.getCarrierRates(carrier, request);
          allRates.push(...rates);
        } catch (error) {
          console.warn(`Failed to get rates from ${carrierName}:`, error.message);
        }
      }

      // Apply preferences and filters
      const filteredRates = this.applyRateFilters(allRates, request.preferences);

      // Sort by preference
      const sortedRates = this.sortRates(filteredRates, request.preferences);

      return sortedRates;

    } catch (error) {
      throw new Error(`Failed to get shipping rates: ${error.message}`);
    }
  }

  // Create shipment
  async createShipment(request: ShippingRequest, selectedRate: ShippingRate): Promise<Shipment> {
    try {
      // Validate request and rate
      await this.validateShipmentRequest(request);
      await this.validateSelectedRate(selectedRate, request);

      // Create shipment record
      const shipment: Shipment = {
        shipmentId: this.generateShipmentId(),
        orderId: request.orderId,
        carrier: selectedRate.carrier,
        service: selectedRate.service,
        trackingNumbers: [],
        status: 'created',
        labels: [],
        packages: request.shipment.packages.map(pkg => ({
          packageId: pkg.packageId,
          trackingNumber: '', // Will be generated by carrier
          weight: pkg.weight.value,
          dimensions: pkg.dimensions,
          description: pkg.description
        })),
        origin: request.shipment.origin,
        destination: request.shipment.destination,
        rates: {
          baseRate: selectedRate.rate,
          totalCost: selectedRate.rate + selectedRate.fees.total,
          currency: selectedRate.currency,
          breakdown: selectedRate
        },
        tracking: {
          lastUpdate: new Date(),
          events: []
        },
        documents: {},
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: request.metadata?.employeeId || 'system',
          notes: request.metadata?.notes,
          reference: request.metadata?.reference
        }
      };

      // Get carrier integration
      const carrier = this.carriers.get(selectedRate.carrier);
      if (!carrier) {
        throw new Error(`Carrier ${selectedRate.carrier} not found`);
      }

      // Create shipment with carrier
      const carrierShipment = await this.createCarrierShipment(carrier, request, selectedRate);

      // Update shipment with carrier data
      shipment.trackingNumbers = carrierShipment.trackingNumbers;
      shipment.packages = shipment.packages.map((pkg, index) => ({
        ...pkg,
        trackingNumber: carrierShipment.trackingNumbers[index] || ''
      }));

      // Generate shipping labels
      shipment.labels = await this.generateShippingLabels(carrier, carrierShipment, request);

      // Generate customs documents if international
      if (request.shipment.customs) {
        shipment.documents = await this.generateCustomsDocuments(carrier, carrierShipment, request);
      }

      // Update status
      shipment.status = 'label_generated';

      // Save shipment
      this.shipments.set(shipment.shipmentId, shipment);

      // Update order with shipment information
      await this.updateOrderShipment(request.orderId, shipment);

      return shipment;

    } catch (error) {
      throw new Error(`Failed to create shipment: ${error.message}`);
    }
  }

  // Cancel shipment
  async cancelShipment(shipmentId: string, reason?: string): Promise<void> {
    const shipment = this.shipments.get(shipmentId);
    if (!shipment) {
      throw new Error('Shipment not found');
    }

    // Check if shipment can be cancelled
    if (['picked_up', 'in_transit', 'out_for_delivery', 'delivered'].includes(shipment.status)) {
      throw new Error(`Cannot cancel shipment in status: ${shipment.status}`);
    }

    try {
      // Cancel with carrier
      const carrier = this.carriers.get(shipment.carrier);
      if (carrier) {
        await this.cancelCarrierShipment(carrier, shipment);
      }

      // Update shipment status
      shipment.status = 'cancelled';
      shipment.metadata.updatedAt = new Date();
      if (reason) {
        shipment.metadata.notes = (shipment.metadata.notes || '') + ` Cancelled: ${reason}`;
      }

      // Update order
      await this.updateOrderShipmentCancellation(shipment.orderId, shipment);

    } catch (error) {
      throw new Error(`Failed to cancel shipment: ${error.message}`);
    }
  }

  // Track shipment
  async trackShipment(shipmentId: string): Promise<TrackingUpdate[]> {
    const shipment = this.shipments.get(shipmentId);
    if (!shipment) {
      throw new Error('Shipment not found');
    }

    try {
      // Get tracking updates from carrier
      const carrier = this.carriers.get(shipment.carrier);
      if (!carrier) {
        throw new Error(`Carrier ${shipment.carrier} not found`);
      }

      const updates = await this.getTrackingUpdates(carrier, shipment.trackingNumbers);

      // Update shipment tracking
      if (updates.length > 0) {
        shipment.tracking.lastUpdate = new Date();
        shipment.tracking.events = updates.map(update => ({
          timestamp: update.timestamp,
          status: update.status,
          location: `${update.location.city}, ${update.location.state}`,
          description: update.description
        }));

        // Update shipment status based on latest tracking
        const latestUpdate = updates[updates.length - 1];
        shipment.status = this.mapTrackingStatusToShipmentStatus(latestUpdate.status);

        // Update order status
        await this.updateOrderTracking(shipment.orderId, shipment, latestUpdate);
      }

      return updates;

    } catch (error) {
      throw new Error(`Failed to track shipment: ${error.message}`);
    }
  }

  // Get shipping analytics
  async getShippingAnalytics(startDate: Date, endDate: Date): Promise<ShippingAnalytics> {
    // Get shipments within date range
    const shipments = await this.getShipmentsByDateRange(startDate, endDate);

    // Calculate summary
    const summary = this.calculateShippingSummary(shipments);

    // Analyze by carrier
    const byCarrier = this.analyzeByCarrier(shipments);

    // Analyze by service
    const byService = this.analyzeByService(shipments);

    // Analyze by location
    const byLocation = this.analyzeByLocation(shipments);

    // Calculate performance metrics
    const performance = await this.calculateShippingPerformance(shipments, startDate, endDate);

    // Identify issues
    const issues = await this.identifyShippingIssues(shipments);

    // Generate recommendations
    const recommendations = await this.generateShippingRecommendations(shipments, summary, issues);

    return {
      summary,
      byCarrier,
      byService,
      byLocation,
      performance,
      issues,
      recommendations
    };
  }

  // Validate shipment request
  private async validateShipmentRequest(request: ShippingRequest): Promise<void> {
    // Validate addresses
    if (!request.shipment.origin.address || !request.shipment.destination.address) {
      throw new Error('Origin and destination addresses are required');
    }

    // Validate packages
    if (!request.shipment.packages || request.shipment.packages.length === 0) {
      throw new Error('At least one package is required');
    }

    for (const pkg of request.shipment.packages) {
      if (!pkg.weight || pkg.weight.value <= 0) {
        throw new Error(`Package ${pkg.packageId} must have a valid weight`);
      }
      if (!pkg.dimensions || pkg.dimensions.length <= 0 || pkg.dimensions.width <= 0 || pkg.dimensions.height <= 0) {
        throw new Error(`Package ${pkg.packageId} must have valid dimensions`);
      }
    }

    // Validate international shipment requirements
    if (request.shipment.origin.address.country !== request.shipment.destination.address.country) {
      if (!request.shipment.customs) {
        throw new Error('Customs information is required for international shipments');
      }
    }
  }

  // Get rates from specific carrier
  private async getCarrierRates(carrier: any, request: ShippingRequest): Promise<ShippingRate[]> {
    switch (carrier.name) {
      case 'ups':
        return await this.getUPSRates(request);
      case 'fedex':
        return await this.getFedExRates(request);
      case 'dhl':
        return await this.getDHLRates(request);
      case 'usps':
        return await this.getUSPSRates(request);
      default:
        return await this.getCustomCarrierRates(carrier, request);
    }
  }

  // UPS rates
  private async getUPSRates(request: ShippingRequest): Promise<ShippingRate[]> {
    // Mock UPS API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const services = [
      { code: '01', name: 'UPS Next Day Air', transitTime: { min: 1, max: 1 }, rate: 45.99 },
      { code: '02', name: 'UPS 2nd Day Air', transitTime: { min: 2, max: 2 }, rate: 28.99 },
      { code: '03', name: 'UPS Ground', transitTime: { min: 3, max: 5 }, rate: 12.99 },
      { code: '12', name: 'UPS 3 Day Select', transitTime: { min: 3, max: 3 }, rate: 18.99 }
    ];

    return services.map(service => ({
      carrier: 'ups',
      service: service.name,
      serviceCode: service.code,
      rate: service.rate,
      currency: 'USD',
      transitTime: service.transitTime,
      deliveryDate: {
        earliest: new Date(Date.now() + service.transitTime.min * 24 * 60 * 60 * 1000),
        latest: new Date(Date.now() + service.transitTime.max * 24 * 60 * 60 * 1000)
      },
      packaging: {
        type: 'customer_supplied',
        cost: 0
      },
      fees: {
        fuel: service.rate * 0.15,
        residential: request.shipment.destination.address.residential ? 3.50 : 0,
        saturday: 0,
        signature: request.shipment.options.deliveryConfirmation === 'signature' ? 2.75 : 0,
        insurance: 0,
        customs: 0,
        total: service.rate * 0.15 + (request.shipment.destination.address.residential ? 3.50 : 0) + (request.shipment.options.deliveryConfirmation === 'signature' ? 2.75 : 0)
      },
      discounts: [],
      restrictions: {
        maxWeight: 150,
        maxDimensions: { length: 108, width: 165, height: 165 }
      },
      features: {
        tracking: true,
        insurance: true,
        signature: true,
        saturdayDelivery: false,
        carbonNeutral: true,
        realTimeUpdates: true
      },
      estimate: {
        confidence: 0.95,
        basedOn: 'real_time' as const,
        lastUpdated: new Date()
      }
    }));
  }

  // FedEx rates
  private async getFedExRates(request: ShippingRequest): Promise<ShippingRate[]> {
    // Mock FedEx API call
    await new Promise(resolve => setTimeout(resolve, 1200));

    const services = [
      { code: 'PRIORITY_OVERNIGHT', name: 'FedEx Priority Overnight', transitTime: { min: 1, max: 1 }, rate: 52.99 },
      { code: 'FEDEX_2_DAY', name: 'FedEx 2Day', transitTime: { min: 2, max: 2 }, rate: 32.99 },
      { code: 'GROUND_HOME_DELIVERY', name: 'FedEx Ground Home Delivery', transitTime: { min: 3, max: 5 }, rate: 11.99 },
      { code: 'FEDEX_EXPRESS_SAVER', name: 'FedEx Express Saver', transitTime: { min: 3, max: 4 }, rate: 22.99 }
    ];

    return services.map(service => ({
      carrier: 'fedex',
      service: service.name,
      serviceCode: service.code,
      rate: service.rate,
      currency: 'USD',
      transitTime: service.transitTime,
      deliveryDate: {
        earliest: new Date(Date.now() + service.transitTime.min * 24 * 60 * 60 * 1000),
        latest: new Date(Date.now() + service.transitTime.max * 24 * 60 * 60 * 1000)
      },
      packaging: {
        type: 'customer_supplied',
        cost: 0
      },
      fees: {
        fuel: service.rate * 0.18,
        residential: request.shipment.destination.address.residential ? 4.25 : 0,
        saturday: 0,
        signature: request.shipment.options.deliveryConfirmation === 'signature' ? 3.15 : 0,
        insurance: 0,
        customs: 0,
        total: service.rate * 0.18 + (request.shipment.destination.address.residential ? 4.25 : 0) + (request.shipment.options.deliveryConfirmation === 'signature' ? 3.15 : 0)
      },
      discounts: [],
      restrictions: {
        maxWeight: 150,
        maxDimensions: { length: 119, width: 119, height: 119 }
      },
      features: {
        tracking: true,
        insurance: true,
        signature: true,
        saturdayDelivery: false,
        carbonNeutral: true,
        realTimeUpdates: true
      },
      estimate: {
        confidence: 0.92,
        basedOn: 'real_time' as const,
        lastUpdated: new Date()
      }
    }));
  }

  // DHL rates
  private async getDHLRates(request: ShippingRequest): Promise<ShippingRate[]> {
    // Mock DHL API call
    await new Promise(resolve => setTimeout(resolve, 1100));

    const services = [
      { code: 'EXPRESS_WORLDWIDE', name: 'DHL Express Worldwide', transitTime: { min: 1, max: 3 }, rate: 65.99 },
      { code: 'EUROPACKET', name: 'DHL Europacket', transitTime: { min: 4, max: 8 }, rate: 25.99 },
      { code: 'DOMESTIC_EXPRESS', name: 'DHL Domestic Express', transitTime: { min: 2, max: 3 }, rate: 18.99 }
    ];

    return services.map(service => ({
      carrier: 'dhl',
      service: service.name,
      serviceCode: service.code,
      rate: service.rate,
      currency: 'USD',
      transitTime: service.transitTime,
      deliveryDate: {
        earliest: new Date(Date.now() + service.transitTime.min * 24 * 60 * 60 * 1000),
        latest: new Date(Date.now() + service.transitTime.max * 24 * 60 * 60 * 1000)
      },
      packaging: {
        type: 'customer_supplied',
        cost: 0
      },
      fees: {
        fuel: service.rate * 0.20,
        residential: 0,
        saturday: 0,
        signature: request.shipment.options.deliveryConfirmation === 'signature' ? 2.50 : 0,
        insurance: 0,
        customs: request.shipment.customs ? 15.00 : 0,
        total: service.rate * 0.20 + (request.shipment.options.deliveryConfirmation === 'signature' ? 2.50 : 0) + (request.shipment.customs ? 15.00 : 0)
      },
      discounts: [],
      restrictions: {
        maxWeight: 154,
        maxDimensions: { length: 120, width: 120, height: 120 }
      },
      features: {
        tracking: true,
        insurance: true,
        signature: true,
        saturdayDelivery: false,
        carbonNeutral: true,
        realTimeUpdates: true
      },
      estimate: {
        confidence: 0.88,
        basedOn: 'historical' as const,
        lastUpdated: new Date()
      }
    }));
  }

  // USPS rates
  private async getUSPSRates(request: ShippingRequest): Promise<ShippingRate[]> {
    // Mock USPS API call
    await new Promise(resolve => setTimeout(resolve, 800));

    const services = [
      { code: 'PRIORITY', name: 'USPS Priority Mail', transitTime: { min: 2, max: 3 }, rate: 8.99 },
      { code: 'FIRST_CLASS', name: 'USPS First-Class Package', transitTime: { min: 3, max: 5 }, rate: 5.99 },
      { code: 'GROUND_ADVANTAGE', name: 'USPS Ground Advantage', transitTime: { min: 4, max: 7 }, rate: 7.99 }
    ];

    return services.map(service => ({
      carrier: 'usps',
      service: service.name,
      serviceCode: service.code,
      rate: service.rate,
      currency: 'USD',
      transitTime: service.transitTime,
      deliveryDate: {
        earliest: new Date(Date.now() + service.transitTime.min * 24 * 60 * 60 * 1000),
        latest: new Date(Date.now() + service.transitTime.max * 24 * 60 * 60 * 1000)
      },
      packaging: {
        type: 'customer_supplied',
        cost: 0
      },
      fees: {
        fuel: 0,
        residential: 0,
        saturday: 0,
        signature: request.shipment.options.deliveryConfirmation === 'signature' ? 2.90 : 0,
        insurance: 0,
        customs: 0,
        total: request.shipment.options.deliveryConfirmation === 'signature' ? 2.90 : 0
      },
      discounts: [],
      restrictions: {
        maxWeight: 70,
        maxDimensions: { length: 108, width: 108, height: 108 }
      },
      features: {
        tracking: true,
        insurance: true,
        signature: true,
        saturdayDelivery: true,
        carbonNeutral: false,
        realTimeUpdates: true
      },
      estimate: {
        confidence: 0.85,
        basedOn: 'historical' as const,
        lastUpdated: new Date()
      }
    }));
  }

  // Custom carrier rates
  private async getCustomCarrierRates(carrier: any, request: ShippingRequest): Promise<ShippingRate[]> {
    // Mock implementation for custom carriers
    return [];
  }

  // Apply rate filters
  private applyRateFilters(rates: ShippingRate[], preferences: any): ShippingRate[] {
    let filtered = [...rates];

    if (preferences.maxCost) {
      filtered = filtered.filter(rate => rate.rate <= preferences.maxCost);
    }

    if (preferences.maxTransitTime) {
      filtered = filtered.filter(rate => rate.transitTime.max <= preferences.maxTransitTime);
    }

    if (preferences.preferredCarriers?.length > 0) {
      const preferred = filtered.filter(rate => preferences.preferredCarriers.includes(rate.carrier));
      const others = filtered.filter(rate => !preferences.preferredCarriers.includes(rate.carrier));
      filtered = [...preferred, ...others];
    }

    return filtered;
  }

  // Sort rates by preference
  private sortRates(rates: ShippingRate[], preferences: any): ShippingRate[] {
    return rates.sort((a, b) => {
      if (preferences.cheapest) {
        return a.rate - b.rate;
      }
      if (preferences.fastest) {
        return a.transitTime.min - b.transitTime.min;
      }
      if (preferences.reliable) {
        return b.estimate.confidence - a.estimate.confidence;
      }
      return a.rate - b.rate; // Default to cheapest
    });
  }

  // Create shipment with carrier
  private async createCarrierShipment(carrier: any, request: ShippingRequest, rate: ShippingRate): Promise<any> {
    // Mock carrier API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const trackingNumbers = request.shipment.packages.map((_, index) => 
      `1Z${carrier.code}${Date.now()}${String(index + 1).padStart(3, '0')}`
    );

    return {
      shipmentId: this.generateCarrierShipmentId(),
      trackingNumbers,
      carrierConfirmation: `CONF-${Date.now()}`
    };
  }

  // Generate shipping labels
  private async generateShippingLabels(carrier: any, carrierShipment: any, request: ShippingRequest): Promise<ShippingLabel[]> {
    const labels: ShippingLabel[] = [];

    for (let i = 0; i < request.shipment.packages.length; i++) {
      const pkg = request.shipment.packages[i];
      
      labels.push({
        labelId: this.generateLabelId(),
        trackingNumber: carrierShipment.trackingNumbers[i],
        carrier: carrier.name,
        service: request.shipper.service,
        format: 'pdf',
        data: Buffer.from(`PDF label data for ${carrierShipment.trackingNumbers[i]}`).toString('base64'),
        size: {
          width: 4,
          height: 6,
          unit: 'in'
        },
        cost: 0.50, // Label cost
        currency: 'USD',
        tracking: {
          url: `https://www.${carrier.name}.com/track?tracking=${carrierShipment.trackingNumbers[i]}`,
          qrCode: `QR-${carrierShipment.trackingNumbers[i]}`,
          barcode: carrierShipment.trackingNumbers[i]
        },
        package: {
          packageId: pkg.packageId,
          weight: pkg.weight.value,
          dimensions: pkg.dimensions
        },
        createdAt: new Date()
      });
    }

    return labels;
  }

  // Generate customs documents
  private async generateCustomsDocuments(carrier: any, carrierShipment: any, request: ShippingRequest): Promise<any> {
    if (!request.shipment.customs) return {};

    return {
      commercialInvoice: Buffer.from('Commercial invoice data').toString('base64'),
      packingList: Buffer.from('Packing list data').toString('base64'),
      customsForms: [
        Buffer.from('Customs form data').toString('base64')
      ]
    };
  }

  // Update order with shipment information
  private async updateOrderShipment(orderId: string, shipment: Shipment): Promise<void> {
    const order = await Order.findById(orderId);
    if (order) {
      order.shipping = {
        carrier: shipment.carrier,
        service: shipment.service,
        trackingNumber: shipment.trackingNumbers[0],
        trackingNumbers: shipment.trackingNumbers,
        status: shipment.status,
        cost: shipment.rates.totalCost,
        estimatedDelivery: shipment.tracking.estimatedDelivery,
        labels: shipment.labels.map(label => ({
          trackingNumber: label.trackingNumber,
          format: label.format,
          data: label.data
        }))
      };

      order.status = 'shipped';
      order.metadata.shippedAt = new Date();

      await order.save();
    }
  }

  // Cancel carrier shipment
  private async cancelCarrierShipment(carrier: any, shipment: Shipment): Promise<void> {
    // Mock carrier API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Cancelling shipment ${shipment.shipmentId} with ${carrier.name}`);
  }

  // Update order shipment cancellation
  private async updateOrderShipmentCancellation(orderId: string, shipment: Shipment): Promise<void> {
    const order = await Order.findById(orderId);
    if (order) {
      order.shipping = undefined;
      order.status = 'processing';
      order.metadata.shippedAt = undefined;

      await order.save();
    }
  }

  // Get tracking updates from carrier
  private async getTrackingUpdates(carrier: any, trackingNumbers: string[]): Promise<TrackingUpdate[]> {
    // Mock tracking API call
    await new Promise(resolve => setTimeout(resolve, 800));

    const updates: TrackingUpdate[] = [];

    for (const trackingNumber of trackingNumbers) {
      updates.push({
        trackingNumber,
        carrier: carrier.name,
        status: 'in_transit',
        location: {
          city: 'Chicago',
          state: 'IL',
          country: 'US',
          postalCode: '60601'
        },
        timestamp: new Date(),
        description: 'Package is in transit',
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        metadata: {
          source: 'carrier_api',
          confidence: 0.95
        }
      });
    }

    return updates;
  }

  // Map tracking status to shipment status
  private mapTrackingStatusToShipmentStatus(trackingStatus: string): string {
    const statusMap: Record<string, string> = {
      'label_created': 'label_generated',
      'picked_up': 'picked_up',
      'in_transit': 'in_transit',
      'out_for_delivery': 'out_for_delivery',
      'delivered': 'delivered',
      'exception': 'exception'
    };

    return statusMap[trackingStatus] || 'created';
  }

  // Update order tracking
  private async updateOrderTracking(orderId: string, shipment: Shipment, latestUpdate: TrackingUpdate): Promise<void> {
    const order = await Order.findById(orderId);
    if (order && order.shipping) {
      order.shipping.status = shipment.status;
      order.shipping.trackingHistory = order.shipping.trackingHistory || [];
      order.shipping.trackingHistory.push({
        timestamp: latestUpdate.timestamp,
        status: latestUpdate.status,
        location: latestUpdate.location,
        description: latestUpdate.description
      });

      if (shipment.status === 'delivered') {
        order.status = 'delivered';
        order.metadata.deliveredAt = new Date();
      }

      await order.save();
    }
  }

  // Helper methods for analytics
  private async getShipmentsByDateRange(startDate: Date, endDate: Date): Promise<Shipment[]> {
    // Mock implementation
    return Array.from(this.shipments.values());
  }

  private calculateShippingSummary(shipments: Shipment[]): any {
    const totalShipments = shipments.length;
    const totalPackages = shipments.reduce((sum, s) => sum + s.packages.length, 0);
    const totalWeight = shipments.reduce((sum, s) => sum + s.packages.reduce((pkgSum, pkg) => pkgSum + pkg.weight, 0), 0);
    const totalCost = shipments.reduce((sum, s) => sum + s.rates.totalCost, 0);
    const averageCost = totalShipments > 0 ? totalCost / totalShipments : 0;
    const deliveredShipments = shipments.filter(s => s.status === 'delivered');
    const onTimeDeliveryRate = totalShipments > 0 ? deliveredShipments.length / totalShipments : 0;

    return {
      totalShipments,
      totalPackages,
      totalWeight,
      totalCost,
      averageCost,
      averageTransitTime: 3.5, // Mock value
      onTimeDeliveryRate
    };
  }

  private analyzeByCarrier(shipments: Shipment[]): Record<string, any> {
    const byCarrier: Record<string, any> = {};

    shipments.forEach(shipment => {
      if (!byCarrier[shipment.carrier]) {
        byCarrier[shipment.carrier] = {
          shipments: 0,
          packages: 0,
          cost: 0,
          averageCost: 0,
          averageTransitTime: 0,
          onTimeRate: 0,
          errorRate: 0
        };
      }

      const carrier = byCarrier[shipment.carrier];
      carrier.shipments++;
      carrier.packages += shipment.packages.length;
      carrier.cost += shipment.rates.totalCost;
    });

    // Calculate averages
    Object.keys(byCarrier).forEach(carrier => {
      const data = byCarrier[carrier];
      data.averageCost = data.cost / data.shipments;
      data.onTimeRate = 0.95; // Mock value
      data.errorRate = 0.02; // Mock value
    });

    return byCarrier;
  }

  private analyzeByService(shipments: Shipment[]): Record<string, any> {
    // Mock implementation
    return {};
  }

  private analyzeByLocation(shipments: Shipment[]): any[] {
    // Mock implementation
    return [];
  }

  private async calculateShippingPerformance(shipments: Shipment[], startDate: Date, endDate: Date): Promise<any> {
    // Mock implementation
    return {
      deliveryTimes: [],
      costPerMile: [],
      serviceLevels: []
    };
  }

  private async identifyShippingIssues(shipments: Shipment[]): Promise<any[]> {
    // Mock implementation
    return [];
  }

  private async generateShippingRecommendations(shipments: Shipment[], summary: any, issues: any[]): Promise<any[]> {
    // Mock implementation
    return [];
  }

  // Initialize carriers
  private initializeCarriers(): void {
    this.carriers.set('ups', {
      name: 'ups',
      code: 'UP',
      apiUrl: 'https://onlinetools.ups.com',
      services: ['01', '02', '03', '12']
    });

    this.carriers.set('fedex', {
      name: 'fedex',
      code: 'FDX',
      apiUrl: 'https://ws.fedex.com',
      services: ['PRIORITY_OVERNIGHT', 'FEDEX_2_DAY', 'GROUND_HOME_DELIVERY', 'FEDEX_EXPRESS_SAVER']
    });

    this.carriers.set('dhl', {
      name: 'dhl',
      code: 'DHL',
      apiUrl: 'https://xmlpi.dhl.com',
      services: ['EXPRESS_WORLDWIDE', 'EUROPACKET', 'DOMESTIC_EXPRESS']
    });

    this.carriers.set('usps', {
      name: 'usps',
      code: 'USPS',
      apiUrl: 'https://secure.shippingapis.com',
      services: ['PRIORITY', 'FIRST_CLASS', 'GROUND_ADVANTAGE']
    });
  }

  // Helper methods
  private generateShipmentId(): string {
    return `SHP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  private generateCarrierShipmentId(): string {
    return `CARRIER-${Date.now()}`;
  }

  private generateLabelId(): string {
    return `LBL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  private async validateSelectedRate(rate: ShippingRate, request: ShippingRequest): Promise<void> {
    // Mock validation
    if (!rate || !rate.carrier || !rate.service) {
      throw new Error('Invalid rate selection');
    }
  }

  // Public methods
  async getShipment(shipmentId: string): Promise<Shipment | null> {
    return this.shipments.get(shipmentId) || null;
  }

  async getShipmentsByOrder(orderId: string): Promise<Shipment[]> {
    return Array.from(this.shipments.values()).filter(s => s.orderId === orderId);
  }
}
