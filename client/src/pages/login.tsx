import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Building2 } from "lucide-react";
import navimedLogo from "@assets/JPG_1753663321927.jpg";
import { apiRequest } from "@/lib/queryClient";
import MfaVerify from "./mfa-verify";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [requiresMfa, setRequiresMfa] = useState(false);
  const [, setLocation] = useLocation();
  const { login, setAuthData } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Username and password are required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // First check if MFA is required with a direct API call
      const response = await apiRequest("/api/auth/login", {
        method: "POST",
        body: {
          username,
          password,
          tenantId: tenantId || undefined
        }
      });

      // Check if MFA is required
      if (response.requiresMfa) {
        setRequiresMfa(true);
        setIsLoading(false);
        return;
      }

      // Use the auth context login function for proper state management
      await login(username, password, tenantId, setLocation);
      
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaSuccess = (token: string, user: any) => {
    // Store auth token and user data in localStorage
    localStorage.setItem("auth_token", token);
    localStorage.setItem("auth_user", JSON.stringify(user));
    
    // Update auth context state
    setAuthData(token, user);
    
    console.log('MFA Login success - user role:', user.role);
    
    // Determine redirect path based on user role
    let redirectPath = '/dashboard';
    if (user.mustChangePassword || user.isTemporaryPassword) {
      redirectPath = '/change-password';
    } else if (user.role === 'patient') {
      redirectPath = '/patient-portal';
    } else if (user.role === 'super_admin') {
      redirectPath = '/super-admin-dashboard';
    } else if (user.role === 'tenant_admin' || user.role === 'director') {
      redirectPath = '/admin-dashboard';
    } else if (user.role === 'lab_technician') {
      redirectPath = '/laboratory-dashboard';
    } else if (user.role === 'pharmacist') {
      redirectPath = '/pharmacy-dashboard';
    } else if (user.role === 'receptionist') {
      redirectPath = '/receptionist-dashboard';
    }
    
    // Use React routing for navigation
    setLocation(redirectPath);
  };

  const handleMfaBack = () => {
    setRequiresMfa(false);
    setError("");
  };

  if (requiresMfa) {
    return (
      <MfaVerify
        username={username}
        password={password}
        tenantId={tenantId}
        onMfaSuccess={handleMfaSuccess}
        onBack={handleMfaBack}
      />
    );
  }

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
            Sign in to your healthcare organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="tenantId">
                <Building2 className="w-4 h-4 inline mr-2" />
                Organization Name
              </Label>
              <Input
                id="tenantId"
                type="text"
                placeholder="e.g., Metro General Hospital (leave blank for super admin)"
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                You can only access organizations you are authorized for
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username/Email</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username or email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Secure HIPAA-compliant healthcare platform</p>
            <p className="mt-1 text-xs">Protected by AES-256 encryption</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}