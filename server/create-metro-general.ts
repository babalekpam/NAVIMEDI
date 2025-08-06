import { storage } from "./storage";
import { generateTemporaryPassword } from "./email-service";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import { detectLocationFromRequest, generateTenantLocationConfig } from "./geo-location-service";

export async function createMetroGeneral() {
  try {
    // Check if Metro General already exists
    const hospitals = await storage.getAllTenants();
    const existing = hospitals.find(t => 
      t.name.toLowerCase().includes('metro') && 
      t.name.toLowerCase().includes('general')
    );
    
    if (existing) {
      console.log(`Metro General Hospital already exists: ${existing.name}`);
      return existing;
    }

    // Create Metro General Hospital tenant
    const hospitalData = {
      name: 'Metro General Hospital',
      subdomain: 'metro-general',
      type: 'hospital' as const,
      address: '1234 Medical Center Drive, Boston, MA 02101, USA',
      contactEmail: 'info@metrogeneral.com',
      contactPhone: '+1-617-555-0100',
      settings: {
        timeZone: 'America/New_York',
        currency: 'USD',
        language: 'en',
        features: {
          patientPortal: true,
          telemedicine: true,
          labResults: true,
          prescriptions: true,
          appointments: true,
          billing: true,
          carnetMobileApp: true
        }
      }
    };

    const hospital = await storage.createTenant(hospitalData);
    console.log(`✓ Created Metro General Hospital: ${hospital.id}`);

    // Create hospital administrator
    const adminPassword = generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const adminData = {
      id: nanoid(),
      tenantId: hospital.id,
      username: 'metro_admin',
      email: 'admin@metrogeneral.com',
      password: hashedPassword,
      firstName: 'Hospital',
      lastName: 'Administrator',
      role: 'tenant_admin' as const,
      isActive: true
    };

    const admin = await storage.createUser(adminData);
    console.log(`✓ Created hospital admin: admin@metrogeneral.com`);
    console.log(`  Password: ${adminPassword}`);

    return hospital;
  } catch (error) {
    console.error('Error creating Metro General Hospital:', error);
    return null;
  }
}