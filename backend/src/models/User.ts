import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// ✅ Define the User interface locally
export interface IUser {
  tenantId: mongoose.Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  emailVerified: boolean;
  role: 'admin' | 'manager' | 'cashier';
  roles?: mongoose.Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserDocument extends IUser, Document {
  fullName: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
  getPublicProfile(): Omit<IUser, 'password'> & { fullName: string; id: string };
  updateLastLogin(): Promise<UserDocument>;
}

const userSchema = new Schema<UserDocument>({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: [true, 'Tenant ID is required'],
    index: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Safeguard: Excludes password from query results by default
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[+]?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLoginAt: {
    type: Date
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'cashier'],
    default: 'cashier'
  },
  roles: [{
    type: Schema.Types.ObjectId,
    ref: 'Role'
  }]
}, {
  timestamps: true,
  toJSON: {
    transform: function (doc, ret) {
      // ✅ Production approach: Use destructuring to completely drop password and __v safely
      const { password, __v, ...publicData } = ret;
      return publicData;
    }
  }
});

// Compound indexes
userSchema.index({ tenantId: 1, email: 1 }, { unique: true });
userSchema.index({ tenantId: 1, isActive: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function (this: UserDocument) {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware for password hashing
userSchema.pre('save', async function (this: UserDocument, next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Instance methods
userSchema.methods.comparePassword = async function (this: UserDocument, candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// ✅ Production Update: Uses destructuring to safely build profile object and fixes return types
userSchema.methods.getPublicProfile = function (this: UserDocument) {
  const userObject = this.toObject({ virtuals: true });
  
  // Destructure password and roles to completely remove them from the output object
  const { password, roles, ...publicProfile } = userObject;
  
  return publicProfile;
};

userSchema.methods.updateLastLogin = function (this: UserDocument) {
  this.lastLoginAt = new Date();
  return this.save();
};

// Static methods
userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email }).select('+password');
};

userSchema.statics.findByTenantAndEmail = function (tenantId: string, email: string) {
  return this.findOne({ tenantId, email, isActive: true }).select('+password');
};

userSchema.statics.findActiveByTenant = function (tenantId: string) {
  return this.find({ tenantId, isActive: true });
};

// Query middleware - ✅ FIX: Use function() instead of arrow
export const User = mongoose.model<UserDocument>('User', userSchema);
