import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Pill, Plus, Search, Filter, MoreHorizontal, AlertTriangle } from "lucide-react";
import { Prescription, Patient } from "@shared/schema";
import { useAuth } from "@/contexts/auth-context";
import { useTenant } from "@/contexts/tenant-context";
import { useTranslation } from "@/contexts/translation-context";
import { PrescriptionForm } from "@/components/forms/prescription-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusColors = {
  prescribed: "bg-blue-100 text-blue-800",
  sent_to_pharmacy: "bg-yellow-100 text-yellow-800",
  filled: "bg-green-100 text-green-800",
  picked_up: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function Prescriptions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: prescriptions = [], isLoading, error } = useQuery<Prescription[]>({
    queryKey: ["/api/prescriptions"],
    enabled: !!user && !!tenant,
  });

  // Debug logging
  if (error) {
    console.error("Prescriptions query error:", error);
  }

  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
    enabled: !!user && !!tenant,
  });

  const createPrescriptionMutation = useMutation({
    mutationFn: async (prescriptionData: any) => {
      const { apiRequest } = await import("@/lib/queryClient");
      const response = await apiRequest("POST", "/api/prescriptions", prescriptionData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prescriptions"] });
      setIsFormOpen(false);
    }
  });

  const fileClaimMutation = useMutation({
    mutationFn: async (prescriptionData: any) => {
      const { apiRequest } = await import("@/lib/queryClient");
      const response = await apiRequest("POST", "/api/prescriptions/file-claim", prescriptionData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prescriptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/insurance-claims"] });
    }
  });

  const handleFileInsuranceClaim = async (prescription: Prescription) => {
    try {
      const result = await fileClaimMutation.mutateAsync({
        prescriptionId: prescription.id,
        patientId: prescription.patientId,
        medicationName: prescription.medicationName,
        dosage: prescription.dosage,
        quantity: prescription.quantity
      });
      
      // Show success message
      const { toast } = await import("@/hooks/use-toast");
      toast({
        title: "Insurance Claim Filed",
        description: `Successfully filed claim for ${prescription.medicationName}`,
        variant: "default"
      });
    } catch (error) {
      console.error("Error filing insurance claim:", error);
      const { toast } = await import("@/hooks/use-toast");
      toast({
        title: "Error Filing Claim",
        description: "Failed to file insurance claim. Please try again.",
        variant: "destructive"
      });
    }
  };

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const patient = patients.find(p => p.id === prescription.patientId);
    const patientName = patient ? `${patient.firstName} ${patient.lastName}` : "";
    const matchesSearch = patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prescription.medicationName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || prescription.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : `Patient ${patientId.slice(-4)}`;
  };

  const isExpiring = (prescription: Prescription) => {
    if (!prescription.expiryDate) return false;
    const expiryDate = new Date(prescription.expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isExpired = (prescription: Prescription) => {
    if (!prescription.expiryDate) return false;
    return new Date(prescription.expiryDate) < new Date();
  };

  if (!user || !tenant) {
    return <div>{t('loading')}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('prescriptions')}</h1>
          <p className="text-gray-600 mt-1">{t('manage-prescriptions-medications')}</p>
        </div>
        {(user.role === "physician" || user.role === "nurse") && (
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                New Prescription
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Prescription</DialogTitle>
              </DialogHeader>
              <PrescriptionForm
                onSubmit={(data) => createPrescriptionMutation.mutate(data)}
                isLoading={createPrescriptionMutation.isPending}
                patients={patients}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 text-gray-400 transform -translate-y-1/2" />
              <Input
                placeholder="Search by patient or medication..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="prescribed">Prescribed</SelectItem>
                <SelectItem value="sent_to_pharmacy">Sent to Pharmacy</SelectItem>
                <SelectItem value="filled">Filled</SelectItem>
                <SelectItem value="picked_up">Picked Up</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Prescriptions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Pill className="h-5 w-5 mr-2" />
            Active Prescriptions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center space-x-4 py-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                    <div className="h-8 w-20 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPrescriptions.length === 0 ? (
            <div className="text-center py-12">
              <Pill className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No prescriptions found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery ? "No prescriptions match your search criteria" : "No prescriptions have been created yet"}
              </p>
              {(user.role === "physician" || user.role === "nurse") && (
                <Button
                  onClick={() => setIsFormOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Prescription
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-0">
              {filteredPrescriptions.map((prescription) => (
                <div 
                  key={prescription.id}
                  className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        isExpired(prescription) ? 'bg-red-50' : 
                        isExpiring(prescription) ? 'bg-yellow-50' : 
                        'bg-green-50'
                      }`}>
                        {isExpired(prescription) || isExpiring(prescription) ? (
                          <AlertTriangle className={`h-5 w-5 ${
                            isExpired(prescription) ? 'text-red-600' : 'text-yellow-600'
                          }`} />
                        ) : (
                          <Pill className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">
                          {prescription.medicationName}
                        </p>
                        {isExpired(prescription) && (
                          <Badge variant="destructive" className="text-xs">
                            Expired
                          </Badge>
                        )}
                        {isExpiring(prescription) && (
                          <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                            Expiring Soon
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        Patient: {getPatientName(prescription.patientId)}
                      </p>
                      {/* Show doctor and hospital info for pharmacy users */}
                      {tenant?.type === "pharmacy" && (
                        <div className="text-xs text-blue-600 mt-1">
                          <p>Dr. {(prescription as any).providerName || 'Unknown'} {(prescription as any).providerLastName || 'Doctor'}</p>
                          <p className="text-gray-500">{(prescription as any).hospitalName || 'Unknown Hospital'}</p>
                        </div>
                      )}
                      <p className="text-xs text-gray-400">
                        {prescription.dosage} • {prescription.frequency}
                      </p>
                      <p className="text-xs text-gray-400">
                        Qty: {prescription.quantity} • Refills: {prescription.refills}
                      </p>
                      {prescription.instructions && (
                        <p className="text-xs text-gray-600 mt-1 max-w-md truncate">
                          Instructions: {prescription.instructions}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Prescribed</p>
                      <p className="text-sm font-medium text-gray-900">
                        {prescription.prescribedDate ? new Date(prescription.prescribedDate).toLocaleDateString() : 'Not set'}
                      </p>
                      {prescription.expiryDate && (
                        <p className="text-xs text-gray-400">
                          Expires: {new Date(prescription.expiryDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    
                    <Badge 
                      variant="secondary"
                      className={statusColors[prescription.status || 'prescribed'] || statusColors.prescribed}
                    >
                      {(prescription.status || 'prescribed').replace('_', ' ')}
                    </Badge>
                    
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-600 hover:text-blue-700"
                        onClick={() => {
                          setSelectedPrescription(prescription);
                          setIsDetailsOpen(true);
                        }}
                      >
                        View Details
                      </Button>
                      {(user.role === "pharmacist" || user.role === "tenant_admin") && prescription.status === "sent_to_pharmacy" && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-green-600 hover:text-green-700"
                          onClick={() => handleFileInsuranceClaim(prescription)}
                          disabled={fileClaimMutation.isPending}
                        >
                          {fileClaimMutation.isPending ? "Filing..." : "File Claim"}
                        </Button>
                      )}
                      {(user.role === "pharmacist" || user.role === "tenant_admin") && prescription.status === "filled" && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-blue-600 hover:text-blue-700"
                          onClick={() => {
                            // Update prescription status to picked up
                            const { apiRequest } = import("@/lib/queryClient");
                            apiRequest("PATCH", `/api/prescriptions/${prescription.id}`, {
                              status: "picked_up"
                            }).then(() => {
                              queryClient.invalidateQueries({ queryKey: ["/api/prescriptions"] });
                            });
                          }}
                        >
                          Mark Picked Up
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prescription Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Pill className="h-5 w-5 mr-2" />
              Prescription Details
            </DialogTitle>
          </DialogHeader>
          {selectedPrescription && (
            <div className="space-y-6">
              {/* Patient Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Patient Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Patient Name</p>
                    <p className="font-medium">{getPatientName(selectedPrescription.patientId)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Prescription Date</p>
                    <p className="font-medium">{selectedPrescription.prescribedDate ? new Date(selectedPrescription.prescribedDate).toLocaleDateString() : 'Not set'}</p>
                  </div>
                  {/* Show doctor and hospital info for pharmacy users */}
                  {tenant?.type === "pharmacy" && (
                    <>
                      <div>
                        <p className="text-sm text-gray-600">Prescribing Doctor</p>
                        <p className="font-medium text-blue-600">
                          Dr. {(selectedPrescription as any).providerName || 'Unknown'} {(selectedPrescription as any).providerLastName || 'Doctor'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Hospital/Clinic</p>
                        <p className="font-medium">{(selectedPrescription as any).hospitalName || 'Unknown Hospital'}</p>
                        <p className="text-xs text-gray-500 capitalize">{(selectedPrescription as any).hospitalType || 'clinic'}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Medication Details */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Medication Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Medication Name</p>
                    <p className="font-medium text-lg">{selectedPrescription.medicationName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Dosage</p>
                    <p className="font-medium">{selectedPrescription.dosage}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Frequency</p>
                    <p className="font-medium">{selectedPrescription.frequency}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Route</p>
                    <p className="font-medium">{selectedPrescription.route || 'Oral'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Quantity</p>
                    <p className="font-medium">{selectedPrescription.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Refills</p>
                    <p className="font-medium">{selectedPrescription.refills}</p>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              {selectedPrescription.instructions && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Instructions for Use</h3>
                  <p className="text-gray-700">{selectedPrescription.instructions}</p>
                </div>
              )}

              {/* Status and Dates */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Prescription Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Current Status</p>
                    <Badge 
                      variant="secondary"
                      className={`${statusColors[selectedPrescription.status || 'prescribed'] || statusColors.prescribed} font-medium`}
                    >
                      {(selectedPrescription.status || 'prescribed').replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  {selectedPrescription.expiryDate && (
                    <div>
                      <p className="text-sm text-gray-600">Expiry Date</p>
                      <p className={`font-medium ${
                        isExpired(selectedPrescription) ? 'text-red-600' : 
                        isExpiring(selectedPrescription) ? 'text-yellow-600' : 'text-gray-900'
                      }`}>
                        {new Date(selectedPrescription.expiryDate).toLocaleDateString()}
                        {isExpired(selectedPrescription) && ' (EXPIRED)'}
                        {isExpiring(selectedPrescription) && ' (EXPIRING SOON)'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Prescribing Physician */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Prescribing Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Prescribing Physician</p>
                    <p className="font-medium">{'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Prescription ID</p>
                    <p className="font-mono text-sm text-gray-600">{selectedPrescription.id.slice(-8)}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                  Close
                </Button>
                {user.role === "pharmacist" && selectedPrescription.status === "prescribed" && (
                  <Button className="bg-green-600 hover:bg-green-700">
                    Fill Prescription
                  </Button>
                )}
                {(user.role === "physician" || user.role === "nurse") && (
                  <Button variant="outline">
                    Edit Prescription
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
