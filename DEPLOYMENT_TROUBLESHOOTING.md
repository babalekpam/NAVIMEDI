# NaviMED Deployment Troubleshooting Guide

## Current Issue: 503 Service Unavailable

### What 503 Error Means
A 503 Service Unavailable error indicates that the deployment platform cannot successfully start your application. Unlike a 500 error (app runs but crashes), a 503 means the app never started properly.

## Common Causes & Solutions

### 1. Missing Environment Variables (Most Likely)
**Problem**: Critical environment variables are not configured in production
**Solution**: Configure these in your deployment platform:

```bash
# Required Variables
NODE_ENV=production
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-secure-random-32-character-string
PORT=5000

# Optional Variables
SENDGRID_API_KEY=SG.your-sendgrid-api-key
```

### 2. Database Connection Failure
**Problem**: Application can't connect to production database
**Symptoms**: App starts but crashes immediately during database operations

**Solutions**:
- Verify DATABASE_URL format is correct
- Ensure database server is running and accessible
- Check SSL requirements (add `?sslmode=require` if needed)
- Verify database credentials are correct

### 3. Port Binding Issues
**Problem**: Application tries to bind to wrong port or port is already in use
**Solution**: Ensure PORT environment variable is set correctly (usually 5000 or 8080)

### 4. Build/Start Script Issues
**Problem**: Application fails during build or start process
**Solution**: Check package.json scripts:

```json
{
  "scripts": {
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js"
  }
}
```

### 5. Memory/Resource Limits
**Problem**: Deployment platform doesn't have enough resources
**Solution**: Upgrade to higher tier or optimize application

## Diagnostic Steps

### Step 1: Check Deployment Logs
Look for startup errors in your deployment platform's logs:
- **Replit**: Check deployment logs in the Deployments tab
- **Vercel**: Check Function Logs in dashboard
- **Railway**: Check deployment logs in project dashboard
- **Render**: Check logs in service dashboard

### Step 2: Test Health Endpoints
Try accessing these URLs after deployment:
```bash
https://navimedi.com/health
https://navimedi.com/ping
https://navimedi.com/ready
```

### Step 3: Manual Environment Check
If you can access logs, look for this output:
```
=== DEPLOYMENT ENVIRONMENT CHECK ===
NODE_ENV: production
DATABASE_URL exists: true
JWT_SECRET exists: true
Port: 5000
✅ All required environment variables are configured
```

## Platform-Specific Troubleshooting

### Replit Deployments
1. **Check Secrets**: Go to Secrets tab, ensure all variables are set
2. **Check Resources**: Verify you have enough Cycles for deployment
3. **Check Build Logs**: Look for build failures in deployment logs
4. **Try Redeploy**: Sometimes a fresh deployment fixes temporary issues

### Vercel
1. **Check Environment Variables**: Settings → Environment Variables
2. **Check Build Logs**: Look for build failures
3. **Check Function Size**: Ensure app doesn't exceed serverless function limits
4. **Regional Issues**: Try different deployment regions

### Railway
1. **Check Variables**: Variables tab in service settings
2. **Check Resource Usage**: Monitor CPU/Memory usage
3. **Check Build Logs**: Look for compilation errors
4. **Check Port**: Ensure PORT variable is set correctly

### Google Cloud Run
1. **Check Environment Variables**: Container → Variables & Secrets
2. **Check Memory Limits**: Increase memory allocation if needed
3. **Check CPU Allocation**: Ensure sufficient CPU allocation
4. **Check Startup Timeout**: Increase timeout for slower startups

## Emergency Quick Fixes

### Fix 1: Minimal Health Check
If nothing else works, create a minimal health check endpoint that always responds:

```javascript
// Add this to the very top of server/index.ts
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});
```

### Fix 2: Force Environment Variables
Add default values for development testing:

```javascript
// Temporary fix - remove after proper configuration
process.env.JWT_SECRET = process.env.JWT_SECRET || 'temporary-dev-secret-change-in-production';
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
```

### Fix 3: Disable Database on Startup
Temporarily comment out database operations to isolate the issue:

```javascript
// Comment out database initialization temporarily
// await initializePlatform();
```

## Verification Checklist

After applying fixes, verify:

- [ ] All environment variables are configured
- [ ] Database connection string is correct
- [ ] Application builds successfully
- [ ] Health endpoints respond
- [ ] Login functionality works
- [ ] No errors in deployment logs

## Prevention Tips

1. **Test Locally First**: Always test with production-like environment variables locally
2. **Use Environment Templates**: Document required variables for future deployments
3. **Set Up Monitoring**: Use health checks and alerting
4. **Regular Backups**: Keep database and configuration backups
5. **Staging Environment**: Test deployments in staging before production

## Common Error Messages & Solutions

**"DATABASE_URL must be set"**
→ Add DATABASE_URL environment variable

**"JWT_SECRET not configured"**
→ Add JWT_SECRET environment variable

**"Port already in use"**
→ Check PORT environment variable or use process.env.PORT

**"Module not found"**
→ Ensure all dependencies are in package.json, run npm install

**"Permission denied"**
→ Check file permissions and deployment platform permissions

## Next Steps

1. **Configure Environment Variables** (highest priority)
2. **Check deployment platform logs** for specific error messages
3. **Test with minimal configuration** to isolate issues
4. **Contact deployment platform support** if issues persist

Remember: The application code is working perfectly locally, so this is purely a deployment configuration issue that can be resolved by proper environment setup.