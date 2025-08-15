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

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));



// CRITICAL: Ultra-fast health check endpoints for deployment
// These MUST respond in <100ms with zero dependencies
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/status', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/ping', (req, res) => {
  res.status(200).send('ok');
});

// Root endpoint handled by frontend - health checks use other endpoints

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
    // Wait a moment for database to be fully ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    
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
    
    // Retry initialization after delay in production
    if (process.env.NODE_ENV === 'production') {
      setTimeout(() => {
        log("🔄 Retrying platform initialization...");
        initializePlatform().catch(retryError => {
          console.error("Platform initialization retry failed:", retryError);
        });
      }, 10000); // Retry after 10 seconds
    }
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
    // In production, serve built static files
    const path = await import("path");
    const fs = await import("fs");
    const distPath = path.resolve(import.meta.dirname, "..", "dist", "public");
    
    if (!fs.existsSync(distPath)) {
      console.error(`Build directory not found: ${distPath}`);
      console.log("Available directories:", fs.readdirSync(path.resolve(import.meta.dirname, "..")));
    }
    
    app.use(express.static(distPath));
    // Catch-all handler for SPA routing
    app.use("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  // CRITICAL: Proper server listening for deployment
  server.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
    log(`serving on port ${port}`);
    
    // Initialize platform in background - don't block server startup
    setTimeout(() => {
      initializePlatform().catch(error => {
        console.error("Platform initialization error:", error);
        // Continue running even if initialization fails
      });
    }, 100);
  });

  // Handle process errors gracefully - do NOT exit in production
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Log but continue running in production
  });

  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // DO NOT call process.exit() - keep server running
    console.log('Server continuing to run despite error');
  });
})();
