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
  medicationCopays,
  rolePermissions,
  patientBills,
  patientPayments,
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
  type MedicationCopay,
  type InsertMedicationCopay,
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
  type PatientBill,
  type InsertPatientBill,
  type PatientPayment,
  type InsertPatientPayment,
  type HealthRecommendation,
  type InsertHealthRecommendation,
  type HealthAnalysis,
  type InsertHealthAnalysis,
  patientCheckIns,
  type PatientCheckIn,
  type InsertPatientCheckIn,
  type RolePermission,
  type InsertRolePermission
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, like, or } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string, tenantId: string): Promise<User | undefined>;
  getUserByEmail(email: string, tenantId: string): Promise<User | undefined>;
  getUserByEmailOrUsername(emailOrUsername: string, tenantId: string): Promise<User | undefined>;
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
  getAllPatients(limit?: number, offset?: number): Promise<Patient[]>;
  searchPatientsGlobal(query: string): Promise<Patient[]>;
  getPatientsWithPrescriptionsForPharmacy(pharmacyTenantId: string, search?: string): Promise<Patient[]>;

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
  getPrescriptionsByPharmacy(pharmacyTenantId: string): Promise<any[]>;

  // Lab order management
  getLabOrder(id: string, tenantId: string): Promise<LabOrder | undefined>;
  createLabOrder(labOrder: InsertLabOrder): Promise<LabOrder>;
  updateLabOrder(id: string, updates: Partial<LabOrder>, tenantId: string): Promise<LabOrder | undefined>;
  getLabOrdersByPatient(patientId: string, tenantId?: string): Promise<LabOrder[]>;
  getLabOrdersByTenant(tenantId: string): Promise<LabOrder[]>;
  getLabOrdersForLaboratory(tenantId: string): Promise<any[]>;
  getLabOrdersByPatientMrn(patientMrn: string): Promise<any[]>;
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

  // Medication Copay Management
  getMedicationCopay(id: string, tenantId: string): Promise<MedicationCopay | undefined>;
  createMedicationCopay(copay: InsertMedicationCopay): Promise<MedicationCopay>;
  updateMedicationCopay(id: string, updates: Partial<MedicationCopay>, tenantId: string): Promise<MedicationCopay | undefined>;
  getMedicationCopaysByPatient(patientId: string, tenantId: string): Promise<MedicationCopay[]>;
  getMedicationCopaysByPatientInsurance(patientInsuranceId: string, tenantId: string): Promise<MedicationCopay[]>;
  getMedicationCopaysByPrescription(prescriptionId: string, tenantId: string): Promise<MedicationCopay[]>;
  getMedicationCopaysByPharmacist(pharmacistId: string, tenantId: string): Promise<MedicationCopay[]>;
  getMedicationCopaysByTenant(tenantId: string): Promise<MedicationCopay[]>;
  getActiveMedicationCopaysByPatient(patientId: string, tenantId: string): Promise<MedicationCopay[]>;

  // Pricing Plans
  getPricingPlans(): Promise<any[]>;
  createPricingPlan(data: any): Promise<any>;
  updatePricingPlan(id: string, data: any): Promise<any>;

  // White Label Settings
  updateTenantWhiteLabel(tenantId: string, settings: any): Promise<Tenant | null>;

  // Offline Sync
  syncOfflineData(syncData: any): Promise<any>;

  // Patient Check-ins for receptionist workflow
  getPatientCheckIn(id: string, tenantId: string): Promise<PatientCheckIn | undefined>;
  createPatientCheckIn(checkIn: InsertPatientCheckIn): Promise<PatientCheckIn>;
  updatePatientCheckIn(id: string, updates: Partial<PatientCheckIn>, tenantId: string): Promise<PatientCheckIn | undefined>;
  getPatientCheckInsByTenant(tenantId: string, date?: Date): Promise<PatientCheckIn[]>;
  getPatientCheckInsByDate(date: string, tenantId: string): Promise<any[]>;
  getWaitingPatients(tenantId: string): Promise<any[]>;
  getTodaysCheckIns(tenantId: string): Promise<any[]>;
  getOfflineData(tenantId: string): Promise<any>;

  // Translations
  getTranslations(tenantId: string, language: string): Promise<any[]>;
  createTranslation(data: any): Promise<any>;

  // Role Permissions Management
  getRolePermissions(tenantId: string): Promise<RolePermission[]>;
  getRolePermissionsByRole(role: string, tenantId: string): Promise<RolePermission[]>;
  createRolePermission(permission: InsertRolePermission): Promise<RolePermission>;
  updateRolePermission(id: string, updates: Partial<RolePermission>, tenantId: string): Promise<RolePermission | undefined>;
  deleteRolePermission(id: string, tenantId: string): Promise<boolean>;
  getRolePermissionByRoleAndModule(role: string, module: string, tenantId: string): Promise<RolePermission | undefined>;

  // Patient Billing operations
  createPatientBill(bill: InsertPatientBill): Promise<PatientBill>;
  getPatientBills(patientId: string, tenantId: string): Promise<PatientBill[]>;
  getPatientBill(id: string, tenantId: string): Promise<PatientBill | undefined>;
  updatePatientBill(id: string, bill: Partial<InsertPatientBill>, tenantId: string): Promise<PatientBill>;
  createPatientPayment(payment: InsertPatientPayment): Promise<PatientPayment>;
  getPatientPayments(patientBillId: string, tenantId: string): Promise<PatientPayment[]>;
  
  // Patient Account Activation
  generatePatientCredentials(patientId: string, tenantId: string): Promise<{tempPassword: string, activationToken: string}>;
  sendPatientActivationMessage(patient: Patient, tempPassword: string, activationToken: string): Promise<boolean>;
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

  async getUserByEmailOrUsername(emailOrUsername: string, tenantId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(
      and(
        or(eq(users.email, emailOrUsername), eq(users.username, emailOrUsername)),
        eq(users.tenantId, tenantId)
      )
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

  async getTenantsByType(tenantType: string): Promise<Tenant[]> {
    return await db.select().from(tenants).where(
      and(eq(tenants.type, tenantType as any), eq(tenants.isActive, true))
    );
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

  async getAllPatients(limit = 50, offset = 0): Promise<Patient[]> {
    return await db.select().from(patients)
      .where(eq(patients.isActive, true))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(patients.createdAt));
  }

  async searchPatientsGlobal(query: string): Promise<Patient[]> {
    return await db.select().from(patients).where(
      and(
        eq(patients.isActive, true),
        sql`(LOWER(${patients.firstName}) LIKE LOWER('%' || ${query} || '%') OR 
             LOWER(${patients.lastName}) LIKE LOWER('%' || ${query} || '%') OR 
             ${patients.mrn} LIKE '%' || ${query} || '%')`
      )
    );
  }

  async getPatientsWithPrescriptionsForPharmacy(pharmacyTenantId: string, search?: string): Promise<Patient[]> {
    // Get patients who have prescriptions sent to this pharmacy
    const query = db
      .selectDistinct({
        id: patients.id,
        tenantId: patients.tenantId,
        firstName: patients.firstName,
        lastName: patients.lastName,
        dateOfBirth: patients.dateOfBirth,
        gender: patients.gender,
        phone: patients.phone,
        email: patients.email,
        address: patients.address,
        mrn: patients.mrn,
        emergencyContact: patients.emergencyContact,
        allergies: patients.allergies,
        medications: patients.medications,
        isActive: patients.isActive,
        createdAt: patients.createdAt,
        updatedAt: patients.updatedAt
      })
      .from(patients)
      .innerJoin(prescriptions, eq(prescriptions.patientId, patients.id))
      .where(
        and(
          eq(prescriptions.pharmacyTenantId, pharmacyTenantId),
          eq(patients.isActive, true)
        )
      );

    if (search) {
      return await db
        .select({
          id: prescriptions.id,
          tenantId: prescriptions.tenantId,
          patientId: prescriptions.patientId,
          providerId: prescriptions.providerId,
          appointmentId: prescriptions.appointmentId,
          pharmacyTenantId: prescriptions.pharmacyTenantId,
          medicationName: prescriptions.medicationName,
          dosage: prescriptions.dosage,
          frequency: prescriptions.frequency,
          quantity: prescriptions.quantity,
          refills: prescriptions.refills,
          instructions: prescriptions.instructions,
          status: prescriptions.status,
          prescribedDate: prescriptions.prescribedDate,
          sentToPharmacyDate: prescriptions.sentToPharmacyDate,
          filledDate: prescriptions.filledDate,
          expiryDate: prescriptions.expiryDate,
          createdAt: prescriptions.createdAt,
          updatedAt: prescriptions.updatedAt,
          // Provider (doctor) information
          providerName: users.firstName,
          providerLastName: users.lastName,
          providerUsername: users.username,
          // Hospital/clinic information
          hospitalName: tenants.name,
          hospitalType: tenants.type
        })
        .from(prescriptions)
        .innerJoin(users, eq(prescriptions.providerId, users.id))
        .innerJoin(tenants, eq(prescriptions.tenantId, tenants.id))
        .innerJoin(patients, eq(prescriptions.patientId, patients.id))
        .where(
          and(
            eq(prescriptions.pharmacyTenantId, pharmacyTenantId),
            eq(patients.isActive, true),
            sql`(LOWER(${patients.firstName}) LIKE LOWER('%' || ${search} || '%') OR 
                 LOWER(${patients.lastName}) LIKE LOWER('%' || ${search} || '%') OR 
                 ${patients.mrn} LIKE '%' || ${search} || '%')`
          )
        )
        .orderBy(desc(prescriptions.sentToPharmacyDate));
    }

    return await query.orderBy(desc(patients.createdAt));
  }

  // Enhanced medical records methods for healthcare professionals
  async getPatientsWithMedicalRecords(tenantId: string): Promise<any[]> {
    const patientsList = await db
      .select({
        id: patients.id,
        tenantId: patients.tenantId,
        firstName: patients.firstName,
        lastName: patients.lastName,
        dateOfBirth: patients.dateOfBirth,
        gender: patients.gender,
        phone: patients.phone,
        email: patients.email,
        address: patients.address,
        mrn: patients.mrn,
        emergencyContact: patients.emergencyContact,
        allergies: patients.allergies,
        medications: patients.medications,
        medicalHistory: patients.medicalHistory,
        isActive: patients.isActive,
        createdAt: patients.createdAt,
        updatedAt: patients.updatedAt
      })
      .from(patients)
      .where(and(eq(patients.tenantId, tenantId), eq(patients.isActive, true)))
      .orderBy(desc(patients.updatedAt));

    // Enhance each patient with medical activity data
    const enhancedPatients = await Promise.all(
      patientsList.map(async (patient) => {
        // Get latest appointment for last visit
        const latestAppointments = await db
          .select({ appointmentDate: appointments.appointmentDate })
          .from(appointments)
          .where(eq(appointments.patientId, patient.id))
          .orderBy(desc(appointments.appointmentDate))
          .limit(1);

        // Count upcoming appointments
        const upcomingCount = await db
          .select({ count: sql`count(*)` })
          .from(appointments)
          .where(
            and(
              eq(appointments.patientId, patient.id),
              sql`${appointments.appointmentDate} > NOW()`
            )
          );

        // Count active prescriptions
        const prescriptionCount = await db
          .select({ count: sql`count(*)` })
          .from(prescriptions)
          .where(
            and(
              eq(prescriptions.patientId, patient.id),
              sql`${prescriptions.status} IN ('prescribed', 'sent_to_pharmacy', 'filled')`
            )
          );

        // Count pending lab orders
        const labOrderCount = await db
          .select({ count: sql`count(*)` })
          .from(labOrders)
          .where(
            and(
              eq(labOrders.patientId, patient.id),
              sql`${labOrders.status} IN ('ordered', 'collected', 'processing')`
            )
          );

        return {
          ...patient,
          lastVisit: latestAppointments[0]?.appointmentDate || null,
          upcomingAppointments: Number(upcomingCount[0]?.count) || 0,
          activePrescriptions: Number(prescriptionCount[0]?.count) || 0,
          pendingLabOrders: Number(labOrderCount[0]?.count) || 0
        };
      })
    );

    return enhancedPatients;
  }

  async getCompletePatientRecord(patientId: string, tenantId: string): Promise<any | null> {
    // Get base patient information
    const [patient] = await db
      .select()
      .from(patients)
      .where(and(eq(patients.id, patientId), eq(patients.tenantId, tenantId)));

    if (!patient) return null;

    // Get all appointments with provider information
    const patientAppointments = await db
      .select({
        appointment: appointments,
        providerName: users.firstName,
        providerLastName: users.lastName,
        providerRole: users.role
      })
      .from(appointments)
      .leftJoin(users, eq(appointments.providerId, users.id))
      .where(eq(appointments.patientId, patientId))
      .orderBy(desc(appointments.appointmentDate));

    // Get all prescriptions with provider information
    const patientPrescriptions = await db
      .select({
        prescription: prescriptions,
        providerName: users.firstName,
        providerLastName: users.lastName
      })
      .from(prescriptions)
      .leftJoin(users, eq(prescriptions.providerId, users.id))
      .where(eq(prescriptions.patientId, patientId))
      .orderBy(desc(prescriptions.prescribedDate));

    // Get all lab orders
    const patientLabOrders = await db
      .select()
      .from(labOrders)
      .where(eq(labOrders.patientId, patientId))
      .orderBy(desc(labOrders.createdAt));

    // Get all vital signs
    const patientVitalSigns = await db
      .select()
      .from(vitalSigns)
      .where(eq(vitalSigns.patientId, patientId))
      .orderBy(desc(vitalSigns.recordedAt));

    // Get all visit summaries with provider information
    const patientVisitSummaries = await db
      .select({
        visitSummary: visitSummaries,
        providerName: users.firstName,
        providerLastName: users.lastName,
        providerRole: users.role
      })
      .from(visitSummaries)
      .leftJoin(users, eq(visitSummaries.providerId, users.id))
      .where(eq(visitSummaries.patientId, patientId))
      .orderBy(desc(visitSummaries.visitDate));

    return {
      ...patient,
      appointments: patientAppointments,
      prescriptions: patientPrescriptions,
      labOrders: patientLabOrders,
      vitalSigns: patientVitalSigns,
      visitSummaries: patientVisitSummaries
    };
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

  async getAppointmentsByPatientWithDoctorInfo(patientId: string, tenantId: string): Promise<any[]> {
    return await db
      .select({
        id: appointments.id,
        appointment_date: appointments.appointmentDate,
        type: appointments.type,
        status: appointments.status,
        notes: appointments.notes,
        chief_complaint: appointments.chiefComplaint,
        doctor_first_name: users.firstName,
        doctor_last_name: users.lastName,
        doctor_role: users.role
      })
      .from(appointments)
      .leftJoin(users, eq(appointments.providerId, users.id))
      .where(and(eq(appointments.patientId, patientId), eq(appointments.tenantId, tenantId)))
      .orderBy(desc(appointments.appointmentDate));
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

  async getPrescriptionsByPatient(patientId: string, tenantId: string): Promise<Prescription[]> {
    return await db.select().from(prescriptions).where(
      and(eq(prescriptions.patientId, patientId), eq(prescriptions.tenantId, tenantId))
    ).orderBy(desc(prescriptions.prescribedDate));
  }

  async getPrescriptionsByTenant(tenantId: string): Promise<Prescription[]> {
    return await db.select().from(prescriptions).where(eq(prescriptions.tenantId, tenantId))
      .orderBy(desc(prescriptions.prescribedDate));
  }

  async getPrescriptionsByPharmacy(pharmacyTenantId: string): Promise<any[]> {
    const result = await db
      .select({
        id: prescriptions.id,
        tenantId: prescriptions.tenantId,
        patientId: prescriptions.patientId,
        providerId: prescriptions.providerId,
        appointmentId: prescriptions.appointmentId,
        pharmacyTenantId: prescriptions.pharmacyTenantId,
        medicationName: prescriptions.medicationName,
        dosage: prescriptions.dosage,
        frequency: prescriptions.frequency,
        quantity: prescriptions.quantity,
        refills: prescriptions.refills,
        instructions: prescriptions.instructions,
        status: prescriptions.status,
        prescribedDate: prescriptions.prescribedDate,
        sentToPharmacyDate: prescriptions.sentToPharmacyDate,
        filledDate: prescriptions.filledDate,
        expiryDate: prescriptions.expiryDate,
        createdAt: prescriptions.createdAt,
        updatedAt: prescriptions.updatedAt,
        // Provider (doctor) information
        providerName: users.firstName,
        providerLastName: users.lastName,
        providerUsername: users.username,
        // Hospital/clinic information
        hospitalName: tenants.name,
        hospitalType: tenants.type
      })
      .from(prescriptions)
      .innerJoin(users, eq(prescriptions.providerId, users.id))
      .innerJoin(tenants, eq(prescriptions.tenantId, tenants.id))
      .where(eq(prescriptions.pharmacyTenantId, pharmacyTenantId))
      .orderBy(desc(prescriptions.sentToPharmacyDate));
    
    console.log(`Found ${result.length} prescriptions for pharmacy ${pharmacyTenantId}`);
    if (result.length > 0) {
      console.log("Sample prescription with provider info:", {
        medicationName: result[0].medicationName,
        providerName: result[0].providerName,
        hospitalName: result[0].hospitalName
      });
    }
    
    return result;
  }

  async updatePrescription(id: string, updates: Partial<Prescription>, tenantId: string): Promise<Prescription | undefined> {
    const [prescription] = await db.update(prescriptions)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(and(eq(prescriptions.id, id), eq(prescriptions.tenantId, tenantId)))
      .returning();
    return prescription || undefined;
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

  async getLabOrdersByPatient(patientId: string, tenantId?: string): Promise<LabOrder[]> {
    // For patient portal, get all lab orders for this patient regardless of which tenant created them
    const whereConditions = tenantId ? 
      and(eq(labOrders.patientId, patientId), eq(labOrders.tenantId, tenantId)) :
      eq(labOrders.patientId, patientId);
      
    return await db.select().from(labOrders).where(whereConditions)
      .orderBy(desc(labOrders.orderedDate));
  }

  async getLabOrdersByTenant(tenantId: string): Promise<LabOrder[]> {
    // For hospitals/clinics, show only pending orders by default (exclude completed/cancelled)
    return await db.select().from(labOrders).where(
      and(
        eq(labOrders.tenantId, tenantId),
        sql`${labOrders.status} NOT IN ('completed', 'cancelled')`
      )
    ).orderBy(desc(labOrders.orderedDate));
  }

  async getArchivedLabOrdersByTenant(tenantId: string): Promise<LabOrder[]> {
    // For hospitals/clinics, show only completed/cancelled orders
    return await db.select().from(labOrders).where(
      and(
        eq(labOrders.tenantId, tenantId),
        sql`${labOrders.status} IN ('completed', 'cancelled')`
      )
    ).orderBy(desc(labOrders.orderedDate));
  }

  // Get lab orders sent TO a specific laboratory (cross-tenant)
  async getLabOrdersByLabTenant(labTenantId: string): Promise<LabOrder[]> {
    return await db.select().from(labOrders).where(eq(labOrders.labTenantId, labTenantId))
      .orderBy(desc(labOrders.orderedDate));
  }

  // Get patient record by user ID (for patient portal)
  async getPatientByUserId(userId: string, tenantId: string): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(
      and(eq(patients.userId, userId), eq(patients.tenantId, tenantId))
    );
    return patient || undefined;
  }

  // Get lab orders sent to a specific laboratory (cross-tenant)
  async getLabOrdersForLaboratory(laboratoryTenantId: string): Promise<any[]> {
    // Get all lab orders assigned to this laboratory
    const orders = await db.select({
      id: labOrders.id,
      testName: labOrders.testName,
      testCode: labOrders.testCode,
      instructions: labOrders.instructions,
      priority: labOrders.priority,
      status: labOrders.status,
      orderedDate: labOrders.orderedDate,
      patientId: labOrders.patientId,
      originatingHospitalId: labOrders.tenantId
    }).from(labOrders)
      .where(eq(labOrders.labTenantId, laboratoryTenantId))
      .orderBy(desc(labOrders.orderedDate));

    // Enrich with patient and hospital information
    const enrichedOrders = await Promise.all(orders.map(async (order) => {
      // Get patient info
      const patientInfo = await db.select({
        firstName: patients.firstName,
        lastName: patients.lastName,
        mrn: patients.mrn
      }).from(patients)
        .where(eq(patients.id, order.patientId))
        .limit(1);

      // Get originating hospital info
      const hospitalInfo = await db.select({
        name: tenants.name
      }).from(tenants)
        .where(eq(tenants.id, order.originatingHospitalId))
        .limit(1);

      return {
        ...order,
        patientFirstName: patientInfo[0]?.firstName || 'Unknown',
        patientLastName: patientInfo[0]?.lastName || 'Patient',
        patientMrn: patientInfo[0]?.mrn || 'N/A',
        originatingHospital: hospitalInfo[0]?.name || 'Unknown Hospital'
      };
    }));

    return enrichedOrders;
  }

  async getPendingLabOrders(tenantId: string): Promise<LabOrder[]> {
    return await db.select().from(labOrders).where(
      and(
        eq(labOrders.tenantId, tenantId),
        sql`${labOrders.status} IN ('ordered', 'collected', 'processing')`
      )
    ).orderBy(labOrders.orderedDate);
  }

  // Laboratory workflow methods - simplified to avoid query complexity issues
  async getLabOrdersForLaboratory(tenantId: string): Promise<any[]> {
    // Get basic lab orders sent to this laboratory (exclude completed ones for active view)
    const orders = await db.select().from(labOrders)
      .where(
        and(
          eq(labOrders.labTenantId, tenantId),
          sql`${labOrders.status} NOT IN ('completed', 'cancelled')`
        )
      )
      .orderBy(desc(labOrders.orderedDate));
      
    // Enrich with patient and hospital information
    const enrichedOrders = await Promise.all(orders.map(async (order) => {
      const patient = await db.select().from(patients).where(eq(patients.id, order.patientId)).limit(1);
      const hospital = await db.select().from(tenants).where(eq(tenants.id, order.tenantId)).limit(1);
      
      return {
        ...order,
        patientMrn: patient[0]?.mrn,
        patientFirstName: patient[0]?.firstName,
        patientLastName: patient[0]?.lastName,
        patientDateOfBirth: patient[0]?.dateOfBirth,
        originatingHospital: hospital[0]?.name
      };
    }));
    
    return enrichedOrders;
  }

  async getArchivedLabOrdersForLaboratory(tenantId: string): Promise<any[]> {
    // Get completed/cancelled lab orders sent to this laboratory
    const orders = await db.select().from(labOrders)
      .where(
        and(
          eq(labOrders.labTenantId, tenantId),
          sql`${labOrders.status} IN ('completed', 'cancelled')`
        )
      )
      .orderBy(desc(labOrders.orderedDate));
      
    // Enrich with patient and hospital information
    const enrichedOrders = await Promise.all(orders.map(async (order) => {
      const patient = await db.select().from(patients).where(eq(patients.id, order.patientId)).limit(1);
      const hospital = await db.select().from(tenants).where(eq(tenants.id, order.tenantId)).limit(1);
      
      return {
        ...order,
        patientMrn: patient[0]?.mrn,
        patientFirstName: patient[0]?.firstName,
        patientLastName: patient[0]?.lastName,
        patientDateOfBirth: patient[0]?.dateOfBirth,
        originatingHospital: hospital[0]?.name
      };
    }));
    
    return enrichedOrders;
  }

  async getLabOrdersByPatientMrn(patientMrn: string): Promise<any[]> {
    // Find patient by MRN first
    const patientResult = await db.select().from(patients).where(eq(patients.mrn, patientMrn));
    if (patientResult.length === 0) {
      return [];
    }
    
    const patient = patientResult[0];
    
    // Get lab orders for this patient
    const orders = await db.select().from(labOrders)
      .where(eq(labOrders.patientId, patient.id))
      .orderBy(desc(labOrders.orderedDate));
      
    // Enrich with hospital information
    const enrichedOrders = await Promise.all(orders.map(async (order) => {
      const hospital = await db.select().from(tenants).where(eq(tenants.id, order.tenantId)).limit(1);
      
      return {
        ...order,
        patientMrn: patient.mrn,
        patientFirstName: patient.firstName,
        patientLastName: patient.lastName,
        patientDateOfBirth: patient.dateOfBirth,
        originatingHospital: hospital[0]?.name
      };
    }));
    
    return enrichedOrders;
  }

  // Pharmacy management
  async getPharmacy(id: string, tenantId: string): Promise<Pharmacy | undefined> {
    const [pharmacy] = await db.select().from(pharmacies).where(
      and(eq(pharmacies.id, id), eq(pharmacies.tenantId, tenantId))
    );
    return pharmacy || undefined;
  }

  async createPharmacy(insertPharmacy: InsertPharmacy): Promise<Pharmacy> {
    const [pharmacy] = await db.insert(pharmacies).values([insertPharmacy]).returning();
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

  async getMedicalCommunicationsByTenantWithSenderInfo(tenantId: string): Promise<any[]> {
    return await db
      .select({
        id: medicalCommunications.id,
        tenantId: medicalCommunications.tenantId,
        patientId: medicalCommunications.patientId,
        senderId: medicalCommunications.senderId,
        recipientId: medicalCommunications.recipientId,
        type: medicalCommunications.type,
        priority: medicalCommunications.priority,
        originalLanguage: medicalCommunications.originalLanguage,
        targetLanguages: medicalCommunications.targetLanguages,
        originalContent: medicalCommunications.originalContent,
        metadata: medicalCommunications.metadata,
        appointmentId: medicalCommunications.appointmentId,
        prescriptionId: medicalCommunications.prescriptionId,
        labOrderId: medicalCommunications.labOrderId,
        isRead: medicalCommunications.isRead,
        readAt: medicalCommunications.readAt,
        createdAt: medicalCommunications.createdAt,
        updatedAt: medicalCommunications.updatedAt,
        senderRole: users.role,
        senderFirstName: users.firstName,
        senderLastName: users.lastName
      })
      .from(medicalCommunications)
      .leftJoin(users, eq(medicalCommunications.senderId, users.id))
      .where(eq(medicalCommunications.tenantId, tenantId))
      .orderBy(desc(medicalCommunications.createdAt));
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
    
    // Automatically notify hospital and update lab order status
    await this.notifyHospitalOfResults(labResult);
    
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

  // Cross-tenant lab results access for doctors and patients
  async getLabResultsForPatientAcrossTenants(patientId: string): Promise<any[]> {
    // Get all lab results for a patient across all tenants (for doctors to view)
    const results = await db.select({
      id: labResults.id,
      labOrderId: labResults.labOrderId,
      testName: labResults.testName,
      result: labResults.result,
      normalRange: labResults.normalRange,
      unit: labResults.unit,
      status: labResults.status,
      abnormalFlag: labResults.abnormalFlag,
      notes: labResults.notes,
      performedBy: labResults.performedBy,
      completedAt: labResults.completedAt,
      reportedAt: labResults.reportedAt,
      createdAt: labResults.createdAt,
      laboratoryTenantId: labResults.tenantId
    }).from(labResults)
      .where(eq(labResults.patientId, patientId))
      .orderBy(desc(labResults.completedAt));

    // Enrich with laboratory information
    const enrichedResults = await Promise.all(results.map(async (result) => {
      const lab = await db.select().from(tenants).where(eq(tenants.id, result.laboratoryTenantId)).limit(1);
      return {
        ...result,
        laboratoryName: lab[0]?.name || 'Unknown Laboratory'
      };
    }));

    return enrichedResults;
  }

  // Method to automatically notify hospitals when results are posted
  async notifyHospitalOfResults(labResult: LabResult): Promise<void> {
    // Get the original lab order to find the ordering hospital
    const labOrder = await db.select().from(labOrders).where(eq(labOrders.id, labResult.labOrderId)).limit(1);
    if (labOrder.length > 0) {
      // Update the lab order status to completed
      await db.update(labOrders)
        .set({ 
          status: 'completed',
          results: { completed: true, resultId: labResult.id },
          updatedAt: sql`CURRENT_TIMESTAMP` 
        })
        .where(eq(labOrders.id, labResult.labOrderId));
    }
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

  async getLabOrderAssignmentsByOrder(labOrderId: string): Promise<LabOrderAssignment[]> {
    return await db.select().from(labOrderAssignments).where(
      eq(labOrderAssignments.labOrderId, labOrderId)
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

  // Medication Copay Management Implementation
  async getMedicationCopay(id: string, tenantId: string): Promise<MedicationCopay | undefined> {
    const [copay] = await db.select().from(medicationCopays).where(
      and(eq(medicationCopays.id, id), eq(medicationCopays.tenantId, tenantId))
    );
    return copay || undefined;
  }

  async createMedicationCopay(insertCopay: InsertMedicationCopay): Promise<MedicationCopay> {
    const [copay] = await db.insert(medicationCopays).values(insertCopay).returning();
    return copay;
  }

  async updateMedicationCopay(id: string, updates: Partial<MedicationCopay>, tenantId: string): Promise<MedicationCopay | undefined> {
    const [copay] = await db.update(medicationCopays)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(and(eq(medicationCopays.id, id), eq(medicationCopays.tenantId, tenantId)))
      .returning();
    return copay || undefined;
  }

  async getMedicationCopaysByPatient(patientId: string, tenantId: string): Promise<MedicationCopay[]> {
    return await db.select().from(medicationCopays).where(
      and(eq(medicationCopays.patientId, patientId), eq(medicationCopays.tenantId, tenantId))
    ).orderBy(desc(medicationCopays.createdAt));
  }

  async getMedicationCopaysByPatientInsurance(patientInsuranceId: string, tenantId: string): Promise<MedicationCopay[]> {
    return await db.select().from(medicationCopays).where(
      and(eq(medicationCopays.patientInsuranceId, patientInsuranceId), eq(medicationCopays.tenantId, tenantId))
    ).orderBy(desc(medicationCopays.createdAt));
  }

  async getMedicationCopaysByPrescription(prescriptionId: string, tenantId: string): Promise<MedicationCopay[]> {
    return await db.select().from(medicationCopays).where(
      and(eq(medicationCopays.prescriptionId, prescriptionId), eq(medicationCopays.tenantId, tenantId))
    ).orderBy(desc(medicationCopays.createdAt));
  }

  async getMedicationCopaysByPharmacist(pharmacistId: string, tenantId: string): Promise<MedicationCopay[]> {
    return await db.select().from(medicationCopays).where(
      and(eq(medicationCopays.definedByPharmacist, pharmacistId), eq(medicationCopays.tenantId, tenantId))
    ).orderBy(desc(medicationCopays.createdAt));
  }

  async getMedicationCopaysByTenant(tenantId: string): Promise<MedicationCopay[]> {
    return await db.select().from(medicationCopays).where(eq(medicationCopays.tenantId, tenantId))
      .orderBy(desc(medicationCopays.createdAt));
  }

  async getActiveMedicationCopaysByPatient(patientId: string, tenantId: string): Promise<MedicationCopay[]> {
    return await db.select().from(medicationCopays).where(
      and(
        eq(medicationCopays.patientId, patientId), 
        eq(medicationCopays.tenantId, tenantId),
        eq(medicationCopays.isActive, true)
      )
    ).orderBy(desc(medicationCopays.createdAt));
  }

  // Pricing Plans Implementation
  async getPricingPlans(): Promise<any[]> {
    // Return mock pricing plans for now
    return [
      {
        id: 'basic',
        name: 'Basic',
        price: 99,
        interval: 'month',
        features: ['Up to 100 patients', 'Basic reporting', 'Email support']
      },
      {
        id: 'professional',
        name: 'Professional',
        price: 299,
        interval: 'month',
        features: ['Up to 1000 patients', 'Advanced reporting', 'Phone support', 'API access']
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 999,
        interval: 'month',
        features: ['Unlimited patients', 'Custom reporting', 'Dedicated support', 'White label', 'Multi-language']
      },
      {
        id: 'white_label',
        name: 'White Label',
        price: 1999,
        interval: 'month',
        features: ['Everything in Enterprise', 'Full white labeling', 'Custom branding', 'Offline sync']
      }
    ];
  }

  async createPricingPlan(data: any): Promise<any> {
    // Mock implementation
    return { id: 'new-plan', ...data };
  }

  async updatePricingPlan(id: string, data: any): Promise<any> {
    // Mock implementation
    return { id, ...data };
  }

  // White Label Settings Implementation
  async updateTenantWhiteLabel(tenantId: string, settings: any): Promise<Tenant | null> {
    try {
      const [tenant] = await db.update(tenants)
        .set({ 
          brandName: settings.brandName,
          updatedAt: sql`CURRENT_TIMESTAMP` 
        })
        .where(eq(tenants.id, tenantId))
        .returning();
      return tenant || null;
    } catch (error) {
      console.error('Error updating white label settings:', error);
      return null;
    }
  }

  // Offline Sync Implementation
  async syncOfflineData(syncData: any): Promise<any> {
    // Mock implementation for offline sync
    console.log('Syncing offline data:', syncData);
    return { success: true, syncedAt: new Date().toISOString() };
  }

  async getOfflineData(tenantId: string): Promise<any> {
    // Mock implementation - return essential data for offline use
    return {
      patients: await this.getPatientsByTenant(tenantId, 50),
      appointments: await this.getAppointmentsByTenant(tenantId),
      prescriptions: await this.getPrescriptionsByTenant(tenantId),
      lastSync: new Date().toISOString()
    };
  }

  // Translations Implementation
  async getTranslations(tenantId: string, language: string): Promise<any[]> {
    // Mock implementation for translations
    const commonTranslations = {
      'en': {
        'welcome': 'Welcome',
        'patient': 'Patient',
        'doctor': 'Doctor',
        'appointment': 'Appointment',
        'prescription': 'Prescription'
      },
      'es': {
        'welcome': 'Bienvenido',
        'patient': 'Paciente',
        'doctor': 'Doctor',
        'appointment': 'Cita',
        'prescription': 'Receta'
      },
      'fr': {
        'welcome': 'Bienvenue',
        'patient': 'Patient',
        'doctor': 'Docteur',
        'appointment': 'Rendez-vous',
        'prescription': 'Prescription'
      }
    };

    return Object.entries(commonTranslations[language as keyof typeof commonTranslations] || commonTranslations.en).map(([key, value]) => ({
      key,
      value,
      language,
      tenantId
    }));
  }

  async createTranslation(data: any): Promise<any> {
    // Mock implementation
    return { id: 'new-translation', ...data, createdAt: new Date().toISOString() };
  }

  // Patient Check-ins for receptionist workflow
  async getPatientCheckIn(id: string, tenantId: string): Promise<PatientCheckIn | undefined> {
    const [checkIn] = await db.select().from(patientCheckIns).where(
      and(eq(patientCheckIns.id, id), eq(patientCheckIns.tenantId, tenantId))
    );
    return checkIn || undefined;
  }

  async createPatientCheckIn(checkIn: InsertPatientCheckIn): Promise<PatientCheckIn> {
    const [newCheckIn] = await db.insert(patientCheckIns).values(checkIn).returning();
    return newCheckIn;
  }

  async updatePatientCheckIn(id: string, updates: Partial<PatientCheckIn>, tenantId: string): Promise<PatientCheckIn | undefined> {
    const [updatedCheckIn] = await db.update(patientCheckIns)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(patientCheckIns.id, id), eq(patientCheckIns.tenantId, tenantId)))
      .returning();
    return updatedCheckIn || undefined;
  }

  async getPatientCheckInsByTenant(tenantId: string, date?: Date): Promise<PatientCheckIn[]> {
    let query = db.select().from(patientCheckIns).where(eq(patientCheckIns.tenantId, tenantId));
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      query = query.where(
        and(
          eq(patientCheckIns.tenantId, tenantId),
          sql`${patientCheckIns.checkedInAt} >= ${startOfDay}`,
          sql`${patientCheckIns.checkedInAt} <= ${endOfDay}`
        )
      );
    }
    
    return await query.orderBy(desc(patientCheckIns.checkedInAt));
  }

  async getWaitingPatients(tenantId: string): Promise<any[]> {
    const result = await db
      .select({
        id: patientCheckIns.id,
        patientId: patientCheckIns.patientId,
        appointmentId: patientCheckIns.appointmentId,
        checkedInBy: patientCheckIns.checkedInBy,
        checkedInAt: patientCheckIns.checkedInAt,
        reasonForVisit: patientCheckIns.reasonForVisit,
        chiefComplaint: patientCheckIns.chiefComplaint,
        priorityLevel: patientCheckIns.priorityLevel,
        specialInstructions: patientCheckIns.specialInstructions,
        insuranceVerified: patientCheckIns.insuranceVerified,
        status: patientCheckIns.status,
        vitalSignsId: patientCheckIns.vitalSignsId,
        patient: {
          id: patients.id,
          firstName: patients.firstName,
          lastName: patients.lastName,
          mrn: patients.mrn,
          dateOfBirth: patients.dateOfBirth,
          phone: patients.phone,
          email: patients.email,
        }
      })
      .from(patientCheckIns)
      .innerJoin(patients, eq(patientCheckIns.patientId, patients.id))
      .where(
        and(
          eq(patientCheckIns.tenantId, tenantId),
          eq(patientCheckIns.status, 'waiting')
        )
      )
      .orderBy(patientCheckIns.checkedInAt);
      
    return result;
  }

  async getPatientCheckIn(id: string, tenantId: string): Promise<PatientCheckIn | undefined> {
    const [checkIn] = await db.select().from(patientCheckIns)
      .where(and(eq(patientCheckIns.id, id), eq(patientCheckIns.tenantId, tenantId)));
    return checkIn || undefined;
  }

  async getPatientCheckInsByDate(date: string, tenantId: string): Promise<any[]> {
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const result = await db
      .select({
        id: patientCheckIns.id,
        patientId: patientCheckIns.patientId,
        appointmentId: patientCheckIns.appointmentId,
        checkedInBy: patientCheckIns.checkedInBy,
        checkedInAt: patientCheckIns.checkedInAt,
        reasonForVisit: patientCheckIns.reasonForVisit,
        chiefComplaint: patientCheckIns.chiefComplaint,
        priorityLevel: patientCheckIns.priorityLevel,
        specialInstructions: patientCheckIns.specialInstructions,
        insuranceVerified: patientCheckIns.insuranceVerified,
        status: patientCheckIns.status,
        vitalSignsId: patientCheckIns.vitalSignsId,
        patient: {
          id: patients.id,
          firstName: patients.firstName,
          lastName: patients.lastName,
          mrn: patients.mrn,
          dateOfBirth: patients.dateOfBirth,
          phone: patients.phone,
          email: patients.email,
        },
        vitalSigns: {
          id: vitalSigns.id,
          systolicBp: vitalSigns.systolicBp,
          diastolicBp: vitalSigns.diastolicBp,
          heartRate: vitalSigns.heartRate,
          temperature: vitalSigns.temperature,
          temperatureUnit: vitalSigns.temperatureUnit,
        }
      })
      .from(patientCheckIns)
      .innerJoin(patients, eq(patientCheckIns.patientId, patients.id))
      .leftJoin(vitalSigns, eq(patientCheckIns.vitalSignsId, vitalSigns.id))
      .where(
        and(
          eq(patientCheckIns.tenantId, tenantId),
          sql`${patientCheckIns.checkedInAt} >= ${startOfDay}`,
          sql`${patientCheckIns.checkedInAt} <= ${endOfDay}`
        )
      )
      .orderBy(desc(patientCheckIns.checkedInAt));
      
    return result;
  }

  async getTodaysCheckIns(tenantId: string): Promise<any[]> {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    
    const result = await db
      .select({
        id: patientCheckIns.id,
        patientId: patientCheckIns.patientId,
        appointmentId: patientCheckIns.appointmentId,
        checkedInBy: patientCheckIns.checkedInBy,
        checkedInAt: patientCheckIns.checkedInAt,
        reasonForVisit: patientCheckIns.reasonForVisit,
        chiefComplaint: patientCheckIns.chiefComplaint,
        priorityLevel: patientCheckIns.priorityLevel,
        specialInstructions: patientCheckIns.specialInstructions,
        insuranceVerified: patientCheckIns.insuranceVerified,
        status: patientCheckIns.status,
        vitalSignsId: patientCheckIns.vitalSignsId,
        patient: {
          id: patients.id,
          firstName: patients.firstName,
          lastName: patients.lastName,
          mrn: patients.mrn,
          dateOfBirth: patients.dateOfBirth,
          phone: patients.phone,
          email: patients.email,
        },
        vitalSigns: {
          id: vitalSigns.id,
          systolicBp: vitalSigns.bloodPressureSystolic,
          diastolicBp: vitalSigns.bloodPressureDiastolic,
          heartRate: vitalSigns.heartRate,
          temperature: vitalSigns.temperature,
          temperatureUnit: vitalSigns.temperatureUnit,
        }
      })
      .from(patientCheckIns)
      .innerJoin(patients, eq(patientCheckIns.patientId, patients.id))
      .leftJoin(vitalSigns, eq(patientCheckIns.vitalSignsId, vitalSigns.id))
      .where(
        and(
          eq(patientCheckIns.tenantId, tenantId),
          sql`${patientCheckIns.checkedInAt} >= ${startOfDay}`,
          sql`${patientCheckIns.checkedInAt} <= ${endOfDay}`
        )
      )
      .orderBy(desc(patientCheckIns.checkedInAt));
      
    return result;
  }

  // Role Permissions Management
  async getRolePermissions(tenantId: string): Promise<RolePermission[]> {
    return await db.select().from(rolePermissions)
      .where(and(eq(rolePermissions.tenantId, tenantId), eq(rolePermissions.isActive, true)));
  }

  async getRolePermissionsByRole(role: string, tenantId: string): Promise<RolePermission[]> {
    return await db.select().from(rolePermissions)
      .where(and(
        eq(rolePermissions.tenantId, tenantId),
        eq(rolePermissions.role, role as any),
        eq(rolePermissions.isActive, true)
      ));
  }

  async createRolePermission(permission: InsertRolePermission): Promise<RolePermission> {
    const [created] = await db.insert(rolePermissions).values(permission).returning();
    return created;
  }

  async updateRolePermission(id: string, updates: Partial<RolePermission>, tenantId: string): Promise<RolePermission | undefined> {
    const [updated] = await db.update(rolePermissions)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(and(eq(rolePermissions.id, id), eq(rolePermissions.tenantId, tenantId)))
      .returning();
    return updated || undefined;
  }

  async deleteRolePermission(id: string, tenantId: string): Promise<boolean> {
    const [deleted] = await db.update(rolePermissions)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(eq(rolePermissions.id, id), eq(rolePermissions.tenantId, tenantId)))
      .returning();
    return !!deleted;
  }

  async getRolePermissionByRoleAndModule(role: string, module: string, tenantId: string): Promise<RolePermission | undefined> {
    const [permission] = await db.select().from(rolePermissions)
      .where(and(
        eq(rolePermissions.tenantId, tenantId),
        eq(rolePermissions.role, role as any),
        eq(rolePermissions.module, module),
        eq(rolePermissions.isActive, true)
      ));
    return permission || undefined;
  }

  // Patient Billing Management
  async createPatientBill(bill: InsertPatientBill): Promise<PatientBill> {
    const [patientBill] = await db.insert(patientBills).values(bill).returning();
    return patientBill;
  }

  async getPatientBills(patientId: string, tenantId: string): Promise<PatientBill[]> {
    return await db.select().from(patientBills)
      .where(and(eq(patientBills.patientId, patientId), eq(patientBills.tenantId, tenantId)))
      .orderBy(desc(patientBills.serviceDate));
  }

  async getPatientBill(id: string, tenantId: string): Promise<PatientBill | undefined> {
    const [bill] = await db.select().from(patientBills)
      .where(and(eq(patientBills.id, id), eq(patientBills.tenantId, tenantId)));
    return bill || undefined;
  }

  async updatePatientBill(id: string, updates: Partial<InsertPatientBill>, tenantId: string): Promise<PatientBill> {
    const [bill] = await db.update(patientBills)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(and(eq(patientBills.id, id), eq(patientBills.tenantId, tenantId)))
      .returning();
    return bill;
  }

  async createPatientPayment(payment: InsertPatientPayment): Promise<PatientPayment> {
    const [patientPayment] = await db.insert(patientPayments).values(payment).returning();
    return patientPayment;
  }

  async getPatientPayments(patientBillId: string, tenantId: string): Promise<PatientPayment[]> {
    return await db.select().from(patientPayments)
      .where(and(eq(patientPayments.patientBillId, patientBillId), eq(patientPayments.tenantId, tenantId)))
      .orderBy(desc(patientPayments.paymentDate));
  }

  // Patient Account Activation
  async generatePatientCredentials(patientId: string, tenantId: string): Promise<{tempPassword: string, activationToken: string}> {
    // Generate temporary password (8 characters)
    const tempPassword = Math.random().toString(36).slice(-8);
    
    // Generate activation token
    const activationToken = Math.random().toString(36) + Date.now().toString(36);
    
    // Store in database for verification (you could create a separate table for this)
    await this.createAuditLog({
      tenantId,
      userId: patientId,
      action: "patient_account_generated",
      entityType: "patient",
      entityId: patientId,
      details: { activationToken },
      ipAddress: "system",
      userAgent: "automated-service"
    });
    
    return { tempPassword, activationToken };
  }

  async sendPatientActivationMessage(patient: Patient, tempPassword: string, activationToken: string): Promise<boolean> {
    try {
      // This would integrate with SendGrid for email and Twilio for SMS
      // For now, we'll log the credentials and return true
      console.log(`Patient activation credentials for ${patient.firstName} ${patient.lastName}:`);
      console.log(`Email: ${patient.email}`);
      console.log(`Phone: ${patient.phone}`);
      console.log(`Temporary Password: ${tempPassword}`);
      console.log(`Activation Link: ${process.env.FRONTEND_URL || 'https://localhost:5000'}/patient/activate?token=${activationToken}`);
      
      return true;
    } catch (error) {
      console.error("Failed to send patient activation message:", error);
      return false;
    }
  }
}

export const storage = new DatabaseStorage();
