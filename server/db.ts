import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// In production, log error but don't crash the server immediately
// This allows health checks to work even if database is not configured
if (!process.env.DATABASE_URL) {
  console.error("⚠️ DATABASE_URL is not set. Database operations will fail.");
  console.error("Please configure DATABASE_URL in your deployment environment.");
  
  // Create a dummy pool that will fail on actual use but won't crash the server
  // This allows the health check endpoints to work
  if (process.env.NODE_ENV === 'production') {
    console.error("Running in production without database - only health checks will work");
  }
}

export const pool = process.env.DATABASE_URL 
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : null as any; // Allow null in production for health checks

export const db = process.env.DATABASE_URL
  ? drizzle({ client: pool, schema })
  : null as any; // Allow null in production for health checks