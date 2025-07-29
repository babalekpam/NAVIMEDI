import { db } from "./db";
import { patients, patientBills, users } from "../shared/schema";
import { eq, and } from "drizzle-orm";

async function createTestBill() {
  try {
    console.log("Creating test bill for patient.sarah...");
    
    // Find Sarah Johnson patient
    const [patient] = await db.select()
      .from(patients)
      .where(and(
        eq(patients.firstName, "Sarah"),
        eq(patients.lastName, "Johnson")
      ));
    
    if (!patient) {
      console.log("Patient Sarah Johnson not found");
      return;
    }
    
    console.log(`Found patient: ${patient.firstName} ${patient.lastName} (${patient.id})`);
    
    // Find a user to assign as creator (hospital admin)
    const [adminUser] = await db.select()
      .from(users)
      .where(and(
        eq(users.tenantId, patient.tenantId),
        eq(users.role, "tenant_admin")
      ));
    
    if (!adminUser) {
      console.log("No admin user found");
      return;
    }
    
    // Create a sample bill
    const billData = {
      tenantId: patient.tenantId,
      patientId: patient.id,
      billNumber: `BILL-${Date.now()}-TEST01`,
      description: "General Consultation Visit",
      serviceDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      currency: "USD" as const,
      originalAmount: "150.00",
      paidAmount: "0.00",
      remainingBalance: "150.00",
      status: "pending" as const,
      insuranceCovered: "120.00",
      patientResponsibility: "30.00",
      notes: "Regular checkup and consultation",
      lateFeesApplied: "0.00",
      createdBy: adminUser.id
    };
    
    const [bill] = await db.insert(patientBills).values(billData).returning();
    
    console.log(`✓ Test bill created: ${bill.billNumber}`);
    console.log(`  Amount: $${bill.originalAmount}`);
    console.log(`  Patient owes: $${bill.remainingBalance}`);
    console.log(`  Status: ${bill.status}`);
    
  } catch (error) {
    console.error("Error creating test bill:", error);
  }
}

createTestBill().then(() => {
  console.log("Test bill creation complete");
  process.exit(0);
}).catch(error => {
  console.error("Failed to create test bill:", error);
  process.exit(1);
});