#!/usr/bin/env node

/**
 * NaviMED Healthcare Platform - Production Startup Script
 * This script handles graceful startup and error recovery for Plesk hosting
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const APP_NAME = 'NaviMED Healthcare Platform';
const APP_FILE = 'index.js';
const LOG_FILE = 'application.log';
const ERROR_LOG = 'error.log';

console.log(`🏥 Starting ${APP_NAME}...`);

// Check if required files exist
const requiredFiles = [APP_FILE, 'package.json'];
for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ Required file missing: ${file}`);
    process.exit(1);
  }
}

// Check environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.warn(`⚠️ Missing environment variables: ${missingEnvVars.join(', ')}`);
  console.warn('Application may not function correctly without these variables.');
}

// Function to start the application
function startApp() {
  console.log(`🚀 Launching ${APP_NAME} server...`);
  
  const app = spawn('node', [APP_FILE], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: {
      ...process.env,
      NODE_ENV: 'production'
    }
  });

  // Handle application output
  app.stdout.on('data', (data) => {
    const message = data.toString().trim();
    console.log(`[APP] ${message}`);
    
    // Log to file
    fs.appendFileSync(LOG_FILE, `[${new Date().toISOString()}] ${message}\n`);
  });

  // Handle application errors
  app.stderr.on('data', (data) => {
    const error = data.toString().trim();
    console.error(`[ERROR] ${error}`);
    
    // Log errors to separate file
    fs.appendFileSync(ERROR_LOG, `[${new Date().toISOString()}] ${error}\n`);
  });

  // Handle application exit
  app.on('close', (code) => {
    console.log(`❌ Application exited with code ${code}`);
    
    if (code !== 0) {
      console.log('🔄 Attempting to restart in 5 seconds...');
      setTimeout(() => {
        startApp();
      }, 5000);
    }
  });

  // Handle startup errors
  app.on('error', (err) => {
    console.error(`❌ Failed to start application: ${err.message}`);
    console.log('🔄 Retrying in 10 seconds...');
    setTimeout(() => {
      startApp();
    }, 10000);
  });

  return app;
}

// Graceful shutdown handler
function gracefulShutdown(signal) {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  process.exit(0);
}

// Register shutdown handlers
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err.message);
  fs.appendFileSync(ERROR_LOG, `[${new Date().toISOString()}] UNCAUGHT EXCEPTION: ${err.stack}\n`);
  console.log('🔄 Restarting application...');
  setTimeout(() => {
    startApp();
  }, 2000);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚫 Unhandled Promise Rejection at:', promise, 'reason:', reason);
  fs.appendFileSync(ERROR_LOG, `[${new Date().toISOString()}] UNHANDLED REJECTION: ${reason}\n`);
});

// Start the application
console.log(`✅ Production startup script initialized`);
console.log(`📍 Working directory: ${process.cwd()}`);
console.log(`📊 Node.js version: ${process.version}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'production'}`);

startApp();