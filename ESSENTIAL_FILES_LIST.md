# Essential Files for NaviMED Deployment

## Core Configuration Files (Required)
```
package.json                    # Dependencies and scripts
package-lock.json              # Exact dependency versions
tsconfig.json                  # TypeScript configuration
vite.config.ts                 # Build configuration
drizzle.config.ts              # Database configuration
tailwind.config.ts             # Styling configuration
postcss.config.js              # CSS processing
components.json                # UI component configuration
```

## Server Core Files (Required)
```
server/index.ts                # Main server entry point
server/routes.ts               # API routes and health checks
server/db.ts                   # Database connection
server/storage.ts              # Database operations
server/vite.ts                 # Vite dev server integration
```

## Server Middleware (Required)
```
server/middleware/auth.ts      # Authentication middleware
server/middleware/tenant.ts    # Multi-tenant middleware
```

## Database Schema (Required)
```
shared/schema.ts               # Complete database schema with all tables
```

## Frontend Core (Required)
```
client/index.html              # HTML entry point
client/src/main.tsx            # React application entry
client/src/App.tsx             # Main app component
client/src/index.css           # Global styles
```

## Frontend Components Structure
```
client/src/components/         # Reusable UI components
client/src/pages/             # Page components
client/src/lib/               # Utility libraries
client/src/hooks/             # Custom React hooks
client/src/contexts/          # React contexts
client/src/assets/            # Static assets
```

## Documentation (Recommended)
```
replit.md                     # Project overview and preferences
DEPLOYMENT_PACKAGE.md         # This deployment guide
DEPLOYMENT.md                 # Health check configuration
SECURITY_ANALYSIS.md          # Security documentation
```

## Environment Configuration (Required)
```
.env (create this file with):
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
SENDGRID_API_KEY=your_sendgrid_key (optional)
NODE_ENV=production
PORT=5000
```

## Build Output (Generated)
```
dist/                         # Production build output (auto-generated)
dist/index.js                 # Server bundle
dist/public/                  # Frontend build
```

## Files to Exclude from Deployment
```
node_modules/                 # Dependencies (install via package.json)
attached_assets/              # Development assets
test-*.html                   # Test files
*.broken                      # Backup files
*.backup                      # Backup files
cookies.txt                   # Development files
clear-supplier-session.js     # Development scripts
create-patient-fix.ts         # Development utilities
temp_*.tsx                    # Temporary files
```

## Required Directories Structure
```
navimed-platform/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── lib/
│   │   ├── hooks/
│   │   ├── contexts/
│   │   ├── assets/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   └── index.html
├── server/
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── tenant.ts
│   ├── index.ts
│   ├── routes.ts
│   ├── db.ts
│   ├── storage.ts
│   └── vite.ts
├── shared/
│   └── schema.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
├── drizzle.config.ts
├── tailwind.config.ts
└── postcss.config.js
```

## Deployment Commands
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm start

# Push database schema
npm run db:push
```

## Minimum Files for Basic Deployment
If you need the absolute minimum for a working deployment:

1. **package.json** - Dependencies
2. **server/index.ts** - Server
3. **server/routes.ts** - API routes
4. **server/db.ts** - Database
5. **shared/schema.ts** - Database schema
6. **client/index.html** - Frontend
7. **client/src/main.tsx** - React entry
8. **tsconfig.json** - TypeScript config
9. **vite.config.ts** - Build config

These 9 files will give you a basic working deployment, but the full file list above is recommended for complete functionality.