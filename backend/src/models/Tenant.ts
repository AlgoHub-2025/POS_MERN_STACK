import mongoose, { Schema, Document } from 'mongoose';
import { Tenant as ITenant } from '../../../shared/types';

export interface TenantDocument extends ITenant, Document {}

const tenantSchema = new Schema<TenantDocument>({
  name: {
    type: String,
    required: [true, 'Tenant name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    required: [true, 'Tenant slug is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
  },
  plan: {
    type: String,
    enum: ['basic', 'pro', 'enterprise'],
    default: 'basic'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for performance
tenantSchema.index({ slug: 1 });
tenantSchema.index({ isActive: 1 });

// Static methods
tenantSchema.statics.findBySlug = function(slug: string) {
  return this.findOne({ slug, isActive: true });
};

tenantSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Instance methods
tenantSchema.methods.deactivate = function() {
  this.isActive = false;
  return this.save();
};

tenantSchema.methods.activate = function() {
  this.isActive = true;
  return this.save();
};

// Pre-save middleware
tenantSchema.pre('save', function(next) {
  if (this.isModified('slug')) {
    this.slug = this.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  }
  next();
});

export const Tenant = mongoose.model<TenantDocument>('Tenant', tenantSchema);
