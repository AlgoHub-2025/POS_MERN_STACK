import express from 'express'
import Joi from 'joi'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import { User } from '../models/User'
import { authMiddleware } from '../middleware/auth'

const router = express.Router()

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().min(2).required(),
  lastName: Joi.string().min(2).required(),
  role: Joi.string().valid('admin', 'manager', 'cashier').optional()
})

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
})

// Validation middleware
const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction): void => {
    const { error } = schema.validate(req.body)
    if (error) {
      res.status(400).json({
        message: 'Validation failed',
        errors: error.details.map(detail => ({
          field: detail.path[0],
          message: detail.message
        }))
      })
      return
    }
    next()
  }
}

// Validation middleware for express-validator
const validateExpress = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ message: 'Validation failed', errors: errors.array() })
    return
  }
  next()
}

// Register
router.post('/register', validateRequest(registerSchema), async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, role = 'cashier' } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' })
    }

    // Create user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role,
      isActive: true,
      emailVerified: false
    })

    await user.save()

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    )

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    )

    // Return user data without password
    const userResponse = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt
    }

    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse,
      tokens: {
        accessToken,
        refreshToken
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Login
router.post('/login', validateRequest(loginSchema), async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { email, password } = req.body

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    )

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    )

    // Update last login
    user.lastLoginAt = new Date()
    await user.save()

    // Return user data without password
    const userResponse = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt
    }

    res.json({
      message: 'Login successful',
      user: userResponse,
      tokens: {
        accessToken,
        refreshToken
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Refresh token
router.post('/refresh', [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
], validateExpress, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { refreshToken } = req.body

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any
    const userId = decoded.userId

    // Find user
    const user = await User.findById(userId)
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid refresh token' })
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    )

    res.json({
      tokens: {
        accessToken: newAccessToken,
        refreshToken // Keep the same refresh token
      }
    })
  } catch (error) {
    console.error('Token refresh error:', error)
    res.status(401).json({ message: 'Invalid refresh token' })
  }
})

// Logout
router.post('/logout', [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
], validateExpress, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { refreshToken } = req.body

    // In a real application, you might want to blacklist the refresh token
    // For now, we'll just verify it's valid and return success
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!)

    res.json({ message: 'Logout successful' })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(400).json({ message: 'Invalid refresh token' })
  }
})

// Get current user
router.get('/me', authMiddleware, async (req: express.Request, res: express.Response) => {
  try {
    const userId = (req as any).user.userId
    const user = await User.findById(userId).select('-password')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt
    })
  } catch (error) {
    console.error('Get current user error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Update profile
router.put('/profile', authMiddleware, [
  body('firstName').optional().trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').optional().trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
], validateExpress, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId
    const { firstName, lastName, email, role } = req.body

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return res.status(409).json({ message: 'Email already exists' })
      }
    }

    if (firstName) user.firstName = firstName
    if (lastName) user.lastName = lastName
    if (email && email !== user.email) {
      user.email = email
      user.emailVerified = false // Re-verify new email
    }
    if (role) user.role = role
    await user.save()

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      }
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Change password
router.put('/change-password', authMiddleware, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
], validateExpress, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId
    const { currentPassword, newPassword } = req.body

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' })
    }

    // Update password (model hook will handle hashing)
    user.password = newPassword
    await user.save()
    res.json({ message: 'Password changed successfully' })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Forgot password
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
], validateExpress, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      // Don't reveal if user exists or not
      return res.json({ message: 'If an account exists, a reset link has been sent' })
    }

    // Generate reset token (in a real app, you'd send this via email)
    const resetToken = jwt.sign(
      { userId: user._id, type: 'password-reset' },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    )

    // For now, just return success (in production, send email)
    console.log(`Password reset token for ${email}: ${resetToken}`)

    res.json({ message: 'If an account exists, a reset link has been sent' })
  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Reset password
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
], validateExpress, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body

    // Verify reset token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    if (decoded.type !== 'password-reset') {
      return res.status(400).json({ message: 'Invalid reset token' })
    }

    const userId = decoded.userId
    const user = await User.findById(userId)
    if (!user) {
      return res.status(400).json({ message: 'Invalid reset token' })
    }

    // Update password (model hook will handle hashing)
    user.password = newPassword
    await user.save()

    res.json({ message: 'Password reset successful' })
  } catch (error) {
    console.error('Reset password error:', error)
    res.status(400).json({ message: 'Invalid or expired reset token' })
  }
})

export default router
