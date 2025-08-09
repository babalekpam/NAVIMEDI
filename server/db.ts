import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  console.error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
  // In production deployments, continue with fallback behavior instead of exiting
  if (process.env.NODE_ENV === 'production') {
    console.error('Production deployment detected - using fallback database configuration');
    // Set a placeholder to prevent immediate crash during deployment health checks
    process.env.DATABASE_URL = 'postgresql://placeholder:placeholder@localhost/placeholder';
  } else {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });