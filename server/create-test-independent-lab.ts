import { db } from './db';
import { tenants, users } from '../shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export async function createTestIndependentLab() {
  try {
    console.log("🧪 Creating test independent laboratory organization...");

    // Create independent laboratory tenant
    const existingLab = await db.select().from(tenants).where(eq(tenants.subdomain, 'precision-labs')).limit(1);
    
    let labTenant;
    if (existingLab.length === 0) {
      const [tenant] = await db.insert(tenants).values({
        name: "Precision Diagnostics Laboratory",
        type: "laboratory",
        subdomain: "precision-labs",
        organizationType: "independent", // Key: independent organization
        parentTenantId: null, // No parent hospital
        settings: {
          email: 'admin@precisionlabs.com',
          phone: '555-LAB-TEST',
          taxId: '44-PRECISION',
          address: '456 Science Drive, Lab City, LC 54321',
          website: 'https://precisionlabs.com',
          services: [
            'Clinical Chemistry',
            'Hematology',
            'Microbiology',
            'Pathology',
            'Molecular Diagnostics'
          ],
          cliaNumber: 'CLIA-PRECISION-456',
          description: 'Precision Diagnostics Laboratory - Independent full-service diagnostic laboratory',
          licenseNumber: 'LAB-PRECISION-456',
          operatingHours: 'Mon-Fri: 6AM-10PM, Sat: 7AM-6PM, Sun: 8AM-4PM',
          specializations: [
            'Clinical Chemistry',
            'Hematology', 
            'Microbiology',
            'Pathology',
            'Molecular Diagnostics',
            'Toxicology'
          ],
          accreditations: ['CAP', 'CLIA', 'ISO 15189'],
          features: ['lab_results', 'billing', 'quality_control', 'reporting']
        },
        isActive: true,
        description: "Independent full-service diagnostic laboratory with advanced testing capabilities",
        phoneNumber: "+1-555-LAB-TEST",
        address: "456 Science Drive, Lab City, LC 54321"
      }).returning();
      labTenant = tenant;
      console.log("✓ Created independent laboratory tenant: Precision Diagnostics Laboratory");
    } else {
      labTenant = existingLab[0];
      console.log("✓ Independent laboratory tenant already exists");
    }

    // Create laboratory admin
    const existingAdmin = await db.select().from(users).where(eq(users.email, 'admin@precisionlabs.com')).limit(1);
    
    if (existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash('lab123', 10);
      
      await db.insert(users).values({
        tenantId: labTenant.id,
        username: 'lab_admin',
        email: 'admin@precisionlabs.com',
        password: hashedPassword,
        firstName: 'Dr. Elena',
        lastName: 'Rodriguez',
        role: 'tenant_admin',
        isActive: true
      });
      
      console.log("✓ Created laboratory admin: admin@precisionlabs.com / lab123");
    } else {
      console.log("✓ Laboratory admin already exists");
    }

    // Create laboratory director
    const existingDirector = await db.select().from(users).where(eq(users.email, 'director@precisionlabs.com')).limit(1);
    
    if (existingDirector.length === 0) {
      const hashedPassword = await bcrypt.hash('director123', 10);
      
      await db.insert(users).values({
        tenantId: labTenant.id,
        username: 'lab_director',
        email: 'director@precisionlabs.com',
        password: hashedPassword,
        firstName: 'Dr. James',
        lastName: 'Chen',
        role: 'director',
        isActive: true
      });
      
      console.log("✓ Created laboratory director: director@precisionlabs.com / director123");
    } else {
      console.log("✓ Laboratory director already exists");
    }

    // Create lab technician
    const existingTech = await db.select().from(users).where(eq(users.email, 'tech@precisionlabs.com')).limit(1);
    
    if (existingTech.length === 0) {
      const hashedPassword = await bcrypt.hash('tech123', 10);
      
      await db.insert(users).values({
        tenantId: labTenant.id,
        username: 'lab_tech',
        email: 'tech@precisionlabs.com',
        password: hashedPassword,
        firstName: 'Lisa',
        lastName: 'Wang',
        role: 'lab_technician',
        isActive: true
      });
      
      console.log("✓ Created lab technician: tech@precisionlabs.com / tech123");
    } else {
      console.log("✓ Lab technician already exists");
    }

    // Create billing staff
    const existingBilling = await db.select().from(users).where(eq(users.email, 'billing@precisionlabs.com')).limit(1);
    
    if (existingBilling.length === 0) {
      const hashedPassword = await bcrypt.hash('billing123', 10);
      
      await db.insert(users).values({
        tenantId: labTenant.id,
        username: 'lab_billing',
        email: 'billing@precisionlabs.com',
        password: hashedPassword,
        firstName: 'Amanda',
        lastName: 'Thompson',
        role: 'billing_staff',
        isActive: true
      });
      
      console.log("✓ Created billing staff: billing@precisionlabs.com / billing123");
    } else {
      console.log("✓ Lab billing staff already exists");
    }

    console.log("\n🧪 PRECISION DIAGNOSTICS LABORATORY SETUP COMPLETE");
    console.log("==========================================");
    console.log("Organization Type: Independent Laboratory");
    console.log("Tenant ID:", labTenant.id);
    console.log("Subdomain: precision-labs");
    console.log("\nLogin Credentials:");
    console.log("Admin: admin@precisionlabs.com / lab123");
    console.log("Director: director@precisionlabs.com / director123");
    console.log("Technician: tech@precisionlabs.com / tech123");
    console.log("Billing: billing@precisionlabs.com / billing123");
    console.log("==========================================\n");

    return labTenant;

  } catch (error) {
    console.error("❌ Error creating independent laboratory:", error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createTestIndependentLab()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}