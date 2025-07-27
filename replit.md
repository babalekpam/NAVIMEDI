# Healthcare Management Platform

## Project Overview
A comprehensive multi-tenant healthcare management platform specializing in pharmacy operations and workflow optimization, with advanced capabilities for prescription management and insurance claims processing.

## Recent Changes (Latest)
- **IMPLEMENTED AUTOMATIC TRIAL SUSPENSION SYSTEM** - 14-day trials with hourly automated checks and account suspension after expiration
- **ARGILETTE PLATFORM OWNER EXCLUSION** - Platform owner (ARGILETTE) has unlimited access with no trial limitations or expiration
- **TRIAL STATUS DASHBOARD** - Complete trial management interface with progress tracking and admin controls
- **ENHANCED LOGIN SECURITY** - Suspended accounts blocked with clear upgrade messaging during login attempts
- **UPDATED PRICING PLANS** - Added $20.99 to all tiers: Starter ($49.99), Professional ($119.99), Enterprise ($319.99), White Label ($1019.99)
- **IMPLEMENTED COMPREHENSIVE ENTERPRISE FEATURES** - Full pricing/packaging, multi-language support, white label capabilities, and offline functionality
- **ADDED MULTI-LANGUAGE SUPPORT** - Language selector component with English, Spanish, French translations and extensible framework
- **IMPLEMENTED OFFLINE SYNC CAPABILITIES** - Offline data management and synchronization for enterprise deployment scenarios
- **COMPLETED DATABASE SCHEMA** - All enterprise tables (subscriptions, pricing plans, translations, white-label settings, trial tracking) implemented
- **IMPLEMENTED PRESCRIPTION ROUTING SYSTEM** - Doctors/hospitals send prescriptions directly to patient's chosen pharmacy
- **PHARMACY PATIENT ACCESS RESTRICTION** - Pharmacies only see patients with prescriptions sent to them
- **FIXED MEDICATION CLAIMS SYSTEM** - Insurance claims for pharmacy medications work perfectly
- **ADDED PUBLIC ORGANIZATION REGISTRATION** - Organizations can register directly from landing page

## User Preferences
- Simple, everyday language for communication (user is non-technical)
- Focus on functionality testing rather than code details
- Prioritize working features over perfect TypeScript compliance

## Current Status
✅ **Working Features:**
- Authentication system (login/logout)
- Dashboard with metrics display
- Patient management interface
- Insurance claims processing (medication claims fully functional)
- Prescription management (displays test prescriptions)
- Multi-tenant pharmacy operations
- Billing and claims submission workflow
- Insurance coverage breakdown (80% insurance / 20% patient copay)
- Organization/tenant creation and management
- Prescription routing from hospitals to pharmacies
- Public organization registration (no admin intervention required)
- Simplified login system for new organizations
- **Enterprise Features:**
  - Pricing plans page with 4-tier structure (Basic, Professional, Enterprise, White Label)
  - White label settings with custom branding and color themes
  - Multi-language support (English, Spanish, French) with extensible framework
  - Offline sync capabilities for enterprise deployment
  - Language selector component with real-time translation

⚠️ **Known Issues:**
- 122 TypeScript diagnostics remain in server routes (non-blocking for functionality)
- Some minor type inconsistencies in legacy route handlers

## Architecture
- **Frontend:** React with TypeScript, Tailwind CSS
- **Backend:** Node.js/Express with TypeScript
- **Database:** PostgreSQL with Drizzle ORM
- **Authentication:** JWT-based with role-based access control
- **Multi-tenancy:** Tenant-isolated data with super admin capabilities

## Available Login Credentials

### Super Admin (Platform Owner)
- Email: `abel@argilette.com`
- Password: `Serrega1208@`
- Access: All tenants and system management

### Pharmacy Admin (Working Test Pharmacy)
- Email: `admin@workingtest.com`
- Password: `admin123`
- Tenant: `working-test`
- Access: Pharmacy operations and patient management

## Development Notes
- Application runs on port 5000
- Database auto-initializes with test data
- TypeScript strict mode enabled with some legacy compatibility issues
- Real-time data fetching operational for all major entities