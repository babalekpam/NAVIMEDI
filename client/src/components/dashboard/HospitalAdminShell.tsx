import React from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard,
  Users,
  Calendar,
  TestTube,
  DollarSign,
  FileText,
  Settings,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Building2,
  Stethoscope,
  Activity
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useTenant } from "@/contexts/tenant-context";
import imagePath from "@assets/image_1758133997384.png";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  permission?: string;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    type: 'increase' | 'decrease' | 'neutral';
  };
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface HospitalAdminShellProps {
  children: React.ReactNode;
  metrics?: {
    totalAppointments?: number;
    totalPatients?: number;
    pendingLabResults?: number;
    monthlyRevenue?: number;
  };
  recentActivity?: any[];
}

const navigationItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'patients', label: 'Patients', icon: Users, href: '/patients' },
  { id: 'appointments', label: 'Appointments', icon: Calendar, href: '/appointments' },
  { id: 'lab-orders', label: 'Laboratory', icon: TestTube, href: '/lab-orders' },
  { id: 'billing', label: 'Billing & Claims', icon: DollarSign, href: '/billing' },
  { id: 'reports', label: 'Reports', icon: FileText, href: '/reports' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
  { id: 'support', label: 'Support', icon: HelpCircle, href: '/support' },
];

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, subtitle, icon: Icon, color }) => (
  <Card className="relative overflow-hidden">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
          <div className="flex items-center space-x-2">
            {change && (
              <Badge 
                variant="outline" 
                className={`text-xs flex items-center space-x-1 ${
                  change.type === 'increase' 
                    ? 'text-green-700 bg-green-50 border-green-200' 
                    : change.type === 'decrease'
                    ? 'text-red-700 bg-red-50 border-red-200'
                    : 'text-gray-700 bg-gray-50 border-gray-200'
                }`}
              >
                {change.type === 'increase' && <TrendingUp className="h-3 w-3" />}
                {change.type === 'decrease' && <TrendingDown className="h-3 w-3" />}
                <span>{change.value}</span>
              </Badge>
            )}
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export const HospitalAdminShell: React.FC<HospitalAdminShellProps> = ({ 
  children, 
  metrics = {},
  recentActivity = []
}) => {
  const [location] = useLocation();
  const { user } = useAuth();
  const { tenant } = useTenant();

  const isActive = (href: string) => {
    if (href === '/dashboard') return location === '/dashboard' || location === '/';
    return location.startsWith(href);
  };

  const defaultMetrics = [
    {
      title: "Total Appointments",
      value: metrics.totalAppointments || 124,
      change: { value: "+8%", type: 'increase' as const },
      subtitle: "Since Last Week",
      icon: Calendar,
      color: "bg-blue-500"
    },
    {
      title: "Active Patients", 
      value: metrics.totalPatients || 2847,
      change: { value: "+12%", type: 'increase' as const },
      subtitle: "This Month",
      icon: Users,
      color: "bg-green-500"
    },
    {
      title: "Pending Lab Results",
      value: metrics.pendingLabResults || 89,
      change: { value: "-3%", type: 'decrease' as const },
      subtitle: "Awaiting Review",
      icon: TestTube,
      color: "bg-orange-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl border-r z-50">
        <div className="p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">NaviMED Admin</h2>
              <p className="text-sm text-gray-600">Hospital Management</p>
            </div>
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => (
            <Link key={item.id} href={item.href}>
              <Button
                variant={isActive(item.href) ? "default" : "ghost"}
                className={`w-full justify-start space-x-3 ${
                  isActive(item.href) 
                    ? "bg-blue-600 text-white" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
                data-testid={`nav-${item.id}`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Button>
            </Link>
          ))}
        </nav>
        
        <div className="absolute bottom-4 left-4 right-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-3">
              <Stethoscope className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-blue-700">{tenant?.name || 'Hospital Admin'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Hospital Administration</h1>
              <p className="text-gray-600">Welcome back, {user?.firstName}. Here's your hospital overview.</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-green-500" />
                <span>System Active</span>
              </Badge>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6 space-y-6">
          {/* Hero Banner */}
          <Card className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800 text-white">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">Optimize Your Hospital Operations</h2>
                  <p className="text-blue-100 max-w-md">
                    Streamline patient care, manage staff efficiently, and ensure seamless healthcare delivery 
                    with our comprehensive management platform.
                  </p>
                  <Button variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
                    Learn More
                  </Button>
                </div>
                <div className="hidden lg:block">
                  <img 
                    src={imagePath} 
                    alt="Hospital Professional" 
                    className="w-48 h-32 object-cover rounded-lg"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {defaultMetrics.map((metric, index) => (
              <MetricCard key={index} {...metric} />
            ))}
          </div>

          {/* Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Analytics Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Hospital Operations Analytics</span>
                  <Badge variant="outline">This Month</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center space-y-2">
                    <Activity className="h-12 w-12 mx-auto text-gray-400" />
                    <p>Analytics visualization will be added here</p>
                    <p className="text-sm text-gray-400">Appointments, lab orders, and patient flow trends</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Services */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Top Services</span>
                  <Badge variant="outline">This Month</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "General Consultation", count: 245, color: "bg-blue-500" },
                    { name: "Laboratory Tests", count: 189, color: "bg-green-500" },
                    { name: "Radiology", count: 156, color: "bg-orange-500" },
                    { name: "Emergency Care", count: 89, color: "bg-red-500" }
                  ].map((service, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${service.color}`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{service.name}</p>
                        <p className="text-xs text-gray-500">{service.count} appointments</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Hospital Activity</span>
                <Button variant="outline" size="sm">View All</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Activity ID</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Patient/Service</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id: "APT001", service: "Sarah Johnson - Consultation", type: "Appointment", status: "Completed" },
                      { id: "LAB002", service: "Mike Chen - Blood Test", type: "Lab Order", status: "In Progress" },
                      { id: "APT003", service: "Emma Wilson - Check-up", type: "Appointment", status: "Scheduled" }
                    ].map((activity, index) => (
                      <tr key={index} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium text-blue-600">#{activity.id}</td>
                        <td className="py-3 px-4 text-sm">{activity.service}</td>
                        <td className="py-3 px-4 text-sm">{activity.type}</td>
                        <td className="py-3 px-4">
                          <Badge 
                            variant="outline"
                            className={
                              activity.status === 'Completed' ? 'text-green-700 bg-green-50 border-green-200' :
                              activity.status === 'In Progress' ? 'text-orange-700 bg-orange-50 border-orange-200' :
                              'text-blue-700 bg-blue-50 border-blue-200'
                            }
                          >
                            {activity.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="sm" className="text-blue-600">View</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Original Dashboard Content */}
          {children}
        </main>
      </div>
    </div>
  );
};

export default HospitalAdminShell;