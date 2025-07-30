import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  Calendar,
  MessageCircle,
  FileText,
  Pill,
  Activity,
  User,
  Users,
  Video,
  Clock,
  Shield,
  Bell,
  Settings,
  Phone,
  Mail,
  ChevronRight,
  Heart,
  Thermometer,
  Scale,
  Stethoscope,
  BookOpen,
  Search,
  Plus,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Droplets,
  Zap,
  Brain,
  Download,
  ArrowLeft
} from "lucide-react";
import navimedLogo from "@assets/JPG_1753663321927.jpg";

export default function PatientPortalStaff() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("overview");
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch patients list for selection
  const { data: patients = [] } = useQuery({
    queryKey: ['/api/patients'],
    enabled: true
  });

  // Fetch selected patient's data
  const { data: selectedPatient } = useQuery({
    queryKey: ['/api/patients', selectedPatientId],
    enabled: !!selectedPatientId
  });

  // Fetch patient's appointments using correct endpoint
  const { data: patientAppointments = [] } = useQuery({
    queryKey: ['/api/appointments/patient', selectedPatientId],
    enabled: !!selectedPatientId
  });

  // Fetch patient's lab results using cross-tenant endpoint (allows doctors to view)
  const { data: patientLabResults = [] } = useQuery({
    queryKey: ['/api/patients', selectedPatientId, 'lab-results', 'all'],
    enabled: !!selectedPatientId
  });

  // Fetch patient's prescriptions using correct endpoint
  const { data: patientPrescriptions = [] } = useQuery({
    queryKey: ['/api/prescriptions/patient', selectedPatientId],
    enabled: !!selectedPatientId
  });

  // Use the same selectedPatient data for medical history (avoid duplicate API calls)
  const patientMedicalHistory = selectedPatient;

  // Combine prescriptions and medical history medications
  const allMedications = [
    // Current prescriptions
    ...(patientPrescriptions || []).map((presc: any) => ({
      id: `presc-${presc.id}`,
      name: presc.medicationName,
      dosage: presc.dosage,
      frequency: presc.frequency,
      prescribedBy: presc.doctorName || "Healthcare Provider",
      prescribedDate: presc.prescribedDate,
      instructions: presc.instructions,
      status: presc.status || "active",
      source: "prescription",
      isActive: presc.status === "active" || !presc.status
    })),
    // Medical history medications
    ...(patientMedicalHistory?.medications || []).map((med: any, index: number) => ({
      id: `med-${index}`,
      name: med.medication || med.name || med,
      dosage: med.dosage || "As prescribed",
      frequency: med.frequency || "As directed",
      prescribedBy: "Previous Provider",
      prescribedDate: null,
      instructions: med.instructions || "Continue as prescribed",
      status: "ongoing",
      source: "medical_history",
      isActive: true
    }))
  ];

  // Remove duplicates based on medication name
  const uniqueMedications = allMedications.filter((med, index, arr) => 
    arr.findIndex(m => m.name.toLowerCase() === med.name.toLowerCase()) === index
  );

  // Filter patients based on search
  const filteredPatients = patients.filter((patient: any) =>
    patient?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient?.mrn?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get current patient data (real or mock)
  const currentPatient = selectedPatient || {
    firstName: "Sarah",
    lastName: "Johnson",
    mrn: "MGH-20250001",
    dateOfBirth: "1985-06-15"
  };

  const patientName = `${currentPatient.firstName} ${currentPatient.lastName}`;

  const renderPatientSelector = () => (
    <Card className="border-green-200 bg-green-50 mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Users className="h-5 w-5 text-green-600 mr-2" />
            <CardTitle className="text-green-900 text-lg">Patient Selection</CardTitle>
          </div>
          <Badge variant="outline" className="bg-white text-green-700">
            Staff View ({user?.role})
          </Badge>
        </div>
        <CardDescription className="text-green-700">
          Select a patient to view their portal experience. This shows exactly what the selected patient sees when they log in.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-green-900 mb-2 block">Search Patients</label>
              <Input
                placeholder="Search by name or MRN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-green-200 focus:border-green-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-green-900 mb-2 block">Select Patient</label>
              <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                <SelectTrigger className="border-green-200 focus:border-green-400">
                  <SelectValue placeholder="Choose a patient..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredPatients.map((patient: any) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName} (MRN: {patient.mrn})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {selectedPatientId && (
            <div className="p-3 bg-white rounded-lg border border-green-200">
              <p className="text-sm font-medium text-green-900">
                Currently viewing portal for: <span className="text-green-700">{patientName}</span>
              </p>
              <p className="text-xs text-green-600 mt-1">
                MRN: {currentPatient.mrn} • DOB: {currentPatient.dateOfBirth}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {renderPatientSelector()}

      {selectedPatientId ? (
        <>
          {/* Welcome Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-6 w-6 mr-2 text-blue-600" />
                Welcome, {patientName}
              </CardTitle>
              <CardDescription>
                Last login: Today at 2:30 PM • MRN: {currentPatient.mrn}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Appointments</p>
                    <p className="text-sm text-gray-600">{patientAppointments?.length || 0} scheduled</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Lab Results</p>
                    <p className="text-sm text-gray-600">{patientLabResults?.length || 0} results</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Pill className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium">Prescriptions</p>
                    <p className="text-sm text-gray-600">{patientPrescriptions?.length || 0} active</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Patient Selected</h3>
            <p className="text-gray-600 mb-4">
              Please select a patient from the dropdown above to view their portal experience.
            </p>
            <p className="text-sm text-gray-500">
              This will show you exactly what the patient sees when they log into their portal.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button 
          variant="outline" 
          className="h-20 flex-col space-y-2"
          onClick={() => setActiveSection("appointments")}
        >
          <Calendar className="h-6 w-6 text-blue-600" />
          <span>My Appointments</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-20 flex-col space-y-2"
          onClick={() => setActiveSection("results")}
        >
          <FileText className="h-6 w-6 text-green-600" />
          <span>Test Results</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-20 flex-col space-y-2"
          onClick={() => setActiveSection("medications")}
        >
          <Pill className="h-6 w-6 text-orange-600" />
          <span>Medications</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-20 flex-col space-y-2"
          onClick={() => setActiveSection("messages")}
        >
          <MessageCircle className="h-6 w-6 text-purple-600" />
          <span>Messages</span>
        </Button>
      </div>

      {/* Health Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2 text-red-600" />
            Health Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Heart className="h-8 w-8 mx-auto text-red-500 mb-2" />
              <p className="text-2xl font-bold">72</p>
              <p className="text-sm text-gray-600">Heart Rate (bpm)</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Thermometer className="h-8 w-8 mx-auto text-blue-500 mb-2" />
              <p className="text-2xl font-bold">98.6°F</p>
              <p className="text-sm text-gray-600">Temperature</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Scale className="h-8 w-8 mx-auto text-green-500 mb-2" />
              <p className="text-2xl font-bold">165</p>
              <p className="text-sm text-gray-600">Weight (lbs)</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Stethoscope className="h-8 w-8 mx-auto text-purple-500 mb-2" />
              <p className="text-2xl font-bold">120/80</p>
              <p className="text-sm text-gray-600">Blood Pressure</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAppointments = () => (
    <div className="space-y-4">
      {renderPatientSelector()}
      
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">My Appointments</h3>
        <Button disabled={!selectedPatientId}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule New
        </Button>
      </div>
      
      {selectedPatientId && patientAppointments?.length > 0 ? (
        patientAppointments.map((appointment: any) => (
          <Card key={appointment.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{appointment.type || "Medical Appointment"}</h4>
                  <p className="text-sm text-gray-600">
                    {appointment.doctor_first_name && appointment.doctor_last_name 
                      ? `Dr. ${appointment.doctor_first_name} ${appointment.doctor_last_name}`
                      : appointment.doctorName || "Healthcare Provider"}
                  </p>
                  <p className="text-sm text-gray-600">{appointment.chief_complaint || appointment.notes || "General Medical Consultation"}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{new Date(appointment.appointment_date || appointment.appointmentDate).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600">{appointment.appointment_date ? new Date(appointment.appointment_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : appointment.appointmentTime}</p>
                  <Badge variant="outline" className="mt-1">
                    {appointment.status === "confirmed" ? "Confirmed" : appointment.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : selectedPatientId ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No Appointments</h4>
            <p className="text-gray-600">This patient has no scheduled appointments.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Select a Patient</h4>
            <p className="text-gray-600">Choose a patient to view their appointments.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderResults = () => (
    <div className="space-y-4">
      {renderPatientSelector()}
      
      <h3 className="text-lg font-semibold">Test Results</h3>
      
      {selectedPatientId && patientLabResults?.length > 0 ? (
        patientLabResults.map((result: any) => (
          <Card key={result.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{result.testName}</h4>
                  <p className="text-sm text-gray-600">
                    Completed on {result.completedAt ? new Date(result.completedAt).toLocaleDateString() : "Processing"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Laboratory: {result.laboratoryName || "Unknown Laboratory"}
                  </p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Result:</span> {result.result} {result.unit}
                      {result.normalRange && ` (Normal: ${result.normalRange})`}
                    </p>
                    {result.notes && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Notes:</span> {result.notes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <Badge 
                    variant={result.abnormalFlag === "normal" ? "default" : "destructive"}
                    className={result.abnormalFlag === "normal" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                  >
                    {result.abnormalFlag === "normal" ? "Normal" : 
                     result.abnormalFlag === "high" ? "High" :
                     result.abnormalFlag === "low" ? "Low" :
                     result.abnormalFlag === "critical" ? "Critical" : "Complete"}
                  </Badge>
                  <div className="mt-2">
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : selectedPatientId ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No Test Results</h4>
            <p className="text-gray-600">This patient has no lab results available.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Select a Patient</h4>
            <p className="text-gray-600">Choose a patient to view their test results.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderMedications = () => (
    <div className="space-y-4">
      {renderPatientSelector()}
      
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Medications & Medical History</h3>
        <Badge variant="outline" className="text-xs">
          {uniqueMedications.filter(m => m.isActive).length} Active • {uniqueMedications.length} Total
        </Badge>
      </div>
      
      {selectedPatientId && uniqueMedications?.length > 0 ? (
        <div className="space-y-3">
          {/* Active Medications Section */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
              <Pill className="h-4 w-4 mr-2 text-green-600" />
              Current Medications ({uniqueMedications.filter(m => m.isActive).length})
            </h4>
            {uniqueMedications.filter(m => m.isActive).map((medication: any) => (
              <Card key={medication.id} className="mb-3">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-semibold">{medication.name}</h5>
                      <p className="text-sm text-gray-600">
                        {medication.dosage} - {medication.frequency}
                      </p>
                      <p className="text-sm text-gray-500">
                        Prescribed by {medication.prescribedBy}
                      </p>
                      {medication.prescribedDate && (
                        <p className="text-sm text-gray-500">
                          Prescribed on {new Date(medication.prescribedDate).toLocaleDateString()}
                        </p>
                      )}
                      {medication.instructions && (
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Instructions:</span> {medication.instructions}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant="outline" 
                        className={
                          medication.status === "active" || medication.status === "ongoing" ? "bg-green-100 text-green-800" : 
                          medication.status === "pending" ? "bg-yellow-100 text-yellow-800" : 
                          "bg-gray-100 text-gray-600"
                        }
                      >
                        {medication.status === "ongoing" ? "Ongoing" : medication.status || "Active"}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1 capitalize">
                        {medication.source === "prescription" ? "Prescription" : "Medical History"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Past/Discontinued Medications if any */}
          {uniqueMedications.filter(m => !m.isActive).length > 0 && (
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                Past Medications ({uniqueMedications.filter(m => !m.isActive).length})
              </h4>
              {uniqueMedications.filter(m => !m.isActive).map((medication: any) => (
                <Card key={medication.id} className="mb-3 opacity-75">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-semibold text-gray-700">{medication.name}</h5>
                        <p className="text-sm text-gray-500">
                          {medication.dosage} - {medication.frequency}
                        </p>
                        <p className="text-sm text-gray-400">
                          Prescribed by {medication.prescribedBy}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-gray-100 text-gray-600">
                        Discontinued
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : selectedPatientId ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Pill className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No Medications</h4>
            <p className="text-gray-600">This patient has no current prescriptions.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Select a Patient</h4>
            <p className="text-gray-600">Choose a patient to view their medications.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderMessages = () => (
    <div className="space-y-4">
      {renderPatientSelector()}
      
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Messages</h3>
        <Button disabled={!selectedPatientId}>
          <Plus className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>
      
      {selectedPatientId ? (
        <>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">Dr. Michael Smith</h4>
                      <p className="text-sm text-gray-600">Lab Results Available</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">2 hours ago</p>
                      <Badge className="bg-blue-100 text-blue-800">New</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mt-2">
                    Dear {patientName}, your recent blood work results are now available. 
                    Overall results look good. Please schedule a follow-up appointment to discuss.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">Nurse Davis</h4>
                      <p className="text-sm text-gray-600">Appointment Reminder</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">1 day ago</p>
                      <Badge variant="outline">Read</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mt-2">
                    Reminder: You have upcoming appointments scheduled. Please arrive 15 minutes early for check-in.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Select a Patient</h4>
            <p className="text-gray-600">Choose a patient to view their messages.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case "appointments":
        return renderAppointments();
      case "results":
        return renderResults();
      case "medications":
        return renderMedications();
      case "messages":
        return renderMessages();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img src={navimedLogo} alt="NaviMed" className="h-8 w-8 rounded-lg object-contain" />
              <div>
                <h1 className="text-lg font-bold text-blue-600">NAVIMED</h1>
                <p className="text-xs text-gray-500">Patient Portal</p>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex space-x-6">
              <button
                onClick={() => setActiveSection("overview")}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeSection === "overview" 
                    ? "bg-blue-100 text-blue-700" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveSection("appointments")}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeSection === "appointments" 
                    ? "bg-blue-100 text-blue-700" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Appointments
              </button>
              <button
                onClick={() => setActiveSection("results")}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeSection === "results" 
                    ? "bg-blue-100 text-blue-700" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Results
              </button>
              <button
                onClick={() => setActiveSection("medications")}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeSection === "medications" 
                    ? "bg-blue-100 text-blue-700" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Medications
              </button>
              <button
                onClick={() => setActiveSection("messages")}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeSection === "messages" 
                    ? "bg-blue-100 text-blue-700" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Messages
              </button>
            </nav>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium">{selectedPatientId ? patientName : "No Patient Selected"}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderSectionContent()}
      </main>
    </div>
  );
}