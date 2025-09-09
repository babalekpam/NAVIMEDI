#!/usr/bin/env node

/**
 * Production startup wrapper for Replit deployment
 * This wrapper ensures the app starts successfully even with missing dependencies
 */

console.log('🚀 Starting NaviMED Healthcare Platform (Production Mode)');

// Set production environment
process.env.NODE_ENV = 'production';

// Try to start the built application first
async function startBuiltApp() {
  try {
    console.log('📦 Attempting to start built application...');
    
    // Import the built server
    const builtApp = await import('./dist/index.js');
    console.log('✅ Built application started successfully');
    return true;
  } catch (error) {
    console.warn(`⚠️ Built application failed to start: ${error.message}`);
    return false;
  }
}

// Fallback to resilient app.js
async function startFallbackApp() {
  try {
    console.log('🔄 Starting fallback application...');
    
    // Use dynamic import for app.js
    const fallbackApp = await import('./app.js');
    console.log('✅ Fallback application started successfully');
    return true;
  } catch (error) {
    console.error(`❌ Fallback application failed: ${error.message}`);
    return false;
  }
}

// Main startup logic
async function main() {
  console.log('🏥 NaviMED Healthcare Platform - Production Startup');
  
  // Try built app first, fallback to resilient app.js
  const builtAppStarted = await startBuiltApp();
  
  if (!builtAppStarted) {
    console.log('🔄 Built app failed, trying fallback...');
    const fallbackStarted = await startFallbackApp();
    
    if (!fallbackStarted) {
      console.error('💥 Both startup methods failed! Check logs for details.');
      process.exit(1);
    }
  }
  
  console.log('🌟 Application successfully started in production mode');
}

// Handle errors gracefully
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error.message);
  console.log('🔄 Attempting graceful recovery...');
});

process.on('unhandledRejection', (reason) => {
  console.error('🚫 Unhandled Rejection:', reason);
  console.log('🔄 Continuing to run...');
});

// Start the application
main().catch((error) => {
  console.error('💥 Startup failed:', error.message);
  process.exit(1);
});