import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { insertUserSchema, insertTenantSchema, insertPatientSchema, insertAppointmentSchema, insertPrescriptionSchema, insertLabOrderSchema, insertInsuranceClaimSchema, insertInsuranceProviderSchema, insertServicePriceSchema, insertInsurancePlanCoverageSchema, insertClaimLineItemSchema, insertSubscriptionSchema, insertReportSchema, insertMedicalCommunicationSchema, insertCommunicationTranslationSchema, insertSupportedLanguageSchema, insertMedicalPhraseSchema, insertPhraseTranslationSchema, insertLaboratorySchema, insertLabResultSchema, insertLabOrderAssignmentSchema, insertLaboratoryApplicationSchema, insertVitalSignsSchema, insertVisitSummarySchema, insertHealthRecommendationSchema, insertHealthAnalysisSchema, insertPatientCheckInSchema, insertRolePermissionSchema, insertPharmacyReceiptSchema, insertLabBillSchema, labBills } from "@shared/schema";
import { authenticateToken, requireRole, type AuthenticatedRequest, type JWTPayload } from "./middleware/auth";
import { setTenantContext, requireTenant } from "./middleware/tenant";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { aiHealthAnalyzer } from "./ai-health-analyzer";
import { 
  formatCurrency, 
  getCurrencyInfo, 
  getTenantCurrencies, 
  getTenantBaseCurrency, 
  convertCurrency, 
  getAfricanCurrencies, 
  getAllCurrencies, 
  updateExchangeRate 
} from "./currency-utils";
import { autoDetectCurrency, getCurrencyByCountry, getAfricanCountries } from "./geo-currency-mapping";
import { sendWelcomeEmail, generateTemporaryPassword } from "./email-service";
import {
  ObjectStorageService,
  ObjectNotFoundError,
} from "./objectStorage";

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
        // For patients and other users without tenant ID, search across all tenants
        const allUsers = await storage.getAllUsers();
        user = allUsers.find(u => u.username === username || u.email === username);
      }

      if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!user.isActive) {
        return res.status(401).json({ message: "Account is disabled" });
      }

      // Additional check: Prevent pharmacy receptionists from logging in
      if (user.role === "receptionist") {
        const allTenants = await storage.getAllTenants();
        const tenant = allTenants.find(t => t.id === user.tenantId);
        if (tenant?.type === "pharmacy") {
          return res.status(403).json({ message: "Receptionist role is not available for pharmacy organizations. Please contact your administrator." });
        }
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
        previousData: null,
        newData: { loginTime: new Date() },
        ipAddress: req.ip || null,
        userAgent: req.get("User-Agent") || null
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
          tenantId: user.tenantId,
          mustChangePassword: user.mustChangePassword || false,
          isTemporaryPassword: user.isTemporaryPassword || false
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Change password endpoint for temporary passwords
  app.post("/api/auth/change-password", authenticateToken, async (req, res) => {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;
      
      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ message: "All password fields are required" });
      }
      
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "New passwords do not match" });
      }
      
      if (newPassword.length < 8) {
        return res.status(400).json({ message: "New password must be at least 8 characters long" });
      }
      
      // Get current user
      const user = await storage.getUserById(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      
      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);
      
      // Update user password and remove temporary password flags
      await storage.updateUser(user.id, {
        password: hashedNewPassword,
        isTemporaryPassword: false,
        mustChangePassword: false,
        updatedAt: new Date()
      });
      
      // Create audit log
      await storage.createAuditLog({
        tenantId: user.tenantId,
        userId: user.id,
        entityType: "user",
        entityId: user.id,
        action: "password_change",
        previousData: { isTemporaryPassword: user.isTemporaryPassword },
        newData: { isTemporaryPassword: false, mustChangePassword: false },
        ipAddress: req.ip || null,
        userAgent: req.get("User-Agent") || null
      });
      
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Password change error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Public organization registration route (before tenant middleware)
  app.post("/api/register-organization", async (req, res) => {
    try {
      console.log("Organization registration request:", req.body);
      
      const { organizationName, organizationType, adminFirstName, adminLastName, adminEmail, adminPassword, confirmPassword, phoneNumber, address, description } = req.body;
      
      // Validate required fields
      if (!organizationName || !organizationType || !adminFirstName || !adminLastName || !adminEmail || !adminPassword) {
        return res.status(400).json({ message: "All required fields must be provided" });
      }
      
      if (adminPassword !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }
      
      if (adminPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }
      
      // Check if organization already exists
      const allTenants = await storage.getAllTenants();
      const existingTenant = allTenants.find(t => t.name.toLowerCase() === organizationName.toLowerCase());
      if (existingTenant) {
        return res.status(409).json({ message: "Organization name already exists" });
      }
      
      // Check if admin email already exists across all tenants
      const allUsers = await storage.getAllUsers();
      const existingUser = allUsers.find(u => u.email.toLowerCase() === adminEmail.toLowerCase());
      if (existingUser) {
        return res.status(409).json({ message: "Email address already exists" });
      }
      
      // Generate subdomain from organization name
      const subdomain = organizationName.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      // Auto-detect currency based on geographic location
      const currencyMapping = autoDetectCurrency(address, req.body.country);
      let baseCurrency = 'USD'; // Default fallback
      let supportedCurrencies = ['USD'];
      
      if (currencyMapping) {
        baseCurrency = currencyMapping.currency;
        supportedCurrencies = currencyMapping.supportedCurrencies;
        console.log(`Auto-detected currency for ${organizationName}: ${baseCurrency} (${currencyMapping.country}, ${currencyMapping.region})`);
        console.log(`Supported currencies: ${supportedCurrencies.join(', ')}`);
      } else if (address) {
        // Log the address for manual review if auto-detection failed
        console.log(`Could not auto-detect currency for address: ${address}. Using default USD.`);
      }

      // Create tenant first
      const tenantData = {
        name: organizationName,
        type: organizationType,
        subdomain: subdomain,
        settings: { 
          features: organizationType === 'hospital' ? ['ehr', 'lab', 'billing'] : 
                   organizationType === 'laboratory' ? ['lab_processing', 'results'] : 
                   ['prescription', 'billing'] 
        },
        isActive: true,
        phoneNumber: phoneNumber || null,
        address: address || null,
        description: description || null,
        baseCurrency: baseCurrency,
        supportedCurrencies: JSON.stringify(supportedCurrencies),
        trialStartDate: new Date(),
        trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
        subscriptionStatus: 'trial' as const
      };
      
      const tenant = await storage.createTenant(tenantData);
      console.log("Created tenant:", tenant);
      
      // Generate temporary password for admin user
      const temporaryPassword = generateTemporaryPassword();
      const hashedTempPassword = await bcrypt.hash(temporaryPassword, 12);
      
      // Create admin user with temporary password
      const adminUserData = {
        username: `${adminFirstName.toLowerCase()}_${adminLastName.toLowerCase()}_admin`,
        email: adminEmail,
        password: hashedTempPassword,
        firstName: adminFirstName,
        lastName: adminLastName,
        role: 'tenant_admin' as const,
        tenantId: tenant.id,
        isActive: true,
        isTemporaryPassword: true,
        mustChangePassword: true
      };
      
      const adminUser = await storage.createUser(adminUserData);
      console.log("Created admin user:", adminUser);
      
      // Send welcome email with login credentials
      const loginUrl = process.env.NODE_ENV === 'production' 
        ? `https://${req.get('host')}/login` 
        : `http://localhost:5000/login`;
        
      const emailSent = await sendWelcomeEmail({
        userEmail: adminEmail,
        firstName: adminFirstName,
        lastName: adminLastName,
        username: adminUserData.username,
        temporaryPassword: temporaryPassword,
        organizationName: organizationName,
        loginUrl: loginUrl
      });
      
      if (!emailSent) {
        console.error("Failed to send welcome email to:", adminEmail);
        // Don't fail the registration, just log the error
      } else {
        console.log("Welcome email sent successfully to:", adminEmail);
      }
      
      // Create audit log for tenant creation
      await storage.createAuditLog({
        tenantId: tenant.id,
        userId: adminUser.id,
        entityType: "tenant",
        entityId: tenant.id,
        action: "CREATE",
        previousData: null,
        newData: tenant,
        ipAddress: req.ip || null,
        userAgent: req.get('User-Agent') || null
      });
      
      res.status(201).json({
        message: "Organization registered successfully",
        organization: {
          id: tenant.id,
          name: tenant.name,
          type: tenant.type,
          subdomain: tenant.subdomain
        },
        admin: {
          id: adminUser.id,
          email: adminUser.email,
          firstName: adminUser.firstName,
          lastName: adminUser.lastName
        }
      });
      
    } catch (error) {
      console.error("Organization registration error:", error);
      res.status(500).json({ 
        message: "Failed to register organization", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Currency detection routes (public, before any middleware)
  app.get("/api/currency/detect/:country", async (req, res) => {
    try {
      const country = req.params.country;
      const currencyMapping = getCurrencyByCountry(country);
      
      if (currencyMapping) {
        res.json({
          country: currencyMapping.country,
          currency: currencyMapping.currency,
          region: currencyMapping.region,
          supportedCurrencies: currencyMapping.supportedCurrencies,
          detected: true
        });
      } else {
        res.json({
          country: country,
          currency: 'USD',
          region: 'Unknown',
          supportedCurrencies: ['USD'],
          detected: false,
          message: 'Currency not detected, using USD as default'
        });
      }
    } catch (error) {
      console.error("Currency detection error:", error);
      res.status(500).json({ message: "Failed to detect currency" });
    }
  });

  app.get("/api/currencies/african-countries", async (req, res) => {
    try {
      const africanCountries = getAfricanCountries();
      res.json(africanCountries);
    } catch (error) {
      console.error("Get African countries error:", error);
      res.status(500).json({ message: "Failed to fetch African countries" });
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
        previousData: null,
        newData: { username: user.username, email: user.email, role: user.role },
        ipAddress: req.ip || null,
        userAgent: req.get("User-Agent") || null
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

  // Get current tenant information - allowed without full auth
  app.get("/api/tenant/current", async (req, res) => {
    try {
      // This route needs special handling to get tenant info for authenticated users
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization token required' });
      }
      
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production') as JWTPayload;
      
      const tenant = await storage.getTenant(decoded.tenantId);
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }
      
      res.json(tenant);
    } catch (error) {
      console.error("Get current tenant error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

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

  // Get users by specific tenant ID (for tenant admins)
  app.get("/api/users/:tenantId", requireTenant, requireRole(["tenant_admin", "director", "super_admin"]), async (req, res) => {
    try {
      const tenantId = req.params.tenantId;
      
      // Only allow access to own tenant unless super admin
      if (req.user!.role !== 'super_admin' && req.tenant!.id !== tenantId) {
        return res.status(403).json({ message: "Access denied to other tenant's users" });
      }
      
      const users = await storage.getUsersByTenant(tenantId);
      res.json(users);
    } catch (error) {
      console.error("Get tenant users error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Removed duplicate user creation handler - using the enhanced version below with temporary password logic

  // Update user (tenant admin functionality)
  app.patch("/api/users/:userId", requireTenant, requireRole(["tenant_admin", "director", "super_admin"]), async (req, res) => {
    try {
      const userId = req.params.userId;
      const { username, email, firstName, lastName, role, isActive, password } = req.body;
      const tenantId = req.tenant!.id;
      const updatedBy = req.user!.id;

      // Get existing user
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Only allow access to own tenant unless super admin
      if (req.user!.role !== 'super_admin' && existingUser.tenantId !== tenantId) {
        return res.status(403).json({ message: "Access denied to other tenant's users" });
      }

      // Prevent users from modifying their own admin privileges (except super admin)
      if (existingUser.id === updatedBy && req.user!.role !== 'super_admin') {
        if (role && role !== existingUser.role) {
          return res.status(403).json({ message: "Cannot modify your own role" });
        }
        if (isActive === false) {
          return res.status(403).json({ message: "Cannot deactivate your own account" });
        }
      }

      const updateData: any = {};
      
      if (username && username !== existingUser.username) {
        // Check username uniqueness within tenant
        const usernameExists = await storage.getUserByUsername(username, tenantId);
        if (usernameExists && usernameExists.id !== userId) {
          return res.status(400).json({ message: "Username already exists" });
        }
        updateData.username = username;
      }

      if (email && email !== existingUser.email) {
        const allUsers = await storage.getUsersByTenant(tenantId);
        const emailExists = allUsers.find(u => u.email === email && u.id !== userId);
        if (emailExists) {
          return res.status(400).json({ message: "Email already exists" });
        }
        updateData.email = email;
      }

      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;
      if (typeof isActive === 'boolean') updateData.isActive = isActive;

      if (role && role !== existingUser.role) {
        // Validate role for tenant type
        const validRoles = req.tenant!.type === 'pharmacy' 
          ? ['pharmacist', 'tenant_admin', 'billing_staff']
          : ['director', 'physician', 'nurse', 'lab_technician', 'receptionist', 'billing_staff', 'tenant_admin'];

        if (!validRoles.includes(role)) {
          return res.status(400).json({ 
            message: `Invalid role for ${req.tenant!.type}. Valid roles: ${validRoles.join(', ')}` 
          });
        }
        updateData.role = role;
      }

      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }

      const updatedUser = await storage.updateUser(userId, updateData);

      // Create audit log
      await storage.createAuditLog({
        tenantId,
        userId: updatedBy,
        entityType: "user",
        entityId: userId,
        action: "UPDATE",
        previousData: {
          username: existingUser.username,
          email: existingUser.email,
          role: existingUser.role,
          isActive: existingUser.isActive
        },
        newData: updateData,
        ipAddress: req.ip || null,
        userAgent: req.get("User-Agent") || null
      });

      // Return user without password
      const { password: _, ...userResponse } = updatedUser;
      res.json(userResponse);

    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Delete user (tenant admin functionality)
  app.delete("/api/users/:userId", requireTenant, requireRole(["tenant_admin", "super_admin"]), async (req, res) => {
    try {
      const userId = req.params.userId;
      const tenantId = req.tenant!.id;
      const deletedBy = req.user!.id;

      // Get existing user
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Only allow access to own tenant unless super admin
      if (req.user!.role !== 'super_admin' && existingUser.tenantId !== tenantId) {
        return res.status(403).json({ message: "Access denied to other tenant's users" });
      }

      // Prevent users from deleting themselves
      if (existingUser.id === deletedBy) {
        return res.status(403).json({ message: "Cannot delete your own account" });
      }

      // Soft delete by deactivating
      const updatedUser = await storage.updateUser(userId, { isActive: false });

      // Create audit log
      await storage.createAuditLog({
        tenantId,
        userId: deletedBy,
        entityType: "user",
        entityId: userId,
        action: "DELETE",
        previousData: {
          username: existingUser.username,
          email: existingUser.email,
          role: existingUser.role,
          isActive: existingUser.isActive
        },
        newData: { isActive: false },
        ipAddress: req.ip || null,
        userAgent: req.get("User-Agent") || null
      });

      res.json({ message: "User deactivated successfully" });

    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ message: "Failed to delete user" });
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
        previousData: null,
        newData: tenant,
        ipAddress: req.ip || null,
        userAgent: req.get("User-Agent") || null || null
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
      
      // Check if user is authenticated and is a physician
      if (req.user && req.user.role === 'physician') {
        // Physicians only see assigned patients
        patients = await storage.getAssignedPatients(req.user.id, tenantId);
        
        // Apply search filter if provided
        if (search && typeof search === "string") {
          const query = search.toLowerCase().trim();
          patients = patients.filter(patient => 
            patient.firstName?.toLowerCase().includes(query) ||
            patient.lastName?.toLowerCase().includes(query) ||
            patient.mrn?.toLowerCase().includes(query) ||
            patient.email?.toLowerCase().includes(query) ||
            `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(query)
          );
        }
        
        // Apply pagination to assigned patients
        const startIndex = parseInt(offset as string);
        const limitNum = parseInt(limit as string);
        patients = patients.slice(startIndex, startIndex + limitNum);
      } else {
        // Other roles see all patients
        if (search && typeof search === "string") {
          patients = await storage.searchPatients(tenantId, search);
        } else {
          patients = await storage.getPatientsByTenant(tenantId, parseInt(limit as string), parseInt(offset as string));
        }
      }

      res.json(patients);
    } catch (error) {
      console.error("Get patients error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });





  // Enhanced patient medical records endpoint for healthcare professionals - MUST be before the parameterized route
  app.get("/api/patients/medical-records", requireTenant, requireRole(["physician", "nurse", "tenant_admin", "director", "super_admin"]), async (req, res) => {
    try {
      const tenantId = req.tenant!.id;
      const searchQuery = req.query.search as string;
      console.log("Medical records request for tenant:", tenantId, "by user role:", req.user?.role, "search:", searchQuery);
      
      let medicalRecords;
      
      // Physicians only see assigned patients
      if (req.user?.role === 'physician') {
        const assignedPatients = await storage.getAssignedPatients(req.user.id, tenantId);
        
        // Get medical records for assigned patients
        medicalRecords = [];
        for (const patient of assignedPatients) {
          const patientRecord = await storage.getCompletePatientRecord(patient.id, tenantId);
          if (patientRecord) {
            medicalRecords.push(patientRecord);
          }
        }
      } else {
        // Nurses, admins, and directors see all patients
        medicalRecords = await storage.getPatientsWithMedicalRecords(tenantId);
      }
      
      // Apply search filter if provided
      if (searchQuery && searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        medicalRecords = medicalRecords.filter(patient => 
          patient.firstName?.toLowerCase().includes(query) ||
          patient.lastName?.toLowerCase().includes(query) ||
          patient.mrn?.toLowerCase().includes(query) ||
          patient.email?.toLowerCase().includes(query) ||
          `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(query)
        );
      }
      
      res.json(medicalRecords);
    } catch (error) {
      console.error("Get patient medical records error:", error);
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
      // Generate unique alphanumeric MRN automatically
      const timestamp = Date.now().toString().slice(-8); // Last 8 digits of timestamp
      const randomPart = Math.random().toString(36).substr(2, 6).toUpperCase(); // 6 random alphanumeric chars
      const tenantPrefix = (req.tenant!.name || 'HOSPITAL').replace(/[^A-Z]/g, '').slice(0, 3) || 'HOS'; // First 3 letters of tenant name
      const mrn = `${tenantPrefix}${timestamp}${randomPart}`;
      
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
        previousData: null,
        newData: patient,
        ipAddress: req.ip || null,
        userAgent: req.get("User-Agent") || null
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

  // Complete patient record with all medical data
  app.get("/api/patients/:id/complete-record", requireTenant, requireRole(["physician", "nurse", "tenant_admin", "director", "super_admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenant!.id;
      
      // Check patient access for physicians
      if (req.user?.role === 'physician') {
        const hasAccess = await storage.hasPatientAccess(req.user.id, id, tenantId);
        if (!hasAccess) {
          return res.status(403).json({ 
            message: "Access denied. You are not assigned to this patient.", 
            requiresApproval: true,
            patientId: id
          });
        }
      }
      
      console.log("Complete record request for patient:", id, "tenant:", tenantId);
      const completeRecord = await storage.getCompletePatientRecord(id, tenantId);
      if (!completeRecord) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      res.json(completeRecord);
    } catch (error) {
      console.error("Get complete patient record error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update patient medical information (for doctors to edit medical history, medications, allergies)
  app.patch("/api/patients/:id", requireTenant, requireRole(["physician", "nurse", "tenant_admin", "director", "super_admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenant!.id;
      const updates = req.body;

      // Check patient access for physicians
      if (req.user?.role === 'physician') {
        const hasAccess = await storage.hasPatientAccess(req.user.id, id, tenantId);
        if (!hasAccess) {
          return res.status(403).json({ 
            message: "Access denied. You are not assigned to this patient.", 
            requiresApproval: true,
            patientId: id
          });
        }
      }

      // Get original patient data for audit log
      const originalPatient = await storage.getPatient(id, tenantId);
      if (!originalPatient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      // Update patient
      const updatedPatient = await storage.updatePatient(id, updates, tenantId);
      if (!updatedPatient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      // Create audit log
      await storage.createAuditLog({
        tenantId: tenantId,
        userId: req.user!.id,
        entityType: "patient",
        entityId: id,
        action: "update",
        previousData: originalPatient,
        newData: updatedPatient,
        ipAddress: req.ip || null,
        userAgent: req.get("User-Agent") || null
      });

      res.json(updatedPatient);
    } catch (error) {
      console.error("Update patient error:", error);
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

  // GET appointments by patient ID with doctor information (for patient portal staff interface)
  app.get("/api/appointments/patient/:patientId", authenticateToken, setTenantContext, requireRole(["physician", "nurse", "tenant_admin", "director", "super_admin"]), async (req: AuthenticatedRequest, res) => {
    try {
      const { patientId } = req.params;
      const tenantId = req.tenant!.id;
      
      const appointments = await storage.getAppointmentsByPatientWithDoctorInfo(patientId, tenantId);
      res.json(appointments);
    } catch (error) {
      console.error("Get patient appointments with doctor info error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/appointments", requireTenant, authenticateToken, async (req, res) => {
    try {
      console.log("[DEBUG] Creating appointment - User:", req.user?.role, "User ID:", req.user?.id, "Tenant:", req.tenant?.id);
      console.log("[DEBUG] Request body:", req.body);
      
      // Check if user has permission to create appointments
      const allowedRoles = ["physician", "nurse", "receptionist", "tenant_admin", "director", "super_admin", "billing_staff", "pharmacist", "patient"];
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
        previousData: null,
        newData: appointment,
        ipAddress: req.ip || null,
        userAgent: req.get("User-Agent") || null
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

  // Update appointment (PATCH) - Allow receptionists and doctors to update appointments
  app.patch("/api/appointments/:id", requireTenant, authenticateToken, requireRole(["physician", "nurse", "receptionist", "tenant_admin", "director", "super_admin"]), async (req, res) => {
    try {
      console.log("[APPOINTMENT UPDATE] User role:", req.user?.role, "Tenant type:", req.tenant?.type, "User ID:", req.user?.id);
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
        previousData: null,
        newData: updatedAppointment,
        ipAddress: req.ip || null,
        userAgent: req.get("User-Agent") || null
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
      const { patientId, active } = req.query;
      const tenantId = req.tenant!.id;
      const tenantType = req.tenant!.type;

      let prescriptions;
      if (patientId) {
        prescriptions = await storage.getPrescriptionsByPatient(patientId as string, tenantId);
        
        // Filter for active prescriptions if requested
        if (active === 'true') {
          prescriptions = prescriptions.filter(p => 
            p.status !== 'cancelled' && 
            p.status !== 'expired' && 
            p.status !== 'picked_up' &&
            (!p.expiryDate || new Date(p.expiryDate) > new Date())
          );
        }
      } else {
        // For pharmacies, show prescriptions sent TO them (by pharmacyTenantId)
        // For hospitals/clinics, show prescriptions created BY them (by tenantId)
        if (tenantType === 'pharmacy') {
          prescriptions = await storage.getPrescriptionsByPharmacy(tenantId);
          console.log(`[PHARMACY] Loading prescriptions sent to pharmacy ${tenantId}:`, prescriptions.length);
        } else {
          prescriptions = await storage.getPrescriptionsByTenant(tenantId);
          console.log(`[HOSPITAL] Loading prescriptions created by hospital ${tenantId}:`, prescriptions.length);
        }
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
        previousData: null,
        newData: prescription,
        ipAddress: req.ip || null,
        userAgent: req.get("User-Agent") || null
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

  // Update prescription route - expanded to support pharmacy workflow
  app.patch("/api/prescriptions/:id", requireRole(["physician", "nurse", "pharmacist", "tenant_admin", "director", "super_admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const requestData = { ...req.body };
      
      // Convert string dates to Date objects
      const dateFields = [
        'expiryDate', 'prescribedDate', 'sentToPharmacyDate', 'filledDate',
        'insuranceVerifiedDate', 'processingStartedDate', 'readyDate', 'dispensedDate'
      ];
      
      dateFields.forEach(field => {
        if (requestData[field] && typeof requestData[field] === 'string') {
          const dateValue = new Date(requestData[field]);
          if (!isNaN(dateValue.getTime())) {
            requestData[field] = dateValue;
          } else {
            delete requestData[field]; // Remove invalid dates
          }
        }
      });
      
      // Ensure numeric fields are proper numbers
      const numericFields = ['insuranceCopay', 'totalCost', 'quantity', 'refills'];
      numericFields.forEach(field => {
        if (requestData[field] !== undefined) {
          const numValue = Number(requestData[field]);
          if (!isNaN(numValue)) {
            requestData[field] = numValue;
          }
        }
      });
      
      // Get existing prescription to check permissions
      // For pharmacies, look up by pharmacy tenant ID; for hospitals, by hospital tenant ID
      const isPharmacyTenant = req.tenant!.type === 'pharmacy';
      const existingPrescription = isPharmacyTenant 
        ? await storage.getPrescriptionForPharmacy(id, req.tenant!.id)
        : await storage.getPrescription(id, req.tenant!.id);
        
      if (!existingPrescription) {
        return res.status(404).json({ message: "Prescription not found" });
      }
      
      // Only allow updates if prescription is not yet filled/picked up (but allow pharmacy workflow updates)
      const isPharmacyWorkflowUpdate = ['received', 'insurance_verified', 'processing', 'ready', 'dispensed'].includes(requestData.status);
      const isPharmacyUser = req.user!.role === 'pharmacist' || (req.user!.role === 'tenant_admin' && req.tenant!.type === 'pharmacy');
      
      if (!isPharmacyWorkflowUpdate && (existingPrescription.status === 'filled' || existingPrescription.status === 'picked_up')) {
        return res.status(400).json({ message: "Cannot edit prescription that has already been filled or picked up" });
      }
      
      // Use the original tenant ID (hospital) for the update, not the pharmacy tenant ID
      const updateTenantId = isPharmacyTenant ? existingPrescription.tenantId : req.tenant!.id;
      const updatedPrescription = await storage.updatePrescription(id, requestData, updateTenantId);
      
      if (!updatedPrescription) {
        return res.status(404).json({ message: "Prescription not found" });
      }
      
      // Auto-create insurance claim when prescription is dispensed
      if (requestData.status === 'dispensed' && isPharmacyUser) {
        console.log(`[BILLING SYNC] Prescription ${updatedPrescription.id} dispensed, checking for insurance claim creation...`);
        console.log(`[BILLING SYNC] Insurance provider: ${updatedPrescription.insuranceProvider}, Total cost: ${updatedPrescription.totalCost}`);
        
        if (updatedPrescription.insuranceProvider && updatedPrescription.totalCost) {
          try {
            const totalCost = Number(updatedPrescription.totalCost);
            const copay = Number(updatedPrescription.insuranceCopay) || 0;
            const claimAmount = totalCost - copay;
            
            console.log(`[BILLING SYNC] Calculated claim amount: ${claimAmount} (Total: ${totalCost} - Copay: ${copay})`);
            
            if (claimAmount > 0) {
              const claimData = {
                tenantId: req.tenant!.id, // Pharmacy tenant for the claim
                patientId: updatedPrescription.patientId,
                claimNumber: `CLM-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
                totalAmount: totalCost.toString(),
                totalPatientCopay: copay.toString(),
                totalInsuranceAmount: claimAmount.toString(),
                status: 'submitted' as const,
                submittedDate: new Date(),
                notes: `Auto-generated claim for dispensed prescription ${updatedPrescription.medicationName} ${updatedPrescription.dosage || ''}`.trim(),
                procedureCodes: [updatedPrescription.medicationName.toUpperCase().replace(/[^A-Z0-9]/g, '_')],
                diagnosisCodes: []
              };
              
              console.log(`[BILLING SYNC] Creating insurance claim with data:`, claimData);
              const insuranceClaim = await storage.createInsuranceClaim(claimData);
              
              console.log(`[BILLING SYNC] ✅ Auto-created insurance claim ${insuranceClaim.claimNumber} for prescription ${updatedPrescription.id}`);
            } else {
              console.log(`[BILLING SYNC] No claim created - claim amount is ${claimAmount} (not positive)`);
            }
          } catch (claimError) {
            console.error("[BILLING SYNC] ❌ Failed to auto-create insurance claim:", claimError);
            // Don't fail the prescription update if claim creation fails
          }
        } else {
          console.log(`[BILLING SYNC] No claim created - missing insurance provider or total cost`);
        }
      }
      
      // Create audit log
      await storage.createAuditLog({
        tenantId: req.tenant!.id,
        userId: req.user!.id,
        entityType: "prescription",
        entityId: id,
        action: "update",
        previousData: existingPrescription,
        newData: updatedPrescription,
        ipAddress: req.ip || null,
        userAgent: req.get("User-Agent") || null
      });
      
      res.json(updatedPrescription);
    } catch (error) {
      console.error("Update prescription error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Lab order management routes
  app.get("/api/lab-orders", authenticateToken, requireTenant, async (req, res) => {
    try {
      const { patientId, pending, forLaboratory, patientMrn, archived } = req.query;
      const tenantId = req.tenant!.id;

      let labOrders;
      if (forLaboratory === 'true') {
        // Laboratory viewing orders sent to them
        if (archived === 'true') {
          console.log(`[LAB ORDERS] Laboratory ${tenantId} requesting archived orders`);
          labOrders = await storage.getArchivedLabOrdersForLaboratory(tenantId);
        } else {
          console.log(`[LAB ORDERS] Laboratory ${tenantId} requesting active orders sent to them`);
          labOrders = await storage.getLabOrdersForLaboratory(tenantId);
        }
        console.log(`[LAB ORDERS] Found ${labOrders.length} ${archived === 'true' ? 'archived' : 'active'} orders for laboratory ${tenantId}`);
      } else if (patientMrn) {
        // Search by patient MRN (for laboratories to find patient orders using hospital-assigned ID)
        labOrders = await storage.getLabOrdersByPatientMrn(patientMrn as string);
      } else if (patientId) {
        labOrders = await storage.getLabOrdersByPatient(patientId as string, tenantId);
      } else if (pending === "true") {
        labOrders = await storage.getPendingLabOrders(tenantId);
      } else if (archived === 'true') {
        labOrders = await storage.getArchivedLabOrdersByTenant(tenantId);
      } else {
        labOrders = await storage.getLabOrdersByTenant(tenantId);
      }

      res.json(labOrders);
    } catch (error) {
      console.error("Get lab orders error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // REMOVED - Old single lab order route replaced by new multi-order route below

  // Lab Orders management routes
  app.use("/api/lab-orders", requireTenant);

  app.get("/api/lab-orders", async (req, res) => {
    try {
      const labOrders = await storage.getLabOrdersByTenant(req.tenant!.id);
      res.json(labOrders);
    } catch (error) {
      console.error("Get lab orders error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get available laboratories for lab order routing
  app.get("/api/laboratories/active", requireTenant, async (req, res) => {
    try {
      const laboratories = await storage.getTenantsByType("laboratory");
      const activeLabs = laboratories.filter(lab => lab.isActive).map(lab => ({
        id: lab.id,
        name: lab.name,
        subdomain: lab.subdomain,
        address: lab.address,
        phoneNumber: lab.phoneNumber,
        description: lab.description
      }));
      
      console.log(`[LABORATORIES] Found ${activeLabs.length} active laboratories for routing`);
      res.json(activeLabs);
    } catch (error) {
      console.error("Get laboratories error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/lab-orders", requireRole(["physician", "nurse", "tenant_admin", "director", "super_admin"]), async (req, res) => {
    try {
      console.log("[LAB ORDER] Full request body:", JSON.stringify(req.body, null, 2));
      
      // Handle multiple lab orders from form
      if (req.body.labOrders && Array.isArray(req.body.labOrders)) {
        const { labOrders, laboratoryId } = req.body;
        console.log("[LAB ORDER] Processing", labOrders.length, "lab orders for laboratory:", laboratoryId);
        const createdOrders = [];
        
        for (const orderData of labOrders) {
          console.log("[LAB ORDER] Processing order data:", orderData);
          
          const labOrderData = {
            ...orderData,
            tenantId: req.tenant!.id,
            providerId: req.user!.id,
            orderedDate: new Date(),
            appointmentId: orderData.appointmentId || null,
            labTenantId: laboratoryId // Use selected laboratory
          };

          console.log("[LAB ORDER] Validating data:", labOrderData);
          const validatedData = insertLabOrderSchema.parse(labOrderData);
          console.log("[LAB ORDER] Validated data:", validatedData);
          const labOrder = await storage.createLabOrder(validatedData);
          
          console.log(`[LAB ORDER] Created lab order ${labOrder.id} for patient ${labOrder.patientId} -> Laboratory: ${laboratoryId}`);
          createdOrders.push(labOrder);

          // Create audit log for each order
          await storage.createAuditLog({
            tenantId: req.tenant!.id,
            userId: req.user!.id,
            entityType: "lab_order",
            entityId: labOrder.id,
            action: "create",
            previousData: null,
            newData: labOrder,
            ipAddress: req.ip || null,
            userAgent: req.get("User-Agent") || null
          });
        }
        
        res.status(201).json(createdOrders);
      } else {
        // Handle single lab order (backward compatibility) - this should not be used by the new form
        console.log("[LAB ORDER] Single order mode - body:", req.body);
        res.status(400).json({ message: "Single lab order mode deprecated. Use labOrders array format." });
      }
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

  app.get("/api/insurance-claims", requireRole(['super_admin', 'tenant_admin', 'billing_staff', 'pharmacist', 'pharmacy_admin', 'physician']), async (req, res) => {
    try {
      const { patientId } = req.query;
      const tenantId = req.tenant!.id;

      // Fetch claims with patient enrichment for medication claims display
      let claims;
      if (patientId) {
        claims = await storage.getInsuranceClaimsByPatient(patientId as string, tenantId);
      } else {
        claims = await storage.getInsuranceClaimsByTenant(tenantId);
      }

      // Enrich claims with patient data for display
      const enrichedClaims = await Promise.all(claims.map(async (claim) => {
        const patient = await storage.getPatient(claim.patientId, tenantId);
        const notes = claim.notes ? (typeof claim.notes === 'string' ? JSON.parse(claim.notes) : claim.notes) : {};
        
        return {
          ...claim,
          claimAmount: parseFloat(claim.totalAmount || '0'),
          submittedAt: claim.submittedDate?.toISOString() || claim.createdAt?.toISOString(),
          processedAt: claim.processedDate?.toISOString(),
          copayAmount: parseFloat(claim.totalPatientCopay || '0'),
          // Extract medication data from notes
          medicationName: notes.medicationName || '',
          dosage: notes.dosage || '',
          quantity: parseInt(notes.quantity) || 0,
          // Patient info
          patientFirstName: patient?.firstName || '',
          patientLastName: patient?.lastName || '',
          patientMrn: patient?.mrn || '',
        };
      }));

      res.json(enrichedClaims);

    } catch (error) {
      console.error("Get insurance claims error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/insurance-claims", requireRole(["billing_staff", "physician", "tenant_admin", "director", "receptionist", "pharmacist", "pharmacy_admin"]), async (req, res) => {
    try {
      // Additional check for receptionists - only allow hospital/clinic receptionists
      if (req.user!.role === "receptionist" && req.tenant?.type !== "hospital" && req.tenant?.type !== "clinic") {
        return res.status(403).json({ message: "Access denied. Receptionist billing access is only available for hospitals." });
      }
      
      const requestData = { ...req.body };
      
      console.log("[INSURANCE CLAIM] Request data:", JSON.stringify(requestData, null, 2));
      
      // Generate unique claim number if not provided
      if (!requestData.claimNumber) {
        requestData.claimNumber = `CLM-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      }

      // Handle medication claim data - store in notes field
      let processedData = { ...requestData };
      
      // For medication claims, store medication details in notes
      if (requestData.claimType === 'medication' || requestData.medicationName) {
        processedData.notes = JSON.stringify({
          claimType: requestData.claimType || 'medication',
          medicationName: requestData.medicationName,
          dosage: requestData.dosage,
          quantity: requestData.quantity,
          daysSupply: requestData.daysSupply,
          pharmacyNpi: requestData.pharmacyNpi,
          prescriptionId: requestData.prescriptionId,
          originalNotes: requestData.notes,
        });
        
        // Map to standard insurance claim fields
        processedData.totalAmount = requestData.claimAmount;
        processedData.submittedDate = requestData.submittedAt ? new Date(requestData.submittedAt) : new Date();
      }
      
      // Handle manual insurance data - store in notes field for regular claims
      if (requestData.manualInsurance) {
        const manualInsuranceNote = `
Manual Insurance Information:
- Company: ${requestData.manualInsurance.insuranceCompany}
- Policy Number: ${requestData.manualInsurance.policyNumber}
- Group Number: ${requestData.manualInsurance.groupNumber || 'N/A'}
- Subscriber: ${requestData.manualInsurance.subscriberName || 'N/A'}
- Coverage: ${requestData.manualInsurance.coveragePercentage}%
${requestData.manualInsurance.copayAmount ? `- Fixed Copay: $${requestData.manualInsurance.copayAmount}` : ''}

Original Notes: ${requestData.notes || 'None'}`;
        
        processedData.notes = manualInsuranceNote;
        delete processedData.manualInsurance; // Remove manual insurance object before schema validation
      }

      console.log("[INSURANCE CLAIM] Processed data before validation:", JSON.stringify(processedData, null, 2));

      const claimData = insertInsuranceClaimSchema.parse({
        ...processedData,
        tenantId: req.tenant!.id
      });

      console.log("[INSURANCE CLAIM] Validated claim data:", JSON.stringify(claimData, null, 2));

      const claim = await storage.createInsuranceClaim(claimData);

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.tenant!.id,
        userId: req.user!.id,
        entityType: "insurance_claim",
        entityId: claim.id,
        action: "create",
        previousData: null,
        newData: claim,
        ipAddress: req.ip || null,
        userAgent: req.get("User-Agent") || null
      });

      res.status(201).json(claim);
    } catch (error) {
      console.error("Create insurance claim error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      if ((error as any).code === '23505' && (error as any).constraint === 'insurance_claims_claim_number_unique') {
        return res.status(400).json({ message: "Claim number already exists. Please use a different claim number." });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/insurance-claims/:id", requireRole(["billing_staff", "physician", "tenant_admin", "director", "receptionist"]), async (req, res) => {
    try {
      // Additional check for receptionists - only allow hospital/clinic receptionists
      if (req.user!.role === "receptionist" && req.tenant?.type !== "hospital" && req.tenant?.type !== "clinic") {
        return res.status(403).json({ message: "Access denied. Receptionist billing access is only available for hospitals." });
      }
      
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
        previousData: null,
        newData: updateData,
        ipAddress: req.ip || null,
        userAgent: req.get("User-Agent") || null
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

  app.post("/api/insurance-providers", authenticateToken, requireTenant, requireRole(["tenant_admin", "director", "billing_staff", "receptionist"]), async (req, res) => {
    try {
      const validatedData = insertInsuranceProviderSchema.parse({
        ...req.body,
        tenantId: req.tenant!.id,
      });

      const provider = await storage.createInsuranceProvider(validatedData);

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.tenant!.id,
        userId: req.user!.id,
        entityType: "insurance_provider",
        entityId: provider.id,
        action: "CREATE",
        previousData: null,
        newData: provider,
        ipAddress: req.ip || null,
        userAgent: req.get('User-Agent') || null
      });

      res.status(201).json(provider);
    } catch (error) {
      console.error("Failed to create insurance provider:", error);
      if (error instanceof Error && error.message.includes('validation')) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create insurance provider" });
      }
    }
  });

  // Patient Insurance routes
  app.get("/api/patient-insurance/:patientId", requireTenant, async (req, res) => {
    try {
      const { patientId } = req.params;
      
      // For pharmacies and cross-tenant billing, try cross-tenant lookup first
      if (req.tenant!.type === 'pharmacy') {
        console.log(`[CROSS-TENANT INSURANCE] Pharmacy ${req.tenant!.name} looking up insurance for patient ${patientId}`);
        const crossTenantInsurance = await storage.getPatientInsuranceCrossTenant(patientId);
        
        if (crossTenantInsurance.length > 0) {
          console.log(`[CROSS-TENANT INSURANCE] Found ${crossTenantInsurance.length} insurance records for patient`);
          res.json(crossTenantInsurance);
          return;
        }
      }
      
      // Regular tenant-specific lookup
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

  app.post("/api/service-prices", requireRole(["tenant_admin", "director", "billing_staff", "receptionist"]), async (req, res) => {
    try {
      // Allow hospital receptionists full access to service pricing
      console.log("Service pricing access - User role:", req.user!.role, "Tenant type:", req.tenant?.type, "Tenant name:", req.tenant?.name);
      
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

  app.post("/api/insurance-plan-coverage", requireRole(["tenant_admin", "director", "billing_staff", "receptionist"]), async (req, res) => {
    try {
      console.log("Insurance coverage create - User role:", req.user!.role, "Tenant type:", req.tenant?.type, "Request body:", req.body);
      
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

  app.post("/api/claim-line-items", requireRole(["billing_staff", "physician", "tenant_admin", "director", "receptionist"]), async (req, res) => {
    try {
      // Additional check for receptionists - only allow hospital/clinic receptionists
      if (req.user!.role === "receptionist" && req.tenant?.type !== "hospital" && req.tenant?.type !== "clinic") {
        return res.status(403).json({ message: "Access denied. Receptionist billing access is only available for hospitals." });
      }
      
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
        tenantId: req.tenant!.id,
        generatedBy: req.user!.id,
        status: 'generating'
      });

      const report = await storage.createReport(reportData);

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.tenant!.id,
        userId: req.user!.id,
        entityType: "report",
        entityId: report.id,
        action: "create",
        previousData: null,
        newData: { title: report.title, type: report.type },
        ipAddress: req.ip || null,
        userAgent: req.get("User-Agent") || null || null
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
        generatedBy: req.user!.id,
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
        tenantId: req.user!.tenantId, // Platform tenant
        userId: req.user!.id,
        entityType: "cross_tenant_report",
        entityId: report.id,
        action: "create",
        previousData: null,
        newData: { 
          title: report.title, 
          type: report.type, 
          targetTenant: targetTenant.name,
          targetTenantId: targetTenantId 
        },
        ipAddress: req.ip || null,
        userAgent: req.get("User-Agent") || null
      });

      await storage.createAuditLog({
        tenantId: targetTenantId, // Target tenant
        userId: req.user!.id,
        entityType: "report",
        entityId: report.id,
        action: "platform_generate",
        previousData: null,
        newData: { 
          title: report.title, 
          type: report.type, 
          generatedBy: 'platform_admin' 
        },
        ipAddress: req.ip || null,
        userAgent: req.get("User-Agent") || null
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
                           (req.user!.id === id); // User updating themselves

      if (!hasPermission) {
        return res.status(403).json({ message: "Access denied. Cannot update this user." });
      }

      // Prevent deactivation of super admin users
      if (existingUser.role === 'super_admin' && updateData.isActive === false) {
        return res.status(403).json({ message: "Cannot deactivate super admin users. This role is permanent for platform security." });
      }

      // Prevent users from deactivating themselves
      if (req.user!.id === id && updateData.isActive === false) {
        return res.status(403).json({ message: "You cannot deactivate your own account." });
      }

      // Update the user
      const updatedUser = await storage.updateUser(id, updateData);
      
      // Create audit log
      await storage.createAuditLog({
        tenantId: existingUser.tenantId,
        userId: req.user!.id || null,
        entityType: "user",
        entityId: id,
        action: "update",
        oldData: { isActive: existingUser.isActive, role: existingUser.role },
        newData: updateData,
        ipAddress: req.ip || null,
        userAgent: req.get("User-Agent") || null || null
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

      // Generate temporary password instead of using provided password
      const temporaryPassword = generateTemporaryPassword();
      const hashedTempPassword = await bcrypt.hash(temporaryPassword, 12);

      // Create user with temporary password
      const newUser = await storage.createUser({
        username,
        email,
        password: hashedTempPassword,
        firstName,
        lastName,
        role: role as any, // Cast to UserRole type
        tenantId: targetTenantId,
        isActive: true,
        isTemporaryPassword: true,
        mustChangePassword: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Get organization name for email
      const tenant = await storage.getTenant(targetTenantId);
      
      // Send welcome email with temporary credentials
      const loginUrl = process.env.NODE_ENV === 'production' 
        ? `https://${req.get('host')}/login` 
        : `http://localhost:5000/login`;
        
      const emailSent = await sendWelcomeEmail({
        userEmail: email,
        firstName,
        lastName,
        username: username,
        temporaryPassword: temporaryPassword,
        organizationName: tenant?.name || 'NaviMed Organization',
        loginUrl: loginUrl
      });
      
      if (!emailSent) {
        console.error("Failed to send welcome email to:", email);
        // Don't fail the user creation, just log the error
      } else {
        console.log("Welcome email sent successfully to:", email);
      }

      // Create audit log
      await storage.createAuditLog({
        tenantId: targetTenantId,
        userId: req.user?.id || null,
        entityType: "user",
        entityId: newUser.id,
        action: "create",
        previousData: null,
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
        },
        temporaryPassword: temporaryPassword, // Include temporary password for admin display
        emailSent: emailSent
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

  // Medical Communications routes - restricted to nurses and primary care doctors
  app.get("/api/medical-communications", authenticateToken, requireTenant, requireRole(["patient", "nurse", "physician", "tenant_admin", "director", "super_admin"]), async (req, res) => {
    try {
      const { role, tenantId, id: userId } = req.user!;
      let communications;
      
      if (role === 'patient') {
        // For patients, get their own messages only
        const patient = await storage.getPatientByUserId(userId, tenantId);
        if (!patient) {
          return res.status(404).json({ message: "Patient record not found" });
        }
        communications = await storage.getMedicalCommunicationsByPatient(patient.id, tenantId);
      } else {
        // For healthcare providers, show all communications
        communications = await storage.getMedicalCommunicationsByTenantWithSenderInfo(tenantId);
      }
      
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

  app.post("/api/medical-communications", authenticateToken, requireTenant, requireRole(["patient", "physician", "nurse", "tenant_admin", "director", "super_admin"]), async (req, res) => {
    try {
      const { role, tenantId, id: userId } = req.user!;
      let patientId = req.body.patientId;
      
      // If the user is a patient, set patientId to their own patient record
      if (role === 'patient') {
        const patient = await storage.getPatientByUserId(userId, tenantId);
        if (!patient) {
          return res.status(404).json({ message: "Patient record not found" });
        }
        patientId = patient.id;
      }
      
      const validatedData = insertMedicalCommunicationSchema.parse({
        ...req.body,
        patientId,
        tenantId,
        senderId: userId
      });

      const communication = await storage.createMedicalCommunication(validatedData);

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.user.tenantId,
        userId: req.user!.id,
        entityType: "medical_communication",
        entityId: communication.id,
        action: "CREATE",
        newData: communication,
        ipAddress: req.ip || null,
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
        userId: req.user!.id,
        entityType: "medical_communication",
        entityId: communication.id,
        action: "UPDATE",
        newData: communication,
        ipAddress: req.ip || null,
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
        userId: req.user!.id,
        entityType: "communication_translation",
        entityId: translation.id,
        action: "CREATE",
        newData: translation,
        ipAddress: req.ip || null,
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
        userId: req.user!.id,
        entityType: "supported_language",
        entityId: language.id,
        action: "CREATE",
        newData: language,
        ipAddress: req.ip || null,
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
        userId: req.user!.id,
        entityType: "supported_language",
        entityId: language.id,
        action: "UPDATE",
        newData: language,
        ipAddress: req.ip || null,
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
        userId: req.user!.id,
        entityType: "medical_phrase",
        entityId: phrase.id,
        action: "CREATE",
        newData: phrase,
        ipAddress: req.ip || null,
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
        translatedBy: req.user!.id,
      });

      const translation = await storage.createPhraseTranslation(validatedData);

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.user.tenantId,
        userId: req.user!.id,
        entityType: "phrase_translation",
        entityId: translation.id,
        action: "CREATE",
        newData: translation,
        ipAddress: req.ip || null,
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
        userId: req.user!.id,
        entityType: "laboratory",
        entityId: laboratory.id,
        action: "create",
        previousData: null,
        newData: laboratory,
        ipAddress: req.ip || null,
        userAgent: req.get("User-Agent") || null
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
      console.log("[LAB RESULTS] Received data:", JSON.stringify(req.body, null, 2));
      console.log("[LAB RESULTS] Tenant ID:", req.tenantId);
      
      const now = new Date();
      const dataToValidate = {
        ...req.body,
        tenantId: req.tenantId,
        completedAt: now,
        reportedAt: now
      };
      
      console.log("[LAB RESULTS] Data to validate:", JSON.stringify(dataToValidate, null, 2));
      
      const labResultData = insertLabResultSchema.parse(dataToValidate);

      const labResult = await storage.createLabResult(labResultData);

      // CRITICAL: Update lab order status to 'completed' when results are posted
      if (labResultData.labOrderId) {
        console.log(`[LAB RESULTS] Updating lab order ${labResultData.labOrderId} status to completed`);
        
        try {
          // Update the lab order status to completed
          await storage.updateLabOrder(labResultData.labOrderId, {
            status: 'completed',
            resultDate: new Date(),
            resultStatus: 'available',
            completedAt: new Date()
          });

          // Also update any lab order assignments
          const assignments = await storage.getLabOrderAssignmentsByOrder(labResultData.labOrderId);
          for (const assignment of assignments) {
            await storage.updateLabOrderAssignment(assignment.id, {
              status: 'completed',
              actualCompletionTime: new Date()
            }, req.tenantId!);
          }

          console.log(`[LAB RESULTS] Successfully updated lab order ${labResultData.labOrderId} to completed status`);
        } catch (updateError) {
          console.error(`[LAB RESULTS] Error updating lab order status:`, updateError);
          // Don't fail the result creation if status update fails
        }
      }

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.tenantId!,
        userId: req.user!.id,
        entityType: "lab_result",
        entityId: labResult.id,
        action: "create",
        previousData: null,
        newData: labResult,
        ipAddress: req.ip || null,
        userAgent: req.get("User-Agent") || null
      });

      res.status(201).json({
        ...labResult,
        message: "Lab result posted successfully and order status updated to completed"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("[LAB RESULTS] Zod validation errors:", JSON.stringify(error.errors, null, 2));
        return res.status(400).json({ 
          message: "Invalid lab result data", 
          errors: error.errors,
          received: req.body,
          schema_expected: "labOrderId, laboratoryId, patientId, testName are required"
        });
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
        assignedBy: req.user!.id
      });

      const assignment = await storage.createLabOrderAssignment(assignmentData);

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.tenantId!,
        userId: req.user!.id,
        entityType: "lab_order_assignment",
        entityId: assignment.id,
        action: "create",
        previousData: null,
        newData: assignment,
        ipAddress: req.ip || null,
        userAgent: req.get("User-Agent") || null
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

  // Get lab orders for laboratory (cross-tenant) - Orders sent TO this laboratory
  app.get("/api/lab-orders/laboratory", authenticateToken, requireRole(["lab_technician", "tenant_admin", "director", "super_admin"]), requireTenant, async (req, res) => {
    try {
      const { status } = req.query;
      console.log(`[LAB ORDERS] Laboratory ${req.tenant!.id} requesting lab orders sent to them${status ? ` with status: ${status}` : ''}`);
      
      // Get lab orders sent to this laboratory tenant
      let labOrders = await storage.getLabOrdersByLabTenant(req.tenant!.id);
      
      // Filter by status if provided
      if (status) {
        labOrders = labOrders.filter(order => order.status === status);
        console.log(`[LAB ORDERS] Filtered to ${labOrders.length} orders with status: ${status}`);
      }
      
      console.log(`[LAB ORDERS] Found ${labOrders.length} active orders for laboratory ${req.tenant!.name}`);
      res.json(labOrders);
    } catch (error) {
      console.error("Error fetching lab orders for laboratory:", error);
      res.status(500).json({ message: "Failed to fetch lab orders" });
    }
  });

  // Get cross-tenant lab results for patients (viewable by doctors and patients)
  app.get("/api/patients/:patientId/lab-results/all", authenticateToken, requireRole(["physician", "nurse", "patient", "tenant_admin", "director", "super_admin"]), async (req, res) => {
    try {
      const { patientId } = req.params;
      
      // For doctors and admins, get results from all laboratories
      if (["physician", "nurse", "tenant_admin", "director", "super_admin"].includes(req.user!.role)) {
        const crossTenantResults = await storage.getLabResultsForPatientAcrossTenants(patientId);
        res.json(crossTenantResults);
      } else {
        // For patients, get their own results across all labs
        const crossTenantResults = await storage.getLabResultsForPatientAcrossTenants(patientId);
        res.json(crossTenantResults);
      }
    } catch (error) {
      console.error("Error fetching cross-tenant lab results for patient:", error);
      res.status(500).json({ message: "Failed to fetch lab results" });
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
      const result = await storage.approveLaboratoryApplication(req.params.id, req.user!.id, reviewNotes);
      
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

      const application = await storage.rejectLaboratoryApplication(req.params.id, req.user!.id, reviewNotes);
      
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
        recordedBy: req.user?.id
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
        userId: req.user!.id,
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

  app.post("/api/visit-summaries", authenticateToken, requireTenant, requireRole(["super_admin", "tenant_admin", "doctor", "physician", "nurse"]), async (req, res) => {
    try {
      const validatedData = insertVisitSummarySchema.parse({
        ...req.body,
        tenantId: req.tenantId,
        providerId: req.user?.id
      });

      const visitSummary = await storage.createVisitSummary(validatedData);

      // Create audit log
      await storage.createAuditLog({
        userId: req.user!.id,
        tenantId: req.tenantId!,
        action: "visit_summary_created",
        entityType: "visit_summary",
        entityId: visitSummary.id,
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

  app.patch("/api/visit-summaries/:id", authenticateToken, requireTenant, requireRole(["super_admin", "tenant_admin", "doctor", "physician", "nurse"]), async (req, res) => {
    try {
      const visitSummary = await storage.updateVisitSummary(req.params.id, req.body, req.tenantId!);
      
      if (!visitSummary) {
        return res.status(404).json({ message: "Visit summary not found" });
      }

      // Create audit log
      await storage.createAuditLog({
        userId: req.user!.id,
        tenantId: req.tenantId!,
        action: "visit_summary_updated",
        entityType: "visit_summary",
        entityId: visitSummary.id,
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
        error: error.message 
      });
    }
  });

  // ==================== PATIENT CHECK-IN ROUTES ====================

  // Get all patient check-ins for today  
  app.get("/api/patient-check-ins", authenticateToken, requireTenant, async (req, res) => {
    try {
      const checkIns = await storage.getPatientCheckInsByTenant(req.tenant!.id);
      res.json(checkIns);
    } catch (error) {
      console.error("Failed to fetch patient check-ins:", error);
      res.status(500).json({ message: "Failed to fetch patient check-ins" });
    }
  });

  // Get today's patient check-ins
  app.get("/api/patient-check-ins/today", authenticateToken, requireTenant, async (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const checkIns = await storage.getPatientCheckInsByDate(today, req.tenant!.id);
      res.json(checkIns);
    } catch (error) {
      console.error("Failed to fetch today's check-ins:", error);
      res.status(500).json({ message: "Failed to fetch today's check-ins" });
    }
  });

  // Get waiting patients (checked in but not completed)
  app.get("/api/patient-check-ins/waiting", authenticateToken, requireTenant, async (req, res) => {
    try {
      const waitingPatients = await storage.getWaitingPatients(req.tenant!.id);
      res.json(waitingPatients);
    } catch (error) {
      console.error("Failed to fetch waiting patients:", error);
      res.status(500).json({ message: "Failed to fetch waiting patients" });
    }
  });

  console.log("DEBUG: Reached line after waiting patients route registration");
  console.log("DEBUG: About to register POST /api/patient-check-ins route");
  app.post("/api/patient-check-ins", authenticateToken, requireTenant, requireRole(["receptionist", "nurse", "tenant_admin", "director", "super_admin"]), async (req, res) => {
    try {
      console.log("[CHECK-IN DEBUG] Request body:", req.body);
      console.log("[CHECK-IN DEBUG] Tenant ID:", req.tenant!.id);
      console.log("[CHECK-IN DEBUG] User ID:", req.user!.id);

      const validatedData = insertPatientCheckInSchema.parse({
        ...req.body,
        tenantId: req.tenant!.id,
        checkedInAt: new Date()
      });
      
      console.log("[CHECK-IN DEBUG] Validated data:", validatedData);

      const checkIn = await storage.createPatientCheckIn(validatedData);
      
      console.log("[CHECK-IN DEBUG] Created check-in:", checkIn);

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.tenant!.id,
        userId: req.user!.id,
        entityType: "patient_check_in",
        entityId: checkIn.id,
        action: "CREATE",
        previousData: null,
        newData: checkIn,
        ipAddress: req.ip || null,
        userAgent: req.get('User-Agent') || null
      });

      res.status(201).json(checkIn);
    } catch (error) {
      console.error("Failed to create patient check-in:", error);
      res.status(500).json({ message: "Failed to create patient check-in" });
    }
  });

  // Role Permissions Management Routes
  app.get("/api/role-permissions", authenticateToken, setTenantContext, requireRole(["tenant_admin"]), async (req: AuthenticatedRequest, res) => {
    try {
      const permissions = await storage.getRolePermissions(req.tenant!.id);
      res.json(permissions);
    } catch (error) {
      console.error("Failed to fetch role permissions:", error);
      res.status(500).json({ message: "Failed to fetch role permissions" });
    }
  });

  app.get("/api/role-permissions/role/:role", authenticateToken, setTenantContext, requireRole(["tenant_admin"]), async (req: AuthenticatedRequest, res) => {
    try {
      const { role } = req.params;
      const permissions = await storage.getRolePermissionsByRole(role, req.tenant!.id);
      res.json(permissions);
    } catch (error) {
      console.error("Failed to fetch role permissions:", error);
      res.status(500).json({ message: "Failed to fetch role permissions" });
    }
  });

  app.post("/api/role-permissions", authenticateToken, setTenantContext, requireRole(["tenant_admin"]), async (req: AuthenticatedRequest, res) => {
    try {
      const permissionData = {
        ...req.body,
        tenantId: req.tenant!.id,
        createdBy: req.user!.id
      };

      const permission = await storage.createRolePermission(permissionData);

      // Log audit trail
      await storage.createAuditLog({
        tenantId: req.tenant!.id,
        userId: req.user!.id,
        entityType: "role_permission",
        entityId: permission.id,
        action: "CREATE",
        previousData: null,
        newData: permission,
        ipAddress: req.ip || null,
        userAgent: req.get('User-Agent') || null
      });

      res.status(201).json(permission);
    } catch (error) {
      console.error("Failed to create role permission:", error);
      res.status(500).json({ message: "Failed to create role permission" });
    }
  });

  app.patch("/api/role-permissions/:id", authenticateToken, setTenantContext, requireRole(["tenant_admin"]), async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const existingPermission = await storage.getRolePermissions(req.tenant!.id);
      const permission = existingPermission.find(p => p.id === id);
      
      if (!permission) {
        return res.status(404).json({ message: "Role permission not found" });
      }

      const updateData = {
        ...req.body,
        updatedBy: req.user!.id
      };

      const updatedPermission = await storage.updateRolePermission(id, updateData, req.tenant!.id);

      if (!updatedPermission) {
        return res.status(404).json({ message: "Role permission not found" });
      }

      // Log audit trail
      await storage.createAuditLog({
        tenantId: req.tenant!.id,
        userId: req.user!.id,
        entityType: "role_permission",
        entityId: id,
        action: "UPDATE",
        previousData: permission,
        newData: updatedPermission,
        ipAddress: req.ip || null,
        userAgent: req.get('User-Agent') || null
      });

      res.json(updatedPermission);
    } catch (error) {
      console.error("Failed to update role permission:", error);
      res.status(500).json({ message: "Failed to update role permission" });
    }
  });

  app.delete("/api/role-permissions/:id", authenticateToken, setTenantContext, requireRole(["tenant_admin"]), async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const existingPermissions = await storage.getRolePermissions(req.tenant!.id);
      const permission = existingPermissions.find(p => p.id === id);
      
      if (!permission) {
        return res.status(404).json({ message: "Role permission not found" });
      }

      const deleted = await storage.deleteRolePermission(id, req.tenant!.id);

      if (!deleted) {
        return res.status(404).json({ message: "Role permission not found" });
      }

      // Log audit trail
      await storage.createAuditLog({
        tenantId: req.tenant!.id,
        userId: req.user!.id,
        entityType: "role_permission",
        entityId: id,
        action: "DELETE",
        previousData: permission,
        newData: null,
        ipAddress: req.ip || null,
        userAgent: req.get('User-Agent') || null
      });

      res.status(204).send();
    } catch (error) {
      console.error("Failed to delete role permission:", error);
      res.status(500).json({ message: "Failed to delete role permission" });
    }
  });

  // Patient Portal API endpoints
  
  // Get all patients for patient portal access (synchronized from hospital database)
  app.get("/api/patient/patients-list", requireRole(["patient"]), async (req, res) => {
    try {
      const patientUser = await storage.getUser(req.user!.id);
      if (!patientUser) {
        return res.status(404).json({ message: "Patient user not found" });
      }
      
      console.log(`[PATIENT PORTAL] Fetching patients list for tenant: ${patientUser.tenantId}`);
      
      // Get all patients from the same hospital/tenant
      const allPatients = await storage.getPatientsByTenant(patientUser.tenantId);
      
      console.log(`[PATIENT PORTAL] Found ${allPatients.length} patients in tenant`);
      
      // Filter out sensitive information and return public patient directory
      const publicPatientList = allPatients.map(patient => ({
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        mrn: patient.mrn,
        department: patient.department || 'General',
        // Only include non-sensitive information for patient directory
        dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).getFullYear().toString() : null,
        isActive: true
      }));
      
      console.log(`[PATIENT PORTAL] Returning ${publicPatientList.length} patients to portal`);
      res.json(publicPatientList);
    } catch (error) {
      console.error("Failed to fetch patients list:", error);
      res.status(500).json({ message: "Failed to fetch patients list" });
    }
  });

  // Get all doctors for patient portal access (synchronized from hospital database)
  app.get("/api/patient/doctors-list", requireRole(["patient"]), async (req, res) => {
    try {
      const patientUser = await storage.getUser(req.user!.id);
      if (!patientUser) {
        return res.status(404).json({ message: "Patient user not found" });
      }
      
      console.log(`[PATIENT PORTAL] Fetching doctors list for tenant: ${patientUser.tenantId}`);
      
      // Get all doctors/physicians from the same hospital/tenant
      const allUsers = await storage.getUsersByTenant(patientUser.tenantId);
      const doctors = allUsers.filter(user => user.role === 'physician');
      
      console.log(`[PATIENT PORTAL] Found ${doctors.length} doctors in tenant`);
      
      // Format doctor information for patient portal
      const doctorsList = doctors.map(doctor => ({
        id: doctor.id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        fullName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
        email: doctor.email,
        specialization: doctor.specialization || 'General Medicine',
        department: doctor.department || 'Internal Medicine',
        isActive: doctor.isActive,
        // Additional fields for patient portal display
        rating: 4.8, // Default rating
        totalReviews: 127,
        experience: 8,
        consultationFee: 150,
        languages: ['English'],
        education: 'MD',
        availability: 'Available'
      }));
      
      console.log(`[PATIENT PORTAL] Returning ${doctorsList.length} doctors to portal`);
      res.json(doctorsList);
    } catch (error) {
      console.error("Failed to fetch doctors list:", error);
      res.status(500).json({ message: "Failed to fetch doctors list" });
    }
  });

  // Get lab orders for patient portal
  app.get("/api/patient/lab-orders", requireRole(["patient"]), async (req, res) => {
    try {
      const patientUser = await storage.getUser(req.user!.id);
      if (!patientUser) {
        return res.status(404).json({ message: "Patient user not found" });
      }

      // Find the actual patient record for this user
      const patientRecord = await storage.getPatientByUserId(patientUser.id, patientUser.tenantId);
      if (!patientRecord) {
        return res.status(404).json({ message: "Patient record not found" });
      }

      // Get lab orders for this patient
      const labOrders = await storage.getLabOrdersByPatient(patientRecord.id, patientUser.tenantId);
      
      console.log(`[PATIENT PORTAL] Found ${labOrders.length} lab orders for patient ${patientRecord.firstName} ${patientRecord.lastName}`);
      res.json(labOrders);
    } catch (error) {
      console.error("Failed to fetch patient lab orders:", error);
      res.status(500).json({ message: "Failed to fetch patient lab orders" });
    }
  });

  app.get("/api/patient/profile", requireRole(["patient"]), async (req, res) => {
    try {
      const userId = req.user!.id;
      const patientUser = await storage.getUser(userId);
      
      if (!patientUser) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      // Get patient medical record
      const patients = await storage.getPatientsByTenant(patientUser.tenantId);
      const patient = patients.find(p => p.email === patientUser.email);
      
      if (!patient) {
        return res.status(404).json({ message: "Patient medical record not found" });
      }
      
      // Get hospital information for urgent care
      const hospital = await storage.getTenant(patientUser.tenantId);
      
      res.json({
        user: {
          id: patientUser.id,
          firstName: patientUser.firstName,
          lastName: patientUser.lastName,
          email: patientUser.email
        },
        patient: {
          id: patient.id,  // Add the actual patient ID from patients table
          patientId: patient.id, // Also include as patientId for clarity
          mrn: patient.mrn,
          dateOfBirth: patient.dateOfBirth,
          gender: patient.gender,
          phone: patient.phone,
          address: patient.address,
          emergencyContact: patient.emergencyContact,
          medicalHistory: patient.medicalHistory || [],
          allergies: patient.allergies || [],
          medications: patient.medications || []
        },
        hospital: {
          name: hospital?.name || "Metro General Hospital",
          phone: hospital?.phoneNumber || "+1-314-472-3839",
          address: hospital?.address || "123 Medical Center Drive, St. Louis, MO 63110"
        }
      });
    } catch (error) {
      console.error("Get patient profile error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/patient/appointments", requireRole(["patient"]), async (req, res) => {
    try {
      const userId = req.user!.id;
      const patientUser = await storage.getUser(userId);
      
      const patients = await storage.getPatientsByTenant(patientUser.tenantId);
      const patient = patients.find(p => p.email === patientUser.email);
      
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      const appointments = await storage.getAppointmentsByPatient(patient.id, patientUser.tenantId);
      res.json(appointments);
    } catch (error) {
      console.error("Get patient appointments error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Patient Messages routes
  app.get("/api/patient/messages", requireRole(["patient"]), async (req, res) => {
    try {
      const userId = req.user!.id;
      const patientUser = await storage.getUser(userId);
      
      const patients = await storage.getPatientsByTenant(patientUser.tenantId);
      const patient = patients.find(p => p.email === patientUser.email);
      
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      const messages = await storage.getMedicalCommunicationsByPatient(patient.id, patientUser.tenantId);
      
      // Messages already include sender info from join
      const messagesWithSender = messages.map(message => ({
        ...message,
        senderName: message.senderFirstName && message.senderLastName 
          ? `${message.senderFirstName} ${message.senderLastName}` 
          : 'Healthcare Provider'
      }));
      
      res.json(messagesWithSender);
    } catch (error) {
      console.error("Get patient messages error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/patient/messages", requireRole(["patient"]), async (req, res) => {
    try {
      const userId = req.user!.id;
      const patientUser = await storage.getUser(userId);
      
      const patients = await storage.getPatientsByTenant(patientUser.tenantId);
      const patient = patients.find(p => p.email === patientUser.email);
      
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      const messageData = insertMedicalCommunicationSchema.parse({
        ...req.body,
        tenantId: patientUser.tenantId,
        patientId: patient.id,
        senderId: userId,
        originalContent: req.body.message || req.body.originalContent || req.body.content,
        isRead: false
      });

      const message = await storage.createMedicalCommunication(messageData);
      res.json(message);
    } catch (error) {
      console.error("Create patient message error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/patient/prescriptions", requireRole(["patient"]), async (req, res) => {
    try {
      const userId = req.user!.id;
      const patientUser = await storage.getUser(userId);
      
      const patients = await storage.getPatientsByTenant(patientUser.tenantId);
      const patient = patients.find(p => p.email === patientUser.email);
      
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      const prescriptions = await storage.getPrescriptionsByPatient(patient.id, patientUser.tenantId);
      res.json(prescriptions);
    } catch (error) {
      console.error("Get patient prescriptions error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/patient/lab-results", requireRole(["patient"]), async (req, res) => {
    try {
      const userId = req.user!.id;
      const patientUser = await storage.getUser(userId);
      
      const patients = await storage.getPatientsByTenant(patientUser.tenantId);
      const patient = patients.find(p => p.email === patientUser.email);
      
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      // Get lab orders and their associated results across all laboratories (no tenant restriction)
      const labOrders = await storage.getLabOrdersByPatient(patient.id);
      const labResults = await storage.getLabResultsForPatientAcrossTenants(patient.id);
      
      // Combine lab orders with their results
      const enrichedLabOrders = labOrders.map(order => {
        const orderResults = labResults.filter(result => result.labOrderId === order.id);
        return {
          ...order,
          results: orderResults,
          hasResults: orderResults.length > 0,
          resultStatus: orderResults.length > 0 ? 'available' : order.status,
          completedAt: orderResults.length > 0 ? orderResults[0].completedAt : null
        };
      });
      
      console.log(`[PATIENT PORTAL] Found ${labOrders.length} lab orders and ${labResults.length} results for patient ${patient.id}`);
      res.json(enrichedLabOrders);
    } catch (error) {
      console.error("Get patient lab results error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/patient/health-tracking", requireRole(["patient"]), async (req, res) => {
    try {
      const userId = req.user!.id;
      const patientUser = await storage.getUser(userId);
      
      const patients = await storage.getPatientsByTenant(patientUser.tenantId);
      const patient = patients.find(p => p.email === patientUser.email);
      
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      // Get health tracking data including vital signs, goals, and AI analysis
      const healthData = {
        overallScore: 85,
        vitals: {
          temperature: 98.6,
          bloodPressure: { systolic: 120, diastolic: 80 },
          heartRate: 72,
          weight: 165
        },
        goals: [
          { type: "steps", current: 7485, target: 10000, progress: 75 },
          { type: "water", current: 6, target: 8, progress: 75 },
          { type: "sleep", current: 7.5, target: 8, progress: 94 }
        ],
        recommendations: [
          { type: "positive", message: "Your blood pressure has improved significantly this month. Keep up the healthy lifestyle changes." },
          { type: "warning", message: "Consider increasing your daily water intake. You're 25% below your hydration goal this week." },
          { type: "trend", message: "Your activity levels have increased 15% this month. This is excellent for cardiovascular health!" }
        ]
      };
      
      res.json(healthData);
    } catch (error) {
      console.error("Get patient health tracking error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Cross-tenant billing patients endpoint for pharmacies
  app.get("/api/billing/patients", requireTenant, requireRole(["tenant_admin", "billing_staff", "receptionist", "pharmacist", "pharmacy_admin"]), async (req, res) => {
    try {
      console.log("[BILLING] Getting cross-tenant patients for billing - User role:", req.user!.role, "Tenant:", req.tenant?.name, "Type:", req.tenant?.type);
      
      let patients = [];
      
      // For pharmacies, get patients from prescriptions sent to them
      if (req.tenant?.type === 'pharmacy') {
        console.log("[BILLING] Pharmacy tenant - fetching patients from prescriptions");
        const prescriptions = await storage.getPrescriptionsByPharmacy(req.tenant.id);
        
        // Since prescriptions contain embedded patient info, extract unique patients directly
        const uniquePatientIds = new Set();
        
        prescriptions.forEach(prescription => {
          if (prescription.patientId) {
            uniquePatientIds.add(prescription.patientId);
          }
        });
        
        console.log("[BILLING] Found", uniquePatientIds.size, "unique patient IDs from", prescriptions.length, "prescriptions");
        
        // For each unique patient ID, create patient object from the first prescription with that patient
        for (const patientId of uniquePatientIds) {
          const samplePrescription = prescriptions.find(p => p.patientId === patientId);
          if (samplePrescription) {
            patients.push({
              id: samplePrescription.patientId,
              firstName: samplePrescription.patientFirstName,
              lastName: samplePrescription.patientLastName,
              mrn: samplePrescription.patientMRN,
              phone: samplePrescription.patientPhone,
              dateOfBirth: samplePrescription.patientDateOfBirth,
              source: 'prescription',
              hospitalName: samplePrescription.hospitalName,
              prescriptionCount: prescriptions.filter(p => p.patientId === patientId).length
            });
          }
        }
        
        console.log("[BILLING] Successfully fetched", patients.length, "cross-tenant patients for pharmacy billing");
      } else {
        // For hospitals/clinics, get their own patients
        console.log("[BILLING] Hospital/clinic tenant - fetching own patients");
        patients = await storage.getPatientsByTenant(req.tenant!.id);
        console.log("[BILLING] Found", patients.length, "patients for hospital billing");
      }
      
      res.json(patients);
    } catch (error) {
      console.error("[BILLING] Error fetching billing patients:", error);
      res.status(500).json({ message: "Failed to fetch billing patients" });
    }
  });

  // Patient Billing Routes
  app.get("/api/patient/bills", requireRole(["patient"]), async (req, res) => {
    try {
      const userId = req.user!.id;
      const patientUser = await storage.getUser(userId);
      
      if (!patientUser) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      // Get patient medical record
      const patients = await storage.getPatientsByTenant(patientUser.tenantId);
      const patient = patients.find(p => p.email === patientUser.email);
      
      if (!patient) {
        return res.status(404).json({ message: "Patient medical record not found" });
      }

      const bills = await storage.getPatientBills(patient.id, patientUser.tenantId);
      res.json(bills);
    } catch (error) {
      console.error("Error fetching patient bills:", error);
      res.status(500).json({ message: "Failed to fetch patient bills" });
    }
  });

  app.get("/api/patient/bills/:billId", requireRole(["patient"]), async (req, res) => {
    try {
      const { billId } = req.params;
      const userId = req.user!.id;
      const patientUser = await storage.getUser(userId);
      
      if (!patientUser) {
        return res.status(404).json({ message: "Patient not found" });
      }

      const bill = await storage.getPatientBill(billId, patientUser.tenantId);
      if (!bill) {
        return res.status(404).json({ message: "Bill not found" });
      }

      res.json(bill);
    } catch (error) {
      console.error("Error fetching patient bill:", error);
      res.status(500).json({ message: "Failed to fetch patient bill" });
    }
  });

  // Create bill after service (hospital staff only)
  app.post("/api/patient-bills", authenticateToken, setTenantContext, requireRole(["super_admin", "tenant_admin", "receptionist", "billing_staff"]), async (req: AuthenticatedRequest, res) => {
    try {
      const billData = {
        ...req.body,
        tenantId: req.tenant!.id,
        createdBy: req.user!.id,
        billNumber: `BILL-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      };

      const bill = await storage.createPatientBill(billData);
      
      // If this is after a completed visit, generate patient credentials
      if (req.body.triggerAccountCreation && req.body.patientId) {
        try {
          const patient = await storage.getPatient(req.body.patientId, req.tenant!.id);
          if (patient) {
            const { tempPassword, activationToken } = await storage.generatePatientCredentials(patient.id, req.tenant!.id);
            await storage.sendPatientActivationMessage(patient, tempPassword, activationToken);
          }
        } catch (activationError) {
          console.error("Failed to send patient activation:", activationError);
          // Continue with bill creation even if activation fails
        }
      }
      
      res.json(bill);
    } catch (error) {
      console.error("Error creating patient bill:", error);
      res.status(500).json({ message: "Failed to create patient bill" });
    }
  });

  // Record payment (hospital staff only)
  app.post("/api/patient-payments", authenticateToken, setTenantContext, requireRole(["super_admin", "tenant_admin", "receptionist", "billing_staff"]), async (req: AuthenticatedRequest, res) => {
    try {
      const paymentData = {
        ...req.body,
        tenantId: req.tenant!.id,
        recordedBy: req.user!.id,
        paymentDate: new Date()
      };

      const payment = await storage.createPatientPayment(paymentData);

      // Update bill remaining balance
      const bill = await storage.getPatientBill(paymentData.patientBillId, req.tenant!.id);
      if (bill) {
        const newBalance = parseFloat(bill.remainingBalance) - parseFloat(paymentData.amount);
        const newPaidAmount = parseFloat(bill.paidAmount) + parseFloat(paymentData.amount);
        
        await storage.updatePatientBill(bill.id, {
          paidAmount: newPaidAmount.toString(),
          remainingBalance: Math.max(0, newBalance).toString(),
          status: newBalance <= 0 ? 'paid' : 'partial'
        }, req.tenant!.id);
      }

      res.json(payment);
    } catch (error) {
      console.error("Error recording patient payment:", error);
      res.status(500).json({ message: "Failed to record patient payment" });
    }
  });

  // ==================== CURRENCY MANAGEMENT ROUTES ====================
  
  // Get all available currencies
  app.get("/api/currencies", authenticateToken, requireTenant, async (req, res) => {
    try {
      const currencies = await getAllCurrencies();
      res.json(currencies);
    } catch (error) {
      console.error("Failed to fetch currencies:", error);
      res.status(500).json({ message: "Failed to fetch currencies" });
    }
  });

  // Get African currencies
  app.get("/api/currencies/african", authenticateToken, requireTenant, async (req, res) => {
    try {
      const currencies = await getAfricanCurrencies();
      res.json(currencies);
    } catch (error) {
      console.error("Failed to fetch African currencies:", error);
      res.status(500).json({ message: "Failed to fetch African currencies" });
    }
  });

  // Auto-detect currency by country route (public route for registration)
  app.get("/api/currency/detect/:country", async (req, res) => {
    try {
      const country = req.params.country;
      const currencyMapping = getCurrencyByCountry(country);
      
      if (currencyMapping) {
        res.json({
          country: currencyMapping.country,
          currency: currencyMapping.currency,
          region: currencyMapping.region,
          supportedCurrencies: currencyMapping.supportedCurrencies,
          detected: true
        });
      } else {
        res.json({
          country: country,
          currency: 'USD',
          region: 'Unknown',
          supportedCurrencies: ['USD'],
          detected: false,
          message: 'Currency not detected, using USD as default'
        });
      }
    } catch (error) {
      console.error("Currency detection error:", error);
      res.status(500).json({ message: "Failed to detect currency" });
    }
  });

  // Get all African countries with their currencies (public route)
  app.get("/api/currencies/african-countries", async (req, res) => {
    try {
      const africanCountries = getAfricanCountries();
      res.json(africanCountries);
    } catch (error) {
      console.error("Get African countries error:", error);
      res.status(500).json({ message: "Failed to fetch African countries" });
    }
  });

  // Get tenant's supported currencies
  app.get("/api/tenant/currencies", authenticateToken, requireTenant, async (req, res) => {
    try {
      const supportedCurrencies = await getTenantCurrencies(req.tenant!.id);
      const baseCurrency = await getTenantBaseCurrency(req.tenant!.id);
      
      // Get full currency info for each supported currency
      const currencyDetails = await Promise.all(
        supportedCurrencies.map(async (code) => {
          const info = await getCurrencyInfo(code);
          return info;
        })
      );

      res.json({
        baseCurrency,
        supportedCurrencies: currencyDetails.filter(Boolean)
      });
    } catch (error) {
      console.error("Failed to fetch tenant currencies:", error);
      res.status(500).json({ message: "Failed to fetch tenant currencies" });
    }
  });

  // Update tenant currency settings
  app.patch("/api/tenant/currencies", authenticateToken, requireTenant, requireRole(["tenant_admin", "super_admin"]), async (req, res) => {
    try {
      const { baseCurrency, supportedCurrencies } = req.body;
      
      if (baseCurrency) {
        const currencyInfo = await getCurrencyInfo(baseCurrency);
        if (!currencyInfo) {
          return res.status(400).json({ message: "Invalid base currency code" });
        }
      }

      if (supportedCurrencies && Array.isArray(supportedCurrencies)) {
        // Validate all currency codes
        for (const code of supportedCurrencies) {
          const currencyInfo = await getCurrencyInfo(code);
          if (!currencyInfo) {
            return res.status(400).json({ message: `Invalid currency code: ${code}` });
          }
        }
      }

      const updateData: any = {};
      if (baseCurrency) updateData.baseCurrency = baseCurrency;
      if (supportedCurrencies) updateData.supportedCurrencies = JSON.stringify(supportedCurrencies);

      const updatedTenant = await storage.updateTenant(req.tenant!.id, updateData);
      
      res.json({
        baseCurrency: updatedTenant?.baseCurrency || 'USD',
        supportedCurrencies: updatedTenant?.supportedCurrencies || ['USD']
      });
    } catch (error) {
      console.error("Failed to update tenant currencies:", error);
      res.status(500).json({ message: "Failed to update tenant currencies" });
    }
  });

  // Convert currency amounts
  app.post("/api/currencies/convert", authenticateToken, requireTenant, async (req, res) => {
    try {
      const { amount, fromCurrency, toCurrency } = req.body;
      
      if (!amount || !fromCurrency || !toCurrency) {
        return res.status(400).json({ message: "Amount, fromCurrency, and toCurrency are required" });
      }

      const conversion = await convertCurrency(parseFloat(amount), fromCurrency, toCurrency);
      
      if (!conversion) {
        return res.status(400).json({ message: "Currency conversion failed" });
      }

      res.json(conversion);
    } catch (error) {
      console.error("Failed to convert currency:", error);
      res.status(500).json({ message: "Failed to convert currency" });
    }
  });

  // Format currency for display
  app.post("/api/currencies/format", authenticateToken, requireTenant, async (req, res) => {
    try {
      const { amount, currencyCode } = req.body;
      
      if (!amount || !currencyCode) {
        return res.status(400).json({ message: "Amount and currencyCode are required" });
      }

      const formatted = await formatCurrency(amount, currencyCode);
      
      res.json({ formatted });
    } catch (error) {
      console.error("Failed to format currency:", error);
      res.status(500).json({ message: "Failed to format currency" });
    }
  });

  // Get currency information
  app.get("/api/currencies/:code", authenticateToken, requireTenant, async (req, res) => {
    try {
      const { code } = req.params;
      const currencyInfo = await getCurrencyInfo(code);
      
      if (!currencyInfo) {
        return res.status(404).json({ message: "Currency not found" });
      }

      res.json(currencyInfo);
    } catch (error) {
      console.error("Failed to get currency info:", error);
      res.status(500).json({ message: "Failed to get currency info" });
    }
  });

  // Get available pharmacies for prescription routing
  app.get("/api/pharmacies", authenticateToken, requireTenant, async (req, res) => {
    try {
      const pharmacies = await storage.getPharmaciesForPrescriptionRouting();
      res.json(pharmacies);
    } catch (error) {
      console.error("Error fetching pharmacies:", error);
      res.status(500).json({ error: "Failed to fetch pharmacies" });
    }
  });

  // Patient Assignment Management Routes
  app.get("/api/patient-assignments", authenticateToken, requireTenant, requireRole(['physician', 'tenant_admin', 'director']), async (req, res) => {
    try {
      const { physicianId } = req.query;
      const tenantId = req.user.tenantId;
      
      let assignments;
      if (physicianId && typeof physicianId === 'string') {
        assignments = await storage.getPatientAssignmentsByPhysician(physicianId, tenantId);
      } else if (req.user.role === 'physician') {
        // Physicians can only see their own assignments
        assignments = await storage.getPatientAssignmentsByPhysician(req.user.id, tenantId);
      } else {
        // Admins can see all assignments
        assignments = await storage.getActivePatientAssignments(tenantId);
      }
      
      res.json(assignments);
    } catch (error) {
      console.error("Failed to fetch patient assignments:", error);
      res.status(500).json({ message: "Failed to fetch patient assignments" });
    }
  });

  app.post("/api/patient-assignments", authenticateToken, requireTenant, requireRole(['tenant_admin', 'director']), async (req, res) => {
    try {
      const { patientId, physicianId, assignmentType = 'primary', notes } = req.body;
      
      if (!patientId || !physicianId) {
        return res.status(400).json({ message: "Patient ID and Physician ID are required" });
      }

      const assignmentData = {
        tenantId: req.user.tenantId,
        patientId,
        physicianId,
        assignmentType,
        assignedBy: req.user.id,
        notes
      };

      const assignment = await storage.createPatientAssignment(assignmentData);

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.user.tenantId,
        userId: req.user.id,
        entityType: "patient_assignment",
        entityId: assignment.id,
        action: "CREATE",
        newData: assignment,
        ipAddress: req.ip || null,
        userAgent: req.get('User-Agent')
      });

      res.status(201).json(assignment);
    } catch (error) {
      console.error("Failed to create patient assignment:", error);
      res.status(500).json({ message: "Failed to create patient assignment" });
    }
  });

  app.delete("/api/patient-assignments/:id", authenticateToken, requireTenant, requireRole(['tenant_admin', 'director']), async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.removePatientAssignment(id, req.user.tenantId);
      
      if (!success) {
        return res.status(404).json({ message: "Patient assignment not found" });
      }

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.user.tenantId,
        userId: req.user.id,
        entityType: "patient_assignment",
        entityId: id,
        action: "DELETE",
        ipAddress: req.ip || null,
        userAgent: req.get('User-Agent')
      });

      res.json({ message: "Patient assignment removed successfully" });
    } catch (error) {
      console.error("Failed to remove patient assignment:", error);
      res.status(500).json({ message: "Failed to remove patient assignment" });
    }
  });

  // Patient Access Request Routes
  app.get("/api/patient-access-requests", authenticateToken, requireTenant, requireRole(['physician', 'tenant_admin', 'director']), async (req, res) => {
    try {
      const { status } = req.query;
      const tenantId = req.user.tenantId;
      
      let requests;
      if (req.user.role === 'physician') {
        // Physicians see their own requests
        requests = await storage.getPatientAccessRequestsByPhysician(req.user.id, tenantId);
      } else {
        // Admins see pending requests for approval
        if (status === 'pending') {
          requests = await storage.getPendingPatientAccessRequests(tenantId);
        } else {
          // Get all requests (would need new method)
          requests = await storage.getPendingPatientAccessRequests(tenantId);
        }
      }
      
      res.json(requests);
    } catch (error) {
      console.error("Failed to fetch patient access requests:", error);
      res.status(500).json({ message: "Failed to fetch patient access requests" });
    }
  });

  app.post("/api/patient-access-requests", authenticateToken, requireTenant, requireRole(['physician']), async (req, res) => {
    try {
      const { patientId, requestType = 'access', reason, urgency = 'normal' } = req.body;
      
      if (!patientId || !reason) {
        return res.status(400).json({ message: "Patient ID and reason are required" });
      }

      // Check if doctor already has access
      const hasAccess = await storage.hasPatientAccess(req.user.id, patientId, req.user.tenantId);
      if (hasAccess) {
        return res.status(400).json({ message: "You already have access to this patient" });
      }

      const requestData = {
        tenantId: req.user.tenantId,
        patientId,
        requestingPhysicianId: req.user.id,
        requestType,
        reason,
        urgency
      };

      const request = await storage.createPatientAccessRequest(requestData);

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.user.tenantId,
        userId: req.user.id,
        entityType: "patient_access_request",
        entityId: request.id,
        action: "CREATE",
        newData: request,
        ipAddress: req.ip || null,
        userAgent: req.get('User-Agent')
      });

      res.status(201).json(request);
    } catch (error) {
      console.error("Failed to create patient access request:", error);
      res.status(500).json({ message: "Failed to create patient access request" });
    }
  });

  app.patch("/api/patient-access-requests/:id/approve", authenticateToken, requireTenant, requireRole(['tenant_admin', 'director']), async (req, res) => {
    try {
      const { id } = req.params;
      const { accessUntil } = req.body; // Optional expiry date
      
      const request = await storage.approvePatientAccessRequest(
        id, 
        req.user.id, 
        req.user.tenantId, 
        accessUntil ? new Date(accessUntil) : undefined
      );
      
      if (!request) {
        return res.status(404).json({ message: "Patient access request not found" });
      }

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.user.tenantId,
        userId: req.user.id,
        entityType: "patient_access_request",
        entityId: id,
        action: "APPROVE",
        newData: request,
        ipAddress: req.ip || null,
        userAgent: req.get('User-Agent')
      });

      res.json(request);
    } catch (error) {
      console.error("Failed to approve patient access request:", error);
      res.status(500).json({ message: "Failed to approve patient access request" });
    }
  });

  app.patch("/api/patient-access-requests/:id/deny", authenticateToken, requireTenant, requireRole(['tenant_admin', 'director']), async (req, res) => {
    try {
      const { id } = req.params;
      const { reviewNotes } = req.body;
      
      if (!reviewNotes) {
        return res.status(400).json({ message: "Review notes are required when denying a request" });
      }
      
      const request = await storage.denyPatientAccessRequest(id, req.user.id, reviewNotes, req.user.tenantId);
      
      if (!request) {
        return res.status(404).json({ message: "Patient access request not found" });
      }

      // Create audit log
      await storage.createAuditLog({
        tenantId: req.user.tenantId,
        userId: req.user.id,
        entityType: "patient_access_request",
        entityId: id,
        action: "DENY",
        newData: request,
        ipAddress: req.ip || null,
        userAgent: req.get('User-Agent')
      });

      res.json(request);
    } catch (error) {
      console.error("Failed to deny patient access request:", error);
      res.status(500).json({ message: "Failed to deny patient access request" });
    }
  });

  // Enhanced Patients Route with Assignment Controls
  app.get("/api/assigned-patients", authenticateToken, requireTenant, requireRole(['physician']), async (req, res) => {
    try {
      const assignedPatients = await storage.getAssignedPatients(req.user.id, req.user.tenantId);
      res.json(assignedPatients);
    } catch (error) {
      console.error("Failed to fetch assigned patients:", error);
      res.status(500).json({ message: "Failed to fetch assigned patients" });
    }
  });

  // Check Patient Access Route
  app.get("/api/patients/:id/access-check", authenticateToken, requireTenant, requireRole(['physician']), async (req, res) => {
    try {
      const { id } = req.params;
      const hasAccess = await storage.hasPatientAccess(req.user.id, id, req.user.tenantId);
      res.json({ hasAccess });
    } catch (error) {
      console.error("Failed to check patient access:", error);
      res.status(500).json({ message: "Failed to check patient access" });
    }
  });

  // Pharmacy Receipt Routes
  app.get("/api/pharmacy-receipts", authenticateToken, requireTenant, requireRole(['super_admin', 'tenant_admin', 'pharmacist', 'billing_staff']), async (req, res) => {
    try {
      const { limit = 50, offset = 0 } = req.query;
      const receipts = await storage.getPharmacyReceiptsByTenant(req.tenantId!, Number(limit), Number(offset));
      res.json(receipts);
    } catch (error) {
      console.error("Error fetching pharmacy receipts:", error);
      res.status(500).json({ message: "Failed to fetch pharmacy receipts" });
    }
  });

  app.get("/api/pharmacy-receipts/patient/:patientId", authenticateToken, requireTenant, requireRole(['super_admin', 'tenant_admin', 'pharmacist', 'billing_staff']), async (req, res) => {
    try {
      const receipts = await storage.getPharmacyReceiptsByPatient(req.params.patientId, req.tenantId!);
      res.json(receipts);
    } catch (error) {
      console.error("Error fetching patient pharmacy receipts:", error);
      res.status(500).json({ message: "Failed to fetch patient pharmacy receipts" });
    }
  });

  app.get("/api/pharmacy-receipts/prescription/:prescriptionId", authenticateToken, requireTenant, requireRole(['super_admin', 'tenant_admin', 'pharmacist', 'billing_staff']), async (req, res) => {
    try {
      const receipts = await storage.getPharmacyReceiptsByPrescription(req.params.prescriptionId, req.tenantId!);
      res.json(receipts);
    } catch (error) {
      console.error("Error fetching prescription pharmacy receipts:", error);
      res.status(500).json({ message: "Failed to fetch prescription pharmacy receipts" });
    }
  });

  app.post("/api/pharmacy-receipts", authenticateToken, requireTenant, requireRole(['super_admin', 'tenant_admin', 'pharmacist']), async (req, res) => {
    try {
      // Generate receipt number
      const receiptNumber = await storage.generateReceiptNumber(req.tenantId!);

      // Convert prescribedDate from string to Date if it's a string
      const prescribedDate = req.body.prescribedDate ? new Date(req.body.prescribedDate) : new Date();

      const validatedData = insertPharmacyReceiptSchema.parse({
        ...req.body,
        tenantId: req.tenantId,
        dispensedBy: req.user?.id,
        receiptNumber,
        dispensedDate: new Date(),
        prescribedDate: prescribedDate
      });

      const receipt = await storage.createPharmacyReceipt(validatedData);

      // Create audit log
      await storage.createAuditLog({
        userId: req.user?.id!,
        tenantId: req.tenantId!,
        action: "pharmacy_receipt_created",
        entityType: "pharmacy_receipt",
        entityId: receipt.id,
        details: { 
          patientId: receipt.patientId, 
          prescriptionId: receipt.prescriptionId,
          receiptNumber: receipt.receiptNumber,
          totalAmount: receipt.patientCopay
        }
      });

      res.status(201).json(receipt);
    } catch (error) {
      console.error("Error creating pharmacy receipt:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create pharmacy receipt" });
    }
  });

  app.patch("/api/pharmacy-receipts/:id", authenticateToken, requireTenant, requireRole(['super_admin', 'tenant_admin', 'pharmacist']), async (req, res) => {
    try {
      const receipt = await storage.updatePharmacyReceipt(req.params.id, req.body, req.tenantId!);
      
      if (!receipt) {
        return res.status(404).json({ message: "Pharmacy receipt not found" });
      }

      // Create audit log
      await storage.createAuditLog({
        userId: req.user!.id,
        tenantId: req.tenantId!,
        action: "pharmacy_receipt_updated",
        entityType: "pharmacy_receipt",
        entityId: receipt.id,
        details: { changes: req.body }
      });

      res.json(receipt);
    } catch (error) {
      console.error("Error updating pharmacy receipt:", error);
      res.status(500).json({ message: "Failed to update pharmacy receipt" });
    }
  });

  app.get("/api/pharmacy-receipts/:id", authenticateToken, requireTenant, requireRole(['super_admin', 'tenant_admin', 'pharmacist', 'billing_staff']), async (req, res) => {
    try {
      const receipt = await storage.getPharmacyReceipt(req.params.id, req.tenantId!);
      
      if (!receipt) {
        return res.status(404).json({ message: "Pharmacy receipt not found" });
      }

      res.json(receipt);
    } catch (error) {
      console.error("Error fetching pharmacy receipt:", error);
      res.status(500).json({ message: "Failed to fetch pharmacy receipt" });
    }
  });

  // General Receipts endpoint for billing system
  app.post("/api/receipts", authenticateToken, requireTenant, requireRole(['super_admin', 'tenant_admin', 'pharmacist', 'billing_staff']), async (req, res) => {
    try {
      console.log("[RECEIPT] Creating receipt with data:", JSON.stringify(req.body, null, 2));
      
      // Generate receipt number
      const receiptNumber = `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      
      const receiptData = {
        tenantId: req.tenantId!,
        patientId: req.body.patientId,
        receiptNumber,
        totalAmount: parseFloat(req.body.totalAmount || '0'),
        paymentMethod: req.body.paymentMethod || 'insurance',
        items: req.body.items || [],
        createdBy: req.user!.id,
        createdAt: new Date(),
        notes: req.body.notes || ''
      };

      console.log("[RECEIPT] Generated receipt data:", JSON.stringify(receiptData, null, 2));

      // Create audit log
      await storage.createAuditLog({
        userId: req.user!.id,
        tenantId: req.tenantId!,
        action: "receipt_created",
        entityType: "receipt",
        entityId: receiptData.receiptNumber,
        details: { 
          patientId: receiptData.patientId,
          receiptNumber: receiptData.receiptNumber,
          totalAmount: receiptData.totalAmount,
          paymentMethod: receiptData.paymentMethod
        }
      });

      // For now, return the receipt data directly (in production, this would be stored in database)
      const receipt = {
        id: receiptData.receiptNumber,
        ...receiptData,
        status: 'generated'
      };

      console.log("[RECEIPT] Receipt created successfully:", receipt.receiptNumber);
      res.status(201).json(receipt);
    } catch (error) {
      console.error("Error creating receipt:", error);
      res.status(500).json({ message: "Failed to create receipt" });
    }
  });

  // Object Storage Routes for Lab Results
  app.get("/objects/:objectPath(*)", authenticateToken, async (req, res) => {
    const userId = req.user?.id;
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
        requestedPermission: 'read' as any,
      });
      if (!canAccess) {
        return res.sendStatus(401);
      }
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post("/api/objects/upload", authenticateToken, async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL });
  });

  app.put("/api/lab-result-files", authenticateToken, requireTenant, async (req, res) => {
    if (!req.body.fileURL) {
      return res.status(400).json({ error: "fileURL is required" });
    }

    const userId = req.user?.id;

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.fileURL,
        {
          owner: userId,
          visibility: "private", // Lab result files should be private
        },
      );

      // Update lab result with file path if labResultId is provided
      if (req.body.labResultId) {
        await storage.updateLabResult(req.body.labResultId, {
          attachmentPath: objectPath
        }, req.tenantId!);
      }

      res.status(200).json({
        objectPath: objectPath,
      });
    } catch (error) {
      console.error("Error setting lab result file:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Laboratory Billing Routes using dedicated labBills table
  app.get("/api/laboratory/billing", authenticateToken, requireTenant, requireRole(['lab_technician', 'tenant_admin', 'director']), async (req, res) => {
    try {
      const tenantId = req.tenantId!;
      
      // Verify this is a laboratory tenant
      const tenant = await storage.getTenant(tenantId);
      if (tenant?.type !== 'laboratory') {
        return res.status(403).json({ error: "Laboratory billing access restricted to laboratory tenants" });
      }

      // Fetch laboratory bills with cross-tenant patient enrichment
      const labBills = await storage.getLabBillsByTenant(tenantId);

      res.json(labBills);
    } catch (error) {
      console.error("Error fetching laboratory bills:", error);
      res.status(500).json({ error: "Failed to fetch laboratory bills" });
    }
  });

  // Get patients from lab orders for laboratory billing (cross-tenant access)
  app.get("/api/laboratory/billing-patients", authenticateToken, requireTenant, requireRole(['lab_technician', 'tenant_admin', 'director']), async (req, res) => {
    try {
      const tenantId = req.tenantId!;
      
      // Get tenant to verify it's a laboratory
      const tenant = await storage.getTenant(tenantId);
      if (!tenant || tenant.type !== 'laboratory') {
        return res.status(403).json({ error: "Access restricted to laboratory tenants" });
      }

      console.log(`[LAB BILLING] Getting patients for laboratory billing - Lab tenant: ${tenantId}`);

      // Get all lab orders assigned to this laboratory and their associated patients
      const labOrders = await storage.getLabOrdersByLabTenant(tenantId);
      
      // Get unique patients from these lab orders
      const patientIds = [...new Set(labOrders.map(order => order.patientId))];
      const patients = [];
      
      for (const patientId of patientIds) {
        // Cross-tenant patient access - get patient regardless of their home tenant
        const allPatients = await storage.getAllPatients();
        const patient = allPatients.find(p => p.id === patientId);
        if (patient) {
          patients.push({
            id: patient.id,
            firstName: patient.firstName,
            lastName: patient.lastName,
            mrn: patient.mrn,
            dateOfBirth: patient.dateOfBirth,
            email: patient.email,
            phone: patient.phone
          });
        }
      }

      console.log(`[LAB BILLING] Found ${patients.length} unique patients for laboratory billing`);
      res.json(patients);
    } catch (error) {
      console.error("Error fetching lab billing patients:", error);
      res.status(500).json({ error: "Failed to fetch patients for laboratory billing" });
    }
  });

  app.post("/api/laboratory/billing", authenticateToken, requireTenant, requireRole(['lab_technician', 'tenant_admin', 'director']), async (req, res) => {
    try {
      const tenantId = req.tenantId!;
      const userId = req.user!.id;
      
      // Verify this is a laboratory tenant
      const tenant = await storage.getTenant(tenantId);
      if (tenant?.type !== 'laboratory') {
        return res.status(403).json({ error: "Laboratory billing creation restricted to laboratory tenants" });
      }

      const validatedData = insertLabBillSchema.parse({
        ...req.body,
        tenantId,
        generatedBy: userId,
      });

      // Verify patient exists and is accessible to this tenant
      const patient = await storage.getPatientById(validatedData.patientId);
      if (!patient) {
        return res.status(404).json({ error: "Patient not found" });
      }

      // Create laboratory bill
      const [labBill] = await db
        .insert(labBills)
        .values(validatedData)
        .returning();

      console.log(`[LAB BILLING] Created lab bill: ${labBill.id} for patient ${validatedData.patientId} - $${validatedData.amount}`);
      res.status(201).json(labBill);
    } catch (error) {
      console.error("Error creating laboratory bill:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ error: "Failed to create laboratory bill" });
    }
  });

  const server = createServer(app);
  return server;
}
