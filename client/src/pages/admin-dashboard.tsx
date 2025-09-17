import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import { UserPlus, Users, Stethoscope, Heart, FlaskConical, UserCheck, DollarSign, ShieldCheck, Building2, Activity, Pill, TestTube, Plus, Settings, AlertTriangle, Package, FileText, Clock, BarChart3, TrendingUp, Download, Calendar, Beaker, Target, User, Zap } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useTenant } from "@/contexts/tenant-context";
import { useTranslation } from "@/contexts/translation-context";
import { useLocation } from "wouter";
import { useEffect } from "react";
import UserRoles from "@/pages/user-roles";
import UserRolesManagement from "@/components/pharmacy/UserRolesManagement";
import { DepartmentManagement } from "@/components/dashboard/department-management";
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
  RadialBarChart,
  RadialBar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

interface AdminDashboardProps {
  activeTab?: string;
}

// Analytics data interfaces
interface VolumeData {
  period: string;
  value: number;
  target?: number;
  type?: string;
}

interface StatusDistribution {
  name: string;
  value: number;
  color: string;
}

interface PerformanceMetric {
  metric: string;
  current: number;
  target: number;
  previous?: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
}

interface ResourceUtilization {
  resource: string;
  utilized: number;
  capacity: number;
  efficiency: number;
}

interface FinancialData {
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
  budget?: number;
}

interface TenantAnalytics {
  operational: {
    volumeData: VolumeData[];
    statusDistribution: StatusDistribution[];
  };
  performance: {
    metrics: PerformanceMetric[];
    completionRates: VolumeData[];
  };
  resources: {
    staffUtilization: ResourceUtilization[];
    departmentMetrics: VolumeData[];
  };
  financial: {
    revenueData: FinancialData[];
    costAnalysis: VolumeData[];
  };
}

export default function AdminDashboard({ activeTab = "overview" }: AdminDashboardProps) {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [currentTab, setCurrentTab] = useState(activeTab);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

  // Generate mock analytics data based on tenant type
  const generateTenantAnalytics = (tenantType: string): TenantAnalytics => {
    const hospitalData: TenantAnalytics = {
      operational: {
        volumeData: [
          { period: "Jan", value: 1245, target: 1200, type: "patients" },
          { period: "Feb", value: 1367, target: 1250, type: "patients" },
          { period: "Mar", value: 1512, target: 1300, type: "patients" },
          { period: "Apr", value: 1443, target: 1350, type: "patients" },
          { period: "May", value: 1678, target: 1400, type: "patients" },
          { period: "Jun", value: 1789, target: 1450, type: "patients" }
        ],
        statusDistribution: [
          { name: "Active Patients", value: 1789, color: "#22c55e" },
          { name: "Scheduled", value: 567, color: "#3b82f6" },
          { name: "Discharged", value: 234, color: "#6b7280" },
          { name: "Emergency", value: 45, color: "#ef4444" }
        ]
      },
      performance: {
        metrics: [
          { metric: "Bed Occupancy", current: 87.5, target: 90, previous: 85.2, unit: "%", trend: "up" },
          { metric: "Average Stay", current: 3.2, target: 3.5, previous: 3.4, unit: "days", trend: "down" },
          { metric: "Patient Satisfaction", current: 4.7, target: 4.5, previous: 4.6, unit: "/5", trend: "up" },
          { metric: "Staff Efficiency", current: 92.3, target: 90, previous: 91.1, unit: "%", trend: "up" }
        ],
        completionRates: [
          { period: "Mon", value: 89, target: 85 },
          { period: "Tue", value: 92, target: 85 },
          { period: "Wed", value: 87, target: 85 },
          { period: "Thu", value: 94, target: 85 },
          { period: "Fri", value: 96, target: 85 },
          { period: "Sat", value: 88, target: 80 },
          { period: "Sun", value: 85, target: 80 }
        ]
      },
      resources: {
        staffUtilization: [
          { resource: "Doctors", utilized: 24, capacity: 28, efficiency: 85.7 },
          { resource: "Nurses", utilized: 67, capacity: 75, efficiency: 89.3 },
          { resource: "Support Staff", utilized: 45, capacity: 50, efficiency: 90.0 },
          { resource: "Administration", utilized: 12, capacity: 15, efficiency: 80.0 }
        ],
        departmentMetrics: [
          { period: "Emergency", value: 234, target: 200 },
          { period: "Surgery", value: 89, target: 100 },
          { period: "Cardiology", value: 156, target: 150 },
          { period: "Pediatrics", value: 123, target: 120 },
          { period: "Orthopedics", value: 98, target: 110 }
        ]
      },
      financial: {
        revenueData: [
          { period: "Jan", revenue: 45000, expenses: 32000, profit: 13000, budget: 50000 },
          { period: "Feb", revenue: 52000, expenses: 34000, profit: 18000, budget: 55000 },
          { period: "Mar", revenue: 48000, expenses: 33000, profit: 15000, budget: 52000 },
          { period: "Apr", revenue: 56000, expenses: 35000, profit: 21000, budget: 58000 },
          { period: "May", revenue: 61000, expenses: 37000, profit: 24000, budget: 62000 },
          { period: "Jun", revenue: 58000, expenses: 36000, profit: 22000, budget: 60000 }
        ],
        costAnalysis: [
          { period: "Staff", value: 25000 },
          { period: "Equipment", value: 8000 },
          { period: "Supplies", value: 5000 },
          { period: "Facilities", value: 4000 },
          { period: "Other", value: 2000 }
        ]
      }
    };

    const pharmacyData: TenantAnalytics = {
      operational: {
        volumeData: [
          { period: "Jan", value: 1456, target: 1400, type: "prescriptions" },
          { period: "Feb", value: 1623, target: 1500, type: "prescriptions" },
          { period: "Mar", value: 1789, target: 1600, type: "prescriptions" },
          { period: "Apr", value: 1654, target: 1650, type: "prescriptions" },
          { period: "May", value: 1834, target: 1700, type: "prescriptions" },
          { period: "Jun", value: 1923, target: 1750, type: "prescriptions" }
        ],
        statusDistribution: [
          { name: "Ready for Pickup", value: 145, color: "#22c55e" },
          { name: "Processing", value: 67, color: "#3b82f6" },
          { name: "New Orders", value: 89, color: "#f59e0b" },
          { name: "Insurance Issues", value: 23, color: "#ef4444" }
        ]
      },
      performance: {
        metrics: [
          { metric: "Fill Rate", current: 96.8, target: 95, previous: 96.2, unit: "%", trend: "up" },
          { metric: "Wait Time", current: 12.5, target: 15, previous: 13.2, unit: "min", trend: "down" },
          { metric: "Customer Satisfaction", current: 4.8, target: 4.5, previous: 4.7, unit: "/5", trend: "up" },
          { metric: "Inventory Turnover", current: 8.5, target: 8, previous: 8.2, unit: "x/year", trend: "up" }
        ],
        completionRates: [
          { period: "Mon", value: 156, target: 150 },
          { period: "Tue", value: 167, target: 150 },
          { period: "Wed", value: 189, target: 150 },
          { period: "Thu", value: 234, target: 150 },
          { period: "Fri", value: 278, target: 150 },
          { period: "Sat", value: 198, target: 120 },
          { period: "Sun", value: 145, target: 100 }
        ]
      },
      resources: {
        staffUtilization: [
          { resource: "Pharmacists", utilized: 8, capacity: 10, efficiency: 80.0 },
          { resource: "Technicians", utilized: 15, capacity: 18, efficiency: 83.3 },
          { resource: "Support Staff", utilized: 6, capacity: 8, efficiency: 75.0 },
          { resource: "Delivery", utilized: 4, capacity: 5, efficiency: 80.0 }
        ],
        departmentMetrics: [
          { period: "Retail", value: 1456, target: 1400 },
          { period: "Clinical Services", value: 234, target: 250 },
          { period: "Compounding", value: 89, target: 100 },
          { period: "Immunizations", value: 167, target: 150 }
        ]
      },
      financial: {
        revenueData: [
          { period: "Jan", revenue: 89000, expenses: 65000, profit: 24000, budget: 95000 },
          { period: "Feb", revenue: 94000, expenses: 67000, profit: 27000, budget: 98000 },
          { period: "Mar", revenue: 102000, expenses: 69000, profit: 33000, budget: 105000 },
          { period: "Apr", revenue: 97000, expenses: 68000, profit: 29000, budget: 100000 },
          { period: "May", revenue: 108000, expenses: 71000, profit: 37000, budget: 110000 },
          { period: "Jun", revenue: 112000, expenses: 73000, profit: 39000, budget: 115000 }
        ],
        costAnalysis: [
          { period: "Inventory", value: 45000 },
          { period: "Staff", value: 18000 },
          { period: "Facilities", value: 6000 },
          { period: "Technology", value: 3000 },
          { period: "Other", value: 1000 }
        ]
      }
    };

    const laboratoryData: TenantAnalytics = {
      operational: {
        volumeData: [
          { period: "Jan", value: 2345, target: 2200, type: "tests" },
          { period: "Feb", value: 2567, target: 2400, type: "tests" },
          { period: "Mar", value: 2789, target: 2600, type: "tests" },
          { period: "Apr", value: 2654, target: 2650, type: "tests" },
          { period: "May", value: 2934, target: 2800, type: "tests" },
          { period: "Jun", value: 3123, target: 3000, type: "tests" }
        ],
        statusDistribution: [
          { name: "Completed", value: 2456, color: "#22c55e" },
          { name: "In Progress", value: 234, color: "#3b82f6" },
          { name: "Pending", value: 156, color: "#f59e0b" },
          { name: "Critical", value: 23, color: "#ef4444" }
        ]
      },
      performance: {
        metrics: [
          { metric: "Turnaround Time", current: 2.3, target: 2.5, previous: 2.6, unit: "hours", trend: "down" },
          { metric: "Accuracy Rate", current: 99.2, target: 99, previous: 99.1, unit: "%", trend: "up" },
          { metric: "Equipment Uptime", current: 97.8, target: 95, previous: 97.2, unit: "%", trend: "up" },
          { metric: "Quality Score", current: 98.5, target: 97, previous: 98.1, unit: "%", trend: "up" }
        ],
        completionRates: [
          { period: "Mon", value: 456, target: 400 },
          { period: "Tue", value: 489, target: 450 },
          { period: "Wed", value: 512, target: 500 },
          { period: "Thu", value: 534, target: 520 },
          { period: "Fri", value: 567, target: 550 },
          { period: "Sat", value: 345, target: 300 },
          { period: "Sun", value: 234, target: 250 }
        ]
      },
      resources: {
        staffUtilization: [
          { resource: "Lab Technicians", utilized: 28, capacity: 32, efficiency: 87.5 },
          { resource: "Pathologists", utilized: 6, capacity: 8, efficiency: 75.0 },
          { resource: "Support Staff", utilized: 12, capacity: 15, efficiency: 80.0 },
          { resource: "Quality Control", utilized: 4, capacity: 5, efficiency: 80.0 }
        ],
        departmentMetrics: [
          { period: "Hematology", value: 567, target: 550 },
          { period: "Chemistry", value: 789, target: 750 },
          { period: "Microbiology", value: 456, target: 450 },
          { period: "Pathology", value: 234, target: 250 },
          { period: "Molecular", value: 123, target: 150 }
        ]
      },
      financial: {
        revenueData: [
          { period: "Jan", revenue: 67000, expenses: 45000, profit: 22000, budget: 70000 },
          { period: "Feb", revenue: 72000, expenses: 47000, profit: 25000, budget: 75000 },
          { period: "Mar", revenue: 78000, expenses: 49000, profit: 29000, budget: 80000 },
          { period: "Apr", revenue: 74000, expenses: 48000, profit: 26000, budget: 77000 },
          { period: "May", revenue: 83000, expenses: 51000, profit: 32000, budget: 85000 },
          { period: "Jun", revenue: 87000, expenses: 52000, profit: 35000, budget: 90000 }
        ],
        costAnalysis: [
          { period: "Equipment", value: 25000 },
          { period: "Staff", value: 18000 },
          { period: "Reagents", value: 8000 },
          { period: "Facilities", value: 4000 },
          { period: "Other", value: 2000 }
        ]
      }
    };

    switch (tenantType) {
      case 'pharmacy': return pharmacyData;
      case 'laboratory': return laboratoryData;
      default: return hospitalData;
    }
  };

  // Chart configurations
  const chartConfigs = useMemo(() => {
    const baseConfig: ChartConfig = {
      value: { label: "Value", color: "hsl(220, 98%, 61%)" },
      target: { label: "Target", color: "hsl(142, 76%, 36%)" },
      revenue: { label: "Revenue", color: "hsl(220, 98%, 61%)" },
      expenses: { label: "Expenses", color: "hsl(0, 85%, 60%)" },
      profit: { label: "Profit", color: "hsl(142, 76%, 36%)" },
      utilized: { label: "Utilized", color: "hsl(220, 98%, 61%)" },
      capacity: { label: "Capacity", color: "hsl(210, 40%, 80%)" }
    };

    const hospitalConfig: ChartConfig = {
      ...baseConfig,
      patients: { label: "Patients", color: "hsl(220, 98%, 61%)" },
      appointments: { label: "Appointments", color: "hsl(142, 76%, 36%)" },
      admissions: { label: "Admissions", color: "hsl(271, 91%, 65%)" },
      discharges: { label: "Discharges", color: "hsl(35, 91%, 62%)" }
    };

    const pharmacyConfig: ChartConfig = {
      ...baseConfig,
      prescriptions: { label: "Prescriptions", color: "hsl(220, 98%, 61%)" },
      inventory: { label: "Inventory", color: "hsl(142, 76%, 36%)" },
      dispensed: { label: "Dispensed", color: "hsl(271, 91%, 65%)" },
      pending: { label: "Pending", color: "hsl(35, 91%, 62%)" }
    };

    const laboratoryConfig: ChartConfig = {
      ...baseConfig,
      tests: { label: "Tests", color: "hsl(220, 98%, 61%)" },
      completed: { label: "Completed", color: "hsl(142, 76%, 36%)" },
      pending: { label: "Pending", color: "hsl(35, 91%, 62%)" },
      critical: { label: "Critical", color: "hsl(0, 85%, 60%)" }
    };

    return { hospital: hospitalConfig, pharmacy: pharmacyConfig, laboratory: laboratoryConfig };
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
      expenses: typeof item.expenses === 'number' && isFinite(item.expenses) ? item.expenses : 0,
      profit: typeof item.profit === 'number' && isFinite(item.profit) ? item.profit : 0,
      utilized: typeof item.utilized === 'number' && isFinite(item.utilized) ? item.utilized : 0,
      capacity: typeof item.capacity === 'number' && isFinite(item.capacity) ? item.capacity : 0,
      efficiency: typeof item.efficiency === 'number' && isFinite(item.efficiency) ? item.efficiency : 0
    }));
  };

  // Memoized analytics data based on tenant type with safety guards
  const tenantAnalytics = useMemo(() => {
    const tenantType = tenant?.type || 'hospital';
    const rawAnalytics = generateTenantAnalytics(tenantType);
    
    // Apply safety guards to all chart data
    return {
      operational: {
        volumeData: safeChartData(rawAnalytics.operational?.volumeData || []),
        statusDistribution: safeChartData(rawAnalytics.operational?.statusDistribution || [])
      },
      performance: {
        metrics: (rawAnalytics.performance?.metrics || []).map(metric => ({
          ...metric,
          current: typeof metric.current === 'number' && isFinite(metric.current) ? metric.current : 0,
          target: typeof metric.target === 'number' && isFinite(metric.target) ? metric.target : 0,
          previous: typeof metric.previous === 'number' && isFinite(metric.previous) ? metric.previous : undefined
        })),
        completionRates: safeChartData(rawAnalytics.performance?.completionRates || [])
      },
      resources: {
        staffUtilization: safeChartData(rawAnalytics.resources?.staffUtilization || []),
        departmentMetrics: safeChartData(rawAnalytics.resources?.departmentMetrics || [])
      },
      financial: {
        revenueData: safeChartData(rawAnalytics.financial?.revenueData || []),
        costAnalysis: safeChartData(rawAnalytics.financial?.costAnalysis || [])
      }
    };
  }, [tenant?.type]);

  // Allow access for admin roles
  const allowedRoles = ['tenant_admin', 'director', 'super_admin'];
  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <ShieldCheck className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Admin Access Required</h2>
          <p className="text-gray-600">Only administrators can access this page.</p>
        </div>
      </div>
    );
  }

  // Determine the organization type and customize the interface accordingly
  const organizationType = tenant?.type || 'hospital';
  
  const organizationTitle = organizationType === 'pharmacy' ? 'Pharmacy Administration' : 
                           organizationType === 'laboratory' ? 'Laboratory Administration' : 
                           'Hospital Administration';
  const organizationDescription = organizationType === 'pharmacy' ? 'Manage your pharmacy operations and staff' :
                                 organizationType === 'laboratory' ? 'Manage your laboratory operations and staff' :
                                 'Manage your hospital staff and personnel';

  // Define staff cards based on organization type
  const getStaffCardsForOrganization = () => {
    if (organizationType === 'pharmacy') {
      return [
        {
          role: "pharmacist",
          title: "Add Pharmacists",
          description: "Add licensed pharmacists to your pharmacy",
          icon: Pill,
          color: "bg-blue-100 text-blue-800",
          count: "Licensed Pharmacists"
        },
        {
          role: "billing_staff",
          title: "Add Billing Staff",
          description: "Add billing specialists and financial coordinators",
          icon: DollarSign,
          color: "bg-green-100 text-green-800",
          count: "Billing Specialists"
        },
        {
          role: "receptionist",
          title: "Add Reception Staff",
          description: "Add front desk and patient registration staff",
          icon: UserCheck,
          color: "bg-yellow-100 text-yellow-800",
          count: "Front Desk Staff"
        }
      ];
    } else if (organizationType === 'laboratory') {
      return [
        {
          role: "lab_technician",
          title: "Add Lab Staff",
          description: "Add laboratory technicians and pathologists",
          icon: TestTube,
          color: "bg-purple-100 text-purple-800",
          count: "Lab Technicians"
        },
        {
          role: "billing_staff",
          title: "Add Billing Staff",
          description: "Add billing specialists and financial coordinators",
          icon: DollarSign,
          color: "bg-orange-100 text-orange-800",
          count: "Billing Specialists"
        },
        {
          role: "receptionist",
          title: "Add Reception Staff",
          description: "Add front desk and administrative staff",
          icon: UserCheck,
          color: "bg-yellow-100 text-yellow-800",
          count: "Administrative Staff"
        }
      ];
    } else {
      // Default hospital staff cards
      return [
        {
          role: "physician",
          title: "Add Doctors",
          description: "Add physicians and medical specialists",
          icon: Stethoscope,
          color: "bg-blue-100 text-blue-800",
          count: "Medical Staff"
        },
        {
          role: "nurse",
          title: "Add Nurses",
          description: "Add registered nurses and nursing staff",
          icon: Heart,
          color: "bg-red-100 text-red-800",
          count: "Nursing Staff"
        },
        {
          role: "receptionist",
          title: "Add Reception Staff",
          description: "Add front desk and patient registration staff",
          icon: UserCheck,
          color: "bg-yellow-100 text-yellow-800",
          count: "Front Desk Staff"
        }
      ];
    }
  };

  const organizationStaffCards = getStaffCardsForOrganization();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{organizationTitle}</h1>
          <p className="text-gray-600">{organizationDescription}</p>
        </div>
        <Badge variant="outline" className="flex items-center">
          <Building2 className="h-4 w-4 mr-2" />
          {tenant?.name || "Organization Admin"}
        </Badge>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
        <TabsList className="inline-flex h-12 items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground w-full max-w-5xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Advanced Analytics</TabsTrigger>
          <TabsTrigger value="add-staff">Add Staff</TabsTrigger>
          <TabsTrigger value="manage-users">Manage Users</TabsTrigger>
          {organizationType !== 'pharmacy' && (
            <TabsTrigger value="departments">Departments</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Summary */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {organizationType === 'pharmacy' ? 'Total Prescriptions' : 
                   organizationType === 'laboratory' ? 'Total Tests' : 'Total Patients'}
                </CardTitle>
                {organizationType === 'pharmacy' ? <Pill className="h-4 w-4 text-muted-foreground" /> :
                 organizationType === 'laboratory' ? <TestTube className="h-4 w-4 text-muted-foreground" /> :
                 <Users className="h-4 w-4 text-muted-foreground" />}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="total-metric">
                  {tenantAnalytics.operational.volumeData[tenantAnalytics.operational.volumeData.length - 1]?.value.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  +12% from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue This Month</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="revenue-metric">
                  ${tenantAnalytics.financial.revenueData[tenantAnalytics.financial.revenueData.length - 1]?.revenue.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  +8% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Staff Efficiency</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="efficiency-metric">
                  {tenantAnalytics.performance.metrics[0]?.current}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Above target of {tenantAnalytics.performance.metrics[0]?.target}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {organizationType === 'pharmacy' ? 'Active Customers' : 
                   organizationType === 'laboratory' ? 'Daily Tests' : 'Daily Admissions'}
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="activity-metric">
                  {tenantAnalytics.performance.completionRates[tenantAnalytics.performance.completionRates.length - 1]?.value || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Today's activity
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Primary Analytics Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Operational Volume Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  {organizationType === 'pharmacy' ? 'Prescription Volume Trends' : 
                   organizationType === 'laboratory' ? 'Test Volume Trends' : 'Patient Volume Trends'}
                </CardTitle>
                <CardDescription>6-month trend analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer 
                  config={chartConfigs[organizationType as keyof typeof chartConfigs] || chartConfigs.hospital} 
                  className="h-[300px]"
                >
                  <AreaChart data={tenantAnalytics.operational.volumeData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="period" 
                      className="text-muted-foreground"
                      fontSize={12}
                    />
                    <YAxis 
                      className="text-muted-foreground"
                      fontSize={12}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="var(--color-value)"
                      fill="var(--color-value)"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="target"
                      stroke="var(--color-target)"
                      fill="transparent"
                      strokeDasharray="5,5"
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  Current Status Distribution
                </CardTitle>
                <CardDescription>Real-time operational status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tenantAnalytics.operational.statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {tenantAnalytics.operational.statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                                <p className="font-medium">{data.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {data.value.toLocaleString()} items
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Legend */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                    <div className="flex flex-wrap justify-center gap-3 text-sm">
                      {tenantAnalytics.operational.statusDistribution.map((item) => (
                        <div key={item.name} className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-muted-foreground text-xs">
                            {item.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance & Resource Analytics */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  Performance Metrics
                </CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {tenantAnalytics.performance.metrics.map((metric, index) => {
                  const percentage = (metric.current / metric.target) * 100;
                  const isGood = metric.trend === 'up' ? metric.current >= metric.target : metric.current <= metric.target;
                  
                  return (
                    <div key={index} className="space-y-2" data-testid={`metric-${metric.metric.toLowerCase().replace(/\s+/g, '-')}`}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-700">{metric.metric}</span>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${isGood ? 'text-green-600' : 'text-orange-600'}`}>
                            {metric.current}{metric.unit}
                          </span>
                          {metric.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-600" />}
                          {metric.trend === 'down' && <TrendingUp className="h-3 w-3 text-red-600 rotate-180" />}
                        </div>
                      </div>
                      <Progress 
                        value={Math.min(percentage, 100)} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Target: {metric.target}{metric.unit}</span>
                        <span>{percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Staff Utilization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-indigo-600" />
                  Staff Utilization
                </CardTitle>
                <CardDescription>Resource allocation overview</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer 
                  config={chartConfigs[organizationType as keyof typeof chartConfigs] || chartConfigs.hospital} 
                  className="h-[300px]"
                >
                  <BarChart data={tenantAnalytics.resources.staffUtilization}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="resource" 
                      className="text-muted-foreground"
                      fontSize={11}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      className="text-muted-foreground"
                      fontSize={12}
                    />
                    <ChartTooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                              <p className="font-medium">{label}</p>
                              <p className="text-sm text-muted-foreground">
                                Utilized: {data.utilized}/{data.capacity}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Efficiency: {data.efficiency}%
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="utilized" 
                      fill="var(--color-utilized)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="capacity" 
                      fill="var(--color-capacity)"
                      radius={[4, 4, 0, 0]}
                      opacity={0.3}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Financial Analytics */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Revenue Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Financial Performance
                </CardTitle>
                <CardDescription>Revenue, expenses, and profitability</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer 
                  config={chartConfigs[organizationType as keyof typeof chartConfigs] || chartConfigs.hospital} 
                  className="h-[300px]"
                >
                  <LineChart data={tenantAnalytics.financial.revenueData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="period" 
                      className="text-muted-foreground"
                      fontSize={12}
                    />
                    <YAxis 
                      className="text-muted-foreground"
                      fontSize={12}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      formatter={(value, name) => [
                        `$${Number(value).toLocaleString()}`,
                        name === 'revenue' ? 'Revenue' : 
                        name === 'expenses' ? 'Expenses' : 'Profit'
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="var(--color-revenue)"
                      strokeWidth={3}
                      dot={{ fill: "var(--color-revenue)", strokeWidth: 2, r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="expenses"
                      stroke="var(--color-expenses)"
                      strokeWidth={2}
                      strokeDasharray="5,5"
                    />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="var(--color-profit)"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {organizationType === 'pharmacy' ? (
                  <>
                    <Button 
                      onClick={() => setCurrentTab("add-staff")}
                      className="w-full justify-start"
                      variant="outline"
                      data-testid="action-add-pharmacist"
                    >
                      <Pill className="h-4 w-4 mr-2" />
                      Add New Pharmacist
                    </Button>
                    <Button 
                      onClick={() => setCurrentTab("add-staff")}
                      className="w-full justify-start"
                      variant="outline"
                      data-testid="action-add-billing-staff"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Add Billing Staff
                    </Button>
                  </>
                ) : organizationType === 'laboratory' ? (
                  <>
                    <Button 
                      onClick={() => setCurrentTab("add-staff")}
                      className="w-full justify-start"
                      variant="outline"
                      data-testid="action-add-lab-tech"
                    >
                      <TestTube className="h-4 w-4 mr-2" />
                      Add Lab Technician
                    </Button>
                    <Button 
                      onClick={() => setCurrentTab("add-staff")}
                      className="w-full justify-start"
                      variant="outline"
                      data-testid="action-add-billing-staff"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Add Billing Staff
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      onClick={() => setCurrentTab("add-staff")}
                      className="w-full justify-start"
                      variant="outline"
                      data-testid="action-add-doctor"
                    >
                      <Stethoscope className="h-4 w-4 mr-2" />
                      Add New Doctor
                    </Button>
                    <Button 
                      onClick={() => setCurrentTab("add-staff")}
                      className="w-full justify-start"
                      variant="outline"
                      data-testid="action-add-nurse"
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Add New Nurse
                    </Button>
                  </>
                )}
                <Button 
                  onClick={() => setCurrentTab("manage-users")}
                  className="w-full justify-start"
                  variant="outline"
                  data-testid="action-view-staff"
                >
                  <Users className="h-4 w-4 mr-2" />
                  View All Staff
                </Button>
                <Button 
                  onClick={() => setCurrentTab("analytics")}
                  className="w-full justify-start"
                  variant="outline"
                  data-testid="action-view-analytics"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Advanced Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Advanced Analytics Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Advanced Analytics</h2>
              <p className="text-gray-600">Deep insights into {organizationType} operations</p>
            </div>
            <Button variant="outline" data-testid="export-analytics">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>

          {/* Detailed Performance Analysis */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Daily Activity Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Daily Activity Patterns
                </CardTitle>
                <CardDescription>Weekly completion rates and targets</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer 
                  config={chartConfigs[organizationType as keyof typeof chartConfigs] || chartConfigs.hospital} 
                  className="h-[300px]"
                >
                  <LineChart data={tenantAnalytics.performance.completionRates}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="period" 
                      className="text-muted-foreground"
                      fontSize={12}
                    />
                    <YAxis 
                      className="text-muted-foreground"
                      fontSize={12}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="var(--color-value)"
                      strokeWidth={3}
                      dot={{ fill: "var(--color-value)", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: "var(--color-value)", strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="target"
                      stroke="var(--color-target)"
                      strokeWidth={2}
                      strokeDasharray="5,5"
                      dot={false}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Department Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-purple-600" />
                  Department Performance
                </CardTitle>
                <CardDescription>Performance across different departments</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer 
                  config={chartConfigs[organizationType as keyof typeof chartConfigs] || chartConfigs.hospital} 
                  className="h-[300px]"
                >
                  <BarChart data={tenantAnalytics.resources.departmentMetrics}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="period" 
                      className="text-muted-foreground"
                      fontSize={11}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      className="text-muted-foreground"
                      fontSize={12}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar 
                      dataKey="value" 
                      fill="var(--color-value)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="target" 
                      fill="var(--color-target)"
                      radius={[4, 4, 0, 0]}
                      opacity={0.3}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Cost Analysis */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Cost Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Cost Analysis Breakdown
                </CardTitle>
                <CardDescription>Detailed expense analysis by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tenantAnalytics.financial.costAnalysis}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {tenantAnalytics.financial.costAnalysis.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={`hsl(${220 + index * 40}, 70%, ${60 - index * 5}%)`} 
                          />
                        ))}
                      </Pie>
                      <ChartTooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                                <p className="font-medium">{data.period}</p>
                                <p className="text-sm text-muted-foreground">
                                  ${data.value.toLocaleString()}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Legend */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                    <div className="flex flex-wrap justify-center gap-3 text-sm">
                      {tenantAnalytics.financial.costAnalysis.map((item, index) => (
                        <div key={item.period} className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: `hsl(${220 + index * 40}, 70%, ${60 - index * 5}%)` }}
                          />
                          <span className="text-muted-foreground text-xs">
                            {item.period}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resource Efficiency */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Beaker className="h-5 w-5 text-indigo-600" />
                  Resource Efficiency Analysis
                </CardTitle>
                <CardDescription>Utilization vs. capacity analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {tenantAnalytics.resources.staffUtilization.map((resource, index) => (
                  <div key={index} className="space-y-2" data-testid={`resource-${resource.resource.toLowerCase().replace(/\s+/g, '-')}`}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">{resource.resource}</span>
                      <span className="text-sm text-muted-foreground">
                        {resource.utilized}/{resource.capacity} ({resource.efficiency}%)
                      </span>
                    </div>
                    <div className="relative">
                      <Progress 
                        value={resource.efficiency} 
                        className="h-3"
                      />
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                        {resource.efficiency}%
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Utilized: {resource.utilized}</span>
                      <span>Capacity: {resource.capacity}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Trend Analysis Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                6-Month Trend Summary
              </CardTitle>
              <CardDescription>Key insights and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-600">Positive Trends</span>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Revenue increased 23% over 6 months</li>
                    <li>• {organizationType === 'pharmacy' ? 'Prescription' : organizationType === 'laboratory' ? 'Test' : 'Patient'} volume growing consistently</li>
                    <li>• Staff efficiency above target</li>
                  </ul>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium text-yellow-600">Areas of Focus</span>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• {organizationType === 'pharmacy' ? 'Inventory turnover' : organizationType === 'laboratory' ? 'Equipment utilization' : 'Bed occupancy'} needs optimization</li>
                    <li>• Some departments below target</li>
                    <li>• Cost per unit trending upward</li>
                  </ul>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-600">Recommendations</span>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Increase {organizationType === 'pharmacy' ? 'pharmacist' : organizationType === 'laboratory' ? 'technician' : 'nursing'} capacity</li>
                    <li>• Optimize {organizationType === 'pharmacy' ? 'inventory management' : organizationType === 'laboratory' ? 'equipment scheduling' : 'patient flow'}</li>
                    <li>• Review cost structure</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add-staff">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add {organizationType === 'pharmacy' ? 'Pharmacy' : organizationType === 'laboratory' ? 'Laboratory' : 'Hospital'} Personnel</CardTitle>
                <CardDescription>
                  Add new staff members to your {organizationType}. Each person will receive an email with a temporary password.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {organizationStaffCards.map((staff) => {
                    const Icon = staff.icon;
                    return (
                      <Card key={staff.role} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <Icon className="h-8 w-8 text-gray-600" />
                            <Badge className={staff.color}>{staff.count}</Badge>
                          </div>
                          <CardTitle className="text-lg">{staff.title}</CardTitle>
                          <CardDescription>{staff.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button 
                            onClick={() => setCurrentTab("manage-users")}
                            className="w-full"
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add {staff.title.split(' ')[1]}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="manage-users">
          {organizationType === 'pharmacy' ? (
            <UserRolesManagement />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Create and manage all {organizationType} staff accounts. New users receive temporary passwords via email.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserRoles />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {organizationType !== 'pharmacy' && (
          <TabsContent value="departments">
            <DepartmentManagement />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}