import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import { Building2, Users, Activity, Database, CheckCircle, XCircle, Clock, Mail, Phone, MapPin, Calendar, Crown, Edit3, TrendingUp, BarChart3, PieChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useMemo } from "react";
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

interface TenantWithStats {
  id: string;
  name: string;
  type: string;
  subdomain: string;
  isActive: boolean;
  suspendedAt?: string;
  brandName?: string;
  primaryColor?: string;
  secondaryColor?: string;
  defaultLanguage?: string;
  baseCurrency?: string;
  settings?: {
    description?: string;
    features?: string[];
    planType?: string;
  };
  stats: {
    userCount: number;
    patientCount: number;
    isActive: boolean;
  };
}

interface MedicalSupplier {
  id: string;
  companyName: string;
  businessType: string;
  contactPersonName: string;
  contactEmail: string;
  contactPhone: string;
  websiteUrl?: string;
  businessAddress: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  businessDescription: string;
  productCategories: string[];
  yearsInBusiness: string;
  username: string;
  status: "pending_review" | "approved" | "rejected" | "suspended";
  termsAccepted: boolean;
  createdAt: string;
}

interface PlatformStats {
  totalTenants: number;
  totalUsers: number;
  tenantsByType: Record<string, number>;
  activeTenants: number;
  inactiveTenants: number;
}

// Edit organization form schema
const editOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  brandName: z.string().optional(),
  type: z.enum(["hospital", "pharmacy", "laboratory", "platform"]),
  subdomain: z.string().min(1, "Subdomain is required"),
  description: z.string().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  defaultLanguage: z.string().optional(),
  baseCurrency: z.string().optional(),
  isActive: z.boolean()
});

type EditOrganizationForm = z.infer<typeof editOrganizationSchema>;

export default function SuperAdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingTenant, setEditingTenant] = useState<TenantWithStats | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const editForm = useForm<EditOrganizationForm>({
    resolver: zodResolver(editOrganizationSchema),
    defaultValues: {
      name: "",
      brandName: "",
      type: "hospital",
      subdomain: "",
      description: "",
      primaryColor: "#10b981",
      secondaryColor: "#3b82f6",
      defaultLanguage: "en",
      baseCurrency: "USD",
      isActive: true
    }
  });

  const { data: tenants, isLoading: tenantsLoading } = useQuery<TenantWithStats[]>({
    queryKey: ['/api/admin/tenants']
  });

  const { data: platformStats, isLoading: statsLoading } = useQuery<PlatformStats>({
    queryKey: ['/api/admin/platform-stats']
  });

  const { data: suppliers, isLoading: suppliersLoading } = useQuery<MedicalSupplier[]>({
    queryKey: ['/api/admin/suppliers']
  });

  // Edit organization mutation
  const editTenantMutation = useMutation({
    mutationFn: async (data: EditOrganizationForm & { id: string }) => {
      const { id, ...updateData } = data;
      await apiRequest(`/api/admin/tenants/${id}`, {
        method: 'PUT',
        body: {
          ...updateData,
          settings: {
            ...editingTenant?.settings,
            description: updateData.description
          }
        }
      });
    },
    onSuccess: () => {
      toast({
        title: "Organization Updated",
        description: "The organization details have been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tenants'] });
      setIsEditDialogOpen(false);
      setEditingTenant(null);
      editForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update organization. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Function to open edit dialog
  const openEditDialog = (tenant: TenantWithStats) => {
    setEditingTenant(tenant);
    editForm.reset({
      name: tenant.name,
      brandName: tenant.brandName || "",
      type: tenant.type as "hospital" | "pharmacy" | "laboratory" | "platform",
      subdomain: tenant.subdomain,
      description: tenant.settings?.description || "",
      primaryColor: tenant.primaryColor || "#10b981",
      secondaryColor: tenant.secondaryColor || "#3b82f6",
      defaultLanguage: tenant.defaultLanguage || "en",
      baseCurrency: tenant.baseCurrency || "USD",
      isActive: tenant.isActive
    });
    setIsEditDialogOpen(true);
  };

  // Function to handle form submission
  const onSubmitEdit = (data: EditOrganizationForm) => {
    if (editingTenant) {
      editTenantMutation.mutate({ ...data, id: editingTenant.id });
    }
  };

  const approveSupplierMutation = useMutation({
    mutationFn: async (supplierId: string) => {
      await apiRequest(`/api/admin/suppliers/${supplierId}/approve`, {
        method: 'PUT'
      });
    },
    onSuccess: () => {
      toast({
        title: "Supplier Approved",
        description: "The supplier has been approved and can now access the platform.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/suppliers'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Approval Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const rejectSupplierMutation = useMutation({
    mutationFn: async ({ supplierId, reason }: { supplierId: string; reason: string }) => {
      await apiRequest(`/api/admin/suppliers/${supplierId}/reject`, {
        method: 'PUT',
        body: { reason }
      });
    },
    onSuccess: () => {
      toast({
        title: "Supplier Rejected",
        description: "The supplier registration has been rejected.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/suppliers'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Rejection Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const suspendSupplierMutation = useMutation({
    mutationFn: async ({ supplierId, reason }: { supplierId: string; reason: string }) => {
      await apiRequest(`/api/admin/suppliers/${supplierId}/suspend`, {
        method: 'PUT',
        body: { reason }
      });
    },
    onSuccess: () => {
      toast({
        title: "Supplier Suspended",
        description: "The supplier account has been suspended.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/suppliers'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Suspension Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const activateSupplierMutation = useMutation({
    mutationFn: async (supplierId: string) => {
      await apiRequest(`/api/admin/suppliers/${supplierId}/activate`, {
        method: 'PUT'
      });
    },
    onSuccess: () => {
      toast({
        title: "Supplier Activated",
        description: "The supplier account has been activated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/suppliers'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Activation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const suspendTenantMutation = useMutation({
    mutationFn: async ({ tenantId, reason }: { tenantId: string; reason: string }) => {
      await apiRequest(`/api/admin/tenants/${tenantId}/suspend`, {
        method: 'PUT',
        body: { reason }
      });
    },
    onSuccess: () => {
      toast({
        title: "Tenant Suspended",
        description: "The tenant account has been suspended.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tenants'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Suspension Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const activateTenantMutation = useMutation({
    mutationFn: async (tenantId: string) => {
      await apiRequest(`/api/admin/tenants/${tenantId}/activate`, {
        method: 'PUT'
      });
    },
    onSuccess: () => {
      toast({
        title: "Tenant Activated",
        description: "The tenant account has been activated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tenants'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Activation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  if (tenantsLoading || statsLoading || suppliersLoading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <Crown className="h-8 w-8 text-yellow-500" />
          Super Admin Dashboard
        </h1>
        <div className="text-center">Loading platform overview...</div>
      </div>
    );
  }

  const getTenantTypeColor = (type: string) => {
    switch (type) {
      case 'hospital': return 'bg-blue-100 text-blue-800';
      case 'pharmacy': return 'bg-green-100 text-green-800';
      case 'laboratory': return 'bg-purple-100 text-purple-800';
      case 'clinic': return 'bg-orange-100 text-orange-800';
      case 'platform': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_review':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending Review</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'suspended':
        return <Badge variant="destructive" className="bg-orange-100 text-orange-800"><XCircle className="w-3 h-3 mr-1" />Suspended</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTenantStatusBadge = (tenant: any) => {
    if (tenant.suspendedAt) {
      return <Badge variant="destructive" className="bg-orange-100 text-orange-800"><XCircle className="w-3 h-3 mr-1" />Suspended</Badge>;
    }
    if (!tenant.isActive) {
      return <Badge variant="destructive" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Inactive</Badge>;
    }
    return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
  };

  const pendingSuppliers = suppliers?.filter(s => s.status === 'pending_review') || [];

  // Mock data for charts - in real app, this would come from APIs
  const platformGrowthData = useMemo(() => [
    { month: "Jan", tenants: 8, users: 156, newTenants: 2, activeUsers: 142 },
    { month: "Feb", tenants: 9, users: 178, newTenants: 1, activeUsers: 165 },
    { month: "Mar", tenants: 10, users: 203, newTenants: 1, activeUsers: 187 },
    { month: "Apr", tenants: 11, users: 234, newTenants: 1, activeUsers: 218 },
    { month: "May", users: 267, tenants: 12, newTenants: 1, activeUsers: 245 },
    { month: "Jun", tenants: platformStats?.totalTenants || 12, users: platformStats?.totalUsers || 285, newTenants: 0, activeUsers: 265 }
  ], [platformStats]);

  const activityData = useMemo(() => [
    { period: "00:00", logins: 12, transactions: 8, apiCalls: 245 },
    { period: "04:00", logins: 18, transactions: 14, apiCalls: 312 },
    { period: "08:00", logins: 89, transactions: 67, apiCalls: 1247 },
    { period: "12:00", logins: 134, transactions: 98, apiCalls: 1856 },
    { period: "16:00", logins: 156, transactions: 112, apiCalls: 2134 },
    { period: "20:00", logins: 98, transactions: 73, apiCalls: 1567 }
  ], []);

  const tenantEngagementData = useMemo(() => {
    if (!tenants) return [];
    return tenants.slice(0, 8).map(tenant => ({
      name: tenant.name.length > 15 ? tenant.name.substring(0, 15) + '...' : tenant.name,
      users: tenant.stats.userCount,
      patients: tenant.stats.patientCount,
      type: tenant.type,
      engagement: Math.round((tenant.stats.userCount + tenant.stats.patientCount / 10) * 2.5)
    }));
  }, [tenants]);

  const tenantDistributionData = useMemo(() => {
    if (!platformStats?.tenantsByType) return [];
    return Object.entries(platformStats.tenantsByType).map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: count,
      color: type === 'hospital' ? 'hsl(220, 98%, 61%)' :
             type === 'pharmacy' ? 'hsl(142, 76%, 36%)' :
             type === 'laboratory' ? 'hsl(271, 91%, 65%)' :
             type === 'clinic' ? 'hsl(35, 91%, 62%)' : 'hsl(210, 40%, 50%)'
    }));
  }, [platformStats]);

  const systemHealthData = useMemo(() => [
    { name: 'Database', value: 98, color: 'hsl(142, 76%, 36%)' },
    { name: 'API', value: 99, color: 'hsl(220, 98%, 61%)' },
    { name: 'Storage', value: 97, color: 'hsl(271, 91%, 65%)' },
    { name: 'Network', value: 96, color: 'hsl(35, 91%, 62%)' }
  ], []);

  // Chart configurations
  const growthChartConfig = {
    tenants: {
      label: "Total Tenants",
      color: "hsl(220, 98%, 61%)",
    },
    users: {
      label: "Total Users",
      color: "hsl(142, 76%, 36%)",
    },
  } satisfies ChartConfig;

  const activityChartConfig = {
    logins: {
      label: "User Logins",
      color: "hsl(220, 98%, 61%)",
    },
    transactions: {
      label: "Transactions",
      color: "hsl(142, 76%, 36%)",
    },
    apiCalls: {
      label: "API Calls",
      color: "hsl(271, 91%, 65%)",
    },
  } satisfies ChartConfig;

  const engagementChartConfig = {
    users: {
      label: "Active Users",
      color: "hsl(220, 98%, 61%)",
    },
    patients: {
      label: "Patients",
      color: "hsl(142, 76%, 36%)",
    },
  } satisfies ChartConfig;

  const distributionChartConfig = {
    hospital: {
      label: "Hospitals",
      color: "hsl(220, 98%, 61%)",
    },
    pharmacy: {
      label: "Pharmacies",
      color: "hsl(142, 76%, 36%)",
    },
    laboratory: {
      label: "Laboratories",
      color: "hsl(271, 91%, 65%)",
    },
    clinic: {
      label: "Clinics",
      color: "hsl(35, 91%, 62%)",
    },
  } satisfies ChartConfig;

  // Advanced Analytics Data
  const revenueGrowthData = useMemo(() => [
    { quarter: "Q1 2024", revenue: 45200, subscriptions: 8, averageRevenue: 5650, growth: 12.5 },
    { quarter: "Q2 2024", revenue: 52800, subscriptions: 9, averageRevenue: 5867, growth: 16.8 },
    { quarter: "Q3 2024", revenue: 61500, subscriptions: 11, averageRevenue: 5591, growth: 16.5 },
    { quarter: "Q4 2024", revenue: 73200, subscriptions: 12, averageRevenue: 6100, growth: 19.0 },
  ], []);

  const performanceMetricsData = useMemo(() => [
    { metric: "Response Time", current: 285, target: 300, previous: 320, unit: "ms", status: "good" },
    { metric: "Uptime", current: 99.8, target: 99.5, previous: 99.2, unit: "%", status: "excellent" },
    { metric: "Error Rate", current: 0.12, target: 0.5, previous: 0.18, unit: "%", status: "excellent" },
    { metric: "Throughput", current: 1247, target: 1000, previous: 1158, unit: "req/min", status: "excellent" },
  ], []);

  const supplierAnalyticsData = useMemo(() => {
    if (!suppliers) return [];
    const statusCounts = suppliers.reduce((acc, supplier) => {
      acc[supplier.status] = (acc[supplier.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      status: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count,
      color: status === 'approved' ? 'hsl(142, 76%, 36%)' :
             status === 'pending_review' ? 'hsl(35, 91%, 62%)' :
             status === 'rejected' ? 'hsl(0, 85%, 60%)' :
             'hsl(25, 95%, 53%)'
    }));
  }, [suppliers]);

  const geographicData = useMemo(() => [
    { region: "North America", tenants: 7, users: 189, revenue: 45200 },
    { region: "Europe", tenants: 3, users: 67, revenue: 18300 },
    { region: "Asia Pacific", tenants: 2, users: 29, revenue: 9700 }
  ], []);

  const monthlyTrendData = useMemo(() => [
    { month: "Jan", newTenants: 2, churnTenants: 0, netGrowth: 2, satisfaction: 4.2 },
    { month: "Feb", newTenants: 1, churnTenants: 0, netGrowth: 1, satisfaction: 4.3 },
    { month: "Mar", newTenants: 1, churnTenants: 0, netGrowth: 1, satisfaction: 4.4 },
    { month: "Apr", newTenants: 1, churnTenants: 0, netGrowth: 1, satisfaction: 4.5 },
    { month: "May", newTenants: 1, churnTenants: 0, netGrowth: 1, satisfaction: 4.4 },
    { month: "Jun", newTenants: 0, churnTenants: 0, netGrowth: 0, satisfaction: 4.6 }
  ], []);

  // Advanced Analytics Chart Configs
  const revenueChartConfig = {
    revenue: {
      label: "Revenue ($)",
      color: "hsl(142, 76%, 36%)",
    },
    subscriptions: {
      label: "Active Subscriptions",
      color: "hsl(220, 98%, 61%)",
    },
    growth: {
      label: "Growth %",
      color: "hsl(271, 91%, 65%)",
    },
  } satisfies ChartConfig;

  const performanceChartConfig = {
    current: {
      label: "Current",
      color: "hsl(220, 98%, 61%)",
    },
    target: {
      label: "Target",
      color: "hsl(142, 76%, 36%)",
    },
    previous: {
      label: "Previous",
      color: "hsl(210, 40%, 70%)",
    },
  } satisfies ChartConfig;

  const trendChartConfig = {
    newTenants: {
      label: "New Tenants",
      color: "hsl(142, 76%, 36%)",
    },
    churnTenants: {
      label: "Churned Tenants",
      color: "hsl(0, 85%, 60%)",
    },
    netGrowth: {
      label: "Net Growth",
      color: "hsl(220, 98%, 61%)",
    },
  } satisfies ChartConfig;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Crown className="h-8 w-8 text-yellow-500" />
          Super Admin Dashboard
        </h1>
        <p className="text-gray-600">Platform oversight and approval management</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="inline-flex h-12 items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground w-full max-w-3xl">
          <TabsTrigger value="overview">Platform Overview</TabsTrigger>
          <TabsTrigger value="analytics">Advanced Analytics</TabsTrigger>
          <TabsTrigger value="suppliers" className="relative">
            Supplier Approvals
            {pendingSuppliers.length > 0 && (
              <Badge className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {pendingSuppliers.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="tenants">Tenant Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Platform Statistics */}
          {platformStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{platformStats.totalTenants}</div>
                  <p className="text-xs text-muted-foreground">
                    {platformStats.activeTenants} active, {platformStats.inactiveTenants} inactive
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{platformStats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    Across all tenants
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Suppliers</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{pendingSuppliers.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Awaiting approval
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Health</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">Healthy</div>
                  <p className="text-xs text-muted-foreground">
                    All systems operational
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Platform Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Platform Growth Trends */}
            <Card data-testid="card-platform-growth">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Platform Growth Trends
                </CardTitle>
                <CardDescription>
                  Tenant and user growth over the last 6 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer config={growthChartConfig}>
                    <LineChart data={platformGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="tenants" 
                        stroke="var(--color-tenants)" 
                        strokeWidth={3}
                        dot={{ fill: "var(--color-tenants)", strokeWidth: 2, r: 4 }}
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="users" 
                        stroke="var(--color-users)" 
                        strokeWidth={3}
                        dot={{ fill: "var(--color-users)", strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            {/* Tenant Distribution */}
            <Card data-testid="card-tenant-distribution">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-purple-600" />
                  Tenant Type Distribution
                </CardTitle>
                <CardDescription>
                  Breakdown of organizations by type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer config={distributionChartConfig}>
                    <RechartsPieChart>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Pie
                        data={tenantDistributionData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {tenantDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartLegend content={<ChartLegendContent />} />
                    </RechartsPieChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Metrics and Engagement */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* User Activity Trends */}
            <Card data-testid="card-activity-trends">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  24-Hour Activity Trends
                </CardTitle>
                <CardDescription>
                  Platform activity throughout the day
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer config={activityChartConfig}>
                    <AreaChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area 
                        type="monotone" 
                        dataKey="logins" 
                        stackId="1" 
                        stroke="var(--color-logins)" 
                        fill="var(--color-logins)"
                        fillOpacity={0.6}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="transactions" 
                        stackId="1" 
                        stroke="var(--color-transactions)" 
                        fill="var(--color-transactions)"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            {/* Tenant Engagement */}
            <Card data-testid="card-tenant-engagement">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-orange-600" />
                  Tenant Engagement Metrics
                </CardTitle>
                <CardDescription>
                  Active users and patients per tenant
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer config={engagementChartConfig}>
                    <BarChart data={tenantEngagementData} margin={{ left: 20, right: 20, top: 10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="users" fill="var(--color-users)" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="patients" fill="var(--color-patients)" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Health */}
          <div className="grid grid-cols-1 gap-6">
            <Card data-testid="card-system-health">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-600" />
                  System Health Overview
                </CardTitle>
                <CardDescription>
                  Real-time system performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {systemHealthData.map((system, index) => (
                    <div key={index} className="text-center space-y-2">
                      <div className="relative w-20 h-20 mx-auto">
                        <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-gray-300"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-blue-600"
                            fill="none"
                            stroke={system.color}
                            strokeWidth="3"
                            strokeDasharray={`${system.value}, 100`}
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-bold">{system.value}%</span>
                        </div>
                      </div>
                      <p className="text-sm font-medium">{system.name}</p>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        system.value >= 98 ? 'bg-green-100 text-green-800' :
                        system.value >= 95 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {system.value >= 98 ? 'Excellent' :
                         system.value >= 95 ? 'Good' : 'Needs Attention'}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Revenue & Growth Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card data-testid="card-revenue-growth">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Revenue Growth Analysis
                </CardTitle>
                <CardDescription>
                  Quarterly revenue and subscription trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer config={revenueChartConfig}>
                    <LineChart data={revenueGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="quarter" />
                      <YAxis yAxisId="revenue" orientation="left" />
                      <YAxis yAxisId="subscriptions" orientation="right" />
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                        formatter={(value, name) => [
                          name === 'revenue' ? `$${value.toLocaleString()}` : value,
                          name === 'revenue' ? 'Revenue' :
                          name === 'subscriptions' ? 'Subscriptions' : 'Growth %'
                        ]}
                      />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Line 
                        yAxisId="revenue"
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="var(--color-revenue)" 
                        strokeWidth={3}
                        dot={{ fill: "var(--color-revenue)", strokeWidth: 2, r: 4 }}
                      />
                      <Line 
                        yAxisId="subscriptions"
                        type="monotone" 
                        dataKey="subscriptions" 
                        stroke="var(--color-subscriptions)" 
                        strokeWidth={3}
                        dot={{ fill: "var(--color-subscriptions)", strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-supplier-analytics">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Supplier Status Distribution
                </CardTitle>
                <CardDescription>
                  Current supplier registration status breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer config={{}}>
                    <RechartsPieChart>
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                        formatter={(value, name) => [value, name]}
                      />
                      <Pie
                        data={supplierAnalyticsData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="status"
                        label={({ status, count, percent }) => 
                          `${status}: ${count} (${(percent * 100).toFixed(0)}%)`
                        }
                      >
                        {supplierAnalyticsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </RechartsPieChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics & Geographic Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card data-testid="card-performance-metrics">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  System Performance Metrics
                </CardTitle>
                <CardDescription>
                  Current vs target performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {performanceMetricsData.map((metric, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{metric.metric}</span>
                        <div className="text-right">
                          <span className="text-lg font-bold">
                            {metric.current}{metric.unit}
                          </span>
                          <div className={`text-xs ${
                            metric.status === 'excellent' ? 'text-green-600' :
                            metric.status === 'good' ? 'text-blue-600' : 'text-yellow-600'
                          }`}>
                            Target: {metric.target}{metric.unit}
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            metric.status === 'excellent' ? 'bg-green-500' :
                            metric.status === 'good' ? 'bg-blue-500' : 'bg-yellow-500'
                          }`}
                          style={{ 
                            width: `${Math.min(100, (metric.current / metric.target) * 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-geographic-distribution">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-orange-600" />
                  Geographic Distribution
                </CardTitle>
                <CardDescription>
                  Tenant and user distribution by region
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer config={engagementChartConfig}>
                    <BarChart data={geographicData} margin={{ top: 10, right: 20, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="region" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                        formatter={(value, name) => [
                          name === 'revenue' ? `$${value.toLocaleString()}` : value,
                          name === 'tenants' ? 'Tenants' :
                          name === 'users' ? 'Users' : 'Revenue'
                        ]}
                      />
                      <Bar dataKey="tenants" fill="hsl(220, 98%, 61%)" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="users" fill="hsl(142, 76%, 36%)" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trends Analysis */}
          <div className="grid grid-cols-1 gap-6">
            <Card data-testid="card-trends-analysis">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-indigo-600" />
                  Monthly Trends Analysis
                </CardTitle>
                <CardDescription>
                  Tenant acquisition, churn, and satisfaction trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="h-[300px]">
                    <h4 className="text-sm font-medium mb-3">Tenant Growth vs Churn</h4>
                    <ChartContainer config={trendChartConfig}>
                      <AreaChart data={monthlyTrendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area 
                          type="monotone" 
                          dataKey="newTenants" 
                          stackId="1" 
                          stroke="var(--color-newTenants)" 
                          fill="var(--color-newTenants)"
                          fillOpacity={0.7}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="churnTenants" 
                          stackId="2" 
                          stroke="var(--color-churnTenants)" 
                          fill="var(--color-churnTenants)"
                          fillOpacity={0.7}
                        />
                      </AreaChart>
                    </ChartContainer>
                  </div>
                  <div className="h-[300px]">
                    <h4 className="text-sm font-medium mb-3">Customer Satisfaction Trends</h4>
                    <ChartContainer config={{ satisfaction: { label: "Satisfaction (5.0)", color: "hsl(142, 76%, 36%)" } }}>
                      <LineChart data={monthlyTrendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis domain={[4.0, 5.0]} />
                        <ChartTooltip 
                          content={<ChartTooltipContent />}
                          formatter={(value) => [`${value}/5.0`, "Satisfaction"]}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="satisfaction" 
                          stroke="hsl(142, 76%, 36%)" 
                          strokeWidth={3}
                          dot={{ fill: "hsl(142, 76%, 36%)", strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ChartContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Supplier Registration Approvals
              </CardTitle>
              <CardDescription>
                Review and approve medical supplier registrations to the marketplace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {suppliers && suppliers.length > 0 ? (
                  suppliers.map((supplier) => (
                    <Card key={supplier.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">{supplier.companyName}</h3>
                            {getStatusBadge(supplier.status)}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-500" />
                                <span>{supplier.contactEmail}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-gray-500" />
                                <span>{supplier.contactPhone}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-500" />
                                <span>{supplier.city}, {supplier.state}, {supplier.country}</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <p><strong>Business Type:</strong> {supplier.businessType}</p>
                              <p><strong>Years in Business:</strong> {supplier.yearsInBusiness}</p>
                              <p><strong>Username:</strong> {supplier.username}</p>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span>Applied: {new Date(supplier.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gray-50 p-3 rounded">
                            <p className="text-sm"><strong>Description:</strong> {supplier.businessDescription}</p>
                          </div>

                          <div className="flex gap-3 pt-4">
                            {supplier.status === 'pending_review' && (
                              <>
                                <Button 
                                  onClick={() => approveSupplierMutation.mutate(supplier.id)}
                                  disabled={approveSupplierMutation.isPending}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Approve
                                </Button>
                                <Button 
                                  variant="destructive"
                                  onClick={() => rejectSupplierMutation.mutate({ 
                                    supplierId: supplier.id, 
                                    reason: 'Did not meet platform requirements' 
                                  })}
                                  disabled={rejectSupplierMutation.isPending}
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Reject
                                </Button>
                              </>
                            )}
                            
                            {supplier.status === 'approved' && (
                              <Button 
                                variant="outline"
                                onClick={() => suspendSupplierMutation.mutate({ 
                                  supplierId: supplier.id, 
                                  reason: 'Account suspended for policy violations' 
                                })}
                                disabled={suspendSupplierMutation.isPending}
                                className="border-orange-500 text-orange-600 hover:bg-orange-50"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Suspend
                              </Button>
                            )}
                            
                            {supplier.status === 'suspended' && (
                              <Button 
                                onClick={() => activateSupplierMutation.mutate(supplier.id)}
                                disabled={activateSupplierMutation.isPending}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Activate
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">No supplier registrations found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tenants" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tenant Overview</CardTitle>
              <CardDescription>
                All registered organizations in the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tenants && tenants.length > 0 ? (
                  tenants.map((tenant) => (
                    <div key={tenant.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <Building2 className="h-8 w-8 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{tenant.name}</h3>
                          <p className="text-sm text-gray-600">
                            {tenant.subdomain}.navimed.health
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getTenantTypeColor(tenant.type)}>
                              {tenant.type}
                            </Badge>
                            {getTenantStatusBadge(tenant)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {tenant.stats?.userCount || 0} users
                          </p>
                          <p className="text-sm text-gray-600">
                            {tenant.stats?.patientCount || 0} patients
                          </p>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          {/* Edit button - available for all tenants */}
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(tenant)}
                            className="border-blue-500 text-blue-600 hover:bg-blue-50"
                          >
                            <Edit3 className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          
                          {tenant.isActive && !tenant.suspendedAt && tenant.type !== 'platform' && (
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => suspendTenantMutation.mutate({ 
                                tenantId: tenant.id, 
                                reason: 'Account suspended for policy violations' 
                              })}
                              disabled={suspendTenantMutation.isPending}
                              className="border-orange-500 text-orange-600 hover:bg-orange-50"
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              Suspend
                            </Button>
                          )}
                          
                          {(!tenant.isActive || tenant.suspendedAt) && tenant.type !== 'platform' && (
                            <Button 
                              size="sm"
                              onClick={() => activateTenantMutation.mutate(tenant.id)}
                              disabled={activateTenantMutation.isPending}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Activate
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">No tenants found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Organization Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Organization</DialogTitle>
            <DialogDescription>
              Update the organization details below. All changes will be applied immediately.
            </DialogDescription>
          </DialogHeader>

          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter organization name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="brandName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter brand name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select organization type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="hospital">Hospital</SelectItem>
                          <SelectItem value="pharmacy">Pharmacy</SelectItem>
                          <SelectItem value="laboratory">Laboratory</SelectItem>
                          <SelectItem value="platform">Platform</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="subdomain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subdomain</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter subdomain" {...field} />
                      </FormControl>
                      <FormDescription>
                        This will be the URL: {field.value}.navimed.health
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="primaryColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Color</FormLabel>
                      <FormControl>
                        <Input type="color" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="secondaryColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secondary Color</FormLabel>
                      <FormControl>
                        <Input type="color" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="defaultLanguage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Language</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="baseCurrency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Currency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter organization description"
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={editTenantMutation.isPending}
                >
                  {editTenantMutation.isPending ? "Updating..." : "Update Organization"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}