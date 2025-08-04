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
    -   Multi-Doctor Patient Data Separation via access request system.
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