import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DollarSign, Plus, Search, Filter, MoreHorizontal, FileText, CreditCard, X, Eye, Send, Calendar, CheckCircle, Clock, AlertCircle, Trash2, Calculator, Copy, Edit, Share, Download } from "lucide-react";
import { InsuranceClaim, Patient, ServicePrice, InsuranceProvider, PatientInsurance, ClaimLineItem, insertInsuranceClaimSchema, insertClaimLineItemSchema } from "@shared/schema";
import { useAuth } from "@/contexts/auth-context";
import { useTenant } from "@/contexts/tenant-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  submitted: "bg-blue-100 text-blue-800",
  processing: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  denied: "bg-red-100 text-red-800",
  paid: "bg-green-100 text-green-800",
};

export default function Billing() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<InsuranceClaim | null>(null);
  const [selectedLineItems, setSelectedLineItems] = useState<ClaimLineItem[]>([]);
  const [isAddServiceDialogOpen, setIsAddServiceDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    patientId: "",
    patientInsuranceId: "",
    claimNumber: "",
    diagnosisCodes: "",
    procedureCodes: "",
    totalAmount: "",
    appointmentId: "",
    notes: ""
  });
  
  // Manual insurance entry form data
  // Auto insurance verification only - no manual entry needed
  const [serviceFormData, setServiceFormData] = useState({
    servicePriceId: "",
    quantity: "1",
    notes: ""
  });
  const [calculatedPricing, setCalculatedPricing] = useState<{
    unitPrice: number;
    copayAmount: number;
    insuranceAmount: number;
    deductibleAmount: number;
  } | null>(null);
  const { user } = useAuth();
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Check if user is a physician (read-only access)
  const isPhysician = user?.role === 'physician';

  // Handle patient selection and auto-populate prescription and insurance data
  const handlePatientSelection = async (patientId: string) => {
    setFormData(prev => ({ ...prev, patientId }));
    
    try {
      // 1. Automatically load patient insurance information (PRIORITY)
      console.log(`[AUTO-INSURANCE] Loading insurance for patient: ${patientId}`);
      const insuranceResponse = await apiRequest('GET', `/api/patient-insurance/${patientId}`);
      
      if (insuranceResponse.ok) {
        const insuranceData = await insuranceResponse.json();
        console.log(`[AUTO-INSURANCE] Found ${insuranceData.length} insurance records:`, insuranceData);
        
        if (insuranceData.length > 0) {
          // Auto-select primary insurance or first available
          const primaryInsurance = insuranceData.find((ins: any) => ins.isPrimary) || insuranceData[0];
          
          setFormData(prev => ({
            ...prev,
            patientId,
            patientInsuranceId: primaryInsurance.id
          }));
          
          console.log(`[AUTO-INSURANCE] Auto-selected insurance:`, primaryInsurance);
          
          toast({
            title: "Insurance Auto-Loaded",
            description: `Automatically loaded ${primaryInsurance.insuranceProvider?.name || 'insurance'} (${primaryInsurance.policyNumber})${primaryInsurance.isPrimary ? ' - Primary' : ''}`,
          });
        } else {
          console.log(`[AUTO-INSURANCE] No insurance found for patient ${patientId}`);
          toast({
            title: "No Insurance Found",
            description: "Patient has no insurance information on file. Please contact patient to verify insurance details.",
            variant: "destructive",
          });
        }
      }
      
      // 2. Also fetch prescriptions for context (secondary)
      const prescriptionsResponse = await apiRequest('GET', `/api/prescriptions${patientId ? `?patientId=${patientId}` : ''}`);
      
      if (prescriptionsResponse.ok) {
        const prescriptions = await prescriptionsResponse.json();
        
        // Filter for active prescriptions (not cancelled, expired, or picked up)
        const activePrescriptions = prescriptions.filter((p: any) => 
          p.status !== 'cancelled' && 
          p.status !== 'expired' && 
          p.status !== 'picked_up' &&
          (!p.expiryDate || new Date(p.expiryDate) > new Date())
        );
        
        if (activePrescriptions.length > 0) {
          // Auto-populate with most recent active prescription data
          const latestPrescription = activePrescriptions[0];
          
          setFormData(prev => ({
            ...prev,
            totalAmount: latestPrescription.total_cost?.toString() || latestPrescription.totalCost?.toString() || prev.totalAmount,
            notes: `${latestPrescription.medicationName || latestPrescription.medication_name} - ${latestPrescription.dosage} (${latestPrescription.quantity} units, prescribed by ${latestPrescription.providerName || latestPrescription.provider_name || 'Hospital'})`,
            procedureCodes: latestPrescription.ndc || "",
            diagnosisCodes: latestPrescription.diagnosisCodes || latestPrescription.diagnosis_codes || ""
          }));
          
          console.log("[PRESCRIPTION-DATA] Auto-populated prescription data:", latestPrescription);
        }
      }
    } catch (error) {
      console.error("Error fetching patient data:", error);
      toast({
        title: "Error Loading Patient Data",
        description: "Failed to load patient insurance information. Please try again.",
        variant: "destructive",
      });
    }
  };

  const { data: claims = [], isLoading } = useQuery<InsuranceClaim[]>({
    queryKey: ["/api/insurance-claims"],
    enabled: !!user && !!tenant,
  });

  // Use specialized billing patients endpoint that includes cross-tenant patients for pharmacies
  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["/api/billing/patients"],
    enabled: !!user && !!tenant,
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache the results (gcTime is the new name for cacheTime in TanStack Query v5)
  });

  const { data: servicePrices = [] } = useQuery<ServicePrice[]>({
    queryKey: ["/api/service-prices"],
    enabled: !!user && !!tenant,
  });

  const { data: insuranceProviders = [] } = useQuery<InsuranceProvider[]>({
    queryKey: ["/api/insurance-providers"],
    enabled: !!user && !!tenant,
  });

  // Get patient insurance when a patient is selected
  const { data: patientInsurance = [] } = useQuery<PatientInsurance[]>({
    queryKey: ["/api/patient-insurance", formData.patientId],
    enabled: !!formData.patientId,
  });

  // Get claim line items when a claim is selected
  const { data: claimLineItems = [] } = useQuery<ClaimLineItem[]>({
    queryKey: ["/api/claim-line-items", selectedClaim?.id],
    enabled: !!selectedClaim?.id,
  });

  const calculatePricingMutation = useMutation({
    mutationFn: async ({ servicePriceId, patientInsuranceId }: { servicePriceId: string; patientInsuranceId: string }) => {
      const selectedInsurance = patientInsurance.find(pi => pi.id === patientInsuranceId);
      if (!selectedInsurance) throw new Error("Patient insurance not found");

      const response = await apiRequest("POST", "/api/calculate-pricing", {
        servicePriceId,
        insuranceProviderId: selectedInsurance.insuranceProviderId,
        patientInsuranceId
      });
      return response.json();
    },
    onSuccess: (data) => {
      setCalculatedPricing(data);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to calculate pricing.",
        variant: "destructive",
      });
    },
  });

  const createClaimMutation = useMutation({
    mutationFn: async (claimData: any) => {
      console.log("Creating claim with data:", claimData);
      try {
        const response = await apiRequest("POST", "/api/insurance-claims", claimData);
        console.log("Response status:", response.status);
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        const result = await response.json();
        console.log("Success result:", result);
        return result;
      } catch (error) {
        console.error("Full error:", error);
        throw error;
      }
    },
    onSuccess: async (claim) => {
      queryClient.invalidateQueries({ queryKey: ["/api/insurance-claims"] });
      
      // Auto-generate patient receipt with copay amount
      try {
        const totalAmount = parseFloat(formData.totalAmount) || 0;
        const patientCopay = parseFloat(claim.totalPatientCopay) || 0;
        
        const receiptData = {
          patientId: formData.patientId,
          totalAmount: patientCopay.toString(), // Patient only pays copay
          paymentMethod: "insurance", // Indicate this is insurance payment
          items: [{
            name: `Medication (Insurance Claim: ${claim.claimNumber})`,
            quantity: 1,
            unitPrice: totalAmount,
            total: totalAmount,
            copayAmount: patientCopay,
            insuranceCovered: totalAmount - patientCopay
          }],
          notes: `Insurance claim processed. Total: $${totalAmount.toFixed(2)}, Insurance coverage: $${(totalAmount - patientCopay).toFixed(2)}, Patient copay: $${patientCopay.toFixed(2)}`
        };

        console.log("Auto-generating receipt with data:", receiptData);
        
        const receiptResponse = await apiRequest("POST", "/api/receipts", receiptData);
        if (receiptResponse.ok) {
          const receipt = await receiptResponse.json();
          console.log("Receipt auto-generated:", receipt);
          
          toast({
            title: "Claim Created & Receipt Generated",
            description: `Insurance claim created successfully. Patient receipt generated for copay amount: $${patientCopay.toFixed(2)}`,
          });
        } else {
          throw new Error("Failed to generate receipt");
        }
      } catch (receiptError) {
        console.error("Receipt generation failed:", receiptError);
        toast({
          title: "Claim Created",
          description: "Insurance claim created successfully, but receipt generation failed. Please create receipt manually.",
          variant: "destructive",
        });
      }
      
      // Reset form
      setIsCreateDialogOpen(false);
      setSelectedLineItems([]);
      setFormData({
        patientId: "",
        patientInsuranceId: "",
        claimNumber: "",
        diagnosisCodes: "",
        procedureCodes: "",
        totalAmount: "",
        appointmentId: "",
        notes: ""
      });
      // Form reset complete - auto insurance verification will reload when patient is selected again
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create insurance claim.",
        variant: "destructive",
      });
    },
  });

  const addServiceMutation = useMutation({
    mutationFn: async (serviceData: any) => {
      if (!calculatedPricing) throw new Error("Please calculate pricing first");
      
      const quantity = parseInt(serviceData.quantity);
      const totalPrice = calculatedPricing.unitPrice * quantity;
      const totalCopay = calculatedPricing.copayAmount * quantity;
      const totalInsurance = calculatedPricing.insuranceAmount * quantity;

      const lineItem = {
        servicePriceId: serviceData.servicePriceId,
        quantity,
        unitPrice: calculatedPricing.unitPrice,
        totalPrice,
        copayAmount: totalCopay,
        insuranceAmount: totalInsurance,
        notes: serviceData.notes
      };

      setSelectedLineItems(prev => [...prev, lineItem as any]);
      return lineItem;
    },
    onSuccess: () => {
      setIsAddServiceDialogOpen(false);
      setServiceFormData({
        servicePriceId: "",
        quantity: "1",
        notes: ""
      });
      setCalculatedPricing(null);
      toast({
        title: "Service Added",
        description: "Service has been added to the claim.",
      });
    },
  });

  const submitClaimMutation = useMutation({
    mutationFn: async (claimId: string) => {
      const response = await apiRequest("PATCH", `/api/insurance-claims/${claimId}`, {
        status: 'submitted',
        submittedDate: new Date().toISOString()
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/insurance-claims"] });
      setIsViewDialogOpen(false);
      toast({
        title: "Claim Submitted",
        description: "Insurance claim has been submitted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit insurance claim.",
        variant: "destructive",
      });
    },
  });

  const filteredClaims = claims.filter(claim => {
    const patient = patients.find(p => p.id === claim.patientId);
    const patientName = patient ? `${patient.firstName} ${patient.lastName}` : "";
    const matchesSearch = patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         claim.claimNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || claim.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : `Patient ${patientId.slice(-4)}`;
  };

  const handleCreateClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Debug logging
      console.log("Form data:", formData);
      console.log("Auto-insurance verification mode active");
      
      // Check required fields
      if (!formData.patientId) {
        toast({
          title: "Error",
          description: "Please select a patient.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate patient insurance is automatically loaded
      if (!formData.patientInsuranceId) {
        toast({
          title: "Error",
          description: "Patient insurance information is required. Please ensure the patient has insurance on file.",
          variant: "destructive",
        });
        return;
      }
      
      // For pharmacy claims, we don't require line items - we work with medication costs directly
      const totalAmount = parseFloat(formData.totalAmount) || 0;
      
      if (totalAmount <= 0) {
        toast({
          title: "Error",
          description: "Please enter a valid total amount for the medication claim.",
          variant: "destructive",
        });
        return;
      }

      // Calculate copay based on patient's actual insurance information
      let totalPatientCopay = 0;
      let totalInsuranceAmount = 0;
      
      // Find the selected patient insurance to get actual coverage details
      const selectedInsurance = patientInsurance.find(ins => ins.id === formData.patientInsuranceId);
      
      if (selectedInsurance) {
        // Use actual coverage percentage from patient's insurance record
        const coveragePercent = (selectedInsurance.coveragePercentage || 80) / 100;
        totalInsuranceAmount = totalAmount * coveragePercent;
        totalPatientCopay = totalAmount - totalInsuranceAmount;
        
        console.log(`[AUTO-COPAY] Using real insurance data: ${selectedInsurance.insuranceProvider?.name}, Coverage: ${selectedInsurance.coveragePercentage || 80}%`);
        console.log(`[AUTO-COPAY] Total: $${totalAmount}, Insurance pays: $${totalInsuranceAmount.toFixed(2)}, Patient copay: $${totalPatientCopay.toFixed(2)}`);
      } else {
        // Fallback (should not happen with validation above)
        totalPatientCopay = totalAmount * 0.2;
        totalInsuranceAmount = totalAmount * 0.8;
        console.log(`[AUTO-COPAY] Using fallback 80/20 split`);
      }

      // Generate unique claim number if not provided
      const claimNumber = formData.claimNumber || `CLM-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      const rawClaimData = {
        patientId: formData.patientId,
        patientInsuranceId: formData.patientInsuranceId, // Always use patient's actual insurance
        claimNumber,
        diagnosisCodes: formData.diagnosisCodes.split(',').map(code => code.trim()).filter(Boolean),
        procedureCodes: formData.procedureCodes.split(',').map(code => code.trim()).filter(Boolean),
        totalAmount: totalAmount.toString(),
        totalPatientCopay: totalPatientCopay.toString(),
        totalInsuranceAmount: totalInsuranceAmount.toString(),
        status: 'draft',
        appointmentId: formData.appointmentId || null,
        notes: formData.notes || `Pharmacy medication claim for $${totalAmount} (Auto-verified insurance: ${selectedInsurance?.insuranceProvider?.name || 'Insurance'} - ${selectedInsurance?.policyNumber || 'Policy'})`
      };
      
      console.log("Raw claim data before validation:", rawClaimData);
      
      // Note: tenantId will be added by the backend, so we don't include it here
      // Also, patientInsuranceId can be null for manual insurance entry
      const claimDataForAPI = {
        ...rawClaimData,
        patientInsuranceId: rawClaimData.patientInsuranceId || undefined
      };
      
      console.log("Final claim data for API:", claimDataForAPI);
      const claimData = claimDataForAPI;
      
      console.log("Claim data to submit:", claimData);
      console.log("About to call mutation...");

      await createClaimMutation.mutateAsync(claimData);
      console.log("Mutation completed successfully");
    } catch (error: any) {
      console.error("handleCreateClaim error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create insurance claim.",
        variant: "destructive",
      });
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!serviceFormData.servicePriceId || !formData.patientInsuranceId) {
      toast({
        title: "Error",
        description: "Please select a service and patient insurance.",
        variant: "destructive",
      });
      return;
    }

    await addServiceMutation.mutateAsync(serviceFormData);
  };

  const handleCalculatePricing = () => {
    if (serviceFormData.servicePriceId && formData.patientInsuranceId) {
      calculatePricingMutation.mutate({
        servicePriceId: serviceFormData.servicePriceId,
        patientInsuranceId: formData.patientInsuranceId
      });
    }
  };

  // Auto-calculate pricing when service or insurance changes
  useEffect(() => {
    if (serviceFormData.servicePriceId && formData.patientInsuranceId) {
      handleCalculatePricing();
    }
  }, [serviceFormData.servicePriceId, formData.patientInsuranceId]);

  const removeLineItem = (index: number) => {
    setSelectedLineItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleViewClaim = (claim: InsuranceClaim) => {
    setSelectedClaim(claim);
    setIsViewDialogOpen(true);
  };

  const handleSubmitClaim = (claimId: string) => {
    submitClaimMutation.mutate(claimId);
  };

  // Filter claims for physicians to show only their related claims
  const physicianFilteredClaims = isPhysician 
    ? filteredClaims.filter(claim => {
        // For now, show all claims for physicians - this can be refined later
        // to filter based on appointment provider when that relationship is available
        return true;
      })
    : filteredClaims;

  // Calculate summary statistics based on user role
  const statsData = physicianFilteredClaims;
  const totalClaimsAmount = statsData.reduce((sum, claim) => sum + parseFloat(claim.totalAmount), 0);
  const approvedAmount = statsData
    .filter(claim => claim.status === 'approved' || claim.status === 'paid')
    .reduce((sum, claim) => sum + parseFloat(claim.approvedAmount || '0'), 0);
  const paidAmount = statsData
    .filter(claim => claim.status === 'paid')
    .reduce((sum, claim) => sum + parseFloat(claim.paidAmount || '0'), 0);
  const pendingClaims = statsData.filter(claim => 
    claim.status === 'submitted' || claim.status === 'processing'
  ).length;

  if (!user || !tenant) {
    return <div>Loading...</div>;
  }

  const displayClaims = physicianFilteredClaims;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isPhysician ? "My Billing Summary" : "Billing & Claims"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isPhysician 
              ? "View your service billing information and revenue summary" 
              : "Manage insurance claims and billing operations"
            }
          </p>
        </div>
        {!isPhysician && (user.role === "billing_staff" || user.role === "tenant_admin" || user.role === "director" || (user.role === "receptionist" && (tenant?.type === "hospital" || tenant?.type === "clinic"))) && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Claim
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Medication Insurance Claim</DialogTitle>
                <DialogDescription>
                  Create a new insurance claim for medication dispensing. Enter the medication cost and patient information.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="patientId">Patient</Label>
                    <Select value={formData.patientId} onValueChange={handlePatientSelection}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.firstName} {patient.lastName} ({patient.mrn})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="claimNumber">Claim Number *</Label>
                    <Input
                      id="claimNumber"
                      placeholder="Auto-generated automatically"
                      value={formData.claimNumber || "Auto-generated on submit"}
                      onChange={(e) => setFormData({...formData, claimNumber: e.target.value})}
                      className="bg-gray-50 text-gray-600"
                    />
                    <p className="text-xs text-gray-500">
                      Claim numbers are automatically generated. You can override by typing a custom number.
                    </p>
                  </div>
                </div>

                {/* Auto-Loaded Insurance Information */}
                {formData.patientId && (
                  <>
                    <div className="space-y-3 border rounded-lg p-4 bg-green-50 border-green-200">
                      <Label className="text-base font-semibold text-green-800">Patient Insurance Information</Label>
                      
                      {/* Auto-loaded Insurance Display */}
                      <div className="space-y-2">
                        <Label htmlFor="patientInsuranceId">Automatically Loaded Insurance</Label>
                        {patientInsurance.length > 0 ? (
                          <Select
                            value={formData.patientInsuranceId}
                            onValueChange={(value) => {
                              setFormData(prev => ({ ...prev, patientInsuranceId: value }));
                              
                              // Show confirmation of selection
                              const selectedInsurance = patientInsurance.find((ins: any) => ins.id === value);
                              if (selectedInsurance) {
                                toast({
                                  title: "Insurance Selected",
                                  description: `Using ${selectedInsurance.insuranceProvider?.name || 'insurance'} - ${selectedInsurance.policyNumber}`,
                                });
                              }
                            }}
                          >
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Insurance auto-loaded - select to confirm" />
                            </SelectTrigger>
                            <SelectContent>
                              {patientInsurance.map((insurance: any) => (
                                <SelectItem key={insurance.id} value={insurance.id}>
                                  <div className="flex flex-col">
                                    <div className="font-medium">
                                      {insurance.insuranceProvider?.name || 'Unknown Provider'}
                                      {insurance.isPrimary && ' (PRIMARY)'}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      Policy: {insurance.policyNumber} | Coverage: {insurance.coveragePercentage || 80}%
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                            <p className="text-sm text-yellow-800 font-medium">
                              ⚠️ No Insurance Found
                            </p>
                            <p className="text-sm text-yellow-700 mt-1">
                              This patient has no insurance information on file. Please contact patient to verify insurance details before creating claim.
                            </p>
                          </div>
                        )}
                        
                        {formData.patientInsuranceId && (
                          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                            <p className="text-sm text-green-800">
                              ✅ Insurance verified and ready for claim processing
                            </p>
                          </div>
                        )}
                      </div>


                    </div>
                  </>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="totalAmount">Medication Cost *</Label>
                  <Input
                    id="totalAmount"
                    type="number"
                    step="0.01"
                    placeholder="Enter total cost of medication"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData({...formData, totalAmount: e.target.value})}
                  />
                  <p className="text-xs text-gray-500">
                    Total medication cost (patient copay will be calculated automatically)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="procedureCodes">NDC/Medication Codes (comma-separated)</Label>
                  <Input
                    id="procedureCodes"
                    placeholder="e.g., 0069-2587-68, RX001"
                    value={formData.procedureCodes}
                    onChange={(e) => setFormData({...formData, procedureCodes: e.target.value})}
                  />
                  <p className="text-xs text-gray-500">
                    NDC numbers or pharmacy dispensing codes for this medication
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diagnosisCodes">Diagnosis Codes (comma-separated)</Label>
                  <Input
                    id="diagnosisCodes"
                    placeholder="e.g., I10, E11.9, M79.3"
                    value={formData.diagnosisCodes}
                    onChange={(e) => setFormData({...formData, diagnosisCodes: e.target.value})}
                  />
                  <p className="text-xs text-gray-500">
                    ICD-10 diagnosis codes from the prescribing physician
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Medication Notes (Optional)</Label>
                  <textarea 
                    id="notes"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="e.g., Lisinopril 10mg, 30 tablets, prescribed by Dr. Smith"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  />
                  <p className="text-xs text-gray-500">
                    Medication name, dosage, quantity, and prescriber information
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateClaim} 
                  disabled={createClaimMutation.isPending || !formData.patientId || !formData.totalAmount}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {createClaimMutation.isPending ? "Creating..." : "Create Claim"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {isPhysician ? "My Service Revenue" : "Total Claims"}
                </p>
                <p className="text-3xl font-bold text-gray-900">${totalClaimsAmount.toLocaleString()}</p>
                <p className="text-sm text-gray-500">
                  {statsData.length} {isPhysician ? "services billed" : "claims"}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved Amount</p>
                <p className="text-3xl font-bold text-gray-900">${approvedAmount.toLocaleString()}</p>
                <p className="text-sm text-green-600">
                  {totalClaimsAmount > 0 ? Math.round((approvedAmount / totalClaimsAmount) * 100) : 0}% approval rate
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {isPhysician ? "Payments Received" : "Paid Amount"}
                </p>
                <p className="text-3xl font-bold text-gray-900">${paidAmount.toLocaleString()}</p>
                <p className="text-sm text-gray-500">
                  {isPhysician ? "For your services" : "Received payments"}
                </p>
              </div>
              <div className="p-3 bg-teal-50 rounded-lg">
                <CreditCard className="h-6 w-6 text-teal-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Claims</p>
                <p className="text-3xl font-bold text-gray-900">{pendingClaims}</p>
                <p className="text-sm text-yellow-600">Awaiting response</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 text-gray-400 transform -translate-y-1/2" />
              <Input
                placeholder="Search by patient or claim number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="denied">Denied</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Claims List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            {isPhysician ? "My Service Claims" : "Insurance Claims"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center space-x-4 py-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                    <div className="h-8 w-20 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : displayClaims.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No claims found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery ? "No claims match your search criteria" : 
                 isPhysician ? "No billing information available for your services yet" : 
                 "No insurance claims have been created yet"}
              </p>
              {!isPhysician && (user.role === "billing_staff" || user.role === "tenant_admin" || user.role === "director" || (user.role === "receptionist" && (tenant?.type === "hospital" || tenant?.type === "clinic"))) && (
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Claim
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-0">
              {displayClaims.map((claim) => (
                <div 
                  key={claim.id}
                  className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        claim.status === 'paid' ? 'bg-green-50' : 
                        claim.status === 'denied' ? 'bg-red-50' :
                        claim.status === 'approved' ? 'bg-green-50' :
                        claim.status === 'processing' ? 'bg-yellow-50' :
                        'bg-blue-50'
                      }`}>
                        <DollarSign className={`h-5 w-5 ${
                          claim.status === 'paid' ? 'text-green-600' : 
                          claim.status === 'denied' ? 'text-red-600' :
                          claim.status === 'approved' ? 'text-green-600' :
                          claim.status === 'processing' ? 'text-yellow-600' :
                          'text-blue-600'
                        }`} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">
                          Claim #{claim.claimNumber}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          ${parseFloat(claim.totalAmount).toLocaleString()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        Patient: {getPatientName(claim.patientId)}
                      </p>
                      {/* Show insurance coverage breakdown for prescription claims */}
                      {(claim as any).totalInsuranceAmount && (claim as any).totalPatientCopay && (
                        <div className="flex space-x-4 text-xs mt-1">
                          <span className="text-green-600 bg-green-50 px-2 py-1 rounded">
                            Insurance: ${parseFloat((claim as any).totalInsuranceAmount || "0").toFixed(2)}
                          </span>
                          <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded">
                            Patient: ${parseFloat((claim as any).totalPatientCopay || "0").toFixed(2)}
                          </span>
                        </div>
                      )}
                      <p className="text-xs text-gray-400">
                        Submitted: {claim.submittedDate ? new Date(claim.submittedDate).toLocaleDateString() : 'Not submitted'}
                      </p>
                      {claim.approvedAmount && (
                        <p className="text-xs text-green-600">
                          Approved: ${parseFloat(claim.approvedAmount).toLocaleString()}
                        </p>
                      )}
                      {claim.paidAmount && (
                        <p className="text-xs text-green-600">
                          Paid: ${parseFloat(claim.paidAmount).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <Badge 
                        variant="secondary"
                        className={statusColors[claim.status as keyof typeof statusColors] || statusColors.draft}
                      >
                        {claim.status?.replace('_', ' ') || 'draft'}
                      </Badge>
                      {claim.processedDate && (
                        <p className="text-xs text-gray-400 mt-1">
                          Processed: {new Date(claim.processedDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-600 hover:text-blue-700"
                        onClick={() => handleViewClaim(claim)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {!isPhysician && claim.status === 'draft' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-green-600 hover:text-green-700 border-green-300 hover:border-green-400"
                          onClick={() => handleSubmitClaim(claim.id)}
                          disabled={submitClaimMutation.isPending}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Submit
                        </Button>
                      )}
                      {!isPhysician && claim.status === 'approved' && !claim.paidAmount && (
                        <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700">
                          Record Payment
                        </Button>
                      )}
                      {!isPhysician && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewClaim(claim)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {claim.status === 'draft' && (
                              <DropdownMenuItem onClick={() => handleSubmitClaim(claim.id)}>
                                <Send className="h-4 w-4 mr-2" />
                                Submit Claim
                              </DropdownMenuItem>
                            )}
                            {claim.status === 'approved' && !claim.paidAmount && (
                              <DropdownMenuItem onClick={() => {
                                // TODO: Implement record payment functionality
                                console.log('Record payment for claim:', claim.id);
                              }}>
                                <Calculator className="h-4 w-4 mr-2" />
                                Record Payment
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => {
                              // Copy claim details to clipboard
                              const claimText = `Claim: ${claim.claimNumber}\nPatient: ${getPatientName(claim.patientId)}\nTotal Amount: $${claim.totalAmount}\nStatus: ${claim.status}\nSubmitted: ${new Date(claim.createdAt).toLocaleDateString()}`;
                              navigator.clipboard.writeText(claimText);
                            }}>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              // Share claim info
                              if (navigator.share) {
                                navigator.share({
                                  title: `Insurance Claim: ${claim.claimNumber}`,
                                  text: `Total: $${claim.totalAmount} - Status: ${claim.status}`,
                                });
                              }
                            }}>
                              <Share className="h-4 w-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              // Download claim as PDF (placeholder)
                              console.log('Download claim PDF:', claim.id);
                            }}>
                              <Download className="h-4 w-4 mr-2" />
                              Download PDF
                            </DropdownMenuItem>
                            {(user.role === "tenant_admin" || user.role === "super_admin") && claim.status === 'draft' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => {
                                    if (confirm('Are you sure you want to delete this draft claim?')) {
                                      // TODO: Implement delete claim functionality
                                      console.log('Delete claim:', claim.id);
                                    }
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Draft
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Claim Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Claim Details - {selectedClaim?.claimNumber}</DialogTitle>
            <DialogDescription>
              View complete insurance claim information and submit for processing.
            </DialogDescription>
          </DialogHeader>
          
          {selectedClaim && (
            <div className="space-y-6">
              {/* Patient Information */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Patient Information</h3>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Patient Name</Label>
                      <p className="text-sm text-gray-900">{getPatientName(selectedClaim.patientId)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Claim Information</h3>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Claim Number</Label>
                      <p className="text-sm text-gray-900">{selectedClaim.claimNumber}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Status</Label>
                      <Badge variant="secondary" className={statusColors[selectedClaim.status as keyof typeof statusColors] || statusColors.draft}>
                        {selectedClaim.status?.replace('_', ' ') || 'draft'}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Total Amount</Label>
                      <p className="text-sm text-gray-900">${parseFloat(selectedClaim.totalAmount).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical Codes */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Procedure Codes</Label>
                  <div className="mt-2 space-y-1">
                    {(selectedClaim.procedureCodes as string[] || []).map((code: string, index: number) => (
                      <Badge key={index} variant="outline" className="mr-2 mb-1">
                        {code}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Diagnosis Codes</Label>
                  <div className="mt-2 space-y-1">
                    {(selectedClaim.diagnosisCodes as string[] || []).map((code: string, index: number) => (
                      <Badge key={index} variant="outline" className="mr-2 mb-1">
                        {code}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
                
                {selectedClaim.status === 'draft' && (
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleSubmitClaim(selectedClaim.id)}
                    disabled={submitClaimMutation.isPending}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {submitClaimMutation.isPending ? 'Submitting...' : 'Submit Claim'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
