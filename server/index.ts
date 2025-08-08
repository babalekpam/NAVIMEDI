import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { db } from "./db";
import { tenants, users } from "@shared/schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { trialSuspensionService } from "./trial-suspension-service";
import { createTestHospital } from "./create-test-hospital";
import path from "path";

const app = express();

// CRITICAL: Fastest possible health check for deployment systems
// Must be the very first route before any middleware
app.get('/', (req, res) => {
  // Always return 200 OK for deployment health checks
  res.status(200).json({
    status: 'ok',
    service: 'carnet-healthcare',
    health: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Additional explicit health check endpoints
app.get('/_health', (req, res) => {
  res.status(200).send('OK');
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime())
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// DEPLOYMENT FIX: Simple, fast root endpoint for deployment health checks
// Always returns 200 OK immediately to satisfy deployment system requirements
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'carnet-healthcare',
    health: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    frontend: '/app'
  });
});

// Frontend application access point - serves the React application
app.get('/app*', (req, res, next) => {
  // Continue to Vite middleware for frontend serving
  next();
});

// Multiple health check endpoints for deployment monitoring
// These must respond immediately without any heavy operations
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    service: 'carnet-healthcare',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/healthz', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    service: 'carnet-healthcare',
    timestamp: new Date().toISOString()
  });
});

app.get('/status', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    service: 'carnet-healthcare',
    timestamp: new Date().toISOString()
  });
});

// Simple text responses for deployment systems that expect plain text
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// Additional health endpoints commonly used by deployment systems
app.get('/ready', (req, res) => {
  res.status(200).send('OK');
});

app.get('/alive', (req, res) => {
  res.status(200).send('OK');
});

app.get('/liveness', (req, res) => {
  res.status(200).json({ status: 'ok', alive: true });
});

app.get('/readiness', (req, res) => {
  res.status(200).json({ status: 'ok', ready: true });
});

// Explicit deployment health check endpoint
app.get('/deployment-health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    service: 'carnet-healthcare',
    deployment: 'ready',
    timestamp: new Date().toISOString()
  });
});

// Duplicate root handler removed - using the existing comprehensive handler above

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Initialize platform asynchronously after server starts
let platformInitialized = false;

async function initializePlatform() {
  try {
    // Create platform tenant (ARGILETTE)
    const existingTenant = await db.select().from(tenants).where(eq(tenants.subdomain, 'argilette')).limit(1);
    
    let platformTenant;
    const tenantResult = Array.isArray(existingTenant) ? existingTenant : [];
    if (tenantResult.length === 0) {
      const [tenant] = await db.insert(tenants).values({
        name: "ARGILETTE Platform",
        type: "hospital",
        subdomain: "argilette",
        settings: {
          isPlatformOwner: true,
          features: ["super_admin", "tenant_management", "multi_tenant"]
        },
        isActive: true
      }).returning();
      platformTenant = tenant;
      log("✓ Created platform tenant: ARGILETTE");
    } else {
      platformTenant = existingTenant[0];
      log("✓ Platform tenant already exists");
    }

    // Create super admin user
    const existingAdmin = await db.select().from(users).where(eq(users.email, 'abel@argilette.com')).limit(1);
    
    if (!existingAdmin || existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash('Serrega1208@', 10);
      
      await db.insert(users).values({
        id: nanoid(),
        tenantId: platformTenant.id,
        username: 'abel_admin',
        email: 'abel@argilette.com',
        password: hashedPassword,
        firstName: 'Abel',
        lastName: 'Platform Admin',
        role: 'super_admin',
        isActive: true
      });
      
      log("✓ Created super admin user: abel@argilette.com");
    } else {
      log("✓ Super admin already exists");
    }
    
    platformInitialized = true;
    log("✓ Platform initialization complete");
  } catch (error) {
    log("❌ Platform initialization failed: " + error);
    console.error("Platform initialization error:", error);
  }
}

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    console.error('Unhandled error:', {
      url: req.url,
      method: req.method,
      error: err.stack || err.message || err
    });

    if (!res.headersSent) {
      res.status(status).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? message : 'Internal server error'
      });
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    
    // Initialize platform after server is running
    initializePlatform().catch(error => {
      console.error("Platform initialization error:", error);
    });
  });

  // Handle process errors to prevent crashes
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
  });
})();