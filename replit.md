# Healthcare Management Platform

## Project Overview
A comprehensive multi-tenant healthcare management platform specializing in pharmacy operations and workflow optimization, with advanced capabilities for prescription management and insurance claims processing.

## Recent Changes (Latest)
- **FIXED MAJOR AUTHENTICATION BUG** - Removed conflicting global tenant middleware that was blocking API calls
- **Fixed middleware chain order** - Resolved "Authorization token required" errors for prescriptions API
- **Reduced TypeScript errors** - Dropped from 131 to 8 critical diagnostics by fixing authentication flow
- **Fixed route authentication** - Each API endpoint now properly handles authentication without conflicts
- **Added debug logging** - Prescription API calls now include debugging information

## User Preferences
- Simple, everyday language for communication (user is non-technical)
- Focus on functionality testing rather than code details
- Prioritize working features over perfect TypeScript compliance

## Current Status
✅ **Working Features:**
- Authentication system (login/logout)
- Dashboard with metrics display
- Patient management interface
- Insurance claims processing
- Prescription management
- Multi-tenant pharmacy operations

⚠️ **Known Issues:**
- 131 TypeScript diagnostics remain (non-blocking for functionality)
- Some audit log properties need additional fixes
- Minor type inconsistencies in route handlers

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