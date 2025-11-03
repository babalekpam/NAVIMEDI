# NaviMED Production Deployment Guide
## IONOS VPS (74.208.166.77) - navimedi.org

## Current Issues & Fixes

### 1. Environment Variables Not Set

**Problem**: Your VPS is missing critical environment variables, causing:
- ⚠️ Stripe initialization failures
- ⚠️ Invalid JWT signatures
- ⚠️ Module resolution errors

**Solution**: Create `.env.production` file on VPS

```bash
# On VPS: /var/www/vhosts/navimedi.org/httpdocs/NaviMed/.env.production

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/navimed

# JWT Secret (CRITICAL - must match development)
JWT_SECRET=your-production-jwt-secret-here

# Stripe (Optional - can skip for now)
STRIPE_SECRET_KEY=sk_live_your_stripe_key_here
VITE_STRIPE_PUBLIC_KEY=pk_live_your_public_key_here

# SMTP Email (IONOS)
SMTP_HOST=smtp.ionos.com
SMTP_PORT=587
SMTP_USER=no-reply@navimedi.org
SMTP_PASS=your-email-password-here

# OpenAI (for NaviMED AI)
OPENAI_API_KEY=your-openai-key-here

# App Settings
NODE_ENV=production
PORT=5000
```

### 2. Fix Build Process

**Problem**: esbuild is having trouble bundling server modules

**Current build command** (in package.json):
```json
"build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist"
```

**Better approach**: Don't bundle server with esbuild, use tsx in production

**Solution**: Update your PM2 ecosystem file

### 3. PM2 Configuration Fix

Create `ecosystem.config.cjs` on your VPS:

```javascript
// /var/www/vhosts/navimedi.org/httpdocs/NaviMed/ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: 'navimed',
      script: 'tsx',
      args: 'server/index.ts',
      cwd: '/var/www/vhosts/navimedi.org/httpdocs/NaviMed',
      interpreter: 'node',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      env_file: '.env.production',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    }
  ]
};
```

## Step-by-Step Deployment Process

### On Your VPS (SSH into 74.208.166.77):

```bash
# 1. Navigate to project directory
cd /var/www/vhosts/navimedi.org/httpdocs/NaviMed

# 2. Pull latest code
git pull origin main

# 3. Install dependencies (if new packages added)
npm install

# 4. Create/Update .env.production file
nano .env.production
# Paste the environment variables from above
# Save: Ctrl+X, then Y, then Enter

# 5. Build frontend only (not server)
npm run build:client

# 6. Stop current PM2 processes
pm2 delete all

# 7. Start with new PM2 config
pm2 start ecosystem.config.cjs

# 8. Save PM2 configuration
pm2 save

# 9. Verify it's running
pm2 status
pm2 logs navimed --lines 50
```

### Alternative: If tsx doesn't work, use simpler PM2 config

```bash
# Simple PM2 start without config file
pm2 start "NODE_ENV=production tsx server/index.ts" --name navimed --env-file .env.production

# Or if you prefer the built version (after fixing build)
pm2 start "NODE_ENV=production node dist/index.js" --name navimed --env-file .env.production
```

## Quick Fix for Current Deployment

**Fastest solution to get it working RIGHT NOW:**

```bash
# SSH into VPS
ssh root@74.208.166.77

cd /var/www/vhosts/navimedi.org/httpdocs/NaviMed

# 1. Stop all PM2 processes
pm2 delete all

# 2. Create minimal .env file
cat > .env.production << 'EOF'
DATABASE_URL=your_database_url_here
JWT_SECRET=your_jwt_secret_here
NODE_ENV=production
PORT=5000
SMTP_HOST=smtp.ionos.com
SMTP_PORT=587
SMTP_USER=no-reply@navimedi.org
SMTP_PASS=your_smtp_password
EOF

# 3. Start with tsx (no build needed)
pm2 start tsx --name navimed -- server/index.ts

# 4. Check logs
pm2 logs navimed --lines 20
```

## Environment Variable Checklist

### Critical (Must Have):
- ✅ `DATABASE_URL` - PostgreSQL connection string
- ✅ `JWT_SECRET` - For authentication (MUST match dev)
- ✅ `NODE_ENV=production`

### Important (Should Have):
- ⚠️ `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - Email
- ⚠️ `OPENAI_API_KEY` - NaviMED AI features

### Optional (Can Skip for Now):
- 🔵 `STRIPE_SECRET_KEY` - Payment processing
- 🔵 `VITE_STRIPE_PUBLIC_KEY` - Frontend Stripe

## Troubleshooting

### Issue: "Invalid JWT token: invalid signature"
**Cause**: JWT_SECRET on VPS doesn't match development
**Fix**: Copy exact JWT_SECRET from your development .env to production

### Issue: "Stripe not initialized"
**Cause**: Missing or invalid STRIPE_SECRET_KEY
**Fix**: Either:
- Add valid Stripe key starting with `sk_`
- Or ignore - app works without Stripe (warnings only)

### Issue: "Cannot find module"
**Cause**: PM2 pointing to wrong path or build failed
**Fix**: Use tsx instead of building:
```bash
pm2 start tsx --name navimed -- server/index.ts
```

### Issue: "Dynamic require of nodemailer is not supported"
**Cause**: esbuild can't bundle nodemailer properly
**Fix**: Don't bundle server code - use tsx directly

## Verify Deployment

1. **Check PM2 status**:
```bash
pm2 status
# Should show: navimed | online
```

2. **Check logs for errors**:
```bash
pm2 logs navimed --lines 50
# Should NOT show: "Stripe not initialized" errors if key is set
# Should show: "Server running on port 5000"
```

3. **Test endpoints**:
```bash
curl http://localhost:5000/health
# Should return: OK

curl http://localhost:5000/api/platform/stats
# Should return JSON platform stats
```

4. **Test website**:
- Visit: https://navimedi.org
- Should load without errors

5. **Test super admin login**:
- Go to: https://navimedi.org/login
- Leave organization blank
- Email: abel@argilette.com
- Password: Serrega1208@
- Should access super admin dashboard

## Update package.json (Optional)

Add separate build commands for clarity:

```json
"scripts": {
  "dev": "NODE_ENV=development tsx server/index.ts",
  "build": "npm run build:client",
  "build:client": "vite build",
  "build:server": "esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
  "start": "NODE_ENV=production tsx server/index.ts",
  "start:built": "NODE_ENV=production node dist/index.js",
  "check": "tsc",
  "db:push": "drizzle-kit push"
}
```

## Notes

- **Don't build server code** - Use tsx for both dev and production (it's fast enough)
- **JWT_SECRET is critical** - Invalid tokens will lock out all users
- **Stripe is optional** - App works fine without it (just warnings in logs)
- **Use ecosystem.config.cjs** - Better PM2 management with environment variables
- **Test locally first** - Make sure `npm run build` works before deploying

## Support

If issues persist:
1. Check PM2 logs: `pm2 logs navimed --lines 100`
2. Check nginx logs: `tail -f /var/log/nginx/error.log`
3. Verify environment variables: `pm2 env 0`
