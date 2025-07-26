import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { FileText, Stethoscope, ClipboardList, UserCheck, Calendar } from "lucide-react";

const visitSummarySchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  appointmentId: z.string().min(1, "Appointment is required"),
  vitalSignsId: z.string().optional(),
  chiefComplaint: z.string().min(1, "Chief complaint is required"),
  historyOfPresentIllness: z.string().optional(),
  physicalExamination: z.string().optional(),
  assessment: z.string().optional(),
  clinicalImpression: z.string().optional(),
  treatmentPlan: z.string().optional(),
  patientInstructions: z.string().optional(),
  followUpInstructions: z.string().optional(),
  returnVisitRecommended: z.boolean().default(false),
  returnVisitTimeframe: z.string().optional(),
  providerNotes: z.string().optional(),
  status: z.enum(["draft", "finalized"]).default("draft"),
});

type VisitSummaryFormData = z.infer<typeof visitSummarySchema>;

interface VisitSummaryFormProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
  appointmentId: string;
  vitalSignsId?: string;
  existingVisitSummary?: any;
}

const commonDiagnoses = [
  "Hypertension",
  "Diabetes Type 2",
  "Upper Respiratory Infection",
  "Anxiety",
  "Depression",
  "Gastroesophageal Reflux Disease",
  "Arthritis",
  "Headache",
  "Back Pain",
  "Allergic Rhinitis"
];

const commonSymptoms = [
  "Fever",
  "Cough",
  "Shortness of breath",
  "Chest pain",
  "Abdominal pain",
  "Headache",
  "Nausea",
  "Fatigue",
  "Dizziness",
  "Joint pain"
];

export function VisitSummaryForm({
  isOpen,
  onClose,
  patientId,
  patientName,
  appointmentId,
  vitalSignsId,
  existingVisitSummary
}: VisitSummaryFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(
    existingVisitSummary?.symptoms || []
  );
  const [selectedDiagnoses, setSelectedDiagnoses] = useState<string[]>(
    existingVisitSummary?.finalDiagnosis || []
  );

  const form = useForm<VisitSummaryFormData>({
    resolver: zodResolver(visitSummarySchema),
    defaultValues: {
      patientId,
      appointmentId,
      vitalSignsId: vitalSignsId || existingVisitSummary?.vitalSignsId || "",
      chiefComplaint: existingVisitSummary?.chiefComplaint || "",
      historyOfPresentIllness: existingVisitSummary?.historyOfPresentIllness || "",
      physicalExamination: existingVisitSummary?.physicalExamination || "",
      assessment: existingVisitSummary?.assessment || "",
      clinicalImpression: existingVisitSummary?.clinicalImpression || "",
      treatmentPlan: existingVisitSummary?.treatmentPlan || "",
      patientInstructions: existingVisitSummary?.patientInstructions || "",
      followUpInstructions: existingVisitSummary?.followUpInstructions || "",
      returnVisitRecommended: existingVisitSummary?.returnVisitRecommended || false,
      returnVisitTimeframe: existingVisitSummary?.returnVisitTimeframe || "",
      providerNotes: existingVisitSummary?.providerNotes || "",
      status: existingVisitSummary?.status || "draft",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: VisitSummaryFormData) => 
      apiRequest("/api/visit-summaries", "POST", {
        ...data,
        symptoms: selectedSymptoms,
        finalDiagnosis: selectedDiagnoses,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/visit-summaries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Success",
        description: "Visit summary created successfully",
      });
      onClose();
      form.reset();
      setSelectedSymptoms([]);
      setSelectedDiagnoses([]);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create visit summary",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: VisitSummaryFormData) => 
      apiRequest(`/api/visit-summaries/${existingVisitSummary?.id}`, "PATCH", {
        ...data,
        symptoms: selectedSymptoms,
        finalDiagnosis: selectedDiagnoses,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/visit-summaries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Success",
        description: "Visit summary updated successfully",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update visit summary",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: VisitSummaryFormData) => {
    if (existingVisitSummary) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const toggleDiagnosis = (diagnosis: string) => {
    setSelectedDiagnoses(prev => 
      prev.includes(diagnosis) 
        ? prev.filter(d => d !== diagnosis)
        : [...prev, diagnosis]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {existingVisitSummary ? "Update" : "Create"} Visit Summary
          </DialogTitle>
          <DialogDescription>
            {existingVisitSummary ? "Update" : "Document"} clinical findings and treatment plan for {patientName}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chief Complaint & History */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-blue-500" />
                    Chief Complaint & History
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="chiefComplaint"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chief Complaint *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Patient's primary reason for visit..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="historyOfPresentIllness"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>History of Present Illness</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Detailed history of current symptoms..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Physical Examination */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-green-500" />
                    Physical Examination
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="physicalExamination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Physical Examination Findings</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Document physical examination findings..."
                            className="min-h-[180px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Symptoms */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Documented Symptoms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {commonSymptoms.map((symptom) => (
                    <Button
                      key={symptom}
                      type="button"
                      variant={selectedSymptoms.includes(symptom) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleSymptom(symptom)}
                      className="justify-start"
                    >
                      {symptom}
                    </Button>
                  ))}
                </div>
                {selectedSymptoms.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Selected Symptoms:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedSymptoms.map((symptom) => (
                        <Badge key={symptom} variant="secondary">
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Assessment & Clinical Impression */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-purple-500" />
                    Assessment & Impression
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="assessment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assessment</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Clinical assessment and findings..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="clinicalImpression"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Clinical Impression</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Overall clinical impression..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Treatment Plan */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-orange-500" />
                    Treatment Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="treatmentPlan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Treatment Plan</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Detailed treatment plan..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="patientInstructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Patient Instructions</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Instructions for the patient..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Diagnoses */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Final Diagnoses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {commonDiagnoses.map((diagnosis) => (
                    <Button
                      key={diagnosis}
                      type="button"
                      variant={selectedDiagnoses.includes(diagnosis) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleDiagnosis(diagnosis)}
                      className="justify-start"
                    >
                      {diagnosis}
                    </Button>
                  ))}
                </div>
                {selectedDiagnoses.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Selected Diagnoses:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedDiagnoses.map((diagnosis) => (
                        <Badge key={diagnosis} variant="secondary">
                          {diagnosis}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Follow-up Instructions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Follow-up Instructions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="followUpInstructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Follow-up Instructions</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Follow-up care instructions..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="returnVisitRecommended"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Return Visit Recommended</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Should the patient schedule a follow-up visit?
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {form.watch("returnVisitRecommended") && (
                      <FormField
                        control={form.control}
                        name="returnVisitTimeframe"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Return Visit Timeframe</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select timeframe" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1 week">1 week</SelectItem>
                                <SelectItem value="2 weeks">2 weeks</SelectItem>
                                <SelectItem value="1 month">1 month</SelectItem>
                                <SelectItem value="3 months">3 months</SelectItem>
                                <SelectItem value="6 months">6 months</SelectItem>
                                <SelectItem value="1 year">1 year</SelectItem>
                                <SelectItem value="as needed">As needed</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Provider Notes & Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="providerNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provider Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Additional provider notes..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Summary Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="finalized">Finalized</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : existingVisitSummary ? "Update" : "Create"} Visit Summary
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}