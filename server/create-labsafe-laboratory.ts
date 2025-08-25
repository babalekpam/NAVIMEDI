import { eq } from "drizzle-orm";
import { db } from "./db";
import { tenants, users } from "@shared/schema";
import bcrypt from "bcrypt";

export async function createLabSafeLaboratory() {
  try {
    console.log("🧪 Creating LABSAFE Laboratory...");
    
    // Check if LABSAFE laboratory already exists
    const existingLab = await db.select().from(tenants).where(eq(tenants.subdomain, 'labsafe')).limit(1);
    
    let labTenant;
    if (existingLab.length === 0) {
      const [tenant] = await db.insert(tenants).values({
        name: "LABSAFE",
        type: "laboratory",
        subdomain: "labsafe",
        organizationType: "independent",
        parentTenantId: null,
        settings: {
          email: 'admin@labsafe.com',
          phone: '555-LAB-SAFE',
          taxId: '44-LABSAFE',
          address: '789 Research Boulevard, Science City, SC 98765',
          website: 'https://labsafe.com',
          services: [
            'Clinical Chemistry',
            'Hematology', 
            'Microbiology',
            'Molecular Diagnostics',
            'Pathology',
            'Toxicology',
            'Research Testing',
            'Environmental Testing',
            'Industrial Testing'
          ],
          cliaNumber: 'CLIA-LABSAFE-789',
          description: 'LABSAFE - Advanced Full-Service Laboratory with Comprehensive Testing Capabilities',
          licenseNumber: 'LAB-LABSAFE-789',
          operatingHours: 'Mon-Sun: 24/7 Operations',
          specializations: [
            'Clinical Chemistry',
            'Hematology',
            'Microbiology', 
            'Molecular Diagnostics',
            'Pathology',
            'Toxicology',
            'Research & Development',
            'Environmental Monitoring',
            'Industrial Testing',
            'Quality Control',
            'Automation & AI'
          ],
          accreditations: ['CAP', 'CLIA', 'ISO 15189', 'ISO 17025', 'FDA'],
          features: [
            'sample_management',
            'test_management', 
            'results_reporting',
            'analytics_insights',
            'quality_control',
            'inventory_management',
            'staff_scheduling',
            'equipment_management',
            'regulatory_compliance',
            'financial_management',
            'mobile_integration',
            'automation_ai',
            'research_protocols',
            'environmental_monitoring',
            'industrial_testing'
          ]
        },
        isActive: true,
        description: "LABSAFE - Advanced laboratory with comprehensive testing capabilities, automation, and AI-powered insights",
        phoneNumber: "+1-555-LAB-SAFE",
        address: "789 Research Boulevard, Science City, SC 98765",
        primaryColor: "#7c3aed", // Purple for lab
        secondaryColor: "#3b82f6",
        trialStartDate: new Date(),
        trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
        subscriptionStatus: "trial"
      }).returning();
      labTenant = tenant;
      console.log("✓ Created LABSAFE laboratory tenant");
    } else {
      labTenant = existingLab[0];
      console.log("✓ LABSAFE laboratory tenant already exists");
    }

    // Create admin user for LABSAFE
    const existingAdmin = await db.select().from(users).where(eq(users.email, 'admin@labsafe.com')).limit(1);
    
    if (existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash('LabSafe2025!', 10);
      
      const [adminUser] = await db.insert(users).values({
        email: 'admin@labsafe.com',
        hashedPassword,
        firstName: 'Lab',
        lastName: 'Administrator',
        role: 'tenant_admin',
        tenantId: labTenant.id,
        isEmailVerified: true,
        languagePreference: 'en'
      }).returning();
      
      console.log("✓ Created LABSAFE admin user: admin@labsafe.com / LabSafe2025!");
    } else {
      console.log("✓ LABSAFE admin user already exists");
    }

    console.log("🎉 LABSAFE Laboratory setup complete!");
    console.log("📧 Admin Login: admin@labsafe.com");
    console.log("🔑 Password: LabSafe2025!");
    console.log("🌐 Subdomain: labsafe");
    
    return labTenant;
  } catch (error) {
    console.error("Error creating LABSAFE laboratory:", error);
    throw error;
  }
}

// Auto-run the creation
createLabSafeLaboratory()
  .then(() => {
    console.log("LABSAFE laboratory creation completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to create LABSAFE laboratory:", error);
    process.exit(1);
  });