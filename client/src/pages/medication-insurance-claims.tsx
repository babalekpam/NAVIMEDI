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
import { useAuth } from "@/hooks/use-auth";
import { useTenant } from "@/hooks/use-tenant";
import { apiRequest } from "@/lib/queryClient";

// Medication insurance claim schema
const medicationClaimSchema = z.object({
  patientId: z.string().min(1, "Patient selection is required"),
  prescriptionId: z.string().min(1, "Prescription selection is required"),
  claimAmount: z.number().min(0.01, "Claim amount must be greater than 0"),
  medicationName: z.string().min(1, "Medication name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  daysSupply: z.number().min(1, "Days supply must be at least 1"),
  pharmacyNpi: z.string().optional(),
  notes: z.string().optional(),
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
      claimAmount: 0,
      medicationName: "",
      dosage: "",
      quantity: 0,
      daysSupply: 0,
      pharmacyNpi: "",
      notes: "",
    },
  });

  // Fetch insurance claims
  const { data: claims = [], isLoading } = useQuery<InsuranceClaim[]>({
    queryKey: ["/api/insurance-claims"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/insurance-claims");
      return response.json();
    },
    enabled: !!user && !!tenant,
  });

  // Fetch patients for claim creation
  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
    enabled: !!user && !!tenant && isCreateDialogOpen,
  });

  // Fetch prescriptions for selected patient
  const { data: prescriptions = [] } = useQuery<Prescription[]>({
    queryKey: ["/api/prescriptions/patient", selectedPatient?.id],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/prescriptions/patient/${selectedPatient?.id}`);
      return response.json();
    },
    enabled: !!selectedPatient?.id,
  });

  // Fetch patient insurance information
  const { data: patientInsurance } = useQuery({
    queryKey: ["/api/patient-insurance", selectedPatient?.id],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/patient-insurance/${selectedPatient?.id}`);
      return response.json();
    },
    enabled: !!selectedPatient?.id,
  });

  // Create medication insurance claim mutation
  const createClaimMutation = useMutation({
    mutationFn: async (data: MedicationClaimForm) => {
      const response = await apiRequest("POST", "/api/insurance-claims", {
        ...data,
        claimType: "medication",
        status: "submitted",
        submittedAt: new Date().toISOString(),
        claimNumber: `MED-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      });
      return response.json();
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

  // Handle patient selection
  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setSelectedPrescription(null);
    form.setValue("patientId", patient.id);
    form.setValue("prescriptionId", "");
    form.setValue("medicationName", "");
    form.setValue("dosage", "");
    form.setValue("quantity", 0);
  };

  // Handle prescription selection
  const handlePrescriptionSelect = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    form.setValue("prescriptionId", prescription.id);
    form.setValue("medicationName", prescription.medicationName);
    form.setValue("dosage", prescription.dosage);
    form.setValue("quantity", prescription.quantity);
    form.setValue("daysSupply", Math.ceil(prescription.quantity / parseInt(prescription.frequency.split(' ')[0] || "1")));
  };

  // Auto-calculate claim amount based on medication and insurance
  const calculateClaimAmount = () => {
    if (selectedPrescription && patientInsurance) {
      // Simple calculation - in real implementation, this would use complex pricing rules
      const basePrice = selectedPrescription.quantity * 10; // $10 per unit as example
      const coveragePercentage = patientInsurance[0]?.coveragePercentage || 0.8;
      const claimAmount = basePrice * coveragePercentage;
      form.setValue("claimAmount", Math.round(claimAmount * 100) / 100);
    }
  };

  // Auto-calculate when prescription or insurance changes
  React.useEffect(() => {
    calculateClaimAmount();
  }, [selectedPrescription, patientInsurance]);

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

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Submit New Claim
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Submit Medication Insurance Claim</DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                            {patients.map((patient) => (
                              <SelectItem key={patient.id} value={patient.id}>
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  <span>{patient.firstName} {patient.lastName}</span>
                                  <span className="text-sm text-gray-500">({patient.mrn})</span>
                                </div>
                              </SelectItem>
                            ))}
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

                {/* Auto-populated Claim Details */}
                {selectedPrescription && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">3. Claim Details (Auto-populated)</h3>
                    
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
                        name="claimAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Claim Amount ($)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01"
                                {...field} 
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="pharmacyNpi"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pharmacy NPI (Optional)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter pharmacy NPI" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Additional notes for the claim" />
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
                  {getStatusBadge(claim.status)}
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
                    <p className="font-semibold text-green-600">${claim.claimAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Submitted:</span>
                    <p>{new Date(claim.submittedAt).toLocaleDateString()}</p>
                  </div>
                  {claim.approvedAmount && (
                    <div>
                      <span className="font-medium text-gray-700">Approved:</span>
                      <p className="font-semibold text-blue-600">${claim.approvedAmount.toFixed(2)}</p>
                    </div>
                  )}
                  {claim.copayAmount && (
                    <div>
                      <span className="font-medium text-gray-700">Copay:</span>
                      <p className="font-semibold text-orange-600">${claim.copayAmount.toFixed(2)}</p>
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