import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import authRoutes from '../routes/auth';
import { errorHandler } from '../middleware/errorHandler';
import { Session } from '../models/Session';
import { Tenant } from '../models/Tenant';
import { User } from '../models/User';

jest.mock('../models/Tenant', () => ({
  Tenant: {
    findOne: jest.fn(),
    create: jest.fn(),
    deleteOne: jest.fn(),
  },
}));

jest.mock('../models/User', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('../models/Session', () => ({
  Session: {
    create: jest.fn(),
    findOne: jest.fn(),
    updateOne: jest.fn(),
    updateMany: jest.fn(),
  },
}));

jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return {
    ...actual,
    startSession: jest.fn(),
  };
});

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/auth', authRoutes);
  app.get('/forced-error', (_req, _res, next) => {
    next(new Error('MongoServerError: leaked database detail'));
  });
  app.use(errorHandler);
  return app;
};

const tenant = {
  _id: { toString: () => '64f000000000000000000001' },
  name: 'Tenant One',
  slug: 'tenant-one',
  plan: 'basic',
  isActive: true,
};

const user = {
  _id: { toString: () => '64f000000000000000000101' },
  tenantId: { toString: () => '64f000000000000000000001' },
  email: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User',
  phone: undefined,
  role: 'admin',
  isActive: true,
  emailVerified: false,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  lastLoginAt: undefined,
  comparePassword: jest.fn(),
  save: jest.fn(),
};

describe('auth security contract', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_EXPIRES_IN = '15m';
    process.env.JWT_REFRESH_EXPIRES_IN = '7d';
    jest.clearAllMocks();
  });

  it('login returns user, tenant, token, and JWT tenantId', async () => {
    (Tenant.findOne as jest.Mock).mockResolvedValue(tenant);
    (User.findOne as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue({
        ...user,
        comparePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(undefined),
      }),
    });
    (Session.create as jest.Mock).mockResolvedValue({});

    const response = await request(createApp())
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'password123', tenantSlug: 'tenant-one' });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      tenant: { id: '64f000000000000000000001', slug: 'tenant-one' },
      user: { tenantId: '64f000000000000000000001', email: 'admin@example.com' },
    });
    expect(typeof response.body.token).toBe('string');
    expect(response.body.tokens.accessToken).toBe(response.body.token);

    const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET!) as Record<string, unknown>;
    expect(decoded.tenantId).toBe('64f000000000000000000001');
    expect(decoded.tenant_id).toBeUndefined();
  });

  it('rejects client-supplied tenantId during registration validation', async () => {
    const response = await request(createApp())
      .post('/auth/register')
      .send({
        tenantId: '64f000000000000000000099',
        tenantName: 'Tenant One',
        tenantSlug: 'tenant-one',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      message: 'Validation failed',
      errors: expect.arrayContaining([expect.any(String)]),
    });
    expect(Tenant.create).not.toHaveBeenCalled();
    expect(User.create).not.toHaveBeenCalled();
  });

  it('sanitizes forced server errors', async () => {
    const response = await request(createApp()).get('/forced-error');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ success: false, message: 'Internal server error' });
    expect(JSON.stringify(response.body)).not.toContain('MongoServerError');
    expect(JSON.stringify(response.body)).not.toContain('stack');
  });

  it('logout revokes the stored refresh session for the token tenant', async () => {
    const refreshToken = jwt.sign(
      { userId: '64f000000000000000000101', tenantId: '64f000000000000000000001' },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );
    (Session.updateOne as jest.Mock).mockResolvedValue({ modifiedCount: 1 });

    const response = await request(createApp())
      .post('/auth/logout')
      .send({ refreshToken });

    expect(response.status).toBe(200);
    expect(Session.updateOne).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: '64f000000000000000000101',
        tenantId: '64f000000000000000000001',
        revokedAt: { $exists: false },
      }),
      expect.objectContaining({ $set: expect.objectContaining({ revokedAt: expect.any(Date) }) })
    );
  });
});
