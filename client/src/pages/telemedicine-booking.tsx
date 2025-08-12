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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Video, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Stethoscope,
  CheckCircle,
  AlertCircle,
  Phone,
  Monitor,
  Smartphone,
  Wifi,
  Shield,
  Star,
  MapPin,
  DollarSign,
  Info,
  FileText
} from "lucide-react";
import { format, addDays, startOfToday, isSameDay, isAfter, isBefore } from "date-fns";
import { useAuth } from "@/contexts/auth-context";
import { useTenant } from "@/contexts/tenant-context-fixed";
import navimedLogo from "@assets/JPG_1753663321927.jpg";

interface Provider {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  specialization?: string;
  rating: number;
  totalReviews: number;
  isOnline: boolean;
  nextAvailable: string;
  consultationFee: number;
  languages: string[];
  experience: number;
  education: string;
  telemedicineEnabled: boolean;
}

interface TimeSlot {
  time: string;
  available: boolean;
  provider: string;
}

interface TelemedicineBooking {
  providerId: string;
  date: string;
  time: string;
  reason: string;
  symptoms: string;
  urgency: 'routine' | 'urgent' | 'same-day';
  preferredDevice: 'computer' | 'tablet' | 'smartphone';
  patientNotes?: string;
}

export default function TelemedicineBooking() {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [bookingForm, setBookingForm] = useState<TelemedicineBooking>({
    providerId: "",
    date: "",
    time: "",
    reason: "",
    symptoms: "",
    urgency: "routine",
    preferredDevice: "computer",
    patientNotes: ""
  });
  const [step, setStep] = useState(1); // 1: Provider, 2: DateTime, 3: Details, 4: Confirmation
  const [techCheckPassed, setTechCheckPassed] = useState(false);

  // Mock data - in real app this would come from API
  const providers: Provider[] = [
    {
      id: "1",
      firstName: "Dr. Sarah",
      lastName: "Johnson",
      role: "Cardiologist",
      specialization: "Heart Conditions",
      rating: 4.9,
      totalReviews: 127,
      isOnline: true,
      nextAvailable: "Today 2:00 PM",
      consultationFee: 120,
      languages: ["English", "Spanish"],
      experience: 12,
      education: "Harvard Medical School",
      telemedicineEnabled: true
    },
    {
      id: "2",
      firstName: "Dr. Michael",
      lastName: "Chen",
      role: "Primary Care",
      specialization: "Internal Medicine",
      rating: 4.8,
      totalReviews: 203,
      isOnline: true,
      nextAvailable: "Today 3:30 PM",
      consultationFee: 85,
      languages: ["English", "Mandarin"],
      experience: 8,
      education: "Johns Hopkins University",
      telemedicineEnabled: true
    },
    {
      id: "3",
      firstName: "Dr. Lisa",
      lastName: "Martinez",
      role: "Dermatologist",
      specialization: "Skin Conditions",
      rating: 4.7,
      totalReviews: 89,
      isOnline: false,
      nextAvailable: "Tomorrow 10:00 AM",
      consultationFee: 110,
      languages: ["English", "Spanish"],
      experience: 6,
      education: "Stanford Medical School",
      telemedicineEnabled: true
    }
  ];

  const timeSlots: TimeSlot[] = [
    { time: "9:00 AM", available: true, provider: "1" },
    { time: "9:30 AM", available: false, provider: "1" },
    { time: "10:00 AM", available: true, provider: "1" },
    { time: "10:30 AM", available: true, provider: "1" },
    { time: "11:00 AM", available: false, provider: "1" },
    { time: "2:00 PM", available: true, provider: "1" },
    { time: "2:30 PM", available: true, provider: "1" },
    { time: "3:00 PM", available: false, provider: "1" },
    { time: "3:30 PM", available: true, provider: "2" },
    { time: "4:00 PM", available: true, provider: "2" },
  ];

  const performTechCheck = () => {
    // Simulate tech check
    setTimeout(() => {
      setTechCheckPassed(true);
    }, 2000);
  };

  const handleProviderSelect = (provider: Provider) => {
    setSelectedProvider(provider);
    setBookingForm(prev => ({ ...prev, providerId: provider.id }));
    setStep(2);
  };

  const handleDateTimeSelect = () => {
    if (selectedDate && selectedTime) {
      setBookingForm(prev => ({
        ...prev,
        date: format(selectedDate, "yyyy-MM-dd"),
        time: selectedTime
      }));
      setStep(3);
    }
  };

  // Create appointment booking mutation
  const createAppointmentMutation = useMutation({
    mutationFn: async (bookingData: TelemedicineBooking) => {
      console.log('[BOOKING] Sending appointment booking request:', bookingData);
      
      const { apiRequest } = await import("@/lib/queryClient");
      const requestData = {
        doctorId: bookingData.providerId,
        appointmentDate: bookingData.date,
        appointmentTime: bookingData.time,
        reason: bookingData.reason,
        type: "telemedicine",
        symptoms: bookingData.symptoms,
        urgency: bookingData.urgency,
        patientNotes: bookingData.patientNotes
      };
      
      console.log('[BOOKING] Request payload:', requestData);
      
      return apiRequest("/api/patient/book-appointment", {
        method: "POST",
        body: JSON.stringify(requestData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patient/appointments"] });
      setStep(4);
      
      // Show success and redirect after delay
      setTimeout(() => {
        window.location.href = "/patient-portal";
      }, 3000);
    },
    onError: (error) => {
      console.error("Booking failed:", error);
      alert("Booking failed: " + (error as Error).message);
    },
  });

  const handleBookingSubmit = async () => {
    if (!selectedProvider || !selectedDate || !selectedTime) {
      alert("Please complete all required fields");
      return;
    }

    createAppointmentMutation.mutate(bookingForm);
  };

  const renderProviderSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Provider</h2>
        <p className="text-gray-600">Select a healthcare provider for your telemedicine consultation</p>
      </div>

      <div className="grid gap-4">
        {providers.filter(p => p.telemedicineEnabled).map((provider) => (
          <Card 
            key={provider.id} 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedProvider?.id === provider.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => handleProviderSelect(provider)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Stethoscope className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{provider.firstName} {provider.lastName}</h3>
                      <p className="text-gray-600">{provider.role}</p>
                      {provider.specialization && (
                        <p className="text-sm text-gray-500">{provider.specialization}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm">{provider.rating} ({provider.totalReviews} reviews)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{provider.experience} years experience</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">${provider.consultationFee} consultation</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${provider.isOnline ? 'bg-green-400' : 'bg-gray-400'}`} />
                        <span className="text-sm">{provider.isOnline ? 'Online Now' : 'Offline'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">Next: {provider.nextAvailable}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{provider.languages.join(", ")}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Badge 
                  variant={provider.isOnline ? "default" : "secondary"}
                  className={provider.isOnline ? "bg-green-100 text-green-800" : ""}
                >
                  {provider.isOnline ? "Available Now" : "Schedule Later"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderDateTimeSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Date & Time</h2>
        <p className="text-gray-600">Choose when you'd like to have your consultation with {selectedProvider?.firstName} {selectedProvider?.lastName}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => 
                isBefore(date, startOfToday()) || 
                isAfter(date, addDays(startOfToday(), 30))
              }
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Time Slots */}
        <Card>
          <CardHeader>
            <CardTitle>Available Times</CardTitle>
            <CardDescription>
              {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "Select a date"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              <div className="grid grid-cols-2 gap-2">
                {timeSlots
                  .filter(slot => slot.provider === selectedProvider?.id && slot.available)
                  .map((slot) => (
                    <Button
                      key={slot.time}
                      variant={selectedTime === slot.time ? "default" : "outline"}
                      className="justify-center"
                      onClick={() => setSelectedTime(slot.time)}
                    >
                      {slot.time}
                    </Button>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Please select a date first</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(1)}>
          Back to Providers
        </Button>
        <Button 
          onClick={handleDateTimeSelect}
          disabled={!selectedDate || !selectedTime}
        >
          Continue to Details
        </Button>
      </div>
    </div>
  );

  const renderBookingDetails = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Consultation Details</h2>
        <p className="text-gray-600">Tell us about your health concerns and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Consultation Info */}
        <Card>
          <CardHeader>
            <CardTitle>Consultation Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="reason">Reason for Visit *</Label>
              <Select 
                value={bookingForm.reason} 
                onValueChange={(value) => setBookingForm(prev => ({ ...prev, reason: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select reason for visit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">Routine Check-up</SelectItem>
                  <SelectItem value="follow-up">Follow-up Appointment</SelectItem>
                  <SelectItem value="symptoms">New Symptoms</SelectItem>
                  <SelectItem value="medication">Medication Review</SelectItem>
                  <SelectItem value="second-opinion">Second Opinion</SelectItem>
                  <SelectItem value="mental-health">Mental Health</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="symptoms">Symptoms/Concerns</Label>
              <Textarea
                id="symptoms"
                placeholder="Describe your symptoms or health concerns..."
                value={bookingForm.symptoms}
                onChange={(e) => setBookingForm(prev => ({ ...prev, symptoms: e.target.value }))}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="urgency">Urgency Level</Label>
              <Select 
                value={bookingForm.urgency} 
                onValueChange={(value: 'routine' | 'urgent' | 'same-day') => 
                  setBookingForm(prev => ({ ...prev, urgency: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">Routine (can wait)</SelectItem>
                  <SelectItem value="urgent">Urgent (within 24 hours)</SelectItem>
                  <SelectItem value="same-day">Same Day (ASAP)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional information for your provider..."
                value={bookingForm.patientNotes}
                onChange={(e) => setBookingForm(prev => ({ ...prev, patientNotes: e.target.value }))}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Technical Setup */}
        <Card>
          <CardHeader>
            <CardTitle>Technical Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Preferred Device</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {[
                  { value: 'computer', icon: Monitor, label: 'Computer' },
                  { value: 'tablet', icon: Smartphone, label: 'Tablet' },
                  { value: 'smartphone', icon: Phone, label: 'Phone' }
                ].map((device) => {
                  const Icon = device.icon;
                  return (
                    <Button
                      key={device.value}
                      variant={bookingForm.preferredDevice === device.value ? "default" : "outline"}
                      className="h-16 flex-col"
                      onClick={() => setBookingForm(prev => ({ ...prev, preferredDevice: device.value as any }))}
                    >
                      <Icon className="h-5 w-5 mb-1" />
                      <span className="text-xs">{device.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-2">System Requirements Check</h4>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={performTechCheck}
                disabled={techCheckPassed}
              >
                {techCheckPassed ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    System Check Passed
                  </>
                ) : (
                  <>
                    <Wifi className="h-4 w-4 mr-2" />
                    Run System Check
                  </>
                )}
              </Button>
              
              {techCheckPassed && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircle className="h-3 w-3 mr-2" />
                    Camera: Working
                  </div>
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircle className="h-3 w-3 mr-2" />
                    Microphone: Working
                  </div>
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircle className="h-3 w-3 mr-2" />
                    Internet: Strong Connection
                  </div>
                </div>
              )}
            </div>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Your video consultation will be encrypted and HIPAA-compliant. 
                No recordings will be made without your consent.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(2)}>
          Back to Date & Time
        </Button>
        <Button 
          onClick={handleBookingSubmit}
          disabled={!bookingForm.reason || !techCheckPassed || createAppointmentMutation.isPending}
        >
          {createAppointmentMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Booking...
            </>
          ) : (
            "Book Consultation"
          )}
        </Button>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Consultation Booked!</h2>
        <p className="text-gray-600">Your telemedicine appointment has been successfully scheduled</p>
      </div>

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Appointment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Provider:</span>
            <span className="font-medium">{selectedProvider?.firstName} {selectedProvider?.lastName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Date:</span>
            <span className="font-medium">{format(selectedDate, "MMMM d, yyyy")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Time:</span>
            <span className="font-medium">{selectedTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Type:</span>
            <span className="font-medium">Video Consultation</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Cost:</span>
            <span className="font-medium">${selectedProvider?.consultationFee}</span>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            You'll receive a confirmation email with join instructions. 
            Please join 5 minutes early to test your connection.
          </AlertDescription>
        </Alert>
        
        <p className="text-sm text-gray-500">
          Redirecting to patient portal in a few seconds...
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <img src={navimedLogo} alt="NaviMed" className="h-8 w-8 rounded-lg object-contain" />
              <div>
                <h1 className="text-lg font-semibold text-blue-600">NAVIMED Telemedicine</h1>
                <p className="text-sm text-gray-500">Schedule your video consultation</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => window.location.href = "/patient-portal"}>
                Back to Portal
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {[
              { step: 1, label: "Choose Provider", icon: User },
              { step: 2, label: "Select Time", icon: CalendarIcon },
              { step: 3, label: "Details", icon: FileText },
              { step: 4, label: "Confirmed", icon: CheckCircle }
            ].map((item, index) => {
              const Icon = item.icon;
              const isActive = step === item.step;
              const isCompleted = step > item.step;
              
              return (
                <div key={item.step} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-8 h-8 rounded-full border-2 
                    ${isCompleted ? 'bg-green-600 border-green-600 text-white' : 
                      isActive ? 'bg-blue-600 border-blue-600 text-white' : 
                      'border-gray-300 text-gray-400'}
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {item.label}
                  </span>
                  {index < 3 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      step > item.step ? 'bg-green-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {step === 1 && renderProviderSelection()}
        {step === 2 && renderDateTimeSelection()}
        {step === 3 && renderBookingDetails()}
        {step === 4 && renderConfirmation()}
      </div>
    </div>
  );
}