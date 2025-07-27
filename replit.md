# NAVIMED - Multi-Tenant Healthcare Platform

## Overview

NAVIMED is a comprehensive multi-tenant EHR/EMR/CRM system designed to serve multiple healthcare organizations from a single secure application. The platform supports hospitals, clinics, pharmacies, laboratories, and insurance providers with complete data isolation and role-based access control.

## User Preferences

Preferred communication style: Simple, everyday language.

## Super Admin Account
- Email: abel@argilette.com
- Password: Serrega1208@
- Role: Platform Super Admin
- Tenant: ARGILETTE Platform (platform owner)
- Access: Can view all tenant accounts and activities

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with custom configuration for development and production
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom healthcare-specific color schemes
- **State Management**: TanStack Query for server state, React Context for authentication and tenant management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Authentication**: JWT-based with bcrypt password hashing
- **Session Management**: Express sessions with PostgreSQL storage

### Multi-Tenancy Implementation
- **Tenant Isolation**: Logical separation using tenant IDs in all database queries
- **Authentication**: JWT tokens include tenant context
- **Middleware**: Custom tenant context middleware ensures proper data isolation
- **Role-Based Access**: Granular permissions system with healthcare-specific roles

## Key Components

### Database Schema (Drizzle ORM)
- **Multi-tenant aware**: All tables include tenantId for data isolation
- **Healthcare entities**: Patients, appointments, prescriptions, lab orders, insurance claims
- **User management**: Role-based user system with tenant-specific permissions
- **Audit logging**: Complete activity tracking for compliance

### Authentication System
- **JWT-based authentication** with 8-hour token expiration
- **Password security** using bcrypt hashing
- **Role-based authorization** middleware
- **Tenant context** validation on all protected routes

### Frontend Context Providers
- **AuthContext**: Manages user authentication state and login/logout
- **TenantContext**: Handles tenant switching for super admins and tenant isolation
- **Protected routes** with role-based access control

### UI Components
- **Healthcare-optimized design** with medical color schemes
- **Responsive layout** with sidebar navigation
- **Form components** for clinical data entry
- **Dashboard widgets** for healthcare metrics
- **Patient management** interface with search and filtering

## Data Flow

### Authentication Flow
1. User submits credentials with tenant ID
2. Server validates credentials against tenant-specific user records
3. JWT token generated with user and tenant context
4. Client stores token and user data in localStorage
5. All subsequent requests include token in Authorization header

### Multi-Tenant Data Access
1. Middleware extracts tenant context from JWT or subdomain
2. All database queries automatically filtered by tenant ID
3. Role-based permissions enforce feature access
4. Audit logs track all tenant activities

### Clinical Workflow
1. Patient registration and medical record management
2. Appointment scheduling with provider assignment
3. **Reception vital signs collection** - First step when patient arrives for appointment
4. Doctor consultation and examination
5. **Visit summary generation** - Includes vital signs from reception
6. Prescription management with pharmacy integration
7. Lab order processing and results management
8. Insurance claim processing and billing

## External Dependencies

### Database
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **connect-pg-simple**: PostgreSQL session store

### Authentication & Security
- **bcrypt**: Password hashing
- **jsonwebtoken**: JWT token management
- **express-session**: Session management

### Frontend Libraries
- **@tanstack/react-query**: Server state management
- **@hookform/resolvers**: Form validation integration
- **wouter**: Lightweight React router
- **date-fns**: Date manipulation utilities

### UI Framework
- **@radix-ui/react-***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

## Deployment Strategy

### Development
- **Vite dev server** with HMR support
- **Concurrent backend/frontend** development
- **TypeScript checking** and ES module support
- **Replit integration** with development banner

### Production Build
- **Frontend**: Vite build to static assets
- **Backend**: esbuild bundle for Node.js deployment
- **Database migrations**: Drizzle Kit for schema management
- **Environment variables**: Required DATABASE_URL and JWT_SECRET

### Database Management
- **Schema location**: `shared/schema.ts` for type sharing
- **Migrations**: Generated in `./migrations` directory
- **Push commands**: `db:push` for development schema updates

### Security Considerations
- **Tenant isolation**: Enforced at database query level
- **HIPAA compliance**: Audit logging and data encryption
- **Role-based access**: Healthcare-specific permission system
- **JWT security**: Short-lived tokens with secure secret management

## Recent Changes

### January 26, 2025
- ✓ Created modern landing page with NAVIMED logo showcasing multilingual platform features
- ✓ Implemented strict tenant isolation architecture with super admin oversight
- ✓ Set up platform super admin account (abel@argilette.com) with access to all tenant data  
- ✓ Created ARGILETTE platform tenant as the master organizational unit
- ✓ Fixed database connection and schema deployment issues
- ✓ Added comprehensive healthcare workflow features (EHR/EMR/CRM integration)
- ✓ Built platform owner dashboard showing aggregated data across all healthcare organizations
- ✓ Implemented role-based dashboards: super admin sees platform metrics, tenants see clinical data
- ✓ Created comprehensive User Roles management system with healthcare-specific permissions
- ✓ Added HIPAA compliance and audit logging features with real-time monitoring
- ✓ Fixed authentication token flow and eliminated infinite API loops for stable performance
- ✓ Implemented subscription revenue tracking with real revenue data from database
- ✓ Added comprehensive Reports & Analytics system with 6 healthcare report types
- ✓ Created report generation functionality with PDF/Excel/CSV export options
- ✓ Updated platform dashboard to display real subscription revenue totals and monthly income
- ✓ Added Reports navigation item for all tenant users with role-based access control
- ✓ Implemented cross-tenant report generation allowing platform owners to generate reports for any clinic
- ✓ Added audit logging for cross-tenant activities with dual-tenant tracking
- ✓ Created test healthcare organizations (Metro General Hospital, City Health Clinic, Wellness Pharmacy)
- ✓ Completed full download functionality for generated reports with authentication
- ✓ Fixed token authentication issues and implemented secure file downloads for PDF/Excel/CSV formats
- ✓ Added proper error handling and user feedback for report generation and downloads
- ✓ Fixed Reports tab visibility for super admin users in sidebar navigation
- ✓ Cross-tenant report generation and download system fully operational
- ✓ **Completed vital signs collection system at reception with full workflow integration**
- ✓ **Fixed authentication middleware and audit log issues for vital signs functionality**
- ✓ **Implemented vital signs display in appointments with green status indicators**
- ✓ **Enhanced appointment details dialog to show complete vital signs measurements**
- ✓ **Established reception → vital signs → doctor consultation → visit summary workflow**
- ✓ Implemented fully functional "View Details" and "Manage Users" buttons for organizations
- ✓ Created comprehensive user management system for healthcare organizations
- ✓ Added professional modal dialogs replacing browser alert popups for organization details
- ✓ Built user creation interface with healthcare-specific roles (Physician, Nurse, Pharmacist, etc.)
- ✓ Enhanced organization details display with user-friendly configuration formatting
- ✓ Added cross-tenant user management capabilities for platform super admins
- ✓ Fixed User Roles deactivate button functionality with proper API endpoints
- ✓ Protected super admin roles from deactivation ensuring platform security
- ✓ Implemented role hierarchy where platform owners cannot deactivate permanent roles
- ✓ Added comprehensive contextual help tooltips for user role management system
- ✓ Implemented detailed role permission tooltips explaining healthcare-specific access levels
- ✓ Added interactive help elements for statistics cards, filters, and form fields
- ✓ Fixed ARGILETTE tenant configuration to properly reflect platform owner status
- ✓ Updated database schema to include "platform" tenant type for technology providers
- ✓ Corrected ARGILETTE description as healthcare technology platform provider, not hospital
- ✓ Created comprehensive role-specific dashboards for all healthcare actors
- ✓ Implemented tailored interfaces for physicians, nurses, pharmacists, lab technicians
- ✓ Added specialized dashboards for receptionists, billing staff, insurance managers, and patients
- ✓ Built tenant admin dashboard for organization management and oversight
- ✓ Enhanced user experience with role-appropriate metrics, workflows, and quick actions
- ✓ Implemented comprehensive role-based user management system for healthcare organizations
- ✓ Added tenant admin privileges for creating and managing clinical and operational staff
- ✓ Enforced role hierarchy preventing tenant admins from creating other admin users
- ✓ Built secure user creation API with proper authentication and authorization checks
- ✓ Fixed user data filtering and role-based access control throughout the application
- ✓ Created test admin user for Metro General Hospital (madjewaba@hotmail.com) with user management capabilities
- ✓ Added Director role to healthcare role management system with executive-level access permissions
- ✓ Updated role hierarchy to include directors with organizational oversight capabilities
- ✓ Enhanced user creation form and role filtering to support director role selection
- ✓ Implemented comprehensive director role permissions with strategic access to organizational metrics
- ✓ Completed fully functional billing system with insurance claim lifecycle management
- ✓ Built comprehensive claim creation interface with 5 test patients for realistic data testing
- ✓ Implemented detailed claim viewing dialog with complete patient and medical code information
- ✓ Added successful claim submission functionality changing status from draft to submitted
- ✓ Fixed critical date serialization issues in PATCH endpoints for proper claim status updates
- ✓ Integrated real-time claim list refresh and status tracking throughout the billing workflow
- ✓ Implemented insurance provider linking system with dedicated insurance_providers and patient_insurance tables
- ✓ Added 4 major insurance providers (Blue Cross Blue Shield, Aetna, Medicare, United Healthcare) with patient linkage
- ✓ Enhanced billing form with dynamic insurance provider selection showing policy numbers and primary status
- ✓ Fixed duplicate claim number constraint violations with unique timestamp-based generation system
- ✓ Completed end-to-end insurance integration ensuring claims route to patient's specific insurance coverage
- ✓ Added 5 test physician providers (Dr. Smith, Johnson, Brown, Wilson, Garcia) for appointment scheduling
- ✓ Implemented provider selection functionality in appointment forms with proper API endpoints
- ✓ Fixed appointment date field responsiveness and resolved TypeScript compilation errors
- ✓ Resolved appointment creation permissions and date type conversion issues for full functionality
- ✓ Created comprehensive patient registration form with modal dialog interface
- ✓ Fixed "New Patient" 404 error by implementing proper patient creation functionality
- ✓ Enhanced doctor dashboards to display real scheduled appointments for each physician
- ✓ Implemented role-based audit log access restrictions for proper security compliance
- ✓ Fixed authentication flow requiring multiple login attempts by improving state management
- ✓ Resolved patient creation validation errors with automatic MRN generation and proper date handling
- ✓ Fixed EHR modal React rendering issues for complex object fields (address, emergency contact, insurance)
- ✓ Enhanced appointment visibility for physicians with comprehensive dashboard and schedule views
- ✓ Implemented "All Appointments" default view with flexible date filtering options for better appointment management
- ✓ Added detailed appointment display showing patient info, chief complaints, provider details, and status tracking
- ✓ Completed fully functional patient registration and EHR viewing system with professional medical interface
- ✓ Fixed prescription creation functionality with proper authentication and role-based access control
- ✓ Resolved authentication middleware conflicts that were preventing prescription API requests
- ✓ Implemented comprehensive prescription management with automatic date handling and field validation
- ✓ Added support for physicians, nurses, tenant admins, directors, and super admins to create prescriptions
- ✓ Enhanced prescription system with proper audit logging and tenant isolation for HIPAA compliance
- ✓ Fixed lab order creation functionality with proper authentication and role-based access control
- ✓ Implemented multiple lab test ordering system allowing doctors to order comprehensive lab panels
- ✓ Enhanced lab order form with dynamic test addition, individual priorities, and batch processing capabilities
- ✓ Added 17 common lab tests including CBC, metabolic panels, cultures, and specialized tests
- ✓ Created efficient batch API processing for multiple lab orders with general instructions support
- ✓ **Enhanced AI Health Recommendations to actively pull lab results directly from database**
- ✓ **Updated AI health analyzer to incorporate lab results data alongside vital signs and appointments**
- ✓ **Fixed all integration issues and created comprehensive patient analysis using complete medical data**
- ✓ **Added test lab results data with realistic medical values for demonstration purposes**
- ✓ **Improved AI analysis prompt to include lab results information for more accurate health insights**
- ✓ **Implemented comprehensive prescription details viewing system with complete medication information**
- ✓ **Added detailed prescription dialog showing patient info, medication details, dosage, instructions, and status**
- ✓ **Created role-based prescription management with pharmacist and physician action buttons**
- ✓ **Integrated Gemini AI as primary health analysis provider with intelligent fallback system**
- ✓ **Fixed audit logging issues and enhanced health analysis system stability**
- ✓ **Completed prescription workflow with full medication details accessibility for healthcare providers**
- ✓ **Implemented comprehensive lab results viewing system with detailed medical information and clinical data**
- ✓ **Added advanced lab order details dialog showing patient info, test specifications, and clinical history**
- ✓ **Created sophisticated lab results viewer with color-coded abnormal flags and reference ranges**
- ✓ **Enhanced results display with critical/high/low/normal visual indicators for immediate clinical assessment**
- ✓ **Built role-based lab management interface for technicians and healthcare providers**
- ✓ **Implemented independent pharmacy organization system with separate tenant registration**
- ✓ **Created comprehensive pharmacy registration form with licensing, services, and administrator setup**
- ✓ **Added pharmacy registration API endpoint with tenant creation and admin user setup**
- ✓ **Enhanced landing page with independent pharmacy registration section alongside laboratory services**
- ✓ **Created 3 test independent pharmacy organizations: Metro Pharmacy, Wellness Rx, Community Care**
- ✓ **Established pharmacy tenant system allowing independent pharmacies to register and operate separately**
- ✓ **Built pharmacy network architecture where pharmacies receive prescriptions from multiple healthcare providers**
- ✓ **Created specialized pharmacy dashboard focused on prescription processing workflow**
- ✓ **Implemented 4-step pharmacy workflow: receive prescriptions → process → file insurance claims → dispense with copay collection**
- ✓ **Built pharmacy operations interface with prescription status tracking (received, processing, ready, dispensed)**
- ✓ **Added insurance claim filing system with copay calculation and patient payment collection**
- ✓ **Enhanced pharmacy dashboard with revenue tracking and real-time prescription metrics**