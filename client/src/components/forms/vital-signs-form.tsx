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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Activity, Heart, Thermometer, Wind, Weight, Ruler } from "lucide-react";

const vitalSignsSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  appointmentId: z.string().optional(),
  bloodPressureSystolic: z.preprocess((val) => val === "" ? undefined : Number(val), z.number().min(50).max(250).optional()),
  bloodPressureDiastolic: z.preprocess((val) => val === "" ? undefined : Number(val), z.number().min(30).max(150).optional()),
  heartRate: z.preprocess((val) => val === "" ? undefined : Number(val), z.number().min(30).max(220).optional()),
  temperature: z.preprocess((val) => val === "" ? undefined : Number(val), z.number().min(95).max(110).optional()),
  oxygenSaturation: z.preprocess((val) => val === "" ? undefined : Number(val), z.number().min(70).max(100).optional()),
  respiratoryRate: z.preprocess((val) => val === "" ? undefined : Number(val), z.number().min(8).max(40).optional()),
  weight: z.preprocess((val) => val === "" ? undefined : Number(val), z.number().min(1).max(1000).optional()),
  height: z.preprocess((val) => val === "" ? undefined : Number(val), z.number().min(12).max(96).optional()),
  notes: z.string().optional(),
});

type VitalSignsFormData = z.infer<typeof vitalSignsSchema>;

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

  const form = useForm<VitalSignsFormData>({
    resolver: zodResolver(vitalSignsSchema),
    defaultValues: {
      patientId,
      appointmentId: appointmentId || "",
      bloodPressureSystolic: existingVitalSigns?.bloodPressureSystolic || "",
      bloodPressureDiastolic: existingVitalSigns?.bloodPressureDiastolic || "",
      heartRate: existingVitalSigns?.heartRate || "",
      temperature: existingVitalSigns?.temperature || "",
      oxygenSaturation: existingVitalSigns?.oxygenSaturation || "",
      respiratoryRate: existingVitalSigns?.respiratoryRate || "",
      weight: existingVitalSigns?.weight || "",
      height: existingVitalSigns?.height || "",
      notes: existingVitalSigns?.notes || "",
    },
  });

  // Calculate BMI when weight or height changes
  const watchWeight = form.watch("weight");
  const watchHeight = form.watch("height");

  useEffect(() => {
    if (watchWeight && watchHeight) {
      const weightKg = watchWeight * 0.453592; // lbs to kg
      const heightM = watchHeight * 0.0254; // inches to meters
      const calculatedBMI = weightKg / (heightM * heightM);
      setBMI(Math.round(calculatedBMI * 10) / 10);
    } else {
      setBMI(null);
    }
  }, [watchWeight, watchHeight]);

  const createMutation = useMutation({
    mutationFn: (data: VitalSignsFormData) => 
      apiRequest("/api/vital-signs", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vital-signs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Success",
        description: "Vital signs recorded successfully",
      });
      onClose();
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record vital signs",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: VitalSignsFormData) => 
      apiRequest(`/api/vital-signs/${existingVitalSigns?.id}`, "PATCH", data),
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
      toast({
        title: "Error",
        description: error.message || "Failed to update vital signs",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: VitalSignsFormData) => {
    if (existingVitalSigns) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: "Underweight", color: "bg-blue-100 text-blue-800" };
    if (bmi < 25) return { label: "Normal", color: "bg-green-100 text-green-800" };
    if (bmi < 30) return { label: "Overweight", color: "bg-yellow-100 text-yellow-800" };
    return { label: "Obese", color: "bg-red-100 text-red-800" };
  };

  const getVitalStatus = (value: number | undefined, ranges: { low: number; high: number }) => {
    if (!value) return null;
    if (value < ranges.low) return { status: "Low", color: "text-blue-600" };
    if (value > ranges.high) return { status: "High", color: "text-red-600" };
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
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
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
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {form.watch("bloodPressureSystolic") && form.watch("bloodPressureDiastolic") && (
                    <div className="text-sm">
                      <span className="font-medium">Reading: </span>
                      {form.watch("bloodPressureSystolic")}/{form.watch("bloodPressureDiastolic")} mmHg
                      {(() => {
                        const sys = form.watch("bloodPressureSystolic")!;
                        const dia = form.watch("bloodPressureDiastolic")!;
                        const status = getVitalStatus(sys, { low: 90, high: 140 });
                        return status && <span className={`ml-2 ${status.color}`}>({status.status})</span>;
                      })()}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Heart Rate & Temperature */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-orange-500" />
                    Vitals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="heartRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Heart Rate (BPM)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="72"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value)}
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
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        {field.value && (() => {
                          const status = getVitalStatus(field.value, { low: 97, high: 99.5 });
                          return status && <div className={`text-xs ${status.color}`}>{status.status}</div>;
                        })()}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Respiratory */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wind className="h-4 w-4 text-blue-500" />
                    Respiratory
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
                            onChange={(e) => field.onChange(e.target.value)}
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
                            onChange={(e) => field.onChange(e.target.value)}
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
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (lbs)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="150"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height (inches)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="68"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : existingVitalSigns ? "Update" : "Record"} Vital Signs
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}