import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Video, Clock, User } from "lucide-react";
import { format } from "date-fns";

interface Provider {
  id: string;
  name: string;
  specialty: string;
  available: boolean;
  telemedicineEnabled: boolean;
}

interface BookingData {
  providerId: string;
  date: string;
  time: string;
  reason: string;
  symptoms?: string;
  urgency: string;
  patientNotes?: string;
}

export function TelemedicineBooking() {
  const [step, setStep] = useState(1);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [bookingForm, setBookingForm] = useState<BookingData>({
    providerId: "",
    date: "",
    time: "",
    reason: "",
    symptoms: "",
    urgency: "normal",
    patientNotes: ""
  });

  const queryClient = useQueryClient();

  // Fetch available providers with direct fetch to bypass routing issues
  const { data: providers = [], isLoading: providersLoading } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch("/api/users", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const users = await response.json();
        return users.filter((user: any) => user.role === "physician" && user.isActive);
      } catch (error) {
        console.error("Failed to fetch providers:", error);
        return [];
      }
    },
  });

  // Direct booking mutation with ultimate fallback strategy
  const createAppointmentMutation = useMutation({
    mutationFn: async (data: BookingData) => {
      try {
        const token = localStorage.getItem("auth_token");
        const requestData = {
          doctorId: data.providerId,
          appointmentDate: data.date,
          appointmentTime: data.time,
          reason: data.reason,
          type: "telemedicine",
          symptoms: data.symptoms,
          urgency: data.urgency,
          patientNotes: data.patientNotes
        };

        console.log("[BOOKING] Attempting multiple booking strategies...");
        
        // Strategy 1: XMLHttpRequest (bypasses some middleware issues)
        try {
          console.log("[BOOKING] Strategy 1: XMLHttpRequest");
          const result = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/api/patient/book-appointment', true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            
            xhr.onload = function() {
              console.log("[XHR] Status:", xhr.status);
              console.log("[XHR] Response:", xhr.responseText.substring(0, 200));
              
              if (xhr.responseText.includes('<!DOCTYPE')) {
                reject(new Error("XMLHttpRequest also received HTML"));
                return;
              }
              
              if (xhr.status >= 200 && xhr.status < 300) {
                try {
                  resolve(JSON.parse(xhr.responseText));
                } catch (e) {
                  reject(new Error("XMLHttpRequest received non-JSON response"));
                }
              } else {
                reject(new Error(`XMLHttpRequest failed: ${xhr.status}`));
              }
            };
            
            xhr.onerror = () => reject(new Error("XMLHttpRequest network error"));
            xhr.send(JSON.stringify(requestData));
          });
          
          return result;
        } catch (xhrError) {
          console.warn("[BOOKING] XMLHttpRequest failed:", xhrError);
          
          // Strategy 2: Fetch with localhost
          try {
            console.log("[BOOKING] Strategy 2: Fetch with localhost");
            const response = await fetch(`http://localhost:5000/api/patient/book-appointment`, {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
              },
              body: JSON.stringify(requestData),
            });

            const responseText = await response.text();
            console.log("[LOCALHOST] Response:", responseText.substring(0, 200));

            if (responseText.includes('<!DOCTYPE')) {
              throw new Error("Localhost fetch also received HTML");
            }

            if (!response.ok) {
              throw new Error(`Localhost fetch failed: ${response.status}`);
            }

            return JSON.parse(responseText);
          } catch (localhostError) {
            console.warn("[BOOKING] Localhost fetch failed:", localhostError);
            
            // Strategy 3: Show form submission fallback
            alert(`Booking request failed due to routing conflicts.\n\nBooking Details:\n- Provider: ${data.providerId}\n- Date: ${data.date}\n- Time: ${data.time}\n- Reason: ${data.reason}\n\nPlease contact support or try refreshing the page.`);
            
            throw new Error("All booking strategies failed - routing conflict persists");
          }
        }
      } catch (error) {
        console.error("[BOOKING] All strategies failed:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("[BOOKING] Success:", data);
      queryClient.invalidateQueries({ queryKey: ["/api/patient/appointments"] });
      setStep(4);
      
      setTimeout(() => {
        window.location.href = "/patient-portal";
      }, 3000);
    },
    onError: (error) => {
      console.error("[BOOKING] Failed:", error);
      alert("Booking failed: " + (error as Error).message);
    },
  });

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

  const handleBookingSubmit = async () => {
    if (!selectedProvider || !selectedDate || !selectedTime) {
      alert("Please complete all required fields");
      return;
    }

    console.log("[BOOKING] Submitting booking:", bookingForm);
    createAppointmentMutation.mutate(bookingForm);
  };

  const renderProviderSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Provider</h2>
        <p className="text-gray-600">Select a healthcare provider for your telemedicine consultation</p>
      </div>

      {providersLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading providers...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {providers.map((provider: any) => (
            <Card 
              key={provider.id} 
              className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-200"
              onClick={() => handleProviderSelect({
                id: provider.id,
                name: `${provider.firstName} ${provider.lastName}`,
                specialty: provider.specialty || "General Medicine",
                available: true,
                telemedicineEnabled: true
              })}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      Dr. {provider.firstName} {provider.lastName}
                    </h3>
                    <p className="text-gray-600">{provider.specialty || "General Medicine"}</p>
                    <div className="flex items-center mt-1">
                      <Video className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">Telemedicine Available</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Select
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderDateTimeSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Date & Time</h2>
        <p className="text-gray-600">Choose your preferred appointment time with Dr. {selectedProvider?.name}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Select Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="date"
              min={format(new Date(), "yyyy-MM-dd")}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="w-full"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Select Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select onValueChange={setSelectedTime}>
              <SelectTrigger>
                <SelectValue placeholder="Choose time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="09:00">9:00 AM</SelectItem>
                <SelectItem value="10:00">10:00 AM</SelectItem>
                <SelectItem value="11:00">11:00 AM</SelectItem>
                <SelectItem value="14:00">2:00 PM</SelectItem>
                <SelectItem value="15:00">3:00 PM</SelectItem>
                <SelectItem value="16:00">4:00 PM</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(1)}>
          Back
        </Button>
        <Button 
          onClick={handleDateTimeSelect}
          disabled={!selectedDate || !selectedTime}
        >
          Continue
        </Button>
      </div>
    </div>
  );

  const renderBookingDetails = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Appointment Details</h2>
        <p className="text-gray-600">Provide additional information for your consultation</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Visit *
          </label>
          <Input
            placeholder="Brief description of your concern"
            value={bookingForm.reason}
            onChange={(e) => setBookingForm(prev => ({ ...prev, reason: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Urgency Level
          </label>
          <Select 
            value={bookingForm.urgency}
            onValueChange={(value) => setBookingForm(prev => ({ ...prev, urgency: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low - Routine consultation</SelectItem>
              <SelectItem value="normal">Normal - Standard appointment</SelectItem>
              <SelectItem value="high">High - Urgent concern</SelectItem>
              <SelectItem value="emergency">Emergency - Immediate attention needed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Symptoms (Optional)
          </label>
          <Textarea
            placeholder="Describe your symptoms"
            value={bookingForm.symptoms}
            onChange={(e) => setBookingForm(prev => ({ ...prev, symptoms: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes (Optional)
          </label>
          <Textarea
            placeholder="Any additional information for your provider"
            value={bookingForm.patientNotes}
            onChange={(e) => setBookingForm(prev => ({ ...prev, patientNotes: e.target.value }))}
          />
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(2)}>
          Back
        </Button>
        <Button 
          onClick={handleBookingSubmit}
          disabled={!bookingForm.reason || createAppointmentMutation.isPending}
        >
          {createAppointmentMutation.isPending ? "Booking..." : "Book Appointment"}
        </Button>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="text-center space-y-6">
      <div className="bg-green-100 p-6 rounded-lg">
        <div className="bg-green-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-green-800 mb-2">Appointment Booked Successfully!</h2>
        <p className="text-green-700">
          Your telemedicine appointment with Dr. {selectedProvider?.name} has been scheduled.
        </p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">Appointment Details:</h3>
        <p><strong>Provider:</strong> Dr. {selectedProvider?.name}</p>
        <p><strong>Date:</strong> {selectedDate ? format(selectedDate, "MMMM d, yyyy") : ""}</p>
        <p><strong>Time:</strong> {selectedTime}</p>
        <p><strong>Type:</strong> Telemedicine Consultation</p>
      </div>

      <p className="text-gray-600">
        You will receive a confirmation email with your appointment details and video link.
        Redirecting to your patient portal...
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {step === 1 && renderProviderSelection()}
          {step === 2 && renderDateTimeSelection()}
          {step === 3 && renderBookingDetails()}
          {step === 4 && renderConfirmation()}
        </div>
      </div>
    </div>
  );
}