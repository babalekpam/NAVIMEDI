import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Package, AlertTriangle, Plus, Search, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InventoryItem {
  id: string;
  medicationName: string;
  genericName?: string;
  strength: string;
  form: string; // tablet, capsule, liquid, etc.
  currentStock: number;
  reorderLevel: number;
  maxStock: number;
  unitCost: number;
  totalValue: number;
  supplier: string;
  expiryDate: string;
  lotNumber: string;
  status: 'good' | 'low' | 'critical' | 'expired';
  lastRestocked: string;
}

export default function PharmacyInventory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const { toast } = useToast();

  // Mock data for pharmacy inventory
  const { data: inventoryItems = [], isLoading } = useQuery({
    queryKey: ["/api/pharmacy/inventory"],
    queryFn: () => Promise.resolve([
      {
        id: '1',
        medicationName: 'Amoxicillin',
        genericName: 'Amoxicillin',
        strength: '500mg',
        form: 'Capsule',
        currentStock: 45,
        reorderLevel: 20,
        maxStock: 100,
        unitCost: 0.85,
        totalValue: 38.25,
        supplier: 'PharmaCorp',
        expiryDate: '2025-12-15',
        lotNumber: 'AMX2025001',
        status: 'good' as const,
        lastRestocked: '2025-01-15'
      },
      {
        id: '2',
        medicationName: 'Lisinopril',
        genericName: 'Lisinopril',
        strength: '10mg',
        form: 'Tablet',
        currentStock: 8,
        reorderLevel: 15,
        maxStock: 80,
        unitCost: 0.45,
        totalValue: 3.60,
        supplier: 'MediSupply',
        expiryDate: '2025-08-30',
        lotNumber: 'LIS2024089',
        status: 'low' as const,
        lastRestocked: '2024-12-20'
      },
      {
        id: '3',
        medicationName: 'Metformin',
        genericName: 'Metformin HCL',
        strength: '850mg',
        form: 'Tablet',
        currentStock: 2,
        reorderLevel: 10,
        maxStock: 150,
        unitCost: 0.25,
        totalValue: 0.50,
        supplier: 'GenericMeds',
        expiryDate: '2025-06-20',
        lotNumber: 'MET2024156',
        status: 'critical' as const,
        lastRestocked: '2024-11-10'
      },
      {
        id: '4',
        medicationName: 'Atorvastatin',
        genericName: 'Atorvastatin Calcium',
        strength: '40mg',
        form: 'Tablet',
        currentStock: 32,
        reorderLevel: 20,
        maxStock: 120,
        unitCost: 1.20,
        totalValue: 38.40,
        supplier: 'PharmaCorp',
        expiryDate: '2025-11-08',
        lotNumber: 'ATO2025023',
        status: 'good' as const,
        lastRestocked: '2025-01-20'
      },
      {
        id: '5',
        medicationName: 'Omeprazole',
        genericName: 'Omeprazole',
        strength: '20mg',
        form: 'Capsule',
        currentStock: 0,
        reorderLevel: 25,
        maxStock: 100,
        unitCost: 0.75,
        totalValue: 0.00,
        supplier: 'MediSupply',
        expiryDate: '2024-12-31',
        lotNumber: 'OME2024078',
        status: 'expired' as const,
        lastRestocked: '2024-08-15'
      }
    ]),
    staleTime: 30000,
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      good: { color: 'bg-green-100 text-green-800', icon: '✅' },
      low: { color: 'bg-yellow-100 text-yellow-800', icon: '⚠️' },
      critical: { color: 'bg-red-100 text-red-800', icon: '🚨' },
      expired: { color: 'bg-gray-100 text-gray-800', icon: '❌' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.good;
    
    return (
      <Badge className={config.color}>
        {config.icon} {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredItems = inventoryItems.filter(item =>
    item.medicationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.genericName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const criticalItems = inventoryItems.filter(item => item.status === 'critical' || item.status === 'expired');
  const lowStockItems = inventoryItems.filter(item => item.status === 'low');
  const totalValue = inventoryItems.reduce((sum, item) => sum + item.totalValue, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pharmacy Inventory</h1>
          <p className="text-gray-600 mt-1">Manage medication stock levels and supplies</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Item
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryItems.length}</div>
            <p className="text-xs text-gray-500">Active medications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalItems.length}</div>
            <p className="text-xs text-gray-500">Need immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <Package className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockItems.length}</div>
            <p className="text-xs text-gray-500">Below reorder level</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
            <p className="text-xs text-gray-500">Total stock value</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Inventory Items</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search medications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medication</TableHead>
                  <TableHead>Stock Level</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.medicationName}</div>
                        <div className="text-sm text-gray-500">
                          {item.strength} {item.form}
                        </div>
                        {item.genericName && (
                          <div className="text-xs text-gray-400">Generic: {item.genericName}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.currentStock} units</div>
                        <div className="text-sm text-gray-500">
                          Reorder at: {item.reorderLevel}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">${item.totalValue.toFixed(2)}</div>
                        <div className="text-sm text-gray-500">
                          ${item.unitCost.toFixed(2)} each
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{item.supplier}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{new Date(item.expiryDate).toLocaleDateString()}</div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(item.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Critical Alerts */}
      {criticalItems.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Critical Inventory Alerts
            </CardTitle>
            <CardDescription className="text-red-700">
              These items require immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                  <div>
                    <div className="font-medium text-gray-900">{item.medicationName}</div>
                    <div className="text-sm text-gray-600">
                      Stock: {item.currentStock} units • Reorder Level: {item.reorderLevel}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(item.status)}
                    <Button size="sm">
                      {item.status === 'expired' ? 'Remove Stock' : 'Reorder Now'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}