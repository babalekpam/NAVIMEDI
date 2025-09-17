import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TestTube, FlaskConical, Clock, CheckCircle, AlertTriangle, Users, BarChart3, FileText, Settings, Plus, TrendingUp, Activity } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useTenant } from "@/contexts/tenant-context";
import { useTranslation } from "@/contexts/translation-context";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

export default function LaboratoryDashboard() {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { t } = useTranslation();
  const [currentTab, setCurrentTab] = useState("overview");

  // Mock data for charts
  const testVolumeData = [
    { date: "Jan", pending: 20, inProgress: 15, completed: 45, critical: 2 },
    { date: "Feb", pending: 22, inProgress: 18, completed: 52, critical: 1 },
    { date: "Mar", pending: 18, inProgress: 20, completed: 48, critical: 3 },
    { date: "Apr", pending: 25, inProgress: 16, completed: 55, critical: 2 },
    { date: "May", pending: 24, inProgress: 18, completed: 47, critical: 3 },
  ];

  const statusDistributionData = [
    { name: "Pending", value: 24, color: "#f97316" },
    { name: "In Progress", value: 18, color: "#3b82f6" },
    { name: "Completed", value: 47, color: "#22c55e" },
    { name: "Critical", value: 3, color: "#ef4444" },
  ];

  const testTypeData = [
    { type: "Complete Blood Count", count: 15, percentage: 85 },
    { type: "Lipid Panel", count: 12, percentage: 78 },
    { type: "Liver Function", count: 8, percentage: 92 },
    { type: "Thyroid Panel", count: 6, percentage: 88 },
    { type: "Glucose Test", count: 10, percentage: 95 },
    { type: "Kidney Function", count: 7, percentage: 82 },
  ];

  const performanceData = [
    { metric: "Average Turnaround", current: 2.5, target: 3.0, unit: "hours", goalDirection: "lower_is_better" },
    { metric: "Quality Score", current: 98.5, target: 95.0, unit: "%", goalDirection: "higher_is_better" },
    { metric: "Equipment Uptime", current: 99.2, target: 98.0, unit: "%", goalDirection: "higher_is_better" },
    { metric: "Staff Efficiency", current: 94.8, target: 90.0, unit: "%", goalDirection: "higher_is_better" },
  ];

  const recentActivityData = [
    { time: "09:15", activity: "Blood sample processed", patient: "Sarah Johnson", type: "CBC", status: "completed" },
    { time: "09:32", activity: "Urgent test received", patient: "Michael Davis", type: "Cardiac Enzymes", status: "processing" },
    { time: "09:45", activity: "Quality control check", patient: "System", type: "Daily QC", status: "passed" },
    { time: "10:12", activity: "Results released", patient: "Emily Chen", type: "Liver Panel", status: "released" },
    { time: "10:28", activity: "Sample received", patient: "Robert Wilson", type: "Thyroid", status: "pending" },
  ];

  const chartConfig = {
    pending: { label: "Pending", color: "#f97316" },
    inProgress: { label: "In Progress", color: "#3b82f6" },
    completed: { label: "Completed", color: "#22c55e" },
    critical: { label: "Critical", color: "#ef4444" },
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <TestTube className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Required</h2>
          <p className="text-gray-600">Please log in to access the laboratory dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laboratory Dashboard</h1>
          <p className="text-gray-600">Welcome, {user.firstName}. Manage your laboratory operations and test results.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="flex items-center">
            <TestTube className="h-4 w-4 mr-2" />
            {tenant?.name || "Laboratory"}
          </Badge>
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tests">Lab Tests</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="quality">Quality Control</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* Key Metrics Row */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Tests</p>
                    <p className="text-3xl font-bold text-orange-600">24</p>
                    <p className="text-xs text-gray-500 mt-1">Awaiting processing</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">In Progress</p>
                    <p className="text-3xl font-bold text-blue-600">18</p>
                    <p className="text-xs text-gray-500 mt-1">Currently processing</p>
                  </div>
                  <FlaskConical className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed Today</p>
                    <p className="text-3xl font-bold text-green-600">47</p>
                    <p className="text-xs text-gray-500 mt-1">Results available</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Critical Results</p>
                    <p className="text-3xl font-bold text-red-600">3</p>
                    <p className="text-xs text-gray-500 mt-1">Requires attention</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="grid gap-6 md:grid-cols-2 mb-6">
            {/* Test Volume Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                  Test Volume Trends
                </CardTitle>
                <CardDescription>Monthly test processing overview</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <AreaChart data={testVolumeData}>
                    <defs>
                      <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      className="text-xs"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis className="text-xs" tick={{ fontSize: 12 }} />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="completed" 
                      stackId="1" 
                      stroke="#22c55e" 
                      fillOpacity={1} 
                      fill="url(#colorCompleted)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="pending" 
                      stackId="1" 
                      stroke="#f97316" 
                      fillOpacity={1} 
                      fill="url(#colorPending)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="inProgress" 
                      stackId="1" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.6} 
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                  Status Distribution
                </CardTitle>
                <CardDescription>Current test status breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <PieChart>
                    <Pie
                      data={statusDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value, entry) => (
                        <span style={{ color: entry.color }}>
                          {value}: {entry.payload?.value || 0}
                        </span>
                      )}
                    />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid gap-6 md:grid-cols-2 mb-6">
            {/* Test Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TestTube className="h-5 w-5 mr-2 text-green-600" />
                  Test Type Distribution
                </CardTitle>
                <CardDescription>Most common laboratory tests</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={testTypeData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs" tick={{ fontSize: 12 }} />
                    <YAxis 
                      type="category" 
                      dataKey="type" 
                      className="text-xs" 
                      tick={{ fontSize: 10 }}
                      width={120}
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="#3b82f6" 
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-indigo-600" />
                  Performance Metrics
                </CardTitle>
                <CardDescription>Laboratory efficiency indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {performanceData.map((metric, index) => {
                  // Calculate percentage and determine if performance is good based on goal direction
                  let percentage, isGood;
                  
                  if (metric.goalDirection === "lower_is_better") {
                    // For metrics like turnaround time, lower current values are better
                    percentage = (metric.target / metric.current) * 100;
                    isGood = metric.current <= metric.target;
                  } else {
                    // For metrics like quality score, higher current values are better
                    percentage = (metric.current / metric.target) * 100;
                    isGood = metric.current >= metric.target;
                  }
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-700">{metric.metric}</span>
                        <span className={`font-bold ${
                          isGood ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {metric.current}{metric.unit}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <Progress 
                          value={Math.min(percentage, 100)} 
                          className="h-2"
                          data-testid={`progress-${metric.metric.toLowerCase().replace(/\s+/g, '-')}`}
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Target: {metric.target}{metric.unit}</span>
                          <span>{percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Bottom Section */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Recent Activity Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-blue-600" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest laboratory activities and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivityData.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg" data-testid={`activity-${index}`}>
                      <div className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{activity.activity}</p>
                          <span className="text-xs text-gray-500">{activity.time}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {activity.patient} • {activity.type}
                        </p>
                        <Badge 
                          className={`text-xs mt-2 ${
                            activity.status === 'completed' || activity.status === 'released' ? 'bg-green-100 text-green-800' :
                            activity.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                            activity.status === 'passed' ? 'bg-purple-100 text-purple-800' :
                            'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {activity.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4" data-testid="button-view-all-activities">
                  View All Activities
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-purple-600" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Common laboratory tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => setCurrentTab("tests")}
                  className="w-full justify-start"
                  variant="outline"
                  data-testid="button-process-new-test"
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  Process New Test
                </Button>
                <Button 
                  onClick={() => setCurrentTab("results")}
                  className="w-full justify-start"
                  variant="outline"
                  data-testid="button-enter-results"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Enter Results
                </Button>
                <Button 
                  onClick={() => setCurrentTab("quality")}
                  className="w-full justify-start"
                  variant="outline"
                  data-testid="button-quality-control"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Quality Control
                </Button>
                <Button 
                  onClick={() => setCurrentTab("reports")}
                  className="w-full justify-start"
                  variant="outline"
                  data-testid="button-generate-report"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tests">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Laboratory Tests</CardTitle>
                  <CardDescription>Manage and process laboratory test orders</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Test Order
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TestTube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Test Management</h3>
                <p className="text-gray-600 mb-4">Laboratory test processing interface will be available here.</p>
                <Button variant="outline">Coming Soon</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>Enter and review laboratory test results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Results Management</h3>
                <p className="text-gray-600 mb-4">Test results entry and review interface will be available here.</p>
                <Button variant="outline">Coming Soon</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality">
          <Card>
            <CardHeader>
              <CardTitle>Quality Control</CardTitle>
              <CardDescription>Monitor and maintain laboratory quality standards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Assurance</h3>
                <p className="text-gray-600 mb-4">Quality control monitoring and reporting interface will be available here.</p>
                <Button variant="outline">Coming Soon</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Laboratory Reports</CardTitle>
              <CardDescription>Generate and view laboratory performance reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Reporting Dashboard</h3>
                <p className="text-gray-600 mb-4">Laboratory analytics and reporting interface will be available here.</p>
                <Button variant="outline">Coming Soon</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}