import { storage } from "./storage";
import { InsertAchievement } from "@shared/schema";

const initialAchievements: InsertAchievement[] = [
  // Productivity Achievements
  {
    name: "First Steps",
    description: "Complete your first laboratory test",
    type: "productivity",
    difficulty: "bronze",
    points: 10,
    iconName: "FlaskConical",
    criteria: { testsCompleted: 1 }
  },
  {
    name: "Getting Started",
    description: "Complete 10 laboratory tests",
    type: "productivity", 
    difficulty: "bronze",
    points: 50,
    iconName: "TestTube",
    criteria: { testsCompleted: 10 }
  },
  {
    name: "Lab Novice",
    description: "Complete 25 laboratory tests",
    type: "productivity",
    difficulty: "silver",
    points: 100,
    iconName: "Microscope",
    criteria: { testsCompleted: 25 }
  },
  {
    name: "Test Master",
    description: "Complete 50 laboratory tests",
    type: "productivity",
    difficulty: "gold",
    points: 200,
    iconName: "Beaker",
    criteria: { testsCompleted: 50 }
  },
  {
    name: "Lab Champion",
    description: "Complete 100 laboratory tests",
    type: "productivity",
    difficulty: "platinum",
    points: 500,
    iconName: "Trophy",
    criteria: { testsCompleted: 100 }
  },
  {
    name: "Laboratory Legend",
    description: "Complete 250 laboratory tests",
    type: "productivity",
    difficulty: "legendary",
    points: 1000,
    iconName: "Crown",
    criteria: { testsCompleted: 250 }
  },

  // Quality Achievements
  {
    name: "Quality Focused",
    description: "Maintain 85% quality score",
    type: "quality",
    difficulty: "bronze",
    points: 75,
    iconName: "CheckCircle",
    criteria: { qualityScore: 85 }
  },
  {
    name: "Excellence Standard",
    description: "Maintain 90% quality score",
    type: "quality",
    difficulty: "silver",
    points: 150,
    iconName: "Award",
    criteria: { qualityScore: 90 }
  },
  {
    name: "Precision Expert",
    description: "Maintain 95% quality score",
    type: "quality",
    difficulty: "gold",
    points: 300,
    iconName: "Target",
    criteria: { qualityScore: 95 }
  },
  {
    name: "Perfection Seeker",
    description: "Maintain 98% quality score",
    type: "quality",
    difficulty: "platinum",
    points: 600,
    iconName: "Star",
    criteria: { qualityScore: 98 }
  },

  // Consistency Achievements
  {
    name: "Daily Dedication",
    description: "Work for 3 consecutive days",
    type: "consistency",
    difficulty: "bronze",
    points: 30,
    iconName: "Calendar",
    criteria: { streakDays: 3 }
  },
  {
    name: "Week Warrior",
    description: "Work for 7 consecutive days",
    type: "consistency",
    difficulty: "silver",
    points: 100,
    iconName: "CalendarDays",
    criteria: { streakDays: 7 }
  },
  {
    name: "Commitment Champion",
    description: "Work for 14 consecutive days",
    type: "consistency",
    difficulty: "gold",
    points: 250,
    iconName: "CalendarCheck",
    criteria: { streakDays: 14 }
  },
  {
    name: "Unstoppable Force",
    description: "Work for 30 consecutive days",
    type: "consistency",
    difficulty: "platinum",
    points: 500,
    iconName: "Flame",
    criteria: { streakDays: 30 }
  },

  // Milestone Achievements
  {
    name: "Rising Star",
    description: "Earn 100 total points",
    type: "milestone",
    difficulty: "bronze",
    points: 25,
    iconName: "Star",
    criteria: { totalPoints: 100 }
  },
  {
    name: "Point Collector",
    description: "Earn 500 total points",
    type: "milestone",
    difficulty: "silver",
    points: 100,
    iconName: "Coins",
    criteria: { totalPoints: 500 }
  },
  {
    name: "Achievement Hunter",
    description: "Earn 1,000 total points",
    type: "milestone",
    difficulty: "gold",
    points: 200,
    iconName: "Medal",
    criteria: { totalPoints: 1000 }
  },
  {
    name: "Point Master",
    description: "Earn 2,500 total points",
    type: "milestone",
    difficulty: "platinum",
    points: 500,
    iconName: "Diamond",
    criteria: { totalPoints: 2500 }
  },
  {
    name: "Elite Performer",
    description: "Earn 5,000 total points",
    type: "milestone",
    difficulty: "legendary",
    points: 1000,
    iconName: "Crown",
    criteria: { totalPoints: 5000 }
  },

  // Efficiency Achievements
  {
    name: "Speed Demon",
    description: "Complete tests with average time under 15 minutes",
    type: "efficiency",
    difficulty: "bronze",
    points: 50,
    iconName: "Zap",
    criteria: { averageCompletionTime: 15 }
  },
  {
    name: "Lightning Fast",
    description: "Complete tests with average time under 10 minutes",
    type: "efficiency",
    difficulty: "silver",
    points: 100,
    iconName: "Bolt",
    criteria: { averageCompletionTime: 10 }
  },
  {
    name: "Time Master",
    description: "Complete tests with average time under 5 minutes",
    type: "efficiency",
    difficulty: "gold",
    points: 200,
    iconName: "Clock",
    criteria: { averageCompletionTime: 5 }
  },

  // Teamwork Achievements
  {
    name: "Team Player",
    description: "Help process lab orders from multiple hospitals",
    type: "teamwork",
    difficulty: "bronze",
    points: 75,
    iconName: "Users",
    criteria: { multiHospitalOrders: 5 }
  },
  {
    name: "Collaboration Expert",
    description: "Successfully process urgent lab orders",
    type: "teamwork",
    difficulty: "silver",
    points: 150,
    iconName: "UserCheck",
    criteria: { urgentOrdersProcessed: 10 }
  }
];

export async function seedAchievements() {
  console.log("🏆 Seeding achievements...");
  
  try {
    // Check if achievements already exist
    const existingAchievements = await storage.getAchievements();
    
    if (existingAchievements.length > 0) {
      console.log(`✓ ${existingAchievements.length} achievements already exist`);
      return;
    }

    // Create achievements
    let createdCount = 0;
    for (const achievement of initialAchievements) {
      try {
        await storage.createAchievement(achievement);
        createdCount++;
      } catch (error) {
        console.error(`❌ Failed to create achievement "${achievement.name}":`, error);
      }
    }

    console.log(`✓ Created ${createdCount} achievements successfully`);
    
  } catch (error) {
    console.error("❌ Error seeding achievements:", error);
  }
}

// Run if called directly
if (import.meta.url === new URL(process.argv[1], 'file:').href) {
  seedAchievements().then(() => {
    console.log("🏆 Achievement seeding completed");
    // Don't exit process in production environment
    if (process.env.NODE_ENV !== 'production') {
      process.exit(0);
    }
  }).catch((error) => {
    console.error("❌ Achievement seeding failed:", error);
    // Don't exit process in production environment 
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  });
}