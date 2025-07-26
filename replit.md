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
3. Prescription management with pharmacy integration
4. Lab order processing and results management
5. Insurance claim processing and billing

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