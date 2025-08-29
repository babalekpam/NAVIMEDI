import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Pill, Users, Clock, CheckCircle, AlertCircle, TrendingUp, Package } from "lucide-react";

export default function PharmacyDashboard() {
  const { user, tenant } = useAuth();

  // Sample data for pharmacy metrics
  const { data: pharmacyMetrics } = useQuery({
    queryKey: ["/api/pharmacy/metrics"],
    queryFn: () => Promise.resolve({
      pendingPrescriptions: 12,
      readyForPickup: 8,
      dispensedToday: 24,
      totalCustomers: 156,
      inventoryAlerts: 3,
      monthlyRevenue: 48600
    }),
    staleTime: 30000,
  });

  const { data: recentPrescriptions } = useQuery({
    queryKey: ["/api/prescriptions"],
    staleTime: 30000,
  });

  const { data: inventoryStatus } = useQuery({
    queryKey: ["/api/pharmacy/inventory-status"],
    queryFn: () => Promise.resolve([
      { medication: "Amoxicillin 500mg", stock: 45, reorderLevel: 20, status: "good" },
      { medication: "Lisinopril 10mg", stock: 8, reorderLevel: 15, status: "low" },
      { medication: "Metformin 850mg", stock: 2, reorderLevel: 10, status: "critical" },
      { medication: "Atorvastatin 40mg", stock: 32, reorderLevel: 20, status: "good" }
    ]),
    staleTime: 30000,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'prescribed': return 'bg-blue-100 text-blue-800';
      case 'received': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'dispensed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'low': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pharmacy Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back to {tenant?.name || 'DEO Pharmacy'} management portal
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Prescriptions</CardTitle>
            <AlertCircle className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pharmacyMetrics?.pendingPrescriptions || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ready for Pickup</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pharmacyMetrics?.readyForPickup || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Processed & ready</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Dispensed Today</CardTitle>
            <Pill className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pharmacyMetrics?.dispensedToday || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Completed today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Customers</CardTitle>
            <Users className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pharmacyMetrics?.totalCustomers || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Active patients</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Prescriptions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Prescriptions</CardTitle>
                <CardDescription>Latest prescription orders from hospitals</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { id: '1', patient: 'John Doe', medication: 'Amoxicillin 500mg', status: 'processing', doctor: 'Dr. Smith' },
                { id: '2', patient: 'Jane Smith', medication: 'Lisinopril 10mg', status: 'ready', doctor: 'Dr. Johnson' },
                { id: '3', patient: 'Mike Johnson', medication: 'Metformin 850mg', status: 'received', doctor: 'Dr. Wilson' },
                { id: '4', patient: 'Sarah Davis', medication: 'Atorvastatin 40mg', status: 'dispensed', doctor: 'Dr. Brown' }
              ].map((prescription) => (
                <div key={prescription.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{prescription.patient}</div>
                    <div className="text-sm text-gray-600">{prescription.medication}</div>
                    <div className="text-xs text-gray-500">Prescribed by {prescription.doctor}</div>
                  </div>
                  <Badge className={getStatusColor(prescription.status)}>
                    {prescription.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Inventory Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Inventory Alerts</CardTitle>
                <CardDescription>Low stock medications requiring attention</CardDescription>
              </div>
              <Badge variant="destructive">{pharmacyMetrics?.inventoryAlerts || 0}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inventoryStatus?.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{item.medication}</div>
                    <div className="text-sm text-gray-600">
                      Stock: {item.stock} units • Reorder at: {item.reorderLevel}
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 ${getStockColor(item.status)}`}>
                    <Package className="h-4 w-4" />
                    <span className="text-sm font-medium capitalize">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              <Package className="h-4 w-4 mr-2" />
              Manage Inventory
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common pharmacy management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-auto p-4 flex flex-col items-center gap-2">
              <AlertCircle className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Process Prescriptions</div>
                <div className="text-xs text-gray-500">Review & fill orders</div>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Package className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Inventory Management</div>
                <div className="text-xs text-gray-500">Stock & reorder</div>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Users className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Customer Service</div>
                <div className="text-xs text-gray-500">Patient inquiries</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}