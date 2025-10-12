# NaviMED Healthcare Platform - Plesk Deployment Guide

## 🚀 Complete Deployment Instructions

Your NaviMED application has been successfully built and is ready for deployment to your Plesk hosting environment.

## 📦 What You Need to Upload

From your built application, you need to upload these files to your Plesk `/httpdocs` folder:

### Required Files:
```
/httpdocs/
├── index.js                    (Main server file)
├── package.json               (Dependencies configuration)
├── public/                    (Frontend files)
│   ├── index.html            (Main application page)
│   ├── assets/               (CSS, JS, Images)
│   ├── robots.txt
│   └── sitemap.xml
└── .env                      (Environment variables - create this)
```

## 🔧 Step-by-Step Deployment

### Step 1: Enable Node.js in Plesk
1. **Login to Plesk**
2. **Go to:** Websites & Domains → navimedi.org
3. **Find:** "Node.js" section
4. **Enable:** Node.js support
5. **Set:** Node.js version to latest (18+ recommended)
6. **Set:** Application startup file: `index.js`
7. **Set:** Application mode: `production`

### Step 2: Upload Application Files
1. **Go to:** File Manager in Plesk
2. **Navigate to:** `/httpdocs/` folder
3. **Delete:** Default Plesk files (index.html, etc.)
4. **Upload:** All files from your `dist` folder:
   - Upload `dist/index.js` to `/httpdocs/index.js`
   - Upload entire `dist/public/` folder to `/httpdocs/public/`
   - Upload the `package.json` file

### Step 3: Install Dependencies
1. **In Plesk Node.js section:**
2. **Click:** "NPM Install" or use terminal
3. **Wait:** For dependencies to install

### Step 4: Configure Environment Variables
Create `/httpdocs/.env` file with:
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_key_here
SMTP_HOST=navimedi.org
SMTP_PORT=465
SMTP_USER=no-reply@navimedi.org
SMTP_PASS=your_smtp_password
STRIPE_SECRET_KEY=your_stripe_key
```

### Step 5: Start the Application
1. **In Plesk Node.js section:**
2. **Click:** "Restart App" or "Enable Production Mode"
3. **Check:** Application logs for successful startup

## 🔒 SSL Configuration (Already Done!)
✅ Your SSL certificate is already properly configured
✅ HTTPS redirect is working
✅ Security headers are active

## 🧪 Testing Your Deployment

### Test These URLs:
- **Main site:** https://navimedi.org (or https://www.navimedi.org)
- **API health:** https://navimedi.org/api/health
- **Login page:** https://navimedi.org/login
- **Platform stats:** https://navimedi.org/api/platform/stats

### Super Admin Login:
- **Email:** abel@argilette.com
- **Password:** Serrega1208@

## 🚨 Troubleshooting

### If the site shows 404:
1. **Check:** Node.js is enabled and running
2. **Verify:** `index.js` is in `/httpdocs/` root
3. **Check:** Application logs in Plesk
4. **Ensure:** Dependencies are installed

### If login doesn't work:
1. **Check:** Database connection in `.env`
2. **Verify:** JWT secret is set
3. **Check:** CSRF protection is working

### If static files don't load:
1. **Verify:** `/public/` folder exists in `/httpdocs/`
2. **Check:** File permissions (755 for folders, 644 for files)

## 📊 Expected Result

After successful deployment:
- ✅ https://navimedi.org shows NaviMED login page
- ✅ Super admin can log in successfully
- ✅ All API endpoints respond correctly
- ✅ SSL/TLS security works perfectly
- ✅ Application fully functional

## 🎯 File Structure After Deployment

```
/httpdocs/
├── index.js                 # Main Node.js server
├── package.json            # Dependencies
├── .env                   # Environment variables
└── public/               # Static frontend files
    ├── index.html        # Main page
    ├── assets/          # CSS, JS, Images
    ├── robots.txt
    └── sitemap.xml
```

## 🚀 Performance Optimization

Your application includes:
- ✅ Production-optimized builds
- ✅ Compressed assets  
- ✅ Security headers
- ✅ BREACH protection
- ✅ Rate limiting
- ✅ SSL/TLS encryption

**Your NaviMED Healthcare Platform is ready for production use!** 🏥✨