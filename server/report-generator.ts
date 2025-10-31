import { db } from "./db";
import { 
  patients, 
  appointments, 
  prescriptions, 
  labOrders, 
  patientBills,
  patientPayments,
  users,
  auditLogs
} from "@shared/schema";
import { eq, and, gte, lte, sql, count, sum, avg } from "drizzle-orm";

export interface ReportData {
  reportName: string;
  reportType: 'financial' | 'operational' | 'clinical' | 'compliance';
  dateRange: { start: Date; end: Date };
  data: any;
  generatedAt: Date;
  summary?: string;
}

export interface ReportParams {
  startDate: Date;
  endDate: Date;
  format?: 'pdf' | 'excel' | 'html' | 'csv' | 'json';
  departments?: string[];
  reportType?: string;
  complianceArea?: string;
}

/**
 * Generate Financial Report
 * Queries billing data and calculates financial metrics
 */
export async function generateFinancialReport(
  tenantId: string,
  params: ReportParams
): Promise<ReportData> {
  const { startDate, endDate } = params;

  // Query billing data
  const bills = await db
    .select({
      id: patientBills.id,
      totalAmount: patientBills.totalAmount,
      amountPaid: patientBills.amountPaid,
      status: patientBills.status,
      serviceType: patientBills.serviceType,
      createdAt: patientBills.createdAt
    })
    .from(patientBills)
    .where(
      and(
        eq(patientBills.tenantId, tenantId),
        gte(patientBills.createdAt, startDate),
        lte(patientBills.createdAt, endDate)
      )
    );

  // Query payments
  const payments = await db
    .select({
      id: patientPayments.id,
      amount: patientPayments.amount,
      paymentMethod: patientPayments.paymentMethod,
      paymentDate: patientPayments.paymentDate
    })
    .from(patientPayments)
    .where(
      and(
        eq(patientPayments.tenantId, tenantId),
        gte(patientPayments.paymentDate, startDate),
        lte(patientPayments.paymentDate, endDate)
      )
    );

  // Calculate metrics
  const totalRevenue = bills.reduce((sum, bill) => 
    sum + parseFloat(bill.amountPaid || '0'), 0
  );
  
  const totalBilled = bills.reduce((sum, bill) => 
    sum + parseFloat(bill.totalAmount || '0'), 0
  );

  const paidBills = bills.filter(b => b.status === 'paid').length;
  const pendingBills = bills.filter(b => b.status === 'pending').length;

  // Revenue by service type
  const revenueByService = bills.reduce((acc: any, bill) => {
    const serviceType = bill.serviceType || 'other';
    if (!acc[serviceType]) {
      acc[serviceType] = 0;
    }
    acc[serviceType] += parseFloat(bill.amountPaid || '0');
    return acc;
  }, {});

  // Payment methods breakdown
  const paymentsByMethod = payments.reduce((acc: any, payment) => {
    const method = payment.paymentMethod || 'unknown';
    if (!acc[method]) {
      acc[method] = { count: 0, total: 0 };
    }
    acc[method].count++;
    acc[method].total += parseFloat(payment.amount || '0');
    return acc;
  }, {});

  return {
    reportName: 'Financial Report',
    reportType: 'financial',
    dateRange: { start: startDate, end: endDate },
    generatedAt: new Date(),
    summary: `Financial report for period ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
    data: {
      summary: {
        totalRevenue: totalRevenue.toFixed(2),
        totalBilled: totalBilled.toFixed(2),
        collectionRate: totalBilled > 0 ? ((totalRevenue / totalBilled) * 100).toFixed(2) + '%' : '0%',
        totalBills: bills.length,
        paidBills,
        pendingBills,
        totalPayments: payments.length
      },
      revenueByService,
      paymentsByMethod,
      bills: bills.map(b => ({
        id: b.id,
        amount: b.totalAmount,
        paid: b.amountPaid,
        status: b.status,
        service: b.serviceType,
        date: b.createdAt
      })),
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      }
    }
  };
}

/**
 * Generate Operational Report
 * Analyzes appointments, staff utilization, and operational metrics
 */
export async function generateOperationalReport(
  tenantId: string,
  params: ReportParams
): Promise<ReportData> {
  const { startDate, endDate } = params;

  // Query appointments
  const appointmentList = await db
    .select({
      id: appointments.id,
      status: appointments.status,
      appointmentDate: appointments.appointmentDate,
      department: appointments.department,
      doctorId: appointments.doctorId
    })
    .from(appointments)
    .where(
      and(
        eq(appointments.tenantId, tenantId),
        gte(appointments.appointmentDate, startDate),
        lte(appointments.appointmentDate, endDate)
      )
    );

  // Calculate metrics
  const totalAppointments = appointmentList.length;
  const completedAppointments = appointmentList.filter(a => a.status === 'completed').length;
  const cancelledAppointments = appointmentList.filter(a => a.status === 'cancelled').length;
  const noShowAppointments = appointmentList.filter(a => a.status === 'no_show').length;

  const completionRate = totalAppointments > 0 
    ? ((completedAppointments / totalAppointments) * 100).toFixed(2) + '%'
    : '0%';

  const noShowRate = totalAppointments > 0
    ? ((noShowAppointments / totalAppointments) * 100).toFixed(2) + '%'
    : '0%';

  // Appointments by department
  const appointmentsByDepartment = appointmentList.reduce((acc: any, apt) => {
    const dept = apt.department || 'general';
    if (!acc[dept]) {
      acc[dept] = { total: 0, completed: 0, cancelled: 0, noShow: 0 };
    }
    acc[dept].total++;
    if (apt.status === 'completed') acc[dept].completed++;
    if (apt.status === 'cancelled') acc[dept].cancelled++;
    if (apt.status === 'no_show') acc[dept].noShow++;
    return acc;
  }, {});

  // Appointments by doctor
  const appointmentsByDoctor = appointmentList.reduce((acc: any, apt) => {
    const doctorId = apt.doctorId || 'unassigned';
    if (!acc[doctorId]) {
      acc[doctorId] = 0;
    }
    acc[doctorId]++;
    return acc;
  }, {});

  return {
    reportName: 'Operational Report',
    reportType: 'operational',
    dateRange: { start: startDate, end: endDate },
    generatedAt: new Date(),
    summary: `Operational metrics for period ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
    data: {
      summary: {
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        noShowAppointments,
        completionRate,
        noShowRate,
        averageAppointmentsPerDay: (totalAppointments / Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))).toFixed(1)
      },
      appointmentsByDepartment,
      appointmentsByDoctor,
      appointments: appointmentList.map(a => ({
        id: a.id,
        date: a.appointmentDate,
        status: a.status,
        department: a.department
      })),
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      }
    }
  };
}

/**
 * Generate Clinical Report
 * Analyzes patient outcomes, prescriptions, and lab orders
 */
export async function generateClinicalReport(
  tenantId: string,
  params: ReportParams
): Promise<ReportData> {
  const { startDate, endDate } = params;

  // Query prescriptions
  const prescriptionList = await db
    .select({
      id: prescriptions.id,
      status: prescriptions.status,
      medication: prescriptions.medication,
      createdAt: prescriptions.createdAt
    })
    .from(prescriptions)
    .where(
      and(
        eq(prescriptions.tenantId, tenantId),
        gte(prescriptions.createdAt, startDate),
        lte(prescriptions.createdAt, endDate)
      )
    );

  // Query lab orders
  const labOrderList = await db
    .select({
      id: labOrders.id,
      status: labOrders.status,
      testType: labOrders.testType,
      createdAt: labOrders.createdAt
    })
    .from(labOrders)
    .where(
      and(
        eq(labOrders.tenantId, tenantId),
        gte(labOrders.createdAt, startDate),
        lte(labOrders.createdAt, endDate)
      )
    );

  // Calculate metrics
  const totalPrescriptions = prescriptionList.length;
  const dispensedPrescriptions = prescriptionList.filter(p => 
    p.status === 'dispensed' || p.status === 'filled' || p.status === 'picked_up'
  ).length;

  const totalLabOrders = labOrderList.length;
  const completedLabOrders = labOrderList.filter(l => l.status === 'completed').length;

  const prescriptionFillRate = totalPrescriptions > 0
    ? ((dispensedPrescriptions / totalPrescriptions) * 100).toFixed(2) + '%'
    : '0%';

  const labCompletionRate = totalLabOrders > 0
    ? ((completedLabOrders / totalLabOrders) * 100).toFixed(2) + '%'
    : '0%';

  // Top medications
  const medicationCounts = prescriptionList.reduce((acc: any, p) => {
    const med = p.medication || 'unknown';
    acc[med] = (acc[med] || 0) + 1;
    return acc;
  }, {});

  const topMedications = Object.entries(medicationCounts)
    .sort(([, a]: any, [, b]: any) => b - a)
    .slice(0, 10)
    .map(([med, count]) => ({ medication: med, count }));

  // Lab test types
  const labTestCounts = labOrderList.reduce((acc: any, l) => {
    const test = l.testType || 'unknown';
    acc[test] = (acc[test] || 0) + 1;
    return acc;
  }, {});

  return {
    reportName: 'Clinical Report',
    reportType: 'clinical',
    dateRange: { start: startDate, end: endDate },
    generatedAt: new Date(),
    summary: `Clinical outcomes for period ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
    data: {
      summary: {
        totalPrescriptions,
        dispensedPrescriptions,
        prescriptionFillRate,
        totalLabOrders,
        completedLabOrders,
        labCompletionRate
      },
      topMedications,
      labTestCounts,
      prescriptions: prescriptionList.slice(0, 100).map(p => ({
        id: p.id,
        medication: p.medication,
        status: p.status,
        date: p.createdAt
      })),
      labOrders: labOrderList.slice(0, 100).map(l => ({
        id: l.id,
        testType: l.testType,
        status: l.status,
        date: l.createdAt
      })),
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      }
    }
  };
}

/**
 * Generate Compliance Report
 * Analyzes audit logs and compliance metrics
 */
export async function generateComplianceReport(
  tenantId: string,
  params: ReportParams
): Promise<ReportData> {
  const { startDate, endDate, complianceArea } = params;

  // Query audit logs
  const logs = await db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      resourceType: auditLogs.resourceType,
      userId: auditLogs.userId,
      timestamp: auditLogs.timestamp,
      details: auditLogs.details
    })
    .from(auditLogs)
    .where(
      and(
        eq(auditLogs.tenantId, tenantId),
        gte(auditLogs.timestamp, startDate),
        lte(auditLogs.timestamp, endDate)
      )
    )
    .limit(1000);

  // Calculate metrics
  const totalAuditEvents = logs.length;
  
  // Events by action type
  const eventsByAction = logs.reduce((acc: any, log) => {
    const action = log.action || 'unknown';
    acc[action] = (acc[action] || 0) + 1;
    return acc;
  }, {});

  // Events by resource type
  const eventsByResource = logs.reduce((acc: any, log) => {
    const resource = log.resourceType || 'unknown';
    acc[resource] = (acc[resource] || 0) + 1;
    return acc;
  }, {});

  // Active users (unique users who performed actions)
  const uniqueUsers = new Set(logs.map(l => l.userId).filter(Boolean));

  return {
    reportName: 'Compliance Report',
    reportType: 'compliance',
    dateRange: { start: startDate, end: endDate },
    generatedAt: new Date(),
    summary: `Compliance audit for ${complianceArea || 'all areas'} - ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
    data: {
      summary: {
        totalAuditEvents,
        uniqueActiveUsers: uniqueUsers.size,
        complianceArea: complianceArea || 'all',
        monitoringPeriodDays: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      },
      eventsByAction,
      eventsByResource,
      recentAuditLogs: logs.slice(0, 50).map(log => ({
        id: log.id,
        action: log.action,
        resource: log.resourceType,
        timestamp: log.timestamp,
        userId: log.userId
      })),
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      }
    }
  };
}

/**
 * Generate CSV from data
 */
export function generateCSV(data: any[], headers: string[]): string {
  const rows = [headers.join(',')];
  
  data.forEach(item => {
    const row = headers.map(header => {
      let value = item[header];
      if (value === null || value === undefined) {
        value = '';
      }
      // Escape quotes and wrap in quotes if contains comma
      value = String(value).replace(/"/g, '""');
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        value = `"${value}"`;
      }
      return value;
    });
    rows.push(row.join(','));
  });
  
  return rows.join('\n');
}

/**
 * Format report data for download
 */
export function formatReportForDownload(reportData: ReportData, format: string): string {
  if (format === 'csv') {
    // Convert report data to CSV
    const flatData: any[] = [];
    
    // Add summary as first rows
    if (reportData.data.summary) {
      Object.entries(reportData.data.summary).forEach(([key, value]) => {
        flatData.push({ metric: key, value });
      });
    }
    
    const headers = Object.keys(flatData[0] || { metric: '', value: '' });
    return generateCSV(flatData, headers);
  }
  
  if (format === 'json') {
    return JSON.stringify(reportData, null, 2);
  }
  
  if (format === 'html') {
    return generateHTMLReport(reportData);
  }
  
  // Default to JSON
  return JSON.stringify(reportData, null, 2);
}

/**
 * Generate HTML report
 */
function generateHTMLReport(reportData: ReportData): string {
  const { reportName, reportType, dateRange, data, summary } = reportData;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <title>${reportName}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #4CAF50; color: white; }
    .summary { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <h1>${reportName}</h1>
  <p><strong>Report Type:</strong> ${reportType}</p>
  <p><strong>Period:</strong> ${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}</p>
  <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
  
  <div class="summary">
    <h2>Summary</h2>
    ${summary || ''}
    <pre>${JSON.stringify(data.summary, null, 2)}</pre>
  </div>
  
  <h2>Detailed Data</h2>
  <pre>${JSON.stringify(data, null, 2)}</pre>
</body>
</html>
  `.trim();
}
