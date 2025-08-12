import { createTestHospital } from "./create-test-hospital";

async function main() {
  try {
    console.log("Creating additional doctors for Metro General Hospital...");
    await createTestHospital();
    console.log("✅ Doctors created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to create doctors:", error);
    process.exit(1);
  }
}

main();