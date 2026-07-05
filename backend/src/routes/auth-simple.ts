import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const router = express.Router();

type StoredUser = {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'cashier';
  isActive: boolean;
  emailVerified: boolean;
  tenantId?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  lastLoginAt?: Date;
};

const getUsersCollection = () => {
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database is not connected');
  }
  return db.collection<StoredUser>('users');
};

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is required');
  }
  return secret;
};

const getRefreshSecret = () => {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET is required');
  }
  return secret;
};

const toPublicUser = (user: StoredUser) => ({
  id: user._id.toString(),
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  role: user.role,
  isActive: user.isActive,
  emailVerified: user.emailVerified,
  createdAt: user.createdAt,
  lastLoginAt: user.lastLoginAt,
});

const createTokens = (user: StoredUser) => ({
  accessToken: jwt.sign(
    { userId: user._id.toString(), email: user.email, role: user.role },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' } as jwt.SignOptions
  ),
  refreshToken: jwt.sign(
    { userId: user._id.toString() },
    getRefreshSecret(),
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' } as jwt.SignOptions
  ),
});

const requireAuth: express.RequestHandler = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Access token is required' });
      return;
    }

    const decoded = jwt.verify(header.slice(7), getJwtSecret()) as { userId: string };
    const user = await getUsersCollection().findOne({
      _id: new mongoose.Types.ObjectId(decoded.userId),
      isActive: true,
    });

    if (!user) {
      res.status(401).json({ message: 'Invalid token or user not found' });
      return;
    }

    (req as express.Request & { user?: StoredUser }).user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role = 'cashier', tenantId } = req.body;

    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({ message: 'Email, password, first name, and last name are required' });
      return;
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const users = getUsersCollection();
    const existingUser = await users.findOne({ email: normalizedEmail });

    if (existingUser) {
      res.status(409).json({ message: 'User already exists' });
      return;
    }

    const now = new Date();
    const user: StoredUser = {
      _id: new mongoose.Types.ObjectId(),
      email: normalizedEmail,
      password: await bcrypt.hash(String(password), 12),
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      role: ['admin', 'manager', 'cashier'].includes(role) ? role : 'cashier',
      isActive: true,
      emailVerified: false,
      tenantId: tenantId ? new mongoose.Types.ObjectId(String(tenantId)) : new mongoose.Types.ObjectId(),
      createdAt: now,
      updatedAt: now,
    };

    await users.insertOne(user);

    res.status(201).json({
      message: 'User registered successfully',
      user: toPublicUser(user),
      tokens: createTokens(user),
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await getUsersCollection().findOne({
      email: String(email || '').toLowerCase().trim(),
    });

    if (!user || !user.isActive || !(await bcrypt.compare(String(password || ''), user.password))) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const lastLoginAt = new Date();
    await getUsersCollection().updateOne({ _id: user._id }, { $set: { lastLoginAt } });
    user.lastLoginAt = lastLoginAt;

    res.json({
      message: 'Login successful',
      user: toPublicUser(user),
      tokens: createTokens(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const decoded = jwt.verify(String(req.body.refreshToken || ''), getRefreshSecret()) as { userId: string };
    const user = await getUsersCollection().findOne({
      _id: new mongoose.Types.ObjectId(decoded.userId),
      isActive: true,
    });

    if (!user) {
      res.status(401).json({ message: 'Invalid refresh token' });
      return;
    }

    res.json({ tokens: createTokens(user) });
  } catch {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

router.get('/me', requireAuth, (req, res) => {
  const user = (req as express.Request & { user?: StoredUser }).user;
  if (!user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  res.json(toPublicUser(user));
});

export default router;
