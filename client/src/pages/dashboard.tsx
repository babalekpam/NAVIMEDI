import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Pill, TestTube, DollarSign, AlertTriangle, CheckCircle, Clock, RefreshCw, Building2, Activity, TrendingUp, Database, Stethoscope, Heart, UserCheck, Package, Shield, ShieldCheck, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/contexts/tenant-context-fixed";
import { useTranslation } from "@/contexts/translation-context";
import { useLocation } from "wouter";
import { usePermissions } from "@/hooks/usePermissions";
import PharmacyDashboardEnhancedV2 from "@/pages/pharmacy-dashboard-enhanced-v2";
import HospitalUserRoleManagement from "@/components/hospital/HospitalUserRoleManagement";
import AdminPermissionsManager from "@/components/admin/AdminPermissionsManager";

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
  totalSubscriptionRevenue: number;
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
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { hasPermission, canAccessModule, getModulePermissions } = usePermissions();

  const isSuperAdmin = user?.role === 'super_admin';

  // Clear stale cache on component mount
  React.useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
    queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
  }, [queryClient]);
  
  console.log('Dashboard Debug:', {
    isSuperAdmin,
    isPhysician: user?.role === 'physician',
    isPharmacist: user?.role === 'pharmacist',
    queryEnabled: !!user && !!tenant && user?.role === 'physician' && !!user?.id
  });

  // All hooks must be called before any conditional returns
  // Platform metrics for super admin
  const { data: platformMetrics, isLoading: platformLoading, refetch: refetchPlatform } = useQuery<PlatformMetrics>({
    queryKey: ["/api/platform/metrics"],
    enabled: !!user && isSuperAdmin,
    staleTime: 2 * 60 * 1000, // 2 minutes for super admin metrics
  });

  // Regular metrics for other users - optimized with better caching
  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
    enabled: !!user && !!tenant && !isSuperAdmin,
    staleTime: 0, // Force fresh data every time
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
  });

  // Only fetch appointments if we actually need them (not for all users)
  const shouldFetchAppointments = !!user && !!tenant && !isSuperAdmin && 
    (user?.role === 'physician' || user?.role === 'nurse' || user?.role === 'tenant_admin' || user?.role === 'director');

  const { data: todayAppointments = [], isLoading: appointmentsLoading } = useQuery({
    queryKey: ["/api/appointments", "date", new Date().toISOString().split('T')[0]],
    enabled: shouldFetchAppointments,
    staleTime: 2 * 60 * 1000, // 2 minutes for appointment data
  });

  // Get doctor's specific appointments if user is a physician - more targeted
  const { data: doctorAppointments = [], isLoading: doctorAppointmentsLoading } = useQuery({
    queryKey: ["/api/appointments/provider", user?.id],
    enabled: !!user && !!tenant && user?.role === 'physician' && !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes for doctor appointments
  });

  // Only fetch lab orders for roles that need them
  const shouldFetchLabOrders = !!user && !!tenant && !isSuperAdmin && 
    (user?.role === 'physician' || user?.role === 'lab_technician' || user?.role === 'tenant_admin' || user?.role === 'director');

  const { data: pendingLabOrders = [], isLoading: labOrdersLoading } = useQuery({
    queryKey: ["/api/lab-orders", "pending", "true"],
    enabled: shouldFetchLabOrders,
    staleTime: 2 * 60 * 1000, // 2 minutes for lab order data
  });

  const { data: tenantsList = [], isLoading: tenantsLoading } = useQuery({
    queryKey: ["/api/tenants"],
    enabled: !!user && isSuperAdmin,
    staleTime: 5 * 60 * 1000, // 5 minutes for tenant list
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">{t('loading')}</h2>
          <p className="text-gray-600">Setting up your workspace</p>
        </div>
      </div>
    );
  }

  // Redirect super admin to their dedicated dashboard
  if (isSuperAdmin) {
    setLocation('/super-admin-dashboard');
    return (
      <div className="p-6">
        <div className="text-center">Redirecting to Super Admin Dashboard...</div>
      </div>
    );
  }

  // Fallback data for tenant breakdown (until we have real data)
  const fallbackTenantBreakdown = {
    hospitals: 12,
    clinics: 18,
    pharmacies: 8,
    laboratories: 6,
    insurance: 3
  };

  if (isSuperAdmin) {
    return (
      <div className="space-y-6">
        {/* Platform Owner Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('platform-overview')}</h1>
            <p className="text-gray-600 mt-1">
              {t('welcome-back')}, {user.firstName}. Platform-wide analytics and tenant management.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <Database className="h-3 w-3 mr-1" />
              {t('system-health')}
            </Badge>
            <span className="text-sm text-gray-500">{t('last-updated')}: 1 {t('min-ago')}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetchPlatform()}
              disabled={platformLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${platformLoading ? 'animate-spin' : ''}`} />
              {t('refresh')}
            </Button>
          </div>
        </div>

        {/* Platform Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('total-tenants')}</p>
                  <p className="text-3xl font-bold text-gray-900">{platformMetrics?.totalTenants || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {platformMetrics?.activeTenants || 0} {t('active')}
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
                  <p className="text-3xl font-bold text-gray-900">{platformMetrics?.totalUsers?.toLocaleString() || 0}</p>
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {t('all-tenants')}
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
                  <p className="text-sm font-medium text-gray-600">{t('total-patients')}</p>
                  <p className="text-3xl font-bold text-gray-900">{platformMetrics?.totalPatients?.toLocaleString() || 0}</p>
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {t('cross-platform-data')}
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
                  <p className="text-sm font-medium text-gray-600">{t('monthly-revenue')}</p>
                  <p className="text-3xl font-bold text-gray-900">${platformMetrics?.monthlyRevenue?.toLocaleString() || 0}</p>
                  <p className="text-xs text-blue-600 mt-1 flex items-center">
                    <DollarSign className="h-3 w-3 mr-1" />
                    {t('subscription-income')}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('total-subscriptions')}</p>
                  <p className="text-3xl font-bold text-gray-900">${platformMetrics?.totalSubscriptionRevenue?.toLocaleString() || 0}</p>
                  <p className="text-xs text-purple-600 mt-1 flex items-center">
                    <DollarSign className="h-3 w-3 mr-1" />
                    {t('all-active-plans')}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tenant Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('organization-types')}</CardTitle>
              <CardDescription>
                {t('distribution-healthcare-orgs')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(fallbackTenantBreakdown).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="font-medium capitalize">{t(type) || type.replace('_', ' ')}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">{count}</div>
                      <div className="text-xs text-gray-500">
                        {((count / (platformMetrics?.totalTenants || 47)) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('system-health')}</CardTitle>
              <CardDescription>
                {t('platform-performance-metrics')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">{t('system-uptime')}</span>
                  <div className="text-right">
                    <div className="font-bold text-green-600">99.9%</div>
                    <div className="text-xs text-gray-500">{t('last-30-days')}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">{t('active-sessions')}</span>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">1,847</div>
                    <div className="text-xs text-gray-500">{t('current')}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">{t('api-response-time')}</span>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">142ms</div>
                    <div className="text-xs text-gray-500">{t('average')}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">{t('data-storage')}</span>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">2.8TB</div>
                    <div className="text-xs text-gray-500">{t('total-used')}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Tenant Activity */}
        <Card>
          <CardHeader>
            <CardTitle>{t('recent-tenant-activity')}</CardTitle>
            <CardDescription>
              {t('latest-activities')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { tenant: "City General Hospital", activity: t('new-patient-registration'), time: t('2-minutes-ago'), type: "patient" },
                { tenant: "Downtown Clinic", activity: t('prescription-processed'), time: t('5-minutes-ago'), type: "prescription" },
                { tenant: "MediLabs Inc", activity: t('lab-results-uploaded'), time: t('8-minutes-ago'), type: "lab" },
                { tenant: "HealthFirst Pharmacy", activity: t('insurance-claim-submitted'), time: t('12-minutes-ago'), type: "billing" },
                { tenant: "Regional Medical Center", activity: t('appointment-scheduled'), time: t('15-minutes-ago'), type: "appointment" }
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

  // Role-Based Permission Dashboard (replaces old static content)
  const renderTenantAdminDashboard = () => {
    const handleRefresh = async () => {
      try {
        await Promise.all([
          refetchMetrics(),
          queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] }),
          queryClient.invalidateQueries({ queryKey: ["/api/appointments"] }),
          queryClient.invalidateQueries({ queryKey: ["/api/lab-orders"] }),
          queryClient.invalidateQueries({ queryKey: ["/api/patients"] }),
          queryClient.invalidateQueries({ queryKey: ["/api/vital-signs"] })
        ]);
      } catch (error) {
        console.error('Error refreshing dashboard:', error);
      }
    };

    return (
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Role-Based Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user.firstName}. Sections shown based on your role permissions for {tenant?.name}.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <Shield className="h-3 w-3 mr-1" />
            {user.role?.toUpperCase().replace('_', ' ')}
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={metricsLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${metricsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
      




      {/* Hospital Overview Cards */}
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
                  <Button 
                    variant="outline" 
                    className="mt-3"
                    onClick={() => setLocation('/appointments')}
                  >
                    Schedule New Appointment
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Lab Orders</CardTitle>
            <CardDescription>Recent laboratory test requests requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingLabOrders && pendingLabOrders.length > 0 ? (
                pendingLabOrders.slice(0, 5).map((order: any, index: number) => (
                  <div key={order.id || index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
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
  );

  // Role-specific dashboards for healthcare professionals
  const renderRoleSpecificDashboard = () => {
    switch (user.role) {
      case 'physician':
        return renderPhysicianDashboard();
      case 'nurse':
        return renderNurseDashboard();
      case 'pharmacist':
        return renderPharmacistDashboard();
      case 'lab_technician':
        return renderLabTechnicianDashboard();
      case 'receptionist':
        return renderReceptionistDashboard();
      case 'billing_staff':
        return renderBillingStaffDashboard();
      case 'insurance_manager':
        return renderInsuranceManagerDashboard();
      case 'patient':
        return renderPatientDashboard();
      case 'tenant_admin':
      case 'director':
        return renderTenantAdminDashboard();
      default:
        return renderDefaultDashboard();
    }
  };

  // Physician Dashboard
  const renderPhysicianDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Physician Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, Dr. {user.lastName}. Your clinical overview for today.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className="bg-blue-100 text-blue-800">
            <Stethoscope className="h-3 w-3 mr-1" />
            On Duty
          </Badge>
        </div>
      </div>

      {/* Physician Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                <p className="text-3xl font-bold text-gray-900">12</p>
                <p className="text-xs text-blue-600 mt-1">3 urgent cases</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Patients</p>
                <p className="text-3xl font-bold text-gray-900">247</p>
                <p className="text-xs text-green-600 mt-1">8 new this week</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                <p className="text-3xl font-bold text-gray-900">8</p>
                <p className="text-xs text-orange-600 mt-1">Lab results & reports</p>
              </div>
              <FileText className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Prescriptions</p>
                <p className="text-3xl font-bold text-gray-900">23</p>
                <p className="text-xs text-purple-600 mt-1">Written today</p>
              </div>
              <Pill className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              className="h-24 flex flex-col items-center justify-center space-y-2"
              onClick={() => setLocation('/appointments')}
            >
              <Calendar className="h-6 w-6" />
              <span>View Schedule</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center space-y-2"
              onClick={() => setLocation('/patients')}
            >
              <Users className="h-6 w-6" />
              <span>Patient List</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center space-y-2"
              onClick={() => setLocation('/prescriptions')}
            >
              <Pill className="h-6 w-6" />
              <span>Prescriptions</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center space-y-2"
              onClick={() => setLocation('/lab-orders')}
            >
              <TestTube className="h-6 w-6" />
              <span>Lab Orders</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Today's Schedule & Urgent Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {doctorAppointmentsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse p-3 border rounded-lg">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : doctorAppointments.length > 0 ? (
                doctorAppointments.map((appointment: any, index: number) => {
                  const appointmentDate = new Date(appointment.appointmentDate);
                  const timeString = appointmentDate.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                  });
                  const dateString = appointmentDate.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  });
                  const isToday = appointmentDate.toDateString() === new Date().toDateString();
                  const isUrgent = appointment.status === 'urgent' || appointment.type === 'emergency';
                  
                  return (
                    <div key={appointment.id} className={`flex items-center justify-between p-3 border rounded-lg ${isToday ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}`}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${isUrgent ? 'bg-red-500' : isToday ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                        <div>
                          <p className="font-medium">
                            {timeString} {!isToday && `(${dateString})`} - {appointment.patient?.firstName || 'Unknown'} {appointment.patient?.lastName || 'Patient'}
                          </p>
                          <p className="text-sm text-gray-600">{appointment.type} • {appointment.chiefComplaint || 'No complaint noted'}</p>
                          {isToday && <p className="text-xs text-blue-600 font-medium">TODAY'S APPOINTMENT</p>}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isUrgent && (
                          <Badge variant="destructive" className="text-xs">Urgent</Badge>
                        )}
                        {isToday && (
                          <Badge variant="default" className="text-xs bg-blue-600">Today</Badge>
                        )}
                        <Badge variant="outline" className="text-xs">{appointment.status}</Badge>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No appointments scheduled</p>
                  <p className="text-sm">Your schedule is clear</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3"
                    onClick={() => setLocation('/appointments')}
                  >
                    View All Appointments
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Lab Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { patient: "John Smith", test: "Blood Panel", ordered: "2 days ago", urgent: true },
                { patient: "Sarah Johnson", test: "X-Ray Chest", ordered: "1 day ago", urgent: false },
                { patient: "Mike Wilson", test: "Cardiac Stress Test", ordered: "3 hours ago", urgent: true },
                { patient: "Emma Davis", test: "Urine Analysis", ordered: "1 day ago", urgent: false }
              ].map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{result.patient}</p>
                    <p className="text-sm text-gray-600">{result.test} • {result.ordered}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {result.urgent && (
                      <Badge variant="destructive" className="text-xs">Urgent</Badge>
                    )}
                    <Button size="sm" variant="outline">Review</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Nurse Dashboard
  const renderNurseDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nurse Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user.firstName}. Your patient care overview for today.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className="bg-green-100 text-green-800">
            <Heart className="h-3 w-3 mr-1" />
            Active Shift
          </Badge>
        </div>
      </div>

      {/* Nurse Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Assigned Patients</p>
                <p className="text-3xl font-bold text-gray-900">18</p>
                <p className="text-xs text-blue-600 mt-1">Ward 3A & 3B</p>
              </div>
              <UserCheck className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Medications Due</p>
                <p className="text-3xl font-bold text-gray-900">7</p>
                <p className="text-xs text-orange-600 mt-1">Next 2 hours</p>
              </div>
              <Pill className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vital Checks</p>
                <p className="text-3xl font-bold text-gray-900">12</p>
                <p className="text-xs text-green-600 mt-1">Completed today</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alerts</p>
                <p className="text-3xl font-bold text-gray-900">3</p>
                <p className="text-xs text-red-600 mt-1">Immediate attention</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient Rounds & Medication Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Patient Rounds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { room: "301A", patient: "Mary Johnson", status: "stable", lastRound: "2 hours ago", nextDue: "In 1 hour" },
                { room: "302B", patient: "Robert Davis", status: "monitoring", lastRound: "30 min ago", nextDue: "In 1.5 hours" },
                { room: "303A", patient: "Linda Wilson", status: "recovery", lastRound: "1 hour ago", nextDue: "In 1 hour" },
                { room: "304B", patient: "James Brown", status: "critical", lastRound: "15 min ago", nextDue: "In 45 min" }
              ].map((patient, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="font-bold text-blue-600">{patient.room}</span>
                    </div>
                    <div>
                      <p className="font-medium">{patient.patient}</p>
                      <p className="text-sm text-gray-600">Last: {patient.lastRound} • Next: {patient.nextDue}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={patient.status === 'critical' ? 'destructive' : patient.status === 'monitoring' ? 'secondary' : 'default'}
                    className={patient.status === 'stable' ? 'bg-green-100 text-green-800' : ''}
                  >
                    {patient.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Medication Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { time: "14:00", patient: "Mary Johnson", medication: "Metformin 500mg", room: "301A", urgent: false },
                { time: "14:30", patient: "Robert Davis", medication: "Lisinopril 10mg", room: "302B", urgent: true },
                { time: "15:00", patient: "Linda Wilson", medication: "Aspirin 81mg", room: "303A", urgent: false },
                { time: "15:30", patient: "James Brown", medication: "Morphine 5mg", room: "304B", urgent: true }
              ].map((med, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{med.time} - {med.patient} ({med.room})</p>
                    <p className="text-sm text-gray-600">{med.medication}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {med.urgent && (
                      <Badge variant="destructive" className="text-xs">Urgent</Badge>
                    )}
                    <Button size="sm" variant="outline">Administer</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Pharmacist Dashboard - Force load enhanced dashboard
  const renderPharmacistDashboard = () => {
    console.log('[DASHBOARD] 🚨 FORCE LOADING ENHANCED PHARMACY DASHBOARD');
    console.log('[DASHBOARD] ✅ Tenant type:', tenant?.type);
    console.log('[DASHBOARD] ✅ User role:', user?.role);
    console.log('[DASHBOARD] ✅ Tenant ID:', tenant?.id);
    console.log('[DASHBOARD] ✅ User ID:', user?.id);
    
    // Force render the enhanced pharmacy dashboard
    return (
      <div>
        <div style={{background: 'red', color: 'white', padding: '10px', marginBottom: '20px'}}>
          🚨 ENHANCED PHARMACY DASHBOARD LOADING 🚨
        </div>
        <PharmacyDashboardEnhancedV2 />
      </div>
    );
    
    return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pharmacist Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user.firstName}. Your pharmacy operations overview for today.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className="bg-purple-100 text-purple-800">
            <Pill className="h-3 w-3 mr-1" />
            Pharmacy Open
          </Badge>
        </div>
      </div>

      {/* Pharmacist Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Prescriptions</p>
                <p className="text-3xl font-bold text-gray-900">15</p>
                <p className="text-xs text-orange-600 mt-1">2 urgent</p>
              </div>
              <FileText className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Filled Today</p>
                <p className="text-3xl font-bold text-gray-900">47</p>
                <p className="text-xs text-green-600 mt-1">Above average</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-3xl font-bold text-gray-900">8</p>
                <p className="text-xs text-red-600 mt-1">Need reorder</p>
              </div>
              <Package className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Insurance Reviews</p>
                <p className="text-3xl font-bold text-gray-900">6</p>
                <p className="text-xs text-blue-600 mt-1">Pending approval</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prescription Queue & Inventory Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Prescription Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { id: "RX001", patient: "John Smith", medication: "Metformin 500mg", physician: "Dr. Johnson", urgent: true, time: "30 min ago" },
                { id: "RX002", patient: "Sarah Wilson", medication: "Lisinopril 10mg", physician: "Dr. Davis", urgent: false, time: "1 hour ago" },
                { id: "RX003", patient: "Mike Brown", medication: "Insulin 100 units", physician: "Dr. Miller", urgent: true, time: "45 min ago" },
                { id: "RX004", patient: "Emma Jones", medication: "Aspirin 81mg", physician: "Dr. Johnson", urgent: false, time: "2 hours ago" }
              ].map((rx, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{rx.id} - {rx.patient}</p>
                      {rx.urgent && <Badge variant="destructive" className="text-xs">Urgent</Badge>}
                    </div>
                    <p className="text-sm text-gray-600">{rx.medication}</p>
                    <p className="text-xs text-gray-500">{rx.physician} • {rx.time}</p>
                  </div>
                  <Button size="sm">Fill</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { medication: "Metformin 500mg", current: "12", minimum: "50", status: "critical" },
                { medication: "Lisinopril 10mg", current: "25", minimum: "30", status: "low" },
                { medication: "Insulin 100 units", current: "8", minimum: "20", status: "critical" },
                { medication: "Aspirin 81mg", current: "35", minimum: "40", status: "low" }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{item.medication}</p>
                    <p className="text-sm text-gray-600">Current: {item.current} • Minimum: {item.minimum}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={item.status === 'critical' ? 'destructive' : 'secondary'}
                      className={item.status === 'low' ? 'bg-yellow-100 text-yellow-800' : ''}
                    >
                      {item.status}
                    </Badge>
                    <Button size="sm" variant="outline">Reorder</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Lab Technician Dashboard
  const renderLabTechnicianDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lab Technician Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user.firstName}. Your laboratory operations overview for today.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className="bg-purple-100 text-purple-800">
            <TestTube className="h-3 w-3 mr-1" />
            Lab Active
          </Badge>
        </div>
      </div>

      {/* Lab Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Tests</p>
                <p className="text-3xl font-bold text-gray-900">23</p>
                <p className="text-xs text-orange-600 mt-1">5 urgent</p>
              </div>
              <TestTube className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Today</p>
                <p className="text-3xl font-bold text-gray-900">67</p>
                <p className="text-xs text-green-600 mt-1">Above target</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Quality Control</p>
                <p className="text-3xl font-bold text-gray-900">98.5%</p>
                <p className="text-xs text-blue-600 mt-1">Pass rate</p>
              </div>
              <ShieldCheck className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Equipment Alerts</p>
                <p className="text-3xl font-bold text-gray-900">2</p>
                <p className="text-xs text-red-600 mt-1">Needs attention</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Queue & Equipment Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { id: "LAB001", patient: "John Smith", test: "Complete Blood Count", physician: "Dr. Johnson", urgent: true, collected: "30 min ago" },
                { id: "LAB002", patient: "Sarah Wilson", test: "Lipid Panel", physician: "Dr. Davis", urgent: false, collected: "1 hour ago" },
                { id: "LAB003", patient: "Mike Brown", test: "Glucose Test", physician: "Dr. Miller", urgent: true, collected: "45 min ago" },
                { id: "LAB004", patient: "Emma Jones", test: "Thyroid Function", physician: "Dr. Johnson", urgent: false, collected: "2 hours ago" }
              ].map((test, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{test.id} - {test.patient}</p>
                      {test.urgent && <Badge variant="destructive" className="text-xs">Urgent</Badge>}
                    </div>
                    <p className="text-sm text-gray-600">{test.test}</p>
                    <p className="text-xs text-gray-500">{test.physician} • Collected {test.collected}</p>
                  </div>
                  <Button size="sm">Process</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Equipment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { equipment: "Hematology Analyzer", status: "operational", lastMaintenance: "2 days ago", nextDue: "In 5 days" },
                { equipment: "Chemistry Analyzer", status: "maintenance", lastMaintenance: "Today", nextDue: "In 7 days" },
                { equipment: "Microscope Station 1", status: "operational", lastMaintenance: "1 week ago", nextDue: "In 2 weeks" },
                { equipment: "Centrifuge Unit", status: "alert", lastMaintenance: "3 weeks ago", nextDue: "Overdue" }
              ].map((equip, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{equip.equipment}</p>
                    <p className="text-sm text-gray-600">Last: {equip.lastMaintenance} • Next: {equip.nextDue}</p>
                  </div>
                  <Badge 
                    variant={equip.status === 'alert' ? 'destructive' : equip.status === 'maintenance' ? 'secondary' : 'default'}
                    className={equip.status === 'operational' ? 'bg-green-100 text-green-800' : ''}
                  >
                    {equip.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Simplified dashboards for other roles
  const renderReceptionistDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reception Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user.firstName}. Patient registration and appointment management.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Check-ins</p>
                <p className="text-3xl font-bold text-gray-900">34</p>
              </div>
              <UserCheck className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Appointments Scheduled</p>
                <p className="text-3xl font-bold text-gray-900">67</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Patients</p>
                <p className="text-3xl font-bold text-gray-900">8</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Waiting Room</p>
                <p className="text-3xl font-bold text-gray-900">5</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderBillingStaffDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user.firstName}. Financial operations and insurance claims.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Claims</p>
                <p className="text-3xl font-bold text-gray-900">23</p>
              </div>
              <FileText className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                <p className="text-3xl font-bold text-gray-900">$8,450</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Outstanding Balance</p>
                <p className="text-3xl font-bold text-gray-900">$12,340</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Processed Claims</p>
                <p className="text-3xl font-bold text-gray-900">156</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderInsuranceManagerDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Insurance Management Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user.firstName}. Claims processing and coverage management.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Claims Under Review</p>
                <p className="text-3xl font-bold text-gray-900">45</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved Today</p>
                <p className="text-3xl font-bold text-gray-900">78</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Denied Claims</p>
                <p className="text-3xl font-bold text-gray-900">12</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Coverage Verification</p>
                <p className="text-3xl font-bold text-gray-900">23</p>
              </div>
              <ShieldCheck className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderPatientDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patient Portal</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user.firstName}. Your health information and appointments.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming Appointments</p>
                <p className="text-3xl font-bold text-gray-900">2</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Prescriptions</p>
                <p className="text-3xl font-bold text-gray-900">4</p>
              </div>
              <Pill className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Lab Results</p>
                <p className="text-3xl font-bold text-gray-900">1</p>
              </div>
              <TestTube className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Outstanding Balance</p>
                <p className="text-3xl font-bold text-gray-900">$245</p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderTenantAdminDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hospital Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user.firstName}. Complete hospital management and oversight for {tenant?.name}.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <Building2 className="h-3 w-3 mr-1" />
            {tenant?.type === 'hospital' ? 'Hospital Admin' : 'Organization Admin'}
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={metricsLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${metricsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
      




      {/* Hospital Overview Cards */}
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
                  <Button 
                    variant="outline" 
                    className="mt-3"
                    onClick={() => window.location.href = '/appointments?action=book'}
                  >
                    Schedule New Appointment
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Laboratory Status</CardTitle>
            <CardDescription>Pending lab orders and results</CardDescription>
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
                    <div>
                      <p className="font-medium">{order.testType}</p>
                      <p className="text-sm text-gray-600">
                        Patient: {order.patient?.firstName} {order.patient?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        Ordered: {new Date(order.createdAt).toLocaleDateString()}
                      </p>
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

      {/* Admin Controls Section - Permission-Based Access */}
      {hasPermission('dashboard', 'view_admin') && (
        <>
          {/* Admin Permissions Management - Only if user can modify roles */}
          {hasPermission('roles', 'modify') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-red-600" />
                  Admin Permissions Control
                </CardTitle>
                <CardDescription>
                  Define exactly what each admin can see and do in the application. Control access to modules, features, and operations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminPermissionsManager />
              </CardContent>
            </Card>
          )}

          {/* Staff Role Management - Only if user can assign roles */}
          {hasPermission('roles', 'assign') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCheck className="h-5 w-5 mr-2 text-blue-600" />
                  Staff Role Management
                </CardTitle>
                <CardDescription>
                  Assign and manage roles for hospital staff based on your administrative privileges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HospitalUserRoleManagement />
              </CardContent>
            </Card>
          )}

          {/* Users Management - Only if user has user permissions */}
          {canAccessModule('users') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-green-600" />
                  User Management
                </CardTitle>
                <CardDescription>
                  Manage hospital staff, view user information, and control access.
                  Permissions: {getModulePermissions('users').join(', ')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {hasPermission('users', 'view') && (
                    <Button variant="outline" onClick={() => setLocation('/users')}>
                      <Users className="h-4 w-4 mr-2" />
                      View Users
                    </Button>
                  )}
                  {hasPermission('users', 'create') && (
                    <Button variant="outline" onClick={() => setLocation('/users/create')}>
                      <Users className="h-4 w-4 mr-2" />
                      Add New User
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Patients Management - Based on patient permissions */}
          {canAccessModule('patients') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-600" />
                  Patient Management
                </CardTitle>
                <CardDescription>
                  Access patient records and information.
                  Permissions: {getModulePermissions('patients').join(', ')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {hasPermission('patients', 'view') && (
                    <Button variant="outline" onClick={() => setLocation('/patients')}>
                      <Users className="h-4 w-4 mr-2" />
                      View Patients
                    </Button>
                  )}
                  {hasPermission('patients', 'search') && (
                    <Button variant="outline" onClick={() => setLocation('/patients/search')}>
                      <Users className="h-4 w-4 mr-2" />
                      Search Patients
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Appointments Management */}
          {canAccessModule('appointments') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                  Appointments Management
                </CardTitle>
                <CardDescription>
                  Manage patient appointments and scheduling.
                  Permissions: {getModulePermissions('appointments').join(', ')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {hasPermission('appointments', 'view') && (
                    <Button variant="outline" onClick={() => setLocation('/appointments')}>
                      <Calendar className="h-4 w-4 mr-2" />
                      View Appointments
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Billing Management */}
          {canAccessModule('billing') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                  Billing Management
                </CardTitle>
                <CardDescription>
                  Manage billing, claims, and financial operations.
                  Permissions: {getModulePermissions('billing').join(', ')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {hasPermission('billing', 'view') && (
                    <Button variant="outline" onClick={() => setLocation('/billing')}>
                      <DollarSign className="h-4 w-4 mr-2" />
                      View Billing
                    </Button>
                  )}
                  {hasPermission('billing', 'manage') && (
                    <Button variant="outline" onClick={() => setLocation('/billing/manage')}>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Manage Claims
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Service Price Management */}
          {canAccessModule('service_price') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-orange-600" />
                  Service Price Management
                </CardTitle>
                <CardDescription>
                  Manage service pricing and rates.
                  Permissions: {getModulePermissions('service_price').join(', ')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {hasPermission('service_price', 'view') && (
                    <Button variant="outline" onClick={() => setLocation('/service-prices')}>
                      <DollarSign className="h-4 w-4 mr-2" />
                      View Prices
                    </Button>
                  )}
                  {hasPermission('service_price', 'manage') && (
                    <Button variant="outline" onClick={() => setLocation('/service-prices/manage')}>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Manage Prices
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reports Management */}
          {canAccessModule('reports') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-indigo-600" />
                  Reports & Analytics
                </CardTitle>
                <CardDescription>
                  Generate and view system reports.
                  Permissions: {getModulePermissions('reports').join(', ')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {hasPermission('reports', 'view') && (
                    <Button variant="outline" onClick={() => setLocation('/reports')}>
                      <FileText className="h-4 w-4 mr-2" />
                      View Reports
                    </Button>
                  )}
                  {hasPermission('reports', 'generate') && (
                    <Button variant="outline" onClick={() => setLocation('/reports/generate')}>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Reports
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Audit Logs */}
          {canAccessModule('audit_logs') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2 text-gray-600" />
                  Audit Logs
                </CardTitle>
                <CardDescription>
                  View system activity and security logs.
                  Permissions: {getModulePermissions('audit_logs').join(', ')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {hasPermission('audit_logs', 'view') && (
                    <Button variant="outline" onClick={() => setLocation('/audit-logs')}>
                      <Database className="h-4 w-4 mr-2" />
                      View Audit Logs
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tenant Settings */}
          {canAccessModule('tenant_settings') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-teal-600" />
                  System Settings
                </CardTitle>
                <CardDescription>
                  Configure hospital settings and preferences.
                  Permissions: {getModulePermissions('tenant_settings').join(', ')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {hasPermission('tenant_settings', 'view') && (
                    <Button variant="outline" onClick={() => setLocation('/settings')}>
                      <Building2 className="h-4 w-4 mr-2" />
                      View Settings
                    </Button>
                  )}
                  {hasPermission('tenant_settings', 'update') && (
                    <Button variant="outline" onClick={() => setLocation('/settings/configure')}>
                      <Building2 className="h-4 w-4 mr-2" />
                      Configure Settings
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
  };

  // Default dashboard for roles not specifically handled
  const renderDefaultDashboard = () => (
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
            onClick={handleRefresh}
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
                {(todayAppointments as any[]).length > 0 ? (
                  (todayAppointments as any[]).slice(0, 5).map((appointment: any, index: number) => (
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
  };

  // Lab Technician Dashboard
  const renderLabTechnicianDashboard = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Lab Technician Dashboard</h1>
      <p className="text-gray-600">Welcome back, {user.firstName}. Your laboratory operations overview for today.</p>
    </div>
  );

  // Simplified dashboards for other roles
  const renderReceptionistDashboard = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Reception Dashboard</h1>
      <p className="text-gray-600">Welcome back, {user.firstName}. Patient registration and appointment management.</p>
    </div>
  );

  const renderBillingStaffDashboard = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Billing Dashboard</h1>
      <p className="text-gray-600">Welcome back, {user.firstName}. Financial operations and insurance claims.</p>
    </div>
  );

  const renderInsuranceManagerDashboard = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Insurance Management Dashboard</h1>
      <p className="text-gray-600">Welcome back, {user.firstName}. Claims processing and coverage management.</p>
    </div>
  );

  const renderPatientDashboard = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Patient Portal</h1>
      <p className="text-gray-600">Welcome back, {user.firstName}. Your health information and appointments.</p>
    </div>
  );

  const renderDefaultDashboard = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      <p className="text-gray-600">Welcome back, {user.firstName}.</p>
    </div>
  );

  // Return the appropriate dashboard based on user role
  if (user.role === 'super_admin') {
    return renderSuperAdminDashboard();
  }
  
  if (user.role === 'pharmacist') {
    return <PharmacyDashboardEnhancedV2 />;
  }
  
  if (user.role === 'physician') {
    return renderPhysicianDashboard();
  }
  
  if (user.role === 'nurse') {
    return renderNurseDashboard();
  }
  
  if (user.role === 'lab_technician') {
    return renderLabTechnicianDashboard();
  }
  
  if (user.role === 'receptionist') {
    return renderReceptionistDashboard();
  }
  
  if (user.role === 'billing_staff') {
    return renderBillingStaffDashboard();
  }
  
  if (user.role === 'insurance_manager') {
    return renderInsuranceManagerDashboard();
  }
  
  if (user.role === 'patient') {
    return renderPatientDashboard();
  }
  
  // For tenant_admin and director roles, show the admin dashboard
  if (user.role === 'tenant_admin' || user.role === 'director') {
    return renderTenantAdminDashboard();
  }
  
  // Default dashboard for other roles
  return renderDefaultDashboard();
}
