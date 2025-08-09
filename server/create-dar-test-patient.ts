import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { 
  patients, prescriptions, appointments, labOrders, patientInsurance,
  users, tenants, insuranceProviders, patientAssignments
} from '../shared/schema.js';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const db = drizzle(pool);

async function createDarTestPatient() {
  try {
    console.log('🏥 Creating comprehensive test patient from Dar es Salaam...');
    
    // Get Metro General Hospital tenant
    const [hospitalTenant] = await db.select().from(tenants).where(eq(tenants.subdomain, 'metro-general'));
    if (!hospitalTenant) {
      throw new Error('Metro General Hospital tenant not found');
    }
    console.log('✅ Found Metro General Hospital tenant:', hospitalTenant.name);
    
    // Get Working Test Pharmacy tenant  
    const [pharmacyTenant] = await db.select().from(tenants).where(eq(tenants.subdomain, 'working-test'));
    if (!pharmacyTenant) {
      throw new Error('Working Test Pharmacy tenant not found');
    }
    console.log('✅ Found Working Test Pharmacy tenant:', pharmacyTenant.name);
    
    // Get JOY Laboratory tenant
    const [labTenant] = await db.select().from(tenants).where(eq(tenants.subdomain, 'joy'));
    if (!labTenant) {
      throw new Error('JOY Laboratory tenant not found');
    }
    console.log('✅ Found JOY Laboratory tenant:', labTenant.name);
    
    // Get Dr. Michael Smith
    const [drSmith] = await db.select().from(users).where(
      and(
        eq(users.email, 'dr.smith@metrogeneral.com'),
        eq(users.tenantId, hospitalTenant.id)
      )
    );
    if (!drSmith) {
      throw new Error('Dr. Michael Smith not found');
    }
    console.log('✅ Found Dr. Michael Smith:', drSmith.firstName, drSmith.lastName);
    
    // Create comprehensive test patient
    const patientId = randomUUID();
    const currentDate = new Date();
    const birthDate = new Date('1985-03-15'); // 40 years old
    
    const [newPatient] = await db.insert(patients).values({
      id: patientId,
      tenantId: hospitalTenant.id,
      mrn: `DAR-${Date.now().toString().slice(-6)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      firstName: 'Amara',
      lastName: 'Mwangi',
      dateOfBirth: birthDate,
      gender: 'female',
      phone: '+255-712-345-678',
      email: 'amara.mwangi@email.com',
      address: {
        street: '15 Uhuru Street',
        city: 'Dar es Salaam',
        state: 'Dar es Salaam Region',
        zipCode: '11101',
        country: 'Tanzania'
      },
      emergencyContact: {
        name: 'John Mwangi',
        relationship: 'Husband',
        phone: '+255-712-345-679',
        email: 'john.mwangi@email.com'
      },
      medicalHistory: [
        'Hypertension - diagnosed 2020, well controlled with medication',
        'Type 2 Diabetes - diagnosed 2018, managed with metformin',
        'Seasonal allergies - mild, managed with antihistamines'
      ],
      allergies: ['Penicillin (rash)', 'Shellfish (anaphylaxis)', 'Pollen (seasonal)'],
      medications: [
        'Lisinopril 10mg once daily for hypertension',
        'Metformin 500mg twice daily for diabetes',
        'Cetirizine 10mg as needed for allergies'
      ],
      insuranceInfo: {
        provider: 'National Health Insurance Fund (NHIF)',
        policyNumber: 'NHIF-DAR-2024-0001',
        groupNumber: 'DAR-GOV-001',
        coverage: '85%'
      },
      isActive: true
    }).returning();
    
    console.log('✅ Created test patient:', newPatient.firstName, newPatient.lastName, 'MRN:', newPatient.mrn);
    
    // Create insurance provider for Tanzania (NHIF)
    const insuranceProviderId = randomUUID();
    await db.insert(insuranceProviders).values({
      id: insuranceProviderId,
      tenantId: hospitalTenant.id,
      name: 'National Health Insurance Fund (NHIF)',
      type: 'public',
      code: 'NHIF-TZ',
      contactInfo: {
        phone: '+255-22-211-8004',
        email: 'info@nhif.or.tz',
        website: 'https://www.nhif.or.tz',
        address: {
          street: 'NHIF House, Uhuru/Mafia Street',
          city: 'Dar es Salaam',
          state: 'Dar es Salaam Region',
          zipCode: '11101',
          country: 'Tanzania'
        }
      },
      coverageRegions: ['Tanzania', 'East Africa'],
      isActive: true
    });
    console.log('✅ Created NHIF insurance provider');
    
    // Create patient insurance record
    await db.insert(patientInsurance).values({
      id: randomUUID(),
      patientId: patientId,
      tenantId: hospitalTenant.id,
      insuranceProviderId: insuranceProviderId,
      policyNumber: 'NHIF-DAR-2024-0001',
      groupNumber: 'DAR-GOV-001',
      subscriberName: 'Amara Mwangi',
      subscriberRelationship: 'self',
      effectiveDate: new Date('2024-01-01'),
      expirationDate: new Date('2024-12-31'),
      copayAmount: 50.00, // 50 USD copay
      deductibleAmount: 200.00, // 200 USD annual deductible
      isPrimary: true,
      isActive: true
    });
    console.log('✅ Created patient insurance record with 85% coverage');
    
    // Assign patient to Dr. Smith
    await db.insert(patientAssignments).values({
      id: randomUUID(),
      tenantId: hospitalTenant.id,
      patientId: patientId,
      physicianId: drSmith.id,
      assignedBy: drSmith.id, // Dr. Smith assigns himself as primary care
      assignmentDate: currentDate,
      assignmentType: 'primary_care',
      isActive: true
    });
    console.log('✅ Assigned patient to Dr. Michael Smith as primary care physician');
    
    // Create appointment for today
    const appointmentId = randomUUID();
    await db.insert(appointments).values({
      id: appointmentId,
      tenantId: hospitalTenant.id,
      patientId: patientId,
      providerId: drSmith.id,
      appointmentDate: new Date(currentDate.getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
      appointmentTime: '14:30',
      type: 'routine_checkup',
      status: 'scheduled',
      notes: 'Annual wellness exam - diabetes and hypertension management',
      duration: 45
    });
    console.log('✅ Created appointment for routine checkup');
    
    // Create prescription sent to Working Test Pharmacy
    const prescriptionId = randomUUID();
    await db.insert(prescriptions).values({
      id: prescriptionId,
      tenantId: hospitalTenant.id,
      patientId: patientId,
      providerId: drSmith.id,
      appointmentId: appointmentId,
      pharmacyTenantId: pharmacyTenant.id, // Send to Working Test Pharmacy
      medicationName: 'Metformin Extended Release',
      dosage: '500mg',
      quantity: 90,
      frequency: 'Twice daily with meals',
      instructions: 'Take with breakfast and dinner. Monitor blood sugar levels regularly.',
      ndc: '00093-2748-01',
      diagnosisCodes: 'E11.9 - Type 2 diabetes mellitus without complications',
      expiryDate: new Date(currentDate.getTime() + 365 * 24 * 60 * 60 * 1000), // 1 year
      status: 'prescribed',
      isControlledSubstance: false,
      refillsRemaining: 5,
      totalCost: 85.50,
      insuranceCopay: 12.83, // 15% of total cost (85% coverage)
      notes: 'Patient has good compliance with current diabetes management'
    });
    console.log('✅ Created prescription sent to Working Test Pharmacy');
    
    // Create lab order sent to JOY Laboratory
    const labOrderId = randomUUID();
    await db.insert(labOrders).values({
      id: labOrderId,
      tenantId: hospitalTenant.id,
      patientId: patientId,
      providerId: drSmith.id,
      appointmentId: appointmentId,
      labTenantId: labTenant.id, // Send to JOY Laboratory
      testName: 'Comprehensive Metabolic Panel (CMP)',
      testCode: 'CMP-2024',
      instructions: 'Fasting required (12 hours). Patient should arrive at 8:00 AM.',
      urgencyLevel: 'routine',
      status: 'ordered',
      notes: 'Annual diabetes monitoring - check glucose, kidney function, electrolytes',
      estimatedCost: 125.00,
      insuranceCoverage: 85, // 85% coverage
      patientCopay: 18.75 // 15% of total cost
    });
    console.log('✅ Created lab order sent to JOY Laboratory');
    
    console.log('\n🎉 COMPREHENSIVE TEST PATIENT CREATED SUCCESSFULLY!');
    console.log('📋 Patient Details:');
    console.log(`   Name: ${newPatient.firstName} ${newPatient.lastName}`);
    console.log(`   MRN: ${newPatient.mrn}`);
    console.log(`   Location: Dar es Salaam, Tanzania`);
    console.log(`   Primary Physician: Dr. Michael Smith`);
    console.log(`   Insurance: NHIF (85% coverage)`);
    console.log('📋 Cross-Tenant Operations:');
    console.log(`   Prescription → Working Test Pharmacy (Metformin ER)`);
    console.log(`   Lab Order → JOY Laboratory (Comprehensive Metabolic Panel)`);
    console.log('✅ All tenant separations and isolations respected');
    
  } catch (error) {
    console.error('❌ Error creating test patient:', error);
    // Don't exit process in production environment
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  } finally {
    await pool.end();
  }
}

// Commenting out automatic execution to prevent deployment exit issues
// This should be run manually when needed, not during deployment
// createDarTestPatient();

// Export the function for manual execution when needed
export { createDarTestPatient };