import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    tenantId: string;
    role: string;
    username: string;
  };
  tenantId?: string;
}

export const tenantMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Extract tenant context from JWT token
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      req.tenantId = decoded.tenantId;
      req.user = decoded;
    }

    // For super admin, allow access to all tenants
    if (req.user?.role === 'super_admin') {
      return next();
    }

    // For other users, ensure they can only access their tenant's data
    if (!req.tenantId) {
      return res.status(401).json({ message: 'Tenant context required' });
    }

    next();
  } catch (error) {
    console.error('Tenant middleware error:', error);
    return res.status(401).json({ message: 'Invalid tenant context' });
  }
};

export const requireSuperAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'super_admin') {
    return res.status(403).json({ message: 'Super admin access required' });
  }
  next();
};

// Alias exports for compatibility
export const setTenantContext = tenantMiddleware;
export const requireTenant = tenantMiddleware;