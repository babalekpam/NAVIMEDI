# Deployment Secrets Configuration Guide

## Required Secrets for Production Deployment

### 1. DATABASE_URL (Required)
**Purpose**: PostgreSQL database connection string  
**Format**: `postgresql://username:password@host:port/database`  
**Example**: `postgresql://user123:pass456@db.example.com:5432/navimed_prod`

**How to get it**:
- From Replit: Use the PostgreSQL database provisioned in your Repl
- From Neon: Create a project at neon.tech and copy the connection string
- From Supabase: Create a project and find it in Settings → Database

### 2. JWT_SECRET (Required)
**Purpose**: Secret key for signing authentication tokens  
**Format**: Random string, minimum 32 characters  
**Example**: `a7f8d9s8f7sd98f7sd98f7s9d8f7sd9f8sd7f98sd7f9`

**How to generate**:
```bash
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Using openssl
openssl rand -hex 32

# Option 3: Online generator (use a secure one)
# Visit: https://randomkeygen.com/
```

### 3. SENDGRID_API_KEY (Optional)
**Purpose**: Email notifications for user registration  
**Format**: Must start with `SG.`  
**Example**: `SG.abc123def456ghi789jkl012mno345pqr678stu901vwx234`

**How to get it**:
1. Sign up at https://sendgrid.com
2. Go to Settings → API Keys
3. Create a new API key with "Full Access"
4. Copy the key (you can only see it once!)

### 4. GEMINI_API_KEY (Optional)
**Purpose**: AI health analysis features  
**Format**: Alphanumeric string  
**Example**: `AIzaSyD-abc123def456ghi789jkl012mno345`

**How to get it**:
1. Visit https://makersuite.google.com/app/apikey
2. Create a new API key
3. Enable the Gemini API

## Setting Secrets in Replit Deployments

### Step 1: Access Deployment Settings
1. Click the "Deploy" button in your Repl
2. Go to "Settings" tab
3. Find "Environment Variables" section

### Step 2: Add Each Secret
For each secret:
1. Click "Add Environment Variable"
2. Enter the key name (e.g., `DATABASE_URL`)
3. Enter the value (paste your connection string/key)
4. Click "Save"

### Step 3: Required Secrets Checklist
- [ ] DATABASE_URL - PostgreSQL connection string
- [ ] JWT_SECRET - Random 32+ character string
- [ ] NODE_ENV - Set to `production`
- [ ] PORT - Set to `5000` (or your preferred port)

### Step 4: Optional Secrets
- [ ] SENDGRID_API_KEY - For email features
- [ ] SENDGRID_FROM_EMAIL - Your verified sender email
- [ ] GEMINI_API_KEY - For AI health analysis

## Testing Your Configuration

### Before Deployment
Test locally with a `.env` file (DO NOT commit this file!):
```env
DATABASE_URL=your_database_url_here
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
PORT=5000
```

### After Deployment
1. Check the `/debug` endpoint:
```bash
curl https://your-app.replit.app/debug
```

2. Look for:
```json
{
  "environment": {
    "NODE_ENV": "production",
    "hasJWT": true,
    "hasDB": true,
    "port": "5000"
  }
}
```

3. If `hasJWT` or `hasDB` is false, the corresponding secret is missing.

## Common Issues and Solutions

### Issue: "Service Unavailable" error
**Cause**: DATABASE_URL is incorrect or database is unreachable  
**Solution**: 
- Verify connection string format
- Check database is running
- Ensure IP whitelist includes Replit's IPs

### Issue: "Invalid token" errors
**Cause**: JWT_SECRET changed or missing  
**Solution**: 
- Ensure JWT_SECRET is set
- Use the same secret across all deployments
- Don't change it after users have logged in

### Issue: Emails not sending
**Cause**: SENDGRID_API_KEY invalid or missing  
**Solution**:
- Verify key starts with `SG.`
- Check SendGrid account is active
- Verify sender email is authenticated

## Security Best Practices

1. **Never commit secrets to Git**
   - Use environment variables only
   - Add `.env` to `.gitignore`

2. **Rotate secrets regularly**
   - Change JWT_SECRET every 90 days
   - Update database passwords periodically
   - Revoke and regenerate API keys if compromised

3. **Use different secrets for each environment**
   - Don't use production secrets in development
   - Keep staging and production separate

4. **Minimum secret requirements**
   - JWT_SECRET: 32+ characters
   - Database passwords: 16+ characters
   - Use alphanumeric + special characters

## Quick Setup Script

Save this as `generate-secrets.js` and run it to generate secure secrets:

```javascript
const crypto = require('crypto');

console.log('=== Generated Secrets for NaviMED ===\n');
console.log('JWT_SECRET=' + crypto.randomBytes(32).toString('hex'));
console.log('NODE_ENV=production');
console.log('PORT=5000');
console.log('\n=== Add these to your deployment ===');
console.log('DATABASE_URL=<your-postgresql-connection-string>');
console.log('SENDGRID_API_KEY=<your-sendgrid-api-key>');
console.log('SENDGRID_FROM_EMAIL=<your-verified-email>');
```

Run with: `node generate-secrets.js`

## Need Help?

If you're stuck:
1. Check the deployment logs for specific errors
2. Visit the `/debug` endpoint to see what's configured
3. Ensure all required secrets are set in deployment settings
4. Verify secret values don't have extra spaces or quotes