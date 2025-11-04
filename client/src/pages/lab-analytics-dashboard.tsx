import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig 
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  Label
} from "recharts";
import { 
  BarChart3, 
  Target,
  DollarSign,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  BarChart as BarChartIcon,
  Timer,
  FileText,
  Settings,
  Download,
  ArrowUp,
  ArrowDown,
  Minus,
  Cpu
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/contexts/tenant-context";
import { useTranslation } from "@/contexts/translation-context";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface AnalyticsMetric {
  id: string;
  name: string;
  value: string | number;
  change: number;
  trend: "up" | "down" | "neutral";
  period: string;
  unit?: string;
  target?: number;
  status: "excellent" | "good" | "warning" | "critical";
}

interface VolumeData {
  period: string;
  tests: number;
  samples: number;
  reports: number;
  criticalValues: number;
}

interface TurnaroundData {
  testType: string;
  averageTAT: number; // in hours
  target: number;
  variance: number;
  performance: "excellent" | "good" | "warning" | "poor";
}

interface QualityMetric {
  id: string;
  metric: string;
  value: number;
  target: number;
  unit: string;
  status: "pass" | "warning" | "fail";
  trend: "improving" | "stable" | "declining";
}

interface FinancialData {
  period: string;
  revenue: number;
  costs: number;
  margin: number;
  testsPerformed: number;
  revenuePerTest: number;
}

export default function LabAnalyticsDashboard() {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { t } = useTranslation();

  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedMetrics, setSelectedMetrics] = useState("all");

  // Fetch real laboratory analytics data from API
  const { data: realAnalyticsData, isLoading: analyticsLoading, error: analyticsError } = useQuery({
    queryKey: ['/api/analytics/laboratory-test'],
    staleTime: 60 * 1000, // 1 minute - reasonable cache time
    refetchInterval: 30 * 1000, // 30 seconds - regular updates for analytics
    refetchIntervalInBackground: false, // Don't poll when tab inactive
    retry: 3,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // Extract real data from API response
  const apiData: any = realAnalyticsData?.data || {};

  // Always construct real data metrics - no mock data fallback
  const realMetrics: AnalyticsMetric[] = [
    {
      id: "1",
      name: "Total Tests This Month",
      value: apiData?.today?.ordersReceived || 0,
      change: 0,
      trend: "neutral" as const,
      period: "vs last month", 
      status: "good" as const
    },
    {
      id: "2", 
      name: "Average TAT",
      value: apiData?.today?.averageTurnaroundTime || 0,
      change: 0,
      trend: "neutral" as const,
      period: "hours",
      unit: "h",
      status: "good" as const
    },
    {
      id: "3",
      name: "Quality Score", 
      value: apiData?.quality?.accuracyMetrics?.[0]?.current || 0,
      change: 0,
      trend: "neutral" as const,
      period: "vs last month",
      unit: "%",
      status: "good" as const
    },
    {
      id: "4",
      name: "Critical Values",
      value: apiData?.today?.criticalResults || 0,
      change: 0,
      trend: "neutral" as const,
      period: "this month",
      status: "good" as const
    },
    {
      id: "5",
      name: "Samples Collected",
      value: apiData?.today?.samplesCollected || 0,
      change: 0,
      trend: "neutral" as const,
      period: "this month",
      status: "good" as const
    },
    {
      id: "6",
      name: "Tests In Progress",
      value: apiData?.today?.testsInProgress || 0,
      change: 0,
      trend: "neutral" as const,
      period: "currently",
      status: "good" as const
    }
  ];

  // Real volume data from API (empty array if no data)
  const realVolumeData: VolumeData[] = apiData?.volume?.weeklyData || [];

  // Real turnaround data from API (empty array if no data)
  const realTurnaroundData: TurnaroundData[] = apiData?.turnaround?.byTestType || [];

  // Real quality metrics from API (empty array if no data)
  const realQualityMetrics: QualityMetric[] = apiData?.quality?.metrics || [];

  // Real financial data from API (empty array if no data)
  const realFinancialData: FinancialData[] = apiData?.financial?.monthlyData || [];

  // Real test distribution from API (empty array if no data)
  const realTestDistributionData = apiData?.distribution?.byCategory || [];

  // Real quality trends from API (empty array if no data)
  const realQualityTrendsData = apiData?.quality?.trends || [];

  // Real equipment data from API (empty array if no data)
  const realEquipmentData = apiData?.equipment?.utilization || [];

  // Real system performance from API (empty array if no data)
  const realSystemPerformanceData = apiData?.system?.performance || [];

  // Check if all data is empty
  const hasAnyData = 
    realMetrics.some(m => typeof m.value === 'number' ? m.value > 0 : false) ||
    realVolumeData.length > 0 ||
    realTurnaroundData.length > 0 ||
    realQualityMetrics.length > 0 ||
    realFinancialData.length > 0 ||
    realTestDistributionData.length > 0 ||
    realQualityTrendsData.length > 0 ||
    realEquipmentData.length > 0 ||
    realSystemPerformanceData.length > 0;

  // Chart configurations
  const volumeChartConfig = {
    tests: {
      label: "Tests",
      color: "hsl(var(--chart-1))",
    },
    samples: {
      label: "Samples", 
      color: "hsl(var(--chart-2))",
    },
    reports: {
      label: "Reports",
      color: "hsl(var(--chart-3))",
    },
    criticalValues: {
      label: "Critical Values",
      color: "hsl(var(--chart-4))",
    },
  } satisfies ChartConfig;

  const distributionChartConfig = {
    hematology: {
      label: "Hematology",
      color: "hsl(220, 98%, 61%)",
    },
    chemistry: {
      label: "Chemistry", 
      color: "hsl(142, 76%, 36%)",
    },
    microbiology: {
      label: "Microbiology",
      color: "hsl(346, 87%, 43%)",
    },
    molecular: {
      label: "Molecular",
      color: "hsl(271, 91%, 65%)",
    },
    immunology: {
      label: "Immunology",
      color: "hsl(35, 91%, 62%)",
    },
  } satisfies ChartConfig;

  const turnaroundChartConfig = {
    actual: {
      label: "Actual Time",
      color: "hsl(var(--chart-1))",
    },
    target: {
      label: "Target Time",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  const qualityChartConfig = {
    score: {
      label: "Quality Score",
      color: "hsl(142, 76%, 36%)",
    },
  } satisfies ChartConfig;

  const financialChartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(142, 76%, 36%)",
    },
    costs: {
      label: "Costs",
      color: "hsl(346, 87%, 43%)",
    },
    margin: {
      label: "Profit Margin",
      color: "hsl(220, 98%, 61%)",
    },
    revenuePerTest: {
      label: "Revenue per Test",
      color: "hsl(271, 91%, 65%)",
    },
  } satisfies ChartConfig;

  const equipmentChartConfig = {
    utilization: {
      label: "Utilization",
      color: "hsl(220, 98%, 61%)",
    },
    uptime: {
      label: "Uptime",
      color: "hsl(142, 76%, 36%)",
    },
  } satisfies ChartConfig;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return "text-green-700 bg-green-100";
      case "good": return "text-blue-700 bg-blue-100";
      case "warning": return "text-yellow-700 bg-yellow-100";
      case "critical": return "text-red-700 bg-red-100";
      default: return "text-gray-700 bg-gray-100";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <ArrowUp className="h-4 w-4 text-green-600" />;
      case "down": return <ArrowDown className="h-4 w-4 text-red-600" />;
      case "neutral": return <Minus className="h-4 w-4 text-gray-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case "excellent": return "bg-green-100 text-green-800";
      case "good": return "bg-blue-100 text-blue-800";
      case "warning": return "bg-yellow-100 text-yellow-800";
      case "poor": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getQualityStatusColor = (status: string) => {
    switch (status) {
      case "pass": return "bg-green-100 text-green-800";
      case "warning": return "bg-yellow-100 text-yellow-800";
      case "fail": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Show loading state
  if (analyticsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="data-loading">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Show welcome message for new laboratories with no data
  // Show when: (a) API error OR (b) API success but no data exists
  if (analyticsError || !realAnalyticsData || !realAnalyticsData.success || !hasAnyData) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="empty-state">
        <div className="text-center max-w-2xl mx-auto p-8">
          <BarChart3 className="mx-auto h-16 w-16 text-blue-600 mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Laboratory Analytics Dashboard</h2>
          <p className="text-lg text-gray-600 mb-6">
            Welcome to your new laboratory! Analytics data will appear here once you start processing:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left text-gray-700 max-w-xl mx-auto mb-8">
            <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
              <div className="text-blue-600 font-bold text-xl">✓</div>
              <div>
                <h3 className="font-semibold">Lab Orders</h3>
                <p className="text-sm text-gray-600">Receive and process test orders</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
              <div className="text-green-600 font-bold text-xl">✓</div>
              <div>
                <h3 className="font-semibold">Sample Collection</h3>
                <p className="text-sm text-gray-600">Track samples and specimens</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg">
              <div className="text-purple-600 font-bold text-xl">✓</div>
              <div>
                <h3 className="font-semibold">Test Results</h3>
                <p className="text-sm text-gray-600">Generate and deliver results</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-orange-50 rounded-lg">
              <div className="text-orange-600 font-bold text-xl">✓</div>
              <div>
                <h3 className="font-semibold">Quality Metrics</h3>
                <p className="text-sm text-gray-600">Monitor performance and quality</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Start by exploring the Lab Orders and Sample Management sections of your dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" data-testid="lab-analytics-dashboard">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="h-8 w-8 mr-3 text-blue-600" />
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive laboratory performance insights and analytics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {realMetrics.map((metric) => (
          <Card key={metric.id} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <p className="text-3xl font-bold text-gray-900">
                      {metric.value}
                      {metric.unit && <span className="text-lg">{metric.unit}</span>}
                    </p>
                    {getTrendIcon(metric.trend)}
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className={cn("text-xs", getStatusColor(metric.status))}>
                      {metric.change > 0 ? "+" : ""}{metric.change}% {metric.period}
                    </Badge>
                    {metric.target && (
                      <span className="text-xs text-gray-500">
                        Target: {metric.target}{metric.unit}
                      </span>
                    )}
                  </div>
                </div>
                <div className={cn("w-2 h-16 rounded-full", 
                  metric.status === "excellent" ? "bg-green-500" :
                  metric.status === "good" ? "bg-blue-500" :
                  metric.status === "warning" ? "bg-yellow-500" : "bg-red-500"
                )}>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Analytics Content */}
      <Tabs defaultValue="volume" className="space-y-6">
        <TabsList>
          <TabsTrigger value="volume" className="flex items-center">
            <BarChartIcon className="w-4 h-4 mr-2" />
            Volume Trends
          </TabsTrigger>
          <TabsTrigger value="turnaround" className="flex items-center">
            <Timer className="w-4 h-4 mr-2" />
            Turnaround Time
          </TabsTrigger>
          <TabsTrigger value="quality" className="flex items-center">
            <Target className="w-4 h-4 mr-2" />
            Quality Metrics
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center">
            <DollarSign className="w-4 h-4 mr-2" />
            Financial
          </TabsTrigger>
          <TabsTrigger value="equipment" className="flex items-center">
            <Cpu className="w-4 h-4 mr-2" />
            Equipment
          </TabsTrigger>
        </TabsList>

        {/* Volume Trends Tab */}
        <TabsContent value="volume" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Test Volume</CardTitle>
                <CardDescription>Number of tests processed each week</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={volumeChartConfig} className="h-[350px]">
                  <AreaChart
                    accessibilityLayer
                    data={realVolumeData}
                    margin={{
                      left: 12,
                      right: 12,
                      top: 12,
                      bottom: 12,
                    }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="period"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      fontSize={12}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      fontSize={12}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent />}
                    />
                    <defs>
                      <linearGradient id="fillTests" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="var(--color-tests)"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--color-tests)"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                      <linearGradient id="fillSamples" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="var(--color-samples)"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--color-samples)"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <Area
                      dataKey="tests"
                      type="natural"
                      fill="url(#fillTests)"
                      fillOpacity={0.4}
                      stroke="var(--color-tests)"
                      stackId="a"
                    />
                    <Area
                      dataKey="samples"
                      type="natural"
                      fill="url(#fillSamples)"
                      fillOpacity={0.4}
                      stroke="var(--color-samples)"
                      stackId="a"
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Distribution</CardTitle>
                <CardDescription>Breakdown by test category</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={distributionChartConfig}
                  className="mx-auto aspect-square max-h-[350px]"
                >
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                      data={realTestDistributionData}
                      dataKey="count"
                      nameKey="category"
                      innerRadius={60}
                      strokeWidth={5}
                    >
                      <Label
                        content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            return (
                              <text
                                x={viewBox.cx}
                                y={viewBox.cy}
                                textAnchor="middle"
                                dominantBaseline="middle"
                              >
                                <tspan
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  className="fill-foreground text-3xl font-bold"
                                >
                                  {realTestDistributionData.reduce((a: number, b: any) => a + (b.count || 0), 0).toLocaleString()}
                                </tspan>
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) + 24}
                                  className="fill-muted-foreground"
                                >
                                  Total Tests
                                </tspan>
                              </text>
                            )
                          }
                        }}
                      />
                    </Pie>
                    <ChartLegend
                      content={<ChartLegendContent />}
                      className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                    />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Turnaround Time Tab */}
        <TabsContent value="turnaround" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Turnaround Time Analysis</CardTitle>
              <CardDescription>Average processing time by test type vs targets</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={turnaroundChartConfig} className="h-[400px]">
                <BarChart
                  accessibilityLayer
                  data={realTurnaroundData.map(item => ({
                    testType: item.testType.replace(/\s+/g, '\n'),
                    actual: item.averageTAT,
                    target: item.target,
                    performance: item.performance
                  }))}
                  layout="horizontal"
                  margin={{
                    left: 80,
                    right: 12,
                    top: 12,
                    bottom: 12,
                  }}
                >
                  <CartesianGrid horizontal={false} />
                  <XAxis
                    type="number"
                    dataKey="actual"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={12}
                    domain={[0, 'dataMax + 1']}
                    label={{ value: 'Hours', position: 'insideBottom', offset: -10 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="testType"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    fontSize={11}
                    width={120}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                    formatter={(value, name, props) => [
                      `${value}h`,
                      name === 'actual' ? `Actual Time` : 'Target Time'
                    ]}
                    labelFormatter={(label) => `Test: ${label?.replace(/\n/g, ' ')}`}
                  />
                  <Bar
                    dataKey="target"
                    fill="hsl(var(--muted))"
                    opacity={0.5}
                    name="target"
                  />
                  <Bar dataKey="actual" name="actual">
                    {realTurnaroundData.map((entry, index) => {
                      const performance = entry.performance;
                      let fillColor;
                      switch (performance) {
                        case 'excellent': fillColor = 'hsl(142, 76%, 36%)'; break;
                        case 'good': fillColor = 'hsl(220, 98%, 61%)'; break;
                        case 'warning': fillColor = 'hsl(35, 91%, 62%)'; break;
                        case 'poor': fillColor = 'hsl(346, 87%, 43%)'; break;
                        default: fillColor = 'hsl(var(--chart-1))';
                      }
                      return <Cell key={`cell-${index}`} fill={fillColor} />;
                    })}
                  </Bar>
                </BarChart>
              </ChartContainer>
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-green-500"></div>
                  <span className="text-sm">Excellent</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-blue-500"></div>
                  <span className="text-sm">Good</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-yellow-500"></div>
                  <span className="text-sm">Warning</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-red-500"></div>
                  <span className="text-sm">Poor</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quality Metrics Tab */}
        <TabsContent value="quality" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quality Control Metrics</CardTitle>
                <CardDescription>Key quality indicators and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  {realQualityMetrics.slice(0, 4).map((metric) => {
                    const percentage = (metric.value / metric.target) * 100;
                    const cappedPercentage = Math.min(percentage, 100);
                    const radialData = [{ value: cappedPercentage, fill: 
                      metric.status === 'pass' ? 'hsl(142, 76%, 36%)' : 
                      metric.status === 'warning' ? 'hsl(35, 91%, 62%)' : 'hsl(346, 87%, 43%)'
                    }];
                    
                    return (
                      <div key={metric.id} className="text-center">
                        <ChartContainer
                          config={{
                            value: {
                              label: metric.metric,
                              color: metric.status === 'pass' ? 'hsl(142, 76%, 36%)' : 
                                     metric.status === 'warning' ? 'hsl(35, 91%, 62%)' : 'hsl(346, 87%, 43%)'
                            },
                          }}
                          className="mx-auto aspect-square max-h-[120px]"
                        >
                          <RadialBarChart
                            data={radialData}
                            startAngle={90}
                            endAngle={-270}
                            innerRadius={30}
                            outerRadius={50}
                          >
                            <RadialBar
                              dataKey="value"
                              cornerRadius={10}
                              fill="var(--color-value)"
                            />
                            <ChartTooltip
                              content={({ payload }) => {
                                if (payload && payload[0]) {
                                  return (
                                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                                      <div className="font-medium">{metric.metric}</div>
                                      <div className="text-sm text-muted-foreground">
                                        {metric.value}{metric.unit} / {metric.target}{metric.unit}
                                      </div>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Label
                              value={`${metric.value}${metric.unit}`}
                              position="center"
                              className="text-lg font-bold fill-foreground"
                            />
                          </RadialBarChart>
                        </ChartContainer>
                        <div className="mt-2">
                          <p className="text-sm font-medium">{metric.metric}</p>
                          <p className="text-xs text-gray-500">Target: {metric.target}{metric.unit}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quality Trends</CardTitle>
                <CardDescription>Monthly quality score improvement</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={qualityChartConfig} className="h-[300px]">
                  <LineChart
                    accessibilityLayer
                    data={realQualityTrendsData}
                    margin={{
                      left: 12,
                      right: 12,
                      top: 12,
                      bottom: 12,
                    }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      fontSize={12}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      fontSize={12}
                      domain={['dataMin - 1', 'dataMax + 1']}
                      label={{ value: 'Quality Score (%)', angle: -90, position: 'insideLeft' }}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent />}
                      formatter={(value) => [`${value}%`, 'Quality Score']}
                    />
                    <Line
                      dataKey="score"
                      type="monotone"
                      stroke="var(--color-score)"
                      strokeWidth={3}
                      dot={{
                        fill: "var(--color-score)",
                        strokeWidth: 2,
                        r: 6,
                      }}
                      activeDot={{
                        r: 8,
                      }}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue & Costs Trend</CardTitle>
                <CardDescription>Monthly financial performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={financialChartConfig} className="h-[300px]">
                  <AreaChart
                    accessibilityLayer
                    data={realFinancialData}
                    margin={{
                      left: 12,
                      right: 12,
                      top: 12,
                      bottom: 12,
                    }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="period"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      fontSize={12}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      fontSize={12}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent />}
                      formatter={(value, name) => [
                        `$${Number(value).toLocaleString()}`,
                        name === 'revenue' ? 'Revenue' : 'Costs'
                      ]}
                    />
                    <defs>
                      <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="var(--color-revenue)"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--color-revenue)"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                      <linearGradient id="fillCosts" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="var(--color-costs)"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--color-costs)"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <Area
                      dataKey="costs"
                      type="natural"
                      fill="url(#fillCosts)"
                      fillOpacity={0.4}
                      stroke="var(--color-costs)"
                      stackId="a"
                    />
                    <Area
                      dataKey="revenue"
                      type="natural"
                      fill="url(#fillRevenue)"
                      fillOpacity={0.4}
                      stroke="var(--color-revenue)"
                      stackId="b"
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profit Margins & Revenue per Test</CardTitle>
                <CardDescription>Efficiency and profitability metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={financialChartConfig} className="h-[300px]">
                  <ComposedChart
                    accessibilityLayer
                    data={realFinancialData}
                    margin={{
                      left: 12,
                      right: 12,
                      top: 12,
                      bottom: 12,
                    }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="period"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      fontSize={12}
                    />
                    <YAxis
                      yAxisId="left"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      fontSize={12}
                      domain={[0, 50]}
                      label={{ value: 'Margin (%)', angle: -90, position: 'insideLeft' }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      fontSize={12}
                      domain={[40, 50]}
                      label={{ value: 'Revenue per Test ($)', angle: 90, position: 'insideRight' }}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent />}
                      formatter={(value, name) => {
                        if (name === 'margin') {
                          return [`${Number(value).toFixed(1)}%`, 'Profit Margin'];
                        }
                        return [`$${Number(value).toFixed(2)}`, 'Revenue per Test'];
                      }}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="margin"
                      fill="var(--color-margin)"
                      name="margin"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="revenuePerTest"
                      stroke="var(--color-revenuePerTest)"
                      strokeWidth={3}
                      dot={{ fill: "var(--color-revenuePerTest)", strokeWidth: 2, r: 4 }}
                      name="revenuePerTest"
                    />
                  </ComposedChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Equipment Tab */}
        <TabsContent value="equipment" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Equipment Utilization & Uptime</CardTitle>
                <CardDescription>Equipment performance comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={equipmentChartConfig} className="h-[350px]">
                  <BarChart
                    accessibilityLayer
                    data={realEquipmentData.map((item: any) => ({
                      equipment: item.equipment.replace(/\s+/g, '\n'),
                      utilization: item.utilization,
                      uptime: item.uptime,
                      status: item.status
                    }))}
                    layout="horizontal"
                    margin={{
                      left: 100,
                      right: 12,
                      top: 12,
                      bottom: 12,
                    }}
                  >
                    <CartesianGrid horizontal={false} />
                    <XAxis
                      type="number"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      fontSize={12}
                      domain={[0, 100]}
                      label={{ value: 'Percentage (%)', position: 'insideBottom', offset: -10 }}
                    />
                    <YAxis
                      type="category"
                      dataKey="equipment"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      fontSize={11}
                      width={140}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent />}
                      formatter={(value, name) => [
                        `${value}%`,
                        name === 'utilization' ? 'Utilization' : 'Uptime'
                      ]}
                    />
                    <Bar
                      dataKey="utilization"
                      fill="var(--color-utilization)"
                      name="utilization"
                      radius={4}
                    />
                    <Bar
                      dataKey="uptime"
                      fill="var(--color-uptime)"
                      name="uptime"
                      radius={4}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Performance Metrics</CardTitle>
                <CardDescription>Real-time system health indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  {realSystemPerformanceData.map((metric: any, index: number) => {
                    const radialData = [{ value: metric.value, fill: 
                      metric.status === 'excellent' ? 'hsl(142, 76%, 36%)' : 
                      metric.status === 'good' ? 'hsl(220, 98%, 61%)' : 'hsl(346, 87%, 43%)'
                    }];
                    
                    return (
                      <div key={index} className="text-center">
                        <ChartContainer
                          config={{
                            value: {
                              label: metric.metric,
                              color: metric.status === 'excellent' ? 'hsl(142, 76%, 36%)' : 
                                     metric.status === 'good' ? 'hsl(220, 98%, 61%)' : 'hsl(346, 87%, 43%)'
                            },
                          }}
                          className="mx-auto aspect-square max-h-[100px]"
                        >
                          <RadialBarChart
                            data={radialData}
                            startAngle={90}
                            endAngle={-270}
                            innerRadius={25}
                            outerRadius={40}
                          >
                            <RadialBar
                              dataKey="value"
                              cornerRadius={10}
                              fill="var(--color-value)"
                            />
                            <Label
                              value={`${metric.value}${metric.unit}`}
                              position="center"
                              className="text-sm font-bold fill-foreground"
                            />
                          </RadialBarChart>
                        </ChartContainer>
                        <div className="mt-2">
                          <p className="text-xs font-medium">{metric.metric}</p>
                          <Badge className={cn("text-xs mt-1", getStatusColor(metric.status))}>
                            {metric.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Summary Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common analytical tasks and reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex-col space-y-2">
              <FileText className="h-6 w-6" />
              <span>Monthly Report</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col space-y-2">
              <BarChart3 className="h-6 w-6" />
              <span>Custom Analytics</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col space-y-2">
              <Target className="h-6 w-6" />
              <span>Quality Review</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col space-y-2">
              <Settings className="h-6 w-6" />
              <span>Configure Alerts</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}