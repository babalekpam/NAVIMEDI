import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Star, Target, Clock, TrendingUp, Users, Lightbulb, BookOpen, Award, Activity } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTenant } from "@/hooks/use-tenant";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  requirement: number;
  points: number;
  badge: string;
  isActive: boolean;
}

interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  progress: number;
  completed: boolean;
  completedAt?: string;
  points: number;
  achievement: Achievement;
}

interface UserStats {
  id: string;
  userId: string;
  tenantId: string;
  level: number;
  totalPoints: number;
  testsCompleted: number;
  averageCompletionTime: number;
  qualityScore: number;
  consistencyStreak: number;
  lastActivityDate: string;
}

interface ActivityLog {
  id: string;
  userId: string;
  tenantId: string;
  activityType: string;
  points: number;
  createdAt: string;
  metadata?: any;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  points: number;
  level: number;
  testsCompleted: number;
}

const categoryIcons = {
  performance: <TrendingUp className="h-5 w-5" />,
  quality: <Star className="h-5 w-5" />,
  efficiency: <Clock className="h-5 w-5" />,
  collaboration: <Users className="h-5 w-5" />,
  innovation: <Lightbulb className="h-5 w-5" />,
  training: <BookOpen className="h-5 w-5" />
};

const categoryColors = {
  performance: "bg-blue-500",
  quality: "bg-yellow-500",
  efficiency: "bg-green-500",
  collaboration: "bg-purple-500",
  innovation: "bg-orange-500",
  training: "bg-indigo-500"
};

export function AchievementDisplay() {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Fetch user achievements
  const { data: userAchievements = [], isLoading: achievementsLoading } = useQuery<UserAchievement[]>({
    queryKey: ["/api/user-achievements"],
    enabled: !!user && !!tenant,
  });

  // Fetch user stats
  const { data: userStats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ["/api/user-stats"],
    enabled: !!user && !!tenant,
  });

  // Fetch activity logs
  const { data: activityLogs = [], isLoading: logsLoading } = useQuery<ActivityLog[]>({
    queryKey: ["/api/activity-logs"],
    enabled: !!user && !!tenant,
  });

  // Fetch leaderboard
  const { data: leaderboard = [], isLoading: leaderboardLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/leaderboard"],
    enabled: !!user && !!tenant,
  });

  const completedAchievements = userAchievements.filter(ua => ua.completed);
  const inProgressAchievements = userAchievements.filter(ua => !ua.completed && ua.progress > 0);
  const availableAchievements = userAchievements.filter(ua => !ua.completed && ua.progress === 0);

  const filteredAchievements = selectedCategory === "all" 
    ? userAchievements 
    : userAchievements.filter(ua => ua.achievement.category === selectedCategory);

  const categories = Array.from(new Set(userAchievements.map(ua => ua.achievement.category)));

  const calculateLevel = (points: number) => {
    return Math.floor(points / 100) + 1;
  };

  const getPointsForNextLevel = (currentPoints: number) => {
    const currentLevel = calculateLevel(currentPoints);
    return currentLevel * 100 - currentPoints;
  };

  if (achievementsLoading || statsLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading achievements...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{userStats?.level || 1}</p>
                <p className="text-sm text-muted-foreground">Level</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{userStats?.totalPoints || 0}</p>
                <p className="text-sm text-muted-foreground">Total Points</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{completedAchievements.length}</p>
                <p className="text-sm text-muted-foreground">Achievements</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{userStats?.testsCompleted || 0}</p>
                <p className="text-sm text-muted-foreground">Tests Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress to Next Level */}
      {userStats && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Level {userStats.level}</span>
                <span>{getPointsForNextLevel(userStats.totalPoints)} points to next level</span>
              </div>
              <Progress 
                value={(userStats.totalPoints % 100)} 
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievement Tabs */}
      <Tabs defaultValue="achievements" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="space-y-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
            >
              All
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {categoryIcons[category as keyof typeof categoryIcons]}
                <span className="ml-1">{category}</span>
              </Button>
            ))}
          </div>

          {/* Achievement Sections */}
          <div className="space-y-6">
            {/* Completed Achievements */}
            {completedAchievements.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Award className="h-5 w-5 mr-2 text-yellow-500" />
                  Completed ({completedAchievements.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completedAchievements.map(userAchievement => (
                    <Card key={userAchievement.id} className="border-yellow-200 bg-yellow-50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className={`p-1 rounded-full ${categoryColors[userAchievement.achievement.category as keyof typeof categoryColors]} text-white`}>
                                {categoryIcons[userAchievement.achievement.category as keyof typeof categoryIcons]}
                              </div>
                              <Badge variant="secondary" className="bg-yellow-500 text-white">
                                {userAchievement.achievement.badge}
                              </Badge>
                            </div>
                            <h4 className="font-semibold">{userAchievement.achievement.title}</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              {userAchievement.achievement.description}
                            </p>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-green-600 font-medium">
                                +{userAchievement.achievement.points} points
                              </span>
                              <span className="text-muted-foreground">
                                {userAchievement.completedAt && new Date(userAchievement.completedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* In Progress Achievements */}
            {inProgressAchievements.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-blue-500" />
                  In Progress ({inProgressAchievements.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inProgressAchievements.map(userAchievement => (
                    <Card key={userAchievement.id} className="border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className={`p-1 rounded-full ${categoryColors[userAchievement.achievement.category as keyof typeof categoryColors]} text-white`}>
                                {categoryIcons[userAchievement.achievement.category as keyof typeof categoryIcons]}
                              </div>
                              <Badge variant="outline">
                                {userAchievement.achievement.badge}
                              </Badge>
                            </div>
                            <h4 className="font-semibold">{userAchievement.achievement.title}</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              {userAchievement.achievement.description}
                            </p>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span>{userAchievement.progress}/{userAchievement.achievement.requirement}</span>
                              </div>
                              <Progress 
                                value={(userAchievement.progress / userAchievement.achievement.requirement) * 100} 
                              />
                            </div>
                            <div className="flex items-center justify-between text-xs mt-2">
                              <span className="text-blue-600 font-medium">
                                +{userAchievement.achievement.points} points
                              </span>
                              <span className="text-muted-foreground">
                                {Math.round((userAchievement.progress / userAchievement.achievement.requirement) * 100)}% complete
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Available Achievements */}
            {availableAchievements.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-gray-500" />
                  Available ({availableAchievements.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableAchievements.map(userAchievement => (
                    <Card key={userAchievement.id} className="border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className={`p-1 rounded-full bg-gray-400 text-white`}>
                                {categoryIcons[userAchievement.achievement.category as keyof typeof categoryIcons]}
                              </div>
                              <Badge variant="outline">
                                {userAchievement.achievement.badge}
                              </Badge>
                            </div>
                            <h4 className="font-semibold text-gray-700">{userAchievement.achievement.title}</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              {userAchievement.achievement.description}
                            </p>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600 font-medium">
                                +{userAchievement.achievement.points} points
                              </span>
                              <span className="text-muted-foreground">
                                Requirement: {userAchievement.achievement.requirement}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                Laboratory Leaderboard
              </CardTitle>
              <CardDescription>
                Top performers in your laboratory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                  <div key={entry.userId} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-orange-600' : 'bg-gray-600'
                      }`}>
                        {entry.rank}
                      </div>
                      <div>
                        <p className="font-semibold">{entry.userName}</p>
                        <p className="text-sm text-muted-foreground">Level {entry.level}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">{entry.points} pts</p>
                      <p className="text-sm text-muted-foreground">{entry.testsCompleted} tests</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-500" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your latest laboratory achievements and activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {activityLogs.map(log => (
                    <div key={log.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-full bg-blue-100">
                          <Activity className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {log.activityType === 'lab_test_completed' ? 'Lab Test Completed' : log.activityType}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {log.metadata?.testName && `Test: ${log.metadata.testName}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(log.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          +{log.points} pts
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}