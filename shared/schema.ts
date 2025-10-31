import { sql, relations, type InferSelectModel, type InferInsertModel } from "drizzle-orm";
import { pgTable, text, varchar, uuid, timestamp, boolean, integer, decimal, jsonb, pgEnum, index, unique, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { nanoid } from "nanoid";

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
  "insurance_provider",
  "medical_supplier"
]);

export const supplierStatusEnum = pgEnum("supplier_status", [
  "pending_review",
  "approved", 
  "active",
  "suspended",
  "rejected"
]);

export const quoteRequestStatusEnum = pgEnum("quote_request_status", [
  "pending",
  "quoted",
  "accepted",
  "rejected",
  "expired"
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
  "prescribed", // Prescribed by doctor
  "sent_to_pharmacy", // Sent to pharmacy
  "received", // Received by pharmacy - new workflow starts
  "insurance_verified", // Insurance coverage verified and copay calculated
  "processing", // Being processed by pharmacy
  "ready", // Ready for pickup
  "dispensed", // Dispensed to patient
  "filled", // Legacy status - same as dispensed
  "picked_up", // Picked up by patient
  "cancelled" // Cancelled
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
  "trial",
  "active",
  "suspended",
  "cancelled",
  "expired"
]);

export const subscriptionPlanEnum = pgEnum("subscription_plan", [
  "starter",
  "professional", 
  "enterprise",
  "white_label",
  "custom"
]);

export const billingIntervalEnum = pgEnum("billing_interval", [
  "monthly",
  "quarterly",
  "yearly"
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

export const shiftStatusEnum = pgEnum("shift_status", [
  "active",
  "completed",
  "cancelled"
]);

export const verificationStatusEnum = pgEnum("verification_status", [
  "pending",
  "verified",
  "expired",
  "denied"
]);



export const currencyEnum = pgEnum("currency", [
  // Major International Currencies
  "USD", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD", "CNY",
  // African Currencies
  "DZD", "AOA", "XOF", "BWP", "BIF", "XAF", "CVE", "KMF", "CDF",
  "DJF", "EGP", "ERN", "SZL", "ETB", "GMD", "GHS", "GNF", "KES",
  "LSL", "LRD", "LYD", "MGA", "MWK", "MRU", "MUR", "MAD", "MZN",
  "NAD", "NGN", "RWF", "STN", "SCR", "SLE", "SOS", "ZAR", "SSP",
  "SDG", "TZS", "TND", "UGX", "ZMW", "ZWL"
]);

export const priorityLevelEnum = pgEnum("priority_level", [
  "low",
  "normal", 
  "high",
  "urgent",
  "emergency"
]);

// Achievement System Enums
export const achievementTypeEnum = pgEnum("achievement_type", [
  "productivity", // Speed and volume achievements
  "quality", // Accuracy and quality achievements  
  "milestone", // Major milestones and targets
  "consistency", // Streaks and regular performance
  "teamwork", // Collaboration achievements
  "efficiency" // Time and resource optimization
]);

export const achievementDifficultyEnum = pgEnum("achievement_difficulty", [
  "bronze",
  "silver", 
  "gold",
  "platinum",
  "legendary"
]);

export const badgeStatusEnum = pgEnum("badge_status", [
  "locked",
  "unlocked",
  "earned"
]);

export const billStatusEnum = pgEnum("bill_status", [
  "pending",
  "overdue",
  "paid",
  "partial_payment",
  "cancelled",
  "refunded"
]);

// Patient Access Request Status for Multi-Doctor Separation
export const accessRequestStatusEnum = pgEnum("access_request_status", [
  "pending",
  "approved", 
  "rejected",
  "expired"
]);

// Pharmacy workflow stages
export const workflowStageEnum = pgEnum("workflow_stage", [
  "queue", // Waiting in queue
  "verification", // Insurance verification
  "processing", // Being processed
  "ready", // Ready for pickup
  "completed" // Dispensed/completed
]);

export const serviceTypeEnum = pgEnum("service_type", [
  "procedure",
  "consultation", 
  "diagnostic",
  "treatment",
  "laboratory",
  "imaging",
  "therapy",
  "medication",
  "emergency"
]);

export const medicalSpecialtyEnum = pgEnum("medical_specialty", [
  "family_medicine",
  "internal_medicine",
  "pediatrics",
  "cardiology",
  "dermatology",
  "neurology",
  "orthopedics",
  "gynecology",
  "psychiatry",
  "oncology",
  "emergency_medicine",
  "anesthesiology",
  "radiology",
  "pathology",
  "surgery",
  "ophthalmology",
  "ent",
  "urology",
  "endocrinology",
  "gastroenterology"
]);

// Advertisement System Enums
export const adCategoryEnum = pgEnum("ad_category", [
  "medical_devices",
  "diagnostic_equipment",
  "surgical_instruments",
  "laboratory_equipment",
  "pharmacy_supplies",
  "software_solutions",
  "consulting_services",
  "training_programs",
  "maintenance_services",
  "insurance_services",
  "facility_management",
  "telemedicine_solutions"
]);

export const adStatusEnum = pgEnum("ad_status", [
  "draft",
  "pending_review",
  "approved",
  "active",
  "paused",
  "expired",
  "rejected",
  "suspended"
]);

export const adPriorityEnum = pgEnum("ad_priority", [
  "standard",
  "featured",
  "premium",
  "sponsored"
]);

export const productStatusEnum = pgEnum("product_status", [
  "draft",
  "active",
  "inactive",
  "discontinued",
  "out_of_stock"
]);

export const orderStatusEnum = pgEnum("marketplace_order_status", [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded"
]);

export const orderItemStatusEnum = pgEnum("order_item_status", [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned"
]);

export const adBillingTypeEnum = pgEnum("ad_billing_type", [
  "monthly",
  "per_click",
  "per_impression",
  "fixed_duration"
]);

// Document Management System Enums
export const documentTypeEnum = pgEnum("document_type", [
  "medical_record",
  "consent_form",
  "prescription",
  "lab_report",
  "insurance",
  "other"
]);

export const signatureStatusEnum = pgEnum("signature_status", [
  "pending",
  "signed",
  "declined",
  "expired"
]);

export const annotationTypeEnum = pgEnum("annotation_type", [
  "highlight",
  "note",
  "draw",
  "stamp"
]);

export const documentStatusEnum = pgEnum("document_status", [
  "draft",
  "final",
  "archived"
]);

// Clinical Decision Support System Enums
export const severityLevelEnum = pgEnum("severity_level", [
  "critical",
  "major",
  "moderate",
  "minor"
]);

export const allergyTypeEnum = pgEnum("allergy_type", [
  "drug",
  "food",
  "environmental"
]);

export const allergySeverityEnum = pgEnum("allergy_severity", [
  "life_threatening",
  "severe",
  "moderate",
  "mild"
]);

export const alertTypeEnum = pgEnum("alert_type", [
  "drug_interaction",
  "allergy",
  "dosage",
  "duplicate_therapy",
  "contraindication"
]);

export const interactionTypeEnum = pgEnum("interaction_type", [
  "drug_drug",
  "drug_food",
  "drug_condition"
]);

export const patientConditionEnum = pgEnum("patient_condition", [
  "renal",
  "hepatic",
  "pediatric",
  "geriatric",
  "pregnancy",
  "other"
]);

// Inventory Management Enums
export const inventoryBatchStatusEnum = pgEnum("inventory_batch_status", [
  "active",
  "expired",
  "recalled"
]);

export const inventoryAuditStatusEnum = pgEnum("inventory_audit_status", [
  "pending",
  "completed",
  "discrepancy"
]);

export const inventoryAlertTypeEnum = pgEnum("inventory_alert_type", [
  "low_stock",
  "expiring_soon",
  "expired",
  "recall"
]);

// Staff Scheduling and Time Tracking Enums
export const shiftTypeEnum = pgEnum("shift_type", [
  "morning",
  "afternoon",
  "evening",
  "night",
  "on_call"
]);

export const staffShiftStatusEnum = pgEnum("staff_shift_status", [
  "scheduled",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
  "no_show"
]);

export const timeLogStatusEnum = pgEnum("time_log_status", [
  "clocked_in",
  "clocked_out",
  "approved",
  "disputed"
]);

export const leaveTypeEnum = pgEnum("leave_type", [
  "vacation",
  "sick",
  "personal",
  "bereavement",
  "maternity",
  "paternity"
]);

export const leaveStatusEnum = pgEnum("leave_status", [
  "pending",
  "approved",
  "denied"
]);

// Integration Framework Enums (Phase 7-11)
export const integrationTypeEnum = pgEnum("integration_type", [
  "insurance",
  "eprescribing",
  "ehr",
  "iot",
  "quality"
]);

export const eligibilityStatusEnum = pgEnum("eligibility_status", [
  "active",
  "inactive",
  "pending"
]);

export const ePrescriptionStatusEnum = pgEnum("eprescription_status", [
  "pending",
  "sent",
  "accepted",
  "rejected",
  "error"
]);

export const ePrescriptionTransactionTypeEnum = pgEnum("eprescription_transaction_type", [
  "new_rx",
  "refill",
  "cancel",
  "change"
]);

export const hl7DirectionEnum = pgEnum("hl7_direction", [
  "inbound",
  "outbound"
]);

export const hl7MessageTypeEnum = pgEnum("hl7_message_type", [
  "ADT",
  "ORM",
  "ORU",
  "DFT"
]);

export const deviceTypeEnum = pgEnum("device_type", [
  "blood_pressure",
  "glucose",
  "heart_rate",
  "pulse_ox",
  "weight",
  "temperature"
]);

export const qualityMetricTypeEnum = pgEnum("quality_metric_type", [
  "HEDIS",
  "MIPS",
  "CMS"
]);

// Patient Engagement System Enums (Phase 12)
export const educationCategoryEnum = pgEnum("education_category", [
  "medication",
  "condition",
  "procedure",
  "wellness",
  "nutrition",
  "exercise"
]);

export const difficultyLevelEnum = pgEnum("difficulty_level", [
  "beginner",
  "intermediate",
  "advanced"
]);

export const reminderTypeEnum = pgEnum("reminder_type", [
  "medication",
  "appointment",
  "lab",
  "screening",
  "follow_up"
]);

export const reminderStatusEnum = pgEnum("reminder_status", [
  "pending",
  "sent",
  "acknowledged",
  "expired"
]);

export const reminderFrequencyEnum = pgEnum("reminder_frequency", [
  "once",
  "daily",
  "weekly",
  "monthly"
]);

// API Documentation System Enums (Phase 16)
export const apiPermissionEnum = pgEnum("api_permission", [
  "read_patients",
  "write_patients",
  "read_appointments",
  "write_appointments",
  "read_prescriptions",
  "write_prescriptions",
  "read_lab_orders",
  "write_lab_orders",
  "read_insurance_claims",
  "write_insurance_claims",
  "read_billing",
  "write_billing",
  "read_documents",
  "write_documents",
  "read_clinical_alerts",
  "write_clinical_alerts",
  "read_inventory",
  "write_inventory",
  "read_education",
  "write_education",
  "read_reminders",
  "write_reminders",
  "read_surveys",
  "write_surveys",
  "read_health_recommendations",
  "write_health_recommendations",
  "admin"
]);

// DICOM Medical Imaging System Enums (Phase 15)
export const dicomModalityEnum = pgEnum("dicom_modality", [
  "CT",
  "MRI",
  "X_RAY",
  "ULTRASOUND",
  "MAMMOGRAPHY",
  "PET",
  "SPECT",
  "CR",
  "DR",
  "NM",
  "MG",
  "US",
  "DX",
  "XA",
  "RF"
]);

export const studyStatusEnum = pgEnum("study_status", [
  "pending",
  "available",
  "archived",
  "deleted"
]);

export const imagingReportStatusEnum = pgEnum("imaging_report_status", [
  "draft",
  "preliminary",
  "final",
  "amended",
  "cancelled"
]);

export const imagingReportPriorityEnum = pgEnum("imaging_report_priority", [
  "routine",
  "urgent",
  "stat"
]);

export const dicomAnnotationTypeEnum = pgEnum("dicom_annotation_type", [
  "measurement",
  "arrow",
  "circle",
  "text",
  "roi",
  "angle",
  "ellipse",
  "rectangle"
]);

export const pacsProtocolEnum = pgEnum("pacs_protocol", [
  "DICOM",
  "DICOMWEB",
  "DICOMTLS"
]);

// Advanced Analytics & BI Enums (Phase 13)
export const metricTypeEnum = pgEnum("metric_type", [
  "revenue",
  "patient_outcomes",
  "operational",
  "quality",
  "resource_utilization"
]);

export const metricPeriodEnum = pgEnum("metric_period", [
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "yearly"
]);

export const predictiveModelTypeEnum = pgEnum("predictive_model_type", [
  "readmission_risk",
  "appointment_no_show",
  "inventory_demand",
  "revenue_forecast"
]);

export const reportFormatEnum = pgEnum("report_format", [
  "pdf",
  "excel",
  "html",
  "csv",
  "json"
]);

export const reportScheduleEnum = pgEnum("report_schedule", [
  "once",
  "daily",
  "weekly",
  "monthly",
  "quarterly"
]);

export const widgetTypeEnum = pgEnum("widget_type", [
  "chart",
  "kpi",
  "table",
  "gauge",
  "list"
]);

export const exportStatusEnum = pgEnum("export_status", [
  "pending",
  "processing",
  "completed",
  "failed"
]);

// Currency Configuration Table
export const currencies = pgTable("currencies", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  code: currencyEnum("code").notNull().unique(),
  name: text("name").notNull(),
  symbol: text("symbol").notNull(),
  numericCode: varchar("numeric_code", { length: 3 }),
  decimalPlaces: integer("decimal_places").default(2),
  region: text("region"), // Africa, Europe, Asia, etc.
  country: text("country"),
  isActive: boolean("is_active").default(true),
  exchangeRateToUSD: decimal("exchange_rate_to_usd", { precision: 15, scale: 6 }).default("1.000000"),
  lastUpdated: timestamp("last_updated").default(sql`CURRENT_TIMESTAMP`),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
});

// Exchange Rates Table for real-time currency conversion
export const exchangeRates = pgTable("exchange_rates", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  baseCurrency: currencyEnum("base_currency").notNull().default("USD"),
  targetCurrency: currencyEnum("target_currency").notNull(),
  rate: decimal("rate", { precision: 15, scale: 6 }).notNull(),
  bidRate: decimal("bid_rate", { precision: 15, scale: 6 }),
  askRate: decimal("ask_rate", { precision: 15, scale: 6 }),
  provider: text("provider").default("manual"), // manual, api, bank
  validFrom: timestamp("valid_from").default(sql`CURRENT_TIMESTAMP`),
  validTo: timestamp("valid_to"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
});

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => ({
    expireIdx: index("IDX_session_expire").on(table.expire),
  }),
);

// Countries/Regions table for global medical code isolation
export const countries = pgTable("countries", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 3 }).unique().notNull(), // ISO 3166-1 alpha-3 (USA, CAN, GBR, DEU, etc.)
  name: varchar("name", { length: 255 }).notNull(), // United States, Canada, United Kingdom, Germany
  region: varchar("region", { length: 100 }), // North America, Europe, Asia-Pacific
  isActive: boolean("is_active").default(true).notNull(),
  
  // Medical coding standards used in this country
  cptCodeSystem: varchar("cpt_code_system", { length: 50 }).default('CPT-4'), // CPT-4, SNOMED-CT, etc.
  icd10CodeSystem: varchar("icd10_code_system", { length: 50 }).default('ICD-10'), // ICD-10, ICD-11, etc.
  pharmaceuticalCodeSystem: varchar("pharmaceutical_code_system", { length: 50 }).default('NDC'), // NDC, ATC, DIN, etc.
  
  // Currency and formatting
  currencyCode: varchar("currency_code", { length: 3 }).default('USD'), // USD, CAD, EUR, GBP
  dateFormat: varchar("date_format", { length: 20 }).default('MM/DD/YYYY'),
  timeZone: varchar("time_zone", { length: 50 }).default('America/New_York'),
  
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Country-specific medical codes (CPT codes)
export const countryMedicalCodes = pgTable("country_medical_codes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  countryId: uuid("country_id").references(() => countries.id).notNull(),
  codeType: varchar("code_type", { length: 20 }).notNull(), // 'CPT', 'ICD10', 'PHARMACEUTICAL'
  code: varchar("code", { length: 50 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }), // Specialty or category
  amount: decimal("amount", { precision: 10, scale: 2 }), // Standard pricing if applicable
  isActive: boolean("is_active").default(true).notNull(),
  
  // Source tracking
  source: varchar("source", { length: 50 }), // 'manual', 'csv_upload', 'api_import'
  uploadedBy: uuid("uploaded_by"), // User who added this code
  uploadedAt: timestamp("uploaded_at").default(sql`CURRENT_TIMESTAMP`),
  
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Medical code uploads tracking
export const medicalCodeUploads = pgTable("medical_code_uploads", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  countryId: uuid("country_id").references(() => countries.id).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileSize: integer("file_size"), // in bytes
  recordsProcessed: integer("records_processed").default(0),
  recordsImported: integer("records_imported").default(0),
  recordsSkipped: integer("records_skipped").default(0),
  errors: jsonb("errors").default('[]'), // Array of error messages
  status: varchar("status", { length: 20 }).default('processing'), // processing, completed, failed
  uploadedBy: uuid("uploaded_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  completedAt: timestamp("completed_at")
});

// Document Management System Tables
export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").notNull(),
  patientId: uuid("patient_id"), // Optional - for patient-specific documents
  userId: uuid("user_id").notNull(), // Uploader
  documentType: documentTypeEnum("document_type").notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileSize: integer("file_size"), // in bytes
  mimeType: varchar("mime_type", { length: 100 }),
  storageUrl: text("storage_url"), // URL or path to stored file
  version: integer("version").default(1).notNull(),
  status: documentStatusEnum("status").default("draft").notNull(),
  uploadedAt: timestamp("uploaded_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  metadata: jsonb("metadata").default('{}'), // Additional metadata (tags, description, etc.)
  isDeleted: boolean("is_deleted").default(false), // Soft delete
  deletedAt: timestamp("deleted_at"),
  deletedBy: uuid("deleted_by")
});

export const documentVersions = pgTable("document_versions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: uuid("document_id").notNull(),
  version: integer("version").notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  storageUrl: text("storage_url").notNull(),
  uploadedAt: timestamp("uploaded_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  uploadedBy: uuid("uploaded_by").notNull(),
  changeNotes: text("change_notes")
});

export const eSignatureRequests = pgTable("e_signature_requests", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: uuid("document_id").notNull(),
  tenantId: uuid("tenant_id").notNull(),
  requestedBy: uuid("requested_by").notNull(), // User who requested signature
  signerUserId: uuid("signer_user_id"), // User to sign (if internal user)
  signerEmail: varchar("signer_email", { length: 255 }), // Email if external signer
  status: signatureStatusEnum("status").default("pending").notNull(),
  signedAt: timestamp("signed_at"),
  signatureData: jsonb("signature_data"), // JSON with signature image, coordinates, timestamp
  expiresAt: timestamp("expires_at"),
  reminderSent: boolean("reminder_sent").default(false),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull()
});

export const documentAnnotations = pgTable("document_annotations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: uuid("document_id").notNull(),
  userId: uuid("user_id").notNull(), // User who created annotation
  annotationType: annotationTypeEnum("annotation_type").notNull(),
  annotationData: jsonb("annotation_data").notNull(), // JSON with annotation details (coordinates, color, text, etc.)
  pageNumber: integer("page_number"), // For multi-page documents
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull()
});

// Core Tables
export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: tenantTypeEnum("type").notNull(),
  subdomain: text("subdomain").unique().notNull(),
  countryId: uuid("country_id").references(() => countries.id), // Country association
  settings: jsonb("settings").default('{}'),
  isActive: boolean("is_active").default(true),
  // Multi-tenant relationships
  parentTenantId: uuid("parent_tenant_id"), // For hospital-owned pharmacies
  organizationType: text("organization_type", { enum: ["independent", "hospital_owned"] }).default("independent"),
  // White-label branding
  brandName: text("brand_name"),
  logoUrl: text("logo_url"),
  primaryColor: varchar("primary_color", { length: 7 }).default("#10b981"), // hex color
  secondaryColor: varchar("secondary_color", { length: 7 }).default("#3b82f6"),
  customDomain: text("custom_domain"),
  customCss: text("custom_css"),
  // Multi-language settings
  defaultLanguage: varchar("default_language", { length: 10 }).default("en"),
  supportedLanguages: jsonb("supported_languages").default(['en']),
  // Currency settings
  baseCurrency: currencyEnum("base_currency").default("USD"),
  supportedCurrencies: jsonb("supported_currencies").default(['USD']),
  // Offline settings
  offlineEnabled: boolean("offline_enabled").default(false),
  offlineStorageMb: integer("offline_storage_mb").default(100),
  syncFrequencyMinutes: integer("sync_frequency_minutes").default(15),
  // Trial and subscription tracking
  trialStartDate: timestamp("trial_start_date").default(sql`CURRENT_TIMESTAMP`),
  trialEndDate: timestamp("trial_end_date").default(sql`CURRENT_TIMESTAMP + INTERVAL '14 days'`),
  subscriptionStatus: subscriptionStatusEnum("subscription_status").default('trial'),
  lastSuspensionCheck: timestamp("last_suspension_check"),
  suspendedAt: timestamp("suspended_at"),
  suspensionReason: text("suspension_reason"),
  // Stripe integration fields
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionPlanId: subscriptionPlanEnum("subscription_plan_id"),
  subscriptionInterval: billingIntervalEnum("subscription_interval"),
  // Phone and address (moved from top level)
  phoneNumber: text("phone_number"),
  address: text("address"),
  description: text("description"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  username: text("username"),
  email: text("email"),
  password: text("password"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: roleEnum("role").notNull(),
  isActive: boolean("is_active").default(true),
  isTemporaryPassword: boolean("is_temporary_password").default(false),
  mustChangePassword: boolean("must_change_password").default(false),
  passwordChangedAt: timestamp("password_changed_at"),
  languagePreference: text("language_preference").default("en"),
  lastLogin: timestamp("last_login"),
  // Stripe integration fields
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Password Reset Tokens - for secure password reset functionality
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  tenantId: uuid("tenant_id").references(() => tenants.id), // Nullable for cross-tenant users
  tokenHash: text("token_hash").notNull(), // SHA-256 hash of the actual token
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"), // Nullable - set when token is consumed
  requestedIp: text("requested_ip"), // IP address of the reset request
  userAgent: text("user_agent"), // User agent of the reset request
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  // Index for efficient token lookups
  tokenHashIdx: index("password_reset_tokens_token_hash_idx").on(table.tokenHash),
  // Index for cleanup of expired tokens
  expiresAtIdx: index("password_reset_tokens_expires_at_idx").on(table.expiresAt),
  // Index for user lookups
  userIdIdx: index("password_reset_tokens_user_id_idx").on(table.userId)
}));

export const patients = pgTable("patients", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  mrn: text("mrn").notNull(),
  // Tenant-specific patient ID (unique within each hospital/clinic)
  tenantPatientId: text("tenant_patient_id").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: timestamp("date_of_birth").notNull(),
  gender: text("gender"),
  phone: text("phone"),
  email: text("email"),
  address: jsonb("address"),
  emergencyContact: jsonb("emergency_contact"),
  insuranceInfo: jsonb("insurance_info"),
  preferredPharmacyId: uuid("preferred_pharmacy_id").references(() => pharmacies.id),
  primaryPhysicianId: uuid("primary_physician_id").references(() => users.id), // Assigned primary doctor
  medicalHistory: jsonb("medical_history").default('[]'),
  allergies: jsonb("allergies").default('[]'),
  medications: jsonb("medications").default('[]'),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  // Ensure tenant-specific patient ID is unique within each tenant
  uniqueTenantPatientId: unique().on(table.tenantId, table.tenantPatientId),
  // Ensure MRN is unique within each tenant
  uniqueTenantMrn: unique().on(table.tenantId, table.mrn)
}));

// Cross-tenant patient sharing for healthcare networks
export const crossTenantPatients = pgTable("cross_tenant_patients", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  originalPatientId: uuid("original_patient_id").references(() => patients.id).notNull(),
  originalTenantId: uuid("original_tenant_id").references(() => tenants.id).notNull(), // Hospital/Clinic
  sharedWithTenantId: uuid("shared_with_tenant_id").references(() => tenants.id).notNull(), // Lab/Pharmacy
  tenantPatientId: text("tenant_patient_id").notNull(), // Same as original patient's tenant_patient_id
  sharedByUserId: uuid("shared_by_user_id").references(() => users.id).notNull(),
  shareReason: text("share_reason"), // "lab_order", "prescription_fulfillment", etc.
  shareType: text("share_type").notNull(), // "temporary", "permanent", "visit_specific"
  accessLevel: text("access_level").default('read_only'), // "read_only", "read_write", "full_access"
  expiresAt: timestamp("expires_at"), // For temporary sharing
  isActive: boolean("is_active").default(true),
  shareMetadata: jsonb("share_metadata"), // Additional sharing context
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  // Ensure one sharing record per patient per target tenant
  uniquePatientSharing: unique().on(table.originalPatientId, table.sharedWithTenantId),
  // Index for quick lookup by tenant patient ID
  tenantPatientIdIndex: index().on(table.sharedWithTenantId, table.tenantPatientId)
}));

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
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(), // Doctor/Hospital tenant
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  providerId: uuid("provider_id").references(() => users.id).notNull(), // Doctor who prescribed
  appointmentId: uuid("appointment_id").references(() => appointments.id),
  pharmacyTenantId: uuid("pharmacy_tenant_id").references(() => tenants.id), // Target pharmacy chosen by patient
  medicationName: text("medication_name").notNull(),
  dosage: text("dosage").notNull(),
  frequency: text("frequency").notNull(),
  quantity: integer("quantity").notNull(),
  refills: integer("refills").default(0),
  instructions: text("instructions"),
  status: prescriptionStatusEnum("status").default('prescribed'),
  prescribedDate: timestamp("prescribed_date").default(sql`CURRENT_TIMESTAMP`),
  sentToPharmacyDate: timestamp("sent_to_pharmacy_date"),
  filledDate: timestamp("filled_date"),
  expiryDate: timestamp("expiry_date"),
  // Pharmacy workflow fields
  insuranceVerifiedDate: timestamp("insurance_verified_date"),
  insuranceProvider: text("insurance_provider"),
  insuranceCopay: decimal("insurance_copay", { precision: 10, scale: 2 }),
  insuranceCoveragePercentage: decimal("insurance_coverage_percentage", { precision: 5, scale: 2 }), // 0-100%
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  processingStartedDate: timestamp("processing_started_date"),
  readyDate: timestamp("ready_date"),
  dispensedDate: timestamp("dispensed_date"),
  pharmacyNotes: text("pharmacy_notes"),
  // Prescription routing fields for hospital-pharmacy communication  
  routedFromHospital: uuid("routed_from_hospital").references(() => tenants.id), // Original hospital
  patientSelectedPharmacy: boolean("patient_selected_pharmacy").default(false),
  routingNotes: text("routing_notes"),
  // Workflow optimization fields
  priority: priorityLevelEnum("priority").default('normal'),
  urgencyScore: integer("urgency_score").default(50), // 0-100 calculated priority score
  estimatedWaitTime: integer("estimated_wait_time").default(0), // minutes
  assignedStaffId: uuid("assigned_staff_id").references(() => users.id), // Assigned pharmacist
  workflowStage: text("workflow_stage").default('queue'), // queue, verification, processing, ready
  lastStatusUpdate: timestamp("last_status_update").default(sql`CURRENT_TIMESTAMP`),
  patientWaitingSince: timestamp("patient_waiting_since"),
  priorityFactors: jsonb("priority_factors"), // JSON object with priority calculation details
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Clinical Decision Support System Tables

// Drug Interaction Rules - Reference data for drug-drug, drug-food, drug-condition interactions
export const drugInteractionRules = pgTable("drug_interaction_rules", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  drugName1: text("drug_name_1").notNull(), // First drug (or generic class)
  drugName2: text("drug_name_2").notNull(), // Second drug (or food/condition)
  severityLevel: severityLevelEnum("severity_level").notNull(), // critical, major, moderate, minor
  interactionType: interactionTypeEnum("interaction_type").notNull(), // drug-drug, drug-food, drug-condition
  description: text("description").notNull(), // What happens when combined
  clinicalImpact: text("clinical_impact").notNull(), // Potential clinical consequences
  managementStrategy: text("management_strategy").notNull(), // How to manage the interaction
  sourceReference: text("source_reference"), // Reference to medical literature or database
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  // Index for quick lookup of drug interactions
  drug1Idx: index("drug_interaction_drug1_idx").on(table.drugName1),
  drug2Idx: index("drug_interaction_drug2_idx").on(table.drugName2)
}));

// Allergy Alerts - Patient-specific allergy records
export const allergyAlerts = pgTable("allergy_alerts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  allergen: text("allergen").notNull(), // Drug name, food, or environmental allergen
  allergyType: allergyTypeEnum("allergy_type").notNull(), // drug, food, environmental
  reaction: text("reaction").notNull(), // Description of allergic reaction
  severity: allergySeverityEnum("severity").notNull(), // life-threatening, severe, moderate, mild
  onsetDate: timestamp("onset_date"), // When allergy was first observed
  notes: text("notes"), // Additional notes about the allergy
  reportedBy: uuid("reported_by").references(() => users.id), // Who reported the allergy
  verifiedBy: uuid("verified_by").references(() => users.id), // Healthcare provider who verified
  verifiedAt: timestamp("verified_at"), // When it was verified
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  // Index for quick patient allergy lookups
  patientIdx: index("allergy_alerts_patient_idx").on(table.patientId),
  allergenIdx: index("allergy_alerts_allergen_idx").on(table.allergen)
}));

// Dosage Warnings - Reference data for dosage guidelines based on patient conditions
export const dosageWarnings = pgTable("dosage_warnings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  drugName: text("drug_name").notNull(), // Medication name or class
  minDose: decimal("min_dose", { precision: 10, scale: 2 }), // Minimum safe dose
  maxDose: decimal("max_dose", { precision: 10, scale: 2 }), // Maximum safe dose
  unit: text("unit").notNull(), // mg, mcg, mL, etc.
  frequency: text("frequency"), // Daily, BID, TID, etc.
  patientCondition: patientConditionEnum("patient_condition"), // renal, hepatic, pediatric, geriatric, pregnancy, other
  warningMessage: text("warning_message").notNull(), // Warning to display
  adjustmentRecommendation: text("adjustment_recommendation"), // Dosage adjustment guidance
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  // Index for drug and condition lookups
  drugIdx: index("dosage_warnings_drug_idx").on(table.drugName),
  conditionIdx: index("dosage_warnings_condition_idx").on(table.patientCondition)
}));

// Clinical Alerts - Generated alerts for physicians based on CDS checks
export const clinicalAlerts = pgTable("clinical_alerts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  prescriptionId: uuid("prescription_id").references(() => prescriptions.id), // Optional - related prescription
  alertType: alertTypeEnum("alert_type").notNull(), // drug_interaction, allergy, dosage, duplicate_therapy, contraindication
  severity: severityLevelEnum("severity").notNull(), // critical, major, moderate, minor
  title: text("title").notNull(), // Alert headline
  message: text("message").notNull(), // Detailed alert message
  recommendations: text("recommendations"), // Clinical recommendations
  triggeredBy: uuid("triggered_by").references(() => users.id), // User who triggered the alert (e.g., prescribing doctor)
  acknowledgedBy: uuid("acknowledged_by").references(() => users.id), // User who acknowledged the alert
  acknowledgedAt: timestamp("acknowledged_at"), // When alert was acknowledged
  dismissedReason: text("dismissed_reason"), // Why alert was dismissed (required for critical alerts)
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  // Indexes for efficient alert queries
  patientIdx: index("clinical_alerts_patient_idx").on(table.patientId),
  tenantIdx: index("clinical_alerts_tenant_idx").on(table.tenantId),
  prescriptionIdx: index("clinical_alerts_prescription_idx").on(table.prescriptionId),
  createdAtIdx: index("clinical_alerts_created_at_idx").on(table.createdAt)
}));

// Staff Scheduling and Time Tracking Tables

// Staff Shifts - Employee shift schedules
export const staffShifts = pgTable("staff_shifts", {
  id: serial("id").primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  shiftType: shiftTypeEnum("shift_type").notNull(), // morning, afternoon, evening, night, on_call
  shiftDate: timestamp("shift_date").notNull(),
  startTime: text("start_time").notNull(), // HH:MM format
  endTime: text("end_time").notNull(), // HH:MM format
  breakMinutes: integer("break_minutes").default(0),
  departmentId: uuid("department_id"), // optional reference to departments table
  status: staffShiftStatusEnum("status").default("scheduled").notNull(), // scheduled, confirmed, in_progress, completed, cancelled, no_show
  notes: text("notes"),
  assignedBy: uuid("assigned_by").references(() => users.id), // Who assigned the shift
  confirmedAt: timestamp("confirmed_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  tenantIdx: index("staff_shifts_tenant_idx").on(table.tenantId),
  userIdx: index("staff_shifts_user_idx").on(table.userId),
  shiftDateIdx: index("staff_shifts_shift_date_idx").on(table.shiftDate),
  statusIdx: index("staff_shifts_status_idx").on(table.status)
}));

// Time Logs - Employee clock in/out records
export const timeLogs = pgTable("time_logs", {
  id: serial("id").primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  shiftId: integer("shift_id").references(() => staffShifts.id), // optional link to scheduled shift
  clockInTime: timestamp("clock_in_time").notNull(),
  clockInLocation: text("clock_in_location"), // optional geolocation data
  clockOutTime: timestamp("clock_out_time"),
  clockOutLocation: text("clock_out_location"), // optional geolocation data
  totalHours: decimal("total_hours", { precision: 5, scale: 2 }),
  breakMinutes: integer("break_minutes").default(0),
  overtimeHours: decimal("overtime_hours", { precision: 5, scale: 2 }).default("0"),
  status: timeLogStatusEnum("status").default("clocked_in").notNull(), // clocked_in, clocked_out, approved, disputed
  approvedBy: uuid("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  disputeReason: text("dispute_reason"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  tenantIdx: index("time_logs_tenant_idx").on(table.tenantId),
  userIdx: index("time_logs_user_idx").on(table.userId),
  clockInTimeIdx: index("time_logs_clock_in_time_idx").on(table.clockInTime),
  statusIdx: index("time_logs_status_idx").on(table.status)
}));

// Leave Requests - Employee leave/vacation requests
export const leaveRequests = pgTable("leave_requests", {
  id: serial("id").primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  leaveType: leaveTypeEnum("leave_type").notNull(), // vacation, sick, personal, bereavement, maternity, paternity
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  totalDays: decimal("total_days", { precision: 4, scale: 1 }).notNull(),
  reason: text("reason"),
  status: leaveStatusEnum("status").default("pending").notNull(), // pending, approved, denied
  requestedAt: timestamp("requested_at").default(sql`CURRENT_TIMESTAMP`),
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  tenantIdx: index("leave_requests_tenant_idx").on(table.tenantId),
  userIdx: index("leave_requests_user_idx").on(table.userId),
  statusIdx: index("leave_requests_status_idx").on(table.status),
  startDateIdx: index("leave_requests_start_date_idx").on(table.startDate)
}));

// Schedule Templates - Reusable shift schedule patterns
export const scheduleTemplates = pgTable("schedule_templates", {
  id: serial("id").primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  templateName: text("template_name").notNull(),
  departmentId: uuid("department_id"), // optional reference to departments table
  templateData: jsonb("template_data").notNull(), // Contains weekly schedule pattern
  isActive: boolean("is_active").default(true),
  createdBy: uuid("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  tenantIdx: index("schedule_templates_tenant_idx").on(table.tenantId),
  isActiveIdx: index("schedule_templates_is_active_idx").on(table.isActive)
}));

// Pharmacy Inventory Management System
export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  medicationName: text("medication_name").notNull(),
  genericName: text("generic_name"),
  strength: text("strength"),
  form: text("form"), // tablet, capsule, liquid, etc.
  barcodeNumber: varchar("barcode_number", { length: 255 }),
  lotNumber: varchar("lot_number", { length: 255 }),
  expirationDate: timestamp("expiration_date"),
  currentStock: integer("current_stock").default(0).notNull(),
  minStockLevel: integer("min_stock_level").default(0),
  maxStockLevel: integer("max_stock_level"),
  reorderPoint: integer("reorder_point"),
  reorderQuantity: integer("reorder_quantity"),
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }),
  supplierId: varchar("supplier_id", { length: 255 }),
  storageLocation: varchar("storage_location", { length: 255 }),
  temperatureControlled: boolean("temperature_controlled").default(false),
  temperatureRange: varchar("temperature_range", { length: 50 }),
  lastRestocked: timestamp("last_restocked"),
  lastAudit: timestamp("last_audit"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  tenantIdx: index("inventory_items_tenant_idx").on(table.tenantId),
  barcodeIdx: index("inventory_items_barcode_idx").on(table.barcodeNumber),
  expirationIdx: index("inventory_items_expiration_idx").on(table.expirationDate),
  stockLevelIdx: index("inventory_items_stock_level_idx").on(table.currentStock)
}));

export const inventoryBatches = pgTable("inventory_batches", {
  id: serial("id").primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  inventoryItemId: integer("inventory_item_id").references(() => inventoryItems.id).notNull(),
  batchNumber: text("batch_number").notNull(),
  lotNumber: text("lot_number"),
  expirationDate: timestamp("expiration_date"),
  quantity: integer("quantity").notNull(),
  receivedDate: timestamp("received_date").default(sql`CURRENT_TIMESTAMP`),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  supplierName: text("supplier_name"),
  status: inventoryBatchStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  tenantIdx: index("inventory_batches_tenant_idx").on(table.tenantId),
  itemIdx: index("inventory_batches_item_idx").on(table.inventoryItemId),
  expirationIdx: index("inventory_batches_expiration_idx").on(table.expirationDate),
  statusIdx: index("inventory_batches_status_idx").on(table.status)
}));

export const inventoryAudits = pgTable("inventory_audits", {
  id: serial("id").primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  inventoryItemId: integer("inventory_item_id").references(() => inventoryItems.id),
  auditDate: timestamp("audit_date").default(sql`CURRENT_TIMESTAMP`).notNull(),
  expectedQuantity: integer("expected_quantity"),
  actualQuantity: integer("actual_quantity"),
  variance: integer("variance"),
  auditedBy: uuid("audited_by").references(() => users.id).notNull(),
  notes: text("notes"),
  status: inventoryAuditStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  completedAt: timestamp("completed_at")
}, (table) => ({
  tenantIdx: index("inventory_audits_tenant_idx").on(table.tenantId),
  itemIdx: index("inventory_audits_item_idx").on(table.inventoryItemId),
  statusIdx: index("inventory_audits_status_idx").on(table.status),
  auditDateIdx: index("inventory_audits_audit_date_idx").on(table.auditDate)
}));

export const inventoryAlerts = pgTable("inventory_alerts", {
  id: serial("id").primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  inventoryItemId: integer("inventory_item_id").references(() => inventoryItems.id),
  alertType: inventoryAlertTypeEnum("alert_type").notNull(),
  severity: priorityLevelEnum("severity").default("normal").notNull(),
  message: text("message").notNull(),
  triggeredAt: timestamp("triggered_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  acknowledgedBy: uuid("acknowledged_by").references(() => users.id),
  acknowledgedAt: timestamp("acknowledged_at"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  tenantIdx: index("inventory_alerts_tenant_idx").on(table.tenantId),
  itemIdx: index("inventory_alerts_item_idx").on(table.inventoryItemId),
  typeIdx: index("inventory_alerts_type_idx").on(table.alertType),
  triggeredIdx: index("inventory_alerts_triggered_idx").on(table.triggeredAt)
}));

export const autoReorderRules = pgTable("auto_reorder_rules", {
  id: serial("id").primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  inventoryItemId: integer("inventory_item_id").references(() => inventoryItems.id).notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  minQuantity: integer("min_quantity").notNull(),
  reorderQuantity: integer("reorder_quantity").notNull(),
  supplierId: varchar("supplier_id", { length: 255 }),
  lastTriggered: timestamp("last_triggered"),
  orderCount: integer("order_count").default(0),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  tenantIdx: index("auto_reorder_rules_tenant_idx").on(table.tenantId),
  itemIdx: index("auto_reorder_rules_item_idx").on(table.inventoryItemId),
  enabledIdx: index("auto_reorder_rules_enabled_idx").on(table.enabled)
}));

// ============================================================================
// PHASE 7-11: INTEGRATION FRAMEWORKS
// ============================================================================

// Integration Partners - External systems connected to the platform
export const integrationPartners = pgTable("integration_partners", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(), // Partner name (e.g., "Change Healthcare", "SureScripts")
  type: integrationTypeEnum("type").notNull(), // insurance/eprescribing/ehr/iot/quality
  apiUrl: text("api_url"), // API endpoint URL
  authType: text("auth_type"), // oauth, api_key, basic, etc.
  status: text("status").default("active").notNull(), // active/inactive
  credentials: jsonb("credentials"), // Encrypted API credentials/keys
  lastSync: timestamp("last_sync"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  typeIdx: index("integration_partners_type_idx").on(table.type),
  statusIdx: index("integration_partners_status_idx").on(table.status)
}));

// Insurance Eligibility Checks - Track eligibility verification transactions
export const insuranceEligibilityChecks = pgTable("insurance_eligibility_checks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  insuranceProviderId: uuid("insurance_provider_id").references(() => insuranceProviders.id),
  checkDate: timestamp("check_date").default(sql`CURRENT_TIMESTAMP`).notNull(),
  eligibilityStatus: eligibilityStatusEnum("eligibility_status").default("pending").notNull(),
  coverageDetails: jsonb("coverage_details"), // Full coverage information
  copayAmount: decimal("copay_amount", { precision: 10, scale: 2 }),
  deductibleMet: decimal("deductible_met", { precision: 10, scale: 2 }),
  outOfPocketMax: decimal("out_of_pocket_max", { precision: 10, scale: 2 }),
  responseData: jsonb("response_data"), // Raw API response
  checkedBy: uuid("checked_by").references(() => users.id).notNull()
}, (table) => ({
  tenantIdx: index("insurance_eligibility_checks_tenant_idx").on(table.tenantId),
  patientIdx: index("insurance_eligibility_checks_patient_idx").on(table.patientId),
  checkDateIdx: index("insurance_eligibility_checks_check_date_idx").on(table.checkDate)
}));

// E-Prescription Transactions - NCPDP prescription routing
export const ePrescriptionTransactions = pgTable("eprescription_transactions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  prescriptionId: uuid("prescription_id").references(() => prescriptions.id).notNull(),
  pharmacyNCPDP: text("pharmacy_ncpdp").notNull(), // NCPDP pharmacy identifier
  transactionType: ePrescriptionTransactionTypeEnum("transaction_type").notNull(),
  status: ePrescriptionStatusEnum("status").default("pending").notNull(),
  sentAt: timestamp("sent_at"),
  responseAt: timestamp("response_at"),
  responseData: jsonb("response_data"), // NCPDP response
  errorMessage: text("error_message")
}, (table) => ({
  tenantIdx: index("eprescription_transactions_tenant_idx").on(table.tenantId),
  prescriptionIdx: index("eprescription_transactions_prescription_idx").on(table.prescriptionId),
  statusIdx: index("eprescription_transactions_status_idx").on(table.status),
  sentAtIdx: index("eprescription_transactions_sent_at_idx").on(table.sentAt)
}));

// HL7 Messages - Interoperability message log
export const hl7Messages = pgTable("hl7_messages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  direction: hl7DirectionEnum("direction").notNull(), // inbound/outbound
  messageType: hl7MessageTypeEnum("message_type").notNull(), // ADT/ORM/ORU/DFT
  messageData: text("message_data").notNull(), // Raw HL7 message
  processedAt: timestamp("processed_at"),
  status: text("status").default("pending").notNull(), // pending/processed/error
  errorMessage: text("error_message")
}, (table) => ({
  tenantIdx: index("hl7_messages_tenant_idx").on(table.tenantId),
  directionIdx: index("hl7_messages_direction_idx").on(table.direction),
  messageTypeIdx: index("hl7_messages_message_type_idx").on(table.messageType),
  statusIdx: index("hl7_messages_status_idx").on(table.status),
  processedAtIdx: index("hl7_messages_processed_at_idx").on(table.processedAt)
}));

// Device Readings - IoT medical device data
export const deviceReadings = pgTable("device_readings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  deviceId: text("device_id").notNull(), // Unique device identifier
  deviceType: deviceTypeEnum("device_type").notNull(),
  readingValue: jsonb("reading_value").notNull(), // Device-specific reading data
  unit: text("unit"), // mmHg, mg/dL, bpm, etc.
  timestamp: timestamp("timestamp").default(sql`CURRENT_TIMESTAMP`).notNull(),
  source: text("source"), // Device manufacturer/platform
  syncedAt: timestamp("synced_at").default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  tenantIdx: index("device_readings_tenant_idx").on(table.tenantId),
  patientIdx: index("device_readings_patient_idx").on(table.patientId),
  deviceTypeIdx: index("device_readings_device_type_idx").on(table.deviceType),
  timestampIdx: index("device_readings_timestamp_idx").on(table.timestamp)
}));

// Quality Metrics - HEDIS/MIPS/CMS quality measures
export const qualityMetrics = pgTable("quality_metrics", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  metricName: text("metric_name").notNull(),
  metricType: qualityMetricTypeEnum("metric_type").notNull(), // HEDIS/MIPS/CMS
  category: text("category"), // Prevention, Chronic Care, etc.
  measurementPeriod: text("measurement_period").notNull(), // e.g., "2025 Q1"
  numerator: integer("numerator").notNull(), // Patients meeting criteria
  denominator: integer("denominator").notNull(), // Total eligible patients
  percentage: decimal("percentage", { precision: 5, scale: 2 }), // Performance percentage
  target: decimal("target", { precision: 5, scale: 2 }), // Target percentage
  status: text("status").default("calculated"), // calculated/submitted/approved
  calculatedAt: timestamp("calculated_at").default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  tenantIdx: index("quality_metrics_tenant_idx").on(table.tenantId),
  metricTypeIdx: index("quality_metrics_metric_type_idx").on(table.metricType),
  periodIdx: index("quality_metrics_period_idx").on(table.measurementPeriod),
  calculatedAtIdx: index("quality_metrics_calculated_at_idx").on(table.calculatedAt)
}));

// Patient Engagement Tables (Phase 12)

// Education Content - Health education library for patients
export const educationContent = pgTable("education_content", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  title: text("title").notNull(),
  category: educationCategoryEnum("category").notNull(),
  content: text("content").notNull(),
  mediaUrl: text("media_url"),
  authorId: text("author_id").references(() => users.id).notNull(),
  publishedAt: timestamp("published_at").default(sql`CURRENT_TIMESTAMP`),
  viewCount: integer("view_count").default(0),
  difficultyLevel: difficultyLevelEnum("difficulty_level").notNull().default("beginner"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  tenantIdx: index("education_content_tenant_idx").on(table.tenantId),
  categoryIdx: index("education_content_category_idx").on(table.category),
  authorIdx: index("education_content_author_idx").on(table.authorId),
  publishedAtIdx: index("education_content_published_at_idx").on(table.publishedAt)
}));

// Patient Reminders - Medication, appointment, and health reminders
export const patientReminders = pgTable("patient_reminders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  reminderType: reminderTypeEnum("reminder_type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  scheduledFor: timestamp("scheduled_for").notNull(),
  sentAt: timestamp("sent_at"),
  status: reminderStatusEnum("status").default("pending").notNull(),
  frequency: reminderFrequencyEnum("frequency").default("once").notNull(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  tenantIdx: index("patient_reminders_tenant_idx").on(table.tenantId),
  patientIdx: index("patient_reminders_patient_idx").on(table.patientId),
  scheduledForIdx: index("patient_reminders_scheduled_for_idx").on(table.scheduledFor),
  statusIdx: index("patient_reminders_status_idx").on(table.status)
}));

// Health Surveys - Patient health surveys and questionnaires
export const healthSurveys = pgTable("health_surveys", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  surveyName: text("survey_name").notNull(),
  description: text("description"),
  questions: jsonb("questions").notNull(), // Array of question objects
  targetAudience: text("target_audience"), // All patients, specific conditions, etc.
  isActive: boolean("is_active").default(true),
  createdBy: text("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  tenantIdx: index("health_surveys_tenant_idx").on(table.tenantId),
  createdByIdx: index("health_surveys_created_by_idx").on(table.createdBy),
  isActiveIdx: index("health_surveys_is_active_idx").on(table.isActive)
}));

// Survey Responses - Patient responses to health surveys
export const surveyResponses = pgTable("survey_responses", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  surveyId: uuid("survey_id").references(() => healthSurveys.id).notNull(),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  responses: jsonb("responses").notNull(), // Array of answer objects
  submittedAt: timestamp("submitted_at").default(sql`CURRENT_TIMESTAMP`),
  score: integer("score")
}, (table) => ({
  tenantIdx: index("survey_responses_tenant_idx").on(table.tenantId),
  surveyIdx: index("survey_responses_survey_idx").on(table.surveyId),
  patientIdx: index("survey_responses_patient_idx").on(table.patientId),
  submittedAtIdx: index("survey_responses_submitted_at_idx").on(table.submittedAt)
}));

// API Documentation System Tables (Phase 16)

// API Keys - For programmatic access to the platform
export const apiKeys = pgTable("api_keys", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  keyName: varchar("key_name", { length: 255 }).notNull(),
  keyHash: text("key_hash").notNull(), // bcrypt hashed API key
  permissions: jsonb("permissions").notNull().default('[]'), // Array of apiPermissionEnum values
  isActive: boolean("is_active").default(true).notNull(),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  lastUsedAt: timestamp("last_used_at"),
  expiresAt: timestamp("expires_at"),
  rateLimit: integer("rate_limit").default(1000).notNull() // Requests per hour
}, (table) => ({
  tenantIdx: index("api_keys_tenant_idx").on(table.tenantId),
  keyHashIdx: index("api_keys_key_hash_idx").on(table.keyHash),
  isActiveIdx: index("api_keys_is_active_idx").on(table.isActive),
  expiresAtIdx: index("api_keys_expires_at_idx").on(table.expiresAt)
}));

// API Usage Logs - Track all API requests for analytics and billing
export const apiUsageLogs = pgTable("api_usage_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  apiKeyId: uuid("api_key_id").references(() => apiKeys.id).notNull(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  endpoint: varchar("endpoint", { length: 500 }).notNull(),
  method: varchar("method", { length: 10 }).notNull(), // GET, POST, PUT, DELETE, etc.
  statusCode: integer("status_code").notNull(),
  responseTime: integer("response_time"), // Response time in milliseconds
  timestamp: timestamp("timestamp").default(sql`CURRENT_TIMESTAMP`).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }), // IPv6 compatible
  userAgent: text("user_agent"),
  errorMessage: text("error_message") // If request failed
}, (table) => ({
  apiKeyIdx: index("api_usage_logs_api_key_idx").on(table.apiKeyId),
  tenantIdx: index("api_usage_logs_tenant_idx").on(table.tenantId),
  timestampIdx: index("api_usage_logs_timestamp_idx").on(table.timestamp),
  endpointIdx: index("api_usage_logs_endpoint_idx").on(table.endpoint)
}));

// Webhook Endpoints - Event-driven notifications for integrations
export const webhookEndpoints = pgTable("webhook_endpoints", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  url: text("url").notNull(),
  events: jsonb("events").notNull().default('[]'), // Array of event types to listen for
  secret: text("secret").notNull(), // For webhook signature verification
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  lastTriggered: timestamp("last_triggered"),
  failureCount: integer("failure_count").default(0).notNull(),
  description: text("description")
}, (table) => ({
  tenantIdx: index("webhook_endpoints_tenant_idx").on(table.tenantId),
  isActiveIdx: index("webhook_endpoints_is_active_idx").on(table.isActive)
}));

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

// Predefined Service Prices
export const servicePrices = pgTable("service_prices", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  serviceCode: text("service_code").notNull(), // CPT, HCPCS, or internal code
  serviceName: text("service_name").notNull(),
  serviceDescription: text("service_description"),
  serviceType: serviceTypeEnum("service_type").notNull(),
  currency: currencyEnum("currency").notNull().default("USD"),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true),
  effectiveDate: timestamp("effective_date").default(sql`CURRENT_TIMESTAMP`),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Insurance Plan Service Coverage
export const insurancePlanCoverage = pgTable("insurance_plan_coverage", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  insuranceProviderId: uuid("insurance_provider_id").references(() => insuranceProviders.id).notNull(),
  servicePriceId: uuid("service_price_id").references(() => servicePrices.id).notNull(),
  copayAmount: decimal("copay_amount", { precision: 10, scale: 2 }), // Fixed copay
  copayPercentage: decimal("copay_percentage", { precision: 5, scale: 2 }), // Percentage copay (0-100)
  deductibleApplies: boolean("deductible_applies").default(false),
  maxCoverageAmount: decimal("max_coverage_amount", { precision: 10, scale: 2 }), // Maximum insurance will pay
  preAuthRequired: boolean("pre_auth_required").default(false),
  isActive: boolean("is_active").default(true),
  effectiveDate: timestamp("effective_date").default(sql`CURRENT_TIMESTAMP`),
  expirationDate: timestamp("expiration_date"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Service Line Items for Claims
export const claimLineItems = pgTable("claim_line_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  claimId: uuid("claim_id").references(() => insuranceClaims.id).notNull(),
  servicePriceId: uuid("service_price_id").references(() => servicePrices.id).notNull(),
  quantity: integer("quantity").default(1),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  patientCopay: decimal("patient_copay", { precision: 10, scale: 2 }).notNull(),
  insuranceAmount: decimal("insurance_amount", { precision: 10, scale: 2 }).notNull(),
  deductibleAmount: decimal("deductible_amount", { precision: 10, scale: 2 }).default('0'),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Prescription Archives - for completed/dispensed prescriptions
export const prescriptionArchives = pgTable("prescription_archives", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(), // Pharmacy tenant
  originalPrescriptionId: uuid("original_prescription_id").notNull(), // Reference to original prescription
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  providerId: uuid("provider_id").references(() => users.id).notNull(),
  pharmacyTenantId: uuid("pharmacy_tenant_id").references(() => tenants.id),
  medicationName: text("medication_name").notNull(),
  dosage: text("dosage").notNull(),
  frequency: text("frequency").notNull(),
  quantity: integer("quantity").notNull(),
  refills: integer("refills").default(0),
  instructions: text("instructions"),
  status: prescriptionStatusEnum("status").default('dispensed'),
  prescribedDate: timestamp("prescribed_date"),
  dispensedDate: timestamp("dispensed_date"),
  archivedDate: timestamp("archived_date").default(sql`CURRENT_TIMESTAMP`),
  insuranceProvider: text("insurance_provider"),
  insuranceCopay: decimal("insurance_copay", { precision: 10, scale: 2 }),
  insuranceCoveragePercentage: decimal("insurance_coverage_percentage", { precision: 5, scale: 2 }),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  pharmacyNotes: text("pharmacy_notes"),
  claimNumber: text("claim_number"),
  transactionId: text("transaction_id"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Medication Copays defined by pharmacists for patients based on insurance
export const medicationCopays = pgTable("medication_copays", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(), // Pharmacy tenant
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  patientInsuranceId: uuid("patient_insurance_id").references(() => patientInsurance.id).notNull(),
  prescriptionId: uuid("prescription_id").references(() => prescriptions.id),
  medicationName: text("medication_name").notNull(),
  genericName: text("generic_name"),
  strength: text("strength"),
  dosageForm: text("dosage_form"), // tablet, capsule, liquid, etc.
  ndcNumber: text("ndc_number"), // National Drug Code
  
  // Pricing Information
  fullPrice: decimal("full_price", { precision: 10, scale: 2 }).notNull(), // Full medication price
  insuranceCoverage: decimal("insurance_coverage", { precision: 10, scale: 2 }).notNull(), // Amount covered by insurance
  patientCopay: decimal("patient_copay", { precision: 10, scale: 2 }).notNull(), // Amount patient pays
  copayPercentage: decimal("copay_percentage", { precision: 5, scale: 2 }), // If percentage-based copay
  
  // Insurance Details
  formularyTier: text("formulary_tier"), // Tier 1, 2, 3, etc.
  priorAuthRequired: boolean("prior_auth_required").default(false),
  quantityLimit: integer("quantity_limit"), // Max quantity per fill
  daySupplyLimit: integer("day_supply_limit"), // Max days supply
  
  // Pharmacy Information
  definedByPharmacist: uuid("defined_by_pharmacist").references(() => users.id).notNull(),
  pharmacyNotes: text("pharmacy_notes"),
  effectiveDate: timestamp("effective_date").default(sql`CURRENT_TIMESTAMP`),
  expirationDate: timestamp("expiration_date"),
  
  // Status
  isActive: boolean("is_active").default(true),
  lastVerified: timestamp("last_verified").default(sql`CURRENT_TIMESTAMP`),
  
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});



// Visit Summaries created during consultation
export const visitSummaries = pgTable("visit_summaries", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  appointmentId: uuid("appointment_id").references(() => appointments.id).notNull(),
  providerId: uuid("provider_id").references(() => users.id).notNull(),
  vitalSignsId: uuid("vital_signs_id").references(() => vitalSigns.id),
  
  // Chief Complaint and History
  chiefComplaint: text("chief_complaint").notNull(),
  historyOfPresentIllness: text("history_of_present_illness"),
  reviewOfSystems: jsonb("review_of_systems").default('{}'),
  
  // Physical Examination
  physicalExamination: text("physical_examination"),
  symptoms: jsonb("symptoms").default('[]'), // Array of symptom objects
  
  // Assessment and Plan
  assessment: text("assessment"),
  clinicalImpression: text("clinical_impression"),
  differentialDiagnosis: jsonb("differential_diagnosis").default('[]'),
  finalDiagnosis: jsonb("final_diagnosis").default('[]'),
  treatmentPlan: text("treatment_plan"),
  
  // Follow-up and Instructions
  patientInstructions: text("patient_instructions"),
  followUpInstructions: text("follow_up_instructions"),
  returnVisitRecommended: boolean("return_visit_recommended").default(false),
  returnVisitTimeframe: text("return_visit_timeframe"),
  
  // Provider Notes
  providerNotes: text("provider_notes"),
  
  // Status and Timestamps
  status: text("status").default('draft'), // draft, finalized
  visitDate: timestamp("visit_date").default(sql`CURRENT_TIMESTAMP`),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

export const insuranceClaims = pgTable("insurance_claims", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  appointmentId: uuid("appointment_id").references(() => appointments.id),
  visitSummaryId: uuid("visit_summary_id").references(() => visitSummaries.id),
  patientInsuranceId: uuid("patient_insurance_id").references(() => patientInsurance.id),
  providerId: uuid("provider_id").references(() => users.id).notNull(), // Doctor who created the claim
  medicalSpecialty: medicalSpecialtyEnum("medical_specialty"),
  claimNumber: text("claim_number").unique().notNull(),
  
  // Enhanced Medical Coding
  primaryDiagnosisCode: text("primary_diagnosis_code"), // Primary ICD-10 code
  primaryDiagnosisDescription: text("primary_diagnosis_description"),
  secondaryDiagnosisCodes: jsonb("secondary_diagnosis_codes").default('[]'), // Additional ICD-10 codes
  procedureCodes: jsonb("procedure_codes").default('[]'), // CPT codes with descriptions
  diagnosisCodes: jsonb("diagnosis_codes").default('[]'), // Legacy field for backward compatibility
  
  // Clinical Information
  clinicalFindings: text("clinical_findings"),
  treatmentProvided: text("treatment_provided"),
  durationOfTreatment: text("duration_of_treatment"),
  medicalNecessity: text("medical_necessity"),
  
  // Financial Information
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  totalPatientCopay: decimal("total_patient_copay", { precision: 10, scale: 2 }).default('0').notNull(),
  totalInsuranceAmount: decimal("total_insurance_amount", { precision: 10, scale: 2 }).default('0').notNull(),
  approvedAmount: decimal("approved_amount", { precision: 10, scale: 2 }),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }),
  
  // Claim Processing
  status: claimStatusEnum("status").default('draft'),
  submittedDate: timestamp("submitted_date"),
  processedDate: timestamp("processed_date"),
  paidDate: timestamp("paid_date"),
  rejectionReason: text("rejection_reason"),
  
  // Documentation
  notes: text("notes"),
  attachments: jsonb("attachments").default('[]'), // Supporting documents
  
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Role Permissions table - for custom tenant-specific role permissions
export const rolePermissions = pgTable("role_permissions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  role: roleEnum("role").notNull(),
  module: varchar("module", { length: 50 }).notNull(), // 'patients', 'appointments', 'prescriptions', etc.
  permissions: text("permissions").array().notNull(), // ['view', 'create', 'update', 'delete']
  isActive: boolean("is_active").default(true).notNull(),
  createdBy: uuid("created_by").references(() => users.id).notNull(),
  updatedBy: uuid("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
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

// Password Reset Rollback Table for secure password reset operations
export const passwordResetRollback = pgTable("password_reset_rollback", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  operationId: uuid("operation_id").notNull(), // Groups related rollback entries
  userId: varchar("user_id").notNull(), // VARCHAR to match users.id type
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  previousPasswordHash: text("previous_password_hash"), // Nullable for edge cases where password recovery isn't possible
  operationType: text("operation_type").notNull().default('bulk_password_reset'),
  affectedUserCount: integer("affected_user_count"),
  operationDetails: jsonb("operation_details"),
  executedBy: text("executed_by").notNull(), // System identifier or admin
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  expiresAt: timestamp("expires_at").default(sql`CURRENT_TIMESTAMP + INTERVAL '7 days'`) // 7-day retention
});

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  pricingPlanId: uuid("pricing_plan_id").references(() => pricingPlans.id),
  planName: text("plan_name").notNull(),
  plan: subscriptionPlanEnum("plan").notNull().default('starter'),
  status: subscriptionStatusEnum("status").default('trial'),
  billingInterval: billingIntervalEnum("billing_interval").default('monthly'),
  monthlyPrice: decimal("monthly_price", { precision: 10, scale: 2 }).notNull(),
  maxUsers: integer("max_users").notNull(),
  maxPatients: integer("max_patients"),
  features: jsonb("features").default('[]'),
  trialEndsAt: timestamp("trial_ends_at"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  customerId: text("customer_id"), // Stripe customer ID
  subscriptionId: text("subscription_id"), // Stripe subscription ID
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

// Work Shifts - for tracking pharmacy shifts and accessing archived records
export const workShifts = pgTable("work_shifts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(), // Pharmacist or staff
  shiftType: text("shift_type").notNull(), // morning, afternoon, evening, night
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  status: shiftStatusEnum("status").default('active'),
  notes: text("notes"),
  totalPrescriptionsProcessed: integer("total_prescriptions_processed").default(0),
  totalRevenue: decimal("total_revenue", { precision: 10, scale: 2 }).default('0'),
  totalInsuranceClaims: integer("total_insurance_claims").default(0),
  shiftSummary: jsonb("shift_summary").default('{}'), // Summary statistics for the shift
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Enhanced Patient Insurance Information specifically for hospitals
export const hospitalPatientInsurance = pgTable("hospital_patient_insurance", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  
  // Primary Insurance
  primaryInsuranceProvider: text("primary_insurance_provider"),
  primaryPolicyNumber: text("primary_policy_number"),
  primaryGroupNumber: text("primary_group_number"),
  primaryMemberId: text("primary_member_id"),
  primarySubscriberName: text("primary_subscriber_name"),
  primarySubscriberRelationship: text("primary_subscriber_relationship"),
  primarySubscriberDob: timestamp("primary_subscriber_dob"),
  primaryEffectiveDate: timestamp("primary_effective_date"),
  primaryExpirationDate: timestamp("primary_expiration_date"),
  primaryCopayAmount: decimal("primary_copay_amount", { precision: 10, scale: 2 }),
  primaryDeductibleAmount: decimal("primary_deductible_amount", { precision: 10, scale: 2 }),
  primaryCoveragePercentage: integer("primary_coverage_percentage"),
  primaryIsActive: boolean("primary_is_active").default(true),
  
  // Secondary Insurance
  secondaryInsuranceProvider: text("secondary_insurance_provider"),
  secondaryPolicyNumber: text("secondary_policy_number"),
  secondaryGroupNumber: text("secondary_group_number"),
  secondaryMemberId: text("secondary_member_id"),
  secondarySubscriberName: text("secondary_subscriber_name"),
  secondarySubscriberRelationship: text("secondary_subscriber_relationship"),
  secondarySubscriberDob: timestamp("secondary_subscriber_dob"),
  secondaryEffectiveDate: timestamp("secondary_effective_date"),
  secondaryExpirationDate: timestamp("secondary_expiration_date"),
  secondaryCoveragePercentage: integer("secondary_coverage_percentage"),
  secondaryIsActive: boolean("secondary_is_active").default(false),
  
  // Verification details
  lastVerificationDate: timestamp("last_verification_date"),
  verificationStatus: text("verification_status").default('pending'),
  verificationNotes: text("verification_notes"),
  verifiedBy: uuid("verified_by").references(() => users.id),
  
  // Additional details
  emergencyContact: jsonb("emergency_contact"),
  specialPrograms: text("special_programs").array(),
  copayCards: jsonb("copay_cards").default('[]'),
  
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Departments - Dynamic department management for hospitals and organizations
export const departments = pgTable("departments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon").default('Building2'), // Lucide icon name
  color: text("color").default('#3b82f6'), // Department color theme
  headOfDepartment: uuid("head_of_department").references(() => users.id),
  staffCount: integer("staff_count").default(0),
  operatingHours: text("operating_hours").default('9:00 AM - 5:00 PM'),
  location: text("location"),
  phone: text("phone"),
  email: text("email"),
  budget: decimal("budget", { precision: 12, scale: 2 }),
  specializations: text("specializations").array().default(sql`'{}'::text[]`),
  equipment: jsonb("equipment").default('[]'),
  certifications: text("certifications").array().default(sql`'{}'::text[]`),
  isActive: boolean("is_active").default(true),
  settings: jsonb("settings").default('{}'),
  metrics: jsonb("metrics").default('{}'), // Performance metrics and KPIs
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Enhanced Patient Insurance Information specifically for laboratories
export const laboratoryPatientInsurance = pgTable("laboratory_patient_insurance", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  
  // Primary Insurance
  primaryInsuranceProvider: text("primary_insurance_provider"),
  primaryPolicyNumber: text("primary_policy_number"),
  primaryGroupNumber: text("primary_group_number"),
  primaryMemberId: text("primary_member_id"),
  primarySubscriberName: text("primary_subscriber_name"),
  primarySubscriberRelationship: text("primary_subscriber_relationship"),
  primarySubscriberDob: timestamp("primary_subscriber_dob"),
  primaryEffectiveDate: timestamp("primary_effective_date"),
  primaryExpirationDate: timestamp("primary_expiration_date"),
  primaryCopayAmount: decimal("primary_copay_amount", { precision: 10, scale: 2 }),
  primaryDeductibleAmount: decimal("primary_deductible_amount", { precision: 10, scale: 2 }),
  primaryCoveragePercentage: integer("primary_coverage_percentage"),
  primaryIsActive: boolean("primary_is_active").default(true),
  
  // Secondary Insurance
  secondaryInsuranceProvider: text("secondary_insurance_provider"),
  secondaryPolicyNumber: text("secondary_policy_number"),
  secondaryGroupNumber: text("secondary_group_number"),
  secondaryMemberId: text("secondary_member_id"),
  secondarySubscriberName: text("secondary_subscriber_name"),
  secondarySubscriberRelationship: text("secondary_subscriber_relationship"),
  secondarySubscriberDob: timestamp("secondary_subscriber_dob"),
  secondaryEffectiveDate: timestamp("secondary_effective_date"),
  secondaryExpirationDate: timestamp("secondary_expiration_date"),
  secondaryCoveragePercentage: integer("secondary_coverage_percentage"),
  secondaryIsActive: boolean("secondary_is_active").default(false),
  
  // Verification details
  lastVerificationDate: timestamp("last_verification_date"),
  verificationStatus: text("verification_status").default('pending'),
  verificationNotes: text("verification_notes"),
  verifiedBy: uuid("verified_by").references(() => users.id),
  
  // Additional details
  emergencyContact: jsonb("emergency_contact"),
  specialPrograms: text("special_programs").array(),
  copayCards: jsonb("copay_cards").default('[]'),
  
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Enhanced Patient Insurance Information specifically for pharmacies
export const pharmacyPatientInsurance = pgTable("pharmacy_patient_insurance", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(), // Pharmacy tenant
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  
  // Primary Insurance
  primaryInsuranceProvider: text("primary_insurance_provider"),
  primaryPolicyNumber: text("primary_policy_number"),
  primaryGroupNumber: text("primary_group_number"),
  primaryMemberId: text("primary_member_id"),
  primarySubscriberName: text("primary_subscriber_name"),
  primarySubscriberRelationship: text("primary_subscriber_relationship"), // self, spouse, child, parent
  primarySubscriberDob: timestamp("primary_subscriber_dob"),
  primaryEffectiveDate: timestamp("primary_effective_date"),
  primaryExpirationDate: timestamp("primary_expiration_date"),
  primaryCopayAmount: decimal("primary_copay_amount", { precision: 10, scale: 2 }),
  primaryDeductibleAmount: decimal("primary_deductible_amount", { precision: 10, scale: 2 }),
  primaryIsActive: boolean("primary_is_active").default(true),
  
  // Secondary Insurance (if applicable)
  secondaryInsuranceProvider: text("secondary_insurance_provider"),
  secondaryPolicyNumber: text("secondary_policy_number"),
  secondaryGroupNumber: text("secondary_group_number"),
  secondaryMemberId: text("secondary_member_id"),
  secondarySubscriberName: text("secondary_subscriber_name"),
  secondarySubscriberRelationship: text("secondary_subscriber_relationship"),
  secondarySubscriberDob: timestamp("secondary_subscriber_dob"),
  secondaryEffectiveDate: timestamp("secondary_effective_date"),
  secondaryExpirationDate: timestamp("secondary_expiration_date"),
  secondaryIsActive: boolean("secondary_is_active").default(false),
  
  // Pharmacy-specific insurance details
  preferredPharmacyNetwork: text("preferred_pharmacy_network"),
  formularyTier: text("formulary_tier"), // Tier 1, 2, 3, 4, specialty
  mailOrderBenefit: boolean("mail_order_benefit").default(false),
  maxDaysSupply: integer("max_days_supply").default(30),
  refillLimitations: text("refill_limitations"),
  priorAuthRequired: boolean("prior_auth_required").default(false),
  stepTherapyRequired: boolean("step_therapy_required").default(false),
  
  // Verification details
  lastVerificationDate: timestamp("last_verification_date"),
  verificationStatus: verificationStatusEnum("verification_status").default('pending'),
  verificationNotes: text("verification_notes"),
  verifiedBy: uuid("verified_by").references(() => users.id), // Pharmacist who verified
  
  // Additional details
  emergencyContact: jsonb("emergency_contact"),
  specialPrograms: text("special_programs").array().default([]), // Medicare Part D, Medicaid, etc.
  copayCards: jsonb("copay_cards").default('[]'), // Manufacturer copay cards
  
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Patient Pharmacy Preferences - where patients choose their preferred pharmacy
export const patientPharmacyPreferences = pgTable("patient_pharmacy_preferences", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  pharmacyId: uuid("pharmacy_id").references(() => tenants.id).notNull(), // Preferred pharmacy
  hospitalId: uuid("hospital_id").references(() => tenants.id), // Hospital context (optional)
  isPrimary: boolean("is_primary").default(false), // Primary pharmacy choice
  isActive: boolean("is_active").default(true),
  preferenceReason: text("preference_reason"), // Why patient chose this pharmacy
  deliveryPreference: text("delivery_preference", { enum: ["pickup", "delivery", "both"] }).default("pickup"),
  specialInstructions: text("special_instructions"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Archived Records - stores records that are hidden after each shift
export const archivedRecords = pgTable("archived_records", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  workShiftId: uuid("work_shift_id").references(() => workShifts.id).notNull(),
  recordType: text("record_type").notNull(), // prescription, receipt, payment, insurance_claim
  recordId: uuid("record_id").notNull(), // Reference to the actual record
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  
  // Search metadata for quick retrieval
  patientName: text("patient_name").notNull(),
  patientMrn: text("patient_mrn"),
  medicationName: text("medication_name"),
  prescriptionNumber: text("prescription_number"),
  receiptNumber: text("receipt_number"),
  insuranceProvider: text("insurance_provider"),
  
  // Archive details
  archivedAt: timestamp("archived_at").default(sql`CURRENT_TIMESTAMP`),
  archivedBy: uuid("archived_by").references(() => users.id).notNull(),
  
  // Access tracking
  accessCount: integer("access_count").default(0),
  lastAccessedAt: timestamp("last_accessed_at"),
  lastAccessedBy: uuid("last_accessed_by").references(() => users.id),
  
  // Additional metadata
  recordData: jsonb("record_data"), // Snapshot of the record at time of archiving
  tags: text("tags").array().default([]), // For categorization
  notes: text("notes"),
  
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
});

// Pharmacy Report Templates - predefined reports for pharmacy operations
export const pharmacyReportTemplates = pgTable("pharmacy_report_templates", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  reportType: text("report_type").notNull(), // daily_sales, insurance_summary, patient_demographics, medication_dispensing, etc.
  
  // Template configuration
  dataFields: jsonb("data_fields").notNull(), // Which fields to include
  groupBy: text("group_by").array().default([]), // How to group data
  orderBy: text("order_by").array().default([]), // How to sort data
  filters: jsonb("filters").default('{}'), // Default filters
  
  // Scheduling options
  isScheduled: boolean("is_scheduled").default(false),
  scheduleFrequency: text("schedule_frequency"), // daily, weekly, monthly
  scheduleTime: text("schedule_time"), // Time to generate
  lastGenerated: timestamp("last_generated"),
  
  // Template settings
  isActive: boolean("is_active").default(true),
  isDefault: boolean("is_default").default(false),
  
  createdBy: uuid("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
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
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// AI Health Recommendations Tables
export const healthRecommendations = pgTable("health_recommendations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  type: text("type").notNull(), // lifestyle, medical, preventive, risk_alert
  priority: text("priority").notNull(), // low, medium, high, urgent
  title: text("title").notNull(),
  description: text("description").notNull(),
  recommendations: jsonb("recommendations").default('[]'),
  reasoning: text("reasoning"),
  followUpRequired: boolean("follow_up_required").default(false),
  status: text("status").default('active'), // active, dismissed, completed
  acknowledgedAt: timestamp("acknowledged_at"),
  acknowledgedBy: uuid("acknowledged_by").references(() => users.id),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

export const healthAnalyses = pgTable("health_analyses", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  overallHealthScore: integer("overall_health_score").notNull(),
  riskFactors: jsonb("risk_factors").default('[]'),
  trends: jsonb("trends").default('{}'),
  nextAppointmentSuggestion: text("next_appointment_suggestion"),
  analysisData: jsonb("analysis_data"),
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

// Patient Assignment System
export const patientAssignments = pgTable("patient_assignments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  physicianId: uuid("physician_id").references(() => users.id).notNull(),
  assignmentType: text("assignment_type").notNull().default('primary'), // primary, secondary, temporary
  assignedBy: uuid("assigned_by").references(() => users.id).notNull(), // Who assigned the patient
  assignedDate: timestamp("assigned_date").default(sql`CURRENT_TIMESTAMP`),
  expiryDate: timestamp("expiry_date"), // For temporary assignments
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Enhanced Patient Access Requests for Multi-Doctor Separation
export const patientAccessRequests = pgTable("patient_access_requests", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  requestingPhysicianId: uuid("requesting_physician_id").references(() => users.id).notNull(),
  targetPhysicianId: uuid("target_physician_id").references(() => users.id), // Chief physician or assigned doctor
  requestType: text("request_type").notNull().default('access'), // access, transfer, consultation
  reason: text("reason").notNull(),
  urgency: text("urgency").notNull().default('normal'), // low, normal, high, emergency
  status: accessRequestStatusEnum("status").default("pending").notNull(),
  requestedDate: timestamp("requested_date").default(sql`CURRENT_TIMESTAMP`),
  reviewedDate: timestamp("reviewed_date"),
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  reviewNotes: text("review_notes"),
  accessGrantedUntil: timestamp("access_granted_until"), // Temporary access expiry
  accessType: text("access_type").default("read").notNull(), // read, write, full
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Patient Access Audit Log for Compliance
export const patientAccessAuditLog = pgTable("patient_access_audit_log", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  
  // Access Details
  doctorId: uuid("doctor_id").references(() => users.id).notNull(),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  accessRequestId: uuid("access_request_id").references(() => patientAccessRequests.id),
  
  // Action Information  
  actionType: text("action_type").notNull(), // view, edit, create, delete
  resourceType: text("resource_type").notNull(), // medical_record, billing, appointment, prescription
  resourceId: text("resource_id"),
  
  // Context
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  accessMethod: text("access_method").default("direct").notNull(), // direct, requested, emergency
  
  // Metadata
  accessedAt: timestamp("accessed_at").default(sql`CURRENT_TIMESTAMP`)
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

// Pharmacy Management Tables
export const pharmacies = pgTable("pharmacies", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  name: text("name").notNull(),
  licenseNumber: text("license_number"),
  npiNumber: text("npi_number"), // National Provider Identifier
  contactPerson: text("contact_person"),
  phone: text("phone").notNull(),
  email: text("email"),
  faxNumber: text("fax_number"),
  address: jsonb("address").notNull().$type<{
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }>(),
  isActive: boolean("is_active").default(true),
  acceptsInsurance: boolean("accepts_insurance").default(true),
  deliveryService: boolean("delivery_service").default(false),
  operatingHours: jsonb("operating_hours").$type<{
    monday?: { open: string; close: string };
    tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string };
    thursday?: { open: string; close: string };
    friday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  }>(),
  specializations: text("specializations").array().default([]), // specialty medications, compounding, etc.
  websiteUrl: text("website_url"),
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
  isExternal: boolean("is_external").default(false), // true for external labs registering on platform
  registrationStatus: text("registration_status").default("approved"), // pending, approved, rejected
  registrationNotes: text("registration_notes"),
  approvedBy: uuid("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  websiteUrl: text("website_url"),
  accreditations: text("accreditations").array().default([]),
  operatingHours: jsonb("operating_hours").$type<{
    monday?: { open: string; close: string };
    tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string };
    thursday?: { open: string; close: string };
    friday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  }>(),
  servicesOffered: text("services_offered").array().default([]),
  equipmentDetails: text("equipment_details"),
  certificationDocuments: text("certification_documents").array().default([]),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Laboratory registration applications for external labs to join platform
export const laboratoryApplications = pgTable("laboratory_applications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  laboratoryName: text("laboratory_name").notNull(),
  licenseNumber: text("license_number").notNull(),
  contactPerson: text("contact_person").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone").notNull(),
  address: jsonb("address").notNull().$type<{
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }>(),
  specializations: text("specializations").array().notNull().default([]),
  description: text("description"),
  websiteUrl: text("website_url"),
  accreditations: text("accreditations").array().default([]),
  averageTurnaroundTime: integer("average_turnaround_time").default(24),
  operatingHours: jsonb("operating_hours").$type<{
    monday?: { open: string; close: string };
    tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string };
    thursday?: { open: string; close: string };
    friday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  }>(),
  servicesOffered: text("services_offered").array().default([]),
  equipmentDetails: text("equipment_details"),
  certificationDocuments: text("certification_documents").array().default([]),
  status: text("status").default("pending"), // pending, under_review, approved, rejected
  reviewNotes: text("review_notes"),
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

export const pendingRegistrations = pgTable("pending_registrations", {
  id: text("id").primaryKey().default(nanoid()),
  type: text("type").notNull(), // 'pharmacy', 'laboratory', 'hospital', 'clinic'
  organizationName: text("organization_name").notNull(),
  subdomain: text("subdomain").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone"),
  
  // Registration Data (JSON blob containing all form data)
  registrationData: jsonb("registration_data").notNull(),
  
  // Admin User Data
  adminData: jsonb("admin_data").notNull(),
  
  // Status Management
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  submittedAt: timestamp("submitted_at").default(sql`CURRENT_TIMESTAMP`),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: uuid("reviewed_by").references(() => users.id), // User ID of reviewer
  reviewNotes: text("review_notes"),
  
  // Tenant ID (populated after approval)
  approvedTenantId: uuid("approved_tenant_id").references(() => tenants.id),
  approvedUserId: uuid("approved_user_id").references(() => users.id),
  
  // Metadata
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
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

// Pricing Plans Table
export const pricingPlans = pgTable("pricing_plans", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(), // Starter, Professional, Enterprise, White Label
  plan: subscriptionPlanEnum("plan").notNull(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  monthlyPrice: decimal("monthly_price", { precision: 10, scale: 2 }).notNull(),
  yearlyPrice: decimal("yearly_price", { precision: 10, scale: 2 }),
  currency: text("currency").default('USD'),
  trialDays: integer("trial_days").default(14),
  // Feature limits
  maxUsers: integer("max_users").default(5),
  maxPatients: integer("max_patients").default(100),
  maxStorageGb: integer("max_storage_gb").default(1),
  apiCallsPerMonth: integer("api_calls_per_month").default(1000),
  // Feature flags
  whitelabelEnabled: boolean("whitelabel_enabled").default(false),
  offlineEnabled: boolean("offline_enabled").default(false),
  multiLanguageEnabled: boolean("multi_language_enabled").default(false),
  advancedReportsEnabled: boolean("advanced_reports_enabled").default(false),
  customIntegrationsEnabled: boolean("custom_integrations_enabled").default(false),
  prioritySupport: boolean("priority_support").default(false),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Pharmacy Receipts for patients after payment
export const pharmacyReceipts = pgTable("pharmacy_receipts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(), // Pharmacy tenant
  prescriptionId: uuid("prescription_id").references(() => prescriptions.id).notNull(),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  
  // Receipt Details
  receiptNumber: text("receipt_number").notNull().unique(),
  dispensedBy: uuid("dispensed_by").references(() => users.id).notNull(), // Pharmacist who dispensed
  
  // Medication Information
  medicationName: text("medication_name").notNull(),
  genericName: text("generic_name"),
  dosage: text("dosage").notNull(),
  quantity: integer("quantity").notNull(),
  daysSupply: integer("days_supply"),
  
  // Pricing Breakdown
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).notNull(),
  insuranceProvider: text("insurance_provider"),
  insuranceAmount: decimal("insurance_amount", { precision: 10, scale: 2 }).default('0'),
  patientCopay: decimal("patient_copay", { precision: 10, scale: 2 }).notNull(),
  
  // Payment Information
  paymentMethod: text("payment_method").notNull(), // cash, card, check, etc.
  paymentAmount: decimal("payment_amount", { precision: 10, scale: 2 }).notNull(),
  changeGiven: decimal("change_given", { precision: 10, scale: 2 }).default('0'),
  
  // Prescription Details
  prescribedBy: text("prescribed_by").notNull(), // Doctor name
  prescribedDate: timestamp("prescribed_date").notNull(),
  dispensedDate: timestamp("dispensed_date").notNull(),
  refillsRemaining: integer("refills_remaining").default(0),
  
  // Receipt Notes
  pharmacyNotes: text("pharmacy_notes"),
  patientInstructions: text("patient_instructions"),
  
  // Status
  isPrinted: boolean("is_printed").default(false),
  isEmailed: boolean("is_emailed").default(false),
  
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Laboratory Bills for patients after lab services
export const labBills = pgTable("lab_bills", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(), // Laboratory tenant
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  
  // Bill Details
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  status: text("status").default("pending").notNull(), // pending, paid, overdue, cancelled
  serviceType: text("service_type").default("laboratory_test").notNull(),
  
  // Lab Order Reference
  labOrderId: uuid("lab_order_id").references(() => labOrders.id),
  testName: text("test_name"),
  
  // Additional Information
  notes: text("notes"),
  generatedBy: uuid("generated_by").references(() => users.id).notNull(),
  
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Hospital Bills for patient services and procedures
export const hospitalBills = pgTable("hospital_bills", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(), // Hospital tenant
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  appointmentId: uuid("appointment_id").references(() => appointments.id),
  
  // Bill Details
  billNumber: text("bill_number").notNull().unique(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  status: billStatusEnum("status").default("pending").notNull(),
  serviceType: serviceTypeEnum("service_type").notNull(),
  
  // Insurance Information
  insuranceProvider: text("insurance_provider"),
  insuranceAmount: decimal("insurance_amount", { precision: 10, scale: 2 }).default('0'),
  patientCopay: decimal("patient_copay", { precision: 10, scale: 2 }).notNull(),
  
  // Additional Information
  procedureCodes: text("procedure_codes").array().default([]),
  diagnosisCodes: text("diagnosis_codes").array().default([]),
  notes: text("notes"),
  generatedBy: uuid("generated_by").references(() => users.id).notNull(),
  
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Pharmacy Bills for medication sales
export const pharmacyBills = pgTable("pharmacy_bills", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(), // Pharmacy tenant
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  prescriptionId: uuid("prescription_id").references(() => prescriptions.id),
  
  // Bill Details
  billNumber: text("bill_number").notNull().unique(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  status: billStatusEnum("status").default("pending").notNull(),
  
  // Medication Information
  medicationName: text("medication_name").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  
  // Insurance Information
  insuranceProvider: text("insurance_provider"),
  insuranceAmount: decimal("insurance_amount", { precision: 10, scale: 2 }).default('0'),
  patientCopay: decimal("patient_copay", { precision: 10, scale: 2 }).notNull(),
  
  // Additional Information
  notes: text("notes"),
  generatedBy: uuid("generated_by").references(() => users.id).notNull(),
  
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Comprehensive Financial Transactions Ledger for Bookkeeping
export const financialTransactions = pgTable("financial_transactions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  
  // Transaction Identification
  transactionNumber: text("transaction_number").notNull().unique(),
  transactionType: text("transaction_type").notNull(), // payment, refund, adjustment, fee, copay, insurance_payment
  category: text("category").notNull(), // pharmacy_sale, hospital_service, lab_test, insurance_claim
  
  // Financial Details
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: currencyEnum("currency").notNull().default("USD"),
  description: text("description").notNull(),
  
  // Related Entities
  patientId: uuid("patient_id").references(() => patients.id),
  billId: uuid("bill_id"), // References any bill (hospital, pharmacy, lab)
  receiptId: uuid("receipt_id"), // References any receipt
  paymentId: uuid("payment_id"), // References payment records
  
  // Payment Method Details
  paymentMethod: text("payment_method"), // cash, card, check, insurance, online
  paymentReference: text("payment_reference"), // transaction ID, check number, etc.
  
  // Accounting Categories
  accountCode: text("account_code"), // Chart of accounts code
  debitAccount: text("debit_account"), // Account being debited
  creditAccount: text("credit_account"), // Account being credited
  
  // Status and Dates
  status: text("status").notNull().default("completed"), // pending, completed, reversed, failed
  transactionDate: timestamp("transaction_date").notNull(),
  postedDate: timestamp("posted_date"),
  
  // Audit Trail
  recordedBy: uuid("recorded_by").references(() => users.id).notNull(),
  approvedBy: uuid("approved_by").references(() => users.id),
  
  // Additional Information
  notes: text("notes"),
  metadata: jsonb("metadata"), // Additional transaction-specific data
  
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Offline Sync Data
export const offlineSyncData = pgTable("offline_sync_data", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  entityType: text("entity_type").notNull(), // patients, appointments, prescriptions, etc.
  entityId: uuid("entity_id").notNull(),
  action: text("action").notNull(), // create, update, delete
  data: jsonb("data").notNull(),
  timestamp: timestamp("timestamp").default(sql`CURRENT_TIMESTAMP`),
  syncedAt: timestamp("synced_at"),
  conflictResolved: boolean("conflict_resolved").default(false),
  deviceId: text("device_id"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
});

// Multi-language content table
export const translations = pgTable("translations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  key: text("key").notNull(), // translation key like "dashboard.welcome"
  language: varchar("language", { length: 10 }).notNull(), // en, es, fr, etc.
  value: text("value").notNull(), // translated text
  context: text("context"), // additional context for translators
  isDefault: boolean("is_default").default(false),
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

// Vital Signs Records
export const vitalSigns = pgTable("vital_signs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  appointmentId: uuid("appointment_id").references(() => appointments.id),
  recordedBy: uuid("recorded_by_id").references(() => users.id).notNull(), // receptionist/nurse
  // Standard vital signs
  systolicBp: integer("blood_pressure_systolic"), // mmHg
  diastolicBp: integer("blood_pressure_diastolic"), // mmHg
  heartRate: integer("heart_rate"), // bpm
  temperature: decimal("temperature", { precision: 4, scale: 1 }), // °F or °C
  temperatureUnit: text("temperature_unit").default('F'), // F or C
  respiratoryRate: integer("respiratory_rate"), // breaths per minute
  oxygenSaturation: integer("oxygen_saturation"), // %
  weight: decimal("weight", { precision: 5, scale: 2 }), // lbs or kg
  height: decimal("height", { precision: 5, scale: 2 }), // inches or cm
  bmi: decimal("body_mass_index", { precision: 4, scale: 1 }), // calculated
  painLevel: integer("pain_level"), // 0-10 scale
  // Additional measurements
  glucoseLevel: integer("glucose_level"), // mg/dL
  notes: text("notes"),
  recordedAt: timestamp("recorded_at").default(sql`CURRENT_TIMESTAMP`),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Specialty-specific questionnaires
export const specialtyQuestionnaires = pgTable("specialty_questionnaires", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  appointmentId: uuid("appointment_id").references(() => appointments.id),
  specialty: medicalSpecialtyEnum("specialty").notNull(),
  completedBy: uuid("completed_by").references(() => users.id).notNull(), // receptionist/nurse
  // Questionnaire responses stored as JSON
  responses: jsonb("responses").notNull().$type<{
    [questionId: string]: {
      question: string;
      answer: string | number | boolean | string[];
      type: 'text' | 'number' | 'boolean' | 'select' | 'multi_select' | 'scale';
      required: boolean;
    };
  }>(),
  chiefComplaint: text("chief_complaint"),
  symptoms: text("symptoms").array().default([]),
  symptomDuration: text("symptom_duration"),
  severity: integer("severity"), // 1-10 scale
  previousTreatments: text("previous_treatments"),
  currentMedications: text("current_medications").array().default([]),
  allergies: text("allergies").array().default([]),
  familyHistory: text("family_history"),
  socialHistory: text("social_history"),
  reviewOfSystems: jsonb("review_of_systems").default('{}'),
  additionalNotes: text("additional_notes"),
  isComplete: boolean("is_complete").default(false),
  completedAt: timestamp("completed_at"),
  reviewedBy: uuid("reviewed_by").references(() => users.id), // doctor who reviewed
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Patient Check-ins for receptionist workflow
export const patientCheckIns = pgTable("patient_check_ins", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  appointmentId: uuid("appointment_id").references(() => appointments.id),
  checkedInBy: uuid("checked_in_by").references(() => users.id).notNull(), // receptionist
  checkedInAt: timestamp("checked_in_at").default(sql`CURRENT_TIMESTAMP`),
  reasonForVisit: text("reason_for_visit").notNull(),
  chiefComplaint: text("chief_complaint"),
  priorityLevel: text("priority_level", { enum: ['low', 'normal', 'high', 'urgent', 'emergency'] }).default('normal'),
  specialInstructions: text("special_instructions"),
  accompaniedBy: text("accompanied_by"),
  insuranceVerified: boolean("insurance_verified").default(false),
  copayCollected: decimal("copay_collected", { precision: 10, scale: 2 }),
  estimatedWaitTime: integer("estimated_wait_time"), // minutes
  vitalSignsId: uuid("vital_signs_id").references(() => vitalSigns.id),
  questionnaireId: uuid("questionnaire_id").references(() => specialtyQuestionnaires.id),
  status: text("status", { enum: ['waiting', 'in-room', 'with-provider', 'completed', 'cancelled'] }).default('waiting'),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Patient Bills - Outstanding balances that patients need to pay
export const patientBills = pgTable("patient_bills", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  billNumber: text("bill_number").notNull().unique(),
  description: text("description").notNull(),
  serviceDate: timestamp("service_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  currency: currencyEnum("currency").notNull().default("USD"),
  originalAmount: decimal("original_amount", { precision: 10, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).default('0'),
  remainingBalance: decimal("remaining_balance", { precision: 10, scale: 2 }).notNull(),
  status: billStatusEnum("status").notNull().default("pending"),
  appointmentId: uuid("appointment_id").references(() => appointments.id),
  prescriptionId: uuid("prescription_id").references(() => prescriptions.id),
  labOrderId: uuid("lab_order_id").references(() => labOrders.id),
  servicePriceId: uuid("service_price_id").references(() => servicePrices.id),
  insuranceClaimId: uuid("insurance_claim_id").references(() => insuranceClaims.id),
  insuranceCovered: decimal("insurance_covered", { precision: 10, scale: 2 }).default('0'),
  patientResponsibility: decimal("patient_responsibility", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  lateFeesApplied: decimal("late_fees_applied", { precision: 10, scale: 2 }).default('0'),
  discountApplied: decimal("discount_applied", { precision: 10, scale: 2 }).default('0'),
  paymentTerms: text("payment_terms"), // "Net 30", "Due on receipt", etc.
  lastReminderSent: timestamp("last_reminder_sent"),
  reminderCount: integer("reminder_count").default(0),
  createdBy: uuid("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Payment Records for Patient Bills
export const patientPayments = pgTable("patient_payments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  patientBillId: uuid("patient_bill_id").references(() => patientBills.id).notNull(),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  currency: currencyEnum("currency").notNull().default("USD"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(), // cash, check, credit_card, bank_transfer, online
  paymentReference: text("payment_reference"), // transaction ID, check number, etc.
  paymentDate: timestamp("payment_date").notNull(),
  processedBy: uuid("processed_by").references(() => users.id),
  notes: text("notes"),
  refundAmount: decimal("refund_amount", { precision: 10, scale: 2 }).default('0'),
  refundDate: timestamp("refund_date"),
  refundReason: text("refund_reason"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Achievement System Tables
export const achievements = pgTable("achievements", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: achievementTypeEnum("type").notNull(),
  difficulty: achievementDifficultyEnum("difficulty").notNull(),
  points: integer("points").notNull().default(0),
  iconName: text("icon_name").notNull(), // Lucide icon name
  criteria: jsonb("criteria").notNull(), // JSON criteria for achievement
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

export const userAchievements = pgTable("user_achievements", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  achievementId: uuid("achievement_id").references(() => achievements.id).notNull(),
  progress: integer("progress").default(0), // Current progress toward achievement
  maxProgress: integer("max_progress").notNull(), // Target progress to complete
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  earnedAt: timestamp("earned_at").default(sql`CURRENT_TIMESTAMP`)
});

export const userStats = pgTable("user_stats", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  level: integer("level").default(1),
  totalPoints: integer("total_points").default(0),
  testsCompleted: integer("tests_completed").default(0),
  averageCompletionTime: integer("average_completion_time").default(0), // in minutes
  qualityScore: decimal("quality_score", { precision: 5, scale: 2 }).default('0.00'), // 0-100
  consistencyStreak: integer("consistency_streak").default(0), // days
  lastActivityDate: timestamp("last_activity_date"),
  weeklyGoal: integer("weekly_goal").default(50), // weekly test completion goal
  monthlyGoal: integer("monthly_goal").default(200), // monthly test completion goal
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

export const leaderboards = pgTable("leaderboards", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  userName: text("user_name").notNull(),
  position: integer("position").notNull(),
  points: integer("points").notNull(),
  level: integer("level").notNull(),
  testsCompleted: integer("tests_completed").notNull(),
  qualityScore: decimal("quality_score", { precision: 5, scale: 2 }).notNull(),
  period: text("period").notNull(), // daily, weekly, monthly, all-time
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
});

export const activityLogs = pgTable("activity_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  activityType: text("activity_type").notNull(), // lab_test_completed, achievement_earned, streak_milestone, etc.
  points: integer("points").default(0),
  metadata: jsonb("metadata"), // Additional activity-specific data
  timestamp: timestamp("timestamp").default(sql`CURRENT_TIMESTAMP`)
});

// Medical Suppliers Registration table
export const medicalSuppliers = pgTable("medical_suppliers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  companyName: text("company_name").notNull(),
  organizationSlug: text("organization_slug").notNull().unique(), // URL-friendly unique identifier for authentication
  businessType: text("business_type").notNull(),
  contactPersonName: text("contact_person_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone").notNull(),
  websiteUrl: text("website_url"),
  businessAddress: text("business_address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  country: text("country").notNull(),
  zipCode: text("zip_code").notNull(),
  businessDescription: text("business_description").notNull(),
  productCategories: text("product_categories").array().default([]),
  yearsInBusiness: text("years_in_business").notNull(),
  numberOfEmployees: text("number_of_employees").notNull(),
  annualRevenue: text("annual_revenue").notNull(),
  certifications: text("certifications").array().default([]),
  // Authentication credentials for supplier login
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  status: supplierStatusEnum("status").default("pending_review").notNull(),
  termsAccepted: boolean("terms_accepted").notNull(),
  marketingConsent: boolean("marketing_consent").default(false),
  tenantId: uuid("tenant_id").references(() => tenants.id), // Will be set when approved
  approvedBy: uuid("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  rejectedAt: timestamp("rejected_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Department Relations
export const departmentsRelations = relations(departments, ({ one }) => ({
  tenant: one(tenants, {
    fields: [departments.tenantId],
    references: [tenants.id]
  }),
  headOfDepartment: one(users, {
    fields: [departments.headOfDepartment],
    references: [users.id]
  })
}));



// Relations
export const tenantsRelations = relations(tenants, ({ one, many }) => ({
  country: one(countries, {
    fields: [tenants.countryId],
    references: [countries.id]
  }),
  users: many(users),
  patients: many(patients),
  appointments: many(appointments),
  prescriptions: many(prescriptions),
  labOrders: many(labOrders),
  insuranceClaims: many(insuranceClaims),
  insuranceProviders: many(insuranceProviders),
  patientInsurance: many(patientInsurance),
  servicePrices: many(servicePrices),
  insurancePlanCoverage: many(insurancePlanCoverage),
  claimLineItems: many(claimLineItems),
  medicationCopays: many(medicationCopays),
  auditLogs: many(auditLogs),
  subscription: one(subscriptions),
  reports: many(reports),
  laboratories: many(laboratories),
  labResults: many(labResults),
  labOrderAssignments: many(labOrderAssignments),
  vitalSigns: many(vitalSigns),
  visitSummaries: many(visitSummaries),
  patientCheckIns: many(patientCheckIns),
  patientBills: many(patientBills),
  patientPayments: many(patientPayments),
  hospitalBills: many(hospitalBills),
  pharmacyBills: many(pharmacyBills),
  financialTransactions: many(financialTransactions),
  userAchievements: many(userAchievements),
  userStats: many(userStats),
  leaderboards: many(leaderboards),
  activityLogs: many(activityLogs),
  departments: many(departments)
}));

export const insuranceProvidersRelations = relations(insuranceProviders, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [insuranceProviders.tenantId],
    references: [tenants.id]
  }),
  patientInsurance: many(patientInsurance),
  coverages: many(insurancePlanCoverage)
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
  claims: many(insuranceClaims),
  medicationCopays: many(medicationCopays)
}));

export const servicePricesRelations = relations(servicePrices, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [servicePrices.tenantId],
    references: [tenants.id]
  }),
  coverages: many(insurancePlanCoverage),
  claimLineItems: many(claimLineItems)
}));

export const insurancePlanCoverageRelations = relations(insurancePlanCoverage, ({ one }) => ({
  tenant: one(tenants, {
    fields: [insurancePlanCoverage.tenantId],
    references: [tenants.id]
  }),
  insuranceProvider: one(insuranceProviders, {
    fields: [insurancePlanCoverage.insuranceProviderId],
    references: [insuranceProviders.id]
  }),
  servicePrice: one(servicePrices, {
    fields: [insurancePlanCoverage.servicePriceId],
    references: [servicePrices.id]
  })
}));

export const claimLineItemsRelations = relations(claimLineItems, ({ one }) => ({
  tenant: one(tenants, {
    fields: [claimLineItems.tenantId],
    references: [tenants.id]
  }),
  claim: one(insuranceClaims, {
    fields: [claimLineItems.claimId],
    references: [insuranceClaims.id]
  }),
  servicePrice: one(servicePrices, {
    fields: [claimLineItems.servicePriceId],
    references: [servicePrices.id]
  })
}));

export const insuranceClaimsRelations = relations(insuranceClaims, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [insuranceClaims.tenantId],
    references: [tenants.id]
  }),
  patient: one(patients, {
    fields: [insuranceClaims.patientId],
    references: [patients.id]
  }),
  appointment: one(appointments, {
    fields: [insuranceClaims.appointmentId],
    references: [appointments.id]
  }),
  patientInsurance: one(patientInsurance, {
    fields: [insuranceClaims.patientInsuranceId],
    references: [patientInsurance.id]
  }),
  lineItems: many(claimLineItems)
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
  labOrderAssignments: many(labOrderAssignments),
  vitalSignsRecorded: many(vitalSigns, { relationName: "recordedBy" }),
  visitSummariesAsProvider: many(visitSummaries, { relationName: "providerSummaries" }),
  medicationCopaysAsDefined: many(medicationCopays, { relationName: "pharmacistCopays" }),
  userAchievements: many(userAchievements),
  userStats: many(userStats),
  leaderboards: many(leaderboards),
  activityLogs: many(activityLogs)
}));

export const pharmaciesRelations = relations(pharmacies, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [pharmacies.tenantId],
    references: [tenants.id]
  }),
  patients: many(patients)
}));

export const patientsRelations = relations(patients, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [patients.tenantId],
    references: [tenants.id]
  }),
  preferredPharmacy: one(pharmacies, {
    fields: [patients.preferredPharmacyId],
    references: [pharmacies.id]
  }),
  appointments: many(appointments),
  prescriptions: many(prescriptions),
  labOrders: many(labOrders),
  insuranceClaims: many(insuranceClaims),
  labResults: many(labResults),
  vitalSigns: many(vitalSigns),
  medicationCopays: many(medicationCopays),
  visitSummaries: many(visitSummaries),
  patientBills: many(patientBills),
  patientPayments: many(patientPayments)
}));

// Laboratory Relations
export const laboratoriesRelations = relations(laboratories, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [laboratories.tenantId],
    references: [tenants.id]
  }),
  labResults: many(labResults),
  labOrderAssignments: many(labOrderAssignments),
  approvedByUser: one(users, {
    fields: [laboratories.approvedBy],
    references: [users.id]
  })
}));

export const laboratoryApplicationsRelations = relations(laboratoryApplications, ({ one }) => ({
  reviewedByUser: one(users, {
    fields: [laboratoryApplications.reviewedBy],
    references: [users.id]
  })
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
  insuranceClaims: many(insuranceClaims),
  vitalSigns: many(vitalSigns),
  visitSummaries: many(visitSummaries)
}));



// Vital Signs Relations
export const vitalSignsRelations = relations(vitalSigns, ({ one }) => ({
  tenant: one(tenants, {
    fields: [vitalSigns.tenantId],
    references: [tenants.id]
  }),
  patient: one(patients, {
    fields: [vitalSigns.patientId],
    references: [patients.id]
  }),
  appointment: one(appointments, {
    fields: [vitalSigns.appointmentId],
    references: [appointments.id]
  }),
  recordedBy: one(users, {
    fields: [vitalSigns.recordedBy],
    references: [users.id],
    relationName: "recordedBy"
  })
}));

// Patient Check-ins Relations
export const patientCheckInsRelations = relations(patientCheckIns, ({ one }) => ({
  tenant: one(tenants, {
    fields: [patientCheckIns.tenantId],
    references: [tenants.id]
  }),
  patient: one(patients, {
    fields: [patientCheckIns.patientId],
    references: [patients.id]
  }),
  appointment: one(appointments, {
    fields: [patientCheckIns.appointmentId],
    references: [appointments.id]
  }),
  vitalSigns: one(vitalSigns, {
    fields: [patientCheckIns.vitalSignsId],
    references: [vitalSigns.id]
  }),
  questionnaire: one(specialtyQuestionnaires, {
    fields: [patientCheckIns.questionnaireId],
    references: [specialtyQuestionnaires.id]
  }),
  checkedInBy: one(users, {
    fields: [patientCheckIns.checkedInBy],
    references: [users.id],
    relationName: "checkedInBy"
  })
}));



// Medication Copays Relations
export const medicationCopaysRelations = relations(medicationCopays, ({ one }) => ({
  tenant: one(tenants, {
    fields: [medicationCopays.tenantId],
    references: [tenants.id]
  }),
  patient: one(patients, {
    fields: [medicationCopays.patientId],
    references: [patients.id]
  }),
  patientInsurance: one(patientInsurance, {
    fields: [medicationCopays.patientInsuranceId],
    references: [patientInsurance.id]
  }),
  prescription: one(prescriptions, {
    fields: [medicationCopays.prescriptionId],
    references: [prescriptions.id]
  }),
  definedBy: one(users, {
    fields: [medicationCopays.definedByPharmacist],
    references: [users.id],
    relationName: "pharmacistCopays"
  })
}));

// Visit Summaries Relations
export const visitSummariesRelations = relations(visitSummaries, ({ one }) => ({
  tenant: one(tenants, {
    fields: [visitSummaries.tenantId],
    references: [tenants.id]
  }),
  patient: one(patients, {
    fields: [visitSummaries.patientId],
    references: [patients.id]
  }),
  appointment: one(appointments, {
    fields: [visitSummaries.appointmentId],
    references: [appointments.id]
  }),
  provider: one(users, {
    fields: [visitSummaries.providerId],
    references: [users.id],
    relationName: "providerSummaries"
  }),
  vitalSigns: one(vitalSigns, {
    fields: [visitSummaries.vitalSignsId],
    references: [vitalSigns.id]
  })
}));

// Patient Bills Relations
export const patientBillsRelations = relations(patientBills, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [patientBills.tenantId],
    references: [tenants.id]
  }),
  patient: one(patients, {
    fields: [patientBills.patientId],
    references: [patients.id]
  }),
  appointment: one(appointments, {
    fields: [patientBills.appointmentId],
    references: [appointments.id]
  }),
  prescription: one(prescriptions, {
    fields: [patientBills.prescriptionId],
    references: [prescriptions.id]
  }),
  labOrder: one(labOrders, {
    fields: [patientBills.labOrderId],
    references: [labOrders.id]
  }),
  servicePrice: one(servicePrices, {
    fields: [patientBills.servicePriceId],
    references: [servicePrices.id]
  }),
  insuranceClaim: one(insuranceClaims, {
    fields: [patientBills.insuranceClaimId],
    references: [insuranceClaims.id]
  }),
  createdByUser: one(users, {
    fields: [patientBills.createdBy],
    references: [users.id]
  }),
  payments: many(patientPayments)
}));

// Patient Payments Relations
export const patientPaymentsRelations = relations(patientPayments, ({ one }) => ({
  tenant: one(tenants, {
    fields: [patientPayments.tenantId],
    references: [tenants.id]
  }),
  patientBill: one(patientBills, {
    fields: [patientPayments.patientBillId],
    references: [patientBills.id]
  }),
  patient: one(patients, {
    fields: [patientPayments.patientId],
    references: [patients.id]
  }),
  processedByUser: one(users, {
    fields: [patientPayments.processedBy],
    references: [users.id]
  })
}));

// Achievement System Relations
export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements)
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id]
  }),
  tenant: one(tenants, {
    fields: [userAchievements.tenantId],
    references: [tenants.id]
  }),
  achievement: one(achievements, {
    fields: [userAchievements.achievementId],
    references: [achievements.id]
  })
}));

export const userStatsRelations = relations(userStats, ({ one }) => ({
  user: one(users, {
    fields: [userStats.userId],
    references: [users.id]
  }),
  tenant: one(tenants, {
    fields: [userStats.tenantId],
    references: [tenants.id]
  })
}));

export const leaderboardsRelations = relations(leaderboards, ({ one }) => ({
  user: one(users, {
    fields: [leaderboards.userId],
    references: [users.id]
  }),
  tenant: one(tenants, {
    fields: [leaderboards.tenantId],
    references: [tenants.id]
  })
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id]
  }),
  tenant: one(tenants, {
    fields: [activityLogs.tenantId],
    references: [tenants.id]
  })
}));

// Hospital Bills Relations
export const hospitalBillsRelations = relations(hospitalBills, ({ one }) => ({
  tenant: one(tenants, {
    fields: [hospitalBills.tenantId],
    references: [tenants.id]
  }),
  patient: one(patients, {
    fields: [hospitalBills.patientId],
    references: [patients.id]
  }),
  appointment: one(appointments, {
    fields: [hospitalBills.appointmentId],
    references: [appointments.id]
  }),
  generatedByUser: one(users, {
    fields: [hospitalBills.generatedBy],
    references: [users.id]
  })
}));

// Pharmacy Bills Relations
export const pharmacyBillsRelations = relations(pharmacyBills, ({ one }) => ({
  tenant: one(tenants, {
    fields: [pharmacyBills.tenantId],
    references: [tenants.id]
  }),
  patient: one(patients, {
    fields: [pharmacyBills.patientId],
    references: [patients.id]
  }),
  prescription: one(prescriptions, {
    fields: [pharmacyBills.prescriptionId],
    references: [prescriptions.id]
  }),
  generatedByUser: one(users, {
    fields: [pharmacyBills.generatedBy],
    references: [users.id]
  })
}));

// Financial Transactions Relations
export const financialTransactionsRelations = relations(financialTransactions, ({ one }) => ({
  tenant: one(tenants, {
    fields: [financialTransactions.tenantId],
    references: [tenants.id]
  }),
  patient: one(patients, {
    fields: [financialTransactions.patientId],
    references: [patients.id]
  }),
  recordedByUser: one(users, {
    fields: [financialTransactions.recordedBy],
    references: [users.id]
  }),
  approvedByUser: one(users, {
    fields: [financialTransactions.approvedBy],
    references: [users.id]
  })
}));

// Work Shifts Relations
export const workShiftsRelations = relations(workShifts, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [workShifts.tenantId],
    references: [tenants.id]
  }),
  user: one(users, {
    fields: [workShifts.userId],
    references: [users.id]
  }),
  archivedRecords: many(archivedRecords)
}));

// Pharmacy Patient Insurance Relations
export const pharmacyPatientInsuranceRelations = relations(pharmacyPatientInsurance, ({ one }) => ({
  tenant: one(tenants, {
    fields: [pharmacyPatientInsurance.tenantId],
    references: [tenants.id]
  }),
  patient: one(patients, {
    fields: [pharmacyPatientInsurance.patientId],
    references: [patients.id]
  }),
  verifiedByUser: one(users, {
    fields: [pharmacyPatientInsurance.verifiedBy],
    references: [users.id]
  })
}));

// Archived Records Relations
export const archivedRecordsRelations = relations(archivedRecords, ({ one }) => ({
  tenant: one(tenants, {
    fields: [archivedRecords.tenantId],
    references: [tenants.id]
  }),
  workShift: one(workShifts, {
    fields: [archivedRecords.workShiftId],
    references: [workShifts.id]
  }),
  patient: one(patients, {
    fields: [archivedRecords.patientId],
    references: [patients.id]
  }),
  archivedByUser: one(users, {
    fields: [archivedRecords.archivedBy],
    references: [users.id],
    relationName: "archivedBy"
  }),
  lastAccessedByUser: one(users, {
    fields: [archivedRecords.lastAccessedBy],
    references: [users.id],
    relationName: "lastAccessedBy"
  })
}));

// Pharmacy Report Templates Relations
export const pharmacyReportTemplatesRelations = relations(pharmacyReportTemplates, ({ one }) => ({
  tenant: one(tenants, {
    fields: [pharmacyReportTemplates.tenantId],
    references: [tenants.id]
  }),
  createdByUser: one(users, {
    fields: [pharmacyReportTemplates.createdBy],
    references: [users.id]
  })
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

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({
  id: true,
  createdAt: true
});

export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
  tenantPatientId: true, // Auto-generated per tenant
  createdAt: true,
  updatedAt: true
});

export const insertCrossTenantPatientSchema = createInsertSchema(crossTenantPatients).omit({
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

export const insertPharmacySchema = createInsertSchema(pharmacies).omit({
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

// Simple working schema for insurance claims
export const insertInsuranceClaimSchema = z.object({
  tenantId: z.string().uuid(),
  patientId: z.string().uuid(),
  patientInsuranceId: z.string().uuid().nullable().optional(),
  providerId: z.string().uuid(),
  claimNumber: z.string(),
  medicalSpecialty: z.string().nullable().optional(),
  appointmentId: z.string().uuid().nullable().optional(),
  visitSummaryId: z.string().uuid().nullable().optional(),
  primaryDiagnosisCode: z.string().nullable().optional(),
  primaryDiagnosisDescription: z.string().nullable().optional(),
  secondaryDiagnosisCodes: z.array(z.object({
    code: z.string(),
    description: z.string()
  })).default([]),
  procedureCodes: z.array(z.object({
    code: z.string(),
    description: z.string(),
    amount: z.number().min(0)
  })).default([]),
  diagnosisCodes: z.array(z.string()).default([]),
  clinicalFindings: z.string().nullable().optional(),
  treatmentProvided: z.string().nullable().optional(),
  durationOfTreatment: z.string().nullable().optional(),
  medicalNecessity: z.string().nullable().optional(),
  totalAmount: z.string(),
  totalPatientCopay: z.string().default('0'),
  totalInsuranceAmount: z.string().default('0'),
  approvedAmount: z.string().nullable().optional(),
  paidAmount: z.string().nullable().optional(),
  status: z.enum(['draft', 'submitted', 'processing', 'approved', 'denied', 'paid']).default('draft'),
  submittedDate: z.date().nullable().optional(),
  processedDate: z.date().nullable().optional(),
  paidDate: z.date().nullable().optional(),
  rejectionReason: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  attachments: z.array(z.any()).default([])
});

// Enhanced claim form schema for frontend
export const claimFormSchema = z.object({
  primaryDiagnosisCode: z.string().min(1, "Primary diagnosis code is required"),
  primaryDiagnosisDescription: z.string().min(1, "Primary diagnosis description is required"),
  secondaryDiagnosisCodes: z.array(z.object({
    code: z.string(),
    description: z.string()
  })).default([]),
  procedureCodes: z.array(z.object({
    code: z.string(),
    description: z.string(),
    amount: z.number().min(0)
  })).min(1, "At least one procedure is required"),
  clinicalFindings: z.string().min(1, "Clinical findings are required"),
  treatmentProvided: z.string().min(1, "Treatment provided is required"),
  durationOfTreatment: z.string().optional(),
  medicalNecessity: z.string().min(1, "Medical necessity justification is required"),
  notes: z.string().optional()
});
export type ClaimFormData = z.infer<typeof claimFormSchema>;

export const insertServicePriceSchema = createInsertSchema(servicePrices).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertInsurancePlanCoverageSchema = createInsertSchema(insurancePlanCoverage).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertClaimLineItemSchema = createInsertSchema(claimLineItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertMedicationCopaySchema = createInsertSchema(medicationCopays).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertVitalSignsSchema = createInsertSchema(vitalSigns).omit({
  id: true,
  createdAt: true
});

export const insertVisitSummarySchema = createInsertSchema(visitSummaries).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertPatientCheckInSchema = createInsertSchema(patientCheckIns).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertRolePermissionSchema = createInsertSchema(rolePermissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertPatientBillSchema = createInsertSchema(patientBills).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertPatientPaymentSchema = createInsertSchema(patientPayments).omit({
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
  updatedAt: true,
  approvedAt: true
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

export const insertLaboratoryApplicationSchema = createInsertSchema(laboratoryApplications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  reviewedAt: true
});

// AI Health Recommendations Insert Schemas
export const insertHealthRecommendationSchema = createInsertSchema(healthRecommendations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  acknowledgedAt: true
});

export const insertHealthAnalysisSchema = createInsertSchema(healthAnalyses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  reviewedAt: true
});

// New Insert Schemas for advanced features
export const insertPricingPlanSchema = createInsertSchema(pricingPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertOfflineSyncDataSchema = createInsertSchema(offlineSyncData).omit({
  id: true,
  createdAt: true
});

export const insertTranslationSchema = createInsertSchema(translations).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Types
export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = z.infer<typeof insertTenantSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = typeof users.$inferInsert;

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;

export type CrossTenantPatient = typeof crossTenantPatients.$inferSelect;
export type InsertCrossTenantPatient = z.infer<typeof insertCrossTenantPatientSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export type Prescription = typeof prescriptions.$inferSelect;
export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;

export type LabOrder = typeof labOrders.$inferSelect;
export type InsertLabOrder = z.infer<typeof insertLabOrderSchema>;

export type Pharmacy = typeof pharmacies.$inferSelect;
export type InsertPharmacy = z.infer<typeof insertPharmacySchema>;

export type InsuranceProvider = typeof insuranceProviders.$inferSelect;
export type InsertInsuranceProvider = z.infer<typeof insertInsuranceProviderSchema>;

export type PatientInsurance = typeof patientInsurance.$inferSelect;
export type InsertPatientInsurance = z.infer<typeof insertPatientInsuranceSchema>;

export type InsuranceClaim = typeof insuranceClaims.$inferSelect;
export type InsertInsuranceClaim = z.infer<typeof insertInsuranceClaimSchema>;

export type ServicePrice = typeof servicePrices.$inferSelect;
export type InsertServicePrice = z.infer<typeof insertServicePriceSchema>;

export type InsurancePlanCoverage = typeof insurancePlanCoverage.$inferSelect;
export type InsertInsurancePlanCoverage = z.infer<typeof insertInsurancePlanCoverageSchema>;

export type ClaimLineItem = typeof claimLineItems.$inferSelect;
export type InsertClaimLineItem = z.infer<typeof insertClaimLineItemSchema>;

export type MedicationCopay = typeof medicationCopays.$inferSelect;
export type InsertMedicationCopay = z.infer<typeof insertMedicationCopaySchema>;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

export type AuditLog = typeof auditLogs.$inferSelect;

// New types for advanced features
export type PricingPlan = typeof pricingPlans.$inferSelect;
export type InsertPricingPlan = z.infer<typeof insertPricingPlanSchema>;

export type OfflineSyncData = typeof offlineSyncData.$inferSelect;
export type InsertOfflineSyncData = z.infer<typeof insertOfflineSyncDataSchema>;

export type Translation = typeof translations.$inferSelect;
export type InsertTranslation = z.infer<typeof insertTranslationSchema>;

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

export type LaboratoryApplication = typeof laboratoryApplications.$inferSelect;
export type InsertLaboratoryApplication = z.infer<typeof insertLaboratoryApplicationSchema>;

// Vital Signs and Visit Summary Types
export type VitalSigns = typeof vitalSigns.$inferSelect;
export type InsertVitalSigns = z.infer<typeof insertVitalSignsSchema>;

export type VisitSummary = typeof visitSummaries.$inferSelect;
export type InsertVisitSummary = z.infer<typeof insertVisitSummarySchema>;

export type PatientBill = typeof patientBills.$inferSelect;
export type InsertPatientBill = z.infer<typeof insertPatientBillSchema>;

export type PatientPayment = typeof patientPayments.$inferSelect;
export type InsertPatientPayment = z.infer<typeof insertPatientPaymentSchema>;

// ARGILETTE LAB Health Recommendations Types
export type HealthRecommendation = typeof healthRecommendations.$inferSelect;
export type InsertHealthRecommendation = z.infer<typeof insertHealthRecommendationSchema>;

export type HealthAnalysis = typeof healthAnalyses.$inferSelect;
export type InsertHealthAnalysis = z.infer<typeof insertHealthAnalysisSchema>;

export type PatientCheckIn = typeof patientCheckIns.$inferSelect;
export type InsertPatientCheckIn = z.infer<typeof insertPatientCheckInSchema>;

export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;

// Pharmacy Receipt Types
export const insertPharmacyReceiptSchema = createInsertSchema(pharmacyReceipts);
export type PharmacyReceipt = typeof pharmacyReceipts.$inferSelect;
export type InsertPharmacyReceipt = z.infer<typeof insertPharmacyReceiptSchema>;

// Laboratory Bill Types
export const insertLabBillSchema = createInsertSchema(labBills);
export type LabBill = typeof labBills.$inferSelect;
export type InsertLabBill = z.infer<typeof insertLabBillSchema>;

// Hospital Bill Types
export const insertHospitalBillSchema = createInsertSchema(hospitalBills);
export type HospitalBill = typeof hospitalBills.$inferSelect;
export type InsertHospitalBill = z.infer<typeof insertHospitalBillSchema>;

// Pharmacy Bill Types
export const insertPharmacyBillSchema = createInsertSchema(pharmacyBills);
export type PharmacyBill = typeof pharmacyBills.$inferSelect;
export type InsertPharmacyBill = z.infer<typeof insertPharmacyBillSchema>;

// Financial Transaction Types
export const insertFinancialTransactionSchema = createInsertSchema(financialTransactions);
export type FinancialTransaction = typeof financialTransactions.$inferSelect;
export type InsertFinancialTransaction = z.infer<typeof insertFinancialTransactionSchema>;

// Achievement System Schemas and Types
export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  earnedAt: true
});

export const insertUserStatsSchema = createInsertSchema(userStats).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertLeaderboardSchema = createInsertSchema(leaderboards).omit({
  id: true,
  createdAt: true
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  timestamp: true
});

// Patient Access Request Insert Schemas
export const insertPatientAccessRequestSchema = createInsertSchema(patientAccessRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  requestedDate: true,
  reviewedDate: true
});

export const insertPatientAccessAuditLogSchema = createInsertSchema(patientAccessAuditLog).omit({
  id: true,
  accessedAt: true
});

// Achievement System Types
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;

export type UserStats = typeof userStats.$inferSelect;
export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;

export type Leaderboard = typeof leaderboards.$inferSelect;
export type InsertLeaderboard = z.infer<typeof insertLeaderboardSchema>;

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;

// Patient Access Request System Types
export type PatientAccessRequest = typeof patientAccessRequests.$inferSelect;
export type InsertPatientAccessRequest = z.infer<typeof insertPatientAccessRequestSchema>;

export type PatientAccessAuditLog = typeof patientAccessAuditLog.$inferSelect;
export type InsertPatientAccessAuditLog = z.infer<typeof insertPatientAccessAuditLogSchema>;

// Work Shifts Schema and Types
export const insertWorkShiftSchema = createInsertSchema(workShifts).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type WorkShift = typeof workShifts.$inferSelect;
export type InsertWorkShift = z.infer<typeof insertWorkShiftSchema>;

// Pharmacy Patient Insurance Schema and Types
export const insertPharmacyPatientInsuranceSchema = createInsertSchema(pharmacyPatientInsurance).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type PharmacyPatientInsurance = typeof pharmacyPatientInsurance.$inferSelect;
export type InsertPharmacyPatientInsurance = z.infer<typeof insertPharmacyPatientInsuranceSchema>;

// Archived Records Schema and Types
export const insertArchivedRecordSchema = createInsertSchema(archivedRecords).omit({
  id: true,
  createdAt: true
});

export type ArchivedRecord = typeof archivedRecords.$inferSelect;
export type InsertArchivedRecord = z.infer<typeof insertArchivedRecordSchema>;

// Pharmacy Report Templates Schema and Types
export const insertPharmacyReportTemplateSchema = createInsertSchema(pharmacyReportTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type PharmacyReportTemplate = typeof pharmacyReportTemplates.$inferSelect;
export type InsertPharmacyReportTemplate = z.infer<typeof insertPharmacyReportTemplateSchema>;

// Department Schema and Types
export const insertDepartmentSchema = createInsertSchema(departments).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type Department = typeof departments.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;

// Advertisement System Tables
export const advertisements = pgTable("advertisements", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(), // Advertiser's tenant
  companyName: text("company_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone"),
  websiteUrl: text("website_url"),
  
  // Advertisement Content
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: adCategoryEnum("category").notNull(),
  targetAudience: text("target_audience").array().default([]), // ["hospitals", "pharmacies", "laboratories"]
  keywords: text("keywords").array().default([]),
  
  // Media Assets
  imageUrls: text("image_urls").array().default([]),
  videoUrl: text("video_url"),
  brochureUrl: text("brochure_url"),
  
  // Pricing and Product Info
  priceRange: text("price_range"), // e.g., "$1,000 - $5,000"
  currency: currencyEnum("currency").default("USD"),
  productSpecifications: jsonb("product_specifications").default('{}'),
  certifications: text("certifications").array().default([]),
  
  // Advertisement Settings
  status: adStatusEnum("status").default("draft"),
  priority: adPriorityEnum("priority").default("standard"),
  billingType: adBillingTypeEnum("billing_type").default("monthly"),
  monthlyFee: decimal("monthly_fee", { precision: 10, scale: 2 }),
  clickRate: decimal("click_rate", { precision: 10, scale: 4 }), // Per click cost
  impressionRate: decimal("impression_rate", { precision: 10, scale: 6 }), // Per impression cost
  
  // Campaign Duration
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(false),
  autoRenew: boolean("auto_renew").default(false),
  
  // Analytics
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  conversions: integer("conversions").default(0),
  
  // Approval Process
  submittedAt: timestamp("submitted_at"),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  reviewNotes: text("review_notes"),
  rejectionReason: text("rejection_reason"),
  
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

export const adViews = pgTable("ad_views", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  advertisementId: uuid("advertisement_id").references(() => advertisements.id).notNull(),
  viewerTenantId: uuid("viewer_tenant_id").references(() => tenants.id),
  viewerUserId: uuid("viewer_user_id").references(() => users.id),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  
  // View Details
  viewDuration: integer("view_duration"), // seconds
  clickedThrough: boolean("clicked_through").default(false),
  conversionTracked: boolean("conversion_tracked").default(false),
  
  viewedAt: timestamp("viewed_at").default(sql`CURRENT_TIMESTAMP`)
});

export const adInquiries = pgTable("ad_inquiries", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  advertisementId: uuid("advertisement_id").references(() => advertisements.id).notNull(),
  inquirerTenantId: uuid("inquirer_tenant_id").references(() => tenants.id).notNull(),
  inquirerUserId: uuid("inquirer_user_id").references(() => users.id).notNull(),
  
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  inquirerContactInfo: jsonb("inquirer_contact_info").notNull(),
  
  status: text("status").default("pending"), // pending, responded, closed
  respondedAt: timestamp("responded_at"),
  response: text("response"),
  
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Marketplace Product Catalog - Tenant Isolated Products
export const marketplaceProducts = pgTable("marketplace_products", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  supplierTenantId: uuid("supplier_tenant_id").references(() => tenants.id).notNull(), // Medical supplier's tenant
  name: text("name").notNull(),
  sku: text("sku").notNull(), // Stock Keeping Unit - unique per supplier
  description: text("description").notNull(),
  shortDescription: text("short_description"),
  category: adCategoryEnum("category").notNull(),
  subcategory: text("subcategory"),
  brand: text("brand"),
  manufacturer: text("manufacturer"),
  
  // Pricing - Multi-currency support
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: currencyEnum("currency").default("USD"),
  compareAtPrice: decimal("compare_at_price", { precision: 10, scale: 2 }), // Original price for discount display
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }), // Supplier's cost (private)
  
  // Inventory Management
  stockQuantity: integer("stock_quantity").default(0),
  lowStockThreshold: integer("low_stock_threshold").default(10),
  trackInventory: boolean("track_inventory").default(true),
  backordersAllowed: boolean("backorders_allowed").default(false),
  
  // Product Status and Visibility
  status: productStatusEnum("status").default("draft"),
  isActive: boolean("is_active").default(false),
  isFeatured: boolean("is_featured").default(false),
  requiresPrescription: boolean("requires_prescription").default(false),
  
  // Product Specifications and Media
  specifications: jsonb("specifications").default('{}'), // Technical specs, dimensions, etc.
  features: text("features").array().default([]),
  imageUrls: text("image_urls").array().default([]),
  documentUrls: text("document_urls").array().default([]), // Manuals, certificates, etc.
  videoUrl: text("video_url"),
  
  // Regulatory and Compliance
  regulatoryApprovals: text("regulatory_approvals").array().default([]), // FDA, CE, etc.
  certifications: text("certifications").array().default([]),
  warrantPeriod: text("warranty_period"), // "2 years", "1 year", etc.
  complianceNotes: text("compliance_notes"),
  
  // SEO and Searchability
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  searchKeywords: text("search_keywords").array().default([]),
  
  // Shipping and Logistics
  weight: decimal("weight", { precision: 8, scale: 2 }), // kg
  dimensions: jsonb("dimensions").$type<{
    length: number;
    width: number;
    height: number;
    unit: string; // cm, inches
  }>(),
  shippingClass: text("shipping_class"), // standard, hazardous, fragile, etc.
  leadTime: integer("lead_time_days").default(1), // Days to process order
  
  // Analytics and Performance
  viewCount: integer("view_count").default(0),
  orderCount: integer("order_count").default(0),
  avgRating: decimal("avg_rating", { precision: 3, scale: 2 }).default("0.00"),
  totalReviews: integer("total_reviews").default(0),
  
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Marketplace Orders - Cross-tenant ordering system
export const marketplaceOrders = pgTable("marketplace_orders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: text("order_number").notNull().unique(), // Human-readable order number
  
  // Tenant Isolation: Buyer and Seller
  buyerTenantId: uuid("buyer_tenant_id").references(() => tenants.id).notNull(), // Hospital/Pharmacy/Lab placing order
  buyerUserId: uuid("buyer_user_id").references(() => users.id).notNull(), // User who placed the order
  supplierTenantId: uuid("supplier_tenant_id").references(() => tenants.id).notNull(), // Medical supplier fulfilling order
  
  // Order Details
  status: orderStatusEnum("status").default("pending"),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0.00"),
  shippingAmount: decimal("shipping_amount", { precision: 10, scale: 2 }).default("0.00"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0.00"),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  currency: currencyEnum("currency").default("USD"),
  
  // Shipping Information
  shippingAddress: jsonb("shipping_address").notNull().$type<{
    name: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    phone?: string;
  }>(),
  
  billingAddress: jsonb("billing_address").$type<{
    name: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    phone?: string;
  }>(),
  
  // Order Processing
  orderDate: timestamp("order_date").default(sql`CURRENT_TIMESTAMP`),
  expectedDeliveryDate: timestamp("expected_delivery_date"),
  actualDeliveryDate: timestamp("actual_delivery_date"),
  shippingCarrier: text("shipping_carrier"),
  trackingNumber: text("tracking_number"),
  
  // Order Notes and Communication
  buyerNotes: text("buyer_notes"),
  supplierNotes: text("supplier_notes"),
  internalNotes: text("internal_notes"), // For platform admins
  
  // Payment Information (reference to external payment system)
  paymentMethod: text("payment_method"), // credit_card, purchase_order, net_terms
  paymentStatus: text("payment_status").default("pending"), // pending, paid, failed, refunded
  paymentReference: text("payment_reference"), // External payment ID
  purchaseOrderNumber: text("purchase_order_number"),
  
  // Cancellation and Returns
  cancelledAt: timestamp("cancelled_at"),
  cancellationReason: text("cancellation_reason"),
  refundAmount: decimal("refund_amount", { precision: 10, scale: 2 }),
  refundedAt: timestamp("refunded_at"),
  
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Marketplace Order Items - Individual products in orders
export const marketplaceOrderItems = pgTable("marketplace_order_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: uuid("order_id").references(() => marketplaceOrders.id).notNull(),
  productId: uuid("product_id").references(() => marketplaceProducts.id).notNull(),
  
  // Product snapshot at time of order (prevents price/detail changes affecting historical orders)
  productName: text("product_name").notNull(),
  productSku: text("product_sku").notNull(),
  productDescription: text("product_description"),
  
  // Pricing at time of order
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull(),
  lineTotal: decimal("line_total", { precision: 12, scale: 2 }).notNull(),
  
  // Individual item status (allows partial fulfillment)
  status: orderItemStatusEnum("status").default("pending"),
  
  // Item-specific shipping
  shippedQuantity: integer("shipped_quantity").default(0),
  shippedAt: timestamp("shipped_at"),
  deliveredQuantity: integer("delivered_quantity").default(0),
  deliveredAt: timestamp("delivered_at"),
  
  // Returns and exchanges
  returnedQuantity: integer("returned_quantity").default(0),
  returnReason: text("return_reason"),
  returnedAt: timestamp("returned_at"),
  
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Product Reviews and Ratings (Cross-tenant feedback system)
export const productReviews = pgTable("product_reviews", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: uuid("product_id").references(() => marketplaceProducts.id).notNull(),
  reviewerTenantId: uuid("reviewer_tenant_id").references(() => tenants.id).notNull(), // Organization that purchased
  reviewerUserId: uuid("reviewer_user_id").references(() => users.id).notNull(), // User who wrote review
  orderId: uuid("order_id").references(() => marketplaceOrders.id), // Verified purchase
  
  rating: integer("rating").notNull(), // 1-5 stars
  title: text("title"),
  review: text("review"),
  pros: text("pros").array().default([]),
  cons: text("cons").array().default([]),
  
  // Review moderation
  isVerifiedPurchase: boolean("is_verified_purchase").default(false),
  isApproved: boolean("is_approved").default(false),
  moderatedBy: uuid("moderated_by").references(() => users.id),
  moderatedAt: timestamp("moderated_at"),
  
  // Helpfulness voting
  helpfulVotes: integer("helpful_votes").default(0),
  totalVotes: integer("total_votes").default(0),
  
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Quote Request System for Marketplace
export const quoteRequests = pgTable("quote_requests", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: uuid("product_id").references(() => marketplaceProducts.id).notNull(),
  productName: text("product_name").notNull(),
  supplierName: text("supplier_name").notNull(),
  companyName: text("company_name").notNull(),
  contactName: text("contact_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  quantity: integer("quantity").notNull(),
  message: text("message"),
  status: quoteRequestStatusEnum("status").default("pending").notNull(),
  requestedAt: timestamp("requested_at").default(sql`CURRENT_TIMESTAMP`),
  quotedPrice: decimal("quoted_price", { precision: 10, scale: 2 }),
  quotedAt: timestamp("quoted_at"),
  quotedBy: text("quoted_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// ===================================
// DICOM Medical Imaging System Tables (Phase 15)
// ===================================

// DICOM Studies - Top level imaging study container
export const dicomStudies = pgTable("dicom_studies", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  studyInstanceUID: text("study_instance_uid").notNull().unique(), // Unique DICOM identifier
  studyDate: text("study_date"), // YYYYMMDD format
  studyTime: text("study_time"), // HHMMSS format
  studyDescription: text("study_description"),
  modality: dicomModalityEnum("modality").notNull(),
  bodyPart: text("body_part"), // Body part examined
  numberOfSeries: integer("number_of_series").default(0),
  numberOfImages: integer("number_of_images").default(0),
  referringPhysician: text("referring_physician"),
  institutionName: text("institution_name"),
  status: studyStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => ({
  tenantIdx: index("dicom_studies_tenant_idx").on(table.tenantId),
  patientIdx: index("dicom_studies_patient_idx").on(table.patientId),
  studyUIDIdx: index("dicom_studies_uid_idx").on(table.studyInstanceUID),
  statusIdx: index("dicom_studies_status_idx").on(table.status)
}));

// DICOM Series - Collection of images within a study
export const dicomSeries = pgTable("dicom_series", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  studyId: uuid("study_id").references(() => dicomStudies.id, { onDelete: "cascade" }).notNull(),
  seriesInstanceUID: text("series_instance_uid").notNull().unique(), // Unique series identifier
  seriesNumber: integer("series_number"),
  seriesDescription: text("series_description"),
  modality: dicomModalityEnum("modality").notNull(),
  numberOfImages: integer("number_of_images").default(0),
  seriesDate: text("series_date"), // YYYYMMDD format
  seriesTime: text("series_time"), // HHMMSS format
  protocolName: text("protocol_name"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => ({
  studyIdx: index("dicom_series_study_idx").on(table.studyId),
  seriesUIDIdx: index("dicom_series_uid_idx").on(table.seriesInstanceUID)
}));

// DICOM Images - Individual medical images
export const dicomImages = pgTable("dicom_images", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  seriesId: uuid("series_id").references(() => dicomSeries.id, { onDelete: "cascade" }).notNull(),
  sopInstanceUID: text("sop_instance_uid").notNull().unique(), // Unique image identifier
  instanceNumber: integer("instance_number"),
  imageType: text("image_type"), // PRIMARY, SECONDARY, etc.
  rows: integer("rows"), // Image height in pixels
  columns: integer("columns"), // Image width in pixels
  bitsAllocated: integer("bits_allocated"), // 8, 16, etc.
  acquisitionDate: text("acquisition_date"), // YYYYMMDD format
  acquisitionTime: text("acquisition_time"), // HHMMSS format
  filePath: text("file_path").notNull(), // Storage path to DICOM file
  fileSize: integer("file_size"), // File size in bytes
  thumbnailPath: text("thumbnail_path"), // Path to thumbnail image
  isKeyImage: boolean("is_key_image").default(false),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => ({
  seriesIdx: index("dicom_images_series_idx").on(table.seriesId),
  sopUIDIdx: index("dicom_images_sop_uid_idx").on(table.sopInstanceUID),
  filePathIdx: index("dicom_images_file_path_idx").on(table.filePath)
}));

// PACS Connections - Configuration for external PACS systems
export const pacsConnections = pgTable("pacs_connections", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  pacsName: text("pacs_name").notNull(),
  aeTitle: text("ae_title").notNull(), // Application Entity Title
  host: text("host").notNull(), // IP address or hostname
  port: integer("port").notNull().default(11112), // DICOM port (typically 104 or 11112)
  protocol: pacsProtocolEnum("protocol").default("DICOM").notNull(),
  isActive: boolean("is_active").default(true),
  lastSync: timestamp("last_sync"),
  credentialsEncrypted: jsonb("credentials_encrypted"), // Encrypted credentials if needed
  queryRetrieveLevel: text("query_retrieve_level").default("STUDY"), // PATIENT, STUDY, SERIES, IMAGE
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  tenantIdx: index("pacs_connections_tenant_idx").on(table.tenantId),
  isActiveIdx: index("pacs_connections_active_idx").on(table.isActive)
}));

// Imaging Reports - Radiology reports for studies
export const imagingReports = pgTable("imaging_reports", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  studyId: uuid("study_id").references(() => dicomStudies.id, { onDelete: "cascade" }).notNull(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  reportedBy: uuid("reported_by").references(() => users.id).notNull(), // Radiologist
  reportDate: timestamp("report_date").default(sql`CURRENT_TIMESTAMP`).notNull(),
  clinicalIndication: text("clinical_indication"), // Reason for study
  technique: text("technique"), // Imaging technique used
  findings: text("findings").notNull(), // Detailed findings
  impression: text("impression").notNull(), // Summary/conclusion
  recommendations: text("recommendations"), // Follow-up recommendations
  status: imagingReportStatusEnum("status").default("draft").notNull(),
  priority: imagingReportPriorityEnum("priority").default("routine").notNull(),
  signedAt: timestamp("signed_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  studyIdx: index("imaging_reports_study_idx").on(table.studyId),
  tenantIdx: index("imaging_reports_tenant_idx").on(table.tenantId),
  reportedByIdx: index("imaging_reports_reported_by_idx").on(table.reportedBy),
  statusIdx: index("imaging_reports_status_idx").on(table.status)
}));

// DICOM Annotations - User annotations on images
export const dicomAnnotations = pgTable("dicom_annotations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  imageId: uuid("image_id").references(() => dicomImages.id, { onDelete: "cascade" }).notNull(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  annotationType: dicomAnnotationTypeEnum("annotation_type").notNull(),
  annotationData: jsonb("annotation_data").notNull(), // Coordinates, measurements, etc.
  description: text("description"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull()
}, (table) => ({
  imageIdx: index("dicom_annotations_image_idx").on(table.imageId),
  tenantIdx: index("dicom_annotations_tenant_idx").on(table.tenantId),
  userIdx: index("dicom_annotations_user_idx").on(table.userId)
}));

// ===================================
// Advanced Analytics & BI Tables (Phase 13)
// ===================================

export const analyticsMetrics = pgTable("analytics_metrics", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  metricType: metricTypeEnum("metric_type").notNull(),
  metricName: text("metric_name").notNull(),
  value: decimal("value", { precision: 15, scale: 2 }).notNull(),
  unit: text("unit"), // %, $, patients, hours, etc.
  period: metricPeriodEnum("period").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  metadata: jsonb("metadata"), // Additional context like department, service type, etc.
  calculatedAt: timestamp("calculated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
});

export const predictiveModels = pgTable("predictive_models", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  modelName: text("model_name").notNull(),
  modelType: predictiveModelTypeEnum("model_type").notNull(),
  algorithm: text("algorithm").notNull(), // logistic_regression, random_forest, etc.
  accuracy: decimal("accuracy", { precision: 5, scale: 2 }), // Model accuracy percentage
  lastTrained: timestamp("last_trained"),
  predictions: jsonb("predictions"), // Store latest predictions
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

export const biReports = pgTable("bi_reports", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  reportName: text("report_name").notNull(),
  reportType: reportTypeEnum("report_type").notNull(),
  parameters: jsonb("parameters"), // Filters, date ranges, departments, etc.
  schedule: reportScheduleEnum("schedule").default("once"),
  lastGenerated: timestamp("last_generated"),
  recipients: jsonb("recipients"), // Array of email addresses
  format: reportFormatEnum("format").default("pdf"),
  filePath: text("file_path"), // Path to generated file
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

export const dashboardWidgets = pgTable("dashboard_widgets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  widgetType: widgetTypeEnum("widget_type").notNull(),
  configuration: jsonb("configuration").notNull(), // Chart config, data source, filters, etc.
  position: integer("position").default(0), // Order on dashboard
  size: text("size").default("medium"), // small, medium, large, full
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

export const dataExports = pgTable("data_exports", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  exportName: text("export_name").notNull(),
  dataSource: text("data_source").notNull(), // patients, appointments, prescriptions, etc.
  filters: jsonb("filters"), // Query filters
  format: reportFormatEnum("format").notNull(),
  status: exportStatusEnum("status").default("pending").notNull(),
  filePath: text("file_path"),
  requestedBy: uuid("requested_by").references(() => users.id).notNull(),
  requestedAt: timestamp("requested_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  completedAt: timestamp("completed_at"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
});

// Marketplace Relations
export const marketplaceProductsRelations = relations(marketplaceProducts, ({ one, many }) => ({
  supplierTenant: one(tenants, {
    fields: [marketplaceProducts.supplierTenantId],
    references: [tenants.id]
  }),
  orderItems: many(marketplaceOrderItems),
  reviews: many(productReviews)
}));

export const marketplaceOrdersRelations = relations(marketplaceOrders, ({ one, many }) => ({
  buyerTenant: one(tenants, {
    fields: [marketplaceOrders.buyerTenantId],
    references: [tenants.id]
  }),
  supplierTenant: one(tenants, {
    fields: [marketplaceOrders.supplierTenantId],
    references: [tenants.id]
  }),
  buyerUser: one(users, {
    fields: [marketplaceOrders.buyerUserId],
    references: [users.id]
  }),
  orderItems: many(marketplaceOrderItems),
  reviews: many(productReviews)
}));

export const marketplaceOrderItemsRelations = relations(marketplaceOrderItems, ({ one }) => ({
  order: one(marketplaceOrders, {
    fields: [marketplaceOrderItems.orderId],
    references: [marketplaceOrders.id]
  }),
  product: one(marketplaceProducts, {
    fields: [marketplaceOrderItems.productId],
    references: [marketplaceProducts.id]
  })
}));

export const productReviewsRelations = relations(productReviews, ({ one }) => ({
  product: one(marketplaceProducts, {
    fields: [productReviews.productId],
    references: [marketplaceProducts.id]
  }),
  reviewerTenant: one(tenants, {
    fields: [productReviews.reviewerTenantId],
    references: [tenants.id]
  }),
  reviewerUser: one(users, {
    fields: [productReviews.reviewerUserId],
    references: [users.id]
  }),
  order: one(marketplaceOrders, {
    fields: [productReviews.orderId],
    references: [marketplaceOrders.id]
  }),
  moderatedByUser: one(users, {
    fields: [productReviews.moderatedBy],
    references: [users.id]
  })
}));

// Advertisement Relations
export const advertisementsRelations = relations(advertisements, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [advertisements.tenantId],
    references: [tenants.id]
  }),
  reviewedByUser: one(users, {
    fields: [advertisements.reviewedBy],
    references: [users.id]
  }),
  views: many(adViews),
  inquiries: many(adInquiries)
}));

export const adViewsRelations = relations(adViews, ({ one }) => ({
  advertisement: one(advertisements, {
    fields: [adViews.advertisementId],
    references: [advertisements.id]
  }),
  viewerTenant: one(tenants, {
    fields: [adViews.viewerTenantId],
    references: [tenants.id]
  }),
  viewerUser: one(users, {
    fields: [adViews.viewerUserId],
    references: [users.id]
  })
}));

export const adInquiriesRelations = relations(adInquiries, ({ one }) => ({
  advertisement: one(advertisements, {
    fields: [adInquiries.advertisementId],
    references: [advertisements.id]
  }),
  inquirerTenant: one(tenants, {
    fields: [adInquiries.inquirerTenantId],
    references: [tenants.id]  
  }),
  inquirerUser: one(users, {
    fields: [adInquiries.inquirerUserId],
    references: [users.id]
  })
}));

// Country and Medical Codes Relations
export const countriesRelations = relations(countries, ({ many }) => ({
  tenants: many(tenants),
  medicalCodes: many(countryMedicalCodes),
  codeUploads: many(medicalCodeUploads)
}));

export const countryMedicalCodesRelations = relations(countryMedicalCodes, ({ one }) => ({
  country: one(countries, {
    fields: [countryMedicalCodes.countryId],
    references: [countries.id]
  }),
  uploadedByUser: one(users, {
    fields: [countryMedicalCodes.uploadedBy],
    references: [users.id]
  })
}));

export const medicalCodeUploadsRelations = relations(medicalCodeUploads, ({ one }) => ({
  country: one(countries, {
    fields: [medicalCodeUploads.countryId],
    references: [countries.id]
  }),
  uploadedByUser: one(users, {
    fields: [medicalCodeUploads.uploadedBy],
    references: [users.id]
  })
}));

// Advertisement Schema and Types
export const insertAdvertisementSchema = createInsertSchema(advertisements).omit({
  id: true,
  impressions: true,
  clicks: true,
  conversions: true,
  reviewedAt: true,
  reviewedBy: true,
  reviewNotes: true,
  rejectionReason: true,
  createdAt: true,
  updatedAt: true
});

export const insertAdViewSchema = createInsertSchema(adViews).omit({
  id: true,
  viewedAt: true
});

export const insertAdInquirySchema = createInsertSchema(adInquiries).omit({
  id: true,
  respondedAt: true,
  response: true,
  createdAt: true,
  updatedAt: true
});

// Country and Medical Codes Insert Schemas
export const insertCountrySchema = createInsertSchema(countries).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertCountryMedicalCodeSchema = createInsertSchema(countryMedicalCodes).omit({
  id: true,
  uploadedAt: true,
  createdAt: true,
  updatedAt: true
});

export const insertMedicalCodeUploadSchema = createInsertSchema(medicalCodeUploads).omit({
  id: true,
  recordsProcessed: true,
  recordsImported: true,
  recordsSkipped: true,
  errors: true,
  status: true,
  createdAt: true,
  completedAt: true
});

// Types for new tables
export type Country = typeof countries.$inferSelect;
export type InsertCountry = z.infer<typeof insertCountrySchema>;

export type CountryMedicalCode = typeof countryMedicalCodes.$inferSelect;
export type InsertCountryMedicalCode = z.infer<typeof insertCountryMedicalCodeSchema>;

export type MedicalCodeUpload = typeof medicalCodeUploads.$inferSelect;
export type InsertMedicalCodeUpload = z.infer<typeof insertMedicalCodeUploadSchema>;

// Medical Suppliers Insert Schema
export const insertMedicalSupplierSchema = createInsertSchema(medicalSuppliers).omit({
  id: true,
  organizationSlug: true, // Generated automatically
  status: true, // Set automatically
  createdAt: true,
  updatedAt: true,
  tenantId: true,
  approvedBy: true,
  approvedAt: true,
  rejectionReason: true,
  notes: true
});

export type Advertisement = typeof advertisements.$inferSelect;
export type InsertAdvertisement = z.infer<typeof insertAdvertisementSchema>;
export type AdView = typeof adViews.$inferSelect;
export type InsertAdView = z.infer<typeof insertAdViewSchema>;
export type AdInquiry = typeof adInquiries.$inferSelect;
export type InsertAdInquiry = z.infer<typeof insertAdInquirySchema>;

// Medical Suppliers Types
export type MedicalSupplier = typeof medicalSuppliers.$inferSelect;
export type InsertMedicalSupplier = z.infer<typeof insertMedicalSupplierSchema>;

// Marketplace Insert Schemas
export const insertMarketplaceProductSchema = createInsertSchema(marketplaceProducts).omit({
  id: true,
  viewCount: true,
  orderCount: true,
  avgRating: true,
  totalReviews: true,
  createdAt: true,
  updatedAt: true
});

export const insertMarketplaceOrderSchema = createInsertSchema(marketplaceOrders).omit({
  id: true,
  orderDate: true,
  cancelledAt: true,
  refundedAt: true,
  createdAt: true,
  updatedAt: true
});

export const insertMarketplaceOrderItemSchema = createInsertSchema(marketplaceOrderItems).omit({
  id: true,
  shippedAt: true,
  deliveredAt: true,
  returnedAt: true,
  createdAt: true,
  updatedAt: true
});

export const insertProductReviewSchema = createInsertSchema(productReviews).omit({
  id: true,
  moderatedAt: true,
  helpfulVotes: true,
  totalVotes: true,
  createdAt: true,
  updatedAt: true
});

// Marketplace Types
export type MarketplaceProduct = typeof marketplaceProducts.$inferSelect;
export type InsertMarketplaceProduct = z.infer<typeof insertMarketplaceProductSchema>;

export type MarketplaceOrder = typeof marketplaceOrders.$inferSelect;
export type InsertMarketplaceOrder = z.infer<typeof insertMarketplaceOrderSchema>;

export type MarketplaceOrderItem = typeof marketplaceOrderItems.$inferSelect;
export type InsertMarketplaceOrderItem = z.infer<typeof insertMarketplaceOrderItemSchema>;

export type ProductReview = typeof productReviews.$inferSelect;
export type InsertProductReview = z.infer<typeof insertProductReviewSchema>;

// Quote request insert schema and types
export const insertQuoteRequestSchema = createInsertSchema(quoteRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type QuoteRequest = typeof quoteRequests.$inferSelect;
export type InsertQuoteRequest = z.infer<typeof insertQuoteRequestSchema>;

// Document Management Insert Schemas
export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadedAt: true,
  isDeleted: true,
  deletedAt: true,
  deletedBy: true
});

export const insertDocumentVersionSchema = createInsertSchema(documentVersions).omit({
  id: true,
  uploadedAt: true
});

export const insertESignatureRequestSchema = createInsertSchema(eSignatureRequests).omit({
  id: true,
  createdAt: true,
  signedAt: true,
  reminderSent: true
});

export const insertDocumentAnnotationSchema = createInsertSchema(documentAnnotations).omit({
  id: true,
  createdAt: true
});

// Document Management Types
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type DocumentVersion = typeof documentVersions.$inferSelect;
export type InsertDocumentVersion = z.infer<typeof insertDocumentVersionSchema>;

export type ESignatureRequest = typeof eSignatureRequests.$inferSelect;
export type InsertESignatureRequest = z.infer<typeof insertESignatureRequestSchema>;

export type DocumentAnnotation = typeof documentAnnotations.$inferSelect;
export type InsertDocumentAnnotation = z.infer<typeof insertDocumentAnnotationSchema>;

// Clinical Decision Support Insert Schemas
export const insertDrugInteractionRuleSchema = createInsertSchema(drugInteractionRules).omit({
  id: true,
  createdAt: true
});

export const insertAllergyAlertSchema = createInsertSchema(allergyAlerts).omit({
  id: true,
  createdAt: true
});

export const insertDosageWarningSchema = createInsertSchema(dosageWarnings).omit({
  id: true,
  createdAt: true
});

export const insertClinicalAlertSchema = createInsertSchema(clinicalAlerts).omit({
  id: true,
  createdAt: true,
  acknowledgedAt: true
});

// Clinical Decision Support Types
export type DrugInteractionRule = typeof drugInteractionRules.$inferSelect;
export type InsertDrugInteractionRule = z.infer<typeof insertDrugInteractionRuleSchema>;

export type AllergyAlert = typeof allergyAlerts.$inferSelect;
export type InsertAllergyAlert = z.infer<typeof insertAllergyAlertSchema>;

export type DosageWarning = typeof dosageWarnings.$inferSelect;
export type InsertDosageWarning = z.infer<typeof insertDosageWarningSchema>;

export type ClinicalAlert = typeof clinicalAlerts.$inferSelect;
export type InsertClinicalAlert = z.infer<typeof insertClinicalAlertSchema>;

// Staff Scheduling and Time Tracking Insert Schemas
export const insertStaffShiftSchema = createInsertSchema(staffShifts).omit({
  id: true,
  confirmedAt: true,
  createdAt: true,
  updatedAt: true
});

export const insertTimeLogSchema = createInsertSchema(timeLogs).omit({
  id: true,
  approvedAt: true,
  createdAt: true
});

export const insertLeaveRequestSchema = createInsertSchema(leaveRequests).omit({
  id: true,
  requestedAt: true,
  reviewedAt: true,
  createdAt: true
});

export const insertScheduleTemplateSchema = createInsertSchema(scheduleTemplates).omit({
  id: true,
  createdAt: true
});

// Staff Scheduling and Time Tracking Types
export type StaffShift = typeof staffShifts.$inferSelect;
export type InsertStaffShift = z.infer<typeof insertStaffShiftSchema>;

export type TimeLog = typeof timeLogs.$inferSelect;
export type InsertTimeLog = z.infer<typeof insertTimeLogSchema>;

export type LeaveRequest = typeof leaveRequests.$inferSelect;
export type InsertLeaveRequest = z.infer<typeof insertLeaveRequestSchema>;

export type ScheduleTemplate = typeof scheduleTemplates.$inferSelect;
export type InsertScheduleTemplate = z.infer<typeof insertScheduleTemplateSchema>;

// Inventory Management Insert Schemas
export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertInventoryBatchSchema = createInsertSchema(inventoryBatches).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertInventoryAuditSchema = createInsertSchema(inventoryAudits).omit({
  id: true,
  createdAt: true,
  completedAt: true
});

export const insertInventoryAlertSchema = createInsertSchema(inventoryAlerts).omit({
  id: true,
  createdAt: true
});

export const insertAutoReorderRuleSchema = createInsertSchema(autoReorderRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Inventory Management Types
export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;

export type InventoryBatch = typeof inventoryBatches.$inferSelect;
export type InsertInventoryBatch = z.infer<typeof insertInventoryBatchSchema>;

export type InventoryAudit = typeof inventoryAudits.$inferSelect;
export type InsertInventoryAudit = z.infer<typeof insertInventoryAuditSchema>;

export type InventoryAlert = typeof inventoryAlerts.$inferSelect;
export type InsertInventoryAlert = z.infer<typeof insertInventoryAlertSchema>;

export type AutoReorderRule = typeof autoReorderRules.$inferSelect;
export type InsertAutoReorderRule = z.infer<typeof insertAutoReorderRuleSchema>;

// Integration Framework Insert Schemas (Phase 7-11)
export const insertIntegrationPartnerSchema = createInsertSchema(integrationPartners).omit({
  id: true,
  createdAt: true
});

export const insertInsuranceEligibilityCheckSchema = createInsertSchema(insuranceEligibilityChecks).omit({
  id: true
});

export const insertEPrescriptionTransactionSchema = createInsertSchema(ePrescriptionTransactions).omit({
  id: true
});

export const insertHl7MessageSchema = createInsertSchema(hl7Messages).omit({
  id: true
});

export const insertDeviceReadingSchema = createInsertSchema(deviceReadings).omit({
  id: true
});

export const insertQualityMetricSchema = createInsertSchema(qualityMetrics).omit({
  id: true
});

// Integration Framework Types
export type IntegrationPartner = typeof integrationPartners.$inferSelect;
export type InsertIntegrationPartner = z.infer<typeof insertIntegrationPartnerSchema>;

export type InsuranceEligibilityCheck = typeof insuranceEligibilityChecks.$inferSelect;
export type InsertInsuranceEligibilityCheck = z.infer<typeof insertInsuranceEligibilityCheckSchema>;

export type EPrescriptionTransaction = typeof ePrescriptionTransactions.$inferSelect;
export type InsertEPrescriptionTransaction = z.infer<typeof insertEPrescriptionTransactionSchema>;

export type Hl7Message = typeof hl7Messages.$inferSelect;
export type InsertHl7Message = z.infer<typeof insertHl7MessageSchema>;

export type DeviceReading = typeof deviceReadings.$inferSelect;
export type InsertDeviceReading = z.infer<typeof insertDeviceReadingSchema>;

export type QualityMetric = typeof qualityMetrics.$inferSelect;
export type InsertQualityMetric = z.infer<typeof insertQualityMetricSchema>;

// Patient Engagement Insert Schemas (Phase 12)
export const insertEducationContentSchema = createInsertSchema(educationContent).omit({
  id: true,
  viewCount: true,
  createdAt: true,
  updatedAt: true
});

export const insertPatientReminderSchema = createInsertSchema(patientReminders).omit({
  id: true,
  sentAt: true,
  createdAt: true,
  updatedAt: true
});

export const insertHealthSurveySchema = createInsertSchema(healthSurveys).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertSurveyResponseSchema = createInsertSchema(surveyResponses).omit({
  id: true,
  submittedAt: true
});

// Patient Engagement Types
export type EducationContent = typeof educationContent.$inferSelect;
export type InsertEducationContent = z.infer<typeof insertEducationContentSchema>;

export type PatientReminder = typeof patientReminders.$inferSelect;
export type InsertPatientReminder = z.infer<typeof insertPatientReminderSchema>;

export type HealthSurvey = typeof healthSurveys.$inferSelect;
export type InsertHealthSurvey = z.infer<typeof insertHealthSurveySchema>;

export type SurveyResponse = typeof surveyResponses.$inferSelect;
export type InsertSurveyResponse = z.infer<typeof insertSurveyResponseSchema>;

// API Documentation System Insert Schemas (Phase 16)
export const insertApiKeySchema = createInsertSchema(apiKeys).omit({
  id: true,
  createdAt: true,
  lastUsedAt: true
});

export const insertApiUsageLogSchema = createInsertSchema(apiUsageLogs).omit({
  id: true,
  timestamp: true
});

export const insertWebhookEndpointSchema = createInsertSchema(webhookEndpoints).omit({
  id: true,
  createdAt: true,
  lastTriggered: true
});

// API Documentation System Types
export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;

export type ApiUsageLog = typeof apiUsageLogs.$inferSelect;
export type InsertApiUsageLog = z.infer<typeof insertApiUsageLogSchema>;

export type WebhookEndpoint = typeof webhookEndpoints.$inferSelect;
export type InsertWebhookEndpoint = z.infer<typeof insertWebhookEndpointSchema>;

// Advanced Analytics & BI Insert Schemas (Phase 13)
export const insertAnalyticsMetricSchema = createInsertSchema(analyticsMetrics).omit({
  id: true,
  calculatedAt: true,
  createdAt: true
});

export const insertPredictiveModelSchema = createInsertSchema(predictiveModels).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertBiReportSchema = createInsertSchema(biReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertDashboardWidgetSchema = createInsertSchema(dashboardWidgets).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertDataExportSchema = createInsertSchema(dataExports).omit({
  id: true,
  requestedAt: true,
  createdAt: true
});

// Advanced Analytics & BI Types
export type AnalyticsMetric = typeof analyticsMetrics.$inferSelect;
export type InsertAnalyticsMetric = z.infer<typeof insertAnalyticsMetricSchema>;

export type PredictiveModel = typeof predictiveModels.$inferSelect;
export type InsertPredictiveModel = z.infer<typeof insertPredictiveModelSchema>;

export type BiReport = typeof biReports.$inferSelect;
export type InsertBiReport = z.infer<typeof insertBiReportSchema>;

export type DashboardWidget = typeof dashboardWidgets.$inferSelect;
export type InsertDashboardWidget = z.infer<typeof insertDashboardWidgetSchema>;

export type DataExport = typeof dataExports.$inferSelect;
export type InsertDataExport = z.infer<typeof insertDataExportSchema>;

// DICOM Medical Imaging System Insert Schemas (Phase 15)
export const insertDicomStudySchema = createInsertSchema(dicomStudies).omit({
  id: true,
  createdAt: true
});

export const insertDicomSeriesSchema = createInsertSchema(dicomSeries).omit({
  id: true,
  createdAt: true
});

export const insertDicomImageSchema = createInsertSchema(dicomImages).omit({
  id: true,
  createdAt: true
});

export const insertPacsConnectionSchema = createInsertSchema(pacsConnections).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertImagingReportSchema = createInsertSchema(imagingReports).omit({
  id: true,
  reportDate: true,
  createdAt: true,
  updatedAt: true
});

export const insertDicomAnnotationSchema = createInsertSchema(dicomAnnotations).omit({
  id: true,
  createdAt: true
});

// DICOM Medical Imaging System Types
export type DicomStudy = typeof dicomStudies.$inferSelect;
export type InsertDicomStudy = z.infer<typeof insertDicomStudySchema>;

export type DicomSeries = typeof dicomSeries.$inferSelect;
export type InsertDicomSeries = z.infer<typeof insertDicomSeriesSchema>;

export type DicomImage = typeof dicomImages.$inferSelect;
export type InsertDicomImage = z.infer<typeof insertDicomImageSchema>;

export type PacsConnection = typeof pacsConnections.$inferSelect;
export type InsertPacsConnection = z.infer<typeof insertPacsConnectionSchema>;

export type ImagingReport = typeof imagingReports.$inferSelect;
export type InsertImagingReport = z.infer<typeof insertImagingReportSchema>;

export type DicomAnnotation = typeof dicomAnnotations.$inferSelect;
export type InsertDicomAnnotation = z.infer<typeof insertDicomAnnotationSchema>;
