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

      // SECURITY: Super admin strict isolation - platform management only
      if (req.user?.role === 'super_admin') {
        // Define strictly allowed platform management endpoints for super admin
        const platformEndpoints = [
          '/api/tenants',
          '/api/admin',
          '/api/platform',
          '/api/users/all',
          '/api/audit-logs',
          '/api/analytics/platform',
          '/api/role-permissions',
          '/api/subscriptions',
          '/api/white-label',
          '/api/billing-plans',
          '/api/tenant-settings',
          '/api/client-management',
          '/api/admin/clients'
        ];
        
        // Define operational endpoints that super admin must NOT access
        const operationalEndpoints = [
          '/api/patients',
          '/api/prescriptions',
          '/api/appointments',
          '/api/lab-orders',
          '/api/lab-results',
          '/api/billing',
          '/api/pharmacy',
          '/api/hospital',
          '/api/laboratory'
        ];
        
        // Check if accessing operational data (FORBIDDEN for super admin)
        const isOperationalEndpoint = operationalEndpoints.some(endpoint => 
          req.path.startsWith(endpoint)
        );
        
        if (isOperationalEndpoint) {
          console.error(`[SECURITY VIOLATION] Super admin attempted to access operational endpoint: ${req.path}`);
          return res.status(403).json({ 
            message: "Super admin cannot access operational tenant data for security compliance",
            error: "SUPER_ADMIN_OPERATIONAL_ACCESS_DENIED"
          });
        }
        
        // Allow platform management endpoints
        const isManagementEndpoint = platformEndpoints.some(endpoint => 
          req.path.startsWith(endpoint)
        );
        
        if (isManagementEndpoint) {
          console.log(`[SECURITY AUDIT] Super admin platform management access: ${req.path}`);
          return next();
        }
        
        // Any other endpoint requires explanation and logging
        console.log(`[SECURITY WARNING] Super admin accessing non-categorized endpoint: ${req.path}`);
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
const publicRoutes = [
  // Main website routes - publicly accessible for SEO
  '/', '/about', '/pricing', '/contact', '/features', '/security', '/terms', '/privacy',
  // Static assets and verification files
  '/robots.txt', '/sitemap.xml', '/favicon.ico', 
  '/google*.html', '/google2ae759b1998ec13b.html',
  // API routes
  '/api/health', '/api/platform/stats', '/api/login', '/api/auth/login', '/api/validate-token', 
  '/api/laboratory-registration', '/api/pharmacy-registration', '/api/tenant/current', 
  '/api/register-organization', '/api/currency/detect', '/api/currencies/african-countries', 
  '/api/advertisements', '/api/marketplace/products', '/api/marketplace/quote-requests', 
  '/advertisements', '/marketplace/products', '/marketplace/quote-requests'
];

// Modified tenant context middleware to allow public routes
export const setTenantContext = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Skip authentication for public routes
  const isPublicRoute = publicRoutes.some(route => {
    // Handle special patterns
    if (route.includes('*') || route.includes('google*.html')) {
      if (route === '/google*.html') {
        return req.path.startsWith('/google') && req.path.endsWith('.html');
      }
      return req.path.startsWith(route.replace('*', ''));
    }
    
    // Handle dynamic routes and special cases
    if (route.includes(':') || req.path.includes('/currency/detect/') || req.path.includes('/currencies/african-countries')) {
      return req.path.startsWith(route) || req.path.includes('/currency/detect/') || req.path.includes('/currencies/african-countries');
    }
    
    // Exact match for regular routes
    return req.path === route;
  });
  
  // Also allow static file extensions and common paths
  const isStaticFile = /\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|html)$/.test(req.path);
  
  if (isPublicRoute || isStaticFile) {
    return next();
  }
  
  return tenantMiddleware(req, res, next);
};

export const requireTenant = tenantMiddleware;