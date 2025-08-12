import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  XCircle,
  Eye,
  UserCheck
} from 'lucide-react';
import navimedLogo from "@assets/navimed-logo.jpg";

// Demo doctors for login
const DEMO_DOCTORS = [
  {
    id: "doc-1",
    firstName: "Dr. Emily",
    lastName: "Carter",
    specialization: "Internal Medicine",
    email: "e.carter@metrohealth.com",
    phone: "(555) 101-2001",
    password: "doctor123",
    availability: ["Monday", "Wednesday", "Friday"]
  },
  {
    id: "doc-2", 
    firstName: "Dr. James",
    lastName: "Chen",
    specialization: "Cardiology",
    email: "j.chen@metrohealth.com",
    phone: "(555) 101-2002",
    password: "doctor123",
    availability: ["Tuesday", "Thursday", "Saturday"]
  },
  {
    id: "doc-3",
    firstName: "Dr. Maria",
    lastName: "Rodriguez",
    specialization: "Family Medicine", 
    email: "m.rodriguez@metrohealth.com",
    phone: "(555) 101-2003",
    password: "doctor123",
    availability: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  }
];

// Demo patients
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
  }
};

export default function DoctorPortal() {
  const { toast } = useToast();
  const [loggedInDoctor, setLoggedInDoctor] = useState<typeof DEMO_DOCTORS[0] | null>(null);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [activeTab, setActiveTab] = useState("appointments");

  // Get appointments for logged in doctor
  const getDoctorAppointments = (doctorId: string) => {
    // This simulates appointments booked by patients for this doctor
    const baseAppointments = [
      {
        id: "appt-1",
        patientId: "patient-1",
        providerId: "doc-1",
        appointmentDate: "2024-08-15T10:00:00.000Z",
        type: "routine",
        reason: "Annual physical examination",
        status: "scheduled",
        priority: "normal",
        bookedAt: new Date().toISOString()
      },
      {
        id: "appt-2", 
        patientId: "patient-2",
        providerId: "doc-2",
        appointmentDate: "2024-08-20T14:30:00.000Z",
        type: "follow-up",
        reason: "Blood pressure monitoring",
        status: "confirmed",
        priority: "high",
        bookedAt: new Date().toISOString()
      },
      {
        id: "appt-3",
        patientId: "patient-1",
        providerId: "doc-2",
        appointmentDate: "2024-08-22T09:15:00.000Z",
        type: "consultation",
        reason: "Chest pain evaluation",
        status: "scheduled",
        priority: "urgent",
        bookedAt: new Date().toISOString()
      },
      {
        id: "appt-4",
        patientId: "patient-3", 
        providerId: "doc-3",
        appointmentDate: "2024-08-18T11:00:00.000Z",
        type: "routine",
        reason: "Diabetes checkup",
        status: "scheduled",
        priority: "normal",
        bookedAt: new Date().toISOString()
      }
    ];

    return baseAppointments.filter(appointment => appointment.providerId === doctorId);
  };

  const handleLogin = async () => {
    
    // Simulate login delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const doctor = DEMO_DOCTORS.find(d => 
      d.email === loginForm.email && d.password === loginForm.password
    );

    if (doctor) {
      setLoggedInDoctor(doctor);
      toast({
        title: "Login Successful",
        description: `Welcome back, ${doctor.firstName} ${doctor.lastName}!`,
      });
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid email or password. Try doctor123 as password.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    setLoggedInDoctor(null);
    setLoginForm({ email: "", password: "" });
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    toast({
      title: "Status Updated",
      description: `Appointment status changed to ${newStatus}`,
    });
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
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="doctor@metrohealth.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter password"
                    required
                  />
                </div>
                <Button onClick={handleLogin} className="w-full">
                  Login
                </Button>
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Demo Credentials:</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Dr. James Chen (Cardiology):</strong><br />
                  Email: j.chen@metrohealth.com<br />
                  Password: doctor123</p>
                  
                  <p><strong>Dr. Emily Carter (Internal Medicine):</strong><br />
                  Email: e.carter@metrohealth.com<br />
                  Password: doctor123</p>
                  
                  <p><strong>Dr. Maria Rodriguez (Family Medicine):</strong><br />
                  Email: m.rodriguez@metrohealth.com<br />
                  Password: doctor123</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Doctor dashboard
  const doctorAppointments = getDoctorAppointments(loggedInDoctor.id);
  const todayAppointments = doctorAppointments.filter(appt => {
    const apptDate = new Date(appt.appointmentDate);
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
              <Badge variant="outline" className="text-lg px-3 py-1">
                {doctorAppointments.length} Total
              </Badge>
            </div>

            <div className="grid gap-4">
              {doctorAppointments.map((appointment) => {
                const patient = DEMO_PATIENTS[appointment.patientId as keyof typeof DEMO_PATIENTS];
                return (
                  <Card key={appointment.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-blue-500" />
                            <div>
                              <h3 className="font-semibold text-lg">
                                {patient?.firstName} {patient?.lastName}
                              </h3>
                              <p className="text-sm text-gray-600">Patient ID: {appointment.patientId}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span>
                                  {new Date(appointment.appointmentDate).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span>
                                  {new Date(appointment.appointmentDate).toLocaleTimeString([], {
                                    hour: '2-digit', 
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-gray-500" />
                                <span>{patient?.phone}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-gray-500" />
                                <span>{patient?.email}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm font-medium mb-1">Appointment Details:</p>
                            <p className="text-sm"><strong>Type:</strong> {appointment.type}</p>
                            <p className="text-sm"><strong>Reason:</strong> {appointment.reason}</p>
                            <p className="text-sm">
                              <strong>Booked:</strong> {new Date(appointment.bookedAt).toLocaleString()}
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
                            <Badge 
                              variant={appointment.priority === 'urgent' ? 'destructive' : 
                                     appointment.priority === 'high' ? 'destructive' : 'outline'}
                            >
                              {appointment.priority} priority
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
    </div>
  );
}