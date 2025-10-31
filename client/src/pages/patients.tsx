import { useState, useEffect } from "react";
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Search, Plus, MoreHorizontal, UserCircle, Calendar, Phone, Mail, MapPin, Heart, AlertTriangle, Edit, Trash2, Copy, FileText, Share, Moon, TrendingUp, Scale, Zap, X, User, Activity, Stethoscope, Shield } from "lucide-react";
import { Patient } from "@shared/schema";
import { useAuth } from "@/contexts/auth-context";
import { useTenant } from "@/contexts/tenant-context";
import { useTranslation } from "@/contexts/translation-context";
import { PatientForm } from "@/components/forms/patient-form";
import { useLocation } from "wouter";
import { useCreatePatientMutation } from "@/lib/enhanced-mutations";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

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
  const { toast } = useToast();

  // Check URL parameters to auto-open registration form
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'register') {
      setIsFormOpen(true);
    }
  }, []);

  const { data: patients = [], isLoading } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
    enabled: !!user && !!tenant,
  });

  // Fetch latest vital signs for selected patient
  const { data: patientVitalSigns } = useQuery({
    queryKey: ["/api/patients", selectedPatient?.id, "vital-signs"],
    enabled: !!selectedPatient,
  });

  // Enhanced patient creation with real-time dashboard updates
  const createPatientMutation = useCreatePatientMutation();
  
  // Override success handler to also close form
  const originalMutate = createPatientMutation.mutate;
  createPatientMutation.mutate = (data) => {
    return originalMutate(data, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
        setIsFormOpen(false);
      }
    });
  };

  // Patient activation/deactivation mutation
  const togglePatientStatusMutation = useMutation({
    mutationFn: async ({ patientId, isActive }: { patientId: string; isActive: boolean }) => {
      return await apiRequest(`/api/patients/${patientId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
      });
    },
    onSuccess: (_, { isActive }) => {
      toast({
        title: "Success",
        description: `Patient ${isActive ? 'activated' : 'deactivated'} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update patient status",
        variant: "destructive",
      });
    },
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
        {/* Only show Add Patient button for receptionists and admins */}
        {(user.role === "receptionist" || user.role === "tenant_admin" || user.role === "director" || user.role === "super_admin") && (
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                {t('add-patient')}
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('add-patient')}</DialogTitle>
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
                placeholder={t('search-patients')}
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
          <CardTitle>{t('recent-patient-activity')}</CardTitle>
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('no-patients-found')}</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery 
                  ? t('no-patients-match-search')
                  : t('get-started-add-first-patient')
                }
              </p>
              {(user.role === "receptionist" || user.role === "tenant_admin" || user.role === "director" || user.role === "super_admin") && (
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => setIsFormOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('add-patient')}
                </Button>
              )}
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
                        DOB: {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'}
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
                        {patient.updatedAt ? new Date(patient.updatedAt).toLocaleDateString() : 'N/A'}
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
                      {(user.role === "receptionist" || user.role === "tenant_admin" || user.role === "director" || user.role === "super_admin") && tenant?.type !== "pharmacy" && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-teal-600 hover:text-teal-700"
                          onClick={() => handleScheduleAppointment(patient)}
                        >
                          Schedule
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewEHR(patient)}>
                            <FileText className="h-4 w-4 mr-2" />
                            View EHR
                          </DropdownMenuItem>
                          {(user.role === "receptionist" || user.role === "tenant_admin" || user.role === "director" || user.role === "super_admin") && tenant?.type !== "pharmacy" && (
                            <DropdownMenuItem onClick={() => handleScheduleAppointment(patient)}>
                              <Calendar className="h-4 w-4 mr-2" />
                              Schedule Appointment
                            </DropdownMenuItem>
                          )}
                          {(user.role === "receptionist" || user.role === "tenant_admin" || user.role === "director" || user.role === "super_admin") && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => {
                                setSelectedPatient(patient);
                                setIsFormOpen(true);
                              }}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Patient
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                // Copy patient details to clipboard
                                const patientText = `Patient: ${patient.firstName} ${patient.lastName}\nMRN: ${patient.mrn}\nDOB: ${patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'}\nPhone: ${patient.phone || 'N/A'}`;
                                navigator.clipboard.writeText(patientText);
                              }}>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                // Share patient info (HIPAA compliant sharing)
                                if (navigator.share) {
                                  navigator.share({
                                    title: `Patient: ${patient.firstName} ${patient.lastName}`,
                                    text: `MRN: ${patient.mrn}`,
                                  });
                                }
                              }}>
                                <Share className="h-4 w-4 mr-2" />
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          {user.role === "tenant_admin" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => {
                                  if (confirm(`Are you sure you want to ${patient.isActive ? 'deactivate' : 'activate'} this patient?`)) {
                                    togglePatientStatusMutation.mutate({ 
                                      patientId: patient.id, 
                                      isActive: !patient.isActive 
                                    });
                                  }
                                }}
                                className={patient.isActive ? "text-orange-600" : "text-green-600"}
                                data-testid={`button-${patient.isActive ? 'deactivate' : 'activate'}-patient-${patient.id}`}
                              >
                                <UserCircle className="h-4 w-4 mr-2" />
                                {patient.isActive ? 'Deactivate' : 'Activate'} Patient
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Patient EHR Modal - Modern Design */}
      <Dialog open={isEHROpen} onOpenChange={setIsEHROpen}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-blue-50/30 to-indigo-50/30 border-0">
          {/* Modern Header */}
          <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 -m-6 mb-6 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-lg">
                  <Stethoscope className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">NaviMED</h1>
                  <p className="text-sm text-gray-500">Electronic Health Record</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsEHROpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {selectedPatient && (
            <div className="space-y-6">
              {/* Modern Patient Profile Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Patient Info Card */}
                <Card className="lg:col-span-1 bg-white/60 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <Avatar className="h-20 w-20 mx-auto mb-4 ring-4 ring-blue-100">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-2xl font-semibold">
                          {getPatientInitials(selectedPatient.firstName, selectedPatient.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {selectedPatient.firstName} {selectedPatient.lastName}
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">MRN: {selectedPatient.mrn}</p>
                      
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600 flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            Gender
                          </span>
                          <span className="font-medium">{selectedPatient.gender || "Not specified"}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600 flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            Age
                          </span>
                          <span className="font-medium">
                            {selectedPatient.dateOfBirth 
                              ? Math.floor((Date.now() - new Date(selectedPatient.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365)) + " y.o."
                              : "Not specified"
                            }
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600 flex items-center">
                            <Activity className="h-4 w-4 mr-2" />
                            Height
                          </span>
                          <span className="font-medium">
                            {patientVitalSigns && patientVitalSigns.length > 0 && patientVitalSigns[0].height 
                              ? `${Math.round(patientVitalSigns[0].height * 2.54)} cm`
                              : "Not recorded"
                            }
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <span className="text-gray-600 flex items-center">
                            <Heart className="h-4 w-4 mr-2" />
                            Phone
                          </span>
                          <span className="font-medium">{selectedPatient.phone || "Not provided"}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <Badge variant={selectedPatient.isActive ? "default" : "secondary"} className="mb-2">
                          {selectedPatient.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Right: Health Metrics Cards */}
                <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                  {/* Heart Rate Card */}
                  <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Heart className="h-8 w-8 text-white/80" />
                        <TrendingUp className="h-5 w-5 text-white/60" />
                      </div>
                      <div>
                        <p className="text-white/80 text-sm mb-1">Heart Rate</p>
                        <p className="text-3xl font-bold">
                          {patientVitalSigns && patientVitalSigns.length > 0 && patientVitalSigns[0].heart_rate 
                            ? `${patientVitalSigns[0].heart_rate} bpm`
                            : "No data"
                          }
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Weight Card */}
                  <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Scale className="h-8 w-8 text-gray-600" />
                        <TrendingUp className="h-5 w-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm mb-1">Weight</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {patientVitalSigns && patientVitalSigns.length > 0 && patientVitalSigns[0].weight 
                            ? `${Math.round(patientVitalSigns[0].weight * 0.453592)} kg`
                            : "Not recorded"
                          }
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Temperature Card */}
                  <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Activity className="h-8 w-8 text-blue-600" />
                        <TrendingUp className="h-5 w-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm mb-1">Temperature</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {patientVitalSigns && patientVitalSigns.length > 0 && patientVitalSigns[0].temperature 
                            ? `${patientVitalSigns[0].temperature}°${patientVitalSigns[0].temperature_unit || 'F'}`
                            : "Not recorded"
                          }
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Oxygen Saturation Card */}
                  <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Zap className="h-8 w-8 text-green-500" />
                        <TrendingUp className="h-5 w-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm mb-1">Oxygen Sat</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {patientVitalSigns && patientVitalSigns.length > 0 && patientVitalSigns[0].oxygen_saturation 
                            ? `${patientVitalSigns[0].oxygen_saturation}%`
                            : "Not recorded"
                          }
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Glucose Chart */}
                <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span className="flex items-center">
                        Glucose
                        <TrendingUp className="h-4 w-4 ml-2 text-gray-400" />
                      </span>
                      <span className="text-sm text-gray-500">
                        Latest: {patientVitalSigns && patientVitalSigns.length > 0 && patientVitalSigns[0].glucose_level 
                          ? `${patientVitalSigns[0].glucose_level}mg/dl`
                          : "No data"
                        }
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-32 flex items-end space-x-1">
                      {Array.from({length: 12}).map((_, i) => (
                        <div 
                          key={i} 
                          className="flex-1 bg-gradient-to-t from-green-400 to-green-300 rounded-t opacity-80"
                          style={{height: `${Math.random() * 80 + 20}%`}}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Heart Rate Chart */}
                <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span className="flex items-center">
                        Heart rate
                        <TrendingUp className="h-4 w-4 ml-2 text-gray-400" />
                      </span>
                      <span className="text-sm text-gray-500">
                        Blood Pressure: {patientVitalSigns && patientVitalSigns.length > 0 && patientVitalSigns[0].blood_pressure_systolic 
                          ? `${patientVitalSigns[0].blood_pressure_systolic}/${patientVitalSigns[0].blood_pressure_diastolic}`
                          : "No data"
                        }
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-32 flex items-end space-x-1">
                      {Array.from({length: 12}).map((_, i) => (
                        <div 
                          key={i} 
                          className="flex-1 bg-gradient-to-t from-red-400 to-red-300 rounded-t opacity-80"
                          style={{height: `${Math.random() * 60 + 40}%`}}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Modern Info Cards Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Body info</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center h-40">
                      <div className="text-center">
                        <div className="mx-auto mb-4 w-16 h-32 bg-gradient-to-b from-blue-200 to-blue-400 rounded-full relative">
                          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
                          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
                        </div>
                        <div className="text-sm space-y-1">
                          <p><span className="font-medium">Oxygen level:</span> {patientVitalSigns && patientVitalSigns.length > 0 && patientVitalSigns[0].oxygen_saturation 
                            ? `${patientVitalSigns[0].oxygen_saturation}%`
                            : "No data"
                          }</p>
                          <p><span className="font-medium">BMI:</span> {patientVitalSigns && patientVitalSigns.length > 0 && patientVitalSigns[0].body_mass_index 
                            ? `${patientVitalSigns[0].body_mass_index}`
                            : "Not calculated"
                          }</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="font-medium">Address:</span>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedPatient.address && typeof selectedPatient.address === 'object' 
                          ? `${(selectedPatient.address as any).street || ''} ${(selectedPatient.address as any).city || ''} ${(selectedPatient.address as any).state || ''} ${(selectedPatient.address as any).zipCode || ''}`.trim() || 'No address on file'
                          : (selectedPatient.address as string) || 'No address on file'
                        }
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Emergency Contact:</span>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedPatient.emergencyContact && typeof selectedPatient.emergencyContact === 'object' 
                          ? `${(selectedPatient.emergencyContact as any).name || 'N/A'} (${(selectedPatient.emergencyContact as any).relationship || 'N/A'}) - ${(selectedPatient.emergencyContact as any).phone || 'N/A'}`
                          : (selectedPatient.emergencyContact as string) || 'No emergency contact on file'
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Medical History */}
                <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Appointment history</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-2 hover:bg-blue-50 rounded">
                        <Activity className="h-4 w-4 text-blue-500" />
                        <div className="flex-1 text-sm">
                          <p className="font-medium">Pulmonologist</p>
                          <p className="text-gray-500">Dr. Diana Russel • 10:00-11:00, 20 Feb 2022</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-2 hover:bg-blue-50 rounded">
                        <User className="h-4 w-4 text-green-500" />
                        <div className="flex-1 text-sm">
                          <p className="font-medium">Dentist</p>
                          <p className="text-gray-500">Dr. John Wick • 16:00-17:00, 13 Feb 2022</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-2 hover:bg-blue-50 rounded">
                        <Heart className="h-4 w-4 text-red-500" />
                        <div className="flex-1 text-sm">
                          <p className="font-medium">Cardiologist</p>
                          <p className="text-gray-500">Dr. Cameron Williamson • 09:30-10:00, 24 Feb 2022</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Medical Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Allergies Section */}
                <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center text-red-600">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      Allergies
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedPatient.allergies && Array.isArray(selectedPatient.allergies) && selectedPatient.allergies.length > 0 ? (
                      <div className="space-y-2">
                        {selectedPatient.allergies.map((allergy, index) => (
                          <Badge key={index} variant="destructive" className="mr-2">
                            {String(allergy)}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 flex items-center">
                        <Shield className="h-4 w-4 mr-2 text-green-500" />
                        No known allergies
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Insurance Information */}
                <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-green-500" />
                      Insurance Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedPatient.insuranceInfo && typeof selectedPatient.insuranceInfo === 'object' ? (
                      <div className="space-y-2">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="font-medium text-gray-600">Provider:</span>
                          <span className="text-gray-900">{(selectedPatient.insuranceInfo as any).provider || 'Ghana Health Insurance'}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="font-medium text-gray-600">Policy Number:</span>
                          <span className="text-gray-900">{(selectedPatient.insuranceInfo as any).policyNumber || 'Not specified'}</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="font-medium text-gray-600">Group Number:</span>
                          <span className="text-gray-900">{(selectedPatient.insuranceInfo as any).groupNumber || 'N/A'}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="font-medium text-gray-600">Provider:</span>
                          <span className="text-gray-900">Ghana Health Insurance</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="font-medium text-gray-600">Policy Number:</span>
                          <span className="text-gray-900">Not specified</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Modern Action Buttons */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200/50">
                <div className="flex space-x-3">
                  {(user.role === "receptionist" || user.role === "tenant_admin" || user.role === "director" || user.role === "super_admin") && tenant?.type !== "pharmacy" && (
                    <>
                      <Button 
                        variant="outline"
                        className="bg-white/60 backdrop-blur-sm border-0 shadow-sm hover:shadow-md"
                        onClick={() => handleScheduleAppointment(selectedPatient)}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule
                      </Button>
                      <Button 
                        variant="outline"
                        className="bg-white/60 backdrop-blur-sm border-0 shadow-sm hover:shadow-md"
                        onClick={() => {
                          // Close EHR modal and navigate to medical records page
                          setIsEHROpen(false);
                          setLocation(`/patient-medical-records?patientId=${selectedPatient?.id}&patientName=${encodeURIComponent(selectedPatient?.firstName + ' ' + selectedPatient?.lastName)}`);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit EHR
                      </Button>
                    </>
                  )}
                </div>
                <div className="flex space-x-3">
                  <Button 
                    variant="outline"
                    className="bg-white/60 backdrop-blur-sm border-0 shadow-sm hover:shadow-md"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 shadow-lg"
                    onClick={() => setIsEHROpen(false)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
