import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Target,
  Activity,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  PieChart,
  LineChart,
  BarChart,
  Gauge,
  Timer,
  FileText,
  Settings,
  Filter,
  Download,
  RefreshCw,
  Zap,
  Award,
  Star,
  ArrowUp,
  ArrowDown,
  Minus,
  Eye,
  Calendar as CalendarIcon,
  Database,
  Cpu,
  HardDrive,
  Wifi
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/contexts/tenant-context-fixed";
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
            <BarChart className="w-4 h-4 mr-2" />
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
                <div className="space-y-4">
                  {mockVolumeData.map((data, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{data.period}</p>
                        <p className="text-sm text-gray-600">{data.samples} samples</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">{data.tests}</p>
                        <p className="text-xs text-gray-500">{data.criticalValues} critical</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Distribution</CardTitle>
                <CardDescription>Breakdown by test category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { category: "Hematology", count: 892, percentage: 31 },
                    { category: "Chemistry", count: 745, percentage: 26 },
                    { category: "Microbiology", count: 524, percentage: 18 },
                    { category: "Molecular", count: 398, percentage: 14 },
                    { category: "Immunology", count: 288, percentage: 11 }
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.category}</span>
                        <span className="text-sm text-gray-600">{item.count} tests ({item.percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{width: `${item.percentage}%`}}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Turnaround Time Tab */}
        <TabsContent value="turnaround" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Turnaround Time Analysis</CardTitle>
              <CardDescription>Average processing time by test type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTurnaroundData.map((data, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{data.testType}</h4>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm text-gray-600">
                          Actual: <span className="font-medium">{data.averageTAT}h</span>
                        </span>
                        <span className="text-sm text-gray-600">
                          Target: <span className="font-medium">{data.target}h</span>
                        </span>
                        <span className={cn("text-sm font-medium", 
                          data.variance < 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {data.variance > 0 ? "+" : ""}{data.variance}h
                        </span>
                      </div>
                    </div>
                    <Badge className={getPerformanceColor(data.performance)}>
                      {data.performance}
                    </Badge>
                  </div>
                ))}
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
                <div className="space-y-4">
                  {mockQualityMetrics.map((metric) => (
                    <div key={metric.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{metric.metric}</p>
                        <p className="text-sm text-gray-600">
                          Target: {metric.target}{metric.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold">
                            {metric.value}{metric.unit}
                          </span>
                          <Badge className={getQualityStatusColor(metric.status)}>
                            {metric.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{metric.trend}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quality Trends</CardTitle>
                <CardDescription>Quality score over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { month: "January", score: 96.2, trend: "up" },
                    { month: "February", score: 97.1, trend: "up" },
                    { month: "March", score: 98.3, trend: "up" },
                    { month: "April", score: 98.7, trend: "up" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{item.month}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-green-600">{item.score}%</span>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly revenue growth</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockFinancialData.map((data, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{data.period}</span>
                      <span className="text-lg font-bold text-green-600">
                        ${data.revenue.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profit Margins</CardTitle>
                <CardDescription>Monthly margin analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockFinancialData.map((data, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{data.period}</span>
                      <span className="text-lg font-bold text-blue-600">
                        {data.margin.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue per Test</CardTitle>
                <CardDescription>Efficiency metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockFinancialData.map((data, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{data.period}</span>
                      <span className="text-lg font-bold text-purple-600">
                        ${data.revenuePerTest.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Equipment Tab */}
        <TabsContent value="equipment" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Equipment Utilization</CardTitle>
                <CardDescription>Equipment usage and efficiency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { equipment: "Hematology Analyzer HA-1", utilization: 87, uptime: 99.2, status: "excellent" },
                    { equipment: "Chemistry Analyzer CA-2", utilization: 93, uptime: 98.8, status: "excellent" },
                    { equipment: "Molecular Platform MP-1", utilization: 76, uptime: 97.5, status: "good" },
                    { equipment: "Microscopy Station MS-3", utilization: 65, uptime: 99.8, status: "good" }
                  ].map((item, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{item.equipment}</h4>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Utilization:</span>
                          <span className="font-medium ml-2">{item.utilization}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Uptime:</span>
                          <span className="font-medium ml-2">{item.uptime}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
                <CardDescription>Overall system health metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { metric: "Network Connectivity", value: 99.9, unit: "%", status: "excellent", icon: Wifi },
                    { metric: "Database Performance", value: 98.5, unit: "%", status: "excellent", icon: Database },
                    { metric: "Storage Utilization", value: 67, unit: "%", status: "good", icon: HardDrive },
                    { metric: "CPU Usage", value: 45, unit: "%", status: "excellent", icon: Cpu }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <item.icon className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">{item.metric}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold">{item.value}{item.unit}</span>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
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