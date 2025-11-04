# Healthcare Management Platform

## Overview
NaviMED is a multi-tenant healthcare platform connecting independent pharmacies with hospitals. It streamlines prescription management, insurance claims, patient records, and communication within the healthcare ecosystem. The platform aims to improve efficiency, patient care, and secure data management through features like NaviMED AI for health analysis, robust analytics, and enterprise-grade multi-tenancy, positioning it as a leading solution for pharmacy-hospital connectivity.

## User Preferences
- Simple, everyday language for communication (user is non-technical)
- Focus on functionality testing rather than code details
- Prioritize working features over perfect TypeScript compliance

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
-   **UI/UX Decisions**: Intuitive navigation, role-specific dashboards, color-coded alerts, streamlined workflows, patient portal, dynamic permission management, modern design with professional gradients and card layouts, contemporary healthcare design for appointments and prescription management.
-   **System Design Choices**:
    -   Automated Insurance Verification & Copay Calculation.
    -   Secure cross-tenant patient and data synchronization.
    -   Comprehensive Pharmacy Workflow Management (pharmacies only process, not create, prescriptions).
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
    -   Unified supplier portal with registration, approval, and marketplace integration.
    -   Functional quote request system for marketplace customers.
    -   Role-based advertisement access and inquiry system.
    -   Comprehensive counter reset system for various metrics.
    -   Email confirmation system.

## External Dependencies
-   **PostgreSQL**: Primary relational database.
-   **JWT (JSON Web Tokens)**: For authentication and authorization.
-   **Drizzle ORM**: For database interactions.
-   **OpenAI API**: Powers NaviMED AI.
-   **SMTP (Nodemailer)**: Email service via IONOS SMTP server.
-   **Custom API Endpoints**: For cross-tenant data synchronization (patient insurance, billing, messaging, directory, medical history).
-   **Payment Gateways**: For payment processing (e.g., Stripe).