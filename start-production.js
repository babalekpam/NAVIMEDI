#!/usr/bin/env node

// Production start script that bypasses compilation issues
// This ensures the server starts correctly in production environments

process.env.NODE_ENV = 'production';

console.log('🚀 Starting NaviMED in production mode...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', process.env.PORT || 5000);

// Import and start the server using tsx
import { spawn } from 'child_process';

const server = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production'
  }
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code);
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});