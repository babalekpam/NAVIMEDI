import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useTenant } from '@/hooks/use-tenant';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Users, DollarSign, Package, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface PharmacyPrescription {
  id: string;
  patientName: string;
  medication: string;
  status: 'new' | 'processing' | 'ready' | 'dispensed';
  waitTime: number;
  priority: 'normal' | 'urgent' | 'critical';
  insuranceStatus: 'approved' | 'pending' | 'denied';
}

export default function PharmacyDashboardWorking() {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const [selectedTab, setSelectedTab] = useState('overview');

  // Force debug logging
  console.log('[PHARMACY WORKING] 🚀 Loading pharmacy dashboard...');
  console.log('[PHARMACY WORKING] 👤 User:', user?.role);
  console.log('[PHARMACY WORKING] 🏢 Tenant:', tenant?.name, tenant?.type);

  // Fetch pharmacy prescriptions
  const { data: prescriptions, isLoading, error } = useQuery({
    queryKey: ['/api/pharmacy/prescriptions', tenant?.id],
    enabled: !!tenant?.id
  });

  console.log('[PHARMACY WORKING] 📊 Prescriptions data:', prescriptions);
  console.log('[PHARMACY WORKING] ⏳ Loading:', isLoading);
  console.log('[PHARMACY WORKING] ❌ Error:', error);

  // Sample metrics for display
  const metrics = {
    totalPrescriptions: prescriptions?.length || 0,
    newPrescriptions: prescriptions?.filter((p: any) => p.status === 'new')?.length || 0,
    processingPrescriptions: prescriptions?.filter((p: any) => p.status === 'processing')?.length || 0,
    readyPrescriptions: prescriptions?.filter((p: any) => p.status === 'ready')?.length || 0
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'dispensed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Debug Info */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">🔧 Debug Information</h3>
        <div className="text-xs text-blue-600 space-y-1">
          <div>User: {user?.role} | Tenant: {tenant?.name} ({tenant?.type})</div>
          <div>Prescriptions loaded: {prescriptions?.length || 0} | Loading: {isLoading ? 'Yes' : 'No'}</div>
          <div>Error: {error ? 'Yes - Check console' : 'None'}</div>
        </div>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Pharmacy Dashboard - {tenant?.name}
        </h1>
        <p className="text-gray-600">
          Comprehensive prescription management and workflow
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prescriptions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalPrescriptions}</div>
            <p className="text-xs text-muted-foreground">
              Active prescriptions in system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Prescriptions</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.newPrescriptions}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{metrics.processingPrescriptions}</div>
            <p className="text-xs text-muted-foreground">
              Currently being filled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready for Pickup</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.readyPrescriptions}</div>
            <p className="text-xs text-muted-foreground">
              Ready for dispensing
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest prescription activities</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-4">Loading prescriptions...</div>
                ) : prescriptions && prescriptions.length > 0 ? (
                  <div className="space-y-4">
                    {prescriptions.slice(0, 5).map((prescription: PharmacyPrescription) => (
                      <div key={prescription.id} className="flex items-center justify-between border-b pb-2">
                        <div className="flex-1">
                          <p className="font-medium">{prescription.medication}</p>
                          <p className="text-sm text-gray-500">{prescription.patientName}</p>
                        </div>
                        <Badge className={getStatusColor(prescription.status)}>
                          {prescription.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No prescriptions found
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common pharmacy tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Package className="mr-2 h-4 w-4" />
                  Process New Prescription
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Customer Lookup
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Insurance Verification
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Inventory Alerts
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="prescriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Prescriptions</CardTitle>
              <CardDescription>Complete list of pharmacy prescriptions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading prescriptions...</div>
              ) : prescriptions && prescriptions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Patient</th>
                        <th className="text-left py-2">Medication</th>
                        <th className="text-left py-2">Status</th>
                        <th className="text-left py-2">Wait Time</th>
                        <th className="text-left py-2">Insurance</th>
                        <th className="text-left py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prescriptions.map((prescription: PharmacyPrescription) => (
                        <tr key={prescription.id} className="border-b">
                          <td className="py-3">{prescription.patientName}</td>
                          <td className="py-3">{prescription.medication}</td>
                          <td className="py-3">
                            <Badge className={getStatusColor(prescription.status)}>
                              {prescription.status}
                            </Badge>
                          </td>
                          <td className="py-3">{prescription.waitTime} min</td>
                          <td className="py-3">
                            <Badge variant={prescription.insuranceStatus === 'approved' ? 'default' : 'secondary'}>
                              {prescription.insuranceStatus}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <Button size="sm" variant="outline">
                              Process
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="mx-auto h-8 w-8 mb-2" />
                  <p>No prescriptions found</p>
                  <p className="text-sm">Prescriptions from hospitals will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Prescription Workflow</CardTitle>
              <CardDescription>Hospital to pharmacy prescription flow</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Prescription Received</h4>
                    <p className="text-sm text-gray-500">Doctor sends prescription to preferred pharmacy</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Insurance Verification</h4>
                    <p className="text-sm text-gray-500">Verify patient insurance and calculate copay</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Processing</h4>
                    <p className="text-sm text-gray-500">Fill prescription and prepare for pickup</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium">Ready for Pickup</h4>
                    <p className="text-sm text-gray-500">Notify patient and prepare for dispensing</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center">
                    5
                  </div>
                  <div>
                    <h4 className="font-medium">Dispensed</h4>
                    <p className="text-sm text-gray-500">Complete transaction and update records</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}