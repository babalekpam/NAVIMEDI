import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, uuid, timestamp, boolean, integer, decimal, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const roleEnum = pgEnum("role", [
  "super_admin",
  "tenant_admin", 
  "director",
  "physician",
  "nurse",
  "pharmacist",
  "lab_technician",
  "receptionist",
  "billing_staff",
  "insurance_manager",
  "patient"
]);

export const tenantTypeEnum = pgEnum("tenant_type", [
  "platform",
  "hospital",
  "clinic", 
  "pharmacy",
  "laboratory",
  "insurance_provider"
]);

export const appointmentStatusEnum = pgEnum("appointment_status", [
  "scheduled",
  "confirmed", 
  "checked_in",
  "in_progress",
  "completed",
  "cancelled",
  "no_show"
]);

export const prescriptionStatusEnum = pgEnum("prescription_status", [
  "prescribed",
  "sent_to_pharmacy",
  "filled",
  "picked_up",
  "cancelled"
]);

export const labOrderStatusEnum = pgEnum("lab_order_status", [
  "ordered",
  "collected",
  "processing", 
  "completed",
  "cancelled"
]);

export const claimStatusEnum = pgEnum("claim_status", [
  "draft",
  "submitted",
  "processing",
  "approved", 
  "denied",
  "paid"
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "suspended",
  "cancelled",
  "expired"
]);

export const reportTypeEnum = pgEnum("report_type", [
  "financial",
  "operational",
  "clinical",
  "compliance",
  "custom"
]);

export const reportStatusEnum = pgEnum("report_status", [
  "pending",
  "generating",
  "completed",
  "failed"
]);

// Core Tables
export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: tenantTypeEnum("type").notNull(),
  subdomain: text("subdomain").unique().notNull(),
  settings: jsonb("settings").default('{}'),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  username: text("username").notNull(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: roleEnum("role").notNull(),
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

export const patients = pgTable("patients", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  mrn: text("mrn").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: timestamp("date_of_birth").notNull(),
  gender: text("gender"),
  phone: text("phone"),
  email: text("email"),
  address: jsonb("address"),
  emergencyContact: jsonb("emergency_contact"),
  insuranceInfo: jsonb("insurance_info"),
  medicalHistory: jsonb("medical_history").default('[]'),
  allergies: jsonb("allergies").default('[]'),
  medications: jsonb("medications").default('[]'),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

export const appointments = pgTable("appointments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  providerId: uuid("provider_id").references(() => users.id).notNull(),
  appointmentDate: timestamp("appointment_date").notNull(),
  duration: integer("duration").default(30),
  type: text("type").notNull(),
  status: appointmentStatusEnum("status").default('scheduled'),
  notes: text("notes"),
  chiefComplaint: text("chief_complaint"),
  vitals: jsonb("vitals"),
  diagnosis: jsonb("diagnosis").default('[]'),
  treatmentPlan: text("treatment_plan"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

export const prescriptions = pgTable("prescriptions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  providerId: uuid("provider_id").references(() => users.id).notNull(),
  appointmentId: uuid("appointment_id").references(() => appointments.id),
  pharmacyTenantId: uuid("pharmacy_tenant_id").references(() => tenants.id),
  medicationName: text("medication_name").notNull(),
  dosage: text("dosage").notNull(),
  frequency: text("frequency").notNull(),
  quantity: integer("quantity").notNull(),
  refills: integer("refills").default(0),
  instructions: text("instructions"),
  status: prescriptionStatusEnum("status").default('prescribed'),
  prescribedDate: timestamp("prescribed_date").default(sql`CURRENT_TIMESTAMP`),
  expiryDate: timestamp("expiry_date"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Insurance Providers
export const insuranceProviders = pgTable("insurance_providers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  type: text("type").notNull(), // HMO, PPO, Medicare, Medicaid, etc.
  contactInfo: jsonb("contact_info"),
  claimsAddress: text("claims_address"),
  electronicSubmission: boolean("electronic_submission").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Patient Insurance Coverage
export const patientInsurance = pgTable("patient_insurance", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  insuranceProviderId: uuid("insurance_provider_id").references(() => insuranceProviders.id).notNull(),
  policyNumber: text("policy_number").notNull(),
  groupNumber: text("group_number"),
  subscriberName: text("subscriber_name"),
  subscriberRelationship: text("subscriber_relationship"), // self, spouse, child, other
  effectiveDate: timestamp("effective_date").notNull(),
  expirationDate: timestamp("expiration_date"),
  copayAmount: decimal("copay_amount", { precision: 10, scale: 2 }),
  deductibleAmount: decimal("deductible_amount", { precision: 10, scale: 2 }),
  isPrimary: boolean("is_primary").default(true),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

export const labOrders = pgTable("lab_orders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  providerId: uuid("provider_id").references(() => users.id).notNull(),
  appointmentId: uuid("appointment_id").references(() => appointments.id),
  labTenantId: uuid("lab_tenant_id").references(() => tenants.id),
  testName: text("test_name").notNull(),
  testCode: text("test_code"),
  instructions: text("instructions"),
  priority: text("priority").default('routine'),
  status: labOrderStatusEnum("status").default('ordered'),
  results: jsonb("results"),
  resultDate: timestamp("result_date"),
  orderedDate: timestamp("ordered_date").default(sql`CURRENT_TIMESTAMP`),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

export const insuranceClaims = pgTable("insurance_claims", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  appointmentId: uuid("appointment_id").references(() => appointments.id),
  patientInsuranceId: uuid("patient_insurance_id").references(() => patientInsurance.id).notNull(),
  claimNumber: text("claim_number").unique().notNull(),
  procedureCodes: jsonb("procedure_codes").default('[]'),
  diagnosisCodes: jsonb("diagnosis_codes").default('[]'),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  approvedAmount: decimal("approved_amount", { precision: 10, scale: 2 }),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }),
  status: claimStatusEnum("status").default('draft'),
  submittedDate: timestamp("submitted_date"),
  processedDate: timestamp("processed_date"),
  paidDate: timestamp("paid_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  userId: uuid("user_id").references(() => users.id),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id").notNull(),
  action: text("action").notNull(),
  previousData: jsonb("previous_data"),
  newData: jsonb("new_data"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").default(sql`CURRENT_TIMESTAMP`)
});

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  planName: text("plan_name").notNull(),
  monthlyPrice: decimal("monthly_price", { precision: 10, scale: 2 }).notNull(),
  maxUsers: integer("max_users").notNull(),
  maxPatients: integer("max_patients"),
  features: jsonb("features").default('[]'),
  status: subscriptionStatusEnum("status").default('active'),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  lastPaymentDate: timestamp("last_payment_date"),
  nextPaymentDate: timestamp("next_payment_date"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  generatedBy: uuid("generated_by").references(() => users.id).notNull(),
  title: text("title").notNull(),
  type: reportTypeEnum("type").notNull(),
  format: text("format").default('pdf'),
  parameters: jsonb("parameters").default('{}'),
  data: jsonb("data"),
  status: reportStatusEnum("status").default('pending'),
  fileUrl: text("file_url"),
  dateFrom: timestamp("date_from"),
  dateTo: timestamp("date_to"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  completedAt: timestamp("completed_at")
});

// Relations
export const tenantsRelations = relations(tenants, ({ one, many }) => ({
  users: many(users),
  patients: many(patients),
  appointments: many(appointments),
  prescriptions: many(prescriptions),
  labOrders: many(labOrders),
  insuranceClaims: many(insuranceClaims),
  insuranceProviders: many(insuranceProviders),
  patientInsurance: many(patientInsurance),
  auditLogs: many(auditLogs),
  subscription: one(subscriptions),
  reports: many(reports)
}));

export const insuranceProvidersRelations = relations(insuranceProviders, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [insuranceProviders.tenantId],
    references: [tenants.id]
  }),
  patientInsurance: many(patientInsurance)
}));

export const patientInsuranceRelations = relations(patientInsurance, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [patientInsurance.tenantId],
    references: [tenants.id]
  }),
  patient: one(patients, {
    fields: [patientInsurance.patientId],
    references: [patients.id]
  }),
  insuranceProvider: one(insuranceProviders, {
    fields: [patientInsurance.insuranceProviderId],
    references: [insuranceProviders.id]
  }),
  claims: many(insuranceClaims)
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  tenant: one(tenants, {
    fields: [subscriptions.tenantId],
    references: [tenants.id]
  })
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  tenant: one(tenants, {
    fields: [reports.tenantId],
    references: [tenants.id]
  }),
  generatedByUser: one(users, {
    fields: [reports.generatedBy],
    references: [users.id]
  })
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id]
  }),
  appointmentsAsProvider: many(appointments, { relationName: "providerAppointments" }),
  prescriptions: many(prescriptions),
  labOrders: many(labOrders),
  auditLogs: many(auditLogs)
}));

export const patientsRelations = relations(patients, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [patients.tenantId],
    references: [tenants.id]
  }),
  appointments: many(appointments),
  prescriptions: many(prescriptions),
  labOrders: many(labOrders),
  insuranceClaims: many(insuranceClaims)
}));

export const appointmentsRelations = relations(appointments, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [appointments.tenantId],
    references: [tenants.id]
  }),
  patient: one(patients, {
    fields: [appointments.patientId],
    references: [patients.id]
  }),
  provider: one(users, {
    fields: [appointments.providerId],
    references: [users.id],
    relationName: "providerAppointments"
  }),
  prescriptions: many(prescriptions),
  labOrders: many(labOrders),
  insuranceClaims: many(insuranceClaims)
}));

// Insert Schemas
export const insertTenantSchema = createInsertSchema(tenants).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLogin: true
});

export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertPrescriptionSchema = createInsertSchema(prescriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertLabOrderSchema = createInsertSchema(labOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Insurance Provider and Patient Insurance schemas
export const insertInsuranceProviderSchema = createInsertSchema(insuranceProviders).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertPatientInsuranceSchema = createInsertSchema(patientInsurance).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertInsuranceClaimSchema = createInsertSchema(insuranceClaims).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
  completedAt: true
});

// Types
export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = z.infer<typeof insertTenantSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export type Prescription = typeof prescriptions.$inferSelect;
export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;

export type LabOrder = typeof labOrders.$inferSelect;
export type InsertLabOrder = z.infer<typeof insertLabOrderSchema>;

export type InsuranceProvider = typeof insuranceProviders.$inferSelect;
export type InsertInsuranceProvider = z.infer<typeof insertInsuranceProviderSchema>;

export type PatientInsurance = typeof patientInsurance.$inferSelect;
export type InsertPatientInsurance = z.infer<typeof insertPatientInsuranceSchema>;

export type InsuranceClaim = typeof insuranceClaims.$inferSelect;
export type InsertInsuranceClaim = z.infer<typeof insertInsuranceClaimSchema>;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

export type AuditLog = typeof auditLogs.$inferSelect;
