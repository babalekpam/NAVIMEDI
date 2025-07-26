import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertTenantSchema, insertPatientSchema, insertAppointmentSchema, insertPrescriptionSchema, insertLabOrderSchema, insertInsuranceClaimSchema, insertSubscriptionSchema, insertReportSchema } from "@shared/schema";
import { authenticateToken, requireRole } from "./middleware/auth";
import { setTenantContext, requireTenant } from "./middleware/tenant";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes (before tenant middleware)
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password, tenantId } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      let user;
      
      // For super admin, allow login with email or username and find tenant automatically
      if (username === 'abel@argilette.com' || username === 'abel_admin') {
        // Get all users with this username/email across all tenants
        const allUsers = await storage.getAllUsers();
        user = allUsers.find(u => 
          (u.email === 'abel@argilette.com' || u.username === 'abel_admin') && 
          u.role === 'super_admin'
        );
      } else if (tenantId) {
        // Regular tenant user login
        user = await storage.getUserByUsername(username, tenantId);
      } else {
        return res.status(400).json({ message: "Tenant ID is required for regular users" });
      }

      if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!user.isActive) {
        return res.status(401).json({ message: "Account is disabled" });
      }

      // Update last login
      await storage.updateUser(user.id, { lastLogin: new Date() });

      const token = jwt.sign(
        { 
          userId: user.id, 
          tenantId: user.tenantId, 
          role: user.role,
          username: user.username 
        },
        JWT_SECRET,
        { expiresIn: "8h" }
      );

      // Create audit log
      await storage.createAuditLog({
        tenantId: user.tenantId,
        userId: user.id,
        entityType: "user",
        entityId: user.id,
        action: "login",
        newData: { loginTime: new Date() },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tenantId: user.tenantId
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Apply tenant context middleware to all other API routes
  app.use("/api", setTenantContext);

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username, userData.tenantId);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(userData.email, userData.tenantId);
      if (existingEmail) {
        return res.status(409).json({ message: "Email already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });

      // Create audit log
      await storage.createAuditLog({
        tenantId: user.tenantId,
        userId: user.id,
        entityType: "user",
        entityId: user.id,
        action: "register",
        newData: { username: user.username, email: user.email, role: user.role },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });

      res.status(201).json({
        message: "User created successfully",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tenantId: user.tenantId
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Protected routes - require authentication
  app.use("/api", authenticateToken);

  // User profile
  app.get("/api/user/profile", async (req, res) => {
    try {
      const user = await storage.getUser(req.user!.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
        lastLogin: user.lastLogin
      });
    } catch (error) {
      console.error("Profile error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Tenant management routes
  app.get("/api/tenants", requireRole(["super_admin"]), async (req, res) => {
    try {
      const tenants = await storage.getAllTenants();
      res.json(tenants);
    } catch (error) {
      console.error("Get tenants error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/tenants", requireRole(["super_admin"]), async (req, res) => {
    try {
      const tenantData = insertTenantSchema.parse(req.body);
      const tenant = await storage.createTenant(tenantData);

      // Create audit log
      await storage.createAuditLog({
        tenantId: tenant.id,
        userId: req.user!.userId,
        entityType: "tenant",
        entityId: tenant.id,
        action: "create",
        newData: tenant,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });

      res.status(201).json(tenant);
    } catch (error) {
      console.error("Create tenant error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Patient management routes - require tenant context
  app.use("/api/patients", requireTenant);

  app.get("/api/patients", async (req, res) => {
    try {
      const { limit = "50", offset = "0", search } = req.query;
      const tenantId = req.tenant!.id;

      let patients;
      if (search && typeof search === "string") {
        patients = await storage.searchPatients(tenantId, search);
      } else {
        patients = await storage.getPatientsByTenant(tenantId, parseInt(limit as string), parseInt(offset as string));
      }

      res.json(patients);
    } catch (error) {
      console.error("Get patients error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/patients/:id", async (req, res) => {
    try {
      const patient = await storage.getPatient(req.params.id, req.tenant!.id);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      res.json(patient);
    } catch (error) {
      console.error("Get patient error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/patients", requireRole(["physician", "nurse", "receptionist", "tenant_admin"]), async (req, res) => {
    try {
      const patientData = insertPatientSchema.parse({
        ...req.body,
        tenantId: req.tenant!.id
      });

      const patient = await storage.createPatient(patientData);

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.tenant!.id,
        userId: req.user!.userId,
        entityType: "patient",
        entityId: patient.id,
        action: "create",
        newData: patient,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });

      res.status(201).json(patient);
    } catch (error) {
      console.error("Create patient error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Appointment management routes
  app.use("/api/appointments", requireTenant);

  app.get("/api/appointments", async (req, res) => {
    try {
      const { date, providerId } = req.query;
      const tenantId = req.tenant!.id;

      let appointments;
      const queryDate = date ? new Date(date as string) : undefined;

      if (providerId) {
        appointments = await storage.getAppointmentsByProvider(providerId as string, tenantId, queryDate);
      } else {
        appointments = await storage.getAppointmentsByTenant(tenantId, queryDate);
      }

      res.json(appointments);
    } catch (error) {
      console.error("Get appointments error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/appointments", requireRole(["physician", "nurse", "receptionist", "tenant_admin"]), async (req, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse({
        ...req.body,
        tenantId: req.tenant!.id
      });

      const appointment = await storage.createAppointment(appointmentData);

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.tenant!.id,
        userId: req.user!.userId,
        entityType: "appointment",
        entityId: appointment.id,
        action: "create",
        newData: appointment,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });

      res.status(201).json(appointment);
    } catch (error) {
      console.error("Create appointment error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Prescription management routes
  app.use("/api/prescriptions", requireTenant);

  app.get("/api/prescriptions", async (req, res) => {
    try {
      const { patientId } = req.query;
      const tenantId = req.tenant!.id;

      let prescriptions;
      if (patientId) {
        prescriptions = await storage.getPrescriptionsByPatient(patientId as string, tenantId);
      } else {
        prescriptions = await storage.getPrescriptionsByTenant(tenantId);
      }

      res.json(prescriptions);
    } catch (error) {
      console.error("Get prescriptions error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/prescriptions", requireRole(["physician", "nurse"]), async (req, res) => {
    try {
      const prescriptionData = insertPrescriptionSchema.parse({
        ...req.body,
        tenantId: req.tenant!.id,
        providerId: req.user!.userId
      });

      const prescription = await storage.createPrescription(prescriptionData);

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.tenant!.id,
        userId: req.user!.userId,
        entityType: "prescription",
        entityId: prescription.id,
        action: "create",
        newData: prescription,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });

      res.status(201).json(prescription);
    } catch (error) {
      console.error("Create prescription error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Lab order management routes
  app.use("/api/lab-orders", requireTenant);

  app.get("/api/lab-orders", async (req, res) => {
    try {
      const { patientId, pending } = req.query;
      const tenantId = req.tenant!.id;

      let labOrders;
      if (patientId) {
        labOrders = await storage.getLabOrdersByPatient(patientId as string, tenantId);
      } else if (pending === "true") {
        labOrders = await storage.getPendingLabOrders(tenantId);
      } else {
        labOrders = await storage.getLabOrdersByTenant(tenantId);
      }

      res.json(labOrders);
    } catch (error) {
      console.error("Get lab orders error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/lab-orders", requireRole(["physician", "nurse"]), async (req, res) => {
    try {
      const labOrderData = insertLabOrderSchema.parse({
        ...req.body,
        tenantId: req.tenant!.id,
        providerId: req.user!.userId
      });

      const labOrder = await storage.createLabOrder(labOrderData);

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.tenant!.id,
        userId: req.user!.userId,
        entityType: "lab_order",
        entityId: labOrder.id,
        action: "create",
        newData: labOrder,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });

      res.status(201).json(labOrder);
    } catch (error) {
      console.error("Create lab order error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Insurance claims management routes
  app.use("/api/insurance-claims", requireTenant);

  app.get("/api/insurance-claims", async (req, res) => {
    try {
      const { patientId } = req.query;
      const tenantId = req.tenant!.id;

      let claims;
      if (patientId) {
        claims = await storage.getInsuranceClaimsByPatient(patientId as string, tenantId);
      } else {
        claims = await storage.getInsuranceClaimsByTenant(tenantId);
      }

      res.json(claims);
    } catch (error) {
      console.error("Get insurance claims error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/insurance-claims", requireRole(["billing_staff", "physician", "tenant_admin"]), async (req, res) => {
    try {
      const claimData = insertInsuranceClaimSchema.parse({
        ...req.body,
        tenantId: req.tenant!.id
      });

      const claim = await storage.createInsuranceClaim(claimData);

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.tenant!.id,
        userId: req.user!.userId,
        entityType: "insurance_claim",
        entityId: claim.id,
        action: "create",
        newData: claim,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });

      res.status(201).json(claim);
    } catch (error) {
      console.error("Create insurance claim error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Dashboard metrics
  app.get("/api/dashboard/metrics", requireTenant, async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics(req.tenant!.id);
      res.json(metrics);
    } catch (error) {
      console.error("Get dashboard metrics error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Audit logs
  app.get("/api/audit-logs", requireRole(["tenant_admin", "super_admin"]), requireTenant, async (req, res) => {
    try {
      const { limit = "50", offset = "0" } = req.query;
      const auditLogs = await storage.getAuditLogs(
        req.tenant!.id, 
        parseInt(limit as string), 
        parseInt(offset as string)
      );
      res.json(auditLogs);
    } catch (error) {
      console.error("Get audit logs error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Platform metrics route for super admin
  app.get("/api/platform/metrics", authenticateToken, async (req, res) => {
    try {
      if (req.user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const metrics = await storage.getPlatformMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Platform metrics error:", error);
      res.status(500).json({ message: "Failed to fetch platform metrics" });
    }
  });

  // Reports routes
  app.get("/api/reports", authenticateToken, requireTenant, async (req, res) => {
    try {
      const reports = await storage.getReportsByTenant(req.tenant.id);
      res.json(reports);
    } catch (error) {
      console.error("Reports fetch error:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.post("/api/reports", authenticateToken, requireTenant, async (req, res) => {
    try {
      const reportData = insertReportSchema.parse({
        ...req.body,
        tenantId: req.tenant.id,
        generatedBy: req.user.userId,
        status: 'generating'
      });

      const report = await storage.createReport(reportData);

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.tenant.id,
        userId: req.user.userId,
        entityType: "report",
        entityId: report.id,
        action: "create",
        newData: { title: report.title, type: report.type },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });

      // In a real implementation, you would trigger async report generation here
      // For now, we'll simulate completion
      setTimeout(async () => {
        try {
          await storage.updateReport(report.id, {
            status: 'completed',
            completedAt: new Date(),
            downloadUrl: `/api/reports/${report.id}/download`
          }, req.tenant.id);
        } catch (error) {
          console.error("Report completion error:", error);
        }
      }, 3000);

      res.status(201).json(report);
    } catch (error) {
      console.error("Report creation error:", error);
      res.status(500).json({ message: "Failed to create report" });
    }
  });

  // Platform-wide report generation for super admin
  app.post("/api/platform/reports/generate", authenticateToken, async (req, res) => {
    try {
      console.log("Cross-tenant report - User:", req.user);
      
      if (req.user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied. Super admin role required." });
      }

      const { targetTenantId, ...reportParams } = req.body;
      
      if (!targetTenantId) {
        return res.status(400).json({ message: "Target tenant ID is required for cross-tenant reports" });
      }

      // Verify target tenant exists
      const targetTenant = await storage.getTenant(targetTenantId);
      if (!targetTenant) {
        return res.status(404).json({ message: "Target tenant not found" });
      }

      const reportData = insertReportSchema.parse({
        ...reportParams,
        tenantId: targetTenantId,
        generatedBy: req.user.userId,
        status: 'generating',
        parameters: { 
          ...reportParams.parameters, 
          crossTenantGeneration: true, 
          generatedByRole: 'super_admin' 
        }
      });

      const report = await storage.createReport(reportData);

      // Create audit log for both platform and target tenant
      await storage.createAuditLog({
        tenantId: req.user.tenantId, // Platform tenant
        userId: req.user.userId,
        entityType: "cross_tenant_report",
        entityId: report.id,
        action: "create",
        newData: { 
          title: report.title, 
          type: report.type, 
          targetTenant: targetTenant.name,
          targetTenantId: targetTenantId 
        },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });

      await storage.createAuditLog({
        tenantId: targetTenantId, // Target tenant
        userId: req.user.userId,
        entityType: "report",
        entityId: report.id,
        action: "platform_generate",
        newData: { 
          title: report.title, 
          type: report.type, 
          generatedBy: 'platform_admin' 
        },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });

      // Simulate async report generation
      setTimeout(async () => {
        try {
          await storage.updateReport(report.id, {
            status: 'completed',
            completedAt: new Date(),
            downloadUrl: `/api/platform/reports/${report.id}/download`
          }, targetTenantId);
        } catch (error) {
          console.error("Cross-tenant report completion error:", error);
        }
      }, 4000);

      res.status(201).json(report);
    } catch (error) {
      console.error("Cross-tenant report creation error:", error);
      res.status(500).json({ message: "Failed to create cross-tenant report" });
    }
  });

  // Get all reports across platform for super admin
  app.get("/api/platform/reports", authenticateToken, async (req, res) => {
    try {
      if (req.user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied. Super admin role required." });
      }

      const reports = await storage.getAllReports();
      res.json(reports);
    } catch (error) {
      console.error("Platform reports fetch error:", error);
      res.status(500).json({ message: "Failed to fetch platform reports" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
