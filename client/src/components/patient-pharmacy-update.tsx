import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Patient } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pill, UserCheck, AlertTriangle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

interface PatientPharmacyUpdateProps {
  patient: Patient;
  currentUser: any;
}

const updatePharmacySchema = z.object({
  preferredPharmacyId: z.string().min(1, "Please select a pharmacy"),
  requiresPatientApproval: z.boolean().default(true)
});

export const PatientPharmacyUpdate = ({ patient, currentUser }: PatientPharmacyUpdateProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [approvalPending, setApprovalPending] = useState(false);
  const queryClient = useQueryClient();

  // Fetch pharmacies
  const { data: pharmacies = [] } = useQuery({
    queryKey: ["/api/pharmacies"],
    enabled: true,
  });

  const form = useForm({
    resolver: zodResolver(updatePharmacySchema),
    defaultValues: {
      preferredPharmacyId: patient.preferredPharmacyId || "",
      requiresPatientApproval: true
    }
  });

  const updatePreferredPharmacyMutation = useMutation({
    mutationFn: async (data: any) => {
      const { apiRequest } = await import("@/lib/queryClient");
      const response = await apiRequest("PATCH", `/api/patients/${patient.id}/preferred-pharmacy`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      setIsOpen(false);
      setApprovalPending(true);
      form.reset();
    }
  });

  const handleSubmit = (data: any) => {
    updatePreferredPharmacyMutation.mutate({
      preferredPharmacyId: data.preferredPharmacyId,
      updatedBy: currentUser.userId,
      reason: "Healthcare provider update",
      requiresPatientApproval: data.requiresPatientApproval
    });
  };

  const currentPharmacy = pharmacies.find((p: any) => p.id === patient.preferredPharmacyId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pill className="h-5 w-5" />
          Preferred Pharmacy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            {currentPharmacy ? (
              <div>
                <p className="font-medium">{currentPharmacy.name}</p>
                <Badge variant="secondary" className="mt-1">Current Preferred</Badge>
              </div>
            ) : (
              <div>
                <p className="text-muted-foreground">No preferred pharmacy set</p>
                <Badge variant="outline" className="mt-1">Not Set</Badge>
              </div>
            )}
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                {currentPharmacy ? "Update" : "Set"} Preferred Pharmacy
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Preferred Pharmacy</DialogTitle>
                <DialogDescription>
                  Update the preferred pharmacy for {patient.firstName} {patient.lastName}. 
                  This change will require patient approval unless it's an emergency.
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="preferredPharmacyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select New Preferred Pharmacy</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select pharmacy" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {pharmacies.map((pharmacy: any) => (
                              <SelectItem key={pharmacy.id} value={pharmacy.id}>
                                {pharmacy.name}
                                {pharmacy.id === patient.preferredPharmacyId && " (Current)"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-amber-800">Patient Approval Required</h4>
                        <p className="text-sm text-amber-700 mt-1">
                          According to healthcare regulations, patients must approve pharmacy changes. 
                          The patient will be notified and asked to confirm this change before it takes effect.
                        </p>
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={updatePreferredPharmacyMutation.isPending}
                    >
                      {updatePreferredPharmacyMutation.isPending ? "Updating..." : "Request Update"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {approvalPending && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <UserCheck className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800">Approval Pending</h4>
                <p className="text-sm text-blue-700 mt-1">
                  The patient has been notified of the pharmacy change request and will need to approve it.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};