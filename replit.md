# Healthcare Management Platform

## Project Overview
A comprehensive multi-tenant healthcare management platform specializing in pharmacy operations and workflow optimization, with advanced capabilities for prescription management and insurance claims processing.

## Recent Changes (Latest)
- **CUSTOMIZED PHARMACY INTERFACE** - Tailored UI for pharmacy operations workflow
- **Removed appointments from pharmacy navigation** - Pharmacy users no longer see appointment management
- **Removed lab orders from pharmacy header** - Lab orders hidden from top navigation for pharmacy users
- **Hidden Add Patient button for pharmacy** - Pharmacy staff cannot add new patients directly
- **FIXED MEDICATION CLAIMS SYSTEM** - Insurance claims for pharmacy medications work perfectly

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