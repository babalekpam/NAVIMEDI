import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserPlus, Users, Stethoscope, Heart, FlaskConical, UserCheck, DollarSign, ShieldCheck, Building2, Activity } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useTenant } from "@/contexts/tenant-context-fixed";
import { useTranslation } from "@/contexts/translation-context";
import UserRoles from "@/pages/user-roles";

interface AdminDashboardProps {
  activeTab?: string;
}

export default function AdminDashboard({ activeTab = "overview" }: AdminDashboardProps) {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { t } = useTranslation();
  const [currentTab, setCurrentTab] = useState(activeTab);

  if (!user || user.role !== 'tenant_admin') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <ShieldCheck className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Admin Access Required</h2>
          <p className="text-gray-600">Only hospital administrators can access this page.</p>
        </div>
      </div>
    );
  }

  const staffCards = [
    {
      role: "physician",
      title: "Add Doctors",
      description: "Add physicians and medical specialists to your hospital",
      icon: Stethoscope,
      color: "bg-blue-100 text-blue-800",
      count: "Specialists & Primary Care"
    },
    {
      role: "nurse",
      title: "Add Nurses", 
      description: "Add registered nurses and nursing staff",
      icon: Heart,
      color: "bg-green-100 text-green-800",
      count: "RNs & LPNs"
    },
    {
      role: "lab_technician",
      title: "Add Lab Staff",
      description: "Add laboratory technicians and pathologists",
      icon: FlaskConical,
      color: "bg-purple-100 text-purple-800",
      count: "Lab Technicians"
    },
    {
      role: "receptionist",
      title: "Add Reception Staff",
      description: "Add front desk and patient registration staff",
      icon: UserCheck,
      color: "bg-yellow-100 text-yellow-800",
      count: "Front Desk Staff"
    },
    {
      role: "billing_staff",
      title: "Add Billing Staff",
      description: "Add billing specialists and financial coordinators",
      icon: DollarSign,
      color: "bg-orange-100 text-orange-800",
      count: "Billing Specialists"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hospital Administration</h1>
          <p className="text-gray-600">Manage your hospital staff and personnel</p>
        </div>
        <Badge variant="outline" className="flex items-center">
          <Building2 className="h-4 w-4 mr-2" />
          {tenant?.name || "Hospital Admin"}
        </Badge>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="add-staff">Add Staff</TabsTrigger>
          <TabsTrigger value="manage-users">Manage Users</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserPlus className="h-5 w-5 mr-2 text-blue-600" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => setCurrentTab("add-staff")}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Stethoscope className="h-4 w-4 mr-2" />
                  Add New Doctor
                </Button>
                <Button 
                  onClick={() => setCurrentTab("add-staff")}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Add New Nurse
                </Button>
                <Button 
                  onClick={() => setCurrentTab("manage-users")}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Users className="h-4 w-4 mr-2" />
                  View All Staff
                </Button>
              </CardContent>
            </Card>

            {/* Staff Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-green-600" />
                  Staff Summary
                </CardTitle>
                <CardDescription>Current personnel overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Staff</span>
                  <Badge variant="secondary">View Details</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Doctors</span>
                  <Badge className="bg-blue-100 text-blue-800">Manage</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Nursing Staff</span>
                  <Badge className="bg-green-100 text-green-800">Manage</Badge>
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-purple-600" />
                  System Status
                </CardTitle>
                <CardDescription>Hospital management overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Trial Status</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Email System</span>
                  <Badge className="bg-blue-100 text-blue-800">Configured</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">User Accounts</span>
                  <Badge variant="outline">Temporary Passwords</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="add-staff">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add Hospital Personnel</CardTitle>
                <CardDescription>
                  Add new staff members to your hospital. Each person will receive an email with a temporary password.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {staffCards.map((staff) => {
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
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Create and manage all hospital staff accounts. New users receive temporary passwords via email.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserRoles />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hospital Departments</CardTitle>
                <CardDescription>
                  Organize your staff by departments and specialties
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    { name: "Emergency Department", staff: "12 Staff Members", icon: Activity },
                    { name: "Internal Medicine", staff: "8 Staff Members", icon: Stethoscope },
                    { name: "Laboratory", staff: "6 Staff Members", icon: FlaskConical },
                    { name: "Administration", staff: "4 Staff Members", icon: Building2 }
                  ].map((dept) => {
                    const Icon = dept.icon;
                    return (
                      <Card key={dept.name}>
                        <CardHeader>
                          <div className="flex items-center">
                            <Icon className="h-6 w-6 mr-3 text-blue-600" />
                            <div>
                              <CardTitle className="text-lg">{dept.name}</CardTitle>
                              <CardDescription>{dept.staff}</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <Button variant="outline" className="w-full">
                            Manage Department
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
      </Tabs>
    </div>
  );
}