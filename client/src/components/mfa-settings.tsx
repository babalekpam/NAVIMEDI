import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Shield, ShieldCheck, ShieldX, Key, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface MfaStatus {
  mfaEnabled: boolean;
  lastSetupAt: string | null;
  hasBackupCodes: boolean;
}

export default function MfaSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isDisableOpen, setIsDisableOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");

  const { data: mfaStatus, isLoading } = useQuery<MfaStatus>({
    queryKey: ["/api/auth/mfa/status"]
  });

  const enableMfaMutation = useMutation({
    mutationFn: () => {
      // Redirect to MFA setup page
      window.location.href = "/mfa-setup";
      return Promise.resolve();
    }
  });

  const disableMfaMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/auth/mfa/disable", {
        method: "POST",
        body: { currentPassword }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/mfa/status"] });
      setIsDisableOpen(false);
      setCurrentPassword("");
      toast({
        title: "MFA Disabled",
        description: "Multi-factor authentication has been disabled for your account."
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to Disable MFA",
        description: error.message
      });
    }
  });

  const handleDisableMfa = () => {
    if (!currentPassword.trim()) {
      toast({
        variant: "destructive",
        title: "Password Required",
        description: "Please enter your current password to disable MFA."
      });
      return;
    }
    disableMfaMutation.mutate();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Shield className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Multi-Factor Authentication (MFA)
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account with multi-factor authentication
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            {mfaStatus?.mfaEnabled ? (
              <ShieldCheck className="h-8 w-8 text-green-500" />
            ) : (
              <ShieldX className="h-8 w-8 text-gray-400" />
            )}
            <div>
              <h3 className="font-medium">
                MFA is {mfaStatus?.mfaEnabled ? "Enabled" : "Disabled"}
              </h3>
              {mfaStatus?.mfaEnabled && mfaStatus?.lastSetupAt && (
                <p className="text-sm text-gray-500">
                  Configured on {new Date(mfaStatus.lastSetupAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          
          {mfaStatus?.mfaEnabled ? (
            <Dialog open={isDisableOpen} onOpenChange={setIsDisableOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  Disable MFA
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Disable Multi-Factor Authentication
                  </DialogTitle>
                  <DialogDescription>
                    This will remove the extra security layer from your account. 
                    You'll only need your username and password to sign in.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Warning:</strong> Disabling MFA reduces your account security.
                    </AlertDescription>
                  </Alert>
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      placeholder="Enter your current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsDisableOpen(false);
                        setCurrentPassword("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDisableMfa}
                      disabled={disableMfaMutation.isPending}
                    >
                      {disableMfaMutation.isPending ? "Disabling..." : "Disable MFA"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <Button
              onClick={() => enableMfaMutation.mutate()}
              disabled={enableMfaMutation.isPending}
            >
              Enable MFA
            </Button>
          )}
        </div>

        {mfaStatus?.mfaEnabled && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">Authenticator App</p>
                  <p className="text-sm text-green-600 dark:text-green-400">Configured</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <Key className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-200">Backup Codes</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    {mfaStatus?.hasBackupCodes ? "Available" : "None generated"}
                  </p>
                </div>
              </div>
            </div>
            
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Your account is protected with multi-factor authentication. 
                You'll need both your password and a code from your authenticator app to sign in.
              </AlertDescription>
            </Alert>
          </>
        )}

        {!mfaStatus?.mfaEnabled && (
          <Alert>
            <AlertDescription>
              <strong>Recommended:</strong> Enable MFA to add an extra layer of security to your account.
              This helps protect your healthcare data even if your password is compromised.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}