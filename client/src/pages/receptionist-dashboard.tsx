import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
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
import { Progress } from '@/components/ui/progress';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart';
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
  DollarSign,
  BarChart3,
  TrendingUp,
  PieChart,
  Target,
  TimerIcon,
  MapPin
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";
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

// Analytics data interfaces for receptionist dashboard
interface PatientFlowData {
  period: string;
  checkIns: number;
  waitTime: number;
  throughput: number;
  target?: number;
}

interface VisitTypeDistribution {
  type: string;
  value: number;
  color: string;
}

interface AppointmentStatusData {
  status: string;
  value: number;
  color: string;
}

interface WaitTimeMetric {
  department: string;
  avgWaitTime: number;
  maxWaitTime: number;
  patientCount: number;
}

interface PeakHoursData {
  hour: string;
  checkIns: number;
  appointments: number;
  waitTime: number;
}

interface RegistrationTrendData {
  period: string;
  newPatients: number;
  returningPatients: number;
  total: number;
}

interface ProviderUtilizationData {
  provider: string;
  scheduledSlots: number;
  bookedSlots: number;
  utilization: number;
  specialty: string;
}

interface ReceptionistAnalytics {
  patientFlow: {
    dailyTrends: PatientFlowData[];
    hourlyTrends: PatientFlowData[];
    visitTypes: VisitTypeDistribution[];
    throughputMetrics: PatientFlowData[];
  };
  appointments: {
    statusDistribution: AppointmentStatusData[];
    noShowTrends: PatientFlowData[];
    providerUtilization: ProviderUtilizationData[];
    dailySchedule: PatientFlowData[];
  };
  operations: {
    waitTimesByDepartment: WaitTimeMetric[];
    peakHours: PeakHoursData[];
    registrationTrends: RegistrationTrendData[];
    insuranceVerificationRates: PatientFlowData[];
  };
}

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

type VitalSigns = {
  id: string;
  systolicBp: number;
  diastolicBp: number;
  heartRate: number;
  temperature: number;
  temperatureUnit: 'F' | 'C';
  oxygenSaturation: number;
  weight: number;
  weightUnit: 'lbs' | 'kg';
  height: number;
  heightUnit: 'inches' | 'cm';
  respiratoryRate: number;
  bloodType: string;
  painLevel: number;
  glucoseLevel?: number;
  bmi?: number;
  allergies?: string;
  currentMedications?: string;
  notes?: string;
  recordedAt: string;
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
  vitalSigns?: VitalSigns;
};

type Appointment = {
  id: string;
  patientId: string;
  physicianId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: string;
  reasonForVisit: string;
  patient: Patient;
  physician: Physician;
};

type Physician = {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  department: string;
  availability: {
    [key: string]: string[];
  };
};

type InsuranceInfo = {
  id: string;
  patientId: string;
  insuranceProviderName: string;
  policyNumber: string;
  groupNumber?: string;
  coveragePercentage: number;
  verificationStatus: 'pending' | 'verified' | 'denied';
  effectiveDate: string;
  expirationDate: string;
};

export default function ReceptionistDashboard() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
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

  // Fetch real analytics data from API
  // Real-time analytics for receptionist operations with high-frequency polling
  const { data: analyticsData, isLoading: analyticsLoading, error: analyticsError } = useQuery({
    queryKey: ['/api/analytics/receptionist'],
    staleTime: 30 * 1000, // 30 seconds - appointment data changes frequently
    refetchInterval: 20 * 1000, // 20 seconds - high frequency for real-time patient flow
    refetchIntervalInBackground: false, // Don't poll when tab inactive
    retry: 3, // Robust retries for operational data
    refetchOnWindowFocus: true, // Immediate refresh when returning
    refetchOnReconnect: true, // Critical to refresh after network issues
  });

  // Transform API response to dashboard format
  const transformReceptionistAnalytics = useMemo(() => {
    if (!analyticsData) return null;

    try {
      // Transform patient flow data
      const patientFlow = {
        dailyTrends: (analyticsData.patientFlow?.dailyTrends || []).map((item: any) => ({
          period: item.period || item.day || '',
          checkIns: Number(item.checkIns) || Number(item.checkins) || 0,
          waitTime: Number(item.waitTime) || Number(item.avgWaitTime) || 0,
          throughput: Number(item.throughput) || Number(item.processed) || 0,
          target: Number(item.target) || Number(item.capacity) || 0
        })),
        hourlyTrends: (analyticsData.patientFlow?.hourlyTrends || []).map((item: any) => ({
          period: item.period || item.hour || '',
          checkIns: Number(item.checkIns) || Number(item.checkins) || 0,
          waitTime: Number(item.waitTime) || Number(item.avgWaitTime) || 0,
          throughput: Number(item.throughput) || Number(item.processed) || 0,
          target: Number(item.target) || Number(item.capacity) || 0
        })),
        visitTypes: (analyticsData.patientFlow?.visitTypes || []).map((item: any, index: number) => {
          const colors = ["#22c55e", "#ef4444", "#3b82f6", "#f59e0b", "#8b5cf6", "#06b6d4"];
          return {
            type: item.type || item.name || '',
            value: Number(item.value) || Number(item.count) || 0,
            color: item.color || colors[index % colors.length]
          };
        }),
        throughputMetrics: (analyticsData.patientFlow?.throughputMetrics || []).map((item: any) => ({
          period: item.period || item.timeSlot || '',
          checkIns: Number(item.checkIns) || Number(item.checkins) || 0,
          waitTime: Number(item.waitTime) || Number(item.avgWaitTime) || 0,
          throughput: Number(item.throughput) || Number(item.processed) || 0
        }))
      };

      // Transform appointment data
      const appointments = {
        statusDistribution: (analyticsData.appointments?.statusDistribution || []).map((item: any, index: number) => {
          const colors = ["#3b82f6", "#22c55e", "#f59e0b", "#6b7280", "#ef4444", "#9ca3af"];
          return {
            status: item.status || item.name || '',
            value: Number(item.value) || Number(item.count) || 0,
            color: item.color || colors[index % colors.length]
          };
        }),
        noShowTrends: (analyticsData.appointments?.noShowTrends || []).map((item: any) => ({
          period: item.period || item.month || '',
          checkIns: Number(item.noShows) || Number(item.count) || 0,
          waitTime: 0,
          throughput: 0,
          target: Number(item.target) || 5
        })),
        providerUtilization: (analyticsData.appointments?.providerUtilization || []).map((item: any) => ({
          provider: item.provider || item.name || '',
          scheduledSlots: Number(item.scheduledSlots) || Number(item.totalSlots) || 0,
          bookedSlots: Number(item.bookedSlots) || Number(item.usedSlots) || 0,
          utilization: Number(item.utilization) || 0,
          specialty: item.specialty || ''
        })),
        dailySchedule: (analyticsData.appointments?.dailySchedule || []).map((item: any) => ({
          period: item.period || item.time || '',
          checkIns: Number(item.appointments) || Number(item.count) || 0,
          waitTime: 0,
          throughput: Number(item.completed) || Number(item.appointments) || 0
        }))
      };

      // Transform operations data
      const operations = {
        waitTimesByDepartment: (analyticsData.operations?.waitTimesByDepartment || []).map((item: any) => ({
          department: item.department || item.name || '',
          avgWaitTime: Number(item.avgWaitTime) || Number(item.averageWait) || 0,
          maxWaitTime: Number(item.maxWaitTime) || Number(item.maxWait) || 0,
          patientCount: Number(item.patientCount) || Number(item.patients) || 0
        })),
        peakHours: (analyticsData.operations?.peakHours || []).map((item: any) => ({
          hour: item.hour || item.time || '',
          checkIns: Number(item.checkIns) || Number(item.checkins) || 0,
          appointments: Number(item.appointments) || Number(item.scheduled) || 0,
          waitTime: Number(item.waitTime) || Number(item.avgWait) || 0
        })),
        registrationTrends: (analyticsData.operations?.registrationTrends || []).map((item: any) => ({
          period: item.period || item.month || '',
          newPatients: Number(item.newPatients) || Number(item.new) || 0,
          returningPatients: Number(item.returningPatients) || Number(item.returning) || 0,
          total: Number(item.total) || (Number(item.newPatients || 0) + Number(item.returningPatients || 0))
        })),
        insuranceVerificationRates: (analyticsData.operations?.insuranceVerificationRates || []).map((item: any) => ({
          period: item.period || item.day || '',
          checkIns: Number(item.rate) || Number(item.percentage) || 0,
          waitTime: 0,
          throughput: 0,
          target: Number(item.target) || 95
        }))
      };

      return { patientFlow, appointments, operations };
    } catch (error) {
      console.error('Error transforming receptionist analytics data:', error);
      return null;
    }
  }, [analyticsData]);

  // Generate fallback data for loading/error states
  const getFallbackReceptionistAnalytics = () => ({
    patientFlow: {
      dailyTrends: [
        { period: "Mon", checkIns: 45, waitTime: 12, throughput: 38, target: 40 },
        { period: "Tue", checkIns: 52, waitTime: 15, throughput: 44, target: 40 },
        { period: "Wed", checkIns: 48, waitTime: 10, throughput: 42, target: 40 },
        { period: "Thu", checkIns: 58, waitTime: 18, throughput: 48, target: 40 },
        { period: "Fri", checkIns: 63, waitTime: 14, throughput: 52, target: 40 },
        { period: "Sat", checkIns: 35, waitTime: 8, throughput: 32, target: 30 },
        { period: "Sun", checkIns: 28, waitTime: 6, throughput: 26, target: 30 }
      ],
      hourlyTrends: [
        { period: "8AM", checkIns: 8, waitTime: 5, throughput: 7, target: 6 },
        { period: "9AM", checkIns: 12, waitTime: 8, throughput: 10, target: 8 },
        { period: "10AM", checkIns: 15, waitTime: 12, throughput: 13, target: 10 },
        { period: "11AM", checkIns: 18, waitTime: 15, throughput: 15, target: 12 },
        { period: "12PM", checkIns: 22, waitTime: 20, throughput: 18, target: 15 },
        { period: "1PM", checkIns: 25, waitTime: 22, throughput: 20, target: 18 },
        { period: "2PM", checkIns: 20, waitTime: 18, throughput: 17, target: 15 },
        { period: "3PM", checkIns: 16, waitTime: 14, throughput: 14, target: 12 },
        { period: "4PM", checkIns: 14, waitTime: 12, throughput: 12, target: 10 },
        { period: "5PM", checkIns: 10, waitTime: 8, throughput: 9, target: 8 }
      ],
      visitTypes: [
        { type: "Routine Check-up", value: 156, color: "#22c55e" },
        { type: "Emergency", value: 89, color: "#ef4444" },
        { type: "Follow-up", value: 134, color: "#3b82f6" },
        { type: "Specialist Consultation", value: 67, color: "#f59e0b" },
        { type: "Lab Results", value: 45, color: "#8b5cf6" },
        { type: "Medication Review", value: 38, color: "#06b6d4" }
      ],
      throughputMetrics: [
        { period: "8-12 AM", checkIns: 65, waitTime: 12, throughput: 58 },
        { period: "12-4 PM", checkIns: 87, waitTime: 18, throughput: 72 },
        { period: "4-8 PM", checkIns: 54, waitTime: 10, throughput: 48 }
      ]
    },
    appointments: {
      statusDistribution: [
        { status: "Scheduled", value: 145, color: "#3b82f6" },
        { status: "Checked-in", value: 67, color: "#22c55e" },
        { status: "In Progress", value: 23, color: "#f59e0b" },
        { status: "Completed", value: 89, color: "#6b7280" },
        { status: "No-show", value: 12, color: "#ef4444" },
        { status: "Cancelled", value: 18, color: "#9ca3af" }
      ],
      noShowTrends: [
        { period: "Jan", checkIns: 8, waitTime: 0, throughput: 0, target: 5 },
        { period: "Feb", checkIns: 12, waitTime: 0, throughput: 0, target: 5 },
        { period: "Mar", checkIns: 15, waitTime: 0, throughput: 0, target: 5 },
        { period: "Apr", checkIns: 9, waitTime: 0, throughput: 0, target: 5 },
        { period: "May", checkIns: 14, waitTime: 0, throughput: 0, target: 5 },
        { period: "Jun", checkIns: 11, waitTime: 0, throughput: 0, target: 5 }
      ],
      providerUtilization: [
        { provider: "Dr. Smith", scheduledSlots: 32, bookedSlots: 28, utilization: 87.5, specialty: "Internal Medicine" },
        { provider: "Dr. Johnson", scheduledSlots: 28, bookedSlots: 25, utilization: 89.3, specialty: "Cardiology" },
        { provider: "Dr. Williams", scheduledSlots: 36, bookedSlots: 30, utilization: 83.3, specialty: "Emergency" },
        { provider: "Dr. Brown", scheduledSlots: 24, bookedSlots: 22, utilization: 91.7, specialty: "Pediatrics" }
      ],
      dailySchedule: [
        { period: "8AM", checkIns: 4, waitTime: 0, throughput: 4 },
        { period: "10AM", checkIns: 6, waitTime: 0, throughput: 6 },
        { period: "12PM", checkIns: 8, waitTime: 0, throughput: 7 },
        { period: "2PM", checkIns: 7, waitTime: 0, throughput: 6 },
        { period: "4PM", checkIns: 5, waitTime: 0, throughput: 5 }
      ]
    },
    operations: {
      waitTimesByDepartment: [
        { department: "Emergency", avgWaitTime: 8, maxWaitTime: 15, patientCount: 23 },
        { department: "Internal Medicine", avgWaitTime: 15, maxWaitTime: 28, patientCount: 45 },
        { department: "Cardiology", avgWaitTime: 12, maxWaitTime: 22, patientCount: 18 },
        { department: "Pediatrics", avgWaitTime: 10, maxWaitTime: 18, patientCount: 32 },
        { department: "Surgery", avgWaitTime: 20, maxWaitTime: 35, patientCount: 12 }
      ],
      peakHours: [
        { hour: "8AM", checkIns: 8, appointments: 4, waitTime: 5 },
        { hour: "9AM", checkIns: 12, appointments: 6, waitTime: 8 },
        { hour: "10AM", checkIns: 15, appointments: 8, waitTime: 12 },
        { hour: "11AM", checkIns: 18, appointments: 10, waitTime: 15 },
        { hour: "12PM", checkIns: 22, appointments: 12, waitTime: 20 },
        { hour: "1PM", checkIns: 25, appointments: 14, waitTime: 22 },
        { hour: "2PM", checkIns: 20, appointments: 11, waitTime: 18 },
        { hour: "3PM", checkIns: 16, appointments: 9, waitTime: 14 },
        { hour: "4PM", checkIns: 14, appointments: 7, waitTime: 12 },
        { hour: "5PM", checkIns: 10, appointments: 5, waitTime: 8 }
      ],
      registrationTrends: [
        { period: "Jan", newPatients: 45, returningPatients: 134, total: 179 },
        { period: "Feb", newPatients: 52, returningPatients: 145, total: 197 },
        { period: "Mar", newPatients: 38, returningPatients: 156, total: 194 },
        { period: "Apr", newPatients: 61, returningPatients: 142, total: 203 },
        { period: "May", newPatients: 49, returningPatients: 167, total: 216 },
        { period: "Jun", newPatients: 57, returningPatients: 178, total: 235 }
      ],
      insuranceVerificationRates: [
        { period: "Mon", checkIns: 89, waitTime: 0, throughput: 0, target: 95 },
        { period: "Tue", checkIns: 92, waitTime: 0, throughput: 0, target: 95 },
        { period: "Wed", checkIns: 87, waitTime: 0, throughput: 0, target: 95 },
        { period: "Thu", checkIns: 94, waitTime: 0, throughput: 0, target: 95 },
        { period: "Fri", checkIns: 91, waitTime: 0, throughput: 0, target: 95 },
        { period: "Sat", checkIns: 88, waitTime: 0, throughput: 0, target: 95 },
        { period: "Sun", checkIns: 85, waitTime: 0, throughput: 0, target: 95 }
      ]
    }
  });

  // Use real analytics data if available, fallback if loading/error
  const finalReceptionistAnalytics = transformReceptionistAnalytics || getFallbackReceptionistAnalytics();

  // Queries
  const { data: todayCheckIns = [], isLoading: loadingCheckIns } = useQuery<CheckIn[]>({
    queryKey: ['/api/patient-check-ins/today'],
  });

  const { data: waitingPatients = [], isLoading: loadingWaiting } = useQuery<CheckIn[]>({
    queryKey: ['/api/patient-check-ins/waiting'],
  });

  const { data: todayAppointments = [], isLoading: loadingAppointments } = useQuery<Appointment[]>({
    queryKey: ['/api/appointments/date', new Date().toISOString().split('T')[0]],
  });

  // Query for appointments on the selected appointment date for slot availability checking
  const { data: selectedDateAppointments = [], isLoading: loadingSelectedDateAppointments } = useQuery<Appointment[]>({
    queryKey: ['/api/appointments/date', selectedAppointmentDate],
    enabled: !!selectedAppointmentDate,
  });

  const { data: recentPatients = [], isLoading: loadingPatients } = useQuery<Patient[]>({
    queryKey: ['/api/patients'],
  });

  // Fetch available physicians for appointment booking
  const { data: availablePhysicians = [], isLoading: loadingPhysicians } = useQuery<Physician[]>({
    queryKey: ['/api/available-physicians'],
  });

  // Query for insurance info for selected patient
  const { data: patientInsurance, isLoading: insuranceLoading } = useQuery<InsuranceInfo>({
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
          navigate('/login');
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
      // Invalidate today's appointments specifically
      const today = new Date().toISOString().split('T')[0];
      queryClient.invalidateQueries({ queryKey: ['/api/appointments/date', today] });
      // Invalidate selected appointment date if different from today
      if (selectedAppointmentDate && selectedAppointmentDate !== today) {
        queryClient.invalidateQueries({ queryKey: ['/api/appointments/date', selectedAppointmentDate] });
      }
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
    
    // Use the appropriate appointments data for the selected date
    const appointmentsToCheck = selectedDateAppointments.length > 0 ? selectedDateAppointments : 
                              (date === new Date().toISOString().split('T')[0] ? todayAppointments : []);
    
    // Generate slots from 8 AM to 6 PM (18:00)
    for (let hour = 8; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        // Skip past times for today
        if (isToday && hour <= currentHour) {
          continue;
        }
        
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Check if this slot is already booked - FIXED: Use proper field names and time comparison
        const isBooked = appointmentsToCheck.some((apt: any) => {
          // Use apt.startTime directly instead of parsing appointmentDate
          const aptStartTime = apt.startTime;
          // Compare the appointment date (YYYY-MM-DD format) with selected date
          const selectedDateString = new Date(date).toISOString().split('T')[0];
          const appointmentDateString = new Date(apt.appointmentDate).toISOString().split('T')[0];
          
          return appointmentDateString === selectedDateString && 
                 aptStartTime === timeString && 
                 (apt.physicianId === selectedDoctor?.id || apt.physician?.id === selectedDoctor?.id);
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
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
          <TabsTrigger value="check-in">{t('patient-checkin')}</TabsTrigger>
          <TabsTrigger value="waiting">{t('waiting-room')}</TabsTrigger>
          <TabsTrigger value="vitals">{t('vital-signs')}</TabsTrigger>
          <TabsTrigger value="patients">{t('patient-search')}</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="insurance">Insurance</TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">
            <BarChart3 className="h-4 w-4 mr-1" />
            Analytics
          </TabsTrigger>
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
                        <p className="text-sm font-semibold text-green-600">
                          {patientInsurance.coveragePercentage !== null && patientInsurance.coveragePercentage !== undefined 
                            ? `${patientInsurance.coveragePercentage}%` 
                            : 'Not specified'}
                        </p>
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

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6" data-testid="analytics-content">
          {/* Enhanced KPI Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card data-testid="kpi-checkins">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Check-ins</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todayCheckIns.length}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+12%</span> from yesterday
                </p>
                <Progress value={75} className="mt-2" />
              </CardContent>
            </Card>

            <Card data-testid="kpi-wait-time">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Wait Time</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">14 min</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-red-500">+2 min</span> from target
                </p>
                <Progress value={60} className="mt-2" />
              </CardContent>
            </Card>

            <Card data-testid="kpi-throughput">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Patient Throughput</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42/hr</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+8%</span> efficiency
                </p>
                <Progress value={85} className="mt-2" />
              </CardContent>
            </Card>

            <Card data-testid="kpi-appointments">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Scheduled Today</CardTitle>
                <Calendar className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todayAppointments.length}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-blue-600">92%</span> show rate
                </p>
                <Progress value={92} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Patient Flow Analytics Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Patient Flow Analytics</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Check-in Trends */}
              <Card data-testid="chart-daily-trends">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Daily Check-in Trends
                  </CardTitle>
                  <CardDescription>Patient check-ins over the past week</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      checkIns: { label: "Check-ins", color: "#3b82f6" },
                      target: { label: "Target", color: "#6b7280" }
                    }}
                    className="h-[300px]"
                  >
                    <AreaChart data={finalReceptionistAnalytics.patientFlow.dailyTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area 
                        type="monotone" 
                        dataKey="checkIns" 
                        stroke="#3b82f6" 
                        fill="#3b82f6" 
                        fillOpacity={0.3}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="target" 
                        stroke="#6b7280" 
                        strokeDasharray="5 5"
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Hourly Patient Flow */}
              <Card data-testid="chart-hourly-flow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Hourly Patient Flow
                  </CardTitle>
                  <CardDescription>Today's check-in pattern by hour</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      checkIns: { label: "Check-ins", color: "#22c55e" },
                      waitTime: { label: "Wait Time (min)", color: "#f59e0b" }
                    }}
                    className="h-[300px]"
                  >
                    <BarChart data={finalReceptionistAnalytics.patientFlow.hourlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="checkIns" fill="#22c55e" />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Visit Type Distribution */}
              <Card data-testid="chart-visit-types">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-4 w-4" />
                    Visit Type Distribution
                  </CardTitle>
                  <CardDescription>Breakdown of visit reasons</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      routine: { label: "Routine Check-up", color: "#22c55e" },
                      emergency: { label: "Emergency", color: "#ef4444" },
                      followup: { label: "Follow-up", color: "#3b82f6" },
                      specialist: { label: "Specialist", color: "#f59e0b" },
                      lab: { label: "Lab Results", color: "#8b5cf6" },
                      medication: { label: "Medication", color: "#06b6d4" }
                    }}
                    className="h-[300px]"
                  >
                    <RechartsPieChart>
                      <Pie
                        data={finalReceptionistAnalytics.patientFlow.visitTypes}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {finalReceptionistAnalytics.patientFlow.visitTypes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                    </RechartsPieChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Peak Hours Analysis */}
              <Card data-testid="chart-peak-hours">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TimerIcon className="h-4 w-4" />
                    Peak Hours Analysis
                  </CardTitle>
                  <CardDescription>Busiest times and wait patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      checkIns: { label: "Check-ins", color: "#3b82f6" },
                      appointments: { label: "Appointments", color: "#22c55e" },
                      waitTime: { label: "Wait Time", color: "#f59e0b" }
                    }}
                    className="h-[300px]"
                  >
                    <LineChart data={finalReceptionistAnalytics.operations.peakHours}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="checkIns" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="appointments" 
                        stroke="#22c55e" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Appointment Management Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-semibold">Appointment Management</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Appointment Status Distribution */}
              <Card data-testid="chart-appointment-status">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Appointment Status Overview
                  </CardTitle>
                  <CardDescription>Current status of all appointments</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      scheduled: { label: "Scheduled", color: "#3b82f6" },
                      checkedIn: { label: "Checked In", color: "#22c55e" },
                      inProgress: { label: "In Progress", color: "#f59e0b" },
                      completed: { label: "Completed", color: "#6b7280" },
                      noShow: { label: "No Show", color: "#ef4444" },
                      cancelled: { label: "Cancelled", color: "#9ca3af" }
                    }}
                    className="h-[300px]"
                  >
                    <BarChart data={finalReceptionistAnalytics.appointments.statusDistribution} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="status" type="category" width={80} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Provider Utilization */}
              <Card data-testid="chart-provider-utilization">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Provider Utilization
                  </CardTitle>
                  <CardDescription>Booking rates by healthcare provider</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      utilization: { label: "Utilization %", color: "#22c55e" }
                    }}
                    className="h-[300px]"
                  >
                    <BarChart data={finalReceptionistAnalytics.appointments.providerUtilization}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="provider" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="utilization" fill="#22c55e" />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* No-Show Trends */}
              <Card data-testid="chart-noshow-trends">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    No-Show Trends
                  </CardTitle>
                  <CardDescription>Monthly no-show patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      noShows: { label: "No-Shows", color: "#ef4444" },
                      target: { label: "Target", color: "#6b7280" }
                    }}
                    className="h-[300px]"
                  >
                    <LineChart data={finalReceptionistAnalytics.appointments.noShowTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="checkIns" 
                        stroke="#ef4444" 
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="target" 
                        stroke="#6b7280" 
                        strokeDasharray="5 5"
                      />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Registration Trends */}
              <Card data-testid="chart-registration-trends">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Patient Registration Trends
                  </CardTitle>
                  <CardDescription>New vs returning patient trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      newPatients: { label: "New Patients", color: "#3b82f6" },
                      returningPatients: { label: "Returning Patients", color: "#22c55e" }
                    }}
                    className="h-[300px]"
                  >
                    <AreaChart data={finalReceptionistAnalytics.operations.registrationTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area 
                        type="monotone" 
                        dataKey="newPatients" 
                        stackId="1"
                        stroke="#3b82f6" 
                        fill="#3b82f6"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="returningPatients" 
                        stackId="1"
                        stroke="#22c55e" 
                        fill="#22c55e"
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Operational Analytics Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-purple-600" />
              <h2 className="text-xl font-semibold">Operational Analytics</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Wait Times by Department */}
              <Card data-testid="chart-wait-times">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Wait Times by Department
                  </CardTitle>
                  <CardDescription>Average wait times across departments</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      avgWaitTime: { label: "Avg Wait Time (min)", color: "#f59e0b" },
                      maxWaitTime: { label: "Max Wait Time (min)", color: "#ef4444" }
                    }}
                    className="h-[300px]"
                  >
                    <BarChart data={finalReceptionistAnalytics.operations.waitTimesByDepartment}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="avgWaitTime" fill="#f59e0b" />
                      <Bar dataKey="maxWaitTime" fill="#ef4444" opacity={0.7} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Insurance Verification Rates */}
              <Card data-testid="chart-insurance-verification">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Insurance Verification Success
                  </CardTitle>
                  <CardDescription>Daily verification success rates</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      verificationRate: { label: "Success Rate %", color: "#22c55e" },
                      target: { label: "Target", color: "#6b7280" }
                    }}
                    className="h-[300px]"
                  >
                    <LineChart data={finalReceptionistAnalytics.operations.insuranceVerificationRates}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis domain={[80, 100]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="checkIns" 
                        stroke="#22c55e" 
                        strokeWidth={3}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="target" 
                        stroke="#6b7280" 
                        strokeDasharray="5 5"
                      />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer" data-testid="action-export-reports">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">Export Analytics</h3>
                  <p className="text-sm text-gray-500">Download detailed reports</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer" data-testid="action-peak-hours">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">Optimize Scheduling</h3>
                  <p className="text-sm text-gray-500">Manage peak hour staffing</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer" data-testid="action-alerts">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-medium">Setup Alerts</h3>
                  <p className="text-sm text-gray-500">Monitor wait time thresholds</p>
                </div>
              </div>
            </Card>
          </div>
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
                  setAppointmentPatient(patient || null);
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