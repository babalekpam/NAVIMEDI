/**
 * API Key Middleware
 * 
 * Validates API keys, checks permissions, enforces rate limiting,
 * and logs API usage for the NaviMED Healthcare Platform
 * 
 * SECURITY CRITICAL: This middleware handles external API authentication
 * without JWT tokens. All attempts (success and failure) are logged for
 * security monitoring and HIPAA compliance.
 */

import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};
const ipRateLimitStore: RateLimitStore = {};

/**
 * Get client IP address from request
 */
function getClientIp(req: Request): string {
  return req.ip || 
         req.headers['x-forwarded-for'] as string || 
         req.connection.remoteAddress || 
         'unknown';
}

/**
 * Validate API key from request headers
 * 
 * CRITICAL FIX: This function no longer depends on req.user or tenantId.
 * It extracts the API key from headers and looks it up directly in the database.
 * The tenant context is derived FROM the matched API key itself.
 */
export async function validateApiKey(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const clientIp = getClientIp(req);
  const endpoint = req.path;
  const method = req.method;
  
  try {
    const apiKeyHeader = req.headers['x-api-key'] as string || 
                        req.headers['authorization']?.replace('Bearer ', '');
    
    if (!apiKeyHeader) {
      await logFailedAttempt({
        endpoint,
        method,
        clientIp,
        reason: 'Missing API key',
        keyPrefix: null,
        statusCode: 401,
        responseTime: Date.now() - startTime,
        userAgent: req.headers['user-agent'] || null
      });
      
      return res.status(401).json({
        error: 'API key required',
        message: 'Please provide an API key in the X-API-Key or Authorization header'
      });
    }

    const keyPrefix = apiKeyHeader.substring(0, 8);
    
    const matchedKey = await storage.findApiKeyByValue(apiKeyHeader);
    
    if (!matchedKey) {
      // Apply IP rate limiting for failed authentication attempts
      const rateLimitResult = checkIpRateLimit(clientIp);
      if (!rateLimitResult.allowed) {
        await logFailedAttempt({
          endpoint,
          method,
          clientIp,
          reason: 'Rate limit exceeded - too many failed attempts',
          keyPrefix,
          statusCode: 429,
          responseTime: Date.now() - startTime,
          userAgent: req.headers['user-agent'] || null
        });
        
        console.warn(`[SECURITY] Rate limit exceeded from ${clientIp} - ${rateLimitResult.count} failed attempts`);
        
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: 'Too many failed authentication attempts. Please try again later.',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        });
      }

      await logFailedAttempt({
        endpoint,
        method,
        clientIp,
        reason: 'Invalid API key',
        keyPrefix,
        statusCode: 401,
        responseTime: Date.now() - startTime,
        userAgent: req.headers['user-agent'] || null
      });
      
      console.warn(`[SECURITY] Failed API key attempt from ${clientIp} - Invalid key: ${keyPrefix}...`);
      
      return res.status(401).json({
        error: 'Invalid API key',
        message: 'The provided API key is not valid'
      });
    }

    if (!matchedKey.isActive) {
      await logFailedAttempt({
        endpoint,
        method,
        clientIp,
        reason: 'Inactive API key',
        keyPrefix,
        statusCode: 401,
        responseTime: Date.now() - startTime,
        userAgent: req.headers['user-agent'] || null,
        apiKeyId: matchedKey.id,
        tenantId: matchedKey.tenantId
      });
      
      console.warn(`[SECURITY] Failed API key attempt from ${clientIp} - Inactive key: ${matchedKey.keyName}`);
      
      return res.status(401).json({
        error: 'Inactive API key',
        message: 'This API key has been deactivated'
      });
    }

    if (matchedKey.expiresAt && new Date(matchedKey.expiresAt) < new Date()) {
      await logFailedAttempt({
        endpoint,
        method,
        clientIp,
        reason: 'Expired API key',
        keyPrefix,
        statusCode: 401,
        responseTime: Date.now() - startTime,
        userAgent: req.headers['user-agent'] || null,
        apiKeyId: matchedKey.id,
        tenantId: matchedKey.tenantId
      });
      
      console.warn(`[SECURITY] Failed API key attempt from ${clientIp} - Expired key: ${matchedKey.keyName}`);
      
      return res.status(401).json({
        error: 'Expired API key',
        message: 'This API key has expired'
      });
    }

    console.log(`[API AUTH] Successful authentication - Key: ${matchedKey.keyName}, Tenant: ${matchedKey.tenantId}, IP: ${clientIp}`);
    
    (req as any).apiKey = matchedKey;
    (req as any).tenantId = matchedKey.tenantId;
    
    next();
  } catch (error) {
    console.error('[SECURITY] API key validation error:', error);
    
    await logFailedAttempt({
      endpoint,
      method,
      clientIp,
      reason: 'Internal server error during validation',
      keyPrefix: null,
      statusCode: 500,
      responseTime: Date.now() - startTime,
      userAgent: req.headers['user-agent'] || null
    });
    
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to validate API key'
    });
  }
}

/**
 * Check and apply rate limiting by IP address for failed authentication attempts
 * This prevents brute force attacks even when API keys are invalid
 * 
 * FIXED: Returns status instead of throwing to properly return 429 status code
 * Only increments counter for failed attempts, not successful authentications
 */
function checkIpRateLimit(ip: string): { allowed: boolean; count: number; resetTime: number } {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const limit = 100; // 100 failed attempts per hour per IP

  if (!ipRateLimitStore[ip]) {
    ipRateLimitStore[ip] = {
      count: 0,
      resetTime: now + windowMs
    };
  }

  const rateLimitData = ipRateLimitStore[ip];

  // Reset counter if window expired
  if (now > rateLimitData.resetTime) {
    rateLimitData.count = 0;
    rateLimitData.resetTime = now + windowMs;
  }

  // Check if limit exceeded BEFORE incrementing
  if (rateLimitData.count >= limit) {
    return {
      allowed: false,
      count: rateLimitData.count,
      resetTime: rateLimitData.resetTime
    };
  }

  // Increment counter for this failed attempt
  rateLimitData.count++;

  return {
    allowed: true,
    count: rateLimitData.count,
    resetTime: rateLimitData.resetTime
  };
}

/**
 * Log failed API key attempts for security monitoring
 * Creates audit trail entries in apiUsageLogs with status 401
 */
async function logFailedAttempt(details: {
  endpoint: string;
  method: string;
  clientIp: string;
  reason: string;
  keyPrefix: string | null;
  statusCode: number;
  responseTime: number;
  userAgent: string | null;
  apiKeyId?: string;
  tenantId?: string;
}): Promise<void> {
  try {
    const logEntry = {
      apiKeyId: details.apiKeyId || 'unknown',
      tenantId: details.tenantId || 'unknown',
      endpoint: details.endpoint,
      method: details.method,
      statusCode: details.statusCode,
      responseTime: details.responseTime,
      ipAddress: details.clientIp,
      userAgent: details.userAgent,
      errorMessage: `${details.reason}${details.keyPrefix ? ` (Key prefix: ${details.keyPrefix})` : ''}`
    };
    
    await storage.createApiUsageLog(logEntry);
    
    console.log(`[AUDIT] Failed API attempt logged:`, {
      timestamp: new Date().toISOString(),
      ip: details.clientIp,
      endpoint: details.endpoint,
      reason: details.reason,
      keyPrefix: details.keyPrefix
    });
  } catch (error) {
    console.error('[ERROR] Failed to log failed API attempt:', error);
  }
}

/**
 * Check if API key has required permissions for the endpoint
 */
export function requirePermission(...requiredPermissions: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const apiKey = (req as any).apiKey;
    
    if (!apiKey) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'API key authentication required'
      });
    }

    const permissions = apiKey.permissions as string[];
    if (permissions.includes('admin')) {
      return next();
    }

    const hasAllPermissions = requiredPermissions.every(perm => 
      permissions.includes(perm)
    );

    if (!hasAllPermissions) {
      const clientIp = getClientIp(req);
      console.warn(`[SECURITY] Permission denied for API key ${apiKey.keyName} from ${clientIp}`);
      
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `This API key lacks required permissions: ${requiredPermissions.join(', ')}`,
        required: requiredPermissions,
        granted: permissions
      });
    }

    next();
  };
}

/**
 * Rate limiting middleware for API keys
 */
export async function apiKeyRateLimit(req: Request, res: Response, next: NextFunction) {
  try {
    const apiKey = (req as any).apiKey;
    
    if (!apiKey) {
      return next();
    }

    const now = Date.now();
    const windowMs = 60 * 60 * 1000;
    const limit = apiKey.rateLimit || 1000;

    if (!rateLimitStore[apiKey.id]) {
      rateLimitStore[apiKey.id] = {
        count: 0,
        resetTime: now + windowMs
      };
    }

    const rateLimitData = rateLimitStore[apiKey.id];

    if (now > rateLimitData.resetTime) {
      rateLimitData.count = 0;
      rateLimitData.resetTime = now + windowMs;
    }

    rateLimitData.count++;

    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - rateLimitData.count));
    res.setHeader('X-RateLimit-Reset', rateLimitData.resetTime);

    if (rateLimitData.count > limit) {
      await storage.createApiUsageLog({
        apiKeyId: apiKey.id,
        tenantId: apiKey.tenantId,
        endpoint: req.path,
        method: req.method,
        statusCode: 429,
        responseTime: 0,
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent'] || null,
        errorMessage: 'Rate limit exceeded'
      });
      
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: `You have exceeded the rate limit of ${limit} requests per hour`,
        limit: limit,
        resetAt: new Date(rateLimitData.resetTime).toISOString()
      });
    }

    next();
  } catch (error) {
    console.error('Rate limiting error:', error);
    next();
  }
}

/**
 * Log API usage for analytics and billing
 */
export async function logApiUsage(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const apiKey = (req as any).apiKey;

  const originalSend = res.send;
  res.send = function(data: any): Response {
    res.send = originalSend;
    
    if (apiKey) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      storage.createApiUsageLog({
        apiKeyId: apiKey.id,
        tenantId: apiKey.tenantId,
        endpoint: req.path,
        method: req.method,
        statusCode: res.statusCode,
        responseTime: responseTime,
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent'] || null,
        errorMessage: res.statusCode >= 400 ? (data?.error || null) : null
      }).catch(err => {
        console.error('Failed to log API usage:', err);
      });
      
      storage.updateApiKeyLastUsed(apiKey.id).catch(err => {
        console.error('Failed to update API key last used:', err);
      });
    }
    
    return originalSend.call(this, data);
  };

  next();
}

/**
 * Combined middleware for API key authentication and logging
 */
export function apiKeyAuth(requiredPermissions?: string[]) {
  return [
    validateApiKey,
    ...(requiredPermissions ? [requirePermission(...requiredPermissions)] : []),
    apiKeyRateLimit,
    logApiUsage
  ];
}
