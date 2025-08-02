import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Pill, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Edit,
  Package,
  FileText,
  Bell,
  ShoppingCart,
  Activity,
  Calendar,
  Star,
  Truck,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useTenant } from '@/hooks/use-tenant';

interface PharmacyStats {
  totalPrescriptions: number;
  pendingPrescriptions: number;
  completedToday: number;
  revenue: number;
  inventoryAlerts: number;
  activePatients: number;
}

interface Prescription {
  id: string;
  patientName: string;
  medicationName: string;
  prescribedBy: string;
  status: 'new' | 'processing' | 'ready' | 'dispensed' | 'on_hold';
  priority: 'normal' | 'urgent' | 'emergency';
  createdAt: string;
  pickupDate?: string;
  insuranceStatus: 'verified' | 'pending' | 'rejected';
}

interface InventoryItem {
  id: string;
  name: string;
  genericName: string;
  strength: string;
  form: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  expiryDate: string;
  batchNumber: string;
  cost: number;
  price: number;
  supplier: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired';
}

export default function PharmacyDashboardEnhanced() {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const [activeView, setActiveView] = useState('overview');
  
  // Debug logging for state changes
  console.log('Current activeView state:', activeView);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: '', prescription: null as Prescription | null, inventoryItem: null as InventoryItem | null });

  // Debug tab changes
  const handleTabChange = (value: string) => {
    console.log('Tab changed to:', value);
    setActiveView(value);
  };

  // Manual tab click handlers for debugging
  const handleTabClick = (tabValue: string, event: React.MouseEvent) => {
    event.preventDefault();
    console.log('Manual tab click:', tabValue);
    setActiveView(tabValue);
  };

  // Modal functions
  const openViewModal = (prescription: Prescription) => {
    setModalContent({
      title: 'Prescription Details',
      content: 'view',
      prescription,
      inventoryItem: null
    });
    setModalOpen(true);
  };

  const openProcessModal = (prescription: Prescription) => {
    setModalContent({
      title: 'Process Prescription',
      content: 'process',
      prescription,
      inventoryItem: null
    });
    setModalOpen(true);
  };

  const openDispenseModal = (prescription: Prescription) => {
    setModalContent({
      title: 'Dispense Prescription',
      content: 'dispense',
      prescription,
      inventoryItem: null
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalContent({ title: '', content: '', prescription: null, inventoryItem: null });
  };

  // Inventory modal functions
  const openEditInventoryModal = (item: InventoryItem) => {
    setModalContent({
      title: 'Edit Inventory Item',
      content: 'edit-inventory',
      prescription: null,
      inventoryItem: item
    });
    setModalOpen(true);
  };

  const openReorderModal = (item: InventoryItem) => {
    setModalContent({
      title: 'Reorder Item',
      content: 'reorder',
      prescription: null,
      inventoryItem: item
    });
    setModalOpen(true);
  };

  // Handle prescription processing
  const handleStartProcessing = () => {
    if (modalContent.prescription) {
      // Here you would typically make an API call to update the prescription status
      console.log('Starting processing for prescription:', modalContent.prescription.id);
      alert(`Started processing prescription for ${modalContent.prescription.patientName}\n\nStatus updated to: In Progress\nMedication: ${modalContent.prescription.medicationName}`);
      closeModal();
    }
  };

  const handleCompleteDispensing = () => {
    if (modalContent.prescription) {
      console.log('Completing dispensing for prescription:', modalContent.prescription.id);
      alert(`Prescription dispensed successfully!\n\nPatient: ${modalContent.prescription.patientName}\nMedication: ${modalContent.prescription.medicationName}\nStatus: Dispensed\n\nReceipt generated and patient notified.`);
      closeModal();
    }
  };

  const handleSaveInventoryChanges = () => {
    if (modalContent.inventoryItem) {
      console.log('Saving inventory changes for:', modalContent.inventoryItem.id);
      alert(`Inventory item updated successfully!\n\nItem: ${modalContent.inventoryItem.name}\nChanges saved to database.\n\nStock levels and pricing updated.`);
      closeModal();
    }
  };

  const handlePlaceOrder = () => {
    if (modalContent.inventoryItem) {
      console.log('Placing order for:', modalContent.inventoryItem.id);
      const quantity = modalContent.inventoryItem.maxStock - modalContent.inventoryItem.currentStock;
      const totalCost = quantity * modalContent.inventoryItem.cost;
      alert(`Order placed successfully!\n\nItem: ${modalContent.inventoryItem.name}\nQuantity: ${quantity} units\nSupplier: ${modalContent.inventoryItem.supplier}\nTotal Cost: $${totalCost.toFixed(2)}\n\nExpected delivery: 3-5 business days`);
      closeModal();
    }
  };

  // Fetch pharmacy statistics
  const { data: stats } = useQuery<PharmacyStats>({
    queryKey: ['/api/pharmacy/stats'],
    initialData: {
      totalPrescriptions: 247,
      pendingPrescriptions: 23,
      completedToday: 45,
      revenue: 15240.50,
      inventoryAlerts: 8,
      activePatients: 1834
    }
  });

  // Fetch recent prescriptions
  const { data: prescriptions = [] } = useQuery<Prescription[]>({
    queryKey: ['/api/prescriptions', { status: filterStatus }],
    initialData: [
      {
        id: '1',
        patientName: 'Sarah Johnson',
        medicationName: 'Metformin 500mg',
        prescribedBy: 'Dr. Smith',
        status: 'new',
        priority: 'normal',
        createdAt: '2025-08-02T10:30:00Z',
        insuranceStatus: 'verified'
      },
      {
        id: '2',
        patientName: 'Michael Brown',
        medicationName: 'Lisinopril 10mg',
        prescribedBy: 'Dr. Wilson',
        status: 'processing',
        priority: 'urgent',
        createdAt: '2025-08-02T09:15:00Z',
        insuranceStatus: 'pending'
      },
      {
        id: '3',
        patientName: 'Emily Davis',
        medicationName: 'Atorvastatin 20mg',
        prescribedBy: 'Dr. Johnson',
        status: 'ready',
        priority: 'normal',
        createdAt: '2025-08-02T08:45:00Z',
        pickupDate: '2025-08-02T14:00:00Z',
        insuranceStatus: 'verified'
      }
    ]
  });

  // Fetch inventory items
  const { data: inventory = [] } = useQuery<InventoryItem[]>({
    queryKey: ['/api/pharmacy/inventory'],
    initialData: [
      {
        id: '1',
        name: 'Metformin',
        genericName: 'Metformin Hydrochloride',
        strength: '500mg',
        form: 'Tablet',
        currentStock: 150,
        minStock: 50,
        maxStock: 500,
        expiryDate: '2026-03-15',
        batchNumber: 'MET2024001',
        cost: 0.25,
        price: 0.85,
        supplier: 'PharmaCorp',
        status: 'in_stock'
      },
      {
        id: '2',
        name: 'Lisinopril',
        genericName: 'Lisinopril',
        strength: '10mg',
        form: 'Tablet',
        currentStock: 25,
        minStock: 30,
        maxStock: 200,
        expiryDate: '2025-12-20',
        batchNumber: 'LIS2024002',
        cost: 0.15,
        price: 0.65,
        supplier: 'MedSupply Inc.',
        status: 'low_stock'
      }
    ]
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { color: 'bg-blue-100 text-blue-800', label: 'New' },
      processing: { color: 'bg-yellow-100 text-yellow-800', label: 'Processing' },
      ready: { color: 'bg-green-100 text-green-800', label: 'Ready' },
      dispensed: { color: 'bg-gray-100 text-gray-800', label: 'Dispensed' },
      on_hold: { color: 'bg-red-100 text-red-800', label: 'On Hold' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      normal: { color: 'bg-gray-100 text-gray-800', label: 'Normal' },
      urgent: { color: 'bg-orange-100 text-orange-800', label: 'Urgent' },
      emergency: { color: 'bg-red-100 text-red-800', label: 'Emergency' }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.normal;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getStockStatusBadge = (status: string) => {
    const statusConfig = {
      in_stock: { color: 'bg-green-100 text-green-800', label: 'In Stock' },
      low_stock: { color: 'bg-yellow-100 text-yellow-800', label: 'Low Stock' },
      out_of_stock: { color: 'bg-red-100 text-red-800', label: 'Out of Stock' },
      expired: { color: 'bg-red-100 text-red-800', label: 'Expired' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.in_stock;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.medicationName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || prescription.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pharmacy Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user?.firstName}! Current view: <span className="font-semibold capitalize">{activeView}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
            {stats?.inventoryAlerts ? (
              <Badge className="bg-red-100 text-red-800 ml-1">{stats.inventoryAlerts}</Badge>
            ) : null}
          </Button>
          <Button className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Prescriptions</p>
                <p className="text-2xl font-bold">{stats?.totalPrescriptions}</p>
              </div>
              <Pill className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{stats?.pendingPrescriptions}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold text-green-600">{stats?.completedToday}</p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                <p className="text-2xl font-bold text-green-600">${stats?.revenue?.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inventory Alerts</p>
                <p className="text-2xl font-bold text-red-600">{stats?.inventoryAlerts}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Patients</p>
                <p className="text-2xl font-bold">{stats?.activePatients}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs - Custom Implementation */}
      <div className="space-y-4">
        <div className="grid w-full grid-cols-4 bg-gray-100 rounded-lg p-1 gap-1">
          <Button
            variant={activeView === 'overview' ? 'default' : 'ghost'}
            onClick={() => {
              console.log('Overview button clicked');
              setActiveView('overview');
            }}
            className={`${activeView === 'overview' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:bg-gray-50'
            } rounded-md px-4 py-2 font-medium transition-all`}
          >
            Overview
          </Button>
          <Button
            variant={activeView === 'prescriptions' ? 'default' : 'ghost'}
            onClick={() => {
              console.log('Prescriptions button clicked');
              setActiveView('prescriptions');
            }}
            className={`${activeView === 'prescriptions' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:bg-gray-50'
            } rounded-md px-4 py-2 font-medium transition-all`}
          >
            Prescriptions
          </Button>
          <Button
            variant={activeView === 'inventory' ? 'default' : 'ghost'}
            onClick={() => {
              console.log('Inventory button clicked');
              setActiveView('inventory');
            }}
            className={`${activeView === 'inventory' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:bg-gray-50'
            } rounded-md px-4 py-2 font-medium transition-all`}
          >
            Inventory
          </Button>
          <Button
            variant={activeView === 'analytics' ? 'default' : 'ghost'}
            onClick={() => {
              console.log('Analytics button clicked');
              setActiveView('analytics');
            }}
            className={`${activeView === 'analytics' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:bg-gray-50'
            } rounded-md px-4 py-2 font-medium transition-all`}
          >
            Analytics
          </Button>
        </div>

        {/* Tab Content */}
        {activeView === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Prescriptions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="w-5 h-5" />
                  Recent Prescriptions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {prescriptions.slice(0, 5).map((prescription) => (
                    <div key={prescription.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{prescription.patientName}</p>
                        <p className="text-sm text-gray-600">{prescription.medicationName}</p>
                        <p className="text-xs text-gray-500">By {prescription.prescribedBy}</p>
                      </div>
                      <div className="text-right space-y-1">
                        {getStatusBadge(prescription.status)}
                        {getPriorityBadge(prescription.priority)}
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Prescriptions
                </Button>
              </CardContent>
            </Card>

            {/* Inventory Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Inventory Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {inventory.filter(item => item.status === 'low_stock' || item.status === 'out_of_stock').map((item) => (
                    <div key={item.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{item.name} {item.strength}</p>
                        <p className="text-sm text-gray-600">Current: {item.currentStock} units</p>
                        <p className="text-xs text-gray-500">Min Required: {item.minStock}</p>
                      </div>
                      <div className="text-right">
                        {getStockStatusBadge(item.status)}
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Reorder Items
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeView === 'prescriptions' && (
          <div className="space-y-4">
            {/* Search and Filter */}
            <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search prescriptions by patient or medication..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="processing">Processing</option>
              <option value="ready">Ready</option>
              <option value="dispensed">Dispensed</option>
              <option value="on_hold">On Hold</option>
            </select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>

          {/* Prescriptions List */}
          <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Prescription Management</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {filteredPrescriptions.map((prescription) => (
                  <div key={prescription.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{prescription.patientName}</h3>
                        <p className="text-gray-600">{prescription.medicationName}</p>
                        <p className="text-sm text-gray-500">Prescribed by {prescription.prescribedBy}</p>
                      </div>
                      <div className="text-right space-y-2">
                        {getStatusBadge(prescription.status)}
                        {getPriorityBadge(prescription.priority)}
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          prescription.insuranceStatus === 'verified' ? 'bg-green-100 text-green-800' :
                          prescription.insuranceStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          Insurance {prescription.insuranceStatus}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        Created: {new Date(prescription.createdAt).toLocaleDateString()}
                        {prescription.pickupDate && (
                          <span className="ml-4">
                            Pickup: {new Date(prescription.pickupDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <span
                          className="inline-flex items-center px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 cursor-pointer select-none"
                          onClick={() => openViewModal(prescription)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </span>
                        <span
                          className="inline-flex items-center px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 cursor-pointer select-none"
                          onClick={() => openProcessModal(prescription)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Process
                        </span>
                        {prescription.status === 'ready' && (
                          <span
                            className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer select-none"
                            onClick={() => openDispenseModal(prescription)}
                          >
                            <Truck className="w-4 h-4 mr-1" />
                            Dispense
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          </div>
        )}

        {activeView === 'inventory' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Inventory Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inventory.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{item.name} ({item.genericName})</h3>
                        <p className="text-gray-600">{item.strength} - {item.form}</p>
                        <p className="text-sm text-gray-500">Batch: {item.batchNumber} | Supplier: {item.supplier}</p>
                      </div>
                      <div className="text-right">
                        {getStockStatusBadge(item.status)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Current Stock</p>
                        <p className="font-semibold">{item.currentStock} units</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Min/Max Stock</p>
                        <p className="font-semibold">{item.minStock}/{item.maxStock}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Cost/Price</p>
                        <p className="font-semibold">${item.cost.toFixed(2)}/${item.price.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Expiry Date</p>
                        <p className="font-semibold">{new Date(item.expiryDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 mt-3">
                      <span
                        className="inline-flex items-center px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 cursor-pointer select-none"
                        onClick={() => openEditInventoryModal(item)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </span>
                      <span
                        className="inline-flex items-center px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 cursor-pointer select-none"
                        onClick={() => openReorderModal(item)}
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Reorder
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeView === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Sales Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Today's Sales</span>
                    <span className="font-bold text-green-600">${stats?.revenue?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Weekly Average</span>
                    <span className="font-bold">$12,450</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Monthly Target</span>
                    <span className="font-bold">$350,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Achievement</span>
                    <Badge className="bg-green-100 text-green-800">87%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Prescription Fill Rate</span>
                    <span className="font-bold text-green-600">98.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Wait Time</span>
                    <span className="font-bold">12 minutes</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Customer Satisfaction</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-bold">4.8/5</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Insurance Claims Success</span>
                    <span className="font-bold text-green-600">94.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      
      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{modalContent.title}</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              {modalContent.content === 'view' && modalContent.prescription && (
                <div>
                  <h3 className="font-semibold mb-3">Prescription Details</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Patient:</strong> {modalContent.prescription.patientName}</div>
                    <div><strong>Medication:</strong> {modalContent.prescription.medicationName}</div>
                    <div><strong>Prescribed By:</strong> {modalContent.prescription.prescribedBy}</div>
                    <div><strong>Status:</strong> {modalContent.prescription.status}</div>
                    <div><strong>Priority:</strong> {modalContent.prescription.priority}</div>
                    <div><strong>Insurance:</strong> {modalContent.prescription.insuranceStatus}</div>
                    <div><strong>Created:</strong> {new Date(modalContent.prescription.createdAt).toLocaleDateString()}</div>
                    {modalContent.prescription.pickupDate && (
                      <div><strong>Pickup Date:</strong> {new Date(modalContent.prescription.pickupDate).toLocaleDateString()}</div>
                    )}
                  </div>
                </div>
              )}
              
              {modalContent.content === 'process' && modalContent.prescription && (
                <div>
                  <h3 className="font-semibold mb-3">Process Prescription</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded">
                      <h4 className="font-medium">Patient: {modalContent.prescription.patientName}</h4>
                      <p className="text-sm text-gray-600">{modalContent.prescription.medicationName}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Processing Steps:</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Verify insurance coverage</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span>Check drug interactions</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                          <span>Prepare medication</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                          <span>Update status to Ready</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <button 
                        onClick={handleStartProcessing}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      >
                        Start Processing
                      </button>
                      <button 
                        onClick={closeModal}
                        className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {modalContent.content === 'dispense' && modalContent.prescription && (
                <div>
                  <h3 className="font-semibold mb-3">Dispense Prescription</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 rounded">
                      <h4 className="font-medium">Patient: {modalContent.prescription.patientName}</h4>
                      <p className="text-sm text-gray-600">{modalContent.prescription.medicationName}</p>
                      <p className="text-xs text-green-600 mt-1">Ready for dispensing</p>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Dispensing Checklist:</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" />
                          <span>Print medication labels</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" />
                          <span>Package medication securely</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" />
                          <span>Verify patient identity</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" />
                          <span>Provide counseling</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" />
                          <span>Generate receipt</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <button 
                        onClick={handleCompleteDispensing}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                      >
                        Complete Dispensing
                      </button>
                      <button 
                        onClick={closeModal}
                        className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {modalContent.content === 'edit-inventory' && modalContent.inventoryItem && (
                <div>
                  <h3 className="font-semibold mb-3">Edit Inventory Item</h3>
                  <div className="space-y-4">
                    <div className="p-3 bg-blue-50 rounded">
                      <h4 className="font-medium">{modalContent.inventoryItem.name}</h4>
                      <p className="text-sm text-gray-600">{modalContent.inventoryItem.genericName} - {modalContent.inventoryItem.strength}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <label className="block font-medium mb-1">Current Stock</label>
                        <input 
                          type="number" 
                          defaultValue={modalContent.inventoryItem.currentStock}
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="block font-medium mb-1">Minimum Stock</label>
                        <input 
                          type="number" 
                          defaultValue={modalContent.inventoryItem.minStock}
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="block font-medium mb-1">Maximum Stock</label>
                        <input 
                          type="number" 
                          defaultValue={modalContent.inventoryItem.maxStock}
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="block font-medium mb-1">Cost per Unit</label>
                        <input 
                          type="number" 
                          step="0.01"
                          defaultValue={modalContent.inventoryItem.cost}
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="block font-medium mb-1">Selling Price</label>
                        <input 
                          type="number" 
                          step="0.01"
                          defaultValue={modalContent.inventoryItem.price}
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="block font-medium mb-1">Expiry Date</label>
                        <input 
                          type="date" 
                          defaultValue={modalContent.inventoryItem.expiryDate}
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block font-medium mb-1">Supplier</label>
                      <input 
                        type="text" 
                        defaultValue={modalContent.inventoryItem.supplier}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <button 
                        onClick={handleSaveInventoryChanges}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      >
                        Save Changes
                      </button>
                      <button 
                        onClick={closeModal}
                        className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {modalContent.content === 'reorder' && modalContent.inventoryItem && (
                <div>
                  <h3 className="font-semibold mb-3">Reorder Item</h3>
                  <div className="space-y-4">
                    <div className="p-3 bg-orange-50 rounded">
                      <h4 className="font-medium">{modalContent.inventoryItem.name}</h4>
                      <p className="text-sm text-gray-600">{modalContent.inventoryItem.genericName}</p>
                      <p className="text-xs text-orange-600 mt-1">
                        Stock Level: {modalContent.inventoryItem.currentStock} units (Min: {modalContent.inventoryItem.minStock})
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block font-medium mb-1 text-sm">Current Stock</label>
                          <div className="p-2 bg-gray-100 rounded text-sm">{modalContent.inventoryItem.currentStock} units</div>
                        </div>
                        <div>
                          <label className="block font-medium mb-1 text-sm">Minimum Level</label>
                          <div className="p-2 bg-gray-100 rounded text-sm">{modalContent.inventoryItem.minStock} units</div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block font-medium mb-1 text-sm">Suggested Quantity</label>
                        <input 
                          type="number" 
                          defaultValue={modalContent.inventoryItem.maxStock - modalContent.inventoryItem.currentStock}
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block font-medium mb-1 text-sm">Cost per Unit</label>
                          <div className="p-2 bg-gray-100 rounded text-sm">${modalContent.inventoryItem.cost.toFixed(2)}</div>
                        </div>
                        <div>
                          <label className="block font-medium mb-1 text-sm">Total Cost</label>
                          <div className="p-2 bg-blue-100 rounded text-sm font-medium">
                            ${((modalContent.inventoryItem.maxStock - modalContent.inventoryItem.currentStock) * modalContent.inventoryItem.cost).toFixed(2)}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block font-medium mb-1 text-sm">Supplier</label>
                        <div className="p-2 bg-gray-100 rounded text-sm">{modalContent.inventoryItem.supplier}</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <button 
                        onClick={handlePlaceOrder}
                        className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm"
                      >
                        Place Order
                      </button>
                      <button 
                        onClick={closeModal}
                        className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}