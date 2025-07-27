import { useState, useEffect } from "react";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Calendar, FileText, Pill, Activity, Heart, AlertTriangle, Stethoscope, Clock, User, Building } from "lucide-react";
import { Patient, Appointment, Prescription, LabOrder, VitalSigns } from "@shared/schema";
import { useAuth } from "@/contexts/auth-context";
import { useTenant } from "@/contexts/tenant-context";
import { useTranslation } from "@/contexts/translation-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PatientMedicalRecord extends Patient {
  appointments?: Appointment[];
  prescriptions?: Prescription[];
  labOrders?: LabOrder[];
  vitalSigns?: VitalSigns[];
  lastVisit?: string;
  upcomingAppointments?: number;
}

export default function PatientMedicalRecords() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<PatientMedicalRecord | null>(null);
  const [filterBy, setFilterBy] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { t } = useTranslation();

  const { data: patients = [], isLoading } = useQuery<PatientMedicalRecord[]>({
    queryKey: ["/api/patients/medical-records"],
    enabled: !!user && !!tenant,
  });

  const { data: selectedPatientDetails, isLoading: isDetailsLoading } = useQuery({
    queryKey: ["/api/patients", selectedPatient?.id, "complete-record"],
    enabled: !!selectedPatient,
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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
                  placeholder="Search by name, MRN, condition..."
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
                Patients ({sortedPatients.length})
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
              ) : sortedPatients.length === 0 ? (
                <div className="text-center py-8 p-4">
                  <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No patients found matching your criteria</p>
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
                            <span>{formatDate(selectedPatient.dateOfBirth)}</span>
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

                    {/* Quick Actions */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline">
                            <Calendar className="h-4 w-4 mr-2" />
                            Schedule Appointment
                          </Button>
                          <Button size="sm" variant="outline">
                            <Pill className="h-4 w-4 mr-2" />
                            New Prescription
                          </Button>
                          <Button size="sm" variant="outline">
                            <Activity className="h-4 w-4 mr-2" />
                            Order Lab Test
                          </Button>
                          <Button size="sm" variant="outline">
                            <FileText className="h-4 w-4 mr-2" />
                            Add Note
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="history" className="space-y-4 mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <Heart className="h-5 w-5 mr-2 text-red-500" />
                          Medical History
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedPatient.medicalHistory && Array.isArray(selectedPatient.medicalHistory) && selectedPatient.medicalHistory.length > 0 ? (
                          <div className="space-y-3">
                            {selectedPatient.medicalHistory.map((condition, index) => (
                              <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-center space-x-2">
                                  <Heart className="h-4 w-4 text-red-500" />
                                  <span className="font-medium text-red-900">{condition as string}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-600 py-4">No medical history recorded</p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="medications" className="space-y-4 mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <Pill className="h-5 w-5 mr-2 text-blue-500" />
                          Current Medications
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedPatient.medications && Array.isArray(selectedPatient.medications) && selectedPatient.medications.length > 0 ? (
                          <div className="space-y-3">
                            {selectedPatient.medications.map((medication, index) => (
                              <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center space-x-2">
                                  <Pill className="h-4 w-4 text-blue-500" />
                                  <span className="font-medium text-blue-900">{medication as string}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-600 py-4">No current medications recorded</p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="allergies" className="space-y-4 mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
                          Allergies & Reactions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedPatient.allergies && Array.isArray(selectedPatient.allergies) && selectedPatient.allergies.length > 0 ? (
                          <div className="space-y-3">
                            {selectedPatient.allergies.map((allergy, index) => (
                              <div key={index} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                <div className="flex items-center space-x-2">
                                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                                  <span className="font-medium text-orange-900">{allergy as string}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-600 py-4">No known allergies</p>
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
                        <div className="space-y-4">
                          <div className="text-center py-8 text-gray-500">
                            <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p>Medical timeline will be populated with appointment history, prescription changes, and lab results.</p>
                          </div>
                        </div>
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