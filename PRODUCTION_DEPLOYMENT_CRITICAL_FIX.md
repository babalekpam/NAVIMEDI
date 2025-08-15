# CRITICAL: Production Deployment Fix for Service Unavailable

## Root Cause Identified
The "Service Unavailable" error is caused by a mismatch between development and production server setup:

1. **Development**: Uses `tsx server/index.ts` (TypeScript directly)
2. **Production**: Expects `node dist/index.js` (compiled JavaScript)
3. **Build Process**: Not running properly in deployment

## Fix Required: Update package.json start command

Current package.json:
```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js"
  }
}
```

## Solution 1: Direct TypeScript execution for production
Change the start command to bypass the build requirement:

```json
"start": "NODE_ENV=production tsx server/index.ts"
```

## Solution 2: Ensure build artifacts exist
The deployment system needs to run the build command first, then start.

## Environment Variables Required in Production
- `NODE_ENV=production`
- `DATABASE_URL` (PostgreSQL connection)
- `JWT_SECRET` (Authentication key)
- `PORT` (Default: 5000)

## Health Check Endpoints (All Working)
- `/` - Root health check
- `/health` - Primary endpoint
- `/ping` - Simple text response
- `/status` - Status JSON
- `/ready` - Readiness probe
- `/alive` - Liveness probe

## Immediate Fix
Update the start command to use TypeScript directly in production to bypass build compilation issues.