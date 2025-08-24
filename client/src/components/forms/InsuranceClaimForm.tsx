import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X, FileText, DollarSign, Stethoscope } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Medical specialty-specific diagnosis and procedure codes
const MEDICAL_CODING = {
  family_medicine: {
    commonDiagnoses: [
      { code: "Z00.00", description: "Encounter for general adult medical examination without abnormal findings" },
      { code: "I10", description: "Essential hypertension" },
      { code: "E11.9", description: "Type 2 diabetes mellitus without complications" },
      { code: "J06.9", description: "Acute upper respiratory infection" },
      { code: "M79.3", description: "Panniculitis, unspecified" },
      { code: "R50.9", description: "Fever, unspecified" }
    ],
    commonProcedures: [
      { code: "99213", description: "Office visit, established patient, level 3" },
      { code: "99214", description: "Office visit, established patient, level 4" },
      { code: "90471", description: "Immunization administration" },
      { code: "36415", description: "Collection of venous blood by venipuncture" },
      { code: "81002", description: "Urinalysis, non-automated, without microscopy" }
    ]
  },
  cardiology: {
    commonDiagnoses: [
      { code: "I25.10", description: "Atherosclerotic heart disease of native coronary artery without angina pectoris" },
      { code: "I48.91", description: "Unspecified atrial fibrillation" },
      { code: "I50.9", description: "Heart failure, unspecified" },
      { code: "I10", description: "Essential hypertension" },
      { code: "E78.5", description: "Hyperlipidemia, unspecified" }
    ],
    commonProcedures: [
      { code: "93010", description: "Electrocardiogram, routine ECG with at least 12 leads" },
      { code: "93306", description: "Echocardiography, transthoracic, real-time with image documentation" },
      { code: "93224", description: "External electrocardiographic recording up to 48 hours" },
      { code: "99213", description: "Office visit, established patient, level 3" },
      { code: "99214", description: "Office visit, established patient, level 4" }
    ]
  },
  orthopedics: {
    commonDiagnoses: [
      { code: "M25.511", description: "Pain in right shoulder" },
      { code: "M17.12", description: "Unilateral primary osteoarthritis, left knee" },
      { code: "S72.001A", description: "Fracture of unspecified part of neck of right femur, initial encounter" },
      { code: "M79.3", description: "Panniculitis, unspecified" },
      { code: "M54.5", description: "Low back pain" }
    ],
    commonProcedures: [
      { code: "73030", description: "Radiologic examination, shoulder; complete, minimum of 2 views" },
      { code: "73060", description: "Radiologic examination, knee; 1 or 2 views" },
      { code: "20610", description: "Arthrocentesis, aspiration and/or injection, major joint" },
      { code: "99213", description: "Office visit, established patient, level 3" },
      { code: "99214", description: "Office visit, established patient, level 4" }
    ]
  },
  pediatrics: {
    commonDiagnoses: [
      { code: "Z00.121", description: "Encounter for routine child health examination with abnormal findings" },
      { code: "J06.9", description: "Acute upper respiratory infection" },
      { code: "R50.9", description: "Fever, unspecified" },
      { code: "K59.00", description: "Constipation, unspecified" },
      { code: "L20.9", description: "Atopic dermatitis, unspecified" }
    ],
    commonProcedures: [
      { code: "99212", description: "Office visit, established patient, level 2" },
      { code: "99213", description: "Office visit, established patient, level 3" },
      { code: "90460", description: "Immunization administration through 18 years of age" },
      { code: "90471", description: "Immunization administration" },
      { code: "36415", description: "Collection of venous blood by venipuncture" }
    ]
  },
  dermatology: {
    commonDiagnoses: [
      { code: "L85.9", description: "Keratoderma, unspecified" },
      { code: "L30.9", description: "Dermatitis, unspecified" },
      { code: "L72.9", description: "Follicular cyst of skin and subcutaneous tissue, unspecified" },
      { code: "D22.9", description: "Melanocytic nevi, unspecified" },
      { code: "L40.9", description: "Psoriasis, unspecified" }
    ],
    commonProcedures: [
      { code: "11100", description: "Biopsy of skin, subcutaneous tissue" },
      { code: "17000", description: "Destruction of benign or premalignant lesion" },
      { code: "99213", description: "Office visit, established patient, level 3" },
      { code: "99214", description: "Office visit, established patient, level 4" },
      { code: "11200", description: "Removal of skin tags, multiple fibrocutaneous tags" }
    ]
  }
};

const claimFormSchema = z.object({
  primaryDiagnosisCode: z.string().min(1, "Primary diagnosis code is required"),
  primaryDiagnosisDescription: z.string().min(1, "Primary diagnosis description is required"),
  secondaryDiagnosisCodes: z.array(z.object({
    code: z.string(),
    description: z.string()
  })).default([]),
  procedureCodes: z.array(z.object({
    code: z.string(),
    description: z.string(),
    amount: z.number().min(0)
  })).min(1, "At least one procedure is required"),
  clinicalFindings: z.string().min(1, "Clinical findings are required"),
  treatmentProvided: z.string().min(1, "Treatment provided is required"),
  durationOfTreatment: z.string().optional(),
  medicalNecessity: z.string().min(1, "Medical necessity justification is required"),
  notes: z.string().optional()
});

type ClaimFormData = z.infer<typeof claimFormSchema>;

interface InsuranceClaimFormProps {
  appointmentId: string;
  patientId: string;
  providerId: string;
  visitSummaryId?: string;
  medicalSpecialty: string;
  patientInsurance?: {
    id: string;
    insuranceProvider: string;
    policyNumber: string;
    coveragePercentage: number;
    copayAmount: number;
  };
  onSubmit: (data: ClaimFormData & {
    appointmentId: string;
    patientId: string;
    providerId: string;
    visitSummaryId?: string;
    medicalSpecialty: string;
    patientInsuranceId?: string;
  }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function InsuranceClaimForm({
  appointmentId,
  patientId,
  providerId,
  visitSummaryId,
  medicalSpecialty,
  patientInsurance,
  onSubmit,
  onCancel,
  isLoading = false
}: InsuranceClaimFormProps) {
  const { toast } = useToast();
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<string>("");
  const [selectedProcedure, setSelectedProcedure] = useState<string>("");
  const [calculatedTotal, setCalculatedTotal] = useState<number>(0);
  const [insuranceCoverage, setInsuranceCoverage] = useState<number>(0);
  const [patientCopay, setPatientCopay] = useState<number>(0);

  const specialtyData = MEDICAL_CODING[medicalSpecialty as keyof typeof MEDICAL_CODING] || MEDICAL_CODING.family_medicine;

  const form = useForm<ClaimFormData>({
    resolver: zodResolver(claimFormSchema),
    defaultValues: {
      secondaryDiagnosisCodes: [],
      procedureCodes: [],
      primaryDiagnosisCode: "",
      primaryDiagnosisDescription: "",
      clinicalFindings: "",
      treatmentProvided: "",
      medicalNecessity: "",
      notes: ""
    }
  });

  const { watch, setValue } = form;
  const procedureCodes = watch("procedureCodes");

  // Calculate totals when procedures change
  useEffect(() => {
    const total = procedureCodes.reduce((sum, proc) => sum + (proc.amount || 0), 0);
    setCalculatedTotal(total);
    
    if (patientInsurance) {
      const coverage = total * (patientInsurance.coveragePercentage / 100);
      const copay = Math.max(total - coverage, patientInsurance.copayAmount);
      setInsuranceCoverage(coverage);
      setPatientCopay(copay);
    }
  }, [procedureCodes, patientInsurance]);

  const addDiagnosis = (diagnosisCode: string) => {
    const diagnosis = specialtyData.commonDiagnoses.find(d => d.code === diagnosisCode);
    if (!diagnosis) return;

    const currentCodes = form.getValues("secondaryDiagnosisCodes");
    if (currentCodes.some(d => d.code === diagnosis.code)) {
      toast({
        title: "Duplicate Diagnosis",
        description: "This diagnosis code has already been added.",
        variant: "destructive"
      });
      return;
    }

    setValue("secondaryDiagnosisCodes", [...currentCodes, {
      code: diagnosis.code,
      description: diagnosis.description
    }]);
    setSelectedDiagnosis("");
  };

  const removeDiagnosis = (index: number) => {
    const currentCodes = form.getValues("secondaryDiagnosisCodes");
    setValue("secondaryDiagnosisCodes", currentCodes.filter((_, i) => i !== index));
  };

  const addProcedure = (procedureCode: string) => {
    const procedure = specialtyData.commonProcedures.find(p => p.code === procedureCode);
    if (!procedure) return;

    const currentProcedures = form.getValues("procedureCodes");
    if (currentProcedures.some(p => p.code === procedure.code)) {
      toast({
        title: "Duplicate Procedure",
        description: "This procedure code has already been added.",
        variant: "destructive"
      });
      return;
    }

    setValue("procedureCodes", [...currentProcedures, {
      code: procedure.code,
      description: procedure.description,
      amount: 0 // Will be filled by user
    }]);
    setSelectedProcedure("");
  };

  const removeProcedure = (index: number) => {
    const currentProcedures = form.getValues("procedureCodes");
    setValue("procedureCodes", currentProcedures.filter((_, i) => i !== index));
  };

  const updateProcedureAmount = (index: number, amount: string) => {
    const currentProcedures = form.getValues("procedureCodes");
    const updatedProcedures = [...currentProcedures];
    updatedProcedures[index] = {
      ...updatedProcedures[index],
      amount: parseFloat(amount) || 0
    };
    setValue("procedureCodes", updatedProcedures);
  };

  const handleSubmit = (data: ClaimFormData) => {
    onSubmit({
      ...data,
      appointmentId,
      patientId,
      providerId,
      visitSummaryId,
      medicalSpecialty,
      patientInsuranceId: patientInsurance?.id
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Insurance Claim Form - {medicalSpecialty.replace('_', ' ').toUpperCase()}
          </CardTitle>
          {patientInsurance && (
            <div className="text-sm text-gray-600">
              Insurance: {patientInsurance.insuranceProvider} | Policy: {patientInsurance.policyNumber}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Primary Diagnosis */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Primary Diagnosis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryDiagnosisCode">ICD-10 Code *</Label>
                  <Input
                    id="primaryDiagnosisCode"
                    data-testid="input-primary-diagnosis-code"
                    {...form.register("primaryDiagnosisCode")}
                    placeholder="e.g., I10"
                  />
                  {form.formState.errors.primaryDiagnosisCode && (
                    <p className="text-sm text-red-600">{form.formState.errors.primaryDiagnosisCode.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="primaryDiagnosisDescription">Description *</Label>
                  <Input
                    id="primaryDiagnosisDescription"
                    data-testid="input-primary-diagnosis-description"
                    {...form.register("primaryDiagnosisDescription")}
                    placeholder="e.g., Essential hypertension"
                  />
                  {form.formState.errors.primaryDiagnosisDescription && (
                    <p className="text-sm text-red-600">{form.formState.errors.primaryDiagnosisDescription.message}</p>
                  )}
                </div>
              </div>
              
              {/* Quick Add Common Diagnoses */}
              <div>
                <Label>Quick Add Common Diagnoses</Label>
                <Select value={selectedDiagnosis} onValueChange={setSelectedDiagnosis}>
                  <SelectTrigger data-testid="select-common-diagnosis">
                    <SelectValue placeholder="Select a common diagnosis to add as primary" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialtyData.commonDiagnoses.map((diagnosis) => (
                      <SelectItem key={diagnosis.code} value={diagnosis.code}>
                        {diagnosis.code} - {diagnosis.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedDiagnosis && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      const diagnosis = specialtyData.commonDiagnoses.find(d => d.code === selectedDiagnosis);
                      if (diagnosis) {
                        setValue("primaryDiagnosisCode", diagnosis.code);
                        setValue("primaryDiagnosisDescription", diagnosis.description);
                        setSelectedDiagnosis("");
                      }
                    }}
                    data-testid="button-set-primary-diagnosis"
                  >
                    Set as Primary Diagnosis
                  </Button>
                )}
              </div>
            </div>

            {/* Secondary Diagnoses */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Secondary Diagnoses</h3>
              <div className="flex gap-2">
                <Select value={selectedDiagnosis} onValueChange={setSelectedDiagnosis}>
                  <SelectTrigger className="flex-1" data-testid="select-secondary-diagnosis">
                    <SelectValue placeholder="Select diagnosis to add" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialtyData.commonDiagnoses.map((diagnosis) => (
                      <SelectItem key={diagnosis.code} value={diagnosis.code}>
                        {diagnosis.code} - {diagnosis.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  onClick={() => addDiagnosis(selectedDiagnosis)}
                  disabled={!selectedDiagnosis}
                  data-testid="button-add-secondary-diagnosis"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Display added secondary diagnoses */}
              <div className="space-y-2">
                {watch("secondaryDiagnosisCodes").map((diagnosis, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <Badge variant="outline" className="mr-2">{diagnosis.code}</Badge>
                      <span className="text-sm">{diagnosis.description}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDiagnosis(index)}
                      data-testid={`button-remove-secondary-diagnosis-${index}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Procedures */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Procedures & Services</h3>
              <div className="flex gap-2">
                <Select value={selectedProcedure} onValueChange={setSelectedProcedure}>
                  <SelectTrigger className="flex-1" data-testid="select-procedure">
                    <SelectValue placeholder="Select procedure to add" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialtyData.commonProcedures.map((procedure) => (
                      <SelectItem key={procedure.code} value={procedure.code}>
                        {procedure.code} - {procedure.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  onClick={() => addProcedure(selectedProcedure)}
                  disabled={!selectedProcedure}
                  data-testid="button-add-procedure"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Display added procedures */}
              <div className="space-y-3">
                {watch("procedureCodes").map((procedure, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge variant="outline" className="mr-2">{procedure.code}</Badge>
                        <span className="text-sm">{procedure.description}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProcedure(index)}
                        data-testid={`button-remove-procedure-${index}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <Label htmlFor={`amount-${index}`} className="text-sm">Amount:</Label>
                      <Input
                        id={`amount-${index}`}
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="w-32"
                        value={procedure.amount || ""}
                        onChange={(e) => updateProcedureAmount(index, e.target.value)}
                        data-testid={`input-procedure-amount-${index}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {form.formState.errors.procedureCodes && (
                <p className="text-sm text-red-600">{form.formState.errors.procedureCodes.message}</p>
              )}
            </div>

            {/* Clinical Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Stethoscope className="h-5 w-5 mr-2" />
                Clinical Information
              </h3>
              
              <div>
                <Label htmlFor="clinicalFindings">Clinical Findings *</Label>
                <Textarea
                  id="clinicalFindings"
                  data-testid="textarea-clinical-findings"
                  {...form.register("clinicalFindings")}
                  placeholder="Document relevant clinical findings, examination results, and observations..."
                  rows={3}
                />
                {form.formState.errors.clinicalFindings && (
                  <p className="text-sm text-red-600">{form.formState.errors.clinicalFindings.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="treatmentProvided">Treatment Provided *</Label>
                <Textarea
                  id="treatmentProvided"
                  data-testid="textarea-treatment-provided"
                  {...form.register("treatmentProvided")}
                  placeholder="Describe the treatment, procedures, or interventions provided..."
                  rows={3}
                />
                {form.formState.errors.treatmentProvided && (
                  <p className="text-sm text-red-600">{form.formState.errors.treatmentProvided.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="medicalNecessity">Medical Necessity *</Label>
                <Textarea
                  id="medicalNecessity"
                  data-testid="textarea-medical-necessity"
                  {...form.register("medicalNecessity")}
                  placeholder="Justify why the treatment was medically necessary..."
                  rows={3}
                />
                {form.formState.errors.medicalNecessity && (
                  <p className="text-sm text-red-600">{form.formState.errors.medicalNecessity.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="durationOfTreatment">Duration of Treatment</Label>
                <Input
                  id="durationOfTreatment"
                  data-testid="input-duration-treatment"
                  {...form.register("durationOfTreatment")}
                  placeholder="e.g., 30 minutes, 2 weeks, ongoing"
                />
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  data-testid="textarea-notes"
                  {...form.register("notes")}
                  placeholder="Any additional notes or comments..."
                  rows={2}
                />
              </div>
            </div>

            {/* Financial Summary */}
            {calculatedTotal > 0 && (
              <Card className="bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-lg">Financial Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Amount:</span>
                    <span className="font-semibold">${calculatedTotal.toFixed(2)}</span>
                  </div>
                  {patientInsurance && (
                    <>
                      <div className="flex justify-between">
                        <span>Insurance Coverage ({patientInsurance.coveragePercentage}%):</span>
                        <span className="text-green-600">${insuranceCoverage.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Patient Copay:</span>
                        <span className="text-blue-600">${patientCopay.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                data-testid="button-cancel-claim"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                data-testid="button-submit-claim"
              >
                {isLoading ? "Creating Claim..." : "Create Insurance Claim"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}