/**
 * NAVIMED ANALYTICS DATA ARCHITECTURE
 * 
 * This file defines the comprehensive data contracts and TypeScript interfaces
 * for the analytics system that connects dashboards to real data.
 * 
 * DESIGN PRINCIPLES:
 * - Extend existing API patterns rather than duplicate
 * - Enforce strict tenant isolation and RBAC
 * - Support time-range filtering for all metrics
 * - Utilize existing performance caching
 * - Follow established Drizzle ORM patterns
 */

import { z } from "zod";

// ================================
// CORE ANALYTICS TYPES & SCHEMAS
// ================================

/**
 * Base Analytics Query Parameters
 * Used across all analytics endpoints for consistent filtering
 */
export const analyticsQuerySchema = z.object({
  from: z.string().optional().describe("Start date (ISO string)"),
  to: z.string().optional().describe("End date (ISO string)"),
  interval: z.enum(['hour', 'day', 'week', 'month', 'year']).default('day'),
  departmentId: z.string().uuid().optional().describe("Filter by department"),
  userId: z.string().optional().describe("Filter by specific user"),
});

export type AnalyticsQueryParams = z.infer<typeof analyticsQuerySchema>;

/**
 * Time Series Data Point
 * Standard format for all time-based metrics
 */
export interface TimeSeriesPoint {
  timestamp: string; // ISO date string
  value: number;
  target?: number; // Optional target/goal value
  metadata?: Record<string, any>; // Additional context
}

/**
 * Status Distribution for categorized metrics
 */
export interface StatusDistribution {
  name: string;
  value: number;
  percentage: number;
  color?: string; // UI hint for consistent coloring
}

/**
 * Performance Metric with trends
 */
export interface PerformanceMetric {
  name: string;
  current: number;
  previous: number; // Previous period for comparison
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
}

/**
 * Resource Utilization Metrics
 */
export interface ResourceUtilization {
  resource: string;
  utilized: number;
  capacity: number;
  percentage: number;
  efficiency: number;
  status: 'optimal' | 'warning' | 'critical';
}

// ================================
// TENANT-LEVEL ANALYTICS INTERFACES
// ================================

/**
 * Core Operational Metrics
 * Available to: tenant_admin, director, and above
 */
export interface TenantOperationalMetrics {
  tenantId: string;
  tenantType: 'hospital' | 'clinic' | 'pharmacy' | 'laboratory';
  period: {
    from: string;
    to: string;
    interval: string;
  };
  
  // Volume Metrics
  volumeMetrics: {
    appointments: TimeSeriesPoint[];
    patients: TimeSeriesPoint[];
    prescriptions: TimeSeriesPoint[];
    labOrders: TimeSeriesPoint[];
  };
  
  // Status Distributions
  statusDistributions: {
    appointments: StatusDistribution[];
    prescriptions: StatusDistribution[];
    labOrders: StatusDistribution[];
  };
  
  // Key Performance Indicators
  kpis: {
    patientSatisfaction: PerformanceMetric;
    averageWaitTime: PerformanceMetric;
    staffEfficiency: PerformanceMetric;
    resourceUtilization: PerformanceMetric;
  };
}

/**
 * Financial Analytics
 * Available to: tenant_admin, director, billing_staff
 */
export interface TenantFinancialMetrics {
  tenantId: string;
  period: {
    from: string;
    to: string;
    interval: string;
  };
  
  // Revenue Metrics
  revenue: {
    total: TimeSeriesPoint[];
    byServiceType: StatusDistribution[];
    byDepartment: StatusDistribution[];
    recurring: TimeSeriesPoint[];
  };
  
  // Billing Metrics
  billing: {
    totalBilled: number;
    totalCollected: number;
    outstandingBalance: number;
    collectionRate: number;
    averageBillAmount: number;
  };
  
  // Insurance Claims
  insurance: {
    claimsSubmitted: TimeSeriesPoint[];
    claimsApproved: TimeSeriesPoint[];
    approvalRate: PerformanceMetric;
    averageProcessingTime: PerformanceMetric;
  };
}

/**
 * Quality & Performance Analytics
 * Available to: tenant_admin, director, physicians, nurses
 */
export interface TenantQualityMetrics {
  tenantId: string;
  period: {
    from: string;
    to: string;
    interval: string;
  };
  
  // Clinical Quality Metrics
  clinical: {
    patientOutcomes: PerformanceMetric[];
    averageStayDuration: PerformanceMetric;
    readmissionRate: PerformanceMetric;
    medicationErrors: TimeSeriesPoint[];
  };
  
  // Staff Performance
  staff: {
    productivity: PerformanceMetric[];
    qualityScores: PerformanceMetric[];
    trainingCompletion: PerformanceMetric[];
    patientFeedback: PerformanceMetric[];
  };
  
  // Process Efficiency
  processes: {
    appointmentUtilization: PerformanceMetric;
    labTurnaroundTime: PerformanceMetric;
    prescriptionFillTime: PerformanceMetric;
    equipmentUptime: PerformanceMetric;
  };
}

// ================================
// ROLE-SPECIFIC ANALYTICS INTERFACES
// ================================

/**
 * Receptionist Dashboard Analytics
 * Available to: receptionist, nurses, tenant_admin
 */
export interface ReceptionistAnalytics {
  tenantId: string;
  today: {
    scheduledAppointments: number;
    checkedInPatients: number;
    waitingPatients: number;
    completedAppointments: number;
    averageWaitTime: number; // in minutes
    emergencyCheckins: number;
  };
  
  // Appointment Trends
  appointments: {
    hourlySchedule: TimeSeriesPoint[];
    statusBreakdown: StatusDistribution[];
    departmentBreakdown: StatusDistribution[];
    weeklyTrends: TimeSeriesPoint[];
  };
  
  // Patient Flow
  patientFlow: {
    checkInRate: TimeSeriesPoint[];
    waitTimes: TimeSeriesPoint[];
    throughputRate: TimeSeriesPoint[];
    peakHours: { hour: number; count: number }[];
  };
  
  // Staff Efficiency
  staff: {
    activeStaff: ResourceUtilization[];
    productivityMetrics: PerformanceMetric[];
    patientHandlingRate: TimeSeriesPoint[];
  };
}

/**
 * Pharmacy Dashboard Analytics
 * Available to: pharmacist, pharmacy_staff, tenant_admin
 */
export interface PharmacyAnalytics {
  tenantId: string;
  today: {
    prescriptionsReceived: number;
    prescriptionsProcessed: number;
    prescriptionsReady: number;
    prescriptionsDispensed: number;
    averageProcessingTime: number; // in minutes
    insuranceVerifications: number;
  };
  
  // Prescription Workflow
  workflow: {
    queueStatus: StatusDistribution[];
    processingTimes: TimeSeriesPoint[];
    workflowStages: {
      stage: string;
      count: number;
      averageTime: number;
    }[];
  };
  
  // Inventory Management
  inventory: {
    lowStockAlerts: number;
    expiringMedications: number;
    topMedications: StatusDistribution[];
    inventoryTurnover: PerformanceMetric;
  };
  
  // Financial Performance
  financial: {
    dailyRevenue: TimeSeriesPoint[];
    copayCollections: TimeSeriesPoint[];
    insurancePayments: TimeSeriesPoint[];
    profitMargins: PerformanceMetric[];
  };
  
  // Patient Services
  patients: {
    consultations: TimeSeriesPoint[];
    medicationAdherence: PerformanceMetric[];
    patientSatisfaction: PerformanceMetric;
    loyaltyProgram: {
      activeMembers: number;
      pointsRedeemed: number;
      engagementRate: number;
    };
  };
}

/**
 * Laboratory Dashboard Analytics
 * Available to: lab_technician, pathologist, tenant_admin
 */
export interface LaboratoryAnalytics {
  tenantId: string;
  today: {
    ordersReceived: number;
    samplesCollected: number;
    testsInProgress: number;
    resultsCompleted: number;
    criticalResults: number;
    averageTurnaroundTime: number; // in hours
  };
  
  // Test Processing
  testing: {
    ordersByType: StatusDistribution[];
    turnaroundTimes: TimeSeriesPoint[];
    qualityControlResults: PerformanceMetric[];
    testVolumeTrends: TimeSeriesPoint[];
  };
  
  // Sample Management
  samples: {
    collectionEfficiency: PerformanceMetric;
    sampleQuality: PerformanceMetric[];
    storageUtilization: ResourceUtilization[];
    rejectionRate: PerformanceMetric;
  };
  
  // Equipment Performance
  equipment: {
    utilization: ResourceUtilization[];
    maintenanceSchedule: {
      equipmentId: string;
      name: string;
      nextMaintenance: string;
      status: 'operational' | 'maintenance' | 'down';
    }[];
    downtime: TimeSeriesPoint[];
  };
  
  // Quality Assurance
  quality: {
    accuracyMetrics: PerformanceMetric[];
    proficiencyTests: PerformanceMetric[];
    calibrationStatus: StatusDistribution[];
    errorRates: TimeSeriesPoint[];
  };
}

/**
 * Hospital Admin Dashboard Analytics
 * Available to: tenant_admin, director, department heads
 */
export interface HospitalAdminAnalytics {
  tenantId: string;
  
  // Executive Summary
  executive: {
    totalPatients: number;
    bedOccupancy: PerformanceMetric;
    averageStayDuration: PerformanceMetric;
    patientSatisfaction: PerformanceMetric;
    financialPerformance: PerformanceMetric;
  };
  
  // Department Performance
  departments: {
    departmentId: string;
    name: string;
    patientVolume: TimeSeriesPoint[];
    efficiency: PerformanceMetric;
    revenue: PerformanceMetric;
    staffUtilization: ResourceUtilization;
    qualityScore: PerformanceMetric;
  }[];
  
  // Operational Metrics
  operations: TenantOperationalMetrics;
  
  // Financial Performance
  financial: TenantFinancialMetrics;
  
  // Quality Indicators
  quality: TenantQualityMetrics;
  
  // Strategic Insights
  insights: {
    growthOpportunities: string[];
    performanceAlerts: {
      type: 'warning' | 'critical';
      message: string;
      department?: string;
      metric: string;
    }[];
    recommendations: {
      priority: 'high' | 'medium' | 'low';
      category: 'operational' | 'financial' | 'quality' | 'strategic';
      title: string;
      description: string;
      expectedImpact: string;
    }[];
  };
}

// ================================
// PLATFORM-LEVEL ANALYTICS INTERFACES
// ================================

/**
 * Platform-Wide Analytics (Super Admin)
 * Available to: super_admin only
 */
export interface PlatformAnalytics {
  // Tenant Overview
  tenants: {
    total: number;
    active: number;
    byType: StatusDistribution[];
    byRegion: StatusDistribution[];
    growthTrends: TimeSeriesPoint[];
    churnRate: PerformanceMetric;
  };
  
  // User Activity
  users: {
    total: number;
    active: number;
    byRole: StatusDistribution[];
    loginActivity: TimeSeriesPoint[];
    sessionDuration: PerformanceMetric;
  };
  
  // System Performance
  system: {
    responseTime: PerformanceMetric;
    uptime: PerformanceMetric;
    errorRate: PerformanceMetric;
    throughput: TimeSeriesPoint[];
  };
  
  // Business Metrics
  business: {
    totalRevenue: TimeSeriesPoint[];
    subscriptionMetrics: {
      mrr: TimeSeriesPoint[]; // Monthly Recurring Revenue
      churnRate: TimeSeriesPoint[];
      ltv: PerformanceMetric; // Lifetime Value
    };
    supportMetrics: {
      ticketVolume: TimeSeriesPoint[];
      resolutionTime: PerformanceMetric;
      satisfaction: PerformanceMetric;
    };
  };
}

// ================================
// API RESPONSE WRAPPER TYPES
// ================================

/**
 * Standard API Response Wrapper
 */
export interface AnalyticsResponse<T> {
  success: boolean;
  data: T;
  metadata: {
    generatedAt: string;
    cacheHit: boolean;
    queryTime: number; // in milliseconds
    recordCount?: number;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

/**
 * Error Response
 */
export interface AnalyticsError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  metadata: {
    timestamp: string;
    requestId: string;
  };
}

// ================================
// CACHE KEY STRATEGIES
// ================================

/**
 * Cache Key Builder for Analytics
 * Ensures consistent caching across all analytics endpoints
 */
export class AnalyticsCacheKey {
  static tenant(tenantId: string, metric: string, params: AnalyticsQueryParams): string {
    const key = `analytics:tenant:${tenantId}:${metric}`;
    const paramKey = Object.entries(params)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    return paramKey ? `${key}?${paramKey}` : key;
  }
  
  static platform(metric: string, params: AnalyticsQueryParams): string {
    const key = `analytics:platform:${metric}`;
    const paramKey = Object.entries(params)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    return paramKey ? `${key}?${paramKey}` : key;
  }
  
  static user(userId: string, tenantId: string, metric: string): string {
    return `analytics:user:${tenantId}:${userId}:${metric}`;
  }
}

// ================================
// EXPORT ALL TYPES
// ================================

export type {
  TimeSeriesPoint,
  StatusDistribution,
  PerformanceMetric,
  ResourceUtilization,
  TenantOperationalMetrics,
  TenantFinancialMetrics,
  TenantQualityMetrics,
  ReceptionistAnalytics,
  PharmacyAnalytics,
  LaboratoryAnalytics,
  HospitalAdminAnalytics,
  PlatformAnalytics,
  AnalyticsResponse,
  AnalyticsError,
};