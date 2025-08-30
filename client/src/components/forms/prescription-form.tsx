import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPrescriptionSchema, Patient } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { z } from "zod";

interface PrescriptionFormProps {
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  patients: Patient[];
  prescription?: any; // For editing mode
  isEditing?: boolean;
}

export const PrescriptionForm = ({ onSubmit, onCancel, isLoading = false, patients, prescription, isEditing = false }: PrescriptionFormProps) => {
  // Fetch available pharmacies for prescription routing
  const { data: pharmacies = [], isLoading: pharmaciesLoading } = useQuery({
    queryKey: ["/api/pharmacies"],
    enabled: true
  });

  // Create a simplified schema just for the form fields we need
  const prescriptionFormSchema = z.object({
    patientId: z.string().min(1, "Patient is required"),
    medicationName: z.string().min(1, "Medication name is required"),
    dosage: z.string().min(1, "Dosage is required"),
    frequency: z.string().min(1, "Frequency is required"),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
    refills: z.coerce.number().min(0, "Refills cannot be negative"),
    instructions: z.string().optional(),
    status: z.enum(["prescribed", "sent_to_pharmacy", "filled", "picked_up", "cancelled"]).default("prescribed"),
    pharmacyTenantId: z.string().optional(),
  });

  const form = useForm({
    resolver: zodResolver(prescriptionFormSchema),
    defaultValues: isEditing && prescription ? {
      patientId: prescription.patientId || "",
      medicationName: prescription.medicationName || "",
      dosage: prescription.dosage || "",
      frequency: prescription.frequency || "",
      quantity: prescription.quantity || 30,
      refills: prescription.refills || 0,
      instructions: prescription.instructions || "",
      status: prescription.status || "prescribed" as const,
      pharmacyTenantId: prescription.pharmacyTenantId || "",
    } : {
      patientId: "",
      medicationName: "",
      dosage: "",
      frequency: "",
      quantity: 30,
      refills: 0,
      instructions: "",
      status: "prescribed" as const,
      pharmacyTenantId: "",
    }
  });

  // Watch for patient selection changes to auto-set preferred pharmacy
  const selectedPatientId = form.watch("patientId");
  
  useEffect(() => {
    if (selectedPatientId && !isEditing) {
      const selectedPatient = patients.find(p => p.id === selectedPatientId);
      console.log("[DEBUG] Selected patient:", selectedPatient);
      console.log("[DEBUG] Patient preferred pharmacy ID:", selectedPatient?.preferredPharmacyId);
      console.log("[DEBUG] Available pharmacies:", pharmacies);
      
      if (selectedPatient?.preferredPharmacyId) {
        // Check if the preferred pharmacy exists in our pharmacy list
        const preferredPharmacyExists = pharmacies.find(p => p.id === selectedPatient.preferredPharmacyId);
        console.log("[DEBUG] Preferred pharmacy exists:", preferredPharmacyExists);
        
        if (preferredPharmacyExists) {
          form.setValue("pharmacyTenantId", selectedPatient.preferredPharmacyId);
        } else {
          console.log("[DEBUG] Patient's preferred pharmacy not found in tenant list, keeping dropdown empty");
        }
      }
    }
  }, [selectedPatientId, patients, form, isEditing, pharmacies]);

  const handleSubmit = (data: any) => {
    console.log("[DEBUG] Form handleSubmit called");
    console.log("[DEBUG] Form data being submitted:", data);
    console.log("[DEBUG] Form validation errors:", form.formState.errors);
    console.log("[DEBUG] Form isValid:", form.formState.isValid);
    console.log("[DEBUG] Form isSubmitting:", form.formState.isSubmitting);
    
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1); // Default 1 year expiry
    
    const submissionData = {
      ...data,
      expiryDate: expiryDate.toISOString(),
    };
    console.log("[DEBUG] Final submission data:", submissionData);
    
    onSubmit(submissionData);
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
          name="pharmacyTenantId"
          render={({ field }) => {
            const selectedPatient = patients.find(p => p.id === selectedPatientId);
            const preferredPharmacy = (pharmacies as any[]).find((pharmacy: any) => pharmacy.id === selectedPatient?.preferredPharmacyId);
            
            return (
              <FormItem>
                <FormLabel>Send to Pharmacy</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select pharmacy" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {pharmaciesLoading ? (
                      <SelectItem value="loading" disabled>Loading pharmacies...</SelectItem>
                    ) : (pharmacies as any[]).length > 0 ? (
                      (pharmacies as any[]).map((pharmacy: any) => (
                        <SelectItem key={pharmacy.id} value={pharmacy.id}>
                          {pharmacy.name}
                          {pharmacy.id === selectedPatient?.preferredPharmacyId && " (Patient's Preferred)"}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-pharmacies" disabled>No pharmacies available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {preferredPharmacy && (
                  <FormDescription>
                    Auto-selected {preferredPharmacy.name} as patient's preferred pharmacy. You can change this if needed.
                  </FormDescription>
                )}
                {selectedPatient && !selectedPatient.preferredPharmacyId && (
                  <FormDescription>
                    Patient has no preferred pharmacy set. Please select one manually.
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="medicationName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Medication Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Amoxicillin" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dosage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dosage</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 500mg" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Frequency</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Once daily">Once daily</SelectItem>
                    <SelectItem value="Twice daily">Twice daily</SelectItem>
                    <SelectItem value="Three times daily">Three times daily</SelectItem>
                    <SelectItem value="Four times daily">Four times daily</SelectItem>
                    <SelectItem value="As needed">As needed</SelectItem>
                    <SelectItem value="Every 4 hours">Every 4 hours</SelectItem>
                    <SelectItem value="Every 6 hours">Every 6 hours</SelectItem>
                    <SelectItem value="Every 8 hours">Every 8 hours</SelectItem>
                    <SelectItem value="Every 12 hours">Every 12 hours</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="30"
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
            name="refills"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Refills</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0"
                    {...field} 
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="instructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instructions</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="e.g., Take with food, avoid alcohol"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading 
              ? (isEditing ? "Updating..." : "Creating...") 
              : (isEditing ? "Update Prescription" : "Create Prescription")
            }
          </Button>
        </div>
      </form>
    </Form>
  );
};
