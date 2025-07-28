import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Lock,
  User,
  Mail,
  Shield,
  ArrowLeft,
  Building2
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import navimedLogo from "@assets/JPG_1753663321927.jpg";

export default function PatientLogin() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // For patients, we don't need to specify tenant ID - it will be found automatically
      await login(formData.username, formData.password, "");
      // Redirect will be handled by auth context
    } catch (err: any) {
      setError(err.message || "Invalid username or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (username: string, password: string) => {
    setFormData({ username, password });
    // Auto-submit after setting form data
    setTimeout(() => {
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      document.getElementById('patient-login-form')?.dispatchEvent(submitEvent);
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img src={navimedLogo} alt="NaviMed" className="h-12 w-12 rounded-lg object-contain" />
            <div>
              <h1 className="text-2xl font-bold text-blue-600">NAVIMED</h1>
              <p className="text-sm text-gray-500">Patient Portal Access</p>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center justify-center">
              <Lock className="h-5 w-5 mr-2 text-blue-600" />
              Patient Login
            </CardTitle>
            <CardDescription>
              Access your health records and manage your care
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form id="patient-login-form" onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="username">
                  <User className="w-4 h-4 inline mr-2" />
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <Separator className="my-6" />

            {/* Test Accounts */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 text-center">Test Patient Accounts</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start text-sm"
                  onClick={() => handleQuickLogin("patient.sarah", "password")}
                >
                  <User className="h-4 w-4 mr-2" />
                  Sarah Johnson (patient.sarah)
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-sm"
                  onClick={() => handleQuickLogin("patient.michael", "password")}
                >
                  <User className="h-4 w-4 mr-2" />
                  Michael Davis (patient.michael)
                </Button>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Additional Options */}
            <div className="space-y-3">
              <div className="text-center text-sm space-y-2">
                <a href="#" className="text-blue-600 hover:underline block">
                  Forgot your password?
                </a>
                <a href="#" className="text-blue-600 hover:underline block">
                  Need help accessing your account?
                </a>
              </div>

              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => window.location.href = "/"}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Provider Login
              </Button>
            </div>

            {/* Security Notice */}
            <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-700">
                  <p className="font-medium">Your Privacy is Protected</p>
                  <p className="mt-1">
                    This portal uses bank-level encryption and is HIPAA-compliant to keep your health information secure.
                  </p>
                </div>
              </div>
            </div>

            {/* Support Information */}
            <div className="mt-4 text-center text-xs text-gray-500">
              <p>Need technical support?</p>
              <p>Call: (314) 472-3839 | Email: support@navimed.com</p>
              <p>Available: Monday - Friday, 8 AM - 6 PM</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}