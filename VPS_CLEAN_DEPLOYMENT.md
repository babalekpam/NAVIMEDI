# Clean VPS Deployment Guide

## Step 1: On VPS - Clean Everything

```bash
# Stop PM2
pm2 stop navimed
pm2 delete navimed

# Backup and clean deployment directory
cd /var/www/vhosts/navimedi.org/httpdocs
mv NaviMed NaviMed.backup-$(date +%s)

# Create fresh directory
mkdir -p NaviMed
cd NaviMed
```

## Step 2: On Replit - Download Production Bundle

Run this in Replit terminal:
```bash
# Create deployment package
tar -czf navimed-deploy.tar.gz dist/ package.json package-lock.json server/ shared/ drizzle.config.ts tsconfig.json
```

## Step 3: Transfer Files to VPS

On your local machine:
```bash
# Download from Replit (use Replit Shell)
# Then upload to VPS
scp navimed-deploy.tar.gz root@74.208.166.77:/var/www/vhosts/navimedi.org/httpdocs/NaviMed/
```

## Step 4: On VPS - Extract and Setup

```bash
cd /var/www/vhosts/navimedi.org/httpdocs/NaviMed

# Extract files
tar -xzf navimed-deploy.tar.gz

# Install production dependencies
npm ci --production

# Set up environment variables
cat > .env << 'ENVFILE'
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://navimed_user:NaviMed2025!Secure@localhost:5432/navimed
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)

# SMTP Settings (IONOS)
SMTP_HOST=smtp.ionos.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=noreply@navimedi.org
SMTP_PASS=your_ionos_smtp_password

# From Email
FROM_EMAIL=noreply@navimedi.org
FROM_NAME=NaviMED Platform
ENVFILE

# Make environment file read-only
chmod 600 .env
```

## Step 5: Database Seed Script

```bash
# Create seed script
cat > seed-database.js << 'SEEDJS'
const { db } = require("./dist/db.js");
const { tenants, users, countries } = require("./dist/schema.js");
const bcrypt = require("bcrypt");
const { eq } = require("drizzle-orm");

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");
    
    // 1. Insert Nigeria
    const existingCountry = await db.select().from(countries).where(eq(countries.code, 'NG')).limit(1);
    let countryId;
    
    if (existingCountry.length === 0) {
      console.log("📍 Creating Nigeria country...");
      const [nigeria] = await db.insert(countries).values({
        code: 'NG',
        name: 'Nigeria',
        region: 'Africa',
        cptCodeSystem: 'CPT-4',
        icd10CodeSystem: 'ICD-10',
        pharmaceuticalCodeSystem: 'ATC',
        currencyCode: 'NGN',
        dateFormat: 'DD/MM/YYYY',
        timeZone: 'Africa/Lagos',
        isActive: true
      }).returning();
      countryId = nigeria.id;
      console.log("✓ Nigeria created:", countryId);
    } else {
      countryId = existingCountry[0].id;
      console.log("✓ Nigeria already exists:", countryId);
    }
    
    // 2. Insert Platform Tenant
    const existingTenant = await db.select().from(tenants).where(eq(tenants.subdomain, 'argilette')).limit(1);
    let tenantId;
    
    if (existingTenant.length === 0) {
      console.log("🏥 Creating platform tenant...");
      const [tenant] = await db.insert(tenants).values({
        name: "ARGILETTE Platform",
        type: "hospital",
        subdomain: "argilette",
        countryId: countryId,
        settings: {
          isPlatformOwner: true,
          features: ["super_admin", "tenant_management", "multi_tenant"]
        },
        isActive: true
      }).returning();
      tenantId = tenant.id;
      console.log("✓ Platform tenant created:", tenantId);
    } else {
      tenantId = existingTenant[0].id;
      console.log("✓ Platform tenant already exists:", tenantId);
    }
    
    // 3. Insert Super Admin
    const existingAdmin = await db.select().from(users).where(eq(users.email, 'abel@argilette.com')).limit(1);
    
    if (existingAdmin.length === 0) {
      console.log("👤 Creating super admin user...");
      const hashedPassword = await bcrypt.hash('Serrega1208@', 10);
      
      await db.insert(users).values({
        tenantId: tenantId,
        username: 'abel_admin',
        email: 'abel@argilette.com',
        password: hashedPassword,
        firstName: 'Abel',
        lastName: 'Platform Admin',
        role: 'super_admin',
        isActive: true
      });
      console.log("✓ Super admin created: abel@argilette.com");
    } else {
      console.log("✓ Super admin already exists");
    }
    
    console.log("✅ Database seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seedDatabase();
SEEDJS

# Run the seed script
node seed-database.js
```

## Step 6: Start PM2

```bash
# Start with PM2
pm2 start dist/index.js --name navimed --node-args="--env-file=.env"

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup

# Check logs
pm2 logs navimed --lines 50
```

## Step 7: Verify Deployment

```bash
# Check database
PGPASSWORD='NaviMed2025!Secure' psql -U navimed_user -d navimed -h localhost -c "SELECT COUNT(*) FROM tenants; SELECT COUNT(*) FROM users;"

# Test login at https://navimedi.org
# Email: abel@argilette.com
# Password: Serrega1208@
# Organization: (leave blank)
```

## Troubleshooting

If seeding fails, check:
```bash
# Database connection
PGPASSWORD='NaviMed2025!Secure' psql -U navimed_user -d navimed -h localhost -c "SELECT 1;"

# PM2 logs
pm2 logs navimed --err --lines 100
```
