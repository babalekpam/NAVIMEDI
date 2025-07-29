import { storage } from "./storage";
import { db } from "./db";
import { patients, users } from "../shared/schema";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcrypt";

async function createPatientAccounts() {
  try {
    console.log("🏥 Creating patient user accounts linked to medical records...");

    // Get Metro General Hospital tenant
    const allTenants = await storage.getAllTenants();
    const hospitalTenant = allTenants.find(t => t.name === "Metro General Hospital");
    
    if (!hospitalTenant) {
      console.log("❌ Metro General Hospital tenant not found");
      return;
    }
    
    console.log("✅ Found Metro General Hospital:", hospitalTenant.name);

    // Find Sarah Johnson patient record
    const [sarahPatient] = await db.select()
      .from(patients)
      .where(and(
        eq(patients.firstName, "Sarah"),
        eq(patients.lastName, "Johnson"),
        eq(patients.tenantId, hospitalTenant.id)
      ));

    if (!sarahPatient) {
      console.log("❌ Sarah Johnson patient record not found");
      return;
    }

    // Find Michael Davis patient record  
    const [michaelPatient] = await db.select()
      .from(patients)
      .where(and(
        eq(patients.firstName, "Michael"),
        eq(patients.lastName, "Davis"),
        eq(patients.tenantId, hospitalTenant.id)
      ));

    if (!michaelPatient) {
      console.log("❌ Michael Davis patient record not found");
      return;
    }

    console.log(`✅ Found patient records: ${sarahPatient.firstName} ${sarahPatient.lastName}, ${michaelPatient.firstName} ${michaelPatient.lastName}`);

    // Create patient.sarah user account
    const existingSarah = await db.select().from(users).where(eq(users.username, 'patient.sarah')).limit(1);
    
    if (existingSarah.length === 0) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      await db.insert(users).values({
        tenantId: hospitalTenant.id,
        username: 'patient.sarah',
        email: sarahPatient.email || 'sarah.johnson@email.com',
        password: hashedPassword,
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'patient',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log("✅ Created patient.sarah user account linked to Sarah Johnson medical record");
    } else {
      console.log("✅ patient.sarah user account already exists");
    }

    // Create patient.michael user account
    const existingMichael = await db.select().from(users).where(eq(users.username, 'patient.michael')).limit(1);
    
    if (existingMichael.length === 0) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      await db.insert(users).values({
        tenantId: hospitalTenant.id,
        username: 'patient.michael',
        email: michaelPatient.email || 'michael.davis@email.com',
        password: hashedPassword,
        firstName: 'Michael',
        lastName: 'Davis',
        role: 'patient',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log("✅ Created patient.michael user account linked to Michael Davis medical record");
    } else {
      console.log("✅ patient.michael user account already exists");
    }

    console.log("✅ Patient user accounts creation complete!");
    console.log("🔑 Login Credentials:");
    console.log("   - Username: patient.sarah | Password: password123");
    console.log("   - Username: patient.michael | Password: password123");
    
  } catch (error) {
    console.error("❌ Failed to create patient accounts:", error);
  }
}

// Run the function
createPatientAccounts().then(() => {
  console.log("Patient accounts setup completed");
  process.exit(0);
}).catch(error => {
  console.error("Patient accounts setup failed:", error);
  process.exit(1);
});