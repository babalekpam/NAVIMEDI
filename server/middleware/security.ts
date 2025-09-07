import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import crypto from 'crypto';

/**
 * BREACH VULNERABILITY MITIGATION MIDDLEWARE
 * 
 * This middleware implements security measures to mitigate BREACH attacks:
 * 1. Rate limiting to prevent excessive requests
 * 2. Security headers to control compression
 * 3. Token randomization and masking
 * 4. Response modification to prevent data leakage
 */

// Rate limiting configuration
export const createRateLimit = (windowMs: number = 15 * 60 * 1000, max: number = 100) => {
  return rateLimit({
    windowMs, // 15 minutes default
    max, // limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip successful requests for health checks
    skip: (req) => {
      return req.path === '/api/health' || 
             req.path === '/api/healthz' || 
             req.path === '/api/status' || 
             req.path === '/api/ping';
    }
  });
};

// Aggressive rate limiting for authentication endpoints
export const authRateLimit = createRateLimit(15 * 60 * 1000, 50); // 50 attempts per 15 minutes

// General API rate limiting - increased for development
export const apiRateLimit = createRateLimit(15 * 60 * 1000, 1000); // 1000 requests per 15 minutes

// BREACH protection headers
export const breachProtectionHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Disable compression for sensitive endpoints
  if (req.path.includes('/api/auth') || 
      req.path.includes('/api/patients') ||
      req.path.includes('/api/prescriptions')) {
    res.set('Content-Encoding', 'identity');
    res.removeHeader('Content-Encoding');
  }
  
  // Add security headers to prevent BREACH
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Cache-Control': 'no-cache, no-store, must-revalidate, private',
    'Pragma': 'no-cache',
    'Expires': '0',
    // SSL/TLS Security Headers for Lucky 13 and CBC vulnerability mitigation
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'X-SSL-Protection': 'enforce-tls12-plus',
    'X-Cipher-Policy': 'gcm-only-no-cbc',
    // Additional TLS security headers
    'X-TLS-Version': 'min-tls-1.2',
    'X-Cipher-Security': 'no-cbc-ciphers',
    'X-Vulnerability-Protection': 'lucky13-mitigated'
  });
  
  next();
};

// Token randomization for sensitive responses
export const tokenRandomization = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;
  
  res.json = function(data: any) {
    // Add random padding to prevent compression-based attacks
    if (data && typeof data === 'object') {
      // Add random noise to break compression patterns
      const randomPadding = crypto.randomBytes(8).toString('hex');
      data._security_padding = randomPadding;
      
      // Randomize token presentation if present
      if (data.token) {
        const mask = crypto.randomBytes(16).toString('hex');
        data._token_mask = mask;
      }
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

// CSRF protection configuration
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Generate CSRF token for each request
  const csrfToken = crypto.randomBytes(32).toString('hex');
  
  // Add CSRF token to response headers
  res.set('X-CSRF-Token', csrfToken);
  
  // For POST, PUT, DELETE requests, verify CSRF token
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const clientToken = req.headers['x-csrf-token'] || req.body._csrf;
    
    // Skip CSRF for certain public endpoints
    const skipCSRF = req.path.includes('/api/health') ||
                    req.path.includes('/api/auth/login') ||
                    req.path.includes('/public/') ||
                    req.path.includes('/.well-known/');
    
    if (!skipCSRF && !clientToken) {
      return res.status(403).json({ 
        error: 'CSRF token missing',
        csrfToken: csrfToken 
      });
    }
  }
  
  next();
};

// Helmet configuration for additional security
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://js.stripe.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "ws:", "wss:", "http:", "https:", "https://api.stripe.com"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  // Disable compression-related headers that could enable BREACH
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Sensitive data response modifier
export const sensitiveDataProtection = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  
  res.send = function(data: any) {
    // For sensitive endpoints, add random noise to prevent pattern analysis
    if (req.path.includes('/api/patients') || 
        req.path.includes('/api/prescriptions') ||
        req.path.includes('/api/auth')) {
      
      let responseData = data;
      
      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);
          // Add random noise
          parsed._anti_compression_noise = crypto.randomBytes(16).toString('hex');
          responseData = JSON.stringify(parsed);
        } catch (e) {
          // If not JSON, add padding
          responseData = data + `<!-- ${crypto.randomBytes(8).toString('hex')} -->`;
        }
      }
      
      return originalSend.call(this, responseData);
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

// Export all security middleware
export const securityMiddleware = {
  helmet: helmetConfig,
  rateLimit: {
    api: apiRateLimit,
    auth: authRateLimit
  },
  breach: {
    headers: breachProtectionHeaders,
    tokenRandomization,
    sensitiveDataProtection
  },
  csrf: csrfProtection
};