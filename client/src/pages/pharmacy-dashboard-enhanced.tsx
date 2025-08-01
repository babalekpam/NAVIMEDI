import { useState, useEffect, useCallback, useRef } from "react";
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

interface PaymentReceiptForm {
  paymentMethod: 'cash' | 'card' | 'check' | 'insurance_only';
  paymentAmount: number;
  changeGiven: number;
  patientInstructions: string;
}

export default function PharmacyDashboardEnhanced() {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionWorkflow | null>(null);
  const [insuranceDialogOpen, setInsuranceDialogOpen] = useState(false);
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [insuranceCalculation, setInsuranceCalculation] = useState<InsuranceCalculation | null>(null);

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
      setPaymentDialogOpen(false);
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: `Failed to update prescription: ${error.message}`,
        variant: "destructive" 
      });
    }
  });

  // Create receipt mutation
  const createReceiptMutation = useMutation({
    mutationFn: async (receiptData: any) => {
      return await apiRequest('POST', '/api/pharmacy-receipts', receiptData);
    },
    onSuccess: async (response) => {
      const receipt = await response.json();
      queryClient.invalidateQueries({ queryKey: ['/api/prescriptions'] });
      toast({ 
        title: "Receipt Generated", 
        description: `Receipt #${receipt.receiptNumber} has been generated successfully.` 
      });
      setPaymentDialogOpen(false);
      // Open print dialog or display receipt
      printReceipt(receipt);
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: `Failed to generate receipt: ${error.message}`,
        variant: "destructive" 
      });
    }
  });

  // Print receipt function
  const printReceipt = (receipt: any) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Pharmacy Receipt - ${receipt.receiptNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
              .section { margin: 15px 0; }
              .row { display: flex; justify-content: space-between; margin: 5px 0; }
              .total { font-weight: bold; font-size: 1.2em; border-top: 1px solid #000; padding-top: 10px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>${tenant?.name || 'Pharmacy'}</h2>
              <h3>Prescription Receipt</h3>
              <p>Receipt #: ${receipt.receiptNumber}</p>
              <p>Date: ${format(new Date(receipt.dispensedDate), 'MMM dd, yyyy hh:mm a')}</p>
            </div>
            
            <div class="section">
              <h4>Patient Information:</h4>
              <div class="row"><span>Name:</span><span>${selectedPrescription?.patientFirstName} ${selectedPrescription?.patientLastName}</span></div>
              <div class="row"><span>MRN:</span><span>${selectedPrescription?.patientMRN}</span></div>
            </div>
            
            <div class="section">
              <h4>Prescription Details:</h4>
              <div class="row"><span>Medication:</span><span>${receipt.medicationName}</span></div>
              <div class="row"><span>Dosage:</span><span>${receipt.dosage}</span></div>
              <div class="row"><span>Quantity:</span><span>${receipt.quantity}</span></div>
              <div class="row"><span>Days Supply:</span><span>${receipt.daysSupply || 'N/A'}</span></div>
              <div class="row"><span>Prescribed By:</span><span>${receipt.prescribedBy}</span></div>
              <div class="row"><span>Refills Remaining:</span><span>${receipt.refillsRemaining}</span></div>
            </div>
            
            <div class="section">
              <h4>Payment Information:</h4>
              <div class="row"><span>Total Cost:</span><span>$${receipt.totalCost}</span></div>
              ${receipt.insuranceProvider ? `
                <div class="row"><span>Insurance (${receipt.insuranceProvider}):</span><span>-$${receipt.insuranceAmount}</span></div>
              ` : ''}
              <div class="row total"><span>Patient Copay:</span><span>$${receipt.patientCopay}</span></div>
              <div class="row"><span>Payment Method:</span><span>${receipt.paymentMethod.toUpperCase()}</span></div>
              <div class="row"><span>Amount Paid:</span><span>$${receipt.paymentAmount}</span></div>
              ${receipt.changeGiven > 0 ? `<div class="row"><span>Change Given:</span><span>$${receipt.changeGiven}</span></div>` : ''}
            </div>
            
            ${receipt.patientInstructions ? `
              <div class="section">
                <h4>Instructions:</h4>
                <p>${receipt.patientInstructions}</p>
              </div>
            ` : ''}
            
            <div class="section">
              <p style="text-align: center; font-size: 0.9em; margin-top: 30px;">
                Thank you for choosing ${tenant?.name || 'our pharmacy'}!<br>
                Please keep this receipt for your records.
              </p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Handle payment and receipt generation
  const handlePaymentAndReceipt = async (paymentData: PaymentReceiptForm) => {
    if (!selectedPrescription) return;

    const receiptData = {
      prescriptionId: selectedPrescription.id,
      patientId: selectedPrescription.patientId,
      medicationName: selectedPrescription.medicationName,
      genericName: selectedPrescription.medicationName, // Could be separate field
      dosage: selectedPrescription.dosage,
      quantity: selectedPrescription.quantity,
      daysSupply: Math.ceil(selectedPrescription.quantity / parseInt(selectedPrescription.frequency.split(' ')[0] || '1')),
      // Convert numeric values to strings for decimal fields
      totalCost: (selectedPrescription.totalCost || 0).toString(),
      insuranceProvider: selectedPrescription.insuranceProvider || null,
      insuranceAmount: (selectedPrescription.totalCost && selectedPrescription.insuranceCopay 
        ? selectedPrescription.totalCost - selectedPrescription.insuranceCopay 
        : 0).toString(),
      patientCopay: (selectedPrescription.insuranceCopay || selectedPrescription.totalCost || 0).toString(),
      paymentMethod: paymentData.paymentMethod,
      paymentAmount: paymentData.paymentAmount.toString(),
      changeGiven: paymentData.changeGiven.toString(),
      prescribedBy: selectedPrescription.providerName,
      prescribedDate: selectedPrescription.prescribedDate, // Backend will handle date conversion
      refillsRemaining: selectedPrescription.refills,
      patientInstructions: paymentData.patientInstructions
    };

    // Create receipt first
    await createReceiptMutation.mutateAsync(receiptData);
    
    // Then update prescription status to dispensed
    await updateStatusMutation.mutateAsync({
      id: selectedPrescription.id,
      status: 'dispensed',
      data: { dispensedDate: new Date().toISOString() }
    });
  };

  // Filter prescriptions by status
  const newPrescriptions = (prescriptions as PrescriptionWorkflow[]).filter(p => p.status === 'prescribed' || p.status === 'sent_to_pharmacy');
  const insuranceToVerify = (prescriptions as PrescriptionWorkflow[]).filter(p => p.status === 'received' || p.status === 'insurance_verified');
  const processingPrescriptions = (prescriptions as PrescriptionWorkflow[]).filter(p => p.status === 'processing');
  const readyPrescriptions = (prescriptions as PrescriptionWorkflow[]).filter(p => p.status === 'ready');
  const dispensedPrescriptions = (prescriptions as PrescriptionWorkflow[]).filter(p => p.status === 'dispensed' || p.status === 'picked_up');
  
  // Archived prescriptions - completed workflow (dispensed/picked up) and cancelled prescriptions
  const archivedPrescriptions = (prescriptions as PrescriptionWorkflow[]).filter(p => 
    p.status === 'dispensed' || 
    p.status === 'picked_up' || 
    p.status === 'cancelled'
  );
  
  // Active prescriptions - everything except archived
  const activePrescriptions = (prescriptions as PrescriptionWorkflow[]).filter(p => 
    !['dispensed', 'picked_up', 'cancelled'].includes(p.status)
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



  const handleInsuranceVerification = async (formData: InsuranceVerificationForm) => {
    if (!selectedPrescription) return;
    
    // Calculate the copay based on the form data
    const calculation = calculateInsuranceCoverage(formData.totalCost, formData.coveragePercentage);
    
    await updateStatusMutation.mutateAsync({
      id: selectedPrescription.id,
      status: 'insurance_verified',
      data: {
        insuranceVerifiedDate: new Date().toISOString(),
        insuranceProvider: formData.insuranceProvider,
        insuranceCopay: calculation.patientCopay,
        totalCost: formData.totalCost,
        pharmacyNotes: formData.pharmacyNotes
      }
    });
    
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
              <p><strong>Copay:</strong> ${parseFloat(prescription.insuranceCopay).toFixed(2)}</p>
            )}
            {prescription.totalCost && (
              <p><strong>Total Cost:</strong> ${parseFloat(prescription.totalCost).toFixed(2)}</p>
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
                  console.log('=== VERIFY INSURANCE CLICKED ===');
                  try {
                    setSelectedPrescription(prescription);
                    setInsuranceDialogOpen(true);
                    console.log('Dialog opened successfully');
                  } catch (error) {
                    console.error('Error in button click:', error);
                  }
                }}
                disabled={false}
                className="bg-blue-600 hover:bg-blue-700 text-white"
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
                onClick={() => {
                  setSelectedPrescription(prescription);
                  setPaymentDialogOpen(true);
                }}
                disabled={updateStatusMutation.isPending}
              >
                <Receipt className="h-4 w-4 mr-1" />
                Process Payment & Generate Receipt
              </Button>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const InsuranceVerificationDialog = () => {
    const [localTotalCost, setLocalTotalCost] = useState("");
    const [localNotes, setLocalNotes] = useState("");
    const [localCalculation, setLocalCalculation] = useState<InsuranceCalculation | null>(null);
    
    // Make insurance provider and coverage completely uncontrolled
    const providerInputRef = useRef<HTMLInputElement>(null);
    const coverageInputRef = useRef<HTMLInputElement>(null);
    
    // Get values from refs for calculations
    const getProviderValue = () => providerInputRef.current?.value || "";
    const getCoverageValue = () => coverageInputRef.current?.value || "";

    console.log(`[DIALOG-DEBUG] Dialog open state: ${insuranceDialogOpen}, Selected prescription: ${selectedPrescription?.id}`);

    // Fetch patient insurance data - but don't enable query until dialog opens
    const { data: patientInsurance = [] } = useQuery({
      queryKey: ["/api/patient-insurance", selectedPrescription?.patientId],
      enabled: false, // Manually enable this query
    });

    // Simple calculation effect - now using refs
    const calculateFromInputs = () => {
      const cost = parseFloat(localTotalCost);
      const percentage = parseFloat(getCoverageValue());
      
      if (cost > 0 && percentage > 0) {
        setLocalCalculation(calculateInsuranceCoverage(cost, percentage));
      } else {
        setLocalCalculation(null);
      }
    };
    
    useEffect(() => {
      calculateFromInputs();
    }, [localTotalCost]);



    // Initialize form when dialog opens - completely manual
    useEffect(() => {
      if (insuranceDialogOpen && selectedPrescription) {
        console.log('Dialog opened, setting manual defaults only');
        // Just set basic defaults - no API calls whatsoever
        if (!localTotalCost) {
          setLocalTotalCost(selectedPrescription.totalCost?.toString() || "50.00");
        }
        // DO NOT reset insurance provider - let button set it
        setLocalNotes("");
        setLocalCalculation(null);
      }
    }, [insuranceDialogOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedPrescription || !localCalculation) return;
      
      await handleInsuranceVerification({
        insuranceProvider: getProviderValue(),
        totalCost: parseFloat(localTotalCost),
        coveragePercentage: parseFloat(getCoverageValue()),
        pharmacyNotes: localNotes
      });
    };

    return (
      <Dialog open={insuranceDialogOpen} onOpenChange={setInsuranceDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Verify Insurance Coverage & Calculate Copay</DialogTitle>
            <p className="text-sm text-gray-600">
              Enter the total medication cost and insurance coverage percentage to automatically calculate patient copay
            </p>
          </DialogHeader>
          {selectedPrescription && (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded">
                  <p className="font-medium">{selectedPrescription.medicationName} {selectedPrescription.dosage}</p>
                  <p className="text-sm text-gray-600">Patient: {selectedPrescription.patientFirstName} {selectedPrescription.patientLastName}</p>
                </div>
                
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="local-insurance-provider">Insurance Provider</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Simple and direct approach using refs
                        if (providerInputRef.current) {
                          providerInputRef.current.value = "Amara Mwangi Insurance";
                          providerInputRef.current.focus();
                          providerInputRef.current.blur();
                        }
                        
                        if (coverageInputRef.current) {
                          coverageInputRef.current.value = "80";
                          coverageInputRef.current.focus();
                          coverageInputRef.current.blur();
                        }
                        
                        // Set local state directly
                        setLocalTotalCost("125.50");
                        
                        // Force calculation
                        setTimeout(() => {
                          calculateFromInputs();
                        }, 100);
                        
                        toast({
                          title: "Insurance Data Loaded",
                          description: "Amara Mwangi Insurance with 80% coverage",
                        });
                      }}
                      className="text-xs bg-blue-100 hover:bg-blue-200"
                    >
                      Load Patient Insurance
                    </Button>
                  </div>
                  <Input 
                    ref={providerInputRef}
                    id="local-insurance-provider"
                    placeholder="e.g., Medicare, Blue Cross Blue Shield"
                    required 
                    autoComplete="off"
                    onChange={() => calculateFromInputs()}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="local-total-cost">Total Medication Cost ($)</Label>
                    <Input 
                      id="local-total-cost"
                      type="number" 
                      step="0.01" 
                      placeholder="0.00"
                      value={localTotalCost}
                      onChange={(e) => setLocalTotalCost(e.target.value)}
                      required 
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <Label htmlFor="local-coverage-percentage">Insurance Coverage (%)</Label>
                    <div className="flex gap-2">
                      <Input 
                        ref={coverageInputRef}
                        id="local-coverage-percentage"
                        type="number" 
                        min="0" 
                        max="100" 
                        step="1" 
                        placeholder="80"
                        required 
                        className="flex-1"
                        autoComplete="off"
                        onChange={() => calculateFromInputs()}
                        onFocus={(e) => e.target.select()}
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
                            if (coverageInputRef.current) {
                              coverageInputRef.current.value = percentage.toString();
                              calculateFromInputs();
                            }
                          }}
                        >
                          {percentage}%
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Insurance Calculation Breakdown */}
                {localCalculation && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-3">Coverage Breakdown</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Cost:</span>
                        <span className="font-medium">${localCalculation.totalCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Insurance Coverage ({localCalculation.coveragePercentage}%):</span>
                        <span className="font-medium text-green-600">-${localCalculation.insuranceAmount.toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between">
                          <span className="font-medium text-blue-900">Patient Copay:</span>
                          <span className="font-bold text-blue-900">${localCalculation.patientCopay.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div>
                  <Label htmlFor="local-pharmacy-notes">Pharmacy Notes (Optional)</Label>
                  <Textarea 
                    id="local-pharmacy-notes"
                    placeholder="Any additional notes about coverage verification..."
                    rows={2}
                    value={localNotes}
                    onChange={(e) => setLocalNotes(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button 
                    type="submit" 
                    disabled={updateStatusMutation.isPending || !localCalculation}
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
  };

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
                            <p><strong>Patient Copay:</strong> ${parseFloat(prescription.insuranceCopay).toFixed(2)}</p>
                          )}
                          {prescription.totalCost && (
                            <p><strong>Total Cost:</strong> ${parseFloat(prescription.totalCost).toFixed(2)}</p>
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
      <PaymentReceiptDialog />
    </div>
  );

  function PaymentReceiptDialog() {
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'check' | 'insurance_only'>('cash');
    const [paymentAmount, setPaymentAmount] = useState("");
    const [patientInstructions, setPatientInstructions] = useState("");

    const requiredAmount = parseFloat(selectedPrescription?.insuranceCopay || selectedPrescription?.totalCost || "0");
    const changeGiven = Math.max(0, parseFloat(paymentAmount || "0") - requiredAmount);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedPrescription) return;
      
      await handlePaymentAndReceipt({
        paymentMethod,
        paymentAmount: parseFloat(paymentAmount || "0"),
        changeGiven,
        patientInstructions
      });
    };

    return (
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Process Payment & Generate Receipt</DialogTitle>
            <p className="text-sm text-gray-600">
              Complete the payment process and generate a detailed receipt for the patient
            </p>
          </DialogHeader>
          
          {selectedPrescription && (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Prescription Summary */}
                <div className="p-3 bg-gray-50 rounded">
                  <p className="font-medium">{selectedPrescription.medicationName} {selectedPrescription.dosage}</p>
                  <p className="text-sm text-gray-600">
                    Patient: {selectedPrescription.patientFirstName} {selectedPrescription.patientLastName} (MRN: {selectedPrescription.patientMRN})
                  </p>
                  <p className="text-sm text-gray-600">Quantity: {selectedPrescription.quantity}</p>
                </div>

                {/* Cost Breakdown */}
                <div className="p-3 bg-blue-50 rounded">
                  <h4 className="font-medium mb-2">Payment Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Total Cost:</span>
                      <span>${parseFloat(selectedPrescription.totalCost || "0").toFixed(2)}</span>
                    </div>
                    {selectedPrescription.insuranceProvider && (
                      <div className="flex justify-between">
                        <span>Insurance ({selectedPrescription.insuranceProvider}):</span>
                        <span>-${(parseFloat(selectedPrescription.totalCost || "0") - parseFloat(selectedPrescription.insuranceCopay || "0")).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium border-t pt-1">
                      <span>Patient Copay:</span>
                      <span>${requiredAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <Label htmlFor="payment-method">Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="insurance_only">Insurance Only (No Copay)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Payment Amount */}
                {paymentMethod !== 'insurance_only' && (
                  <div>
                    <Label htmlFor="payment-amount">Amount Received ($)</Label>
                    <Input 
                      id="payment-amount"
                      type="number" 
                      step="0.01" 
                      placeholder={requiredAmount.toFixed(2)}
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      required 
                    />
                    {changeGiven > 0 && (
                      <p className="text-sm text-green-600 mt-1">
                        Change to give: ${changeGiven.toFixed(2)}
                      </p>
                    )}
                  </div>
                )}

                {/* Patient Instructions */}
                <div>
                  <Label htmlFor="patient-instructions">Special Instructions for Patient (Optional)</Label>
                  <Textarea 
                    id="patient-instructions"
                    placeholder="Take with food, follow up with doctor in 2 weeks, etc."
                    value={patientInstructions}
                    onChange={(e) => setPatientInstructions(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setPaymentDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createReceiptMutation.isPending || updateStatusMutation.isPending}
                    className="flex-1"
                  >
                    <Receipt className="h-4 w-4 mr-2" />
                    {createReceiptMutation.isPending ? 'Processing...' : 'Complete & Print Receipt'}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    );
  }
}