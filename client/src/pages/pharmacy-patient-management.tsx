import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Plus, 
  Edit, 
  Shield, 
  CreditCard, 
  User, 
  Phone,
  Mail,
  Calendar,
  DollarSign
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface PharmacyPatientInsurance {
  id: string;
  tenantId: string;
  patientId: string;
  insuranceProviderName: string;
  policyNumber: string;
  groupNumber?: string;
  binNumber?: string;
  pcnNumber?: string;
  rxGroup?: string;
  memberId?: string;
  cardholderName: string;
  relationshipToCardholder: string;
  effectiveDate?: string;
  expirationDate?: string;
  copayAmount?: number;
  deductibleAmount?: number;
  coveragePercentage?: number;
  isPrimary: boolean;
  isActive: boolean;
  verificationStatus: string;
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth: string;
  mrn: string;
}

export default function PharmacyPatientManagement() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showInsuranceDialog, setShowInsuranceDialog] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState<PharmacyPatientInsurance | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for patients with prescriptions for this pharmacy
  const { data: patients = [], isLoading: patientsLoading } = useQuery({
    queryKey: ["/api/billing/patients"],
  });

  // Query for insurance info for selected patient
  const { data: patientInsurance, isLoading: insuranceLoading } = useQuery({
    queryKey: ["/api/pharmacy-patient-insurance", selectedPatient?.id],
    enabled: !!selectedPatient?.id,
  });

  // Mutation to create/update pharmacy patient insurance
  const saveInsuranceMutation = useMutation({
    mutationFn: (data: any) => {
      if (editingInsurance) {
        return apiRequest(`/api/pharmacy-patient-insurance/${editingInsurance.id}`, {
          method: "PATCH",
          body: JSON.stringify(data),
        });
      } else {
        return apiRequest("/api/pharmacy-patient-insurance", {
          method: "POST",
          body: JSON.stringify(data),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/pharmacy-patient-insurance", selectedPatient?.id] 
      });
      setShowInsuranceDialog(false);
      setEditingInsurance(null);
      toast({ 
        title: editingInsurance 
          ? "Insurance information updated successfully" 
          : "Insurance information added successfully" 
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to save insurance information",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSaveInsurance = (formData: FormData) => {
    const data = {
      patientId: selectedPatient?.id,
      insuranceProviderName: formData.get("insuranceProviderName"),
      policyNumber: formData.get("policyNumber"),
      groupNumber: formData.get("groupNumber") || undefined,
      binNumber: formData.get("binNumber") || undefined,
      pcnNumber: formData.get("pcnNumber") || undefined,
      rxGroup: formData.get("rxGroup") || undefined,
      memberId: formData.get("memberId") || undefined,
      cardholderName: formData.get("cardholderName"),
      relationshipToCardholder: formData.get("relationshipToCardholder"),
      effectiveDate: formData.get("effectiveDate") || undefined,
      expirationDate: formData.get("expirationDate") || undefined,
      copayAmount: formData.get("copayAmount") ? parseFloat(formData.get("copayAmount") as string) : undefined,
      deductibleAmount: formData.get("deductibleAmount") ? parseFloat(formData.get("deductibleAmount") as string) : undefined,
      coveragePercentage: formData.get("coveragePercentage") ? parseInt(formData.get("coveragePercentage") as string) : undefined,
      isPrimary: formData.get("isPrimary") === "true",
      isActive: formData.get("isActive") === "true",
      verificationStatus: formData.get("verificationStatus"),
      notes: formData.get("notes") || undefined,
    };

    saveInsuranceMutation.mutate(data);
  };

  const handleEditInsurance = () => {
    if (patientInsurance) {
      setEditingInsurance(patientInsurance);
      setShowInsuranceDialog(true);
    }
  };

  const handleAddInsurance = () => {
    setEditingInsurance(null);
    setShowInsuranceDialog(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Pharmacy Patient Management</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Patients with Prescriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {patientsLoading ? (
              <div>Loading patients...</div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {patients.map((patient: Patient) => (
                  <div
                    key={patient.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedPatient?.id === patient.id
                        ? "bg-blue-50 border-blue-200"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedPatient(patient)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">
                          {patient.firstName} {patient.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">MRN: {patient.mrn}</p>
                        {patient.email && (
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {patient.email}
                          </p>
                        )}
                        {patient.phone && (
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {patient.phone}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline">
                        {format(new Date(patient.dateOfBirth), "MM/dd/yyyy")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Patient Insurance Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Insurance Information
              {selectedPatient && (
                <span className="text-sm font-normal text-gray-600">
                  - {selectedPatient.firstName} {selectedPatient.lastName}
                </span>
              )}
            </CardTitle>
            {selectedPatient && (
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={handleAddInsurance}
                  disabled={!!patientInsurance}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Insurance
                </Button>
                {patientInsurance && (
                  <Button size="sm" variant="outline" onClick={handleEditInsurance}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Insurance
                  </Button>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent>
            {!selectedPatient ? (
              <p className="text-gray-600 text-center py-8">
                Select a patient to view insurance information
              </p>
            ) : insuranceLoading ? (
              <div>Loading insurance information...</div>
            ) : patientInsurance ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Insurance Provider</Label>
                    <p className="text-sm">{patientInsurance.insuranceProviderName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Policy Number</Label>
                    <p className="text-sm font-mono">{patientInsurance.policyNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Group Number</Label>
                    <p className="text-sm font-mono">{patientInsurance.groupNumber || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">BIN Number</Label>
                    <p className="text-sm font-mono">{patientInsurance.binNumber || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">PCN Number</Label>
                    <p className="text-sm font-mono">{patientInsurance.pcnNumber || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">RX Group</Label>
                    <p className="text-sm font-mono">{patientInsurance.rxGroup || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Member ID</Label>
                    <p className="text-sm font-mono">{patientInsurance.memberId || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Cardholder Name</Label>
                    <p className="text-sm">{patientInsurance.cardholderName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Relationship</Label>
                    <p className="text-sm">{patientInsurance.relationshipToCardholder}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Verification Status</Label>
                    <Badge variant={
                      patientInsurance.verificationStatus === 'verified' ? 'default' :
                      patientInsurance.verificationStatus === 'pending' ? 'secondary' : 'destructive'
                    }>
                      {patientInsurance.verificationStatus}
                    </Badge>
                  </div>
                </div>

                {(patientInsurance.copayAmount || patientInsurance.deductibleAmount || patientInsurance.coveragePercentage) && (
                  <div className="pt-4 border-t">
                    <Label className="text-sm font-medium mb-2 block">Financial Information</Label>
                    <div className="grid grid-cols-3 gap-4">
                      {patientInsurance.coveragePercentage && (
                        <div>
                          <Label className="text-sm font-medium">Coverage Percentage</Label>
                          <p className="text-sm font-semibold text-green-600">{patientInsurance.coveragePercentage}%</p>
                        </div>
                      )}
                      {patientInsurance.copayAmount && (
                        <div>
                          <Label className="text-sm font-medium">Copay Amount</Label>
                          <p className="text-sm flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {patientInsurance.copayAmount.toFixed(2)}
                          </p>
                        </div>
                      )}
                      {patientInsurance.deductibleAmount && (
                        <div>
                          <Label className="text-sm font-medium">Deductible Amount</Label>
                          <p className="text-sm flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {patientInsurance.deductibleAmount.toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {patientInsurance.notes && (
                  <div className="pt-4 border-t">
                    <Label className="text-sm font-medium">Notes</Label>
                    <p className="text-sm text-gray-600">{patientInsurance.notes}</p>
                  </div>
                )}

                <div className="pt-4 border-t flex justify-between items-center">
                  <div className="flex gap-2">
                    <Badge variant={patientInsurance.isPrimary ? "default" : "outline"}>
                      {patientInsurance.isPrimary ? "Primary" : "Secondary"}
                    </Badge>
                    <Badge variant={patientInsurance.isActive ? "default" : "destructive"}>
                      {patientInsurance.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    Last updated: {format(new Date(patientInsurance.updatedAt), "PPp")}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">No insurance information found</p>
                <Button onClick={handleAddInsurance}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Insurance Information
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Insurance Dialog */}
      <Dialog open={showInsuranceDialog} onOpenChange={setShowInsuranceDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingInsurance ? "Edit" : "Add"} Insurance Information
            </DialogTitle>
          </DialogHeader>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveInsurance(new FormData(e.currentTarget));
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="insuranceProviderName">Insurance Provider*</Label>
                <Input
                  id="insuranceProviderName"
                  name="insuranceProviderName"
                  defaultValue={editingInsurance?.insuranceProviderName}
                  required
                />
              </div>
              <div>
                <Label htmlFor="policyNumber">Policy Number*</Label>
                <Input
                  id="policyNumber"
                  name="policyNumber"
                  defaultValue={editingInsurance?.policyNumber}
                  required
                />
              </div>
              <div>
                <Label htmlFor="groupNumber">Group Number</Label>
                <Input
                  id="groupNumber"
                  name="groupNumber"
                  defaultValue={editingInsurance?.groupNumber}
                />
              </div>
              <div>
                <Label htmlFor="binNumber">BIN Number</Label>
                <Input
                  id="binNumber"
                  name="binNumber"
                  defaultValue={editingInsurance?.binNumber}
                />
              </div>
              <div>
                <Label htmlFor="pcnNumber">PCN Number</Label>
                <Input
                  id="pcnNumber"
                  name="pcnNumber"
                  defaultValue={editingInsurance?.pcnNumber}
                />
              </div>
              <div>
                <Label htmlFor="rxGroup">RX Group</Label>
                <Input
                  id="rxGroup"
                  name="rxGroup"
                  defaultValue={editingInsurance?.rxGroup}
                />
              </div>
              <div>
                <Label htmlFor="memberId">Member ID</Label>
                <Input
                  id="memberId"
                  name="memberId"
                  defaultValue={editingInsurance?.memberId}
                />
              </div>
              <div>
                <Label htmlFor="cardholderName">Cardholder Name*</Label>
                <Input
                  id="cardholderName"
                  name="cardholderName"
                  defaultValue={editingInsurance?.cardholderName}
                  required
                />
              </div>
              <div>
                <Label htmlFor="relationshipToCardholder">Relationship to Cardholder*</Label>
                <Select 
                  name="relationshipToCardholder" 
                  defaultValue={editingInsurance?.relationshipToCardholder}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="self">Self</SelectItem>
                    <SelectItem value="spouse">Spouse</SelectItem>
                    <SelectItem value="child">Child</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="effectiveDate">Effective Date</Label>
                <Input
                  id="effectiveDate"
                  name="effectiveDate"
                  type="date"
                  defaultValue={editingInsurance?.effectiveDate?.split('T')[0]}
                />
              </div>
              <div>
                <Label htmlFor="expirationDate">Expiration Date</Label>
                <Input
                  id="expirationDate"
                  name="expirationDate"
                  type="date"
                  defaultValue={editingInsurance?.expirationDate?.split('T')[0]}
                />
              </div>
              <div>
                <Label htmlFor="copayAmount">Copay Amount</Label>
                <Input
                  id="copayAmount"
                  name="copayAmount"
                  type="number"
                  step="0.01"
                  defaultValue={editingInsurance?.copayAmount}
                />
              </div>
              <div>
                <Label htmlFor="deductibleAmount">Deductible Amount</Label>
                <Input
                  id="deductibleAmount"
                  name="deductibleAmount"
                  type="number"
                  step="0.01"
                  defaultValue={editingInsurance?.deductibleAmount}
                />
              </div>
              <div>
                <Label htmlFor="coveragePercentage">Coverage Percentage (%)*</Label>
                <Input
                  id="coveragePercentage"
                  name="coveragePercentage"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  placeholder="80"
                  defaultValue={editingInsurance?.coveragePercentage}
                  required
                />
              </div>
              <div>
                <Label htmlFor="isPrimary">Insurance Type</Label>
                <Select 
                  name="isPrimary" 
                  defaultValue={editingInsurance?.isPrimary ? "true" : "false"}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Primary Insurance</SelectItem>
                    <SelectItem value="false">Secondary Insurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="isActive">Status</Label>
                <Select 
                  name="isActive" 
                  defaultValue={editingInsurance?.isActive !== false ? "true" : "false"}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="verificationStatus">Verification Status</Label>
                <Select 
                  name="verificationStatus" 
                  defaultValue={editingInsurance?.verificationStatus || "pending"}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                name="notes"
                defaultValue={editingInsurance?.notes}
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowInsuranceDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveInsuranceMutation.isPending}>
                {saveInsuranceMutation.isPending ? "Saving..." : "Save Insurance"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}