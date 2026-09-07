import mongoose, { Document, Schema } from 'mongoose';

export interface TenantDocument extends Document {
  name: string;
  slug: string;
  plan: 'basic' | 'pro' | 'enterprise';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deactivate(): Promise<TenantDocument>;
  activate(): Promise<TenantDocument>;
}

const tenantSchema = new Schema<TenantDocument>({
  name: {
    type: String,
    required: [true, 'Tenant name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  slug: {
    type: String,
    required: [true, 'Tenant slug is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'],
  },
  plan: {
    type: String,
    enum: ['basic', 'pro', 'enterprise'],
    default: 'basic',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
  toJSON: {
    transform: (_doc, ret: Record<string, unknown>) => {
      delete ret.__v;
      return ret;
    },
  },
});

tenantSchema.index({ isActive: 1 });

tenantSchema.statics.findBySlug = function (slug: string) {
  return this.findOne({ slug, isActive: true });
};

tenantSchema.statics.findActive = function () {
  return this.find({ isActive: true });
};

tenantSchema.methods.deactivate = function () {
  this.isActive = false;
  return this.save();
};

tenantSchema.methods.activate = function () {
  this.isActive = true;
  return this.save();
};

tenantSchema.pre('save', function (next) {
  if (this.isModified('slug')) {
    this.slug = this.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  }
  next();
});

export const Tenant = mongoose.model<TenantDocument>('Tenant', tenantSchema);
