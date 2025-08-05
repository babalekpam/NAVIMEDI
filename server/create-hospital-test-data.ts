import { db } from "./db";
import { patients, appointments, labOrders, prescriptions, users, tenants } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

export async function createHospitalTestData() {
  try {
    console.log("Creating hospital test data...");

    // Find Metro General Hospital tenant
    const [hospital] = await db.select().from(tenants).where(eq(tenants.name, "Metro General Hospital"));
    if (!hospital) {
      console.log("Metro General Hospital not found, skipping test data creation");
      return;
    }

    console.log(`Found hospital: ${hospital.name} (${hospital.id})`);

    // Create test patients for the hospital
    const testPatients = [
      {
        firstName: "John",
        lastName: "Smith",
        email: "john.smith@email.com",
        phone: "+1-555-0101",
        dateOfBirth: new Date("1985-03-15"),
        gender: "male" as const,
        address: "123 Main St, City, State 12345",
        emergencyContact: "Jane Smith - (555) 0102",
        insuranceProvider: "Blue Cross Blue Shield",
        insurancePolicyNumber: "BC123456789",
        medicalHistory: "Hypertension, Diabetes Type 2",
        allergies: "Penicillin",
        tenantId: hospital.id,
      },
      {
        firstName: "Maria",
        lastName: "Garcia",
        email: "maria.garcia@email.com",
        phone: "+1-555-0103",
        dateOfBirth: new Date("1990-07-22"),
        gender: "female" as const,
        address: "456 Oak Ave, City, State 12345",
        emergencyContact: "Carlos Garcia - (555) 0104",
        insuranceProvider: "Aetna",
        insurancePolicyNumber: "AET987654321",
        medicalHistory: "Asthma",
        allergies: "Shellfish",
        tenantId: hospital.id,
      },
      {
        firstName: "Robert",
        lastName: "Johnson",
        email: "robert.johnson@email.com",
        phone: "+1-555-0105",
        dateOfBirth: new Date("1975-12-08"),
        gender: "male" as const,
        address: "789 Pine St, City, State 12345",
        emergencyContact: "Lisa Johnson - (555) 0106",
        insuranceProvider: "UnitedHealth",
        insurancePolicyNumber: "UH456789123",
        medicalHistory: "High cholesterol, Previous heart surgery",
        allergies: "None known",
        tenantId: hospital.id,
      }
    ];

    // Insert patients
    const insertedPatients = await db.insert(patients).values(testPatients).returning();
    console.log(`Created ${insertedPatients.length} test patients`);

    // Create a test doctor for the hospital
    const hashedPassword = await bcrypt.hash("doctor123", 10);
    const testDoctor = {
      email: "dr.wilson@metrogeneralhospital.com",
      password: hashedPassword,
      firstName: "James",
      lastName: "Wilson",
      role: "physician" as const,
      tenantId: hospital.id,
      isActive: true,
    };

    const [insertedDoctor] = await db.insert(users).values(testDoctor).returning();
    console.log(`Created test doctor: Dr. ${insertedDoctor.firstName} ${insertedDoctor.lastName}`);

    // Create test appointments for today and this week
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const testAppointments = [
      {
        patientId: insertedPatients[0].id,
        providerId: insertedDoctor.id,
        appointmentDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0),
        type: "consultation",
        status: "scheduled" as const,
        chiefComplaint: "Annual checkup",
        tenantId: hospital.id,
      },
      {
        patientId: insertedPatients[1].id,
        providerId: insertedDoctor.id,
        appointmentDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 30),
        type: "follow-up",
        status: "scheduled" as const,
        chiefComplaint: "Asthma management",
        tenantId: hospital.id,
      },
      {
        patientId: insertedPatients[2].id,
        providerId: insertedDoctor.id,
        appointmentDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0),
        type: "emergency",
        status: "urgent" as const,
        chiefComplaint: "Chest pain",
        tenantId: hospital.id,
      },
      {
        patientId: insertedPatients[0].id,
        providerId: insertedDoctor.id,
        appointmentDate: tomorrow,
        type: "consultation",
        status: "scheduled" as const,
        chiefComplaint: "Follow-up blood work",
        tenantId: hospital.id,
      }
    ];

    const insertedAppointments = await db.insert(appointments).values(testAppointments).returning();
    console.log(`Created ${insertedAppointments.length} test appointments`);

    // Create test lab orders
    const testLabOrders = [
      {
        patientId: insertedPatients[0].id,
        providerId: insertedDoctor.id,
        testType: "Complete Blood Count",
        status: "pending" as const,
        priority: "routine" as const,
        notes: "Annual screening",
        tenantId: hospital.id,
      },
      {
        patientId: insertedPatients[1].id,
        providerId: insertedDoctor.id,
        testType: "Chest X-Ray",
        status: "pending" as const,
        priority: "urgent" as const,
        notes: "Evaluate asthma symptoms",
        tenantId: hospital.id,
      },
      {
        patientId: insertedPatients[2].id,
        providerId: insertedDoctor.id,
        testType: "Cardiac Enzymes",
        status: "pending" as const,
        priority: "stat" as const,
        notes: "Rule out myocardial infarction",
        tenantId: hospital.id,
      }
    ];

    const insertedLabOrders = await db.insert(labOrders).values(testLabOrders).returning();
    console.log(`Created ${insertedLabOrders.length} test lab orders`);

    // Create test prescriptions
    const testPrescriptions = [
      {
        patientId: insertedPatients[0].id,
        providerId: insertedDoctor.id,
        medicationName: "Lisinopril",
        dosage: "10mg",
        frequency: "Once daily",
        duration: "30 days",
        instructions: "Take with food",
        status: "active" as const,
        tenantId: hospital.id,
      },
      {
        patientId: insertedPatients[1].id,
        providerId: insertedDoctor.id,
        medicationName: "Albuterol Inhaler",
        dosage: "90mcg",
        frequency: "As needed",
        duration: "30 days",
        instructions: "Use for shortness of breath",
        status: "active" as const,
        tenantId: hospital.id,
      },
      {
        patientId: insertedPatients[2].id,
        providerId: insertedDoctor.id,
        medicationName: "Aspirin",
        dosage: "81mg",
        frequency: "Once daily",
        duration: "90 days",
        instructions: "Take with food to prevent stomach upset",
        status: "active" as const,
        tenantId: hospital.id,
      }
    ];

    const insertedPrescriptions = await db.insert(prescriptions).values(testPrescriptions).returning();
    console.log(`Created ${insertedPrescriptions.length} test prescriptions`);

    console.log("✅ Hospital test data creation completed successfully");
    return {
      patients: insertedPatients.length,
      appointments: insertedAppointments.length,
      labOrders: insertedLabOrders.length,
      prescriptions: insertedPrescriptions.length,
      doctor: 1
    };

  } catch (error) {
    console.error("❌ Error creating hospital test data:", error);
    throw error;
  }
}

// ES module export
export default createHospitalTestData;