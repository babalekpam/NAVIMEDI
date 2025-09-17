import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { 
  Pill, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Package,
  DollarSign,
  BarChart3,
  PieChart,
  Activity,
  Shield,
  Target,
  Loader2
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

export default function PharmacyDashboard() {
  const { user, tenant } = useAuth();

  // Fetch real pharmacy analytics data from API
  const { data: analyticsData, isLoading: analyticsLoading, error: analyticsError } = useQuery({
    queryKey: ['/api/analytics/pharmacy'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // 30 seconds
  });

  // Transform API response to dashboard format
  const transformPharmacyAnalytics = useMemo(() => {
    if (!analyticsData) return null;

    try {
      // Transform workflow data
      const workflow = {
        queueStatus: (analyticsData.workflow?.queueStatus || []).map((item: any, index: number) => {
          const colors = ["#3b82f6", "#f59e0b", "#22c55e", "#ef4444", "#6b7280", "#8b5cf6"];
          return {
            name: item.name || item.status || '',
            value: Number(item.value) || Number(item.count) || 0,
            percentage: Number(item.percentage) || 0,
            color: item.color || colors[index % colors.length]
          };
        }),
        processingTimes: (analyticsData.workflow?.processingTimes || []).map((item: any) => ({
          timestamp: item.timestamp || item.period || '',
          value: Number(item.value) || Number(item.time) || 0,
          target: Number(item.target) || 30,
          metadata: item.metadata || {}
        })),
        workflowStages: (analyticsData.workflow?.workflowStages || []).map((item: any) => ({
          stage: item.stage || item.name || '',
          count: Number(item.count) || 0,
          averageTime: Number(item.averageTime) || Number(item.avgTime) || 0
        }))
      };

      // Transform inventory data
      const inventory = {
        stockLevels: (analyticsData.inventory?.stockLevels || []).map((item: any) => ({
          medication: item.medication || item.name || '',
          currentStock: Number(item.currentStock) || Number(item.stock) || 0,
          reorderLevel: Number(item.reorderLevel) || Number(item.minLevel) || 0,
          maxStock: Number(item.maxStock) || Number(item.maxLevel) || 0,
          status: item.status || 'normal'
        })),
        reorderAlerts: (analyticsData.inventory?.reorderAlerts || []).map((item: any) => ({
          medication: item.medication || item.name || '',
          currentStock: Number(item.currentStock) || Number(item.stock) || 0,
          reorderLevel: Number(item.reorderLevel) || 0,
          daysLeft: Number(item.daysLeft) || 0,
          priority: item.priority || 'medium'
        })),
        turnoverRates: (analyticsData.inventory?.turnoverRates || []).map((item: any) => ({
          period: item.period || item.month || '',
          turnover: Number(item.turnover) || Number(item.rate) || 0,
          target: Number(item.target) || 8
        }))
      };

      // Transform performance data
      const performance = {
        processingEfficiency: (analyticsData.performance?.processingEfficiency || []).map((item: any) => ({
          name: item.name || item.metric || '',
          current: Number(item.current) || 0,
          previous: Number(item.previous) || 0,
          target: Number(item.target) || 0,
          unit: item.unit || '%',
          trend: item.trend || 'stable',
          changePercent: Number(item.changePercent) || 0
        })),
        insuranceVerificationRates: (analyticsData.performance?.insuranceVerificationRates || []).map((item: any) => ({
          period: item.period || item.day || '',
          rate: Number(item.rate) || Number(item.percentage) || 0,
          processed: Number(item.processed) || Number(item.count) || 0,
          target: Number(item.target) || 95
        }))
      };

      // Transform financial data
      const financial = {
        revenueData: (analyticsData.financial?.revenueData || []).map((item: any) => ({
          period: item.period || item.month || '',
          revenue: Number(item.revenue) || Number(item.total) || 0,
          prescriptions: Number(item.prescriptions) || Number(item.rxRevenue) || 0,
          otc: Number(item.otc) || Number(item.otcRevenue) || 0,
          target: Number(item.target) || 0
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
          const colors = ["#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6", "#06b6d4"];
          return {
            type: item.type || item.errorType || '',
            count: Number(item.count) || Number(item.errors) || 0,
            color: item.color || colors[index % colors.length]
          };
        })
      };

      return {
        today: analyticsData.today || {},
        workflow,
        inventory,
        performance,
        financial,
        quality
      };
    } catch (error) {
      console.error('Error transforming pharmacy analytics data:', error);
      return null;
    }
  }, [analyticsData]);

  // Generate fallback data for loading/error states
  const getFallbackPharmacyAnalytics = () => ({
    today: {
      prescriptionsReceived: 45,
      prescriptionsProcessed: 38,
      prescriptionsReady: 12,
      prescriptionsDispensed: 34,
      averageProcessingTime: 28,
      insuranceVerifications: 42
    },
    workflow: {
      queueStatus: [
        { name: "Received", value: 45, percentage: 32.4, color: "#3b82f6" },
        { name: "Processing", value: 23, percentage: 16.5, color: "#f59e0b" },
        { name: "Ready", value: 34, percentage: 24.5, color: "#22c55e" },
        { name: "Dispensed", value: 37, percentage: 26.6, color: "#6b7280" }
      ],
      processingTimes: [
        { timestamp: "Mon", value: 25, target: 30 },
        { timestamp: "Tue", value: 28, target: 30 },
        { timestamp: "Wed", value: 32, target: 30 },
        { timestamp: "Thu", value: 27, target: 30 },
        { timestamp: "Fri", value: 24, target: 30 },
        { timestamp: "Sat", value: 29, target: 30 },
        { timestamp: "Sun", value: 26, target: 30 }
      ],
      workflowStages: [
        { stage: "Receive", count: 45, averageTime: 2 },
        { stage: "Verify Insurance", count: 42, averageTime: 8 },
        { stage: "Fill Prescription", count: 38, averageTime: 15 },
        { stage: "Quality Check", count: 37, averageTime: 5 },
        { stage: "Ready for Pickup", count: 34, averageTime: 0 }
      ]
    },
    inventory: {
      stockLevels: [
        { medication: "Amoxicillin 500mg", currentStock: 150, reorderLevel: 50, maxStock: 300, status: "normal" },
        { medication: "Lisinopril 10mg", currentStock: 25, reorderLevel: 40, maxStock: 200, status: "low" },
        { medication: "Metformin 850mg", currentStock: 8, reorderLevel: 30, maxStock: 250, status: "critical" },
        { medication: "Atorvastatin 40mg", currentStock: 89, reorderLevel: 35, maxStock: 180, status: "normal" }
      ],
      reorderAlerts: [
        { medication: "Metformin 850mg", currentStock: 8, reorderLevel: 30, daysLeft: 2, priority: "high" },
        { medication: "Lisinopril 10mg", currentStock: 25, reorderLevel: 40, daysLeft: 7, priority: "medium" }
      ],
      turnoverRates: [
        { period: "Jan", turnover: 8.2, target: 8 },
        { period: "Feb", turnover: 7.8, target: 8 },
        { period: "Mar", turnover: 8.5, target: 8 },
        { period: "Apr", turnover: 8.9, target: 8 },
        { period: "May", turnover: 9.1, target: 8 },
        { period: "Jun", turnover: 8.7, target: 8 }
      ]
    },
    performance: {
      processingEfficiency: [
        { name: "Fill Rate", current: 94.2, previous: 92.8, target: 95, unit: "%", trend: "up", changePercent: 1.5 },
        { name: "Processing Time", current: 28, previous: 32, target: 30, unit: "min", trend: "down", changePercent: -12.5 },
        { name: "Customer Satisfaction", current: 4.7, previous: 4.5, target: 4.5, unit: "/5", trend: "up", changePercent: 4.4 }
      ],
      insuranceVerificationRates: [
        { period: "Mon", rate: 96, processed: 45, target: 95 },
        { period: "Tue", rate: 94, processed: 48, target: 95 },
        { period: "Wed", rate: 97, processed: 52, target: 95 },
        { period: "Thu", rate: 93, processed: 47, target: 95 },
        { period: "Fri", rate: 98, processed: 55, target: 95 },
        { period: "Sat", rate: 95, processed: 38, target: 95 },
        { period: "Sun", rate: 96, processed: 32, target: 95 }
      ]
    },
    financial: {
      revenueData: [
        { period: "Jan", revenue: 48600, prescriptions: 38900, otc: 9700, target: 50000 },
        { period: "Feb", revenue: 52300, prescriptions: 41800, otc: 10500, target: 52000 },
        { period: "Mar", revenue: 49800, prescriptions: 39600, otc: 10200, target: 51000 },
        { period: "Apr", revenue: 54100, prescriptions: 43300, otc: 10800, target: 53000 },
        { period: "May", revenue: 56700, prescriptions: 45400, otc: 11300, target: 55000 },
        { period: "Jun", revenue: 58200, prescriptions: 46600, otc: 11600, target: 57000 }
      ],
      costAnalysis: [
        { category: "Medications", amount: 28900, percentage: 58.2 },
        { category: "Staff", amount: 12400, percentage: 25.0 },
        { category: "Equipment", amount: 4200, percentage: 8.5 },
        { category: "Facilities", amount: 2800, percentage: 5.6 },
        { category: "Other", amount: 1400, percentage: 2.7 }
      ]
    },
    quality: {
      accuracyRates: [
        { period: "Jan", rate: 99.2, errors: 12, target: 99.5 },
        { period: "Feb", rate: 99.4, errors: 9, target: 99.5 },
        { period: "Mar", rate: 99.6, errors: 6, target: 99.5 },
        { period: "Apr", rate: 99.3, errors: 11, target: 99.5 },
        { period: "May", rate: 99.7, errors: 4, target: 99.5 },
        { period: "Jun", rate: 99.5, errors: 7, target: 99.5 }
      ],
      errorTracking: [
        { type: "Dosage Error", count: 15, color: "#ef4444" },
        { type: "Wrong Medication", count: 8, color: "#f59e0b" },
        { type: "Patient Mix-up", count: 5, color: "#3b82f6" },
        { type: "Insurance Issue", count: 12, color: "#8b5cf6" },
        { type: "Other", count: 9, color: "#06b6d4" }
      ]
    }
  });

  // Use real analytics data if available, fallback if loading/error
  const finalPharmacyAnalytics = transformPharmacyAnalytics || getFallbackPharmacyAnalytics();

  // Chart configurations
  const chartConfigs = useMemo(() => {
    const baseConfig: ChartConfig = {
      value: { label: "Value", color: "hsl(220, 98%, 61%)" },
      target: { label: "Target", color: "hsl(0, 0%, 45%)" },
      revenue: { label: "Revenue", color: "hsl(142, 76%, 36%)" },
      prescriptions: { label: "Prescriptions", color: "hsl(220, 98%, 61%)" },
      otc: { label: "OTC", color: "hsl(35, 91%, 62%)" }
    };
    return baseConfig;
  }, []);

  // Data safety guards for chart inputs
  const safeChartData = (data: any[]) => {
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }
    return data.map(item => ({
      ...item,
      value: typeof item.value === 'number' && isFinite(item.value) ? item.value : 0,
      target: typeof item.target === 'number' && isFinite(item.target) ? item.target : undefined,
      revenue: typeof item.revenue === 'number' && isFinite(item.revenue) ? item.revenue : 0,
      rate: typeof item.rate === 'number' && isFinite(item.rate) ? item.rate : 0,
      current: typeof item.current === 'number' && isFinite(item.current) ? item.current : 0,
      currentStock: typeof item.currentStock === 'number' && isFinite(item.currentStock) ? item.currentStock : 0
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'prescribed': return 'bg-blue-100 text-blue-800';
      case 'received': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'dispensed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockColor = (status: string) => {
    switch (status) {
      case 'normal': 
      case 'good': return 'text-green-600';
      case 'low': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Show loading state while analytics are being fetched
  if (analyticsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pharmacy Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back to {tenant?.name || 'Pharmacy'} management portal
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pharmacy Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back to {tenant?.name || 'Pharmacy'} management portal
        </p>
        {analyticsError && (
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              Analytics temporarily unavailable. Showing sample data.
            </p>
          </div>
        )}
      </div>

      {/* Today's Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card data-testid="metric-received">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Received Today</CardTitle>
            <AlertCircle className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{finalPharmacyAnalytics.today?.prescriptionsReceived || 0}</div>
            <p className="text-xs text-gray-500 mt-1">New prescriptions</p>
          </CardContent>
        </Card>

        <Card data-testid="metric-processed">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Processed</CardTitle>
            <Activity className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{finalPharmacyAnalytics.today?.prescriptionsProcessed || 0}</div>
            <p className="text-xs text-gray-500 mt-1">In workflow</p>
          </CardContent>
        </Card>

        <Card data-testid="metric-ready">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ready for Pickup</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{finalPharmacyAnalytics.today?.prescriptionsReady || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Awaiting pickup</p>
          </CardContent>
        </Card>

        <Card data-testid="metric-dispensed">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Dispensed</CardTitle>
            <Pill className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{finalPharmacyAnalytics.today?.prescriptionsDispensed || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Completed today</p>
          </CardContent>
        </Card>

        <Card data-testid="metric-processing-time">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Processing</CardTitle>
            <Clock className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{finalPharmacyAnalytics.today?.averageProcessingTime || 0}min</div>
            <p className="text-xs text-gray-500 mt-1">Processing time</p>
          </CardContent>
        </Card>

        <Card data-testid="metric-insurance">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Insurance Verified</CardTitle>
            <Shield className="h-5 w-5 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{finalPharmacyAnalytics.today?.insuranceVerifications || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Verified today</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workflow Queue Status */}
        <Card data-testid="chart-workflow-status">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Workflow Queue Status
            </CardTitle>
            <CardDescription>Current prescription workflow distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={chartConfigs}
              className="h-[300px]"
            >
              <RechartsPieChart>
                <Pie
                  data={safeChartData(finalPharmacyAnalytics.workflow?.queueStatus || [])}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                >
                  {finalPharmacyAnalytics.workflow?.queueStatus?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </RechartsPieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Processing Times Trend */}
        <Card data-testid="chart-processing-times">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Processing Times
            </CardTitle>
            <CardDescription>Daily average processing times vs targets</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={chartConfigs}
              className="h-[300px]"
            >
              <LineChart data={safeChartData(finalPharmacyAnalytics.workflow?.processingTimes || [])}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Actual Time (min)"
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#6b7280" 
                  strokeDasharray="5 5"
                  name="Target (min)"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Workflow Stages */}
        <Card data-testid="chart-workflow-stages">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Workflow Stages
            </CardTitle>
            <CardDescription>Processing time by workflow stage</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={chartConfigs}
              className="h-[300px]"
            >
              <BarChart data={safeChartData(finalPharmacyAnalytics.workflow?.workflowStages || [])}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="averageTime" fill="#3b82f6" name="Avg Time (min)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Stock Levels */}
        <Card data-testid="chart-stock-levels">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Inventory Stock Levels
            </CardTitle>
            <CardDescription>Current stock vs reorder levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(finalPharmacyAnalytics.inventory?.stockLevels || []).slice(0, 6).map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{item.medication}</span>
                    <div className={`flex items-center gap-1 ${getStockColor(item.status)}`}>
                      <span className="text-xs">{item.currentStock} units</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.status === 'critical' ? 'bg-red-100 text-red-800' :
                        item.status === 'low' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                  <Progress 
                    value={(item.currentStock / item.maxStock) * 100} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Reorder: {item.reorderLevel}</span>
                    <span>Max: {item.maxStock}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trends */}
        <Card data-testid="chart-revenue">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue Trends
            </CardTitle>
            <CardDescription>Monthly revenue breakdown by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={chartConfigs}
              className="h-[300px]"
            >
              <AreaChart data={safeChartData(finalPharmacyAnalytics.financial?.revenueData || [])}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area 
                  type="monotone" 
                  dataKey="prescriptions" 
                  stackId="1"
                  stroke="#3b82f6" 
                  fill="#3b82f6"
                  name="Prescriptions"
                />
                <Area 
                  type="monotone" 
                  dataKey="otc" 
                  stackId="1"
                  stroke="#f59e0b" 
                  fill="#f59e0b"
                  name="OTC Products"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card data-testid="chart-performance">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
            <CardDescription>Key performance indicators vs targets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {(finalPharmacyAnalytics.performance?.processingEfficiency || []).map((metric, index) => (
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
      </div>

      {/* Critical Alerts Section */}
      {(finalPharmacyAnalytics.inventory?.reorderAlerts || []).length > 0 && (
        <Card data-testid="reorder-alerts">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  Critical Inventory Alerts
                </CardTitle>
                <CardDescription>Medications requiring immediate attention</CardDescription>
              </div>
              <Badge variant="destructive">
                {finalPharmacyAnalytics.inventory?.reorderAlerts?.length || 0}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {finalPharmacyAnalytics.inventory?.reorderAlerts?.map((alert, index) => (
                <div key={index} className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-red-900">{alert.medication}</span>
                    <Badge className={getPriorityColor(alert.priority)}>
                      {alert.priority}
                    </Badge>
                  </div>
                  <div className="text-sm text-red-700">
                    Stock: {alert.currentStock} units (Reorder at {alert.reorderLevel})
                  </div>
                  <div className="text-xs text-red-600 mt-1">
                    Estimated {alert.daysLeft} days remaining
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}