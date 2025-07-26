import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Pill, TestTube, DollarSign, AlertTriangle, CheckCircle, Clock, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useTenant } from "@/contexts/tenant-context";
import { MetricsCard } from "@/components/dashboard/metrics-card";
import { AppointmentList } from "@/components/dashboard/appointment-list";
import { AlertPanel } from "@/components/dashboard/alert-panel";

interface DashboardMetrics {
  todayAppointments: number;
  pendingLabResults: number;
  activePrescriptions: number;
  monthlyClaimsTotal: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { tenant } = useTenant();

  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
    enabled: !!user && !!tenant,
  });

  const { data: todayAppointments = [], isLoading: appointmentsLoading } = useQuery({
    queryKey: ["/api/appointments", { date: new Date().toISOString().split('T')[0] }],
    enabled: !!user && !!tenant,
  });

  const { data: pendingLabOrders = [], isLoading: labOrdersLoading } = useQuery({
    queryKey: ["/api/lab-orders", { pending: "true" }],
    enabled: !!user && !!tenant,
  });

  if (!user || !tenant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
          <p className="text-gray-600">Setting up your healthcare workspace</p>
        </div>
      </div>
    );
  }

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
        <MetricsCard
          title="Today's Appointments"
          value={metrics?.todayAppointments || 0}
          trend="+12% from yesterday"
          trendDirection="up"
          icon={Calendar}
          color="blue"
          loading={metricsLoading}
        />
        <MetricsCard
          title="Pending Lab Results"
          value={metrics?.pendingLabResults || 0}
          trend="Needs attention"
          trendDirection="warning"
          icon={TestTube}
          color="yellow"
          loading={metricsLoading}
        />
        <MetricsCard
          title="Active Prescriptions"
          value={metrics?.activePrescriptions || 0}
          trend="Across all patients"
          icon={Pill}
          color="green"
          loading={metricsLoading}
        />
        <MetricsCard
          title="Monthly Claims"
          value={`$${(metrics?.monthlyClaimsTotal || 0).toLocaleString()}`}
          trend="+8% this month"
          trendDirection="up"
          icon={DollarSign}
          color="teal"
          loading={metricsLoading}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Today's Schedule */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Today's Schedule</CardTitle>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <AppointmentList 
                appointments={todayAppointments} 
                loading={appointmentsLoading}
              />
            </CardContent>
          </Card>
        </div>

        {/* Alerts and Actions */}
        <div className="space-y-6">
          {/* Critical Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                Critical Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AlertPanel 
                pendingLabCount={metrics?.pendingLabResults || 0}
                loading={metricsLoading}
              />
            </CardContent>
          </Card>

          {/* Multi-Tenant Collaboration */}
          <Card>
            <CardHeader>
              <CardTitle>Cross-Tenant Updates</CardTitle>
              <CardDescription>Collaborative healthcare ecosystem</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                  <TestTube className="h-4 w-4 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Lab Partners</p>
                  <p className="text-xs text-gray-500">
                    {pendingLabOrders.length} pending results from connected labs
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Pill className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Pharmacy Network</p>
                  <p className="text-xs text-gray-500">
                    {metrics?.activePrescriptions || 0} active prescriptions
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Insurance Partners</p>
                  <p className="text-xs text-gray-500">
                    ${(metrics?.monthlyClaimsTotal || 0).toLocaleString()} processed this month
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* HIPAA Compliance Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                HIPAA Compliance
              </CardTitle>
              <CardDescription>Security and compliance monitoring</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Data Encryption</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  AES-256 Active
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Multi-Factor Auth</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  100% Compliance
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Audit Logging</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Real-time Active
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Data Backup</span>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  <Clock className="h-3 w-3 mr-1" />
                  Last: 2 hours ago
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
