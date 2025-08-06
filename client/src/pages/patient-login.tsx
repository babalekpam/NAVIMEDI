import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Heart, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import navimedLogo from "@assets/carnet_1754492017427.png";

export default function PatientLogin() {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
    carnetPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showCarnetPassword, setShowCarnetPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Patient-specific login with additional Carnet security
      const response = await fetch('/api/auth/patient-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          carnetPassword: credentials.carnetPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store patient authentication
      localStorage.setItem('carnet_token', data.token);
      localStorage.setItem('patient_id', data.patient.id);
      localStorage.setItem('hospital_id', data.patient.primaryHospitalId);

      toast({
        title: "Welcome to your Carnet",
        description: `Access granted for ${data.patient.firstName} ${data.patient.lastName}`,
      });

      // Redirect to patient's private Carnet app
      window.location.href = '/mobile-app';

    } catch (error) {
      toast({
        title: "Access Denied",
        description: error instanceof Error ? error.message : "Invalid credentials for Carnet access",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <img 
              src={navimedLogo} 
              alt="Carnet" 
              className="h-12 w-12 object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Carnet</h1>
              <p className="text-sm text-gray-600">Your Private Health App</p>
            </div>
          </div>
          <div className="flex items-center justify-center space-x-2 bg-blue-50 p-3 rounded-lg">
            <Shield className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-blue-800 font-medium">Private & Secure Patient Access</span>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Patient Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={credentials.email}
                onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Account Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Your account password"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="carnetPassword">Carnet Security Code</Label>
              <div className="relative">
                <Input
                  id="carnetPassword"
                  type={showCarnetPassword ? "text" : "password"}
                  placeholder="Your private Carnet code"
                  value={credentials.carnetPassword}
                  onChange={(e) => setCredentials(prev => ({ ...prev, carnetPassword: e.target.value }))}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowCarnetPassword(!showCarnetPassword)}
                >
                  {showCarnetPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Additional security for your private health data
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Privacy Notice</p>
                  <p className="mt-1">Your Carnet app contains private health information linked to your chosen hospital and doctors. Access is strictly controlled and monitored.</p>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Verifying Access...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4" />
                  <span>Access My Carnet</span>
                </div>
              )}
            </Button>

            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                Don't have a Carnet account?{' '}
                <Button variant="link" className="p-0 h-auto font-medium text-blue-600">
                  Contact your hospital
                </Button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}