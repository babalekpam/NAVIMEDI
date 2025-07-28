import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar,
  MessageCircle,
  FileText,
  Pill,
  Activity,
  User,
  Video,
  Clock,
  Shield,
  Bell,
  Settings,
  Phone,
  Mail,
  LogOut,
  ChevronRight,
  Heart,
  Thermometer,
  Scale,
  Stethoscope,
  BookOpen,
  Search,
  Plus
} from "lucide-react";
import navimedLogo from "@assets/JPG_1753663321927.jpg";

export default function PatientPortal() {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState("overview");

  if (!user || user.role !== "patient") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">You need to be logged in as a patient to access this portal.</p>
            <Button onClick={() => window.location.href = "/patient-login"}>
              Go to Patient Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const menuItems = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "find-care", label: "Find Care", icon: Search },
    { id: "visits", label: "My Visits", icon: Video },
    { id: "records", label: "My Records", icon: FileText },
    { id: "messages", label: "Messages", icon: MessageCircle },
    { id: "results", label: "Test Results", icon: FileText },
    { id: "medications", label: "Medications", icon: Pill },
    { id: "health", label: "Track Health", icon: Heart },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-2">Welcome back, {user.firstName}!</h2>
        <p className="text-blue-100">Stay on top of your health with your personal dashboard</p>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => setActiveSection("visits")}
            >
              <Video className="h-6 w-6 mb-2" />
              <span className="text-sm">Book Video Visit</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => setActiveSection("find-care")}
            >
              <Calendar className="h-6 w-6 mb-2" />
              <span className="text-sm">Schedule Appointment</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => setActiveSection("messages")}
            >
              <MessageCircle className="h-6 w-6 mb-2" />
              <span className="text-sm">Message Provider</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => setActiveSection("results")}
            >
              <FileText className="h-6 w-6 mb-2" />
              <span className="text-sm">View Results</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Health Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Health Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Heart className="h-4 w-4 text-red-500 mr-2" />
                <span className="text-sm">Blood Pressure</span>
              </div>
              <span className="font-medium">120/80 mmHg</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Thermometer className="h-4 w-4 text-blue-500 mr-2" />
                <span className="text-sm">Temperature</span>
              </div>
              <span className="font-medium">98.6°F</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Scale className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm">Weight</span>
              </div>
              <span className="font-medium">165 lbs</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium">Dr. Smith - Annual Checkup</p>
                  <p className="text-sm text-gray-600">March 15, 2024 at 2:00 PM</p>
                </div>
                <Badge>Confirmed</Badge>
              </div>
              <Button variant="outline" className="w-full" onClick={() => setActiveSection("visits")}>
                Schedule New Appointment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border-l-4 border-blue-500 bg-blue-50">
              <div className="flex items-center">
                <FileText className="h-4 w-4 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium">Lab Results Available</p>
                  <p className="text-sm text-gray-600">Blood work from March 10, 2024</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => setActiveSection("results")}>
                View
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 border-l-4 border-green-500 bg-green-50">
              <div className="flex items-center">
                <Pill className="h-4 w-4 text-green-600 mr-3" />
                <div>
                  <p className="font-medium">Prescription Renewed</p>
                  <p className="text-sm text-gray-600">Lisinopril 10mg refill ready</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => setActiveSection("medications")}>
                View
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderFindCare = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Find Care</h2>
        <p className="text-gray-600">Find healthcare providers and services near you</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <Video className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="font-bold mb-2">Video Visits</h3>
            <p className="text-sm text-gray-600 mb-4">Connect with providers from home</p>
            <Button className="w-full" onClick={() => window.location.href = "/telemedicine-booking"}>
              Book Video Visit
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <Stethoscope className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="font-bold mb-2">In-Person Care</h3>
            <p className="text-sm text-gray-600 mb-4">Schedule office visits</p>
            <Button className="w-full" variant="outline">
              Find Providers
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <Phone className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="font-bold mb-2">Urgent Care</h3>
            <p className="text-sm text-gray-600 mb-4">Get care when you need it</p>
            <Button className="w-full" variant="outline">
              Find Urgent Care
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return renderOverview();
      case "find-care":
        return renderFindCare();
      case "visits":
        return (
          <div className="text-center py-12">
            <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Video Visits</h3>
            <p className="text-gray-600 mb-4">Schedule and manage your video consultations</p>
            <Button onClick={() => window.location.href = "/telemedicine-booking"}>
              Book New Video Visit
            </Button>
          </div>
        );
      case "records":
        return (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Medical Records</h3>
            <p className="text-gray-600">View your complete medical history and documents</p>
          </div>
        );
      case "messages":
        return (
          <div className="text-center py-12">
            <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Messages</h3>
            <p className="text-gray-600">Secure messaging with your healthcare team</p>
          </div>
        );
      case "results":
        return (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Test Results</h3>
            <p className="text-gray-600">View your lab results and diagnostic reports</p>
          </div>
        );
      case "medications":
        return (
          <div className="text-center py-12">
            <Pill className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Medications</h3>
            <p className="text-gray-600">Manage your prescriptions and medication history</p>
          </div>
        );
      case "health":
        return (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Track Health</h3>
            <p className="text-gray-600">Monitor your health metrics and wellness goals</p>
          </div>
        );
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
              <img src={navimedLogo} alt="NaviMed" className="h-8 w-8 rounded object-contain" />
              <div>
                <h1 className="text-lg font-bold text-blue-600">NAVIMED</h1>
                <p className="text-xs text-gray-500">Patient Portal</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Bell className="h-5 w-5 text-gray-400" />
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium">{user.firstName} {user.lastName}</span>
              </div>
              <Button size="sm" variant="outline" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Navigation</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                          activeSection === item.id ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700" : "text-gray-700"
                        }`}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        <span className="font-medium">{item.label}</span>
                        <ChevronRight className="h-4 w-4 ml-auto" />
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>

            {/* Support Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-sm">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-blue-600" />
                  <span>(314) 472-3839</span>
                </div>
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-blue-600" />
                  <span>support@navimed.com</span>
                </div>
                <p className="text-xs text-gray-500">
                  Available Mon-Fri, 8 AM - 6 PM
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  );
}