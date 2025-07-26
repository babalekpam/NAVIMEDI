import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Activity, Heart, Thermometer, Wind, Weight, Ruler } from "lucide-react";

// Simple form schema that accepts strings and converts them
const vitalSignsFormSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  appointmentId: z.string().optional(),
  bloodPressureSystolic: z.string().optional(),
  bloodPressureDiastolic: z.string().optional(),
  heartRate: z.string().optional(),
  temperature: z.string().optional(),
  oxygenSaturation: z.string().optional(),
  respiratoryRate: z.string().optional(),
  weight: z.string().optional(),
  height: z.string().optional(),
  notes: z.string().optional(),
});

type VitalSignsFormData = z.infer<typeof vitalSignsFormSchema>;

// Unit conversion functions
const convertWeightToKg = (value: number, fromUnit: string) => {
  if (fromUnit === "lbs") return value * 0.453592;
  return value; // already in kg
};

const convertHeightToCm = (value: number, fromUnit: string) => {
  if (fromUnit === "inches") return value * 2.54;
  return value; // already in cm
};

const convertWeightFromKg = (value: number, toUnit: string) => {
  if (toUnit === "lbs") return value / 0.453592;
  return value; // keep in kg
};

const convertHeightFromCm = (value: number, toUnit: string) => {
  if (toUnit === "inches") return value / 2.54;
  return value; // keep in cm
};

interface VitalSignsFormProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
  appointmentId?: string;
  existingVitalSigns?: any;
}

export function VitalSignsForm({
  isOpen,
  onClose,
  patientId,
  patientName,
  appointmentId,
  existingVitalSigns
}: VitalSignsFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [bmi, setBMI] = useState<number | null>(null);
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [heightUnit, setHeightUnit] = useState<"cm" | "inches">("cm");

  const form = useForm<VitalSignsFormData>({
    resolver: zodResolver(vitalSignsFormSchema),
    defaultValues: {
      patientId,
      appointmentId: appointmentId || "",
      bloodPressureSystolic: existingVitalSigns?.bloodPressureSystolic?.toString() || "",
      bloodPressureDiastolic: existingVitalSigns?.bloodPressureDiastolic?.toString() || "",
      heartRate: existingVitalSigns?.heartRate?.toString() || "",
      temperature: existingVitalSigns?.temperature?.toString() || "",
      oxygenSaturation: existingVitalSigns?.oxygenSaturation?.toString() || "",
      respiratoryRate: existingVitalSigns?.respiratoryRate?.toString() || "",
      weight: existingVitalSigns?.weight ? convertWeightFromKg(existingVitalSigns.weight, weightUnit).toFixed(1) : "",
      height: existingVitalSigns?.height ? convertHeightFromCm(existingVitalSigns.height, heightUnit).toFixed(1) : "",
      notes: existingVitalSigns?.notes || "",
    },
  });

  // Calculate BMI when weight or height changes
  const watchWeight = form.watch("weight");
  const watchHeight = form.watch("height");

  useEffect(() => {
    if (watchWeight && watchHeight && !isNaN(Number(watchWeight)) && !isNaN(Number(watchHeight))) {
      const weightKg = convertWeightToKg(Number(watchWeight), weightUnit);
      const heightM = convertHeightToCm(Number(watchHeight), heightUnit) / 100; // cm to meters
      const calculatedBMI = weightKg / (heightM * heightM);
      setBMI(Math.round(calculatedBMI * 10) / 10);
    } else {
      setBMI(null);
    }
  }, [watchWeight, watchHeight, weightUnit, heightUnit]);

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/vital-signs", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vital-signs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Success",
        description: "Vital signs recorded successfully",
      });
      onClose();
    },
    onError: (error: any) => {
      console.error("Create vital signs error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to record vital signs",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/vital-signs/${existingVitalSigns?.id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vital-signs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Success",
        description: "Vital signs updated successfully",
      });
      onClose();
    },
    onError: (error: any) => {
      console.error("Update vital signs error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update vital signs",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: VitalSignsFormData) => {
    console.log("Form submitted with data:", data);
    console.log("Weight unit:", weightUnit, "Height unit:", heightUnit);
    
    // Convert form data to API format with proper numeric values
    const processedData = {
      patientId: data.patientId,
      appointmentId: data.appointmentId,
      bloodPressureSystolic: data.bloodPressureSystolic ? Number(data.bloodPressureSystolic) : undefined,
      bloodPressureDiastolic: data.bloodPressureDiastolic ? Number(data.bloodPressureDiastolic) : undefined,
      heartRate: data.heartRate ? Number(data.heartRate) : undefined,
      temperature: data.temperature ? Number(data.temperature) : undefined,
      oxygenSaturation: data.oxygenSaturation ? Number(data.oxygenSaturation) : undefined,
      respiratoryRate: data.respiratoryRate ? Number(data.respiratoryRate) : undefined,
      weight: data.weight ? convertWeightToKg(Number(data.weight), weightUnit) : undefined,
      height: data.height ? convertHeightToCm(Number(data.height), heightUnit) : undefined,
      notes: data.notes,
    };

    console.log("Processed data being sent to API:", processedData);

    if (existingVitalSigns) {
      console.log("Updating existing vital signs:", existingVitalSigns.id);
      updateMutation.mutate(processedData);
    } else {
      console.log("Creating new vital signs");
      createMutation.mutate(processedData);
    }
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: "Underweight", color: "bg-blue-100 text-blue-800" };
    if (bmi < 25) return { label: "Normal", color: "bg-green-100 text-green-800" };
    if (bmi < 30) return { label: "Overweight", color: "bg-yellow-100 text-yellow-800" };
    return { label: "Obese", color: "bg-red-100 text-red-800" };
  };

  const getVitalStatus = (value: string | undefined, ranges: { low: number; high: number }) => {
    if (!value || isNaN(Number(value))) return null;
    const numValue = Number(value);
    if (numValue < ranges.low) return { status: "Low", color: "text-blue-600" };
    if (numValue > ranges.high) return { status: "High", color: "text-red-600" };
    return { status: "Normal", color: "text-green-600" };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {existingVitalSigns ? "Update" : "Record"} Vital Signs
          </DialogTitle>
          <DialogDescription>
            {existingVitalSigns ? "Update" : "Record"} vital signs for {patientName}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Blood Pressure */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    Blood Pressure
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="bloodPressureSystolic"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Systolic</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="120"
                              {...field}
                            />
                          </FormControl>
                          {field.value && (() => {
                            const status = getVitalStatus(field.value, { low: 90, high: 140 });
                            return status && <div className={`text-xs ${status.color}`}>{status.status}</div>;
                          })()}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bloodPressureDiastolic"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Diastolic</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="80"
                              {...field}
                            />
                          </FormControl>
                          {field.value && (() => {
                            const status = getVitalStatus(field.value, { low: 60, high: 90 });
                            return status && <div className={`text-xs ${status.color}`}>{status.status}</div>;
                          })()}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Heart Rate & Temperature */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Heart className="h-4 w-4 text-pink-500" />
                    Heart Rate & Temperature
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="heartRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Heart Rate (bpm)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="72"
                            {...field}
                          />
                        </FormControl>
                        {field.value && (() => {
                          const status = getVitalStatus(field.value, { low: 60, high: 100 });
                          return status && <div className={`text-xs ${status.color}`}>{status.status}</div>;
                        })()}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="temperature"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Temperature (°F)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="98.6"
                            {...field}
                          />
                        </FormControl>
                        {field.value && (() => {
                          const status = getVitalStatus(field.value, { low: 97, high: 99 });
                          return status && <div className={`text-xs ${status.color}`}>{status.status}</div>;
                        })()}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Oxygen & Respiratory */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wind className="h-4 w-4 text-blue-500" />
                    Oxygen & Respiratory
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="oxygenSaturation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Oxygen Saturation (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="98"
                            {...field}
                          />
                        </FormControl>
                        {field.value && (() => {
                          const status = getVitalStatus(field.value, { low: 95, high: 100 });
                          return status && <div className={`text-xs ${status.color}`}>{status.status}</div>;
                        })()}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="respiratoryRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Respiratory Rate (per min)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="16"
                            {...field}
                          />
                        </FormControl>
                        {field.value && (() => {
                          const status = getVitalStatus(field.value, { low: 12, high: 20 });
                          return status && <div className={`text-xs ${status.color}`}>{status.status}</div>;
                        })()}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Physical Measurements */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Weight className="h-4 w-4 text-purple-500" />
                    Physical Measurements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight ({weightUnit})</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                placeholder={weightUnit === "kg" ? "70" : "150"}
                                {...field}
                                className="flex-1"
                              />
                            </FormControl>
                            <Select value={weightUnit} onValueChange={(value: "kg" | "lbs") => setWeightUnit(value)}>
                              <SelectTrigger className="w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="kg">kg</SelectItem>
                                <SelectItem value="lbs">lbs</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Height ({heightUnit})</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                placeholder={heightUnit === "cm" ? "170" : "68"}
                                {...field}
                                className="flex-1"
                              />
                            </FormControl>
                            <Select value={heightUnit} onValueChange={(value: "cm" | "inches") => setHeightUnit(value)}>
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cm">cm</SelectItem>
                                <SelectItem value="inches">inches</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {bmi && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">BMI: {bmi}</span>
                      <Badge className={getBMICategory(bmi).color}>
                        {getBMICategory(bmi).label}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional observations or notes..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : existingVitalSigns ? "Update" : "Save"} Vital Signs
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}