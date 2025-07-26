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
        // Regular tenant user login - support both tenant UUID and tenant name
        let actualTenantId = tenantId;
        
        // Check if tenantId is a UUID pattern or tenant name
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        
        if (!uuidPattern.test(tenantId)) {
          // If not a UUID, try to find tenant by name
          const tenants = await storage.getAllTenants();
          const tenant = tenants.find(t => t.name.toLowerCase() === tenantId.toLowerCase());
          if (tenant) {
            actualTenantId = tenant.id;
          } else {
            return res.status(400).json({ message: "Organization not found" });
          }
        }
        
        user = await storage.getUserByUsername(username, actualTenantId);
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

  // Get users by role (for fetching providers, etc.)
  app.get("/api/users", requireTenant, async (req, res) => {
    try {
      const { role } = req.query;
      const tenantId = req.tenant!.id;
      
      if (role) {
        const users = await storage.getUsersByRole(role as string, tenantId);
        res.json(users);
      } else {
        const users = await storage.getUsersByTenant(tenantId);
        res.json(users);
      }
    } catch (error) {
      console.error("Get users error:", error);
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

  app.post("/api/patients", requireRole(["physician", "nurse", "receptionist", "tenant_admin", "director"]), async (req, res) => {
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

  app.post("/api/appointments", authenticateToken, requireTenant, async (req, res) => {
    try {
      console.log("[DEBUG] Creating appointment - User:", req.user?.role, "User ID:", req.user?.userId, "Tenant:", req.tenant?.id);
      console.log("[DEBUG] Request body:", req.body);
      
      // Check if user has permission to create appointments
      const allowedRoles = ["physician", "nurse", "receptionist", "tenant_admin", "director", "super_admin", "billing_staff", "pharmacist"];
      if (!allowedRoles.includes(req.user!.role)) {
        console.log("[DEBUG] Permission denied for role:", req.user!.role);
        return res.status(403).json({ 
          message: "Insufficient permissions to create appointments",
          required: allowedRoles,
          current: req.user!.role
        });
      }
      
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

  app.post("/api/insurance-claims", requireRole(["billing_staff", "physician", "tenant_admin", "director"]), async (req, res) => {
    try {
      const requestData = { ...req.body };
      
      // Generate unique claim number if not provided
      if (!requestData.claimNumber) {
        requestData.claimNumber = `CLM-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      }

      const claimData = insertInsuranceClaimSchema.parse({
        ...requestData,
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
      if (error.code === '23505' && error.constraint === 'insurance_claims_claim_number_unique') {
        return res.status(400).json({ message: "Claim number already exists. Please use a different claim number." });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/insurance-claims/:id", requireRole(["billing_staff", "physician", "tenant_admin", "director"]), async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      // Handle date fields properly
      if (updateData.submittedDate) {
        updateData.submittedDate = new Date(updateData.submittedDate);
      }
      if (updateData.processedDate) {
        updateData.processedDate = new Date(updateData.processedDate);
      }

      const updatedClaim = await storage.updateInsuranceClaim(id, updateData, req.tenant!.id);

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.tenant!.id,
        userId: req.user!.userId,
        entityType: "insurance_claim",
        entityId: id,
        action: "update",
        newData: updateData,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });

      res.json(updatedClaim);
    } catch (error) {
      console.error("Update insurance claim error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Insurance Provider routes
  app.get("/api/insurance-providers", requireTenant, async (req, res) => {
    try {
      const providers = await storage.getInsuranceProviders(req.tenant!.id);
      res.json(providers);
    } catch (error) {
      console.error("Get insurance providers error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Patient Insurance routes
  app.get("/api/patient-insurance/:patientId", requireTenant, async (req, res) => {
    try {
      const { patientId } = req.params;
      const insuranceList = await storage.getPatientInsurance(patientId, req.tenant!.id);
      res.json(insuranceList);
    } catch (error) {
      console.error("Get patient insurance error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Dashboard metrics
  app.get("/api/dashboard/metrics", requireTenant, async (req, res) => {
    try {
      const tenantId = req.tenant?.id || req.user?.tenantId;
      if (!tenantId) {
        return res.status(400).json({ message: "Tenant context required" });
      }
      
      const metrics = await storage.getDashboardMetrics(tenantId);
      res.json(metrics);
    } catch (error) {
      console.error("Get dashboard metrics error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Audit logs
  app.get("/api/audit-logs", requireRole(["tenant_admin", "director", "super_admin"]), requireTenant, async (req, res) => {
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
            fileUrl: `/api/reports/${report.id}/download`
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
            fileUrl: `/api/platform/reports/${report.id}/download`
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

  // Get users for a specific tenant (for super admin and tenant admin user management)
  app.get("/api/users/:tenantId", authenticateToken, requireTenant, async (req, res) => {
    try {
      const { tenantId } = req.params;
      
      // Super admin can view users from any tenant
      if (req.user?.role === 'super_admin') {
        const users = await storage.getUsersByTenant(tenantId);
        res.json(users);
      } else if ((req.user?.role === 'tenant_admin' || req.user?.role === 'director') && req.user.tenantId === tenantId) {
        // Tenant admin and director can view users from their own tenant
        const users = await storage.getUsersByTenant(tenantId);
        res.json(users);
      } else if (req.user?.tenantId === tenantId) {
        // Regular users can only view users from their own tenant (limited info)
        const users = await storage.getUsersByTenant(tenantId);
        res.json(users);
      } else {
        return res.status(403).json({ message: "Access denied. Cannot view users from this organization." });
      }
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Update user (for user management)
  app.patch("/api/users/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Get the user to check permissions
      const existingUser = await storage.getUser(id);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if user has permission to update this user
      const hasPermission = req.user.role === 'super_admin' || 
                           ((req.user.role === 'tenant_admin' || req.user.role === 'director') && existingUser.tenantId === req.user.tenantId) ||
                           (req.user.userId === id); // User updating themselves

      if (!hasPermission) {
        return res.status(403).json({ message: "Access denied. Cannot update this user." });
      }

      // Prevent deactivation of super admin users
      if (existingUser.role === 'super_admin' && updateData.isActive === false) {
        return res.status(403).json({ message: "Cannot deactivate super admin users. This role is permanent for platform security." });
      }

      // Prevent users from deactivating themselves
      if (req.user.userId === id && updateData.isActive === false) {
        return res.status(403).json({ message: "You cannot deactivate your own account." });
      }

      // Update the user
      const updatedUser = await storage.updateUser(id, updateData);
      
      // Create audit log
      await storage.createAuditLog({
        tenantId: existingUser.tenantId,
        userId: req.user.userId || null,
        entityType: "user",
        entityId: id,
        action: "update",
        oldData: { isActive: existingUser.isActive, role: existingUser.role },
        newData: updateData,
        ipAddress: req.ip || null,
        userAgent: req.get("User-Agent") || null
      });

      res.json({
        message: "User updated successfully",
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          role: updatedUser.role,
          isActive: updatedUser.isActive,
          tenantId: updatedUser.tenantId
        }
      });
    } catch (error) {
      console.error("User update error:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Create new user (for tenant admin user management)
  app.post("/api/users", authenticateToken, requireTenant, async (req, res) => {
    try {
      const { username, email, password, firstName, lastName, role } = req.body;
      
      // Validate required fields
      if (!username || !email || !password || !firstName || !lastName || !role) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Check permissions - only super admin, tenant admin, and director can create users
      if (req.user?.role !== 'super_admin' && req.user?.role !== 'tenant_admin' && req.user?.role !== 'director') {
        return res.status(403).json({ message: "Access denied. Admin privileges required to create users." });
      }

      // Tenant admin can only create users in their own organization
      const targetTenantId = req.user.role === 'super_admin' ? (req.body.tenantId || req.user.tenantId) : req.user.tenantId;

      // Validate that tenant admin and director cannot create super admin or other admin users
      if (req.user?.role === 'tenant_admin' || req.user?.role === 'director') {
        if (role === 'super_admin' || role === 'tenant_admin' || role === 'director') {
          return res.status(403).json({ message: "Tenant admins and directors cannot create admin-level users. Only clinical and operational staff roles are allowed." });
        }
      }

      // Check if username or email already exists in this tenant
      const existingUserByUsername = await storage.getUserByUsername(username, targetTenantId);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already exists in this organization" });
      }

      const existingUserByEmail = await storage.getUserByEmail(email, targetTenantId);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already exists in this organization" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const newUser = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role as any, // Cast to UserRole type
        tenantId: targetTenantId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Create audit log
      await storage.createAuditLog({
        tenantId: targetTenantId,
        userId: req.user?.userId || null,
        entityType: "user",
        entityId: newUser.id,
        action: "create",
        newData: { 
          username, 
          email, 
          firstName, 
          lastName, 
          role,
          tenantId: targetTenantId
        },
        ipAddress: req.ip || null,
        userAgent: req.get("User-Agent") || null
      });

      res.status(201).json({
        message: "User created successfully",
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
          isActive: newUser.isActive,
          tenantId: newUser.tenantId
        }
      });
    } catch (error) {
      console.error("User creation error:", error);
      res.status(500).json({ message: "Failed to create user" });
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

  // Download report endpoint
  app.get("/api/reports/:id/download", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const report = await storage.getReport(id, req.tenant?.id || '');
      
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      if (report.status !== 'completed') {
        return res.status(400).json({ message: "Report is not ready for download" });
      }

      // Generate mock report content based on type and format
      const reportContent = generateReportContent(report);
      const filename = `${report.title.replace(/[^a-zA-Z0-9]/g, '_')}.${report.format}`;

      // Set appropriate headers based on format
      switch (report.format) {
        case 'pdf':
          res.setHeader('Content-Type', 'application/pdf');
          break;
        case 'excel':
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          break;
        case 'csv':
          res.setHeader('Content-Type', 'text/csv');
          break;
        default:
          res.setHeader('Content-Type', 'application/octet-stream');
      }

      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(reportContent);

    } catch (error) {
      console.error("Report download error:", error);
      res.status(500).json({ message: "Failed to download report" });
    }
  });

  // Platform download endpoint for cross-tenant reports
  app.get("/api/platform/reports/:id/download", authenticateToken, async (req, res) => {
    try {
      if (req.user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied. Super admin role required." });
      }

      const { id } = req.params;
      const reports = await storage.getAllReports();
      const report = reports.find(r => r.id === id);
      
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      if (report.status !== 'completed') {
        return res.status(400).json({ message: "Report is not ready for download" });
      }

      // Generate mock report content
      const reportContent = generateReportContent(report);
      const filename = `${report.title.replace(/[^a-zA-Z0-9]/g, '_')}.${report.format}`;

      // Set headers
      switch (report.format) {
        case 'pdf':
          res.setHeader('Content-Type', 'application/pdf');
          break;
        case 'excel':
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          break;
        case 'csv':
          res.setHeader('Content-Type', 'text/csv');
          break;
        default:
          res.setHeader('Content-Type', 'application/octet-stream');
      }

      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(reportContent);

    } catch (error) {
      console.error("Platform report download error:", error);
      res.status(500).json({ message: "Failed to download report" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to generate mock report content
function generateReportContent(report: any): string {
  const timestamp = new Date().toISOString();
  
  if (report.format === 'csv') {
    return generateCSVContent(report, timestamp);
  } else if (report.format === 'excel') {
    return generateExcelContent(report, timestamp);
  } else {
    return generatePDFContent(report, timestamp);
  }
}

function generateCSVContent(report: any, timestamp: string): string {
  const headers = ['Date', 'Type', 'Category', 'Value', 'Status'];
  const rows = [
    [timestamp.split('T')[0], report.type, 'Patients', '150', 'Active'],
    [timestamp.split('T')[0], report.type, 'Appointments', '45', 'Scheduled'],
    [timestamp.split('T')[0], report.type, 'Revenue', '$12,500', 'Collected'],
    [timestamp.split('T')[0], report.type, 'Lab Tests', '28', 'Completed'],
    [timestamp.split('T')[0], report.type, 'Prescriptions', '67', 'Dispensed']
  ];
  
  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

function generateExcelContent(report: any, timestamp: string): string {
  // For Excel format, return a simple CSV-like content
  // In a real implementation, you would use a library like xlsx
  return generateCSVContent(report, timestamp);
}

function generatePDFContent(report: any, timestamp: string): string {
  // For PDF format, return plain text content
  // In a real implementation, you would use a library like pdfkit
  return `
HEALTHCARE REPORT
=================

Report Title: ${report.title}
Report Type: ${report.type}
Generated: ${timestamp}
Format: ${report.format.toUpperCase()}

SUMMARY
-------
This report contains healthcare analytics and operational data
for the selected time period and organization.

KEY METRICS
-----------
• Total Patients: 150
• Appointments Scheduled: 45
• Revenue Generated: $12,500
• Lab Tests Completed: 28
• Prescriptions Dispensed: 67

COMPLIANCE STATUS
-----------------
✓ HIPAA Compliance: Active
✓ Data Security: Verified
✓ Audit Trail: Complete

Generated by NAVIMED Healthcare Platform
Report ID: ${report.id}
`;
}
