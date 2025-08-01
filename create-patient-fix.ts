import { storage } from "./server/storage";

async function createPatientRecord() {
  try {
    
    // Get the patient user (ID from the logs)
    const userId = '0ecc4c64-6b22-4a6f-97fd-35f75393143e';
    const tenantId = '37a1f504-6f59-4d2f-9eec-d108cd2b83d7';
    
    const user = await storage.getUser(userId);
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ Found user:', user.firstName, user.lastName, user.email);
    
    // Check if patient record already exists
    const patients = await storage.getPatientsByTenant(tenantId);
    const existingPatient = patients.find(p => p.email === user.email);
    
    if (existingPatient) {
      console.log('✅ Patient record already exists:', existingPatient.firstName, existingPatient.lastName, 'MRN:', existingPatient.mrn);
      return;
    }
    
    // Create patient record
    const patientData = {
      tenantId: tenantId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: '+255123456789',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'male' as const,
      address: '123 Main St, Dar es Salaam, Tanzania',
      emergencyContact: 'John Doe - +255987654321',
      mrn: 'MRN' + Date.now(),
      medicalHistory: [],
      allergies: [],
      medications: []
    };
    
    const patient = await storage.createPatient(patientData);
    console.log('✅ Created patient record:', patient.firstName, patient.lastName, 'MRN:', patient.mrn);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createPatientRecord();