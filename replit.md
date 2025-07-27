# Healthcare Management Platform

## Project Overview
A comprehensive multi-tenant healthcare management platform specializing in pharmacy operations and workflow optimization, with advanced capabilities for prescription management and insurance claims processing.

## Recent Changes (Latest)
- **IMPLEMENTED PRESCRIPTION ROUTING SYSTEM** - Doctors/hospitals send prescriptions directly to patient's chosen pharmacy
- **PHARMACY PATIENT ACCESS RESTRICTION** - Pharmacies only see patients with prescriptions sent to them
- **Updated database schema** - Added pharmacyTenantId and routing timestamps to prescriptions
- **Created test prescriptions** - 3 test prescriptions routed to Working Test Pharmacy for testing
- **CUSTOMIZED PHARMACY INTERFACE** - Tailored UI for pharmacy operations workflow
- **FIXED MEDICATION CLAIMS SYSTEM** - Insurance claims for pharmacy medications work perfectly
- **ADDED PRESCRIPTION PROVENANCE DISPLAY** - Prescriptions show doctor name and hospital name
- **ENHANCED CLAIM FILING WORKFLOW** - One-click insurance claim filing for received prescriptions

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