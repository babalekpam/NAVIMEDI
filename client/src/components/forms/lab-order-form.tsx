import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLabOrderSchema, Patient } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface LabOrderFormProps {
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  patients: Patient[];
}

export const LabOrderForm = ({ onSubmit, isLoading = false, patients }: LabOrderFormProps) => {
  const form = useForm({
    resolver: zodResolver(insertLabOrderSchema.omit({ tenantId: true, providerId: true })),
    defaultValues: {
      patientId: "",
      testName: "",
      testCode: "",
      instructions: "",
      priority: "routine" as const,
      status: "ordered" as const,
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="testName"
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
                    <SelectItem value="Complete Blood Count (CBC)">Complete Blood Count (CBC)</SelectItem>
                    <SelectItem value="Basic Metabolic Panel (BMP)">Basic Metabolic Panel (BMP)</SelectItem>
                    <SelectItem value="Comprehensive Metabolic Panel (CMP)">Comprehensive Metabolic Panel (CMP)</SelectItem>
                    <SelectItem value="Lipid Panel">Lipid Panel</SelectItem>
                    <SelectItem value="Thyroid Function Tests">Thyroid Function Tests</SelectItem>
                    <SelectItem value="Liver Function Tests">Liver Function Tests</SelectItem>
                    <SelectItem value="Hemoglobin A1C">Hemoglobin A1C</SelectItem>
                    <SelectItem value="Urinalysis">Urinalysis</SelectItem>
                    <SelectItem value="Chest X-Ray">Chest X-Ray</SelectItem>
                    <SelectItem value="EKG">EKG</SelectItem>
                    <SelectItem value="Blood Culture">Blood Culture</SelectItem>
                    <SelectItem value="Urine Culture">Urine Culture</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="testCode"
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

        <FormField
          control={form.control}
          name="priority"
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
          name="instructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Special Instructions</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="e.g., Fasting required, collect in morning"
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
            {isLoading ? "Ordering..." : "Order Lab Test"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
