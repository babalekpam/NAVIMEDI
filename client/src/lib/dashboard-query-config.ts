/**
 * OPTIMIZED DASHBOARD QUERY CONFIGURATIONS
 * 
 * Centralized configuration for React Query optimization across
 * all dashboard components with intelligent polling strategies
 * based on operational requirements and data volatility.
 */

import { UseQueryOptions } from "@tanstack/react-query";

// ================================
// QUERY CONFIGURATION TYPES
// ================================

export interface DashboardQueryConfig {
  staleTime: number;
  refetchInterval: number | false;
  refetchIntervalInBackground: boolean;
  retry: number;
  refetchOnWindowFocus: boolean;
  refetchOnReconnect: boolean;
}

export interface ConditionalQueryConfig extends DashboardQueryConfig {
  enabled: boolean;
}

// ================================
// DASHBOARD-SPECIFIC CONFIGURATIONS
// ================================

/**
 * SUPER ADMIN DASHBOARD CONFIGURATION
 * - Platform-wide metrics with lower update frequency
 * - Comprehensive tenant and system analytics
 */
export const SUPER_ADMIN_QUERY_CONFIG: DashboardQueryConfig = {
  staleTime: 3 * 60 * 1000, // 3 minutes - platform metrics change less frequently
  refetchInterval: 5 * 60 * 1000, // 5 minutes - low frequency polling
  refetchIntervalInBackground: false, // Don't poll when tab inactive
  retry: 2, // Limited retries for platform queries
  refetchOnWindowFocus: true, // Refresh when user returns to tab
  refetchOnReconnect: true, // Refresh after network reconnection
};

/**
 * TENANT ADMIN DASHBOARD CONFIGURATION  
 * - Departmental and organizational metrics
 * - Moderate frequency for management-level insights
 */
export const ADMIN_QUERY_CONFIG: DashboardQueryConfig = {
  staleTime: 2 * 60 * 1000, // 2 minutes - departmental data changes moderately
  refetchInterval: 2 * 60 * 1000, // 2 minutes - moderate frequency polling
  refetchIntervalInBackground: false, // Don't poll when tab inactive
  retry: 3, // More retries for critical admin data
  refetchOnWindowFocus: true, // Refresh when returning to tab
  refetchOnReconnect: true, // Refresh after reconnection
};

/**
 * RECEPTIONIST DASHBOARD CONFIGURATION
 * - High-frequency updates for real-time operations
 * - Critical for patient flow and scheduling
 */
export const RECEPTIONIST_QUERY_CONFIG: DashboardQueryConfig = {
  staleTime: 30 * 1000, // 30 seconds - appointment data changes frequently
  refetchInterval: 20 * 1000, // 20 seconds - high frequency for real-time needs
  refetchIntervalInBackground: false, // Don't poll when tab inactive
  retry: 3, // Robust retries for operational data
  refetchOnWindowFocus: true, // Immediate refresh when returning
  refetchOnReconnect: true, // Critical to refresh after network issues
};

/**
 * PHARMACY DASHBOARD CONFIGURATION
 * - Prescription workflow and inventory updates
 * - Moderate-high frequency for operational efficiency
 */
export const PHARMACY_QUERY_CONFIG: DashboardQueryConfig = {
  staleTime: 60 * 1000, // 1 minute - prescription status changes regularly
  refetchInterval: 45 * 1000, // 45 seconds - balanced frequency
  refetchIntervalInBackground: false, // Don't poll when tab inactive
  retry: 3, // Important for medication management
  refetchOnWindowFocus: true, // Refresh on return
  refetchOnReconnect: true, // Critical after network reconnection
};

/**
 * LABORATORY DASHBOARD CONFIGURATION
 * - Test processing and quality control metrics
 * - Moderate frequency for lab operations
 */
export const LABORATORY_QUERY_CONFIG: DashboardQueryConfig = {
  staleTime: 60 * 1000, // 1 minute - test status changes regularly
  refetchInterval: 45 * 1000, // 45 seconds - lab processing needs timely updates
  refetchIntervalInBackground: false, // Don't poll when tab inactive
  retry: 3, // Important for test result accuracy
  refetchOnWindowFocus: true, // Refresh when returning to lab dashboard
  refetchOnReconnect: true, // Critical after network issues
};

// ================================
// SPECIALIZED QUERY CONFIGURATIONS
// ================================

/**
 * HIGH PRIORITY QUERY CONFIGURATION
 * For critical real-time operations (e.g., emergency appointments)
 */
export const HIGH_PRIORITY_QUERY_CONFIG: DashboardQueryConfig = {
  staleTime: 15 * 1000, // 15 seconds
  refetchInterval: 15 * 1000, // 15 seconds - very high frequency
  refetchIntervalInBackground: true, // Keep polling even in background for critical data
  retry: 5, // Maximum retries for critical operations
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
};

/**
 * LOW PRIORITY QUERY CONFIGURATION
 * For less critical data (e.g., historical reports, settings)
 */
export const LOW_PRIORITY_QUERY_CONFIG: DashboardQueryConfig = {
  staleTime: 10 * 60 * 1000, // 10 minutes
  refetchInterval: false, // No automatic polling
  refetchIntervalInBackground: false,
  retry: 1, // Minimal retries
  refetchOnWindowFocus: false, // Don't refresh on focus
  refetchOnReconnect: false, // Don't refresh on reconnect
};

/**
 * BACKGROUND SYNC QUERY CONFIGURATION
 * For data that needs to stay fresh but isn't immediately visible
 */
export const BACKGROUND_SYNC_QUERY_CONFIG: DashboardQueryConfig = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  refetchInterval: 3 * 60 * 1000, // 3 minutes
  refetchIntervalInBackground: true, // Continue syncing in background
  retry: 2,
  refetchOnWindowFocus: false, // Don't interrupt user with refresh
  refetchOnReconnect: true,
};

// ================================
// CONFIGURATION HELPERS
// ================================

/**
 * Get optimized query configuration based on dashboard type and data priority
 */
export function getDashboardQueryConfig(
  dashboardType: 'super_admin' | 'admin' | 'receptionist' | 'pharmacy' | 'laboratory',
  priority: 'high' | 'normal' | 'low' = 'normal'
): DashboardQueryConfig {
  
  // Get base configuration for dashboard type
  let baseConfig: DashboardQueryConfig;
  
  switch (dashboardType) {
    case 'super_admin':
      baseConfig = SUPER_ADMIN_QUERY_CONFIG;
      break;
    case 'admin':
      baseConfig = ADMIN_QUERY_CONFIG;
      break;
    case 'receptionist':
      baseConfig = RECEPTIONIST_QUERY_CONFIG;
      break;
    case 'pharmacy':
      baseConfig = PHARMACY_QUERY_CONFIG;
      break;
    case 'laboratory':
      baseConfig = LABORATORY_QUERY_CONFIG;
      break;
    default:
      baseConfig = ADMIN_QUERY_CONFIG; // Default fallback
  }
  
  // Modify based on priority
  if (priority === 'high') {
    return {
      ...baseConfig,
      staleTime: Math.min(baseConfig.staleTime, HIGH_PRIORITY_QUERY_CONFIG.staleTime),
      refetchInterval: baseConfig.refetchInterval === false ? 
        HIGH_PRIORITY_QUERY_CONFIG.refetchInterval : 
        Math.min(baseConfig.refetchInterval as number, HIGH_PRIORITY_QUERY_CONFIG.refetchInterval as number),
      retry: Math.max(baseConfig.retry, HIGH_PRIORITY_QUERY_CONFIG.retry),
    };
  } else if (priority === 'low') {
    return {
      ...baseConfig,
      staleTime: Math.max(baseConfig.staleTime, LOW_PRIORITY_QUERY_CONFIG.staleTime),
      refetchInterval: LOW_PRIORITY_QUERY_CONFIG.refetchInterval,
      retry: Math.min(baseConfig.retry, LOW_PRIORITY_QUERY_CONFIG.retry),
      refetchOnWindowFocus: false,
    };
  }
  
  return baseConfig;
}

/**
 * Create conditional query configuration with enabled flag
 */
export function createConditionalQueryConfig(
  baseConfig: DashboardQueryConfig,
  enabled: boolean
): ConditionalQueryConfig {
  return {
    ...baseConfig,
    enabled,
  };
}

/**
 * Create React Query options from dashboard configuration
 */
export function createQueryOptions<TData = unknown>(
  queryKey: any[],
  config: DashboardQueryConfig,
  enabled?: boolean
): UseQueryOptions<TData> {
  return {
    queryKey,
    staleTime: config.staleTime,
    refetchInterval: config.refetchInterval,
    refetchIntervalInBackground: config.refetchIntervalInBackground,
    retry: config.retry,
    refetchOnWindowFocus: config.refetchOnWindowFocus,
    refetchOnReconnect: config.refetchOnReconnect,
    enabled: enabled !== undefined ? enabled : true,
  };
}

// ================================
// ADAPTIVE CONFIGURATION
// ================================

/**
 * Create adaptive query configuration based on user activity and network conditions
 */
export function createAdaptiveQueryConfig(
  baseConfig: DashboardQueryConfig,
  options: {
    isUserActive?: boolean;
    networkQuality?: 'fast' | 'slow' | 'offline';
    batteryLevel?: 'high' | 'low';
    dataUsageSensitive?: boolean;
  } = {}
): DashboardQueryConfig {
  const {
    isUserActive = true,
    networkQuality = 'fast',
    batteryLevel = 'high',
    dataUsageSensitive = false,
  } = options;
  
  let adaptedConfig = { ...baseConfig };
  
  // Reduce polling frequency if user is inactive
  if (!isUserActive && adaptedConfig.refetchInterval !== false) {
    adaptedConfig.refetchInterval = Math.min(
      (adaptedConfig.refetchInterval as number) * 2,
      5 * 60 * 1000 // Max 5 minutes
    );
    adaptedConfig.refetchIntervalInBackground = false;
  }
  
  // Adjust for network quality
  if (networkQuality === 'slow') {
    adaptedConfig.staleTime = adaptedConfig.staleTime * 1.5;
    if (adaptedConfig.refetchInterval !== false) {
      adaptedConfig.refetchInterval = (adaptedConfig.refetchInterval as number) * 1.5;
    }
    adaptedConfig.retry = Math.max(adaptedConfig.retry - 1, 1);
  } else if (networkQuality === 'offline') {
    adaptedConfig.refetchInterval = false;
    adaptedConfig.refetchOnWindowFocus = false;
    adaptedConfig.refetchOnReconnect = true;
    adaptedConfig.retry = 0;
  }
  
  // Reduce frequency on low battery
  if (batteryLevel === 'low') {
    if (adaptedConfig.refetchInterval !== false) {
      adaptedConfig.refetchInterval = Math.max(
        (adaptedConfig.refetchInterval as number) * 2,
        60 * 1000 // Min 1 minute
      );
    }
    adaptedConfig.refetchIntervalInBackground = false;
  }
  
  // Reduce frequency for data-sensitive users
  if (dataUsageSensitive) {
    adaptedConfig.staleTime = adaptedConfig.staleTime * 2;
    if (adaptedConfig.refetchInterval !== false) {
      adaptedConfig.refetchInterval = (adaptedConfig.refetchInterval as number) * 2;
    }
    adaptedConfig.refetchOnWindowFocus = false;
  }
  
  return adaptedConfig;
}

// ================================
// QUERY KEY HELPERS
// ================================

/**
 * Standard query keys for analytics endpoints
 */
export const ANALYTICS_QUERY_KEYS = {
  superAdmin: () => ['/api/admin/platform-stats'] as const,
  admin: (tenantId?: string) => tenantId ? 
    ['/api/analytics/admin', { tenantId }] as const : 
    ['/api/analytics/admin'] as const,
  receptionist: (tenantId?: string) => tenantId ? 
    ['/api/analytics/receptionist', { tenantId }] as const : 
    ['/api/analytics/receptionist'] as const,
  pharmacy: (tenantId?: string) => tenantId ? 
    ['/api/analytics/pharmacy', { tenantId }] as const : 
    ['/api/analytics/pharmacy'] as const,
  laboratory: (tenantId?: string) => tenantId ? 
    ['/api/analytics/laboratory', { tenantId }] as const : 
    ['/api/analytics/laboratory'] as const,
  tenant: (tenantId: string, module?: string) => module ? 
    ['/api/analytics/tenant', tenantId, { module }] as const : 
    ['/api/analytics/tenant', tenantId] as const,
} as const;

// ================================
// PERFORMANCE MONITORING
// ================================

/**
 * Configuration for monitoring query performance and adjusting settings
 */
export const PERFORMANCE_MONITORING = {
  slowQueryThreshold: 2000, // 2 seconds
  failureRateThreshold: 0.1, // 10% failure rate
  adaptiveAdjustmentEnabled: true,
  metricsCollectionInterval: 30000, // 30 seconds
} as const;

export interface QueryPerformanceMetrics {
  queryKey: string;
  averageResponseTime: number;
  failureRate: number;
  lastSuccessfulFetch: Date;
  consecutiveFailures: number;
}

/**
 * Monitor and log query performance for optimization
 */
export function logQueryPerformance(
  queryKey: string,
  responseTime: number,
  success: boolean
): void {
  // Implementation would store metrics and adjust configurations
  // This is a placeholder for future performance optimization
  console.log(`Query Performance: ${queryKey} - ${responseTime}ms - ${success ? 'success' : 'failure'}`);
}