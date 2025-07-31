import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Pill, 
  Clock, 
  DollarSign, 
  FileText, 
  CreditCard,
  CheckCircle,
  AlertCircle,
  Package2,
  Receipt,
  Shield,
  Truck,
  Search,
  ArrowRight,
  Archive,
  FolderOpen
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTenant } from "@/hooks/use-tenant";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";

interface PrescriptionWorkflow {
  id: string;
  patientId: string;
  patientFirstName: string;
  patientLastName: string;
  patientMRN: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  quantity: number;
  refills: number;
  instructions: string;
  providerId: string;
  providerName: string;
  hospitalName: string;
  status: 'prescribed' | 'sent_to_pharmacy' | 'received' | 'insurance_verified' | 'processing' | 'ready' | 'dispensed' | 'picked_up' | 'cancelled';
  prescribedDate: string;
  sentToPharmacyDate?: string;
  insuranceVerifiedDate?: string;
  insuranceProvider?: string;
  insuranceCopay?: number;
  totalCost?: number;
  processingStartedDate?: string;
  readyDate?: string;
  dispensedDate?: string;
  pharmacyNotes?: string;
  createdAt: string;
  updatedAt: string;
}

interface InsuranceVerificationForm {
  insuranceProvider: string;
  totalCost: number;
  coveragePercentage: number;
  pharmacyNotes: string;
}

interface InsuranceCalculation {
  totalCost: number;
  coveragePercentage: number;
  insuranceAmount: number;
  patientCopay: number;
}

export default function PharmacyDashboardEnhanced() {
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionWorkflow | null>(null);
  const [insuranceDialogOpen, setInsuranceDialogOpen] = useState(false);
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [insuranceCalculation, setInsuranceCalculation] = useState<InsuranceCalculation | null>(null);
  const [totalCost, setTotalCost] = useState("");
  const [coveragePercentage, setCoveragePercentage] = useState("");

  // Fetch prescriptions sent to this pharmacy
  const { data: prescriptions = [], isLoading } = useQuery({
    queryKey: ['/api/prescriptions'],
    enabled: !!user // Only fetch when user is authenticated
  });

  // Update prescription status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, data }: { id: string; status: string; data?: Partial<PrescriptionWorkflow> }) => {
      return await apiRequest('PATCH', `/api/prescriptions/${id}`, {
        status,
        ...data,
        updatedAt: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prescriptions'] });
      toast({ 
        title: "Status Updated", 
        description: "Prescription status has been updated successfully." 
      });
      setInsuranceDialogOpen(false);
      setWorkflowDialogOpen(false);
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: `Failed to update prescription: ${error.message}`,
        variant: "destructive" 
      });
    }
  });

  // Filter prescriptions by status
  const newPrescriptions = prescriptions.filter(p => p.status === 'prescribed' || p.status === 'sent_to_pharmacy');
  const insuranceToVerify = prescriptions.filter(p => p.status === 'received');
  const processingPrescriptions = prescriptions.filter(p => p.status === 'processing');
  const readyPrescriptions = prescriptions.filter(p => p.status === 'ready');
  const dispensedPrescriptions = prescriptions.filter(p => p.status === 'dispensed' || p.status === 'picked_up');
  
  // Archived prescriptions - completed workflow (dispensed/picked up) and old filled prescriptions
  const archivedPrescriptions = prescriptions.filter(p => 
    p.status === 'dispensed' || 
    p.status === 'picked_up' || 
    p.status === 'filled' || 
    p.status === 'cancelled'
  );
  
  // Active prescriptions - everything except archived
  const activePrescriptions = prescriptions.filter(p => 
    !['dispensed', 'picked_up', 'filled', 'cancelled'].includes(p.status)
  );

  // Filter by search term
  const filterPrescriptions = (prescriptionList: PrescriptionWorkflow[]) => {
    if (!searchTerm) return prescriptionList;
    return prescriptionList.filter(p => 
      `${p.patientFirstName} ${p.patientLastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.medicationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.patientMRN.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'prescribed': { color: 'bg-blue-100 text-blue-800', label: 'New' },
      'sent_to_pharmacy': { color: 'bg-blue-100 text-blue-800', label: 'New' },
      'received': { color: 'bg-yellow-100 text-yellow-800', label: 'Verify Insurance' },
      'insurance_verified': { color: 'bg-green-100 text-green-800', label: 'Insurance Verified' },
      'processing': { color: 'bg-orange-100 text-orange-800', label: 'Processing' },
      'ready': { color: 'bg-green-100 text-green-800', label: 'Ready' },
      'dispensed': { color: 'bg-gray-100 text-gray-800', label: 'Dispensed' },
      'picked_up': { color: 'bg-gray-100 text-gray-800', label: 'Picked Up' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'bg-gray-100 text-gray-800', label: status };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  // Calculate insurance coverage breakdown
  const calculateInsuranceCoverage = (totalCost: number, coveragePercentage: number): InsuranceCalculation => {
    const insuranceAmount = (totalCost * coveragePercentage) / 100;
    const patientCopay = totalCost - insuranceAmount;
    
    return {
      totalCost,
      coveragePercentage,
      insuranceAmount: Math.round(insuranceAmount * 100) / 100, // Round to 2 decimal places
      patientCopay: Math.round(patientCopay * 100) / 100
    };
  };

  // Effect to calculate insurance coverage in real-time
  useEffect(() => {
    const cost = parseFloat(totalCost);
    const percentage = parseFloat(coveragePercentage);
    
    if (cost > 0 && percentage > 0) {
      setInsuranceCalculation(calculateInsuranceCoverage(cost, percentage));
    } else {
      setInsuranceCalculation(null);
    }
  }, [totalCost, coveragePercentage]);

  const handleInsuranceVerification = async (formData: InsuranceVerificationForm) => {
    if (!selectedPrescription || !insuranceCalculation) return;
    
    await updateStatusMutation.mutateAsync({
      id: selectedPrescription.id,
      status: 'insurance_verified',
      data: {
        insuranceVerifiedDate: new Date().toISOString(),
        insuranceProvider: formData.insuranceProvider,
        insuranceCopay: insuranceCalculation.patientCopay,
        totalCost: formData.totalCost,
        pharmacyNotes: formData.pharmacyNotes
      }
    });
    
    setInsuranceCalculation(null);
    setTotalCost("");
    setCoveragePercentage("");
    setInsuranceDialogOpen(false);
  };

  const handleStatusUpdate = async (prescriptionId: string, newStatus: string, additionalData = {}) => {
    const timestampField = {
      'received': {},
      'processing': { processingStartedDate: new Date().toISOString() },
      'ready': { readyDate: new Date().toISOString() },
      'dispensed': { dispensedDate: new Date().toISOString() }
    };

    await updateStatusMutation.mutateAsync({
      id: prescriptionId,
      status: newStatus,
      data: {
        ...timestampField[newStatus as keyof typeof timestampField],
        ...additionalData
      }
    });
  };

  const PrescriptionCard = ({ prescription, showActions = true }: { prescription: PrescriptionWorkflow; showActions?: boolean }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{prescription.medicationName} {prescription.dosage}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Patient: <span className="font-medium">{prescription.patientFirstName} {prescription.patientLastName}</span> (MRN: {prescription.patientMRN})
            </p>
            <p className="text-sm text-gray-600">
              Prescribed by: <span className="font-medium">{prescription.providerName}</span> - {prescription.hospitalName}
            </p>
          </div>
          {getStatusBadge(prescription.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Frequency:</strong> {prescription.frequency}</p>
            <p><strong>Quantity:</strong> {prescription.quantity}</p>
            <p><strong>Refills:</strong> {prescription.refills}</p>
          </div>
          <div>
            <p><strong>Prescribed:</strong> {format(new Date(prescription.prescribedDate), 'MMM dd, yyyy')}</p>
            {prescription.insuranceCopay && (
              <p><strong>Copay:</strong> ${prescription.insuranceCopay.toFixed(2)}</p>
            )}
            {prescription.totalCost && (
              <p><strong>Total Cost:</strong> ${prescription.totalCost.toFixed(2)}</p>
            )}
          </div>
        </div>
        
        {prescription.instructions && (
          <div className="mt-3 p-2 bg-gray-50 rounded">
            <p className="text-sm"><strong>Instructions:</strong> {prescription.instructions}</p>
          </div>
        )}
        
        {prescription.pharmacyNotes && (
          <div className="mt-3 p-2 bg-blue-50 rounded">
            <p className="text-sm"><strong>Pharmacy Notes:</strong> {prescription.pharmacyNotes}</p>
          </div>
        )}

        {showActions && (
          <div className="mt-4 flex gap-2">
            {prescription.status === 'prescribed' || prescription.status === 'sent_to_pharmacy' ? (
              <Button 
                size="sm" 
                onClick={() => handleStatusUpdate(prescription.id, 'received')}
                disabled={updateStatusMutation.isPending}
              >
                <ArrowRight className="h-4 w-4 mr-1" />
                Mark as Received
              </Button>
            ) : null}
            
            {prescription.status === 'received' ? (
              <Button 
                size="sm" 
                onClick={() => {
                  setSelectedPrescription(prescription);
                  setInsuranceDialogOpen(true);
                }}
                disabled={updateStatusMutation.isPending}
              >
                <Shield className="h-4 w-4 mr-1" />
                Verify Insurance
              </Button>
            ) : null}
            
            {prescription.status === 'insurance_verified' ? (
              <Button 
                size="sm" 
                onClick={() => handleStatusUpdate(prescription.id, 'processing')}
                disabled={updateStatusMutation.isPending}
              >
                <Package2 className="h-4 w-4 mr-1" />
                Start Processing
              </Button>
            ) : null}
            
            {prescription.status === 'processing' ? (
              <Button 
                size="sm" 
                onClick={() => handleStatusUpdate(prescription.id, 'ready')}
                disabled={updateStatusMutation.isPending}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Mark as Ready
              </Button>
            ) : null}
            
            {prescription.status === 'ready' ? (
              <Button 
                size="sm" 
                onClick={() => handleStatusUpdate(prescription.id, 'dispensed')}
                disabled={updateStatusMutation.isPending}
              >
                <Truck className="h-4 w-4 mr-1" />
                Dispense to Patient
              </Button>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const InsuranceVerificationDialog = () => (
    <Dialog open={insuranceDialogOpen} onOpenChange={(open) => {
      setInsuranceDialogOpen(open);
      if (!open) {
        setInsuranceCalculation(null);
        setTotalCost("");
        setCoveragePercentage("");
      }
    }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Verify Insurance Coverage & Calculate Copay</DialogTitle>
          <p className="text-sm text-gray-600">
            Enter the total medication cost and insurance coverage percentage to automatically calculate patient copay
          </p>
        </DialogHeader>
        {selectedPrescription && (
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleInsuranceVerification({
              insuranceProvider: formData.get('insuranceProvider') as string,
              totalCost: parseFloat(formData.get('totalCost') as string),
              coveragePercentage: parseFloat(formData.get('coveragePercentage') as string),
              pharmacyNotes: formData.get('pharmacyNotes') as string
            });
          }}>
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded">
                <p className="font-medium">{selectedPrescription.medicationName} {selectedPrescription.dosage}</p>
                <p className="text-sm text-gray-600">Patient: {selectedPrescription.patientFirstName} {selectedPrescription.patientLastName}</p>
              </div>
              
              <div>
                <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                <Input 
                  id="insuranceProvider" 
                  name="insuranceProvider" 
                  placeholder="e.g., Medicare, Blue Cross Blue Shield"
                  required 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="totalCost">Total Medication Cost ($)</Label>
                  <Input 
                    id="totalCost" 
                    name="totalCost" 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00"
                    value={totalCost}
                    required 
                    onChange={(e) => setTotalCost(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="coveragePercentage">Insurance Coverage (%)</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="coveragePercentage" 
                      name="coveragePercentage" 
                      type="number" 
                      min="0" 
                      max="100" 
                      step="1" 
                      placeholder="80"
                      value={coveragePercentage}
                      required 
                      className="flex-1"
                      onChange={(e) => setCoveragePercentage(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-1 mt-2">
                    {[70, 80, 85, 90].map(percentage => (
                      <Button
                        key={percentage}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs px-2 py-1 h-6"
                        onClick={() => {
                          setCoveragePercentage(percentage.toString());
                        }}
                      >
                        {percentage}%
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Insurance Calculation Breakdown */}
              {insuranceCalculation && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-3">Coverage Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Cost:</span>
                      <span className="font-medium">${insuranceCalculation.totalCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Insurance Coverage ({insuranceCalculation.coveragePercentage}%):</span>
                      <span className="font-medium text-green-600">-${insuranceCalculation.insuranceAmount.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between">
                        <span className="font-medium text-blue-900">Patient Copay:</span>
                        <span className="font-bold text-blue-900">${insuranceCalculation.patientCopay.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <Label htmlFor="pharmacyNotes">Pharmacy Notes (Optional)</Label>
                <Textarea 
                  id="pharmacyNotes" 
                  name="pharmacyNotes" 
                  placeholder="Any additional notes about coverage verification..."
                  rows={2}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  disabled={updateStatusMutation.isPending || !insuranceCalculation}
                  className="flex-1"
                >
                  {updateStatusMutation.isPending ? 'Processing...' : 'Verify Insurance & Update'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setInsuranceDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Pill className="h-8 w-8 animate-pulse mx-auto mb-4 text-blue-500" />
            <p>Loading pharmacy dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pharmacy Dashboard</h1>
        <p className="text-gray-600">Manage prescription workflow from receipt to dispensing</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
          <Input
            placeholder="Search by patient name, medication, or MRN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Workflow Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{activePrescriptions.length}</div>
            <div className="text-sm text-gray-600">Active Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{newPrescriptions.length}</div>
            <div className="text-sm text-gray-600">New</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{insuranceToVerify.length}</div>
            <div className="text-sm text-gray-600">Insurance Verify</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{processingPrescriptions.length}</div>
            <div className="text-sm text-gray-600">Processing</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{readyPrescriptions.length}</div>
            <div className="text-sm text-gray-600">Ready</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{archivedPrescriptions.length}</div>
            <div className="text-sm text-gray-600">Archived</div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Tabs */}
      <Tabs defaultValue="new" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="new" className="text-xs">
            New ({newPrescriptions.length})
          </TabsTrigger>
          <TabsTrigger value="insurance" className="text-xs">
            Insurance ({insuranceToVerify.length})
          </TabsTrigger>
          <TabsTrigger value="processing" className="text-xs">
            Processing ({processingPrescriptions.length})
          </TabsTrigger>
          <TabsTrigger value="ready" className="text-xs">
            Ready ({readyPrescriptions.length})
          </TabsTrigger>
          <TabsTrigger value="dispensed" className="text-xs">
            Recent ({dispensedPrescriptions.length})
          </TabsTrigger>
          <TabsTrigger value="archived" className="text-xs">
            📁 Archived ({archivedPrescriptions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="mt-4">
          <div className="space-y-4">
            {filterPrescriptions(newPrescriptions).length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Pill className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No new prescriptions</p>
                </CardContent>
              </Card>
            ) : (
              filterPrescriptions(newPrescriptions).map(prescription => (
                <PrescriptionCard key={prescription.id} prescription={prescription} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="insurance" className="mt-4">
          <div className="space-y-4">
            {filterPrescriptions(insuranceToVerify).length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Shield className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No prescriptions pending insurance verification</p>
                </CardContent>
              </Card>
            ) : (
              filterPrescriptions(insuranceToVerify).map(prescription => (
                <PrescriptionCard key={prescription.id} prescription={prescription} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="processing" className="mt-4">
          <div className="space-y-4">
            {filterPrescriptions(processingPrescriptions).length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package2 className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No prescriptions currently being processed</p>
                </CardContent>
              </Card>
            ) : (
              filterPrescriptions(processingPrescriptions).map(prescription => (
                <PrescriptionCard key={prescription.id} prescription={prescription} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="ready" className="mt-4">
          <div className="space-y-4">
            {filterPrescriptions(readyPrescriptions).length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No prescriptions ready for pickup</p>
                </CardContent>
              </Card>
            ) : (
              filterPrescriptions(readyPrescriptions).map(prescription => (
                <PrescriptionCard key={prescription.id} prescription={prescription} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="dispensed" className="mt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Recently Dispensed</h3>
              <p className="text-sm text-gray-500">Last 30 days of dispensed prescriptions</p>
            </div>
            {filterPrescriptions(dispensedPrescriptions).length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Truck className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No recently dispensed prescriptions</p>
                </CardContent>
              </Card>
            ) : (
              filterPrescriptions(dispensedPrescriptions).map(prescription => (
                <PrescriptionCard key={prescription.id} prescription={prescription} showActions={false} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="archived" className="mt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium flex items-center gap-2">
                  📁 Archived Prescriptions
                </h3>
                <p className="text-sm text-gray-500">All completed, dispensed, filled, and cancelled prescriptions</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-600">{archivedPrescriptions.length}</p>
                <p className="text-sm text-gray-500">Total Archived</p>
              </div>
            </div>
            
            {filterPrescriptions(archivedPrescriptions).length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-gray-400 text-6xl mb-4">📁</div>
                  <p className="text-gray-500 text-lg">No archived prescriptions</p>
                  <p className="text-gray-400 text-sm mt-2">Completed prescriptions will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filterPrescriptions(archivedPrescriptions).map(prescription => (
                  <Card key={prescription.id} className="opacity-75 hover:opacity-100 transition-opacity">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            📁 {prescription.medicationName} {prescription.dosage}
                          </CardTitle>
                          <p className="text-sm text-gray-600 mt-1">
                            Patient: <span className="font-medium">{prescription.patientFirstName} {prescription.patientLastName}</span> (MRN: {prescription.patientMRN})
                          </p>
                          <p className="text-sm text-gray-600">
                            Prescribed by: <span className="font-medium">{prescription.providerName}</span> - {prescription.hospitalName}
                          </p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(prescription.status)}
                          <p className="text-xs text-gray-500 mt-1">
                            Archived: {prescription.dispensedDate ? 
                              format(new Date(prescription.dispensedDate), 'MMM dd, yyyy') : 
                              format(new Date(prescription.updatedAt), 'MMM dd, yyyy')
                            }
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p><strong>Frequency:</strong> {prescription.frequency}</p>
                          <p><strong>Quantity:</strong> {prescription.quantity}</p>
                          <p><strong>Refills:</strong> {prescription.refills}</p>
                        </div>
                        <div>
                          <p><strong>Prescribed:</strong> {format(new Date(prescription.prescribedDate), 'MMM dd, yyyy')}</p>
                          {prescription.insuranceCopay && (
                            <p><strong>Patient Copay:</strong> ${prescription.insuranceCopay.toFixed(2)}</p>
                          )}
                          {prescription.totalCost && (
                            <p><strong>Total Cost:</strong> ${prescription.totalCost.toFixed(2)}</p>
                          )}
                        </div>
                      </div>
                      
                      {prescription.instructions && (
                        <div className="mt-3 p-2 bg-gray-50 rounded">
                          <p className="text-sm"><strong>Instructions:</strong> {prescription.instructions}</p>
                        </div>
                      )}
                      
                      {prescription.pharmacyNotes && (
                        <div className="mt-3 p-2 bg-blue-50 rounded">
                          <p className="text-sm"><strong>Pharmacy Notes:</strong> {prescription.pharmacyNotes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <InsuranceVerificationDialog />
    </div>
  );
}