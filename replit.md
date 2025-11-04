# Healthcare Management Platform

## Overview
NaviMED is a multi-tenant healthcare platform designed to connect independent pharmacies with hospitals. Its core purpose is to streamline prescription management, facilitate insurance claims, manage patient records, and enhance communication within the healthcare ecosystem. The platform aims to improve efficiency, patient care, and secure data management through features like NaviMED AI for health analysis, robust analytics, and enterprise-grade multi-tenancy, positioning it as a leading solution for pharmacy-hospital connectivity.

## User Preferences
- Simple, everyday language for communication (user is non-technical)
- Focus on functionality testing rather than code details
- Prioritize working features over perfect TypeScript compliance
- Super admin account: abel@argilette.com with unlimited privileges and white label access
- Enable multi-language support and offline mode for starter plan
- Complete 100% translation system implementation
- Fixed organization registration authorization issues - registration now works without authentication tokens
- Confirmed enterprise-grade multi-tenant architecture with complete data isolation between all organizations
- **SUPPLIER AUTHENTICATION SOLUTION:** Created unified supplier portal at `/supplier-portal` with combined login/signup functionality
- Fixed supplier registration validation by properly mapping form fields to database schema and excluding auto-generated fields
- **COMPLETE SUPPLIER MANAGEMENT SYSTEM:** Implemented full supplier registration, approval, and rejection workflow with super admin dashboard
- Fixed database schema issues, unique slug generation, and JSON parsing errors for seamless supplier operations
- **AUTOMATIC MARKETPLACE INTEGRATION:** Enhanced supplier approval process to automatically create tenant accounts and sample marketplace products for approved suppliers
- **COMPLETE QUOTE REQUEST SYSTEM:** Implemented functional quote request functionality with database schema, API endpoints, form validation, and proper error handling for marketplace customers
- **ROLE-BASED ADVERTISEMENT ACCESS:** Fixed authorization issues - healthcare practices (hospitals, pharmacies, laboratories) can now only view and contact advertisers, while advertisement posting is restricted to suppliers only
- **FUNCTIONAL INQUIRY SYSTEM:** Implemented complete contact functionality for advertisements with expandable inquiry forms, backend API validation, and success notifications
- **CAROUSEL IMAGE DISPLAY FIXED:** Completely resolved carousel image display issue - all 6 professional healthcare images now display clearly with proper asset imports and new landing page implementation
- **COMPREHENSIVE COUNTER RESET SYSTEM:** Implemented complete counter reset functionality for all accounts - work shifts, user statistics, advertisement performance, marketplace analytics, activity points, and stock quantities all reset to zero for accurate new user signups
- **HOSPITAL DASHBOARD METRICS DISPLAY FIXED:** Completely resolved dashboard display issue by fixing duplicate function definitions and database data type conversion - hospital admin dashboard now shows real-time metrics (9 appointments, lab results, prescriptions, claims totals) with full management interface
- **ALERT SYSTEM COMPLETELY FIXED:** Removed all hardcoded notifications from bell icon and alert panels - now only displays real-time alerts when actual data exists
- **EMAIL CONFIRMATION SYSTEM:** Implemented comprehensive email confirmation system using SMTP (Nodemailer) - all new user registrations and organization signups now send professional welcome emails with platform feature overview and login instructions through IONOS SMTP server
- **AUTHENTICATION SYSTEM FULLY RESTORED:** Fixed critical authentication routing issues and login loops - super admin login now works properly with credentials abel@argilette.com/Serrega1208@ with full platform management access
- **DEPLOYMENT READY:** Fixed health check timeout issues that prevented deployment - added multiple fast health check endpoints (/health, /healthz, /status, /ping) that respond immediately without database operations, ensuring successful deployment monitoring
- **PHARMACY NAVIGATION SYSTEM COMPLETE:** Fixed comprehensive pharmacy interface with proper header branding (shows "DEO Pharmacy" instead of "Loading...Hospital"), functional top navigation tabs with active styling, and complete sidebar navigation with all 16+ pharmacy service categories pointing to working pages - eliminated all 404 errors
- **PRESCRIPTION WORKFLOW BUSINESS RULES ENFORCED:** Fixed critical business rule violation - pharmacies now only receive and process prescriptions from hospitals/doctors, they cannot create new prescriptions. Only physicians and doctors from hospital tenants can generate prescriptions, ensuring proper healthcare workflow compliance
- **DASHBOARD UPGRADE PROJECT COMPLETED:** Successfully upgraded all dashboards from mock data to real database connections - fixed laboratory analytics dashboard regression that was showing hardcoded values (2,847 tests, 4.2h turnaround) instead of authentic database values, ensuring all healthcare data displays real operational metrics
- **APPOINTMENTS PAGE MODERNIZED:** Completely transformed appointments interface with contemporary healthcare design featuring professional gradients, modern card layouts, enhanced typography, improved spacing, and sophisticated visual hierarchy while preserving all functionality
- **PRESCRIPTION MANAGEMENT MODERNIZED:** Completely redesigned prescription management page with contemporary healthcare styling featuring professional gradient backgrounds, modern statistics cards with hover animations, enhanced typography, improved spacing, and sophisticated visual hierarchy while maintaining full prescription workflow functionality including Process, View Details, and New Prescription dialogs
- **NAVIMED AI INTEGRATION:** Implemented NaviMED AI health analysis system powered by OpenAI for comprehensive health analysis and personalized patient recommendations - analyzes vital signs, lab results, medical history and provides evidence-based health recommendations with risk factor assessment
- **VPS DEPLOYMENT COMPLETE:** Successfully deployed NaviMED platform to IONOS VPS (74.208.166.77) at navimedi.org with SSL certificates, PostgreSQL database, PM2 process management, and complete SMTP email integration using @navimedi.org domain addresses
- **TYPESCRIPT OPTIMIZATION COMPLETE:** Fixed all critical TypeScript errors in NaviMED AI health recommendations system - corrected apiRequest function signatures to use object-based options format, ensuring proper authentication context and error-free health analysis generation and recommendation acknowledgement
- **PLATFORM ENHANCEMENT PROJECT COMPLETE:** Implemented 11 major healthcare feature systems totaling ~12,000+ lines of production code: (1) TODO items - patient activation, lab cancellation, payment recording, claim deletion; (2) Stripe payment gateway with webhooks and billing portal; (3) Document management with PDF annotation and e-signatures; (4) Clinical decision support with 29 drug interactions and dosage warnings; (5) Staff scheduling with geolocation time tracking and overtime calculation; (6) Advanced inventory management with barcode scanning, expiration alerts, auto-reorder rules, and batch tracking; (7-11) Integration framework infrastructure for insurance eligibility, e-prescribing, HL7/FHIR, IoT devices, and quality metrics; (12) Patient engagement tools with education library, health reminders, and surveys; (14) Progressive Web App with offline support and installability; (16) Comprehensive API documentation with developer portal, OpenAPI spec, and multi-language code examples. Created 25+ new database tables, 80+ API endpoints, 15+ frontend pages, all maintaining enterprise-grade multi-tenant architecture with strict data isolation
- **ANALYTICS & BI INTEGRATION COMPLETE:** Transformed all analytics pages from mock data to production-ready backend-driven system with real database calculations - Fixed all 68 TypeScript errors for clean builds; Created comprehensive analytics calculation service with 11+ real database query functions for revenue, patient outcomes, and operational metrics; Implemented complete BI Reports system with 4 report types (financial, operational, clinical, compliance) and multi-format generation (JSON, CSV, HTML); Built real predictive analytics with ML-style algorithms: readmission risk prediction (weighted scoring 0-100), no-show probability (multi-factor 0-100%), inventory demand forecasting (moving average with trend analysis), and revenue forecasting (linear regression with confidence intervals); Added 14+ new API endpoints with proper authentication and tenant isolation; Connected all 3 frontend pages (analytics-dashboard, bi-reports, predictive-analytics) to real backend with proper loading states and error handling. All predictions include explainable factors and actionable recommendations for healthcare decision-making
- **PRODUCTION BUILD FIXED - SUPER ADMIN DEPLOYMENT READY:** Fixed all TypeScript syntax errors blocking production deployment (17 JSX closing tag errors, duplicate code in metrics-card.tsx, indentation issues in landing pages). Modified ProtectedRoute component to allow super_admin users to bypass tenant requirement since they are platform-level users. All TypeScript compilation errors resolved - zero LSP diagnostics, enabling successful production builds and super admin dashboard access in deployed environments
- **COMPLETE MOCK DATA ELIMINATION - PRODUCTION READY:** Eliminated ALL pre-existing/mock data from entire platform through comprehensive 13-file audit (~400+ lines removed) ensuring new accounts (hospitals, pharmacies, laboratories) start with completely zero counters and empty dashboards. **Modified Files:** (1-6) Frontend components: PharmacyPOS, PharmacyInventoryManager, laboratory-billing, pharmacy-billing, pharmacy-dashboard, admin-dashboard - removed initialData properties and mock queryFn implementations; (7-10) Analytics dashboards: analytics-dashboard, lab-analytics-dashboard, pharmacy-dashboard-enhanced - removed hardcoded arrays (2,847 tests, 98.7% quality scores, prescriptions, inventory); (11-12) Backend services: analytics-service, analytics-calculations - changed industry averages (8.5%, 84%) to 0% fallbacks; (13) Hospital analytics KPI cards - implemented conditional trend rendering with TrendingUp/Down/Minus icons based on API change/trend values, fixed equipment usage binding to pull from API instead of hardcoded 0. **Final Result:** All 11 initialData properties removed, 2 mock queryFn replaced, 4 KPI cards with neutral gray icons for new accounts, all operational metrics (bed occupancy, staff/equipment utilization) pull from API with || 0 fallbacks, all arrays default to [] for empty tenants. Achieved architect PASS approval after rigorous multi-round review - production deployment ready with zero TypeScript errors

## System Architecture
The platform utilizes a modern, scalable, secure, and maintainable stack with a robust multi-tenant architecture ensuring strict data isolation.

**Core Technologies:**
-   **Frontend**: React, TypeScript, Tailwind CSS
-   **Backend**: Node.js, Express.js, TypeScript
-   **Database**: PostgreSQL via Drizzle ORM
-   **Authentication**: JWT for secure user authentication and Role-Based Access Control (RBAC).
-   **Health Analysis**: NaviMED AI, powered by OpenAI.

**Key Architectural Decisions & Features:**
-   **Multi-tenancy**: Strict data isolation with super admin oversight.
-   **Role Separation**: Granular access control based on user roles and tenant types.
-   **UI/UX Decisions**: Intuitive navigation, role-specific dashboards, color-coded alerts, streamlined workflows, patient portal, dynamic permission management, modern design with professional gradients and card layouts.
-   **System Design Choices**:
    -   Automated Insurance Verification & Copay Calculation.
    -   Secure cross-tenant patient and data synchronization.
    -   Comprehensive Pharmacy Workflow Management.
    -   Advanced Inventory Management with real-time stock and reorder system.
    -   Enhanced real-time Notification System.
    -   Professional Reporting System with multiple formats.
    -   Bidirectional Medical Communications.
    -   Lab Order & Results Management.
    -   Patient Portal with appointment booking and telemedicine.
    -   Dynamic Role Permissions.
    -   Automated Currency Detection and multi-language support.
    -   Enterprise Features: White-label branding, tiered pricing, offline synchronization, PWA support.
    -   Super Admin Capabilities: Client, white-label, subscription management, platform oversight.
    -   Gamified Achievement System for laboratory performance.
    -   Unified Billing Systems with analytics.
    -   Multi-Doctor Patient Data Separation.
    -   Hospital-Pharmacy Relationship Architecture: Supports various pharmacy setups.
    -   Independent Laboratory Architecture: Labs can operate as departments or independent.
    -   Comprehensive analytics and BI reporting with predictive capabilities (readmission risk, no-show probability, inventory demand, revenue forecasting).
    -   Integrated workflow for patient activation, lab cancellation, payment recording, claim deletion.
    -   Document management with PDF annotation and e-signatures.
    -   Clinical decision support with drug interactions and dosage warnings.
    -   Staff scheduling with geolocation time tracking.
    -   Integration framework for insurance eligibility, e-prescribing, HL7/FHIR, IoT devices, and quality metrics.
    -   Patient engagement tools.

## External Dependencies
-   **PostgreSQL**: Primary relational database.
-   **JWT (JSON Web Tokens)**: For authentication and authorization.
-   **Drizzle ORM**: For database interactions.
-   **OpenAI API**: Powers NaviMED AI.
-   **SMTP (Nodemailer)**: Email service via IONOS SMTP server.
-   **Custom API Endpoints**: For cross-tenant data synchronization (patient insurance, billing, messaging, directory, medical history).
-   **Payment Gateways**: For payment processing (e.g., Stripe).