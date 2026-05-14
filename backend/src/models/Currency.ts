import mongoose, { Schema, Document } from 'mongoose';

export interface ICurrency extends Document {
  // Basic Information
  code: string; // USD, EUR, GBP
  numericCode: string; // 840, 978, 826
  name: string; // US Dollar
  symbol: string; // $
  symbolPosition: 'before' | 'after' | 'before-with-space' | 'after-with-space';
  
  // Formatting
  decimalSeparator: '.' | ',';
  thousandSeparator: ',' | '.' | ' ' | '';
  decimalPlaces: number; // 2 for most, 3 for some (KWD), 0 for others (JPY)
  roundingRule: 'standard' | 'up' | 'down' | 'bankers' | 'half-up' | 'half-down';
  
  // Status and Classification
  isActive: boolean;
  isBaseCurrency: boolean; // for reporting
  isDefault: boolean; // for new entities
  isCrypto: boolean; // for cryptocurrency support
  blockchainNetwork?: string; // ethereum, bitcoin, solana
  
  // Exchange Rate Types
  exchangeRateTypes: {
    spot: boolean; // current market rate
    average: boolean; // period average
    historical: boolean; // historical rate
    fixed: boolean; // fixed rate (pegged)
    forward: boolean; // forward rate
  };
  
  // Currency Groups
  groups: {
    major: boolean; // USD, EUR, GBP, JPY
    minor: boolean; // other commonly traded currencies
    exotic: boolean; // less commonly traded currencies
    emerging: boolean; // emerging market currencies
    crypto: boolean; // cryptocurrencies
  };
  
  // Regulatory Information
  regulatory: {
    iso4217: boolean; // ISO 4217 compliant
    country: string; // ISO country code
    region: string; // geographical region
    centralBank?: string; // central bank name
    isRestricted: boolean; // exchange controls
    restrictionDetails?: string;
  };
  
  // Trading Information
  trading: {
    isTradable: boolean;
    marketHours?: {
      opens: string; // HH:MM
      closes: string; // HH:MM
      timezone: string;
      weekends: boolean;
    };
    liquidity: 'high' | 'medium' | 'low';
    volatility: 'low' | 'medium' | 'high';
    typicalSpread: number; // percentage
  };
  
  // Usage Statistics
  usage: {
    entityCount: number; // number of entities using this currency
    transactionCount: number;
    totalVolume: number; // in base currency
    lastUsed?: Date;
    averageDailyVolume: number;
  };
  
  // Exchange Rate Settings
  rateSettings: {
    defaultProvider: string; // XE, OANDA, ECB, etc.
    updateFrequency: 'real-time' | 'hourly' | 'daily' | 'manual';
    autoUpdate: boolean;
    maxDeviation: number; // percentage before alert
    backupProviders: string[];
  };
  
  // Validation Rules
  validation: {
    minimumAmount?: number;
    maximumAmount?: number;
    allowedDecimalPlaces: number;
    requireReferenceForAmounts?: number;
  };
  
  // Metadata
  metadata: {
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    updatedBy: string;
    version: number;
    lastRateUpdate?: Date;
    syncStatus: 'synced' | 'pending' | 'error';
  };
}

const CurrencySchema = new Schema<ICurrency>({
  // Basic Information
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    minlength: 3,
    maxlength: 3,
    validate: {
      validator: function(v: string) {
        return /^[A-Z]{3}$/.test(v);
      },
      message: 'Currency code must be 3 uppercase letters (ISO 4217)'
    }
  },
  numericCode: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v: string) {
        return /^\d{3}$/.test(v);
      },
      message: 'Numeric code must be 3 digits'
    }
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  symbol: {
    type: String,
    required: true,
    trim: true,
    maxlength: 10
  },
  symbolPosition: {
    type: String,
    required: true,
    enum: ['before', 'after', 'before-with-space', 'after-with-space'],
    default: 'before'
  },
  
  // Formatting
  decimalSeparator: {
    type: String,
    required: true,
    enum: ['.', ','],
    default: '.'
  },
  thousandSeparator: {
    type: String,
    required: true,
    enum: [',', '.', ' ', ''],
    default: ','
  },
  decimalPlaces: {
    type: Number,
    required: true,
    min: 0,
    max: 8,
    default: 2
  },
  roundingRule: {
    type: String,
    required: true,
    enum: ['standard', 'up', 'down', 'bankers', 'half-up', 'half-down'],
    default: 'standard'
  },
  
  // Status and Classification
  isActive: {
    type: Boolean,
    default: true
  },
  isBaseCurrency: {
    type: Boolean,
    default: false
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isCrypto: {
    type: Boolean,
    default: false
  },
  blockchainNetwork: {
    type: String,
    trim: true,
    maxlength: 50
  },
  
  // Exchange Rate Types
  exchangeRateTypes: {
    spot: { type: Boolean, default: true },
    average: { type: Boolean, default: true },
    historical: { type: Boolean, default: true },
    fixed: { type: Boolean, default: false },
    forward: { type: Boolean, default: false }
  },
  
  // Currency Groups
  groups: {
    major: { type: Boolean, default: false },
    minor: { type: Boolean, default: false },
    exotic: { type: Boolean, default: false },
    emerging: { type: Boolean, default: false },
    crypto: { type: Boolean, default: false }
  },
  
  // Regulatory Information
  regulatory: {
    iso4217: { type: Boolean, default: true },
    country: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      minlength: 2,
      maxlength: 2
    },
    region: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    centralBank: {
      type: String,
      trim: true,
      maxlength: 100
    },
    isRestricted: { type: Boolean, default: false },
    restrictionDetails: {
      type: String,
      trim: true,
      maxlength: 500
    }
  },
  
  // Trading Information
  trading: {
    isTradable: { type: Boolean, default: true },
    marketHours: {
      opens: {
        type: String,
        validate: {
          validator: function(v: string) {
            return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
          },
          message: 'Time must be in HH:MM format'
        }
      },
      closes: {
        type: String,
        validate: {
          validator: function(v: string) {
            return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
          },
          message: 'Time must be in HH:MM format'
        }
      },
      timezone: {
        type: String,
        trim: true
      },
      weekends: { type: Boolean, default: false }
    },
    liquidity: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium'
    },
    volatility: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    typicalSpread: {
      type: Number,
      min: 0,
      max: 100,
      default: 0.1
    }
  },
  
  // Usage Statistics
  usage: {
    entityCount: { type: Number, default: 0, min: 0 },
    transactionCount: { type: Number, default: 0, min: 0 },
    totalVolume: { type: Number, default: 0, min: 0 },
    lastUsed: { type: Date },
    averageDailyVolume: { type: Number, default: 0, min: 0 }
  },
  
  // Exchange Rate Settings
  rateSettings: {
    defaultProvider: {
      type: String,
      required: true,
      trim: true,
      default: 'manual'
    },
    updateFrequency: {
      type: String,
      enum: ['real-time', 'hourly', 'daily', 'manual'],
      default: 'daily'
    },
    autoUpdate: { type: Boolean, default: false },
    maxDeviation: {
      type: Number,
      min: 0,
      max: 100,
      default: 5.0
    },
    backupProviders: [{
      type: String,
      trim: true
    }]
  },
  
  // Validation Rules
  validation: {
    minimumAmount: {
      type: Number,
      min: 0
    },
    maximumAmount: {
      type: Number,
      min: 0
    },
    allowedDecimalPlaces: {
      type: Number,
      min: 0,
      max: 8,
      default: 2
    },
    requireReferenceForAmounts: {
      type: Number,
      min: 0
    }
  },
  
  // Metadata
  metadata: {
    createdBy: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: String,
      required: true
    },
    version: {
      type: Number,
      default: 1,
      min: 1
    },
    lastRateUpdate: { type: Date },
    syncStatus: {
      type: String,
      enum: ['synced', 'pending', 'error'],
      default: 'synced'
    }
  }
}, {
  timestamps: true,
  collection: 'currencies'
});

// Indexes
CurrencySchema.index({ code: 1 });
CurrencySchema.index({ numericCode: 1 });
CurrencySchema.index({ isActive: 1 });
CurrencySchema.index({ isBaseCurrency: 1 });
CurrencySchema.index({ isDefault: 1 });
CurrencySchema.index({ 'regulatory.country': 1 });
CurrencySchema.index({ 'groups.major': 1 });
CurrencySchema.index({ 'groups.crypto': 1 });
CurrencySchema.index({ 'metadata.lastRateUpdate': 1 });

// Validation: Only one base currency
CurrencySchema.pre('save', async function(next) {
  if (this.isBaseCurrency) {
    try {
      const existingBaseCurrency = await this.constructor.findOne({ 
        isBaseCurrency: true, 
        _id: { $ne: this._id } 
      });
      
      if (existingBaseCurrency) {
        const error = new Error('Only one base currency can be set');
        return next(error);
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Validation: Only one default currency
CurrencySchema.pre('save', async function(next) {
  if (this.isDefault) {
    try {
      const existingDefaultCurrency = await this.constructor.findOne({ 
        isDefault: true, 
        _id: { $ne: this._id } 
      });
      
      if (existingDefaultCurrency) {
        const error = new Error('Only one default currency can be set');
        return next(error);
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Instance methods
CurrencySchema.methods.formatAmount = function(amount: number): string {
  const roundedAmount = this.roundAmount(amount);
  const formattedNumber = this.formatNumber(roundedAmount);
  
  switch (this.symbolPosition) {
    case 'before':
      return `${this.symbol}${formattedNumber}`;
    case 'after':
      return `${formattedNumber}${this.symbol}`;
    case 'before-with-space':
      return `${this.symbol} ${formattedNumber}`;
    case 'after-with-space':
      return `${formattedNumber} ${this.symbol}`;
    default:
      return `${this.symbol}${formattedNumber}`;
  }
};

CurrencySchema.methods.roundAmount = function(amount: number): number {
  const factor = Math.pow(10, this.decimalPlaces);
  
  switch (this.roundingRule) {
    case 'up':
      return Math.ceil(amount * factor) / factor;
    case 'down':
      return Math.floor(amount * factor) / factor;
    case 'bankers':
      return Math.round(amount * factor) / factor;
    case 'half-up':
      return (amount >= 0) ? 
        Math.ceil(amount * factor - 0.5) / factor : 
        Math.floor(amount * factor + 0.5) / factor;
    case 'half-down':
      return (amount >= 0) ? 
        Math.floor(amount * factor + 0.5) / factor : 
        Math.ceil(amount * factor - 0.5) / factor;
    case 'standard':
    default:
      return Math.round(amount * factor) / factor;
  }
};

CurrencySchema.methods.formatNumber = function(amount: number): string {
  const roundedAmount = this.roundAmount(amount);
  const parts = roundedAmount.toFixed(this.decimalPlaces).split('.');
  
  // Format thousands separator
  if (this.thousandSeparator && parts[0]) {
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, this.thousandSeparator);
  }
  
  // Join with decimal separator
  return parts.join(this.decimalSeparator);
};

CurrencySchema.methods.isValidAmount = function(amount: number): boolean {
  if (this.validation.minimumAmount && amount < this.validation.minimumAmount) {
    return false;
  }
  
  if (this.validation.maximumAmount && amount > this.validation.maximumAmount) {
    return false;
  }
  
  // Check decimal places
  const decimalPlaces = (amount.toString().split('.')[1] || '').length;
  if (decimalPlaces > this.validation.allowedDecimalPlaces) {
    return false;
  }
  
  return true;
};

CurrencySchema.methods.updateUsage = async function(transactionVolume: number = 0): Promise<void> {
  this.usage.transactionCount += 1;
  this.usage.totalVolume += transactionVolume;
  this.usage.lastUsed = new Date();
  
  // Update average daily volume (simplified calculation)
  const daysSinceCreation = Math.max(1, Math.floor((Date.now() - this.metadata.createdAt.getTime()) / (1000 * 60 * 60 * 24)));
  this.usage.averageDailyVolume = this.usage.totalVolume / daysSinceCreation;
  
  await this.save();
};

// Static methods
CurrencySchema.statics.findByCode = function(code: string): Promise<ICurrency | null> {
  return this.findOne({ code: code.toUpperCase(), isActive: true });
};

CurrencySchema.statics.findActive = function(): Promise<ICurrency[]> {
  return this.find({ isActive: true }).sort({ code: 1 });
};

CurrencySchema.statics.findBaseCurrency = function(): Promise<ICurrency | null> {
  return this.findOne({ isBaseCurrency: true, isActive: true });
};

CurrencySchema.statics.findDefaultCurrency = function(): Promise<ICurrency | null> {
  return this.findOne({ isDefault: true, isActive: true });
};

CurrencySchema.statics.findByCountry = function(countryCode: string): Promise<ICurrency[]> {
  return this.find({ 'regulatory.country': countryCode.toUpperCase(), isActive: true });
};

CurrencySchema.statics.findCryptoCurrencies = function(): Promise<ICurrency[]> {
  return this.find({ isCrypto: true, isActive: true });
};

CurrencySchema.statics.findMajorCurrencies = function(): Promise<ICurrency[]> {
  return this.find({ 'groups.major': true, isActive: true });
};

CurrencySchema.statics.search = function(query: string): Promise<ICurrency[]> {
  const searchRegex = new RegExp(query, 'i');
  return this.find({
    $or: [
      { code: searchRegex },
      { name: searchRegex },
      { 'regulatory.country': searchRegex },
      { symbol: searchRegex }
    ],
    isActive: true
  }).sort({ code: 1 });
};

// Virtuals
CurrencySchema.virtual('isFiat').get(function() {
  return !this.isCrypto;
});

CurrencySchema.virtual('displayName').get(function() {
  return `${this.name} (${this.code})`;
});

CurrencySchema.virtual('formattedExample').get(function() {
  return this.formatAmount(1234.56);
});

// Pre-save middleware
CurrencySchema.pre('save', function(next) {
  this.metadata.updatedAt = new Date();
  this.metadata.version += 1;
  next();
});

// Pre-remove middleware
CurrencySchema.pre('remove', async function(next) {
  // Check if currency is being used by any entities
  if (this.usage.entityCount > 0) {
    const error = new Error('Cannot delete currency that is in use');
    return next(error);
  }
  
  // Check if it's the base or default currency
  if (this.isBaseCurrency || this.isDefault) {
    const error = new Error('Cannot delete base or default currency');
    return next(error);
  }
  
  next();
});

export const Currency = mongoose.model<ICurrency>('Currency', CurrencySchema);
export default Currency;
