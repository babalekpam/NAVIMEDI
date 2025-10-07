import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
  Navigation,
  Lock,
  User
} from "lucide-react";
import navimedLogo from "@assets/JPG_1753663321927.jpg";

export default function PatientPortalPublic() {
  const [loginForm, setLoginForm] = useState({
    patientId: "",
    dateOfBirth: "",
    zipCode: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!loginForm.patientId || !loginForm.dateOfBirth || !loginForm.zipCode) {
      setError("All fields are required");
      setIsLoading(false);
      return;
    }

    try {
      // In a real app, this would authenticate against the patient database
      // For now, we'll redirect to the authenticated patient portal
      window.location.href = "/patient-portal";
    } catch (err) {
      setError("Invalid credentials. Please check your information and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <img src={navimedLogo} alt="NaviMed" className="h-8 w-8 rounded-lg object-contain" />
              <div>
                <h1 className="text-lg font-semibold text-blue-600">NAVIMED Patient Portal</h1>
                <p className="text-sm text-gray-500">Access your health information securely</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => window.location.href = "/"}>
                <Building2 className="h-4 w-4 mr-2" />
                Provider Login
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Login Section */}
          <div className="flex flex-col justify-center">
            <Card className="w-full max-w-md mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center">
                  <Lock className="h-6 w-6 mr-2 text-blue-600" />
                  Patient Login
                </CardTitle>
                <CardDescription>
                  Sign in to access your health records and care information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="patientId">
                      <User className="w-4 h-4 inline mr-2" />
                      Patient ID / MRN
                    </Label>
                    <Input
                      id="patientId"
                      type="text"
                      placeholder="Enter your Patient ID or MRN"
                      value={loginForm.patientId}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, patientId: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={loginForm.dateOfBirth}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      type="text"
                      placeholder="Enter your ZIP code"
                      value={loginForm.zipCode}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, zipCode: e.target.value }))}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing In..." : "Sign In to Portal"}
                  </Button>

                  <div className="text-center text-sm">
                    <a href="#" className="text-blue-600 hover:underline">
                      Forgot your Patient ID?
                    </a>
                    <span className="mx-2">|</span>
                    <a href="#" className="text-blue-600 hover:underline">
                      Need Help?
                    </a>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Features Section */}
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Your Health, At Your Fingertips
              </h2>
              <p className="text-lg text-gray-600">
                Access your complete health information, communicate with your care team, 
                and manage your healthcare journey all in one secure place.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Video className="h-5 w-5 mr-2 text-blue-600" />
                    Virtual Visits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Connect with your healthcare providers through secure video visits from the comfort of your home.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Calendar className="h-5 w-5 mr-2 text-green-600" />
                    Easy Scheduling
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Schedule appointments, view upcoming visits, and manage your healthcare calendar online.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <FileText className="h-5 w-5 mr-2 text-purple-600" />
                    Medical Records
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Access your complete medical history, test results, and treatment plans anytime.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <MessageCircle className="h-5 w-5 mr-2 text-orange-600" />
                    Secure Messaging
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Communicate directly with your care team through secure, encrypted messaging.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-red-500">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Pill className="h-5 w-5 mr-2 text-red-600" />
                    Prescription Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    View current medications, request refills, and track prescription history.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-indigo-500">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Activity className="h-5 w-5 mr-2 text-indigo-600" />
                    Health Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Monitor your vital signs, track health goals, and stay on top of preventive care.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Security Notice */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Lock className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900">Your Privacy is Protected</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    This portal is HIPAA-compliant and uses bank-level encryption to keep your health information secure. 
                    Your data is never shared without your explicit consent.
                  </p>
                </div>
              </div>
            </div>

            {/* Support Information */}
            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Need Technical Support?</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>Call: (314) 472-3839</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>Email: support@navimedi.org</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Available: Monday - Friday, 8 AM - 6 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}