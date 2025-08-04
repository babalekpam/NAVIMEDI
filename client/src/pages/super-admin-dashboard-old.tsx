import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users, Activity, Database, CheckCircle, XCircle, Clock, Mail, Phone, MapPin, Calendar, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface TenantWithStats {
  id: string;
  name: string;
  type: string;
  subdomain: string;
  isActive: boolean;
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
  status: "pending_review" | "approved" | "rejected";
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

export default function SuperAdminDashboard() {
  const { data: tenants, isLoading: tenantsLoading } = useQuery<TenantWithStats[]>({
    queryKey: ['/api/admin/tenants']
  });

  const { data: platformStats, isLoading: statsLoading } = useQuery<PlatformStats>({
    queryKey: ['/api/admin/platform-stats']
  });

  if (tenantsLoading || statsLoading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Super Admin Dashboard</h1>
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

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
        <p className="text-gray-600">Platform oversight and tenant management</p>
      </div>

      {/* Platform Statistics */}
      {platformStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <p className="text-xs text-muted-foreground">Across all tenants</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hospitals</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platformStats.tenantsByType.hospital || 0}</div>
              <p className="text-xs text-muted-foreground">Hospital tenants</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pharmacies</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platformStats.tenantsByType.pharmacy || 0}</div>
              <p className="text-xs text-muted-foreground">Pharmacy tenants</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tenant Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Tenant Overview</CardTitle>
          <CardDescription>
            Manage and monitor all tenants on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tenants && tenants.length > 0 ? (
            <div className="space-y-4">
              {tenants.map((tenant) => (
                <div
                  key={tenant.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="font-semibold">{tenant.name || `${tenant.type} Tenant`}</h3>
                      <p className="text-sm text-gray-600">
                        {tenant.subdomain}.navimed.com
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Badge className={getTenantTypeColor(tenant.type)}>
                      {tenant.type}
                    </Badge>
                    
                    <div className="text-sm text-gray-600">
                      {tenant.stats.userCount} users, {tenant.stats.patientCount} patients
                    </div>
                    
                    <Badge variant={tenant.isActive ? "default" : "secondary"}>
                      {tenant.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No tenants found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Access Notice */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-amber-800">Platform Admin Access</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-amber-700">
            As a super admin, you have oversight access to manage tenants, users, and platform settings. 
            To access operational tenant data (like prescriptions or patient records), you must log in 
            with the appropriate tenant credentials to maintain data security and compliance.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}