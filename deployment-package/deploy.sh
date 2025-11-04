#!/bin/bash
set -e

echo "🚀 NaviMED VPS Deployment Script"
echo "=================================="

# Configuration
APP_DIR="/var/www/vhosts/navimedi.org/httpdocs/NaviMed"
DB_USER="navimed_user"
DB_NAME="navimed"
DB_HOST="localhost"
DB_PASS="NaviMed2025!Secure"

echo ""
echo "📍 Step 1: Stopping existing PM2 process..."
pm2 stop navimed 2>/dev/null || echo "No existing process to stop"
pm2 delete navimed 2>/dev/null || echo "No existing process to delete"

echo ""
echo "📦 Step 2: Installing production dependencies..."
cd "$APP_DIR"
npm ci --omit=dev --silent

echo ""
echo "🗄️  Step 3: Seeding database..."
PGPASSWORD="$DB_PASS" psql -U "$DB_USER" -d "$DB_NAME" -h "$DB_HOST" -f seed-database.sql

echo ""
echo "🔧 Step 4: Creating environment file..."
cat > .env << ENV_EOF
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://$DB_USER:$DB_PASS@$DB_HOST:5432/$DB_NAME
JWT_SECRET=navimed-prod-jwt-secret-2025-secure
SESSION_SECRET=navimed-session-secret-2025-secure
ENV_EOF

echo ""
echo "🚀 Step 5: Starting application with PM2..."
pm2 start dist/index.js --name navimed --node-args="--max-old-space-size=2048"
pm2 save

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "📊 Checking status..."
pm2 status navimed

echo ""
echo "🔗 Application should be running at: https://navimedi.org"
echo "🔑 Super Admin Login:"
echo "   Email: abel@argilette.com"
echo "   Password: Serrega1208@"
echo "   Organization: (leave blank)"
echo ""
echo "📝 View logs with: pm2 logs navimed"
echo ""
