CREATE TYPE "public"."access_request_status" AS ENUM('pending', 'approved', 'rejected', 'expired');--> statement-breakpoint
CREATE TYPE "public"."achievement_difficulty" AS ENUM('bronze', 'silver', 'gold', 'platinum', 'legendary');--> statement-breakpoint
CREATE TYPE "public"."achievement_type" AS ENUM('productivity', 'quality', 'milestone', 'consistency', 'teamwork', 'efficiency');--> statement-breakpoint
CREATE TYPE "public"."ad_billing_type" AS ENUM('monthly', 'per_click', 'per_impression', 'fixed_duration');--> statement-breakpoint
CREATE TYPE "public"."ad_category" AS ENUM('medical_devices', 'diagnostic_equipment', 'surgical_instruments', 'laboratory_equipment', 'pharmacy_supplies', 'software_solutions', 'consulting_services', 'training_programs', 'maintenance_services', 'insurance_services', 'facility_management', 'telemedicine_solutions');--> statement-breakpoint
CREATE TYPE "public"."ad_priority" AS ENUM('standard', 'featured', 'premium', 'sponsored');--> statement-breakpoint
CREATE TYPE "public"."ad_status" AS ENUM('draft', 'pending_review', 'approved', 'active', 'paused', 'expired', 'rejected', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."annotation_type" AS ENUM('highlight', 'note', 'draw', 'stamp');--> statement-breakpoint
CREATE TYPE "public"."appointment_status" AS ENUM('scheduled', 'confirmed', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show');--> statement-breakpoint
CREATE TYPE "public"."badge_status" AS ENUM('locked', 'unlocked', 'earned');--> statement-breakpoint
CREATE TYPE "public"."bill_status" AS ENUM('pending', 'overdue', 'paid', 'partial_payment', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."billing_interval" AS ENUM('monthly', 'quarterly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."claim_status" AS ENUM('draft', 'submitted', 'processing', 'approved', 'denied', 'paid');--> statement-breakpoint
CREATE TYPE "public"."communication_type" AS ENUM('medical_instruction', 'prescription_note', 'discharge_summary', 'appointment_reminder', 'lab_result', 'general_message', 'emergency_alert');--> statement-breakpoint
CREATE TYPE "public"."currency" AS ENUM('USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'CNY', 'DZD', 'AOA', 'XOF', 'BWP', 'BIF', 'XAF', 'CVE', 'KMF', 'CDF', 'DJF', 'EGP', 'ERN', 'SZL', 'ETB', 'GMD', 'GHS', 'GNF', 'KES', 'LSL', 'LRD', 'LYD', 'MGA', 'MWK', 'MRU', 'MUR', 'MAD', 'MZN', 'NAD', 'NGN', 'RWF', 'STN', 'SCR', 'SLE', 'SOS', 'ZAR', 'SSP', 'SDG', 'TZS', 'TND', 'UGX', 'ZMW', 'ZWL');--> statement-breakpoint
CREATE TYPE "public"."document_status" AS ENUM('draft', 'final', 'archived');--> statement-breakpoint
CREATE TYPE "public"."document_type" AS ENUM('medical_record', 'consent_form', 'prescription', 'lab_report', 'insurance', 'other');--> statement-breakpoint
CREATE TYPE "public"."lab_order_status" AS ENUM('ordered', 'collected', 'processing', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."medical_specialty" AS ENUM('family_medicine', 'internal_medicine', 'pediatrics', 'cardiology', 'dermatology', 'neurology', 'orthopedics', 'gynecology', 'psychiatry', 'oncology', 'emergency_medicine', 'anesthesiology', 'radiology', 'pathology', 'surgery', 'ophthalmology', 'ent', 'urology', 'endocrinology', 'gastroenterology');--> statement-breakpoint
CREATE TYPE "public"."order_item_status" AS ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned');--> statement-breakpoint
CREATE TYPE "public"."marketplace_order_status" AS ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."prescription_status" AS ENUM('prescribed', 'sent_to_pharmacy', 'received', 'insurance_verified', 'processing', 'ready', 'dispensed', 'filled', 'picked_up', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."priority_level" AS ENUM('low', 'normal', 'high', 'urgent', 'emergency');--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('draft', 'active', 'inactive', 'discontinued', 'out_of_stock');--> statement-breakpoint
CREATE TYPE "public"."quote_request_status" AS ENUM('pending', 'quoted', 'accepted', 'rejected', 'expired');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('pending', 'generating', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."report_type" AS ENUM('financial', 'operational', 'clinical', 'compliance', 'custom');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('super_admin', 'tenant_admin', 'director', 'physician', 'nurse', 'pharmacist', 'lab_technician', 'receptionist', 'billing_staff', 'insurance_manager', 'patient');--> statement-breakpoint
CREATE TYPE "public"."service_type" AS ENUM('procedure', 'consultation', 'diagnostic', 'treatment', 'laboratory', 'imaging', 'therapy', 'medication', 'emergency');--> statement-breakpoint
CREATE TYPE "public"."shift_status" AS ENUM('active', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."signature_status" AS ENUM('pending', 'signed', 'declined', 'expired');--> statement-breakpoint
CREATE TYPE "public"."subscription_plan" AS ENUM('starter', 'professional', 'enterprise', 'white_label', 'custom');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('trial', 'active', 'suspended', 'cancelled', 'expired');--> statement-breakpoint
CREATE TYPE "public"."supplier_status" AS ENUM('pending_review', 'approved', 'active', 'suspended', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."tenant_type" AS ENUM('platform', 'hospital', 'clinic', 'pharmacy', 'laboratory', 'insurance_provider', 'medical_supplier');--> statement-breakpoint
CREATE TYPE "public"."translation_status" AS ENUM('pending', 'translating', 'completed', 'failed', 'manual_review');--> statement-breakpoint
CREATE TYPE "public"."verification_status" AS ENUM('pending', 'verified', 'expired', 'denied');--> statement-breakpoint
CREATE TYPE "public"."workflow_stage" AS ENUM('queue', 'verification', 'processing', 'ready', 'completed');--> statement-breakpoint
CREATE TABLE "achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"type" "achievement_type" NOT NULL,
	"difficulty" "achievement_difficulty" NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"icon_name" text NOT NULL,
	"criteria" jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"activity_type" text NOT NULL,
	"points" integer DEFAULT 0,
	"metadata" jsonb,
	"timestamp" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "ad_inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"advertisement_id" uuid NOT NULL,
	"inquirer_tenant_id" uuid NOT NULL,
	"inquirer_user_id" uuid NOT NULL,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"inquirer_contact_info" jsonb NOT NULL,
	"status" text DEFAULT 'pending',
	"responded_at" timestamp,
	"response" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "ad_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"advertisement_id" uuid NOT NULL,
	"viewer_tenant_id" uuid,
	"viewer_user_id" uuid,
	"ip_address" text,
	"user_agent" text,
	"referrer" text,
	"view_duration" integer,
	"clicked_through" boolean DEFAULT false,
	"conversion_tracked" boolean DEFAULT false,
	"viewed_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "advertisements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"company_name" text NOT NULL,
	"contact_email" text NOT NULL,
	"contact_phone" text,
	"website_url" text,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" "ad_category" NOT NULL,
	"target_audience" text[] DEFAULT '{}',
	"keywords" text[] DEFAULT '{}',
	"image_urls" text[] DEFAULT '{}',
	"video_url" text,
	"brochure_url" text,
	"price_range" text,
	"currency" "currency" DEFAULT 'USD',
	"product_specifications" jsonb DEFAULT '{}',
	"certifications" text[] DEFAULT '{}',
	"status" "ad_status" DEFAULT 'draft',
	"priority" "ad_priority" DEFAULT 'standard',
	"billing_type" "ad_billing_type" DEFAULT 'monthly',
	"monthly_fee" numeric(10, 2),
	"click_rate" numeric(10, 4),
	"impression_rate" numeric(10, 6),
	"start_date" timestamp,
	"end_date" timestamp,
	"is_active" boolean DEFAULT false,
	"auto_renew" boolean DEFAULT false,
	"impressions" integer DEFAULT 0,
	"clicks" integer DEFAULT 0,
	"conversions" integer DEFAULT 0,
	"submitted_at" timestamp,
	"reviewed_at" timestamp,
	"reviewed_by" uuid,
	"review_notes" text,
	"rejection_reason" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"provider_id" uuid NOT NULL,
	"appointment_date" timestamp NOT NULL,
	"duration" integer DEFAULT 30,
	"type" text NOT NULL,
	"status" "appointment_status" DEFAULT 'scheduled',
	"notes" text,
	"chief_complaint" text,
	"vitals" jsonb,
	"diagnosis" jsonb DEFAULT '[]',
	"treatment_plan" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "archived_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"work_shift_id" uuid NOT NULL,
	"record_type" text NOT NULL,
	"record_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"patient_name" text NOT NULL,
	"patient_mrn" text,
	"medication_name" text,
	"prescription_number" text,
	"receipt_number" text,
	"insurance_provider" text,
	"archived_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"archived_by" uuid NOT NULL,
	"access_count" integer DEFAULT 0,
	"last_accessed_at" timestamp,
	"last_accessed_by" uuid,
	"record_data" jsonb,
	"tags" text[] DEFAULT '{}',
	"notes" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"user_id" uuid,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"action" text NOT NULL,
	"previous_data" jsonb,
	"new_data" jsonb,
	"ip_address" text,
	"user_agent" text,
	"timestamp" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "claim_line_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"claim_id" uuid NOT NULL,
	"service_price_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1,
	"unit_price" numeric(10, 2) NOT NULL,
	"total_price" numeric(10, 2) NOT NULL,
	"patient_copay" numeric(10, 2) NOT NULL,
	"insurance_amount" numeric(10, 2) NOT NULL,
	"deductible_amount" numeric(10, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "communication_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"communication_id" uuid NOT NULL,
	"language_code" text NOT NULL,
	"translated_content" jsonb NOT NULL,
	"status" "translation_status" DEFAULT 'pending',
	"translation_engine" text,
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "countries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(3) NOT NULL,
	"name" varchar(255) NOT NULL,
	"region" varchar(100),
	"is_active" boolean DEFAULT true NOT NULL,
	"cpt_code_system" varchar(50) DEFAULT 'CPT-4',
	"icd10_code_system" varchar(50) DEFAULT 'ICD-10',
	"pharmaceutical_code_system" varchar(50) DEFAULT 'NDC',
	"currency_code" varchar(3) DEFAULT 'USD',
	"date_format" varchar(20) DEFAULT 'MM/DD/YYYY',
	"time_zone" varchar(50) DEFAULT 'America/New_York',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "countries_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "country_medical_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"country_id" uuid NOT NULL,
	"code_type" varchar(20) NOT NULL,
	"code" varchar(50) NOT NULL,
	"description" text NOT NULL,
	"category" varchar(100),
	"amount" numeric(10, 2),
	"is_active" boolean DEFAULT true NOT NULL,
	"source" varchar(50),
	"uploaded_by" uuid,
	"uploaded_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "cross_tenant_patients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"original_patient_id" uuid NOT NULL,
	"original_tenant_id" uuid NOT NULL,
	"shared_with_tenant_id" uuid NOT NULL,
	"tenant_patient_id" text NOT NULL,
	"shared_by_user_id" uuid NOT NULL,
	"share_reason" text,
	"share_type" text NOT NULL,
	"access_level" text DEFAULT 'read_only',
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true,
	"share_metadata" jsonb,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "cross_tenant_patients_original_patient_id_shared_with_tenant_id_unique" UNIQUE("original_patient_id","shared_with_tenant_id")
);
--> statement-breakpoint
CREATE TABLE "currencies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" "currency" NOT NULL,
	"name" text NOT NULL,
	"symbol" text NOT NULL,
	"numeric_code" varchar(3),
	"decimal_places" integer DEFAULT 2,
	"region" text,
	"country" text,
	"is_active" boolean DEFAULT true,
	"exchange_rate_to_usd" numeric(15, 6) DEFAULT '1.000000',
	"last_updated" timestamp DEFAULT CURRENT_TIMESTAMP,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "currencies_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon" text DEFAULT 'Building2',
	"color" text DEFAULT '#3b82f6',
	"head_of_department" uuid,
	"staff_count" integer DEFAULT 0,
	"operating_hours" text DEFAULT '9:00 AM - 5:00 PM',
	"location" text,
	"phone" text,
	"email" text,
	"budget" numeric(12, 2),
	"specializations" text[] DEFAULT '{}'::text[],
	"equipment" jsonb DEFAULT '[]',
	"certifications" text[] DEFAULT '{}'::text[],
	"is_active" boolean DEFAULT true,
	"settings" jsonb DEFAULT '{}',
	"metrics" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "document_annotations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"annotation_type" "annotation_type" NOT NULL,
	"annotation_data" jsonb NOT NULL,
	"page_number" integer,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"storage_url" text NOT NULL,
	"uploaded_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"uploaded_by" uuid NOT NULL,
	"change_notes" text
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"patient_id" uuid,
	"user_id" uuid NOT NULL,
	"document_type" "document_type" NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_size" integer,
	"mime_type" varchar(100),
	"storage_url" text,
	"version" integer DEFAULT 1 NOT NULL,
	"status" "document_status" DEFAULT 'draft' NOT NULL,
	"uploaded_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"metadata" jsonb DEFAULT '{}',
	"is_deleted" boolean DEFAULT false,
	"deleted_at" timestamp,
	"deleted_by" uuid
);
--> statement-breakpoint
CREATE TABLE "e_signature_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"requested_by" uuid NOT NULL,
	"signer_user_id" uuid,
	"signer_email" varchar(255),
	"status" "signature_status" DEFAULT 'pending' NOT NULL,
	"signed_at" timestamp,
	"signature_data" jsonb,
	"expires_at" timestamp,
	"reminder_sent" boolean DEFAULT false,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exchange_rates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"base_currency" "currency" DEFAULT 'USD' NOT NULL,
	"target_currency" "currency" NOT NULL,
	"rate" numeric(15, 6) NOT NULL,
	"bid_rate" numeric(15, 6),
	"ask_rate" numeric(15, 6),
	"provider" text DEFAULT 'manual',
	"valid_from" timestamp DEFAULT CURRENT_TIMESTAMP,
	"valid_to" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "financial_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"transaction_number" text NOT NULL,
	"transaction_type" text NOT NULL,
	"category" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" "currency" DEFAULT 'USD' NOT NULL,
	"description" text NOT NULL,
	"patient_id" uuid,
	"bill_id" uuid,
	"receipt_id" uuid,
	"payment_id" uuid,
	"payment_method" text,
	"payment_reference" text,
	"account_code" text,
	"debit_account" text,
	"credit_account" text,
	"status" text DEFAULT 'completed' NOT NULL,
	"transaction_date" timestamp NOT NULL,
	"posted_date" timestamp,
	"recorded_by" uuid NOT NULL,
	"approved_by" uuid,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "financial_transactions_transaction_number_unique" UNIQUE("transaction_number")
);
--> statement-breakpoint
CREATE TABLE "health_analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"overall_health_score" integer NOT NULL,
	"risk_factors" jsonb DEFAULT '[]',
	"trends" jsonb DEFAULT '{}',
	"next_appointment_suggestion" text,
	"analysis_data" jsonb,
	"confidence" numeric(3, 2),
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "health_recommendations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"type" text NOT NULL,
	"priority" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"recommendations" jsonb DEFAULT '[]',
	"reasoning" text,
	"follow_up_required" boolean DEFAULT false,
	"status" text DEFAULT 'active',
	"acknowledged_at" timestamp,
	"acknowledged_by" uuid,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "hospital_bills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"appointment_id" uuid,
	"bill_number" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"description" text NOT NULL,
	"status" "bill_status" DEFAULT 'pending' NOT NULL,
	"service_type" "service_type" NOT NULL,
	"insurance_provider" text,
	"insurance_amount" numeric(10, 2) DEFAULT '0',
	"patient_copay" numeric(10, 2) NOT NULL,
	"procedure_codes" text[] DEFAULT '{}',
	"diagnosis_codes" text[] DEFAULT '{}',
	"notes" text,
	"generated_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "hospital_bills_bill_number_unique" UNIQUE("bill_number")
);
--> statement-breakpoint
CREATE TABLE "hospital_patient_insurance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"primary_insurance_provider" text,
	"primary_policy_number" text,
	"primary_group_number" text,
	"primary_member_id" text,
	"primary_subscriber_name" text,
	"primary_subscriber_relationship" text,
	"primary_subscriber_dob" timestamp,
	"primary_effective_date" timestamp,
	"primary_expiration_date" timestamp,
	"primary_copay_amount" numeric(10, 2),
	"primary_deductible_amount" numeric(10, 2),
	"primary_coverage_percentage" integer,
	"primary_is_active" boolean DEFAULT true,
	"secondary_insurance_provider" text,
	"secondary_policy_number" text,
	"secondary_group_number" text,
	"secondary_member_id" text,
	"secondary_subscriber_name" text,
	"secondary_subscriber_relationship" text,
	"secondary_subscriber_dob" timestamp,
	"secondary_effective_date" timestamp,
	"secondary_expiration_date" timestamp,
	"secondary_coverage_percentage" integer,
	"secondary_is_active" boolean DEFAULT false,
	"last_verification_date" timestamp,
	"verification_status" text DEFAULT 'pending',
	"verification_notes" text,
	"verified_by" uuid,
	"emergency_contact" jsonb,
	"special_programs" text[],
	"copay_cards" jsonb DEFAULT '[]',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "insurance_claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"appointment_id" uuid,
	"visit_summary_id" uuid,
	"patient_insurance_id" uuid,
	"provider_id" uuid NOT NULL,
	"medical_specialty" "medical_specialty",
	"claim_number" text NOT NULL,
	"primary_diagnosis_code" text,
	"primary_diagnosis_description" text,
	"secondary_diagnosis_codes" jsonb DEFAULT '[]',
	"procedure_codes" jsonb DEFAULT '[]',
	"diagnosis_codes" jsonb DEFAULT '[]',
	"clinical_findings" text,
	"treatment_provided" text,
	"duration_of_treatment" text,
	"medical_necessity" text,
	"total_amount" numeric(10, 2) NOT NULL,
	"total_patient_copay" numeric(10, 2) DEFAULT '0' NOT NULL,
	"total_insurance_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"approved_amount" numeric(10, 2),
	"paid_amount" numeric(10, 2),
	"status" "claim_status" DEFAULT 'draft',
	"submitted_date" timestamp,
	"processed_date" timestamp,
	"paid_date" timestamp,
	"rejection_reason" text,
	"notes" text,
	"attachments" jsonb DEFAULT '[]',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "insurance_claims_claim_number_unique" UNIQUE("claim_number")
);
--> statement-breakpoint
CREATE TABLE "insurance_plan_coverage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"insurance_provider_id" uuid NOT NULL,
	"service_price_id" uuid NOT NULL,
	"copay_amount" numeric(10, 2),
	"copay_percentage" numeric(5, 2),
	"deductible_applies" boolean DEFAULT false,
	"max_coverage_amount" numeric(10, 2),
	"pre_auth_required" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"effective_date" timestamp DEFAULT CURRENT_TIMESTAMP,
	"expiration_date" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "insurance_providers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"type" text NOT NULL,
	"contact_info" jsonb,
	"claims_address" text,
	"electronic_submission" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "lab_bills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"description" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"service_type" text DEFAULT 'laboratory_test' NOT NULL,
	"lab_order_id" uuid,
	"test_name" text,
	"notes" text,
	"generated_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "lab_order_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lab_order_id" uuid NOT NULL,
	"laboratory_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"assigned_by" uuid NOT NULL,
	"status" text DEFAULT 'assigned' NOT NULL,
	"sent_at" timestamp,
	"estimated_completion_time" timestamp,
	"actual_completion_time" timestamp,
	"tracking_number" text,
	"notes" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "lab_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"provider_id" uuid NOT NULL,
	"appointment_id" uuid,
	"lab_tenant_id" uuid,
	"test_name" text NOT NULL,
	"test_code" text,
	"instructions" text,
	"priority" text DEFAULT 'routine',
	"status" "lab_order_status" DEFAULT 'ordered',
	"results" jsonb,
	"result_date" timestamp,
	"ordered_date" timestamp DEFAULT CURRENT_TIMESTAMP,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "lab_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lab_order_id" uuid NOT NULL,
	"laboratory_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"test_name" text NOT NULL,
	"result" text,
	"normal_range" text,
	"unit" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"abnormal_flag" text,
	"notes" text,
	"performed_by" text,
	"reviewed_by" uuid,
	"completed_at" timestamp,
	"reported_at" timestamp,
	"external_lab_id" text,
	"raw_data" jsonb,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "laboratories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"license_number" text,
	"contact_person" text,
	"phone" text,
	"email" text,
	"address" jsonb,
	"specializations" text[],
	"is_active" boolean DEFAULT true,
	"api_endpoint" text,
	"api_key" text,
	"average_turnaround_time" integer,
	"is_external" boolean DEFAULT false,
	"registration_status" text DEFAULT 'approved',
	"registration_notes" text,
	"approved_by" uuid,
	"approved_at" timestamp,
	"website_url" text,
	"accreditations" text[] DEFAULT '{}',
	"operating_hours" jsonb,
	"services_offered" text[] DEFAULT '{}',
	"equipment_details" text,
	"certification_documents" text[] DEFAULT '{}',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "laboratory_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"laboratory_name" text NOT NULL,
	"license_number" text NOT NULL,
	"contact_person" text NOT NULL,
	"contact_email" text NOT NULL,
	"contact_phone" text NOT NULL,
	"address" jsonb NOT NULL,
	"specializations" text[] DEFAULT '{}' NOT NULL,
	"description" text,
	"website_url" text,
	"accreditations" text[] DEFAULT '{}',
	"average_turnaround_time" integer DEFAULT 24,
	"operating_hours" jsonb,
	"services_offered" text[] DEFAULT '{}',
	"equipment_details" text,
	"certification_documents" text[] DEFAULT '{}',
	"status" text DEFAULT 'pending',
	"review_notes" text,
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "laboratory_patient_insurance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"primary_insurance_provider" text,
	"primary_policy_number" text,
	"primary_group_number" text,
	"primary_member_id" text,
	"primary_subscriber_name" text,
	"primary_subscriber_relationship" text,
	"primary_subscriber_dob" timestamp,
	"primary_effective_date" timestamp,
	"primary_expiration_date" timestamp,
	"primary_copay_amount" numeric(10, 2),
	"primary_deductible_amount" numeric(10, 2),
	"primary_coverage_percentage" integer,
	"primary_is_active" boolean DEFAULT true,
	"secondary_insurance_provider" text,
	"secondary_policy_number" text,
	"secondary_group_number" text,
	"secondary_member_id" text,
	"secondary_subscriber_name" text,
	"secondary_subscriber_relationship" text,
	"secondary_subscriber_dob" timestamp,
	"secondary_effective_date" timestamp,
	"secondary_expiration_date" timestamp,
	"secondary_coverage_percentage" integer,
	"secondary_is_active" boolean DEFAULT false,
	"last_verification_date" timestamp,
	"verification_status" text DEFAULT 'pending',
	"verification_notes" text,
	"verified_by" uuid,
	"emergency_contact" jsonb,
	"special_programs" text[],
	"copay_cards" jsonb DEFAULT '[]',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "leaderboards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"user_name" text NOT NULL,
	"position" integer NOT NULL,
	"points" integer NOT NULL,
	"level" integer NOT NULL,
	"tests_completed" integer NOT NULL,
	"quality_score" numeric(5, 2) NOT NULL,
	"period" text NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "marketplace_order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"product_name" text NOT NULL,
	"product_sku" text NOT NULL,
	"product_description" text,
	"unit_price" numeric(10, 2) NOT NULL,
	"quantity" integer NOT NULL,
	"line_total" numeric(12, 2) NOT NULL,
	"status" "order_item_status" DEFAULT 'pending',
	"shipped_quantity" integer DEFAULT 0,
	"shipped_at" timestamp,
	"delivered_quantity" integer DEFAULT 0,
	"delivered_at" timestamp,
	"returned_quantity" integer DEFAULT 0,
	"return_reason" text,
	"returned_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "marketplace_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" text NOT NULL,
	"buyer_tenant_id" uuid NOT NULL,
	"buyer_user_id" uuid NOT NULL,
	"supplier_tenant_id" uuid NOT NULL,
	"status" "marketplace_order_status" DEFAULT 'pending',
	"subtotal" numeric(12, 2) NOT NULL,
	"tax_amount" numeric(10, 2) DEFAULT '0.00',
	"shipping_amount" numeric(10, 2) DEFAULT '0.00',
	"discount_amount" numeric(10, 2) DEFAULT '0.00',
	"total_amount" numeric(12, 2) NOT NULL,
	"currency" "currency" DEFAULT 'USD',
	"shipping_address" jsonb NOT NULL,
	"billing_address" jsonb,
	"order_date" timestamp DEFAULT CURRENT_TIMESTAMP,
	"expected_delivery_date" timestamp,
	"actual_delivery_date" timestamp,
	"shipping_carrier" text,
	"tracking_number" text,
	"buyer_notes" text,
	"supplier_notes" text,
	"internal_notes" text,
	"payment_method" text,
	"payment_status" text DEFAULT 'pending',
	"payment_reference" text,
	"purchase_order_number" text,
	"cancelled_at" timestamp,
	"cancellation_reason" text,
	"refund_amount" numeric(10, 2),
	"refunded_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "marketplace_orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "marketplace_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_tenant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"sku" text NOT NULL,
	"description" text NOT NULL,
	"short_description" text,
	"category" "ad_category" NOT NULL,
	"subcategory" text,
	"brand" text,
	"manufacturer" text,
	"price" numeric(10, 2) NOT NULL,
	"currency" "currency" DEFAULT 'USD',
	"compare_at_price" numeric(10, 2),
	"cost_price" numeric(10, 2),
	"stock_quantity" integer DEFAULT 0,
	"low_stock_threshold" integer DEFAULT 10,
	"track_inventory" boolean DEFAULT true,
	"backorders_allowed" boolean DEFAULT false,
	"status" "product_status" DEFAULT 'draft',
	"is_active" boolean DEFAULT false,
	"is_featured" boolean DEFAULT false,
	"requires_prescription" boolean DEFAULT false,
	"specifications" jsonb DEFAULT '{}',
	"features" text[] DEFAULT '{}',
	"image_urls" text[] DEFAULT '{}',
	"document_urls" text[] DEFAULT '{}',
	"video_url" text,
	"regulatory_approvals" text[] DEFAULT '{}',
	"certifications" text[] DEFAULT '{}',
	"warranty_period" text,
	"compliance_notes" text,
	"meta_title" text,
	"meta_description" text,
	"search_keywords" text[] DEFAULT '{}',
	"weight" numeric(8, 2),
	"dimensions" jsonb,
	"shipping_class" text,
	"lead_time_days" integer DEFAULT 1,
	"view_count" integer DEFAULT 0,
	"order_count" integer DEFAULT 0,
	"avg_rating" numeric(3, 2) DEFAULT '0.00',
	"total_reviews" integer DEFAULT 0,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "medical_code_uploads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"country_id" uuid NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_size" integer,
	"records_processed" integer DEFAULT 0,
	"records_imported" integer DEFAULT 0,
	"records_skipped" integer DEFAULT 0,
	"errors" jsonb DEFAULT '[]',
	"status" varchar(20) DEFAULT 'processing',
	"uploaded_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "medical_communications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"recipient_id" uuid,
	"type" "communication_type" NOT NULL,
	"priority" "priority_level" DEFAULT 'normal',
	"original_language" text DEFAULT 'en' NOT NULL,
	"target_languages" jsonb DEFAULT '["en"]',
	"original_content" jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}',
	"appointment_id" uuid,
	"prescription_id" uuid,
	"lab_order_id" uuid,
	"is_read" boolean DEFAULT false,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "medical_phrases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"category" text NOT NULL,
	"phrase_key" text NOT NULL,
	"original_language" text DEFAULT 'en' NOT NULL,
	"original_text" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "medical_suppliers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_name" text NOT NULL,
	"organization_slug" text NOT NULL,
	"business_type" text NOT NULL,
	"contact_person_name" text NOT NULL,
	"contact_email" text NOT NULL,
	"contact_phone" text NOT NULL,
	"website_url" text,
	"business_address" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"country" text NOT NULL,
	"zip_code" text NOT NULL,
	"business_description" text NOT NULL,
	"product_categories" text[] DEFAULT '{}',
	"years_in_business" text NOT NULL,
	"number_of_employees" text NOT NULL,
	"annual_revenue" text NOT NULL,
	"certifications" text[] DEFAULT '{}',
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"status" "supplier_status" DEFAULT 'pending_review' NOT NULL,
	"terms_accepted" boolean NOT NULL,
	"marketing_consent" boolean DEFAULT false,
	"tenant_id" uuid,
	"approved_by" uuid,
	"approved_at" timestamp,
	"rejection_reason" text,
	"rejected_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "medical_suppliers_organization_slug_unique" UNIQUE("organization_slug"),
	CONSTRAINT "medical_suppliers_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "medication_copays" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"patient_insurance_id" uuid NOT NULL,
	"prescription_id" uuid,
	"medication_name" text NOT NULL,
	"generic_name" text,
	"strength" text,
	"dosage_form" text,
	"ndc_number" text,
	"full_price" numeric(10, 2) NOT NULL,
	"insurance_coverage" numeric(10, 2) NOT NULL,
	"patient_copay" numeric(10, 2) NOT NULL,
	"copay_percentage" numeric(5, 2),
	"formulary_tier" text,
	"prior_auth_required" boolean DEFAULT false,
	"quantity_limit" integer,
	"day_supply_limit" integer,
	"defined_by_pharmacist" uuid NOT NULL,
	"pharmacy_notes" text,
	"effective_date" timestamp DEFAULT CURRENT_TIMESTAMP,
	"expiration_date" timestamp,
	"is_active" boolean DEFAULT true,
	"last_verified" timestamp DEFAULT CURRENT_TIMESTAMP,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "offline_sync_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"action" text NOT NULL,
	"data" jsonb NOT NULL,
	"timestamp" timestamp DEFAULT CURRENT_TIMESTAMP,
	"synced_at" timestamp,
	"conflict_resolved" boolean DEFAULT false,
	"device_id" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "password_reset_rollback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"operation_id" uuid NOT NULL,
	"user_id" varchar NOT NULL,
	"tenant_id" uuid NOT NULL,
	"previous_password_hash" text,
	"operation_type" text DEFAULT 'bulk_password_reset' NOT NULL,
	"affected_user_count" integer,
	"operation_details" jsonb,
	"executed_by" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"expires_at" timestamp DEFAULT CURRENT_TIMESTAMP + INTERVAL '7 days'
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"tenant_id" uuid,
	"token_hash" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"requested_ip" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "patient_access_audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"doctor_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"access_request_id" uuid,
	"action_type" text NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" text,
	"ip_address" text,
	"user_agent" text,
	"access_method" text DEFAULT 'direct' NOT NULL,
	"accessed_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "patient_access_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"requesting_physician_id" uuid NOT NULL,
	"target_physician_id" uuid,
	"request_type" text DEFAULT 'access' NOT NULL,
	"reason" text NOT NULL,
	"urgency" text DEFAULT 'normal' NOT NULL,
	"status" "access_request_status" DEFAULT 'pending' NOT NULL,
	"requested_date" timestamp DEFAULT CURRENT_TIMESTAMP,
	"reviewed_date" timestamp,
	"reviewed_by" uuid,
	"review_notes" text,
	"access_granted_until" timestamp,
	"access_type" text DEFAULT 'read' NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "patient_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"physician_id" uuid NOT NULL,
	"assignment_type" text DEFAULT 'primary' NOT NULL,
	"assigned_by" uuid NOT NULL,
	"assigned_date" timestamp DEFAULT CURRENT_TIMESTAMP,
	"expiry_date" timestamp,
	"is_active" boolean DEFAULT true,
	"notes" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "patient_bills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"bill_number" text NOT NULL,
	"description" text NOT NULL,
	"service_date" timestamp NOT NULL,
	"due_date" timestamp NOT NULL,
	"currency" "currency" DEFAULT 'USD' NOT NULL,
	"original_amount" numeric(10, 2) NOT NULL,
	"paid_amount" numeric(10, 2) DEFAULT '0',
	"remaining_balance" numeric(10, 2) NOT NULL,
	"status" "bill_status" DEFAULT 'pending' NOT NULL,
	"appointment_id" uuid,
	"prescription_id" uuid,
	"lab_order_id" uuid,
	"service_price_id" uuid,
	"insurance_claim_id" uuid,
	"insurance_covered" numeric(10, 2) DEFAULT '0',
	"patient_responsibility" numeric(10, 2) NOT NULL,
	"notes" text,
	"late_fees_applied" numeric(10, 2) DEFAULT '0',
	"discount_applied" numeric(10, 2) DEFAULT '0',
	"payment_terms" text,
	"last_reminder_sent" timestamp,
	"reminder_count" integer DEFAULT 0,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "patient_bills_bill_number_unique" UNIQUE("bill_number")
);
--> statement-breakpoint
CREATE TABLE "patient_check_ins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"appointment_id" uuid,
	"checked_in_by" uuid NOT NULL,
	"checked_in_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"reason_for_visit" text NOT NULL,
	"chief_complaint" text,
	"priority_level" text DEFAULT 'normal',
	"special_instructions" text,
	"accompanied_by" text,
	"insurance_verified" boolean DEFAULT false,
	"copay_collected" numeric(10, 2),
	"estimated_wait_time" integer,
	"vital_signs_id" uuid,
	"questionnaire_id" uuid,
	"status" text DEFAULT 'waiting',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "patient_insurance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"insurance_provider_id" uuid NOT NULL,
	"policy_number" text NOT NULL,
	"group_number" text,
	"subscriber_name" text,
	"subscriber_relationship" text,
	"effective_date" timestamp NOT NULL,
	"expiration_date" timestamp,
	"copay_amount" numeric(10, 2),
	"deductible_amount" numeric(10, 2),
	"is_primary" boolean DEFAULT true,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "patient_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"patient_bill_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"currency" "currency" DEFAULT 'USD' NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"payment_method" text NOT NULL,
	"payment_reference" text,
	"payment_date" timestamp NOT NULL,
	"processed_by" uuid,
	"notes" text,
	"refund_amount" numeric(10, 2) DEFAULT '0',
	"refund_date" timestamp,
	"refund_reason" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "patient_pharmacy_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"pharmacy_id" uuid NOT NULL,
	"hospital_id" uuid,
	"is_primary" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"preference_reason" text,
	"delivery_preference" text DEFAULT 'pickup',
	"special_instructions" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"mrn" text NOT NULL,
	"tenant_patient_id" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"date_of_birth" timestamp NOT NULL,
	"gender" text,
	"phone" text,
	"email" text,
	"address" jsonb,
	"emergency_contact" jsonb,
	"insurance_info" jsonb,
	"preferred_pharmacy_id" uuid,
	"primary_physician_id" uuid,
	"medical_history" jsonb DEFAULT '[]',
	"allergies" jsonb DEFAULT '[]',
	"medications" jsonb DEFAULT '[]',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "patients_tenant_id_tenant_patient_id_unique" UNIQUE("tenant_id","tenant_patient_id"),
	CONSTRAINT "patients_tenant_id_mrn_unique" UNIQUE("tenant_id","mrn")
);
--> statement-breakpoint
CREATE TABLE "pending_registrations" (
	"id" text PRIMARY KEY DEFAULT '26oMH-h_e9jQOy1qpNizQ' NOT NULL,
	"type" text NOT NULL,
	"organization_name" text NOT NULL,
	"subdomain" text NOT NULL,
	"contact_email" text NOT NULL,
	"contact_phone" text,
	"registration_data" jsonb NOT NULL,
	"admin_data" jsonb NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"submitted_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"reviewed_at" timestamp,
	"reviewed_by" uuid,
	"review_notes" text,
	"approved_tenant_id" uuid,
	"approved_user_id" uuid,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "pharmacies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"license_number" text,
	"npi_number" text,
	"contact_person" text,
	"phone" text NOT NULL,
	"email" text,
	"fax_number" text,
	"address" jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"accepts_insurance" boolean DEFAULT true,
	"delivery_service" boolean DEFAULT false,
	"operating_hours" jsonb,
	"specializations" text[] DEFAULT '{}',
	"website_url" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "pharmacy_bills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"prescription_id" uuid,
	"bill_number" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"description" text NOT NULL,
	"status" "bill_status" DEFAULT 'pending' NOT NULL,
	"medication_name" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"insurance_provider" text,
	"insurance_amount" numeric(10, 2) DEFAULT '0',
	"patient_copay" numeric(10, 2) NOT NULL,
	"notes" text,
	"generated_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "pharmacy_bills_bill_number_unique" UNIQUE("bill_number")
);
--> statement-breakpoint
CREATE TABLE "pharmacy_patient_insurance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"primary_insurance_provider" text,
	"primary_policy_number" text,
	"primary_group_number" text,
	"primary_member_id" text,
	"primary_subscriber_name" text,
	"primary_subscriber_relationship" text,
	"primary_subscriber_dob" timestamp,
	"primary_effective_date" timestamp,
	"primary_expiration_date" timestamp,
	"primary_copay_amount" numeric(10, 2),
	"primary_deductible_amount" numeric(10, 2),
	"primary_is_active" boolean DEFAULT true,
	"secondary_insurance_provider" text,
	"secondary_policy_number" text,
	"secondary_group_number" text,
	"secondary_member_id" text,
	"secondary_subscriber_name" text,
	"secondary_subscriber_relationship" text,
	"secondary_subscriber_dob" timestamp,
	"secondary_effective_date" timestamp,
	"secondary_expiration_date" timestamp,
	"secondary_is_active" boolean DEFAULT false,
	"preferred_pharmacy_network" text,
	"formulary_tier" text,
	"mail_order_benefit" boolean DEFAULT false,
	"max_days_supply" integer DEFAULT 30,
	"refill_limitations" text,
	"prior_auth_required" boolean DEFAULT false,
	"step_therapy_required" boolean DEFAULT false,
	"last_verification_date" timestamp,
	"verification_status" "verification_status" DEFAULT 'pending',
	"verification_notes" text,
	"verified_by" uuid,
	"emergency_contact" jsonb,
	"special_programs" text[] DEFAULT '{}',
	"copay_cards" jsonb DEFAULT '[]',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "pharmacy_receipts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"prescription_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"receipt_number" text NOT NULL,
	"dispensed_by" uuid NOT NULL,
	"medication_name" text NOT NULL,
	"generic_name" text,
	"dosage" text NOT NULL,
	"quantity" integer NOT NULL,
	"days_supply" integer,
	"total_cost" numeric(10, 2) NOT NULL,
	"insurance_provider" text,
	"insurance_amount" numeric(10, 2) DEFAULT '0',
	"patient_copay" numeric(10, 2) NOT NULL,
	"payment_method" text NOT NULL,
	"payment_amount" numeric(10, 2) NOT NULL,
	"change_given" numeric(10, 2) DEFAULT '0',
	"prescribed_by" text NOT NULL,
	"prescribed_date" timestamp NOT NULL,
	"dispensed_date" timestamp NOT NULL,
	"refills_remaining" integer DEFAULT 0,
	"pharmacy_notes" text,
	"patient_instructions" text,
	"is_printed" boolean DEFAULT false,
	"is_emailed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "pharmacy_receipts_receipt_number_unique" UNIQUE("receipt_number")
);
--> statement-breakpoint
CREATE TABLE "pharmacy_report_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"report_type" text NOT NULL,
	"data_fields" jsonb NOT NULL,
	"group_by" text[] DEFAULT '{}',
	"order_by" text[] DEFAULT '{}',
	"filters" jsonb DEFAULT '{}',
	"is_scheduled" boolean DEFAULT false,
	"schedule_frequency" text,
	"schedule_time" text,
	"last_generated" timestamp,
	"is_active" boolean DEFAULT true,
	"is_default" boolean DEFAULT false,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "phrase_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phrase_id" uuid NOT NULL,
	"language_code" text NOT NULL,
	"translated_text" text NOT NULL,
	"translated_by" uuid,
	"verified_by" uuid,
	"is_verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "prescription_archives" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"original_prescription_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"provider_id" uuid NOT NULL,
	"pharmacy_tenant_id" uuid,
	"medication_name" text NOT NULL,
	"dosage" text NOT NULL,
	"frequency" text NOT NULL,
	"quantity" integer NOT NULL,
	"refills" integer DEFAULT 0,
	"instructions" text,
	"status" "prescription_status" DEFAULT 'dispensed',
	"prescribed_date" timestamp,
	"dispensed_date" timestamp,
	"archived_date" timestamp DEFAULT CURRENT_TIMESTAMP,
	"insurance_provider" text,
	"insurance_copay" numeric(10, 2),
	"insurance_coverage_percentage" numeric(5, 2),
	"total_cost" numeric(10, 2),
	"pharmacy_notes" text,
	"claim_number" text,
	"transaction_id" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "prescriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"provider_id" uuid NOT NULL,
	"appointment_id" uuid,
	"pharmacy_tenant_id" uuid,
	"medication_name" text NOT NULL,
	"dosage" text NOT NULL,
	"frequency" text NOT NULL,
	"quantity" integer NOT NULL,
	"refills" integer DEFAULT 0,
	"instructions" text,
	"status" "prescription_status" DEFAULT 'prescribed',
	"prescribed_date" timestamp DEFAULT CURRENT_TIMESTAMP,
	"sent_to_pharmacy_date" timestamp,
	"filled_date" timestamp,
	"expiry_date" timestamp,
	"insurance_verified_date" timestamp,
	"insurance_provider" text,
	"insurance_copay" numeric(10, 2),
	"insurance_coverage_percentage" numeric(5, 2),
	"total_cost" numeric(10, 2),
	"processing_started_date" timestamp,
	"ready_date" timestamp,
	"dispensed_date" timestamp,
	"pharmacy_notes" text,
	"routed_from_hospital" uuid,
	"patient_selected_pharmacy" boolean DEFAULT false,
	"routing_notes" text,
	"priority" "priority_level" DEFAULT 'normal',
	"urgency_score" integer DEFAULT 50,
	"estimated_wait_time" integer DEFAULT 0,
	"assigned_staff_id" uuid,
	"workflow_stage" text DEFAULT 'queue',
	"last_status_update" timestamp DEFAULT CURRENT_TIMESTAMP,
	"patient_waiting_since" timestamp,
	"priority_factors" jsonb,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "pricing_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"plan" "subscription_plan" NOT NULL,
	"display_name" text NOT NULL,
	"description" text,
	"monthly_price" numeric(10, 2) NOT NULL,
	"yearly_price" numeric(10, 2),
	"currency" text DEFAULT 'USD',
	"trial_days" integer DEFAULT 14,
	"max_users" integer DEFAULT 5,
	"max_patients" integer DEFAULT 100,
	"max_storage_gb" integer DEFAULT 1,
	"api_calls_per_month" integer DEFAULT 1000,
	"whitelabel_enabled" boolean DEFAULT false,
	"offline_enabled" boolean DEFAULT false,
	"multi_language_enabled" boolean DEFAULT false,
	"advanced_reports_enabled" boolean DEFAULT false,
	"custom_integrations_enabled" boolean DEFAULT false,
	"priority_support" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "product_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"reviewer_tenant_id" uuid NOT NULL,
	"reviewer_user_id" uuid NOT NULL,
	"order_id" uuid,
	"rating" integer NOT NULL,
	"title" text,
	"review" text,
	"pros" text[] DEFAULT '{}',
	"cons" text[] DEFAULT '{}',
	"is_verified_purchase" boolean DEFAULT false,
	"is_approved" boolean DEFAULT false,
	"moderated_by" uuid,
	"moderated_at" timestamp,
	"helpful_votes" integer DEFAULT 0,
	"total_votes" integer DEFAULT 0,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "quote_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"product_name" text NOT NULL,
	"supplier_name" text NOT NULL,
	"company_name" text NOT NULL,
	"contact_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"quantity" integer NOT NULL,
	"message" text,
	"status" "quote_request_status" DEFAULT 'pending' NOT NULL,
	"requested_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"quoted_price" numeric(10, 2),
	"quoted_at" timestamp,
	"quoted_by" text,
	"notes" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"generated_by" uuid NOT NULL,
	"title" text NOT NULL,
	"type" "report_type" NOT NULL,
	"format" text DEFAULT 'pdf',
	"parameters" jsonb DEFAULT '{}',
	"data" jsonb,
	"status" "report_status" DEFAULT 'pending',
	"file_url" text,
	"date_from" timestamp,
	"date_to" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"role" "role" NOT NULL,
	"module" varchar(50) NOT NULL,
	"permissions" text[] NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_prices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"service_code" text NOT NULL,
	"service_name" text NOT NULL,
	"service_description" text,
	"service_type" "service_type" NOT NULL,
	"currency" "currency" DEFAULT 'USD' NOT NULL,
	"base_price" numeric(10, 2) NOT NULL,
	"is_active" boolean DEFAULT true,
	"effective_date" timestamp DEFAULT CURRENT_TIMESTAMP,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "specialty_questionnaires" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"appointment_id" uuid,
	"specialty" "medical_specialty" NOT NULL,
	"completed_by" uuid NOT NULL,
	"responses" jsonb NOT NULL,
	"chief_complaint" text,
	"symptoms" text[] DEFAULT '{}',
	"symptom_duration" text,
	"severity" integer,
	"previous_treatments" text,
	"current_medications" text[] DEFAULT '{}',
	"allergies" text[] DEFAULT '{}',
	"family_history" text,
	"social_history" text,
	"review_of_systems" jsonb DEFAULT '{}',
	"additional_notes" text,
	"is_complete" boolean DEFAULT false,
	"completed_at" timestamp,
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"pricing_plan_id" uuid,
	"plan_name" text NOT NULL,
	"plan" "subscription_plan" DEFAULT 'starter' NOT NULL,
	"status" "subscription_status" DEFAULT 'trial',
	"billing_interval" "billing_interval" DEFAULT 'monthly',
	"monthly_price" numeric(10, 2) NOT NULL,
	"max_users" integer NOT NULL,
	"max_patients" integer,
	"features" jsonb DEFAULT '[]',
	"trial_ends_at" timestamp,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"cancel_at_period_end" boolean DEFAULT false,
	"customer_id" text,
	"subscription_id" text,
	"last_payment_date" timestamp,
	"next_payment_date" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "supported_languages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"language_code" text NOT NULL,
	"language_name" text NOT NULL,
	"native_name" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"is_primary" boolean DEFAULT false,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" "tenant_type" NOT NULL,
	"subdomain" text NOT NULL,
	"country_id" uuid,
	"settings" jsonb DEFAULT '{}',
	"is_active" boolean DEFAULT true,
	"parent_tenant_id" uuid,
	"organization_type" text DEFAULT 'independent',
	"brand_name" text,
	"logo_url" text,
	"primary_color" varchar(7) DEFAULT '#10b981',
	"secondary_color" varchar(7) DEFAULT '#3b82f6',
	"custom_domain" text,
	"custom_css" text,
	"default_language" varchar(10) DEFAULT 'en',
	"supported_languages" jsonb DEFAULT '["en"]'::jsonb,
	"base_currency" "currency" DEFAULT 'USD',
	"supported_currencies" jsonb DEFAULT '["USD"]'::jsonb,
	"offline_enabled" boolean DEFAULT false,
	"offline_storage_mb" integer DEFAULT 100,
	"sync_frequency_minutes" integer DEFAULT 15,
	"trial_start_date" timestamp DEFAULT CURRENT_TIMESTAMP,
	"trial_end_date" timestamp DEFAULT CURRENT_TIMESTAMP + INTERVAL '14 days',
	"subscription_status" "subscription_status" DEFAULT 'trial',
	"last_suspension_check" timestamp,
	"suspended_at" timestamp,
	"suspension_reason" text,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"subscription_plan_id" "subscription_plan",
	"subscription_interval" "billing_interval",
	"phone_number" text,
	"address" text,
	"description" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "tenants_subdomain_unique" UNIQUE("subdomain")
);
--> statement-breakpoint
CREATE TABLE "translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"key" text NOT NULL,
	"language" varchar(10) NOT NULL,
	"value" text NOT NULL,
	"context" text,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "user_achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"achievement_id" uuid NOT NULL,
	"progress" integer DEFAULT 0,
	"max_progress" integer NOT NULL,
	"is_completed" boolean DEFAULT false,
	"completed_at" timestamp,
	"earned_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "user_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"level" integer DEFAULT 1,
	"total_points" integer DEFAULT 0,
	"tests_completed" integer DEFAULT 0,
	"average_completion_time" integer DEFAULT 0,
	"quality_score" numeric(5, 2) DEFAULT '0.00',
	"consistency_streak" integer DEFAULT 0,
	"last_activity_date" timestamp,
	"weekly_goal" integer DEFAULT 50,
	"monthly_goal" integer DEFAULT 200,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"username" text,
	"email" text,
	"password" text,
	"first_name" text,
	"last_name" text,
	"profile_image_url" varchar,
	"role" "role" NOT NULL,
	"is_active" boolean DEFAULT true,
	"is_temporary_password" boolean DEFAULT false,
	"must_change_password" boolean DEFAULT false,
	"password_changed_at" timestamp,
	"language_preference" text DEFAULT 'en',
	"last_login" timestamp,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "visit_summaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"appointment_id" uuid NOT NULL,
	"provider_id" uuid NOT NULL,
	"vital_signs_id" uuid,
	"chief_complaint" text NOT NULL,
	"history_of_present_illness" text,
	"review_of_systems" jsonb DEFAULT '{}',
	"physical_examination" text,
	"symptoms" jsonb DEFAULT '[]',
	"assessment" text,
	"clinical_impression" text,
	"differential_diagnosis" jsonb DEFAULT '[]',
	"final_diagnosis" jsonb DEFAULT '[]',
	"treatment_plan" text,
	"patient_instructions" text,
	"follow_up_instructions" text,
	"return_visit_recommended" boolean DEFAULT false,
	"return_visit_timeframe" text,
	"provider_notes" text,
	"status" text DEFAULT 'draft',
	"visit_date" timestamp DEFAULT CURRENT_TIMESTAMP,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "vital_signs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"appointment_id" uuid,
	"recorded_by_id" uuid NOT NULL,
	"blood_pressure_systolic" integer,
	"blood_pressure_diastolic" integer,
	"heart_rate" integer,
	"temperature" numeric(4, 1),
	"temperature_unit" text DEFAULT 'F',
	"respiratory_rate" integer,
	"oxygen_saturation" integer,
	"weight" numeric(5, 2),
	"height" numeric(5, 2),
	"body_mass_index" numeric(4, 1),
	"pain_level" integer,
	"glucose_level" integer,
	"notes" text,
	"recorded_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "work_shifts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"shift_type" text NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp,
	"status" "shift_status" DEFAULT 'active',
	"notes" text,
	"total_prescriptions_processed" integer DEFAULT 0,
	"total_revenue" numeric(10, 2) DEFAULT '0',
	"total_insurance_claims" integer DEFAULT 0,
	"shift_summary" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_inquiries" ADD CONSTRAINT "ad_inquiries_advertisement_id_advertisements_id_fk" FOREIGN KEY ("advertisement_id") REFERENCES "public"."advertisements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_inquiries" ADD CONSTRAINT "ad_inquiries_inquirer_tenant_id_tenants_id_fk" FOREIGN KEY ("inquirer_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_inquiries" ADD CONSTRAINT "ad_inquiries_inquirer_user_id_users_id_fk" FOREIGN KEY ("inquirer_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_views" ADD CONSTRAINT "ad_views_advertisement_id_advertisements_id_fk" FOREIGN KEY ("advertisement_id") REFERENCES "public"."advertisements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_views" ADD CONSTRAINT "ad_views_viewer_tenant_id_tenants_id_fk" FOREIGN KEY ("viewer_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_views" ADD CONSTRAINT "ad_views_viewer_user_id_users_id_fk" FOREIGN KEY ("viewer_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "advertisements" ADD CONSTRAINT "advertisements_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "advertisements" ADD CONSTRAINT "advertisements_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_provider_id_users_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "archived_records" ADD CONSTRAINT "archived_records_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "archived_records" ADD CONSTRAINT "archived_records_work_shift_id_work_shifts_id_fk" FOREIGN KEY ("work_shift_id") REFERENCES "public"."work_shifts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "archived_records" ADD CONSTRAINT "archived_records_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "archived_records" ADD CONSTRAINT "archived_records_archived_by_users_id_fk" FOREIGN KEY ("archived_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "archived_records" ADD CONSTRAINT "archived_records_last_accessed_by_users_id_fk" FOREIGN KEY ("last_accessed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claim_line_items" ADD CONSTRAINT "claim_line_items_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claim_line_items" ADD CONSTRAINT "claim_line_items_claim_id_insurance_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."insurance_claims"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claim_line_items" ADD CONSTRAINT "claim_line_items_service_price_id_service_prices_id_fk" FOREIGN KEY ("service_price_id") REFERENCES "public"."service_prices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_translations" ADD CONSTRAINT "communication_translations_communication_id_medical_communications_id_fk" FOREIGN KEY ("communication_id") REFERENCES "public"."medical_communications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_translations" ADD CONSTRAINT "communication_translations_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "country_medical_codes" ADD CONSTRAINT "country_medical_codes_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cross_tenant_patients" ADD CONSTRAINT "cross_tenant_patients_original_patient_id_patients_id_fk" FOREIGN KEY ("original_patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cross_tenant_patients" ADD CONSTRAINT "cross_tenant_patients_original_tenant_id_tenants_id_fk" FOREIGN KEY ("original_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cross_tenant_patients" ADD CONSTRAINT "cross_tenant_patients_shared_with_tenant_id_tenants_id_fk" FOREIGN KEY ("shared_with_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cross_tenant_patients" ADD CONSTRAINT "cross_tenant_patients_shared_by_user_id_users_id_fk" FOREIGN KEY ("shared_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "departments" ADD CONSTRAINT "departments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "departments" ADD CONSTRAINT "departments_head_of_department_users_id_fk" FOREIGN KEY ("head_of_department") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_recorded_by_users_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "health_analyses" ADD CONSTRAINT "health_analyses_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "health_analyses" ADD CONSTRAINT "health_analyses_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "health_analyses" ADD CONSTRAINT "health_analyses_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "health_recommendations" ADD CONSTRAINT "health_recommendations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "health_recommendations" ADD CONSTRAINT "health_recommendations_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "health_recommendations" ADD CONSTRAINT "health_recommendations_acknowledged_by_users_id_fk" FOREIGN KEY ("acknowledged_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospital_bills" ADD CONSTRAINT "hospital_bills_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospital_bills" ADD CONSTRAINT "hospital_bills_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospital_bills" ADD CONSTRAINT "hospital_bills_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospital_bills" ADD CONSTRAINT "hospital_bills_generated_by_users_id_fk" FOREIGN KEY ("generated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospital_patient_insurance" ADD CONSTRAINT "hospital_patient_insurance_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospital_patient_insurance" ADD CONSTRAINT "hospital_patient_insurance_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospital_patient_insurance" ADD CONSTRAINT "hospital_patient_insurance_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_visit_summary_id_visit_summaries_id_fk" FOREIGN KEY ("visit_summary_id") REFERENCES "public"."visit_summaries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_patient_insurance_id_patient_insurance_id_fk" FOREIGN KEY ("patient_insurance_id") REFERENCES "public"."patient_insurance"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_provider_id_users_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_plan_coverage" ADD CONSTRAINT "insurance_plan_coverage_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_plan_coverage" ADD CONSTRAINT "insurance_plan_coverage_insurance_provider_id_insurance_providers_id_fk" FOREIGN KEY ("insurance_provider_id") REFERENCES "public"."insurance_providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_plan_coverage" ADD CONSTRAINT "insurance_plan_coverage_service_price_id_service_prices_id_fk" FOREIGN KEY ("service_price_id") REFERENCES "public"."service_prices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_providers" ADD CONSTRAINT "insurance_providers_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_bills" ADD CONSTRAINT "lab_bills_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_bills" ADD CONSTRAINT "lab_bills_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_bills" ADD CONSTRAINT "lab_bills_lab_order_id_lab_orders_id_fk" FOREIGN KEY ("lab_order_id") REFERENCES "public"."lab_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_bills" ADD CONSTRAINT "lab_bills_generated_by_users_id_fk" FOREIGN KEY ("generated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_order_assignments" ADD CONSTRAINT "lab_order_assignments_lab_order_id_lab_orders_id_fk" FOREIGN KEY ("lab_order_id") REFERENCES "public"."lab_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_order_assignments" ADD CONSTRAINT "lab_order_assignments_laboratory_id_laboratories_id_fk" FOREIGN KEY ("laboratory_id") REFERENCES "public"."laboratories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_order_assignments" ADD CONSTRAINT "lab_order_assignments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_order_assignments" ADD CONSTRAINT "lab_order_assignments_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_provider_id_users_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_lab_tenant_id_tenants_id_fk" FOREIGN KEY ("lab_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_results" ADD CONSTRAINT "lab_results_lab_order_id_lab_orders_id_fk" FOREIGN KEY ("lab_order_id") REFERENCES "public"."lab_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_results" ADD CONSTRAINT "lab_results_laboratory_id_laboratories_id_fk" FOREIGN KEY ("laboratory_id") REFERENCES "public"."laboratories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_results" ADD CONSTRAINT "lab_results_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_results" ADD CONSTRAINT "lab_results_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_results" ADD CONSTRAINT "lab_results_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "laboratories" ADD CONSTRAINT "laboratories_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "laboratories" ADD CONSTRAINT "laboratories_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "laboratory_applications" ADD CONSTRAINT "laboratory_applications_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "laboratory_patient_insurance" ADD CONSTRAINT "laboratory_patient_insurance_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "laboratory_patient_insurance" ADD CONSTRAINT "laboratory_patient_insurance_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "laboratory_patient_insurance" ADD CONSTRAINT "laboratory_patient_insurance_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaderboards" ADD CONSTRAINT "leaderboards_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaderboards" ADD CONSTRAINT "leaderboards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_order_items" ADD CONSTRAINT "marketplace_order_items_order_id_marketplace_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."marketplace_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_order_items" ADD CONSTRAINT "marketplace_order_items_product_id_marketplace_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."marketplace_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_orders" ADD CONSTRAINT "marketplace_orders_buyer_tenant_id_tenants_id_fk" FOREIGN KEY ("buyer_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_orders" ADD CONSTRAINT "marketplace_orders_buyer_user_id_users_id_fk" FOREIGN KEY ("buyer_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_orders" ADD CONSTRAINT "marketplace_orders_supplier_tenant_id_tenants_id_fk" FOREIGN KEY ("supplier_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_products" ADD CONSTRAINT "marketplace_products_supplier_tenant_id_tenants_id_fk" FOREIGN KEY ("supplier_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_code_uploads" ADD CONSTRAINT "medical_code_uploads_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_code_uploads" ADD CONSTRAINT "medical_code_uploads_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_communications" ADD CONSTRAINT "medical_communications_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_communications" ADD CONSTRAINT "medical_communications_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_communications" ADD CONSTRAINT "medical_communications_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_communications" ADD CONSTRAINT "medical_communications_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_communications" ADD CONSTRAINT "medical_communications_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_communications" ADD CONSTRAINT "medical_communications_prescription_id_prescriptions_id_fk" FOREIGN KEY ("prescription_id") REFERENCES "public"."prescriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_communications" ADD CONSTRAINT "medical_communications_lab_order_id_lab_orders_id_fk" FOREIGN KEY ("lab_order_id") REFERENCES "public"."lab_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_phrases" ADD CONSTRAINT "medical_phrases_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_suppliers" ADD CONSTRAINT "medical_suppliers_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_suppliers" ADD CONSTRAINT "medical_suppliers_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medication_copays" ADD CONSTRAINT "medication_copays_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medication_copays" ADD CONSTRAINT "medication_copays_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medication_copays" ADD CONSTRAINT "medication_copays_patient_insurance_id_patient_insurance_id_fk" FOREIGN KEY ("patient_insurance_id") REFERENCES "public"."patient_insurance"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medication_copays" ADD CONSTRAINT "medication_copays_prescription_id_prescriptions_id_fk" FOREIGN KEY ("prescription_id") REFERENCES "public"."prescriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medication_copays" ADD CONSTRAINT "medication_copays_defined_by_pharmacist_users_id_fk" FOREIGN KEY ("defined_by_pharmacist") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offline_sync_data" ADD CONSTRAINT "offline_sync_data_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offline_sync_data" ADD CONSTRAINT "offline_sync_data_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_rollback" ADD CONSTRAINT "password_reset_rollback_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_access_audit_log" ADD CONSTRAINT "patient_access_audit_log_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_access_audit_log" ADD CONSTRAINT "patient_access_audit_log_doctor_id_users_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_access_audit_log" ADD CONSTRAINT "patient_access_audit_log_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_access_audit_log" ADD CONSTRAINT "patient_access_audit_log_access_request_id_patient_access_requests_id_fk" FOREIGN KEY ("access_request_id") REFERENCES "public"."patient_access_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_access_requests" ADD CONSTRAINT "patient_access_requests_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_access_requests" ADD CONSTRAINT "patient_access_requests_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_access_requests" ADD CONSTRAINT "patient_access_requests_requesting_physician_id_users_id_fk" FOREIGN KEY ("requesting_physician_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_access_requests" ADD CONSTRAINT "patient_access_requests_target_physician_id_users_id_fk" FOREIGN KEY ("target_physician_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_access_requests" ADD CONSTRAINT "patient_access_requests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_assignments" ADD CONSTRAINT "patient_assignments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_assignments" ADD CONSTRAINT "patient_assignments_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_assignments" ADD CONSTRAINT "patient_assignments_physician_id_users_id_fk" FOREIGN KEY ("physician_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_assignments" ADD CONSTRAINT "patient_assignments_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_bills" ADD CONSTRAINT "patient_bills_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_bills" ADD CONSTRAINT "patient_bills_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_bills" ADD CONSTRAINT "patient_bills_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_bills" ADD CONSTRAINT "patient_bills_prescription_id_prescriptions_id_fk" FOREIGN KEY ("prescription_id") REFERENCES "public"."prescriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_bills" ADD CONSTRAINT "patient_bills_lab_order_id_lab_orders_id_fk" FOREIGN KEY ("lab_order_id") REFERENCES "public"."lab_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_bills" ADD CONSTRAINT "patient_bills_service_price_id_service_prices_id_fk" FOREIGN KEY ("service_price_id") REFERENCES "public"."service_prices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_bills" ADD CONSTRAINT "patient_bills_insurance_claim_id_insurance_claims_id_fk" FOREIGN KEY ("insurance_claim_id") REFERENCES "public"."insurance_claims"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_bills" ADD CONSTRAINT "patient_bills_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_check_ins" ADD CONSTRAINT "patient_check_ins_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_check_ins" ADD CONSTRAINT "patient_check_ins_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_check_ins" ADD CONSTRAINT "patient_check_ins_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_check_ins" ADD CONSTRAINT "patient_check_ins_checked_in_by_users_id_fk" FOREIGN KEY ("checked_in_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_check_ins" ADD CONSTRAINT "patient_check_ins_vital_signs_id_vital_signs_id_fk" FOREIGN KEY ("vital_signs_id") REFERENCES "public"."vital_signs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_check_ins" ADD CONSTRAINT "patient_check_ins_questionnaire_id_specialty_questionnaires_id_fk" FOREIGN KEY ("questionnaire_id") REFERENCES "public"."specialty_questionnaires"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_insurance" ADD CONSTRAINT "patient_insurance_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_insurance" ADD CONSTRAINT "patient_insurance_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_insurance" ADD CONSTRAINT "patient_insurance_insurance_provider_id_insurance_providers_id_fk" FOREIGN KEY ("insurance_provider_id") REFERENCES "public"."insurance_providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_payments" ADD CONSTRAINT "patient_payments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_payments" ADD CONSTRAINT "patient_payments_patient_bill_id_patient_bills_id_fk" FOREIGN KEY ("patient_bill_id") REFERENCES "public"."patient_bills"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_payments" ADD CONSTRAINT "patient_payments_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_payments" ADD CONSTRAINT "patient_payments_processed_by_users_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_pharmacy_preferences" ADD CONSTRAINT "patient_pharmacy_preferences_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_pharmacy_preferences" ADD CONSTRAINT "patient_pharmacy_preferences_pharmacy_id_tenants_id_fk" FOREIGN KEY ("pharmacy_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_pharmacy_preferences" ADD CONSTRAINT "patient_pharmacy_preferences_hospital_id_tenants_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_preferred_pharmacy_id_pharmacies_id_fk" FOREIGN KEY ("preferred_pharmacy_id") REFERENCES "public"."pharmacies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_primary_physician_id_users_id_fk" FOREIGN KEY ("primary_physician_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pending_registrations" ADD CONSTRAINT "pending_registrations_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pending_registrations" ADD CONSTRAINT "pending_registrations_approved_tenant_id_tenants_id_fk" FOREIGN KEY ("approved_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pending_registrations" ADD CONSTRAINT "pending_registrations_approved_user_id_users_id_fk" FOREIGN KEY ("approved_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacies" ADD CONSTRAINT "pharmacies_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_bills" ADD CONSTRAINT "pharmacy_bills_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_bills" ADD CONSTRAINT "pharmacy_bills_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_bills" ADD CONSTRAINT "pharmacy_bills_prescription_id_prescriptions_id_fk" FOREIGN KEY ("prescription_id") REFERENCES "public"."prescriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_bills" ADD CONSTRAINT "pharmacy_bills_generated_by_users_id_fk" FOREIGN KEY ("generated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_patient_insurance" ADD CONSTRAINT "pharmacy_patient_insurance_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_patient_insurance" ADD CONSTRAINT "pharmacy_patient_insurance_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_patient_insurance" ADD CONSTRAINT "pharmacy_patient_insurance_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_receipts" ADD CONSTRAINT "pharmacy_receipts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_receipts" ADD CONSTRAINT "pharmacy_receipts_prescription_id_prescriptions_id_fk" FOREIGN KEY ("prescription_id") REFERENCES "public"."prescriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_receipts" ADD CONSTRAINT "pharmacy_receipts_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_receipts" ADD CONSTRAINT "pharmacy_receipts_dispensed_by_users_id_fk" FOREIGN KEY ("dispensed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_report_templates" ADD CONSTRAINT "pharmacy_report_templates_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_report_templates" ADD CONSTRAINT "pharmacy_report_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phrase_translations" ADD CONSTRAINT "phrase_translations_phrase_id_medical_phrases_id_fk" FOREIGN KEY ("phrase_id") REFERENCES "public"."medical_phrases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phrase_translations" ADD CONSTRAINT "phrase_translations_translated_by_users_id_fk" FOREIGN KEY ("translated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phrase_translations" ADD CONSTRAINT "phrase_translations_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescription_archives" ADD CONSTRAINT "prescription_archives_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescription_archives" ADD CONSTRAINT "prescription_archives_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescription_archives" ADD CONSTRAINT "prescription_archives_provider_id_users_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescription_archives" ADD CONSTRAINT "prescription_archives_pharmacy_tenant_id_tenants_id_fk" FOREIGN KEY ("pharmacy_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_provider_id_users_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_pharmacy_tenant_id_tenants_id_fk" FOREIGN KEY ("pharmacy_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_routed_from_hospital_tenants_id_fk" FOREIGN KEY ("routed_from_hospital") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_assigned_staff_id_users_id_fk" FOREIGN KEY ("assigned_staff_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_product_id_marketplace_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."marketplace_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_reviewer_tenant_id_tenants_id_fk" FOREIGN KEY ("reviewer_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_reviewer_user_id_users_id_fk" FOREIGN KEY ("reviewer_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_order_id_marketplace_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."marketplace_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_moderated_by_users_id_fk" FOREIGN KEY ("moderated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_requests" ADD CONSTRAINT "quote_requests_product_id_marketplace_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."marketplace_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_generated_by_users_id_fk" FOREIGN KEY ("generated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_prices" ADD CONSTRAINT "service_prices_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "specialty_questionnaires" ADD CONSTRAINT "specialty_questionnaires_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "specialty_questionnaires" ADD CONSTRAINT "specialty_questionnaires_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "specialty_questionnaires" ADD CONSTRAINT "specialty_questionnaires_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "specialty_questionnaires" ADD CONSTRAINT "specialty_questionnaires_completed_by_users_id_fk" FOREIGN KEY ("completed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "specialty_questionnaires" ADD CONSTRAINT "specialty_questionnaires_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_pricing_plan_id_pricing_plans_id_fk" FOREIGN KEY ("pricing_plan_id") REFERENCES "public"."pricing_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supported_languages" ADD CONSTRAINT "supported_languages_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "translations" ADD CONSTRAINT "translations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_stats" ADD CONSTRAINT "user_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_stats" ADD CONSTRAINT "user_stats_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visit_summaries" ADD CONSTRAINT "visit_summaries_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visit_summaries" ADD CONSTRAINT "visit_summaries_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visit_summaries" ADD CONSTRAINT "visit_summaries_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visit_summaries" ADD CONSTRAINT "visit_summaries_provider_id_users_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visit_summaries" ADD CONSTRAINT "visit_summaries_vital_signs_id_vital_signs_id_fk" FOREIGN KEY ("vital_signs_id") REFERENCES "public"."vital_signs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vital_signs" ADD CONSTRAINT "vital_signs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vital_signs" ADD CONSTRAINT "vital_signs_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vital_signs" ADD CONSTRAINT "vital_signs_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vital_signs" ADD CONSTRAINT "vital_signs_recorded_by_id_users_id_fk" FOREIGN KEY ("recorded_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_shifts" ADD CONSTRAINT "work_shifts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_shifts" ADD CONSTRAINT "work_shifts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cross_tenant_patients_shared_with_tenant_id_tenant_patient_id_index" ON "cross_tenant_patients" USING btree ("shared_with_tenant_id","tenant_patient_id");--> statement-breakpoint
CREATE INDEX "password_reset_tokens_token_hash_idx" ON "password_reset_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "password_reset_tokens_expires_at_idx" ON "password_reset_tokens" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");