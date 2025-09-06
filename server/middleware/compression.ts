import { Request, Response, NextFunction } from 'express';

/**
 * COMPRESSION MITIGATION FOR BREACH VULNERABILITY
 * 
 * This middleware provides granular control over HTTP compression
 * to prevent BREACH attacks while maintaining performance for non-sensitive content
 */

// Sensitive endpoints that should never be compressed
const SENSITIVE_ENDPOINTS = [
  '/api/auth',
  '/api/patients',
  '/api/prescriptions',
  '/api/billing',
  '/api/lab-orders',
  '/api/lab-results',
  '/api/admin',
  '/api/platform'
];

// Headers that indicate sensitive data
const SENSITIVE_HEADERS = [
  'authorization',
  'x-auth-token',
  'x-api-key',
  'cookie'
];

export const compressionControl = (req: Request, res: Response, next: NextFunction) => {
  // Check if this is a sensitive endpoint
  const isSensitiveEndpoint = SENSITIVE_ENDPOINTS.some(endpoint => 
    req.path.startsWith(endpoint)
  );
  
  // Check if request contains sensitive headers
  const hasSensitiveHeaders = SENSITIVE_HEADERS.some(header => 
    req.headers[header]
  );
  
  // Check if this is a POST/PUT/PATCH request with body (potentially sensitive)
  const hasPotentiallySensitiveBody = ['POST', 'PUT', 'PATCH'].includes(req.method);
  
  // Disable compression for sensitive content
  if (isSensitiveEndpoint || hasSensitiveHeaders || hasPotentiallySensitiveBody) {
    // Explicitly disable compression
    res.setHeader('Content-Encoding', 'identity');
    res.removeHeader('Content-Encoding');
    
    // Set cache control to prevent caching of sensitive content
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    console.log(`🔒 Compression disabled for sensitive endpoint: ${req.path}`);
  }
  
  next();
};

// Middleware to add anti-compression noise to responses
export const antiCompressionNoise = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;
  
  res.json = function(data: any) {
    // Add random noise to break compression patterns for sensitive endpoints
    const isSensitive = SENSITIVE_ENDPOINTS.some(endpoint => 
      req.path.startsWith(endpoint)
    );
    
    if (isSensitive && data && typeof data === 'object') {
      // Add random padding to prevent compression-based pattern analysis
      const randomPadding = Array.from({length: Math.floor(Math.random() * 10) + 5}, () => 
        Math.random().toString(36).substring(7)
      ).join('');
      
      data._security_noise = randomPadding;
      data._timestamp = Date.now();
      data._entropy = Math.random();
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

export const compressionMitigation = {
  control: compressionControl,
  antiNoise: antiCompressionNoise
};