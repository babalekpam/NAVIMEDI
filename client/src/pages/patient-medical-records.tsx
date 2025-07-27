import { useState, useEffect } from "react";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Calendar, FileText, Pill, Activity, Heart, AlertTriangle, Stethoscope, Clock, User, Building, Edit, Save, X, Plus, TestTube, Zap } from "lucide-react";
import { Patient, Appointment, Prescription, LabOrder, VitalSigns, VisitSummary } from "@shared/schema";
import { useAuth } from "@/contexts/auth-context";
import { useTenant } from "@/contexts/tenant-context";
import { useTranslation } from "@/contexts/translation-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface PatientMedicalRecord extends Patient {
  appointments?: any[];
  prescriptions?: any[];
  labOrders?: LabOrder[];
  vitalSigns?: VitalSigns[];
  visitSummaries?: any[];
  lastVisit?: string;
  upcomingAppointments?: number;
}

export default function PatientMedicalRecords() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<PatientMedicalRecord | null>(null);
  const [filterBy, setFilterBy] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [editingMedicalHistory, setEditingMedicalHistory] = useState(false);
  const [editingMedications, setEditingMedications] = useState(false);
  const [editingAllergies, setEditingAllergies] = useState(false);
  const [newMedicalCondition, setNewMedicalCondition] = useState("");
  const [newMedication, setNewMedication] = useState("");
  const [newAllergy, setNewAllergy] = useState("");
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: allPatients = [], isLoading } = useQuery<PatientMedicalRecord[]>({
    queryKey: ["/api/patients/medical-records"],
    queryFn: async () => {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/patients/medical-records", {
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch patients");
      }
      
      return response.json();
    },
    enabled: !!user && !!tenant,
  });

  // Client-side filtering based on search query
  const patients = React.useMemo(() => {
    if (!searchQuery.trim()) return allPatients;
    
    const query = searchQuery.toLowerCase().trim();
    return allPatients.filter(patient => 
      patient.firstName?.toLowerCase().includes(query) ||
      patient.lastName?.toLowerCase().includes(query) ||
      patient.mrn?.toLowerCase().includes(query) ||
      patient.email?.toLowerCase().includes(query) ||
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(query)
    );
  }, [allPatients, searchQuery]);

  const { data: selectedPatientDetails, isLoading: isDetailsLoading } = useQuery<any>({
    queryKey: ["/api/patients", selectedPatient?.id, "complete-record"],
    enabled: !!selectedPatient,
  });

  // Mutation for updating patient medical information
  const updatePatientMutation = useMutation({
    mutationFn: async (updateData: { 
      patientId: string; 
      medicalHistory?: string[]; 
      medications?: string[]; 
      allergies?: string[]; 
    }) => {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/patients/${updateData.patientId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          medicalHistory: updateData.medicalHistory,
          medications: updateData.medications,
          allergies: updateData.allergies,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Update request failed:", response.status, errorText);
        throw new Error(`Update failed: ${response.status} - ${errorText}`);
      }

      return response.json();
    },
    onSuccess: (data) => {
      console.log("Update successful, received data:", data);
      toast({
        title: "Success",
        description: "Patient medical information updated successfully",
      });
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/patients", selectedPatient?.id, "complete-record"] });
      queryClient.invalidateQueries({ queryKey: ["/api/patients/medical-records"] });
      // Reset editing states
      setEditingMedicalHistory(false);
      setEditingMedications(false);
      setEditingAllergies(false);
    },
    onError: (error) => {
      console.error("Update failed:", error);
      toast({
        title: "Error",
        description: `Failed to update patient medical information: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  if (!user || !tenant) {
    return <div className="flex items-center justify-center h-96">{t('loading')}</div>;
  }

  // Filter and sort patients
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (patient.allergies && Array.isArray(patient.allergies) && 
       patient.allergies.some(allergy => 
         (allergy as string).toLowerCase().includes(searchQuery.toLowerCase())
       )) ||
      (patient.medicalHistory && Array.isArray(patient.medicalHistory) && 
       patient.medicalHistory.some(condition => 
         (condition as string).toLowerCase().includes(searchQuery.toLowerCase())
       ));

    if (filterBy === "all") return matchesSearch;
    if (filterBy === "chronic") {
      return matchesSearch && patient.medicalHistory && 
             Array.isArray(patient.medicalHistory) && 
             patient.medicalHistory.length > 0;
    }
    if (filterBy === "allergies") {
      return matchesSearch && patient.allergies && 
             Array.isArray(patient.allergies) && 
             patient.allergies.length > 0;
    }
    if (filterBy === "recent") {
      return matchesSearch && patient.lastVisit && 
             new Date(patient.lastVisit) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }
    return matchesSearch;
  });

  const sortedPatients = [...filteredPatients].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      case "mrn":
        return a.mrn.localeCompare(b.mrn);
      case "recent":
        return (new Date(b.lastVisit || 0)).getTime() - (new Date(a.lastVisit || 0)).getTime();
      case "upcoming":
        return (b.upcomingAppointments || 0) - (a.upcomingAppointments || 0);
      default:
        return 0;
    }
  });

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "Invalid Date";
    }
  };

  const getPatientInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const getRiskLevel = (patient: PatientMedicalRecord) => {
    let riskScore = 0;
    if (patient.allergies && Array.isArray(patient.allergies) && patient.allergies.length > 0) riskScore += 2;
    if (patient.medicalHistory && Array.isArray(patient.medicalHistory) && patient.medicalHistory.length > 3) riskScore += 3;
    if (patient.medications && Array.isArray(patient.medications) && patient.medications.length > 5) riskScore += 2;
    
    if (riskScore >= 5) return { level: "high", color: "bg-red-100 text-red-800" };
    if (riskScore >= 3) return { level: "medium", color: "bg-yellow-100 text-yellow-800" };
    return { level: "low", color: "bg-green-100 text-green-800" };
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>
          <p className="text-gray-600 mt-1">Comprehensive patient medical information for healthcare professionals</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-blue-600">
            <Building className="h-4 w-4 mr-1" />
            {tenant.name}
          </Badge>
          <Badge variant="outline" className="text-green-600">
            <User className="h-4 w-4 mr-1" />
            {user.role.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Patient List */}
        <div className="lg:col-span-1 space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Find Patients</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 text-gray-400 transform -translate-y-1/2" />
                <Input
                  placeholder="🔍 Search by name, MRN, conditions, allergies... (minimum 2 characters)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Filter By</label>
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Patients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Patients</SelectItem>
                    <SelectItem value="chronic">Chronic Conditions</SelectItem>
                    <SelectItem value="allergies">With Allergies</SelectItem>
                    <SelectItem value="recent">Recent Visits</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Recent Activity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Recent Activity</SelectItem>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="mrn">Medical Record Number</SelectItem>
                    <SelectItem value="upcoming">Upcoming Appointments</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Patient List */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Stethoscope className="h-5 w-5 mr-2" />
                {searchQuery.length >= 2 
                  ? `Search Results (${sortedPatients.length})` 
                  : "Patient Search"
                }
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="space-y-4 p-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex items-center space-x-3">
                      <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchQuery.length < 2 ? (
                <div className="text-center py-12 p-4">
                  <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg font-medium mb-2">Search for Patients</p>
                  <p className="text-gray-500 text-sm">Enter at least 2 characters to search by name, MRN, conditions, or allergies</p>
                  <div className="mt-4 text-xs text-gray-400">
                    <p>🔒 Patient privacy protected - search required to view records</p>
                  </div>
                </div>
              ) : sortedPatients.length === 0 ? (
                <div className="text-center py-8 p-4">
                  <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No patients found matching: "{searchQuery}"</p>
                  <p className="text-gray-500 text-sm mt-1">Try searching by name, MRN, medical conditions, or allergies</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {sortedPatients.map((patient) => {
                    const risk = getRiskLevel(patient);
                    return (
                      <div
                        key={patient.id}
                        onClick={() => setSelectedPatient(patient)}
                        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedPatient?.id === patient.id ? "bg-blue-50 border-blue-200" : ""
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-medium">
                              {getPatientInitials(patient.firstName, patient.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {patient.firstName} {patient.lastName}
                              </p>
                              <Badge className={`text-xs ${risk.color}`}>
                                {risk.level}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500">MRN: {patient.mrn}</p>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-xs text-gray-400">
                                {patient.lastVisit ? `Last: ${formatDate(patient.lastVisit)}` : "No recent visits"}
                              </p>
                              {patient.upcomingAppointments && patient.upcomingAppointments > 0 && (
                                <span className="text-xs bg-green-100 text-green-800 px-1 rounded">
                                  {patient.upcomingAppointments} upcoming
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Patient Details */}
        <div className="lg:col-span-2">
          {selectedPatient ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
                        {getPatientInitials(selectedPatient.firstName, selectedPatient.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-xl font-bold">
                        {selectedPatient.firstName} {selectedPatient.lastName}
                      </h2>
                      <p className="text-sm text-gray-600">MRN: {selectedPatient.mrn}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getRiskLevel(selectedPatient).level !== "low" && (
                      <Badge className={getRiskLevel(selectedPatient).color}>
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {getRiskLevel(selectedPatient).level.toUpperCase()} RISK
                      </Badge>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Quick Actions */}
                {user?.role === "physician" && (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Button
                          onClick={() => {
                            // Navigate to appointments page with patient pre-selected
                            window.location.href = `/appointments?patientId=${selectedPatient.id}&action=schedule`;
                          }}
                          className="flex flex-col items-center p-4 h-auto"
                          variant="outline"
                        >
                          <Calendar className="h-6 w-6 mb-2 text-blue-500" />
                          <span className="text-sm">Schedule Appointment</span>
                        </Button>
                        
                        <Button
                          onClick={() => {
                            // Navigate to prescriptions page with patient pre-selected
                            window.location.href = `/prescriptions?patientId=${selectedPatient.id}&action=new`;
                          }}
                          className="flex flex-col items-center p-4 h-auto"
                          variant="outline"
                        >
                          <Pill className="h-6 w-6 mb-2 text-green-500" />
                          <span className="text-sm">New Prescription</span>
                        </Button>
                        
                        <Button
                          onClick={() => {
                            // Navigate to lab orders page with patient pre-selected
                            window.location.href = `/lab-orders?patientId=${selectedPatient.id}&action=new`;
                          }}
                          className="flex flex-col items-center p-4 h-auto"
                          variant="outline"
                        >
                          <TestTube className="h-6 w-6 mb-2 text-purple-500" />
                          <span className="text-sm">Order Lab Test</span>
                        </Button>
                        
                        <Button
                          onClick={() => {
                            // Navigate to consultation/visit summary with patient pre-selected
                            window.location.href = `/appointments?patientId=${selectedPatient.id}&action=consultation`;
                          }}
                          className="flex flex-col items-center p-4 h-auto"
                          variant="outline"
                        >
                          <FileText className="h-6 w-6 mb-2 text-orange-500" />
                          <span className="text-sm">Add Note</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                    <TabsTrigger value="medications">Medications</TabsTrigger>
                    <TabsTrigger value="allergies">Allergies</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            Patient Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="text-gray-600">Date of Birth:</span>
                            <span>{formatDate(selectedPatient.dateOfBirth?.toString())}</span>
                            <span className="text-gray-600">Gender:</span>
                            <span>{selectedPatient.gender || "Not specified"}</span>
                            <span className="text-gray-600">Phone:</span>
                            <span>{selectedPatient.phone || "Not provided"}</span>
                            <span className="text-gray-600">Email:</span>
                            <span className="truncate">{selectedPatient.email || "Not provided"}</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            Recent Activity
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Last Visit:</span>
                              <span>{selectedPatient.lastVisit ? formatDate(selectedPatient.lastVisit) : "None"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Upcoming Appointments:</span>
                              <span>{selectedPatient.upcomingAppointments || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Active Prescriptions:</span>
                              <span>{selectedPatient.prescriptions?.length || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Pending Lab Orders:</span>
                              <span>{selectedPatient.labOrders?.length || 0}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>


                  </TabsContent>

                  <TabsContent value="history" className="space-y-4 mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center justify-between">
                          <div className="flex items-center">
                            <Heart className="h-5 w-5 mr-2 text-red-500" />
                            Medical History
                          </div>
                          {user?.role === "physician" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingMedicalHistory(!editingMedicalHistory)}
                              disabled={updatePatientMutation.isPending}
                            >
                              {editingMedicalHistory ? (
                                <>
                                  <X className="h-4 w-4 mr-2" />
                                  Cancel
                                </>
                              ) : (
                                <>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit History
                                </>
                              )}
                            </Button>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {editingMedicalHistory ? (
                          <div className="space-y-4">
                            {/* Existing conditions - editable */}
                            {(selectedPatientDetails?.medicalHistory || selectedPatient.medicalHistory) && Array.isArray(selectedPatientDetails?.medicalHistory || selectedPatient.medicalHistory) && (selectedPatientDetails?.medicalHistory || selectedPatient.medicalHistory).length > 0 && (
                              <div className="space-y-3">
                                <h4 className="font-medium text-gray-700">Current Medical Conditions:</h4>
                                {(selectedPatientDetails?.medicalHistory || selectedPatient.medicalHistory).map((condition, index) => (
                                  <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <Heart className="h-4 w-4 text-red-500" />
                                      <span className="font-medium text-red-900">{condition as string}</span>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        const currentHistory = selectedPatientDetails?.medicalHistory || selectedPatient.medicalHistory || [];
                                        const updatedHistory = currentHistory.filter((_, i) => i !== index);
                                        updatePatientMutation.mutate({
                                          patientId: selectedPatient.id,
                                          medicalHistory: updatedHistory,
                                        });
                                      }}
                                    >
                                      <X className="h-4 w-4 text-red-600" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {/* Add new condition */}
                            <div className="border-t pt-4">
                              <h4 className="font-medium text-gray-700 mb-3">Add New Medical Condition:</h4>
                              <div className="flex space-x-2">
                                <Input
                                  placeholder="Enter medical condition or diagnosis..."
                                  value={newMedicalCondition}
                                  onChange={(e) => setNewMedicalCondition(e.target.value)}
                                  className="flex-1"
                                />
                                <Button
                                  onClick={() => {
                                    if (newMedicalCondition.trim()) {
                                      const currentHistory = selectedPatientDetails?.medicalHistory || selectedPatient.medicalHistory || [];
                                      const updatedHistory = [...currentHistory, newMedicalCondition.trim()];
                                      console.log("Adding medical condition:", newMedicalCondition.trim());
                                      console.log("Current history:", currentHistory);
                                      console.log("Updated history will be:", updatedHistory);
                                      updatePatientMutation.mutate({
                                        patientId: selectedPatient.id,
                                        medicalHistory: updatedHistory,
                                      });
                                      setNewMedicalCondition("");
                                    }
                                  }}
                                  disabled={!newMedicalCondition.trim() || updatePatientMutation.isPending}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add
                                </Button>
                              </div>
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setEditingMedicalHistory(false);
                                  setNewMedicalCondition("");
                                }}
                              >
                                Done Editing
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {selectedPatientDetails?.medicalHistory && Array.isArray(selectedPatientDetails.medicalHistory) && selectedPatientDetails.medicalHistory.length > 0 ? (
                              <div className="space-y-3">
                                {selectedPatientDetails.medicalHistory.map((condition, index) => (
                                  <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-center space-x-2">
                                      <Heart className="h-4 w-4 text-red-500" />
                                      <span className="font-medium text-red-900">{condition as string}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <Heart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-600 mb-4">No medical history recorded</p>
                                {user?.role === "physician" && (
                                  <Button
                                    variant="outline"
                                    onClick={() => setEditingMedicalHistory(true)}
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Medical History
                                  </Button>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="medications" className="space-y-4 mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center justify-between">
                          <div className="flex items-center">
                            <Pill className="h-5 w-5 mr-2 text-blue-500" />
                            Current Medications
                          </div>
                          {user?.role === "physician" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingMedications(!editingMedications)}
                              disabled={updatePatientMutation.isPending}
                            >
                              {editingMedications ? (
                                <>
                                  <X className="h-4 w-4 mr-2" />
                                  Cancel
                                </>
                              ) : (
                                <>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Medications
                                </>
                              )}
                            </Button>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {editingMedications ? (
                          <div className="space-y-4">
                            {/* Existing medications - editable */}
                            {(selectedPatientDetails?.medications || selectedPatient.medications) && Array.isArray(selectedPatientDetails?.medications || selectedPatient.medications) && (selectedPatientDetails?.medications || selectedPatient.medications).length > 0 && (
                              <div className="space-y-3">
                                <h4 className="font-medium text-gray-700">Current Medications:</h4>
                                {(selectedPatientDetails?.medications || selectedPatient.medications).map((medication, index) => (
                                  <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <Pill className="h-4 w-4 text-blue-500" />
                                      <span className="font-medium text-blue-900">{medication as string}</span>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        const currentMedications = selectedPatientDetails?.medications || selectedPatient.medications || [];
                                        const updatedMedications = currentMedications.filter((_, i) => i !== index);
                                        updatePatientMutation.mutate({
                                          patientId: selectedPatient.id,
                                          medications: updatedMedications,
                                        });
                                      }}
                                    >
                                      <X className="h-4 w-4 text-blue-600" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {/* Add new medication */}
                            <div className="border-t pt-4">
                              <h4 className="font-medium text-gray-700 mb-3">Add New Medication:</h4>
                              <div className="flex space-x-2">
                                <Input
                                  placeholder="Enter medication name and dosage..."
                                  value={newMedication}
                                  onChange={(e) => setNewMedication(e.target.value)}
                                  className="flex-1"
                                />
                                <Button
                                  onClick={() => {
                                    if (newMedication.trim()) {
                                      const currentMedications = selectedPatientDetails?.medications || selectedPatient.medications || [];
                                      const updatedMedications = [...currentMedications, newMedication.trim()];
                                      updatePatientMutation.mutate({
                                        patientId: selectedPatient.id,
                                        medications: updatedMedications,
                                      });
                                      setNewMedication("");
                                    }
                                  }}
                                  disabled={!newMedication.trim() || updatePatientMutation.isPending}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add
                                </Button>
                              </div>
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setEditingMedications(false);
                                  setNewMedication("");
                                }}
                              >
                                Done Editing
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {selectedPatientDetails?.medications && Array.isArray(selectedPatientDetails.medications) && selectedPatientDetails.medications.length > 0 ? (
                              <div className="space-y-3">
                                {selectedPatientDetails.medications.map((medication, index) => (
                                  <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-center space-x-2">
                                      <Pill className="h-4 w-4 text-blue-500" />
                                      <span className="font-medium text-blue-900">{medication as string}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <Pill className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-600 mb-4">No current medications recorded</p>
                                {user?.role === "physician" && (
                                  <Button
                                    variant="outline"
                                    onClick={() => setEditingMedications(true)}
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Medications
                                  </Button>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="allergies" className="space-y-4 mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center justify-between">
                          <div className="flex items-center">
                            <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
                            Allergies & Reactions
                          </div>
                          {user?.role === "physician" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingAllergies(!editingAllergies)}
                              disabled={updatePatientMutation.isPending}
                            >
                              {editingAllergies ? (
                                <>
                                  <X className="h-4 w-4 mr-2" />
                                  Cancel
                                </>
                              ) : (
                                <>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Allergies
                                </>
                              )}
                            </Button>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {editingAllergies ? (
                          <div className="space-y-4">
                            {/* Existing allergies - editable */}
                            {(selectedPatientDetails?.allergies || selectedPatient.allergies) && Array.isArray(selectedPatientDetails?.allergies || selectedPatient.allergies) && (selectedPatientDetails?.allergies || selectedPatient.allergies).length > 0 && (
                              <div className="space-y-3">
                                <h4 className="font-medium text-gray-700">Known Allergies:</h4>
                                {(selectedPatientDetails?.allergies || selectedPatient.allergies).map((allergy, index) => (
                                  <div key={index} className="p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                                      <span className="font-medium text-orange-900">{allergy as string}</span>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        const currentAllergies = selectedPatientDetails?.allergies || selectedPatient.allergies || [];
                                        const updatedAllergies = currentAllergies.filter((_, i) => i !== index);
                                        updatePatientMutation.mutate({
                                          patientId: selectedPatient.id,
                                          allergies: updatedAllergies,
                                        });
                                      }}
                                    >
                                      <X className="h-4 w-4 text-orange-600" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {/* Add new allergy */}
                            <div className="border-t pt-4">
                              <h4 className="font-medium text-gray-700 mb-3">Add New Allergy:</h4>
                              <div className="flex space-x-2">
                                <Input
                                  placeholder="Enter allergy or adverse reaction..."
                                  value={newAllergy}
                                  onChange={(e) => setNewAllergy(e.target.value)}
                                  className="flex-1"
                                />
                                <Button
                                  onClick={() => {
                                    if (newAllergy.trim()) {
                                      const currentAllergies = selectedPatientDetails?.allergies || selectedPatient.allergies || [];
                                      const updatedAllergies = [...currentAllergies, newAllergy.trim()];
                                      updatePatientMutation.mutate({
                                        patientId: selectedPatient.id,
                                        allergies: updatedAllergies,
                                      });
                                      setNewAllergy("");
                                    }
                                  }}
                                  disabled={!newAllergy.trim() || updatePatientMutation.isPending}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add
                                </Button>
                              </div>
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setEditingAllergies(false);
                                  setNewAllergy("");
                                }}
                              >
                                Done Editing
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {selectedPatientDetails?.allergies && Array.isArray(selectedPatientDetails.allergies) && selectedPatientDetails.allergies.length > 0 ? (
                              <div className="space-y-3">
                                {selectedPatientDetails.allergies.map((allergy, index) => (
                                  <div key={index} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                    <div className="flex items-center space-x-2">
                                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                                      <span className="font-medium text-orange-900">{allergy as string}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-600 mb-4">No known allergies</p>
                                {user?.role === "physician" && (
                                  <Button
                                    variant="outline"
                                    onClick={() => setEditingAllergies(true)}
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Allergies
                                  </Button>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="timeline" className="space-y-4 mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <Clock className="h-5 w-5 mr-2 text-purple-500" />
                          Medical Timeline
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {isDetailsLoading ? (
                          <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="animate-pulse p-4 border rounded-lg">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                              </div>
                            ))}
                          </div>
                        ) : selectedPatientDetails ? (
                          <div className="space-y-4">
                            {/* Visit Summaries (Consultations) */}
                            {selectedPatientDetails.visitSummaries && selectedPatientDetails.visitSummaries.length > 0 && (
                              <div className="space-y-3">
                                <h4 className="font-medium text-green-700 flex items-center">
                                  <Stethoscope className="h-4 w-4 mr-2" />
                                  Consultation Records ({selectedPatientDetails.visitSummaries.length})
                                </h4>
                                {selectedPatientDetails.visitSummaries.map((vs: any, index: number) => (
                                  <div key={index} className="p-4 border border-green-200 bg-green-50 rounded-lg">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                          <Stethoscope className="h-4 w-4 text-green-600" />
                                          <span className="font-medium text-green-800">
                                            Consultation - {formatDate(vs.visitSummary.visitDate)}
                                          </span>
                                          <Badge className="bg-green-100 text-green-800 text-xs">
                                            {vs.visitSummary.status || 'Completed'}
                                          </Badge>
                                        </div>
                                        <div className="text-sm text-gray-700 space-y-1">
                                          <p><strong>Provider:</strong> Dr. {vs.providerName} {vs.providerLastName}</p>
                                          {vs.visitSummary.chiefComplaint && (
                                            <p><strong>Chief Complaint:</strong> {vs.visitSummary.chiefComplaint}</p>
                                          )}
                                          {vs.visitSummary.assessment && (
                                            <p><strong>Assessment:</strong> {vs.visitSummary.assessment}</p>
                                          )}
                                          {vs.visitSummary.treatmentPlan && (
                                            <p><strong>Treatment Plan:</strong> {vs.visitSummary.treatmentPlan}</p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Appointments */}
                            {selectedPatientDetails.appointments && selectedPatientDetails.appointments.length > 0 && (
                              <div className="space-y-3">
                                <h4 className="font-medium text-blue-700 flex items-center">
                                  <Calendar className="h-4 w-4 mr-2" />
                                  Appointments ({selectedPatientDetails.appointments.length})
                                </h4>
                                {selectedPatientDetails.appointments.slice(0, 5).map((apt: any, index: number) => (
                                  <div key={index} className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <div className="flex items-center space-x-2 mb-1">
                                          <Calendar className="h-4 w-4 text-blue-600" />
                                          <span className="font-medium text-blue-800">
                                            {formatDate(apt.appointment.appointmentDate)}
                                          </span>
                                          <Badge className="bg-blue-100 text-blue-800 text-xs">
                                            {apt.appointment.status}
                                          </Badge>
                                        </div>
                                        <p className="text-sm text-gray-700">
                                          Provider: Dr. {apt.providerName} {apt.providerLastName}
                                        </p>
                                        {apt.appointment.notes && (
                                          <p className="text-sm text-gray-600 mt-1">{apt.appointment.notes}</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Prescriptions */}
                            {selectedPatientDetails.prescriptions && selectedPatientDetails.prescriptions.length > 0 && (
                              <div className="space-y-3">
                                <h4 className="font-medium text-purple-700 flex items-center">
                                  <Pill className="h-4 w-4 mr-2" />
                                  Prescriptions ({selectedPatientDetails.prescriptions.length})
                                </h4>
                                {selectedPatientDetails.prescriptions.slice(0, 5).map((presc: any, index: number) => (
                                  <div key={index} className="p-4 border border-purple-200 bg-purple-50 rounded-lg">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <div className="flex items-center space-x-2 mb-1">
                                          <Pill className="h-4 w-4 text-purple-600" />
                                          <span className="font-medium text-purple-800">
                                            {presc.prescription.medicationName}
                                          </span>
                                          <Badge className="bg-purple-100 text-purple-800 text-xs">
                                            {presc.prescription.status}
                                          </Badge>
                                        </div>
                                        <p className="text-sm text-gray-700">
                                          Prescribed by: Dr. {presc.providerName} {presc.providerLastName}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                          {formatDate(presc.prescription.prescribedDate)} - {presc.prescription.dosage}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Lab Orders */}
                            {selectedPatientDetails.labOrders && selectedPatientDetails.labOrders.length > 0 && (
                              <div className="space-y-3">
                                <h4 className="font-medium text-orange-700 flex items-center">
                                  <FileText className="h-4 w-4 mr-2" />
                                  Lab Orders ({selectedPatientDetails.labOrders.length})
                                </h4>
                                {selectedPatientDetails.labOrders.slice(0, 5).map((lab: LabOrder, index: number) => (
                                  <div key={index} className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <div className="flex items-center space-x-2 mb-1">
                                          <FileText className="h-4 w-4 text-orange-600" />
                                          <span className="font-medium text-orange-800">
                                            {lab.testName}
                                          </span>
                                          <Badge className="bg-orange-100 text-orange-800 text-xs">
                                            {lab.status}
                                          </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                          {formatDate(lab.orderedDate?.toString())}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* No data message */}
                            {(!selectedPatientDetails.visitSummaries || selectedPatientDetails.visitSummaries.length === 0) &&
                             (!selectedPatientDetails.appointments || selectedPatientDetails.appointments.length === 0) &&
                             (!selectedPatientDetails.prescriptions || selectedPatientDetails.prescriptions.length === 0) &&
                             (!selectedPatientDetails.labOrders || selectedPatientDetails.labOrders.length === 0) && (
                              <div className="text-center py-8 text-gray-500">
                                <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                <p>No medical history available for this patient</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p>Loading patient medical timeline...</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <Stethoscope className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Patient</h3>
                  <p className="text-gray-600">Choose a patient from the list to view their complete medical record</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}