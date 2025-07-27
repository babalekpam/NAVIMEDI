import { useState } from "react";
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
  Truck
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTenant } from "@/hooks/use-tenant";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface PharmacyPrescription {
  id: string;
  patientName: string;
  patientId: string;
  medication: string;
  dosage: string;
  quantity: number;
  instructions: string;
  prescriberId: string;
  prescriberName: string;
  status: 'received' | 'processing' | 'ready' | 'dispensed';
  insuranceProvider?: string;
  insuranceCopay?: number;
  totalCost: number;
  dateReceived: string;
  dateReady?: string;
  dateDispensed?: string;
}

export default function PharmacyDashboard() {
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPrescription, setSelectedPrescription] = useState<PharmacyPrescription | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch prescriptions sent to this pharmacy
  const { data: prescriptions = [], isLoading } = useQuery({
    queryKey: ['/api/prescriptions'],
    queryFn: async () => {
      const response = await fetch('/api/prescriptions');
      if (!response.ok) throw new Error('Failed to fetch prescriptions');
      return response.json() as Promise<PharmacyPrescription[]>;
    }
  });

  // Mock data for demonstration (replace with real API data)
  const mockPrescriptions: PharmacyPrescription[] = [
    {
      id: "RX001",
      patientName: "John Smith",
      patientId: "P001",
      medication: "Lisinopril",
      dosage: "10mg",
      quantity: 30,
      instructions: "Take once daily with food",
      prescriberId: "DR001",
      prescriberName: "Dr. Johnson",
      status: "received",
      insuranceProvider: "Blue Cross Blue Shield",
      insuranceCopay: 15.00,
      totalCost: 65.00,
      dateReceived: "2025-01-27"
    },
    {
      id: "RX002", 
      patientName: "Sarah Davis",
      medication: "Metformin",
      dosage: "500mg",
      quantity: 60,
      instructions: "Take twice daily with meals",
      prescriberId: "DR002",
      prescriberName: "Dr. Brown",
      status: "processing",
      insuranceProvider: "Aetna",
      insuranceCopay: 10.00,
      totalCost: 45.00,
      dateReceived: "2025-01-26",
      patientId: "P002"
    },
    {
      id: "RX003",
      patientName: "Mike Wilson",
      medication: "Atorvastatin",
      dosage: "20mg", 
      quantity: 30,
      instructions: "Take once daily at bedtime",
      prescriberId: "DR003",
      prescriberName: "Dr. Garcia",
      status: "ready",
      insuranceProvider: "Medicare",
      insuranceCopay: 5.00,
      totalCost: 75.00,
      dateReceived: "2025-01-25",
      dateReady: "2025-01-27",
      patientId: "P003"
    },
    {
      id: "RX004",
      patientName: "Lisa Johnson",
      medication: "Omeprazole",
      dosage: "40mg",
      quantity: 30,
      instructions: "Take once daily before breakfast",
      prescriberId: "DR001",
      prescriberName: "Dr. Johnson",
      status: "dispensed",
      insuranceProvider: "United Healthcare",
      insuranceCopay: 20.00,
      totalCost: 55.00,
      dateReceived: "2025-01-24",
      dateReady: "2025-01-26",
      dateDispensed: "2025-01-27",
      patientId: "P004"
    }
  ];

  const activePrescriptions = isLoading ? mockPrescriptions : prescriptions;

  // Calculate dashboard metrics
  const metrics = {
    received: activePrescriptions.filter((p) => p.status === 'received').length,
    processing: activePrescriptions.filter((p) => p.status === 'processing').length,
    ready: activePrescriptions.filter((p) => p.status === 'ready').length,
    dispensed: activePrescriptions.filter((p) => p.status === 'dispensed' && p.dateDispensed === format(new Date(), 'yyyy-MM-dd')).length,
    todayRevenue: activePrescriptions
      .filter((p) => p.status === 'dispensed' && p.dateDispensed === format(new Date(), 'yyyy-MM-dd'))
      .reduce((sum, p) => sum + (p.insuranceCopay || p.totalCost), 0)
  };

  // Process prescription mutation
  const processPrescriptionMutation = useMutation({
    mutationFn: async (data: { prescriptionId: string; action: string; details?: any }) => {
      const response = await fetch(`/api/prescriptions/${data.prescriptionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: data.action, details: data.details })
      });
      if (!response.ok) throw new Error('Failed to process prescription');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prescriptions'] });
      toast({ title: "Success", description: "Prescription processed successfully" });
      setDialogOpen(false);
      setSelectedPrescription(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "received": return "bg-blue-100 text-blue-800";
      case "processing": return "bg-yellow-100 text-yellow-800";
      case "ready": return "bg-green-100 text-green-800";
      case "dispensed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "received": return <Clock className="h-4 w-4" />;
      case "processing": return <Package2 className="h-4 w-4" />;
      case "ready": return <CheckCircle className="h-4 w-4" />;
      case "dispensed": return <Receipt className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getActionButton = (prescription: PharmacyPrescription) => {
    switch (prescription.status) {
      case 'received':
        return { text: 'Start Processing', color: 'bg-blue-600 hover:bg-blue-700' };
      case 'processing':
        return { text: 'File Insurance Claim', color: 'bg-green-600 hover:bg-green-700' };
      case 'ready':
        return { text: 'Dispense & Collect Payment', color: 'bg-purple-600 hover:bg-purple-700' };
      case 'dispensed':
        return { text: 'View Details', color: 'bg-gray-600 hover:bg-gray-700' };
      default:
        return { text: 'Process', color: 'bg-blue-600 hover:bg-blue-700' };
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pharmacy Operations</h1>
          <p className="text-gray-600">Prescription Processing & Patient Care</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">{currentTenant?.name}</p>
          <p className="text-xs text-gray-400">Licensed Pharmacy - Prescription Processing Only</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Prescriptions</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.received}</div>
            <p className="text-xs text-muted-foreground">Ready to process</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Package2 className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{metrics.processing}</div>
            <p className="text-xs text-muted-foreground">Insurance pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready for Pickup</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.ready}</div>
            <p className="text-xs text-muted-foreground">Awaiting patient</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dispensed Today</CardTitle>
            <Receipt className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{metrics.dispensed}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${metrics.todayRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Patient copays</p>
          </CardContent>
        </Card>
      </div>

      {/* Prescription Processing Workflow */}
      <Tabs defaultValue="received" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="received" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>New ({metrics.received})</span>
          </TabsTrigger>
          <TabsTrigger value="processing" className="flex items-center space-x-2">
            <Package2 className="h-4 w-4" />
            <span>Processing ({metrics.processing})</span>
          </TabsTrigger>
          <TabsTrigger value="ready" className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>Ready ({metrics.ready})</span>
          </TabsTrigger>
          <TabsTrigger value="dispensed" className="flex items-center space-x-2">
            <Receipt className="h-4 w-4" />
            <span>Dispensed ({metrics.dispensed})</span>
          </TabsTrigger>
        </TabsList>

        {(['received', 'processing', 'ready', 'dispensed'] as const).map((status) => (
          <TabsContent key={status} value={status}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {getStatusIcon(status)}
                  <span>{status.charAt(0).toUpperCase() + status.slice(1)} Prescriptions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activePrescriptions
                    .filter((p) => p.status === status)
                    .map((prescription) => {
                      const actionButton = getActionButton(prescription);
                      return (
                        <div key={prescription.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex-1">
                            <div className="flex items-start space-x-4">
                              <div className="flex-1">
                                <p className="font-semibold text-lg">{prescription.patientName}</p>
                                <p className="text-blue-600 font-medium">{prescription.medication} {prescription.dosage}</p>
                                <p className="text-sm text-gray-600">Qty: {prescription.quantity} | Dr. {prescription.prescriberName}</p>
                                <p className="text-xs text-gray-500">{prescription.instructions}</p>
                                {prescription.insuranceProvider && (
                                  <div className="flex items-center space-x-2 mt-2">
                                    <Shield className="h-4 w-4 text-blue-500" />
                                    <span className="text-sm text-blue-600">{prescription.insuranceProvider}</span>
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <Badge className={getStatusColor(prescription.status)}>
                                  {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                                </Badge>
                                <p className="font-semibold text-green-600 mt-2">
                                  Patient Pay: ${prescription.insuranceCopay?.toFixed(2) || prescription.totalCost.toFixed(2)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Total: ${prescription.totalCost.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="ml-4">
                            <Dialog open={dialogOpen && selectedPrescription?.id === prescription.id} onOpenChange={setDialogOpen}>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  className={actionButton.color}
                                  onClick={() => {
                                    setSelectedPrescription(prescription);
                                    setDialogOpen(true);
                                  }}
                                >
                                  {actionButton.text}
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>
                                    {status === 'received' && 'Process Prescription'}
                                    {status === 'processing' && 'File Insurance Claim'}
                                    {status === 'ready' && 'Dispense Medication'}
                                    {status === 'dispensed' && 'Prescription Details'}
                                  </DialogTitle>
                                </DialogHeader>
                                <PrescriptionProcessingDialog 
                                  prescription={selectedPrescription}
                                  status={status}
                                  onProcess={(action, details) => {
                                    if (selectedPrescription) {
                                      processPrescriptionMutation.mutate({
                                        prescriptionId: selectedPrescription.id,
                                        action,
                                        details
                                      });
                                    }
                                  }}
                                />
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      );
                    })}
                  {activePrescriptions.filter((p) => p.status === status).length === 0 && (
                    <p className="text-center py-8 text-gray-500">No {status} prescriptions</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

// Prescription Processing Dialog Component
function PrescriptionProcessingDialog({ 
  prescription, 
  status, 
  onProcess 
}: { 
  prescription: PharmacyPrescription | null;
  status: string;
  onProcess: (action: string, details?: any) => void;
}) {
  const [copayAmount, setCopayAmount] = useState('');
  const [claimNotes, setClaimNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  if (!prescription) return null;

  return (
    <div className="space-y-6">
      {/* Prescription Details */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <h4 className="font-semibold text-gray-900">Patient Information</h4>
          <p className="font-medium">{prescription.patientName}</p>
          <p className="text-sm text-gray-600">ID: {prescription.patientId}</p>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">Prescription Details</h4>
          <p className="font-medium">{prescription.medication} {prescription.dosage}</p>
          <p className="text-sm text-gray-600">Quantity: {prescription.quantity}</p>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">Prescribing Doctor</h4>
          <p className="font-medium">Dr. {prescription.prescriberName}</p>
          <p className="text-sm text-gray-600">Instructions: {prescription.instructions}</p>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">Insurance & Cost</h4>
          <p className="font-medium">{prescription.insuranceProvider || 'Self-Pay'}</p>
          <p className="text-sm text-gray-600">Total Cost: ${prescription.totalCost.toFixed(2)}</p>
          <p className="text-sm font-semibold text-green-600">
            Patient Copay: ${prescription.insuranceCopay?.toFixed(2) || prescription.totalCost.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Status-specific Actions */}
      {status === 'received' && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Step 1: Start Processing</h4>
          <div className="space-y-3">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h5 className="font-medium text-blue-900">Processing Checklist:</h5>
              <ul className="text-sm text-blue-800 mt-2 space-y-1">
                <li>✓ Verify prescription authenticity</li>
                <li>✓ Check medication inventory</li>
                <li>✓ Review patient allergies and interactions</li>
                <li>✓ Prepare medication for dispensing</li>
              </ul>
            </div>
            <Button 
              onClick={() => onProcess('start_processing')}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Package2 className="h-4 w-4 mr-2" />
              Start Processing Prescription
            </Button>
          </div>
        </div>
      )}

      {status === 'processing' && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Step 2: File Insurance Claim</h4>
          <div className="space-y-3">
            <div>
              <Label htmlFor="copay">Confirm Patient Copay Amount</Label>
              <Input
                id="copay"
                type="number"
                step="0.01"
                placeholder={prescription.insuranceCopay?.toFixed(2) || "0.00"}
                value={copayAmount}
                onChange={(e) => setCopayAmount(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Insurance will cover: ${(prescription.totalCost - (prescription.insuranceCopay || 0)).toFixed(2)}
              </p>
            </div>
            <div>
              <Label htmlFor="notes">Claim Processing Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes for the insurance claim (optional)..."
                value={claimNotes}
                onChange={(e) => setClaimNotes(e.target.value)}
              />
            </div>
            <Button 
              onClick={() => onProcess('file_claim', { 
                copay: parseFloat(copayAmount) || prescription.insuranceCopay, 
                notes: claimNotes 
              })}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <FileText className="h-4 w-4 mr-2" />
              Submit Insurance Claim
            </Button>
          </div>
        </div>
      )}

      {status === 'ready' && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Step 3: Dispense & Collect Payment</h4>
          <div className="space-y-3">
            <div className="p-4 bg-green-50 rounded-lg">
              <h5 className="font-medium text-green-900">Ready for Patient Pickup</h5>
              <p className="text-sm text-green-800 mt-1">
                Insurance claim approved. Medication prepared and ready for dispensing.
              </p>
            </div>
            
            <div>
              <Label htmlFor="payment">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="insurance_card">Insurance Card</SelectItem>
                  <SelectItem value="hsa">HSA/FSA Card</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-purple-900">Amount to Collect:</span>
                <span className="text-xl font-bold text-purple-900">
                  ${prescription.insuranceCopay?.toFixed(2) || prescription.totalCost.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-purple-800 mt-1">Patient copay after insurance</p>
            </div>

            <Button 
              onClick={() => onProcess('dispense', { paymentMethod })}
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={!paymentMethod}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Complete Dispensing & Collect Payment
            </Button>
          </div>
        </div>
      )}

      {status === 'dispensed' && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Transaction Complete</h4>
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Date Received:</span>
              <span>{prescription.dateReceived}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Date Ready:</span>
              <span>{prescription.dateReady}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Date Dispensed:</span>
              <span>{prescription.dateDispensed}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Payment Collected:</span>
              <span className="text-green-600 font-semibold">
                ${prescription.insuranceCopay?.toFixed(2) || prescription.totalCost.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Status:</span>
              <span className="text-green-600 font-semibold">Complete ✓</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}