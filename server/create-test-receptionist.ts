import { db } from "./db";
import { tenants, users } from "@shared/schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

export async function createTestReceptionist() {
  try {
    // Find the working-test tenant
    const [workingTestTenant] = await db.select().from(tenants).where(eq(tenants.subdomain, 'working-test')).limit(1);
    
    if (!workingTestTenant) {
      console.log("❌ Working test tenant not found");
      return;
    }

    // Check if receptionist already exists
    const existingReceptionist = await db.select().from(users).where(eq(users.email, 'receptionist@workingtest.com')).limit(1);
    
    if (existingReceptionist.length === 0) {
      const hashedPassword = await bcrypt.hash('receptionist123', 10);
      
      const [receptionist] = await db.insert(users).values({
        tenantId: workingTestTenant.id,
        username: 'receptionist_user',
        email: 'receptionist@workingtest.com',
        password: hashedPassword,
        firstName: 'Sarah',
        lastName: 'Receptionist',
        role: 'receptionist',
        isActive: true
      }).returning();
      
      console.log("✓ Created test receptionist user: receptionist@workingtest.com");
      return receptionist;
    } else {
      console.log("✓ Test receptionist already exists");
      return existingReceptionist[0];
    }
  } catch (error) {
    console.error("❌ Error creating test receptionist:", error);
    throw error;
  }
}

// Run if this file is executed directly
if (require.main === module) {
  createTestReceptionist();
}