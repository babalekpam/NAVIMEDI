import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, JWTPayload } from './auth';
import { storage } from '../storage';

export const tenantMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    console.log("[TENANT DEBUG] Path:", req.path, "User from auth:", !!req.user);
    
    // If user is already authenticated by previous middleware, load full tenant data
    if (req.user && req.user.tenantId) {
      const tenant = await storage.getTenant(req.user.tenantId);
      console.log("[TENANT DEBUG] Using authenticated user tenant:", req.user.tenantId);
      console.log("[TENANT DEBUG] Loaded tenant from DB (authenticated user):", tenant);
      req.tenant = tenant;
      req.tenantId = req.user.tenantId;
      return next();
    }
    
    // Extract tenant context from JWT token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log("[TENANT DEBUG] No bearer token");
      return res.status(401).json({ message: 'Authorization token required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token || token === 'undefined' || token === 'null' || token.length < 10) {
      console.log('Invalid token format:', token?.substring(0, 20) + '...');
      return res.status(401).json({ message: 'Invalid authorization token format' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key-change-in-production") as JWTPayload;
      req.tenantId = decoded.tenantId;
      req.user = {
        id: decoded.userId,
        tenantId: decoded.tenantId,
        role: decoded.role,
        username: decoded.username
      };
      
      // Load full tenant information from database
      const tenant = await storage.getTenant(decoded.tenantId);
      console.log("[TENANT DEBUG] Loaded tenant from DB:", tenant);
      req.tenant = tenant;

      // For super admin, allow access to all tenants
      if (req.user?.role === 'super_admin') {
        return next();
      }

      // For other users, ensure they can only access their tenant's data
      if (!req.tenantId) {
        return res.status(401).json({ message: 'Tenant context required' });
      }

      next();
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
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

// Public routes that don't require authentication
const publicRoutes = ['/api/login', '/api/auth/login', '/api/validate-token', '/api/laboratory-registration', '/api/pharmacy-registration', '/api/tenant/current', '/api/register-organization', '/api/currency/detect', '/api/currencies/african-countries'];

// Modified tenant context middleware to allow public routes
export const setTenantContext = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Skip authentication for public routes
  const isPublicRoute = publicRoutes.some(route => {
    if (route.includes(':') || req.path.includes('/currency/detect/') || req.path.includes('/currencies/african-countries')) {
      return req.path.startsWith(route) || req.path.includes('/currency/detect/') || req.path.includes('/currencies/african-countries');
    }
    return req.path === route;
  });
  
  if (isPublicRoute) {
    return next();
  }
  
  return tenantMiddleware(req, res, next);
};

export const requireTenant = tenantMiddleware;