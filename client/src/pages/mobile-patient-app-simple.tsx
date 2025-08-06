import { useState } from "react";
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

export default function MobilePatientAppSimple() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Mobile App Preview Interface */}
      <div className="max-w-sm mx-auto bg-white min-h-screen shadow-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src={navimedLogo} 
                alt="Carnet" 
                className="h-8 w-8 object-contain"
              />
              <div>
                <h1 className="text-lg font-bold">Carnet</h1>
                <p className="text-xs opacity-90">Private Health App</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-white hover:bg-opacity-20"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 space-y-4">
          {/* Welcome Card */}
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <Smartphone className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Mobile App Preview</h2>
                <p className="text-gray-600 text-sm mb-4">
                  This is a preview of the Carnet mobile app. Each patient gets their own secure, 
                  private access to their health information.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="font-medium text-sm">Health Records</p>
                <p className="text-xs text-gray-500">Private access</p>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <Pill className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="font-medium text-sm">Medications</p>
                <p className="text-xs text-gray-500">Track & remind</p>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <Calendar className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="font-medium text-sm">Appointments</p>
                <p className="text-xs text-gray-500">Book & manage</p>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <MessageCircle className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <p className="font-medium text-sm">Messages</p>
                <p className="text-xs text-gray-500">Secure chat</p>
              </CardContent>
            </Card>
          </div>

          {/* Sample Appointment Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Next Appointment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Dr. Sarah Johnson</p>
                  <p className="text-xs text-gray-600">Today at 2:00 PM</p>
                </div>
                <Badge variant="outline">Check-up</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Sample Medication Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Today's Medications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Lisinopril 10mg</p>
                    <p className="text-xs text-gray-600">Take with morning meal</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Metformin 500mg</p>
                    <p className="text-xs text-gray-600">Due at 6:00 PM</p>
                  </div>
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card className="border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <p className="font-medium text-sm text-gray-900">Privacy Protected</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Your health data is completely private and isolated. Only you and your 
                    authorized healthcare providers can access your information.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call-to-Action */}
          <Card className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
            <CardContent className="p-4 text-center">
              <h3 className="font-bold text-lg mb-2">Get the Carnet App</h3>
              <p className="text-sm opacity-90 mb-4">
                Download now for secure access to your health information
              </p>
              <div className="space-y-2">
                <Button 
                  className="w-full bg-white text-blue-600 hover:bg-gray-100"
                  onClick={() => window.location.href = "/patient-login"}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Access Your Health Records
                </Button>
                <p className="text-xs opacity-75">
                  Available on iOS App Store & Google Play
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t">
          <div className="flex justify-around py-2">
            <Button variant="ghost" size="sm" className="flex flex-col items-center p-2">
              <Home className="h-4 w-4 mb-1" />
              <span className="text-xs">Home</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex flex-col items-center p-2">
              <Activity className="h-4 w-4 mb-1" />
              <span className="text-xs">Health</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex flex-col items-center p-2">
              <Calendar className="h-4 w-4 mb-1" />
              <span className="text-xs">Schedule</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex flex-col items-center p-2">
              <MessageCircle className="h-4 w-4 mb-1" />
              <span className="text-xs">Messages</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex flex-col items-center p-2">
              <User className="h-4 w-4 mb-1" />
              <span className="text-xs">Profile</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}