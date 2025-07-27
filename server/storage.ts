import { 
  tenants, 
  users, 
  patients, 
  appointments, 
  prescriptions, 
  labOrders, 
  insuranceClaims, 
  insuranceProviders,
  patientInsurance,
  servicePrices,
  insurancePlanCoverage,
  claimLineItems,
  auditLogs,
  subscriptions,
  reports,
  medicalCommunications,
  communicationTranslations,
  supportedLanguages,
  medicalPhrases,
  phraseTranslations,
  laboratories,
  labResults,
  labOrderAssignments,
  laboratoryApplications,
  vitalSigns,
  visitSummaries,
  healthRecommendations,
  healthAnalyses,
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
  pharmacies,
  type Pharmacy,
  type InsertPharmacy,
  type InsuranceClaim,
  type InsertInsuranceClaim,
  type InsuranceProvider,
  type InsertInsuranceProvider,
  type PatientInsurance,
  type InsertPatientInsurance,
  type ServicePrice,
  type InsertServicePrice,
  type InsurancePlanCoverage,
  type InsertInsurancePlanCoverage,
  type ClaimLineItem,
  type InsertClaimLineItem,
  type Subscription,
  type InsertSubscription,
  type Report,
  type InsertReport,
  type AuditLog,
  type MedicalCommunication,
  type InsertMedicalCommunication,
  type CommunicationTranslation,
  type InsertCommunicationTranslation,
  type SupportedLanguage,
  type InsertSupportedLanguage,
  type MedicalPhrase,
  type InsertMedicalPhrase,
  type PhraseTranslation,
  type InsertPhraseTranslation,
  type Laboratory,
  type InsertLaboratory,
  type LabResult,
  type InsertLabResult,
  type LabOrderAssignment,
  type InsertLabOrderAssignment,
  type LaboratoryApplication,
  type InsertLaboratoryApplication,
  type VitalSigns,
  type InsertVitalSigns,
  type VisitSummary,
  type InsertVisitSummary,
  type HealthRecommendation,
  type InsertHealthRecommendation,
  type HealthAnalysis,
  type InsertHealthAnalysis
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
  getUsersByRole(role: string, tenantId: string): Promise<User[]>;
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

  // Pharmacy management
  getPharmacy(id: string, tenantId: string): Promise<Pharmacy | undefined>;
  createPharmacy(pharmacy: InsertPharmacy): Promise<Pharmacy>;
  updatePharmacy(id: string, updates: Partial<Pharmacy>, tenantId: string): Promise<Pharmacy | undefined>;
  getPharmaciesByTenant(tenantId: string): Promise<Pharmacy[]>;
  getActivePharmacies(tenantId: string): Promise<Pharmacy[]>;

  // Insurance claims management
  getInsuranceClaim(id: string, tenantId: string): Promise<InsuranceClaim | undefined>;
  createInsuranceClaim(claim: InsertInsuranceClaim): Promise<InsuranceClaim>;
  updateInsuranceClaim(id: string, updates: Partial<InsuranceClaim>, tenantId: string): Promise<InsuranceClaim | undefined>;
  getInsuranceClaimsByTenant(tenantId: string): Promise<InsuranceClaim[]>;
  getInsuranceClaimsByPatient(patientId: string, tenantId: string): Promise<InsuranceClaim[]>;
  
  // Insurance Provider management
  getInsuranceProviders(tenantId: string): Promise<InsuranceProvider[]>;
  createInsuranceProvider(provider: InsertInsuranceProvider): Promise<InsuranceProvider>;
  
  // Patient Insurance management
  getPatientInsurance(patientId: string, tenantId: string): Promise<PatientInsurance[]>;
  createPatientInsurance(insurance: InsertPatientInsurance): Promise<PatientInsurance>;

  // Service Pricing management
  getServicePrices(tenantId: string): Promise<ServicePrice[]>;
  getServicePrice(id: string, tenantId: string): Promise<ServicePrice | undefined>;
  createServicePrice(servicePrice: InsertServicePrice): Promise<ServicePrice>;
  updateServicePrice(id: string, updates: Partial<ServicePrice>, tenantId: string): Promise<ServicePrice | undefined>;
  getServicePriceByCode(serviceCode: string, tenantId: string): Promise<ServicePrice | undefined>;

  // Insurance Plan Coverage management
  getInsurancePlanCoverages(tenantId: string): Promise<InsurancePlanCoverage[]>;
  getInsurancePlanCoverageByServiceAndProvider(servicePriceId: string, insuranceProviderId: string, tenantId: string): Promise<InsurancePlanCoverage | undefined>;
  createInsurancePlanCoverage(coverage: InsertInsurancePlanCoverage): Promise<InsurancePlanCoverage>;
  updateInsurancePlanCoverage(id: string, updates: Partial<InsurancePlanCoverage>, tenantId: string): Promise<InsurancePlanCoverage | undefined>;

  // Claim Line Items management
  getClaimLineItems(claimId: string, tenantId: string): Promise<ClaimLineItem[]>;
  createClaimLineItem(lineItem: InsertClaimLineItem): Promise<ClaimLineItem>;
  updateClaimLineItem(id: string, updates: Partial<ClaimLineItem>, tenantId: string): Promise<ClaimLineItem | undefined>;
  deleteClaimLineItem(id: string, tenantId: string): Promise<boolean>;

  // Pricing calculations
  calculateCopayAndInsuranceAmount(servicePriceId: string, insuranceProviderId: string, patientInsuranceId: string, tenantId: string): Promise<{
    unitPrice: number;
    copayAmount: number;
    insuranceAmount: number;
    deductibleAmount: number;
  }>;

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

  // Multilingual Communication management
  getMedicalCommunication(id: string, tenantId: string): Promise<MedicalCommunication | undefined>;
  createMedicalCommunication(communication: InsertMedicalCommunication): Promise<MedicalCommunication>;
  updateMedicalCommunication(id: string, updates: Partial<MedicalCommunication>, tenantId: string): Promise<MedicalCommunication | undefined>;
  getMedicalCommunicationsByPatient(patientId: string, tenantId: string): Promise<MedicalCommunication[]>;
  getMedicalCommunicationsByTenant(tenantId: string): Promise<MedicalCommunication[]>;
  
  // Communication Translation management
  createCommunicationTranslation(translation: InsertCommunicationTranslation): Promise<CommunicationTranslation>;
  getCommunicationTranslations(communicationId: string): Promise<CommunicationTranslation[]>;
  
  // Supported Languages management
  getSupportedLanguages(tenantId: string): Promise<SupportedLanguage[]>;
  createSupportedLanguage(language: InsertSupportedLanguage): Promise<SupportedLanguage>;
  updateSupportedLanguage(id: string, updates: Partial<SupportedLanguage>, tenantId: string): Promise<SupportedLanguage | undefined>;
  
  // Medical Phrases management
  getMedicalPhrases(tenantId: string, category?: string): Promise<MedicalPhrase[]>;
  createMedicalPhrase(phrase: InsertMedicalPhrase): Promise<MedicalPhrase>;
  
  // Phrase Translation management
  getPhraseTranslations(phraseId: string): Promise<PhraseTranslation[]>;
  createPhraseTranslation(translation: InsertPhraseTranslation): Promise<PhraseTranslation>;

  // Laboratory Management
  getLaboratory(id: string, tenantId: string): Promise<Laboratory | undefined>;
  createLaboratory(laboratory: InsertLaboratory): Promise<Laboratory>;
  updateLaboratory(id: string, updates: Partial<Laboratory>, tenantId: string): Promise<Laboratory | undefined>;
  getLaboratoriesByTenant(tenantId: string): Promise<Laboratory[]>;
  getActiveLaboratoriesByTenant(tenantId: string): Promise<Laboratory[]>;

  // Lab Results Management
  getLabResult(id: string, tenantId: string): Promise<LabResult | undefined>;
  createLabResult(labResult: InsertLabResult): Promise<LabResult>;
  updateLabResult(id: string, updates: Partial<LabResult>, tenantId: string): Promise<LabResult | undefined>;
  getLabResultsByOrder(labOrderId: string, tenantId: string): Promise<LabResult[]>;
  getLabResultsByPatient(patientId: string, tenantId: string): Promise<LabResult[]>;
  getLabResultsByTenant(tenantId: string): Promise<LabResult[]>;
  getPendingLabResults(tenantId: string): Promise<LabResult[]>;

  // Lab Order Assignment Management
  getLabOrderAssignment(id: string, tenantId: string): Promise<LabOrderAssignment | undefined>;
  createLabOrderAssignment(assignment: InsertLabOrderAssignment): Promise<LabOrderAssignment>;
  updateLabOrderAssignment(id: string, updates: Partial<LabOrderAssignment>, tenantId: string): Promise<LabOrderAssignment | undefined>;
  getLabOrderAssignmentByOrder(labOrderId: string, tenantId: string): Promise<LabOrderAssignment | undefined>;
  getLabOrderAssignmentsByLaboratory(laboratoryId: string, tenantId: string): Promise<LabOrderAssignment[]>;
  getLabOrderAssignmentsByTenant(tenantId: string): Promise<LabOrderAssignment[]>;

  // Laboratory Application Management
  getLaboratoryApplication(id: string): Promise<LaboratoryApplication | undefined>;
  createLaboratoryApplication(application: InsertLaboratoryApplication): Promise<LaboratoryApplication>;
  updateLaboratoryApplication(id: string, updates: Partial<LaboratoryApplication>): Promise<LaboratoryApplication | undefined>;
  getAllLaboratoryApplications(): Promise<LaboratoryApplication[]>;
  getLaboratoryApplicationsByStatus(status: string): Promise<LaboratoryApplication[]>;
  approveLaboratoryApplication(id: string, reviewedBy: string, reviewNotes?: string): Promise<{ laboratory: Laboratory; application: LaboratoryApplication } | undefined>;
  rejectLaboratoryApplication(id: string, reviewedBy: string, reviewNotes: string): Promise<LaboratoryApplication | undefined>;

  // Vital Signs Management
  getVitalSigns(id: string, tenantId: string): Promise<VitalSigns | undefined>;
  createVitalSigns(vitalSigns: InsertVitalSigns): Promise<VitalSigns>;
  updateVitalSigns(id: string, updates: Partial<VitalSigns>, tenantId: string): Promise<VitalSigns | undefined>;
  getVitalSignsByPatient(patientId: string, tenantId: string): Promise<VitalSigns[]>;
  getVitalSignsByAppointment(appointmentId: string, tenantId: string): Promise<VitalSigns | undefined>;
  getVitalSignsByTenant(tenantId: string): Promise<VitalSigns[]>;

  // Visit Summary Management
  getVisitSummary(id: string, tenantId: string): Promise<VisitSummary | undefined>;
  createVisitSummary(visitSummary: InsertVisitSummary): Promise<VisitSummary>;
  updateVisitSummary(id: string, updates: Partial<VisitSummary>, tenantId: string): Promise<VisitSummary | undefined>;
  getVisitSummariesByPatient(patientId: string, tenantId: string): Promise<VisitSummary[]>;
  getVisitSummaryByAppointment(appointmentId: string, tenantId: string): Promise<VisitSummary | undefined>;
  getVisitSummariesByProvider(providerId: string, tenantId: string): Promise<VisitSummary[]>;
  getVisitSummariesByTenant(tenantId: string): Promise<VisitSummary[]>;

  // AI Health Recommendations Management
  getHealthRecommendation(id: string, tenantId: string): Promise<HealthRecommendation | undefined>;
  createHealthRecommendation(recommendation: InsertHealthRecommendation): Promise<HealthRecommendation>;
  updateHealthRecommendation(id: string, updates: Partial<HealthRecommendation>, tenantId: string): Promise<HealthRecommendation | undefined>;
  getHealthRecommendationsByPatient(patientId: string, tenantId: string): Promise<HealthRecommendation[]>;
  getActiveHealthRecommendationsByPatient(patientId: string, tenantId: string): Promise<HealthRecommendation[]>;
  getHealthRecommendationsByTenant(tenantId: string): Promise<HealthRecommendation[]>;
  acknowledgeHealthRecommendation(id: string, acknowledgedBy: string, tenantId: string): Promise<HealthRecommendation | undefined>;

  // AI Health Analysis Management
  getHealthAnalysis(id: string, tenantId: string): Promise<HealthAnalysis | undefined>;
  createHealthAnalysis(analysis: InsertHealthAnalysis): Promise<HealthAnalysis>;
  updateHealthAnalysis(id: string, updates: Partial<HealthAnalysis>, tenantId: string): Promise<HealthAnalysis | undefined>;
  getHealthAnalysesByPatient(patientId: string, tenantId: string): Promise<HealthAnalysis[]>;
  getLatestHealthAnalysis(patientId: string, tenantId: string): Promise<HealthAnalysis | undefined>;
  getHealthAnalysesByTenant(tenantId: string): Promise<HealthAnalysis[]>;
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

  async getUsersByRole(role: string, tenantId: string): Promise<User[]> {
    return await db.select().from(users).where(
      and(
        sql`${users.role} = ${role}`, 
        eq(users.tenantId, tenantId), 
        eq(users.isActive, true)
      )
    );
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

  async updatePrescription(id: string, updates: Partial<Prescription>, tenantId: string): Promise<Prescription | null> {
    const result = await db
      .update(prescriptions)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(and(eq(prescriptions.id, id), eq(prescriptions.tenantId, tenantId)))
      .returning();
    
    return result[0] || null;
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

  // Pharmacy management
  async getPharmacy(id: string, tenantId: string): Promise<Pharmacy | undefined> {
    const [pharmacy] = await db.select().from(pharmacies).where(
      and(eq(pharmacies.id, id), eq(pharmacies.tenantId, tenantId))
    );
    return pharmacy || undefined;
  }

  async createPharmacy(insertPharmacy: InsertPharmacy): Promise<Pharmacy> {
    const [pharmacy] = await db.insert(pharmacies).values(insertPharmacy).returning();
    return pharmacy;
  }

  async updatePharmacy(id: string, updates: Partial<Pharmacy>, tenantId: string): Promise<Pharmacy | undefined> {
    const [pharmacy] = await db.update(pharmacies)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(and(eq(pharmacies.id, id), eq(pharmacies.tenantId, tenantId)))
      .returning();
    return pharmacy || undefined;
  }

  async getPharmaciesByTenant(tenantId: string): Promise<Pharmacy[]> {
    return await db.select().from(pharmacies).where(eq(pharmacies.tenantId, tenantId))
      .orderBy(pharmacies.name);
  }

  async getActivePharmacies(tenantId: string): Promise<Pharmacy[]> {
    return await db.select().from(pharmacies).where(
      and(eq(pharmacies.tenantId, tenantId), eq(pharmacies.isActive, true))
    ).orderBy(pharmacies.name);
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

  // Insurance Provider management
  async getInsuranceProviders(tenantId: string): Promise<InsuranceProvider[]> {
    return await db.select().from(insuranceProviders).where(
      and(eq(insuranceProviders.tenantId, tenantId), eq(insuranceProviders.isActive, true))
    ).orderBy(insuranceProviders.name);
  }

  async createInsuranceProvider(provider: InsertInsuranceProvider): Promise<InsuranceProvider> {
    const [insuranceProvider] = await db.insert(insuranceProviders).values(provider).returning();
    return insuranceProvider;
  }

  // Patient Insurance management
  async getPatientInsurance(patientId: string, tenantId: string): Promise<PatientInsurance[]> {
    return await db.select().from(patientInsurance).where(
      and(eq(patientInsurance.patientId, patientId), eq(patientInsurance.tenantId, tenantId))
    ).orderBy(desc(patientInsurance.isPrimary), patientInsurance.effectiveDate);
  }

  async createPatientInsurance(insurance: InsertPatientInsurance): Promise<PatientInsurance> {
    const [patientIns] = await db.insert(patientInsurance).values(insurance).returning();
    return patientIns;
  }

  // Service Pricing management
  async getServicePrices(tenantId: string): Promise<ServicePrice[]> {
    return await db.select().from(servicePrices).where(
      and(eq(servicePrices.tenantId, tenantId), eq(servicePrices.isActive, true))
    ).orderBy(servicePrices.serviceName);
  }

  async getServicePrice(id: string, tenantId: string): Promise<ServicePrice | undefined> {
    const [servicePrice] = await db.select().from(servicePrices).where(
      and(eq(servicePrices.id, id), eq(servicePrices.tenantId, tenantId))
    );
    return servicePrice || undefined;
  }

  async createServicePrice(servicePrice: InsertServicePrice): Promise<ServicePrice> {
    const [newServicePrice] = await db.insert(servicePrices).values(servicePrice).returning();
    return newServicePrice;
  }

  async updateServicePrice(id: string, updates: Partial<ServicePrice>, tenantId: string): Promise<ServicePrice | undefined> {
    const [servicePrice] = await db.update(servicePrices)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(and(eq(servicePrices.id, id), eq(servicePrices.tenantId, tenantId)))
      .returning();
    return servicePrice || undefined;
  }

  async getServicePriceByCode(serviceCode: string, tenantId: string): Promise<ServicePrice | undefined> {
    const [servicePrice] = await db.select().from(servicePrices).where(
      and(
        eq(servicePrices.serviceCode, serviceCode), 
        eq(servicePrices.tenantId, tenantId),
        eq(servicePrices.isActive, true)
      )
    );
    return servicePrice || undefined;
  }

  // Insurance Plan Coverage management
  async getInsurancePlanCoverages(tenantId: string): Promise<InsurancePlanCoverage[]> {
    return await db.select().from(insurancePlanCoverage).where(
      and(eq(insurancePlanCoverage.tenantId, tenantId), eq(insurancePlanCoverage.isActive, true))
    ).orderBy(insurancePlanCoverage.effectiveDate);
  }

  async getInsurancePlanCoverageByServiceAndProvider(servicePriceId: string, insuranceProviderId: string, tenantId: string): Promise<InsurancePlanCoverage | undefined> {
    const [coverage] = await db.select().from(insurancePlanCoverage).where(
      and(
        eq(insurancePlanCoverage.servicePriceId, servicePriceId),
        eq(insurancePlanCoverage.insuranceProviderId, insuranceProviderId),
        eq(insurancePlanCoverage.tenantId, tenantId),
        eq(insurancePlanCoverage.isActive, true)
      )
    );
    return coverage || undefined;
  }

  async createInsurancePlanCoverage(coverage: InsertInsurancePlanCoverage): Promise<InsurancePlanCoverage> {
    const [newCoverage] = await db.insert(insurancePlanCoverage).values(coverage).returning();
    return newCoverage;
  }

  async updateInsurancePlanCoverage(id: string, updates: Partial<InsurancePlanCoverage>, tenantId: string): Promise<InsurancePlanCoverage | undefined> {
    const [coverage] = await db.update(insurancePlanCoverage)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(and(eq(insurancePlanCoverage.id, id), eq(insurancePlanCoverage.tenantId, tenantId)))
      .returning();
    return coverage || undefined;
  }

  // Claim Line Items management
  async getClaimLineItems(claimId: string, tenantId: string): Promise<ClaimLineItem[]> {
    return await db.select().from(claimLineItems).where(
      and(eq(claimLineItems.claimId, claimId), eq(claimLineItems.tenantId, tenantId))
    ).orderBy(claimLineItems.createdAt);
  }

  async createClaimLineItem(lineItem: InsertClaimLineItem): Promise<ClaimLineItem> {
    const [newLineItem] = await db.insert(claimLineItems).values(lineItem).returning();
    return newLineItem;
  }

  async updateClaimLineItem(id: string, updates: Partial<ClaimLineItem>, tenantId: string): Promise<ClaimLineItem | undefined> {
    const [lineItem] = await db.update(claimLineItems)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(and(eq(claimLineItems.id, id), eq(claimLineItems.tenantId, tenantId)))
      .returning();
    return lineItem || undefined;
  }

  async deleteClaimLineItem(id: string, tenantId: string): Promise<boolean> {
    const result = await db.delete(claimLineItems)
      .where(and(eq(claimLineItems.id, id), eq(claimLineItems.tenantId, tenantId)));
    return result.rowCount > 0;
  }

  // Pricing calculations
  async calculateCopayAndInsuranceAmount(servicePriceId: string, insuranceProviderId: string, patientInsuranceId: string, tenantId: string): Promise<{
    unitPrice: number;
    copayAmount: number;
    insuranceAmount: number;
    deductibleAmount: number;
  }> {
    // Get service price
    const servicePrice = await this.getServicePrice(servicePriceId, tenantId);
    if (!servicePrice) {
      throw new Error('Service price not found');
    }

    const unitPrice = parseFloat(servicePrice.basePrice);

    // Get insurance plan coverage
    const coverage = await this.getInsurancePlanCoverageByServiceAndProvider(
      servicePriceId, 
      insuranceProviderId, 
      tenantId
    );

    if (!coverage) {
      // No specific coverage found, use patient's default copay
      const [patientIns] = await db.select().from(patientInsurance).where(
        and(eq(patientInsurance.id, patientInsuranceId), eq(patientInsurance.tenantId, tenantId))
      );

      if (patientIns && patientIns.copayAmount) {
        const copayAmount = Math.min(parseFloat(patientIns.copayAmount), unitPrice);
        return {
          unitPrice,
          copayAmount,
          insuranceAmount: unitPrice - copayAmount,
          deductibleAmount: 0
        };
      }

      // Default: 20% patient copay
      const copayAmount = unitPrice * 0.20;
      return {
        unitPrice,
        copayAmount,
        insuranceAmount: unitPrice - copayAmount,
        deductibleAmount: 0
      };
    }

    // Calculate based on coverage rules
    let copayAmount = 0;
    let deductibleAmount = 0;

    if (coverage.copayAmount) {
      // Fixed copay amount
      copayAmount = Math.min(parseFloat(coverage.copayAmount), unitPrice);
    } else if (coverage.copayPercentage) {
      // Percentage-based copay
      copayAmount = unitPrice * (parseFloat(coverage.copayPercentage) / 100);
    }

    // Apply maximum coverage limit if set
    let insuranceAmount = unitPrice - copayAmount - deductibleAmount;
    if (coverage.maxCoverageAmount) {
      const maxCoverage = parseFloat(coverage.maxCoverageAmount);
      if (insuranceAmount > maxCoverage) {
        const excess = insuranceAmount - maxCoverage;
        insuranceAmount = maxCoverage;
        copayAmount += excess; // Patient pays the excess
      }
    }

    return {
      unitPrice,
      copayAmount,
      insuranceAmount,
      deductibleAmount
    };
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

  async getAllReports(): Promise<Report[]> {
    return await db.select().from(reports)
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
      total: sql<number>`count(*)::int`,
      active: sql<number>`count(case when ${tenants.isActive} then 1 end)::int`
    }).from(tenants);

    const [usersResult] = await db.select({ count: sql<number>`count(*)::int` }).from(users);
    
    const [patientsResult] = await db.select({ count: sql<number>`count(*)::int` }).from(patients);

    const [subscriptionsResult] = await db.select({ 
      totalRevenue: sql<number>`COALESCE(SUM(${subscriptions.monthlyPrice}), 0)::numeric` 
    }).from(subscriptions).where(eq(subscriptions.status, 'active'));

    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const [monthlyRevenueResult] = await db.select({ 
      monthlyRevenue: sql<number>`COALESCE(SUM(${subscriptions.monthlyPrice}), 0)::numeric` 
    }).from(subscriptions).where(
      and(
        eq(subscriptions.status, 'active'),
        sql`${subscriptions.lastPaymentDate} >= ${firstDayOfMonth}`
      )
    );

    return {
      totalTenants: Number(tenantsResult.total),
      activeTenants: Number(tenantsResult.active),
      totalSubscriptionRevenue: Number(subscriptionsResult.totalRevenue),
      monthlyRevenue: Number(monthlyRevenueResult.monthlyRevenue),
      totalUsers: Number(usersResult.count),
      totalPatients: Number(patientsResult.count)
    };
  }

  // Multilingual Communication management
  async getMedicalCommunication(id: string, tenantId: string): Promise<MedicalCommunication | undefined> {
    const [communication] = await db.select().from(medicalCommunications).where(
      and(eq(medicalCommunications.id, id), eq(medicalCommunications.tenantId, tenantId))
    );
    return communication || undefined;
  }

  async createMedicalCommunication(insertCommunication: InsertMedicalCommunication): Promise<MedicalCommunication> {
    const [communication] = await db.insert(medicalCommunications).values(insertCommunication).returning();
    return communication;
  }

  async updateMedicalCommunication(id: string, updates: Partial<MedicalCommunication>, tenantId: string): Promise<MedicalCommunication | undefined> {
    const [communication] = await db.update(medicalCommunications)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(and(eq(medicalCommunications.id, id), eq(medicalCommunications.tenantId, tenantId)))
      .returning();
    return communication || undefined;
  }

  async getMedicalCommunicationsByPatient(patientId: string, tenantId: string): Promise<MedicalCommunication[]> {
    return await db.select().from(medicalCommunications).where(
      and(eq(medicalCommunications.patientId, patientId), eq(medicalCommunications.tenantId, tenantId))
    ).orderBy(desc(medicalCommunications.createdAt));
  }

  async getMedicalCommunicationsByTenant(tenantId: string): Promise<MedicalCommunication[]> {
    return await db.select().from(medicalCommunications).where(
      eq(medicalCommunications.tenantId, tenantId)
    ).orderBy(desc(medicalCommunications.createdAt));
  }

  // Communication Translation management
  async createCommunicationTranslation(insertTranslation: InsertCommunicationTranslation): Promise<CommunicationTranslation> {
    const [translation] = await db.insert(communicationTranslations).values(insertTranslation).returning();
    return translation;
  }

  async getCommunicationTranslations(communicationId: string): Promise<CommunicationTranslation[]> {
    return await db.select().from(communicationTranslations).where(
      eq(communicationTranslations.communicationId, communicationId)
    );
  }

  // Supported Languages management
  async getSupportedLanguages(tenantId: string): Promise<SupportedLanguage[]> {
    return await db.select().from(supportedLanguages).where(
      and(eq(supportedLanguages.tenantId, tenantId), eq(supportedLanguages.isActive, true))
    ).orderBy(supportedLanguages.languageName);
  }

  async createSupportedLanguage(insertLanguage: InsertSupportedLanguage): Promise<SupportedLanguage> {
    const [language] = await db.insert(supportedLanguages).values(insertLanguage).returning();
    return language;
  }

  async updateSupportedLanguage(id: string, updates: Partial<SupportedLanguage>, tenantId: string): Promise<SupportedLanguage | undefined> {
    const [language] = await db.update(supportedLanguages)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(and(eq(supportedLanguages.id, id), eq(supportedLanguages.tenantId, tenantId)))
      .returning();
    return language || undefined;
  }

  // Medical Phrases management
  async getMedicalPhrases(tenantId: string, category?: string): Promise<MedicalPhrase[]> {
    const conditions = [eq(medicalPhrases.tenantId, tenantId), eq(medicalPhrases.isActive, true)];
    if (category) {
      conditions.push(eq(medicalPhrases.category, category));
    }
    return await db.select().from(medicalPhrases).where(and(...conditions)).orderBy(medicalPhrases.category, medicalPhrases.phraseKey);
  }

  async createMedicalPhrase(insertPhrase: InsertMedicalPhrase): Promise<MedicalPhrase> {
    const [phrase] = await db.insert(medicalPhrases).values(insertPhrase).returning();
    return phrase;
  }

  // Phrase Translation management
  async getPhraseTranslations(phraseId: string): Promise<PhraseTranslation[]> {
    return await db.select().from(phraseTranslations).where(
      eq(phraseTranslations.phraseId, phraseId)
    ).orderBy(phraseTranslations.languageCode);
  }

  async createPhraseTranslation(insertTranslation: InsertPhraseTranslation): Promise<PhraseTranslation> {
    const [translation] = await db.insert(phraseTranslations).values(insertTranslation).returning();
    return translation;
  }

  // Laboratory Management
  async getLaboratory(id: string, tenantId: string): Promise<Laboratory | undefined> {
    const [laboratory] = await db.select().from(laboratories).where(
      and(eq(laboratories.id, id), eq(laboratories.tenantId, tenantId))
    );
    return laboratory || undefined;
  }

  async createLaboratory(insertLaboratory: InsertLaboratory): Promise<Laboratory> {
    const [laboratory] = await db.insert(laboratories).values(insertLaboratory).returning();
    return laboratory;
  }

  async updateLaboratory(id: string, updates: Partial<Laboratory>, tenantId: string): Promise<Laboratory | undefined> {
    const [laboratory] = await db.update(laboratories)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(and(eq(laboratories.id, id), eq(laboratories.tenantId, tenantId)))
      .returning();
    return laboratory || undefined;
  }

  async getLaboratoriesByTenant(tenantId: string): Promise<Laboratory[]> {
    return await db.select().from(laboratories).where(
      eq(laboratories.tenantId, tenantId)
    ).orderBy(laboratories.name);
  }

  async getActiveLaboratoriesByTenant(tenantId: string): Promise<Laboratory[]> {
    return await db.select().from(laboratories).where(
      and(eq(laboratories.tenantId, tenantId), eq(laboratories.isActive, true))
    ).orderBy(laboratories.name);
  }

  // Lab Results Management
  async getLabResult(id: string, tenantId: string): Promise<LabResult | undefined> {
    const [labResult] = await db.select().from(labResults).where(
      and(eq(labResults.id, id), eq(labResults.tenantId, tenantId))
    );
    return labResult || undefined;
  }

  async createLabResult(insertLabResult: InsertLabResult): Promise<LabResult> {
    const [labResult] = await db.insert(labResults).values(insertLabResult).returning();
    return labResult;
  }

  async updateLabResult(id: string, updates: Partial<LabResult>, tenantId: string): Promise<LabResult | undefined> {
    const [labResult] = await db.update(labResults)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(and(eq(labResults.id, id), eq(labResults.tenantId, tenantId)))
      .returning();
    return labResult || undefined;
  }

  async getLabResultsByOrder(labOrderId: string, tenantId: string): Promise<LabResult[]> {
    return await db.select().from(labResults).where(
      and(eq(labResults.labOrderId, labOrderId), eq(labResults.tenantId, tenantId))
    ).orderBy(labResults.testName);
  }

  async getLabResultsByPatient(patientId: string, tenantId: string): Promise<LabResult[]> {
    return await db.select().from(labResults).where(
      and(eq(labResults.patientId, patientId), eq(labResults.tenantId, tenantId))
    ).orderBy(desc(labResults.createdAt));
  }

  async getLabResultsByTenant(tenantId: string): Promise<LabResult[]> {
    return await db.select().from(labResults).where(
      eq(labResults.tenantId, tenantId)
    ).orderBy(desc(labResults.createdAt));
  }

  async getPendingLabResults(tenantId: string): Promise<LabResult[]> {
    return await db.select().from(labResults).where(
      and(eq(labResults.tenantId, tenantId), eq(labResults.status, 'pending'))
    ).orderBy(labResults.createdAt);
  }

  // Lab Order Assignment Management
  async getLabOrderAssignment(id: string, tenantId: string): Promise<LabOrderAssignment | undefined> {
    const [assignment] = await db.select().from(labOrderAssignments).where(
      and(eq(labOrderAssignments.id, id), eq(labOrderAssignments.tenantId, tenantId))
    );
    return assignment || undefined;
  }

  async createLabOrderAssignment(insertAssignment: InsertLabOrderAssignment): Promise<LabOrderAssignment> {
    const [assignment] = await db.insert(labOrderAssignments).values(insertAssignment).returning();
    return assignment;
  }

  async updateLabOrderAssignment(id: string, updates: Partial<LabOrderAssignment>, tenantId: string): Promise<LabOrderAssignment | undefined> {
    const [assignment] = await db.update(labOrderAssignments)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(and(eq(labOrderAssignments.id, id), eq(labOrderAssignments.tenantId, tenantId)))
      .returning();
    return assignment || undefined;
  }

  async getLabOrderAssignmentByOrder(labOrderId: string, tenantId: string): Promise<LabOrderAssignment | undefined> {
    const [assignment] = await db.select().from(labOrderAssignments).where(
      and(eq(labOrderAssignments.labOrderId, labOrderId), eq(labOrderAssignments.tenantId, tenantId))
    );
    return assignment || undefined;
  }

  async getLabOrderAssignmentsByLaboratory(laboratoryId: string, tenantId: string): Promise<LabOrderAssignment[]> {
    return await db.select().from(labOrderAssignments).where(
      and(eq(labOrderAssignments.laboratoryId, laboratoryId), eq(labOrderAssignments.tenantId, tenantId))
    ).orderBy(desc(labOrderAssignments.createdAt));
  }

  async getLabOrderAssignmentsByTenant(tenantId: string): Promise<LabOrderAssignment[]> {
    return await db.select().from(labOrderAssignments).where(
      eq(labOrderAssignments.tenantId, tenantId)
    ).orderBy(desc(labOrderAssignments.createdAt));
  }

  // Laboratory Application Management
  async getLaboratoryApplication(id: string): Promise<LaboratoryApplication | undefined> {
    const [application] = await db.select().from(laboratoryApplications).where(
      eq(laboratoryApplications.id, id)
    );
    return application || undefined;
  }

  async createLaboratoryApplication(insertApplication: InsertLaboratoryApplication): Promise<LaboratoryApplication> {
    const [application] = await db.insert(laboratoryApplications).values(insertApplication).returning();
    return application;
  }

  async updateLaboratoryApplication(id: string, updates: Partial<LaboratoryApplication>): Promise<LaboratoryApplication | undefined> {
    const [application] = await db.update(laboratoryApplications)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(laboratoryApplications.id, id))
      .returning();
    return application || undefined;
  }

  async getAllLaboratoryApplications(): Promise<LaboratoryApplication[]> {
    return await db.select().from(laboratoryApplications)
      .orderBy(desc(laboratoryApplications.createdAt));
  }

  async getLaboratoryApplicationsByStatus(status: string): Promise<LaboratoryApplication[]> {
    return await db.select().from(laboratoryApplications).where(
      eq(laboratoryApplications.status, status)
    ).orderBy(desc(laboratoryApplications.createdAt));
  }

  async approveLaboratoryApplication(id: string, reviewedBy: string, reviewNotes?: string): Promise<{ laboratory: Laboratory; application: LaboratoryApplication } | undefined> {
    const application = await this.getLaboratoryApplication(id);
    if (!application) return undefined;

    // Create a tenant for the external lab
    const labTenant = await this.createTenant({
      name: application.laboratoryName,
      subdomain: application.laboratoryName.toLowerCase().replace(/[^a-z0-9]/g, ''),
      type: "laboratory",
      isActive: true
    });

    // Create the laboratory record
    const laboratory = await this.createLaboratory({
      tenantId: labTenant.id,
      name: application.laboratoryName,
      licenseNumber: application.licenseNumber,
      contactPerson: application.contactPerson,
      phone: application.contactPhone,
      email: application.contactEmail,
      address: application.address,
      specializations: application.specializations,
      isActive: true,
      isExternal: true,
      registrationStatus: "approved",
      registrationNotes: reviewNotes,
      approvedBy: reviewedBy,
      websiteUrl: application.websiteUrl,
      accreditations: application.accreditations,
      operatingHours: application.operatingHours,
      servicesOffered: application.servicesOffered,
      equipmentDetails: application.equipmentDetails,
      certificationDocuments: application.certificationDocuments,
      averageTurnaroundTime: application.averageTurnaroundTime
    });

    // Update the application status
    const updatedApplication = await this.updateLaboratoryApplication(id, {
      status: "approved",
      reviewNotes,
      reviewedBy
    });

    return updatedApplication ? { laboratory, application: updatedApplication } : undefined;
  }

  async rejectLaboratoryApplication(id: string, reviewedBy: string, reviewNotes: string): Promise<LaboratoryApplication | undefined> {
    return await this.updateLaboratoryApplication(id, {
      status: "rejected",
      reviewNotes,
      reviewedBy
    });
  }

  // Vital Signs Management Implementation
  async getVitalSigns(id: string, tenantId: string): Promise<VitalSigns | undefined> {
    const [vitalSign] = await db.select().from(vitalSigns).where(
      and(eq(vitalSigns.id, id), eq(vitalSigns.tenantId, tenantId))
    );
    return vitalSign || undefined;
  }

  async createVitalSigns(insertVitalSigns: InsertVitalSigns): Promise<VitalSigns> {
    // Auto-calculate BMI if height and weight are provided
    const vitalSignsWithBMI = { ...insertVitalSigns };
    if (insertVitalSigns.weight && insertVitalSigns.height) {
      const weightKg = parseFloat(insertVitalSigns.weight.toString()) * 0.453592; // lbs to kg
      const heightM = parseFloat(insertVitalSigns.height.toString()) * 0.0254; // inches to meters
      const bmi = weightKg / (heightM * heightM);
      vitalSignsWithBMI.bodyMassIndex = bmi.toFixed(1);
    }
    
    const [vitalSign] = await db.insert(vitalSigns).values(vitalSignsWithBMI).returning();
    return vitalSign;
  }

  async updateVitalSigns(id: string, updates: Partial<VitalSigns>, tenantId: string): Promise<VitalSigns | undefined> {
    // Recalculate BMI if height or weight is updated
    const updatedData = { ...updates };
    if (updates.weight || updates.height) {
      const current = await this.getVitalSigns(id, tenantId);
      if (current) {
        const weight = updates.weight || current.weight;
        const height = updates.height || current.height;
        if (weight && height) {
          const weightKg = parseFloat(weight.toString()) * 0.453592;
          const heightM = parseFloat(height.toString()) * 0.0254;
          const bmi = weightKg / (heightM * heightM);
          updatedData.bodyMassIndex = bmi.toFixed(1);
        }
      }
    }

    const [vitalSign] = await db.update(vitalSigns)
      .set(updatedData)
      .where(and(eq(vitalSigns.id, id), eq(vitalSigns.tenantId, tenantId)))
      .returning();
    return vitalSign || undefined;
  }

  async getVitalSignsByPatient(patientId: string, tenantId: string): Promise<VitalSigns[]> {
    return await db.select().from(vitalSigns).where(
      and(eq(vitalSigns.patientId, patientId), eq(vitalSigns.tenantId, tenantId))
    ).orderBy(desc(vitalSigns.recordedAt));
  }

  async getVitalSignsByAppointment(appointmentId: string, tenantId: string): Promise<VitalSigns | undefined> {
    const [vitalSign] = await db.select().from(vitalSigns).where(
      and(eq(vitalSigns.appointmentId, appointmentId), eq(vitalSigns.tenantId, tenantId))
    );
    return vitalSign || undefined;
  }

  async getVitalSignsByTenant(tenantId: string): Promise<VitalSigns[]> {
    return await db.select().from(vitalSigns).where(eq(vitalSigns.tenantId, tenantId))
      .orderBy(desc(vitalSigns.recordedAt));
  }

  // Visit Summary Management Implementation
  async getVisitSummary(id: string, tenantId: string): Promise<VisitSummary | undefined> {
    const [visitSummary] = await db.select().from(visitSummaries).where(
      and(eq(visitSummaries.id, id), eq(visitSummaries.tenantId, tenantId))
    );
    return visitSummary || undefined;
  }

  async createVisitSummary(insertVisitSummary: InsertVisitSummary): Promise<VisitSummary> {
    const [visitSummary] = await db.insert(visitSummaries).values(insertVisitSummary).returning();
    return visitSummary;
  }

  async updateVisitSummary(id: string, updates: Partial<VisitSummary>, tenantId: string): Promise<VisitSummary | undefined> {
    const [visitSummary] = await db.update(visitSummaries)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(and(eq(visitSummaries.id, id), eq(visitSummaries.tenantId, tenantId)))
      .returning();
    return visitSummary || undefined;
  }

  async getVisitSummariesByPatient(patientId: string, tenantId: string): Promise<VisitSummary[]> {
    return await db.select().from(visitSummaries).where(
      and(eq(visitSummaries.patientId, patientId), eq(visitSummaries.tenantId, tenantId))
    ).orderBy(desc(visitSummaries.visitDate));
  }

  async getVisitSummaryByAppointment(appointmentId: string, tenantId: string): Promise<VisitSummary | undefined> {
    const [visitSummary] = await db.select().from(visitSummaries).where(
      and(eq(visitSummaries.appointmentId, appointmentId), eq(visitSummaries.tenantId, tenantId))
    );
    return visitSummary || undefined;
  }

  async getVisitSummariesByProvider(providerId: string, tenantId: string): Promise<VisitSummary[]> {
    return await db.select().from(visitSummaries).where(
      and(eq(visitSummaries.providerId, providerId), eq(visitSummaries.tenantId, tenantId))
    ).orderBy(desc(visitSummaries.visitDate));
  }

  async getVisitSummariesByTenant(tenantId: string): Promise<VisitSummary[]> {
    return await db.select().from(visitSummaries).where(eq(visitSummaries.tenantId, tenantId))
      .orderBy(desc(visitSummaries.visitDate));
  }

  // AI Health Recommendations Management Implementation
  async getHealthRecommendation(id: string, tenantId: string): Promise<HealthRecommendation | undefined> {
    const [recommendation] = await db.select().from(healthRecommendations).where(
      and(eq(healthRecommendations.id, id), eq(healthRecommendations.tenantId, tenantId))
    );
    return recommendation || undefined;
  }

  async createHealthRecommendation(insertRecommendation: InsertHealthRecommendation): Promise<HealthRecommendation> {
    const [recommendation] = await db.insert(healthRecommendations).values(insertRecommendation).returning();
    return recommendation;
  }

  async updateHealthRecommendation(id: string, updates: Partial<HealthRecommendation>, tenantId: string): Promise<HealthRecommendation | undefined> {
    const [recommendation] = await db.update(healthRecommendations)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(and(eq(healthRecommendations.id, id), eq(healthRecommendations.tenantId, tenantId)))
      .returning();
    return recommendation || undefined;
  }

  async getHealthRecommendationsByPatient(patientId: string, tenantId: string): Promise<HealthRecommendation[]> {
    return await db.select().from(healthRecommendations).where(
      and(eq(healthRecommendations.patientId, patientId), eq(healthRecommendations.tenantId, tenantId))
    ).orderBy(desc(healthRecommendations.createdAt));
  }

  async getActiveHealthRecommendationsByPatient(patientId: string, tenantId: string): Promise<HealthRecommendation[]> {
    return await db.select().from(healthRecommendations).where(
      and(
        eq(healthRecommendations.patientId, patientId), 
        eq(healthRecommendations.tenantId, tenantId),
        eq(healthRecommendations.status, 'active')
      )
    ).orderBy(desc(healthRecommendations.createdAt));
  }

  async getHealthRecommendationsByTenant(tenantId: string): Promise<HealthRecommendation[]> {
    return await db.select().from(healthRecommendations).where(eq(healthRecommendations.tenantId, tenantId))
      .orderBy(desc(healthRecommendations.createdAt));
  }

  async acknowledgeHealthRecommendation(id: string, acknowledgedBy: string, tenantId: string): Promise<HealthRecommendation | undefined> {
    const [recommendation] = await db.update(healthRecommendations)
      .set({ 
        acknowledgedAt: sql`CURRENT_TIMESTAMP`,
        acknowledgedBy: acknowledgedBy,
        updatedAt: sql`CURRENT_TIMESTAMP`
      })
      .where(and(eq(healthRecommendations.id, id), eq(healthRecommendations.tenantId, tenantId)))
      .returning();
    return recommendation || undefined;
  }

  // AI Health Analysis Management Implementation
  async getHealthAnalysis(id: string, tenantId: string): Promise<HealthAnalysis | undefined> {
    const [analysis] = await db.select().from(healthAnalyses).where(
      and(eq(healthAnalyses.id, id), eq(healthAnalyses.tenantId, tenantId))
    );
    return analysis || undefined;
  }

  async createHealthAnalysis(insertAnalysis: InsertHealthAnalysis): Promise<HealthAnalysis> {
    const [analysis] = await db.insert(healthAnalyses).values(insertAnalysis).returning();
    return analysis;
  }

  async updateHealthAnalysis(id: string, updates: Partial<HealthAnalysis>, tenantId: string): Promise<HealthAnalysis | undefined> {
    const [analysis] = await db.update(healthAnalyses)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(and(eq(healthAnalyses.id, id), eq(healthAnalyses.tenantId, tenantId)))
      .returning();
    return analysis || undefined;
  }

  async getHealthAnalysesByPatient(patientId: string, tenantId: string): Promise<HealthAnalysis[]> {
    return await db.select().from(healthAnalyses).where(
      and(eq(healthAnalyses.patientId, patientId), eq(healthAnalyses.tenantId, tenantId))
    ).orderBy(desc(healthAnalyses.createdAt));
  }

  async getLatestHealthAnalysis(patientId: string, tenantId: string): Promise<HealthAnalysis | undefined> {
    const [analysis] = await db.select().from(healthAnalyses).where(
      and(eq(healthAnalyses.patientId, patientId), eq(healthAnalyses.tenantId, tenantId))
    ).orderBy(desc(healthAnalyses.createdAt)).limit(1);
    return analysis || undefined;
  }

  async getHealthAnalysesByTenant(tenantId: string): Promise<HealthAnalysis[]> {
    return await db.select().from(healthAnalyses).where(eq(healthAnalyses.tenantId, tenantId))
      .orderBy(desc(healthAnalyses.createdAt));
  }
}

export const storage = new DatabaseStorage();
