import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Pill, TestTube, DollarSign, AlertTriangle, CheckCircle, Clock, RefreshCw, Building2, Activity, TrendingUp, Database } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useTenant } from "@/contexts/tenant-context";

interface DashboardMetrics {
  todayAppointments: number;
  pendingLabResults: number;
  activePrescriptions: number;
  monthlyClaimsTotal: number;
}

interface PlatformMetrics {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  totalPatients: number;
  monthlyRevenue: number;
  systemUptime: number;
  tenantBreakdown: {
    hospitals: number;
    clinics: number;
    pharmacies: number;
    laboratories: number;
    insurance: number;
  };
}

export default function Dashboard() {
  const { user } = useAuth();
  const { tenant } = useTenant();

  const isSuperAdmin = user?.role === 'super_admin';

  // Platform metrics for super admin
  const { data: platformMetrics, isLoading: platformLoading, refetch: refetchPlatform } = useQuery<PlatformMetrics>({
    queryKey: ["/api/platform/metrics"],
    enabled: !!user && isSuperAdmin,
  });

  // Regular metrics for other users
  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
    enabled: !!user && !!tenant && !isSuperAdmin,
  });

  const { data: todayAppointments = [], isLoading: appointmentsLoading } = useQuery({
    queryKey: ["/api/appointments", { date: new Date().toISOString().split('T')[0] }],
    enabled: !!user && !!tenant && !isSuperAdmin,
  });

  const { data: pendingLabOrders = [], isLoading: labOrdersLoading } = useQuery({
    queryKey: ["/api/lab-orders", { pending: "true" }],
    enabled: !!user && !!tenant && !isSuperAdmin,
  });

  const { data: tenantsList = [], isLoading: tenantsLoading } = useQuery({
    queryKey: ["/api/tenants"],
    enabled: !!user && isSuperAdmin,
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
          <p className="text-gray-600">Setting up your workspace</p>
        </div>
      </div>
    );
  }

  // Mock platform data for super admin
  const mockPlatformMetrics: PlatformMetrics = {
    totalTenants: 47,
    activeTenants: 43,
    totalUsers: 1248,
    totalPatients: 15632,
    monthlyRevenue: 284750,
    systemUptime: 99.9,
    tenantBreakdown: {
      hospitals: 12,
      clinics: 18,
      pharmacies: 8,
      laboratories: 6,
      insurance: 3
    }
  };

  if (isSuperAdmin) {
    return (
      <div className="space-y-6">
        {/* Platform Owner Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Platform Overview</h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {user.firstName}. Platform-wide analytics and tenant management.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <Database className="h-3 w-3 mr-1" />
              System Healthy
            </Badge>
            <span className="text-sm text-gray-500">Last updated: 1 min ago</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetchPlatform()}
              disabled={platformLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${platformLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Platform Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Organizations</p>
                  <p className="text-3xl font-bold text-gray-900">{mockPlatformMetrics.totalTenants}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {mockPlatformMetrics.activeTenants} active
                  </p>
                </div>
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Platform Users</p>
                  <p className="text-3xl font-bold text-gray-900">{mockPlatformMetrics.totalUsers.toLocaleString()}</p>
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12% this month
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Patients</p>
                  <p className="text-3xl font-bold text-gray-900">{mockPlatformMetrics.totalPatients.toLocaleString()}</p>
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8% this month
                  </p>
                </div>
                <Activity className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">${mockPlatformMetrics.monthlyRevenue.toLocaleString()}</p>
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +15% this month
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tenant Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Types</CardTitle>
              <CardDescription>
                Distribution of healthcare organizations on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(mockPlatformMetrics.tenantBreakdown).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="font-medium capitalize">{type.replace('_', ' ')}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">{count}</div>
                      <div className="text-xs text-gray-500">
                        {((count / mockPlatformMetrics.totalTenants) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>
                Platform performance and reliability metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">System Uptime</span>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{mockPlatformMetrics.systemUptime}%</div>
                    <div className="text-xs text-gray-500">Last 30 days</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Active Sessions</span>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">1,847</div>
                    <div className="text-xs text-gray-500">Current</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">API Response Time</span>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">142ms</div>
                    <div className="text-xs text-gray-500">Average</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Data Storage</span>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">2.8TB</div>
                    <div className="text-xs text-gray-500">Total used</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Tenant Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Tenant Activity</CardTitle>
            <CardDescription>
              Latest activities across all healthcare organizations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { tenant: "City General Hospital", activity: "New patient registration", time: "2 minutes ago", type: "patient" },
                { tenant: "Downtown Clinic", activity: "Prescription processed", time: "5 minutes ago", type: "prescription" },
                { tenant: "MediLabs Inc", activity: "Lab results uploaded", time: "8 minutes ago", type: "lab" },
                { tenant: "HealthFirst Pharmacy", activity: "Insurance claim submitted", time: "12 minutes ago", type: "billing" },
                { tenant: "Regional Medical Center", activity: "Appointment scheduled", time: "15 minutes ago", type: "appointment" }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      {item.type === 'patient' && <Users className="h-4 w-4 text-blue-600" />}
                      {item.type === 'prescription' && <Pill className="h-4 w-4 text-green-600" />}
                      {item.type === 'lab' && <TestTube className="h-4 w-4 text-purple-600" />}
                      {item.type === 'billing' && <DollarSign className="h-4 w-4 text-orange-600" />}
                      {item.type === 'appointment' && <Calendar className="h-4 w-4 text-red-600" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.tenant}</p>
                      <p className="text-sm text-gray-600">{item.activity}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Regular tenant dashboard
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clinical Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user.firstName} {user.lastName}. Here's your overview for today.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">Last updated: 2 min ago</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetchMetrics()}
            disabled={metricsLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${metricsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                <p className="text-3xl font-bold text-gray-900">{metrics?.todayAppointments || 0}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Lab Results</p>
                <p className="text-3xl font-bold text-gray-900">{metrics?.pendingLabResults || 0}</p>
              </div>
              <TestTube className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Prescriptions</p>
                <p className="text-3xl font-bold text-gray-900">{metrics?.activePrescriptions || 0}</p>
              </div>
              <Pill className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Claims</p>
                <p className="text-3xl font-bold text-gray-900">${metrics?.monthlyClaimsTotal?.toLocaleString() || 0}</p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Clinical Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>
              Upcoming appointments and tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            {appointmentsLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2 text-sm">Loading appointments...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayAppointments.length > 0 ? (
                  todayAppointments.slice(0, 5).map((appointment: any, index: number) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Patient Consultation</p>
                          <p className="text-sm text-gray-600">10:30 AM - Dr. Smith</p>
                        </div>
                      </div>
                      <Badge variant="outline">Scheduled</Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No appointments scheduled for today</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest patient interactions and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { action: "New patient registered", time: "5 minutes ago", type: "patient" },
                { action: "Lab results received", time: "12 minutes ago", type: "lab" },
                { action: "Prescription updated", time: "25 minutes ago", type: "prescription" },
                { action: "Insurance claim processed", time: "1 hour ago", type: "billing" }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      {item.type === 'patient' && <Users className="h-4 w-4 text-blue-600" />}
                      {item.type === 'lab' && <TestTube className="h-4 w-4 text-purple-600" />}
                      {item.type === 'prescription' && <Pill className="h-4 w-4 text-green-600" />}
                      {item.type === 'billing' && <DollarSign className="h-4 w-4 text-orange-600" />}
                    </div>
                    <p className="font-medium text-gray-900">{item.action}</p>
                  </div>
                  <span className="text-xs text-gray-500">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
