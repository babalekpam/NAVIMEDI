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

export const communicationTypeEnum = pgEnum("communication_type", [
  "medical_instruction",
  "prescription_note",
  "discharge_summary",
  "appointment_reminder",
  "lab_result",
  "general_message",
  "emergency_alert"
]);

export const translationStatusEnum = pgEnum("translation_status", [
  "pending",
  "translating",
  "completed",
  "failed",
  "manual_review"
]);

export const priorityLevelEnum = pgEnum("priority_level", [
  "low",
  "normal", 
  "high",
  "urgent",
  "emergency"
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

// Multilingual Communication Tables
export const medicalCommunications = pgTable("medical_communications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  senderId: uuid("sender_id").references(() => users.id).notNull(),
  recipientId: uuid("recipient_id").references(() => users.id),
  type: communicationTypeEnum("type").notNull(),
  priority: priorityLevelEnum("priority").default('normal'),
  originalLanguage: text("original_language").notNull().default('en'),
  targetLanguages: jsonb("target_languages").default('["en"]'),
  originalContent: jsonb("original_content").notNull(),
  metadata: jsonb("metadata").default('{}'),
  appointmentId: uuid("appointment_id").references(() => appointments.id),
  prescriptionId: uuid("prescription_id").references(() => prescriptions.id),
  labOrderId: uuid("lab_order_id").references(() => labOrders.id),
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

export const communicationTranslations = pgTable("communication_translations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  communicationId: uuid("communication_id").references(() => medicalCommunications.id).notNull(),
  languageCode: text("language_code").notNull(),
  translatedContent: jsonb("translated_content").notNull(),
  status: translationStatusEnum("status").default('pending'),
  translationEngine: text("translation_engine"),
  confidence: decimal("confidence", { precision: 3, scale: 2 }),
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

export const supportedLanguages = pgTable("supported_languages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  languageCode: text("language_code").notNull(),
  languageName: text("language_name").notNull(),
  nativeName: text("native_name").notNull(),
  isActive: boolean("is_active").default(true),
  isPrimary: boolean("is_primary").default(false),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

export const medicalPhrases = pgTable("medical_phrases", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  category: text("category").notNull(),
  phraseKey: text("phrase_key").notNull(),
  originalLanguage: text("original_language").notNull().default('en'),
  originalText: text("original_text").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

export const phraseTranslations = pgTable("phrase_translations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  phraseId: uuid("phrase_id").references(() => medicalPhrases.id).notNull(),
  languageCode: text("language_code").notNull(),
  translatedText: text("translated_text").notNull(),
  translatedBy: uuid("translated_by").references(() => users.id),
  verifiedBy: uuid("verified_by").references(() => users.id),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Laboratory Management Tables
export const laboratories = pgTable("laboratories", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  name: text("name").notNull(),
  licenseNumber: text("license_number"),
  contactPerson: text("contact_person"),
  phone: text("phone"),
  email: text("email"),
  address: jsonb("address").$type<{
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }>(),
  specializations: text("specializations").array(),
  isActive: boolean("is_active").default(true),
  apiEndpoint: text("api_endpoint"), // For external lab integration
  apiKey: text("api_key"), // Encrypted API key for lab integration
  averageTurnaroundTime: integer("average_turnaround_time"), // Hours
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

export const labResults = pgTable("lab_results", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  labOrderId: uuid("lab_order_id").references(() => labOrders.id).notNull(),
  laboratoryId: uuid("laboratory_id").references(() => laboratories.id).notNull(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  testName: text("test_name").notNull(),
  result: text("result"),
  normalRange: text("normal_range"),
  unit: text("unit"),
  status: text("status").notNull().default('pending'), // pending, in_progress, completed, cancelled
  abnormalFlag: text("abnormal_flag"), // normal, high, low, critical
  notes: text("notes"),
  performedBy: text("performed_by"), // Lab technician name
  reviewedBy: uuid("reviewed_by").references(() => users.id), // Doctor who reviewed
  completedAt: timestamp("completed_at"),
  reportedAt: timestamp("reported_at"),
  externalLabId: text("external_lab_id"), // ID from external lab system
  rawData: jsonb("raw_data"), // Raw data from lab system
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

export const labOrderAssignments = pgTable("lab_order_assignments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  labOrderId: uuid("lab_order_id").references(() => labOrders.id).notNull(),
  laboratoryId: uuid("laboratory_id").references(() => laboratories.id).notNull(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  assignedBy: uuid("assigned_by").references(() => users.id).notNull(),
  status: text("status").notNull().default('assigned'), // assigned, sent, received, processing, completed
  sentAt: timestamp("sent_at"),
  estimatedCompletionTime: timestamp("estimated_completion_time"),
  actualCompletionTime: timestamp("actual_completion_time"),
  trackingNumber: text("tracking_number"), // For tracking samples
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
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
  reports: many(reports),
  laboratories: many(laboratories),
  labResults: many(labResults),
  labOrderAssignments: many(labOrderAssignments)
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

// Multilingual Communication Relations
export const medicalCommunicationsRelations = relations(medicalCommunications, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [medicalCommunications.tenantId],
    references: [tenants.id]
  }),
  patient: one(patients, {
    fields: [medicalCommunications.patientId],
    references: [patients.id]
  }),
  sender: one(users, {
    fields: [medicalCommunications.senderId],
    references: [users.id],
    relationName: "senderCommunications"
  }),
  recipient: one(users, {
    fields: [medicalCommunications.recipientId],
    references: [users.id],
    relationName: "recipientCommunications"
  }),
  appointment: one(appointments, {
    fields: [medicalCommunications.appointmentId],
    references: [appointments.id]
  }),
  prescription: one(prescriptions, {
    fields: [medicalCommunications.prescriptionId],
    references: [prescriptions.id]
  }),
  labOrder: one(labOrders, {
    fields: [medicalCommunications.labOrderId],
    references: [labOrders.id]
  }),
  translations: many(communicationTranslations)
}));

export const communicationTranslationsRelations = relations(communicationTranslations, ({ one }) => ({
  communication: one(medicalCommunications, {
    fields: [communicationTranslations.communicationId],
    references: [medicalCommunications.id]
  }),
  reviewedByUser: one(users, {
    fields: [communicationTranslations.reviewedBy],
    references: [users.id]
  })
}));

export const supportedLanguagesRelations = relations(supportedLanguages, ({ one }) => ({
  tenant: one(tenants, {
    fields: [supportedLanguages.tenantId],
    references: [tenants.id]
  })
}));

export const medicalPhrasesRelations = relations(medicalPhrases, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [medicalPhrases.tenantId],
    references: [tenants.id]
  }),
  translations: many(phraseTranslations)
}));

export const phraseTranslationsRelations = relations(phraseTranslations, ({ one }) => ({
  phrase: one(medicalPhrases, {
    fields: [phraseTranslations.phraseId],
    references: [medicalPhrases.id]
  }),
  translatedByUser: one(users, {
    fields: [phraseTranslations.translatedBy],
    references: [users.id],
    relationName: "translatedPhrases"
  }),
  verifiedByUser: one(users, {
    fields: [phraseTranslations.verifiedBy],
    references: [users.id],
    relationName: "verifiedPhrases"
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
  auditLogs: many(auditLogs),
  labResults: many(labResults),
  labOrderAssignments: many(labOrderAssignments)
}));

export const patientsRelations = relations(patients, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [patients.tenantId],
    references: [tenants.id]
  }),
  appointments: many(appointments),
  prescriptions: many(prescriptions),
  labOrders: many(labOrders),
  insuranceClaims: many(insuranceClaims),
  labResults: many(labResults)
}));

// Laboratory Relations
export const laboratoriesRelations = relations(laboratories, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [laboratories.tenantId],
    references: [tenants.id]
  }),
  labResults: many(labResults),
  labOrderAssignments: many(labOrderAssignments)
}));

export const labResultsRelations = relations(labResults, ({ one }) => ({
  tenant: one(tenants, {
    fields: [labResults.tenantId],
    references: [tenants.id]
  }),
  patient: one(patients, {
    fields: [labResults.patientId],
    references: [patients.id]
  }),
  labOrder: one(labOrders, {
    fields: [labResults.labOrderId],
    references: [labOrders.id]
  }),
  laboratory: one(laboratories, {
    fields: [labResults.laboratoryId],
    references: [laboratories.id]
  }),
  reviewedByUser: one(users, {
    fields: [labResults.reviewedBy],
    references: [users.id]
  })
}));

export const labOrderAssignmentsRelations = relations(labOrderAssignments, ({ one }) => ({
  tenant: one(tenants, {
    fields: [labOrderAssignments.tenantId],
    references: [tenants.id]
  }),
  labOrder: one(labOrders, {
    fields: [labOrderAssignments.labOrderId],
    references: [labOrders.id]
  }),
  laboratory: one(laboratories, {
    fields: [labOrderAssignments.laboratoryId],
    references: [laboratories.id]
  }),
  assignedByUser: one(users, {
    fields: [labOrderAssignments.assignedBy],
    references: [users.id]
  })
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

// Multilingual Communication Insert Schemas
export const insertMedicalCommunicationSchema = createInsertSchema(medicalCommunications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  readAt: true
});

export const insertCommunicationTranslationSchema = createInsertSchema(communicationTranslations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  reviewedAt: true
});

export const insertSupportedLanguageSchema = createInsertSchema(supportedLanguages).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertMedicalPhraseSchema = createInsertSchema(medicalPhrases).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertPhraseTranslationSchema = createInsertSchema(phraseTranslations).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Laboratory Insert Schemas
export const insertLaboratorySchema = createInsertSchema(laboratories).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertLabResultSchema = createInsertSchema(labResults).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertLabOrderAssignmentSchema = createInsertSchema(labOrderAssignments).omit({
  id: true,
  createdAt: true,
  updatedAt: true
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

// Multilingual Communication Types
export type MedicalCommunication = typeof medicalCommunications.$inferSelect;
export type InsertMedicalCommunication = z.infer<typeof insertMedicalCommunicationSchema>;

export type CommunicationTranslation = typeof communicationTranslations.$inferSelect;
export type InsertCommunicationTranslation = z.infer<typeof insertCommunicationTranslationSchema>;

export type SupportedLanguage = typeof supportedLanguages.$inferSelect;
export type InsertSupportedLanguage = z.infer<typeof insertSupportedLanguageSchema>;

export type MedicalPhrase = typeof medicalPhrases.$inferSelect;
export type InsertMedicalPhrase = z.infer<typeof insertMedicalPhraseSchema>;

export type PhraseTranslation = typeof phraseTranslations.$inferSelect;
export type InsertPhraseTranslation = z.infer<typeof insertPhraseTranslationSchema>;

// Laboratory Types
export type Laboratory = typeof laboratories.$inferSelect;
export type InsertLaboratory = z.infer<typeof insertLaboratorySchema>;

export type LabResult = typeof labResults.$inferSelect;
export type InsertLabResult = z.infer<typeof insertLabResultSchema>;

export type LabOrderAssignment = typeof labOrderAssignments.$inferSelect;
export type InsertLabOrderAssignment = z.infer<typeof insertLabOrderAssignmentSchema>;
