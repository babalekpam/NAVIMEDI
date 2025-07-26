import { storage } from "./storage";

async function createTestPharmacies() {
  try {
    // Get all tenants to create pharmacies for each
    const tenants = await storage.getAllTenants();
    
    for (const tenant of tenants) {
      if (tenant.type === 'platform') continue; // Skip platform tenant
      
      // Create test pharmacies for each healthcare tenant
      const pharmacies = [
        {
          tenantId: tenant.id,
          name: "CVS Pharmacy - Main Street",
          licenseNumber: "PH-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
          npiNumber: "1234567890",
          contactPerson: "Dr. Emily Rodriguez",
          phone: "(555) 123-4567",
          email: "contact@cvs-main.com",
          faxNumber: "(555) 123-4568",
          address: {
            street: "1250 Main Street",
            city: "Springfield",
            state: "CA",
            zipCode: "90210",
            country: "USA"
          },
          acceptsInsurance: true,
          deliveryService: true,
          operatingHours: {
            monday: { open: "08:00", close: "22:00" },
            tuesday: { open: "08:00", close: "22:00" },
            wednesday: { open: "08:00", close: "22:00" },
            thursday: { open: "08:00", close: "22:00" },
            friday: { open: "08:00", close: "22:00" },
            saturday: { open: "09:00", close: "21:00" },
            sunday: { open: "10:00", close: "20:00" }
          },
          specializations: ["General Pharmacy", "Vaccinations", "Compounding"],
          websiteUrl: "https://cvs.com/pharmacy-main"
        },
        {
          tenantId: tenant.id,
          name: "Walgreens Express",
          licenseNumber: "PH-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
          npiNumber: "9876543210",
          contactPerson: "PharmD Sarah Johnson",
          phone: "(555) 987-6543",
          email: "pharmacy@walgreens-express.com",
          faxNumber: "(555) 987-6544",
          address: {
            street: "820 Oak Avenue",
            city: "Springfield",
            state: "CA",
            zipCode: "90211",
            country: "USA"
          },
          acceptsInsurance: true,
          deliveryService: false,
          operatingHours: {
            monday: { open: "07:00", close: "23:00" },
            tuesday: { open: "07:00", close: "23:00" },
            wednesday: { open: "07:00", close: "23:00" },
            thursday: { open: "07:00", close: "23:00" },
            friday: { open: "07:00", close: "23:00" },
            saturday: { open: "08:00", close: "22:00" },
            sunday: { open: "09:00", close: "21:00" }
          },
          specializations: ["General Pharmacy", "Diabetes Care", "Blood Pressure Monitoring"],
          websiteUrl: "https://walgreens.com/express"
        },
        {
          tenantId: tenant.id,
          name: "Community Care Pharmacy",
          licenseNumber: "PH-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
          npiNumber: "5432109876",
          contactPerson: "Dr. Michael Chen",
          phone: "(555) 456-7890",
          email: "info@communitycare-rx.com",
          faxNumber: "(555) 456-7891",
          address: {
            street: "1455 Elm Street, Suite 105",
            city: "Springfield",
            state: "CA",
            zipCode: "90212",
            country: "USA"
          },
          acceptsInsurance: true,
          deliveryService: true,
          operatingHours: {
            monday: { open: "09:00", close: "18:00" },
            tuesday: { open: "09:00", close: "18:00" },
            wednesday: { open: "09:00", close: "18:00" },
            thursday: { open: "09:00", close: "18:00" },
            friday: { open: "09:00", close: "18:00" },
            saturday: { open: "10:00", close: "16:00" }
          },
          specializations: ["Clinical Consultation", "Medication Therapy Management", "Specialty Medications"],
          websiteUrl: "https://communitycare-pharmacy.com"
        }
      ];

      for (const pharmacyData of pharmacies) {
        try {
          await storage.createPharmacy(pharmacyData);
          console.log(`✓ Created pharmacy: ${pharmacyData.name} for tenant: ${tenant.name}`);
        } catch (error) {
          console.error(`✗ Failed to create pharmacy ${pharmacyData.name}:`, error);
        }
      }
    }
    
    console.log("✓ Test pharmacy data creation completed");
  } catch (error) {
    console.error("Error creating test pharmacies:", error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createTestPharmacies().then(() => process.exit(0));
}

export { createTestPharmacies };