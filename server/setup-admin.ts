import { db } from "./db";
import { tenants, users } from "@shared/schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

export async function createPlatformAdmin() {
  try {
    // Create platform tenant (ARGILETTE)
    const existingTenant = await db.select().from(tenants).where(eq(tenants.subdomain, 'argilette')).limit(1);
    
    let platformTenant;
    if (existingTenant.length === 0) {
      const [tenant] = await db.insert(tenants).values({
        name: "ARGILETTE Platform",
        type: "platform", // Platform owner type
        subdomain: "argilette",
        settings: {
          isPlatformOwner: true,
          features: ["super_admin", "tenant_management", "multi_tenant", "cross_tenant_reporting"],
          description: "Healthcare technology platform provider and multi-tenant system owner"
        },
        isActive: true
      }).returning();
      platformTenant = tenant;
      console.log("✓ Created platform tenant: ARGILETTE");
    } else {
      platformTenant = existingTenant[0];
      console.log("✓ Platform tenant already exists");
    }

    // Create super admin user
    const existingAdmin = await db.select().from(users).where(eq(users.email, 'abel@argilette.com')).limit(1);
    
    if (existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash('Serrega1208@', 10);
      
      const [admin] = await db.insert(users).values({
        tenantId: platformTenant.id,
        username: 'abel_admin',
        email: 'abel@argilette.com',
        password: hashedPassword,
        firstName: 'Abel',
        lastName: 'Platform Admin',
        role: 'super_admin',
        isActive: true
      }).returning();
      
      console.log("✓ Created super admin user: abel@argilette.com");
      return admin;
    } else {
      console.log("✓ Super admin already exists");
      return existingAdmin[0];
    }
  } catch (error) {
    console.error("❌ Error creating platform admin:", error);
    throw error;
  }
}