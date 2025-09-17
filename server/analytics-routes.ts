/**
 * NAVIMED ANALYTICS API ROUTES DESIGN
 * 
 * This file defines the analytics API endpoints that extend existing patterns
 * rather than duplicating them. All endpoints enforce tenant isolation and RBAC.
 * 
 * DESIGN PRINCIPLES:
 * - Extend existing `/api/admin/platform-stats` rather than duplicate
 * - Create tenant-scoped endpoints: `/api/analytics/tenant/:tenantId`
 * - Module-specific endpoints for role-based access
 * - Consistent query parameters and response formats
 * - Proper caching and performance optimization
 */

import { Express } from "express";
import { z } from "zod";
import { authenticateToken, requireRole } from "./middleware/auth";
import { setTenantContext, requireTenant } from "./middleware/tenant";
import { performanceCache } from "./performance-cache";
import { 
  AnalyticsQueryParams, 
  analyticsQuerySchema,
  AnalyticsResponse,
  AnalyticsCacheKey,
  TenantOperationalMetrics,
  TenantFinancialMetrics,
  TenantQualityMetrics,
  ReceptionistAnalytics,
  PharmacyAnalytics,
  LaboratoryAnalytics,
  HospitalAdminAnalytics,
  PlatformAnalytics
} from "./analytics-types";
import { AnalyticsService } from "./analytics-service";

// ================================
// ENDPOINT SPECIFICATIONS
// ================================

/**
 * ENHANCED PLATFORM STATS ENDPOINT
 * Extends existing /api/admin/platform-stats with additional metrics
 * 
 * Route: GET /api/admin/platform-stats
 * Access: super_admin only
 * Cache: 15 minutes
 * 
 * Query Parameters:
 * - from: ISO date string (optional)
 * - to: ISO date string (optional) 
 * - interval: 'hour' | 'day' | 'week' | 'month' | 'year' (default: 'day')
 * - detailed: boolean (default: false) - returns additional detailed metrics
 */
export const extendedPlatformStatsSpec = {
  method: "GET" as const,
  path: "/api/admin/platform-stats",
  roles: ["super_admin"],
  querySchema: analyticsQuerySchema.extend({
    detailed: z.boolean().default(false).describe("Include detailed metrics")
  }),
  responseType: "PlatformAnalytics" as const,
  cacheTime: 15 * 60, // 15 minutes
  description: "Enhanced platform-wide analytics for super admins"
};

/**
 * TENANT ANALYTICS ENDPOINT
 * Provides comprehensive tenant-level analytics
 * 
 * Route: GET /api/analytics/tenant/:tenantId
 * Access: tenant_admin, director (for their tenant only)
 * Cache: 5 minutes
 */
export const tenantAnalyticsSpec = {
  method: "GET" as const,
  path: "/api/analytics/tenant/:tenantId",
  roles: ["tenant_admin", "director"],
  querySchema: analyticsQuerySchema.extend({
    module: z.enum(['operational', 'financial', 'quality', 'all']).default('all')
  }),
  responseType: "TenantAnalytics" as const,
  cacheTime: 5 * 60, // 5 minutes
  description: "Comprehensive tenant-level analytics"
};

/**
 * RECEPTIONIST ANALYTICS ENDPOINT
 * Role-specific analytics for receptionists
 * 
 * Route: GET /api/analytics/receptionist
 * Access: receptionist, nurse, tenant_admin
 * Cache: 2 minutes (more frequent updates for real-time operations)
 */
export const receptionistAnalyticsSpec = {
  method: "GET" as const,
  path: "/api/analytics/receptionist",
  roles: ["receptionist", "nurse", "tenant_admin", "director"],
  querySchema: analyticsQuerySchema,
  responseType: "ReceptionistAnalytics" as const,
  cacheTime: 2 * 60, // 2 minutes
  description: "Real-time receptionist dashboard analytics"
};

/**
 * PHARMACY ANALYTICS ENDPOINT
 * Role-specific analytics for pharmacy operations
 * 
 * Route: GET /api/analytics/pharmacy
 * Access: pharmacist, tenant_admin
 * Cache: 3 minutes
 */
export const pharmacyAnalyticsSpec = {
  method: "GET" as const,
  path: "/api/analytics/pharmacy", 
  roles: ["pharmacist", "tenant_admin", "director"],
  querySchema: analyticsQuerySchema,
  responseType: "PharmacyAnalytics" as const,
  cacheTime: 3 * 60, // 3 minutes
  description: "Pharmacy operations and performance analytics"
};

/**
 * LABORATORY ANALYTICS ENDPOINT
 * Role-specific analytics for laboratory operations
 * 
 * Route: GET /api/analytics/laboratory
 * Access: lab_technician, tenant_admin
 * Cache: 3 minutes
 */
export const laboratoryAnalyticsSpec = {
  method: "GET" as const,
  path: "/api/analytics/laboratory",
  roles: ["lab_technician", "tenant_admin", "director"],
  querySchema: analyticsQuerySchema,
  responseType: "LaboratoryAnalytics" as const,
  cacheTime: 3 * 60, // 3 minutes
  description: "Laboratory operations and testing analytics"
};

/**
 * HOSPITAL ADMIN DASHBOARD ENDPOINT
 * Enhanced version of existing admin dashboard with analytics
 * 
 * Route: GET /api/analytics/admin
 * Access: tenant_admin, director
 * Cache: 5 minutes
 */
export const hospitalAdminAnalyticsSpec = {
  method: "GET" as const,
  path: "/api/analytics/admin",
  roles: ["tenant_admin", "director"],
  querySchema: analyticsQuerySchema,
  responseType: "HospitalAdminAnalytics" as const,
  cacheTime: 5 * 60, // 5 minutes
  description: "Comprehensive hospital administration analytics"
};

// ================================
// ROUTE REGISTRATION FUNCTION
// ================================

/**
 * Registers all analytics routes with the Express app
 * This function should be called from the main routes.ts file
 */
export function registerAnalyticsRoutes(app: Express): void {
  const analyticsService = new AnalyticsService();

  // ================================
  // ENHANCED PLATFORM STATS
  // ================================
  app.get('/api/admin/platform-stats', 
    authenticateToken, 
    requireRole(['super_admin']), 
    async (req, res) => {
      try {
        const queryParams = extendedPlatformStatsSpec.querySchema.parse(req.query);
        const cacheKey = AnalyticsCacheKey.platform('stats', queryParams);
        
        // Check cache first
        let cachedResult = performanceCache.get(cacheKey);
        if (cachedResult) {
          return res.json({
            success: true,
            data: cachedResult,
            metadata: {
              generatedAt: new Date().toISOString(),
              cacheHit: true,
              queryTime: 0
            }
          } as AnalyticsResponse<PlatformAnalytics>);
        }

        // Generate analytics
        const startTime = Date.now();
        const analytics = await analyticsService.getPlatformAnalytics(queryParams);
        const queryTime = Date.now() - startTime;

        // Cache the result
        performanceCache.set(cacheKey, analytics, extendedPlatformStatsSpec.cacheTime);

        res.json({
          success: true,
          data: analytics,
          metadata: {
            generatedAt: new Date().toISOString(),
            cacheHit: false,
            queryTime
          }
        } as AnalyticsResponse<PlatformAnalytics>);

      } catch (error) {
        console.error('Platform stats analytics error:', error);
        res.status(500).json({
          success: false,
          error: {
            code: 'ANALYTICS_ERROR',
            message: 'Failed to generate platform analytics'
          },
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
      }
    }
  );

  // ================================
  // TENANT ANALYTICS
  // ================================
  app.get('/api/analytics/tenant/:tenantId',
    authenticateToken,
    requireRole(['tenant_admin', 'director']),
    async (req, res) => {
      try {
        const { tenantId } = req.params;
        const user = req.user as any;
        
        // Enforce tenant isolation - users can only access their own tenant data
        if (user.role !== 'super_admin' && user.tenantId !== tenantId) {
          return res.status(403).json({
            success: false,
            error: {
              code: 'TENANT_ACCESS_DENIED',
              message: 'Access denied to tenant data'
            },
            metadata: {
              timestamp: new Date().toISOString(),
              requestId: req.headers['x-request-id'] || 'unknown'
            }
          });
        }

        const queryParams = tenantAnalyticsSpec.querySchema.parse(req.query);
        const cacheKey = AnalyticsCacheKey.tenant(tenantId, 'analytics', queryParams);
        
        // Check cache
        let cachedResult = performanceCache.get(cacheKey);
        if (cachedResult) {
          return res.json({
            success: true,
            data: cachedResult,
            metadata: {
              generatedAt: new Date().toISOString(),
              cacheHit: true,
              queryTime: 0
            }
          });
        }

        // Generate analytics
        const startTime = Date.now();
        const analytics = await analyticsService.getTenantAnalytics(tenantId, queryParams);
        const queryTime = Date.now() - startTime;

        // Cache result
        performanceCache.set(cacheKey, analytics, tenantAnalyticsSpec.cacheTime);

        res.json({
          success: true,
          data: analytics,
          metadata: {
            generatedAt: new Date().toISOString(),
            cacheHit: false,
            queryTime
          }
        });

      } catch (error) {
        console.error('Tenant analytics error:', error);
        res.status(500).json({
          success: false,
          error: {
            code: 'TENANT_ANALYTICS_ERROR',
            message: 'Failed to generate tenant analytics'
          },
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
      }
    }
  );

  // ================================
  // RECEPTIONIST ANALYTICS
  // ================================
  app.get('/api/analytics/receptionist',
    authenticateToken,
    requireTenant,
    requireRole(['receptionist', 'nurse', 'tenant_admin', 'director']),
    async (req, res) => {
      try {
        const user = req.user as any;
        const tenantId = user.tenantId;
        const queryParams = receptionistAnalyticsSpec.querySchema.parse(req.query);
        const cacheKey = AnalyticsCacheKey.tenant(tenantId, 'receptionist', queryParams);
        
        // Check cache
        let cachedResult = performanceCache.get(cacheKey);
        if (cachedResult) {
          return res.json({
            success: true,
            data: cachedResult,
            metadata: {
              generatedAt: new Date().toISOString(),
              cacheHit: true,
              queryTime: 0
            }
          } as AnalyticsResponse<ReceptionistAnalytics>);
        }

        // Generate analytics
        const startTime = Date.now();
        const analytics = await analyticsService.getReceptionistAnalytics(tenantId, queryParams);
        const queryTime = Date.now() - startTime;

        // Cache result
        performanceCache.set(cacheKey, analytics, receptionistAnalyticsSpec.cacheTime);

        res.json({
          success: true,
          data: analytics,
          metadata: {
            generatedAt: new Date().toISOString(),
            cacheHit: false,
            queryTime
          }
        } as AnalyticsResponse<ReceptionistAnalytics>);

      } catch (error) {
        console.error('Receptionist analytics error:', error);
        res.status(500).json({
          success: false,
          error: {
            code: 'RECEPTIONIST_ANALYTICS_ERROR',
            message: 'Failed to generate receptionist analytics'
          },
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
      }
    }
  );

  // ================================
  // PHARMACY ANALYTICS
  // ================================
  app.get('/api/analytics/pharmacy',
    authenticateToken,
    requireTenant,
    requireRole(['pharmacist', 'tenant_admin', 'director']),
    async (req, res) => {
      try {
        const user = req.user as any;
        const tenantId = user.tenantId;
        const queryParams = pharmacyAnalyticsSpec.querySchema.parse(req.query);
        const cacheKey = AnalyticsCacheKey.tenant(tenantId, 'pharmacy', queryParams);
        
        // Check cache
        let cachedResult = performanceCache.get(cacheKey);
        if (cachedResult) {
          return res.json({
            success: true,
            data: cachedResult,
            metadata: {
              generatedAt: new Date().toISOString(),
              cacheHit: true,
              queryTime: 0
            }
          } as AnalyticsResponse<PharmacyAnalytics>);
        }

        // Generate analytics
        const startTime = Date.now();
        const analytics = await analyticsService.getPharmacyAnalytics(tenantId, queryParams);
        const queryTime = Date.now() - startTime;

        // Cache result
        performanceCache.set(cacheKey, analytics, pharmacyAnalyticsSpec.cacheTime);

        res.json({
          success: true,
          data: analytics,
          metadata: {
            generatedAt: new Date().toISOString(),
            cacheHit: false,
            queryTime
          }
        } as AnalyticsResponse<PharmacyAnalytics>);

      } catch (error) {
        console.error('Pharmacy analytics error:', error);
        res.status(500).json({
          success: false,
          error: {
            code: 'PHARMACY_ANALYTICS_ERROR',
            message: 'Failed to generate pharmacy analytics'
          },
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
      }
    }
  );

  // ================================
  // LABORATORY ANALYTICS
  // ================================
  app.get('/api/analytics/laboratory',
    authenticateToken,
    requireTenant,
    requireRole(['lab_technician', 'tenant_admin', 'director']),
    async (req, res) => {
      try {
        const user = req.user as any;
        const tenantId = user.tenantId;
        const queryParams = laboratoryAnalyticsSpec.querySchema.parse(req.query);
        const cacheKey = AnalyticsCacheKey.tenant(tenantId, 'laboratory', queryParams);
        
        // Check cache
        let cachedResult = performanceCache.get(cacheKey);
        if (cachedResult) {
          return res.json({
            success: true,
            data: cachedResult,
            metadata: {
              generatedAt: new Date().toISOString(),
              cacheHit: true,
              queryTime: 0
            }
          } as AnalyticsResponse<LaboratoryAnalytics>);
        }

        // Generate analytics
        const startTime = Date.now();
        const analytics = await analyticsService.getLaboratoryAnalytics(tenantId, queryParams);
        const queryTime = Date.now() - startTime;

        // Cache result
        performanceCache.set(cacheKey, analytics, laboratoryAnalyticsSpec.cacheTime);

        res.json({
          success: true,
          data: analytics,
          metadata: {
            generatedAt: new Date().toISOString(),
            cacheHit: false,
            queryTime
          }
        } as AnalyticsResponse<LaboratoryAnalytics>);

      } catch (error) {
        console.error('Laboratory analytics error:', error);
        res.status(500).json({
          success: false,
          error: {
            code: 'LABORATORY_ANALYTICS_ERROR',
            message: 'Failed to generate laboratory analytics'
          },
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
      }
    }
  );

  // ================================
  // HOSPITAL ADMIN ANALYTICS
  // ================================
  app.get('/api/analytics/admin',
    authenticateToken,
    requireTenant,
    requireRole(['tenant_admin', 'director']),
    async (req, res) => {
      try {
        const user = req.user as any;
        const tenantId = user.tenantId;
        const queryParams = hospitalAdminAnalyticsSpec.querySchema.parse(req.query);
        const cacheKey = AnalyticsCacheKey.tenant(tenantId, 'admin', queryParams);
        
        // Check cache
        let cachedResult = performanceCache.get(cacheKey);
        if (cachedResult) {
          return res.json({
            success: true,
            data: cachedResult,
            metadata: {
              generatedAt: new Date().toISOString(),
              cacheHit: true,
              queryTime: 0
            }
          } as AnalyticsResponse<HospitalAdminAnalytics>);
        }

        // Generate analytics
        const startTime = Date.now();
        const analytics = await analyticsService.getHospitalAdminAnalytics(tenantId, queryParams);
        const queryTime = Date.now() - startTime;

        // Cache result
        performanceCache.set(cacheKey, analytics, hospitalAdminAnalyticsSpec.cacheTime);

        res.json({
          success: true,
          data: analytics,
          metadata: {
            generatedAt: new Date().toISOString(),
            cacheHit: false,
            queryTime
          }
        } as AnalyticsResponse<HospitalAdminAnalytics>);

      } catch (error) {
        console.error('Hospital admin analytics error:', error);
        res.status(500).json({
          success: false,
          error: {
            code: 'ADMIN_ANALYTICS_ERROR',
            message: 'Failed to generate admin analytics'
          },
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
      }
    }
  );

  console.log('✅ Analytics routes registered successfully');
}

// ================================
// ENDPOINT DOCUMENTATION EXPORT
// ================================

/**
 * Complete API specification for documentation
 */
export const analyticsApiSpec = {
  enhancedPlatformStats: extendedPlatformStatsSpec,
  tenantAnalytics: tenantAnalyticsSpec,
  receptionistAnalytics: receptionistAnalyticsSpec,
  pharmacyAnalytics: pharmacyAnalyticsSpec,
  laboratoryAnalytics: laboratoryAnalyticsSpec,
  hospitalAdminAnalytics: hospitalAdminAnalyticsSpec
};

/**
 * Query parameter examples for testing
 */
export const analyticsQueryExamples = {
  realtime: {},
  lastWeek: { 
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    to: new Date().toISOString(),
    interval: 'day' as const
  },
  lastMonth: {
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    to: new Date().toISOString(),
    interval: 'week' as const
  },
  yearToDate: {
    from: new Date(new Date().getFullYear(), 0, 1).toISOString(),
    to: new Date().toISOString(),
    interval: 'month' as const
  }
};