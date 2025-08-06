import { storage } from "./storage";
import bcrypt from "bcrypt";

export async function createTestPatient() {
  try {
    // Get a hospital tenant to associate with the patient
    const hospitals = await storage.getAllTenants();
    const hospital = hospitals.find(t => t.type === 'hospital');
    
    if (!hospital) {
      console.log('No hospital tenant found, creating test hospital first...');
      return false;
    }

    // Check if Sarah Johnson already exists
    const allPatients = await storage.getAllPatients();
    const existingPatient = allPatients.find(p => p.mrn === 'MRN-789012345');
    if (existingPatient) {
      console.log('Sarah Johnson already exists with MRN: MRN-789012345');
      return existingPatient;
    }

    // Create test patient Sarah Johnson
    const testPatient = {
      tenantId: hospital.id, // Associated with hospital
      primaryHospitalId: hospital.id, // Primary hospital for Carnet access
      mrn: 'MRN-789012345', // Medical Record Number
      firstName: 'Sarah',
      lastName: 'Johnson',
      dateOfBirth: new Date('1985-03-15'),
      gender: 'female',
      phone: '+1-555-123-4567',
      email: 'sarah.johnson@example.com',
      address: {
        street: '123 Oak Street',
        city: 'Boston',
        state: 'MA',
        zipCode: '02101',
        country: 'USA'
      },
      emergencyContact: {
        name: 'Michael Johnson',
        relationship: 'spouse',
        phone: '+1-555-987-6543'
      },
      insuranceInfo: {
        provider: 'Blue Cross Blue Shield',
        policyNumber: 'BC123456789',
        groupNumber: 'GRP001',
        subscriberName: 'Sarah Johnson',
        effectiveDate: '2024-01-01',
        deductible: 1500,
        copay: 25
      },
      medicalHistory: [
        {
          condition: 'Hypertension',
          diagnosedDate: '2020-05-15',
          status: 'active',
          medications: ['Lisinopril 10mg']
        },
        {
          condition: 'Type 2 Diabetes',
          diagnosedDate: '2021-08-20',
          status: 'active', 
          medications: ['Metformin 500mg']
        }
      ],
      allergies: [
        {
          allergen: 'Penicillin',
          reaction: 'Rash',
          severity: 'moderate'
        },
        {
          allergen: 'Peanuts',
          reaction: 'Anaphylaxis',
          severity: 'severe'
        }
      ],
      medications: [
        {
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: 'once daily',
          prescribedBy: 'Dr. Smith',
          startDate: '2020-05-15',
          instructions: 'Take with food'
        },
        {
          name: 'Metformin',
          dosage: '500mg',
          frequency: 'twice daily',
          prescribedBy: 'Dr. Smith',
          startDate: '2021-08-20',
          instructions: 'Take with meals'
        }
      ],
      carnetEnabled: true, // Enable Carnet mobile app access
      carnetPassword: await bcrypt.hash('Sarah123!', 10), // Secure password for mobile app
      dataIsolationLevel: 'strict', // Strict data isolation for privacy
      privacyPreferences: {
        shareDataWithResearchers: false,
        allowFamilyAccess: false,
        marketingOptIn: false,
        telehealthConsent: true
      }
    };

    const patient = await storage.createPatient(testPatient);
    console.log(`✓ Created test patient Sarah Johnson with ID: ${patient.id}`);
    console.log(`  Hospital: ${hospital.name}`);
    console.log(`  MRN: ${patient.mrn}`);
    console.log(`  Carnet Access: ${patient.carnetEnabled ? 'Enabled' : 'Disabled'}`);
    
    return patient;
  } catch (error) {
    console.error('Error creating test patient:', error);
    return false;
  }
}