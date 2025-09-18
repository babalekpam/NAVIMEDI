import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from "lucide-react";
import navimedLogo from "@assets/JPG_1753663321927.jpg";
import { apiRequest } from "@/lib/queryClient";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [, setLocation] = useLocation();

  // Extract token from URL query params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError("Invalid or missing reset token. Please request a new password reset link.");
    }
  }, []);

  // Password validation helpers
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    let feedback = [];

    if (password.length >= 12) strength++;
    else feedback.push("At least 12 characters");

    if (/[A-Z]/.test(password)) strength++;
    else feedback.push("One uppercase letter");

    if (/[a-z]/.test(password)) strength++;
    else feedback.push("One lowercase letter");

    if (/\d/.test(password)) strength++;
    else feedback.push("One number");

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    else feedback.push("One special character");

    return { strength, feedback };
  };

  const passwordStrength = getPasswordStrength(newPassword);
  const isPasswordValid = passwordStrength.strength === 5;
  const doPasswordsMatch = newPassword === confirmPassword && confirmPassword !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError("Invalid reset token. Please request a new password reset link.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (!isPasswordValid) {
      setError("Please ensure your password meets all security requirements");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await apiRequest("/api/auth/reset-password", {
        method: "POST",
        body: {
          token,
          newPassword
        }
      });

      setIsSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        setLocation("/login");
      }, 3000);

    } catch (err: any) {
      setError(err.message || "Failed to reset password. The link may have expired or been used already.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
            <CardContent className="text-center pt-8 pb-8">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Password Reset Successful
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Your password has been successfully updated. You can now log in with your new password.
              </p>
              <div className="space-y-3">
                <Link href="/login">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" data-testid="button-login">
                    Continue to Login
                  </Button>
                </Link>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Redirecting automatically in 3 seconds...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
              Create New Password
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Please enter a strong password for your account
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="reset-password-form">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-gray-700 dark:text-gray-300 font-medium">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 pr-10 h-11"
                    disabled={isLoading}
                    data-testid="input-new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                {/* Password strength indicator */}
                {newPassword && (
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full ${
                            level <= passwordStrength.strength
                              ? level <= 2 ? 'bg-red-500' : level <= 4 ? 'bg-yellow-500' : 'bg-green-500'
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                    {passwordStrength.feedback.length > 0 && (
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        <p className="font-medium">Password must include:</p>
                        <ul className="list-disc list-inside space-y-1 mt-1">
                          {passwordStrength.feedback.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300 font-medium">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 h-11"
                    disabled={isLoading}
                    data-testid="input-confirm-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    data-testid="button-toggle-confirm-password"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                {confirmPassword && (
                  <div className={`text-xs ${doPasswordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                    {doPasswordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </div>
                )}
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950" data-testid="error-message">
                  <AlertDescription className="text-red-700 dark:text-red-300">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                <Shield className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700 dark:text-blue-300">
                  <strong>Security Notice:</strong> After resetting your password, you'll be logged out of all devices for security.
                </AlertDescription>
              </Alert>

              <Button 
                type="submit" 
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                disabled={isLoading || !isPasswordValid || !doPasswordsMatch || !token}
                data-testid="button-submit"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Updating Password...
                  </div>
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>

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