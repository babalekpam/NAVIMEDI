import bcrypt from "bcrypt";
import { storage } from "./storage.js";

async function createTestPharmacies() {
  console.log("Creating test pharmacy organizations...");

  const pharmacies = [
    {
      name: "Metro Pharmacy",
      subdomain: "metro-pharmacy",
      settings: {
        address: "123 Main Street, New York, NY 10001",
        phone: "(555) 123-4567",
        email: "info@metropharmacy.com",
        licenseNumber: "PH123456",
        deaNumber: "AB1234567",
        taxId: "12-3456789",
        services: [
          "Prescription Dispensing",
          "Medication Counseling",
          "Immunizations/Vaccinations",
          "Home Delivery",
          "24/7 Emergency Services"
        ],
        specializations: ["Diabetes Care", "Pain Management", "Geriatrics"],
        operatingHours: "Mon-Fri: 8AM-9PM, Sat: 9AM-7PM, Sun: 10AM-6PM",
        insuranceNetworks: ["Blue Cross Blue Shield", "Aetna", "Medicare", "Medicaid"],
        acceptsInsurance: true,
        description: "Full-service community pharmacy serving Manhattan with comprehensive medication management and clinical services.",
        website: "https://metropharmacy.com"
      },
      admin: {
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.johnson@metropharmacy.com",
        phone: "(555) 123-4568",
        licenseNumber: "RPH123456"
      }
    },
    {
      name: "Wellness Rx Pharmacy",
      subdomain: "wellness-rx",
      settings: {
        address: "456 Oak Avenue, Los Angeles, CA 90210",
        phone: "(555) 987-6543",
        email: "contact@wellnessrx.com",
        licenseNumber: "PH789012",
        deaNumber: "AB7890123",
        taxId: "98-7654321",
        services: [
          "Prescription Dispensing",
          "Compounding Services",
          "Specialty Medications",
          "Medication Therapy Management",
          "Clinical Consultations",
          "Medication Synchronization"
        ],
        specializations: ["Oncology", "Mental Health", "Cardiology", "Women's Health"],
        operatingHours: "Mon-Fri: 7AM-10PM, Sat-Sun: 9AM-8PM",
        insuranceNetworks: ["UnitedHealth", "Cigna", "Express Scripts", "CVS Caremark"],
        acceptsInsurance: true,
        description: "Specialized pharmacy focusing on complex medication management and clinical pharmacy services.",
        website: "https://wellnessrx.com"
      },
      admin: {
        firstName: "Michael",
        lastName: "Chen",
        email: "michael.chen@wellnessrx.com",
        phone: "(555) 987-6544",
        licenseNumber: "RPH789012"
      }
    },
    {
      name: "Community Care Pharmacy",
      subdomain: "community-care",
      settings: {
        address: "789 Elm Street, Chicago, IL 60601",
        phone: "(555) 456-7890",
        email: "support@communitycarerx.com",
        licenseNumber: "PH345678",
        deaNumber: "AB3456789",
        taxId: "34-5678901",
        services: [
          "Prescription Dispensing",
          "Medication Counseling",
          "Immunizations/Vaccinations",
          "Diabetes Care",
          "Blood Pressure Monitoring",
          "Home Delivery"
        ],
        specializations: ["Pediatrics", "Diabetes Care", "Respiratory Care"],
        operatingHours: "Mon-Fri: 8AM-8PM, Sat: 9AM-6PM, Sun: Closed",
        insuranceNetworks: ["Blue Cross Blue Shield", "Humana", "Medicare", "Medicaid"],
        acceptsInsurance: true,
        description: "Community-focused pharmacy providing personalized care and health services to local families.",
        website: "https://communitycarerx.com"
      },
      admin: {
        firstName: "Emily",
        lastName: "Rodriguez",
        email: "emily.rodriguez@communitycarerx.com",
        phone: "(555) 456-7891",
        licenseNumber: "RPH345678"
      }
    }
  ];

  for (const pharmacyData of pharmacies) {
    try {
      // Check if pharmacy already exists
      const existingTenants = await storage.getAllTenants();
      const existingPharmacy = existingTenants.find(t => t.subdomain === pharmacyData.subdomain);
      
      if (existingPharmacy) {
        console.log(`✓ Pharmacy ${pharmacyData.name} already exists`);
        continue;
      }

      // Create tenant
      const tenant = await storage.createTenant({
        name: pharmacyData.name,
        type: "pharmacy",
        subdomain: pharmacyData.subdomain,
        settings: pharmacyData.settings
      });

      // Generate password and create admin user
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      const adminUser = await storage.createUser({
        tenantId: tenant.id,
        username: pharmacyData.admin.email,
        email: pharmacyData.admin.email,
        password: hashedPassword,
        firstName: pharmacyData.admin.firstName,
        lastName: pharmacyData.admin.lastName,
        role: "tenant_admin",
        isActive: true
      });

      console.log(`✓ Created pharmacy: ${pharmacyData.name}`);
      console.log(`  Subdomain: ${pharmacyData.subdomain}.navimed.app`);
      console.log(`  Admin: ${pharmacyData.admin.email} / ${tempPassword}`);
      console.log(`  Services: ${pharmacyData.settings.services.length} services offered`);
      console.log("");

    } catch (error) {
      console.error(`✗ Failed to create pharmacy ${pharmacyData.name}:`, error);
    }
  }

  console.log("Test pharmacy creation complete!");
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createTestPharmacies().catch(console.error);
}

export { createTestPharmacies };