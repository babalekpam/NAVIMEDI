/**
 * NAVIMED ANALYTICS CACHE INVALIDATION HOOKS
 * 
 * This file provides automatic cache invalidation when data changes.
 * Hooks are designed to be easily integrated into existing routes
 * without breaking current functionality.
 * 
 * DESIGN PRINCIPLES:
 * - Non-intrusive: Can be added to existing routes without modifications
 * - Granular: Invalidates only affected cache keys
 * - Tenant-aware: Respects tenant isolation boundaries
 * - Performance-optimized: Minimal overhead on data operations
 */

import { performanceCache } from "./performance-cache";
import { AnalyticsService } from "./analytics-service";

// ================================
// CACHE KEY PATTERNS
// ================================

/**
 * Cache key patterns for different data types
 * Used to invalidate specific analytics caches when data changes
 */
export const CACHE_PATTERNS = {
  // Appointment-related caches
  appointments: (tenantId: string) => [
    `appointments:volume:${tenantId}`,
    `appointments:status:${tenantId}`,
    `appointments:today:${tenantId}`,
    `appointments:hourly:${tenantId}`,
    `analytics:tenant:${tenantId}:receptionist`,
    `analytics:tenant:${tenantId}:operational`,
    `analytics:tenant:${tenantId}:admin`
  ],
  
  // Prescription-related caches
  prescriptions: (tenantId: string) => [
    `prescriptions:volume:${tenantId}`,
    `prescriptions:status:${tenantId}`,
    `prescriptions:workflow:${tenantId}`,
    `analytics:tenant:${tenantId}:pharmacy`,
    `analytics:tenant:${tenantId}:operational`,
    `analytics:tenant:${tenantId}:admin`
  ],
  
  // Lab order-related caches
  labOrders: (tenantId: string) => [
    `lab:volume:${tenantId}`,
    `lab:status:${tenantId}`,
    `lab:processing:${tenantId}`,
    `lab:testTypes:${tenantId}`,
    `analytics:tenant:${tenantId}:laboratory`,
    `analytics:tenant:${tenantId}:operational`,
    `analytics:tenant:${tenantId}:admin`
  ],
  
  // Patient-related caches
  patients: (tenantId: string) => [
    `patients:volume:${tenantId}`,
    `patients:demographics:${tenantId}`,
    `analytics:tenant:${tenantId}:operational`,
    `analytics:tenant:${tenantId}:receptionist`,
    `analytics:tenant:${tenantId}:admin`
  ],
  
  // User-related caches (affects multiple analytics)
  users: (tenantId: string) => [
    `users:activity:${tenantId}`,
    `users:roles:${tenantId}`,
    `analytics:tenant:${tenantId}:operational`,
    `analytics:tenant:${tenantId}:admin`,
    `analytics:platform` // Platform-level user stats
  ],
  
  // Tenant-related caches (affects platform analytics)
  tenants: () => [
    `analytics:platform`,
    `tenants:growth`
  ],
  
  // Financial data caches
  billing: (tenantId: string) => [
    `revenue:${tenantId}`,
    `billing:summary:${tenantId}`,
    `analytics:tenant:${tenantId}:financial`,
    `analytics:tenant:${tenantId}:admin`
  ]
};

// ================================
// CACHE INVALIDATION FUNCTIONS
// ================================

/**
 * Core cache invalidation function
 * Invalidates multiple cache patterns efficiently
 */
function invalidateCachePatterns(patterns: string[]): void {
  patterns.forEach(pattern => {
    performanceCache.clear(pattern);
  });
}

/**
 * Appointment data change hook
 */
export function invalidateAppointmentCache(tenantId: string): void {
  console.log(`🧹 Invalidating appointment cache for tenant ${tenantId}`);
  const patterns = CACHE_PATTERNS.appointments(tenantId);
  invalidateCachePatterns(patterns);
}

/**
 * Prescription data change hook
 */
export function invalidatePrescriptionCache(tenantId: string): void {
  console.log(`🧹 Invalidating prescription cache for tenant ${tenantId}`);
  const patterns = CACHE_PATTERNS.prescriptions(tenantId);
  invalidateCachePatterns(patterns);
}

/**
 * Lab order data change hook
 */
export function invalidateLabOrderCache(tenantId: string): void {
  console.log(`🧹 Invalidating lab order cache for tenant ${tenantId}`);
  const patterns = CACHE_PATTERNS.labOrders(tenantId);
  invalidateCachePatterns(patterns);
}

/**
 * Patient data change hook
 */
export function invalidatePatientCache(tenantId: string): void {
  console.log(`🧹 Invalidating patient cache for tenant ${tenantId}`);
  const patterns = CACHE_PATTERNS.patients(tenantId);
  invalidateCachePatterns(patterns);
}

/**
 * User data change hook
 */
export function invalidateUserCache(tenantId: string): void {
  console.log(`🧹 Invalidating user cache for tenant ${tenantId}`);
  const patterns = CACHE_PATTERNS.users(tenantId);
  invalidateCachePatterns(patterns);
}

/**
 * Tenant data change hook (affects platform analytics)
 */
export function invalidateTenantCache(): void {
  console.log(`🧹 Invalidating tenant cache (platform-level)`);
  const patterns = CACHE_PATTERNS.tenants();
  invalidateCachePatterns(patterns);
}

/**
 * Billing/Financial data change hook
 */
export function invalidateBillingCache(tenantId: string): void {
  console.log(`🧹 Invalidating billing cache for tenant ${tenantId}`);
  const patterns = CACHE_PATTERNS.billing(tenantId);
  invalidateCachePatterns(patterns);
}

// ================================
// MIDDLEWARE INTEGRATION
// ================================

/**
 * Express middleware factory for automatic cache invalidation
 * Can be added to existing routes without breaking functionality
 */
export function createCacheInvalidationMiddleware(
  dataType: keyof typeof CACHE_PATTERNS,
  getTenantId?: (req: any) => string
) {
  return (req: any, res: any, next: any) => {
    // Store original response methods to hook into successful operations
    const originalSend = res.send;
    const originalJson = res.json;
    
    // Override response methods to trigger cache invalidation on success
    res.send = function(body: any) {
      // Only invalidate cache on successful responses (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          let tenantId: string;
          
          if (getTenantId) {
            tenantId = getTenantId(req);
          } else {
            // Default: extract tenant ID from user context
            tenantId = req.user?.tenantId;
          }
          
          if (tenantId && dataType in CACHE_PATTERNS) {
            // Call appropriate invalidation function
            switch (dataType) {
              case 'appointments':
                invalidateAppointmentCache(tenantId);
                break;
              case 'prescriptions':
                invalidatePrescriptionCache(tenantId);
                break;
              case 'labOrders':
                invalidateLabOrderCache(tenantId);
                break;
              case 'patients':
                invalidatePatientCache(tenantId);
                break;
              case 'users':
                invalidateUserCache(tenantId);
                break;
              case 'billing':
                invalidateBillingCache(tenantId);
                break;
              case 'tenants':
                invalidateTenantCache();
                break;
            }
          }
        } catch (error) {
          // Log error but don't fail the response
          console.error('Cache invalidation error:', error);
        }
      }
      
      // Call original send method
      return originalSend.call(this, body);
    };
    
    res.json = function(body: any) {
      // Only invalidate cache on successful responses (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          let tenantId: string;
          
          if (getTenantId) {
            tenantId = getTenantId(req);
          } else {
            // Default: extract tenant ID from user context
            tenantId = req.user?.tenantId;
          }
          
          if (tenantId && dataType in CACHE_PATTERNS) {
            // Call appropriate invalidation function
            switch (dataType) {
              case 'appointments':
                invalidateAppointmentCache(tenantId);
                break;
              case 'prescriptions':
                invalidatePrescriptionCache(tenantId);
                break;
              case 'labOrders':
                invalidateLabOrderCache(tenantId);
                break;
              case 'patients':
                invalidatePatientCache(tenantId);
                break;
              case 'users':
                invalidateUserCache(tenantId);
                break;
              case 'billing':
                invalidateBillingCache(tenantId);
                break;
              case 'tenants':
                invalidateTenantCache();
                break;
            }
          }
        } catch (error) {
          // Log error but don't fail the response
          console.error('Cache invalidation error:', error);
        }
      }
      
      // Call original json method
      return originalJson.call(this, body);
    };
    
    next();
  };
}

// ================================
// CONVENIENCE MIDDLEWARE EXPORTS
// ================================

/**
 * Ready-to-use middleware for common data operations
 */
export const cacheInvalidationMiddleware = {
  appointments: createCacheInvalidationMiddleware('appointments'),
  prescriptions: createCacheInvalidationMiddleware('prescriptions'),
  labOrders: createCacheInvalidationMiddleware('labOrders'),
  patients: createCacheInvalidationMiddleware('patients'),
  users: createCacheInvalidationMiddleware('users'),
  billing: createCacheInvalidationMiddleware('billing'),
  tenants: createCacheInvalidationMiddleware('tenants')
};

// ================================
// MANUAL INVALIDATION UTILITIES
// ================================

/**
 * Manual cache invalidation for custom scenarios
 */
export const CacheInvalidation = {
  /**
   * Invalidate all caches for a specific tenant
   */
  invalidateAllForTenant(tenantId: string): void {
    console.log(`🧹 Invalidating ALL analytics cache for tenant ${tenantId}`);
    AnalyticsService.invalidateTenantCache(tenantId);
  },
  
  /**
   * Invalidate platform-wide caches
   */
  invalidatePlatform(): void {
    console.log(`🧹 Invalidating ALL platform analytics cache`);
    AnalyticsService.invalidatePlatformCache();
  },
  
  /**
   * Invalidate specific analytics module for a tenant
   */
  invalidateModule(tenantId: string, module: 'operational' | 'financial' | 'receptionist' | 'pharmacy' | 'laboratory' | 'admin'): void {
    console.log(`🧹 Invalidating ${module} analytics cache for tenant ${tenantId}`);
    performanceCache.clear(`analytics:tenant:${tenantId}:${module}`);
  },
  
  /**
   * Health check: Clear all expired cache entries
   */
  cleanup(): void {
    console.log(`🧹 Running analytics cache cleanup...`);
    // Performance cache handles its own cleanup, but we can trigger it manually
    performanceCache.cleanup();
  }
};

// Note: Functions are already exported above, no need to re-export