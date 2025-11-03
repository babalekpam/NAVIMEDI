#!/bin/bash
# Simple VPS Clean Deployment Commands
# Copy these commands and run them ONE BY ONE on your VPS

echo "=== STEP 1: Stop and Clean Old Deployment ==="
pm2 stop navimed 2>/dev/null || true
pm2 delete navimed 2>/dev/null || true
cd /var/www/vhosts/navimedi.org/httpdocs
mv NaviMed NaviMed.backup-$(date +%s) 2>/dev/null || true
mkdir -p NaviMed
cd NaviMed

echo "=== STEP 2: Create Package JSON (copy from Replit) ==="
# You'll need to copy package.json and package-lock.json from Replit

echo "=== STEP 3: Install Production Dependencies ==="
npm ci --omit=dev

echo "=== STEP 4: Setup Environment ==="
cat > .env << 'EOF'
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://navimed_user:NaviMed2025!Secure@localhost:5432/navimed
JWT_SECRET=your-random-secret-here
SESSION_SECRET=your-random-secret-here
SMTP_HOST=smtp.ionos.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=noreply@navimedi.org
FROM_EMAIL=noreply@navimedi.org
FROM_NAME=NaviMED Platform
EOF
chmod 600 .env

echo "=== STEP 5: Copy server files from Replit dist/ folder ==="
# You'll need to copy the dist/ folder from Replit

echo "=== STEP 6: Start PM2 ==="
pm2 start dist/index.js --name navimed
pm2 save
pm2 logs navimed --lines 50
