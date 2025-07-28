import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Video, 
  Calendar, 
  Users, 
  MapPin, 
  MessageCircle, 
  FileText, 
  Pill, 
  Activity, 
  Clock, 
  Search,
  Phone,
  Mail,
  Heart,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Stethoscope,
  Building2,
  Navigation
} from "lucide-react";
import navimedLogo from "@assets/JPG_1753663321927.jpg";

interface PatientPortalProps {
  patientId?: string;
}

export default function PatientPortal({ patientId }: PatientPortalProps) {
  const [activeTab, setActiveTab] = useState("find-care");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock patient data - in real app this would come from API
  const patientData = {
    name: "John Doe",
    mrn: "MRN-2025-001234",
    dateOfBirth: "1985-03-15",
    email: "john.doe@email.com",
    phone: "(555) 123-4567",
    address: "123 Main St, City, State 12345"
  };

  const upcomingAppointments = [
    {
      id: "1",
      provider: "Dr. Sarah Johnson",
      specialty: "Cardiology",
      date: "2025-01-30",
      time: "2:00 PM",
      type: "Follow-up",
      location: "Metro General Hospital - Cardiology Wing"
    },
    {
      id: "2",
      provider: "Dr. Michael Chen",
      specialty: "Internal Medicine",
      date: "2025-02-05",
      time: "10:30 AM",
      type: "Annual Physical",
      location: "Metro General Hospital - Primary Care"
    }
  ];

  const careTeam = [
    {
      id: "1",
      name: "Dr. Sarah Johnson",
      role: "Cardiologist",
      specialty: "Heart Conditions",
      phone: "(555) 234-5678",
      email: "s.johnson@metrogeneral.com"
    },
    {
      id: "2",
      name: "Dr. Michael Chen",
      role: "Primary Care Physician",
      specialty: "Internal Medicine",
      phone: "(555) 345-6789",
      email: "m.chen@metrogeneral.com"
    },
    {
      id: "3",
      name: "Nurse Sarah Davis",
      role: "Care Coordinator",
      specialty: "Patient Care Management",
      phone: "(555) 456-7890",
      email: "s.davis@metrogeneral.com"
    }
  ];

  const recentMessages = [
    {
      id: "1",
      from: "Dr. Sarah Johnson",
      subject: "Lab Results Available",
      date: "2025-01-28",
      preview: "Your recent blood work results are now available...",
      unread: true
    },
    {
      id: "2",
      from: "Care Team",
      subject: "Appointment Reminder",
      date: "2025-01-27",
      preview: "This is a reminder for your upcoming appointment...",
      unread: false
    }
  ];

  const testResults = [
    {
      id: "1",
      test: "Complete Blood Count (CBC)",
      date: "2025-01-25",
      status: "Normal",
      provider: "Dr. Sarah Johnson",
      category: "Laboratory"
    },
    {
      id: "2",
      test: "Lipid Panel",
      date: "2025-01-25",
      status: "Slightly Elevated",
      provider: "Dr. Sarah Johnson",
      category: "Laboratory"
    },
    {
      id: "3",
      test: "Chest X-Ray",
      date: "2025-01-20",
      status: "Normal",
      provider: "Dr. Michael Chen",
      category: "Imaging"
    }
  ];

  const medications = [
    {
      id: "1",
      name: "Lisinopril",
      dosage: "10mg",
      frequency: "Once daily",
      prescriber: "Dr. Sarah Johnson",
      refillsLeft: 3,
      lastFilled: "2025-01-15"
    },
    {
      id: "2",
      name: "Metformin",
      dosage: "500mg",
      frequency: "Twice daily",
      prescriber: "Dr. Michael Chen",
      refillsLeft: 2,
      lastFilled: "2025-01-10"
    }
  ];

  const healthMetrics = [
    { label: "Blood Pressure", value: "120/80", status: "normal", date: "2025-01-28" },
    { label: "Weight", value: "175 lbs", status: "normal", date: "2025-01-28" },
    { label: "Heart Rate", value: "72 bpm", status: "normal", date: "2025-01-28" },
    { label: "Cholesterol", value: "195 mg/dL", status: "elevated", date: "2025-01-25" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <img src={navimedLogo} alt="NaviMed" className="h-8 w-8 rounded-lg object-contain" />
              <div>
                <h1 className="text-lg font-semibold text-blue-600">NAVIMED Patient Portal</h1>
                <p className="text-sm text-gray-500">Welcome, {patientData.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-xs">
                MRN: {patientData.mrn}
              </Badge>
              <Button variant="outline" size="sm">
                <MessageCircle className="h-4 w-4 mr-2" />
                Messages
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="find-care">Find Care</TabsTrigger>
            <TabsTrigger value="my-record">My Record</TabsTrigger>
            <TabsTrigger value="visits">Visits</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="test-results">Test Results</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="health-summary">Health Summary</TabsTrigger>
            <TabsTrigger value="track-health">Track Health</TabsTrigger>
          </TabsList>

          {/* Find Care Tab */}
          <TabsContent value="find-care">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Video className="h-5 w-5 mr-2 text-blue-600" />
                    Start a Video Visit
                  </CardTitle>
                  <CardDescription>
                    Connect with your provider instantly through secure video
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Start Video Visit</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Calendar className="h-5 w-5 mr-2 text-green-600" />
                    Schedule Appointment
                  </CardTitle>
                  <CardDescription>
                    Book an appointment with your healthcare provider
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Schedule Now</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Users className="h-5 w-5 mr-2 text-purple-600" />
                    View Care Team
                  </CardTitle>
                  <CardDescription>
                    See your healthcare providers and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">View Team</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <MapPin className="h-5 w-5 mr-2 text-red-600" />
                    Find Urgent Care
                  </CardTitle>
                  <CardDescription>
                    Locate nearby urgent care facilities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">Find Locations</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Phone className="h-5 w-5 mr-2 text-orange-600" />
                    Start an e-Visit
                  </CardTitle>
                  <CardDescription>
                    Get care for common conditions online
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">Start e-Visit</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Search className="h-5 w-5 mr-2 text-indigo-600" />
                    Search Providers
                  </CardTitle>
                  <CardDescription>
                    Find healthcare providers by specialty or location
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Input placeholder="Search by name or specialty..." />
                    <Button variant="outline" className="w-full">Search</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* My Record Tab */}
          <TabsContent value="my-record">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Patient Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Full Name</label>
                      <p className="text-sm">{patientData.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                      <p className="text-sm">{patientData.dateOfBirth}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-sm">{patientData.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-sm">{patientData.phone}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Address</label>
                    <p className="text-sm">{patientData.address}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Medical History
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="h-4 w-4 mr-2" />
                    Vital Signs
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Heart className="h-4 w-4 mr-2" />
                    Allergies
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Pill className="h-4 w-4 mr-2" />
                    Current Medications
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Visits Tab */}
          <TabsContent value="visits">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Appointments</CardTitle>
                  <CardDescription>Your scheduled visits and appointments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <p className="font-medium">{appointment.provider}</p>
                          <p className="text-sm text-gray-500">{appointment.specialty} - {appointment.type}</p>
                          <p className="text-sm text-gray-500">{appointment.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{appointment.date}</p>
                          <p className="text-sm text-gray-500">{appointment.time}</p>
                          <Button size="sm" className="mt-2">Join Visit</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Care Team</CardTitle>
                  <CardDescription>Your healthcare providers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {careTeam.map((provider) => (
                      <div key={provider.id} className="p-4 border rounded-lg">
                        <div className="space-y-2">
                          <h3 className="font-medium">{provider.name}</h3>
                          <p className="text-sm text-gray-600">{provider.role}</p>
                          <p className="text-sm text-gray-500">{provider.specialty}</p>
                          <div className="space-y-1">
                            <p className="text-xs text-gray-500">📞 {provider.phone}</p>
                            <p className="text-xs text-gray-500">✉️ {provider.email}</p>
                          </div>
                          <Button size="sm" variant="outline" className="w-full">
                            <MessageCircle className="h-3 w-3 mr-1" />
                            Message
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
                <CardDescription>Communication with your care team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentMessages.map((message) => (
                    <div key={message.id} className={`p-4 border rounded-lg ${message.unread ? 'bg-blue-50 border-blue-200' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">{message.from}</p>
                            {message.unread && <Badge variant="default" className="text-xs">New</Badge>}
                          </div>
                          <p className="text-sm font-medium">{message.subject}</p>
                          <p className="text-sm text-gray-500">{message.preview}</p>
                        </div>
                        <p className="text-xs text-gray-500">{message.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button>
                    <Mail className="h-4 w-4 mr-2" />
                    Compose Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Test Results Tab */}
          <TabsContent value="test-results">
            <Card>
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
                <CardDescription>Your recent lab and imaging results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testResults.map((result) => (
                    <div key={result.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{result.test}</p>
                        <p className="text-sm text-gray-500">Ordered by {result.provider}</p>
                        <p className="text-sm text-gray-500">{result.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{result.date}</p>
                        <Badge 
                          variant={result.status === 'Normal' ? 'default' : 'secondary'}
                          className={result.status === 'Normal' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                        >
                          {result.status}
                        </Badge>
                        <div className="mt-2">
                          <Button size="sm" variant="outline">View Details</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medications Tab */}
          <TabsContent value="medications">
            <Card>
              <CardHeader>
                <CardTitle>Current Medications</CardTitle>
                <CardDescription>Your active prescriptions and medications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {medications.map((medication) => (
                    <div key={medication.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{medication.name}</p>
                        <p className="text-sm text-gray-500">{medication.dosage} - {medication.frequency}</p>
                        <p className="text-sm text-gray-500">Prescribed by {medication.prescriber}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Last filled: {medication.lastFilled}</p>
                        <p className="text-sm text-gray-500">Refills left: {medication.refillsLeft}</p>
                        <Button size="sm" className="mt-2">Request Refill</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Health Summary Tab */}
          <TabsContent value="health-summary">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Vital Signs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {healthMetrics.map((metric, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{metric.label}</p>
                          <p className="text-sm text-gray-500">{metric.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{metric.value}</p>
                          <Badge 
                            variant={metric.status === 'normal' ? 'default' : 'secondary'}
                            className={metric.status === 'normal' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                          >
                            {metric.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Health Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm">Annual physical completed</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      <span className="text-sm">Cholesterol slightly elevated</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm">All vaccinations up to date</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <span className="text-sm">Next screening due in 6 months</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Track Health Tab */}
          <TabsContent value="track-health">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Health Tracking Tools</CardTitle>
                  <CardDescription>Monitor your health metrics over time</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Blood Pressure Log
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="h-4 w-4 mr-2" />
                    Weight Tracker
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Heart className="h-4 w-4 mr-2" />
                    Heart Rate Monitor
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Pill className="h-4 w-4 mr-2" />
                    Medication Adherence
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Preventive Care</CardTitle>
                  <CardDescription>Stay on top of your preventive health measures</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Annual Physical</span>
                      <Badge className="bg-green-100 text-green-800">Completed</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Mammogram</span>
                      <Badge className="bg-yellow-100 text-yellow-800">Due Soon</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Colonoscopy</span>
                      <Badge className="bg-gray-100 text-gray-800">Not Due</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Eye Exam</span>
                      <Badge className="bg-yellow-100 text-yellow-800">Overdue</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}