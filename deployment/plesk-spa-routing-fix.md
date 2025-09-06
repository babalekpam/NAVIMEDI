# 🔧 NaviMED SPA Routing Fix for Plesk

## 🚨 The Problem
Your NaviMED application is deployed and working, but `/login` and other routes show 404 errors because:
- The main page `/` loads correctly 
- But `/login`, `/dashboard`, etc. return 404 errors
- This is a Single Page Application (SPA) routing issue

## ✅ The Solution

### Method 1: Add .htaccess File (Easiest)
1. **Create file:** `.htaccess` 
2. **Upload to:** `/httpdocs/` in Plesk File Manager
3. **Content:**
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule ^(.*)$ /index.html [L]
```

### Method 2: Apache Virtual Host Configuration
In your Plesk Apache configuration:
```apache
<Directory "/var/www/vhosts/navimedi.org/httpdocs">
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ /index.html [L]
</Directory>
```

### Method 3: Node.js Catch-All Route
Your Node.js server should have this catch-all route (it might be missing):
```javascript
// Serve React app for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
```

## 🧪 Test After Fix
After applying the fix:
- ✅ https://navimedi.org/ (should work)
- ✅ https://navimedi.org/login (should work)
- ✅ https://navimedi.org/dashboard (should work)

## 🎯 Expected Result
All routes will serve the main application, and React Router will handle the navigation client-side.

Your login page will load correctly and the CSRF fix will work!