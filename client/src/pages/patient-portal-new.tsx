import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { useAuth } from "@/contexts/auth-context";
import { useTenant } from "@/contexts/tenant-context-fixed";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
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
  MapPin
} from 'lucide-react';
import navimedLogo from "@assets/navimed-logo.jpg";

// Type definitions for better TypeScript support
interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  tenantId: string;
  hospitalName?: string;
}

interface Appointment {
  id: string;
  patientId: string;
  providerId: string;
  providerName?: string;
  providerFirstName?: string;
  providerLastName?: string;
  appointmentDate: string;
  type: string;
  reason?: string;
  status: string;
  priority?: string;
  tenantId: string;
}

interface Prescription {
  id: string;
  patientId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  instructions?: string;
  status: string;
  prescribedDate: string;
  refills: number;
  tenantId: string;
}

interface LabResult {
  id: string;
  patientId: string;
  testName: string;
  notes?: string;
  status: string;
  results?: any;
  createdAt: string;
  tenantId: string;
}

interface Message {
  id: string;
  subject: string;
  message: string;
  priority: string;
  isRead: boolean;
  createdAt: string;
  tenantId: string;
}

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialization?: string;
  email: string;
  tenantId: string;
  role: string;
}

interface HospitalInfo {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  primaryColor?: string;
  logoUrl?: string;
  type: string;
}

// Appointment booking schema
const appointmentSchema = z.object({
  doctorId: z.string().min(1, "Please select a doctor"),
  appointmentDate: z.string().min(1, "Please select a date"),
  appointmentTime: z.string().min(1, "Please select a time"),
  type: z.string().min(1, "Please select appointment type"),
  reason: z.string().min(1, "Please provide a reason for the visit"),
  priority: z.enum(["routine", "urgent", "emergency"]).default("routine"),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

export default function PatientPortalNew() {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [messageForm, setMessageForm] = useState({
    subject: "",
    message: "",
    priority: "normal"
  });

  // Form for appointment booking
  const appointmentForm = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      doctorId: "",
      appointmentDate: "",
      appointmentTime: "",
      type: "consultation",
      reason: "",
      priority: "routine",
    },
  });

  // Fetch patient data with proper typing
  const { data: patientProfile, isLoading: profileLoading } = useQuery<Patient>({
    queryKey: ["/api/patient/profile"],
    enabled: !!user && user.role === "patient"
  });

  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/patient/appointments"],
    enabled: !!user && user.role === "patient"
  });

  const { data: prescriptions = [], isLoading: prescriptionsLoading } = useQuery<Prescription[]>({
    queryKey: ["/api/patient/prescriptions"],
    enabled: !!user && user.role === "patient"
  });

  const { data: labResults = [], isLoading: labResultsLoading } = useQuery<LabResult[]>({
    queryKey: ["/api/patient/lab-results"],
    enabled: !!user && user.role === "patient"
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/medical-communications"],
    enabled: !!user && user.role === "patient"
  });

  // Fetch hospital/tenant information for patient's hospital
  const { data: hospitalInfo } = useQuery<HospitalInfo>({
    queryKey: ["/api/tenant/current"],
    enabled: !!user && user.role === "patient"
  });

  // Fetch doctors from patient's hospital only
  const { data: doctors = [], isLoading: doctorsLoading } = useQuery<Doctor[]>({
    queryKey: ["/api/users", user?.tenantId],
    select: (data: any[]) => data.filter((doctor: Doctor) => 
      (doctor.role === "physician" || doctor.role === "doctor") && 
      doctor.tenantId === user?.tenantId
    ),
    enabled: !!user && user.role === "patient" && !!user.tenantId
  });

  // Book appointment mutation
  const bookAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: AppointmentFormData) => {
      const appointmentDateTime = new Date(`${appointmentData.appointmentDate}T${appointmentData.appointmentTime}`);
      
      const response = await apiRequest("POST", "/api/appointments", {
        patientId: user?.id || user?.userId,
        providerId: appointmentData.doctorId,
        appointmentDate: appointmentDateTime.toISOString(),
        type: appointmentData.type,
        reason: appointmentData.reason,
        priority: appointmentData.priority,
        status: 'scheduled',
        tenantId: user?.tenantId || hospitalInfo?.id
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your appointment has been booked successfully!",
      });
      setIsBookingModalOpen(false);
      appointmentForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/patient/appointments"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to book appointment",
        variant: "destructive",
      });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      const response = await apiRequest("POST", "/api/medical-communications", {
        ...messageData,
        tenantId: user?.tenantId || hospitalInfo?.id
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Message sent successfully!",
      });
      setMessageForm({ subject: "", message: "", priority: "normal" });
      queryClient.invalidateQueries({ queryKey: ["/api/medical-communications"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleBookAppointment = (data: AppointmentFormData) => {
    bookAppointmentMutation.mutate(data);
  };

  const handleSendMessage = () => {
    if (!messageForm.subject.trim() || !messageForm.message.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both subject and message",
        variant: "destructive",
      });
      return;
    }

    sendMessageMutation.mutate({
      subject: messageForm.subject,
      message: messageForm.message,
      priority: messageForm.priority,
      type: "general_message",
    });
  };

  // Generate available time slots
  const getAvailableTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Debug: Show current user info
  console.log("Current user in patient portal:", user);
  console.log("Tenant info:", tenant);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <User className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
            <p className="text-gray-600 mb-6">
              Please log in to access the patient portal.
            </p>
            <div className="space-y-2">
              <Button onClick={() => window.location.href = "/login"} className="w-full">
                Staff Login
              </Button>
              <Button onClick={() => window.location.href = "/patient-login"} variant="outline" className="w-full">
                Patient Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Demo mode: show warning but allow access for testing
  const [showDemoWarning, setShowDemoWarning] = useState(user.role !== "patient");
  
  if (showDemoWarning && user.role !== "patient") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="w-full max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <Activity className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Demo Patient Portal</h2>
              <p className="text-gray-600 mb-6">
                You're logged in as <strong>{user.role}</strong> ({user.firstName} {user.lastName}). 
                This is a demonstration of the patient portal interface. In production, this would be restricted to patient accounts only.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Current User:</strong> {user.firstName} {user.lastName} ({user.role})<br/>
                  <strong>Tenant:</strong> {tenant?.name || 'Loading...'}<br/>
                  <strong>User ID:</strong> {user.id}
                </p>
              </div>
              <Button 
                onClick={() => setShowDemoWarning(false)} 
                className="w-full"
              >
                Continue to Demo Portal
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <img 
                src={hospitalInfo?.logoUrl || navimedLogo} 
                alt={hospitalInfo?.name || "Hospital"} 
                className="h-10 w-10 rounded-lg object-contain" 
              />
              <div>
                <h1 className="text-xl font-bold" style={{ color: hospitalInfo?.primaryColor || '#2563eb' }}>
                  {hospitalInfo?.name || 'Hospital'} Patient Portal
                </h1>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Welcome back, {user?.firstName}
                  {hospitalInfo?.address && (
                    <>
                      <span className="mx-2">•</span>
                      <MapPin className="h-3 w-3" />
                      {hospitalInfo.address}
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
                <DialogTrigger asChild>
                  <Button 
                    style={{ 
                      backgroundColor: hospitalInfo?.primaryColor || '#2563eb',
                      borderColor: hospitalInfo?.primaryColor || '#2563eb'
                    }}
                    className="hover:opacity-90"
                  >
                    <CalendarCheck className="h-4 w-4 mr-2" />
                    Book Appointment at {hospitalInfo?.name || 'Hospital'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Book New Appointment</DialogTitle>
                    <DialogDescription>
                      Schedule an appointment with one of our healthcare providers.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...appointmentForm}>
                    <form onSubmit={appointmentForm.handleSubmit(handleBookAppointment)} className="space-y-4">
                      <FormField
                        control={appointmentForm.control}
                        name="doctorId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Select Doctor *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose your preferred doctor" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {doctorsLoading ? (
                                  <div className="p-4 text-center">Loading doctors...</div>
                                ) : doctors.length > 0 ? (
                                  doctors.map((doctor: any) => (
                                    <SelectItem key={doctor.id} value={doctor.id}>
                                      Dr. {doctor.firstName} {doctor.lastName}
                                      {doctor.specialization && ` - ${doctor.specialization}`}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <div className="p-4 text-center text-gray-500">No doctors available</div>
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={appointmentForm.control}
                          name="appointmentDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date *</FormLabel>
                              <FormControl>
                                <Input 
                                  type="date" 
                                  min={getMinDate()}
                                  {...field} 
                                />
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
                              <FormLabel>Time *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select time" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {getAvailableTimeSlots().map((time) => (
                                    <SelectItem key={time} value={time}>
                                      {time}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={appointmentForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Appointment Type *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select appointment type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="consultation">General Consultation</SelectItem>
                                <SelectItem value="follow-up">Follow-up Visit</SelectItem>
                                <SelectItem value="checkup">Annual Checkup</SelectItem>
                                <SelectItem value="specialist">Specialist Consultation</SelectItem>
                                <SelectItem value="emergency">Emergency Visit</SelectItem>
                                <SelectItem value="telemedicine">Telemedicine</SelectItem>
                              </SelectContent>
                            </Select>
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
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="routine">Routine</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
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
                            <FormLabel>Reason for Visit *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Please describe the reason for your appointment..."
                                className="min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end space-x-3 pt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsBookingModalOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={bookAppointmentMutation.isPending}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {bookAppointmentMutation.isPending ? "Booking..." : "Book Appointment"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              
              <Button variant="outline" onClick={() => window.location.href = "/"}>
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="lab-results">Lab Results</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800">Upcoming Appointments</p>
                      <p className="text-2xl font-bold text-green-900">
                        {appointments.filter(a => new Date(a.appointmentDate) > new Date() && a.status !== 'cancelled').length}
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
                        {prescriptions.filter(p => p.status === 'active').length}
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
                      <p className="text-sm font-medium text-purple-800">Recent Lab Results</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {labResults.filter(l => new Date(l.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
                      </p>
                    </div>
                    <FileText className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-800">Unread Messages</p>
                      <p className="text-2xl font-bold text-orange-900">
                        {messages.filter(m => !m.isRead).length}
                      </p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest healthcare interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments.slice(0, 3).map((appointment) => (
                    <div key={appointment.id} className="border-l-4 border-blue-500 pl-4 py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Appointment - {appointment.type}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(appointment.appointmentDate).toLocaleDateString()} at {new Date(appointment.appointmentDate).toLocaleTimeString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            {appointment.providerName || 'Provider not specified'}
                          </p>
                        </div>
                        <Badge variant={appointment.status === 'completed' ? 'default' : 'secondary'}>
                          {appointment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  
                  {appointments.length === 0 && (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No recent appointments</p>
                      <Button 
                        onClick={() => setIsBookingModalOpen(true)} 
                        className="mt-4"
                      >
                        Book Your First Appointment
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">My Appointments</h2>
                <p className="text-gray-600">View and manage your healthcare appointments</p>
              </div>
              <Button onClick={() => setIsBookingModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Book New Appointment
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                {appointmentsLoading ? (
                  <div className="text-center py-8">Loading appointments...</div>
                ) : appointments.length > 0 ? (
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <div key={appointment.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{appointment.type}</h3>
                              <Badge variant={
                                appointment.status === 'completed' ? 'default' : 
                                appointment.status === 'cancelled' ? 'destructive' :
                                appointment.status === 'scheduled' ? 'secondary' : 'outline'
                              }>
                                {appointment.status}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {new Date(appointment.appointmentDate).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {new Date(appointment.appointmentDate).toLocaleTimeString()}
                              </div>
                              <div className="flex items-center gap-2">
                                <Stethoscope className="h-4 w-4" />
                                {appointment.providerName || 'Provider not specified'}
                              </div>
                              {appointment.reason && (
                                <div className="flex items-start gap-2 mt-2">
                                  <FileText className="h-4 w-4 mt-0.5" />
                                  <span>{appointment.reason}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            {appointment.type === 'telemedicine' && appointment.status === 'scheduled' && (
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                <Video className="h-4 w-4 mr-2" />
                                Join Call
                              </Button>
                            )}
                            {appointment.status === 'scheduled' && new Date(appointment.appointmentDate) > new Date() && (
                              <Button variant="outline" size="sm">
                                Reschedule
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments yet</h3>
                    <p className="text-gray-500 mb-4">Book your first appointment to get started with your healthcare journey.</p>
                    <Button onClick={() => setIsBookingModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Book Appointment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medications Tab */}
          <TabsContent value="medications" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">My Medications</h2>
              <p className="text-gray-600">Track your current and past prescriptions</p>
            </div>

            <Card>
              <CardContent className="p-6">
                {prescriptionsLoading ? (
                  <div className="text-center py-8">Loading medications...</div>
                ) : prescriptions.length > 0 ? (
                  <div className="space-y-4">
                    {prescriptions.map((prescription) => (
                      <div key={prescription.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{prescription.medicationName}</h3>
                            <p className="text-gray-600">{prescription.dosage} • {prescription.frequency}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              Prescribed: {new Date(prescription.prescribedDate).toLocaleDateString()}
                            </p>
                            {prescription.instructions && (
                              <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-2 rounded">
                                <strong>Instructions:</strong> {prescription.instructions}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col gap-2 items-end">
                            <Badge variant={prescription.status === 'active' ? 'default' : 'secondary'}>
                              {prescription.status}
                            </Badge>
                            <div className="text-sm text-gray-500">
                              Refills: {prescription.refills}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Pill className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No medications yet</h3>
                    <p className="text-gray-500">Your prescribed medications will appear here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lab Results Tab */}
          <TabsContent value="lab-results" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Lab Results</h2>
              <p className="text-gray-600">View your test results and reports</p>
            </div>

            <Card>
              <CardContent className="p-6">
                {labResultsLoading ? (
                  <div className="text-center py-8">Loading lab results...</div>
                ) : labResults.length > 0 ? (
                  <div className="space-y-4">
                    {labResults.map((result) => (
                      <div key={result.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{result.testName}</h3>
                            <p className="text-gray-600">{result.notes || 'No additional notes'}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              Ordered: {new Date(result.createdAt).toLocaleDateString()}
                            </p>
                            {result.results && (
                              <div className="mt-2 space-y-1">
                                <p className="text-sm font-medium text-green-600">Results Available</p>
                                <div className="bg-green-50 p-2 rounded text-sm">
                                  {typeof result.results === 'string' ? result.results : JSON.stringify(result.results)}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            <Badge variant={result.status === 'completed' ? 'default' : 'secondary'}>
                              {result.status}
                            </Badge>
                            {result.results && (
                              <Button size="sm" variant="outline">
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No lab results yet</h3>
                    <p className="text-gray-500">Your test results will appear here when available.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Messages</h2>
              <p className="text-gray-600">Communicate with your healthcare team</p>
            </div>

            {/* Send Message Form */}
            <Card>
              <CardHeader>
                <CardTitle>Send New Message</CardTitle>
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
                    className="min-h-[100px]"
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={messageForm.priority} 
                    onValueChange={(value) => setMessageForm(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleSendMessage}
                  disabled={sendMessageMutation.isPending}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {sendMessageMutation.isPending ? "Sending..." : "Send Message"}
                </Button>
              </CardContent>
            </Card>

            {/* Messages List */}
            <Card>
              <CardHeader>
                <CardTitle>Message History</CardTitle>
              </CardHeader>
              <CardContent>
                {messagesLoading ? (
                  <div className="text-center py-8">Loading messages...</div>
                ) : messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div key={message.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold">{message.subject}</h3>
                            <p className="text-gray-600 mt-1">{message.message}</p>
                            <p className="text-sm text-gray-500 mt-2">
                              {new Date(message.createdAt).toLocaleDateString()} • {message.priority} priority
                            </p>
                          </div>
                          <Badge variant={message.isRead ? 'outline' : 'default'}>
                            {message.isRead ? 'Read' : 'Unread'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                    <p className="text-gray-500">Your communication with healthcare providers will appear here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}