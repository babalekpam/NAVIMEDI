import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, ArrowLeft, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function RegisterOrganization() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: "",
    organizationType: "",
    adminFirstName: "",
    adminLastName: "",
    adminEmail: "",
    adminPassword: "",
    confirmPassword: "",
    phoneNumber: "",
    address: "",
    description: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.organizationName.trim()) {
      newErrors.organizationName = "Organization name is required";
    }
    if (!formData.organizationType) {
      newErrors.organizationType = "Organization type is required";
    }
    if (!formData.adminFirstName.trim()) {
      newErrors.adminFirstName = "First name is required";
    }
    if (!formData.adminLastName.trim()) {
      newErrors.adminLastName = "Last name is required";
    }
    if (!formData.adminEmail.trim()) {
      newErrors.adminEmail = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.adminEmail)) {
      newErrors.adminEmail = "Please enter a valid email address";
    }
    if (!formData.adminPassword) {
      newErrors.adminPassword = "Password is required";
    } else if (formData.adminPassword.length < 6) {
      newErrors.adminPassword = "Password must be at least 6 characters";
    }
    if (formData.adminPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
      newErrors.phoneNumber = "Phone number must be exactly 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch("/api/register-organization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          organizationName: formData.organizationName,
          organizationType: formData.organizationType,
          adminFirstName: formData.adminFirstName,
          adminLastName: formData.adminLastName,
          adminEmail: formData.adminEmail,
          adminPassword: formData.adminPassword,
          phoneNumber: formData.phoneNumber || null,
          address: formData.address || null,
          description: formData.description || null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to register organization");
      }

      setIsSuccess(true);
      toast({
        title: "Organization Registered!",
        description: "Your organization has been successfully registered. You can now sign in with your admin credentials.",
      });

    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "An error occurred during registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="text-center p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your organization <strong>{formData.organizationName}</strong> has been successfully registered.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              You can now sign in with your admin credentials:<br/>
              <strong>Email:</strong> {formData.adminEmail}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/login" className="flex-1">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                  Sign In Now
                </Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full">
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-emerald-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Register Your Organization</h1>
          </div>
          <p className="text-gray-600">
            Join NAVIMED and start managing your healthcare operations today
          </p>
        </div>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Organization Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="organizationName">Organization Name *</Label>
                  <Input
                    id="organizationName"
                    placeholder="Enter organization name"
                    value={formData.organizationName}
                    onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                    className={errors.organizationName ? "border-red-500" : ""}
                  />
                  {errors.organizationName && (
                    <p className="text-sm text-red-600">{errors.organizationName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organizationType">Organization Type *</Label>
                  <Select value={formData.organizationType} onValueChange={(value) => setFormData({ ...formData, organizationType: value })}>
                    <SelectTrigger className={errors.organizationType ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hospital">Hospital</SelectItem>
                      <SelectItem value="clinic">Clinic</SelectItem>
                      <SelectItem value="pharmacy">Pharmacy</SelectItem>
                      <SelectItem value="laboratory">Laboratory</SelectItem>
                      <SelectItem value="insurance_provider">Insurance Provider</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.organizationType && (
                    <p className="text-sm text-red-600">{errors.organizationType}</p>
                  )}
                </div>
              </div>

              {/* Admin User Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Administrator Account</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminFirstName">First Name *</Label>
                    <Input
                      id="adminFirstName"
                      placeholder="Enter first name"
                      value={formData.adminFirstName}
                      onChange={(e) => setFormData({ ...formData, adminFirstName: e.target.value })}
                      className={errors.adminFirstName ? "border-red-500" : ""}
                    />
                    {errors.adminFirstName && (
                      <p className="text-sm text-red-600">{errors.adminFirstName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminLastName">Last Name *</Label>
                    <Input
                      id="adminLastName"
                      placeholder="Enter last name"
                      value={formData.adminLastName}
                      onChange={(e) => setFormData({ ...formData, adminLastName: e.target.value })}
                      className={errors.adminLastName ? "border-red-500" : ""}
                    />
                    {errors.adminLastName && (
                      <p className="text-sm text-red-600">{errors.adminLastName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Email Address *</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      placeholder="admin@yourorganization.com"
                      value={formData.adminEmail}
                      onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                      className={errors.adminEmail ? "border-red-500" : ""}
                    />
                    {errors.adminEmail && (
                      <p className="text-sm text-red-600">{errors.adminEmail}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      placeholder="1234567890"
                      maxLength={10}
                      value={formData.phoneNumber}
                      onChange={(e) => {
                        // Only allow digits and limit to 10 characters
                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setFormData({ ...formData, phoneNumber: value });
                      }}
                      className={errors.phoneNumber ? "border-red-500" : ""}
                    />
                    {errors.phoneNumber && (
                      <p className="text-sm text-red-600">{errors.phoneNumber}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminPassword">Password *</Label>
                    <Input
                      id="adminPassword"
                      type="password"
                      placeholder="Enter password"
                      value={formData.adminPassword}
                      onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                      className={errors.adminPassword ? "border-red-500" : ""}
                    />
                    {errors.adminPassword && (
                      <p className="text-sm text-red-600">{errors.adminPassword}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className={errors.confirmPassword ? "border-red-500" : ""}
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Optional Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Additional Information (Optional)</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      placeholder="Enter organization address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of your organization"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <Button 
                  type="submit" 
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Registering..." : "Register Organization"}
                </Button>
                
                <p className="text-sm text-gray-600 text-center mt-4">
                  Already have an account?{" "}
                  <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}