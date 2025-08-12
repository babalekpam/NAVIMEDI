# Healthcare Management Platform

## Overview
NaviMED is a multi-tenant healthcare platform designed to connect independent pharmacies and hospitals, streamlining prescription management, insurance claims processing, patient record management, and inter-organizational communication. Its primary purpose is to enhance efficiency, improve patient care outcomes, and ensure secure, compliant data handling within the healthcare ecosystem. The long-term vision is to establish NaviMED as a leading integrated healthcare management system.

## User Preferences
- Simple, everyday language for communication (user is non-technical)
- Focus on functionality testing rather than code details
- Prioritize working features over perfect TypeScript compliance

## System Architecture
The platform is built on a modern stack emphasizing scalability, security, and maintainability. It features a robust multi-tenant architecture with strict data isolation per organization (hospital, pharmacy, laboratory) and enforced access control based on user roles and tenant types.

**Core Technologies:**
- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL via Drizzle ORM
- **Authentication**: JWT for secure user authentication and granular Role-Based Access Control (RBAC).

**Key Architectural Decisions & Features:**
- **Multi-tenancy**: Strict data isolation with controlled cross-tenant interactions for specific workflows.
- **UI/UX Decisions**: Intuitive navigation, distinct role-based dashboards, color-coded alerts, streamlined workflows, comprehensive patient portal, and dynamic permission management UI.
- **Technical Implementations**:
    - Automated Insurance Verification & Copay Calculation.
    - Secure cross-tenant patient and data synchronization.
    - Comprehensive Pharmacy Workflow Management (New → Insurance Verification → Processing → Ready → Dispensed).
    - Advanced Inventory Management and Professional Reorder System.
    - Enhanced real-time Notification System and Professional Reporting System.
    - Bidirectional Medical Communications, Lab Order & Results Management.
    - Patient Portal with appointment booking and telemedicine integration.
    - Dynamic Role Permissions for tenant administrators.
    - Automated Currency Detection and Complete Multi-language Support.
    - Enterprise Features: White-label branding, tiered pricing, offline synchronization.
    - Super Admin Capabilities: Client management, white label settings, subscription management, platform oversight.
    - Gamified Achievement System for laboratory performance.
    - Unified Billing Systems for hospital, pharmacy, and laboratory.
    - Multi-Doctor Patient Data Separation and Contextual Multi-Level Approval System for healthcare data access governance, with dynamic approval workflow templates.
    - Architecture supports Hospital-Pharmacy Relationships (hospital-owned and independent pharmacies) and Independent Laboratory Integration (hospital departments or independent).

## External Dependencies
- **PostgreSQL**: Primary relational database.
- **JWT (JSON Web Tokens)**: For authentication and authorization.
- **Drizzle ORM**: For database interactions.
- **Custom API Endpoints**: For cross-tenant data synchronization (patient insurance, billing, messaging, directory, medical history).
- **Payment Gateways**: For payment processing.
- **Email Service**: SendGrid.