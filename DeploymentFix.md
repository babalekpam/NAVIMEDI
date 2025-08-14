# NaviMED Healthcare Platform - Deployment Fix Guide

## Executive Summary
Your application works in Replit development but shows "Service Unavailable" errors in production. After analyzing your codebase, I've identified the root causes and created a comprehensive fix plan.

## Root Cause Analysis

### 1. Environment Variables Configuration Issues
**Problem**: Critical environment variables are not properly configured in production.

**Evidence from Code Analysis**:
```javascript
// server/index.ts lines 38-50
if (process.env.NODE_ENV === 'production') {
  const missingVars = [];
  if (!process.env.DATABASE_URL) missingVars.push('DATABASE_URL');
  if (!process.env.JWT_SECRET) missingVars.push('JWT_SECRET');
  // Application logs errors but continues running
}
```

**Impact**: 
- Authentication fails without JWT_SECRET
- Database operations fail without DATABASE_URL
- Application runs but cannot serve requests properly

### 2. Build Process Configuration
**Problem**: The build process may not be creating production assets correctly.

**Current Configuration**:
```json
// package.json
"build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
"start": "NODE_ENV=production node dist/index.js"
```

**Potential Issues**:
- Static assets may not be built in the correct location (dist/public)
- Server file may not be bundled correctly

### 3. Static File Serving in Production
**Problem**: Production uses different static file serving logic than development.

**Evidence from Code**:
```javascript
// server/index.ts lines 302-306
if (app.get("env") === "development") {
  await setupVite(app, server);
} else {
  serveStatic(app);  // This expects files in 'public' directory
}
```

```javascript
// server/vite.ts line 71
const distPath = path.resolve(import.meta.dirname, "public");
```

**Issue**: The build outputs to `dist/public` but production looks for files in `public`.

### 4. Health Check Configuration
**Problem**: While health checks are properly configured, they may timeout if database is slow.

**Current Implementation**: Multiple health endpoints exist but some include database checks which could timeout.

### 5. Port Binding
**Problem**: Application may not be binding to the correct port in production.

**Current Configuration**:
```javascript
const port = parseInt(process.env.PORT || '5000', 10);
```

## Deployment Fix Plan

### Step 1: Configure Environment Variables in Replit Deployment

Add these secrets in Replit Deployment settings:

```bash
# Required Environment Variables
NODE_ENV=production
DATABASE_URL=postgresql://username:password@host:port/database_name
JWT_SECRET=<generate-secure-32-character-string>
PORT=5000

# Optional but Recommended
SENDGRID_API_KEY=SG.your-sendgrid-api-key-here
```

**Generate Secure JWT_SECRET**:
```bash
# In Replit Shell, run:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 2: Fix Static File Serving Path

Update `server/vite.ts` to correctly serve production files:

```javascript
// Change line 71 from:
const distPath = path.resolve(import.meta.dirname, "public");

// To:
const distPath = path.resolve(import.meta.dirname, "..", "dist", "public");
```

### Step 3: Update Build Scripts

Ensure build process creates correct directory structure:

```json
// package.json - Update scripts
{
  "scripts": {
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build",
    "build:server": "esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js"
  }
}
```

### Step 4: Add Production Database SSL Configuration

If using cloud database (like Neon), update database connection:

```javascript
// server/db.ts
const connectionString = process.env.DATABASE_URL + 
  (process.env.NODE_ENV === 'production' ? '?sslmode=require' : '');

export const pool = new Pool({ connectionString });
```

### Step 5: Optimize Health Checks for Production

Create a fast health check without database operations:

```javascript
// server/index.ts - Update /health endpoint
app.get('/health', (req, res) => {
  // No database check - immediate response
  res.status(200).json({ 
    status: 'ok', 
    health: 'healthy',
    env: process.env.NODE_ENV
  });
});
```

### Step 6: Add Deployment Validation Script

Create a deployment validation endpoint:

```javascript
// Add to server/index.ts
app.get('/deployment-status', (req, res) => {
  const status = {
    environment: process.env.NODE_ENV,
    hasDatabase: !!process.env.DATABASE_URL,
    hasJWT: !!process.env.JWT_SECRET,
    port: process.env.PORT || 5000,
    staticFiles: fs.existsSync(path.resolve(import.meta.dirname, "..", "dist", "public")),
    timestamp: new Date().toISOString()
  };
  
  const isHealthy = status.hasDatabase && status.hasJWT && status.staticFiles;
  
  res.status(isHealthy ? 200 : 503).json({
    ...status,
    healthy: isHealthy,
    issues: [
      !status.hasDatabase && "Missing DATABASE_URL",
      !status.hasJWT && "Missing JWT_SECRET",
      !status.staticFiles && "Static files not built"
    ].filter(Boolean)
  });
});
```

## Deployment Checklist

### Pre-Deployment
- [ ] Run `npm run build` locally and verify dist/ directory is created
- [ ] Test production build locally: `npm run start`
- [ ] Verify all environment variables are set in Replit Secrets
- [ ] Ensure database is accessible from production environment

### Deployment Configuration in Replit
1. **Build Command**: `npm run build`
2. **Run Command**: `npm run start`
3. **Health Check Path**: `/health`
4. **Port**: `5000`

### Post-Deployment Validation
1. Check deployment logs for environment validation output
2. Visit `/deployment-status` endpoint to verify configuration
3. Test `/health` endpoint returns 200 status
4. Verify frontend loads at root path `/`
5. Test authentication by logging in

## Common Issues and Solutions

### Issue: "Cannot find module" errors
**Solution**: Ensure all dependencies are in `dependencies` not `devDependencies` in package.json

### Issue: "ENOENT: no such file or directory" for static files
**Solution**: Verify build process completes and creates dist/public directory

### Issue: Database connection timeouts
**Solution**: 
- Add connection pooling limits
- Ensure database allows connections from Replit IPs
- Add SSL mode if required by database provider

### Issue: 503 Service Unavailable
**Solution**: Check deployment logs for missing environment variables

### Issue: Frontend loads but API calls fail
**Solution**: 
- Verify JWT_SECRET is set correctly
- Check CORS configuration
- Ensure API routes are registered before static file serving

## Monitoring and Debugging

### Enable Detailed Logging
Add to start of server/index.ts:
```javascript
if (process.env.NODE_ENV === 'production') {
  console.log('Starting in PRODUCTION mode');
  console.log('Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    HAS_DB: !!process.env.DATABASE_URL,
    HAS_JWT: !!process.env.JWT_SECRET,
    PORT: process.env.PORT
  });
}
```

### Check Deployment Logs
In Replit Deployment Dashboard:
1. Go to Deployments tab
2. Click on your deployment
3. View Logs section
4. Look for startup errors or missing variables

### Test Endpoints Manually
```bash
# Health check
curl https://your-app.replit.app/health

# Deployment status
curl https://your-app.replit.app/deployment-status

# Root endpoint
curl -I https://your-app.replit.app/
```

## Quick Fix Summary

1. **Add environment variables** in Replit Deployment Secrets
2. **Fix static file path** in server/vite.ts
3. **Run build** before deployment
4. **Verify health checks** are working
5. **Monitor logs** during deployment

## Support Resources

- [Replit Deployments Documentation](https://docs.replit.com/deployments)
- [Environment Variables in Replit](https://docs.replit.com/programming-ide/workspace-features/secrets)
- Check existing fix guides:
  - PRODUCTION_DEPLOYMENT_FIX.md
  - DEPLOYMENT_TROUBLESHOOTING.md
  - REPLIT_DEPLOYMENT_FIX.md

## Next Steps

1. Implement the fixes in order (Steps 1-6)
2. Test locally with production build
3. Deploy to Replit
4. Monitor deployment logs
5. Validate all endpoints are working

The most critical fix is ensuring environment variables are properly configured in your Replit deployment settings. Without DATABASE_URL and JWT_SECRET, the application cannot function in production.