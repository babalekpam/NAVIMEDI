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

  // Mock data for demonstration
  const mockMetrics: AnalyticsMetric[] = [
    {
      id: "1",
      name: "Total Tests This Month",
      value: "2,847",
      change: 12.5,
      trend: "up",
      period: "vs last month",
      status: "excellent"
    },
    {
      id: "2", 
      name: "Average TAT",
      value: 4.2,
      change: -8.3,
      trend: "down",
      period: "hours",
      unit: "h",
      target: 4.5,
      status: "excellent"
    },
    {
      id: "3",
      name: "Quality Score",
      value: 98.7,
      change: 2.1,
      trend: "up",
      period: "%",
      unit: "%",
      target: 95,
      status: "excellent"
    },
    {
      id: "4",
      name: "Critical Values",
      value: 23,
      change: -15.2,
      trend: "down",
      period: "this month",
      status: "good"
    },
    {
      id: "5",
      name: "Revenue",
      value: "$127,450",
      change: 18.7,
      trend: "up",
      period: "this month",
      status: "excellent"
    },
    {
      id: "6",
      name: "Equipment Uptime",
      value: 99.2,
      change: 0.8,
      trend: "up",
      period: "%",
      unit: "%",
      target: 98,
      status: "excellent"
    }
  ];

  const mockVolumeData: VolumeData[] = [
    { period: "Week 1", tests: 687, samples: 523, reports: 612, criticalValues: 8 },
    { period: "Week 2", tests: 721, samples: 567, reports: 698, criticalValues: 12 },
    { period: "Week 3", tests: 695, samples: 541, reports: 673, criticalValues: 6 },
    { period: "Week 4", tests: 744, samples: 598, reports: 729, criticalValues: 9 }
  ];

  const mockTurnaroundData: TurnaroundData[] = [
    { testType: "Complete Blood Count", averageTAT: 2.1, target: 2.5, variance: -0.4, performance: "excellent" },
    { testType: "Basic Metabolic Panel", averageTAT: 3.2, target: 3.0, variance: 0.2, performance: "good" },
    { testType: "Lipid Panel", averageTAT: 4.8, target: 4.0, variance: 0.8, performance: "warning" },
    { testType: "Liver Function Tests", averageTAT: 3.9, target: 4.0, variance: -0.1, performance: "excellent" },
    { testType: "Thyroid Panel", averageTAT: 6.2, target: 5.0, variance: 1.2, performance: "poor" },
    { testType: "Urinalysis", averageTAT: 1.8, target: 2.0, variance: -0.2, performance: "excellent" }
  ];

  const mockQualityMetrics: QualityMetric[] = [
    { id: "1", metric: "QC Pass Rate", value: 98.7, target: 95, unit: "%", status: "pass", trend: "improving" },
    { id: "2", metric: "Critical Value Alert Rate", value: 2.1, target: 3.0, unit: "%", status: "pass", trend: "stable" },
    { id: "3", metric: "Sample Rejection Rate", value: 1.3, target: 2.0, unit: "%", status: "pass", trend: "improving" },
    { id: "4", metric: "Repeat Test Rate", value: 2.8, target: 3.5, unit: "%", status: "pass", trend: "stable" },
    { id: "5", metric: "Equipment Downtime", value: 0.8, target: 2.0, unit: "%", status: "pass", trend: "improving" },
    { id: "6", metric: "Staff Productivity", value: 95.2, target: 90, unit: "%", status: "pass", trend: "improving" }
  ];

  const mockFinancialData: FinancialData[] = [
    { period: "January", revenue: 98500, costs: 67200, margin: 31.8, testsPerformed: 2341, revenuePerTest: 42.08 },
    { period: "February", revenue: 105200, costs: 69800, margin: 33.7, testsPerformed: 2456, revenuePerTest: 42.84 },
    { period: "March", revenue: 118600, costs: 73400, margin: 38.1, testsPerformed: 2687, revenuePerTest: 44.14 },
    { period: "April", revenue: 127450, costs: 76200, margin: 40.2, testsPerformed: 2847, revenuePerTest: 44.77 }
  ];

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

  const testDistributionData = [
    { category: "hematology", count: 892, percentage: 31, fill: "var(--color-hematology)" },
    { category: "chemistry", count: 745, percentage: 26, fill: "var(--color-chemistry)" },
    { category: "microbiology", count: 524, percentage: 18, fill: "var(--color-microbiology)" },
    { category: "molecular", count: 398, percentage: 14, fill: "var(--color-molecular)" },
    { category: "immunology", count: 288, percentage: 11, fill: "var(--color-immunology)" }
  ];

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

  const qualityTrendsData = [
    { month: "January", score: 96.2 },
    { month: "February", score: 97.1 },
    { month: "March", score: 98.3 },
    { month: "April", score: 98.7 }
  ];

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

  const equipmentUtilizationData = [
    { equipment: "Hematology Analyzer", utilization: 87, uptime: 99.2, status: "excellent" },
    { equipment: "Chemistry Analyzer", utilization: 93, uptime: 98.8, status: "excellent" },
    { equipment: "Molecular Platform", utilization: 76, uptime: 97.5, status: "good" },
    { equipment: "Microscopy Station", utilization: 65, uptime: 99.8, status: "good" }
  ];

  const systemPerformanceData = [
    { metric: "Network Connectivity", value: 99.9, unit: "%", status: "excellent" },
    { metric: "Database Performance", value: 98.5, unit: "%", status: "excellent" },
    { metric: "Storage Utilization", value: 67, unit: "%", status: "good" },
    { metric: "CPU Usage", value: 45, unit: "%", status: "excellent" }
  ];

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
        {mockMetrics.map((metric) => (
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
                    data={mockVolumeData}
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
                      data={testDistributionData}
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
                                  {testDistributionData.reduce((a, b) => a + b.count, 0).toLocaleString()}
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
                  data={mockTurnaroundData.map(item => ({
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
                    {mockTurnaroundData.map((entry, index) => {
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
                  {mockQualityMetrics.slice(0, 4).map((metric) => {
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
                    data={qualityTrendsData}
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
                    data={mockFinancialData}
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
                    data={mockFinancialData}
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
                    data={equipmentUtilizationData.map(item => ({
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
                  {systemPerformanceData.map((metric, index) => {
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