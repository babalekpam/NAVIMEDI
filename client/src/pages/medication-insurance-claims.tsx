import { useState } from "react";
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Search, 
  Plus, 
  FileText, 
  DollarSign, 
  Clock, 
  CheckCircle,
  AlertCircle,
  User,
  Pill,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { useTenant } from "@/contexts/tenant-context";
import { apiRequest } from "@/lib/queryClient";

// Medication insurance claim schema
const medicationClaimSchema = z.object({
  patientId: z.string().min(1, "Patient selection is required"),
  prescriptionId: z.string().min(1, "Prescription selection is required"),
  claimNumber: z.string().min(1, "Claim number is required"),
  medicationName: z.string().min(1, "Medication name is required"),
  medicationCode: z.string().min(1, "Medication code is required"),
  dosage: z.string().min(1, "Dosage is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  daysSupply: z.number().min(1, "Days supply must be at least 1"),
  medicationCost: z.number().min(0.01, "Medication cost must be greater than 0"),
  insuranceCoverageRate: z.number().min(0).max(100, "Coverage rate must be between 0-100%"),
  patientShare: z.number().min(0, "Patient share must be non-negative"),
  claimAmount: z.number().min(0.01, "Claim amount must be greater than 0"),
  diagnosticCode: z.string().min(1, "Diagnostic code is required"),
  pharmacyNpi: z.string().optional(),
  medicationNote: z.string().optional(),
});

type MedicationClaimForm = z.infer<typeof medicationClaimSchema>;

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  mrn: string;
  email?: string;
  phone?: string;
  dateOfBirth: string;
  insuranceInfo?: any;
}

interface Prescription {
  id: string;
  patientId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  quantity: number;
  refills: number;
  status: string;
  prescribedBy: string;
  createdAt: string;
}

interface InsuranceClaim {
  id: string;
  patientId: string;
  claimNumber: string;
  status: string;
  claimAmount: number;
  approvedAmount?: number;
  deductibleAmount?: number;
  copayAmount?: number;
  medicationName: string;
  dosage: string;
  quantity: number;
  submittedAt: string;
  processedAt?: string;
  // Patient info
  patientFirstName?: string;
  patientLastName?: string;
  patientMrn?: string;
}

export default function MedicationInsuranceClaims() {
  // Set page title
  React.useEffect(() => {
    document.title = "Insurance Claims - NaviMED";
    return () => {
      document.title = "NaviMED";
    };
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<MedicationClaimForm>({
    resolver: zodResolver(medicationClaimSchema),
    defaultValues: {
      patientId: "",
      prescriptionId: "",
      claimNumber: "",
      medicationName: "",
      medicationCode: "",
      dosage: "",
      quantity: 0,
      daysSupply: 0,
      medicationCost: 0,
      insuranceCoverageRate: 80,
      patientShare: 0,
      claimAmount: 0,
      diagnosticCode: "",
      pharmacyNpi: "",
      medicationNote: "",
    },
  });

  // Fetch insurance claims
  const { data: claims = [], isLoading } = useQuery<InsuranceClaim[]>({
    queryKey: ["/api/insurance-claims"],
    enabled: !!user && !!tenant,
  });

  // Fetch patients for claim creation
  const { data: patients = [], isLoading: patientsLoading } = useQuery<Patient[]>({
    queryKey: ["/api/billing/patients"],
    enabled: !!user && !!tenant && isCreateDialogOpen,
  });

  // Fetch prescriptions for selected patient
  const { data: prescriptions = [] } = useQuery<Prescription[]>({
    queryKey: ["/api/prescriptions/patient", selectedPatient?.id],
    enabled: !!selectedPatient?.id,
  });

  // Fetch patient insurance information
  const { data: patientInsurance } = useQuery({
    queryKey: ["/api/patient-insurance", selectedPatient?.id],
    enabled: !!selectedPatient?.id,
  });

  // Create medication insurance claim mutation
  const createClaimMutation = useMutation({
    mutationFn: async (data: MedicationClaimForm) => {
      const response = await apiRequest("/api/insurance-claims", {
        method: "POST",
        body: {
          ...data,
          claimType: "medication",
          status: "submitted",
          submittedAt: new Date().toISOString(),
        },
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Insurance claim submitted",
        description: "The medication insurance claim has been submitted successfully.",
      });
      form.reset();
      setSelectedPatient(null);
      setSelectedPrescription(null);
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/insurance-claims"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error submitting claim",
        description: error.message || "Failed to submit medication insurance claim.",
        variant: "destructive",
      });
    },
  });

  // Generate claim number
  const generateClaimNumber = () => {
    const prefix = "CLM";
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
  };

  // Download claim PDF function
  const downloadClaimPDF = async (claimId: string, claimNumber: string) => {
    try {
      const response = await fetch(`/api/insurance-claims/${claimId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }

      // Create blob from response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `Insurance_Claim_${claimNumber}.txt`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      toast({
        title: "Claim Downloaded",
        description: `Insurance claim ${claimNumber} has been downloaded successfully.`,
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download the insurance claim PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle patient selection
  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setSelectedPrescription(null);
    form.setValue("patientId", patient.id);
    form.setValue("prescriptionId", "");
    form.setValue("claimNumber", generateClaimNumber());
    form.setValue("medicationName", "");
    form.setValue("medicationCode", "");
    form.setValue("dosage", "");
    form.setValue("quantity", 0);
    form.setValue("diagnosticCode", "");
  };

  // Handle prescription selection
  const handlePrescriptionSelect = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    form.setValue("prescriptionId", prescription.id);
    form.setValue("medicationName", prescription.medicationName);
    form.setValue("medicationCode", `NDC-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}-${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`);
    form.setValue("dosage", prescription.dosage);
    form.setValue("quantity", prescription.quantity);
    form.setValue("daysSupply", Math.ceil(prescription.quantity / parseInt(prescription.frequency.split(' ')[0] || "1")));
    
    // Set default medication cost based on common drug pricing
    const baseCost = prescription.quantity * 12.50; // $12.50 per unit average
    form.setValue("medicationCost", Math.round(baseCost * 100) / 100);
    
    // Calculate patient share and claim amount
    calculateCostSharing();
  };

  // Calculate cost sharing based on medication cost and coverage rate
  const calculateCostSharing = () => {
    const medicationCost = form.getValues("medicationCost");
    const coverageRate = form.getValues("insuranceCoverageRate");
    
    if (medicationCost > 0 && coverageRate >= 0) {
      const insuranceCovers = (medicationCost * coverageRate) / 100;
      const patientPays = medicationCost - insuranceCovers;
      
      form.setValue("claimAmount", Math.round(insuranceCovers * 100) / 100);
      form.setValue("patientShare", Math.round(patientPays * 100) / 100);
    }
  };

  // Auto-calculate when cost or coverage changes
  React.useEffect(() => {
    calculateCostSharing();
  }, [form.watch("medicationCost"), form.watch("insuranceCoverageRate")]);

  const onSubmit = (data: MedicationClaimForm) => {
    createClaimMutation.mutate(data);
  };

  // Filter claims
  const filteredClaims = claims.filter((claim) => {
    const matchesSearch = 
      claim.claimNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.medicationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.patientFirstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.patientLastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.patientMrn?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || claim.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      submitted: { color: "bg-blue-100 text-blue-800", icon: Clock },
      processing: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      approved: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      denied: { color: "bg-red-100 text-red-800", icon: AlertCircle },
      paid: { color: "bg-green-200 text-green-900", icon: CheckCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.submitted;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <CreditCard className="h-12 w-12 mx-auto text-gray-400 animate-pulse" />
            <p className="mt-2 text-gray-500">Loading medication insurance claims...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Medication Insurance Claims</h1>
        <p className="text-gray-600">
          Submit and manage medication insurance claims with automatic patient data population
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search claims..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="denied">Denied</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Test Enhanced Form - Always Visible */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Submit New Claim (Enhanced v2.0)
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Enhanced Medication Insurance Claim Form - All Fields Visible</DialogTitle>
            </DialogHeader>
            
            {/* Simple Test Form - All Fields Always Visible */}
            <div className="space-y-6 p-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-3">🚀 ENHANCED FORM TEST - ALL NEW FIELDS</h3>
                
                {/* Auto-generated Claim Number */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Claim Number (Auto-generated)</label>
                  <input 
                    type="text" 
                    defaultValue="CLM-789123-456" 
                    readOnly 
                    className="w-full p-2 bg-gray-50 border rounded font-mono" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Medication Code (NDC)</label>
                    <input 
                      type="text" 
                      placeholder="NDC-1234-56" 
                      className="w-full p-2 border rounded font-mono" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Diagnostic Code (ICD-10)</label>
                    <input 
                      type="text" 
                      placeholder="Z79.01" 
                      className="w-full p-2 border rounded font-mono" 
                    />
                  </div>
                </div>

                {/* Cost Calculation Section */}
                <div className="border rounded-lg p-4 bg-green-50 mb-4">
                  <h4 className="font-semibold text-green-900 mb-3">💰 Cost & Insurance Coverage (INTERACTIVE)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Medication Cost ($)</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        placeholder="125.00" 
                        className="w-full p-2 border-2 border-blue-300 rounded focus:border-blue-500 focus:outline-none" 
                        onChange={(e) => {
                          const cost = parseFloat(e.target.value) || 0;
                          const coverageInput = e.target.parentElement.parentElement.children[1].querySelector('input');
                          const coverage = parseFloat(coverageInput.value) || 0;
                          const claimAmount = (cost * coverage / 100);
                          const patientShare = cost - claimAmount;
                          
                          const claimField = e.target.parentElement.parentElement.children[2].querySelector('input');
                          const shareField = e.target.parentElement.parentElement.children[3].querySelector('input');
                          
                          claimField.value = claimAmount.toFixed(2);
                          shareField.value = patientShare.toFixed(2);
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Insurance Coverage Rate (%)</label>
                      <input 
                        type="number" 
                        min="0" 
                        max="100" 
                        placeholder="80" 
                        className="w-full p-2 border-2 border-blue-300 rounded focus:border-blue-500 focus:outline-none" 
                        onChange={(e) => {
                          const coverage = parseFloat(e.target.value) || 0;
                          const costInput = e.target.parentElement.parentElement.children[0].querySelector('input');
                          const cost = parseFloat(costInput.value) || 0;
                          const claimAmount = (cost * coverage / 100);
                          const patientShare = cost - claimAmount;
                          
                          const claimField = e.target.parentElement.parentElement.children[2].querySelector('input');
                          const shareField = e.target.parentElement.parentElement.children[3].querySelector('input');
                          
                          claimField.value = claimAmount.toFixed(2);
                          shareField.value = patientShare.toFixed(2);
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Insurance Claim Amount ($)</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        placeholder="100.00" 
                        className="w-full p-2 bg-green-50 border-2 border-green-300 rounded font-semibold text-green-700 focus:border-green-500 focus:outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Patient Share ($)</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        placeholder="25.00" 
                        className="w-full p-2 bg-orange-50 border-2 border-orange-300 rounded font-semibold text-orange-700 focus:border-orange-500 focus:outline-none" 
                      />
                    </div>
                  </div>
                </div>

                {/* Medication Note */}
                <div>
                  <label className="block text-sm font-medium mb-2">Medication Note (NEW)</label>
                  <textarea 
                    className="w-full p-2 border rounded" 
                    rows={3}
                    placeholder="Special instructions, contraindications, or additional notes about the medication"
                  />
                </div>
              </div>
            </div>

            {/* Original Form (Hidden for Testing) */}
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-gray-600">Show Original Form (For Reference)</summary>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
                {/* Patient Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">1. Select Patient</h3>
                  <FormField
                    control={form.control}
                    name="patientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Patient</FormLabel>
                        <Select onValueChange={(value) => {
                          field.onChange(value);
                          const patient = patients.find(p => p.id === value);
                          if (patient) handlePatientSelect(patient);
                        }}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a patient" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {patientsLoading ? (
                              <SelectItem value="loading" disabled>Loading patients...</SelectItem>
                            ) : patients.length === 0 ? (
                              <SelectItem value="no-patients" disabled>No patients found</SelectItem>
                            ) : (
                              patients.map((patient) => (
                                <SelectItem key={patient.id} value={patient.id}>
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    <span>{patient.firstName} {patient.lastName}</span>
                                    <span className="text-sm text-gray-500">({patient.mrn})</span>
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedPatient && (
                    <Card className="bg-blue-50">
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Name:</span> {selectedPatient.firstName} {selectedPatient.lastName}
                          </div>
                          <div>
                            <span className="font-medium">MRN:</span> {selectedPatient.mrn}
                          </div>
                          <div>
                            <span className="font-medium">DOB:</span> {new Date(selectedPatient.dateOfBirth).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-medium">Phone:</span> {selectedPatient.phone || "N/A"}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Prescription Selection */}
                {selectedPatient && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">2. Select Prescription</h3>
                    <FormField
                      control={form.control}
                      name="prescriptionId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prescription</FormLabel>
                          <Select onValueChange={(value) => {
                            field.onChange(value);
                            const prescription = prescriptions.find(p => p.id === value);
                            if (prescription) handlePrescriptionSelect(prescription);
                          }}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a prescription" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {prescriptions.map((prescription) => (
                                <SelectItem key={prescription.id} value={prescription.id}>
                                  <div className="flex items-center gap-2">
                                    <Pill className="h-4 w-4" />
                                    <span>{prescription.medicationName}</span>
                                    <span className="text-sm text-gray-500">
                                      {prescription.dosage} - {prescription.quantity} units
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {selectedPrescription && (
                      <Card className="bg-green-50">
                        <CardContent className="pt-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Medication:</span> {selectedPrescription.medicationName}
                            </div>
                            <div>
                              <span className="font-medium">Dosage:</span> {selectedPrescription.dosage}
                            </div>
                            <div>
                              <span className="font-medium">Quantity:</span> {selectedPrescription.quantity}
                            </div>
                            <div>
                              <span className="font-medium">Frequency:</span> {selectedPrescription.frequency}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {/* Claim Details */}
                {selectedPrescription && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">3. Claim Details</h3>
                    
                    {/* Auto-generated Claim Number */}
                    <FormField
                      control={form.control}
                      name="claimNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Claim Number (Auto-generated)</FormLabel>
                          <FormControl>
                            <Input {...field} readOnly className="bg-gray-50 font-mono" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="medicationName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Medication Name</FormLabel>
                            <FormControl>
                              <Input {...field} readOnly className="bg-gray-50" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="medicationCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Medication Code (NDC)</FormLabel>
                            <FormControl>
                              <Input {...field} className="font-mono" placeholder="NDC-XXXX-XX" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dosage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dosage</FormLabel>
                            <FormControl>
                              <Input {...field} readOnly className="bg-gray-50" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                readOnly 
                                className="bg-gray-50" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="daysSupply"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Days Supply</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="diagnosticCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Diagnostic Code (ICD-10)</FormLabel>
                            <FormControl>
                              <Input {...field} className="font-mono" placeholder="ICD-10 Code (e.g., Z79.01)" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Cost and Insurance Information */}
                    <div className="border rounded-lg p-4 bg-blue-50">
                      <h4 className="font-semibold text-blue-900 mb-3">Cost & Insurance Coverage</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="medicationCost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Medication Cost ($)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.01"
                                  {...field} 
                                  onChange={(e) => {
                                    field.onChange(parseFloat(e.target.value));
                                    setTimeout(calculateCostSharing, 100);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="insuranceCoverageRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Insurance Coverage Rate (%)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="0"
                                  max="100"
                                  {...field} 
                                  onChange={(e) => {
                                    field.onChange(parseFloat(e.target.value));
                                    setTimeout(calculateCostSharing, 100);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="claimAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Insurance Claim Amount ($)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.01"
                                  {...field} 
                                  readOnly
                                  className="bg-green-50 font-semibold text-green-700"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="patientShare"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Patient Share ($)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.01"
                                  {...field} 
                                  readOnly
                                  className="bg-orange-50 font-semibold text-orange-700"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="pharmacyNpi"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pharmacy NPI (Optional)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter pharmacy NPI" className="font-mono" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="medicationNote"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medication Note</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Special instructions, contraindications, or additional notes about the medication" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createClaimMutation.isPending}>
                    {createClaimMutation.isPending ? "Submitting..." : "Submit Claim"}
                  </Button>
                </div>
              </form>
            </Form>
            </details>
          </DialogContent>
        </Dialog>
      </div>

      {/* Claims List */}
      <div className="grid gap-4">
        {filteredClaims.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No medication claims found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || statusFilter !== "all" 
                ? "No claims match your current filters." 
                : "Submit your first medication insurance claim to get started."
              }
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Submit First Claim
              </Button>
            )}
          </Card>
        ) : (
          filteredClaims.map((claim) => (
            <Card key={claim.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {claim.claimNumber}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Patient: {claim.patientFirstName} {claim.patientLastName} ({claim.patientMrn})
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(claim.status)}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadClaimPDF(claim.id, claim.claimNumber)}
                      data-testid={`download-claim-${claim.id}`}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Download Claim
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Medication:</span>
                    <p>{claim.medicationName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Dosage:</span>
                    <p>{claim.dosage}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Quantity:</span>
                    <p>{claim.quantity}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Claim Amount:</span>
                    <p className="font-semibold text-green-600">${claim.claimAmount ? parseFloat(claim.claimAmount).toFixed(2) : '0.00'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Submitted:</span>
                    <p>{new Date(claim.submittedAt).toLocaleDateString()}</p>
                  </div>
                  {claim.approvedAmount && (
                    <div>
                      <span className="font-medium text-gray-700">Approved:</span>
                      <p className="font-semibold text-blue-600">${parseFloat(claim.approvedAmount).toFixed(2)}</p>
                    </div>
                  )}
                  {claim.copayAmount && (
                    <div>
                      <span className="font-medium text-gray-700">Copay:</span>
                      <p className="font-semibold text-orange-600">${parseFloat(claim.copayAmount).toFixed(2)}</p>
                    </div>
                  )}
                  {claim.processedAt && (
                    <div>
                      <span className="font-medium text-gray-700">Processed:</span>
                      <p>{new Date(claim.processedAt).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}