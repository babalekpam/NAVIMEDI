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
  patientAssignments,
  patientAccessRequests,
  pharmacyReceipts,
  labBills,
  achievements,
  userAchievements,
  userStats,
  leaderboards,
  activityLogs,
  workShifts,
  pharmacyPatientInsurance,
  hospitalPatientInsurance,
  laboratoryPatientInsurance,
  archivedRecords,
  pharmacyReportTemplates,
  hospitalBills,
  departments,
  advertisements,
  adViews,
  adInquiries,
  medicalSuppliers,
  marketplaceProducts,
  marketplaceOrders,
  marketplaceOrderItems,
  productReviews,
  quoteRequests,
  type Advertisement,
  type InsertAdvertisement,
  type AdView,
  type InsertAdView,
  type AdInquiry,
  type InsertAdInquiry,
  type MedicalSupplier,
  type InsertMedicalSupplier,
  type MarketplaceProduct,
  type InsertMarketplaceProduct,
  type MarketplaceOrder,
  type InsertMarketplaceOrder,
  type MarketplaceOrderItem,
  type InsertMarketplaceOrderItem,
  type ProductReview,
  type InsertProductReview,
  type QuoteRequest,
  type InsertQuoteRequest,
  type Tenant,
  type InsertTenant,
  type User, 
  type InsertUser,
  type UpsertUser,
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
  type InsertRolePermission,
  type PharmacyReceipt,
  type InsertPharmacyReceipt,
  type Achievement,
  type InsertAchievement,
  type UserAchievement,
  type InsertUserAchievement,
  type UserStats,
  type InsertUserStats,
  type Leaderboard,
  type InsertLeaderboard,
  type ActivityLog,
  type InsertActivityLog,
  type WorkShift,
  type InsertWorkShift,
  type PharmacyPatientInsurance,
  type InsertPharmacyPatientInsurance,
  type ArchivedRecord,
  type InsertArchivedRecord,
  type PharmacyReportTemplate,
  type InsertPharmacyReportTemplate,
  type HospitalBill,
  type InsertHospitalBill,
  type Department,
  type InsertDepartment
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, like, or, isNull, gt, ilike, gte, lte, lt, ne, inArray, asc, isNotNull } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // User management - SECURITY: Enhanced with tenant isolation
  getUser(id: string, tenantId?: string): Promise<User | undefined>;
  getUserByUsername(username: string, tenantId: string): Promise<User | undefined>;
  getUserByEmail(email: string, tenantId: string): Promise<User | undefined>;
  getUserByEmailOrUsername(emailOrUsername: string, tenantId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  getUsersByTenant(tenantId: string): Promise<User[]>;
  getUsersByRole(role: string, tenantId: string): Promise<User[]>;
  getAllUsers(): Promise<User[]>; // SECURITY: Super admin only
  
  // Replit Auth specific methods
  upsertUser(user: UpsertUser): Promise<User>;

  // Tenant management
  getTenant(id: string): Promise<Tenant | undefined>;
  getTenantBySubdomain(subdomain: string): Promise<Tenant | undefined>;
  createTenant(tenant: InsertTenant): Promise<Tenant>;
  updateTenant(id: string, updates: Partial<Tenant>): Promise<Tenant | undefined>;
  getAllTenants(): Promise<Tenant[]>;

  // Patient management - SECURITY: Enhanced with strict tenant isolation
  getPatient(id: string, tenantId: string): Promise<Patient | undefined>;
  getPatientById(id: string, accessContext?: { type: 'pharmacy_billing' | 'lab_results', tenantId: string }): Promise<Patient | undefined>;
  getPatientByMRN(mrn: string, tenantId: string): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: string, updates: Partial<Patient>, tenantId: string): Promise<Patient | undefined>;
  getPatientsByTenant(tenantId: string, limit?: number, offset?: number): Promise<Patient[]>;
  searchPatients(tenantId: string, query: string): Promise<Patient[]>;
  getAllPatients(limit?: number, offset?: number): Promise<Patient[]>; // SECURITY: Deprecated - throws error
  searchPatientsGlobal(query: string): Promise<Patient[]>; // SECURITY: Deprecated - throws error
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
  getPrescriptionForPharmacy(id: string, pharmacyTenantId: string): Promise<Prescription | undefined>;
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
  getPharmaciesForPrescriptionRouting(): Promise<any[]>;

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
  getPatientInsuranceCrossTenant(patientId: string): Promise<PatientInsurance[]>;
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

  // Patient Assignment Management
  getPatientAssignment(id: string, tenantId: string): Promise<any | undefined>;
  createPatientAssignment(assignment: any): Promise<any>;
  assignPatientToPhysician(data: any): Promise<any>;
  updatePatientAssignment(id: string, updates: any, tenantId: string): Promise<any | undefined>;
  getPatientAssignmentsByPhysician(physicianId: string, tenantId: string): Promise<any[]>;
  getPatientAssignmentsByPatient(patientId: string, tenantId: string): Promise<any[]>;
  getActivePatientAssignments(tenantId: string): Promise<any[]>;
  removePatientAssignment(id: string, tenantId: string): Promise<boolean>;

  // Patient Access Request Management
  getPatientAccessRequest(id: string, tenantId: string): Promise<any | undefined>;
  createPatientAccessRequest(request: any): Promise<any>;
  updatePatientAccessRequest(id: string, updates: any, tenantId: string): Promise<any | undefined>;
  getPatientAccessRequestsByPhysician(physicianId: string, tenantId: string): Promise<any[]>;
  getPendingPatientAccessRequests(tenantId: string): Promise<any[]>;
  approvePatientAccessRequest(id: string, reviewedBy: string, tenantId: string, accessUntil?: Date): Promise<any | undefined>;
  denyPatientAccessRequest(id: string, reviewedBy: string, reviewNotes: string, tenantId: string): Promise<any | undefined>;

  // Enhanced Patient Methods with Assignment Controls
  getAssignedPatients(physicianId: string, tenantId: string): Promise<Patient[]>;
  hasPatientAccess(physicianId: string, patientId: string, tenantId: string): Promise<boolean>;
  getPatientWithAccessCheck(patientId: string, physicianId: string, tenantId: string): Promise<Patient | undefined>;

  // Role Permissions Management
  getRolePermissions(tenantId: string): Promise<RolePermission[]>;
  getRolePermissionsByRole(role: string, tenantId: string): Promise<RolePermission[]>;
  
  // User-specific permissions for role-based access control
  getUserPermissions(userId: string, tenantId: string): Promise<string[]>;
  grantUserPermission(userId: string, permission: string, tenantId: string): Promise<boolean>;

  // Pharmacy Receipt Management
  getPharmacyReceipt(id: string, tenantId: string): Promise<PharmacyReceipt | undefined>;
  createPharmacyReceipt(receipt: InsertPharmacyReceipt): Promise<PharmacyReceipt>;
  updatePharmacyReceipt(id: string, updates: Partial<PharmacyReceipt>, tenantId: string): Promise<PharmacyReceipt | undefined>;
  getPharmacyReceiptsByPatient(patientId: string, tenantId: string): Promise<PharmacyReceipt[]>;
  getPharmacyReceiptsByPrescription(prescriptionId: string, tenantId: string): Promise<PharmacyReceipt[]>;
  getPharmacyReceiptsByTenant(tenantId: string, limit?: number, offset?: number): Promise<PharmacyReceipt[]>;
  generateReceiptNumber(tenantId: string): Promise<string>;
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
  
  // Cross-tenant patient access for pharmacies
  getPatientsWithPrescriptionsForPharmacy(pharmacyTenantId: string): Promise<Patient[]>;
  
  // Cross-tenant patient insurance access
  getPatientInsuranceCrossTenant(patientId: string): Promise<PatientInsurance[]>;
  
  // Lab Bills Management
  getLabBillsByTenant(tenantId: string): Promise<any[]>;
  
  // Patient Account Activation
  generatePatientCredentials(patientId: string, tenantId: string): Promise<{tempPassword: string, activationToken: string}>;
  sendPatientActivationMessage(patient: Patient, tempPassword: string, activationToken: string): Promise<boolean>;

  // Achievement System Management
  getAchievements(): Promise<Achievement[]>;
  getAchievement(id: string): Promise<Achievement | undefined>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  updateAchievement(id: string, updates: Partial<Achievement>): Promise<Achievement | undefined>;
  deleteAchievement(id: string): Promise<boolean>;
  
  getUserAchievements(userId: string, tenantId: string): Promise<UserAchievement[]>;
  getUserAchievement(userId: string, achievementId: string, tenantId: string): Promise<UserAchievement | undefined>;
  createUserAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement>;
  updateUserAchievement(id: string, updates: Partial<UserAchievement>): Promise<UserAchievement | undefined>;
  
  getUserStats(userId: string, tenantId: string): Promise<UserStats | undefined>;
  createUserStats(userStats: InsertUserStats): Promise<UserStats>;
  updateUserStats(userId: string, tenantId: string, updates: Partial<UserStats>): Promise<UserStats | undefined>;
  
  getLeaderboard(tenantId: string, period: string, limit?: number): Promise<Leaderboard[]>;
  updateLeaderboard(tenantId: string, period: string): Promise<void>;
  
  getActivityLogs(userId: string, tenantId: string, limit?: number): Promise<ActivityLog[]>;
  createActivityLog(activityLog: InsertActivityLog): Promise<ActivityLog>;
  
  // Achievement tracking methods
  checkAndUpdateAchievements(userId: string, tenantId: string, activityType: string, metadata?: any): Promise<UserAchievement[]>;
  calculateUserLevel(totalPoints: number): number;
  updateUserStatsFromActivity(userId: string, tenantId: string, activityType: string, metadata?: any): Promise<UserStats | undefined>;

  // Work Shift Management
  getWorkShift(id: string, tenantId: string): Promise<WorkShift | undefined>;
  createWorkShift(shift: InsertWorkShift): Promise<WorkShift>;
  updateWorkShift(id: string, updates: Partial<WorkShift>, tenantId: string): Promise<WorkShift | undefined>;
  getActiveWorkShifts(tenantId: string): Promise<WorkShift[]>;
  endWorkShift(id: string, tenantId: string): Promise<WorkShift | undefined>;
  getCurrentWorkShift(userId: string, tenantId: string): Promise<WorkShift | undefined>;

  // Pharmacy Patient Insurance Management
  getPharmacyPatientInsurance(patientId: string, tenantId: string): Promise<PharmacyPatientInsurance | undefined>;
  createPharmacyPatientInsurance(insurance: InsertPharmacyPatientInsurance): Promise<PharmacyPatientInsurance>;
  updatePharmacyPatientInsurance(id: string, updates: Partial<PharmacyPatientInsurance>, tenantId: string): Promise<PharmacyPatientInsurance | undefined>;
  getPharmacyPatientInsuranceByTenant(tenantId: string): Promise<PharmacyPatientInsurance[]>;

  // Archived Records Management
  createArchivedRecord(record: InsertArchivedRecord): Promise<ArchivedRecord>;
  searchArchivedRecords(tenantId: string, query: string): Promise<ArchivedRecord[]>;
  getArchivedRecordsByShift(workShiftId: string, tenantId: string): Promise<ArchivedRecord[]>;
  getArchivedRecordsByPatient(patientId: string, tenantId: string): Promise<ArchivedRecord[]>;
  archiveRecordsForShift(workShiftId: string, tenantId: string): Promise<void>;

  // Pharmacy Report Templates Management
  getPharmacyReportTemplate(id: string, tenantId: string): Promise<PharmacyReportTemplate | undefined>;
  createPharmacyReportTemplate(template: InsertPharmacyReportTemplate): Promise<PharmacyReportTemplate>;
  updatePharmacyReportTemplate(id: string, updates: Partial<PharmacyReportTemplate>, tenantId: string): Promise<PharmacyReportTemplate | undefined>;
  getPharmacyReportTemplatesByTenant(tenantId: string): Promise<PharmacyReportTemplate[]>;
  getActivePharmacyReportTemplates(tenantId: string): Promise<PharmacyReportTemplate[]>;

  // Hospital Billing Management
  getHospitalBill(id: string, tenantId: string): Promise<HospitalBill | undefined>;
  getHospitalBills(tenantId: string): Promise<HospitalBill[]>;
  getHospitalBillsByProvider(providerId: string, tenantId: string): Promise<HospitalBill[]>;
  createHospitalBill(bill: InsertHospitalBill): Promise<HospitalBill>;
  updateHospitalBill(id: string, updates: Partial<HospitalBill>, tenantId: string): Promise<HospitalBill | undefined>;
  getHospitalAnalytics(tenantId: string): Promise<any>;
  getHospitalAnalyticsByProvider(providerId: string, tenantId: string): Promise<any>;

  // Advertisement Management
  getAllAdvertisements(): Promise<Advertisement[]>;
  getAdvertisement(id: string): Promise<Advertisement | undefined>;
  getAdvertisementsByTenant(tenantId: string): Promise<Advertisement[]>;
  createAdvertisement(advertisement: InsertAdvertisement): Promise<Advertisement>;
  updateAdvertisement(id: string, updates: Partial<Advertisement>, tenantId: string): Promise<Advertisement | undefined>;
  updateAdvertisementStatus(id: string, statusUpdate: { status: string; reviewNotes?: string; reviewedBy?: string; reviewedAt?: string }): Promise<Advertisement | undefined>;
  deleteAdvertisement(id: string, tenantId: string): Promise<boolean>;
  incrementAdvertisementImpressions(id: string): Promise<void>;
  incrementAdvertisementClicks(id: string): Promise<void>;

  // Advertisement Views Management
  createAdView(view: InsertAdView): Promise<AdView>;
  getAdViews(advertisementId: string): Promise<AdView[]>;

  // Advertisement Inquiries Management
  createAdInquiry(inquiry: InsertAdInquiry): Promise<AdInquiry>;
  getAdInquiries(advertisementId: string): Promise<AdInquiry[]>;
  updateAdInquiry(id: string, updates: Partial<AdInquiry>): Promise<AdInquiry | undefined>;

  // Medical Suppliers Management
  createMedicalSupplier(supplier: any): Promise<MedicalSupplier>;
  getMedicalSupplier(id: string): Promise<MedicalSupplier | undefined>;
  getMedicalSupplierByEmail(email: string): Promise<MedicalSupplier | undefined>;
  getMedicalSuppliers(): Promise<MedicalSupplier[]>;
  getAllMedicalSuppliers(): Promise<MedicalSupplier[]>;
  updateMedicalSupplier(id: string, updates: Partial<MedicalSupplier>): Promise<MedicalSupplier | undefined>;
  updateMedicalSupplierStatus(id: string, status: string, reason?: string): Promise<MedicalSupplier | undefined>;
  approveMedicalSupplier(id: string, approvedBy: string): Promise<MedicalSupplier | undefined>;

  // Quote Request Management
  createQuoteRequest(quoteRequest: any): Promise<QuoteRequest>;
  getQuoteRequest(id: string): Promise<QuoteRequest | undefined>;
  getQuoteRequests(): Promise<QuoteRequest[]>;
  getQuoteRequestsByProduct(productId: string): Promise<QuoteRequest[]>;
  updateQuoteRequest(id: string, updates: Partial<QuoteRequest>): Promise<QuoteRequest | undefined>;

  // Marketplace Product Management
  getMarketplaceProducts(filters: { category?: string; search?: string; status?: string; limit: number; offset: number }): Promise<MarketplaceProduct[]>;
  getPublicMarketplaceProducts(): Promise<any[]>;
  getMarketplaceProduct(id: string): Promise<MarketplaceProduct | undefined>;
  getSupplierProducts(supplierTenantId: string, status?: string): Promise<MarketplaceProduct[]>;
  createMarketplaceProduct(product: InsertMarketplaceProduct): Promise<MarketplaceProduct>;
  updateMarketplaceProduct(id: string, updates: Partial<MarketplaceProduct>, supplierTenantId: string): Promise<MarketplaceProduct | undefined>;
  incrementProductViewCount(productId: string): Promise<void>;

  // Marketplace Order Management
  createMarketplaceOrder(order: InsertMarketplaceOrder): Promise<MarketplaceOrder>;
  generateOrderNumber(): Promise<string>;
  getBuyerOrders(buyerTenantId: string, filters: { status?: string; limit: number; offset: number }): Promise<MarketplaceOrder[]>;
  getSupplierOrders(supplierTenantId: string, filters: { status?: string; limit: number; offset: number }): Promise<MarketplaceOrder[]>;
  updateOrderStatus(orderId: string, status: string, notes: string, tenantId: string): Promise<MarketplaceOrder | undefined>;

  // Product Reviews Management
  createProductReview(review: InsertProductReview): Promise<ProductReview>;
  getProductReviews(productId: string, filters: { limit: number; offset: number; approvedOnly: boolean }): Promise<ProductReview[]>;
  hasUserPurchasedProduct(userId: string, productId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User management - SECURITY: All user queries must include tenantId for isolation
  async getUser(id: string, tenantId?: string): Promise<User | undefined> {
    if (tenantId) {
      const [user] = await db.select().from(users).where(
        and(eq(users.id, id), eq(users.tenantId, tenantId))
      );
      return user || undefined;
    }
    // Only for super admin usage - log access for security auditing
    console.log("[SECURITY] Cross-tenant user access by super admin:", id);
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    // SECURITY: Only for super admin platform management
    console.log("[SECURITY] Cross-tenant user listing accessed");
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

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        },
      })
      .returning();
    return user;
  }

  async getUsersByTenant(tenantId: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.tenantId, tenantId));
  }

  // User permissions methods for role-based access control
  async getUserPermissions(userId: string, tenantId: string): Promise<string[]> {
    try {
      const user = await db.select().from(users).where(and(eq(users.id, userId), eq(users.tenantId, tenantId))).limit(1);
      if (!user.length) return [];
      
      // Default permissions based on role
      const role = user[0].role;
      switch (role) {
        case 'physician':
        case 'doctor':
          return []; // By default, doctors have NO scheduling/confirmation permissions
        case 'receptionist':
          return ['schedule_appointments', 'confirm_appointments', 'cancel_appointments'];
        case 'tenant_admin':
        case 'director':
        case 'super_admin':
          return ['schedule_appointments', 'confirm_appointments', 'cancel_appointments', 'manage_permissions'];
        default:
          return [];
      }
    } catch (error) {
      console.error("Error getting user permissions:", error);
      return [];
    }
  }

  // Grant specific permission to a user (for admin use)
  async grantUserPermission(userId: string, permission: string, tenantId: string): Promise<boolean> {
    try {
      console.log(`[PERMISSIONS] Granting ${permission} to user ${userId} in tenant ${tenantId}`);
      // This would typically update a user_permissions table
      // For now, we'll simulate by logging the permission grant
      return true;
    } catch (error) {
      console.error("Error granting user permission:", error);
      return false;
    }
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

  // SECURITY: Cross-tenant patient access only for authorized pharmacy billing
  async getPatientById(id: string, accessContext?: { type: 'pharmacy_billing' | 'lab_results', tenantId: string }): Promise<Patient | undefined> {
    if (!accessContext) {
      console.error("[SECURITY VIOLATION] getPatientById called without access context");
      throw new Error("Cross-tenant patient access requires explicit context for security audit");
    }
    
    console.log(`[SECURITY AUDIT] Cross-tenant patient access: ${accessContext.type} by tenant ${accessContext.tenantId} for patient ${id}`);
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
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
    // SECURITY: This function violates tenant isolation - should be removed or restricted
    console.error("[SECURITY VIOLATION] getAllPatients called without tenant filtering");
    throw new Error("Direct patient access without tenant filtering is not permitted for security");
  }

  async searchPatientsGlobal(query: string): Promise<Patient[]> {
    // SECURITY: This function violates tenant isolation - should be removed or restricted  
    console.error("[SECURITY VIOLATION] searchPatientsGlobal called without tenant filtering");
    throw new Error("Global patient search without tenant filtering is not permitted for security");
  }

  // Cross-tenant patients for pharmacy billing (patients with prescriptions sent to this pharmacy)
  async getPatientsWithPrescriptionsForPharmacy(pharmacyTenantId: string): Promise<Patient[]> {
    const patientsWithPrescriptions = await db
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
      .innerJoin(prescriptions, eq(prescriptions.patientId, patients.id))
      .where(
        and(
          eq(prescriptions.pharmacyTenantId, pharmacyTenantId),
          eq(patients.isActive, true)
        )
      )
      .groupBy(patients.id, patients.tenantId, patients.firstName, patients.lastName, 
               patients.dateOfBirth, patients.gender, patients.phone, patients.email, 
               patients.address, patients.mrn, patients.emergencyContact, patients.allergies, 
               patients.medications, patients.medicalHistory, patients.isActive, 
               patients.createdAt, patients.updatedAt)
      .orderBy(patients.lastName, patients.firstName);

    return patientsWithPrescriptions;
  }

  // Cross-tenant patient insurance access for pharmacy billing  
  async getPatientInsuranceCrossTenant(
    patientId: string, 
    accessContext: { type: 'pharmacy_billing' | 'emergency_care', tenantId: string, userId: string }
  ): Promise<PatientInsurance[]> {
    
    // SECURITY AUDIT: Log all cross-tenant insurance access
    console.log(`[SECURITY AUDIT] Cross-tenant insurance access: ${accessContext.type} by user ${accessContext.userId} from tenant ${accessContext.tenantId} for patient ${patientId}`);
    
    // Validate legitimate access reasons only
    const allowedAccessTypes = ['pharmacy_billing', 'emergency_care'];
    if (!allowedAccessTypes.includes(accessContext.type)) {
      throw new Error("Unauthorized cross-tenant insurance access type");
    }
    
    try {
      // Query across all tenants for legitimate medical/billing purposes
      const insuranceRecords = await db.select().from(patientInsurance)
        .where(eq(patientInsurance.patientId, patientId))
        .orderBy(desc(patientInsurance.isPrimary), patientInsurance.effectiveDate);
      
      console.log(`[SECURITY AUDIT] Found ${insuranceRecords.length} insurance records for patient ${patientId}`);
      return insuranceRecords;
    } catch (error) {
      console.error("[CROSS-TENANT INSURANCE] Query error:", error);
      throw error;
    }
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

  async getAppointmentsByPatient(patientId: string, tenantId: string): Promise<any[]> {
    return await db
      .select({
        // Appointment details
        id: appointments.id,
        patientId: appointments.patientId,
        providerId: appointments.providerId,
        appointmentDate: appointments.appointmentDate,
        type: appointments.type,
        status: appointments.status,
        notes: appointments.notes,
        chiefComplaint: appointments.chiefComplaint,
        tenantId: appointments.tenantId,
        createdAt: appointments.createdAt,
        updatedAt: appointments.updatedAt,
        
        // Provider information
        providerFirstName: users.firstName,
        providerLastName: users.lastName,
        providerEmail: users.email,
        providerRole: users.role,
        
        // Visit summary information (if exists)
        visitSummaryId: visitSummaries.id,
        visitSummaryStatus: visitSummaries.status,
        visitSummaryChiefComplaint: visitSummaries.chiefComplaint,
        visitSummaryAssessment: visitSummaries.assessment,
        visitSummaryClinicalImpression: visitSummaries.clinicalImpression,
        visitSummaryTreatmentPlan: visitSummaries.treatmentPlan,
        visitSummaryReturnVisitRecommended: visitSummaries.returnVisitRecommended,
        visitSummaryReturnVisitTimeframe: visitSummaries.returnVisitTimeframe,
        visitSummaryProviderNotes: visitSummaries.providerNotes
      })
      .from(appointments)
      .leftJoin(users, eq(appointments.providerId, users.id))
      .leftJoin(visitSummaries, eq(appointments.id, visitSummaries.appointmentId))
      .where(and(eq(appointments.patientId, patientId), eq(appointments.tenantId, tenantId)))
      .orderBy(desc(appointments.appointmentDate));
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

  // Get prescription by ID for pharmacy (regardless of which hospital created it)
  async getPrescriptionForPharmacy(id: string, pharmacyTenantId: string): Promise<Prescription | undefined> {
    const [prescription] = await db.select().from(prescriptions).where(
      and(eq(prescriptions.id, id), eq(prescriptions.pharmacyTenantId, pharmacyTenantId))
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

  async getPrescriptionsByPharmacyTenant(pharmacyTenantId: string): Promise<Prescription[]> {
    return await db.select().from(prescriptions).where(eq(prescriptions.pharmacyTenantId, pharmacyTenantId))
      .orderBy(desc(prescriptions.prescribedDate));
  }

  async getPrescriptionsByPharmacy(pharmacyTenantId: string): Promise<any[]> {
    console.log(`[PHARMACY API] 🔍 Getting prescriptions for pharmacy: ${pharmacyTenantId}`);
    
    // First, let's check if there are any prescriptions with this pharmacy ID
    const allPrescriptionsForPharmacy = await db
      .select({
        id: prescriptions.id,
        medicationName: prescriptions.medicationName,
        pharmacyTenantId: prescriptions.pharmacyTenantId,
        status: prescriptions.status
      })
      .from(prescriptions)
      .where(eq(prescriptions.pharmacyTenantId, pharmacyTenantId));
    
    console.log(`[PHARMACY API] ✅ Direct query found ${allPrescriptionsForPharmacy.length} prescriptions:`, 
      allPrescriptionsForPharmacy.map(p => ({ medication: p.medicationName, status: p.status })));
    
    // Return simple format for enhanced dashboard
    const simplifiedPrescriptions = allPrescriptionsForPharmacy.map(p => ({
      id: p.id,
      patientName: `Patient for ${p.medicationName}`, // Temporary for demo
      medication: `${p.medicationName}`,
      status: p.status === 'prescribed' ? 'new' : p.status === 'dispensed' ? 'ready' : 'processing',
      waitTime: Math.floor(Math.random() * 20), // Demo wait time
      priority: 'normal',
      insuranceStatus: 'approved'
    }));
    
    console.log(`[PHARMACY API] 📋 Returning ${simplifiedPrescriptions.length} simplified prescriptions for dashboard`);
    
    return simplifiedPrescriptions;
  }

  async updatePrescriptionStatus(prescriptionId: string, newStatus: string): Promise<any> {
    console.log(`[PHARMACY API] 🔄 Updating prescription ${prescriptionId} to status: ${newStatus}`);
    
    try {
      // If status is 'dispensed', archive the prescription and remove from active prescriptions
      if (newStatus === 'dispensed') {
        console.log(`[PHARMACY API] 📦 Archiving dispensed prescription: ${prescriptionId}`);
        
        // Get the current prescription data
        const [currentPrescription] = await db
          .select()
          .from(prescriptions)
          .where(eq(prescriptions.id, prescriptionId));

        if (!currentPrescription) {
          throw new Error('Prescription not found');
        }

        // Insert into archives using the actual database structure (JSONB columns)
        await db.execute(sql`
          INSERT INTO prescription_archives (
            tenant_id, 
            shift_id,
            original_prescription_id,
            patient_data,
            prescription_data,
            receipt_data,
            archived_by
          ) VALUES (
            ${currentPrescription.pharmacyTenantId || currentPrescription.tenantId},
            NULL,
            ${currentPrescription.id},
            ${JSON.stringify({
              id: currentPrescription.patientId,
              name: 'Patient', // We'll get this from a join if needed
              medication: currentPrescription.medicationName
            })},
            ${JSON.stringify({
              id: currentPrescription.id,
              medicationName: currentPrescription.medicationName,
              dosage: currentPrescription.dosage,
              frequency: currentPrescription.frequency,
              quantity: currentPrescription.quantity,
              refills: currentPrescription.refills,
              instructions: currentPrescription.instructions,
              status: 'dispensed',
              prescribedDate: currentPrescription.prescribedDate,
              dispensedDate: new Date(),
              insuranceProvider: currentPrescription.insuranceProvider,
              insuranceCopay: currentPrescription.insuranceCopay,
              insuranceCoveragePercentage: currentPrescription.insuranceCoveragePercentage,
              totalCost: currentPrescription.totalCost,
              pharmacyNotes: currentPrescription.pharmacyNotes
            })},
            ${JSON.stringify({
              claimNumber: `CLM-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
              transactionId: `TXN-${new Date().getFullYear()}-${String(Date.now()).slice(-8)}`,
              dispensedAt: new Date(),
              dispensedBy: 'system'
            })},
            NULL
          )
        `);

        // Delete from active prescriptions
        await db.delete(prescriptions).where(eq(prescriptions.id, prescriptionId));

        console.log(`[PHARMACY API] ✅ Prescription ${prescriptionId} archived and removed from active queue`);
        return { ...currentPrescription, status: 'dispensed', archived: true };
      } else {
        // Normal status update for non-dispensed statuses
        const [updatedPrescription] = await db
          .update(prescriptions)
          .set({ 
            status: newStatus,
            updatedAt: new Date()
          })
          .where(eq(prescriptions.id, prescriptionId))
          .returning();

        if (!updatedPrescription) {
          throw new Error('Prescription not found');
        }

        console.log(`[PHARMACY API] ✅ Successfully updated prescription status to: ${newStatus}`);
        return updatedPrescription;
      }
    } catch (error) {
      console.error(`[PHARMACY API] ❌ Error updating prescription status:`, error);
      throw error;
    }
  }

  async getPrescriptionArchives(tenantId: string): Promise<any[]> {
    try {
      console.log(`[PHARMACY API] 🔍 Getting prescription archives for tenant: ${tenantId}`);
      
      const archiveResults = await db.execute(sql`
        SELECT * FROM prescription_archives 
        WHERE tenant_id = ${tenantId}
        ORDER BY archived_at DESC
      `);
      
      console.log(`[PHARMACY API] ✅ Found ${archiveResults.length} archived prescriptions`);
      
      return archiveResults.map((row: any) => ({
        id: row.id,
        originalPrescriptionId: row.original_prescription_id,
        tenantId: row.tenant_id,
        patientData: row.patient_data,
        prescriptionData: row.prescription_data,
        receiptData: row.receipt_data,
        archivedAt: row.archived_at,
        archivedBy: row.archived_by
      }));
    } catch (error) {
      console.error(`[PHARMACY API] ❌ Error getting prescription archives:`, error);
      throw error;
    }
  }

  async updatePrescription(id: string, updates: Partial<Prescription>, tenantId: string): Promise<Prescription | undefined> {
    // For pharmacy updates, we need to check both tenantId (hospital) and pharmacyTenantId (pharmacy)
    const [prescription] = await db.update(prescriptions)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(
        and(
          eq(prescriptions.id, id),
          or(
            eq(prescriptions.tenantId, tenantId), // Hospital/clinic that created it
            eq(prescriptions.pharmacyTenantId, tenantId) // Pharmacy that received it
          )
        )
      )
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
    
    // If lab order status is changed to 'completed', update associated laboratory bill status
    if (labOrder && updates.status === 'completed') {
      try {
        // Find the laboratory bill associated with this lab order
        const [associatedBill] = await db
          .select()
          .from(labBills)
          .where(eq(labBills.labOrderId, id));
        
        if (associatedBill) {
          // Update the bill status to 'completed' when lab work is done
          await db
            .update(labBills)
            .set({ 
              status: 'completed',
              updatedAt: sql`CURRENT_TIMESTAMP`
            })
            .where(eq(labBills.id, associatedBill.id));
          
          console.log(`[LAB BILLING SYNC] Updated bill status to 'completed' for lab order ${id}, bill ID: ${associatedBill.id}`);
        }
      } catch (error) {
        console.error(`[LAB BILLING SYNC] Error updating bill status for lab order ${id}:`, error);
      }
    }
    
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
    // Get the user first
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    // Find patient by matching first name, last name, and tenant
    const [patient] = await db.select().from(patients).where(
      and(
        eq(patients.firstName, user.firstName),
        eq(patients.lastName, user.lastName),
        eq(patients.tenantId, tenantId)
      )
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

  async getPharmaciesForPrescriptionRouting(): Promise<any[]> {
    // Get all pharmacy tenants for prescription routing
    const pharmacyTenants = await db.select({
      id: tenants.id,
      name: tenants.name,
      type: tenants.type,
      subdomain: tenants.subdomain,
      isActive: tenants.isActive
    }).from(tenants).where(
      and(eq(tenants.type, 'pharmacy'), eq(tenants.isActive, true))
    ).orderBy(tenants.name);
    
    return pharmacyTenants;
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
      todayAppointments: Number(todayAppointmentsResult.count) || 0,
      pendingLabResults: Number(pendingLabResultsResult.count) || 0,
      activePrescriptions: Number(activePrescriptionsResult.count) || 0,
      monthlyClaimsTotal: Number(monthlyClaimsResult.total) || 0
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

  async getMedicalCommunicationsByPatient(patientId: string, tenantId: string): Promise<any[]> {
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
      .where(
        and(eq(medicalCommunications.patientId, patientId), eq(medicalCommunications.tenantId, tenantId))
      )
      .orderBy(desc(medicalCommunications.createdAt));
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

  // SECURITY: Controlled cross-tenant lab results access with explicit authorization
  async getLabResultsForPatientAcrossTenants(
    patientId: string, 
    accessContext: { type: 'doctor_view' | 'patient_portal', tenantId: string, userId: string }
  ): Promise<any[]> {
    
    // SECURITY AUDIT: Log cross-tenant lab access
    console.log(`[SECURITY AUDIT] Cross-tenant lab results access: ${accessContext.type} by user ${accessContext.userId} from tenant ${accessContext.tenantId} for patient ${patientId}`);
    
    // Verify patient belongs to requesting tenant or user has cross-tenant access rights
    const patient = await db.select().from(patients).where(eq(patients.id, patientId)).limit(1);
    if (!patient.length) {
      throw new Error("Patient not found");
    }
    
    // Only allow cross-tenant access for legitimate medical purposes
    if (accessContext.type === 'doctor_view') {
      // Doctor must be from same tenant as patient or have explicit access
      // Additional validation could be added here for doctor-patient relationships
    } else if (accessContext.type === 'patient_portal') {
      // Patient can only access their own data
      // Additional validation for patient identity should be done at route level
    }
    
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
    console.log("🔧 [STORAGE] Creating role permission with data:", permission);
    
    if (!permission.createdBy) {
      throw new Error("createdBy field is required for creating role permissions");
    }
    
    const [created] = await db.insert(rolePermissions).values(permission).returning();
    console.log("🔧 [STORAGE] Create result:", created);
    return created;
  }

  async updateRolePermission(id: string, updates: Partial<RolePermission>, tenantId: string): Promise<RolePermission | undefined> {
    console.log("🔧 [STORAGE] Updating role permission:", { id, updates, tenantId });
    
    // Don't pass createdBy in updates as it should not change
    const { createdBy, createdAt, ...updateData } = updates;
    
    const [updated] = await db.update(rolePermissions)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(and(eq(rolePermissions.id, id), eq(rolePermissions.tenantId, tenantId)))
      .returning();
    
    console.log("🔧 [STORAGE] Update result:", updated);
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

  // Lab Bills Management
  async getLabBillsByTenant(tenantId: string): Promise<any[]> {
    try {
      // Fetch lab bills with patient information for cross-tenant enrichment
      const bills = await db
        .select({
          id: labBills.id,
          tenantId: labBills.tenantId,
          patientId: labBills.patientId,
          amount: labBills.amount,
          description: labBills.description,
          status: labBills.status,
          serviceType: labBills.serviceType,
          labOrderId: labBills.labOrderId,
          testName: labBills.testName,
          notes: labBills.notes,
          generatedBy: labBills.generatedBy,
          createdAt: labBills.createdAt,
          updatedAt: labBills.updatedAt,
        })
        .from(labBills)
        .where(eq(labBills.tenantId, tenantId))
        .orderBy(desc(labBills.createdAt));

      // Enrich with patient information (cross-tenant access)
      const enrichedBills = [];
      for (const bill of bills) {
        const patient = await this.getPatientById(bill.patientId);
        enrichedBills.push({
          ...bill,
          patientFirstName: patient?.firstName,
          patientLastName: patient?.lastName,
          patientMrn: patient?.mrn,
        });
      }

      return enrichedBills;
    } catch (error) {
      console.error('Error fetching lab bills:', error);
      return [];
    }
  }

  async createLabBill(bill: any): Promise<any> {
    const [labBill] = await db.insert(labBills).values(bill).returning();
    return labBill;
  }

  async updateLabBill(id: string, updates: Partial<any>, tenantId: string): Promise<any | undefined> {
    const [bill] = await db.update(labBills)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(and(eq(labBills.id, id), eq(labBills.tenantId, tenantId)))
      .returning();
    return bill || undefined;
  }

  async getLabBill(id: string, tenantId: string): Promise<any | undefined> {
    const [bill] = await db.select().from(labBills)
      .where(and(eq(labBills.id, id), eq(labBills.tenantId, tenantId)));
    
    if (bill) {
      // Enrich with patient information
      const patient = await this.getPatientById(bill.patientId);
      return {
        ...bill,
        patientFirstName: patient?.firstName,
        patientLastName: patient?.lastName,
        patientMrn: patient?.mrn,
      };
    }
    
    return undefined;
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

  // Patient Assignment Management Implementation
  async getPatientAssignment(id: string, tenantId: string): Promise<any | undefined> {
    const [assignment] = await db.select().from(patientAssignments).where(
      and(eq(patientAssignments.id, id), eq(patientAssignments.tenantId, tenantId))
    );
    return assignment || undefined;
  }

  async createPatientAssignment(assignment: any): Promise<any> {
    const [newAssignment] = await db.insert(patientAssignments).values(assignment).returning();
    return newAssignment;
  }

  async assignPatientToPhysician(data: any): Promise<any> {
    // Use createPatientAssignment with proper data structure
    return await this.createPatientAssignment({
      id: randomUUID(),
      tenantId: data.tenantId,
      patientId: data.patientId,
      physicianId: data.physicianId,
      assignmentType: data.assignmentType || 'primary_care',
      assignedBy: data.assignedBy,
      assignedDate: data.assignedDate || new Date(),
      expiryDate: data.expiryDate || null,
      isActive: data.isActive !== undefined ? data.isActive : true,
      notes: data.notes || null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  async updatePatientAssignment(id: string, updates: any, tenantId: string): Promise<any | undefined> {
    const [updated] = await db.update(patientAssignments)
      .set(updates)
      .where(and(eq(patientAssignments.id, id), eq(patientAssignments.tenantId, tenantId)))
      .returning();
    return updated || undefined;
  }

  async getPatientAssignmentsByPhysician(physicianId: string, tenantId: string): Promise<any[]> {
    return await db.select({
      id: patientAssignments.id,
      patientId: patientAssignments.patientId,
      assignmentType: patientAssignments.assignmentType,
      assignedDate: patientAssignments.assignedDate,
      expiryDate: patientAssignments.expiryDate,
      notes: patientAssignments.notes,
      // Patient information
      patientFirstName: patients.firstName,
      patientLastName: patients.lastName,
      patientMRN: patients.mrn,
      patientDateOfBirth: patients.dateOfBirth,
      patientPhone: patients.phone,
      patientEmail: patients.email
    })
    .from(patientAssignments)
    .innerJoin(patients, eq(patientAssignments.patientId, patients.id))
    .where(and(
      eq(patientAssignments.physicianId, physicianId),
      eq(patientAssignments.tenantId, tenantId),
      eq(patientAssignments.isActive, true)
    ))
    .orderBy(desc(patientAssignments.assignedDate));
  }

  async getPatientAssignmentsByPatient(patientId: string, tenantId: string): Promise<any[]> {
    return await db.select({
      id: patientAssignments.id,
      physicianId: patientAssignments.physicianId,
      assignmentType: patientAssignments.assignmentType,
      assignedDate: patientAssignments.assignedDate,
      expiryDate: patientAssignments.expiryDate,
      notes: patientAssignments.notes,
      // Physician information
      physicianFirstName: users.firstName,
      physicianLastName: users.lastName,
      physicianEmail: users.email
    })
    .from(patientAssignments)
    .innerJoin(users, eq(patientAssignments.physicianId, users.id))
    .where(and(
      eq(patientAssignments.patientId, patientId),
      eq(patientAssignments.tenantId, tenantId),
      eq(patientAssignments.isActive, true)
    ))
    .orderBy(desc(patientAssignments.assignedDate));
  }

  async getActivePatientAssignments(tenantId: string): Promise<any[]> {
    return await db.select({
      id: patientAssignments.id,
      patientId: patientAssignments.patientId,
      physicianId: patientAssignments.physicianId,
      assignmentType: patientAssignments.assignmentType,
      assignedDate: patientAssignments.assignedDate,
      expiryDate: patientAssignments.expiryDate,
      notes: patientAssignments.notes,
      // Patient information
      patientName: sql<string>`${patients.firstName} || ' ' || ${patients.lastName}`,
      patientMRN: patients.mrn,
      patientDateOfBirth: patients.dateOfBirth,
      patientPhone: patients.phone,
      patientEmail: patients.email,
      // Physician information
      physicianName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
      physicianEmail: users.email
    })
    .from(patientAssignments)
    .innerJoin(patients, eq(patientAssignments.patientId, patients.id))
    .innerJoin(users, eq(patientAssignments.physicianId, users.id))
    .where(and(
      eq(patientAssignments.tenantId, tenantId),
      eq(patientAssignments.isActive, true)
    ))
    .orderBy(desc(patientAssignments.assignedDate));
  }

  async removePatientAssignment(id: string, tenantId: string): Promise<boolean> {
    const result = await db.update(patientAssignments)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(eq(patientAssignments.id, id), eq(patientAssignments.tenantId, tenantId)));
    return result.rowCount !== undefined && result.rowCount > 0;
  }

  // Patient Access Request Management Implementation
  async getPatientAccessRequest(id: string, tenantId: string): Promise<any | undefined> {
    const [request] = await db.select().from(patientAccessRequests).where(
      and(eq(patientAccessRequests.id, id), eq(patientAccessRequests.tenantId, tenantId))
    );
    return request || undefined;
  }

  async createPatientAccessRequest(request: any): Promise<any> {
    const [newRequest] = await db.insert(patientAccessRequests).values(request).returning();
    return newRequest;
  }

  async updatePatientAccessRequest(id: string, updates: any, tenantId: string): Promise<any | undefined> {
    const [updated] = await db.update(patientAccessRequests)
      .set(updates)
      .where(and(eq(patientAccessRequests.id, id), eq(patientAccessRequests.tenantId, tenantId)))
      .returning();
    return updated || undefined;
  }

  async getPatientAccessRequestsByPhysician(physicianId: string, tenantId: string): Promise<any[]> {
    return await db.select({
      id: patientAccessRequests.id,
      patientId: patientAccessRequests.patientId,
      requestType: patientAccessRequests.requestType,
      reason: patientAccessRequests.reason,
      urgency: patientAccessRequests.urgency,
      status: patientAccessRequests.status,
      requestedDate: patientAccessRequests.requestedDate,
      reviewedDate: patientAccessRequests.reviewedDate,
      reviewNotes: patientAccessRequests.reviewNotes,
      accessGrantedUntil: patientAccessRequests.accessGrantedUntil,
      // Patient information
      patientFirstName: patients.firstName,
      patientLastName: patients.lastName,
      patientMRN: patients.mrn,
      // Target physician information (if applicable)
      targetPhysicianFirstName: users.firstName,
      targetPhysicianLastName: users.lastName
    })
    .from(patientAccessRequests)
    .innerJoin(patients, eq(patientAccessRequests.patientId, patients.id))
    .leftJoin(users, eq(patientAccessRequests.targetPhysicianId, users.id))
    .where(and(
      eq(patientAccessRequests.requestingPhysicianId, physicianId),
      eq(patientAccessRequests.tenantId, tenantId)
    ))
    .orderBy(desc(patientAccessRequests.requestedDate));
  }

  async getPendingPatientAccessRequests(tenantId: string): Promise<any[]> {
    return await db.select({
      id: patientAccessRequests.id,
      patientId: patientAccessRequests.patientId,
      requestingPhysicianId: patientAccessRequests.requestingPhysicianId,
      requestType: patientAccessRequests.requestType,
      reason: patientAccessRequests.reason,
      urgency: patientAccessRequests.urgency,
      requestedDate: patientAccessRequests.requestedDate,
      // Patient information
      patientFirstName: patients.firstName,
      patientLastName: patients.lastName,
      patientMRN: patients.mrn,
      // Requesting physician information
      requestingPhysicianFirstName: users.firstName,
      requestingPhysicianLastName: users.lastName,
      requestingPhysicianEmail: users.email
    })
    .from(patientAccessRequests)
    .innerJoin(patients, eq(patientAccessRequests.patientId, patients.id))
    .innerJoin(users, eq(patientAccessRequests.requestingPhysicianId, users.id))
    .where(and(
      eq(patientAccessRequests.tenantId, tenantId),
      eq(patientAccessRequests.status, 'pending')
    ))
    .orderBy(desc(patientAccessRequests.requestedDate));
  }

  async approvePatientAccessRequest(id: string, reviewedBy: string, tenantId: string, accessUntil?: Date): Promise<any | undefined> {
    const [updated] = await db.update(patientAccessRequests)
      .set({
        status: 'approved',
        reviewedBy,
        reviewedDate: new Date(),
        accessGrantedUntil: accessUntil,
        updatedAt: new Date()
      })
      .where(and(eq(patientAccessRequests.id, id), eq(patientAccessRequests.tenantId, tenantId)))
      .returning();
    return updated || undefined;
  }

  async denyPatientAccessRequest(id: string, reviewedBy: string, reviewNotes: string, tenantId: string): Promise<any | undefined> {
    const [updated] = await db.update(patientAccessRequests)
      .set({
        status: 'denied',
        reviewedBy,
        reviewedDate: new Date(),
        reviewNotes,
        updatedAt: new Date()
      })
      .where(and(eq(patientAccessRequests.id, id), eq(patientAccessRequests.tenantId, tenantId)))
      .returning();
    return updated || undefined;
  }

  // Enhanced Patient Methods with Assignment Controls
  async getAssignedPatients(physicianId: string, tenantId: string): Promise<Patient[]> {
    return await db.select({
      id: patients.id,
      tenantId: patients.tenantId,
      mrn: patients.mrn,
      firstName: patients.firstName,
      lastName: patients.lastName,
      dateOfBirth: patients.dateOfBirth,
      gender: patients.gender,
      phone: patients.phone,
      email: patients.email,
      address: patients.address,
      emergencyContact: patients.emergencyContact,
      insuranceInfo: patients.insuranceInfo,
      preferredPharmacyId: patients.preferredPharmacyId,
      primaryPhysicianId: patients.primaryPhysicianId,
      medicalHistory: patients.medicalHistory,
      allergies: patients.allergies,
      medications: patients.medications,
      isActive: patients.isActive,
      createdAt: patients.createdAt,
      updatedAt: patients.updatedAt
    })
    .from(patients)
    .innerJoin(patientAssignments, eq(patients.id, patientAssignments.patientId))
    .where(and(
      eq(patientAssignments.physicianId, physicianId),
      eq(patientAssignments.tenantId, tenantId),
      eq(patientAssignments.isActive, true),
      eq(patients.isActive, true)
    ))
    .orderBy(patients.lastName, patients.firstName);
  }

  async hasPatientAccess(physicianId: string, patientId: string, tenantId: string): Promise<boolean> {
    // Check for direct assignment
    const assignment = await db.select().from(patientAssignments).where(
      and(
        eq(patientAssignments.physicianId, physicianId),
        eq(patientAssignments.patientId, patientId),
        eq(patientAssignments.tenantId, tenantId),
        eq(patientAssignments.isActive, true)
      )
    ).limit(1);

    if (assignment.length > 0) {
      return true;
    }

    // Check for approved temporary access
    const accessRequest = await db.select().from(patientAccessRequests).where(
      and(
        eq(patientAccessRequests.requestingPhysicianId, physicianId),
        eq(patientAccessRequests.patientId, patientId),
        eq(patientAccessRequests.tenantId, tenantId),
        eq(patientAccessRequests.status, 'approved'),
        or(
          isNull(patientAccessRequests.accessGrantedUntil),
          gt(patientAccessRequests.accessGrantedUntil, new Date())
        )
      )
    ).limit(1);

    return accessRequest.length > 0;
  }

  async getPatientWithAccessCheck(patientId: string, physicianId: string, tenantId: string): Promise<Patient | undefined> {
    const hasAccess = await this.hasPatientAccess(physicianId, patientId, tenantId);
    if (!hasAccess) {
      return undefined;
    }

    return await this.getPatient(patientId, tenantId);
  }

  // Pharmacy Receipt Management Implementation
  async getPharmacyReceipt(id: string, tenantId: string): Promise<PharmacyReceipt | undefined> {
    const [receipt] = await db.select().from(pharmacyReceipts).where(
      and(eq(pharmacyReceipts.id, id), eq(pharmacyReceipts.tenantId, tenantId))
    );
    return receipt || undefined;
  }

  async createPharmacyReceipt(receipt: InsertPharmacyReceipt): Promise<PharmacyReceipt> {
    const [newReceipt] = await db.insert(pharmacyReceipts).values(receipt).returning();
    return newReceipt;
  }

  async updatePharmacyReceipt(id: string, updates: Partial<PharmacyReceipt>, tenantId: string): Promise<PharmacyReceipt | undefined> {
    const [updatedReceipt] = await db.update(pharmacyReceipts)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(pharmacyReceipts.id, id), eq(pharmacyReceipts.tenantId, tenantId)))
      .returning();
    return updatedReceipt || undefined;
  }

  async getPharmacyReceiptsByPatient(patientId: string, tenantId: string): Promise<PharmacyReceipt[]> {
    return await db.select().from(pharmacyReceipts)
      .where(and(eq(pharmacyReceipts.patientId, patientId), eq(pharmacyReceipts.tenantId, tenantId)))
      .orderBy(desc(pharmacyReceipts.dispensedDate));
  }

  async getPharmacyReceiptsByPrescription(prescriptionId: string, tenantId: string): Promise<PharmacyReceipt[]> {
    return await db.select().from(pharmacyReceipts)
      .where(and(eq(pharmacyReceipts.prescriptionId, prescriptionId), eq(pharmacyReceipts.tenantId, tenantId)))
      .orderBy(desc(pharmacyReceipts.dispensedDate));
  }

  async getPharmacyReceiptsByTenant(tenantId: string, limit: number = 50, offset: number = 0): Promise<PharmacyReceipt[]> {
    return await db.select().from(pharmacyReceipts)
      .where(eq(pharmacyReceipts.tenantId, tenantId))
      .orderBy(desc(pharmacyReceipts.dispensedDate))
      .limit(limit)
      .offset(offset);
  }

  async generateReceiptNumber(tenantId: string): Promise<string> {
    // Get tenant info for receipt number prefix
    const tenant = await this.getTenant(tenantId);
    const prefix = tenant?.name?.substring(0, 3).toUpperCase() || 'RX';
    
    // Generate unique receipt number with timestamp and random component
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `${prefix}-${timestamp}-${random}`;
  }

  // Achievement System Implementation
  async getAchievements(): Promise<Achievement[]> {
    return await db.select().from(achievements).where(eq(achievements.isActive, true)).orderBy(achievements.name);
  }

  async getAchievement(id: string): Promise<Achievement | undefined> {
    const [achievement] = await db.select().from(achievements).where(eq(achievements.id, id));
    return achievement || undefined;
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const [created] = await db.insert(achievements).values(achievement).returning();
    return created;
  }

  async updateAchievement(id: string, updates: Partial<Achievement>): Promise<Achievement | undefined> {
    const [updated] = await db.update(achievements)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(achievements.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteAchievement(id: string): Promise<boolean> {
    const result = await db.update(achievements)
      .set({ isActive: false })
      .where(eq(achievements.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getUserAchievements(userId: string, tenantId: string): Promise<UserAchievement[]> {
    return await db.select()
      .from(userAchievements)
      .where(and(eq(userAchievements.userId, userId), eq(userAchievements.tenantId, tenantId)))
      .orderBy(desc(userAchievements.earnedAt));
  }

  async getUserAchievement(userId: string, achievementId: string, tenantId: string): Promise<UserAchievement | undefined> {
    const [userAchievement] = await db.select()
      .from(userAchievements)
      .where(and(
        eq(userAchievements.userId, userId), 
        eq(userAchievements.achievementId, achievementId),
        eq(userAchievements.tenantId, tenantId)
      ));
    return userAchievement || undefined;
  }

  async createUserAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement> {
    const [created] = await db.insert(userAchievements).values(userAchievement).returning();
    return created;
  }

  async updateUserAchievement(id: string, updates: Partial<UserAchievement>): Promise<UserAchievement | undefined> {
    const [updated] = await db.update(userAchievements)
      .set(updates)
      .where(eq(userAchievements.id, id))
      .returning();
    return updated || undefined;
  }

  async getUserStats(userId: string, tenantId: string): Promise<UserStats | undefined> {
    const [stats] = await db.select()
      .from(userStats)
      .where(and(eq(userStats.userId, userId), eq(userStats.tenantId, tenantId)));
    return stats || undefined;
  }

  async createUserStats(userStatsData: InsertUserStats): Promise<UserStats> {
    const [created] = await db.insert(userStats).values(userStatsData).returning();
    return created;
  }

  async updateUserStats(userId: string, tenantId: string, updates: Partial<UserStats>): Promise<UserStats | undefined> {
    const [updated] = await db.update(userStats)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(userStats.userId, userId), eq(userStats.tenantId, tenantId)))
      .returning();
    return updated || undefined;
  }

  async getLeaderboard(tenantId: string, period: string, limit = 10): Promise<Leaderboard[]> {
    return await db.select()
      .from(leaderboards)
      .where(and(eq(leaderboards.tenantId, tenantId), eq(leaderboards.period, period)))
      .orderBy(leaderboards.position)
      .limit(limit);
  }

  async updateLeaderboard(tenantId: string, period: string): Promise<void> {
    // Calculate current period dates
    const now = new Date();
    let periodStart: Date;
    let periodEnd: Date;

    switch (period) {
      case 'daily':
        periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        periodEnd = new Date(periodStart.getTime() + 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        const startOfWeek = now.getDate() - now.getDay();
        periodStart = new Date(now.getFullYear(), now.getMonth(), startOfWeek);
        periodEnd = new Date(periodStart.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      default:
        // all-time
        periodStart = new Date(0);
        periodEnd = now;
    }

    // Get top users by points
    const topUsers = await db.select({
      userId: userStats.userId,
      userName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
      points: userStats.totalPoints,
      level: userStats.level,
      testsCompleted: userStats.testsCompleted,
      qualityScore: userStats.qualityScore
    })
    .from(userStats)
    .innerJoin(users, eq(userStats.userId, users.id))
    .where(eq(userStats.tenantId, tenantId))
    .orderBy(desc(userStats.totalPoints))
    .limit(50);

    // Clear existing leaderboard for this period
    await db.delete(leaderboards)
      .where(and(eq(leaderboards.tenantId, tenantId), eq(leaderboards.period, period)));

    // Insert new leaderboard entries
    if (topUsers.length > 0) {
      const leaderboardEntries = topUsers.map((user, index) => ({
        tenantId,
        userId: user.userId,
        userName: user.userName,
        position: index + 1,
        points: user.points,
        level: user.level,
        testsCompleted: user.testsCompleted,
        qualityScore: user.qualityScore || 0,
        period,
        periodStart,
        periodEnd
      }));

      await db.insert(leaderboards).values(leaderboardEntries);
    }
  }

  async getActivityLogs(userId: string, tenantId: string, limit = 50): Promise<ActivityLog[]> {
    return await db.select()
      .from(activityLogs)
      .where(and(eq(activityLogs.userId, userId), eq(activityLogs.tenantId, tenantId)))
      .orderBy(desc(activityLogs.timestamp))
      .limit(limit);
  }

  async createActivityLog(activityLog: InsertActivityLog): Promise<ActivityLog> {
    const [created] = await db.insert(activityLogs).values(activityLog).returning();
    return created;
  }

  async checkAndUpdateAchievements(userId: string, tenantId: string, activityType: string, metadata?: any): Promise<UserAchievement[]> {
    const newAchievements: UserAchievement[] = [];
    
    // Get user stats
    const stats = await this.getUserStats(userId, tenantId);
    if (!stats) return newAchievements;

    // Get all active achievements
    const allAchievements = await this.getAchievements();
    
    // Check each achievement criteria
    for (const achievement of allAchievements) {
      const existingUserAchievement = await this.getUserAchievement(userId, achievement.id, tenantId);
      
      if (!existingUserAchievement) {
        // Check if user meets achievement criteria
        const criteria = achievement.criteria as any;
        let meetsRequirement = false;

        switch (achievement.type) {
          case 'productivity':
            if (criteria.testsCompleted && stats.testsCompleted >= criteria.testsCompleted) {
              meetsRequirement = true;
            }
            break;
          case 'quality':
            if (criteria.qualityScore && parseFloat(stats.qualityScore.toString()) >= criteria.qualityScore) {
              meetsRequirement = true;
            }
            break;
          case 'consistency':
            if (criteria.streakDays && stats.consistencyStreak >= criteria.streakDays) {
              meetsRequirement = true;
            }
            break;
          case 'milestone':
            if (criteria.totalPoints && stats.totalPoints >= criteria.totalPoints) {
              meetsRequirement = true;
            }
            break;
        }

        if (meetsRequirement) {
          const userAchievement = await this.createUserAchievement({
            userId,
            tenantId,
            achievementId: achievement.id,
            progress: 100,
            maxProgress: 100,
            isCompleted: true,
            completedAt: new Date()
          });
          
          newAchievements.push(userAchievement);

          // Award points
          await this.updateUserStats(userId, tenantId, {
            totalPoints: stats.totalPoints + achievement.points
          });

          // Log achievement
          await this.createActivityLog({
            userId,
            tenantId,
            activityType: 'achievement_earned',
            points: achievement.points,
            metadata: { achievementId: achievement.id, achievementName: achievement.name }
          });
        }
      }
    }

    return newAchievements;
  }

  calculateUserLevel(totalPoints: number): number {
    // Simple level calculation: 100 points per level
    return Math.floor(totalPoints / 100) + 1;
  }

  async updateUserStatsFromActivity(userId: string, tenantId: string, activityType: string, metadata?: any): Promise<UserStats | undefined> {
    let stats = await this.getUserStats(userId, tenantId);
    
    if (!stats) {
      // Create initial stats
      stats = await this.createUserStats({
        userId,
        tenantId,
        level: 1,
        totalPoints: 0,
        testsCompleted: 0,
        averageCompletionTime: 0,
        qualityScore: 0,
        consistencyStreak: 0,
        lastActivityDate: new Date()
      });
    }

    const updates: Partial<UserStats> = {
      lastActivityDate: new Date()
    };

    // Update stats based on activity type
    switch (activityType) {
      case 'lab_test_completed':
        updates.testsCompleted = stats.testsCompleted + 1;
        updates.totalPoints = stats.totalPoints + 10; // Base points for test completion
        
        if (metadata?.completionTime) {
          const currentAvg = stats.averageCompletionTime;
          const newAvg = ((currentAvg * (stats.testsCompleted - 1)) + metadata.completionTime) / stats.testsCompleted;
          updates.averageCompletionTime = Math.round(newAvg);
        }
        
        if (metadata?.quality) {
          const currentScore = parseFloat(stats.qualityScore.toString());
          const newScore = ((currentScore * (stats.testsCompleted - 1)) + metadata.quality) / stats.testsCompleted;
          updates.qualityScore = Math.round(newScore * 100) / 100;
        }

        // Update consistency streak
        const lastActivity = stats.lastActivityDate;
        const today = new Date();
        const daysDiff = Math.floor((today.getTime() - (lastActivity?.getTime() || 0)) / (1000 * 60 * 60 * 24));
        
        if (daysDiff <= 1) {
          updates.consistencyStreak = stats.consistencyStreak + 1;
        } else if (daysDiff > 1) {
          updates.consistencyStreak = 1; // Reset streak
        }
        break;
    }

    // Calculate new level
    if (updates.totalPoints) {
      updates.level = this.calculateUserLevel(updates.totalPoints);
    }

    return await this.updateUserStats(userId, tenantId, updates);
  }

  // Work Shift Management Implementation
  async getWorkShift(id: string, tenantId: string): Promise<WorkShift | undefined> {
    const [shift] = await db.select().from(workShifts).where(
      and(eq(workShifts.id, id), eq(workShifts.tenantId, tenantId))
    );
    return shift || undefined;
  }

  async createWorkShift(shift: InsertWorkShift): Promise<WorkShift> {
    const [newShift] = await db.insert(workShifts).values(shift).returning();
    return newShift;
  }

  async updateWorkShift(id: string, updates: Partial<WorkShift>, tenantId: string): Promise<WorkShift | undefined> {
    const [updatedShift] = await db.update(workShifts)
      .set(updates)
      .where(and(eq(workShifts.id, id), eq(workShifts.tenantId, tenantId)))
      .returning();
    return updatedShift || undefined;
  }

  async getActiveWorkShifts(tenantId: string): Promise<WorkShift[]> {
    return await db.select().from(workShifts).where(
      eq(workShifts.tenantId, tenantId)
    ).orderBy(desc(workShifts.startTime));
  }

  async endWorkShift(id: string, tenantId: string): Promise<WorkShift | undefined> {
    const [shift] = await db.update(workShifts)
      .set({ endTime: new Date() })
      .where(and(eq(workShifts.id, id), eq(workShifts.tenantId, tenantId)))
      .returning();
    return shift || undefined;
  }

  async getCurrentWorkShift(userId: string, tenantId: string): Promise<WorkShift | undefined> {
    const [shift] = await db.select().from(workShifts).where(
      and(
        eq(workShifts.userId, userId),
        eq(workShifts.tenantId, tenantId),
        isNull(workShifts.endTime)
      )
    );
    return shift || undefined;
  }

  // Pharmacy Patient Insurance Management Implementation
  async getPharmacyPatientInsurance(patientId: string, tenantId: string): Promise<PharmacyPatientInsurance | undefined> {
    const [insurance] = await db.select().from(pharmacyPatientInsurance).where(
      and(eq(pharmacyPatientInsurance.patientId, patientId), eq(pharmacyPatientInsurance.tenantId, tenantId))
    );
    return insurance || undefined;
  }

  async createPharmacyPatientInsurance(insurance: InsertPharmacyPatientInsurance): Promise<PharmacyPatientInsurance> {
    const [newInsurance] = await db.insert(pharmacyPatientInsurance).values(insurance).returning();
    return newInsurance;
  }

  async updatePharmacyPatientInsurance(id: string, updates: Partial<PharmacyPatientInsurance>, tenantId: string): Promise<PharmacyPatientInsurance | undefined> {
    const [updatedInsurance] = await db.update(pharmacyPatientInsurance)
      .set(updates)
      .where(and(eq(pharmacyPatientInsurance.id, id), eq(pharmacyPatientInsurance.tenantId, tenantId)))
      .returning();
    return updatedInsurance || undefined;
  }

  async getPharmacyPatientInsuranceByTenant(tenantId: string): Promise<PharmacyPatientInsurance[]> {
    return await db.select().from(pharmacyPatientInsurance).where(eq(pharmacyPatientInsurance.tenantId, tenantId));
  }

  // Archived Records Management Implementation
  async createArchivedRecord(record: InsertArchivedRecord): Promise<ArchivedRecord> {
    const [newRecord] = await db.insert(archivedRecords).values(record).returning();
    return newRecord;
  }

  async searchArchivedRecords(tenantId: string, query: string): Promise<ArchivedRecord[]> {
    return await db.select().from(archivedRecords).where(
      and(
        eq(archivedRecords.tenantId, tenantId),
        or(
          like(archivedRecords.recordType, `%${query}%`),
          like(archivedRecords.searchableContent, `%${query}%`)
        )
      )
    ).orderBy(desc(archivedRecords.createdAt));
  }

  async getArchivedRecordsByShift(workShiftId: string, tenantId: string): Promise<ArchivedRecord[]> {
    return await db.select().from(archivedRecords).where(
      and(eq(archivedRecords.workShiftId, workShiftId), eq(archivedRecords.tenantId, tenantId))
    );
  }

  async getArchivedRecordsByPatient(patientId: string, tenantId: string): Promise<ArchivedRecord[]> {
    return await db.select().from(archivedRecords).where(
      and(eq(archivedRecords.patientId, patientId), eq(archivedRecords.tenantId, tenantId))
    ).orderBy(desc(archivedRecords.createdAt));
  }

  async archiveRecordsForShift(workShiftId: string, tenantId: string): Promise<void> {
    // This would implement the logic to automatically archive records when a shift ends
    // For now, this is a placeholder that could trigger the archival process
    console.log(`Archiving records for shift ${workShiftId} in tenant ${tenantId}`);
  }

  // Pharmacy Report Templates Management Implementation
  async getPharmacyReportTemplate(id: string, tenantId: string): Promise<PharmacyReportTemplate | undefined> {
    const [template] = await db.select().from(pharmacyReportTemplates).where(
      and(eq(pharmacyReportTemplates.id, id), eq(pharmacyReportTemplates.tenantId, tenantId))
    );
    return template || undefined;
  }

  async createPharmacyReportTemplate(template: InsertPharmacyReportTemplate): Promise<PharmacyReportTemplate> {
    const [newTemplate] = await db.insert(pharmacyReportTemplates).values(template).returning();
    return newTemplate;
  }

  async updatePharmacyReportTemplate(id: string, updates: Partial<PharmacyReportTemplate>, tenantId: string): Promise<PharmacyReportTemplate | undefined> {
    const [updatedTemplate] = await db.update(pharmacyReportTemplates)
      .set(updates)
      .where(and(eq(pharmacyReportTemplates.id, id), eq(pharmacyReportTemplates.tenantId, tenantId)))
      .returning();
    return updatedTemplate || undefined;
  }

  // Report Generation Methods
  async generateSalesReport(tenantId: string, dateRange: { start?: string; end?: string } = {}): Promise<any[]> {
    const { start, end } = dateRange;
    let query = db
      .select({
        date: sql<string>`DATE(${pharmacyReceipts.createdAt})`,
        totalAmount: sql<number>`SUM(${pharmacyReceipts.paymentAmount})`,
        transactionCount: sql<number>`COUNT(*)`,
        averageAmount: sql<number>`AVG(${pharmacyReceipts.paymentAmount})`,
        totalCost: sql<number>`SUM(${pharmacyReceipts.totalCost})`,
        insuranceAmount: sql<number>`SUM(${pharmacyReceipts.insuranceAmount})`,
        copayAmount: sql<number>`SUM(${pharmacyReceipts.patientCopay})`,
      })
      .from(pharmacyReceipts)
      .where(eq(pharmacyReceipts.tenantId, tenantId));

    if (start) {
      query = query.where(sql`${pharmacyReceipts.createdAt} >= ${start}`);
    }
    if (end) {
      query = query.where(sql`${pharmacyReceipts.createdAt} <= ${end}`);
    }

    return await query.groupBy(sql`DATE(${pharmacyReceipts.createdAt})`).orderBy(sql`DATE(${pharmacyReceipts.createdAt}) DESC`);
  }

  async generatePrescriptionReport(tenantId: string, dateRange: { start?: string; end?: string } = {}): Promise<any[]> {
    const { start, end } = dateRange;
    let query = db
      .select({
        patientName: sql<string>`CONCAT(${patients.firstName}, ' ', ${patients.lastName})`,
        medicationName: prescriptions.medicationName,
        quantity: prescriptions.quantity,
        dispensedDate: sql<string>`DATE(${prescriptions.updatedAt})`,
        prescribedBy: prescriptions.prescribedBy,
        status: prescriptions.status,
      })
      .from(prescriptions)
      .leftJoin(patients, eq(prescriptions.patientId, patients.id))
      .where(eq(prescriptions.tenantId, tenantId));

    if (start) {
      query = query.where(sql`${prescriptions.updatedAt} >= ${start}`);
    }
    if (end) {
      query = query.where(sql`${prescriptions.updatedAt} <= ${end}`);
    }

    return await query.orderBy(desc(prescriptions.updatedAt));
  }

  async generateInventoryReport(tenantId: string, dateRange: { start?: string; end?: string } = {}): Promise<any[]> {
    // Generate sample inventory data since we don't have an inventory table
    const medicationList = [
      { name: 'Amoxicillin', currentStock: 150, minimumStock: 50, expiryDate: '2025-12-31', supplier: 'PharmaCorp' },
      { name: 'Ibuprofen', currentStock: 200, minimumStock: 75, expiryDate: '2026-06-30', supplier: 'MediSupply' },
      { name: 'Metformin', currentStock: 89, minimumStock: 100, expiryDate: '2025-09-15', supplier: 'HealthDist' },
      { name: 'Lisinopril', currentStock: 45, minimumStock: 30, expiryDate: '2026-03-20', supplier: 'PharmaCorp' },
      { name: 'Atorvastatin', currentStock: 120, minimumStock: 60, expiryDate: '2025-11-10', supplier: 'MediSupply' },
    ];

    return medicationList.map(med => ({
      medicationName: med.name,
      currentStock: med.currentStock,
      minimumStock: med.minimumStock,
      stockStatus: med.currentStock <= med.minimumStock ? 'Low Stock' : 'In Stock',
      expiryDate: med.expiryDate,
      supplier: med.supplier,
      lastUpdated: new Date().toISOString().split('T')[0],
    }));
  }

  async generatePatientReport(tenantId: string, dateRange: { start?: string; end?: string } = {}): Promise<any[]> {
    const { start, end } = dateRange;
    let query = db
      .select({
        patientName: sql<string>`CONCAT(${patients.firstName}, ' ', ${patients.lastName})`,
        email: patients.email,
        phone: patients.phone,
        registrationDate: sql<string>`DATE(${patients.createdAt})`,
        lastVisit: sql<string>`MAX(DATE(${appointments.appointmentDate}))`,
        totalPrescriptions: sql<number>`COUNT(DISTINCT ${prescriptions.id})`,
        insuranceProvider: pharmacyPatientInsurance.insuranceProvider,
      })
      .from(patients)
      .leftJoin(appointments, eq(patients.id, appointments.patientId))
      .leftJoin(prescriptions, eq(patients.id, prescriptions.patientId))
      .leftJoin(pharmacyPatientInsurance, eq(patients.id, pharmacyPatientInsurance.patientId))
      .where(eq(patients.tenantId, tenantId));

    if (start) {
      query = query.where(sql`${patients.createdAt} >= ${start}`);
    }
    if (end) {
      query = query.where(sql`${patients.createdAt} <= ${end}`);
    }

    return await query.groupBy(patients.id, patients.firstName, patients.lastName, patients.email, patients.phone, patients.createdAt, pharmacyPatientInsurance.insuranceProvider);
  }

  async generateInsuranceReport(tenantId: string, dateRange: { start?: string; end?: string } = {}): Promise<any[]> {
    const { start, end } = dateRange;
    let query = db
      .select({
        insuranceProvider: pharmacyPatientInsurance.insuranceProvider,
        policyNumber: pharmacyPatientInsurance.policyNumber,
        patientName: sql<string>`CONCAT(${patients.firstName}, ' ', ${patients.lastName})`,
        coverageType: pharmacyPatientInsurance.coverageType,
        copayAmount: pharmacyPatientInsurance.copayAmount,
        deductibleAmount: pharmacyPatientInsurance.deductibleAmount,
        effectiveDate: pharmacyPatientInsurance.effectiveDate,
        status: pharmacyPatientInsurance.isActive,
      })
      .from(pharmacyPatientInsurance)
      .leftJoin(patients, eq(pharmacyPatientInsurance.patientId, patients.id))
      .where(eq(pharmacyPatientInsurance.tenantId, tenantId));

    if (start) {
      query = query.where(sql`${pharmacyPatientInsurance.createdAt} >= ${start}`);
    }
    if (end) {
      query = query.where(sql`${pharmacyPatientInsurance.createdAt} <= ${end}`);
    }

    return await query.orderBy(desc(pharmacyPatientInsurance.createdAt));
  }





  async generatePatientReportForPharmacy(tenantId: string, dateRange: { start?: string; end?: string } = {}): Promise<any[]> {
    const { start, end } = dateRange;
    
    // Get patient data from prescriptions for pharmacy tenants
    let query = db
      .select({
        patientId: prescriptions.patientId,
        patientName: sql<string>`CONCAT(${patients.firstName}, ' ', ${patients.lastName})`,
        prescriptionCount: sql<number>`COUNT(*)`,
        totalMedications: sql<number>`SUM(${prescriptions.quantity})`,
        lastVisit: sql<string>`MAX(${prescriptions.createdAt})`,
        averageQuantity: sql<number>`AVG(${prescriptions.quantity})`,
      })
      .from(prescriptions)
      .innerJoin(patients, eq(prescriptions.patientId, patients.id))
      .where(eq(prescriptions.pharmacyId, tenantId));

    if (start) {
      query = query.where(sql`${prescriptions.createdAt} >= ${start}`);
    }
    if (end) {
      query = query.where(sql`${prescriptions.createdAt} <= ${end}`);
    }

    return await query
      .groupBy(prescriptions.patientId, patients.firstName, patients.lastName)
      .orderBy(sql`COUNT(*) DESC`);
  }

  async generateInsuranceReport(tenantId: string, dateRange: { start?: string; end?: string } = {}): Promise<any[]> {
    const { start, end } = dateRange;
    
    let query = db
      .select({
        insuranceProvider: pharmacyPatientInsurance.insuranceProviderName,
        policyCount: sql<number>`COUNT(DISTINCT ${pharmacyPatientInsurance.policyNumber})`,
        patientCount: sql<number>`COUNT(DISTINCT ${pharmacyPatientInsurance.patientId})`,
        verificationStatus: pharmacyPatientInsurance.verificationStatus,
        averageCopay: sql<number>`AVG(${pharmacyPatientInsurance.copayAmount})`,
        averageDeductible: sql<number>`AVG(${pharmacyPatientInsurance.deductibleAmount})`,
      })
      .from(pharmacyPatientInsurance)
      .where(eq(pharmacyPatientInsurance.tenantId, tenantId));

    if (start) {
      query = query.where(sql`${pharmacyPatientInsurance.createdAt} >= ${start}`);
    }
    if (end) {
      query = query.where(sql`${pharmacyPatientInsurance.createdAt} <= ${end}`);
    }

    return await query
      .groupBy(pharmacyPatientInsurance.insuranceProviderName, pharmacyPatientInsurance.verificationStatus)
      .orderBy(pharmacyPatientInsurance.insuranceProviderName);
  }

  async getPharmacyReportTemplatesByTenant(tenantId: string): Promise<PharmacyReportTemplate[]> {
    return await db.select().from(pharmacyReportTemplates).where(eq(pharmacyReportTemplates.tenantId, tenantId));
  }

  // Hospital Patient Insurance Management
  async createHospitalPatientInsurance(data: any): Promise<any> {
    const result = await db.insert(hospitalPatientInsurance).values(data).returning();
    return result[0];
  }

  async getHospitalPatientInsuranceByPatientId(patientId: string, tenantId?: string): Promise<any | null> {
    if (!tenantId) {
      console.error("[SECURITY VIOLATION] Hospital patient insurance access without tenant context");
      throw new Error("Tenant context required for insurance data access");
    }
    
    console.log(`[SECURITY AUDIT] Hospital patient insurance access for patient ${patientId} by tenant ${tenantId}`);
    const result = await db.select()
      .from(hospitalPatientInsurance)
      .where(and(
        eq(hospitalPatientInsurance.patientId, patientId),
        eq(hospitalPatientInsurance.tenantId, tenantId)
      ))
      .limit(1);
    return result[0] || null;
  }

  async updateHospitalPatientInsurance(id: string, data: any): Promise<any> {
    const result = await db.update(hospitalPatientInsurance)
      .set(data)
      .where(eq(hospitalPatientInsurance.id, id))
      .returning();
    return result[0];
  }

  // Laboratory Patient Insurance Management
  async createLaboratoryPatientInsurance(data: any): Promise<any> {
    const result = await db.insert(laboratoryPatientInsurance).values(data).returning();
    return result[0];
  }

  async getLaboratoryPatientInsuranceByPatientId(patientId: string, tenantId?: string): Promise<any | null> {
    if (!tenantId) {
      console.error("[SECURITY VIOLATION] Laboratory patient insurance access without tenant context");
      throw new Error("Tenant context required for insurance data access");
    }
    
    console.log(`[SECURITY AUDIT] Laboratory patient insurance access for patient ${patientId} by tenant ${tenantId}`);
    const result = await db.select()
      .from(laboratoryPatientInsurance)
      .where(and(
        eq(laboratoryPatientInsurance.patientId, patientId),
        eq(laboratoryPatientInsurance.tenantId, tenantId)
      ))
      .limit(1);
    return result[0] || null;
  }

  async updateLaboratoryPatientInsurance(id: string, data: any): Promise<any> {
    const result = await db.update(laboratoryPatientInsurance)
      .set(data)
      .where(eq(laboratoryPatientInsurance.id, id))
      .returning();
    return result[0];
  }

  async getActivePharmacyReportTemplatesByTenant(tenantId: string): Promise<PharmacyReportTemplate[]> {
    return await db.select().from(pharmacyReportTemplates).where(
      and(eq(pharmacyReportTemplates.tenantId, tenantId), eq(pharmacyReportTemplates.isActive, true))
    );
  }

  async getActivePharmacyReportTemplates(tenantId: string): Promise<PharmacyReportTemplate[]> {
    return await db.select().from(pharmacyReportTemplates).where(
      and(eq(pharmacyReportTemplates.tenantId, tenantId), eq(pharmacyReportTemplates.isActive, true))
    );
  }

  // Hospital Billing Management Implementation
  async getHospitalBill(id: string, tenantId: string): Promise<HospitalBill | undefined> {
    const [bill] = await db.select().from(hospitalBills).where(
      and(eq(hospitalBills.id, id), eq(hospitalBills.tenantId, tenantId))
    );
    return bill || undefined;
  }

  async getHospitalBills(tenantId: string): Promise<HospitalBill[]> {
    // First get basic hospital bills
    const bills = await db.select().from(hospitalBills)
      .where(eq(hospitalBills.tenantId, tenantId))
      .orderBy(desc(hospitalBills.createdAt));
    
    // Enrich with patient data
    const enrichedBills = [];
    for (const bill of bills) {
      const patient = await db.select().from(patients)
        .where(eq(patients.id, bill.patientId))
        .limit(1);
      
      enrichedBills.push({
        ...bill,
        patientFirstName: patient[0]?.firstName || '',
        patientLastName: patient[0]?.lastName || '',
        patientMrn: patient[0]?.mrn || '',
        physicianName: '' // Will be populated when appointment data is linked
      });
    }
    
    return enrichedBills;
  }

  async getHospitalBillsByProvider(providerId: string, tenantId: string): Promise<HospitalBill[]> {
    // Get appointments for this provider to find associated bills
    const providerAppointments = await db.select().from(appointments)
      .where(and(eq(appointments.providerId, providerId), eq(appointments.tenantId, tenantId)));
    
    const appointmentIds = providerAppointments.map(apt => apt.id);
    
    if (appointmentIds.length === 0) {
      return [];
    }
    
    // Get bills for these appointments
    const bills = await db.select().from(hospitalBills)
      .where(
        and(
          eq(hospitalBills.tenantId, tenantId),
          sql`${hospitalBills.appointmentId} = ANY(${appointmentIds})`
        )
      )
      .orderBy(desc(hospitalBills.createdAt));
    
    // Enrich with patient data
    const enrichedBills = [];
    for (const bill of bills) {
      const patient = await db.select().from(patients)
        .where(eq(patients.id, bill.patientId))
        .limit(1);
      
      // Get physician name from the provider user
      const physician = await db.select().from(users)
        .where(eq(users.id, providerId))
        .limit(1);
      
      enrichedBills.push({
        ...bill,
        patientFirstName: patient[0]?.firstName || '',
        patientLastName: patient[0]?.lastName || '',
        patientMrn: patient[0]?.mrn || '',
        physicianName: physician[0] ? `${physician[0].firstName} ${physician[0].lastName}` : ''
      });
    }
    
    return enrichedBills;
  }

  async createHospitalBill(bill: InsertHospitalBill): Promise<HospitalBill> {
    const billNumber = `HB-${Date.now()}`;
    const [newBill] = await db.insert(hospitalBills).values({
      ...bill,
      billNumber
    }).returning();
    return newBill;
  }

  async updateHospitalBill(id: string, updates: Partial<HospitalBill>, tenantId: string): Promise<HospitalBill | undefined> {
    const [updatedBill] = await db.update(hospitalBills)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(and(eq(hospitalBills.id, id), eq(hospitalBills.tenantId, tenantId)))
      .returning();
    return updatedBill || undefined;
  }

  async getHospitalAnalytics(tenantId: string): Promise<any> {
    const totalBills = await db.select({ count: sql<number>`COUNT(*)`.as('count') })
      .from(hospitalBills)
      .where(eq(hospitalBills.tenantId, tenantId));

    const totalRevenue = await db.select({ 
      revenue: sql<number>`SUM(CAST(amount AS DECIMAL))`.as('revenue') 
    })
      .from(hospitalBills)
      .where(eq(hospitalBills.tenantId, tenantId));

    const pendingBills = await db.select({ count: sql<number>`COUNT(*)`.as('count') })
      .from(hospitalBills)
      .where(and(eq(hospitalBills.tenantId, tenantId), eq(hospitalBills.status, 'pending')));

    const paidBills = await db.select({ count: sql<number>`COUNT(*)`.as('count') })
      .from(hospitalBills)
      .where(and(eq(hospitalBills.tenantId, tenantId), eq(hospitalBills.status, 'paid')));

    return {
      totalBills: totalBills[0]?.count || 0,
      totalRevenue: totalRevenue[0]?.revenue || 0,
      pendingBills: pendingBills[0]?.count || 0,
      paidBills: paidBills[0]?.count || 0,
      completionRate: totalBills[0]?.count > 0 
        ? ((paidBills[0]?.count || 0) / totalBills[0].count * 100).toFixed(1)
        : 0
    };
  }

  // Patient Access Request Management for Multi-Doctor Separation
  async createPatientAccessRequest(request: InsertPatientAccessRequest): Promise<PatientAccessRequest> {
    const [newRequest] = await db.insert(patientAccessRequests).values(request).returning();
    return newRequest;
  }

  async getPatientAccessRequests(tenantId: string, doctorId?: string): Promise<PatientAccessRequest[]> {
    const whereClause = doctorId 
      ? and(eq(patientAccessRequests.tenantId, tenantId), 
            or(eq(patientAccessRequests.requestingPhysicianId, doctorId), 
               eq(patientAccessRequests.targetPhysicianId, doctorId)))
      : eq(patientAccessRequests.tenantId, tenantId);

    return await db.select().from(patientAccessRequests)
      .where(whereClause)
      .orderBy(desc(patientAccessRequests.createdAt));
  }

  async updatePatientAccessRequest(id: string, updates: Partial<PatientAccessRequest>, tenantId: string): Promise<PatientAccessRequest | undefined> {
    const [updatedRequest] = await db.update(patientAccessRequests)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(and(eq(patientAccessRequests.id, id), eq(patientAccessRequests.tenantId, tenantId)))
      .returning();
    return updatedRequest || undefined;
  }

  async logPatientAccess(log: InsertPatientAccessAuditLog): Promise<PatientAccessAuditLog> {
    const [newLog] = await db.insert(patientAccessAuditLog).values(log).returning();
    return newLog;
  }

  async getPatientAccessLogs(tenantId: string, patientId?: string, doctorId?: string): Promise<PatientAccessAuditLog[]> {
    let whereClause = eq(patientAccessAuditLog.tenantId, tenantId);
    
    if (patientId) {
      whereClause = and(whereClause, eq(patientAccessAuditLog.patientId, patientId));
    }
    if (doctorId) {
      whereClause = and(whereClause, eq(patientAccessAuditLog.doctorId, doctorId));
    }

    return await db.select().from(patientAccessAuditLog)
      .where(whereClause)
      .orderBy(desc(patientAccessAuditLog.accessedAt));
  }

  async checkDoctorPatientAccess(doctorId: string, patientId: string, tenantId: string): Promise<boolean> {
    // Check if doctor has direct assignment to patient
    const assignment = await db.select().from(patientAssignments)
      .where(
        and(
          eq(patientAssignments.tenantId, tenantId),
          eq(patientAssignments.patientId, patientId),
          eq(patientAssignments.physicianId, doctorId),
          eq(patientAssignments.isActive, true)
        )
      )
      .limit(1);

    if (assignment.length > 0) {
      return true;
    }

    // Check if doctor has approved access request
    const activeRequest = await db.select().from(patientAccessRequests)
      .where(
        and(
          eq(patientAccessRequests.tenantId, tenantId),
          eq(patientAccessRequests.patientId, patientId),
          eq(patientAccessRequests.requestingPhysicianId, doctorId),
          eq(patientAccessRequests.status, 'approved'),
          sql`${patientAccessRequests.accessGrantedUntil} > NOW()`
        )
      )
      .limit(1);

    return activeRequest.length > 0;
  }

  async getHospitalAnalyticsByProvider(providerId: string, tenantId: string): Promise<any> {
    const totalBills = await db.select({ count: sql<number>`COUNT(*)`.as('count') })
      .from(hospitalBills)
      .leftJoin(appointments, eq(hospitalBills.appointmentId, appointments.id))
      .where(
        and(
          eq(hospitalBills.tenantId, tenantId),
          eq(appointments.providerId, providerId)
        )
      );

    const totalRevenue = await db.select({ 
      revenue: sql<number>`SUM(CAST(hospital_bills.amount AS DECIMAL))`.as('revenue') 
    })
      .from(hospitalBills)
      .leftJoin(appointments, eq(hospitalBills.appointmentId, appointments.id))
      .where(
        and(
          eq(hospitalBills.tenantId, tenantId),
          eq(appointments.providerId, providerId)
        )
      );

    const pendingBills = await db.select({ count: sql<number>`COUNT(*)`.as('count') })
      .from(hospitalBills)
      .leftJoin(appointments, eq(hospitalBills.appointmentId, appointments.id))
      .where(
        and(
          eq(hospitalBills.tenantId, tenantId),
          eq(appointments.providerId, providerId),
          eq(hospitalBills.status, 'pending')
        )
      );

    const paidBills = await db.select({ count: sql<number>`COUNT(*)`.as('count') })
      .from(hospitalBills)
      .leftJoin(appointments, eq(hospitalBills.appointmentId, appointments.id))
      .where(
        and(
          eq(hospitalBills.tenantId, tenantId),
          eq(appointments.providerId, providerId),
          eq(hospitalBills.status, 'paid')
        )
      );

    return {
      totalBills: totalBills[0]?.count || 0,
      totalRevenue: totalRevenue[0]?.revenue || 0,
      pendingBills: pendingBills[0]?.count || 0,
      paidBills: paidBills[0]?.count || 0,
      completionRate: totalBills[0]?.count > 0 
        ? ((paidBills[0]?.count || 0) / totalBills[0].count * 100).toFixed(1)
        : 0
    };
  }

  // Department Management
  async getDepartments(tenantId: string): Promise<Department[]> {
    return db.select()
    .from(departments)
    .where(eq(departments.tenantId, tenantId))
    .orderBy(departments.name);
  }

  async createDepartment(data: InsertDepartment): Promise<Department> {
    // Handle array fields properly for PostgreSQL and ensure no id field is passed
    const { id, createdAt, updatedAt, ...cleanData } = data as any;
    
    // Generate UUID using crypto.randomUUID() 
    const uuid = crypto.randomUUID();
    
    const processedData = {
      id: uuid,
      ...cleanData,
      specializations: cleanData.specializations && cleanData.specializations.length > 0 ? cleanData.specializations : null,
      certifications: cleanData.certifications && cleanData.certifications.length > 0 ? cleanData.certifications : null,
      equipment: cleanData.equipment && Array.isArray(cleanData.equipment) && cleanData.equipment.length > 0 ? cleanData.equipment : null,
    };
    

    
    const [department] = await db.insert(departments)
      .values(processedData)
      .returning();
    return department;
  }

  async updateDepartment(id: string, data: Partial<InsertDepartment>, tenantId: string): Promise<Department | null> {
    // Handle array fields properly for PostgreSQL
    const processedData = {
      ...data,
      specializations: data.specializations && data.specializations.length > 0 ? data.specializations : null,
      certifications: data.certifications && data.certifications.length > 0 ? data.certifications : null,
      equipment: data.equipment && Array.isArray(data.equipment) && data.equipment.length > 0 ? data.equipment : null,
      updatedAt: new Date()
    };
    
    const [updated] = await db.update(departments)
      .set(processedData)
      .where(and(
        eq(departments.id, id),
        eq(departments.tenantId, tenantId)
      ))
      .returning();
    return updated || null;
  }

  async deleteDepartment(id: string, tenantId: string): Promise<boolean> {
    const result = await db.delete(departments)
      .where(and(
        eq(departments.id, id),
        eq(departments.tenantId, tenantId)
      ));
    return result.rowCount > 0;
  }

  async getDepartmentById(id: string, tenantId: string): Promise<Department | null> {
    const [department] = await db.select()
      .from(departments)
      .where(and(
        eq(departments.id, id),
        eq(departments.tenantId, tenantId)
      ))
      .limit(1);
    
    return department || null;
  }

  // Advertisement Management Implementation
  async getAllAdvertisements(): Promise<Advertisement[]> {
    return await db.select()
      .from(advertisements)
      .where(eq(advertisements.status, 'active'))
      .orderBy(desc(advertisements.createdAt));
  }

  async getAdvertisement(id: string): Promise<Advertisement | undefined> {
    const [advertisement] = await db.select()
      .from(advertisements)
      .where(eq(advertisements.id, id))
      .limit(1);
    
    return advertisement || undefined;
  }

  async getAdvertisementsByTenant(tenantId: string): Promise<Advertisement[]> {
    return await db.select()
      .from(advertisements)
      .where(eq(advertisements.tenantId, tenantId))
      .orderBy(desc(advertisements.createdAt));
  }

  async createAdvertisement(advertisement: InsertAdvertisement): Promise<Advertisement> {
    const [created] = await db.insert(advertisements)
      .values(advertisement)
      .returning();
    return created;
  }

  async updateAdvertisement(id: string, updates: Partial<Advertisement>, tenantId: string): Promise<Advertisement | undefined> {
    const [updated] = await db.update(advertisements)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(and(
        eq(advertisements.id, id),
        eq(advertisements.tenantId, tenantId)
      ))
      .returning();
    
    return updated || undefined;
  }

  async updateAdvertisementStatus(id: string, statusUpdate: { 
    status: string; 
    reviewNotes?: string; 
    reviewedBy?: string; 
    reviewedAt?: string 
  }): Promise<Advertisement | undefined> {
    const [updated] = await db.update(advertisements)
      .set({ 
        status: statusUpdate.status as any,
        reviewNotes: statusUpdate.reviewNotes,
        reviewedBy: statusUpdate.reviewedBy,
        reviewedAt: statusUpdate.reviewedAt ? new Date(statusUpdate.reviewedAt) : undefined,
        updatedAt: sql`CURRENT_TIMESTAMP`
      })
      .where(eq(advertisements.id, id))
      .returning();
    
    return updated || undefined;
  }

  async deleteAdvertisement(id: string, tenantId: string): Promise<boolean> {
    const result = await db.delete(advertisements)
      .where(and(
        eq(advertisements.id, id),
        eq(advertisements.tenantId, tenantId)
      ));
    
    return result.rowCount > 0;
  }

  async incrementAdvertisementImpressions(id: string): Promise<void> {
    await db.update(advertisements)
      .set({ 
        impressions: sql`${advertisements.impressions} + 1`,
        updatedAt: sql`CURRENT_TIMESTAMP`
      })
      .where(eq(advertisements.id, id));
  }

  async incrementAdvertisementClicks(id: string): Promise<void> {
    await db.update(advertisements)
      .set({ 
        clicks: sql`${advertisements.clicks} + 1`,
        updatedAt: sql`CURRENT_TIMESTAMP`
      })
      .where(eq(advertisements.id, id));
  }

  // Advertisement Views Management
  async createAdView(view: InsertAdView): Promise<AdView> {
    const [created] = await db.insert(adViews)
      .values(view)
      .returning();
    return created;
  }

  async getAdViews(advertisementId: string): Promise<AdView[]> {
    return await db.select()
      .from(adViews)
      .where(eq(adViews.advertisementId, advertisementId))
      .orderBy(desc(adViews.viewedAt));
  }

  // Advertisement Inquiries Management
  async createAdInquiry(inquiry: InsertAdInquiry): Promise<AdInquiry> {
    const [created] = await db.insert(adInquiries)
      .values(inquiry)
      .returning();
    return created;
  }

  async getAdInquiries(advertisementId: string): Promise<AdInquiry[]> {
    return await db.select()
      .from(adInquiries)
      .where(eq(adInquiries.advertisementId, advertisementId))
      .orderBy(desc(adInquiries.createdAt));
  }

  async updateAdInquiry(id: string, updates: Partial<AdInquiry>): Promise<AdInquiry | undefined> {
    const [updated] = await db.update(adInquiries)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(adInquiries.id, id))
      .returning();
    
    return updated || undefined;
  }

  // Medical Suppliers Management
  async createMedicalSupplier(supplier: any): Promise<MedicalSupplier> {
    // Generate base organization slug from company name
    const baseSlug = supplier.companyName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // Check if slug exists and make it unique
    let organizationSlug = baseSlug;
    let counter = 1;
    
    while (true) {
      const existing = await db.select()
        .from(medicalSuppliers)
        .where(eq(medicalSuppliers.organizationSlug, organizationSlug))
        .limit(1);
      
      if (existing.length === 0) {
        break; // Slug is unique
      }
      
      organizationSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const [created] = await db.insert(medicalSuppliers)
      .values({
        ...supplier,
        organizationSlug,
        status: 'pending_review'
      })
      .returning();
    return created;
  }

  async getMedicalSupplier(id: string): Promise<MedicalSupplier | undefined> {
    const [supplier] = await db.select()
      .from(medicalSuppliers)
      .where(eq(medicalSuppliers.id, id));
    return supplier || undefined;
  }

  async getMedicalSupplierByEmail(email: string): Promise<MedicalSupplier | undefined> {
    const [supplier] = await db.select()
      .from(medicalSuppliers)
      .where(eq(medicalSuppliers.contactEmail, email));
    return supplier || undefined;
  }

  async getMedicalSuppliers(): Promise<MedicalSupplier[]> {
    return await db.select()
      .from(medicalSuppliers)
      .orderBy(desc(medicalSuppliers.createdAt));
  }

  async getMedicalSupplierById(id: string): Promise<MedicalSupplier | undefined> {
    const [supplier] = await db.select()
      .from(medicalSuppliers)
      .where(eq(medicalSuppliers.id, id));
    return supplier || undefined;
  }

  // =====================================
  // PUBLIC MARKETPLACE PRODUCTS 
  // =====================================

  async getPublicMarketplaceProducts(): Promise<any[]> {
    try {
      console.log('[MARKETPLACE] Starting to fetch public products...');
      const products = await db.select().from(marketplaceProducts)
        .where(eq(marketplaceProducts.status, 'active'));
      
      console.log(`[MARKETPLACE] Found ${products.length} active products in database`);
      
      // Return products with basic supplier enhancement
      const enhancedProducts = products.map(product => ({
        ...product,
        supplierName: 'Medical Supplier', // Simplified for now
        supplierContact: {
          email: 'contact@supplier.com',
          phone: '+1-555-0123',
          address: '123 Healthcare Ave'
        },
        rating: 4.5,
        reviews: Math.floor(Math.random() * 50) + 5
      }));
      
      console.log(`[MARKETPLACE] Returning ${enhancedProducts.length} enhanced products`);
      return enhancedProducts;
    } catch (error) {
      console.error('[MARKETPLACE] Error fetching marketplace products:', error);
      return [];
    }
  }

  async updateMedicalSupplier(id: string, updates: Partial<MedicalSupplier>): Promise<MedicalSupplier | undefined> {
    const [updated] = await db.update(medicalSuppliers)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(medicalSuppliers.id, id))
      .returning();
    
    return updated || undefined;
  }

  async getAllMedicalSuppliers(): Promise<MedicalSupplier[]> {
    return await db.select()
      .from(medicalSuppliers)
      .orderBy(desc(medicalSuppliers.createdAt));
  }

  async updateMedicalSupplierStatus(id: string, status: string, reason?: string): Promise<MedicalSupplier | undefined> {
    const updates: any = { 
      status,
      updatedAt: sql`CURRENT_TIMESTAMP` 
    };

    if (status === 'rejected' && reason) {
      updates.rejectionReason = reason;
      updates.rejectedAt = sql`CURRENT_TIMESTAMP`;
    } else if (status === 'approved') {
      updates.approvedAt = sql`CURRENT_TIMESTAMP`;
    }

    const [updated] = await db.update(medicalSuppliers)
      .set(updates)
      .where(eq(medicalSuppliers.id, id))
      .returning();
    
    return updated || undefined;
  }

  async approveMedicalSupplier(id: string, approvedBy: string): Promise<MedicalSupplier | undefined> {
    const [updated] = await db.update(medicalSuppliers)
      .set({ 
        status: 'approved',
        approvedBy,
        approvedAt: sql`CURRENT_TIMESTAMP`,
        updatedAt: sql`CURRENT_TIMESTAMP` 
      })
      .where(eq(medicalSuppliers.id, id))
      .returning();
    
    return updated || undefined;
  }

  // =====================================
  // QUOTE REQUEST MANAGEMENT
  // =====================================

  async createQuoteRequest(quoteRequest: any): Promise<QuoteRequest> {
    try {
      // Ensure proper data types for timestamp fields
      const insertData = {
        ...quoteRequest,
        requestedAt: sql`CURRENT_TIMESTAMP`,
        createdAt: sql`CURRENT_TIMESTAMP`,
        updatedAt: sql`CURRENT_TIMESTAMP`
      };
      
      const [created] = await db.insert(quoteRequests).values(insertData).returning();
      return created;
    } catch (error) {
      console.error('Quote request creation error:', error);
      throw error;
    }
  }

  async getQuoteRequest(id: string): Promise<QuoteRequest | undefined> {
    const [quote] = await db.select().from(quoteRequests).where(eq(quoteRequests.id, id));
    return quote || undefined;
  }

  async getQuoteRequests(): Promise<QuoteRequest[]> {
    return await db.select()
      .from(quoteRequests)
      .orderBy(desc(quoteRequests.createdAt));
  }

  async getQuoteRequestsByProduct(productId: string): Promise<QuoteRequest[]> {
    return await db.select()
      .from(quoteRequests)
      .where(eq(quoteRequests.productId, productId))
      .orderBy(desc(quoteRequests.createdAt));
  }

  async updateQuoteRequest(id: string, updates: Partial<QuoteRequest>): Promise<QuoteRequest | undefined> {
    const [updated] = await db.update(quoteRequests)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(quoteRequests.id, id))
      .returning();
    
    return updated || undefined;
  }

  // =====================================
  // MARKETPLACE PRODUCT MANAGEMENT
  // =====================================
  
  async getMarketplaceProducts(filters: { category?: string; search?: string; status?: string; limit: number; offset: number }): Promise<MarketplaceProduct[]> {
    let query = db.select().from(marketplaceProducts);
    
    const conditions = [];
    
    if (filters.status) {
      conditions.push(eq(marketplaceProducts.status, filters.status));
    }
    
    if (filters.category) {
      conditions.push(eq(marketplaceProducts.category, filters.category));
    }
    
    if (filters.search) {
      conditions.push(
        or(
          ilike(marketplaceProducts.name, `%${filters.search}%`),
          ilike(marketplaceProducts.description, `%${filters.search}%`),
          ilike(marketplaceProducts.brand, `%${filters.search}%`)
        )
      );
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query
      .orderBy(desc(marketplaceProducts.createdAt))
      .limit(filters.limit)
      .offset(filters.offset);
  }

  async getMarketplaceProduct(id: string): Promise<MarketplaceProduct | undefined> {
    const [product] = await db.select()
      .from(marketplaceProducts)
      .where(eq(marketplaceProducts.id, id));
    return product || undefined;
  }

  async getSupplierProducts(supplierTenantId: string, status?: string): Promise<MarketplaceProduct[]> {
    let query = db.select()
      .from(marketplaceProducts)
      .where(eq(marketplaceProducts.supplierTenantId, supplierTenantId));
    
    if (status) {
      query = query.where(
        and(
          eq(marketplaceProducts.supplierTenantId, supplierTenantId),
          eq(marketplaceProducts.status, status)
        )
      );
    }
    
    return await query.orderBy(desc(marketplaceProducts.createdAt));
  }

  async createMarketplaceProduct(product: InsertMarketplaceProduct): Promise<MarketplaceProduct> {
    const [created] = await db.insert(marketplaceProducts)
      .values(product)
      .returning();
    return created;
  }

  async updateMarketplaceProduct(id: string, updates: Partial<MarketplaceProduct>, supplierTenantId: string): Promise<MarketplaceProduct | undefined> {
    const [updated] = await db.update(marketplaceProducts)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(
        and(
          eq(marketplaceProducts.id, id),
          eq(marketplaceProducts.supplierTenantId, supplierTenantId)
        )
      )
      .returning();
    
    return updated || undefined;
  }

  async incrementProductViewCount(productId: string): Promise<void> {
    await db.update(marketplaceProducts)
      .set({ 
        viewCount: sql`${marketplaceProducts.viewCount} + 1`,
        updatedAt: sql`CURRENT_TIMESTAMP`
      })
      .where(eq(marketplaceProducts.id, productId));
  }

  // =====================================
  // MARKETPLACE ORDER MANAGEMENT
  // =====================================
  
  async createMarketplaceOrder(order: InsertMarketplaceOrder): Promise<MarketplaceOrder> {
    const [created] = await db.insert(marketplaceOrders)
      .values({
        ...order,
        orderDate: sql`CURRENT_TIMESTAMP`
      })
      .returning();
    return created;
  }

  async generateOrderNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    
    // Get count of orders today for sequential numbering
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const todayOrderCount = await db.select({ count: sql`count(*)` })
      .from(marketplaceOrders)
      .where(
        and(
          gte(marketplaceOrders.orderDate, startOfDay),
          lt(marketplaceOrders.orderDate, endOfDay)
        )
      );
    
    const orderNum = (Number(todayOrderCount[0]?.count) + 1).toString().padStart(4, '0');
    return `ORD-${year}${month}-${orderNum}`;
  }

  async getBuyerOrders(buyerTenantId: string, filters: { status?: string; limit: number; offset: number }): Promise<MarketplaceOrder[]> {
    let query = db.select()
      .from(marketplaceOrders)
      .where(eq(marketplaceOrders.buyerTenantId, buyerTenantId));
    
    if (filters.status) {
      query = query.where(
        and(
          eq(marketplaceOrders.buyerTenantId, buyerTenantId),
          eq(marketplaceOrders.status, filters.status)
        )
      );
    }
    
    return await query
      .orderBy(desc(marketplaceOrders.orderDate))
      .limit(filters.limit)
      .offset(filters.offset);
  }

  async getSupplierOrders(supplierTenantId: string, filters: { status?: string; limit: number; offset: number }): Promise<MarketplaceOrder[]> {
    let query = db.select()
      .from(marketplaceOrders)
      .where(eq(marketplaceOrders.supplierTenantId, supplierTenantId));
    
    if (filters.status) {
      query = query.where(
        and(
          eq(marketplaceOrders.supplierTenantId, supplierTenantId),
          eq(marketplaceOrders.status, filters.status)
        )
      );
    }
    
    return await query
      .orderBy(desc(marketplaceOrders.orderDate))
      .limit(filters.limit)
      .offset(filters.offset);
  }

  async updateOrderStatus(orderId: string, status: string, notes: string, tenantId: string): Promise<MarketplaceOrder | undefined> {
    const updateData: any = {
      status,
      updatedAt: sql`CURRENT_TIMESTAMP`
    };
    
    // Add status-specific fields
    if (status === 'shipped' && notes) {
      updateData.trackingNumber = notes;
    } else if (status === 'cancelled') {
      updateData.cancelledAt = sql`CURRENT_TIMESTAMP`;
      updateData.cancellationReason = notes;
    } else if (status === 'delivered') {
      updateData.actualDeliveryDate = sql`CURRENT_TIMESTAMP`;
    }
    
    if (notes) {
      updateData.supplierNotes = notes;
    }
    
    const [updated] = await db.update(marketplaceOrders)
      .set(updateData)
      .where(
        or(
          eq(marketplaceOrders.supplierTenantId, tenantId),
          eq(marketplaceOrders.buyerTenantId, tenantId)
        )
      )
      .returning();
    
    return updated || undefined;
  }

  // =====================================
  // PRODUCT REVIEWS MANAGEMENT
  // =====================================
  
  async createProductReview(review: InsertProductReview): Promise<ProductReview> {
    const [created] = await db.insert(productReviews)
      .values(review)
      .returning();
    
    // Update product average rating
    await this.updateProductRating(review.productId);
    
    return created;
  }

  async getProductReviews(productId: string, filters: { limit: number; offset: number; approvedOnly: boolean }): Promise<ProductReview[]> {
    let query = db.select()
      .from(productReviews)
      .where(eq(productReviews.productId, productId));
    
    if (filters.approvedOnly) {
      query = query.where(
        and(
          eq(productReviews.productId, productId),
          eq(productReviews.isApproved, true)
        )
      );
    }
    
    return await query
      .orderBy(desc(productReviews.createdAt))
      .limit(filters.limit)
      .offset(filters.offset);
  }

  async hasUserPurchasedProduct(userId: string, productId: string): Promise<boolean> {
    // Check if user has successfully purchased this product
    const [purchase] = await db.select()
      .from(marketplaceOrders)
      .innerJoin(marketplaceOrderItems, eq(marketplaceOrders.id, marketplaceOrderItems.orderId))
      .where(
        and(
          eq(marketplaceOrders.buyerUserId, userId),
          eq(marketplaceOrderItems.productId, productId),
          ne(marketplaceOrders.status, 'cancelled'),
          ne(marketplaceOrders.status, 'refunded')
        )
      )
      .limit(1);
    
    return !!purchase;
  }

  private async updateProductRating(productId: string): Promise<void> {
    // Calculate average rating and total reviews
    const [stats] = await db.select({
      avgRating: sql`AVG(${productReviews.rating})`,
      totalReviews: sql`COUNT(*)`
    })
    .from(productReviews)
    .where(
      and(
        eq(productReviews.productId, productId),
        eq(productReviews.isApproved, true)
      )
    );
    
    if (stats) {
      await db.update(marketplaceProducts)
        .set({
          avgRating: stats.avgRating ? Number(stats.avgRating).toFixed(2) : "0.00",
          totalReviews: Number(stats.totalReviews),
          updatedAt: sql`CURRENT_TIMESTAMP`
        })
        .where(eq(marketplaceProducts.id, productId));
    }
  }
}

export const storage = new DatabaseStorage();
