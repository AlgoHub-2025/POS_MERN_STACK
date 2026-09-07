import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../models/User'

type AuthTokenPayload = {
  userId: string;
  tenantId?: string;
};

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Access token is required' })
      return
    }

    const token = authHeader.substring(7)

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthTokenPayload
      const tenantId = decoded.tenantId

      if (!decoded.userId || !tenantId) {
        res.status(401).json({ success: false, message: 'Invalid or expired token' })
        return
      }

      const user = await User.findOne({ _id: decoded.userId, tenantId })
      
      if (!user || !user.isActive) {
        res.status(401).json({ success: false, message: 'Invalid token or user not found' })
        return
      }

      if (!user.role) {
        res.status(403).json({ success: false, message: 'User role is not defined' })
        return
      }

    
      if (!user.tenantId || user.tenantId.toString() !== tenantId) {
        res.status(403).json({ success: false, message: 'User has no tenant context' })
        return
      }

      req.user = {
        userId: user._id.toString(),    // ObjectId -> string
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        tenantId: user.tenantId.toString()
      }

      next()
    } catch (jwtError) {
      res.status(401).json({ success: false, message: 'Invalid or expired token' })
      return
    }
  } catch (error) {
    console.error('Auth middleware error:', error)
    res.status(500).json({ success: false, message: 'Internal server error' })
    return
  }
}

// Role-based middleware
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
   if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' })
      return
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Insufficient permissions' })
      return
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
export const authenticateToken = authMiddleware
