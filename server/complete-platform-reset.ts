import { db } from "./db";
import { eq } from "drizzle-orm";

/**
 * Complete platform reset - removes ALL data except super admin account
 * This handles all foreign key dependencies properly
 */
export async function completePlatformReset() {
  console.log("🔥 Starting complete platform reset...");
  
  try {
    // Step 1: Delete all records in dependency order to avoid foreign key violations
    console.log("Deleting dependent records...");
    
    // Delete all application data
    await db.execute(sql`DELETE FROM audit_logs`);
    await db.execute(sql`DELETE FROM achievements`);
    await db.execute(sql`DELETE FROM lab_results`);
    await db.execute(sql`DELETE FROM lab_orders`);
    await db.execute(sql`DELETE FROM prescriptions`);
    await db.execute(sql`DELETE FROM appointments`);
    await db.execute(sql`DELETE FROM communications`);
    await db.execute(sql`DELETE FROM bills`);
    await db.execute(sql`DELETE FROM inventory`);
    await db.execute(sql`DELETE FROM insurance_plan_coverage`);
    await db.execute(sql`DELETE FROM patients`);
    await db.execute(sql`DELETE FROM leaderboards`);
    
    // Step 2: Delete organization-specific entities
    console.log("Deleting organizations...");
    await db.execute(sql`DELETE FROM pharmacies`);
    await db.execute(sql`DELETE FROM laboratories`);
    await db.execute(sql`DELETE FROM departments`);
    
    // Step 3: Delete all users except super admin
    console.log("Cleaning up users...");
    await db.execute(sql`DELETE FROM users WHERE email != 'abel@argilette.com'`);
    
    // Step 4: Delete all tenants except super admin platform
    console.log("Cleaning up tenants...");
    await db.execute(sql`DELETE FROM tenants WHERE subdomain != 'argilette' OR type != 'platform'`);
    
    // Step 5: Reset all counters
    console.log("Resetting counters...");
    await resetAllCounters();
    
    // Step 6: Verify platform state
    const verification = await db.execute(sql`
      SELECT 
        'PLATFORM RESET COMPLETE' as status,
        (SELECT COUNT(*) FROM users) as users_remaining,
        (SELECT COUNT(*) FROM tenants) as tenants_remaining,
        (SELECT COUNT(*) FROM patients) as patients_remaining,
        (SELECT COUNT(*) FROM prescriptions) as prescriptions_remaining,
        (SELECT COUNT(*) FROM appointments) as appointments_remaining,
        (SELECT COUNT(*) FROM laboratories) as laboratories_remaining,
        (SELECT COUNT(*) FROM pharmacies) as pharmacies_remaining
    `);
    
    console.log("✅ Platform reset complete:", verification.rows[0]);
    return verification.rows[0];
    
  } catch (error) {
    console.error("❌ Platform reset failed:", error);
    throw error;
  }
}

async function resetAllCounters() {
  const counterUpdates = [
    "UPDATE tenants SET counter_appointment_id = 0",
    "UPDATE tenants SET counter_patient_id = 0", 
    "UPDATE tenants SET counter_prescription_id = 0",
    "UPDATE tenants SET counter_bill_id = 0",
    "UPDATE tenants SET counter_lab_order_id = 0",
    "UPDATE tenants SET counter_communication_id = 0"
  ];
  
  for (const update of counterUpdates) {
    await db.execute(sql.raw(update));
  }
}

// Commenting out automatic execution to prevent deployment exit issues
// This should be run manually when needed, not during deployment
// if (require.main === module) {
//   completePlatformReset()
//     .then(() => {
//       console.log("Platform reset completed successfully");
//     })
//     .catch((error) => {
//       console.error("Platform reset failed:", error);
//     });
// }

// Export the function for manual execution when needed
module.exports = { completePlatformReset, resetAllCounters };