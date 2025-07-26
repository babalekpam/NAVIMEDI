import { 
  tenants, 
  users, 
  patients, 
  appointments, 
  prescriptions, 
  labOrders, 
  insuranceClaims, 
  auditLogs,
  subscriptions,
  reports,
  type Tenant,
  type InsertTenant,
  type User, 
  type InsertUser,
  type Patient,
  type InsertPatient,
  type Appointment,
  type InsertAppointment,
  type Prescription,
  type InsertPrescription,
  type LabOrder,
  type InsertLabOrder,
  type InsuranceClaim,
  type InsertInsuranceClaim,
  type Subscription,
  type InsertSubscription,
  type Report,
  type InsertReport,
  type AuditLog
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, like, or } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string, tenantId: string): Promise<User | undefined>;
  getUserByEmail(email: string, tenantId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  getUsersByTenant(tenantId: string): Promise<User[]>;
  getAllUsers(): Promise<User[]>;

  // Tenant management
  getTenant(id: string): Promise<Tenant | undefined>;
  getTenantBySubdomain(subdomain: string): Promise<Tenant | undefined>;
  createTenant(tenant: InsertTenant): Promise<Tenant>;
  updateTenant(id: string, updates: Partial<Tenant>): Promise<Tenant | undefined>;
  getAllTenants(): Promise<Tenant[]>;

  // Patient management
  getPatient(id: string, tenantId: string): Promise<Patient | undefined>;
  getPatientByMRN(mrn: string, tenantId: string): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: string, updates: Partial<Patient>, tenantId: string): Promise<Patient | undefined>;
  getPatientsByTenant(tenantId: string, limit?: number, offset?: number): Promise<Patient[]>;
  searchPatients(tenantId: string, query: string): Promise<Patient[]>;

  // Appointment management
  getAppointment(id: string, tenantId: string): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: string, updates: Partial<Appointment>, tenantId: string): Promise<Appointment | undefined>;
  getAppointmentsByTenant(tenantId: string, date?: Date): Promise<Appointment[]>;
  getAppointmentsByProvider(providerId: string, tenantId: string, date?: Date): Promise<Appointment[]>;
  getAppointmentsByPatient(patientId: string, tenantId: string): Promise<Appointment[]>;

  // Prescription management
  getPrescription(id: string, tenantId: string): Promise<Prescription | undefined>;
  createPrescription(prescription: InsertPrescription): Promise<Prescription>;
  updatePrescription(id: string, updates: Partial<Prescription>, tenantId: string): Promise<Prescription | undefined>;
  getPrescriptionsByPatient(patientId: string, tenantId: string): Promise<Prescription[]>;
  getPrescriptionsByTenant(tenantId: string): Promise<Prescription[]>;

  // Lab order management
  getLabOrder(id: string, tenantId: string): Promise<LabOrder | undefined>;
  createLabOrder(labOrder: InsertLabOrder): Promise<LabOrder>;
  updateLabOrder(id: string, updates: Partial<LabOrder>, tenantId: string): Promise<LabOrder | undefined>;
  getLabOrdersByPatient(patientId: string, tenantId: string): Promise<LabOrder[]>;
  getLabOrdersByTenant(tenantId: string): Promise<LabOrder[]>;
  getPendingLabOrders(tenantId: string): Promise<LabOrder[]>;

  // Insurance claims management
  getInsuranceClaim(id: string, tenantId: string): Promise<InsuranceClaim | undefined>;
  createInsuranceClaim(claim: InsertInsuranceClaim): Promise<InsuranceClaim>;
  updateInsuranceClaim(id: string, updates: Partial<InsuranceClaim>, tenantId: string): Promise<InsuranceClaim | undefined>;
  getInsuranceClaimsByTenant(tenantId: string): Promise<InsuranceClaim[]>;
  getInsuranceClaimsByPatient(patientId: string, tenantId: string): Promise<InsuranceClaim[]>;

  // Audit logging
  createAuditLog(log: Omit<AuditLog, "id" | "timestamp">): Promise<AuditLog>;
  getAuditLogs(tenantId: string, limit?: number, offset?: number): Promise<AuditLog[]>;

  // Subscription management
  getSubscription(tenantId: string): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(tenantId: string, updates: Partial<Subscription>): Promise<Subscription | undefined>;
  getAllSubscriptions(): Promise<Subscription[]>;

  // Report management
  getReport(id: string, tenantId: string): Promise<Report | undefined>;
  createReport(report: InsertReport): Promise<Report>;
  updateReport(id: string, updates: Partial<Report>, tenantId: string): Promise<Report | undefined>;
  getReportsByTenant(tenantId: string): Promise<Report[]>;

  // Dashboard metrics
  getDashboardMetrics(tenantId: string): Promise<{
    todayAppointments: number;
    pendingLabResults: number;
    activePrescriptions: number;
    monthlyClaimsTotal: number;
  }>;

  // Platform metrics for super admin
  getPlatformMetrics(): Promise<{
    totalTenants: number;
    activeTenants: number;
    totalSubscriptionRevenue: number;
    monthlyRevenue: number;
    totalUsers: number;
    totalPatients: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User management
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUserByUsername(username: string, tenantId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(
      and(eq(users.username, username), eq(users.tenantId, tenantId))
    );
    return user || undefined;
  }

  async getUserByEmail(email: string, tenantId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(
      and(eq(users.email, email), eq(users.tenantId, tenantId))
    );
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getUsersByTenant(tenantId: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.tenantId, tenantId));
  }

  // Tenant management
  async getTenant(id: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    return tenant || undefined;
  }

  async getTenantBySubdomain(subdomain: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.subdomain, subdomain));
    return tenant || undefined;
  }

  async createTenant(insertTenant: InsertTenant): Promise<Tenant> {
    const [tenant] = await db.insert(tenants).values(insertTenant).returning();
    return tenant;
  }

  async updateTenant(id: string, updates: Partial<Tenant>): Promise<Tenant | undefined> {
    const [tenant] = await db.update(tenants)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(tenants.id, id))
      .returning();
    return tenant || undefined;
  }

  async getAllTenants(): Promise<Tenant[]> {
    return await db.select().from(tenants).where(eq(tenants.isActive, true));
  }

  // Patient management
  async getPatient(id: string, tenantId: string): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(
      and(eq(patients.id, id), eq(patients.tenantId, tenantId))
    );
    return patient || undefined;
  }

  async getPatientByMRN(mrn: string, tenantId: string): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(
      and(eq(patients.mrn, mrn), eq(patients.tenantId, tenantId))
    );
    return patient || undefined;
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const [patient] = await db.insert(patients).values(insertPatient).returning();
    return patient;
  }

  async updatePatient(id: string, updates: Partial<Patient>, tenantId: string): Promise<Patient | undefined> {
    const [patient] = await db.update(patients)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(and(eq(patients.id, id), eq(patients.tenantId, tenantId)))
      .returning();
    return patient || undefined;
  }

  async getPatientsByTenant(tenantId: string, limit = 50, offset = 0): Promise<Patient[]> {
    return await db.select().from(patients)
      .where(and(eq(patients.tenantId, tenantId), eq(patients.isActive, true)))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(patients.createdAt));
  }

  async searchPatients(tenantId: string, query: string): Promise<Patient[]> {
    return await db.select().from(patients).where(
      and(
        eq(patients.tenantId, tenantId),
        eq(patients.isActive, true),
        sql`(LOWER(${patients.firstName}) LIKE LOWER('%' || ${query} || '%') OR 
             LOWER(${patients.lastName}) LIKE LOWER('%' || ${query} || '%') OR 
             ${patients.mrn} LIKE '%' || ${query} || '%')`
      )
    );
  }

  // Appointment management
  async getAppointment(id: string, tenantId: string): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(
      and(eq(appointments.id, id), eq(appointments.tenantId, tenantId))
    );
    return appointment || undefined;
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const [appointment] = await db.insert(appointments).values(insertAppointment).returning();
    return appointment;
  }

  async updateAppointment(id: string, updates: Partial<Appointment>, tenantId: string): Promise<Appointment | undefined> {
    const [appointment] = await db.update(appointments)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(and(eq(appointments.id, id), eq(appointments.tenantId, tenantId)))
      .returning();
    return appointment || undefined;
  }

  async getAppointmentsByTenant(tenantId: string, date?: Date): Promise<Appointment[]> {
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      return await db.select().from(appointments).where(
        and(
          eq(appointments.tenantId, tenantId),
          sql`${appointments.appointmentDate} >= ${startOfDay}`,
          sql`${appointments.appointmentDate} <= ${endOfDay}`
        )
      ).orderBy(appointments.appointmentDate);
    }
    
    return await db.select().from(appointments)
      .where(eq(appointments.tenantId, tenantId))
      .orderBy(appointments.appointmentDate);
  }

  async getAppointmentsByProvider(providerId: string, tenantId: string, date?: Date): Promise<Appointment[]> {
    let whereCondition = and(eq(appointments.providerId, providerId), eq(appointments.tenantId, tenantId));
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      whereCondition = and(
        whereCondition,
        sql`${appointments.appointmentDate} >= ${startOfDay}`,
        sql`${appointments.appointmentDate} <= ${endOfDay}`
      );
    }
    
    return await db.select().from(appointments)
      .where(whereCondition)
      .orderBy(appointments.appointmentDate);
  }

  async getAppointmentsByPatient(patientId: string, tenantId: string): Promise<Appointment[]> {
    return await db.select().from(appointments).where(
      and(eq(appointments.patientId, patientId), eq(appointments.tenantId, tenantId))
    ).orderBy(desc(appointments.appointmentDate));
  }

  // Prescription management
  async getPrescription(id: string, tenantId: string): Promise<Prescription | undefined> {
    const [prescription] = await db.select().from(prescriptions).where(
      and(eq(prescriptions.id, id), eq(prescriptions.tenantId, tenantId))
    );
    return prescription || undefined;
  }

  async createPrescription(insertPrescription: InsertPrescription): Promise<Prescription> {
    const [prescription] = await db.insert(prescriptions).values(insertPrescription).returning();
    return prescription;
  }

  async updatePrescription(id: string, updates: Partial<Prescription>, tenantId: string): Promise<Prescription | undefined> {
    const [prescription] = await db.update(prescriptions)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(and(eq(prescriptions.id, id), eq(prescriptions.tenantId, tenantId)))
      .returning();
    return prescription || undefined;
  }

  async getPrescriptionsByPatient(patientId: string, tenantId: string): Promise<Prescription[]> {
    return await db.select().from(prescriptions).where(
      and(eq(prescriptions.patientId, patientId), eq(prescriptions.tenantId, tenantId))
    ).orderBy(desc(prescriptions.prescribedDate));
  }

  async getPrescriptionsByTenant(tenantId: string): Promise<Prescription[]> {
    return await db.select().from(prescriptions).where(eq(prescriptions.tenantId, tenantId))
      .orderBy(desc(prescriptions.prescribedDate));
  }

  // Lab order management
  async getLabOrder(id: string, tenantId: string): Promise<LabOrder | undefined> {
    const [labOrder] = await db.select().from(labOrders).where(
      and(eq(labOrders.id, id), eq(labOrders.tenantId, tenantId))
    );
    return labOrder || undefined;
  }

  async createLabOrder(insertLabOrder: InsertLabOrder): Promise<LabOrder> {
    const [labOrder] = await db.insert(labOrders).values(insertLabOrder).returning();
    return labOrder;
  }

  async updateLabOrder(id: string, updates: Partial<LabOrder>, tenantId: string): Promise<LabOrder | undefined> {
    const [labOrder] = await db.update(labOrders)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(and(eq(labOrders.id, id), eq(labOrders.tenantId, tenantId)))
      .returning();
    return labOrder || undefined;
  }

  async getLabOrdersByPatient(patientId: string, tenantId: string): Promise<LabOrder[]> {
    return await db.select().from(labOrders).where(
      and(eq(labOrders.patientId, patientId), eq(labOrders.tenantId, tenantId))
    ).orderBy(desc(labOrders.orderedDate));
  }

  async getLabOrdersByTenant(tenantId: string): Promise<LabOrder[]> {
    return await db.select().from(labOrders).where(eq(labOrders.tenantId, tenantId))
      .orderBy(desc(labOrders.orderedDate));
  }

  async getPendingLabOrders(tenantId: string): Promise<LabOrder[]> {
    return await db.select().from(labOrders).where(
      and(
        eq(labOrders.tenantId, tenantId),
        sql`${labOrders.status} IN ('ordered', 'collected', 'processing')`
      )
    ).orderBy(labOrders.orderedDate);
  }

  // Insurance claims management
  async getInsuranceClaim(id: string, tenantId: string): Promise<InsuranceClaim | undefined> {
    const [claim] = await db.select().from(insuranceClaims).where(
      and(eq(insuranceClaims.id, id), eq(insuranceClaims.tenantId, tenantId))
    );
    return claim || undefined;
  }

  async createInsuranceClaim(insertClaim: InsertInsuranceClaim): Promise<InsuranceClaim> {
    const [claim] = await db.insert(insuranceClaims).values(insertClaim).returning();
    return claim;
  }

  async updateInsuranceClaim(id: string, updates: Partial<InsuranceClaim>, tenantId: string): Promise<InsuranceClaim | undefined> {
    const [claim] = await db.update(insuranceClaims)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(and(eq(insuranceClaims.id, id), eq(insuranceClaims.tenantId, tenantId)))
      .returning();
    return claim || undefined;
  }

  async getInsuranceClaimsByTenant(tenantId: string): Promise<InsuranceClaim[]> {
    return await db.select().from(insuranceClaims).where(eq(insuranceClaims.tenantId, tenantId))
      .orderBy(desc(insuranceClaims.createdAt));
  }

  async getInsuranceClaimsByPatient(patientId: string, tenantId: string): Promise<InsuranceClaim[]> {
    return await db.select().from(insuranceClaims).where(
      and(eq(insuranceClaims.patientId, patientId), eq(insuranceClaims.tenantId, tenantId))
    ).orderBy(desc(insuranceClaims.createdAt));
  }

  // Audit logging
  async createAuditLog(log: Omit<AuditLog, "id" | "timestamp">): Promise<AuditLog> {
    const [auditLog] = await db.insert(auditLogs).values(log).returning();
    return auditLog;
  }

  async getAuditLogs(tenantId: string, limit = 50, offset = 0): Promise<AuditLog[]> {
    return await db.select().from(auditLogs)
      .where(eq(auditLogs.tenantId, tenantId))
      .orderBy(desc(auditLogs.timestamp))
      .limit(limit)
      .offset(offset);
  }

  // Dashboard metrics
  async getDashboardMetrics(tenantId: string): Promise<{
    todayAppointments: number;
    pendingLabResults: number;
    activePrescriptions: number;
    monthlyClaimsTotal: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [todayAppointmentsResult] = await db.select({ count: sql<number>`count(*)` })
      .from(appointments)
      .where(
        and(
          eq(appointments.tenantId, tenantId),
          sql`${appointments.appointmentDate} >= ${today}`,
          sql`${appointments.appointmentDate} < ${tomorrow}`
        )
      );

    const [pendingLabResultsResult] = await db.select({ count: sql<number>`count(*)` })
      .from(labOrders)
      .where(
        and(
          eq(labOrders.tenantId, tenantId),
          sql`${labOrders.status} IN ('ordered', 'collected', 'processing')`
        )
      );

    const [activePrescriptionsResult] = await db.select({ count: sql<number>`count(*)` })
      .from(prescriptions)
      .where(
        and(
          eq(prescriptions.tenantId, tenantId),
          sql`${prescriptions.status} IN ('prescribed', 'sent_to_pharmacy', 'filled')`
        )
      );

    const [monthlyClaimsResult] = await db.select({ 
      total: sql<number>`COALESCE(SUM(${insuranceClaims.totalAmount}), 0)` 
    })
      .from(insuranceClaims)
      .where(
        and(
          eq(insuranceClaims.tenantId, tenantId),
          sql`${insuranceClaims.createdAt} >= ${firstDayOfMonth}`
        )
      );

    return {
      todayAppointments: todayAppointmentsResult.count,
      pendingLabResults: pendingLabResultsResult.count,
      activePrescriptions: activePrescriptionsResult.count,
      monthlyClaimsTotal: monthlyClaimsResult.total
    };
  }

  // Subscription management
  async getSubscription(tenantId: string): Promise<Subscription | undefined> {
    const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.tenantId, tenantId));
    return subscription || undefined;
  }

  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const [subscription] = await db.insert(subscriptions).values(insertSubscription).returning();
    return subscription;
  }

  async updateSubscription(tenantId: string, updates: Partial<Subscription>): Promise<Subscription | undefined> {
    const [subscription] = await db.update(subscriptions)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(subscriptions.tenantId, tenantId))
      .returning();
    return subscription || undefined;
  }

  async getAllSubscriptions(): Promise<Subscription[]> {
    return await db.select().from(subscriptions).orderBy(desc(subscriptions.createdAt));
  }

  // Report management
  async getReport(id: string, tenantId: string): Promise<Report | undefined> {
    const [report] = await db.select().from(reports).where(
      and(eq(reports.id, id), eq(reports.tenantId, tenantId))
    );
    return report || undefined;
  }

  async createReport(insertReport: InsertReport): Promise<Report> {
    const [report] = await db.insert(reports).values(insertReport).returning();
    return report;
  }

  async updateReport(id: string, updates: Partial<Report>, tenantId: string): Promise<Report | undefined> {
    const [report] = await db.update(reports)
      .set(updates)
      .where(and(eq(reports.id, id), eq(reports.tenantId, tenantId)))
      .returning();
    return report || undefined;
  }

  async getReportsByTenant(tenantId: string): Promise<Report[]> {
    return await db.select().from(reports).where(eq(reports.tenantId, tenantId))
      .orderBy(desc(reports.createdAt));
  }

  // Platform metrics for super admin
  async getPlatformMetrics(): Promise<{
    totalTenants: number;
    activeTenants: number;
    totalSubscriptionRevenue: number;
    monthlyRevenue: number;
    totalUsers: number;
    totalPatients: number;
  }> {
    const [tenantsResult] = await db.select({ 
      total: sql<number>`count(*)`,
      active: sql<number>`count(case when ${tenants.isActive} then 1 end)`
    }).from(tenants);

    const [usersResult] = await db.select({ count: sql<number>`count(*)` }).from(users);
    
    const [patientsResult] = await db.select({ count: sql<number>`count(*)` }).from(patients);

    const [subscriptionsResult] = await db.select({ 
      totalRevenue: sql<number>`COALESCE(SUM(${subscriptions.monthlyPrice}), 0)` 
    }).from(subscriptions).where(eq(subscriptions.status, 'active'));

    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const [monthlyRevenueResult] = await db.select({ 
      monthlyRevenue: sql<number>`COALESCE(SUM(${subscriptions.monthlyPrice}), 0)` 
    }).from(subscriptions).where(
      and(
        eq(subscriptions.status, 'active'),
        sql`${subscriptions.lastPaymentDate} >= ${firstDayOfMonth}`
      )
    );

    return {
      totalTenants: tenantsResult.total,
      activeTenants: tenantsResult.active,
      totalSubscriptionRevenue: subscriptionsResult.totalRevenue,
      monthlyRevenue: monthlyRevenueResult.monthlyRevenue,
      totalUsers: usersResult.count,
      totalPatients: patientsResult.count
    };
  }
  // Report management
  async getReportsByTenant(tenantId: string): Promise<Report[]> {
    return await db.select().from(reports)
      .where(eq(reports.tenantId, tenantId))
      .orderBy(sql`${reports.createdAt} DESC`);
  }

  async getReport(id: string, tenantId: string): Promise<Report | undefined> {
    const [report] = await db.select().from(reports).where(
      and(eq(reports.id, id), eq(reports.tenantId, tenantId))
    );
    return report || undefined;
  }

  async createReport(insertReport: InsertReport): Promise<Report> {
    const [report] = await db.insert(reports).values(insertReport).returning();
    return report;
  }

  async updateReport(id: string, updates: Partial<Report>, tenantId: string): Promise<Report | undefined> {
    const [report] = await db.update(reports)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(and(eq(reports.id, id), eq(reports.tenantId, tenantId)))
      .returning();
    return report || undefined;
  }
}

export const storage = new DatabaseStorage();
