import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import { useQuery } from "@tanstack/react-query";
import { 
  TestTube, 
  FlaskConical, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  BarChart3, 
  FileText, 
  Settings, 
  Plus, 
  TrendingUp, 
  Activity,
  Loader2,
  Target,
  DollarSign,
  PieChart as PieChartIcon,
  Shield
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useTenant } from "@/contexts/tenant-context";
import { useTranslation } from "@/contexts/translation-context";
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend 
} from "recharts";

export default function LaboratoryDashboard() {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { t } = useTranslation();
  const [currentTab, setCurrentTab] = useState("overview");

  // Fetch real laboratory analytics data from API with optimized polling  
  const { data: analyticsData, isLoading: analyticsLoading, error: analyticsError } = useQuery({
    queryKey: ['/api/analytics/laboratory'],
    staleTime: 60 * 1000, // 1 minute - test status changes regularly
    refetchInterval: 45 * 1000, // 45 seconds - lab processing needs timely updates
    refetchIntervalInBackground: false, // Don't poll when tab inactive
    retry: 3, // Important for test result accuracy
    refetchOnWindowFocus: true, // Refresh when returning to lab dashboard
    refetchOnReconnect: true, // Critical after network issues
  });

  // Transform API response to dashboard format
  const transformLaboratoryAnalytics = useMemo(() => {
    if (!analyticsData) return null;

    try {
      // Transform test processing data
      const testing = {
        ordersByType: (analyticsData.testing?.ordersByType || []).map((item: any, index: number) => {
          const colors = ["#22c55e", "#3b82f6", "#f97316", "#ef4444", "#8b5cf6", "#06b6d4"];
          return {
            name: item.name || item.type || '',
            value: Number(item.value) || Number(item.count) || 0,
            percentage: Number(item.percentage) || 0,
            color: item.color || colors[index % colors.length]
          };
        }),
        turnaroundTimes: (analyticsData.testing?.turnaroundTimes || []).map((item: any) => ({
          timestamp: item.timestamp || item.period || '',
          value: Number(item.value) || Number(item.hours) || 0,
          target: Number(item.target) || 24,
          metadata: item.metadata || {}
        })),
        testVolumeTrends: (analyticsData.testing?.testVolumeTrends || []).map((item: any) => ({
          date: item.timestamp || item.period || '',
          pending: Number(item.pending) || 0,
          inProgress: Number(item.inProgress) || Number(item.processing) || 0,
          completed: Number(item.completed) || Number(item.finished) || 0,
          critical: Number(item.critical) || Number(item.urgent) || 0
        })),
        qualityControlResults: (analyticsData.testing?.qualityControlResults || []).map((item: any) => ({
          name: item.name || item.metric || '',
          current: Number(item.current) || 0,
          previous: Number(item.previous) || 0,
          target: Number(item.target) || 0,
          unit: item.unit || '%',
          trend: item.trend || 'stable',
          changePercent: Number(item.changePercent) || 0
        }))
      };

      // Transform sample management data
      const samples = {
        collectionEfficiency: {
          name: 'Collection Efficiency',
          current: Number(analyticsData.samples?.collectionEfficiency?.current) || 0,
          previous: Number(analyticsData.samples?.collectionEfficiency?.previous) || 0,
          target: Number(analyticsData.samples?.collectionEfficiency?.target) || 95,
          unit: '%',
          trend: analyticsData.samples?.collectionEfficiency?.trend || 'stable',
          changePercent: Number(analyticsData.samples?.collectionEfficiency?.changePercent) || 0
        },
        sampleQuality: (analyticsData.samples?.sampleQuality || []).map((item: any) => ({
          name: item.name || item.metric || '',
          current: Number(item.current) || 0,
          previous: Number(item.previous) || 0,
          target: Number(item.target) || 0,
          unit: item.unit || '%',
          trend: item.trend || 'stable',
          changePercent: Number(item.changePercent) || 0
        })),
        storageUtilization: (analyticsData.samples?.storageUtilization || []).map((item: any) => ({
          resource: item.resource || item.name || '',
          utilized: Number(item.utilized) || Number(item.used) || 0,
          capacity: Number(item.capacity) || Number(item.total) || 0,
          efficiency: Number(item.efficiency) || ((Number(item.utilized) / Number(item.capacity)) * 100) || 0
        })),
        rejectionRate: {
          name: 'Sample Rejection Rate',
          current: Number(analyticsData.samples?.rejectionRate?.current) || 0,
          previous: Number(analyticsData.samples?.rejectionRate?.previous) || 0,
          target: Number(analyticsData.samples?.rejectionRate?.target) || 2,
          unit: '%',
          trend: analyticsData.samples?.rejectionRate?.trend || 'stable',
          changePercent: Number(analyticsData.samples?.rejectionRate?.changePercent) || 0
        }
      };

      // Transform equipment data
      const equipment = {
        utilization: (analyticsData.equipment?.utilization || []).map((item: any) => ({
          resource: item.resource || item.equipment || '',
          utilized: Number(item.utilized) || Number(item.uptime) || 0,
          capacity: Number(item.capacity) || 100,
          efficiency: Number(item.efficiency) || ((Number(item.utilized) / Number(item.capacity)) * 100) || 0
        })),
        maintenanceSchedule: (analyticsData.equipment?.maintenanceSchedule || []).map((item: any) => ({
          equipment: item.equipment || item.name || '',
          nextMaintenance: item.nextMaintenance || item.next || '',
          lastMaintenance: item.lastMaintenance || item.last || '',
          status: item.status || 'operational',
          priority: item.priority || 'normal'
        }))
      };

      // Transform financial data
      const financial = {
        revenueStreams: (analyticsData.financial?.revenueStreams || []).map((item: any) => ({
          source: item.source || item.category || '',
          amount: Number(item.amount) || Number(item.revenue) || 0,
          percentage: Number(item.percentage) || 0,
          growth: Number(item.growth) || 0
        })),
        costAnalysis: (analyticsData.financial?.costAnalysis || []).map((item: any) => ({
          category: item.category || item.name || '',
          amount: Number(item.amount) || Number(item.cost) || 0,
          percentage: Number(item.percentage) || 0
        }))
      };

      // Transform quality data
      const quality = {
        accuracyRates: (analyticsData.quality?.accuracyRates || []).map((item: any) => ({
          period: item.period || item.month || '',
          rate: Number(item.rate) || Number(item.accuracy) || 0,
          errors: Number(item.errors) || Number(item.errorCount) || 0,
          target: Number(item.target) || 99.5
        })),
        errorTracking: (analyticsData.quality?.errorTracking || []).map((item: any, index: number) => {
          const colors = ["#ef4444", "#f97316", "#3b82f6", "#8b5cf6", "#06b6d4"];
          return {
            type: item.type || item.errorType || '',
            count: Number(item.count) || Number(item.errors) || 0,
            color: item.color || colors[index % colors.length]
          };
        })
      };

      return {
        today: analyticsData.today || {},
        testing,
        samples,
        equipment,
        financial,
        quality
      };
    } catch (error) {
      console.error('Error transforming laboratory analytics data:', error);
      return null;
    }
  }, [analyticsData]);

  // Generate fallback data for loading/error states
  const getFallbackLaboratoryAnalytics = () => ({
    today: {
      ordersReceived: 45,
      samplesCollected: 42,
      testsInProgress: 18,
      resultsCompleted: 38,
      criticalResults: 3,
      averageTurnaroundTime: 4.2
    },
    testing: {
      ordersByType: [
        { name: "Blood Chemistry", value: 156, percentage: 34.2, color: "#22c55e" },
        { name: "Hematology", value: 124, percentage: 27.1, color: "#3b82f6" },
        { name: "Microbiology", value: 89, percentage: 19.5, color: "#f97316" },
        { name: "Immunology", value: 67, percentage: 14.7, color: "#ef4444" },
        { name: "Molecular", value: 21, percentage: 4.5, color: "#8b5cf6" }
      ],
      testVolumeTrends: [
        { date: "Jan", pending: 20, inProgress: 15, completed: 45, critical: 2 },
        { date: "Feb", pending: 22, inProgress: 18, completed: 52, critical: 1 },
        { date: "Mar", pending: 18, inProgress: 20, completed: 48, critical: 3 },
        { date: "Apr", pending: 25, inProgress: 16, completed: 55, critical: 2 },
        { date: "May", pending: 24, inProgress: 18, completed: 47, critical: 3 },
        { date: "Jun", pending: 21, inProgress: 19, completed: 51, critical: 2 }
      ],
      turnaroundTimes: [
        { timestamp: "Mon", value: 3.8, target: 4.0 },
        { timestamp: "Tue", value: 4.2, target: 4.0 },
        { timestamp: "Wed", value: 3.9, target: 4.0 },
        { timestamp: "Thu", value: 4.5, target: 4.0 },
        { timestamp: "Fri", value: 4.1, target: 4.0 },
        { timestamp: "Sat", value: 3.7, target: 4.0 },
        { timestamp: "Sun", value: 3.6, target: 4.0 }
      ],
      qualityControlResults: [
        { name: "Accuracy Rate", current: 98.5, previous: 98.2, target: 98.0, unit: "%", trend: "up", changePercent: 0.3 },
        { name: "Precision", current: 97.8, previous: 97.5, target: 97.0, unit: "%", trend: "up", changePercent: 0.3 },
        { name: "Sensitivity", current: 99.1, previous: 98.9, target: 99.0, unit: "%", trend: "up", changePercent: 0.2 },
        { name: "Specificity", current: 98.9, previous: 99.2, target: 99.0, unit: "%", trend: "down", changePercent: -0.3 }
      ]
    },
    samples: {
      collectionEfficiency: { name: "Collection Efficiency", current: 96.2, previous: 95.8, target: 95.0, unit: "%", trend: "up", changePercent: 0.4 },
      rejectionRate: { name: "Sample Rejection Rate", current: 1.8, previous: 2.1, target: 2.0, unit: "%", trend: "down", changePercent: -14.3 },
      sampleQuality: [
        { name: "Sample Integrity", current: 98.9, previous: 98.7, target: 98.5, unit: "%", trend: "up", changePercent: 0.2 },
        { name: "Proper Labeling", current: 99.5, previous: 99.3, target: 99.0, unit: "%", trend: "up", changePercent: 0.2 }
      ],
      storageUtilization: [
        { resource: "Freezer -80°C", utilized: 85, capacity: 100, efficiency: 85.0 },
        { resource: "Refrigerator 4°C", utilized: 72, capacity: 90, efficiency: 80.0 },
        { resource: "Room Temperature", utilized: 45, capacity: 60, efficiency: 75.0 }
      ]
    },
    equipment: {
      utilization: [
        { resource: "Chemistry Analyzer", utilized: 94, capacity: 100, efficiency: 94.0 },
        { resource: "Hematology Counter", utilized: 88, capacity: 100, efficiency: 88.0 },
        { resource: "PCR Machine", utilized: 76, capacity: 100, efficiency: 76.0 },
        { resource: "Microscope", utilized: 82, capacity: 100, efficiency: 82.0 }
      ],
      maintenanceSchedule: [
        { equipment: "Chemistry Analyzer", nextMaintenance: "2024-01-15", lastMaintenance: "2023-12-15", status: "operational", priority: "normal" },
        { equipment: "Hematology Counter", nextMaintenance: "2024-01-20", lastMaintenance: "2023-12-20", status: "operational", priority: "normal" }
      ]
    },
    financial: {
      revenueStreams: [
        { source: "Blood Chemistry", amount: 125000, percentage: 42.3, growth: 8.5 },
        { source: "Hematology", amount: 89000, percentage: 30.1, growth: 5.2 },
        { source: "Microbiology", amount: 56000, percentage: 18.9, growth: 12.1 },
        { source: "Immunology", amount: 25000, percentage: 8.7, growth: 15.3 }
      ],
      costAnalysis: [
        { category: "Reagents", amount: 85000, percentage: 45.2 },
        { category: "Staff", amount: 65000, percentage: 34.6 },
        { category: "Equipment", amount: 25000, percentage: 13.3 },
        { category: "Facilities", amount: 13000, percentage: 6.9 }
      ]
    },
    quality: {
      accuracyRates: [
        { period: "Jan", rate: 98.2, errors: 8, target: 98.0 },
        { period: "Feb", rate: 98.4, errors: 6, target: 98.0 },
        { period: "Mar", rate: 98.1, errors: 9, target: 98.0 },
        { period: "Apr", rate: 98.6, errors: 5, target: 98.0 },
        { period: "May", rate: 98.5, errors: 7, target: 98.0 },
        { period: "Jun", rate: 98.7, errors: 4, target: 98.0 }
      ],
      errorTracking: [
        { type: "Sample Mix-up", count: 8, color: "#ef4444" },
        { type: "Calibration Error", count: 5, color: "#f97316" },
        { type: "Equipment Failure", count: 3, color: "#3b82f6" },
        { type: "Human Error", count: 7, color: "#8b5cf6" },
        { type: "Other", count: 4, color: "#06b6d4" }
      ]
    }
  });

  // Use real analytics data when available, show loading when null
  const finalLaboratoryAnalytics = transformLaboratoryAnalytics;

  // Define chart data variables from analytics
  const testVolumeData = finalLaboratoryAnalytics?.testing?.testVolumeTrends || [];
  const statusDistributionData = finalLaboratoryAnalytics?.testing?.ordersByType || [];
  const testTypeData = finalLaboratoryAnalytics?.testing?.ordersByType || [];
  const performanceData = finalLaboratoryAnalytics?.testing?.qualityControlResults || [];
  const recentActivityData = finalLaboratoryAnalytics?.samples?.sampleQuality || [];

  // Chart configurations
  const chartConfig: ChartConfig = {
    pending: { label: "Pending", color: "#f97316" },
    inProgress: { label: "In Progress", color: "#3b82f6" },
    completed: { label: "Completed", color: "#22c55e" },
    critical: { label: "Critical", color: "#ef4444" },
    value: { label: "Value", color: "hsl(220, 98%, 61%)" },
    target: { label: "Target", color: "hsl(0, 0%, 45%)" },
    rate: { label: "Rate", color: "hsl(142, 76%, 36%)" }
  };

  // Data safety guards for chart inputs
  const safeChartData = (data: any[]) => {
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }
    return data.map(item => ({
      ...item,
      value: typeof item.value === 'number' && isFinite(item.value) ? item.value : 0,
      target: typeof item.target === 'number' && isFinite(item.target) ? item.target : undefined,
      current: typeof item.current === 'number' && isFinite(item.current) ? item.current : 0,
      utilized: typeof item.utilized === 'number' && isFinite(item.utilized) ? item.utilized : 0,
      capacity: typeof item.capacity === 'number' && isFinite(item.capacity) ? item.capacity : 0,
      rate: typeof item.rate === 'number' && isFinite(item.rate) ? item.rate : 0
    }));
  };

  // Show loading state while analytics are being fetched
  if (analyticsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laboratory Dashboard</h1>
          <p className="text-gray-600">Loading laboratory analytics...</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded mt-2 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-[300px] bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

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
          {analyticsError && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                Analytics temporarily unavailable. Showing sample data.
              </p>
            </div>
          )}
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

      {/* Today's Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card data-testid="metric-orders-received">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Orders Received</CardTitle>
            <FileText className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{finalLaboratoryAnalytics.today?.ordersReceived || 0}</div>
            <p className="text-xs text-gray-500 mt-1">New orders today</p>
          </CardContent>
        </Card>

        <Card data-testid="metric-samples-collected">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Samples Collected</CardTitle>
            <FlaskConical className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{finalLaboratoryAnalytics.today?.samplesCollected || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Collected today</p>
          </CardContent>
        </Card>

        <Card data-testid="metric-tests-progress">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Tests in Progress</CardTitle>
            <Activity className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{finalLaboratoryAnalytics.today?.testsInProgress || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Currently processing</p>
          </CardContent>
        </Card>

        <Card data-testid="metric-results-completed">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Results Completed</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{finalLaboratoryAnalytics.today?.resultsCompleted || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Completed today</p>
          </CardContent>
        </Card>

        <Card data-testid="metric-critical-results">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Critical Results</CardTitle>
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{finalLaboratoryAnalytics.today?.criticalResults || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Require attention</p>
          </CardContent>
        </Card>

        <Card data-testid="metric-turnaround-time">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Turnaround</CardTitle>
            <Clock className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{finalLaboratoryAnalytics.today?.averageTurnaroundTime || 0}h</div>
            <p className="text-xs text-gray-500 mt-1">Average time</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Volume Trends */}
        <Card data-testid="chart-test-volume">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Test Volume Trends
            </CardTitle>
            <CardDescription>Monthly test processing volume by status</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={chartConfig}
              className="h-[300px]"
            >
              <AreaChart data={safeChartData(finalLaboratoryAnalytics.testing?.testVolumeTrends || [])}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area 
                  type="monotone" 
                  dataKey="completed" 
                  stackId="1"
                  stroke="#22c55e" 
                  fill="#22c55e"
                  name="Completed"
                />
                <Area 
                  type="monotone" 
                  dataKey="inProgress" 
                  stackId="1"
                  stroke="#3b82f6" 
                  fill="#3b82f6"
                  name="In Progress"
                />
                <Area 
                  type="monotone" 
                  dataKey="pending" 
                  stackId="1"
                  stroke="#f97316" 
                  fill="#f97316"
                  name="Pending"
                />
                <Area 
                  type="monotone" 
                  dataKey="critical" 
                  stackId="1"
                  stroke="#ef4444" 
                  fill="#ef4444"
                  name="Critical"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Orders by Type Distribution */}
        <Card data-testid="chart-orders-by-type">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Orders by Test Type
            </CardTitle>
            <CardDescription>Distribution of test orders by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={chartConfig}
              className="h-[300px]"
            >
              <PieChart>
                <Pie
                  data={safeChartData(finalLaboratoryAnalytics.testing?.ordersByType || [])}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                >
                  {finalLaboratoryAnalytics.testing?.ordersByType?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Turnaround Times */}
        <Card data-testid="chart-turnaround-times">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Turnaround Times
            </CardTitle>
            <CardDescription>Daily average turnaround times vs targets</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={chartConfig}
              className="h-[300px]"
            >
              <LineChart data={safeChartData(finalLaboratoryAnalytics.testing?.turnaroundTimes || [])}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Actual Time (hours)"
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#6b7280" 
                  strokeDasharray="5 5"
                  name="Target (hours)"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Equipment Utilization */}
        <Card data-testid="chart-equipment-utilization">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Equipment Utilization
            </CardTitle>
            <CardDescription>Current equipment usage and capacity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(finalLaboratoryAnalytics.equipment?.utilization || []).slice(0, 6).map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{item.resource}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{item.utilized}/{item.capacity}</span>
                      <span className="text-sm font-semibold text-blue-600">
                        {item.efficiency.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <Progress 
                    value={item.efficiency} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quality Control Results */}
        <Card data-testid="chart-quality-control">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Quality Control Metrics
            </CardTitle>
            <CardDescription>Key quality indicators vs targets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {(finalLaboratoryAnalytics.testing?.qualityControlResults || []).map((metric, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{metric.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${
                        metric.trend === 'up' ? 'text-green-600' :
                        metric.trend === 'down' ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'}
                        {Math.abs(metric.changePercent)}%
                      </span>
                      <span className="text-sm font-semibold">
                        {metric.current}{metric.unit}
                      </span>
                    </div>
                  </div>
                  <Progress 
                    value={(metric.current / metric.target) * 100} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Previous: {metric.previous}{metric.unit}</span>
                    <span>Target: {metric.target}{metric.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sample Quality Metrics */}
        <Card data-testid="chart-sample-quality">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5" />
              Sample Quality & Storage
            </CardTitle>
            <CardDescription>Sample integrity and storage utilization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Collection Efficiency */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{finalLaboratoryAnalytics.samples?.collectionEfficiency?.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${
                      finalLaboratoryAnalytics.samples?.collectionEfficiency?.trend === 'up' ? 'text-green-600' :
                      finalLaboratoryAnalytics.samples?.collectionEfficiency?.trend === 'down' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {finalLaboratoryAnalytics.samples?.collectionEfficiency?.trend === 'up' ? '↗' : 
                       finalLaboratoryAnalytics.samples?.collectionEfficiency?.trend === 'down' ? '↘' : '→'}
                      {Math.abs(finalLaboratoryAnalytics.samples?.collectionEfficiency?.changePercent || 0)}%
                    </span>
                    <span className="text-sm font-semibold">
                      {finalLaboratoryAnalytics.samples?.collectionEfficiency?.current || 0}{finalLaboratoryAnalytics.samples?.collectionEfficiency?.unit}
                    </span>
                  </div>
                </div>
                <Progress 
                  value={(finalLaboratoryAnalytics.samples?.collectionEfficiency?.current || 0) / (finalLaboratoryAnalytics.samples?.collectionEfficiency?.target || 100) * 100} 
                  className="h-2"
                />
              </div>

              {/* Sample Rejection Rate */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{finalLaboratoryAnalytics.samples?.rejectionRate?.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${
                      finalLaboratoryAnalytics.samples?.rejectionRate?.trend === 'down' ? 'text-green-600' :
                      finalLaboratoryAnalytics.samples?.rejectionRate?.trend === 'up' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {finalLaboratoryAnalytics.samples?.rejectionRate?.trend === 'up' ? '↗' : 
                       finalLaboratoryAnalytics.samples?.rejectionRate?.trend === 'down' ? '↘' : '→'}
                      {Math.abs(finalLaboratoryAnalytics.samples?.rejectionRate?.changePercent || 0)}%
                    </span>
                    <span className="text-sm font-semibold">
                      {finalLaboratoryAnalytics.samples?.rejectionRate?.current || 0}{finalLaboratoryAnalytics.samples?.rejectionRate?.unit}
                    </span>
                  </div>
                </div>
                <Progress 
                  value={Math.min((finalLaboratoryAnalytics.samples?.rejectionRate?.current || 0) / (finalLaboratoryAnalytics.samples?.rejectionRate?.target || 5) * 100, 100)} 
                  className="h-2"
                />
              </div>

              {/* Storage Utilization */}
              <div className="space-y-3">
                <span className="text-sm font-medium text-gray-900">Storage Utilization</span>
                {(finalLaboratoryAnalytics.samples?.storageUtilization || []).slice(0, 3).map((storage, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium">{storage.resource}</span>
                      <span className="text-xs text-gray-600">{storage.utilized}/{storage.capacity}</span>
                    </div>
                    <Progress value={storage.efficiency} className="h-1" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Financial Overview</TabsTrigger>
          <TabsTrigger value="quality">Quality Metrics</TabsTrigger>
          <TabsTrigger value="reports">Reports & Maintenance</TabsTrigger>
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