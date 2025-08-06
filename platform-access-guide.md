# NaviMED Healthcare Platform - Access Guide

## Platform Overview
NaviMED is a comprehensive multi-tenant healthcare management platform with integrated mobile patient application "Carnet". The platform connects hospitals, pharmacies, laboratories, and patients in one unified system.

## Platform Access Points

### 🏥 Main Portal Hub
**URL:** http://localhost:5000/main-portal.html
- Central access point to all platform portals
- Choose your role: Healthcare Provider, Super Admin, or Equipment Supplier

### 👥 Healthcare Provider Dashboard
**URL:** http://localhost:5000/
- Hospital administrators and staff
- Pharmacy management
- Laboratory operations
- Patient management and billing

### 👤 Patient Portal Access
**Patient Login:** http://localhost:5000/patient-login.html
**Patient Dashboard:** http://localhost:5000/patient-portal.html
- Complete patient health records
- Appointment scheduling
- Medication tracking
- Lab results and reports

### 📱 Carnet Mobile App
**URL:** http://localhost:5000/mobile-app.html
- Mobile-optimized patient experience
- One-click authentication
- Complete health record access
- Native app capabilities (PWA)

### 🌐 Platform Overview
**URL:** http://localhost:5000/platform-overview.html
- Complete platform feature showcase
- Mobile app download information
- System capabilities overview

## Demo Access Credentials

### Super Admin Access
- **Email:** abel@argilette.com
- **Password:** adminpass123
- **Capabilities:** Unlimited platform access, tenant management, white-label settings

### Demo Patient Access
- **MRN:** MRN-789012345
- **Hospital:** Metro General Hospital
- **Password:** patient123
- **Patient:** Sarah Johnson (Cardiology & Endocrinology)

## Current Platform Features

### ✅ Fully Operational
- Multi-tenant architecture with data isolation
- JWT authentication system
- Patient portal with complete health records
- Mobile Carnet app with offline capabilities
- Email confirmation system (SendGrid)
- Multi-currency support (45+ currencies)
- Complete translation system (4 languages)
- Video appointment integration
- Laboratory results management
- One-click medical document downloads

### 📱 Mobile App Features
- Native iOS and Android ready (Capacitor framework)
- PWA installation capabilities
- Touch-friendly navigation
- Offline synchronization
- Secure patient authentication
- HIPAA-compliant data handling

## Platform Architecture
- **Frontend:** React, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express.js, PostgreSQL
- **Authentication:** JWT with role-based access control
- **Database:** PostgreSQL with Drizzle ORM
- **Mobile:** Capacitor framework for native apps

## Server Status
- **Status:** ✅ Running successfully on port 5000
- **Database:** ✅ PostgreSQL connected with full test data
- **Authentication:** ✅ JWT system operational
- **API Endpoints:** ✅ All core functionality working