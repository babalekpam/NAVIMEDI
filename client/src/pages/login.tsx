import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Building2 } from "lucide-react";
import navimedLogo from "@assets/JPG_1753663321927.jpg";
import { apiRequest } from "@/lib/queryClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Clear any existing tokens first
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      
      // Get CSRF token first
      let csrfToken = null;
      try {
        const csrfResponse = await fetch("/api/csrf-token", { credentials: "include" });
        if (csrfResponse.ok) {
          const csrfData = await csrfResponse.json();
          csrfToken = csrfData.csrfToken;
        }
      } catch (csrfError) {
        console.warn("Could not fetch CSRF token:", csrfError);
      }
      
      const response = await apiRequest("/api/auth/login", {
        method: "POST",
        headers: csrfToken ? { "X-CSRF-Token": csrfToken } : {},
        body: {
          email,
          password,
          tenantId: tenantId || undefined
        }
      });

      // Store auth token and user data
      localStorage.setItem("auth_token", response.token);
      localStorage.setItem("auth_user", JSON.stringify(response.user));
      
      console.log('Login page - user role:', response.user.role);
      
      // Role-based redirection using client-side routing
      let redirectPath = '/dashboard';
      
      if (response.user.mustChangePassword || response.user.isTemporaryPassword) {
        redirectPath = '/change-password';
      } else if (response.user.role === 'patient') {
        redirectPath = '/patient-portal';
      } else if (response.user.role === 'super_admin') {
        console.log('Redirecting super admin to super-admin-dashboard');
        redirectPath = '/super-admin-dashboard';
      } else if (response.user.role === 'tenant_admin' || response.user.role === 'director') {
        // Check tenant type for tenant admins
        if (response.tenant && response.tenant.type === 'laboratory') {
          redirectPath = '/laboratory-dashboard';
        } else if (response.tenant && response.tenant.type === 'pharmacy') {
          redirectPath = '/pharmacy-dashboard';
        } else {
          redirectPath = '/admin-dashboard';
        }
      } else if (response.user.role === 'lab_technician') {
        redirectPath = '/laboratory-dashboard';
      } else if (response.user.role === 'pharmacist') {
        redirectPath = '/pharmacy-dashboard';
      } else if (response.user.role === 'receptionist') {
        redirectPath = '/receptionist-dashboard';
      }
      
      console.log('Login successful, setting redirect path:', redirectPath);
      
      // Store the redirect path for the Router to handle after auth context updates
      localStorage.setItem('post_login_redirect', redirectPath);
      
      // Trigger a storage event to notify auth context of changes
      window.dispatchEvent(new Event('storage'));
      
      // Let the Router component handle the redirect once auth context is ready
      // The Router will check for 'post_login_redirect' and redirect automatically
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

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
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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