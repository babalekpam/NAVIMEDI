import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InsuranceCoverageCalculator } from "@/components/forms/insurance-coverage-calculator";
import { useAuth } from "@/contexts/auth-context";
import { useTenant } from "@/contexts/tenant-context";
import { useTranslation } from "@/contexts/translation-context";
import { useToast } from "@/hooks/use-toast";
import { PrescriptionForm } from "@/components/forms/prescription-form";
import { Activity, Users, DollarSign, Package, Clock, AlertTriangle, CheckCircle, XCircle, Search, FileText, Download, Pill, Plus, RefreshCw, ArrowLeftRight } from 'lucide-react';

interface Prescription {
  id: string;
  patientName: string;
  patientId: string;
  medication: string;
  dosage: string;
  frequency: string;
  quantity: number;
  refills: number;
  instructions: string;
  status: string;
  prescribedDate: string;
  expiryDate: string;
  providerId: string;
  providerName: string;
  insuranceProvider?: string;
  insuranceCopay?: number;
  insuranceCoveragePercentage?: number;
  totalCost?: number;
  pharmacyNotes?: string;
}

export default function PrescriptionsPage() {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [isProcessingModalOpen, setIsProcessingModalOpen] = useState(false);
  const [isViewDetailsModalOpen, setIsViewDetailsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("new"); // For prescription tabs

  // Fetch prescriptions for current tenant (hospital or pharmacy)
  const { data: prescriptions = [], isLoading } = useQuery<Prescription[]>({
    queryKey: ['/api/prescriptions'],
    enabled: !!tenant?.id,
  });

  // Fetch patients for prescription creation
  const { data: patients = [] } = useQuery({
    queryKey: ['/api/patients'],
    enabled: !!tenant?.id,
  });

  // Status update mutation using general API
  const statusUpdateMutation = useMutation({
    mutationFn: async ({ prescriptionId, status }: { prescriptionId: string; status: string }) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/prescriptions/${prescriptionId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update prescription status');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prescriptions'] });
      toast({
        title: "Success",
        description: "Prescription status updated successfully",
      });
      setIsProcessingModalOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update prescription status",
        variant: "destructive",
      });
    },
  });

  // Create prescription mutation
  const createPrescriptionMutation = useMutation({
    mutationFn: async (prescriptionData: any) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(prescriptionData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create prescription');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prescriptions'] });
      toast({
        title: "Success",
        description: "Prescription created successfully",
      });
      setIsCreateModalOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create prescription",
        variant: "destructive",
      });
    },
  });

  // Filter out dispensed prescriptions for active processing (like pharmacy dashboard)
  const activePrescriptions = prescriptions.filter((prescription) => prescription.status !== 'dispensed');
  
  // Apply search and status filters to active prescriptions
  const filteredPrescriptions = activePrescriptions.filter((prescription) => {
    const matchesSearch = (prescription.medication || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (prescription.patientName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || prescription.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'prescribed':
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'dispensed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusUpdate = (status: string) => {
    if (selectedPrescription) {
      statusUpdateMutation.mutate({
        prescriptionId: selectedPrescription.id,
        status,
      });
    }
  };

  const handleProcessPrescription = (prescription: Prescription) => {
    console.log('🔧 Process prescription:', prescription.patientName, prescription.medication);
    setSelectedPrescription(prescription);
    setIsProcessingModalOpen(true);
    console.log('✅ Process modal opened');
  };

  const handleViewDetails = (prescription: Prescription) => {
    console.log('👁️ View details for:', prescription.patientName, prescription.medication);
    setSelectedPrescription(prescription);
    setIsViewDetailsModalOpen(true);
    console.log('✅ View Details modal opened');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p>Loading prescriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prescription Management</h1>
          <p className="text-gray-600 mt-1">
            {tenant?.type === 'pharmacy' 
              ? 'Receive and process prescriptions from hospitals and doctors'
              : 'Manage and track prescriptions across the healthcare network'
            }
          </p>
        </div>
        {/* Only doctors/physicians from hospitals can create prescriptions - pharmacies receive prescriptions */}
        {(user?.role === 'doctor' || user?.role === 'physician' || user?.role === 'nurse' || user?.role === 'tenant_admin' || user?.role === 'director' || (user?.role === 'super_admin' && tenant?.type !== 'pharmacy')) && tenant?.type !== 'pharmacy' && (
          <Button onClick={() => setIsCreateModalOpen(true)} data-testid="button-create-prescription">
            <Plus className="mr-2 h-4 w-4" />
            New Prescription
          </Button>
        )}
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prescriptions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePrescriptions.length}</div>
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
            <div className="text-2xl font-bold text-blue-600">
              {activePrescriptions.filter((p) => ['prescribed', 'new'].includes(p.status)).length}
            </div>
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
            <div className="text-2xl font-bold text-yellow-600">
              {activePrescriptions.filter((p) => p.status === 'processing').length}
            </div>
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
            <div className="text-2xl font-bold text-green-600">
              {activePrescriptions.filter((p) => p.status === 'ready').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Ready for dispensing
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Prescription Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="new" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            New Prescriptions
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Pill className="h-4 w-4" />
            Active Prescriptions
          </TabsTrigger>
          <TabsTrigger value="refills" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Prescription Refills
          </TabsTrigger>
          <TabsTrigger value="transfers" className="flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4" />
            Prescription Transfers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-6">

          {/* New Prescriptions Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                New Prescriptions
              </CardTitle>
              <CardDescription>
                Recently received prescriptions awaiting processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const newPrescriptions = prescriptions.filter((p) => 
                  ['prescribed', 'new', 'sent_to_pharmacy', 'received'].includes(p.status)
                );
                
                return newPrescriptions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Medication</TableHead>
                        <TableHead>Dosage</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Prescribed Date</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {newPrescriptions.map((prescription) => (
                        <TableRow key={prescription.id}>
                          <TableCell className="font-medium">
                            {prescription.patientName}
                          </TableCell>
                          <TableCell>{prescription.medication}</TableCell>
                          <TableCell>{prescription.dosage}</TableCell>
                          <TableCell>{prescription.quantity}</TableCell>
                          <TableCell>
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                              NEW
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(prescription.prescribedDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{prescription.providerName || 'N/A'}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <button
                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                onClick={() => alert(`PROCESSING:\nPatient: ${prescription.patientName}\nMedication: ${prescription.medication}\nDosage: ${prescription.dosage}\nStatus: ${prescription.status}`)}
                              >
                                Process
                              </button>
                              <button
                                className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                                onClick={() => alert(`DETAILS:\nPatient: ${prescription.patientName}\nMedication: ${prescription.medication}\nDosage: ${prescription.dosage}\nQuantity: ${prescription.quantity}\nInstructions: ${prescription.instructions}\nPrescribed: ${new Date(prescription.prescribedDate).toLocaleDateString()}\nProvider: ${prescription.providerName}`)}
                              >
                                View Details
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Package className="mx-auto h-8 w-8 text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">No new prescriptions</p>
                    <p className="text-sm text-gray-400">New prescriptions will appear here when received</p>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Prescription Search & Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search Prescriptions</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search by medication or patient name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-48">
                  <Label htmlFor="status-filter">Filter by Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="prescribed">Prescribed</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="dispensed">Dispensed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

      {/* Prescriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Prescription List</CardTitle>
          <CardDescription>
            {filteredPrescriptions.length} active prescription(s) found (archived prescriptions excluded)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Medication</TableHead>
                <TableHead>Dosage</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prescribed Date</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPrescriptions.map((prescription) => (
                <TableRow key={prescription.id}>
                  <TableCell className="font-medium">
                    {prescription.patientName}
                  </TableCell>
                  <TableCell>{prescription.medication}</TableCell>
                  <TableCell>{prescription.dosage}</TableCell>
                  <TableCell>{prescription.quantity}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(prescription.status)}>
                      {prescription.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(prescription.prescribedDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{prescription.providerName || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleProcessPrescription(prescription)}
                      >
                        Process
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewDetails(prescription)}
                        data-testid={`button-view-details-${prescription.id}`}
                      >
                        View Details
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Processing Modal */}
      <Dialog open={isProcessingModalOpen} onOpenChange={setIsProcessingModalOpen}>
        <DialogContent className="max-w-2xl" style={{ zIndex: 99999, position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white' }}>
          <DialogHeader>
            <DialogTitle>Process Prescription</DialogTitle>
            <DialogDescription>
              Update the status for {selectedPrescription?.medication}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPrescription && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="font-medium">Patient:</Label>
                  <p>{selectedPrescription.patientName}</p>
                </div>
                <div>
                  <Label className="font-medium">Current Status:</Label>
                  <Badge className={getStatusColor(selectedPrescription.status)}>
                    {selectedPrescription.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label className="font-medium">Medication Details:</Label>
                <div className="bg-gray-50 p-3 rounded mt-1">
                  <p><strong>Medication:</strong> {selectedPrescription.medication}</p>
                  <p><strong>Dosage:</strong> {selectedPrescription.dosage}</p>
                  <p><strong>Frequency:</strong> {selectedPrescription.frequency}</p>
                  <p><strong>Quantity:</strong> {selectedPrescription.quantity}</p>
                  <p><strong>Refills:</strong> {selectedPrescription.refills}</p>
                  {selectedPrescription.instructions && (
                    <p><strong>Instructions:</strong> {selectedPrescription.instructions}</p>
                  )}
                  {selectedPrescription.insuranceProvider && (
                    <p><strong>Insurance:</strong> {selectedPrescription.insuranceProvider}</p>
                  )}
                  {selectedPrescription.insuranceCopay && (
                    <p><strong>Copay:</strong> ${selectedPrescription.insuranceCopay}</p>
                  )}
                </div>
              </div>
              
              {/* Insurance & Coverage Information */}
              {(selectedPrescription.status === 'received' || selectedPrescription.status === 'processing') && (
                <div className="space-y-4 border-t pt-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="insurance-provider-select">Insurance Provider</Label>
                        <Select
                          defaultValue={selectedPrescription.insuranceProvider === 'Aetna' || 
                                     selectedPrescription.insuranceProvider === 'Blue Cross Blue Shield' ||
                                     selectedPrescription.insuranceProvider === 'Cigna' ||
                                     selectedPrescription.insuranceProvider === 'UnitedHealthcare' ||
                                     selectedPrescription.insuranceProvider === 'Humana' ||
                                     selectedPrescription.insuranceProvider === 'Kaiser Permanente' ? 
                                     selectedPrescription.insuranceProvider : 'other'}
                          onValueChange={(value) => {
                            const customField = document.getElementById('custom-insurance-field') as HTMLElement;
                            if (customField) {
                              customField.style.display = value === 'other' ? 'block' : 'none';
                            }
                            
                            // If a predefined option is selected, clear the custom field
                            if (value !== 'other') {
                              const customInput = document.getElementById('custom-insurance-provider') as HTMLInputElement;
                              if (customInput) {
                                customInput.value = value;
                              }
                            }
                          }}
                        >
                          <SelectTrigger id="insurance-provider-select">
                            <SelectValue placeholder="Select insurance provider" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Aetna">Aetna</SelectItem>
                            <SelectItem value="Blue Cross Blue Shield">Blue Cross Blue Shield</SelectItem>
                            <SelectItem value="Cigna">Cigna</SelectItem>
                            <SelectItem value="UnitedHealthcare">UnitedHealthcare</SelectItem>
                            <SelectItem value="Humana">Humana</SelectItem>
                            <SelectItem value="Kaiser Permanente">Kaiser Permanente</SelectItem>
                            <SelectItem value="Medicare">Medicare</SelectItem>
                            <SelectItem value="Medicaid">Medicaid</SelectItem>
                            <SelectItem value="other">Other (Enter custom provider)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Custom insurance provider field - shows when "other" is selected */}
                      <div id="custom-insurance-field" style={{ 
                        display: (selectedPrescription.insuranceProvider && 
                                 !['Aetna', 'Blue Cross Blue Shield', 'Cigna', 'UnitedHealthcare', 'Humana', 'Kaiser Permanente', 'Medicare', 'Medicaid'].includes(selectedPrescription.insuranceProvider)) ? 'block' : 'none' 
                      }}>
                        <Label htmlFor="custom-insurance-provider" className="text-blue-600">Custom Insurance Provider *</Label>
                        <Input
                          id="custom-insurance-provider"
                          placeholder="Enter exact insurance provider name (e.g., State Farm, TRICARE)"
                          defaultValue={selectedPrescription.insuranceProvider || ''}
                          className="border-blue-200 focus:border-blue-400"
                        />
                        <p className="text-sm text-blue-600 mt-1">
                          Please enter the exact name as shown on the insurance card
                        </p>
                      </div>
                    </div>
                    <InsuranceCoverageCalculator
                      initialValues={{
                        totalCost: selectedPrescription.totalCost || 85,
                        coveragePercentage: selectedPrescription.insuranceCoveragePercentage || 80
                      }}
                      onCoverageChange={(coverage) => {
                        console.log('Coverage updated:', coverage);
                        // This would be used to update the prescription data
                      }}
                    />
                  </div>
                </div>
              )}
              
              <div>
                <Label className="font-medium">Update Status:</Label>
                <div className="flex gap-2 mt-2">
                  {selectedPrescription.status === 'prescribed' && (
                    <Button onClick={() => handleStatusUpdate('sent_to_pharmacy')} size="sm">
                      Send to Pharmacy
                    </Button>
                  )}
                  {selectedPrescription.status === 'sent_to_pharmacy' && (
                    <Button onClick={() => handleStatusUpdate('received')} size="sm">
                      Mark as Received
                    </Button>
                  )}
                  {selectedPrescription.status === 'received' && (
                    <Button onClick={() => handleStatusUpdate('processing')} size="sm">
                      Start Processing
                    </Button>
                  )}
                  {selectedPrescription.status === 'processing' && (
                    <Button onClick={() => handleStatusUpdate('ready')} size="sm">
                      Mark Ready
                    </Button>
                  )}
                  {selectedPrescription.status === 'ready' && (
                    <Button onClick={() => handleStatusUpdate('dispensed')} size="sm">
                      Mark Dispensed
                    </Button>
                  )}
                  <Button 
                    onClick={() => handleStatusUpdate('cancelled')} 
                    size="sm" 
                    variant="destructive"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="notes">Processing Notes:</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about processing this prescription..."
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Details Modal */}
      <Dialog open={isViewDetailsModalOpen} onOpenChange={setIsViewDetailsModalOpen}>
        <DialogContent className="max-w-2xl" style={{ zIndex: 99999, position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white' }}>
          <DialogHeader>
            <DialogTitle>Prescription Details</DialogTitle>
            <DialogDescription>
              View complete information for {selectedPrescription?.medication}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPrescription && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="font-medium">Patient:</Label>
                  <p>{selectedPrescription.patientName}</p>
                </div>
                <div>
                  <Label className="font-medium">Current Status:</Label>
                  <Badge className={getStatusColor(selectedPrescription.status)}>
                    {selectedPrescription.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <Label className="font-medium">Prescribed Date:</Label>
                  <p>{new Date(selectedPrescription.prescribedDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="font-medium">Provider:</Label>
                  <p>{selectedPrescription.providerName || 'N/A'}</p>
                </div>
                {selectedPrescription.expiryDate && (
                  <div>
                    <Label className="font-medium">Expiry Date:</Label>
                    <p>{new Date(selectedPrescription.expiryDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
              
              <div>
                <Label className="font-medium">Medication Details:</Label>
                <div className="bg-gray-50 p-3 rounded mt-1">
                  <p><strong>Medication:</strong> {selectedPrescription.medication}</p>
                  <p><strong>Dosage:</strong> {selectedPrescription.dosage}</p>
                  <p><strong>Frequency:</strong> {selectedPrescription.frequency}</p>
                  <p><strong>Quantity:</strong> {selectedPrescription.quantity}</p>
                  <p><strong>Refills:</strong> {selectedPrescription.refills}</p>
                  {selectedPrescription.instructions && (
                    <p><strong>Instructions:</strong> {selectedPrescription.instructions}</p>
                  )}
                </div>
              </div>

              {/* Insurance Information */}
              {(selectedPrescription.insuranceProvider || selectedPrescription.insuranceCopay) && (
                <div>
                  <Label className="font-medium">Insurance Information:</Label>
                  <div className="bg-blue-50 p-3 rounded mt-1">
                    {selectedPrescription.insuranceProvider && (
                      <p><strong>Provider:</strong> {selectedPrescription.insuranceProvider}</p>
                    )}
                    {selectedPrescription.insuranceCopay && (
                      <p><strong>Copay:</strong> ${selectedPrescription.insuranceCopay}</p>
                    )}
                    {selectedPrescription.insuranceCoveragePercentage && (
                      <p><strong>Coverage:</strong> {selectedPrescription.insuranceCoveragePercentage}%</p>
                    )}
                    {selectedPrescription.totalCost && (
                      <p><strong>Total Cost:</strong> ${selectedPrescription.totalCost}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Pharmacy Notes */}
              {selectedPrescription.pharmacyNotes && (
                <div>
                  <Label className="font-medium">Pharmacy Notes:</Label>
                  <div className="bg-green-50 p-3 rounded mt-1">
                    <p>{selectedPrescription.pharmacyNotes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Prescription Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Prescription</DialogTitle>
            <DialogDescription>
              Fill out the prescription details below. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <PrescriptionForm
            onSubmit={(data) => createPrescriptionMutation.mutate(data)}
            isLoading={createPrescriptionMutation.isPending}
            patients={(patients as any) || []}
          />
        </DialogContent>
      </Dialog>
        </TabsContent>

        <TabsContent value="refills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Prescription Refills
              </CardTitle>
              <CardDescription>
                Manage prescription refill requests from patients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <RefreshCw className="mx-auto h-8 w-8 mb-2" />
                <p>No refill requests at this time</p>
                <p className="text-sm">Refill requests will appear here when patients request them</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowLeftRight className="h-5 w-5" />
                Prescription Transfers
              </CardTitle>
              <CardDescription>
                Handle prescription transfers between pharmacies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <ArrowLeftRight className="mx-auto h-8 w-8 mb-2" />
                <p>No transfer requests at this time</p>
                <p className="text-sm">Prescription transfer requests will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}