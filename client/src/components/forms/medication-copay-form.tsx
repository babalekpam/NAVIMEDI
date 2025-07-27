import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Percent, Shield, Clock, AlertTriangle } from "lucide-react";
import { insertMedicationCopaySchema, type Patient, type PatientInsurance, type Prescription, type InsuranceProvider } from "@shared/schema";
import { useAuth } from "@/contexts/auth-context";
import { useTenant } from "@/contexts/tenant-context";
import { useToast } from "@/hooks/use-toast";

const copayFormSchema = insertMedicationCopaySchema.extend({
  patientId: z.string().min(1, "Patient is required"),
  patientInsuranceId: z.string().min(1, "Patient insurance is required"),
  medicationName: z.string().min(1, "Medication name is required"),
  fullPrice: z.string().min(1, "Full price is required"),
  insuranceCoverage: z.string().min(1, "Insurance coverage is required"),
  patientCopay: z.string().min(1, "Patient copay is required")
});

type CopayFormData = z.infer<typeof copayFormSchema>;

interface MedicationCopayFormProps {
  prescriptionId?: string;
  patientId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function MedicationCopayForm({ 
  prescriptionId, 
  patientId: initialPatientId, 
  onSuccess, 
  onCancel 
}: MedicationCopayFormProps) {
  const [selectedPatientId, setSelectedPatientId] = useState(initialPatientId || "");
  const [selectedInsuranceId, setSelectedInsuranceId] = useState("");
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CopayFormData>({
    resolver: zodResolver(copayFormSchema),
    defaultValues: {
      tenantId: tenant?.id || "",
      prescriptionId: prescriptionId || "",
      patientId: selectedPatientId,
      patientInsuranceId: selectedInsuranceId,
      medicationName: "",
      genericName: "",
      strength: "",
      dosageForm: "tablet",
      ndcNumber: "",
      fullPrice: "",
      insuranceCoverage: "",
      patientCopay: "",
      copayPercentage: "",
      formularyTier: "tier_1",
      priorAuthRequired: false,
      quantityLimit: 0,
      daySupplyLimit: 0,
      definedByPharmacist: user?.id || "",
      pharmacyNotes: "",
      isActive: true
    }
  });

  // Fetch patients for pharmacy
  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
    enabled: !!user && !!tenant
  });

  // Fetch patient insurance information
  const { data: patientInsurance = [] } = useQuery<PatientInsurance[]>({
    queryKey: ["/api/patient-insurance", selectedPatientId],
    enabled: !!selectedPatientId
  });

  // Fetch insurance providers
  const { data: insuranceProviders = [] } = useQuery<InsuranceProvider[]>({
    queryKey: ["/api/insurance-providers"],
    enabled: !!user && !!tenant
  });

  // Fetch prescription details if prescriptionId is provided
  const { data: prescription } = useQuery<Prescription>({
    queryKey: ["/api/prescriptions", prescriptionId],
    enabled: !!prescriptionId
  });

  const createCopayMutation = useMutation({
    mutationFn: async (copayData: CopayFormData) => {
      const { apiRequest } = await import("@/lib/queryClient");
      const processedData = {
        ...copayData,
        fullPrice: parseFloat(copayData.fullPrice),
        insuranceCoverage: parseFloat(copayData.insuranceCoverage),
        patientCopay: parseFloat(copayData.patientCopay),
        copayPercentage: copayData.copayPercentage ? parseFloat(copayData.copayPercentage) : null,
        quantityLimit: copayData.quantityLimit ? parseInt(copayData.quantityLimit.toString()) : null,
        daySupplyLimit: copayData.daySupplyLimit ? parseInt(copayData.daySupplyLimit.toString()) : null
      };
      const response = await apiRequest("POST", "/api/medication-copays", processedData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medication-copays"] });
      toast({
        title: "Medication Copay Defined",
        description: "Patient copay has been successfully defined based on insurance coverage."
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to define medication copay"
      });
    }
  });

  const onSubmit = (data: CopayFormData) => {
    createCopayMutation.mutate(data);
  };

  // Auto-calculate patient copay when full price and insurance coverage change
  const handlePriceCalculation = () => {
    const fullPrice = parseFloat(form.getValues("fullPrice") || "0");
    const insuranceCoverage = parseFloat(form.getValues("insuranceCoverage") || "0");
    const patientCopay = Math.max(0, fullPrice - insuranceCoverage);
    form.setValue("patientCopay", patientCopay.toFixed(2));
  };

  // Get selected patient insurance details
  const selectedInsurance = patientInsurance.find(pi => pi.id === selectedInsuranceId);
  const insuranceProvider = insuranceProviders.find(ip => ip.id === selectedInsurance?.insuranceProviderId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Define Medication Copay
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Set patient copay amount based on insurance coverage and medication pricing
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
            {/* Patient and Insurance Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patientId">Patient</Label>
                <Select 
                  value={selectedPatientId} 
                  onValueChange={(value) => {
                    setSelectedPatientId(value);
                    form.setValue("patientId", value);
                    setSelectedInsuranceId(""); // Reset insurance selection
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.filter(patient => patient.id && patient.id.trim() !== '').map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.firstName} {patient.lastName} - MRN: {patient.mrn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="patientInsuranceId">Patient Insurance</Label>
                <Select
                  value={selectedInsuranceId}
                  onValueChange={(value) => {
                    setSelectedInsuranceId(value);
                    form.setValue("patientInsuranceId", value);
                  }}
                  disabled={!selectedPatientId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select insurance plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {patientInsurance.filter(insurance => insurance.id && insurance.id.trim() !== '').map((insurance) => {
                      const provider = insuranceProviders.find(ip => ip.id === insurance.insuranceProviderId);
                      return (
                        <SelectItem key={insurance.id} value={insurance.id}>
                          {provider?.name} - {insurance.policyNumber}
                          {insurance.isPrimary && <Badge className="ml-2">Primary</Badge>}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Insurance Details Display */}
            {selectedInsurance && insuranceProvider && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <Label className="text-blue-700">Insurance Provider</Label>
                      <p className="font-medium">{insuranceProvider.name}</p>
                    </div>
                    <div>
                      <Label className="text-blue-700">Policy Number</Label>
                      <p className="font-medium">{selectedInsurance.policyNumber}</p>
                    </div>
                    <div>
                      <Label className="text-blue-700">Group Number</Label>
                      <p className="font-medium">{selectedInsurance.groupNumber || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-blue-700">Coverage Type</Label>
                      <p className="font-medium">{selectedInsurance.isPrimary ? "Primary" : "Secondary"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Medication Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Medication Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="medicationName">Medication Name *</Label>
                  <Input
                    {...form.register("medicationName")}
                    placeholder="e.g., Atorvastatin"
                  />
                  {form.formState.errors.medicationName && (
                    <p className="text-sm text-red-600">{form.formState.errors.medicationName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="genericName">Generic Name</Label>
                  <Input
                    {...form.register("genericName")}
                    placeholder="e.g., Atorvastatin Calcium"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="strength">Strength</Label>
                  <Input
                    {...form.register("strength")}
                    placeholder="e.g., 20mg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dosageForm">Dosage Form</Label>
                  <Select 
                    value={form.watch("dosageForm") || ""} 
                    onValueChange={(value) => form.setValue("dosageForm", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select dosage form" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tablet">Tablet</SelectItem>
                      <SelectItem value="capsule">Capsule</SelectItem>
                      <SelectItem value="liquid">Liquid</SelectItem>
                      <SelectItem value="injection">Injection</SelectItem>
                      <SelectItem value="cream">Cream</SelectItem>
                      <SelectItem value="inhaler">Inhaler</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ndcNumber">NDC Number</Label>
                  <Input
                    {...form.register("ndcNumber")}
                    placeholder="e.g., 12345-6789-01"
                  />
                </div>
              </div>
            </div>

            {/* Pricing Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing & Copay Calculation
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullPrice">Full Medication Price *</Label>
                  <Input
                    {...form.register("fullPrice")}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    onBlur={handlePriceCalculation}
                  />
                  {form.formState.errors.fullPrice && (
                    <p className="text-sm text-red-600">{form.formState.errors.fullPrice.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insuranceCoverage">Insurance Coverage *</Label>
                  <Input
                    {...form.register("insuranceCoverage")}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    onBlur={handlePriceCalculation}
                  />
                  {form.formState.errors.insuranceCoverage && (
                    <p className="text-sm text-red-600">{form.formState.errors.insuranceCoverage.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="patientCopay">Patient Copay *</Label>
                  <Input
                    {...form.register("patientCopay")}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="bg-green-50 border-green-200"
                  />
                  {form.formState.errors.patientCopay && (
                    <p className="text-sm text-red-600">{form.formState.errors.patientCopay.message}</p>
                  )}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handlePriceCalculation}
                  className="mb-2"
                >
                  Calculate Patient Copay
                </Button>
                <p className="text-sm text-muted-foreground">
                  Patient Copay = Full Price - Insurance Coverage
                </p>
              </div>
            </div>

            {/* Insurance Coverage Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Insurance Coverage Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="formularyTier">Formulary Tier</Label>
                  <Select 
                    value={form.watch("formularyTier") || ""} 
                    onValueChange={(value) => form.setValue("formularyTier", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select formulary tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tier_1">Tier 1 (Generic)</SelectItem>
                      <SelectItem value="tier_2">Tier 2 (Preferred Brand)</SelectItem>
                      <SelectItem value="tier_3">Tier 3 (Non-Preferred Brand)</SelectItem>
                      <SelectItem value="tier_4">Tier 4 (Specialty)</SelectItem>
                      <SelectItem value="not_covered">Not Covered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="copayPercentage">Copay Percentage (if applicable)</Label>
                  <div className="relative">
                    <Input
                      {...form.register("copayPercentage")}
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                    />
                    <Percent className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantityLimit">Quantity Limit per Fill</Label>
                  <Input
                    {...form.register("quantityLimit")}
                    type="number"
                    placeholder="e.g., 30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="daySupplyLimit">Day Supply Limit</Label>
                  <Input
                    {...form.register("daySupplyLimit")}
                    type="number"
                    placeholder="e.g., 30"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={form.watch("priorAuthRequired") || false}
                  onCheckedChange={(checked) => form.setValue("priorAuthRequired", checked)}
                  id="priorAuthRequired"
                />
                <Label htmlFor="priorAuthRequired" className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Prior Authorization Required
                </Label>
              </div>
            </div>

            {/* Pharmacy Notes */}
            <div className="space-y-2">
              <Label htmlFor="pharmacyNotes">Pharmacy Notes</Label>
              <Textarea
                {...form.register("pharmacyNotes")}
                placeholder="Additional notes about copay calculation, insurance requirements, or patient information..."
                rows={3}
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={createCopayMutation.isPending}>
                {createCopayMutation.isPending ? "Defining Copay..." : "Define Copay"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}