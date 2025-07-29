import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { 
  Calendar,
  MessageCircle,
  FileText,
  Pill,
  Activity,
  User,
  Video,
  Clock,
  Shield,
  Bell,
  Settings,
  Phone,
  Mail,
  LogOut,
  ChevronRight,
  Heart,
  Thermometer,
  Scale,
  Stethoscope,
  BookOpen,
  Search,
  Plus,
  Send,
  ArrowLeft,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Droplets,
  Zap,
  Brain
} from "lucide-react";
import navimedLogo from "@assets/JPG_1753663321927.jpg";

export default function PatientPortal() {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState("overview");
  const [messageForm, setMessageForm] = useState({
    subject: "",
    message: "",
    priority: "normal",
    type: "general_message"
  });
  const [vitalsForm, setVitalsForm] = useState({
    temperature: "",
    systolic: "",
    diastolic: "",
    heartRate: "",
    weight: "",
    notes: ""
  });
  const [goalsForm, setGoalsForm] = useState({
    steps: 10000,
    water: 8,
    sleep: 8,
    exercise: 30,
    weight: 165
  });
  const queryClient = useQueryClient();

  // Fetch patient data
  const { data: patientProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/patient/profile"],
    enabled: !!user && user.role === "patient"
  });

  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ["/api/patient/appointments"],
    enabled: !!user && user.role === "patient"
  });

  const { data: prescriptions, isLoading: prescriptionsLoading } = useQuery({
    queryKey: ["/api/patient/prescriptions"],
    enabled: !!user && user.role === "patient"
  });

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/patient/messages"],
    enabled: !!user && user.role === "patient"
  });

  const { data: healthData, isLoading: healthLoading } = useQuery({
    queryKey: ["/api/patient/health-tracking"],
    enabled: !!user && user.role === "patient"
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      const response = await apiRequest("POST", "/api/patient/messages", messageData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patient/messages"] });
      setMessageForm({ subject: "", message: "", priority: "normal", type: "general_message" });
      setActiveSection("messages");
    },
    onError: (error) => {
      console.error("Send message error:", error);
      alert(`Failed to send message: ${error?.message || 'An error occurred. Please try again.'}`);
    }
  });

  const { data: labResults, isLoading: labResultsLoading } = useQuery({
    queryKey: ["/api/patient/lab-results"],
    enabled: !!user && user.role === "patient"
  });

  if (!user || user.role !== "patient") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">You need to be logged in as a patient to access this portal.</p>
            <Button onClick={() => window.location.href = "/patient-login"}>
              Go to Patient Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const menuItems = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "find-care", label: "Find Care", icon: Search },
    { id: "visits", label: "My Visits", icon: Video },
    { id: "records", label: "My Records", icon: FileText },
    { id: "messages", label: "Messages", icon: MessageCircle },
    { id: "results", label: "Test Results", icon: FileText },
    { id: "medications", label: "Medications", icon: Pill },
    { id: "health", label: "Track Health", icon: Heart },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-2">Welcome back, {user.firstName}!</h2>
        <p className="text-blue-100">Stay on top of your health with your personal dashboard</p>
        {patientProfile && (
          <div className="mt-4 text-sm text-blue-100">
            <p>MRN: {patientProfile.patient.mrn} • Metro General Hospital</p>
          </div>
        )}
      </div>

      {/* Health Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Upcoming Appointments</p>
                <p className="text-2xl font-bold text-green-900">
                  {appointments ? appointments.filter(a => new Date(a.appointmentDate) > new Date()).length : "–"}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Active Prescriptions</p>
                <p className="text-2xl font-bold text-blue-900">
                  {prescriptions ? prescriptions.filter(p => p.status === 'active').length : "–"}
                </p>
              </div>
              <Pill className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800">Pending Results</p>
                <p className="text-2xl font-bold text-purple-900">
                  {labResults ? labResults.filter(l => l.status === 'pending').length : "–"}
                </p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appointments && appointments.length > 0 ? (
              appointments.slice(0, 3).map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between border-l-4 border-blue-500 pl-4 py-2">
                  <div>
                    <p className="font-medium">Appointment</p>
                    <p className="text-sm text-gray-600">
                      {new Date(appointment.appointmentDate).toLocaleDateString()} - {appointment.type}
                    </p>
                  </div>
                  <Badge variant={appointment.status === 'completed' ? 'default' : 'secondary'}>
                    {appointment.status}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No recent appointments</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => setActiveSection("visits")}
            >
              <Video className="h-6 w-6 mb-2" />
              <span className="text-sm">Book Video Visit</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => setActiveSection("find-care")}
            >
              <Calendar className="h-6 w-6 mb-2" />
              <span className="text-sm">Schedule Appointment</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => setActiveSection("messages")}
            >
              <MessageCircle className="h-6 w-6 mb-2" />
              <span className="text-sm">Message Provider</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => setActiveSection("results")}
            >
              <FileText className="h-6 w-6 mb-2" />
              <span className="text-sm">View Results</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Health Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Health Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Heart className="h-4 w-4 text-red-500 mr-2" />
                <span className="text-sm">Blood Pressure</span>
              </div>
              <span className="font-medium">120/80 mmHg</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Thermometer className="h-4 w-4 text-blue-500 mr-2" />
                <span className="text-sm">Temperature</span>
              </div>
              <span className="font-medium">98.6°F</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Scale className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm">Weight</span>
              </div>
              <span className="font-medium">165 lbs</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium">Dr. Smith - Annual Checkup</p>
                  <p className="text-sm text-gray-600">March 15, 2024 at 2:00 PM</p>
                </div>
                <Badge>Confirmed</Badge>
              </div>
              <Button variant="outline" className="w-full" onClick={() => setActiveSection("visits")}>
                Schedule New Appointment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border-l-4 border-blue-500 bg-blue-50">
              <div className="flex items-center">
                <FileText className="h-4 w-4 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium">Lab Results Available</p>
                  <p className="text-sm text-gray-600">Blood work from March 10, 2024</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => setActiveSection("results")}>
                View
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 border-l-4 border-green-500 bg-green-50">
              <div className="flex items-center">
                <Pill className="h-4 w-4 text-green-600 mr-3" />
                <div>
                  <p className="font-medium">Prescription Renewed</p>
                  <p className="text-sm text-gray-600">Lisinopril 10mg refill ready</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => setActiveSection("medications")}>
                View
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderMyRecords = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Medical Records</CardTitle>
          <CardDescription>View your complete medical history and information</CardDescription>
        </CardHeader>
        <CardContent>
          {profileLoading ? (
            <div className="text-center py-8">Loading your medical records...</div>
          ) : patientProfile ? (
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Medical Record Number</p>
                    <p className="font-medium">{patientProfile.patient.mrn}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date of Birth</p>
                    <p className="font-medium">
                      {new Date(patientProfile.patient.dateOfBirth).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Gender</p>
                    <p className="font-medium capitalize">{patientProfile.patient.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{patientProfile.patient.phone}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Medical History */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Medical History</h3>
                {patientProfile.patient.medicalHistory && patientProfile.patient.medicalHistory.length > 0 ? (
                  <div className="space-y-2">
                    {typeof patientProfile.patient.medicalHistory === 'string' ? 
                      patientProfile.patient.medicalHistory.split(',').map((condition, index) => (
                        <Badge key={index} variant="outline" className="mr-2">
                          {condition.trim()}
                        </Badge>
                      )) :
                      patientProfile.patient.medicalHistory.map((condition, index) => (
                        <Badge key={index} variant="outline" className="mr-2">
                          {condition}
                        </Badge>
                      ))
                    }
                  </div>
                ) : (
                  <p className="text-gray-500">No medical history recorded</p>
                )}
              </div>

              <Separator />

              {/* Allergies */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Allergies</h3>
                {patientProfile.patient.allergies && patientProfile.patient.allergies.length > 0 ? (
                  <div className="space-y-2">
                    {patientProfile.patient.allergies.map((allergy, index) => (
                      <Badge key={index} variant="destructive" className="mr-2">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No known allergies</p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">Unable to load medical records</div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderMedications = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Medications</CardTitle>
          <CardDescription>Current and past prescriptions</CardDescription>
        </CardHeader>
        <CardContent>
          {prescriptionsLoading ? (
            <div className="text-center py-8">Loading your medications...</div>
          ) : prescriptions && prescriptions.length > 0 ? (
            <div className="space-y-4">
              {prescriptions.map((prescription) => (
                <div key={prescription.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{prescription.medicationName}</h3>
                      <p className="text-gray-600">
                        {prescription.dosage} • {prescription.frequency}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Prescribed: {new Date(prescription.prescribedDate).toLocaleDateString()}
                      </p>
                      {prescription.expiryDate && (
                        <p className="text-sm text-gray-500">
                          Expires: {new Date(prescription.expiryDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <Badge variant={prescription.status === 'active' ? 'default' : 'secondary'}>
                      {prescription.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Pill className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No medications found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderTestResults = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
          <CardDescription>Laboratory and diagnostic test results</CardDescription>
        </CardHeader>
        <CardContent>
          {labResultsLoading ? (
            <div className="text-center py-8">Loading your test results...</div>
          ) : labResults && labResults.length > 0 ? (
            <div className="space-y-4">
              {labResults.map((labOrder) => (
                <div key={labOrder.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{labOrder.testType}</h3>
                      <p className="text-gray-600">{labOrder.notes || 'No additional notes'}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Ordered: {new Date(labOrder.orderDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={
                      labOrder.status === 'completed' ? 'default' : 
                      labOrder.status === 'pending' ? 'secondary' : 'outline'
                    }>
                      {labOrder.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No test results available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderVisits = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Video Visits & Telemedicine</CardTitle>
          <CardDescription>Schedule and manage your virtual appointments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Video className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Ready for Your Video Visit?</h3>
            <p className="text-gray-600 mb-6">
              Connect with your healthcare providers from the comfort of your home
            </p>
            <Button 
              onClick={() => window.location.href = "/telemedicine-booking"}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Video className="w-4 h-4 mr-2" />
              Schedule Video Visit
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderMessages = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">Messages</h2>
          <p className="text-gray-600">Secure communication with your care team</p>
        </div>
        <Button onClick={() => setActiveSection("compose-message")}>
          <Plus className="w-4 h-4 mr-2" />
          New Message
        </Button>
      </div>

      {messagesLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Loading messages...</span>
            </div>
          </CardContent>
        </Card>
      ) : messages && messages.length > 0 ? (
        <div className="space-y-4">
          {messages.map((message: any) => (
            <Card key={message.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {message.type || 'General'}
                      </Badge>
                      <Badge variant={message.priority === 'urgent' ? 'destructive' : 'secondary'} className="text-xs">
                        {message.priority || 'Normal'}
                      </Badge>
                      {!message.readAt && (
                        <Badge variant="default" className="text-xs">New</Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{message.subject}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {message.message}
                    </p>
                    <div className="flex items-center text-sm text-gray-500 gap-4">
                      <span>From: {message.senderName}</span>
                      <span>{new Date(message.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Messages</h3>
            <p className="text-gray-600 mb-6">
              You have no messages from your care team at this time
            </p>
            <Button onClick={() => setActiveSection("compose-message")}>
              <Plus className="w-4 h-4 mr-2" />
              Send Your First Message
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderFindCare = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Find Care</h2>
        <p className="text-gray-600">Find healthcare providers and services near you</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <Video className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="font-bold mb-2">Video Visits</h3>
            <p className="text-sm text-gray-600 mb-4">Connect with providers from home</p>
            <Button className="w-full" onClick={() => window.location.href = "/telemedicine-booking"}>
              Book Video Visit
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <Stethoscope className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="font-bold mb-2">In-Person Care</h3>
            <p className="text-sm text-gray-600 mb-4">Schedule office visits</p>
            <Button className="w-full" variant="outline" onClick={() => window.location.href = "/doctor-calendar"}>
              Find Providers
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <Phone className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="font-bold mb-2">Urgent Care</h3>
            <p className="text-sm text-gray-600 mb-4">Get care when you need it</p>
            <Button className="w-full" variant="outline">
              Find Urgent Care
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderComposeMessage = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => setActiveSection("messages")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Messages
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Compose Message</h2>
          <p className="text-gray-600">Send a secure message to your care team</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Message</CardTitle>
          <CardDescription>All messages are secure and HIPAA-compliant</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="message-type">Message Type</Label>
              <Select value={messageForm.type} onValueChange={(value) => setMessageForm(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select message type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general_message">General Question</SelectItem>
                  <SelectItem value="prescription_note">Prescription Request</SelectItem>
                  <SelectItem value="appointment_reminder">Appointment Question</SelectItem>
                  <SelectItem value="lab_result">Lab Results Question</SelectItem>
                  <SelectItem value="medical_instruction">Medical Instruction</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={messageForm.priority} onValueChange={(value) => setMessageForm(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input 
              id="subject"
              placeholder="Enter message subject"
              value={messageForm.subject}
              onChange={(e) => setMessageForm(prev => ({ ...prev, subject: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea 
              id="message"
              placeholder="Type your message here..."
              className="min-h-[120px]"
              value={messageForm.message}
              onChange={(e) => setMessageForm(prev => ({ ...prev, message: e.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setActiveSection("messages")}>
              Cancel
            </Button>
            <Button 
              onClick={() => sendMessageMutation.mutate(messageForm)}
              disabled={!messageForm.subject || !messageForm.message || sendMessageMutation.isPending}
            >
              {sendMessageMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderHealthTracking = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Health Tracking</h2>
        <p className="text-gray-600">Monitor your vital signs, track health goals, and view AI-powered health insights</p>
      </div>

      {/* Health Score Card */}
      <Card className="border-l-4 border-l-green-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-3 rounded-full">
                <Heart className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Overall Health Score</h3>
                <p className="text-gray-600">Based on your recent health data</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">85/100</div>
              <p className="text-sm text-gray-500">Excellent</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vital Signs Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Thermometer className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Temperature</p>
                <p className="text-xl font-bold">98.6°F</p>
                <p className="text-xs text-green-600">Normal</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Heart className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Blood Pressure</p>
                <p className="text-xl font-bold">120/80</p>
                <p className="text-xs text-green-600">Normal</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Activity className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Heart Rate</p>
                <p className="text-xl font-bold">72 bpm</p>
                <p className="text-xs text-green-600">Normal</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Scale className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Weight</p>
                <p className="text-xl font-bold">165 lbs</p>
                <p className="text-xs text-green-600">Healthy</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Goals & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-blue-600" />
              Health Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Activity className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Daily Steps</p>
                  <p className="text-sm text-gray-600">Goal: 10,000 steps</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-600">7,485</p>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Droplets className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Water Intake</p>
                  <p className="text-sm text-gray-600">Goal: 8 glasses</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">6/8</p>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Brain className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium">Sleep</p>
                  <p className="text-sm text-gray-600">Goal: 8 hours</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-purple-600">7.5h</p>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '94%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-orange-600" />
              AI Health Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
              <div>
                <p className="font-medium text-green-800">Great Progress!</p>
                <p className="text-sm text-green-600">Your blood pressure has improved significantly this month. Keep up the healthy lifestyle changes.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-1" />
              <div>
                <p className="font-medium text-yellow-800">Recommendation</p>
                <p className="text-sm text-yellow-600">Consider increasing your daily water intake. You're 25% below your hydration goal this week.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600 mt-1" />
              <div>
                <p className="font-medium text-blue-800">Trend Alert</p>
                <p className="text-sm text-blue-600">Your activity levels have increased 15% this month. This is excellent for cardiovascular health!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health History Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Health Trends (Last 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Health trend visualization</p>
              <p className="text-sm text-gray-500">Blood pressure, weight, and activity data over time</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button 
          className="h-16 flex flex-col space-y-2"
          onClick={() => setActiveSection("log-vitals")}
        >
          <Plus className="h-6 w-6" />
          <span>Log Vitals</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-16 flex flex-col space-y-2"
          onClick={() => setActiveSection("set-goals")}
        >
          <Target className="h-6 w-6" />
          <span>Set Goals</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-16 flex flex-col space-y-2"
          onClick={() => setActiveSection("health-report")}
        >
          <FileText className="h-6 w-6" />
          <span>Health Report</span>
        </Button>
      </div>
    </div>
  );

  const renderLogVitals = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => setActiveSection("health")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Health Tracking
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Log Vital Signs</h2>
          <p className="text-gray-600">Record your current vital signs and health measurements</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enter Your Vitals</CardTitle>
          <CardDescription>All measurements are saved securely and shared with your care team</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="temperature">Temperature (°F)</Label>
              <Input 
                id="temperature"
                type="number"
                step="0.1"
                placeholder="98.6"
                value={vitalsForm.temperature}
                onChange={(e) => setVitalsForm(prev => ({ ...prev, temperature: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="systolic">Systolic BP</Label>
              <Input 
                id="systolic"
                type="number"
                placeholder="120"
                value={vitalsForm.systolic}
                onChange={(e) => setVitalsForm(prev => ({ ...prev, systolic: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="diastolic">Diastolic BP</Label>
              <Input 
                id="diastolic"
                type="number"
                placeholder="80"
                value={vitalsForm.diastolic}
                onChange={(e) => setVitalsForm(prev => ({ ...prev, diastolic: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
              <Input 
                id="heartRate"
                type="number"
                placeholder="72"
                value={vitalsForm.heartRate}
                onChange={(e) => setVitalsForm(prev => ({ ...prev, heartRate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="weight">Weight (lbs)</Label>
              <Input 
                id="weight"
                type="number"
                step="0.1"
                placeholder="165.0"
                value={vitalsForm.weight}
                onChange={(e) => setVitalsForm(prev => ({ ...prev, weight: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea 
              id="notes"
              placeholder="Any symptoms, medications taken, or other relevant information..."
              className="min-h-[100px]"
              value={vitalsForm.notes}
              onChange={(e) => setVitalsForm(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setActiveSection("health")}>
              Cancel
            </Button>
            <Button>
              <Heart className="w-4 h-4 mr-2" />
              Save Vitals
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSetGoals = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => setActiveSection("health")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Health Tracking
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Set Health Goals</h2>
          <p className="text-gray-600">Customize your daily and weekly health targets</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-blue-600" />
              Daily Activity Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="steps">Daily Steps Goal</Label>
              <Input 
                id="steps"
                type="number"
                value={goalsForm.steps}
                onChange={(e) => setGoalsForm(prev => ({ ...prev, steps: parseInt(e.target.value) || 0 }))}
              />
              <p className="text-sm text-gray-500 mt-1">Recommended: 8,000-10,000 steps</p>
            </div>
            <div>
              <Label htmlFor="exercise">Exercise Minutes (per day)</Label>
              <Input 
                id="exercise"
                type="number"
                value={goalsForm.exercise}
                onChange={(e) => setGoalsForm(prev => ({ ...prev, exercise: parseInt(e.target.value) || 0 }))}
              />
              <p className="text-sm text-gray-500 mt-1">Recommended: 30-60 minutes</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Droplets className="h-5 w-5 mr-2 text-blue-600" />
              Wellness Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="water">Daily Water Intake (glasses)</Label>
              <Input 
                id="water"
                type="number"
                value={goalsForm.water}
                onChange={(e) => setGoalsForm(prev => ({ ...prev, water: parseInt(e.target.value) || 0 }))}
              />
              <p className="text-sm text-gray-500 mt-1">Recommended: 8 glasses (64 oz)</p>
            </div>
            <div>
              <Label htmlFor="sleep">Sleep Hours (per night)</Label>
              <Input 
                id="sleep"
                type="number"
                step="0.5"
                value={goalsForm.sleep}
                onChange={(e) => setGoalsForm(prev => ({ ...prev, sleep: parseFloat(e.target.value) || 0 }))}
              />
              <p className="text-sm text-gray-500 mt-1">Recommended: 7-9 hours</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Scale className="h-5 w-5 mr-2 text-purple-600" />
              Weight Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="targetWeight">Target Weight (lbs)</Label>
              <Input 
                id="targetWeight"
                type="number"
                step="0.1"
                value={goalsForm.weight}
                onChange={(e) => setGoalsForm(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
              />
              <p className="text-sm text-gray-500 mt-1">Set a healthy, realistic target</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Goal Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Daily Steps:</span>
                <span className="font-medium">{goalsForm.steps.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Daily Exercise:</span>
                <span className="font-medium">{goalsForm.exercise} minutes</span>
              </div>
              <div className="flex justify-between">
                <span>Daily Water:</span>
                <span className="font-medium">{goalsForm.water} glasses</span>
              </div>
              <div className="flex justify-between">
                <span>Sleep Target:</span>
                <span className="font-medium">{goalsForm.sleep} hours</span>
              </div>
              <div className="flex justify-between">
                <span>Target Weight:</span>
                <span className="font-medium">{goalsForm.weight} lbs</span>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <Button variant="outline" onClick={() => setActiveSection("health")}>
                Cancel
              </Button>
              <Button>
                <Target className="w-4 h-4 mr-2" />
                Save Goals
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderHealthReport = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => setActiveSection("health")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Health Tracking
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Health Report</h2>
          <p className="text-gray-600">Comprehensive overview of your health data and progress</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              30-Day Health Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">85/100</div>
                  <div className="text-sm text-green-600">Overall Health Score</div>
                  <div className="text-xs text-gray-500">↑ 5 points from last month</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">92%</div>
                  <div className="text-sm text-blue-600">Goal Achievement</div>
                  <div className="text-xs text-gray-500">↑ 8% from last month</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Key Achievements</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Maintained healthy blood pressure for 28 days</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Achieved step goal 24 out of 30 days</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Improved sleep quality by 15%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Areas for Improvement</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">Water intake below target on 12 days</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">Exercise frequency could be more consistent</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Download PDF Report
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Mail className="w-4 h-4 mr-2" />
              Email to Doctor
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Check-up
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Target className="w-4 h-4 mr-2" />
              Update Goals
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-lg font-bold">98.4°F</div>
              <div className="text-sm text-gray-600">Avg Temperature</div>
              <div className="text-xs text-green-600">Normal range</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-lg font-bold">118/78</div>
              <div className="text-sm text-gray-600">Avg Blood Pressure</div>
              <div className="text-xs text-green-600">Excellent</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-lg font-bold">74 bpm</div>
              <div className="text-sm text-gray-600">Avg Heart Rate</div>
              <div className="text-xs text-green-600">Good fitness</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-lg font-bold">164.8 lbs</div>
              <div className="text-sm text-gray-600">Avg Weight</div>
              <div className="text-xs text-blue-600">Stable</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return renderOverview();
      case "find-care":
        return renderFindCare();
      case "visits":
        return renderVisits();
      case "records":
        return renderMyRecords();
      case "messages":
        return renderMessages();
      case "compose-message":
        return renderComposeMessage();
      case "results":
        return renderTestResults();
      case "medications":
        return renderMedications();
      case "health":
        return renderHealthTracking();
      case "log-vitals":
        return renderLogVitals();
      case "set-goals":
        return renderSetGoals();
      case "health-report":
        return renderHealthReport();
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
              <img src={navimedLogo} alt="NaviMed" className="h-8 w-8 rounded object-contain" />
              <div>
                <h1 className="text-lg font-bold text-blue-600">NAVIMED</h1>
                <p className="text-xs text-gray-500">Patient Portal</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Bell className="h-5 w-5 text-gray-400" />
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium">{user.firstName} {user.lastName}</span>
              </div>
              <Button size="sm" variant="outline" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Navigation</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                          activeSection === item.id ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700" : "text-gray-700"
                        }`}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        <span className="font-medium">{item.label}</span>
                        <ChevronRight className="h-4 w-4 ml-auto" />
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>

            {/* Support Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-sm">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-blue-600" />
                  <span>(314) 472-3839</span>
                </div>
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-blue-600" />
                  <span>support@navimed.com</span>
                </div>
                <p className="text-xs text-gray-500">
                  Available Mon-Fri, 8 AM - 6 PM
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  );
}