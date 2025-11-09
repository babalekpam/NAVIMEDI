# VPS Deployment Fix for CSS Issues

## Problem
Your CSS and JavaScript files don't load on the VPS because the build output location doesn't match where the production server looks for them.

## Quick Fix (Do this on your VPS)

### Option 1: Automated Deployment (Recommended)

SSH into your VPS and run these commands:

```bash
# Navigate to project directory
cd /var/www/vhosts/navimedi.org/httpdocs/NaviMed

# Pull latest code (includes the fix)
git pull origin main

# Install dependencies (if needed)
npm install

# Build frontend
npm run build

# Run the post-build script to copy assets to correct location
bash post-build.sh

# Restart your application
pm2 restart navimed
# OR if using a different process manager:
# systemctl restart navimed
```

### Option 2: Manual Deployment (If git pull doesn't work)

If you can't pull from git, manually copy the `post-build.sh` file to your VPS, then:

```bash
# SSH into VPS
ssh your-user@your-vps-ip

# Navigate to project
cd /var/www/vhosts/navimedi.org/httpdocs/NaviMed

# Make sure post-build.sh is executable
chmod +x post-build.sh

# Run build process
npm run build

# Copy assets to production location
bash post-build.sh

# Restart application
pm2 restart navimed
```

## What the Fix Does

The `post-build.sh` script:
1. Takes built assets from `dist/public` (where Vite puts them)
2. Copies them to `server/public` (where production server expects them)
3. Removes stale files to prevent CSS caching issues

## Verify It Works

After deploying, test your site:

```bash
# Check if CSS files exist
ls -la server/public/assets/

# Check if your site loads
curl -I https://navimedi.org

# Check browser console for errors
# Visit https://navimedi.org and open browser DevTools (F12)
# Look for 404 errors on CSS/JS files
```

## Future Deployments

Every time you deploy new code to your VPS:

```bash
git pull origin main
npm install          # Only if package.json changed
npm run build
bash post-build.sh   # ← IMPORTANT: Don't forget this!
pm2 restart navimed
```

## Troubleshooting

### CSS still broken after deployment

1. **Check if files were copied:**
   ```bash
   ls -la server/public/assets/
   ```
   You should see CSS and JS files.

2. **Clear server cache:**
   ```bash
   rm -rf server/public/*
   bash post-build.sh
   pm2 restart navimed
   ```

3. **Check PM2 logs:**
   ```bash
   pm2 logs navimed --lines 50
   ```
   Look for any errors about static files.

### post-build.sh fails

If you get "rsync not found":
- The script automatically falls back to `cp`
- This is fine, it will still work

If you get permission errors:
```bash
chmod +x post-build.sh
sudo chown -R your-user:your-group server/public
```

## Need Help?

If CSS is still broken after following these steps:
1. Check PM2/application logs for errors
2. Check nginx error logs: `tail -f /var/log/nginx/error.log`
3. Verify the build completed: `ls -la dist/public/assets/`
4. Verify files were copied: `ls -la server/public/assets/`
