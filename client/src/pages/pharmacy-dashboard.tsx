import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Package, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Truck, 
  FileText, 
  DollarSign, 
  Phone, 
  MapPin,
  Calendar,
  Pill,
  Shield,
  User,
  Building2,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type { Prescription, Patient, InsuranceClaim, Pharmacy } from "@shared/schema";

interface PrescriptionWithPatient extends Prescription {
  patient?: Patient;
  pharmacy?: Pharmacy;
}

export default function PharmacyDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionWithPatient | null>(null);
  const [processingDialogOpen, setProcessingDialogOpen] = useState(false);
  const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
  const [insuranceDialogOpen, setInsuranceDialogOpen] = useState(false);

  // Fetch prescriptions for pharmacy processing
  const { data: prescriptions = [], isLoading: prescriptionsLoading } = useQuery({
    queryKey: ["/api/prescriptions"],
    queryFn: async () => {
      const response = await fetch("/api/prescriptions");
      if (!response.ok) throw new Error("Failed to fetch prescriptions");
      return response.json() as Promise<PrescriptionWithPatient[]>;
    }
  });

  // Fetch patients data
  const { data: patients = [] } = useQuery({
    queryKey: ["/api/patients"],
    queryFn: async () => {
      const response = await fetch("/api/patients");
      if (!response.ok) throw new Error("Failed to fetch patients");
      return response.json() as Promise<Patient[]>;
    }
  });

  // Fetch pharmacy information
  const { data: pharmacies = [] } = useQuery({
    queryKey: ["/api/pharmacies"],
    queryFn: async () => {
      const response = await fetch("/api/pharmacies");
      if (!response.ok) throw new Error("Failed to fetch pharmacies");
      return response.json() as Promise<Pharmacy[]>;
    }
  });

  // Fetch insurance claims
  const { data: insuranceClaims = [] } = useQuery({
    queryKey: ["/api/insurance-claims"],
    queryFn: async () => {
      const response = await fetch("/api/insurance-claims");
      if (!response.ok) throw new Error("Failed to fetch insurance claims");
      return response.json() as Promise<InsuranceClaim[]>;
    }
  });

  // Update prescription status mutation
  const updatePrescriptionMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Prescription> }) => {
      const response = await fetch(`/api/prescriptions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error("Failed to update prescription");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prescriptions'] });
      toast({
        title: "Success",
        description: "Prescription status updated successfully"
      });
    }
  });

  // Create insurance claim mutation
  const createInsuranceClaimMutation = useMutation({
    mutationFn: async (claimData: any) => {
      const response = await fetch("/api/insurance-claims", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(claimData)
      });
      if (!response.ok) throw new Error("Failed to create insurance claim");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/insurance-claims'] });
      toast({
        title: "Success",
        description: "Insurance claim filed successfully"
      });
      setInsuranceDialogOpen(false);
    }
  });

  // Helper functions
  const getPatientById = (patientId: string) => {
    return patients.find(p => p.id === patientId);
  };

  const getPharmacyById = (pharmacyId: string) => {
    return pharmacies.find(p => p.id === pharmacyId);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'prescribed': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'sent_to_pharmacy': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'filled': return 'bg-green-100 text-green-800 border-green-200';
      case 'picked_up': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Filter prescriptions by status
  const pendingPrescriptions = prescriptions.filter(p => p.status === 'prescribed');
  const processingPrescriptions = prescriptions.filter(p => p.status === 'sent_to_pharmacy');
  const readyPrescriptions = prescriptions.filter(p => p.status === 'filled');
  const dispensedPrescriptions = prescriptions.filter(p => p.status === 'picked_up');

  const handleProcessPrescription = async (prescription: PrescriptionWithPatient) => {
    setSelectedPrescription(prescription);
    setProcessingDialogOpen(true);
  };

  const handleFileInsuranceClaim = async (prescription: PrescriptionWithPatient) => {
    setSelectedPrescription(prescription);
    setInsuranceDialogOpen(true);
  };

  const handleDeliverySetup = async (prescription: PrescriptionWithPatient) => {
    setSelectedPrescription(prescription);
    setDeliveryDialogOpen(true);
  };

  if (prescriptionsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg">Loading pharmacy dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pharmacy Dashboard</h1>
          <p className="text-gray-600">Manage prescriptions, insurance claims, and deliveries</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="text-green-700 border-green-300">
            <CheckCircle className="h-4 w-4 mr-1" />
            Active Pharmacy
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingPrescriptions.length}</div>
            <p className="text-xs text-gray-500">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{processingPrescriptions.length}</div>
            <p className="text-xs text-gray-500">Being prepared</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready for Pickup</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{readyPrescriptions.length}</div>
            <p className="text-xs text-gray-500">Available for collection</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered Today</CardTitle>
            <Truck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{dispensedPrescriptions.length}</div>
            <p className="text-xs text-gray-500">Completed deliveries</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="prescriptions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="insurance">Insurance Claims</TabsTrigger>
          <TabsTrigger value="delivery">Delivery Management</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>

        {/* Prescriptions Tab */}
        <TabsContent value="prescriptions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Pill className="h-5 w-5 text-blue-600" />
                <span>Prescription Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prescriptions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No prescriptions available</p>
                  </div>
                ) : (
                  prescriptions.map((prescription) => {
                    const patient = getPatientById(prescription.patientId);
                    const pharmacy = getPharmacyById(prescription.pharmacyId || '');
                    
                    return (
                      <div key={prescription.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <Badge className={getStatusColor(prescription.status || 'prescribed')}>
                                {(prescription.status || 'prescribed').toUpperCase().replace('_', ' ')}
                              </Badge>
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                PHARMACY
                              </Badge>
                              <span className="text-sm text-gray-500">
                                RX#{prescription.id.split('-')[0].toUpperCase()}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <h4 className="font-medium text-gray-900">{prescription.medicationName}</h4>
                                <p className="text-sm text-gray-600">
                                  {prescription.dosage} • {prescription.quantity} units
                                </p>
                                <p className="text-xs text-gray-500">
                                  Prescribed: {prescription.prescribedDate ? format(new Date(prescription.prescribedDate), 'MMM dd, yyyy') : 'N/A'}
                                </p>
                              </div>
                              
                              <div>
                                <div className="flex items-center space-x-2 text-sm">
                                  <User className="h-4 w-4 text-gray-400" />
                                  <span className="font-medium">
                                    {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <Phone className="h-4 w-4 text-gray-400" />
                                  <span>{patient?.phone || 'No phone'}</span>
                                </div>
                              </div>
                              
                              <div>
                                {patient?.preferredPharmacyId && (
                                  <div className="flex items-center space-x-2 text-sm">
                                    <Building2 className="h-4 w-4 text-gray-400" />
                                    <span className="font-medium">
                                      {getPharmacyById(patient.preferredPharmacyId)?.name || 'Unknown Pharmacy'}
                                    </span>
                                  </div>
                                )}
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  <span>Expires: {prescription.expiryDate ? format(new Date(prescription.expiryDate), 'MMM dd, yyyy') : 'N/A'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            {prescription.status === 'prescribed' && (
                              <Button 
                                size="sm" 
                                onClick={() => handleProcessPrescription(prescription)}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                Process
                              </Button>
                            )}
                            
                            {prescription.status === 'sent_to_pharmacy' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => updatePrescriptionMutation.mutate({
                                  id: prescription.id,
                                  updates: { status: 'filled' }
                                })}
                              >
                                Mark Ready
                              </Button>
                            )}
                            
                            {prescription.status === 'filled' && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => updatePrescriptionMutation.mutate({
                                    id: prescription.id,
                                    updates: { status: 'picked_up' }
                                  })}
                                >
                                  Dispense
                                </Button>
                                <Button 
                                  size="sm" 
                                  onClick={() => handleDeliverySetup(prescription)}
                                >
                                  <Truck className="h-4 w-4 mr-1" />
                                  Deliver
                                </Button>
                              </>
                            )}
                            
                            {patient && (
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleFileInsuranceClaim(prescription)}
                              >
                                <Shield className="h-4 w-4 mr-1" />
                                Insurance
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insurance Claims Tab */}
        <TabsContent value="insurance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span>Insurance Claims Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insuranceClaims.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No insurance claims filed</p>
                  </div>
                ) : (
                  insuranceClaims.map((claim) => (
                    <div key={claim.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Claim #{claim.claimNumber || 'N/A'}</h4>
                          <p className="text-sm text-gray-600">
                            Patient: {claim.patientId} • Amount: ${claim.totalAmount || '0.00'}
                          </p>
                          <Badge className={getStatusColor(claim.status || 'draft')}>
                            {(claim.status || 'draft').toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          Filed: {claim.createdAt ? format(new Date(claim.createdAt), 'MMM dd, yyyy') : 'N/A'}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Management Tab */}
        <TabsContent value="delivery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Truck className="h-5 w-5 text-purple-600" />
                <span>Delivery Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Truck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Delivery management system coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-orange-600" />
                <span>Inventory Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Inventory management system coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Processing Dialog */}
      <Dialog open={processingDialogOpen} onOpenChange={setProcessingDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Process Prescription</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Mark this prescription as being processed?</p>
            {selectedPrescription && (
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-medium">{selectedPrescription.medicationName}</p>
                <p className="text-sm text-gray-600">{selectedPrescription.dosage}</p>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setProcessingDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (selectedPrescription) {
                    updatePrescriptionMutation.mutate({
                      id: selectedPrescription.id,
                      updates: { status: 'sent_to_pharmacy' }
                    });
                  }
                  setProcessingDialogOpen(false);
                }}
              >
                Start Processing
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Insurance Claim Dialog */}
      <Dialog open={insuranceDialogOpen} onOpenChange={setInsuranceDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>File Insurance Claim</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>File an insurance claim for this prescription?</p>
            {selectedPrescription && (
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-medium">{selectedPrescription.medicationName}</p>
                <p className="text-sm text-gray-600">Patient: {getPatientById(selectedPrescription.patientId)?.firstName} {getPatientById(selectedPrescription.patientId)?.lastName}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Claim Amount</label>
                <Input placeholder="$0.00" />
              </div>
              <div>
                <label className="text-sm font-medium">Service Code</label>
                <Input placeholder="RX001" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea placeholder="Additional notes for insurance claim..." />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setInsuranceDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  // Create insurance claim logic here
                  setInsuranceDialogOpen(false);
                }}
              >
                File Claim
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}