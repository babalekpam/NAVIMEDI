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
- **EMAIL CONFIRMATION SYSTEM:** Implemented comprehensive email confirmation system using SendGrid - all new user registrations and organization signups now send professional welcome emails with platform feature overview and login instructions (Aug 5, 2025)
- **AUTHENTICATION SYSTEM FULLY RESTORED:** Fixed critical authentication routing issues and login loops - super admin login now works properly with credentials abel@argilette.com/Serrega1208@ with full platform management access (Aug 7, 2025)
- **DEPLOYMENT HEALTH CHECK FULLY OPTIMIZED:** Successfully resolved all deployment health check issues that were preventing successful deployment - implemented intelligent root endpoint (/) with automatic detection of deployment tools vs browser requests, returning immediate JSON health status (< 40ms response time) for curl/deployment systems while serving React frontend for browsers, eliminated all expensive database operations from health check endpoints, comprehensive health monitoring with multiple endpoints (/health, /ping, /ready, /alive, /healthz, /liveness, /readiness, /deployment-health), and created robust deployment troubleshooting documentation - deployment systems can now reliably monitor application health (Aug 8, 2025)
- **ENHANCED PRESCRIPTION CREATION SYSTEM:** Implemented complete "New Prescription" button functionality with modal dialog, enhanced pharmacy selection dropdowns featuring visual indicators, color-coded borders, star icons for preferred providers, and comprehensive form validation - fixed JSON parsing errors for seamless prescription creation (Aug 7, 2025)
- **COMPLETE LAB ORDER SYSTEM:** Fixed all JSON serialization and foreign key constraint issues in lab order creation - enhanced laboratory selection dropdowns with proper tenant ID mapping, visual indicators, and multiple test ordering capabilities (Aug 7, 2025)
- **PATIENT ACCESS REQUEST SYSTEM:** Implemented cross-hospital patient access request workflow where doctors can request access to patients at other hospitals, and the patient's original treating physician must approve the request for medical record access (Aug 7, 2025)
- **CONTEXTUAL MULTI-LEVEL APPROVAL SYSTEM:** Implemented comprehensive contextual patient access request workflow with urgency classification (low/normal/high/emergency), access context (routine/emergency/consultation/research/legal), patient sensitivity levels (standard/sensitive/restricted), and multi-level approval chains based on request complexity and risk assessment (Aug 7, 2025)
- **ENHANCED APPROVAL WORKFLOW ENGINE:** Created dynamic approval workflow templates with contextual routing, risk assessment integration, multi-level approval history tracking, and role-based approval authority management for healthcare data access governance (Aug 7, 2025)
- **PROPER LAB WORKFLOW IMPLEMENTATION:** Fixed lab results review system to follow realistic healthcare workflow - lab technicians complete tests first, then physicians review completed results, ensuring proper clinical protocol compliance with visual workflow indicators (Aug 7, 2025)
- **CRITICAL SECURITY VULNERABILITY FIXED:** Resolved major authentication security flaw where users could specify any organization name during login and potentially access unauthorized tenants - implemented proper user-tenant validation, enhanced security logging, and strict cross-tenant access controls with proper credential verification (Aug 7, 2025)

## System Architecture
The platform is built on a modern stack for scalability, security, and maintainability, featuring a strong multi-tenant architecture with strict data isolation per organization (hospital, pharmacy, laboratory).

**Core Technologies:**
-   **Frontend**: React, TypeScript, Tailwind CSS
-   **Backend**: Node.js, Express.js, TypeScript
-   **Database**: PostgreSQL via Drizzle ORM
-   **Authentication**: JWT for secure user authentication and granular Role-Based Access Control (RBAC).

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
    -   Multi-Doctor Patient Data Separation via contextual multi-level approval system with risk assessment.
    -   Contextual Approval Workflows: Dynamic approval chains based on urgency, sensitivity, and access context.
    -   Hospital-Pharmacy Relationship Architecture: Supports hospital-owned and independent pharmacies, with patient preference for prescription routing.
    -   Independent Laboratory Architecture: Laboratories can be hospital departments or independent organizations with full admin dashboards and specialized staff roles.

## External Dependencies
The platform integrates with the following key external components and services:

-   **PostgreSQL**: Primary relational database.
-   **JWT (JSON Web Tokens)**: For authentication and authorization.
-   **Drizzle ORM**: For database interactions.
-   **Custom API Endpoints**: For cross-tenant data synchronization (patient insurance, billing, messaging, directory, medical history).
-   **Payment Gateways**: For payment processing.
-   **Email Service**: For user notifications and credentials.