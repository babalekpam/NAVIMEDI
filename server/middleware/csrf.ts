import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Custom CSRF Protection Implementation
 * 
 * Since csurf is deprecated, this is a custom implementation
 * that provides CSRF protection for BREACH mitigation
 */

interface CSRFRequest extends Request {
  csrfToken?: () => string;
}

// Store CSRF tokens in memory (in production, use Redis or database)
const csrfTokens = new Map<string, { token: string, timestamp: number }>();

// Clean up old tokens every hour
setInterval(() => {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  const keysToDelete: string[] = [];
  
  csrfTokens.forEach((data, sessionId) => {
    if (data.timestamp < oneHourAgo) {
      keysToDelete.push(sessionId);
    }
  });
  
  keysToDelete.forEach(key => csrfTokens.delete(key));
}, 60 * 60 * 1000);

export const generateCSRFToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const csrfProtection = (req: CSRFRequest, res: Response, next: NextFunction) => {
  // Generate session ID from IP and user agent for stateless operation
  const sessionId = crypto.createHash('sha256')
    .update(req.ip + (req.headers['user-agent'] || ''))
    .digest('hex');

  // Generate new CSRF token for each request
  const newToken = generateCSRFToken();
  csrfTokens.set(sessionId, {
    token: newToken,
    timestamp: Date.now()
  });

  // Add token generation function to request
  req.csrfToken = () => newToken;

  // Add token to response headers
  res.setHeader('X-CSRF-Token', newToken);

  // Skip CSRF validation for safe methods and public routes
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  const publicPaths = [
    '/api/health',
    '/api/healthz', 
    '/api/status',
    '/api/ping',
    '/api/auth/login',
    '/public/',
    '/.well-known/',
    '/api/platform/stats'
  ];

  const isPublicPath = publicPaths.some(path => req.path.startsWith(path));
  const isSafeMethod = safeMethods.includes(req.method);

  if (isSafeMethod || isPublicPath) {
    return next();
  }

  // For unsafe methods, validate CSRF token
  const clientToken = req.headers['x-csrf-token'] as string || 
                     req.body?._csrf || 
                     req.query._csrf;

  if (!clientToken) {
    return res.status(403).json({
      error: 'CSRF token required',
      code: 'CSRF_TOKEN_MISSING',
      csrfToken: newToken
    });
  }

  // Validate token
  const storedData = csrfTokens.get(sessionId);
  if (!storedData || storedData.token !== clientToken) {
    return res.status(403).json({
      error: 'Invalid CSRF token',
      code: 'CSRF_TOKEN_INVALID',
      csrfToken: newToken
    });
  }

  // Token is valid, proceed
  next();
};

export const getCSRFToken = (req: CSRFRequest, res: Response) => {
  const token = req.csrfToken ? req.csrfToken() : generateCSRFToken();
  res.json({ csrfToken: token });
};