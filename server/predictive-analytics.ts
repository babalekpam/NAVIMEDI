import { storage } from "./storage";
import { db } from "./db";
import { patients, appointments, prescriptions, inventoryItems, patientBills, labOrders } from "@shared/schema";
import { eq, and, gte, lte, sql, desc, count, sum, ne } from "drizzle-orm";

// ==================== TYPE DEFINITIONS ====================

export interface ReadmissionPrediction {
  patientId: string;
  patientName: string;
  riskScore: number;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  factors: string[];
  recommendations: string[];
}

export interface NoShowPrediction {
  appointmentId: string;
  patientName: string;
  appointmentDate: Date;
  department: string;
  noShowProbability: number;
  riskLevel: 'Low' | 'Moderate' | 'High';
  factors: string[];
  recommendations: string[];
}

export interface InventoryForecast {
  itemId: string;
  itemName: string;
  currentStock: number;
  predictedDemand: number;
  reorderPoint: number;
  suggestedOrder: number;
  daysUntilStockout: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface RevenueForecast {
  month: string;
  predictedRevenue: number;
  confidenceLow: number;
  confidenceHigh: number;
  trend: 'up' | 'down' | 'stable';
  factors: string[];
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Linear Regression Calculator
 * Calculates slope and intercept for trend analysis
 */
function linearRegression(data: { x: number; y: number }[]): { slope: number; intercept: number } {
  if (data.length === 0) {
    return { slope: 0, intercept: 0 };
  }
  
  const n = data.length;
  const sumX = data.reduce((sum, point) => sum + point.x, 0);
  const sumY = data.reduce((sum, point) => sum + point.y, 0);
  const sumXY = data.reduce((sum, point) => sum + point.x * point.y, 0);
  const sumXX = data.reduce((sum, point) => sum + point.x * point.x, 0);
  
  const denominator = (n * sumXX - sumX * sumX);
  if (denominator === 0) {
    return { slope: 0, intercept: sumY / n };
  }
  
  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;
  
  return { slope, intercept };
}

/**
 * Calculate age from date of birth
 */
function calculateAge(dateOfBirth: Date | string): number {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Get day of week from date (0 = Sunday, 1 = Monday, etc.)
 */
function getDayOfWeek(date: Date): number {
  return date.getDay();
}

/**
 * Get hour from date
 */
function getHour(date: Date): number {
  return date.getHours();
}

/**
 * Format date to month string
 */
function formatMonth(date: Date): string {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}

/**
 * Add months to date
 */
function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

// ==================== READMISSION RISK PREDICTION ====================

/**
 * Predict readmission risk for patients
 * Algorithm:
 * - Age ≥ 65: +20 points
 * - Chronic conditions (diabetes, heart disease, COPD): +15-20 points each
 * - Previous readmissions (last 6 months): +30 per readmission
 * - Multiple medications (>5): +10 points
 * - Recent lab orders (complexity indicator): +5 points
 */
export async function predictReadmissionRisk(
  tenantId: string,
  patientId?: string
): Promise<ReadmissionPrediction[]> {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Get patients with recent appointments (discharged patients)
    const recentPatients = await db
      .select({
        id: patients.id,
        firstName: patients.firstName,
        lastName: patients.lastName,
        dateOfBirth: patients.dateOfBirth,
        medicalHistory: patients.medicalHistory,
      })
      .from(patients)
      .innerJoin(appointments, eq(appointments.patientId, patients.id))
      .where(
        and(
          eq(patients.tenantId, tenantId),
          gte(appointments.appointmentDate, thirtyDaysAgo),
          patientId ? eq(patients.id, patientId) : undefined
        )
      )
      .groupBy(patients.id, patients.firstName, patients.lastName, patients.dateOfBirth, patients.medicalHistory)
      .limit(100);

    const predictions: ReadmissionPrediction[] = [];

    for (const patient of recentPatients) {
      let riskScore = 0;
      const factors: string[] = [];
      const recommendations: string[] = [];

      // Factor 1: Age ≥ 65
      const age = patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : 0;
      if (age >= 65) {
        riskScore += 20;
        factors.push('Age over 65');
        recommendations.push('Schedule follow-up within 7 days');
      }

      // Factor 2: Chronic conditions from medical history
      const medicalHistory = ((patient.medicalHistory as string | null) || '').toLowerCase();
      if (medicalHistory.includes('diabetes')) {
        riskScore += 15;
        factors.push('Diabetes');
        recommendations.push('Monitor blood glucose levels');
      }
      if (medicalHistory.includes('heart') || medicalHistory.includes('cardiac')) {
        riskScore += 20;
        factors.push('Heart disease');
        recommendations.push('Cardiology consultation');
      }
      if (medicalHistory.includes('copd') || medicalHistory.includes('pulmonary')) {
        riskScore += 15;
        factors.push('COPD/Pulmonary disease');
        recommendations.push('Respiratory therapy follow-up');
      }
      if (medicalHistory.includes('hypertension')) {
        riskScore += 10;
        factors.push('Hypertension');
        recommendations.push('Blood pressure monitoring');
      }

      // Factor 3: Previous readmissions (count completed appointments in last 6 months)
      const previousAppointments = await db
        .select({ count: count() })
        .from(appointments)
        .where(
          and(
            eq(appointments.patientId, patient.id),
            gte(appointments.appointmentDate, sixMonthsAgo),
            eq(appointments.status, 'completed')
          )
        );
      
      const appointmentCount = previousAppointments[0]?.count || 0;
      if (appointmentCount > 3) {
        const readmissions = Math.floor((appointmentCount - 3) / 2); // Estimate readmissions
        riskScore += readmissions * 30;
        factors.push(`${readmissions} previous readmissions`);
        recommendations.push('Care coordinator assignment');
      }

      // Factor 4: Multiple medications (>5 active prescriptions)
      const activePrescriptions = await db
        .select({ count: count() })
        .from(prescriptions)
        .where(
          and(
            eq(prescriptions.patientId, patient.id),
            ne(prescriptions.status, 'cancelled')
          )
        );
      
      const prescriptionCount = activePrescriptions[0]?.count || 0;
      if (prescriptionCount > 5) {
        riskScore += 10;
        factors.push('Polypharmacy (>5 medications)');
        recommendations.push('Medication reconciliation');
      }

      // Factor 5: Recent lab orders (complexity indicator)
      const recentLabOrders = await db
        .select({ count: count() })
        .from(labOrders)
        .where(
          and(
            eq(labOrders.patientId, patient.id),
            gte(labOrders.orderedDate, thirtyDaysAgo)
          )
        );
      
      const labOrderCount = recentLabOrders[0]?.count || 0;
      if (labOrderCount > 2) {
        riskScore += 5;
        factors.push('Multiple recent lab tests');
        recommendations.push('Review lab results');
      }

      // Cap risk score at 100
      riskScore = Math.min(riskScore, 100);

      // Determine risk level
      let riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
      if (riskScore >= 76) {
        riskLevel = 'Critical';
      } else if (riskScore >= 51) {
        riskLevel = 'High';
      } else if (riskScore >= 26) {
        riskLevel = 'Moderate';
      } else {
        riskLevel = 'Low';
      }

      // Only include patients with moderate or higher risk
      if (riskScore >= 26) {
        if (factors.length === 0) {
          factors.push('Multiple risk indicators');
        }
        if (recommendations.length === 0) {
          recommendations.push('Regular monitoring recommended');
        }

        predictions.push({
          patientId: patient.id,
          patientName: `${patient.firstName} ${patient.lastName}`,
          riskScore,
          riskLevel,
          factors,
          recommendations,
        });
      }
    }

    // Sort by risk score (highest first)
    predictions.sort((a, b) => b.riskScore - a.riskScore);

    return predictions;
  } catch (error) {
    console.error('Error predicting readmission risk:', error);
    return [];
  }
}

// ==================== NO-SHOW PROBABILITY PREDICTION ====================

/**
 * Predict no-show probability for upcoming appointments
 * Algorithm:
 * - Base probability: 10%
 * - Previous no-shows: +30% per no-show
 * - Wait time > 14 days: +20%
 * - Monday or Friday: +10%
 * - Early morning (<9am) or late afternoon (>4pm): +15%
 * - Patient age <25 or >75: +10%
 */
export async function predictNoShowProbability(tenantId: string): Promise<NoShowPrediction[]> {
  try {
    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);
    
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    // Get upcoming appointments
    const upcomingAppointments = await db
      .select({
        id: appointments.id,
        patientId: appointments.patientId,
        appointmentDate: appointments.appointmentDate,
        type: appointments.type,
        createdAt: appointments.createdAt,
      })
      .from(appointments)
      .innerJoin(patients, eq(appointments.patientId, patients.id))
      .where(
        and(
          eq(appointments.tenantId, tenantId),
          gte(appointments.appointmentDate, sevenDaysFromNow),
          lte(appointments.appointmentDate, thirtyDaysFromNow),
          eq(appointments.status, 'scheduled')
        )
      )
      .limit(100);

    const predictions: NoShowPrediction[] = [];

    for (const appointment of upcomingAppointments) {
      let probability = 10; // Base probability
      const factors: string[] = [];
      const recommendations: string[] = [];

      // Get patient details
      const patient = await storage.getPatient(appointment.patientId, tenantId);
      if (!patient) continue;

      // Factor 1: Previous no-shows
      const previousNoShows = await db
        .select({ count: count() })
        .from(appointments)
        .where(
          and(
            eq(appointments.patientId, appointment.patientId),
            eq(appointments.status, 'no_show')
          )
        );
      
      const noShowCount = previousNoShows[0]?.count || 0;
      if (noShowCount > 0) {
        probability += noShowCount * 30;
        factors.push(`${noShowCount} previous no-shows`);
        recommendations.push('Call patient to confirm');
      }

      // Factor 2: Wait time from booking
      const appointmentCreatedAt = appointment.createdAt || new Date();
      const waitTime = Math.floor(
        (new Date(appointment.appointmentDate).getTime() - new Date(appointmentCreatedAt).getTime()) /
        (1000 * 60 * 60 * 24)
      );
      if (waitTime > 14) {
        probability += 20;
        factors.push('Long wait time (>14 days)');
        recommendations.push('Send reminder 48 hours before');
      }

      // Factor 3: Day of week (Monday = 1, Friday = 5)
      const appointmentDate = new Date(appointment.appointmentDate);
      const dayOfWeek = getDayOfWeek(appointmentDate);
      if (dayOfWeek === 1 || dayOfWeek === 5) {
        probability += 10;
        factors.push('Monday or Friday appointment');
        recommendations.push('Consider rescheduling to mid-week');
      }

      // Factor 4: Time of day
      const hour = getHour(appointmentDate);
      if (hour < 9 || hour >= 16) {
        probability += 15;
        factors.push('Early morning or late afternoon');
        recommendations.push('Offer alternative time slot');
      }

      // Factor 5: Patient age
      const age = patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : 0;
      if (age < 25 || age > 75) {
        probability += 10;
        factors.push(age < 25 ? 'Young patient' : 'Elderly patient');
        recommendations.push('Ensure transportation arranged');
      }

      // Cap probability at 100
      probability = Math.min(probability, 100);

      // Determine risk level
      let riskLevel: 'Low' | 'Moderate' | 'High';
      if (probability >= 61) {
        riskLevel = 'High';
      } else if (probability >= 31) {
        riskLevel = 'Moderate';
      } else {
        riskLevel = 'Low';
      }

      // Only include appointments with moderate or higher risk
      if (probability >= 31) {
        if (factors.length === 0) {
          factors.push('Statistical risk factors');
        }
        if (recommendations.length === 0) {
          recommendations.push('Send appointment reminder');
        }

        predictions.push({
          appointmentId: appointment.id,
          patientName: `${patient.firstName} ${patient.lastName}`,
          appointmentDate: appointmentDate,
          department: appointment.type || 'General',
          noShowProbability: probability,
          riskLevel,
          factors,
          recommendations,
        });
      }
    }

    // Sort by probability (highest first)
    predictions.sort((a, b) => b.noShowProbability - a.noShowProbability);

    return predictions;
  } catch (error) {
    console.error('Error predicting no-show probability:', error);
    return [];
  }
}

// ==================== INVENTORY DEMAND FORECASTING ====================

/**
 * Forecast inventory demand for next 30 days
 * Algorithm:
 * - Calculate average daily usage from last 30 days (from prescriptions)
 * - Detect trend: compare last 7 days vs previous 23 days
 * - Forecast = avg daily usage × 30 × trend multiplier
 * - Trend multiplier: increasing = 1.2, stable = 1.0, decreasing = 0.8
 * - Reorder point = (lead time × daily usage) + safety stock
 * - Safety stock = 7 days × daily usage
 */
export async function forecastInventoryDemand(tenantId: string): Promise<InventoryForecast[]> {
  try {
    // Get all inventory items for the tenant
    const items = await db
      .select({
        id: inventoryItems.id,
        name: inventoryItems.medicationName,
        quantity: inventoryItems.currentStock,
        reorderLevel: inventoryItems.reorderPoint,
      })
      .from(inventoryItems)
      .where(eq(inventoryItems.tenantId, tenantId))
      .limit(100);

    const forecasts: InventoryForecast[] = [];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    for (const item of items) {
      // Get usage from prescriptions (assuming medicationName field contains item name)
      const recentPrescriptions = await db
        .select({ count: count() })
        .from(prescriptions)
        .where(
          and(
            eq(prescriptions.tenantId, tenantId),
            gte(prescriptions.prescribedDate, thirtyDaysAgo),
            sql`${prescriptions.medicationName} ILIKE ${`%${item.name}%`}`
          )
        );

      const usageCount = recentPrescriptions[0]?.count || 0;
      const avgDailyUsage = usageCount / 30;

      // Calculate trend (simplified - compare recent activity)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentUsage = await db
        .select({ count: count() })
        .from(prescriptions)
        .where(
          and(
            eq(prescriptions.tenantId, tenantId),
            gte(prescriptions.prescribedDate, sevenDaysAgo),
            sql`${prescriptions.medicationName} ILIKE ${`%${item.name}%`}`
          )
        );

      const recentCount = recentUsage[0]?.count || 0;
      const recentDailyUsage = recentCount / 7;

      // Determine trend
      let trend: 'increasing' | 'decreasing' | 'stable';
      let trendMultiplier = 1.0;
      
      if (recentDailyUsage > avgDailyUsage * 1.2) {
        trend = 'increasing';
        trendMultiplier = 1.2;
      } else if (recentDailyUsage < avgDailyUsage * 0.8) {
        trend = 'decreasing';
        trendMultiplier = 0.8;
      } else {
        trend = 'stable';
        trendMultiplier = 1.0;
      }

      // Calculate predictions
      const predictedDemand = Math.ceil(avgDailyUsage * 30 * trendMultiplier);
      const safetyStock = Math.ceil(avgDailyUsage * 7);
      const leadTime = 5; // Assume 5 days lead time
      const reorderPoint = Math.ceil(avgDailyUsage * leadTime + safetyStock);
      
      const currentStock = item.quantity || 0;
      const daysUntilStockout = avgDailyUsage > 0 
        ? Math.floor(currentStock / avgDailyUsage) 
        : 999;
      
      const suggestedOrder = Math.max(
        predictedDemand - currentStock,
        0
      );

      // Only include items needing attention
      if (daysUntilStockout < 30 || currentStock < reorderPoint) {
        forecasts.push({
          itemId: item.id.toString(),
          itemName: item.name,
          currentStock,
          predictedDemand,
          reorderPoint,
          suggestedOrder,
          daysUntilStockout,
          trend,
        });
      }
    }

    // Sort by urgency (lowest days until stockout first)
    forecasts.sort((a, b) => a.daysUntilStockout - b.daysUntilStockout);

    return forecasts;
  } catch (error) {
    console.error('Error forecasting inventory demand:', error);
    return [];
  }
}

// ==================== REVENUE FORECASTING ====================

/**
 * Forecast revenue for next 6 months using linear regression
 * Algorithm:
 * - Query historical revenue (last 12 months)
 * - Apply linear regression to find trend
 * - Project future months with confidence intervals (±15%)
 * - Determine trend direction from slope
 */
export async function forecastRevenue(
  tenantId: string,
  months: number = 6
): Promise<RevenueForecast[]> {
  try {
    const today = new Date();
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(today.getMonth() - 12);

    // Get historical revenue from patient bills
    const historicalBills = await db
      .select({
        createdAt: patientBills.createdAt,
        totalAmount: patientBills.originalAmount,
      })
      .from(patientBills)
      .where(
        and(
          eq(patientBills.tenantId, tenantId),
          gte(patientBills.createdAt, twelveMonthsAgo)
        )
      );

    // Aggregate by month
    const monthlyRevenue = new Map<string, number>();
    
    for (const bill of historicalBills) {
      const billCreatedAt = bill.createdAt || new Date();
      const month = formatMonth(new Date(billCreatedAt));
      const amount = parseFloat(bill.totalAmount) || 0;
      monthlyRevenue.set(month, (monthlyRevenue.get(month) || 0) + amount);
    }

    // Prepare data for linear regression
    const historicalData: { x: number; y: number }[] = [];
    const sortedMonths = Array.from(monthlyRevenue.keys()).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    sortedMonths.forEach((month, index) => {
      historicalData.push({
        x: index,
        y: monthlyRevenue.get(month) || 0,
      });
    });

    // If no historical data, return flat projection
    if (historicalData.length === 0) {
      const forecasts: RevenueForecast[] = [];
      const baseRevenue = 50000; // Default assumption
      
      for (let i = 0; i < months; i++) {
        const futureDate = addMonths(today, i + 1);
        forecasts.push({
          month: formatMonth(futureDate),
          predictedRevenue: baseRevenue,
          confidenceLow: baseRevenue * 0.85,
          confidenceHigh: baseRevenue * 1.15,
          trend: 'stable',
          factors: ['Insufficient historical data for trend analysis'],
        });
      }
      
      return forecasts;
    }

    // Calculate linear regression
    const { slope, intercept } = linearRegression(historicalData);

    // Determine trend
    let trend: 'up' | 'down' | 'stable';
    if (slope > 1000) {
      trend = 'up';
    } else if (slope < -1000) {
      trend = 'down';
    } else {
      trend = 'stable';
    }

    // Calculate average historical revenue for context
    const avgHistorical = historicalData.reduce((sum, d) => sum + d.y, 0) / historicalData.length;

    // Generate forecasts
    const forecasts: RevenueForecast[] = [];
    const factors: string[] = [];
    
    if (historicalData.length >= 6) {
      const growthRate = ((slope * historicalData.length) / avgHistorical * 100).toFixed(1);
      factors.push(`Historical growth rate: ${growthRate}% per year`);
    }
    
    factors.push(`Based on ${historicalData.length} months of data`);
    
    if (trend === 'up') {
      factors.push('Positive revenue trend');
    } else if (trend === 'down') {
      factors.push('Declining revenue trend - review operations');
    } else {
      factors.push('Stable revenue pattern');
    }

    for (let i = 0; i < months; i++) {
      const futureX = historicalData.length + i;
      const predictedRevenue = Math.max(slope * futureX + intercept, 0);
      
      // Add confidence interval (±15%)
      const confidenceLow = predictedRevenue * 0.85;
      const confidenceHigh = predictedRevenue * 1.15;
      
      const futureDate = addMonths(today, i + 1);
      
      forecasts.push({
        month: formatMonth(futureDate),
        predictedRevenue: Math.round(predictedRevenue),
        confidenceLow: Math.round(confidenceLow),
        confidenceHigh: Math.round(confidenceHigh),
        trend,
        factors,
      });
    }

    return forecasts;
  } catch (error) {
    console.error('Error forecasting revenue:', error);
    return [];
  }
}
