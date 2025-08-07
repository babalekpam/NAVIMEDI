import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, ArrowLeft, Smartphone, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import navimedLogo from "@assets/JPG_1753663321927.jpg";

interface MfaVerifyProps {
  username: string;
  password: string;
  tenantId: string;
  onMfaSuccess: (token: string, user: any) => void;
  onBack: () => void;
}

export default function MfaVerify({ username, password, tenantId, onMfaSuccess, onBack }: MfaVerifyProps) {
  const { toast } = useToast();
  const [mfaCode, setMfaCode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);

  const verifyMfaMutation = useMutation({
    mutationFn: async (code: string) => {
      return apiRequest("/api/auth/mfa/verify", {
        method: "POST",
        body: {
          username,
          password,
          tenantId: tenantId || undefined,
          mfaCode: code,
          isBackupCode: useBackupCode
        }
      });
    },
    onSuccess: (response) => {
      toast({
        title: "Login Successful",
        description: "Welcome back to NaviMED"
      });
      onMfaSuccess(response.token, response.user);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: error.message || "Invalid authentication code"
      });
      setMfaCode("");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mfaCode.trim()) {
      toast({
        variant: "destructive",
        title: "Code Required",
        description: "Please enter your authentication code"
      });
      return;
    }

    if (!useBackupCode && mfaCode.length !== 6) {
      toast({
        variant: "destructive",
        title: "Invalid Code Length",
        description: "Authentication codes must be 6 digits"
      });
      return;
    }

    verifyMfaMutation.mutate(mfaCode);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <img src={navimedLogo} alt="NaviMed" className="h-12 w-12 rounded-lg object-contain" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Enter your authentication code to complete sign in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Button 
                type="button"
                variant="ghost" 
                size="sm"
                onClick={onBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Button>
            </div>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Signing in to <strong>{tenantId || 'NaviMED Platform'}</strong> as <strong>{username}</strong>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="mfa-code">
                {useBackupCode ? (
                  <>
                    <Key className="w-4 h-4 inline mr-2" />
                    Backup Code
                  </>
                ) : (
                  <>
                    <Smartphone className="w-4 h-4 inline mr-2" />
                    Authenticator Code
                  </>
                )}
              </Label>
              <Input
                id="mfa-code"
                type="text"
                placeholder={useBackupCode ? "Enter backup code" : "000000"}
                value={mfaCode}
                onChange={(e) => {
                  if (useBackupCode) {
                    // Allow alphanumeric for backup codes
                    setMfaCode(e.target.value.toUpperCase());
                  } else {
                    // Only allow digits for regular codes
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setMfaCode(value);
                  }
                }}
                className={`${!useBackupCode ? 'font-mono text-center text-lg tracking-widest' : ''}`}
                maxLength={useBackupCode ? 10 : 6}
                required
                autoComplete="one-time-code"
              />
              {!useBackupCode && (
                <p className="text-xs text-gray-500">
                  Open your authenticator app and enter the 6-digit code
                </p>
              )}
            </div>

            <Button 
              type="submit"
              className="w-full"
              disabled={verifyMfaMutation.isPending || !mfaCode.trim()}
            >
              {verifyMfaMutation.isPending ? "Verifying..." : "Verify & Sign In"}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={() => {
                  setUseBackupCode(!useBackupCode);
                  setMfaCode("");
                }}
                className="text-sm text-blue-600"
              >
                {useBackupCode 
                  ? "Use authenticator app instead" 
                  : "Use backup code instead"
                }
              </Button>
            </div>
          </form>

          {useBackupCode && (
            <Alert className="mt-4">
              <Key className="h-4 w-4" />
              <AlertDescription>
                <strong>Using Backup Code:</strong> Each backup code can only be used once. 
                After using this code, make sure to generate new backup codes from your profile settings.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}