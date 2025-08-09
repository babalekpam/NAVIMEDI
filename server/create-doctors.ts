import { createTestHospital } from "./create-test-hospital";

async function main() {
  try {
    console.log("Creating additional doctors for Metro General Hospital...");
    await createTestHospital();
    console.log("✅ Doctors created successfully!");
    // Don't exit process in production to prevent deployment issues
    if (process.env.NODE_ENV !== 'production') {
      process.exit(0);
    }
  } catch (error) {
    console.error("❌ Failed to create doctors:", error);
    // Don't exit process in production to prevent deployment issues
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
    throw error; // Let calling code handle the error
  }
}

// Commenting out automatic execution to prevent deployment exit issues
// This should be run manually when needed, not during deployment
// main();

// Export the function for manual execution when needed
export { main as createDoctors };