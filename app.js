#!/usr/bin/env node

/**
 * NaviMED Healthcare Platform - Passenger-compatible entry point
 * This file provides compatibility with Phusion Passenger hosting
 */

import('./dist/index.js')
  .then((app) => {
    console.log('✅ NaviMED Healthcare Platform started successfully');
  })
  .catch((error) => {
    console.error('❌ Failed to start NaviMED:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  });