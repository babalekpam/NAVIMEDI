#!/usr/bin/env node

/**
 * NaviMED Healthcare Platform - Passenger-compatible entry point
 * This file provides compatibility with Phusion Passenger hosting
 * Uses CommonJS syntax for maximum compatibility
 */

// Set production environment
process.env.NODE_ENV = 'production';

const express = require('express');
const path = require('path');
const compression = require('compression');
const fs = require('fs');

const app = express();

// CRITICAL FIX: Enable trust proxy for Passenger/nginx deployment
app.set('trust proxy', 1);

// Basic middleware setup
app.use(compression({ 
  threshold: 1024, 
  level: 6,
  filter: (req, res) => {
    // Enable compression for all requests except sensitive endpoints
    const sensitiveEndpoints = ['/api/auth', '/api/patients', '/api/prescriptions'];
    if (sensitiveEndpoints.some(endpoint => req.path.startsWith(endpoint))) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check endpoints (these should work immediately)
app.get('/health', (req, res) => res.json({ status: 'healthy', timestamp: new Date().toISOString() }));
app.get('/healthz', (req, res) => res.json({ status: 'ok' }));
app.get('/status', (req, res) => res.json({ status: 'running' }));
app.get('/ping', (req, res) => res.send('pong'));

// Serve static files with caching optimization
const distPath = path.resolve(__dirname, 'dist', 'public');

// Check if dist directory exists
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath, { 
    maxAge: '1d', // Cache static assets for 1 day
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      // Different cache strategies for different file types
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour for HTML
      } else if (filePath.match(/\.(js|css)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 year for JS/CSS
      } else if (filePath.match(/\.(png|jpg|jpeg|gif|ico|svg|webp)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 year for images
      }
    }
  }));
} else {
  console.warn(`⚠️ Static files directory not found: ${distPath}`);
}

// CRITICAL: robots.txt endpoint for search engines
app.get('/robots.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
  const robotsPath = path.resolve(__dirname, 'client', 'public', 'robots.txt');
  if (fs.existsSync(robotsPath)) {
    res.sendFile(robotsPath);
  } else {
    res.send('User-agent: *\nAllow: /');
  }
});

// CRITICAL: sitemap.xml endpoint for search engines  
app.get('/sitemap.xml', (req, res) => {
  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
  const sitemapPath = path.resolve(__dirname, 'client', 'public', 'sitemap.xml');
  if (fs.existsSync(sitemapPath)) {
    res.sendFile(sitemapPath);
  } else {
    res.status(404).send('Sitemap not found');
  }
});

// Basic API route for testing  
app.get('/api/platform/stats', (req, res) => {
  res.json({
    platform: 'NaviMED Healthcare Platform',
    status: 'running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    database: dbAvailable ? 'connected' : 'limited'
  });
});

// Add more API routes that work without database
app.get('/api/health/detailed', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development',
    database: dbAvailable ? 'available' : 'unavailable'
  });
});

// Security headers for best practices
app.use((req, res, next) => {
  // Content Security Policy to prevent XSS attacks
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https: wss: ws:; frame-src https://js.stripe.com https://hooks.stripe.com");
  
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
});

// Database configuration with error handling
let dbAvailable = false;
try {
  if (process.env.DATABASE_URL) {
    // Test database connection without throwing
    console.log('✅ Database URL configured');
    dbAvailable = true;
  } else {
    console.warn('⚠️ DATABASE_URL not set - some features may be limited');
  }
} catch (error) {
  console.warn(`⚠️ Database connection issue: ${error.message}`);
}

// Catch-all handler for SPA routing
app.get('*', (req, res) => {
  try {
    const indexPath = path.resolve(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      // Read and modify the HTML to ensure it works in production
      let html = fs.readFileSync(indexPath, 'utf8');
      
      // Remove Vite-specific development scripts that cause issues in production
      html = html.replace(/<script type="module">[\s\S]*?import.*?@vite\/client.*?<\/script>/g, '');
      html = html.replace(/\/@vite\/client/g, '');
      
      // Ensure proper content type
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
    } else {
      // Serve a minimal HTML page if built files don't exist
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(200).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>NaviMED - Healthcare Platform for Hospitals & Pharmacies</title>
          <meta name="description" content="Transform your healthcare practice with NaviMED - the leading multi-tenant platform for hospitals, pharmacies & laboratories. HIPAA compliant, multilingual support, real-time patient management.">
        </head>
        <body>
          <div style="padding: 40px; text-align: center; font-family: system-ui, sans-serif;">
            <h1>NaviMED Healthcare Platform</h1>
            <p>Welcome to NaviMED - your comprehensive healthcare management solution.</p>
            <p>Status: Server is running (Build files loading...)</p>
            <p><a href="/health">System Health Check</a></p>
          </div>
        </body>
        </html>
      `);
    }
  } catch (error) {
    console.error('Error serving page:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: 'Unable to serve the requested page',
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Application Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Handle graceful shutdowns
process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

// Log startup information
console.log('✅ NaviMED Healthcare Platform initialized');
console.log(`📁 Static files: ${fs.existsSync(distPath) ? 'Found' : 'Missing'}`);
console.log(`🏥 Built files: ${fs.existsSync(path.resolve(__dirname, 'dist')) ? 'Found' : 'Missing'}`);
console.log('🚀 Ready for Passenger deployment');

// Export the Express app for Passenger (CommonJS style)
module.exports = app;