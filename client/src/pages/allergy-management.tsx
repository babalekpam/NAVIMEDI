import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Plus, Edit, Check, Calendar } from "lucide-react";
import { format } from "date-fns";

interface Allergy {
  id: string;
  tenantId: string;
  patientId: string;
  allergen: string;
  allergyType: 'drug' | 'food' | 'environmental';
  reaction: string;
  severity: 'life_threatening' | 'severe' | 'moderate' | 'mild';
  onsetDate: string | null;
  notes: string | null;
  reportedBy: string;
  verifiedBy: string | null;
  verifiedAt: string | null;
  isActive: boolean;
  createdAt: string;
}

const severityColors = {
  life_threatening: "bg-red-100 text-red-900 border-red-300 dark:bg-red-900 dark:text-red-100",
  severe: "bg-orange-100 text-orange-900 border-orange-300 dark:bg-orange-900 dark:text-orange-100",
  moderate: "bg-yellow-100 text-yellow-900 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-100",
  mild: "bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-900 dark:text-blue-100"
};

const allergyTypeLabels = {
  drug: "Medication",
  food: "Food",
  environmental: "Environmental"
};

export default function AllergyManagement() {
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAllergy, setEditingAllergy] = useState<Allergy | null>(null);
  const [formData, setFormData] = useState({
    allergen: "",
    allergyType: "drug" as 'drug' | 'food' | 'environmental',
    reaction: "",
    severity: "moderate" as 'life_threatening' | 'severe' | 'moderate' | 'mild',
    onsetDate: "",
    notes: ""
  });

  const { toast } = useToast();

  // Fetch patients for selection
  const { data: patients = [], isLoading: isLoadingPatients } = useQuery({
    queryKey: ['/api/patients'],
  });

  // Fetch allergies for selected patient
  const { data: allergies = [], isLoading: isLoadingAllergies } = useQuery<Allergy[]>({
    queryKey: ['/api/clinical/allergies', selectedPatientId],
    enabled: !!selectedPatientId,
  });

  // Add allergy mutation
  const addAllergyMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/clinical/allergies', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clinical/allergies', selectedPatientId] });
      toast({
        title: "Allergy Added",
        description: "Patient allergy has been recorded successfully."
      });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add allergy",
        variant: "destructive"
      });
    }
  });

  // Update allergy mutation
  const updateAllergyMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      apiRequest(`/api/clinical/allergies/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clinical/allergies', selectedPatientId] });
      toast({
        title: "Allergy Updated",
        description: "Allergy information has been updated successfully."
      });
      setEditingAllergy(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update allergy",
        variant: "destructive"
      });
    }
  });

  // Verify allergy mutation
  const verifyAllergyMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/clinical/allergies/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ verified: true })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clinical/allergies', selectedPatientId] });
      toast({
        title: "Allergy Verified",
        description: "Allergy has been verified by clinician."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to verify allergy",
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setFormData({
      allergen: "",
      allergyType: "drug",
      reaction: "",
      severity: "moderate",
      onsetDate: "",
      notes: ""
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const allergyData = {
      ...formData,
      patientId: selectedPatientId,
      onsetDate: formData.onsetDate ? new Date(formData.onsetDate).toISOString() : null
    };

    if (editingAllergy) {
      updateAllergyMutation.mutate({ id: editingAllergy.id, updates: allergyData });
    } else {
      addAllergyMutation.mutate(allergyData);
    }
  };

  const handleEdit = (allergy: Allergy) => {
    setEditingAllergy(allergy);
    setFormData({
      allergen: allergy.allergen,
      allergyType: allergy.allergyType,
      reaction: allergy.reaction,
      severity: allergy.severity,
      onsetDate: allergy.onsetDate ? format(new Date(allergy.onsetDate), 'yyyy-MM-dd') : "",
      notes: allergy.notes || ""
    });
    setIsAddDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    setEditingAllergy(null);
    resetForm();
  };

  const selectedPatient = patients.find((p: any) => p.id === selectedPatientId);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2" data-testid="heading-allergy-management">
          Allergy Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage patient allergies and adverse reactions for clinical decision support
        </p>
      </div>

      {/* Patient Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle data-testid="heading-select-patient">Select Patient</CardTitle>
          <CardDescription>Choose a patient to view and manage their allergies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="patient-select" data-testid="label-patient">Patient</Label>
              <Select
                value={selectedPatientId}
                onValueChange={setSelectedPatientId}
              >
                <SelectTrigger id="patient-select" data-testid="select-patient">
                  <SelectValue placeholder="Select a patient..." />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient: any) => (
                    <SelectItem 
                      key={patient.id} 
                      value={patient.id}
                      data-testid={`option-patient-${patient.id}`}
                    >
                      {patient.firstName} {patient.lastName} - {patient.dateOfBirth}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPatientId && (
              <div className="flex items-end">
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingAllergy(null)} data-testid="button-add-allergy">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Allergy
                    </Button>
                  </DialogTrigger>
                  <DialogContent data-testid="dialog-add-allergy">
                    <DialogHeader>
                      <DialogTitle data-testid="heading-dialog">
                        {editingAllergy ? 'Edit Allergy' : 'Add New Allergy'}
                      </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="allergen" data-testid="label-allergen">
                          Allergen <span className="text-red-600">*</span>
                        </Label>
                        <Input
                          id="allergen"
                          value={formData.allergen}
                          onChange={(e) => setFormData({ ...formData, allergen: e.target.value })}
                          placeholder="e.g., Penicillin, Peanuts, Latex"
                          required
                          data-testid="input-allergen"
                        />
                      </div>

                      <div>
                        <Label htmlFor="allergyType" data-testid="label-allergy-type">
                          Allergy Type <span className="text-red-600">*</span>
                        </Label>
                        <Select
                          value={formData.allergyType}
                          onValueChange={(value: any) => setFormData({ ...formData, allergyType: value })}
                        >
                          <SelectTrigger id="allergyType" data-testid="select-allergy-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="drug" data-testid="option-type-drug">Medication</SelectItem>
                            <SelectItem value="food" data-testid="option-type-food">Food</SelectItem>
                            <SelectItem value="environmental" data-testid="option-type-environmental">Environmental</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="reaction" data-testid="label-reaction">
                          Reaction <span className="text-red-600">*</span>
                        </Label>
                        <Input
                          id="reaction"
                          value={formData.reaction}
                          onChange={(e) => setFormData({ ...formData, reaction: e.target.value })}
                          placeholder="e.g., Hives, Anaphylaxis, Rash"
                          required
                          data-testid="input-reaction"
                        />
                      </div>

                      <div>
                        <Label htmlFor="severity" data-testid="label-severity">
                          Severity <span className="text-red-600">*</span>
                        </Label>
                        <Select
                          value={formData.severity}
                          onValueChange={(value: any) => setFormData({ ...formData, severity: value })}
                        >
                          <SelectTrigger id="severity" data-testid="select-severity">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="life_threatening" data-testid="option-severity-life-threatening">Life-Threatening</SelectItem>
                            <SelectItem value="severe" data-testid="option-severity-severe">Severe</SelectItem>
                            <SelectItem value="moderate" data-testid="option-severity-moderate">Moderate</SelectItem>
                            <SelectItem value="mild" data-testid="option-severity-mild">Mild</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="onsetDate" data-testid="label-onset-date">Onset Date</Label>
                        <Input
                          id="onsetDate"
                          type="date"
                          value={formData.onsetDate}
                          onChange={(e) => setFormData({ ...formData, onsetDate: e.target.value })}
                          data-testid="input-onset-date"
                        />
                      </div>

                      <div>
                        <Label htmlFor="notes" data-testid="label-notes">Additional Notes</Label>
                        <Textarea
                          id="notes"
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          placeholder="Any additional information about the allergy..."
                          data-testid="input-notes"
                        />
                      </div>

                      <DialogFooter>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={handleCloseDialog}
                          data-testid="button-cancel"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={addAllergyMutation.isPending || updateAllergyMutation.isPending}
                          data-testid="button-save-allergy"
                        >
                          {editingAllergy ? 'Update' : 'Add'} Allergy
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Allergies List */}
      {selectedPatientId && (
        <Card>
          <CardHeader>
            <CardTitle data-testid="heading-allergies">
              Allergies for {selectedPatient?.firstName} {selectedPatient?.lastName}
            </CardTitle>
            <CardDescription>
              {allergies.length} allerg{allergies.length === 1 ? 'y' : 'ies'} on record
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingAllergies ? (
              <div className="text-center py-8" data-testid="loading-allergies">
                Loading allergies...
              </div>
            ) : allergies.length === 0 ? (
              <div className="text-center py-8 text-gray-500" data-testid="text-no-allergies">
                No allergies recorded for this patient
              </div>
            ) : (
              <div className="space-y-4">
                {allergies.map((allergy) => (
                  <div
                    key={allergy.id}
                    className={`p-4 rounded-lg border-2 ${severityColors[allergy.severity]}`}
                    data-testid={`card-allergy-${allergy.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-5 w-5" />
                          <h3 
                            className="font-semibold text-lg"
                            data-testid={`text-allergen-${allergy.id}`}
                          >
                            {allergy.allergen}
                          </h3>
                          <Badge variant="outline" data-testid={`badge-type-${allergy.id}`}>
                            {allergyTypeLabels[allergy.allergyType]}
                          </Badge>
                          <Badge data-testid={`badge-severity-${allergy.id}`}>
                            {allergy.severity.replace('_', ' ').toUpperCase()}
                          </Badge>
                          {allergy.verifiedBy && (
                            <Badge variant="secondary" data-testid={`badge-verified-${allergy.id}`}>
                              <Check className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-1 text-sm">
                          <p data-testid={`text-reaction-${allergy.id}`}>
                            <strong>Reaction:</strong> {allergy.reaction}
                          </p>
                          {allergy.onsetDate && (
                            <p data-testid={`text-onset-${allergy.id}`}>
                              <strong>Onset:</strong> {format(new Date(allergy.onsetDate), 'MMM dd, yyyy')}
                            </p>
                          )}
                          {allergy.notes && (
                            <p data-testid={`text-notes-${allergy.id}`}>
                              <strong>Notes:</strong> {allergy.notes}
                            </p>
                          )}
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Reported: {format(new Date(allergy.createdAt), 'MMM dd, yyyy')}
                            {allergy.verifiedAt && ` | Verified: ${format(new Date(allergy.verifiedAt), 'MMM dd, yyyy')}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(allergy)}
                          data-testid={`button-edit-${allergy.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {!allergy.verifiedBy && (
                          <Button
                            size="sm"
                            onClick={() => verifyAllergyMutation.mutate(allergy.id)}
                            disabled={verifyAllergyMutation.isPending}
                            data-testid={`button-verify-${allergy.id}`}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Verify
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
