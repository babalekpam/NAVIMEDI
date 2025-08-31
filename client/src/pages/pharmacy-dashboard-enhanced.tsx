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
import { useAuth } from '@/contexts/auth-context';
import { useTenant } from '@/contexts/tenant-context';

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
  const [notificationsRead, setNotificationsRead] = useState(false);
  const [showNotificationBadge, setShowNotificationBadge] = useState(true);
  const [inventoryFormData, setInventoryFormData] = useState<{
    currentStock: number;
    minStock: number;
    maxStock: number;
    cost: number;
    price: number;
    expiryDate: string;
    supplier: string;
  } | null>(null);
  const [reorderQuantity, setReorderQuantity] = useState<number>(0);
  const [reportFormData, setReportFormData] = useState({
    reportType: 'daily',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    format: 'pdf'
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [updatedPrescriptionId, setUpdatedPrescriptionId] = useState<string | null>(null);
  const [forceRerender, setForceRerender] = useState(0);
  
  // Local state for prescriptions with status tracking - persisted statuses
  const [prescriptionStatuses, setPrescriptionStatuses] = useState<Record<string, string>>(() => {
    // Try to load from localStorage first to persist dispensed status
    const saved = localStorage.getItem('pharmacy-prescription-statuses');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved prescription statuses:', e);
        // Clear corrupted data
        localStorage.removeItem('pharmacy-prescription-statuses');
      }
    }
    // Default initial statuses
    return {
      '1': 'new',
      '2': 'processing', 
      '3': 'ready'
    };
  });

  // Base prescription data
  const basePrescriptions: Prescription[] = [
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
  ];

  // Merge base data with current statuses
  const localPrescriptions = basePrescriptions.map(prescription => ({
    ...prescription,
    status: (prescriptionStatuses[prescription.id] || prescription.status) as Prescription['status']
  }));

  // Local inventory state with real medication data
  const [localInventoryItems, setLocalInventoryItems] = useState<InventoryItem[]>([
    {
      id: '1',
      name: 'Metformin HCl',
      genericName: 'Metformin Hydrochloride',
      strength: '500mg',
      form: 'Tablet',
      currentStock: 150,
      minStock: 50,
      maxStock: 300,
      expiryDate: '2026-03-15',
      batchNumber: 'MET500-2024-A',
      cost: 0.25,
      price: 0.85,
      supplier: 'MedSupply Corp',
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
      expiryDate: '2025-12-08',
      batchNumber: 'LIS10-2024-B',
      cost: 0.15,
      price: 0.65,
      supplier: 'Pharma Plus',
      status: 'low_stock'
    },
    {
      id: '3',
      name: 'Atorvastatin Calcium',
      genericName: 'Atorvastatin',
      strength: '20mg',
      form: 'Tablet',
      currentStock: 5,
      minStock: 25,
      maxStock: 150,
      expiryDate: '2025-09-22',
      batchNumber: 'ATO20-2024-C',
      cost: 0.45,
      price: 1.25,
      supplier: 'Generic Solutions',
      status: 'low_stock'
    },
    {
      id: '4',
      name: 'Amoxicillin Trihydrate',
      genericName: 'Amoxicillin',
      strength: '500mg',
      form: 'Capsule',
      currentStock: 0,
      minStock: 40,
      maxStock: 250,
      expiryDate: '2025-11-30',
      batchNumber: 'AMX500-2024-D',
      cost: 0.35,
      price: 1.15,
      supplier: 'MedSupply Corp',
      status: 'out_of_stock'
    }
  ]);

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

  // Quick Actions for Enhanced Dashboard
  const quickActions = [
    { 
      label: 'New Prescription', 
      icon: <Pill className="h-5 w-5" />, 
      action: () => alert('🚀 NEW PRESCRIPTION\n\nPrescription entry system would open here.\n\n📝 Features:\n• Patient lookup\n• Medication search\n• Insurance verification\n• Doctor confirmation'),
      color: 'bg-blue-500 hover:bg-blue-600' 
    },
    { 
      label: 'Patient Lookup', 
      icon: <Users className="h-5 w-5" />, 
      action: () => alert('👤 PATIENT LOOKUP\n\nPatient database search would open here.\n\n🔍 Search by:\n• Name\n• Phone number\n• Date of birth\n• Insurance ID'),
      color: 'bg-green-500 hover:bg-green-600' 
    },
    { 
      label: 'Insurance Claims', 
      icon: <FileText className="h-5 w-5" />, 
      action: () => window.location.href = '/medication-insurance-claims',
      color: 'bg-purple-500 hover:bg-purple-600' 
    },
    { 
      label: 'Generate Reports', 
      icon: <Activity className="h-5 w-5" />, 
      action: () => setActiveView('reports'),
      color: 'bg-indigo-500 hover:bg-indigo-600' 
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">DEO Pharmacy</h1>
            <p className="text-gray-600 mt-1">Enhanced Pharmacy Management System</p>
          </div>
          
          {/* Quick Action Buttons */}
          <div className="flex gap-3">
            {quickActions.map((action, index) => (
              <Button 
                key={index}
                onClick={action.action}
                className={`${action.color} text-white flex items-center gap-2`}
                data-testid={`quick-action-${action.label.toLowerCase().replace(' ', '-')}`}
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Pill className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Prescriptions</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalPrescriptions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.pendingPrescriptions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.completedToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${stats?.revenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inventory Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.inventoryAlerts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Patients</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.activePatients}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="prescriptions" data-testid="tab-prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="inventory" data-testid="tab-inventory">Inventory</TabsTrigger>
          <TabsTrigger value="reports" data-testid="tab-reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Prescriptions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  Recent Prescriptions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {localPrescriptions.slice(0, 5).map((prescription) => (
                    <div key={prescription.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{prescription.patientName}</p>
                        <p className="text-sm text-gray-600">{prescription.medicationName}</p>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={
                          prescription.status === 'new' ? 'bg-blue-100 text-blue-800' :
                          prescription.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          prescription.status === 'ready' ? 'bg-green-100 text-green-800' :
                          prescription.status === 'dispensed' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }
                      >
                        {prescription.status.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Inventory Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Inventory Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {localInventoryItems.filter(item => item.status !== 'in_stock').map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">{item.strength} {item.form}</p>
                        <p className="text-xs text-gray-500">Stock: {item.currentStock} units</p>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={
                          item.status === 'low_stock' ? 'bg-yellow-100 text-yellow-800' :
                          item.status === 'out_of_stock' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }
                      >
                        {item.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Prescriptions Tab */}
        <TabsContent value="prescriptions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Prescription Management</CardTitle>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  <Input 
                    placeholder="Search prescriptions..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="processing">Processing</option>
                  <option value="ready">Ready</option>
                  <option value="dispensed">Dispensed</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {localPrescriptions
                  .filter(p => filterStatus === 'all' || p.status === filterStatus)
                  .filter(p => p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              p.medicationName.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((prescription) => (
                  <div 
                    key={prescription.id} 
                    className={`p-4 border rounded-lg transition-all duration-300 ${
                      updatedPrescriptionId === prescription.id 
                        ? 'border-green-500 bg-green-50 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="font-semibold text-lg">{prescription.patientName}</h3>
                          <Badge 
                            variant="secondary"
                            className={
                              prescription.priority === 'emergency' ? 'bg-red-100 text-red-800' :
                              prescription.priority === 'urgent' ? 'bg-orange-100 text-orange-800' :
                              'bg-gray-100 text-gray-800'
                            }
                          >
                            {prescription.priority.toUpperCase()}
                          </Badge>
                          <Badge 
                            variant="secondary"
                            className={
                              prescription.status === 'new' ? 'bg-blue-100 text-blue-800' :
                              prescription.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                              prescription.status === 'ready' ? 'bg-green-100 text-green-800' :
                              prescription.status === 'dispensed' ? 'bg-gray-100 text-gray-800' :
                              'bg-red-100 text-red-800'
                            }
                          >
                            {prescription.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-1"><strong>Medication:</strong> {prescription.medicationName}</p>
                        <p className="text-gray-600 mb-1"><strong>Prescribed by:</strong> {prescription.prescribedBy}</p>
                        <p className="text-gray-600 mb-1"><strong>Insurance:</strong> {prescription.insuranceStatus}</p>
                        <p className="text-sm text-gray-500">Created: {new Date(prescription.createdAt).toLocaleString()}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => alert(`👁️ VIEW PRESCRIPTION\n\nDetailed view for ${prescription.patientName}\n\nMedication: ${prescription.medicationName}\nStatus: ${prescription.status}\nPrescribed by: ${prescription.prescribedBy}\nInsurance: ${prescription.insuranceStatus}\n\nFull prescription details would be displayed here.`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {prescription.status === 'new' && (
                          <Button 
                            size="sm" 
                            className="bg-blue-500 hover:bg-blue-600"
                            onClick={() => {
                              // Update prescription status to processing
                              setPrescriptionStatuses(prev => {
                                const updated = { ...prev, [prescription.id]: 'processing' };
                                localStorage.setItem('pharmacy-prescription-statuses', JSON.stringify(updated));
                                return updated;
                              });
                              
                              // Set flash effect
                              setUpdatedPrescriptionId(prescription.id);
                              setTimeout(() => setUpdatedPrescriptionId(null), 3000);
                              
                              alert(`🔄 PRESCRIPTION PROCESSING STARTED\n\n👤 Patient: ${prescription.patientName}\n💊 Medication: ${prescription.medicationName}\n📊 Status: NEW → PROCESSING\n\n✅ Processing workflow initiated:\n• Insurance verification\n• Drug interaction check\n• Medication preparation\n• Quality control\n\n⏱️ Estimated completion: 15-30 minutes`);
                            }}
                          >
                            Start Processing
                          </Button>
                        )}
                        
                        {prescription.status === 'processing' && (
                          <Button 
                            size="sm" 
                            className="bg-green-500 hover:bg-green-600"
                            onClick={() => {
                              // Update prescription status to ready
                              setPrescriptionStatuses(prev => {
                                const updated = { ...prev, [prescription.id]: 'ready' };
                                localStorage.setItem('pharmacy-prescription-statuses', JSON.stringify(updated));
                                return updated;
                              });
                              
                              // Set flash effect
                              setUpdatedPrescriptionId(prescription.id);
                              setTimeout(() => setUpdatedPrescriptionId(null), 3000);
                              
                              alert(`✅ PRESCRIPTION READY FOR PICKUP\n\n👤 Patient: ${prescription.patientName}\n💊 Medication: ${prescription.medicationName}\n📊 Status: PROCESSING → READY\n\n🎉 Prescription completed successfully:\n• Insurance verified ✓\n• Medication prepared ✓\n• Quality checked ✓\n• Ready for patient pickup ✓\n\n📞 Patient notification sent`);
                            }}
                          >
                            Mark Ready
                          </Button>
                        )}
                        
                        {prescription.status === 'ready' && (
                          <Button 
                            size="sm" 
                            className="bg-purple-500 hover:bg-purple-600"
                            onClick={() => {
                              // Update prescription status to dispensed
                              setPrescriptionStatuses(prev => {
                                const updated = { ...prev, [prescription.id]: 'dispensed' };
                                localStorage.setItem('pharmacy-prescription-statuses', JSON.stringify(updated));
                                return updated;
                              });
                              
                              // Set flash effect
                              setUpdatedPrescriptionId(prescription.id);
                              setTimeout(() => setUpdatedPrescriptionId(null), 3000);
                              
                              // Generate receipt
                              const receiptContent = `
                                <!DOCTYPE html>
                                <html>
                                <head>
                                  <title>Prescription Receipt</title>
                                  <style>
                                    body { font-family: Arial, sans-serif; max-width: 450px; margin: 0 auto; padding: 20px; }
                                    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
                                    .pharmacy-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
                                  </style>
                                </head>
                                <body>
                                  <div class="header">
                                    <div class="pharmacy-name">DEO PHARMACY</div>
                                    <p>123 Healthcare Blvd, Medical Center<br>Phone: (555) 123-4567</p>
                                  </div>
                                  <div>
                                    <p><strong>Patient:</strong> ${prescription.patientName}</p>
                                    <p><strong>Medication:</strong> ${prescription.medicationName}</p>
                                    <p><strong>Prescribed by:</strong> ${prescription.prescribedBy}</p>
                                    <p><strong>Dispensed:</strong> ${new Date().toLocaleString()}</p>
                                  </div>
                                </body>
                                </html>
                              `;
                              
                              const receiptWindow = window.open('', '_blank', 'width=600,height=800');
                              if (receiptWindow) {
                                receiptWindow.document.write(receiptContent);
                                receiptWindow.document.close();
                                receiptWindow.print();
                              }
                              
                              alert(`💊 PRESCRIPTION DISPENSED\n\n👤 Patient: ${prescription.patientName}\n💊 Medication: ${prescription.medicationName}\n📊 Status: READY → DISPENSED\n\n🎉 Successfully dispensed:\n• Patient ID verified ✓\n• Medication dispensed ✓\n• Receipt generated ✓\n• Transaction complete ✓\n\n🖨️ Receipt printed for patient records`);
                            }}
                          >
                            Dispense
                          </Button>
                        )}
                        
                        {prescription.status === 'dispensed' && (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                            COMPLETED
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {localInventoryItems.map((item) => (
                  <div key={item.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="font-semibold text-lg">{item.name}</h3>
                          <Badge 
                            variant="secondary"
                            className={
                              item.status === 'in_stock' ? 'bg-green-100 text-green-800' :
                              item.status === 'low_stock' ? 'bg-yellow-100 text-yellow-800' :
                              item.status === 'out_of_stock' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }
                          >
                            {item.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-1"><strong>Generic:</strong> {item.genericName}</p>
                        <p className="text-gray-600 mb-1"><strong>Strength:</strong> {item.strength} {item.form}</p>
                        <p className="text-gray-600 mb-1"><strong>Current Stock:</strong> {item.currentStock} units</p>
                        <p className="text-gray-600 mb-1"><strong>Supplier:</strong> {item.supplier}</p>
                        <p className="text-sm text-gray-500">Expires: {item.expiryDate}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => alert(`📦 INVENTORY DETAILS\n\n${item.name} (${item.genericName})\n\nStrength: ${item.strength}\nForm: ${item.form}\nCurrent Stock: ${item.currentStock} units\nMin Stock: ${item.minStock} units\nMax Stock: ${item.maxStock} units\nCost: $${item.cost.toFixed(2)}\nPrice: $${item.price.toFixed(2)}\nSupplier: ${item.supplier}\nBatch: ${item.batchNumber}\nExpiry: ${item.expiryDate}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => alert(`✏️ EDIT INVENTORY\n\nEditing ${item.name}\n\nCurrent Stock: ${item.currentStock}\nMin Stock: ${item.minStock}\nMax Stock: ${item.maxStock}\nCost: $${item.cost.toFixed(2)}\nPrice: $${item.price.toFixed(2)}\n\nInventory editing form would open here.`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        {(item.status === 'low_stock' || item.status === 'out_of_stock') && (
                          <Button 
                            size="sm" 
                            className="bg-blue-500 hover:bg-blue-600"
                            onClick={() => {
                              const reorderQty = item.maxStock - item.currentStock;
                              const totalCost = reorderQty * item.cost;
                              
                              // Update inventory
                              setLocalInventoryItems(prev => 
                                prev.map(i => 
                                  i.id === item.id 
                                    ? { ...i, currentStock: i.currentStock + reorderQty, status: 'in_stock' as const }
                                    : i
                                )
                              );
                              
                              alert(`🛒 REORDER PLACED\n\n📦 Item: ${item.name}\n📊 Quantity: ${reorderQty} units\n💰 Total Cost: $${totalCost.toFixed(2)}\n🏪 Supplier: ${item.supplier}\n\n✅ Order confirmed\n🚚 Expected delivery: 3-5 business days\n📈 New stock level: ${item.currentStock + reorderQty} units`);
                            }}
                          >
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Reorder
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pharmacy Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button 
                  className="h-20 flex flex-col items-center justify-center bg-blue-500 hover:bg-blue-600"
                  onClick={() => alert('📊 DAILY SALES REPORT\n\nGenerating daily sales report...\n\nToday\'s Summary:\n• Total Sales: $2,450.75\n• Prescriptions Filled: 45\n• Average Sale: $54.46\n• Insurance Claims: 38\n• Cash Sales: 7\n\n📄 Report would be generated in PDF format')}
                >
                  <FileText className="h-6 w-6 mb-2" />
                  Daily Sales Report
                </Button>
                
                <Button 
                  className="h-20 flex flex-col items-center justify-center bg-green-500 hover:bg-green-600"
                  onClick={() => alert('📋 INVENTORY REPORT\n\nGenerating inventory report...\n\nInventory Summary:\n• Total Items: 150\n• In Stock: 142\n• Low Stock: 6\n• Out of Stock: 2\n• Total Value: $45,280.30\n\n📄 Detailed inventory report would be generated')}
                >
                  <Package className="h-6 w-6 mb-2" />
                  Inventory Report
                </Button>
                
                <Button 
                  className="h-20 flex flex-col items-center justify-center bg-purple-500 hover:bg-purple-600"
                  onClick={() => alert('💊 PRESCRIPTION REPORT\n\nGenerating prescription report...\n\nPrescription Summary:\n• Total Prescriptions: 247\n• Pending: 23\n• Ready: 12\n• Dispensed Today: 45\n• Insurance Verified: 210\n\n📄 Prescription activity report would be generated')}
                >
                  <Pill className="h-6 w-6 mb-2" />
                  Prescription Report
                </Button>
                
                <Button 
                  className="h-20 flex flex-col items-center justify-center bg-indigo-500 hover:bg-indigo-600"
                  onClick={() => alert('🏥 INSURANCE CLAIMS REPORT\n\nGenerating insurance claims report...\n\nClaims Summary:\n• Total Claims: 156\n• Approved: 142\n• Pending: 10\n• Rejected: 4\n• Total Value: $38,450.25\n\n📄 Insurance claims report would be generated')}
                >
                  <FileText className="h-6 w-6 mb-2" />
                  Insurance Claims
                </Button>
                
                <Button 
                  className="h-20 flex flex-col items-center justify-center bg-yellow-500 hover:bg-yellow-600"
                  onClick={() => alert('👥 PATIENT REPORT\n\nGenerating patient report...\n\nPatient Summary:\n• Active Patients: 1,834\n• New This Month: 45\n• Repeat Customers: 1,789\n• Average Age: 52 years\n• Most Common Rx: Metformin\n\n📄 Patient demographics report would be generated')}
                >
                  <Users className="h-6 w-6 mb-2" />
                  Patient Report
                </Button>
                
                <Button 
                  className="h-20 flex flex-col items-center justify-center bg-red-500 hover:bg-red-600"
                  onClick={() => alert('📈 FINANCIAL REPORT\n\nGenerating financial report...\n\nFinancial Summary:\n• Monthly Revenue: $67,245.30\n• Profit Margin: 28.5%\n• Cost of Goods: $48,120.15\n• Operating Expenses: $12,350.00\n• Net Profit: $6,775.15\n\n📄 Detailed financial report would be generated')}
                >
                  <DollarSign className="h-6 w-6 mb-2" />
                  Financial Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}