import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, Smartphone, Key, Copy, CheckCircle, ArrowLeft, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import navimedLogo from "@assets/JPG_1753663321927.jpg";

interface MfaSetupData {
  qrCode: string;
  secret: string;
  backupCodes: string[];
}

export default function MfaSetup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [setupData, setSetupData] = useState<MfaSetupData | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState<Set<number>>(new Set());

  // Initialize MFA setup
  const initSetupMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/auth/mfa/setup", {
        method: "POST"
      });
    },
    onSuccess: (data) => {
      setSetupData(data);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Setup Failed",
        description: error.message || "Failed to initialize MFA setup"
      });
    }
  });

  // Verify MFA setup
  const verifySetupMutation = useMutation({
    mutationFn: async (code: string) => {
      return apiRequest("/api/auth/mfa/verify-setup", {
        method: "POST",
        body: { code }
      });
    },
    onSuccess: () => {
      toast({
        title: "MFA Enabled Successfully",
        description: "Multi-factor authentication is now enabled for your account"
      });
      setLocation("/profile-settings");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: error.message || "Invalid verification code"
      });
      setIsVerifying(false);
    }
  });

  useEffect(() => {
    if (!setupData) {
      initSetupMutation.mutate();
    }
  }, []);

  const handleVerifyCode = () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        variant: "destructive",
        title: "Invalid Code",
        description: "Please enter a 6-digit verification code"
      });
      return;
    }
    
    setIsVerifying(true);
    verifySetupMutation.mutate(verificationCode);
  };

  const copyBackupCode = async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodes(prev => new Set(prev).add(index));
      toast({
        title: "Copied!",
        description: "Backup code copied to clipboard"
      });
      
      // Clear the "copied" state after 2 seconds
      setTimeout(() => {
        setCopiedCodes(prev => {
          const newSet = new Set(prev);
          newSet.delete(index);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: "Could not copy to clipboard"
      });
    }
  };

  const copyAllBackupCodes = async () => {
    if (!setupData?.backupCodes) return;
    
    try {
      const allCodes = setupData.backupCodes.join('\n');
      await navigator.clipboard.writeText(allCodes);
      toast({
        title: "All Codes Copied!",
        description: "All backup codes copied to clipboard"
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: "Could not copy to clipboard"
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <img src={navimedLogo} alt="NaviMed" className="h-12 w-12 rounded-lg object-contain" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Setup Multi-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your healthcare account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-2 mb-6">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setLocation("/profile-settings")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Settings
            </Button>
          </div>

          {initSetupMutation.isPending && (
            <div className="flex items-center justify-center py-12">
              <Shield className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          )}

          {setupData && (
            <>
              {/* Step 1: Scan QR Code */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-800">1</Badge>
                  <h3 className="text-lg font-semibold">Install Authenticator App</h3>
                </div>
                <Alert>
                  <Smartphone className="h-4 w-4" />
                  <AlertDescription>
                    Download an authenticator app like <strong>Google Authenticator</strong>, 
                    <strong> Authy</strong>, or <strong>Microsoft Authenticator</strong> on your phone.
                  </AlertDescription>
                </Alert>
              </div>

              <Separator />

              {/* Step 2: Scan QR Code */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-800">2</Badge>
                  <h3 className="text-lg font-semibold">Scan QR Code</h3>
                </div>
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 bg-white border-2 border-dashed border-gray-300 rounded-lg">
                    {setupData.qrCode ? (
                      <img 
                        src={setupData.qrCode} 
                        alt="MFA QR Code" 
                        className="w-48 h-48"
                      />
                    ) : (
                      <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-500">Loading QR Code...</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 text-center max-w-md">
                    Open your authenticator app and scan this QR code to add your NaviMED account.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Step 3: Verify */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-800">3</Badge>
                  <h3 className="text-lg font-semibold">Verify Setup</h3>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="verification-code">
                    Enter the 6-digit code from your authenticator app:
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="verification-code"
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setVerificationCode(value);
                      }}
                      className="font-mono text-center text-lg tracking-widest"
                      maxLength={6}
                    />
                    <Button
                      onClick={handleVerifyCode}
                      disabled={isVerifying || verificationCode.length !== 6}
                      className="min-w-[100px]"
                    >
                      {isVerifying ? "Verifying..." : "Verify"}
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Step 4: Backup Codes */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-yellow-100 text-yellow-800">4</Badge>
                  <h3 className="text-lg font-semibold">Save Backup Codes</h3>
                </div>
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <strong>Important:</strong> Save these backup codes in a secure location. 
                    You can use them to access your account if you lose your phone.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Backup Codes</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyAllBackupCodes}
                      className="flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copy All
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {setupData.backupCodes.map((code, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded font-mono text-sm border"
                      >
                        <span>{code}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyBackupCode(code, index)}
                          className="h-8 w-8 p-0"
                        >
                          {copiedCodes.has(index) ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  Once you verify the code above, multi-factor authentication will be enabled for your account.
                  You'll need both your password and a code from your authenticator app to sign in.
                </AlertDescription>
              </Alert>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}