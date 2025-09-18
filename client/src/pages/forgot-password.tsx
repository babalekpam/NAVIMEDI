import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Mail, ArrowLeft, Building2 } from "lucide-react";
import navimedLogo from "@assets/JPG_1753663321927.jpg";
import { apiRequest } from "@/lib/queryClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Email address is required");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await apiRequest("/api/auth/forgot-password", {
        method: "POST",
        body: {
          email: email.toLowerCase().trim(),
          tenantId: tenantId || undefined
        }
      });

      setMessage(response.message || "If an account with that email exists, a password reset link has been sent.");
      setIsSubmitted(true);
    } catch (err: any) {
      // The API always returns 200 for security, but handle any network errors
      setMessage("If an account with that email exists, a password reset link has been sent.");
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <img 
                src={navimedLogo} 
                alt="NaviMED Logo" 
                className="h-16 w-16 rounded-lg object-cover shadow-lg"
              />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              Reset Password
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Enter your email address to receive a password reset link
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4" data-testid="forgot-password-form">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11"
                      disabled={isLoading}
                      required
                      data-testid="input-email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organization" className="text-gray-700 dark:text-gray-300 font-medium">
                    Organization (Optional)
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                    <Select value={tenantId} onValueChange={setTenantId} disabled={isLoading}>
                      <SelectTrigger className="pl-10 h-11" data-testid="select-organization">
                        <SelectValue placeholder="Select your organization (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No specific organization</SelectItem>
                        <SelectItem value="argilette-health">Argilette Health</SelectItem>
                        <SelectItem value="cityview-medical">CityView Medical Center</SelectItem>
                        <SelectItem value="riverside-clinic">Riverside Clinic</SelectItem>
                        <SelectItem value="northstar-hospital">NorthStar Hospital</SelectItem>
                        <SelectItem value="greenfield-pharmacy">Greenfield Pharmacy</SelectItem>
                        <SelectItem value="metro-labs">Metro Labs</SelectItem>
                        <SelectItem value="wellness-center">Wellness Center</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Select your organization if you're not a super admin
                  </p>
                </div>

                {error && (
                  <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950" data-testid="error-message">
                    <AlertDescription className="text-red-700 dark:text-red-300">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  disabled={isLoading}
                  data-testid="button-submit"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Sending Reset Link...
                    </div>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-4" data-testid="success-message">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Reset Link Sent
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {message}
                  </p>
                </div>
                
                <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950 text-left">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-700 dark:text-blue-300">
                    <strong>Security Notice:</strong> The reset link will expire in 30 minutes and can only be used once.
                  </AlertDescription>
                </Alert>

                <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                  <p>Didn't receive the email?</p>
                  <ul className="text-xs space-y-1">
                    <li>• Check your spam/junk folder</li>
                    <li>• Verify the email address is correct</li>
                    <li>• Wait a few minutes for delivery</li>
                  </ul>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link href="/login">
                <Button 
                  variant="ghost" 
                  className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950"
                  data-testid="link-back-to-login"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
              
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                Don't have an account?{" "}
                <Link href="/register-organization" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                  Contact Support
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
          <p>© 2025 NaviMED by ARGILETTE Lab. All rights reserved.</p>
          <p className="mt-1">Secure healthcare platform with enterprise-grade security</p>
        </div>
      </div>
    </div>
  );
}