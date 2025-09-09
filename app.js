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
    env: process.env.NODE_ENV || 'development'
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

// Try to load the built server application if it exists
let mainApp;
const builtServerPath = path.resolve(__dirname, 'dist', 'index.js');
if (fs.existsSync(builtServerPath)) {
  try {
    console.log(`📦 Loading built application from: ${builtServerPath}`);
    mainApp = require(builtServerPath);
    
    // If the built app has routes, use them
    if (mainApp && typeof mainApp.default === 'function') {
      // If it's an ES module default export
      console.log('✅ Loaded ES module application');
    } else if (mainApp && typeof mainApp === 'object' && mainApp.app) {
      // If it's a CommonJS module with app property
      console.log('✅ Loaded CommonJS application');
    }
  } catch (error) {
    console.warn(`⚠️ Could not load built application: ${error.message}`);
    mainApp = null;
  }
}

// Catch-all handler for SPA routing
app.get('*', (req, res) => {
  const indexPath = path.resolve(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ 
      error: 'Application not found', 
      message: 'The built application files are missing. Please run npm run build.'
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
console.log(`🏥 Built server: ${fs.existsSync(builtServerPath) ? 'Found' : 'Missing'}`);
console.log('🚀 Ready for Passenger deployment');

// Export the Express app for Passenger (CommonJS style)
module.exports = app;