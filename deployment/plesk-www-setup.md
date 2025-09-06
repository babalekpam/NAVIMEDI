# NaviMED WWW Subdomain Setup for Plesk

## Issue
Plesk redirects `navimedi.org` → `www.navimedi.org`, but the application only exists on the non-www domain.

## Solution: Deploy to Both Domains

### Method 1: Subdomain Setup (Recommended)
1. **Login to Plesk**
2. **Go to:** Websites & Domains
3. **Click:** "+ Add Subdomain"
4. **Configure:**
   - Subdomain name: `www`
   - Document root: Same as main domain or `/httpdocs`
   - Enable SSL: ✅ Yes
5. **Apply SSL certificate** to www subdomain
6. **Upload/Copy** NaviMED application files to www folder

### Method 2: File Copy Method
1. **Access File Manager** in Plesk
2. **Navigate to:** `navimedi.org` document root
3. **Copy all NaviMED files**
4. **Navigate to:** `www.navimedi.org` document root  
5. **Paste files** (overwrite default pages)

### Method 3: Document Root Sharing
1. **Go to:** Hosting Settings for www.navimedi.org
2. **Change Document Root** to point to same folder as navimedi.org
3. **Save settings**

## Verification
After setup, test both URLs:
- https://navimedi.org ✅
- https://www.navimedi.org ✅

Both should show the NaviMED login page.

## SSL Certificate
Ensure certificate covers both domains:
```
Subject Alternative Names:
- navimedi.org
- www.navimedi.org
```

## Environment Variables
Make sure both domains use the same:
- Database connection
- Environment settings  
- API keys
- CORS settings

## Testing Login
Test super admin login on both:
- Email: abel@argilette.com
- Password: Serrega1208@