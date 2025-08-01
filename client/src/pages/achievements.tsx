import { AchievementDisplay } from "@/components/AchievementDisplay";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Target, Star } from "lucide-react";

export default function Achievements() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <Trophy className="h-8 w-8 mr-3 text-yellow-500" />
          Laboratory Achievements
        </h1>
        <p className="text-muted-foreground">
          Track your laboratory performance, earn achievements, and compete with your colleagues
        </p>
      </div>

      {/* Achievement System Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-blue-100">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Performance Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Automatic tracking of test completion, quality scores, and efficiency metrics
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-yellow-100">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold">Achievement Rewards</h3>
                <p className="text-sm text-muted-foreground">
                  Earn points, badges, and level up as you complete laboratory tests
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-green-100">
                <Trophy className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Team Competition</h3>
                <p className="text-sm text-muted-foreground">
                  Compete with colleagues on the leaderboard for best performance
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Achievement Display */}
      <AchievementDisplay />
    </div>
  );
}