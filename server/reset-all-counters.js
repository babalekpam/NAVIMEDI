const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

/**
 * Reset All Counters Script
 * Resets all counter fields across all accounts to zero for accuracy when new users sign up
 */
async function resetAllCounters() {
  console.log("🔄 Starting comprehensive counter reset...");
  
  try {
    // Simple SQL-based reset for deployment compatibility
    console.log("📊 Resetting counters via SQL...");
    
    // Reset key counters to avoid heavy ORM operations during deployment
    const queries = [
      "UPDATE work_shifts SET total_prescriptions_processed = 0, total_revenue = '0.00', total_insurance_claims = 0",
      "UPDATE user_stats SET level = 1, total_points = 0, tests_completed = 0, average_completion_time = 0, quality_score = '0.00', consistency_streak = 0, weekly_goal = 50, monthly_goal = 200",
      "UPDATE advertisements SET impressions = 0, clicks = 0, conversions = 0",
      "UPDATE marketplace_products SET view_count = 0, order_count = 0, avg_rating = '0.00', total_reviews = 0, stock_quantity = 0",
      "UPDATE activity_logs SET points = 0"
    ];
    
    for (const query of queries) {
      try {
        await pool.query(query);
        console.log(`✅ Executed: ${query.substring(0, 50)}...`);
      } catch (error) {
        console.log(`⚠️ Skipped (table may not exist): ${query.substring(0, 50)}...`);
      }
    }
    
    console.log("✅ Counter reset completed successfully!");
    return { success: true, message: "All available counters have been reset to zero." };
  } catch (error) {
    console.error("❌ Counter reset error:", error);
    throw error;
  }
}

module.exports = {
  resetAllCounters
};