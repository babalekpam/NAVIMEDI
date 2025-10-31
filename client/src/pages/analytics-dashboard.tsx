import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendChart, DistributionChart, MetricCard } from "@/components/charts";
import { Download, TrendingUp, Users, Calendar, Activity, DollarSign, AlertTriangle, Clock } from "lucide-react";
import { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from "recharts";

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("30");
  const [department, setDepartment] = useState("all");

  // Fetch analytics data
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["/api/analytics/overview", timeRange, department],
    enabled: true
  });

  // Mock data for demonstration (would come from API)
  const kpiData = {
    monthlyRevenue: {
      value: "$847,250",
      change: 12.5,
      trend: "up" as const,
      data: [
        { month: "Jan", value: 720000 },
        { month: "Feb", value: 756000 },
        { month: "Mar", value: 782000 },
        { month: "Apr", value: 808000 },
        { month: "May", value: 823000 },
        { month: "Jun", value: 847250 }
      ]
    },
    activePatients: {
      value: "2,847",
      change: 8.2,
      trend: "up" as const
    },
    appointmentsToday: {
      value: "124",
      change: -3.5,
      trend: "down" as const
    },
    occupancyRate: {
      value: "87%",
      change: 4.1,
      trend: "up" as const
    }
  };

  const revenueData = [
    { month: "Jan", revenue: 720000, expenses: 520000, profit: 200000 },
    { month: "Feb", revenue: 756000, expenses: 535000, profit: 221000 },
    { month: "Mar", revenue: 782000, expenses: 548000, profit: 234000 },
    { month: "Apr", revenue: 808000, expenses: 562000, profit: 246000 },
    { month: "May", revenue: 823000, expenses: 571000, profit: 252000 },
    { month: "Jun", revenue: 847250, expenses: 585000, profit: 262250 }
  ];

  const patientOutcomesData = [
    { metric: "Satisfaction", current: 4.6, target: 4.8, percentage: 92 },
    { metric: "Readmission", current: 8.2, target: 10.0, percentage: 18 },
    { metric: "Recovery Time", current: 14.5, target: 16.0, percentage: 90.6 },
    { metric: "Complication", current: 2.1, target: 3.0, percentage: 30 }
  ];

  const operationalData = [
    { name: "Bed Occupancy", value: 87, fill: "#3b82f6" },
    { name: "Staff Utilization", value: 82, fill: "#10b981" },
    { name: "Equipment Usage", value: 75, fill: "#f59e0b" },
    { name: "Available", value: 13, fill: "#e5e7eb" }
  ];

  const predictionsData = [
    { category: "High Risk Readmission", count: 24, color: "#ef4444" },
    { category: "No-Show Probability", count: 38, color: "#f59e0b" },
    { category: "Low Stock Items", count: 15, color: "#eab308" },
    { category: "Revenue Forecast", count: 1, color: "#3b82f6" }
  ];

  const departmentPerformance = [
    { name: "Emergency", patients: 450, revenue: 185000, satisfaction: 4.2 },
    { name: "Surgery", patients: 320, revenue: 245000, satisfaction: 4.7 },
    { name: "Cardiology", patients: 280, revenue: 220000, satisfaction: 4.6 },
    { name: "Pediatrics", patients: 380, revenue: 165000, satisfaction: 4.8 },
    { name: "Oncology", patients: 190, revenue: 195000, satisfaction: 4.5 }
  ];

  const handleExport = (format: 'pdf' | 'excel') => {
    console.log(`Exporting analytics as ${format}`);
    // Would trigger download
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="analytics-dashboard">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="page-title">
            Advanced Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive insights and business intelligence for data-driven decisions
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="w-[180px]" data-testid="select-department">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
              <SelectItem value="surgery">Surgery</SelectItem>
              <SelectItem value="cardiology">Cardiology</SelectItem>
              <SelectItem value="pediatrics">Pediatrics</SelectItem>
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]" data-testid="select-timerange">
              <SelectValue placeholder="Last 30 days" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => handleExport('pdf')} data-testid="button-export-pdf">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport('excel')} data-testid="button-export-excel">
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card data-testid="kpi-revenue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="value-revenue">{kpiData.monthlyRevenue.value}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              <span className="text-green-600">+{kpiData.monthlyRevenue.change}%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card data-testid="kpi-patients">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="value-patients">{kpiData.activePatients.value}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              <span className="text-green-600">+{kpiData.activePatients.change}%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card data-testid="kpi-appointments">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="value-appointments">{kpiData.appointmentsToday.value}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="text-gray-600">{Math.abs(kpiData.appointmentsToday.change)}%</span> vs average
            </p>
          </CardContent>
        </Card>

        <Card data-testid="kpi-occupancy">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="value-occupancy">{kpiData.occupancyRate.value}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              <span className="text-green-600">+{kpiData.occupancyRate.change}%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card data-testid="chart-revenue">
        <CardHeader>
          <CardTitle>Revenue Trends</CardTitle>
          <CardDescription>Monthly revenue, expenses, and profit over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue" />
              <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
              <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} name="Profit" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Patient Outcomes and Operational Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card data-testid="chart-patient-outcomes">
          <CardHeader>
            <CardTitle>Patient Outcomes</CardTitle>
            <CardDescription>Key performance indicators for patient care</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={patientOutcomesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="current" fill="#3b82f6" name="Current" />
                <Bar dataKey="target" fill="#94a3b8" name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card data-testid="chart-operational">
          <CardHeader>
            <CardTitle>Operational Metrics</CardTitle>
            <CardDescription>Resource utilization across the facility</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={operationalData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {operationalData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Predictions Panel */}
      <Card data-testid="panel-predictions">
        <CardHeader>
          <CardTitle>Predictive Analytics</CardTitle>
          <CardDescription>AI-powered insights and forecasts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {predictionsData.map((prediction, idx) => (
              <div
                key={idx}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                data-testid={`prediction-${idx}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <AlertTriangle className="h-5 w-5" style={{ color: prediction.color }} />
                  <span className="text-2xl font-bold" style={{ color: prediction.color }}>
                    {prediction.count}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{prediction.category}</p>
                <Button variant="link" className="p-0 h-auto mt-2 text-blue-600" data-testid={`button-view-${idx}`}>
                  View Details →
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Department Performance */}
      <Card data-testid="chart-departments">
        <CardHeader>
          <CardTitle>Department Performance</CardTitle>
          <CardDescription>Comparative analysis across departments</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="patients" fill="#3b82f6" name="Patients" />
              <Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="Revenue ($)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
