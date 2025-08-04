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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tenants, isLoading: tenantsLoading } = useQuery<TenantWithStats[]>({
    queryKey: ['/api/admin/tenants']
  });

  const { data: platformStats, isLoading: statsLoading } = useQuery<PlatformStats>({
    queryKey: ['/api/admin/platform-stats']
  });

  const { data: suppliers, isLoading: suppliersLoading } = useQuery<MedicalSupplier[]>({
    queryKey: ['/api/admin/suppliers']
  });

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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Platform Overview</TabsTrigger>
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
                            {tenant.stats.userCount} users
                          </p>
                          <p className="text-sm text-gray-600">
                            {tenant.stats.patientCount} patients
                          </p>
                        </div>
                        
                        <div className="flex flex-col gap-2">
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
    </div>
  );
}