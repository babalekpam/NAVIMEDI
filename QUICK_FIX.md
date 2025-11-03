# 🚀 Quick VPS Deployment Fix - NaviMED

## The Problem
Your VPS deployment is failing because:
1. ❌ Missing environment variables (JWT_SECRET, STRIPE_SECRET_KEY, etc.)
2. ❌ Module bundling issues with esbuild and nodemailer
3. ❌ PM2 not configured with correct environment

## The Solution (3 Minutes)

### SSH into your VPS:
```bash
ssh root@74.208.166.77
cd /var/www/vhosts/navimedi.org/httpdocs/NaviMed
```

### Option 1: Quick Fix (Fastest - Recommended)

```bash
# Stop PM2
pm2 delete all

# Create environment file
cat > .env.production << 'EOF'
DATABASE_URL=postgresql://your_user:your_pass@localhost:5432/navimed
JWT_SECRET=your_jwt_secret_from_development
NODE_ENV=production
PORT=5000
SMTP_HOST=smtp.ionos.com
SMTP_PORT=587
SMTP_USER=no-reply@navimedi.org
SMTP_PASS=your_smtp_password
EOF

# Edit with your actual values
nano .env.production

# Pull latest code
git pull origin main

# Build frontend only
npm run build

# Start with tsx (no server bundling needed)
pm2 start "NODE_ENV=production tsx server/index.ts" --name navimed

# Load environment variables for PM2
pm2 restart navimed --update-env

# Save configuration
pm2 save

# View logs
pm2 logs navimed --lines 30
```

### Option 2: Use Deployment Script

```bash
# Make script executable
chmod +x vps-deploy-fix.sh

# Run it
./vps-deploy-fix.sh
```

## Critical Environment Variables

**MUST HAVE** (or deployment fails):
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/navimed
JWT_SECRET=your_jwt_secret_here  # MUST match development!
NODE_ENV=production
PORT=5000
```

**SHOULD HAVE** (for full functionality):
```env
SMTP_HOST=smtp.ionos.com
SMTP_PORT=587
SMTP_USER=no-reply@navimedi.org
SMTP_PASS=your_email_password
OPENAI_API_KEY=your_openai_key  # For NaviMED AI
```

**OPTIONAL** (can skip for now):
```env
STRIPE_SECRET_KEY=sk_live_...
VITE_STRIPE_PUBLIC_KEY=pk_live_...
```

## How to Get JWT_SECRET

**On your development machine (Replit):**
```bash
# Check what JWT_SECRET you're using
cat .env | grep JWT_SECRET
# Copy this exact value to production!
```

## Verify Deployment Works

### 1. Check PM2 Status
```bash
pm2 status
# Should show: navimed | online | 0 restarts
```

### 2. Check for Errors
```bash
pm2 logs navimed --lines 50
# Should NOT show:
#   - "Invalid JWT token" errors
#   - "Cannot find module" errors
#   - "Dynamic require not supported" errors
# MAY show (OK to ignore):
#   - "Stripe not initialized" warnings (if no Stripe key)
```

### 3. Test Health Endpoint
```bash
curl http://localhost:5000/health
# Should return: OK
```

### 4. Test Platform Stats
```bash
curl http://localhost:5000/api/platform/stats
# Should return JSON with platform info
```

### 5. Test Website
Visit: https://navimedi.org
- Should load landing page
- No console errors

### 6. Test Super Admin Login
Go to: https://navimedi.org/login
- Leave "Organization" field **BLANK**
- Email: `abel@argilette.com`
- Password: `Serrega1208@`
- Should access super admin dashboard at `/super-admin-dashboard`

## Common Issues & Fixes

### "Invalid JWT token: invalid signature"
**Cause**: JWT_SECRET doesn't match development
**Fix**: Copy EXACT JWT_SECRET from development .env to production .env.production

### "Stripe not initialized: STRIPE_SECRET_KEY must start with 'sk_'"
**Cause**: Missing Stripe key
**Fix**: Either add valid Stripe key OR ignore (app works without it - just warnings)

### "Cannot find module '/var/www/.../dist/index.js'"
**Cause**: PM2 trying to run built version with wrong path
**Fix**: Use tsx instead:
```bash
pm2 delete navimed
pm2 start "tsx server/index.ts" --name navimed
```

### "Dynamic require of nodemailer is not supported"
**Cause**: esbuild can't bundle nodemailer
**Fix**: Don't bundle server - use tsx directly (see above)

### PM2 env variables not loading
**Fix**: Set them when starting PM2:
```bash
pm2 delete navimed
set -a && source .env.production && set +a
pm2 start tsx --name navimed -- server/index.ts
pm2 save
```

## Why tsx Instead of Building?

**Old approach** (causing errors):
```bash
npm run build  # Builds frontend AND tries to bundle server with esbuild
pm2 start dist/index.js  # Runs bundled server
```
**Problems**: esbuild can't handle nodemailer dynamic imports

**New approach** (works perfectly):
```bash
npm run build  # Only builds frontend (Vite)
pm2 start tsx server/index.ts  # Runs server directly with tsx (transpiles on-the-fly)
```
**Benefits**: 
- tsx handles TypeScript natively
- No bundling issues
- Faster startup
- Better error messages

## PM2 Commands Reference

```bash
pm2 list                    # Show all processes
pm2 logs navimed           # View logs (live)
pm2 logs navimed --lines 100  # View last 100 lines
pm2 restart navimed        # Restart app
pm2 stop navimed           # Stop app
pm2 delete navimed         # Remove from PM2
pm2 monit                  # Monitor CPU/Memory
pm2 save                   # Save current configuration
pm2 env 0                  # Show environment variables
```

## After Successful Deployment

1. ✅ Verify super admin can login
2. ✅ Create a test hospital organization
3. ✅ Test core features (appointments, prescriptions, etc.)
4. ✅ Check email sending works (if SMTP configured)
5. ✅ Monitor logs for any warnings: `pm2 logs navimed`

## Need Help?

If you're still seeing errors:
1. Run: `pm2 logs navimed --lines 100 > /tmp/navimed-errors.log`
2. Check: `/tmp/navimed-errors.log`
3. Share the specific error messages

---

**TL;DR**: 
1. Create `.env.production` with DATABASE_URL and JWT_SECRET
2. Run: `pm2 start "tsx server/index.ts" --name navimed`
3. Test: https://navimedi.org

That's it! 🎉
