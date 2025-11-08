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

  // Skip CSRF validation for safe methods and public routes
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  const publicPaths = [
    '/api/health',
    '/api/healthz', 
    '/api/status',
    '/api/ping',
    '/api/auth/login',
    '/api/auth/',
    '/public/',
    '/.well-known/',
    '/api/platform/stats',
    '/api/csrf-token',
    '/api/marketplace/products',
    '/api/marketplace/quote-requests',
    '/api/placeholder-image/'
  ];

  const isPublicPath = publicPaths.some(path => req.path.startsWith(path));
  const isSafeMethod = safeMethods.includes(req.method);

  // For safe methods or public paths, generate/refresh token and send to client
  if (isSafeMethod || isPublicPath) {
    // Generate new token only if it doesn't exist or is expired
    let storedData = csrfTokens.get(sessionId);
    const tokenAge = storedData ? Date.now() - storedData.timestamp : Infinity;
    
    // Generate new token if missing or older than 1 hour
    if (!storedData || tokenAge > (60 * 60 * 1000)) {
      const newToken = generateCSRFToken();
      csrfTokens.set(sessionId, {
        token: newToken,
        timestamp: Date.now()
      });
      storedData = csrfTokens.get(sessionId)!;
    }
    
    // Add token generation function to request
    req.csrfToken = () => storedData!.token;
    
    // Add token to response headers
    res.setHeader('X-CSRF-Token', storedData.token);
    
    return next();
  }

  // For unsafe methods (POST, PUT, DELETE, PATCH), validate CSRF token
  const clientToken = req.headers['x-csrf-token'] as string || 
                     req.body?._csrf || 
                     req.query._csrf;

  if (!clientToken) {
    return res.status(403).json({
      error: 'CSRF token required. Obtain token from GET request first.',
      code: 'CSRF_TOKEN_MISSING'
    });
  }

  // Validate token using constant-time comparison to prevent timing attacks
  const storedData = csrfTokens.get(sessionId);
  if (!storedData) {
    return res.status(403).json({
      error: 'No CSRF token found for this session. Make a GET request first.',
      code: 'CSRF_SESSION_INVALID'
    });
  }

  // Use constant-time comparison to prevent timing attacks
  const clientTokenBuf = Buffer.from(clientToken, 'utf8');
  const serverTokenBuf = Buffer.from(storedData.token, 'utf8');
  
  // Tokens must be same length for timingSafeEqual
  if (clientTokenBuf.length !== serverTokenBuf.length ||
      !crypto.timingSafeEqual(clientTokenBuf, serverTokenBuf)) {
    return res.status(403).json({
      error: 'Invalid CSRF token. Token mismatch.',
      code: 'CSRF_TOKEN_INVALID'
    });
  }

  // Token is valid, add it to request for potential use
  req.csrfToken = () => storedData.token;

  // Proceed with request
  next();
};

export const getCSRFToken = (req: CSRFRequest, res: Response) => {
  const token = req.csrfToken ? req.csrfToken() : generateCSRFToken();
  res.json({ csrfToken: token });
};