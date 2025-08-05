import { db } from "./db";
import { 
  workShifts,
  userStats,
  advertisements,
  marketplaceProducts,
  activityLogs
} from "@shared/schema";
import { sql } from "drizzle-orm";

/**
 * Reset All Counters Script
 * Resets all counter fields across all accounts to zero for accuracy when new users sign up
 */

export async function resetAllCounters() {
  console.log("🔄 Starting comprehensive counter reset...");

  try {
    // 1. Reset Work Shift Counters
    console.log("📊 Resetting work shift counters...");
    await db.update(workShifts).set({
      totalPrescriptionsProcessed: 0,
      totalRevenue: "0.00",
      totalInsuranceClaims: 0
    });

    // 2. Reset User Statistics
    console.log("👤 Resetting user statistics...");
    await db.update(userStats).set({
      level: 1,
      totalPoints: 0,
      testsCompleted: 0,
      averageCompletionTime: 0,
      qualityScore: "0.00",
      consistencyStreak: 0,
      weeklyGoal: 50,
      monthlyGoal: 200
    });

    // 3. Reset Advertisement Performance Counters
    console.log("📢 Resetting advertisement performance counters...");
    await db.update(advertisements).set({
      impressions: 0,
      clicks: 0,
      conversions: 0
    });

    // 4. Reset Marketplace Product Analytics
    console.log("🛒 Resetting marketplace product analytics...");
    await db.update(marketplaceProducts).set({
      viewCount: 0,
      orderCount: 0,
      avgRating: "0.00",
      totalReviews: 0,
      stockQuantity: 0
    });

    // 5. Reset Activity Log Points (optional - preserves history but resets points)
    console.log("📝 Resetting activity log points...");
    await db.update(activityLogs).set({
      points: 0
    });

    // 6. Update all updated_at timestamps
    console.log("⏰ Updating timestamps...");
    const currentTime = new Date();
    
    await db.update(workShifts).set({
      updatedAt: currentTime
    });
    
    await db.update(userStats).set({
      updatedAt: currentTime
    });
    
    await db.update(advertisements).set({
      updatedAt: currentTime
    });
    
    await db.update(marketplaceProducts).set({
      updatedAt: currentTime
    });

    console.log("✅ All counters have been successfully reset to zero!");
    console.log("📈 Summary of reset counters:");
    console.log("   • Work shift prescriptions, revenue, and insurance claims");
    console.log("   • User levels, points, tests completed, and streaks");
    console.log("   • Advertisement impressions, clicks, and conversions");
    console.log("   • Product view counts, order counts, ratings, and reviews");
    console.log("   • Activity log points");
    console.log("   • Stock quantities reset to zero");

    return {
      success: true,
      message: "All counters reset successfully",
      timestamp: currentTime
    };

  } catch (error) {
    console.error("❌ Error resetting counters:", error);
    throw new Error(`Failed to reset counters: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Execute the reset if this file is run directly  
if (import.meta.url === `file://${process.argv[1]}`) {
  resetAllCounters()
    .then(() => {
      console.log("🎉 Counter reset completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Counter reset failed:", error);
      process.exit(1);
    });
}