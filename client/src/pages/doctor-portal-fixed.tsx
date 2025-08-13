import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { UnifiedAppointments, type UnifiedAppointment } from "@/lib/unified-appointments";
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Eye,
  UserCheck
} from 'lucide-react';
import navimedLogo from "@assets/navimed-logo.jpg";

// EXACT Metro General Hospital doctors from database (matching names exactly)
const DEMO_DOCTORS = [
  {
    id: "9049628e-cd05-4bd6-b08e-ee923c6dec10",
    firstName: "Dr. David",
    lastName: "Brown",
    specialization: "Internal Medicine",
    email: "dr.brown@metrogeneral.com",
    phone: "(555) 101-2001",
    password: "doctor123",
    availability: ["Monday", "Wednesday", "Friday"]
  },
  {
    id: "2cd7fc68-02a0-4924-b564-0dd1bd7b247b",
    firstName: "Lisa",
    lastName: "Chen",
    specialization: "Family Medicine", 
    email: "dr.chen@metrogeneral.com",
    phone: "(555) 101-2002",
    password: "doctor123",
    availability: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  },
  {
    id: "49591cfd-ddb0-478c-aae9-b307ac138999",
    firstName: "Dr. Carlos",
    lastName: "Garcia",
    specialization: "Orthopedics", 
    email: "dr.garcia@metrogeneral.com",
    phone: "(555) 101-2003",
    password: "doctor123",
    availability: ["Tuesday", "Thursday"]
  },
  {
    id: "720deedd-e634-4fc2-9f52-57b6bd7f52d9", 
    firstName: "Dr. Sarah",
    lastName: "Johnson",
    specialization: "Cardiology",
    email: "dr.johnson@metrogeneral.com",
    phone: "(555) 101-2004",
    password: "doctor123",
    availability: ["Tuesday", "Thursday", "Saturday"]
  },
  {
    id: "93452ac4-f87e-4227-90f8-df124fe20cb9",
    firstName: "Sofia",
    lastName: "Martinez",
    specialization: "Family Medicine", 
    email: "dr.martinez@metrogeneral.com",
    phone: "(555) 101-2005",
    password: "doctor123",
    availability: ["Monday", "Wednesday", "Friday"]
  },
  {
    id: "e7d43e79-4dbf-4114-9065-eea501d6b380",
    firstName: "Raj",
    lastName: "Patel",
    specialization: "Internal Medicine", 
    email: "dr.patel@metrogeneral.com",
    phone: "(555) 101-2006",
    password: "doctor123",
    availability: ["Monday", "Tuesday", "Thursday"]
  },
  {
    id: "5fe10688-b38e-458e-b38b-bf8a2507b19a",
    firstName: "Dr. Michael",
    lastName: "Smith",
    specialization: "Emergency Medicine", 
    email: "dr.smith@metrogeneral.com",
    phone: "(555) 101-2007",
    password: "doctor123",
    availability: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  },
  {
    id: "0c6ed45a-13ff-4806-8c8e-b59c699e3d03",
    firstName: "James",
    lastName: "Williams",
    specialization: "Internal Medicine",
    email: "dr.williams@metrogeneral.com",
    phone: "(555) 101-2008",
    password: "doctor123",
    availability: ["Monday", "Wednesday", "Friday"]
  },
  {
    id: "e6236087-ce86-4c24-9553-9fb8d6b7b960",
    firstName: "Dr. Emily",
    lastName: "Wilson",
    specialization: "Pediatrics", 
    email: "dr.wilson@metrogeneral.com",
    phone: "(555) 101-2009",
    password: "doctor123",
    availability: ["Monday", "Wednesday", "Friday"]
  }
];

// Demo patients - matching patient portal data
const DEMO_PATIENTS = {
  "patient-1": {
    id: "patient-1",
    firstName: "Michael",
    lastName: "Johnson",
    email: "michael.johnson@email.com",
    phone: "(555) 123-4567",
    dateOfBirth: "1985-03-15"
  },
  "patient-2": {
    id: "patient-2", 
    firstName: "Sarah",
    lastName: "Williams",
    email: "sarah.williams@email.com",
    phone: "(555) 234-5678",
    dateOfBirth: "1990-07-22"
  },
  "patient-3": {
    id: "patient-3",
    firstName: "Robert",
    lastName: "Davis",
    email: "robert.davis@email.com", 
    phone: "(555) 345-6789",
    dateOfBirth: "1978-11-08"
  },
  "patient-4": {
    id: "patient-4",
    firstName: "Emily",
    lastName: "Brown", 
    email: "emily.brown@email.com",
    phone: "(555) 456-7890",
    dateOfBirth: "1992-04-18"
  },
  "patient-5": {
    id: "patient-5",
    firstName: "James",
    lastName: "Wilson",
    email: "james.wilson@email.com",
    phone: "(555) 567-8901", 
    dateOfBirth: "1980-09-12"
  }
};

// Convert to array for easier use - Sarah Williams should appear for all doctors
const PATIENTS_ARRAY = Object.values(DEMO_PATIENTS);

export default function DoctorPortalFixed() {
  const { toast } = useToast();
  const [loggedInDoctor, setLoggedInDoctor] = useState<typeof DEMO_DOCTORS[0] | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [activeTab, setActiveTab] = useState("appointments");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [appointmentType, setAppointmentType] = useState("");
  const [appointmentReason, setAppointmentReason] = useState("");
  const [appointmentPriority, setAppointmentPriority] = useState("normal");
  // Get appointments from sync system with real-time updates
  const [refreshKey, setRefreshKey] = useState(0);
  const [appointments, setAppointments] = useState<any[]>([]);
  
  useEffect(() => {
    const loadAppointments = () => {
      console.log("🔄 Loading doctor appointments...");
      const allAppointments = UnifiedAppointments.getAppointments();
      setAppointments(allAppointments);
    };
    
    loadAppointments();
    
    // Listen for appointment events
    const handleAppointmentAdded = () => {
      console.log("🔔 New appointment detected!");
      loadAppointments();
    };
    
    window.addEventListener('appointmentAdded', handleAppointmentAdded);
    
    // Refresh every 2 seconds as backup
    const interval = setInterval(loadAppointments, 2000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('appointmentAdded', handleAppointmentAdded);
    };
  }, [refreshKey]);

  const handleLogin = () => {
    // Map username to doctor ID for login
    const usernameToId: { [key: string]: string } = {
      "dr.smith": "5fe10688-b38e-458e-b38b-bf8a2507b19a",
      "dr.brown": "9049628e-cd05-4bd6-b08e-ee923c6dec10", 
      "dr.chen": "2cd7fc68-02a0-4924-b564-0dd1bd7b247b",
      "dr.garcia": "49591cfd-ddb0-478c-aae9-b307ac138999",
      "dr.johnson": "720deedd-e634-4fc2-9f52-57b6bd7f52d9",
      "dr.martinez": "93452ac4-f87e-4227-90f8-df124fe20cb9",
      "dr.patel": "e7d43e79-4dbf-4114-9065-eea501d6b380",
      "dr.williams": "0c6ed45a-13ff-4806-8c8e-b59c699e3d03",
      "dr.wilson": "e6236087-ce86-4c24-9553-9fb8d6b7b960"
    };
    
    const doctorId = usernameToId[loginEmail.toLowerCase()];
    const doctor = DEMO_DOCTORS.find(d => d.id === doctorId && d.password === loginPassword);
    
    if (doctor) {
      console.log(`✅ Doctor login successful: ${doctor.firstName} ${doctor.lastName} (ID: ${doctor.id})`);
      setLoggedInDoctor(doctor);
      toast({
        title: "Login Successful",
        description: `Welcome back, ${doctor.firstName} ${doctor.lastName}!`,
      });
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid username or password. Try dr.smith with password doctor123",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    setLoggedInDoctor(null);
    setLoginEmail("");
    setLoginPassword("");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const updateAppointmentStatus = (appointmentId: string, newStatus: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no-show') => {
    const success = UnifiedAppointments.updateAppointmentStatus(appointmentId, newStatus);
    if (success) {
      // Refresh appointments display
      const allAppointments = UnifiedAppointments.getAppointments();
      setAppointments(allAppointments);
    }
    // For now, just show success - we'll implement status updates later
    toast({
      title: "Status Updated",
      description: `Appointment status changed to ${newStatus}`,
    });
    setRefreshKey(prev => prev + 1);
  };

  const handleBookAppointmentForPatient = () => {
    if (!selectedPatientId || !appointmentDate || !appointmentTime || !appointmentType || !appointmentReason) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const selectedPatient = PATIENTS_ARRAY.find(p => p.id === selectedPatientId);
    if (!selectedPatient || !loggedInDoctor) return;

    const appointmentId = UnifiedAppointments.createAppointment({
      patientId: selectedPatientId,
      patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
      patientEmail: selectedPatient.email,
      patientPhone: selectedPatient.phone,
      doctorId: loggedInDoctor.id,
      doctorName: `${loggedInDoctor.firstName} ${loggedInDoctor.lastName}`,
      doctorSpecialization: loggedInDoctor.specialization,
      date: appointmentDate,
      time: appointmentTime,
      type: appointmentType,
      reason: appointmentReason,
      status: "scheduled",
      createdBy: "doctor",
      createdById: loggedInDoctor.id
    });

    console.log("=== DOCTOR SCHEDULING FOR PATIENT ===");
    console.log("Appointment ID:", appointmentId);
    console.log("Doctor scheduling:", loggedInDoctor.firstName, loggedInDoctor.lastName);
    console.log("For patient:", selectedPatient.firstName, selectedPatient.lastName);
    console.log("Date/Time:", appointmentDate, appointmentTime);
    console.log("Type:", appointmentType, "| Reason:", appointmentReason);

    // Refresh appointments immediately
    const allAppointments = UnifiedAppointments.getAppointments();
    setAppointments(allAppointments);
    setRefreshKey(prev => prev + 1);

    toast({
      title: "Patient Scheduled",
      description: `${selectedPatient.firstName} ${selectedPatient.lastName} scheduled for ${new Date(appointmentDate + 'T' + appointmentTime).toLocaleDateString()} at ${new Date(appointmentDate + 'T' + appointmentTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
    });

    // Reset form
    setIsBookingModalOpen(false);
    setSelectedPatientId("");
    setAppointmentDate("");
    setAppointmentTime("");
    setAppointmentType("");
    setAppointmentReason("");
    setAppointmentPriority("normal");
  };

  // Login screen
  if (!loggedInDoctor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <Card>
            <CardHeader className="text-center">
              <img src={navimedLogo} alt="NaviMED" className="mx-auto mb-4 h-16 w-auto" />
              <CardTitle className="text-2xl">Doctor Portal Login</CardTitle>
              <CardDescription>Metro General Hospital</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Username</Label>
                  <Input
                    id="email"
                    type="text"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="dr.smith"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter password"
                  />
                </div>
                <Button onClick={handleLogin} className="w-full">
                  Login
                </Button>
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Demo Credentials:</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Lisa Chen (Family Medicine):</strong><br />
                  Username: dr.chen<br />
                  Password: doctor123</p>
                  
                  <p><strong>Dr. David Brown (Internal Medicine):</strong><br />
                  Username: dr.brown<br />
                  Password: doctor123</p>
                  
                  <p><strong>Dr. Sarah Johnson (Cardiology):</strong><br />
                  Username: dr.johnson<br />
                  Password: doctor123</p>
                  
                  <p><strong>Dr. Michael Smith (Emergency Medicine):</strong><br />
                  Username: dr.smith<br />
                  Password: doctor123</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Get appointments for logged in doctor
  console.log("=== DOCTOR PORTAL DEBUG ===");
  console.log("👨‍⚕️ Logged in doctor ID:", loggedInDoctor.id);
  console.log("📋 All appointments:", appointments);
  console.log("💾 localStorage content:", localStorage.getItem('nav_appointments'));
  
  // Filter appointments by doctorId using unified system
  const doctorAppointments = UnifiedAppointments.getDoctorAppointments(loggedInDoctor.id);
  console.log("🎯 Doctor appointments filtered:", doctorAppointments);
  
  const todayAppointments = doctorAppointments.filter((appt: any) => {
    const apptDate = new Date(appt.date + 'T' + appt.time);
    const today = new Date();
    return apptDate.toDateString() === today.toDateString();
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={navimedLogo} alt="NaviMED" className="h-10 w-auto" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Metro General Hospital</h1>
                <p className="text-sm text-gray-600">Doctor Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold">{loggedInDoctor.firstName} {loggedInDoctor.lastName}</p>
                <p className="text-sm text-gray-600">{loggedInDoctor.specialization}</p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Stats */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{todayAppointments.length}</p>
                  <p className="text-sm text-gray-600">Today's Appointments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Stethoscope className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{doctorAppointments.length}</p>
                  <p className="text-sm text-gray-600">Total Appointments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <UserCheck className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {doctorAppointments.filter(a => a.status === 'confirmed').length}
                  </p>
                  <p className="text-sm text-gray-600">Confirmed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {doctorAppointments.filter(a => a.status === 'scheduled').length}
                  </p>
                  <p className="text-sm text-gray-600">Scheduled</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="profile">My Profile</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Patient Appointments</h2>
              <div className="flex items-center gap-3">
                <Button onClick={() => setIsBookingModalOpen(true)} className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule Patient
                </Button>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {doctorAppointments.length} Total
                </Badge>
              </div>
            </div>

            <div className="grid gap-4">
              {doctorAppointments.map((appointment: any) => {
                return (
                  <Card key={appointment.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-blue-500" />
                            <div>
                              <h3 className="font-semibold text-lg">
                                {appointment.patientName}
                              </h3>
                              <p className="text-sm text-gray-600">Patient ID: {appointment.patientId}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span>
                                  {new Date(appointment.date + 'T' + appointment.time).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span>
                                  {new Date(appointment.date + 'T' + appointment.time).toLocaleTimeString([], {
                                    hour: '2-digit', 
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-gray-500" />
                                <span>{appointment.patientName}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-gray-500" />
                                <span>Patient ID: {appointment.patientId}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm font-medium mb-1">Appointment Details:</p>
                            <p className="text-sm"><strong>Type:</strong> {appointment.type}</p>
                            <p className="text-sm"><strong>Reason:</strong> {appointment.reason}</p>
                            <p className="text-sm">
                              <strong>Booked:</strong> {new Date(appointment.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right space-y-3">
                          <div className="flex flex-col gap-2">
                            <Badge 
                              variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}
                            >
                              {appointment.status}
                            </Badge>
                            <Badge variant="outline">
                              {appointment.status} status
                            </Badge>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            {appointment.status !== 'confirmed' && (
                              <Button 
                                size="sm" 
                                onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                                className="flex items-center gap-1"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Confirm
                              </Button>
                            )}
                            
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="flex items-center gap-1"
                              onClick={() => toast({
                                title: "Appointment Details",
                                description: `Viewing details for ${appointment.patientName}`,
                              })}
                            >
                              <Eye className="h-4 w-4" />
                              View Details
                            </Button>
                            
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                              className="flex items-center gap-1"
                            >
                              <XCircle className="h-4 w-4" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {doctorAppointments.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No Appointments</h3>
                    <p className="text-gray-500">
                      You don't have any appointments scheduled yet.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Doctor Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Name</Label>
                    <p className="text-lg">{loggedInDoctor.firstName} {loggedInDoctor.lastName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Specialization</Label>
                    <p className="text-lg">{loggedInDoctor.specialization}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-lg">{loggedInDoctor.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Phone</Label>
                    <p className="text-lg">{loggedInDoctor.phone}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Availability</Label>
                  <div className="flex gap-2 mt-1">
                    {loggedInDoctor.availability.map((day) => (
                      <Badge key={day} variant="outline">{day}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Schedule</CardTitle>
                <CardDescription>
                  Your availability for appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                    <div key={day} className="flex justify-between items-center p-3 border rounded-lg">
                      <span className="font-medium">{day}</span>
                      <Badge 
                        variant={loggedInDoctor.availability.includes(day) ? "default" : "secondary"}
                      >
                        {loggedInDoctor.availability.includes(day) ? "Available" : "Off"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Book Appointment Modal */}
      <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Patient Appointment</DialogTitle>
            <p className="text-sm text-gray-600">
              Doctor: {loggedInDoctor.firstName} {loggedInDoctor.lastName} ({loggedInDoctor.specialization})
            </p>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="patient">Select Your Patient</Label>
              <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose from your patients" />
                </SelectTrigger>
                <SelectContent>
                  {PATIENTS_ARRAY.map(patient => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName} - {patient.email}
                    </SelectItem>
                  ))}
                  {PATIENTS_ARRAY.length === 0 && (
                    <SelectItem value="" disabled>No patients found</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="type">Appointment Type</Label>
              <Select value={appointmentType} onValueChange={setAppointmentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">Routine Checkup</SelectItem>
                  <SelectItem value="follow-up">Follow-up</SelectItem>
                  <SelectItem value="urgent">Urgent Consultation</SelectItem>
                  <SelectItem value="preventive">Preventive Care</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reason">Reason for Visit</Label>
              <Textarea
                id="reason"
                placeholder="Describe the reason for the appointment..."
                value={appointmentReason}
                onChange={(e) => setAppointmentReason(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={appointmentPriority} onValueChange={setAppointmentPriority}>
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

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setIsBookingModalOpen(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleBookAppointmentForPatient}
                className="flex-1"
              >
                Schedule Appointment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}