# REPLIT SECRETS SETUP - Exact Steps

## Step 1: Access Replit Secrets

1. **In your Replit workspace (where your code is):**
   - Look at the left sidebar
   - Click the **🔒 lock icon** (Secrets tool)
   - Or type "Secrets" in the search bar

## Step 2: Add Required Secrets

Click **"New Secret"** and add these three secrets:

### Secret 1: JWT Authentication
```
Key: JWT_SECRET
Value: 8d1ba931073a42b88c2861fa0ea44ab080a3baf926d3a9a1a163e5e50471c01e
```

### Secret 2: Environment
```
Key: NODE_ENV
Value: production
```

### Secret 3: Database Connection
```
Key: DATABASE_URL
Value: [Your PostgreSQL database URL - see options below]
```

## Step 3: Database URL Options

**Option A: Use Existing Replit Database (If Available)**
- Check if you have PostgreSQL database already provisioned
- Use the DATABASE_URL from your Replit database

**Option B: Create Free Neon Database (Recommended)**
1. Go to https://neon.tech
2. Sign up for free account
3. Create new project
4. Copy connection string, will look like:
```
postgresql://username:password@ep-xyz.neon.tech/neondb?sslmode=require
```

**Option C: Create Free Supabase Database**
1. Go to https://supabase.com
2. Create new project
3. Go to Settings → Database
4. Copy connection string, will look like:
```
postgresql://postgres:password@db.xyz.supabase.co:5432/postgres
```

## Step 4: Deploy

1. **Go to Deployments tab** in Replit
2. Click **"Deploy"** button
3. Wait for deployment to complete
4. Your site should work at the provided URL

## Step 5: Test Deployment

After deployment, test these URLs:

```bash
# Health check - should return JSON
https://your-replit-url.com/health

# Root endpoint - should return JSON for health checkers
https://your-replit-url.com/

# Login page - should show login form
https://your-replit-url.com/login
```

## Step 6: Initial Login

1. Visit your deployed site
2. Go to `/login`
3. Use super admin credentials:
   - **Email:** `abel@argilette.com`
   - **Password:** `Serrega1208@`

## Step 7: Database Setup (If New Database)

If you used a new database, set up the schema:
1. In Replit workspace Shell, run:
```bash
npm run db:push
```
2. This creates all required tables

## Troubleshooting

**If deployment still fails:**
1. Check that all 3 secrets are saved correctly
2. Ensure DATABASE_URL is a valid PostgreSQL connection string
3. Look at deployment logs for specific errors
4. Try redeploying after fixing any issues

**If health checks fail:**
1. JWT_SECRET might not be set correctly
2. DATABASE_URL might be invalid
3. Check deployment logs for startup errors

Your NaviMED healthcare platform will be fully operational once these secrets are configured correctly!