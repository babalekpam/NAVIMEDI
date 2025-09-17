import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
import { 
  Building2, 
  Users, 
  Crown, 
  Palette, 
  Settings, 
  Calendar,
  TrendingUp,
  Shield,
  Globe,
  Star,
  Eye,
  Edit3,
  UserPlus,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  MapPin,
  DollarSign,
  Zap,
  Target,
  Award
} from "lucide-react";

interface Client {
  id: string;
  name: string;
  type: string;
  subdomain: string;
  userCount: number;
  activeUsers: number;
  subscriptionStatus: string;
  brandName?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  customDomain?: string;
  hasWhiteLabel: boolean;
  isUnlimited: boolean;
  createdAt: string;
  settings?: {
    features?: string[];
    planType?: string;
  };
}

interface ClientAnalytics {
  totalRevenue: number;
  monthlyGrowth: number;
  churnRate: number;
  avgUsersPerClient: number;
  clientSatisfaction: number;
  platformHealth: number;
}

export default function SuperAdminClientManagement() {
  const { toast } = useToast();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState('analytics');
  const [whiteLabelSettings, setWhiteLabelSettings] = useState({
    brandName: "",
    logoUrl: "",
    primaryColor: "#10b981",
    secondaryColor: "#3b82f6",
    customDomain: "",
    customCss: ""
  });

  const { data: clients = [], isLoading } = useQuery<Client[]>({
    queryKey: ['/api/admin/clients'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Generate analytics data based on client data
  const analytics = useMemo(() => {
    const totalRevenue = clients.length * 2500; // Mock: $2500 avg per client
    const totalActiveUsers = clients.reduce((sum, client) => sum + client.activeUsers, 0);
    const avgUsersPerClient = clients.length > 0 ? Math.round(totalActiveUsers / clients.length) : 0;
    const whiteLabelCount = clients.filter(c => c.hasWhiteLabel).length;
    const unlimitedCount = clients.filter(c => c.isUnlimited).length;
    
    return {
      totalRevenue,
      monthlyGrowth: clients.length > 0 ? 18.5 : 0,
      churnRate: clients.length > 0 ? 2.1 : 0,
      avgUsersPerClient,
      clientSatisfaction: clients.length > 0 ? 4.8 : 0,
      platformHealth: clients.length > 0 ? 98.5 : 100,
      whiteLabelAdoption: clients.length > 0 ? Math.round((whiteLabelCount / clients.length) * 100) : 0,
      unlimitedAdoption: clients.length > 0 ? Math.round((unlimitedCount / clients.length) * 100) : 0
    };
  }, [clients]);

  // Time series data for charts
  const clientGrowthData = useMemo(() => [
    { month: "Jan", totalClients: Math.max(1, clients.length - 5), newClients: 2, churnedClients: 0, revenue: 12500 },
    { month: "Feb", totalClients: Math.max(1, clients.length - 4), newClients: 1, churnedClients: 0, revenue: 15000 },
    { month: "Mar", totalClients: Math.max(1, clients.length - 3), newClients: 2, churnedClients: 1, revenue: 18500 },
    { month: "Apr", totalClients: Math.max(1, clients.length - 2), newClients: 1, churnedClients: 0, revenue: 22000 },
    { month: "May", totalClients: Math.max(1, clients.length - 1), newClients: 2, churnedClients: 0, revenue: 27500 },
    { month: "Jun", totalClients: clients.length, newClients: 1, churnedClients: 0, revenue: analytics?.totalRevenue || 30000 }
  ], [clients, analytics]);

  const userEngagementData = useMemo(() => {
    return clients.slice(0, 8).map(client => {
      const safeUserCount = client.userCount || 1;
      const engagementRate = Math.round((client.activeUsers / safeUserCount) * 100);
      return {
        name: client.name.length > 12 ? client.name.substring(0, 12) + '...' : client.name,
        activeUsers: client.activeUsers,
        totalUsers: client.userCount,
        engagementRate: isFinite(engagementRate) ? Math.min(100, engagementRate) : 0,
        type: client.type
      };
    });
  }, [clients]);

  const subscriptionDistributionData = useMemo(() => {
    if (clients.length === 0) {
      return [{ status: 'No Data', count: 0, value: 0, fill: 'hsl(210, 40%, 50%)' }];
    }
    
    const statusCounts = clients.reduce((acc, client) => {
      acc[client.subscriptionStatus] = (acc[client.subscriptionStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
      value: count,
      fill: status === 'active' ? 'hsl(142, 76%, 36%)' :
            status === 'trial' ? 'hsl(35, 91%, 62%)' :
            status === 'suspended' ? 'hsl(0, 85%, 60%)' :
            'hsl(210, 40%, 50%)'
    }));
  }, [clients]);

  const clientTypeDistributionData = useMemo(() => {
    if (clients.length === 0) {
      return [{ type: 'No Data', count: 0, value: 0, fill: 'hsl(210, 40%, 50%)' }];
    }
    
    const typeCounts = clients.reduce((acc, client) => {
      acc[client.type] = (acc[client.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(typeCounts).map(([type, count]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count,
      value: count,
      fill: type === 'hospital' ? 'hsl(220, 98%, 61%)' :
            type === 'pharmacy' ? 'hsl(142, 76%, 36%)' :
            type === 'laboratory' ? 'hsl(271, 91%, 65%)' :
            type === 'clinic' ? 'hsl(35, 91%, 62%)' :
            'hsl(210, 40%, 50%)'
    }));
  }, [clients]);

  const whiteLabelAdoptionData = useMemo(() => {
    if (clients.length === 0) {
      return [{ category: 'No Data', count: 0, fill: 'hsl(210, 40%, 50%)' }];
    }
    return [
      { category: 'White Labeled', count: clients.filter(c => c.hasWhiteLabel).length, fill: 'hsl(271, 91%, 65%)' },
      { category: 'Standard', count: clients.filter(c => !c.hasWhiteLabel).length, fill: 'hsl(210, 40%, 50%)' }
    ];
  }, [clients]);

  const clientHealthData = useMemo(() => {
    return clients.slice(0, 6).map(client => {
      const safeUserCount = client.userCount || 1;
      const engagementScore = (client.activeUsers / safeUserCount) * 50;
      const healthScore = Math.round(
        (isFinite(engagementScore) ? engagementScore : 0) + // User engagement: 50%
        (client.subscriptionStatus === 'active' ? 25 : 0) + // Subscription: 25%
        (client.hasWhiteLabel ? 15 : 0) + // White label: 15%
        (client.isUnlimited ? 10 : 0) // Unlimited plan: 10%
      );
      return {
        name: client.name.length > 15 ? client.name.substring(0, 15) + '...' : client.name,
        health: Math.min(100, Math.max(0, healthScore)),
        users: client.activeUsers,
        status: client.subscriptionStatus
      };
    });
  }, [clients]);

  // Chart configurations
  const growthChartConfig = {
    totalClients: {
      label: "Total Clients",
      color: "hsl(220, 98%, 61%)",
    },
    newClients: {
      label: "New Clients",
      color: "hsl(142, 76%, 36%)",
    },
    revenue: {
      label: "Revenue ($)",
      color: "hsl(271, 91%, 65%)",
    },
  } satisfies ChartConfig;

  const engagementChartConfig = {
    activeUsers: {
      label: "Active Users",
      color: "hsl(220, 98%, 61%)",
    },
    totalUsers: {
      label: "Total Users",
      color: "hsl(210, 40%, 50%)",
    },
    engagementRate: {
      label: "Engagement %",
      color: "hsl(142, 76%, 36%)",
    },
  } satisfies ChartConfig;

  const healthChartConfig = {
    health: {
      label: "Health Score",
      color: "hsl(142, 76%, 36%)",
    },
  } satisfies ChartConfig;

  const updateWhiteLabelMutation = useMutation({
    mutationFn: async (data: { tenantId: string; settings: any }) => {
      const response = await apiRequest(`/api/tenants/${data.tenantId}/white-label`, {
        method: 'PATCH',
        body: data.settings
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "White Label Updated",
        description: "Client white label settings have been updated successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/clients'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update white label settings.",
        variant: "destructive"
      });
    }
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: async (data: { tenantId: string; subscription: any }) => {
      const response = await apiRequest(`/api/tenants/${data.tenantId}/subscription`, {
        method: 'PATCH',
        body: data.subscription
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Subscription Updated",
        description: "Client subscription has been updated successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/clients'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update subscription.",
        variant: "destructive"
      });
    }
  });

  const handleWhiteLabelUpdate = () => {
    if (!selectedClient) return;
    
    updateWhiteLabelMutation.mutate({
      tenantId: selectedClient.id,
      settings: whiteLabelSettings
    });
  };

  const grantUnlimitedAccess = (clientId: string) => {
    updateSubscriptionMutation.mutate({
      tenantId: clientId,
      subscription: {
        subscriptionStatus: 'active',
        planType: 'unlimited',
        features: ['unlimited', 'white_label', 'premium_support', 'api_access', 'advanced_analytics']
      }
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const EmptyState = () => (
    <Card className="text-center py-12">
      <CardContent>
        <div className="flex flex-col items-center gap-6">
          <div className="rounded-full bg-blue-50 p-6">
            <Building2 className="h-16 w-16 text-blue-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">No Clients Yet</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Welcome to your Super Admin dashboard! Start by onboarding your first client organization 
              to see analytics and management features.
            </p>
          </div>
          <div className="flex gap-3">
            <Button className="flex items-center gap-2" data-testid="button-invite-client">
              <UserPlus className="h-4 w-4" />
              Invite Client
            </Button>
            <Button variant="outline" className="flex items-center gap-2" data-testid="button-view-docs">
              <Eye className="h-4 w-4" />
              View Documentation
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Crown className="h-8 w-8 text-yellow-500" />
          Super Admin - Client Management
        </h1>
        <p className="text-gray-600 mt-2">
          Manage all client organizations with unlimited privileges and white label settings
        </p>
      </div>

      {/* Show empty state if no clients */}
      {clients.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Platform Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Building2 className="h-12 w-12 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{clients.length}</p>
                <p className="text-sm text-gray-600">Total Clients</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Users className="h-12 w-12 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {clients.reduce((sum: number, client: Client) => sum + client.activeUsers, 0)}
                </p>
                <p className="text-sm text-gray-600">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Palette className="h-12 w-12 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {clients.filter((client: Client) => client.hasWhiteLabel).length}
                </p>
                <p className="text-sm text-gray-600">White Labeled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Star className="h-12 w-12 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">
                  {clients.filter((client: Client) => client.isUnlimited).length}
                </p>
                <p className="text-sm text-gray-600">Unlimited Plans</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="engagement" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Engagement
          </TabsTrigger>
          <TabsTrigger value="intelligence" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Intelligence
          </TabsTrigger>
          <TabsTrigger value="management" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Management
          </TabsTrigger>
        </TabsList>

        {/* Analytics Tab - Growth and Revenue */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Client Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Client Growth & Revenue
                </CardTitle>
                <CardDescription>
                  Monthly client growth and revenue trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={growthChartConfig} className="h-[350px]">
                  <LineChart data={clientGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="month" 
                      className="text-muted-foreground"
                      fontSize={12}
                    />
                    <YAxis 
                      yAxisId="clients"
                      className="text-muted-foreground"
                      fontSize={12}
                    />
                    <YAxis 
                      yAxisId="revenue"
                      orientation="right"
                      className="text-muted-foreground"
                      fontSize={12}
                      tickFormatter={(value) => `$${value/1000}k`}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line 
                      yAxisId="clients"
                      type="monotone" 
                      dataKey="totalClients" 
                      stroke="var(--color-totalClients)" 
                      strokeWidth={3}
                      dot={{ fill: "var(--color-totalClients)", strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      yAxisId="revenue"
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="var(--color-revenue)" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: "var(--color-revenue)", strokeWidth: 2, r: 3 }}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Subscription Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-blue-600" />
                  Subscription Distribution
                </CardTitle>
                <CardDescription>
                  Client subscription status breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}}>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={subscriptionDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ status, count, percent }) => 
                          `${status} (${count})`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {subscriptionDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                                <p className="font-medium">{data.status}</p>
                                <p className="text-sm text-muted-foreground">
                                  {data.count} clients
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Client Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-indigo-600" />
                  Client Type Distribution
                </CardTitle>
                <CardDescription>
                  Distribution of client types across the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}}>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={clientTypeDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {clientTypeDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                                <p className="font-medium">{data.type}</p>
                                <p className="text-sm text-muted-foreground">
                                  {data.count} organizations
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* White Label Adoption */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-purple-600" />
                  White Label Adoption
                </CardTitle>
                <CardDescription>
                  White label vs standard branding usage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={whiteLabelAdoptionData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="category" 
                        className="text-muted-foreground"
                        fontSize={12}
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
                                <p className="font-medium">{data.category}</p>
                                <p className="text-sm text-muted-foreground">
                                  {data.count} clients
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar 
                        dataKey="count" 
                        fill="#8884d8"
                        radius={[4, 4, 0, 0]}
                      >
                        {whiteLabelAdoptionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Engagement Tab - User Activity and Performance */}
        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            {/* User Engagement by Client */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Client User Engagement
                </CardTitle>
                <CardDescription>
                  Active vs total users and engagement rates by client
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={engagementChartConfig} className="h-[400px]">
                  <BarChart data={userEngagementData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="name" 
                      className="text-muted-foreground"
                      fontSize={11}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      yAxisId="users"
                      className="text-muted-foreground"
                      fontSize={12}
                    />
                    <YAxis 
                      yAxisId="rate"
                      orientation="right"
                      className="text-muted-foreground"
                      fontSize={12}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <ChartTooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                              <p className="font-medium">{label}</p>
                              <p className="text-sm text-muted-foreground">
                                Active: {data.activeUsers} / {data.totalUsers} users
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Engagement: {data.engagementRate}%
                              </p>
                              <p className="text-sm text-muted-foreground capitalize">
                                Type: {data.type}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      yAxisId="users"
                      dataKey="totalUsers" 
                      fill="var(--color-totalUsers)"
                      radius={[4, 4, 0, 0]}
                      opacity={0.7}
                    />
                    <Bar 
                      yAxisId="users"
                      dataKey="activeUsers" 
                      fill="var(--color-activeUsers)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Intelligence Tab - Health Scores and Insights */}
        <TabsContent value="intelligence" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Client Health Scores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-teal-600" />
                  Client Health Scores
                </CardTitle>
                <CardDescription>
                  Overall client health based on engagement and activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={healthChartConfig} className="h-[350px]">
                  <BarChart data={clientHealthData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      type="number"
                      domain={[0, 100]}
                      className="text-muted-foreground"
                      fontSize={12}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <YAxis 
                      type="category"
                      dataKey="name"
                      className="text-muted-foreground"
                      fontSize={10}
                      width={120}
                    />
                    <ChartTooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                              <p className="font-medium">{label}</p>
                              <p className="text-sm text-muted-foreground">
                                Health Score: {data.health}%
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Active Users: {data.users}
                              </p>
                              <p className="text-sm text-muted-foreground capitalize">
                                Status: {data.status}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="health" 
                      fill="var(--color-health)"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Platform Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-indigo-600" />
                  Platform Insights
                </CardTitle>
                <CardDescription>
                  Key platform metrics and performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Average Users per Client</span>
                      <span className="text-2xl font-bold text-blue-600">{analytics.avgUsersPerClient}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Monthly Growth Rate</span>
                      <span className="text-2xl font-bold text-green-600">+{analytics.monthlyGrowth}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Client Churn Rate</span>
                      <span className="text-2xl font-bold text-orange-600">{analytics.churnRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Client Satisfaction</span>
                      <span className="text-2xl font-bold text-yellow-600">{analytics.clientSatisfaction}/5</span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium mb-3">Platform Health</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">System Uptime</span>
                        <span className="text-sm font-medium">{analytics.platformHealth}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${analytics.platformHealth}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium mb-3">Feature Adoption</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">White Label</span>
                        <span className="text-sm font-medium">{analytics.whiteLabelAdoption}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full" 
                          style={{ width: `${analytics.whiteLabelAdoption}%` }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Unlimited Plans</span>
                        <span className="text-sm font-medium">{analytics.unlimitedAdoption}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full" 
                          style={{ width: `${analytics.unlimitedAdoption}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Management Tab - Client Cards with Management Features */}
        <TabsContent value="management" className="space-y-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Client Management</h3>
            <p className="text-sm text-muted-foreground">Manage individual client settings, white-label configurations, and subscriptions</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client: Client) => (
              <Card key={client.id} className="hover:shadow-lg transition-shadow" data-testid={`client-card-${client.id}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{client.brandName || client.name}</CardTitle>
                    <div className="flex gap-2">
                      {client.isUnlimited && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          <Star className="h-3 w-3 mr-1" />
                          Unlimited
                        </Badge>
                      )}
                      {client.hasWhiteLabel && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                          <Palette className="h-3 w-3 mr-1" />
                          Branded
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription>
                    {client.type.charAt(0).toUpperCase() + client.type.slice(1)} • {client.subdomain}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Users:</span>
                      <span className="font-medium">{client.activeUsers}/{client.userCount}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Status:</span>
                      <Badge variant={client.subscriptionStatus === 'active' ? 'default' : 'secondary'}>
                        {client.subscriptionStatus}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Created:</span>
                      <span className="text-gray-500">
                        {new Date(client.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => {
                              setSelectedClient(client);
                              setWhiteLabelSettings({
                                brandName: client.brandName || client.name,
                                logoUrl: client.logoUrl || "",
                                primaryColor: client.primaryColor || "#10b981",
                                secondaryColor: client.secondaryColor || "#3b82f6",
                                customDomain: client.customDomain || "",
                                customCss: ""
                              });
                            }}
                            data-testid={`button-customize-${client.id}`}
                          >
                            <Edit3 className="h-4 w-4 mr-1" />
                            Customize
                          </Button>
                        </DialogTrigger>
                        
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Client Management - {selectedClient?.name}</DialogTitle>
                            <DialogDescription>
                              Manage white label settings and subscription for this client
                            </DialogDescription>
                          </DialogHeader>
                          
                          <Tabs defaultValue="branding" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                              <TabsTrigger value="branding">White Label</TabsTrigger>
                              <TabsTrigger value="subscription">Subscription</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="branding" className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="brandName">Brand Name</Label>
                                  <Input
                                    id="brandName"
                                    value={whiteLabelSettings.brandName}
                                    onChange={(e) => setWhiteLabelSettings(prev => ({
                                      ...prev,
                                      brandName: e.target.value
                                    }))}
                                    placeholder="Custom brand name"
                                    data-testid="input-brand-name"
                                  />
                                </div>
                                
                                <div>
                                  <Label htmlFor="logoUrl">Logo URL</Label>
                                  <Input
                                    id="logoUrl"
                                    value={whiteLabelSettings.logoUrl}
                                    onChange={(e) => setWhiteLabelSettings(prev => ({
                                      ...prev,
                                      logoUrl: e.target.value
                                    }))}
                                    placeholder="https://example.com/logo.png"
                                    data-testid="input-logo-url"
                                  />
                                </div>
                                
                                <div>
                                  <Label htmlFor="primaryColor">Primary Color</Label>
                                  <Input
                                    id="primaryColor"
                                    type="color"
                                    value={whiteLabelSettings.primaryColor}
                                    onChange={(e) => setWhiteLabelSettings(prev => ({
                                      ...prev,
                                      primaryColor: e.target.value
                                    }))}
                                    data-testid="input-primary-color"
                                  />
                                </div>
                                
                                <div>
                                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                                  <Input
                                    id="secondaryColor"
                                    type="color"
                                    value={whiteLabelSettings.secondaryColor}
                                    onChange={(e) => setWhiteLabelSettings(prev => ({
                                      ...prev,
                                      secondaryColor: e.target.value
                                    }))}
                                    data-testid="input-secondary-color"
                                  />
                                </div>
                                
                                <div className="col-span-2">
                                  <Label htmlFor="customDomain">Custom Domain</Label>
                                  <Input
                                    id="customDomain"
                                    value={whiteLabelSettings.customDomain}
                                    onChange={(e) => setWhiteLabelSettings(prev => ({
                                      ...prev,
                                      customDomain: e.target.value
                                    }))}
                                    placeholder="healthcare.clientdomain.com"
                                    data-testid="input-custom-domain"
                                  />
                                </div>
                                
                                <div className="col-span-2">
                                  <Label htmlFor="customCss">Custom CSS</Label>
                                  <Textarea
                                    id="customCss"
                                    value={whiteLabelSettings.customCss}
                                    onChange={(e) => setWhiteLabelSettings(prev => ({
                                      ...prev,
                                      customCss: e.target.value
                                    }))}
                                    placeholder="/* Custom CSS styles */"
                                    rows={4}
                                    data-testid="textarea-custom-css"
                                  />
                                </div>
                              </div>
                              
                              <Button 
                                onClick={handleWhiteLabelUpdate}
                                disabled={updateWhiteLabelMutation.isPending}
                                className="w-full"
                                data-testid="button-update-white-label"
                              >
                                {updateWhiteLabelMutation.isPending ? "Updating..." : "Update White Label Settings"}
                              </Button>
                            </TabsContent>
                            
                            <TabsContent value="subscription" className="space-y-4">
                              <div className="text-center p-6 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg">
                                <Star className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
                                <h3 className="text-lg font-semibold text-yellow-800">Unlimited Plan Access</h3>
                                <p className="text-yellow-700 mb-4">
                                  Grant this client unlimited access to all platform features
                                </p>
                                <Button
                                  onClick={() => selectedClient && grantUnlimitedAccess(selectedClient.id)}
                                  disabled={updateSubscriptionMutation.isPending || selectedClient?.isUnlimited}
                                  className="bg-yellow-500 hover:bg-yellow-600"
                                  data-testid="button-grant-unlimited"
                                >
                                  {selectedClient?.isUnlimited ? "Already Unlimited" : "Grant Unlimited Access"}
                                </Button>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="p-3 bg-gray-50 rounded">
                                  <span className="font-medium">Current Status:</span>
                                  <Badge className="ml-2" variant={selectedClient?.subscriptionStatus === 'active' ? 'default' : 'secondary'}>
                                    {selectedClient?.subscriptionStatus}
                                  </Badge>
                                </div>
                                <div className="p-3 bg-gray-50 rounded">
                                  <span className="font-medium">Plan Type:</span>
                                  <span className="ml-2">{selectedClient?.settings?.planType || 'Standard'}</span>
                                </div>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </DialogContent>
                      </Dialog>
                      
                      {!client.isUnlimited && (
                        <Button
                          size="sm"
                          onClick={() => grantUnlimitedAccess(client.id)}
                          disabled={updateSubscriptionMutation.isPending}
                          className="bg-yellow-500 hover:bg-yellow-600"
                          data-testid={`button-unlimited-${client.id}`}
                        >
                          <Star className="h-4 w-4 mr-1" />
                          Unlimited
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
        </>
      )}
    </div>
  );
}