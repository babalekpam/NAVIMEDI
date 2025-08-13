# NaviMED Healthcare Platform - Deployment Package

## Project Overview
NaviMED is a comprehensive multi-tenant healthcare management platform connecting hospitals, pharmacies, laboratories, and suppliers. Features include patient management, prescription handling, appointment scheduling, billing, and marketplace functionality.

## Quick Start Commands

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Production build
npm run build

# Production start
npm start

# Database schema push
npm run db:push
```

## Core Architecture

### Frontend (React + TypeScript)
- **Location**: `client/src/`
- **Entry Point**: `client/src/main.tsx`
- **Styling**: TailwindCSS with shadcn/ui components
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state

### Backend (Node.js + Express + TypeScript)
- **Location**: `server/`
- **Entry Point**: `server/index.ts`
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT-based with role-based access control
- **Health Checks**: Multiple endpoints for deployment monitoring

### Database Schema
- **Location**: `shared/schema.ts`
- **ORM**: Drizzle with TypeScript
- **Migration**: `npm run db:push`

## Essential Files for Deployment

### Core Configuration
```
package.json              # Dependencies and scripts
tsconfig.json            # TypeScript configuration
vite.config.ts           # Vite build configuration
drizzle.config.ts        # Database configuration
tailwind.config.ts       # Styling configuration
postcss.config.js        # CSS processing
```

### Backend Core Files
```
server/index.ts          # Main server entry point
server/routes.ts         # API routes and health checks
server/db.ts             # Database connection
server/storage.ts        # Database operations
server/vite.ts           # Vite integration
```

### Database & Schema
```
shared/schema.ts         # Complete database schema
server/middleware/auth.ts    # Authentication middleware
server/middleware/tenant.ts # Multi-tenant middleware
```

### Frontend Core
```
client/index.html        # HTML entry point
client/src/main.tsx      # React entry point
client/src/App.tsx       # Main app component
client/src/index.css     # Global styles
```

## Environment Variables Required

```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/navimed

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# SendGrid Email (Optional)
SENDGRID_API_KEY=SG.your-sendgrid-api-key

# Server Configuration
NODE_ENV=production
PORT=5000
```

## Health Check Endpoints

The platform includes multiple health check endpoints for deployment monitoring:

- `GET /health` - Primary health check with uptime
- `GET /_health` - Simplified health check
- `GET /` - Root endpoint with intelligent health check detection

All endpoints return JSON for deployment systems and HTML for browsers.

## Multi-Tenant Architecture

### Tenant Types
- **Platform**: Super admin tenant (ARGILETTE)
- **Hospital**: Healthcare facility management
- **Pharmacy**: Prescription and inventory management
- **Laboratory**: Lab orders and results
- **Supplier**: Marketplace and advertising

### Data Isolation
Complete data isolation between tenants with controlled cross-tenant interactions for prescription routing and lab orders.

## Authentication System

### User Roles
- **Super Admin**: Platform management
- **Hospital Admin**: Hospital management
- **Doctor**: Patient care and appointments
- **Pharmacist**: Prescription management
- **Lab Technician**: Lab operations
- **Patient**: Portal access
- **Supplier**: Marketplace management

### Super Admin Credentials
- **Email**: abel@argilette.com
- **Password**: Serrega1208@
- **Privileges**: Unlimited platform access

## Key Features Implemented

### Core Healthcare Features
- ✅ Multi-tenant patient management
- ✅ Appointment scheduling system
- ✅ Prescription management workflow
- ✅ Laboratory orders and results
- ✅ Insurance verification and billing
- ✅ Patient portal with self-booking

### Business Features
- ✅ Supplier marketplace
- ✅ Advertisement system with inquiries
- ✅ Quote request functionality
- ✅ Real-time notifications
- ✅ Comprehensive reporting

### Technical Features
- ✅ Multi-language support (EN, ES, FR, DE)
- ✅ Currency detection (8 African currencies)
- ✅ Email confirmation system
- ✅ Role-based access control
- ✅ Real-time updates
- ✅ Offline capability (configurable)

## Deployment Instructions

### 1. Replit Deployment (Recommended)
1. Ensure all health check endpoints are working
2. Go to Deployments tab in Replit
3. Configure environment variables
4. Deploy with Autoscale configuration
5. Configure custom domain if needed

### 2. Cloud Run Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

### 3. Traditional Server Deployment
```bash
# Clone repository
git clone [your-repo-url]
cd navimed-platform

# Install dependencies
npm install

# Set environment variables
export DATABASE_URL="your-database-url"
export JWT_SECRET="your-jwt-secret"

# Build and start
npm run build
npm start
```

## Post-Deployment Configuration

### 1. Database Setup
```bash
# Push schema to database
npm run db:push
```

### 2. Super Admin Access
- Login at: `/login`
- Use super admin credentials
- Access platform management features

### 3. Custom Domain Setup (if applicable)
1. Configure DNS A and TXT records
2. Wait for DNS propagation (up to 48 hours)
3. Verify SSL certificate activation

## Monitoring and Maintenance

### Health Monitoring
- Monitor `/health` endpoint for application status
- Check database connectivity
- Monitor resource usage for autoscaling

### Backup Strategy
- Regular database backups
- Environment variable backup
- Code repository maintenance

## Support and Documentation

### Key Documentation Files
- `replit.md` - Project overview and user preferences
- `DEPLOYMENT.md` - Health check configuration
- `SECURITY_ANALYSIS.md` - Security architecture
- `SUPPLIER_AUTHENTICATION_GUIDE.md` - Supplier onboarding

### Recent Updates (August 2025)
- ✅ Fixed deployment health check issues
- ✅ Resolved domain authentication failures
- ✅ Optimized Cloud Run compatibility
- ✅ Enhanced multi-tenant security
- ✅ Improved patient booking system

## Troubleshooting

### Common Issues
1. **Health Check Failures**: Verify `/health` endpoint responds with JSON
2. **Database Connection**: Check DATABASE_URL environment variable
3. **Authentication Issues**: Verify JWT_SECRET is set properly
4. **Custom Domain**: Ensure DNS records are configured correctly

### Contact Information
For technical support or deployment assistance, contact the development team through the platform's support channels.

---

**NaviMED Healthcare Platform v1.0**  
*Connecting Healthcare Communities Worldwide*