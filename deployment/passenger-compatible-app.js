#!/usr/bin/env node

/**
 * NaviMED Healthcare Platform - Passenger-compatible entry point
 * This file provides compatibility with Phusion Passenger hosting environments
 */

// Enhanced error handling for production deployment
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Set production environment
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

console.log('🏥 NaviMED Healthcare Platform starting...');
console.log('📍 Working directory:', process.cwd());
console.log('🌍 Environment:', process.env.NODE_ENV);
console.log('📊 Node.js version:', process.version);

try {
  // Import and start the application
  const module = await import('./dist/index.js');
  console.log('✅ NaviMED Healthcare Platform started successfully');
  
  // Keep the process alive
  process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully');
    process.exit(0);
  });
  
  process.on('SIGINT', () => {
    console.log('🛑 Received SIGINT, shutting down gracefully');
    process.exit(0);
  });
  
} catch (error) {
  console.error('❌ Failed to start NaviMED Healthcare Platform:');
  console.error('Error message:', error.message);
  console.error('Stack trace:', error.stack);
  
  // Log additional debugging information
  console.error('🔍 Debug information:');
  console.error('- Current directory:', process.cwd());
  console.error('- Node.js version:', process.version);
  console.error('- Platform:', process.platform);
  console.error('- Architecture:', process.arch);
  
  process.exit(1);
}