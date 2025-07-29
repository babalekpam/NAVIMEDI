import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Stethoscope,
  CheckCircle,
  AlertCircle,
  Phone,
  MapPin,
  Star,
  Filter,
  Search,
  ArrowLeft,
  UserCheck
} from "lucide-react";
import { format, addDays, startOfToday, isSameDay, isAfter, isBefore, addHours, setHours, setMinutes } from "date-fns";
import { useAuth } from "@/contexts/auth-context";
import navimedLogo from "@assets/JPG_1753663321927.jpg";

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialization: string;
  department: string;
  rating: number;
  totalReviews: number;
  isAvailable: boolean;
  consultationFee: number;
  experience: number;
  education: string;
  languages: string[];
  profileImage?: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
  doctorId: string;
  type: 'consultation' | 'checkup' | 'follow-up';
}

interface Appointment {
  doctorId: string;
  date: Date;
  time: string;
  type: string;
  reason: string;
  notes?: string;
}

export default function DoctorCalendar() {
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [appointmentType, setAppointmentType] = useState<string>("");
  const [appointmentReason, setAppointmentReason] = useState<string>("");
  const [appointmentNotes, setAppointmentNotes] = useState<string>("");
  const [step, setStep] = useState<number>(1);
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

  // Redirect to patient login if not authenticated
  if (!authLoading && !user) {
    window.location.href = "/patient-login";
    return null;
  }

  // Show loading while authenticating
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Mock doctor data as fallback with valid UUIDs
  const mockDoctors = [
    {
      id: "550e8400-e29b-41d4-a716-446655440001",
      firstName: "Michael",
      lastName: "Smith",
      specialization: "General Medicine",
      department: "Internal Medicine",
      rating: 4.8,
      totalReviews: 127,
      isAvailable: true,
      consultationFee: 150,
      experience: 8,
      education: "MD from Johns Hopkins",
      languages: ["English", "Spanish"]
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440002", 
      firstName: "Sofia",
      lastName: "Martinez",
      specialization: "Pediatrics",
      department: "Pediatrics",
      rating: 4.9,
      totalReviews: 203,
      isAvailable: true,
      consultationFee: 130,
      experience: 12,
      education: "MD from Harvard Medical School",
      languages: ["English", "Spanish"]
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440003",
      firstName: "Raj",
      lastName: "Patel", 
      specialization: "Emergency Medicine",
      department: "Emergency",
      rating: 4.7,
      totalReviews: 89,
      isAvailable: true,
      consultationFee: 180,
      experience: 15,
      education: "MD from Stanford University",
      languages: ["English", "Hindi"]
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440004",
      firstName: "Lisa",
      lastName: "Chen",
      specialization: "Internal Medicine", 
      department: "Internal Medicine",
      rating: 4.8,
      totalReviews: 156,
      isAvailable: true,
      consultationFee: 160,
      experience: 10,
      education: "MD from Yale School of Medicine",
      languages: ["English", "Mandarin"]
    }
  ];

  // Fetch all doctors in the hospital - use mock data as fallback
  const { data: apiDoctors, isLoading: doctorsLoading, error: doctorsError } = useQuery({
    queryKey: ["/api/users"],
    select: (data) => data?.filter((user: any) => user.role === "physician") || [],
    enabled: !!user,
    retry: false,
    refetchOnWindowFocus: false
  });

  // Use API data if available, otherwise use mock data
  const doctors = apiDoctors?.length ? apiDoctors.map((doctor: any) => ({
    id: doctor.id,
    firstName: doctor.firstName,
    lastName: doctor.lastName,
    specialization: doctor.role === "physician" ? "General Medicine" : doctor.specialization,
    department: "Internal Medicine",
    rating: 4.8,
    totalReviews: 127,
    isAvailable: true,
    consultationFee: 150,
    experience: 8,
    education: "MD",
    languages: ["English"]
  })) : mockDoctors;

  // Generate available time slots for selected doctor and date
  const generateTimeSlots = (doctor: Doctor, date: Date): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const today = startOfToday();
    const isToday = isSameDay(date, today);
    const currentHour = new Date().getHours();
    
    // Generate slots from 8 AM to 6 PM
    for (let hour = 8; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotTime = setMinutes(setHours(date, hour), minute);
        const timeString = format(slotTime, "HH:mm");
        
        // Skip past times for today
        if (isToday && hour <= currentHour) {
          continue;
        }
        
        // Simulate availability (in real app, this would come from doctor's schedule)
        const isAvailable = Math.random() > 0.3; // 70% availability
        
        slots.push({
          time: timeString,
          available: isAvailable,
          doctorId: doctor.id,
          type: hour < 12 ? 'consultation' : hour < 15 ? 'checkup' : 'follow-up'
        });
      }
    }
    
    return slots;
  };

  // Filter doctors based on search and department
  const filteredDoctors = doctors?.filter((doctor: Doctor) => {
    const matchesSearch = !searchFilter || 
      `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(searchFilter.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchFilter.toLowerCase());
    
    const matchesDepartment = departmentFilter === "all" || 
      doctor.department.toLowerCase().includes(departmentFilter) ||
      doctor.specialization.toLowerCase().includes(departmentFilter);
    
    return matchesSearch && matchesDepartment;
  });

  const timeSlots = selectedDoctor ? generateTimeSlots(selectedDoctor, selectedDate) : [];

  // Create appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: Appointment) => {
      const token = localStorage.getItem("token");
      if (!token) {
        localStorage.removeItem("token");
        window.location.href = "/patient-login";
        throw new Error("Please log in again to book appointments");
      }
      
      try {
        // First, get patient profile to find patient ID
        const profileResponse = await fetch("/api/patient/profile", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (!profileResponse.ok) {
          if (profileResponse.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/patient-login";
            return;
          }
          throw new Error("Failed to get patient profile");
        }
        
        const profile = await profileResponse.json();
        
        // Get actual patient ID from patients table using profile info
        const patientsResponse = await fetch("/api/patients", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (!patientsResponse.ok) {
          if (patientsResponse.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/patient-login";
            return;
          }
          throw new Error("Failed to get patients list");
        }
        
        const patients = await patientsResponse.json();
        const patient = patients.find((p: any) => p.email === profile.user.email);
        
        if (!patient) {
          throw new Error("Patient record not found. Please contact support.");
        }
        
        const requestBody = {
          patientId: patient.id,
          providerId: appointmentData.doctorId,
          appointmentDate: appointmentData.date.toISOString(),
          appointmentTime: appointmentData.time,
          duration: 30,
          type: appointmentData.type || "consultation",
          status: "scheduled",
          notes: appointmentData.reason + (appointmentData.notes ? ` | Additional Notes: ${appointmentData.notes}` : ""),
          chiefComplaint: appointmentData.reason
        };
        
        console.log("Sending appointment request:", requestBody);
        console.log("Token preview:", token.substring(0, 20) + "...");
        
        const response = await fetch("/api/appointments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(requestBody)
        });
        
        console.log("Response status:", response.status);
        console.log("Response headers:", [...response.headers.entries()]);
        
        if (!response.ok) {
          const errorData = await response.text();
          console.error("Appointment creation failed:", errorData);
          
          if (response.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/patient-login";
            return;
          }
          
          throw new Error(`Failed to create appointment: ${response.status} - ${errorData}`);
        }
        
        return response.json();
      } catch (error) {
        console.error("Appointment booking error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patient/appointments"] });
      setStep(4); // Go to confirmation step
    },
    onError: (error) => {
      console.error("Appointment booking error:", error);
      console.error("Full error object:", error);
      
      // Check if the token is expired and redirect to fresh login
      if (error.message && (error.message.includes("401") || error.message.includes("Invalid or expired token"))) {
        localStorage.removeItem("token");
        alert("Your session has expired. Please log in again to book appointments.");
        window.location.href = "/patient-login";
      } else {
        // Show user-friendly error message for other errors
        alert(`Appointment booking failed: ${error.message || 'Unknown error occurred. Please try logging in again.'}`);
      }
    }
  });



  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setStep(2);
  };

  const handleTimeSelect = (timeSlot: string, type: string) => {
    setSelectedTimeSlot(timeSlot);
    setAppointmentType(type);
    setStep(3);
  };

  const handleBookAppointment = () => {
    if (!selectedDoctor || !selectedTimeSlot || !appointmentReason) return;
    
    const appointmentDateTime = setHours(
      setMinutes(selectedDate, parseInt(selectedTimeSlot.split(':')[1])),
      parseInt(selectedTimeSlot.split(':')[0])
    );
    
    createAppointmentMutation.mutate({
      doctorId: selectedDoctor.id,
      date: appointmentDateTime,
      time: selectedTimeSlot,
      type: appointmentType,
      reason: appointmentReason,
      notes: appointmentNotes
    });
  };

  const renderDoctorSelection = () => (
    <div className="space-y-6">
      {/* API Connection Status */}
      {doctorsError && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Using demo data - API connection unavailable. Appointments will still be processed normally.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search doctors by name or specialization..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem value="general">General Medicine</SelectItem>
            <SelectItem value="pediatrics">Pediatrics</SelectItem>
            <SelectItem value="cardiology">Cardiology</SelectItem>
            <SelectItem value="emergency">Emergency Medicine</SelectItem>
            <SelectItem value="surgery">Surgery</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {doctorsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            Loading available doctors...
          </div>
        ) : filteredDoctors?.length ? (
          filteredDoctors.map((doctor: Doctor) => (
            <Card key={doctor.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        Dr. {doctor.firstName} {doctor.lastName}
                      </h3>
                      <p className="text-blue-600 font-medium">{doctor.specialization}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span>{doctor.rating || 4.8}</span>
                          <span className="ml-1">({doctor.totalReviews || 127} reviews)</span>
                        </div>
                        <div className="flex items-center">
                          <Stethoscope className="h-4 w-4 mr-1" />
                          <span>{doctor.experience || 8}+ years experience</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {doctor.languages?.map((lang) => (
                          <Badge key={lang} variant="outline" className="text-xs">
                            {lang}
                          </Badge>
                        )) || (
                          <Badge variant="outline" className="text-xs">English</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-green-600">
                      ${doctor.consultationFee || 150}
                    </div>
                    <p className="text-sm text-gray-500">consultation</p>
                    <Button
                      className="mt-3"
                      onClick={() => handleDoctorSelect(doctor)}
                    >
                      Select Doctor
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No doctors found matching your search</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderDateTimeSelection = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => setStep(1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Change Doctor
        </Button>
        <div className="flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-green-600" />
          <span className="font-medium">
            Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName}
          </span>
          <Badge variant="outline">{selectedDoctor?.specialization}</Badge>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Select Date</h3>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            disabled={(date) => 
              isBefore(date, startOfToday()) || 
              isAfter(date, addDays(startOfToday(), 30))
            }
            className="rounded-md border"
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">
            Available Times - {format(selectedDate, "EEEE, MMMM d")}
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {timeSlots.length > 0 ? (
              timeSlots.map((slot) => (
                <Button
                  key={slot.time}
                  variant={slot.available ? "outline" : "ghost"}
                  disabled={!slot.available}
                  className={`w-full justify-between ${
                    !slot.available ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={() => slot.available && handleTimeSelect(slot.time, slot.type)}
                >
                  <span>{format(new Date(`2000-01-01T${slot.time}`), "h:mm a")}</span>
                  <Badge variant="secondary" className="text-xs">
                    {slot.type}
                  </Badge>
                </Button>
              ))
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No available time slots for this date</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppointmentDetails = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => setStep(2)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Change Time
        </Button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-green-600" />
            <span className="font-medium">
              Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
            <span>{format(selectedDate, "MMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-600" />
            <span>{format(new Date(`2000-01-01T${selectedTimeSlot}`), "h:mm a")}</span>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appointment Details</CardTitle>
          <CardDescription>
            Please provide information about your visit
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="appointment-type">Appointment Type</Label>
            <Select value={appointmentType} onValueChange={setAppointmentType}>
              <SelectTrigger>
                <SelectValue placeholder="Select appointment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="consultation">General Consultation</SelectItem>
                <SelectItem value="checkup">Routine Checkup</SelectItem>
                <SelectItem value="follow-up">Follow-up Visit</SelectItem>
                <SelectItem value="urgent">Urgent Care</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="reason">Reason for Visit *</Label>
            <Textarea
              id="reason"
              placeholder="Please describe the reason for your appointment..."
              value={appointmentReason}
              onChange={(e) => setAppointmentReason(e.target.value)}
              className="min-h-20"
            />
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information you'd like the doctor to know..."
              value={appointmentNotes}
              onChange={(e) => setAppointmentNotes(e.target.value)}
              className="min-h-16"
            />
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please arrive 15 minutes early for check-in. Bring a valid ID and insurance card.
            </AlertDescription>
          </Alert>

          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => setStep(2)}
              className="flex-1"
            >
              Go Back
            </Button>
            <Button
              onClick={handleBookAppointment}
              disabled={!appointmentReason || createAppointmentMutation.isPending}
              className="flex-1"
            >
              {createAppointmentMutation.isPending ? "Booking..." : "Book Appointment"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderConfirmation = () => (
    <div className="text-center py-12">
      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
      <h2 className="text-2xl font-bold mb-4">Appointment Booked Successfully!</h2>
      <div className="max-w-md mx-auto space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Doctor:</span>
                <span className="font-medium">
                  Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{format(selectedDate, "EEEE, MMMM d, yyyy")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">
                  {format(new Date(`2000-01-01T${selectedTimeSlot}`), "h:mm a")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium capitalize">{appointmentType}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Alert>
          <Phone className="h-4 w-4" />
          <AlertDescription>
            You will receive a confirmation call within 24 hours. For urgent matters, call (314) 472-3839.
          </AlertDescription>
        </Alert>

        <div className="flex gap-4">
          <Button variant="outline" onClick={() => window.location.href = "/patient-portal"}>
            Back to Portal
          </Button>
          <Button onClick={() => window.location.reload()}>
            Book Another Appointment
          </Button>
        </div>
      </div>
    </div>
  );

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
                <p className="text-xs text-gray-500">Book Appointment</p>
              </div>
            </div>
            
            <Button variant="outline" onClick={() => window.location.href = "/patient-portal"}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Portal
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {[
              { step: 1, label: "Choose Doctor", icon: User },
              { step: 2, label: "Select Time", icon: CalendarIcon },
              { step: 3, label: "Details", icon: Stethoscope },
              { step: 4, label: "Confirmed", icon: CheckCircle }
            ].map((item, index) => {
              const Icon = item.icon;
              const isActive = step === item.step;
              const isCompleted = step > item.step;
              
              return (
                <div key={item.step} className="flex items-center">
                  <div className={`flex items-center space-x-2 ${
                    isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-400"
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isActive ? "bg-blue-100" : isCompleted ? "bg-green-100" : "bg-gray-100"
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {index < 3 && (
                    <div className={`w-16 h-0.5 ml-4 ${
                      step > item.step ? "bg-green-300" : "bg-gray-200"
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <Card>
          <CardContent className="p-8">
            {step === 1 && renderDoctorSelection()}
            {step === 2 && renderDateTimeSelection()}
            {step === 3 && renderAppointmentDetails()}
            {step === 4 && renderConfirmation()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}