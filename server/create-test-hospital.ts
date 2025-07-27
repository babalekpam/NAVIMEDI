import { db } from "./db";
import { tenants, users } from "@shared/schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

export async function createTestHospital() {
  try {
    // Create hospital tenant
    const existingHospital = await db.select().from(tenants).where(eq(tenants.subdomain, 'metro-general')).limit(1);
    
    let hospitalTenant;
    if (existingHospital.length === 0) {
      const [tenant] = await db.insert(tenants).values({
        name: "Metro General Hospital",
        type: "hospital",
        subdomain: "metro-general",
        settings: {
          departments: ["Emergency", "Internal Medicine", "Cardiology", "Pediatrics", "Surgery"],
          features: ["patient_management", "appointments", "lab_orders", "prescriptions", "billing"]
        },
        isActive: true,
        description: "Full-service metropolitan hospital with emergency and specialty care",
        phoneNumber: "+1-555-HOSPITAL",
        address: "123 Medical Center Drive, Metro City, MC 12345"
      }).returning();
      hospitalTenant = tenant;
      console.log("✓ Created hospital tenant: Metro General Hospital");
    } else {
      hospitalTenant = existingHospital[0];
      console.log("✓ Hospital tenant already exists");
    }

    // Create hospital admin
    const existingAdmin = await db.select().from(users).where(eq(users.email, 'admin@metrogeneral.com')).limit(1);
    
    if (existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await db.insert(users).values({
        tenantId: hospitalTenant.id,
        username: 'hospital_admin',
        email: 'admin@metrogeneral.com',
        password: hashedPassword,
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'tenant_admin',
        isActive: true
      });
      
      console.log("✓ Created hospital admin: admin@metrogeneral.com");
    } else {
      console.log("✓ Hospital admin already exists");
    }

    // Create hospital receptionist
    const existingReceptionist = await db.select().from(users).where(eq(users.email, 'reception@metrogeneral.com')).limit(1);
    
    if (existingReceptionist.length === 0) {
      const hashedPassword = await bcrypt.hash('reception123', 10);
      
      await db.insert(users).values({
        tenantId: hospitalTenant.id,
        username: 'hospital_reception',
        email: 'reception@metrogeneral.com',
        password: hashedPassword,
        firstName: 'Maria',
        lastName: 'Rodriguez',
        role: 'receptionist',
        isActive: true
      });
      
      console.log("✓ Created hospital receptionist: reception@metrogeneral.com");
    } else {
      console.log("✓ Hospital receptionist already exists");
    }

    // Create hospital doctor
    const existingDoctor = await db.select().from(users).where(eq(users.email, 'dr.smith@metrogeneral.com')).limit(1);
    
    if (existingDoctor.length === 0) {
      const hashedPassword = await bcrypt.hash('doctor123', 10);
      
      await db.insert(users).values({
        tenantId: hospitalTenant.id,
        username: 'dr_smith',
        email: 'dr.smith@metrogeneral.com',
        password: hashedPassword,
        firstName: 'Michael',
        lastName: 'Smith',
        role: 'physician',
        isActive: true
      });
      
      console.log("✓ Created hospital doctor: dr.smith@metrogeneral.com");
    } else {
      console.log("✓ Hospital doctor already exists");
    }

    // Create hospital nurse
    const existingNurse = await db.select().from(users).where(eq(users.email, 'nurse.davis@metrogeneral.com')).limit(1);
    
    if (existingNurse.length === 0) {
      const hashedPassword = await bcrypt.hash('nurse123', 10);
      
      await db.insert(users).values({
        tenantId: hospitalTenant.id,
        username: 'nurse_davis',
        email: 'nurse.davis@metrogeneral.com',
        password: hashedPassword,
        firstName: 'Jennifer',
        lastName: 'Davis',
        role: 'nurse',
        isActive: true
      });
      
      console.log("✓ Created hospital nurse: nurse.davis@metrogeneral.com");
    } else {
      console.log("✓ Hospital nurse already exists");
    }

    console.log("✓ Metro General Hospital setup complete");
    return hospitalTenant;
  } catch (error) {
    console.error("❌ Hospital setup failed:", error);
    throw error;
  }
}