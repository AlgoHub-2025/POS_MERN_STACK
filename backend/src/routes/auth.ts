import crypto from 'crypto';
import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { Session } from '../models/Session';
import { Tenant } from '../models/Tenant';
import { User, UserDocument } from '../models/User';

const router = express.Router();

const registerSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase().trim()),
  password: z.string().min(8),
  firstName: z.string().min(2).max(50).transform((value) => value.trim()),
  lastName: z.string().min(2).max(50).transform((value) => value.trim()),
  phone: z.string().trim().optional(),
  tenantName: z.string().min(2).max(100).transform((value) => value.trim()),
  tenantSlug: z.string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/, 'Tenant slug can only contain lowercase letters, numbers, and hyphens')
    .transform((value) => value.toLowerCase().trim()),
}).strict();

const loginSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase().trim()),
  password: z.string().min(1),
  tenantSlug: z.string().min(1).transform((value) => value.toLowerCase().trim()),
}).strict();

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
}).strict();

const logoutSchema = refreshSchema;

const profileSchema = z.object({
  firstName: z.string().min(2).max(50).trim().optional(),
  lastName: z.string().min(2).max(50).trim().optional(),
  phone: z.string().trim().optional(),
}).strict();

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
}).strict();

const forgotPasswordSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase().trim()),
  tenantSlug: z.string().min(1).transform((value) => value.toLowerCase().trim()),
}).strict();

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8),
}).strict();

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is required');
  }
  return secret;
};

const getRefreshSecret = (): string => {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET is required');
  }
  return secret;
};

const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const parseDurationMs = (value: string): number => {
  const match = value.trim().match(/^(\d+)(ms|s|m|h|d)?$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000;

  const amount = Number.parseInt(match[1], 10);
  const unit = match[2] || 'ms';

  switch (unit) {
    case 'd':
      return amount * 24 * 60 * 60 * 1000;
    case 'h':
      return amount * 60 * 60 * 1000;
    case 'm':
      return amount * 60 * 1000;
    case 's':
      return amount * 1000;
    case 'ms':
    default:
      return amount;
  }
};

const refreshExpiryDate = (): Date => {
  const configuredExpiry = process.env.JWT_REFRESH_EXPIRES_IN || `${process.env.JWT_REFRESH_EXPIRES_DAYS || '7'}d`;
  return new Date(Date.now() + parseDurationMs(configuredExpiry));
};

const publicUser = (user: UserDocument) => ({
  id: user._id.toString(),
  tenantId: user.tenantId.toString(),
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  phone: user.phone,
  role: user.role,
  isActive: user.isActive,
  emailVerified: user.emailVerified,
  createdAt: user.createdAt,
  lastLoginAt: user.lastLoginAt,
});

const publicTenant = (tenant: { _id: unknown; name: string; slug: string; plan: string; isActive: boolean; createdAt?: Date; updatedAt?: Date }) => ({
  id: String(tenant._id),
  name: tenant.name,
  slug: tenant.slug,
  plan: tenant.plan,
  isActive: tenant.isActive,
  createdAt: tenant.createdAt,
  updatedAt: tenant.updatedAt,
});

const createTokens = async (user: UserDocument) => {
  const payload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    tenantId: user.tenantId.toString(),
  };

  const accessToken = jwt.sign(payload, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  } as jwt.SignOptions);

  const refreshToken = jwt.sign(
    {
      userId: user._id.toString(),
      tenantId: user.tenantId.toString(),
      sessionId: new mongoose.Types.ObjectId().toString(),
    },
    getRefreshSecret(),
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' } as jwt.SignOptions
  );

  await Session.create({
    userId: user._id,
    tenantId: user.tenantId,
    tokenHash: hashToken(refreshToken),
    expiresAt: refreshExpiryDate(),
  });

  return { accessToken, refreshToken };
};

const authResponse = async (
  user: UserDocument,
  tenant: { _id: unknown; name: string; slug: string; plan: string; isActive: boolean; createdAt?: Date; updatedAt?: Date },
  message: string,
) => {
  const tokens = await createTokens(user);
  return {
    success: true,
    message,
    tenant: publicTenant(tenant),
    user: publicUser(user),
    token: tokens.accessToken,
    tokens,
  };
};

const isTransactionUnsupported = (error: unknown): boolean => {
  return typeof error === 'object'
    && error !== null
    && 'code' in error
    && (error as { code?: number }).code === 20;
};

const createTenantAndAdmin = async (
  data: z.infer<typeof registerSchema>,
  mongoSession?: mongoose.ClientSession
) => {
  const { email, password, firstName, lastName, phone, tenantName, tenantSlug } = data;

  const tenantQuery = Tenant.findOne({ slug: tenantSlug });
  const existingTenant = mongoSession ? await tenantQuery.session(mongoSession) : await tenantQuery;
  if (existingTenant) {
    return { conflict: 'Tenant slug already exists' };
  }

  const [tenant] = await Tenant.create([{
    name: tenantName,
    slug: tenantSlug,
    plan: 'basic',
    isActive: true,
  }], mongoSession ? { session: mongoSession } : undefined);

  try {
    const [user] = await User.create([{
      tenantId: tenant._id,
      email,
      password,
      firstName,
      lastName,
      phone,
      role: 'admin',
      isActive: true,
      emailVerified: false,
    }], mongoSession ? { session: mongoSession } : undefined);

    return { tenant, user };
  } catch (error) {
    if (!mongoSession) {
      await Tenant.deleteOne({ _id: tenant._id });
    }
    throw error;
  }
};

router.post('/register', validateBody(registerSchema), async (req, res, next): Promise<void> => {
  const mongoSession = await mongoose.startSession();

  try {
    mongoSession.startTransaction();
    const result = await createTenantAndAdmin(req.body, mongoSession);

    if ('conflict' in result) {
      await mongoSession.abortTransaction();
      res.status(409).json({ success: false, message: result.conflict });
      return;
    }

    await mongoSession.commitTransaction();

    res.status(201).json(await authResponse(
      result.user,
      result.tenant,
      'Tenant and admin user registered successfully'
    ));
  } catch (error) {
    await mongoSession.abortTransaction().catch(() => undefined);

    if (isTransactionUnsupported(error)) {
      try {
        const result = await createTenantAndAdmin(req.body);
        if ('conflict' in result) {
          res.status(409).json({ success: false, message: result.conflict });
          return;
        }

        res.status(201).json(await authResponse(
          result.user,
          result.tenant,
          'Tenant and admin user registered successfully'
        ));
        return;
      } catch (fallbackError) {
        next(fallbackError);
        return;
      }
    }

    next(error);
  } finally {
    await mongoSession.endSession();
  }
});

router.post('/login', validateBody(loginSchema), async (req, res, next): Promise<void> => {
  try {
    const { email, password, tenantSlug } = req.body;
    const tenant = await Tenant.findOne({ slug: tenantSlug, isActive: true });

    if (!tenant) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const user = await User.findOne({ tenantId: tenant._id, email, isActive: true }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    user.lastLoginAt = new Date();
    await user.save();

    res.json(await authResponse(user, tenant, 'Login successful'));
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', validateBody(refreshSchema), async (req, res, next): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    const decoded = jwt.verify(refreshToken, getRefreshSecret()) as { userId: string; tenantId?: string };
    const tenantId = decoded.tenantId;

    if (!decoded.userId || !tenantId) {
      res.status(401).json({ success: false, message: 'Invalid refresh token' });
      return;
    }

    const tokenHash = hashToken(refreshToken);

    const session = await Session.findOne({
      tokenHash,
      userId: decoded.userId,
      tenantId,
      revokedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      res.status(401).json({ success: false, message: 'Invalid refresh token' });
      return;
    }

    const user = await User.findOne({
      _id: decoded.userId,
      tenantId,
      isActive: true,
    });

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid refresh token' });
      return;
    }

    session.revokedAt = new Date();
    await session.save();

    const tenant = await Tenant.findOne({ _id: user.tenantId, isActive: true });
    if (!tenant) {
      res.status(401).json({ success: false, message: 'Invalid refresh token' });
      return;
    }

    res.json(await authResponse(user, tenant, 'Token refreshed successfully'));
  } catch (error) {
    next(error);
  }
});

router.post('/logout', validateBody(logoutSchema), async (req, res, next): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    const decoded = jwt.verify(refreshToken, getRefreshSecret()) as { userId: string; tenantId?: string };
    const tenantId = decoded.tenantId;

    if (!decoded.userId || !tenantId) {
      res.status(401).json({ success: false, message: 'Invalid refresh token' });
      return;
    }

    const tokenHash = hashToken(refreshToken);
    await Session.updateOne(
      { tokenHash, userId: decoded.userId, tenantId, revokedAt: { $exists: false } },
      { $set: { revokedAt: new Date() } }
    );
    res.json({ success: true, message: 'Logout successful' });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authMiddleware, async (req, res, next): Promise<void> => {
  try {
    const user = await User.findOne({
      _id: req.user?.userId,
      tenantId: req.user?.tenantId,
      isActive: true,
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({ success: true, user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

router.put('/profile', authMiddleware, validateBody(profileSchema), async (req, res, next): Promise<void> => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.user?.userId, tenantId: req.user?.tenantId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({ success: true, message: 'Profile updated successfully', user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

router.put('/change-password', authMiddleware, validateBody(changePasswordSchema), async (req, res, next): Promise<void> => {
  try {
    const user = await User.findOne({
      _id: req.user?.userId,
      tenantId: req.user?.tenantId,
      isActive: true,
    }).select('+password');

    if (!user || !(await user.comparePassword(req.body.currentPassword))) {
      res.status(401).json({ success: false, message: 'Current password is incorrect' });
      return;
    }

    user.password = req.body.newPassword;
    await user.save();
    await Session.updateMany({ userId: user._id, revokedAt: { $exists: false } }, { $set: { revokedAt: new Date() } });

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
});

router.post('/forgot-password', validateBody(forgotPasswordSchema), async (req, res, next): Promise<void> => {
  try {
    const tenant = await Tenant.findOne({ slug: req.body.tenantSlug, isActive: true });
    const user = tenant
      ? await User.findOne({ tenantId: tenant._id, email: req.body.email, isActive: true })
      : null;

    if (user) {
      const resetToken = jwt.sign(
        { userId: user._id.toString(), tenantId: user.tenantId.toString(), type: 'password-reset' },
        getJwtSecret(),
        { expiresIn: '1h' }
      );
      // TODO: send email; do not return token in production.
      req.app.get('logger')?.info?.('Password reset requested', { userId: user._id.toString(), tenantId: user.tenantId.toString() });
    }

    res.json({ success: true, message: 'If an account exists, a reset link has been sent' });
  } catch (error) {
    next(error);
  }
});

router.post('/reset-password', validateBody(resetPasswordSchema), async (req, res, next): Promise<void> => {
  try {
    const decoded = jwt.verify(req.body.token, getJwtSecret()) as { userId: string; tenantId?: string; type: string };
    const tenantId = decoded.tenantId;
    if (decoded.type !== 'password-reset') {
      res.status(400).json({ success: false, message: 'Invalid reset token' });
      return;
    }

    if (!tenantId) {
      res.status(400).json({ success: false, message: 'Invalid reset token' });
      return;
    }

    const user = await User.findOne({ _id: decoded.userId, tenantId, isActive: true });
    if (!user) {
      res.status(400).json({ success: false, message: 'Invalid reset token' });
      return;
    }

    user.password = req.body.newPassword;
    await user.save();
    await Session.updateMany({ userId: user._id, revokedAt: { $exists: false } }, { $set: { revokedAt: new Date() } });

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
});

router.post('/verify-email', authMiddleware, (_req, res) => {
  res.status(501).json({ success: false, message: 'Email verification is not configured yet' });
});

router.post('/resend-verification', authMiddleware, (_req, res) => {
  res.status(501).json({ success: false, message: 'Email verification is not configured yet' });
});

export default router;
