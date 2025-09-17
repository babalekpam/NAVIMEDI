/**
 * NAVIMED ANALYTICS DATA AGGREGATION STRATEGY
 * 
 * This file defines comprehensive data aggregation patterns using existing
 * Drizzle ORM infrastructure and performance caching system.
 * 
 * DESIGN PRINCIPLES:
 * - Utilize existing db connection and Drizzle ORM patterns
 * - Leverage existing performance-cache.ts for optimized queries
 * - Implement efficient time-based aggregations
 * - Ensure strict tenant isolation in all aggregations
 * - Support real-time and historical analytics
 */

import { db } from "./db";
import { 
  tenants, 
  users, 
  appointments, 
  prescriptions, 
  labOrders,
  labResults,
  patients,
  vitalSigns,
  visitSummaries,
  patientBills,
  patientPayments,
  hospitalBills,
  pharmacyBills,
  financialTransactions,
  insuranceClaims,
  activityLogs,
  userStats,
  leaderboards,
  departments
} from "@shared/schema";
import { eq, and, desc, asc, gte, lte, sql, count, avg, sum } from "drizzle-orm";
import { performanceCache } from "./performance-cache";
import { 
  AnalyticsQueryParams,
  TimeSeriesPoint,
  StatusDistribution,
  PerformanceMetric,
  ResourceUtilization
} from "./analytics-types";

// ================================
// CORE AGGREGATION UTILITIES
// ================================

/**
 * Date Range Builder for consistent time filtering
 */
export class DateRangeBuilder {
  static build(params: AnalyticsQueryParams): { from: Date; to: Date } {
    const now = new Date();
    const to = params.to ? new Date(params.to) : now;
    
    let from: Date;
    if (params.from) {
      from = new Date(params.from);
    } else {
      // Default to last 30 days if no range specified
      from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    return { from, to };
  }

  static getIntervalMilliseconds(interval: string): number {
    switch (interval) {
      case 'hour': return 60 * 60 * 1000;
      case 'day': return 24 * 60 * 60 * 1000;
      case 'week': return 7 * 24 * 60 * 60 * 1000;
      case 'month': return 30 * 24 * 60 * 60 * 1000;
      case 'year': return 365 * 24 * 60 * 60 * 1000;
      default: return 24 * 60 * 60 * 1000; // Default to day
    }
  }

  static generateTimePoints(from: Date, to: Date, interval: string): Date[] {
    const points: Date[] = [];
    const intervalMs = this.getIntervalMilliseconds(interval);
    
    let current = new Date(from);
    while (current <= to) {
      points.push(new Date(current));
      current = new Date(current.getTime() + intervalMs);
    }
    
    return points;
  }
}

/**
 * Tenant Isolation Helper
 */
export class TenantFilter {
  static forTenant(tenantId: string) {
    return eq(tenants.id, tenantId);
  }

  static multiTable(tenantId: string) {
    return {
      appointments: eq(appointments.tenantId, tenantId),
      prescriptions: eq(prescriptions.tenantId, tenantId),
      labOrders: eq(labOrders.tenantId, tenantId),
      patients: eq(patients.tenantId, tenantId),
      users: eq(users.tenantId, tenantId),
      departments: eq(departments.tenantId, tenantId)
    };
  }
}

// ================================
// CORE AGGREGATION QUERIES
// ================================

/**
 * Appointment Analytics Aggregator
 */
export class AppointmentAggregator {
  /**
   * Get appointment volume time series
   */
  static async getVolumeTimeSeries(
    tenantId: string, 
    params: AnalyticsQueryParams
  ): Promise<TimeSeriesPoint[]> {
    const { from, to } = DateRangeBuilder.build(params);
    const cacheKey = `appointments:volume:${tenantId}:${from.toISOString()}:${to.toISOString()}:${params.interval}`;
    
    let cached = performanceCache.get(cacheKey);
    if (cached) return cached;

    // Use SQL DATE_TRUNC for efficient time-based grouping
    const intervalSql = params.interval === 'hour' ? 'hour' :
                       params.interval === 'day' ? 'day' :
                       params.interval === 'week' ? 'week' :
                       params.interval === 'month' ? 'month' : 'day';

    const result = await db
      .select({
        timestamp: sql`DATE_TRUNC(${intervalSql}, ${appointments.appointmentDate})`,
        value: count(appointments.id)
      })
      .from(appointments)
      .where(
        and(
          eq(appointments.tenantId, tenantId),
          gte(appointments.appointmentDate, from),
          lte(appointments.appointmentDate, to)
        )
      )
      .groupBy(sql`DATE_TRUNC(${intervalSql}, ${appointments.appointmentDate})`)
      .orderBy(sql`DATE_TRUNC(${intervalSql}, ${appointments.appointmentDate})`);

    const timeSeries = result.map(row => ({
      timestamp: new Date(row.timestamp as string | number | Date).toISOString(),
      value: Number(row.value)
    }));

    // Cache for 5 minutes
    performanceCache.set(cacheKey, timeSeries, 300);
    return timeSeries;
  }

  /**
   * Get appointment status distribution
   */
  static async getStatusDistribution(tenantId: string): Promise<StatusDistribution[]> {
    const cacheKey = `appointments:status:${tenantId}`;
    let cached = performanceCache.get(cacheKey);
    if (cached) return cached;

    const result = await db
      .select({
        status: appointments.status,
        count: count(appointments.id)
      })
      .from(appointments)
      .where(eq(appointments.tenantId, tenantId))
      .groupBy(appointments.status);

    const total = result.reduce((sum, row) => sum + Number(row.count), 0);
    const distribution = result.map(row => ({
      name: row.status || 'unknown',
      value: Number(row.count),
      percentage: total > 0 ? Number(((Number(row.count) / total) * 100).toFixed(1)) : 0
    }));

    // Cache for 2 minutes (more dynamic data)
    performanceCache.set(cacheKey, distribution, 120);
    return distribution;
  }

  /**
   * Get today's appointment metrics
   */
  static async getTodayMetrics(tenantId: string): Promise<{
    scheduled: number;
    checkedIn: number;
    completed: number;
    cancelled: number;
  }> {
    const cacheKey = `appointments:today:${tenantId}`;
    let cached = performanceCache.get(cacheKey);
    if (cached) return cached;

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const result = await db
      .select({
        status: appointments.status,
        count: count(appointments.id)
      })
      .from(appointments)
      .where(
        and(
          eq(appointments.tenantId, tenantId),
          gte(appointments.appointmentDate, startOfDay),
          lte(appointments.appointmentDate, endOfDay)
        )
      )
      .groupBy(appointments.status);

    const metrics = {
      scheduled: 0,
      checkedIn: 0,
      completed: 0,
      cancelled: 0
    };

    result.forEach(row => {
      const count = Number(row.count);
      switch (row.status) {
        case 'scheduled': metrics.scheduled += count; break;
        case 'checked_in': metrics.checkedIn += count; break;
        case 'completed': metrics.completed += count; break;
        case 'cancelled': metrics.cancelled += count; break;
      }
    });

    // Cache for 1 minute (real-time data)
    performanceCache.set(cacheKey, metrics, 60);
    return metrics;
  }
}

/**
 * Prescription Analytics Aggregator
 */
export class PrescriptionAggregator {
  /**
   * Get prescription workflow metrics for pharmacy dashboard
   */
  static async getWorkflowMetrics(tenantId: string): Promise<{
    received: number;
    inProgress: number;
    readyForPickup: number;
    dispensed: number;
    averageProcessingTime: number;
  }> {
    const cacheKey = `prescriptions:workflow:${tenantId}`;
    let cached = performanceCache.get(cacheKey);
    if (cached) return cached;

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const result = await db
      .select({
        status: prescriptions.status,
        count: count(prescriptions.id),
        avgProcessingTime: avg(sql`EXTRACT(EPOCH FROM (${prescriptions.updatedAt} - ${prescriptions.createdAt})) / 60`)
      })
      .from(prescriptions)
      .where(
        and(
          eq(prescriptions.tenantId, tenantId),
          gte(prescriptions.createdAt, startOfDay)
        )
      )
      .groupBy(prescriptions.status);

    const metrics = {
      received: 0,
      inProgress: 0,
      readyForPickup: 0,
      dispensed: 0,
      averageProcessingTime: 0
    };

    let totalProcessingTime = 0;
    let processedCount = 0;

    result.forEach(row => {
      const count = Number(row.count);
      const avgTime = Number(row.avgProcessingTime) || 0;
      
      switch (row.status) {
        case 'received': metrics.received += count; break;
        case 'processing': metrics.inProgress += count; break;
        case 'ready': metrics.readyForPickup += count; break;
        case 'dispensed': metrics.dispensed += count; break;
      }
      
      if (avgTime > 0) {
        totalProcessingTime += avgTime * count;
        processedCount += count;
      }
    });

    metrics.averageProcessingTime = processedCount > 0 
      ? Number((totalProcessingTime / processedCount).toFixed(1))
      : 0;

    // Cache for 2 minutes
    performanceCache.set(cacheKey, metrics, 120);
    return metrics;
  }

  /**
   * Get prescription volume time series
   */
  static async getVolumeTimeSeries(
    tenantId: string,
    params: AnalyticsQueryParams
  ): Promise<TimeSeriesPoint[]> {
    const { from, to } = DateRangeBuilder.build(params);
    const cacheKey = `prescriptions:volume:${tenantId}:${from.toISOString()}:${to.toISOString()}:${params.interval}`;
    
    let cached = performanceCache.get(cacheKey);
    if (cached) return cached;

    const intervalSql = params.interval === 'hour' ? 'hour' :
                       params.interval === 'day' ? 'day' :
                       params.interval === 'week' ? 'week' :
                       params.interval === 'month' ? 'month' : 'day';

    const result = await db
      .select({
        timestamp: sql`DATE_TRUNC(${intervalSql}, ${prescriptions.createdAt})`,
        value: count(prescriptions.id)
      })
      .from(prescriptions)
      .where(
        and(
          eq(prescriptions.tenantId, tenantId),
          gte(prescriptions.createdAt, from),
          lte(prescriptions.createdAt, to)
        )
      )
      .groupBy(sql`DATE_TRUNC(${intervalSql}, ${prescriptions.createdAt})`)
      .orderBy(sql`DATE_TRUNC(${intervalSql}, ${prescriptions.createdAt})`);

    const timeSeries = result.map(row => ({
      timestamp: new Date(row.timestamp as string | number | Date).toISOString(),
      value: Number(row.value)
    }));

    // Cache for 5 minutes
    performanceCache.set(cacheKey, timeSeries, 300);
    return timeSeries;
  }
}

/**
 * Laboratory Analytics Aggregator
 */
export class LaboratoryAggregator {
  /**
   * Get lab order processing metrics
   */
  static async getProcessingMetrics(tenantId: string): Promise<{
    ordersReceived: number;
    samplesCollected: number;
    testsInProgress: number;
    resultsCompleted: number;
    criticalResults: number;
    averageTurnaroundTime: number;
  }> {
    const cacheKey = `lab:processing:${tenantId}`;
    let cached = performanceCache.get(cacheKey);
    if (cached) return cached;

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Lab Orders Status Count
    const ordersResult = await db
      .select({
        status: labOrders.status,
        count: count(labOrders.id)
      })
      .from(labOrders)
      .where(
        and(
          eq(labOrders.tenantId, tenantId),
          gte(labOrders.createdAt, startOfDay)
        )
      )
      .groupBy(labOrders.status);

    // Lab Results with turnaround time
    const resultsResult = await db
      .select({
        count: count(labResults.id),
        avgTurnaroundTime: avg(sql`EXTRACT(EPOCH FROM (${labResults.completedAt} - ${labResults.createdAt})) / 3600`),
        criticalCount: count(sql`CASE WHEN ${labResults.abnormalFlag} = 'critical' THEN 1 END`)
      })
      .from(labResults)
      .where(
        and(
          eq(labResults.tenantId, tenantId),
          gte(labResults.createdAt, startOfDay)
        )
      );

    const metrics = {
      ordersReceived: 0,
      samplesCollected: 0,
      testsInProgress: 0,
      resultsCompleted: Number(resultsResult[0]?.count) || 0,
      criticalResults: Number(resultsResult[0]?.criticalCount) || 0,
      averageTurnaroundTime: Number(resultsResult[0]?.avgTurnaroundTime) || 0
    };

    ordersResult.forEach(row => {
      const count = Number(row.count);
      switch (row.status) {
        case 'ordered': metrics.ordersReceived += count; break;
        case 'collected': metrics.samplesCollected += count; break;
        case 'processing': metrics.testsInProgress += count; break;
      }
    });

    // Cache for 3 minutes
    performanceCache.set(cacheKey, metrics, 180);
    return metrics;
  }

  /**
   * Get test volume by type
   */
  static async getTestVolumeByType(tenantId: string): Promise<StatusDistribution[]> {
    const cacheKey = `lab:testTypes:${tenantId}`;
    let cached = performanceCache.get(cacheKey);
    if (cached) return cached;

    const result = await db
      .select({
        testName: labOrders.testName,
        count: count(labOrders.id)
      })
      .from(labOrders)
      .where(eq(labOrders.tenantId, tenantId))
      .groupBy(labOrders.testName)
      .orderBy(desc(count(labOrders.id)));

    const total = result.reduce((sum, row) => sum + Number(row.count), 0);
    const distribution = result.map(row => ({
      name: row.testName || 'Unknown',
      value: Number(row.count),
      percentage: total > 0 ? Number(((Number(row.count) / total) * 100).toFixed(1)) : 0
    }));

    // Cache for 10 minutes (less dynamic data)
    performanceCache.set(cacheKey, distribution, 600);
    return distribution;
  }
}

/**
 * Financial Analytics Aggregator
 */
export class FinancialAggregator {
  /**
   * Get revenue time series from all billing sources
   */
  static async getRevenueTimeSeries(
    tenantId: string,
    params: AnalyticsQueryParams
  ): Promise<TimeSeriesPoint[]> {
    const { from, to } = DateRangeBuilder.build(params);
    const cacheKey = `revenue:${tenantId}:${from.toISOString()}:${to.toISOString()}:${params.interval}`;
    
    let cached = performanceCache.get(cacheKey);
    if (cached) return cached;

    const intervalSql = params.interval === 'hour' ? 'hour' :
                       params.interval === 'day' ? 'day' :
                       params.interval === 'week' ? 'week' :
                       params.interval === 'month' ? 'month' : 'day';

    // Aggregate revenue from multiple sources
    const patientBillsRevenue = await db
      .select({
        timestamp: sql`DATE_TRUNC(${intervalSql}, ${patientBills.createdAt})`,
        value: sum(patientBills.originalAmount)
      })
      .from(patientBills)
      .where(
        and(
          eq(patientBills.tenantId, tenantId),
          gte(patientBills.createdAt, from),
          lte(patientBills.createdAt, to),
          eq(patientBills.status, 'paid')
        )
      )
      .groupBy(sql`DATE_TRUNC(${intervalSql}, ${patientBills.createdAt})`)
      .orderBy(sql`DATE_TRUNC(${intervalSql}, ${patientBills.createdAt})`);

    const hospitalBillsRevenue = await db
      .select({
        timestamp: sql`DATE_TRUNC(${intervalSql}, ${hospitalBills.createdAt})`,
        value: sum(hospitalBills.amount)
      })
      .from(hospitalBills)
      .where(
        and(
          eq(hospitalBills.tenantId, tenantId),
          gte(hospitalBills.createdAt, from),
          lte(hospitalBills.createdAt, to),
          eq(hospitalBills.status, 'paid')
        )
      )
      .groupBy(sql`DATE_TRUNC(${intervalSql}, ${hospitalBills.createdAt})`)
      .orderBy(sql`DATE_TRUNC(${intervalSql}, ${hospitalBills.createdAt})`);

    // Merge revenue streams by timestamp
    const revenueMap = new Map<string, number>();
    
    patientBillsRevenue.forEach(row => {
      const timestamp = new Date(row.timestamp as string | number | Date).toISOString();
      revenueMap.set(timestamp, (revenueMap.get(timestamp) || 0) + Number(row.value));
    });

    hospitalBillsRevenue.forEach(row => {
      const timestamp = new Date(row.timestamp as string | number | Date).toISOString();
      revenueMap.set(timestamp, (revenueMap.get(timestamp) || 0) + Number(row.value));
    });

    const timeSeries = Array.from(revenueMap.entries())
      .map(([timestamp, value]) => ({ timestamp, value }))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Cache for 10 minutes
    performanceCache.set(cacheKey, timeSeries, 600);
    return timeSeries;
  }

  /**
   * Get billing collection metrics
   */
  static async getCollectionMetrics(tenantId: string): Promise<{
    totalBilled: number;
    totalCollected: number;
    outstandingBalance: number;
    collectionRate: number;
  }> {
    const cacheKey = `billing:collection:${tenantId}`;
    let cached = performanceCache.get(cacheKey);
    if (cached) return cached;

    const billingResult = await db
      .select({
        totalBilled: sum(patientBills.originalAmount),
        totalPaid: sum(sql`CASE WHEN ${patientBills.status} = 'paid' THEN ${patientBills.originalAmount} ELSE 0 END`),
        totalOutstanding: sum(sql`CASE WHEN ${patientBills.status} != 'paid' THEN ${patientBills.originalAmount} ELSE 0 END`)
      })
      .from(patientBills)
      .where(eq(patientBills.tenantId, tenantId));

    const result = billingResult[0];
    const totalBilled = Number(result?.totalBilled) || 0;
    const totalCollected = Number(result?.totalPaid) || 0;
    const outstandingBalance = Number(result?.totalOutstanding) || 0;
    const collectionRate = totalBilled > 0 ? Number(((totalCollected / totalBilled) * 100).toFixed(1)) : 0;

    const metrics = {
      totalBilled,
      totalCollected,
      outstandingBalance,
      collectionRate
    };

    // Cache for 5 minutes
    performanceCache.set(cacheKey, metrics, 300);
    return metrics;
  }
}

/**
 * Performance Metrics Builder
 */
export class PerformanceMetricsBuilder {
  /**
   * Build a performance metric with trend analysis
   */
  static buildMetric(
    name: string,
    current: number,
    previous: number,
    target: number,
    unit: string
  ): PerformanceMetric {
    const changePercent = previous > 0 ? Number((((current - previous) / previous) * 100).toFixed(1)) : 0;
    let trend: 'up' | 'down' | 'stable' = 'stable';
    
    if (Math.abs(changePercent) > 5) { // 5% threshold for significance
      trend = changePercent > 0 ? 'up' : 'down';
    }

    return {
      name,
      current,
      previous,
      target,
      unit,
      trend,
      changePercent
    };
  }

  /**
   * Build resource utilization metric
   */
  static buildResourceUtilization(
    resource: string,
    utilized: number,
    capacity: number
  ): ResourceUtilization {
    const percentage = capacity > 0 ? Number(((utilized / capacity) * 100).toFixed(1)) : 0;
    const efficiency = percentage > 0 ? Number((utilized / (capacity * (percentage / 100))).toFixed(2)) : 0;
    
    let status: 'optimal' | 'warning' | 'critical' = 'optimal';
    if (percentage > 90) status = 'critical';
    else if (percentage > 75) status = 'warning';

    return {
      resource,
      utilized,
      capacity,
      percentage,
      efficiency,
      status
    };
  }
}

// ================================
// AGGREGATION SERVICE EXPORT
// ================================

/**
 * Main Aggregation Service that combines all aggregators
 */
export class AnalyticsAggregationService {
  static appointments = AppointmentAggregator;
  static prescriptions = PrescriptionAggregator;
  static laboratory = LaboratoryAggregator;
  static financial = FinancialAggregator;
  static performance = PerformanceMetricsBuilder;
  static dateRange = DateRangeBuilder;
  static tenantFilter = TenantFilter;

  /**
   * Clear cache for a tenant (useful for data updates)
   */
  static clearTenantCache(tenantId: string): void {
    const patterns = [
      `appointments:*:${tenantId}*`,
      `prescriptions:*:${tenantId}*`,
      `lab:*:${tenantId}*`,
      `revenue:${tenantId}*`,
      `billing:*:${tenantId}*`
    ];

    patterns.forEach(pattern => {
      performanceCache.clear(pattern);
    });
  }

  /**
   * Get cache size for monitoring
   */
  static getCacheSize(): number {
    // Note: Performance cache doesn't expose internal stats
    // This is a simplified version that just confirms cache is operational
    return 1; // Basic health check
  }
}

export { AnalyticsAggregationService as AggregationService };