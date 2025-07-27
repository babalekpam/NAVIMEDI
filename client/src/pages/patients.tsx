import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, MoreHorizontal, UserCircle, Calendar, Phone, Mail, MapPin, Heart, AlertTriangle } from "lucide-react";
import { Patient } from "@shared/schema";
import { useAuth } from "@/contexts/auth-context";
import { useTenant } from "@/contexts/tenant-context";
import { useTranslation } from "@/contexts/translation-context";
import { PatientForm } from "@/components/forms/patient-form";
import { useLocation } from "wouter";

export default function Patients() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isEHROpen, setIsEHROpen] = useState(false);
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: patients = [], isLoading } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
    enabled: !!user && !!tenant,
  });

  const createPatientMutation = useMutation({
    mutationFn: async (patientData: any) => {
      const response = await fetch("/api/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        },
        body: JSON.stringify(patientData)
      });
      if (!response.ok) throw new Error("Failed to create patient");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      setIsFormOpen(false);
    }
  });

  if (!user || !tenant) {
    return <div>{t('loading')}</div>;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getPatientInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const handleViewEHR = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsEHROpen(true);
  };

  const handleScheduleAppointment = (patient: Patient) => {
    // Navigate to appointment creation with pre-filled patient info
    setLocation(`/appointments?patientId=${patient.id}&patientName=${encodeURIComponent(patient.firstName + ' ' + patient.lastName)}`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('patients')}</h1>
          <p className="text-gray-600 mt-1">{t('manage-patient-records')}</p>
        </div>
        {/* Only show Add Patient button for non-pharmacy users */}
        {!(user.role === "tenant_admin" && tenant?.type === "pharmacy") && user.role !== "pharmacist" && (
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Patient
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
            </DialogHeader>
            <PatientForm
              onSubmit={(data) => createPatientMutation.mutate(data)}
              isLoading={createPatientMutation.isPending}
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
                placeholder="Search patients by name or MRN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Patient Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center space-x-4 py-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                    </div>
                    <div className="h-8 w-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-12">
              <UserCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery 
                  ? "No patients match your search criteria" 
                  : "Get started by adding your first patient"
                }
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Patient
              </Button>
            </div>
          ) : (
            <div className="space-y-0">
              {patients.map((patient) => (
                <div 
                  key={patient.id}
                  className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
                        {getPatientInitials(patient.firstName, patient.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">
                          {patient.firstName} {patient.lastName}
                        </p>
                        {patient.gender && (
                          <Badge variant="outline" className="text-xs">
                            {patient.gender}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        DOB: {formatDate(patient.dateOfBirth)}
                      </p>
                      <p className="text-xs text-gray-400">
                        MRN: {patient.mrn}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Last Visit</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(patient.updatedAt)}
                      </p>
                    </div>
                    
                    <Badge 
                      variant={patient.isActive ? "default" : "secondary"}
                      className={patient.isActive ? "bg-green-100 text-green-800" : ""}
                    >
                      {patient.isActive ? "Active" : "Inactive"}
                    </Badge>
                    
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-600 hover:text-blue-700"
                        onClick={() => handleViewEHR(patient)}
                      >
                        View EHR
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-teal-600 hover:text-teal-700"
                        onClick={() => handleScheduleAppointment(patient)}
                      >
                        Schedule
                      </Button>
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

      {/* Patient EHR Modal */}
      <Dialog open={isEHROpen} onOpenChange={setIsEHROpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-blue-100 text-blue-700 text-lg font-medium">
                  {selectedPatient && getPatientInitials(selectedPatient.firstName, selectedPatient.lastName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">
                  {selectedPatient?.firstName} {selectedPatient?.lastName}
                </h2>
                <p className="text-sm text-gray-600">Electronic Health Record</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {selectedPatient && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Patient Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium">MRN:</span>
                      <span>{selectedPatient.mrn}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Date of Birth:</span>
                      <span>{formatDate(selectedPatient.dateOfBirth)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Gender:</span>
                      <span>{selectedPatient.gender || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Phone:</span>
                      <span>{selectedPatient.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Email:</span>
                      <span>{selectedPatient.email || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Status:</span>
                      <Badge variant={selectedPatient.isActive ? "default" : "secondary"}>
                        {selectedPatient.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="font-medium">Address:</span>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedPatient.address && typeof selectedPatient.address === 'object' 
                          ? `${(selectedPatient.address as any).street || ''} ${(selectedPatient.address as any).city || ''} ${(selectedPatient.address as any).state || ''} ${(selectedPatient.address as any).zipCode || ''}`.trim() || 'No address on file'
                          : selectedPatient.address || 'No address on file'
                        }
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Emergency Contact:</span>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedPatient.emergencyContact && typeof selectedPatient.emergencyContact === 'object' 
                          ? `${(selectedPatient.emergencyContact as any).name || 'N/A'} (${(selectedPatient.emergencyContact as any).relationship || 'N/A'}) - ${(selectedPatient.emergencyContact as any).phone || 'N/A'}`
                          : selectedPatient.emergencyContact || 'No emergency contact on file'
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Medical Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                      Allergies
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedPatient.allergies && Array.isArray(selectedPatient.allergies) && selectedPatient.allergies.length > 0 ? (
                      <div className="space-y-2">
                        {selectedPatient.allergies.map((allergy, index) => (
                          <Badge key={index} variant="destructive" className="mr-2">
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">No known allergies</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Heart className="h-5 w-5 mr-2 text-blue-500" />
                      Medical History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedPatient.medicalHistory && Array.isArray(selectedPatient.medicalHistory) && selectedPatient.medicalHistory.length > 0 ? (
                      <div className="space-y-2">
                        {selectedPatient.medicalHistory.map((condition, index) => (
                          <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                            {condition}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">No medical history recorded</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Insurance Information */}
              {selectedPatient.insuranceInfo && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Insurance Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {typeof selectedPatient.insuranceInfo === 'object' && selectedPatient.insuranceInfo ? (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">Provider:</span>
                          <span>{(selectedPatient.insuranceInfo as any).provider || 'Not specified'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Policy Number:</span>
                          <span>{(selectedPatient.insuranceInfo as any).policyNumber || 'Not specified'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Group Number:</span>
                          <span>{(selectedPatient.insuranceInfo as any).groupNumber || 'Not specified'}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">{selectedPatient.insuranceInfo}</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button 
                  variant="outline"
                  onClick={() => handleScheduleAppointment(selectedPatient)}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Appointment
                </Button>
                <Button onClick={() => setIsEHROpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
