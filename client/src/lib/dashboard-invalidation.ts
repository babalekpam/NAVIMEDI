/**
 * DASHBOARD CACHE INVALIDATION SERVICE
 * 
 * Centralized service for coordinating real-time dashboard updates
 * through intelligent React Query cache invalidation patterns.
 * 
 * This service maps different types of operations to their relevant
 * dashboard caches, ensuring updates propagate to all affected views
 * while respecting tenant isolation.
 */

import { QueryClient } from "@tanstack/react-query";
import { queryClient } from "./queryClient";

// ================================
// OPERATION TYPES AND CACHE MAPPINGS
// ================================

/**
 * Maps operation types to the dashboard analytics endpoints they affect
 */
const DASHBOARD_CACHE_MAPPINGS = {
  // Patient operations affect multiple dashboards
  patient: {
    create: ['/api/analytics/receptionist', '/api/analytics/admin', '/api/analytics/tenant'],
    update: ['/api/analytics/receptionist', '/api/analytics/admin', '/api/analytics/tenant'],
    delete: ['/api/analytics/receptionist', '/api/analytics/admin', '/api/analytics/tenant']
  },
  
  // Appointment operations affect reception and admin dashboards
  appointment: {
    create: ['/api/analytics/receptionist', '/api/analytics/admin', '/api/analytics/tenant'],
    update: ['/api/analytics/receptionist', '/api/analytics/admin', '/api/analytics/tenant'],
    statusChange: ['/api/analytics/receptionist', '/api/analytics/admin', '/api/analytics/tenant'],
    cancel: ['/api/analytics/receptionist', '/api/analytics/admin', '/api/analytics/tenant']
  },
  
  // Prescription operations affect pharmacy and admin dashboards
  prescription: {
    create: ['/api/analytics/pharmacy', '/api/analytics/admin', '/api/analytics/tenant'],
    update: ['/api/analytics/pharmacy', '/api/analytics/admin', '/api/analytics/tenant'],
    statusChange: ['/api/analytics/pharmacy', '/api/analytics/admin', '/api/analytics/tenant'],
    route: ['/api/analytics/pharmacy', '/api/analytics/admin', '/api/analytics/tenant'],
    dispense: ['/api/analytics/pharmacy', '/api/analytics/admin', '/api/analytics/tenant']
  },
  
  // Lab order operations affect laboratory and admin dashboards
  labOrder: {
    create: ['/api/analytics/laboratory', '/api/analytics/admin', '/api/analytics/tenant'],
    update: ['/api/analytics/laboratory', '/api/analytics/admin', '/api/analytics/tenant'],
    statusChange: ['/api/analytics/laboratory', '/api/analytics/admin', '/api/analytics/tenant'],
    complete: ['/api/analytics/laboratory', '/api/analytics/admin', '/api/analytics/tenant'],
    result: ['/api/analytics/laboratory', '/api/analytics/admin', '/api/analytics/tenant']
  },
  
  // Billing operations affect multiple dashboards
  billing: {
    create: ['/api/analytics/admin', '/api/analytics/tenant', '/api/analytics/receptionist'],
    update: ['/api/analytics/admin', '/api/analytics/tenant', '/api/analytics/receptionist'],
    payment: ['/api/analytics/admin', '/api/analytics/tenant', '/api/analytics/receptionist'],
    insurance: ['/api/analytics/admin', '/api/analytics/tenant']
  },
  
  // User and tenant operations affect admin dashboards
  user: {
    create: ['/api/analytics/admin', '/api/admin/platform-stats'],
    update: ['/api/analytics/admin', '/api/admin/platform-stats'],
    roleChange: ['/api/analytics/admin', '/api/admin/platform-stats']
  },
  
  // Inventory operations affect pharmacy dashboards
  inventory: {
    update: ['/api/analytics/pharmacy'],
    reorder: ['/api/analytics/pharmacy'],
    receive: ['/api/analytics/pharmacy']
  }
} as const;

// ================================
// INVALIDATION FREQUENCIES
// ================================

/**
 * Different update frequencies for different types of operations
 * based on their impact and urgency
 */
const INVALIDATION_PRIORITIES = {
  immediate: ['appointment', 'prescription', 'labOrder'], // Real-time critical operations
  frequent: ['patient', 'billing'], // Important but not critical
  moderate: ['user', 'inventory'], // Less frequent updates needed
} as const;

// ================================
// CORE INVALIDATION SERVICE
// ================================

export class DashboardInvalidationService {
  private queryClient: QueryClient;
  
  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
  }
  
  /**
   * Invalidate caches for a specific operation type and action
   */
  async invalidateOperation(
    operationType: keyof typeof DASHBOARD_CACHE_MAPPINGS,
    action: string,
    tenantId?: string,
    additionalContext?: Record<string, any>
  ): Promise<void> {
    try {
      const mapping = DASHBOARD_CACHE_MAPPINGS[operationType];
      const endpoints = mapping[action as keyof typeof mapping] || [];
      
      console.log(`🔄 Invalidating ${operationType}.${action} for tenant ${tenantId}:`, endpoints);
      
      // Invalidate all affected dashboard caches
      const invalidationPromises = endpoints.map(endpoint => {
        // Create tenant-specific query keys if tenantId is provided
        const queryKey = tenantId && endpoint.includes('tenant') ? 
          [endpoint, { tenantId }] : 
          [endpoint];
          
        return this.queryClient.invalidateQueries({ queryKey });
      });
      
      // Wait for all invalidations to complete
      await Promise.all(invalidationPromises);
      
      // Log successful invalidation
      console.log(`✅ Cache invalidation completed for ${operationType}.${action}`);
      
    } catch (error) {
      console.error(`❌ Cache invalidation failed for ${operationType}.${action}:`, error);
      // Don't throw to avoid breaking the main operation
    }
  }
  
  /**
   * Invalidate specific dashboard cache with optional tenant context
   */
  async invalidateDashboard(
    dashboard: 'receptionist' | 'pharmacy' | 'laboratory' | 'admin' | 'superAdmin',
    tenantId?: string
  ): Promise<void> {
    try {
      const endpointMap = {
        receptionist: '/api/analytics/receptionist',
        pharmacy: '/api/analytics/pharmacy', 
        laboratory: '/api/analytics/laboratory',
        admin: '/api/analytics/admin',
        superAdmin: '/api/admin/platform-stats'
      };
      
      const endpoint = endpointMap[dashboard];
      const queryKey = tenantId && dashboard !== 'superAdmin' ? 
        [endpoint, { tenantId }] : 
        [endpoint];
      
      console.log(`🔄 Invalidating ${dashboard} dashboard for tenant ${tenantId}`);
      await this.queryClient.invalidateQueries({ queryKey });
      console.log(`✅ ${dashboard} dashboard invalidation completed`);
      
    } catch (error) {
      console.error(`❌ Dashboard invalidation failed for ${dashboard}:`, error);
    }
  }
  
  /**
   * Invalidate all tenant-related caches
   */
  async invalidateAllForTenant(tenantId: string): Promise<void> {
    try {
      console.log(`🔄 Invalidating ALL dashboard caches for tenant ${tenantId}`);
      
      const endpoints = [
        '/api/analytics/receptionist',
        '/api/analytics/pharmacy',
        '/api/analytics/laboratory', 
        '/api/analytics/admin',
        '/api/analytics/tenant'
      ];
      
      const invalidationPromises = endpoints.map(endpoint => {
        return this.queryClient.invalidateQueries({ 
          queryKey: [endpoint, { tenantId }] 
        });
      });
      
      await Promise.all(invalidationPromises);
      console.log(`✅ All tenant caches invalidated for ${tenantId}`);
      
    } catch (error) {
      console.error(`❌ Tenant cache invalidation failed for ${tenantId}:`, error);
    }
  }
  
  /**
   * Invalidate platform-wide caches (super admin)
   */
  async invalidatePlatform(): Promise<void> {
    try {
      console.log('🔄 Invalidating platform-wide caches');
      
      await this.queryClient.invalidateQueries({ 
        queryKey: ['/api/admin/platform-stats'] 
      });
      
      console.log('✅ Platform cache invalidation completed');
      
    } catch (error) {
      console.error('❌ Platform cache invalidation failed:', error);
    }
  }
  
  /**
   * Smart invalidation that considers operation priority and affected dashboards
   */
  async smartInvalidation(
    operations: Array<{
      type: keyof typeof DASHBOARD_CACHE_MAPPINGS;
      action: string;
      tenantId?: string;
      context?: Record<string, any>;
    }>
  ): Promise<void> {
    try {
      // Group operations by priority
      const immediateOps = operations.filter(op => 
        INVALIDATION_PRIORITIES.immediate.includes(op.type)
      );
      const frequentOps = operations.filter(op => 
        INVALIDATION_PRIORITIES.frequent.includes(op.type)
      );
      const moderateOps = operations.filter(op => 
        INVALIDATION_PRIORITIES.moderate.includes(op.type)
      );
      
      // Process immediate operations first
      if (immediateOps.length > 0) {
        const immediatePromises = immediateOps.map(op => 
          this.invalidateOperation(op.type, op.action, op.tenantId, op.context)
        );
        await Promise.all(immediatePromises);
      }
      
      // Process frequent operations
      if (frequentOps.length > 0) {
        const frequentPromises = frequentOps.map(op => 
          this.invalidateOperation(op.type, op.action, op.tenantId, op.context)
        );
        await Promise.all(frequentPromises);
      }
      
      // Process moderate priority operations last
      if (moderateOps.length > 0) {
        const moderatePromises = moderateOps.map(op => 
          this.invalidateOperation(op.type, op.action, op.tenantId, op.context)
        );
        await Promise.all(moderatePromises);
      }
      
    } catch (error) {
      console.error('❌ Smart invalidation failed:', error);
    }
  }
}

// ================================
// SERVICE INSTANCE AND CONVENIENCE FUNCTIONS
// ================================

// Create singleton instance with default query client
export const dashboardInvalidation = new DashboardInvalidationService(queryClient);

/**
 * Convenience functions for common invalidation patterns
 */
export const invalidateForOperation = {
  // Patient operations
  patientCreated: (tenantId: string) => 
    dashboardInvalidation.invalidateOperation('patient', 'create', tenantId),
  patientUpdated: (tenantId: string) => 
    dashboardInvalidation.invalidateOperation('patient', 'update', tenantId),
    
  // Appointment operations  
  appointmentCreated: (tenantId: string) => 
    dashboardInvalidation.invalidateOperation('appointment', 'create', tenantId),
  appointmentUpdated: (tenantId: string) => 
    dashboardInvalidation.invalidateOperation('appointment', 'update', tenantId),
  appointmentStatusChanged: (tenantId: string) => 
    dashboardInvalidation.invalidateOperation('appointment', 'statusChange', tenantId),
    
  // Prescription operations
  prescriptionCreated: (tenantId: string) => 
    dashboardInvalidation.invalidateOperation('prescription', 'create', tenantId),
  prescriptionStatusChanged: (tenantId: string) => 
    dashboardInvalidation.invalidateOperation('prescription', 'statusChange', tenantId),
  prescriptionRouted: (tenantId: string) => 
    dashboardInvalidation.invalidateOperation('prescription', 'route', tenantId),
    
  // Lab order operations
  labOrderCreated: (tenantId: string) => 
    dashboardInvalidation.invalidateOperation('labOrder', 'create', tenantId),
  labOrderUpdated: (tenantId: string) => 
    dashboardInvalidation.invalidateOperation('labOrder', 'update', tenantId),
  labResultPosted: (tenantId: string) => 
    dashboardInvalidation.invalidateOperation('labOrder', 'result', tenantId),
    
  // Billing operations
  billingCreated: (tenantId: string) => 
    dashboardInvalidation.invalidateOperation('billing', 'create', tenantId),
  billingUpdated: (tenantId: string) => 
    dashboardInvalidation.invalidateOperation('billing', 'update', tenantId),
  paymentProcessed: (tenantId: string) => 
    dashboardInvalidation.invalidateOperation('billing', 'payment', tenantId),
};

/**
 * Dashboard-specific invalidation functions
 */
export const invalidateDashboard = {
  receptionist: (tenantId: string) => dashboardInvalidation.invalidateDashboard('receptionist', tenantId),
  pharmacy: (tenantId: string) => dashboardInvalidation.invalidateDashboard('pharmacy', tenantId),
  laboratory: (tenantId: string) => dashboardInvalidation.invalidateDashboard('laboratory', tenantId),
  admin: (tenantId: string) => dashboardInvalidation.invalidateDashboard('admin', tenantId),
  superAdmin: () => dashboardInvalidation.invalidateDashboard('superAdmin'),
  all: (tenantId: string) => dashboardInvalidation.invalidateAllForTenant(tenantId),
  platform: () => dashboardInvalidation.invalidatePlatform()
};

// ================================
// MUTATION INTEGRATION HELPERS
// ================================

/**
 * Hook for integrating with React Query mutations
 * Automatically invalidates appropriate caches on successful mutations
 */
export function createInvalidatingMutation<TData = unknown, TError = Error, TVariables = void, TContext = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  invalidationConfig: {
    operationType: keyof typeof DASHBOARD_CACHE_MAPPINGS;
    action: string;
    getTenantId?: (variables: TVariables, data: TData) => string;
    additionalInvalidations?: (variables: TVariables, data: TData) => Promise<void>;
  }
) {
  return {
    mutationFn,
    onSuccess: async (data: TData, variables: TVariables) => {
      try {
        // Get tenant ID for context
        const tenantId = invalidationConfig.getTenantId?.(variables, data);
        
        // Perform main cache invalidation
        await dashboardInvalidation.invalidateOperation(
          invalidationConfig.operationType,
          invalidationConfig.action,
          tenantId
        );
        
        // Perform any additional invalidations
        if (invalidationConfig.additionalInvalidations) {
          await invalidationConfig.additionalInvalidations(variables, data);
        }
      } catch (error) {
        console.error('Mutation invalidation failed:', error);
      }
    }
  };
}

// ================================
// TYPE EXPORTS
// ================================

export type OperationType = keyof typeof DASHBOARD_CACHE_MAPPINGS;
export type DashboardType = 'receptionist' | 'pharmacy' | 'laboratory' | 'admin' | 'superAdmin';
export type InvalidationOperation = {
  type: OperationType;
  action: string;
  tenantId?: string;
  context?: Record<string, any>;
};