import { storage } from "./storage";
import { db } from "./db";

async function createTestPrescriptions() {
  try {
    console.log("🏥 Creating test prescriptions with pharmacy routing...");

    // Get pharmacy tenant (working-test)
    const allTenants = await storage.getAllTenants();
    console.log("Available tenants:", allTenants.map(t => `${t.name} (${t.type})`));
    const pharmacyTenant = allTenants.find(t => t.name.toLowerCase().includes("working") && t.type === "pharmacy");
    
    if (!pharmacyTenant) {
      console.log("❌ Pharmacy tenant not found");
      return;
    }
    
    console.log("✅ Found pharmacy tenant:", pharmacyTenant.name);

    // Get a hospital/clinic tenant to create prescriptions from
    const hospitalTenant = allTenants.find(t => t.type === "hospital" || t.type === "clinic");
    
    if (!hospitalTenant) {
      console.log("❌ Hospital/clinic tenant not found");
      return;
    }
    
    console.log("✅ Found hospital tenant:", hospitalTenant.name);

    // Get users from hospital tenant
    const hospitalUsers = await storage.getUsersByTenant(hospitalTenant.id);
    const doctor = hospitalUsers.find(u => u.role === "physician" || u.role === "tenant_admin");
    
    if (!doctor) {
      console.log("❌ Doctor not found in hospital tenant");
      return;
    }
    
    console.log("✅ Found doctor:", doctor.username);

    // Get patients from hospital tenant
    const hospitalPatients = await storage.getPatientsByTenant(hospitalTenant.id, 5);
    
    if (hospitalPatients.length === 0) {
      console.log("❌ No patients found in hospital tenant");
      return;
    }
    
    console.log("✅ Found patients:", hospitalPatients.length);

    // Create test prescriptions sent to pharmacy
    const testPrescriptions = [
      {
        tenantId: hospitalTenant.id,
        patientId: hospitalPatients[0].id,
        providerId: doctor.id,
        pharmacyTenantId: pharmacyTenant.id, // Route to pharmacy
        medicationName: "Lisinopril",
        dosage: "10mg",
        frequency: "Once daily",
        quantity: 30,
        refills: 3,
        instructions: "Take with food in the morning",
        status: "sent_to_pharmacy" as const,
        prescribedDate: new Date(),
        sentToPharmacyDate: new Date(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
      },
      {
        tenantId: hospitalTenant.id,
        patientId: hospitalPatients[0].id,
        providerId: doctor.id,
        pharmacyTenantId: pharmacyTenant.id,
        medicationName: "Metformin",
        dosage: "500mg",
        frequency: "Twice daily",
        quantity: 60,
        refills: 5,
        instructions: "Take with meals",
        status: "sent_to_pharmacy" as const,
        prescribedDate: new Date(),
        sentToPharmacyDate: new Date(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      }
    ];

    if (hospitalPatients[1]) {
      testPrescriptions.push({
        tenantId: hospitalTenant.id,
        patientId: hospitalPatients[1].id,
        providerId: doctor.id,
        pharmacyTenantId: pharmacyTenant.id,
        medicationName: "Atorvastatin",
        dosage: "20mg",
        frequency: "Once daily at bedtime",
        quantity: 30,
        refills: 2,
        instructions: "Take in the evening",
        status: "sent_to_pharmacy" as const,
        prescribedDate: new Date(),
        sentToPharmacyDate: new Date(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      });
    }

    // Create the prescriptions
    for (const prescriptionData of testPrescriptions) {
      const prescription = await storage.createPrescription(prescriptionData);
      console.log(`✅ Created prescription: ${prescription.medicationName} for patient ${prescriptionData.patientId}`);
    }

    console.log("🎉 Test prescriptions created successfully!");
    console.log(`📋 Created ${testPrescriptions.length} prescriptions routed to pharmacy: ${pharmacyTenant.name}`);
    
  } catch (error) {
    console.error("❌ Error creating test prescriptions:", error);
  }
}

// Run if this file is executed directly
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (import.meta.url === `file://${process.argv[1]}`) {
  createTestPrescriptions().then(() => {
    console.log("✅ Test prescription creation completed");
    process.exit(0);
  }).catch((error) => {
    console.error("❌ Failed to create test prescriptions:", error);
    process.exit(1);
  });
}

export { createTestPrescriptions };