# Healthcare Management Platform

## Overview
NaviMED is a multi-tenant healthcare platform connecting independent pharmacies with hospitals to streamline prescription management, facilitate insurance claims, manage patient records, and enhance communication. It aims to be the leading solution for pharmacy-hospital connectivity, improving efficiency, patient care, and data management securely and compliantly.

## User Preferences
- Simple, everyday language for communication (user is non-technical)
- Focus on functionality testing rather than code details
- Prioritize working features over perfect TypeScript compliance
- Super admin account: abel@argilette.com with unlimited privileges and white label access
- Enable multi-language support and offline mode for starter plan (updated Aug 3, 2025)
- Complete 100% translation system implementation (fixed Aug 4, 2025)
- Fixed organization registration authorization issues - registration now works without authentication tokens (Aug 4, 2025)
- Confirmed enterprise-grade multi-tenant architecture with complete data isolation between all organizations (Aug 4, 2025)
- **SUPPLIER AUTHENTICATION SOLUTION:** Created unified supplier portal at `/supplier-portal` with combined login/signup functionality (Aug 4, 2025)
- Fixed supplier registration validation by properly mapping form fields to database schema and excluding auto-generated fields (Aug 4, 2025)
- **COMPLETE SUPPLIER MANAGEMENT SYSTEM:** Implemented full supplier registration, approval, and rejection workflow with super admin dashboard (Aug 4, 2025)
- Fixed database schema issues, unique slug generation, and JSON parsing errors for seamless supplier operations (Aug 4, 2025)
- **AUTOMATIC MARKETPLACE INTEGRATION:** Enhanced supplier approval process to automatically create tenant accounts and sample marketplace products for approved suppliers (Aug 4, 2025)
- **COMPLETE QUOTE REQUEST SYSTEM:** Implemented functional quote request functionality with database schema, API endpoints, form validation, and proper error handling for marketplace customers (Aug 4, 2025)
- **ROLE-BASED ADVERTISEMENT ACCESS:** Fixed authorization issues - healthcare practices (hospitals, pharmacies, laboratories) can now only view and contact advertisers, while advertisement posting is restricted to suppliers only (Aug 4, 2025)
- **FUNCTIONAL INQUIRY SYSTEM:** Implemented complete contact functionality for advertisements with expandable inquiry forms, backend API validation, and success notifications (Aug 4, 2025)
- **CAROUSEL IMAGE DISPLAY FIXED:** Completely resolved carousel image display issue - all 6 professional healthcare images now display clearly with proper asset imports and new landing page implementation (Aug 5, 2025)
- **COMPREHENSIVE COUNTER RESET SYSTEM:** Implemented complete counter reset functionality for all accounts - work shifts, user statistics, advertisement performance, marketplace analytics, activity points, and stock quantities all reset to zero for accurate new user signups (Aug 5, 2025)
- **HOSPITAL DASHBOARD METRICS DISPLAY FIXED:** Completely resolved dashboard display issue by fixing duplicate function definitions and database data type conversion - hospital admin dashboard now shows real-time metrics (9 appointments, lab results, prescriptions, claims totals) with full management interface (Aug 5, 2025)
- **ALERT SYSTEM COMPLETELY FIXED:** Removed all hardcoded notifications from bell icon and alert panels - now only displays real-time alerts when actual data exists (Aug 5, 2025)
- **EMAIL CONFIRMATION SYSTEM:** Implemented comprehensive email confirmation system using SMTP (Nodemailer) - all new user registrations and organization signups now send professional welcome emails with platform feature overview and login instructions through IONOS SMTP server (Aug 5, 2025)
- **AUTHENTICATION SYSTEM FULLY RESTORED:** Fixed critical authentication routing issues and login loops - super admin login now works properly with credentials abel@argilette.com/Serrega1208@ with full platform management access (Aug 7, 2025)
- **DEPLOYMENT READY:** Fixed health check timeout issues that prevented deployment - added multiple fast health check endpoints (/health, /healthz, /status, /ping) that respond immediately without database operations, ensuring successful deployment monitoring (Aug 7, 2025)
- **PHARMACY NAVIGATION SYSTEM COMPLETE:** Fixed comprehensive pharmacy interface with proper header branding (shows "DEO Pharmacy" instead of "Loading...Hospital"), functional top navigation tabs with active styling, and complete sidebar navigation with all 16+ pharmacy service categories pointing to working pages - eliminated all 404 errors (Aug 25, 2025)
- **PRESCRIPTION WORKFLOW BUSINESS RULES ENFORCED:** Fixed critical business rule violation - pharmacies now only receive and process prescriptions from hospitals/doctors, they cannot create new prescriptions. Only physicians and doctors from hospital tenants can generate prescriptions, ensuring proper healthcare workflow compliance (Aug 25, 2025)
- **DASHBOARD UPGRADE PROJECT COMPLETED:** Successfully upgraded all dashboards from mock data to real database connections - fixed laboratory analytics dashboard regression that was showing hardcoded values (2,847 tests, 4.2h turnaround) instead of authentic database values, ensuring all healthcare data displays real operational metrics (Sep 18, 2025)
- **APPOINTMENTS PAGE MODERNIZED:** Completely transformed appointments interface with contemporary healthcare design featuring professional gradients, modern card layouts, enhanced typography, improved spacing, and sophisticated visual hierarchy while preserving all functionality (Sep 18, 2025)
- **PRESCRIPTION MANAGEMENT MODERNIZED:** Completely redesigned prescription management page with contemporary healthcare styling featuring professional gradient backgrounds, modern statistics cards with hover animations, enhanced typography, improved spacing, and sophisticated visual hierarchy while maintaining full prescription workflow functionality including Process, View Details, and New Prescription dialogs (Sep 18, 2025)
- **ARGILETTE LAB INTEGRATION:** Implemented ARGILETTE LAB health analysis system for comprehensive health analysis and personalized patient recommendations - replaced all previous analysis services with unified ARGILETTE LAB PRODUCT that analyzes vital signs, lab results, medical history and provides evidence-based health recommendations with risk factor assessment (Oct 22, 2025)
- **VPS DEPLOYMENT COMPLETE:** Successfully deployed NaviMED platform to IONOS VPS (74.208.166.77) at navimedi.org with SSL certificates, PostgreSQL database, PM2 process management, and complete SMTP email integration using @navimedi.org domain addresses (Oct 22, 2025)

## System Architecture
The platform is built on a modern stack for scalability, security, and maintainability, featuring a strong multi-tenant architecture with strict data isolation per organization (hospital, pharmacy, laboratory).

**Core Technologies:**
-   **Frontend**: React, TypeScript, Tailwind CSS
-   **Backend**: Node.js, Express.js, TypeScript
-   **Database**: PostgreSQL via Drizzle ORM
-   **Authentication**: JWT for secure user authentication and granular Role-Based Access Control (RBAC).
-   **Health Analysis**: ARGILETTE LAB PRODUCT for comprehensive health analysis and patient recommendations - Powered by ARGILETTE.

**Key Architectural Decisions & Features:**
-   **Multi-tenancy**: Strict data isolation per organization (hospital, pharmacy, laboratory) with controlled cross-tenant interactions for prescription routing and lab orders. Super admin capabilities oversee the system.
-   **Role Separation**: Strict access control based on user roles and tenant types.
-   **UI/UX Decisions**: Intuitive navigation with distinct dashboards per role, color-coded alerts, streamlined workflows, comprehensive patient portal, and dynamic permission management UI.
-   **Dynamic Department Management**: Hospital administrators can dynamically create, edit, and delete departments with full CRUD operations, budget management, staff assignments, and head-of-department selection.
-   **Technical Implementations**:
    -   Automated Insurance Verification & Copay Calculation.
    -   Secure cross-tenant patient and data synchronization.
    -   Comprehensive Pharmacy Workflow Management (New → Insurance Verification → Processing → Ready → Dispensed) with real-time updates and professional receipt generation.
    -   Advanced Inventory Management with CRUD operations, real-time stock updates, and persistent state.
    -   Professional Reorder System with dynamic cost calculation and automatic inventory updates.
    -   Enhanced real-time Notification System.
    -   Professional Reporting System with multiple formats and file downloads.
    -   Bidirectional Medical Communications for secure patient-doctor messaging.
    -   Lab Order & Results Management.
    -   Patient Portal with appointment booking and telemedicine integration.
    -   Dynamic Role Permissions for tenant administrators.
    -   Automated Currency Detection and Complete Multi-language Support with 100% translation coverage for English, Spanish, French, and German.
    -   Enterprise Features: White-label branding, tiered pricing, offline synchronization.
    -   Super Admin Capabilities: Unlimited client management, white label settings for all tenants, subscription management, comprehensive platform oversight.
    -   Gamified Achievement System for laboratory performance tracking.
    -   Unified Billing Systems with analytics for hospital, pharmacy, and laboratory.
    -   Multi-Doctor Patient Data Separation via access request system.
    -   Hospital-Pharmacy Relationship Architecture: Supports hospital-owned and independent pharmacies, with patient preference for prescription routing.
    -   Independent Laboratory Architecture: Laboratories can be hospital departments or independent organizations with full admin dashboards and specialized staff roles.

## External Dependencies
The platform integrates with the following key external components and services:

-   **PostgreSQL**: Primary relational database.
-   **JWT (JSON Web Tokens)**: For authentication and authorization.
-   **Drizzle ORM**: For database interactions.
-   **ARGILETTE Technology**: Powers ARGILETTE LAB PRODUCT for comprehensive health analysis and personalized recommendations.
-   **SMTP (Nodemailer)**: Email service using IONOS SMTP server (@navimedi.org addresses).
-   **Custom API Endpoints**: For cross-tenant data synchronization (patient insurance, billing, messaging, directory, medical history).
-   **Payment Gateways**: For payment processing.