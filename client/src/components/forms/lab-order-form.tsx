import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLabOrderSchema, Patient, type Laboratory } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Clock, MapPin, Phone } from "lucide-react";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

// Schema for multiple lab orders with required laboratory assignment
const multipleLabOrderSchema = z.object({
  patientId: z.string().min(1, "Please select a patient"),
  laboratoryId: z.string().min(1, "Please select a laboratory"), // Make laboratory required
  orders: z.array(z.object({
    testName: z.string().min(1, "Test name is required"),
    testCode: z.string().optional(),
    instructions: z.string().optional(),
    priority: z.enum(["routine", "urgent", "stat"]).default("routine"),
  })).min(1, "At least one test is required"),
  generalInstructions: z.string().optional(),
});

interface LabOrderFormProps {
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  patients: Patient[];
}

const commonLabTests = [
  "Complete Blood Count (CBC)",
  "Basic Metabolic Panel (BMP)", 
  "Comprehensive Metabolic Panel (CMP)",
  "Lipid Panel",
  "Thyroid Function Tests",
  "Liver Function Tests",
  "Hemoglobin A1C",
  "Urinalysis",
  "Chest X-Ray",
  "EKG",
  "Blood Culture",
  "Urine Culture",
  "Vitamin D",
  "B12 and Folate",
  "Iron Studies",
  "Coagulation Panel (PT/INR)",
  "Inflammatory Markers (CRP, ESR)"
];

export const LabOrderForm = ({ onSubmit, isLoading = false, patients }: LabOrderFormProps) => {
  // Fetch available laboratories
  const { data: laboratories = [], isLoading: labsLoading, error: labsError } = useQuery({
    queryKey: ["/api/laboratories/active"],
  });

  console.log("Laboratories data:", laboratories);
  console.log("Laboratories loading:", labsLoading);
  console.log("Laboratories error:", labsError);

  // Check for pre-selected patient from Quick Actions
  const getDefaultPatientId = () => {
    const selectedPatientInfo = localStorage.getItem('selectedPatientForLabOrder');
    if (selectedPatientInfo) {
      try {
        const patientInfo = JSON.parse(selectedPatientInfo);
        return patientInfo.id || "";
      } catch {
        return "";
      }
    }
    return "";
  };

  const form = useForm({
    resolver: zodResolver(multipleLabOrderSchema),
    defaultValues: {
      patientId: getDefaultPatientId(),
      laboratoryId: "",
      orders: [{
        testName: "",
        testCode: "",
        instructions: "",
        priority: "routine" as const,
      }],
      generalInstructions: "",
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "orders"
  });

  // Pre-select patient when coming from Quick Actions
  useEffect(() => {
    const selectedPatientInfo = localStorage.getItem('selectedPatientForLabOrder');
    if (selectedPatientInfo) {
      try {
        const patientInfo = JSON.parse(selectedPatientInfo);
        if (patientInfo.id) {
          form.setValue("patientId", patientInfo.id);
        }
      } catch (error) {
        console.error("Error parsing selected patient info:", error);
      }
    }
  }, [form]);

  const handleSubmit = (data: any) => {
    // Transform data to create multiple lab orders with laboratory assignment
    const labOrders = data.orders.map((order: any) => ({
      patientId: data.patientId,
      testName: order.testName,
      testCode: order.testCode || "",
      instructions: `${order.instructions || ""} ${data.generalInstructions || ""}`.trim(),
      priority: order.priority,
      status: "ordered",
      labTenantId: data.laboratoryId // Add laboratory tenant ID to each order
    }));
    
    onSubmit({ 
      labOrders, 
      laboratoryId: data.laboratoryId,
      assignmentNotes: data.generalInstructions 
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="patientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Patient</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName} (MRN: {patient.mrn})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="laboratoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">
                🏥 Select Laboratory to Send Lab Order *
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className={`${!field.value ? 'border-red-300 border-2' : 'border-green-300 border-2'} h-12`}>
                    <SelectValue placeholder="🔬 Choose which laboratory will receive this lab order" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {labsLoading ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Loading laboratories...
                    </div>
                  ) : laboratories.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No laboratories available
                    </div>
                  ) : (
                    laboratories.map((lab: any) => (
                      <SelectItem key={lab.id} value={lab.id}>
                        <div className="flex flex-col w-full">
                          <div className="font-medium text-lg">🏥 {lab.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            {lab.address || 'Laboratory Address'}
                            {lab.phoneNumber && (
                              <>
                                <span className="mx-1">•</span>
                                <Phone className="h-3 w-3" />
                                {lab.phoneNumber}
                              </>
                            )}
                          </div>
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

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Lab Tests</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({
                testName: "",
                testCode: "",
                instructions: "",
                priority: "routine"
              })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Test
            </Button>
          </div>

          {fields.map((field, index) => (
            <Card key={field.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Test {index + 1}</CardTitle>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`orders.${index}.testName`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Test Name</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select test" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {commonLabTests.map((test) => (
                              <SelectItem key={test} value={test}>
                                {test}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`orders.${index}.testCode`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Test Code (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., LAB001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`orders.${index}.priority`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="routine">Routine</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                            <SelectItem value="stat">STAT</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`orders.${index}.instructions`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Test-Specific Instructions</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Fasting required"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <FormField
          control={form.control}
          name="generalInstructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>General Instructions (applies to all tests)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="e.g., Patient should be fasting for 12 hours, collect in morning"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? "Ordering..." : `Order ${fields.length} Lab Test${fields.length > 1 ? 's' : ''}`}
          </Button>
        </div>
      </form>
    </Form>
  );
};
