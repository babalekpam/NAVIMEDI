import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar,
  MessageCircle,
  FileText,
  Pill,
  Activity,
  User,
  Video,
  Clock,
  Bell,
  Settings,
  Phone,
  LogOut,
  ChevronRight,
  Heart,
  Thermometer,
  Scale,
  Stethoscope,
  Search,
  Plus,
  Send,
  ArrowLeft,
  Home,
  Download,
  Camera,
  Menu,
  X,
  Shield,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Smartphone,
  Wifi,
  WifiOff,
  Users,
  CreditCard,
  Grid3X3
} from "lucide-react";
import navimedLogo from "@assets/carnet_1754492017427.png";

export default function MobilePatientApp() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notifications, setNotifications] = useState([]);
  const queryClient = useQueryClient();

  // Quick Actions State
  const [quickActionForm, setQuickActionForm] = useState({
    bloodPressure: { systolic: "", diastolic: "" },
    weight: "",
    temperature: "",
    symptoms: "",
    medication: { name: "", taken: false, time: "" }
  });

  // Emergency Contact State
  const [emergencyContact, setEmergencyContact] = useState({
    name: "Dr. Sarah Johnson",
    phone: "(555) 123-4567",
    relationship: "Primary Care Physician"
  });

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch patient data
  const { data: patientProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/patients/profile'],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes for mobile
  });

  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery({
    queryKey: ['/api/appointments/patient', user?.id],
    enabled: !!user?.id,
  });

  const { data: prescriptions = [], isLoading: prescriptionsLoading } = useQuery({
    queryKey: ['/api/prescriptions/patient', user?.id],
    enabled: !!user?.id,
  });

  const { data: labResults = [], isLoading: labResultsLoading } = useQuery({
    queryKey: ['/api/patients', user?.id, 'lab-results', 'all'],
    enabled: !!user?.id,
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/medical-communications/patient', user?.id],
    enabled: !!user?.id,
  });

  // Quick vitals submission
  const submitVitalsMutation = useMutation({
    mutationFn: async (vitalsData: any) => {
      return apiRequest('/api/patients/vitals', {
        method: 'POST',
        body: vitalsData
      });
    },
    onSuccess: () => {
      toast({ title: "Vitals recorded successfully!" });
      setQuickActionForm(prev => ({
        ...prev,
        bloodPressure: { systolic: "", diastolic: "" },
        weight: "",
        temperature: ""
      }));
    },
    onError: () => {
      toast({ title: "Error recording vitals", variant: "destructive" });
    }
  });

  // Mobile Navigation Component
  const MobileNavigation = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-50">
      <div className="flex justify-around items-center">
        {[
          { id: 'overview', icon: Activity, label: 'Overview' },
          { id: 'find-care', icon: Search, label: 'Find Care' },
          { id: 'visits', icon: Video, label: 'Visits' },
          { id: 'directory', icon: Users, label: 'Directory' },
          { id: 'more', icon: Menu, label: 'More' }
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              activeTab === id 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs mt-1">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  // Mobile Header Component
  const MobileHeader = () => (
    <div className="bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <img src={navimedLogo} alt="NaviMed" className="h-8 w-8 rounded-lg object-contain" />
        <div>
          <h1 className="text-lg font-semibold text-red-600">Carnet</h1>
          <p className="text-xs text-gray-500">Patient App</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {!isOnline && (
          <div className="flex items-center text-orange-600">
            <WifiOff className="w-4 h-4 mr-1" />
            <span className="text-xs">Offline</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>
    </div>
  );

  // Dashboard Tab
  const renderDashboard = () => (
    <div className="space-y-4 pb-20">
      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardContent className="p-4">
          <h2 className="text-xl font-bold mb-2">
            Welcome, {user?.firstName || 'Patient'}!
          </h2>
          <p className="text-blue-100 text-sm">
            Stay on top of your health with quick updates and reminders
          </p>
        </CardContent>
      </Card>

      {/* Health Status Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Health Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <Heart className="w-5 h-5 text-green-600" />
                <span className="text-xs text-green-600 font-medium">Normal</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 mt-1">Blood Pressure</p>
              <p className="text-xs text-gray-600">120/80 mmHg</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <Scale className="w-5 h-5 text-blue-600" />
                <span className="text-xs text-blue-600 font-medium">Stable</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 mt-1">Weight</p>
              <p className="text-xs text-gray-600">165 lbs</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="flex flex-col items-center p-4 h-auto"
              onClick={() => setActiveTab('vitals')}
            >
              <Thermometer className="w-6 h-6 mb-2 text-red-500" />
              <span className="text-sm">Log Vitals</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center p-4 h-auto"
              onClick={() => setActiveTab('medications')}
            >
              <Pill className="w-6 h-6 mb-2 text-blue-500" />
              <span className="text-sm">Take Med</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center p-4 h-auto"
              onClick={() => setActiveTab('appointments')}
            >
              <Calendar className="w-6 h-6 mb-2 text-green-500" />
              <span className="text-sm">Book Visit</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center p-4 h-auto"
              onClick={() => setActiveTab('messages')}
            >
              <MessageCircle className="w-6 h-6 mb-2 text-purple-500" />
              <span className="text-sm">Message</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Next Appointment</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setActiveTab('appointments')}>
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {appointments.length > 0 ? (
            <div className="border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{appointments[0].providerName || 'Dr. Johnson'}</p>
                  <p className="text-xs text-gray-600">
                    {new Date(appointments[0].dateTime).toLocaleDateString()} at{' '}
                    {new Date(appointments[0].dateTime).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
                <Badge variant="outline">{appointments[0].type || 'Check-up'}</Badge>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No upcoming appointments</p>
              <Button size="sm" className="mt-2" onClick={() => setActiveTab('appointments')}>
                Schedule Visit
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card className="border-red-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-red-100 p-2 rounded-full">
                <Phone className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Emergency Contact</p>
                <p className="text-xs text-gray-600">{emergencyContact.name}</p>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => window.open(`tel:${emergencyContact.phone}`)}
            >
              Call
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Medications Tab with Mobile-First Design
  const renderMedications = () => (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">My Medications</h2>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add
        </Button>
      </div>

      {prescriptionsLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Loading medications...</p>
        </div>
      ) : prescriptions && prescriptions.length > 0 ? (
        <div className="space-y-3">
          {prescriptions.map((prescription) => (
            <Card key={prescription.id} className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-base">{prescription.medicationName}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {prescription.dosage} • {prescription.frequency}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge 
                        variant={prescription.status === 'active' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {prescription.status}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        Next: Today 8:00 AM
                      </span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Taken
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <Pill className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No medications found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Medical Records Tab
  const renderRecords = () => (
    <div className="space-y-4 pb-20">
      <h2 className="text-xl font-bold">Medical Records</h2>
      
      {profileLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : patientProfile ? (
        <div className="space-y-4">
          {/* Personal Info Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">MRN</p>
                  <p className="font-medium">{patientProfile.patient?.mrn || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">DOB</p>
                  <p className="font-medium">
                    {patientProfile.patient?.dateOfBirth 
                      ? new Date(patientProfile.patient.dateOfBirth).toLocaleDateString()
                      : 'N/A'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Gender</p>
                  <p className="font-medium capitalize">{patientProfile.patient?.gender || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Blood Type</p>
                  <p className="font-medium">O+</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="text-center">
              <CardContent className="p-3">
                <Stethoscope className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                <p className="text-lg font-bold">12</p>
                <p className="text-xs text-gray-600">Visits</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-3">
                <FileText className="w-6 h-6 text-green-500 mx-auto mb-1" />
                <p className="text-lg font-bold">5</p>
                <p className="text-xs text-gray-600">Lab Results</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-3">
                <Pill className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                <p className="text-lg font-bold">3</p>
                <p className="text-xs text-gray-600">Medications</p>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Unable to load medical records</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Quick Vitals Entry
  const renderVitals = () => (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Log Vitals</h2>
        <Button variant="outline" size="sm" onClick={() => setActiveTab('dashboard')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Blood Pressure */}
          <div>
            <Label className="text-sm font-medium">Blood Pressure</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <Input
                  type="number"
                  placeholder="Systolic"
                  value={quickActionForm.bloodPressure.systolic}
                  onChange={(e) => setQuickActionForm(prev => ({
                    ...prev,
                    bloodPressure: { ...prev.bloodPressure, systolic: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Diastolic"
                  value={quickActionForm.bloodPressure.diastolic}
                  onChange={(e) => setQuickActionForm(prev => ({
                    ...prev,
                    bloodPressure: { ...prev.bloodPressure, diastolic: e.target.value }
                  }))}
                />
              </div>
            </div>
          </div>

          {/* Weight */}
          <div>
            <Label className="text-sm font-medium">Weight (lbs)</Label>
            <Input
              type="number"
              placeholder="Enter weight"
              value={quickActionForm.weight}
              onChange={(e) => setQuickActionForm(prev => ({
                ...prev,
                weight: e.target.value
              }))}
              className="mt-2"
            />
          </div>

          {/* Temperature */}
          <div>
            <Label className="text-sm font-medium">Temperature (°F)</Label>
            <Input
              type="number"
              step="0.1"
              placeholder="98.6"
              value={quickActionForm.temperature}
              onChange={(e) => setQuickActionForm(prev => ({
                ...prev,
                temperature: e.target.value
              }))}
              className="mt-2"
            />
          </div>

          {/* Symptoms */}
          <div>
            <Label className="text-sm font-medium">Symptoms or Notes</Label>
            <Textarea
              placeholder="How are you feeling today?"
              value={quickActionForm.symptoms}
              onChange={(e) => setQuickActionForm(prev => ({
                ...prev,
                symptoms: e.target.value
              }))}
              className="mt-2"
              rows={3}
            />
          </div>

          <Button 
            className="w-full" 
            onClick={() => {
              const vitalsData = {
                ...quickActionForm,
                timestamp: new Date().toISOString()
              };
              submitVitalsMutation.mutate(vitalsData);
            }}
            disabled={submitVitalsMutation.isPending}
          >
            {submitVitalsMutation.isPending ? 'Saving...' : 'Save Vitals'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  // Appointments Tab
  const renderAppointments = () => (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Appointments</h2>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Book
        </Button>
      </div>

      {appointmentsLoading ? (
        <div className="text-center py-8">Loading appointments...</div>
      ) : appointments.length > 0 ? (
        <div className="space-y-3">
          {appointments.map((appointment) => (
            <Card key={appointment.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{appointment.providerName || 'Dr. Johnson'}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(appointment.dateTime).toLocaleDateString()} •{' '}
                      {new Date(appointment.dateTime).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                    <Badge variant="outline" className="mt-2">
                      {appointment.type || 'Check-up'}
                    </Badge>
                  </div>
                  <Video className="w-5 h-5 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No upcoming appointments</p>
            <Button>Schedule Your First Visit</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Messages Tab
  const renderMessages = () => (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Messages</h2>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New
        </Button>
      </div>

      {messagesLoading ? (
        <div className="text-center py-8">Loading messages...</div>
      ) : messages.length > 0 ? (
        <div className="space-y-3">
          {messages.map((message: any) => (
            <Card key={message.id}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <MessageCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {message.type || 'General'}
                      </Badge>
                      {!message.readAt && (
                        <Badge variant="default" className="text-xs">New</Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-sm">
                      {message.metadata?.subject || message.subject || 'No Subject'}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {message.originalContent || 'Message content...'}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No messages yet</p>
            <Button>Send Your First Message</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Side Menu Component
  const SideMenu = () => (
    <>
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsMenuOpen(false)} />
      )}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 z-50 ${
        isMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Menu</h3>
            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
        <div className="p-4 space-y-2">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-full">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
          </div>
          
          {[
            { icon: Settings, label: 'Settings', action: () => {} },
            { icon: Bell, label: 'Notifications', action: () => {} },
            { icon: Shield, label: 'Privacy', action: () => {} },
            { icon: Phone, label: 'Support', action: () => window.open('tel:+1-555-0123') },
            { icon: LogOut, label: 'Sign Out', action: logout }
          ].map(({ icon: Icon, label, action }) => (
            <Button
              key={label}
              variant="ghost"
              className="w-full justify-start"
              onClick={action}
            >
              <Icon className="w-5 h-5 mr-3" />
              {label}
            </Button>
          ))}
        </div>
      </div>
    </>
  );

  // More Menu Items
  const renderMoreMenu = () => (
    <div className="space-y-4 pb-20">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">More Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'records', label: 'My Records', icon: FileText, color: 'text-blue-600' },
              { id: 'messages', label: 'Messages', icon: MessageCircle, color: 'text-green-600' },
              { id: 'results', label: 'Test Results', icon: FileText, color: 'text-purple-600' },
              { id: 'medications', label: 'Medications', icon: Pill, color: 'text-red-600' },
              { id: 'health', label: 'Track Health', icon: Heart, color: 'text-pink-600' },
              { id: 'billing', label: 'Bills & Payments', icon: CreditCard, color: 'text-yellow-600' },
            ].map(({ id, label, icon: Icon, color }) => (
              <Button
                key={id}
                variant="outline"
                className="flex flex-col items-center p-4 h-auto"
                onClick={() => setActiveTab(id)}
              >
                <Icon className={`w-6 h-6 mb-2 ${color}`} />
                <span className="text-sm">{label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Find Care Section
  const renderFindCare = () => (
    <div className="space-y-4 pb-20">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Find Healthcare Providers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input placeholder="Search for doctors, specialties, or services" />
            <div className="grid grid-cols-2 gap-4">
              {[
                'Primary Care', 'Cardiology', 'Dermatology', 'Orthopedics'
              ].map((specialty) => (
                <Button key={specialty} variant="outline" className="h-auto py-3">
                  {specialty}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Directory Section
  const renderDirectory = () => (
    <div className="space-y-4 pb-20">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Hospital Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'Dr. Sarah Johnson', specialty: 'Primary Care', phone: '(555) 123-4567' },
              { name: 'Dr. Michael Chen', specialty: 'Cardiology', phone: '(555) 234-5678' },
              { name: 'Dr. Emily Davis', specialty: 'Dermatology', phone: '(555) 345-6789' }
            ].map((doctor, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{doctor.name}</p>
                    <p className="text-sm text-gray-600">{doctor.specialty}</p>
                    <p className="text-xs text-gray-500">{doctor.phone}</p>
                  </div>
                  <Button size="sm">Contact</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Test Results Section
  const renderResults = () => (
    <div className="space-y-4 pb-20">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          {labResults.length > 0 ? (
            <div className="space-y-3">
              {labResults.map((result: any, index: number) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-sm">{result.testName}</p>
                      <p className="text-xs text-gray-600">
                        {new Date(result.orderedDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={result.status === 'completed' ? 'default' : 'secondary'}>
                      {result.status || 'Completed'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No test results available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Health Tracking Section
  const renderHealthTracking = () => (
    <div className="space-y-4 pb-20">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Track Your Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-red-50 p-4 rounded-lg">
                <Heart className="w-8 h-8 text-red-600 mb-2" />
                <p className="font-semibold">Blood Pressure</p>
                <p className="text-sm text-gray-600">120/80 mmHg</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <Scale className="w-8 h-8 text-blue-600 mb-2" />
                <p className="font-semibold">Weight</p>
                <p className="text-sm text-gray-600">165 lbs</p>
              </div>
            </div>
            <Button className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add New Measurement
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Billing Section
  const renderBilling = () => (
    <div className="space-y-4 pb-20">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bills & Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { description: 'Annual Checkup', amount: '$150.00', status: 'Paid', date: '2025-01-15' },
              { description: 'Lab Tests', amount: '$85.00', status: 'Pending', date: '2025-01-20' }
            ].map((bill, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-sm">{bill.description}</p>
                    <p className="text-xs text-gray-600">{bill.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{bill.amount}</p>
                    <Badge variant={bill.status === 'Paid' ? 'default' : 'secondary'}>
                      {bill.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Main render method
  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderDashboard();
      case 'find-care': return renderFindCare();
      case 'visits': return renderAppointments();
      case 'directory': return renderDirectory();
      case 'more': return renderMoreMenu();
      case 'records': return renderRecords();
      case 'messages': return renderMessages();
      case 'results': return renderResults();
      case 'medications': return renderMedications();
      case 'health': return renderHealthTracking();
      case 'billing': return renderBilling();
      case 'vitals': return renderVitals();
      default: return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader />
      <SideMenu />
      
      {/* Main Content */}
      <div className="px-4 py-4">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <MobileNavigation />
    </div>
  );
}