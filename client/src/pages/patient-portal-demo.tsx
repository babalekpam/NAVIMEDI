import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { SharedAppointmentService } from "@/lib/shared-appointments";
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  Pill, 
  MessageSquare, 
  Video, 
  Plus, 
  Activity, 
  Stethoscope,
  CalendarCheck,
  Download,
  Send,
  Building2,
  MapPin,
  ArrowLeft,
  Users
} from 'lucide-react';
import navimedLogo from "@assets/navimed-logo.jpg";

// Demo data - completely self-contained
const DEMO_PATIENTS = [
  {
    id: "patient-1",
    firstName: "Michael",
    lastName: "Johnson",
    email: "michael.johnson@email.com",
    phone: "(555) 123-4567",
    dateOfBirth: "1985-03-15",
    tenantId: "demo-tenant",
    hospitalName: "Metro General Hospital"
  },
  {
    id: "patient-2", 
    firstName: "Sarah",
    lastName: "Williams",
    email: "sarah.williams@email.com",
    phone: "(555) 234-5678",
    dateOfBirth: "1990-07-22",
    tenantId: "demo-tenant",
    hospitalName: "Metro General Hospital"
  },
  {
    id: "patient-3",
    firstName: "Robert",
    lastName: "Davis",
    email: "robert.davis@email.com", 
    phone: "(555) 345-6789",
    dateOfBirth: "1978-11-08",
    tenantId: "demo-tenant",
    hospitalName: "Metro General Hospital"
  }
];

// EXACT Metro General Hospital doctors from database (matching names exactly)
const DEMO_DOCTORS = [
  {
    id: "9049628e-cd05-4bd6-b08e-ee923c6dec10",
    firstName: "Dr. David",
    lastName: "Brown",
    specialization: "Internal Medicine",
    email: "dr.brown@metrogeneral.com",
    availability: ["Monday", "Wednesday", "Friday"]
  },
  {
    id: "2cd7fc68-02a0-4924-b564-0dd1bd7b247b",
    firstName: "Lisa",
    lastName: "Chen",
    specialization: "Family Medicine", 
    email: "dr.chen@metrogeneral.com",
    availability: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  },
  {
    id: "49591cfd-ddb0-478c-aae9-b307ac138999",
    firstName: "Dr. Carlos",
    lastName: "Garcia",
    specialization: "Orthopedics", 
    email: "dr.garcia@metrogeneral.com",
    availability: ["Tuesday", "Thursday"]
  },
  {
    id: "720deedd-e634-4fc2-9f52-57b6bd7f52d9", 
    firstName: "Dr. Sarah",
    lastName: "Johnson",
    specialization: "Cardiology",
    email: "dr.johnson@metrogeneral.com",
    availability: ["Tuesday", "Thursday", "Saturday"]
  },
  {
    id: "93452ac4-f87e-4227-90f8-df124fe20cb9",
    firstName: "Sofia",
    lastName: "Martinez",
    specialization: "Family Medicine", 
    email: "dr.martinez@metrogeneral.com",
    availability: ["Monday", "Wednesday", "Friday"]
  },
  {
    id: "e7d43e79-4dbf-4114-9065-eea501d6b380",
    firstName: "Raj",
    lastName: "Patel",
    specialization: "Internal Medicine", 
    email: "dr.patel@metrogeneral.com",
    availability: ["Monday", "Tuesday", "Thursday"]
  },
  {
    id: "5fe10688-b38e-458e-b38b-bf8a2507b19a",
    firstName: "Dr. Michael",
    lastName: "Smith",
    specialization: "Emergency Medicine", 
    email: "dr.smith@metrogeneral.com",
    availability: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  },
  {
    id: "0c6ed45a-13ff-4806-8c8e-b59c699e3d03",
    firstName: "James",
    lastName: "Williams",
    specialization: "Internal Medicine",
    email: "dr.williams@metrogeneral.com",
    availability: ["Monday", "Wednesday", "Friday"]
  },
  {
    id: "e6236087-ce86-4c24-9553-9fb8d6b7b960",
    firstName: "Dr. Emily",
    lastName: "Wilson",
    specialization: "Pediatrics", 
    email: "dr.wilson@metrogeneral.com",
    availability: ["Monday", "Wednesday", "Friday"]
  }
];

const appointmentSchema = z.object({
  doctorId: z.string().min(1, "Please select a doctor"),
  appointmentDate: z.string().min(1, "Please select a date"),
  appointmentTime: z.string().min(1, "Please select a time"),
  type: z.string().min(1, "Please select appointment type"),
  reason: z.string().min(1, "Please describe the reason"),
  priority: z.string().min(1, "Please select priority"),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

export default function PatientPortalDemo() {
  const { toast } = useToast();
  const [selectedPatient, setSelectedPatient] = useState<typeof DEMO_PATIENTS[0] | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [messageForm, setMessageForm] = useState({ subject: "", message: "", priority: "normal" });
  const [refreshKey, setRefreshKey] = useState(0);

  const appointmentForm = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      doctorId: "",
      appointmentDate: "",
      appointmentTime: "",
      type: "",
      reason: "",
      priority: "normal",
    },
  });

  // Get real appointments from shared system for selected patient
  const getPatientAppointments = (patientId: string) => {
    return SharedAppointmentService.getAppointmentsForPatient(patientId);
  };

  // Demo prescriptions for selected patient
  const getPatientPrescriptions = (patientId: string) => [
    {
      id: "rx-1",
      patientId: patientId,
      prescriberId: "doc-1",
      prescriberName: "Dr. Emily Carter",
      medication: "Lisinopril 10mg",
      dosage: "Once daily",
      frequency: "Daily",
      duration: "30 days",
      instructions: "Take with food in the morning",
      status: "active",
      dateCreated: "2024-08-01T09:00:00.000Z"
    },
    {
      id: "rx-2",
      patientId: patientId, 
      prescriberId: "doc-2",
      prescriberName: "Dr. James Chen", 
      medication: "Metformin 500mg",
      dosage: "Twice daily",
      frequency: "Twice daily",
      duration: "90 days",
      instructions: "Take with meals",
      status: "active",
      dateCreated: "2024-07-15T11:30:00.000Z"
    }
  ];

  // Demo lab results for selected patient
  const getPatientLabResults = (patientId: string) => [
    {
      id: "lab-1",
      patientId: patientId,
      testName: "Complete Blood Count",
      testDate: "2024-08-05T08:00:00.000Z",
      status: "completed",
      results: "Normal values across all parameters",
      doctorNotes: "All results within normal range. Continue current treatment.",
      normalRange: "WBC: 4.0-11.0, RBC: 4.2-5.4, Hemoglobin: 12.0-16.0"
    },
    {
      id: "lab-2",
      patientId: patientId,
      testName: "Lipid Panel",
      testDate: "2024-07-28T07:30:00.000Z", 
      status: "completed",
      results: "Total Cholesterol: 185 mg/dL, HDL: 45 mg/dL, LDL: 110 mg/dL",
      doctorNotes: "Cholesterol levels acceptable. Recommend dietary modifications.",
      normalRange: "Total: <200, HDL: >40, LDL: <100"
    }
  ];

  const handleBookAppointment = async (data: AppointmentFormData) => {
    try {
      // Simulate booking delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const selectedDoctor = DEMO_DOCTORS.find(doc => doc.id === data.doctorId);
      
      if (selectedDoctor && selectedPatient) {
        // Add appointment to shared system with debug logging
        const appointmentId = SharedAppointmentService.addAppointment({
          patientId: selectedPatient.id,
          providerId: data.doctorId,
          appointmentDate: new Date(data.appointmentDate + 'T' + data.appointmentTime).toISOString(),
          type: data.type,
          reason: data.reason,
          status: "scheduled",
          priority: data.priority,
          patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
          doctorName: `${selectedDoctor.firstName} ${selectedDoctor.lastName}`
        });
        
        console.log("=== APPOINTMENT BOOKING DEBUG ===");
        console.log("New appointment ID:", appointmentId);
        console.log("Patient:", selectedPatient.firstName, selectedPatient.lastName);
        console.log("Doctor:", selectedDoctor.firstName, selectedDoctor.lastName);
        console.log("Doctor ID:", data.doctorId);
        console.log("All appointments after booking:", SharedAppointmentService.getAllAppointments());
        console.log("Doctor's appointments:", SharedAppointmentService.getAppointmentsForDoctor(data.doctorId));
        
        // Force refresh to show new appointment
        setRefreshKey(prev => prev + 1);
      }
      
      toast({
        title: "Success",
        description: "Your appointment has been booked successfully!",
      });
      setIsBookingModalOpen(false);
      appointmentForm.reset();
    } catch (error: any) {
      console.error("Appointment booking error:", error);
      toast({
        title: "Error",
        description: "Failed to book appointment",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!messageForm.subject.trim() || !messageForm.message.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both subject and message",
        variant: "destructive",
      });
      return;
    }

    try {
      // Simulate sending delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast({
        title: "Success", 
        description: "Message sent successfully!",
      });
      setMessageForm({ subject: "", message: "", priority: "normal" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  // Patient selection screen
  if (!selectedPatient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <img src={navimedLogo} alt="NaviMED" className="mx-auto mb-4 h-16 w-auto" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Metro General Hospital</h1>
            <p className="text-gray-600">Patient Portal - Select Your Profile</p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Select Patient Profile
                </CardTitle>
                <CardDescription>
                  Choose your patient profile to access your medical information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {DEMO_PATIENTS.map((patient) => (
                    <Card 
                      key={patient.id} 
                      className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-emerald-300"
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-emerald-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {patient.firstName} {patient.lastName}
                            </h3>
                            <p className="text-sm text-gray-600">Patient ID: {patient.id}</p>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <p><strong>Email:</strong> {patient.email}</p>
                          <p><strong>Phone:</strong> {patient.phone}</p>
                          <p><strong>DOB:</strong> {new Date(patient.dateOfBirth).toLocaleDateString()}</p>
                        </div>
                        <Button className="w-full mt-4" variant="outline">
                          Access Portal
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Main patient portal for selected patient
  const appointments = getPatientAppointments(selectedPatient.id);
  const prescriptions = getPatientPrescriptions(selectedPatient.id);
  const labResults = getPatientLabResults(selectedPatient.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedPatient(null)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Change Patient
              </Button>
              <div className="flex items-center gap-3">
                <img src={navimedLogo} alt="NaviMED" className="h-10 w-auto" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Metro General Hospital</h1>
                  <p className="text-sm text-gray-600">Patient Portal</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold">{selectedPatient.firstName} {selectedPatient.lastName}</p>
              <p className="text-sm text-gray-600">{selectedPatient.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="lab-results">Lab Results</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">{appointments.length}</p>
                      <p className="text-sm text-gray-600">Upcoming Appointments</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Pill className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{prescriptions.length}</p>
                      <p className="text-sm text-gray-600">Active Prescriptions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="text-2xl font-bold">{labResults.length}</p>
                      <p className="text-sm text-gray-600">Recent Lab Results</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-8 w-8 text-orange-500" />
                    <div>
                      <p className="text-2xl font-bold">3</p>
                      <p className="text-sm text-gray-600">Unread Messages</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2 h-auto p-4">
                        <Plus className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-semibold">Book Appointment</div>
                          <div className="text-sm opacity-90">Schedule with a doctor</div>
                        </div>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Book New Appointment</DialogTitle>
                        <DialogDescription>
                          Schedule an appointment with one of our doctors
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...appointmentForm}>
                        <form onSubmit={appointmentForm.handleSubmit(handleBookAppointment)} className="space-y-4">
                          <FormField
                            control={appointmentForm.control}
                            name="doctorId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Select Doctor</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Choose a doctor" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {DEMO_DOCTORS.map((doctor) => (
                                      <SelectItem key={doctor.id} value={doctor.id}>
                                        {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={appointmentForm.control}
                            name="appointmentDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Date</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={appointmentForm.control}
                            name="appointmentTime"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Time</FormLabel>
                                <FormControl>
                                  <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={appointmentForm.control}
                            name="type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Appointment Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="routine">Routine Check-up</SelectItem>
                                    <SelectItem value="follow-up">Follow-up</SelectItem>
                                    <SelectItem value="consultation">Consultation</SelectItem>
                                    <SelectItem value="emergency">Emergency</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={appointmentForm.control}
                            name="reason"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Reason for Visit</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Describe your symptoms or reason for visit" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={appointmentForm.control}
                            name="priority"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Priority</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="normal">Normal</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit" className="w-full">
                            Book Appointment
                          </Button>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" className="flex items-center gap-2 h-auto p-4">
                    <Download className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">Download Records</div>
                      <div className="text-sm opacity-70">Get medical history</div>
                    </div>
                  </Button>

                  <Button variant="outline" className="flex items-center gap-2 h-auto p-4">
                    <Video className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">Video Consultation</div>
                      <div className="text-sm opacity-70">Start telemedicine</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Your Appointments</h2>
              <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Book New Appointment
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {getPatientAppointments(selectedPatient.id).map((appointment) => (
                <Card key={appointment.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="h-4 w-4 text-blue-500" />
                          <h3 className="font-semibold">{appointment.doctorName}</h3>
                          <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                            {appointment.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{appointment.type}</p>
                        <p className="text-sm"><strong>Reason:</strong> {appointment.reason}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(appointment.appointmentDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(appointment.appointmentDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={appointment.priority === 'high' ? 'destructive' : 'outline'}>
                          {appointment.priority} priority
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Prescriptions Tab */}
          <TabsContent value="prescriptions" className="space-y-6">
            <h2 className="text-2xl font-bold">Your Prescriptions</h2>
            
            <div className="grid gap-4">
              {prescriptions.map((prescription) => (
                <Card key={prescription.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Pill className="h-4 w-4 text-green-500" />
                          <h3 className="font-semibold">{prescription.medication}</h3>
                          <Badge variant="outline">
                            {prescription.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">Prescribed by: {prescription.prescriberName}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p><strong>Dosage:</strong> {prescription.dosage}</p>
                            <p><strong>Frequency:</strong> {prescription.frequency}</p>
                          </div>
                          <div>
                            <p><strong>Duration:</strong> {prescription.duration}</p>
                            <p><strong>Date:</strong> {new Date(prescription.dateCreated).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <p className="text-sm bg-blue-50 p-2 rounded">
                          <strong>Instructions:</strong> {prescription.instructions}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Lab Results Tab */}
          <TabsContent value="lab-results" className="space-y-6">
            <h2 className="text-2xl font-bold">Your Lab Results</h2>
            
            <div className="grid gap-4">
              {labResults.map((result) => (
                <Card key={result.id}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-purple-500" />
                            <h3 className="font-semibold">{result.testName}</h3>
                            <Badge variant="outline">
                              {result.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            Test Date: {new Date(result.testDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                      
                      <div className="grid gap-3">
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="text-sm font-medium mb-1">Results:</p>
                          <p className="text-sm">{result.results}</p>
                        </div>
                        
                        <div className="bg-blue-50 p-3 rounded">
                          <p className="text-sm font-medium mb-1">Normal Range:</p>
                          <p className="text-sm">{result.normalRange}</p>
                        </div>
                        
                        <div className="bg-green-50 p-3 rounded">
                          <p className="text-sm font-medium mb-1">Doctor's Notes:</p>
                          <p className="text-sm">{result.doctorNotes}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            <h2 className="text-2xl font-bold">Medical Communications</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>Send Message to Doctor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={messageForm.subject}
                    onChange={(e) => setMessageForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Enter message subject"
                  />
                </div>
                
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={messageForm.message}
                    onChange={(e) => setMessageForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Type your message here..."
                    rows={4}
                  />
                </div>
                
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={messageForm.priority} onValueChange={(value) => setMessageForm(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={handleSendMessage} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </CardContent>
            </Card>

            {/* Demo received messages */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Recent Messages</h3>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">Dr. Emily Carter</p>
                      <p className="text-sm text-gray-600">Internal Medicine</p>
                    </div>
                    <p className="text-sm text-gray-500">2 hours ago</p>
                  </div>
                  <h4 className="font-medium mb-2">Lab Results Review</h4>
                  <p className="text-sm text-gray-700">Your recent blood work results are all within normal ranges. Please continue your current medication regimen and schedule a follow-up in 3 months.</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">Dr. James Chen</p>
                      <p className="text-sm text-gray-600">Cardiology</p>
                    </div>
                    <p className="text-sm text-gray-500">1 day ago</p>
                  </div>
                  <h4 className="font-medium mb-2">Appointment Reminder</h4>
                  <p className="text-sm text-gray-700">This is a reminder about your upcoming cardiology appointment on August 20th at 2:30 PM. Please bring your blood pressure log.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}