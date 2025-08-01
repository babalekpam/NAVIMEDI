import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertTenantSchema, insertPatientSchema, insertAppointmentSchema, insertPrescriptionSchema, insertLabOrderSchema, insertInsuranceClaimSchema, insertServicePriceSchema, insertInsurancePlanCoverageSchema, insertClaimLineItemSchema, insertSubscriptionSchema, insertReportSchema, insertMedicalCommunicationSchema, insertCommunicationTranslationSchema, insertSupportedLanguageSchema, insertMedicalPhraseSchema, insertPhraseTranslationSchema, insertLaboratorySchema, insertLabResultSchema, insertLabOrderAssignmentSchema, insertLaboratoryApplicationSchema, insertVitalSignsSchema, insertVisitSummarySchema, insertHealthRecommendationSchema, insertHealthAnalysisSchema } from "@shared/schema";
import { authenticateToken, requireRole } from "./middleware/auth";
import { setTenantContext, requireTenant } from "./middleware/tenant";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { aiHealthAnalyzer } from "./ai-health-analyzer";

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
          userId: user.id, // Add userId for compatibility
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
      const user = await storage.getUser(req.user!.id);
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
        userId: req.user!.id,
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
      // Generate MRN automatically
      const mrn = `MRN${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      
      // Prepare patient data with proper date conversion
      const requestData = {
        ...req.body,
        tenantId: req.tenant!.id,
        mrn: mrn,
        // Convert dateOfBirth string to Date if it's a string
        dateOfBirth: typeof req.body.dateOfBirth === 'string' 
          ? new Date(req.body.dateOfBirth) 
          : req.body.dateOfBirth
      };

      const patientData = insertPatientSchema.parse(requestData);

      const patient = await storage.createPatient(patientData);

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.tenant!.id,
        userId: req.user!.id,
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

  // GET appointments by provider ID (specific route for doctor dashboard)
  app.get("/api/appointments/provider/:providerId", authenticateToken, requireTenant, async (req, res) => {
    try {
      const { providerId } = req.params;
      console.log("[DEBUG] Getting appointments for provider:", providerId);
      
      const appointments = await storage.getAppointmentsByProvider(providerId, req.tenant!.id);
      res.json(appointments);
    } catch (error) {
      console.error("Get provider appointments error:", error);
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
      
      // Convert appointmentDate string to Date object
      const requestData = { ...req.body };
      if (requestData.appointmentDate && typeof requestData.appointmentDate === 'string') {
        requestData.appointmentDate = new Date(requestData.appointmentDate);
      }
      
      const appointmentData = insertAppointmentSchema.parse({
        ...requestData,
        tenantId: req.tenant!.id
      });

      const appointment = await storage.createAppointment(appointmentData);

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.tenant!.id,
        userId: req.user!.id,
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

  // Update appointment (PATCH)
  app.patch("/api/appointments/:id", authenticateToken, requireRole(["physician", "nurse", "receptionist", "tenant_admin", "director", "super_admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      // Handle date fields properly if they exist
      if (updateData.appointmentDate && typeof updateData.appointmentDate === 'string') {
        updateData.appointmentDate = new Date(updateData.appointmentDate);
      }

      const updatedAppointment = await storage.updateAppointment(id, updateData, req.tenant!.id);
      
      if (!updatedAppointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.tenant!.id,
        userId: req.user!.id,
        entityType: "appointment",
        entityId: id,
        action: "update",
        newData: updatedAppointment,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });

      res.json(updatedAppointment);
    } catch (error) {
      console.error("Update appointment error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Prescription management routes
  app.get("/api/prescriptions", authenticateToken, requireTenant, async (req, res) => {
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

  app.post("/api/prescriptions", requireRole(["physician", "nurse", "tenant_admin", "director", "super_admin"]), async (req, res) => {
    try {
      // Convert string dates to Date objects
      const requestData = { ...req.body };
      if (requestData.expiryDate && typeof requestData.expiryDate === 'string') {
        requestData.expiryDate = new Date(requestData.expiryDate);
      }
      
      // Prepare prescription data with all required fields including dates
      const prescriptionData = {
        ...requestData,
        tenantId: req.tenant!.id,
        providerId: req.user!.id,
        appointmentId: requestData.appointmentId || null,
        pharmacyTenantId: requestData.pharmacyTenantId || null,
        prescribedDate: new Date(),
        expiryDate: requestData.expiryDate ? new Date(requestData.expiryDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // Default 1 year
      };
      
      const validatedData = insertPrescriptionSchema.parse(prescriptionData);

      const prescription = await storage.createPrescription(validatedData);

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.tenant!.id,
        userId: req.user!.id,
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
  app.get("/api/lab-orders", authenticateToken, requireTenant, async (req, res) => {
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

  app.post("/api/lab-orders", requireRole(["physician", "nurse", "tenant_admin", "director", "super_admin"]), async (req, res) => {
    try {
      // Convert string dates to Date objects and prepare data
      const requestData = { ...req.body };
      if (requestData.orderedDate && typeof requestData.orderedDate === 'string') {
        requestData.orderedDate = new Date(requestData.orderedDate);
      }
      
      const labOrderData = {
        ...requestData,
        tenantId: req.tenant!.id,
        providerId: req.user!.id,
        orderedDate: requestData.orderedDate || new Date(),
        appointmentId: requestData.appointmentId || null,
        labTenantId: requestData.labTenantId || null
      };

      const validatedData = insertLabOrderSchema.parse(labOrderData);

      const labOrder = await storage.createLabOrder(validatedData);

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.tenant!.id,
        userId: req.user!.id,
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
        userId: req.user!.id,
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
        userId: req.user!.id,
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

  // Service Pricing routes
  app.get("/api/service-prices", requireTenant, async (req, res) => {
    try {
      const servicePrices = await storage.getServicePrices(req.tenant!.id);
      res.json(servicePrices);
    } catch (error) {
      console.error("Get service prices error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/service-prices", requireRole(["tenant_admin", "director", "billing_staff"]), async (req, res) => {
    try {
      const servicePriceData = insertServicePriceSchema.parse({
        ...req.body,
        tenantId: req.tenant!.id
      });

      const servicePrice = await storage.createServicePrice(servicePriceData);
      res.json(servicePrice);
    } catch (error) {
      console.error("Create service price error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/service-prices/:id", requireTenant, async (req, res) => {
    try {
      const { id } = req.params;
      const servicePrice = await storage.getServicePrice(id, req.tenant!.id);
      
      if (!servicePrice) {
        return res.status(404).json({ message: "Service price not found" });
      }

      res.json(servicePrice);
    } catch (error) {
      console.error("Get service price error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Insurance Plan Coverage routes
  app.get("/api/insurance-plan-coverage", requireTenant, async (req, res) => {
    try {
      const coverages = await storage.getInsurancePlanCoverages(req.tenant!.id);
      res.json(coverages);
    } catch (error) {
      console.error("Get insurance plan coverages error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/insurance-plan-coverage", requireRole(["tenant_admin", "director", "billing_staff"]), async (req, res) => {
    try {
      const coverageData = insertInsurancePlanCoverageSchema.parse({
        ...req.body,
        tenantId: req.tenant!.id
      });

      const coverage = await storage.createInsurancePlanCoverage(coverageData);
      res.json(coverage);
    } catch (error) {
      console.error("Create insurance plan coverage error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Pricing calculation endpoint
  app.post("/api/calculate-pricing", requireTenant, async (req, res) => {
    try {
      const { servicePriceId, insuranceProviderId, patientInsuranceId } = req.body;

      if (!servicePriceId || !insuranceProviderId || !patientInsuranceId) {
        return res.status(400).json({ 
          message: "servicePriceId, insuranceProviderId, and patientInsuranceId are required" 
        });
      }

      const pricing = await storage.calculateCopayAndInsuranceAmount(
        servicePriceId,
        insuranceProviderId, 
        patientInsuranceId,
        req.tenant!.id
      );

      res.json(pricing);
    } catch (error) {
      console.error("Calculate pricing error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Claim Line Items routes
  app.get("/api/claim-line-items/:claimId", requireTenant, async (req, res) => {
    try {
      const { claimId } = req.params;
      const lineItems = await storage.getClaimLineItems(claimId, req.tenant!.id);
      res.json(lineItems);
    } catch (error) {
      console.error("Get claim line items error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/claim-line-items", requireRole(["billing_staff", "physician", "tenant_admin", "director"]), async (req, res) => {
    try {
      const lineItemData = insertClaimLineItemSchema.parse({
        ...req.body,
        tenantId: req.tenant!.id
      });

      const lineItem = await storage.createClaimLineItem(lineItemData);
      res.json(lineItem);
    } catch (error) {
      console.error("Create claim line item error:", error);
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

  // ==================== MULTILINGUAL COMMUNICATION ROUTES ====================

  // Medical Communications routes
  app.get("/api/medical-communications", authenticateToken, requireTenant, async (req, res) => {
    try {
      const communications = await storage.getMedicalCommunicationsByTenant(req.user.tenantId);
      res.json(communications);
    } catch (error) {
      console.error("Failed to fetch communications:", error);
      res.status(500).json({ message: "Failed to fetch communications" });
    }
  });

  app.get("/api/medical-communications/:id", authenticateToken, requireTenant, async (req, res) => {
    try {
      const { id } = req.params;
      const communication = await storage.getMedicalCommunication(id, req.user.tenantId);
      
      if (!communication) {
        return res.status(404).json({ message: "Communication not found" });
      }
      
      res.json(communication);
    } catch (error) {
      console.error("Failed to fetch communication:", error);
      res.status(500).json({ message: "Failed to fetch communication" });
    }
  });

  app.post("/api/medical-communications", authenticateToken, requireTenant, requireRole(["physician", "nurse", "tenant_admin", "director", "super_admin"]), async (req, res) => {
    try {
      const validatedData = insertMedicalCommunicationSchema.parse({
        ...req.body,
        tenantId: req.user.tenantId,
        senderId: req.user.userId,
      });

      const communication = await storage.createMedicalCommunication(validatedData);

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.user.tenantId,
        userId: req.user.userId,
        entityType: "medical_communication",
        entityId: communication.id,
        action: "CREATE",
        newData: communication,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(201).json(communication);
    } catch (error) {
      console.error("Failed to create communication:", error);
      res.status(500).json({ message: "Failed to create communication" });
    }
  });

  app.patch("/api/medical-communications/:id", authenticateToken, requireTenant, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const communication = await storage.updateMedicalCommunication(id, updates, req.user.tenantId);
      
      if (!communication) {
        return res.status(404).json({ message: "Communication not found" });
      }

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.user.tenantId,
        userId: req.user.userId,
        entityType: "medical_communication",
        entityId: communication.id,
        action: "UPDATE",
        newData: communication,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json(communication);
    } catch (error) {
      console.error("Failed to update communication:", error);
      res.status(500).json({ message: "Failed to update communication" });
    }
  });

  // Communication Translations routes
  app.get("/api/communication-translations/:communicationId", authenticateToken, requireTenant, async (req, res) => {
    try {
      const { communicationId } = req.params;
      const translations = await storage.getCommunicationTranslations(communicationId);
      res.json(translations);
    } catch (error) {
      console.error("Failed to fetch translations:", error);
      res.status(500).json({ message: "Failed to fetch translations" });
    }
  });

  app.post("/api/communication-translations", authenticateToken, requireTenant, async (req, res) => {
    try {
      const validatedData = insertCommunicationTranslationSchema.parse(req.body);
      const translation = await storage.createCommunicationTranslation(validatedData);

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.user.tenantId,
        userId: req.user.userId,
        entityType: "communication_translation",
        entityId: translation.id,
        action: "CREATE",
        newData: translation,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(201).json(translation);
    } catch (error) {
      console.error("Failed to create translation:", error);
      res.status(500).json({ message: "Failed to create translation" });
    }
  });

  // Supported Languages routes
  app.get("/api/supported-languages", authenticateToken, requireTenant, async (req, res) => {
    try {
      const languages = await storage.getSupportedLanguages(req.user.tenantId);
      res.json(languages);
    } catch (error) {
      console.error("Failed to fetch languages:", error);
      res.status(500).json({ message: "Failed to fetch languages" });
    }
  });

  app.post("/api/supported-languages", authenticateToken, requireTenant, requireRole(["tenant_admin", "director", "super_admin"]), async (req, res) => {
    try {
      const validatedData = insertSupportedLanguageSchema.parse({
        ...req.body,
        tenantId: req.user.tenantId,
      });

      const language = await storage.createSupportedLanguage(validatedData);

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.user.tenantId,
        userId: req.user.userId,
        entityType: "supported_language",
        entityId: language.id,
        action: "CREATE",
        newData: language,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(201).json(language);
    } catch (error) {
      console.error("Failed to create language:", error);
      res.status(500).json({ message: "Failed to create language" });
    }
  });

  app.patch("/api/supported-languages/:id", authenticateToken, requireTenant, requireRole(["tenant_admin", "director", "super_admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const language = await storage.updateSupportedLanguage(id, updates, req.user.tenantId);
      
      if (!language) {
        return res.status(404).json({ message: "Language not found" });
      }

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.user.tenantId,
        userId: req.user.userId,
        entityType: "supported_language",
        entityId: language.id,
        action: "UPDATE",
        newData: language,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json(language);
    } catch (error) {
      console.error("Failed to update language:", error);
      res.status(500).json({ message: "Failed to update language" });
    }
  });

  // Medical Phrases routes
  app.get("/api/medical-phrases", authenticateToken, requireTenant, async (req, res) => {
    try {
      const { category } = req.query;
      const phrases = await storage.getMedicalPhrases(req.user.tenantId, category as string);
      res.json(phrases);
    } catch (error) {
      console.error("Failed to fetch phrases:", error);
      res.status(500).json({ message: "Failed to fetch phrases" });
    }
  });

  app.post("/api/medical-phrases", authenticateToken, requireTenant, requireRole(["physician", "nurse", "tenant_admin", "director", "super_admin"]), async (req, res) => {
    try {
      const validatedData = insertMedicalPhraseSchema.parse({
        ...req.body,
        tenantId: req.user.tenantId,
      });

      const phrase = await storage.createMedicalPhrase(validatedData);

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.user.tenantId,
        userId: req.user.userId,
        entityType: "medical_phrase",
        entityId: phrase.id,
        action: "CREATE",
        newData: phrase,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(201).json(phrase);
    } catch (error) {
      console.error("Failed to create phrase:", error);
      res.status(500).json({ message: "Failed to create phrase" });
    }
  });

  // Phrase Translations routes
  app.get("/api/phrase-translations/:phraseId", authenticateToken, requireTenant, async (req, res) => {
    try {
      const { phraseId } = req.params;
      const translations = await storage.getPhraseTranslations(phraseId);
      res.json(translations);
    } catch (error) {
      console.error("Failed to fetch phrase translations:", error);
      res.status(500).json({ message: "Failed to fetch phrase translations" });
    }
  });

  app.post("/api/phrase-translations", authenticateToken, requireTenant, requireRole(["physician", "nurse", "tenant_admin", "director", "super_admin"]), async (req, res) => {
    try {
      const validatedData = insertPhraseTranslationSchema.parse({
        ...req.body,
        translatedBy: req.user.userId,
      });

      const translation = await storage.createPhraseTranslation(validatedData);

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.user.tenantId,
        userId: req.user.userId,
        entityType: "phrase_translation",
        entityId: translation.id,
        action: "CREATE",
        newData: translation,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(201).json(translation);
    } catch (error) {
      console.error("Failed to create phrase translation:", error);
      res.status(500).json({ message: "Failed to create phrase translation" });
    }
  });

  // Laboratory Management Routes
  app.get("/api/laboratories", authenticateToken, requireTenant, async (req, res) => {
    try {
      const laboratories = await storage.getLaboratoriesByTenant(req.tenantId!);
      res.json(laboratories);
    } catch (error) {
      console.error("Error fetching laboratories:", error);
      res.status(500).json({ message: "Failed to fetch laboratories" });
    }
  });

  app.get("/api/laboratories/active", authenticateToken, requireTenant, async (req, res) => {
    try {
      const laboratories = await storage.getActiveLaboratoriesByTenant(req.tenantId!);
      res.json(laboratories);
    } catch (error) {
      console.error("Error fetching active laboratories:", error);
      res.status(500).json({ message: "Failed to fetch active laboratories" });
    }
  });

  app.post("/api/laboratories", authenticateToken, requireRole(["tenant_admin", "director", "super_admin"]), requireTenant, async (req, res) => {
    try {
      const laboratoryData = insertLaboratorySchema.parse({
        ...req.body,
        tenantId: req.tenantId
      });

      const laboratory = await storage.createLaboratory(laboratoryData);

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.tenantId!,
        userId: req.userId!,
        entityType: "laboratory",
        entityId: laboratory.id,
        action: "create",
        newData: laboratory,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });

      res.status(201).json(laboratory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid laboratory data", errors: error.errors });
      }
      console.error("Error creating laboratory:", error);
      res.status(500).json({ message: "Failed to create laboratory" });
    }
  });

  // Lab Results Routes
  app.get("/api/lab-results", authenticateToken, requireTenant, async (req, res) => {
    try {
      const labResults = await storage.getLabResultsByTenant(req.tenantId!);
      res.json(labResults);
    } catch (error) {
      console.error("Error fetching lab results:", error);
      res.status(500).json({ message: "Failed to fetch lab results" });
    }
  });

  app.get("/api/lab-results/patient/:patientId", authenticateToken, requireTenant, async (req, res) => {
    try {
      const labResults = await storage.getLabResultsByPatient(req.params.patientId, req.tenantId!);
      res.json(labResults);
    } catch (error) {
      console.error("Error fetching patient lab results:", error);
      res.status(500).json({ message: "Failed to fetch patient lab results" });
    }
  });

  app.get("/api/lab-results/order/:labOrderId", authenticateToken, requireTenant, async (req, res) => {
    try {
      const labResults = await storage.getLabResultsByOrder(req.params.labOrderId, req.tenantId!);
      res.json(labResults);
    } catch (error) {
      console.error("Error fetching lab order results:", error);
      res.status(500).json({ message: "Failed to fetch lab order results" });
    }
  });

  app.post("/api/lab-results", authenticateToken, requireRole(["lab_technician", "physician", "tenant_admin", "director", "super_admin"]), requireTenant, async (req, res) => {
    try {
      const labResultData = insertLabResultSchema.parse({
        ...req.body,
        tenantId: req.tenantId
      });

      const labResult = await storage.createLabResult(labResultData);

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.tenantId!,
        userId: req.userId!,
        entityType: "lab_result",
        entityId: labResult.id,
        action: "create",
        newData: labResult,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });

      res.status(201).json(labResult);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid lab result data", errors: error.errors });
      }
      console.error("Error creating lab result:", error);
      res.status(500).json({ message: "Failed to create lab result" });
    }
  });

  // Lab Order Assignment Routes
  app.post("/api/lab-order-assignments", authenticateToken, requireRole(["physician", "nurse", "lab_technician", "tenant_admin", "director", "super_admin"]), requireTenant, async (req, res) => {
    try {
      const assignmentData = insertLabOrderAssignmentSchema.parse({
        ...req.body,
        tenantId: req.tenantId,
        assignedBy: req.userId
      });

      const assignment = await storage.createLabOrderAssignment(assignmentData);

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.tenantId!,
        userId: req.userId!,
        entityType: "lab_order_assignment",
        entityId: assignment.id,
        action: "create",
        newData: assignment,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent")
      });

      res.status(201).json(assignment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid assignment data", errors: error.errors });
      }
      console.error("Error creating lab order assignment:", error);
      res.status(500).json({ message: "Failed to create lab order assignment" });
    }
  });

  // External Lab Integration Endpoint for receiving results
  app.post("/api/external-lab/results", async (req, res) => {
    try {
      const { 
        externalLabId, 
        labOrderId, 
        results, 
        laboratoryApiKey 
      } = req.body;

      // Find laboratory by API key across all tenants
      const allTenants = await storage.getAllTenants();
      let laboratory;
      
      for (const tenant of allTenants) {
        const labs = await storage.getLaboratoriesByTenant(tenant.id);
        laboratory = labs.find(lab => lab.apiKey === laboratoryApiKey);
        if (laboratory) break;
      }

      if (!laboratory) {
        return res.status(401).json({ message: "Invalid laboratory API key" });
      }

      // Process each result
      for (const result of results) {
        const labResultData = insertLabResultSchema.parse({
          labOrderId: labOrderId,
          laboratoryId: laboratory.id,
          tenantId: laboratory.tenantId,
          patientId: result.patientId,
          testName: result.testName,
          result: result.result,
          normalRange: result.normalRange,
          unit: result.unit,
          status: 'completed',
          abnormalFlag: result.abnormalFlag,
          notes: result.notes,
          performedBy: result.performedBy,
          completedAt: new Date(result.completedAt),
          reportedAt: new Date(),
          externalLabId: externalLabId,
          rawData: result.rawData
        });

        await storage.createLabResult(labResultData);
      }

      // Update the lab order assignment status
      const assignment = await storage.getLabOrderAssignmentByOrder(labOrderId, laboratory.tenantId);
      if (assignment) {
        await storage.updateLabOrderAssignment(assignment.id, {
          status: 'completed',
          actualCompletionTime: new Date()
        }, laboratory.tenantId);
      }

      res.json({ message: "Results received successfully", processed: results.length });
    } catch (error) {
      console.error("Error processing external lab results:", error);
      res.status(500).json({ message: "Failed to process lab results" });
    }
  });

  // Laboratory application routes (external lab registration) - Public endpoint
  app.post("/api/laboratory-applications", async (req, res) => {
    try {
      const applicationData = insertLaboratoryApplicationSchema.parse(req.body);
      
      const application = await storage.createLaboratoryApplication(applicationData);
      
      res.status(201).json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid application data", errors: error.errors });
      }
      console.error("Error creating laboratory application:", error);
      res.status(500).json({ message: "Failed to create laboratory application" });
    }
  });

  app.get("/api/laboratory-applications", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const status = req.query.status as string;
      const applications = status 
        ? await storage.getLaboratoryApplicationsByStatus(status)
        : await storage.getAllLaboratoryApplications();
      res.json(applications);
    } catch (error) {
      console.error("Error fetching laboratory applications:", error);
      res.status(500).json({ message: "Failed to fetch laboratory applications" });
    }
  });

  app.post("/api/laboratory-applications/:id/approve", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { reviewNotes } = req.body;
      const result = await storage.approveLaboratoryApplication(req.params.id, req.userId!, reviewNotes);
      
      if (!result) {
        return res.status(404).json({ message: "Laboratory application not found" });
      }

      res.json(result);
    } catch (error) {
      console.error("Error approving laboratory application:", error);
      res.status(500).json({ message: "Failed to approve laboratory application" });
    }
  });

  app.post("/api/laboratory-applications/:id/reject", authenticateToken, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { reviewNotes } = req.body;
      
      if (!reviewNotes) {
        return res.status(400).json({ message: "Review notes are required for rejection" });
      }

      const application = await storage.rejectLaboratoryApplication(req.params.id, req.userId!, reviewNotes);
      
      if (!application) {
        return res.status(404).json({ message: "Laboratory application not found" });
      }

      res.json(application);
    } catch (error) {
      console.error("Error rejecting laboratory application:", error);
      res.status(500).json({ message: "Failed to reject laboratory application" });
    }
  });

  // Vital Signs routes
  app.get("/api/vital-signs", authenticateToken, requireTenant, async (req, res) => {
    try {
      const vitalSigns = await storage.getVitalSignsByTenant(req.tenantId!);
      res.json(vitalSigns);
    } catch (error) {
      console.error("Error fetching vital signs:", error);
      res.status(500).json({ message: "Failed to fetch vital signs" });
    }
  });

  app.get("/api/vital-signs/patient/:patientId", authenticateToken, requireTenant, async (req, res) => {
    try {
      const vitalSigns = await storage.getVitalSignsByPatient(req.params.patientId, req.tenantId!);
      res.json(vitalSigns);
    } catch (error) {
      console.error("Error fetching patient vital signs:", error);
      res.status(500).json({ message: "Failed to fetch patient vital signs" });
    }
  });

  app.get("/api/vital-signs/appointment/:appointmentId", authenticateToken, requireTenant, async (req, res) => {
    try {
      const vitalSigns = await storage.getVitalSignsByAppointment(req.params.appointmentId, req.tenantId!);
      res.json(vitalSigns);
    } catch (error) {
      console.error("Error fetching appointment vital signs:", error);
      res.status(500).json({ message: "Failed to fetch appointment vital signs" });
    }
  });

  app.post("/api/vital-signs", authenticateToken, requireTenant, requireRole(["super_admin", "tenant_admin", "doctor", "nurse", "receptionist"]), async (req, res) => {
    try {
      const validatedData = insertVitalSignsSchema.parse({
        ...req.body,
        tenantId: req.tenantId,
        recordedById: req.user?.id
      });

      const vitalSigns = await storage.createVitalSigns(validatedData);

      // Create audit log
      await storage.createAuditLog({
        userId: req.user?.id!,
        tenantId: req.tenantId!,
        action: "vital_signs_created",
        entityType: "vital_signs",
        entityId: vitalSigns.id,
        details: { patientId: vitalSigns.patientId, appointmentId: vitalSigns.appointmentId }
      });

      res.status(201).json(vitalSigns);
    } catch (error) {
      console.error("Error creating vital signs:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create vital signs" });
    }
  });

  app.patch("/api/vital-signs/:id", authenticateToken, requireTenant, requireRole(["super_admin", "tenant_admin", "doctor", "nurse", "receptionist"]), async (req, res) => {
    try {
      const vitalSigns = await storage.updateVitalSigns(req.params.id, req.body, req.tenantId!);
      
      if (!vitalSigns) {
        return res.status(404).json({ message: "Vital signs not found" });
      }

      // Create audit log
      await storage.createAuditLog({
        userId: req.userId!,
        tenantId: req.tenantId!,
        action: "vital_signs_updated",
        resourceType: "vital_signs",
        resourceId: vitalSigns.id,
        details: { changes: req.body }
      });

      res.json(vitalSigns);
    } catch (error) {
      console.error("Error updating vital signs:", error);
      res.status(500).json({ message: "Failed to update vital signs" });
    }
  });

  // Visit Summary routes
  app.get("/api/visit-summaries", authenticateToken, requireTenant, async (req, res) => {
    try {
      const visitSummaries = await storage.getVisitSummariesByTenant(req.tenantId!);
      res.json(visitSummaries);
    } catch (error) {
      console.error("Error fetching visit summaries:", error);
      res.status(500).json({ message: "Failed to fetch visit summaries" });
    }
  });

  app.get("/api/visit-summaries/patient/:patientId", authenticateToken, requireTenant, async (req, res) => {
    try {
      const visitSummaries = await storage.getVisitSummariesByPatient(req.params.patientId, req.tenantId!);
      res.json(visitSummaries);
    } catch (error) {
      console.error("Error fetching patient visit summaries:", error);
      res.status(500).json({ message: "Failed to fetch patient visit summaries" });
    }
  });

  app.get("/api/visit-summaries/provider/:providerId", authenticateToken, requireTenant, async (req, res) => {
    try {
      const visitSummaries = await storage.getVisitSummariesByProvider(req.params.providerId, req.tenantId!);
      res.json(visitSummaries);
    } catch (error) {
      console.error("Error fetching provider visit summaries:", error);
      res.status(500).json({ message: "Failed to fetch provider visit summaries" });
    }
  });

  app.get("/api/visit-summaries/appointment/:appointmentId", authenticateToken, requireTenant, async (req, res) => {
    try {
      const visitSummary = await storage.getVisitSummaryByAppointment(req.params.appointmentId, req.tenantId!);
      res.json(visitSummary);
    } catch (error) {
      console.error("Error fetching appointment visit summary:", error);
      res.status(500).json({ message: "Failed to fetch appointment visit summary" });
    }
  });

  app.post("/api/visit-summaries", authenticateToken, requireTenant, requireRole(["super_admin", "tenant_admin", "doctor", "nurse"]), async (req, res) => {
    try {
      const validatedData = insertVisitSummarySchema.parse({
        ...req.body,
        tenantId: req.tenantId,
        providerId: req.userId
      });

      const visitSummary = await storage.createVisitSummary(validatedData);

      // Create audit log
      await storage.createAuditLog({
        userId: req.userId!,
        tenantId: req.tenantId!,
        action: "visit_summary_created",
        resourceType: "visit_summary",
        resourceId: visitSummary.id,
        details: { patientId: visitSummary.patientId, appointmentId: visitSummary.appointmentId }
      });

      res.status(201).json(visitSummary);
    } catch (error) {
      console.error("Error creating visit summary:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create visit summary" });
    }
  });

  app.patch("/api/visit-summaries/:id", authenticateToken, requireTenant, requireRole(["super_admin", "tenant_admin", "doctor", "nurse"]), async (req, res) => {
    try {
      const visitSummary = await storage.updateVisitSummary(req.params.id, req.body, req.tenantId!);
      
      if (!visitSummary) {
        return res.status(404).json({ message: "Visit summary not found" });
      }

      // Create audit log
      await storage.createAuditLog({
        userId: req.userId!,
        tenantId: req.tenantId!,
        action: "visit_summary_updated",
        resourceType: "visit_summary",
        resourceId: visitSummary.id,
        details: { changes: req.body }
      });

      res.json(visitSummary);
    } catch (error) {
      console.error("Error updating visit summary:", error);
      res.status(500).json({ message: "Failed to update visit summary" });
    }
  });

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

  // AI Health Recommendations routes
  app.get("/api/health-recommendations/patient/:patientId", authenticateToken, requireTenant, async (req, res) => {
    try {
      const { patientId } = req.params;
      const { tenantId } = req.user;
      
      const recommendations = await storage.getHealthRecommendationsByPatient(patientId, tenantId);
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching health recommendations:", error);
      res.status(500).json({ message: "Failed to fetch health recommendations" });
    }
  });

  app.get("/api/health-recommendations/patient/:patientId/active", authenticateToken, requireTenant, async (req, res) => {
    try {
      const { patientId } = req.params;
      const { tenantId } = req.user;
      
      const recommendations = await storage.getActiveHealthRecommendationsByPatient(patientId, tenantId);
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching active health recommendations:", error);
      res.status(500).json({ message: "Failed to fetch active health recommendations" });
    }
  });

  app.post("/api/health-recommendations", authenticateToken, requireTenant, async (req, res) => {
    try {
      const { tenantId, userId } = req.user;
      const validatedData = insertHealthRecommendationSchema.parse({
        ...req.body,
        tenantId
      });
      
      const recommendation = await storage.createHealthRecommendation(validatedData);
      res.status(201).json(recommendation);
    } catch (error) {
      console.error("Error creating health recommendation:", error);
      res.status(500).json({ message: "Failed to create health recommendation" });
    }
  });

  app.patch("/api/health-recommendations/:id/acknowledge", authenticateToken, requireTenant, async (req, res) => {
    try {
      const { id } = req.params;
      const { tenantId, userId } = req.user;
      
      const recommendation = await storage.acknowledgeHealthRecommendation(id, userId, tenantId);
      if (!recommendation) {
        return res.status(404).json({ message: "Health recommendation not found" });
      }
      
      res.json(recommendation);
    } catch (error) {
      console.error("Error acknowledging health recommendation:", error);
      res.status(500).json({ message: "Failed to acknowledge health recommendation" });
    }
  });

  // AI Health Analysis routes
  app.get("/api/health-analyses/patient/:patientId", authenticateToken, requireTenant, async (req, res) => {
    try {
      const { patientId } = req.params;
      const { tenantId } = req.user;
      
      const analyses = await storage.getHealthAnalysesByPatient(patientId, tenantId);
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching health analyses:", error);
      res.status(500).json({ message: "Failed to fetch health analyses" });
    }
  });

  app.get("/api/health-analyses/patient/:patientId/latest", authenticateToken, requireTenant, async (req, res) => {
    try {
      const { patientId } = req.params;
      const { tenantId } = req.user;
      
      const analysis = await storage.getLatestHealthAnalysis(patientId, tenantId);
      if (!analysis) {
        return res.status(404).json({ message: "No health analysis found for this patient" });
      }
      
      res.json(analysis);
    } catch (error) {
      console.error("Error fetching latest health analysis:", error);
      res.status(500).json({ message: "Failed to fetch latest health analysis" });
    }
  });

  app.post("/api/health-analyses/generate/:patientId", authenticateToken, requireTenant, requireRole(['physician', 'nurse', 'tenant_admin', 'super_admin']), async (req, res) => {
    try {
      const { patientId } = req.params;
      const { tenantId, userId } = req.user;
      
      // Get patient data
      const patient = await storage.getPatient(patientId, tenantId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      // Get vital signs (latest 10 records)
      const vitalSigns = await storage.getVitalSignsByPatient(patientId, tenantId);
      const recentVitalSigns = vitalSigns.slice(0, 10);
      
      // Get recent appointments (latest 5)
      const appointments = await storage.getAppointmentsByPatient(patientId, tenantId);
      const recentAppointments = appointments.slice(0, 5);
      
      if (recentVitalSigns.length === 0) {
        return res.status(400).json({ 
          message: "No vital signs data available for health analysis. Please record vital signs first." 
        });
      }
      
      // Generate AI health analysis
      const analysisResult = await aiHealthAnalyzer.analyzePatientHealth(
        patient,
        recentVitalSigns,
        recentAppointments
      );
      
      // Save health analysis to database
      const healthAnalysis = await storage.createHealthAnalysis({
        tenantId,
        patientId,
        overallHealthScore: analysisResult.overallHealthScore,
        riskFactors: analysisResult.riskFactors,
        trends: analysisResult.trends,
        nextAppointmentSuggestion: analysisResult.nextAppointmentSuggestion,
        analysisData: analysisResult,
        confidence: 0.85 // Default confidence score
      });
      
      // Save individual recommendations
      const savedRecommendations = [];
      for (const rec of analysisResult.recommendations) {
        const recommendation = await storage.createHealthRecommendation({
          tenantId,
          patientId,
          type: rec.type,
          priority: rec.priority,
          title: rec.title,
          description: rec.description,
          recommendations: rec.recommendations,
          reasoning: rec.reasoning,
          followUpRequired: rec.followUpRequired
        });
        savedRecommendations.push(recommendation);
      }
      
      // Log audit trail
      await storage.logAuditAction(
        tenantId,
        userId,
        'health_analysis',
        healthAnalysis.id,
        'generate',
        null,
        { 
          patientId,
          analysisScore: analysisResult.overallHealthScore,
          recommendationsCount: savedRecommendations.length
        }
      );
      
      res.json({
        analysis: healthAnalysis,
        recommendations: savedRecommendations,
        summary: {
          overallHealthScore: analysisResult.overallHealthScore,
          riskFactors: analysisResult.riskFactors,
          trends: analysisResult.trends,
          recommendationsCount: savedRecommendations.length
        }
      });
    } catch (error) {
      console.error("Error generating health analysis:", error);
      res.status(500).json({ 
        message: "Failed to generate health analysis",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const server = createServer(app);
  return server;
}
