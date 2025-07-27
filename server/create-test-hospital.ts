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

    // Create additional doctors
    const additionalDoctors = [
      {
        email: 'dr.johnson@metrogeneral.com',
        username: 'dr_johnson',
        firstName: 'Michael',
        lastName: 'Johnson',
        specialty: 'Cardiology'
      },
      {
        email: 'dr.martinez@metrogeneral.com',
        username: 'dr_martinez',
        firstName: 'Sofia',
        lastName: 'Martinez',
        specialty: 'Pediatrics'
      },
      {
        email: 'dr.patel@metrogeneral.com',
        username: 'dr_patel',
        firstName: 'Raj',
        lastName: 'Patel',
        specialty: 'Emergency Medicine'
      },
      {
        email: 'dr.chen@metrogeneral.com',
        username: 'dr_chen',
        firstName: 'Lisa',
        lastName: 'Chen',
        specialty: 'Internal Medicine'
      },
      {
        email: 'dr.williams@metrogeneral.com',
        username: 'dr_williams',
        firstName: 'James',
        lastName: 'Williams',
        specialty: 'Surgery'
      }
    ];

    for (const doctor of additionalDoctors) {
      const existingDoctor = await db.select().from(users).where(eq(users.email, doctor.email)).limit(1);
      
      if (existingDoctor.length === 0) {
        const hashedPassword = await bcrypt.hash('doctor123', 10);
        
        await db.insert(users).values({
          tenantId: hospitalTenant.id,
          username: doctor.username,
          email: doctor.email,
          password: hashedPassword,
          firstName: doctor.firstName,
          lastName: doctor.lastName,
          role: 'physician',
          isActive: true
        });
        
        console.log(`✓ Created doctor: ${doctor.email} (${doctor.specialty})`);
      } else {
        console.log(`✓ Doctor already exists: ${doctor.email}`);
      }
    }

    console.log("✓ Metro General Hospital setup complete");
    return hospitalTenant;
  } catch (error) {
    console.error("❌ Hospital setup failed:", error);
    throw error;
  }
}