import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../models/User'

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string
        email: string
        role: string
      }
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access token is required' })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
      
      // Get user from database
      const user = await User.findById(decoded.userId)
      
      if (!user || !user.isActive) {
        return res.status(401).json({ message: 'Invalid token or user not found' })
      }

      // Add user info to request
      req.user = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role
      }

      next()
    } catch (jwtError) {
      return res.status(401).json({ message: 'Invalid or expired token' })
    }
  } catch (error) {
    console.error('Auth middleware error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

// Role-based middleware
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' })
    }

    next()
  }
}

// Admin only middleware
export const requireAdmin = requireRole(['admin'])

// Manager or admin middleware
export const requireManager = requireRole(['admin', 'manager'])

// Any authenticated user middleware
export const requireAuth = authMiddleware
