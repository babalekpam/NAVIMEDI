import express, { type Express } from "express";

// Simple test routes with no dependencies
export function registerSimpleTestRoutes(app: Express) {
  console.log('🧪 Registering simple test routes...');

  // Simple POST test endpoint  
  app.post('/api/simple-post-test', (req, res) => {
    console.log('🎉 SIMPLE POST TEST - Request received!', req.body);
    res.json({ 
      success: true, 
      message: 'Simple POST endpoint working perfectly!',
      timestamp: new Date().toISOString(),
      data: req.body
    });
  });

  // Simple insurance test endpoint
  app.post('/api/insurance-test', (req, res) => {
    console.log('💊 INSURANCE TEST - Request received!', req.body);
    res.json({ 
      success: true, 
      message: 'Insurance test endpoint working!',
      claimId: `TEST_${Date.now()}`,
      status: 'received',
      data: req.body
    });
  });

  console.log('✅ Simple test routes registered successfully');
}