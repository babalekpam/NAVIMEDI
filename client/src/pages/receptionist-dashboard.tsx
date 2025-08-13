import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { UnifiedAppointments, type UnifiedAppointment } from "@/lib/unified-appointments";
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

// Add appointment schema for receptionist use
const appointmentSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  doctorId: z.string().min(1, 'Doctor is required'),
  appointmentDate: z.string().min(1, 'Date is required'),
  appointmentTime: z.string().min(1, 'Time is required'),
  type: z.string().min(1, 'Type is required'),
  reason: z.string().min(1, 'Reason is required'),
  priority: z.enum(['normal', 'high', 'urgent']).default('normal'),
  notes: z.string().optional(),
});

const vitalSignsSchema = z.object({
  systolicBp: z.number().min(60).max(300).optional(),
  diastolicBp: z.number().min(30).max(200).optional(),
  heartRate: z.number().min(30).max(250).optional(),
  temperature: z.number().min(90).max(115).optional(),
  temperatureUnit: z.enum(['F', 'C']).default('F'),
  respiratoryRate: z.number().min(8).max(60).optional(),
  oxygenSaturation: z.number().min(70).max(100).optional(),
  weight: z.number().min(1).max(1000).optional(),
  weightUnit: z.enum(['lbs', 'kg']).default('lbs'),
  height: z.number().min(12).max(96).optional(),
  heightUnit: z.enum(['inches', 'cm']).default('inches'),
  painLevel: z.number().min(0).max(10).optional(),
  glucoseLevel: z.number().min(50).max(500).optional(),
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
  
  // Appointment booking states
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
  const [selectedPatientForAppointment, setSelectedPatientForAppointment] = useState<Patient | null>(null);

  // Forms
  const appointmentForm = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patientId: '',
      doctorId: '',
      appointmentDate: '',
      appointmentTime: '',
      type: '',
      reason: '',
      priority: 'normal' as const,
      notes: '',
    },
  });

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

  // Query for insurance info for selected patient
  const { data: patientInsurance, isLoading: insuranceLoading } = useQuery({
    queryKey: ["/api/hospital-patient-insurance", selectedPatientForInsurance?.id],
    enabled: !!selectedPatientForInsurance?.id,
  });

  // Mutations
  const [isRegistering, setIsRegistering] = useState(false);

  const checkInPatientMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/patient-check-ins', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/patient-check-ins/today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/patient-check-ins/waiting'] });
      setIsCheckInDialogOpen(false);
      checkInForm.reset();
    },
  });

  const recordVitalsMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/vital-signs', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/patient-check-ins/today'] });
      setIsVitalsDialogOpen(false);
      vitalSignsForm.reset();
    },
  });

  // Mutation to create/update hospital patient insurance
  const saveInsuranceMutation = useMutation({
    mutationFn: (data: any) => {
      if (editingInsurance) {
        return apiRequest(`/api/hospital-patient-insurance/${editingInsurance.id}`, {
          method: "PATCH",
          body: JSON.stringify(data),
        });
      } else {
        return apiRequest("/api/hospital-patient-insurance", {
          method: "POST",
          body: JSON.stringify(data),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/hospital-patient-insurance", selectedPatientForInsurance?.id] 
      });
      setShowInsuranceDialog(false);
      setEditingInsurance(null);
    },
    onError: (error: any) => {
      console.error("Failed to save insurance information:", error);
    },
  });

  // Handlers
  const handlePatientRegistration = async (data: any) => {
    setIsRegistering(true);
    try {
      // Create patient only (no vital signs during registration)
      await apiRequest('POST', '/api/patients', data);
      
      queryClient.invalidateQueries({ queryKey: ['/api/patients'] });
      setIsRegisterDialogOpen(false);
      
    } catch (error) {
      console.error('Error registering patient:', error);
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
        appointmentId: selectedCheckIn.appointmentId || null,
        systolicBp: data.systolicBp,
        diastolicBp: data.diastolicBp,
        heartRate: data.heartRate,
        temperature: data.temperature,
        temperatureUnit: data.temperatureUnit || 'F',
        respiratoryRate: data.respiratoryRate,
        oxygenSaturation: data.oxygenSaturation,
        weight: data.weight,
        height: data.height,
        painLevel: data.painLevel,
        glucoseLevel: data.glucoseLevel,
        notes: data.notes
      };
      
      // Call vital signs API with check-in ID for proper linking
      apiRequest('POST', '/api/vital-signs', {
        ...vitalSignsData,
        checkInId: selectedCheckIn.id
      }).then(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/vital-signs'] });
        queryClient.invalidateQueries({ queryKey: ['/api/patient-check-ins/today'] });
        queryClient.invalidateQueries({ queryKey: ['/api/patient-check-ins/waiting'] });
        setIsVitalsDialogOpen(false);
        vitalSignsForm.reset();
      }).catch((error) => {
        console.error('Error recording vital signs:', error);
      });
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
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
          <TabsTrigger value="check-in">{t('patient-checkin')}</TabsTrigger>
          <TabsTrigger value="waiting">{t('waiting-room')}</TabsTrigger>
          <TabsTrigger value="vitals">{t('vital-signs')}</TabsTrigger>
          <TabsTrigger value="patients">{t('patient-search')}</TabsTrigger>
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
    </div>
  );
}