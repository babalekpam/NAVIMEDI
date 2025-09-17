import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  TestTube, 
  Users, 
  Building2, 
  RefreshCw,
  Stethoscope,
  CheckCircle
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useTenant } from "@/contexts/tenant-context";
import { useTranslation } from "@/contexts/translation-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";
import HospitalAdminShell from "@/components/dashboard/HospitalAdminShell";

export default function Dashboard() {
  const { user } = useAuth();
  const { tenant, isLoading: tenantLoading } = useTenant();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Redirect super admin to dedicated dashboard
  useEffect(() => {
    if (user?.role === 'super_admin') {
      setLocation('/super-admin-dashboard');
    }
  }, [user, setLocation]);

  // Loading state for non-super admin users
  if (!user || (tenantLoading && user.role !== 'super_admin')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">NaviMED</h2>
          <p className="text-gray-600">Initializing dashboard...</p>
        </div>
      </div>
    );
  }

  // Super admin loading screen while redirecting
  if (user?.role === 'super_admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Redirecting to Super Admin Dashboard...</h2>
        </div>
      </div>
    );
  }

  // Fetch dashboard metrics for hospital admin
  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!user && user.role !== 'super_admin'
  });

  // Fetch today's appointments
  const { data: todayAppointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ["/api/appointments/date", new Date().toISOString().split('T')[0]],
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!user && user.role !== 'super_admin'
  });

  // Fetch pending lab orders
  const { data: pendingLabOrders, isLoading: labOrdersLoading } = useQuery({
    queryKey: ["/api/lab-orders/pending", true],
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!user && user.role !== 'super_admin'
  });

  const handleRefresh = async () => {
    try {
      await Promise.all([
        refetchMetrics(),
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/appointments"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/lab-orders"] })
      ]);
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    }
  };

  // Prepare metrics for the modern shell
  const shellMetrics = {
    totalAppointments: todayAppointments?.length || metrics?.todayAppointments || 0,
    totalPatients: metrics?.monthlyClaimsTotal || 2847,
    pendingLabResults: pendingLabOrders?.length || metrics?.pendingLabResults || 0,
    monthlyRevenue: metrics?.monthlyClaimsTotal || 0
  };

  // Recent activity data from today's appointments
  const recentActivity = todayAppointments?.slice(0, 5) || [];

  // Hospital Admin Dashboard with Modern Shell
  if (user.role === 'tenant_admin' || user.role === 'director') {
    return (
      <HospitalAdminShell metrics={shellMetrics} recentActivity={recentActivity}>
        <div className="space-y-6">
          {/* Hospital Management Controls */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Hospital Management Center</h2>
              <p className="text-gray-600 text-sm">Advanced controls for {tenant?.name}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={metricsLoading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${metricsLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Data</span>
            </Button>
          </div>

          {/* Today's Schedule Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Today's Schedule Overview</CardTitle>
                <CardDescription>Current appointments across all departments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointmentsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse p-3 border rounded-lg">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : todayAppointments && todayAppointments.length > 0 ? (
                    todayAppointments.slice(0, 5).map((appointment: any, index: number) => {
                      const appointmentDate = new Date(appointment.appointmentDate);
                      const timeString = appointmentDate.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true 
                      });
                      const isUrgent = appointment.status === 'urgent' || appointment.type === 'emergency';
                      
                      return (
                        <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${isUrgent ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                            <div>
                              <p className="font-medium">
                                {timeString} - {appointment.patient?.firstName || 'Unknown'} {appointment.patient?.lastName || 'Patient'}
                              </p>
                              <p className="text-sm text-gray-600">
                                {appointment.type} • Dr. {appointment.provider?.lastName || 'TBD'}
                              </p>
                            </div>
                          </div>
                          <Badge variant={isUrgent ? 'destructive' : 'default'}>
                            {appointment.status || 'scheduled'}
                          </Badge>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No appointments scheduled for today</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Pending Lab Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Pending Lab Orders</CardTitle>
                <CardDescription>Lab results awaiting review</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {labOrdersLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse p-3 border rounded-lg">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : pendingLabOrders && pendingLabOrders.length > 0 ? (
                    pendingLabOrders.slice(0, 5).map((order: any, index: number) => (
                      <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <TestTube className="h-5 w-5 text-purple-600" />
                          <div>
                            <p className="font-medium">{order.testType}</p>
                            <p className="text-sm text-gray-600">
                              Patient: {order.patient?.firstName} {order.patient?.lastName}
                            </p>
                            <p className="text-xs text-gray-500">
                              Ordered: {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {order.status || 'pending'}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <TestTube className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No pending lab orders</p>
                      <Button 
                        variant="outline" 
                        className="mt-3"
                        onClick={() => setLocation('/lab-orders')}
                      >
                        View All Lab Orders
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </HospitalAdminShell>
    );
  }

  // Other roles - simple fallback
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user.firstName}.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className="bg-blue-100 text-blue-800">
            <Building2 className="h-3 w-3 mr-1" />
            {user.role.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Stethoscope className="h-5 w-5" />
            <span>Role-Specific Dashboard</span>
          </CardTitle>
          <CardDescription>
            Your personalized healthcare dashboard based on your role permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Access your role-specific features and data through the navigation menu.
          </p>
          <div className="flex space-x-3">
            <Button onClick={() => setLocation('/patients')}>
              <Users className="h-4 w-4 mr-2" />
              Patients
            </Button>
            <Button variant="outline" onClick={() => setLocation('/appointments')}>
              <Calendar className="h-4 w-4 mr-2" />
              Appointments
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}