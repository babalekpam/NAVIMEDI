#!/bin/bash
# NaviMED VPS Production Deployment Fix Script
# Run this on your IONOS VPS at 74.208.166.77

echo "🚀 NaviMED Production Deployment Fix"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Navigate to project directory
PROJECT_DIR="/var/www/vhosts/navimedi.org/httpdocs/NaviMed"
cd $PROJECT_DIR || exit 1

echo -e "${GREEN}✓${NC} In directory: $PROJECT_DIR"

# Stop current PM2 processes
echo ""
echo "Stopping current PM2 processes..."
pm2 delete all 2>/dev/null || echo "No PM2 processes to stop"

# Pull latest code
echo ""
echo "Pulling latest code from Git..."
git pull origin main

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${YELLOW}⚠${NC} .env.production not found. Creating template..."
    cat > .env.production << 'EOF'
# CRITICAL: Update these values before running!
DATABASE_URL=postgresql://username:password@localhost:5432/navimed
JWT_SECRET=CHANGE_THIS_TO_YOUR_SECRET
NODE_ENV=production
PORT=5000

# SMTP Email (IONOS)
SMTP_HOST=smtp.ionos.com
SMTP_PORT=587
SMTP_USER=no-reply@navimedi.org
SMTP_PASS=YOUR_EMAIL_PASSWORD

# Optional: OpenAI for NaviMED AI
# OPENAI_API_KEY=sk-your-key-here

# Optional: Stripe (can skip for now)
# STRIPE_SECRET_KEY=sk_live_your_key
# VITE_STRIPE_PUBLIC_KEY=pk_live_your_key
EOF
    
    echo -e "${RED}✗${NC} CRITICAL: Edit .env.production with your actual values!"
    echo "   Run: nano .env.production"
    echo ""
    read -p "Press Enter after you've updated .env.production..."
else
    echo -e "${GREEN}✓${NC} .env.production exists"
fi

# Install/update dependencies
echo ""
echo "Installing dependencies..."
npm install --production=false

# Build frontend only
echo ""
echo "Building frontend assets..."
npm run build 2>&1 | grep -v "WARNING" || true

# Check if tsx is available
if ! command -v tsx &> /dev/null; then
    echo -e "${YELLOW}⚠${NC} tsx not found, installing globally..."
    npm install -g tsx
fi

# Create PM2 ecosystem config if it doesn't exist
if [ ! -f ecosystem.config.cjs ]; then
    echo ""
    echo "Creating PM2 ecosystem configuration..."
    cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [
    {
      name: 'navimed',
      script: 'tsx',
      args: 'server/index.ts',
      interpreter: 'node',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
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
EOF
    echo -e "${GREEN}✓${NC} ecosystem.config.cjs created"
fi

# Create logs directory
mkdir -p logs

# Load environment variables and start PM2
echo ""
echo "Starting NaviMED with PM2..."

# Export .env.production variables
set -a
source .env.production
set +a

# Start PM2 with ecosystem config
pm2 start ecosystem.config.cjs

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup || true

echo ""
echo -e "${GREEN}✓${NC} Deployment complete!"
echo ""
echo "======================================"
echo "Checking status..."
echo "======================================"
pm2 status

echo ""
echo "======================================"
echo "Recent logs (last 30 lines):"
echo "======================================"
pm2 logs navimed --lines 30 --nostream

echo ""
echo "======================================"
echo "🎉 Deployment Summary"
echo "======================================"
echo "✓ Project: NaviMED Healthcare Platform"
echo "✓ Location: $PROJECT_DIR"
echo "✓ PM2 Status: Check above"
echo ""
echo "Next Steps:"
echo "1. Check for errors in logs above"
echo "2. Test: curl http://localhost:5000/health"
echo "3. Visit: https://navimedi.org"
echo "4. Login as super admin: abel@argilette.com (leave org blank)"
echo ""
echo "Useful Commands:"
echo "  pm2 logs navimed          - View logs"
echo "  pm2 restart navimed       - Restart app"
echo "  pm2 stop navimed          - Stop app"
echo "  pm2 monit                 - Monitor resources"
echo ""
echo "======================================"
