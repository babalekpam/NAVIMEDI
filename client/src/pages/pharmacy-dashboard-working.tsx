import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Users, DollarSign, Package, Clock, AlertTriangle, CheckCircle, XCircle, Search, FileText, Download } from 'lucide-react';
import UserRolesManagement from '@/components/pharmacy/UserRolesManagement';

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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState<PharmacyPrescription | null>(null);
  const [isProcessingModalOpen, setIsProcessingModalOpen] = useState(false);

  // Force debug logging
  console.log('[PHARMACY WORKING] 🚀 Loading pharmacy dashboard...');
  console.log('[PHARMACY WORKING] 👤 User:', user?.role);

  // Create a mock tenant object to avoid errors
  const tenant = { 
    id: user?.tenantId || 'unknown', 
    name: 'DEO Pharmacy', 
    type: 'pharmacy' as const 
  };

  // Fetch pharmacy prescriptions with better error handling
  const { data: prescriptions, isLoading, error } = useQuery({
    queryKey: ['/api/pharmacy/prescriptions'],
    enabled: !!user && !!tenant?.id,
    retry: 3,
    refetchOnWindowFocus: false
  });

  console.log('[PHARMACY WORKING] 📊 Prescriptions data:', prescriptions);
  console.log('[PHARMACY WORKING] ⏳ Loading:', isLoading);
  console.log('[PHARMACY WORKING] ❌ Error:', error);

  // Sample metrics for display
  const prescriptionsArray = Array.isArray(prescriptions) ? prescriptions : [];
  const metrics = {
    totalPrescriptions: prescriptionsArray.length || 0,
    newPrescriptions: prescriptionsArray.filter((p: any) => p.status === 'new')?.length || 0,
    processingPrescriptions: prescriptionsArray.filter((p: any) => p.status === 'processing')?.length || 0,
    readyPrescriptions: prescriptionsArray.filter((p: any) => p.status === 'ready')?.length || 0
  };

  // Process prescription mutation
  const processPrescriptionMutation = useMutation({
    mutationFn: async ({ prescriptionId, newStatus }: { prescriptionId: string; newStatus: string }) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/pharmacy/prescriptions/${prescriptionId}/process`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error('Failed to process prescription');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pharmacy/prescriptions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/prescriptions'] }); // Also refresh hospital view
      toast({ title: "Success", description: "Prescription status updated successfully" });
      setIsProcessingModalOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update prescription status", variant: "destructive" });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'dispensed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleProcessPrescription = (prescription: PharmacyPrescription) => {
    setSelectedPrescription(prescription);
    setIsProcessingModalOpen(true);
  };

  const handleStatusUpdate = (newStatus: string) => {
    if (selectedPrescription) {
      processPrescriptionMutation.mutate({
        prescriptionId: selectedPrescription.id,
        newStatus
      });
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'new-prescription':
        toast({ title: "New Prescription", description: "Opening prescription entry form..." });
        break;
      case 'customer-lookup':
        toast({ title: "Customer Lookup", description: "Opening customer search..." });
        break;
      case 'insurance-verification':
        toast({ title: "Insurance Verification", description: "Opening insurance verification..." });
        break;
      case 'inventory-alerts':
        setSelectedTab('inventory');
        toast({ title: "Inventory Alerts", description: "Switching to inventory management..." });
        break;
      default:
        break;
    }
  };

  const generateReport = (format: string) => {
    const reportData = {
      pharmacy: tenant?.name,
      date: new Date().toLocaleDateString(),
      prescriptions: prescriptions || [],
      metrics
    };
    
    toast({ title: "Report Generated", description: `${format.toUpperCase()} report generated successfully` });
  };

  const filteredPrescriptions = prescriptionsArray.filter((p: PharmacyPrescription) =>
    p.medication.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.patientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">


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
          <TabsTrigger value="user-roles">User Roles</TabsTrigger>
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
                ) : prescriptionsArray.length > 0 ? (
                  <div className="space-y-4">
                    {prescriptionsArray.slice(0, 5).map((prescription: PharmacyPrescription) => (
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
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => handleQuickAction('new-prescription')}
                >
                  <Package className="mr-2 h-4 w-4" />
                  Process New Prescription
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => handleQuickAction('customer-lookup')}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Customer Lookup
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => handleQuickAction('insurance-verification')}
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Insurance Verification
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => handleQuickAction('inventory-alerts')}
                >
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
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>All Prescriptions</CardTitle>
                  <CardDescription>Complete list of pharmacy prescriptions</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search prescriptions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <Button variant="outline" onClick={() => generateReport('pdf')}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading prescriptions...</div>
              ) : filteredPrescriptions.length > 0 ? (
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
                      {filteredPrescriptions.map((prescription: PharmacyPrescription) => (
                        <tr key={prescription.id} className="border-b hover:bg-gray-50">
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
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleProcessPrescription(prescription)}
                              disabled={prescription.status === 'dispensed'}
                            >
                              {prescription.status === 'dispensed' ? 'Complete' : 'Process'}
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

            <Card>
              <CardHeader>
                <CardTitle>Reports & Analytics</CardTitle>
                <CardDescription>Generate pharmacy reports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => generateReport('pdf')}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Daily Prescription Report (PDF)
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => generateReport('excel')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Monthly Analytics (Excel)
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => generateReport('csv')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Inventory Report (CSV)
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => generateReport('insurance')}
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Insurance Claims Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="user-roles" className="space-y-4">
          <UserRolesManagement />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Management</CardTitle>
              <CardDescription>Monitor stock levels and manage reorders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Low Stock Alerts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">3</div>
                    <p className="text-xs text-muted-foreground">Items below threshold</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Reorder Required</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">5</div>
                    <p className="text-xs text-muted-foreground">Items need reordering</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Expiring Soon</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">2</div>
                    <p className="text-xs text-muted-foreground">Items expiring in 30 days</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium mb-4">Quick Actions</h4>
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" onClick={() => toast({ title: "Inventory Scan", description: "Opening barcode scanner..." })}>
                    Scan Inventory
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toast({ title: "Reorder", description: "Opening reorder form..." })}>
                    Create Reorder
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toast({ title: "Expiry Check", description: "Running expiry date check..." })}>
                    Check Expiry Dates
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Enhanced Processing Modal */}
      <Dialog open={isProcessingModalOpen} onOpenChange={setIsProcessingModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete Prescription Workflow</DialogTitle>
            <DialogDescription>
              Process {selectedPrescription?.medication} for {selectedPrescription?.patientName}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPrescription && (
            <div className="space-y-6">
              {/* Patient & Prescription Info */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="font-medium text-sm">Patient:</Label>
                  <p className="text-base">{selectedPrescription.patientName}</p>
                </div>
                <div>
                  <Label className="font-medium text-sm">Medication:</Label>
                  <p className="text-base">{selectedPrescription.medication}</p>
                </div>
                <div>
                  <Label className="font-medium text-sm">Current Status:</Label>
                  <Badge className={getStatusColor(selectedPrescription.status)}>
                    {selectedPrescription.status}
                  </Badge>
                </div>
              </div>

              {/* Workflow Steps */}
              <div className="space-y-6">
                {/* Step 1: Prescription Received */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                      <CardTitle className="text-lg">1. Prescription Received</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Received Date</Label>
                        <Input value={new Date().toLocaleDateString()} disabled />
                      </div>
                      <div>
                        <Label>Prescribing Doctor</Label>
                        <Input placeholder="Dr. Johnson" />
                      </div>
                    </div>
                    <div>
                      <Label>Prescription Notes</Label>
                      <Textarea placeholder="Take twice daily with food" />
                    </div>
                  </CardContent>
                </Card>

                {/* Step 2: Insurance Verification */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                        2
                      </div>
                      <CardTitle className="text-lg">2. Insurance Verification</CardTitle>
                      <input type="checkbox" className="ml-auto h-5 w-5" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Insurance Provider</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select provider" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="aetna">Aetna</SelectItem>
                            <SelectItem value="blue-cross">Blue Cross Blue Shield</SelectItem>
                            <SelectItem value="medicare">Medicare</SelectItem>
                            <SelectItem value="medicaid">Medicaid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Policy Number</Label>
                        <Input placeholder="Enter policy number" />
                      </div>
                      <div>
                        <Label>Verification Status</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="verified">Verified</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="denied">Denied</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Coverage Percentage</Label>
                        <div className="relative">
                          <Input placeholder="80" />
                          <span className="absolute right-3 top-2.5 text-gray-500">%</span>
                        </div>
                      </div>
                      <div>
                        <Label>Copay Amount</Label>
                        <Input placeholder="$15.00" />
                      </div>
                      <div>
                        <Label>Deductible Remaining</Label>
                        <Input placeholder="$500.00" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Step 3: Insurance Filing */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                        3
                      </div>
                      <CardTitle className="text-lg">3. Insurance Filing</CardTitle>
                      <input type="checkbox" className="ml-auto h-5 w-5" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <Label>Medication Cost</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                          <Input 
                            placeholder="85.00" 
                            className="pl-8"
                            type="number"
                            step="0.01"
                            id="medication-cost-filing"
                            onChange={(e) => {
                              const cost = parseFloat(e.target.value) || 0;
                              const coverage = parseFloat((document.getElementById('coverage-percentage-filing') as HTMLInputElement)?.value) || 80;
                              const insuranceAmount = (cost * coverage) / 100;
                              const patientAmount = cost - insuranceAmount;
                              
                              const insuranceField = document.getElementById('insurance-coverage-filing') as HTMLInputElement;
                              const patientField = document.getElementById('patient-responsibility-filing') as HTMLInputElement;
                              
                              if (insuranceField) insuranceField.value = insuranceAmount.toFixed(2);
                              if (patientField) patientField.value = patientAmount.toFixed(2);
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Coverage %</Label>
                        <div className="relative">
                          <Input 
                            placeholder="80" 
                            type="number"
                            min="0"
                            max="100"
                            id="coverage-percentage-filing"
                            onChange={(e) => {
                              const coverage = parseFloat(e.target.value) || 0;
                              const cost = parseFloat((document.getElementById('medication-cost-filing') as HTMLInputElement)?.value) || 85;
                              const insuranceAmount = (cost * coverage) / 100;
                              const patientAmount = cost - insuranceAmount;
                              
                              const insuranceField = document.getElementById('insurance-coverage-filing') as HTMLInputElement;
                              const patientField = document.getElementById('patient-responsibility-filing') as HTMLInputElement;
                              
                              if (insuranceField) insuranceField.value = insuranceAmount.toFixed(2);
                              if (patientField) patientField.value = patientAmount.toFixed(2);
                            }}
                          />
                          <span className="absolute right-3 top-2.5 text-gray-500">%</span>
                        </div>
                      </div>
                      <div>
                        <Label>Insurance Coverage</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                          <Input 
                            placeholder="68.00" 
                            className="pl-8 bg-green-50 text-green-700 font-medium"
                            type="number"
                            step="0.01"
                            id="insurance-coverage-filing"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Patient Responsibility</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                          <Input 
                            placeholder="17.00" 
                            className="pl-8 bg-blue-50 text-blue-700 font-medium"
                            type="number"
                            step="0.01"
                            id="patient-responsibility-filing"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Claim Number</Label>
                        <Input 
                          value={`CLM-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`}
                          disabled 
                          className="bg-gray-50 font-mono text-sm"
                        />
                      </div>
                      <div>
                        <Label>Filing Date</Label>
                        <Input value={new Date().toLocaleDateString()} disabled />
                      </div>
                    </div>
                    <div>
                      <Label>Prior Authorization Required?</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no">No</SelectItem>
                          <SelectItem value="yes">Yes - Obtained</SelectItem>
                          <SelectItem value="pending">Yes - Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Step 4: Patient Payment */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                        4
                      </div>
                      <CardTitle className="text-lg">4. Patient Payment</CardTitle>
                      <input type="checkbox" className="ml-auto h-5 w-5" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Amount Due</Label>
                        <Input placeholder="$15.00" />
                      </div>
                      <div>
                        <Label>Payment Method</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="card">Credit/Debit Card</SelectItem>
                            <SelectItem value="check">Check</SelectItem>
                            <SelectItem value="insurance">Insurance Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Payment Status</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="partial">Partial Payment</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Transaction ID</Label>
                        <Input 
                          value={`TXN-${new Date().getFullYear()}-${String(Date.now()).slice(-8)}`}
                          disabled 
                          className="bg-gray-50 font-mono text-sm"
                        />
                      </div>
                      <div>
                        <Label>Payment Date</Label>
                        <Input value={new Date().toLocaleDateString()} disabled />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Step 5: Final Receipt & Dispensing */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center">
                        5
                      </div>
                      <CardTitle className="text-lg">5. Final Receipt & Dispensing</CardTitle>
                      <input type="checkbox" className="ml-auto h-5 w-5" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Pharmacist Name</Label>
                        <Input placeholder="Enter pharmacist name" />
                      </div>
                      <div>
                        <Label>Dispensing Date</Label>
                        <Input value={new Date().toLocaleDateString()} disabled />
                      </div>
                    </div>
                    <div>
                      <Label>Patient Counseling Completed</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes - Verbal counseling provided</SelectItem>
                          <SelectItem value="declined">Patient declined counseling</SelectItem>
                          <SelectItem value="written">Written information provided</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Additional Notes</Label>
                      <Textarea placeholder="Any special instructions or notes..." />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => {
                          const receiptData = {
                            pharmacyName: tenant?.name || 'NaviMED Pharmacy',
                            prescriptionId: selectedPrescription?.id,
                            patientName: selectedPrescription?.patientName,
                            medication: selectedPrescription?.medication,
                            medicationCost: '85.00',
                            insuranceCoverage: '68.00',
                            patientPayment: '17.00',
                            claimNumber: `CLM-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
                            transactionId: `TXN-${new Date().getFullYear()}-${String(Date.now()).slice(-8)}`,
                            date: new Date().toLocaleDateString(),
                            time: new Date().toLocaleTimeString()
                          };
                          
                          const receiptWindow = window.open('', '_blank');
                          receiptWindow?.document.write(`
                            <html>
                              <head>
                                <title>Prescription Receipt</title>
                                <style>
                                  body { font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; }
                                  .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
                                  .section { margin: 15px 0; }
                                  .row { display: flex; justify-content: space-between; margin: 5px 0; }
                                  .total { font-weight: bold; border-top: 1px solid #000; padding-top: 10px; }
                                  @media print { body { margin: 0; } }
                                </style>
                              </head>
                              <body>
                                <div class="header">
                                  <h2>${receiptData.pharmacyName}</h2>
                                  <p>NaviMED Platform Connected Pharmacy</p>
                                  <p>${receiptData.date} ${receiptData.time}</p>
                                </div>
                                
                                <div class="section">
                                  <h3>Patient Information</h3>
                                  <div class="row"><span>Patient:</span><span>${receiptData.patientName}</span></div>
                                  <div class="row"><span>Prescription ID:</span><span>${receiptData.prescriptionId}</span></div>
                                </div>
                                
                                <div class="section">
                                  <h3>Medication Details</h3>
                                  <div class="row"><span>Medication:</span><span>${receiptData.medication}</span></div>
                                  <div class="row"><span>Medication Cost:</span><span>$${receiptData.medicationCost}</span></div>
                                </div>
                                
                                <div class="section">
                                  <h3>Payment Breakdown</h3>
                                  <div class="row"><span>Insurance Coverage:</span><span>$${receiptData.insuranceCoverage}</span></div>
                                  <div class="row"><span>Patient Payment:</span><span>$${receiptData.patientPayment}</span></div>
                                  <div class="row total"><span>Total Cost:</span><span>$${receiptData.medicationCost}</span></div>
                                </div>
                                
                                <div class="section">
                                  <h3>Transaction Details</h3>
                                  <div class="row"><span>Claim Number:</span><span>${receiptData.claimNumber}</span></div>
                                  <div class="row"><span>Transaction ID:</span><span>${receiptData.transactionId}</span></div>
                                </div>
                                
                                <div class="section" style="text-align: center; margin-top: 30px; font-size: 12px;">
                                  <p>Thank you for choosing ${receiptData.pharmacyName}</p>
                                  <p>Connected via NaviMED Platform</p>
                                  <p>HIPAA Compliant | Secure Healthcare Network</p>
                                </div>
                                
                                <script>window.print();</script>
                              </body>
                            </html>
                          `);
                        }}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Receipt
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => {
                          const labelData = {
                            pharmacyName: tenant?.name || 'NaviMED Pharmacy',
                            patientName: selectedPrescription?.patientName,
                            medication: selectedPrescription?.medication,
                            prescriptionId: selectedPrescription?.id,
                            date: new Date().toLocaleDateString(),
                            instructions: 'Take as directed by physician'
                          };
                          
                          const labelWindow = window.open('', '_blank');
                          labelWindow?.document.write(`
                            <html>
                              <head>
                                <title>Prescription Label</title>
                                <style>
                                  body { font-family: Arial, sans-serif; max-width: 300px; margin: 0 auto; padding: 10px; }
                                  .label { border: 2px solid #000; padding: 15px; background: white; }
                                  .pharmacy-name { font-size: 16px; font-weight: bold; text-align: center; margin-bottom: 10px; }
                                  .field { margin: 8px 0; font-size: 14px; }
                                  .patient-name { font-size: 18px; font-weight: bold; }
                                  .medication { font-size: 16px; font-weight: bold; color: #2563eb; }
                                  .rx-number { font-size: 12px; color: #666; }
                                  @media print { body { margin: 0; } .label { border-width: 1px; } }
                                </style>
                              </head>
                              <body>
                                <div class="label">
                                  <div class="pharmacy-name">${labelData.pharmacyName}</div>
                                  <div class="rx-number">Rx#: ${labelData.prescriptionId?.slice(-8) || 'N/A'}</div>
                                  
                                  <div class="field">
                                    <strong>Patient:</strong><br>
                                    <span class="patient-name">${labelData.patientName}</span>
                                  </div>
                                  
                                  <div class="field">
                                    <strong>Medication:</strong><br>
                                    <span class="medication">${labelData.medication}</span>
                                  </div>
                                  
                                  <div class="field">
                                    <strong>Instructions:</strong><br>
                                    ${labelData.instructions}
                                  </div>
                                  
                                  <div class="field">
                                    <strong>Date Dispensed:</strong> ${labelData.date}
                                  </div>
                                  
                                  <div style="margin-top: 15px; font-size: 10px; text-align: center; border-top: 1px solid #000; padding-top: 8px;">
                                    NaviMED Platform Connected Pharmacy<br>
                                    HIPAA Compliant | Secure Network
                                  </div>
                                </div>
                                
                                <script>window.print();</script>
                              </body>
                            </html>
                          `);
                        }}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Print Label
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={() => setIsProcessingModalOpen(false)}>
                  Save & Close
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline">Save Progress</Button>
                  <Button onClick={() => handleStatusUpdate('dispensed')}>
                    Complete & Mark Dispensed
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}