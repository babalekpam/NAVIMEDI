#!/usr/bin/env node

/**
 * NaviMED Healthcare Platform - Passenger-compatible entry point
 * This file provides compatibility with Phusion Passenger hosting
 */

// Set production environment
process.env.NODE_ENV = 'production';

// For Passenger deployment, we need to export the app differently
// Since the built application is in an IIFE, we'll create a wrapper

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Basic middleware setup
app.use(compression({ threshold: 1024, level: 6 }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check endpoints (these should work immediately)
app.get('/health', (req, res) => res.json({ status: 'healthy', timestamp: new Date().toISOString() }));
app.get('/healthz', (req, res) => res.json({ status: 'ok' }));
app.get('/status', (req, res) => res.json({ status: 'running' }));
app.get('/ping', (req, res) => res.send('pong'));

// Serve static files
const distPath = path.resolve(__dirname, 'dist', 'public');
app.use(express.static(distPath, { 
  maxAge: '1d',
  etag: false 
}));

// Basic API route for testing
app.get('/api/platform/stats', (req, res) => {
  res.json({
    platform: 'NaviMED Healthcare Platform',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// SPA fallback for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.resolve(distPath, 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// For development, start server normally
// For production (Passenger), export the app
if (process.env.NODE_ENV === 'development') {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
} else {
  console.log('✅ NaviMED Healthcare Platform ready for Passenger');
}

// Export app for Passenger
export default app;