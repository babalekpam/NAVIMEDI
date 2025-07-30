import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar,
  MessageCircle,
  FileText,
  Pill,
  Activity,
  User,
  Users,
  Video,
  Clock,
  Shield,
  Bell,
  Settings,
  Phone,
  Mail,
  ChevronRight,
  Heart,
  Thermometer,
  Scale,
  Stethoscope,
  BookOpen,
  Search,
  Plus,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Droplets,
  Zap,
  Brain,
  Download,
  ArrowLeft
} from "lucide-react";
import navimedLogo from "@assets/JPG_1753663321927.jpg";

export default function PatientPortalStaff() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("overview");

  // Mock patient data for demonstration
  const mockPatientData = {
    name: "Sarah Johnson",
    mrn: "MGH-20250001",
    dateOfBirth: "1985-06-15",
    lastVisit: "2025-01-28",
    nextAppointment: "2025-02-05 10:30 AM",
    recentResults: [
      {
        id: 1,
        testName: "Complete Blood Count",
        date: "2025-01-25",
        status: "Normal",
        abnormalFlag: "normal"
      },
      {
        id: 2,
        testName: "Blood Glucose",
        date: "2025-01-20",
        status: "High",
        abnormalFlag: "high"
      }
    ],
    medications: [
      {
        id: 1,
        name: "Metformin",
        dosage: "500mg",
        frequency: "Twice daily",
        prescribedBy: "Dr. Smith"
      }
    ],
    appointments: [
      {
        id: 1,
        date: "2025-02-05",
        time: "10:30 AM",
        doctor: "Dr. Michael Smith",
        department: "Internal Medicine",
        type: "Follow-up"
      }
    ]
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Staff Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-blue-600 mr-2" />
            <CardTitle className="text-blue-900 text-lg">Staff Portal View</CardTitle>
          </div>
          <CardDescription className="text-blue-700">
            You are viewing the patient portal interface as hospital staff ({user?.role}). This shows what patients see when they log in.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Welcome Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-6 w-6 mr-2 text-blue-600" />
            Welcome, {mockPatientData.name}
          </CardTitle>
          <CardDescription>
            Last login: Today at 2:30 PM
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Next Appointment</p>
                <p className="text-sm text-gray-600">{mockPatientData.nextAppointment}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Recent Results</p>
                <p className="text-sm text-gray-600">{mockPatientData.recentResults.length} new results</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MessageCircle className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Messages</p>
                <p className="text-sm text-gray-600">2 unread messages</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button 
          variant="outline" 
          className="h-20 flex-col space-y-2"
          onClick={() => setActiveSection("appointments")}
        >
          <Calendar className="h-6 w-6 text-blue-600" />
          <span>My Appointments</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-20 flex-col space-y-2"
          onClick={() => setActiveSection("results")}
        >
          <FileText className="h-6 w-6 text-green-600" />
          <span>Test Results</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-20 flex-col space-y-2"
          onClick={() => setActiveSection("medications")}
        >
          <Pill className="h-6 w-6 text-orange-600" />
          <span>Medications</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-20 flex-col space-y-2"
          onClick={() => setActiveSection("messages")}
        >
          <MessageCircle className="h-6 w-6 text-purple-600" />
          <span>Messages</span>
        </Button>
      </div>

      {/* Health Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2 text-red-600" />
            Health Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Heart className="h-8 w-8 mx-auto text-red-500 mb-2" />
              <p className="text-2xl font-bold">72</p>
              <p className="text-sm text-gray-600">Heart Rate (bpm)</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Thermometer className="h-8 w-8 mx-auto text-blue-500 mb-2" />
              <p className="text-2xl font-bold">98.6°F</p>
              <p className="text-sm text-gray-600">Temperature</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Scale className="h-8 w-8 mx-auto text-green-500 mb-2" />
              <p className="text-2xl font-bold">165</p>
              <p className="text-sm text-gray-600">Weight (lbs)</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Stethoscope className="h-8 w-8 mx-auto text-purple-500 mb-2" />
              <p className="text-2xl font-bold">120/80</p>
              <p className="text-sm text-gray-600">Blood Pressure</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAppointments = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">My Appointments</h3>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Schedule New
        </Button>
      </div>
      
      {mockPatientData.appointments.map((appointment) => (
        <Card key={appointment.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold">{appointment.type}</h4>
                <p className="text-sm text-gray-600">Dr. {appointment.doctor}</p>
                <p className="text-sm text-gray-600">{appointment.department}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{appointment.date}</p>
                <p className="text-sm text-gray-600">{appointment.time}</p>
                <Badge variant="outline" className="mt-1">Confirmed</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderResults = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Test Results</h3>
      
      {mockPatientData.recentResults.map((result) => (
        <Card key={result.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold">{result.testName}</h4>
                <p className="text-sm text-gray-600">Completed on {result.date}</p>
              </div>
              <div className="text-right">
                <Badge 
                  variant={result.abnormalFlag === "normal" ? "default" : "destructive"}
                  className={result.abnormalFlag === "normal" ? "bg-green-100 text-green-800" : ""}
                >
                  {result.status}
                </Badge>
                <div className="mt-2">
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderMedications = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Current Medications</h3>
      
      {mockPatientData.medications.map((medication) => (
        <Card key={medication.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold">{medication.name}</h4>
                <p className="text-sm text-gray-600">{medication.dosage} - {medication.frequency}</p>
                <p className="text-sm text-gray-500">Prescribed by {medication.prescribedBy}</p>
              </div>
              <Badge variant="outline">Active</Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderMessages = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Messages</h3>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">Dr. Michael Smith</h4>
                  <p className="text-sm text-gray-600">Lab Results Available</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">2 hours ago</p>
                  <Badge className="bg-blue-100 text-blue-800">New</Badge>
                </div>
              </div>
              <p className="text-sm text-gray-700 mt-2">Your recent blood work results are now available. Overall results look good. Please schedule a follow-up appointment to discuss.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">Nurse Davis</h4>
                  <p className="text-sm text-gray-600">Appointment Reminder</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">1 day ago</p>
                  <Badge variant="outline">Read</Badge>
                </div>
              </div>
              <p className="text-sm text-gray-700 mt-2">Reminder: You have an appointment scheduled for February 5th at 10:30 AM with Dr. Smith. Please arrive 15 minutes early.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case "appointments":
        return renderAppointments();
      case "results":
        return renderResults();
      case "medications":
        return renderMedications();
      case "messages":
        return renderMessages();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img src={navimedLogo} alt="NaviMed" className="h-8 w-8 rounded-lg object-contain" />
              <div>
                <h1 className="text-lg font-bold text-blue-600">NAVIMED</h1>
                <p className="text-xs text-gray-500">Patient Portal</p>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex space-x-6">
              <button
                onClick={() => setActiveSection("overview")}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeSection === "overview" 
                    ? "bg-blue-100 text-blue-700" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveSection("appointments")}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeSection === "appointments" 
                    ? "bg-blue-100 text-blue-700" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Appointments
              </button>
              <button
                onClick={() => setActiveSection("results")}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeSection === "results" 
                    ? "bg-blue-100 text-blue-700" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Results
              </button>
              <button
                onClick={() => setActiveSection("medications")}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeSection === "medications" 
                    ? "bg-blue-100 text-blue-700" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Medications
              </button>
              <button
                onClick={() => setActiveSection("messages")}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeSection === "messages" 
                    ? "bg-blue-100 text-blue-700" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Messages
              </button>
            </nav>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium">{mockPatientData.name}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderSectionContent()}
      </main>
    </div>
  );
}