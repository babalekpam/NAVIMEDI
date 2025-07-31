import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, uuid, timestamp, boolean, integer, decimal, jsonb, pgEnum } from "drizzle-orm/pg-core";
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

export const billStatusEnum = pgEnum("bill_status", [
  "pending",
  "overdue",
  "paid",
  "partial_payment",
  "cancelled",
  "refunded"
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

// Core Tables
export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: tenantTypeEnum("type").notNull(),
  subdomain: text("subdomain").unique().notNull(),
  settings: jsonb("settings").default('{}'),
  isActive: boolean("is_active").default(true),
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
  // Phone and address (moved from top level)
  phoneNumber: text("phone_number"),
  address: text("address"),
  description: text("description"),
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
  isTemporaryPassword: boolean("is_temporary_password").default(false),
  mustChangePassword: boolean("must_change_password").default(false),
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
  preferredPharmacyId: uuid("preferred_pharmacy_id").references(() => pharmacies.id),
  primaryPhysicianId: uuid("primary_physician_id").references(() => users.id), // Assigned primary doctor
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
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(), // Doctor/Hospital tenant
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  providerId: uuid("provider_id").references(() => users.id).notNull(), // Doctor who prescribed
  appointmentId: uuid("appointment_id").references(() => appointments.id),
  pharmacyTenantId: uuid("pharmacy_tenant_id").references(() => tenants.id), // Target pharmacy
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
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  processingStartedDate: timestamp("processing_started_date"),
  readyDate: timestamp("ready_date"),
  dispensedDate: timestamp("dispensed_date"),
  pharmacyNotes: text("pharmacy_notes"),
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
  patientInsuranceId: uuid("patient_insurance_id").references(() => patientInsurance.id),
  claimNumber: text("claim_number").unique().notNull(),
  procedureCodes: jsonb("procedure_codes").default('[]'),
  diagnosisCodes: jsonb("diagnosis_codes").default('[]'),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  totalPatientCopay: decimal("total_patient_copay", { precision: 10, scale: 2 }).default('0').notNull(),
  totalInsuranceAmount: decimal("total_insurance_amount", { precision: 10, scale: 2 }).default('0').notNull(),
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

// Patient Access Requests
export const patientAccessRequests = pgTable("patient_access_requests", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  requestingPhysicianId: uuid("requesting_physician_id").references(() => users.id).notNull(),
  targetPhysicianId: uuid("target_physician_id").references(() => users.id), // Chief physician or assigned doctor
  requestType: text("request_type").notNull().default('access'), // access, transfer, consultation
  reason: text("reason").notNull(),
  urgency: text("urgency").notNull().default('normal'), // low, normal, high, emergency
  status: text("status").notNull().default('pending'), // pending, approved, denied, expired
  requestedDate: timestamp("requested_date").default(sql`CURRENT_TIMESTAMP`),
  reviewedDate: timestamp("reviewed_date"),
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  reviewNotes: text("review_notes"),
  accessGrantedUntil: timestamp("access_granted_until"), // Temporary access expiry
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
  patientPayments: many(patientPayments)
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
  medicationCopaysAsDefined: many(medicationCopays, { relationName: "pharmacistCopays" })
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

export const insertInsuranceClaimSchema = createInsertSchema(insuranceClaims).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

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

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;

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

// AI Health Recommendations Types
export type HealthRecommendation = typeof healthRecommendations.$inferSelect;
export type InsertHealthRecommendation = z.infer<typeof insertHealthRecommendationSchema>;

export type HealthAnalysis = typeof healthAnalyses.$inferSelect;
export type InsertHealthAnalysis = z.infer<typeof insertHealthAnalysisSchema>;

export type PatientCheckIn = typeof patientCheckIns.$inferSelect;
export type InsertPatientCheckIn = z.infer<typeof insertPatientCheckInSchema>;

export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;
