import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { 
  UserPlus, 
  Users, 
  Calendar,
  Clock,
  Activity,
  Search,
  CheckCircle,
  AlertCircle,
  User,
  Heart,
  FileText,
  Shield,
  Plus,
  Edit,
  CreditCard,
  Mail,
  Phone,
  DollarSign
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from '@/contexts/translation-context';
import { useToast } from '@/hooks/use-toast';
import OverviewCards from '@/components/receptionist/overview-cards';
import PatientRegistrationDialog from '@/components/receptionist/patient-registration-dialog';
import VitalSignsDialog from '@/components/receptionist/vital-signs-dialog';

// Form schemas
const patientRegistrationSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().min(1, 'Gender is required'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(5, 'ZIP code is required'),
  }),
  emergencyContact: z.object({
    name: z.string().min(1, 'Emergency contact name is required'),
    relationship: z.string().min(1, 'Relationship is required'),
    phone: z.string().min(10, 'Emergency contact phone is required'),
  }),
  insuranceInfo: z.object({
    provider: z.string().optional(),
    policyNumber: z.string().optional(),
    groupNumber: z.string().optional(),
  }),
});

const checkInSchema = z.object({
  reasonForVisit: z.string().min(1, 'Reason for visit is required'),
  priorityLevel: z.enum(['low', 'normal', 'high', 'urgent', 'emergency']).default('normal'),
  chiefComplaint: z.string().optional(),
  insuranceVerified: z.boolean().default(false),
});

const vitalSignsSchema = z.object({
  // Required Vital Signs - Essential measurements
  systolicBp: z.number().min(60, "Systolic BP must be at least 60").max(300, "Systolic BP cannot exceed 300"),
  diastolicBp: z.number().min(30, "Diastolic BP must be at least 30").max(200, "Diastolic BP cannot exceed 200"),
  heartRate: z.number().min(30, "Heart rate must be at least 30").max(250, "Heart rate cannot exceed 250"),
  temperature: z.number().min(90, "Temperature seems too low").max(115, "Temperature seems too high"),
  temperatureUnit: z.enum(['F', 'C']).default('F'),
  oxygenSaturation: z.number().min(70, "O2 saturation must be at least 70%").max(100, "O2 saturation cannot exceed 100%"),
  weight: z.number().min(1, "Weight is required").max(1000, "Weight cannot exceed 1000"),
  weightUnit: z.enum(['lbs', 'kg']).default('lbs'),
  height: z.number().min(12, "Height is required").max(96, "Height cannot exceed 96 inches"),
  heightUnit: z.enum(['inches', 'cm']).default('inches'),
  respiratoryRate: z.number().min(8, "Respiratory rate must be at least 8").max(60, "Respiratory rate cannot exceed 60"),
  // Required Blood Type and Pain Assessment
  bloodType: z.string().min(1, "Blood type is required"),
  painLevel: z.number().min(0).max(10, "Pain level must be 0-10"),
  // Additional Important Measurements
  glucoseLevel: z.number().min(50).max(500).optional(),
  bmi: z.number().optional(),
  // Medical History
  allergies: z.string().optional(),
  currentMedications: z.string().optional(),
  notes: z.string().optional(),
});



type Patient = {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  email?: string;
  isActive: boolean;
};

type CheckIn = {
  id: string;
  patientId: string;
  appointmentId?: string;
  checkedInAt: string;
  reasonForVisit: string;
  priorityLevel: string;
  status: string;
  patient: Patient;
};

export default function ReceptionistDashboard() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedCheckIn, setSelectedCheckIn] = useState<CheckIn | null>(null);
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [isCheckInDialogOpen, setIsCheckInDialogOpen] = useState(false);
  const [isVitalsDialogOpen, setIsVitalsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('Emergency');
  const [selectedPatientForInsurance, setSelectedPatientForInsurance] = useState<Patient | null>(null);
  const [showInsuranceDialog, setShowInsuranceDialog] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState<any>(null);
  
  // Appointment booking state
  const [selectedAppointmentDate, setSelectedAppointmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [appointmentPatient, setAppointmentPatient] = useState<Patient | null>(null);
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
  const [appointmentReason, setAppointmentReason] = useState('');

  // Forms
  const patientForm = useForm({
    resolver: zodResolver(patientRegistrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      phone: '',
      email: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
      },
      emergencyContact: {
        name: '',
        relationship: '',
        phone: '',
      },
      insuranceInfo: {
        provider: '',
        policyNumber: '',
        groupNumber: '',
      },
    },
  });

  const vitalSignsForm = useForm({
    resolver: zodResolver(vitalSignsSchema),
    defaultValues: {
      temperatureUnit: 'F',
      weightUnit: 'lbs',
      heightUnit: 'inches',
    },
  });

  const checkInForm = useForm({
    resolver: zodResolver(checkInSchema),
    defaultValues: {
      reasonForVisit: '',
      priorityLevel: 'normal',
      insuranceVerified: false,
    },
  });

  // Queries
  const { data: todayCheckIns = [], isLoading: loadingCheckIns } = useQuery({
    queryKey: ['/api/patient-check-ins/today'],
  });

  const { data: waitingPatients = [], isLoading: loadingWaiting } = useQuery({
    queryKey: ['/api/patient-check-ins/waiting'],
  });

  const { data: todayAppointments = [], isLoading: loadingAppointments } = useQuery({
    queryKey: ['/api/appointments/date', new Date().toISOString().split('T')[0]],
  });

  const { data: recentPatients = [], isLoading: loadingPatients } = useQuery({
    queryKey: ['/api/patients'],
  });

  // Fetch available physicians for appointment booking
  const { data: availablePhysicians = [], isLoading: loadingPhysicians } = useQuery({
    queryKey: ['/api/available-physicians'],
  });

  // Query for insurance info for selected patient
  const { data: patientInsurance, isLoading: insuranceLoading } = useQuery({
    queryKey: ["/api/hospital-patient-insurance", selectedPatientForInsurance?.id],
    enabled: !!selectedPatientForInsurance?.id,
  });

  // Mutations
  const [isRegistering, setIsRegistering] = useState(false);

  const checkInPatientMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('Check-in mutation starting with data:', data);
      try {
        const response = await apiRequest('/api/patient-check-ins', {
          method: 'POST',
          body: data,
        });
        console.log('Check-in API response:', response);
        return response;
      } catch (error) {
        console.error('Check-in API error:', error);
        throw error;
      }
    },
    onSuccess: (response) => {
      console.log('Check-in mutation success:', response);
      queryClient.invalidateQueries({ queryKey: ['/api/patient-check-ins/today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/patient-check-ins/waiting'] });
      setIsCheckInDialogOpen(false);
      checkInForm.reset();
      
      // Success toast notification
      toast({
        title: "Patient Checked In Successfully!",
        description: "Patient has been checked in and is now waiting.",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error('Check-in mutation failed:', error);
      toast({
        title: "Check-in Failed",
        description: `Failed to check in patient: ${error.message || 'Please try again.'}`,
        variant: "destructive",
      });
    },
  });

  const recordVitalsMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/vital-signs', {
      method: 'POST',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/patient-check-ins/today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/patient-check-ins/waiting'] });
      setIsVitalsDialogOpen(false);
      vitalSignsForm.reset();
      
      // Success toast notification
      toast({
        title: "Vital Signs Recorded Successfully!",
        description: "Patient vital signs have been saved.",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error('Vital signs recording failed:', error);
      toast({
        title: "Recording Failed",
        description: "Failed to record vital signs. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation to create/update hospital patient insurance
  const saveInsuranceMutation = useMutation({
    mutationFn: (data: any) => {
      if (editingInsurance) {
        return apiRequest(`/api/hospital-patient-insurance/${editingInsurance.id}`, {
          method: "PATCH",
          body: data,
        });
      } else {
        return apiRequest("/api/hospital-patient-insurance", {
          method: "POST",
          body: data,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/hospital-patient-insurance", selectedPatientForInsurance?.id] 
      });
      setShowInsuranceDialog(false);
      setEditingInsurance(null);
      
      // Success toast notification
      toast({
        title: "Insurance Saved Successfully!",
        description: "Patient insurance information has been updated.",
        variant: "default",
      });
    },
    onError: (error: any) => {
      console.error("Failed to save insurance information:", error);
      
      let errorMessage = error.message || 'Please try again.';
      
      // Handle authentication errors
      if (error.message?.includes('401') || error.message?.includes('Authentication failed')) {
        errorMessage = 'Your session has expired. Please log in again.';
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
      
      toast({
        title: "Insurance Save Failed",
        description: `Failed to save insurance information: ${errorMessage}`,
        variant: "destructive",
      });
    },
  });

  // Appointment booking mutation
  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      const response = await apiRequest('/api/appointments', {
        method: 'POST',
        body: appointmentData,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/appointments/date'] });
      setIsAppointmentDialogOpen(false);
      toast({
        title: "Appointment Scheduled Successfully!",
        description: "The appointment has been scheduled and patient notified.",
        variant: "default",
      });
      // Reset form
      setSelectedDoctor(null);
      setSelectedTimeSlot('');
      setAppointmentPatient(null);
      setAppointmentReason('');
    },
    onError: (error: any) => {
      toast({
        title: "Appointment Scheduling Failed",
        description: error.message || "Failed to schedule appointment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Generate available time slots for a doctor on a specific date
  const generateTimeSlots = (date: string) => {
    const slots = [];
    const selectedDate = new Date(date);
    const today = new Date();
    const isToday = selectedDate.toDateString() === today.toDateString();
    const currentHour = today.getHours();
    
    // Generate slots from 8 AM to 6 PM (18:00)
    for (let hour = 8; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        // Skip past times for today
        if (isToday && hour <= currentHour) {
          continue;
        }
        
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Check if this slot is already booked
        const isBooked = todayAppointments.some((apt: any) => {
          const aptDate = new Date(apt.appointmentDate);
          const aptTime = aptDate.getHours() + ':' + aptDate.getMinutes().toString().padStart(2, '0');
          return aptDate.toDateString() === selectedDate.toDateString() && 
                 aptTime === timeString && 
                 apt.providerId === selectedDoctor?.id;
        });
        
        slots.push({
          time: timeString,
          available: !isBooked,
          label: hour < 12 ? `${timeString} AM` : `${timeString} PM`
        });
      }
    }
    
    return slots;
  };

  // Handlers
  const handlePatientRegistration = async (data: any) => {
    console.log('Starting patient registration with data:', data);
    setIsRegistering(true);
    try {
      // Create patient only (no vital signs during registration)
      const response = await apiRequest("/api/patients", {
        method: "POST",
        body: data, // apiRequest handles JSON.stringify automatically
      });
      
      console.log('Patient registration successful:', response);
      queryClient.invalidateQueries({ queryKey: ['/api/patients'] });
      setIsRegisterDialogOpen(false);
      
      // Success toast notification
      toast({
        title: "Patient Registered Successfully!",
        description: `${data.firstName} ${data.lastName} has been added to the system.`,
        variant: "default",
      });
      
    } catch (error) {
      console.error('Error registering patient:', error);
      
      // Error toast notification
      toast({
        title: "Registration Failed",
        description: "Failed to register patient. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleCheckIn = (data: any) => {
    if (selectedPatient) {
      checkInPatientMutation.mutate({
        ...data,
        patientId: selectedPatient.id,
      });
    }
  };

  const handleVitalSigns = (data: any) => {
    if (selectedCheckIn) {
      // Transform the form data to match the backend expected format
      const vitalSignsData = {
        patientId: selectedCheckIn.patientId,
        checkInId: selectedCheckIn.id,
        appointmentId: selectedCheckIn.appointmentId || null,
        systolicBp: data.systolicBp,
        diastolicBp: data.diastolicBp,
        heartRate: data.heartRate,
        temperature: data.temperature?.toString(),
        temperatureUnit: data.temperatureUnit || 'F',
        respiratoryRate: data.respiratoryRate,
        oxygenSaturation: data.oxygenSaturation,
        weight: data.weight?.toString(),
        weightUnit: data.weightUnit || 'lbs',
        height: data.height?.toString(),
        heightUnit: data.heightUnit || 'inches',
        bloodType: data.bloodType,
        painLevel: data.painLevel,
        glucoseLevel: data.glucoseLevel,
        allergies: data.allergies,
        currentMedications: data.currentMedications,
        notes: data.notes
      };
      
      // Use the mutation for consistent error handling and notifications
      recordVitalsMutation.mutate(vitalSignsData);
    }
  };

  const handleSaveInsurance = (formData: FormData) => {
    const data = {
      patientId: selectedPatientForInsurance?.id,
      insuranceProviderName: formData.get("insuranceProviderName"),
      policyNumber: formData.get("policyNumber"),
      groupNumber: formData.get("groupNumber") || undefined,
      memberId: formData.get("memberId") || undefined,
      cardholderName: formData.get("cardholderName"),
      relationshipToCardholder: formData.get("relationshipToCardholder"),
      effectiveDate: formData.get("effectiveDate") || undefined,
      expirationDate: formData.get("expirationDate") || undefined,
      copayAmount: formData.get("copayAmount") ? parseFloat(formData.get("copayAmount") as string) : undefined,
      deductibleAmount: formData.get("deductibleAmount") ? parseFloat(formData.get("deductibleAmount") as string) : undefined,
      coveragePercentage: formData.get("coveragePercentage") ? parseInt(formData.get("coveragePercentage") as string) : undefined,
      isPrimary: formData.get("isPrimary") === "true",
      isActive: formData.get("isActive") === "true",
      verificationStatus: formData.get("verificationStatus"),
    };

    saveInsuranceMutation.mutate(data);
  };

  const handleEditInsurance = () => {
    if (patientInsurance) {
      setEditingInsurance(patientInsurance);
      setShowInsuranceDialog(true);
    }
  };

  const handleAddInsurance = () => {
    setEditingInsurance(null);
    setShowInsuranceDialog(true);
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'bg-red-100 text-red-800 border-red-200';
      case 'urgent': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'high': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredPatients = recentPatients.filter((patient: Patient) => 
    patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.mrn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('receptionist-dashboard')}</h1>
          <p className="text-gray-600 mt-1">{t('patient-registration-checkin-vitals')}</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Department Selection */}
          <select 
            value={selectedDepartment} 
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Emergency">Emergency</option>
            <option value="Internal Medicine">Internal Medicine</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="Surgery">Surgery</option>
          </select>
          
          <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="h-4 w-4 mr-2" />
                {t('register-patient')}
              </Button>
            </DialogTrigger>
            <PatientRegistrationDialog
              onSubmit={handlePatientRegistration}
              isLoading={isRegistering}
              department={selectedDepartment}
            />
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
          <TabsTrigger value="check-in">{t('patient-checkin')}</TabsTrigger>
          <TabsTrigger value="waiting">{t('waiting-room')}</TabsTrigger>
          <TabsTrigger value="vitals">{t('vital-signs')}</TabsTrigger>
          <TabsTrigger value="patients">{t('patient-search')}</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="insurance">Insurance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewCards 
            todayCheckIns={todayCheckIns}
            waitingPatients={waitingPatients}
            todayAppointments={todayAppointments}
          />
          
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>{t('recent-activity')}</CardTitle>
              <CardDescription>{t('latest-patient-check-ins')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todayCheckIns.slice(0, 5).map((checkIn: CheckIn) => (
                  <div key={checkIn.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">
                          {checkIn.patient.firstName} {checkIn.patient.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{checkIn.reasonForVisit}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityBadgeColor(checkIn.priorityLevel)}>
                        {checkIn.priorityLevel}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(checkIn.checkedInAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
                {todayCheckIns.length === 0 && (
                  <p className="text-center text-gray-500 py-4">{t('no-check-ins-today')}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="check-in" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('patient-check-in')}</CardTitle>
              <CardDescription>{t('search-and-check-in-patients')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-500" />
                <Input
                  placeholder={t('search-by-name-or-mrn')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
              </div>
              
              <div className="grid gap-3">
                {filteredPatients.slice(0, 10).map((patient: Patient) => (
                  <div 
                    key={patient.id} 
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedPatient(patient)}
                  >
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">
                          {patient.firstName} {patient.lastName}
                        </p>
                        <p className="text-sm text-gray-500">MRN: {patient.mrn}</p>
                      </div>
                    </div>
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPatient(patient);
                        setIsCheckInDialogOpen(true);
                      }}
                      size="sm"
                    >
                      {t('check-in')}
                    </Button>
                  </div>
                ))}
                {filteredPatients.length === 0 && searchTerm && (
                  <p className="text-center text-gray-500 py-4">{t('no-patients-found')}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="waiting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                {t('waiting-room')} ({waitingPatients.length})
              </CardTitle>
              <CardDescription>{t('patients-waiting-to-be-seen')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {waitingPatients.map((checkIn: CheckIn) => (
                  <div key={checkIn.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">
                          {checkIn.patient.firstName} {checkIn.patient.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{checkIn.reasonForVisit}</p>
                        <p className="text-xs text-gray-400">
                          {t('checked-in')}: {new Date(checkIn.checkedInAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityBadgeColor(checkIn.priorityLevel)}>
                        {checkIn.priorityLevel}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedCheckIn(checkIn);
                          setIsVitalsDialogOpen(true);
                        }}
                      >
                        <Heart className="h-4 w-4 mr-1" />
                        {t('vitals')}
                      </Button>
                    </div>
                  </div>
                ))}
                {waitingPatients.length === 0 && (
                  <p className="text-center text-gray-500 py-8">{t('no-patients-waiting')}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vitals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                {t('vital-signs-management')}
              </CardTitle>
              <CardDescription>{t('record-and-view-patient-vitals')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todayCheckIns.map((checkIn: CheckIn) => (
                  <div key={checkIn.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">
                          {checkIn.patient.firstName} {checkIn.patient.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{checkIn.reasonForVisit}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {checkIn.vitalSigns ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {t('completed')}
                        </Badge>
                      ) : (
                        <Badge className="bg-orange-100 text-orange-800">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {t('pending')}
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        variant={checkIn.vitalSigns ? "outline" : "default"}
                        onClick={() => {
                          setSelectedCheckIn(checkIn);
                          setIsVitalsDialogOpen(true);
                        }}
                      >
                        <Heart className="h-4 w-4 mr-1" />
                        {checkIn.vitalSigns ? t('edit-vitals') : t('record-vitals')}
                      </Button>
                    </div>
                  </div>
                ))}
                {todayCheckIns.length === 0 && (
                  <p className="text-center text-gray-500 py-8">{t('no-checked-in-patients')}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insurance Management Tab */}
        <TabsContent value="insurance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Patient List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Select Patient for Insurance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {loadingPatients ? (
                    <div>Loading patients...</div>
                  ) : (
                    filteredPatients.map((patient: Patient) => (
                      <div
                        key={patient.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedPatientForInsurance?.id === patient.id
                            ? "bg-blue-50 border-blue-200"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedPatientForInsurance(patient)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">
                              {patient.firstName} {patient.lastName}
                            </h3>
                            <p className="text-sm text-gray-600">MRN: {patient.mrn}</p>
                            {patient.email && (
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {patient.email}
                              </p>
                            )}
                            {patient.phone && (
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {patient.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Insurance Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Insurance Information
                  {selectedPatientForInsurance && (
                    <span className="text-sm font-normal text-gray-600">
                      - {selectedPatientForInsurance.firstName} {selectedPatientForInsurance.lastName}
                    </span>
                  )}
                </CardTitle>
                {selectedPatientForInsurance && (
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={handleAddInsurance}
                      disabled={!!patientInsurance}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Insurance
                    </Button>
                    {patientInsurance && (
                      <Button size="sm" variant="outline" onClick={handleEditInsurance}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Insurance
                      </Button>
                    )}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {!selectedPatientForInsurance ? (
                  <p className="text-gray-600 text-center py-8">
                    Select a patient to view insurance information
                  </p>
                ) : insuranceLoading ? (
                  <div>Loading insurance information...</div>
                ) : patientInsurance ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Insurance Provider</label>
                        <p className="text-sm">{patientInsurance.insuranceProviderName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Policy Number</label>
                        <p className="text-sm font-mono">{patientInsurance.policyNumber}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Coverage Percentage</label>
                        <p className="text-sm font-semibold text-green-600">{patientInsurance.coveragePercentage}%</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Verification Status</label>
                        <Badge variant={
                          patientInsurance.verificationStatus === 'verified' ? 'default' :
                          patientInsurance.verificationStatus === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {patientInsurance.verificationStatus}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">No insurance information found</p>
                    <Button onClick={handleAddInsurance}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Insurance Information
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                {t('patient-search')}
              </CardTitle>
              <CardDescription>{t('search-and-manage-patients')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-500" />
                <Input
                  placeholder={t('search-patients')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
              </div>
              
              <div className="grid gap-3">
                {filteredPatients.map((patient: Patient) => (
                  <div key={patient.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">
                          {patient.firstName} {patient.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          MRN: {patient.mrn} | DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">Phone: {patient.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedPatient(patient);
                          setIsCheckInDialogOpen(true);
                        }}
                      >
                        {t('check-in')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Appointment Booking
              </CardTitle>
              <CardDescription>Schedule appointments with doctor availability</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date and Doctor Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Date</label>
                  <input
                    type="date"
                    value={selectedAppointmentDate}
                    onChange={(e) => setSelectedAppointmentDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Select Doctor</label>
                  <select
                    value={selectedDoctor?.id || ''}
                    onChange={(e) => {
                      const doctor = availablePhysicians.find((d: any) => d.id === e.target.value);
                      setSelectedDoctor(doctor);
                      setSelectedTimeSlot(''); // Reset time slot when doctor changes
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a doctor...</option>
                    {availablePhysicians.map((doctor: any) => (
                      <option key={doctor.id} value={doctor.id}>
                        Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization || 'General Medicine'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Doctor Availability - Time Slots */}
              {selectedDoctor && (
                <div>
                  <label className="block text-sm font-medium mb-3">Available Time Slots for Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {generateTimeSlots(selectedAppointmentDate).map((slot) => (
                      <Button
                        key={slot.time}
                        variant={selectedTimeSlot === slot.time ? "default" : "outline"}
                        size="sm"
                        disabled={!slot.available}
                        onClick={() => setSelectedTimeSlot(slot.time)}
                        className={`text-xs ${!slot.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {slot.label}
                        {!slot.available && (
                          <span className="ml-1 text-red-500">✕</span>
                        )}
                      </Button>
                    ))}
                  </div>
                  {generateTimeSlots(selectedAppointmentDate).filter(s => s.available).length === 0 && (
                    <p className="text-center text-gray-500 mt-4 py-4">
                      No available time slots for this date. Please select another date.
                    </p>
                  )}
                </div>
              )}

              {/* Schedule Appointment Button */}
              {selectedDoctor && selectedTimeSlot && (
                <div className="border-t pt-4">
                  <Button
                    onClick={() => setIsAppointmentDialogOpen(true)}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Appointment for {selectedAppointmentDate} at {selectedTimeSlot}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today's Appointments Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Today's Appointments ({todayAppointments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todayAppointments.length > 0 ? (
                  todayAppointments.slice(0, 5).map((appointment: any) => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">
                            {new Date(appointment.appointmentDate).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          <p className="text-sm text-gray-500">
                            Patient ID: {appointment.patientId?.slice(-8)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">Dr. {appointment.provider?.firstName || 'Provider'}</p>
                        <Badge variant={
                          appointment.status === 'scheduled' ? 'secondary' :
                          appointment.status === 'confirmed' ? 'default' :
                          appointment.status === 'in_progress' ? 'destructive' : 'outline'
                        }>
                          {appointment.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No appointments scheduled for today</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={isCheckInDialogOpen} onOpenChange={setIsCheckInDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('patient-check-in')}</DialogTitle>
            <DialogDescription>
              {selectedPatient && `${t('patient')}: ${selectedPatient.firstName} ${selectedPatient.lastName}`}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...checkInForm}>
            <form onSubmit={checkInForm.handleSubmit(handleCheckIn)} className="space-y-4">
              <FormField
                control={checkInForm.control}
                name="reasonForVisit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('reason-for-visit')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('enter-reason-for-visit')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={checkInForm.control}
                name="priorityLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('priority-level')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('select-priority')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">{t('low')}</SelectItem>
                        <SelectItem value="normal">{t('normal')}</SelectItem>
                        <SelectItem value="high">{t('high')}</SelectItem>
                        <SelectItem value="urgent">{t('urgent')}</SelectItem>
                        <SelectItem value="emergency">{t('emergency')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={checkInForm.control}
                name="chiefComplaint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('chief-complaint')} ({t('optional')})</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder={t('describe-main-symptoms')} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={checkInForm.control}
                name="insuranceVerified"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>{t('insurance-verified')}</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCheckInDialogOpen(false)}>
                  {t('cancel')}
                </Button>
                <Button type="submit" disabled={checkInPatientMutation.isPending}>
                  {checkInPatientMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('check-in')}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isVitalsDialogOpen} onOpenChange={setIsVitalsDialogOpen}>
        <VitalSignsDialog
          form={vitalSignsForm}
          onSubmit={handleVitalSigns}
          isLoading={recordVitalsMutation.isPending}
          patient={selectedCheckIn?.patient}
        />
      </Dialog>

      {/* Insurance Dialog */}
      <Dialog open={showInsuranceDialog} onOpenChange={setShowInsuranceDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingInsurance ? "Edit" : "Add"} Insurance Information
            </DialogTitle>
          </DialogHeader>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveInsurance(new FormData(e.currentTarget));
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="insuranceProviderName">Insurance Provider*</label>
                <Input
                  id="insuranceProviderName"
                  name="insuranceProviderName"
                  defaultValue={editingInsurance?.insuranceProviderName}
                  required
                />
              </div>
              <div>
                <label htmlFor="policyNumber">Policy Number*</label>
                <Input
                  id="policyNumber"
                  name="policyNumber"
                  defaultValue={editingInsurance?.policyNumber}
                  required
                />
              </div>
              <div>
                <label htmlFor="coveragePercentage">Coverage Percentage (%)*</label>
                <Input
                  id="coveragePercentage"
                  name="coveragePercentage"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  placeholder="80"
                  defaultValue={editingInsurance?.coveragePercentage}
                  required
                />
              </div>
              <div>
                <label htmlFor="cardholderName">Cardholder Name*</label>
                <Input
                  id="cardholderName"
                  name="cardholderName"
                  defaultValue={editingInsurance?.cardholderName}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowInsuranceDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveInsuranceMutation.isPending}>
                {saveInsuranceMutation.isPending ? "Saving..." : "Save Insurance"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Appointment Booking Dialog */}
      <Dialog open={isAppointmentDialogOpen} onOpenChange={setIsAppointmentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule New Appointment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Patient Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Select Patient</label>
              <select
                value={appointmentPatient?.id || ''}
                onChange={(e) => {
                  const patient = recentPatients.find((p: Patient) => p.id === e.target.value);
                  setAppointmentPatient(patient);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Choose a patient...</option>
                {recentPatients.map((patient: Patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.firstName} {patient.lastName} - MRN: {patient.mrn}
                  </option>
                ))}
              </select>
            </div>

            {/* Appointment Details */}
            <div className="bg-gray-50 p-3 rounded-md">
              <h4 className="font-medium text-sm mb-2">Appointment Summary</h4>
              <div className="space-y-1 text-sm">
                <p><strong>Date:</strong> {new Date(selectedAppointmentDate).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {selectedTimeSlot}</p>
                <p><strong>Doctor:</strong> Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName}</p>
                <p><strong>Patient:</strong> {appointmentPatient?.firstName} {appointmentPatient?.lastName}</p>
              </div>
            </div>

            {/* Reason for Visit */}
            <div>
              <label className="block text-sm font-medium mb-2">Reason for Visit</label>
              <textarea
                value={appointmentReason}
                onChange={(e) => setAppointmentReason(e.target.value)}
                placeholder="Brief description of the visit purpose..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsAppointmentDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (appointmentPatient && appointmentReason.trim()) {
                    const appointmentDateTime = new Date(selectedAppointmentDate);
                    const [hours, minutes] = selectedTimeSlot.split(':');
                    appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));

                    createAppointmentMutation.mutate({
                      patientId: appointmentPatient.id,
                      providerId: selectedDoctor.id,
                      appointmentDate: appointmentDateTime.toISOString(),
                      duration: 30,
                      type: 'consultation',
                      status: 'scheduled',
                      notes: appointmentReason,
                      chiefComplaint: appointmentReason
                    });
                  }
                }}
                disabled={!appointmentPatient || !appointmentReason.trim() || createAppointmentMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {createAppointmentMutation.isPending ? 'Scheduling...' : 'Schedule Appointment'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}