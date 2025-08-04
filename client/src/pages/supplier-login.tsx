import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Eye, EyeOff, Building2, ShieldCheck, Users } from 'lucide-react';

export default function SupplierLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: '',
    username: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Clear any existing authentication state first
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userType');
      
      // Login using organization-specific supplier login endpoint
      const response = await apiRequest('/api/supplier/login', {
        method: 'POST',
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          organizationName: formData.organizationName
        })
      });

      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('userType', 'supplier');
        localStorage.setItem('organizationName', formData.organizationName);
        
        toast({
          title: "Login Successful",
          description: `Welcome back to ${formData.organizationName}!`,
        });
        
        // Force redirect to supplier dashboard
        window.location.href = '/supplier-dashboard';
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials or organization name.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="bg-blue-600 p-3 rounded-full">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Supplier Portal</h1>
          <p className="text-gray-600">Access your medical supplier dashboard</p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Sign In to Your Account</CardTitle>
            <CardDescription>
              Enter your organization name and credentials to access your supplier dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="organizationName">Organization Name</Label>
                <Input
                  id="organizationName"
                  type="text"
                  placeholder="e.g., MedTech Solutions Inc."
                  value={formData.organizationName}
                  onChange={(e) => handleInputChange('organizationName', e.target.value)}
                  required
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  Enter your registered company name exactly as submitted
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t">
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Don't have a supplier account?
                </p>
                <Button
                  variant="outline"
                  onClick={() => setLocation('/supplier-register')}
                  className="w-full"
                >
                  Register Your Organization
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Features */}
        <div className="bg-white rounded-lg p-4 border">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            Secure Access Features
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Organization-based authentication
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Encrypted data transmission
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Role-based access control
            </div>
          </div>
        </div>

        {/* Help Information */}
        <Alert>
          <Users className="h-4 w-4" />
          <AlertDescription>
            <strong>Need Help?</strong> Contact our support team if you're having trouble accessing your supplier account or need assistance with registration.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}