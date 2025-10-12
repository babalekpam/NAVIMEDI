# 🚨 Passenger Deployment Troubleshooting Guide

## Error ID: 05f829ff - Application Could Not Be Started

This error occurs when Phusion Passenger cannot start your Node.js application. Here's how to fix it:

## 🔧 Immediate Fix Steps

### Step 1: Update Your Files
Replace these files in your `/httpdocs/` directory:

1. **Replace `index.js` with `app.js`**:
   - Delete the old `index.js` 
   - Upload the new `app.js` file (from deployment folder)

2. **Update `.htaccess`**:
   - Replace with the Passenger-compatible version
   - This enables Node.js processing

3. **Update `package.json`**:
   - Use the production-ready `package-production.json`
   - Rename it to `package.json`

### Step 2: Plesk Configuration
1. **Go to:** Plesk → Websites & Domains → navimedi.org
2. **Find:** Node.js section
3. **Set these values:**
   - **Application startup file:** `app.js` (not index.js!)
   - **Application mode:** `production`
   - **Node.js version:** Latest (18+ recommended)
   - **Environment variables:** Add your .env variables here

### Step 3: Dependencies Installation
1. **In Plesk Node.js section:**
2. **Click:** "NPM Install"
3. **Wait:** For installation to complete
4. **Check:** No errors in the installation log

### Step 4: Restart Application
1. **Click:** "Restart App" in Plesk
2. **Check:** Application logs for startup messages
3. **Test:** Visit https://navimedi.org

## 🧪 Diagnostic Steps

### Check 1: File Structure
Your `/httpdocs/` should look like this:
```
/httpdocs/
├── app.js                 # Main Node.js entry point (NEW)
├── package.json          # Dependencies (UPDATED)
├── .htaccess            # Passenger config (UPDATED)
├── .env                 # Environment variables
├── dist/                # Built application files
│   └── index.js        # Compiled server code
└── public/             # Frontend static files
    ├── index.html
    └── assets/
```

### Check 2: Environment Variables
Ensure these are set in Plesk Node.js environment:
```
NODE_ENV=production
DATABASE_URL=your_postgresql_connection
JWT_SECRET=your_jwt_secret
SMTP_HOST=navimedi.org
SMTP_PORT=465
SMTP_USER=no-reply@navimedi.org
SMTP_PASS=your_smtp_password
STRIPE_SECRET_KEY=your_stripe_key
```

### Check 3: Log Files
Check these logs in Plesk:
- **Error Logs:** Look for detailed error messages
- **Access Logs:** Check if requests are reaching the app
- **Passenger Logs:** Look for Passenger-specific errors

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot find module" errors
**Cause:** Missing dependencies
**Solution:** 
1. Delete `node_modules` folder
2. Run "NPM Install" again in Plesk
3. Restart application

### Issue 2: "Module type mismatch" errors
**Cause:** ES module compatibility issues
**Solution:** 
1. Use the provided `app.js` (compatibility wrapper)
2. Ensure `package.json` has `"type": "module"`

### Issue 3: "Permission denied" errors
**Cause:** File permissions
**Solution:**
1. Set folder permissions to 755
2. Set file permissions to 644
3. Restart application

### Issue 4: Database connection errors
**Cause:** Missing DATABASE_URL
**Solution:**
1. Add DATABASE_URL to Plesk environment variables
2. Test database connection
3. Restart application

## 🎯 Expected Results After Fix

✅ **Application starts successfully**
✅ **https://navimedi.org shows login page**
✅ **API endpoints respond (try /api/health)**
✅ **No Passenger errors in logs**
✅ **Super admin login works**

## 📞 Still Having Issues?

If the problem persists:

1. **Check Passenger version:** Ensure it supports Node.js
2. **Contact hosting support:** Provide Error ID 05f829ff
3. **Enable debug mode:** Set `PassengerFriendlyErrorPages on`
4. **Check server resources:** Ensure sufficient RAM/CPU

The updated files should resolve the Passenger startup issue completely! 🚀