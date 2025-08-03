import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Building2 } from "lucide-react";
import navimedLogo from "@assets/JPG_1753663321927.jpg";

export default function Login() {
  useEffect(() => {
    // Automatically redirect to Replit Auth login
    const timer = setTimeout(() => {
      window.location.href = '/api/login';
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <img src={navimedLogo} alt="NaviMed" className="h-12 w-12 rounded-lg object-contain" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">NAVIMED</CardTitle>
          <CardDescription>
            Multi-Tenant EHR/EMR Platform
            <br />
            Redirecting to secure login...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="text-gray-600">Redirecting to Replit secure authentication...</p>
            <Button onClick={() => window.location.href = '/api/login'} className="w-full">
              Continue to Login
            </Button>
            <div className="mt-6 text-center text-sm text-gray-600">
              <p>Secure HIPAA-compliant healthcare platform</p>
              <p className="mt-1 text-xs">Protected by AES-256 encryption</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}